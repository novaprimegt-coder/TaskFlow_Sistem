(function(){
'use strict';
if(window.__tfV13068SungExactStyle)return;
window.__tfV13068SungExactStyle=true;

/* V130.7.5 · SOLO ajuste de tamaño visual de Sócrates y Maquiavelo.
   Referencia: Sung Jin-Woo. No modifica datos, progreso, frecuencia ni lógica. */
const ID='tfV13068SungExactStyleCss';
function install(){
  if(document.getElementById(ID))return;
  const s=document.createElement('style');
  s.id=ID;
  s.textContent=`
/* Paleta y encabezado de Sung Jin-Woo */
#windowContent.tf13067-mind-legal-style{
  background:
    radial-gradient(circle at 50% 0%,rgba(110,91,176,.055),transparent 28%),
    linear-gradient(180deg,#191931 0%,#18182f 46%,#16172c 100%)!important;
}
#windowContent.tf13067-mind-legal-style .v85-routine-modal-head{
  background:linear-gradient(180deg,rgba(31,31,57,.985),rgba(25,25,49,.985))!important;
  border-bottom:1px solid rgba(166,156,214,.10)!important;
}
#windowContent.tf13067-mind-legal-style .v85-routine-modal-copy .eyebrow{color:#9d95c5!important}
#windowContent.tf13067-mind-legal-style .v85-routine-modal-copy h2{
  color:#f6f5fb!important;background:none!important;-webkit-text-fill-color:currentColor!important;text-shadow:none!important;
}
#windowContent.tf13067-mind-legal-style .v85-routine-progress-pill{
  min-width:48px!important;padding:6px 9px!important;border-radius:12px!important;
  border:1px solid rgba(169,158,218,.20)!important;background:#23233d!important;color:#c2bce0!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
}
#windowContent.tf13067-mind-legal-style .v85-routine-modal-head>.window-close{
  border-color:rgba(169,158,218,.16)!important;background:#23233d!important;color:#f4f2fb!important;
}

/* Mismo ancho útil y densidad que Sung Jin-Woo */
#windowContent.tf13067-mind-legal-style .v97-routine-scroll{padding-left:0!important;padding-right:0!important}
#windowContent.tf13067-mind-legal-style .v69-routine-list,
#windowContent.tf13067-mind-legal-style .v69-routine-card{
  width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box!important;
}
#windowContent.tf13067-mind-legal-style .v69-routine-list{gap:8px!important}

/* Tarjeta compacta: elimina el aspecto grande que no correspondía a Sung */
#windowContent.tf13067-mind-legal-style .tf13067-mission{
  width:100%!important;max-width:none!important;min-width:0!important;
  min-height:72px!important;height:auto!important;margin:0!important;padding:8px 10px!important;
  display:grid!important;grid-template-columns:28px minmax(0,1fr) 26px!important;align-items:center!important;column-gap:10px!important;
  border:1px solid rgba(157,148,202,.13)!important;border-radius:17px!important;
  background:radial-gradient(circle at 7% 50%,rgba(113,96,169,.055),transparent 31%),linear-gradient(145deg,#23233d 0%,#202039 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 7px 18px rgba(0,0,0,.10)!important;
  overflow:visible!important;box-sizing:border-box!important;
}

/* Icono compacto de Sung: sin bloque grande */
#windowContent.tf13067-mind-legal-style .tf13067-task-icon{
  grid-column:1!important;grid-row:1!important;position:relative!important;inset:auto!important;
  width:26px!important;height:26px!important;min-width:26px!important;min-height:26px!important;max-width:26px!important;max-height:26px!important;
  margin:0!important;padding:0!important;display:grid!important;place-items:center!important;
  border:0!important;border-radius:8px!important;background:transparent!important;color:#aea6d7!important;
  opacity:1!important;visibility:visible!important;filter:none!important;box-shadow:none!important;transform:none!important;
}
#windowContent.tf13067-mind-legal-style .tf13067-task-icon svg,
#windowContent.tf13067-mind-legal-style .tf13067-task-icon i{
  width:21px!important;height:21px!important;max-width:21px!important;max-height:21px!important;
  color:#aea6d7!important;stroke:currentColor!important;opacity:1!important;visibility:visible!important;filter:none!important;
}

/* Texto usando todo el espacio disponible como en Sung */
#windowContent.tf13067-mind-legal-style .tf13067-copy{
  grid-column:2!important;grid-row:1!important;min-width:0!important;width:100%!important;max-width:none!important;
  margin:0!important;padding:0!important;align-self:center!important;text-align:left!important;
}
#windowContent.tf13067-mind-legal-style .tf13067-copy strong,
#windowContent.tf13067-mind-legal-style .tf13067-copy b,
#windowContent.tf13067-mind-legal-style .tf13067-copy h3,
#windowContent.tf13067-mind-legal-style .tf13067-copy h4{
  display:block!important;width:auto!important;max-width:none!important;margin:0!important;
  color:#f5f4fb!important;font-size:13px!important;line-height:1.22!important;font-weight:850!important;
  letter-spacing:0!important;white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;
}
#windowContent.tf13067-mind-legal-style .tf13067-copy small,
#windowContent.tf13067-mind-legal-style .tf13067-copy p,
#windowContent.tf13067-mind-legal-style .tf13067-copy span{
  max-width:none!important;color:#9893b3!important;font-size:8.5px!important;line-height:1.28!important;
  white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important;
}

/* Control pequeño a la derecha como Sung, conservando el mismo clic/progreso existente */
#windowContent.tf13067-mind-legal-style .tf13067-check{
  grid-column:3!important;grid-row:1!important;justify-self:end!important;align-self:center!important;
  width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;max-width:24px!important;max-height:24px!important;
  margin:0!important;padding:0!important;display:grid!important;place-items:center!important;
  border:1px solid rgba(176,166,220,.30)!important;border-radius:50%!important;
  background:#2d294e!important;color:transparent!important;font-size:15px!important;line-height:1!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;transform:none!important;
}
#windowContent.tf13067-mind-legal-style .tf13067-check:not(.tf13067-done)::before{
  content:''!important;width:8px!important;height:8px!important;border:0!important;border-radius:50%!important;
  background:rgba(193,185,223,.18)!important;
}
#windowContent.tf13067-mind-legal-style .tf13067-check.tf13067-done{
  border-color:#70e8dd!important;background:#59d9cf!important;color:#07161c!important;
  box-shadow:0 4px 12px rgba(52,211,200,.12),inset 0 1px 0 rgba(255,255,255,.20)!important;
}
#windowContent.tf13067-mind-legal-style .tf13067-check.tf13067-done::before{content:'✓'!important;background:none!important;width:auto!important;height:auto!important}
#windowContent.tf13067-mind-legal-style .tf13067-original-check{display:none!important}

/* Los iconos se mantienen visibles aun después de completar la misión */
#windowContent.tf13067-mind-legal-style .tf13067-mission.completed .tf13067-task-icon,
#windowContent.tf13067-mind-legal-style .tf13067-mission.complete .tf13067-task-icon,
#windowContent.tf13067-mind-legal-style .tf13067-mission.done .tf13067-task-icon,
#windowContent.tf13067-mind-legal-style .tf13067-mission.checked .tf13067-task-icon{
  display:grid!important;opacity:1!important;visibility:visible!important;
}

/* "Cómo completarla" conserva el formato compacto del patrón Sung */
#windowContent.tf13067-mind-legal-style .v69-routine-card summary{
  min-height:30px!important;margin-top:5px!important;padding:5px 8px!important;
  color:#aaa4c5!important;font-size:8.5px!important;line-height:1.25!important;
}
#windowContent.tf13067-mind-legal-style .v69-routine-card details[open] summary{color:#c4bedf!important}

@media(max-width:430px){
  #windowContent.tf13067-mind-legal-style .tf13067-mission{
    min-height:68px!important;padding:8px 9px!important;
    grid-template-columns:26px minmax(0,1fr) 24px!important;column-gap:9px!important;border-radius:16px!important;
  }
  #windowContent.tf13067-mind-legal-style .tf13067-task-icon{
    width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;max-width:24px!important;max-height:24px!important;
  }
  #windowContent.tf13067-mind-legal-style .tf13067-task-icon svg,
  #windowContent.tf13067-mind-legal-style .tf13067-task-icon i{width:20px!important;height:20px!important}
  #windowContent.tf13067-mind-legal-style .tf13067-check{
    width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;max-width:22px!important;max-height:22px!important;
  }
  #windowContent.tf13067-mind-legal-style .tf13067-copy strong,
  #windowContent.tf13067-mind-legal-style .tf13067-copy b,
  #windowContent.tf13067-mind-legal-style .tf13067-copy h3,
  #windowContent.tf13067-mind-legal-style .tf13067-copy h4{font-size:12.5px!important}
}
`;
  document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();