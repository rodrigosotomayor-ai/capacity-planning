import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

const SB_URL = "https://ybowftbdwtxzatfsdzot.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlib3dmdGJkd3R4emF0ZnNkem90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTE0NTksImV4cCI6MjA5NDE4NzQ1OX0.F0rX051XIfqUQulhhb0J0oOSeVypFPt99xpfeA2A4lY";
const AUTH_URL = `${SB_URL}/auth/v1`;
const SESSION_KEY = "cap_session";

function getSession(){try{const s=JSON.parse(localStorage.getItem(SESSION_KEY));if(!s||!s.access_token)return null;if(s.expires_at&&Date.now()/1000>s.expires_at-60)return null;return s;}catch{return null;}}
function saveSession(s){localStorage.setItem(SESSION_KEY,JSON.stringify(s));}
function clearSession(){localStorage.removeItem(SESSION_KEY);}
async function signIn(email,password){const r=await fetch(`${AUTH_URL}/token?grant_type=password`,{method:"POST",headers:{apikey:SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error_description||d.msg||"Credenciales incorrectas");return d;}

function db(table){
  const h={apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,"Content-Type":"application/json"};
  const base=`${SB_URL}/rest/v1/${table}`;
  const check=async r=>{
    const data=await r.json();
    if(!r.ok||data?.code||data?.message) throw new Error(data?.message||data?.hint||`HTTP ${r.status}`);
    return data;
  };
  return{
    select:(f="")=>fetch(`${base}?select=*${f?"&"+f:""}`,{headers:h}).then(r=>r.json()),
    insert:(d)=>fetch(base,{method:"POST",headers:{...h,Prefer:"return=representation"},body:JSON.stringify(d)}).then(check),
    upsert:(d)=>fetch(base,{method:"POST",headers:{...h,Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(d)}).then(check),
    update:(f,d)=>fetch(`${base}?${f}`,{method:"PATCH",headers:{...h,Prefer:"return=representation"},body:JSON.stringify(d)}).then(check),
    remove:(f)=>fetch(`${base}?${f}`,{method:"DELETE",headers:h}),
  };
}

const A="#3912FA";
const glass={background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:16};
const glassHi={background:"rgba(57,18,250,0.12)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(57,18,250,0.35)",borderRadius:16};
const T={p:"#fff",m:"rgba(255,255,255,0.55)",d:"rgba(255,255,255,0.28)"};
const BP={background:A,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6};
const BG={background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.55)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:6};
const BRed={background:"rgba(255,71,87,0.12)",color:"#FF4757",border:"1px solid rgba(255,71,87,0.3)",borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"Montserrat,sans-serif",display:"inline-flex",alignItems:"center",gap:5};
const INP={background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%"};
const SEL={background:"rgba(10,8,30,0.85)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 10px",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%"};

const ini=n=>n.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase();
const fmt=n=>Math.round(n*10)/10;
const pct=(a,b)=>b>0?Math.round(a/b*100):0;
const PC=[A,"#00D2FF","#FF4757","#FFA502","#2ED573","#FF6B81","#70A1FF","#5352ED","#ECCC68","#7BED9F","#FF9FF3","#54A0FF"];
const MN=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TYPE_LABELS={proyecto:"Proyecto",fee:"Fee mensual",interno:"Interno"};
const ABS_LABEL={vacaciones:"🌴 Vacaciones",licencia_medica:"🏥 Licencia médica",dia_libre:"☀️ Día libre"};
const ABS_COLOR={vacaciones:"#3912FA",licencia_medica:"#FF4757",dia_libre:"#2ED573"};

function oc(p){if(p>1)return"#FF4757";if(p>=.85)return"#FFA502";if(p>=.5)return"#2ED573";return"rgba(255,255,255,0.25)";}
function ob(p){if(p>1)return"rgba(255,71,87,0.15)";if(p>=.85)return"rgba(255,165,2,0.15)";if(p>=.5)return"rgba(46,213,115,0.15)";return"rgba(255,255,255,0.05)";}

// ─── CHARTS ──────────────────────────────────────────────────────────────────
function DonutChart({segments,size=140,label,sublabel}){
  const r=52,cx=size/2,cy=size/2,sw=14;let cum=-90;
  const total=segments.reduce((s,x)=>s+x.value,0);
  if(!total)return(<svg width={size} height={size}><circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>{label&&<text x={cx} y={cy+6} textAnchor="middle" fill={T.m} fontSize={13} fontFamily="Montserrat">Sin datos</text>}</svg>);
  const arcs=segments.map(seg=>{const ang=seg.value/total*360,start=cum,end=cum+ang-1;cum+=ang;const p2c=a=>({x:cx+r*Math.cos(a*Math.PI/180),y:cy+r*Math.sin(a*Math.PI/180)});const s=p2c(start),e=p2c(end),large=ang>180?1:0;return{...seg,d:`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`};});
  return(<svg width={size} height={size} style={{overflow:"visible"}}><circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>{arcs.map((a,i)=><path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="round"/>)}{label&&<text x={cx} y={cy-6} textAnchor="middle" fill="#fff" fontSize={20} fontWeight={700} fontFamily="Montserrat">{label}</text>}{sublabel&&<text x={cx} y={cy+14} textAnchor="middle" fill={T.m} fontSize={10} fontFamily="Montserrat">{sublabel}</text>}</svg>);
}
function HBar({data}){
  if(!data.length)return null;
  const max=Math.max(...data.map(d=>d.value),100),rh=28;
  return(<svg width="100%" height={data.length*rh+4} style={{overflow:"visible"}}>{data.map((d,i)=>{const col=oc(d.value/100),y=i*rh;return(<g key={i} transform={`translate(0,${y})`}><rect x={0} y={6} width="100%" height={rh-8} rx={3} fill="rgba(255,255,255,0.04)"/><rect x={0} y={6} width={`${Math.min(d.value/max*100,100)}%`} height={rh-8} rx={3} fill={col} opacity={0.65}/><text x={7} y={rh-5} fill="#fff" fontSize={10} fontFamily="Montserrat" fontWeight={600}>{d.label}</text><text x="99%" y={rh-5} fill={col} fontSize={10} fontFamily="Montserrat" fontWeight={700} textAnchor="end">{d.value}%</text></g>);})}</svg>);
}
function TrendLine({points,w=300,h=80}){
  if(!points||points.length<2)return<div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",color:T.d,fontSize:11}}>Sin suficientes meses</div>;
  const maxY=Math.max(...points.map(p=>p.y),100);
  const sx=i=>(i/(points.length-1))*(w-20)+10,sy=v=>h-10-(v/maxY)*(h-20);
  const d=points.map((p,i)=>`${i===0?"M":"L"} ${sx(i)} ${sy(p.y)}`).join(" ");
  return(<svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A} stopOpacity={0.3}/><stop offset="100%" stopColor={A} stopOpacity={0}/></linearGradient></defs><path d={`${d} L ${sx(points.length-1)} ${h} L ${sx(0)} ${h} Z`} fill="url(#tg)"/><path d={d} fill="none" stroke={A} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>{points.map((p,i)=>(<g key={i}><circle cx={sx(i)} cy={sy(p.y)} r={3} fill={A}/><text x={sx(i)} y={sy(p.y)-8} textAnchor="middle" fill={T.m} fontSize={9} fontFamily="Montserrat">{p.label}</text></g>))}</svg>);
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({title,onClose,width=440,children}){
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}} onClick={onClose}><div style={{...glass,padding:26,width,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><span style={{color:T.p,fontWeight:700,fontSize:15}}>{title}</span><button onClick={onClose} style={{...BG,padding:"4px 9px"}}><i className="ti ti-x"/></button></div>{children}</div></div>);
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState(null);
  async function submit(e){e.preventDefault();if(!email||!pw)return;setLoading(true);setError(null);try{await onLogin(email,pw);}catch(err){setError(err.message);setLoading(false);}}
  return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:380,maxWidth:"92vw"}}><div style={{textAlign:"center",marginBottom:32}}><div style={{fontWeight:800,fontSize:28,color:"#fff",letterSpacing:-1}}>capacity<span style={{color:A}}>.</span>app</div><div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:6,fontWeight:500,letterSpacing:".08em"}}>AGENCIA DIGITAL</div></div><div style={{...glass,padding:"32px 28px"}}><div style={{fontWeight:700,fontSize:17,color:"#fff",marginBottom:4}}>Iniciar sesión</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:24}}>Ingresa con tu cuenta para continuar</div><form onSubmit={submit}><div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="usuario@agencia.com" autoFocus style={{...INP,borderRadius:10,padding:"11px 14px",fontSize:13,boxSizing:"border-box"}}/></div><div style={{marginBottom:20}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Contraseña</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" style={{...INP,borderRadius:10,padding:"11px 14px",fontSize:13,boxSizing:"border-box"}}/></div>{error&&<div style={{background:"rgba(255,71,87,0.12)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#FF4757",marginBottom:16,display:"flex",alignItems:"center",gap:8}}><i className="ti ti-alert-circle" style={{fontSize:15,flexShrink:0}}/>{error}</div>}<button type="submit" disabled={loading||!email||!pw} style={{...BP,width:"100%",justifyContent:"center",padding:"12px",fontSize:14,borderRadius:10,opacity:loading||!email||!pw?0.6:1}}>{loading?<><i className="ti ti-loader-2" style={{fontSize:16}}/>Ingresando...</>:<><i className="ti ti-login" style={{fontSize:16}}/>Ingresar</>}</button></form></div><div style={{textAlign:"center",marginTop:20,fontSize:11,color:"rgba(255,255,255,0.2)"}}>¿Necesitas acceso? Contacta al administrador.</div></div></div>);
}

// ─── CALENDAR PICKER ─────────────────────────────────────────────────────────
function CalendarPicker({year,month,selectedDates,onToggle,holidays,existingAbsences}){
  const firstDay=new Date(year,month-1,1);
  const daysInMonth=new Date(year,month,0).getDate();
  const startDow=(firstDay.getDay()+6)%7;
  const holidayDates=new Set((holidays||[]).filter(h=>h.year===year&&h.month_num===month).map(h=>h.date));
  const holidayNames=Object.fromEntries((holidays||[]).filter(h=>h.year===year&&h.month_num===month&&h.date).map(h=>[h.date,h.name]));
  const absDates=new Set((existingAbsences||[]).map(a=>a.date).filter(Boolean));
  const selSet=new Set(selectedDates);
  const cells=[];
  for(let i=0;i<startDow;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(d);
  return(<div><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>{["Lu","Ma","Mi","Ju","Vi","Sá","Do"].map(d=>(<div key={d} style={{textAlign:"center",fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.3)",padding:"4px 0",textTransform:"uppercase"}}>{d}</div>))}</div><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>{cells.map((d,i)=>{if(!d)return<div key={"e"+i}/>;const dateStr=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const dow=(new Date(year,month-1,d).getDay()+6)%7;const isWeekend=dow>=5;const isHol=holidayDates.has(dateStr);const isAbs=absDates.has(dateStr);const isSel=selSet.has(dateStr);const disabled=isWeekend||isHol;let bg="rgba(255,255,255,0.04)",border="1px solid transparent",color="rgba(255,255,255,0.7)";if(isWeekend){bg="rgba(255,255,255,0.02)";color="rgba(255,255,255,0.2)";}if(isHol){bg="rgba(123,111,250,0.15)";border="1px solid rgba(123,111,250,0.4)";color="#7B6FFA";}if(isAbs){bg="rgba(255,165,2,0.15)";border="1px solid rgba(255,165,2,0.4)";color="#FFA502";}if(isSel){bg="rgba(57,18,250,0.35)";border="1px solid #3912FA";color="#fff";}return(<div key={d} title={holidayNames[dateStr]||""} onClick={()=>!disabled&&onToggle(dateStr)} style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:6,background:bg,border,color,cursor:disabled?"default":"pointer",fontSize:12,fontWeight:isSel?700:400,position:"relative",transition:"all .1s"}}>{d}{isHol&&<div style={{width:4,height:4,borderRadius:"50%",background:"#7B6FFA",position:"absolute",bottom:3}}/>}{isAbs&&!isSel&&<div style={{width:4,height:4,borderRadius:"50%",background:"#FFA502",position:"absolute",bottom:3}}/>}{isSel&&<div style={{width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.7)",position:"absolute",bottom:3}}/>}</div>);})}
  </div><div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>{[["#3912FA","Seleccionado"],["#7B6FFA","Feriado"],["#FFA502","Ya registrado"],["rgba(255,255,255,0.2)","Fin de semana"]].map(([c,l])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"rgba(255,255,255,0.45)"}}><div style={{width:8,height:8,borderRadius:2,background:c,flexShrink:0}}/>{l}</div>))}</div></div>);
}

// ─── ABSENCE FORM ─────────────────────────────────────────────────────────────
function AbsenceForm({initial,people,holidays,existingAbsences,monthYear,onSave,onCancel}){
  const now=new Date();
  const [personId,setPersonId]=useState(initial.person_id||"");
  const [type,setType]=useState(initial.type||"vacaciones");
  const [notes,setNotes]=useState(initial.notes||"");
  const [calYear,setCalYear]=useState(monthYear?.year||now.getFullYear());
  const [calMonth,setCalMonth]=useState(monthYear?.month||(now.getMonth()+1));
  const [selDates,setSelDates]=useState([]);
  const [manualH,setManualH]=useState(initial.id?String(initial.hours||8):"");
  const [useManual,setUseManual]=useState(!!initial.id);
  const toggleDate=d=>setSelDates(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d].sort());
  const prevMonth=()=>{if(calMonth===1){setCalMonth(12);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);};
  const nextMonth=()=>{if(calMonth===12){setCalMonth(1);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);};
  const hoursFromDays=selDates.length*8;
  const totalHours=useManual?parseFloat(manualH)||0:hoursFromDays;
  const isAllPlanta=personId==="__all_planta__";
  const canSave=personId&&(isAllPlanta?(useManual?parseFloat(manualH)>0:selDates.length>0||parseFloat(manualH)>0):totalHours>0);
  const personAbsences=(existingAbsences||[]).filter(a=>a.person_id===personId&&!initial.id);
  const mHols=(holidays||[]).filter(h=>h.year===calYear&&h.month_num===calMonth&&h.date);
  function handleSave(){onSave({...(initial.id?{id:initial.id}:{}),person_id:personId,type,hours:totalHours,notes});}
  return(<div style={{display:"flex",gap:18}}><div style={{width:200,flexShrink:0,display:"flex",flexDirection:"column",gap:12}}><div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>Persona</label><select value={personId} onChange={e=>setPersonId(e.target.value)} disabled={!!initial.id} style={{...SEL,opacity:initial.id?0.6:1}}><option value="">Seleccionar...</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>Tipo</label>{[{v:"vacaciones",l:"🌴 Vacaciones",c:"#3912FA"},{v:"licencia_medica",l:"🏥 Licencia médica",c:"#FF4757"},{v:"dia_libre",l:"☀️ Día libre",c:"#2ED573"}].map(t=>(<div key={t.v} onClick={()=>setType(t.v)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:7,border:`1px solid ${type===t.v?t.c:"rgba(255,255,255,0.08)"}`,background:type===t.v?`${t.c}18`:"rgba(255,255,255,0.02)",cursor:"pointer",marginBottom:5}}><div style={{width:8,height:8,borderRadius:"50%",background:type===t.v?t.c:"rgba(255,255,255,0.15)",flexShrink:0}}/><span style={{fontSize:11,fontWeight:600,color:type===t.v?t.c:"rgba(255,255,255,0.5)"}}>{t.l}</span></div>))}</div><div style={{background:"rgba(57,18,250,0.1)",border:"1px solid rgba(57,18,250,0.25)",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Total ausencia</div>{!useManual?(<div><div style={{fontSize:22,fontWeight:800,color:"#fff",lineHeight:1}}>{selDates.length}<span style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.5)",marginLeft:4}}>días</span></div><div style={{fontSize:12,color:"#7B6FFA",marginTop:3,fontWeight:600}}>{hoursFromDays} HH</div><button onClick={()=>{setUseManual(true);setManualH(String(hoursFromDays||8));}} style={{fontSize:10,color:"rgba(255,255,255,0.35)",background:"none",border:"none",cursor:"pointer",padding:"4px 0",fontFamily:"Montserrat,sans-serif",marginTop:4,textDecoration:"underline"}}>Ingresar horas manualmente</button></div>):(<div><input type="number" min="0.5" step="0.5" value={manualH} onChange={e=>setManualH(e.target.value)} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"#fff",padding:"6px 10px",fontSize:16,fontWeight:700,fontFamily:"Montserrat,sans-serif",outline:"none",width:"80px",textAlign:"center"}}/><span style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginLeft:6}}>HH</span><button onClick={()=>setUseManual(false)} style={{fontSize:10,color:"rgba(255,255,255,0.35)",background:"none",border:"none",cursor:"pointer",padding:"4px 0",fontFamily:"Montserrat,sans-serif",marginTop:4,display:"block",textDecoration:"underline"}}>Usar calendario</button></div>)}</div><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>Notas <span style={{color:T.d,fontWeight:400}}>(opcional)</span></label><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Ej: Vacaciones de verano" style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#fff",padding:"8px 12px",fontSize:11,fontFamily:"Montserrat,sans-serif",outline:"none",width:"100%",boxSizing:"border-box",resize:"none",lineHeight:1.5}}/></div><div style={{display:"flex",flexDirection:"column",gap:6}}><button onClick={handleSave} disabled={!canSave} style={{...BP,justifyContent:"center",padding:"9px 0",opacity:canSave?1:0.45}}><i className={`ti ti-${initial.id?"check":"calendar-off"}`}/>{initial.id?"Guardar":"Registrar ausencia"}</button><button onClick={onCancel} style={{...BG,justifyContent:"center",padding:"8px 0"}}>Cancelar</button></div></div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><button onClick={prevMonth} style={{...BG,padding:"5px 10px"}}><i className="ti ti-chevron-left" style={{fontSize:14}}/></button><span style={{fontWeight:700,fontSize:13,color:"#fff"}}>{MN[calMonth-1]} {calYear}</span><button onClick={nextMonth} style={{...BG,padding:"5px 10px"}}><i className="ti ti-chevron-right" style={{fontSize:14}}/></button></div><CalendarPicker year={calYear} month={calMonth} selectedDates={selDates} onToggle={toggleDate} holidays={holidays} existingAbsences={personAbsences}/>{selDates.length>0&&!useManual&&(<div style={{marginTop:10,background:"rgba(57,18,250,0.08)",borderRadius:8,padding:"8px 12px"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Días seleccionados</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{selDates.map(d=>(<span key={d} onClick={()=>toggleDate(d)} style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:"rgba(57,18,250,0.3)",color:"#fff",cursor:"pointer",border:"1px solid rgba(57,18,250,0.5)"}}>{new Date(d+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"short"})} ×</span>))}</div></div>)}{mHols.length>0&&(<div style={{marginTop:10,background:"rgba(123,111,250,0.08)",borderRadius:8,padding:"8px 12px",border:"1px solid rgba(123,111,250,0.2)"}}><div style={{fontSize:10,color:"#7B6FFA",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>📅 Feriados en {MN[calMonth-1]}</div>{mHols.map(h=>(<div key={h.id} style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:2,display:"flex",justifyContent:"space-between"}}><span>{h.name}</span><span style={{color:T.d}}>{new Date(h.date+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"short"})}</span></div>))}</div>)}</div></div>);
}

// ─── HOLIDAY FORM ─────────────────────────────────────────────────────────────
function HolidayForm({initial,onSave,onCancel}){
  const [f,setF]=useState(initial);const set=(k,v)=>setF(x=>({...x,[k]:v}));
  return(<div><div style={{background:"rgba(57,18,250,0.1)",border:"1px solid rgba(57,18,250,0.25)",borderRadius:8,padding:"10px 14px",fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:18}}><i className="ti ti-info-circle" style={{fontSize:13,marginRight:6,verticalAlign:-2,color:A}}/>Los feriados son <strong style={{color:"#fff"}}>globales</strong> — se descuentan de <strong style={{color:"#fff"}}>todo el equipo</strong> ese mes.</div><div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Nombre *</label><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Ej: Día del Trabajo" style={{...INP,boxSizing:"border-box"}}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}><div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Mes</label><select value={f.month_num} onChange={e=>set("month_num",e.target.value)} style={SEL}>{MN.map((mn,i)=><option key={i} value={i+1}>{mn}</option>)}</select></div><div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Año</label><input value={f.year} onChange={e=>set("year",e.target.value)} type="number" style={{...INP,boxSizing:"border-box"}}/></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}><div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Fecha exacta <span style={{color:T.d,fontWeight:400}}>(opcional)</span></label><input value={f.date||""} onChange={e=>set("date",e.target.value)} type="date" style={{...INP,boxSizing:"border-box",colorScheme:"dark"}}/></div><div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Horas</label><input value={f.hours} onChange={e=>set("hours",e.target.value)} type="number" min="1" max="24" step="0.5" style={{...INP,boxSizing:"border-box"}}/></div></div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={onCancel} style={BG}>Cancelar</button><button onClick={()=>onSave(f)} disabled={!f.name} style={{...BP,opacity:f.name?1:0.5}}><i className={`ti ti-${f.id?"check":"calendar-plus"}`}/>{f.id?"Guardar cambios":"Agregar feriado"}</button></div></div>);
}

// ─── PERSON FORM ──────────────────────────────────────────────────────────────
function PersonForm({initial,onSave,onCancel}){
  const [f,setF]=useState({contract_type:"planta",...initial});const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const isFreelance=f.contract_type==="freelance";
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <div style={{gridColumn:"1/-1"}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>Nombre completo *</label><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Ej: María González" style={{...INP,boxSizing:"border-box"}}/></div>
      <div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>Cargo / Rol</label><input value={f.role||""} onChange={e=>set("role",e.target.value)} placeholder="Ej: UX Designer" style={{...INP,boxSizing:"border-box"}}/></div>
      <div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>Iniciales</label><input value={f.initials||""} onChange={e=>set("initials",e.target.value)} placeholder="Ej: MG" maxLength={3} style={{...INP,boxSizing:"border-box"}}/></div>
      <div><label style={{display:"block",fontSize:11,color:T.m,marginBottom:5,fontWeight:600}}>HH disponibles / mes</label><input value={f.default_hours||"160"} onChange={e=>set("default_hours",e.target.value)} type="number" style={{...INP,boxSizing:"border-box"}}/></div>
      <div>
        <label style={{display:"block",fontSize:11,color:T.m,marginBottom:8,fontWeight:600}}>Tipo de contrato</label>
        <div style={{display:"flex",gap:8}}>
          {[["planta","🏢 Planta","Contrato fijo, descuenta feriados y ausencias"],["freelance","🔗 Freelance","Sin horario fijo, no descuenta feriados ni ausencias"]].map(([v,l,desc])=>(
            <div key={v} onClick={()=>set("contract_type",v)} style={{flex:1,padding:"9px 10px",borderRadius:8,border:`1px solid ${f.contract_type===v?(v==="freelance"?"#FFA502":A):"rgba(255,255,255,0.1)"}`,background:f.contract_type===v?(v==="freelance"?"rgba(255,165,2,0.1)":"rgba(57,18,250,0.12)"):"rgba(255,255,255,0.02)",cursor:"pointer"}}>
              <div style={{fontSize:12,fontWeight:700,color:f.contract_type===v?(v==="freelance"?"#FFA502":"#fff"):"rgba(255,255,255,0.45)",marginBottom:3}}>{l}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",lineHeight:1.4}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {isFreelance&&(
      <div style={{background:"rgba(255,165,2,0.08)",border:"1px solid rgba(255,165,2,0.25)",borderRadius:8,padding:"10px 14px",fontSize:11,color:"rgba(255,165,2,0.9)",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
        <i className="ti ti-info-circle" style={{fontSize:14,flexShrink:0}}/>
        Los feriados y ausencias <strong>no se descontarán</strong> de su capacidad disponible. Sus horas en la grilla representan el tiempo acordado para el proyecto.
      </div>
    )}
    <div style={{fontSize:11,color:T.d,marginBottom:16}}>Las HH por mes son el valor por defecto. Puedes ajustarlas mes a mes en Configurar mes.</div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
      <button onClick={onCancel} style={BG}>Cancelar</button>
      <button onClick={()=>onSave(f)} disabled={!f.name} style={{...BP,opacity:f.name?1:0.5}}><i className={`ti ti-${f.id?"check":"user-plus"}`}/>{f.id?"Guardar cambios":"Agregar persona"}</button>
    </div>
  </div>);
}

// ─── PROJECT FORM ─────────────────────────────────────────────────────────────
function ProjectForm({initial,onSave,onCancel}){
  const [f,setF]=useState(initial);const set=(k,v)=>setF(x=>({...x,[k]:v}));
  const desc={proyecto:"Proyecto puntual con fecha de inicio y fin",fee:"Fee mensual recurrente — se copia automáticamente al crear nuevos meses",interno:"Gestiones internas, reuniones, administración"};
  return(<div><div style={{marginBottom:14}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Nombre *</label><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Ej: Rediseño web Copec" style={{...INP,boxSizing:"border-box"}}/></div><div style={{marginBottom:20}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:8,fontWeight:600}}>Tipo</label>{["proyecto","fee","interno"].map(t=>(<div key={t} onClick={()=>set("type",t)} style={{padding:"10px 14px",borderRadius:8,border:`1px solid ${f.type===t?A:"rgba(255,255,255,0.1)"}`,background:f.type===t?"rgba(57,18,250,0.15)":"rgba(255,255,255,0.03)",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{width:10,height:10,borderRadius:"50%",background:f.type===t?A:"rgba(255,255,255,0.15)",flexShrink:0}}/><div><div style={{fontSize:12,fontWeight:600,color:f.type===t?"#fff":T.m}}>{TYPE_LABELS[t]}</div><div style={{fontSize:10,color:T.d,marginTop:2}}>{desc[t]}</div></div></div>))}</div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={onCancel} style={BG}>Cancelar</button><button onClick={()=>onSave(f)} disabled={!f.name} style={{...BP,opacity:f.name?1:0.5}}><i className={`ti ti-${f.id?"check":"plus"}`}/>{f.id?"Guardar cambios":"Crear proyecto"}</button></div></div>);
}


// ─── ANNUAL VIEW ─────────────────────────────────────────────────────────────
function AnualView({ data, team }) {
  const availYears = [...new Set((data.months||[]).map(m=>m.year))].sort((a,b)=>b-a);
  const [year,      setYear]      = useState(availYears[0]||2026);
  const [fromMonth, setFromMonth] = useState(1);
  const [toMonth,   setToMonth]   = useState(12);

  const teamObj   = data.teams.find(t=>t.slug===team);
  const allPeople = data.people.filter(p=>p.team_id===teamObj?.id&&p.is_active);

  const filteredMonths = (data.months||[])
    .filter(m=>m.team_id===teamObj?.id&&m.year===year&&m.month_num>=fromMonth&&m.month_num<=toMonth)
    .sort((a,b)=>a.month_num-b.month_num);

  // ── Per-month metrics ─────────────────────────────────────────────────────
  const monthMetrics = filteredMonths.map(m=>{
    const avails  = (data.avail||[]).filter(a=>a.month_id===m.id);
    const allocs  = (data.allocs||[]).filter(a=>a.month_id===m.id);
    const absences= (data.absences||[]).filter(a=>a.month_id===m.id);
    const holH    = (data.holidays||[]).filter(h=>h.year===m.year&&h.month_num===m.month_num).reduce((s,h)=>s+parseFloat(h.hours),0);
    const monthPeople=avails.map(a=>{
      const p=data.people.find(x=>x.id===a.person_id);if(!p)return null;
      const isFreelance=(p.contract_type||"planta")==="freelance";
      const effAbsH=isFreelance?0:absences.filter(x=>x.person_id===a.person_id).reduce((s,x)=>s+parseFloat(x.hours),0);
      const effHolH=isFreelance?0:holH;
      const availH=Math.max(0,a.available_hours-effAbsH-effHolH);
      const soldH=allocs.filter(x=>x.person_id===a.person_id).reduce((s,x)=>s+parseFloat(x.hours),0);
      return{...p,availH,soldH,pct:availH>0?soldH/availH:0};
    }).filter(Boolean);
    const totalAvail=monthPeople.reduce((s,p)=>s+p.availH,0);
    const totalSold=allocs.reduce((s,a)=>s+parseFloat(a.hours),0);
    const occPct=totalAvail>0?Math.round(totalSold/totalAvail*100):0;
    const overCount=monthPeople.filter(p=>p.availH>0&&p.soldH>p.availH).length;
    const absHTotal=absences.reduce((s,a)=>s+parseFloat(a.hours),0);
    const byType={proyecto:0,fee:0,interno:0};
    allocs.forEach(a=>{const proj=data.projects.find(p=>p.id===a.project_id);if(proj)byType[proj.type]=(byType[proj.type]||0)+parseFloat(a.hours);});
    const overHH=monthPeople.reduce((s,p)=>s+Math.max(0,p.soldH-p.availH),0);
    return{...m,monthPeople,totalAvail,totalSold,occPct,overCount,absHTotal,byType,holH,overHH};
  });

  // ── Per-person annual metrics ─────────────────────────────────────────────
  const personMetrics = allPeople.map(p=>{
    const byMonth=filteredMonths.map(m=>{
      const avRec=(data.avail||[]).find(a=>a.month_id===m.id&&a.person_id===p.id);
      if(!avRec)return null;
      const isFreelance=(p.contract_type||"planta")==="freelance";
      const absH=isFreelance?0:(data.absences||[]).filter(a=>a.month_id===m.id&&a.person_id===p.id).reduce((s,a)=>s+parseFloat(a.hours),0);
      const holH=isFreelance?0:(data.holidays||[]).filter(h=>h.year===m.year&&h.month_num===m.month_num).reduce((s,h)=>s+parseFloat(h.hours),0);
      const availH=Math.max(0,avRec.available_hours-absH-holH);
      const soldH=(data.allocs||[]).filter(a=>a.month_id===m.id&&a.person_id===p.id).reduce((s,a)=>s+parseFloat(a.hours),0);
      return{monthId:m.id,monthNum:m.month_num,availH,soldH,pct:availH>0?soldH/availH:0};
    });
    const active=byMonth.filter(Boolean);
    const avgPct=active.length?Math.round(active.reduce((s,m)=>s+(m.availH>0?m.soldH/m.availH:0),0)/active.length*100):0;
    const overMonths=active.filter(m=>m.pct>1).length;
    const totalSold=active.reduce((s,m)=>s+m.soldH,0);
    const totalAvail=active.reduce((s,m)=>s+m.availH,0);
    return{...p,byMonth,avgPct,totalSold,totalAvail,activeMonths:active.length,overMonths};
  }).filter(p=>p.activeMonths>0).sort((a,b)=>b.avgPct-a.avgPct);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const annualSoldH   = monthMetrics.reduce((s,m)=>s+m.totalSold,0);
  const annualAvailH  = monthMetrics.reduce((s,m)=>s+m.totalAvail,0);
  const annualFreeH   = Math.max(0,annualAvailH-annualSoldH);
  const annualOcc     = annualAvailH>0?Math.round(annualSoldH/annualAvailH*100):0;
  const peakMonth     = [...monthMetrics].sort((a,b)=>b.occPct-a.occPct)[0];
  const quietMonth    = [...monthMetrics].filter(m=>m.totalAvail>0).sort((a,b)=>a.occPct-b.occPct)[0];
  const annualAbs     = monthMetrics.reduce((s,m)=>s+m.absHTotal,0);
  const annualOverHH  = monthMetrics.reduce((s,m)=>s+m.overHH,0);
  const burnoutRisk   = personMetrics.filter(p=>p.overMonths>=2).length;
  const totalFee      = monthMetrics.reduce((s,m)=>s+m.byType.fee,0);
  const totalProj     = monthMetrics.reduce((s,m)=>s+m.byType.proyecto,0);
  const feeRatio      = (totalFee+totalProj)>0?Math.round(totalFee/(totalFee+totalProj)*100):0;
  // Client concentration: hours by project, top 3
  const projTotalsAll={};
  filteredMonths.forEach(m=>{(data.allocs||[]).filter(a=>a.month_id===m.id).forEach(a=>{projTotalsAll[a.project_id]=(projTotalsAll[a.project_id]||0)+parseFloat(a.hours);});});
  const sortedProjs=Object.entries(projTotalsAll).map(([id,h])=>({...data.projects.find(p=>p.id===id),hours:h})).filter(p=>p.id&&p.team_id===teamObj?.id&&p.type!=="interno").sort((a,b)=>b.hours-a.hours);
  const top3H=sortedProjs.slice(0,3).reduce((s,p)=>s+p.hours,0);
  const concentration=annualSoldH>0?Math.round(top3H/annualSoldH*100):0;
  const variability=monthMetrics.length>1?Math.max(...monthMetrics.map(m=>m.occPct))-Math.min(...monthMetrics.filter(m=>m.totalAvail>0).map(m=>m.occPct)):0;

  // ── Export XLS ───────────────────────────────────────────────────────────
  function exportXLS(){
    const wb=XLSX.utils.book_new();
    // Sheet 1: Monthly summary
    const s1=[["Mes","Año","HH Disponibles","HH Asignadas","HH Libres","% Ocupación","Sobreutilizados","HH Sobreutilización","HH Ausencias","HH Feriados","HH Proyectos","HH Fees","HH Interno"],
      ...monthMetrics.map(m=>[MN[m.month_num-1],m.year,m.totalAvail,fmt(m.totalSold),fmt(m.totalAvail-m.totalSold),m.occPct+"%",m.overCount,fmt(m.overHH),fmt(m.absHTotal),fmt(m.holH),fmt(m.byType.proyecto),fmt(m.byType.fee),fmt(m.byType.interno)])];
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(s1),"Resumen mensual");
    // Sheet 2: Per-person
    const h2=["Persona","Cargo","Meses activos","HH Asignadas","HH Disponibles","% Ocup. promedio","Meses >100%",...filteredMonths.map(m=>MN[m.month_num-1]+" (%)"),...filteredMonths.map(m=>MN[m.month_num-1]+" (HH)")];
    const r2=personMetrics.map(p=>[p.name,p.role||"—",p.activeMonths,fmt(p.totalSold),fmt(p.totalAvail),p.avgPct+"%",p.overMonths,...filteredMonths.map((_,i)=>{const bm=p.byMonth[i];return bm?Math.round(bm.pct*100)+"%":"—"}),...filteredMonths.map((_,i)=>{const bm=p.byMonth[i];return bm?fmt(bm.soldH):"—";})]);
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h2,...r2]),"Ocupación personas");
    // Sheet 3: Projects
    const h3=["Proyecto","Tipo","Total HH",...filteredMonths.map(m=>MN[m.month_num-1])];
    const r3=sortedProjs.map(p=>{const mh=filteredMonths.map(m=>{const a=(data.allocs||[]).filter(x=>x.month_id===m.id&&x.project_id===p.id);return a.length?fmt(a.reduce((s,x)=>s+parseFloat(x.hours),0)):0;});return[p.name,TYPE_LABELS[p.type]||p.type,fmt(p.hours),...mh];});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h3,...r3]),"HH por proyecto");
    // Sheet 4: Absences
    const r4=[["Persona","Cargo","Mes","Tipo","HH","Notas"]];
    filteredMonths.forEach(m=>{(data.absences||[]).filter(a=>a.month_id===m.id).forEach(a=>{const p=data.people.find(x=>x.id===a.person_id);r4.push([p?.name||"—",p?.role||"—",m.label,ABS_LABEL[a.type]||a.type,a.hours,a.notes||""]);});});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(r4),"Ausencias");
    XLSX.writeFile(wb,`capacity_${team}_${year}_${MN[fromMonth-1]}-${MN[toMonth-1]}.xlsx`);
  }

  // ── CHART: Stacked bars with labels ──────────────────────────────────────
  function StackedBars({ metrics }){
    if(!metrics.length)return null;
    const W=580,H=180,pL=36,pB=28,pT=14,gap=6;
    const n=metrics.length;
    const barW=Math.min(48,Math.floor((W-pL-gap*n)/n));
    const maxH=Math.max(...metrics.map(m=>m.totalSold),1);
    const scY=v=>(H-pB-pT)*v/maxH;
    const SEGS=[{k:"fee",c:"#2ED573"},{k:"proyecto",c:A},{k:"interno",c:"rgba(255,255,255,0.18)"}];
    return(
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {[0.25,0.5,0.75,1].map(f=>{const y=H-pB-(H-pB-pT)*f;return(<g key={f}><line x1={pL} y1={y} x2={W-4} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/><text x={pL-5} y={y+3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="Montserrat">{Math.round(maxH*f)}</text></g>);})}
        {metrics.map((m,i)=>{
          const x=pL+i*(barW+gap);
          let curY=H-pB;
          const segs=SEGS.map(({k,c})=>{const h=scY(m.byType[k]||0);curY-=h;return{k,c,h,y:curY,raw:m.byType[k]||0};});
          return(<g key={m.id}>
            {segs.map(s=>{
              if(s.h<1)return null;
              const showLabel=s.h>=14;
              return(<g key={s.k}>
                <rect x={x} y={s.y} width={barW} height={s.h} fill={s.c} opacity={0.88} rx={s===segs[segs.length-1]?2:0}/>
                {showLabel&&<text x={x+barW/2} y={s.y+s.h/2+3.5} textAnchor="middle" fill="rgba(0,0,0,0.75)" fontSize={8} fontFamily="Montserrat" fontWeight={700}>{Math.round(s.raw)}</text>}
              </g>);
            })}
            {/* Occupancy % above bar */}
            <text x={x+barW/2} y={H-pB-scY(m.totalSold)-5} textAnchor="middle" fill={oc(m.occPct/100)} fontSize={9} fontFamily="Montserrat" fontWeight={700}>{m.occPct}%</text>
            <text x={x+barW/2} y={H-pB+16} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={9} fontFamily="Montserrat">{MN[m.month_num-1].substring(0,3)}</text>
          </g>);
        })}
      </svg>
    );
  }

  // ── CHART: Available vs Assigned side-by-side ────────────────────────────
  function AvailVsSold({ metrics }){
    if(!metrics.length)return null;
    const W=580,H=160,pL=36,pB=28,pT=14,gap=4,pairGap=8;
    const n=metrics.length;
    const pairW=Math.floor((W-pL-pairGap*(n-1))/n);
    const bW=Math.floor((pairW-gap)/2);
    const maxH=Math.max(...metrics.map(m=>Math.max(m.totalAvail,m.totalSold)),1);
    const scY=v=>(H-pB-pT)*v/maxH;
    return(
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {[0.25,0.5,0.75,1].map(f=>{const y=H-pB-(H-pB-pT)*f;return(<g key={f}><line x1={pL} y1={y} x2={W-4} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/><text x={pL-5} y={y+3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={8} fontFamily="Montserrat">{Math.round(maxH*f)}</text></g>);})}
        {metrics.map((m,i)=>{
          const x=pL+i*(pairW+pairGap);
          const hA=scY(m.totalAvail),hS=scY(m.totalSold);
          const free=m.totalAvail-m.totalSold;
          return(<g key={m.id}>
            {/* Available bar */}
            <rect x={x} y={H-pB-hA} width={bW} height={hA} fill="rgba(255,255,255,0.12)" rx={2}/>
            {hA>=12&&<text x={x+bW/2} y={H-pB-hA+hA/2+3} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={8} fontFamily="Montserrat">{Math.round(m.totalAvail)}</text>}
            {/* Sold bar */}
            <rect x={x+bW+gap} y={H-pB-hS} width={bW} height={hS} fill={oc(m.occPct/100)} rx={2} opacity={0.85}/>
            {hS>=12&&<text x={x+bW+gap+bW/2} y={H-pB-hS+hS/2+3} textAnchor="middle" fill="rgba(0,0,0,0.7)" fontSize={8} fontFamily="Montserrat" fontWeight={700}>{Math.round(m.totalSold)}</text>}
            {/* Free label */}
            {free>0&&hA-hS>=10&&<text x={x+bW/2} y={H-pB-hA+hA/2-hS/2-2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={7} fontFamily="Montserrat">-{Math.round(free)}</text>}
            <text x={x+pairW/2} y={H-pB+16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9} fontFamily="Montserrat">{MN[m.month_num-1].substring(0,3)}</text>
          </g>);
        })}
      </svg>
    );
  }

  // ── CHART: Occupancy line ─────────────────────────────────────────────────
  function OccLine({ metrics }){
    if(metrics.length<2)return null;
    const W=580,H=120,pL=28,pB=24,pT=8;
    const sx=i=>pL+(W-pL-8)/(metrics.length-1)*i;
    const sy=v=>H-pB-(H-pB-pT)*Math.min(v,130)/130;
    const d=metrics.map((m,i)=>`${i===0?"M":"L"} ${sx(i)} ${sy(m.occPct)}`).join(" ");
    return(
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs><linearGradient id="og2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A} stopOpacity={0.3}/><stop offset="100%" stopColor={A} stopOpacity={0}/></linearGradient></defs>
        {[[50,"rgba(255,255,255,0.06)","none"],[85,"rgba(255,165,2,0.3)","4,3"],[100,"rgba(255,71,87,0.3)","4,3"]].map(([v,stroke,dash])=>{
          const y=sy(v);return(<g key={v}><line x1={pL} y1={y} x2={W-4} y2={y} stroke={stroke} strokeWidth={1.5} strokeDasharray={dash}/><text x={pL-4} y={y+3} textAnchor="end" fill="rgba(255,255,255,0.28)" fontSize={8} fontFamily="Montserrat">{v}%</text></g>);
        })}
        <path d={`${d} L ${sx(metrics.length-1)} ${H-pB} L ${sx(0)} ${H-pB} Z`} fill="url(#og2)"/>
        <path d={d} fill="none" stroke={A} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {metrics.map((m,i)=>{
          const col=oc(m.occPct/100);
          return(<g key={m.id}><circle cx={sx(i)} cy={sy(m.occPct)} r={4.5} fill={col} stroke="rgba(7,7,20,0.9)" strokeWidth={1.5}/><text x={sx(i)} y={sy(m.occPct)-8} textAnchor="middle" fill={col} fontSize={9} fontFamily="Montserrat" fontWeight={700}>{m.occPct}%</text></g>);
        })}
      </svg>
    );
  }

  // ── CHART: Compact Heatmap ────────────────────────────────────────────────
  function Heatmap({ people, months }){
    if(!people.length||!months.length)return null;
    const cW=44,cH=24,lblW=116,headerH=26,padding=4;
    const totalW=lblW+cW*months.length+padding*2;
    const totalH=headerH+cH*people.length+padding;
    return(
      <div style={{overflowX:"auto",width:"100%"}}>
        <svg width={Math.max(totalW,400)} height={totalH} style={{display:"block",minWidth:totalW}}>
          {/* Month headers */}
          {months.map((m,i)=>(
            <text key={m.id} x={lblW+cW*i+cW/2} y={headerH-8} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={9} fontFamily="Montserrat" fontWeight={600}>{MN[m.month_num-1].substring(0,3)}</text>
          ))}
          {/* Rows */}
          {people.map((p,ri)=>{
            const y=headerH+cH*ri;
            return(<g key={p.id}>
              {/* Person name */}
              <text x={lblW-8} y={y+cH/2+4} textAnchor="end" fill="rgba(255,255,255,0.7)" fontSize={10} fontFamily="Montserrat" fontWeight={500}>
                {(p.name.length>14?p.name.substring(0,13)+"…":p.name)}
              </text>
              {/* Cells */}
              {months.map((m,ci)=>{
                const bm=p.byMonth[ci];
                if(!bm)return(<rect key={m.id} x={lblW+cW*ci+1} y={y+1} width={cW-2} height={cH-2} rx={3} fill="rgba(255,255,255,0.025)"/>);
                const pctV=Math.round(bm.pct*100);
                const col=oc(bm.pct),bg=ob(bm.pct);
                return(<g key={m.id}>
                  <rect x={lblW+cW*ci+1} y={y+1} width={cW-2} height={cH-2} rx={3} fill={bg}/>
                  <text x={lblW+cW*ci+cW/2} y={y+cH/2+4} textAnchor="middle" fill={col} fontSize={9} fontFamily="Montserrat" fontWeight={700}>{pctV}%</text>
                </g>);
              })}
              {/* Avg at end */}
              <text x={lblW+cW*months.length+8} y={y+cH/2+4} fill={oc(p.avgPct/100)} fontSize={9} fontFamily="Montserrat" fontWeight={700}>{p.avgPct}%</text>
            </g>);
          })}
          {/* Avg header */}
          <text x={lblW+cW*months.length+8} y={headerH-8} fill="rgba(255,255,255,0.35)" fontSize={9} fontFamily="Montserrat" fontWeight={600}>Prom.</text>
        </svg>
      </div>
    );
  }

  if(!filteredMonths.length)return(
    <div style={{...glassHi,padding:32,textAlign:"center",maxWidth:500,margin:"40px auto"}}>
      <i className="ti ti-chart-bar" style={{fontSize:40,color:A,display:"block",marginBottom:14}}/>
      <div style={{fontWeight:700,fontSize:16,color:"#fff",marginBottom:8}}>Sin datos para {year}</div>
      <div style={{fontSize:13,color:T.m}}>No hay meses registrados para el equipo {team} en {year}.</div>
    </div>
  );

  return(
    <div>
      {/* ── Filters & Export ────────────────────────────────────────────── */}
      <div style={{...glass,padding:"12px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:T.d,fontWeight:600}}>Año</span>
          <select value={year} onChange={e=>setYear(parseInt(e.target.value))} style={{...SEL,width:90,padding:"5px 8px",fontSize:11}}>
            {availYears.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:T.d,fontWeight:600}}>Desde</span>
          <select value={fromMonth} onChange={e=>setFromMonth(parseInt(e.target.value))} style={{...SEL,width:120,padding:"5px 8px",fontSize:11}}>
            {MN.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:T.d,fontWeight:600}}>Hasta</span>
          <select value={toMonth} onChange={e=>setToMonth(parseInt(e.target.value))} style={{...SEL,width:120,padding:"5px 8px",fontSize:11}}>
            {MN.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div style={{marginLeft:"auto"}}>
          <button onClick={exportXLS} style={BP}>
            <i className="ti ti-file-spreadsheet" style={{fontSize:14}}/>Exportar XLS
          </button>
        </div>
      </div>

      {/* ── KPI Row 1: operacionales ─────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:8}}>
        {[
          {v:fmt(annualSoldH)+"h", l:"HH Asignadas",     n:`de ${Math.round(annualAvailH)} disponibles`,  c:"#fff",          i:"ti-clock"},
          {v:`${annualOcc}%`,      l:"Ocupación anual",   n:"promedio del período",                        c:oc(annualOcc/100),i:"ti-chart-line"},
          {v:fmt(annualFreeH)+"h", l:"HH Libres",         n:"capacidad sin vender",                        c:annualFreeH>0?"#FFA502":"#2ED573",i:"ti-clock-off"},
          {v:`${feeRatio}%`,       l:"Ratio fee",         n:`${100-feeRatio}% en proyectos`,               c:"#2ED573",       i:"ti-repeat"},
          {v:peakMonth?MN[peakMonth.month_num-1]:"—", l:"Mes más cargado", n:peakMonth?peakMonth.occPct+"% ocupación":"", c:"#FFA502",i:"ti-trending-up"},
        ].map((k,i)=>(
          <div key={i} style={{...glass,padding:"13px 15px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <i className={`ti ${k.i}`} style={{fontSize:13,color:k.c,opacity:.8}}/>
              <div style={{fontSize:9,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>{k.l}</div>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
            <div style={{fontSize:10,color:T.m,marginTop:5}}>{k.n}</div>
          </div>
        ))}
      </div>

      {/* ── KPI Row 2: riesgo y concentración ───────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>
        {[
          {v:fmt(annualAbs)+"h",   l:"HH Ausencias",      n:"vacaciones + licencias",                      c:"rgba(255,255,255,0.6)",i:"ti-calendar-off"},
          {v:fmt(annualOverHH)+"h",l:"HH Sobreutilización",n:"horas trabajadas de más",                    c:annualOverHH>0?"#FF4757":"#2ED573",i:"ti-alert-triangle"},
          {v:burnoutRisk,          l:"Riesgo burnout",     n:"personas con ≥2 meses sobre 100%",            c:burnoutRisk>0?"#FF4757":"#2ED573",i:"ti-flame"},
          {v:`${concentration}%`,  l:"Concentración top 3",n:sortedProjs.slice(0,3).map(p=>p.name?.split(" ")[0]).join(", ")||"—", c:concentration>60?"#FFA502":"rgba(255,255,255,0.6)",i:"ti-pie-chart"},
          {v:`${variability}pp`,   l:"Variabilidad",       n:`${quietMonth?MN[quietMonth.month_num-1]:"—"} más tranquilo`, c:variability>40?"#FFA502":"rgba(255,255,255,0.6)",i:"ti-arrows-vertical"},
        ].map((k,i)=>(
          <div key={i} style={{...glass,padding:"13px 15px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <i className={`ti ${k.i}`} style={{fontSize:13,color:k.c,opacity:.8}}/>
              <div style={{fontSize:9,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>{k.l}</div>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
            <div style={{fontSize:10,color:T.m,marginTop:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k.n}</div>
          </div>
        ))}
      </div>

      {/* ── Chart row 1: Stacked bars + Avail vs Sold ───────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{...glass,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>HH por tipo · mensual</div>
            <div style={{display:"flex",gap:10}}>{[["#2ED573","Fee"],[A,"Proyecto"],["rgba(255,255,255,0.2)","Interno"]].map(([c,l])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.m}}><div style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</div>))}</div>
          </div>
          <StackedBars metrics={monthMetrics}/>
        </div>
        <div style={{...glass,padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Disponible vs Asignado · mensual</div>
            <div style={{display:"flex",gap:10}}>{[["rgba(255,255,255,0.2)","Disponible"],[A,"Asignado"]].map(([c,l])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.m}}><div style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</div>))}</div>
          </div>
          <AvailVsSold metrics={monthMetrics}/>
        </div>
      </div>

      {/* ── Chart row 2: Occupancy line full width ───────────────────────── */}
      <div style={{...glass,padding:20,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Tendencia de ocupación % · mensual</div>
          <div style={{display:"flex",gap:12}}>{[["#FFA502","Umbral 85%"],["#FF4757","Límite 100%"]].map(([c,l])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:T.m}}><div style={{width:16,height:2,background:c,borderRadius:1}}/>{l}</div>))}</div>
        </div>
        <OccLine metrics={monthMetrics}/>
      </div>

      {/* ── Heatmap full width ───────────────────────────────────────────── */}
      <div style={{...glass,padding:20,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Mapa de ocupación · personas × meses</div>
          <div style={{display:"flex",gap:8}}>{[["#2ED573","50–84%"],["#FFA502","85–100%"],["#FF4757",">100%"],["rgba(255,255,255,0.08)","<50% / sin datos"]].map(([c,l])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.m}}><div style={{width:8,height:8,borderRadius:2,background:c}}/>{l}</div>))}</div>
        </div>
        <Heatmap people={personMetrics} months={filteredMonths}/>
      </div>

      {/* ── Ranking + Top projects ───────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={{...glass,padding:20}}>
          <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Ranking · personas por ocupación promedio</div>
          {personMetrics.slice(0,12).map((p,i)=>{
            const col=oc(p.avgPct/100);
            return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <span style={{fontSize:10,color:T.d,fontWeight:700,minWidth:14,textAlign:"right"}}>{i+1}</span>
              <div style={{width:26,height:26,borderRadius:"50%",background:ob(p.avgPct/100),border:`1px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:col,flexShrink:0}}>{p.initials||ini(p.name)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:9,color:T.d}}>{p.role||"—"} · {p.activeMonths}m{p.overMonths>0&&<span style={{color:"#FF4757",marginLeft:4}}>⚠ {p.overMonths} sobre 100%</span>}</div>
              </div>
              <div style={{width:72,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",flexShrink:0}}>
                <div style={{height:"100%",width:`${Math.min(p.avgPct,100)}%`,background:col,borderRadius:2}}/>
              </div>
              <span style={{fontSize:11,color:col,fontWeight:700,minWidth:36,textAlign:"right"}}>{p.avgPct}%</span>
            </div>);
          })}
        </div>
        <div style={{...glass,padding:20}}>
          <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Top proyectos · HH acumuladas en el período</div>
          {sortedProjs.slice(0,10).map((p,i)=>{
            const tC={fee:"#2ED573",proyecto:A,interno:T.d}[p.type]||T.d;
            const maxH=sortedProjs[0]?.hours||1;
            return(<div key={p.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
                  <span style={{fontSize:9,color:T.d,fontWeight:700,minWidth:12}}>{i+1}</span>
                  <span style={{fontSize:11,color:T.m,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:"rgba(255,255,255,0.06)",color:tC,fontWeight:600}}>{TYPE_LABELS[p.type]||p.type}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#fff",minWidth:42,textAlign:"right"}}>{fmt(p.hours)}h</span>
                </div>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.round(p.hours/maxH*100)}%`,background:tC,borderRadius:2,opacity:.8}}/>
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}


// ─── AUSENCIAS VIEW (standalone component to allow useState) ──────────────────
function AusenciasView({cur,monthId,data,setModal,deleteAbsence,deleteHoliday}){
  const [tab,setTab]=useState("ausencias");
  const {people,month}=cur;
  const monthAbsences=(data.absences||[]).filter(a=>a.month_id===monthId);
  const monthHolidays=(data.holidays||[]).filter(h=>h.year===month.year&&h.month_num===month.month_num);
  const totalAbsH=monthAbsences.reduce((s,a)=>s+parseFloat(a.hours),0);
  const totalHolH=monthHolidays.reduce((s,h)=>s+parseFloat(h.hours),0);
  return(<div>
    {/* KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
      {[{v:people.filter(p=>(data.absences||[]).some(a=>a.month_id===monthId&&a.person_id===p.id)).length,l:"Personas con ausencia",n:month.label,c:"#fff"},{v:fmt(totalAbsH)+"h",l:"HH ausencias individuales",n:"vacaciones + licencias",c:"#FFA502"},{v:monthHolidays.length,l:"Feriados del mes",n:"aplican solo a perfiles planta",c:"#7B6FFA"},{v:fmt(totalHolH)+"h",l:"HH feriados",n:"descontadas a planta",c:"#7B6FFA"}].map((k,i)=>(
        <div key={i} style={{...glass,padding:"14px 16px"}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{k.l}</div><div style={{fontSize:24,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div><div style={{fontSize:10,color:T.m,marginTop:5}}>{k.n}</div></div>
      ))}
    </div>
    {/* Tabs */}
    <div style={{display:"flex",gap:4,marginBottom:10}}>
      {[["ausencias","calendar-off","Ausencias individuales"],["feriados","calendar","Feriados globales"]].map(([id,icon,lbl])=>(
        <button key={id} onClick={()=>setTab(id)} style={{...(tab===id?BP:BG),fontSize:11}}><i className={`ti ti-${icon}`}/>{lbl}</button>
      ))}
    </div>
    {/* Ausencias tab */}
    {tab==="ausencias"&&(<div style={glass}>
      <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:11,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Ausencias · {month.label}</span>
        <button onClick={()=>setModal({type:"editAbsence",absence:{person_id:"",type:"vacaciones",hours:"8",notes:""}})} style={{...BP,fontSize:11,padding:"6px 12px"}}><i className="ti ti-plus"/>Registrar ausencia</button>
      </div>
      {monthAbsences.length>0&&(<div style={{display:"flex",gap:6,padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap"}}>{Object.entries(ABS_COLOR).map(([type,color])=>{const hrs=monthAbsences.filter(a=>a.type===type).reduce((s,a)=>s+parseFloat(a.hours),0);if(!hrs)return null;return(<div key={type} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:`${color}18`,border:`1px solid ${color}40`}}><span style={{fontSize:11,color}}>{ABS_LABEL[type]}</span><span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{fmt(hrs)}h</span></div>);})}</div>)}
      {people.map(p=>{const abs=monthAbsences.filter(a=>a.person_id===p.id);return(<div key={p.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"11px 18px"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(57,18,250,0.15)",border:"1px solid rgba(57,18,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#7B6FFA",flexShrink:0}}>{p.initials||ini(p.name)}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12,color:"#fff"}}>{p.name}</div><div style={{fontSize:10,color:A,marginTop:1}}>{p.role||"Sin cargo"}</div></div>
          {abs.length>0?<div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>{abs.map(a=>(<span key={a.id} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${ABS_COLOR[a.type]}18`,color:ABS_COLOR[a.type],fontWeight:700,border:`1px solid ${ABS_COLOR[a.type]}40`}}>{ABS_LABEL[a.type]?.split(" ").slice(1).join(" ")} {fmt(a.hours)}h</span>))}</div>:<span style={{fontSize:11,color:T.d,fontStyle:"italic"}}>Sin ausencias</span>}
          <button onClick={()=>setModal({type:"editAbsence",absence:{person_id:p.id,type:"vacaciones",hours:"8",notes:""}})} style={{...BG,padding:"5px 10px",fontSize:11,flexShrink:0}}><i className="ti ti-plus"/></button>
        </div>
        {abs.length>0&&(<div style={{padding:"0 18px 10px 62px",display:"flex",flexDirection:"column",gap:5}}>{abs.map(a=>(<div key={a.id} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 12px"}}><span style={{fontSize:18,lineHeight:1,flexShrink:0}}>{ABS_LABEL[a.type]?.split(" ")[0]}</span><div style={{flex:1,minWidth:0}}><span style={{fontSize:12,fontWeight:600,color:ABS_COLOR[a.type]}}>{ABS_LABEL[a.type]?.split(" ").slice(1).join(" ")}</span>{a.notes&&<span style={{fontSize:11,color:T.d,marginLeft:8}}>— {a.notes}</span>}</div><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{fmt(a.hours)} HH</span><button onClick={()=>setModal({type:"editAbsence",absence:{...a,hours:String(a.hours)}})} style={{...BG,padding:"4px 7px",fontSize:11}}><i className="ti ti-pencil"/></button><button onClick={()=>deleteAbsence(a.id)} style={{...BRed,padding:"4px 7px"}}><i className="ti ti-trash"/></button></div>))}</div>)}
      </div>);})}
      {people.length===0&&<div style={{padding:28,textAlign:"center",color:T.d,fontSize:13}}>No hay personas en este mes.</div>}
    </div>)}
    {/* Feriados tab */}
    {tab==="feriados"&&(<div style={glass}>
      <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><span style={{fontSize:11,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Feriados {month.year}</span><span style={{fontSize:11,color:T.d,marginLeft:10}}>— aplican solo a perfiles planta — freelancers no afectados</span></div>
        <button onClick={()=>setModal({type:"editHoliday",holiday:{name:"",hours:"8",date:"",year:String(month.year),month_num:String(month.month_num)}})} style={{...BP,fontSize:11,padding:"6px 12px"}}><i className="ti ti-plus"/>Agregar feriado</button>
      </div>
      {monthHolidays.length>0&&(<div style={{padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(57,18,250,0.06)"}}><div style={{fontSize:10,color:"#7B6FFA",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>📅 {month.label} — {totalHolH}h descontadas</div>{monthHolidays.map(h=>(<div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><span style={{fontSize:20,lineHeight:1}}>📅</span><div style={{flex:1}}><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>{h.name}</span>{h.date&&<span style={{fontSize:10,color:T.d,marginLeft:8}}>{new Date(h.date+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long"})}</span>}</div><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#7B6FFA"}}>{h.hours} HH</span><button onClick={()=>setModal({type:"editHoliday",holiday:{...h,hours:String(h.hours),year:String(h.year),month_num:String(h.month_num),date:h.date||""}})} style={{...BG,padding:"4px 7px",fontSize:11}}><i className="ti ti-pencil"/></button><button onClick={()=>deleteHoliday(h.id)} style={{...BRed,padding:"4px 7px"}}><i className="ti ti-trash"/></button></div>))}</div>)}
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(mn=>{const mHols=(data.holidays||[]).filter(h=>h.year===month.year&&h.month_num===mn&&!monthHolidays.find(x=>x.id===h.id));if(!mHols.length)return null;return(<div key={mn} style={{padding:"8px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><div style={{fontSize:10,color:T.d,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>{MN[mn-1]}</div>{mHols.map(h=>(<div key={h.id} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 0"}}><span style={{fontSize:16,lineHeight:1}}>📅</span><div style={{flex:1}}><span style={{fontSize:12,color:T.m}}>{h.name}</span>{h.date&&<span style={{fontSize:10,color:T.d,marginLeft:8}}>{new Date(h.date+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long"})}</span>}</div><span style={{fontFamily:"monospace",fontSize:11,color:T.d}}>{h.hours}h</span><button onClick={()=>setModal({type:"editHoliday",holiday:{...h,hours:String(h.hours),year:String(h.year),month_num:String(h.month_num),date:h.date||""}})} style={{...BG,padding:"3px 6px",fontSize:10}}><i className="ti ti-pencil"/></button><button onClick={()=>deleteHoliday(h.id)} style={{...BRed,padding:"3px 6px",fontSize:10}}><i className="ti ti-trash"/></button></div>))}</div>);})}
      {(data.holidays||[]).filter(h=>h.year===month.year).length===0&&<div style={{padding:24,textAlign:"center",color:T.d,fontSize:12}}>No hay feriados para {month.year}.</div>}
    </div>)}
  </div>);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [phase,setPhase]=useState("loading");
  const [session,setSession]=useState(getSession);
  const [data,setData]=useState(null);
  const [err,setErr]=useState(null);
  const [view,setView]=useState("dashboard");
  const [sub,setSub]=useState("grid");
  const [team,setTeam]=useState("PD");
  const [monthId,setMonthId]=useState(null);
  const [editCell,setEditCell]=useState(null);
  const [saving,setSaving]=useState(false);
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState(null);
  const [nm,setNm]=useState({year:"2026",month:"7",days:"20",copyFrom:""});

  function notify(msg,type="ok"){setToast({msg,type});setTimeout(()=>setToast(null),3000);}

  const load=useCallback(async()=>{
    setPhase("loading");
    try{
      const [teams,people,projects,months,avail,allocs,absences,holidays,monthProjects]=await Promise.all([
        db("cap_teams").select(),db("cap_people").select(),db("cap_projects").select(),
        db("cap_months").select(),db("cap_availability").select(),db("cap_allocations").select(),
        db("cap_absences").select(),db("cap_holidays").select(),db("cap_month_projects").select(),
      ]);
      if(teams.message)throw new Error(teams.message);
      setData({teams,people,projects,months,avail,allocs,absences,holidays,monthProjects});
      const pdId=teams.find(t=>t.slug==="PD")?.id;
      const pdM=months.filter(m=>m.team_id===pdId).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);
      setMonthId(p=>p||pdM[0]?.id||null);
      setPhase("app");
    }catch(e){setErr(e.message);setPhase("error");}
  },[]);

  useEffect(()=>{const s=getSession();if(s){setSession(s);load();}else setPhase("login");},[]);

  async function handleLogin(email,password){const s=await signIn(email,password);saveSession(s);setSession(s);await load();}
  function handleLogout(){clearSession();setSession(null);setPhase("login");}

  function md(){
    if(!data||!monthId)return null;
    const teamObj=data.teams.find(t=>t.slug===team);if(!teamObj)return null;
    const month=data.months.find(m=>m.id===monthId);if(!month||month.team_id!==teamObj.id)return null;
    const teamPeople=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active);
    const monthHolH=(data.holidays||[]).filter(h=>h.year===month.year&&h.month_num===month.month_num).reduce((s,h)=>s+parseFloat(h.hours),0);
    const people=teamPeople.map(p=>{
      const avRec=data.avail.find(a=>a.month_id===monthId&&a.person_id===p.id);
      const baseH=avRec?avRec.available_hours:p.default_hours;
      const isFreelance=(p.contract_type||"planta")==="freelance";
      const absH=isFreelance?0:(data.absences||[]).filter(a=>a.month_id===monthId&&a.person_id===p.id).reduce((s,a)=>s+parseFloat(a.hours),0);
      const holH=isFreelance?0:monthHolH;
      return{...p,avail_h:Math.max(0,baseH-absH-holH),base_h:baseH,abs_h:absH,hol_h:holH,avail_id:avRec?.id||null};
    });
    // Only show projects that are explicitly included in this month
    const monthProjIds=new Set((data.monthProjects||[]).filter(mp=>mp.month_id===monthId).map(mp=>mp.project_id));
    const projects=data.projects.filter(p=>p.team_id===teamObj.id&&p.is_active&&monthProjIds.has(p.id));
    // All team projects (for adding to month)
    const allTeamProjects=data.projects.filter(p=>p.team_id===teamObj.id&&p.is_active);
    const allocs=data.allocs.filter(a=>a.month_id===monthId);
    const getH=(pid,projId)=>{const a=allocs.find(x=>x.person_id===pid&&x.project_id===projId);return a?parseFloat(a.hours):0;};
    const pTotals=Object.fromEntries(people.map(p=>[p.id,allocs.filter(a=>a.person_id===p.id).reduce((s,a)=>s+parseFloat(a.hours),0)]));
    const isMonthEmpty=data.avail.filter(a=>a.month_id===monthId).length===0;
    return{teamObj,month,people,projects,allTeamProjects,allocs,getH,pTotals,isMonthEmpty,monthProjIds};
  }

  function teamMonths(){if(!data)return[];const tid=data.teams.find(t=>t.slug===team)?.id;return data.months.filter(m=>m.team_id===tid).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);}

  function monthDot(mId){if(!data)return"rgba(255,255,255,0.2)";const tid=data.teams.find(t=>t.slug===team)?.id;const month=data.months.find(m=>m.id===mId);if(!month||month.team_id!==tid)return"rgba(255,255,255,0.1)";const av=data.avail.filter(a=>a.month_id===mId);if(!av.length)return"rgba(255,255,255,0.2)";const sold=av.reduce((s,a)=>s+data.allocs.filter(x=>x.person_id===a.person_id&&x.month_id===mId).reduce((ss,x)=>ss+parseFloat(x.hours),0),0);const disp=av.reduce((s,a)=>s+a.available_hours,0);return oc(disp>0?sold/disp:0);}

  async function initializeMonth(mId,teamObj){setSaving(true);try{const tp=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active);const existing=data.avail.filter(a=>a.month_id===mId).map(a=>a.person_id);const toCreate=tp.filter(p=>!existing.includes(p.id));const results=[];for(const p of toCreate){const r=await db("cap_availability").insert({month_id:mId,person_id:p.id,available_hours:p.default_hours});if(r[0])results.push(r[0]);}setData(d=>({...d,avail:[...d.avail,...results]}));notify(`✓ Mes inicializado con ${toCreate.length} personas`);}finally{setSaving(false);}}

  async function upsertAlloc(mid,pid,projId,hours){
    const h=parseFloat(hours)||0;
    setSaving(true);
    try{
      // Auto-create availability record if missing
      const hasAv=data.avail.find(a=>a.month_id===mid&&a.person_id===pid);
      if(!hasAv){
        const person=data.people.find(x=>x.id===pid);
        const r=await db("cap_availability").insert({month_id:mid,person_id:pid,available_hours:person?.default_hours||160});
        if(r[0]) setData(d=>({...d,avail:[...d.avail,r[0]]}));
      }
      // Check if allocation already exists
      const existing=data.allocs.find(a=>a.month_id===mid&&a.person_id===pid&&a.project_id===projId);
      if(h>0){
        let saved=null;
        if(existing&&existing.id&&existing.id!=="__new__"){
          // UPDATE existing record
          const r=await db("cap_allocations").update(`id=eq.${existing.id}`,{hours:h,updated_at:new Date().toISOString()});
          saved=r[0]||{...existing,hours:h};
        } else {
          // INSERT new record
          const r=await db("cap_allocations").insert({month_id:mid,person_id:pid,project_id:projId,hours:h,updated_at:new Date().toISOString()});
          saved=r[0];
        }
        if(saved){
          setData(d=>({...d,allocs:[...d.allocs.filter(a=>!(a.month_id===mid&&a.person_id===pid&&a.project_id===projId)),saved]}));
        }
      } else {
        // Remove allocation (0 hours = clear)
        if(existing){
          await db("cap_allocations").remove(`month_id=eq.${mid}&person_id=eq.${pid}&project_id=eq.${projId}`);
        }
        setData(d=>({...d,allocs:d.allocs.filter(a=>!(a.month_id===mid&&a.person_id===pid&&a.project_id===projId))}));
      }
      notify("✓ Guardado");
    } catch(e){
      notify("Error al guardar: "+e.message,"err");
    } finally{
      setSaving(false);
    }
  }

  async function updateAvailHours(mid,pid,hours){const h=parseInt(hours)||0;setSaving(true);const ex=data.avail.find(a=>a.month_id===mid&&a.person_id===pid);try{if(ex){await db("cap_availability").update(`id=eq.${ex.id}`,{available_hours:h});setData(d=>({...d,avail:d.avail.map(a=>a.id===ex.id?{...a,available_hours:h}:a)}));}else{const r=await db("cap_availability").insert({month_id:mid,person_id:pid,available_hours:h});if(r[0])setData(d=>({...d,avail:[...d.avail,r[0]]}));}}finally{setSaving(false);}}

  async function togglePersonInMonth(mid,person,include){setSaving(true);try{if(include){const r=await db("cap_availability").insert({month_id:mid,person_id:person.id,available_hours:person.default_hours});if(r[0])setData(d=>({...d,avail:[...d.avail,r[0]]}));notify(`✓ ${person.name} agregado`);}else{await db("cap_availability").remove(`month_id=eq.${mid}&person_id=eq.${person.id}`);await db("cap_allocations").remove(`month_id=eq.${mid}&person_id=eq.${person.id}`);setData(d=>({...d,avail:d.avail.filter(a=>!(a.month_id===mid&&a.person_id===person.id)),allocs:d.allocs.filter(a=>!(a.month_id===mid&&a.person_id===person.id))}));notify(`✓ ${person.name} removido`);}}finally{setSaving(false);}}

  async function saveProject(proj){setSaving(true);try{if(proj.id){const r=await db("cap_projects").update(`id=eq.${proj.id}`,{name:proj.name,type:proj.type});if(r[0])setData(d=>({...d,projects:d.projects.map(p=>p.id===proj.id?r[0]:p)}));notify("✓ Proyecto actualizado");}else{const teamId=data.teams.find(t=>t.slug===team)?.id;const r=await db("cap_projects").insert({name:proj.name,type:proj.type,team_id:teamId,is_active:true});if(r[0]){setData(d=>({...d,projects:[...d.projects,r[0]]}));// Auto-add to current month
if(monthId){const mp=await db("cap_month_projects").insert({month_id:monthId,project_id:r[0].id});if(mp[0])setData(d=>({...d,monthProjects:[...d.monthProjects,mp[0]]}))};}notify("✓ Proyecto creado y añadido al mes actual");}setModal(null);}finally{setSaving(false);}}

  async function toggleProjectInMonth(mid,projectId,include){setSaving(true);try{if(include){const r=await db("cap_month_projects").insert({month_id:mid,project_id:projectId});if(r[0])setData(d=>({...d,monthProjects:[...d.monthProjects,r[0]]}));notify("✓ Proyecto añadido al mes");}else{await db("cap_month_projects").remove(`month_id=eq.${mid}&project_id=eq.${projectId}`);setData(d=>({...d,monthProjects:d.monthProjects.filter(mp=>!(mp.month_id===mid&&mp.project_id===projectId))}));notify("✓ Proyecto removido del mes");}}finally{setSaving(false);}}

  async function deactivateProject(projId){if(!confirm("¿Archivar este proyecto?"))return;await db("cap_projects").update(`id=eq.${projId}`,{is_active:false});setData(d=>({...d,projects:d.projects.map(p=>p.id===projId?{...p,is_active:false}:p)}));notify("✓ Proyecto archivado");}

  async function savePerson(person){
    setSaving(true);
    try{
      const teamId=data.teams.find(t=>t.slug===team)?.id;
      const newHours=parseInt(person.default_hours)||160;
      if(person.id){
        // Update person record
        const r=await db("cap_people").update(`id=eq.${person.id}`,{name:person.name,role:person.role,initials:person.initials||ini(person.name),default_hours:newHours,contract_type:person.contract_type||"planta"});
        if(r[0]) setData(d=>({...d,people:d.people.map(p=>p.id===person.id?r[0]:p)}));
        // Sync cap_availability for months where hours haven't been manually overridden
        // (i.e. still match the old default)
        const oldDefault=data.people.find(p=>p.id===person.id)?.default_hours||160;
        if(newHours!==oldDefault){
          // Update availability records that either:
          // a) match the old default exactly (weren't manually overridden), OR
          // b) match 160 (the original seed value, clearly stale)
          const toUpdate=data.avail.filter(a=>
            a.person_id===person.id&&
            (a.available_hours===oldDefault||a.available_hours===160)&&
            a.available_hours!==newHours
          );
          for(const a of toUpdate){
            await db("cap_availability").update(`id=eq.${a.id}`,{available_hours:newHours});
          }
          setData(d=>({...d,avail:d.avail.map(a=>
            a.person_id===person.id&&(a.available_hours===oldDefault||a.available_hours===160)&&a.available_hours!==newHours
              ?{...a,available_hours:newHours}
              :a
          )}));
          notify(`✓ Persona actualizada — HH ajustadas en ${toUpdate.length} mes${toUpdate.length!==1?"es":""}`);
        } else {
          notify("✓ Persona actualizada");
        }
      } else {
        const r=await db("cap_people").insert({name:person.name,role:person.role,initials:person.initials||ini(person.name),team_id:teamId,default_hours:newHours,contract_type:person.contract_type||"planta",is_active:true});
        if(r[0]){
          setData(d=>({...d,people:[...d.people,r[0]]}));
          if(monthId){
            const av=await db("cap_availability").insert({month_id:monthId,person_id:r[0].id,available_hours:newHours});
            if(av[0]) setData(d=>({...d,avail:[...d.avail,av[0]]}));
          }
          notify("✓ Persona agregada al equipo y al mes actual");
        }
      }
      setModal(null);
    }finally{setSaving(false);}
  }

  async function deactivatePerson(id,name){if(!confirm(`¿Desactivar a ${name}?`))return;await db("cap_people").update(`id=eq.${id}`,{is_active:false});setData(d=>({...d,people:d.people.map(p=>p.id===id?{...p,is_active:false}:p)}));notify("✓ Persona desactivada");}

  async function saveAbsence(absence){setSaving(true);try{if(absence.id){const r=await db("cap_absences").update(`id=eq.${absence.id}`,{type:absence.type,hours:parseFloat(absence.hours),notes:absence.notes||""});if(r[0])setData(d=>({...d,absences:d.absences.map(a=>a.id===absence.id?r[0]:a)}));notify("✓ Ausencia actualizada");}else{const r=await db("cap_absences").insert({person_id:absence.person_id,month_id:monthId,type:absence.type,hours:parseFloat(absence.hours),notes:absence.notes||""});if(r[0])setData(d=>({...d,absences:[...d.absences,r[0]]}));notify("✓ Ausencia registrada");}setModal(null);}finally{setSaving(false);}}

  async function deleteAbsence(id){if(!confirm("¿Eliminar este registro?"))return;await db("cap_absences").remove(`id=eq.${id}`);setData(d=>({...d,absences:d.absences.filter(a=>a.id!==id)}));notify("✓ Ausencia eliminada");}

  async function saveHoliday(h){setSaving(true);try{if(h.id){const r=await db("cap_holidays").update(`id=eq.${h.id}`,{name:h.name,hours:parseFloat(h.hours),date:h.date||null,year:parseInt(h.year),month_num:parseInt(h.month_num)});if(r[0])setData(d=>({...d,holidays:d.holidays.map(x=>x.id===h.id?r[0]:x)}));notify("✓ Feriado actualizado");}else{const r=await db("cap_holidays").insert({name:h.name,hours:parseFloat(h.hours),date:h.date||null,year:parseInt(h.year),month_num:parseInt(h.month_num)});if(r[0])setData(d=>({...d,holidays:[...d.holidays,r[0]]}));notify("✓ Feriado agregado");}setModal(null);}finally{setSaving(false);}}

  async function deleteHoliday(id){if(!confirm("¿Eliminar este feriado?"))return;await db("cap_holidays").remove(`id=eq.${id}`);setData(d=>({...d,holidays:d.holidays.filter(h=>h.id!==id)}));notify("✓ Feriado eliminado");}

  async function createMonth(){
    if(!data)return;const teamObj=data.teams.find(t=>t.slug===team);const label=`${MN[parseInt(nm.month)-1]} ${nm.year}`;setSaving(true);
    try{const r=await db("cap_months").insert({team_id:teamObj.id,year:parseInt(nm.year),month_num:parseInt(nm.month),label,work_days:parseInt(nm.days)});if(!r[0]){notify("Error al crear mes","err");return;}const newId=r[0].id;const newAv=[],newAl=[];
    const newMP=[];
    if(nm.copyFrom){
      // Copy availability
      const prevAv=data.avail.filter(a=>a.month_id===nm.copyFrom);
      for(const a of prevAv){const x=await db("cap_availability").insert({month_id:newId,person_id:a.person_id,available_hours:a.available_hours});if(x[0])newAv.push(x[0]);}
      // Copy all month projects from previous month
      const prevMP=(data.monthProjects||[]).filter(mp=>mp.month_id===nm.copyFrom);
      for(const mp of prevMP){const x=await db("cap_month_projects").insert({month_id:newId,project_id:mp.project_id});if(x[0])newMP.push(x[0]);}
      // Copy fee allocations
      const feeIds=data.projects.filter(p=>p.team_id===teamObj.id&&p.type==="fee").map(p=>p.id);
      const prevMPIds=new Set(prevMP.map(mp=>mp.project_id));
      const fees=data.allocs.filter(a=>a.month_id===nm.copyFrom&&feeIds.includes(a.project_id)&&prevMPIds.has(a.project_id));
      for(const a of fees){const x=await db("cap_allocations").insert({month_id:newId,person_id:a.person_id,project_id:a.project_id,hours:a.hours});if(x[0])newAl.push(x[0]);}
    } else {
      // Fresh month: add all active people
      const tp=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active);
      for(const p of tp){const x=await db("cap_availability").insert({month_id:newId,person_id:p.id,available_hours:p.default_hours});if(x[0])newAv.push(x[0]);}
      // Add fee projects by default
      const feeProjs=data.projects.filter(p=>p.team_id===teamObj.id&&p.type==="fee"&&p.is_active);
      for(const p of feeProjs){const x=await db("cap_month_projects").insert({month_id:newId,project_id:p.id});if(x[0])newMP.push(x[0]);}
    }
    setData(d=>({...d,months:[...d.months,r[0]],avail:[...d.avail,...newAv],allocs:[...d.allocs,...newAl],monthProjects:[...d.monthProjects,...newMP]}));setMonthId(newId);setView("matrix");setSub("grid");notify(`✓ ${label} creado`);}finally{setSaving(false);}
  }

  // ── SCREENS ───────────────────────────────────────────────────────────────
  if(phase==="login")return<LoginScreen onLogin={handleLogin}/>;
  if(phase==="loading")return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",gap:12,color:T.m,fontSize:14}}><i className="ti ti-loader-2" style={{fontSize:24,color:A}}/>Cargando...</div>);
  if(phase==="error")return(<div style={{maxWidth:500,margin:"60px auto",...glass,padding:28}}><p style={{fontWeight:700,color:"#FF4757",marginBottom:8}}>Error de conexión</p><pre style={{color:T.m,fontSize:12,whiteSpace:"pre-wrap",marginBottom:16}}>{err}</pre><button onClick={load} style={BP}>Reintentar</button></div>);

  const cur=md(),months=teamMonths();
  const teamPeopleActive=data.people.filter(p=>p.team_id===data.teams.find(t=>t.slug===team)?.id&&p.is_active);
  const NavItem=({id,icon,label})=>(<button onClick={()=>setView(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:view===id?"rgba(57,18,250,0.22)":"transparent",border:"1px solid "+(view===id?"rgba(57,18,250,0.4)":"transparent"),borderRadius:8,cursor:"pointer",fontSize:12,color:view===id?"#fff":T.m,fontWeight:view===id?700:400,width:"100%",textAlign:"left",marginBottom:2,fontFamily:"Montserrat,sans-serif"}}><i className={`ti ti-${icon}`} style={{fontSize:15,color:view===id?A:T.d}}/>{label}</button>);

  return(<div style={{display:"flex",height:"calc(100vh - 32px)",gap:12,position:"relative"}}>
    {/* Toast */}
    {toast&&(<div style={{position:"fixed",bottom:24,right:24,zIndex:200,...glass,padding:"12px 18px",borderColor:toast.type==="err"?"rgba(255,71,87,0.4)":"rgba(46,213,115,0.4)",background:toast.type==="err"?"rgba(255,71,87,0.12)":"rgba(46,213,115,0.1)",fontSize:13,color:"#fff",fontWeight:600,display:"flex",alignItems:"center",gap:8}}><i className={`ti ti-${toast.type==="err"?"alert-circle":"circle-check"}`} style={{color:toast.type==="err"?"#FF4757":"#2ED573",fontSize:16}}/>{toast.msg}</div>)}

    {/* Sidebar */}
    <div style={{...glass,width:200,display:"flex",flexDirection:"column",padding:"16px 10px",flexShrink:0}}>
      <div style={{padding:"4px 8px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}><div style={{fontWeight:800,fontSize:16,color:"#fff",letterSpacing:-.5}}>capacity<span style={{color:A}}>.</span></div><div style={{fontSize:10,color:T.d,marginTop:2,fontWeight:700,letterSpacing:".06em"}}>AGENCIA DIGITAL</div></div>
      <div style={{display:"flex",gap:4,marginBottom:14}}>{["PD","MKT"].map(t=>(<button key={t} onClick={()=>{setTeam(t);const tid=data.teams.find(x=>x.slug===t)?.id;const tm=data.months.filter(m=>m.team_id===tid).sort((a,b)=>b.year-a.year||b.month_num-a.month_num);if(tm[0])setMonthId(tm[0].id);}} style={{flex:1,padding:"6px 0",fontSize:11,fontWeight:700,borderRadius:8,cursor:"pointer",background:team===t?A:"rgba(255,255,255,0.06)",border:"1px solid "+(team===t?A:"rgba(255,255,255,0.1)"),color:team===t?"#fff":T.m,fontFamily:"Montserrat,sans-serif"}}>{t}</button>))}</div>
      <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6,paddingLeft:4}}>Vistas</div>
      <NavItem id="dashboard"  icon="chart-bar"    label="Dashboard"/>
      <NavItem id="matrix"     icon="table"        label="Capacity"/>
      <NavItem id="equipo"     icon="users"        label="Equipo"/>
      <NavItem id="proyectos"  icon="briefcase"    label="Proyectos"/>
      <NavItem id="ausencias"  icon="calendar-off" label="Ausencias"/>
      <NavItem id="anual"      icon="chart-bar"    label="Vista anual"/>
      <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",margin:"14px 0 6px",paddingLeft:4}}>Meses</div>
      <div style={{flex:1,overflowY:"auto"}}>{months.map(m=>{const noData=data.avail.filter(a=>a.month_id===m.id).length===0;return(<div key={m.id} onClick={()=>setMonthId(m.id)} style={{padding:"6px 8px",cursor:"pointer",fontSize:11,color:monthId===m.id?"#fff":T.m,fontWeight:monthId===m.id?700:400,display:"flex",alignItems:"center",gap:8,background:monthId===m.id?"rgba(57,18,250,0.2)":"transparent",borderRadius:6,marginBottom:2}}><span style={{width:6,height:6,borderRadius:"50%",background:noData?"rgba(255,255,255,0.15)":monthDot(m.id),flexShrink:0,border:noData?"1px dashed rgba(255,255,255,0.3)":"none"}}/><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label}</span>{noData&&<i className="ti ti-alert-circle" style={{fontSize:10,color:"#FFA502",flexShrink:0}}/>}</div>);})}</div>
      <button onClick={()=>setView("nuevo")} style={{...BP,width:"100%",justifyContent:"center",marginTop:8,fontSize:11}}><i className="ti ti-plus" style={{fontSize:13}}/>Nuevo mes</button>
    </div>

    {/* Main */}
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
      {/* Topbar */}
      <div style={{...glass,borderRadius:12,marginBottom:10,padding:"10px 18px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <span style={{fontWeight:800,fontSize:14,color:"#fff"}}>{{dashboard:"Dashboard",matrix:"Capacity",equipo:"Equipo",proyectos:"Proyectos",ausencias:"Ausencias",anual:"Vista Anual",nuevo:"Nuevo mes"}[view]}</span>
        <span style={{color:T.d,fontSize:11,marginLeft:4}}>{team} · {cur?.month.label||"—"}</span>
        {saving&&<span style={{fontSize:11,color:A,marginLeft:4}}><i className="ti ti-loader-2" style={{fontSize:12,marginRight:3}}/>Guardando...</span>}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {view==="equipo"&&<button onClick={()=>setModal({type:"editPerson",person:{name:"",role:"",initials:"",default_hours:"160"}})} style={BP}><i className="ti ti-user-plus"/>Agregar persona</button>}
          {view==="proyectos"&&<button onClick={()=>setModal({type:"editProject",project:{name:"",type:"proyecto"}})} style={BP}><i className="ti ti-plus"/>Nuevo proyecto</button>}
          {view==="ausencias"&&<button onClick={()=>setModal({type:"editAbsence",absence:{person_id:"",type:"vacaciones",hours:"8",notes:""}})} style={BP}><i className="ti ti-plus"/>Registrar ausencia</button>}
          <button onClick={load} style={BG} title="Recargar"><i className="ti ti-refresh"/></button>
          <button onClick={handleLogout} style={{...BG,borderColor:"rgba(255,71,87,0.25)",color:"rgba(255,71,87,0.7)"}} title="Cerrar sesión"><i className="ti ti-logout"/></button>
        </div>
      </div>

      {/* Matrix sub-tabs */}
      {view==="matrix"&&(<div style={{display:"flex",gap:4,marginBottom:10,flexShrink:0}}>{[["grid","table","Grilla de horas"],["cards","layout-grid","Resumen"],["config","settings","Configurar mes"]].map(([id,icon,lbl])=>(<button key={id} onClick={()=>setSub(id)} style={{...(sub===id?BP:BG),fontSize:11}}><i className={`ti ti-${icon}`}/>{lbl}</button>))}</div>)}

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",paddingRight:2}}>

        {/* DASHBOARD */}
        {view==="dashboard"&&cur&&(()=>{
          const{people,projects,getH,pTotals}=cur;
          const tSold=fmt(Object.values(pTotals).reduce((a,b)=>a+b,0));
          const tDisp=people.reduce((s,p)=>s+p.avail_h,0);
          const over=people.filter(p=>p.avail_h>0&&pTotals[p.id]>p.avail_h).length;
          const valid=people.filter(p=>p.avail_h>0);
          const avgP=valid.length?Math.round(valid.map(p=>Math.min(pTotals[p.id]/p.avail_h,2)*100).reduce((a,b)=>a+b,0)/valid.length):0;
          const libre=Math.max(0,tDisp-tSold);
          const byType={proyecto:0,fee:0,interno:0};projects.forEach(pr=>{const tot=people.reduce((s,p)=>s+getH(p.id,pr.id),0);byType[pr.type]=(byType[pr.type]||0)+tot;});
          const donut=[{label:"Proyectos",value:byType.proyecto,color:A},{label:"Fees",value:byType.fee,color:"#2ED573"},{label:"Interno",value:byType.interno,color:"rgba(255,255,255,0.25)"}].filter(s=>s.value>0);
          const barData=[...people].filter(p=>p.avail_h>0).sort((a,b)=>(pTotals[b.id]/b.avail_h)-(pTotals[a.id]/a.avail_h)).slice(0,10).map(p=>({label:p.name.split(" ")[0],value:pct(pTotals[p.id],p.avail_h)}));
          const tid=cur.teamObj.id;const allM=data.months.filter(m=>m.team_id===tid).sort((a,b)=>a.year-b.year||a.month_num-b.month_num);
          const trend=allM.map(m=>{const av=data.avail.filter(a=>a.month_id===m.id);const sold=av.reduce((s,a)=>s+data.allocs.filter(x=>x.person_id===a.person_id&&x.month_id===m.id).reduce((ss,x)=>ss+parseFloat(x.hours),0),0);const disp=av.reduce((s,a)=>s+a.available_hours,0);return{label:m.label.split(" ")[0],y:disp>0?Math.round(sold/disp*100):0};});
          return(<div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>{[{v:tSold,l:"HH Asignadas",n:`de ${tDisp} disponibles`,c:"#fff"},{v:libre,l:"HH Libres",n:`${Math.round(libre/tDisp*100)||0}% sin asignar`,c:libre>0?"#2ED573":"#FF4757"},{v:`${avgP}%`,l:"Ocupación promedio",n:"objetivo 80–90%",c:oc(avgP/100)},{v:over,l:"Sobreocupados",n:over>0?"requieren atención":"equipo balanceado",c:over>0?"#FF4757":"#2ED573"}].map((k,i)=>(<div key={i} style={{...glass,padding:"16px 18px"}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>{k.l}</div><div style={{fontSize:28,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div><div style={{fontSize:10,color:T.m,marginTop:6}}>{k.n}</div></div>))}</div>
            {people.filter(p=>p.avail_h>0&&pTotals[p.id]>p.avail_h).map((p,i)=>(<div key={"ov"+i} style={{...glass,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,borderColor:"rgba(255,71,87,0.35)",background:"rgba(255,71,87,0.1)"}}><i className="ti ti-alert-triangle" style={{fontSize:16,color:"#FF4757",flexShrink:0}}/><span style={{fontSize:12,color:"#fff"}}><strong>{p.name}</strong> al {pct(pTotals[p.id],p.avail_h)}% — sobrecarga de <strong>{fmt(pTotals[p.id]-p.avail_h)} HH</strong>. Redistribuir urgente.</span></div>))}
            {people.filter(p=>p.avail_h>=40&&pTotals[p.id]/p.avail_h<0.5).map((p,i)=>{const libre2=fmt(p.avail_h-pTotals[p.id]);const sinA=pTotals[p.id]===0;return(<div key={"un"+i} style={{...glass,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10,borderColor:"rgba(255,165,2,0.3)",background:"rgba(255,165,2,0.08)"}}><i className={`ti ti-${sinA?"user-off":"trending-down"}`} style={{fontSize:16,color:"#FFA502",flexShrink:0}}/><span style={{fontSize:12,color:"#fff"}}><strong>{p.name}</strong>{sinA?" — sin horas asignadas. Capacidad libre: ":` al ${pct(pTotals[p.id],p.avail_h)}% — capacidad libre: `}<strong style={{color:"#FFA502"}}>{libre2} HH</strong>{p.abs_h>0&&<span style={{fontSize:11,color:"rgba(255,165,2,0.7)",marginLeft:6}}>({fmt(p.abs_h)} HH ausencia)</span>}</span></div>);})}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div style={{...glass,padding:20}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Distribución de horas</div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20}}><DonutChart segments={donut} size={130} label={`${tSold}`} sublabel="HH total"/><div>{donut.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/><span style={{fontSize:11,color:T.m}}>{s.label}</span><span style={{fontSize:11,fontWeight:700,color:"#fff",marginLeft:"auto",paddingLeft:8}}>{fmt(s.value)}h</span></div>))}</div></div></div>
              <div style={{...glass,padding:20,display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16,alignSelf:"flex-start"}}>Ocupación del equipo</div><DonutChart segments={[{value:avgP,color:oc(avgP/100)},{value:Math.max(0,100-avgP),color:"rgba(255,255,255,0.05)"}]} size={130} label={`${avgP}%`} sublabel="promedio"/><div style={{display:"flex",justifyContent:"space-around",width:"100%",marginTop:12}}>{[["#2ED573","Óptimo","50–84%"],["#FFA502","Alto","85–100%"],["#FF4757","Sobre",">100%"]].map(([c,l,r])=>(<div key={l} style={{textAlign:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:c,margin:"0 auto 4px"}}/><div style={{fontSize:9,color:T.d}}>{l}</div><div style={{fontSize:9,color:T.d}}>{r}</div></div>))}</div></div>
              <div style={{...glass,padding:20}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Tendencia ocupación</div><TrendLine points={trend}/><div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>{trend.map((p,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:oc(p.y/100)}}>{p.y}%</div><div style={{fontSize:9,color:T.d}}>{p.label}</div></div>))}</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{...glass,padding:20}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Ocupación por persona</div><HBar data={barData}/></div>
              <div style={{...glass,padding:20}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Proyectos activos</div>{projects.map(p=>{const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0);if(!tot)return null;const tC={fee:A,proyecto:"#2ED573",interno:T.d}[p.type];return(<div key={p.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.m,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"75%"}}>{p.name}</span><span style={{fontSize:11,color:"#fff",fontWeight:700}}>{fmt(tot)}h</span></div><div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.round(tot/tSold*100)}%`,background:tC,borderRadius:2,opacity:.75}}/></div></div>);})}</div>
            </div>
          </div>);
        })()}

        {/* CAPACITY GRID */}
        {view==="matrix"&&sub==="grid"&&cur&&(()=>{
          const{people,projects,getH,pTotals,isMonthEmpty}=cur;
          if(isMonthEmpty)return(<div style={{...glassHi,padding:28,maxWidth:540,margin:"20px auto",textAlign:"center"}}><i className="ti ti-table-off" style={{fontSize:40,color:A,display:"block",marginBottom:14}}/><div style={{fontWeight:700,fontSize:16,color:"#fff",marginBottom:8}}>Mes sin datos</div><div style={{fontSize:13,color:T.m,marginBottom:20}}>Este mes no tiene disponibilidad configurada.</div><div style={{display:"flex",gap:10,justifyContent:"center"}}><button onClick={()=>initializeMonth(monthId,cur.teamObj)} style={BP}><i className="ti ti-users-plus"/>Inicializar con equipo completo</button><button onClick={()=>setSub("config")} style={BG}><i className="ti ti-settings"/>Configurar manualmente</button></div></div>);
          return(<div style={{...glass,overflowX:"auto"}}><table style={{borderCollapse:"collapse",fontSize:11,width:"100%"}}><thead><tr><th style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,0.08)",borderRight:"1px solid rgba(255,255,255,0.06)",textAlign:"left",minWidth:188,position:"sticky",left:0,zIndex:3,background:"rgba(7,7,20,0.97)",fontSize:10,fontWeight:700,color:T.d,textTransform:"uppercase",letterSpacing:".06em"}}>Proyecto</th><th style={{padding:"8px 8px",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:10,fontWeight:700,color:T.d,minWidth:52,textAlign:"center",background:"rgba(7,7,20,0.97)"}}>Total</th>{people.map(p=>{const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);return(<th key={p.id} style={{padding:"5px 7px",borderBottom:"1px solid rgba(255,255,255,0.08)",fontSize:10,fontWeight:600,color:T.m,whiteSpace:"nowrap",minWidth:62,textAlign:"center",background:ob(p2/100)||"rgba(7,7,20,0.97)"}}><div style={{color:T.m}}>{p.name.split(" ")[0]}</div><div style={{fontSize:9,color:col,fontWeight:700,marginTop:1}}>{p2}%</div></th>);})}</tr></thead><tbody>{projects.map(pr=>{const rowTot=people.reduce((s,p)=>s+getH(p.id,pr.id),0);const fee=pr.type!=="proyecto";const dot={fee:A,proyecto:"#2ED573",interno:T.d}[pr.type];return(<tr key={pr.id} style={{background:fee?"rgba(255,255,255,0.02)":"transparent"}}><td style={{padding:"5px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",borderRight:"1px solid rgba(255,255,255,0.05)",position:"sticky",left:0,zIndex:1,background:fee?"rgba(7,7,28,0.97)":"rgba(7,7,20,0.97)",minWidth:188,maxWidth:188,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:fee?T.m:T.p}}><span style={{width:6,height:6,borderRadius:"50%",background:dot,display:"inline-block",marginRight:8,verticalAlign:"middle"}}/>{pr.name}</td><td style={{padding:"5px 8px",borderBottom:"1px solid rgba(255,255,255,0.05)",textAlign:"center",fontFamily:"monospace",color:T.d,fontSize:11}}>{rowTot>0?fmt(rowTot):"—"}</td>{people.map(p=>{const h=getH(p.id,pr.id),ck=`${pr.id}_${p.id}`,editing=editCell===ck;return(<td key={p.id} onClick={()=>!editing&&setEditCell(ck)} style={{padding:"5px 6px",borderBottom:"1px solid rgba(255,255,255,0.05)",textAlign:"center",fontFamily:"monospace",cursor:"pointer",minWidth:62,color:h>0?"#fff":"rgba(255,255,255,0.12)",fontWeight:h>0?700:400,background:editing?"rgba(57,18,250,0.25)":"transparent"}}>{editing?<input autoFocus defaultValue={h||""} type="number" min="0" step="0.5" onBlur={e=>{upsertAlloc(monthId,p.id,pr.id,e.target.value);setEditCell(null);}} onKeyDown={e=>{if(e.key==="Enter")e.target.blur();if(e.key==="Escape")setEditCell(null);}} style={{...INP,width:54,padding:"3px 6px",textAlign:"center"}}/>:h>0?h:"·"}</td>);})}</tr>);})}
          <tr style={{background:"rgba(57,18,250,0.08)"}}><td style={{padding:"8px 12px",position:"sticky",left:0,background:"rgba(7,7,30,0.98)",zIndex:1,fontSize:10,fontWeight:700,color:T.d,textTransform:"uppercase",letterSpacing:".05em",borderTop:"1px solid rgba(57,18,250,0.3)"}}>Total asignado</td><td style={{padding:"8px 8px",textAlign:"center",fontFamily:"monospace",color:"#fff",fontWeight:700,borderTop:"1px solid rgba(57,18,250,0.3)"}}>{fmt(Object.values(pTotals).reduce((a,b)=>a+b,0))}</td>{people.map(p=>{const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);return<td key={p.id} style={{padding:"8px 6px",textAlign:"center",background:pTotals[p.id]>0?ob(p2/100):"transparent",color:pTotals[p.id]>0?col:T.d,fontFamily:"monospace",fontSize:11,fontWeight:700,borderTop:"1px solid rgba(57,18,250,0.2)"}}>{pTotals[p.id]>0?fmt(pTotals[p.id]):"—"}</td>;})}
          </tr><tr><td style={{padding:"5px 12px",position:"sticky",left:0,background:"rgba(7,7,20,0.98)",zIndex:1,fontSize:10,color:T.d}}>Horas disponibles</td><td style={{padding:"5px 8px",textAlign:"center",fontSize:10,color:T.d}}>{people.reduce((s,p)=>s+p.avail_h,0)}</td>{people.map(p=><td key={p.id} style={{padding:"5px 6px",textAlign:"center",fontFamily:"monospace",fontSize:10,color:T.d}}>{p.avail_h}</td>)}</tr><tr><td style={{padding:"5px 12px",position:"sticky",left:0,background:"rgba(7,7,20,0.98)",zIndex:1,fontSize:10,color:T.d}}>Horas libres</td><td style={{padding:"5px 8px",textAlign:"center",fontSize:10,color:"#2ED573"}}>{fmt(people.reduce((s,p)=>s+Math.max(0,p.avail_h-pTotals[p.id]),0))}</td>{people.map(p=>{const l=p.avail_h-pTotals[p.id];return<td key={p.id} style={{padding:"5px 6px",textAlign:"center",fontFamily:"monospace",fontSize:10,color:l<0?"#FF4757":l===0?"rgba(255,255,255,0.3)":"#2ED573",fontWeight:l<0?700:400}}>{fmt(l)}</td>;})}</tr></tbody></table></div>);
        })()}

        {/* CAPACITY CARDS */}
        {view==="matrix"&&sub==="cards"&&cur&&(()=>{
          const{people,projects,getH,pTotals,isMonthEmpty}=cur;
          if(isMonthEmpty)return(<div style={{...glassHi,padding:28,maxWidth:540,margin:"20px auto",textAlign:"center"}}><i className="ti ti-users-off" style={{fontSize:40,color:A,display:"block",marginBottom:14}}/><div style={{fontWeight:700,fontSize:16,color:"#fff",marginBottom:8}}>Mes sin datos</div><button onClick={()=>initializeMonth(monthId,cur.teamObj)} style={{...BP,margin:"0 auto"}}><i className="ti ti-users-plus"/>Inicializar mes</button></div>);
          return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>{people.map(p=>{const p2=pct(pTotals[p.id],p.avail_h),col=oc(p2/100);const projs=projects.map((pr,pi)=>({...pr,h:getH(p.id,pr.id),c:PC[pi%PC.length]})).filter(x=>x.h>0).sort((a,b)=>b.h-a.h);return(<div key={p.id} style={{...glass,padding:16}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><div style={{width:36,height:36,borderRadius:"50%",background:ob(p2/100),border:`1.5px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:col}}>{p.initials||ini(p.name)}</div><span style={{fontSize:11,padding:"3px 8px",borderRadius:20,background:ob(p2/100),color:col,fontWeight:700}}>{p2}%</span></div><div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:2}}>{p.name}</div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:10}}>
                    <div style={{fontSize:10,color:A,fontWeight:600}}>{p.role||"Sin cargo"}</div>
                    {(p.contract_type||"planta")==="freelance"&&<span style={{fontSize:8,padding:"1px 5px",borderRadius:8,background:"rgba(255,165,2,0.15)",color:"#FFA502",fontWeight:700}}>FL</span>}
                  </div><div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:4}}><div style={{height:"100%",borderRadius:2,width:`${Math.min(p2,100)}%`,background:col}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.d,marginBottom:10}}><span>{fmt(pTotals[p.id])} asig.</span><span>{p.avail_h} disp.</span></div>{projs.length===0&&<div style={{fontSize:10,color:T.d,fontStyle:"italic"}}>Sin asignaciones</div>}{projs.slice(0,4).map(pr=>(<div key={pr.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:11,borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{width:6,height:6,borderRadius:"50%",background:pr.c,flexShrink:0}}/><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.m}}>{pr.name}</span><span style={{color:"#fff",fontSize:10,fontWeight:700}}>{pr.h}h</span></div>))}</div>);})}</div>);
        })()}

        {/* CAPACITY CONFIG */}
        {view==="matrix"&&sub==="config"&&cur&&(()=>{
          const{people,month,teamObj,pTotals,isMonthEmpty}=cur;
          const inMonth=people.map(p=>p.id);
          const notInMonth=data.people.filter(p=>p.team_id===teamObj.id&&p.is_active&&!inMonth.includes(p.id));
          return(<div style={{maxWidth:720}}>
            <div style={{...glass,padding:20,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><div><div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{month.label}</div><div style={{fontSize:11,color:T.d,marginTop:3}}>{month.work_days} días laborales · {people.length} personas en el mes</div></div>{isMonthEmpty&&<button onClick={()=>initializeMonth(monthId,teamObj)} style={BP}><i className="ti ti-users-plus"/>Inicializar con equipo completo</button>}</div>
              <div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Personas en este mes</div>
              {people.length===0&&<div style={{fontSize:12,color:T.d,padding:"12px 0",fontStyle:"italic"}}>No hay personas. Inicializa el mes o agrega manualmente.</div>}
              {people.map(p=>{const p2=pct((pTotals[p.id]||0),p.avail_h),col=oc(p2/100);return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><div style={{width:32,height:32,borderRadius:"50%",background:ob(p2/100),border:`1px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:col,flexShrink:0}}>{p.initials||ini(p.name)}</div><div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{fontWeight:600,fontSize:12,color:"#fff"}}>{p.name}</div>{(p.contract_type||"planta")==="freelance"&&<span style={{fontSize:8,padding:"1px 5px",borderRadius:6,background:"rgba(255,165,2,0.15)",color:"#FFA502",fontWeight:700}}>FREELANCE</span>}</div>
                  <div style={{fontSize:10,color:A}}>{p.role||"Sin cargo"}</div>
                </div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,color:T.d}}>HH disp.</span><input type="number" min="0" max="240" defaultValue={p.avail_h} onBlur={e=>updateAvailHours(monthId,p.id,e.target.value)} onKeyDown={e=>{if(e.key==="Enter")e.target.blur();}} style={{...INP,width:70,textAlign:"center",padding:"5px 8px",boxSizing:"border-box"}}/></div><div style={{fontSize:11,color:col,fontWeight:700,minWidth:42,textAlign:"right"}}>{p2}%</div><button onClick={()=>togglePersonInMonth(monthId,p,false)} style={{...BRed,padding:"5px 8px"}} title="Quitar del mes"><i className="ti ti-user-minus"/></button></div>);})}
              {notInMonth.length>0&&(<div style={{marginTop:18}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Agregar al mes</div>{notInMonth.map(p=>(<div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:T.d,flexShrink:0}}>{p.initials||ini(p.name)}</div><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12,color:T.m}}>{p.name}</div><div style={{fontSize:10,color:T.d}}>{p.role||"Sin cargo"}</div></div><button onClick={()=>togglePersonInMonth(monthId,p,true)} style={BP}><i className="ti ti-user-plus"/>Agregar</button></div>))}</div>)}
            </div>
            <div style={{...glass,padding:20}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Proyectos en este mes</div>
              {/* Projects IN this month */}
              {cur.projects.length===0&&<div style={{fontSize:12,color:T.d,padding:"8px 0",fontStyle:"italic"}}>No hay proyectos en este mes. Agrega desde abajo.</div>}
              {cur.projects.map((pr,pi)=>{const tot=people.reduce((s,p)=>s+cur.getH(p.id,pr.id),0);const tC={fee:A,proyecto:"#2ED573",interno:T.d}[pr.type];return(<div key={pr.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><span style={{width:7,height:7,borderRadius:"50%",background:PC[pi%PC.length],flexShrink:0}}/><span style={{flex:1,fontSize:12,color:"#fff",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pr.name}</span><span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(255,255,255,0.07)",color:tC,fontWeight:600,flexShrink:0}}>{TYPE_LABELS[pr.type]}</span><span style={{fontFamily:"monospace",fontSize:11,color:tot>0?"#fff":T.d,fontWeight:700,flexShrink:0,minWidth:44,textAlign:"right"}}>{tot>0?fmt(tot)+"h":"sin horas"}</span><button onClick={()=>toggleProjectInMonth(monthId,pr.id,false)} style={{...BRed,padding:"4px 8px",fontSize:10,flexShrink:0}} title="Quitar del mes"><i className="ti ti-x"/></button></div>);})}
              {/* Projects NOT in this month */}
              {(()=>{const notIn=cur.allTeamProjects.filter(p=>!cur.monthProjIds.has(p.id));if(!notIn.length)return null;return(<div style={{marginTop:16}}><div style={{fontSize:10,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Agregar al mes</div>{notIn.map(pr=>{const tC={fee:A,proyecto:"#2ED573",interno:T.d}[pr.type];return(<div key={pr.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><span style={{width:7,height:7,borderRadius:"50%",background:"rgba(255,255,255,0.15)",flexShrink:0}}/><span style={{flex:1,fontSize:12,color:T.m,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pr.name}</span><span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(255,255,255,0.05)",color:tC,fontWeight:600,flexShrink:0}}>{TYPE_LABELS[pr.type]}</span><button onClick={()=>toggleProjectInMonth(monthId,pr.id,true)} style={{...BP,padding:"4px 10px",fontSize:10,flexShrink:0}}><i className="ti ti-plus"/>Añadir</button></div>);})}</div>);})()}
              <button onClick={()=>setModal({type:"editProject",project:{name:"",type:"proyecto"}})} style={{...BG,marginTop:14,fontSize:11}}><i className="ti ti-plus"/>Nuevo proyecto</button>
            </div>
          </div>);
        })()}

        {/* EQUIPO */}
        {view==="equipo"&&cur&&(()=>{
          const{pTotals}=cur;
          return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
            {teamPeopleActive.map(p=>{const tot=pTotals[p.id]??0;const avH=data.avail.find(a=>a.month_id===monthId&&a.person_id===p.id)?.available_hours??p.default_hours;const p2=pct(tot,avH),col=oc(p2/100);return(<div key={p.id} style={{...glass,padding:18}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}><div style={{width:40,height:40,borderRadius:"50%",background:ob(p2/100),border:`1.5px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:col}}>{p.initials||ini(p.name)}</div><div style={{display:"flex",gap:4}}><button onClick={()=>setModal({type:"editPerson",person:{...p,default_hours:String(p.default_hours)}})} style={{...BG,padding:"4px 8px",fontSize:11}}><i className="ti ti-pencil"/></button><button onClick={()=>deactivatePerson(p.id,p.name)} style={{...BRed,padding:"4px 8px"}}><i className="ti ti-user-minus"/></button></div></div><div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:3}}>{p.name}</div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                  <div style={{fontSize:11,color:A,fontWeight:600}}>{p.role||"Sin cargo"}</div>
                  {(p.contract_type||"planta")==="freelance"&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:"rgba(255,165,2,0.15)",color:"#FFA502",fontWeight:700,border:"1px solid rgba(255,165,2,0.3)"}}>FREELANCE</span>}
                </div><div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:6}}><div style={{height:"100%",borderRadius:2,width:`${Math.min(p2,100)}%`,background:col}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:col,fontWeight:700}}>{p2}% ocupado</span><span style={{color:T.d}}>{avH} HH · {p.default_hours} default</span></div></div>);})}
            {teamPeopleActive.length===0&&(<div style={{...glass,padding:28,textAlign:"center",gridColumn:"1/-1"}}><i className="ti ti-users-off" style={{fontSize:36,color:T.d,display:"block",marginBottom:12}}/><div style={{color:T.m,fontSize:13}}>No hay personas activas en el equipo {team}.</div><button onClick={()=>setModal({type:"editPerson",person:{name:"",role:"",initials:"",default_hours:"160"}})} style={{...BP,margin:"16px auto 0"}}><i className="ti ti-user-plus"/>Agregar primera persona</button></div>)}
          </div>);
        })()}

        {/* PROYECTOS */}
        {view==="proyectos"&&cur&&(()=>{
          const{people,projects,getH,pTotals}=cur;
          return(<div style={glass}><div style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.d,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Proyectos · {cur.month.label}</span><button onClick={()=>setModal({type:"editProject",project:{name:"",type:"proyecto"}})} style={{...BP,fontSize:11,padding:"6px 12px"}}><i className="ti ti-plus"/>Nuevo proyecto</button></div>{projects.length===0&&<div style={{padding:28,textAlign:"center",color:T.d,fontSize:13}}>No hay proyectos activos para el equipo {team}.</div>}{projects.map((p,pi)=>{const tot=people.reduce((s,pe)=>s+getH(pe.id,p.id),0);const assigned=people.filter(pe=>getH(pe.id,p.id)>0);const tC={fee:[A,"rgba(57,18,250,0.12)"],proyecto:["#2ED573","rgba(46,213,115,0.1)"],interno:[T.d,"rgba(255,255,255,0.04)"]}[p.type];return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{width:8,height:8,borderRadius:"50%",background:PC[pi%PC.length],flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:12,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div><div style={{fontSize:10,color:T.d,marginTop:1}}>{assigned.length} persona{assigned.length!==1?"s":""} asignada{assigned.length!==1?"s":""}</div></div><span style={{fontSize:10,padding:"2px 10px",borderRadius:20,background:tC[1],color:tC[0],fontWeight:700,flexShrink:0}}>{TYPE_LABELS[p.type]}</span><div style={{display:"flex",marginRight:4}}>{assigned.slice(0,4).map(pe=>{const col2=oc(pct(pTotals[pe.id]??0,data.avail.find(a=>a.month_id===monthId&&a.person_id===pe.id)?.available_hours??pe.default_hours)/100);return<div key={pe.id} title={pe.name} style={{width:22,height:22,borderRadius:"50%",background:ob(0.6),border:`1px solid ${col2}40`,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",marginRight:-5,color:col2}}>{pe.initials||ini(pe.name)}</div>;})}{ assigned.length>4&&<span style={{fontSize:10,color:T.d,marginLeft:12,alignSelf:"center"}}>+{assigned.length-4}</span>}</div><span style={{fontFamily:"monospace",color:tot>0?"#fff":T.d,fontWeight:700,minWidth:46,textAlign:"right"}}>{tot>0?fmt(tot)+"h":"—"}</span><div style={{display:"flex",gap:4}}><button onClick={()=>setModal({type:"editProject",project:{...p}})} style={{...BG,padding:"4px 8px",fontSize:11}}><i className="ti ti-pencil"/></button><button onClick={()=>deactivateProject(p.id)} style={{...BRed,padding:"4px 8px"}}><i className="ti ti-archive"/></button></div></div>);})}</div>);
        })()}

        {/* AUSENCIAS */}
        {view==="ausencias"&&cur&&(
          <AusenciasView cur={cur} monthId={monthId} data={data} setModal={setModal} deleteAbsence={deleteAbsence} deleteHoliday={deleteHoliday}/>
        )}

        {/* VISTA ANUAL */}
        {view==="anual"&&(
          <AnualView data={data} team={team}/>
        )}

        {/* NUEVO MES */}
        {view==="nuevo"&&(<div style={{maxWidth:480}}><div style={{...glass,padding:26}}><div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:22}}><i className="ti ti-calendar-plus" style={{fontSize:16,marginRight:8,color:A,verticalAlign:-2}}/>Crear nuevo mes — {team}</div><div style={{display:"flex",gap:12,marginBottom:14}}><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Mes</label><select value={nm.month} onChange={e=>setNm(m=>({...m,month:e.target.value}))} style={SEL}>{MN.map((mn,i)=><option key={i} value={i+1}>{mn}</option>)}</select></div><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Año</label><input value={nm.year} onChange={e=>setNm(m=>({...m,year:e.target.value}))} type="number" style={{...INP,boxSizing:"border-box"}}/></div></div><div style={{display:"flex",gap:12,marginBottom:14}}><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Días laborales</label><input value={nm.days} onChange={e=>setNm(m=>({...m,days:e.target.value}))} type="number" style={{...INP,boxSizing:"border-box"}}/></div><div style={{flex:1}}><label style={{display:"block",fontSize:11,color:T.m,marginBottom:6,fontWeight:600}}>Copiar desde</label><select value={nm.copyFrom} onChange={e=>setNm(m=>({...m,copyFrom:e.target.value}))} style={SEL}><option value="">Equipo completo (sin horas)</option>{months.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></div></div><div style={{background:"rgba(57,18,250,0.12)",border:"1px solid rgba(57,18,250,0.3)",borderRadius:8,padding:"10px 14px",fontSize:11,color:T.m,marginBottom:22}}><i className="ti ti-info-circle" style={{fontSize:13,marginRight:6,verticalAlign:-2,color:A}}/>{nm.copyFrom?"Se copiarán las fees mensuales, disponibilidad y equipo del mes origen.":"Se inicializará con todas las personas activas del equipo a sus horas por defecto."}</div><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><button onClick={()=>setView("dashboard")} style={BG}>Cancelar</button><button onClick={createMonth} style={BP}><i className="ti ti-check"/>Crear mes</button></div></div></div>)}

      </div>
    </div>

    {/* MODALS */}
    {modal?.type==="editPerson"&&(<Modal title={modal.person.id?"Editar persona":"Agregar persona"} onClose={()=>setModal(null)}><PersonForm initial={modal.person} onSave={savePerson} onCancel={()=>setModal(null)}/></Modal>)}
    {modal?.type==="editProject"&&(<Modal title={modal.project.id?"Editar proyecto":"Nuevo proyecto"} onClose={()=>setModal(null)}><ProjectForm initial={modal.project} onSave={saveProject} onCancel={()=>setModal(null)}/></Modal>)}
    {modal?.type==="editAbsence"&&cur&&(<Modal title={modal.absence.id?"Editar ausencia":"Registrar ausencia"} onClose={()=>setModal(null)} width={720}><AbsenceForm initial={modal.absence} people={cur.people} holidays={data.holidays||[]} existingAbsences={data.absences||[]} monthYear={{year:cur.month.year,month:cur.month.month_num}} onSave={saveAbsence} onCancel={()=>setModal(null)}/></Modal>)}
    {modal?.type==="editHoliday"&&(<Modal title={modal.holiday.id?"Editar feriado":"Agregar feriado"} onClose={()=>setModal(null)}><HolidayForm initial={modal.holiday} onSave={saveHoliday} onCancel={()=>setModal(null)}/></Modal>)}

  </div>);
}
