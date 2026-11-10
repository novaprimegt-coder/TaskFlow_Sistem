/* TaskFlow V131.0 — Contención exclusiva de Progreso del protocolo.
   Dominio jurídico, Sócrates y Maquiavelo. No modifica actividades ni lógica. */
(function(){
'use strict';
if(window.__tfProtocolThreeLayoutV131)return;
window.__tfProtocolThreeLayoutV131=true;
const kinds=['tf32','tf33']; // Dominio Jurídico usa su controlador exclusivo V132.
function put(node,rules){
 if(!node)return;
 for(const [property,value] of Object.entries(rules)){
  if(node.style.getPropertyValue(property)!==value||
     node.style.getPropertyPriority(property)!=='important'){
   node.style.setProperty(property,value,'important');
  }
 }
}
function sizeText(node,size,strong){
 put(node,{'display':'block','position':'static','inset':'auto',
  'grid-column':'auto','grid-row':'auto','float':'none',
  'width':'100%','min-width':'0','max-width':'100%',
  'height':'auto','min-height':'0','max-height':'none',
  'margin':'0','padding':'0','box-sizing':'border-box',
  'white-space':'normal','overflow-wrap':'anywhere','word-break':'normal',
  'text-overflow':'clip','text-align':'center','letter-spacing':'normal',
  'font-size':size,'line-height':strong?'1.24':'1.36',
  'transform':'none','visibility':'visible'});
}
function applyCards(pro,kind){
 const grid=pro.querySelector('.'+kind+'-stats');
 if(!grid)return;
 put(grid,{'display':'grid','grid-template-columns':'repeat(3,minmax(0,1fr))',
  'grid-template-rows':'auto','grid-auto-rows':'minmax(168px,auto)',
  'align-items':'stretch','justify-content':'stretch','gap':'7px',
  'position':'relative','z-index':'3','float':'none','clear':'both',
  'width':'100%','min-width':'0','max-width':'100%',
  'height':'auto','min-height':'0','max-height':'none',
  'padding':'0','margin':kind==='tf21'?'12px 0 0':'40px 0 0',
  'box-sizing':'border-box','overflow':'visible','transform':'none'});
 const cards=Array.from(grid.children).filter(n=>n.classList.contains(kind+'-stat'));
 for(const [index,card] of cards.entries()){
  const accent=["#e8b15a","#a36be7","#18d6e3"][index%3];
  put(card,{'display':'flex','flex-direction':'column',
   'grid-template-columns':'none','grid-column':'auto','grid-row':'auto',
   'align-items':'center','justify-content':'center','align-self':'stretch',
   'justify-self':'stretch','position':'relative','inset':'auto',
   'float':'none','gap':'6px','flex-wrap':'nowrap',
   'width':'100%','min-width':'0','max-width':'100%',
   'height':'auto','min-height':'168px','max-height':'none',
   'padding':'16px 7px','margin':'0','box-sizing':'border-box',
   'text-align':'center','overflow':'hidden','transform':'none',
   'border':'2px solid '+accent,'border-radius':'22px',
   'background':'linear-gradient(155deg,#0c1530,#0a1024)',
   'box-shadow':'inset 0 1px 0 #ffffff0a,0 0 10px #00000022'});
  const icon=card.querySelector('.'+kind+'-stat-icon');
  put(icon,{'position':'relative','inset':'auto','display':'grid',
   'place-items':'center','align-self':'center','justify-self':'center',
   'grid-column':'auto','grid-row':'auto','float':'none',
   'flex-shrink':'0','margin':'0 auto','transform':'none',
   'width':'44px','height':'44px','max-width':'100%','background-color':accent});
  const body=card.querySelector('.'+kind+'-stat-body');
  put(body,{'position':'static','inset':'auto','left':'auto','display':'flex',
   'flex-direction':'column','align-items':'center','justify-content':'center',
   'grid-template-columns':'none','grid-column':'auto','grid-row':'auto',
   'gap':'5px','float':'none','flex':'0 1 auto',
   'width':'100%','min-width':'0','max-width':'100%',
   'height':'auto','min-height':'0','max-height':'none',
   'padding':'0','margin':'0','box-sizing':'border-box',
   'text-align':'center','overflow':'visible','transform':'none'});
  if(body){
   const texts=Array.from(body.children).filter(n=>n.matches('b,strong,span,small'));
   for(const leaf of texts){
    const strong=leaf.matches('b,strong');
    const size=strong?'clamp(13px,3.4vw,19px)':'clamp(9px,2.3vw,12px)';
    sizeText(leaf,size,strong);
   }
   if(card===cards[2]){
    const number=body.querySelector('b,strong');
    if(number)sizeText(number,'clamp(10px,2.4vw,15px)',true);
   }
  }
 }
}
function applyLegal(pro){
 const head=pro.querySelector('.tf21-progress-head');
 put(head,{'display':'grid',
  'grid-template-columns':'38px minmax(0,1fr) 49px',
  'grid-template-rows':'auto auto','grid-auto-flow':'row',
  'align-items':'start','justify-content':'stretch','gap':'8px 8px',
  'position':'relative','inset':'auto','float':'none',
  'width':'100%','min-width':'0','max-width':'100%',
  'height':'auto','min-height':'0','max-height':'none',
  'padding':'0','margin':'0','box-sizing':'border-box',
  'overflow':'visible','transform':'none'});
 put(head?.querySelector('.tf21-progress-icon'),{
  'position':'relative','grid-column':'1','grid-row':'1 / 3',
  'align-self':'start','justify-self':'center','inset':'auto',
  'width':'38px','height':'38px','min-width':'0','min-height':'0',
  'padding':'0','margin':'0','transform':'none'});
 const copy=head?.querySelector('.tf21-progress-label');
 put(copy,{'position':'static','inset':'auto','display':'flex',
  'flex-direction':'column','grid-column':'2','grid-row':'1',
  'gap':'4px','align-self':'start','justify-self':'stretch',
  'float':'none','width':'100%','min-width':'0','max-width':'100%',
  'height':'auto','min-height':'0','max-height':'none',
  'margin':'0','padding':'0','box-sizing':'border-box',
  'overflow':'visible','transform':'none'});
 sizeText(copy?.querySelector('strong'),'clamp(13px,3.6vw,19px)',true);
 sizeText(copy?.querySelector('small'),'clamp(10px,2.6vw,13px)',false);
 for(const leaf of copy?.children||[])put(leaf,{'text-align':'left'});
 const pill=head?.querySelector('.tf21-count-pill');
 put(pill,{'display':'flex','flex-direction':'column','align-items':'center',
  'justify-content':'center','gap':'2px','position':'static','inset':'auto',
  'grid-column':'2 / 4','grid-row':'2',
  'align-self':'start','justify-self':'start','float':'none',
  'width':'auto','min-width':'0','max-width':'100%',
  'height':'auto','min-height':'0','max-height':'none',
  'margin':'0','padding':'5px 12px','box-sizing':'border-box',
  'overflow':'visible','white-space':'normal','transform':'none'});
 for(const leaf of pill?.querySelectorAll('b,strong,small')||[]){
  sizeText(leaf,leaf.matches('b,strong')?'clamp(12px,3vw,16px)':'clamp(9px,2.2vw,11px)',leaf.matches('b,strong'));
  put(leaf,{'width':'auto','max-width':'100%','line-height':'1.18'});
 }
 const pct=head?.querySelector('.tf21-pct');
 put(pct,{'position':'static','inset':'auto','display':'block',
  'grid-column':'3','grid-row':'1','align-self':'start','justify-self':'end',
  'width':'auto','min-width':'0','max-width':'100%',
  'height':'auto','margin':'0','padding':'0',
  'font-size':'clamp(23px,5.2vw,35px)','line-height':'1.12',
  'white-space':'nowrap','letter-spacing':'normal','text-align':'right',
  'transform':'none'});
 const bar=pro.querySelector('.tf21-bar');
 put(bar,{'position':'relative','inset':'auto','display':'block',
  'width':'100%','min-width':'0','max-width':'100%',
  'height':'10px','min-height':'10px','max-height':'none',
  'margin':'11px 0 10px','padding':'0','box-sizing':'border-box',
  'transform':'none'});
 const steps=pro.querySelector('.tf21-steps');
 put(steps,{'position':'relative','display':'grid',
  'grid-template-columns':'repeat(5,minmax(0,1fr))','align-items':'center',
  'width':'100%','min-width':'0','max-width':'100%',
  'height':'auto','min-height':'30px','max-height':'none',
  'margin':'0','padding':'0','box-sizing':'border-box',
  'overflow':'visible','transform':'none'});
 for(const step of steps?.children||[])put(step,{
  'position':'relative','inset':'auto','grid-column':'auto','grid-row':'auto',
  'justify-self':'center','align-self':'center','flex-shrink':'0',
  'margin':'0','transform':'none'});
}
function applyPortrait(pro,kind){
 const copy=pro.querySelector('.'+kind+'-progress-copy');
 put(copy,{'position':'relative','inset':'auto','z-index':'2',
  'display':'flex','flex-direction':'column','gap':'4px',
  'width':'67%','min-width':'0','max-width':'67%',
  'height':'auto','min-height':'0','max-height':'none',
  'padding':'0','margin':'0','box-sizing':'border-box',
  'overflow':'visible','transform':'none'});
 sizeText(copy?.querySelector('strong'),'clamp(15px,3.3vw,23px)',true);
 sizeText(copy?.querySelector('small'),'clamp(10px,2.5vw,14px)',false);
 for(const el of copy?.children||[])put(el,{'text-align':'left'});
 put(pro.querySelector('.'+kind+'-percent'),{
  'position':'relative','inset':'auto','z-index':'2',
  'display':'block','align-self':'flex-start','float':'none',
  'width':'67%','min-width':'0','max-width':'67%',
  'height':'auto','min-height':'0','max-height':'none',
  'padding':'0','margin':'6px 0 0',
  'font-size':'clamp(25px,5.5vw,39px)','line-height':'1.16',
  'white-space':'nowrap','letter-spacing':'normal',
  'text-align':'left','transform':'none'});
 put(pro.querySelector('.'+kind+'-bar'),{
  'display':'block','position':'relative','inset':'auto','z-index':'2',
  'align-self':'flex-start','float':'none',
  'width':'67%','min-width':'0','max-width':'67%',
  'height':'10px','min-height':'10px','max-height':'none',
  'padding':'0','margin':'8px 0 0','box-sizing':'border-box',
  'transform':'none'});
}
function placeStatsBelowPortrait(pro,kind){
 const grid=pro.querySelector('.'+kind+'-stats');
 if(!grid||typeof getComputedStyle!=='function')return;
 try{
  const pseudo=getComputedStyle(pro,'::after');
  const height=parseFloat(pseudo.height),top=parseFloat(pseudo.top)||0;
  const parent=pro.getBoundingClientRect(),cards=grid.getBoundingClientRect();
  if(!Number.isFinite(height)||height<=0||!Number.isFinite(cards.top))return;
  const imageBottom=parent.top+top+height+6;
  if(cards.top<imageBottom){
   const gap=parseFloat(getComputedStyle(grid).marginTop)||40;
   put(grid,{'margin-top':Math.min(240,Math.ceil(gap+imageBottom-cards.top))+'px'});
  }
 }catch(_){}
}
function layout(){
 const panel=document.getElementById('windowContent');
 if(!panel)return;
 const kind=panel.classList.contains('tf21-legal')?'tf21':
  panel.classList.contains('tf32-socrates')?'tf32':
  panel.classList.contains('tf33-machiavelli')?'tf33':'';
 if(!kinds.includes(kind))return;
 const pro=panel.querySelector(':scope > .'+kind+'-progress');
 if(!pro)return;
 put(pro,{'position':'relative','display':'flex','flex-direction':'column',
  'align-items':'stretch','justify-content':'flex-start','gap':'0',
  'float':'none','flex':'0 0 auto',
  'width':'100%','min-width':'0','max-width':'100%',
  'height':'auto','min-height':'0','max-height':'none',
  'padding':kind==='tf21'?'14px 12px':'13px 12px',
  'box-sizing':'border-box','overflow':'hidden','isolation':'isolate',
  'transform':'none'});
 if(kind==='tf21')applyLegal(pro);
 else applyPortrait(pro,kind);
 applyCards(pro,kind);
 if(kind!=='tf21')placeStatsBelowPortrait(pro,kind);
}
let queued=false;
function schedule(){
 if(queued)return;
 queued=true;
 requestAnimationFrame(()=>{queued=false;layout()});
}
function start(){
 const panel=document.getElementById('windowContent');
 const outer=document.getElementById('windowContainer');
 if(!panel)return;
 const observer=new MutationObserver(schedule);
 observer.observe(panel,{subtree:true,childList:true});
 if(outer)new MutationObserver(schedule).observe(outer,{attributes:true,attributeFilter:['class']});
 new MutationObserver(schedule).observe(panel,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 window.addEventListener('pageshow',schedule,{passive:true});
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();