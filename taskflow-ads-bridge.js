/* TaskFlow ADS Bridge v2.1.0
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
let config={enabled:true,adminUrl:null,refreshMs:60000};
let catalog=[],rawCampaigns=[],lastRefresh=0,refreshTimer=0,refreshing=null,lastError='';
let slotObserver=null,slotUpdateQueued=false;
let context={country:localeCountry(),region:'',city:''};

function validHTTPS(value){
 if(typeof value!=='string'||!value.trim())return '';
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch(_){return ''}
}
function normText(v){return String(v||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es')}
function countryCode(v){const c=normText(v);return c==='guatemala'||c==='gt'?'GT':c.toUpperCase()}
function localeCountry(){
 try{const lang=String(navigator.language||'');const m=lang.match(/[-_]([A-Za-z]{2})$/);return m?m[1].toUpperCase():''}catch(_){return ''}
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
 const cc=countryCode(c.country),xc=countryCode(context.country);
 if(cc&&cc!=='ALL'&&xc&&cc!==xc)return false;
 if(c.region){if(!context.region||normText(c.region)!==normText(context.region))return false}
 if(c.city){if(!context.city||normText(c.city)!==normText(context.city))return false}
 return true
}
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
   if(placement==='banner'&&(width!==1200||height!==180))return null;
   if((placement==='entry'||placement==='interaction')&&(width!==1080||height!==1920))return null;
   if(type==='video'&&Math.abs(duration-10)>.09)return null;
   return {id:String(a.id||c.id).slice(0,140),campaignId:String(c.campaignId||c.id||'').slice(0,140),placement,type,src,destination,sound:type==='video'&&a.sound===true};
 }).filter(Boolean)
}
function lastKey(placement,slot){return 'taskflow_ads_last_v2_'+placement+'_'+String(slot||'default')}
function pick(placement,slot){
 const list=catalog.filter(a=>a.placement===placement);if(!list.length)return null;
 let last='';try{last=localStorage.getItem(lastKey(placement,slot))||''}catch(_){}
 const pool=list.length>1?list.filter(a=>a.id!==last):list;
 const idx=Math.floor(Math.random()*pool.length),ad=pool[idx]||pool[0];
 try{localStorage.setItem(lastKey(placement,slot),ad.id)}catch(_){}
 return ad
}
function bannerNode(ad){
 if(!ad)return null;
 const img=document.createElement('img');img.src=ad.src;img.alt='';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.draggable=false;
 if(!ad.destination)return img;
 const a=document.createElement('a');a.href=ad.destination;a.target='_blank';a.rel='sponsored noopener noreferrer';a.referrerPolicy='no-referrer';a.appendChild(img);return a
}
function runtimeReady(){
 return !!(window.TaskFlowAdsV50&&window.TaskFlowAdsV50.render&&window.TaskFlowEntryAdV56&&window.TaskFlowEntryAdV56.setCreative&&window.TaskFlowInteractionAdV57&&window.TaskFlowInteractionAdV57.setCreative)
}
function apply(){
 if(!config.enabled||!runtimeReady())return false;
 try{window.TaskFlowAdsV50.refresh&&window.TaskFlowAdsV50.refresh()}catch(_){}
 BANNER_SLOTS.forEach(slot=>{const ad=pick('banner',slot);try{window.TaskFlowAdsV50.render(slot,bannerNode(ad))}catch(e){console.warn('TaskFlow ADS banner:',e)}});
 const entry=pick('entry','entry');
 try{window.TaskFlowEntryAdV56.setCreative(entry?{type:entry.type==='video'?'video':'image',src:entry.src,destination:entry.destination,sound:entry.sound}:null)}catch(e){console.warn('TaskFlow ADS ingreso:',e)}
 const interaction=pick('interaction','interaction');
 try{window.TaskFlowInteractionAdV57.setCreative(interaction?{type:interaction.type,src:interaction.src,destination:interaction.destination,sound:interaction.sound}:null)}catch(e){console.warn('TaskFlow ADS interacción:',e)}
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
 if(!config.enabled){catalog=[];rawCampaigns=[];applyWhenReady();return false}
 if(refreshing)return refreshing;
 refreshing=fetchCatalog().catch(e=>{lastError=String(e&&e.message||'No se pudo consultar el catálogo').slice(0,120);console.warn('TaskFlow ADS no disponible:',lastError);return false}).finally(()=>{refreshing=null});
 return refreshing;
}
function schedule(){
 clearInterval(refreshTimer);refreshTimer=0;if(!config.enabled)return;
 const ms=Math.max(60000,Number(config.refreshMs)||60000);refreshTimer=setInterval(()=>{void refresh()},ms)
}
const API={
 version:'2.1.0',
 types:LEGACY_TYPES,
 configure(options){
   if(!options||typeof options!=='object')return false;
   if('enabled'in options)config.enabled=!!options.enabled;
   if('adminUrl'in options)config.adminUrl=validHTTPS(options.adminUrl)||null;
   if('refreshMs'in options)config.refreshMs=Math.max(60000,Number(options.refreshMs)||60000);
   schedule();if(config.enabled)void refresh();else{catalog=[];rawCampaigns=[];applyWhenReady()}return true
 },
 setContext(next){
   if(!next||typeof next!=='object')return false;
   context={country:countryCode(next.country||context.country||''),region:String(next.region??context.region??''),city:String(next.city??context.city??'')};
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
window.addEventListener('pageshow',()=>{if(Date.now()-lastRefresh>30000)void refresh();else applyWhenReady()},{passive:true});
window.addEventListener('online',()=>{void refresh()},{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastRefresh>30000)void refresh()});
function useLocationDetail(detail){
 const data=detail&&typeof detail==='object'?detail:{};
 const place=data.address&&typeof data.address==='object'?data.address:data;
 const region=place.region||place.department||place.state||'';
 const city=place.city||place.municipality||place.locality||'';
 if(region||city)API.setContext({country:place.country||context.country,region,city});
 else applyWhenReady();
}
document.addEventListener('taskflow:permissions-ready',e=>useLocationDetail(e.detail),false);
document.addEventListener('taskflow:location-updated',e=>useLocationDetail(e.detail),false);
// Aviso local entre los dos sistemas; no incluye datos de personas ni campañas.
window.addEventListener('storage',e=>{if(e.key==='taskflow_ads_public_changed_at')void refresh()},{passive:true});
try{if(typeof BroadcastChannel==='function'){
 const channel=new BroadcastChannel('taskflow-ads-catalog-v1');
 channel.addEventListener('message',e=>{if(e.data&&e.data.type==='catalog-changed')void refresh()});
}}catch(_){}
})();