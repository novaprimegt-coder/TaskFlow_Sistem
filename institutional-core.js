/* TaskFlow Institucional: módulo puro, sin modificar los datos nativos.
 * Conserva fecha/hora literales; nunca infiere un plazo que el correo no expresa.
 */
(function (root, factory) {
  const moduleExports = factory();
  if (typeof module === 'object' && module.exports) module.exports = moduleExports;
  if (root) root.TaskFlowInstitutionalCore = moduleExports;
})(typeof globalThis === 'object' ? globalThis : null, function () {
  'use strict';
  const MS_DAY = 86400000;
  const MONTHS = new Map(Object.entries({
    enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6,
    julio:7, agosto:8, septiembre:9, setiembre:9, octubre:10,
    noviembre:11, diciembre:12, january:1, february:2, march:3,
    april:4, may:5, june:6, july:7, august:8, september:9,
    october:10, november:11, december:12
  }));
  function cleanText(value) { return String(value == null ? '' : value).normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim(); }
  function normalized(value) { return cleanText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function normalizeCategory(name) {
    const value = cleanText(name).replace(/\s+/g, ' ');
    if (!value || value.length > 80) throw new Error('CATEGORY_INVALID');
    return value;
  }
  function validDate(year, month, day) {
    if (!Number.isInteger(year) || year < 2000 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 31) return false;
    const d = new Date(Date.UTC(year, month-1, day));
    return d.getUTCFullYear() === year && d.getUTCMonth()+1 === month && d.getUTCDate() === day;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function dateString(y,m,d) { return `${y}-${pad2(m)}-${pad2(d)}`; }
  function shiftDate(date, days) {
    const [y,m,d] = String(date).split('-').map(Number);
    if (!validDate(y,m,d)) throw new Error('DATE_INVALID');
    const next = new Date(Date.UTC(y,m-1,d+days));
    return dateString(next.getUTCFullYear(), next.getUTCMonth()+1, next.getUTCDate());
  }
  function tzParts(timestamp, zone) {
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(timestamp));
    const o={}; for (const part of parts) if (part.type!=='literal') o[part.type]=Number(part.value);
    return o;
  }
  function localToEpoch(date, time, timeZone) {
    const [y,m,d] = String(date).split('-').map(Number);
    if (!validDate(y,m,d)) throw new Error('DATE_INVALID');
    const [h,min] = String(time).split(':').map(Number);
    if (!Number.isInteger(h)||h<0||h>23||!Number.isInteger(min)||min<0||min>59) throw new Error('TIME_INVALID');
    const zone=timeZone||'UTC';
    const guessed=Date.UTC(y,m-1,d,h,min);
    let result=guessed;
    for(let i=0;i<4;i++){
      const p=tzParts(result,zone);
      const observed=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
      const correction=guessed-observed;
      if(Math.abs(correction)<1000) break;
      result+=correction;
    }
    const actual=tzParts(result,zone);
    if(actual.year!==y||actual.month!==m||actual.day!==d||actual.hour!==h||actual.minute!==min) throw new Error('DST_INVALID_LOCAL_TIME');
    return result;
  }
  function extractDeadline(text) {
    const source=cleanText(text);
    // Exigir que el mensaje mencione explícitamente entrega/vencimiento.
    const context=/(?:fecha\s+(?:l[ií]mite|de\s+entrega)|(?:se\s+)?(?:debe(?:r[aá])?\s+)?entregar|(?:vence|vencimiento|entrega)|(?:plazo|deadline|due(?:\s+date)?|submit\s+by|submission\s+date)|(?:para\s+el\s+d[ií]a))\s*[:\-–]?\s*/gi;
    let hit, candidates=[];
    while((hit=context.exec(source))!==null){
      const tail=source.slice(hit.index+hit[0].length,hit.index+hit[0].length+125).split(/[\n.!?]/)[0];
      const dateRe=/(?:\b(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(20\d{2})\b)|(?:\b(20\d{2})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})\b)|(?:\b(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)\s+(?:de\s+)?(20\d{2})\b)/i;
      const m=tail.match(dateRe); if(!m)continue;
      let y,mo,d;
      if(m[1]){d=+m[1];mo=+m[2];y=+m[3];}
      else if(m[4]){y=+m[4];mo=+m[5];d=+m[6];}
      else {d=+m[7];mo=MONTHS.get(normalized(m[8]));y=+m[9];}
      if(!validDate(y,mo,d))continue;
      const rest=tail.slice(m.index+m[0].length);
      const timeMatch=rest.match(/(?:\s*(?:a\s+las|a\s+la|hasta\s+las|at|hora\s*:|,)?\s*)(\d{1,2})\s*:\s*(\d{2})\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i);
      let time=null;
      if(timeMatch){let hour=Number(timeMatch[1]),min=Number(timeMatch[2]);const ap=String(timeMatch[3]||'').toLowerCase().replace(/[.\s]/g,'');
        if(min>59||hour>23||ap&&hour>12||ap&&hour<1)continue;
        if(ap==='pm'&&hour!==12)hour+=12;
        if(ap==='am'&&hour===12)hour=0;
        if(hour>23)continue;
        time=pad2(hour)+':'+pad2(min);
      }
      candidates.push({date:dateString(y,mo,d),time});
    }
    if(!candidates.length)return {status:'missing'};
    const variants=[...new Map(candidates.map(x=>[x.date+'|'+(x.time||''),x])).values()];
    if(variants.length>1)return {status:'ambiguous',options:variants};
    return {status:'exact',...variants[0]};
  }
  function extractCourse(subject,body){
    const text=cleanText(subject)+'\n'+cleanText(body).slice(0,900);
    const expr=/(?:^|[\n;])\s*(?:curso|asignatura|materia|clase|departamento|[aá]rea|equipo|proyecto|course|subject|department)\s*[:\-–]\s*([^\n;,.:]{3,90})/gim;
    const matches=[...text.matchAll(expr)];
    for(const m of matches){const value=cleanText(m[1]).replace(/\s+/g,' ');
      if(value.length>=3 && !/^(?:tarea|examen|actividad|entrega|reuni[oó]n)\b/i.test(value))return value;
    }
    // '[Filosofía del Derecho] Tarea' es una identificación explícita del remitente.
    const bracket=cleanText(subject).match(/^\[([^\]]{3,80})\]\s*(?:tarea|actividad|entrega|assignment|project)\b/i);
    return bracket?cleanText(bracket[1]):null;
  }
  function looksLikeAssignment(subject,body){
    const source=(cleanText(subject)+'\n'+cleanText(body)).slice(0,6000);
    // No convertir simples avisos o correos que solo contienen fechas.
    return /\b(tarea|trabajo|actividad|asignaci[oó]n|entregar|entrega|proyecto|informe|ejercicio|evaluaci[oó]n|assignment|homework|submission|submit|due|deadline)\b/i.test(source);
  }
  function analyzeMessage(message){
    const subject=cleanText(message?.subject).replace(/\s+/g,' ');
    const body=cleanText(message?.body).slice(0,20000);
    if(!looksLikeAssignment(subject,body))return {type:'ignored',reason:'not_assignment'};
    const extracted=extractDeadline(subject+'\n'+body);
    if(extracted.status!=='exact')return {type:'review',reason:'deadline_'+extracted.status,subject,course:extractCourse(subject,body),options:extracted.options||[]};
    return {type:'assignment',title:(subject||'Tarea institucional').slice(0,180),course:extractCourse(subject,body),deadlineDate:extracted.date,deadlineTime:extracted.time};
  }
  function calculateWindow(task,timeZone){
    const date=String(task.deadlineDate||''); const time=task.deadlineTime||null;
    const zone=timeZone||'UTC';
    if(time){
      return {activeAt:localToEpoch(shiftDate(date,-2),time,zone),dueAt:localToEpoch(date,time,zone),deadlineDate:date,deadlineTime:time};
    }
    // En entrega sin hora indicada, respetar todo el día límite;
    // la falta se registra al comenzar el día siguiente, sin inventar una hora de entrega.
    return {activeAt:localToEpoch(shiftDate(date,-2),'00:00',zone),dueAt:localToEpoch(shiftDate(date,1),'00:00',zone),deadlineDate:date,deadlineTime:null};
  }
  function statusAt(task,now=Date.now()){
    if(task.completedAt||task.status==='completed'||task.status==='completed_late')return task.failedAt?'completed_late':'completed';
    if(!Number.isFinite(+task.dueAt)||!Number.isFinite(+task.activeAt))return 'review';
    if(now>=+task.dueAt)return 'incomplete';
    if(now>=+task.activeAt)return 'active';
    return 'scheduled';
  }
  function importMessages(store, messages, now=Date.now()) {
    const state={...store,categories:[...(store?.categories||[])],courses:[...(store?.courses||[])],tasks:[...(store?.tasks||[])],review:[...(store?.review||[])]};
    const account=store?.account;
    if(!account||!account.id||!account.categoryName||!account.timeZone)throw new Error('ACCOUNT_CONFIG_REQUIRED');
    const catName=normalizeCategory(account.categoryName);
    const catKey=normalized(catName);
    let category=state.categories.find(x=>normalized(x.name)===catKey&&x.accountId===account.id);
    if(!category){category={id:'c_'+state.categories.length+1,name:catName,accountId:account.id};state.categories.push(category);}
    for(const message of messages){
      const msgId=cleanText(message.id);if(!msgId)continue;
      if(state.tasks.some(x=>x.accountId===account.id&&x.messageId===msgId)||state.review.some(x=>x.accountId===account.id&&x.messageId===msgId))continue;
      const analysed=analyzeMessage(message);
      if(analysed.type==='ignored')continue;
      let course=null;
      if(analysed.course){
        const key=normalized(analysed.course);
        course=state.courses.find(x=>x.categoryId===category.id&&normalized(x.name)===key);
        if(!course){course={id:'s_'+state.courses.length+1,categoryId:category.id,name:analysed.course};state.courses.push(course);}
      }
      if(analysed.type==='review'){state.review.push({accountId:account.id,messageId:msgId,categoryId:category.id,courseId:course?.id||null,subject:analysed.subject,reason:analysed.reason});continue;}
      const window=calculateWindow(analysed,account.timeZone);
      state.tasks.push({id:'t_'+state.tasks.length+1,accountId:account.id,messageId:msgId,categoryId:category.id,courseId:course?.id||null,title:analysed.title,...window,status:statusAt({...window},now),completedAt:null,failedAt:null});
    }
    return state;
  }
  function reconcile(store,now=Date.now()){
    return {...store,tasks:(store.tasks||[]).map(t=>{
      if(t.completedAt)return {...t,status:t.failedAt?'completed_late':'completed'};
      const status=statusAt(t,now);
      return {...t,status,failedAt:status==='incomplete'?(t.failedAt||now):t.failedAt};
    })};
  }
  function complete(store,taskId,now=Date.now()){
    let found=false;
    const tasks=(store.tasks||[]).map(t=>{
      if(t.id!==taskId)return t;
      found=true;
      const due=+t.dueAt;
      const late=Boolean(t.failedAt)||now>=due;
      return {...t,completedAt:now,failedAt:late?(t.failedAt||now):null,status:late?'completed_late':'completed'};
    });
    if(!found)throw new Error('TASK_NOT_FOUND');
    return {...store,tasks};
  }
  return Object.freeze({analyzeMessage,extractDeadline,extractCourse,normalizeCategory,normalized,calculateWindow,statusAt,importMessages,reconcile,complete,shiftDate,localToEpoch});
});