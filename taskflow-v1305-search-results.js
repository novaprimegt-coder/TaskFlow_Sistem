(function(){
'use strict';
if(window.__tfV13054Bridge)return;window.__tfV13054Bridge=true;

/* V130.10.1 · Puente actual de TaskFlow.
   - Elimina la bienvenida emergente de comandos SONIDO/MEJORAR.
   - Elimina el aviso emergente heredado de auriculares.
   - Conserva la pista y la posición guardada al volver a abrir TaskFlow.
   - Reduce escrituras repetitivas del estado de reproducción para mejorar fluidez.
   - Mantiene desactivada la actualización obligatoria.
   - No modifica rutinas, progreso, búsqueda, perfil, datos ni diseño general. */
function installAudioContinuityGuard(){
  if(window.__tfV13071AudioContinuity)return;window.__tfV13071AudioContinuity=true;
  const KEY='taskflow_sound_playback_v13057';
  const originalSetItem=Storage.prototype.setItem;
  const previousPlay=HTMLMediaElement.prototype.play;
  const bootAt=Date.now();
  let protectedState=null,lastActive=null,lastWriteAt=0;

  const parse=value=>{
    try{
      const d=JSON.parse(value||'{}'),index=Number(d.index),time=Number(d.time);
      return Number.isFinite(index)&&index>=0&&Number.isFinite(time)&&time>=0?{index,time}:null;
    }catch(_){return null}
  };
  try{protectedState=parse(localStorage.getItem(KEY))}catch(_){}

  const isMusic=media=>media instanceof HTMLAudioElement&&media.getAttribute('data-taskflow-sound')!==null;
  const indexOf=audio=>Number(audio&&audio.getAttribute('data-taskflow-sound'));
  const directWrite=state=>{
    if(!state||!Number.isFinite(state.index)||state.index<0||!Number.isFinite(state.time)||state.time<0)return;
    try{originalSetItem.call(localStorage,KEY,JSON.stringify({index:state.index,time:state.time,at:Date.now()}))}catch(_){}
  };
  const safeSavedTime=(audio,time)=>{
    let t=Math.max(0,Number(time)||0);
    try{const d=Number(audio.duration);if(Number.isFinite(d)&&d>0)t=Math.min(t,Math.max(0,d-.15))}catch(_){}
    return t;
  };
  const save=(audio,force)=>{
    if(!isMusic(audio))return;
    const index=indexOf(audio),time=Number(audio.currentTime);
    if(!Number.isFinite(index)||index<0||!Number.isFinite(time)||time<0)return;
    if(protectedState&&audio.dataset.tf13071Restored!=='1')return;
    const now=Date.now();
    if(!force&&now-lastWriteAt<4000)return;
    lastWriteAt=now;
    directWrite({index,time});
  };
  const bind=audio=>{
    if(!isMusic(audio)||audio.dataset.tf13071Bound==='1')return;
    audio.dataset.tf13071Bound='1';
    audio.addEventListener('timeupdate',()=>save(audio,false));
    audio.addEventListener('pause',()=>save(audio,true));
  };

  Storage.prototype.setItem=function(key,value){
    if(this===localStorage&&key===KEY&&protectedState&&protectedState.time>.05&&Date.now()-bootAt<90000){
      const next=parse(value);
      if(next&&next.index===protectedState.index&&next.time+1<protectedState.time)return;
    }
    return originalSetItem.apply(this,arguments);
  };

  function playWithRestore(audio,args){
    lastActive=audio;bind(audio);
    const index=indexOf(audio),state=protectedState;
    if(!state||state.index!==index||state.time<=.05){
      audio.dataset.tf13071Restored='1';
      return previousPlay.apply(audio,args);
    }
    if(audio.dataset.tf13071Restored==='1')return previousPlay.apply(audio,args);
    if(audio.__tf13071RestorePromise)return audio.__tf13071RestorePromise;

    const run=()=>{
      const target=safeSavedTime(audio,state.time);
      try{audio.currentTime=target}catch(_){}
      audio.dataset.tf13071Restored='1';
      protectedState=null;
      directWrite({index,time:target});
      return previousPlay.apply(audio,args);
    };

    if(audio.readyState>=1)return run();
    audio.__tf13071RestorePromise=new Promise((resolve,reject)=>{
      let finished=false;
      const done=()=>{
        if(finished)return;finished=true;
        audio.removeEventListener('loadedmetadata',done);
        clearTimeout(timer);
        try{Promise.resolve(run()).then(resolve,reject)}catch(err){reject(err)}
      };
      const timer=setTimeout(done,2600);
      audio.addEventListener('loadedmetadata',done,{once:true});
    }).finally(()=>{try{delete audio.__tf13071RestorePromise}catch(_){audio.__tf13071RestorePromise=null}});
    return audio.__tf13071RestorePromise;
  }

  HTMLMediaElement.prototype.play=function(){
    if(isMusic(this))return playWithRestore(this,arguments);
    return previousPlay.apply(this,arguments);
  };

  const persist=()=>{if(lastActive)save(lastActive,true)};
  window.addEventListener('pagehide',persist,{capture:true});
  window.addEventListener('beforeunload',persist,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()},true);
  document.addEventListener('freeze',persist,true);
}

function disableLegacyForcedUpdate(){
  try{
    const modal=document.getElementById('tfV13090ForceUpdate');
    if(modal)modal.remove();
    const style=document.getElementById('tfV13090ForceUpdateStyle');
    if(style)style.remove();
    delete document.documentElement.dataset.tfRequiredUpdate;
    document.documentElement.style.removeProperty('overflow');
    if(document.body)document.body.style.removeProperty('overflow');
    [
      'taskflow_required_update_state_v13090',
      'taskflow_required_update_ack_v13090'
    ].forEach(k=>{try{localStorage.removeItem(k)}catch(_){}});
  }catch(_){}
}

function disableLegacyPrompts(){
  try{
    window.__tfV13063Welcome=true;
    window.__tfV13064WelcomeEmphasis=true;
    window.__tfV13072Headphones=true;
    localStorage.setItem('taskflow_welcome_seen_v13083_release','1');
  }catch(_){}
  const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  const removeKnown=()=>{
    ['tfWelcomeV13063','tfWelcomeV13063Style','tfV13064WelcomeEmphasisStyle','tfHeadphonesV13072','tfHeadphonesV13072Style'].forEach(id=>{
      const node=document.getElementById(id);if(node)node.remove();
    });
  };
  const removeLegacyDialog=node=>{
    if(!(node instanceof Element))return;
    if(node.id==='tfSoundV1304'||node.id==='tfAudioGateV13057')return;
    const text=fold(node.textContent);
    const welcome=
      text.includes('BIENVENIDO A TASKFLOW')||
      (text.includes('ACCESOS RAPIDOS')&&text.includes('SONIDO')&&text.includes('MEJORAR'))||
      (text.includes('PODRAS CONTINUAR')&&text.includes('SONIDO')&&text.includes('MEJORAR'));
    const headphones=text.includes('AURICULAR')||text.includes('AUDIFONO')||text.includes('AUDIFONOS')||text.includes('HEADPHONE');
    if(!welcome&&!headphones)return;
    const dialog=node.matches&&node.matches('[role="dialog"],[aria-modal="true"],[class*="modal"],[class*="overlay"]')
      ?node
      :(node.closest&&node.closest('[role="dialog"],[aria-modal="true"],[class*="modal"],[class*="overlay"]'));
    if(dialog&&dialog.id!=='tfSoundV1304'&&dialog.id!=='tfAudioGateV13057')dialog.remove();
    else if(welcome&&node.id==='tfWelcomeV13063')node.remove();
  };
  try{
    if(!document.getElementById('tfV130100PromptKillStyle')){
      const style=document.createElement('style');
      style.id='tfV130100PromptKillStyle';
      style.textContent='#tfWelcomeV13063,#tfHeadphonesV13072{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
      document.head.appendChild(style);
    }
  }catch(_){}
  const purge=()=>{
    try{
      removeKnown();
      document.querySelectorAll('[role="dialog"],[aria-modal="true"],[id^="tf"],[class*="modal"],[class*="overlay"]').forEach(removeLegacyDialog);
    }catch(_){}
  };
  purge();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',purge,{once:true});
  else queueMicrotask(purge);

  // Fail-safe de arranque: cubre también bienvenidas heredadas que intenten aparecer con retraso.
  if('MutationObserver' in window){
    try{
      const observer=new MutationObserver(mutations=>{
        for(const mutation of mutations){
          for(const added of mutation.addedNodes||[]){
            const node=added instanceof Element?added:(added&&added.parentElement);
            if(!node)continue;
            if(node.id==='tfWelcomeV13063'){node.remove();continue}
            removeLegacyDialog(node);
          }
        }
      });
      observer.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(()=>{try{observer.disconnect()}catch(_){}},45000);
    }catch(_){}
  }
}

/* V130.11.5: los estilos de perfil deben cargarse DESPUÉS de la base compacta.
   El CSS anterior se insertaba en DOMContentLoaded y anulaba la referencia visual. */
function keepProfileReferenceLast(){
 const reference=document.querySelector('link[href*="taskflow-v130114-profile-reference.css"]');
 if(!reference)return;
 const styles=Array.from(document.head.children).filter(el=>el.tagName==='STYLE'||el.tagName==='LINK'&&el.rel==='stylesheet');
 if(reference.parentElement!==document.head||styles[styles.length-1]!==reference){
  document.head.appendChild(reference);
 }
}
function addCss(){
 if(!document.getElementById('tfV13051ProfileCss')){
  const l=document.createElement('link');l.id='tfV13051ProfileCss';l.rel='stylesheet';
  l.href='./taskflow-v13051-profile-compact.css?v=13051-20261004';
  document.head.appendChild(l);
 }
 keepProfileReferenceLast();
 [100,400,1200].forEach(ms=>setTimeout(keepProfileReferenceLast,ms));
}
function addScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.body.appendChild(s)}
function boot(){addCss();addScript('tfV13051ProfileJs','./taskflow-v13051-profile-compact.js?v=130118-20261024');addScript('tfV13053SearchStabilityJs','./taskflow-v13053-search-stability.js?v=130102-20261016');addScript('tfV13053VisualPolishJs','./taskflow-v13053-visual-polish.js?v=13079-20261006');addScript('tfV13054SearchCompleteJs','./taskflow-v13054-search-complete.js?v=13054-20261004');addScript('tfV13062MentalistaSearchGuardJs','./taskflow-v13062-mentalista-search-guard.js?v=13062-20261005');addScript('tfV13065UiStabilityJs','./taskflow-v13065-ui-stability.js?v=13065-20261005');addScript('tfV13066MentalistStabilityJs','./taskflow-v13066-mentalist-stability.js?v=13067-20261005');addScript('tfV13073MissionSoundJs','./taskflow-v13073-mission-sound.js?v=13074-20261005');addScript('tfV13078MindUnifiedStyleJs','./taskflow-v13078-mind-unified-style.js?v=13078-20261006');}

disableLegacyForcedUpdate();
disableLegacyPrompts();
installAudioContinuityGuard();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
