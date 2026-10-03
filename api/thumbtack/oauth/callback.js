module.exports=async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});

  res.setHeader("Cache-Control","private, no-store");
  res.setHeader("X-Content-Type-Options","nosniff");

  const {code,error,error_description:description}=req.query||{};

  if(error){
    return res.status(400).json({
      provider:"thumbtack",
      connected:false,
      error:"Authorization was not completed",
      detail:String(description||error)
    });
  }

  if(!code){
    return res.status(200).json({
      provider:"thumbtack",
      callbackReady:true,
      tokenExchangeEnabled:false,
      message:"Thumbtack OAuth callback endpoint is available. Token exchange will be enabled after partner credentials are issued."
    });
  }

  if(!process.env.THUMBTACK_CLIENT_ID||!process.env.THUMBTACK_CLIENT_SECRET){
    return res.status(503).json({
      provider:"thumbtack",
      connected:false,
      error:"Thumbtack OAuth credentials are not configured yet"
    });
  }

  return res.status(501).json({
    provider:"thumbtack",
    connected:false,
    error:"Thumbtack token exchange is not enabled yet"
  });
};
