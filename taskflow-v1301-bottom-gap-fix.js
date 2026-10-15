(function(){
'use strict';
if(window.__tfV1301BottomGapFix)return;window.__tfV1301BottomGapFix=true;
const ID='tfV1301BottomGapFixStyle';
function style(){
 if(document.getElementById(ID))return;
 const s=document.createElement('style');s.id=ID;s.textContent=`
/* V130.1 · solo elimina el hueco inferior de ventanas/rutinas. */
#windowContainer.window-container.open,
#tf503020Overlay.tf503020-overlay.open,
#tfProfileOverlay.tf-profile-overlay.open,
#tfManagerV117.tf119-modal.open,
.tf120-overlay.open{
 position:fixed!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;
 width:100vw!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;
 margin:0!important;padding:8px 8px 0!important;overflow:hidden!important;align-items:stretch!important;justify-content:center!important;
 box-sizing:border-box!important;background:#020711!important;
}
#windowContainer.window-container.open>#windowContent.window-content,
#tf503020Overlay.tf503020-overlay.open .tf503020-shell,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card,
#tfManagerV117.tf119-modal.open .tf119-sheet,
.tf120-overlay.open .tf120-card{
 width:min(96vw,760px)!important;max-width:760px!important;height:100%!important;min-height:100%!important;max-height:100%!important;
 margin:0 auto!important;box-sizing:border-box!important;
}
#windowContainer.window-container.open>#windowContent.window-content,
#tf503020Overlay.tf503020-overlay.open .tf503020-shell,
#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card,
.tf120-overlay.open .tf120-card{
 overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;
}
#windowContainer.window-container.open.tf129-routine .v96-mentalist-scroll,
#windowContainer.window-container.open.tf129-routine .v97-routine-scroll,
#windowContainer.window-container.open.tf128-routine .v96-mentalist-scroll,
#windowContainer.window-container.open.tf128-routine .v97-routine-scroll,
#windowContainer.window-container.open .v96-mentalist-scroll,
#windowContainer.window-container.open .v97-routine-scroll{
 width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin-top:0!important;margin-bottom:0!important;
 padding-bottom:0!important;overflow:visible!important;overflow-x:visible!important;overflow-y:visible!important;flex:none!important;scroll-padding-bottom:0!important;box-sizing:border-box!important;
}
#windowContainer.window-container.open.tf129-routine>#windowContent.window-content,
#windowContainer.window-container.open.tf128-routine>#windowContent.window-content{
 display:block!important;height:100%!important;min-height:100%!important;max-height:100%!important;margin:0 auto!important;overflow-y:auto!important;overflow-x:hidden!important;
}
#windowContainer.window-container.open .v96-mentalist-scroll>:last-child,
#windowContainer.window-container.open .v97-routine-scroll>:last-child,
#windowContainer.window-container.open .v94-mentalist-list,
#windowContainer.window-container.open .v69-routine-card,
#windowContainer.window-container.open .v69-routine-list,
#windowContainer.window-container.open .v85-sung-list,
#windowContainer.window-container.open .v83-legal-list,
#windowContainer.window-container.open .v79-store-shell,
#tf503020Overlay.tf503020-overlay.open .tf503020-content>:last-child{margin-bottom:0!important;padding-bottom:0!important}
#tf503020Overlay.tf503020-overlay.open .tf503020-content{height:auto!important;min-height:0!important;max-height:none!important;margin-bottom:0!important;overflow:visible!important}
@media(max-width:520px){
 #windowContainer.window-container.open,#tf503020Overlay.tf503020-overlay.open,#tfProfileOverlay.tf-profile-overlay.open,#tfManagerV117.tf119-modal.open,.tf120-overlay.open{
  inset:0!important;bottom:0!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;padding:7px 7px 0!important
 }
 #windowContainer.window-container.open>#windowContent.window-content,#tf503020Overlay.tf503020-overlay.open .tf503020-shell,#tfProfileOverlay.tf-profile-overlay.open .tf-profile-card,#tfManagerV117.tf119-modal.open .tf119-sheet,.tf120-overlay.open .tf120-card{
  width:100%!important;max-width:100%!important;height:100%!important;min-height:100%!important;max-height:100%!important
 }
}`;document.head.appendChild(s);
}
function clear(el,props){if(!el)return;props.forEach(p=>{try{el.style.removeProperty(p)}catch(_){}})}
function apply(){
 style();
 const pairs=[
  [document.getElementById('windowContainer'),document.getElementById('windowContent')],
  [document.getElementById('tf503020Overlay'),document.querySelector('#tf503020Overlay .tf503020-shell')],
  [document.getElementById('tfProfileOverlay'),document.querySelector('#tfProfileOverlay .tf-profile-card')],
  [document.getElementById('tfManagerV117'),document.querySelector('#tfManagerV117 .tf119-sheet')]
 ];
 pairs.forEach(([o,p])=>{if(!o||!o.classList.contains('open'))return;clear(o,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','align-items','justify-content','background','scroll-padding-bottom']);clear(p,['width','height','min-height','max-height','margin','margin-top','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','display','flex-direction','scroll-padding-bottom'])});
 document.querySelectorAll('#windowContent .v96-mentalist-scroll,#windowContent .v97-routine-scroll').forEach(sc=>clear(sc,['height','min-height','max-height','margin','margin-top','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','flex','scroll-padding-bottom']));
 document.querySelectorAll('.tf120-overlay.open').forEach(o=>{clear(o,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','align-items','justify-content','background']);clear(o.querySelector('.tf120-card'),['width','height','min-height','max-height','margin','margin-bottom','overflow','overflow-x','overflow-y'])});
}
function schedule(){requestAnimationFrame(apply);setTimeout(apply,380);setTimeout(apply,1160)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',schedule,{capture:true,passive:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});
})();
