/* TaskFlow PayPal - checkout client (automatically ready ONLY after server verifies Live plan and price).
   Only server-confirmed entitlements disable ads. No card data is handled here. */
(function(){
'use strict';
if(window.TaskFlowNoAds)return;
const CFG_URL=new URL('payments/paypal/public-config.json',document.baseURI).href;
const CSS_ID='tfPayPalNoAdsStyle',MODAL_ID='tfPayPalNoAdsModal';
let settings=null,plan=null,enabled=false,active=false,busy=false,ready=null,sdkPromise=null,statusPromise=null,pendingIntent=null,subscriptionStatus=null,pendingApproval=false;
function safeBase(value){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return '';return u.href.replace(/\/$/,'')}catch(_){return ''}
}
function style(){
 if(document.getElementById(CSS_ID))return;
 const s=document.createElement('style');s.id=CSS_ID;
 s.textContent=`body.tf-paypal-noads .tf50-ad-slot{display:none!important}
 #${MODAL_ID}{position:fixed;inset:0;z-index:2147483647;background:rgba(1,6,18,.95);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
 #${MODAL_ID}[hidden]{display:none!important}
 #${MODAL_ID} .tf-paypal-panel{width:min(100%,470px);max-height:90dvh;overflow:auto;background:#07152b;color:#fff;border:1px solid #30d8df;border-radius:24px;padding:24px;box-shadow:0 24px 85px #0009;font-family:system-ui,sans-serif}
 #${MODAL_ID} h2{font-size:22px;margin:0 0 10px;color:#2be0e4}
 #${MODAL_ID} p{font-size:14px;line-height:1.45;color:#d2e0ee;margin:10px 0}
 #${MODAL_ID} .tf-paypal-close{float:right;border:1px solid #4d7891;background:#10223b;color:#fff;padding:9px 13px;border-radius:12px}
 #${MODAL_ID} .tf-paypal-status{font-size:13px;margin:16px 0;color:#d7e3ed}
 #${MODAL_ID} .tf-paypal-buy{display:block;width:100%;min-height:52px;margin:20px 0 8px;padding:12px 18px;border:1px solid #5dfaff;border-radius:14px;background:linear-gradient(110deg,#0ed5df,#0876ce);color:#fff;font:800 16px system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 26px rgba(9,179,218,.23)}
 #${MODAL_ID} .tf-paypal-buy:focus-visible{outline:3px solid #fff;outline-offset:3px}
 #${MODAL_ID} .tf-paypal-buy:disabled{opacity:.55;cursor:wait}
 #${MODAL_ID} .tf-paypal-buy[hidden]{display:none!important}
 #${MODAL_ID} .tf-paypal-info{color:#bbcadf;font-size:13px;line-height:1.5}
 #${MODAL_ID} #tfPayPalButtons{min-height:0;margin-top:14px}
 #${MODAL_ID} #tfPayPalCancel{display:block;margin:16px auto 0;padding:11px 15px;color:#ffe0d4;background:#241b32;border:1px solid #aa6673;border-radius:12px;font-weight:700}
 #${MODAL_ID} #tfPayPalCancel[hidden]{display:none!important}
 `;
 s.textContent += "\n#tfPayPalNoAdsModal{display:grid;place-items:center;background:rgba(2,7,17,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:14px max(14px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));overscroll-behavior:contain}\n#tfPayPalNoAdsModal .tf-paypal-panel{position:relative;isolation:isolate;width:min(100%,425px);max-height:90dvh;overflow-y:auto;overscroll-behavior:contain;padding:23px 21px 20px;border:1px solid rgba(83,192,228,.32);border-radius:25px;background:radial-gradient(ellipse 88% 50% at 110% -9%,rgba(11,188,215,.14),transparent),linear-gradient(160deg,#0b1b31,#081327 62%,#071222);box-shadow:0 26px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.075)}\n#tfPayPalNoAdsModal .tf-paypal-panel::before{content:\"\";position:absolute;inset:0 0 auto;height:2px;background:linear-gradient(90deg,transparent,#34d9e2 45%,#529de5,transparent);opacity:.8;pointer-events:none}\n#tfPayPalNoAdsModal .tf-paypal-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px}\n#tfPayPalNoAdsModal .tf-paypal-heading{min-width:0;flex:1}\n#tfPayPalNoAdsModal .tf-paypal-eyebrow{display:flex;align-items:center;gap:7px;color:#71dae5;font-weight:800;font-size:10px;letter-spacing:.14em;text-transform:uppercase}\n#tfPayPalNoAdsModal .tf-paypal-eyebrow::before{content:\"\";width:7px;height:7px;border-radius:50%;background:#4bdfe8;box-shadow:0 0 12px #4bdfe866}\n#tfPayPalNoAdsModal h2{font-size:clamp(22px,5.4vw,26px);line-height:1.13;letter-spacing:-.035em;margin:8px 0 0;font-weight:800;color:#f5fbff}\n#tfPayPalNoAdsModal .tf-paypal-close{float:none;display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;padding:0;border:1px solid rgba(123,164,191,.28);border-radius:12px;background:rgba(161,192,225,.07);color:#caddec;font-size:27px;line-height:1;cursor:pointer}\n#tfPayPalNoAdsModal .tf-paypal-subtitle{color:#a4b7cb;font-size:13px;line-height:1.45;margin:0 0 17px}\n#tfPayPalNoAdsModal .tf-paypal-pricing{padding:17px 18px 15px;border:1px solid rgba(68,148,197,.33);border-radius:17px;background:linear-gradient(125deg,rgba(20,65,100,.44),rgba(8,31,56,.55))}\n#tfPayPalNoAdsModal .tf-paypal-price-line{display:flex;align-items:baseline;gap:8px}\n#tfPayPalNoAdsModal .tf-paypal-price{font-size:38px;line-height:1;font-weight:800;letter-spacing:-.06em;color:#fff;font-variant-numeric:tabular-nums}\n#tfPayPalNoAdsModal .tf-paypal-period{font-size:15px;font-weight:600;color:#a7bdce}\n#tfPayPalNoAdsModal #tfPayPalPlan{font-size:12px;line-height:1.45;margin:9px 0 0;color:#a9bdcf}\n#tfPayPalNoAdsModal .tf-paypal-benefits{display:grid;gap:12px;padding:0;margin:18px 0 0;list-style:none}\n#tfPayPalNoAdsModal .tf-paypal-benefits li{display:flex;align-items:center;gap:10px;color:#dce8f4;font-size:13px;line-height:1.4;font-weight:550}\n#tfPayPalNoAdsModal .tf-paypal-benefits li::before{content:\"✓\";display:grid;place-items:center;width:23px;height:23px;flex:0 0 23px;border:1px solid rgba(69,215,209,.28);border-radius:8px;background:rgba(32,184,189,.12);color:#5de7e4;font-size:14px;font-weight:800}\n#tfPayPalNoAdsModal .tf-paypal-buy{display:flex;justify-content:center;align-items:center;gap:9px;min-height:53px;margin:21px 0 0;border-radius:15px;border:1px solid rgba(110,235,240,.6);background:linear-gradient(110deg,#0bbbc7 0%,#0696ca 51%,#1577c8 100%);box-shadow:0 11px 25px rgba(8,130,196,.2),inset 0 1px 0 #ffffff32;font:800 15px/1.3 system-ui,sans-serif;letter-spacing:-.02em;transition:filter .16s,transform .16s;cursor:pointer}\n#tfPayPalNoAdsModal .tf-paypal-buy:hover{filter:brightness(1.09)}\n#tfPayPalNoAdsModal .tf-paypal-buy:active{transform:scale(.985)}\n#tfPayPalNoAdsModal .tf-paypal-buy[hidden]{display:none!important}\n#tfPayPalNoAdsModal .tf-paypal-buy:disabled{opacity:.62;cursor:wait}\n#tfPayPalNoAdsModal .tf-paypal-status{display:none;margin:13px 0 0;padding:11px 12px;border:1px solid rgba(95,149,190,.22);border-radius:12px;background:rgba(4,21,41,.62);color:#b7cbdc;font-size:12px;line-height:1.47}\n#tfPayPalNoAdsModal .tf-paypal-status:not(:empty){display:block}\n#tfPayPalNoAdsModal .tf-paypal-status[data-tone=error]{color:#e5c6a5;border-color:rgba(227,169,110,.25);background:rgba(92,59,34,.18)}\n#tfPayPalNoAdsModal #tfPayPalButtons{margin-top:12px;min-height:0}\n#tfPayPalNoAdsModal #tfPayPalCancel{width:100%;margin:15px 0 0;padding:11px 12px;border-radius:12px;font-size:13px}\n#tfPayPalNoAdsModal .tf-paypal-foot{display:flex;justify-content:center;align-items:center;gap:6px;font-size:11px;line-height:1.4;margin:15px 0 0;color:#8ca3b8;text-align:center}\n#tfPayPalNoAdsModal button:focus-visible{outline:2px solid #7deafa;outline-offset:3px}\n@media(max-width:360px){#tfPayPalNoAdsModal .tf-paypal-panel{padding:19px 17px}#tfPayPalNoAdsModal .tf-paypal-price{font-size:34px}#tfPayPalNoAdsModal h2{font-size:22px}}\n@media(prefers-reduced-motion:reduce){#tfPayPalNoAdsModal .tf-paypal-buy{transition:none}}";
 s.textContent += "\n#tfPayPalNoAdsModal .tf-paypal-methods{margin:19px 0 11px;padding:14px 15px;border-radius:17px;border:1px solid rgba(72,182,218,.34);background:linear-gradient(125deg,rgba(23,80,116,.35),rgba(8,29,56,.55));box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}\n#tfPayPalNoAdsModal .tf-paypal-methods[hidden]{display:none!important}\n#tfPayPalNoAdsModal .tf-paypal-methods-head{display:flex;align-items:center;gap:11px}\n#tfPayPalNoAdsModal .tf-paypal-methods-dot{flex:none;width:10px;height:10px;border:2px solid #66e6e5;border-radius:50%;box-shadow:0 0 0 4px rgba(36,186,195,.11)}\n#tfPayPalNoAdsModal .tf-paypal-methods-head div{display:flex;flex-direction:column;gap:3px;min-width:0}\n#tfPayPalNoAdsModal .tf-paypal-methods-head strong{font:750 15px/1.25 system-ui,sans-serif;letter-spacing:-.015em;color:#f0faff}\n#tfPayPalNoAdsModal .tf-paypal-methods-head span:not(.tf-paypal-methods-dot){font-size:12px;line-height:1.4;color:#a7c1d7}\n#tfPayPalNoAdsModal .tf-paypal-methods-caption{margin:11px 0 0;padding-top:10px;border-top:1px solid rgba(113,175,215,.13);color:#8faac3;font-size:11px;line-height:1.5}\n#tfPayPalNoAdsModal #tfPayPalButtons{min-height:0;margin-top:8px;overflow:visible;isolation:isolate}\n#tfPayPalNoAdsModal #tfPayPalButtons iframe{max-width:100%!important}\n#tfPayPalNoAdsModal .tf-paypal-status:empty{display:none!important}\n#tfPayPalNoAdsModal .tf-paypal-status:not(:empty){margin-top:13px}\n@media(max-width:360px){#tfPayPalNoAdsModal .tf-paypal-methods{padding:12px 13px}#tfPayPalNoAdsModal .tf-paypal-methods-head strong{font-size:14px}}";
 s.textContent += "\n#tfPayPalNoAdsModal .tf-paypal-methods{position:relative;margin:20px 0 0;padding:17px 17px 15px;border:1px solid rgba(87,195,223,.31);border-radius:19px 19px 0 0;background:radial-gradient(ellipse 90% 135% at 100% 0%,rgba(26,150,195,.17),transparent 75%),linear-gradient(140deg,rgba(17,54,91,.68),rgba(6,28,55,.9));box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}\n#tfPayPalNoAdsModal .tf-paypal-methods[hidden]{display:none!important}\n#tfPayPalNoAdsModal .tf-paypal-methods-head{display:flex;align-items:center;gap:12px}\n#tfPayPalNoAdsModal .tf-paypal-methods-icon{display:grid;place-items:center;flex:none;width:41px;height:41px;border:1px solid rgba(73,207,224,.26);border-radius:13px;color:#6ee2ef;background:linear-gradient(145deg,rgba(26,135,183,.28),rgba(19,61,104,.16))}\n#tfPayPalNoAdsModal .tf-paypal-methods-icon svg{width:22px;height:22px}\n#tfPayPalNoAdsModal .tf-paypal-methods-head div{display:flex;flex-direction:column;gap:3px}\n#tfPayPalNoAdsModal .tf-paypal-methods-eyebrow{font-size:10px;font-weight:750;letter-spacing:.13em;color:#78d2e7}\n#tfPayPalNoAdsModal .tf-paypal-methods-head strong{color:#f4fbff;font:800 17px/1.2 system-ui,sans-serif;letter-spacing:-.025em}\n#tfPayPalNoAdsModal .tf-paypal-methods-caption{border:0;padding:0;margin:13px 0 0;color:#b9cfe0;font-size:13px;line-height:1.55}\n#tfPayPalNoAdsModal #tfPayPalButtons:not(:empty){position:relative;isolation:isolate;margin:0 0 3px;padding:15px 14px 13px;border:1px solid rgba(92,181,220,.31);border-top:1px solid rgba(122,201,234,.14);border-radius:0 0 19px 19px;background:linear-gradient(155deg,#f7fbff,#f1f5fc 80%,#edf5fc);box-shadow:0 14px 28px rgba(0,5,21,.23),inset 0 1px 0 #fff}\n#tfPayPalNoAdsModal #tfPayPalButtons iframe{max-width:100%!important}\n#tfPayPalNoAdsModal .tf-paypal-status[data-tone=\"guide\"]{display:flex!important;align-items:center;gap:10px;padding:12px 13px;background:rgba(24,87,116,.16);border:1px solid rgba(62,180,209,.27);border-radius:12px;color:#c0deed;font-size:12px;line-height:1.55}\n#tfPayPalNoAdsModal .tf-paypal-status[data-tone=\"guide\"]::before{content:\"✓\";display:grid;place-items:center;flex:none;width:21px;height:21px;border-radius:50%;border:1px solid rgba(92,228,228,.35);color:#68e6e6;background:rgba(20,194,199,.13);font-size:13px;font-weight:800}\n#tfPayPalNoAdsModal .tf-paypal-buy{border-radius:17px;min-height:54px}\n@media(max-width:360px){#tfPayPalNoAdsModal .tf-paypal-methods{padding:14px 13px}#tfPayPalNoAdsModal #tfPayPalButtons:not(:empty){padding:11px 9px}#tfPayPalNoAdsModal .tf-paypal-methods-head strong{font-size:16px}}\n@media(prefers-reduced-motion:no-preference){#tfPayPalNoAdsModal #tfPayPalButtons:not(:empty){animation:tf-paypal-enter .23s ease-out both}@keyframes tf-paypal-enter{from{opacity:.65;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}}";
 s.textContent += "\n#tfPayPalNoAdsModal .tf-paypal-price-line:has(+ #tfPayPalPlan + #tfPayPalTrialDetails:not([hidden])) .tf-paypal-price{font-size:clamp(27px,7vw,34px);letter-spacing:-.045em;color:#81f6e0}\n#tfPayPalNoAdsModal .tf-paypal-trial-details:not([hidden]){display:block;margin:12px 0 0;padding:12px 0 0;border-top:1px solid rgba(93,185,213,.2);font-size:12px;line-height:1.58;color:#c5dfeb}\n#tfPayPalNoAdsModal .tf-paypal-trial-details[hidden]{display:none!important}";
 document.head.appendChild(s);
}
function panel(){
 style();let r=document.getElementById(MODAL_ID);if(r)return r;
 r=document.createElement('div');r.id=MODAL_ID;r.hidden=true;
 r.setAttribute('role','dialog');r.setAttribute('aria-modal','true');
 r.setAttribute('aria-label','Eliminar anuncios con PayPal');
 r.innerHTML="<section class=\"tf-paypal-panel\" aria-labelledby=\"tfPayPalTitle\"><div class=\"tf-paypal-header\"><div class=\"tf-paypal-heading\"><div class=\"tf-paypal-eyebrow\">Eliminar publicidad</div><h2 id=\"tfPayPalTitle\">TaskFlow sin anuncios</h2></div><button type=\"button\" class=\"tf-paypal-close\" aria-label=\"Cerrar ventana\">×</button></div><p class=\"tf-paypal-subtitle\">Una experiencia más limpia, sin interrupciones publicitarias.</p><div class=\"tf-paypal-pricing\"><div class=\"tf-paypal-price-line\"><strong class=\"tf-paypal-price\">US$6.00</strong><span class=\"tf-paypal-period\">/ mes</span></div><p id=\"tfPayPalPlan\">Renovación automática · Cancela cuando quieras</p><p id=\"tfPayPalTrialDetails\" class=\"tf-paypal-trial-details\" hidden>No pagarás durante los primeros 7 días. Después se cobrarán US$6.00 mensuales, a menos que canceles antes de finalizar la prueba.</p></div><ul class=\"tf-paypal-benefits\"><li>Sin banners publicitarios</li><li>Sin anuncios al iniciar TaskFlow</li><li>Sin anuncios por interacción</li></ul><button id=\"tfPayPalBuy\" class=\"tf-paypal-buy\" type=\"button\">Comprar ahora · US$6.00/mes</button><div id=\"tfPayPalStatus\" class=\"tf-paypal-status\" role=\"status\" aria-live=\"polite\"></div><div id=\"tfPayPalMethods\" class=\"tf-paypal-methods\" hidden><div class=\"tf-paypal-methods-head\"><span class=\"tf-paypal-methods-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"3\"/><path d=\"M3 10h18M7 15h4\"/></svg></span><div><span class=\"tf-paypal-methods-eyebrow\">PAGO PROTEGIDO</span><strong>Métodos de pago</strong></div></div><p class=\"tf-paypal-methods-caption\">Elige PayPal o tarjeta y completa tu suscripción de forma segura.</p></div><div id=\"tfPayPalButtons\"></div><button id=\"tfPayPalCancel\" type=\"button\" hidden>Cancelar renovación automática</button><p class=\"tf-paypal-foot\">Pago seguro mediante PayPal · Suscripción mensual</p></section>";
 r.querySelector('.tf-paypal-close').addEventListener('click',()=>{if(!busy)r.hidden=true});
 r.querySelector('#tfPayPalBuy').addEventListener('click',()=>{void beginPurchase()});
 const cancel=r.querySelector('#tfPayPalCancel');
 cancel.addEventListener('click',async()=>{
  if(busy||!subscriptionStatus||subscriptionStatus.renewalStatus==='CANCELLED')return;
  busy=true;cancel.disabled=true;
  try{
   const info=await request('POST','/cancel');
   subscriptionStatus=info;
   statusText(subscriptionStatus?.trialActive?'Renovación cancelada. Conservas el acceso hasta el fin de tu prueba gratuita.':'Renovación cancelada. Conservas el acceso sin anuncios hasta el fin del período pagado.');
   cancel.hidden=true;
  }catch(_){statusText('No se pudo cancelar desde aquí. Inténtalo nuevamente.');cancel.disabled=false}
  finally{busy=false}
 });
 r.addEventListener('click',e=>{if(e.target===r&&!busy)r.hidden=true});
 document.body.appendChild(r);return r;
}
function statusText(msg,tone='info'){const e=document.getElementById('tfPayPalStatus');if(e){e.textContent=msg||'';e.dataset.tone=tone}}
function setActive(next){
 active=next===true;
 if(active)pendingApproval=false;
 if(document.body)document.body.classList.toggle('tf-paypal-noads',active);
 try{document.dispatchEvent(new CustomEvent('taskflow:noads-status-updated',{detail:{active}}))}catch(_){}
}
async function config(){
 if(settings!==null&&enabled)return settings;
 let r;
 try{r=await fetch(CFG_URL,{cache:'no-store',credentials:'omit'})}
 catch(_){throw new Error('PUBLIC_CONFIG_UNAVAILABLE')}
 if(!r.ok)throw new Error('PUBLIC_CONFIG_UNAVAILABLE');
 const c=await r.json();const base=safeBase(c.apiBase);
 settings={enabled:(c.enabled===true||c.enabled==='auto')&&!!base,apiBase:base};
 if(!settings.enabled)return settings;
 // La URL pública no es una autorización de cobro. Solo el servidor PayPal Live
 // con un plan mensual y webhook verificados puede habilitar el checkout.
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),5500);
 let response;
 try{response=await fetch(base+'/config',{cache:'no-store',credentials:'omit',signal:controller.signal})}
 catch(_){throw new Error('PAYPAL_BACKEND_UNAVAILABLE')}
 finally{clearTimeout(timer)}
 if(!response.ok)throw new Error('PAYPAL_BACKEND_UNAVAILABLE');
 let data;
 try{data=await response.json()}catch(_){throw new Error('PAYPAL_BACKEND_INVALID_RESPONSE')}
 if(!data||data.enabled!==true||data.environment!=='live')throw new Error('PAYPAL_LIVE_NOT_READY');
 if(!data.clientId||!/^[A-Za-z0-9_-]+$/.test(data.clientId))throw new Error('PAYPAL_LIVE_NOT_READY');
 plan={clientId:data.clientId,planId:data.planId,price:data.price,currency:data.currency,recurring:data.recurring,frequency:data.frequency,trialDays:data.trialDays===7?7:0};
 if(!plan.planId||!plan.recurring||plan.frequency!=='MONTH'||plan.price!=='6.00'||plan.currency!=='USD')throw new Error('INVALID_SUBSCRIPTION_PLAN');
 enabled=true;return settings;
}
async function authToken(){
 const api=window.TaskFlowFirebase;
 if(!api||typeof api.getIdToken!=='function')throw new Error('LOGIN_REQUIRED');
 const token=await api.getIdToken(false);
 if(!token||typeof token!=='string')throw new Error('LOGIN_REQUIRED');
 return token;
}
async function request(method,path,payload){
 const token=await authToken();
 const r=await fetch(settings.apiBase+path,{
  method,mode:'cors',cache:'no-store',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
  body:method==='POST'?JSON.stringify(payload||{}):undefined
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(new Error(data.error||'PAYMENT_UNAVAILABLE'),{status:r.status});
 return data;
}
async function verifyStatus(){
 if(statusPromise)return statusPromise;
 statusPromise=(async()=>{
  try{
   if(!enabled){await (ready||Promise.resolve());if(!enabled)return false}
   const data=await request('GET','/status');
   subscriptionStatus=data;
   setActive(data.active===true);return active;
  }catch(_){setActive(false);return false}
 })();
 try{return await statusPromise}finally{statusPromise=null}
}
async function waitForStatus(timeoutMs){
 await (ready||Promise.resolve());
 if(!enabled)return false;
 const wait=Math.min(4000,Math.max(0,Number(timeoutMs)||2000));
 return Promise.race([verifyStatus(),new Promise(resolve=>setTimeout(()=>resolve(false),wait))]);
}
function displayPeriod(){
 if(!plan)return '';
 return plan.trialDays===7?'7 días gratis. Después US$6.00 mensuales con renovación automática, cancelable antes del primer cobro.':'US$6.00 mensuales · Suscripción con renovación automática. Cancela cuando quieras; el beneficio dura hasta el final del período pagado.';
}
function configureCheckoutOffer(root){
 const trial=!!plan&&plan.trialDays===7;
 const price=root.querySelector('.tf-paypal-price');
 const period=root.querySelector('.tf-paypal-period');
 const notes=root.querySelector('#tfPayPalPlan');
 const buy=root.querySelector('#tfPayPalBuy');
 const details=root.querySelector('#tfPayPalTrialDetails');
 if(price)price.textContent=trial?'7 días gratis':'US$6.00';
 if(period)period.textContent=trial?'':'/ mes';
 if(notes)notes.textContent=trial
  ?'Después US$6.00/mes · Renovación automática'
  :'Renovación automática · Cancela cuando quieras';
 if(buy)buy.textContent=trial?'Comenzar prueba de 7 días':'Comprar ahora · US$6.00/mes';
 if(details)details.hidden=!trial;
}
function paypalSdk(){
 if(window.paypal&&typeof window.paypal.Buttons==='function')return Promise.resolve(window.paypal);
 if(sdkPromise)return sdkPromise;
 sdkPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  const qs=new URLSearchParams({'client-id':plan.clientId,currency:plan.currency,
   vault:'true',intent:'subscription',components:'buttons'});
  script.src='https://www.paypal.com/sdk/js?'+qs.toString();
  script.async=true;
  script.onload=()=>window.paypal?resolve(window.paypal):reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  script.onerror=()=>reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  document.head.appendChild(script);
 }).catch(error=>{sdkPromise=null;throw error});return sdkPromise;
}
async function waitForFirstPayment(root,target,subscriptionId=''){
 for(let i=0;i<15;i++){
  await new Promise(resolve=>setTimeout(resolve,3000));
  if(await verifyStatus()){
   target.replaceChildren();
   statusText(subscriptionStatus?.trialActive?'Tu prueba gratuita de 7 días ya está activa.':'Pago confirmado. Tu suscripción mensual sin anuncios está activa.');
   root.querySelector('#tfPayPalCancel').hidden=false;
   return true;
  }
  // PayPal may approve before changing the subscription status to ACTIVE.
  // Recheck the *same* PayPal subscription; never create another charge.
  if(subscriptionId&&pendingIntent){
   try{
    const result=await request('POST','/confirm',
      {subscriptionId,intent:pendingIntent});
    if(result.active&&(result.paid||result.trialActive)){
     subscriptionStatus=result;setActive(true);target.replaceChildren();
     statusText(result.trialActive?'Tu prueba gratuita de 7 días ya está activa.':'Pago confirmado. Tu suscripción mensual sin anuncios está activa.');
     root.querySelector('#tfPayPalCancel').hidden=false;
     return true;
    }
   }catch(_){/* Retry verification only; do not launch another checkout. */}
  }
 }
 statusText('La suscripción continúa en verificación. No inicies otra compra.');
 return false;
}
async function showCheckout(){
 const root=panel(),target=root.querySelector('#tfPayPalButtons');
 const buy=root.querySelector('#tfPayPalBuy'),cancel=root.querySelector('#tfPayPalCancel');
 root.hidden=false;target.replaceChildren();buy.hidden=false;buy.disabled=false;cancel.hidden=true;
 root.querySelector('#tfPayPalMethods').hidden=true;
 configureCheckoutOffer(root);
 statusText('');
 try{
  await (ready||Promise.resolve());
  if(!enabled){try{await config()}catch(_){/* No ofrecer un cargo sin servidor Live verificado. */}}
  if(!enabled){
   statusText('Los pagos aún no están habilitados. No se ha realizado ningún cargo.');
   return false;
  }
  configureCheckoutOffer(root);
  try{await authToken()}catch(_){
   statusText('Inicia sesión en TaskFlow antes de comprar. El pago se procesará de forma segura en PayPal.');
   return false;
  }
  if(await verifyStatus()){
   buy.hidden=true;
   statusText(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED'
    ?'Tu período sin anuncios sigue vigente y su renovación está cancelada.'
    :subscriptionStatus?.trialActive?'Tu prueba gratuita de 7 días está activa.':'Tu suscripción sin anuncios está activa. No se realizará otro cobro.');
   cancel.hidden=!!(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED');
   return true;
  }
  if(pendingApproval){
   buy.hidden=true;
   statusText('Hay una suscripción pendiente de confirmación. No inicies otro pago.');
   return false;
  }
  if(plan?.trialDays===7 && subscriptionStatus?.trialUsed){
   buy.hidden=true;
   statusText('Ya utilizaste tu prueba gratuita. Este plan no permite iniciar otra.');
   return false;
  }
  statusText('Elige PayPal o tarjeta y completa tu suscripción de forma segura.','guide');
  return true;
 }catch(_){
  statusText('No se pudo verificar el estado de PayPal. Puedes volver a intentarlo; no se ha realizado ningún cargo.');
  return false;
 }
}
async function beginPurchase(){
 const root=panel(),target=root.querySelector('#tfPayPalButtons');
 const buy=root.querySelector('#tfPayPalBuy');
 if(busy||buy.disabled)return false;
 buy.disabled=true;
 statusText('Conectando con PayPal…');
 try{
  await (ready||Promise.resolve());
  if(!enabled)await config();
  if(!enabled)throw new Error('NO_CHECKOUT');
  await authToken();
  // En una compra, exigir respuesta del servidor: un fallo de red no significa que
  // la cuenta esté libre de suscripción, y no debe arriesgarse un cobro duplicado.
  const current=await request('GET','/status');
  subscriptionStatus=current;
  setActive(current.active===true);
  if(current.active===true){
   buy.hidden=true;
   statusText(current.trialActive?'Tu prueba gratuita de 7 días está activa.':'Tu suscripción ya está activa. No se realizará otro cobro.');
   root.querySelector('#tfPayPalCancel').hidden=!!(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED');
   return true;
  }
  if(plan?.trialDays===7 && current.trialUsed)throw new Error('TRIAL_ALREADY_USED');
  if(pendingApproval)throw new Error('PAYMENT_PENDING');
  const pp=await paypalSdk();
  if(!pp||!pp.Buttons)throw new Error('PAYPAL_SDK_UNAVAILABLE');
  target.replaceChildren();
  const methods=root.querySelector('#tfPayPalMethods');
  methods.hidden=true;
  const buttons=pp.Buttons({
   style:{layout:'vertical',color:'blue',shape:'pill',height:54,label:'subscribe',tagline:false},
   createSubscription:async (_data,actions)=>{
    busy=true;
    try{
     const info=await request('POST','/intent');
     pendingIntent=info.intent;
     return actions.subscription.create({plan_id:plan.planId,custom_id:pendingIntent});
    }finally{busy=false}
   },
   onApprove:async data=>{
    busy=true;pendingApproval=true;
    methods.hidden=true;
    target.replaceChildren();
    statusText(plan?.trialDays===7?'Verificando tu prueba gratuita con PayPal…':'Comprobando la suscripción y el primer pago con PayPal…');
    try{
     if(!pendingIntent||!data.subscriptionID)throw new Error('INVALID_SUBSCRIPTION');
     const result=await request('POST','/confirm',
      {subscriptionId:data.subscriptionID,intent:pendingIntent});
     if(result.active&&(result.paid||result.trialActive)){
      subscriptionStatus=result;setActive(true);target.replaceChildren();
      statusText(result.trialActive?'Prueba gratuita activada: disfruta 7 días sin anuncios.':'Pago verificado. Tu suscripción mensual sin anuncios está activa.');
      root.querySelector('#tfPayPalCancel').hidden=false;
     }else{
      statusText('Suscripción aprobada; esperando confirmación del primer cobro. No se activará hasta verificarlo.');
      void waitForFirstPayment(root,target,data.subscriptionID);
     }
    }catch(_){
     statusText('La suscripción necesita confirmación. Se está comprobando su estado.');
     void waitForFirstPayment(root,target,data.subscriptionID);
    }
    finally{busy=false}
   },
   onCancel:()=>{pendingApproval=false;pendingIntent=null;statusText('Pago cancelado. No se ha modificado tu cuenta.')},
   onError:()=>statusText('PayPal no pudo completar la operación.')
  });
  if(buttons.isEligible&& !buttons.isEligible())throw new Error('PAYPAL_NOT_ELIGIBLE');
  await buttons.render(target);
  buy.hidden=true;
  methods.hidden=false;
  statusText('');
  return true;
 }catch(error){
  const code=String(error&&error.message||'');
  statusText(code==='LOGIN_REQUIRED'?'Inicia sesión en TaskFlow para comprar la suscripción.':
   code==='PAYMENT_PENDING'?'Hay una suscripción pendiente. Comprueba su estado antes de iniciar otro pago.':
   code==='TRIAL_ALREADY_USED'?'Ya utilizaste tu prueba gratuita. No puedes activarla una segunda vez.':
   code==='PUBLIC_CONFIG_UNAVAILABLE'?'No se pudo cargar la configuración de pago de TaskFlow. Vuelve a intentarlo. No se ha realizado ningún cargo.':
   code==='PAYPAL_BACKEND_UNAVAILABLE'?'El pago no está disponible: falta activar el servidor de suscripciones.':
   code==='PAYPAL_LIVE_NOT_READY'||code==='PAYPAL_BACKEND_INVALID_RESPONSE'||code==='INVALID_SUBSCRIPTION_PLAN'||code==='NO_CHECKOUT'||code==='NO_CONFIGURATION'?
   'El plan de US$6.00/mes todavía no está habilitado para compras.':
   code==='PAYPAL_SDK_UNAVAILABLE'||code==='PAYPAL_NOT_ELIGIBLE'?
   'PayPal no pudo mostrar el formulario de pago en este navegador. Comprueba que PayPal esté disponible e inténtalo de nuevo. No se ha realizado ningún cargo.':
   'No se pudo verificar la cuenta o iniciar el pago con el servidor. No se ha realizado ningún cargo.','error');
  return false;
 }finally{buy.disabled=false}
}
function onClick(event){
 const button=event.target&&event.target.closest&&event.target.closest('#btnNoAds,#qaNoAds,a[href="http://action_noads"],a[href="#tfNoAds"]');
 if(!button)return;
 event.preventDefault();event.stopImmediatePropagation();
 void showCheckout();
}
async function initialize(){
 document.addEventListener('click',onClick,true);
 window.addEventListener('focus',()=>{if(enabled)void verifyStatus()},{passive:true});
 document.addEventListener('taskflow:account-state-updated',()=>{if(enabled)void verifyStatus()});
 try{await config()}catch(_){return false}
 if(!enabled)return false;
 void verifyStatus();
 return true;
}
ready=(document.readyState==='loading'
 ?new Promise(resolve=>document.addEventListener('DOMContentLoaded',()=>resolve(initialize()),{once:true}))
 :initialize());
window.TaskFlowNoAds=Object.freeze({isActive:()=>active,refresh:verifyStatus,waitForStatus,showCheckout,
 ready:()=>ready});
})();