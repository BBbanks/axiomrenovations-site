const API_URL="/api/operating-board";
const VERSION_URL="/api/version";
let matters=[],leadSources=[],activeFilter="all",activeOwner="all";

const q=s=>document.querySelector(s);
const status=q("#statusMessage");

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
    if(!Array.isArray(matters)) throw new Error("Invalid board response");
    leadSources=Array.isArray(payload.leadSources)?payload.leadSources:[];
    status.textContent="";
  }catch(err){
    matters=[];
    leadSources=[];
    status.textContent="Live operating data is temporarily unavailable.";
  }
  render();
  renderLeadSources();
}
function queueNumber(v){
  const n=Number(v);
  return Number.isFinite(n)&&n>0?n:Number.POSITIVE_INFINITY;
}
// Lead triage is evidence-based and never changes the matter's section.
function leadContactState(m){
  if(String(m.type||"").toLowerCase()!=="lead" || /closed|disqualified|credit denied/i.test(String(m.stage||""))) return "";
  const state=String(m.currentState||"");
  // An unsuccessful contact attempt or expressly unestablished contact needs attention.
  if(/\b(?:has not responded|have not responded|not responded|no customer response|no reply|unresponsive|customer did not respond|contact not confirmed|no contact confirmed|not established contact|no established contact|or established contact|no direct contact)\b/i.test(state)
    && !/\b(?:response now received|no.response exception resolved)\b/i.test(state)) return "red";
  // A live conversation, without a confirmed start or award, remains in follow-up.
  if(String(m.stage||"").toLowerCase()==="contacted" &&
     /\b(?:direct conversation|has been contacted|customer stated|customer said|awaiting|follow.up|waiting on|asked whether)\b/i.test(state)) return "yellow";
  return "";
}
function noResponse(m){return leadContactState(m)==="red";}
function isFuture(m){return String(m.type||"").toLowerCase()==="future work";}
function isInactive(m){return /closed lost|disqualified|credit denied/i.test(String(m.stage||""));}
function filtered(){
  const list=matters.filter(m=>{
    const typeOk=activeFilter==="all"||activeFilter==="attention"||activeFilter==="schedule"||activeFilter==="no-response"||m.type===activeFilter;
    const responseOk=activeFilter!=="no-response"||noResponse(m);
    const attentionOk=activeFilter!=="attention"||["high","medium"].includes(m.attention);
    const scheduleOk=activeFilter!=="schedule"||(m.scheduleState&&m.scheduleState.toLowerCase()!=="complete");
    const ownerOk=activeOwner==="all"||String(m.owner||"").includes(activeOwner);
    return typeOk&&responseOk&&attentionOk&&scheduleOk&&ownerOk;
  });
  if(activeFilter==="schedule"){
    list.sort((a,b)=>queueNumber(a.queuePosition)-queueNumber(b.queuePosition)||String(a.name).localeCompare(String(b.name)));
  }
  return list;
}
function isJob(m){
  const type=String(m.type||"").toLowerCase();
  const stage=String(m.stage||"").toLowerCase();
  return type==="job"||/\b(sold|scheduled|active|in progress|under contract)\b/.test(stage);
}
function isNonActionableNextdoor(m){
  const name=String(m.name||"").trim();
  return /nextdoor/i.test(name) && !String(m.phone||m.email||m.jobAddress||"").trim();
}
function renderSection(selector,list){
  const container=q(selector);
  container.replaceChildren();
  if(!list.length){
    const empty=document.createElement("p");
    empty.className="status";
    empty.textContent="No matters match this view.";
    container.append(empty);
  } else for(const m of list) container.append(makeCard(m));
}
function render(){
  const list=filtered().filter(m=>!isNonActionableNextdoor(m)&&!isInactive(m));
  const jobs=list.filter(isJob);
  const future=list.filter(isFuture);
  const leads=list.filter(m=>!isJob(m)&&!isFuture(m));
  renderSection("#jobsCards",jobs);
  renderSection("#leadsCards",leads);
  renderSection("#futureCards",future);
  q("#jobsSectionCount").textContent=jobs.length;
  q("#leadsSectionCount").textContent=leads.length;
  q("#futureSectionCount").textContent=future.length;
  const visible=matters.filter(m=>!isNonActionableNextdoor(m)&&!isInactive(m));
  q("#attentionCount").textContent=visible.filter(m=>["high","medium"].includes(m.attention)).length;
  q("#noResponseCount").textContent=visible.filter(noResponse).length;
  q("#leadCount").textContent=visible.filter(m=>!isJob(m)&&!isFuture(m)&&m.type==="lead").length;
  q("#estimateCount").textContent=visible.filter(m=>!isJob(m)&&m.type==="estimate").length;
  q("#jobCount").textContent=visible.filter(isJob).length;
}
function renderLeadSources(){
  const host=q("#leadSources");
  if(!host) return;
  host.replaceChildren();
  if(!leadSources.length){
    const empty=document.createElement("div");
    empty.className="lead-source-empty";
    empty.textContent="Lead service status is temporarily unavailable.";
    host.append(empty);
    return;
  }
  for(const item of leadSources){
    const card=document.createElement("article");
    card.className="lead-source-card";
    const state=String(item.status||"Unknown").trim();
    const stateClass=/^active$/i.test(state)?"active":/^paused/i.test(state)?"paused":"unknown";
    const activation=item.scheduledReactivation?`<div class="lead-reactivation"><span>Scheduled restart</span><strong>${esc(item.scheduledReactivation)}</strong></div>`:"";
    const serviceArea=item.serviceArea?`<div class="lead-reactivation"><span>Service area</span><strong>${esc(item.serviceArea)}</strong></div>`:"";
    const verified=item.lastVerified?`<div class="lead-verified">Last verified ${esc(item.lastVerified)}</div>`:"";
    card.innerHTML=`<div class="lead-source-top"><strong>${esc(item.source||"Lead service")}</strong><span class="lead-state lead-state-${stateClass}">${esc(state)}</span></div>${activation}${serviceArea}${verified}`;
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
  const b=document.createElement("button");b.type="button";
  const contactState=leadContactState(m);
  const unanswered=contactState==="red";
  b.className=contactState==="red"?"card card-unresponsive":contactState==="yellow"?"card card-follow-up":"card";
  if(contactState) b.setAttribute("data-response-status",contactState);
  const contact=[m.phone,m.jobAddress].filter(Boolean).join(" · ");
  const source=sourceLabel(m.leadSource);
  b.innerHTML=`<div class="card-head"><div><strong>${esc(m.name)}</strong><div class="meta">${esc(m.area||"")}</div></div><span class="badge">${esc(labelType(m.type))}</span></div>${source?`<div class="source-badge source-${esc(source.toLowerCase())}">${esc(source)}</div>`:""}${unanswered?`<div class="response-flag">No established customer contact / response</div>`:""}${contactState==="yellow"?`<div class="follow-up-flag">Contacted · Follow-up pending</div>`:""}${contact?`<div class="contact-preview">${esc(contact)}</div>`:""}${activeFilter==="schedule"?schedulePreview(m):""}<div class="stage">${esc(m.stage||"")}</div><div class="state">${esc(m.currentState||"")}</div><div class="card-foot"><span>${esc(m.owner||"")}</span><span class="attention-${esc(m.attention||"low")}">${esc(attentionLabel(m.attention))}</span></div>`;
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
function labelType(t){return ({lead:"Lead",estimate:"Estimate",job:"Job","future work":"Future Work"}[t]||"Matter")}
function attentionLabel(a){return a==="high"?"High attention":a==="medium"?"Active":"Routine"}

q("#filters").addEventListener("click",e=>{
  const btn=e.target.closest("[data-filter]");if(!btn)return;
  const view=btn.dataset.filter;
  // Type shortcuts navigate to a permanent section; they never reclassify cards.
  const sectionByType={job:"#jobsSection",lead:"#leadsSection",estimate:"#leadsSection","future work":"#futureSection"};
  if(sectionByType[view]){
    activeFilter="all";
    document.querySelectorAll("#filters .chip").forEach(x=>x.classList.toggle("active",x.dataset.filter==="all"));
    render();
    const section=q(sectionByType[view]);
    section.open=true;
    section.scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }
  activeFilter=view;
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
