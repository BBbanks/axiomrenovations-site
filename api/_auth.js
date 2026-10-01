const crypto = require("crypto");

const COOKIE_NAME = "axiom_session";

function parseCookies(header=""){
  return Object.fromEntries(header.split(";").map(v=>v.trim()).filter(Boolean).map(pair=>{
    const i=pair.indexOf("="); return i===-1?[pair,""]:[pair.slice(0,i),decodeURIComponent(pair.slice(i+1))];
  }));
}
function sign(value){
  const secret=process.env.AXIOM_SESSION_SECRET;
  if(!secret) throw new Error("AXIOM_SESSION_SECRET is not configured");
  return crypto.createHmac("sha256",secret).update(value).digest("hex");
}
function makeToken(){
  const payload=Buffer.from(JSON.stringify({v:1,exp:Date.now()+1000*60*60*24*14})).toString("base64url");
  return payload+"."+sign(payload);
}
function verifyToken(token){
  if(!token||!token.includes(".")) return false;
  const [payload,sig]=token.split(".");
  const expected=sign(payload);
  const a=Buffer.from(sig), b=Buffer.from(expected);
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b)) return false;
  try{
    const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
    return data.v===1 && Number(data.exp)>Date.now();
  }catch{return false;}
}
function isAuthorized(req){
  const cookies=parseCookies(req.headers.cookie||"");
  return verifyToken(cookies[COOKIE_NAME]);
}
function setSessionCookie(res){
  const token=makeToken();
  res.setHeader("Set-Cookie",`${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60*60*24*14}`);
}
function clearSessionCookie(res){
  res.setHeader("Set-Cookie",`${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}
module.exports={isAuthorized,setSessionCookie,clearSessionCookie};