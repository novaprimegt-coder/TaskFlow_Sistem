/* TaskFlow V133.0 · Adaptación estructural de Mentalista usando Sung Jin-Woo.
   Reutiliza exactamente los nodos existentes; no cambia textos, colores,
   12 pruebas, requisitos, marcación, pasos, botones ni progreso. */
(function(){
'use strict';
if(window.__tfMentalistaSungV133)return;
window.__tfMentalistaSungV133=true;
let queued=false;
function ready(){
 const outer=document.getElementById('windowContainer');
 const panel=document.getElementById('windowContent');
 if(!outer||!panel)return;
 function apply(){
  if(!outer.classList.contains('mentalist-modal')||
     !panel.classList.contains('tfMentalistReplicaT9')||
     !panel.classList.contains('tf15-mentalista'))return;
  const scroll=panel.querySelector('.v96-mentalist-scroll');
  const summary=scroll&&scroll.querySelector('.tfm-summary');
  const head=summary&&summary.querySelector('.tfm-summary-head');
  if(!summary||!head)return;
  // Igual que Sung Jin-Woo, la barra ocupa su propio renglón ancho.
  // Conservar el nodo del medidor: T9 sigue actualizando el mismo progreso.
  let meter=summary.querySelector('.tfm-summary-head .tfm-meter');
  if(!meter)meter=summary.querySelector('.tfm-sung-meter-row .tfm-meter');
  if(!meter)return;
  let row=summary.querySelector(':scope > .tfm-sung-meter-row');
  if(!row){row=document.createElement('div');row.className='tfm-sung-meter-row';head.insertAdjacentElement('afterend',row);}
  if(meter.parentElement!==row)row.appendChild(meter);
 }
 function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;apply()});
 }
 const watch=new MutationObserver(changes=>{
  for(const change of changes){
   if(change.type!=='childList')continue;
   if(change.addedNodes.length&&Array.from(change.addedNodes).some(node=>
    node.nodeType===1&&(node.matches?.('.tfm-summary,.tfm-summary-head,.tfm-meter,.v96-mentalist-scroll')||
     node.querySelector?.('.tfm-summary,.tfm-meter')))){schedule();return;}
  }
 });
 watch.observe(panel,{subtree:true,childList:true});
 const classes=new MutationObserver(schedule);
 classes.observe(outer,{attributes:true,attributeFilter:['class']});
 classes.observe(panel,{attributes:true,attributeFilter:['class']});
 document.addEventListener('click',event=>{
  if(event.target?.closest?.('.v94-mentalist-launch,.v94-mentalist-step,.tfm-start'))schedule();
 },{capture:true,passive:true});
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
else ready();
})();