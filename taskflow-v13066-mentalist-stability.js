(function(){
'use strict';
if(window.__tfV13066MentalistStability)return;
window.__tfV13066MentalistStability=true;

/* V130.6.7 · Corrección localizada de rutinas.
   SOLO corrige:
   - Mentalista: progreso/completado del panel y tarjeta principal.
   - Mentalista: desaparición no solicitada.
   - Mentalista: parpadeos producidos por capas antiguas al abrir.
   - Rutinas completadas: conserva visibles sus iconos de misión.
   No modifica audio, búsqueda, perfil, tareas, hábitos ni sincronización. */

const CFG='taskflow_routines_v115';
const META='taskflow_routines_v115_meta';
const USER='taskflow_v13041_mentalista_user_choice';
const GUARD='taskflow_v13066_mentalista_enabled_guard';
const PROGRESS='taskflow_v13066_mentalista_progress';
const CARD_ID='tfMentalistPairV117';
const PAIR_ID='tfPairV117';
const SOURCE='#v94MentalistRoutine .v94-mentalist-launch';
const STYLE_ID='tfV13066MentalistStabilityStyle';

const originalSetItem=Storage.prototype.setItem;
let allowMentalOffUntil=0;
let repairQueued=false;
let launchArmTimer=0;

function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim()}
function getLS(key){try{return localStorage.getItem(key)}catch(_){return null}}
function setLSRaw(key,value){try{return originalSetItem.call(localStorage,key,String(value))}catch(_){return false}}
function removeLS(key){try{localStorage.removeItem(key)}catch(_){}}
function parseCfg(raw){try{const c=JSON.parse(raw||'{}');return c&&typeof c==='object'&&!Array.isArray(c)?c:{}}catch(_){return {}}}
function readCfg(){return parseCfg(getLS(CFG))}
function explicitOff(){return getLS(USER)==='off'}
function protectedMental(){return getLS(GUARD)==='1'&&!explicitOff()}
function currentDayKey(){
  const d=new Date(Date.now()-60*60*1000);
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* Estado completado: conservar el diseño nativo de cada rutina.
   Solo impedimos que el icono existente sea ocultado al completar una misión. */
#windowContainer .v96-mentalist-scroll .tf13066-completed-mission .tf13066-task-icon,
#windowContainer .v97-routine-scroll .tf13066-completed-mission .tf13066-task-icon{
  display:flex!important;
  opacity:1!important;
  visibility:visible!important;
}
#windowContainer .v96-mentalist-scroll .tf13066-completed-mission .tf13066-task-icon svg,
#windowContainer .v97-routine-scroll .tf13066-completed-mission .tf13066-task-icon svg,
#windowContainer .v96-mentalist-scroll .tf13066-completed-mission .tf13066-task-icon i,
#windowContainer .v97-routine-scroll .tf13066-completed-mission .tf13066-task-icon i{
  display:block!important;
  opacity:1!important;
  visibility:visible!important;
}
/* Mentalista conserva el estilo original: sin etiqueta, color ni borde artificial. */
#${CARD_ID}.tf13066-complete .v94-mentalist-copy::after{content:none!important;display:none!important}
#${CARD_ID}.tf13066-launch-armed{transform:none!important}`;
  document.head.appendChild(s);
}

function isMentalManagerInput(input){
  if(!input||input.tagName!=='INPUT'||input.type!=='checkbox')return false;
  const row=input.closest&&input.closest('.tf119-row,.tf117-row');
  return !!(row&&norm(row.textContent).includes('MENTALISTA'));
}

/* Impide que una capa interna vuelva a desactivar Mentalista si el usuario la dejó activa.
   Una desactivación manual desde MEJORAR sí se respeta. */
Storage.prototype.setItem=function(key,value){
  if(this===localStorage&&key===CFG&&protectedMental()&&Date.now()>allowMentalOffUntil){
    const next=parseCfg(value);
    if(next.mentalista===false){next.mentalista=true;value=JSON.stringify(next)}
  }
  return originalSetItem.call(this,key,value);
};

function rememberVisibleChoice(){
  const c=readCfg();
  if(c.mentalista===true&&!explicitOff())setLSRaw(GUARD,'1');
}
function writeMentalTrue(){
  const c=readCfg();
  if(c.mentalista===true)return false;
  c.mentalista=true;
  setLSRaw(CFG,JSON.stringify(c));
  setLSRaw(META,String(Date.now()));
  return true;
}
function refreshRoutines(){
  try{window.TaskFlowV117&&window.TaskFlowV117.refresh&&window.TaskFlowV117.refresh()}catch(_){}
  try{window.TaskFlowV119&&window.TaskFlowV119.refresh&&window.TaskFlowV119.refresh()}catch(_){}
}
function revealMentalDom(){
  const card=document.getElementById(CARD_ID);
  const pair=document.getElementById(PAIR_ID);
  if(card){
    card.hidden=false;
    card.removeAttribute('hidden');
    card.removeAttribute('aria-hidden');
    card.classList.remove('tf117-off','tf119-off','tf115-hidden','hidden');
    ['display','visibility','opacity','height','min-height','max-height'].forEach(p=>{try{card.style.removeProperty(p)}catch(_){}});
  }
  if(pair){
    const c=readCfg();
    pair.classList.remove('tf119-empty','tf118-empty');
    const single=!c.budget503020;
    pair.classList.toggle('tf117-single',single);
    pair.classList.toggle('tf119-single',single);
    pair.classList.toggle('tf118-single',single);
    ['display','visibility','opacity','height','min-height','max-height'].forEach(p=>{try{pair.style.removeProperty(p)}catch(_){}});
  }
}
function repairMentalVisibility(){
  repairQueued=false;
  rememberVisibleChoice();
  if(!protectedMental())return;
  const changed=writeMentalTrue();
  let card=document.getElementById(CARD_ID);
  if(changed||!card){
    refreshRoutines();
    card=document.getElementById(CARD_ID);
  }
  revealMentalDom();
  applyCachedMentalProgress();
}
function scheduleRepair(){
  if(repairQueued)return;
  repairQueued=true;
  requestAnimationFrame(()=>{
    repairMentalVisibility();
    setTimeout(repairMentalVisibility,90);
    setTimeout(repairMentalVisibility,260);
  });
}

/* El guard V130.3 reconoce .v94-mentalist-launch como lanzamiento de rutina.
   La tarjeta clonada no tenía esa clase, por eso varias capas antiguas recalculaban la ventana
   durante la apertura y producían los tres parpadeos. Se añade solo durante el gesto de apertura. */
function armMentalLaunch(target){
  const card=target&&target.closest?target.closest('#'+CARD_ID):null;
  if(!card)return;
  clearTimeout(launchArmTimer);
  card.classList.add('v94-mentalist-launch','tf13066-launch-armed');
  launchArmTimer=setTimeout(()=>card.classList.remove('v94-mentalist-launch','tf13066-launch-armed'),900);
}
function disarmMentalLaunch(){
  clearTimeout(launchArmTimer);
  const card=document.getElementById(CARD_ID);
  if(card)card.classList.remove('v94-mentalist-launch','tf13066-launch-armed');
}

function progressFromText(text){
  const m=String(text||'').match(/(\d+)\s*\/\s*(\d+)/);
  if(!m)return null;
  const done=Number(m[1]),total=Number(m[2]);
  if(!Number.isFinite(done)||!Number.isFinite(total)||total<=0)return null;
  return {done:Math.max(0,Math.min(done,total)),total};
}
function candidateRow(marker,root){
  if(!marker||!root)return null;
  const sel='article,li,[class*="mission"],[class*="test"],[class*="task"],[class*="item"],[class*="entry"],[class*="card"],[class*="row"]';
  let row=marker.closest&&marker.closest(sel);
  if(row===marker&&marker.parentElement)row=marker.parentElement.closest(sel)||marker.parentElement;
  if(!row||row===root||!root.contains(row))return null;
  return row;
}
function completedRows(root){
  if(!root)return [];
  const rows=new Set();
  const markers=[...root.querySelectorAll('input[type="checkbox"]:checked,[aria-checked="true"],[data-completed="true"],[data-done="true"],.completed,.is-complete,.is-completed,.is-done,.done')];
  root.querySelectorAll('button,[role="button"]').forEach(btn=>{
    const t=norm(btn.textContent);
    if(t==='✓'||t==='✔'||t==='COMPLETADA'||t==='COMPLETADO'||t==='COMPLETA')markers.push(btn);
  });
  for(const marker of markers){
    const row=candidateRow(marker,root);
    if(row)rows.add(row);
  }
  return [...rows];
}
function findTaskIcon(row){
  if(!row)return null;
  const candidates=[...row.querySelectorAll('[class*="icon"]')].filter(el=>{
    if(el.closest('.window-close,.v85-routine-modal-head,[class*="guide"],[class*="help"]'))return false;
    const r=el.getBoundingClientRect();
    return (!r.width&&!r.height)||(r.width>=22&&r.width<=90&&r.height>=22&&r.height<=90);
  });
  return candidates[0]||null;
}
function preserveCompletedIcons(){
  document.querySelectorAll('.v96-mentalist-scroll,.v97-routine-scroll').forEach(root=>{
    for(const row of completedRows(root)){
      row.classList.add('tf13066-completed-mission');
      const icon=findTaskIcon(row);
      if(icon)icon.classList.add('tf13066-task-icon');
    }
  });
}

function readCachedProgress(){
  try{
    const x=JSON.parse(getLS(PROGRESS)||'{}');
    if(x&&x.day===currentDayKey()&&Number.isFinite(Number(x.done))&&Number.isFinite(Number(x.total))&&Number(x.total)>0){
      return {done:Number(x.done),total:Number(x.total)};
    }
  }catch(_){}
  return null;
}
function writeCachedProgress(done,total){
  if(!Number.isFinite(done)||!Number.isFinite(total)||total<=0)return;
  setLSRaw(PROGRESS,JSON.stringify({day:currentDayKey(),done:Math.max(0,Math.min(done,total)),total,at:Date.now()}));
}
function setBarProgress(root,done,total){
  if(!root)return;
  const percent=Math.max(0,Math.min(100,total?done/total*100:0));
  const bar=root.querySelector('.v94-mentalist-bar');
  if(!bar)return;
  const fill=[...bar.children].find(el=>{
    const cls=String(el.className||'').toLowerCase();
    return /fill|progress|value|inner/.test(cls);
  })||bar.firstElementChild;
  if(fill)try{fill.style.setProperty('width',percent+'%','important')}catch(_){}
}
function applyMentalProgress(done,total){
  if(!Number.isFinite(done)||!Number.isFinite(total)||total<=0)return;
  const complete=done>=total;
  const source=document.querySelector(SOURCE);
  const card=document.getElementById(CARD_ID);
  [source,card].forEach(root=>{
    if(!root)return;
    const progress=root.querySelector('.v94-mentalist-progress');
    if(progress)progress.textContent=done+'/'+total;
    root.classList.toggle('tf13066-complete',complete);
    setBarProgress(root,done,total);
  });
}
function applyCachedMentalProgress(){
  const cached=readCachedProgress();
  if(!cached)return;
  const current=document.querySelector('#'+CARD_ID+' .v94-mentalist-progress');
  const shown=progressFromText(current&&current.textContent);
  if(!shown||shown.total!==cached.total||shown.done<cached.done)applyMentalProgress(cached.done,cached.total);
}
function syncMentalProgressFromModal(){
  const content=document.getElementById('windowContent');
  const root=content&&content.querySelector('.v96-mentalist-scroll');
  if(!content||!root)return false;
  const pill=content.querySelector('.v85-routine-progress-pill');
  let p=progressFromText(pill&&pill.textContent);
  const cardPill=progressFromText(document.querySelector('#'+CARD_ID+' .v94-mentalist-progress')?.textContent||'');
  const total=(p&&p.total)||(cardPill&&cardPill.total)||12;
  const counted=Math.min(total,completedRows(root).length);
  const done=Math.max(p?p.done:0,counted);
  p={done,total};
  if(pill&&progressFromText(pill.textContent)?.done!==done)pill.textContent=done+'/'+total;
  writeCachedProgress(done,total);
  applyMentalProgress(done,total);
  preserveCompletedIcons();
  return true;
}
function scheduleMentalSync(){
  [0,90,240,520].forEach(ms=>setTimeout(()=>{
    if(!syncMentalProgressFromModal())applyCachedMentalProgress();
    preserveCompletedIcons();
  },ms));
}

function clearProgressOnReset(target){
  if(!target||!target.closest)return;
  const btn=target.closest('button');
  if(!btn)return;
  const id=String(btn.id||'').toLowerCase();
  const text=norm(btn.textContent);
  if(id.includes('reset')&&(text.includes('CONFIRM')||text.includes('REINICIAR'))){removeLS(PROGRESS)}
}

function bind(){
  installStyle();
  rememberVisibleChoice();
  scheduleRepair();
  applyCachedMentalProgress();
  preserveCompletedIcons();

  document.addEventListener('change',event=>{
    const input=event.target;
    if(isMentalManagerInput(input)){
      if(input.checked){
        setLSRaw(USER,'on');
        setLSRaw(GUARD,'1');
      }else{
        allowMentalOffUntil=Date.now()+1200;
        setLSRaw(USER,'off');
        removeLS(GUARD);
        removeLS(PROGRESS);
      }
      setTimeout(scheduleRepair,0);
      return;
    }
    if(event.target&&event.target.closest&&event.target.closest('.v96-mentalist-scroll,.v97-routine-scroll'))scheduleMentalSync();
  },true);

  document.addEventListener('pointerdown',event=>armMentalLaunch(event.target),true);
  document.addEventListener('touchstart',event=>armMentalLaunch(event.target),{capture:true,passive:true});
  document.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target&&event.target.closest&&event.target.closest('#'+CARD_ID))armMentalLaunch(event.target);
  },true);

  document.addEventListener('click',event=>{
    const target=event.target;
    clearProgressOnReset(target);
    if(target&&target.closest&&target.closest('#'+CARD_ID)){
      scheduleMentalSync();
      setTimeout(disarmMentalLaunch,650);
      return;
    }
    if(target&&target.closest&&target.closest('.v96-mentalist-scroll,.v97-routine-scroll'))scheduleMentalSync();
    if(target&&target.closest&&target.closest('.window-close,.tf13053-x')){
      scheduleMentalSync();
      scheduleRepair();
    }
  },true);

  document.addEventListener('taskflow:search-submit',scheduleRepair,true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRepair()},false);
  window.addEventListener('pageshow',scheduleRepair,false);
  window.addEventListener('focus',scheduleRepair,false);

  [180,650,1500].forEach(ms=>setTimeout(()=>{scheduleRepair();applyCachedMentalProgress();preserveCompletedIcons()},ms));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
})();
