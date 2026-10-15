(function(){
'use strict';
if(window.__tfV13074MindMissionUi)return;
window.__tfV13074MindMissionUi=true;

/* V130.7.4 · SOLO Sócrates y Maquiavelo.
   - Reduce el botón de completar al tamaño compacto de las demás rutinas.
   - Asigna un icono distinto y coherente a cada misión.
   - No cambia progreso, datos, frecuencia, sincronización ni lógica de completado. */

const STYLE_ID='tfV13074MindMissionUiCss';
const ROOT='.tf13067-mind-legal-style';
const MISSIONS={
  'HAZ UNA BUENA PREGUNTA':'question',
  'APRENDE DE ALGUIEN DISTINTO':'people',
  'EXPLORA ALGO NUEVO':'compass',
  'CORRIGE UNA IDEA PROPIA':'edit',
  'EXPLICA LO APRENDIDO':'teach',
  'DEFINE LA VICTORIA':'target',
  'LEE EL TABLERO':'board',
  'CONSTRUYE UN ARGUMENTO FUERTE':'shield',
  'EJECUTA BAJO PRESION':'timer',
  'CIERRA CON VENTAJA':'crown'
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();

const ICONS={
  question:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8.8 8.8 0 0 1-9 9 9.6 9.6 0 0 1-4-.9L3 21l1.2-4A8.7 8.7 0 0 1 3 12a9 9 0 1 1 18 0Z"/><path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.7c-.9.7-1.7 1.1-1.7 2.3"/><path d="M12 16h.01"/></svg>',
  people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.5-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2"/><path d="M15.5 14.5c2.9-.4 4.6 1 5 3.5"/></svg>',
  compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4l10.7-10.7a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 7.5 3 3"/><path d="M12 20h8"/></svg>',
  teach:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 3V5Z"/><path d="M8 9h8M8 12h5"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 12 20 4"/><path d="M16 4h4v4"/></svg>',
  board:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/><path d="M8 8h.01M16 16h.01"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 19 6v5c0 4.7-2.7 8-7 10-4.3-2-7-5.3-7-10V6l7-3Z"/><path d="M8.5 13.5 11 11l2 2 3.5-3.5"/></svg>',
  timer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="7"/><path d="M9 2h6M12 6V4M12 13l3-2M18 7l1.5-1.5"/></svg>',
  crown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8Z"/><path d="M7 21h10"/></svg>'
};

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#windowContent${ROOT} .tf13067-mission{grid-template-columns:28px minmax(0,1fr) 26px!important;column-gap:10px!important}
#windowContent${ROOT} .tf13067-task-icon{
  grid-column:1!important;grid-row:1!important;
  width:26px!important;height:26px!important;min-width:26px!important;min-height:26px!important;max-width:26px!important;max-height:26px!important;
  margin:0!important;padding:0!important;display:grid!important;place-items:center!important;
  border:0!important;border-radius:8px!important;background:transparent!important;color:#aea6d7!important;
  box-shadow:none!important;opacity:1!important;visibility:visible!important;transform:none!important;
}
#windowContent${ROOT} .tf13067-task-icon svg{
  width:21px!important;height:21px!important;max-width:21px!important;max-height:21px!important;
  display:block!important;color:inherit!important;stroke:currentColor!important;fill:none!important;opacity:1!important;visibility:visible!important;filter:none!important;
}
#windowContent${ROOT} .tf13067-check{
  grid-column:3!important;grid-row:1!important;justify-self:end!important;align-self:center!important;
  width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;max-width:24px!important;max-height:24px!important;
  margin:0!important;padding:0!important;border-radius:50%!important;
  border:1px solid rgba(176,166,220,.30)!important;background:#2d294e!important;color:transparent!important;
  font-size:14px!important;line-height:1!important;display:grid!important;place-items:center!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;transform:none!important;
}
#windowContent${ROOT} .tf13067-check:not(.tf13067-done)::before{
  content:''!important;width:8px!important;height:8px!important;border:0!important;border-radius:50%!important;background:rgba(193,185,223,.18)!important;
}
#windowContent${ROOT} .tf13067-check.tf13067-done{
  border-color:#70e8dd!important;background:#59d9cf!important;color:#07161c!important;
  box-shadow:0 4px 12px rgba(52,211,200,.12),inset 0 1px 0 rgba(255,255,255,.20)!important;
}
#windowContent${ROOT} .tf13067-check.tf13067-done::before{content:'✓'!important;background:none!important;width:auto!important;height:auto!important}
@media(max-width:430px){
  #windowContent${ROOT} .tf13067-mission{grid-template-columns:26px minmax(0,1fr) 24px!important;column-gap:9px!important}
  #windowContent${ROOT} .tf13067-task-icon{width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;max-width:24px!important;max-height:24px!important}
  #windowContent${ROOT} .tf13067-task-icon svg{width:20px!important;height:20px!important}
  #windowContent${ROOT} .tf13067-check{width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;max-width:22px!important;max-height:22px!important;font-size:13px!important}
}
`;
  document.head.appendChild(s);
}

function titleFor(card){
  const text=norm(card&&card.textContent);
  return Object.keys(MISSIONS).find(title=>text.includes(title))||'';
}
function ensureIcon(card,title){
  if(!card||!title)return;
  let icon=card.querySelector('.tf13067-task-icon');
  if(!icon){
    icon=document.createElement('span');
    icon.className='tf13067-task-icon';
    card.insertBefore(icon,card.firstChild);
  }
  const key=MISSIONS[title];
  const html=ICONS[key];
  if(html&&icon.dataset.tf13074Icon!==key){
    icon.innerHTML=html;
    icon.dataset.tf13074Icon=key;
    icon.setAttribute('aria-hidden','true');
  }
}
function compact(card){
  const check=card&&card.querySelector('.tf13067-check');
  if(!check)return;
  check.dataset.tf13074Compact='1';
  ['width','height','min-width','min-height','max-width','max-height'].forEach(p=>check.style.setProperty(p,'24px','important'));
  check.style.setProperty('padding','0','important');
  check.style.setProperty('border-radius','50%','important');
}
function apply(){
  installStyle();
  const content=document.getElementById('windowContent');
  if(!content||!content.classList.contains('tf13067-mind-legal-style'))return;
  for(const card of content.querySelectorAll('.tf13067-mission')){
    const title=titleFor(card);
    if(!title)continue;
    ensureIcon(card,title);
    compact(card);
  }
}
function schedule(){requestAnimationFrame(apply);setTimeout(apply,60);setTimeout(apply,180);setTimeout(apply,420)}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',e=>{
  if(e.target&&e.target.closest&&e.target.closest('.v69-routine-launch,.tf13067-mission,.window-close'))schedule();
},{capture:true,passive:true});
document.addEventListener('change',e=>{
  if(e.target&&e.target.closest&&e.target.closest('#windowContainer'))schedule();
},true);
})();