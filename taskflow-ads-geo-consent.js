/* TaskFlow V177 — Se retira el formulario manual de ubicación publicitaria.
 * El servidor usa únicamente la ubicación de red aproximada cuando existe
 * consentimiento adulto para personalización; no se lee GPS.
 */
(function(){
 'use strict';
 const PREFIX='taskflow_ads_area_consent_explicit_v1:';
 // Neutraliza cualquier instancia anterior antes de que se renderice.
 window.TaskFlowAdsGeoConsent=Object.freeze({area:()=>null});
 function retire(){
  if(!document.head.querySelector('#tfAdsGeoRetiredV177')){
   const css=document.createElement('style');
   css.id='tfAdsGeoRetiredV177';
   css.textContent='#tfAdsGeoDialog,#tfAdsGeoConsentMenu{display:none!important}';
   document.head.append(css);
  }
  const dialog=document.getElementById('tfAdsGeoDialog');
  if(dialog){try{if(dialog.open)dialog.close()}catch(_){}dialog.remove()}
  document.getElementById('tfAdsGeoConsentMenu')?.remove();
  const uid=String(window.TaskFlowFirebase?.getUser?.()?.uid||'');
  if(uid){try{
   if(localStorage.getItem(PREFIX+uid)!==null){
    localStorage.removeItem(PREFIX+uid);
    // Permitir la revocación del registro anterior en el servidor,
    // aunque exista una marca de retirada obsoleta.
    localStorage.removeItem('taskflow_ads_area_withdrawn_v162:'+uid);
   }
  }catch(_){}}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',retire,{once:true});
 else retire();
 for(const event of ['taskflow:firebase-auth-changed','taskflow:account-state-updated']){
  document.addEventListener(event,retire);
 }
})();
