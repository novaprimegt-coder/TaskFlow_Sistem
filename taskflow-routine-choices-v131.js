/* TaskFlow V131 — conservar estados hasta accion manual o reinicio confirmado. */
(function(){
'use strict';
if(window.TaskFlowRoutineChoicesV131)return;
const CONFIG='taskflow_routines_v115',FIELD='__tfChoicesV131';
const IDS=['sung','juridico','socrates','maquiavelo','mentalista','budget503020'];
const baseSet=Storage.prototype.setItem,baseRemove=Storage.prototype.removeItem;
let trusted=0,pending=null;
function parse(s){
 try{const x=typeof s==='string'?JSON.parse(s||'{}'):s;return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(_){return {}}
}
function action(c,id){
 const a=c&&c[FIELD]&&c[FIELD][id];
 return a&&typeof a==='object'&&typeof a.value==='boolean'&&a.value===c[id]&&Number.isFinite(Number(a.at))&&Number(a.at)>0?a:null;
}
function merge(local,remote,opt){
 const a=parse(local),b=parse(remote),fresh=!!(opt&&opt.accountChange);
 const out={...a,...b},choices={...(a[FIELD]||{}),...(b[FIELD]||{})};
 for(const id of IDS){
  const lv=a[id]===true,rv=b[id]===true,la=action(a,id),ra=action(b,id);
  let chosen,choice=null;
  if(fresh){chosen=rv;choice=ra}
  else if(la&&ra){
   const useRemote=Number(ra.at)>Number(la.at)||(Number(ra.at)===Number(la.at)&&ra.value===la.value);
   chosen=useRemote?rv:lv;choice=useRemote?ra:la;
  }else if(ra){chosen=rv;choice=ra}
  else if(la){chosen=lv;choice=la}
  else chosen=lv||rv;
  out[id]=chosen;
  if(choice)choices[id]={value:chosen,at:Number(choice.at),kind:choice.kind||'manual'};
  else delete choices[id];
 }
 if(Object.keys(choices).length)out[FIELD]=choices;else delete out[FIELD];
 return out;
}
function mark(config,ids,kind,stamp){
 const c=parse(config),choices={...(c[FIELD]||{})};
 for(const id of (Array.isArray(ids)?ids:[ids])){
  if(!IDS.includes(id))continue;
  const prev=Number(choices[id]&&choices[id].at)||0;
  choices[id]={value:c[id]===true,at:Math.max(Number(stamp)||Date.now(),prev+1),kind:kind==='reset'?'reset':'manual'};
 }
 c[FIELD]=choices;return c;
}
function reset(config,stamp){
 const c=parse(config);for(const id of IDS)c[id]=false;
 return mark(c,IDS,'reset',stamp||Date.now());
}
function trustedWrite(fn){trusted++;try{return fn()}finally{trusted--}}
function local(){try{return parse(localStorage.getItem(CONFIG))}catch(_){return {}}}
Storage.prototype.setItem=function(k,v){
 if(this===localStorage&&String(k)===CONFIG&&!trusted){
  let incoming=parse(v);
  if(pending&&Date.now()-pending.at<1500){
   for(const id of pending.ids)if(typeof incoming[id]==='boolean')incoming=mark(incoming,id,'manual',pending.at);
  }
  return baseSet.call(this,k,JSON.stringify(merge(local(),incoming)));
 }
 return baseSet.call(this,k,v);
};
Storage.prototype.removeItem=function(k){
 if(this===localStorage&&String(k)===CONFIG&&!trusted&&IDS.some(id=>local()[id]===true))return;
 return baseRemove.call(this,k);
};
function guess(row){
 const s=String(row&&row.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(s.includes('mentalista'))return 'mentalista';
 if(s.includes('juridico'))return 'juridico';
 if(s.includes('maquiavelo'))return 'maquiavelo';
 if(s.includes('socrates'))return 'socrates';
 if(s.includes('sung'))return 'sung';
 if(s.includes('50/30/20'))return 'budget503020';
 return '';
}
function begin(ids){pending={ids,at:Date.now()};setTimeout(()=>{pending=null},350)}
document.addEventListener('change',e=>{
 if(!e.isTrusted||!e.target||!e.target.closest||e.target.tagName!=='INPUT'||e.target.type!=='checkbox')return;
 const id=guess(e.target.closest('.tf119-row,.tf115-row,.tf117-row,.tf113-row'));
 if(id)begin([id]);
},true);
document.addEventListener('click',e=>{
 if(!e.isTrusted||!e.target||!e.target.closest)return;
 const btn=e.target.closest('#tf119AllOn,#tf119AllOff,#tf115AllOn,#tf115AllOff,#tf117AllOn,#tf117AllOff,#tf113AllOn,#tf113AllOff');
 if(!btn)return;
 begin(IDS);
 if(/AllOff$/.test(btn.id)){
  try{localStorage.setItem('taskflow_v13041_mentalista_user_choice','off');
      localStorage.removeItem('taskflow_v13066_mentalista_enabled_guard')}catch(_){}
 }else{
  try{localStorage.setItem('taskflow_v13041_mentalista_user_choice','on')}catch(_){}
 }
},true);
window.TaskFlowRoutineChoicesV131=Object.freeze({IDS:IDS.slice(),FIELD,parse,merge,mark,reset,trustedWrite});
})();
