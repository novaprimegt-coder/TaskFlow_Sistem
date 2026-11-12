/* TaskFlow ADS Bridge v3.6.0
   Conecta TaskFlow_Sistem con el catálogo público aprobado de TaskFlow ADS Manager.
   No envía uid, email, hábitos, tareas, contraseñas ni datos administrativos. */
(function(){
'use strict';
if(window.TaskFlowADS&&window.TaskFlowADS.version)return;

const PROJECT_ID='taskflow-b0ece';
const COLLECTION='adsPublicCampaigns';
const REST_BASE='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(PROJECT_ID)+'/databases/(default)/documents/'+encodeURIComponent(COLLECTION);
const bannerSlots = () => window.TaskFlowAdsV50?.slots || [];
const VERTICAL_PLACEMENTS = ['entry', 'interaction'];
const paidNoAds = () => Boolean(window.TaskFlowNoAds?.isActive?.());
const adsPermitted = () => config.enabled && !paidNoAds();
const adPreferences = () => window.TaskFlowAdPreferencesV161?.get() || {interests: [], area: null};
const signedInAccount = () => String(window.TaskFlowFirebase?.getUser?.()?.uid || '');
// The client receives only campaign references, never commercial weighting or budget data.
const SELECTION_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/choose/v161';
const CONFIRM_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/confirm';
const AUDIENCE_AREA_URL='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/audience/area';
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

let recommendations = new Map();
let recommendationRequest = null, recommendationQueued = false, recommendationRetry = 0;
const completedSelections = new Set();
const checkedSlots = new Set();
function retryRecommendations(ms){
 if(recommendationRetry)clearTimeout(recommendationRetry);
 recommendationRetry=setTimeout(()=>{recommendationRetry=0;if(config.enabled&&catalog.length)void refreshRecommendations()},Math.max(250,Number(ms)||4000));
}
function clearRecommendationRetry(){if(recommendationRetry)clearTimeout(recommendationRetry);recommendationRetry=0}

function refreshRecommendations() {
 if (recommendationRequest) {
  recommendationQueued = true;
  return recommendationRequest;
 }
 recommendationRequest = loadRecommendations().finally(() => {
  recommendationRequest = null;
  if (recommendationQueued) {
   recommendationQueued = false;
   void refreshRecommendations();
  }
 });
 return recommendationRequest;
}

function verticalApi(placement) {
 return placement === 'entry' ? window.TaskFlowEntryAdV56 : window.TaskFlowInteractionAdV57;
}

async function loadRecommendations() {
 if (!adsPermitted() || !audienceIsCurrent() || !catalog.length) {
  applyWhenReady();
  return;
 }
 const sessionId = analyticsSessionId();
 if (!sessionId) { settleUnavailable(); return; }
 const scope = audienceScope;
 const revision = catalogRevision;
 const preferences = adPreferences();
 const token = await deliveryToken();
 if (scope !== audienceScope || revision !== catalogRevision || !audienceIsCurrent()) return;
 if (!token) { settleUnavailable(); retryRecommendations(4000); return; }
 const slots = bannerSlots().filter(slot => document.getElementById(slot))
  .map(slot => ({placement: 'banner', slot}));
 for (const placement of VERTICAL_PLACEMENTS) {
  const api = verticalApi(placement);
  if (!api?.hasShown?.() && !api?.isRunning?.()) slots.push({placement, slot: placement});
 }
 await Promise.all(slots.map(async ({placement, slot}) => {
  const candidates = catalog.filter(ad => ad.placement === placement && adEligible(ad));
  if (!candidates.length) return;
  const previous = recommendations.get(slot);
  if (previous && previous.expiresAt > Date.now() && !completedSelections.has(previous.selectionToken)) return;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 6500);
  let selected = null;
  try {
   const response = await fetch(SELECTION_URL, {
    method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
    signal: abort.signal, headers: {'Content-Type': 'application/json', Authorization: 'Bearer ' + token},
    body: JSON.stringify({placement, slot, sessionId, audienceVersion: 1,
     ...(preferences.area ? {area: preferences.area} : {}),
     ...(preferences.interests.length ? {interests: preferences.interests} : {}),
    }),
   });
   if (response.ok) {
    const {campaignId, adId, selectionToken} = await response.json();
    if (typeof selectionToken === 'string' && /^[a-f0-9-]{36}$/i.test(selectionToken) &&
        candidates.some(ad => ad.campaignId === campaignId && ad.id === adId)) {
     selected = {campaignId, adId, selectionToken,
      expiresAt: Date.now() + (placement === 'banner' ? 30000 : 900000)};
    }
   }
  } catch (_) {} finally { clearTimeout(timer); }
  if (scope !== audienceScope || revision !== catalogRevision || !audienceIsCurrent()) return;
  checkedSlots.add(slot);
  if (selected && !completedSelections.has(selected.selectionToken)) recommendations.set(slot, selected);
  else recommendations.delete(slot);
  applyWhenReady();
 }));
 applyWhenReady();
 if (slots.some(({slot,placement}) => !recommendations.has(slot) && catalog.some(ad => ad.placement === placement && adEligible(ad)))) {
  const age = Date.now() - catalogChangedAt;
  retryRecommendations(age < 2500 ? 1100 : age < 6500 ? 2600 : 12000);
 } else clearRecommendationRetry();
}

function settleUnavailable() {
 for (const slot of [...bannerSlots(), ...VERTICAL_PLACEMENTS]) checkedSlots.add(slot);
 applyWhenReady();
}

const LEGACY_TYPES=Object.freeze(['banner','interstitial','native_profile','native_menu','in_chat','rewarded_video']);
let config={enabled:true,adminUrl:null,refreshMs:10000};
let catalog=[],rawCampaigns=[],lastRefresh=0,refreshTimer=0,refreshing=null,lastError='';
let slotObserver=null,slotUpdateQueued=false;
const emptyContext = () => ({country: '', region: '', city: '', neighborhood: ''});
let context = emptyContext();
let selectedInterests = [];
let audienceState = 'pending', audienceScope = '', authSettled = false;
let catalogRevision = 0, catalogSignature = '', catalogChangedAt = 0;
let syncedAreaKey = '', areaSyncRequest = null;
const audienceDeadline = Date.now() + 16000;

async function deliveryToken() {
 let timer;
 try {
  return await Promise.race([
   window.TaskFlowFirebase?.getIdToken?.(),
   new Promise(resolve => { timer = setTimeout(() => resolve(null), 5000); }),
  ]);
 } catch (_) { return null; } finally { clearTimeout(timer); }
}

const audienceKey = (account, preferences) => account ? JSON.stringify([account,preferences.area,preferences.interests]) : '';
const audienceIsCurrent = () => adsPermitted() && navigator.onLine !== false && audienceState === 'available' &&
 audienceKey(signedInAccount(), adPreferences()) === audienceScope;

function clearSelections() {
 recommendations.clear();
 checkedSlots.clear();
 bannerStatus.clear();
 for (const slot of bannerSlots()) window.TaskFlowAdsV50?.render?.(slot, null, false);
 for (const placement of VERTICAL_PLACEMENTS) {
  const api = verticalApi(placement);
  activeVerticalAds[placement] = null;
  api?.setCreative(null);
  if (api?.isSponsored?.()) api.close(true);
 }
}

function syncDeclaredArea() {
 const account = signedInAccount();
 if (!account || !config.enabled || areaSyncRequest || navigator.onLine === false) return;
 const {area} = adPreferences();
 const key = JSON.stringify([account, area]);
 if (key === syncedAreaKey) return;
 areaSyncRequest = (async () => {
  const token = await deliveryToken();
  if (!token || account !== signedInAccount() || key !== JSON.stringify([account, adPreferences().area])) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
   const response = await fetch(area ? AUDIENCE_AREA_URL : GEO_WITHDRAW_URL, {
    method:'POST', mode:'cors', credentials:'omit', cache:'no-store', referrerPolicy:'no-referrer',
    signal:controller.signal, headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
    body:JSON.stringify(area ? {consent:true, area} : {}),
   });
   if (response.ok) syncedAreaKey = key;
  } catch (_) {} finally { clearTimeout(timeout); }
 })().finally(() => {
  areaSyncRequest = null;
  const next = signedInAccount();
  if (next && JSON.stringify([next, adPreferences().area]) !== key) syncDeclaredArea();
 });
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
const campaignDayFormatter = new Intl.DateTimeFormat('en-CA', {
 timeZone:'America/Guatemala', year:'numeric',month:'2-digit',day:'2-digit',
});
function dateEligible(c){
 const parts = campaignDayFormatter.formatToParts(new Date());
 const today = ['year','month','day'].map(type => parts.find(part => part.type === type)?.value).join('-');
 return (!c.start || /^\d{4}-\d{2}-\d{2}$/.test(c.start) && c.start <= today) &&
  (!c.end || /^\d{4}-\d{2}-\d{2}$/.test(c.end) && c.end >= today);
}
function comparableArea(value, kind) {
 const normalized = normText(value);
 if (kind === 'region') return normalized.replace(/^(?:departamento\s+de(?:l)?|departamento|depto\.?|provincia\s+de|provincia|estado\s+de|estado|region\s+de|region)\s+/, '').trim();
 if (kind === 'city') return normalized.replace(/^(?:municipio\s+de|municipio|ciudad\s+de|ciudad)\s+/, '').trim();
 return normalized;
}
function targetEligible(target) {
 const cc = countryCode(target.country);
 return (!cc || cc === 'ALL' || cc === context.country) &&
  ['region', 'city', 'neighborhood'].every(kind => !target[kind] ||
   Boolean(context[kind] && comparableArea(target[kind], kind) === comparableArea(context[kind], kind)));
}

function adEligible(ad) {
 return targetEligible(ad.target) && (!ad.interestTopics.length ||
  ad.interestTopics.some(topic => selectedInterests.includes(topic)));
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
 if (el.matches('.tf50-ad-slot')) {
  if (document.querySelector('#tfEntryAdV56.open,#tfInteractionAdV57.open,#tfPermissionGateT52:not([hidden]),#tfPayPalNoAdsModal:not([hidden])')) return false;
  const foreground = document.querySelector('#windowContainer.open') || document.querySelector('#sideMenu.open');
  if (foreground && !foreground.contains(el)) return false;
 }
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
  if(!target||!target.href||target.classList.contains('tf158-promo'))return;
  const banner=target.closest('.tf50-ad-slot');
  if(banner){
   const status=bannerStatus.get(banner.id),ad=status&&catalog.find(x=>x.id===status.id&&x.src===status.src&&x.placement==='banner');
   if(ad&&status&&target.href===trackedDestination({...ad,selectionToken:status.selectionToken})){
   const media=banner.querySelector('img');
   if(media?.complete&&media.naturalWidth>0)recordVisibleAd(ad,banner.id,banner);
   recordAdEvent('click',ad,banner.id);
   if(e.isTrusted)window.TaskFlowAdPreferencesV161?.learnTopics?.(ad.interestTopics);
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
   if(e.isTrusted)window.TaskFlowAdPreferencesV161?.learnTopics?.(ad.interestTopics);
  }
 },true);
 const checkBannerImpressions=()=>{
  for(const slot of bannerSlots()){
   const status=bannerStatus.get(slot),el=document.getElementById(slot);
   const ad=status&&catalog.find(x=>x.id===status.id&&x.src===status.src&&x.placement==='banner');
   if(ad&&el){const img=el.querySelector('img');if(img?.complete&&img.naturalWidth>0)recordVisibleAd(ad,slot,el)}
  }
 };
 window.addEventListener('scroll',checkBannerImpressions,{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkBannerImpressions()});
 window.addEventListener('resize',checkBannerImpressions,{passive:true});
 setInterval(()=>{if(!document.hidden)checkBannerImpressions()},12000);
}

const OBJECTIVE_CTA=Object.freeze({awareness:'Conocer la marca',traffic:'Visitar sitio web',engagement:'Participar',leads:'Solicitar información',sales:'Comprar ahora',app:'Descargar aplicación'});
function ctaForObjective(c){return OBJECTIVE_CTA[c?.objective]||OBJECTIVE_CTA.awareness}
function normalizeCampaign(c){
 if(!c||c.status!=='active'||c.approvalStatus!=='approved'||!dateEligible(c))return [];
 const placement=['banner','entry','interaction'].includes(c.placement)?c.placement:'';
 if(!placement||!Array.isArray(c.ads))return [];
 const target={country:c.country,region:c.region,city:c.city,neighborhood:c.neighborhood};
 const interestTopics=Array.isArray(c.interestTopics)?c.interestTopics.filter(t=>typeof t==='string').slice(0,10).sort():[];
 const scopeRevision=JSON.stringify([target,interestTopics,c.start,c.end,c.ageMin,c.ageMax,c.radius]);
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
   const renderRevision=JSON.stringify([scopeRevision,src,destination,type,width,height,duration,a.sound,c.objective]);
   return {target,interestTopics,renderRevision,id:String(a.id||c.id).slice(0,140),campaignId:String(c.campaignId||c.id||'').slice(0,140),placement,type,src,destination,mediaWidth:width,mediaHeight:height,objective:c.objective||'awareness',ctaLabel:ctaForObjective(c),sound:type==='video'&&a.sound===true};
 }).filter(Boolean)
}
const bannerFailures = new Map(), bannerStatus = new Map(), bannerBusy = new Set();
const verticalFailures = new Map();
const IMAGE_TIMEOUT_MS = 16000, BANNER_RETRY_MS = 60000;

function selectedCreatives(placement, slot, failures) {
 const selected = recommendations.get(slot);
 if (!audienceIsCurrent() || !selected || selected.expiresAt <= Date.now() ||
     completedSelections.has(selected.selectionToken)) return [];
 return catalog.filter(ad => ad.placement === placement && ad.campaignId === selected.campaignId &&
  ad.id === selected.adId && adEligible(ad) && (failures.get(ad.src) || 0) <= Date.now())
  .sort((a, b) => b.mediaWidth - a.mediaWidth)
  .map(ad => ({...ad, selectionToken: selected.selectionToken}));
}
function queueBanner(slot) {
 if (document.getElementById(slot)) void displayBanner(slot);
 else bannerStatus.delete(slot);
}
function bannerCandidates(slot) {
 return selectedCreatives('banner', slot, bannerFailures);
}
function validBannerPixels(img){
 const w=img.naturalWidth,h=img.naturalHeight;
 return (w===1200&&h===180)||(w===2400&&h===360);
}
function testedBanner(ad){
 return new Promise(resolve=>{
  if(!ad||!ad.src){resolve(null);return}
  const img=new Image();let finished=false,decoding=false;
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
  const verify=async()=>{
   if(finished||decoding)return;
   if(!validBannerPixels(img)||img.naturalWidth!==ad.mediaWidth||img.naturalHeight!==ad.mediaHeight){done(null);return}
   decoding=true;
   try{
    if(typeof img.decode==='function')await img.decode();
    done(img);
   }catch(_){done(null)}
  };
  img.onload=verify;
  img.onerror=()=>done(null);
  img.src=ad.src;
  if(img.complete)queueMicrotask(verify);
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
 return a;
}
function canShowPromo(placement, slot) {
 if (!config.enabled || paidNoAds()) return false;
 if (!lastRefresh && !lastError) return false;
 if (!adsPermitted()) return false;
 const inventory = catalog.filter(ad => ad.placement === placement);
 if (!inventory.length || audienceState === 'unavailable' || navigator.onLine === false) return true;
 if (!audienceIsCurrent()) return false;
 return checkedSlots.has(slot) || !inventory.some(ad => adEligible(ad));
}

async function displayBanner(slot) {
 if (bannerBusy.has(slot)) return;
 const element = document.getElementById(slot);
 if (!element) return;
 const selected = recommendations.get(slot);
 const live = element.querySelector('img');
 const current = bannerStatus.get(slot);
 const approved = audienceIsCurrent() && current && catalog.some(ad => ad.placement === 'banner' &&
  ad.campaignId === current.campaignId && ad.id === current.id && ad.renderRevision === current.renderRevision && adEligible(ad));
 if (approved && live?.complete && validBannerPixels(live) &&
     current.selectionToken === selected?.selectionToken && selected.expiresAt > Date.now()) return;
 const candidates = bannerCandidates(slot);
 if (!candidates.length) {
  bannerStatus.delete(slot);
  window.TaskFlowAdsV50.render(slot, null, canShowPromo('banner', slot));
  return;
 }
 if (!approved) window.TaskFlowAdsV50.render(slot, null, false);
 bannerBusy.add(slot);
 try {
  for (const ad of candidates) {
   const img = await testedBanner(ad);
   if (!audienceIsCurrent() || recommendations.get(slot)?.selectionToken !== ad.selectionToken) return;
   if (!img || !catalog.some(item => item.placement === 'banner' && item.campaignId === ad.campaignId &&
       item.id === ad.id && item.renderRevision === ad.renderRevision && adEligible(item))) continue;
   const currentElement = document.getElementById(slot);
   if (!currentElement) return;
   if (window.TaskFlowAdsV50.render(slot, bannerNode(ad, img))) {
    bannerStatus.set(slot, {...ad, at: Date.now()});
    recordVisibleAd(ad, slot, currentElement);
    return;
   }
  }
  bannerStatus.delete(slot);
  window.TaskFlowAdsV50.render(slot, null, canShowPromo('banner', slot));
 } catch (error) {
  console.warn('TaskFlow ADS: no fue posible mostrar banner', slot, error);
 } finally {
  bannerBusy.delete(slot);
  if (recommendations.get(slot) !== selected) queueBanner(slot);
 }
}

function runtimeReady() {
 return !!(window.TaskFlowAdsV50?.render && VERTICAL_PLACEMENTS.every(slot => verticalApi(slot)?.setCreative));
}

function enableUnfilledVerticalPromos(placement, creative) {
 window.TaskFlowAdsV50.setPromoReady(placement, !creative && canShowPromo(placement, placement));
}

function apply() {
 if (!runtimeReady()) return false;
 bindAnalyticsTracking();
 window.TaskFlowAdsV50.setEnabled?.(config.enabled);
 window.TaskFlowAdsV50.refresh();
 for (const slot of bannerSlots()) queueBanner(slot);
 for (const placement of VERTICAL_PLACEMENTS) {
  const api = verticalApi(placement);
  const active = activeVerticalAds[placement];
  if (active && (!audienceIsCurrent() || !catalog.some(ad => ad.placement === placement &&
      ad.campaignId === active.campaignId && ad.id === active.id && ad.renderRevision === active.renderRevision && adEligible(ad)))) {
   activeVerticalAds[placement] = null;
   api.setCreative(null);
   if (api.isSponsored?.()) api.close(true);
  }
  if (!config.enabled || paidNoAds()) api.close(true);
  if (api.isRunning() || api.hasShown?.()) continue;
  const ad = selectedCreatives(placement, placement, verticalFailures)[0];
  if (ad && activeVerticalAds[placement]?.selectionToken === ad.selectionToken) continue;
  const accepted = api.setCreative(ad ? {
   type: ad.type, src: ad.src, destination: trackedDestination(ad), ctaLabel: ad.ctaLabel, sound: ad.sound,
   mediaWidth: ad.mediaWidth, mediaHeight: ad.mediaHeight,
  } : null);
  activeVerticalAds[placement] = accepted ? ad : null;
  enableUnfilledVerticalPromos(placement, accepted);
  if (accepted) document.dispatchEvent(new Event('taskflow:' + placement + '-ad-creative-ready'));
 }
 return true;
}

function observeSlots(){
 if (slotObserver || !document.documentElement || typeof MutationObserver !== 'function') return;
 slotObserver = new MutationObserver(records => {
  if (slotUpdateQueued) return;
  const changed = records.some(record => [...record.addedNodes].some(node =>
   node.nodeType === 1 && node.matches('.tf50-ad-slot')));
  if (!changed) return;
  slotUpdateQueued = true;
  requestAnimationFrame(() => {
   slotUpdateQueued = false;
   if (audienceIsCurrent() && bannerSlots().some(id => document.getElementById(id) && !recommendations.has(id))) {
    void refreshRecommendations();
   }
   apply();
  });
 });
 slotObserver.observe(document.documentElement, {childList: true, subtree: true});
}

function finishVertical(placement, rejectedSrc) {
 const ad = activeVerticalAds[placement];
 if (!ad) {
  if (!rejectedSrc && placement === 'interaction' && adsPermitted()) void refreshRecommendations();
  return;
 }
 if (rejectedSrc && ad.src !== rejectedSrc) return;
 activeVerticalAds[placement] = null;
 verticalApi(placement)?.setCreative(null);
 completedSelections.add(ad.selectionToken);
 if (completedSelections.size > 500) completedSelections.delete(completedSelections.values().next().value);
 if (recommendations.get(placement)?.selectionToken === ad.selectionToken) recommendations.delete(placement);
 checkedSlots.delete(placement);
 if (rejectedSrc) {
  verticalFailures.set(rejectedSrc, Date.now() + BANNER_RETRY_MS);
  window.TaskFlowAdsV50?.setPromoReady?.(placement, true);
 } else if (placement === 'interaction') {
  window.TaskFlowAdsV50?.setPromoReady?.(placement, false);
 }
 if (placement === 'interaction' || rejectedSrc) {
  void Promise.resolve(impressionConfirmations.get(ad.selectionToken)).catch(() => {}).then(() => refreshRecommendations());
 }
}

for (const placement of VERTICAL_PLACEMENTS) {
 document.addEventListener('taskflow:' + placement + '-ad-complete', () => finishVertical(placement));
}
document.addEventListener('taskflow:entry-ad-reentered', () => { void refreshRecommendations(); });
document.addEventListener('taskflow:ad-media-rejected', event => {
 const {placement, src} = event.detail || {};
 if (VERTICAL_PLACEMENTS.includes(placement) && src) finishVertical(placement, src);
});
let readinessTimer=0;
function applyWhenReady(){
 observeSlots();
 if(apply()){if(readinessTimer)clearInterval(readinessTimer);readinessTimer=0;return}
 if(readinessTimer)return;
 let tries=0;readinessTimer=setInterval(()=>{
  tries++;if(apply()||tries>=120){clearInterval(readinessTimer);readinessTimer=0}
 },500)
}
function rebuildCatalog() {
 const next = rawCampaigns.flatMap(normalizeCampaign).slice(0, 1200);
 const signature = JSON.stringify(next);
 if (signature !== catalogSignature) {
  catalogSignature = signature;
  catalogRevision++;
  catalogChangedAt = Date.now();
  const previous = catalog;
  catalog = next;
  checkedSlots.clear();
  for (const [slot, selected] of recommendations) {
   const placement = VERTICAL_PLACEMENTS.includes(slot) ? slot : 'banner';
   const isSelected = ad => ad.placement === placement && ad.campaignId === selected.campaignId &&
    ad.id === selected.adId && adEligible(ad);
   const revisions = ads => ads.filter(isSelected).map(ad => ad.renderRevision).sort().join('|');
   if (!catalog.some(isSelected) || revisions(previous) !== revisions(catalog)) recommendations.delete(slot);
  }
  document.dispatchEvent(new CustomEvent('taskflow:ads-catalog-updated', {detail: {available: catalog.length}}));
 }
 applyWhenReady();
 void refreshRecommendations();
}

const SDK_ROOT = 'https://www.gstatic.com/firebasejs/12.18.0/';
let liveUnsubscribe = null, liveStarting = null, liveConnected = false;
let liveEpoch = 0, liveSerial = 0, liveTimeout = 0, liveRetry = 0;
function loadCatalogSdk(file, available) {
 if (available()) return Promise.resolve();
 return new Promise((resolve, reject) => {
  const src = SDK_ROOT + file;
  const present = [...document.scripts].find(tag => tag.src === src);
  const script = present || document.createElement('script');
  const done = () => {
   clearTimeout(timer);
   script.removeEventListener('load',done);
   script.removeEventListener('error',done);
   if (available()) resolve();
   else {
    if (!present) script.remove();
    reject(new Error('SDK de catálogo no disponible'));
   }
  };
  const timer = setTimeout(done,7000);
  script.addEventListener('load',done,{once:true});
  script.addEventListener('error',done,{once:true});
  if (!present) {
   script.src = src;
   script.crossOrigin = 'anonymous';
   document.head.appendChild(script);
  }
 });
}
function stopLiveCatalog() {
 liveEpoch++;
 liveConnected = false;
 clearTimeout(liveTimeout);
 clearTimeout(liveRetry);
 liveRetry = 0;
 liveUnsubscribe?.();
 liveUnsubscribe = null;
}
function recoverLiveCatalog() {
 stopLiveCatalog();
 void refresh();
 liveRetry = setTimeout(() => { liveRetry = 0; void connectLiveCatalog(); },30000);
}
function connectLiveCatalog() {
 if (!adsPermitted() || navigator.onLine === false || liveUnsubscribe || liveStarting || liveRetry) return;
 const epoch = ++liveEpoch;
 liveStarting = (async () => {
  await loadCatalogSdk('firebase-app-compat.js',() => Boolean(window.firebase?.initializeApp));
  await loadCatalogSdk('firebase-firestore-compat.js',() => Boolean(window.firebase?.firestore));
  if (epoch !== liveEpoch || !adsPermitted() || navigator.onLine === false) return;
  const sdk = window.firebase;
  // Aislar el catálogo público del SDK que sincroniza la cuenta y los datos privados.
  const appName = 'taskflow-public-ads';
  const app = sdk.apps.find(item => item.name === appName) || sdk.initializeApp({projectId:PROJECT_ID},appName);
  liveTimeout = setTimeout(recoverLiveCatalog,9000);
  liveUnsubscribe = app.firestore().collection(COLLECTION).limit(500).onSnapshot({includeMetadataChanges:true},snapshot => {
   if (epoch !== liveEpoch) return;
   if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) { liveConnected = false; return; }
   clearTimeout(liveTimeout);
   liveConnected = true;
   liveSerial++;
   rawCampaigns = snapshot.docs.map(doc => ({...doc.data(),id:doc.id}));
   lastRefresh = Date.now();
   lastError = '';
   rebuildCatalog();
  },() => { if (epoch === liveEpoch) recoverLiveCatalog(); });
 })().catch(() => { if (epoch === liveEpoch) recoverLiveCatalog(); }).finally(() => { liveStarting = null; });
 return liveStarting;
}

async function fetchCatalog(){
 const epoch = liveSerial;
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
 if (epoch === liveSerial && !liveConnected && adsPermitted()) {
  rawCampaigns=all;lastRefresh=Date.now();lastError='';rebuildCatalog();
 }
 return true;
}
async function refresh(){
 if(window.TaskFlowNoAds&&window.TaskFlowNoAds.isActive&&window.TaskFlowNoAds.isActive())return false;
 if(!config.enabled){stopLiveCatalog();catalog=[];rawCampaigns=[];catalogSignature='';clearSelections();applyWhenReady();return false}
 if(liveConnected){rebuildCatalog();return true}
 if(refreshing)return refreshing;
 refreshing=fetchCatalog().catch(e=>{lastError=String(e&&e.message||'No se pudo consultar el catálogo').slice(0,120);console.warn('TaskFlow ADS no disponible:',lastError);applyWhenReady();return false}).finally(()=>{refreshing=null});
 return refreshing;
}
function schedule(){
 clearInterval(refreshTimer);refreshTimer=0;if(!config.enabled)return;
 const ms=Math.max(10000,Number(config.refreshMs)||10000);refreshTimer=setInterval(()=>{if(!document.hidden)void refresh()},ms)
}
const API={
 version:'3.6.0',
 types:LEGACY_TYPES,
 configure(options){
   if(!options||typeof options!=='object')return false;
   if('enabled'in options)config.enabled=!!options.enabled;
   if('adminUrl'in options)config.adminUrl=validHTTPS(options.adminUrl)||null;
   if('refreshMs'in options)config.refreshMs=Math.max(10000,Number(options.refreshMs)||10000);
   schedule();void refresh();if(config.enabled){void connectLiveCatalog();updateAudience();void recoverOwnedAds()}return true
 },
 connection(){return Object.freeze({enabled:config.enabled,connected:!lastError&&lastRefresh>0,lastRefresh,adsLoaded:catalog.length,campaignsReceived:rawCampaigns.length,lastError,adminUrl:config.adminUrl,source:liveConnected?'firestore-realtime':'firestore-rest'})},
 refresh,
 getCatalog(){return catalog.map(ad=>({...ad,target:{...ad.target},interestTopics:[...ad.interestTopics]}))},
 getAdAreas(){return rawCampaigns.filter(c=>c.status==='active'&&c.approvalStatus==='approved'&&/^[A-Z]{2}$/.test(countryCode(c.country)))
  .map(c=>({country:countryCode(c.country),region:String(c.region||''),city:String(c.city||'')}));},
 mount(){return false},
 unmount(){}
};
try{Object.defineProperty(window,'TaskFlowADS',{value:Object.freeze(API),writable:false,configurable:false})}catch(_){window.TaskFlowADS=Object.freeze(API)}

function updateAudience() {
 const account = signedInAccount();
 const preferences = adPreferences();
 const scope = audienceKey(account, preferences);
 if (scope !== audienceScope) {
  audienceScope = scope;
  context = preferences.area ? {...preferences.area, neighborhood: ''} : emptyContext();
  selectedInterests = preferences.interests;
  clearSelections();
 }
 audienceState = account ? 'available' : authSettled || Date.now() >= audienceDeadline ? 'unavailable' : 'pending';
 applyWhenReady();
 if (audienceIsCurrent()) void refreshRecommendations();
 syncDeclaredArea();
}

function boot() {
 observeSlots();
 void refresh();
 void connectLiveCatalog();
 updateAudience();
 void Promise.resolve(window.TaskFlowFirebase?.initialize?.()).then(() => {
  authSettled = true;
  updateAudience();
 }).catch(() => {});
 schedule();
 setTimeout(() => void recoverOwnedAds(), 3500);
 setTimeout(updateAudience, Math.max(0, audienceDeadline - Date.now()));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
else boot();
window.addEventListener('pageshow', () => {
 updateAudience();
 if (Date.now() - lastRefresh > 8000) void refresh();
 else applyWhenReady();
 void connectLiveCatalog();
 void recoverOwnedAds();
}, {passive: true});
window.addEventListener('online', () => { updateAudience(); void connectLiveCatalog(); void refresh(); void recoverOwnedAds(); }, {passive: true});
window.addEventListener('offline', () => {
 stopLiveCatalog();
 clearSelections();
 lastError = 'Sin conexión';
 applyWhenReady();
}, {passive: true});
document.addEventListener('taskflow:account-state-updated', () => { updateAudience(); void recoverOwnedAds(); });
document.addEventListener('taskflow:firebase-auth-changed', () => {
 ownerRecoveryAt = 0;
 updateAudience();
 void recoverOwnedAds();
});
document.addEventListener('taskflow:ad-preferences-updated', updateAudience);
document.addEventListener('taskflow:permissions-ready', applyWhenReady);
document.addEventListener('taskflow:noads-status-updated', e => {
 if (e.detail?.active) { stopLiveCatalog(); apply(); }
 else { void connectLiveCatalog(); void refresh(); }
});
document.addEventListener('visibilitychange', () => {
 if (document.hidden) return;
 updateAudience();
 void connectLiveCatalog();
 if (Date.now() - lastRefresh > 8000) void refresh();
});
setInterval(syncDeclaredArea, 60000);
// Aviso local entre los dos sistemas; no incluye datos de personas ni campañas.
window.addEventListener('storage',e=>{if(e.key==='taskflow_ads_public_changed_at')void refresh()},{passive:true});
try{if(typeof BroadcastChannel==='function'){
 const channel=new BroadcastChannel('taskflow-ads-catalog-v1');
 channel.addEventListener('message',e=>{if(e.data&&e.data.type==='catalog-changed')void refresh()});
}}catch(_){}
})();
