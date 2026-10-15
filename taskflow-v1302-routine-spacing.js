(function(){
'use strict';
if(window.__tfV1302RoutineSpacing)return;window.__tfV1302RoutineSpacing=true;

const STYLE_ID='tfV1302RoutineSpacingStyle';
const SHORT_CLASS='tf1302-short-routine';

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
/* V130.2 · SOLO rutinas: separación cabecera, lectura final y centrado de rutinas cortas. */

/* Reserva real para la X de 48/46 px y separa visualmente el contador. */
#windowContainer.window-container.open .v85-routine-modal-head{
  grid-template-columns:42px minmax(0,1fr) auto!important;
  column-gap:12px!important;
  padding-right:76px!important;
}
#windowContainer.window-container.open .v85-routine-modal-head>.v85-routine-progress-pill{
  margin-right:2px!important;
}
#windowContainer.window-container.open .v85-routine-modal-head>.window-close{
  right:4px!important;
}

/* El último contenido de cualquier rutina conserva un respiro pequeño y legible. */
#windowContainer.window-container.open.tf129-routine .v96-mentalist-scroll,
#windowContainer.window-container.open.tf129-routine .v97-routine-scroll,
#windowContainer.window-container.open.tf128-routine .v96-mentalist-scroll,
#windowContainer.window-container.open.tf128-routine .v97-routine-scroll,
#windowContainer.window-container.open .v96-mentalist-scroll,
#windowContainer.window-container.open .v97-routine-scroll{
  padding-bottom:22px!important;
  scroll-padding-bottom:22px!important;
}
#windowContainer.window-container.open .v96-mentalist-scroll>:last-child,
#windowContainer.window-container.open .v97-routine-scroll>:last-child{
  margin-bottom:0!important;
}

/* Solo rutinas de 5 o 6 misiones: cabecera arriba y bloque de misiones centrado en el espacio restante. */
#windowContainer.window-container.open.${SHORT_CLASS}>#windowContent.window-content{
  display:flex!important;
  flex-direction:column!important;
  height:100%!important;
  min-height:100%!important;
  max-height:100%!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
}
#windowContainer.window-container.open.${SHORT_CLASS} .v85-routine-modal-head{
  flex:0 0 auto!important;
}
#windowContainer.window-container.open.${SHORT_CLASS} .v97-routine-scroll{
  flex:1 1 auto!important;
  width:100%!important;
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  margin-top:0!important;
  margin-bottom:0!important;
  padding-top:18px!important;
  padding-bottom:22px!important;
  display:flex!important;
  flex-direction:column!important;
  justify-content:center!important;
  overflow:visible!important;
  box-sizing:border-box!important;
}

@media(max-width:520px){
  #windowContainer.window-container.open .v85-routine-modal-head{
    grid-template-columns:36px minmax(0,1fr) auto!important;
    column-gap:10px!important;
    padding-right:70px!important;
  }
  #windowContainer.window-container.open .v85-routine-modal-head>.window-close{right:3px!important}
  #windowContainer.window-container.open .v96-mentalist-scroll,
  #windowContainer.window-container.open .v97-routine-scroll{
    padding-bottom:18px!important;
    scroll-padding-bottom:18px!important;
  }
  #windowContainer.window-container.open.${SHORT_CLASS} .v97-routine-scroll{
    padding-top:14px!important;
    padding-bottom:18px!important;
  }
}
`;
  document.head.appendChild(s);
}

function routineTotal(){
  const content=document.getElementById('windowContent');
  if(!content)return 0;
  const scroll=content.querySelector('.v96-mentalist-scroll,.v97-routine-scroll');
  if(!scroll)return 0;
  const pill=content.querySelector('.v85-routine-modal-head .v85-routine-progress-pill');
  const m=String(pill&&pill.textContent||'').trim().match(/^\s*\d+\s*\/\s*(\d+)\s*$/);
  return m?Number(m[1])||0:0;
}

function apply(){
  installStyle();
  const container=document.getElementById('windowContainer');
  if(!container)return;
  container.classList.remove(SHORT_CLASS);
  if(!container.classList.contains('open'))return;
  const total=routineTotal();
  if(total===5||total===6)container.classList.add(SHORT_CLASS);
}

function schedule(){
  requestAnimationFrame(apply);
  setTimeout(apply,50);
  setTimeout(apply,160);
  setTimeout(apply,420);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',schedule,{capture:true,passive:true});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
})();
