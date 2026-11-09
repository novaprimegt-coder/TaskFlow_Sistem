/* TaskFlow ADS Bridge v3.4.0
   Conecta TaskFlow_Sistem con el catálogo público aprobado de TaskFlow ADS Manager.
   No envía uid, email, hábitos, tareas, contraseñas ni datos administrativos. */
(function(){
'use strict';
if(window.TaskFlowADS&&window.TaskFlowADS.version)return;

const PROJECT_ID='taskflow-b0ece';
const COLLECTION='adsPublicCampaigns';
const REST_BASE='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(PROJECT_ID)+'/databases/(default)/documents/'+encodeURIComponent(COLLECTION);
const BANNER_SLOTS=['tfAdBannerTimer','tfAdBannerHabitsTasks','tfAdBannerFooter'];
// The client receives only campaign references, never commercial weighting or budget data.
const SELECTION_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/choose';
const CONFIRM_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/confirm';
const GEO_PRESENCE_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/geo/presence';
const GEO_WITHDRAW_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/geo/withdraw';
const OWNER_SYNC_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/sync/owned';
let ownerRecoveryPending=null,ownerRecoveryUid='',ownerRecoveryAt=0,ownerRecoveryResult='pending';
async function recoverOwnedAds(force=false){
 const auth=window.TaskFlowFirebase,user=auth?.getUser?.(),uid=String(user?.uid||'');
 if(!config.enabled||!uid||document.hidden||navigator.onLine===false)return false;
 if(ownerRecoveryUid!==uid){ownerRecoveryUid=uid;ownerRecoveryAt=0;ownerRecoveryResult='pending'}
 if(ownerRecoveryPending)return ownerRecoveryPending;
 if(!force&&Date.now()-ownerRecoveryAt<5*60*1000)return ownerRecoveryResult==='ok';
 ownerRecoveryAt=Date.now();
 ownerRecoveryPending=(async()=>{
  const token=await auth.getIdToken?.();
  if(!token)throw Error('AUTH_NOT_READY');
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),42000);
  try{
   const resp=await fetch(OWNER_SYNC_URL,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:ctrl.signal,
    headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}'});
   if(!resp.ok)throw Error('SYNC_HTTP_'+resp.status);
   const data=await resp.json();
   if(Number(data.synchronized)>0){void refresh();retryRecommendations(1000)}
   if(data.ok!==true)throw Error('SYNC_PARTIAL');
   ownerRecoveryResult='ok';return true;
  }finally{clearTimeout(timer)}
 })().catch(error=>{
  ownerRecoveryResult='unavailable';
  console.warn('TaskFlow ADS: sincronización del propietario no confirmada',error?.message||'Sin conexión');return false;
 }).finally(()=>{ownerRecoveryPending=null});
 return ownerRecoveryPending;
}

let recommendations=new Map(),recommendationRun=0,recommendationRetry=0;
function retryRecommendations(ms){
 if(recommendationRetry)clearTimeout(recommendationRetry);
 recommendationRetry=setTimeout(()=>{recommendationRetry=0;if(config.enabled&&catalog.length)void refreshRecommendations()},Math.max(250,Number(ms)||4000));
}
function clearRecommendationRetry(){if(recommendationRetry)clearTimeout(recommendationRetry);recommendationRetry=0}
async function refreshRecommendations(){
 const ticket=++recommendationRun;
 if(!config.enabled||!catalog.length){recommendations=new Map();applyWhenReady();return;}
 const slots=[...BANNER_SLOTS.map(slot=>({placement:'banner',slot})),{placement:'entry',slot:'entry'},{placement:'interaction',slot:'interaction'}];
 const sessionId=analyticsSessionId();if(!sessionId){retryRecommendations(5000);return;}
 const next=new Map();
 if(localStorage.getItem('taskflow_location_decision_v52')!=='granted'){
  recommendations=next;applyWhenReady();return;
 }
 let token=null;
 try{token=await window.TaskFlowFirebase?.getIdToken?.()||null}catch(_){}
 if(!token){if(ticket!==recommendationRun)return;recommendations=next;applyWhenReady();retryRecommendations(4000);return;}
 await Promise.all(slots.map(async({placement,slot})=>{
  const previous=recommendations.get(slot);
  if(previous&&previous.expiresAt>Date.now()&&catalog.some(a=>a.campaignId===previous.campaignId&&a.id===previous.adId&&a.placement===placement)){next.set(slot,previous);return}
  const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),6500);
  try{
   const response=await fetch(SELECTION_URL,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:abort.signal,
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({placement,slot,sessionId})});
   if(!response.ok)return;
   const data=await response.json();
   if(typeof data.campaignId==='string'&&typeof data.adId==='string'&&typeof data.selectionToken==='string'&&/^[a-f0-9-]{36}$/i.test(data.selectionToken)&&catalog.some(a=>a.campaignId===data.campaignId&&a.id===data.adId&&a.placement===placement))next.set(slot,{campaignId:data.campaignId,adId:data.adId,selectionToken:data.selectionToken,expiresAt:Date.now()+(placement==='banner'?30000:900000)});
  }catch(_){}
  finally{clearTimeout(timer)}
 }));
 if(ticket!==recommendationRun)return;
 recommendations=next;
 for(const slot of BANNER_SLOTS)if(document.getElementById(slot))void displayBanner(slot);
 applyWhenReady();
 if(!next.size&&catalog.length)retryRecommendations(12000);else clearRecommendationRetry();
}
const LEGACY_TYPES=Object.freeze(['banner','interstitial','native_profile','native_menu','in_chat','rewarded_video']);
let config={enabled:true,adminUrl:null,refreshMs:10000};
let catalog=[],rawCampaigns=[],lastRefresh=0,refreshTimer=0,refreshing=null,lastError='';
let slotObserver=null,slotUpdateQueued=false;
let geoPending=null,lastGeoGrid='',lastGeoAt=0;
const GEO_GRID_CACHE='tf_ads_geo_gt_grid_v1';
const GEO_API='https://sig.conred.gob.gt/server/rest/services/Hosted/municipios_guatemala/FeatureServer/0/query';
// Geocodificación de país/ciudad a partir de ubicación autorizada y coordenadas reducidas; sin enviar ID ni datos personales.
const WORLD_GEO_URL='https://api.bigdatacloud.net/data/reverse-geocode-client';
const WORLD_GEO_CACHE='tf_ads_geo_world_grid_v1';
let context={country:'',region:'',city:'',neighborhood:''};


let lastPresenceAt=0,lastPresenceGrid='',lastPresenceAccount='',presenceBusy=false,presencePresent=false,withdrawConfirmed=false,lastGeoProbeAt=0;
async function reportAuthorizedGeoPresence(position){
 if(!position||localStorage.getItem('taskflow_location_decision_v52')!=='granted'||presenceBusy||document.hidden)return false;
 // Registrar presencia solamente desde una posición reciente y consentimiento vigente.
 let permissionState='unknown';
 if(navigator.permissions?.query){
  try{permissionState=(await navigator.permissions.query({name:'geolocation'})).state||'unknown'}
  catch(_){permissionState='unknown'}
 }
 if(permissionState==='denied'){void withdrawAuthorizedGeoPresence();return false}
 const timestamp=Number(position.timestamp||position.updatedAt||0);
 const needsFresh=permissionState!=='granted'||!timestamp||Date.now()-timestamp>15*60*1000;
 if(needsFresh){
  if(!navigator.geolocation?.getCurrentPosition||Date.now()-lastGeoProbeAt<30000)return false;
  lastGeoProbeAt=Date.now();
  try{
   const fresh=await new Promise((ok,bad)=>navigator.geolocation.getCurrentPosition(ok,bad,
    {enableHighAccuracy:false,timeout:10000,maximumAge:300000}));
   position={latitude:fresh.coords.latitude,longitude:fresh.coords.longitude,timestamp:Number(fresh.timestamp)||Date.now()};
  }catch(error){
   if(Number(error?.code)===1)void withdrawAuthorizedGeoPresence();
   return false;
  }
 }
 const lat=Number(position.latitude),lng=Number(position.longitude);
 if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat< -90||lat>90||lng< -180||lng>180)return false;
 const grid=Number(lat.toFixed(2))+','+Number(lng.toFixed(2));
 const user=window.TaskFlowFirebase?.getUser?.();
 const account=String(user?.uid||user?.localId||'');
 if(lastPresenceGrid===grid&&lastPresenceAccount===account&&Date.now()-lastPresenceAt<6*60*60*1000)return true;
 presenceBusy=true;withdrawConfirmed=false;
 try{
  const token=await window.TaskFlowFirebase?.getIdToken?.();
  if(!token)return false;
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
  let response;
  try{
   response=await fetch(GEO_PRESENCE_URL,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:ctrl.signal,
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
    body:JSON.stringify({consent:true,latitude:Number(lat.toFixed(2)),longitude:Number(lng.toFixed(2))})});
  }finally{clearTimeout(timer)}
  if(!response.ok)return false;
  const payload=await response.json(),loc=payload?.location;
  if(!payload.ok||!loc||!/^[A-Z]{2}$/.test(loc.country))return false;
  lastPresenceGrid=grid;lastPresenceAccount=account;lastPresenceAt=Date.now();presencePresent=true;
  API.setContext({country:loc.country,region:loc.region||'',city:loc.city||'',neighborhood:loc.neighborhood||''});
  if(catalog.length)retryRecommendations(350);
  return true;
 }catch(_){return false}
 finally{presenceBusy=false}
}
async function withdrawAuthorizedGeoPresence(){
 if(withdrawConfirmed)return true;
 lastPresenceAt=0;lastPresenceGrid='';lastPresenceAccount='';
 const token=await window.TaskFlowFirebase?.getIdToken?.().catch(()=>null);
 if(!token)return false;
 try{
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000);
  try{
   const response=await fetch(GEO_WITHDRAW_URL,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:'{}',signal:ctrl.signal});
   if(response.ok){presencePresent=false;withdrawConfirmed=true;return true}
   return false;
  }finally{clearTimeout(timer)}
 }catch(_){return false}
}
function lastAuthorizedPosition(){
 try{
  const p=JSON.parse(localStorage.getItem('taskflow_location_v52')||'null');
  return p&&Number.isFinite(Number(p.latitude))&&Number.isFinite(Number(p.longitude))?p:null;
 }catch(_){return null}
}

function validHTTPS(value){
 if(typeof value!=='string'||!value.trim())return '';
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch(_){return ''}
}
function trackedDestination(ad){
 const original=validHTTPS(ad?.destination);
 if(!original)return '';
 if(!['traffic','leads','sales','app'].includes(String(ad?.objective||''))||!/^[a-f0-9-]{36}$/i.test(String(ad?.selectionToken||'')))return original;
 const u=new URL(original);
 // Las tiendas de aplicaciones y mensajerías externas no deben recibir parámetros desconocidos.
 if(['play.google.com','apps.apple.com','wa.me','api.whatsapp.com','t.me','m.me'].includes(u.hostname.toLowerCase()))return original;
 u.searchParams.set('tf_ads_click',ad.selectionToken);
 u.searchParams.set('tf_ads_campaign',String(ad.campaignId||''));
 return u.href;
}
function normText(v){return String(v||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es')}
function countryCode(v){const c=normText(v);return c==='guatemala'||c==='gt'?'GT':c.toUpperCase()}
// Los idiomas (p. ej., es-US) no prueban dónde está el usuario.
// Polígono simplificado de Guatemala (GeoJSON público; johan/world.geo.json, GTM).
const GT_BOUNDARY=[[-90.095555,13.735338],[-90.608624,13.909771],[-91.23241,13.927832],[-91.689747,14.126218],[-92.22775,14.538829],[-92.20323,14.830103],[-92.087216,15.064585],[-92.229249,15.251447],[-91.74796,16.066565],[-90.464473,16.069562],[-90.438867,16.41011],[-90.600847,16.470778],[-90.711822,16.687483],[-91.08167,16.918477],[-91.453921,17.252177],[-91.002269,17.254658],[-91.00152,17.817595],[-90.067934,17.819326],[-89.14308,17.808319],[-89.150806,17.015577],[-89.229122,15.886938],[-88.930613,15.887273],[-88.604586,15.70638],[-88.518364,15.855389],[-88.225023,15.727722],[-88.68068,15.346247],[-89.154811,15.066419],[-89.22522,14.874286],[-89.145535,14.678019],[-89.353326,14.424133],[-89.587343,14.362586],[-89.534219,14.244816],[-89.721934,14.134228],[-90.064678,13.88197],[-90.095555,13.735338]];
function verifiedCountryFromLocation(position){
 const lat=Number(position&&position.latitude),lng=Number(position&&position.longitude);
 if(!Number.isFinite(lat)||!Number.isFinite(lng)||!lat||!lng)return '';
 let inside=false;
 for(let i=0,j=GT_BOUNDARY.length-1;i<GT_BOUNDARY.length;j=i++){
  const a=GT_BOUNDARY[i],b=GT_BOUNDARY[j];
  if((a[1]>lat)!==(b[1]>lat) && lng<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside?'GT':'';
}
function decode(v){
 if(!v||typeof v!=='object')return null;
 if('stringValue'in v)return v.stringValue;
 if('integerValue'in v)return Number(v.integerValue);
 if('doubleValue'in v)return Number(v.doubleValue);
 if('booleanValue'in v)return !!v.booleanValue;
 if('timestampValue'in v)return v.timestampValue;
 if('nullValue'in v)return null;
 if(v.arrayValue)return (v.arrayValue.values||[]).map(decode);
 if(v.mapValue){const out={};const f=v.mapValue.fields||{};Object.keys(f).forEach(k=>out[k]=decode(f[k]));return out}
 return null
}
function documentData(doc){
 const out={id:String(doc&&doc.name||'').split('/').pop()||''},f=doc&&doc.fields||{};
 Object.keys(f).forEach(k=>out[k]=decode(f[k]));return out
}
function dateEligible(c){
 const today=new Date();today.setHours(0,0,0,0);
 if(c.start){const s=new Date(c.start+'T00:00:00');if(Number.isFinite(s.getTime())&&today<s)return false}
 if(c.end){const e=new Date(c.end+'T23:59:59');if(Number.isFinite(e.getTime())&&today>e)return false}
 return true
}
function targetEligible(c){
 // Los destinos específicos requieren coincidencia geográfica positiva; no suposiciones.
 const cc=countryCode(c.country),xc=countryCode(context.country);
 if(cc&&cc!=='ALL'&&(!xc||cc!==xc))return false;
 if(c.region&&(!context.region||normText(c.region)!==normText(context.region)))return false;
 if(c.city&&(!context.city||normText(c.city)!==normText(context.city)))return false;
 if(c.neighborhood&&(!context.neighborhood||normText(c.neighborhood)!==normText(context.neighborhood)))return false;
 return true
}

// Eventos de anuncios servidos. Los clics e impresiones se cuentan en el servidor.
// Los contadores NO representan personas únicas, compras ni conversiones externas.
const ANALYTICS_URL='https://taskflow-ads-media.vercel.app/api/analytics';
let analyticsSession='',analyticsTrackingBound=false;
const activeVerticalAds={entry:null,interaction:null};
const impressionSeen=new Map(),impressionConfirmations=new Map();
function analyticsSessionId(){
 if(analyticsSession)return analyticsSession;
 try{analyticsSession=sessionStorage.getItem('tfads_analytics_session_v1')||''}catch(_){}
 if(!/^[a-f0-9-]{24,80}$/i.test(analyticsSession)){
  try{
   if(typeof crypto?.randomUUID==='function')analyticsSession=crypto.randomUUID();
   else if(typeof crypto?.getRandomValues==='function'){
    const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
    bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
    analyticsSession=h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
   }else analyticsSession='';
  }catch(_){analyticsSession=''}
  if(analyticsSession)try{sessionStorage.setItem('tfads_analytics_session_v1',analyticsSession)}catch(_){}
 }
 return analyticsSession;
}
// Diagnóstico local y agregado, separado de las métricas de eventos almacenados en Vercel.
// Nunca se considera una petición enviada como una impresión o clic confirmado.
const ANALYTICS_DIAG_KEY='taskflow_ads_analytics_delivery_v1';
function telemetryDiagnostic(kind,state,error){
 try{
  const allowed=['attempted','acknowledged','failed'];if(!allowed.includes(state))return;
  const saved=JSON.parse(localStorage.getItem(ANALYTICS_DIAG_KEY)||'{}');
  const now=Date.now(),record=saved&&typeof saved==='object'?saved:{};
  if(!record.since||now-record.since>30*86400000)Object.assign(record,{since:now,attempted:{},acknowledged:{},failed:{},lastError:''});
  if(!record[state]||typeof record[state]!=='object')record[state]={};
  record[state][kind]=Math.max(0,Number(record[state][kind])||0)+1;
  record.lastAt=now;
  if(state==='failed')record.lastError=String(error||'No se confirmó el registro').slice(0,115);
  if(state==='acknowledged')record.lastSuccessAt=now;
  localStorage.setItem(ANALYTICS_DIAG_KEY,JSON.stringify(record));
 }catch(_){}
}
function recordAdEvent(type,ad,slot){
 if(!ad||!['impression','click'].includes(type)||!catalog.some(x=>x.id===ad.id&&x.campaignId===ad.campaignId&&x.src===ad.src))return;
 const sessionId=analyticsSessionId();if(!sessionId)return;
 const selectionToken=ad.selectionToken||(bannerStatus.get(slot)?.selectionToken||'');
 if(!/^[a-f0-9-]{36}$/i.test(selectionToken))return;
 const base={campaignId:ad.campaignId,adId:ad.id,slot:String(slot||ad.placement).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,50),sessionId,selectionToken};
 telemetryDiagnostic(type,'attempted');
 const post=async event=>{
  const controller=new AbortController(),stop=setTimeout(()=>controller.abort(),9000);
  let verification;
  try{
   const confirmation=await fetch(CONFIRM_URL,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({...base,event}),signal:controller.signal});
   if(!confirmation.ok)throw Error('No se pudo verificar la entrega');
   verification=await confirmation.json();
  }finally{clearTimeout(stop)}
  if(verification?.ok!==true)throw Error('Entrega sin confirmación válida');
  // Only the private SQL ledger is authoritative. This is optional legacy telemetry.
  void fetch(ANALYTICS_URL,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({...base,event})}).catch(()=>{});
 };
 const job=(async()=>{
  // Clic comprobado de manera independiente: no obliga a crear una impresión visible.
  // El servicio privado valida la selección y registra cada clic una sola vez.
  await post(type);
  telemetryDiagnostic(type,'acknowledged');
 })();
 if(type==='impression'){
  impressionConfirmations.set(selectionToken,job);
  if(impressionConfirmations.size>500)impressionConfirmations.delete(impressionConfirmations.keys().next().value);
 }
 void job.catch(error=>{
  telemetryDiagnostic(type,'failed','No se confirmó la entrega');
  console.warn('TaskFlow ADS: evento no confirmado',String(error?.message||'Sin conexión'));
 });
}
// Viewable-impression rule for ADS: at least half the ad area visible continuously
// for one second while the document stays visible. This is not a claim of
// externally certified viewability, unique reach or human attention.
const pendingViewChecks=new Map();
function visibleRect(el){
 if(!el||document.hidden||el.isConnected===false)return false;
 const r=el.getBoundingClientRect();
 if(!Number.isFinite(r.width)||!Number.isFinite(r.height)||r.width<=5||r.height<=5)return false;
 const w=Math.max(0,Math.min(r.right,innerWidth)-Math.max(0,r.left));
 const h=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(0,r.top));
 return w*h>=r.width*r.height*.5;
}
function recordVisibleAd(ad,slot,element){
 if(!ad||!visibleRect(element))return;
 const token=ad.selectionToken||(bannerStatus.get(slot)?.selectionToken||'');
 if(!/^[a-f0-9-]{36}$/i.test(token))return;
 const key=slot+':'+ad.campaignId+':'+ad.id+':'+token;
 if(impressionSeen.has(key)||pendingViewChecks.has(key))return;
 const obj={handle:0,started:0,last:0};
 const check=now=>{
  if(!pendingViewChecks.has(key))return;
  const displayed=slot==='entry'||slot==='interaction'?activeVerticalAds[slot]:bannerStatus.get(slot);
  const matching=displayed&&displayed.id===ad.id&&displayed.selectionToken===token;
  if(!matching||!visibleRect(element)){
   pendingViewChecks.delete(key);return;
  }
  // Discontinuities (background tabs / stalled animations) restart the full second.
  if(!obj.started||now-obj.last>250)obj.started=now;
  obj.last=now;
  if(now-obj.started>=1000){
   pendingViewChecks.delete(key);
   impressionSeen.set(key,now);
   if(impressionSeen.size>500)impressionSeen.delete(impressionSeen.keys().next().value);
   recordAdEvent('impression',ad,slot);
   return;
  }
  obj.handle=requestAnimationFrame(check);
 };
 pendingViewChecks.set(key,obj);
 obj.handle=requestAnimationFrame(check);
}
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden)return;
 for(const x of pendingViewChecks.values())cancelAnimationFrame(x.handle);
 pendingViewChecks.clear();
});
function bindAnalyticsTracking(){
 if(analyticsTrackingBound)return;analyticsTrackingBound=true;
 document.addEventListener('taskflow:ads-media-visible',e=>{
  const slot=e.detail?.placement;
  if(!['entry','interaction'].includes(slot))return;
  const root=document.getElementById(slot==='entry'?'tf56EntryStage':'tf57TouchStage');
  const ad=activeVerticalAds[slot];
  if(ad&&root){const media=root.querySelector('img,video');if(media&&(media.tagName==='IMG'?media.complete&&media.naturalWidth>0:media.readyState>=1))recordVisibleAd(ad,slot,root)}
 });
 document.addEventListener('click',e=>{
  const target=e.target?.closest?.('a');
  if(!target||!target.href)return;
  const banner=target.closest('.tf50-ad-slot');
  if(banner){
   const status=bannerStatus.get(banner.id),ad=status&&catalog.find(x=>x.id===status.id&&x.src===status.src&&x.placement==='banner');
   if(ad&&status&&target.href===trackedDestination({...ad,selectionToken:status.selectionToken})){
   const media=banner.querySelector('img');
   if(media?.complete&&media.naturalWidth>0)recordVisibleAd(ad,banner.id,banner);
   recordAdEvent('click',ad,banner.id);
  }
   return;
  }
  const entry=target.closest('#tfEntryAdV56');
  const interaction=target.closest('#tfInteractionAdV57');
  const placement=entry?'entry':interaction?'interaction':'';
  const ad=activeVerticalAds[placement];
  if(ad&&target.href===trackedDestination(ad)){
   const stage=document.getElementById(placement==='entry'?'tf56EntryStage':'tf57TouchStage');
   const media=stage?.querySelector('img,video');
   if(media&&(media.tagName==='IMG'?media.complete&&media.naturalWidth>0:media.readyState>=1))recordVisibleAd(ad,placement,stage);
   recordAdEvent('click',ad,placement);
  }
 },true);
 const checkBannerImpressions=()=>{
  for(const slot of BANNER_SLOTS){
   const status=bannerStatus.get(slot),el=document.getElementById(slot);
   const ad=status&&catalog.find(x=>x.id===status.id&&x.src===status.src&&x.placement==='banner');
   if(ad&&el){const img=el.querySelector('img');if(img?.complete&&img.naturalWidth>0)recordVisibleAd(ad,slot,el)}
  }
 };
 window.addEventListener('scroll',checkBannerImpressions,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkBannerImpressions()});
 window.addEventListener('resize',checkBannerImpressions,{passive:true});
 setInterval(()=>{if(!document.hidden)checkBannerImpressions()},12000);
}

const OBJECTIVE_CTA=Object.freeze({awareness:'Conocer la marca',traffic:'Visitar sitio web',engagement:'Participar',leads:'Solicitar información',sales:'Comprar ahora',app:'Descargar aplicación'});
function ctaForObjective(c){return OBJECTIVE_CTA[c?.objective]||OBJECTIVE_CTA.awareness}
function normalizeCampaign(c){
 if(!c||c.status!=='active'||c.approvalStatus!=='approved'||!dateEligible(c)||!targetEligible(c))return [];
 const placement=['banner','entry','interaction'].includes(c.placement)?c.placement:'';
 if(!placement||!Array.isArray(c.ads))return [];
 return c.ads.map(a=>{
   if(!a||typeof a!=='object')return null;
   const src=validHTTPS(a.src),destination=a.destination?validHTTPS(a.destination):'';
   const type=String(a.type||'image').toLowerCase();
   if(!src||!['image','gif','video'].includes(type))return null;
   if(placement==='banner'&&type==='video')return null;
   const width=Number(a.width)||0,height=Number(a.height)||0,duration=Number(a.duration)||0;
   if(placement==='banner'&&!((width===1200&&height===180)||(width===2400&&height===360)))return null;
   if((placement==='entry'||placement==='interaction')&&!((width===1080&&height===1920)||(width===2160&&height===3840)))return null;
   if(type==='video'&&(!Number.isFinite(duration)||duration<9.95||duration>180.05))return null;
   return {id:String(a.id||c.id).slice(0,140),campaignId:String(c.campaignId||c.id||'').slice(0,140),placement,type,src,destination,mediaWidth:width,mediaHeight:height,objective:c.objective||'awareness',ctaLabel:ctaForObjective(c),sound:type==='video'&&a.sound===true};
 }).filter(Boolean)
}
function lastKey(placement,slot){return 'taskflow_ads_last_v2_'+placement+'_'+String(slot||'default')}
function pick(placement,slot){
 const favored=recommendations.get(slot);
 if(!favored)return null;
 const list=catalog.filter(a=>a.placement===placement&&a.campaignId===favored.campaignId&&a.id===favored.adId);if(!list.length)return null;
 let last='';try{last=localStorage.getItem(lastKey(placement,slot))||''}catch(_){}
 const pool=list.length>1?list.filter(a=>a.id!==last):list;
 const lead=pool[Math.floor(Math.random()*pool.length)]||pool[0];
 // Se conserva la selección de campaña, pero se prioriza su creativo HD si existe.
 const siblings=pool.filter(a=>a.campaignId===lead.campaignId);
 const hdWidth=placement==='banner'?2400:2160;
 const hd=siblings.filter(a=>a.mediaWidth===hdWidth);
 const options=hd.length?hd:siblings;
 const ad=options[Math.floor(Math.random()*options.length)]||lead;
 try{localStorage.setItem(lastKey(placement,slot),ad.id)}catch(_){}
 return {...ad,selectionToken:favored.selectionToken}
}
/* Nunca insertar un <img> sin verificar que el archivo se haya cargado realmente.
   Si la URL caducó, la carga falló o el archivo tiene medidas incorrectas,
   intentar otros creativos aprobados. No alterar el anuncio de ingreso o interacción. */
const bannerFailures=new Map(),bannerStatus=new Map(),bannerBusy=new Set();
const BANNER_TURN_MS=30000,IMAGE_TIMEOUT_MS=16000,BANNER_RETRY_MS=60000;
const bannerNearViewport=new Set();
let bannerViewportObserver=null;
// No decodificar simultáneamente creativos fuera de pantalla (GIF grandes).
function queueBanner(slot){
 const element=document.getElementById(slot);if(!element)return;
 if(recommendations.has(slot)&&!element.classList.contains('tf50-has-ad')){void displayBanner(slot);return}
 if(typeof IntersectionObserver!=='function'){void displayBanner(slot);return}
 if(!bannerViewportObserver){
  bannerViewportObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
    const id=entry.target&&entry.target.id;
    if(!BANNER_SLOTS.includes(id))continue;
    if(entry.isIntersecting){bannerNearViewport.add(id);void displayBanner(id)}
    else bannerNearViewport.delete(id);
   }
  },{root:null,rootMargin:'260px 0px',threshold:0});
 }
 bannerViewportObserver.observe(element);
 if(bannerNearViewport.has(slot))void displayBanner(slot);
}
function bannerCandidates(slot){
 const favored=recommendations.get(slot);
 if(!favored)return [];
 const list=catalog.filter(a=>a.placement==='banner'&&a.campaignId===favored.campaignId&&a.id===favored.adId&&(!bannerFailures.has(a.src)||Date.now()>=bannerFailures.get(a.src)));
 if(!list.length)return [];
 const shown=bannerStatus.get(slot),last=shown&&shown.id||'';
 const unseen=list.filter(a=>a.id!==last),seen=list.filter(a=>a.id===last);
 const shuffle=items=>items.map(a=>({a,r:Math.random()})).sort((a,b)=>a.r-b.r).map(o=>o.a);
 // Aleatorizar campañas y ofrecer primero la variante HD de cada una,
 // sin excluir a anunciantes con creativos estándar.
 const pool=shuffle(unseen).concat(shuffle(seen)),seenCampaigns=new Set(),ordered=[];
 for(const ad of pool){
  const key=ad.campaignId;
  if(seenCampaigns.has(key))continue;
  seenCampaigns.add(key);
  ordered.push(...pool.filter(a=>a.campaignId===key).sort((a,b)=>(b.mediaWidth||0)-(a.mediaWidth||0)));
 }
 // Se usan únicamente creativos de la campaña autorizada por el servicio privado.
 return ordered.map(a=>({...a,selectionToken:favored.selectionToken}));
}
function validBannerPixels(img){
 const w=img.naturalWidth,h=img.naturalHeight;
 return (w===1200&&h===180)||(w===2400&&h===360);
}
function testedBanner(ad){
 return new Promise(resolve=>{
  if(!ad||!ad.src){resolve(null);return}
  const img=new Image();let finished=false;
  const timeout=setTimeout(()=>done(null),IMAGE_TIMEOUT_MS);
  function done(result){
   if(finished)return;
   finished=true;clearTimeout(timeout);img.onload=null;img.onerror=null;
   if(!result)bannerFailures.set(ad.src,Date.now()+BANNER_RETRY_MS);
   else bannerFailures.delete(ad.src);
   resolve(result);
  }
  img.alt='';img.loading='eager';img.decoding='async';img.referrerPolicy='no-referrer';
  img.draggable=false;img.style.objectFit='contain';img.style.imageRendering='auto';
  try{img.fetchPriority='high'}catch(_){}
  img.onload=()=>done(validBannerPixels(img)?img:null);
  img.onerror=()=>done(null);
  img.src=ad.src;
  if(img.complete)queueMicrotask(()=>{if(!finished&&img.complete)done(validBannerPixels(img)?img:null)});
 });
}
function bannerNode(ad,img){
 if(!img)return null;
 if(!ad.destination)return img;
 const a=document.createElement('a');a.href=trackedDestination(ad);a.target='_blank';
 a.rel='sponsored noopener noreferrer';a.referrerPolicy='no-referrer';
 a.setAttribute('aria-label',ad.ctaLabel||'Abrir anuncio');
 a.title=ad.ctaLabel||'Abrir anuncio';
 a.dataset.tfAdCta=ad.ctaLabel||'Conocer más';
 a.className='tf-ads-cta-link';
 // No agregar un segundo hijo: TaskFlowAdsV50 exige A > IMG exclusivamente.
 a.appendChild(img);
 if(!document.getElementById('tfAdsBannerCtaStyles')){
  const style=document.createElement('style');style.id='tfAdsBannerCtaStyles';
  style.textContent='.tf50-ad-slot>.tf-ads-cta-link{position:relative!important}.tf50-ad-slot>.tf-ads-cta-link:after{content:attr(data-tf-ad-cta);position:absolute;right:5px;bottom:5px;z-index:4;max-width:60%;padding:4px 7px;border-radius:5px;background:rgba(7,20,39,.9);color:white;font:700 10px/1.2 system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}';
  document.head.appendChild(style);
 }
 return a;
}
async function displayBanner(slot){
 if(bannerBusy.has(slot)||!config.enabled||(window.TaskFlowNoAds&&window.TaskFlowNoAds.isActive&&window.TaskFlowNoAds.isActive()))return;
 const element=document.getElementById(slot);
 if(!element)return;
 const candidates=bannerCandidates(slot);
 const displayed=bannerStatus.get(slot);
 const live=element.querySelector('img');
 const current=displayed&&catalog.some(a=>a.placement==='banner'&&a.id===displayed.id&&a.src===displayed.src);
 const approvedSelection=recommendations.get(slot);
 if(current&&approvedSelection&&displayed.campaignId===approvedSelection.campaignId&&displayed.id===approvedSelection.adId&&live&&live.complete&&validBannerPixels(live)&&Date.now()-displayed.at<BANNER_TURN_MS)return;
 bannerBusy.add(slot);
 try{
  for(const ad of candidates){
   // Se conserva el anuncio anterior durante la validación, evitando destellos vacíos.
   const img=await testedBanner(ad);
   if(!config.enabled||(window.TaskFlowNoAds&&window.TaskFlowNoAds.isActive&&window.TaskFlowNoAds.isActive()))return;
   if(!img)continue;
   if(!document.getElementById(slot))return;
   if(!catalog.some(x=>x.placement==='banner'&&x.id===ad.id&&x.src===ad.src))continue;
   if(window.TaskFlowAdsV50.render(slot,bannerNode(ad,img))){
    bannerStatus.set(slot,{id:ad.id,campaignId:ad.campaignId,src:ad.src,selectionToken:ad.selectionToken,at:Date.now()});
    recordVisibleAd(ad,slot,element);
    try{localStorage.setItem(lastKey('banner',slot),ad.id)}catch(_){}
    return;
   }
  }
  // No mostrar nunca el icono roto del navegador.
  const currentAd=bannerStatus.get(slot);
  const authorized=recommendations.get(slot);
   const stillEligible=currentAd&&authorized&&currentAd.campaignId===authorized.campaignId&&currentAd.id===authorized.adId&&catalog.some(a=>a.placement==='banner'&&a.id===currentAd.id&&a.src===currentAd.src);
  if(!stillEligible||!live||!live.complete||!validBannerPixels(live)){
   bannerStatus.delete(slot);
   window.TaskFlowAdsV50.render(slot,null);
   if(authorized){recommendations.delete(slot);retryRecommendations(5000)}
  }
 }catch(e){console.warn('TaskFlow ADS: no fue posible mostrar banner',slot,e)}
 finally{bannerBusy.delete(slot)}
}
function runtimeReady(){
 return !!(window.TaskFlowAdsV50&&window.TaskFlowAdsV50.render&&window.TaskFlowEntryAdV56&&window.TaskFlowEntryAdV56.setCreative&&window.TaskFlowInteractionAdV57&&window.TaskFlowInteractionAdV57.setCreative)
}
function apply(){
 bindAnalyticsTracking();
 if(!config.enabled||!runtimeReady())return false;
 if(window.TaskFlowNoAds&&window.TaskFlowNoAds.isActive&&window.TaskFlowNoAds.isActive()){
  // Un beneficio confirmado por el servidor debe retirar todo anuncio visible,
  // incluso si la suscripción se validó desde otro dispositivo.
  BANNER_SLOTS.forEach(slot=>{bannerStatus.delete(slot);try{window.TaskFlowAdsV50.render(slot,null)}catch(_){}});
  for(const [api,buttonId] of [[window.TaskFlowEntryAdV56,'tf56EntryContinue'],[window.TaskFlowInteractionAdV57,'tf57TouchClose']]){
   try{
    if(api&&api.isRunning&&api.isRunning()){
     const button=document.getElementById(buttonId);
     if(button)button.disabled=false;
     api.close&&api.close();
    }
    api&&api.setCreative&&api.setCreative(null);
   }catch(error){console.warn('TaskFlow: no se pudo cerrar el anuncio al verificar la suscripción',error)}
  }
  return false;
 }
 try{window.TaskFlowAdsV50.refresh&&window.TaskFlowAdsV50.refresh()}catch(_){}
 BANNER_SLOTS.forEach(slot=>{queueBanner(slot)});
 // No reemplazar un creativo que ya está reproduciéndose en pantalla.
 const entryRunning=!!window.TaskFlowEntryAdV56.isRunning?.();
 if(!entryRunning){
  const entry=pick('entry','entry');
  let accepted=false;
  try{accepted=window.TaskFlowEntryAdV56.setCreative(entry?{type:entry.type==='video'?'video':'image',src:entry.src,destination:trackedDestination(entry),ctaLabel:entry.ctaLabel,objective:entry.objective,sound:entry.sound}:null)===true}catch(e){console.warn('TaskFlow ADS ingreso:',e)}
  activeVerticalAds.entry=accepted?entry:null;
  if(accepted){try{document.dispatchEvent(new Event('taskflow:entry-ad-creative-ready'))}catch(_){}}
 }
 const interactionRunning=!!window.TaskFlowInteractionAdV57.isRunning?.();
 if(!interactionRunning){
  const interaction=pick('interaction','interaction');
  let accepted=false;
  try{accepted=window.TaskFlowInteractionAdV57.setCreative(interaction?{type:interaction.type,src:interaction.src,destination:trackedDestination(interaction),ctaLabel:interaction.ctaLabel,objective:interaction.objective,sound:interaction.sound}:null)===true}catch(e){console.warn('TaskFlow ADS interacción:',e)}
  activeVerticalAds.interaction=accepted?interaction:null;
  if(accepted){try{document.dispatchEvent(new Event('taskflow:interaction-ad-creative-ready'))}catch(_){}}
 }
 return true
}
function observeSlots(){
 if(slotObserver||!document.documentElement||typeof MutationObserver!=='function')return;
 slotObserver=new MutationObserver(records=>{
  if(slotUpdateQueued||!config.enabled||!catalog.some(a=>a.placement==='banner'))return;
  for(const record of records){
   for(const node of record.addedNodes){
    if(node.nodeType!==1)continue;
    if(BANNER_SLOTS.some(id=>node.id===id||(node.querySelector&&node.querySelector('#'+id)))){
     slotUpdateQueued=true;
     requestAnimationFrame(()=>{slotUpdateQueued=false;apply()});return;
    }
   }
  }
 });
 slotObserver.observe(document.documentElement,{childList:true,subtree:true});
}
let readinessTimer=0;
function applyWhenReady(){
 observeSlots();
 if(apply()){if(readinessTimer)clearInterval(readinessTimer);readinessTimer=0;return}
 if(readinessTimer)return;
 let tries=0;readinessTimer=setInterval(()=>{
  tries++;if(apply()||tries>=120){clearInterval(readinessTimer);readinessTimer=0}
 },500)
}
function rebuildCatalog(){
 catalog=rawCampaigns.flatMap(normalizeCampaign).slice(0,1200);
 applyWhenReady();
 void refreshRecommendations();
 try{document.dispatchEvent(new CustomEvent('taskflow:ads-catalog-updated',{detail:{available:catalog.length}}))}catch(_){}
}
async function fetchCatalog(){
 const all=[];let token='',pages=0;
 do{
   const u=new URL(REST_BASE);u.searchParams.set('pageSize','100');if(token)u.searchParams.set('pageToken',token);
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
   let r,data;
   try{
    r=await fetch(u.href,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!r.ok)throw new Error('ADS HTTP '+r.status);
    data=await r.json();
   }finally{clearTimeout(timer)}(data.documents||[]).forEach(doc=>all.push(documentData(doc)));token=String(data.nextPageToken||'');pages++
 }while(token&&pages<5);
 rawCampaigns=all;lastRefresh=Date.now();lastError='';rebuildCatalog();return true
}
async function refresh(){
 if(window.TaskFlowNoAds&&window.TaskFlowNoAds.isActive&&window.TaskFlowNoAds.isActive())return false;
 if(!config.enabled){catalog=[];rawCampaigns=[];recommendations.clear();applyWhenReady();return false}
 if(refreshing)return refreshing;
 refreshing=fetchCatalog().catch(e=>{lastError=String(e&&e.message||'No se pudo consultar el catálogo').slice(0,120);console.warn('TaskFlow ADS no disponible:',lastError);return false}).finally(()=>{refreshing=null});
 return refreshing;
}
function schedule(){
 clearInterval(refreshTimer);refreshTimer=0;if(!config.enabled)return;
 const ms=Math.max(10000,Number(config.refreshMs)||10000);refreshTimer=setInterval(()=>{if(!document.hidden)void refresh()},ms)
}
const API={
 version:'3.4.0',
 types:LEGACY_TYPES,
 configure(options){
   if(!options||typeof options!=='object')return false;
   if('enabled'in options)config.enabled=!!options.enabled;
   if('adminUrl'in options)config.adminUrl=validHTTPS(options.adminUrl)||null;
   if('refreshMs'in options)config.refreshMs=Math.max(10000,Number(options.refreshMs)||10000);
   schedule();if(config.enabled){void refresh();void recoverOwnedAds()}else{catalog=[];rawCampaigns=[];applyWhenReady()}return true
 },
 setContext(next){
   if(!next||typeof next!=='object')return false;
   const nextContext={country:Object.prototype.hasOwnProperty.call(next,'country')?countryCode(next.country):context.country,region:String(next.region??context.region??''),city:String(next.city??context.city??''),neighborhood:String(next.neighborhood??context.neighborhood??'')};
   if(Object.keys(nextContext).every(k=>nextContext[k]===context[k]))return true;
   context=nextContext;rebuildCatalog();return true
 },
 connection(){return Object.freeze({enabled:config.enabled,connected:!lastError&&lastRefresh>0,lastRefresh,adsLoaded:catalog.length,campaignsReceived:rawCampaigns.length,lastError,adminUrl:config.adminUrl,source:'firestore'})},
 refresh,
 getCatalog(){return catalog.map(a=>Object.assign({},a))},
 mount(){return false},
 unmount(){}
};
try{Object.defineProperty(window,'TaskFlowADS',{value:Object.freeze(API),writable:false,configurable:false})}catch(_){window.TaskFlowADS=Object.freeze(API)}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{observeSlots();void refresh();schedule();setTimeout(()=>void recoverOwnedAds(),3500)},{once:true});else{observeSlots();void refresh();schedule();setTimeout(()=>void recoverOwnedAds(),3500)}
window.addEventListener('pageshow',()=>{if(Date.now()-lastRefresh>8000)void refresh();else applyWhenReady();void recoverOwnedAds()},{passive:true});
window.addEventListener('online',()=>{void refresh();retryRecommendations(1200);void recoverOwnedAds()},{passive:true});
document.addEventListener('taskflow:account-state-updated',()=>{if(catalog.length)retryRecommendations(300);void recoverOwnedAds()},false);
document.addEventListener('taskflow:firebase-auth-changed',()=>{ownerRecoveryAt=0;void recoverOwnedAds();if(catalog.length)retryRecommendations(500)},false);
document.addEventListener('taskflow:permissions-ready',()=>{if(catalog.length&&localStorage.getItem('taskflow_location_decision_v52')==='granted')retryRecommendations(500);void recoverOwnedAds()},false);
document.addEventListener('taskflow:noads-status-updated',e=>{if(e.detail&&e.detail.active)apply();else void refresh()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastRefresh>8000)void refresh()});
// Convierte coordenadas autorizadas a municipio/departamento con una consulta
// geográfica de precisión reducida. No transmite UID, correo ni hábitos.
async function resolveAuthorizedRegion(position){
 const lat=Number(position?.latitude),lng=Number(position?.longitude);
 if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat< -90||lat>90||lng< -180||lng>180)return false;
 // No procesar geolocalización sin la decisión explícita ya concedida en TaskFlow.
 if(localStorage.getItem('taskflow_location_decision_v52')!=='granted')return false;
 void reportAuthorizedGeoPresence({latitude:lat,longitude:lng});
 const inGuatemala=verifiedCountryFromLocation({latitude:lat,longitude:lng})==='GT';
 const digits=inGuatemala?3:2; // En el exterior se transmiten coordenadas aproximadas, no GPS exacto.
 const qlat=Number(lat.toFixed(digits)),qlng=Number(lng.toFixed(digits));
 const grid=(inGuatemala?'GT:':'WORLD:')+qlat+','+qlng;
 if(lastGeoGrid!==grid){
  // No arrastrar país/ciudad anteriores al cruzar fronteras.
  API.setContext({country:inGuatemala?'GT':'',region:'',city:''});
  lastGeoAt=0;
 }
 if(geoPending&&lastGeoGrid===grid)return geoPending;
 if(Date.now()-lastGeoAt<15*60*1000&&lastGeoGrid===grid&&context.country)return true;
 lastGeoGrid=grid;
 geoPending=(async()=>{
  const cacheName=inGuatemala?GEO_GRID_CACHE:WORLD_GEO_CACHE;
  try{
   const cached=JSON.parse(localStorage.getItem(cacheName)||'null');
   if(cached&&cached.grid===grid&&Date.now()-Number(cached.at)<12*60*60*1000
    &&/^[A-Z]{2}$/.test(String(cached.country||''))){
    API.setContext({country:cached.country,region:cached.region||'',city:cached.city||''});
    lastGeoAt=Date.now();return true;
   }
  }catch(_){}
  // Mantener la resolución oficial de municipio/departamento utilizada en Guatemala.
  if(inGuatemala){
   const url=new URL(GEO_API);
   const query={f:'json',where:'1=1',geometry:qlng+','+qlat,geometryType:'esriGeometryPoint',inSR:'4326',spatialRel:'esriSpatialRelIntersects',outFields:'nombre_1,depto_1',returnGeometry:'false'};
   Object.entries(query).forEach(([k,v])=>url.searchParams.set(k,v));
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
   try{
    const res=await fetch(url.href,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
    if(res.ok){
     const data=await res.json(),matches=Array.isArray(data.features)?data.features:[];
     if(matches.length===1){
      const attrs=matches[0].attributes||{},region=String(attrs.depto_1||'').trim(),city=String(attrs.nombre_1||'').trim();
      if(region&&city&&region.length<=100&&city.length<=100){
       API.setContext({country:'GT',region,city});lastGeoAt=Date.now();
       try{localStorage.setItem(cacheName,JSON.stringify({grid,country:'GT',region,city,at:lastGeoAt}))}catch(_){}
       return true;
      }
     }
    }
   }catch(_){/* Segundo proveedor internacional cuando falla la resolución municipal. */}
   finally{clearTimeout(timer)}
  }
  // Resto del mundo: geocodificación internacional del GPS ya autorizado,
  // con latitud/longitud reducidas y sin ID de usuario, correo ni historial.
  const url=new URL(WORLD_GEO_URL);
  url.searchParams.set('latitude',String(qlat));
  url.searchParams.set('longitude',String(qlng));
  url.searchParams.set('localityLanguage','es');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
  try{
   const res=await fetch(url.href,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
   if(!res.ok)return false;
   const data=await res.json(),country=countryCode(data?.countryCode||'');
   if(!/^[A-Z]{2}$/.test(country)||country==='ZZ')return false;
   // El país es el criterio principal; ciudad/región solo si el proveedor las resuelve.
   const region=String(data?.principalSubdivision||'').trim().slice(0,100);
   const city=String(data?.city||'').trim().slice(0,100);
   API.setContext({country,region,city});lastGeoAt=Date.now();
   try{localStorage.setItem(cacheName,JSON.stringify({grid,country,region,city,at:lastGeoAt}))}catch(_){}
   return true;
  }catch(_){return false}finally{clearTimeout(timer)}
 })().finally(()=>{geoPending=null});
 return geoPending;
}
function useLocationDetail(detail){
 if(localStorage.getItem('taskflow_location_decision_v52')!=='granted'){
  API.setContext({country:'',region:'',city:'',neighborhood:''});
  void withdrawAuthorizedGeoPresence();return;
 }
 const authorized=lastAuthorizedPosition();
 if(authorized)void reportAuthorizedGeoPresence(authorized);
 const data=detail&&typeof detail==='object'?detail:{};
 const place=data.address&&typeof data.address==='object'?data.address:data;
 const region=String(place.region||place.department||place.state||'').trim();
 const city=String(place.city||place.municipality||place.locality||'').trim();
 const country=countryCode(place.countryCode||place.country||'');
 // Conservar ubicaciones ya resueltas por la aplicación cuando incluyen código de país.
 if(/^[A-Z]{2}$/.test(country)&&country!=='ZZ'&&region.length<=100&&city.length<=100){
  API.setContext({country,region,city});return;
 }
 const pos=data.position&&typeof data.position==='object'?data.position:place;
 if(Number.isFinite(Number(pos.latitude))&&Number.isFinite(Number(pos.longitude)))void resolveAuthorizedRegion(pos);
 else applyWhenReady();
}
document.addEventListener('taskflow:permissions-ready',e=>useLocationDetail(e.detail),false);
document.addEventListener('taskflow:location-updated',e=>useLocationDetail(e.detail),false);

/* Recuperar la ubicación ya autorizada si el evento se emitió durante el arranque,
   antes de que se cargara este puente. La ubicación no se entrega a anunciantes. */
async function restoreAuthorizedLocation(){
 try{
  if(localStorage.getItem('taskflow_location_decision_v52')!=='granted'){void withdrawAuthorizedGeoPresence();return false}
  if(navigator.permissions&&typeof navigator.permissions.query==='function'){
   try{
    const permission=await navigator.permissions.query({name:'geolocation'});
    if(permission.state==='denied'){void withdrawAuthorizedGeoPresence();return false}
   }catch(_){}
  }
  const position=JSON.parse(localStorage.getItem('taskflow_location_v52')||'null');
  if(!position||typeof position!=='object')return false;
  return await resolveAuthorizedRegion(position);
 }catch(_){return false}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void restoreAuthorizedLocation()},{once:true});
else void restoreAuthorizedLocation();
window.addEventListener('pageshow',()=>{void restoreAuthorizedLocation()},{passive:true});

// Actualizar el país/región cuando el usuario se desplaza, sin solicitar ubicación si está denegada.
async function refreshLiveAuthorizedLocation(){
 if(document.hidden||localStorage.getItem('taskflow_location_decision_v52')!=='granted'||!navigator.geolocation?.getCurrentPosition)return false;
 try{
  if(navigator.permissions?.query){
   const p=await navigator.permissions.query({name:'geolocation'});
   if(p.state==='denied'){void withdrawAuthorizedGeoPresence();return false}
  }
  return await new Promise(resolve=>navigator.geolocation.getCurrentPosition(
   position=>{void resolveAuthorizedRegion({latitude:position.coords.latitude,longitude:position.coords.longitude});resolve(true)},
   ()=>resolve(false),
   {enableHighAccuracy:false,maximumAge:300000,timeout:10000}
  ));
 }catch(_){return false}
}
// Comprobar cambios geográficos en sesiones prolongadas sin vigilar continuamente al usuario.
setInterval(()=>{if(!document.hidden)void refreshLiveAuthorizedLocation()},15*60*1000);
// Mantener actividad únicamente mientras TaskFlow esté abierto y el permiso continúe vigente.
setInterval(()=>{if(document.hidden)return;
 const permitted=localStorage.getItem('taskflow_location_decision_v52')==='granted';
 if(!permitted){if(!withdrawConfirmed)void withdrawAuthorizedGeoPresence();return}
 const position=lastAuthorizedPosition();if(position)void reportAuthorizedGeoPresence(position);
},60*1000);
window.addEventListener('storage',e=>{if(e.key==='taskflow_location_decision_v52'&&e.newValue!=='granted')void withdrawAuthorizedGeoPresence()},{passive:true});
// Aviso local entre los dos sistemas; no incluye datos de personas ni campañas.
window.addEventListener('storage',e=>{if(e.key==='taskflow_ads_public_changed_at')void refresh()},{passive:true});
try{if(typeof BroadcastChannel==='function'){
 const channel=new BroadcastChannel('taskflow-ads-catalog-v1');
 channel.addEventListener('message',e=>{if(e.data&&e.data.type==='catalog-changed')void refresh()});
}}catch(_){}
})();