const crypto=require("crypto");

function b64url(input){return Buffer.from(input).toString("base64url")}
async function accessToken(){
  const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key=(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY||"").replace(/\\n/g,"\n");
  if(!email||!key) throw new Error("Google service-account credentials are not configured");
  const now=Math.floor(Date.now()/1000);
  const header=b64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const claim=b64url(JSON.stringify({
    iss:email,
    scope:"https://www.googleapis.com/auth/spreadsheets.readonly",
    aud:"https://oauth2.googleapis.com/token",
    iat:now,
    exp:now+3600
  }));
  const unsigned=header+"."+claim;
  const signer=crypto.createSign("RSA-SHA256"); signer.update(unsigned); signer.end();
  const assertion=unsigned+"."+signer.sign(key).toString("base64url");
  const body=new URLSearchParams({grant_type:"urn:ietf:params:oauth2:grant-type:jwt-bearer",assertion});
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  if(!r.ok) throw new Error("Google token exchange failed");
  const data=await r.json(); return data.access_token;
}
async function getBoardRows(){
  const spreadsheetId=process.env.AXIOM_OPERATING_BOARD_SPREADSHEET_ID;
  if(!spreadsheetId) throw new Error("Operating Board spreadsheet id is not configured");
  const token=await accessToken();
  const range=encodeURIComponent("'Operating Board'!A4:R200");
  const url=`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?majorDimension=ROWS`;
  const r=await fetch(url,{headers:{authorization:`Bearer ${token}`}});
  if(!r.ok) throw new Error("Google Sheets read failed");
  const data=await r.json(); return data.values||[];
}
module.exports={getBoardRows};