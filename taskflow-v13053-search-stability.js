(function(){
'use strict';
if(window.__tfV13053SearchStability)return;window.__tfV13053SearchStability=true;

const CFG='taskflow_routines_v115';
const CFG_META='taskflow_routines_v115_meta';
const SEARCH_CARD_ID='v47SearchResultsCard';
let input=null,container=null,actions=null,modal=null,host=null,allowNative=false,searchTimer=0,lastCfgRaw=null,lastCfgMeta=null;
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();

function getLS(k){try{return localStorage.getItem(k)}catch(_){return null}}
function setLS(k,v){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(_){}}
function readCfg(){try{const c=JSON.parse(getLS(CFG)||'{}');return c&&typeof c==='object'&&!Array.isArray(c)?c:{}}catch(_){return {}}}
function snapshotRoutineCfg(){lastCfgRaw=getLS(CFG);lastCfgMeta=getLS(CFG_META)}
function refreshRoutines(){try{window.TaskFlowV117&&window.TaskFlowV117.refresh&&window.TaskFlowV117.refresh()}catch(_){}try{window.TaskFlowV119&&window.TaskFlowV119.refresh&&window.TaskFlowV119.refresh()}catch(_){}}
function restoreRoutineCfg(){
  if(lastCfgRaw===null&&lastCfgMeta===null)return;
  if(getLS(CFG)!==lastCfgRaw)setLS(CFG,lastCfgRaw);
  if(getLS(CFG_META)!==lastCfgMeta)setLS(CFG_META,lastCfgMeta);
  refreshRoutines();
}
function stabilizeRoutines(){[0,70,180,420,850,1350].forEach(ms=>setTimeout(restoreRoutineCfg,ms))}
function mentalistaVisible(){
  const c=readCfg();if(c.mentalista===false)return false;
  const card=document.getElementById('tfMentalistPairV117');
  if(card){card.classList.remove('tf117-off','tf119-off','hidden');card.hidden=false;card.removeAttribute('aria-hidden');['display','visibility','opacity','height','max-height'].forEach(p=>{try{card.style.removeProperty(p)}catch(_){}})}
  const pair=document.getElementById('tfPairV117');if(pair){const single=c.budget503020===false;pair.classList.remove('tf119-empty');pair.classList.toggle('tf117-single',single);pair.classList.toggle('tf119-single',single)}
  return true;
}
function restoreDashboard(){restoreRoutineCfg();refreshRoutines();setTimeout(()=>{restoreRoutineCfg();mentalistaVisible()},50);setTimeout(()=>{restoreRoutineCfg();mentalistaVisible()},250)}

function dispatchNative(value){if(!input)return;input.value=value;allowNative=true;try{input.dispatchEvent(new Event('input',{bubbles:true,cancelable:true}))}finally{allowNative=false}}

function installStyle(){
  if(document.getElementById('tfV13053SearchStyle'))return;
  const s=document.createElement('style');s.id='tfV13053SearchStyle';s.textContent=`
#searchInput::-webkit-search-cancel-button,#searchInput::-webkit-search-decoration{display:none!important;-webkit-appearance:none!important}
#clearSearch{display:none!important}
.search-container{position:relative!important;overflow:visible!important}
.search-container>i.fa-search,.search-container .search-icon,.tf13053-loupe{font-size:22px!important;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;display:grid!important;place-items:center!important;line-height:1!important;color:#50e5da!important;opacity:1!important;filter:drop-shadow(0 0 7px rgba(80,229,218,.32))!important;margin:0!important}
.search-container>i.fa-search:before{font-size:22px!important;line-height:1!important}
.tf13053-loupe svg,.search-container .search-icon svg{width:23px!important;height:23px!important;display:block!important}
.tf13053-search-actions{display:flex!important;align-items:center!important;gap:8px!important;flex:0 0 auto!important;margin-left:auto!important}.tf13053-search-actions[hidden]{display:none!important}
.tf13053-search-btn{width:42px!important;height:42px!important;min-width:42px!important;border-radius:13px!important;border:1px solid rgba(255,255,255,.11)!important;background:linear-gradient(145deg,rgba(22,32,52,.92),rgba(12,20,35,.96))!important;color:#cdd8ea!important;display:grid!important;place-items:center!important;padding:0!important;margin:0!important;line-height:1!important;font-weight:900!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 8px 20px rgba(0,0,0,.18)!important}
.tf13053-search-btn.clear{font-size:26px!important}.tf13053-search-btn.submit{font-size:27px!important;color:#61eee1!important;border-color:rgba(78,205,196,.36)!important;background:linear-gradient(145deg,rgba(30,119,130,.28),rgba(16,49,68,.36))!important;box-shadow:0 0 20px rgba(48,215,204,.12),inset 0 1px 0 rgba(255,255,255,.05)!important}
#tfSearchModalV13053{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(2,6,16,.89);backdrop-filter:blur(11px);overscroll-behavior:none}#tfSearchModalV13053.open{display:flex}
.tf13053-sheet{width:min(620px,100%);height:min(820px,calc(100dvh - 20px));max-height:calc(100dvh - 20px);display:flex;flex-direction:column;min-height:0;border-radius:23px;border:1px solid rgba(78,205,196,.30);background:radial-gradient(circle at 85% 0%,rgba(61,224,208,.07),transparent 30%),linear-gradient(160deg,#121d34,#0a1120 58%,#070c17);box-shadow:0 32px 94px rgba(0,0,0,.70),0 0 0 1px rgba(91,230,218,.025);overflow:hidden;color:#fff}
.tf13053-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:15px 15px 12px;border-bottom:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg,rgba(20,31,54,.98),rgba(14,22,39,.94))}.tf13053-head small{display:block;color:#59e5d8;font-size:8px;font-weight:950;letter-spacing:.15em}.tf13053-head h2{margin:4px 0 3px;font-size:21px;line-height:1.05}.tf13053-head p{margin:0;color:#9aa8bd;font-size:9px}.tf13053-x{width:40px;height:40px;flex:0 0 40px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;font-size:25px;display:grid;place-items:center;padding:0}
.tf13053-host{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:11px;scrollbar-width:thin;scrollbar-color:#28ddd1 rgba(255,255,255,.04)}.tf13053-host::-webkit-scrollbar{width:5px}.tf13053-host::-webkit-scrollbar-thumb{background:#28ddd1;border-radius:999px}.tf13053-empty{padding:20px 14px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.03);color:#9eabc0;text-align:center;font-size:11px}.tf13053-result-copy{display:block!important;position:static!important;width:100%!important;max-width:none!important;height:auto!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important}.tf13053-result-copy h1,.tf13053-result-copy h2,.tf13053-result-copy h3{font-size:15px!important;line-height:1.15!important}
@media(max-width:430px){.search-container>i.fa-search,.search-container .search-icon,.tf13053-loupe{font-size:21px!important;width:27px!important;height:27px!important;min-width:27px!important;min-height:27px!important}.search-container>i.fa-search:before{font-size:21px!important}.tf13053-search-btn{width:40px!important;height:40px!important;min-width:40px!important}.tf13053-sheet{height:calc(100dvh - 14px);max-height:calc(100dvh - 14px);border-radius:20px}.tf13053-head h2{font-size:20px}}
`;
  document.head.appendChild(s);
}
function cleanupLegacy(){
  ['tfV13051SearchStyle','tfV1305SearchStyle','tfV13052SearchStyle'].forEach(id=>document.getElementById(id)?.remove());
  ['tfSearchModalV13051','tfSearchModalV1305','tfSearchModalV13052','tfSearchActionsV13051','tfSearchActionsV1305','tfSearchActionsV13052'].forEach(id=>document.getElementById(id)?.remove());
  document.querySelectorAll('.tf13051-inline-hidden,.tf1305-inline-hidden').forEach(el=>el.classList.remove('tf13051-inline-hidden','tf1305-inline-hidden'));
  const discipline=document.querySelector('.v48-discipline-center');const analysis=document.querySelector('.v48-analysis-panel');[discipline,analysis].forEach(el=>{if(!el)return;el.hidden=false;el.removeAttribute('aria-hidden');el.classList.remove('hidden');['display','visibility','opacity','height','max-height','overflow'].forEach(p=>{try{el.style.removeProperty(p)}catch(_){}})});
}
function buildModal(){
  modal=document.getElementById('tfSearchModalV13053');if(modal){host=document.getElementById('tfSearchHostV13053');return}
  modal=document.createElement('div');modal.id='tfSearchModalV13053';modal.setAttribute('aria-hidden','true');modal.innerHTML='<section class="tf13053-sheet" role="dialog" aria-modal="true" aria-labelledby="tfSearchTitleV13053"><header class="tf13053-head"><div><small>BÚSQUEDA TASKFLOW</small><h2 id="tfSearchTitleV13053">Resultados de búsqueda</h2><p id="tfSearchQueryV13053"></p></div><button class="tf13053-x" type="button" aria-label="Cerrar">×</button></header><div class="tf13053-host" id="tfSearchHostV13053"></div></section>';document.body.appendChild(modal);host=document.getElementById('tfSearchHostV13053');modal.querySelector('.tf13053-x').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()},true)
}
function stripIds(root){if(!root)return;root.removeAttribute('id');root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'))}
function removeNonResults(root){
  const banned=['ULTIMOS 7 DIAS','CENTRO DE CORRECCION','PROTOCOLO DE RECUPERACION','DIAS PERFECTOS','FALLOS REGISTRADOS','ALERTAS CRITICAS','ESTADO ACTUAL','SISTEMA LIMPIO','PRIORIDAD AHORA','CICLO DE TIENDA'];
  root.querySelectorAll('*').forEach(el=>{const t=norm(el.textContent);if(banned.some(x=>t===x||t.startsWith(x+' '))){const block=el.closest('section,article,[class*="panel"],[class*="card"],[class*="center"]');if(block&&block!==root)block.remove()}});
  root.querySelectorAll('h1,h2,h3,h4,strong,span,p,div').forEach(el=>{const t=norm(el.textContent);if(t==='RESULTADOS DE BUSQUEDA'||t==='COINCIDENCIAS EN TAREAS Y HABITOS'){const p=el.parentElement;if(p&&p!==root&&p.children.length<=3)p.remove();else el.remove()}})
}
function copyResults(){
  host.innerHTML='';const source=document.getElementById(SEARCH_CARD_ID);if(!source){host.innerHTML='<div class="tf13053-empty">No se encontraron coincidencias para esta búsqueda.</div>';return}
  const clone=source.cloneNode(true);stripIds(clone);clone.hidden=false;clone.removeAttribute('hidden');clone.removeAttribute('aria-hidden');clone.classList.add('tf13053-result-copy');removeNonResults(clone);
  clone.querySelectorAll('[style]').forEach(el=>{const st=String(el.getAttribute('style')||'');if(/display\s*:\s*none/i.test(st))el.style.removeProperty('display')});
  const meaningful=norm(clone.textContent).replace(/RESULTADOS DE BUSQUEDA/g,'').replace(/COINCIDENCIAS EN TAREAS Y HABITOS/g,'').trim();if(!meaningful){host.innerHTML='<div class="tf13053-empty">No se encontraron coincidencias para esta búsqueda.</div>';return}host.appendChild(clone)
}
function updateActions(){if(actions&&input)actions.hidden=!input.value.trim()}
function resetNativeKeepingText(shown){dispatchNative('');input.value=shown;updateActions();restoreDashboard()}
function openModal(query){const q=document.getElementById('tfSearchQueryV13053');if(q)q.textContent='Resultados para “'+query+'”';modal.dataset.prevOverflow=document.body.style.overflow||'';document.body.style.overflow='hidden';modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeModal(){if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=modal.dataset.prevOverflow||'';host.innerHTML='';restoreDashboard();stabilizeRoutines()}
function openSound(auto){
  if(!input)return;snapshotRoutineCfg();
  document.dispatchEvent(new CustomEvent('taskflow:search-submit',{detail:{query:'SONIDO',sourceQuery:input.value,auto:!!auto}}));
  if(auto){input.value='';updateActions();try{input.blur()}catch(_){}}
  restoreDashboard();
}
function submit(){
  if(!input)return;const query=input.value.trim();if(!query)return;const n=norm(query);try{input.blur()}catch(_){}
  if(n==='SONIDO'||n==='MUSICA'){openSound(false);return}
  snapshotRoutineCfg();dispatchNative(query);clearTimeout(searchTimer);searchTimer=setTimeout(()=>{copyResults();resetNativeKeepingText(query);openModal(query);stabilizeRoutines()},110)
}
function clearSearch(){if(!input)return;if(modal&&modal.classList.contains('open'))closeModal();dispatchNative('');input.value='';updateActions();restoreDashboard();try{input.focus()}catch(_){}}
function markLoupe(){if(!container)return;const icon=container.querySelector('i.fa-search,.search-icon')||[...container.querySelectorAll('svg')].find(el=>!el.closest('.tf13053-search-actions')&&!el.closest('button'))?.parentElement||null;if(icon)icon.classList.add('tf13053-loupe')}
function installControls(){
  input=document.getElementById('searchInput');if(!input)return false;container=input.closest('.search-container')||input.parentElement;if(!container)return false;try{input.type='text'}catch(_){}input.setAttribute('enterkeyhint','search');
  const old=document.getElementById('clearSearch');if(old)old.style.display='none';
  ['tfSearchActionsV13051','tfSearchActionsV1305','tfSearchActionsV13052'].forEach(id=>document.getElementById(id)?.remove());
  actions=document.getElementById('tfSearchActionsV13053');if(!actions){actions=document.createElement('div');actions.id='tfSearchActionsV13053';actions.className='tf13053-search-actions';const x=document.createElement('button');x.type='button';x.className='tf13053-search-btn clear';x.setAttribute('aria-label','Borrar búsqueda');x.textContent='×';const go=document.createElement('button');go.type='button';go.className='tf13053-search-btn submit';go.setAttribute('aria-label','Enviar búsqueda');go.textContent='→';actions.append(x,go);container.appendChild(actions);x.addEventListener('click',clearSearch);go.addEventListener('click',submit)}
  if(input.dataset.tf13053Bound!=='1'){
    input.dataset.tf13053Bound='1';
    input.addEventListener('input',e=>{if(allowNative)return;const n=norm(input.value);updateActions();if(n==='SONIDO'){e.preventDefault();e.stopImmediatePropagation();openSound(true);return}e.stopImmediatePropagation();restoreDashboard()},true);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();submit()}},true)
  }
  updateActions();markLoupe();return true
}
function boot(){installStyle();cleanupLegacy();buildModal();if(!installControls())[120,350,800,1600].forEach(ms=>setTimeout(installControls,ms));restoreDashboard();[200,650,1400,2800].forEach(ms=>setTimeout(()=>{cleanupLegacy();restoreDashboard();markLoupe()},ms));document.addEventListener('visibilitychange',()=>{if(!document.hidden)restoreDashboard()},false)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();