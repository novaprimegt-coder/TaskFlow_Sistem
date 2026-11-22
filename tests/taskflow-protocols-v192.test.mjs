import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const raw=readFileSync('t57/runtime-03.txt','utf8');
const runtime=readFileSync('t57/runtime-24.txt','utf8');
function literal(name){
 const prefix='const '+name+'=';
 const line=raw.split('\n').find(line=>line.startsWith(prefix));
 assert.ok(line,'Falta '+name);
 return JSON.parse(line.slice(prefix.length,-1));
}
const logic=literal('TF_PROTOCOL_T12_JS'),css=literal('TF_PROTOCOL_T12_CSS');
new vm.Script(logic);
assert.match(css,/:not\(\.tf-protocol-t12-locked\)/);
assert.match(runtime,/saveDeadline\(key,Date\.now\(\)\+minutes\*60000\)/);
assert.ok(runtime.includes('deadline(key)>0 && (deadline(key)>Date.now() || sessionStarted(key))'));
assert.ok(runtime.includes("let launch=scroll.querySelector(':scope > button.tf15-launch')"));
assert.ok(runtime.includes('launch.hidden=sessionStarted(kind)'));
assert.ok(runtime.includes('button.tfm-start{display:none!important;}'));
const makeList=(values=[])=>{
 const set=new Set(values);
 return {contains:k=>set.has(k),add:(...k)=>k.forEach(v=>set.add(v)),
 remove:(...k)=>k.forEach(v=>set.delete(v)),
 toggle:(k,flag)=>{const state=flag===undefined?!set.has(k):!!flag;state?set.add(k):set.delete(k);return state}};
};
function create(kind,title,total,storage=new Map()){
 let uid='A',closed=0;const listeners={},docListeners={};
 const frame={classList:makeList(['open'])};
 const rows=Array.from({length:total},()=>({classList:makeList()}));
 const scroll={querySelectorAll:()=>rows};
 const pill={textContent:'0/'+total},h2={textContent:title};
 const panel={dataset:{tfRoutine:kind},contains:()=>true,
  querySelector(selector){
   if(selector.includes('.v96-mentalist-scroll')||selector.includes('.v97-routine-scroll'))return scroll;
   if(selector==='.v85-routine-modal-copy h2')return h2;
   if(selector==='.v85-routine-progress-pill')return pill;
   return null;
  }};
 const window={TaskFlowFirebase:{getUser:()=>({uid})},
  addEventListener(name,cb){listeners[name]=cb},
  closeWindow(){closed++;return true}};
 const document={hidden:false,getElementById:id=>id==='windowContainer'?frame:id==='windowContent'?panel:null,
  addEventListener(name,cb){docListeners[name]=cb}};
 const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))};
 class MutationObserver{observe(){}}
 vm.runInNewContext(logic,{window,document,localStorage,MutationObserver,Date,
  requestAnimationFrame:cb=>cb(),console:{warn(){}}});
 function click(target){let blocked=false;listeners.click({target,
  preventDefault(){blocked=true},stopImmediatePropagation(){blocked=true}});return blocked}
 function start(){
  const button={textContent:'Comenzar protocolo '+title,
   closest(selector){return selector.startsWith('button')?button:null}};
  return click(button);
 }
 function x(){
  const node={closest(selector){return selector.includes('#windowContainer .window-close')?node:null}};
  return click(node);
 }
 return {frame,rows,storage,window,start,x,inspect:()=>window.__tfProtocolLockT12Inspect(),
  close:()=>window.closeWindow(),closes:()=>closed,
  complete(){rows.forEach(row=>row.classList.add('done'))},
  switchAccount(){uid='B';docListeners['taskflow:account-state-updated']()},
  dismiss(){frame.classList.remove('open');docListeners['taskflow:account-state-updated']()}
 };
}
for(const [kind,title,minutes,total] of [
 ['sung','Sung Jin-Woo',120,7],['legal','Dominio Jurídico',45,6],
 ['socrates','Sócrates',30,5],['machiavelli','Maquiavelo',25,5],
 ['mentalist','Mentalista',35,12]
]){
 const re=new RegExp('\\b'+kind+':\\{[\\s\\S]{0,550}duration:'+minutes+'\\b');
 assert.match(runtime,re,'Duración de '+title);
 const s=create(kind,title,total);
 assert.equal(s.inspect().started,false,'Antes de iniciar '+title);
 assert.equal(s.inspect().locked,false,'X visible antes de iniciar '+title);
 assert.equal(s.x(),false,'X sin iniciar '+title);
 s.start();
 assert.equal(s.inspect().started,true,'Inicio de '+title);
 assert.equal(s.inspect().locked,true,'X bloqueada durante '+title);
 assert.equal(s.x(),true,'Intercepción de cierre durante '+title);
 s.close();assert.equal(s.closes(),0,'No cerrar incompleto '+title);
 assert.equal(create(kind,title,total,s.storage).inspect().locked,true,'Recuperar sesión '+title);
 s.complete(); // El contador 0/N queda desactualizado intencionalmente.
 assert.equal(s.inspect().done,total,'Marcado real '+title);
 assert.equal(s.inspect().complete,true,'Completitud '+title);
 assert.equal(s.inspect().locked,false,'Liberar X '+title);
 assert.equal(s.x(),false,'Permitir X completado '+title);
 s.close();assert.equal(s.closes(),1,'Cierre completado '+title);
 s.switchAccount();
 assert.equal(s.inspect().started,false,'Aislamiento de cuenta '+title);
 assert.equal(s.inspect().locked,false,'X de nueva cuenta '+title);
 s.dismiss();assert.equal(s.inspect().locked,false,'Navegación libre '+title);
 console.log('OK '+title+' / '+minutes+' min / inicio / cronómetro / X / recuperación');
}
