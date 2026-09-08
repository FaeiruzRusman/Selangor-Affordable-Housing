
const fmt = n => n == null ? "Belum tersedia" : Number(n).toLocaleString("en-MY");
const money = n => n == null ? "Belum tersedia" : `RM${Number(n).toLocaleString("en-MY")}`;
const el = id => document.getElementById(id);

let PROJECTS = [], SOURCES = [], SUMMARY = {}, DISTRICT_STATS = [];
let waitingChart, districtChart, map;

async function loadData(){
  [SUMMARY, PROJECTS, SOURCES, DISTRICT_STATS] = await Promise.all([
    fetch("data/state_summary.json").then(r=>r.json()),
    fetch("data/projects.json").then(r=>r.json()),
    fetch("data/sources.json").then(r=>r.json()),
    fetch("data/district_stats.json").then(r=>r.json())
  ]);
  init();
}

function init(){
  renderKpis();
  renderPolicy();
  populateFilters();
  renderProjects(PROJECTS);
  renderPipeline();
  renderSources();
  renderCharts();
  renderMap();
  el("coverageBadge").textContent = `${PROJECTS.length} source-traceable project records`;
  el("downloadCsv").onclick = () => location.href = "data/projects.csv";
  ["schemeFilter","districtFilter","statusFilter","searchFilter"].forEach(id=>{
    el(id).addEventListener(id==="searchFilter" ? "input" : "change", applyFilters);
  });
}

function renderKpis(){
  const s=SUMMARY;
  const cards = [
    ["RSKU Siap Dibina", fmt(s.rumah_selangorku.completed_units), `${fmt(s.rumah_selangorku.occupied_or_sold_units)} dihuni / terjual`, `${fmt(s.rumah_selangorku.unsold_units)} belum terjual`],
    ["Senarai Menunggu RSKU", fmt(s.rumah_selangorku.waiting_list), "Pemohon masih menunggu", "Demand pressure"],
    ["Rumah Idaman Siap", fmt(s.rumah_idaman.completed_units), `${s.rumah_idaman.completed_projects} projek`, "Official 2026"],
    ["Idaman Dalam Pembinaan", fmt(s.rumah_idaman.under_construction_units), `${s.rumah_idaman.under_construction_projects} projek`, "Pipeline"],
    ["PPR Dihuni", fmt(s.ppr.occupied_units), `${fmt(s.ppr.waiting_list)} menunggu`, `${fmt(s.ppr.damaged_units)} unit rosak`],
    ["Smart Sewa Dihuni", fmt(s.smart_sewa.occupied_units), `${fmt(s.smart_sewa.available_units)} tersedia`, `${fmt(s.smart_sewa.waiting_list)} menunggu`]
  ];
  el("kpiGrid").innerHTML = cards.map(c=>`
    <div class="kpi"><div class="label">${c[0]}</div><strong>${c[1]}</strong><p>${c[2]}</p><span class="accent">${c[3]}</span></div>
  `).join("");
}

function renderPolicy(){
  const r=SUMMARY.rumah_selangorku;
  el("rskuPrice").textContent = `${money(r.price_min_rm)} – ${money(r.price_max_rm)}`;
  el("rskuOffered").textContent = fmt(r.offered_2021_2025);
  el("rskuAchievement").textContent = `${r.achievement_pct}%`;
  el("rskuUnsold").textContent = fmt(r.unsold_units);
}

function populateFilters(){
  const addOptions=(id,vals)=> vals.filter(Boolean).sort().forEach(v=>{
    const o=document.createElement("option");o.value=v;o.textContent=v;el(id).appendChild(o)
  });
  addOptions("schemeFilter",[...new Set(PROJECTS.map(x=>x.scheme))]);
  addOptions("districtFilter",[...new Set(PROJECTS.map(x=>x.district))]);
  addOptions("statusFilter",[...new Set(PROJECTS.map(x=>x.status))]);
}

function applyFilters(){
  const scheme=el("schemeFilter").value, district=el("districtFilter").value, status=el("statusFilter").value;
  const q=el("searchFilter").value.toLowerCase().trim();
  const rows=PROJECTS.filter(x =>
    (!scheme || x.scheme===scheme) &&
    (!district || x.district===district) &&
    (!status || x.status===status) &&
    (!q || `${x.project_name} ${x.developer||""} ${x.mukim||""}`.toLowerCase().includes(q))
  );
  renderProjects(rows);
}

function renderProjects(rows){
  el("recordCount").textContent = `${rows.length} records`;
  el("projectTable").innerHTML = rows.map(x=>`
    <tr>
      <td><b>${x.project_name}</b><br><span class="muted">${x.project_id}</span></td>
      <td>${x.scheme}</td>
      <td>${x.district ?? '<span class="muted">Belum tersedia</span>'}</td>
      <td>${x.pbt ?? '<span class="muted">Belum tersedia</span>'}</td>
      <td>${x.units==null?'<span class="muted">Belum tersedia</span>':fmt(x.units)}</td>
      <td>${x.price_min_rm==null?'<span class="muted">Belum tersedia</span>':money(x.price_min_rm)}</td>
      <td><span class="status">${x.status}</span></td>
      <td>${x.expected_completion ?? '<span class="muted">Belum tersedia</span>'}</td>
      <td class="verify">${x.verification}</td>
    </tr>
  `).join("");
}

function renderPipeline(){
  const rows=PROJECTS.filter(x=>x.status==="Dalam Pembinaan");
  el("pipelineCards").innerHTML = rows.map(x=>`
    <div class="project-card">
      <div class="top"><h3>${x.project_name}</h3><div class="units">${fmt(x.units)}</div></div>
      <p>${x.district} • ${x.pbt || "PBT belum disahkan"}<br>Jumlah unit rasmi dalam pipeline 2026.</p>
      <div class="meta"><span>Target: <b>${x.expected_completion}</b></span><span>${x.source_id}</span></div>
    </div>
  `).join("");
  const total=rows.reduce((a,b)=>a+(b.units||0),0);
  const districts=new Set(rows.map(x=>x.district)).size;
  el("pipelineStrip").innerHTML = `
    <div class="metric"><span>Total units</span><strong>${fmt(total)}</strong></div>
    <div class="metric"><span>Projects</span><strong>${rows.length}</strong></div>
    <div class="metric"><span>Districts</span><strong>${districts}</strong></div>`;
}

function renderCharts(){
  const s=SUMMARY;
  waitingChart = new Chart(el("waitingChart"),{
    type:"bar",
    data:{
      labels:["Rumah Selangorku","PPR","Smart Sewa"],
      datasets:[
        {label:"Waiting list",data:[s.rumah_selangorku.waiting_list,s.ppr.waiting_list,s.smart_sewa.waiting_list],backgroundColor:"#e8a33d",borderRadius:6},
        {label:"Occupied / sold",data:[s.rumah_selangorku.occupied_or_sold_units,s.ppr.occupied_units,s.smart_sewa.occupied_units],backgroundColor:"#4f7fc2",borderRadius:6}
      ]
    },
    options:{maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:10,font:{size:9}}}},scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{beginAtZero:true,grid:{color:"#eef2f6"},ticks:{font:{size:9}}}}}
  });

  const pipeline = PROJECTS.filter(x=>x.status==="Dalam Pembinaan");
  const agg={};
  pipeline.forEach(x=>agg[x.district]=(agg[x.district]||0)+(x.units||0));
  const labels=Object.keys(agg).sort((a,b)=>agg[b]-agg[a]);
  districtChart = new Chart(el("districtChart"),{
    type:"bar",
    data:{labels,datasets:[{label:"Units under construction",data:labels.map(k=>agg[k]),backgroundColor:"#3b73b8",borderRadius:6}]},
    options:{indexAxis:"y",maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:"#eef2f6"},ticks:{font:{size:9}}},y:{grid:{display:false},ticks:{font:{size:9}}}}}
  });
}

function renderMap(){
  map=L.map("map",{zoomControl:true}).setView([3.15,101.52],8);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap"}).addTo(map);
  const districtCenters={
    "Petaling":[3.105,101.585],
    "Sepang":[2.69,101.75],
    "Kuala Selangor":[3.34,101.25],
    "Hulu Langat":[2.99,101.79]
  };
  const pipeline=PROJECTS.filter(x=>x.status==="Dalam Pembinaan");
  const agg={};
  pipeline.forEach(x=>{
    if(!agg[x.district]) agg[x.district]={units:0,projects:0};
    agg[x.district].units += x.units||0; agg[x.district].projects += 1;
  });
  Object.entries(agg).forEach(([district,v])=>{
    if(!districtCenters[district]) return;
    const radius=Math.max(10,Math.sqrt(v.units)*.22);
    L.circleMarker(districtCenters[district],{radius,weight:2,color:"#fff",fillColor:"#356fb2",fillOpacity:.82})
      .addTo(map)
      .bindPopup(`<b>${district}</b><br>${fmt(v.units)} unit Idaman dalam pembinaan<br>${v.projects} projek<br><small>District-level aggregation</small>`);
  });
  PROJECTS.filter(x=>x.latitude!=null && x.longitude!=null).forEach(x=>{
    L.marker([x.latitude,x.longitude]).addTo(map).bindPopup(`<b>${x.project_name}</b><br>${x.location_precision}`);
  });
}

function renderSources(){
  el("sourceList").innerHTML=SOURCES.map(s=>`
    <div class="source-item">
      <a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>
      <p>${s.source_date} • ${s.used_for.join(" • ")}</p>
    </div>
  `).join("");
}

loadData().catch(err=>{
  console.error(err);
  el("coverageBadge").textContent="Data loading error";
  document.querySelector(".notice span").textContent="Pastikan laman dibuka melalui GitHub Pages / web server. JSON fetch tidak berfungsi jika index.html dibuka terus menggunakan file://.";
});
