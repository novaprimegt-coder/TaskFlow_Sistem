(function(){
'use strict';
if(window.__tfV13069MissionSound)return;
window.__tfV13069MissionSound=true;

/* V130.6.9 · Sonido de misión completada.
   Cambio localizado: reproduce únicamente el sonido de notificación cuando
   una misión pasa de pendiente a completada. No modifica progreso ni rutinas. */

const SRC='./audio/notificaciones/SONIDO%20DE%20NOTIFICACIONES.mp3';
const CACHE='taskflow-mission-sfx-v13069';
let player=null;
let objectUrl='';
let lastPlayAt=0;

const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();

function makePlayer(src){
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

async function prepare(){
  let src=SRC;
  try{
    if('caches' in window){
      const cache=await caches.open(CACHE);
      let response=await cache.match(SRC);
      if(!response){
        const fresh=await fetch(SRC,{cache:'force-cache',credentials:'same-origin'});
        if(fresh.ok){await cache.put(SRC,fresh.clone());response=fresh}
      }
      if(response&&response.ok){
        const blob=await response.blob();
        if(blob&&blob.size>0){objectUrl=URL.createObjectURL(blob);src=objectUrl}
      }
    }
  }catch(_){}
  player=makePlayer(src);
}

function play(){
  const now=Date.now();
  if(now-lastPlayAt<450)return;
  lastPlayAt=now;
  if(!player)player=makePlayer(SRC);
  try{player.pause();player.currentTime=0;player.volume=1}catch(_){}
  try{const p=player.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(_){}
}

function routineScope(node){
  if(!node||!node.closest)return null;
  const wc=node.closest('#windowContent');
  if(wc&&wc.closest('#windowContainer.open'))return wc;
  return node.closest('.v96-mentalist-scroll,.v97-routine-scroll,.mentalist-modal.open,[class*="mentalist"][class*="open"]');
}

function completedCount(root){
  if(!root)return 0;
  const done=new Set();
  const add=el=>{if(el&&root.contains(el))done.add(el)};
  root.querySelectorAll('input[type="checkbox"]:checked').forEach(el=>add(el.closest('[class*="item"],[class*="mission"],[class*="task"],label')||el));
  root.querySelectorAll('.v69-routine-item.done,[class*="mission"].done,[class*="task"].done,[class*="item"].done,[class*="mission"].completed,[class*="task"].completed,[class*="item"].completed,[class*="mission"].complete,[class*="task"].complete,[class*="item"].complete,[class*="mission"].is-done,[class*="task"].is-done,[class*="item"].is-done,[class*="mission"].is-complete,[class*="task"].is-complete,[class*="item"].is-complete').forEach(add);
  root.querySelectorAll('[aria-checked="true"],[aria-pressed="true"]').forEach(el=>{
    const host=el.closest('[class*="item"],[class*="mission"],[class*="task"]');
    if(host)add(host);
  });
  return done.size;
}

function ignoredTarget(target){
  const hit=target&&target.closest&&target.closest('button,[role="button"],input,label,[class*="item"],[class*="mission"],[class*="task"]');
  if(!hit)return true;
  const text=norm(hit.textContent);
  const cls=String(hit.className||'').toLowerCase();
  if(text.includes('COMO COMPLETARLA')||text==='X'||text==='×'||/close|cerrar|back|volver|step|paso/.test(cls))return true;
  return false;
}

function watchClick(event){
  const scope=routineScope(event.target);
  if(!scope||ignoredTarget(event.target))return;
  const before=completedCount(scope);
  let finished=false;
  const check=()=>{
    if(finished||!document.documentElement.contains(scope))return;
    const after=completedCount(scope);
    if(after>before){finished=true;play()}
  };
  requestAnimationFrame(check);
  setTimeout(check,80);
  setTimeout(check,220);
  setTimeout(check,500);
}

function watchChange(event){
  const input=event.target;
  if(!input||input.type!=='checkbox'||!input.checked)return;
  if(routineScope(input))play();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare,{once:true});else prepare();
document.addEventListener('click',watchClick,true);
document.addEventListener('change',watchChange,true);
window.addEventListener('pagehide',()=>{if(objectUrl)try{URL.revokeObjectURL(objectUrl)}catch(_){}},{once:true});
})();
