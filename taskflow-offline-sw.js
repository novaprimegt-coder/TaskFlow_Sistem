/* TaskFlow: disponibilidad sin conexión. Solo se guardan archivos públicos,
   nunca respuestas privadas de Firebase, contraseñas ni datos de usuarios. */
'use strict';
const SHELL_CACHE='taskflow-offline-shell-t122-three-protocol-progress-20261108';
const RUNTIME_CACHE='taskflow-offline-runtime-t97-three-protocol-progress-20261108';
const MEDIA_CACHE='taskflow-offline-media-v130104';
const SDK_CACHE='taskflow-offline-sdk-firebase-12.18.0';
const PREFIX='taskflow-offline-';
const APP_FILES=["./","index.html","taskflow-loading-fhd-1080x1920.webp","taskflow-microslats.js","taskflow-mentalist-juridico-t86.js","taskflow-hub-cards-v71.css","taskflow-hub-cards-v72.css","assets/taskflow-hub-rewards-v71.svg","assets/taskflow-hub-shop-v71.svg","assets/taskflow-hub-budget-v71.svg","assets/taskflow-hub-mentalist-v71.svg","novavision-watermark.svg","taskflow-503020-inputformat.js","taskflow-503020.css","taskflow-503020.js","taskflow-firebase-v108.js","taskflow-routine-choices-v131.js","taskflow-firestore-sync-v110.js","taskflow-loader-v102.html","taskflow-profile-v108.css","taskflow-profile-v110.js","taskflow-profile-v1101.js","taskflow-profile-v111.js","taskflow-touch-v105.js","taskflow-v113.js","taskflow-v114.js","taskflow-v115.js","taskflow-v116.js","taskflow-v117.js","taskflow-v118.js","taskflow-v119.js","taskflow-v1193-spacing.js","taskflow-v120.js","taskflow-v121-resetfix.js","taskflow-v122-habit-visual.js","taskflow-v125-routine-layout.js","taskflow-v126-routine-tight.js","taskflow-v127-ui-fixes.js","taskflow-v1281-requested-layout.js","taskflow-v129-rank-visual-system.js","taskflow-v130-unified-layout.js","taskflow-v1301-bottom-gap-fix.js","taskflow-v130103-color-filters.css","taskflow-v130108-reference-ui.css","taskflow-v130110-header-mobile.css","taskflow-v130111-policy-reference.css","taskflow-v130112-policy-compact.css","taskflow-v130114-profile-reference.css","taskflow-v130120-settings-rewards.css","taskflow-ads-bridge.js","taskflow-v58-stability.js","payments/paypal/client.js","taskflow-v1302-routine-spacing.js","taskflow-v1303-routine-guard-restore.js","taskflow-v1303-routine-guard.js","taskflow-v1303-routine-stability.js","taskflow-v1304-sound.js","taskflow-v1305-search-results.js","taskflow-v13051-profile-compact.css","taskflow-v13051-profile-compact.js","taskflow-v13051-search-modal.js","taskflow-v13052-search-fix.js","taskflow-v13053-search-stability.js","taskflow-v13053-visual-polish.js","taskflow-v13054-search-complete.js","taskflow-v13058-audio-boost.js","taskflow-v13062-mentalista-search-guard.js","taskflow-v13065-ui-stability.js","taskflow-v13066-mentalist-stability.js","taskflow-v13067-mind-legal-style.js","taskflow-v13068-mind-legal-style-fix.js","taskflow-v13068-mind-legal-style.js","taskflow-v13068-sung-exact-style.js","taskflow-v13069-mission-sound.js","taskflow-v13070-mission-sound.js","taskflow-v13070-reset-progress.js","taskflow-v13073-mission-sound.js","taskflow-v13074-mind-controls-icons.js","taskflow-v13076-all-routines-reference-style.js","taskflow-v13078-mind-unified-style.js","taskflow-v99-deploy/p0.txt","taskflow-v99-deploy/p1.txt","taskflow-v99-deploy/p2.txt","taskflow-v99-deploy/q0.txt","taskflow-v99-deploy/q1.txt","taskflow-v99-deploy/q10.txt","taskflow-v99-deploy/q11.txt","taskflow-v99-deploy/q12.txt","taskflow-v99-deploy/q13.txt","taskflow-v99-deploy/q2.txt","taskflow-v99-deploy/q3.txt","taskflow-v99-deploy/q4.txt","taskflow-v99-deploy/q5.txt","taskflow-v99-deploy/q6.txt","taskflow-v99-deploy/q7.txt","taskflow-v99-deploy/q8.txt","taskflow-v99-deploy/q9.txt"];
const MEDIA_FILES=["audio/Vídeo corto de TaskFlow con ♬ sonido original(MP3).mp3","audio/notificaciones/SONIDO DE NOTIFICACIONES.mp3"];
const SDK_FILES=[
 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth-compat.js',
 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore-compat.js'
];
const base=self.registration.scope;
const keyFor=path=>new URL(path,base).href;
const staticKeys=new Set(APP_FILES.map(path=>new URL(path,base).pathname));
const mediaKeys=new Set(MEDIA_FILES.map(path=>new URL(path,base).pathname));
const sdkKeys=new Set(SDK_FILES);
const runtimePattern=/\/t57\/runtime-(?:0\d|1\d|2[0-4])\.txt$/;
async function store(cache,path){
 const url=keyFor(path);
 const response=await fetch(new Request(url,{cache:'reload',credentials:'same-origin'}));
 if(!response.ok)throw new Error('No se pudo preparar: '+path+' ('+response.status+')');
 await cache.put(url,response);
}
async function prepareShell(){
 const cache=await caches.open(SHELL_CACHE);
 // El arranque offline es obligatorio; un recurso adicional fallido no debe
 // impedir la instalación de una actualización completa del Service Worker.
 const required=new Set(['./','index.html']);
 for(let index=0;index<APP_FILES.length;index+=6){
   await Promise.all(APP_FILES.slice(index,index+6).map(async path=>{
     try{await store(cache,path)}
     catch(error){
       if(required.has(path))throw error;
       console.warn('TaskFlow: recurso opcional pendiente para modo offline:',path);
     }
   }));
 }
}
async function prepareOptional(){
 // Los archivos grandes y scripts externos no pueden impedir el arranque básico.
 const media=await caches.open(MEDIA_CACHE);
 for(const path of MEDIA_FILES){
   try{if(!(await media.match(keyFor(path))))await store(media,path)}
   catch(e){console.warn('TaskFlow: audio no guardado para uso offline:',path,e)}
 }
 const sdk=await caches.open(SDK_CACHE);
 for(const url of SDK_FILES){
   try{
     if(await sdk.match(url))continue;
     const response=await fetch(new Request(url,{mode:'no-cors',credentials:'omit',cache:'reload'}));
     if(response.ok||response.type==='opaque')await sdk.put(url,response);
   }catch(e){console.warn('TaskFlow: SDK no guardado para uso offline',e)}
 }
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
   await prepareShell();
   // Activar solo después de guardar y verificar el núcleo indispensable.
   // La música y los SDK externos se preparan después y nunca retrasan el arranque.
   await self.skipWaiting();
 })());
});
let optionalPreparation=null;
self.addEventListener('message',event=>{
 if(!event.data||event.data.type!=='TASKFLOW_PREPARE_OPTIONAL')return;
 if(!optionalPreparation)optionalPreparation=prepareOptional().finally(()=>{optionalPreparation=null});
 event.waitUntil(optionalPreparation);
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   const names=await caches.keys();
   // Mantener una copia anterior de los fragmentos hasta que la nueva versión
   // se haya visitado en línea. Nunca eliminar la única versión offline disponible.
   const oldRuntime=names.filter(n=>n.startsWith(PREFIX+'runtime-')&&n!==RUNTIME_CACHE).sort().pop();
   const keep=new Set([SHELL_CACHE,MEDIA_CACHE,SDK_CACHE,RUNTIME_CACHE,oldRuntime].filter(Boolean));
   await Promise.all(names.filter(n=>n.startsWith(PREFIX)&&!keep.has(n)).map(n=>caches.delete(n)));
   await self.clients.claim();
 })());
});
async function navigation(request){
 const cache=await caches.open(SHELL_CACHE);
 const fallback=await cache.match(keyFor('index.html'))||await cache.match(keyFor('./'));
 // En línea se actualiza el HTML. Sin red, se abre la copia completa local.
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),3500);
 try{
   const response=await fetch(request,{cache:'no-store',signal:controller.signal});
   if(response&&response.ok){
     const copy=response.clone();
     try{await cache.put(keyFor('index.html'),copy)}catch(_){/* priorizar la navegación */}
     return response;
   }
 }catch(_){/* sin Internet o red lenta */}
 finally{clearTimeout(timeout)}
 return fallback||new Response('TaskFlow necesita abrirse una vez con Internet para preparar el acceso sin conexión.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
}
/* V130.12.6: el cargador del sistema tiene prioridad de red para evitar
   versiones antiguas servidas por la caché del SW. Sin red: usar caché offline. */
async function coreLoaderNetworkFirst(request,url){
 const cache=await caches.open(SHELL_CACHE);
 const key=keyFor('taskflow-loader-v102.html');
 const ctl=new AbortController();
 const timer=setTimeout(()=>ctl.abort(),5500);
 try{
   const fresh=await fetch(new Request(url.href,{cache:'no-store',credentials:'same-origin',signal:ctl.signal}));
   if(fresh&&fresh.ok){
     try{await cache.put(key,fresh.clone())}catch(_){}
     return fresh;
   }
 }catch(_){}
 finally{clearTimeout(timer)}
 return await cache.match(key,{ignoreSearch:true})||await fetch(request);
}
/* El módulo publicitario se actualiza en línea; la copia local solo se usa sin conexión. */
async function adsBridgeNetworkFirst(request,url){
 const cache=await caches.open(SHELL_CACHE);
 const key=url.origin+url.pathname;
 const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),5500);
 try{
  const fresh=await fetch(new Request(url.href,{cache:'no-store',credentials:'same-origin',signal:ctl.signal}));
  if(fresh&&fresh.ok){try{await cache.put(key,fresh.clone())}catch(_){}return fresh}
 }catch(_){}
 finally{clearTimeout(timeout)}
 return await cache.match(key,{ignoreSearch:true})||Response.error();
}
/* Los JS/CSS cambian con frecuencia. No servir indefinidamente una copia
   obsoleta si hay Internet. Conservar caché para el uso sin conexión. */
async function freshStaticResource(request,url,event){
 const cache=await caches.open(SHELL_CACHE);
 const key=url.origin+url.pathname;
 const saved=await cache.match(key,{ignoreSearch:true});
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),saved?3200:9000);
 try{
  const fresh=await fetch(request,{cache:'no-cache',signal:controller.signal});
  if(fresh&&fresh.ok&&fresh.type!=='opaque'){
   try{event.waitUntil(cache.put(key,fresh.clone()).catch(()=>{}))}catch(_){}
   return fresh;
  }
 }catch(_){}
 finally{clearTimeout(timeout)}
 return saved||Response.error();
}
async function cachedResource(request,cacheName,url){
 const cache=await caches.open(cacheName);
 const key=url.origin===self.location.origin?url.origin+url.pathname:url.href;
 const saved=await cache.match(key,{ignoreSearch:true});
 if(saved){
   const range=request.headers.get('Range');
   if(range&&mediaKeys.has(url.pathname)){
     const m=/^bytes=(\d*)-(\d*)$/i.exec(range);
     if(m){
       const blob=await saved.blob(),total=blob.size;
       const suffix=!m[1],n=Number(m[1]||0);
       const start=suffix?Math.max(0,total-n):n;
       const end=m[2]?Math.min(total-1,Number(m[2])):total-1;
       if(start<total&&end>=start){
         const headers=new Headers(saved.headers);
         headers.set('Content-Range','bytes '+start+'-'+end+'/'+total);
         headers.set('Content-Length',String(end-start+1));
         headers.set('Accept-Ranges','bytes');
         return new Response(blob.slice(start,end+1),{status:206,headers});
       }
       return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+total}});
     }
   }
   return saved;
 }
 const response=await fetch(request);
 if(response.ok||response.type==='opaque'){
   try{await cache.put(key,response.clone())}catch(_){/* cuota o almacenamiento desactivado */}
 }
 return response;
}
async function previousRuntimeResource(url){
 const names=await caches.keys();
 const previous=names.filter(n=>n.startsWith(PREFIX+'runtime-')&&n!==RUNTIME_CACHE).sort().reverse();
 for(const name of previous){
   try{
     const old=await caches.open(name);
     // El nombre y su versión deben coincidir: nunca combinar fragmentos incompatibles.
    const saved=await old.match(url.href);
     if(saved)return saved;
   }catch(_){}
 }
 return null;
}
async function runtimeResource(request,url,event){
 const cache=await caches.open(RUNTIME_CACHE);
 const key=url.href;
 const exact=await cache.match(key);
 const saved=exact||await previousRuntimeResource(url);
 const controller=new AbortController();
 // Si hay un fragmento verificado en caché, no esperar indefinidamente por la red.
 const timeout=setTimeout(()=>controller.abort(),saved?3500:12000);
 try{
   const fresh=await fetch(request,{signal:controller.signal});
   if(fresh&&fresh.ok){
     const oldTag=saved&&(saved.headers.get('etag')||saved.headers.get('last-modified'));
     const newTag=fresh.headers.get('etag')||fresh.headers.get('last-modified');
     if(!exact||!oldTag||!newTag||oldTag!==newTag){
       try{event.waitUntil(cache.put(key,fresh.clone()).catch(()=>{}));}catch(_){}
     }
     return fresh;
   }
 }catch(_){}
 finally{clearTimeout(timeout)}
 return saved||Response.error();
}
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin===self.location.origin){
   if(!url.href.startsWith(base))return;
   if(runtimePattern.test(url.pathname)){
     event.respondWith(runtimeResource(request,url,event));return;
   }
   if(request.mode==='navigate'){
     event.respondWith(navigation(request));return;
   }
   if(staticKeys.has(url.pathname)){
     if(url.pathname===new URL('taskflow-ads-bridge.js',base).pathname){
       event.respondWith(adsBridgeNetworkFirst(request,url));return;
     }
     if(url.pathname===new URL('taskflow-loader-v102.html',base).pathname){
       event.respondWith(coreLoaderNetworkFirst(request,url));return;
     }
     if(/\.(?:js|css)$/i.test(url.pathname))event.respondWith(freshStaticResource(request,url,event));
     else event.respondWith(cachedResource(request,SHELL_CACHE,url));return;
   }
   if(mediaKeys.has(url.pathname)){
     event.respondWith(cachedResource(request,MEDIA_CACHE,url));return;
   }
 }else if(sdkKeys.has(url.href)){
   event.respondWith(cachedResource(request,SDK_CACHE,url));
 }
 // Los servicios remotos, incluidos Firebase Auth/Firestore, NO se cachean.
});
