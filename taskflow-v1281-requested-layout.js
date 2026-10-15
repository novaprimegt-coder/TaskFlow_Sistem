(function(){
'use strict';
if(window.__tfV1281RequestedLayout)return;window.__tfV1281RequestedLayout=true;

const STYLE_ID='tfV1281RequestedLayoutStyle';
const AD_SAFE=96;

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* SOLO UNIFICACIÓN VISUAL DE VENTANAS AL ESTILO "JERARQUÍA DE RANGO". */

#windowContainer.window-container.open{
  position:fixed!important;
  top:0!important;
  right:0!important;
  bottom:${AD_SAFE}px!important;
  left:0!important;
  width:100vw!important;
  height:auto!important;
  max-height:none!important;
  padding:8px 8px 0!important;
  margin:0!important;
  overflow:hidden!important;
  display:flex!important;
  align-items:stretch!important;
  justify-content:center!important;
  background:#020711!important;
  backdrop-filter:none!important;
  box-sizing:border-box!important;
}
#windowContainer.window-container.open>#windowContent.window-content{
  position:relative!important;
  width:min(96vw,760px)!important;
  max-width:760px!important;
  height:100%!important;
  min-height:0!important;
  max-height:100%!important;
  margin:0 auto!important;
  border-radius:28px!important;
  border:1px solid rgba(155,143,255,.25)!important;
  background:radial-gradient(circle at 50% 0%,rgba(118,80,255,.08),transparent 30%),linear-gradient(180deg,#191a31 0%,#17182d 45%,#15172b 100%)!important;
  box-shadow:0 28px 72px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.025)!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior-y:contain!important;
  touch-action:pan-y!important;
  scroll-behavior:auto!important;
  scrollbar-width:thin!important;
  scrollbar-color:#22d9d1 transparent!important;
  box-sizing:border-box!important;
}
#windowContainer.window-container.open>#windowContent.window-content::-webkit-scrollbar{width:5px!important}
#windowContainer.window-container.open>#windowContent.window-content::-webkit-scrollbar-track{background:transparent!important}
#windowContainer.window-container.open>#windowContent.window-content::-webkit-scrollbar-thumb{background:#22d9d1!important;border-radius:999px!important}

#windowContainer.window-container.open .window-header-main{position:relative!important;z-index:3!important;flex:0 0 auto!important}
#windowContainer.window-container.open .window-header-main h2,#windowContainer.window-container.open .window-header-main .window-title{background:linear-gradient(90deg,#55ded4 0%,#83d8b9 48%,#ff9a37 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;color:transparent!important;font-weight:900!important;letter-spacing:-.02em!important}
#windowContainer.window-container.open .window-close{width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;border-radius:17px!important;border:1px solid rgba(255,255,255,.11)!important;background:rgba(255,255,255,.045)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important}

#windowContainer.window-container.open .v96-mentalist-scroll,#windowContainer.window-container.open .v97-routine-scroll{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;overflow-x:visible!important;overflow-y:visible!important;flex:none!important;padding-bottom:0!important;scroll-padding-bottom:0!important;box-sizing:border-box!important}
#windowContainer.window-container.open .v94-mentalist-list,#windowContainer.window-container.open .v69-routine-card,#windowContainer.window-container.open .v69-routine-list,#windowContainer.window-container.open .v85-sung-list,#windowContainer.window-container.open .v83-legal-list{margin-bottom:0!important;padding-bottom:0!important}
#windowContainer.window-container.open .v96-mentalist-scroll>:last-child,#windowContainer.window-container.open .v97-routine-scroll>:last-child,#windowContainer.window-container.open .tasks-group:last-child,#windowContainer.window-container.open .dashboard-card:last-child,#windowContainer.window-container.open .form-stack:last-child{margin-bottom:0!important;padding-bottom:0!important}

#windowContainer.window-container.open.tf129-routine>#windowContent.window-content{display:flex!important;flex-direction:column!important;overflow-y:auto!important}
#windowContainer.window-container.open.tf129-routine .v85-routine-modal-head{flex:0 0 auto!important}
#windowContainer.window-container.open.tf129-routine .v96-mentalist-scroll,#windowContainer.window-container.open.tf129-routine .v97-routine-scroll{margin-top:auto!important;margin-bottom:auto!important;width:100%!important}
#windowContainer.window-container.open.tf129-routine.mentalist-modal>#windowContent.window-content{background:radial-gradient(circle at 50% 0%,rgba(118,80,255,.10),transparent 30%),linear-gradient(180deg,#191a31 0%,#17182d 45%,#15172b 100%)!important}

#windowContainer.window-container.open .v79-store-shell,#windowContainer.window-container.open .tasks-group,#windowContainer.window-container.open .dashboard-card,#windowContainer.window-container.open .form-stack,#windowContainer.window-container.open .v27-subcategory-grid{max-width:100%!important;box-sizing:border-box!important}
#windowContainer.window-container.open .v79-store-shell{min-height:0!important;height:auto!important;max-height:none!important;margin-bottom:0!important;padding-bottom:0!important}

#tf503020Overlay.tf503020-overlay.open{position:fixed!important;top:0!important;right:0!important;bottom:${AD_SAFE}px!important;left:0!important;width:100vw!important;height:auto!important;max-height:none!important;padding:8px 8px 0!important;margin:0!important;overflow:hidden!important;display:flex!important;align-items:stretch!important;justify-content:center!important;background:#020711!important;box-sizing:border-box!important}
#tf503020Overlay.tf503020-overlay.open .tf503020-shell{width:min(96vw,760px)!important;max-width:760px!important;height:100%!important;min-height:0!important;max-height:100%!important;margin:0 auto!important;border-radius:28px!important;border:1px solid rgba(155,143,255,.25)!important;background:radial-gradient(circle at 50% 0%,rgba(118,80,255,.08),transparent 30%),linear-gradient(180deg,#191a31 0%,#17182d 45%,#15172b 100%)!important;box-shadow:0 28px 72px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.025)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;scrollbar-width:thin!important;scrollbar-color:#22d9d1 transparent!important;padding-bottom:0!important;box-sizing:border-box!important}
#tf503020Overlay.tf503020-overlay.open .tf503020-shell::-webkit-scrollbar{width:5px!important}
#tf503020Overlay.tf503020-overlay.open .tf503020-shell::-webkit-scrollbar-thumb{background:#22d9d1!important;border-radius:999px!important}
#tf503020Overlay.tf503020-overlay.open .tf503020-content{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;margin-bottom:0!important;padding-bottom:10px!important}
#tf503020Overlay.tf503020-overlay.open .tf503020-content>:last-child{margin-bottom:0!important}

@media(max-width:520px){#windowContainer.window-container.open,#tf503020Overlay.tf503020-overlay.open{padding:7px 7px 0!important}#windowContainer.window-container.open>#windowContent.window-content,#tf503020Overlay.tf503020-overlay.open .tf503020-shell{width:100%!important;max-width:100%!important;border-radius:26px!important}#windowContainer.window-container.open .window-close{width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}}
`;
  document.head.appendChild(s);
}

function clearInline(el,props){if(!el)return;props.forEach(p=>{try{el.style.removeProperty(p)}catch(_){}});}
function cleanLayout(container,content){if(!container||!content)return;clearInline(container,['inset','top','right','bottom','left','width','height','max-height','min-height','padding','padding-bottom','margin','overflow','overflow-x','overflow-y','display','align-items','justify-content','background','scroll-padding-bottom']);clearInline(content,['width','height','max-height','min-height','margin','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','display','flex-direction','scroll-padding-bottom']);content.querySelectorAll('.v96-mentalist-scroll,.v97-routine-scroll').forEach(sc=>clearInline(sc,['height','max-height','min-height','margin','margin-top','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','flex','scroll-padding-bottom']));}
function normalizeMentalista(root){(root||document).querySelectorAll('h1,h2,h3,strong,.v85-routine-modal-copy h2,.v94-mentalist-head h3,.v94-mentalist-copy strong').forEach(el=>{if(/^\s*mentalista\s+forense\s*$/i.test(el.textContent||''))el.textContent='Mentalista';});}
function apply(){installStyle();const container=document.getElementById('windowContainer');const content=document.getElementById('windowContent');if(container&&content){container.classList.remove('tf129-routine');normalizeMentalista(content);if(container.classList.contains('open')){cleanLayout(container,content);if(content.querySelector('.v96-mentalist-scroll,.v97-routine-scroll'))container.classList.add('tf129-routine');}}const fifty=document.getElementById('tf503020Overlay');if(fifty&&fifty.classList.contains('open')){clearInline(fifty,['inset','top','right','bottom','left','width','height','max-height','min-height','padding','padding-bottom','margin','overflow','overflow-x','overflow-y','background','scroll-padding-bottom']);const shell=fifty.querySelector('.tf503020-shell');if(shell)clearInline(shell,['width','height','max-height','min-height','margin','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y']);}}
function schedule(){requestAnimationFrame(apply);setTimeout(apply,60);setTimeout(apply,180);setTimeout(apply,360);setTimeout(apply,700);setTimeout(apply,1100);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();document.addEventListener('click',schedule,{capture:true,passive:true});window.addEventListener('resize',schedule,{passive:true});
})();
