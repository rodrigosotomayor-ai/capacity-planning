
import { useState, useEffect } from "react";

const SB_URL = "https://ybowftbdwtxzatfsdzot.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlib3dmdGJkd3R4emF0ZnNkem90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTE0NTksImV4cCI6MjA5NDE4NzQ1OX0.F0rX051XIfqUQulhhb0J0oOSeVypFPt99xpfeA2A4lY";

function sb(table) {
  const h = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" };
  return {
    select: () => fetch(`${SB_URL}/rest/v1/${table}?select=*`, { headers: h }).then(r => r.json()),
    insert: (d) => fetch(`${SB_URL}/rest/v1/${table}`, { method:"POST", headers:{...h, Prefer:"return=representation"}, body:JSON.stringify(d) }).then(r => r.json()),
    upsert: (d) => fetch(`${SB_URL}/rest/v1/${table}`, { method:"POST", headers:{...h, Prefer:"resolution=merge-duplicates,return=representation"}, body:JSON.stringify(d) }).then(r => r.json()),
  };
}

const occStyle = (p) => {
  if (p > 1)    return { bar:"#E24B4A", bg:"#FCEBEB", fg:"#791F1F" };
  if (p >= .85) return { bar:"#EF9F27", bg:"#FAEEDA", fg:"#633806" };
  if (p >= .5)  return { bar:"#1D9E75", bg:"#E1F5EE", fg:"#085041" };
  return { bar:"#B4B2A9", bg:"#F1EFE8", fg:"#888780" };
};
const ini = (n) => n.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
const fmt = (n) => Math.round(n * 10) / 10;
const PC = ["#1D9E75","#378ADD","#E24B4A","#EF9F27","#7F77DD","#D85A30","#D4537E","#639922","#0F6E56","#185FA5","#A32D2D","#BA7517","#534AB7","#993C1D"];
const MN = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function App() {
  const [phase, setPhase]       = useState("loading");
  const [data, setData]         = useState(null);
  const [err, setErr]           = useState(null);
  const [view, setView]         = useState("dashboard");
  const [subview, setSubview]   = useState("cards");
  const [team, setTeam]         = useState("PD");
  const [monthId, setMonthId]   = useState(null);
  const [editCell, setEditCell] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [nm, setNm]             = useState({ year:"2026", month:"7", days:"20", copyFrom:"" });

  useEffect(() => { load(); }, []);

  async function load() {
    setPhase("loading");
    try {
      const [teams, people, projects, months, avail, allocs] = await Promise.all([
        sb("cap_teams").select("*"),
        sb("cap_people").select("*"),
        sb("cap_projects").select("*"),
        sb("cap_months").select("*"),
        sb("cap_availability").select("*"),
        sb("cap_allocations").select("*"),
      ]);
      if (teams.message) throw new Error(teams.message);
      setData({ teams, people, projects, months, avail, allocs });
      const pdId = teams.find(t => t.slug==="PD")?.id;
      const pdM  = months.filter(m => m.team_id===pdId).sort((a,b) => b.year-a.year||b.month_num-a.month_num);
      if (pdM[0]) setMonthId(pdM[0].id);
      setPhase("app");
    } catch(e) { setErr(e.message); setPhase("error"); }
  }

  async function upsert(monthId, personId, projectId, hours) {
    const h = parseFloat(hours)||0;
    setSaving(true);
    setData(d => {
      const rest = d.allocs.filter(a => !(a.month_id===monthId&&a.person_id===personId&&a.project_id===projectId));
      if (h>0) rest.push({ id:"_tmp", month_id:monthId, person_id:personId, project_id:projectId, hours:h });
      return {...d, allocs:rest};
    });
    try { await sb("cap_allocations").upsert({ month_id:monthId, person_id:personId, project_id:projectId, hours:h, updated_at:new Date().toISOString() }); }
    finally { setSaving(false); }
  }

  async function addProject(name, type) {
    if (!name||!data) return;
    const teamId = data.teams.find(t=>t.slug===team)?.id;
    const res = await sb("cap_projects").insert({ name, type, team_id:teamId, is_active:true });
    if (res[0]) setData(d => ({...d, projects:[...d.projects, res[0]]}));
  }

  async function createMonth() {
    if (!data) return;
    const teamId = data.teams.find(t=>t.slug===team)?.id;
    const label = `${MN[parseInt(nm.month)-1]} ${nm.year}`;
    const res = await sb("cap_months").insert({ team_id:teamId, year:parseInt(nm.year), month_num:parseInt(nm.month), label, work_days:parseInt(nm.days) });
    if (!res[0]) return;
    const newId = res[0].id;
    if (nm.copyFrom) {
      const avails = data.avail.filter(a => a.month_id===nm.copyFrom);
      for (const a of avails) await sb("cap_availability").insert({ month_id:newId, person_id:a.person_id, available_hours:a.available_hours });
      const feeIds = data.projects.filter(p => p.team_id===teamId&&p.type==="fee").map(p=>p.id);
      const fees   = data.allocs.filter(a => a.month_id===nm.copyFrom&&feeIds.includes(a.project_id));
      for (const a of fees) await sb("cap_allocations").insert({ month_id:newId, person_id:a.person_id, project_id:a.project_id, hours:a.hours });
    }
    await load(); setMonthId(newId); setView("matrix");
  }

  function md() {
    if (!data||!monthId) return null;
    const teamObj = data.teams.find(t=>t.slug===team);
    if (!teamObj) return null;
    const month    = data.months.find(m=>m.id===monthId);
    if (!month) return null;
    const avails   = data.avail.filter(a=>a.month_id===monthId);
    const people   = avails.map(a=>({...data.people.find(p=>p.id===a.person_id), avail_h:a.available_hours})).filter(Boolean);
    const projects = data.projects.filter(p=>p.team_id===teamObj.id&&p.is_active);
    const allocs   = data.allocs.filter(a=>a.month_id===monthId);
    const getH     = (pid,projid) => { const a=allocs.find(x=>x.person_id===pid&&x.project_id===projid); return a?parseFloat(a.hours):0; };
    const pTotals  = Object.fromEntries(people.map(p=>[p.id, allocs.filter(a=>a.person_id===p.id).reduce((s,a)=>s+parseFloat(a.hours),0)]));
    return { teamObj, month, people, projects, allocs, getH, pTotals };
  }

  function teamMonths() {
    if (!data) return [];
    const tid = data.teams.find(t=>t.slug===team)?.id;
    return data.months.filter(m=>m.team_id===tid).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);
  }

  function monthDot(mId) {
    if (!data) return "#B4B2A9";
    const av   = data.avail.filter(a=>a.month_id===mId);
    const sold = av.reduce((s,a)=>s+data.allocs.filter(x=>x.person_id===a.person_id&&x.month_id===mId).reduce((ss,x)=>ss+parseFloat(x.hours),0),0);
    const disp = av.reduce((s,a)=>s+a.available_hours,0);
    const p = disp>0?sold/disp:0;
    return p>1?"#E24B4A":p>=.85?"#EF9F27":p>=.5?"#1D9E75":"#B4B2A9";
  }

  // ── Loading / Error ───────────────────────────────────────────────────────────
  if (phase==="loading") return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",gap:10,color:"#888",fontSize:14 }}>
      <i className="ti ti-loader-2" style={{ fontSize:22 }}/> Conectando a Supabase...
    </div>
  );
  if (phase==="error") return (
    <div style={{ maxWidth:480,margin:"40px auto",background:"#FCEBEB",border:"1px solid #F09595",borderRadius:10,padding:24 }}>
      <p style={{ fontWeight:600,color:"#791F1F",marginBottom:8 }}>Error de conexión</p>
      <pre style={{ color:"#A32D2D",fontSize:12,whiteSpace:"pre-wrap",marginBottom:14 }}>{err}</pre>
      <button onClick={load} style={{ padding:"6px 14px",border:"1px solid #F09595",borderRadius:6,cursor:"pointer",background:"#fff",color:"#791F1F" }}>Reintentar</button>
    </div>
  );

  const cur    = md();
  const months = teamMonths();

  const NavBtn = ({id,icon,label}) => (
    <button onClick={()=>setView(id)} style={{ display:"flex",alignItems:"center",gap:7,padding:"6px 12px",background:view===id?"#E1F5EE":"none",border:"none",cursor:"pointer",fontSize:12,color:view===id?"#0F6E56":"#666",fontWeight:view===id?600:400,width:"100%",textAlign:"left",borderRadius:4 }}>
      <i className={`ti ti-${icon}`} style={{ fontSize:15 }}/>{label}
    </button>
  );

  return (
    <div style={{ display:"flex",height:"calc(100vh - 40px)",border:"1px solid #e5e5e3",borderRadius:12,overflow:"hidden",fontSize:13,background:"#fff",maxWidth:1280,margin:"0 auto" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div style={{ width:162,borderRight:"1px solid #e5e5e3",display:"flex",flexDirection:"column",background:"#fff",flexShrink:0 }}>
        <div style={{ padding:"12px 14px 10px",borderBottom:"1px solid #e5e5e3" }}>
          <div style={{ fontWeight:700,fontSize:14 }}>capacity<span style={{ color:"#1D9E75" }}>.</span>app</div>
          <div style={{ fontSize:10,color:"#aaa",marginTop:1 }}>Agencia Digital</div>
        </div>
        <div style={{ display:"flex",gap:4,padding:"8px 10px",borderBottom:"1px solid #e5e5e3" }}>
          {["PD","MKT"].map(t=>(
            <button key={t} onClick={()=>{ setTeam(t); const tm=data.months.filter(m=>m.team_id===data.teams.find(x=>x.slug===t)?.id).sort((a,b)=>b.year-a.year||b.month_num-a.month_num); if(tm[0])setMonthId(tm[0].id); }} style={{ flex:1,padding:"4px 0",fontSize:11,fontWeight:700,borderRadius:6,cursor:"pointer",background:team===t?"#1D9E75":"none",border:team===t?"none":"1px solid #d5d5d3",color:team===t?"#fff":"#888",transition:"all .1s" }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ padding:"6px 0 2px" }}>
          <NavBtn id="dashboard"  icon="layout-dashboard" label="Dashboard"  />
          <NavBtn id="matrix"     icon="table"            label="Capacity"   />
          <NavBtn id="equipo"     icon="users"            label="Equipo"     />
          <NavBtn id="proyectos"  icon="briefcase"        label="Proyectos"  />
        </div>
        <div style={{ padding:"6px 12px 3px",fontSize:10,fontWeight:600,color:"#aaa",textTransform:"uppercase",letterSpacing:".07em",borderTop:"1px solid #e5e5e3",marginTop:4 }}>Meses</div>
        <div style={{ flex:1,overflowY:"auto" }}>
          {months.map(m=>(
            <div key={m.id} onClick={()=>setMonthId(m.id)} style={{ padding:"5px 12px",cursor:"pointer",fontSize:11,color:monthId===m.id?"#0F6E56":"#666",fontWeight:monthId===m.id?600:400,display:"flex",alignItems:"center",gap:7,background:monthId===m.id?"#F0FBF7":"none" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:monthDot(m.id),flexShrink:0 }}/>{m.label}
            </div>
          ))}
        </div>
        <div style={{ padding:"8px 10px",borderTop:"1px solid #e5e5e3" }}>
          <button onClick={()=>setView("nuevo")} style={{ width:"100%",padding:"6px",background:"#1D9E75",color:"#fff",border:"none",borderRadius:6,fontWeight:600,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
            <i className="ti ti-plus" style={{ fontSize:13 }}/>Nuevo mes
          </button>
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0,background:"#f5f5f3" }}>

        {/* Topbar */}
        <div style={{ height:46,padding:"0 16px",background:"#fff",borderBottom:"1px solid #e5e5e3",display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
          <span style={{ fontWeight:600,fontSize:13 }}>{{dashboard:"Dashboard",matrix:"Capacity",equipo:"Equipo",proyectos:"Proyectos",nuevo:"Nuevo mes"}[view]}</span>
          <span style={{ color:"#ddd" }}>·</span>
          <span style={{ fontSize:11,color:"#999" }}>{team} · {cur?.month.label}</span>
          {saving&&<span style={{ marginLeft:6,fontSize:11,color:"#1D9E75" }}><i className="ti ti-loader-2" style={{ fontSize:12,marginRight:3 }}/>Guardando...</span>}
          <div style={{ marginLeft:"auto",display:"flex",gap:6 }}>
            {view==="matrix"&&(
              <button onClick={()=>{ const n=prompt("Nombre del proyecto:"); const t=prompt("Tipo (proyecto / fee / interno):","proyecto"); if(n)addProject(n,t||"proyecto"); }} style={{ padding:"5px 10px",fontSize:11,border:"1px solid #d5d5d3",borderRadius:6,cursor:"pointer",background:"#fff",color:"#555",display:"flex",alignItems:"center",gap:4 }}>
                <i className="ti ti-plus" style={{ fontSize:12 }}/>Proyecto
              </button>
            )}
            <button onClick={load} title="Recargar" style={{ padding:"5px 8px",fontSize:11,border:"1px solid #d5d5d3",borderRadius:6,cursor:"pointer",background:"#fff",color:"#888" }}>
              <i className="ti ti-refresh" style={{ fontSize:13 }}/>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        {view==="matrix"&&(
          <div style={{ display:"flex",background:"#fff",borderBottom:"1px solid #e5e5e3",padding:"0 14px",flexShrink:0 }}>
            {[["cards","layout-grid","Resumen"],["grid","table","Grilla de horas"]].map(([id,icon,lbl])=>(
              <button key={id} onClick={()=>setSubview(id)} style={{ padding:"8px 12px",fontSize:11,cursor:"pointer",border:"none",background:"none",color:subview===id?"#0F6E56":"#888",borderBottom:subview===id?"2px solid #1D9E75":"2px solid transparent",marginBottom:"-1px",display:"flex",alignItems:"center",gap:5,fontWeight:subview===id?600:400 }}>
                <i className={`ti ti-${icon}`} style={{ fontSize:13 }}/>{lbl}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex:1,overflowY:"auto",padding:14 }}>

          {/* Dashboard */}
          {view==="dashboard"&&cur&&(()=>{
            const {people,projects,getH,pTotals}=cur;
            const tSold=fmt(Object.values(pTotals).reduce((a,b)=>a+b,0));
            const tDisp=people.reduce((s,p)=>s+p.avail_h,0);
            const libre=Math.max(0,tDisp-tSold);
            const over =people.filter(p=>p.avail_h>0&&pTotals[p.id]>p.avail_h).length;
            const valid=people.filter(p=>p.avail_h>0);
            const avgP =valid.length?Math.round(valid.map(p=>Math.min(pTotals[p.id]/p.avail_h,2)*100).reduce((a,b)=>a+b,0)/valid.length):0;
            return(<div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12 }}>
                {[[tSold,"HH asignadas",`de ${tDisp} disponibles`,"#333"],[libre,"HH libres",`${Math.round(libre/tDisp*100)||0}% sin asignar`,libre>0?"#0F6E56":"#A32D2D"],[`${avgP}%`,"Ocupación prom.","objetivo 80–90%",avgP>100?"#A32D2D":avgP>85?"#BA7517":"#0F6E56"],[over,"Sobreocupados",over>0?"acción requerida":"todo ok",over>0?"#A32D2D":"#333"]].map(([v,l,n,c],i)=>(
                  <div key={i} style={{ background:"#F5F5F3",borderRadius:8,padding:"10px 12px" }}>
                    <div style={{ fontSize:10,color:"#888",marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:22,fontWeight:700,fontFamily:"monospace",color:c }}>{v}</div>
                    <div style={{ fontSize:10,color:"#aaa",marginTop:2 }}>{n}</div>
                  </div>
                ))}
              </div>
              {people.filter(p=>p.avail_h>0&&(pTotals[p.id]>p.avail_h||(pTotals[p.id]===0&&p.avail_h>=80))).map((p,i)=>{
                const isOver=pTotals[p.id]>p.avail_h;
                return(<div key={i} style={{ borderRadius:8,padding:"7px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:8,fontSize:11,background:isOver?"#FCEBEB":"#FAEEDA",border:`1px solid ${isOver?"#F09595":"#FAC775"}`,color:isOver?"#791F1F":"#633806" }}>
                  <i className="ti ti-alert-triangle" style={{ fontSize:14,flexShrink:0 }}/>
                  <span><strong>{p.name}</strong>: {isOver?`${Math.round(pTotals[p.id]/p.avail_h*100)}% — sobrecarga de ${fmt(pTotals[p.id]-p.avail_h)} HH`:"sin horas asignadas este mes"}</span>
                </div>);
              })}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4 }}>
                <div style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,overflow:"hidden" }}>
                  <div style={{ padding:"9px 14px",borderBottom:"1px solid #e5e5e3",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontWeight:600,fontSize:12 }}>Ocupación del equipo</span><span style={{ fontSize:10,color:"#aaa" }}>{people.length} personas</span>
                  </div>
                  <div style={{ padding:"8px 14px" }}>
                    {[...people].filter(p=>p.avail_h>0).sort((a,b)=>(pTotals[b.id]/b.avail_h)-(pTotals[a.id]/a.avail_h)).map(p=>{
                      const pct=pTotals[p.id]/p.avail_h,st=occStyle(pct);
                      return(<div key={p.id} style={{ display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:"1px solid #f5f5f3" }}>
                        <div style={{ width:24,height:24,borderRadius:"50%",background:st.bg,color:st.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0 }}>{ini(p.name)}</div>
                        <span style={{ flex:1,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</span>
                        <div style={{ width:64,height:4,background:"#f0f0ee",borderRadius:2,overflow:"hidden",flexShrink:0 }}>
                          <div style={{ height:"100%",borderRadius:2,width:`${Math.min(pct*100,100)}%`,background:st.bar }}/>
                        </div>
                        <span style={{ fontSize:10,fontFamily:"monospace",color:st.fg,minWidth:36,textAlign:"right",fontWeight:600 }}>{Math.round(pct*100)}%</span>
                      </div>);
                    })}
                  </div>
                </div>
                <div style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,overflow:"hidden" }}>
                  <div style={{ padding:"9px 14px",borderBottom:"1px solid #e5e5e3",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontWeight:600,fontSize:12 }}>Proyectos activos</span><span style={{ fontSize:10,color:"#aaa" }}>{projects.length}</span>
                  </div>
                  <div style={{ padding:"8px 14px" }}>
                    {projects.map((p,pi)=>{
                      const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0); if(!tot)return null;
                      const tC={fee:["#EAF3DE","#3B6D11"],proyecto:["#E6F1FB","#0C447C"],interno:["#f0f0ee","#888"]}[p.type];
                      return(<div key={p.id} style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid #f5f5f3",fontSize:11 }}>
                        <div style={{ width:7,height:7,borderRadius:"50%",background:PC[pi%PC.length],flexShrink:0 }}/>
                        <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</span>
                        <span style={{ fontSize:10,padding:"1px 6px",borderRadius:10,background:tC[0],color:tC[1] }}>{p.type}</span>
                        <span style={{ fontFamily:"monospace",color:"#888" }}>{fmt(tot)}h</span>
                      </div>);
                    })}
                  </div>
                </div>
              </div>
            </div>);
          })()}

          {/* Capacity cards */}
          {view==="matrix"&&subview==="cards"&&cur&&(()=>{
            const {people,projects,getH,pTotals}=cur;
            return(<div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(196px,1fr))",gap:8 }}>
              {people.filter(p=>p.avail_h>0).map(p=>{
                const pct=pTotals[p.id]/p.avail_h,st=occStyle(pct);
                const projs=projects.map((pr,pi)=>({...pr,h:getH(p.id,pr.id),c:PC[pi%PC.length]})).filter(x=>x.h>0).sort((a,b)=>b.h-a.h);
                return(<div key={p.id} style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,padding:12 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                    <div style={{ width:30,height:30,borderRadius:"50%",background:st.bg,color:st.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700 }}>{ini(p.name)}</div>
                    <span style={{ fontSize:10,padding:"2px 7px",borderRadius:10,background:st.bg,color:st.fg,fontFamily:"monospace",fontWeight:700 }}>{Math.round(pct*100)}%</span>
                  </div>
                  <div style={{ fontWeight:600,fontSize:12,marginBottom:1 }}>{p.name}</div>
                  <div style={{ fontSize:10,color:"#aaa",marginBottom:8 }}>{fmt(pTotals[p.id])} / {p.avail_h} HH</div>
                  <div style={{ height:4,borderRadius:2,background:"#f0f0ee",overflow:"hidden",marginBottom:8 }}>
                    <div style={{ height:"100%",borderRadius:2,width:`${Math.min(pct*100,100)}%`,background:st.bar }}/>
                  </div>
                  {projs.slice(0,5).map(pr=>(
                    <div key={pr.id} style={{ display:"flex",alignItems:"center",gap:5,padding:"3px 0",fontSize:11,borderBottom:"1px solid #f5f5f3" }}>
                      <div style={{ width:6,height:6,borderRadius:"50%",background:pr.c,flexShrink:0 }}/>
                      <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{pr.name}</span>
                      <span style={{ fontFamily:"monospace",color:"#888",fontSize:10 }}>{pr.h}h</span>
                    </div>
                  ))}
                </div>);
              })}
            </div>);
          })()}

          {/* Capacity grid */}
          {view==="matrix"&&subview==="grid"&&cur&&(()=>{
            const {people,projects,getH,pTotals}=cur;
            return(<div style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,overflowX:"auto" }}>
              <table style={{ borderCollapse:"collapse",fontSize:11 }}>
                <thead><tr>
                  <th style={{ padding:"6px 10px",border:"1px solid #e5e5e3",background:"#f5f5f3",textAlign:"left",minWidth:170,position:"sticky",left:0,zIndex:3,fontSize:10,fontWeight:600,color:"#666" }}>Proyecto</th>
                  <th style={{ padding:"6px 8px",border:"1px solid #e5e5e3",background:"#f5f5f3",fontSize:10,fontWeight:600,color:"#666",minWidth:50,textAlign:"center" }}>Total</th>
                  {people.map(p=><th key={p.id} style={{ padding:"5px 7px",border:"1px solid #e5e5e3",background:"#f5f5f3",fontSize:10,fontWeight:600,color:"#666",whiteSpace:"nowrap",minWidth:54,textAlign:"center" }}>{p.name}</th>)}
                </tr></thead>
                <tbody>
                  {projects.map((pr,pi)=>{
                    const rowTot=people.reduce((s,p)=>s+getH(p.id,pr.id),0);
                    const fee=pr.type!=="proyecto";
                    return(<tr key={pr.id}>
                      <td style={{ padding:"4px 10px",border:"1px solid #e5e5e3",position:"sticky",left:0,zIndex:1,background:fee?"#fafafa":"#fff",minWidth:170,maxWidth:170,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:fee?"italic":"normal",color:fee?"#888":"#333" }} title={pr.name}>{pr.name}</td>
                      <td style={{ padding:"4px 8px",border:"1px solid #e5e5e3",textAlign:"center",fontFamily:"monospace",color:"#aaa",background:fee?"#fafafa":"#fff" }}>{rowTot>0?fmt(rowTot):"—"}</td>
                      {people.map(p=>{
                        const h=getH(p.id,pr.id),ck=`${pr.id}_${p.id}`,editing=editCell===ck;
                        return(<td key={p.id} onClick={()=>!editing&&setEditCell(ck)} style={{ padding:"4px 6px",border:"1px solid #e5e5e3",textAlign:"center",fontFamily:"monospace",cursor:"pointer",minWidth:54,color:h>0?"#0055CC":"#ccc",fontWeight:h>0?600:400,background:editing?"#F0FBF7":fee?"#fafafa":"#fff" }}>
                          {editing?<input autoFocus defaultValue={h||""} type="number" min="0" step="0.5"
                            onBlur={e=>{upsert(monthId,p.id,pr.id,e.target.value);setEditCell(null);}}
                            onKeyDown={e=>{if(e.key==="Enter")e.target.blur();if(e.key==="Escape")setEditCell(null);}}
                            style={{ width:46,border:"none",background:"transparent",fontFamily:"monospace",fontSize:11,textAlign:"center",outline:"2px solid #1D9E75",borderRadius:3 }}
                          />:h>0?h:"·"}
                        </td>);
                      })}
                    </tr>);
                  })}
                  <tr style={{ background:"#f5f5f3",fontWeight:700 }}>
                    <td style={{ padding:"5px 10px",border:"1px solid #e5e5e3",position:"sticky",left:0,background:"#f5f5f3",fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#888" }}>Total asignado</td>
                    <td style={{ padding:"5px 8px",border:"1px solid #e5e5e3",textAlign:"center",fontFamily:"monospace" }}>{fmt(Object.values(pTotals).reduce((a,b)=>a+b,0))}</td>
                    {people.map(p=>{ const pct=pTotals[p.id]/p.avail_h,st=occStyle(pct); return(<td key={p.id} style={{ padding:"5px 6px",border:"1px solid #e5e5e3",textAlign:"center",background:pTotals[p.id]>0?st.bg:"#f5f5f3",color:pTotals[p.id]>0?st.fg:"#aaa",fontFamily:"monospace",fontSize:11,fontWeight:700 }}>{pTotals[p.id]>0?fmt(pTotals[p.id]):"—"}</td>); })}
                  </tr>
                  <tr>
                    <td style={{ padding:"4px 10px",border:"1px solid #e5e5e3",position:"sticky",left:0,background:"#fff",fontSize:10,color:"#aaa" }}>Capacidad disponible</td>
                    <td style={{ padding:"4px 8px",border:"1px solid #e5e5e3",textAlign:"center",fontSize:10,color:"#aaa" }}>—</td>
                    {people.map(p=><td key={p.id} style={{ padding:"4px 6px",border:"1px solid #e5e5e3",textAlign:"center",fontFamily:"monospace",fontSize:10,color:"#aaa" }}>{p.avail_h}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>);
          })()}

          {/* Equipo */}
          {view==="equipo"&&cur&&(()=>{
            const {people,projects,getH,pTotals}=cur;
            return(<div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8 }}>
              {people.filter(p=>p.avail_h>0).map(p=>{
                const pct=pTotals[p.id]/p.avail_h,st=occStyle(pct);
                const projs=projects.map((pr,pi)=>({...pr,h:getH(p.id,pr.id),c:PC[pi%PC.length]})).filter(x=>x.h>0).sort((a,b)=>b.h-a.h);
                return(<div key={p.id} style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,padding:14 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                    <div style={{ width:34,height:34,borderRadius:"50%",background:st.bg,color:st.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>{ini(p.name)}</div>
                    <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:st.bg,color:st.fg,fontFamily:"monospace",fontWeight:700,alignSelf:"center" }}>{Math.round(pct*100)}%</span>
                  </div>
                  <div style={{ fontWeight:600,fontSize:13,marginBottom:2 }}>{p.name}</div>
                  <div style={{ fontSize:10,color:"#aaa",marginBottom:10 }}>{team==="PD"?"Producto Digital":"Marketing"}</div>
                  <div style={{ height:4,borderRadius:2,background:"#f0f0ee",overflow:"hidden",marginBottom:5 }}>
                    <div style={{ height:"100%",borderRadius:2,width:`${Math.min(pct*100,100)}%`,background:st.bar }}/>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"#888",fontFamily:"monospace",marginBottom:10 }}>
                    <span>{fmt(pTotals[p.id])} HH asig.</span><span>{p.avail_h} HH disp.</span>
                  </div>
                  <div style={{ fontSize:10,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em",marginBottom:5,fontWeight:600 }}>Proyectos</div>
                  {projs.length?projs.map(pr=>(
                    <div key={pr.id} style={{ display:"flex",alignItems:"center",gap:5,padding:"3px 0",fontSize:11,borderBottom:"1px solid #f5f5f3" }}>
                      <div style={{ width:6,height:6,borderRadius:"50%",background:pr.c,flexShrink:0 }}/>
                      <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{pr.name}</span>
                      <span style={{ fontFamily:"monospace",color:"#888",fontSize:10 }}>{pr.h}h</span>
                    </div>
                  )):<span style={{ fontSize:11,color:"#ccc" }}>Sin proyectos asignados</span>}
                </div>);
              })}
            </div>);
          })()}

          {/* Proyectos */}
          {view==="proyectos"&&cur&&(()=>{
            const {people,projects,getH,pTotals}=cur;
            return(<div style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,overflow:"hidden" }}>
              {projects.map((p,pi)=>{
                const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0);
                const assigned=people.filter(pe=>getH(pe.id,p.id)>0);
                const tC={fee:["#EAF3DE","#3B6D11"],proyecto:["#E6F1FB","#0C447C"],interno:["#f0f0ee","#888"]}[p.type];
                return(<div key={p.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid #f5f5f3",fontSize:12 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:PC[pi%PC.length],flexShrink:0 }}/>
                  <span style={{ flex:1,fontWeight:500 }}>{p.name}</span>
                  <span style={{ fontSize:10,padding:"2px 8px",borderRadius:10,background:tC[0],color:tC[1] }}>{p.type}</span>
                  <div style={{ display:"flex" }}>
                    {assigned.slice(0,5).map(pe=>{ const st=occStyle(pTotals[pe.id]/pe.avail_h); return(<div key={pe.id} title={pe.name} style={{ width:20,height:20,borderRadius:"50%",background:st.bg,color:st.fg,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",marginRight:-4,border:"1.5px solid #fff" }}>{ini(pe.name)}</div>); })}
                    {assigned.length>5&&<span style={{ fontSize:10,color:"#aaa",marginLeft:10,alignSelf:"center" }}>+{assigned.length-5}</span>}
                  </div>
                  <span style={{ fontFamily:"monospace",color:"#888",minWidth:44,textAlign:"right" }}>{tot>0?fmt(tot)+"h":"—"}</span>
                </div>);
              })}
            </div>);
          })()}

          {/* Nuevo mes */}
          {view==="nuevo"&&(
            <div style={{ maxWidth:440 }}>
              <div style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,padding:"20px 24px" }}>
                <div style={{ fontWeight:600,fontSize:14,marginBottom:16 }}>
                  <i className="ti ti-calendar-plus" style={{ fontSize:15,marginRight:7,verticalAlign:-2,color:"#1D9E75" }}/>Crear nuevo mes — {team}
                </div>
                <div style={{ display:"flex",gap:10,marginBottom:12 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ display:"block",fontSize:11,color:"#888",marginBottom:4 }}>Mes</label>
                    <select value={nm.month} onChange={e=>setNm(m=>({...m,month:e.target.value}))} style={{ width:"100%",padding:"7px 8px",border:"1px solid #d5d5d3",borderRadius:6,fontSize:12 }}>
                      {MN.map((mn,i)=><option key={i} value={i+1}>{mn}</option>)}
                    </select>
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ display:"block",fontSize:11,color:"#888",marginBottom:4 }}>Año</label>
                    <input value={nm.year} onChange={e=>setNm(m=>({...m,year:e.target.value}))} type="number" style={{ width:"100%",padding:"7px 8px",border:"1px solid #d5d5d3",borderRadius:6,fontSize:12,boxSizing:"border-box" }}/>
                  </div>
                </div>
                <div style={{ display:"flex",gap:10,marginBottom:12 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ display:"block",fontSize:11,color:"#888",marginBottom:4 }}>Días laborales</label>
                    <input value={nm.days} onChange={e=>setNm(m=>({...m,days:e.target.value}))} type="number" min="1" max="23" style={{ width:"100%",padding:"7px 8px",border:"1px solid #d5d5d3",borderRadius:6,fontSize:12,boxSizing:"border-box" }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ display:"block",fontSize:11,color:"#888",marginBottom:4 }}>Copiar fees desde</label>
                    <select value={nm.copyFrom} onChange={e=>setNm(m=>({...m,copyFrom:e.target.value}))} style={{ width:"100%",padding:"7px 8px",border:"1px solid #d5d5d3",borderRadius:6,fontSize:12 }}>
                      <option value="">Desde cero</option>
                      {months.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ background:"#E1F5EE",border:"1px solid #9FE1CB",borderRadius:6,padding:"8px 10px",fontSize:11,color:"#085041",marginBottom:16 }}>
                  <i className="ti ti-info-circle" style={{ fontSize:13,marginRight:5,verticalAlign:-2 }}/>Los proyectos <strong>fee</strong> y disponibilidad se copian automáticamente si seleccionas un mes origen.
                </div>
                <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                  <button onClick={()=>setView("dashboard")} style={{ padding:"6px 12px",fontSize:12,border:"1px solid #d5d5d3",borderRadius:6,cursor:"pointer",background:"#fff",color:"#666" }}>Cancelar</button>
                  <button onClick={createMonth} style={{ padding:"6px 16px",fontSize:12,fontWeight:600,background:"#1D9E75",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                    <i className="ti ti-check" style={{ fontSize:13 }}/>Crear mes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
