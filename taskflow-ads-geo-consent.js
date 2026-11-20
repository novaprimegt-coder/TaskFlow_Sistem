/* TaskFlow — autorización expresa de zona publicitaria.
   Nunca consulta ubicación GPS, permiso geolocation ni ubicación del reloj. */
(function(){
'use strict';
if(window.TaskFlowAdsGeoConsent)return;
const KEY='taskflow_ads_area_consent_explicit_v1:';
const PENDING='taskflow_ads_area_revoke_pending_v1:';
const ZONE='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/audience/area';
const REMOVE='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-ads-delivery/geo/withdraw';
const CSS=[
'#tfAdsGeoConsentMenu{margin:12px 10px 20px;padding:12px;border:1px solid #4386a9;border-radius:13px;background:#0c2a46;color:#d3eafa;font:13px/1.45 system-ui,sans-serif}',
'#tfAdsGeoConsentMenu strong{display:block;margin-bottom:4px;font-size:13px;color:#f0faff}',
'#tfAdsGeoConsentMenu span{display:block;margin:5px 0 10px;color:#bdd9ec}',
'#tfAdsGeoConsentMenu button{display:block;width:100%;min-height:42px;padding:9px;border-radius:10px;border:1px solid #56a4cd;background:#125d83;color:#fff;font:750 13px system-ui,sans-serif}',
'#tfAdsGeoDialog{position:fixed;max-width:calc(100vw - 24px);width:440px;max-height:calc(100dvh - 28px);overflow:auto;margin:auto;inset:0;z-index:2147483400;padding:21px;border-radius:17px;border:1px solid #60c5db;background:#0b213b;color:#f0f9ff;box-shadow:0 25px 80px #000b;font:13px/1.5 system-ui,sans-serif}',
'#tfAdsGeoDialog::backdrop{background:rgba(0,8,24,.83)}',
'#tfAdsGeoDialog h3{margin:0 0 11px;color:#f3fbff;font:850 20px/1.3 system-ui,sans-serif}',
'#tfAdsGeoDialog p{color:#c6e0ee;margin:7px 0 13px}',
'#tfAdsGeoDialog .tfads-label{display:block;margin:13px 0 5px;color:#e5f6ff;font-weight:750}',
'#tfAdsGeoDialog input[type=text]{display:block;box-sizing:border-box;width:100%;min-height:45px;padding:10px 12px;border:1px solid #5995b7;border-radius:10px;color:#fff;background:#123955;font:14px system-ui,sans-serif}',
'#tfAdsGeoDialog input::placeholder{color:#a8c2d4}',
'#tfAdsGeoDialog .tfads-consent{display:flex;align-items:flex-start;gap:10px;margin:16px 0;padding:13px;background:#123855;border:1px solid #487e9a;border-radius:12px;color:#d9ecf6}',
'#tfAdsGeoDialog .tfads-consent input{width:20px;height:20px;flex:none;margin-top:2px;accent-color:#2acde0}',
'#tfAdsGeoDialog .tfads-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}',
'#tfAdsGeoDialog .tfads-actions button{flex:1 1 auto;min-height:43px;padding:10px 12px;border:1px solid #549dbd;border-radius:10px;background:#174c70;color:#fff;font-weight:800}',
'#tfAdsGeoDialog .tfads-actions button[type=submit]{background:linear-gradient(100deg,#096be6,#0ca5c4);border-color:#6fe0ee}',
'#tfAdsGeoDialog button:disabled{opacity:.5}',
'#tfAdsGeoDialog .tfads-feedback{min-height:18px;margin:10px 0 0;color:#b4e8f8;overflow-wrap:anywhere}'
].join('\n');
const uid=()=>String(window.TaskFlowFirebase?.getUser?.()?.uid||'');
function area(){
 const account=uid();if(!account)return null;
 let data;try{data=JSON.parse(localStorage.getItem(KEY+account)||'null')}catch(_){return null}
 if(data?.consent!==true)return null;
 const country=String(data.country||'').trim().toUpperCase(),
 region=String(data.region||'').trim(),city=String(data.city||'').trim();
 if(!/^[A-Z]{2}$/.test(country)||country==='ZZ'||(city&&!region))return null;
 if([region,city].some(v=>v.length>100||!/^[\p{L}\p{M} .'’()-]*$/u.test(v)))return null;
 return {country,region,city};
}
function changed(){document.dispatchEvent(new Event('taskflow:ads-geo-preference-changed'));mount()}
async function authPost(url,body){
 const appUid=uid();const token=await window.TaskFlowFirebase?.getIdToken?.();
 if(!appUid||!token||appUid!==uid())throw Error('Inicia sesión para cambiar la preferencia.');
 const ctrl=new AbortController(),stop=setTimeout(()=>ctrl.abort(),12000);
 try{
  const resp=await fetch(url,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
   referrerPolicy:'no-referrer',signal:ctrl.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
   body:JSON.stringify(body)});
  if(!resp.ok||(await resp.json().catch(()=>null))?.ok!==true)throw Error('No se confirmó el cambio en el servidor.');
  return appUid;
 }finally{clearTimeout(stop)}
}
let dialog=null;
function openDialog(){
 if(!uid())return;
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='tfAdsGeoDialog';
  dialog.innerHTML=[
   '<form id="tfAdsGeoForm">',
   '<h3>Publicidad según la ubicación</h3>',
   '<p>Si lo autorizas, TaskFlow usará la zona que declares para elegir anuncios de tu país, región o ciudad. ',
   '<strong>No se utilizará tu GPS ni la ubicación del reloj.</strong> ',
   'Sin permiso, seguirás recibiendo anuncios generales. Puedes retirarlo en cualquier momento.</p>',
   '<label class="tfads-label" for="tfAdsGeoCountry">Código del país (2 letras, por ejemplo GT)</label>',
   '<input id="tfAdsGeoCountry" type="text" maxlength="2" autocapitalize="characters" placeholder="GT" required>',
   '<label class="tfads-label" for="tfAdsGeoRegion">Departamento o región (opcional)</label>',
   '<input id="tfAdsGeoRegion" type="text" maxlength="100" placeholder="Nombre de la región">',
   '<label class="tfads-label" for="tfAdsGeoCity">Ciudad o municipio (opcional)</label>',
   '<input id="tfAdsGeoCity" type="text" maxlength="100" placeholder="Nombre de la ciudad">',
   '<label class="tfads-consent"><input id="tfAdsGeoAllowed" type="checkbox">',
   '<span>Autorizo que esta zona declarada se utilice para segmentación publicitaria y disponibilidad de anuncios.</span></label>',
   '<div class="tfads-actions"><button id="tfAdsGeoCancel" type="button">Cerrar</button>',
   '<button id="tfAdsGeoRevoke" type="button">Retirar permiso</button>',
   '<button id="tfAdsGeoSave" type="submit">Guardar</button></div>',
   '<p id="tfAdsGeoFeedback" class="tfads-feedback" role="status" aria-live="polite"></p>',
   '</form>'
  ].join('');
  document.body.append(dialog);
  const form=dialog.querySelector('form');
  dialog.querySelector('#tfAdsGeoCancel').addEventListener('click',()=>dialog.close());
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   const feedback=dialog.querySelector('#tfAdsGeoFeedback'),button=dialog.querySelector('#tfAdsGeoSave');
   const country=dialog.querySelector('#tfAdsGeoCountry').value.trim().toUpperCase(),
    region=dialog.querySelector('#tfAdsGeoRegion').value.trim(),
    city=dialog.querySelector('#tfAdsGeoCity').value.trim();
   if(!dialog.querySelector('#tfAdsGeoAllowed').checked){feedback.textContent='Marca la casilla para autorizar la segmentación.';return}
   if(!/^[A-Z]{2}$/.test(country)||country==='ZZ'||city&&!region||[region,city].some(x=>x.length>100||!/^[\p{L}\p{M} .'’()-]*$/u.test(x))){
    feedback.textContent='Verifica el país, departamento y municipio.';return;
   }
   button.disabled=true;feedback.textContent='Guardando autorización…';
   try{
    const owner=await authPost(ZONE,{consent:true,area:{country,region,city}});
    if(owner!==uid())throw Error('La cuenta cambió.');
    localStorage.setItem(KEY+owner,JSON.stringify({consent:true,country,region,city}));
    localStorage.removeItem(PENDING+owner);
    feedback.textContent='Zona autorizada correctamente. Puedes retirar el permiso cuando quieras.';
    changed();
   }catch(error){feedback.textContent=error?.message||'No fue posible guardar el permiso.'}
   finally{button.disabled=false}
  });
  dialog.querySelector('#tfAdsGeoRevoke').addEventListener('click',async()=>{
   const feedback=dialog.querySelector('#tfAdsGeoFeedback'),owner=uid();
   if(!owner)return;
   try{localStorage.removeItem(KEY+owner);localStorage.setItem(PENDING+owner,'1')}catch(_){}
   dialog.querySelector('#tfAdsGeoAllowed').checked=false;
   changed();feedback.textContent='Segmentación desactivada. Eliminando la zona del servidor…';
   try{await authPost(REMOVE,{});if(owner===uid())localStorage.removeItem(PENDING+owner);
    feedback.textContent='Permiso retirado y zona eliminada del servidor.'}
   catch(_){feedback.textContent='Segmentación desactivada. La eliminación del servidor se reintentará cuando haya conexión.'}
  });
 }
 const current=area();
 dialog.querySelector('#tfAdsGeoCountry').value=current?.country||'';
 dialog.querySelector('#tfAdsGeoRegion').value=current?.region||'';
 dialog.querySelector('#tfAdsGeoCity').value=current?.city||'';
 dialog.querySelector('#tfAdsGeoAllowed').checked=!!current;
 dialog.querySelector('#tfAdsGeoFeedback').textContent='';
 if(!dialog.open)dialog.showModal();
}
function mount(){
 const menu=document.getElementById('sideMenu');if(!menu)return;
 let root=menu.querySelector('#tfAdsGeoConsentMenu');
 if(!root){
  root=document.createElement('section');root.id='tfAdsGeoConsentMenu';
  const title=document.createElement('strong'),state=document.createElement('span'),button=document.createElement('button');
  title.textContent='Privacidad publicitaria';state.id='tfAdsGeoCurrentState';
  button.type='button';button.textContent='Configurar anuncios por zona';button.addEventListener('click',openDialog);
  root.append(title,state,button);menu.append(root);
 }
 const state=root.querySelector('#tfAdsGeoCurrentState');
 if(state)state.textContent=area()?'Segmentación geográfica: autorizada':uid()?'Segmentación geográfica: desactivada':'Inicia sesión para configurar';
}
async function retryRemoval(){
 const owner=uid();if(!owner||area())return;
 try{if(localStorage.getItem(PENDING+owner)!=='1')return;
  await authPost(REMOVE,{});if(owner===uid())localStorage.removeItem(PENDING+owner)
 }catch(_){}
}
function boot(){
 if(!document.getElementById('tfAdsGeoConsentCss')){
  const style=document.createElement('style');style.id='tfAdsGeoConsentCss';style.textContent=CSS;document.head.append(style);
 }
 mount();
 const menu=document.getElementById('sideMenu');
 if(menu)new MutationObserver(()=>{if(!menu.querySelector('#tfAdsGeoConsentMenu'))mount()}).observe(menu,{childList:true});
 void retryRemoval();
}
window.TaskFlowAdsGeoConsent=Object.freeze({area});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
for(const name of ['taskflow:firebase-auth-changed','taskflow:account-state-updated'])
 document.addEventListener(name,()=>{mount();void retryRemoval()});
window.addEventListener('online',()=>void retryRemoval(),{passive:true});
})();