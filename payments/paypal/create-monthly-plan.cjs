#!/usr/bin/env node
'use strict';
// Creates a NEW PayPal monthly plan for TaskFlow. Run manually in a secure shell.
// Default is Sandbox; no secrets are printed or written to disk.
const crypto=require('node:crypto');
const ID=process.env.TASKFLOW_PAYPAL_CLIENT_ID;
const SECRET=process.env.TASKFLOW_PAYPAL_CLIENT_SECRET;
const ENV=process.env.PAYPAL_ENV||'sandbox';
if(!ID||!SECRET||!['sandbox','live'].includes(ENV)){
 console.error('Configura TASKFLOW_PAYPAL_CLIENT_ID, TASKFLOW_PAYPAL_CLIENT_SECRET y PAYPAL_ENV=sandbox o live.');
 process.exitCode=1;
}else{
 void main().catch(e=>{console.error('No se creó el plan:',e.message);process.exitCode=1});
}
async function main(){
 const root=ENV==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
 const encoded=Buffer.from(ID+':'+SECRET).toString('base64');
 const tokenResponse=await fetch(root+'/v1/oauth2/token',{
  method:'POST',headers:{Authorization:'Basic '+encoded,
  'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
 if(!tokenResponse.ok)throw new Error('Autenticación con PayPal no disponible');
 const {access_token:token}=await tokenResponse.json();
 async function request(path,body){
  const response=await fetch(root+path,{method:'POST',headers:{Authorization:'Bearer '+token,
   'Content-Type':'application/json','PayPal-Request-Id':crypto.randomUUID()},body:JSON.stringify(body)});
  const out=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(path+' HTTP '+response.status+': '+JSON.stringify(out).slice(0,300));
  return out;
 }
 const product=await request('/v1/catalogs/products',{
   name:'TaskFlow sin anuncios',description:'Elimina anuncios de TaskFlow',
   type:'SERVICE',category:'SOFTWARE'});
 if(!product.id)throw new Error('PayPal no devolvió ID del producto');
 const plan=await request('/v1/billing/plans',{
  product_id:product.id,
  name:'TaskFlow Sin Anuncios - US$6 mensual',
  description:'Suscripción que elimina anuncios en TaskFlow. 6 USD al mes, renovación automática hasta cancelación.',
  status:'ACTIVE',
  billing_cycles:[{frequency:{interval_unit:'MONTH',interval_count:1},
   tenure_type:'REGULAR',sequence:1,total_cycles:0,
   pricing_scheme:{fixed_price:{currency_code:'USD',value:'6.00'}}}],
  payment_preferences:{auto_bill_outstanding:true,
   setup_fee:{currency_code:'USD',value:'0.00'},
   setup_fee_failure_action:'CANCEL',payment_failure_threshold:2}
 });
 if(!/^P-[A-Za-z0-9-]+$/.test(String(plan.id||'')))throw new Error('ID de plan inválido');
 process.stdout.write('Modo: '+ENV+'\nPlan PayPal: '+plan.id+'\nPrecio: USD 6.00 mensual\n');
 process.stdout.write('Ahora configura TASKFLOW_PAYPAL_MONTHLY_PLAN_ID='+plan.id+' en Firebase Functions.\n');
}
