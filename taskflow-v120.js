(function(){
'use strict';
if(window.__tfV120)return;window.__tfV120=true;
const MAIN='taskflow_db_v26',BACK='taskflow_db_v26_backup',REC='taskflow_db_v26_recovery',TOUCH='taskflow_cloud_local_touch_v1';
const RESET_PREFIX='taskflow_global_reset_applied_v120_';
const WELCOME_KEY='taskflow_welcome_seen_v13083_release';
function tf120LockWelcomeOff(){
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
function tf120FreshReload(delay){
 tf120LockWelcomeOff();
 setTimeout(()=>{
  try{
   const u=new URL(location.href);
   u.searchParams.set('tfv','13096-'+Date.now());
   location.replace(u.href);
  }catch(_){location.reload()}
 },Math.max(0,delay||0));
}
tf120LockWelcomeOff();
let prevOverflow='',busyReset=false,busyDelete=false,unsubReset=null;
const $=id=>document.getElementById(id);
function style(){if($('tfV120Style'))return;const s=document.createElement('style');s.id='tfV120Style';s.textContent=`
.tf120-overlay{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(2,6,15,.9);backdrop-filter:blur(11px)}.tf120-overlay.open{display:flex}
.tf120-card{width:min(500px,100%);max-height:calc(100dvh - 28px);overflow:auto;border-radius:24px;border:1px solid rgba(78,205,196,.25);background:radial-gradient(circle at 90% 0%,rgba(78,205,196,.08),transparent 32%),linear-gradient(160deg,#121d34,#0a1120 58%,#070c17);box-shadow:0 30px 90px rgba(0,0,0,.65);color:#fff}
.tf120-head{display:grid;grid-template-columns:52px minmax(0,1fr) 42px;gap:12px;align-items:center;padding:17px;border-bottom:1px solid rgba(255,255,255,.06)}.tf120-icon{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-size:24px;border:1px solid rgba(78,205,196,.22);background:rgba(78,205,196,.08);color:#58e4d7}.tf120-head small{display:block;font-size:8px;font-weight:950;letter-spacing:.16em;color:#58e4d7;margin-bottom:4px}.tf120-head h2{font-size:23px;line-height:1.08;margin:0}.tf120-head p{font-size:10px;color:#8f9db3;margin:5px 0 0;line-height:1.4}.tf120-close{width:42px;height:42px;border-radius:13px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#fff;font-size:26px}
.tf120-body{padding:15px 17px 17px}.tf120-zero{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;border-radius:17px;border:1px solid rgba(78,205,196,.18);background:rgba(78,205,196,.055);margin-bottom:10px}.tf120-zero span{font-size:10px;color:#92a1b7}.tf120-zero strong{font-size:25px;color:#5ce5d9}.tf120-box{padding:12px 13px;border-radius:14px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.07);margin-bottom:10px}.tf120-box b{display:block;font-size:11px;margin-bottom:3px}.tf120-box span{display:block;color:#8f9db3;font-size:9px;line-height:1.45}.tf120-keep{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 13px}.tf120-keep div{padding:10px;border-radius:13px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.022);font-size:9px;color:#9ba8ba}.tf120-keep b{display:block;color:#fff;font-size:10px;margin-bottom:2px}
.tf120-action{width:100%;min-height:48px;border-radius:14px;border:1px solid rgba(255,171,88,.28);background:rgba(255,145,61,.10);color:#ffc07f;font-size:12px;font-weight:900}.tf120-action:disabled{opacity:.5}.tf120-status{min-height:17px;margin-top:8px;text-align:center;font-size:9px;color:#91a0b5}.tf120-status.ok{color:#5ce5d9}.tf120-status.bad{color:#ff8795}
#tfDeleteAccountV120{margin-top:8px!important;border-color:rgba(255,76,95,.34)!important;background:rgba(255,65,85,.08)!important;color:#ff8b98!important}.tf120-danger .tf120-icon{border-color:rgba(255,82,100,.28);background:rgba(255,70,90,.09);color:#ff8f9c}.tf120-danger .tf120-head small{color:#ff8f9c}.tf120-warning{padding:12px 13px;border-radius:14px;border:1px solid rgba(255,82,100,.20);background:rgba(255,70,90,.055);font-size:9px;line-height:1.5;color:#aeb8c8;margin-bottom:10px}.tf120-warning strong{color:#fff}.tf120-field{display:grid;gap:5px;margin-top:9px}.tf120-field label{font-size:8px;font-weight:850;letter-spacing:.07em;color:#9ba8ba;text-transform:uppercase}.tf120-field input{width:100%;height:44px;border-radius:13px;border:1px solid rgba(255,255,255,.09);background:#0b1424;color:#fff;padding:0 12px;outline:none;font-size:11px}.tf120-delete{width:100%;min-height:48px;margin-top:12px;border-radius:14px;border:1px solid rgba(255,82,100,.32);background:rgba(255,65,85,.11);color:#ff9ca7;font-size:12px;font-weight:950}.tf120-delete:disabled{opacity:.42}
@media(max-width:430px){.tf120-overlay{padding:9px}.tf120-head{grid-template-columns:46px minmax(0,1fr) 38px;padding:14px;gap:9px}.tf120-icon{width:46px;height:46px}.tf120-close{width:38px;height:38px}.tf120-head h2{font-size:21px}.tf120-body{padding:13px 14px 15px}.tf120-keep{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function currentUser(){try{return window.firebase&&window.firebase.auth?window.firebase.auth().currentUser:null}catch(_){return null}}
async function ensureFirebase(){if(window.TaskFlowFirebase&&window.TaskFlowFirebase.initialize)await window.TaskFlowFirebase.initialize();let n=0;while(!(window.firebase&&window.firebase.auth)&&n<40){await new Promise(r=>setTimeout(r,100));n++}if(!(window.firebase&&window.firebase.auth))throw new Error('AUTH_UNAVAILABLE');if(!(window.firebase.firestore)){await new Promise((resolve,reject)=>{const src='https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore-compat.js';if([...document.scripts].some(s=>s.src===src))return resolve();const e=document.createElement('script');e.src=src;e.onload=resolve;e.onerror=reject;document.head.appendChild(e)})}return window.firebase.firestore()}
function gt(){const p={};new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value});const y=+p.year,m=+p.month,d=+p.day,h=+p.hour||0,dm=`${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;const q=new Date(Date.UTC(y,m-1,d,12));if(h<1)q.setUTCDate(q.getUTCDate()-1);const iso=`${q.getUTCFullYear()}-${String(q.getUTCMonth()+1).padStart(2,'0')}-${String(q.getUTCDate()).padStart(2,'0')}`;return{dm,iso,key:iso+'-GT-01'}}
function tf120KeyName(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'')}
function tf120ProtectedUserBranch(key){const n=tf120KeyName(key);return /^(TASKS?|TAREAS?|HABITS?|HABITOS?|AVITOS?)$/.test(n)}
function tf120ProgressKey(key){
 const n=tf120KeyName(key);
 if(!n)return false;
 return /(XP|EXPERIENCE|EXPERIENCIA|POINTS?|PUNTOS?|LEVEL|NIVEL|RANK|RANGO|STREAK|RACHA|PROGRESS|PROGRESO|SCORE|PUNTAJE|CONSECUTIVE|CONSECUTIVO|SUCCESS|EXITO|FAIL|FAILURE|FALLA|PENALTY|PENALIZACION|PUNISH|CASTIGO|PERFECT|COMPLETED|COMPLETE|DONE|FINISHED|CLAIMED|REDEEMED|HISTORY|HISTORIAL|DISCIPLINE|DISCIPLINA|GOOD.*DAY|BAD.*DAY|DAY.*GOOD|DAY.*BAD|DIA.*BUEN|DIA.*MAL|TOKEN|COIN|MONEDA|CURRENCY|BALANCE|SALDO|SAVING|AHORRO)/.test(n);
}
function tf120ZeroProgress(value,key){
 if(tf120ProtectedUserBranch(key))return value;
 if(tf120ProgressKey(key)){
   if(typeof value==='number')return 0;
   if(typeof value==='boolean')return false;
   if(typeof value==='string')return /^-?\d+(?:\.\d+)?$/.test(value.trim())?'0':'';
   if(Array.isArray(value))return [];
   if(value&&typeof value==='object')return {};
   return null;
 }
 if(Array.isArray(value))return value.map(v=>v&&typeof v==='object'?tf120ZeroProgress(v,''):v);
 if(value&&typeof value==='object'){
   const out={};
   Object.keys(value).forEach(k=>{out[k]=tf120ZeroProgress(value[k],k)});
   return out;
 }
 return value;
}
function tf120ClearAuxProgress(){
 const preserve=/sound|audio|music|firebase|auth|profile|cloud_bound|cloud_sync_meta|routines_v115|routines_v115_meta|mentalista_user_choice|mentalista_enabled_guard/i;
 const personal=/task|tarea|habit|habito|avito/i;
 const progress=/progress|streak|racha|xp|experience|experiencia|points?|puntos?|level|nivel|rank|rango|score|puntaje|success|exito|fail|falla|penalty|castigo|perfect|completed|complete|done|finished|history|historial|discipline|disciplina|good.*day|bad.*day|dia.*buen|dia.*mal|token|coin|moneda|saldo|saving|ahorro/i;
 const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k)keys.push(k)}
 keys.forEach(k=>{
   if(!k.startsWith('taskflow_')||k===MAIN||k===BACK||k===REC||k===TOUCH)return;
   if(preserve.test(k)||personal.test(k)||k.startsWith(RESET_PREFIX))return;
   if(progress.test(k)){try{localStorage.removeItem(k)}catch(_){}}
 });
}
function resetLocal(stamp){
 const a=[MAIN,REC,BACK].map(k=>{try{const r=localStorage.getItem(k),d=r?JSON.parse(r):null;return d&&typeof d==='object'&&!Array.isArray(d)?{d,t:Number(d.savedAt)||0}:null}catch(_){return null}}).filter(Boolean);
 if(!a.length)throw new Error('NO_STATE');
 a.sort((x,y)=>y.t-x.t);
 let d=tf120ZeroProgress(a[0].d,'');
 if(!d.meta||typeof d.meta!=='object'||Array.isArray(d.meta))d.meta={};
 const m=d.meta,g=gt();
 m.habitStreakCurrent=0;m.habitStreakBest=0;m.taskStreakCurrent=0;m.taskStreakBest=0;m.unifiedStreakCurrent=0;m.unifiedStreakBest=0;
 m.lastUnifiedSuccessDate=null;m.dailyPenaltyTokens={};m.v32PerfectDayLog={};m.incomeMissionPenaltyTokens={};
 m.punishmentActive=false;m.punishmentReason='';m.punishmentCompleted=false;m.punishmentTarget=null;
 m.lastPunishmentCycleKey=g.key;m.lastHabitCycleKey=g.key;m.lastTaskProcessingDate=g.dm;m.v32ShopPerfectProcessed=g.iso;
 d.savedAt=Math.max(Date.now(),Number(stamp)||0);
 const raw=JSON.stringify(d);
 localStorage.setItem(MAIN,raw);localStorage.setItem(BACK,raw);localStorage.setItem(REC,raw);localStorage.setItem(TOUCH,String(d.savedAt));
 tf120ClearAuxProgress();
 return d.savedAt;
}
function removeOld(){const o=$('tfResetModalV117');if(o)o.remove()}
function buildReset(){removeOld();if($('tfResetModalV120'))return;const o=document.createElement('div');o.id='tfResetModalV120';o.className='tf120-overlay';o.innerHTML=`<section class="tf120-card"><header class="tf120-head"><div class="tf120-icon"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3v6h-6M20 9a8.5 8.5 0 1 0-2.2 9.6"/><path d="M12 6v6l4 2"/></svg></div><div><small>REINICIO DE SISTEMA</small><h2>Volver a 0 días</h2><p>Reinicia todo el progreso, XP, rachas y días buenos o malos.</p></div><button class="tf120-close" type="button">×</button></header><div class="tf120-body"><div class="tf120-zero"><span class="tf120-zero-leading"><svg viewBox="0 0 24 24" width="31" height="31" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22V4m0 1c4-3 8 3 14 0v11c-6 3-10-3-14 0"/></svg></span><div class="tf120-zero-copy"><span>Nuevo punto de inicio</span><small>Tu progreso comenzará desde cero.</small></div><strong>0 días</strong></div><div class="tf120-box"><b id="tf120ScopeTitle">Reinicio del dispositivo</b><span id="tf120ScopeText"></span></div><div class="tf120-keep"><div><b>Se conserva</b>Música, hábitos y tareas personales</div><div><b>Se elimina</b>XP, rachas, días buenos/malos y progreso</div></div><button class="tf120-action" id="tf120ResetConfirm" type="button"><span class="tf120-cta-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 5v6h-6"/><path d="M20 11a8.5 8.5 0 1 0-1.8 6.6"/></svg></span><span class="tf120-cta-label">Reiniciar progreso</span><span class="tf120-cta-end" aria-hidden="true"></span></button><div id="tf120ResetStatus" class="tf120-status"></div></div></section>`;document.body.appendChild(o);o.querySelector('.tf120-close').onclick=closeReset;o.onclick=e=>{if(e.target===o)closeReset()};$('tf120ResetConfirm').onclick=doReset}
function openReset(){buildReset();const o=$('tfResetModalV120'),u=currentUser(),t=$('tf120ScopeTitle'),x=$('tf120ScopeText'),b=$('tf120ResetConfirm');if(u){t.textContent='Reinicio de toda la cuenta';x.textContent='El cambio se aplicará automáticamente a todos los dispositivos donde uses esta misma cuenta.';b.querySelector('.tf120-cta-label').textContent='Reiniciar cuenta en todos los dispositivos'}else{t.textContent='Reinicio de este dispositivo';x.textContent='No hay una cuenta iniciada. Solo se reiniciará el progreso guardado en este dispositivo.';b.querySelector('.tf120-cta-label').textContent='Reiniciar este dispositivo'}$('tf120ResetStatus').textContent='';prevOverflow=document.body.style.overflow||'';document.body.style.overflow='hidden';o.classList.add('open')}
function closeReset(){if(busyReset)return;const o=$('tfResetModalV120');if(o)o.classList.remove('open');document.body.style.overflow=prevOverflow}
async function doReset(){if(busyReset)return;busyReset=true;const b=$('tf120ResetConfirm'),s=$('tf120ResetStatus');b.disabled=true;try{const u=currentUser(),stamp=Date.now();if(u){const db=await ensureFirebase();await db.doc('users/'+u.uid+'/control/resetState').set({resetAt:stamp,version:120},{merge:true});localStorage.setItem(RESET_PREFIX+u.uid,String(stamp))}resetLocal(stamp);if(u&&window.TaskFlowCloudSync&&window.TaskFlowCloudSync.syncNow){const ok=await window.TaskFlowCloudSync.syncNow();if(ok===false)throw new Error('SYNC')}s.textContent=u?'Cuenta reiniciada. El cambio se enviará a todos tus dispositivos.':'Dispositivo reiniciado.';s.className='tf120-status ok';tf120FreshReload(650)}catch(e){s.textContent='No se pudo completar el reinicio. Revisa tu conexión e inténtalo otra vez.';s.className='tf120-status bad';b.disabled=false;busyReset=false}}
async function applyRemoteReset(stamp,u){const k=RESET_PREFIX+u.uid,last=Number(localStorage.getItem(k))||0;if(!stamp||stamp<=last)return;localStorage.setItem(k,String(stamp));resetLocal(stamp);if(window.TaskFlowCloudSync&&window.TaskFlowCloudSync.syncNow)await window.TaskFlowCloudSync.syncNow();tf120FreshReload(350)}
async function watchReset(){try{const db=await ensureFirebase();window.firebase.auth().onAuthStateChanged(u=>{if(unsubReset){try{unsubReset()}catch(_){}unsubReset=null}if(!u)return;unsubReset=db.doc('users/'+u.uid+'/control/resetState').onSnapshot(d=>{if(!d.exists)return;applyRemoteReset(Number(d.data().resetAt)||0,u).catch(()=>{})},()=>{})})}catch(_){}}
function buildDelete(){if($('tfDeleteModalV120'))return;const o=document.createElement('div');o.id='tfDeleteModalV120';o.className='tf120-overlay tf120-danger';o.innerHTML=`<section class="tf120-card"><header class="tf120-head"><div class="tf120-icon"><svg viewBox="0 0 24 24" width="29" height="29" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg></div><div><small>ELIMINACIÓN DEFINITIVA</small><h2>Eliminar cuenta</h2><p>Esta acción no se puede deshacer.</p></div><button class="tf120-close" type="button">×</button></header><div class="tf120-body"><div class="tf120-warning"><strong>La cuenta y todos sus datos se eliminarán permanentemente.</strong><br>No habrá forma de recuperar el progreso ni la información sincronizada en ninguno de tus dispositivos.</div><div class="tf120-field"><label for="tf120DeletePassword">Contraseña actual</label><p class="tf120-field-help">Escribe tu contraseña para confirmar que eres el propietario de la cuenta.</p><div class="tf120-field-shell"><span class="tf120-field-icon"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span><input id="tf120DeletePassword" type="password" autocomplete="current-password" placeholder="Escribe tu contraseña"><button type="button" id="tf120DeleteTogglePassword" class="tf120-field-toggle" aria-label="Mostrar contraseña"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18M9 5.4A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7s-.9 1.9-2.7 3.6M15 18.5a11 11 0 0 1-3 .5c-5.5 0-9-7-9-7s.7-1.5 2-3"/></svg></button></div></div><div class="tf120-field"><label for="tf120DeleteWord">Confirmación</label><p class="tf120-field-help">Escribe la palabra ELIMINAR para confirmar esta acción.</p><div class="tf120-field-shell"><span class="tf120-field-icon"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 20 4-.8L20 7.1l-3.1-3.1L4.8 16.1 4 20Z"/><path d="m14.9 6 3.1 3.1"/></svg></span><input id="tf120DeleteWord" type="text" autocomplete="off" placeholder="Escribe ELIMINAR"></div></div><button id="tf120DeleteConfirm" class="tf120-delete" type="button" disabled>Eliminar cuenta definitivamente</button><div id="tf120DeleteStatus" class="tf120-status"></div></div></section>`;document.body.appendChild(o);o.querySelector('.tf120-close').onclick=closeDelete;o.onclick=e=>{if(e.target===o)closeDelete()};const p=$('tf120DeletePassword'),w=$('tf120DeleteWord'),b=$('tf120DeleteConfirm'),v=()=>b.disabled=busyDelete||!p.value||w.value.trim().toUpperCase()!=='ELIMINAR';p.oninput=v;w.oninput=v;b.onclick=doDelete;const toggle=$('tf120DeleteTogglePassword');if(toggle){const hidden="<svg viewBox=\"0 0 24 24\" width=\"23\" height=\"23\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 3l18 18M9 5.4A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7s-.9 1.9-2.7 3.6M15 18.5a11 11 0 0 1-3 .5c-5.5 0-9-7-9-7s.7-1.5 2-3\"/></svg>",visible="<svg viewBox=\"0 0 24 24\" width=\"23\" height=\"23\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z\"/><circle cx=\"12\" cy=\"12\" r=\"3.4\"/></svg>";const update=()=>{const show=p.type==='text';toggle.innerHTML=show?visible:hidden;toggle.setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');toggle.setAttribute('aria-pressed',show?'true':'false');toggle.setAttribute('title',show?'Contraseña visible':'Contraseña oculta');toggle.classList.toggle('is-visible',show)};toggle.onclick=()=>{p.type=p.type==='password'?'text':'password';update()};update()}}
function openDelete(){buildDelete();$('tf120DeletePassword').value='';$('tf120DeleteWord').value='';$('tf120DeleteConfirm').disabled=true;$('tf120DeleteStatus').textContent='';prevOverflow=document.body.style.overflow||'';document.body.style.overflow='hidden';$('tfDeleteModalV120').classList.add('open')}
function closeDelete(){if(busyDelete)return;const o=$('tfDeleteModalV120');if(o)o.classList.remove('open');document.body.style.overflow=prevOverflow}
async function deleteDocs(col){const snap=await col.get();for(const d of snap.docs){const sub=await d.ref.collection('chunks').get().catch(()=>null);if(sub)for(const c of sub.docs)await c.ref.delete();await d.ref.delete()}}
async function removeCloudData(db,uid){for(const slot of ['a','b'])await deleteDocs(db.collection('users/'+uid+'/syncSlots/'+slot+'/keys'));for(const p of ['users/'+uid+'/sync/manifest','users/'+uid+'/settings/routinesV115','users/'+uid+'/profile/avatar','users/'+uid+'/control/resetState','users/'+uid])await db.doc(p).delete().catch(()=>{})}
function wipeLocal(){try{const a=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('taskflow_')===0)a.push(k)}a.forEach(k=>localStorage.removeItem(k))}catch(_){}try{sessionStorage.clear()}catch(_){}}
async function doDelete(){if(busyDelete)return;busyDelete=true;const b=$('tf120DeleteConfirm'),s=$('tf120DeleteStatus'),pass=$('tf120DeletePassword').value;b.disabled=true;try{const db=await ensureFirebase(),u=currentUser();if(!u||!u.email)throw new Error('NO_USER');s.textContent='Verificando identidad…';const cred=window.firebase.auth.EmailAuthProvider.credential(u.email,pass);await u.reauthenticateWithCredential(cred);s.textContent='Eliminando datos de la cuenta…';await removeCloudData(db,u.uid);s.textContent='Eliminando cuenta…';await u.delete();wipeLocal();s.textContent='Cuenta eliminada definitivamente.';s.className='tf120-status ok';setTimeout(()=>location.reload(),900)}catch(e){const m=String(e&&e.code||e&&e.message||'');s.textContent=/wrong-password|invalid-credential|INVALID_PASSWORD/i.test(m)?'La contraseña es incorrecta.':'No se pudo eliminar la cuenta. Verifica tu conexión y vuelve a intentarlo.';s.className='tf120-status bad';busyDelete=false;b.disabled=false}}
function mount(){const box=$('tfProfileUserBox');if(!box)return;removeOld();let r=$('tfSystemResetV117');if(r){r.onclick=openReset;r.textContent='Reinicio de sistema'}else{r=document.createElement('button');r.id='tfSystemResetV117';r.type='button';r.className='tf-profile-action';r.textContent='Reinicio de sistema';r.onclick=openReset;box.appendChild(r)}let d=$('tfDeleteAccountV120');if(!d){d=document.createElement('button');d.id='tfDeleteAccountV120';d.type='button';d.className='tf-profile-action danger';d.textContent='Eliminar cuenta';d.onclick=openDelete;const sign=$('tfProfileSignOut');sign&&sign.parentElement===box?box.insertBefore(d,sign):box.appendChild(d)}}
function start(){style();buildReset();buildDelete();mount();new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes&&m.addedNodes.length))requestAnimationFrame(mount)}).observe(document.body,{subtree:true,childList:true});watchReset()}
window.TaskFlowV120={openReset,openDelete};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();