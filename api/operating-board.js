const {isAuthorized}=require("./_auth");
const {getBoardRows}=require("./_google");

module.exports=async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  if(!isAuthorized(req)) return res.status(401).json({error:"Authentication required"});
  try{
    const rows=await getBoardRows();
    if(rows.length<1) return res.status(200).json({matters:[]});
    const headers=rows[0].map(String);
    const pos=Object.fromEntries(headers.map((h,i)=>[h,i]));
    const cell=(row,name)=>String(row[pos[name]]??"").trim();
    const matters=rows.slice(1).filter(r=>cell(r,"Matter")).map((r,i)=>({
      id:"row-"+(i+5),
      name:cell(r,"Matter"),
      type:cell(r,"Type").toLowerCase(),
      stage:cell(r,"Stage"),
      owner:cell(r,"Owner"),
      area:cell(r,"Area"),
      currentState:cell(r,"Current State"),
      nextAction:cell(r,"Next Action"),
      waitingOn:cell(r,"Waiting On"),
      attention:cell(r,"Attention").toLowerCase()||"low",
      strategicNote:cell(r,"Strategic Note"),
      jobFolder:cell(r,"Job Folder")
    }));
    res.setHeader("Cache-Control","private, no-store");
    return res.status(200).json({matters});
  }catch(err){
    return res.status(503).json({error:"Operating Board is not available"});
  }
};