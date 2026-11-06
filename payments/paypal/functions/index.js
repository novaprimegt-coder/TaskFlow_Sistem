'use strict';
// TaskFlow no-ads: US$6 recurring every calendar month.
// No benefit is granted by an unverified browser callback.
const crypto=require('node:crypto');
const {onRequest}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const admin=require('firebase-admin');
if(!admin.apps.length)admin.initializeApp();
const db=admin.firestore();
const clientId=defineSecret('TASKFLOW_PAYPAL_CLIENT_ID');
const clientSecret=defineSecret('TASKFLOW_PAYPAL_CLIENT_SECRET');
const webhookId=defineSecret('TASKFLOW_PAYPAL_WEBHOOK_ID');
const ORIGIN='https://novaprimegt-coder.github.io';
const PRICE='6.00', CURRENCY='USD';
const PLAN=String(process.env.TASKFLOW_PAYPAL_MONTHLY_PLAN_ID||'').trim();
const ENV=String(process.env.PAYPAL_ENV||'sandbox').toLowerCase();
const ID_PATTERN=/^I-[A-Za-z0-9-]{8,64}$/;
const PAYPAL_ID=/^[A-Za-z0-9-]{5,100}$/;
let cachedPlanAt=0,cachedPlanValid=false;
function configured(){return ['sandbox','live'].includes(ENV)&&/^P-[A-Za-z0-9-]{8,64}$/.test(PLAN)&&!!clientId.value()&&!!clientSecret.value()}
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
function json(res,code,body){return res.status(code).json(body)}
function entRef(uid){return db.doc('taskflowPayPalEntitlements/'+uid)}
function subscriptionRef(id){return db.doc('taskflowPayPalSubscriptions/'+id)}
function intentRef(id){return db.doc('taskflowPayPalIntents/'+id)}
function saleRef(id){return db.doc('taskflowPayPalSales/'+id)}
function paid(ent){return !!(ent&&ent.state!=='revoked'&&Number(ent.paidUntil)>Date.now()&&ent.subscriptionId)}
function publicStatus(ent){
  return {active:paid(ent),price:PRICE,currency:CURRENCY,frequency:'MONTH',
    subscriptionId:ent&&ent.subscriptionId||null,
    paidUntil:ent&&ent.paidUntil||null,
    renewalStatus:ent&&ent.renewalStatus||null};
}
async function requireUser(req){
  const match=String(req.get('authorization')||'').match(/^Bearer ([^\s]+)$/i);
  if(!match)throw Object.assign(new Error('AUTH_REQUIRED'),{status:401});
  const user=await admin.auth().verifyIdToken(match[1],true);
  if(!user.uid)throw Object.assign(new Error('AUTH_REQUIRED'),{status:401});
  return user.uid;
}
async function paypal(path,method='GET',body){
  if(!configured())throw new Error('PAYPAL_NOT_CONFIGURED');
  const root=ENV==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
  const basic=Buffer.from(clientId.value()+':'+clientSecret.value()).toString('base64');
  const tokenReq=await fetch(root+'/v1/oauth2/token',{method:'POST',
    headers:{Authorization:'Basic '+basic,'Content-Type':'application/x-www-form-urlencoded'},
    body:'grant_type=client_credentials',signal:AbortSignal.timeout(12000)});
  if(!tokenReq.ok)throw new Error('PAYPAL_AUTH_FAILED');
  const {access_token:token}=await tokenReq.json();
  if(!token)throw new Error('PAYPAL_AUTH_FAILED');
  const response=await fetch(root+path,{method,
    headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
    body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(18000)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Object.assign(new Error('PAYPAL_HTTP_'+response.status),{code:response.status});
  return data;
}
function monthlyPlanValid(plan){
  const cycles=Array.isArray(plan&&plan.billing_cycles)?plan.billing_cycles:[];
  const regular=cycles.filter(c=>c.tenure_type==='REGULAR');
  return plan&&plan.id===PLAN&&plan.status==='ACTIVE'&&cycles.length===1&&regular.length===1&&
    regular[0].frequency&&regular[0].frequency.interval_unit==='MONTH'&&
    Number(regular[0].frequency.interval_count)===1&&
    Number(regular[0].total_cycles)===0&&
    regular[0].pricing_scheme&&regular[0].pricing_scheme.fixed_price&&
    regular[0].pricing_scheme.fixed_price.currency_code===CURRENCY&&
    Number(regular[0].pricing_scheme.fixed_price.value)===Number(PRICE)&&
    Number(plan.payment_preferences&&plan.payment_preferences.setup_fee&&plan.payment_preferences.setup_fee.value||0)===0;
}
async function verifyPlan(){
  if(Date.now()-cachedPlanAt<120000)return cachedPlanValid;
  const data=await paypal('/v1/billing/plans/'+encodeURIComponent(PLAN));
  cachedPlanValid=!!monthlyPlanValid(data);
  cachedPlanAt=Date.now();
  return cachedPlanValid;
}
function lastPayment(sub){
  const last=sub&&sub.billing_info&&sub.billing_info.last_payment;
  if(!last||!last.amount||last.amount.currency_code!==CURRENCY||
      Number(last.amount.value)!==Number(PRICE))return null;
  const when=Date.parse(last.time||'');
  if(!Number.isFinite(when)||when>Date.now()+300000||when<Date.now()-45*86400000)return null;
  return when;
}
function monthAfter(time){
  const d=new Date(time),day=d.getUTCDate();
  const first=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1,d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds()));
  const daysInMonth=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
  first.setUTCDate(Math.min(day,daysInMonth));
  return first.getTime();
}
function periodEnd(sub,paidAt){
  const next=Date.parse(sub&&sub.billing_info&&sub.billing_info.next_billing_time||'');
  if(sub.status==='ACTIVE'&&Number.isFinite(next)&&next>paidAt&&next<=paidAt+40*86400000)return next;
  return monthAfter(paidAt);
}
async function paypalSubscription(id){
  if(!ID_PATTERN.test(id))throw Object.assign(new Error('INVALID_SUBSCRIPTION'),{status:400});
  const sub=await paypal('/v1/billing/subscriptions/'+encodeURIComponent(id));
  if(sub.id!==id||sub.plan_id!==PLAN)throw Object.assign(new Error('PLAN_MISMATCH'),{status:409});
  return sub;
}
async function assignPayment(uid,sub,source,saleId){
  const timestamp=lastPayment(sub);
  if(!timestamp)return false;
  if(!['ACTIVE','CANCELLED'].includes(sub.status))return false;
  const period=periodEnd(sub,timestamp);
  if(period<=Date.now())return false;
  const ref=entRef(uid), linked=subscriptionRef(sub.id);
  await db.runTransaction(async tx=>{
    const [entSnap,subSnap]=await Promise.all([tx.get(ref),tx.get(linked)]);
    if(subSnap.exists&&subSnap.data().uid!==uid)throw new Error('SUBSCRIPTION_ALREADY_LINKED');
    const old=entSnap.exists?entSnap.data():null;
    if(old&&old.subscriptionId&&old.subscriptionId!==sub.id&&paid(old))throw new Error('ALREADY_SUBSCRIBED');
    if(old&&old.subscriptionId===sub.id&&old.state==='revoked'&&Number(old.lastPaidAt)>=timestamp)return;
    if(old&&old.subscriptionId===sub.id&&Number(old.lastPaidAt)>timestamp)return;
    tx.set(linked,{uid,planId:PLAN,environment:ENV,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    tx.set(ref,Object.assign({uid,subscriptionId:sub.id,planId:PLAN,state:'active',renewalStatus:sub.status,
      lastPaidAt:timestamp,paidUntil:period,source,
      updatedAt:admin.firestore.FieldValue.serverTimestamp()},
      saleId?{lastSaleId:saleId}:{}),{merge:true});
  });
  return true;
}
async function accountStatus(uid){
  const snap=await entRef(uid).get();
  return publicStatus(snap.exists?snap.data():null);
}
async function createIntent(uid,res){
  if(!await verifyPlan())return json(res,503,{error:'PLAN_NOT_READY'});
  if((await accountStatus(uid)).active)return json(res,409,{error:'ALREADY_SUBSCRIBED'});
  const id=crypto.randomUUID();
  await intentRef(id).create({uid,planId:PLAN,createdAt:Date.now(),expiresAt:Date.now()+30*60000});
  return json(res,200,{intent:id});
}
async function confirmSubscription(uid,req,res){
  const id=String(req.body&&req.body.subscriptionId||'');
  const nonce=String(req.body&&req.body.intent||'');
  if(!ID_PATTERN.test(id)||!/^[a-f0-9-]{36}$/.test(nonce))return json(res,400,{error:'INVALID_CONFIRMATION'});
  const intentSnap=await intentRef(nonce).get();
  if(!intentSnap.exists||intentSnap.data().uid!==uid||intentSnap.data().planId!==PLAN||
     Number(intentSnap.data().expiresAt)<Date.now())return json(res,403,{error:'INTENT_INVALID'});
  if(!await verifyPlan())return json(res,503,{error:'PLAN_NOT_READY'});
  const sub=await paypalSubscription(id);
  if(sub.custom_id!==nonce)return json(res,403,{error:'SUBSCRIPTION_NOT_OWNED'});
  if(sub.status==='APPROVAL_PENDING'||sub.status==='APPROVED')return json(res,202,{paid:false,pending:true});
  if(sub.status!=='ACTIVE')return json(res,409,{error:'SUBSCRIPTION_NOT_ACTIVE'});
  const linked=await subscriptionRef(id).get();
  if(linked.exists&&linked.data().uid!==uid)return json(res,409,{error:'SUBSCRIPTION_ALREADY_LINKED'});
  if(!await assignPayment(uid,sub,'paypal-confirm'))return json(res,202,{paid:false,pending:true});
  return json(res,200,{paid:true,...await accountStatus(uid)});
}
async function cancelSubscription(uid,res){
  const snap=await entRef(uid).get();
  if(!snap.exists||!snap.data().subscriptionId)return json(res,404,{error:'SUBSCRIPTION_NOT_FOUND'});
  const subId=snap.data().subscriptionId;
  const sub=await paypalSubscription(subId);
  if(sub.status==='ACTIVE'){
    await paypal('/v1/billing/subscriptions/'+encodeURIComponent(subId)+'/cancel','POST',{reason:'Customer requested cancellation in TaskFlow'});
  }
  await entRef(uid).set({renewalStatus:'CANCELLED',updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
  return json(res,200,{cancelled:true,...await accountStatus(uid)});
}
function saleMatches(resource){
  const amount=resource&&resource.amount;
  return resource&&String(resource.state||'').toLowerCase()==='completed'&&amount&&amount.currency==='USD'&&Number(amount.total)===6;
}
async function findOwner(sub){
  const record=await subscriptionRef(sub.id).get();
  if(record.exists&&record.data().planId===PLAN&&record.data().environment===ENV)return record.data().uid;
  const nonce=String(sub.custom_id||'');
  if(!/^[a-f0-9-]{36}$/.test(nonce))return '';
  const snap=await intentRef(nonce).get();
  if(!snap.exists||snap.data().planId!==PLAN||Number(snap.data().expiresAt)<Date.now())return '';
  return snap.data().uid;
}
async function handleWebhook(req,res){
  if(!configured()||!webhookId.value())return json(res,503,{error:'WEBHOOK_NOT_READY'});
  const event=req.body;
  if(!event||typeof event!=='object')return json(res,400,{error:'INVALID_EVENT'});
  const validation=await paypal('/v1/notifications/verify-webhook-signature','POST',{
    auth_algo:req.get('paypal-auth-algo'),cert_url:req.get('paypal-cert-url'),
    transmission_id:req.get('paypal-transmission-id'),transmission_sig:req.get('paypal-transmission-sig'),
    transmission_time:req.get('paypal-transmission-time'),webhook_id:webhookId.value(),
    webhook_event:event
  });
  if(validation.verification_status!=='SUCCESS')return json(res,401,{error:'BAD_WEBHOOK_SIGNATURE'});
  const type=String(event.event_type||''),resource=event.resource||{};
  const subscriptionId=String(resource.billing_agreement_id||resource.id||'');
  if(type==='PAYMENT.SALE.COMPLETED'){
    if(!saleMatches(resource)||!PAYPAL_ID.test(String(resource.id||'')))return json(res,200,{ignored:true});
    if(!ID_PATTERN.test(String(resource.billing_agreement_id||'')))return json(res,200,{ignored:true});
    const sub=await paypalSubscription(resource.billing_agreement_id);
    const uid=await findOwner(sub);
    if(!uid||!lastPayment(sub))return json(res,200,{pending:true});
    const sale=saleRef(resource.id),previous=await sale.get();
    if(previous.exists)return json(res,200,{duplicate:true});
    await assignPayment(uid,sub,'paypal-recurring-payment',resource.id);
    await sale.set({uid,subscriptionId:sub.id,status:'COMPLETED',amount:PRICE,currency:CURRENCY,
      paidAt:lastPayment(sub),createdAt:admin.firestore.FieldValue.serverTimestamp()});
    return json(res,200,{ok:true});
  }
  if(type==='PAYMENT.SALE.REFUNDED'||type==='PAYMENT.SALE.REVERSED'){
    const saleId=String(resource.sale_id||resource.id||'');
    if(!PAYPAL_ID.test(saleId))return json(res,200,{ignored:true});
    const sale=saleRef(saleId),snap=await sale.get();
    if(!snap.exists)return json(res,200,{ignored:true});
    const ent=entRef(snap.data().uid);
    await db.runTransaction(async tx=>{
      const [s,e]=await Promise.all([tx.get(sale),tx.get(ent)]);
      if(!s.exists)return;
      tx.set(sale,{status:'REVERSED',updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
      if(e.exists&&e.data().subscriptionId===s.data().subscriptionId&&e.data().lastSaleId===saleId)
        tx.set(ent,{state:'revoked',updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    });
    return json(res,200,{ok:true});
  }
  if(['BILLING.SUBSCRIPTION.CANCELLED','BILLING.SUBSCRIPTION.SUSPENDED',
      'BILLING.SUBSCRIPTION.EXPIRED'].includes(type)&&ID_PATTERN.test(subscriptionId)){
    const linked=await subscriptionRef(subscriptionId).get();
    if(!linked.exists)return json(res,200,{ok:true});
    const ref=entRef(linked.data().uid),snap=await ref.get();
    if(snap.exists&&snap.data().subscriptionId===subscriptionId)
      await ref.set({renewalStatus:type.split('.').pop(),updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
    return json(res,200,{ok:true});
  }
  return json(res,200,{ignored:true});
}
exports.taskflowNoAds=onRequest({region:'us-central1',timeoutSeconds:45,memory:'256MiB',
  secrets:[clientId,clientSecret,webhookId],maxInstances:10},async(req,res)=>{
  if(!cors(req,res))return json(res,403,{error:'ORIGIN_NOT_ALLOWED'});
  if(req.method==='OPTIONS')return res.status(204).end();
  try{
    const route=req.path.replace(/\/$/,'')||'/';
    if(req.method==='POST'&&route==='/paypal/webhook')return await handleWebhook(req,res);
    if(req.method==='GET'&&route==='/config'){
      if(!configured())return json(res,200,{enabled:false});
      const enabled=await verifyPlan().catch(()=>false);
      return json(res,200,enabled?{enabled:true,clientId:clientId.value(),
        planId:PLAN,price:PRICE,currency:CURRENCY,frequency:'MONTH',recurring:true}:{enabled:false});
    }
    const uid=await requireUser(req);
    if(req.method==='GET'&&route==='/status')return json(res,200,await accountStatus(uid));
    if(req.method==='POST'&&route==='/intent')return await createIntent(uid,res);
    if(req.method==='POST'&&route==='/confirm')return await confirmSubscription(uid,req,res);
    if(req.method==='POST'&&route==='/cancel')return await cancelSubscription(uid,res);
    return json(res,404,{error:'NOT_FOUND'});
  }catch(err){
    console.error('TaskFlow PayPal subscription error:',err.message);
    return json(res,err.status&&err.status>=400&&err.status<500?err.status:503,
      {error:err.status===401?'AUTH_REQUIRED':'PAYMENT_UNAVAILABLE'});
  }
});