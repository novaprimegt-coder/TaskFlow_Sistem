/* Espacios y anuncios a pantalla completa de TaskFlow. */
(function () {
'use strict';

if (window.TaskFlowAdsV50) return;

const ADS_MANAGER_URL = 'https://novaprimegt-coder.github.io/TaskFlow_ADS_Manager/';
const PROMO_WAIT_MS = 7500;
let promosEnabled = true;

const BANNER_PLACEMENTS = [
  ['tfAdBannerTimer', 'Reinicio diario y recompensas', '.wrap > .reset-countdown-card'],
  ['tfAdBannerHabitsTasks', 'Hábitos y tareas', '.wrap > .v27-habit-kpis'],
  ['tfAdBannerFooter', 'Rango global y análisis de disciplina', '.wrap > #statUnifiedStreak'],
  ['tfAdBannerRoutine', 'Progreso del protocolo', '#windowContainer.open #windowContent > .tf15-progress'],
  ['tfAdBannerMenu', 'Menú lateral', '#sideMenu.open > .quick-actions-panel'],
  ['tfAdBannerHabits', 'Hábitos', '#windowContainer.open #windowContent:is([data-tf35-view="hub-habits"],[data-tf35-view^="list-habits-"]) > :last-child', true],
  ['tfAdBannerTasks', 'Tareas', '#windowContainer.open #windowContent:is([data-tf35-view="hub-tasks"],[data-tf35-view^="list-tasks-"]) > :last-child', true]
];
const BANNER_IDS = BANNER_PLACEMENTS.map(([id]) => id);
const BANNER_CSS = `
.tf50-ad-slot {
  display: block !important;
  position: relative !important;
  width: 100% !important;
  max-width: var(--tf-ad-native-width, 1200px) !important;
  min-width: 0 !important;
  height: auto !important;
  aspect-ratio: 20 / 3 !important;
  flex: 0 0 auto !important;
  margin: 22px auto 10px !important;
  padding: 0 !important;
  overflow: visible !important;
  border: 0 !important;
  border-radius: 12px !important;
  background: #071728 !important;
  isolation: isolate;
}
.tf50-ad-slot:not(.tf50-has-ad,.tf158-has-promo) { display: none !important; }
#sideMenu > .tf50-ad-slot { width: calc(100% - 24px) !important; }
.tf50-ad-slot::before {
  content: 'PUBLICIDAD';
  position: absolute;
  bottom: calc(100% + 3px);
  left: 1px;
  z-index: 1;
  padding: 2px 5px;
  border-radius: 5px;
  background: #071427e8;
  color: #e4f7ff;
  font: 800 8px/1.1 system-ui, sans-serif;
  letter-spacing: .07em;
  pointer-events: none;
}
.tf50-ad-slot > a, .tf50-ad-slot img {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  border: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}
.tf50-ad-slot img {
  object-fit: contain !important;
  border-radius: 12px;
  image-rendering: auto !important;
  filter: none !important;
  opacity: 1 !important;
}
.tf50-ad-slot > .tf-ads-cta-link::after {
  content: attr(data-tf-ad-cta);
  position: absolute;
  bottom: calc(100% + 3px);
  right: 1px;
  max-width: calc(100% - 90px);
  padding: 2px 5px;
  border-radius: 5px;
  background: #071427e8;
  color: #e4f7ff;
  font: 700 8px/1.1 system-ui, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;
const PROMO_CSS = `
.tf50-ad-slot.tf158-has-promo::before { content:'ESPACIO PUBLICITARIO'; }
.tf50-ad-slot > a.tf158-promo,
:is(#tf56EntryStage,#tf57TouchStage) > a.tf158-promo {
  display:grid !important;
  color:#ecffff !important;
  border:1px solid #4ba8cd !important;
  border-radius:inherit;
  background:radial-gradient(ellipse at 11% 30%,#0e749382,transparent 62%),linear-gradient(112deg,#0b2744,#21184c 93%) !important;
  text-decoration:none !important;
  box-sizing:border-box;
}
.tf50-ad-slot > .tf158-promo {
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:clamp(5px,1.5vw,12px);
  padding:0 clamp(7px,2vw,19px) !important;
  container-type:inline-size;
}
.tf158-promo .tf158-promo-icon {
  width:24px;
  height:24px;
  display:grid;
  place-items:center;
  color:#78fbf7;
  border-radius:8px;
  background:#123e5c;
  border:1px solid #4188a4;
}
.tf158-promo .tf158-promo-icon svg {display:block;width:62%;height:62%}
.tf158-promo .tf158-promo-copy {min-width:0;display:grid;gap:2px}
.tf158-promo .tf158-promo-copy strong {color:#f2fbff;font:800 clamp(11px,3.5cqw,17px)/1.12 system-ui,sans-serif}
.tf158-promo .tf158-promo-copy small {color:#b9d8ef;font:600 clamp(8px,2.6cqw,11px)/1.12 system-ui,sans-serif}
.tf158-promo .tf158-promo-action {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:4px;
  color:#cafffb;
  border:1px solid #57b7cb;
  border-radius:999px;
  background:#123652;
  padding:4px 7px;
  font:750 clamp(9px,2.7cqw,12px)/1.15 system-ui,sans-serif;
  white-space:nowrap;
}
.tf158-promo-action svg {display:block;width:1em;height:1em;flex:none}
:is(#tfEntryAdV56,#tfInteractionAdV57):focus {outline:none}
:is(#tf56EntryStage,#tf57TouchStage) > a.tf158-promo {
  position:relative;
  isolation:isolate;
  overflow:hidden;
  align-content:center;
  justify-items:center;
  gap:clamp(10px,4dvh,30px);
  padding:clamp(10px,5vw,32px);
  text-align:center;
  width:100%;
  height:100%;
  container-type:inline-size;
}
:is(#tf56EntryStage,#tf57TouchStage) > a.tf158-promo::before {
  content:'';
  position:absolute;
  width:110%;
  aspect-ratio:1;
  top:-28%;
  right:-40%;
  z-index:-1;
  border:1px solid #81ddfd26;
  border-radius:50%;
  box-shadow:0 0 0 28px #7b91ea14,0 0 0 56px #806fdb14,0 0 0 84px #48b9ff0b;
  pointer-events:none;
}
:is(#tf56EntryStage,#tf57TouchStage) .tf158-promo-icon {width:min(37cqw,88px);height:min(37cqw,88px);border-radius:23%}
:is(#tf56EntryStage,#tf57TouchStage) .tf158-promo-copy {gap:10px}
:is(#tf56EntryStage,#tf57TouchStage) .tf158-promo-copy strong {font-size:clamp(14px,9cqw,34px)}
:is(#tf56EntryStage,#tf57TouchStage) .tf158-promo-copy small {font-size:clamp(9px,5.6cqw,17px)}
:is(#tf56EntryStage,#tf57TouchStage) .tf158-promo-action {padding:7px 13px;font-size:clamp(9px,5.3cqw,14px)}
`;
const VERTICAL_CSS = `
#tfEntryAdV56{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom));background:#03050b;color:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-sizing:border-box;overflow:hidden;overscroll-behavior:none}
#tfEntryAdV56.open{display:flex}
.tf56-entry-shell{position:relative;width:min(100%,560px);height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-sizing:border-box}
.tf56-entry-label{align-self:flex-start;display:inline-flex;align-items:center;min-height:24px;padding:0 9px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(12,17,29,.78);color:#c7cfde;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
.tf56-entry-stage{position:relative;flex:1 1 auto;min-height:0;width:auto;max-width:100%;max-height:calc(100dvh - 116px);aspect-ratio:9/16;border-radius:22px;overflow:hidden;background:linear-gradient(160deg,#071526,#111126 55%,#170d28);border:1px solid rgba(82,226,234,.25);box-shadow:0 24px 70px rgba(0,0,0,.58),0 0 34px rgba(51,214,228,.09);display:grid;place-items:center}
.tf56-entry-stage>a,.tf56-entry-stage>.tf56-entry-media-wrap{display:block;width:100%;height:100%;text-decoration:none;color:inherit}
.tf56-entry-stage img,.tf56-entry-stage video{display:block;width:100%;height:100%;object-fit:contain;object-position:center center;image-rendering:auto;background:#000;border:0;margin:0;padding:0;filter:none;opacity:1}
.tf56-entry-footer{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px}
.tf56-entry-time{min-width:0}.tf56-entry-time strong{display:block;font-size:12px;line-height:1.2}.tf56-entry-time span{display:block;margin-top:3px;color:#8996aa;font-size:9px;line-height:1.25}
.tf56-entry-continue{position:relative;isolation:isolate;overflow:hidden;min-width:132px;height:48px;padding:0 19px;border-radius:14px;border:1px solid rgba(98,235,248,.66);background:linear-gradient(105deg,#086e91 0%,#1e72bf 52%,#6b3ee6 100%);color:#fff;font-size:13px;font-weight:950;letter-spacing:.012em;text-shadow:0 1px 2px rgba(0,0,0,.23);transition:background .18s ease,box-shadow .18s ease,transform .18s ease;touch-action:manipulation}
#tfEntryAdV56 .tf56-entry-continue:not(:disabled){cursor:pointer;background:linear-gradient(112deg,#04fce1 0%,#04bfff 31%,#4c78ff 55%,#9b48ff 80%,#ef3fe9 100%)!important;border:2px solid #dcffff!important;color:#fff!important;font-weight:950;text-shadow:0 1px 3px rgba(4,15,50,.75);box-shadow:0 0 0 2px rgba(4,253,244,.35),0 5px 24px rgba(0,212,255,.56),0 0 36px rgba(187,58,255,.55)!important;opacity:1!important;filter:none!important}
.tf56-entry-continue:not(:disabled)::before{content:'';position:absolute;inset:0;background:linear-gradient(116deg,transparent 18%,rgba(255,255,255,.28) 49%,transparent 81%);transform:translateX(-115%);animation:tf56ContinueShine 3.5s ease-in-out infinite;pointer-events:none}
.tf56-entry-continue:not(:disabled):active{transform:scale(.97)}
.tf56-entry-continue:focus-visible{outline:3px solid #fff;outline-offset:3px}
.tf56-entry-continue:disabled{opacity:.42;filter:saturate(.55);cursor:not-allowed;box-shadow:none}
#tfEntryAdV56 .tf56-entry-continue.tf56-ready{background:linear-gradient(112deg,#04fce1,#04bfff 31%,#4c78ff 55%,#9b48ff 80%,#ef3fe9)!important;color:#fff!important;opacity:1!important;border:2px solid #dcffff!important;box-shadow:0 0 0 2px #00fff448,0 5px 24px #00d4ff90,0 0 36px #ba3aff90!important}
@keyframes tf56ContinueShine{0%,55%{transform:translateX(-115%)}82%,100%{transform:translateX(115%)}}
@media(prefers-reduced-motion:reduce){.tf56-entry-continue:not(:disabled)::before{animation:none!important}}
.tf56-entry-progress{grid-column:1/-1;height:5px;border-radius:999px;overflow:hidden;background:#111a2b;border:1px solid rgba(255,255,255,.05)}.tf56-entry-progress>i{display:block;width:0;height:100%;background:linear-gradient(90deg,#18e4e9,#477bff 58%,#a642ff);transition:width .08s linear}
@media(max-width:520px){#tfEntryAdV56{padding-left:8px;padding-right:8px}.tf56-entry-shell{gap:9px}.tf56-entry-stage{max-height:calc(100dvh - 108px);border-radius:19px}.tf56-entry-footer{gap:8px}.tf56-entry-continue{min-width:116px;height:43px;padding:0 14px}}

#tfInteractionAdV57{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));background:rgba(2,4,10,.965);color:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-sizing:border-box;overflow:hidden;overscroll-behavior:none}
#tfInteractionAdV57.open{display:flex}
.tf57-touch-shell{position:relative;width:min(100%,560px);height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;box-sizing:border-box}
.tf57-touch-label{align-self:flex-start;display:inline-flex;align-items:center;min-height:24px;padding:0 9px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(9,14,27,.82);color:#c9d3e4;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
.tf57-touch-stage{position:relative;flex:1 1 auto;min-height:0;width:auto;max-width:100%;max-height:calc(100dvh - 112px);aspect-ratio:9/16;border-radius:22px;overflow:hidden;background:#05070d;border:1px solid rgba(68,224,230,.28);box-shadow:0 28px 80px rgba(0,0,0,.62),0 0 32px rgba(73,214,236,.08);display:grid;place-items:center}
.tf57-touch-stage>a{display:block;width:100%;height:100%;text-decoration:none;color:inherit}.tf57-touch-stage img,.tf57-touch-stage video{display:block;width:100%;height:100%;object-fit:contain;object-position:center center;image-rendering:auto;filter:none;opacity:1;background:#000;border:0;margin:0;padding:0}
.tf57-touch-footer{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:center}.tf57-touch-copy strong{display:block;font-size:12px}.tf57-touch-copy span{display:block;margin-top:3px;color:#8996aa;font-size:9px;line-height:1.3}.tf57-touch-close{min-width:120px;height:45px;padding:0 17px;border-radius:14px;border:1px solid rgba(76,231,225,.40);background:linear-gradient(100deg,#087c88,#176c82 48%,#5734ca);color:#fff;font-size:12px;font-weight:950}.tf57-touch-close:disabled{opacity:.38;filter:saturate(.55);cursor:not-allowed}.tf57-touch-progress{grid-column:1/-1;height:5px;border-radius:999px;overflow:hidden;background:#111a2b;border:1px solid rgba(255,255,255,.05)}.tf57-touch-progress>i{display:block;width:0;height:100%;background:linear-gradient(90deg,#18e4e9,#477bff 58%,#a642ff);transition:width .08s linear}
@media(max-width:520px){#tfInteractionAdV57{padding-left:8px;padding-right:8px}.tf57-touch-stage{max-height:calc(100dvh - 106px);border-radius:19px}.tf57-touch-close{min-width:112px;height:43px;padding:0 13px}}
.tf56-entry-stage, .tf57-touch-stage {
  flex: 0 0 auto;
  width: min(100%, var(--tf-ad-native-width, 1080px), calc((100vh - var(--tf-ad-controls)) * .5625));
  width: min(100%, var(--tf-ad-native-width, 1080px), calc((100dvh - var(--tf-ad-controls)) * .5625));
  max-height: none;
  box-sizing: border-box;
  border: 0;
}
:is(#tfEntryAdV56,#tfInteractionAdV57) { --tf-ad-controls: 120px; }
:is(#tfEntryAdV56,#tfInteractionAdV57).tf-ad-has-link { --tf-ad-controls: 178px; }
.tf-ad-goal-link {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 43px;
  padding: 8px 13px;
  box-sizing: border-box;
  border: 1px solid #46a2f58a;
  border-radius: 11px;
  background: #1857a23d;
  color: #f5faff;
  text-decoration: none;
  font: 800 12px system-ui, sans-serif;
  text-align: center;
  overflow-wrap: anywhere;
}
.tf-ad-goal-link[hidden] { display: none; }
`;

function addStyle(id, css) {
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.append(style);
}

const paidNoAds = () => Boolean(window.TaskFlowNoAds?.isActive?.());
const nativeWidth = width => width / Math.max(1, window.devicePixelRatio || 1) + 'px';

function promoLink(placement) {
  const banner = placement === 'banner';
  const link = sponsorLink(ADS_MANAGER_URL, 'Publicar un anuncio en TaskFlow ADS');
  link.className = 'tf158-promo';
  link.rel = 'noopener noreferrer';
  link.innerHTML = `<span class="tf158-promo-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 13-5v14L3 14v-4Zm3 5 2 5h3l-2-4m10-6 3-2m-3 6 3 2"/></svg>
    </span><span class="tf158-promo-copy"><strong>${banner ? 'Anuncia aquí' : 'Anuncia tu marca'}</strong>
    <small>${banner ? 'TaskFlow ADS' : 'Crea tu campaña en TaskFlow ADS.'}</small></span>
    <span class="tf158-promo-action">${banner ? 'Publicar' : 'Crear campaña'}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10"/></svg></span>`;
  return link;
}

function renderPromo(slot) {
  if (slot.classList.contains('tf158-has-promo')) return;
  slot.classList.remove('tf50-has-ad');
  slot.style.removeProperty('--tf-ad-native-width');
  slot.replaceChildren(promoLink('banner'));
  slot.classList.add('tf158-has-promo');
}

function createBanner(id, label) {
  const slot = document.createElement('aside');
  slot.id = id;
  slot.className = 'tf50-ad-slot';
  Object.assign(slot.dataset, {
    adSlot: id, adSize: '1200x180', adWidth: '1200', adHeight: '180', adRatio: '20:3',
    adMedia: 'image,gif', adFormats: 'jpg,jpeg,png,webp,gif',
  });
  slot.setAttribute('aria-label', 'Publicidad · ' + label);
  return slot;
}

function mountBanners() {
  const blocked = paidNoAds();
  for (const [id, label, selector, appendToPanel] of BANNER_PLACEMENTS) {
    let slot = document.getElementById(id);
    const anchor = blocked || !promosEnabled ? null : document.querySelector(selector);
    if (!anchor) {
      slot?.remove();
      continue;
    }
    if (!slot) {
      slot = createBanner(id, label);
      renderPromo(slot);
    }
    if (appendToPanel && anchor !== slot) anchor.parentElement.append(slot);
    if (!appendToPanel && anchor.nextElementSibling !== slot) anchor.after(slot);
  }
}

function renderBanner(id, content) {
  const slot = BANNER_IDS.includes(id) && document.getElementById(id);
  if (!slot) return false;
  if (!content) {
    if (paidNoAds() || !promosEnabled) slot.remove();
    else renderPromo(slot);
    return true;
  }
  const img = content instanceof HTMLImageElement ? content : content.firstElementChild;
  if (!(img instanceof HTMLImageElement) || (content !== img &&
      (!(content instanceof HTMLAnchorElement) || content.childElementCount !== 1))) return false;
  if (!img.complete || !((img.naturalWidth === 1200 && img.naturalHeight === 180) ||
      (img.naturalWidth === 2400 && img.naturalHeight === 360)) || paidNoAds()) return false;
  slot.style.setProperty('--tf-ad-native-width', nativeWidth(img.naturalWidth));
  slot.replaceChildren(content);
  slot.classList.remove('tf158-has-promo');
  slot.classList.add('tf50-has-ad');
  return true;
}

let mountFrame = 0;
function queueMount() {
  if (mountFrame) return;
  mountFrame = requestAnimationFrame(() => {
    mountFrame = 0;
    mountBanners();
  });
}

window.TaskFlowAdsV50 = {
  size: {width: 1200, height: 180, ratio: '20:3'},
  media: ['image', 'gif'], formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  videoAllowed: false, audioAllowed: false, slots: BANNER_IDS.slice(),
  refresh: mountBanners, render: renderBanner,
  setEnabled(enabled) { promosEnabled = enabled; },
  setPromoReady,
};

const WIDTH = 1080;
const HEIGHT = 1920;
const HOLD_MS = 10000;
const VIDEO_MAX_SECONDS = 180;
const VIDEO_TOLERANCE = .05;
const REQUIRED_TAPS = 5;
const COUNT_KEY = 'taskflow_interaction_ad_count_v57';

function adUrl(value, destination = false) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, location.href);
    const protocols = destination ? ['https:'] : ['https:', 'blob:', 'data:'];
    return protocols.includes(url.protocol) ? url.href : '';
  } catch (_) {
    return '';
  }
}

function exactImage(img) {
  return (img.naturalWidth === WIDTH && img.naturalHeight === HEIGHT) ||
    (img.naturalWidth === WIDTH*2 && img.naturalHeight === HEIGHT*2);
}
function exactVideo(v) {
  return ((v.videoWidth === WIDTH && v.videoHeight === HEIGHT) ||
    (v.videoWidth === WIDTH*2 && v.videoHeight === HEIGHT*2)) &&
    Number.isFinite(v.duration) && v.duration >= HOLD_MS / 1000 - VIDEO_TOLERANCE &&
    v.duration <= VIDEO_MAX_SECONDS + VIDEO_TOLERANCE;
}

function disposeMedia(node) {
  if (!node) return;
  if (node instanceof HTMLVideoElement) {
    node.pause();
    releaseAdAudio(node);
    node.removeAttribute('src');
    node.load();
  } else {
    node.removeAttribute('src');
  }
}

function loadMedia(creative) {
  const video = creative.type === 'video';
  const node = video ? document.createElement('video') : new Image();
  const readyEvent = video ? 'loadeddata' : 'load';
  if (video) {
    const v = node;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline','');
    v.preload='auto';
    v.muted = true;
    v.controls = false;
    v.disablePictureInPicture = true;
    v.setAttribute('controlsList', 'nodownload noplaybackrate nofullscreen');
  } else {
    node.alt = 'Anuncio';
    node.decoding = 'async';
    node.loading = 'eager';
    node.referrerPolicy = 'no-referrer';
    node.draggable = false;
  }
  return new Promise(resolve => {
    const timeout = setTimeout(failed, 16000);
    function finish(valid) {
      clearTimeout(timeout);
      node.removeEventListener(readyEvent, ready);
      node.removeEventListener('error', failed);
      if (!valid) disposeMedia(node);
      resolve(valid ? node : null);
    }
    function ready() { finish(video ? exactVideo(node) : exactImage(node)); }
    function failed() { finish(false); }
    node.addEventListener(readyEvent, ready);
    node.addEventListener('error', failed);
    node.src = creative.src;
    if (!video && node.complete) ready();
  });
}

function releaseAdAudio(video) {
  if (video.dataset.tfAdSoundHeld !== '1') return;
  delete video.dataset.tfAdSoundHeld;
  window.TaskFlowAdAudioV57?.release?.(1000);
}

function playAdVideo(video, creative) {
  if (creative.sound && window.TaskFlowAdAudioV57?.acquire?.()) {
    video.muted = false;
    video.dataset.tfAdSoundHeld = '1';
    video.addEventListener('ended', () => releaseAdAudio(video), {once: true});
  }
  void video.play().catch(() => {
    releaseAdAudio(video);
    if (!video.isConnected) return;
    video.muted = true;
    void video.play().catch(() => {});
  });
}

function sponsorLink(url, label) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'sponsored noopener noreferrer';
  link.referrerPolicy = 'no-referrer';
  link.setAttribute('aria-label', label);
  return link;
}

const permissionsOpen = () => Boolean(document.querySelector('#tfPermissionGateT52:not([hidden])'));

function createVerticalAd(options) {
  const {placement, id, prefix, part, action, text, readyText, subtitle} = options;
  let creative = null;
  let root, stage, button, timeLabel, progress, destination;
  let media = null;
  let starting = false;
  let frame = 0;
  let elapsed = 0;
  let lastTick = 0;
  let reportedVisible = false;
  let showingPromo = false;
  let previousOverflow = '';
  let previousFocus = null;

  function build() {
    if (root) return;
    root = document.createElement('div');
    root.id = id;
    root.hidden = true;
    root.tabIndex = -1;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', placement === 'entry' ? 'Publicidad de ingreso' : 'Publicidad por interacción');
    root.innerHTML = `<section class="${prefix}-shell">
      <div class="${prefix}-label">Publicidad</div>
      <div class="${prefix}-stage" id="${part}Stage"></div>
      <div class="${prefix}-footer">
        <div class="${prefix}-${placement === 'entry' ? 'time' : 'copy'}">
          <strong id="${part}Countdown"></strong><span>${subtitle}</span>
        </div>
        <button id="${part}${placement === 'entry' ? 'Continue' : 'Close'}" class="${prefix}-${placement === 'entry' ? 'continue' : 'close'}" type="button" disabled>${action}</button>
        <div class="${prefix}-progress"><i id="${part}Progress"></i></div>
      </div>
    </section>`;
    stage = root.querySelector('#' + part + 'Stage');
    button = root.querySelector('button');
    timeLabel = root.querySelector('#' + part + 'Countdown');
    progress = root.querySelector('#' + part + 'Progress');
    destination = sponsorLink('#', 'Abrir anuncio');
    destination.removeAttribute('href');
    destination.className = 'tf-ad-goal-link';
    destination.hidden = true;
    button.after(destination);
    button.addEventListener('click', close);
    document.body.append(root);
  }

  function updateClock() {
    const ready = elapsed >= HOLD_MS;
    const caption = ready ? readyText : text + Math.ceil((HOLD_MS - elapsed) / 1000) + ' s';
    if (timeLabel.textContent !== caption) timeLabel.textContent = caption;
    progress.style.width = Math.min(100, elapsed * 100 / HOLD_MS) + '%';
    const b = button;
    if (b.disabled === ready) {
      b.disabled = !ready;
      if (placement === 'entry') b.classList.toggle('tf56-ready',ready);
    }
  }

  function tick(now) {
    if (!media) return;
    if (!document.hidden && !document.documentElement.classList.contains('tf-paypal-noads-checking')) {
      if (reportedVisible) elapsed += Math.max(0, now - lastTick);
      else {
        reportedVisible = true;
        if (!showingPromo) document.dispatchEvent(new CustomEvent('taskflow:ads-media-visible', {detail: {placement}}));
      }
    }
    lastTick = now;
    updateClock();
    if (elapsed < HOLD_MS) frame = requestAnimationFrame(tick);
  }

  function showMedia(node, selected) {
    build();
    showingPromo = Boolean(selected.promo);
    const url = selected.destination;
    const link = url && sponsorLink(url, selected.ctaLabel);
    root.querySelector('.' + prefix + '-label').textContent = showingPromo ? 'Espacio publicitario' : 'Publicidad';
    if (link) link.append(node);
    destination.hidden = !url;
    if (url) destination.href = url;
    else destination.removeAttribute('href');
    destination.textContent = selected.ctaLabel;
    destination.setAttribute('aria-label', selected.ctaLabel);
    root.classList.toggle('tf-ad-has-link', Boolean(url));
    if (showingPromo) stage.style.removeProperty('--tf-ad-native-width');
    else stage.style.setProperty('--tf-ad-native-width', nativeWidth(node.videoWidth || node.naturalWidth));
    stage.replaceChildren(link || node);
    media = node;
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    elapsed = 0;
    reportedVisible = false;
    updateClock();
    root.hidden = false;
    root.classList.add('open');
    root.focus({preventScroll: true});
    lastTick = performance.now();
    frame = requestAnimationFrame(tick);
    if (node instanceof HTMLVideoElement) playAdVideo(node, selected);
  }

  async function start(canStart) {
    const allowPromo = () => promosEnabled && promoReady.has(placement);
    if (starting || media || (!creative && !allowPromo()) || !canStart()) return false;
    starting = true;
    try {
      if (placement === 'entry') {
        try { await window.TaskFlowNoAds?.waitForStatus?.(2500); } catch (_) {}
      }
      if (!canStart()) return false;
      const selected = creative;
      if (!selected) {
        if (!allowPromo()) return false;
        showMedia(promoLink(placement), {promo: true, ctaLabel: 'Crear campaña'});
        return true;
      }
      const node = await loadMedia(selected);
      if (!node) {
        if (creative === selected) creative = null;
        document.dispatchEvent(new CustomEvent('taskflow:ad-media-rejected', {
          detail: {placement, src: selected.src},
        }));
        return false;
      }
      if (creative !== selected || !canStart()) {
        disposeMedia(node);
        return false;
      }
      showMedia(node, selected);
      return true;
    } finally {
      starting = false;
    }
  }

  function close() {
    if (!media || button.disabled) return false;
    cancelAnimationFrame(frame);
    disposeMedia(media);
    media = null;
    stage.replaceChildren();
    root.classList.remove('open');
    root.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (previousFocus?.isConnected) previousFocus.focus?.({preventScroll: true});
    document.dispatchEvent(new Event('taskflow:' + placement + '-ad-complete'));
    return true;
  }

  function setCreative(input) {
    const type = String(input?.type || '').toLowerCase();
    const src = adUrl(input?.src);
    creative = ['image', 'gif', 'video'].includes(type) && src ? {
      type, src, destination: adUrl(input.destination, true),
      ctaLabel: String(input.ctaLabel || 'Conocer más').slice(0, 42), sound: type === 'video' && input.sound === true,
    } : null;
    return Boolean(creative);
  }

  document.addEventListener('visibilitychange', () => { lastTick = performance.now(); });
  return {
    start, close, setCreative, isRunning: () => starting || Boolean(media),
    isOpen: () => Boolean(media), getCreative: () => creative && {...creative},
  };
}

const entry = createVerticalAd({
  placement: 'entry', id: 'tfEntryAdV56', prefix: 'tf56-entry', part: 'tf56Entry',
  action: 'Continuar', text: 'Podrás continuar en ', readyText: 'Ya puedes continuar',
  subtitle: 'Este anuncio se muestra al ingresar a TaskFlow.',
});
const interaction = createVerticalAd({
  placement: 'interaction', id: 'tfInteractionAdV57', prefix: 'tf57-touch', part: 'tf57Touch',
  action: 'Cerrar', text: 'Podrás cerrar en ', readyText: 'Ya puedes cerrar el anuncio',
  subtitle: 'Publicidad mostrada después de ' + REQUIRED_TAPS + ' clics.',
});
const adSpec = {
  width: WIDTH, height: HEIGHT, hdWidth: WIDTH * 2, hdHeight: HEIGHT * 2, ratio: '9:16',
  videoDurationSeconds: HOLD_MS / 1000, videoMaxDurationSeconds: VIDEO_MAX_SECONDS,
  videoFormats: ['mp4', 'webm'], videoSoundAllowed: true, audioPriority: true, audioResumeDelayMs: 1000,
};

let entryShown = false;
let interacted = false;
let clickCount = 0;
function readCount() {
  try {
    const value = Number(localStorage.getItem(COUNT_KEY));
    if (Number.isSafeInteger(value) && value >= 0) clickCount = value;
  } catch (_) {}
  return clickCount;
}
function setCount(value) {
  clickCount = value;
  try { localStorage.setItem(COUNT_KEY, String(value)); } catch (_) {}
}

const promoReady = new Set();
const promoTimers = new Map();
function setPromoReady(placement, ready) {
  clearTimeout(promoTimers.get(placement));
  promoTimers.delete(placement);
  if (ready) {
    promoReady.add(placement);
    queueMicrotask(tryVerticalAds);
  } else {
    promoReady.delete(placement);
    promoTimers.set(placement, setTimeout(() => setPromoReady(placement, true), PROMO_WAIT_MS));
  }
}

const available = () => promosEnabled && !document.hidden && !permissionsOpen() && !paidNoAds();
const canEnter = () => !entryShown && available() && !interaction.isOpen();
async function showEntry() {
  if (!await entry.start(canEnter)) return false;
  entryShown = true;
  return true;
}
async function showInteraction() {
  const canShow = () => available() && !entry.isRunning() && (entryShown || !entry.getCreative());
  if (readCount() < REQUIRED_TAPS || !await interaction.start(canShow)) return false;
  setCount(Math.max(0, readCount() - REQUIRED_TAPS));
  return true;
}
function tryVerticalAds() {
  if (!entryShown) {
    if (entry.getCreative() || promoReady.has('entry')) void showEntry();
  } else if (interacted) void showInteraction();
}

window.TaskFlowEntryAdV56 = {
  spec: Object.freeze({...adSpec, displaySeconds: HOLD_MS / 1000, imageFormats: ['jpg','jpeg','png','webp','gif']}),
  setCreative: entry.setCreative, show: showEntry, close: entry.close,
  getCreative: entry.getCreative, isRunning: entry.isRunning, hasShown: () => entryShown,
};
window.TaskFlowInteractionAdV57 = {
  spec: Object.freeze({...adSpec, requiredInteractions: REQUIRED_TAPS, minimumDisplaySeconds: HOLD_MS / 1000,
    imageFormats: ['jpg','jpeg','png','webp'], gifFormat: 'gif'}),
  setCreative: interaction.setCreative, show: showInteraction, close: interaction.close,
  getCreative: interaction.getCreative, isRunning: interaction.isRunning,
  getCount: readCount, resetCount: () => setCount(0),
};

document.addEventListener('click', event => {
  if (!event.isTrusted || event.detail < 1 || !available() || entry.isOpen() || interaction.isOpen() ||
      event.target.closest?.('#tfPermissionGateT52,#tfEntryAdV56,#tfInteractionAdV57,.tf50-ad-slot')) return;
  interacted = true;
  setCount(readCount() + 1);
  document.dispatchEvent(new CustomEvent('taskflow:ad-interaction-count', {
    detail: {count: clickCount, required: REQUIRED_TAPS},
  }));
  tryVerticalAds();
}, true);

for (const name of ['permissions-ready', 'entry-ad-creative-ready', 'interaction-ad-creative-ready',
    'entry-ad-complete', 'interaction-ad-complete', 'ad-media-rejected']) {
  document.addEventListener('taskflow:' + name, () => queueMicrotask(tryVerticalAds));
}
document.addEventListener('visibilitychange', tryVerticalAds);
window.addEventListener('pageshow', event => {
  if (event.persisted && !entry.isOpen()) {
    entryShown = false;
    setPromoReady('entry', false);
    document.dispatchEvent(new Event('taskflow:entry-ad-reentered'));
  }
  tryVerticalAds();
}, {passive: true});

addStyle('tfAdSlotsT50Style', BANNER_CSS);
addStyle('tfAdsPromoV158Style', PROMO_CSS);
addStyle('tfVerticalAdsV157Style', VERTICAL_CSS);
for (const placement of ['entry', 'interaction']) setPromoReady(placement, false);
mountBanners();
const layout = new MutationObserver(queueMount);
for (const selector of ['.wrap', '#sideMenu', '#windowContainer', '#windowContent']) {
  const area = document.querySelector(selector);
  if (area) layout.observe(area, {childList: true, attributes: true, attributeFilter: ['class', 'data-tf35-view']});
}
document.addEventListener('taskflow:noads-status-updated', queueMount);
window.addEventListener('resize', () => {
  for (const id of BANNER_IDS) {
    const slot = document.getElementById(id);
    const img = slot?.querySelector('img');
    if (img) slot.style.setProperty('--tf-ad-native-width', nativeWidth(img.naturalWidth));
  }
}, {passive: true});
})();
