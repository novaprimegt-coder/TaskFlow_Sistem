(function(){
'use strict';
if(window.__tfFirestoreSyncV109)return;window.__tfFirestoreSyncV109=true;

const PROJECT_ID='taskflow-b0ece';
const DB='(default)';
const API='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(PROJECT_ID)+'/databases/'+encodeURIComponent(DB)+'/documents';
const SOURCE_KEYS=['taskflow_db_v26','taskflow_503020_v1','taskflow_share_reward_claimed_v1','taskflow_share_count_v1'];
// Compatibilidad: estos valores se sincronizan en un documento aparte para no alterar
// el formato de los snapshots que aún utilizan otros dispositivos.
const PREF_KEYS=['taskflow_routines_v115','taskflow_routines_v115_meta','taskflow_forced_routines_v113','taskflow_routines_v113_meta','taskflow_v13041_mentalista_user_choice','taskflow_routines_v119_defaulted'];
const PREF_TOUCH='taskflow_cloud_pref_touch_v110';
const PREF_BOUND='taskflow_cloud_pref_bound_v110';
const PREF_META='taskflow_cloud_pref_meta_v110_';
const MAIN_KEY='taskflow_db_v26';
const MAIN_BACKUP='taskflow_db_v26_backup';
const MAIN_RECOVERY='taskflow_db_v26_recovery';
const FIN_KEY='taskflow_503020_v1';
const FIN_BACKUP='taskflow_503020_v1_backup';
const BOUND_KEY='taskflow_cloud_bound_uid_v1';
const TOUCH_KEY='taskflow_cloud_local_touch_v1';
const META_PREFIX='taskflow_cloud_sync_meta_v1_';
const CHUNK_SIZE=120000;
const SAVE_DELAY=950;
const REST_POLL_MS=12000;
const SESSION_POLL_MS=2000;
const LISTENER_SAFETY_POLL_MS=60000;

let currentUid=null;
let applying=false;
let dirty=false;
let saveTimer=0;
let syncing=null;
let initialized=false;
let remoteUnsubscribe=null;
let firestoreDb=null;
let checkSessionTimer=0;
let remotePollTimer=0;
let deferredSyncTimer=0;
let pendingSync=false;
let retryDelay=2000;
let hasRemoteListener=false;
let prefUnsubscribe=null;
let prefSaveTimer=0;
let prefDirty=false;
let lastRemotePollAt=0;

let nativeSetItem=Storage.prototype.setItem;
let nativeRemoveItem=Storage.prototype.removeItem;

function log(){try{console.info.apply(console,['TaskFlow Sync V109:'].concat([].slice.call(arguments)))}catch(_){}}
function warn(){try{console.warn.apply(console,['TaskFlow Sync V109:'].concat([].slice.call(arguments)))}catch(_){}}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function safeGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
function nativeSet(k,v){try{nativeSetItem.call(localStorage,k,String(v));return true}catch(_){return false}}
function nativeRemove(k){try{nativeRemoveItem.call(localStorage,k);return true}catch(_){return false}}
function metaKey(uid){return META_PREFIX+uid}
function readJson(k){try{return JSON.parse(safeGet(k)||'null')}catch(_){return null}}
function writeJsonNative(k,v){return nativeSet(k,JSON.stringify(v))}
function now(){return Date.now()}
function loadScript(src){return new Promise((resolve,reject)=>{if([...document.scripts].some(s=>s.src===src))return resolve();const el=document.createElement('script');el.src=src;el.async=false;el.onload=resolve;el.onerror=()=>reject(new Error('SDK_LOAD_FAILED'));document.head.appendChild(el)})}

function fnv1a(str){let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193)}return ('00000000'+(h>>>0).toString(16)).slice(-8)}
function capture(){const values={};let joined='';SOURCE_KEYS.forEach(k=>{const v=safeGet(k)||'';values[k]=v;joined+=k+'\u0000'+v+'\u0001'});return{values,hash:fnv1a(joined),updatedAt:localUpdatedAt()}}
function localUpdatedAt(){let t=Number(safeGet(TOUCH_KEY))||0;for(const k of [MAIN_KEY,FIN_KEY]){const x=readJson(k);if(x&&typeof x==='object'){t=Math.max(t,Number(x.savedAt)||0,Number(x.data&&x.data.savedAt)||0)}}return t||now()}
function readMeta(uid){const x=readJson(metaKey(uid));return x&&typeof x==='object'?x:null}
function writeMeta(uid,data){writeJsonNative(metaKey(uid),data)}
function setBound(uid){nativeSet(BOUND_KEY,uid||'')}
function getBound(){return safeGet(BOUND_KEY)||''}

function encDocId(k){return 'k_'+Array.from(new TextEncoder().encode(k)).map(b=>b.toString(16).padStart(2,'0')).join('')}
function chunks(str){const a=[];for(let i=0;i<str.length;i+=CHUNK_SIZE)a.push(str.slice(i,i+CHUNK_SIZE));return a.length?a:['']}
function fv(v){if(v===null)return{nullValue:null};if(typeof v==='boolean')return{booleanValue:v};if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};return{stringValue:String(v)}}
function fields(obj){const out={};Object.keys(obj).forEach(k=>out[k]=fv(obj[k]));return out}
function fromField(v){if(!v)return null;if('stringValue'in v)return v.stringValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return Number(v.doubleValue);if('booleanValue'in v)return !!v.booleanValue;if('nullValue'in v)return null;return null}
function decodeFields(doc){const o={};const f=doc&&doc.fields||{};Object.keys(f).forEach(k=>o[k]=fromField(f[k]));return o}

async function token(force){if(!window.TaskFlowFirebase||typeof window.TaskFlowFirebase.getIdToken!=='function')return null;return window.TaskFlowFirebase.getIdToken(!!force)}
async function request(url,opt,retry=true){const idt=await token(false);if(!idt)throw new Error('AUTH_REQUIRED');const options=Object.assign({cache:'no-store'},opt||{});options.headers=Object.assign({'Authorization':'Bearer '+idt,'Content-Type':'application/json'},options.headers||{});let r=await fetch(url,options);if(r.status===401&&retry){const fresh=await token(true);if(fresh){options.headers.Authorization='Bearer '+fresh;r=await fetch(url,options)}}if(r.status===404)return null;const body=await r.json().catch(()=>({}));if(!r.ok){const msg=body&&body.error&&body.error.message||('HTTP '+r.status);throw new Error(msg)}return body}
async function getDoc(path){return request(API+'/'+path,{method:'GET'})}
async function putDoc(path,obj){const name='projects/'+PROJECT_ID+'/databases/'+DB+'/documents/'+path;return request(API+'/'+path,{method:'PATCH',body:JSON.stringify({name,fields:fields(obj)})})}

function manifestPath(uid){return 'users/'+encodeURIComponent(uid)+'/sync/manifest'}
function slotBase(uid,slot){return 'users/'+encodeURIComponent(uid)+'/syncSlots/'+slot}
async function readManifest(uid){const d=await getDoc(manifestPath(uid));if(!d)return null;const x=decodeFields(d);if(!x.activeSlot||!x.revision)return null;return{activeSlot:String(x.activeSlot),revision:Number(x.revision)||0,hash:String(x.hash||''),clientUpdatedAt:Number(x.clientUpdatedAt)||0,schemaVersion:Number(x.schemaVersion)||1}}

async function uploadSnapshot(uid,snapshot,remote){const oldSlot=remote&&remote.activeSlot==='a'?'a':remote&&remote.activeSlot==='b'?'b':null;const slot=oldSlot==='a'?'b':'a';const rev=Math.max(Number(remote&&remote.revision)||0,Number(readMeta(uid)&&readMeta(uid).lastRemoteRevision)||0)+1;const base=slotBase(uid,slot);await Promise.all(SOURCE_KEYS.map(async key=>{
 const raw=snapshot.values[key]||'',parts=chunks(raw),kid=encDocId(key);
 for(let i=0;i<parts.length;i++)await putDoc(base+'/keys/'+kid+'/chunks/c'+String(i).padStart(5,'0'),{revision:rev,index:i,payload:parts[i]});
 await putDoc(base+'/keys/'+kid,{revision:rev,key:key,chunkCount:parts.length,length:raw.length,hash:fnv1a(raw)});
}));
await putDoc(manifestPath(uid),{activeSlot:slot,revision:rev,hash:snapshot.hash,clientUpdatedAt:snapshot.updatedAt||now(),schemaVersion:1,appVersion:'109'});
const m={lastRemoteRevision:rev,lastSyncedHash:snapshot.hash,lastSyncedAt:now(),lastRemoteClientUpdatedAt:snapshot.updatedAt||now()};writeMeta(uid,m);setBound(uid);dirty=capture().hash!==snapshot.hash;
if(dirty)queueRecheck('changes-during-upload',250);
log('subida completada',rev);return m}

async function downloadSnapshot(uid,manifest){const base=slotBase(uid,manifest.activeSlot);const values={};for(const key of SOURCE_KEYS){const kid=encDocId(key);const kd=await getDoc(base+'/keys/'+kid);if(!kd){values[key]='';continue}const km=decodeFields(kd),count=Math.max(0,Number(km.chunkCount)||0);const arr=[];
for(let i=0;i<count;i++){const cd=await getDoc(base+'/keys/'+kid+'/chunks/c'+String(i).padStart(5,'0'));if(!cd)throw new Error('SYNC_CHUNK_MISSING');arr.push(String(decodeFields(cd).payload||''))}
values[key]=arr.join('');
if(values[key].length!==Number(km.length)||fnv1a(values[key])!==String(km.hash||''))throw new Error('SYNC_CHUNK_CORRUPTED')}const hash=hashValues(values);
if(manifest.hash&&hash!==manifest.hash)throw new Error('SYNC_SNAPSHOT_HASH_MISMATCH');
return{values,hash,updatedAt:manifest.clientUpdatedAt||now()}}
function hashValues(values){let joined='';SOURCE_KEYS.forEach(k=>joined+=k+'\u0000'+(values[k]||'')+'\u0001');return fnv1a(joined)}
function prefHash(values){let joined='';PREF_KEYS.forEach(k=>joined+=k+'\u0000'+(values[k]||'')+'\u0001');return fnv1a(joined)}
function capturePrefs(){const values={};PREF_KEYS.forEach(k=>values[k]=safeGet(k)||'');return{values,hash:prefHash(values),updatedAt:Number(safeGet(PREF_TOUCH))||now(),hasValues:PREF_KEYS.some(k=>!!values[k])}}
function prefPath(uid){return 'users/'+encodeURIComponent(uid)+'/sync/routinePreferences'}
function prefMetaKey(uid){return PREF_META+uid}
function readPrefMeta(uid){return readJson(prefMetaKey(uid))}
function writePrefMeta(uid,hash,updatedAt){writeJsonNative(prefMetaKey(uid),{hash,updatedAt,lastSyncedAt:now()});nativeSet(PREF_BOUND,uid)}
async function readRemotePrefs(uid){const doc=await getDoc(prefPath(uid));if(!doc)return null;const x=decodeFields(doc);if(typeof x.payload!=='string')return null;const parsed=JSON.parse(x.payload);if(!parsed||typeof parsed!=='object')throw new Error('PREF_DATA_INVALID');const values={};PREF_KEYS.forEach(k=>values[k]=String(parsed[k]||''));if(x.hash!==prefHash(values))throw new Error('PREF_HASH_MISMATCH');return{values,hash:x.hash,updatedAt:Number(x.clientUpdatedAt)||0}}
function applyPrefs(uid,remote){
 const values=remote.values;prefDirty=false;
 for(const k of PREF_KEYS){if(values[k])nativeSet(k,values[k]);else nativeRemove(k)}
 nativeSet(PREF_TOUCH,String(remote.updatedAt||now()));
 writePrefMeta(uid,remote.hash,remote.updatedAt);
 // Cambios de rutinas sin recargar toda la aplicación ni borrar campos en edición.
 for(const name of ['TaskFlowV117','TaskFlowV119']){
   try{const api=window[name];if(api&&typeof api.refresh==='function')api.refresh()}catch(_){}
 }
}
async function uploadPrefs(uid,local){
 await putDoc(prefPath(uid),{payload:JSON.stringify(local.values),hash:local.hash,clientUpdatedAt:local.updatedAt,schemaVersion:1});
 writePrefMeta(uid,local.hash,local.updatedAt);
 prefDirty=capturePrefs().hash!==local.hash;
 if(prefDirty)queueRecheck('new-preference-changes',200);
}
async function reconcilePrefs(uid){
 if(!uid)return;
 const local=capturePrefs(),remote=await readRemotePrefs(uid),bound=safeGet(PREF_BOUND)||'',meta=readPrefMeta(uid);
 if(!remote){
   if(bound&&bound!==uid){const empty={};PREF_KEYS.forEach(k=>empty[k]='');applyPrefs(uid,{values:empty,hash:prefHash(empty),updatedAt:now()});return}
   if(local.hasValues)await uploadPrefs(uid,local);
   return;
 }
 if(local.hash===remote.hash){writePrefMeta(uid,remote.hash,remote.updatedAt);prefDirty=false;return}
 if(bound!==uid||!meta||local.hash===meta.hash){applyPrefs(uid,remote);return}
 if(remote.hash===meta.hash){await uploadPrefs(uid,local);return}
 // Dos ediciones independientes: se conserva una copia antes de aplicar la más nueva.
 if(remote.updatedAt>local.updatedAt){
   try{nativeSet('taskflow_cloud_pref_conflict_v110_'+uid+'_'+now(),JSON.stringify(local.values))}catch(_){}
   applyPrefs(uid,remote);return;
 }
 await uploadPrefs(uid,local);
}
function queuePreference(){
 if(!currentUid)return;
 prefDirty=true;
 nativeSet(PREF_TOUCH,String(now()));
 clearTimeout(prefSaveTimer);
 prefSaveTimer=setTimeout(()=>{prefSaveTimer=0;syncNow('preferences-change').catch(e=>warn('preferences',e))},700);
}

function applySnapshot(uid,snapshot,manifest){applying=true;try{const v=snapshot.values||{};const main=v[MAIN_KEY]||'';const fin=v[FIN_KEY]||'';if(main){nativeSet(MAIN_KEY,main);nativeSet(MAIN_BACKUP,main);nativeSet(MAIN_RECOVERY,main)}else{nativeRemove(MAIN_KEY);nativeRemove(MAIN_BACKUP);nativeRemove(MAIN_RECOVERY)}if(fin){nativeSet(FIN_KEY,fin);nativeSet(FIN_BACKUP,fin)}else{nativeRemove(FIN_KEY);nativeRemove(FIN_BACKUP)}for(const k of ['taskflow_share_reward_claimed_v1','taskflow_share_count_v1']){if(v[k])nativeSet(k,v[k]);else nativeRemove(k)}nativeSet(TOUCH_KEY,String(snapshot.updatedAt||now()));setBound(uid);writeMeta(uid,{lastRemoteRevision:Number(manifest&&manifest.revision)||0,lastSyncedHash:snapshot.hash||hashValues(v),lastSyncedAt:now(),lastRemoteClientUpdatedAt:Number(manifest&&manifest.clientUpdatedAt)||snapshot.updatedAt||now()})}finally{applying=false;dirty=false}}

function backupConflict(uid,snapshot){
 try{
   const stamp=now(),key='taskflow_cloud_conflict_backup_v1_'+uid+'_'+stamp;
   // Guardar el estado anterior antes de resolver cambios simultáneos en favor del remoto.
   nativeSet(key,JSON.stringify({createdAt:stamp,hash:snapshot.hash,values:snapshot.values}));
 }catch(e){warn('No fue posible almacenar copia del conflicto',e)}
}
function clearLiveForNewAccount(uid){applying=true;try{[MAIN_KEY,MAIN_BACKUP,MAIN_RECOVERY,FIN_KEY,FIN_BACKUP,'taskflow_share_reward_claimed_v1','taskflow_share_count_v1'].forEach(nativeRemove);nativeSet(TOUCH_KEY,String(now()));setBound(uid);writeMeta(uid,{lastRemoteRevision:0,lastSyncedHash:'',lastSyncedAt:0,lastRemoteClientUpdatedAt:0})}finally{applying=false}}

async function reconcile(uid){if(!uid)return;const remote=await readManifest(uid);const local=capture();const bound=getBound();const meta=readMeta(uid);
if(!remote){if(bound&&bound!==uid){log('cuenta nueva en dispositivo previamente vinculado; estado local limpio');clearLiveForNewAccount(uid);location.reload();return}await uploadSnapshot(uid,local,null);return}
if(bound!==uid){const snap=await downloadSnapshot(uid,remote);applySnapshot(uid,snap,remote);log('restaurando cuenta en este dispositivo');location.reload();return}
if(remote.hash===local.hash){writeMeta(uid,{lastRemoteRevision:remote.revision,lastSyncedHash:local.hash,lastSyncedAt:now(),lastRemoteClientUpdatedAt:remote.clientUpdatedAt||0});setBound(uid);dirty=false;return}
if(!meta){if(remote.clientUpdatedAt>local.updatedAt){const snap=await downloadSnapshot(uid,remote);applySnapshot(uid,snap,remote);location.reload();return}await uploadSnapshot(uid,local,remote);return}
const localChanged=local.hash!==String(meta.lastSyncedHash||'');const remoteChanged=Number(remote.revision)>Number(meta.lastRemoteRevision||0)||remote.hash!==String(meta.lastSyncedHash||'');
if(!localChanged&&!remoteChanged){writeMeta(uid,Object.assign({},meta,{lastRemoteRevision:remote.revision,lastSyncedHash:remote.hash||local.hash,lastRemoteClientUpdatedAt:remote.clientUpdatedAt||0}));dirty=false;return}
if(!localChanged&&remoteChanged){const snap=await downloadSnapshot(uid,remote);applySnapshot(uid,snap,remote);location.reload();return}
if(localChanged&&!remoteChanged){await uploadSnapshot(uid,local,remote);return}
if((remote.clientUpdatedAt||0)>(local.updatedAt||0)){backupConflict(uid,local);const snap=await downloadSnapshot(uid,remote);applySnapshot(uid,snap,remote);location.reload();return}
await uploadSnapshot(uid,local,remote)
}

function queueRecheck(reason,delay){
 if(!currentUid)return;
 clearTimeout(deferredSyncTimer);
 deferredSyncTimer=setTimeout(()=>{deferredSyncTimer=0;syncNow(reason).catch(e=>warn('deferred',e))},delay);
}
function queueUpload(){
 if(applying||!currentUid)return;
 dirty=true;
 nativeSet(TOUCH_KEY,String(now()));
 clearTimeout(saveTimer);
 saveTimer=setTimeout(()=>{saveTimer=0;syncNow('local-change').catch(e=>warn('local-change',e))},SAVE_DELAY);
}
function installStorageHooks(){
 if(Storage.prototype.__tfCloudV109)return;
 Storage.prototype.__tfCloudV109=true;
 Storage.prototype.setItem=function(k,v){
   const changed=this===localStorage&&SOURCE_KEYS.includes(String(k))&&!applying&&safeGet(String(k))!==String(v);
   const prefChanged=this===localStorage&&PREF_KEYS.includes(String(k))&&!applying&&safeGet(String(k))!==String(v);
   const result=nativeSetItem.call(this,k,v);
   if(changed)queueUpload();
   if(prefChanged)queuePreference();
   return result;
 };
 Storage.prototype.removeItem=function(k){
   const changed=this===localStorage&&SOURCE_KEYS.includes(String(k))&&!applying&&safeGet(String(k))!==null;
   const prefChanged=this===localStorage&&PREF_KEYS.includes(String(k))&&!applying&&safeGet(String(k))!==null;
   const result=nativeRemoveItem.call(this,k);
   if(changed)queueUpload();
   if(prefChanged)queuePreference();
   return result;
 };
}
async function syncNow(reason){
 if(!currentUid||navigator.onLine===false)return false;
 if(syncing){pendingSync=true;return syncing}
 const uid=currentUid;
 syncing=(async()=>{
   try{
     await reconcile(uid);
     if(uid===currentUid)await reconcilePrefs(uid);
     retryDelay=2000;
     return true;
   }catch(e){
     dirty=true;
     warn(reason||'sync',e);
     queueRecheck('retry',retryDelay);
     retryDelay=Math.min(45000,Math.round(retryDelay*1.6));
     return false;
   }finally{
     syncing=null;
     if(pendingSync&&uid===currentUid){
       pendingSync=false;
       queueRecheck('pending',180);
     }
   }
 })();
 return syncing;
}
function listenForRemote(uid){
 if(remoteUnsubscribe){try{remoteUnsubscribe()}catch(_){}remoteUnsubscribe=null}
 if(prefUnsubscribe){try{prefUnsubscribe()}catch(_){}prefUnsubscribe=null}
 hasRemoteListener=false;
 if(!firestoreDb||!uid)return;
 try{
   remoteUnsubscribe=firestoreDb.doc('users/'+uid+'/sync/manifest').onSnapshot(snap=>{
     if(currentUid!==uid||!snap.exists||snap.metadata&&snap.metadata.hasPendingWrites)return;
     const remote=snap.data()||{},meta=readMeta(uid);
     const revision=Number(remote.revision)||0;
     if(meta&&revision===Number(meta.lastRemoteRevision)&&String(remote.hash||'')===String(meta.lastSyncedHash||'')&&!dirty)return;
     queueRecheck('remote-change',160);
   },e=>{hasRemoteListener=false;warn('listener remoto',e)});
   prefUnsubscribe=firestoreDb.doc(prefPath(uid)).onSnapshot(snap=>{
     if(currentUid!==uid||!snap.exists||snap.metadata&&snap.metadata.hasPendingWrites)return;
     const remote=snap.data()||{},meta=readPrefMeta(uid);
     if(meta&&String(meta.hash||'')===String(remote.hash||'')&&!prefDirty)return;
     queueRecheck('remote-preferences',180);
   },e=>warn('listener preferencias',e));
   hasRemoteListener=true;
 }catch(e){hasRemoteListener=false;warn('listener setup',e)}
}
async function changeAccount(uid){
 if(uid===currentUid)return;
 if(remoteUnsubscribe){try{remoteUnsubscribe()}catch(_){}remoteUnsubscribe=null}
 if(prefUnsubscribe){try{prefUnsubscribe()}catch(_){}prefUnsubscribe=null}
 hasRemoteListener=false;
 currentUid=uid;
 clearTimeout(saveTimer);saveTimer=0;
 clearTimeout(prefSaveTimer);prefSaveTimer=0;
 clearTimeout(deferredSyncTimer);deferredSyncTimer=0;
 pendingSync=false;
 dirty=false;
 if(!uid){log('sin sesión; sincronización pausada');return}
 // La carga de datos y el listener no deben bloquear ni reconstruir la interfaz durante el inicio.
 await syncNow('auth-state');
 if(currentUid===uid)listenForRemote(uid);
}
function scanCurrentAccount(){
 const user=window.TaskFlowFirebase&&window.TaskFlowFirebase.getUser&&window.TaskFlowFirebase.getUser();
 const uid=user&&user.uid||null;
 if(uid!==currentUid)changeAccount(uid).catch(e=>warn('session',e));
}
function pollRemote(){
 if(!currentUid||navigator.onLine===false||document.hidden)return;
 const t=now();
 if(hasRemoteListener&&t-lastRemotePollAt<LISTENER_SAFETY_POLL_MS)return;
 lastRemotePollAt=t;
 syncNow('background-poll').catch(e=>warn('poll',e));
}
async function init(){
 if(initialized)return true;
 initialized=true;
 installStorageHooks();
 if(!window.TaskFlowFirebase||typeof window.TaskFlowFirebase.initialize!=='function'){
   warn('TaskFlowFirebase no disponible');return false;
 }
 await window.TaskFlowFirebase.initialize();
 if(window.TaskFlowFirebase.getMode&&window.TaskFlowFirebase.getMode()==='sdk'&&window.firebase&&window.firebase.auth){
   try{
     await loadScript('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore-compat.js');
     if(window.firebase&&window.firebase.firestore)firestoreDb=window.firebase.firestore();
   }catch(e){warn('Firestore listener no disponible; se mantiene sincronización por eventos.',e)}
   window.firebase.auth().onAuthStateChanged(user=>changeAccount(user&&user.uid||null).catch(e=>warn('auth-state',e)));
 }else{
   // Cuando Firebase Auth funciona por REST también debe sincronizar todos los dispositivos.
   log('Autenticación REST activa: sincronización por comprobación periódica');
 }
 scanCurrentAccount();
 checkSessionTimer=setInterval(scanCurrentAccount,SESSION_POLL_MS);
 remotePollTimer=setInterval(pollRemote,REST_POLL_MS);
 window.addEventListener('online',()=>{scanCurrentAccount();queueRecheck('online',100)});
 window.addEventListener('focus',()=>{scanCurrentAccount();if(currentUid)queueRecheck('focus',150)});
 window.addEventListener('storage',event=>{
   if(event.key===BOUND_KEY||event.key==='taskflow_firebase_session_v1')scanCurrentAccount();
   else if(event.key&&(SOURCE_KEYS.includes(event.key)||PREF_KEYS.includes(event.key))&&currentUid)queueRecheck('other-tab-change',260);
 });
 document.addEventListener('visibilitychange',()=>{
   if(!currentUid)return;
   if(document.hidden){if(dirty&&navigator.onLine!==false)queueRecheck('background',100)}
   else queueRecheck('foreground',180);
 });
 window.addEventListener('pagehide',()=>{if(currentUid&&dirty&&navigator.onLine!==false)syncNow('pagehide')});
 return true;
}

window.TaskFlowCloudSync={initialize:init,syncNow:()=>syncNow('manual'),getUid:()=>currentUid,isDirty:()=>dirty,getBinding:()=>getBound()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init().catch(e=>warn('init',e)),{once:true});else init().catch(e=>warn('init',e));
})();
