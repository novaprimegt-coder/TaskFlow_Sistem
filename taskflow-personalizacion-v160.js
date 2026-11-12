/* Accesos frecuentes a partir de un registro opcional y local. */
(() => {
'use strict';

const STORAGE_KEY = 'taskflow_personalizacion_v160';
const SHORTCUTS = [
  ['habits', '#statTotalHabits', 'Hábitos'],
  ['tasks', '#statTotalTareas', 'Tareas'],
  ['sung', '.v83-core-card.sung', 'Sung Jin-Woo'],
  ['law', '.v83-core-card.legal', 'Dominio jurídico'],
  ['socrates', '.v69-routine-launch.socrates', 'Sócrates'],
  ['machiavelli', '.v69-routine-launch.machiavelli', 'Maquiavelo'],
  ['mentalist', '.v94-mentalist-launch', 'Mentalista'],
];
const MAX_AGE = 30 * 86400000;

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return value?.enabled === true ? value : null;
  } catch (_) { return null; }
}
function save(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (_) { return false; }
}
function scores(value) {
  return value?.at > Date.now() - MAX_AGE ? value.counts || {} : {};
}
function preferred(value) {
  const counts = scores(value);
  return SHORTCUTS.filter(([id, selector]) => counts[id] > 0 && document.querySelector(selector)?.getClientRects().length)
    .sort(([a], [b]) => counts[b] - counts[a])[0];
}

let enabled = read();
let panel;
function render() {
  if (!panel) return;
  const shortcut = preferred(enabled);
  panel.querySelector('input').checked = Boolean(enabled);
  const button = panel.querySelector('button');
  button.hidden = !shortcut;
  if (shortcut) button.textContent = 'Abrir ' + shortcut[2];
}
function install() {
  const card = document.querySelector('#tfProfileOverlay .tf-profile-card');
  if (!card || (panel && card.contains(panel))) return;
  panel = document.createElement('section');
  panel.className = 'tf160-preferences';
  panel.innerHTML = `
    <label><input type="checkbox" aria-describedby="tf160PreferenceNote"><strong>Recordar mis accesos frecuentes</strong></label>
    <p id="tf160PreferenceNote">Opcional. Solo en este dispositivo. Al desactivarlo se borra la actividad guardada.</p>
    <button type="button" hidden></button>
    <span role="status"></span>`;
  card.appendChild(panel);
  panel.querySelector('input').addEventListener('change', event => {
    const value = event.target.checked ? {enabled: true, at: Date.now(), counts: {}} : null;
    const saved = save(value);
    if (saved) enabled = value;
    panel.querySelector('[role="status"]').textContent = saved ? '' : 'El navegador no pudo guardar la preferencia.';
    render();
  });
  panel.querySelector('button').addEventListener('click', () => {
    const shortcut = preferred(enabled);
    if (!shortcut) return;
    const launch = document.querySelector(shortcut[1]);
    document.getElementById('tfProfileClose')?.click();
    launch?.click();
  });
  render();
}

window.addEventListener('click', event => {
  if (!enabled || !event.isTrusted) return;
  const target = event.target;
  const item = SHORTCUTS.find(([, selector]) => target.closest?.(selector));
  if (!item) return;
  const counts = {...scores(enabled)};
  counts[item[0]] = Math.min(100, (Number(counts[item[0]]) || 0) + 1);
  const next = {enabled: true, at: Date.now(), counts};
  if (save(next)) enabled = next;
  render();
}, true);

window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY) { enabled = read(); render(); }
});
document.addEventListener('DOMContentLoaded', install, {once: true});
document.addEventListener('click', event => {
  if (event.target.closest?.('#tfProfileButton')) { install(); render(); }
});
})();
