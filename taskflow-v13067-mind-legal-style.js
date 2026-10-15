(function(){
'use strict';
if(window.__tfV13067MindLegalStyle)return;
window.__tfV13067MindLegalStyle=true;

/* V130.6.7 · SOLO cambia la presentación de Sócrates y Maquiavelo
   para usar el patrón visual de Dominio jurídico. No modifica sus datos,
   progreso, frecuencia, sincronización ni el resto de rutinas. */

const STYLE_ID='tfV13067MindLegalStyleCss';
const ROOT_CLASS='tf13067-mind-legal-style';
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
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* V130.7.4: Sócrates y Maquiavelo con el patrón visual de Sung Jin-Woo. */
#windowContent.${ROOT_CLASS} .tf13067-mission{
  position:relative!important;
  display:grid!important;
  grid-template-columns:50px minmax(0,1fr) 44px!important;
  align-items:center!important;
  column-gap:12px!important;
  min-height:80px!important;
  padding:10px 12px!important;
  border:1px solid rgba(86,171,224,.18)!important;
  border-radius:18px!important;
  background:radial-gradient(circle at 0% 50%,rgba(46,220,210,.055),transparent 34%),linear-gradient(145deg,rgba(12,25,39,.985),rgba(18,34,56,.985))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.028),0 8px 20px rgba(0,0,0,.10)!important;
  overflow:visible!important;
}
#windowContent.${ROOT_CLASS} .tf13067-copy{
  min-width:0!important;
  align-self:center!important;
}
#windowContent.${ROOT_CLASS} .tf13067-copy strong,
#windowContent.${ROOT_CLASS} .tf13067-copy b,
#windowContent.${ROOT_CLASS} .tf13067-copy h3,
#windowContent.${ROOT_CLASS} .tf13067-copy h4{
  color:#f4f8ff!important;
}
#windowContent.${ROOT_CLASS} .tf13067-task-icon{
  grid-column:1!important;
  grid-row:1!important;
  position:relative!important;
  left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;
  width:48px!important;
  height:48px!important;
  min-width:48px!important;
  min-height:48px!important;
  max-width:48px!important;
  max-height:48px!important;
  margin:0!important;
  display:grid!important;
  place-items:center!important;
  border-radius:14px!important;
  border:1px solid rgba(65,214,207,.18)!important;
  background:linear-gradient(145deg,rgba(14,55,68,.96),rgba(15,31,52,.98))!important;
  color:#55e6dc!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.03)!important;
  transform:none!important;
}
#windowContent.${ROOT_CLASS} .tf13067-task-icon svg,
#windowContent.${ROOT_CLASS} .tf13067-task-icon i{
  display:block!important;
  width:25px!important;
  height:25px!important;
  max-width:25px!important;
  max-height:25px!important;
  color:#55e5db!important;
  stroke:currentColor!important;
  fill:none!important;
  opacity:1!important;
  visibility:visible!important;
  filter:drop-shadow(0 0 5px rgba(85,229,219,.18))!important;
}
#windowContent.${ROOT_CLASS} .tf13067-original-check{
  display:none!important;
}
#windowContent.${ROOT_CLASS} .tf13067-check{
  grid-column:3!important;
  grid-row:1!important;
  justify-self:end!important;
  align-self:center!important;
  width:48px!important;
  height:48px!important;
  min-width:48px!important;
  min-height:48px!important;
  margin:0!important;
  padding:0!important;
  display:grid!important;
  place-items:center!important;
  border-radius:12px!important;
  border:1px solid rgba(75,220,210,.22)!important;
  background:rgba(12,31,49,.96)!important;
  color:transparent!important;
  font-size:27px!important;
  line-height:1!important;
  font-weight:950!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.03)!important;
  -webkit-tap-highlight-color:transparent!important;
}
#windowContent.${ROOT_CLASS} .tf13067-check.tf13067-done{
  background:linear-gradient(145deg,#61e9dd,#46cfd0)!important;
  border-color:#70eee3!important;
  color:#06151b!important;
  box-shadow:0 7px 18px rgba(41,215,201,.13),inset 0 1px 0 rgba(255,255,255,.25)!important;
}
#windowContent.${ROOT_CLASS} .tf13067-check:not(.tf13067-done)::before{
  content:'';
  width:20px;
  height:20px;
  border:2px solid rgba(116,155,186,.38);
  border-radius:6px;
}
#windowContent.${ROOT_CLASS} .tf13067-check.tf13067-done::before{content:'✓'}
#windowContent.${ROOT_CLASS} .tf13067-check:active{transform:scale(.97)!important}
@media(max-width:430px){
  #windowContent.${ROOT_CLASS} .tf13067-mission{grid-template-columns:46px minmax(0,1fr) 42px!important;column-gap:10px!important;padding:10px 11px!important;min-height:82px!important}
  #windowContent.${ROOT_CLASS} .tf13067-task-icon{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important;max-width:46px!important;max-height:46px!important}
  #windowContent.${ROOT_CLASS} .tf13067-check{width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important}
}
`;
  document.head.appendChild(s);
}

function routineName(content){
  const head=content.querySelector('.v85-routine-modal-copy h2,.v85-routine-modal-head h2,.window-header-main h2,h2');
  return norm(head&&head.textContent);
}
function titlesFor(content){
  const n=routineName(content);
  if(n.includes('SOCRATES'))return TITLES.SOCRATES;
  if(n.includes('MAQUIAVELO'))return TITLES.MAQUIAVELO;
  return null;
}
function findTitleNode(root,title){
  const target=norm(title);
  let best=null,bestLen=Infinity;
  for(const el of root.querySelectorAll('strong,b,h3,h4,p,span,div')){
    if(el.closest('.tf13067-check'))continue;
    const txt=norm(el.textContent);
    if(!txt||!txt.includes(target))continue;
    if(txt.includes('COMO COMPLETARLA'))continue;
    if(txt.length<bestLen){best=el;bestLen=txt.length}
  }
  return best;
}
function findMissionCard(titleNode,title,scroll){
  const target=norm(title);
  let node=titleNode,best=null;
  while(node&&node!==scroll&&node.parentElement){
    const txt=norm(node.textContent);
    if(txt.includes(target)&&!txt.includes('COMO COMPLETARLA')){
      const r=node.getBoundingClientRect();
      if(r.width>180&&r.height>=46&&r.height<=150)best=node;
    }
    node=node.parentElement;
  }
  return best||titleNode.parentElement;
}
function visualBoxForSvg(svg,card){
  let node=svg;
  while(node&&node!==card){
    const r=node.getBoundingClientRect();
    if(r.width>=30&&r.width<=82&&r.height>=30&&r.height<=82)return node;
    node=node.parentElement;
  }
  return null;
}
function findIcon(card,titleNode){
  const classNode=[...card.querySelectorAll('[class*="icon" i]')].find(el=>{
    if(el.contains(titleNode)||titleNode.contains(el))return false;
    const r=el.getBoundingClientRect();
    return r.width>=30&&r.width<=82&&r.height>=30&&r.height<=82;
  });
  if(classNode)return classNode;
  const svg=[...card.querySelectorAll('svg')].find(el=>!el.closest('.tf13067-check'));
  return svg?visualBoxForSvg(svg,card):null;
}
function findOriginalCheck(card,icon){
  const checked=card.querySelector('input[type="checkbox"]');
  if(checked){
    const label=checked.closest('label,button,[role="button"]');
    if(label&&label!==card)return label;
  }
  const candidates=[...card.querySelectorAll('button,[role="button"],span,i,div')];
  let best=null,bestArea=Infinity;
  for(const el of candidates){
    if(el===icon||icon&&icon.contains(el))continue;
    const txt=norm(el.textContent),cls=String(el.className||'').toLowerCase();
    if(!(txt==='✓'||txt==='✔'||/check|done|complete/.test(cls)))continue;
    const r=el.getBoundingClientRect(),area=r.width*r.height;
    if(r.width>0&&r.height>0&&r.width<=46&&r.height<=46&&area<bestArea){best=el;bestArea=area}
  }
  return best;
}
function isDone(card,original){
  if(card.querySelector('input[type="checkbox"]:checked'))return true;
  const cls=(String(card.className||'')+' '+String(original&&original.className||'')).toLowerCase();
  if(/completed|complete|done|checked|is-complete|is-done/.test(cls))return true;
  const aria=String((original&&original.getAttribute&&original.getAttribute('aria-checked'))||'').toLowerCase();
  if(aria==='true')return true;
  if(original&&/[✓✔]/.test(String(original.textContent||'')))return true;
  return false;
}
function findCopy(card,titleNode,icon,original){
  let node=titleNode;
  while(node&&node.parentElement!==card&&node.parentElement){
    const parent=node.parentElement;
    if(parent===icon||parent===original)break;
    const r=parent.getBoundingClientRect();
    if(r.width>80&&r.height>25&&r.height<110){node=parent;continue}
    break;
  }
  return node;
}
function activateOriginal(card,original){
  const input=card.querySelector('input[type="checkbox"]');
  if(input){input.click();return}
  if(original&&typeof original.click==='function'){original.click();return}
  const target=card.querySelector('button:not(.tf13067-check),[role="button"]:not(.tf13067-check)');
  if(target&&typeof target.click==='function')target.click();
}
function tagMission(card,titleNode){
  if(!card||card.dataset.tf13067Styled==='1')return;
  card.dataset.tf13067Styled='1';
  card.classList.add('tf13067-mission');
  const icon=findIcon(card,titleNode);
  const original=findOriginalCheck(card,icon);
  const copy=findCopy(card,titleNode,icon,original);
  if(icon)icon.classList.add('tf13067-task-icon');
  if(copy&&copy!==card)copy.classList.add('tf13067-copy');
  if(original&&original!==card)original.classList.add('tf13067-original-check');
  const check=document.createElement('button');
  check.type='button';
  check.className='tf13067-check';
  check.setAttribute('aria-label','Marcar misión');
  const update=()=>{
    const done=isDone(card,original);
    check.classList.toggle('tf13067-done',done);
    check.setAttribute('aria-pressed',done?'true':'false');
  };
  check.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    activateOriginal(card,original);
    requestAnimationFrame(update);
    setTimeout(update,80);
  });
  card.appendChild(check);
  update();
}
function clearOther(content){
  content.classList.remove(ROOT_CLASS);
}
function apply(){
  installStyle();
  const container=document.getElementById('windowContainer');
  const content=document.getElementById('windowContent');
  if(!container||!content||!container.classList.contains('open'))return;
  const titles=titlesFor(content);
  if(!titles){clearOther(content);return}
  const scroll=content.querySelector('.v97-routine-scroll');
  if(!scroll)return;
  content.classList.add(ROOT_CLASS);
  for(const title of titles){
    const titleNode=findTitleNode(scroll,title);
    if(!titleNode)continue;
    const card=findMissionCard(titleNode,title,scroll);
    tagMission(card,titleNode);
  }
  for(const card of content.querySelectorAll('.tf13067-mission')){
    const check=card.querySelector(':scope > .tf13067-check');
    if(check){
      const original=card.querySelector('.tf13067-original-check');
      const done=isDone(card,original);
      check.classList.toggle('tf13067-done',done);
      check.setAttribute('aria-pressed',done?'true':'false');
    }
  }
}
function schedule(){
  requestAnimationFrame(apply);
  setTimeout(apply,70);
  setTimeout(apply,220);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',e=>{
  if(e.target&&e.target.closest&&e.target.closest('.v69-routine-launch,.tf13067-mission,.window-close'))schedule();
},{capture:true,passive:true});
document.addEventListener('change',e=>{
  if(e.target&&e.target.closest&&e.target.closest('#windowContainer'))schedule();
},true);
})();
