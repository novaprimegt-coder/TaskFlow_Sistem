(function(){
  'use strict';
  if(window.__tf503020V103)return;
  window.__tf503020V103=true;

  var STORAGE_KEY='taskflow_503020_v1';
  var BACKUP_KEY='taskflow_503020_v1_backup';
  var state=null;
  var memoryFallback=null;
  var observer=null;
  var previousFocus=null;

  function blankState(){return {schemaVersion:1,revision:0,salary:0,salaryUpdatedAt:null,salaryChanges:[],records:[]};}
  function validMonth(v){return /^\d{4}-\d{2}$/.test(String(v||''));}
  function monthIndex(key){var p=String(key).split('-');return (Number(p[0])||0)*12+(Number(p[1])||1)-1;}
  function monthFromIndex(idx){var y=Math.floor(idx/12),m=(idx%12)+1;return String(y).padStart(4,'0')+'-'+String(m).padStart(2,'0');}
  function shiftMonth(key,delta){return monthFromIndex(monthIndex(key)+delta);}
  function compareMonth(a,b){return monthIndex(a)-monthIndex(b);}
  function currentMonthGT(){
    try{
      var parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guatemala',year:'numeric',month:'2-digit'}).formatToParts(new Date());
      var y=parts.find(function(x){return x.type==='year';}).value;
      var m=parts.find(function(x){return x.type==='month';}).value;
      return y+'-'+m;
    }catch(_){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
  }
  function monthLabel(key){
    var p=String(key).split('-'),d=new Date(Number(p[0]),Number(p[1])-1,1,12,0,0);
    try{return new Intl.DateTimeFormat('es-GT',{month:'long',year:'numeric',timeZone:'America/Guatemala'}).format(d).replace(/^./,function(c){return c.toUpperCase();});}
    catch(_){return key;}
  }
  function fmt(amount){
    var n=Number(amount)||0;
    try{return new Intl.NumberFormat('es-GT',{style:'currency',currency:'GTQ',currencyDisplay:'narrowSymbol',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);}
    catch(_){return 'Q '+n.toFixed(2);}
  }
  function parseMoney(raw){
    var s=String(raw==null?'':raw).trim().replace(/[^0-9,.-]/g,'');
    if(!s)return NaN;
    var neg=s.indexOf('-')===0;
    s=s.replace(/-/g,'');
    var comma=s.lastIndexOf(','),dot=s.lastIndexOf('.');
    if(comma>-1&&dot>-1){
      if(dot>comma)s=s.replace(/,/g,'');
      else{s=s.replace(/\./g,'').replace(',','.');}
    }else if(comma>-1){
      var after=s.length-comma-1;
      if(after===3&&/^\d{1,3}(,\d{3})+$/.test(s))s=s.replace(/,/g,'');
      else s=s.replace(/,/g,'.');
    }else if(dot>-1){
      var parts=s.split('.');
      if(parts.length>2)s=parts.join('');
      else if(parts[1]&&parts[1].length===3&&/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
    }
    var n=Number(s);return neg?-n:n;
  }
  function clone(obj){return JSON.parse(JSON.stringify(obj));}
  function normalizeData(data){
    var out=blankState();
    if(!data||typeof data!=='object')return out;
    out.revision=Math.max(0,Number(data.revision)||0);
    out.salary=Math.max(0,Number(data.salary)||0);
    out.salaryUpdatedAt=Number(data.salaryUpdatedAt)||null;
    if(Array.isArray(data.salaryChanges)){
      out.salaryChanges=data.salaryChanges.filter(function(x){return x&&validMonth(x.month)&&Number(x.salary)>0;}).map(function(x){return {month:x.month,salary:Number(x.salary),createdAt:Number(x.createdAt)||Date.now()};});
    }
    if(Array.isArray(data.records)){
      var seen={};
      out.records=data.records.filter(function(x){return x&&validMonth(x.month)&&Number(x.salary)>0&&!seen[x.month]&&(seen[x.month]=true);}).map(function(x){
        var sal=Number(x.salary)||0;
        return {id:'503020-'+x.month,month:x.month,salary:sal,needs:Number(x.needs)||sal*.5,wants:Number(x.wants)||sal*.3,savings:Number(x.savings)||sal*.2,createdAt:Number(x.createdAt)||Date.now()};
      });
    }
    out.salaryChanges.sort(function(a,b){return compareMonth(a.month,b.month)||a.createdAt-b.createdAt;});
    out.records.sort(function(a,b){return compareMonth(b.month,a.month);});
    return out;
  }
  function parseWrapper(raw){
    try{
      var w=JSON.parse(raw||'null');
      if(!w)return null;
      if(w.data&&typeof w.data==='object')return {data:normalizeData(w.data),revision:Number(w.revision)||0,savedAt:Number(w.savedAt)||0};
      return {data:normalizeData(w),revision:Number(w.revision)||0,savedAt:Number(w.savedAt)||0};
    }catch(_){return null;}
  }
  function loadState(){
    var a=null,b=null;
    try{a=parseWrapper(localStorage.getItem(STORAGE_KEY));b=parseWrapper(localStorage.getItem(BACKUP_KEY));}catch(_){ }
    var best=null;
    if(a&&b)best=(a.revision>b.revision||(a.revision===b.revision&&a.savedAt>=b.savedAt))?a:b;
    else best=a||b;
    if(best)return normalizeData(best.data);
    if(memoryFallback)return normalizeData(memoryFallback);
    return blankState();
  }
  function persist(){
    state.revision=(Number(state.revision)||0)+1;
    var wrapper={data:clone(state),revision:state.revision,savedAt:Date.now()};
    memoryFallback=clone(state);
    try{var raw=JSON.stringify(wrapper);localStorage.setItem(STORAGE_KEY,raw);localStorage.setItem(BACKUP_KEY,raw);return true;}catch(_){return false;}
  }
  function salaryForMonth(month){
    var chosen=0;
    state.salaryChanges.forEach(function(c){if(compareMonth(c.month,month)<=0)chosen=c.salary;});
    return Number(chosen)||0;
  }
  function createRecord(month,salary){
    return {id:'503020-'+month,month:month,salary:salary,needs:salary*.50,wants:salary*.30,savings:salary*.20,createdAt:Date.now()};
  }
  function maintainRecords(saveIfChanged){
    var current=currentMonthGT(),start=shiftMonth(current,-5),changed=false;
    var before=state.records.length;
    state.records=state.records.filter(function(r){return compareMonth(r.month,start)>=0&&compareMonth(r.month,current)<=0;});
    if(state.records.length!==before)changed=true;

    state.salaryChanges.sort(function(a,b){return compareMonth(a.month,b.month)||a.createdAt-b.createdAt;});
    var first=null;
    state.salaryChanges.forEach(function(c){if(compareMonth(c.month,current)<=0&&(!first||compareMonth(c.month,first)<0))first=c.month;});
    if(first){
      var from=compareMonth(first,start)>0?first:start;
      for(var m=from;compareMonth(m,current)<=0;m=shiftMonth(m,1)){
        var exists=state.records.some(function(r){return r.month===m;});
        var sal=salaryForMonth(m);
        if(!exists&&sal>0){state.records.push(createRecord(m,sal));changed=true;}
      }
    }
    state.records.sort(function(a,b){return compareMonth(b.month,a.month);});

    if(state.salaryChanges.length){
      var baseline=null,kept=[];
      state.salaryChanges.forEach(function(c){if(compareMonth(c.month,start)<0)baseline=c;else kept.push(c);});
      if(baseline)kept.unshift(baseline);
      if(kept.length!==state.salaryChanges.length){state.salaryChanges=kept;changed=true;}
    }
    if(changed&&saveIfChanged!==false)persist();
    return changed;
  }
  function latestChange(){return state.salaryChanges.length?state.salaryChanges[state.salaryChanges.length-1]:null;}
  function saveSalary(amount){
    var current=currentMonthGT();
    var currentRecord=state.records.some(function(r){return r.month===current;});
    var effective=currentRecord?shiftMonth(current,1):current;
    var idx=-1;
    state.salaryChanges.forEach(function(c,i){if(c.month===effective)idx=i;});
    var change={month:effective,salary:amount,createdAt:Date.now()};
    if(idx>=0)state.salaryChanges[idx]=change;else state.salaryChanges.push(change);
    state.salaryChanges.sort(function(a,b){return compareMonth(a.month,b.month)||a.createdAt-b.createdAt;});
    state.salary=amount;state.salaryUpdatedAt=Date.now();
    maintainRecords(false);
    return {persisted:persist(),effective:effective,currentRecord:currentRecord};
  }

  function make(tag,cls,text){var el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;}
  const budgetGlyphs = {
    budget: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 15h3m4-2v4m3-4v4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    save: '<path d="M20 20H4V4h11l5 5v11Z"/><path d="M8 4v5h7V4m-7 16v-6h8v6"/>',
    chart: '<path d="M11 3a9 9 0 1 0 10 10H11V3Z"/><path d="M14 3.5V10h6.5A9 9 0 0 0 14 3.5Z"/>',
    home: '<path d="m3 11 9-8 9 8M5 10v10h14V10m-9 10v-6h4v6"/>',
    wants: '<path d="M5 8h14l2 13H3L5 8Z"/><path d="M9 9V6a3 3 0 1 1 6 0v3"/>',
    savings: '<path d="M4 11 12 4l8 7v9H4v-9Z"/><path d="M9 14h6m-3-3v6"/>',
    history: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M4 10h16M8 3v4m8-4v4m-7 8h6"/>',
    guide: '<path d="M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14M6 9h3m6 0h3"/>',
    trend: '<path d="M4 4v16h16M7 15l4-4 3 2 6-6m-4 0h4v4"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
  };
  function budgetIcon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+budgetGlyphs[name]+'</svg>';
  }
  function allocationRow(kind, glyph, title, percent, id) {
    const row = make('li', 'tf503020-allocation ' + kind);
    row.innerHTML = '<span class="tf503020-category-icon">'+budgetIcon(glyph)+'</span>'+
      '<span class="tf503020-bucket-title">'+title+'<small>'+percent+'%</small></span>'+
      '<strong class="tf503020-amount" id="'+id+'">—</strong>';
    return row;
  }
  function buildModal(){
    const current = document.getElementById('tf503020Overlay');
    if (current) return current;
    const overlay = make('div', 'window-container tf503020-overlay');
    overlay.id = 'tf503020Overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <section class="tf503020-shell" role="dialog" aria-modal="true" aria-labelledby="tf503020Title">
        <header class="tf503020-head">
          <span class="tf503020-brand-icon">${budgetIcon('budget')}</span>
          <div><span class="tf503020-kicker">Presupuesto mensual</span>
            <h2 class="tf503020-title" id="tf503020Title"><span>50</span>/<span>30</span>/<span>20</span></h2>
          </div>
          <button class="tf503020-close" type="button" id="tf503020Close" aria-label="Cerrar 50/30/20">${budgetIcon('close')}</button>
        </header>
        <div class="tf503020-content">
          <section class="tf503020-card tf503020-income">
            <h3 class="tf503020-heading"><span class="tf503020-section-icon">${budgetIcon('budget')}</span><label for="tf503020Salary">Ingreso mensual</label></h3>
            <div class="tf503020-income-grid">
              <div class="tf503020-money-wrap">
                <span class="tf503020-money-prefix" aria-hidden="true">Q</span>
                <input id="tf503020Salary" type="text" inputmode="decimal" autocomplete="off" placeholder="5,000.00" aria-describedby="tf503020Status" />
              </div>
              <button class="tf503020-save" type="button" id="tf503020Save">${budgetIcon('save')}Guardar ingreso</button>
            </div>
            <div class="tf503020-status" id="tf503020Status" role="status"></div>
          </section>
          <section class="tf503020-card tf503020-distribution">
            <h3 class="tf503020-heading"><span class="tf503020-section-icon">${budgetIcon('chart')}</span>Distribución mensual</h3>
            <div class="tf503020-chart">
              <div class="tf503020-donut" aria-hidden="true"><div><strong>100%</strong><small>DEL INGRESO</small></div></div>
              <ul class="tf503020-allocations"></ul>
            </div>
          </section>
          <section class="tf503020-card tf503020-history-card">
            <h3 class="tf503020-heading"><span class="tf503020-section-icon">${budgetIcon('history')}</span>Historial mensual<small>6 meses</small></h3>
            <div class="tf503020-history" id="tf503020History"></div>
          </section>
          <details class="tf503020-card tf503020-detail">
            <summary><span class="tf503020-section-icon">${budgetIcon('guide')}</span><span>Qué incluye cada categoría</span>${budgetIcon('chevron')}</summary>
            <dl>
              <div class="needs"><dt>Necesidades</dt><dd>Vivienda, servicios, seguros, alimentos, salud, transporte y cuidado personal.</dd></div>
              <div class="wants"><dt>Gastos</dt><dd>Compras, entretenimiento, comidas fuera y suscripciones.</dd></div>
              <div class="savings"><dt>Ahorro</dt><dd>Emergencias, jubilación, inversiones y pago de deudas.</dd></div>
            </dl>
          </details>
          <details class="tf503020-card tf503020-detail tf503020-wealth-card">
            <summary><span class="tf503020-section-icon">${budgetIcon('trend')}</span><span>Ruta patrimonial</span>${budgetIcon('chevron')}</summary>
            <div class="tf503020-wealth">
              <p class="tf503020-wealth-intro">Ejemplo para los primeros <strong>Q1,000</strong> ahorrados.</p>
              <div class="tf503020-wealth-split"><div><strong>Q700</strong><span>Fondo inmobiliario</span></div><div><strong>Q300</strong><span>Educación financiera</span></div></div>
              <p>Evalúa el costo de las compras recreativas frente al dinero que puedes dedicar al ahorro. Las inversiones pueden perder valor.</p>
              <div class="tf503020-wealth-reading"><h4>Lecturas recomendadas</h4><ul><li>Padre rico, padre pobre</li><li>El inversor inteligente</li><li>Piense y hágase rico</li><li>El efecto compuesto</li><li>El millonario de la puerta de al lado</li></ul></div>
            </div>
          </details>
        </div>
      </section>`;
    overlay.querySelector('.tf503020-allocations').append(
      allocationRow('needs', 'home', 'Necesidades', 50, 'tf503020Needs'),
      allocationRow('wants', 'wants', 'Gastos', 30, 'tf503020Wants'),
      allocationRow('savings', 'savings', 'Ahorro', 20, 'tf503020Savings')
    );
    document.body.appendChild(overlay);
    overlay.querySelector('#tf503020Close').addEventListener('click', closeTool);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeTool(); });
    overlay.querySelector('#tf503020Save').addEventListener('click', handleSave);
    const input = overlay.querySelector('#tf503020Salary');
    input.addEventListener('input', () => renderPreview(parseMoney(input.value)));
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); handleSave(); }
    });
    return overlay;
  }
  function ensureHubButton(){
    var hub=document.getElementById('v27MainHub');if(!hub||document.getElementById('tf503020Hub'))return;
    var btn=make('button','v27-hub-button tf503020-hub');btn.type='button';btn.id='tf503020Hub';
    btn.innerHTML='<span class="v30-hub-icon tf503020-hub-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h6M7 17h3"/><path d="M17 13v4M15 15h4"/></svg></span><span><b>50/30/20</b><small>Organiza tu salario mensual en Q</small></span><i class="fas fa-chevron-right"></i>';
    btn.addEventListener('click',openTool);hub.appendChild(btn);
  }
  function renderPreview(amount){
    var n=Number(amount);if(!Number.isFinite(n)||n<=0)n=0;
    var a=document.getElementById('tf503020Needs'),b=document.getElementById('tf503020Wants'),c=document.getElementById('tf503020Savings');
    if(a)a.textContent=n>0?fmt(n*.5):'—';if(b)b.textContent=n>0?fmt(n*.3):'—';if(c)c.textContent=n>0?fmt(n*.2):'—';
  }
  function setStatus(text,type){var el=document.getElementById('tf503020Status');if(!el)return;el.className='tf503020-status'+(type?' '+type:'');el.textContent=text||'';}
  function renderHistory(){
    var box=document.getElementById('tf503020History');if(!box)return;box.replaceChildren();
    if(!state.records.length){box.appendChild(make('div','tf503020-empty','Todavía no hay registros. Guarda un ingreso para crear el primero.'));return;}
    state.records.forEach(function(r){
      var row=make('article','tf503020-record');
      var main=make('div','tf503020-record-main');main.append(make('div','tf503020-record-month',monthLabel(r.month)),make('div','tf503020-record-salary',fmt(r.salary)),make('div','tf503020-record-lock','Registro protegido'));
      function cell(label,val){var c=make('div','tf503020-record-cell');c.append(make('span','',label),make('strong','',fmt(val)));return c;}
      row.append(main,cell('Necesidades',r.needs),cell('Gastos',r.wants),cell('Ahorro',r.savings));box.appendChild(row);
    });
  }
  function renderState(refreshRecords=true){
    if(refreshRecords)maintainRecords(true);
    var input=document.getElementById('tf503020Salary');if(input){input.value=state.salary>0?new Intl.NumberFormat('es-GT',{minimumFractionDigits:0,maximumFractionDigits:2}).format(state.salary):'';renderPreview(state.salary);}
    var current=currentMonthGT(),lc=latestChange();
    if(state.salary>0&&lc){
      if(compareMonth(lc.month,current)>0)setStatus('Nuevo ingreso desde '+monthLabel(lc.month)+'.','warn');
      else setStatus('Ingreso guardado · '+fmt(state.salary),'ok');
    }else setStatus('','');
    renderHistory();
  }
  function handleSave(){
    var input=document.getElementById('tf503020Salary');if(!input)return;
    var amount=parseMoney(input.value);
    if(!Number.isFinite(amount)||amount<=0){setStatus('Ingresa un salario válido mayor que Q0. Ejemplo: 5,000 o 50,000.','error');input.focus();return;}
    if(amount>1000000000){setStatus('El monto es demasiado alto. Revisa la cantidad ingresada.','error');input.focus();return;}
    var result=saveSalary(Math.round(amount*100)/100);
    renderState();
    if(!result.persisted)setStatus('El cálculo funciona, pero el navegador no permitió guardar el historial local.','warn');
  }
  function openTool(){
    previousFocus=document.activeElement;state=loadState();maintainRecords(true);var overlay=buildModal();renderState();overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');overlay.querySelector('.tf503020-shell').scrollTop=0;document.body.classList.add('tf503020-open');
    document.getElementById('tf503020Close').focus({preventScroll:true});
  }
  function closeTool(){var overlay=document.getElementById('tf503020Overlay');if(!overlay)return;overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('tf503020-open');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});previousFocus=null;}
  function init(){
    state=loadState();maintainRecords(true);ensureHubButton();
    window.addEventListener('storage',event=>{
      if(event.key!==STORAGE_KEY)return;
      state=loadState();
      const overlay=document.getElementById('tf503020Overlay');
      if(!overlay?.classList.contains('open'))return;
      const input=overlay.querySelector('#tf503020Salary'),editing=document.activeElement===input;
      const draft=editing?input.value:null;
      renderState(false);
      if(editing){
        input.value=draft;
        renderPreview(parseMoney(draft));
      }
    });
    observer=new MutationObserver(function(records){if(document.getElementById('tf503020Hub'))return;for(var i=0;i<records.length;i++){var m=records[i];if(m.target&&m.target.id==='v27MainHub'){ensureHubButton();return;}for(var j=0;j<m.addedNodes.length;j++){var n=m.addedNodes[j];if(n.nodeType===1&&(n.id==='v27MainHub'||n.querySelector('#v27MainHub'))){ensureHubButton();return;}}}});observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){var o=document.getElementById('tf503020Overlay');if(o&&o.classList.contains('open'))closeTool();}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
