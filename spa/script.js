// ---- Data (in memory; add a backend or database to persist) ----
let patients = [
  {name:"Asha Reddy",age:34,sys:118,hr:72,temp:36.8,spo2:98,glu:92},
  {name:"Ravi Kumar",age:67,sys:152,hr:96,temp:37.2,spo2:93,glu:148},
  {name:"Meera Iyer",age:58,sys:134,hr:84,temp:37.0,spo2:96,glu:131},
  {name:"Imran Shaikh",age:72,sys:168,hr:108,temp:38.4,spo2:89,glu:215},
  {name:"Lakshmi Rao",age:45,sys:126,hr:78,temp:36.7,spo2:97,glu:101}
];
let sortKey="score", sortDir=-1;

// ---- Risk scoring ----
function score(p){
  let s=0;
  s += p.age>=65?2:p.age>=50?1:0;
  s += p.sys>=160?3:p.sys>=140?2:p.sys>=130?1:0;
  s += (p.hr>100||p.hr<50)?2:0;
  s += p.temp>=38?1:0;
  s += p.spo2<90?3:p.spo2<94?2:0;
  s += p.glu>=200?2:p.glu>=126?1:0;
  return s;
}
const level = s => s>=6?"High":s>=3?"Medium":"Low";
const ageGroup = a => a<18?"Under 18":a<40?"18–39":a<65?"40–64":"65 and over";

// ---- Rendering ----
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const avg = k => patients.length ? Math.round(patients.reduce((t,p)=>t+p[k],0)/patients.length) : 0;

function render(){
  patients.forEach(p=>{p.score=score(p);p.level=level(p.score)});
  const high = patients.filter(p=>p.level==="High").length;
  $("stats").innerHTML =
    `<div class="stat"><b>${patients.length}</b><span>Total patients</span></div>`+
    `<div class="stat ${high?"alert":""}"><b>${high}</b><span>High risk</span></div>`+
    `<div class="stat"><b>${avg("age")}</b><span>Average age</span></div>`+
    `<div class="stat"><b>${avg("sys")}</b><span>Average systolic BP</span></div>`;

  bars("riskBars",["High","Medium","Low"],p=>p.level,{High:"var(--high)",Medium:"var(--med)",Low:"var(--low)"});
  bars("ageBars",["Under 18","18–39","40–64","65 and over"],p=>ageGroup(p.age),{});

  const q=$("q").value.trim().toLowerCase(), f=$("f").value;
  const list = patients.filter(p=>p.name.toLowerCase().includes(q)&&(!f||p.level===f))
    .sort((a,b)=>{const x=a[sortKey],y=b[sortKey];return (x>y?1:x<y?-1:0)*sortDir});
  $("rows").innerHTML = list.map(p=>{
    const i = patients.indexOf(p);
    return `<tr><td>${esc(p.name)}</td><td>${p.age}</td>`+
      `<td class="${p.sys>=140?"flag":""}">${p.sys}</td><td class="${p.hr>100||p.hr<50?"flag":""}">${p.hr}</td>`+
      `<td class="${p.temp>=38?"flag":""}">${p.temp}</td><td class="${p.spo2<94?"flag":""}">${p.spo2}</td>`+
      `<td class="${p.glu>=126?"flag":""}">${p.glu}</td>`+
      `<td><span class="badge ${p.level}">${p.level} (${p.score})</span></td>`+
      `<td><button class="ghost" data-del="${i}">Remove</button></td></tr>`;
  }).join("");
  $("empty").hidden = list.length>0;
}

function bars(id,labels,fn,colors){
  const max = Math.max(1,...labels.map(l=>patients.filter(p=>fn(p)===l).length));
  $(id).innerHTML = labels.map(l=>{
    const n = patients.filter(p=>fn(p)===l).length;
    return `<div class="bar"><span>${l}</span><div class="track"><div class="fill" style="width:${n/max*100}%;background:${colors[l]||"var(--accent)"}"></div></div><span>${n}</span></div>`;
  }).join("");
}

// ---- Events ----
$("form").addEventListener("submit",e=>{
  e.preventDefault();
  const d = new FormData(e.target);
  patients.push({name:d.get("name").trim(),age:+d.get("age"),sys:+d.get("sys"),hr:+d.get("hr"),
    temp:+d.get("temp"),spo2:+d.get("spo2"),glu:+d.get("glu")});
  e.target.reset(); render();
});
$("rows").addEventListener("click",e=>{
  const i = e.target.dataset.del;
  if(i!==undefined){patients.splice(+i,1);render();}
});
document.querySelector("thead").addEventListener("click",e=>{
  const k = e.target.dataset.k; if(!k) return;
  sortDir = sortKey===k ? -sortDir : 1; sortKey=k; render();
});
$("q").addEventListener("input",render);
$("f").addEventListener("change",render);
render();
