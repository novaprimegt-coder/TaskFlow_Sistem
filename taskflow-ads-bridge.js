/* TaskFlow ADS Bridge v2.4.2
   Conecta TaskFlow_Sistem con el catálogo público aprobado de TaskFlow ADS Manager.
   No envía uid, email, hábitos, tareas, contraseñas ni datos administrativos. */
(function(){
'use strict';
if(window.TaskFlowADS&&window.TaskFlowADS.version&&String(window.TaskFlowADS.version).startsWith('2.'))return;

const PROJECT_ID='taskflow-b0ece';
const COLLECTION='adsPublicCampaigns';
const REST_BASE='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(PROJECT_ID)+'/databases/(default)/documents/'+encodeURIComponent(COLLECTION);
const BANNER_SLOTS=['tfAdBannerTimer','tfAdBannerHabitsTasks','tfAdBannerFooter'];
const LEGACY_TYPES=Object.freeze(['banner','interstitial','native_profile','native_menu','in_chat','rewarded_video']);
let config={enabled:true,adminUrl:null,refreshMs:10000};
let catalog=[],rawCampaigns=[],lastRefresh=0,refreshTimer=0,refreshing=null,lastError='';
let slotObserver=null,slotUpdateQueued=false;
let geoPending=null,lastGeoGrid='',lastGeoAt=0;
const GEO_GRID_CACHE='tf_ads_geo_gt_grid_v1';
const GEO_API='https://sig.conred.gob.gt/server/rest/services/Hosted/municipios_guatemala/FeatureServer/0/query';
let context={country:'',region:'',city:''};

function validHTTPS(value){
 if(typeof value!=='string'||!value.trim())return '';
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch(_){return ''}
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
 // Solo se excluye una campaña si existe una incompatibilidad CONFIRMADA.
 // La ausencia temporal de datos de ubicación nunca bloquea anuncios aprobados.
 const cc=countryCode(c.country),xc=countryCode(context.country);
 if(cc&&cc!=='ALL'&&xc&&cc!==xc)return false;
 if(c.region&&context.region&&normText(c.region)!==normText(context.region))return false;
 if(c.city&&context.city&&normText(c.city)!==normText(context.city))return false;
 return true
}

// Eventos de anuncios servidos. Los clics e impresiones se cuentan en el servidor.
// Los contadores NO representan personas únicas, compras ni conversiones externas.
const ANALYTICS_URL='https://taskflow-ads-media.vercel.app/api/analytics';
let analyticsSession='',analyticsTrackingBound=false;
const activeVerticalAds={entry:null,interaction:null};
const impressionSeen=new Map();
function analyticsSessionId(){
 if(analyticsSession)return analyticsSession;
 try{analyticsSession=sessionStorage.getItem('tfads_analytics_session_v1')||''}catch(_){}
 if(!/^[a-f0-9-]{24,80}$/i.test(analyticsSession)){
  try{analyticsSession=crypto.randomUUID()}catch(_){analyticsSession=''}
  if(analyticsSession)try{sessionStorage.setItem('tfads_analytics_session_v1',analyticsSession)}catch(_){}
 }
 return analyticsSession;
}
function recordAdEvent(type,ad,slot){
 if(!ad||!['impression','click'].includes(type)||!catalog.some(x=>x.id===ad.id&&x.campaignId===ad.campaignId&&x.src===ad.src))return;
 const sessionId=analyticsSessionId();if(!sessionId)return;
 const payload={event:type,campaignId:ad.campaignId,adId:ad.id,slot:String(slot||ad.placement).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,50),sessionId};
 try{fetch(ANALYTICS_URL,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{})}catch(_){}
}
function visibleRect(el){
 if(!el||document.hidden)return false;
 const rect=el.getBoundingClientRect();
 return rect.width>5&&rect.height>5&&rect.bottom>0&&rect.top<innerHeight&&rect.right>0&&rect.left<innerWidth;
}
function recordVisibleAd(ad,slot,element){
 if(!visibleRect(element))return;
 const now=Date.now(),key=slot+':'+ad.campaignId+':'+ad.id;
 if(now-(impressionSeen.get(key)||0)<30000)return;
 impressionSeen.set(key,now);
 if(impressionSeen.size>400)impressionSeen.delete(impressionSeen.keys().next().value);
 recordAdEvent('impression',ad,slot);
}
function bindAnalyticsTracking(){
 if(analyticsTrackingBound)return;analyticsTrackingBound=true;
 document.addEventListener('taskflow:ads-media-visible',e=>{
  const slot=e.detail?.placement;
  if(!['entry','interaction'].includes(slot))return;
  const root=document.getElementById(slot==='entry'?'tf56EntryStage':'tf57TouchStage');
  const ad=activeVerticalAds[slot];
  if(ad&&root&&root.querySelector('img,video'))recordVisibleAd(ad,slot,root);
 });
 document.addEventListener('click',e=>{
  const target=e.target?.closest?.('a');
  if(!target||!target.href)return;
  const banner=target.closest('.tf50-ad-slot');
  if(banner){
   const status=bannerStatus.get(banner.id),ad=status&&catalog.find(x=>x.id===status.id&&x.src===status.src&&x.placement==='banner');
   if(ad&&target.href===ad.destination)recordAdEvent('click',ad,banner.id);
   return;
  }
  const entry=target.closest('#tf56EntryAdV56');
  const interaction=target.closest('#tf57TouchAdV57');
  const placement=entry?'entry':interaction?'interaction':'';
  const ad=activeVerticalAds[placement];
  if(ad&&target.href===ad.destination)recordAdEvent('click',ad,placement);
 },true);
 const checkBannerImpressions=()=>{
  for(const slot of BANNER_SLOTS){
   const status=bannerStatus.get(slot),el=document.getElementById(slot);
   const ad=status&&catalog.find(x=>x.id===status.id&&x.src===status.src&&x.placement==='banner');
   if(ad&&el&&el.querySelector('img')?.complete)recordVisibleAd(ad,slot,el);
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
 return c.ads.slice(0,12).map(a=>{
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
 const list=catalog.filter(a=>a.placement===placement);if(!list.length)return null;
 let last='';try{last=localStorage.getItem(lastKey(placement,slot))||''}catch(_){}
 const pool=list.length>1?list.filter(a=>a.id!==last):list;
 const idx=Math.floor(Math.random()*pool.length),lead=pool[idx]||pool[0];
 // Se conserva la selección de campaña, pero se prioriza su creativo HD si existe.
 const siblings=pool.filter(a=>a.campaignId===lead.campaignId);
 const hdWidth=placement==='banner'?2400:2160;
 const hd=siblings.filter(a=>a.mediaWidth===hdWidth);
 const options=hd.length?hd:siblings;
 const ad=options[Math.floor(Math.random()*options.length)]||lead;
 try{localStorage.setItem(lastKey(placement,slot),ad.id)}catch(_){}
 return ad
}
/* Nunca insertar un <img> sin verificar que el archivo se haya cargado realmente.
   Si la URL caducó, la carga falló o el archivo tiene medidas incorrectas,
   intentar otros creativos aprobados. No alterar el anuncio de ingreso o interacción. */
const bannerFailures=new Map(),bannerStatus=new Map(),bannerBusy=new Set();
const BANNER_TURN_MS=30000,IMAGE_TIMEOUT_MS=10000,BANNER_RETRY_MS=60000;
const bannerNearViewport=new Set();
let bannerViewportObserver=null;
// No decodificar simultáneamente creativos fuera de pantalla (GIF grandes).
function queueBanner(slot){
 const element=document.getElementById(slot);if(!element)return;
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
 const list=catalog.filter(a=>a.placement==='banner'&&(!bannerFailures.has(a.src)||Date.now()>=bannerFailures.get(a.src)));
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
 return ordered;
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
 const a=document.createElement('a');a.href=ad.destination;a.target='_blank';
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
 if(current&&live&&live.complete&&validBannerPixels(live)&&Date.now()-displayed.at<BANNER_TURN_MS)return;
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
    bannerStatus.set(slot,{id:ad.id,src:ad.src,at:Date.now()});
    recordVisibleAd(ad,slot,element);
    try{localStorage.setItem(lastKey('banner',slot),ad.id)}catch(_){}
    return;
   }
  }
  // No mostrar nunca el icono roto del navegador.
  const currentAd=bannerStatus.get(slot);
  const stillEligible=currentAd&&catalog.some(a=>a.placement==='banner'&&a.id===currentAd.id&&a.src===currentAd.src);
  if(!stillEligible||!live||!live.complete||!validBannerPixels(live)){
   bannerStatus.delete(slot);
   window.TaskFlowAdsV50.render(slot,null);
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
  BANNER_SLOTS.forEach(slot=>{bannerStatus.delete(slot);try{window.TaskFlowAdsV50.render(slot,null)}catch(_){}});
  return false;
 }
 try{window.TaskFlowAdsV50.refresh&&window.TaskFlowAdsV50.refresh()}catch(_){}
 BANNER_SLOTS.forEach(slot=>{queueBanner(slot)});
 const entry=pick('entry','entry');activeVerticalAds.entry=entry;
 let entryReady=false;
 try{entryReady=window.TaskFlowEntryAdV56.setCreative(entry?{type:entry.type==='video'?'video':'image',src:entry.src,destination:entry.destination,ctaLabel:entry.ctaLabel,objective:entry.objective,sound:entry.sound}:null)===true}catch(e){console.warn('TaskFlow ADS ingreso:',e)}
 // Notifica solo al cargarse un creativo aprobado; evita consumir el ingreso con un espacio vacío.
 if(entryReady){try{document.dispatchEvent(new Event('taskflow:entry-ad-creative-ready'))}catch(_){}}
 const interaction=pick('interaction','interaction');activeVerticalAds.interaction=interaction;
 try{window.TaskFlowInteractionAdV57.setCreative(interaction?{type:interaction.type,src:interaction.src,destination:interaction.destination,ctaLabel:interaction.ctaLabel,objective:interaction.objective,sound:interaction.sound}:null)}catch(e){console.warn('TaskFlow ADS interacción:',e)}
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
function applyWhenReady(){
 observeSlots();
 if(apply())return;
 let tries=0;const t=setInterval(()=>{tries++;if(apply()||tries>=40)clearInterval(t)},250)
}
function rebuildCatalog(){
 catalog=rawCampaigns.flatMap(normalizeCampaign).slice(0,1200);
 applyWhenReady();
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
 if(!config.enabled){catalog=[];rawCampaigns=[];applyWhenReady();return false}
 if(refreshing)return refreshing;
 refreshing=fetchCatalog().catch(e=>{lastError=String(e&&e.message||'No se pudo consultar el catálogo').slice(0,120);console.warn('TaskFlow ADS no disponible:',lastError);return false}).finally(()=>{refreshing=null});
 return refreshing;
}
function schedule(){
 clearInterval(refreshTimer);refreshTimer=0;if(!config.enabled)return;
 const ms=Math.max(10000,Number(config.refreshMs)||10000);refreshTimer=setInterval(()=>{if(!document.hidden)void refresh()},ms)
}
const API={
 version:'2.5.0',
 types:LEGACY_TYPES,
 configure(options){
   if(!options||typeof options!=='object')return false;
   if('enabled'in options)config.enabled=!!options.enabled;
   if('adminUrl'in options)config.adminUrl=validHTTPS(options.adminUrl)||null;
   if('refreshMs'in options)config.refreshMs=Math.max(10000,Number(options.refreshMs)||10000);
   schedule();if(config.enabled)void refresh();else{catalog=[];rawCampaigns=[];applyWhenReady()}return true
 },
 setContext(next){
   if(!next||typeof next!=='object')return false;
   context={country:Object.prototype.hasOwnProperty.call(next,'country')?countryCode(next.country):context.country,region:String(next.region??context.region??''),city:String(next.city??context.city??'')};
   rebuildCatalog();return true
 },
 connection(){return Object.freeze({enabled:config.enabled,connected:!lastError&&lastRefresh>0,lastRefresh,adsLoaded:catalog.length,campaignsReceived:rawCampaigns.length,lastError,adminUrl:config.adminUrl,source:'firestore'})},
 refresh,
 getCatalog(){return catalog.map(a=>Object.assign({},a))},
 mount(){return false},
 unmount(){}
};
try{Object.defineProperty(window,'TaskFlowADS',{value:Object.freeze(API),writable:false,configurable:false})}catch(_){window.TaskFlowADS=Object.freeze(API)}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{observeSlots();void refresh();schedule()},{once:true});else{observeSlots();void refresh();schedule()}
window.addEventListener('pageshow',()=>{if(Date.now()-lastRefresh>8000)void refresh();else applyWhenReady()},{passive:true});
window.addEventListener('online',()=>{void refresh()},{passive:true});
document.addEventListener('taskflow:noads-status-updated',e=>{if(e.detail&&e.detail.active)apply();else void refresh()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastRefresh>8000)void refresh()});
// Convierte coordenadas autorizadas a municipio/departamento con una consulta
// geográfica de precisión reducida. No transmite UID, correo ni hábitos.
async function resolveAuthorizedRegion(position){
 const lat=Number(position&&position.latitude),lng=Number(position&&position.longitude);
 if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<13.7||lat>18||lng< -92.3||lng> -88)return false;
 // Solo se usa la posición que TaskFlow ya recibió con consentimiento.
 if(localStorage.getItem('taskflow_location_decision_v52')!=='granted')return false;
 const qlat=Number(lat.toFixed(3)),qlng=Number(lng.toFixed(3));
 const grid=qlat+','+qlng;
 const country=verifiedCountryFromLocation({latitude:lat,longitude:lng});
 if(grid!==lastGeoGrid||country!==context.country){
  API.setContext({country,region:'',city:''});
 }
 if(geoPending&&lastGeoGrid===grid)return geoPending;
 if(Date.now()-lastGeoAt<15*60*1000&&lastGeoGrid===grid&&context.region&&context.city)return true;
 lastGeoGrid=grid;
 geoPending=(async()=>{
  try{
   const cached=JSON.parse(localStorage.getItem(GEO_GRID_CACHE)||'null');
   if(cached&&cached.grid===grid&&Date.now()-Number(cached.at)<12*60*60*1000&&cached.region&&cached.city){
    API.setContext({country:'GT',region:cached.region,city:cached.city});lastGeoAt=Date.now();return true;
   }
  }catch(_){}
  const url=new URL(GEO_API);
  const query={f:'json',where:'1=1',geometry:qlng+','+qlat,geometryType:'esriGeometryPoint',inSR:'4326',spatialRel:'esriSpatialRelIntersects',outFields:'nombre_1,depto_1',returnGeometry:'false'};
  Object.entries(query).forEach(([k,v])=>url.searchParams.set(k,v));
  const ctrl=new AbortController(),stop=setTimeout(()=>ctrl.abort(),9000);
  try{
   const res=await fetch(url.href,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:ctrl.signal});
   if(!res.ok)return false;
   const result=await res.json();
   const matches=Array.isArray(result.features)?result.features:[];
   if(matches.length!==1)return false;
   const attrs=matches[0].attributes||{};
   const region=String(attrs.depto_1||'').trim(),city=String(attrs.nombre_1||'').trim();
   if(!region||!city||region.length>100||city.length>100)return false;
   API.setContext({country:'GT',region,city});lastGeoAt=Date.now();
   try{localStorage.setItem(GEO_GRID_CACHE,JSON.stringify({grid,region,city,at:lastGeoAt}))}catch(_){}
   return true;
  }catch(_){return false}finally{clearTimeout(stop)}
 })().finally(()=>{geoPending=null});
 return geoPending;
}
function useLocationDetail(detail){
 const data=detail&&typeof detail==='object'?detail:{};
 const place=data.address&&typeof data.address==='object'?data.address:data;
 const region=place.region||place.department||place.state||'';
 const city=place.city||place.municipality||place.locality||'';
 if(region||city)API.setContext({country:place.country||context.country,region,city});
 else{
  const pos=data.position&&typeof data.position==='object'?data.position:place;
  if(Number.isFinite(Number(pos.latitude))&&Number.isFinite(Number(pos.longitude)))void resolveAuthorizedRegion(pos);
  else applyWhenReady();
 }
}
document.addEventListener('taskflow:permissions-ready',e=>useLocationDetail(e.detail),false);
document.addEventListener('taskflow:location-updated',e=>useLocationDetail(e.detail),false);

/* Recuperar la ubicación ya autorizada si el evento se emitió durante el arranque,
   antes de que se cargara este puente. La ubicación no se entrega a anunciantes. */
async function restoreAuthorizedLocation(){
 try{
  if(localStorage.getItem('taskflow_location_decision_v52')!=='granted')return false;
  if(navigator.permissions&&typeof navigator.permissions.query==='function'){
   try{
    const permission=await navigator.permissions.query({name:'geolocation'});
    if(permission.state!=='granted')return false;
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

// Aviso local entre los dos sistemas; no incluye datos de personas ni campañas.
window.addEventListener('storage',e=>{if(e.key==='taskflow_ads_public_changed_at')void refresh()},{passive:true});
try{if(typeof BroadcastChannel==='function'){
 const channel=new BroadcastChannel('taskflow-ads-catalog-v1');
 channel.addEventListener('message',e=>{if(e.data&&e.data.type==='catalog-changed')void refresh()});
}}catch(_){}
})();