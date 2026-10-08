"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {HEADER}=require("../lib/aob-write-planner");
const {createWriter}=require("../lib/aob-safe-writer");
const row=name=>{const r=Array(25).fill("");r[0]=name;return r};
const seed=()=>[HEADER,row("Richard Bressman"),row("Robert Schiller")];
function fixture({corrupt=false}={}){
 let rows=seed(),locked=false;
 const lock={async runExclusive(fn){assert.equal(locked,false);locked=true;try{return await fn()}finally{locked=false}}};
 const adapter={
  async read(){return structuredClone(rows)},
  async insert(sheetRow,record){
    const r=Array(25).fill("");for(const [k,v] of Object.entries(record))r[HEADER.indexOf(k)]=v;
    rows.splice(sheetRow-4,0,r);
    if(corrupt)rows[2][0]="CORRUPTED";
  },
  async update(sheetRow,changes){for(const [k,v] of Object.entries(changes))rows[sheetRow-4][HEADER.indexOf(k)]=v}
 };
 return {adapter,lock,rows:()=>rows};
}
test("rejects missing shared lock",()=>assert.throws(()=>createWriter(fixture().adapter,null),/Shared lock/));
test("inserts new matter and preserves existing clients",async()=>{
 const f=fixture();const result=await createWriter(f.adapter,f.lock).create({Matter:"New Client",Stage:"Lead"});
 assert.equal(result.verified,true);assert.deepEqual(f.rows().slice(1).map(r=>r[0]),["Richard Bressman","Robert Schiller","New Client"]);
});
test("rejects duplicate without writing",async()=>{
 const f=fixture();await assert.rejects(createWriter(f.adapter,f.lock).create({Matter:"Robert Schiller"}),/duplicate/);
 assert.equal(f.rows().length,3);
});
test("updates only intended field",async()=>{
 const f=fixture();await createWriter(f.adapter,f.lock).update("Robert Schiller",{Stage:"Contacted"});
 assert.equal(f.rows()[2][2],"Contacted");assert.equal(f.rows()[1][0],"Richard Bressman");
});
test("detects unexpected modification",async()=>{
 const f=fixture({corrupt:true});await assert.rejects(createWriter(f.adapter,f.lock).create({Matter:"New Client"}),/Existing matter|Matter count/);
});
test("rejects unexpected schema",async()=>{
 const f=fixture();f.rows()[0][0]="Wrong";await assert.rejects(createWriter(f.adapter,f.lock).create({Matter:"New Client"}),/schema/);
});
