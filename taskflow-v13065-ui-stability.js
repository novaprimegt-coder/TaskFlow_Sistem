(function(){
'use strict';
if(window.__tfV13065UiStability)return;
window.__tfV13065UiStability=true;

/* V130.6.7 · Conserva únicamente los dos ajustes del buscador:
   1) lupa del buscador al tamaño visual del botón X;
   2) elimina por completo el botón de enviar, dejando únicamente X.
   La intervención visual temporal de Mentalista fue retirada para evitar saltos/parpadeos. */

const STYLE_ID='tfV13065UiStabilityStyle';

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
.search-container>i.fa-search,
.search-container .search-icon,
.tf13053-loupe{
  width:42px!important;
  height:42px!important;
  min-width:42px!important;
  min-height:42px!important;
  flex:0 0 42px!important;
  display:grid!important;
  place-items:center!important;
  font-size:30px!important;
  line-height:1!important;
  color:#50e5da!important;
  opacity:1!important;
  margin:0!important;
  filter:drop-shadow(0 0 8px rgba(80,229,218,.34))!important;
}
.search-container>i.fa-search:before{font-size:30px!important;line-height:1!important}
.tf13053-loupe svg,.search-container .search-icon svg{width:30px!important;height:30px!important;display:block!important}
.tf13053-search-btn.submit{display:none!important}
#tfSearchActionsV13053{gap:0!important}

@media(max-width:430px){
  .search-container>i.fa-search,
  .search-container .search-icon,
  .tf13053-loupe{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;flex-basis:40px!important;font-size:29px!important}
  .search-container>i.fa-search:before{font-size:29px!important}
  .tf13053-loupe svg,.search-container .search-icon svg{width:29px!important;height:29px!important}
}
`;
  document.head.appendChild(s);
}

function removeSend(){
  document.querySelectorAll('.tf13053-search-btn.submit').forEach(btn=>btn.remove());
}
function bind(){
  installStyle();
  removeSend();
  [80,220,500,900,1500].forEach(ms=>setTimeout(removeSend,ms));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
