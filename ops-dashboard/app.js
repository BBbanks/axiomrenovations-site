const API_URL="/api/operating-board";
let matters=[],activeFilter="attention";

const q=s=>document.querySelector(s);
const cards=q("#cards"),status=q("#statusMessage"),ownerFilter=q("#ownerFilter");

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
function filtered(){
  const owner=ownerFilter.value;
  return matters.filter(m=>{
    const typeOk=activeFilter==="all"||activeFilter==="attention"||m.type===activeFilter;
    const attentionOk=activeFilter!=="attention"||["high","medium"].includes(m.attention);
    const ownerOk=owner==="all"||String(m.owner||"").includes(owner);
    return typeOk&&attentionOk&&ownerOk;
  });
}
function render(){
  const list=filtered();
  cards.replaceChildren();
  if(!list.length){
    const empty=document.createElement("p");empty.className="status";empty.textContent="No matters match this view.";cards.append(empty);
  }
  for(const m of list) cards.append(makeCard(m));
  q("#attentionCount").textContent=matters.filter(m=>["high","medium"].includes(m.attention)).length;
  q("#leadCount").textContent=matters.filter(m=>m.type==="lead").length;
  q("#estimateCount").textContent=matters.filter(m=>m.type==="estimate").length;
  q("#jobCount").textContent=matters.filter(m=>m.type==="job").length;
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

q("#filters").addEventListener("click",e=>{
  const btn=e.target.closest("[data-filter]");if(!btn)return;
  activeFilter=btn.dataset.filter;
  document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active",x===btn));
  render();
});
ownerFilter.addEventListener("change",render);
q("#refreshBtn").addEventListener("click",loadBoard);
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
loadBoard();