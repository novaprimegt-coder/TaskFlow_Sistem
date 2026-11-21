/* TaskFlow V183 · Ampliación opcional de perfil publicitario.
 * Edad y consentimiento principal: TaskFlow ADS existente.
 * NUEVAS autorizaciones separadas: área de residencia declarada y tiempo ACTIVO.
 * Sin GPS/IP, sin tareas/hábitos, sin historial de navegación, sin menores.
 * El servidor privado decide la elegibilidad y conserva exclusivamente resúmenes.
 */
(function(){
 'use strict';
 if(window.TaskFlowAdsEngagementV183)return;
 const ENDPOINT='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-engagement/';
 const $=id=>document.getElementById(id);
 const account=()=>window.TaskFlowFirebase?.getUser?.()||null;
 const age=()=>window.TaskFlowAgeV172?.getVerifiedAge?.()??window.TaskFlowFirebase?.getAdsAge?.()??null;
 const allowed=()=>!!account()?.uid&&Number.isInteger(age())&&age()>=18&&window.TaskFlowFirebase?.getAdsConsent?.()===true;
 let owner='',consentActivity=false,consentRegion=false,lastTick=0,working=false,visibleSince=0,nonce=0;
 const REGION_PATTERN=/^[\p{L}\p{M} .'-]{2,64}$/u;
 const REGION_CODE=/^[A-Z]{2}$/;
 const escapeText=s=>String(s||'').trim().slice(0,80);
 function status(text){
  const e=$('tfAdsExtraStatus');if(e)e.textContent=text;
 }
 function reset(){
  owner='';consentActivity=false;consentRegion=false;lastTick=0;visibleSince=0;
  if($('tfAdsExtraActivity'))$('tfAdsExtraActivity').checked=false;
  if($('tfAdsExtraRegionConsent'))$('tfAdsExtraRegionConsent').checked=false;
  if($('tfAdsExtraRegion'))$('tfAdsExtraRegion').value='';
  if($('tfAdsExtraCountry'))$('tfAdsExtraCountry').value='';
  if($('tfAdsExtraPanel'))$('tfAdsExtraPanel').hidden=true;
 }
 async function api(action,payload={},keepalive=false){
  const uid=account()?.uid;
  if(!uid||!window.TaskFlowFirebase?.getIdToken)throw new Error('Inicia sesión en TaskFlow.');
  const token=await window.TaskFlowFirebase.getIdToken(false);
  if(!token||account()?.uid!==uid)throw new Error('La sesión cambió.');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9500);
  try{
   const response=await fetch(ENDPOINT+action,{
    method:'POST',mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',
    keepalive,signal:controller.signal,
    headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
    body:JSON.stringify(payload)
   });
   const data=await response.json().catch(()=>({}));
   if(!response.ok||!data||data.ok!==true)throw new Error(response.status===404?'La ampliación del perfil todavía no está habilitada.':'No se pudo confirmar la preferencia con el servidor.');
   if(account()?.uid!==uid)throw new Error('La sesión cambió.');
   return data;
  }finally{clearTimeout(timeout)}
 }
 function renderPrefs(p){
  if(!allowed()){reset();return}
  const v=!!p?.activityConsent,r=!!p?.residenceConsent;
  consentActivity=v;consentRegion=r;owner=account().uid;
  if($('tfAdsExtraActivity'))$('tfAdsExtraActivity').checked=v;
  if($('tfAdsExtraRegionConsent'))$('tfAdsExtraRegionConsent').checked=r;
  if($('tfAdsExtraRegion'))$('tfAdsExtraRegion').value=r?String(p.region||''):'';
  if($('tfAdsExtraCountry'))$('tfAdsExtraCountry').value=r?String(p.country||''):'';
  if($('tfAdsExtraPanel'))$('tfAdsExtraPanel').hidden=false;
  visibleSince=consentActivity&&!document.hidden?Date.now():0;
  lastTick=visibleSince;
  status(v||r?'Permisos guardados. Puedes retirarlos cuando quieras.':'Estos datos adicionales no se recopilan sin tu permiso.');
 }
 function ensure(){
  if($('tfAdsExtraPanel'))return;
  const box=$('tfProfileUserBox'),anchor=box?.querySelector('.tf-ads-age-settings'),signOut=$('tfProfileSignOut');
  if(!box||!signOut||!anchor)return;
  const p=document.createElement('section');p.id='tfAdsExtraPanel';p.className='tf-ads-extra-panel';p.hidden=true;
  p.setAttribute('aria-label','Preferencias adicionales de publicidad');
  p.innerHTML='<h3>Publicidad · Preferencias adicionales</h3>'+
   '<p>Opcional para adultos con personalización autorizada. El área declarada y el tiempo de actividad requieren autorización independiente. No recopilamos ubicación GPS.</p>'+
   '<label class="tf-ads-extra-check"><input id="tfAdsExtraRegionConsent" type="checkbox"> Autorizo usar únicamente mi país y región/departamento de residencia declarados para ajustar anuncios.</label>'+
   '<div class="tf-ads-extra-fields"><label>País (código de dos letras)<input id="tfAdsExtraCountry" type="text" maxlength="2" placeholder="GT" autocomplete="off"></label>'+
   '<label>Región o departamento, sin dirección<input id="tfAdsExtraRegion" type="text" maxlength="64" placeholder="Departamento o región" autocomplete="off"></label></div>'+
   '<label class="tf-ads-extra-check"><input id="tfAdsExtraActivity" type="checkbox"> Autorizo registrar resúmenes del tiempo en que TaskFlow está visible y la franja horaria general para mejorar los anuncios. No se registran actividades, tareas ni navegación.</label>'+
   '<div class="tf-ads-extra-actions"><button type="button" id="tfAdsExtraSave">Guardar permisos</button><button type="button" id="tfAdsExtraClear">Retirar y eliminar datos</button></div>'+
   '<small id="tfAdsExtraStatus" aria-live="polite">Los dos permisos están desactivados de forma predeterminada.</small>';
  anchor.after(p);
  const css=document.createElement('style');css.id='tfAdsExtraStyleV183';
  css.textContent='.tf-ads-extra-panel{margin:12px 0;padding:15px;border:1px solid rgba(69,197,226,.39);border-radius:14px;background:linear-gradient(150deg,#0f3856,#09243e);color:#e4f8ff;display:grid;gap:12px}.tf-ads-extra-panel[hidden]{display:none!important}.tf-ads-extra-panel h3{margin:0;color:#eaffff;font:800 14px/1.4 system-ui}.tf-ads-extra-panel p,.tf-ads-extra-panel small{margin:0;color:#b7d9eb;font:500 11px/1.6 system-ui}.tf-ads-extra-check{display:flex;gap:10px;align-items:flex-start;color:#e2f5ff;font:600 11px/1.5 system-ui}.tf-ads-extra-check input{width:19px;height:19px;min-width:19px;accent-color:#24c5e5}.tf-ads-extra-fields{display:grid;grid-template-columns:1fr 2fr;gap:9px}.tf-ads-extra-fields label{display:grid;gap:6px;color:#b6d9e7;font:650 11px/1.4 system-ui}.tf-ads-extra-fields input{width:100%;min-width:0;min-height:39px;padding:9px;border:1px solid #377ea2;border-radius:9px;background:#102f4b;color:#fff;font:600 12px system-ui}.tf-ads-extra-actions{display:flex;gap:8px;flex-wrap:wrap}.tf-ads-extra-actions button{min-height:39px;flex:1 1 160px;padding:9px 12px;border:1px solid #319aba;border-radius:9px;background:#104d74;color:#effbff;font-weight:750}@media(max-width:430px){.tf-ads-extra-fields{grid-template-columns:1fr}}';
  document.head.append(css);
  $('tfAdsExtraSave').addEventListener('click',()=>void save());
  $('tfAdsExtraClear').addEventListener('click',()=>void clear());
  $('tfAdsExtraRegionConsent').addEventListener('change',()=>{
   const on=$('tfAdsExtraRegionConsent').checked;
   $('tfAdsExtraRegion').disabled=!on;$('tfAdsExtraCountry').disabled=!on;
  });
 }
 async function load(){
  ensure();
  const uid=account()?.uid;
  if(!allowed()){reset();return}
  if(owner===uid)return;
  owner=uid;consentActivity=false;consentRegion=false;
  status('Consultando permisos en el servidor…');
  try{const p=await api('preferences/get');if(account()?.uid!==uid)return;renderPrefs(p)}
  catch(e){
   consentActivity=false;consentRegion=false;visibleSince=0;lastTick=0;
   if($('tfAdsExtraPanel'))$('tfAdsExtraPanel').hidden=false;
   status(e.message+' No se recopilan datos adicionales.');
  }
 }
 async function save(){
  if(working||!allowed())return;
  const country=String($('tfAdsExtraCountry')?.value||'').trim().toUpperCase();
  const region=String($('tfAdsExtraRegion')?.value||'').trim();
  const residenceConsent=$('tfAdsExtraRegionConsent')?.checked===true;
  const activityConsent=$('tfAdsExtraActivity')?.checked===true;
  if(residenceConsent&&(!REGION_CODE.test(country)||!REGION_PATTERN.test(region))){
   status('Para autorizar el área, introduce país de dos letras y región o departamento válido.');return
  }
  const uid=account().uid;working=true;status('Guardando permisos en servidor…');
  try{
   const p=await api('preferences/set',{residenceConsent,activityConsent,
    country:residenceConsent?country:'',region:residenceConsent?region:''});
   if(account()?.uid===uid)renderPrefs(p);
  }catch(e){status(e.message+' Los permisos pendientes no se han aplicado.')}
  finally{working=false}
 }
 async function clear(){
  if(working||!account()?.uid)return;
  working=true;status('Retirando autorizaciones y eliminando registros…');
  const uid=account().uid;
  consentActivity=false;consentRegion=false;visibleSince=0;lastTick=0;
  try{
   const r=await api('preferences/clear');
   if(account()?.uid===uid)renderPrefs(r);
  }catch(e){status(e.message+' No se ha confirmado la eliminación. No se enviarán nuevas mediciones.')}
  finally{working=false}
 }
 const localBlock=()=>{
  const h=new Date().getHours();
  return h<6?'night':h<12?'morning':h<18?'afternoon':'evening';
 };
 async function pulse(){
  const uid=account()?.uid;
  if(!consentActivity||!allowed()||uid!==owner||document.hidden||!visibleSince||!lastTick)return;
  const now=Date.now(),seconds=Math.floor((now-lastTick)/1000);
  if(seconds<30)return;
  lastTick=now;
  // Ni sesiones completas, ni eventos individuales, ni historial de páginas.
  // Un único resumen del tiempo visible a intervalos; idempotencia en servidor.
  const eventId=typeof crypto.randomUUID==='function'?crypto.randomUUID():null;
  if(!eventId)return;
  try{await api('session/record',{eventId,seconds:Math.min(seconds,90),block:localBlock()},true)}
  catch(_){/* La medición es opcional y nunca bloquea la aplicación. */}
 }
 function visibility(){
  if(document.hidden){
   void pulse();visibleSince=0;lastTick=0;
  }else{
   visibleSince=allowed()&&consentActivity?Date.now():0;
   lastTick=visibleSince;
  }
 }
 function refresh(){
  const uid=account()?.uid||'';
  if(!uid||!allowed()){reset();return}
  if(owner!==uid){owner='';void load()}
 }
 function start(){
  ensure();refresh();
  document.addEventListener('taskflow:firebase-auth-changed',refresh);
  document.addEventListener('taskflow:age-updated',refresh);
  document.addEventListener('taskflow:ads-profile-updated',refresh);
  document.addEventListener('visibilitychange',visibility);
  document.addEventListener('click',e=>{
   if(e.target?.closest?.('#tfProfileButton'))setTimeout(()=>{owner='';void load()},160);
  },true);
  window.addEventListener('pagehide',()=>{void pulse();visibleSince=0;lastTick=0});
  setInterval(()=>{if(!document.hidden)void pulse()},60000);
  // Firebase y el perfil se crean de forma diferida en TaskFlow.
  setInterval(()=>{if(!window.TaskFlowFirebase||!$('tfAdsExtraPanel'))ensure();if(!owner&&allowed())void load()},10000);
 }
 window.TaskFlowAdsEngagementV183=Object.freeze({refresh,openPreferences:load});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
