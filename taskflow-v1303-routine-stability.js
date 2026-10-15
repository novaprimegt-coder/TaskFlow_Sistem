(function(){
'use strict';
if(window.__tfV1303RoutineStabilityLoaded)return;
window.__tfV1303RoutineStabilityLoaded=true;
window.__tfRoutineStabilityV1303=true;

const STYLE_ID='tfV1303RoutineStabilityStyle';
const ROUTINE_SCROLL='.v96-mentalist-scroll,.v97-routine-scroll';
const STABLE_CLASS='tf1303-routine-stable';
const SHORT_CLASS='tf1303-short-routine';
const EXPANDED_CLASS='tf1303-guide-open';
let scheduled=false;
let lastSignature='';

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
#windowContainer.window-container.open.${STABLE_CLASS}{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;margin:0!important;padding:8px 8px 0!important;overflow:hidden!important;display:flex!important;align-items:stretch!important;justify-content:center!important;box-sizing:border-box!important;background:#020711!important;overscroll-behavior:none!important}
#windowContainer.window-container.open.${STABLE_CLASS}>#windowContent.window-content{position:relative!important;width:min(96vw,760px)!important;max-width:760px!important;height:100%!important;min-height:0!important;max-height:100%!important;margin:0 auto!important;padding-bottom:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;box-sizing:border-box!important;overscroll-behavior:none!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-modal-head{position:relative!important;flex:0 0 auto!important;display:grid!important;grid-template-columns:46px minmax(0,1fr) 54px!important;align-items:center!important;column-gap:12px!important;min-height:76px!important;margin:0!important;padding:10px 78px 13px 10px!important;border-bottom:1px solid rgba(255,255,255,.065)!important;box-sizing:border-box!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-modal-copy{min-width:0!important;width:100%!important;text-align:center!important;justify-self:stretch!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-modal-copy .eyebrow,#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-modal-copy h2{text-align:center!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-progress-pill{min-width:54px!important;justify-self:end!important;margin:0!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-modal-head>.window-close{position:absolute!important;top:50%!important;right:10px!important;transform:translateY(-50%)!important;width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;margin:0!important;border-radius:17px!important;z-index:6!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v96-mentalist-scroll,#windowContainer.window-container.open.${STABLE_CLASS} .v97-routine-scroll{flex:1 1 auto!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding-top:14px!important;padding-right:2px!important;padding-bottom:20px!important;padding-left:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;touch-action:pan-y!important;scroll-padding-top:10px!important;scroll-padding-bottom:20px!important;scrollbar-gutter:stable!important;box-sizing:border-box!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v96-mentalist-scroll>:last-child,#windowContainer.window-container.open.${STABLE_CLASS} .v97-routine-scroll>:last-child,#windowContainer.window-container.open.${STABLE_CLASS} .v94-mentalist-list,#windowContainer.window-container.open.${STABLE_CLASS} .v69-routine-card,#windowContainer.window-container.open.${STABLE_CLASS} .v69-routine-list,#windowContainer.window-container.open.${STABLE_CLASS} .v85-sung-list,#windowContainer.window-container.open.${STABLE_CLASS} .v83-legal-list{margin-bottom:0!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v69-routine-footer{margin-top:12px!important;padding:11px 8px 10px!important;min-height:38px!important;gap:16px!important;align-items:center!important;line-height:1.35!important;box-sizing:border-box!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v69-routine-footer>span{min-width:0!important;padding-right:4px!important}
#windowContainer.window-container.open.${STABLE_CLASS} .v69-routine-footer>strong{flex:0 0 auto!important;white-space:nowrap!important;margin-left:8px!important}
#windowContainer.window-container.open.${STABLE_CLASS}.${SHORT_CLASS}>#windowContent.window-content{justify-content:center!important}
#windowContainer.window-container.open.${STABLE_CLASS}.${SHORT_CLASS} .v97-routine-scroll{flex:0 1 auto!important;max-height:calc(100% - 86px)!important;display:flex!important;flex-direction:column!important;justify-content:center!important;padding-top:16px!important;padding-bottom:20px!important}
#windowContainer.window-container.open.${STABLE_CLASS}.${SHORT_CLASS}.${EXPANDED_CLASS}>#windowContent.window-content{justify-content:flex-start!important}
#windowContainer.window-container.open.${STABLE_CLASS}.${SHORT_CLASS}.${EXPANDED_CLASS} .v97-routine-scroll{flex:1 1 auto!important;max-height:none!important;justify-content:flex-start!important}
#windowContainer.window-container.open.${STABLE_CLASS}.mentalist-modal .v96-mentalist-scroll{display:block!important}
#windowContainer.window-container.open.${STABLE_CLASS}.mentalist-modal .v94-mentalist-protocol{top:0!important}
@media(max-width:520px){#windowContainer.window-container.open.${STABLE_CLASS}{padding:7px 7px 0!important}#windowContainer.window-container.open.${STABLE_CLASS}>#windowContent.window-content{width:100%!important;max-width:100%!important}#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-modal-head{grid-template-columns:40px minmax(0,1fr) 48px!important;column-gap:10px!important;min-height:72px!important;padding:9px 72px 12px 8px!important}#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-progress-pill{min-width:48px!important}#windowContainer.window-container.open.${STABLE_CLASS} .v85-routine-modal-head>.window-close{right:8px!important;width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important}#windowContainer.window-container.open.${STABLE_CLASS} .v96-mentalist-scroll,#windowContainer.window-container.open.${STABLE_CLASS} .v97-routine-scroll{padding-top:12px!important;padding-bottom:18px!important;scroll-padding-bottom:18px!important}#windowContainer.window-container.open.${STABLE_CLASS}.${SHORT_CLASS} .v97-routine-scroll{padding-top:14px!important;padding-bottom:18px!important}#windowContainer.window-container.open.${STABLE_CLASS} .v69-routine-footer{margin-top:11px!important;padding:10px 7px 9px!important;min-height:36px!important;gap:14px!important}}
`;
  document.head.appendChild(s);
}

function clearInline(el,props){if(!el)return;props.forEach(p=>{try{el.style.removeProperty(p)}catch(_){}})}
function getTotal(content){const pill=content&&content.querySelector('.v85-routine-modal-head .v85-routine-progress-pill');const m=String(pill&&pill.textContent||'').trim().match(/^\s*\d+\s*\/\s*(\d+)\s*$/);return m?Number(m[1])||0:0}
function getSignature(content,total){const title=String(content&&content.querySelector('.v85-routine-modal-copy h2')?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();return title+'|'+String(total||0)}
function normalizeEntry(container,content,scroll){
  clearInline(container,['inset','top','right','bottom','left','width','height','min-height','max-height','margin','padding','padding-bottom','overflow','overflow-x','overflow-y','display','align-items','justify-content','background','scroll-padding-bottom']);
  clearInline(content,['width','height','min-height','max-height','margin','margin-top','margin-bottom','padding-bottom','overflow','overflow-x','overflow-y','display','flex-direction','align-items','justify-content','scroll-padding-bottom']);
  clearInline(scroll,['width','height','min-height','max-height','margin','margin-top','margin-bottom','padding','padding-top','padding-bottom','overflow','overflow-x','overflow-y','display','flex','flex-direction','justify-content','scroll-padding-bottom']);
  container.scrollTop=0;content.scrollTop=0;scroll.scrollTop=0;
}
function apply(){
  installStyle();
  const container=document.getElementById('windowContainer');
  const content=document.getElementById('windowContent');
  if(!container||!content||!container.classList.contains('open')){if(container)container.classList.remove(STABLE_CLASS,SHORT_CLASS,EXPANDED_CLASS);lastSignature='';return}
  const scroll=content.querySelector(ROUTINE_SCROLL);
  if(!scroll){container.classList.remove(STABLE_CLASS,SHORT_CLASS,EXPANDED_CLASS);lastSignature='';return}
  const total=getTotal(content),signature=getSignature(content,total),entering=signature!==lastSignature||!container.classList.contains(STABLE_CLASS);
  container.classList.add(STABLE_CLASS,'tf129-routine');
  container.classList.toggle(SHORT_CLASS,total===5||total===6);
  container.classList.toggle(EXPANDED_CLASS,!!scroll.querySelector('details[open]'));
  const mental=scroll.classList.contains('v96-mentalist-scroll');
  if(mental)container.classList.add('mentalist-modal');else container.classList.remove('mentalist-modal');
  container.classList.remove('store-modal','rank-modal');
  content.classList.remove('store-mode','v79-store-mode');
  if(entering)normalizeEntry(container,content,scroll);
  lastSignature=signature;
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
installStyle();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',schedule,{capture:true,passive:true});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('orientationchange',schedule,{passive:true});
})();
