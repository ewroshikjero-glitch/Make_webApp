/* MAKE.INC Studio Portal — zero-dependency interactive PWA.
   Demo mode is SAMPLE DATA, never a security boundary. Set config.js
   and run supabase-schema.sql for production multi-user functionality. */
(() => {
'use strict';
const CONFIG = window.MAKE_INC_CONFIG || {};
const LIVE = Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
const URL_BASE = String(CONFIG.supabaseUrl || '').replace(/\/$/,'');
const ROOT = document.getElementById('root');
const TZ = 'Asia/Kolkata';
const MS = 60000;
const icons = {
 dashboard:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
 tasks:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 10 2 2 4-4M8 16h8"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 wallet:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M16 16h2"/><path d="M6 6V4h12"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.3a4 4 0 0 1 0 7.4M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
 logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>',
 chevronDown:'<path d="m6 9 6 6 6-6"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 coffee:'<path d="M4 8h14v7a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V8ZM18 10h2a2 2 0 0 1 0 4h-2M4 4h14"/>',
 utensils:'<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M18 3c-3 3-4 6-4 11h4v7"/>',
 pause:'<rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/>',
 play:'<path d="m8 5 12 7-12 7V5Z"/>',
 stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
 alert:'<path d="M10.3 3.5 1.8 18.2A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.8L13.7 3.5a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
 trending:'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
 chart:'<path d="M3 3v18h18M7 16v-4M12 16V7M17 16v-8"/>',
 briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h20"/>',
 receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3ZM9 8h6M9 12h6"/>',
 edit:'<path d="m16 4 4 4-11 11-5 1 1-5L16 4Z"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 18v3h16v-3"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5M5 9a8 8 0 0 1 14-2l1 5M4 12l1 5a8 8 0 0 0 14-2"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 file:'<path d="M5 3h9l5 5v13H5V3Zm9 0v5h5"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.3l-2.5 2.5a2 2 0 0 0-2.3-.4 2 2 0 0 0-1.5 1.8h-3a2 2 0 0 0-1.5-1.8 2 2 0 0 0-2.3.4l-2.5-2.5a2 2 0 0 0 .4-2.3A2 2 0 0 0 2.8 13v-3A2 2 0 0 0 4.6 8.5a2 2 0 0 0-.4-2.3l2.5-2.5a2 2 0 0 0 2.3.4A2 2 0 0 0 10.5 2h3A2 2 0 0 0 15 4.1a2 2 0 0 0 2.3-.4l2.5 2.5a2 2 0 0 0-.4 2.3 2 2 0 0 0 1.8 1.5v3a2 2 0 0 0-1.8 2Z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
 sheets:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8M8 17h8M10 9h4"/>',
 external:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
 spinner:'<path d="M21 12a9 9 0 1 1-9-9"/>'
};
const I=(name,cls='icon')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.info}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeAttr=esc;
const nDate=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
// en-CA returns YYYY-MM-DD on typical Intl builds; normalize defensively.
const dayKey=(d=new Date())=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(d));const val=x=>parts.find(p=>p.type===x)?.value;return `${val('year')}-${val('month')}-${val('day')}`};
const stamp=d=>new Date(d).toISOString();
const dated=(d,opts={})=>d?new Intl.DateTimeFormat('en-IN',{timeZone:TZ,day:'2-digit',month:'short',year:'numeric',...opts}).format(new Date(d)): '—';
const dateOnly=d=>d?new Date(`${d}T12:00:00+05:30`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',timeZone:TZ}):'—';
const clockTime=d=>d?new Intl.DateTimeFormat('en-IN',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date(d)):'—';
const currency=v=>'₹'+Number(v||0).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2});
const uid=()=>globalThis.crypto?.randomUUID?.()||('id-'+Date.now()+'-'+Math.random().toString(36).slice(2));
const fmtMs=ms=>{const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
const fmtHours=ms=>(Math.max(0,ms)/3600000).toFixed(1)+'h';
const initials=name=>String(name||'MI').split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
const isManager=p=>p?.role==='admin'||p?.role==='principal';
const roleLabel=r=>({employee:'Employee',admin:'Administrator',principal:'Principal Architect'}[r]||r);
const statusBadge=s=>{const color=({approved:'green',completed:'green',done:'green',active:'green',paid:'green',in_progress:'blue',pending:'amber',todo:'gray',rejected:'red',inactive:'red'}[s]||'gray');const label=({in_progress:'In progress',todo:'To do',done:'Completed'}[s]||s);return `<span class="badge ${color}">${esc((label||'').replace(/^./,c=>c.toUpperCase()))}</span>`};
const priorityBadge=p=>`<span class="priority ${esc(p||'low')}">${esc((p||'low').replace(/^./,c=>c.toUpperCase()))}</span>`;
const userOf=id=>state.data.profiles.find(p=>p.id===id);
const nameOf=id=>userOf(id)?.full_name||'Unknown employee';
const own=arr=>arr.filter(x=>x.user_id===state.user?.id);
const sorted=(arr,key='created_at')=>[...arr].sort((a,b)=>new Date(b[key]||0)-new Date(a[key]||0));
const fmtLabel=d=>new Intl.DateTimeFormat('en-IN',{timeZone:TZ,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(d)).toUpperCase();
const state={session:null,user:null,data:{profiles:[],shifts:[],break_entries:[],tasks:[],leave_requests:[],reimbursements:[]},view:'dashboard',modal:null,authMode:'login',busy:false,mobileMenu:false,filter:'all',dismissed:new Set(),noticeSignature:'',lastNotice:null,loaded:false,googleUser:null,linkedSheetId:localStorage.getItem('makeinc_sheet_id')||'',linkedSheetTitle:localStorage.getItem('makeinc_sheet_title')||'',lastSheetSync:localStorage.getItem('makeinc_last_sheet_sync')||'',driveSheets:[]};
const DB_KEY='makeinc_demo_db_v2', SESSION_KEY='makeinc_demo_session_v2', AUTH_KEY='makeinc_live_session_v2';
const persistDB=()=>{try{localStorage.setItem(DB_KEY,JSON.stringify(state.data))}catch{}};
const persistSession=()=>{try{if(state.session)localStorage.setItem(LIVE?AUTH_KEY:SESSION_KEY,JSON.stringify(state.session));else localStorage.removeItem(LIVE?AUTH_KEY:SESSION_KEY)}catch{}};
const readLocal=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
function demoData(){
 const people=[
  ['demo-principal','Arjun Varma','arjun@make.inc','principal','Principal Architect',true],
  ['demo-admin','Riya Thomas','riya@make.inc','admin','Studio Administrator',true],
  ['demo-employee','Neha Menon','neha@make.inc','employee','Junior Architect',true],
  ['demo-joel','Joel George','joel@make.inc','employee','Site Architect',true],
  ['demo-sana','Sana Ali','sana@make.inc','employee','Interior Designer',true],
  ['demo-pending','Priya Nair','priya@make.inc','employee','Architect',false]
 ];
 const profiles=people.map(([id,full_name,email,role,job_title,is_active])=>({id,full_name,email,role,job_title,is_active,phone:'',created_at:new Date().toISOString()}));
 const now=Date.now();const start=new Date(now-3.2*3600000);
 const shifts=[{id:'d-shift-current',user_id:'demo-employee',punched_in_at:start.toISOString(),punched_out_at:null}];
 let si=0;for(const who of ['demo-employee','demo-joel','demo-sana'])for(let k=1;k<=5;k++){const d=new Date(now-k*86400000);if([0,6].includes(d.getDay()))continue;const morning=new Date(d);morning.setHours(9,15,0,0);const end=new Date(morning.getTime()+(7.2+(si%3)*.55)*3600000);shifts.push({id:`old-${si++}`,user_id:who,punched_in_at:morning.toISOString(),punched_out_at:end.toISOString()})}
 const break_entries=[{id:'d-break-old',shift_id:'d-shift-current',user_id:'demo-employee',kind:'tea',started_at:new Date(now-1.4*3600000).toISOString(),ended_at:new Date(now-1.14*3600000).toISOString()}];
 const tasks=[
  ['Concept sketches for waterfront villa','demo-employee','Waterfront Residence','high','in_progress',0],
  ['Review material palette & finishes','demo-employee','The Grove House','medium','todo',1],
  ['Update first floor working drawings','demo-employee','The Grove House','high','todo',2],
  ['Coordinate with MEP consultant','demo-joel','Cedar Commercial','high','in_progress',0],
  ['Site visit & quality checklist','demo-joel','Waterfront Residence','medium','todo',1],
  ['Mood boards for client presentation','demo-sana','Atrium Interiors','medium','done',-1],
  ['Furniture layout proposal','demo-sana','Atrium Interiors','low','in_progress',3],
  ['Prepare tender schedule','demo-employee','Cedar Commercial','low','done',-2]
 ].map(([title,assignee_id,project,priority,status,diff],i)=>({id:`demo-task-${i}`,title,description:i===0?'Present two massing options and façade studies in the review.':'',project,assignee_id,assigned_by:'demo-principal',priority,status,due_date:new Date(Date.now()+diff*86400000).toISOString().slice(0,10),created_at:new Date(now-i*3600000).toISOString()}));
 const leave_requests=[{id:'demo-leave-1',user_id:'demo-joel',type:'sick',start_date:dayKey(),end_date:dayKey(),reason:'Medical appointment',status:'pending',created_at:new Date(now-3600000).toISOString()}, {id:'demo-leave-2',user_id:'demo-sana',type:'normal',start_date:new Date(now+4*86400000).toISOString().slice(0,10),end_date:new Date(now+5*86400000).toISOString().slice(0,10),reason:'Personal commitments',status:'pending',created_at:new Date(now-2*86400000).toISOString()}, {id:'demo-leave-3',user_id:'demo-employee',type:'normal',start_date:new Date(now-9*86400000).toISOString().slice(0,10),end_date:new Date(now-9*86400000).toISOString().slice(0,10),reason:'Family function',status:'approved',created_at:new Date(now-16*86400000).toISOString()}];
 const reimbursements=[{id:'demo-exp-1',user_id:'demo-employee',amount:850,category:'Site',spent_on:dayKey(),description:'Site stationery and printouts',status:'pending',receipt_path:null,created_at:new Date(now-4200000).toISOString()}, {id:'demo-exp-2',user_id:'demo-joel',amount:1460,category:'Travel',spent_on:dayKey(),description:'Taxi for site inspection',status:'pending',receipt_path:null,created_at:new Date(now-5*3600000).toISOString()}, {id:'demo-exp-3',user_id:'demo-sana',amount:620,category:'Materials',spent_on:dayKey(),description:'Material samples',status:'approved',receipt_path:null,created_at:new Date(now-3*86400000).toISOString()}];
 return {profiles,shifts,break_entries,tasks,leave_requests,reimbursements};
}
function demoAction(type,p={}){
 const db=state.data;const me=state.user;const now=new Date().toISOString();
 const getActive=()=>db.shifts.find(s=>s.user_id===me.id&&!s.punched_out_at);
 const getBreak=()=>db.break_entries.find(b=>b.user_id===me.id&&!b.ended_at);
 switch(type){
 case 'clock_in': if(getActive())throw Error('You are already punched in.');db.shifts.unshift({id:uid(),user_id:me.id,punched_in_at:now,punched_out_at:null});break;
 case 'clock_out': {const shift=getActive();if(!shift)throw Error('You must punch in first.');if(getBreak())throw Error('End your active break before punching out.');shift.punched_out_at=now;break;}
 case 'begin_break': {const shift=getActive();if(!shift)throw Error('Punch in before starting a break.');if(getBreak())throw Error('A break is already active.');db.break_entries.unshift({id:uid(),user_id:me.id,shift_id:shift.id,kind:p.kind,started_at:now,ended_at:null});break;}
 case 'finish_break': {const b=getBreak();if(!b)throw Error('No active break.');b.ended_at=now;break;}
 case 'assign_task': db.tasks.unshift({id:uid(),title:p.title,description:p.description,project:p.project,assignee_id:p.assignee_id,assigned_by:me.id,priority:p.priority,due_date:p.due_date||null,status:'todo',created_at:now});break;
 case 'task_status': {const t=db.tasks.find(x=>x.id===p.id);if(!t)throw Error('Task not found.');if(t.assignee_id!==me.id&&!isManager(me))throw Error('Not authorized.');t.status=p.status;break;}
 case 'leave_request': db.leave_requests.unshift({id:uid(),user_id:me.id,type:p.type,start_date:p.start_date,end_date:p.end_date,reason:p.reason,status:'pending',created_at:now});break;
 case 'leave_review': {const r=db.leave_requests.find(x=>x.id===p.id);if(!isManager(me)||!r||r.status!=='pending')throw Error('Cannot review this request.');Object.assign(r,{status:p.decision,manager_note:p.note||'',reviewed_by:me.id,reviewed_at:now});break;}
 case 'reimbursement': db.reimbursements.unshift({id:uid(),user_id:me.id,amount:Number(p.amount),category:p.category,spent_on:p.spent_on,description:p.description,receipt_path:p.receipt_path||null,status:'pending',created_at:now});break;
 case 'expense_review': {const r=db.reimbursements.find(x=>x.id===p.id);if(!isManager(me)||!r)throw Error('Not authorized.');if(!['pending','approved'].includes(r.status))throw Error('This claim is already closed.');if(p.decision==='paid'&&r.status!=='approved')throw Error('Approve the claim before marking it paid.');r.status=p.decision;r.reviewed_by=me.id;r.manager_note=p.note||'';r.reviewed_at=now;break;}
 case 'profile_update': {const r=db.profiles.find(x=>x.id===me.id);r.full_name=p.full_name;r.phone=p.phone||'';state.user={...r};break;}
 case 'access_update': {const r=db.profiles.find(x=>x.id===p.id);if(!isManager(me)||!r)throw Error('Not authorized.');if(p.role!==r.role&&me.role!=='principal')throw Error('Only principal architects can change roles.');if(r.id===me.id&&(r.role!==p.role||p.is_active===false))throw Error('You cannot remove your own access.');r.role=p.role;r.is_active=Boolean(p.is_active);break;}
 default:throw Error('Unknown action');
 }
 persistDB();return Promise.resolve();
}
async function token(){
 if(!state.session?.access_token)throw Error('Please sign in again.');
 if((state.session.expires_at||0)>Date.now()/1000+50)return state.session.access_token;
 if(!state.session.refresh_token)throw Error('Session expired. Please sign in again.');
 const r=await fetch(`${URL_BASE}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{'apikey':CONFIG.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:state.session.refresh_token})});
 const j=await r.json();if(!r.ok)throw Error(j.msg||j.error_description||'Could not refresh session.');
 state.session={...j,expires_at:Math.floor(Date.now()/1000)+j.expires_in};persistSession();return state.session.access_token;
}
async function authFetch(path,method='GET',data,extras={}){
 const t=await token();const headers={apikey:CONFIG.supabaseAnonKey,Authorization:`Bearer ${t}`};
 if(!extras.raw)headers['Content-Type']='application/json';
 if(method==='POST'&&!extras.raw)headers.Prefer='return=representation';
 if(method==='PATCH')headers.Prefer='return=representation';
 const r=await fetch(`${URL_BASE}${path}`,{method,headers:{...headers,...(extras.headers||{})},body:data==null?undefined:extras.raw?data:JSON.stringify(data)});
 const text=await r.text();let result;try{result=text?JSON.parse(text):null}catch{result=text}
 if(!r.ok)throw Error(result?.message||result?.error_description||result?.error||`Request failed (${r.status})`);
 return result;
}
async function liveSignIn(email,password){
 const r=await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`,{method:'POST',headers:{'apikey':CONFIG.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 const j=await r.json();if(!r.ok)throw Error(j.msg||j.error_description||j.message||'Invalid email or password.');
 state.session={...j,expires_at:Math.floor(Date.now()/1000)+j.expires_in};persistSession();
}
async function liveSignUp(full_name,email,password){
 const r=await fetch(`${URL_BASE}/auth/v1/signup`,{method:'POST',headers:{'apikey':CONFIG.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{full_name}})});
 const j=await r.json();if(!r.ok)throw Error(j.msg||j.error_description||j.message||'Account creation failed.');
 if(j.access_token){state.session={...j,expires_at:Math.floor(Date.now()/1000)+j.expires_in};persistSession();return true;}
 return false;
}
async function loadLive(){
 const names=['profiles','shifts','break_entries','tasks','leave_requests','reimbursements'];
 const data=await Promise.all(names.map(n=>authFetch(`/rest/v1/${n}?select=*&limit=500`)));
 names.forEach((n,i)=>{state.data[n]=data[i]||[]});
 const userId=state.session.user?.id;
 state.user=state.data.profiles.find(x=>x.id===userId)||null;
 if(!state.user)throw Error('Account profile has not been created. Ask your administrator to review the database setup.');
}
async function act(type,p={}){
 if(!LIVE)return demoAction(type,p);
 const rpcs={clock_in:['clock_in',{}],clock_out:['clock_out',{}],begin_break:['begin_break',{p_kind:p.kind}],finish_break:['finish_break',{}],assign_task:['assign_task',{p_title:p.title,p_description:p.description,p_project:p.project,p_assignee_id:p.assignee_id,p_due_date:p.due_date||null,p_priority:p.priority}],task_status:['update_task_state',{p_id:p.id,p_status:p.status}],leave_review:['review_leave_request',{p_id:p.id,p_decision:p.decision,p_note:p.note||''}],expense_review:['review_reimbursement',{p_id:p.id,p_decision:p.decision,p_note:p.note||''}],access_update:['update_staff_access',{p_id:p.id,p_role:p.role,p_is_active:p.is_active}]};
 if(rpcs[type]){const [fn,args]=rpcs[type];return authFetch(`/rest/v1/rpc/${fn}`,'POST',args)}
 if(type==='leave_request')return authFetch('/rest/v1/leave_requests','POST',{user_id:state.user.id,...p});
 if(type==='reimbursement')return authFetch('/rest/v1/reimbursements','POST',{user_id:state.user.id,...p});
 if(type==='profile_update')return authFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(state.user.id)}`,'PATCH',p);
 throw Error('Unknown action');
}
async function storeReceipt(file){
 if(!file)return null;
 if(file.size>5*1024*1024)throw Error('Receipt must be smaller than 5 MB.');
 if(!['image/png','image/jpeg','image/webp','application/pdf'].includes(file.type))throw Error('Upload a JPG, PNG, WebP or PDF receipt.');
 if(!LIVE)return `demo/${file.name}`;
 const clean=file.name.replace(/[^a-zA-Z0-9.\-_]/g,'_').slice(-80);
 const p=`${state.user.id}/${uid()}-${clean}`;
 await authFetch(`/storage/v1/object/receipts/${p}`,'POST',file,{raw:true,headers:{'Content-Type':file.type,'x-upsert':'false'}});
 return p;
}
async function openReceipt(path){
 if(!path)return toast('No receipt attached.');
 if(!LIVE)return toast('Demo mode: receipt file names are not uploaded.');
 const r=await authFetch(`/storage/v1/object/sign/receipts/${path}`,'POST',{expiresIn:120});
 if(r?.signedURL)window.open(`${URL_BASE}/storage/v1${r.signedURL.startsWith('/')?'':'/'}${r.signedURL}`,'_blank','noopener');
 else throw Error('Unable to open receipt.');
}
async function refresh(){if(LIVE&&state.session)await loadLive();else if(state.user)state.user=state.data.profiles.find(p=>p.id===state.user.id)||null;render();}
function shiftOf(userId=state.user?.id){return state.data.shifts.find(s=>s.user_id===userId&&!s.punched_out_at)||null}
function breakOf(userId=state.user?.id){return state.data.break_entries.find(b=>b.user_id===userId&&!b.ended_at)||null}
function shiftTime(shift,at=Date.now()){
 if(!shift)return {elapsed:0,worked:0,breakMs:0,activeBreak:null};
 const from=new Date(shift.punched_in_at).getTime(),to=shift.punched_out_at?new Date(shift.punched_out_at).getTime():at;
 const elapsed=Math.max(0,to-from);
 const bb=state.data.break_entries.filter(b=>b.shift_id===shift.id);
 const breakMs=bb.reduce((sum,b)=>sum+Math.max(0,Math.min(new Date(b.ended_at||to).getTime(),to)-Math.max(from,new Date(b.started_at).getTime())),0);
 return {elapsed,worked:Math.max(0,elapsed-breakMs),breakMs,activeBreak:bb.find(b=>!b.ended_at)||null};
}
function currentBreakMs(){const b=breakOf();return b?Math.max(0,Date.now()-new Date(b.started_at).getTime()):0}
function userTimesToday(id){
 const shifts=state.data.shifts.filter(s=>s.user_id===id&&dayKey(s.punched_in_at)===dayKey());
 return shifts.reduce((sum,s)=>sum+shiftTime(s).worked,0);
}
function showToast(message,error=false){const wrap=document.getElementById('toast-container');if(!wrap)return;const div=document.createElement('div');div.className='toast'+(error?' error':'');div.innerHTML=I(error?'alert':'check','icon sm')+`<span>${esc(message)}</span>`;wrap.append(div);setTimeout(()=>div.remove(),4300)}
const toast=showToast;
function noticeMessages(){
 if(!state.user?.is_active)return [];
 const shift=shiftOf(),b=breakOf(),out=[];
 if(b){const time=currentBreakMs(),limit=b.kind==='tea'?45:60;if(time>limit*MS&&!state.dismissed.has('break-'+b.id))out.push({id:'break-'+b.id,title:`${b.kind==='tea'?'Tea':'Lunch'} break reminder`,text:`Your break has been running for ${Math.round(time/MS)} minutes (guideline: ${b.kind==='tea'?'45 minutes':'1 hour'}). Remember to end your break when you return.`});}
 if(shift&&!b){const tt=shiftTime(shift);if(tt.elapsed>=9*3600000&&!state.dismissed.has('shift-'+shift.id))out.push({id:'shift-'+shift.id,title:'Did you forget to punch out?',text:`Your shift has been open for ${fmtHours(tt.elapsed)}. If you have finished work, please punch out.`});}
 return out;
}
function notificationsMaybe(notices){
 const ns=notices.map(x=>x.id).join('|');
 if(ns&&state.noticeSignature!==ns&&typeof Notification!=='undefined'&&Notification.permission==='granted'){
   try{const n=notices[0];new Notification('MAKE.INC · '+n.title,{body:n.text,icon:'./icon-192.png',tag:n.id})}catch{}
 }
 state.noticeSignature=ns;
}
function renderNotices(){const notices=noticeMessages();notificationsMaybe(notices);return notices.map(n=>`<div class="notice">${I('alert')}<div class="flex"><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p></div><button data-action="dismiss-notice" data-id="${n.id}" aria-label="Dismiss reminder">${I('x','icon sm')}</button></div>`).join('')}
function requestNotification(){if('Notification' in window&&Notification.permission==='default')Notification.requestPermission().then(p=>toast(p==='granted'?'Browser reminders enabled.':'You can still see reminders inside the portal.')).catch(()=>{});else toast('Notification settings can be changed in your browser.');}
const navEmployee=[['dashboard','Overview','dashboard'],['attendance','Attendance','clock'],['tasks','My Tasks','tasks'],['leaves','Leave Requests','calendar'],['expenses','Reimbursements','wallet'],['profile','My Account','profile']];
const navManager=[['team','Team Attendance','users'],['board','Task Assignment','briefcase'],['approvals','Approvals','shield'],['people','Team & Access','settings'],['sheets','Google Sheets','sheets']];
const titles={dashboard:'Overview',attendance:'Attendance',tasks:'My Tasks',leaves:'Leave Requests',expenses:'Reimbursements',profile:'My Account',team:'Team Attendance',board:'Task Assignment',approvals:'Approvals',people:'Team & Access',sheets:'Google Sheets'};
const navButton=([id,label,ic])=>`<button type="button" class="nav-item ${state.view===id?'active':''}" data-view="${id}">${I(ic)}<span>${esc(label)}</span></button>`;
function sidebar(){const u=state.user;return `<aside class="sidebar ${state.mobileMenu?'open':''}" aria-label="Main menu"><div class="brand"><img src="./logo.png" alt="MAKE.INC DESIGN + BUILD"/><div class="brand-sub">STUDIO WORKSPACE</div></div><div class="nav-scroll"><div class="nav-label">My workspace</div>${navEmployee.map(navButton).join('')}${isManager(u)?`<div class="nav-label" style="margin-top:23px">Management</div>${navManager.map(navButton).join('')}`:''}</div><div class="side-bottom"><div class="user-mini"><div class="avatar dark">${initials(u.full_name)}</div><div class="detail"><strong>${esc(u.full_name)}</strong><small>${esc(roleLabel(u.role))}</small></div><button class="nav-item" style="margin:0;width:auto;padding:7px" title="Sign out" data-action="logout">${I('logout')}</button></div></div></aside>`}
const button=(label,action,cls='light',props='')=>`<button type="button" class="btn ${cls}" data-action="${action}" ${props}>${label}</button>`;
const viewButton=(label,v,cls='light')=>`<button type="button" class="btn ${cls}" data-view="${v}">${label}</button>`;
function layout(content){const u=state.user;const quick=[['dashboard','Home','dashboard'],['attendance','Time','clock'],['tasks','Tasks','tasks'],['leaves','Leave','calendar'],[isManager(u)?'approvals':'profile','More',isManager(u)?'shield':'profile']];return `<div class="app-shell">${sidebar()}<div class="mobile-scrim ${state.mobileMenu?'show':''}" data-action="close-menu"></div><section class="workspace"><header class="topbar"><div class="row-between"><button class="mobile-toggle" data-action="toggle-menu" aria-label="Toggle menu">${I('menu')}</button><div class="crumbs"><span class="muted">STUDIO PORTAL</span><span class="divider-text">/</span>${esc(titles[state.view])}</div></div><div class="top-right">${!LIVE?`<div class="switcher hide-mobile"><span class="tiny muted">Preview as</span><select aria-label="Preview role" data-role-switch><option value="demo-employee" ${u.id==='demo-employee'?'selected':''}>Employee</option><option value="demo-admin" ${u.id==='demo-admin'?'selected':''}>Admin</option><option value="demo-principal" ${u.id==='demo-principal'?'selected':''}>Principal</option></select></div>`:''}<span class="date-label">${dated(new Date())}</span><span class="top-dot"></span><span class="top-name">${esc(u.full_name.split(' ')[0])}</span><button class="top-icon-btn" data-action="notify" title="Enable browser reminders">${I('bell')}</button><button class="top-icon-btn" data-view="profile" title="My account">${I('profile')}</button></div></header>${!LIVE?'<div class="demo-banner">INTERACTIVE DEMO · SAMPLE DATA · CHANGES SAVED IN THIS BROWSER ONLY</div>':''}<main class="content"><div id="reminders" class="notice-stack">${renderNotices()}</div>${content}</main></section><nav class="mobile-bottom" aria-label="Mobile navigation">${quick.map(([v,l,ic])=>`<button data-view="${v}" class="${state.view===v?'active':''}">${I(ic)}<span>${l}</span></button>`).join('')}</nav></div>${state.modal?modalContent():''}`;}
function pageHead(title,sub,actions=''){return `<div class="page-head"><div><div class="eyebrow">MAKE.INC / STUDIO WORKSPACE</div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>${actions?`<div class="head-actions">${actions}</div>`:''}</div>`}
function meterCard(){
 const s=shiftOf(),b=breakOf(),t=shiftTime(s),working=!!s&&!b;
 return `<div class="attendance-card"><div class="att-head"><span class="eyebrow">${I('clock','icon sm')} &nbsp; TODAY'S STUDIO HOURS</span><span class="status-pill ${!s?'off':b?'break':''}"><i class="dot"></i>${s?(b?'On break':'Clocked in'):'Not clocked in'}</span></div><div class="timer-label">NET WORKING TIME ${b?'· PAUSED':''}</div><div class="big-timer number" data-live="work">${fmtMs(t.worked)}</div><div class="att-timeline"><div>FIRST PUNCH IN<strong>${clockTime(s?.punched_in_at)}</strong></div><div>LAST PUNCH OUT<strong>${s?.punched_out_at?clockTime(s.punched_out_at):'—'}</strong></div><div>TOTAL BREAKS<strong data-live="break-total">${fmtHours(t.breakMs)}</strong></div><div>SHIFT ELAPSED<strong data-live="shift-elapsed">${fmtHours(t.elapsed)}</strong></div></div><div class="progress-track"><span data-live="progress" style="width:${Math.min(100,t.worked/(8*3600000)*100)}%"></span></div><div class="action-row">${!s?button(`${I('play')} Punch In`,'clock-in','primary'):b?button(`${I('coffee')} End ${b.kind==='tea'?'Tea':'Lunch'} Break`,'break-end','primary'):button(`${I('stop')} Punch Out`,'clock-out','primary')}${s?viewButton(`${I('clock')} Attendance history`,'attendance','ghost'):button(`${I('info')} Workday policy`,'policy','ghost')}</div></div>`;
}
function breakCard(){const s=shiftOf(),b=breakOf(),t=shiftTime(s);return `<section class="panel break-card"><div class="panel-head"><div><span class="eyebrow">BREAK TRACKER</span><h3 style="margin-top:6px">${b?'Break in progress':'Take a mindful pause'}</h3></div>${I(b?'pause':'coffee','icon lg')}</div><div class="break-count number" data-live="break">${fmtMs(currentBreakMs())}</div><p class="break-desc">${b?`Your ${b.kind==='tea'?'tea':'lunch'} break is running. Your work clock is paused.`:'Break timer begins only after you start a break.'}</p><div class="break-buttons">${b?button(`${I('check')} End Break`,'break-end','dark'):s?`${button(`${I('coffee')} Tea Break`,'break-tea','light')}${button(`${I('utensils')} Lunch Break`,'break-lunch','light')}`:`${button(`${I('coffee')} Tea Break`,'break-tea','light','disabled')}${button(`${I('utensils')} Lunch Break`,'break-lunch','light','disabled')}`}</div><p class="helper" style="margin-top:12px">Guidelines: Tea 45 min · Lunch 1 hour. Reminders appear if exceeded.</p></section>`}
const taskSort=(arr)=>[...arr].sort((a,b)=>((a.status==='done')-(b.status==='done'))||({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority])||(a.due_date||'9999').localeCompare(b.due_date||'9999'));
function taskRow(t,mini=false){return `<div class="task-row"><button title="${t.status==='done'?'Mark to do':'Mark completed'}" class="task-check ${t.status==='done'?'done':''}" data-action="task-toggle" data-id="${esc(t.id)}" data-status="${t.status==='done'?'todo':'done'}">${t.status==='done'?I('check','icon sm'):''}</button><div class="task-copy"><strong class="${t.status==='done'?'done':''}">${esc(t.title)}</strong><p>${esc(t.project||'General')} &nbsp;·&nbsp; ${t.due_date?dateOnly(t.due_date):'No deadline'}${!mini&&t.description?' &nbsp;·&nbsp; '+esc(t.description):''}</p></div>${priorityBadge(t.priority)}</div>`}
function taskPanel(){const tasks=taskSort(state.data.tasks.filter(t=>t.assignee_id===state.user.id)).slice(0,4);return `<section class="panel"><div class="panel-head"><div><span class="eyebrow">YOUR WORKFLOW</span><h2 style="margin-top:4px">Priority tasks</h2><p>Assigned by the studio management</p></div><button class="view-all" data-view="tasks">View all ${I('arrow','icon sm')}</button></div>${tasks.length?tasks.map(t=>taskRow(t,true)).join(''):`<div class="empty">${I('tasks')}<br/>No tasks assigned yet.</div>`}</section>`}
function metricCard(icon,label,value,note){return `<div class="metric"><div class="metric-icon">${I(icon)}</div><div class="metric-label">${esc(label)}</div><div class="metric-value number">${value}</div><div class="metric-note">${esc(note)}</div></div>`}
function weekBars(id=state.user?.id){const dates=[];for(let i=6;i>=0;i--)dates.push(new Date(Date.now()-i*86400000));return `<div class="date-grid">${dates.map(d=>{const ms=state.data.shifts.filter(s=>s.user_id===id&&dayKey(s.punched_in_at)===dayKey(d)).reduce((s,x)=>s+shiftTime(x).worked,0);const wd=new Intl.DateTimeFormat('en-IN',{timeZone:TZ,weekday:'short'}).format(d);return `<div class="day-col"><div class="day-label">${wd}</div><div class="bar-box"><span class="${dayKey(d)===dayKey()?'today':''}" style="height:${Math.max(3,Math.min(100,ms/8/3600000*100))}%"></span></div><div class="bar-hours">${ms?fmtHours(ms):'—'}</div></div>`}).join('')}</div>`}
function weeklyPanel(){return `<section class="panel"><div class="panel-head"><div><span class="eyebrow">TIME INSIGHTS</span><h3 style="margin-top:5px">Last 7 days</h3></div>${I('chart')}</div>${weekBars()}<div class="row-between"><span class="small muted">Net working hours, excluding breaks</span><button class="view-all" data-view="attendance">Details ${I('chevron','icon sm')}</button></div></section>`}
function quickPanel(){const manager=isManager(state.user);const pending=state.data.leave_requests.filter(r=>r.status==='pending').length+state.data.reimbursements.filter(r=>r.status==='pending').length;return `<section class="panel"><div class="panel-head"><div><span class="eyebrow">QUICK ACTIONS</span><h3 style="margin-top:4px">Your studio desk</h3></div>${I('briefcase')}</div><div class="detail-row"><div class="metric-icon" style="margin:0">${I('calendar')}</div><div class="flex"><strong>Need a day off?</strong><p>Submit a leave request</p></div>${button(I('plus'),'new-leave','soft sm')}</div><div class="detail-row"><div class="metric-icon" style="margin:0">${I('wallet')}</div><div class="flex"><strong>Office expense?</strong><p>Request a reimbursement</p></div>${button(I('plus'),'new-expense','soft sm')}</div>${manager?`<div class="detail-row"><div class="metric-icon" style="margin:0">${I('shield')}</div><div class="flex"><strong>${pending} pending approvals</strong><p>Review team requests</p></div>${viewButton(I('arrow'),'approvals','soft sm')}</div><div class="detail-row"><div class="metric-icon" style="margin:0">${I('sheets')}</div><div class="flex"><strong>Google Sheets</strong><p>${state.linkedSheetId?'Spreadsheet linked · Ready to sync':'Connect & sync studio records'}</p></div>${viewButton(I('arrow'),'sheets','soft sm')}</div>`:''}</section>`}
function teamPulse(){const active=state.data.profiles.filter(p=>p.is_active),clocked=active.filter(p=>shiftOf(p.id));return `<section class="panel"><div class="panel-head"><div><span class="eyebrow">STUDIO PULSE</span><h3 style="margin-top:4px">Team check-in</h3></div>${viewButton(I('arrow'),'team','light sm')}</div><div class="row-between" style="padding-bottom:12px"><div><div class="metric-value">${clocked.length}<span class="muted" style="font-size:14px"> / ${active.length}</span></div><p class="small muted">Team members punched in</p></div><span class="badge green">${I('sun','icon sm')} Today</span></div>${active.slice(0,5).map(p=>`<div class="mini-person"><div class="avatar">${initials(p.full_name)}</div><div class="name">${esc(p.full_name)}<div class="sub">${esc(p.job_title||roleLabel(p.role))}</div></div>${shiftOf(p.id)?statusBadge(breakOf(p.id)?'in_progress':'active'):statusBadge('inactive')}</div>`).join('')}</section>`}
function dashView(){const u=state.user,tt=userTimesToday(u.id),openTasks=state.data.tasks.filter(t=>t.assignee_id===u.id&&t.status!=='done').length,approvedLeave=state.data.leave_requests.filter(r=>r.user_id===u.id&&r.status==='approved').length;const first=u.full_name.split(' ')[0];return `${pageHead(`Good ${greeting()}, ${first}.`,'Your studio day at a glance — projects, people and progress.',button(`${I('refresh')} Refresh`,'refresh','light'))}<div class="page-grid"><div class="stack">${meterCard()}<div class="metric-grid">${metricCard('clock','HOURS TODAY',fmtHours(tt),'Net productive time')}${metricCard('tasks','OPEN TASKS',String(openTasks).padStart(2,'0'),'Assigned to you')}${metricCard('calendar','APPROVED LEAVES',String(approvedLeave).padStart(2,'0'),'Requests on record')}</div>${taskPanel()}</div><div class="stack">${breakCard()}${isManager(u)?teamPulse():weeklyPanel()}${quickPanel()}</div></div>`}
function greeting(){const h=Number(new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',hourCycle:'h23'}).format(new Date()));return h<12?'morning':h<17?'afternoon':'evening'}
function attendView(){const shifts=sorted(own(state.data.shifts),'punched_in_at');const now=shiftOf();return `${pageHead('Attendance & work hours','Track every punch, pause and completed workday.',button(`${I('refresh')} Refresh`,'refresh','light'))}<div class="page-grid"><div class="stack">${meterCard()}<section class="panel"><div class="panel-head"><div><span class="eyebrow">ATTENDANCE LOG</span><h2 style="margin-top:4px">Your recent shifts</h2></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Punch in</th><th>Punch out</th><th>Breaks</th><th>Worked</th><th>Status</th></tr></thead><tbody>${shifts.length?shifts.slice(0,35).map(s=>{const t=shiftTime(s);return `<tr><td><strong>${dated(s.punched_in_at)}</strong></td><td>${clockTime(s.punched_in_at)}</td><td>${clockTime(s.punched_out_at)}</td><td>${fmtHours(t.breakMs)}</td><td><strong>${fmtHours(t.worked)}</strong></td><td>${statusBadge(s.punched_out_at?'completed':'active')}</td></tr>`}).join(''):'<tr><td colspan="6"><div class="empty">No attendance history yet.</div></td></tr>'}</tbody></table></div></section></div><div class="stack">${breakCard()}${weeklyPanel()}<div class="callout"><strong>${I('info','icon sm')} How working hours are calculated</strong>Net working time = elapsed time from Punch In to Punch Out, minus all completed and active lunch / tea breaks. The working timer pauses automatically during a break.</div></div></div>`}
function tasksView(){let arr=taskSort(state.data.tasks.filter(t=>t.assignee_id===state.user.id));const count=arr.length;const fil=state.filter;if(['todo','in_progress','done'].includes(fil))arr=arr.filter(t=>t.status===fil);return `${pageHead('My assigned tasks','Keep track of architectural deliverables and project milestones.')}${taskFilters(count)}<section class="panel"><div class="panel-head"><div><span class="eyebrow">PROJECT DELIVERABLES</span><h2 style="margin-top:5px">${arr.length} task${arr.length===1?'':'s'}</h2></div></div>${arr.length?arr.map(t=>`<div class="task-row"><button class="task-check ${t.status==='done'?'done':''}" data-action="task-toggle" data-id="${esc(t.id)}" data-status="${t.status==='done'?'todo':'done'}">${t.status==='done'?I('check','icon sm'):''}</button><div class="task-copy"><strong class="${t.status==='done'?'done':''}">${esc(t.title)}</strong><p>${I('briefcase','icon sm')} ${esc(t.project||'General')} &nbsp; · &nbsp; Due ${t.due_date?dateOnly(t.due_date):'not set'} &nbsp; · &nbsp; Assigned by ${esc(nameOf(t.assigned_by))}</p>${t.description?`<p style="margin-top:7px">${esc(t.description)}</p>`:''}<div style="display:flex;gap:6px;margin-top:10px">${statusBadge(t.status)} ${t.status==='todo'?button('Start task','task-start','soft sm',`data-id="${esc(t.id)}"`):t.status==='in_progress'?button('Mark complete','task-done','soft sm',`data-id="${esc(t.id)}"`):''}</div></div>${priorityBadge(t.priority)}</div>`).join(''):'<div class="empty">No tasks in this view.</div>'}</section>`}
function taskFilters(count){return `<div class="filter-row">${[['all',`All (${count})`],['todo','To do'],['in_progress','In progress'],['done','Completed']].map(([v,l])=>`<button class="filter-chip ${state.filter===v?'selected':''}" data-filter="${v}">${l}</button>`).join('')}</div>`}
function leaveView(){const rr=sorted(own(state.data.leave_requests));return `${pageHead('Leave requests','Plan time away and track manager approvals.',button(`${I('plus')} Request leave`,'new-leave','dark'))}<div class="request-grid"><section class="panel"><div class="panel-head"><div><span class="eyebrow">TIME OFF</span><h2 style="margin-top:4px">My requests</h2></div></div>${rr.length?rr.map(r=>`<div class="detail-row"><div class="metric-icon" style="margin:0">${I('calendar')}</div><div class="flex"><strong>${r.type==='sick'?'Sick leave':'Normal leave'}</strong><p>${dateOnly(r.start_date)} ${r.end_date!==r.start_date?'– '+dateOnly(r.end_date):''}</p><p>${esc(r.reason||'No reason added')}</p>${r.manager_note?`<p>Manager note: ${esc(r.manager_note)}</p>`:''}</div>${statusBadge(r.status)}</div>`).join(''):'<div class="empty">No leave requests yet.</div>'}</section><section class="panel"><span class="eyebrow">HOW IT WORKS</span><h2 style="margin-top:6px">Simple leave management</h2><div class="detail-row"><div class="metric-icon" style="margin:0">1</div><div class="flex"><strong>Submit a request</strong><p>Select sick or normal leave and dates.</p></div></div><div class="detail-row"><div class="metric-icon" style="margin:0">2</div><div class="flex"><strong>Management review</strong><p>Your Admin or Principal Architect approves or declines.</p></div></div><div class="detail-row"><div class="metric-icon" style="margin:0">3</div><div class="flex"><strong>Track the decision</strong><p>See the current status here whenever you sign in.</p></div></div></section></div>`}
function expensesView(){const rr=sorted(own(state.data.reimbursements));const waiting=rr.filter(x=>x.status==='pending').reduce((s,x)=>s+Number(x.amount),0);const paid=rr.filter(x=>x.status==='paid').reduce((s,x)=>s+Number(x.amount),0);return `${pageHead('Reimbursements','Claim expenses incurred for the office, client projects and site visits.',button(`${I('plus')} New claim`,'new-expense','dark'))}<div class="metric-grid">${metricCard('wallet','PENDING CLAIMS',currency(waiting),'Awaiting approval')}${metricCard('check','REIMBURSED',currency(paid),'Marked as paid')}${metricCard('receipt','TOTAL CLAIMS',rr.length,'All submissions')}</div><section class="panel"><div class="panel-head"><div><span class="eyebrow">EXPENSE LEDGER</span><h2 style="margin-top:5px">My reimbursement requests</h2></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Expense</th><th>Date</th><th>Amount</th><th>Receipt</th><th>Status</th></tr></thead><tbody>${rr.length?rr.map(x=>`<tr><td><strong>${esc(x.description)}</strong><small>${esc(x.category)}</small></td><td>${dateOnly(x.spent_on)}</td><td><strong>${currency(x.amount)}</strong></td><td>${x.receipt_path?`<button class="view-all" data-action="receipt" data-path="${safeAttr(x.receipt_path)}">View ${I('chevron','icon sm')}</button>`:'—'}</td><td>${statusBadge(x.status)}</td></tr>`).join(''):'<tr><td colspan="5"><div class="empty">No expenses submitted yet.</div></td></tr>'}</tbody></table></div></section>`}
function profileView(){const u=state.user;return `${pageHead('My account','Your personal workspace, profile and access level.') }<div class="data-layout"><div class="stack"><section class="panel"><div class="profile-hero"><div class="avatar dark">${initials(u.full_name)}</div><div><span class="eyebrow">TEAM MEMBER</span><h2>${esc(u.full_name)}</h2><p>${esc(u.job_title||roleLabel(u.role))} &nbsp;·&nbsp; ${statusBadge(u.is_active?'active':'pending')}</p></div></div><div class="profile-info"><div><label>EMAIL ADDRESS</label><strong>${esc(u.email)}</strong></div><div><label>ACCOUNT ROLE</label><strong>${esc(roleLabel(u.role))}</strong></div><div><label>PHONE NUMBER</label><strong>${esc(u.phone||'Not provided')}</strong></div></div><div style="margin-top:22px">${button(`${I('edit')} Edit profile`,'edit-profile','dark')}</div></section><section class="panel"><div class="panel-head"><h3>Account & privacy</h3></div><div class="detail-row"><div class="metric-icon" style="margin:0">${I('shield')}</div><div class="flex"><strong>Role-based access</strong><p>${isManager(u)?'You can manage staff, projects and approvals.':'Only your own attendance, tasks and requests are accessible.'}</p></div></div><div class="detail-row"><div class="metric-icon" style="margin:0">${I('bell')}</div><div class="flex"><strong>Attendance reminders</strong><p>Get alerts while the portal is running.</p></div>${button('Enable','notify','soft sm')}</div><div style="margin-top:20px">${button(`${I('logout')} Sign out`,'logout','light')}</div></section></div><div class="stack"><section class="panel"><span class="eyebrow">STUDIO IDENTITY</span><div style="text-align:center;padding:30px 12px"><img src="./logo.png" alt="MAKE.INC" style="width:94%;max-width:300px"/><div class="caps muted" style="margin-top:15px">DESIGN + BUILD</div></div></section><div class="callout"><strong>Account permissions</strong>New accounts require staff approval. An administrator can activate employee accounts. Only a Principal Architect can promote employees to an administrator or principal role.</div></div></div>`}
function teamView(){const members=state.data.profiles.filter(p=>p.is_active);return `${pageHead('Team attendance','Live on-site and studio attendance status for the whole team.',button(`${I('refresh')} Refresh`,'refresh','light'))}<div class="metric-grid">${metricCard('users','ACTIVE ACCOUNTS',members.length,'Approved team members')}${metricCard('clock','CURRENTLY CLOCKED IN',members.filter(m=>shiftOf(m.id)).length,'Including active breaks')}${metricCard('coffee','ON BREAK',members.filter(m=>breakOf(m.id)).length,'Tea and lunch breaks')}</div><section class="panel"><div class="panel-head"><div><span class="eyebrow">TODAY'S ROSTER</span><h2 style="margin-top:5px">Team working status</h2></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Employee</th><th>Role</th><th>Punch In</th><th>Net Work</th><th>Break</th><th>Current Status</th></tr></thead><tbody>${members.map(p=>{const sh=shiftOf(p.id),bk=breakOf(p.id),times=sh?shiftTime(sh):null;return `<tr><td><strong>${esc(p.full_name)}</strong><small>${esc(p.job_title||'Employee')}</small></td><td>${esc(roleLabel(p.role))}</td><td>${clockTime(sh?.punched_in_at)}</td><td><strong data-teamtime="${esc(p.id)}">${sh?fmtHours(times.worked):'—'}</strong></td><td>${bk?`${bk.kind==='tea'?'Tea':'Lunch'} · ${fmtHours(Date.now()-new Date(bk.started_at).getTime())}`:'—'}</td><td>${statusBadge(!sh?'inactive':bk?'in_progress':'active')}</td></tr>`}).join('')}</tbody></table></div></section>`}
function boardView(){const arr=taskSort(state.data.tasks),pending=arr.filter(t=>t.status!=='done');return `${pageHead('Task assignment','Distribute project deliverables and follow up on team progress.',button(`${I('plus')} Assign task`,'new-task','dark'))}<div class="metric-grid">${metricCard('tasks','TOTAL ASSIGNED',arr.length,'All tasks')}${metricCard('briefcase','OPEN DELIVERABLES',pending.length,'To do or in progress')}${metricCard('check','COMPLETED',arr.filter(t=>t.status==='done').length,'Submitted as done')}</div><section class="panel"><div class="panel-head"><div><span class="eyebrow">PROJECT MANAGEMENT</span><h2 style="margin-top:5px">Studio task board</h2></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Task / Project</th><th>Assigned To</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead><tbody>${arr.length?arr.map(t=>`<tr><td><strong>${esc(t.title)}</strong><small>${esc(t.project||'General')}</small></td><td>${esc(nameOf(t.assignee_id))}</td><td>${t.due_date?dateOnly(t.due_date):'—'}</td><td>${priorityBadge(t.priority)}</td><td><select style="border:1px solid #e5e7e5;border-radius:7px;padding:7px;font-size:11px" data-task-select="${esc(t.id)}"><option value="todo" ${t.status==='todo'?'selected':''}>To do</option><option value="in_progress" ${t.status==='in_progress'?'selected':''}>In progress</option><option value="done" ${t.status==='done'?'selected':''}>Completed</option></select></td></tr>`).join(''):'<tr><td colspan="5"><div class="empty">No tasks created yet.</div></td></tr>'}</tbody></table></div></section>`}
function approvalsView(){const ll=sorted(state.data.leave_requests),ee=sorted(state.data.reimbursements);return `${pageHead('Approvals & requests','Review leave applications and reimbursement claims from the team.')}<div class="stack"><section class="panel"><div class="panel-head"><div><span class="eyebrow">LEAVE MANAGEMENT</span><h2 style="margin-top:5px">Leave applications</h2></div><span class="badge amber">${ll.filter(r=>r.status==='pending').length} pending</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Employee</th><th>Type / Reason</th><th>Dates</th><th>Status</th><th>Review</th></tr></thead><tbody>${ll.length?ll.map(x=>`<tr><td><strong>${esc(nameOf(x.user_id))}</strong></td><td>${esc(x.type==='sick'?'Sick leave':'Normal leave')}<small>${esc(x.reason)}</small></td><td>${dateOnly(x.start_date)}${x.end_date!==x.start_date?' – '+dateOnly(x.end_date):''}</td><td>${statusBadge(x.status)}</td><td>${x.status==='pending'?`<div class="actions">${button(`${I('check','icon sm')} Approve`,'leave-approve','soft sm',`data-id="${esc(x.id)}"`)}${button('Decline','leave-reject','danger sm',`data-id="${esc(x.id)}"`)}</div>`:esc(x.manager_note||'—')}</td></tr>`).join(''):'<tr><td colspan="5"><div class="empty">No leave applications.</div></td></tr>'}</tbody></table></div></section><section class="panel"><div class="panel-head"><div><span class="eyebrow">REIMBURSEMENT MANAGEMENT</span><h2 style="margin-top:5px">Expense claims</h2></div><span class="badge amber">${ee.filter(r=>r.status==='pending').length} pending</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Employee</th><th>Expense</th><th>Amount</th><th>Receipt</th><th>Status</th><th>Review</th></tr></thead><tbody>${ee.length?ee.map(x=>`<tr><td><strong>${esc(nameOf(x.user_id))}</strong></td><td>${esc(x.description)}<small>${esc(x.category)} · ${dateOnly(x.spent_on)}</small></td><td><strong>${currency(x.amount)}</strong></td><td>${x.receipt_path?`<button class="view-all" data-action="receipt" data-path="${safeAttr(x.receipt_path)}">View</button>`:'—'}</td><td>${statusBadge(x.status)}</td><td><div class="actions">${x.status==='pending'?`${button('Approve','expense-approve','soft sm',`data-id="${esc(x.id)}"`)}${button('Decline','expense-reject','danger sm',`data-id="${esc(x.id)}"`)}`:x.status==='approved'?button('Mark paid','expense-paid','dark sm',`data-id="${esc(x.id)}"`):'—'}</div></td></tr>`).join(''):'<tr><td colspan="6"><div class="empty">No expense claims.</div></td></tr>'}</tbody></table></div></section></div>`}
function peopleView(){const arr=state.data.profiles;return `${pageHead('Team & access','Review team registrations and assign secure account permissions.',button(`${I('refresh')} Refresh`,'refresh','light'))}<div class="metric-grid">${metricCard('users','TEAM ACCOUNTS',arr.length,'Registered profiles')}${metricCard('check','APPROVED',arr.filter(x=>x.is_active).length,'Portal access enabled')}${metricCard('alert','AWAITING APPROVAL',arr.filter(x=>!x.is_active).length,'New registrations')}</div><section class="panel"><div class="panel-head"><div><span class="eyebrow">EMPLOYEE DIRECTORY</span><h2 style="margin-top:5px">Staff accounts</h2></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Employee</th><th>Email</th><th>Access role</th><th>Account</th><th>Manage</th></tr></thead><tbody>${arr.map(x=>`<tr><td><strong>${esc(x.full_name)}</strong><small>${esc(x.job_title||'Employee')}</small></td><td>${esc(x.email)}</td><td>${esc(roleLabel(x.role))}</td><td>${statusBadge(x.is_active?'active':'pending')}</td><td>${button(x.is_active?'Edit access':'Approve account','edit-access','light sm',`data-id="${esc(x.id)}"`)}</td></tr>`).join('')}</tbody></table></div></section><div class="callout" style="margin-top:18px"><strong>Account security</strong>New staff can sign up with their own email and password. Accounts begin in Pending status and cannot clock in, view assignments, or file claims until approved by management. Only the Principal Architect can change staff roles.</div>`}
function renderView(){switch(state.view){case 'attendance':return attendView();case 'tasks':return tasksView();case 'leaves':return leaveView();case 'expenses':return expensesView();case 'profile':return profileView();case 'team':return teamView();case 'board':return boardView();case 'approvals':return approvalsView();case 'people':return peopleView();case 'sheets':return sheetsView();default:return dashView()}}
function googleButtonHtml(text='Sign in with Google'){
  return `<button type="button" class="gsi-material-button" data-action="google-signin">
    <div class="gsi-material-button-icon">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="display: block;">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
    </div>
    <span class="gsi-material-button-contents">${esc(text)}</span>
  </button>`;
}
function sheetsView(){
  const gUser=state.googleUser;const isLinked=Boolean(state.linkedSheetId);const syncTime=state.lastSheetSync?dated(state.lastSheetSync,{hour:'2-digit',minute:'2-digit'}):'Never';
  return `${pageHead('Google Sheets integration','Connect Google Workspace and mirror studio attendance, tasks, and directory directly to Sheets.',button(`${I('refresh')} Refresh`,'refresh','light'))}<div class="stack"><section class="panel ${gUser?'sheets-connected-card':''}"><div class="panel-head"><div><span class="eyebrow">WORKSPACE AUTHENTICATION</span><h2 style="margin-top:5px">${gUser?'Google Account Connected':'Connect Google Workspace'}</h2><p>${gUser?`Authorized for Google Sheets & Google Drive files as ${esc(gUser.email)}`:'Connect your Google account to create, read, and sync studio spreadsheets with permission.'}</p></div>${gUser?'<span class="sheets-badge">● Connected</span>':'<span class="badge gray">Disconnected</span>'}</div>${!gUser?`<div style="max-width:320px;margin:15px 0 10px;">${googleButtonHtml('Connect with Google')}</div><p class="small muted" style="margin-top:8px">Enables reading and writing to your studio spreadsheets with your explicit permission.</p>`:`<div class="row-between" style="background:#fff;border:1px solid #e2e8e3;border-radius:10px;padding:12px 16px;margin:12px 0;"><div style="display:flex;align-items:center;gap:12px;"><div class="avatar" style="background:#e8f0fe;color:#1a73e8;">G</div><div><strong>${esc(gUser.displayName||'Google User')}</strong><small class="muted" style="display:block;">${esc(gUser.email)}</small></div></div><div style="display:flex;gap:8px;">${button('Disconnect Google','google-signout','light sm')}</div></div>`}</section>${gUser?`<section class="panel"><div class="panel-head"><div><span class="eyebrow">LINKED SPREADSHEET</span><h2 style="margin-top:5px">${isLinked?esc(state.linkedSheetTitle||'MAKE.INC — Studio Operations'):'No Spreadsheet Linked'}</h2><p>${isLinked?`Spreadsheet ID: ${esc(state.linkedSheetId)}`:'Link an existing spreadsheet or create a new structured studio operations sheet.'}</p></div>${isLinked?`<a href="https://docs.google.com/spreadsheets/d/${esc(state.linkedSheetId)}" target="_blank" rel="noopener noreferrer" class="btn light sm">${I('external')} Open in Google Sheets</a>`:''}</div>${isLinked?`<div class="metric-grid" style="margin:15px 0 20px;">${metricCard('sheets','CONNECTED SHEET',esc(state.linkedSheetTitle||'MAKE.INC Operations'),'Sync destination')}${metricCard('refresh','LAST SYNC',syncTime,'Full export timestamp')}${metricCard('tasks','STUDIO RECORDS',`${state.data.shifts.length} shifts · ${state.data.tasks.length} tasks`,'Ready to export')}</div><div class="action-row" style="margin-top:15px;">${button(`${I('refresh')} Sync Studio Data to Google Sheet`,'sync-sheet-confirm','primary')}${button(`${I('download')} Import Tasks from Google Sheet`,'import-tasks','light')}${button(`${I('x')} Unlink / Change Sheet`,'unlink-sheet','light')}</div><p class="small muted" style="margin-top:12px">Syncing exports current attendance, project tasks, leave requests, reimbursements, and staff directory into their respective tabs.</p>`:`<div class="sheets-card-grid"><div style="border:1px solid #e5e8e5;border-radius:12px;padding:20px;background:#faf9f6;"><h3 style="margin-bottom:6px;">Option 1: Create New Studio Sheet</h3><p class="small muted" style="margin-bottom:16px;">Generates a new 'MAKE.INC — Studio Operations' spreadsheet in your Google Drive with Attendance, Tasks, Leave Requests, Reimbursements, Staff, and Settings tabs.</p>${button(`${I('plus')} Create & Link Studio Sheet`,'create-sheet-confirm','dark')}</div><div style="border:1px solid #e5e8e5;border-radius:12px;padding:20px;background:#fff;"><h3 style="margin-bottom:6px;">Option 2: Select from Google Drive</h3><p class="small muted" style="margin-bottom:14px;">Browse spreadsheets in your Google Drive to link.</p>${button(`${I('search')} Browse My Drive Spreadsheets`,'browse-sheets','light sm')}${state.driveSheets&&state.driveSheets.length?`<div style="margin-top:12px;max-height:180px;overflow:auto;border:1px solid #eff0ed;border-radius:8px;">${state.driveSheets.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #f0f2ef;"><div><strong style="font-size:12px;">${esc(s.name)}</strong><small class="muted" style="display:block;">Modified ${dated(s.modifiedTime)}</small></div>${button('Select','select-drive-sheet','soft sm',`data-sheet-id="${safeAttr(s.id)}" data-sheet-name="${safeAttr(s.name)}"`)}</div>`).join('')}</div>`:''}</div><div style="border:1px solid #e5e8e5;border-radius:12px;padding:20px;background:#fff;"><h3 style="margin-bottom:6px;">Option 3: Enter Spreadsheet ID or URL</h3><p class="small muted" style="margin-bottom:14px;">Paste the URL or ID of an existing Google Spreadsheet.</p><form data-form="link-sheet-manual" style="display:flex;gap:8px;"><input name="sheet_input" placeholder="Paste URL or Spreadsheet ID" required style="border:1px solid #dfe4e1;border-radius:8px;padding:8px 12px;font-size:12px;flex:1;"/><button type="submit" class="btn dark sm">Link</button></form></div></div>`}</section><section class="panel"><div class="panel-head"><div><span class="eyebrow">SPREADSHEET WORKBOOK ARCHITECTURE</span><h2 style="margin-top:5px">What syncs to your Google Sheet</h2></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Tab Name</th><th>Columns / Content</th><th>Sync Direction</th></tr></thead><tbody><tr><td><strong>Attendance</strong></td><td>Shift ID, Employee Name, Email, Punch In, Punch Out, Break Hours, Worked Hours, Status, Date</td><td><span class="badge blue">App → Sheet</span></td></tr><tr><td><strong>Tasks</strong></td><td>Task ID, Task Title, Project, Assignee Email, Priority, Due Date, Status, Description</td><td><span class="badge green">Two-Way Sync</span></td></tr><tr><td><strong>Leave Requests</strong></td><td>Request ID, Employee Name, Email, Type, Dates, Reason, Status, Manager Note</td><td><span class="badge blue">App → Sheet</span></td></tr><tr><td><strong>Reimbursements</strong></td><td>Claim ID, Employee Name, Email, Category, Spent On, Amount (INR), Description, Status</td><td><span class="badge blue">App → Sheet</span></td></tr><tr><td><strong>Staff Directory</strong></td><td>Staff ID, Full Name, Email, Job Title, Role, Active Status</td><td><span class="badge blue">App → Sheet</span></td></tr><tr><td><strong>Settings</strong></td><td>Break Guidelines (Tea: 45m, Lunch: 1h), Open Shift Reminder, Time Zone, Last Sync</td><td><span class="badge gray">Configuration</span></td></tr></tbody></table></div></section>`:''}</div>`;
}
function field(label,name,type='text',value='',more=''){return `<div class="field"><label for="f_${name}">${esc(label)}</label><input id="f_${name}" name="${name}" type="${type}" value="${safeAttr(value)}" ${more}/></div>`}
function selector(label,name,options,selected){return `<div class="field"><label for="f_${name}">${esc(label)}</label><select id="f_${name}" name="${name}">${options.map(([v,l])=>`<option value="${safeAttr(v)}" ${v===selected?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`}
const textArea=(label,name,more='',value='')=>`<div class="field wide"><label for="f_${name}">${esc(label)}</label><textarea id="f_${name}" name="${name}" ${more}>${esc(value)}</textarea></div>`;
function modalContent(){const m=state.modal,u=state.user;let title='',sub='',content='',submit='Submit',isForm=true;
 if(m.kind==='leave'){title='Request time off';sub='Your request will be sent for approval.';content=`${selector('Leave type','type',[['normal','Normal leave'],['sick','Sick leave']],'normal')}${field('From','start_date','date',dayKey(),'required')}${field('To','end_date','date',dayKey(),'required')}${textArea('Reason for leave','reason','required placeholder="Add details to help your manager..."')}`;submit='Submit leave request';}
 else if(m.kind==='expense'){title='New reimbursement';sub='Record an office, travel or site-related expense.';content=`${field('Amount (₹)','amount','number','','min="1" step="0.01" required')}${selector('Expense category','category',[['Office','Office'],['Site','Site'],['Travel','Travel'],['Materials','Materials'],['Other','Other']],'Site')}${field('Expense date','spent_on','date',dayKey(),'required')}${textArea('What was this expense for?','description','required placeholder="Example: Site printing for project review"')}<div class="field wide"><label for="f_receipt">Receipt / invoice (optional, max 5 MB)</label><input id="f_receipt" type="file" name="receipt" accept="image/png,image/jpeg,image/webp,application/pdf"/><span class="helper">Accepted formats: JPG, PNG, WebP or PDF.</span></div>`;submit='Submit claim';}
 else if(m.kind==='task'){title='Assign a new task';sub='Create a deliverable for a member of your team.';content=`${field('Task title','title','text','','required maxlength="120" placeholder="e.g. Prepare concept floor plans"')}${field('Project name','project','text','','placeholder="e.g. Waterfront Residence"')}${selector('Assign to','assignee_id',state.data.profiles.filter(p=>p.is_active).map(p=>[p.id,p.full_name]),state.data.profiles.find(p=>p.role==='employee'&&p.is_active)?.id)}${selector('Priority','priority',[['high','High priority'],['medium','Medium priority'],['low','Low priority']],'medium')}${field('Due date','due_date','date',dayKey())}${textArea('Description / Instructions','description','placeholder="Project instructions or deliverables"')}`;submit='Assign task';}
 else if(m.kind==='profile'){title='Edit personal details';sub='Keep your profile information up to date.';content=`${field('Full name','full_name','text',u.full_name,'required')}${field('Phone number','phone','tel',u.phone||'','placeholder="Optional"')}<div class="callout" style="grid-column:1/-1">Email and job role are managed by your studio administrator.</div>`;submit='Save changes';}
 else if(m.kind==='access'){const p=userOf(m.id);title='Manage staff access';sub=`${p.full_name} · ${p.email}`;content=`${selector('Account status','is_active',[['true','Approved / active'],['false','Pending / inactive']],String(p.is_active))}${selector('Access role','role',[['employee','Employee'],['admin','Administrator'],['principal','Principal Architect']],p.role)}${u.role!=='principal'?'<div class="callout" style="grid-column:1/-1">Only the Principal Architect may change roles. You can activate or deactivate employee accounts.</div>':''}<input type="hidden" name="id" value="${safeAttr(m.id)}"/>`;submit='Update account';}
 else if(m.kind==='review'){title=m.entity==='leave'?'Review leave request':'Review reimbursement';const dec=m.decision;sub=`Confirm ${dec} for ${esc(nameOf(m.user_id))}.`;content=`<p style="grid-column:1/-1;font-size:13px;margin:0 0 3px">You are about to <strong>${esc(dec)}</strong> this request.</p>${textArea('Manager note (optional)','note','placeholder="Optional explanation"')}<input type="hidden" name="id" value="${safeAttr(m.id)}"/>`;submit='Confirm '+dec;}
 else if(m.kind==='clockout'){title='Finish today’s shift?';sub='Your working time will be saved to the attendance log.';const s=shiftOf(),t=shiftTime(s);content=`<div class="callout" style="grid-column:1/-1"><strong>Net hours logged: ${fmtMs(t.worked)}</strong> Total breaks ${fmtHours(t.breakMs)} · Punched in ${clockTime(s?.punched_in_at)}</div>`;submit='Confirm Punch Out';}
 else if(m.kind==='policy'){title='Studio attendance guide';sub='Clear, fair timing for every working day.';content=`<div style="grid-column:1/-1"><div class="detail-row"><strong>01</strong><div><strong>Punch In</strong><p>Starts your net work timer and attendance record.</p></div></div><div class="detail-row"><strong>02</strong><div><strong>Tea / Lunch break</strong><p>Pauses the work timer and starts a separate break timer. Only one break may be open.</p></div></div><div class="detail-row"><strong>03</strong><div><strong>End Break</strong><p>Stops the break timer and immediately resumes your work timer.</p></div></div><div class="detail-row"><strong>04</strong><div><strong>Punch Out</strong><p>Closes your workday. End any break first.</p></div></div><div class="callout" style="margin-top:18px">Reminder guidelines: Tea 45 minutes · Lunch 1 hour · Open shift 9 hours. Your employer can adjust these in the app source. In-app reminders need the portal open; offline push alerts would require a notification service.</div></div>`;isForm=false;}
 else if(m.kind==='confirm-create-sheet'){title='Create Studio Operations Sheet?';sub='Google Drive & Sheets Integration';content=`<div class="callout" style="grid-column:1/-1"><strong>Create 'MAKE.INC — Studio Operations' in your Google Drive</strong><p style="margin-top:4px;">This creates a new spreadsheet in your Google account with tabs for Attendance, Tasks, Leave Requests, Reimbursements, Staff Directory, and Settings, and exports your current studio data into it.</p></div><div class="action-row" style="grid-column:1/-1;margin-top:15px;justify-content:flex-end;">${button('Cancel','close-modal','light')}${button(`${I('plus')} Confirm & Create Sheet`,'confirm-create-sheet','dark')}</div>`;isForm=false;}
 else if(m.kind==='confirm-sync-sheet'){title='Sync Data to Google Sheet?';sub=`Target: ${esc(state.linkedSheetTitle||'Studio Operations')}`;content=`<div class="callout" style="grid-column:1/-1"><strong>Update Google Sheet with current studio records</strong><p style="margin-top:4px;">This will update the Attendance, Tasks, Leave Requests, Reimbursements, and Staff Directory tabs in your linked sheet with current portal records (${state.data.shifts.length} shifts, ${state.data.tasks.length} tasks, ${state.data.leave_requests.length} leaves, ${state.data.reimbursements.length} expenses).</p></div><div class="action-row" style="grid-column:1/-1;margin-top:15px;justify-content:flex-end;">${button('Cancel','close-modal','light')}${button(`${I('refresh')} Confirm & Sync Data`,'confirm-sync-sheet','primary')}</div>`;isForm=false;}
 return `<div class="modal-backdrop" data-action="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><div class="eyebrow">MAKE.INC STUDIO PORTAL</div><h2>${esc(title)}</h2><p class="small muted" style="margin-top:5px">${sub}</p></div><button class="modal-close" data-action="close-modal" aria-label="Close dialog">${I('x')}</button></div>${isForm?`<form data-form="${m.kind}"><div class="form-grid">${content}</div><div class="modal-actions">${button('Cancel','close-modal','light')}<button type="submit" class="btn dark">${esc(submit)} ${I('arrow','icon sm')}</button></div></form>`:`${content}<div class="modal-actions">${button('Close','close-modal','dark')}</div>`}</div></div>`;
}
function authView(){const register=state.authMode==='register';return `<div class="login-shell"><div class="login-art"><img src="./logo.png" class="login-brand" alt="MAKE.INC Design + Build"/><div><div class="eyebrow" style="color:#c3a382">THE STUDIO. CONNECTED.</div><div class="headline">Great spaces.<br/>Better <em>teamwork.</em></div><p>One thoughtfully designed workspace for attendance, everyday tasks, leave management and everything that keeps our studio moving.</p></div><div class="bottom">DESIGN WITH INTENTION &nbsp; / &nbsp; BUILD WITH PURPOSE</div></div><div class="login-right"><div class="login-form"><div class="eyebrow" style="color:#a6896d">MAKE.INC / EMPLOYEE PORTAL</div><h1 style="margin-top:8px">${register?'Join the studio.':'Welcome back.'}</h1><p class="muted">${register?'Create your individual employee account. Management will activate your access.':'Sign in to your personal studio workspace.'}</p><form data-form="${register?'register':'login'}">${register?field('Full name','full_name','text','','required autocomplete="name"'):''}${field('Email address','email','email','','required autocomplete="email" placeholder="you@make.inc"')}${field('Password','password','password','','required minlength="6" autocomplete="'+(register?'new-password':'current-password')+'" placeholder="Minimum 6 characters"')}<button class="btn dark full" style="margin-top:15px" type="submit">${register?'Create account':'Sign in'} ${I('arrow','icon sm')}</button></form><div style="margin-top:14px">${googleButtonHtml(register?'Sign up with Google':'Sign in with Google')}</div><div class="login-switch">${register?'Already have an account?':'New to MAKE.INC?'} <button class="text-button" data-action="auth-switch">${register?'Sign in':'Create an account'}</button></div>${!LIVE?`<div class="login-sep"></div><div class="demo-options"><button class="btn light" data-demo-user="demo-employee">Employee view</button><button class="btn light" data-demo-user="demo-admin">Admin view</button><button class="btn light" data-demo-user="demo-principal">Principal view</button></div><p class="helper" style="margin-top:14px;text-align:center">Demo runs locally, without real authentication or shared team data.</p>`:''}<p class="helper" style="text-align:center;margin-top:35px">© ${new Date().getFullYear()} MAKE.INC · DESIGN + BUILD</p></div></div></div>`}
function pendingView(){const u=state.user;return `<div class="login-shell"><div class="login-art"><img src="./logo.png" class="login-brand" alt="MAKE.INC"/><div><div class="headline">Your place<br/>in the <em>studio.</em></div><p>Every team member has a dedicated workspace. Your account is registered and awaiting approval.</p></div><div class="bottom">DESIGN + BUILD</div></div><div class="login-right"><div class="login-form"><span class="badge amber">Awaiting staff approval</span><h1 style="margin-top:18px">Welcome, ${esc(u.full_name.split(' ')[0])}.</h1><p class="muted">Your account (${esc(u.email)}) is pending activation by the studio administrator or Principal Architect. Once approved, sign in to use attendance, tasks and requests.</p><div class="stack">${button(`${I('refresh')} Check approval status`,'refresh','dark')}${button(`${I('logout')} Sign out`,'logout','light')}</div></div></div></div>`}
function render(){if(!state.loaded){ROOT.innerHTML='<div class="loading">MAKE.INC / LOADING WORKSPACE</div>';return;}ROOT.innerHTML=!state.user?authView():!state.user.is_active?pendingView():layout(renderView());updateLive();}
function updateLive(){
 if(!state.user?.is_active)return;
 const s=shiftOf(),t=shiftTime(s),b=breakOf();
 document.querySelectorAll('[data-live="work"]').forEach(el=>el.textContent=fmtMs(t.worked));
 document.querySelectorAll('[data-live="break"]').forEach(el=>el.textContent=fmtMs(currentBreakMs()));
 document.querySelectorAll('[data-live="break-total"]').forEach(el=>el.textContent=fmtHours(t.breakMs));
 document.querySelectorAll('[data-live="shift-elapsed"]').forEach(el=>el.textContent=fmtHours(t.elapsed));
 document.querySelectorAll('[data-live="progress"]').forEach(el=>el.style.width=Math.min(100,t.worked/(8*3600000)*100)+'%');
 document.querySelectorAll('[data-teamtime]').forEach(el=>{const sh=shiftOf(el.dataset.teamtime);el.textContent=sh?fmtHours(shiftTime(sh).worked):'—'});
 const box=document.getElementById('reminders');if(box){const ns=noticeMessages();const k=ns.map(n=>n.id).join('|');if(box.dataset.noticeKey!==k){box.innerHTML=renderNotices();box.dataset.noticeKey=k;}}
}
async function runAction(type,p,success){if(state.busy)return;state.busy=true;try{await act(type,p);state.modal=null;await refresh();if(success)toast(success);}catch(e){toast(e.message||'Something went wrong',true)}finally{state.busy=false}}
function openModal(kind,extra={}){state.modal={kind,...extra};render();}
function closeModal(){state.modal=null;render();}
function navigate(view){if(['team','board','approvals','people','sheets'].includes(view)&&!isManager(state.user))return;state.view=view;state.modal=null;state.filter='all';state.mobileMenu=false;render();window.scrollTo?.({top:0,behavior:'instant'});}
async function logout(){if(LIVE&&state.session){try{await authFetch('/auth/v1/logout','POST',{})}catch{}}state.session=null;state.user=null;state.modal=null;state.view='dashboard';persistSession();render()}
async function demoLogin(id){let db=state.data;const p=db.profiles.find(x=>x.id===id);if(!p)return toast('Demo user not found.',true);state.session={demoUserId:id};state.user=p;state.view='dashboard';persistSession();render()}
const roleActions={
 'clock-in':()=>runAction('clock_in',{},'Punched in. Have a productive day!'),
 'clock-out':()=>breakOf()?toast('End your active break before punching out.',true):openModal('clockout'),
 'break-tea':()=>runAction('begin_break',{kind:'tea'},'Tea break started. Your work timer is paused.'),
 'break-lunch':()=>runAction('begin_break',{kind:'lunch'},'Lunch break started. Your work timer is paused.'),
 'break-end':()=>runAction('finish_break',{},'Break ended. Your work timer has resumed.'),
 'new-leave':()=>openModal('leave'), 'new-expense':()=>openModal('expense'), 'new-task':()=>isManager(state.user)&&openModal('task'),
 'edit-profile':()=>openModal('profile'), 'policy':()=>openModal('policy'), 'notify':()=>requestNotification(),
 'refresh':async()=>{try{await refresh();toast('Workspace updated.')}catch(e){toast(e.message,true)}},
 'logout':()=>logout(), 'auth-switch':()=>{state.authMode=state.authMode==='login'?'register':'login';render()},
 'toggle-menu':()=>{state.mobileMenu=!state.mobileMenu;render()},'close-menu':()=>{state.mobileMenu=false;render()},
 'close-modal':()=>closeModal(),'task-toggle':el=>runAction('task_status',{id:el.dataset.id,status:el.dataset.status},'Task status updated.'),
 'task-start':el=>runAction('task_status',{id:el.dataset.id,status:'in_progress'},'Task moved to In progress.'),
 'task-done':el=>runAction('task_status',{id:el.dataset.id,status:'done'},'Task completed.'),
 'edit-access':el=>openModal('access',{id:el.dataset.id}),
 'dismiss-notice':el=>{state.dismissed.add(el.dataset.id);render()},
 'receipt':async el=>{try{await openReceipt(el.dataset.path)}catch(e){toast(e.message,true)}},
 'leave-approve':el=>{const x=state.data.leave_requests.find(r=>r.id===el.dataset.id);openModal('review',{entity:'leave',id:x.id,user_id:x.user_id,decision:'approved'})},
 'leave-reject':el=>{const x=state.data.leave_requests.find(r=>r.id===el.dataset.id);openModal('review',{entity:'leave',id:x.id,user_id:x.user_id,decision:'rejected'})},
 'expense-approve':el=>{const x=state.data.reimbursements.find(r=>r.id===el.dataset.id);openModal('review',{entity:'expense',id:x.id,user_id:x.user_id,decision:'approved'})},
 'expense-reject':el=>{const x=state.data.reimbursements.find(r=>r.id===el.dataset.id);openModal('review',{entity:'expense',id:x.id,user_id:x.user_id,decision:'rejected'})},
 'expense-paid':el=>{const x=state.data.reimbursements.find(r=>r.id===el.dataset.id);openModal('review',{entity:'expense',id:x.id,user_id:x.user_id,decision:'paid'})},
 'google-signin':async()=>{
   try{
     if(!window.GoogleSheetsBridge)throw new Error('Google Workspace Bridge is loading. Please try again.');
     state.busy=true;
     const {user}=await window.GoogleSheetsBridge.signIn();
     state.googleUser=user;
     if(!state.user){
       let profile=state.data.profiles.find(p=>p.email.toLowerCase()===user.email.toLowerCase());
       if(!profile){
         profile={id:'g-'+user.uid.slice(0,10),full_name:user.displayName||user.email.split('@')[0],email:user.email,role:'principal',job_title:'Principal Architect',is_active:true,phone:'',created_at:new Date().toISOString()};
         state.data.profiles.push(profile);
         persistDB();
       }
       state.session={demoUserId:profile.id};
       state.user=profile;
       persistSession();
       toast(`Signed in as ${profile.full_name}. Google Sheets connected!`);
     } else {
       toast(`Google account (${user.email}) connected.`);
     }
     render();
   }catch(err){toast(err.message,true);}finally{state.busy=false;}
 },
 'google-signout':async()=>{
   try{if(window.GoogleSheetsBridge)await window.GoogleSheetsBridge.signOut();state.googleUser=null;toast('Google account disconnected.');render();}catch(err){toast(err.message,true);}
 },
 'create-sheet-confirm':()=>openModal('confirm-create-sheet'),
 'confirm-create-sheet':async()=>{
   try{
     state.busy=true;closeModal();toast('Creating Google Sheet in Drive...');
     const created=await window.GoogleSheetsBridge.createStudioSpreadsheet('MAKE.INC — Studio Operations',state.data);
     state.linkedSheetId=created.spreadsheetId;
     state.linkedSheetTitle=created.properties?.title||'MAKE.INC — Studio Operations';
     state.lastSheetSync=new Date().toISOString();
     localStorage.setItem('makeinc_sheet_id',state.linkedSheetId);
     localStorage.setItem('makeinc_sheet_title',state.linkedSheetTitle);
     localStorage.setItem('makeinc_last_sheet_sync',state.lastSheetSync);
     toast('Google Sheet created and initial studio data synced!');
     render();
   }catch(err){toast(err.message,true);}finally{state.busy=false;}
 },
 'sync-sheet-confirm':()=>openModal('confirm-sync-sheet'),
 'confirm-sync-sheet':async()=>{
   try{
     if(!state.linkedSheetId)return toast('Please link a spreadsheet first.',true);
     state.busy=true;closeModal();toast('Syncing records to Google Sheet...');
     await window.GoogleSheetsBridge.syncDataToSheet(state.linkedSheetId,state.data);
     state.lastSheetSync=new Date().toISOString();
     localStorage.setItem('makeinc_last_sheet_sync',state.lastSheetSync);
     toast('Google Sheet updated with current studio records!');
     render();
   }catch(err){toast(err.message,true);}finally{state.busy=false;}
 },
 'import-tasks':async()=>{
   try{
     if(!state.linkedSheetId)return toast('Please link a spreadsheet first.',true);
     state.busy=true;toast('Reading tasks from Google Sheet...');
     const tasks=await window.GoogleSheetsBridge.importTasksFromSheet(state.linkedSheetId,state.data.profiles);
     if(!tasks||!tasks.length){toast('No tasks found in the Tasks tab.');return;}
     const existingIds=new Set(state.data.tasks.map(t=>t.id));
     let added=0;
     tasks.forEach(t=>{
       if(!existingIds.has(t.id)){state.data.tasks.push(t);added++;}
       else{const idx=state.data.tasks.findIndex(x=>x.id===t.id);if(idx!==-1)state.data.tasks[idx]={...state.data.tasks[idx],...t};}
     });
     persistDB();
     toast(`${tasks.length} task(s) processed from Google Sheet (${added} new).`);
     render();
   }catch(err){toast(err.message,true);}finally{state.busy=false;}
 },
 'browse-sheets':async()=>{
   try{
     state.busy=true;
     const files=await window.GoogleSheetsBridge.listSpreadsheets();
     state.driveSheets=files;
     if(!files.length)toast('No Google Spreadsheets found in your Drive.');
     render();
   }catch(err){toast(err.message,true);}finally{state.busy=false;}
 },
 'select-drive-sheet':(el)=>{
   const id=el.dataset.sheetId;const name=el.dataset.sheetName||'Google Sheet';
   state.linkedSheetId=id;state.linkedSheetTitle=name;
   localStorage.setItem('makeinc_sheet_id',id);
   localStorage.setItem('makeinc_sheet_title',name);
   toast(`Linked spreadsheet: ${name}`);
   render();
 },
 'unlink-sheet':()=>{
   state.linkedSheetId='';state.linkedSheetTitle='';
   localStorage.removeItem('makeinc_sheet_id');
   localStorage.removeItem('makeinc_sheet_title');
   toast('Spreadsheet unlinked.');
   render();
 }
};
ROOT.addEventListener('click',async e=>{
 const demo=e.target.closest('[data-demo-user]');if(demo)return demoLogin(demo.dataset.demoUser);
 const v=e.target.closest('[data-view]');if(v)return navigate(v.dataset.view);
 const el=e.target.closest('[data-action]');if(!el)return;
 if(el.dataset.action==='modal-backdrop'&&e.target!==el)return;
 const action=roleActions[el.dataset.action];if(action)try{await action(el)}catch(err){toast(err.message,true)};
});
ROOT.addEventListener('change',async e=>{
 const el=e.target;
 if(el.matches('[data-role-switch]'))return demoLogin(el.value);
 if(el.matches('[data-task-select]'))return runAction('task_status',{id:el.dataset.taskSelect,status:el.value},'Task updated.');
});
ROOT.addEventListener('click',e=>{const f=e.target.closest('[data-filter]');if(f){state.filter=f.dataset.filter;render();}});
ROOT.addEventListener('submit',async e=>{
 const form=e.target.closest('form[data-form]');if(!form)return;e.preventDefault();if(state.busy)return;
 const data=Object.fromEntries(new FormData(form).entries()),kind=form.dataset.form;
 if(kind==='login'){
  if(!LIVE)return toast('Choose one of the demo views below. Configure Supabase to enable real accounts.',true);
  state.busy=true;try{await liveSignIn(data.email,data.password);await loadLive();state.view='dashboard';render();toast('Signed in successfully.')}catch(err){state.user=null;state.session=null;persistSession();toast(err.message,true)}finally{state.busy=false}return;
 }
 if(kind==='register'){
  if(String(data.password||'').length<6)return toast('Password must contain at least 6 characters.',true);
  state.busy=true;
  try{
   if(LIVE){const verified=await liveSignUp(data.full_name.trim(),data.email.trim(),data.password);if(verified){await loadLive();render();toast('Account created. Management approval is required.')}else{state.authMode='login';render();toast('Account registered. Check your email for the confirmation link, then sign in.')}}
   else{const id=uid();const p={id,full_name:data.full_name.trim(),email:data.email.trim(),role:'employee',job_title:'Employee',is_active:false,phone:'',created_at:new Date().toISOString()};state.data.profiles.push(p);persistDB();await demoLogin(id);toast('Demo account created. A manager can approve it.');}
  }catch(err){toast(err.message,true)}finally{state.busy=false}return;
 }
 if(kind==='leave'){
  if(data.end_date<data.start_date)return toast('End date cannot be earlier than start date.',true);
  if(!data.reason.trim())return toast('Please add a reason for your request.',true);
  return runAction('leave_request',{type:data.type,start_date:data.start_date,end_date:data.end_date,reason:data.reason.trim()},'Leave request sent to management.');
 }
 if(kind==='expense'){
  if(!(Number(data.amount)>0))return toast('Please enter a valid amount.',true);
  state.busy=true;
  try{const path=await storeReceipt(data.receipt?.size?data.receipt:null);await act('reimbursement',{amount:Number(data.amount),category:data.category,spent_on:data.spent_on,description:data.description.trim(),receipt_path:path});state.modal=null;await refresh();toast('Reimbursement request sent for approval.')}catch(err){toast(err.message,true)}finally{state.busy=false}return;
 }
 if(kind==='task')return runAction('assign_task',{title:data.title.trim(),description:data.description.trim(),project:data.project.trim(),assignee_id:data.assignee_id,due_date:data.due_date,priority:data.priority},'New task assigned to the employee.');
 if(kind==='profile')return runAction('profile_update',{full_name:data.full_name.trim(),phone:data.phone.trim()},'Your account has been updated.');
 if(kind==='access')return runAction('access_update',{id:data.id,role:data.role,is_active:data.is_active==='true'},'Employee access updated.');
 if(kind==='review')return runAction(state.modal.entity==='leave'?'leave_review':'expense_review',{id:data.id,decision:state.modal.decision,note:data.note},'Request reviewed successfully.');
 if(kind==='clockout')return runAction('clock_out',{},'Punched out. Your workday has been saved.');
 if(kind==='link-sheet-manual'){
  const val=String(data.sheet_input||'').trim();let id=val;
  const m=val.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if(m)id=m[1];
  if(!id)return toast('Please enter a valid spreadsheet ID or URL.',true);
  state.linkedSheetId=id;state.linkedSheetTitle='Linked Studio Sheet';
  localStorage.setItem('makeinc_sheet_id',id);
  localStorage.setItem('makeinc_sheet_title',state.linkedSheetTitle);
  toast('Spreadsheet linked successfully.');
  render();return;
 }
});
let pollInProgress=false;
async function pollLiveData(){
 if(!LIVE||!state.session||document.hidden||state.busy||state.modal||pollInProgress)return;
 const active=document.activeElement;
 const editing=active&&ROOT.contains(active)&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);
 const before=JSON.stringify(state.data);
 pollInProgress=true;
 try{await loadLive();const changed=before!==JSON.stringify(state.data);if(changed&&!editing&&!state.modal&&!state.busy){render();}else{updateLive();}}
 catch(err){/* Keep the current screen usable during brief network interruptions. */}
 finally{pollInProgress=false;}
}

async function init(){
 if(LIVE){state.session=readLocal(AUTH_KEY);if(state.session){try{await loadLive()}catch(err){state.session=null;state.user=null;persistSession();toast('Session expired or connection failed. Please sign in again.',true)}}}
 else{state.data=readLocal(DB_KEY)||demoData();state.session=readLocal(SESSION_KEY);if(state.session?.demoUserId)state.user=state.data.profiles.find(p=>p.id===state.session.demoUserId)||null;}
 if(window.GoogleSheetsBridge){
  window.GoogleSheetsBridge.onAuthChange((user)=>{state.googleUser=user;render();});
 }
 state.loaded=true;render();setInterval(updateLive,1000);if(LIVE){setInterval(pollLiveData,25000);}
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
init().catch(err=>{state.loaded=true;state.session=null;state.user=null;render();toast(err.message,true)});
})();
