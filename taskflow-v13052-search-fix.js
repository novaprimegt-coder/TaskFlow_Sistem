(function(){
'use strict';
if(window.__tfV13052SearchFix)return;window.__tfV13052SearchFix=true;

const SEARCH_CARD_ID='v47SearchResultsCard';
const ROUTINE_KEYS=['taskflow_routines_v115','taskflow_routines_v115_meta','taskflow_routines_v119_defaulted','taskflow_v13041_mentalista_user_choice'];
let input=null,container=null,actions=null,modal=null,host=null,allowNative=false,searchTimer=0;
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();

function storageSnapshot(){const out={};for(const k of ROUTINE_KEYS){try{out[k]=localStorage.getItem(k)}catch(_){out[k]=null}}return out}
function restoreStorage(snap){if(!snap)return;for(const k of ROUTINE_KEYS){try{const now=localStorage.getItem(k),old=snap[k];if(now===old)continue;if(old===null)localStorage.removeItem(k);else localStorage.setItem(k,old)}catch(_){}}}
function readRoutineCfg(){try{const x=JSON.parse(localStorage.getItem('taskflow_routines_v115')||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return {}}}
function userDisabledMentalista(){try{return localStorage.getItem('taskflow_v13041_mentalista_user_choice')==='off'}catch(_){return false}}
function refreshRoutines(){try{window.TaskFlowV117&&window.TaskFlowV117.refresh&&window.TaskFlowV117.refresh()}catch(_){}try{window.TaskFlowV119&&window.TaskFlowV119.refresh&&window.TaskFlowV119.refresh()}catch(_){} }
function mentalistaCard(){return document.getElementById('tfMentalistPairV117')||document.querySelector('.v94-mentalist-launch')?.closest('.v94-mentalist-card,.v83-core-card,.v69-routine-launch')||null}
function showMentalistaWhenEnabled(){
  if(userDisabledMentalista())return;
  const cfg=readRoutineCfg();
  const otherOn=['sung','juridico','socrates','maquiavelo'].some(k=>cfg[k]===true);
  if(cfg.mentalista===false&&otherOn){try{cfg.mentalista=true;localStorage.setItem('taskflow_routines_v115',JSON.stringify(cfg));localStorage.setItem('taskflow_routines_v115_meta',String(Date.now()));localStorage.setItem('taskflow_routines_v119_defaulted','1')}catch(_){}refreshRoutines()}
  const card=mentalistaCard();if(!card)return;
  card.hidden=false;card.removeAttribute('aria-hidden');
  card.classList.remove('tf117-off','tf119-off','hidden','tf13051-inline-hidden','tf1305-inline-hidden');
  ['display','visibility','opacity','height','max-height'].forEach(p=>{try{card.style.removeProperty(p)}catch(_){} });
}
function cleanupOldSearchDamage(){
  ['tfV13051SearchStyle','tfV1305SearchStyle'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove()});
  ['tfSearchModalV13051','tfSearchModalV1305','tfSearchActionsV13051','tfSearchActionsV1305'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove()});
  document.querySelectorAll('.tf13051-inline-hidden,.tf1305-inline-hidden').forEach(el=>el.classList.remove('tf13051-inline-hidden','tf1305-inline-hidden'));
  const discipline=document.querySelector('.v48-discipline-center');
  const analysis=document.querySelector('.v48-analysis-panel');
  [discipline,analysis].forEach(el=>{if(!el)return;el.hidden=false;el.removeAttribute('aria-hidden');el.classList.remove('tf13051-inline-hidden','tf1305-inline-hidden','hidden');['display','visibility','opacity','height','max-height','overflow'].forEach(p=>{try{el.style.removeProperty(p)}catch(_){} })});
  showMentalistaWhenEnabled();
}
function dispatchNative(value){if(!input)return;input.value=value;allowNative=true;try{input.dispatchEvent(new Event('input',{bubbles:true,cancelable:true}))}finally{allowNative=false}}
function installStyle(){
  if(document.getElementById('tfV13052SearchStyle'))return;
  const s=document.createElement('style');s.id='tfV13052SearchStyle';s.textContent=`
#searchInput::-webkit-search-cancel-button,#searchInput::-webkit-search-decoration{display:none!important;-webkit-appearance:none!important}#clearSearch{display:none!important}.search-container{position:relative!important;overflow:visible!important}.tf13052-loupe,.search-container .search-icon{width:23px!important;height:23px!important;min-width:23px!important;min-height:23px!important}.tf13052-loupe svg{width:23px!important;height:23px!important}.tf13052-search-actions{display:flex!important;align-items:center!important;gap:8px!important;flex:0 0 auto!important;margin-left:auto!important}.tf13052-search-actions[hidden]{display:none!important}.tf13052-search-btn{width:42px!important;height:42px!important;min-width:42px!important;border-radius:13px!important;border:1px solid rgba(255,255,255,.10)!important;background:rgba(255,255,255,.045)!important;color:#c9d4e8!important;display:grid!important;place-items:center!important;padding:0!important;margin:0!important;line-height:1!important;font-weight:900!important;cursor:pointer!important}.tf13052-search-btn.clear{font-size:26px!important}.tf13052-search-btn.submit{font-size:27px!important;color:#5ce6da!important;border-color:rgba(78,205,196,.30)!important;background:linear-gradient(145deg,rgba(31,123,132,.23),rgba(20,55,73,.28))!important}
#tfSearchModalV13052{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(2,6,16,.88);backdrop-filter:blur(10px);overscroll-behavior:none}#tfSearchModalV13052.open{display:flex}.tf13052-sheet{width:min(620px,100%);height:min(820px,calc(100dvh - 20px));max-height:calc(100dvh - 20px);display:flex;flex-direction:column;min-height:0;border-radius:22px;border:1px solid rgba(78,205,196,.28);background:linear-gradient(160deg,#121d34,#0a1120 58%,#070c17);box-shadow:0 30px 90px rgba(0,0,0,.68);overflow:hidden;color:#fff}.tf13052-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:15px 15px 12px;border-bottom:1px solid rgba(255,255,255,.065)}.tf13052-head small{display:block;color:#55e1d3;font-size:8px;font-weight:950;letter-spacing:.15em}.tf13052-head h2{margin:4px 0 3px;font-size:21px;line-height:1.05}.tf13052-head p{margin:0;color:#96a3b8;font-size:9px}.tf13052-x{width:40px;height:40px;flex:0 0 40px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.045);color:#fff;font-size:25px;display:grid;place-items:center;padding:0}.tf13052-host{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:11px;scrollbar-width:thin;scrollbar-color:#27d8cd rgba(255,255,255,.04)}.tf13052-host::-webkit-scrollbar{width:5px}.tf13052-host::-webkit-scrollbar-thumb{background:#27d8cd;border-radius:999px}.tf13052-empty{padding:20px 14px;border:1px solid rgba(255,255,255,.075);border-radius:15px;background:rgba(255,255,255,.028);color:#97a5ba;text-align:center;font-size:11px}.tf13052-result-copy{display:block!important;position:static!important;width:100%!important;max-width:none!important;height:auto!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important}.tf13052-result-copy [hidden]{display:none!important}.tf13052-result-copy h1,.tf13052-result-copy h2,.tf13052-result-copy h3{font-size:15px!important;line-height:1.15!important}.v48-discipline-center,.v48-analysis-panel{visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important}
@media(max-width:430px){.tf13052-search-btn{width:40px!important;height:40px!important;min-width:40px!important}.tf13052-loupe,.search-container .search-icon,.tf13052-loupe svg{width:22px!important;height:22px!important}.tf13052-sheet{height:calc(100dvh - 14px);max-height:calc(100dvh - 14px);border-radius:19px}.tf13052-head h2{font-size:20px}}
`;
  document.head.appendChild(s);
}
function buildModal(){
  modal=document.getElementById('tfSearchModalV13052');
  if(modal){host=document.getElementById('tfSearchHostV13052');return}
  modal=document.createElement('div');modal.id='tfSearchModalV13052';modal.setAttribute('aria-hidden','true');modal.innerHTML='<section class="tf13052-sheet" role="dialog" aria-modal="true" aria-labelledby="tfSearchTitleV13052"><header class="tf13052-head"><div><small>BÚSQUEDA TASKFLOW</small><h2 id="tfSearchTitleV13052">Resultados de búsqueda</h2><p id="tfSearchQueryV13052"></p></div><button class="tf13052-x" type="button" aria-label="Cerrar">×</button></header><div class="tf13052-host" id="tfSearchHostV13052"></div></section>';document.body.appendChild(modal);host=document.getElementById('tfSearchHostV13052');modal.querySelector('.tf13052-x').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()},true)
}
function stripIds(root){if(!root)return;root.removeAttribute('id');root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'))}
function ownText(el){return Array.from(el.childNodes||[]).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.nodeValue||'').join(' ').trim()}
function removeSearchHeader(clone){
  const exact=new Set(['RESULTADOS DE BUSQUEDA','COINCIDENCIAS EN TAREAS Y HABITOS']);
  const nodes=[...clone.querySelectorAll('h1,h2,h3,h4,strong,span,p,div')].filter(el=>exact.has(norm(ownText(el))));
  nodes.forEach(el=>{const p=el.parentElement;if(p&&p!==clone&&p.children.length<=3&&[...p.children].every(c=>exact.has(norm(ownText(c)))||!norm(c.textContent)))p.remove();else el.remove()});
}
function copyResults(){
  const source=document.getElementById(SEARCH_CARD_ID);
  host.innerHTML='';
  if(!source){host.innerHTML='<div class="tf13052-empty">No se encontraron coincidencias para esta búsqueda.</div>';return}
  const clone=source.cloneNode(true);stripIds(clone);clone.hidden=false;clone.removeAttribute('hidden');clone.removeAttribute('aria-hidden');clone.classList.remove('tf13051-inline-hidden','tf1305-inline-hidden');clone.classList.add('tf13052-result-copy');removeSearchHeader(clone);
  const meaningful=norm(clone.textContent).replace(/RESULTADOS DE BUSQUEDA/g,'').replace(/COINCIDENCIAS EN TAREAS Y HABITOS/g,'').trim();
  if(!meaningful){host.innerHTML='<div class="tf13052-empty">No se encontraron coincidencias para esta búsqueda.</div>';return}
  host.appendChild(clone)
}
function resetNativeKeepingText(shown,snapshot){
  dispatchNative('');
  input.value=shown;
  restoreStorage(snapshot);
  refreshRoutines();
  cleanupOldSearchDamage();
  setTimeout(()=>{restoreStorage(snapshot);refreshRoutines();cleanupOldSearchDamage()},80);
  setTimeout(()=>{restoreStorage(snapshot);refreshRoutines();cleanupOldSearchDamage()},350)
}
function openModal(query){const q=document.getElementById('tfSearchQueryV13052');if(q)q.textContent='Resultados para “'+query+'”';modal.dataset.prevOverflow=document.body.style.overflow||'';document.body.style.overflow='hidden';modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeModal(){if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=modal.dataset.prevOverflow||'';host.innerHTML='';cleanupOldSearchDamage()}
function submit(){
  if(!input)return;const query=input.value.trim();if(!query)return;try{input.blur()}catch(_){}
  const n=norm(query);
  if(n==='MUSICA'||n==='SONIDO'){
    cleanupOldSearchDamage();
    document.dispatchEvent(new CustomEvent('taskflow:search-submit',{detail:{query:'SONIDO',sourceQuery:query}}));
    return;
  }
  const snapshot=storageSnapshot();
  dispatchNative(query);
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{copyResults();resetNativeKeepingText(query,snapshot);openModal(query)},90)
}
function clearSearch(){if(!input)return;if(modal&&modal.classList.contains('open'))closeModal();dispatchNative('');input.value='';updateActions();cleanupOldSearchDamage();try{input.focus()}catch(_){} }
function updateActions(){if(!actions||!input)return;actions.hidden=!input.value.trim()}
function markLoupe(){if(!container)return;let icon=container.querySelector('.search-icon');if(!icon){icon=[...container.querySelectorAll('svg')].find(el=>!el.closest('.tf13052-search-actions')&&!el.closest('button'))?.parentElement||null}if(icon)icon.classList.add('tf13052-loupe')}
function installControls(){
  input=document.getElementById('searchInput');if(!input)return false;container=input.closest('.search-container')||input.parentElement;if(!container)return false;try{input.type='text'}catch(_){}input.setAttribute('enterkeyhint','search');
  const old=document.getElementById('clearSearch');if(old)old.style.display='none';
  document.getElementById('tfSearchActionsV13051')?.remove();document.getElementById('tfSearchActionsV1305')?.remove();
  actions=document.getElementById('tfSearchActionsV13052');if(!actions){actions=document.createElement('div');actions.id='tfSearchActionsV13052';actions.className='tf13052-search-actions';const x=document.createElement('button');x.type='button';x.className='tf13052-search-btn clear';x.setAttribute('aria-label','Borrar búsqueda');x.textContent='×';const go=document.createElement('button');go.type='button';go.className='tf13052-search-btn submit';go.setAttribute('aria-label','Enviar búsqueda');go.textContent='→';actions.append(x,go);container.appendChild(actions);x.addEventListener('click',clearSearch);go.addEventListener('click',submit)}
  if(input.dataset.tf13052Bound!=='1'){input.dataset.tf13052Bound='1';input.addEventListener('input',e=>{if(allowNative)return;e.stopImmediatePropagation();updateActions();cleanupOldSearchDamage()},true);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();submit()}},true)}
  updateActions();markLoupe();return true
}
function boot(){installStyle();cleanupOldSearchDamage();buildModal();if(!installControls())[120,350,800,1600].forEach(ms=>setTimeout(installControls,ms));[200,650,1400,2800].forEach(ms=>setTimeout(cleanupOldSearchDamage,ms));document.addEventListener('visibilitychange',()=>{if(!document.hidden)cleanupOldSearchDamage()},false)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
