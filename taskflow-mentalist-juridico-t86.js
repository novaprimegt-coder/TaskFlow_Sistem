/* TaskFlow T86: igualar SOLO el bloque de progreso del Mentalista
   al patrón aprobado de Dominio Jurídico. Conserva 12 pruebas, precisión,
   evaluación, guías, completado, almacenamiento y demás rutinas. */
(function(){
'use strict';
if(window.__tfMentalistLegalProgressT86)return;
window.__tfMentalistLegalProgressT86=true;
const STYLE_ID='tfMentalistLegalProgressT86Style';
const ROOT='#windowContainer.mentalist-modal.open #windowContent.tfMentalistReplicaT9';
const CSS=`
${ROOT} .tfm-legal-progress{display:block!important;position:relative!important;width:100%!important;max-width:100%!important;min-width:0!important;flex:0 0 auto!important;box-sizing:border-box!important;margin:0 0 14px!important;padding:15px 16px 16px!important;border:1px solid rgba(19,225,243,.82)!important;border-radius:24px!important;background:radial-gradient(circle at 0% 0%,rgba(26,214,255,.10),transparent 28%),linear-gradient(145deg,#071725 0%,#0a1730 42%,#09122a 100%)!important;box-shadow:inset 0 0 18px rgba(39,235,255,.05),0 0 12px rgba(1,181,255,.08)!important;color:#f5faff!important}
${ROOT} .tfm-legal-progress .tf21-progress-head{display:grid!important;grid-template-columns:58px minmax(0,1fr) 141px 70px!important;gap:14px!important;align-items:center!important;min-width:0!important;min-height:68px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon{display:grid!important;place-items:center!important;width:50px!important;height:50px!important;border-radius:15px!important;background:linear-gradient(145deg,rgba(14,131,178,.26),rgba(8,33,69,.96))!important;color:#29edf3!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:29px!important;height:29px!important;stroke-width:2.1!important}
${ROOT} .tfm-legal-progress .tf21-progress-label{min-width:0!important;display:grid!important;gap:4px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:18px!important;font-weight:900!important;line-height:1.15!important;color:#fff!important}
${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:13px!important;line-height:1.35!important;color:#d8e0f2!important}
${ROOT} .tfm-legal-progress .tf21-count-pill{height:68px!important;min-width:135px!important;display:flex!important;flex-direction:column!important;gap:3px!important;align-items:center!important;justify-content:center!important;padding:5px 10px!important;border-radius:28px!important;border:1px solid rgba(188,100,255,.65)!important;background:linear-gradient(180deg,rgba(79,32,148,.92),rgba(40,18,95,.96))!important;box-shadow:inset 0 0 16px rgba(248,140,255,.08)!important;white-space:nowrap!important}
${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:22px!important;line-height:1!important;font-weight:900!important;color:#c779ff!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-count-pill small{font-size:9px!important;line-height:1.15!important;letter-spacing:.3px!important;color:#d9c4f7!important;font-weight:800!important}
${ROOT} .tfm-legal-progress .tf21-pct{font-size:44px!important;min-width:0!important;line-height:1!important;font-weight:900!important;text-align:right!important;color:#15f5f5!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-bar{height:16px!important;margin:13px 8px 11px!important;border-radius:99px!important;overflow:hidden!important;background:#101b3b!important;border:1px solid rgba(64,100,153,.32)!important;box-shadow:inset 0 2px 6px #0007!important}
${ROOT} .tfm-legal-progress .tf21-bar>i{display:block!important;width:var(--tfm-legal-pct,0%)!important;height:100%!important;border-radius:inherit!important;background:linear-gradient(90deg,#03e8ee,#1f91fa,#8859f9)!important;box-shadow:0 0 14px #12e9f97a!important;transition:width .24s ease!important}
${ROOT} .tfm-legal-progress .tf21-steps{display:grid!important;grid-template-columns:repeat(12,minmax(0,1fr))!important;gap:2px!important;position:relative!important;min-width:0!important;margin:0 4px 13px!important}
${ROOT} .tfm-legal-progress .tf21-steps::before{content:''!important;position:absolute!important;left:3%!important;right:3%!important;top:50%!important;height:2px!important;z-index:0!important;background:#1c3d68!important}
${ROOT} .tfm-legal-progress .tf21-step{position:relative!important;z-index:1!important;display:grid!important;place-items:center!important;justify-self:center!important;width:min(29px,100%)!important;aspect-ratio:1!important;border-radius:50%!important;border:1px solid rgba(77,120,209,.53)!important;background:#091936!important;color:#aec8fc!important;box-shadow:inset 0 0 10px rgba(29,84,170,.17)!important;font-size:11px!important;line-height:1!important;font-weight:750!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-step.done{background:linear-gradient(140deg,#00bfc8,#0c56c9)!important;color:#fff!important;border-color:#4ef2f4!important}
${ROOT} .tfm-legal-progress .tf21-stats{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
${ROOT} .tfm-legal-progress .tf21-stat{min-width:0!important;min-height:124px!important;display:grid!important;grid-template-columns:56px minmax(0,1fr)!important;align-items:center!important;gap:12px!important;padding:16px 16px 14px!important;border-radius:20px!important;border:1px solid rgba(58,97,164,.43)!important;background:linear-gradient(145deg,#0b1530,#091126)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(1){border-color:rgba(245,171,45,.55)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(2){border-color:rgba(130,70,246,.68)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3){border-color:rgba(2,222,252,.5)!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon{display:grid!important;place-items:center!important;width:56px!important;height:56px!important;border-radius:16px!important;background:rgba(245,151,39,.14)!important;color:#ffbe52!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(2) .tf21-stat-icon{background:rgba(124,45,239,.2)!important;color:#b177fa!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) .tf21-stat-icon{background:rgba(0,193,230,.12)!important;color:#24eefa!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon svg{width:31px!important;height:31px!important;stroke-width:2!important}
${ROOT} .tfm-legal-progress .tf21-stat-body{display:flex!important;flex-direction:column!important;gap:4px!important;min-width:0!important;text-align:left!important;line-height:1.15!important}
${ROOT} .tfm-legal-progress .tf21-stat-body b{font-size:23px!important;font-weight:900!important;white-space:nowrap!important;color:#ffc65a!important;font-variant-numeric:tabular-nums!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(2) b{color:#b778ff!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) b{font-size:20px!important;color:#23eff4!important}
${ROOT} .tfm-legal-progress .tf21-stat-body span,${ROOT} .tfm-legal-progress .tf21-stat-body small{font-size:12px!important;line-height:1.28!important;color:#aabbdc!important;overflow-wrap:anywhere!important}
${ROOT} [data-tfm-old-progress="yes"]{display:none!important}
${ROOT} .tfm-legal-progress .tf21-progress-head>*{min-width:0!important;box-sizing:border-box!important}
${ROOT} .tfm-legal-progress .tf21-steps{align-items:center!important}
${ROOT} .tfm-legal-progress .tf21-stat-body span,${ROOT} .tfm-legal-progress .tf21-stat-body small{white-space:normal!important}
${ROOT} .tfm-legal-progress .tf21-count-pill{box-sizing:border-box!important;overflow:hidden!important}
/* El resumen de 12 misiones conserva su boton original de inicio. */
${ROOT} .tfm-summary{border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;margin:12px 0 0!important}
${ROOT} .tfm-summary>.tfm-summary-head,${ROOT} .tfm-summary>.tfm-stats{display:none!important}
${ROOT} .tfm-summary>.tfm-start{margin:0!important}
@media(max-width:600px){
${ROOT} .tfm-legal-progress{padding:11px 10px 11px!important;border-radius:16px!important}
${ROOT} .tfm-legal-progress .tf21-progress-head{grid-template-columns:39px minmax(0,1fr) 63px 46px!important;gap:6px!important;min-height:46px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon{width:37px!important;height:37px!important;border-radius:11px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:22px!important;height:22px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:12px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:9px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill{height:43px!important;padding:4px 3px!important;min-width:63px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:15px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill small{font-size:6px!important}
${ROOT} .tfm-legal-progress .tf21-pct{font-size:25px!important}
${ROOT} .tfm-legal-progress .tf21-bar{height:9px!important;margin:9px 2px 10px!important}
${ROOT} .tfm-legal-progress .tf21-steps{gap:0!important;margin:0 1px 10px!important}
${ROOT} .tfm-legal-progress .tf21-step{width:min(25px,94%)!important;font-size:9px!important}
${ROOT} .tfm-legal-progress .tf21-stats{gap:5px!important}
${ROOT} .tfm-legal-progress .tf21-stat{min-height:83px!important;grid-template-columns:28px minmax(0,1fr)!important;gap:5px!important;padding:7px 5px!important;border-radius:12px!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon{width:27px!important;height:27px!important;border-radius:8px!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon svg{width:19px!important;height:19px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body{gap:3px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body b{font-size:17px!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) b{font-size:14px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body span,${ROOT} .tfm-legal-progress .tf21-stat-body small{font-size:9px!important;line-height:1.2!important}
}
@media(max-width:350px){
${ROOT} .tfm-legal-progress .tf21-progress-head{grid-template-columns:34px minmax(0,1fr) 58px 39px!important;gap:4px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon{width:32px!important;height:32px!important}
${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:20px!important;height:20px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:10px!important}
${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:8px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:13px!important}
${ROOT} .tfm-legal-progress .tf21-pct{font-size:22px!important}
${ROOT} .tfm-legal-progress .tf21-stat{grid-template-columns:1fr!important;justify-items:center!important;gap:3px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body{text-align:center!important}
}

/* T88: correspondencia visual con Dominio Jurídico, exclusivamente Mentalista. */
#windowContainer.mentalist-modal.open #windowContent.tfMentalistReplicaT9{
  width:min(100%,880px)!important;max-width:880px!important;
  padding:0 10px 14px!important;border:1px solid rgba(31,228,255,.78)!important;
  border-radius:24px!important;background:linear-gradient(180deg,#041022,#061020 22%,#050c1b)!important;
  box-shadow:0 0 0 1px rgba(13,126,255,.16),0 0 24px rgba(0,207,255,.14),inset 0 0 30px rgba(10,18,44,.45)!important;
}
${ROOT} > .v85-routine-modal-head{
  grid-template-columns:72px minmax(0,1fr) 48px!important;gap:10px!important;
  padding:12px 8px!important;min-height:120px!important;margin:0 0 12px!important;
  border-radius:22px 22px 0 0!important;border-bottom:0!important;
  background:linear-gradient(90deg,#071221 0%,#081327 41%,rgba(4,11,26,.46) 67%,rgba(6,8,21,.12) 100%)!important;
}
${ROOT} > .v85-routine-modal-head:before{width:160px!important;height:110px!important;right:48px!important;opacity:.63!important}
${ROOT} .v85-routine-modal-icon.violet{
  width:66px!important;height:66px!important;min-width:66px!important;border-radius:19px!important;
  border:1px solid rgba(52,235,255,.56)!important;background:linear-gradient(145deg,rgba(12,58,87,.92),rgba(7,23,45,.98))!important;
  box-shadow:inset 0 0 22px rgba(32,230,247,.08),0 0 12px rgba(0,189,255,.08)!important;
}
${ROOT} .v85-routine-modal-icon.violet svg{width:38px!important;height:38px!important;stroke:#20eff5!important;color:#20eff5!important;filter:none!important}
${ROOT} .v85-routine-modal-copy .eyebrow{
  font-size:11px!important;letter-spacing:.15em!important;font-weight:800!important;color:#d4e2ff!important;
}
${ROOT} .v85-routine-modal-copy h2{font-size:clamp(24px,5vw,32px)!important;line-height:1.04!important;color:#77f1ff!important;-webkit-text-fill-color:#77f1ff!important;text-shadow:none!important}
${ROOT} .tfm-stars{gap:5px!important;margin-top:5px!important;line-height:1.3!important;flex-wrap:wrap!important;white-space:normal!important;font-size:10px!important}
${ROOT} .tfm-stars strong{font-size:10px!important}
${ROOT} > .v85-routine-modal-head .v85-routine-progress-pill.violet{
  position:absolute!important;width:1px!important;min-width:1px!important;height:1px!important;min-height:1px!important;
  padding:0!important;margin:0!important;overflow:hidden!important;clip-path:inset(50%)!important;
  opacity:0!important;pointer-events:none!important;
}
${ROOT} > .v85-routine-modal-head > .window-close{
  position:relative!important;top:auto!important;right:auto!important;grid-column:3!important;grid-row:1!important;
  width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;
  align-self:start!important;justify-self:end!important;border-radius:14px!important;
  border:1px solid rgba(141,188,255,.16)!important;background:linear-gradient(180deg,rgba(26,41,78,.96),rgba(16,28,58,.98))!important;
}
${ROOT} > .v96-mentalist-scroll{padding:0 0 6px!important}
${ROOT} .tfm-legal-progress{
  margin:0 0 12px!important;padding:14px!important;border-radius:22px!important;
}
${ROOT} .tfm-legal-progress .tf21-progress-head{
  grid-template-columns:50px minmax(0,1fr) 120px 60px!important;gap:10px!important;min-height:60px!important;
}
${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:16px!important;line-height:1.2!important}
${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:12px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill{min-width:0!important;width:120px!important;height:60px!important;padding:6px 8px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:21px!important}
${ROOT} .tfm-legal-progress .tf21-count-pill small{font-size:10px!important;color:#ebe8ff!important}
${ROOT} .tfm-legal-progress .tf21-pct{font-size:27px!important}
${ROOT} .tfm-legal-progress .tf21-bar{height:14px!important;margin:13px 8px 12px!important}
${ROOT} .tfm-legal-progress .tf21-steps{gap:2px!important;margin:0 2px 13px!important}
${ROOT} .tfm-legal-progress .tf21-step{
  width:min(32px,100%)!important;border:1px solid rgba(89,119,180,.62)!important;
  font-size:11px!important;color:#dce4ff!important;background:linear-gradient(180deg,#142758,#10204c)!important;
  box-shadow:0 0 0 2px rgba(5,13,31,.7)!important;
}
${ROOT} .tfm-legal-progress .tf21-stats{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
${ROOT} .tfm-legal-progress .tf21-stat{
  grid-template-columns:48px minmax(0,1fr)!important;gap:9px!important;
  padding:12px 10px!important;min-height:100px!important;border-radius:17px!important;
  background:linear-gradient(145deg,rgba(8,15,43,.98),rgba(10,15,36,.96))!important;
}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(1){border-color:rgba(230,164,62,.78)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(2){border-color:rgba(154,84,255,.76)!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3){border-color:rgba(30,230,255,.78)!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon{width:46px!important;height:46px!important;border-radius:14px!important}
${ROOT} .tfm-legal-progress .tf21-stat-icon svg{width:27px!important;height:27px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body{gap:3px!important;min-width:0!important;max-width:100%!important}
${ROOT} .tfm-legal-progress .tf21-stat-body b{font-size:20px!important;line-height:1.15!important}
${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) b{font-size:17px!important}
${ROOT} .tfm-legal-progress .tf21-stat-body span,
${ROOT} .tfm-legal-progress .tf21-stat-body small{
  font-size:11px!important;line-height:1.3!important;color:#e2e8f7!important;
  overflow-wrap:normal!important;word-break:normal!important;hyphens:none!important;white-space:normal!important;
}
${ROOT} .v94-mentalist-protocol{
  grid-template-columns:44px minmax(0,1fr)!important;gap:10px!important;
  min-height:68px!important;padding:12px!important;margin:0 0 13px!important;
  border-radius:18px!important;border:1px solid rgba(140,59,252,.86)!important;
  background:linear-gradient(120deg,#1d1360,#0b2145)!important;
}
${ROOT} .tfm-rule-icon{width:42px!important;height:42px!important;border-radius:13px!important;background:linear-gradient(145deg,rgba(65,77,155,.96),rgba(30,47,116,.98))!important}
${ROOT} .tfm-rule-icon svg{width:24px!important;height:24px!important}
${ROOT} .tfm-rule-copy strong{font-size:13px!important;line-height:1.3!important;color:#21eef4!important}
${ROOT} .tfm-rule-copy span{font-size:11px!important;line-height:1.4!important;color:#d6def2!important}
${ROOT} .v94-mentalist-list{gap:11px!important}
${ROOT} .tfm-mission-card{
  border-radius:18px!important;border:1px solid rgba(122,53,247,.78)!important;
  background:linear-gradient(140deg,#0b1036,#060f2c 58%,#081033)!important;
  box-shadow:inset 0 0 18px rgba(153,79,255,.05),0 0 10px rgba(59,78,255,.06)!important;
  padding:0 0 7px!important;overflow:hidden!important;
}
${ROOT} .tfm-mission-card:before{width:6px!important;background:linear-gradient(180deg,#e54cff,#8a2bff)!important;opacity:1!important}
${ROOT} .v94-mentalist-step{
  grid-template-columns:30px 54px minmax(0,1fr) 46px 13px!important;gap:10px!important;
  min-height:78px!important;padding:10px 12px!important;
}
${ROOT} .tfm-mission-number{font-size:15px!important;color:#d88bff!important;font-weight:900!important}
${ROOT} .v94-mentalist-step-icon{
  width:51px!important;height:51px!important;min-width:51px!important;border-radius:15px!important;
  border:1px solid rgba(28,233,255,.24)!important;background:linear-gradient(145deg,rgba(9,49,80,.95),rgba(7,26,57,.98))!important;
}
${ROOT} .v94-mentalist-step-icon svg{width:28px!important;height:28px!important;stroke:#20eff5!important;color:#20eff5!important;filter:none!important}
${ROOT} .v94-mentalist-step-copy strong{font-size:15px!important;line-height:1.18!important;color:#fff!important}
${ROOT} .v94-mentalist-step-copy span{font-size:12px!important;line-height:1.35!important;color:#d7def2!important}
${ROOT} .v94-mentalist-check{
  width:44px!important;height:44px!important;min-width:44px!important;border-radius:14px!important;
  border:1px solid rgba(112,138,184,.35)!important;background:linear-gradient(145deg,rgba(13,22,54,.96),rgba(7,16,39,.98))!important;
}
${ROOT} .v94-mentalist-check:after{width:25px!important;height:25px!important;border:3px solid #f4f7ff!important}
${ROOT} .tfm-chevron{font-size:23px!important;color:#dfe6ff!important}
${ROOT} .tfm-mission-card .v97-routine-guide{
  margin:0 10px!important;width:calc(100% - 20px)!important;max-width:none!important;
  border-radius:12px!important;border:1px solid rgba(116,92,245,.32)!important;
  background:linear-gradient(180deg,#2a2372,#231f66)!important;
}
${ROOT} .tfm-mission-card .v97-routine-guide summary{
  min-height:34px!important;padding:7px 10px!important;font-size:11px!important;font-weight:750!important;line-height:1.3!important;
}
${ROOT} .tfm-summary{margin:13px 0 0!important}
${ROOT} .tfm-summary>.tfm-start{
  min-height:67px!important;padding:10px 14px!important;border-radius:19px!important;
  display:flex!important;justify-content:center!important;align-items:center!important;gap:14px!important;
  border:1px solid rgba(72,243,255,.72)!important;
  background:linear-gradient(90deg,#1ae8f2,#0dd6e8 18%,#29b7ff 55%,#5e5bff 78%,#8d31ff)!important;
  box-shadow:0 0 18px rgba(79,235,255,.18),inset 0 0 18px rgba(255,255,255,.06)!important;
  color:#083646!important;font-size:16px!important;font-weight:900!important;
}
${ROOT} .tfm-summary>.tfm-start svg{width:24px!important;height:24px!important}
@media(max-width:600px){
 ${ROOT} > .v85-routine-modal-head{min-height:99px!important}
 ${ROOT} .tfm-legal-progress{padding:11px 10px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-head{grid-template-columns:40px minmax(0,1fr) 91px 44px!important;gap:7px!important;min-height:49px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-icon{width:39px!important;height:39px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:23px!important;height:23px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:12px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:9px!important}
 ${ROOT} .tfm-legal-progress .tf21-count-pill{width:91px!important;min-width:0!important;height:48px!important;padding:4px!important}
 ${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:17px!important}
 ${ROOT} .tfm-legal-progress .tf21-count-pill small{font-size:8px!important}
 ${ROOT} .tfm-legal-progress .tf21-pct{font-size:23px!important}
 ${ROOT} .tfm-legal-progress .tf21-bar{height:10px!important;margin:10px 2px!important}
 ${ROOT} .tfm-legal-progress .tf21-steps{margin:0 0 12px!important;gap:1px!important}
 ${ROOT} .tfm-legal-progress .tf21-step{width:min(27px,100%)!important;font-size:10px!important}
 ${ROOT} .tfm-legal-progress .tf21-stats{gap:6px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat{
  grid-template-columns:1fr!important;justify-items:center!important;gap:5px!important;
  min-height:107px!important;padding:9px 4px!important;border-radius:14px!important;
 }
 ${ROOT} .tfm-legal-progress .tf21-stat-icon{width:33px!important;height:33px!important;border-radius:10px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat-icon svg{width:21px!important;height:21px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat-body{align-items:center!important;text-align:center!important;gap:3px!important;width:100%!important}
 ${ROOT} .tfm-legal-progress .tf21-stat-body b{font-size:17px!important;white-space:nowrap!important}
 ${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) b{font-size:14px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat-body span,
 ${ROOT} .tfm-legal-progress .tf21-stat-body small{font-size:9px!important;line-height:1.25!important}
 ${ROOT} .v94-mentalist-step{grid-template-columns:25px 42px minmax(0,1fr) 36px 11px!important;gap:7px!important;padding:9px 9px!important;min-height:68px!important}
 ${ROOT} .tfm-mission-number{font-size:12px!important}
 ${ROOT} .v94-mentalist-step-icon{width:41px!important;height:41px!important;min-width:41px!important;border-radius:12px!important}
 ${ROOT} .v94-mentalist-step-icon svg{width:24px!important;height:24px!important}
 ${ROOT} .v94-mentalist-step-copy strong{font-size:13px!important}
 ${ROOT} .v94-mentalist-step-copy span{font-size:10px!important}
 ${ROOT} .v94-mentalist-check{width:35px!important;height:35px!important;min-width:35px!important;border-radius:12px!important}
 ${ROOT} .v94-mentalist-check:after{width:20px!important;height:20px!important}
 ${ROOT} .tfm-mission-card .v97-routine-guide summary{font-size:10px!important;min-height:32px!important}
 ${ROOT} .tfm-summary>.tfm-start{min-height:60px!important;font-size:14px!important}
}
@media(max-width:420px){
 #windowContainer.mentalist-modal.open #windowContent.tfMentalistReplicaT9{padding:0 9px 12px!important}
 ${ROOT} > .v85-routine-modal-head{grid-template-columns:56px minmax(0,1fr) 44px!important;gap:8px!important;min-height:95px!important;padding:9px 5px!important}
 ${ROOT} > .v85-routine-modal-head:before{width:115px!important;height:87px!important;right:39px!important;opacity:.5!important}
 ${ROOT} .v85-routine-modal-icon.violet{width:54px!important;height:54px!important;min-width:54px!important;border-radius:16px!important}
 ${ROOT} .v85-routine-modal-icon.violet svg{width:31px!important;height:31px!important}
 ${ROOT} .v85-routine-modal-copy .eyebrow{font-size:9px!important;letter-spacing:.1em!important}
 ${ROOT} .v85-routine-modal-copy h2{font-size:25px!important}
 ${ROOT} .tfm-stars{font-size:9px!important;gap:4px!important}
 ${ROOT} .tfm-stars strong{font-size:9px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-head{grid-template-columns:36px minmax(0,1fr) 80px 40px!important;gap:5px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-icon{width:35px!important;height:35px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-icon svg{width:21px!important;height:21px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-label strong{font-size:11px!important}
 ${ROOT} .tfm-legal-progress .tf21-progress-label small{font-size:9px!important}
 ${ROOT} .tfm-legal-progress .tf21-count-pill{width:80px!important;height:44px!important}
 ${ROOT} .tfm-legal-progress .tf21-count-pill b{font-size:15px!important}
 ${ROOT} .tfm-legal-progress .tf21-count-pill small{font-size:7px!important}
 ${ROOT} .tfm-legal-progress .tf21-pct{font-size:21px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat{min-height:108px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat-body b{font-size:16px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat:nth-child(3) b{font-size:12px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat-body span,
 ${ROOT} .tfm-legal-progress .tf21-stat-body small{font-size:8.7px!important}
 ${ROOT} .v94-mentalist-protocol{padding:10px!important;min-height:60px!important}
 ${ROOT} .tfm-rule-copy strong{font-size:12px!important}
 ${ROOT} .tfm-rule-copy span{font-size:10px!important}
}
@media(max-width:350px){
 ${ROOT} .tfm-legal-progress .tf21-progress-head{grid-template-columns:32px minmax(0,1fr) 68px 34px!important;gap:4px!important}
 ${ROOT} .tfm-legal-progress .tf21-count-pill{width:68px!important}
 ${ROOT} .tfm-legal-progress .tf21-pct{font-size:18px!important}
 ${ROOT} .tfm-legal-progress .tf21-stat-body span,
 ${ROOT} .tfm-legal-progress .tf21-stat-body small{font-size:8px!important}
 ${ROOT} .v94-mentalist-step{grid-template-columns:20px 35px minmax(0,1fr) 30px 9px!important;gap:5px!important;padding:8px 6px!important}
 ${ROOT} .v94-mentalist-step-icon{width:34px!important;height:34px!important;min-width:34px!important}
 ${ROOT} .v94-mentalist-check{width:30px!important;height:30px!important;min-width:30px!important}
}

/* T90: sin bloque duplicado entre cabecera y progreso Mentalista. */
${ROOT} > .v85-routine-modal-head ~ :has(~ .v96-mentalist-scroll){
 display:none!important;visibility:hidden!important;
 max-height:0!important;min-height:0!important;
 margin:0!important;padding:0!important;border:0!important;
 overflow:hidden!important;pointer-events:none!important;
}
`;
const SVG_START='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const ICONS={
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
 flame:'<path d="M12 22c-4 0-7-3-7-7 0-4 3-7 6-10 0 4 5 5 5 10 1-2 2-3 2-5 3 5 3 12-6 12Z"/>',
 chart:'<rect x="2" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="18" y="3" width="4" height="18" rx="1"/>'
};
const svg=name=>SVG_START+ICONS[name]+'</svg>';
function installStyle(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head.appendChild(style);
}
function changeText(element,value){if(element&&element.textContent!==value)element.textContent=value}
function state(){
 const panel=document.getElementById('windowContent'),outer=document.getElementById('windowContainer');
 if(!panel||!outer||!outer.classList.contains('open')||!outer.classList.contains('mentalist-modal')||!panel.classList.contains('tfMentalistReplicaT9'))return null;
 const scroll=panel.querySelector('.v96-mentalist-scroll');
 if(!scroll||!scroll.querySelector('.v94-mentalist-list'))return null;
 return {panel,scroll};
}
function originalProgress(panel,scroll,newCard){
 // Identificar por contenido y por estructura, sin tocar la regla ni las misiones.
 const headings=[...panel.querySelectorAll('strong,h2,h3,h4,p,div,span')].filter(el=>
  el.childElementCount===0&&el.textContent.trim()==='Progreso del protocolo');
 for(const heading of headings){
  let candidate=heading.parentElement;
  while(candidate&&candidate!==panel&&candidate!==scroll){
   if(candidate===newCard||candidate.classList.contains('tfm-legal-progress')||
      candidate.classList.contains('tfm-summary')||candidate.querySelector('.tfm-start'))break;
   const text=candidate.textContent||'';
   if(text.includes('Tiempo estimado')&&text.includes('Completadas')&&
      !candidate.querySelector('.v94-mentalist-list,.v94-mentalist-step,.v94-mentalist-protocol'))return candidate;
   candidate=candidate.parentElement;
  }
 }
 return null;
}
function createCard(scroll){
 const card=document.createElement('section');card.className='tfm-legal-progress';
 card.setAttribute('aria-label','Progreso del protocolo Mentalista');
 card.innerHTML='<div class="tf21-progress-head"><span class="tf21-progress-icon">'+svg('target')+'</span><span class="tf21-progress-label"><strong>Progreso del protocolo</strong><small>Avanza una prueba a la vez.</small></span><span class="tf21-count-pill"><b>0/12</b><small>COMPLETADAS</small></span><strong class="tf21-pct">0%</strong></div>'+
 '<div class="tf21-bar" role="progressbar" aria-label="Progreso del protocolo Mentalista" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><div class="tf21-steps"></div><div class="tf21-stats"></div>';
 const steps=card.querySelector('.tf21-steps'),fragment=document.createDocumentFragment();
 for(let i=1;i<=12;i++){const circle=document.createElement('span');circle.className='tf21-step';circle.textContent=String(i);fragment.appendChild(circle)}
 steps.appendChild(fragment);
 const stats=card.querySelector('.tf21-stats');
 for(const [icon,number,label,detail] of [
  ['flame','0','Completadas','de 12 pruebas'],
  ['target','0%','Precisión actual','Mínimo requerido: 90%'],
  ['chart','~25–35 min','Tiempo estimado','Completo']
 ]){
  const stat=document.createElement('div');stat.className='tf21-stat';
  stat.innerHTML='<span class="tf21-stat-icon">'+svg(icon)+'</span><div class="tf21-stat-body"><b></b><span></span><small></small></div>';
  stat.querySelector('b').textContent=number;
  stat.querySelector('.tf21-stat-body>span').textContent=label;
  stat.querySelector('small').textContent=detail;
  stats.appendChild(stat);
 }
 scroll.insertBefore(card,scroll.firstChild);
 return card;
}

/* T89: suprime solo el panel superior duplicado de doce pasos.
   La tarjeta inferior conserva su progreso y el seguimiento original no se altera. */
function hideLegacyTracker(panel,scroll,card){
 // Encontrar el cuadro antiguo en cualquier profundidad del modal.
 // Excluir el cuadro nuevo, la regla y todas las tarjetas de las doce pruebas.
 const excluded='.tfm-legal-progress,.v94-mentalist-list,.v94-mentalist-protocol,.tfm-summary,.v85-routine-modal-head';
 const candidates=[...panel.querySelectorAll('div,section,article,nav,ol')].filter(node=>{
  if(node===card||node===scroll||node.contains(card)||node.closest(excluded)||
     node.querySelector('.v94-mentalist-step,.v94-mentalist-list,.tfm-legal-progress,.tfm-summary,.v94-mentalist-protocol,.v85-routine-modal-head'))return false;
  const numbered=[...node.querySelectorAll('*')].filter(e=>
    e.childElementCount===0&&/^(?:[1-9]|1[0-2])$/.test(String(e.textContent||'').trim()));
  return numbered.length===12&&numbered.every((e,i)=>Number(e.textContent.trim())===i+1)&&
    String(node.textContent||'').replace(/(?:1[0-2]|[1-9])|\s/g,'').trim()==='';
 });
 const largest=candidates.filter(node=>!candidates.some(other=>other!==node&&other.contains(node)));
 // Si la escala original aparece como hermano de otro contenedor,
 // recorrer desde la cabecera hasta el contenedor que contiene el progreso nuevo.
 let host=card;
 while(host.parentElement&&host.parentElement!==panel)host=host.parentElement;
 const header=panel.querySelector(':scope > .v85-routine-modal-head');
 if(header&&host.parentElement===panel){
  let sibling=header.nextElementSibling;
  while(sibling&&sibling!==host){
   const next=sibling.nextElementSibling;
   if(!sibling.matches('script,style')&&!sibling.contains(card)&&
      !sibling.querySelector('.v94-mentalist-list,.v94-mentalist-protocol,.v94-mentalist-step,button,input,textarea')){
    sibling.setAttribute('data-tfm-old-progress','yes');
    sibling.style.setProperty('display','none','important');
   }
   sibling=next;
  }
 }
 for(const node of largest){
  node.setAttribute('data-tfm-old-progress','yes');
  node.style.setProperty('display','none','important');
  const bar=node.previousElementSibling;
  if(bar&&bar.matches('[class*="progress-bar"],[class*="progress-track"],[class*="meter"],[class*="timeline-bar"]')&&!bar.querySelector('button,input'))bar.style.setProperty('display','none','important');
 }
}
function update(){
 const current=state();if(!current)return;
 const {panel,scroll}=current;
 installStyle();
 let card=scroll.querySelector(':scope > .tfm-legal-progress');
 if(!card)card=createCard(scroll);
 const previous=originalProgress(panel,scroll,card);
 if(previous&&previous.getAttribute('data-tfm-old-progress')!=='yes')previous.setAttribute('data-tfm-old-progress','yes');
  hideLegacyTracker(panel,scroll,card);
 const header=panel.querySelector('.v85-routine-modal-head .v85-routine-progress-pill');
 const match=String(header?.textContent||'').match(/(\d+)\s*\/\s*(\d+)/);
 const nativeSummary=scroll.querySelector('.tfm-summary');
 const rows=[...scroll.querySelectorAll('.v94-mentalist-list .v94-mentalist-step')];
 const completed=Math.max(0,Math.min(12,match?Number(match[1]):rows.filter(row=>row.classList.contains('done')).length));
 const percentage=Math.round(completed/12*100);
 const precision=nativeSummary?.querySelector('.tfm-precision')?.textContent?.trim()||'0%';
 changeText(card.querySelector('.tf21-count-pill b'),completed+'/12');
 changeText(card.querySelector('.tf21-pct'),percentage+'%');
 changeText(card.querySelector('.tf21-stat:nth-child(1) b'),String(completed));
 changeText(card.querySelector('.tf21-stat:nth-child(2) b'),precision);
 card.style.setProperty('--tfm-legal-pct',percentage+'%');
 const bar=card.querySelector('.tf21-bar');
 if(bar&&bar.getAttribute('aria-valuenow')!==String(percentage))bar.setAttribute('aria-valuenow',String(percentage));
 [...card.querySelectorAll('.tf21-step')].forEach((step,index)=>{
  if(step.classList.contains('done')!==(index<completed))step.classList.toggle('done',index<completed);
 });
}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update()})}
let initialized=false;
function initialize(){
 if(initialized)return true;
 const panel=document.getElementById('windowContent'),outer=document.getElementById('windowContainer');
 if(!panel||!outer)return false;
 initialized=true;installStyle();
 const observer=new MutationObserver(changes=>{
  if(changes.some(r=>r.type==='childList'||r.type==='attributes'))schedule();
 });
 observer.observe(outer,{attributes:true,attributeFilter:['class']});
 observer.observe(panel,{childList:true,subtree:false});
 document.addEventListener('click',()=>{schedule();setTimeout(schedule,110)},{capture:true,passive:true});
 // Actualizar solo mientras Mentalista está abierto, también tras sincronización.
 setInterval(()=>{if(state())update()},900);
 schedule();return true;
}
if(!initialize()){
 document.addEventListener('DOMContentLoaded',initialize,{once:true});
 const retry=setInterval(()=>{if(initialize())clearInterval(retry)},1500);
}
})();