/* TaskFlow PayPal - checkout client (disabled until server and price are configured).
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
 #${MODAL_ID} #tfPayPalButtons{min-height:0;margin-top:18px}
 #${MODAL_ID} #tfPayPalCancel{display:block;margin:16px auto 0;padding:11px 15px;color:#ffe0d4;background:#241b32;border:1px solid #aa6673;border-radius:12px;font-weight:700}
 #${MODAL_ID} #tfPayPalCancel[hidden]{display:none!important}
 `;
 document.head.appendChild(s);
}
function panel(){
 style();let r=document.getElementById(MODAL_ID);if(r)return r;
 r=document.createElement('div');r.id=MODAL_ID;r.hidden=true;
 r.setAttribute('role','dialog');r.setAttribute('aria-modal','true');
 r.setAttribute('aria-label','Eliminar anuncios con PayPal');
 r.innerHTML='<section class="tf-paypal-panel"><button type="button" class="tf-paypal-close" aria-label="Cerrar">Cerrar</button><h2>TaskFlow sin anuncios</h2><p id="tfPayPalPlan"></p><div id="tfPayPalStatus" class="tf-paypal-status" role="status"></div><div id="tfPayPalButtons"></div><button id="tfPayPalCancel" type="button" hidden>Cancelar renovación automática</button></section>';
 r.querySelector('.tf-paypal-close').addEventListener('click',()=>{if(!busy)r.hidden=true});
 const cancel=r.querySelector('#tfPayPalCancel');
 cancel.addEventListener('click',async()=>{
  if(busy||!subscriptionStatus||subscriptionStatus.renewalStatus==='CANCELLED')return;
  busy=true;cancel.disabled=true;
  try{
   const info=await request('POST','/cancel');
   subscriptionStatus=info;
   statusText('Renovación cancelada. Conservas el acceso sin anuncios hasta el fin del período pagado.');
   cancel.hidden=true;
  }catch(_){statusText('No se pudo cancelar desde aquí. Inténtalo nuevamente.');cancel.disabled=false}
  finally{busy=false}
 });
 r.addEventListener('click',e=>{if(e.target===r&&!busy)r.hidden=true});
 document.body.appendChild(r);return r;
}
function statusText(msg){const e=document.getElementById('tfPayPalStatus');if(e)e.textContent=msg}
function setActive(next){
 active=next===true;
 if(active)pendingApproval=false;
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
 plan={clientId:data.clientId,planId:data.planId,price:data.price,currency:data.currency,recurring:data.recurring,frequency:data.frequency};
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
 return 'US$6.00 mensuales · Suscripción con renovación automática. Cancela cuando quieras; el beneficio dura hasta el final del período pagado.';
}
function paypalSdk(){
 if(window.paypal&&typeof window.paypal.Buttons==='function')return Promise.resolve(window.paypal);
 if(sdkPromise)return sdkPromise;
 sdkPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  const qs=new URLSearchParams({'client-id':plan.clientId,currency:plan.currency,
   vault:'true',intent:'subscription',components:'buttons'});
  script.src='https://www.paypal.com/sdk/js?'+qs.toString();
  script.async=true;script.onload=()=>window.paypal?resolve(window.paypal):reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  script.onerror=()=>reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  document.head.appendChild(script);
 });return sdkPromise;
}
async function waitForFirstPayment(root,target){
 for(let i=0;i<15;i++){
  await new Promise(resolve=>setTimeout(resolve,3000));
  if(await verifyStatus()){
   target.replaceChildren();
   statusText('Pago confirmado. Tu suscripción mensual sin anuncios está activa.');
   root.querySelector('#tfPayPalCancel').hidden=false;
   return true;
  }
 }
 statusText('El pago continúa pendiente de confirmación. No inicies otro cobro; consulta tu estado más tarde.');
 return false;
}
async function showCheckout(){
 if(busy)return false;
 try{await (ready||Promise.resolve());if(!enabled)return false;
  const root=panel(),target=root.querySelector('#tfPayPalButtons');
  root.hidden=false;target.replaceChildren();
  root.querySelector('#tfPayPalCancel').hidden=true;
  root.querySelector('#tfPayPalPlan').textContent=displayPeriod();
  statusText('Verificando la cuenta y el estado de los anuncios…');
  await authToken();
  if(await verifyStatus()){
   statusText(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED'
    ?'Tu período pagado continúa activo. La renovación automática está cancelada.'
    :'Tu suscripción está activa. No verás publicidad.');
   const cancel=root.querySelector('#tfPayPalCancel');
   cancel.hidden=!!(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED');
   return true
  }
  if(pendingApproval){statusText('La suscripción anterior está pendiente de confirmación. No inicies otro cobro.');return false}
  statusText('US$6.00 al mes. Elige PayPal o, cuando esté disponible, tarjeta de débito o crédito.');
  const pp=await paypalSdk();
  if(!pp||!pp.Buttons)throw new Error('PAYPAL_SDK_UNAVAILABLE');
  const buttons=pp.Buttons({
   style:{layout:'vertical',shape:'rect',label:'pay'},
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
    target.replaceChildren();
    statusText('Comprobando la suscripción y el primer pago con PayPal…');
    try{
     if(!pendingIntent||!data.subscriptionID)throw new Error('INVALID_SUBSCRIPTION');
     const result=await request('POST','/confirm',
      {subscriptionId:data.subscriptionID,intent:pendingIntent});
     if(result.paid&&result.active){
      subscriptionStatus=result;setActive(true);target.replaceChildren();
      statusText('Pago verificado. Tu suscripción mensual sin anuncios está activa.');
      root.querySelector('#tfPayPalCancel').hidden=false;
     }else{
      statusText('Suscripción aprobada; esperando confirmación del primer cobro. No se activará hasta verificarlo.');
      void waitForFirstPayment(root,target);
     }
    }catch(_){statusText('La suscripción necesita confirmación. Comprueba el estado antes de volver a pagar.');}
    finally{busy=false}
   },
   onCancel:()=>{pendingApproval=false;pendingIntent=null;statusText('Pago cancelado. No se ha modificado tu cuenta.')},
   onError:()=>statusText('PayPal no pudo completar la operación.')
  });
  if(buttons.isEligible&& !buttons.isEligible())throw new Error('PAYPAL_NOT_ELIGIBLE');
  await buttons.render(target);return true;
 }catch(error){
  const root=panel();root.hidden=false;
  statusText(error.message==='LOGIN_REQUIRED'?'Inicia sesión en TaskFlow para continuar.':
   'La suscripción todavía no está disponible. No hemos iniciado ningún cargo.');
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
window.TaskFlowNoAds=Object.freeze({isActive:()=>active,refresh:verifyStatus,waitForStatus,showCheckout,
 ready:()=>ready});
})();