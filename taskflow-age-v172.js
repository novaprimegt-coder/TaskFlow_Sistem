/* TaskFlow V172 — Edad obligatoria por cuenta (sin fecha de nacimiento).
 * El alta exige edad antes de Firebase Auth; las cuentas existentes deben completarla.
 * Persistencia privada en el servicio de perfil ya existente, sin tocar publicidad.
 */
(function(){
'use strict';
if(window.__tfAgeV172)return;
window.__tfAgeV172=true;
const API='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/profile/';
const PREFIX='taskflow_verified_age_v172_';
const $=id=>document.getElementById(id);
const SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M8 15h2m4 0h2"/></svg>';
let mode='',resolvePicker=null,selectedAge=null,activeUid='',checkingUid='',checkSeq=0,working=false,previousFocus=null,overflowBefore='';
let lastCheck=0;
function validAge(value){
 const n=typeof value==='number'?value:Number(String(value||'').trim());
 return Number.isInteger(n)&&n>=13&&n<=120?n:null;
}
function getUser(){try{return window.TaskFlowFirebase?.getUser?.()||null}catch(_){return null}}
function readLocal(uid){try{const x=JSON.parse(localStorage.getItem(PREFIX+uid)||'null');return x&&validAge(x.age)?x:null}catch(_){return null}}
function cacheAge(uid,age){try{localStorage.setItem(PREFIX+uid,JSON.stringify({age,checkedAt:Date.now()}))}catch(_){}}
async function cloudRequest(uid,action,data={}){
 if(!uid||getUser()?.uid!==uid)throw new Error('ACCOUNT_CHANGED');
 const api=window.TaskFlowFirebase;
 if(!api||typeof api.getIdToken!=='function')throw new Error('AUTH_NOT_READY');
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),12000);
 try{
  const opts={method:'POST',mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal:ctl.signal,
   headers:{'Content-Type':'application/json'},body:JSON.stringify(data)};
  for(let attempt=0;attempt<2;attempt++){
   const token=await api.getIdToken(attempt===1);
   if(!token||getUser()?.uid!==uid)throw new Error('AUTH_REQUIRED');
   opts.headers.Authorization='Bearer '+token;
   const response=await fetch(API+action,opts);
   if(response.status===401&&attempt===0)continue;
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw Object.assign(new Error(result?.error||'HTTP '+response.status),{status:response.status});
   return result;
  }
  throw new Error('AUTH_REQUIRED');
 }finally{clearTimeout(timer)}
}

function setError(message){const el=$('tfAgeError');if(el)el.textContent=message||''}
function setBusy(yes){working=!!yes;for(const id of ['tfAgeMinus','tfAgePlus','tfAgeValue','tfAgeAlternate'])if($(id))$(id).disabled=working;if($('tfAgeConfirm'))$('tfAgeConfirm').disabled=working||(mode!=='offline'&&validAge($('tfAgeValue')?.value)===null)}
function updateValue(value){
 const n=validAge(value),input=$('tfAgeValue');
 if(input)input.value=n===null?'':String(n);
 const preview=$('tfAgePreview');if(preview)preview.textContent=n===null?'Selecciona tu edad':n+' '+(n===1?'año':'años');
 if($('tfAgeConfirm'))$('tfAgeConfirm').disabled=working||n===null;
}
function focusAge(){setTimeout(()=>{if($('tfAgeValue')&&!working)$('tfAgeValue').focus({preventScroll:true})},80)}
function show(modeNext){
 mode=modeNext;
 const el=$('tfAgeOverlay');if(!el)return;
 previousFocus=document.activeElement;
 if(el.hidden){overflowBefore=document.body.style.overflow||'';el.hidden=false;document.body.style.overflow='hidden'}
 const isRequired=mode!=='register';
 const editing=mode==='edit';
 $('tfAgeTitle').textContent=editing?'Editar edad':isRequired?'Completa tu edad':'¿Cuántos años tienes?';
 $('tfAgeDescription').textContent=editing?'Actualiza tu edad declarada. La nueva edad se guardará en la misma cuenta.':isRequired?'Para continuar usando TaskFlow, indica tu edad. Solo es necesario registrarla una vez por cuenta.':'Selecciona tu edad antes de crear tu cuenta TaskFlow.';
 $('tfAgeConfirm').textContent=editing?'Guardar nueva edad':isRequired?'Guardar y continuar':'Usar esta edad';
 $('tfAgeAlternate').textContent=editing?'Cancelar':isRequired?'Cerrar sesión':'Volver al registro';
 $('tfAgeAlternate').hidden=false;
 updateValue(mode==='edit'?getVerifiedAge():mode==='register'?selectedAge:null);
 setError('');setBusy(false);focusAge();
}
function hide(){
 const el=$('tfAgeOverlay');if(!el||el.hidden)return;
 el.hidden=true;document.body.style.overflow=overflowBefore;
 mode='';setError('');setBusy(false);
 if(previousFocus?.isConnected)try{previousFocus.focus({preventScroll:true})}catch(_){}
 previousFocus=null;
}
function stopRegistration(){const fn=resolvePicker;resolvePicker=null;hide();if(fn)fn(null)}
async function saveRemote(uid,age){
 if(!uid||getUser()?.uid!==uid)throw new Error('ACCOUNT_CHANGED');
 // La elección publicitaria existente se conserva y no se activa por defecto.
 const profile=await cloudRequest(uid,'get');
 const consent=age>=18&&profile?.consentSaved===true;
 const saved=await cloudRequest(uid,'set',{age,personalizationConsent:consent});
 if(saved?.ok!==true||validAge(saved.age)!==age)throw new Error('AGE_NOT_CONFIRMED');
 // Confirmar la lectura desde el servidor antes de permitir cerrar el registro.
 const confirmed=await cloudRequest(uid,'get');
 if(validAge(confirmed?.age)!==age)throw new Error('AGE_NOT_PERSISTED');
 cacheAge(uid,age);
 try{document.dispatchEvent(new CustomEvent('taskflow:age-updated',{detail:{uid,age}}))}catch(_){}
 return true;
}

function setProfileAge(age){const field=$('tfProfileAgeValue');if(field)field.textContent=age==null?'Seleccionar edad':age+(age===1?' año':' años')}
async function checkAccount(uid,force=false){
 if(!uid||getUser()?.uid!==uid||mode==='register')return;
 if(working&&mode==='required')return;
 if(!force&&checkingUid===uid)return;
 const epoch=++checkSeq;
 checkingUid=uid;
 try{
  const saved=await cloudRequest(uid,'get');
  if(epoch!==checkSeq||getUser()?.uid!==uid)return;
  const age=validAge(saved?.age);
  if(age!==null){const previous=readLocal(uid)?.age;cacheAge(uid,age);setProfileAge(age);if(mode==='required'||mode==='offline')hide();if(previous!==age)try{document.dispatchEvent(new CustomEvent('taskflow:age-updated',{detail:{uid,age}}))}catch(_){}return}
  setProfileAge(null);
  if(typeof window.TaskFlowFirebase?.closeProfile==='function')window.TaskFlowFirebase.closeProfile();
  show('required');
 }catch(e){
  if(epoch!==checkSeq||getUser()?.uid!==uid)return;
  // La copia local solo se permite si antes se confirmó una escritura cloud.
  const cached=readLocal(uid);
  if(cached){setProfileAge(cached.age);if(mode==='offline')hide();return}
  if(typeof window.TaskFlowFirebase?.closeProfile==='function')window.TaskFlowFirebase.closeProfile();
  show('offline');
  setError('No se pudo verificar la edad de tu cuenta. Conéctate a Internet y vuelve a intentarlo.');
  $('tfAgeConfirm').textContent='Reintentar verificación';
  $('tfAgeConfirm').disabled=false;
  console.warn('TaskFlow V172: edad de la cuenta sin verificar',String(e?.message||e));
 }finally{if(checkingUid===uid)checkingUid='';}
}
async function confirm(){
 if(working)return;
 if(mode==='offline'){const u=getUser();if(u?.uid){setBusy(true);try{await checkAccount(u.uid,true)}finally{setBusy(false)}}return}
 const age=validAge($('tfAgeValue')?.value);
 if(age===null){setError('Indica una edad válida de 13 a 120 años.');return}
 if(mode==='register'){
  selectedAge=age;setProfileAge(age);
  const done=resolvePicker;resolvePicker=null;hide();if(done)done(age);
  return;
 }
 if(mode!=='required'&&mode!=='edit')return;
 const uid=getUser()?.uid;if(!uid)return;
 setBusy(true);setError('Guardando tu edad en la cuenta...');
 try{
  await saveRemote(uid,age);
  if(getUser()?.uid!==uid)return;
  setProfileAge(age);hide();
 }catch(e){setError('No se pudo guardar la edad en tu cuenta. Comprueba la conexión y vuelve a intentarlo.');console.warn('TaskFlow V172: save age failed',String(e?.message||e))}
 finally{setBusy(false)}
}
function signout(){
 if(mode==='register'){stopRegistration();return}
 if(mode==='edit'){hide();return}
 if(working)return;
 const button=$('tfProfileSignOut');
 if(button){button.click();return}
 setError('Abre tu perfil y cierra sesión para cambiar de cuenta.');
}
function buildUI(){
 if(!$('tfAgeOverlay')){
 const wrap=document.createElement('div');wrap.id='tfAgeOverlay';wrap.className='tf-age-overlay';wrap.hidden=true;
 wrap.innerHTML='<section class="tf-age-dialog" role="dialog" aria-modal="true" aria-labelledby="tfAgeTitle" aria-describedby="tfAgeDescription"><div class="tf-age-icon">'+SVG+'</div><p class="tf-age-kicker">CUENTA TASKFLOW · VERIFICACIÓN</p><h2 id="tfAgeTitle">¿Cuántos años tienes?</h2><p id="tfAgeDescription" class="tf-age-copy">Indica tu edad para continuar.</p><div class="tf-age-control"><label for="tfAgeValue">TU EDAD</label><div class="tf-age-stepper"><button type="button" id="tfAgeMinus" aria-label="Disminuir edad">−</button><input id="tfAgeValue" type="number" min="13" max="120" step="1" placeholder="Edad" inputmode="numeric" autocomplete="off" aria-required="true"><button type="button" id="tfAgePlus" aria-label="Aumentar edad">+</button></div><strong id="tfAgePreview">Selecciona tu edad</strong></div><p class="tf-age-privacy">Tu edad se guarda en tu cuenta. Los anuncios personalizados requieren tu autorización independiente.</p><p class="tf-age-error" id="tfAgeError" role="status" aria-live="polite"></p><button id="tfAgeConfirm" class="tf-age-primary" type="button">Guardar y continuar</button><button id="tfAgeAlternate" class="tf-age-secondary" type="button">Volver</button></section>';
 document.body.appendChild(wrap);
 $('tfAgeValue').addEventListener('input',()=>{const val=$('tfAgeValue').value;const n=validAge(val);$('tfAgePreview').textContent=n==null?'Selecciona tu edad':n+(n===1?' año':' años');$('tfAgeConfirm').disabled=working||n===null;setError('')});
 $('tfAgeValue').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();void confirm()}});
 for(const [id,delta] of [['tfAgeMinus',-1],['tfAgePlus',1]])$(id).addEventListener('click',()=>{
  const current=validAge($('tfAgeValue').value);updateValue(Math.min(120,Math.max(13,(current??(delta>0?12:121))+delta)));setError('')
 });
 $('tfAgeConfirm').addEventListener('click',()=>{void confirm()});
 $('tfAgeAlternate').addEventListener('click',signout);
 wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(mode==='register')stopRegistration()}});
 }

}
function getVerifiedAge(){const uid=getUser()?.uid;return uid?readLocal(uid)?.age??null:null}
function editAge(){
 const uid=getUser()?.uid;
 if(!uid||working||mode==='required'||mode==='offline'||mode==='register')return false;
 buildUI();show('edit');return true;
}
function requireAge(openAlways=false){
 if(!openAlways&&validAge(selectedAge)!==null)return Promise.resolve(selectedAge);
 if(resolvePicker)return Promise.resolve(null);
 return new Promise(resolve=>{resolvePicker=resolve;show('register')});
}
async function saveNewAge(age){
 const uid=getUser()?.uid,chosen=validAge(age);
 if(!uid||chosen===null){setError('No se identificó la cuenta para guardar la edad.');return false}
 try{await saveRemote(uid,chosen);setProfileAge(chosen);hide();return true}
 catch(e){if(getUser()?.uid===uid){show('required');updateValue(chosen);setError('Tu cuenta se creó, pero la edad todavía no se ha guardado. Confírmala para continuar.')}console.warn('TaskFlow V172: new account age pending',String(e?.message||e));return false}
}
function scan(){
 const uid=getUser()?.uid||'';
 if(uid===activeUid)return;
 activeUid=uid;checkingUid='';checkSeq++;
 if(!uid){if(mode==='required'||mode==='offline')hide();return}
 setTimeout(()=>{if(activeUid===uid)void checkAccount(uid)},120);
}
function start(){
 buildUI();scan();
 document.addEventListener('taskflow:firebase-auth-changed',scan);
 window.addEventListener('focus',()=>{if(activeUid&&!document.hidden&&Date.now()-lastCheck>30000){lastCheck=Date.now();void checkAccount(activeUid)}});
 window.addEventListener('online',()=>{if(activeUid)void checkAccount(activeUid,true)});
 setInterval(scan,4000);
}
window.TaskFlowAgeV172={requireAge,saveNewAge,getSelectedAge:()=>selectedAge,checkAccount,validAge,editAge,getVerifiedAge};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
