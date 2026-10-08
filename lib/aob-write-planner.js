"use strict";

/**
 * Pure AOB write planner. Does not access Google Sheets or confer write authority.
 * Consumers MUST re-read sheet state and enforce concurrency before executing.
 */
const HEADER = ["Matter","Type","Stage","Owner","Area","Current State","Next Action","Waiting On","Follow-up Date","Attention","Strategic Note","Lead Source","Last Updated","Job Folder","Phone","Email","Job Address","Client Context","Schedule State","Queue Position","Occupied Days Forecast","Earliest Start","Latest Start","Flexibility","Schedule Constraint"];
const norm = value => String(value ?? "").trim().toLowerCase().replace(/\s+/g," ");
function inspect(rows) {
  if (!Array.isArray(rows) || !rows.length) throw new Error("Board rows unavailable");
  if (HEADER.some((name,i)=>rows[0][i]!==name)) throw new Error("Board schema mismatch");
  const entries=rows.slice(1).map((values,i)=>({row:i+5,values,name:norm(values[0]),email:norm(values[15]),phone:norm(values[14])})).filter(e=>e.name);
  return entries;
}
function planCreate(rows, record) {
  const entries=inspect(rows);
  if (!record || !norm(record.Matter)) throw new Error("Matter required");
  const name=norm(record.Matter), email=norm(record.Email), phone=norm(record.Phone);
  const matches=entries.filter(e=>e.name===name || (email && e.email===email) || (phone && e.phone===phone));
  if(matches.length) throw new Error("Potential duplicate matter: review required");
  for(const field of Object.keys(record)) if(!HEADER.includes(field)) throw new Error("Unknown column: "+field);
  const occupied=new Set(entries.map(e=>e.row));
  // Insert after the last occupied row; never write into an occupied record.
  const insertAt=Math.max(5,...occupied)+1;
  return Object.freeze({kind:"insert",insertAt,record:{...record},expectedMatters:entries.map(e=>({row:e.row,name:e.name})),requiresFreshRead:true,requiresExclusiveWriter:true});
}
function planUpdate(rows, identity, changes) {
  const entries=inspect(rows), key=norm(identity);
  const matches=entries.filter(e=>e.name===key);
  if(matches.length!==1) throw new Error("Identity not uniquely resolved");
  if(!changes || !Object.keys(changes).length) throw new Error("No changes");
  for(const field of Object.keys(changes)) if(!HEADER.includes(field)) throw new Error("Unknown column: "+field);
  if("Matter" in changes && norm(changes.Matter)!==key) throw new Error("Identity rename requires explicit migration");
  return Object.freeze({kind:"update",row:matches[0].row,changes:{...changes},expectedRow:[...matches[0].values],requiresFreshRead:true,requiresExclusiveWriter:true});
}
module.exports={HEADER,inspect,planCreate,planUpdate};
