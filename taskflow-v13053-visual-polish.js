(function(){
'use strict';
if(window.__tfV13053VisualPolish)return;window.__tfV13053VisualPolish=true;

function installStyle(){
  if(document.getElementById('tfV13053VisualPolishStyle'))return;
  const s=document.createElement('style');s.id='tfV13053VisualPolishStyle';s.textContent=`
:root{--tfp-cyan:#4de7da;--tfp-cyan2:#16cfc5;--tfp-blue:#5b8cff;--tfp-purple:#9a73ff;--tfp-orange:#ff9b45;--tfp-red:#ff667a;--tfp-bg:#050914;--tfp-panel:#0b1323;--tfp-line:rgba(116,211,255,.15);color-scheme:dark}
html{background:#050914!important;scrollbar-color:#2edfd2 rgba(255,255,255,.035);scrollbar-width:thin}
body{background:radial-gradient(circle at 18% 7%,rgba(33,203,193,.055),transparent 27%),radial-gradient(circle at 86% 28%,rgba(122,86,255,.055),transparent 25%),linear-gradient(180deg,#050914 0%,#060b17 52%,#040812 100%)!important;color:#f4f8ff!important;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:linear-gradient(115deg,transparent 0 46%,rgba(74,225,213,.018) 50%,transparent 54%),radial-gradient(circle at 50% 110%,rgba(255,145,62,.035),transparent 37%)}
*{scrollbar-color:#2edfd2 rgba(255,255,255,.035)}
*::-webkit-scrollbar{width:5px;height:5px}*::-webkit-scrollbar-track{background:rgba(255,255,255,.025)}*::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#34e5d8,#568cff);border-radius:999px}
button,[role="button"],a,input,select,textarea{-webkit-tap-highlight-color:transparent}
button,[role="button"],a{transition:border-color .16s ease,box-shadow .16s ease,background-color .16s ease,transform .12s ease}
button:active,[role="button"]:active{transform:scale(.985)}
button:focus-visible,[role="button"]:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid rgba(84,230,218,.64)!important;outline-offset:2px!important}
input,select,textarea{border-color:rgba(137,169,210,.16)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important}
input:focus,select:focus,textarea:focus{border-color:rgba(77,231,218,.52)!important;box-shadow:0 0 0 3px rgba(77,231,218,.07),inset 0 1px 0 rgba(255,255,255,.03)!important}

/* Acabado premium sin alterar estructura ni medidas */
:where(#tf503020Hub,#tfMentalistPairV117,.v83-core-card,.v69-routine-launch,.v94-mentalist-launch,.v48-analysis-panel,.tf117-sheet,.tf119-sheet,.tf120-card,.tf1304-sheet,.tf13053-sheet,.window-content){box-shadow:0 18px 45px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.025)!important}
:where(#tf503020Hub,#tfMentalistPairV117,.v83-core-card,.v69-routine-launch,.v94-mentalist-launch){isolation:isolate;overflow:hidden}
:where(#tf503020Hub,#tfMentalistPairV117,.v83-core-card,.v69-routine-launch,.v94-mentalist-launch):after{filter:saturate(1.12) contrast(1.04)}
:where(.quick-action-btn,.tf117-actions button,.tf119-actions button,.tf117-done,.tf119-done,.tf120-action,.tf120-delete){box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 9px 22px rgba(0,0,0,.16)!important}
:where(.quick-action-btn,.v83-core-card,.v69-routine-launch,#tf503020Hub,#tfMentalistPairV117) svg{filter:drop-shadow(0 0 5px currentColor);shape-rendering:geometricPrecision}
:where(.quick-action-icon,.v83-core-icon,.v69-routine-icon,.v94-mentalist-icon,.tf120-icon){box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 8px 20px rgba(0,0,0,.18)!important}
:where(.window-close,.tf117-x,.tf119-x,.tf120-close,.tf1304-x,.tf13053-x){background:linear-gradient(145deg,rgba(27,38,62,.96),rgba(15,23,41,.98))!important;border-color:rgba(160,184,221,.16)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 8px 22px rgba(0,0,0,.19)!important}
:where(.window-close,.tf117-x,.tf119-x,.tf120-close,.tf1304-x,.tf13053-x):active{background:linear-gradient(145deg,rgba(39,54,84,.98),rgba(18,29,51,.99))!important}

/* Contraste y jerarquía de textos */
:where(h1,h2,h3,.window-title,.tf117-head h2,.tf119-head h2,.tf120-head h2,.tf1304-head h2){text-shadow:0 2px 14px rgba(0,0,0,.34);letter-spacing:-.015em}
:where(p,small,.subtext,.muted){text-wrap:pretty}

/* Reinicio del sistema: rediseño visual localizado */
#tfResetModalV120.tf120-overlay{background:radial-gradient(circle at 50% 12%,rgba(70,225,212,.10),transparent 34%),rgba(2,6,15,.93)!important;backdrop-filter:blur(15px) saturate(1.15)!important}
#tfResetModalV120 .tf120-card{position:relative;border-color:rgba(84,226,214,.28)!important;background:radial-gradient(circle at 88% 3%,rgba(81,225,213,.10),transparent 28%),radial-gradient(circle at 8% 82%,rgba(116,85,255,.065),transparent 30%),linear-gradient(165deg,#151d38 0%,#0c1327 48%,#080d1b 100%)!important;box-shadow:0 34px 100px rgba(0,0,0,.70),0 0 0 1px rgba(80,220,210,.035),inset 0 1px 0 rgba(255,255,255,.045)!important}
#tfResetModalV120 .tf120-card:before{content:"";position:absolute;top:0;left:9%;right:9%;height:2px;border-radius:99px;background:linear-gradient(90deg,transparent,#43e4d5 30%,#6b8cff 62%,transparent);box-shadow:0 0 16px rgba(67,228,213,.45);pointer-events:none}
#tfResetModalV120 .tf120-head{position:relative;background:linear-gradient(180deg,rgba(24,34,64,.97),rgba(15,23,45,.93))!important;border-bottom-color:rgba(116,173,225,.11)!important;padding-top:19px!important;padding-bottom:17px!important}
#tfResetModalV120 .tf120-icon{width:56px!important;height:56px!important;border-radius:18px!important;background:radial-gradient(circle at 35% 25%,rgba(83,240,224,.19),transparent 42%),linear-gradient(145deg,rgba(20,72,81,.62),rgba(18,31,56,.92))!important;border-color:rgba(77,231,218,.34)!important;color:#58eadc!important;box-shadow:0 10px 30px rgba(0,0,0,.25),0 0 20px rgba(74,225,213,.09),inset 0 1px 0 rgba(255,255,255,.055)!important}
#tfResetModalV120 .tf120-icon svg{width:29px;height:29px;filter:drop-shadow(0 0 7px rgba(80,235,220,.30))}
#tfResetModalV120 .tf120-head small{color:#60e9dc!important;font-size:9px!important;letter-spacing:.18em!important}
#tfResetModalV120 .tf120-head h2{font-size:25px!important;line-height:1.04!important}
#tfResetModalV120 .tf120-head p{color:#9ba9bf!important;font-size:10.5px!important}
#tfResetModalV120 .tf120-body{padding-top:18px!important}
#tfResetModalV120 .tf120-zero{position:relative;overflow:hidden;padding:17px 16px!important;border-radius:19px!important;border-color:rgba(77,231,218,.26)!important;background:radial-gradient(circle at 85% 50%,rgba(63,225,212,.13),transparent 37%),linear-gradient(145deg,rgba(17,51,64,.52),rgba(17,26,48,.78))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 12px 30px rgba(0,0,0,.17)!important}
#tfResetModalV120 .tf120-zero:after{content:"";position:absolute;right:-26px;top:-32px;width:115px;height:115px;border-radius:50%;border:1px solid rgba(83,233,220,.12);box-shadow:0 0 0 18px rgba(83,233,220,.025),0 0 0 37px rgba(83,233,220,.018);pointer-events:none}
#tfResetModalV120 .tf120-zero span{font-size:10.5px!important;color:#a3b1c6!important;font-weight:650}
#tfResetModalV120 .tf120-zero strong{font-size:29px!important;color:#62ecdf!important;text-shadow:0 0 20px rgba(72,231,217,.20)}
#tfResetModalV120 .tf120-box,#tfResetModalV120 .tf120-keep div{border-color:rgba(154,177,214,.10)!important;background:linear-gradient(145deg,rgba(255,255,255,.036),rgba(255,255,255,.018))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important}
#tfResetModalV120 .tf120-box{padding:14px!important;border-radius:15px!important}
#tfResetModalV120 .tf120-box b,#tfResetModalV120 .tf120-keep b{font-size:11.5px!important;color:#f5f8ff!important}
#tfResetModalV120 .tf120-box span,#tfResetModalV120 .tf120-keep div{color:#99a7bc!important}
#tfResetModalV120 .tf120-action{min-height:52px!important;border-radius:16px!important;border-color:rgba(255,176,85,.40)!important;background:linear-gradient(135deg,rgba(151,81,25,.29),rgba(84,45,22,.24))!important;color:#ffc17c!important;font-size:12.5px!important;box-shadow:0 12px 30px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,218,173,.08)!important}
#tfResetModalV120 .tf120-action:not(:disabled):active{background:linear-gradient(135deg,rgba(178,96,31,.36),rgba(95,49,22,.30))!important}
#tfResetModalV120 .tf120-status{color:#9eabc0!important;font-size:9.5px!important}

/* Sonido y ventanas del sistema */
#tfSoundV1304 .tf1304-sheet,#tfManagerV117 .tf119-sheet,.tf117-sheet{border-color:rgba(86,222,211,.26)!important;background:radial-gradient(circle at 88% 0%,rgba(89,225,213,.07),transparent 28%),linear-gradient(160deg,#121d34,#0a1120 58%,#070c17)!important}
.tf1304-row,.tf119-row,.tf117-row{border-color:rgba(147,171,207,.10)!important;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.018))!important}

@media(max-width:430px){#tfResetModalV120 .tf120-icon{width:50px!important;height:50px!important;border-radius:16px!important}#tfResetModalV120 .tf120-head h2{font-size:23px!important}#tfResetModalV120 .tf120-zero strong{font-size:27px!important}}
@media(prefers-reduced-motion:reduce){button,[role="button"],a{transition:none!important}}
`;
  document.head.appendChild(s);
}
function resetIcon(){
  const icon=document.querySelector('#tfResetModalV120 .tf120-icon');if(!icon||icon.dataset.tf13053Icon==='1')return;icon.dataset.tf13053Icon='1';icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6v5h-5"/><path d="M18.5 15.5A7.5 7.5 0 1 1 19.8 8.2L20 11"/><path d="M12 8v4l2.5 1.5"/></svg>'
}
function apply(){installStyle();resetIcon()}
function boot(){apply();[120,420,1000,2200].forEach(ms=>setTimeout(apply,ms));document.addEventListener('click',()=>{requestAnimationFrame(apply);setTimeout(apply,80)},{capture:true,passive:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();