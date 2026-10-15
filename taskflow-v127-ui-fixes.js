(function(){
'use strict';
if(window.__tfV128TargetedLayout)return;window.__tfV128TargetedLayout=true;

const STYLE_ID='tfV128TargetedLayoutStyle';
const AD_SAFE=96;

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* V128 · SOLO áreas solicitadas: tienda, rutinas, listas y creación de tareas/hábitos. */

/* 1) TIENDA: sin hueco final; el anuncio queda fuera del área útil. */
#windowContainer.tf128-store.open{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:${AD_SAFE}px!important;
  left:0!important;
  width:100vw!important;
  height:auto!important;
  max-height:none!important;
  padding:0!important;
  overflow:hidden!important;
  background:#050914!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-store.open>#windowContent.window-content.store-mode.v79-store-mode{
  width:min(96vw,760px)!important;
  max-width:760px!important;
  height:100%!important;
  min-height:0!important;
  max-height:100%!important;
  margin:0 auto!important;
  padding:6px 10px 8px!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  touch-action:pan-y!important;
  overscroll-behavior-y:contain!important;
  scroll-padding-bottom:8px!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-store .v79-store-shell{
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  margin:0!important;
  padding-bottom:0!important;
}
#windowContainer.tf128-store .v79-store-shell>:last-child,
#windowContainer.tf128-store .v79-store-rule:last-child{
  margin-bottom:0!important;
  padding-bottom:0!important;
}

/* 2-6) RUTINAS PREDETERMINADAS: centradas verticalmente con espacio equivalente arriba/abajo. */
#windowContainer.tf128-routine.open{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:${AD_SAFE}px!important;
  left:0!important;
  width:100vw!important;
  height:auto!important;
  max-height:none!important;
  padding:8px 6px!important;
  overflow:hidden!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  background:#050914!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-routine.open>#windowContent{
  width:min(96vw,760px)!important;
  max-width:760px!important;
  height:auto!important;
  min-height:0!important;
  max-height:calc(100dvh - ${AD_SAFE + 16}px)!important;
  margin:0 auto!important;
  padding-bottom:0!important;
  overflow:hidden!important;
  display:flex!important;
  flex-direction:column!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-routine .v85-routine-modal-head{
  flex:0 0 auto!important;
}
#windowContainer.tf128-routine .v96-mentalist-scroll,
#windowContainer.tf128-routine .v97-routine-scroll{
  flex:0 1 auto!important;
  height:auto!important;
  min-height:0!important;
  max-height:calc(100dvh - ${AD_SAFE + 100}px)!important;
  margin-bottom:0!important;
  padding-bottom:0!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  touch-action:pan-y!important;
  overscroll-behavior-y:contain!important;
  scroll-padding-bottom:0!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-routine .v96-mentalist-scroll>:last-child,
#windowContainer.tf128-routine .v97-routine-scroll>:last-child,
#windowContainer.tf128-routine .v94-mentalist-list,
#windowContainer.tf128-routine .v69-routine-card,
#windowContainer.tf128-routine .v69-routine-list,
#windowContainer.tf128-routine .v85-sung-list,
#windowContainer.tf128-routine .v83-legal-list{
  margin-bottom:0!important;
  padding-bottom:0!important;
}

/* 7) ÁREAS DE LISTADO TAREAS/HÁBITOS/CATEGORÍAS: pantalla integrada, no tarjeta flotante. */
#windowContainer.tf128-workspace.open{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:${AD_SAFE}px!important;
  left:0!important;
  width:100vw!important;
  height:auto!important;
  max-height:none!important;
  padding:0!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  touch-action:pan-y!important;
  overscroll-behavior-y:contain!important;
  background:var(--bg-tertiary)!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-workspace.open>#windowContent{
  width:100%!important;
  max-width:none!important;
  min-height:100%!important;
  height:auto!important;
  max-height:none!important;
  margin:0!important;
  padding:12px 14px 12px!important;
  overflow:visible!important;
  border:0!important;
  border-radius:0!important;
  box-shadow:none!important;
  background:var(--bg-tertiary)!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-workspace #windowContent>:last-child{
  margin-bottom:0!important;
}

/* 8) CREAR TAREA / CREAR HÁBITO: mismo acabado integrado, sin hueco inferior. */
#windowContainer.tf128-create.open{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:${AD_SAFE}px!important;
  left:0!important;
  width:100vw!important;
  height:auto!important;
  max-height:none!important;
  padding:0!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  touch-action:pan-y!important;
  overscroll-behavior-y:contain!important;
  background:var(--bg-tertiary)!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-create.open>#windowContent{
  width:100%!important;
  max-width:none!important;
  min-height:100%!important;
  height:auto!important;
  max-height:none!important;
  margin:0!important;
  padding:14px!important;
  overflow:visible!important;
  border:0!important;
  border-radius:0!important;
  box-shadow:none!important;
  background:var(--bg-tertiary)!important;
  box-sizing:border-box!important;
}
#windowContainer.tf128-create .form-stack{
  margin-bottom:0!important;
  padding-bottom:0!important;
}
#windowContainer.tf128-create .form-stack>:last-child,
#windowContainer.tf128-create .form-actions:last-child{
  margin-bottom:0!important;
  padding-bottom:0!important;
}

@media(max-width:520px){
  #windowContainer.tf128-routine.open{padding:6px 5px!important}
  #windowContainer.tf128-routine.open>#windowContent{width:97vw!important;max-height:calc(100dvh - ${AD_SAFE + 12}px)!important}
  #windowContainer.tf128-routine .v96-mentalist-scroll,
  #windowContainer.tf128-routine .v97-routine-scroll{max-height:calc(100dvh - ${AD_SAFE + 92}px)!important}
  #windowContainer.tf128-store.open>#windowContent.window-content.store-mode.v79-store-mode{width:97vw!important;padding-left:8px!important;padding-right:8px!important}
  #windowContainer.tf128-workspace.open>#windowContent,
  #windowContainer.tf128-create.open>#windowContent{padding-left:11px!important;padding-right:11px!important}
}
`;
  document.head.appendChild(s);
}

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function lower(el){return text(el).toLowerCase();}
function removeClasses(el){
  if(!el)return;
  el.classList.remove('tf128-store','tf128-routine','tf128-workspace','tf128-create');
}
function clearOldLayoutClasses(overlay,content){
  if(!overlay||!content)return;
  overlay.classList.remove('tf126-routine-overlay','tf127-routine-modal','tf127-store-modal','tf127-habits-modal');
  content.classList.remove('tf126-routine-content','tf127-routine-content');
}
function clearInlineLayout(el){
  if(!el)return;
  ['top','right','bottom','left','inset','width','height','min-height','max-height','margin','margin-top','margin-bottom','padding','padding-bottom','scroll-padding-bottom','overflow','overflow-y','overflow-x','display','align-items','justify-content','flex-direction','flex'].forEach(p=>{try{el.style.removeProperty(p)}catch(_){}});
}

function identifyHeading(content){
  const h=content.querySelector(':scope > .window-header-main h2');
  return lower(h);
}

function applyStore(overlay,content){
  overlay.classList.add('tf128-store');
  clearInlineLayout(overlay);clearInlineLayout(content);
  overlay.style.setProperty('bottom',AD_SAFE+'px','important');
  overlay.style.setProperty('overflow','hidden','important');
  const shell=content.querySelector('.v79-store-shell');
  if(shell){shell.style.setProperty('margin-bottom','0','important');shell.style.setProperty('padding-bottom','0','important');}
}

function renameMentalist(content){
  const h=content.querySelector('.v85-routine-modal-copy h2');
  if(h&&/mentalista\s+forense/i.test(text(h)))h.textContent='Mentalista';
}

function applyRoutine(overlay,content){
  overlay.classList.add('tf128-routine');
  clearInlineLayout(overlay);clearInlineLayout(content);
  overlay.style.setProperty('bottom',AD_SAFE+'px','important');
  renameMentalist(content);
  content.querySelectorAll('.v96-mentalist-scroll,.v97-routine-scroll').forEach(sc=>{
    clearInlineLayout(sc);
    sc.style.setProperty('margin-bottom','0','important');
    sc.style.setProperty('padding-bottom','0','important');
  });
}

function applyWorkspace(overlay,content){
  overlay.classList.add('tf128-workspace');
  clearInlineLayout(overlay);clearInlineLayout(content);
  overlay.style.setProperty('bottom',AD_SAFE+'px','important');
}

function applyCreate(overlay,content){
  overlay.classList.add('tf128-create');
  clearInlineLayout(overlay);clearInlineLayout(content);
  overlay.style.setProperty('bottom',AD_SAFE+'px','important');
}

function classify(){
  installStyle();
  const overlay=document.getElementById('windowContainer');
  const content=document.getElementById('windowContent');
  if(!overlay||!content)return;

  removeClasses(overlay);
  clearOldLayoutClasses(overlay,content);
  if(!overlay.classList.contains('open'))return;

  const heading=identifyHeading(content);
  const isStore=overlay.classList.contains('store-modal')||!!content.querySelector('.v79-store-shell');
  const routineScroll=content.querySelector('.v96-mentalist-scroll,.v97-routine-scroll');
  const isRoutine=!!routineScroll;
  const isCreate=heading==='nuevo hábito'||heading==='nuevo habito'||heading==='nueva tarea';
  const isListHeading=['tareas activas','tareas completadas','hábitos activos','habitos activos','hábitos completados','habitos completados'].includes(heading);
  const hasWorkspaceHeader=!!content.querySelector(':scope > .v27-window-head');

  if(isStore){applyStore(overlay,content);return;}
  if(isRoutine){applyRoutine(overlay,content);return;}
  if(isCreate){applyCreate(overlay,content);return;}
  if(isListHeading||hasWorkspaceHeader){applyWorkspace(overlay,content);return;}
}

function schedule(){
  requestAnimationFrame(classify);
  setTimeout(classify,40);
  setTimeout(classify,130);
  setTimeout(classify,280);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',schedule,{capture:true,passive:true});
window.addEventListener('resize',schedule,{passive:true});
})();
