(function(){
'use strict';
if(window.__tfRoutineListenerGuardV1303)return;
window.__tfRoutineListenerGuardV1303=true;
window.__tfRoutineStabilityV1303=true;

const nativeDocumentAdd=document.addEventListener.bind(document);
const nativeWindowAdd=window.addEventListener.bind(window);
const legacyFiles=new Set([
  'taskflow-v125-routine-layout.js',
  'taskflow-v126-routine-tight.js',
  'taskflow-v127-ui-fixes.js',
  'taskflow-v1281-requested-layout.js',
  'taskflow-v129-rank-visual-system.js',
  'taskflow-v130-unified-layout.js',
  'taskflow-v1301-bottom-gap-fix.js',
  'taskflow-v1302-routine-spacing.js'
]);

function currentFile(){
  try{
    const src=(document.currentScript&&document.currentScript.src)||'';
    return src.split('/').pop().split('?')[0];
  }catch(_){return '';}
}
function routineOpen(){
  const container=document.getElementById('windowContainer');
  const content=document.getElementById('windowContent');
  return !!(container&&container.classList.contains('open')&&content&&content.querySelector('.v96-mentalist-scroll,.v97-routine-scroll'));
}
function routineLaunch(target){
  return !!(target&&target.closest&&target.closest('.v83-core-card.sung,.v83-core-card.legal,.v69-routine-launch,.v94-mentalist-launch'));
}
function wrapDocumentListener(type,fn,file){
  if(typeof fn!=='function'||!legacyFiles.has(file)||type!=='click')return fn;
  return function(event){
    if(routineOpen()||routineLaunch(event&&event.target))return;
    return fn.call(this,event);
  };
}
function wrapWindowListener(type,fn,file){
  if(typeof fn!=='function'||!legacyFiles.has(file)||(type!=='resize'&&type!=='orientationchange'))return fn;
  return function(event){
    if(routineOpen())return;
    return fn.call(this,event);
  };
}

document.addEventListener=function(type,fn,options){
  const file=currentFile();
  return nativeDocumentAdd(type,wrapDocumentListener(type,fn,file),options);
};
window.addEventListener=function(type,fn,options){
  const file=currentFile();
  return nativeWindowAdd(type,wrapWindowListener(type,fn,file),options);
};
window.__tfRestoreRoutineListenerRegistrationV1303=function(){
  document.addEventListener=nativeDocumentAdd;
  window.addEventListener=nativeWindowAdd;
};
})();
