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
 document.head.appendChild(s);
}
function panel(){
 style();let r=document.getElementById(MODAL_ID);if(r)return r;
 r=document.createElement('div');r.id=MODAL_ID;r.hidden=true;
 r.setAttribute('role','dialog');r.setAttribute('aria-modal','true');
 r.setAttribute('aria-label','Eliminar anuncios con PayPal');
 r.innerHTML='<section class="tf-paypal-panel"><button type="button" class="tf-paypal-close" aria-label="Cerrar">Cerrar</button><h2>TaskFlow sin anuncios</h2><p id="tfPayPalPlan"></p><p class="tf-paypal-info">Sin banners, anuncios de entrada ni anuncios por interacción. Pago recurrente; puedes cancelar la renovación cuando quieras y conservar el período pagado.</p><button id="tfPayPalBuy" class="tf-paypal-buy" type="button">Comprar ahora · US$6.00/mes</button><div id="tfPayPalStatus" class="tf-paypal-status" role="status" aria-live="polite"></div><div id="tfPayPalButtons"></div><button id="tfPayPalCancel" type="button" hidden>Cancelar renovación automática</button></section>';
 r.querySelector('.tf-paypal-close').addEventListener('click',()=>{if(!busy)r.hidden=true});
 r.querySelector('#tfPayPalBuy').addEventListener('click',()=>{void beginPurchase()});
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
  script.async=true;
  script.onload=()=>window.paypal?resolve(window.paypal):reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  script.onerror=()=>reject(new Error('PAYPAL_SDK_UNAVAILABLE'));
  document.head.appendChild(script);
 }).catch(error=>{sdkPromise=null;throw error});return sdkPromise;
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
 const root=panel(),target=root.querySelector('#tfPayPalButtons');
 const buy=root.querySelector('#tfPayPalBuy'),cancel=root.querySelector('#tfPayPalCancel');
 root.hidden=false;target.replaceChildren();buy.hidden=false;buy.disabled=false;cancel.hidden=true;
 root.querySelector('#tfPayPalPlan').textContent='US$6.00 mensuales · Renovación automática.';
 statusText('Consulta las condiciones y pulsa «Comprar ahora» para continuar con PayPal.');
 try{
  await (ready||Promise.resolve());
  if(!enabled){try{await config()}catch(_){/* No ofrecer un cargo sin servidor Live verificado. */}}
  if(!enabled){
   statusText('La opción de compra está visible, pero PayPal Live aún no está habilitado para procesar suscripciones. No se ha realizado ningún cargo.');
   return false;
  }
  try{await authToken()}catch(_){
   statusText('Inicia sesión en TaskFlow antes de comprar. El pago se procesará de forma segura en PayPal.');
   return false;
  }
  if(await verifyStatus()){
   buy.hidden=true;
   statusText(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED'
    ?'Ya tienes un período pagado sin anuncios. Su renovación automática está cancelada.'
    :'Tu suscripción sin anuncios está activa. No se realizará otro cobro.');
   cancel.hidden=!!(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED');
   return true;
  }
  if(pendingApproval){
   buy.hidden=true;
   statusText('Hay una suscripción pendiente de confirmación. No inicies otro pago.');
   return false;
  }
  statusText('Pulsa «Comprar ahora» para elegir PayPal o tarjeta, si está disponible.');
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
 statusText('Conectando con PayPal para verificar el plan mensual…');
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
   statusText('Tu suscripción ya está activa. No se realizará otro cobro.');
   root.querySelector('#tfPayPalCancel').hidden=!!(subscriptionStatus&&subscriptionStatus.renewalStatus==='CANCELLED');
   return true;
  }
  if(pendingApproval)throw new Error('PAYMENT_PENDING');
  const pp=await paypalSdk();
  if(!pp||!pp.Buttons)throw new Error('PAYPAL_SDK_UNAVAILABLE');
  target.replaceChildren();
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
  await buttons.render(target);
  buy.hidden=true;
  statusText('Completa la autorización en PayPal. TaskFlow activará el beneficio solo cuando confirme el cobro.');
  return true;
 }catch(error){
  const code=String(error&&error.message||'');
  statusText(code==='LOGIN_REQUIRED'?'Inicia sesión en TaskFlow para comprar la suscripción.':
   code==='PAYMENT_PENDING'?'Hay una suscripción pendiente. Comprueba su estado antes de iniciar otro pago.':
   code==='PUBLIC_CONFIG_UNAVAILABLE'?'No se pudo cargar la configuración de pago de TaskFlow. Vuelve a intentarlo. No se ha realizado ningún cargo.':
   code==='PAYPAL_BACKEND_UNAVAILABLE'?'El servidor de suscripciones de Firebase no está disponible. Debe desplegarse y activarse PayPal Live para procesar compras reales. No se ha realizado ningún cargo.':
   code==='PAYPAL_LIVE_NOT_READY'||code==='PAYPAL_BACKEND_INVALID_RESPONSE'||code==='INVALID_SUBSCRIPTION_PLAN'||code==='NO_CHECKOUT'||code==='NO_CONFIGURATION'?
   'El servidor todavía no ha habilitado el plan PayPal Live de US$6.00 al mes. No se ha realizado ningún cargo.':
   code==='PAYPAL_SDK_UNAVAILABLE'||code==='PAYPAL_NOT_ELIGIBLE'?
   'PayPal no pudo mostrar el formulario de pago en este navegador. Comprueba que PayPal esté disponible e inténtalo de nuevo. No se ha realizado ningún cargo.':
   'No se pudo verificar la cuenta o iniciar el pago con el servidor. No se ha realizado ningún cargo.');
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