(function(){
'use strict';
if(window.__tfV130UnifiedLayout)return;window.__tfV130UnifiedLayout=true;

const STYLE_ID='tfV130UnifiedLayoutStyle';

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* V130 · Refuerzo visual de funciones y rutinas sobre V129. No cambia lógica ni datos. */

/* Neutraliza layouts heredados que podían reintroducir centrado, alto automático o huecos. */
#windowContainer.window-container.open.tf128-routine,
#windowContainer.window-container.open.tf128-workspace,
#windowContainer.window-container.open.tf128-create,
#windowContainer.window-container.open.tf128-store,
#windowContainer.window-container.open.tf129-routine{
  align-items:stretch!important;
  padding-bottom:0!important;
}
#windowContainer.window-container.open.tf128-routine>#windowContent.window-content,
#windowContainer.window-container.open.tf128-workspace>#windowContent.window-content,
#windowContainer.window-container.open.tf128-create>#windowContent.window-content,
#windowContainer.window-container.open.tf128-store>#windowContent.window-content,
#windowContainer.window-container.open.tf129-routine>#windowContent.window-content{
  display:block!important;
  min-height:0!important;
  height:100%!important;
  max-height:100%!important;
  margin:0 auto!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
}

/* Todas las rutinas usan el scroll exterior del panel y comienzan arriba, sin aire artificial. */
#windowContainer.window-container.open .v96-mentalist-scroll,
#windowContainer.window-container.open .v97-routine-scroll{
  width:100%!important;
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  margin-top:0!important;
  margin-bottom:0!important;
  padding-bottom:0!important;
  overflow:visible!important;
  overflow-x:visible!important;
  overflow-y:visible!important;
  flex:none!important;
  scroll-padding-bottom:0!important;
  box-sizing:border-box!important;
}
#windowContainer.window-container.open .v85-routine-modal-head{margin-top:0!important}
#windowContainer.window-container.open .v94-mentalist-list,
#windowContainer.window-container.open .v69-routine-card,
#windowContainer.window-container.open .v69-routine-list,
#windowContainer.window-container.open .v85-sung-list,
#windowContainer.window-container.open .v83-legal-list,
#windowContainer.window-container.open .v96-mentalist-scroll>:last-child,
#windowContainer.window-container.open .v97-routine-scroll>:last-child{
  margin-bottom:0!important;
  padding-bottom:0!important;
}

/* Funciones y formularios: contenido contenido al ancho del panel y final sin espacio residual. */
#windowContainer.window-container.open .v79-store-shell,
#windowContainer.window-container.open .tasks-group,
#windowContainer.window-container.open .dashboard-card,
#windowContainer.window-container.open .dashboard-grid,
#windowContainer.window-container.open .form-stack,
#windowContainer.window-container.open .v27-subcategory-grid,
#windowContainer.window-container.open .items-list{
  max-width:100%!important;
  box-sizing:border-box!important;
}
#windowContainer.window-container.open .v79-store-shell{
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  margin-bottom:0!important;
  padding-bottom:0!important;
}
#windowContainer.window-container.open>#windowContent.window-content>:last-child,
#windowContainer.window-container.open .tasks-group:last-child,
#windowContainer.window-container.open .dashboard-card:last-child,
#windowContainer.window-container.open .dashboard-grid:last-child,
#windowContainer.window-container.open .form-stack:last-child,
#windowContainer.window-container.open .items-list:last-child{
  margin-bottom:0!important;
}

/* 50/30/20, perfil, gestor de rutinas y reinicio/eliminación: elimina solo el margen final sobrante. */
#tf503020Overlay.tf503020-overlay.open .tf503020-content>:last-child,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-note:last-child,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-message:last-child,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-userbox:last-child,
#tfManagerV117.tf119-modal.open .tf119-footer:last-child,
.tf120-overlay.open .tf120-body>:last-child{
  margin-bottom:0!important;
}

@media(max-width:520px){
  #windowContainer.window-container.open.tf128-routine,
  #windowContainer.window-container.open.tf128-workspace,
  #windowContainer.window-container.open.tf128-create,
  #windowContainer.window-container.open.tf128-store,
  #windowContainer.window-container.open.tf129-routine{padding-bottom:0!important}
}
`;
  document.head.appendChild(s);
}

function clearInline(el,props){
  if(!el)return;
  props.forEach(p=>{try{el.style.removeProperty(p)}catch(_){}});
}

function normalizeWindow(){
  const container=document.getElementById('windowContainer');
  const content=document.getElementById('windowContent');
  if(!container||!content||!container.classList.contains('open'))return;

  clearInline(content,['height','min-height','max-height','margin','margin-top','margin-bottom','overflow','overflow-x','overflow-y','display','flex-direction','align-items','justify-content','scroll-padding-bottom']);
  content.querySelectorAll('.v96-mentalist-scroll,.v97-routine-scroll').forEach(sc=>{
    clearInline(sc,['height','min-height','max-height','margin','margin-top','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','flex','scroll-padding-bottom']);
  });
}

function normalizeEnds(){
  const fifty=document.getElementById('tf503020Overlay');
  if(!fifty||!fifty.classList.contains('open'))return;
  const content=fifty.querySelector('.tf503020-content');
  if(content)clearInline(content,['height','min-height','max-height','margin-bottom','overflow','overflow-x','overflow-y']);
}

function apply(){
  installStyle();
  normalizeWindow();
  normalizeEnds();
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    apply();
    setTimeout(apply,80);
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',schedule,{capture:true,passive:true});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
})();
