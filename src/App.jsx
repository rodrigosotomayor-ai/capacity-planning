import { useState, useEffect, useCallback } from "react";

const SB_URL = "https://ybowftbdwtxzatfsdzot.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlib3dmdGJkd3R4emF0ZnNkem90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTE0NTksImV4cCI6MjA5NDE4NzQ1OX0.F0rX051XIfqUQulhhb0J0oOSeVypFPt99xpfeA2A4lY";

// ── Auth ──────────────────────────────────────────────────────────────────────
const AUTH_URL = `${SB_URL}/auth/v1`;
const SESSION_KEY = "cap_session";

function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!s || !s.access_token) return null;
    // Check expiry (expires_at is unix timestamp in seconds)
    if (s.expires_at && Date.now() / 1000 > s.expires_at - 60) return null;
    return s;
  } catch { return null; }
}
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession()  { localStorage.removeItem(SESSION_KEY); }

async function signIn(email, password) {
  const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "Credenciales incorrectas");
  return data;
}

async function refreshSession(refresh_token) {
  const res = await fetch(`${AUTH_URL}/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) return null;
  return res.json();
}



// ── Supabase REST client ──────────────────────────────────────────────────────
function db(table) {
  const h = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" };
  const base = `${SB_URL}/rest/v1/${table}`;
  return {
    select:  (filter="")    => fetch(`${base}?select=*${filter ? "&"+filter : ""}`, { headers: h }).then(r => r.json()),
    insert:  (d)            => fetch(base, { method:"POST", headers:{...h,Prefer:"return=representation"}, body:JSON.stringify(d) }).then(r => r.json()),
    upsert:  (d)            => fetch(base, { method:"POST", headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"}, body:JSON.stringify(d) }).then(r => r.json()),
    update:  (filter, d)    => fetch(`${base}?${filter}`, { method:"PATCH", headers:{...h,Prefer:"return=representation"}, body:JSON.stringify(d) }).then(r => r.json()),
    remove:  (filter)       => fetch(`${base}?${filter}`, { method:"DELETE", headers: h }),
  };
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const A = "#3912FA";
const glass   = { background:"rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:16 };
const glassHi = { background:"rgba(57,18,250,0.12)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(57,18,250,0.35)", borderRadius:16 };
const T = { p:"#fff", m:"rgba(255,255,255,0.55)", d:"rgba(255,255,255,0.28)" };
const BP  = { background:A, color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Montserrat,sans-serif", display:"inline-flex", alignItems:"center", gap:6 };
const BG  = { background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"Montserrat,sans-serif", display:"inline-flex", alignItems:"center", gap:6 };
const BRed = { background:"rgba(255,71,87,0.12)", color:"#FF4757", border:"1px solid rgba(255,71,87,0.3)", borderRadius:8, padding:"6px 10px", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Montserrat,sans-serif", display:"inline-flex", alignItems:"center", gap:5 };
const INP = { background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"#fff", padding:"8px 12px", fontSize:12, fontFamily:"Montserrat,sans-serif", outline:"none", width:"100%" };
const SEL = { background:"rgba(10,8,30,0.85)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"#fff", padding:"8px 10px", fontSize:12, fontFamily:"Montserrat,sans-serif", outline:"none", width:"100%" };

// ── Helpers ───────────────────────────────────────────────────────────────────
const ini   = n => n.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
const fmt   = n => Math.round(n*10)/10;
const pct   = (a,b) => b>0 ? Math.round(a/b*100) : 0;
const PC    = [A,"#00D2FF","#FF4757","#FFA502","#2ED573","#FF6B81","#70A1FF","#5352ED","#ECCC68","#7BED9F","#FF9FF3","#54A0FF"];
const MN    = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TYPE_LABELS = { proyecto:"Proyecto", fee:"Fee mensual", interno:"Interno" };

function oc(p){ if(p>1) return"#FF4757"; if(p>=.85) return"#FFA502"; if(p>=.5) return"#2ED573"; return"rgba(255,255,255,0.25)"; }
function ob(p){ if(p>1) return"rgba(255,71,87,0.15)"; if(p>=.85) return"rgba(255,165,2,0.15)"; if(p>=.5) return"rgba(46,213,115,0.15)"; return"rgba(255,255,255,0.05)"; }

// ── SVG Charts ────────────────────────────────────────────────────────────────
function DonutChart({ segments, size=140, label, sublabel }) {
  const r=52, cx=size/2, cy=size/2, sw=14;
  let cum=-90;
  const total=segments.reduce((s,x)=>s+x.value,0);
  if(!total) return <svg width={size} height={size}><circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>{label&&<text x={cx} y={cy+6} textAnchor="middle" fill={T.m} fontSize={13} fontFamily="Montserrat">Sin datos</text>}</svg>;
  const arcs=segments.map(seg=>{
    const ang=seg.value/total*360, start=cum, end=cum+ang-1; cum+=ang;
    const p2c=a=>({x:cx+r*Math.cos(a*Math.PI/180),y:cy+r*Math.sin(a*Math.PI/180)});
    const s=p2c(start),e=p2c(end),large=ang>180?1:0;
    return{...seg,d:`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`};
  });
  return(
    <svg width={size} height={size} style={{overflow:"visible"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
      {arcs.map((a,i)=><path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="round"/>)}
      {label&&<text x={cx} y={cy-6} textAnchor="middle" fill="#fff" fontSize={20} fontWeight={700} fontFamily="Montserrat">{label}</text>}
      {sublabel&&<text x={cx} y={cy+14} textAnchor="middle" fill={T.m} fontSize={10} fontFamily="Montserrat">{sublabel}</text>}
    </svg>
  );
}

function HBar({ data }) {
  if(!data.length) return null;
  const max=Math.max(...data.map(d=>d.value),100), rh=28;
  return(
    <svg width="100%" height={data.length*rh+4} style={{overflow:"visible"}}>
      {data.map((d,i)=>{
        const col=oc(d.value/100),y=i*rh;
        return(<g key={i} transform={`translate(0,${y})`}>
          <rect x={0} y={6} width="100%" height={rh-8} rx={3} fill="rgba(255,255,255,0.04)"/>
          <rect x={0} y={6} width={`${Math.min(d.value/max*100,100)}%`} height={rh-8} rx={3} fill={col} opacity={0.65}/>
          <text x={7} y={rh-5} fill="#fff" fontSize={10} fontFamily="Montserrat" fontWeight={600}>{d.label}</text>
          <text x="99%" y={rh-5} fill={col} fontSize={10} fontFamily="Montserrat" fontWeight={700} textAnchor="end">{d.value}%</text>
        </g>);
      })}
    </svg>
  );
}

function TrendLine({ points, w=300, h=80 }) {
  if(!points||points.length<2) return <div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",color:T.d,fontSize:11}}>Sin suficientes meses</div>;
  const maxY=Math.max(...points.map(p=>p.y),100);
  const sx=(i)=>(i/(points.length-1))*(w-20)+10;
  const sy=(v)=>h-10-((v/maxY))*(h-20);
  const d=points.map((p,i)=>`${i===0?"M":"L"} ${sx(i)} ${sy(p.y)}`).join(" ");
  return(
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A} stopOpacity={0.3}/><stop offset="100%" stopColor={A} stopOpacity={0}/></linearGradient></defs>
      <path d={`${d} L ${sx(points.length-1)} ${h} L ${sx(0)} ${h} Z`} fill="url(#tg)"/>
      <path d={d} fill="none" stroke={A} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((p,i)=>(<g key={i}><circle cx={sx(i)} cy={sy(p.y)} r={3} fill={A}/><text x={sx(i)} y={sy(p.y)-8} textAnchor="middle" fill={T.m} fontSize={9} fontFamily="Montserrat">{p.label}</text></g>))}
    </svg>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, width=440, children }) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}} onClick={onClose}>
      <div style={{...glass,padding:26,width,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <span style={{color:T.p,fontWeight:700,fontSize:15}}>{title}</span>
          <button onClick={onClose} style={{...BG,padding:"4px 9px"}}><i className="ti ti-x"/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>{children}</label>;
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session,  setSession]  = useState(getSession);
  const [phase,    setPhase]    = useState("loading");
  const [data,     setData]     = useState(null);
  const [err,      setErr]      = useState(null);
  const [view,     setView]     = useState("dashboard");
  const [sub,      setSub]      = useState("grid");
  const [team,     setTeam]     = useState("PD");
  const [monthId,  setMonthId]  = useState(null);
  const [editCell, setEditCell] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [modal,    setModal]    = useState(null);
  const [toast,    setToast]    = useState(null);
  const [nm,       setNm]       = useState({year:"2026",month:"7",days:"20",copyFrom:""});

  // ── Notify helper ─────────────────────────────────────────────────────────
  function notify(msg, type="ok") {
    setToast({msg, type});
    setTimeout(()=>setToast(null), 3000);
  }

  // ── Load all data ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setPhase("loading");
    try {
      const [teams,people,projects,months,avail,allocs] = await Promise.all([
        db("cap_teams").select(),
        db("cap_people").select(),
        db("cap_projects").select(),
        db("cap_months").select(),
        db("cap_availability").select(),
        db("cap_allocations").select(),
      ]);
      if(teams.message) throw new Error(teams.message);
      setData({teams,people,projects,months,avail,allocs});
      // Set default month: latest PD month
      const pdId=teams.find(t=>t.slug==="PD")?.id;
      const pdM=months.filter(m=>m.team_id===pdId).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);
      setMonthId(prev => prev || pdM[0]?.id || null);
      setPhase("app");
    } catch(e) { setErr(e.message); setPhase("error"); }
  }, []);

  useEffect(() => {
    const s = getSession();
    if (s) { setSession(s); load(); }
    else    { setPhase("login"); }
  }, []);

  async function handleLogin(email, password) {
    try {
      const s = await signIn(email, password);
      saveSession(s);
      setSession(s);
      await load();
    } catch(e) { throw e; }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setPhase("login");
  }

  // ── Derived: current month data ───────────────────────────────────────────
  // KEY FIX: always returns ALL active team people, not just those with avail records
  function md() {
    if(!data||!monthId) return null;
    const teamObj=data.teams.find(t=>t.slug===team);
    if(!teamObj) return null;
    const month=data.months.find(m=>m.id===monthId);
    if(!month||month.team_id!==teamObj.id) return null;

    // ALL active people on this team
    const teamPeople=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active);
    // Enrich with avail for this month (fallback to default_hours if no record)
    const people=teamPeople.map(p=>{
      const avRec=data.avail.find(a=>a.month_id===monthId&&a.person_id===p.id);
      return{...p, avail_h: avRec ? avRec.available_hours : p.default_hours, avail_id: avRec?.id||null};
    });

    const projects=data.projects.filter(p=>p.team_id===teamObj.id&&p.is_active);
    const allocs=data.allocs.filter(a=>a.month_id===monthId);
    const getH=(pid,projId)=>{const a=allocs.find(x=>x.person_id===pid&&x.project_id===projId);return a?parseFloat(a.hours):0;};
    const pTotals=Object.fromEntries(people.map(p=>[p.id,allocs.filter(a=>a.person_id===p.id).reduce((s,a)=>s+parseFloat(a.hours),0)]));
    const isMonthEmpty=data.avail.filter(a=>a.month_id===monthId).length===0;
    return{teamObj,month,people,projects,allocs,getH,pTotals,isMonthEmpty};
  }

  function teamMonths() {
    if(!data) return [];
    const tid=data.teams.find(t=>t.slug===team)?.id;
    return data.months.filter(m=>m.team_id===tid).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);
  }

  function monthDot(mId) {
    if(!data) return "rgba(255,255,255,0.2)";
    const tid=data.teams.find(t=>t.slug===team)?.id;
    const month=data.months.find(m=>m.id===mId);
    if(!month||month.team_id!==tid) return "rgba(255,255,255,0.1)";
    const av=data.avail.filter(a=>a.month_id===mId);
    if(!av.length) return "rgba(255,255,255,0.2)"; // no data
    const sold=av.reduce((s,a)=>s+data.allocs.filter(x=>x.person_id===a.person_id&&x.month_id===mId).reduce((ss,x)=>ss+parseFloat(x.hours),0),0);
    const disp=av.reduce((s,a)=>s+a.available_hours,0);
    return oc(disp>0?sold/disp:0);
  }

  // ── Initialize month: create avail records for all team people ────────────
  async function initializeMonth(mId, teamObj) {
    setSaving(true);
    try {
      const teamPeople=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active);
      const existing=data.avail.filter(a=>a.month_id===mId).map(a=>a.person_id);
      const toCreate=teamPeople.filter(p=>!existing.includes(p.id));
      const results=[];
      for(const p of toCreate) {
        const res=await db("cap_availability").insert({month_id:mId,person_id:p.id,available_hours:p.default_hours});
        if(res[0]) results.push(res[0]);
      }
      setData(d=>({...d,avail:[...d.avail,...results]}));
      notify(`✓ Mes inicializado con ${toCreate.length} personas`);
    } finally { setSaving(false); }
  }

  // ── Upsert allocation (auto-creates avail if needed) ──────────────────────
  async function upsertAlloc(mid, pid, projId, hours) {
    const h=parseFloat(hours)||0;
    setSaving(true);
    // Auto-create avail record if person has none for this month
    let newAvailRec=null;
    const hasAvail=data.avail.find(a=>a.month_id===mid&&a.person_id===pid);
    if(!hasAvail) {
      const person=data.people.find(p=>p.id===pid);
      const res=await db("cap_availability").insert({month_id:mid,person_id:pid,available_hours:person?.default_hours||160});
      if(res[0]) newAvailRec=res[0];
    }
    // Optimistic update
    setData(d=>{
      const newAvail=newAvailRec ? [...d.avail,newAvailRec] : d.avail;
      const rest=d.allocs.filter(a=>!(a.month_id===mid&&a.person_id===pid&&a.project_id===projId));
      if(h>0) rest.push({id:"_tmp",month_id:mid,person_id:pid,project_id:projId,hours:h});
      return{...d,avail:newAvail,allocs:rest};
    });
    try {
      if(h>0) {
        const res=await db("cap_allocations").upsert({month_id:mid,person_id:pid,project_id:projId,hours:h,updated_at:new Date().toISOString()});
        if(res[0]) setData(d=>({...d,allocs:d.allocs.map(a=>a.id==="_tmp"?res[0]:a)}));
      } else {
        await db("cap_allocations").remove(`month_id=eq.${mid}&person_id=eq.${pid}&project_id=eq.${projId}`);
        setData(d=>({...d,allocs:d.allocs.filter(a=>!(a.month_id===mid&&a.person_id===pid&&a.project_id===projId))}));
      }
    } finally { setSaving(false); }
  }

  // ── Update available hours for a person in a month ────────────────────────
  async function updateAvailHours(mid, pid, hours) {
    const h=parseInt(hours)||0;
    setSaving(true);
    const existing=data.avail.find(a=>a.month_id===mid&&a.person_id===pid);
    try {
      if(existing) {
        await db("cap_availability").update(`id=eq.${existing.id}`,{available_hours:h});
        setData(d=>({...d,avail:d.avail.map(a=>a.id===existing.id?{...a,available_hours:h}:a)}));
      } else {
        const res=await db("cap_availability").insert({month_id:mid,person_id:pid,available_hours:h});
        if(res[0]) setData(d=>({...d,avail:[...d.avail,res[0]]}));
      }
    } finally { setSaving(false); }
  }

  // ── Toggle person in month (add/remove from avail) ────────────────────────
  async function togglePersonInMonth(mid, person, include) {
    setSaving(true);
    try {
      if(include) {
        const res=await db("cap_availability").insert({month_id:mid,person_id:person.id,available_hours:person.default_hours});
        if(res[0]) setData(d=>({...d,avail:[...d.avail,res[0]]}));
        notify(`✓ ${person.name} agregado al mes`);
      } else {
        await db("cap_availability").remove(`month_id=eq.${mid}&person_id=eq.${person.id}`);
        // Also remove their allocs for this month
        await db("cap_allocations").remove(`month_id=eq.${mid}&person_id=eq.${person.id}`);
        setData(d=>({
          ...d,
          avail:d.avail.filter(a=>!(a.month_id===mid&&a.person_id===person.id)),
          allocs:d.allocs.filter(a=>!(a.month_id===mid&&a.person_id===person.id)),
        }));
        notify(`✓ ${person.name} removido del mes`);
      }
    } finally { setSaving(false); }
  }

  // ── Project CRUD ──────────────────────────────────────────────────────────
  async function saveProject(proj) {
    setSaving(true);
    try {
      if(proj.id) {
        const res=await db("cap_projects").update(`id=eq.${proj.id}`,{name:proj.name,type:proj.type});
        if(res[0]) { setData(d=>({...d,projects:d.projects.map(p=>p.id===proj.id?res[0]:p)})); notify("✓ Proyecto actualizado"); }
      } else {
        const teamId=data.teams.find(t=>t.slug===team)?.id;
        const res=await db("cap_projects").insert({name:proj.name,type:proj.type,team_id:teamId,is_active:true});
        if(res[0]) { setData(d=>({...d,projects:[...d.projects,res[0]]})); notify("✓ Proyecto creado"); }
      }
      setModal(null);
    } finally { setSaving(false); }
  }

  async function deactivateProject(projId) {
    if(!confirm("¿Archivar este proyecto? Desaparecerá de la grilla pero se conservan los datos históricos.")) return;
    await db("cap_projects").update(`id=eq.${projId}`,{is_active:false});
    setData(d=>({...d,projects:d.projects.map(p=>p.id===projId?{...p,is_active:false}:p)}));
    notify("✓ Proyecto archivado");
  }

  // ── People CRUD ───────────────────────────────────────────────────────────
  async function savePerson(person) {
    setSaving(true);
    try {
      const teamId=data.teams.find(t=>t.slug===team)?.id;
      if(person.id) {
        const res=await db("cap_people").update(`id=eq.${person.id}`,{name:person.name,role:person.role,initials:person.initials||ini(person.name),default_hours:parseInt(person.default_hours)||160});
        if(res[0]) setData(d=>({...d,people:d.people.map(p=>p.id===person.id?res[0]:p)}));
        notify("✓ Persona actualizada");
      } else {
        const res=await db("cap_people").insert({name:person.name,role:person.role,initials:person.initials||ini(person.name),team_id:teamId,default_hours:parseInt(person.default_hours)||160,is_active:true});
        if(res[0]) {
          setData(d=>({...d,people:[...d.people,res[0]]}));
          // Auto-add to current month
          if(monthId) {
            const av=await db("cap_availability").insert({month_id:monthId,person_id:res[0].id,available_hours:parseInt(person.default_hours)||160});
            if(av[0]) setData(d=>({...d,avail:[...d.avail,av[0]]}));
          }
          notify("✓ Persona agregada al equipo y al mes actual");
        }
      }
      setModal(null);
    } finally { setSaving(false); }
  }

  async function deactivatePerson(id, name) {
    if(!confirm(`¿Desactivar a ${name}? Dejará de aparecer en nuevos meses pero se conservan sus datos históricos.`)) return;
    await db("cap_people").update(`id=eq.${id}`,{is_active:false});
    setData(d=>({...d,people:d.people.map(p=>p.id===id?{...p,is_active:false}:p)}));
    notify("✓ Persona desactivada");
  }

  // ── Month CRUD ────────────────────────────────────────────────────────────
  async function createMonth() {
    if(!data) return;
    const teamObj=data.teams.find(t=>t.slug===team);
    const label=`${MN[parseInt(nm.month)-1]} ${nm.year}`;
    setSaving(true);
    try {
      const res=await db("cap_months").insert({team_id:teamObj.id,year:parseInt(nm.year),month_num:parseInt(nm.month),label,work_days:parseInt(nm.days)});
      if(!res[0]) { notify("Error al crear mes","err"); return; }
      const newId=res[0].id;
      const newAvails=[], newAllocs=[];
      if(nm.copyFrom) {
        // Copy availability
        const prevAvails=data.avail.filter(a=>a.month_id===nm.copyFrom);
        for(const a of prevAvails){
          const r=await db("cap_availability").insert({month_id:newId,person_id:a.person_id,available_hours:a.available_hours});
          if(r[0]) newAvails.push(r[0]);
        }
        // Copy fee allocations
        const feeIds=data.projects.filter(p=>p.team_id===teamObj.id&&p.type==="fee").map(p=>p.id);
        const fees=data.allocs.filter(a=>a.month_id===nm.copyFrom&&feeIds.includes(a.project_id));
        for(const a of fees){
          const r=await db("cap_allocations").insert({month_id:newId,person_id:a.person_id,project_id:a.project_id,hours:a.hours});
          if(r[0]) newAllocs.push(r[0]);
        }
      } else {
        // Initialize with all active team people at default hours
        const teamPeople=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active);
        for(const p of teamPeople){
          const r=await db("cap_availability").insert({month_id:newId,person_id:p.id,available_hours:p.default_hours});
          if(r[0]) newAvails.push(r[0]);
        }
      }
      setData(d=>({...d,months:[...d.months,res[0]],avail:[...d.avail,...newAvails],allocs:[...d.allocs,...newAllocs]}));
      setMonthId(newId);
      setView("matrix");
      setSub("grid");
      notify(`✓ Mes ${label} creado`);
    } finally { setSaving(false); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if(phase==="login") return <LoginScreen onLogin={handleLogin}/>;
  if(phase==="loading") return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",gap:12,color:T.m,fontSize:14}}>
      <i className="ti ti-loader-2" style={{fontSize:24,color:A}}/> Cargando capacity app...
    </div>
  );
  if(phase==="error") return(
    <div style={{maxWidth:500,margin:"60px auto",...glass,padding:28}}>
      <p style={{fontWeight:700,color:"#FF4757",marginBottom:8,fontSize:15}}>Error de conexión</p>
      <pre style={{color:T.m,fontSize:12,whiteSpace:"pre-wrap",marginBottom:16}}>{err}</pre>
      <button onClick={load} style={BP}>Reintentar</button>
    </div>
  );

  const cur=md();
  const months=teamMonths();
  const teamPeopleActive=data.people.filter(p=>p.team_id===data.teams.find(t=>t.slug===team)?.id&&p.is_active);

  // ── Sub-components ────────────────────────────────────────────────────────
  const NavItem=({id,icon,label})=>(
    <button onClick={()=>setView(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:view===id?"rgba(57,18,250,0.22)":"transparent",border:"1px solid "+(view===id?"rgba(57,18,250,0.4)":"transparent"),borderRadius:8,cursor:"pointer",fontSize:12,color:view===id?"#fff":T.m,fontWeight:view===id?700:400,width:"100%",textAlign:"left",marginBottom:2,fontFamily:"Montserrat,sans-serif"}}>
      <i className={`ti ti-${icon}`} style={{fontSize:15,color:view===id?A:T.d}}/>{label}
    </button>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return(
    <div style={{display:"flex",height:"calc(100vh - 32px)",gap:12,position:"relative"}}>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",bottom:24,right:24,zIndex:200,...glass,padding:"12px 18px",borderColor:toast.type==="err"?"rgba(255,71,87,0.4)":"rgba(46,213,115,0.4)",background:toast.type==="err"?"rgba(255,71,87,0.12)":"rgba(46,213,115,0.1)",fontSize:13,color:"#fff",fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
          <i className={`ti ti-${toast.type==="err"?"alert-circle":"circle-check"}`} style={{color:toast.type==="err"?"#FF4757":"#2ED573",fontSize:16}}/>{toast.msg}
        </div>
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <div style={{...glass,width:200,display:"flex",flexDirection:"column",padding:"16px 10px",flexShrink:0}}>
        <div style={{padding:"4px 8px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
          <div style={{fontWeight:800,fontSize:16,color:"#fff",letterSpacing:-.5}}>capacity<span style={{color:A}}>.</span></div>
          <div style={{fontSize:10,color:T.d,marginTop:2,fontWeight:700,letterSpacing:".06em"}}>AGENCIA DIGITAL</div>
        </div>

        {/* Team switch */}
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {["PD","MKT"].map(t=>(
            <button key={t} onClick={()=>{
              setTeam(t);
              const tid=data.teams.find(x=>x.slug===t)?.id;
              const tm=data.months.filter(m=>m.team_id===tid).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);
              if(tm[0]) setMonthId(tm[0].id);
            }} style={{flex:1,padding:"6px 0",fontSize:11,fontWeight:700,borderRadius:8,cursor:"pointer",background:team===t?A:"rgba(255,255,255,0.06)",border:"1px solid "+(team===t?A:"rgba(255,255,255,0.1)"),color:team===t?"#fff":T.m,fontFamily:"Montserrat,sans-serif"}}>
              {t}
            </button>
          ))}
        </div>

        <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6,paddingLeft:4}}>Vistas</div>
        <NavItem id="dashboard"  icon="chart-bar"   label="Dashboard"/>
        <NavItem id="matrix"     icon="table"       label="Capacity"/>
        <NavItem id="equipo"     icon="users"       label="Equipo"/>
        <NavItem id="proyectos"  icon="briefcase"   label="Proyectos"/>

        <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",margin:"14px 0 6px",paddingLeft:4}}>Meses</div>
        <div style={{flex:1,overflowY:"auto"}}>
          {months.length===0&&<div style={{fontSize:11,color:T.d,paddingLeft:8}}>Sin meses</div>}
          {months.map(m=>{
            const dot=monthDot(m.id);
            const noData=data.avail.filter(a=>a.month_id===m.id).length===0;
            return(
              <div key={m.id} onClick={()=>setMonthId(m.id)} style={{padding:"6px 8px",cursor:"pointer",fontSize:11,color:monthId===m.id?"#fff":T.m,fontWeight:monthId===m.id?700:400,display:"flex",alignItems:"center",gap:8,background:monthId===m.id?"rgba(57,18,250,0.2)":"transparent",borderRadius:6,marginBottom:2}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:noData?"rgba(255,255,255,0.15)":dot,flexShrink:0,border:noData?"1px dashed rgba(255,255,255,0.3)":"none"}}/>
                <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label}</span>
                {noData&&<i className="ti ti-alert-circle" style={{fontSize:10,color:"#FFA502",flexShrink:0}} title="Mes sin datos"/>}
              </div>
            );
          })}
        </div>

        <button onClick={()=>setView("nuevo")} style={{...BP,width:"100%",justifyContent:"center",marginTop:8,fontSize:11}}>
          <i className="ti ti-plus" style={{fontSize:13}}/>Nuevo mes
        </button>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

        {/* Topbar */}
        <div style={{...glass,borderRadius:12,marginBottom:10,padding:"10px 18px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontWeight:800,fontSize:14,color:"#fff"}}>{{dashboard:"Dashboard",matrix:"Capacity",equipo:"Equipo",proyectos:"Proyectos",nuevo:"Nuevo mes"}[view]}</span>
          <span style={{color:T.d,fontSize:11,marginLeft:4}}>{team} · {cur?.month.label||"—"}</span>
          {saving&&<span style={{fontSize:11,color:A,marginLeft:4}}><i className="ti ti-loader-2" style={{fontSize:12,marginRight:3}}/>Guardando...</span>}
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {view==="equipo"&&<button onClick={()=>setModal({type:"editPerson",person:{name:"",role:"",initials:"",default_hours:"160"}})} style={BP}><i className="ti ti-user-plus"/>Agregar persona</button>}
            {view==="proyectos"&&<button onClick={()=>setModal({type:"editProject",project:{name:"",type:"proyecto"}})} style={BP}><i className="ti ti-plus"/>Nuevo proyecto</button>}
            <button onClick={load} style={BG} title="Recargar datos"><i className="ti ti-refresh"/></button>
            <button onClick={handleLogout} style={{...BG,borderColor:"rgba(255,71,87,0.25)",color:"rgba(255,71,87,0.7)"}} title="Cerrar sesión"><i className="ti ti-logout"/></button>
          </div>
        </div>

        {/* Sub-tabs for matrix */}
        {view==="matrix"&&(
          <div style={{display:"flex",gap:4,marginBottom:10,flexShrink:0}}>
            {[["grid","table","Grilla de horas"],["cards","layout-grid","Resumen"],["config","settings","Configurar mes"]].map(([id,icon,lbl])=>(
              <button key={id} onClick={()=>setSub(id)} style={{...(sub===id?BP:BG),fontSize:11}}>
                <i className={`ti ti-${icon}`}/>{lbl}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",paddingRight:2}}>

          {/* ── DASHBOARD ──────────────────────────────────────────────────── */}
          {view==="dashboard"&&cur&&(()=>{
            const{people,projects,getH,pTotals}=cur;
            const tSold=fmt(Object.values(pTotals).reduce((a,b)=>a+b,0));
            const tDisp=people.reduce((s,p)=>s+p.avail_h,0);
            const over=people.filter(p=>p.avail_h>0&&pTotals[p.id]>p.avail_h).length;
            const valid=people.filter(p=>p.avail_h>0);
            const avgP=valid.length?Math.round(valid.map(p=>Math.min(pTotals[p.id]/p.avail_h,2)*100).reduce((a,b)=>a+b,0)/valid.length):0;
            const libre=Math.max(0,tDisp-tSold);
            const byType={proyecto:0,fee:0,interno:0};
            projects.forEach(pr=>{const tot=people.reduce((s,p)=>s+getH(p.id,pr.id),0);byType[pr.type]=(byType[pr.type]||0)+tot;});
            const donut=[{label:"Proyectos",value:byType.proyecto,color:A},{label:"Fees",value:byType.fee,color:"#2ED573"},{label:"Interno",value:byType.interno,color:"rgba(255,255,255,0.25)"}].filter(s=>s.value>0);
            const barData=[...people].filter(p=>p.avail_h>0).sort((a,b)=>(pTotals[b.id]/b.avail_h)-(pTotals[a.id]/a.avail_h)).slice(0,10).map(p=>({label:p.name.split(" ")[0],value:pct(pTotals[p.id],p.avail_h)}));
            const tid=cur.teamObj.id;
            const allM=data.months.filter(m=>m.team_id===tid).sort((a,b)=>a.year-b.year||a.month_num-b.month_num);
            const trend=allM.map(m=>{const av=data.avail.filter(a=>a.month_id===m.id);const sold=av.reduce((s,a)=>s+data.allocs.filter(x=>x.person_id===a.person_id&&x.month_id===m.id).reduce((ss,x)=>ss+parseFloat(x.hours),0),0);const disp=av.reduce((s,a)=>s+a.available_hours,0);return{label:m.label.split(" ")[0],y:disp>0?Math.round(sold/disp*100):0};});
            return(
              <div>
                {/* KPIs */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
                  {[
                    {v:tSold,l:"HH Asignadas",n:`de ${tDisp} disponibles`,c:"#fff"},
                    {v:libre,l:"HH Libres",n:`${Math.round(libre/tDisp*100)||0}% sin asignar`,c:libre>0?"#2ED573":"#FF4757"},
                    {v:`${avgP}%`,l:"Ocupación promedio",n:"objetivo 80–90%",c:oc(avgP/100)},
                    {v:over,l:"Sobreocupados",n:over>0?"requieren atención":"equipo balanceado",c:over>0?"#FF4757":"#2ED573"},
                  ].map((k,i)=>(
                    <div key={i} style={{...glass,padding:"16px 18px"}}>
                      <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{k.l}</div>
                      <div style={{fontSize:28,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
                      <div style={{fontSize:10,color:T.m,marginTop:6}}>{k.n}</div>
                    </div>
                  ))}
                </div>
                {/* Alerts: sobreocupados */}
                {people.filter(p=>p.avail_h>0&&pTotals[p.id]>p.avail_h).map((p,i)=>(
                  <div key={"ov"+i} style={{...glass,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,borderColor:"rgba(255,71,87,0.35)",background:"rgba(255,71,87,0.1)"}}>
                    <i className="ti ti-alert-triangle" style={{fontSize:16,color:"#FF4757",flexShrink:0}}/>
                    <span style={{fontSize:12,color:"#fff"}}><strong>{p.name}</strong> al {pct(pTotals[p.id],p.avail_h)}% — sobrecarga de <strong>{fmt(pTotals[p.id]-p.avail_h)} HH</strong>. Redistribuir urgente.</span>
                  </div>
                ))}
                {/* Alerts: subutilizados (< 50% ocupación, con al menos 40 HH disponibles) */}
                {people.filter(p=>p.avail_h>=40&&pTotals[p.id]/p.avail_h<0.5).map((p,i)=>{
                  const libre=fmt(p.avail_h-pTotals[p.id]);
                  const sinAsignar=pTotals[p.id]===0;
                  return(
                    <div key={"un"+i} style={{...glass,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,borderColor:"rgba(255,165,2,0.3)",background:"rgba(255,165,2,0.08)"}}>
                      <i className={`ti ti-${sinAsignar?"user-off":"trending-down"}`} style={{fontSize:16,color:"#FFA502",flexShrink:0}}/>
                      <span style={{fontSize:12,color:"#fff"}}>
                        <strong>{p.name}</strong>{sinAsignar
                          ? " — sin horas asignadas este mes. Capacidad disponible: "
                          : ` al ${pct(pTotals[p.id],p.avail_h)}% — capacidad libre: `}
                        <strong style={{color:"#FFA502"}}>{libre} HH</strong>{sinAsignar?" sin utilizar.":". Revisar asignación."}
                      </span>
                    </div>
                  );
                })}
                {/* Charts */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div style={{...glass,padding:20}}>
                    <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Distribución de horas</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
                      <DonutChart segments={donut} size={130} label={`${tSold}`} sublabel="HH total"/>
                      <div>{donut.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/><span style={{fontSize:11,color:T.m}}>{s.label}</span><span style={{fontSize:11,fontWeight:700,color:"#fff",marginLeft:"auto",paddingLeft:8}}>{fmt(s.value)}h</span></div>))}</div>
                    </div>
                  </div>
                  <div style={{...glass,padding:20,display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16,alignSelf:"flex-start"}}>Ocupación del equipo</div>
                    <DonutChart segments={[{value:avgP,color:oc(avgP/100)},{value:Math.max(0,100-avgP),color:"rgba(255,255,255,0.05)"}]} size={130} label={`${avgP}%`} sublabel="promedio"/>
                    <div style={{display:"flex",justifyContent:"space-around",width:"100%",marginTop:12}}>
                      {[["#2ED573","Óptimo","50–84%"],["#FFA502","Alto","85–100%"],["#FF4757","Sobre",">100%"]].map(([c,l,r])=>(<div key={l} style={{textAlign:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:c,margin:"0 auto 4px"}}/><div style={{fontSize:9,color:T.d}}>{l}</div><div style={{fontSize:9,color:T.d}}>{r}</div></div>))}
                    </div>
                  </div>
                  <div style={{...glass,padding:20}}>
                    <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Tendencia ocupación</div>
                    <TrendLine points={trend}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                      {trend.map((p,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:oc(p.y/100)}}>{p.y}%</div><div style={{fontSize:9,color:T.d}}>{p.label}</div></div>))}
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{...glass,padding:20}}>
                    <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Ocupación por persona</div>
                    <HBar data={barData}/>
                  </div>
                  <div style={{...glass,padding:20}}>
                    <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Proyectos activos</div>
                    {projects.map(p=>{const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0);if(!tot)return null;const tC={fee:A,proyecto:"#2ED573",interno:T.d}[p.type];return(<div key={p.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.m,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"75%"}}>{p.name}</span><span style={{fontSize:11,color:"#fff",fontWeight:700}}>{fmt(tot)}h</span></div><div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(tot/tSold*100)}%`,background:tC,borderRadius:2,opacity:.75}}/></div></div>);})}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── CAPACITY: GRID ──────────────────────────────────────────────── */}
          {view==="matrix"&&sub==="grid"&&cur&&(()=>{
            const{people,projects,getH,pTotals,isMonthEmpty}=cur;
            if(isMonthEmpty) return(
              <div style={{...glassHi,padding:28,maxWidth:540,margin:"20px auto",textAlign:"center"}}>
                <i className="ti ti-table-off" style={{fontSize:40,color:A,display:"block",marginBottom:14}}/>
                <div style={{fontWeight:700,fontSize:16,color:"#fff",marginBottom:8}}>Mes sin datos</div>
                <div style={{fontSize:13,color:T.m,marginBottom:20}}>Este mes no tiene disponibilidad configurada. Inicialízalo con el equipo actual para empezar a asignar horas.</div>
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  <button onClick={()=>initializeMonth(monthId,cur.teamObj)} style={BP}><i className="ti ti-users-plus"/>Inicializar con equipo completo</button>
                  <button onClick={()=>setSub("config")} style={BG}><i className="ti ti-settings"/>Configurar manualmente</button>
                </div>
              </div>
            );
            return(
              <div style={{...glass,overflowX:"auto"}}>
                <table style={{borderCollapse:"collapse",fontSize:11,width:"100%"}}>
                  <thead>
                    <tr>
                      <th style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.08)",borderRight:"1px solid rgba(255,255,255,0.06)",textAlign:"left",minWidth:188,position:"sticky",left:0,zIndex:3,background:"rgba(7,7,20,0.97)",fontSize:10,fontWeight:700,color:T.d,textTransform:"uppercase",letterSpacing:".06em"}}>Proyecto</th>
                      <th style={{padding:"8px 8px",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:10,fontWeight:700,color:T.d,minWidth:52,textAlign:"center",background:"rgba(7,7,20,0.97)",position:"sticky",top:0,zIndex:2}}>Total</th>
                      {people.map(p=>{
                        const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);
                        return(<th key={p.id} style={{padding:"5px 7px",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:10,fontWeight:600,color:T.m,whiteSpace:"nowrap",minWidth:62,textAlign:"center",background:ob(p2/100)||"rgba(7,7,20,0.97)"}}>
                          <div style={{color:T.m}}>{p.name.split(" ")[0]}</div>
                          <div style={{fontSize:9,color:col,fontWeight:700,marginTop:1}}>{p2}%</div>
                        </th>);
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(pr=>{
                      const rowTot=people.reduce((s,p)=>s+getH(p.id,pr.id),0);
                      const fee=pr.type!=="proyecto";
                      const dot={fee:A,proyecto:"#2ED573",interno:T.d}[pr.type];
                      return(
                        <tr key={pr.id} style={{background:fee?"rgba(255,255,255,0.02)":"transparent"}}>
                          <td style={{padding:"5px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",borderRight:"1px solid rgba(255,255,255,0.05)",position:"sticky",left:0,zIndex:1,background:fee?"rgba(7,7,28,0.97)":"rgba(7,7,20,0.97)",minWidth:188,maxWidth:188,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:fee?T.m:T.p}}>
                            <span style={{width:6,height:6,borderRadius:"50%",background:dot,display:"inline-block",marginRight:8,verticalAlign:"middle",flexShrink:0}}/>{pr.name}
                          </td>
                          <td style={{padding:"5px 8px",borderBottom:"1px solid rgba(255,255,255,0.05)",textAlign:"center",fontFamily:"monospace",color:T.d,fontSize:11}}>{rowTot>0?fmt(rowTot):"—"}</td>
                          {people.map(p=>{
                            const h=getH(p.id,pr.id),ck=`${pr.id}_${p.id}`,editing=editCell===ck;
                            return(
                              <td key={p.id} onClick={()=>!editing&&setEditCell(ck)} style={{padding:"5px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)",textAlign:"center",fontFamily:"monospace",cursor:"pointer",minWidth:62,color:h>0?"#fff":"rgba(255,255,255,0.12)",fontWeight:h>0?700:400,background:editing?"rgba(57,18,250,0.25)":"transparent",transition:"background .1s"}}>
                                {editing
                                  ? <input autoFocus defaultValue={h||""} type="number" min="0" step="0.5"
                                      onBlur={e=>{upsertAlloc(monthId,p.id,pr.id,e.target.value);setEditCell(null);}}
                                      onKeyDown={e=>{if(e.key==="Enter")e.target.blur();if(e.key==="Escape")setEditCell(null);}}
                                      style={{...INP,width:54,padding:"3px 6px",textAlign:"center"}}
                                    />
                                  : h>0?h:"·"
                                }
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {/* Totals */}
                    <tr style={{background:"rgba(57,18,250,0.08)"}}>
                      <td style={{padding:"8px 12px",position:"sticky",left:0,background:"rgba(7,7,30,0.98)",zIndex:1,fontSize:10,fontWeight:700,color:T.d,textTransform:"uppercase",letterSpacing:".05em",borderTop:"1px solid rgba(57,18,250,0.3)"}}>Total asignado</td>
                      <td style={{padding:"8px 8px",textAlign:"center",fontFamily:"monospace",color:"#fff",fontWeight:700,borderTop:"1px solid rgba(57,18,250,0.3)"}}>{fmt(Object.values(pTotals).reduce((a,b)=>a+b,0))}</td>
                      {people.map(p=>{const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);return <td key={p.id} style={{padding:"8px 6px",textAlign:"center",background:pTotals[p.id]>0?ob(p2/100):"transparent",color:pTotals[p.id]>0?col:T.d,fontFamily:"monospace",fontSize:11,fontWeight:700,borderTop:"1px solid rgba(57,18,250,0.2)"}}>{pTotals[p.id]>0?fmt(pTotals[p.id]):"—"}</td>;})}
                    </tr>
                    <tr>
                      <td style={{padding:"5px 12px",position:"sticky",left:0,background:"rgba(7,7,20,0.98)",zIndex:1,fontSize:10,color:T.d}}>Horas disponibles</td>
                      <td style={{padding:"5px 8px",textAlign:"center",fontSize:10,color:T.d}}>{people.reduce((s,p)=>s+p.avail_h,0)}</td>
                      {people.map(p=><td key={p.id} style={{padding:"5px 6px",textAlign:"center",fontFamily:"monospace",fontSize:10,color:T.d}}>{p.avail_h}</td>)}
                    </tr>
                    <tr>
                      <td style={{padding:"5px 12px",position:"sticky",left:0,background:"rgba(7,7,20,0.98)",zIndex:1,fontSize:10,color:T.d}}>Horas libres</td>
                      <td style={{padding:"5px 8px",textAlign:"center",fontSize:10,color:"#2ED573"}}>{fmt(people.reduce((s,p)=>s+Math.max(0,p.avail_h-pTotals[p.id]),0))}</td>
                      {people.map(p=>{const libre=p.avail_h-pTotals[p.id];return <td key={p.id} style={{padding:"5px 6px",textAlign:"center",fontFamily:"monospace",fontSize:10,color:libre<0?"#FF4757":libre===0?"rgba(255,255,255,0.3)":"#2ED573",fontWeight:libre<0?700:400}}>{fmt(libre)}</td>;})}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* ── CAPACITY: CARDS ─────────────────────────────────────────────── */}
          {view==="matrix"&&sub==="cards"&&cur&&(()=>{
            const{people,projects,getH,pTotals,isMonthEmpty}=cur;
            if(isMonthEmpty) return(
              <div style={{...glassHi,padding:28,maxWidth:540,margin:"20px auto",textAlign:"center"}}>
                <i className="ti ti-users-off" style={{fontSize:40,color:A,display:"block",marginBottom:14}}/>
                <div style={{fontWeight:700,fontSize:16,color:"#fff",marginBottom:8}}>Mes sin datos</div>
                <button onClick={()=>initializeMonth(monthId,cur.teamObj)} style={{...BP,margin:"0 auto"}}><i className="ti ti-users-plus"/>Inicializar mes</button>
              </div>
            );
            return(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                {people.map(p=>{
                  const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);
                  const projs=projects.map((pr,pi)=>({...pr,h:getH(p.id,pr.id),c:PC[pi%PC.length]})).filter(x=>x.h>0).sort((a,b)=>b.h-a.h);
                  return(
                    <div key={p.id} style={{...glass,padding:16}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:ob(p2/100),border:`1.5px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:col}}>{p.initials||ini(p.name)}</div>
                        <span style={{fontSize:11,padding:"3px 8px",borderRadius:20,background:ob(p2/100),color:col,fontWeight:700}}>{p2}%</span>
                      </div>
                      <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:2}}>{p.name}</div>
                      <div style={{fontSize:10,color:A,marginBottom:10,fontWeight:600}}>{p.role||"Sin cargo"}</div>
                      <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:4}}>
                        <div style={{height:"100%",borderRadius:2,width:`${Math.min(p2,100)}%`,background:col}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.d,marginBottom:10}}>
                        <span>{fmt(pTotals[p.id])} asig.</span><span>{p.avail_h} disp.</span>
                      </div>
                      {projs.length===0&&<div style={{fontSize:10,color:T.d,fontStyle:"italic"}}>Sin asignaciones</div>}
                      {projs.slice(0,4).map(pr=>(
                        <div key={pr.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:11,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:pr.c,flexShrink:0}}/>
                          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.m}}>{pr.name}</span>
                          <span style={{color:"#fff",fontSize:10,fontWeight:700}}>{pr.h}h</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ── CAPACITY: CONFIGURAR MES ────────────────────────────────────── */}
          {view==="matrix"&&sub==="config"&&cur&&(()=>{
            const{people,month,teamObj,isMonthEmpty}=cur;
            const inMonth=people.map(p=>p.id);
            const notInMonth=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active&&!inMonth.includes(p.id));
            return(
              <div style={{maxWidth:720}}>
                {/* Month info */}
                <div style={{...glass,padding:20,marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{month.label}</div>
                      <div style={{fontSize:11,color:T.d,marginTop:3}}>{month.work_days} días laborales · {people.length} personas en el mes</div>
                    </div>
                    {isMonthEmpty&&(
                      <button onClick={()=>initializeMonth(monthId,teamObj)} style={BP}><i className="ti ti-users-plus"/>Inicializar con equipo completo</button>
                    )}
                  </div>

                  {/* People in month — editable available hours */}
                  <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Personas en este mes</div>
                  {people.length===0&&(
                    <div style={{fontSize:12,color:T.d,padding:"12px 0",fontStyle:"italic"}}>No hay personas configuradas. Inicializa el mes o agrega personas manualmente.</div>
                  )}
                  {people.map(p=>{
                    const p2=pct((cur.pTotals[p.id]||0),p.avail_h),col=oc(p2/100);
                    return(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:ob(p2/100),border:`1px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:col,flexShrink:0}}>{p.initials||ini(p.name)}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:12,color:"#fff"}}>{p.name}</div>
                          <div style={{fontSize:10,color:A}}>{p.role||"Sin cargo"}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:11,color:T.d}}>HH disp.</span>
                          <input
                            type="number" min="0" max="240"
                            defaultValue={p.avail_h}
                            onBlur={e=>updateAvailHours(monthId,p.id,e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter")e.target.blur();}}
                            style={{...INP,width:70,textAlign:"center",padding:"5px 8px"}}
                          />
                        </div>
                        <div style={{fontSize:11,color:col,fontWeight:700,minWidth:42,textAlign:"right"}}>{p2}%</div>
                        <button onClick={()=>togglePersonInMonth(monthId,p,false)} style={{...BRed,padding:"5px 8px"}} title="Quitar del mes">
                          <i className="ti ti-user-minus"/>
                        </button>
                      </div>
                    );
                  })}

                  {/* People not in month */}
                  {notInMonth.length>0&&(
                    <div style={{marginTop:18}}>
                      <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Agregar al mes</div>
                      {notInMonth.map(p=>(
                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.d,flexShrink:0}}>{p.initials||ini(p.name)}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:12,color:T.m}}>{p.name}</div>
                            <div style={{fontSize:10,color:T.d}}>{p.role||"Sin cargo"}</div>
                          </div>
                          <button onClick={()=>togglePersonInMonth(monthId,p,true)} style={BP}>
                            <i className="ti ti-user-plus"/>Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects in month */}
                <div style={{...glass,padding:20}}>
                  <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Proyectos activos en este mes</div>
                  {cur.projects.map((pr,pi)=>{
                    const tot=people.reduce((s,p)=>s+cur.getH(p.id,pr.id),0);
                    const tC={fee:A,proyecto:"#2ED573",interno:T.d}[pr.type];
                    return(
                      <div key={pr.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                        <span style={{width:7,height:7,borderRadius:"50%",background:PC[pi%PC.length],flexShrink:0}}/>
                        <span style={{flex:1,fontSize:12,color:"#fff",fontWeight:500}}>{pr.name}</span>
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(255,255,255,0.07)",color:tC,fontWeight:600}}>{TYPE_LABELS[pr.type]}</span>
                        <span style={{fontFamily:"monospace",fontSize:11,color:tot>0?"#fff":T.d,fontWeight:700}}>{tot>0?fmt(tot)+"h":"sin horas"}</span>
                      </div>
                    );
                  })}
                  <button onClick={()=>setModal({type:"editProject",project:{name:"",type:"proyecto"}})} style={{...BG,marginTop:14,fontSize:11}}>
                    <i className="ti ti-plus"/>Nuevo proyecto
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ── EQUIPO ──────────────────────────────────────────────────────── */}
          {view==="equipo"&&cur&&(()=>{
            const{pTotals}=cur;
            return(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                {teamPeopleActive.map(p=>{
                  const tot=pTotals[p.id]??0;
                  const avH=data.avail.find(a=>a.month_id===monthId&&a.person_id===p.id)?.available_hours??p.default_hours;
                  const p2=pct(tot,avH),col=oc(p2/100);
                  return(
                    <div key={p.id} style={{...glass,padding:18}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                        <div style={{width:40,height:40,borderRadius:"50%",background:ob(p2/100),border:`1.5px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:col}}>{p.initials||ini(p.name)}</div>
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={()=>setModal({type:"editPerson",person:{...p,default_hours:String(p.default_hours)}})} style={{...BG,padding:"4px 8px",fontSize:11}} title="Editar"><i className="ti ti-pencil"/></button>
                          <button onClick={()=>deactivatePerson(p.id,p.name)} style={{...BRed,padding:"4px 8px"}} title="Desactivar"><i className="ti ti-user-minus"/></button>
                        </div>
                      </div>
                      <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:3}}>{p.name}</div>
                      <div style={{fontSize:11,color:A,marginBottom:12,fontWeight:600}}>{p.role||"Sin cargo"}</div>
                      <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:6}}>
                        <div style={{height:"100%",borderRadius:2,width:`${Math.min(p2,100)}%`,background:col}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                        <span style={{color:col,fontWeight:700}}>{p2}% ocupado</span>
                        <span style={{color:T.d}}>{avH} HH · {p.default_hours} default</span>
                      </div>
                    </div>
                  );
                })}
                {/* Empty state */}
                {teamPeopleActive.length===0&&(
                  <div style={{...glass,padding:28,textAlign:"center",gridColumn:"1/-1"}}>
                    <i className="ti ti-users-off" style={{fontSize:36,color:T.d,display:"block",marginBottom:12}}/>
                    <div style={{color:T.m,fontSize:13}}>No hay personas activas en el equipo {team}.</div>
                    <button onClick={()=>setModal({type:"editPerson",person:{name:"",role:"",initials:"",default_hours:"160"}})} style={{...BP,margin:"16px auto 0"}}>
                      <i className="ti ti-user-plus"/>Agregar primera persona
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── PROYECTOS ───────────────────────────────────────────────────── */}
          {view==="proyectos"&&cur&&(()=>{
            const{people,projects,getH,pTotals}=cur;
            return(
              <div style={glass}>
                <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Proyectos · {cur.month.label}</span>
                  <button onClick={()=>setModal({type:"editProject",project:{name:"",type:"proyecto"}})} style={{...BP,fontSize:11,padding:"6px 12px"}}>
                    <i className="ti ti-plus"/>Nuevo proyecto
                  </button>
                </div>
                {projects.length===0&&(
                  <div style={{padding:28,textAlign:"center",color:T.d,fontSize:13}}>No hay proyectos activos para el equipo {team}.</div>
                )}
                {projects.map((p,pi)=>{
                  const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0);
                  const assigned=people.filter(pe=>getH(pe.id,p.id)>0);
                  const tC={fee:[A,"rgba(57,18,250,0.12)"],proyecto:["#2ED573","rgba(46,213,115,0.1)"],interno:[T.d,"rgba(255,255,255,0.04)"]}[p.type];
                  return(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:PC[pi%PC.length],flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                        <div style={{fontSize:10,color:T.d,marginTop:1}}>{assigned.length} persona{assigned.length!==1?"s":""} asignada{assigned.length!==1?"s":""}</div>
                      </div>
                      <span style={{fontSize:10,padding:"2px 10px",borderRadius:20,background:tC[1],color:tC[0],fontWeight:700,flexShrink:0}}>{TYPE_LABELS[p.type]}</span>
                      <div style={{display:"flex",marginRight:4}}>
                        {assigned.slice(0,4).map(pe=>{const col=oc(pct(pTotals[pe.id]??0,data.avail.find(a=>a.month_id===monthId&&a.person_id===pe.id)?.available_hours??pe.default_hours)/100);return <div key={pe.id} title={pe.name} style={{width:22,height:22,borderRadius:"50%",background:ob(0.6),border:`1px solid ${col}40`,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",marginRight:-5,color:col}}>{pe.initials||ini(pe.name)}</div>;})}
                        {assigned.length>4&&<span style={{fontSize:10,color:T.d,marginLeft:12,alignSelf:"center"}}>+{assigned.length-4}</span>}
                      </div>
                      <span style={{fontFamily:"monospace",color:tot>0?"#fff":T.d,fontWeight:700,minWidth:46,textAlign:"right"}}>{tot>0?fmt(tot)+"h":"—"}</span>
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>setModal({type:"editProject",project:{...p}})} style={{...BG,padding:"4px 8px",fontSize:11}} title="Editar"><i className="ti ti-pencil"/></button>
                        <button onClick={()=>deactivateProject(p.id)} style={{...BRed,padding:"4px 8px"}} title="Archivar"><i className="ti ti-archive"/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ── NUEVO MES ───────────────────────────────────────────────────── */}
          {view==="nuevo"&&(
            <div style={{maxWidth:480}}>
              <div style={{...glass,padding:26}}>
                <div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:22}}>
                  <i className="ti ti-calendar-plus" style={{fontSize:16,marginRight:8,color:A,verticalAlign:-2}}/>Crear nuevo mes — {team}
                </div>
                <div style={{display:"flex",gap:12,marginBottom:14}}>
                  <div style={{flex:1}}><Label>Mes</Label><select value={nm.month} onChange={e=>setNm(m=>({...m,month:e.target.value}))} style={SEL}>{MN.map((mn,i)=><option key={i} value={i+1}>{mn}</option>)}</select></div>
                  <div style={{flex:1}}><Label>Año</Label><input value={nm.year} onChange={e=>setNm(m=>({...m,year:e.target.value}))} type="number" style={INP}/></div>
                </div>
                <div style={{display:"flex",gap:12,marginBottom:14}}>
                  <div style={{flex:1}}><Label>Días laborales</Label><input value={nm.days} onChange={e=>setNm(m=>({...m,days:e.target.value}))} type="number" style={INP}/></div>
                  <div style={{flex:1}}><Label>Copiar desde</Label>
                    <select value={nm.copyFrom} onChange={e=>setNm(m=>({...m,copyFrom:e.target.value}))} style={SEL}>
                      <option value="">Equipo completo (sin horas)</option>
                      {months.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{background:"rgba(57,18,250,0.12)",border:"1px solid rgba(57,18,250,0.3)",borderRadius:8,padding:"10px 14px",fontSize:11,color:T.m,marginBottom:22}}>
                  <i className="ti ti-info-circle" style={{fontSize:13,marginRight:6,verticalAlign:-2,color:A}}/>
                  {nm.copyFrom
                    ? "Se copiarán las fees mensuales, la disponibilidad de personas y el equipo completo del mes origen."
                    : "Se inicializará con todas las personas activas del equipo a sus horas por defecto. Puedes ajustar en Configurar mes."
                  }
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button onClick={()=>setView("dashboard")} style={BG}>Cancelar</button>
                  <button onClick={createMonth} style={BP}><i className="ti ti-check"/>Crear mes</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MODAL: EDIT PERSON ─────────────────────────────────────────────── */}
      {modal?.type==="editPerson"&&(
        <Modal title={modal.person.id?"Editar persona":"Agregar persona"} onClose={()=>setModal(null)}>
          <PersonForm initial={modal.person} onSave={savePerson} onCancel={()=>setModal(null)}/>
        </Modal>
      )}

      {/* ── MODAL: EDIT PROJECT ────────────────────────────────────────────── */}
      {modal?.type==="editProject"&&(
        <Modal title={modal.project.id?"Editar proyecto":"Nuevo proyecto"} onClose={()=>setModal(null)}>
          <ProjectForm initial={modal.project} onSave={saveProject} onCancel={()=>setModal(null)}/>
        </Modal>
      )}

    </div>
  );
}


// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError(null);
    try { await onLogin(email, password); }
    catch(err) { setError(err.message); setLoading(false); }
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:380,maxWidth:"92vw"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontWeight:800,fontSize:28,color:"#fff",letterSpacing:-1}}>
            capacity<span style={{color:"#3912FA"}}>.</span>app
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:6,fontWeight:500,letterSpacing:".08em"}}>AGENCIA DIGITAL</div>
        </div>

        {/* Card */}
        <div style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:20,padding:"32px 28px"}}>
          <div style={{fontWeight:700,fontSize:17,color:"#fff",marginBottom:4}}>Iniciar sesión</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:24}}>Ingresa con tu cuenta para continuar</div>

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:11,color:"rgba(255,255,255,0.55)",marginBottom:6,fontWeight:600}}>Email</label>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="usuario@agencia.com" autoFocus
                style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,color:"#fff",padding:"11px 14px",fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box",transition:"border .15s"}}
                onFocus={e=>e.target.style.borderColor="#3912FA"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.15)"}
              />
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:11,color:"rgba(255,255,255,0.55)",marginBottom:6,fontWeight:600}}>Contraseña</label>
              <input
                type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,color:"#fff",padding:"11px 14px",fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box",transition:"border .15s"}}
                onFocus={e=>e.target.style.borderColor="#3912FA"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.15)"}
              />
            </div>

            {error && (
              <div style={{background:"rgba(255,71,87,0.12)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#FF4757",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                <i className="ti ti-alert-circle" style={{fontSize:15,flexShrink:0}}/>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading||!email||!password} style={{width:"100%",padding:"12px",background:"#3912FA",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:loading||!email||!password?"not-allowed":"pointer",fontFamily:"Montserrat,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading||!email||!password?0.6:1,transition:"opacity .15s"}}>
              {loading
                ? <><i className="ti ti-loader-2" style={{fontSize:16}}/>Ingresando...</>
                : <><i className="ti ti-login" style={{fontSize:16}}/>Ingresar</>
              }
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:"rgba(255,255,255,0.2)"}}>
          ¿Necesitas acceso? Contacta al administrador.
        </div>
      </div>
    </div>
  );
}

// ── Form sub-components ───────────────────────────────────────────────────────
function PersonForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{gridColumn:"1/-1"}}>
          <Label>Nombre completo *</Label>
          <input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Ej: María González" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
        </div>
        <div>
          <Label>Cargo / Rol</Label>
          <input value={f.role||""} onChange={e=>set("role",e.target.value)} placeholder="Ej: UX Designer" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
        </div>
        <div>
          <Label>Iniciales</Label>
          <input value={f.initials||""} onChange={e=>set("initials",e.target.value)} placeholder="Ej: MG" maxLength={3} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
        </div>
        <div>
          <Label>HH disponibles por mes</Label>
          <input value={f.default_hours||"160"} onChange={e=>set("default_hours",e.target.value)} type="number" min="1" max="240" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
        </div>
      </div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginBottom:16}}>Las horas por mes son el valor por defecto. Puedes ajustarlas mes a mes en Configurar mes.</div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.55)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6}}>Cancelar</button>
        <button onClick={()=>onSave(f)} disabled={!f.name} style={{background:"#3912FA",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6,opacity:f.name?1:0.5}}>
          <i className={`ti ti-${f.id?"check":"user-plus"}`}/>{f.id?"Guardar cambios":"Agregar persona"}
        </button>
      </div>
    </div>
  );
}

function ProjectForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  const typeDescriptions = {
    proyecto: "Proyecto puntual con fecha de inicio y fin",
    fee: "Fee mensual recurrente — se copia automáticamente al crear nuevos meses",
    interno: "Gestiones internas, reuniones, administración",
  };
  return(
    <div>
      <div style={{marginBottom:14}}>
        <Label>Nombre del proyecto *</Label>
        <input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Ej: Rediseño web Copec" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
      </div>
      <div style={{marginBottom:20}}>
        <Label>Tipo</Label>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {["proyecto","fee","interno"].map(t=>(
            <div key={t} onClick={()=>set("type",t)} style={{padding:"10px 14px",borderRadius:8,border:`1px solid ${f.type===t?"#3912FA":"rgba(255,255,255,0.1)"}`,background:f.type===t?"rgba(57,18,250,0.15)":"rgba(255,255,255,0.03)",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:f.type===t?"#3912FA":"rgba(255,255,255,0.15)",border:f.type===t?"none":"1px solid rgba(255,255,255,0.2)",flexShrink:0}}/>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:f.type===t?"#fff":"rgba(255,255,255,0.55)"}}>{t==="proyecto"?"Proyecto":t==="fee"?"Fee mensual":"Interno"}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginTop:2}}>{typeDescriptions[t]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.55)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6}}>Cancelar</button>
        <button onClick={()=>onSave(f)} disabled={!f.name} style={{background:"#3912FA",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6,opacity:f.name?1:0.5}}>
          <i className={`ti ti-${f.id?"check":"plus"}`}/>{f.id?"Guardar cambios":"Crear proyecto"}
        </button>
      </div>
    </div>
  );
}
