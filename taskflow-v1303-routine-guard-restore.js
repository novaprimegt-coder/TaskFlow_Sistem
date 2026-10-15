(function(){
'use strict';
if(window.__tfRestoreRoutineListenerRegistrationV1303)window.__tfRestoreRoutineListenerRegistrationV1303();
})();

(function(){
'use strict';
if(window.__tfV13041MentalistaStateFix)return;
window.__tfV13041MentalistaStateFix=true;

const CFG='taskflow_routines_v115';
const META='taskflow_routines_v115_meta';
const USER='taskflow_v13041_mentalista_user_choice';
const INIT='taskflow_routines_v119_defaulted';
let cardObserver=null;

function readCfg(){
  try{
    const x=JSON.parse(localStorage.getItem(CFG)||'{}');
    return x&&typeof x==='object'&&!Array.isArray(x)?x:{};
  }catch(_){return {}}
}
function writeCfg(c){
  try{
    localStorage.setItem(CFG,JSON.stringify(c));
    localStorage.setItem(META,String(Date.now()));
    localStorage.setItem(INIT,'1');
  }catch(_){}
}
function userChoice(){
  try{return localStorage.getItem(USER)||''}catch(_){return ''}
}
function setUserChoice(value){
  try{localStorage.setItem(USER,value)}catch(_){}
}
function refresh(){
  try{window.TaskFlowV117&&window.TaskFlowV117.refresh&&window.TaskFlowV117.refresh()}catch(_){}
  try{window.TaskFlowV119&&window.TaskFlowV119.refresh&&window.TaskFlowV119.refresh()}catch(_){}
}
function shouldRepair(c){
  if(c.mentalista!==false||userChoice()==='off')return false;
  return ['sung','juridico','socrates','maquiavelo'].some(id=>c[id]===true);
}
function repair(){
  const c=readCfg();
  if(!shouldRepair(c))return false;
  c.mentalista=true;
  writeCfg(c);
  refresh();
  return true;
}
function bindCard(){
  const card=document.getElementById('tfMentalistPairV117');
  if(!card||card.dataset.tf13041Observed==='1')return;
  card.dataset.tf13041Observed='1';
  cardObserver=new MutationObserver(()=>{
    if(userChoice()==='off')return;
    if(card.classList.contains('tf117-off')||card.classList.contains('tf119-off')||card.getAttribute('aria-hidden')==='true')repair();
  });
  cardObserver.observe(card,{attributes:true,attributeFilter:['class','aria-hidden','style']});
}
function detectUserChange(e){
  const input=e.target;
  if(!input||input.tagName!=='INPUT'||input.type!=='checkbox')return;
  const row=input.closest('.tf119-row,.tf117-row');
  if(!row)return;
  const text=String(row.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  if(!text.includes('MENTALISTA'))return;
  setUserChoice(input.checked?'on':'off');
}
function boot(){
  document.addEventListener('change',detectUserChange,true);
  repair();
  bindCard();
  [250,900,1800,3200,5200,8000].forEach(ms=>setTimeout(()=>{repair();bindCard()},ms));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){repair();bindCard()}},false);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
