(function(){
'use strict';
if(window.__tfV13068MindLegalStyleFix)return;
window.__tfV13068MindLegalStyleFix=true;

/* V130.6.8 · Corrección localizada.
   SOLO iguala visualmente Sócrates y Maquiavelo al patrón de Dominio Jurídico.
   No modifica datos, progreso, frecuencia, sincronización ni comportamiento. */

const STYLE_ID='tfV13068MindLegalStyleCss';
const ROOT='tf13068-legal-pattern';
const TITLES={
  SOCRATES:[
    'Haz una buena pregunta',
    'Aprende de alguien distinto',
    'Explora algo nuevo',
    'Corrige una idea propia',
    'Explica lo aprendido'
  ],
  MAQUIAVELO:[
    'Define la victoria',
    'Lee el tablero',
    'Construye un argumento fuerte',
    'Ejecuta bajo presión',
    'Cierra con ventaja'
  ]
};

const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();

function installStyle(){
  const bad=document.getElementById('tfV13067MindLegalStyleCss');
  if(bad)bad.remove();
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#windowContent.${ROOT} .tf13068-mission{
  position:relative!important;
  display:grid!important;
  grid-template-columns:30px minmax(0,1fr)!important;
  align-items:center!important;
  column-gap:12px!important;
  min-height:72px!important;
  margin:0 0 8px!important;
  padding:11px 14px 11px 12px!important;
  border:1px solid rgba(126,156,201,.12)!important;
  border-radius:14px!important;
  background:linear-gradient(145deg,rgba(20,31,54,.98),rgba(15,25,45,.99))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important;
  overflow:hidden!important;
}
#windowContent.${ROOT} .tf13068-copy{grid-column:2!important;min-width:0!important;margin:0!important;padding:0!important}
#windowContent.${ROOT} .tf13068-copy strong,
#windowContent.${ROOT} .tf13068-copy b,
#windowContent.${ROOT} .tf13068-copy h3,
#windowContent.${ROOT} .tf13068-copy h4{color:#eef3fb!important;font-weight:850!important;text-decoration:none!important;opacity:1!important}
#windowContent.${ROOT} .tf13068-copy p,
#windowContent.${ROOT} .tf13068-copy small,
#windowContent.${ROOT} .tf13068-copy span{color:#8f9db2!important}
#windowContent.${ROOT} .tf13068-number{
  grid-column:1!important;grid-row:1!important;position:relative!important;
  left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
  width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;
  max-width:28px!important;max-height:28px!important;margin:0!important;padding:0!important;
  border-radius:50%!important;border:1px solid rgba(62,224,211,.23)!important;
  background:rgba(18,51,62,.72)!important;color:transparent!important;display:grid!important;
  place-items:center!important;box-shadow:none!important;filter:none!important;opacity:1!important;
  visibility:visible!important;transform:none!important;overflow:hidden!important
}
#windowContent.${ROOT} .tf13068-number>*{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
#windowContent.${ROOT} .tf13068-number::before{
  content:attr(data-tf13068-number);position:absolute!important;inset:0!important;display:grid!important;
  place-items:center!important;color:#56dfd3!important;font-size:11px!important;line-height:1!important;
  font-weight:900!important;opacity:1!important;visibility:visible!important
}
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-copy strong,
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-copy b,
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-copy h3,
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-copy h4{
  color:#7f8ba0!important;text-decoration:line-through!important;text-decoration-thickness:1px!important;opacity:.72!important
}
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-copy p,
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-copy small,
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-copy span{color:#667287!important;opacity:.72!important}
#windowContent.${ROOT} .tf13068-mission.tf13068-done .tf13068-number{
  border-color:rgba(62,224,211,.16)!important;background:rgba(15,43,52,.58)!important
}
#windowContent.${ROOT} .tf13067-check{display:none!important}
#windowContent.${ROOT} .tf13067-original-check{display:initial!important}
@media(max-width:430px){
  #windowContent.${ROOT} .tf13068-mission{grid-template-columns:28px minmax(0,1fr)!important;column-gap:11px!important;min-height:70px!important;padding:10px 12px 10px 11px!important;border-radius:13px!important}
  #windowContent.${ROOT} .tf13068-number{width:27px!important;height:27px!important;min-width:27px!important;min-height:27px!important;max-width:27px!important;max-height:27px!important}
}
`;
  document.head.appendChild(s);
}

function routineName(content){
  const h=content.querySelector('.v85-routine-modal-copy h2,.v85-routine-modal-head h2,.window-header-main h2,h2');
  return norm(h&&h.textContent);
}
function titlesFor(content){
  const n=routineName(content);
  if(n.includes('SOCRATES'))return TITLES.SOCRATES;
  if(n.includes('MAQUIAVELO'))return TITLES.MAQUIAVELO;
  return null;
}
function findTitleNode(root,title){
  const target=norm(title);let best=null,bestLen=Infinity;
  for(const el of root.querySelectorAll('strong,b,h3,h4,p,span,div')){
    const txt=norm(el.textContent);
    if(!txt||!txt.includes(target)||txt.includes('COMO COMPLETARLA'))continue;
    if(txt.length<bestLen){best=el;bestLen=txt.length}
  }
  return best;
}
function findMissionCard(titleNode,title,scroll){
  const target=norm(title);let node=titleNode,best=null;
  while(node&&node!==scroll&&node.parentElement){
    const txt=norm(node.textContent);
    if(txt.includes(target)&&!txt.includes('COMO COMPLETARLA')){
      const r=node.getBoundingClientRect();
      if(r.width>180&&r.height>=44&&r.height<=170)best=node;
    }
    node=node.parentElement;
  }
  return best||titleNode.parentElement;
}
function iconBox(card,titleNode){
  const byClass=[...card.querySelectorAll('[class*="icon" i]')].find(el=>{
    if(el.contains(titleNode)||titleNode.contains(el))return false;
    const r=el.getBoundingClientRect();
    return r.width>=28&&r.width<=90&&r.height>=28&&r.height<=90;
  });
  if(byClass)return byClass;
  const svg=[...card.querySelectorAll('svg')][0];
  if(!svg)return null;
  let node=svg;
  while(node&&node!==card){
    const r=node.getBoundingClientRect();
    if(r.width>=28&&r.width<=90&&r.height>=28&&r.height<=90)return node;
    node=node.parentElement;
  }
  return null;
}
function copyBox(card,titleNode,icon){
  let node=titleNode;
  while(node&&node.parentElement&&node.parentElement!==card){
    const parent=node.parentElement;
    if(parent===icon||parent.contains(icon))break;
    const r=parent.getBoundingClientRect();
    if(r.width>90&&r.height>=24&&r.height<125){node=parent;continue}
    break;
  }
  return node;
}
function isDone(card){
  if(card.querySelector('input[type="checkbox"]:checked'))return true;
  const cls=String(card.className||'').toLowerCase();
  if(/completed|complete|done|checked|is-complete|is-done/.test(cls))return true;
  if(card.querySelector('[aria-checked="true"],[aria-pressed="true"]'))return true;
  for(const el of card.querySelectorAll('[class*="check" i],[class*="done" i],[class*="complete" i]')){
    const cs=getComputedStyle(el);
    if(cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)>.05)return true;
  }
  if(/[✓✔]/.test(String(card.textContent||'')))return true;
  return false;
}
function undoBadLayer(content){
  content.querySelectorAll('.tf13067-check').forEach(el=>el.remove());
  content.querySelectorAll('.tf13067-mission,.tf13067-copy,.tf13067-task-icon,.tf13067-original-check').forEach(el=>{
    el.classList.remove('tf13067-mission','tf13067-copy','tf13067-task-icon','tf13067-original-check');
    if(el.dataset)delete el.dataset.tf13067Styled;
  });
}
function tag(card,titleNode,index){
  if(!card)return;
  card.classList.add('tf13068-mission');
  const icon=iconBox(card,titleNode);
  if(icon){icon.classList.add('tf13068-number');icon.setAttribute('data-tf13068-number',String(index))}
  const copy=copyBox(card,titleNode,icon);
  if(copy&&copy!==card)copy.classList.add('tf13068-copy');
  card.classList.toggle('tf13068-done',isDone(card));
}
function apply(){
  installStyle();
  const container=document.getElementById('windowContainer');
  const content=document.getElementById('windowContent');
  if(!container||!content||!container.classList.contains('open'))return;
  const titles=titlesFor(content);
  if(!titles){content.classList.remove(ROOT);return}
  const scroll=content.querySelector('.v97-routine-scroll');
  if(!scroll)return;
  undoBadLayer(content);
  content.classList.add(ROOT);
  titles.forEach((title,i)=>{
    const titleNode=findTitleNode(scroll,title);
    if(!titleNode)return;
    tag(findMissionCard(titleNode,title,scroll),titleNode,i+1);
  });
}
function schedule(){requestAnimationFrame(apply);setTimeout(apply,90);setTimeout(apply,260)}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',e=>{
  if(e.target&&e.target.closest&&e.target.closest('.v69-routine-launch,.tf13068-mission,.window-close'))schedule();
},{capture:true,passive:true});
document.addEventListener('change',e=>{
  if(e.target&&e.target.closest&&e.target.closest('#windowContainer'))schedule();
},true);
})();
