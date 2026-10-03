const API_URL="/api/operating-board";
const VERSION_URL="/api/version";
let matters=[],leadSources=[],activeFilter="attention",activeOwner="all";

const q=s=>document.querySelector(s);
const cards=q("#cards"),status=q("#statusMessage");

async function loadVersion(){
  const el=q("#buildVersion");
  try{
    const res=await fetch(VERSION_URL,{cache:"no-store",headers:{"Accept":"application/json"}});
    if(!res.ok) throw new Error("Version unavailable");
    const v=await res.json();
    const sha=String(v.commit||"unknown").slice(0,7);
    el.textContent=`Build ${sha} · ${v.environment||"unknown"} · ✦`;
    el.title="Built with ChatGPT";
  }catch{
    el.textContent="Build unavailable · ✦";
    el.title="Built with ChatGPT";
  }
}

async function loadBoard(){
  status.textContent="Loading operating state…";
  try{
    const res=await fetch(API_URL,{credentials:"same-origin",cache:"no-store",headers:{"Accept":"application/json"}});
    if(res.status===401){location.href="login.html";return}
    if(!res.ok) throw new Error("API unavailable");
    const payload=await res.json();
    matters=Array.isArray(payload)?payload:payload.matters;
    leadSources=Array.isArray(payload)?[]:(Array.isArray(payload.leadSources)?payload.leadSources:[]);
    if(!Array.isArray(matters)) throw new Error("Invalid board response");
    status.textContent="";
  }catch(err){
    matters=[];
    leadSources=[];
    status.textContent="Live operating data is temporarily unavailable.";
  }
  render();
}
function queueNumber(v){
  const n=Number(v);
  return Number.isFinite(n)&&n>0?n:Number.POSITIVE_INFINITY;
}
function filtered(){
  const list=matters.filter(m=>{
    const typeOk=activeFilter==="all"||activeFilter==="attention"||activeFilter==="schedule"||m.type===activeFilter;
    const attentionOk=activeFilter!=="attention"||["high","medium"].includes(m.attention);
    const scheduleOk=activeFilter!=="schedule"||(m.scheduleState&&m.scheduleState.toLowerCase()!=="complete");
    const ownerOk=activeOwner==="all"||String(m.owner||"").includes(activeOwner);
    return typeOk&&attentionOk&&scheduleOk&&ownerOk;
  });
  if(activeFilter==="schedule"){
    list.sort((a,b)=>queueNumber(a.queuePosition)-queueNumber(b.queuePosition)||String(a.name).localeCompare(String(b.name)));
  }
  return list;
}
function render(){
  renderLeadSources();
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
function renderLeadSources(){
  const host=q("#leadSources");
  if(!host) return;
  host.replaceChildren();
  if(!leadSources.length){
    const empty=document.createElement("div");
    empty.className="lead-source-empty";
    empty.textContent="Lead channel status is not yet recorded.";
    host.append(empty);
    return;
  }
  for(const item of leadSources){
    const card=document.createElement("article");
    card.className="lead-source-card";
    const state=String(item.status||"Unknown").trim();
    const stateClass=/^active$/i.test(state)?"active":/^paused$/i.test(state)?"paused":"unknown";
    const activation=item.scheduledReactivation?`<div class="lead-reactivation"><span>Reactivates</span><strong>${esc(item.scheduledReactivation)}</strong></div>`:"";
    const serviceArea=item.serviceArea?`<div class="lead-reactivation"><span>Service area</span><strong>${esc(item.serviceArea)}</strong></div>`:"";
    const verified=item.lastVerified?`<div class="lead-verified">Verified ${esc(item.lastVerified)}</div>`:"";
    card.innerHTML=`<div class="lead-source-top"><strong>${esc(item.source||"Lead source")}</strong><span class="lead-state lead-state-${stateClass}">${esc(state)}</span></div>${activation}${serviceArea}${verified}`;
    if(item.note) card.title=item.note;
    host.append(card);
  }
}
function sourceLabel(source){
  const s=String(source||"").trim();
  if(!s) return "";
  if(/^thumbtack$/i.test(s)) return "Thumbtack";
  if(/^networx$/i.test(s)) return "Networx";
  if(/axiom|existing client|previous client/i.test(s)) return "Axiom";
  return s;
}
function schedulePreview(m){
  if(!m.scheduleState&&!m.queuePosition&&!m.occupiedDaysForecast) return "";
  const parts=[];
  if(m.queuePosition) parts.push(`Queue #${esc(m.queuePosition)}`);
  if(m.scheduleState) parts.push(esc(m.scheduleState));
  if(m.occupiedDaysForecast) parts.push(`${esc(m.occupiedDaysForecast)} occupied days`);
  return `<div class="schedule-preview">${parts.join(" · ")}</div>`;
}
function makeCard(m){
  const b=document.createElement("button");b.type="button";b.className="card";
  const contact=[m.phone,m.jobAddress].filter(Boolean).join(" · ");
  const source=sourceLabel(m.leadSource);
  b.innerHTML=`<div class="card-head"><div><strong>${esc(m.name)}</strong><div class="meta">${esc(m.area||"")}</div></div><span class="badge">${esc(labelType(m.type))}</span></div>${source?`<div class="source-badge source-${esc(source.toLowerCase())}">${esc(source)}</div>`:""}${contact?`<div class="contact-preview">${esc(contact)}</div>`:""}${activeFilter==="schedule"?schedulePreview(m):""}<div class="stage">${esc(m.stage||"")}</div><div class="state">${esc(m.currentState||"")}</div><div class="card-foot"><span>${esc(m.owner||"")}</span><span class="attention-${esc(m.attention||"low")}">${esc(attentionLabel(m.attention))}</span></div>`;
  b.addEventListener("click",()=>showDetail(m));return b;
}
function shown(v,fallback="Not yet recorded"){return String(v||"").trim()||fallback}
function showDetail(m){
  q("#detailType").textContent=labelType(m.type);
  q("#detailName").textContent=m.name||"";
  q("#detailPhone").textContent=shown(m.phone);
  q("#detailEmail").textContent=shown(m.email);
  q("#detailAddress").textContent=shown(m.jobAddress);
  q("#detailClientContext").textContent=shown(m.clientContext);
  q("#detailStage").textContent=shown(m.stage,"");
  q("#detailOwner").textContent=shown(m.owner,"");
  q("#detailArea").textContent=shown(m.area);
  q("#detailLeadSource").textContent=shown(m.leadSource);
  q("#detailState").textContent=shown(m.currentState,"");
  q("#detailNext").textContent=shown(m.nextAction,"");
  q("#detailWaiting").textContent=shown(m.waitingOn,"Nothing");
  q("#detailFollowUp").textContent=shown(m.followUpDate);
  q("#detailStrategy").textContent=shown(m.strategicNote);
  q("#detailUpdated").textContent=shown(m.lastUpdated);
  q("#detailScheduleState").textContent=shown(m.scheduleState);
  q("#detailQueuePosition").textContent=shown(m.queuePosition);
  q("#detailOccupiedDays").textContent=shown(m.occupiedDaysForecast);
  q("#detailEarliestStart").textContent=shown(m.earliestStart);
  q("#detailLatestStart").textContent=shown(m.latestStart);
  q("#detailFlexibility").textContent=shown(m.flexibility);
  q("#detailScheduleConstraint").textContent=shown(m.scheduleConstraint);
  q("#detailDialog").showModal();
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function labelType(t){return ({lead:"Lead",estimate:"Estimate",job:"Job"}[t]||"Matter")}
function attentionLabel(a){return a==="high"?"High attention":a==="medium"?"Active":"Routine"}

q("#filters").addEventListener("click",e=>{
  const btn=e.target.closest("[data-filter]");if(!btn)return;
  activeFilter=btn.dataset.filter;
  document.querySelectorAll("#filters .chip").forEach(x=>x.classList.toggle("active",x===btn));
  render();
});

q("#ownerFilters").addEventListener("click",e=>{
  const btn=e.target.closest("[data-owner]");if(!btn)return;
  activeOwner=btn.dataset.owner;
  document.querySelectorAll(".owner-chip").forEach(x=>{
    const selected=x===btn;
    x.classList.toggle("active",selected);
    x.setAttribute("aria-pressed",String(selected));
  });
  render();
});

q("#refreshBtn").addEventListener("click",()=>{loadVersion();loadBoard();});

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js",{updateViaCache:"none"})
    .then(reg=>reg.update())
    .catch(()=>{});
}

loadVersion();
loadBoard();
