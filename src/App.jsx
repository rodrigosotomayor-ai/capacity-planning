import { useState, useEffect } from "react";

const SB_URL = "https://ybowftbdwtxzatfsdzot.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlib3dmdGJkd3R4emF0ZnNkem90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTE0NTksImV4cCI6MjA5NDE4NzQ1OX0.F0rX051XIfqUQulhhb0J0oOSeVypFPt99xpfeA2A4lY";

function sb(table){const h={apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"};const base=`${SB_URL}/rest/v1/${table}`;return{select:()=>fetch(`${base}?select=*`,{headers:h}).then(r=>r.json()),insert:(d)=>fetch(base,{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify(d)}).then(r=>r.json()),upsert:(d)=>fetch(base,{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(d)}).then(r=>r.json()),update:(id,d)=>fetch(`${base}?id=eq.${id}`,{method:"PATCH",headers:{...h,Prefer:"return=representation"},body:JSON.stringify(d)}).then(r=>r.json()),deactivate:(id)=>fetch(`${base}?id=eq.${id}`,{method:"PATCH",headers:h,body:JSON.stringify({is_active:false})}),};}

const A="#3912FA";
const G={card:{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:16}};
const T={p:"#fff",m:"rgba(255,255,255,0.55)",d:"rgba(255,255,255,0.28)"};
const BP={background:A,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6};
const BG={background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.55)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6};
const INP={background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%"};
const SEL={background:"rgba(10,8,30,0.85)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 10px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%"};

const ini=n=>n.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
const fmt=n=>Math.round(n*10)/10;
const pct=(a,b)=>b>0?Math.round(a/b*100):0;
const PC=[A,"#00D2FF","#FF4757","#FFA502","#2ED573","#FF6B81","#70A1FF","#5352ED","#ECCC68","#7BED9F"];
const MN=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
function oc(p){if(p>1)return"#FF4757";if(p>=.85)return"#FFA502";if(p>=.5)return"#2ED573";return"rgba(255,255,255,0.25)";}
function ob(p){if(p>1)return"rgba(255,71,87,0.15)";if(p>=.85)return"rgba(255,165,2,0.15)";if(p>=.5)return"rgba(46,213,115,0.15)";return"rgba(255,255,255,0.05)";}

function DonutChart({segments,size=140,label,sublabel}){
  const r=52,cx=size/2,cy=size/2,sw=14;
  let cum=-90;
  const total=segments.reduce((s,x)=>s+x.value,0);
  if(!total)return null;
  const arcs=segments.map(seg=>{const ang=seg.value/total*360,start=cum,end=cum+ang-1;cum+=ang;const p2c=a=>({x:cx+r*Math.cos(a*Math.PI/180),y:cy+r*Math.sin(a*Math.PI/180)});const s=p2c(start),e=p2c(end),large=ang>180?1:0;return{...seg,d:`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`};});
  return(<svg width={size} height={size} style={{overflow:"visible"}}><circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>{arcs.map((a,i)=><path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="round"/>)}{label&&<text x={cx} y={cy-6} textAnchor="middle" fill="#fff" fontSize={20} fontWeight={700} fontFamily="Montserrat">{label}</text>}{sublabel&&<text x={cx} y={cy+14} textAnchor="middle" fill={T.m} fontSize={10} fontFamily="Montserrat">{sublabel}</text>}</svg>);
}

function HBarChart({data}){
  if(!data.length)return null;
  const max=Math.max(...data.map(d=>d.value),100),rh=28;
  return(<svg width="100%" height={data.length*rh+4} style={{overflow:"visible"}}>{data.map((d,i)=>{const col=oc(d.value/100),y=i*rh;return(<g key={i} transform={`translate(0,${y})`}><rect x={0} y={6} width="100%" height={rh-8} rx={3} fill="rgba(255,255,255,0.04)"/><rect x={0} y={6} width={`${Math.min(d.value/max*100,100)}%`} height={rh-8} rx={3} fill={col} opacity={0.65}/><text x={7} y={rh-5} fill="#fff" fontSize={10} fontFamily="Montserrat" fontWeight={600}>{d.label}</text><text x="99%" y={rh-5} fill={col} fontSize={10} fontFamily="Montserrat" fontWeight={700} textAnchor="end">{d.value}%</text></g>);})}</svg>);
}

function TrendLine({points,w=300,h=80}){
  if(points.length<2)return null;
  const maxY=Math.max(...points.map(p=>p.y),100);
  const sx=(i)=>(i/(points.length-1))*(w-20)+10;
  const sy=(v)=>h-10-((v/maxY))*(h-20);
  const d=points.map((p,i)=>`${i===0?"M":"L"} ${sx(i)} ${sy(p.y)}`).join(" ");
  return(<svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A} stopOpacity={0.3}/><stop offset="100%" stopColor={A} stopOpacity={0}/></linearGradient></defs><path d={`${d} L ${sx(points.length-1)} ${h} L ${sx(0)} ${h} Z`} fill="url(#tg)"/><path d={d} fill="none" stroke={A} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>{points.map((p,i)=>(<g key={i}><circle cx={sx(i)} cy={sy(p.y)} r={3} fill={A}/><text x={sx(i)} y={sy(p.y)-8} textAnchor="middle" fill={T.m} fontSize={9} fontFamily="Montserrat">{p.label}</text></g>))}</svg>);
}

function Modal({title,onClose,children}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}} onClick={onClose}><div style={{...G.card,padding:26,width:440,maxWidth:"92vw"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><span style={{color:T.p,fontWeight:700,fontSize:15}}>{title}</span><button onClick={onClose} style={{...BG,padding:"4px 9px"}}><i className="ti ti-x"/></button></div>{children}</div></div>);}

export default function App(){
  const [phase,setPhase]=useState("loading");
  const [data,setData]=useState(null);
  const [err,setErr]=useState(null);
  const [view,setView]=useState("dashboard");
  const [sub,setSub]=useState("cards");
  const [team,setTeam]=useState("PD");
  const [monthId,setMonthId]=useState(null);
  const [editCell,setEditCell]=useState(null);
  const [saving,setSaving]=useState(false);
  const [modal,setModal]=useState(null);
  const [nm,setNm]=useState({year:"2026",month:"7",days:"20",copyFrom:""});
  const [pf,setPf]=useState({name:"",role:"",initials:"",default_hours:"160"});

  useEffect(()=>{load();},[]);

  async function load(){
    setPhase("loading");
    try{
      const [teams,people,projects,months,avail,allocs]=await Promise.all([sb("cap_teams").select(),sb("cap_people").select(),sb("cap_projects").select(),sb("cap_months").select(),sb("cap_availability").select(),sb("cap_allocations").select()]);
      if(teams.message)throw new Error(teams.message);
      setData({teams,people,projects,months,avail,allocs});
      const pdId=teams.find(t=>t.slug==="PD")?.id;
      const pdM=months.filter(m=>m.team_id===pdId).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);
      if(pdM[0])setMonthId(pdM[0].id);
      setPhase("app");
    }catch(e){setErr(e.message);setPhase("error");}
  }

  async function upsertAlloc(mid,pid,projId,hours){
    const h=parseFloat(hours)||0;setSaving(true);
    setData(d=>{const rest=d.allocs.filter(a=>!(a.month_id===mid&&a.person_id===pid&&a.project_id===projId));if(h>0)rest.push({id:"_tmp",month_id:mid,person_id:pid,project_id:projId,hours:h});return{...d,allocs:rest};});
    try{await sb("cap_allocations").upsert({month_id:mid,person_id:pid,project_id:projId,hours:h,updated_at:new Date().toISOString()});}finally{setSaving(false);}
  }

  async function addPerson(){
    if(!pf.name||!data)return;
    const teamId=data.teams.find(t=>t.slug===team)?.id;
    const initials=pf.initials||ini(pf.name);
    const res=await sb("cap_people").insert({name:pf.name,role:pf.role,initials,team_id:teamId,default_hours:parseInt(pf.default_hours)||160,is_active:true});
    if(res[0]&&monthId)await sb("cap_availability").insert({month_id:monthId,person_id:res[0].id,available_hours:parseInt(pf.default_hours)||160});
    setModal(null);setPf({name:"",role:"",initials:"",default_hours:"160"});await load();
  }

  async function editPerson(id,fields){await sb("cap_people").update(id,fields);setModal(null);await load();}

  async function deactivatePerson(id){
    if(!confirm("¿Desactivar esta persona del equipo?"))return;
    await sb("cap_people").deactivate(id);await load();
  }

  async function addProject(name,type){
    if(!name||!data)return;
    const teamId=data.teams.find(t=>t.slug===team)?.id;
    const res=await sb("cap_projects").insert({name,type,team_id:teamId,is_active:true});
    if(res[0])setData(d=>({...d,projects:[...d.projects,res[0]]}));
  }

  async function createMonth(){
    if(!data)return;
    const teamId=data.teams.find(t=>t.slug===team)?.id;
    const label=`${MN[parseInt(nm.month)-1]} ${nm.year}`;
    const res=await sb("cap_months").insert({team_id:teamId,year:parseInt(nm.year),month_num:parseInt(nm.month),label,work_days:parseInt(nm.days)});
    if(!res[0])return;
    const newId=res[0].id;
    if(nm.copyFrom){
      const avails=data.avail.filter(a=>a.month_id===nm.copyFrom);
      const feeIds=data.projects.filter(p=>p.team_id===teamId&&p.type==="fee").map(p=>p.id);
      const fees=data.allocs.filter(a=>a.month_id===nm.copyFrom&&feeIds.includes(a.project_id));
      for(const a of avails)await sb("cap_availability").insert({month_id:newId,person_id:a.person_id,available_hours:a.available_hours});
      for(const a of fees)await sb("cap_allocations").insert({month_id:newId,person_id:a.person_id,project_id:a.project_id,hours:a.hours});
    }
    await load();setMonthId(newId);setView("matrix");
  }

  function md(){
    if(!data||!monthId)return null;
    const teamObj=data.teams.find(t=>t.slug===team);if(!teamObj)return null;
    const month=data.months.find(m=>m.id===monthId);if(!month)return null;
    const avails=data.avail.filter(a=>a.month_id===monthId);
    const people=avails.map(a=>({...data.people.find(p=>p.id===a.person_id),avail_h:a.available_hours})).filter(Boolean);
    const projects=data.projects.filter(p=>p.team_id===teamObj.id&&p.is_active);
    const allocs=data.allocs.filter(a=>a.month_id===monthId);
    const getH=(pid,projId)=>{const a=allocs.find(x=>x.person_id===pid&&x.project_id===projId);return a?parseFloat(a.hours):0;};
    const pTotals=Object.fromEntries(people.map(p=>[p.id,allocs.filter(a=>a.person_id===p.id).reduce((s,a)=>s+parseFloat(a.hours),0)]));
    return{teamObj,month,people,projects,allocs,getH,pTotals};
  }

  function teamMonths(){if(!data)return[];const tid=data.teams.find(t=>t.slug===team)?.id;return data.months.filter(m=>m.team_id===tid).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);}

  function monthDot(mId){if(!data)return"rgba(255,255,255,0.2)";const av=data.avail.filter(a=>a.month_id===mId);const sold=av.reduce((s,a)=>s+data.allocs.filter(x=>x.person_id===a.person_id&&x.month_id===mId).reduce((ss,x)=>ss+parseFloat(x.hours),0),0);const disp=av.reduce((s,a)=>s+a.available_hours,0);return oc(disp>0?sold/disp:0);}

  if(phase==="loading")return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",gap:12,color:T.m,fontSize:14}}><i className="ti ti-loader-2" style={{fontSize:24,color:A}}/>Conectando...</div>);
  if(phase==="error")return(<div style={{maxWidth:480,margin:"60px auto",...G.card,padding:24}}><p style={{fontWeight:700,color:"#FF4757",marginBottom:8}}>Error</p><pre style={{color:T.m,fontSize:12,whiteSpace:"pre-wrap",marginBottom:14}}>{err}</pre><button onClick={load} style={BP}>Reintentar</button></div>);

  const cur=md(),months=teamMonths();
  const teamPeople=data.people.filter(p=>p.team_id===data.teams.find(t=>t.slug===team)?.id&&p.is_active);

  const NavItem=({id,icon,label})=>(<button onClick={()=>setView(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:view===id?"rgba(57,18,250,0.22)":"transparent",border:"1px solid "+(view===id?"rgba(57,18,250,0.4)":"transparent"),borderRadius:8,cursor:"pointer",fontSize:12,color:view===id?"#fff":T.m,fontWeight:view===id?700:400,width:"100%",textAlign:"left",marginBottom:2,fontFamily:"Montserrat,sans-serif"}}><i className={`ti ti-${icon}`} style={{fontSize:15,color:view===id?A:T.d}}/>{label}</button>);

  return(
    <div style={{display:"flex",height:"calc(100vh - 32px)",gap:12}}>

      <div style={{...G.card,width:200,display:"flex",flexDirection:"column",padding:"16px 10px",flexShrink:0}}>
        <div style={{padding:"4px 8px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
          <div style={{fontWeight:800,fontSize:16,color:"#fff",letterSpacing:-.5}}>capacity<span style={{color:A}}>.</span></div>
          <div style={{fontSize:10,color:T.d,marginTop:2,fontWeight:700,letterSpacing:".06em"}}>AGENCIA DIGITAL</div>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:14}}>
          {["PD","MKT"].map(t=>(<button key={t} onClick={()=>{setTeam(t);const tm=data.months.filter(m=>m.team_id===data.teams.find(x=>x.slug===t)?.id).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);if(tm[0])setMonthId(tm[0].id);}} style={{flex:1,padding:"6px 0",fontSize:11,fontWeight:700,borderRadius:8,cursor:"pointer",background:team===t?A:"rgba(255,255,255,0.06)",border:"1px solid "+(team===t?A:"rgba(255,255,255,0.1)"),color:team===t?"#fff":T.m,fontFamily:"Montserrat,sans-serif"}}>{t}</button>))}
        </div>
        <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6,paddingLeft:4}}>Vistas</div>
        <NavItem id="dashboard" icon="chart-bar" label="Dashboard"/>
        <NavItem id="matrix" icon="table" label="Capacity"/>
        <NavItem id="equipo" icon="users" label="Equipo"/>
        <NavItem id="proyectos" icon="briefcase" label="Proyectos"/>
        <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",margin:"14px 0 6px",paddingLeft:4}}>Meses</div>
        <div style={{flex:1,overflowY:"auto"}}>
          {months.map(m=>(<div key={m.id} onClick={()=>setMonthId(m.id)} style={{padding:"6px 8px",cursor:"pointer",fontSize:11,color:monthId===m.id?"#fff":T.m,fontWeight:monthId===m.id?700:400,display:"flex",alignItems:"center",gap:8,background:monthId===m.id?"rgba(57,18,250,0.2)":"transparent",borderRadius:6,marginBottom:2}}><span style={{width:6,height:6,borderRadius:"50%",background:monthDot(m.id),flexShrink:0}}/>{m.label}</div>))}
        </div>
        <button onClick={()=>setView("nuevo")} style={{...BP,width:"100%",justifyContent:"center",marginTop:8,fontSize:11}}><i className="ti ti-plus" style={{fontSize:13}}/>Nuevo mes</button>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{...G.card,borderRadius:12,marginBottom:10,padding:"10px 18px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontWeight:800,fontSize:14,color:"#fff"}}>{{dashboard:"Dashboard",matrix:"Capacity",equipo:"Equipo",proyectos:"Proyectos",nuevo:"Nuevo mes"}[view]}</span>
          <span style={{color:T.d,fontSize:11,marginLeft:4}}>{team} · {cur?.month.label}</span>
          {saving&&<span style={{fontSize:11,color:A,marginLeft:4}}><i className="ti ti-loader-2" style={{fontSize:12,marginRight:3}}/>Guardando...</span>}
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            {view==="equipo"&&<button onClick={()=>{setPf({name:"",role:"",initials:"",default_hours:"160"});setModal("addPerson");}} style={BP}><i className="ti ti-user-plus"/>Agregar persona</button>}
            {view==="matrix"&&<button onClick={()=>{const n=prompt("Nombre del proyecto:");const t=prompt("Tipo (proyecto/fee/interno):","proyecto");if(n)addProject(n,t||"proyecto");}} style={BG}><i className="ti ti-plus"/>Proyecto</button>}
            <button onClick={load} style={BG}><i className="ti ti-refresh"/></button>
          </div>
        </div>

        {view==="matrix"&&(<div style={{display:"flex",gap:4,marginBottom:10,flexShrink:0}}>{[["cards","layout-grid","Resumen"],["grid","table","Grilla de horas"]].map(([id,icon,lbl])=>(<button key={id} onClick={()=>setSub(id)} style={{...(sub===id?BP:BG),fontSize:11}}><i className={`ti ti-${icon}`}/>{lbl}</button>))}</div>)}

        <div style={{flex:1,overflowY:"auto",paddingRight:2}}>

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
            const barData=[...people].filter(p=>p.avail_h>0).sort((a,b)=>pTotals[b.id]/b.avail_h-pTotals[a.id]/a.avail_h).slice(0,10).map(p=>({label:p.name.split(" ")[0],value:pct(pTotals[p.id],p.avail_h)}));
            const tid=cur.teamObj.id;
            const allM=data.months.filter(m=>m.team_id===tid).sort((a,b)=>a.year-b.year||a.month_num-b.month_num);
            const trend=allM.map(m=>{const av=data.avail.filter(a=>a.month_id===m.id);const sold=av.reduce((s,a)=>s+data.allocs.filter(x=>x.person_id===a.person_id&&x.month_id===m.id).reduce((ss,x)=>ss+parseFloat(x.hours),0),0);const disp=av.reduce((s,a)=>s+a.available_hours,0);return{label:m.label.split(" ")[0],y:disp>0?Math.round(sold/disp*100):0};});
            return(<div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
                {[{v:tSold,l:"HH Asignadas",n:`de ${tDisp} disponibles`,c:"#fff"},{v:libre,l:"HH Libres",n:`${Math.round(libre/tDisp*100)||0}% sin asignar`,c:libre>0?"#2ED573":"#FF4757"},{v:`${avgP}%`,l:"Ocupación promedio",n:"objetivo 80–90%",c:oc(avgP/100)},{v:over,l:"Sobreocupados",n:over>0?"requieren atención":"equipo balanceado",c:over>0?"#FF4757":"#2ED573"}].map((k,i)=>(<div key={i} style={{...G.card,padding:"16px 18px"}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{k.l}</div><div style={{fontSize:28,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div><div style={{fontSize:10,color:T.m,marginTop:6}}>{k.n}</div></div>))}
              </div>
              {people.filter(p=>p.avail_h>0&&pTotals[p.id]>p.avail_h).map((p,i)=>(<div key={i} style={{...G.card,padding:"10px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10,borderColor:"rgba(255,71,87,0.35)",background:"rgba(255,71,87,0.1)"}}><i className="ti ti-alert-triangle" style={{fontSize:16,color:"#FF4757",flexShrink:0}}/><span style={{fontSize:12,color:"#fff"}}><strong>{p.name}</strong> — {pct(pTotals[p.id],p.avail_h)}% ocupado. Sobrecarga de <strong>{fmt(pTotals[p.id]-p.avail_h)} HH</strong>.</span></div>))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                <div style={{...G.card,padding:20}}>
                  <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Distribución de horas</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
                    <DonutChart segments={donut} size={130} label={`${tSold}`} sublabel="HH total"/>
                    <div>{donut.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/><span style={{fontSize:11,color:T.m}}>{s.label}</span><span style={{fontSize:11,fontWeight:700,color:"#fff",marginLeft:"auto",paddingLeft:8}}>{fmt(s.value)}h</span></div>))}</div>
                  </div>
                </div>
                <div style={{...G.card,padding:20,display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16,alignSelf:"flex-start"}}>Ocupación del equipo</div>
                  <DonutChart segments={[{value:avgP,color:oc(avgP/100)},{value:Math.max(0,100-avgP),color:"rgba(255,255,255,0.05)"}]} size={130} label={`${avgP}%`} sublabel="promedio"/>
                  <div style={{display:"flex",justifyContent:"space-around",width:"100%",marginTop:12}}>{[["#2ED573","Óptimo","50–84%"],["#FFA502","Alto","85–100%"],["#FF4757","Sobre",">100%"]].map(([c,l,r])=>(<div key={l} style={{textAlign:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:c,margin:"0 auto 4px"}}/><div style={{fontSize:9,color:T.d}}>{l}</div><div style={{fontSize:9,color:T.d}}>{r}</div></div>))}</div>
                </div>
                <div style={{...G.card,padding:20}}>
                  <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Tendencia ocupación</div>
                  <TrendLine points={trend}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>{trend.map((p,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:oc(p.y/100)}}>{p.y}%</div><div style={{fontSize:9,color:T.d}}>{p.label}</div></div>))}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{...G.card,padding:20}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Ocupación por persona</div><HBarChart data={barData}/></div>
                <div style={{...G.card,padding:20}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Proyectos activos</div>
                  {projects.map((p)=>{const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0);if(!tot)return null;const tC={fee:A,proyecto:"#2ED573",interno:T.d}[p.type];return(<div key={p.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.m,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"75%"}}>{p.name}</span><span style={{fontSize:11,color:"#fff",fontWeight:700}}>{fmt(tot)}h</span></div><div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(tot/tSold*100)}%`,background:tC,borderRadius:2,opacity:.75}}/></div></div>);})}
                </div>
              </div>
            </div>);
          })()}

          {view==="matrix"&&sub==="cards"&&cur&&(()=>{
            const{people,projects,getH,pTotals}=cur;
            return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>{people.filter(p=>p.avail_h>0).map(p=>{const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);const projs=projects.map((pr,pi)=>({...pr,h:getH(p.id,pr.id),c:PC[pi%PC.length]})).filter(x=>x.h>0).sort((a,b)=>b.h-a.h);return(<div key={p.id} style={{...G.card,padding:16}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><div style={{width:36,height:36,borderRadius:"50%",background:ob(p2/100),border:`1px solid ${col}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:col}}>{ini(p.name)}</div><span style={{fontSize:11,padding:"3px 8px",borderRadius:20,background:ob(p2/100),color:col,fontWeight:700}}>{p2}%</span></div><div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:2}}>{p.name}</div><div style={{fontSize:10,color:A,marginBottom:10,fontWeight:600}}>{p.role||"—"}</div><div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:4}}><div style={{height:"100%",borderRadius:2,width:`${Math.min(p2,100)}%`,background:col}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.d,marginBottom:10}}><span>{fmt(pTotals[p.id])} HH asig.</span><span>{p.avail_h} HH disp.</span></div>{projs.slice(0,4).map(pr=>(<div key={pr.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:11,borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{width:6,height:6,borderRadius:"50%",background:pr.c,flexShrink:0}}/><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.m}}>{pr.name}</span><span style={{color:"#fff",fontSize:10,fontWeight:700}}>{pr.h}h</span></div>))}</div>);})}</div>);
          })()}

          {view==="matrix"&&sub==="grid"&&cur&&(()=>{
            const{people,projects,getH,pTotals}=cur;
            return(<div style={{...G.card,overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontSize:11,width:"100%"}}><thead><tr><th style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.08)",borderRight:"1px solid rgba(255,255,255,0.06)",textAlign:"left",minWidth:180,position:"sticky",left:0,zIndex:3,background:"rgba(7,7,20,0.97)",fontSize:10,fontWeight:700,color:T.d,textTransform:"uppercase",letterSpacing:".06em"}}>Proyecto</th><th style={{padding:"8px 8px",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:10,fontWeight:700,color:T.d,minWidth:52,textAlign:"center"}}>Total</th>{people.map(p=><th key={p.id} style={{padding:"6px 8px",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:10,fontWeight:600,color:T.m,whiteSpace:"nowrap",minWidth:60,textAlign:"center"}}>{p.name.split(" ")[0]}</th>)}</tr></thead><tbody>{projects.map((pr)=>{const rowTot=people.reduce((s,p)=>s+getH(p.id,pr.id),0),fee=pr.type!=="proyecto";const dot={fee:A,proyecto:"#2ED573",interno:T.d}[pr.type];return(<tr key={pr.id} style={{background:fee?"rgba(255,255,255,0.02)":"transparent"}}><td style={{padding:"6px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",borderRight:"1px solid rgba(255,255,255,0.05)",position:"sticky",left:0,zIndex:1,background:fee?"rgba(7,7,28,0.97)":"rgba(7,7,20,0.97)",minWidth:180,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:fee?T.m:T.p}}><span style={{width:6,height:6,borderRadius:"50%",background:dot,display:"inline-block",marginRight:8,verticalAlign:"middle"}}/>{pr.name}</td><td style={{padding:"6px 8px",borderBottom:"1px solid rgba(255,255,255,0.05)",textAlign:"center",fontFamily:"monospace",color:T.d}}>{rowTot>0?fmt(rowTot):"—"}</td>{people.map(p=>{const h=getH(p.id,pr.id),ck=`${pr.id}_${p.id}`,editing=editCell===ck;return(<td key={p.id} onClick={()=>!editing&&setEditCell(ck)} style={{padding:"6px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)",textAlign:"center",fontFamily:"monospace",cursor:"pointer",minWidth:60,color:h>0?"#fff":"rgba(255,255,255,0.15)",fontWeight:h>0?700:400,background:editing?"rgba(57,18,250,0.25)":"transparent"}}>{editing?<input autoFocus defaultValue={h||""} type="number" min="0" step="0.5" onBlur={e=>{upsertAlloc(monthId,p.id,pr.id,e.target.value);setEditCell(null);}} onKeyDown={e=>{if(e.key==="Enter")e.target.blur();if(e.key==="Escape")setEditCell(null);}} style={{...INP,width:52,padding:"3px 6px",textAlign:"center"}}/>:h>0?h:"·"}</td>);})}</tr>);})}<tr><td style={{padding:"8px 12px",position:"sticky",left:0,background:"rgba(7,7,30,0.98)",zIndex:1,fontSize:10,fontWeight:700,color:T.d,textTransform:"uppercase",letterSpacing:".05em"}}>Total asignado</td><td style={{padding:"8px 8px",textAlign:"center",fontFamily:"monospace",color:"#fff",fontWeight:700}}>{fmt(Object.values(pTotals).reduce((a,b)=>a+b,0))}</td>{people.map(p=>{const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);return <td key={p.id} style={{padding:"8px 6px",textAlign:"center",background:pTotals[p.id]>0?ob(p2/100):"transparent",color:pTotals[p.id]>0?col:T.d,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{pTotals[p.id]>0?fmt(pTotals[p.id]):"—"}</td>;})}</tr><tr><td style={{padding:"5px 12px",position:"sticky",left:0,background:"rgba(7,7,20,0.98)",zIndex:1,fontSize:10,color:T.d}}>Capacidad disponible</td><td style={{padding:"5px 8px",textAlign:"center",fontSize:10,color:T.d}}>—</td>{people.map(p=><td key={p.id} style={{padding:"5px 6px",textAlign:"center",fontFamily:"monospace",fontSize:10,color:T.d}}>{p.avail_h}</td>)}</tr></tbody></table></div>);
          })()}

          {view==="equipo"&&cur&&(()=>{
            const{pTotals}=cur;
            return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>{teamPeople.map(p=>{const tot=pTotals[p.id]??0,avH=data.avail.find(a=>a.month_id===monthId&&a.person_id===p.id)?.available_hours??p.default_hours;const p2=pct(tot,avH),col=oc(p2/100);return(<div key={p.id} style={{...G.card,padding:18}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}><div style={{width:40,height:40,borderRadius:"50%",background:ob(p2/100),border:`1px solid ${col}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:col}}>{ini(p.name)}</div><div style={{display:"flex",gap:4}}><button onClick={()=>{setPf({name:p.name,role:p.role||"",initials:p.initials,default_hours:String(p.default_hours)});setModal({type:"editPerson",person:p});}} style={{...BG,padding:"4px 8px",fontSize:11}}><i className="ti ti-pencil"/></button><button onClick={()=>deactivatePerson(p.id)} style={{...BG,padding:"4px 8px",fontSize:11,borderColor:"rgba(255,71,87,0.3)",color:"#FF4757"}}><i className="ti ti-user-minus"/></button></div></div><div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:3}}>{p.name}</div><div style={{fontSize:11,color:A,marginBottom:12,fontWeight:600}}>{p.role||"Sin cargo"}</div><div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:6}}><div style={{height:"100%",borderRadius:2,width:`${Math.min(p2,100)}%`,background:col}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:col,fontWeight:700}}>{p2}% ocupado</span><span style={{color:T.d}}>{avH} HH disp.</span></div></div>);})}</div>);
          })()}

          {view==="proyectos"&&cur&&(()=>{
            const{people,projects,getH,pTotals}=cur;
            return(<div style={G.card}>{projects.map((p,pi)=>{const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0);const assigned=people.filter(pe=>getH(pe.id,p.id)>0);const tC={fee:[A,"rgba(57,18,250,0.12)"],proyecto:["#2ED573","rgba(46,213,115,0.1)"],interno:[T.d,"rgba(255,255,255,0.04)"]}[p.type];return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:12}}><div style={{width:8,height:8,borderRadius:"50%",background:PC[pi%PC.length],flexShrink:0}}/><span style={{flex:1,fontWeight:700,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span><span style={{fontSize:10,padding:"2px 10px",borderRadius:20,background:tC[1],color:tC[0],fontWeight:700}}>{p.type}</span><div style={{display:"flex"}}>{assigned.slice(0,5).map(pe=>{const col=oc(pct(pTotals[pe.id]??0,data.avail.find(a=>a.month_id===monthId&&a.person_id===pe.id)?.available_hours??pe.default_hours)/100);return <div key={pe.id} title={pe.name} style={{width:22,height:22,borderRadius:"50%",background:ob(.6),border:`1px solid ${col}40`,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",marginRight:-5,color:col}}>{ini(pe.name)}</div>;})}{assigned.length>5&&<span style={{fontSize:10,color:T.d,marginLeft:12,alignSelf:"center"}}>+{assigned.length-5}</span>}</div><span style={{fontFamily:"monospace",color:"#fff",fontWeight:700,minWidth:46,textAlign:"right"}}>{tot>0?fmt(tot)+"h":"—"}</span></div>);})}</div>);
          })()}

          {view==="nuevo"&&(<div style={{maxWidth:460}}><div style={{...G.card,padding:26}}><div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:22}}><i className="ti ti-calendar-plus" style={{fontSize:16,marginRight:8,color:A,verticalAlign:-2}}/>Crear nuevo mes — {team}</div><div style={{display:"flex",gap:12,marginBottom:14}}><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Mes</label><select value={nm.month} onChange={e=>setNm(m=>({...m,month:e.target.value}))} style={SEL}>{MN.map((mn,i)=><option key={i} value={i+1}>{mn}</option>)}</select></div><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Año</label><input value={nm.year} onChange={e=>setNm(m=>({...m,year:e.target.value}))} type="number" style={INP}/></div></div><div style={{display:"flex",gap:12,marginBottom:14}}><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Días laborales</label><input value={nm.days} onChange={e=>setNm(m=>({...m,days:e.target.value}))} type="number" style={INP}/></div><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Copiar fees desde</label><select value={nm.copyFrom} onChange={e=>setNm(m=>({...m,copyFrom:e.target.value}))} style={SEL}><option value="">Desde cero</option>{months.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></div></div><div style={{background:"rgba(57,18,250,0.12)",border:"1px solid rgba(57,18,250,0.3)",borderRadius:8,padding:"10px 14px",fontSize:11,color:T.m,marginBottom:20}}><i className="ti ti-info-circle" style={{fontSize:13,marginRight:6,verticalAlign:-2,color:A}}/>Los proyectos <strong style={{color:"#fff"}}>fee</strong> y disponibilidad se copian automáticamente.</div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setView("dashboard")} style={BG}>Cancelar</button><button onClick={createMonth} style={BP}><i className="ti ti-check"/>Crear mes</button></div></div></div>)}

        </div>
      </div>

      {modal==="addPerson"&&(<Modal title="Agregar persona al equipo" onClose={()=>setModal(null)}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>{[["Nombre completo","name","text","Ej: María González"],["Cargo / Rol","role","text","Ej: UX Designer"],["Iniciales","initials","text","Ej: MG"],["HH disponibles / mes","default_hours","number","160"]].map(([l,k,t,ph])=>(<div key={k}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>{l}</label><input value={pf[k]} onChange={e=>setPf(f=>({...f,[k]:e.target.value}))} type={t} placeholder={ph} style={INP}/></div>))}</div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setModal(null)} style={BG}>Cancelar</button><button onClick={addPerson} style={BP}><i className="ti ti-user-plus"/>Agregar</button></div></Modal>)}

      {modal?.type==="editPerson"&&(<Modal title={`Editar — ${modal.person.name}`} onClose={()=>setModal(null)}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>{[["Nombre completo","name","text"],["Cargo / Rol","role","text"],["Iniciales","initials","text"],["HH disponibles / mes","default_hours","number"]].map(([l,k,t])=>(<div key={k}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>{l}</label><input value={pf[k]} onChange={e=>setPf(f=>({...f,[k]:e.target.value}))} type={t} style={INP}/></div>))}</div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setModal(null)} style={BG}>Cancelar</button><button onClick={()=>editPerson(modal.person.id,{name:pf.name,role:pf.role,initials:pf.initials,default_hours:parseInt(pf.default_hours)||160})} style={BP}><i className="ti ti-check"/>Guardar cambios</button></div></Modal>)}

    </div>
  );
}
