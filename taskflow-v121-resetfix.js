(function(){
'use strict';
if(window.__tfV121ResetFix)return;window.__tfV121ResetFix=true;

const MAIN='taskflow_db_v26';
const BACK='taskflow_db_v26_backup';
const REC='taskflow_db_v26_recovery';
const TOUCH='taskflow_cloud_local_touch_v1';
const APPLIED_PREFIX='taskflow_global_reset_applied_v121_';
const WELCOME_KEY='taskflow_welcome_seen_v13083_release';
function tf121LockWelcomeOff(){
 try{localStorage.setItem(WELCOME_KEY,'1')}catch(_){}
 try{window.__tfV13063Welcome=true;window.__tfV13064WelcomeEmphasis=true}catch(_){}
 if(window.__tfWelcomeSeenKeyGuard)return;
 try{
  const original=Storage.prototype.removeItem;
  Storage.prototype.removeItem=function(key){
   if(this===localStorage&&key===WELCOME_KEY)return;
   return original.apply(this,arguments);
  };
  window.__tfWelcomeSeenKeyGuard=true;
 }catch(_){}
}
function tf121FreshReload(delay){
 tf121LockWelcomeOff();
 setTimeout(()=>{
  try{
   const u=new URL(location.href);
   u.searchParams.set('tfv','13096-'+Date.now());
   location.replace(u.href);
  }catch(_){location.reload()}
 },Math.max(0,delay||0));
}
tf121LockWelcomeOff();
const CFG='taskflow_routines_v115';
const CFG_META='taskflow_routines_v115_meta';
const MENTAL_USER='taskflow_v13041_mentalista_user_choice';
const MENTAL_GUARD='taskflow_v13066_mentalista_enabled_guard';
const MENTAL_PROGRESS='taskflow_v13066_mentalist_progress';
const ROUTINE_KEYS=['sung','juridico','socrates','maquiavelo','mentalista','budget503020'];
const PROJECT='taskflow-b0ece';
const API='https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents';
let busy=false,pollTimer=0,checking=false;
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function user(){
 try{
  const u=window.TaskFlowFirebase&&window.TaskFlowFirebase.getUser?window.TaskFlowFirebase.getUser():null;
  if(u&&u.uid)return u;
  const fu=window.firebase&&window.firebase.auth?window.firebase.auth().currentUser:null;
  return fu&&fu.uid?fu:null;
 }catch(_){return null}
}

async function token(force){
 if(!window.TaskFlowFirebase||typeof window.TaskFlowFirebase.getIdToken!=='function')return null;
 return window.TaskFlowFirebase.getIdToken(!!force);
}

async function resetDoc(uid,method,body){
 let t=await token(false);if(!t)throw new Error('AUTH_REQUIRED');
 const url=API+'/users/'+encodeURIComponent(uid)+'/control/resetState';
 const opt={method:method||'GET',headers:{'Authorization':'Bearer '+t,'Content-Type':'application/json'}};
 if(body)opt.body=JSON.stringify(body);
 let r=await fetch(url,opt);
 if(r.status===401){t=await token(true);if(t){opt.headers.Authorization='Bearer '+t;r=await fetch(url,opt)}}
 if(r.status===404)return null;
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d&&d.error&&d.error.message||('HTTP '+r.status));
 return d;
}

function readResetAt(doc){
 const f=doc&&doc.fields||{};
 return Number(f.resetAt&&f.resetAt.integerValue)||0;
}

async function writeMarker(uid,stamp){
 const name='projects/'+PROJECT+'/databases/(default)/documents/users/'+uid+'/control/resetState';
 return resetDoc(uid,'PATCH',{name,fields:{resetAt:{integerValue:String(stamp)},version:{integerValue:'121'}}});
}

async function writeRoutineConfig(uid,stamp){
 let t=await token(false);if(!t)throw new Error('AUTH_REQUIRED');
 const url=API+'/users/'+encodeURIComponent(uid)+'/settings/routinesV115';
 const config={};for(const k of ROUTINE_KEYS)config[k]=false;
 const name='projects/'+PROJECT+'/databases/(default)/documents/users/'+uid+'/settings/routinesV115';
 const body={name,fields:{config:{stringValue:JSON.stringify(config)},updatedAt:{integerValue:String(stamp)}}};
 const opt={method:'PATCH',headers:{'Authorization':'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify(body)};
 let r=await fetch(url,opt);
 if(r.status===401){t=await token(true);if(t){opt.headers.Authorization='Bearer '+t;r=await fetch(url,opt)}}
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d&&d.error&&d.error.message||('HTTP '+r.status));
 return true;
}

function gtClock(){
 const p={};
 new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value});
 const y=+p.year,m=+p.month,d=+p.day,h=+p.hour||0;
 const todayDMY=`${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
 const logical=new Date(Date.UTC(y,m-1,d,12));
 if(h<1)logical.setUTCDate(logical.getUTCDate()-1);
 const ly=logical.getUTCFullYear(),lm=String(logical.getUTCMonth()+1).padStart(2,'0'),ld=String(logical.getUTCDate()).padStart(2,'0');
 const iso=`${ly}-${lm}-${ld}`;
 return{todayDMY,iso,cycleKey:iso+'-GT-01'};
}

function keyName(value){
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'');
}
function userCollectionKey(key,value){
 const n=keyName(key);
 if(/^(TASKS?|TAREAS?|HABITS?|HABITOS?|AVITOS?|ACTIVETASKS?|TASKSACTIVAS?|TAREASACTIVAS?|ACTIVEHABITS?|HABITOSACTIVOS?|AVITOSACTIVOS?)$/.test(n))return true;
 if(Array.isArray(value)&&/(TASK|TAREA|HABIT|HABITO|AVITO)/.test(n)&&!/(STREAK|RACHA|COUNT|TOTAL|SCORE|XP|LEVEL|NIVEL|RANK|RANGO)/.test(n))return true;
 return false;
}
function completionKey(key){
 const n=keyName(key);
 return /(COMPLETED|COMPLETE|COMPLETAD|DONE|FINISHED|FINALIZAD|CHECKED|ISCHECKED|ISDONE|ISCOMPLETE|COMPLETION|LASTCOMPLET|LASTDONE|LASTFINISH)/.test(n);
}
function progressKey(key){
 const n=keyName(key);
 if(!n)return false;
 return /(XP|EXPERIENCE|EXPERIENCIA|POINTS?|PUNTOS?|LEVEL|NIVEL|RANK|RANGO|STREAK|RACHA|PROGRESS|PROGRESO|SCORE|PUNTAJE|CONSECUTIVE|CONSECUTIVO|SUCCESS|EXITO|FAIL|FAILURE|FALLA|PENALTY|PENALIZACION|PUNISH|CASTIGO|PERFECT|COMPLETED|COMPLETE|COMPLETAD|DONE|FINISHED|FINALIZAD|CLAIMED|REDEEMED|HISTORY|HISTORIAL|DISCIPLINE|DISCIPLINA|GOOD.*DAY|BAD.*DAY|DAY.*GOOD|DAY.*BAD|DIA.*BUEN|DIA.*MAL|TOKEN|COIN|MONEDA|CURRENCY|BALANCE|SALDO|SAVING|AHORRO)/.test(n);
}
function zeroValue(value){
 if(typeof value==='number')return 0;
 if(typeof value==='boolean')return false;
 if(typeof value==='string')return /^-?\d+(?:\.\d+)?$/.test(value.trim())?'0':'';
 if(Array.isArray(value))return [];
 if(value&&typeof value==='object')return {};
 return null;
}
function resetUserCreated(value,key){
 if(completionKey(key))return zeroValue(value);
 if(Array.isArray(value))return value.map(v=>v&&typeof v==='object'?resetUserCreated(v,''):v);
 if(value&&typeof value==='object'){
  const out={};
  for(const k of Object.keys(value)){
   if(completionKey(k)||/(STREAK|RACHA|PROGRESS|PROGRESO|SCORE|PUNTAJE)/.test(keyName(k)))out[k]=zeroValue(value[k]);
   else out[k]=resetUserCreated(value[k],k);
  }
  return out;
 }
 return value;
}
function mergeUnique(active,completed){
 const out=[];const seen=new Set();
 for(const item of [...active,...completed]){
  const clean=resetUserCreated(item,'');
  let id='';
  if(clean&&typeof clean==='object'&&!Array.isArray(clean))id=String(clean.id??clean.uid??clean.uuid??clean.key??'');
  const signature=id?'id:'+id:'json:'+JSON.stringify(clean);
  if(seen.has(signature))continue;
  seen.add(signature);out.push(clean);
 }
 return out;
}
function foldCompletedCollections(obj){
 const keys=Object.keys(obj);
 const groups=[
  {item:/(TASK|TAREA)/,done:/(COMPLETED|COMPLETAD|DONE|FINISHED|FINALIZAD)/,active:/(^TASKS?$|^TAREAS?$|ACTIVE|ACTIVAS?)/},
  {item:/(HABIT|HABITO|AVITO)/,done:/(COMPLETED|COMPLETAD|DONE|FINISHED|FINALIZAD)/,active:/(^HABITS?$|^HABITOS?$|^AVITOS?$|ACTIVE|ACTIVOS?)/}
 ];
 for(const g of groups){
  const doneKey=keys.find(k=>Array.isArray(obj[k])&&g.item.test(keyName(k))&&g.done.test(keyName(k)));
  if(!doneKey)continue;
  const activeKey=keys.find(k=>k!==doneKey&&Array.isArray(obj[k])&&g.item.test(keyName(k))&&g.active.test(keyName(k))&&!g.done.test(keyName(k)));
  if(activeKey){
   obj[activeKey]=mergeUnique(obj[activeKey],obj[doneKey]);
   obj[doneKey]=[];
  }else{
   obj[doneKey]=obj[doneKey].map(v=>resetUserCreated(v,''));
  }
 }
 return obj;
}
function resetTree(value,key){
 if(userCollectionKey(key,value))return resetUserCreated(value,key);
 if(progressKey(key))return zeroValue(value);
 if(Array.isArray(value))return value.map(v=>v&&typeof v==='object'?resetTree(v,''):v);
 if(value&&typeof value==='object'){
  const source=foldCompletedCollections({...value});
  const out={};
  for(const k of Object.keys(source))out[k]=resetTree(source[k],k);
  return out;
 }
 return value;
}
function resetRoutineState(stamp){
 const config={};for(const k of ROUTINE_KEYS)config[k]=false;
 try{
  localStorage.setItem(CFG,JSON.stringify(config));
  localStorage.setItem(CFG_META,String(stamp));
  localStorage.setItem(MENTAL_USER,'off');
  localStorage.removeItem(MENTAL_GUARD);
  localStorage.removeItem(MENTAL_PROGRESS);
 }catch(_){}
 try{window.TaskFlowV117&&window.TaskFlowV117.refresh&&window.TaskFlowV117.refresh()}catch(_){}
 try{window.TaskFlowV119&&window.TaskFlowV119.refresh&&window.TaskFlowV119.refresh()}catch(_){}
}
function resetAuxProgress(){
 const preserve=/sound|audio|music|firebase|auth|profile|cloud_bound|cloud_sync_meta|routines_v115|routines_v115_meta/i;
 const personal=/task|tarea|habit|habito|avito/i;
 const progress=/progress|streak|racha|xp|experience|experiencia|points?|puntos?|level|nivel|rank|rango|score|puntaje|success|exito|fail|falla|penalty|castigo|perfect|completed|complete|completad|done|finished|finalizad|history|historial|discipline|disciplina|good.*day|bad.*day|dia.*buen|dia.*mal|token|coin|moneda|saldo|saving|ahorro|mission|mision/i;
 const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k)keys.push(k)}
 for(const k of keys){
  if(!k||!k.startsWith('taskflow_')||k===MAIN||k===BACK||k===REC||k===TOUCH)continue;
  if(preserve.test(k)||k.startsWith(APPLIED_PREFIX)||k===MENTAL_USER)continue;
  if(personal.test(k)){
   /* Nunca se elimina una definición personal por nombre de clave. Su estado se reinicia dentro de MAIN/BACK/REC. */
   continue;
  }
  if(progress.test(k)){try{localStorage.removeItem(k)}catch(_){}}
 }
}
function resetLocal(stamp){
 const arr=[MAIN,REC,BACK].map(key=>{
  try{const raw=localStorage.getItem(key),data=raw?JSON.parse(raw):null;return data&&typeof data==='object'&&!Array.isArray(data)?{data,savedAt:Number(data.savedAt)||0}:null}catch(_){return null}
 }).filter(Boolean);
 if(!arr.length)throw new Error('NO_STATE');
 arr.sort((a,b)=>b.savedAt-a.savedAt);
 const data=resetTree(arr[0].data,'');
 if(!data.meta||typeof data.meta!=='object'||Array.isArray(data.meta))data.meta={};
 const m=data.meta,g=gtClock();
 m.habitStreakCurrent=0;
 m.habitStreakBest=0;
 m.taskStreakCurrent=0;
 m.taskStreakBest=0;
 m.unifiedStreakCurrent=0;
 m.unifiedStreakBest=0;
 m.lastUnifiedSuccessDate=null;
 m.dailyPenaltyTokens={};
 m.v32PerfectDayLog={};
 m.incomeMissionPenaltyTokens={};
 m.punishmentActive=false;
 m.punishmentReason='';
 m.punishmentCompleted=false;
 m.punishmentTarget=null;
 m.lastPunishmentCycleKey=g.cycleKey;
 m.lastHabitCycleKey=g.cycleKey;
 m.lastTaskProcessingDate=g.todayDMY;
 m.v32ShopPerfectProcessed=g.iso;
 const applied=Math.max(Date.now(),Number(stamp)||0);
 data.savedAt=applied;
 const raw=JSON.stringify(data);
 localStorage.setItem(MAIN,raw);
 localStorage.setItem(BACK,raw);
 localStorage.setItem(REC,raw);
 localStorage.setItem(TOUCH,String(applied));
 resetAuxProgress();
 try{localStorage.setItem('taskflow_welcome_seen_v13083_release','1')}catch(_){}
 resetRoutineState(applied);
 return applied;
}

async function waitCloud(uid){
 try{if(window.TaskFlowCloudSync&&window.TaskFlowCloudSync.initialize)await window.TaskFlowCloudSync.initialize()}catch(_){}
 for(let i=0;i<50;i++){
  try{if(window.TaskFlowCloudSync&&window.TaskFlowCloudSync.getUid&&window.TaskFlowCloudSync.getUid()===uid)return true}catch(_){}
  await sleep(100);
 }
 return false;
}

async function syncAccount(uid){
 await waitCloud(uid);
 if(!window.TaskFlowCloudSync||typeof window.TaskFlowCloudSync.syncNow!=='function')throw new Error('SYNC_UNAVAILABLE');
 const ok=await window.TaskFlowCloudSync.syncNow();
 if(ok===false)throw new Error('SYNC_FAILED');
 return true;
}

function status(text,kind){
 const s=$('tf120ResetStatus');if(!s)return;
 s.textContent=text||'';
 s.className='tf120-status'+(kind?' '+kind:'');
}

async function performReset(e){
 if(e){e.preventDefault();e.stopImmediatePropagation();}
 if(busy)return;
 busy=true;
 const b=$('tf120ResetConfirm');if(b)b.disabled=true;
 try{
  const u=user();
  if(!u||!u.uid){
   status('Reiniciando este dispositivo…');
   resetLocal(Date.now());
   status('Dispositivo reiniciado: progreso, XP y estados completados volvieron a cero.','ok');
   tf121FreshReload(650);
   return;
  }
  status('Reiniciando la cuenta en todos tus dispositivos…');
  const stamp=Date.now();
  resetLocal(stamp);
  await syncAccount(u.uid);
  await writeRoutineConfig(u.uid,stamp);
  await writeMarker(u.uid,stamp);
  localStorage.setItem(APPLIED_PREFIX+u.uid,String(stamp));
  status('Cuenta reiniciada. El cambio se aplicará automáticamente en los demás dispositivos.','ok');
  tf121FreshReload(750);
 }catch(err){
  console.warn('TaskFlow V121 reset:',err);
  status('No se pudo completar el reinicio global. Revisa tu conexión e inténtalo nuevamente.','bad');
  if(b)b.disabled=false;
  busy=false;
 }
}

function bindConfirm(){
 const b=$('tf120ResetConfirm');
 if(!b||b.dataset.tf121Bound==='1')return;
 b.dataset.tf121Bound='1';
 b.addEventListener('click',performReset,true);
}

async function applyRemote(uid,stamp){
 const key=APPLIED_PREFIX+uid;
 const last=Number(localStorage.getItem(key))||0;
 if(!stamp||stamp<=last)return false;
 localStorage.setItem(key,String(stamp));
 try{
  // Primero reconcilia la cuenta para conservar las tareas/hábitos más recientes.
  try{await syncAccount(uid)}catch(_){}
  // Después elimina únicamente progreso, rachas y fallas en este dispositivo.
  resetLocal(stamp);
  // Publica el mismo estado limpio para impedir que una copia antigua vuelva a imponerse.
  try{await syncAccount(uid)}catch(_){}
  try{await writeRoutineConfig(uid,stamp)}catch(_){}
  tf121FreshReload(450);
  return true;
 }catch(err){
  // Si falla, permite reintentar el mismo evento en la siguiente comprobación.
  localStorage.removeItem(key);
  throw err;
 }
}

async function checkRemote(){
 if(checking||busy)return;
 const u=user();if(!u||!u.uid)return;
 checking=true;
 try{
  const d=await resetDoc(u.uid,'GET');
  const stamp=readResetAt(d);
  await applyRemote(u.uid,stamp);
 }catch(err){
  console.warn('TaskFlow V121 reset check:',err);
 }finally{checking=false}
}

function schedulePoll(){
 if(pollTimer)clearInterval(pollTimer);
 pollTimer=setInterval(checkRemote,4000);
}

function start(){
 bindConfirm();
 new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes&&m.addedNodes.length))requestAnimationFrame(bindConfirm)}).observe(document.body,{subtree:true,childList:true});
 setTimeout(checkRemote,800);
 setTimeout(checkRemote,2400);
 schedulePoll();
 window.addEventListener('focus',checkRemote);
 window.addEventListener('online',checkRemote);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkRemote()});
}

window.TaskFlowV121={checkGlobalReset:checkRemote};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();