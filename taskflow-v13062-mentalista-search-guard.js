(function(){
'use strict';
if(window.__tfV13062MentalistaSearchGuard)return;
window.__tfV13062MentalistaSearchGuard=true;

/* V130.6.2 · Corrección localizada de regresión Mentalista/buscador.
   No modifica audio, diseño, datos de tareas/hábitos, perfil ni sincronización.
   Objetivo: una búsqueda nunca debe alterar la configuración ni la visibilidad de Mentalista. */

const CFG='taskflow_routines_v115';
const META='taskflow_routines_v115_meta';
const USER='taskflow_v13041_mentalista_user_choice';
const INPUT_ID='searchInput';
const CARD_ID='tfMentalistPairV117';
const PAIR_ID='tfPairV117';

let baselineRaw=null;
let baselineMeta=null;
let baselineMentalista=true;
let restoreEpoch=0;

function getLS(key){try{return localStorage.getItem(key)}catch(_){return null}}
function setLS(key,value){try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}catch(_){}}
function parseCfg(raw){
  try{const cfg=JSON.parse(raw||'{}');return cfg&&typeof cfg==='object'&&!Array.isArray(cfg)?cfg:{}}catch(_){return {}}
}
function refreshRoutines(){
  try{window.TaskFlowV117&&window.TaskFlowV117.refresh&&window.TaskFlowV117.refresh()}catch(_){}
  try{window.TaskFlowV119&&window.TaskFlowV119.refresh&&window.TaskFlowV119.refresh()}catch(_){}
}
function snapshotBaseline(){
  baselineRaw=getLS(CFG);
  baselineMeta=getLS(META);
  baselineMentalista=parseCfg(baselineRaw).mentalista!==false;
}
function restoreMentalistaDom(){
  if(!baselineMentalista)return;
  const card=document.getElementById(CARD_ID);
  if(card){
    card.hidden=false;
    card.removeAttribute('hidden');
    card.removeAttribute('aria-hidden');
    card.classList.remove('tf117-off','tf119-off','hidden');
    ['display','visibility','opacity','height','min-height','max-height'].forEach(prop=>{try{card.style.removeProperty(prop)}catch(_){}});
  }
  const pair=document.getElementById(PAIR_ID);
  if(pair){
    pair.classList.remove('tf119-empty','tf117-single','tf119-single');
    ['display','visibility','opacity','height','min-height','max-height'].forEach(prop=>{try{pair.style.removeProperty(prop)}catch(_){}});
  }
}
function restoreConfig(){
  if(!baselineMentalista)return false;
  const raw=getLS(CFG);
  const current=parseCfg(raw);
  if(current.mentalista!==false)return false;
  const base=parseCfg(baselineRaw);
  current.mentalista=base.mentalista===false?false:true;
  setLS(CFG,JSON.stringify(current));
  if(baselineMeta!==null)setLS(META,baselineMeta);
  return true;
}
function restoreOnce(){
  const changed=restoreConfig();
  if(changed)refreshRoutines();
  restoreMentalistaDom();
}
function scheduleRestore(){
  const epoch=++restoreEpoch;
  [0,60,160,360,700,1100,1550].forEach(ms=>setTimeout(()=>{if(epoch===restoreEpoch)restoreOnce()},ms));
}
function isMentalistaManagerChange(event){
  if(!event||event.isTrusted!==true)return false;
  const input=event.target;
  if(!input||input.tagName!=='INPUT'||input.type!=='checkbox')return false;
  const row=input.closest&&input.closest('.tf119-row,.tf117-row');
  if(!row)return false;
  const text=String(row.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  return text.includes('MENTALISTA');
}
function install(){
  const input=document.getElementById(INPUT_ID);
  if(!input){setTimeout(install,180);return}

  /* Toma como baseline el estado real antes de que el buscador actúe. */
  snapshotBaseline();

  input.addEventListener('focus',()=>{if(!input.value.trim())snapshotBaseline()},true);
  input.addEventListener('beforeinput',()=>{if(!input.value.trim())snapshotBaseline()},true);
  input.addEventListener('input',()=>{
    if(input.value.trim())scheduleRestore();
    else{
      scheduleRestore();
      setTimeout(snapshotBaseline,1650);
    }
  },true);
  input.addEventListener('keydown',event=>{
    if(event.key==='Enter')scheduleRestore();
  },true);

  document.addEventListener('click',event=>{
    const target=event.target&&event.target.closest?event.target.closest('.tf13053-search-btn.submit,.tf13053-search-btn.clear,.tf13053-x'):null;
    if(target)scheduleRestore();
  },true);

  document.addEventListener('change',event=>{
    if(!isMentalistaManagerChange(event))return;
    /* Una elección manual real del usuario sí reemplaza el baseline. */
    setTimeout(()=>{snapshotBaseline();restoreEpoch++},0);
  },true);

  /* Repara la regresión actual solo si no existe una desactivación explícita registrada. */
  const cfg=parseCfg(getLS(CFG));
  const explicitChoice=getLS(USER);
  if(cfg.mentalista===false&&explicitChoice!=='off'){
    cfg.mentalista=true;
    setLS(CFG,JSON.stringify(cfg));
    setLS(META,String(Date.now()));
    baselineRaw=JSON.stringify(cfg);
    baselineMeta=getLS(META);
    baselineMentalista=true;
    refreshRoutines();
  }
  restoreMentalistaDom();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
