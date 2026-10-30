const API_URL="/api/operating-board";
let matters=[];

const q=s=>document.querySelector(s);
const status=q("#statusMessage"),ownerFilter=q("#ownerFilter");

async function loadBoard(){
  status.textContent="Loading operating state…";
  try{
    const res=await fetch(API_URL,{credentials:"same-origin",headers:{"Accept":"application/json"}});
    if(res.status===401){location.href="login.html";return}
    if(!res.ok) throw new Error("API unavailable");
    const payload=await res.json();
    matters=Array.isArray(payload)?payload:payload.matters;
    if(!Array.isArray(matters)) throw new Error("Invalid board response");
    status.textContent="";
  }catch(err){
    matters=[];
    status.textContent="Live operating data is temporarily unavailable.";
  }
  render();
}
function visibleMatters(){
  const owner=ownerFilter.value;
  return matters.filter(m=>owner==="all"||String(m.owner||"").includes(owner));
}
function isJob(m){
  const type=String(m.type||"").toLowerCase();
  const stage=String(m.stage||"").toLowerCase();
  return type==="job"||/\b(sold|scheduled|active|in progress|under contract)\b/.test(stage);
}
function isThumbtackPlaceholder(m){
  const name=String(m.name||"").trim().toLowerCase();
  return /thumbtack/.test(name);
}
function renderGroup(id,items){
  const target=q(id);target.replaceChildren();
  if(!items.length){const empty=document.createElement("p");empty.className="status";empty.textContent="No matters in this section.";target.append(empty);}
  items.forEach(m=>target.append(makeCard(m)));
}
function render(){
  const list=visibleMatters().filter(m=>!isThumbtackPlaceholder(m));
  const jobs=list.filter(isJob);
  const leads=list.filter(m=>!isJob(m));
  renderGroup("#jobsCards",jobs);
  renderGroup("#leadsCards",leads);
  q("#jobsSectionCount").textContent=jobs.length;
  q("#leadsSectionCount").textContent=leads.length;
  q("#attentionCount").textContent=list.filter(m=>["high","medium"].includes(m.attention)).length;
  q("#leadCount").textContent=leads.filter(m=>m.type==="lead").length;
  q("#estimateCount").textContent=leads.filter(m=>m.type==="estimate").length;
  q("#jobCount").textContent=jobs.length;
}
function makeCard(m){
  const b=document.createElement("button");b.type="button";b.className="card";
  b.innerHTML=`<div class="card-head"><div><strong>${esc(m.name)}</strong><div class="meta">${esc(m.area||"")}</div></div><span class="badge">${esc(labelType(m.type))}</span></div><div class="stage">${esc(m.stage||"")}</div><div class="state">${esc(m.currentState||"")}</div><div class="card-foot"><span>${esc(m.owner||"")}</span><span class="attention-${esc(m.attention||"low")}">${esc(attentionLabel(m.attention))}</span></div>`;
  b.addEventListener("click",()=>showDetail(m));return b;
}
function showDetail(m){
  q("#detailType").textContent=labelType(m.type);
  q("#detailName").textContent=m.name||"";
  q("#detailStage").textContent=m.stage||"";
  q("#detailOwner").textContent=m.owner||"";
  q("#detailState").textContent=m.currentState||"";
  q("#detailNext").textContent=m.nextAction||"";
  q("#detailWaiting").textContent=m.waitingOn||"Nothing";
  q("#detailStrategy").textContent=m.strategicNote||"";
  const link=q("#folderLink");link.href=m.jobFolder||"#";
  q("#detailDialog").showModal();
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function labelType(t){return ({lead:"Lead",estimate:"Estimate",job:"Job"}[t]||"Matter")}
function attentionLabel(a){return a==="high"?"High attention":a==="medium"?"Active":"Routine"}

ownerFilter.addEventListener("change",render);
q("#refreshBtn").addEventListener("click",loadBoard);
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
loadBoard();