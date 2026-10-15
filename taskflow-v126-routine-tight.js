(function(){
'use strict';
if(window.__tfV126RoutineTight)return;window.__tfV126RoutineTight=true;

const STYLE_ID='tfV126RoutineTightStyle';
const ROUTINE_SCROLL='.v96-mentalist-scroll,.v97-routine-scroll';
const AD_SAFE=42;

function installStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
/* Rutinas predeterminadas: Sung Jin-Woo, Dominio Jurídico, Sócrates, Maquiavelo y Mentalista */
.v96-mentalist-scroll,.v97-routine-scroll{
 min-height:0!important;
 margin-bottom:0!important;
 padding-bottom:4px!important;
 overflow-y:auto!important;
 overflow-x:hidden!important;
 -webkit-overflow-scrolling:touch!important;
 overscroll-behavior-y:contain!important;
 touch-action:pan-y!important;
 align-content:start!important;
 box-sizing:border-box!important;
}
.v96-mentalist-scroll>:last-child,.v97-routine-scroll>:last-child{margin-bottom:0!important;padding-bottom:0!important}
.v94-mentalist-list{margin-bottom:0!important;padding-bottom:0!important}
.v69-routine-card,.v69-routine-list,.v85-sung-list,.v83-legal-list{margin-bottom:0!important}

/* El diálogo usa todo el alto útil y no reserva un bloque vacío debajo. */
.tf126-routine-overlay{
 top:0!important;
 bottom:${AD_SAFE}px!important;
 height:auto!important;
 max-height:none!important;
 padding-bottom:0!important;
 scroll-padding-bottom:0!important;
 align-items:flex-start!important;
 box-sizing:border-box!important;
}
.tf126-routine-content{
 margin-bottom:0!important;
 padding-bottom:0!important;
 min-height:0!important;
 height:calc(100dvh - ${AD_SAFE + 8}px)!important;
 max-height:calc(100dvh - ${AD_SAFE + 8}px)!important;
 box-sizing:border-box!important;
 overflow:hidden!important;
 display:flex!important;
 flex-direction:column!important;
}
.tf126-routine-content .v85-routine-modal-head{flex:0 0 auto!important}
.tf126-routine-content .v96-mentalist-scroll,
.tf126-routine-content .v97-routine-scroll{
 flex:1 1 auto!important;
 height:auto!important;
 max-height:none!important;
 min-height:0!important;
}

/* 50/30/20: ocupa toda la pantalla para que nunca se vea el contenido de TaskFlow por debajo. */
#tf503020Overlay.tf503020-overlay.open{
 inset:0!important;
 top:0!important;
 right:0!important;
 bottom:0!important;
 left:0!important;
 width:100vw!important;
 min-height:100dvh!important;
 height:100dvh!important;
 max-height:100dvh!important;
 overflow-y:auto!important;
 overflow-x:hidden!important;
 -webkit-overflow-scrolling:touch!important;
 touch-action:pan-y!important;
 overscroll-behavior-y:contain!important;
 padding-bottom:0!important;
 scroll-padding-bottom:0!important;
 box-sizing:border-box!important;
 background:#050914!important;
 backdrop-filter:none!important;
 isolation:isolate!important;
}
#tf503020Overlay .tf503020-shell{
 height:auto!important;
 min-height:0!important;
 max-height:none!important;
 margin-bottom:0!important;
}
#tf503020Overlay .tf503020-content{
 height:auto!important;
 min-height:0!important;
 margin-bottom:0!important;
 padding-bottom:6px!important;
}
#tf503020Overlay .tf503020-content>:last-child{margin-bottom:0!important;padding-bottom:0!important}

@media(max-width:680px){
 .tf126-routine-overlay{bottom:${AD_SAFE}px!important}
 .tf126-routine-content{height:calc(100dvh - ${AD_SAFE + 4}px)!important;max-height:calc(100dvh - ${AD_SAFE + 4}px)!important}
 #tf503020Overlay.tf503020-overlay.open{inset:0!important;bottom:0!important;height:100dvh!important;max-height:100dvh!important}
}
`;
 document.head.appendChild(s);
}

function tag(scroll){
 const overlay=scroll.closest('.window-container,.mentalist-modal,.routine-modal');
 if(overlay)overlay.classList.add('tf126-routine-overlay');
 const content=scroll.closest('.window-content');
 if(content)content.classList.add('tf126-routine-content');
 return overlay;
}

function compactOne(scroll){
 if(!scroll||!scroll.isConnected)return;
 const overlay=tag(scroll);
 const content=scroll.closest('.window-content');

 scroll.style.setProperty('min-height','0','important');
 scroll.style.setProperty('margin-bottom','0','important');
 scroll.style.setProperty('padding-bottom','4px','important');
 scroll.style.setProperty('overflow-y','auto','important');
 scroll.style.setProperty('height','auto','important');
 scroll.style.setProperty('max-height','none','important');
 scroll.style.setProperty('flex','1 1 auto','important');

 if(overlay){
  overlay.style.setProperty('bottom',AD_SAFE+'px','important');
  overlay.style.setProperty('padding-bottom','0','important');
  overlay.style.setProperty('scroll-padding-bottom','0','important');
 }
 if(content){
  content.style.setProperty('margin-bottom','0','important');
  content.style.setProperty('padding-bottom','0','important');
  content.style.setProperty('min-height','0','important');
  content.style.setProperty('height','calc(100dvh - '+(AD_SAFE+8)+'px)','important');
  content.style.setProperty('max-height','calc(100dvh - '+(AD_SAFE+8)+'px)','important');
  content.style.setProperty('overflow','hidden','important');
  content.style.setProperty('display','flex','important');
  content.style.setProperty('flex-direction','column','important');
 }
}

function compactAll(){
 installStyle();
 document.querySelectorAll(ROUTINE_SCROLL).forEach(compactOne);
 const fifty=document.getElementById('tf503020Overlay');
 if(fifty){
  fifty.style.setProperty('inset','0','important');
  fifty.style.setProperty('top','0','important');
  fifty.style.setProperty('right','0','important');
  fifty.style.setProperty('bottom','0','important');
  fifty.style.setProperty('left','0','important');
  fifty.style.setProperty('width','100vw','important');
  fifty.style.setProperty('min-height','100dvh','important');
  fifty.style.setProperty('height','100dvh','important');
  fifty.style.setProperty('max-height','100dvh','important');
  fifty.style.setProperty('padding-bottom','0','important');
  fifty.style.setProperty('scroll-padding-bottom','0','important');
  fifty.style.setProperty('background','#050914','important');
 }
}

function schedule(){
 requestAnimationFrame(compactAll);
 setTimeout(compactAll,50);
 setTimeout(compactAll,160);
 setTimeout(compactAll,320);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',schedule,{capture:true,passive:true});
window.addEventListener('resize',schedule,{passive:true});
})();
