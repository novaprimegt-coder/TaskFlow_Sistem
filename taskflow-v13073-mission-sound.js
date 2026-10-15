(function(){
'use strict';
if(window.__tfV13073MissionSound)return;
window.__tfV13073MissionSound=true;

/* V130.7.3 · Sonido universal al completar.
   Aplica el sonido existente a TODAS las misiones, hábitos y tareas.
   No modifica progreso, datos, rutinas, sincronización, música ni diseño. */

const SRC='./audio/notificaciones/SONIDO%20DE%20NOTIFICACIONES.mp3';
const CACHE='taskflow-mission-sfx-v13073';
const INTENT_MS=5000;
const DEBOUNCE_MS=650;
const BOOT_GRACE_MS=4200;
const startedAt=Date.now();
let fallbackPlayer=null;
let objectUrl='';
let audioCtx=null;
let audioBuffer=null;
let lastPlayAt=0;
let intentUntil=0;
let domArm=0;
let domBefore=0;

const rawSetItem=Storage.prototype.setItem;
const norm=value=>String(value||'')
  .replace(/([a-z0-9])([A-Z])/g,'$1_$2')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toUpperCase().replace(/[^A-Z0-9]+/g,'_');

const COMPLETION_KEY_RE=/(^|_)(DONE|COMPLETED|COMPLETE|COMPLETION|FINISHED|CHECKED|HECHO|HECHA|COMPLETADO|COMPLETADA|COMPLETADOS|COMPLETADAS|CUMPLIDO|CUMPLIDA|TERMINADO|TERMINADA|REALIZADO|REALIZADA|DONE_AT|COMPLETED_AT|FINISHED_AT|COMPLETED_ON|DONE_DATE|DONE_DATES|COMPLETED_DATE|COMPLETED_DATES)(_|$)/;
const STATUS_KEY_RE=/(^|_)(STATUS|STATE|ESTADO)(_|$)/;
const STATUS_DONE_RE=/^(DONE|COMPLETED|COMPLETE|FINISHED|CHECKED|HECHO|HECHA|COMPLETADO|COMPLETADA|CUMPLIDO|CUMPLIDA|TERMINADO|TERMINADA|REALIZADO|REALIZADA)$/;

function makeFallback(src){
  const audio=new Audio();
  audio.preload='auto';
  audio.autoplay=false;
  audio.loop=false;
  audio.controls=false;
  audio.playsInline=true;
  audio.setAttribute('playsinline','');
  audio.setAttribute('data-taskflow-mission-sfx','1');
  audio.src=src;
  try{audio.volume=1}catch(_){}
  try{audio.load()}catch(_){}
  return audio;
}

function ensureContext(){
  if(audioCtx)return audioCtx;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(Ctx)audioCtx=new Ctx({latencyHint:'interactive'});
  }catch(_){audioCtx=null}
  return audioCtx;
}

function unlockAudio(){
  const ctx=ensureContext();
  if(ctx&&ctx.state==='suspended'){
    try{const p=ctx.resume();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_){}
  }
}

async function prepare(){
  let src=SRC,blob=null;
  try{
    if('caches' in window){
      const cache=await caches.open(CACHE);
      let response=await cache.match(SRC);
      if(!response){
        const fresh=await fetch(SRC,{cache:'force-cache',credentials:'same-origin'});
        if(fresh.ok){await cache.put(SRC,fresh.clone());response=fresh}
      }
      if(response&&response.ok){
        blob=await response.blob();
        if(blob&&blob.size>0){objectUrl=URL.createObjectURL(blob);src=objectUrl}
      }
    }
    if(!blob){
      const response=await fetch(SRC,{cache:'force-cache',credentials:'same-origin'});
      if(response.ok)blob=await response.blob();
    }
  }catch(_){}
  fallbackPlayer=makeFallback(src);
  try{
    const ctx=ensureContext();
    if(ctx&&blob&&blob.size){
      const bytes=await blob.arrayBuffer();
      audioBuffer=await ctx.decodeAudioData(bytes.slice(0));
    }
  }catch(_){audioBuffer=null}
}

function playWebAudio(){
  const ctx=ensureContext();
  if(!ctx||!audioBuffer)return false;
  try{
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const source=ctx.createBufferSource();
    const gain=ctx.createGain();
    const compressor=ctx.createDynamicsCompressor();
    source.buffer=audioBuffer;
    gain.gain.value=3.0;
    compressor.threshold.value=-20;
    compressor.knee.value=12;
    compressor.ratio.value=7;
    compressor.attack.value=.001;
    compressor.release.value=.12;
    source.connect(gain);gain.connect(compressor);compressor.connect(ctx.destination);
    source.start(0);
    return true;
  }catch(_){return false}
}

function play(){
  if(Date.now()-startedAt<BOOT_GRACE_MS)return;
  const now=Date.now();
  if(now-lastPlayAt<DEBOUNCE_MS)return;
  lastPlayAt=now;
  if(playWebAudio())return;
  if(!fallbackPlayer)fallbackPlayer=makeFallback(SRC);
  try{fallbackPlayer.pause();fallbackPlayer.currentTime=0;fallbackPlayer.volume=1}catch(_){}
  try{const p=fallbackPlayer.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_){}
}

function markIntent(){
  intentUntil=Date.now()+INTENT_MS;
  unlockAudio();
}

function truthyCompletion(value){
  if(value===true)return 1;
  if(value===false||value==null)return 0;
  if(typeof value==='number')return Number.isFinite(value)&&value>0?1:0;
  if(typeof value==='string'){
    const v=norm(value);
    if(STATUS_DONE_RE.test(v)||v==='TRUE'||v==='1')return 1;
    if(/^\d{4}(_\d{1,2}){1,5}/.test(v))return 1;
    return 0;
  }
  if(Array.isArray(value))return value.length;
  if(typeof value==='object')return Object.keys(value).length;
  return 0;
}

function completionScore(value,key='',seen){
  const nk=norm(key);
  if(value==null)return 0;
  if(typeof value!=='object'){
    if(COMPLETION_KEY_RE.test(nk))return truthyCompletion(value);
    if(STATUS_KEY_RE.test(nk))return STATUS_DONE_RE.test(norm(value))?1:0;
    return 0;
  }
  if(!seen)seen=new WeakSet();
  if(seen.has(value))return 0;
  seen.add(value);

  if(COMPLETION_KEY_RE.test(nk)){
    if(Array.isArray(value))return value.length;
    return truthyCompletion(value);
  }

  let total=0;
  if(Array.isArray(value)){
    for(const item of value)total+=completionScore(item,'',seen);
    return total;
  }
  for(const k of Object.keys(value))total+=completionScore(value[k],k,seen);
  return total;
}

function parseScore(raw){
  if(raw==null||raw==='')return 0;
  try{return completionScore(JSON.parse(raw))}catch(_){return 0}
}

function eligibleStorageKey(key){
  const k=String(key||'');
  if(!k.startsWith('taskflow_'))return false;
  if(/sound|audio|playback|welcome|headphone|profile|firebase|global_reset|cloud_local_touch|mission_sfx/i.test(k))return false;
  return true;
}

Storage.prototype.setItem=function(key,value){
  const active=this===localStorage&&eligibleStorageKey(key)&&Date.now()<=intentUntil;
  let before=0;
  if(active){try{before=parseScore(localStorage.getItem(key))}catch(_){} }
  const out=rawSetItem.apply(this,arguments);
  if(active){
    let after=0;
    try{after=parseScore(String(value))}catch(_){}
    if(after>before)queueMicrotask(play);
  }
  return out;
};

function excludedNode(node){
  return !!(node&&node.closest&&node.closest('#tfSoundV1304,#tfManagerV117,#tfProfileOverlay,.tf120-overlay,#tfWelcomeV13063,#tfHeadphonesV13072,[class*="settings" i],[class*="config" i]'));
}

function completionMarkerCount(){
  const selectors=[
    'input[type="checkbox"]:checked',
    '[aria-checked="true"]',
    '[data-completed="true"]',
    '[data-done="true"]',
    '[data-finished="true"]',
    '.tf13067-check.tf13067-done',
    '.tf13066-completed-mission',
    '.is-completed',
    '.is-complete',
    '.is-done',
    '.completed',
    '.done'
  ];
  const nodes=new Set();
  for(const selector of selectors){
    try{
      document.querySelectorAll(selector).forEach(el=>{
        if(!excludedNode(el))nodes.add(el);
      });
    }catch(_){}
  }
  return nodes.size;
}

function armDomFallback(){
  markIntent();
  const token=++domArm;
  domBefore=completionMarkerCount();
  const check=()=>{
    if(token!==domArm)return;
    const after=completionMarkerCount();
    if(after>domBefore){
      domArm++;
      play();
    }
  };
  [40,100,190,330,520,800,1200,1750,2400].forEach(ms=>setTimeout(check,ms));
}

function isCompletionLikeTarget(target){
  if(!target||!target.closest||excludedNode(target))return false;
  if(target.closest('input[type="checkbox"]'))return true;
  if(target.closest('.v96-mentalist-scroll,.v97-routine-scroll'))return true;
  const control=target.closest('button,[role="button"],label,[role="checkbox"],[role="switch"]');
  if(!control)return false;
  const signature=norm(
    String(control.className||'')+' '+String(control.id||'')+' '+
    String(control.getAttribute('aria-label')||'')+' '+
    String(control.getAttribute('title')||'')+' '+String(control.textContent||'')
  );
  return /(CHECK|DONE|COMPLETE|COMPLET|HECHO|MARCAR|CUMPL|MISSION|MISION|HABIT|HABITO|TASK|TAREA)/.test(signature);
}

function onPrimaryIntent(event){
  const target=event&&event.target;
  markIntent();
  if(isCompletionLikeTarget(target))armDomFallback();
}

if('PointerEvent' in window){
  document.addEventListener('pointerdown',onPrimaryIntent,{capture:true,passive:true});
}else{
  document.addEventListener('touchstart',onPrimaryIntent,{capture:true,passive:true});
  document.addEventListener('mousedown',onPrimaryIntent,{capture:true,passive:true});
}

document.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '||event.code==='Space'){
    markIntent();
    if(isCompletionLikeTarget(event.target))armDomFallback();
  }
},true);

document.addEventListener('change',event=>{
  const input=event.target;
  if(!(input instanceof HTMLInputElement)||input.type!=='checkbox'||!input.checked||excludedNode(input))return;
  markIntent();
  setTimeout(play,35);
},true);

/* Último respaldo: si un control personalizado marca una misión sin checkbox
   pero cambia su estado visual a completado, el sondeo iniciado por el gesto lo detecta. */
document.addEventListener('click',event=>{
  if(!isCompletionLikeTarget(event.target))return;
  if(Date.now()>intentUntil)markIntent();
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare,{once:true});else prepare();
window.addEventListener('pagehide',()=>{if(objectUrl)try{URL.revokeObjectURL(objectUrl)}catch(_){}},{once:true});
})();
