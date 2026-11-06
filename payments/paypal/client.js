/* TaskFlow PayPal - checkout client (disabled until server and price are configured).
   Only server-confirmed entitlements disable ads. No card data is handled here. */
(function(){
'use strict';
if(window.TaskFlowNoAds)return;
const CFG_URL=new URL('payments/paypal/public-config.json',document.baseURI).href;
const CSS_ID='tfPayPalNoAdsStyle',MODAL_ID='tfPayPalNoAdsModal';
let settings=null,plan=null,enabled=false,active=false,busy=false,ready=null,sdkPromise=null;
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
 #${MODAL_ID} #tfPayPalButtons{min-height:0;margin-top:18px}
 `;
 document.head.appendChild(s);
}
function panel(){
 style();let r=document.getElementById(MODAL_ID);if(r)return r;
 r=document.createElement('div');r.id=MODAL_ID;r.hidden=true;
 r.setAttribute('role','dialog');r.setAttribute('aria-modal','true');
 r.setAttribute('aria-label','Eliminar anuncios con PayPal');
 r.innerHTML='<section class="tf-paypal-panel"><button type="button" class="tf-paypal-close" aria-label="Cerrar">Cerrar</button><h2>TaskFlow sin anuncios</h2><p id="tfPayPalPlan"></p><div id="tfPayPalStatus" class="tf-paypal-status" role="status"></div><div id="tfPayPalButtons"></div></section>';
 r.querySelector('.tf-paypal-close').addEventListener('click',()=>{if(!busy)r.hidden=true});
 r.addEventListener('click',e=>{if(e.target===r&&!busy)r.hidden=true});
 document.body.appendChild(r);return r;
}
function statusText(msg){const e=document.getElementById('tfPayPalStatus');if(e)e.textContent=msg}
function setActive(next){
 active=next===true;
 if(document.body)document.body.classList.toggle('tf-paypal-noads',active);
 try{document.dispatchEvent(new CustomEvent('taskflow:noads-status-updated',{detail:{active}}))}catch(_){}
}
async function config(){
 if(settings!==null)return settings;
 const r=await fetch(CFG_URL,{cache:'no-store',credentials:'omit'});
 if(!r.ok)throw new Error('NO_CONFIGURATION');
 const c=await r.json();const base=safeBase(c.apiBase);
 settings={enabled:c.enabled===true&&!!base,apiBase:base};
 if(!settings.enabled)return settings;
 const response=await fetch(base+'/config',{cache:'no-store',credentials:'omit'});
 if(!response.ok)throw new Error('NO_CHECKOUT');
 const data=await response.json();
 if(!data.enabled||!data.clientId||!/^[A-Za-z0-9_-]+$/.test(data.clientId))throw new Error('NO_CHECKOUT');
 plan={clientId:data.clientId,amount:data.amount,currency:data.currency,duration:data.duration,mode:data.mode};
 enabled=true;return settings;
}
async function authToken(){
 const api=window.TaskFlowFirebase;
 if(!api||typeof api.getIdToken!=='function')throw new Error('LOGIN_REQUIRED');
 const token=await api.getIdToken(false);
 if(!token||typeof token!=='string')throw new Error('LOGIN_REQUIRED');
 return token;
}
async function request(method,path){
 const token=await authToken();
 const r=await fetch(settings.apiBase+path,{
  method,mode:'cors',cache:'no-store',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
  body:method==='POST'?'{}':undefined
 });
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Object.assign(new Error(data.error||'PAYMENT_UNAVAILABLE'),{status:r.status});
 return data;
}
async function verifyStatus(){
 try{
  await (ready||Promise.resolve());
  if(!enabled)return false;
  const data=await request('GET','/status');
  setActive(data.active===true);return active;
 }catch(_){setActive(false);return false}
}
function displayPeriod(){
 if(!plan)return '';
 const period=plan.duration==='lifetime'?'un único pago, sin fecha de vencimiento':
  'un pago por '+Number(plan.duration)+' día(s), sin renovación automática';
 return plan.amount+' '+plan.currency+' — '+period+'.';
}
function paypalSdk(){
 if(window.paypal&&typeof window.paypal.Buttons==='function')return Promise.resolve(window.paypal);
 if(sdkPromise)return sdkPromise;
 sdkPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  const qs=new URLSearchParams({'client-id':plan.clientId,currency:plan.currency,
   intent:'capture',components:'buttons'});
  script.src='https://www.paypal.com/sdk/js?'+qs.toString();
  script.async=true;script.onload=()=>window.paypal?resolve(window.paypal):reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  script.onerror=()=>reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  document.head.appendChild(script);
 });return sdkPromise;
}
async function showCheckout(){
 try{await (ready||Promise.resolve());if(!enabled)return false;
  const root=panel(),target=root.querySelector('#tfPayPalButtons');
  root.hidden=false;target.replaceChildren();
  root.querySelector('#tfPayPalPlan').textContent=displayPeriod();
  statusText('Verificando la cuenta y el estado de los anuncios…');
  await authToken();
  if(await verifyStatus()){statusText('Tu cuenta ya tiene la eliminación de anuncios activa.');return true}
  statusText('Elige PayPal o, cuando esté disponible, tarjeta de débito o crédito.');
  const pp=await paypalSdk();
  if(!pp||!pp.Buttons)throw new Error('PAYPAL_SDK_UNAVAILABLE');
  const buttons=pp.Buttons({
   style:{layout:'vertical',shape:'rect',label:'pay'},
   createOrder:async()=>{busy=true;try{const result=await request('POST','/orders');return result.orderId}finally{busy=false}},
   onApprove:async data=>{
    busy=true;statusText('Verificando tu pago con PayPal…');
    try{
     const result=await request('POST','/orders/'+encodeURIComponent(data.orderID)+'/capture');
     if(!result.paid||!result.active)throw new Error('PAYMENT_NOT_COMPLETED');
     setActive(true);target.replaceChildren();statusText('Pago confirmado. Publicidad desactivada para esta cuenta.');
    }catch(error){statusText('No se pudo confirmar el pago. No se activó el beneficio.');}
    finally{busy=false}
   },
   onCancel:()=>statusText('Pago cancelado. No se ha modificado tu cuenta.'),
   onError:()=>statusText('PayPal no pudo completar la operación.')
  });
  if(buttons.isEligible&& !buttons.isEligible())throw new Error('PAYPAL_NOT_ELIGIBLE');
  await buttons.render(target);return true;
 }catch(error){
  const root=panel();root.hidden=false;
  statusText(error.message==='LOGIN_REQUIRED'?'Inicia sesión en TaskFlow para continuar.':
   'El pago todavía no está disponible. No se ha realizado ningún cargo.');
  return false;
 }
}
function onClick(event){
 const button=event.target&&event.target.closest&&event.target.closest('#btnNoAds,a[href="http://action_noads"]');
 if(!button||!enabled)return;
 event.preventDefault();event.stopImmediatePropagation();
 void showCheckout();
}
async function initialize(){
 try{await config()}catch(_){return false}
 if(!enabled)return false;
 document.addEventListener('click',onClick,true);
 void verifyStatus();
 window.addEventListener('focus',()=>void verifyStatus(),{passive:true});
 document.addEventListener('taskflow:account-state-updated',()=>void verifyStatus());
 return true;
}
ready=(document.readyState==='loading'
 ?new Promise(resolve=>document.addEventListener('DOMContentLoaded',()=>resolve(initialize()),{once:true}))
 :initialize());
window.TaskFlowNoAds=Object.freeze({isActive:()=>active,refresh:verifyStatus,showCheckout,
 ready:()=>ready});
})();