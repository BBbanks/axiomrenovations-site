module.exports=async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  const checks={
    dashboardPassword:Boolean(process.env.AXIOM_DASHBOARD_PASSWORD),
    sessionSecret:Boolean(process.env.AXIOM_SESSION_SECRET),
    googleEmail:Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
    googlePrivateKey:Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
    boardId:Boolean(process.env.AXIOM_OPERATING_BOARD_SPREADSHEET_ID)
  };
  const ready=Object.values(checks).every(Boolean);
  res.setHeader("Cache-Control","private, no-store");
  return res.status(ready?200:503).json({ready,checks});
};