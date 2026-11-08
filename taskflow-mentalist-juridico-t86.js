/* TaskFlow T86: igualar SOLO el bloque de progreso del Mentalista
   al patrón aprobado de Dominio Jurídico. Conserva 12 pruebas, precisión,
   evaluación, guías, completado, almacenamiento y demás rutinas. */
(function(){
'use strict';
if(window.__tfMentalistLegalProgressT86)return;
window.__tfMentalistLegalProgressT86=true;
const STYLE_ID='tfMentalistLegalProgressT86Style';
const ROOT='#windowContainer.mentalist-modal.open #windowContent.tfMentalistReplicaT9';
const CSS=`
${ROOT} .tfm-legal-progress{display:block!important;position:relative!important;width:100%!important;max-width:100%!important;min-width:0!important;flex:0 0 auto!important;box-sizing:border-box!important;margin:0 0 14px!important;padding:15px 16px 16px!important;border:1px solid rgba(19,225,243,.82)!important;border-radius:24px!important;background:radial-gradient(circle at 0% 0%,rgba(26,214,255,.10),transparent 28%),linear-gradient(145deg,#071725 0%,#0a1730 42%,#09122a 100%)!important;box-shadow:inset 0 0 18px rgba(39,235,255,.05),0 0 12px rgba(1,181,255,.08)!important;color:#f5faff!important}
${ROOT} .tfm-legal-progress .tf21-progress-head{display:grid!important;grid-template-columns:58px minmax(0,1fr) 141px 70px!important;gap:14px!important;align-items:center!important;min-width:0!important;min-height:68px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon{display:grid!important;place-items:center!important;width:50px!important;height:50px!important;border-radius:15px!important;background:linear-gradient(145deg,rgba(14,131,178,.26),rgba(8,33,69,.96))!important;color:#29edf3!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:29px!important;height:29px!important;stroke-width:2.1!important}
${ROOT} .tfm-legal-progress .tf21-progress-label{min-width:0!important;display:grid!important;gap:4px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:18px!important;font-weight:900!important;line-height:1.15!important;color:#fff!important}
${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:13px!important;line-height:1.35!important;color:#d8e0f2!important}
${ROOT} .tfm-legal-progress .tf21-count-pill{height:68px!important;min-width:135px!important;display:flex!important;flex-direction:column!important;gap:3px!important;align-items:center!important;justify-content:center!important;padding:5px 10px!important;border-radius:28px!important;border:1px solid rgba(188,100,255,.65)!important;background:linear-gradient(180deg,rgba(79,32,148,.92),rgba(40,18,95,.96))!important;box-shadow:inset 0 0 16px rgba(248,140,255,.08)!important;white-space:nowrap!important}
${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:22px!important;line-height:1!important;font-weight:900!important;color:#c779ff!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-count-pill small{font-size:9px!important;line-height:1.15!important;letter-spacing:.3px!important;color:#d9c4f7!important;font-weight:800!important}
${ROOT} .tfm-legal-progress .tf21-pct{font-size:44px!important;min-width:0!important;line-height:1!important;font-weight:900!important;text-align:right!important;color:#15f5f5!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-bar{height:16px!important;margin:13px 8px 11px!important;border-radius:99px!important;overflow:hidden!important;background:#101b3b!important;border:1px solid rgba(64,100,153,.32)!important;box-shadow:inset 0 2px 6px #0007!important}
${ROOT} .tfm-legal-progress .tf21-bar>i{display:block!important;width:var(--tfm-legal-pct,0%)!important;height:100%!important;border-radius:inherit!important;background:linear-gradient(90deg,#03e8ee,#1f91fa,#8859f9)!important;box-shadow:0 0 14px #12e9f97a!important;transition:width .24s ease!important}
${ROOT} .tfm-legal-progress .tf21-steps{display:grid!important;grid-template-columns:repeat(12,minmax(0,1fr))!important;gap:2px!important;position:relative!important;min-width:0!important;margin:0 4px 13px!important}
${ROOT} .tfm-legal-progress .tf21-steps::before{content:''!important;position:absolute!important;left:3%!important;right:3%!important;top:50%!important;height:2px!important;z-index:0!important;background:#1c3d68!important}
${ROOT} .tfm-legal-progress .tf21-step{position:relative!important;z-index:1!important;display:grid!important;place-items:center!important;justify-self:center!important;width:min(29px,100%)!important;aspect-ratio:1!important;border-radius:50%!important;border:1px solid rgba(77,120,209,.53)!important;background:#091936!important;color:#aec8fc!important;box-shadow:inset 0 0 10px rgba(29,84,170,.17)!important;font-size:11px!important;line-height:1!important;font-weight:750!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-step.done{background:linear-gradient(140deg,#00bfc8,#0c56c9)!important;color:#fff!important;border-color:#4ef2f4!important}
${ROOT} .tfm-legal-progress .tf21-stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
${ROOT} .tfm-legal-progress .tf21-stat{min-width:0!important;min-height:124px!important;display:grid!important;grid-template-columns:56px minmax(0,1fr)!important;align-items:center!important;gap:12px!important;padding:16px 16px 14px!important;border-radius:20px!important;border:1px solid rgba(58,97,164,.43)!important;background:linear-gradient(145deg,#0b1530,#091126)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(1){border-color:rgba(245,171,45,.55)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(2){border-color:rgba(130,70,246,.68)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3){border-color:rgba(2,222,252,.5)!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon{display:grid!important;place-items:center!important;width:56px!important;height:56px!important;border-radius:16px!important;background:rgba(245,151,39,.14)!important;color:#ffbe52!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(2) .tf21-stat-icon{background:rgba(124,45,239,.2)!important;color:#b177fa!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) .tf21-stat-icon{background:rgba(0,193,230,.12)!important;color:#24eefa!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon svg{width:31px!important;height:31px!important;stroke-width:2!important}
${ROOT} .tfm-legal-progress .tf21-stat-body{display:flex!important;flex-direction:column!important;gap:4px!important;min-width:0!important;text-align:left!important;line-height:1.15!important}
${ROOT} .tfm-legal-progress .tf21-stat-body b{font-size:23px!important;font-weight:900!important;white-space:nowrap!important;color:#ffc65a!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(2) b{color:#b778ff!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) b{font-size:20px!important;color:#23eff4!important}
${ROOT} .tfm-legal-progress .tf21-stat-body span,${ROOT} .tfm-legal-progress .tf21-stat-body small{font-size:12px!important;line-height:1.28!important;color:#aabbdc!important;overflow-wrap:anywhere!important}
${ROOT} [data-tfm-old-progress="yes"]{display:none!important}
${ROOT} .tfm-legal-progress .tf21-progress-head>*{min-width:0!important;box-sizing:border-box!important}
${ROOT} .tfm-legal-progress .tf21-steps{align-items:center!important}
${ROOT} .tfm-legal-progress .tf21-stat-body span,${ROOT} .tfm-legal-progress .tf21-stat-body small{white-space:normal!important}
${ROOT} .tfm-legal-progress .tf21-count-pill{box-sizing:border-box!important;overflow:hidden!important}
/* El resumen de 12 misiones conserva su boton original de inicio. */
${ROOT} .tfm-summary{border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;margin:12px 0 0!important}
${ROOT} .tfm-summary>.tfm-summary-head,${ROOT} .tfm-summary>.tfm-stats{display:none!important}
${ROOT} .tfm-summary>.tfm-start{margin:0!important}
@media(max-width:600px){
${ROOT} .tfm-legal-progress{padding:11px 10px 11px!important;border-radius:16px!important}
${ROOT} .tfm-legal-progress .tf21-progress-head{grid-template-columns:39px minmax(0,1fr) 63px 46px!important;gap:6px!important;min-height:46px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon{width:37px!important;height:37px!important;border-radius:11px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:22px!important;height:22px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:12px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:9px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill{height:43px!important;padding:4px 3px!important;min-width:63px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:15px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill small{font-size:6px!important}
${ROOT} .tfm-legal-progress .tf21-pct{font-size:25px!important}
${ROOT} .tfm-legal-progress .tf21-bar{height:9px!important;margin:9px 2px 10px!important}
${ROOT} .tfm-legal-progress .tf21-steps{gap:0!important;margin:0 1px 10px!important}
${ROOT} .tfm-legal-progress .tf21-step{width:min(25px,94%)!important;font-size:9px!important}
${ROOT} .tfm-legal-progress .tf21-stats{gap:5px!important}
${ROOT} .tfm-legal-progress .tf21-stat{min-height:83px!important;grid-template-columns:28px minmax(0,1fr)!important;gap:5px!important;padding:7px 5px!important;border-radius:12px!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon{width:27px!important;height:27px!important;border-radius:8px!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon svg{width:19px!important;height:19px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body{gap:3px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body b{font-size:17px!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) b{font-size:14px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body span,${ROOT} .tfm-legal-progress .tf21-stat-body small{font-size:9px!important;line-height:1.2!important}
}
@media(max-width:350px){
${ROOT} .tfm-legal-progress .tf21-progress-head{grid-template-columns:34px minmax(0,1fr) 58px 39px!important;gap:4px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon{width:32px!important;height:32px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:20px!important;height:20px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:10px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:8px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:13px!important}
${ROOT} .tfm-legal-progress .tf21-pct{font-size:22px!important}
${ROOT} .tfm-legal-progress .tf21-stat{grid-template-columns:1fr!important;justify-items:center!important;gap:3px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body{text-align:center!important}
}
`;
const SVG_START='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const ICONS={
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
 flame:'<path d="M12 22c-4 0-7-3-7-7 0-4 3-7 6-10 0 4 5 5 5 10 1-2 2-3 2-5 3 5 3 12-6 12Z"/>',
 chart:'<rect x="2" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="18" y="3" width="4" height="18" rx="1"/>'
};
const svg=name=>SVG_START+ICONS[name]+'</svg>';
function installStyle(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);
}
function changeText(element,value){if(element&&element.textContent!==value)element.textContent=value}
function state(){
 const panel=document.getElementById('windowContent'),outer=document.getElementById('windowContainer');
 if(!panel||!outer||!outer.classList.contains('open')||!outer.classList.contains('mentalist-modal')||!panel.classList.contains('tfMentalistReplicaT9'))return null;
 const scroll=panel.querySelector('.v96-mentalist-scroll');
 if(!scroll||!scroll.querySelector('.v94-mentalist-list'))return null;
 return {panel,scroll};
}
function originalProgress(panel,scroll,newCard){
 // Identificar por contenido y por estructura, sin tocar la regla ni las misiones.
 const headings=[...panel.querySelectorAll('strong,h2,h3,h4,p,div,span')].filter(el=>
  el.childElementCount===0&&el.textContent.trim()==='Progreso del protocolo');
 for(const heading of headings){
  let candidate=heading.parentElement;
  while(candidate&&candidate!==panel&&candidate!==scroll){
   if(candidate===newCard||candidate.classList.contains('tfm-legal-progress')||
      candidate.classList.contains('tfm-summary')||candidate.querySelector('.tfm-start'))break;
   const text=candidate.textContent||'';
   if(text.includes('Tiempo estimado')&&text.includes('Completadas')&&
      !candidate.querySelector('.v94-mentalist-list,.v94-mentalist-step,.v94-mentalist-protocol'))return candidate;
   candidate=candidate.parentElement;
  }
 }
 return null;
}
function createCard(scroll){
 const card=document.createElement('section');card.className='tfm-legal-progress';
 card.setAttribute('aria-label','Progreso del protocolo Mentalista');
 card.innerHTML='<div class="tf21-progress-head"><span class="tf21-progress-icon">'+svg('target')+'</span><span class="tf21-progress-label"><strong>Progreso del protocolo</strong><small>Avanza una prueba a la vez.</small></span><span class="tf21-count-pill"><b>0/12</b><small>COMPLETADAS</small></span><strong class="tf21-pct">0%</strong></div>'+
 '<div class="tf21-bar" role="progressbar" aria-label="Progreso del protocolo Mentalista" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><div class="tf21-steps"></div><div class="tf21-stats"></div>';
 const steps=card.querySelector('.tf21-steps'),fragment=document.createDocumentFragment();
 for(let i=1;i<=12;i++){const circle=document.createElement('span');circle.className='tf21-step';circle.textContent=String(i);fragment.appendChild(circle)}
 steps.appendChild(fragment);
 const stats=card.querySelector('.tf21-stats');
 for(const [icon,number,label,detail] of [
  ['flame','0','Completadas','de 12 pruebas'],
  ['target','0%','Precisión actual','Mínimo requerido: 90%'],
  ['chart','~25–35 min','Tiempo estimado','Completo']
 ]){
  const stat=document.createElement('div');stat.className='tf21-stat';
  stat.innerHTML='<span class="tf21-stat-icon">'+svg(icon)+'</span><div class="tf21-stat-body"><b></b><span></span><small></small></div>';
  stat.querySelector('b').textContent=number;
  stat.querySelector('.tf21-stat-body>span').textContent=label;
  stat.querySelector('small').textContent=detail;
  stats.appendChild(stat);
 }
 scroll.insertBefore(card,scroll.firstChild);
 return card;
}
function update(){
 const current=state();if(!current)return;
 const {panel,scroll}=current;
 installStyle();
 let card=scroll.querySelector(':scope > .tfm-legal-progress');
 if(!card)card=createCard(scroll);
 const previous=originalProgress(panel,scroll,card);
 if(previous&&previous.getAttribute('data-tfm-old-progress')!=='yes')previous.setAttribute('data-tfm-old-progress','yes');
 const header=panel.querySelector('.v85-routine-modal-head .v85-routine-progress-pill');
 const match=String(header?.textContent||'').match(/(\d+)\s*\/\s*(\d+)/);
 const nativeSummary=scroll.querySelector('.tfm-summary');
 const rows=[...scroll.querySelectorAll('.v94-mentalist-list .v94-mentalist-step')];
 const completed=Math.max(0,Math.min(12,match?Number(match[1]):rows.filter(row=>row.classList.contains('done')).length));
 const percentage=Math.round(completed/12*100);
 const precision=nativeSummary?.querySelector('.tfm-precision')?.textContent?.trim()||'0%';
 changeText(card.querySelector('.tf21-count-pill b'),completed+'/12');
 changeText(card.querySelector('.tf21-pct'),percentage+'%');
 changeText(card.querySelector('.tf21-stat:nth-child(1) b'),String(completed));
 changeText(card.querySelector('.tf21-stat:nth-child(2) b'),precision);
 card.style.setProperty('--tfm-legal-pct',percentage+'%');
 const bar=card.querySelector('.tf21-bar');
 if(bar&&bar.getAttribute('aria-valuenow')!==String(percentage))bar.setAttribute('aria-valuenow',String(percentage));
 [...card.querySelectorAll('.tf21-step')].forEach((step,index)=>{
  if(step.classList.contains('done')!==(index<completed))step.classList.toggle('done',index<completed);
 });
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update()})}
let initialized=false;
function initialize(){
 if(initialized)return true;
 const panel=document.getElementById('windowContent'),outer=document.getElementById('windowContainer');
 if(!panel||!outer)return false;
 initialized=true;installStyle();
 const observer=new MutationObserver(changes=>{
  if(changes.some(r=>r.type==='childList'||r.type==='attributes'))schedule();
 });
 observer.observe(outer,{attributes:true,attributeFilter:['class']});
 observer.observe(panel,{childList:true,subtree:false});
 document.addEventListener('click',()=>{schedule();setTimeout(schedule,110)},{capture:true,passive:true});
 // Actualizar solo mientras Mentalista está abierto, también tras sincronización.
 setInterval(()=>{if(state())update()},900);
 schedule();return true;
}
if(!initialize()){
 document.addEventListener('DOMContentLoaded',initialize,{once:true});
 const retry=setInterval(()=>{if(initialize())clearInterval(retry)},1500);
}
})();