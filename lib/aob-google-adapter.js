"use strict";
/**
 * Google Sheets adapter for the lock-required AOB writer.
 * Requires a dedicated service account with spreadsheets scope.
 * Never wire this to an endpoint without a shared, cross-instance lock.
 */
const crypto=require("node:crypto");
const SPREADSHEET_ID=process.env.AOB_WRITER_SPREADSHEET_ID;
const SHEET_ID=Number(process.env.AOB_WRITER_SHEET_ID);
if(!SPREADSHEET_ID || !Number.isSafeInteger(SHEET_ID) || SHEET_ID<0) throw new Error("Explicit test spreadsheet and tab configuration required");
if(SPREADSHEET_ID==="11b1T26MyocRUD6pBsoHejs4zTYP2N0crUK2rq6zh03M" && process.env.AOB_ALLOW_PRODUCTION_WRITES!=="YES_EXPLICITLY") throw new Error("Production AOB writes disabled");
const {HEADER}=require("./aob-write-planner");
const base="https://sheets.googleapis.com/v4/spreadsheets/";
function b64(s){return Buffer.from(s).toString("base64url")}
async function token(){
 const email=process.env.AOB_WRITER_SERVICE_ACCOUNT_EMAIL;
 const key=(process.env.AOB_WRITER_SERVICE_ACCOUNT_PRIVATE_KEY||"").replace(/\\n/g,"\n");
 if(!email||!key) throw new Error("Dedicated writer credentials not configured");
 const now=Math.floor(Date.now()/1000);
 const h=b64(JSON.stringify({alg:"RS256",typ:"JWT"}));
 const p=b64(JSON.stringify({iss:email,scope:"https://www.googleapis.com/auth/spreadsheets",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600}));
 const sig=crypto.sign("RSA-SHA256",Buffer.from(h+"."+p),key).toString("base64url");
 const body=new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:h+"."+p+"."+sig});
 const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
 if(!response.ok) throw new Error("Writer token exchange failed");
 return (await response.json()).access_token;
}
async function request(path,method="GET",body){
 const authorization="Bearer "+await token();
 const response=await fetch(base+SPREADSHEET_ID+path,{method,headers:{authorization,"content-type":"application/json"},body:body?JSON.stringify(body):undefined});
 if(!response.ok) throw new Error("Sheets "+method+" failed ("+response.status+")");
 return response.json();
}
function makeAdapter(){
 return {
  async read(){
   const data=await request("/values/"+encodeURIComponent("'Operating Board'!A4:Y"));
   return (data.values||[]).map(r=>HEADER.map((_,i)=>String(r[i]??"")));
  },
  async insert(rowNumber,record){
   // Atomic structural insertion and content write in one Sheets batchUpdate.
   const zeroIndex=rowNumber-1;
   const values=HEADER.map(k=>({userEnteredValue:{stringValue:String(record[k]??"")}}));
   await request(":batchUpdate","POST",{requests:[
    {insertDimension:{range:{sheetId:SHEET_ID,dimension:"ROWS",startIndex:zeroIndex,endIndex:zeroIndex+1},inheritFromBefore:true}},
    {updateCells:{start:{sheetId:SHEET_ID,rowIndex:zeroIndex,columnIndex:0},rows:[{values}],fields:"userEnteredValue"}}
   ]});
  },
  async update(rowNumber,changes){
   // One batch API request, with only changed fields.
   const data=Object.entries(changes).map(([key,value])=>{
    const index=HEADER.indexOf(key);if(index<0) throw new Error("Unknown field");
    const col=String.fromCharCode(65+index);
    return {range:"'Operating Board'!"+col+rowNumber,values:[[String(value??"")]]};
   });
   await request("/values:batchUpdate","POST",{valueInputOption:"RAW",data});
  }
 };
}
module.exports={makeAdapter};
