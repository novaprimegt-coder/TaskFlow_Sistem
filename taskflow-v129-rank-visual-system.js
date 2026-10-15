(function(){
'use strict';
if(window.__tfV129RankVisualSystem)return;window.__tfV129RankVisualSystem=true;

const STYLE_ID='tfV129RankVisualSystemStyle';
const AD_SAFE=96;

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* V129 · Unificación visual solicitada. Solo modifica presentación/scroll de ventanas y rutinas. */

/* Marco exterior común: respeta el área inferior reservada y elimina huecos entre la ventana y ese límite. */
#windowContainer.window-container.open,
#tf503020Overlay.tf503020-overlay.open,
#tfProfileOverlay.tf-profile-overlay.open,
#tfManagerV117.tf119-modal.open,
.tf120-overlay.open{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:${AD_SAFE}px!important;
  left:0!important;
  width:100vw!important;
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  margin:0!important;
  padding:8px 8px 0!important;
  overflow:hidden!important;
  align-items:stretch!important;
  justify-content:center!important;
  background:#020711!important;
  backdrop-filter:none!important;
  box-sizing:border-box!important;
}
#windowContainer.window-container.open,
#tf503020Overlay.tf503020-overlay.open,
#tfProfileOverlay.tf-profile-overlay.open,
#tfManagerV117.tf119-modal.open,
.tf120-overlay.open{display:flex!important}

/* Panel principal común: misma presencia visual que Jerarquía de rango / 50-30-20. */
#windowContainer.window-container.open>#windowContent.window-content,
#tf503020Overlay.tf503020-overlay.open .tf503020-shell,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card,
#tfManagerV117.tf119-modal.open .tf119-sheet,
.tf120-overlay.open .tf120-card{
  position:relative!important;
  width:min(96vw,760px)!important;
  max-width:760px!important;
  height:100%!important;
  min-height:0!important;
  max-height:100%!important;
  margin:0 auto!important;
  border-radius:28px!important;
  border:1px solid rgba(155,143,255,.25)!important;
  background:
    radial-gradient(circle at 50% 0%,rgba(118,80,255,.08),transparent 30%),
    linear-gradient(180deg,#191a31 0%,#17182d 45%,#15172b 100%)!important;
  box-shadow:0 28px 72px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.025)!important;
  box-sizing:border-box!important;
}

/* Un único desplazamiento vertical por ventana cuando el panel no necesita una zona interna fija. */
#windowContainer.window-container.open>#windowContent.window-content,
#tf503020Overlay.tf503020-overlay.open .tf503020-shell,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card,
.tf120-overlay.open .tf120-card{
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior-y:contain!important;
  touch-action:pan-y!important;
  scroll-behavior:auto!important;
  scrollbar-width:thin!important;
  scrollbar-color:#22d9d1 transparent!important;
}
#windowContainer.window-container.open>#windowContent.window-content::-webkit-scrollbar,
#tf503020Overlay.tf503020-overlay.open .tf503020-shell::-webkit-scrollbar,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card::-webkit-scrollbar,
.tf120-overlay.open .tf120-card::-webkit-scrollbar{width:5px!important}
#windowContainer.window-container.open>#windowContent.window-content::-webkit-scrollbar-track,
#tf503020Overlay.tf503020-overlay.open .tf503020-shell::-webkit-scrollbar-track,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card::-webkit-scrollbar-track,
.tf120-overlay.open .tf120-card::-webkit-scrollbar-track{background:transparent!important}
#windowContainer.window-container.open>#windowContent.window-content::-webkit-scrollbar-thumb,
#tf503020Overlay.tf503020-overlay.open .tf503020-shell::-webkit-scrollbar-thumb,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card::-webkit-scrollbar-thumb,
.tf120-overlay.open .tf120-card::-webkit-scrollbar-thumb{background:#22d9d1!important;border-radius:999px!important}

/* Encabezado y cierre de las ventanas principales. */
#windowContainer.window-container.open .window-header-main{position:relative!important;z-index:3!important;flex:0 0 auto!important}
#windowContainer.window-container.open .window-header-main h2,
#windowContainer.window-container.open .window-header-main .window-title{
  background:linear-gradient(90deg,#55ded4 0%,#83d8b9 48%,#ff9a37 100%)!important;
  -webkit-background-clip:text!important;
  background-clip:text!important;
  -webkit-text-fill-color:transparent!important;
  color:transparent!important;
  font-weight:900!important;
  letter-spacing:-.02em!important;
}
#windowContainer.window-container.open .window-close,
#tf503020Overlay.tf503020-overlay.open .tf503020-close,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-close,
#tfManagerV117.tf119-modal.open .tf119-x,
.tf120-overlay.open .tf120-close{
  width:48px!important;
  height:48px!important;
  min-width:48px!important;
  min-height:48px!important;
  border-radius:17px!important;
  border:1px solid rgba(255,255,255,.11)!important;
  background:rgba(255,255,255,.045)!important;
  color:#fff!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
}

/* Rutinas: se elimina el centrado vertical heredado que generaba aire/huecos artificiales. */
#windowContainer.window-container.open.tf129-routine>#windowContent.window-content{
  display:block!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
}
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
#windowContainer.window-container.open .v94-mentalist-list,
#windowContainer.window-container.open .v69-routine-card,
#windowContainer.window-container.open .v69-routine-list,
#windowContainer.window-container.open .v85-sung-list,
#windowContainer.window-container.open .v83-legal-list,
#windowContainer.window-container.open .v96-mentalist-scroll>:last-child,
#windowContainer.window-container.open .v97-routine-scroll>:last-child,
#windowContainer.window-container.open .tasks-group:last-child,
#windowContainer.window-container.open .dashboard-card:last-child,
#windowContainer.window-container.open .form-stack:last-child{
  margin-bottom:0!important;
  padding-bottom:0!important;
}
#windowContainer.window-container.open.tf129-routine.mentalist-modal>#windowContent.window-content{
  background:
    radial-gradient(circle at 50% 0%,rgba(118,80,255,.10),transparent 30%),
    linear-gradient(180deg,#191a31 0%,#17182d 45%,#15172b 100%)!important;
}

/* Tienda, tareas, hábitos y formularios conservan su contenido; solo se evita desbordamiento/hueco final. */
#windowContainer.window-container.open .v79-store-shell,
#windowContainer.window-container.open .tasks-group,
#windowContainer.window-container.open .dashboard-card,
#windowContainer.window-container.open .form-stack,
#windowContainer.window-container.open .v27-subcategory-grid{
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

/* 50/30/20: scroll exterior único, sin espacio residual inferior. */
#tf503020Overlay.tf503020-overlay.open .tf503020-content{
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  overflow:visible!important;
  margin-bottom:0!important;
  padding-bottom:10px!important;
}
#tf503020Overlay.tf503020-overlay.open .tf503020-content>:last-child{margin-bottom:0!important}

/* Perfil: usa el mismo panel alto y el contenido comienza arriba, sin tarjeta flotante centrada. */
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card{padding-bottom:14px!important}
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-head{margin-bottom:14px!important}
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-note:last-child{margin-bottom:0!important}

/* Configuración de rutinas: panel completo, cabecera/pie estables y solo el listado desplaza. */
#tfManagerV117.tf119-modal.open .tf119-sheet{
  display:flex!important;
  flex-direction:column!important;
  overflow:hidden!important;
}
#tfManagerV117.tf119-modal.open .tf119-head,
#tfManagerV117.tf119-modal.open .tf119-footer{flex:0 0 auto!important}
#tfManagerV117.tf119-modal.open .tf119-scroll{
  flex:1 1 auto!important;
  min-height:0!important;
  max-height:none!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior-y:contain!important;
  touch-action:pan-y!important;
  scrollbar-width:thin!important;
  scrollbar-color:#22d9d1 transparent!important;
}
#tfManagerV117.tf119-modal.open .tf119-scroll::-webkit-scrollbar{width:5px!important}
#tfManagerV117.tf119-modal.open .tf119-scroll::-webkit-scrollbar-thumb{background:#22d9d1!important;border-radius:999px!important}
#tfManagerV117.tf119-modal.open .tf119-footer{margin-bottom:0!important;padding-bottom:12px!important}

/* Reinicio/eliminación: mismo marco, sin espacio exterior inferior y con scroll seguro si el contenido crece. */
.tf120-overlay.open .tf120-body>:last-child{margin-bottom:0!important}

/* Selector de iconos: respeta el mismo límite inferior para que no invada la zona reservada. */
body>.tf-icon-sheet.tf-v102-detached-open{
  top:8px!important;
  right:8px!important;
  bottom:${AD_SAFE}px!important;
  left:8px!important;
  width:auto!important;
  height:auto!important;
  max-width:none!important;
  max-height:none!important;
  margin:0!important;
  border-radius:28px!important;
  border:1px solid rgba(155,143,255,.25)!important;
  background:
    radial-gradient(circle at 50% 0%,rgba(118,80,255,.08),transparent 30%),
    linear-gradient(180deg,#191a31 0%,#17182d 45%,#15172b 100%)!important;
  box-shadow:0 28px 72px rgba(0,0,0,.48)!important;
  box-sizing:border-box!important;
}

@media(max-width:520px){
  #windowContainer.window-container.open,
  #tf503020Overlay.tf503020-overlay.open,
  #tfProfileOverlay.tf-profile-overlay.open,
  #tfManagerV117.tf119-modal.open,
  .tf120-overlay.open{padding:7px 7px 0!important}

  #windowContainer.window-container.open>#windowContent.window-content,
  #tf503020Overlay.tf503020-overlay.open .tf503020-shell,
  #tfProfileOverlay.tf-profile-overlay.open .tf-profile-card,
  #tfManagerV117.tf119-modal.open .tf119-sheet,
  .tf120-overlay.open .tf120-card{
    width:100%!important;
    max-width:100%!important;
    border-radius:26px!important;
  }

  #windowContainer.window-container.open .window-close,
  #tf503020Overlay.tf503020-overlay.open .tf503020-close,
  #tfProfileOverlay.tf-profile-overlay.open .tf-profile-close,
  #tfManagerV117.tf119-modal.open .tf119-x,
  .tf120-overlay.open .tf120-close{
    width:46px!important;
    height:46px!important;
    min-width:46px!important;
    min-height:46px!important;
  }

  body>.tf-icon-sheet.tf-v102-detached-open{
    top:7px!important;
    right:7px!important;
    bottom:${AD_SAFE}px!important;
    left:7px!important;
    border-radius:26px!important;
  }
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
  clearInline(container,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','display','align-items','justify-content','background','scroll-padding-bottom']);
  clearInline(content,['width','height','min-height','max-height','margin','margin-top','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','display','flex-direction','scroll-padding-bottom']);
  content.querySelectorAll('.v96-mentalist-scroll,.v97-routine-scroll').forEach(sc=>clearInline(sc,['height','min-height','max-height','margin','margin-top','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','flex','scroll-padding-bottom']));
}

function normalize503020(){
  const overlay=document.getElementById('tf503020Overlay');
  if(!overlay||!overlay.classList.contains('open'))return;
  clearInline(overlay,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','background','scroll-padding-bottom']);
  const shell=overlay.querySelector('.tf503020-shell');
  if(shell)clearInline(shell,['width','height','min-height','max-height','margin','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y']);
}

function normalizeCustomPanels(){
  const profile=document.getElementById('tfProfileOverlay');
  if(profile&&profile.classList.contains('open')){
    clearInline(profile,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','align-items','justify-content','background']);
    const card=profile.querySelector('.tf-profile-card');
    if(card)clearInline(card,['width','height','min-height','max-height','margin','margin-bottom','overflow','overflow-x','overflow-y']);
  }

  const manager=document.getElementById('tfManagerV117');
  if(manager&&manager.classList.contains('open')){
    clearInline(manager,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','align-items','justify-content','background']);
    const sheet=manager.querySelector('.tf119-sheet');
    if(sheet)clearInline(sheet,['width','height','min-height','max-height','margin','margin-bottom','overflow','overflow-x','overflow-y']);
  }

  document.querySelectorAll('.tf120-overlay.open').forEach(overlay=>{
    clearInline(overlay,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','align-items','justify-content','background']);
    const card=overlay.querySelector('.tf120-card');
    if(card)clearInline(card,['width','height','min-height','max-height','margin','margin-bottom','overflow','overflow-x','overflow-y']);
  });
}

function apply(){
  installStyle();
  normalizeWindow();
  normalize503020();
  normalizeCustomPanels();
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    apply();
    setTimeout(apply,70);
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',schedule,{capture:true,passive:true});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
})();
