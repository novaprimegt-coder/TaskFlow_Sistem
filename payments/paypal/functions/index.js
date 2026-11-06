'use strict';
// TaskFlow no-ads checkout: only Firebase-authenticated accounts can buy.
// Never expose PayPal secrets or grant an entitlement from a browser callback.
const {onRequest}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const admin=require('firebase-admin');
if(!admin.apps.length)admin.initializeApp();
const db=admin.firestore();
const clientId=defineSecret('TASKFLOW_PAYPAL_CLIENT_ID');
const clientSecret=defineSecret('TASKFLOW_PAYPAL_CLIENT_SECRET');
const webhookId=defineSecret('TASKFLOW_PAYPAL_WEBHOOK_ID');
const ORIGIN='https://novaprimegt-coder.github.io';

function offer(){
 const price=String(process.env.NOADS_PRICE||'').trim();
 const currency=String(process.env.NOADS_CURRENCY||'').trim().toUpperCase();
 const duration=String(process.env.NOADS_DURATION||'').trim().toLowerCase();
 const mode=String(process.env.PAYPAL_ENV||'sandbox').toLowerCase();
 if(!/^\d{1,5}\.\d{2}$/.test(price)||Number(price)<=0||
    !['USD','EUR','GBP'].includes(currency)||
    !(duration==='lifetime'||/^[1-9]\d{0,3}$/.test(duration))||
    !['sandbox','live'].includes(mode))return null;
 return {price,currency,duration,mode};
}
function active(ent){return !!(ent&&ent.state==='active'&&
 (ent.expiresAt===null||(Number(ent.expiresAt)>Date.now())))}
function cors(req,res){
 res.set('Vary','Origin');res.set('Cache-Control','no-store');
 res.set('X-Content-Type-Options','nosniff');
 const origin=req.get('origin');
 if(origin&&origin!==ORIGIN)return false;
 if(origin)res.set('Access-Control-Allow-Origin',ORIGIN);
 res.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');
 res.set('Access-Control-Allow-Headers','Authorization,Content-Type');
 return true;
}
function json(res,status,value){res.status(status).json(value)}
async function auth(req){
 const match=String(req.get('authorization')||'').match(/^Bearer ([^\s]+)$/i);
 if(!match)throw Object.assign(new Error('SESSION_REQUIRED'),{status:401});
 const verified=await admin.auth().verifyIdToken(match[1],true);
 if(!verified.uid)throw Object.assign(new Error('SESSION_REQUIRED'),{status:401});
 return verified.uid;
}
async function payPal(path,method,body,requestId){
 const conf=offer();if(!conf)throw new Error('PAYMENTS_NOT_CONFIGURED');
 const id=clientId.value(),secret=clientSecret.value();
 if(!id||!secret)throw new Error('PAYPAL_CREDENTIALS_MISSING');
 const root=conf.mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
 const authHeader=Buffer.from(id+':'+secret).toString('base64');
 const tokenResponse=await fetch(root+'/v1/oauth2/token',{
  method:'POST',headers:{Authorization:'Basic '+authHeader,'Content-Type':'application/x-www-form-urlencoded'},
  body:'grant_type=client_credentials',signal:AbortSignal.timeout(12000)
 });
 if(!tokenResponse.ok)throw new Error('PAYPAL_AUTH_FAILED');
 const access=(await tokenResponse.json()).access_token;
 if(!access)throw new Error('PAYPAL_AUTH_FAILED');
 const headers={Authorization:'Bearer '+access,'Content-Type':'application/json'};
 if(requestId)headers['PayPal-Request-Id']=requestId;
 const response=await fetch(root+path,{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(18000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Object.assign(new Error('PAYPAL_REQUEST_FAILED'),{httpStatus:response.status,detail:data});
 return data;
}
async function status(uid){
 const doc=await db.doc('users/'+uid+'/entitlements/noAds').get();
 const ent=doc.exists?doc.data():null;
 return {active:active(ent),expiresAt:active(ent)?ent.expiresAt:null,
  plan:active(ent)?(ent.plan||null):null};
}
async function createOrder(uid,res){
 const conf=offer();if(!conf)return json(res,503,{error:'PAYMENTS_NOT_CONFIGURED'});
 if((await status(uid)).active)return json(res,409,{error:'ALREADY_ACTIVE'});
 const order=await payPal('/v2/checkout/orders','POST',{
  intent:'CAPTURE',purchase_units:[{description:'TaskFlow - eliminar anuncios',
  amount:{currency_code:conf.currency,value:conf.price}}]
 });
 if(!/^[A-Z0-9-]{8,50}$/i.test(String(order.id||'')))throw new Error('PAYPAL_ORDER_INVALID');
 await db.doc('taskflowPayPalOrders/'+order.id).create({
  uid,amount:conf.price,currency:conf.currency,duration:conf.duration,
  environment:conf.mode,status:'CREATED',
  createdAt:admin.firestore.FieldValue.serverTimestamp()
 });
 json(res,200,{orderId:order.id});
}
function captured(order,expected){
 if(order.status!=='COMPLETED'||!Array.isArray(order.purchase_units)||order.purchase_units.length!==1)return null;
 const unit=order.purchase_units[0];
 const captures=unit.payments&&unit.payments.captures||[];
 if(captures.length!==1)return null;
 const payment=captures[0];
 if(payment.status!=='COMPLETED'||!payment.id||!payment.amount)return null;
 if(payment.amount.currency_code!==expected.currency||payment.amount.value!==expected.amount)return null;
 if(unit.amount&&(unit.amount.currency_code!==expected.currency||unit.amount.value!==expected.amount))return null;
 return payment;
}
async function captureOrder(uid,orderId,res){
 if(!/^[A-Z0-9-]{8,50}$/i.test(orderId))return json(res,400,{error:'ORDER_INVALID'});
 const ref=db.doc('taskflowPayPalOrders/'+orderId);
 const before=await ref.get();if(!before.exists||before.data().uid!==uid)return json(res,404,{error:'ORDER_UNKNOWN'});
 const expected=before.data();
 if(expected.status==='COMPLETED')return json(res,200,{paid:true,...await status(uid)});
 if(expected.environment!==(offer()||{}).mode)return json(res,409,{error:'PAYMENT_MODE_CHANGED'});
 let order;
 try{
  order=await payPal('/v2/checkout/orders/'+encodeURIComponent(orderId)+'/capture','POST',{},'tf-noads-'+orderId);
 }catch(error){
  // A capture may have succeeded before a lost network response.
  if(error.httpStatus!==422)throw error;
  order=await payPal('/v2/checkout/orders/'+encodeURIComponent(orderId),'GET');
 }
 const payment=captured(order,expected);
 if(!payment)return json(res,409,{error:'PAYMENT_NOT_COMPLETED'});
 const entRef=db.doc('users/'+uid+'/entitlements/noAds');
 const paidRef=db.doc('taskflowPayPalCaptures/'+payment.id);
 await db.runTransaction(async tx=>{
  const [record,already,entDoc]=await Promise.all([tx.get(ref),tx.get(paidRef),tx.get(entRef)]);
  if(!record.exists||record.data().uid!==uid||record.data().environment!==expected.environment)throw new Error('PAYMENT_OWNER_MISMATCH');
  if(already.exists&&already.data().uid!==uid)throw new Error('PAYMENT_ALREADY_CLAIMED');
  if(already.exists)return;
  const current=entDoc.exists?entDoc.data():null;
  if(active(current))throw new Error('ALREADY_ACTIVE');
  const expiresAt=expected.duration==='lifetime'?null:Date.now()+Number(expected.duration)*86400000;
  tx.create(paidRef,{uid,orderId,amount:expected.amount,currency:expected.currency,
   status:'COMPLETED',createdAt:admin.firestore.FieldValue.serverTimestamp()});
  tx.set(entRef,{state:'active',plan:'noAds',expiresAt,captureId:payment.id,orderId,
   updatedAt:admin.firestore.FieldValue.serverTimestamp()});
  tx.update(ref,{status:'COMPLETED',captureId:payment.id,
   completedAt:admin.firestore.FieldValue.serverTimestamp()});
 });
 json(res,200,{paid:true,...await status(uid)});
}
async function processWebhook(req,res){
 const conf=offer();if(!conf||!webhookId.value())return json(res,503,{error:'WEBHOOK_NOT_CONFIGURED'});
 const event=req.body;
 if(!event||typeof event!=='object')return json(res,400,{error:'INVALID_WEBHOOK'});
 const verified=await payPal('/v1/notifications/verify-webhook-signature','POST',{
  auth_algo:req.get('paypal-auth-algo'),
  cert_url:req.get('paypal-cert-url'),
  transmission_id:req.get('paypal-transmission-id'),
  transmission_sig:req.get('paypal-transmission-sig'),
  transmission_time:req.get('paypal-transmission-time'),
  webhook_id:webhookId.value(),webhook_event:event
 });
 if(verified.verification_status!=='SUCCESS')return json(res,401,{error:'INVALID_SIGNATURE'});
 if(!['PAYMENT.CAPTURE.REFUNDED','PAYMENT.CAPTURE.REVERSED'].includes(event.event_type))return json(res,200,{ok:true});
 const resource=event.resource||{};
 const captureId=String((resource.supplementary_data&&resource.supplementary_data.related_ids&&resource.supplementary_data.related_ids.capture_id)||resource.id||'');
 if(!/^[A-Z0-9-]{5,80}$/i.test(captureId))return json(res,200,{ok:true});
 const paidRef=db.doc('taskflowPayPalCaptures/'+captureId),paid=await paidRef.get();
 if(!paid.exists)return json(res,200,{ok:true});
 const entRef=db.doc('users/'+paid.data().uid+'/entitlements/noAds');
 await db.runTransaction(async tx=>{
  const [p,e]=await Promise.all([tx.get(paidRef),tx.get(entRef)]);
  if(!p.exists)return;
  tx.update(paidRef,{status:'REVOKED',reversedAt:admin.firestore.FieldValue.serverTimestamp()});
  if(e.exists&&e.data().captureId===captureId)
   tx.update(entRef,{state:'revoked',updatedAt:admin.firestore.FieldValue.serverTimestamp()});
 });
 json(res,200,{ok:true});
}
exports.taskflowNoAds=onRequest({region:'us-central1',timeoutSeconds:45,memory:'256MiB',
 secrets:[clientId,clientSecret,webhookId],maxInstances:10},async(req,res)=>{
 if(!cors(req,res))return json(res,403,{error:'ORIGIN_NOT_ALLOWED'});
 if(req.method==='OPTIONS')return res.status(204).end();
 try{
  const route=req.path.replace(/\/$/,'')||'/';
  if(req.method==='POST'&&route==='/paypal/webhook')return await processWebhook(req,res);
  if(req.method==='GET'&&route==='/config'){
   const conf=offer();
   return json(res,200,conf?{enabled:true,clientId:clientId.value(),currency:conf.currency,
    amount:conf.price,duration:conf.duration,mode:conf.mode}:{enabled:false});
  }
  const uid=await auth(req);
  if(req.method==='GET'&&route==='/status')return json(res,200,await status(uid));
  if(req.method==='POST'&&route==='/orders')return await createOrder(uid,res);
  const match=route.match(/^\/orders\/([A-Za-z0-9-]{8,50})\/capture$/);
  if(req.method==='POST'&&match)return await captureOrder(uid,match[1],res);
  json(res,404,{error:'NOT_FOUND'});
 }catch(e){
  console.error('TaskFlow PayPal backend:',e.message);
  json(res,e.status||500,{error:e.status?'SESSION_REQUIRED':'PAYMENT_UNAVAILABLE'});
 }
});