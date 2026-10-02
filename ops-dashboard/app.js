const API_URL="/api/operating-board";
const VERSION_URL="/api/version";
let matters=[],activeFilter="attention",activeOwner="all";

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
    if(!Array.isArray(matters)) throw new Error("Invalid board response");
    status.textContent="";
  }catch(err){
    matters=[];
    status.textContent="Live operating data is temporarily unavailable.";
  }
  render();
}
function filtered(){
  return matters.filter(m=>{
    const typeOk=activeFilter==="all"||activeFilter==="attention"||m.type===activeFilter;
    const attentionOk=activeFilter!=="attention"||["high","medium"].includes(m.attention);
    const ownerOk=activeOwner==="all"||String(m.owner||"").includes(activeOwner);
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
  const contact=[m.phone,m.jobAddress].filter(Boolean).join(" · ");
  b.innerHTML=`<div class="card-head"><div><strong>${esc(m.name)}</strong><div class="meta">${esc(m.area||"")}</div></div><span class="badge">${esc(labelType(m.type))}</span></div>${contact?`<div class="contact-preview">${esc(contact)}</div>`:""}<div class="stage">${esc(m.stage||"")}</div><div class="state">${esc(m.currentState||"")}</div><div class="card-foot"><span>${esc(m.owner||"")}</span><span class="attention-${esc(m.attention||"low")}">${esc(attentionLabel(m.attention))}</span></div>`;
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