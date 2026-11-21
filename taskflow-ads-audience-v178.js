/* TaskFlow ADS V178: actividad y región GENERAL voluntarias (sin GPS, IP ni rutinas). */
(function(){
'use strict';
if(window.TaskFlowAdsAudienceV178)return;
const BASE='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-audience/';
const $=id=>document.getElementById(id),user=()=>window.TaskFlowFirebase?.getUser?.();
const REGION=/^[\p{L}\p{M} .'’()-]{2,80}$/u;
let uid='',eligible=false,enabled=false,loaded=false,pending=false,busy=false;
let lastInput=Date.now(),lastSent=0,session='';
function notice(s,warn=false){const x=$('tfAudMsg');if(x){x.textContent=s;x.classList.toggle('warn',warn)}}
async function request(path,payload){
 const u=user(),uidNow=u?.uid;
 if(!uidNow||!window.TaskFlowFirebase?.getIdToken)throw Error('AUTH_REQUIRED');
 const token=await window.TaskFlowFirebase.getIdToken(false);
 if(!token||user()?.uid!==uidNow)throw Error('ACCOUNT_CHANGED');
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8500);
 try{
  const response=await fetch(BASE+path,{method:payload===undefined?'GET':'POST',
   mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
   signal:ctl.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
   ...(payload===undefined?{}:{body:JSON.stringify(payload)})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data?.error||'SERVICE_UNAVAILABLE');
  return data;
 }finally{clearTimeout(t)}
}
function build(){
 if($('tfAudienceV178'))return;
 const box=$('tfProfileUserBox'),out=$('tfProfileSignOut');
 if(!box||!out)return;
 const wrap=document.createElement('section');wrap.id='tfAudienceV178';wrap.className='tf-aud-panel';
 wrap.innerHTML='<h3>Analítica publicitaria opcional</h3>'+
 '<p>Disponible únicamente para adultos. Estos permisos son independientes de la personalización de anuncios.</p>'+
 '<label><input type="checkbox" id="tfAudActive"> Permito medir minutos activos y sesiones aproximadas mientras uso TaskFlow.</label>'+
 '<label><input type="checkbox" id="tfAudArea"> Permito guardar voluntariamente el país y departamento o región donde vivo, sin GPS ni dirección.</label>'+
 '<div id="tfAudFields" class="tf-aud-fields" hidden><label for="tfAudCountry">País (2 letras)</label>'+
 '<input id="tfAudCountry" maxlength="2" placeholder="GT" autocomplete="off">'+
 '<label for="tfAudRegion">Departamento o región general</label>'+
 '<input id="tfAudRegion" maxlength="80" placeholder="Huehuetenango" autocomplete="off"></div>'+
 '<p>Solo se mide actividad cuando la aplicación está visible y en uso. Los registros diarios se eliminan después de 90 días. Puedes retirar los permisos cuando quieras.</p>'+
 '<div class="tf-aud-actions"><button type="button" id="tfAudSave">Guardar autorizaciones</button>'+
 '<button type="button" id="tfAudForget">Eliminar actividad y región</button></div>'+
 '<small id="tfAudMsg" role="status" aria-live="polite">Sin autorización no se registran minutos de actividad.</small>';
 box.insertBefore(wrap,out);
 $('tfAudArea').addEventListener('change',e=>{$('tfAudFields').hidden=!e.target.checked});
 $('tfAudCountry').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,2)});
 $('tfAudSave').addEventListener('click',()=>void save());
 $('tfAudForget').addEventListener('click',()=>void forget());
}
function paint(v){
 build();if(!$('tfAudActive'))return;
 eligible=v?.adultEligible===true;enabled=eligible&&v?.activityConsent===true;
 $('tfAudActive').checked=enabled;$('tfAudArea').checked=eligible&&v?.areaConsent===true;
 $('tfAudActive').disabled=!eligible;$('tfAudArea').disabled=!eligible;
 $('tfAudCountry').value=v?.areaConsent?String(v.country||''):'';
 $('tfAudRegion').value=v?.areaConsent?String(v.region||''):'';
 $('tfAudFields').hidden=!$('tfAudArea').checked;
 $('tfAudSave').disabled=!eligible;
 notice(eligible?'Permisos actualizados. Puedes modificarlos o retirarlos.':
  'Los datos de actividad solo pueden registrarse con autorización de una persona adulta.');
}
async function load(){
 const nowUid=user()?.uid||'';
 if(!nowUid){uid='';enabled=false;eligible=false;loaded=false;return}
 if(pending)return;
 uid=nowUid;pending=true;
 try{const v=await request('profile');if(user()?.uid!==nowUid)return;paint(v);loaded=true}
 catch{enabled=false;eligible=false;loaded=false;notice('No se confirmaron los permisos. La medición permanece desactivada.',true)}
 finally{pending=false}
}
function buttons(disabled){
 for(const id of ['tfAudSave','tfAudForget'])if($(id))$(id).disabled=disabled;
}
async function save(){
 if(!loaded||!eligible||busy)return notice('Es necesario confirmar una cuenta adulta.',true);
 const country=String($('tfAudCountry').value||'').trim().toUpperCase();
 const region=String($('tfAudRegion').value||'').trim().replace(/\s+/g,' ');
 const areaConsent=$('tfAudArea').checked,activityConsent=$('tfAudActive').checked;
 if(areaConsent&&(!/^[A-Z]{2}$/.test(country)||!REGION.test(region)))
  return notice('Escribe un país y una región general; no ingreses una dirección.',true);
 const actorUid=user()?.uid;
 busy=true;buttons(true);
 try{const v=await request('preferences',{activityConsent,areaConsent,country:areaConsent?country:'',region:areaConsent?region:''});
  if(user()?.uid===actorUid&&uid===actorUid){paint(v.profile);loaded=true;notice('Autorizaciones guardadas correctamente.')}
 }catch{enabled=false;notice('No se confirmaron los permisos. No se enviará actividad.',true)}
 finally{busy=false;buttons(false)}
}
async function forget(){
 if(!user()?.uid||busy)return;
 busy=true;buttons(true);enabled=false;
 const sessionUid=user().uid;
 try{const v=await request('forget',{});if(v?.ok&&sessionUid===user()?.uid){
  loaded=true;paint({adultEligible:eligible,activityConsent:false,areaConsent:false});
  notice('Se eliminó la actividad y la región guardada. Los intereses tienen otro control.');
 }}catch{notice('No se pudo confirmar la eliminación. Inténtalo nuevamente.',true)}
 finally{busy=false;buttons(false)}
}
async function beat(){
 if(!loaded||!enabled||!eligible||busy||pending||user()?.uid!==uid||
  document.visibilityState!=='visible'||navigator.onLine===false||
  window.TaskFlowNoAds?.isActive?.()===true||Date.now()-lastInput>120000||
  Date.now()-lastSent<59000)return;
 if(!session)session=typeof crypto?.randomUUID==='function'?crypto.randomUUID():'';
 if(!session)return;
 lastSent=Date.now();busy=true;
 const actorUid=user()?.uid;
 try{const result=await request('heartbeat',{sessionId:session});if(actorUid===user()?.uid&&result?.ok!==true)enabled=false}
 catch{/* Nunca fabricar minutos de actividad cuando el servidor falla. */}
 finally{busy=false}
}
function start(){
 build();
 const touching=()=>{lastInput=Date.now()};
 for(const event of ['pointerdown','touchstart','keydown'])
  document.addEventListener(event,touching,{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)lastInput=Date.now()});
 document.addEventListener('taskflow:firebase-auth-changed',()=>{
  enabled=false;eligible=false;loaded=false;uid='';session='';void load()
 });
 document.addEventListener('taskflow:ads-profile-updated',()=>{if(user())void load()});
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('#tfProfileButton'))setTimeout(()=>{build();void load()},70)
 },true);
 setInterval(()=>{if(user()&&!loaded&&!pending)void load();void beat()},60000);
 setTimeout(()=>{build();void load()},1200);
}
window.TaskFlowAdsAudienceV178=Object.freeze({refresh:load});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
