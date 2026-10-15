(function(){
'use strict';
if(window.__tfV13070ResetProgress)return;
window.__tfV13070ResetProgress=true;

/* V130.7.0 · Reinicio completo de progreso sin borrar tareas ni hábitos creados.
   Complementa V120/V121: conserva definiciones del usuario, pero reinicia XP/EXP,
   puntos, rango/nivel, rachas, progreso, completados, recompensas y fallas. */

const MAIN='taskflow_db_v26';
const BACK='taskflow_db_v26_backup';
const REC='taskflow_db_v26_recovery';
const DB_KEYS=new Set([MAIN,BACK,REC]);
const ARM_MS=12000;
let armedUntil=0;
const previousSetItem=Storage.prototype.setItem;

const norm=value=>String(value||'').replace(/([a-z0-9])([A-Z])/g,'$1_$2').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'_');
const protectedBranch=key=>/(^|_)(PROFILE|PERFIL|AUTH|ACCOUNT|CUENTA|SETTINGS|CONFIG|CONFIGURATION|PREFERENCES|PREFERENCIAS|FINANCE|FINANZAS|BUDGET|PRESUPUESTO|SALARY|SALARIO|503020)(_|$)/.test(norm(key));
const rankKey=key=>/(^|_)(RANK|RANGO)(_|$)/.test(norm(key));
const levelKey=key=>/(^|_)(LEVEL|NIVEL)(_|$)/.test(norm(key));
const progressKey=key=>/(^|_)(XP|EXP|EXPERIENCE|EXPERIENCIA|POINT|POINTS|PUNTO|PUNTOS|SCORE|LEVEL|NIVEL|RANK|RANGO|STREAK|RACHA|PROGRESS|PROGRESO|PERFECT|PERFECTO|FAIL|FAILURE|FALLA|FALLO|MISSED|PENALTY|PENALIZACION|PUNISH|PUNISHMENT|CASTIGO|REWARD|REWARDS|RECOMPENSA|RECOMPENSAS|COIN|COINS|MONEDA|MONEDAS|TOKEN|TOKENS|COMPLETED|COMPLETE|COMPLETION|COMPLETADO|COMPLETADA|DONE|FINISHED|HECHO|ALERT|ALERTA|DISCIPLINE|DISCIPLINA|UNLOCK|UNLOCKED|DESBLOQUEO|DESBLOQUEADO)(_|$)/.test(norm(key));
const completionDateKey=key=>/(COMPLET|DONE|FINISH|HECHO|SUCCESS|EXITO|FAIL|FALLA|FALLO|STREAK|RACHA|PENAL|PUNISH|CASTIGO).*(DATE|FECHA|AT|TIME|TIMESTAMP)$/.test(norm(key));

function resetScalar(value,key){
  if(rankKey(key)){
    if(typeof value==='string')return 'E';
    if(typeof value==='number')return 0;
  }
  if(levelKey(key)){
    if(typeof value==='string'&&/^\d+(?:\.\d+)?$/.test(value.trim()))return '1';
    if(typeof value==='number')return 1;
  }
  if(completionDateKey(key))return null;
  if(typeof value==='boolean')return false;
  if(typeof value==='number')return 0;
  if(typeof value==='string'){
    const t=value.trim();
    if(/^[-+]?\d+(?:\.\d+)?$/.test(t))return '0';
    if(/^(TRUE|DONE|COMPLETE|COMPLETED|FINISHED|HECHO|COMPLETADO|COMPLETADA|CUMPLIDO|CUMPLIDA)$/i.test(t))return '';
    return value;
  }
  if(Array.isArray(value))return [];
  if(value&&typeof value==='object')return {};
  return value;
}

function sanitize(value,key='',seen){
  if(value==null)return value;
  if(protectedBranch(key))return value;
  if(progressKey(key))return resetScalar(value,key);
  if(typeof value!=='object')return value;
  if(!seen)seen=new WeakMap();
  if(seen.has(value))return seen.get(value);
  if(Array.isArray(value)){
    const out=[];seen.set(value,out);
    for(let i=0;i<value.length;i++)out.push(sanitize(value[i],String(i),seen));
    return out;
  }
  const out={};seen.set(value,out);
  for(const k of Object.keys(value))out[k]=sanitize(value[k],k,seen);
  return out;
}

function sanitizeRaw(raw){
  try{
    const data=JSON.parse(raw);
    if(!data||typeof data!=='object')return raw;
    return JSON.stringify(sanitize(data));
  }catch(_){return raw}
}

function arm(){armedUntil=Date.now()+ARM_MS}
function isArmed(){return Date.now()<=armedUntil}
function isResetMarker(key){return /^taskflow_global_reset_applied_v12[01]_/.test(String(key||''))}

function sanitizeExistingDatabases(){
  for(const key of DB_KEYS){
    try{
      const raw=localStorage.getItem(key);if(!raw)continue;
      const clean=sanitizeRaw(raw);
      if(clean!==raw)previousSetItem.call(localStorage,key,clean);
    }catch(_){}
  }
}

function sanitizeSupplementalProgress(){
  const keys=[];
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('taskflow_'))keys.push(k)}}catch(_){return}
  for(const key of keys){
    if(DB_KEYS.has(key))continue;
    if(/sound|audio|playback|profile|firebase|cloud|welcome|503020|search|visual/i.test(key))continue;
    let raw=null;try{raw=localStorage.getItem(key)}catch(_){continue}
    if(raw==null)continue;
    let next=raw;
    try{
      const parsed=JSON.parse(raw);
      if(parsed&&typeof parsed==='object')next=JSON.stringify(sanitize(parsed,key));
      else if(progressKey(key))next=String(resetScalar(parsed,key));
    }catch(_){
      if(progressKey(key)){
        if(rankKey(key))next='E';
        else if(levelKey(key))next='1';
        else if(/^[-+]?\d+(?:\.\d+)?$/.test(String(raw).trim()))next='0';
      }
    }
    if(next!==raw){try{previousSetItem.call(localStorage,key,next)}catch(_){}}
  }
}

Storage.prototype.setItem=function(key,value){
  if(this===localStorage&&isResetMarker(key))arm();
  if(this===localStorage&&DB_KEYS.has(String(key))&&isArmed()){
    const args=[key,sanitizeRaw(String(value))];
    return previousSetItem.apply(this,args);
  }
  return previousSetItem.apply(this,arguments);
};

document.addEventListener('click',event=>{
  const button=event.target&&event.target.closest&&event.target.closest('#tf120ResetConfirm,#tf113ConfirmReset');
  if(!button)return;
  arm();
  sanitizeExistingDatabases();
  sanitizeSupplementalProgress();
},true);

})();
