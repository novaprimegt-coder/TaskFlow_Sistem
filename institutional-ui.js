/* Integración aislada en TaskFlow. No altera la base de tareas ni las rutinas existentes.
 * Requiere backend TaskFlow Mail configurado. */
(function(){
'use strict';
if(window.__taskflowInstitutionalUI)return;
window.__taskflowInstitutionalUI=true;
const core=window.TaskFlowInstitutionalCore;
if(!core){console.error('TaskFlow institucional: falta módulo base');return;}
const URL_BASE='https://vgjpzvkfzahziwzwwkbx.supabase.co/functions/v1/taskflow-mail';
const $=id=>document.getElementById(id);
const state={accounts:[],courses:[],tasks:[],uid:'',busy:false,lastFetch:0,initialized:false};
const PROFILE='#tfProfileOverlay';
const asText=(value)=>String(value==null?'':value);
function currentUser(){return window.TaskFlowFirebase?.getUser?.()||null}
function showMessage(msg,bad=false){const n=$('tfInstitutionalMessage');if(!n)return;n.textContent=msg||'';n.dataset.error=bad?'true':'false'}
async function call(path,options={}){
 const account=currentUser();if(!account?.uid)throw new Error('Inicia sesión en TaskFlow para conectar un correo.');
 const token=await window.TaskFlowFirebase.getIdToken();if(!token)throw new Error('No se pudo verificar tu sesión.');
 const res=await fetch(URL_BASE+path,{method:options.body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:options.body?JSON.stringify(options.body):undefined,cache:'no-store'});
 let data={};try{data=await res.json()}catch{}
 if(!res.ok)throw new Error(data?.error==='PROVIDER_NOT_CONFIGURED'?'El proveedor aún no está configurado.':data?.error==='AUTH_INVALID'?'Tu sesión ha vencido. Inicia sesión de nuevo.':'No se pudo conectar con el correo institucional.');
 if(account.uid!==currentUser()?.uid)throw Error('La sesión de TaskFlow cambió.');
 return data;
}
function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function button(cls,text,fn){const b=make('button',cls,text);b.type='button';b.addEventListener('click',fn);return b}
function dueText(task){
 if(!task.deadlineDate)return 'Fecha de entrega por confirmar';
 const [y,m,d]=task.deadlineDate.split('-').map(Number);
 const date=new Intl.DateTimeFormat('es-GT',{dateStyle:'long',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,d)));
 return 'Entrega: '+date+(task.deadlineTime?' · '+task.deadlineTime:' · sin hora indicada');
}
function taskStatus(task){return core.statusAt(task,Date.now())}
function taskItem(task,onlyActive=false){
 const row=make('div','tfi-task'),title=make('strong','tfi-task-title',task.title),note=make('small','tfi-task-date',dueText(task));
 const account=state.accounts.find(a=>a.id===task.accountId),course=state.courses.find(c=>c.id===task.courseId);
 const group=make('span','tfi-task-group',[account?.categoryName,course?.name].filter(Boolean).join(' / ')||'Curso sin identificar');
 row.append(group,title,note);
 const status=taskStatus(task);
 if(status==='active'){row.append(button('tfi-done','Marcar completada',()=>completeTask(task.id)));}
 else if(status==='incomplete'){row.append(make('em','tfi-task-failed','Incompleta: venció sin completarse.'));row.append(button('tfi-done','Completar fuera de plazo',()=>completeTask(task.id)));}
 else if(!onlyActive)row.append(make('em','tfi-task-status',status==='completed'?'Completada':status==='completed_late'?'Completada fuera de plazo':'Se activará dos días antes de la entrega'));
 return row;
}
function renderNativeActive(){
 const panel=$('windowContent');if(!panel||(panel.dataset.tf35View!=='list-tasks-active'&&!panel.className.includes('tf35-list-tasks-active')))return;
 let section=$('tfInstitutionalNativeActive');if(!section){section=make('section','tfi-native-active');section.id='tfInstitutionalNativeActive';panel.append(section)}
 const filtered=state.tasks.filter(t=>t.kind==='assignment'&&['active','incomplete'].includes(taskStatus(t)));
 const signature=filtered.map(t=>t.id+':'+taskStatus(t)+':'+(t.completedAt||'')).join('|');
 if(section.dataset.signature===signature)return;
 section.dataset.signature=signature;
 section.replaceChildren();
 if(!filtered.length){section.replaceChildren();return;}
 section.append(make('h3','tfi-native-heading','Tareas institucionales'));
 filtered.forEach(task=>section.append(taskItem(task,true)));
}
function renderList(){
 const list=$('tfInstitutionalList');if(!list)return;list.replaceChildren();
 const accounts=state.accounts;
 if(!accounts.length){list.append(make('p','tfi-muted','Conecta un correo para recibir tareas automáticamente.'));renderNativeActive();return;}
 for(const account of accounts){
  const group=make('section','tfi-account');
  group.append(make('h3','tfi-account-name',account.categoryName));
  group.append(make('small','tfi-muted',account.email+' · '+(account.provider==='google'?'Google Workspace / Gmail':'Microsoft 365 / Outlook')));
  const controls=make('div','tfi-buttons');
  controls.append(button('tfi-secondary','Sincronizar ahora',async()=>{
   showMessage('Comprobando correos...');try{await call('/sync',{body:{accountId:account.id}});await refresh(true);showMessage('Correos revisados.')}catch(e){showMessage(e.message,true)}
  }));
  controls.append(button('tfi-secondary tfi-danger','Desconectar',async()=>{
   if(!confirm('¿Desconectar este correo? No se eliminarán las tareas que ya fueron registradas.'))return;
   try{await call('/accounts/disconnect',{body:{id:account.id}});await refresh(true);showMessage('Correo desconectado.')}catch(e){showMessage(e.message,true)}
  }));
  group.append(controls);
  const rows=state.tasks.filter(t=>t.accountId===account.id&&t.kind==='assignment').sort((a,b)=>(a.dueAt||0)-(b.dueAt||0));
  if(!rows.length)group.append(make('p','tfi-muted','Todavía no se han detectado tareas con fecha de entrega.'));
  rows.forEach(task=>group.append(taskItem(task)));
  const reviews=state.tasks.filter(t=>t.accountId===account.id&&t.kind==='review');
  if(reviews.length){group.append(make('h4','tfi-review-title','Correos por revisar ('+reviews.length+')'));reviews.forEach(x=>group.append(make('p','tfi-muted',x.title+' — no hay fecha de entrega suficientemente clara.')))}
  list.append(group);
 }
 renderNativeActive();
}
function showFailures(){
 const user=currentUser();if(!user)return;
 const fails=state.tasks.filter(t=>t.kind==='assignment'&&taskStatus(t)==='incomplete');
 const n=$('tfInstitutionalFailures');if(!n)return;
 n.replaceChildren();if(!fails.length){n.hidden=true;return}
 const key='tfi_failure_seen_'+user.uid;
 let seen=[];try{seen=JSON.parse(sessionStorage.getItem(key)||'[]')}catch{}
 const unseen=fails.filter(x=>!seen.includes(x.id));
 if(!unseen.length){n.hidden=true;return;}
 n.hidden=false;n.append(make('strong','','Fallas institucionales: '+unseen.length));
 unseen.slice(0,4).forEach(x=>n.append(make('p','',x.title+' — '+dueText(x))));
 n.append(button('tfi-secondary','Entendido',()=>{try{sessionStorage.setItem(key,JSON.stringify([...new Set([...seen,...unseen.map(x=>x.id)])]))}catch{}n.hidden=true}));
}
async function refresh(force=false){
 const user=currentUser();if(!user?.uid){state.uid='';state.accounts=[];state.courses=[];state.tasks=[];renderList();showMessage('Inicia sesión en TaskFlow para conectar tu correo.');return;}
 if(state.uid!==user.uid){state.uid=user.uid;state.accounts=[];state.courses=[];state.tasks=[];state.lastFetch=0;}
 if(!force&&Date.now()-state.lastFetch<40000)return;
 try{
  const result=await call('/me');
  state.accounts=result.accounts||[];state.courses=result.courses||[];state.tasks=result.tasks||[];state.lastFetch=Date.now();
  renderList();showFailures();showMessage('');
 }catch(e){showMessage(e.message,true)}
}
async function completeTask(id){if(state.busy)return;state.busy=true;
 try{await call('/tasks/complete',{body:{id}});await refresh(true);showMessage('Se actualizó el estado de la tarea.');}
 catch(e){showMessage(e.message,true)}finally{state.busy=false}
}
async function connect(event){event.preventDefault();if(state.busy)return;
 const category=$('tfInstitutionalCategory')?.value||'',provider=$('tfInstitutionalProvider')?.value||'';
 try{core.normalizeCategory(category)}catch{showMessage('Escribe un nombre de categoría de 1 a 80 caracteres.',true);return}
 // Abrir durante gesto del usuario para permitir OAuth sin bloquear la ventana.
 let popup=null;try{popup=window.open('about:blank','taskflowOAuth','width=560,height=720,noopener=no')}catch{}
 state.busy=true;
 try{
  const timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  const {url}=await call('/auth/start',{body:{provider,categoryName:category,timeZone}});
  if(popup&&!popup.closed){popup.location.href=url}else{window.open(url,'_blank')}
  showMessage('Autoriza la lectura de correos en la ventana abierta y regresa a TaskFlow.');
 }catch(e){if(popup&&!popup.closed)popup.close();showMessage(e.message,true)}finally{state.busy=false}
}
function ensureOverlay(){if($('tfInstitutionalOverlay'))return;
 const overlay=make('div','tfi-overlay');overlay.id='tfInstitutionalOverlay';overlay.hidden=true;
 const shell=make('div','tfi-shell');shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');shell.setAttribute('aria-label','Correo institucional');
 const header=make('header','tfi-header');header.append(make('h2','','Correo institucional'));
 header.append(button('tfi-close','Cerrar',close));shell.append(header);
 shell.append(make('p','tfi-intro','Asigna un nombre a tu categoría, conecta el correo y TaskFlow organizará tareas por curso o área.'));
 const form=make('form','tfi-form');
 const categoryLabel=make('label','','Nombre de la categoría');const input=make('input','');input.id='tfInstitutionalCategory';input.name='category';input.placeholder='De la U o Del trabajo';input.maxLength=80;input.required=true;categoryLabel.append(input);
 const providerLabel=make('label','','Proveedor de correo');const select=make('select','');select.id='tfInstitutionalProvider';
 for(const [value,text] of [['google','Google Workspace / Gmail'],['microsoft','Microsoft 365 / Outlook']]){const op=make('option','',text);op.value=value;select.append(op)}providerLabel.append(select);
 form.append(categoryLabel,providerLabel);const submit=make('button','tfi-primary','Conectar correo');submit.type='submit';form.append(submit);form.addEventListener('submit',connect);shell.append(form);
 const notice=make('p','tfi-message');notice.id='tfInstitutionalMessage';notice.setAttribute('role','status');shell.append(notice);
 const list=make('div','tfi-list');list.id='tfInstitutionalList';shell.append(list);overlay.append(shell);document.body.append(overlay);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
}
function open(){ensureOverlay();$('tfInstitutionalOverlay').hidden=false;document.body.classList.add('tfi-open');void refresh(true);}
function close(){if($('tfInstitutionalOverlay'))$('tfInstitutionalOverlay').hidden=true;document.body.classList.remove('tfi-open')}
function ensureButton(){if($('tfInstitutionalOpen'))return;
 const overlay=$(PROFILE.slice(1)),parent=$('tfProfileUserBox')||overlay;
 if(!parent)return;
 const b=button('tfi-entry','Correo institucional',open);b.id='tfInstitutionalOpen';parent.append(b);
}
function bind(){ensureOverlay();ensureButton();const failNotice=make('div','tfi-failure-banner');failNotice.id='tfInstitutionalFailures';failNotice.hidden=true;document.body.append(failNotice);
 const profileObserver=new MutationObserver(()=>{if(!$('tfInstitutionalOpen'))ensureButton()});
 const attachProfile=()=>{const profile=$(PROFILE.slice(1));if(!profile)return false;ensureButton();profileObserver.observe(profile,{subtree:true,childList:true});return true};
 if(!attachProfile()){
  // El perfil Firebase puede aparecer después de DOMContentLoaded.
  const pending=new MutationObserver(()=>{if(attachProfile())pending.disconnect()});
  pending.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>pending.disconnect(),12000);
 }
 const modal=$('windowContainer');if(modal)new MutationObserver(()=>renderNativeActive()).observe(modal,{attributes:true,attributeFilter:['class'],subtree:true,childList:true});
 document.addEventListener('taskflow:firebase-auth-changed',()=>void refresh(true));
 document.addEventListener('taskflow:cloud-snapshot-applied',()=>renderNativeActive());
 window.addEventListener('focus',()=>void refresh());
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh()});
 window.addEventListener('message',e=>{if(e.origin!==new URL(URL_BASE).origin||e.data?.type!=='taskflow-mail-oauth')return;if(e.data.ok){showMessage('Correo conectado.');void refresh(true)}else showMessage('No se completó la autorización.',true)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('tfInstitutionalOverlay')?.hidden)close()});
 void refresh(true);
}
window.TaskFlowInstitutional={open,refresh,close};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();