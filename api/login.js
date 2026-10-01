const crypto = require("crypto");
const {setSessionCookie}=require("./_auth");

function safeEqual(a,b){
  const ab=Buffer.from(String(a||"")), bb=Buffer.from(String(b||""));
  if(ab.length!==bb.length) return false;
  return crypto.timingSafeEqual(ab,bb);
}
module.exports=async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const expected=process.env.AXIOM_DASHBOARD_PASSWORD;
  if(!expected) return res.status(503).json({error:"Dashboard password is not configured"});
  const password=req.body&&req.body.password;
  if(!safeEqual(password,expected)) return res.status(401).json({error:"Invalid password"});
  setSessionCookie(res);
  return res.status(204).end();
};