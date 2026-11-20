/* TaskFlow V173: edición de perfil por cuenta.
   No modifica contraseñas, suscripciones ni permisos publicitarios.
   Nombre/correo usan Firebase Auth; edad usa el selector V172;
   la foto continúa usando el guardado privado de perfil existente. */
(function(){
'use strict';
if(window.__tfProfileEditorV173)return;
window.__tfProfileEditorV173=true;
const $=id=>document.getElementById(id);
let editing='',busy=false,refreshAt=0,lastUid='';
const user=()=>window.TaskFlowFirebase?.getUser?.()||null;
const auth=()=>window.TaskFlowFirebase;
function message(text,tone=''){
 const el=$('tfpeMessage');if(!el)return;
 el.textContent=text||'';el.dataset.tone=tone;
}
function icon(name){
 const paths={edit:'M16 4l4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11L4 20Z',clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'};
 return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.edit)+'"/></svg>';
}
function makeButton(text,id){
 const b=document.createElement('button');b.id=id;b.type='button';b.className='tfpe-edit-button';
 b.innerHTML=icon('edit');const t=document.createElement('span');t.textContent=text;b.appendChild(t);return b;
}
function ensure(){
 const box=$('tfProfileUserBox');if(!box||$('tfpePanel'))return;
 const rows=[...box.querySelectorAll('.tf-profile-userrow')].filter(r=>r.querySelector('strong'));
 const nameRow=rows.find(r=>r.querySelector('#tfProfileUserName'));
 const emailRow=rows.find(r=>r.querySelector('#tfProfileUserEmail'));
 if(!nameRow||!emailRow)return;
 nameRow.classList.add('tfpe-user-row');emailRow.classList.add('tfpe-user-row');
 const nameButton=makeButton('Editar','tfpeEditName');nameButton.setAttribute('aria-label','Editar nombre de perfil');nameRow.appendChild(nameButton);
 const emailButton=makeButton('Editar','tfpeEditEmail');emailButton.setAttribute('aria-label','Cambiar correo electrónico');emailRow.appendChild(emailButton);
 const ageRow=document.createElement('div');ageRow.id='tfpeAgeRow';ageRow.className='tf-profile-userrow tfpe-user-row';
 const ageLabel=document.createElement('span');ageLabel.textContent='Edad declarada';
 const value=document.createElement('strong');value.id='tfProfileAgeValue';value.textContent='Sin registrar';
 const ageButton=makeButton('Editar','tfpeEditAge');ageButton.setAttribute('aria-label','Cambiar edad');
 ageRow.append(ageLabel,value,ageButton);
 const photo=box.querySelector('.tf-profile-photo-tools');
 if(photo)photo.before(ageRow);else emailRow.after(ageRow);
 const panel=document.createElement('section');panel.id='tfpePanel';panel.className='tfpe-panel';panel.hidden=true;
 panel.setAttribute('aria-label','Editar datos de mi cuenta');
 panel.innerHTML='<div class="tfpe-panel-heading"><strong id="tfpeHeading">Editar perfil</strong><button id="tfpeCancel" type="button" aria-label="Cerrar edición">×</button></div>'+
  '<div id="tfpeNameForm" class="tfpe-form" hidden><label for="tfpeName">Nombre visible</label><input id="tfpeName" autocomplete="name" type="text" minlength="2" maxlength="80" placeholder="Tu nombre"/><button id="tfpeSaveName" type="button" class="tfpe-save">Guardar nombre</button></div>'+
  '<div id="tfpeEmailForm" class="tfpe-form" hidden><label for="tfpeEmail">Nuevo correo electrónico</label><input id="tfpeEmail" autocomplete="email" type="email" maxlength="180" placeholder="nuevo@correo.com"/><label for="tfpePassword">Contraseña actual (confirmación de seguridad)</label><input id="tfpePassword" autocomplete="current-password" type="password" maxlength="128" placeholder="Tu contraseña actual"/><p class="tfpe-note">Te enviaremos un enlace de verificación al correo nuevo. El correo actual seguirá funcionando hasta que completes la verificación.</p><button id="tfpeSaveEmail" type="button" class="tfpe-save">Enviar verificación</button></div>'+
  '<p id="tfpeMessage" class="tfpe-message" role="status" aria-live="polite"></p>';
 if(photo)photo.before(panel);else ageRow.after(panel);
 nameButton.addEventListener('click',()=>open('name'));
 emailButton.addEventListener('click',()=>open('email'));
 ageButton.addEventListener('click',()=>{close();const ok=window.TaskFlowAgeV172?.editAge?.();if(!ok)message('No se pudo abrir el selector. Inicia sesión e inténtalo de nuevo.','error')});
 $('tfpeCancel').addEventListener('click',close);
 $('tfpeSaveName').addEventListener('click',()=>{void saveName()});
 $('tfpeSaveEmail').addEventListener('click',()=>{void sendEmailChange()});
 for(const [id,call] of [['tfpeName',saveName],['tfpeEmail',sendEmailChange],['tfpePassword',sendEmailChange]]){
  $(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();void call()}});
 }
 update();
}
function close(force=false){
 if(busy&&!force)return;
 editing='';const panel=$('tfpePanel');if(panel)panel.hidden=true;
 if($('tfpePassword'))$('tfpePassword').value='';
 if($('tfpeEmail'))$('tfpeEmail').value='';
 if($('tfpeName'))$('tfpeName').value='';
 message('');
}
function open(type){
 if(!user()||busy)return;
 ensure();editing=type;
 const panel=$('tfpePanel');if(!panel)return;
 panel.hidden=false;
 $('tfpeNameForm').hidden=type!=='name';
 $('tfpeEmailForm').hidden=type!=='email';
 $('tfpeHeading').textContent=type==='name'?'Editar nombre de perfil':'Cambiar correo electrónico';
 $('tfpeName').value=type==='name'?String(user()?.displayName||''):'';
 $('tfpeEmail').value='';$('tfpePassword').value='';message('');
 const input=type==='name'?$('tfpeName'):$('tfpeEmail');
 if(input)input.focus({preventScroll:true});
 panel.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function setBusy(flag){
 busy=!!flag;
 for(const id of ['tfpeEditName','tfpeEditEmail','tfpeEditAge','tfpeSaveName','tfpeSaveEmail','tfpeCancel'])if($(id))$(id).disabled=busy;
}
async function saveName(){
 if(busy||editing!=='name'||!user())return;
 const name=String($('tfpeName')?.value||'').trim();
 if(name.length<2||name.length>80){message('El nombre debe tener entre 2 y 80 caracteres.','error');return}
 if(name===String(user().displayName||'')){message('El nombre ya está actualizado.','ok');return}
 const uid=user().uid;setBusy(true);message('Guardando nombre...');
 try{
  await auth().updateAccountName(name);
  if(user()?.uid!==uid)return;
  $('tfpePanel').hidden=true;editing='';
  message('');
 }catch(e){message(friendly(e,'name'),'error')}finally{setBusy(false)}
}
async function sendEmailChange(){
 if(busy||editing!=='email'||!user())return;
 const email=String($('tfpeEmail')?.value||'').trim(),password=String($('tfpePassword')?.value||'');
 if(email.length>180||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){message('Introduce un correo electrónico válido.','error');return}
 if(email.toLowerCase()===String(user().email||'').toLowerCase()){message('Es el correo que ya utiliza esta cuenta.','error');return}
 if(!password){message('Escribe tu contraseña actual para confirmar el cambio.','error');return}
 const uid=user().uid;setBusy(true);message('Verificando seguridad y solicitando confirmación...');
 try{
  await auth().requestAccountEmailChange(email,password);
  if(user()?.uid!==uid)return;
  $('tfpePassword').value='';$('tfpeEmail').value='';
  message('Solicitud enviada. Abre el correo nuevo y confirma el enlace para completar el cambio.','ok');
 }catch(e){message(friendly(e,'email'),'error')}finally{$('tfpePassword').value='';setBusy(false)}
}
function friendly(error,kind){
 const code=String(error?.code||error?.message||error||'').toLowerCase();
 if(/wrong-password|invalid-password|invalid_login_credentials|invalid-credential|invalid_login|email_not_found|user-not-found/.test(code))return 'La contraseña actual no es correcta.';
 if(/requires-recent-login|credential-too-old|recent_login/.test(code))return 'Vuelve a iniciar sesión para autorizar este cambio.';
 if(/email-already-in-use|email_exists/.test(code))return 'Ese correo ya pertenece a otra cuenta.';
 if(/invalid-email|invalid_email/.test(code))return 'El correo nuevo no es válido.';
 if(/too-many-requests|too_many_attempts/.test(code))return 'Demasiados intentos. Vuelve a intentarlo después.';
 if(/network|timeout|failed to fetch/.test(code))return 'Comprueba la conexión a Internet e inténtalo de nuevo.';
 return kind==='email'?'No fue posible enviar la confirmación. No se ha cambiado tu correo.':'No fue posible actualizar el nombre. Inténtalo de nuevo.';
}
function update(){
 ensure();
 const u=user(),uid=u?.uid||'';
 if(uid!==lastUid){lastUid=uid;close(true)}
 const age=uid?window.TaskFlowAgeV172?.getVerifiedAge?.():null;
 if($('tfProfileAgeValue'))$('tfProfileAgeValue').textContent=Number.isInteger(age)?age+' años':'Sin registrar';
 const panel=$('tfpePanel');if(panel&&(!u||!$('tfProfileUserBox')?.classList.contains('open')))close();
}
async function refresh(){
 const uid=user()?.uid;if(!uid)return;
 const now=Date.now();if(now-refreshAt<12000)return;refreshAt=now;
 try{await auth()?.refreshAccountProfile?.();if(user()?.uid!==uid)return;update();}
 catch(_){/* El perfil continúa operativo sin conexión; no se altera ningún dato. */}
}
function bind(){
 ensure();
 document.addEventListener('taskflow:firebase-auth-changed',update);
 document.addEventListener('taskflow:profile-updated',update);
 document.addEventListener('taskflow:age-updated',update);
 document.addEventListener('click',e=>{if(e.target.closest('#tfProfileButton')){queueMicrotask(()=>{ensure();update();void refresh()})}},true);
 window.addEventListener('focus',()=>{if($('tfProfileOverlay')?.classList.contains('open'))void refresh()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&$('tfProfileOverlay')?.classList.contains('open'))void refresh()});
}
window.TaskFlowProfileEditorV173={refresh};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
