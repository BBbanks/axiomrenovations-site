const {isAuthorized}=require("./_auth");
const {getBoardRows,getLeadSourceRows,getBusinessPriorityRows}=require("./_google");

module.exports=async function handler(req,res){
  if(req.method!=="GET") return res.status(405).json({error:"Method not allowed"});
  if(!isAuthorized(req)) return res.status(401).json({error:"Authentication required"});
  try{
    const [rows,sourceRows,priorityRows]=await Promise.all([getBoardRows(),getLeadSourceRows(),getBusinessPriorityRows()]);
    if(rows.length<1) return res.status(200).json({matters:[],leadSources:[],businessPriorities:[]});
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
      followUpDate:cell(r,"Follow-up Date"),
      attention:cell(r,"Attention").toLowerCase()||"low",
      strategicNote:cell(r,"Strategic Note"),
      leadSource:cell(r,"Lead Source"),
      lastUpdated:cell(r,"Last Updated"),
      jobFolder:cell(r,"Job Folder"),
      phone:cell(r,"Phone"),
      email:cell(r,"Email"),
      jobAddress:cell(r,"Job Address"),
      clientContext:cell(r,"Client Context"),
      scheduleState:cell(r,"Schedule State"),
      queuePosition:cell(r,"Queue Position"),
      occupiedDaysForecast:cell(r,"Occupied Days Forecast"),
      earliestStart:cell(r,"Earliest Start"),
      latestStart:cell(r,"Latest Start"),
      flexibility:cell(r,"Flexibility"),
      scheduleConstraint:cell(r,"Schedule Constraint")
    }));
    const sourceHeaders=(sourceRows[0]||[]).map(String);
    const sourcePos=Object.fromEntries(sourceHeaders.map((h,i)=>[h,i]));
    const sourceCell=(row,name)=>String(row[sourcePos[name]]??"").trim();
    const leadSources=sourceRows.slice(1).filter(r=>sourceCell(r,"Source")).map(r=>({
      source:sourceCell(r,"Source"),
      status:sourceCell(r,"Status"),
      scheduledReactivation:sourceCell(r,"Scheduled Reactivation"),
      note:sourceCell(r,"Evidence / Note"),
      lastVerified:sourceCell(r,"Last Verified"),
      serviceArea:sourceCell(r,"Service Area")
    }));
    const priorityHeaders=(priorityRows[0]||[]).map(String);
    const priorityPos=Object.fromEntries(priorityHeaders.map((h,i)=>[h,i]));
    const priorityCell=(row,name)=>String(row[priorityPos[name]]??"").trim();
    const businessPriorities=priorityRows.slice(1).filter(r=>priorityCell(r,"Priority / Goal")).map((r,i)=>({
      id:"priority-"+(i+2),
      name:priorityCell(r,"Priority / Goal"),
      horizon:priorityCell(r,"Horizon"),
      focus:priorityCell(r,"Focus"),
      currentState:priorityCell(r,"Current State"),
      nextAction:priorityCell(r,"Next Action"),
      targetDate:priorityCell(r,"Target Date"),
      lastUpdated:priorityCell(r,"Last Updated")
    }));
    res.setHeader("Cache-Control","private, no-store");
    return res.status(200).json({matters,leadSources,businessPriorities});
  }catch(err){
    return res.status(503).json({error:"Operating Board is not available"});
  }
};
