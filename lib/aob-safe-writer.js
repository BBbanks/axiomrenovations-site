"use strict";
const {HEADER,planCreate,planUpdate,inspect}=require("./aob-write-planner");
const assert=require("node:assert/strict");
const clone=x=>JSON.parse(JSON.stringify(x));
const norm=x=>String(x??"").trim().toLowerCase();

/**
 * Board writer requires a SHARED exclusive lock, not a process-local mutex.
 * Adapter contract:
 *  read(): Promise<rows> (header is index 0, first data row sheet row 5)
 *  insert(rowNumber, record): Promise<void> (insertDimension, preserving existing rows)
 *  update(rowNumber, changes): Promise<void> (minimal-cell writes)
 *  lock.runExclusive(fn): Promise<result> (shared across ALL writers)
 * No HTTP endpoint is exposed until these guarantees are implemented.
 */
function createWriter(adapter,lock){
  if(!adapter || !["read","insert","update"].every(k=>typeof adapter[k]==="function")) throw new Error("Board adapter incomplete");
  if(!lock || typeof lock.runExclusive!=="function") throw new Error("Shared lock required");
  async function transaction(kind,identity,payload){
    return lock.runExclusive(async()=>{
      const before=clone(await adapter.read());
      const plan=kind==="create"?planCreate(before,payload):planUpdate(before,identity,payload);
      // Guard against a changed board between planning and mutation.
      const immediate=clone(await adapter.read());
      assert.deepEqual(immediate,before,"Board changed before write");
      if(kind==="create") await adapter.insert(plan.insertAt,plan.record);
      else await adapter.update(plan.row,plan.changes);
      const after=clone(await adapter.read());
      const previous=inspect(before),current=inspect(after);
      if(kind==="create"){
        assert.equal(current.length,previous.length+1,"Matter count mismatch");
        for(const e of previous){
          const matches=current.filter(c=>c.name===e.name && JSON.stringify(c.values)===JSON.stringify(e.values));
          assert.equal(matches.length,1,"Existing matter changed: "+e.name);
        }
        const matches=current.filter(c=>c.name===norm(payload.Matter));
        assert.equal(matches.length,1,"New matter missing or duplicated");
        for(const [field,value] of Object.entries(payload)){
          assert.equal(String(matches[0].values[HEADER.indexOf(field)]??""),String(value),"New field mismatch: "+field);
        }
      }else{
        assert.equal(current.length,previous.length,"Matter count mismatch");
        for(const e of previous){
          const next=current.find(c=>c.name===e.name);
          assert.ok(next,"Existing matter missing: "+e.name);
          const expected=[...e.values];
          if(e.row===plan.row) for(const [field,value] of Object.entries(payload)) expected[HEADER.indexOf(field)]=value;
          assert.deepEqual(next.values,expected,"Unexpected field modification: "+e.name);
        }
      }
      return {verified:true,kind,matter:kind==="create"?payload.Matter:identity};
    });
  }
  return {create:record=>transaction("create",null,record),update:(identity,changes)=>transaction("update",identity,changes)};
}
module.exports={createWriter};
