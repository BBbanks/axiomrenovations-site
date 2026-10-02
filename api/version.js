module.exports=async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  res.setHeader("Cache-Control","private, no-store");
  return res.status(200).json({
    commit:process.env.VERCEL_GIT_COMMIT_SHA||"",
    environment:process.env.VERCEL_ENV||"",
    branch:process.env.VERCEL_GIT_COMMIT_REF||""
  });
};