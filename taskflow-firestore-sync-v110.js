(function(){
'use strict';
if(window.__tfFirestoreSyncV109)return;window.__tfFirestoreSyncV109=true;

const PROJECT_ID='taskflow-b0ece';
const DB='(default)';
const API='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(PROJECT_ID)+'/databases/'+encodeURIComponent(DB)+'/documents';
const SOURCE_KEYS=['taskflow_db_v26','taskflow_503020_v1','taskflow_share_reward_claimed_v1','taskflow_share_count_v1'];
// Compatibilidad: estos valores se sincronizan en un documento aparte para no alterar
// el formato de los snapshots que aún utilizan otros dispositivos.
/* Las preferencias pertenecen al sincronizador T49. Aquí solo se sincronizan datos principales. */
const PREF_KEYS=[];
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
const SAVE_DELAY=350;
const REST_POLL_MS=4000;
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
let lastPhotoPollAt=0;
let accountEpoch=0;
let baseline=null;
let profileUnsubscribe=null;

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
function loadFirestore(){
 if(window.firebase?.firestore)return Promise.resolve(window.firebase.firestore());
 return new Promise((resolve,reject)=>{
  const src='https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore-compat.js';
  const existing=[...document.scripts].find(script=>script.src===src);
  const script=existing||document.createElement('script');
  function finish(){
   clearTimeout(timer);
   script.removeEventListener('load',finish);
   script.removeEventListener('error',finish);
   try{resolve(window.firebase.firestore())}
   catch(error){if(!existing)script.remove();reject(error)}
  }
  const timer=setTimeout(finish,8000);
  script.addEventListener('load',finish,{once:true});
  script.addEventListener('error',finish,{once:true});
  if(!existing){script.src=src;document.head.appendChild(script)}
 });
}

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
function assertAccount(uid,epoch=accountEpoch){
 if(!uid||uid!==currentUid||epoch!==accountEpoch||window.TaskFlowFirebase?.getUser?.()?.uid!==uid)throw new Error('ACCOUNT_CHANGED');
}
async function request(url,opt,uid=currentUid){
 const epoch=accountEpoch;
 assertAccount(uid,epoch);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),11000);
 try{
  const idt=await token(false);
  assertAccount(uid,epoch);
  if(!idt)throw new Error('AUTH_REQUIRED');
  const options={...opt,cache:'no-store',signal:controller.signal,headers:{Authorization:'Bearer '+idt,'Content-Type':'application/json'}};
  let r=await fetch(url,options);
  if(r.status===401){
   const fresh=await token(true);
   assertAccount(uid,epoch);
   if(fresh){options.headers.Authorization='Bearer '+fresh;r=await fetch(url,options)}
  }
  assertAccount(uid,epoch);
  if(r.status===404&&opt.method==='GET')return null;
  const body=await r.json().catch(()=>({}));
  assertAccount(uid,epoch);
  if(!r.ok)throw Object.assign(new Error(body.error?.message||('HTTP '+r.status)),{code:body.error?.status,status:r.status});
  return body;
 }finally{clearTimeout(timeout)}
}
async function getDoc(path,uid){return request(API+'/'+path,{method:'GET'},uid)}
async function putDoc(path,obj){const name='projects/'+PROJECT_ID+'/databases/'+DB+'/documents/'+path;return request(API+'/'+path,{method:'PATCH',body:JSON.stringify({name,fields:fields(obj)})})}

function manifestPath(uid){return 'users/'+encodeURIComponent(uid)+'/sync/manifest'}
function slotBase(uid,slot){return 'users/'+encodeURIComponent(uid)+'/syncSlots/'+slot}
async function readManifest(uid){
 const doc=await getDoc(manifestPath(uid),uid);
 if(!doc)return null;
 const x=decodeFields(doc);
 if(!['a','b'].includes(x.activeSlot)||!Number(x.revision)||!doc.updateTime)throw new Error('SYNC_MANIFEST_INVALID');
 return {activeSlot:x.activeSlot,revision:Number(x.revision),hash:String(x.hash||''),
  clientUpdatedAt:Number(x.clientUpdatedAt)||0,updateTime:doc.updateTime};
}
function recordBaseline(uid,snapshot,manifest){
 baseline={uid,snapshot};
 writeMeta(uid,{lastRemoteRevision:manifest.revision,lastSyncedHash:snapshot.hash,lastSyncedAt:now(),
  lastRemoteClientUpdatedAt:manifest.clientUpdatedAt||snapshot.updatedAt});
 setBound(uid);
}
async function uploadSnapshot(uid,snapshot,remote,localHash=snapshot.hash){
 const slot=remote?.activeSlot==='a'?'b':'a';
 const revision=Math.max(remote?.revision||0,Number(readMeta(uid)?.lastRemoteRevision)||0)+1;
 const base=slotBase(uid,slot),writes=[];
 const put=(path,value)=>({update:{name:'projects/'+PROJECT_ID+'/databases/'+DB+'/documents/'+path,fields:fields(value)}});
 for(const key of SOURCE_KEYS){
  const raw=snapshot.values[key]||'',parts=chunks(raw),path=base+'/keys/'+encDocId(key);
  parts.forEach((payload,index)=>{
   writes.push(put(path+'/chunks/c'+String(index).padStart(5,'0'),{revision,index,payload}));
  });
  writes.push(put(path,{revision,key,chunkCount:parts.length,length:raw.length,hash:fnv1a(raw)}));
 }
 const manifest={activeSlot:slot,revision,hash:snapshot.hash,clientUpdatedAt:snapshot.updatedAt||now(),schemaVersion:1,appVersion:'162'};
 writes.push({...put(manifestPath(uid),manifest),currentDocument:remote?{updateTime:remote.updateTime}:{exists:false}});
 // Fragmentos y puntero se publican juntos. Un segundo dispositivo debe releer una revisión nueva.
 await request(API+':commit',{method:'POST',body:JSON.stringify({writes})},uid);
 window.TaskFlowCloudViewV162?.flush?.();
 const latest=capture();
 if(latest.hash===localHash&&localHash!==snapshot.hash)acceptSnapshot(uid,snapshot,manifest,latest);
 else {
  recordBaseline(uid,snapshot,manifest);
  dirty=latest.hash!==snapshot.hash;
  if(dirty)queueRecheck('changes-during-upload',200);
 }
 log('subida completada',revision);
}

async function downloadSnapshot(uid,manifest){
 const base=slotBase(uid,manifest.activeSlot);
 const values=Object.fromEntries(await Promise.all(SOURCE_KEYS.map(async key=>{
  const path=base+'/keys/'+encDocId(key);
  const doc=await getDoc(path,uid);
  if(!doc)return [key,''];
  const km=decodeFields(doc);
  const count=Number(km.chunkCount);
  if(km.revision!==manifest.revision||!Number.isInteger(count)||count<1||count>500)throw new Error('SYNC_KEY_REVISION');
  const parts=[];
  for(let i=0;i<count;i+=6){
   parts.push(...await Promise.all(Array.from({length:Math.min(6,count-i)},async(_,offset)=>{
    const index=i+offset;
    const chunk=decodeFields(await getDoc(path+'/chunks/c'+String(index).padStart(5,'0'),uid));
    if(chunk.revision!==manifest.revision||chunk.index!==index||typeof chunk.payload!=='string')throw new Error('SYNC_CHUNK_REVISION');
    return chunk.payload;
   })));
  }
  const raw=parts.join('');
  if(raw.length!==Number(km.length)||fnv1a(raw)!==String(km.hash||''))throw new Error('SYNC_CHUNK_CORRUPTED');
  return [key,raw];
 })));
 const hash=hashValues(values);
 if(manifest.hash&&hash!==manifest.hash)throw new Error('SYNC_SNAPSHOT_HASH_MISMATCH');
 return {values,hash,updatedAt:manifest.clientUpdatedAt||now()};
}
function hashValues(values){let joined='';SOURCE_KEYS.forEach(k=>joined+=k+'\u0000'+(values[k]||'')+'\u0001');return fnv1a(joined)}
function prefHash(values){let joined='';PREF_KEYS.forEach(k=>joined+=k+'\u0000'+(values[k]||'')+'\u0001');return fnv1a(joined)}
function capturePrefs(){const values={};PREF_KEYS.forEach(k=>values[k]=safeGet(k)||'');return{values,hash:prefHash(values),updatedAt:Number(safeGet(PREF_TOUCH))||now(),hasValues:PREF_KEYS.some(k=>!!values[k])}}
function prefPath(uid){return 'users/'+encodeURIComponent(uid)+'/sync/routinePreferences'}
function prefMetaKey(uid){return PREF_META+uid}
function readPrefMeta(uid){return readJson(prefMetaKey(uid))}
function writePrefMeta(uid,hash,updatedAt){writeJsonNative(prefMetaKey(uid),{hash,updatedAt,lastSyncedAt:now()});nativeSet(PREF_BOUND,uid)}
async function readRemotePrefs(uid){const doc=await getDoc(prefPath(uid));if(!doc)return null;const x=decodeFields(doc);if(typeof x.payload!=='string')return null;const parsed=JSON.parse(x.payload);if(!parsed||typeof parsed!=='object')throw new Error('PREF_DATA_INVALID');const values={};PREF_KEYS.forEach(k=>values[k]=String(parsed[k]||''));if(x.hash!==prefHash(values))throw new Error('PREF_HASH_MISMATCH');return{values,hash:x.hash,updatedAt:Number(x.clientUpdatedAt)||0}}
function applyPrefs(uid,remote){
 const values={...remote.values},policy=window.TaskFlowRoutineChoicesV131;
 const bound=safeGet(PREF_BOUND)||'',accountChange=!!bound&&bound!==uid;
 if(policy&&values['taskflow_routines_v115']){
  const incoming=policy.parse(values['taskflow_routines_v115']);
  const merged=policy.merge(policy.parse(safeGet('taskflow_routines_v115')),incoming,{accountChange});
  values['taskflow_routines_v115']=JSON.stringify(merged);
  values['taskflow_v13041_mentalista_user_choice']=merged.mentalista?'on':'off';
 }
 prefDirty=false;
 const apply=()=>{for(const k of PREF_KEYS){if(values[k])nativeSet(k,values[k]);else nativeRemove(k)}};
 if(policy)policy.trustedWrite(apply);else apply();
 const changed=capturePrefs().hash!==remote.hash;
 nativeSet(PREF_TOUCH,String(changed?now():remote.updatedAt||now()));
 writePrefMeta(uid,remote.hash,remote.updatedAt);
 if(changed){prefDirty=true;queueRecheck('preserve-authorized-routines',420)}
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

function applySnapshot(snapshot,local){
 const assign=(key,value)=>value?nativeSet(key,value):nativeRemove(key);
 applying=true;
 try{
  const changed=[];
  for(const key of SOURCE_KEYS){
   if(snapshot.values[key]===local.values[key])continue;
   if(!assign(key,snapshot.values[key])){
    for(const applied of changed.reverse())assign(applied,local.values[applied]);
    throw new Error('SYNC_LOCAL_STORAGE_UNAVAILABLE');
   }
   changed.push(key);
  }
  for(const [source,backups] of [[MAIN_KEY,[MAIN_BACKUP,MAIN_RECOVERY]],[FIN_KEY,[FIN_BACKUP]]]){
   for(const key of backups){if(!assign(key,snapshot.values[source]))nativeRemove(key)}
  }
  nativeSet(TOUCH_KEY,String(snapshot.updatedAt||now()));
  dirty=false;
 }finally{applying=false}
}

// Refrescar la sesión existente sin repetir el arranque ni los anuncios.
function notifySnapshotApplied(uid,keys){
 try{
  for(const key of keys){
   const latest=safeGet(key);
   window.dispatchEvent(new StorageEvent('storage',{
    key,newValue:latest,storageArea:localStorage,url:location.href
   }));
  }
 }catch(e){warn('Notificación interna de almacenamiento no disponible',e)}
 try{document.dispatchEvent(new CustomEvent('taskflow:cloud-snapshot-applied',{detail:{uid,keys}}))}catch(_){}
 for(const name of ['TaskFlowV117','TaskFlowV119']){
  try{const api=window[name];if(api&&typeof api.refresh==='function')api.refresh()}catch(_){}
 }
}
function backupConflict(uid,snapshot){
 try{
   const stamp=now(),key='taskflow_cloud_conflict_backup_v1_'+uid+'_'+stamp;
   // Guardar el estado anterior antes de resolver cambios simultáneos en favor del remoto.
   nativeSet(key,JSON.stringify({createdAt:stamp,hash:snapshot.hash,values:snapshot.values}));
 }catch(e){warn('No fue posible almacenar copia del conflicto',e)}
}
function clearLiveForNewAccount(uid){applying=true;try{[MAIN_KEY,MAIN_BACKUP,MAIN_RECOVERY,FIN_KEY,FIN_BACKUP,'taskflow_share_reward_claimed_v1','taskflow_share_count_v1'].forEach(nativeRemove);nativeSet(TOUCH_KEY,String(now()));setBound(uid);writeMeta(uid,{lastRemoteRevision:0,lastSyncedHash:'',lastSyncedAt:0,lastRemoteClientUpdatedAt:0})}finally{applying=false}}

function acceptSnapshot(uid,snapshot,manifest,local){
 assertAccount(uid);
 const keys=SOURCE_KEYS.filter(key=>local.values[key]!==snapshot.values[key]);
 applySnapshot(snapshot,local);
 recordBaseline(uid,snapshot,manifest);
 if(keys.length)notifySnapshotApplied(uid,keys);
}
async function reconcile(uid){
 assertAccount(uid);
 const remote=await readManifest(uid);
 const bound=getBound();
 const switched=bound&&bound!==uid;
 if(!switched)window.TaskFlowCloudViewV162?.flush?.();
 const local=capture(),meta=readMeta(uid);
 if(!remote){
  if(switched){
   clearLiveForNewAccount(uid);
   notifySnapshotApplied(uid,SOURCE_KEYS);
   queueRecheck('new-account',150);
   return;
  }
  await uploadSnapshot(uid,local,null);
  return;
 }
 if(remote.hash===local.hash&&!switched){
  recordBaseline(uid,local,remote);
  dirty=false;
  return;
 }
 const preferRemote=remote.clientUpdatedAt>=local.updatedAt;
 const sameAccount=bound===uid;
 const localChanged=local.hash!==meta?.lastSyncedHash;
 if(sameAccount&&((meta&&localChanged&&remote.hash===meta.lastSyncedHash)||(!meta&&!preferRemote))){
  await uploadSnapshot(uid,local,remote);
  return;
 }
 const incoming=await downloadSnapshot(uid,remote);
 if(!switched)window.TaskFlowCloudViewV162?.flush?.();
 const latest=capture();
 if(!switched&&latest.hash!==local.hash){queueRecheck('local-during-download',130);return}
 if(!sameAccount||!localChanged||!meta){acceptSnapshot(uid,incoming,remote,latest);return}
 const base=baseline?.uid===uid&&baseline.snapshot.hash===meta.lastSyncedHash?baseline.snapshot.values:null;
 const values={};
 for(const key of SOURCE_KEYS){
  if(base&&local.values[key]===base[key])values[key]=incoming.values[key];
  else if(base&&incoming.values[key]===base[key])values[key]=local.values[key];
  else values[key]=(preferRemote?incoming:local).values[key];
 }
 if(SOURCE_KEYS.some(key=>values[key]!==local.values[key]))backupConflict(uid,local);
 const hash=hashValues(values);
 if(hash===incoming.hash)acceptSnapshot(uid,incoming,remote,latest);
 else await uploadSnapshot(uid,{values,hash,updatedAt:Math.max(local.updatedAt,incoming.updatedAt)},remote,latest.hash);
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
 const epoch=accountEpoch;
 syncing=(async()=>{
   try{
     await reconcile(uid);
     if(uid===currentUid&&PREF_KEYS.length)await reconcilePrefs(uid);
     retryDelay=2000;
     return true;
   }catch(e){
     if(uid!==currentUid||epoch!==accountEpoch)return false;
     dirty=true;
     warn(reason||'sync',e);
     const conflict=['ABORTED','FAILED_PRECONDITION','ALREADY_EXISTS'].includes(e.code)||e.status===409||e.status===412;
     queueRecheck('retry',conflict?180:retryDelay);
     retryDelay=Math.min(45000,Math.round(retryDelay*1.6));
     return false;
   }finally{
     syncing=null;
     if(pendingSync&&currentUid){
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
 if(profileUnsubscribe){try{profileUnsubscribe()}catch(_){}profileUnsubscribe=null}
 hasRemoteListener=false;
 if(!firestoreDb||!uid)return;
 const epoch=accountEpoch;
 const valid=()=>uid===currentUid&&epoch===accountEpoch;
 try{
   remoteUnsubscribe=firestoreDb.doc('users/'+uid+'/sync/manifest').onSnapshot({includeMetadataChanges:true},snap=>{
     if(!valid()||snap.metadata?.hasPendingWrites)return;
     hasRemoteListener=!snap.metadata?.fromCache;
     if(!hasRemoteListener||!snap.exists)return;
     const remote=snap.data()||{},meta=readMeta(uid);
     const revision=Number(remote.revision)||0;
     if(meta&&revision===Number(meta.lastRemoteRevision)&&String(remote.hash||'')===String(meta.lastSyncedHash||'')&&!dirty)return;
     queueRecheck('remote-change',160);
   },e=>{if(valid()){hasRemoteListener=false;remoteUnsubscribe=null;warn('listener remoto',e)}});
   profileUnsubscribe=firestoreDb.doc('users/'+uid+'/profile/avatar').onSnapshot(snap=>{
     if(!valid()||snap.metadata?.fromCache||snap.metadata?.hasPendingWrites)return;
     document.dispatchEvent(new CustomEvent('taskflow:cloud-avatar',{detail:{uid,photo:snap.exists?String(snap.data()?.photoData||''):''}}));
   },e=>{if(valid()){profileUnsubscribe=null;warn('listener de foto',e)}});
   if(PREF_KEYS.length)prefUnsubscribe=firestoreDb.doc(prefPath(uid)).onSnapshot(snap=>{
     if(currentUid!==uid||!snap.exists||snap.metadata&&snap.metadata.hasPendingWrites)return;
     const remote=snap.data()||{},meta=readPrefMeta(uid);
     if(meta&&String(meta.hash||'')===String(remote.hash||'')&&!prefDirty)return;
     queueRecheck('remote-preferences',180);
   },e=>warn('listener preferencias',e));
 }catch(e){hasRemoteListener=false;warn('listener setup',e)}
}
async function changeAccount(uid){
 if(uid===currentUid)return;
 if(remoteUnsubscribe){try{remoteUnsubscribe()}catch(_){}remoteUnsubscribe=null}
 if(prefUnsubscribe){try{prefUnsubscribe()}catch(_){}prefUnsubscribe=null}
 if(profileUnsubscribe){try{profileUnsubscribe()}catch(_){}profileUnsubscribe=null}
 hasRemoteListener=false;
 currentUid=uid;
 accountEpoch++;
 baseline=null;
 lastRemotePollAt=0;
 lastPhotoPollAt=0;
 clearTimeout(saveTimer);saveTimer=0;
 clearTimeout(prefSaveTimer);prefSaveTimer=0;
 clearTimeout(deferredSyncTimer);deferredSyncTimer=0;
 pendingSync=false;
 dirty=false;
 if(!uid){log('sin sesión; sincronización pausada');return}
 // La carga de datos y el listener no deben bloquear ni reconstruir la interfaz durante el inicio.
 listenForRemote(uid);
 await syncNow('auth-state');
}
function scanCurrentAccount(){
 const user=window.TaskFlowFirebase&&window.TaskFlowFirebase.getUser&&window.TaskFlowFirebase.getUser();
 const uid=user&&user.uid||null;
 if(uid!==currentUid)changeAccount(uid).catch(e=>warn('session',e));
}
function pollRemote(){
 if(!currentUid||navigator.onLine===false||document.hidden)return;
 const t=now();
 if(firestoreDb&&!remoteUnsubscribe)listenForRemote(currentUid);
 if(!profileUnsubscribe&&t-lastPhotoPollAt>=12000){
  lastPhotoPollAt=t;
  document.dispatchEvent(new CustomEvent('taskflow:cloud-avatar-refresh',{detail:{uid:currentUid}}));
 }
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
   window.firebase.auth().onAuthStateChanged(user=>changeAccount(user&&user.uid||null).catch(e=>warn('auth-state',e)));
   loadFirestore().then(db=>{firestoreDb=db;if(currentUid)listenForRemote(currentUid)})
    .catch(e=>warn('Firestore listener no disponible; se mantiene sincronización por eventos.',e));
 }else{
   // Cuando Firebase Auth funciona por REST también debe sincronizar todos los dispositivos.
   log('Autenticación REST activa: sincronización por comprobación periódica');
 }
 scanCurrentAccount();
 document.addEventListener('taskflow:firebase-auth-changed',scanCurrentAccount);
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
