(function(){
'use strict';
if(window.__tfV13078MindUnifiedStyle)return;
window.__tfV13078MindUnifiedStyle=true;

/* V130.7.8 · SOLO iguala visualmente Sócrates y Maquiavelo
   al patrón visual de las demás rutinas. No modifica datos, progreso,
   frecuencia, almacenamiento, sincronización ni otras rutinas. */

const STYLE_ID='tfV13078MindUnifiedStyleCss';
const LEGACY_STYLE_IDS=[
  'tfV13067MindLegalStyleCss',
  'tfV13068MindLegalStyleCss',
  'tfV13068ThoughtRoutinesLegalStyle',
  'tfV13068SungExactStyleCss',
  'tfV13074MindControlsIconsCss'
];

function installStyle(){
  for(const id of LEGACY_STYLE_IDS){const old=document.getElementById(id);if(old)old.remove()}
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#windowContainer .v69-routine-modal.v97-routine-scroll{
  display:grid!important;
  gap:8px!important;
}
#windowContainer .v69-routine-modal .v69-routine-card{
  width:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
  overflow:visible!important;
}
#windowContainer .v69-routine-modal .v69-routine-head{display:none!important}
#windowContainer .v69-routine-modal .v69-routine-list{
  display:grid!important;
  grid-template-columns:1fr!important;
  gap:8px!important;
  width:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
}
#windowContainer .v69-routine-modal .v69-routine-item{
  position:relative!important;
  width:100%!important;
  max-width:none!important;
  min-width:0!important;
  min-height:68px!important;
  margin:0!important;
  padding:9px 10px!important;
  display:grid!important;
  grid-template-columns:28px minmax(0,1fr) 26px!important;
  align-items:center!important;
  column-gap:10px!important;
  border:1px solid rgba(157,148,202,.13)!important;
  border-radius:16px!important;
  background:radial-gradient(circle at 7% 50%,rgba(113,96,169,.055),transparent 31%),linear-gradient(145deg,#23233d 0%,#202039 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025),0 7px 18px rgba(0,0,0,.10)!important;
  color:#f5f4fb!important;
  text-align:left!important;
  box-sizing:border-box!important;
  overflow:visible!important;
  opacity:1!important;
  visibility:visible!important;
}
#windowContainer .v69-routine-modal .v69-routine-check{
  grid-column:1!important;
  grid-row:1!important;
  position:relative!important;
  inset:auto!important;
  width:26px!important;
  height:26px!important;
  min-width:26px!important;
  min-height:26px!important;
  max-width:26px!important;
  max-height:26px!important;
  margin:0!important;
  padding:0!important;
  display:grid!important;
  place-items:center!important;
  border:0!important;
  border-radius:8px!important;
  background:transparent!important;
  color:#aea6d7!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
  box-shadow:none!important;
  transform:none!important;
}
#windowContainer .v69-routine-modal .v69-routine-check svg,
#windowContainer .v69-routine-modal .v69-routine-check i{
  display:block!important;
  width:21px!important;
  height:21px!important;
  max-width:21px!important;
  max-height:21px!important;
  color:inherit!important;
  stroke:currentColor!important;
  opacity:1!important;
  visibility:visible!important;
  filter:none!important;
}
#windowContainer .v69-routine-modal .v69-routine-copy{
  grid-column:2!important;
  grid-row:1!important;
  min-width:0!important;
  width:100%!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  align-self:center!important;
}
#windowContainer .v69-routine-modal .v69-routine-copy strong{
  display:block!important;
  margin:0!important;
  color:#f5f4fb!important;
  font-size:12.5px!important;
  line-height:1.22!important;
  font-weight:850!important;
  letter-spacing:0!important;
  white-space:normal!important;
  overflow:visible!important;
  text-overflow:clip!important;
}
#windowContainer .v69-routine-modal .v69-routine-copy span{
  display:block!important;
  margin-top:3px!important;
  color:#9893b3!important;
  font-size:8.5px!important;
  line-height:1.30!important;
  white-space:normal!important;
  overflow:visible!important;
  text-overflow:clip!important;
}
#windowContainer .v69-routine-modal .v69-routine-item::after{
  content:''!important;
  grid-column:3!important;
  grid-row:1!important;
  justify-self:end!important;
  align-self:center!important;
  width:24px!important;
  height:24px!important;
  min-width:24px!important;
  min-height:24px!important;
  border:1px solid rgba(176,166,220,.30)!important;
  border-radius:50%!important;
  background:#2d294e!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
  box-sizing:border-box!important;
}
#windowContainer .v69-routine-modal .v69-routine-item::before{
  content:''!important;
  position:absolute!important;
  right:18px!important;
  top:50%!important;
  width:8px!important;
  height:8px!important;
  border-radius:50%!important;
  background:rgba(193,185,223,.18)!important;
  transform:translate(50%,-50%)!important;
  z-index:2!important;
  pointer-events:none!important;
}
#windowContainer .v69-routine-modal .v69-routine-item.done::after,
#windowContainer .v69-routine-modal .v69-routine-item.completed::after,
#windowContainer .v69-routine-modal .v69-routine-item.complete::after{
  content:'✓'!important;
  display:grid!important;
  place-items:center!important;
  border-color:#70e8dd!important;
  background:#59d9cf!important;
  color:#07161c!important;
  font-size:14px!important;
  line-height:1!important;
  font-weight:950!important;
  box-shadow:0 4px 12px rgba(52,211,200,.12),inset 0 1px 0 rgba(255,255,255,.20)!important;
}
#windowContainer .v69-routine-modal .v69-routine-item.done::before,
#windowContainer .v69-routine-modal .v69-routine-item.completed::before,
#windowContainer .v69-routine-modal .v69-routine-item.complete::before{display:none!important}
#windowContainer .v69-routine-modal .v69-routine-footer{display:none!important}
@media(max-width:430px){
  #windowContainer .v69-routine-modal .v69-routine-list{gap:7px!important}
  #windowContainer .v69-routine-modal .v69-routine-item{
    min-height:66px!important;
    padding:8px 9px!important;
    grid-template-columns:26px minmax(0,1fr) 24px!important;
    column-gap:9px!important;
    border-radius:15px!important;
  }
  #windowContainer .v69-routine-modal .v69-routine-check{
    width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;max-width:24px!important;max-height:24px!important;
  }
  #windowContainer .v69-routine-modal .v69-routine-check svg,
  #windowContainer .v69-routine-modal .v69-routine-check i{width:20px!important;height:20px!important;max-width:20px!important;max-height:20px!important}
  #windowContainer .v69-routine-modal .v69-routine-copy strong{font-size:12px!important}
  #windowContainer .v69-routine-modal .v69-routine-item::after{width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important}
  #windowContainer .v69-routine-modal .v69-routine-item::before{right:17px!important;width:7px!important;height:7px!important}
}
`;
  document.head.appendChild(s);
}

function cleanLegacyClasses(){
  const content=document.getElementById('windowContent');
  if(!content)return;
  content.classList.remove('tf13067-mind-legal-style','tf13068-legal-pattern');
  content.querySelectorAll('.tf13067-check').forEach(el=>el.remove());
  content.querySelectorAll('.tf13067-mission,.tf13067-copy,.tf13067-task-icon,.tf13067-original-check,.tf13068-mission,.tf13068-copy,.tf13068-number,.tf13068-done').forEach(el=>{
    el.classList.remove('tf13067-mission','tf13067-copy','tf13067-task-icon','tf13067-original-check','tf13068-mission','tf13068-copy','tf13068-number','tf13068-done');
  });
}

function apply(){
  installStyle();
  cleanLegacyClasses();
}
function schedule(){requestAnimationFrame(apply);setTimeout(apply,80);setTimeout(apply,240)}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',e=>{
  if(e.target&&e.target.closest&&e.target.closest('.v69-routine-launch,.v69-routine-item,.window-close'))schedule();
},{capture:true,passive:true});
document.addEventListener('change',e=>{
  if(e.target&&e.target.closest&&e.target.closest('#windowContainer'))schedule();
},true);
})();
