(function(){
'use strict';
if(window.__tfV13054SearchComplete)return;window.__tfV13054SearchComplete=true;

function installStyle(){
  if(document.getElementById('tfV13054SearchCompleteStyle'))return;
  const s=document.createElement('style');
  s.id='tfV13054SearchCompleteStyle';
  s.textContent=`
#tfSearchHostV13053{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;padding-bottom:16px!important}
#tfSearchHostV13053>.tf13053-result-copy{display:block!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding-bottom:10px!important}
#tfSearchHostV13053 .tf13053-result-copy [class*="search"],
#tfSearchHostV13053 .tf13053-result-copy [class*="result"],
#tfSearchHostV13053 .tf13053-result-copy [class*="list"]{max-height:none!important;height:auto!important;overflow-y:visible!important}
#tfSearchHostV13053 .tf13053-result-copy [class*="results"]{max-height:none!important;height:auto!important;overflow:visible!important}
`;
  document.head.appendChild(s);
}

function forceExpand(el){
  if(!el)return;
  const set=(p,v)=>{try{el.style.setProperty(p,v,'important')}catch(_){}};
  set('max-height','none');
  set('height','auto');
  set('overflow-y','visible');
}

function expandResults(){
  const modal=document.getElementById('tfSearchModalV13053');
  const host=document.getElementById('tfSearchHostV13053');
  if(!modal||!host||!modal.classList.contains('open'))return;
  const root=host.querySelector('.tf13053-result-copy');
  if(!root)return;

  forceExpand(root);
  root.style.setProperty('overflow','visible','important');
  root.style.setProperty('min-height','0','important');

  root.querySelectorAll('*').forEach(el=>{
    let cs;try{cs=getComputedStyle(el)}catch(_){return}
    const cls=String(el.className||'').toLowerCase();
    const hinted=/search|result|list|matches|match|items|entries/.test(cls);
    const oy=String(cs.overflowY||'');
    const clipped=/auto|scroll|hidden|clip/.test(oy);
    const hasMeasuredClip=el.clientHeight>0&&el.scrollHeight>el.clientHeight+6;
    if((hinted&&clipped)||hasMeasuredClip){
      forceExpand(el);
      if(hinted)try{el.style.setProperty('overflow','visible','important')}catch(_){}
    }
  });

  host.scrollTop=0;
}

function schedule(){[0,60,140,280,520,900].forEach(ms=>setTimeout(expandResults,ms))}

function boot(){
  installStyle();
  schedule();
  document.addEventListener('click',e=>{
    if(e.target&&e.target.closest&&e.target.closest('.tf13053-search-btn.submit'))schedule();
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Enter')schedule()},true);
  document.addEventListener('input',()=>schedule(),true);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();