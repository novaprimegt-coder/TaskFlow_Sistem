(function(){
'use strict';
if(window.__tfV13068ThoughtRoutinesLegalStyle)return;
window.__tfV13068ThoughtRoutinesLegalStyle=true;

/* V130.6.8 · Cambio visual localizado.
   SOLO hace que las ventanas de Sócrates y Maquiavelo utilicen
   la misma estructura visual de misiones que Dominio jurídico.
   No cambia lógica, progreso, almacenamiento ni otras rutinas. */

const STYLE_ID='tfV13068ThoughtRoutinesLegalStyle';

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#windowContainer .v69-routine-modal.v97-routine-scroll{display:grid!important;gap:6px!important}
#windowContainer .v69-routine-modal .v69-routine-card{width:100%!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important}
#windowContainer .v69-routine-modal .v69-routine-head{display:none!important}
#windowContainer .v69-routine-modal .v69-routine-list{display:grid!important;gap:6px!important;width:100%!important}
#windowContainer .v69-routine-modal .v69-routine-item{position:relative!important;width:100%!important;display:grid!important;grid-template-columns:30px minmax(0,1fr) 28px!important;align-items:center!important;gap:8px!important;min-height:52px!important;padding:8px 9px!important;border-radius:12px!important;border:1px solid rgba(255,255,255,.06)!important;background:rgba(4,11,23,.38)!important;color:#fff!important;text-align:left!important;box-sizing:border-box!important}
#windowContainer .v69-routine-modal .v69-routine-card.socrates .v69-routine-item.done{border-color:rgba(78,205,196,.20)!important;background:rgba(78,205,196,.055)!important}
#windowContainer .v69-routine-modal .v69-routine-card.machiavelli .v69-routine-item.done{border-color:rgba(255,177,74,.20)!important;background:rgba(255,177,74,.055)!important}
#windowContainer .v69-routine-modal .v69-routine-check{grid-column:1!important;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;padding:0!important;border:0!important;border-radius:9px!important;display:grid!important;place-items:center!important;background:rgba(78,205,196,.07)!important;color:#68e6dc!important;opacity:1!important;visibility:visible!important;box-shadow:none!important}
#windowContainer .v69-routine-modal .v69-routine-card.machiavelli .v69-routine-check{background:rgba(255,177,74,.07)!important;color:#ffc46d!important}
#windowContainer .v69-routine-modal .v69-routine-item.done .v69-routine-check,#windowContainer .v69-routine-modal .v69-routine-card.machiavelli .v69-routine-item.done .v69-routine-check{opacity:1!important;visibility:visible!important;border:0!important}
#windowContainer .v69-routine-modal .v69-routine-check svg{display:block!important;width:16px!important;height:16px!important;opacity:1!important;visibility:visible!important;color:currentColor!important;stroke:currentColor!important;filter:none!important}
#windowContainer .v69-routine-modal .v69-routine-item.done .v69-routine-check::after{content:none!important;display:none!important}
#windowContainer .v69-routine-modal .v69-routine-copy{grid-column:2!important;min-width:0!important}
#windowContainer .v69-routine-modal .v69-routine-copy strong{display:block!important;font-size:9.7px!important;line-height:1.18!important;color:#f4f7ff!important;font-weight:800!important}
#windowContainer .v69-routine-modal .v69-routine-copy span{display:block!important;margin-top:2px!important;font-size:7.7px!important;line-height:1.2!important;color:#8090a6!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#windowContainer .v69-routine-modal .v69-routine-item::after{content:'○'!important;grid-column:3!important;grid-row:1!important;width:26px!important;height:26px!important;min-width:26px!important;min-height:26px!important;border-radius:8px!important;border:1px solid rgba(255,255,255,.12)!important;display:grid!important;place-items:center!important;justify-self:end!important;color:#708096!important;background:rgba(255,255,255,.02)!important;font-size:10px!important;font-weight:900!important;line-height:1!important;box-sizing:border-box!important}
#windowContainer .v69-routine-modal .v69-routine-card.socrates .v69-routine-item.done::after{content:'✓'!important;background:#55d9cf!important;border-color:#55d9cf!important;color:#061515!important}
#windowContainer .v69-routine-modal .v69-routine-card.machiavelli .v69-routine-item.done::after{content:'✓'!important;background:#ffbe66!important;border-color:#ffbe66!important;color:#1b1205!important}
#windowContainer .v69-routine-modal .v69-routine-footer{display:none!important}
`;
  document.head.appendChild(s);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installStyle,{once:true});
else installStyle();
})();
