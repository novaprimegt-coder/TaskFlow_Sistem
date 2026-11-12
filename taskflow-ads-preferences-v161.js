/* Elecciones voluntarias de anuncios. Las preferencias de temas se guardan en este dispositivo. */
(() => {
'use strict';
const KEY = 'taskflow_ads_preferences_v161';
const TOPICS = {
  technology: 'Tecnología', education: 'Educación', sports: 'Deportes', food: 'Comida',
  entertainment: 'Entretenimiento', shopping: 'Compras', travel: 'Viajes', home: 'Hogar',
  business: 'Negocios', culture: 'Cultura',
};
const REGION_PATTERN = /^[\p{L}\p{M} .'’()-]{0,100}$/u;
const GT_REGIONS = ['Alta Verapaz','Baja Verapaz','Chimaltenango','Chiquimula','El Progreso','Escuintla','Guatemala','Huehuetenango','Izabal','Jalapa','Jutiapa','Petén','Quetzaltenango','Quiché','Retalhuleu','Sacatepéquez','San Marcos','Santa Rosa','Sololá','Suchitepéquez','Totonicapán','Zacapa'];
const COUNTRY_CODES = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
const supportedCountry = new Set(COUNTRY_CODES);
let dialog;
const preferenceKey = () => KEY + ':' + (window.TaskFlowFirebase?.getUser?.()?.uid || 'local');
const validTopics = value => Array.isArray(value) ? Object.keys(TOPICS).filter(topic => value.includes(topic)) : [];

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(preferenceKey()) || '{}');
    const area = value?.area;
    const valid = supportedCountry.has(area?.country) && typeof area.region === 'string' &&
      typeof area.city === 'string' && REGION_PATTERN.test(area.region) && REGION_PATTERN.test(area.city) && (!area.city || area.region);
    const learnFromActivity = value?.learnFromActivity === true;
    return {
      interests: validTopics(value?.interests),
      learnFromActivity,
      learned: learnFromActivity ? validTopics(value.learned) : [],
      area: valid ? {country: area.country, region: area.region, city: area.city} : null,
    };
  } catch (_) { return {interests: [], learnFromActivity: false, learned: [], area: null}; }
}

function save(value) {
  try {
    const key = preferenceKey();
    if (value.area || value.interests.length || value.learnFromActivity) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch (_) { return false; }
  document.dispatchEvent(new Event('taskflow:ad-preferences-updated'));
  return true;
}

function learnTopics(topics) {
  const current = read();
  if (!current.learnFromActivity) return;
  const additions = validTopics(topics).filter(topic => !current.interests.includes(topic) && !current.learned.includes(topic));
  if (additions.length) save({...current, learned: [...current.learned, ...additions]});
}

function countryOptions() {
  let names;
  try { names = new Intl.DisplayNames(['es'], {type: 'region'}); } catch (_) {}
  return COUNTRY_CODES.map(code => [code, names?.of(code) || code]).sort((a, b) => a[1].localeCompare(b[1], 'es'));
}

function fill(select, entries, placeholder, value) {
  select.replaceChildren(new Option(placeholder, ''));
  for (const [key, text] of entries) select.add(new Option(text, key));
  select.value = value && entries.some(([key]) => key === value) ? value : '';
}

function open() {
  if (dialog?.open) return;
  const accountKey = preferenceKey();
  const chosen = read();
  dialog = document.createElement('dialog');
  dialog.id = 'tf161AdPreferences';
  dialog.setAttribute('aria-labelledby', 'tf161AdPreferencesTitle');
  dialog.innerHTML = `
    <form>
      <header><h2 id="tf161AdPreferencesTitle">Preferencias de anuncios</h2><button type="button" class="tf161-ad-pref-close" aria-label="Cerrar">×</button></header>
      <p>Elige los temas que te interesan. Puedes dejarlos vacíos o cambiarlos cuando quieras.</p>
      <fieldset><legend>Temas</legend><div class="tf161-ad-topic-list"></div></fieldset>
      <fieldset><legend>Sugerencias <small>Opcional</small></legend>
        <label class="tf161-ad-learning"><input type="checkbox" name="learn">Sugerir temas según las rutinas que abro y los anuncios que pulso</label>
        <div class="tf161-ad-learned" hidden><p></p><button type="button">Borrar sugerencias</button></div>
      </fieldset>
      <fieldset><legend>Zona de anuncios <small>Opcional</small></legend>
        <p>Elige de qué zona te interesa recibir anuncios.</p>
        <div class="tf161-ad-area">
          <label>País<select name="country"></select></label>
          <label>Departamento o región<select name="region"></select></label>
          <label>Municipio o ciudad<select name="city"></select></label>
        </div>
      </fieldset>
      <p role="status" hidden></p>
      <footer><button type="button" class="tf161-ad-pref-clear">Borrar preferencias</button><button type="submit">Guardar preferencias</button></footer>
    </form>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const fields = form.elements;
  const suggestions = form.querySelector('.tf161-ad-learned');
  let learned = chosen.learned;
  fields.learn.checked = chosen.learnFromActivity;
  const updateSuggestions = () => {
    suggestions.hidden = !fields.learn.checked || !learned.length;
    suggestions.querySelector('p').textContent = learned.map(topic => TOPICS[topic]).join(', ');
  };
  fields.learn.addEventListener('change', updateSuggestions);
  suggestions.querySelector('button').addEventListener('click', () => {
    learned = [];
    updateSuggestions();
    fields.learn.focus();
  });
  updateSuggestions();
  const topics = form.querySelector('.tf161-ad-topic-list');
  for (const [key, name] of Object.entries(TOPICS)) {
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.name = 'interest';
    box.value = key;
    box.checked = chosen.interests.includes(key);
    label.append(box, document.createTextNode(name));
    topics.append(label);
  }
  const areas = window.TaskFlowADS?.getAdAreas?.() || [];
  if (chosen.area) areas.push(chosen.area);
  const options = names => [...new Set(names.filter(name => name && REGION_PATTERN.test(name)))].sort((a, b) => a.localeCompare(b, 'es')).map(name => [name, name]);
  const updateCities = (value = '') => {
    fill(fields.city, options(areas.filter(area => area.country === fields.country.value && area.region === fields.region.value).map(area => area.city)),
      'Toda la región', value);
    fields.city.disabled = fields.city.options.length <= 1;
  };
  const updateRegions = (value = '', city = '') => {
    const regions = areas.filter(area => area.country === fields.country.value).map(area => area.region);
    if (fields.country.value === 'GT') regions.push(...GT_REGIONS);
    fill(fields.region, options(regions), 'Todo el país', value);
    fields.region.disabled = fields.region.options.length <= 1;
    updateCities(city);
  };
  fill(fields.country, countryOptions(), 'Anuncios generales', chosen.area?.country);
  updateRegions(chosen.area?.region, chosen.area?.city);
  fields.country.addEventListener('change', () => updateRegions());
  fields.region.addEventListener('change', () => updateCities());
  const finish = value => {
    if (preferenceKey() !== accountKey) { dialog.close(); return; }
    if (save(value)) { dialog.close(); return; }
    const status = dialog.querySelector('[role="status"]');
    status.textContent = 'El navegador no pudo guardar las preferencias.';
    status.hidden = false;
  };
  form.addEventListener('submit', event => {
    event.preventDefault();
    finish({
      interests: [...topics.querySelectorAll('input:checked')].map(box => box.value),
      learnFromActivity: fields.learn.checked,
      learned: fields.learn.checked ? learned : [],
      area: fields.country.value ? {country: fields.country.value, region: fields.region.value, city: fields.city.value} : null,
    });
  });
  dialog.querySelector('.tf161-ad-pref-clear').addEventListener('click', () => finish({interests: [], area: null}));
  dialog.querySelector('.tf161-ad-pref-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    dialog.remove();
    dialog = null;
    document.dispatchEvent(new Event('taskflow:picker-settled'));
  }, {once: true});
  dialog.showModal();
}
function install() {
  const actions = document.getElementById('btnNoAds')?.parentElement;
  if (!actions || document.getElementById('tf161AdPreferencesButton')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'tf161AdPreferencesButton';
  button.className = 'quick-action-btn';
  button.innerHTML = '<span class="quick-action-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="2" fill="#153450"/><circle cx="15" cy="17" r="2" fill="#153450"/></svg></span><span>Preferencias de anuncios</span>';
  button.addEventListener('click', open);
  actions.append(button);
}

window.TaskFlowAdPreferencesV161 = Object.freeze({
  get() {
    const {interests, learned, area} = read();
    return {interests: [...new Set([...interests, ...learned])], area};
  },
  learnTopics,
});
document.addEventListener('click', event => {
  if (!event.isTrusted) return;
  const routine = event.target.closest?.('.v83-core-card.sung,.v83-core-card.legal,.v69-routine-launch,.v94-mentalist-launch');
  if (routine) learnTopics([routine.matches('.sung') ? 'sports' : 'education']);
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once: true});
else install();
window.addEventListener('storage', event => {
  if (event.key === preferenceKey()) document.dispatchEvent(new Event('taskflow:ad-preferences-updated'));
});
})();
