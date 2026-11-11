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
.tf50-ad-slot.tf158-has-promo::before {content:'ESPACIO PUBLICITARIO';}
.tf50-ad-slot > a.tf158-promo,
.tf159-ad-stage > a.tf158-promo {
  display:grid !important;
  isolation:isolate;
  position:relative;
  overflow:hidden;
  color:#f2fcff !important;
  border:1px solid #58adc9 !important;
  border-radius:inherit;
  background:
    radial-gradient(ellipse at 92% 4%,#49387e 0,transparent 51%),
    radial-gradient(ellipse at 6% 21%,#11566b,transparent 55%),
    linear-gradient(135deg,#0b263e 12%,#10243e 56%,#1c1840);
  text-decoration:none !important;
  box-sizing:border-box;
}
.tf50-ad-slot > .tf158-promo {
  grid-template-columns:auto minmax(0,1fr) auto;
  align-items:center;
  gap:clamp(6px,1.7vw,14px);
  padding:0 clamp(7px,2vw,19px) !important;
  container-type:inline-size;
}
.tf158-promo .tf158-promo-icon {
  display:grid;
  place-items:center;
  width:27px;
  height:27px;
  border-radius:8px;
  color:#80fff6;
  background:linear-gradient(135deg,#195670,#182d52);
  box-shadow:inset 0 0 0 1px #62cfd767;
}
.tf158-promo .tf158-promo-icon svg {display:block;width:68%;height:68%;}
.tf158-promo-copy {display:grid;gap:2px;min-width:0;}
.tf158-promo-copy strong {color:#f2fcff;font:850 clamp(10px,3.4cqw,17px)/1.13 system-ui,sans-serif;}
.tf158-promo-copy small {color:#cae2f1;font:650 clamp(8px,2.5cqw,11px)/1.2 system-ui,sans-serif;}
.tf158-promo-action {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  padding:4px 7px;
  color:#09223b;
  background:linear-gradient(110deg,#81fff0,#b8cdff);
  border:1px solid #bcfff1;
  border-radius:999px;
  font:800 clamp(8px,2.7cqw,12px)/1.15 system-ui,sans-serif;
  white-space:nowrap;
}
.tf158-promo-action svg {display:block;width:1em;height:1em;flex:none;}
.tf159-ad-stage > .tf158-promo {
  width:100%;
  height:100%;
  align-content:center;
  justify-items:center;
  gap:clamp(7px,5.3cqw,28px);
  padding:clamp(8px,6cqw,30px);
  text-align:center;
  container-type:inline-size;
}
.tf159-ad-stage > .tf158-promo::before {
  content:'';
  position:absolute;
  inset:0;
  z-index:-1;
  opacity:.5;
  background:
    linear-gradient(#a0e5ff15 1px,transparent 1px) 50% 0/31px 31px,
    linear-gradient(90deg,#a0e5ff15 1px,transparent 1px) 50% 0/31px 31px;
  mask-image:linear-gradient(#000,transparent 78%);
}
.tf159-promo-hero {
  display:block;
  width:72%;
  max-width:225px;
  height:auto;
  overflow:visible;
}
.tf159-ad-stage .tf158-promo-copy {gap:9px;}
.tf159-promo-brand {
  color:#a5fbf9;
  font:850 clamp(7px,3.3cqw,13px)/1.2 system-ui,sans-serif;
  letter-spacing:.14em;
  text-transform:uppercase;
}
.tf159-ad-stage .tf158-promo-copy strong {
  font-size:clamp(12px,9.9cqw,43px);
  letter-spacing:-.025em;
  text-wrap:balance;
}
.tf159-ad-stage .tf158-promo-copy small {
  font-size:clamp(8px,4.7cqw,16px);
  line-height:1.36;
  text-wrap:balance;
}
.tf159-ad-stage .tf158-promo-action {
  padding:clamp(3px,3cqw,10px) clamp(6px,5cqw,20px);
  font-size:clamp(8px,4.5cqw,15px);
}
`;
const VERTICAL_CSS = `
:is(#tfEntryAdV56,#tfInteractionAdV57) {
  position:fixed;
  inset:0;
  z-index:2147483647;
  display:none;
  width:100%;
  height:100%;
  max-width:none;
  max-height:none;
  margin:0;
  padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));
  border:0;
  overflow:hidden;
  overscroll-behavior:contain;
  box-sizing:border-box;
  background:#050c18;
  color:#eff8ff;
  font-family:system-ui,sans-serif;
}
:is(#tfEntryAdV56,#tfInteractionAdV57).open {display:grid;place-items:center;}
:is(#tfEntryAdV56,#tfInteractionAdV57)[hidden] {display:none !important;}
:is(#tfEntryAdV56,#tfInteractionAdV57)::backdrop {background:#050c18;}
.tf159-ad-shell {
  display:grid;
  grid-template-rows:auto minmax(0,1fr) auto;
  align-items:stretch;
  gap:8px;
  width:min(100%,540px);
  height:100%;
  min-height:0;
}
.tf159-ad-label {
  justify-self:center;
  width:max-content;
  max-width:100%;
  padding:3px 9px;
  border:1px solid #416381;
  border-radius:999px;
  background:#0d2036;
  color:#c2e3f5;
  font:800 9px/1.3 system-ui,sans-serif;
  letter-spacing:.1em;
  text-transform:uppercase;
}
.tf159-ad-viewport {
  min-width:0;
  min-height:0;
  display:grid;
  place-items:center;
  container-type:size;
}
.tf159-ad-stage {
  position:relative;
  display:grid;
  place-items:center;
  width:min(100%,var(--tf-ad-native-width,1080px),max(24px,calc(56.25vh - 88px)));
  width:min(100%,var(--tf-ad-native-width,1080px),56.25cqh);
  min-width:0;
  aspect-ratio:9/16;
  background:#071324;
  box-shadow:0 0 0 1px #527a9b9c;
}
.tf159-ad-promo .tf159-ad-stage {border-radius:18px;box-shadow:none;}
.tf159-ad-stage > a,
.tf159-ad-stage :is(img,video) {
  display:block;
  width:100%;
  height:100%;
  min-width:0;
  min-height:0;
  object-fit:contain;
  object-position:center;
  image-rendering:auto;
  filter:none !important;
  opacity:1 !important;
  border:0;
  margin:0;
  padding:0;
}
.tf159-ad-footer {
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(132px,auto);
  align-items:center;
  gap:7px 10px;
}
.tf159-ad-timer {
  grid-area:1 / 1;
  min-width:0;
  display:grid;
  gap:7px;
}
.tf159-ad-timer[hidden],.tf-ad-goal-link[hidden] {display:none !important;}
.tf159-ad-timer strong {color:#d4e8fa;font:750 12px/1.25 system-ui,sans-serif;}
.tf159-ad-progress {
  height:5px;
  overflow:hidden;
  border-radius:999px;
  background:#253950;
}
.tf159-ad-progress > i {
  display:block;
  width:0;
  height:100%;
  border-radius:inherit;
  background:linear-gradient(95deg,#6af8ee,#8fa0ff);
}
.tf-ad-goal-link {
  grid-area:2 / 1 / auto / -1;
  display:grid;
  place-items:center;
  min-height:40px;
  padding:6px 10px;
  box-sizing:border-box;
  border:1px solid #578ab2;
  border-radius:10px;
  background:#122943;
  color:#d9f3ff;
  text-decoration:none;
  font:750 12px/1.25 system-ui,sans-serif;
  text-align:center;
  overflow-wrap:anywhere;
}
:is(#tfEntryAdV56,#tfInteractionAdV57) .tf159-ad-continue {
  grid-area:1 / 2;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  min-width:0;
  min-height:51px;
  padding:9px 14px;
  border:1px solid #bafbf8;
  border-radius:13px;
  background:linear-gradient(112deg,#69ffec,#9adaff 65%,#c8b2ff);
  color:#07192e;
  font:900 clamp(14px,4vw,18px)/1.2 system-ui,sans-serif;
  box-shadow:0 3px 16px #60e5f54a,inset 0 1px #f0fffed1;
  touch-action:manipulation;
  cursor:pointer;
}
.tf159-ad-continue > svg {width:18px;height:18px;flex:none;}
:is(#tfEntryAdV56,#tfInteractionAdV57) .tf159-ad-continue:disabled {
  color:#d5e8f7;
  border-color:#587a9a;
  background:#1a344e;
  box-shadow:none;
  cursor:default;
}
:is(#tfEntryAdV56,#tfInteractionAdV57).tf159-ad-promo .tf159-ad-continue {grid-column:1/-1;}
:is(#tfEntryAdV56,#tfInteractionAdV57) :is(.tf159-ad-continue,.tf-ad-goal-link):focus-visible {
  outline:2px solid #f0ffff;
  outline-offset:-3px;
}
@media (max-height:455px) {
  .tf159-ad-shell {gap:5px;}
  :is(#tfEntryAdV56,#tfInteractionAdV57) .tf159-ad-continue {min-height:44px;}
  .tf159-ad-stage > .tf158-promo {gap:4px;padding:3px;}
  .tf159-promo-hero {width:62%;}
  .tf159-ad-stage .tf158-promo-copy {gap:3px;}
}
`;

function addStyle(id, css) {
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.append(style);
}

const paidNoAds = () => Boolean(window.TaskFlowNoAds?.isActive?.());
const nativeWidth = width => width / Math.max(1, window.devicePixelRatio || 1) + 'px';

const PROMO_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10"/></svg>';
const PROMO_BANNER_ICON = `<span class="tf158-promo-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M5 17v-4m5 4V9m5 8v-6m5 6V6M4 9l5-4 4 2 7-5m-5 0h5v5"/></svg>
</span>`;
const PROMO_HERO = `<svg class="tf159-promo-hero" viewBox="0 0 220 172" fill="none" aria-hidden="true">
  <ellipse cx="111" cy="91" rx="101" ry="49" transform="rotate(-22 111 91)" stroke="#77f8f5" stroke-opacity=".23" stroke-width="1.3"/>
  <ellipse cx="112" cy="89" rx="104" ry="51" transform="rotate(27 112 89)" stroke="#b3a3ff" stroke-opacity=".26" stroke-width="1.3"/>
  <rect x="38" y="29" width="147" height="117" rx="23" fill="#0c1e37" stroke="#77b2e4" stroke-width="1.8"/>
  <path d="M60 121h105M60 100h105M60 79h105M60 58h105" stroke="#86b9dd" stroke-opacity=".23"/>
  <rect x="66" y="95" width="14" height="26" rx="4" fill="#4db4da"/>
  <rect x="88" y="83" width="14" height="38" rx="4" fill="#63dbe4"/>
  <rect x="110" y="88" width="14" height="33" rx="4" fill="#7ed7ff"/>
  <rect x="132" y="71" width="14" height="50" rx="4" fill="#9abaff"/>
  <rect x="154" y="54" width="14" height="67" rx="4" fill="#b7a5ff"/>
  <path d="m65 83 24-17 21 6 42-29m-16 1 18-3-4 15" stroke="#b2fff0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 52v14m-7-7h14M196 106v14m-7-7h14" stroke="#93fff2" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="186" cy="41" r="5" fill="#beabff"/>
  <circle cx="33" cy="131" r="4" fill="#75f2ed"/>
</svg>`;

function promoLink(placement) {
  const banner = placement === 'banner';
  const link = sponsorLink(ADS_MANAGER_URL, 'Publicar un anuncio en TaskFlow ADS');
  link.className = 'tf158-promo';
  link.rel = 'noopener noreferrer';
  link.innerHTML = `${banner ? PROMO_BANNER_ICON : PROMO_HERO}
    <span class="tf158-promo-copy">
      ${banner ? '' : '<span class="tf159-promo-brand">TaskFlow ADS</span>'}
      <strong>${banner ? 'Anuncia en TaskFlow' : 'Anuncia tu marca'}</strong>
      <small>${banner ? 'Crea tu campaña' : 'Publica y administra tus anuncios desde TaskFlow ADS.'}</small>
    </span>
    <span class="tf158-promo-action">${banner ? 'Publicar' : 'Crear campaña'}${PROMO_ARROW}</span>`;
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
    let finished = false;
    const timeout = setTimeout(failed, 16000);
    function finish(valid) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      node.removeEventListener(readyEvent, ready);
      node.removeEventListener('error', failed);
      if (!valid) disposeMedia(node);
      resolve(valid ? node : null);
    }
    async function ready() {
      const width = video ? node.videoWidth : node.naturalWidth;
      const height = video ? node.videoHeight : node.naturalHeight;
      if (!(video ? exactVideo(node) : exactImage(node)) ||
          (creative.mediaWidth && width !== creative.mediaWidth) ||
          (creative.mediaHeight && height !== creative.mediaHeight)) {
        finish(false);
        return;
      }
      try {
        if (!video && typeof node.decode === 'function') await node.decode();
        finish(true);
      } catch (_) {
        finish(false);
      }
    }
    function failed() { finish(false); }
    node.addEventListener(readyEvent, ready);
    node.addEventListener('error', failed);
    node.src = creative.src;
    if (!video && node.complete) queueMicrotask(ready);
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

function createVerticalAd({placement, id, part}) {
  let creative = null;
  let root, stage, button, timeLabel, progress, destination, timerBox, label;
  let media = null;
  let starting = false;
  let timer = 0;
  let elapsed = 0;
  let lastTick = 0;
  let clockActive = false;
  let reportedVisible = false;
  let showingPromo = false;
  let previousOverflow = '';
  let previousFocus = null;

  function build() {
    if (root) return;
    root = document.createElement('dialog');
    root.id = id;
    root.hidden = true;
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', placement === 'entry' ? 'Publicidad de ingreso' : 'Publicidad por interacción');
    root.innerHTML = `<section class="tf159-ad-shell">
      <div class="tf159-ad-label" tabindex="-1">Publicidad</div>
      <div class="tf159-ad-viewport"><div class="tf159-ad-stage" id="${part}Stage"></div></div>
      <footer class="tf159-ad-footer">
        <div class="tf159-ad-timer">
          <strong id="${part}Countdown"></strong>
          <div class="tf159-ad-progress" aria-hidden="true"><i id="${part}Progress"></i></div>
        </div>
        <button id="${part}${placement === 'entry' ? 'Continue' : 'Close'}" class="tf159-ad-continue" type="button">
          Continuar
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>
        </button>
      </footer>
    </section>`;
    stage = root.querySelector('#' + part + 'Stage');
    button = root.querySelector('button');
    timeLabel = root.querySelector('#' + part + 'Countdown');
    progress = root.querySelector('#' + part + 'Progress');
    timerBox = root.querySelector('.tf159-ad-timer');
    label = root.querySelector('.tf159-ad-label');
    destination = sponsorLink('#', 'Abrir anuncio');
    destination.removeAttribute('href');
    destination.className = 'tf-ad-goal-link';
    destination.hidden = true;
    button.after(destination);
    button.addEventListener('click', event => {
      event.stopPropagation();
      close();
    });
    root.addEventListener('cancel', event => {
      event.preventDefault();
      close();
    });
    root.addEventListener('close', () => {
      if (!root.open && media) close(true);
    });
    document.body.append(root);
  }

  function updateClock() {
    const ready = showingPromo || elapsed >= HOLD_MS;
    button.disabled = !ready;
    timerBox.hidden = showingPromo;
    const caption = ready ? 'Ya puedes continuar' : 'Podrás continuar en ' + Math.ceil((HOLD_MS - elapsed) / 1000) + ' s';
    if (timeLabel.textContent !== caption) timeLabel.textContent = caption;
    progress.style.width = Math.min(100, elapsed * 100 / HOLD_MS) + '%';
  }

  function advanceClock() {
    clearTimeout(timer);
    if (!media || showingPromo) return;
    const now = performance.now();
    const visible = !document.hidden && !document.documentElement.classList.contains('tf-paypal-noads-checking');
    if (clockActive) elapsed += Math.max(0, now - lastTick);
    clockActive = visible;
    lastTick = now;
    if (visible && !reportedVisible) {
      reportedVisible = true;
      document.dispatchEvent(new CustomEvent('taskflow:ads-media-visible', {detail: {placement}}));
    }
    updateClock();
    if (elapsed < HOLD_MS && !document.hidden) timer = setTimeout(advanceClock, Math.min(120, HOLD_MS - elapsed));
  }

  function fitMedia() {
    if (!media || showingPromo) return;
    stage.style.setProperty('--tf-ad-native-width', nativeWidth(media.videoWidth || media.naturalWidth));
  }

  function showMedia(node, selected) {
    build();
    showingPromo = Boolean(selected.promo);
    const url = selected.destination;
    const link = url && sponsorLink(url, selected.ctaLabel);
    label.textContent = showingPromo ? 'Espacio publicitario' : 'Publicidad';
    if (link) link.append(node);
    destination.hidden = !url;
    if (url) destination.href = url;
    else destination.removeAttribute('href');
    destination.textContent = selected.ctaLabel;
    destination.setAttribute('aria-label', selected.ctaLabel);
    root.classList.toggle('tf159-ad-promo', showingPromo);
    stage.replaceChildren(link || node);
    media = node;
    stage.style.removeProperty('--tf-ad-native-width');
    fitMedia();
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    elapsed = 0;
    clockActive = false;
    reportedVisible = false;
    updateClock();
    root.hidden = false;
    root.classList.add('open');
    if (typeof root.showModal === 'function') root.showModal();
    else root.setAttribute('open', '');
    (button.disabled ? label : button).focus({preventScroll: true});
    if (node instanceof HTMLVideoElement) playAdVideo(node, selected);
    advanceClock();
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
      if (creative !== selected || !canStart()) {
        disposeMedia(node);
        return false;
      }
      if (!node) {
        creative = null;
        document.dispatchEvent(new CustomEvent('taskflow:ad-media-rejected', {
          detail: {placement, src: selected.src},
        }));
        return false;
      }
      showMedia(node, selected);
      return true;
    } finally {
      starting = false;
    }
  }

  function close(force = false) {
    if (!media || (button.disabled && force !== true)) return false;
    const node = media;
    media = null;
    clearTimeout(timer);
    clockActive = false;
    disposeMedia(node);
    stage.replaceChildren();
    root.classList.remove('open');
    if (typeof root.close === 'function' && root.open) root.close();
    else root.removeAttribute('open');
    root.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (previousFocus?.isConnected) previousFocus.focus?.({preventScroll: true});
    previousFocus = null;
    document.dispatchEvent(new Event('taskflow:' + placement + '-ad-complete'));
    return true;
  }

  function setCreative(input) {
    const type = String(input?.type || '').toLowerCase();
    const src = adUrl(input?.src);
    creative = ['image', 'gif', 'video'].includes(type) && src ? {
      type, src, destination: adUrl(input.destination, true),
      mediaWidth: Number(input.mediaWidth) || 0, mediaHeight: Number(input.mediaHeight) || 0,
      ctaLabel: String(input.ctaLabel || 'Conocer más').slice(0, 42), sound: type === 'video' && input.sound === true,
    } : null;
    return Boolean(creative);
  }

  document.addEventListener('visibilitychange', advanceClock);
  window.addEventListener('resize', fitMedia, {passive: true});
  return {
    start, close, setCreative, isRunning: () => starting || Boolean(media),
    isOpen: () => Boolean(media), isSponsored: () => Boolean(media && !showingPromo),
    getCreative: () => creative && {...creative},
  };
}

const entry = createVerticalAd({placement: 'entry', id: 'tfEntryAdV56', part: 'tf56Entry'});
const interaction = createVerticalAd({placement: 'interaction', id: 'tfInteractionAdV57', part: 'tf57Touch'});
const adSpec = {
  width: WIDTH, height: HEIGHT, hdWidth: WIDTH * 2, hdHeight: HEIGHT * 2, ratio: '9:16',
  videoDurationSeconds: HOLD_MS / 1000, videoMaxDurationSeconds: VIDEO_MAX_SECONDS,
  videoFormats: ['mp4', 'webm'], videoSoundAllowed: true, audioPriority: true, audioResumeDelayMs: 1000,
};

let entryShown = false;
let interactionArmed = false;
let showTimer = 0;
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
    scheduleVerticalAds();
  } else {
    promoReady.delete(placement);
    promoTimers.set(placement, setTimeout(() => setPromoReady(placement, true), PROMO_WAIT_MS));
  }
}

const available = () => promosEnabled && !document.hidden && !permissionsOpen() && !paidNoAds();
const canPresent = () => available() && !document.documentElement.classList.contains('tf-paypal-noads-checking');
const choosing = () => window.TaskFlowSelectsV159?.isOpen() ||
  Boolean(document.querySelector('.tf-icon-picker.open,.tf-icon-sheet.tf-v102-detached-open'));
const canEnter = () => !entryShown && canPresent() && !choosing() && !interaction.isOpen();
async function showEntry() {
  if (!await entry.start(canEnter)) return false;
  entryShown = true;
  return true;
}
async function showInteraction() {
  const canShow = () => interactionArmed && canPresent() && !choosing() && !entry.isRunning() && entryShown;
  if (readCount() < REQUIRED_TAPS || !await interaction.start(canShow)) return false;
  interactionArmed = false;
  setCount(Math.max(0, readCount() - REQUIRED_TAPS));
  return true;
}
function scheduleVerticalAds() {
  if (showTimer) return;
  // Esperar a que termine la acción del toque antes de presentar el diálogo.
  showTimer = setTimeout(() => {
    showTimer = 0;
    if (!entryShown) {
      if (entry.getCreative() || promoReady.has('entry')) void showEntry();
    } else if (interactionArmed) void showInteraction();
  }, 0);
}

window.TaskFlowEntryAdV56 = {
  spec: Object.freeze({...adSpec, displaySeconds: HOLD_MS / 1000, imageFormats: ['jpg','jpeg','png','webp','gif']}),
  setCreative: entry.setCreative, show: showEntry, close: entry.close,
  getCreative: entry.getCreative, isRunning: entry.isRunning, isSponsored: entry.isSponsored, hasShown: () => entryShown,
};
window.TaskFlowInteractionAdV57 = {
  spec: Object.freeze({...adSpec, requiredInteractions: REQUIRED_TAPS, minimumDisplaySeconds: HOLD_MS / 1000,
    imageFormats: ['jpg','jpeg','png','webp'], gifFormat: 'gif'}),
  setCreative: interaction.setCreative, show: showInteraction, close: interaction.close,
  getCreative: interaction.getCreative, isRunning: interaction.isRunning, isSponsored: interaction.isSponsored,
  getCount: readCount, resetCount: () => setCount(0),
};

document.addEventListener('click', event => {
  if (!event.isTrusted || event.detail < 1 || !available() || entry.isOpen() || interaction.isOpen() ||
      event.target.closest?.('#tfPermissionGateT52,#tfEntryAdV56,#tfInteractionAdV57,.tf50-ad-slot')) return;
  interactionArmed = !event.target.closest?.('select,input:is([type="file"],[type="date"],[type="time"],[type="color"],[type="datetime-local"],[type="month"],[type="week"]),.date-field-premium,#tfProfilePhotoChange');
  setCount(readCount() + 1);
  document.dispatchEvent(new CustomEvent('taskflow:ad-interaction-count', {
    detail: {count: clickCount, required: REQUIRED_TAPS},
  }));
  scheduleVerticalAds();
}, true);

for (const name of ['permissions-ready', 'entry-ad-creative-ready', 'interaction-ad-creative-ready',
    'entry-ad-complete', 'ad-media-rejected', 'picker-settled']) {
  document.addEventListener('taskflow:' + name, scheduleVerticalAds);
}
document.addEventListener('visibilitychange', scheduleVerticalAds);
new MutationObserver(scheduleVerticalAds).observe(document.documentElement, {
  attributes: true, attributeFilter: ['class'],
});
window.addEventListener('pageshow', event => {
  if (event.persisted && !entry.isOpen()) {
    entryShown = false;
    setPromoReady('entry', false);
    document.dispatchEvent(new Event('taskflow:entry-ad-reentered'));
  }
  scheduleVerticalAds();
}, {passive: true});

addStyle('tfAdSlotsT50Style', BANNER_CSS);
addStyle('tfAdsPromoV159Style', PROMO_CSS);
addStyle('tfVerticalAdsV159Style', VERTICAL_CSS);
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
