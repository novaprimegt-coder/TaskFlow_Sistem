/* Presentación vectorial del catálogo y los controles de TaskFlow. */
(function () {
'use strict';

const outlines = {
  focus: '<circle cx="12" cy="12" r="4"/><path d="M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5"/>',
  tasklist: '<path d="m3 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2M10 6h11m-11 6h11m-11 6h11"/>',
  checkcircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  schedule: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 2v4m10-4v4M3 9h18m-13 4h8m-8 4h5"/>',
  notes: '<path d="M6 3h12l2 2v16H6zM3 7h5m-5 5h5m-5 5h5m3-8h6m-6 4h6m-6 4h4"/>',
  streak: '<path d="M13 2c2 4 5 6 5 10 1 0 2-1 2-2 2 5 1 11-5 12h-4c-6-1-9-6-5-11 .2 2 1 3 2 3 0-5 4-7 5-12Z"/><path d="m13 12-3 5h3l-1 4 4-6h-3z"/>',
  house: '<path d="M2 11 12 3l10 8M5 10v11h14V10M9 21v-6h6v6m2-15V3h3v6"/>',
  sleep: '<path d="M15 2a7 7 0 1 0 7 7c-1.8 1.1-4.2.6-5.6-.8C15 6.7 14.5 4.3 15 2ZM3 20h12m-9-3h5"/>',
  rest: '<path d="M4 19h16M6 17a6 6 0 0 1 12 0M12 3v4m-7 0 2 2m12-2-2 2M3 13h2m14 0h2"/>',
  reading: '<path d="M12 6C8 3 4 4 2 5v14c3-1 7-2 10 1 3-3 7-2 10-1V5c-2-1-6-2-10 1v14M5 9l4 1m-4 3 4 1m6-4 4-1m-4 5 4-1"/>',
  lawbook: '<path d="M5 3h13v18H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m-2 15h13"/><path d="M13 7c-1.5-1.5-4 .7-2 2.2l2 1.6c2 1.6-.5 3.8-2 2.2m2-4c1.4-1 .5-2.4-.5-2.7m-1.5 6.7c-1.6.8-.9 2 .2 2.5"/>',
  libraryplace: '<path d="m2 9 10-6 10 6M4 10h16v11H4zM7 13v5m3-5v5m4-5v5m3-5v5"/>',
  justice: '<path d="M12 3v18m-5 0h10m-13-9 3-5 3 5a3 3 0 0 1-6 0Zm10 0 3-5 3 5a3 3 0 0 1-6 0ZM7 7h10"/><circle cx="12" cy="5" r="2"/>',
  office: '<path d="M3 21h18M5 21V4h9v17m0-12h5v12M8 8h3m-3 4h3m-3 4h3"/>',
  shield: '<path d="M12 22c5-2 8-6 8-11V5l-8-3-8 3v6c0 5 3 9 8 11Z"/><path d="m8 12 3 3 5-6"/>',
  safety: '<path d="M5 15a7 7 0 0 1 5-9m4 0a7 7 0 0 1 5 9M10 12V5h4v7M4 15h16a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 8 8 6 8-6"/>',
  cafeplace: '<path d="M3 10h18l-2-5H5l-2 5Zm2 0v11h14V10M8 21v-6h8v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
  maintenance: '<path d="M14 7 9 3 4 8l4 5m6-6-7 8m7-8 3 3m0 0 4-4m-4 4 4 4m-6 2 3 3m-6-1-3 3-3-3 3-3"/>',
  musicalnote: '<path d="M10 17V4l10-2v13M10 8l10-2"/><ellipse cx="7" cy="17" rx="3" ry="2"/><ellipse cx="17" cy="15" rx="3" ry="2"/>',
  museum: '<path d="m2 8 10-5 10 5H2Zm2 13h16M5 18h14M7 10v6m10-6v6"/><circle cx="12" cy="13" r="2"/>',
  growth: '<path d="M4 19h16M7 16v-3m5 3v-6m5 6V6M4 12l5-5 3 2 7-6m-4 0h4v4"/>',
  wellness: '<path d="M12 21C6 18 3 14 3 9c0-4 5-6 9-2 4-4 9-2 9 2 0 5-3 9-9 12Z"/><path d="M6 12h3l2-3 2 6 2-3h3"/>',
  naturewalk: '<path d="M6 3 2 9h8L6 3Zm0 6v4m15-6-4-5-4 5h8Zm-4 0v6M2 19c6-3 9-4 14-2 2 1 4 1 6 0M3 22c5-3 11-2 15 0"/>',
  gymplace: '<path d="M3 21V9l9-6 9 6v12H3Zm3-7h12M7 11v6m10-6v6m-7-4v2m4-2v2"/>',
  racket: '<ellipse cx="14" cy="9" rx="6" ry="7" transform="rotate(36 14 9)"/><path d="m10 15-6 7m7-14 7 4m-5-6-3 5m7-3-3 5"/>',
  medal2: '<path d="m5 3 4 8m10-8-4 8M5 3h5l2 6 2-6h5"/><circle cx="12" cy="16" r="5"/><path d="m10 16 1.4 1.4 2.6-3"/>',
  petfish: '<path d="M3 6h18m-16 0a8 8 0 1 0 14 0M8 21h8m0-10 2-2v5l-2-2c-2 3-5 3-7-1 2-3 5-3 7 0Z"/>',
  bottle2: '<path d="M8 3h8v3H8zm1 3v3l-3 3v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7l-3-3V6M6 13h12m-12 4h12"/>',
  mountainpeak: '<path d="m2 21 9-15 5 8 3-4 3 11H2Zm9-15V2l7 2-7 2m-4 6 4 2 3-2"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8 14-2 7 6-3 6 3-2-7m-7-5 2 2 3-4"/>',
  mindfulness: '<path d="M12 20C8 19 4 17 3 13c4-1 7 1 9 4 2-3 5-5 9-4-1 4-5 6-9 7Zm0-3c-3-3-3-8 0-12 3 4 3 9 0 12Z"/>',
  repair: '<path d="M14 4a5 5 0 0 0-5 6l-5 5a3 3 0 1 0 4 4l5-5a5 5 0 0 0 6-5l-4 2-3-3 2-4ZM6 17h.01"/>',
  officebuilding: '<path d="M4 21V3h11v18m0-14h5v14M3 21h18M7 7h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1m-3 6v-3m8-7v1m0 3v1"/>',
  flask: '<path d="M9 3h6m-5 0v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3M7 15h10m-6 2h.01m3 2h.01"/>',
};

const retained = [
  [0, 'checklist', 'Checklist', 'lista verificación', '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 8 1 1 2-2m-3 7 1 1 2-2m2-5h3m-3 6h3"/>'],
  [1, 'cleaning', 'Limpieza', 'limpiar brillo', '<path d="M9 3v8M5 7h8m6 5v6m-3-3h6M3 20l7-6 4 4-7 4H3Z"/>'],
  [2, 'languages', 'Idiomas', 'lenguas traducción', '<path d="M3 5h12m-6-2v2M6 8c1 3 3 5 6 7m1-10c-1 5-4 8-8 11m9 5 4-10 4 10m-6-3h4"/>'],
  [3, 'defense', 'Defensa jurídica', 'derecho abogacía', '<path d="M12 22c5-2 8-6 8-11V5l-8-3-8 3v6c0 5 3 9 8 11Z"/><path d="M12 7v9m-3 0h6m-6-6h6"/>'],
  [3, 'seal', 'Sello', 'certificado oficial', '<circle cx="12" cy="10" r="6"/><path d="m9 15-3 6 6-2 6 2-3-6m-5-5 1.5 1.5 2.5-3"/>'],
  [4, 'workmail', 'Correo laboral', 'trabajo mensaje correo', '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m3 8 9 6 9-6M9 6V3h6v3"/>'],
  [4, 'agenda', 'Agenda', 'planificar cita calendario', '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4m8-4v4M4 9h16m-12 4h4m-4 4h7"/>'],
];

const additional = [
  {title: 'Cuidado personal', icons: [
    ['skincare', 'Cuidado de la piel', 'crema hidratación', '<path d="M9 4h6v4H9zm-2 4h10l2 3v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z"/><path d="M12 11c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-3 3-5Z"/>'],
    ['toothbrush', 'Cepillo dental', 'dientes higiene', '<path d="M4 20 15 9m-3 3-2-2 6-6 4 4-6 6-2-2Zm5-7 2-2m0 4 2-2"/>'],
    ['comb', 'Peine', 'cabello peinado', '<path d="M4 17 17 4l3 3L7 20H4v-3Zm8-5 3 3m0-6 3 3m-9 3 3 3m6-12 3 3"/>'],
    ['sunscreen', 'Protector solar', 'sol piel bloqueador', '<path d="M7 3h10l-2 15H9L7 3Zm2 15h6v3H9z"/><circle cx="12" cy="10" r="2"/><path d="M12 6v1m0 6v1m-4-4h1m6 0h1"/>'],
    ['haircut', 'Corte de cabello', 'peluquería tijeras', '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8.3 7.7 12.7 11m-12.7-2.4L21 5"/>'],
    ['handwash', 'Lavarse las manos', 'jabón higiene agua', '<path d="M6 13v-3a1 1 0 0 1 2 0v3-6a1 1 0 0 1 2 0v6-8a1 1 0 0 1 2 0v8-6a1 1 0 0 1 2 0v8l2-2a2 2 0 0 1 3 2l-4 5H9l-4-4a2 2 0 0 1 1-3Zm12-8c1 1 2 2 2 3a2 2 0 0 1-4 0c0-1 1-2 2-3Z"/>'],
  ]},
  {title: 'Comunidad y servicio', icons: [
    ['volunteer', 'Voluntariado', 'ayuda manos comunidad', '<path d="m3 17 4-4h5a2 2 0 0 1 0 4h-2m2 0 5-3a2 2 0 0 1 3 1l-7 6H7l-4-4Zm9-8c-4-2-4-6-1-6 1 0 2 1 2 2 0-1 1-2 2-2 3 0 3 4-2 7Z"/>'],
    ['donation', 'Donación', 'donar caja solidaridad', '<path d="m3 10 9 4 9-4v10l-9 2-9-2V10Zm9 4v8M3 10l3-4 6 2 6-2 3 4"/><path d="M12 4c-3-2-3-4 0-3 3-1 3 1 0 3Z"/>'],
    ['recycling', 'Reciclaje', 'reutilizar ambiente', '<path d="m8 7 2-3a2 2 0 0 1 4 0l3 5m0-4v4h-4m6 3 2 4a2 2 0 0 1-2 3h-5m3 3-3-3 3-3m-8 3H5a2 2 0 0 1-2-3l3-5m-4 1 4-1 2 4"/>'],
    ['community', 'Comunidad', 'equipo vecinos', '<circle cx="12" cy="7" r="3"/><path d="M7 20v-3a5 5 0 0 1 10 0v3M4 7a2.5 2.5 0 0 1 0 5m16-5a2.5 2.5 0 0 0 0 5M1 19v-2a4 4 0 0 1 4-4m18 6v-2a4 4 0 0 0-4-4"/>'],
    ['fooddrive', 'Colecta de alimentos', 'comida donación', '<path d="M3 13h18l-2 8H5l-2-8ZM7 13l3-5m7 5-3-5m-5 8v2m6-2v2M12 7C8 4 10 2 12 4c2-2 4 0 0 3Z"/>'],
    ['mentor', 'Mentoría', 'enseñar asesoría', '<path d="M6 16H3V4h18v12h-8l-4 4v-4H6Zm1-7h10m-10 4h6"/><path d="m17 13 1 1 2-2"/>'],
  ]},
];

const accents = ['aqua','amber','blue','violet','mint','blue','aqua','amber','mint','coral','lime','amber','mint','blue',
  'coral','amber','blue','violet','aqua','amber','blue','violet','mint','blue','coral','mint'];
const categoryMarks = ['target','home','graduation','scales','briefcase','chip','chat','wallet','medkit','dumbbell',
  'trophy','apple','leaf','sun','paw','lion','map','palette','zen','medal','shield','building','glasses','atom','skincare','volunteer'];
const controlGlyphs = {
  bars: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  times: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'arrow-left': '<path d="M20 12H4m7-7-7 7 7 7"/>',
  trash: '<path d="M4 6h16M9 6V3h6v3m3 0-1 15H7L6 6m4 4v7m4-7v7"/>',
  save: '<path d="M4 3h13l3 3v15H4V3Zm4 0v6h8V3M8 21v-8h8v8"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m6 18 12-12"/>',
  'plus-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 8v8m-4-4h8"/>',
  'folder-plus': '<path d="M3 5h7l2 3h9v11H3V5Zm10 6v6m-3-3h6"/>',
  hourglass: '<path d="M6 3h12m-12 18h12M7 3v3c0 3 2 4 5 6-3 2-5 3-5 6v3M17 3v3c0 3-2 4-5 6 3 2 5 3 5 6v3M9 18l3-2 3 2"/>',
  camera: '<path d="M4 7h4l2-3h4l2 3h4a2 2 0 0 1 2 2v10H2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="3.5"/>',
};

function svgMarkup(path, className) {
  return '<svg class="' + className + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + path + '</svg>';
}

function install(library, groups, renderSvg, nativePicker) {
  for (const [key, path] of Object.entries(outlines)) library[key].path = path;
  const add = (group, [key, label, keywords, path]) => {
    library[key] = {label, keywords: keywords + ' ' + group.title, path};
    group.keys.push(key);
  };
  for (const [index, ...icon] of retained) add(groups[index], icon);
  for (const {title, icons} of additional) {
    const group = {title, keys: []};
    groups.push(group);
    for (const icon of icons) add(group, icon);
  }

  const tones = new Map(groups.flatMap((group, i) => group.keys.map(key => [key, accents[i]])));
  const svg = (key, className = 'tf-ui-icon') => renderSvg(key, className + ' tf158-native-icon');
  let serial = 0;

  function buildPicker(...args) {
    const picker = nativePicker(...args);
    const {wrap} = picker;
    const sheet = wrap.querySelector('.tf-icon-sheet');
    const button = wrap.querySelector('.tf-icon-picker-button');
    const nav = sheet.querySelector('.tf-icon-category-nav');
    const search = sheet.querySelector('.tf-icon-search');
    const close = sheet.querySelector('.tf-icon-catalog-close');
    const title = sheet.querySelector('.tf-icon-catalog-title');
    const id = 'tf158IconCatalog' + ++serial;
    sheet.id = id;
    sheet.classList.add('tf158-icon-catalog');
    sheet.setAttribute('aria-modal', 'true');
    button.setAttribute('aria-controls', id);
    close.innerHTML = svgMarkup(controlGlyphs.times, 'tf158-system-glyph');
    title.querySelector('span').textContent = tones.size + ' iconos · ' + groups.length + ' categorías';
    search.setAttribute('aria-label', 'Buscar iconos');
    search.placeholder = 'Buscar un icono';
    const categoryOptions = groups.map((group, index) => ({
      label: group.title, tone: accents[index], icon: svg(categoryMarks[index]),
    }));
    const category = window.TaskFlowSelectsV159?.create({
      label: 'Categoría de iconos',
      category: true,
      onChoose(index) {
        nav.children[index]?.onclick?.();
        decorate();
      },
    });
    if (category) {
      nav.hidden = true;
      nav.before(category.wrap);
    }

    function decorate() {
      const index = Math.max(0, [...nav.children].findIndex(tab => tab.classList.contains('active')));
      category?.setState(categoryOptions, index);
      const heading = sheet.querySelector('.tf-icon-group-title');
      if (heading && !heading.querySelector('svg')) {
        const mark = document.createElement('span');
        mark.className = 'tf158-category-mark';
        mark.dataset.tone = accents[index];
        mark.innerHTML = svg(search.value ? 'target' : categoryMarks[index]);
        heading.prepend(mark);
      }
      for (const option of sheet.querySelectorAll('.tf-icon-option')) {
        option.dataset.tone = tones.get(option.dataset.iconKey);
        option.setAttribute('aria-pressed', String(option.classList.contains('active')));
      }
      button.setAttribute('aria-expanded', String(wrap.classList.contains('open')));
    }
    search.addEventListener('input', decorate);
    button.addEventListener('click', () => {
      decorate();
      if (wrap.classList.contains('open')) (category?.toggle || close).focus({preventScroll: true});
      else settleCatalog();
    });
    function settleCatalog() {
      category?.close();
      document.dispatchEvent(new Event('taskflow:picker-settled'));
    }
    sheet.addEventListener('click', event => {
      if (!event.target.closest('.tf-icon-option,.tf-icon-catalog-close')) return;
      settleCatalog();
      decorate();
      button.focus({preventScroll: true});
    });
    sheet.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      picker.close();
      settleCatalog();
      decorate();
      button.focus({preventScroll: true});
    });
    const setValue = picker.setValue;
    picker.setValue = value => { setValue(value); decorate(); };
    decorate();
    return picker;
  }

  const glyphAliases = {
    edit:'pencil', 'calendar-alt':'calendar', 'calendar-day':'calendar', fire:'fire', clock:'clock',
    'check-circle':'checkcircle', 'check-square':'checkbox', 'list-check':'tasklist', 'shield-alt':'shield',
    folder:'folder', bell:'notification', 'share-alt':'share', 'exclamation-triangle':'warning',
    'trash-alt':'trash', 'sign-out-alt':'arrow-left', 'user-circle':'contact',
  };

  function refreshLegacyIcon(icon) {
    const glyph = [...icon.classList].find(name => name.startsWith('fa-'))?.slice(3);
    const name = glyphAliases[glyph] || glyph;
    const path = controlGlyphs[name] || library[name]?.path;
    if (!path || icon.dataset.tf158Glyph === name ||
        (icon.querySelector('svg') && !icon.classList.contains('tf158-fa'))) return;
    icon.dataset.tf158Glyph = name;
    icon.classList.add('tf158-fa');
    icon.innerHTML = svgMarkup(path, 'tf158-system-glyph');
  }

  const legacy = 'i[class*="fa-"]';
  function paintStatic(scope) {
    if (scope.matches?.(legacy)) refreshLegacyIcon(scope);
    for (const icon of scope.querySelectorAll?.(legacy) || []) refreshLegacyIcon(icon);
  }
  function paintStreak() {
    const bestRow = document.querySelector('#statUnifiedStreak .v28-streak-best');
    const current = document.getElementById('unifiedStreakValue');
    const best = document.getElementById('unifiedStreakBestValue');
    if (!bestRow || !current || !best) return;
    const meter = document.createElement('div');
    meter.className = 'tf158-streak-meter';
    meter.setAttribute('aria-hidden', 'true');
    meter.append(document.createElement('i'));
    bestRow.append(meter);
    function update() {
      const record = Number(best.textContent);
      const today = Number(current.textContent);
      const progress = record > 0 && Number.isFinite(today) ? Math.max(0, Math.min(100, today * 100 / record)) : 0;
      meter.style.setProperty('--tf158-streak', progress + '%');
    }
    const observer = new MutationObserver(update);
    for (const value of [current, best]) observer.observe(value, {childList: true, characterData: true, subtree: true});
    update();
  }
  function paintChrome() {
    paintStatic(document);
    paintStreak();
    const countdown = document.querySelector('.reset-countdown-icon');
    if (countdown) countdown.innerHTML = svgMarkup(controlGlyphs.hourglass, 'tf158-system-glyph');
    const observer = new MutationObserver(records => {
      for (const {target, type, addedNodes} of records) {
        if (type === 'attributes' && target.matches(legacy)) refreshLegacyIcon(target);
        for (const node of addedNodes) if (node.nodeType === 1) paintStatic(node);
      }
    });
    observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintChrome, {once:true});
  else paintChrome();
  return {svg, picker: buildPicker};
}

window.TaskFlowIconsV158 = {install};
})();
