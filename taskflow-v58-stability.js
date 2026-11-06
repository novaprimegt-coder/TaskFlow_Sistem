/* TaskFlow V58: proteccion del cambio diario, salida publicitaria y acceso al pago actual.
   Se ejecuta despues de los modulos originales. No borra tareas, habitos, progreso ni preferencias. */
(function(){
'use strict';
if(window.__taskflowStabilityV58)return;
window.__taskflowStabilityV58=true;
const ROUTINES='taskflow_routines_v115';
const ROUTINE_META='taskflow_routines_v115_meta';
const SNAP_PREFIX='taskflow_v58_routines_snapshot_';
const RESET_PREFIX='taskflow_v58_profile_reset_requested_';
const NAV_KEY='taskflow_v58_ad_external_return';
const ROUTINE_IDS=['sung','juridico','socrates','maquiavelo','mentalista','budget503020'];
const AD_SELECTOR='.tf50-ad-slot a[href],#tf56EntryStage a[href],#tf57TouchStage a[href]';
let activeUid='',lastUserAction=0,lastDay='',rolloverBackup=null,rolloverUntil=0,restoring=false;

function get(key){try{return localStorage.getItem(key)}catch(_){return null}}
function put(key,value){try{localStorage.setItem(key,String(value));return true}catch(_){return false}}
function uid(){
 try{const u=window.TaskFlowFirebase&&window.TaskFlowFirebase.getUser&&window.TaskFlowFirebase.getUser();return u&&u.uid?'user_'+u.uid:'guest'}catch(_){return 'guest'}
}
function day(){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const p={};for(const x of parts)if(x.type!=='literal')p[x.type]=x.value;
 return p.year+'-'+p.month+'-'+p.day;
}
function readRoutineConfig(){
 try{const c=JSON.parse(get(ROUTINES)||'null');return c&&typeof c==='object'&&!Array.isArray(c)?c:null}catch(_){return null}
}
function anyActive(cfg){return !!(cfg&&ROUTINE_IDS.some(id=>cfg[id]===true))}
function resetStamp(account){
 let stamp=Number(get(RESET_PREFIX+account))||0;
 if(account==='guest')return stamp;
 const suffix=account.slice(5);
 for(const prefix of ['taskflow_global_reset_applied_v120_','taskflow_global_reset_applied_v121_','tf_profile_manual_reset_seen_v1_']){
  stamp=Math.max(stamp,Number(get(prefix+suffix))||0);
 }
 return stamp;
}
function snapshotKey(account){return SNAP_PREFIX+account}
function loadSnapshot(account){
 try{const x=JSON.parse(get(snapshotKey(account))||'null');return x&&typeof x==='object'&&x.cfg&&typeof x.cfg==='object'?x:null}catch(_){return null}
}
function saveSnapshot(account,cfg,today){
 if(!cfg)return;
 put(snapshotKey(account),JSON.stringify({day:today,cfg:cfg,resetAt:resetStamp(account),at:Date.now()}));
}
function refreshRoutines(){
 try{window.TaskFlowV117&&window.TaskFlowV117.refresh&&window.TaskFlowV117.refresh()}catch(_){}
 try{window.TaskFlowV119&&window.TaskFlowV119.refresh&&window.TaskFlowV119.refresh()}catch(_){}
}
function keepRoutines(){
 if(restoring)return;
 const account=uid(),today=day(),config=readRoutineConfig(),marker=resetStamp(account),old=loadSnapshot(account);
 if(account!==activeUid){activeUid=account;lastDay=today;rolloverBackup=null;rolloverUntil=0}
 if(!config){if(!old)return}
 if(!old){if(config)saveSnapshot(account,config,today);return}
 if(marker>Number(old.resetAt||0)){
  rolloverBackup=null;rolloverUntil=0;
  if(config)saveSnapshot(account,config,today);
  return;
 }
 if(old.day!==today){
  rolloverBackup=old.cfg;rolloverUntil=Date.now()+120000;
  if(!config||(!anyActive(config)&&anyActive(old.cfg))){
   if(Date.now()-lastUserAction>15000){
    restoring=true;
    try{put(ROUTINES,JSON.stringify(old.cfg));put(ROUTINE_META,String(Date.now()));refreshRoutines()}finally{restoring=false}
    saveSnapshot(account,old.cfg,today);lastDay=today;return;
   }
  }
  if(config)saveSnapshot(account,config,today);
  lastDay=today;return;
 }
 if(rolloverBackup&&Date.now()<rolloverUntil&&anyActive(rolloverBackup)&&(!config||!anyActive(config))&&Date.now()-lastUserAction>15000){
  restoring=true;
  try{put(ROUTINES,JSON.stringify(rolloverBackup));put(ROUTINE_META,String(Date.now()));refreshRoutines()}finally{restoring=false}
  saveSnapshot(account,rolloverBackup,today);return;
 }
 if(Date.now()>=rolloverUntil){rolloverBackup=null;rolloverUntil=0}
 if(config&&JSON.stringify(old.cfg)!==JSON.stringify(config))saveSnapshot(account,config,today);
 lastDay=today;
}
function fitNoAdsAction(){
 const list=document.querySelectorAll('#btnNoAds,#qaNoAds,a[href="#tfNoAds"],a[href="http://action_noads"]');
 for(const el of list){
  if(el.getAttribute('href')==='http://action_noads')el.setAttribute('href','#tfNoAds');
  el.setAttribute('aria-label','Sin anuncios · suscripción PayPal de US$6 al mes');
  const iter=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  let n;
  while((n=iter.nextNode())){
   const t=n.nodeValue||'';
   if(/Eliminar anuncios/i.test(t))n.nodeValue=t.replace(/Eliminar anuncios/ig,'Sin anuncios · US$6/mes');
  }
 }
}
function captureAdReturn(){
 const state={url:location.pathname,at:Date.now(),x:scrollX||0,y:scrollY||0,scroll:[]};
 for(const el of document.querySelectorAll('.window-container.open,.side-menu.open,.policy-page.open,.tf119-modal.open,.tf120-overlay.open')){
  if(!el.id)continue;
  state.scroll.push({id:el.id,top:el.scrollTop,left:el.scrollLeft});
 }
 try{sessionStorage.setItem(NAV_KEY,JSON.stringify(state))}catch(_){}
}
function restoreAdReturn(){
 let state=null;
 try{state=JSON.parse(sessionStorage.getItem(NAV_KEY)||'null')}catch(_){}
 if(!state||state.url!==location.pathname||Date.now()-Number(state.at)>20*60*1000)return;
 const restore=()=>{
  try{window.scrollTo(state.x||0,state.y||0)}catch(_){}
  for(const item of state.scroll||[]){
   const e=document.getElementById(item.id);
   if(e&&e.classList.contains('open')){e.scrollTop=item.top||0;e.scrollLeft=item.left||0}
  }
 };
 setTimeout(restore,120);
 setTimeout(restore,750);
 try{sessionStorage.removeItem(NAV_KEY)}catch(_){}
}
function adClick(event){
 const link=event.target&&event.target.closest&&event.target.closest(AD_SELECTOR);
 if(!link)return;
 let u;try{u=new URL(link.href,location.href)}catch(_){return}
 if(u.protocol!=='https:')return;
 // Nunca cambiar la ventana de TaskFlow: el enlace conserva destino externo.
 link.target='_blank';
 link.rel='noopener noreferrer sponsored';
 link.referrerPolicy='no-referrer';
 captureAdReturn();
 // En WebViews que dispongan de un navegador externo nativo, abrirlo sin sustituir TaskFlow.
 try{const external=window.cordova&&window.cordova.InAppBrowser;
  if(external&&typeof external.open==='function'){
   external.open(u.href,'_system','location=yes');event.preventDefault();return;
  }
 }catch(_){/* La apertura normal en otra pestaña permanece disponible. */}
}
function actionClick(event){
 const target=event.target;
 if(!target||!target.closest)return;
 if(target.closest('#tf120ResetConfirm,#tf113ConfirmReset,#tf115ConfirmReset,#tf117ConfirmReset')){
  put(RESET_PREFIX+uid(),String(Date.now()));
  rolloverBackup=null;rolloverUntil=0;lastUserAction=Date.now();
  return;
 }
 if(target.closest('#tfManagerV117,#tfManagerV115,#tfManagerV113,#tf119AllOn,#tf119AllOff,#tf117AllOn,#tf117AllOff,#tf115AllOn,#tf115AllOff,#tf113AllOn,#tf113AllOff')){
  lastUserAction=Date.now();
 }
 adClick(event);
}
function start(){
 activeUid=uid();lastDay=day();
 keepRoutines();fitNoAdsAction();restoreAdReturn();
 document.addEventListener('click',actionClick,true);
 document.addEventListener('change',event=>{
  if(event.target&&event.target.closest&&event.target.closest('#tfManagerV117,#tfManagerV115,#tfManagerV113'))lastUserAction=Date.now();
 },true);
 window.addEventListener('pageshow',()=>{restoreAdReturn();keepRoutines();fitNoAdsAction()},{passive:true});
 window.addEventListener('focus',()=>{keepRoutines();fitNoAdsAction()},{passive:true});
 document.addEventListener('taskflow:account-state-updated',keepRoutines,false);
 setInterval(keepRoutines,2000);
 let queued=false;
 const observer=new MutationObserver(records=>{
  if(queued)return;
  if(!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.matches&&(n.matches('#btnNoAds,#qaNoAds,[href="#tfNoAds"],[href="http://action_noads"]')||n.querySelector('#btnNoAds,#qaNoAds,[href="#tfNoAds"],[href="http://action_noads"]')))))return;
  queued=true;requestAnimationFrame(()=>{queued=false;fitNoAdsAction()});
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();