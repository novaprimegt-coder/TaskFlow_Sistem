/* Selectores de TaskFlow. Los formularios conservan su valor y sus eventos nativos. */
(function () {
'use strict';

const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
let activePicker = null;
let serial = 0;

function create({label, onChoose, category = false}) {
  const wrap = document.createElement('div');
  wrap.className = 'tf159-picker' + (category ? ' tf159-category-picker' : '');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'tf159-picker-toggle';
  toggle.setAttribute('aria-haspopup', 'listbox');
  toggle.setAttribute('aria-expanded', 'false');
  const text = document.createElement('span');
  const mark = document.createElement('span');
  mark.className = 'tf159-picker-mark';
  mark.setAttribute('aria-hidden', 'true');
  const arrow = document.createElement('span');
  arrow.className = 'tf159-picker-arrow';
  arrow.innerHTML = CHEVRON;
  toggle.append(mark, text, arrow);
  const menu = document.createElement('div');
  menu.className = 'tf159-picker-menu';
  menu.id = 'tf159PickerOptions' + ++serial;
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', label);
  menu.hidden = true;
  toggle.setAttribute('aria-controls', menu.id);
  wrap.append(toggle, menu);

  let options = [];
  let selected = -1;
  let typing = '';
  let typedAt = 0;

  function paintMark(element, option) {
    element.hidden = !option?.icon;
    element.innerHTML = option?.icon || '';
    if (option?.tone) element.dataset.tone = option.tone;
    else delete element.dataset.tone;
  }

  function render() {
    const current = options[selected];
    text.textContent = current?.label || 'Seleccionar';
    paintMark(mark, current);
    toggle.setAttribute('aria-label', label + ': ' + text.textContent);
    if (menu.hidden) return;
    const focused = menu.contains(document.activeElement) ? Number(document.activeElement.dataset.index) : -1;
    menu.replaceChildren(...options.flatMap((option, index) => {
      if (option.hidden) return [];
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'tf159-picker-option';
      item.dataset.index = String(index);
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(index === selected));
      item.tabIndex = -1;
      item.disabled = Boolean(option.disabled);
      if (option.icon) {
        const badge = document.createElement('span');
        badge.className = 'tf159-picker-mark';
        badge.setAttribute('aria-hidden', 'true');
        paintMark(badge, option);
        item.append(badge);
      }
      const copy = document.createElement('span');
      copy.className = 'tf159-picker-option-label';
      copy.textContent = option.label;
      const check = document.createElement('span');
      check.className = 'tf159-picker-check';
      check.innerHTML = CHECK;
      item.append(copy, check);
      item.addEventListener('click', () => choose(index));
      return [item];
    }));
    if (focused >= 0) focusIndex(focused);
  }

  function focusIndex(index) {
    const item = menu.querySelector('[data-index="' + index + '"]:not(:disabled)');
    if (!item) return;
    item.focus({preventScroll: true});
    const area = menu.getBoundingClientRect();
    const row = item.getBoundingClientRect();
    if (row.bottom > area.bottom) menu.scrollTop += row.bottom - area.bottom;
    if (row.top < area.top) menu.scrollTop -= area.top - row.top;
  }

  function enabledIndices() {
    return options.flatMap((item, index) => item.disabled || item.hidden ? [] : [index]);
  }

  function setState(items, index, disabled = false) {
    options = items;
    selected = index;
    toggle.disabled = disabled || !enabledIndices().length;
    if (toggle.disabled) close();
    render();
  }

  function close(restoreFocus = false) {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (activePicker === picker) activePicker = null;
    if (restoreFocus && toggle.isConnected) toggle.focus({preventScroll: true});
    document.dispatchEvent(new Event('taskflow:picker-settled'));
  }

  function open() {
    if (toggle.disabled || !menu.hidden) return;
    activePicker?.close();
    activePicker = picker;
    const anchor = toggle.getBoundingClientRect();
    const bounds = wrap.closest('.tf-icon-sheet,.window-content')?.getBoundingClientRect();
    const below = Math.min(innerHeight, bounds?.bottom ?? innerHeight) - anchor.bottom;
    const above = anchor.top - Math.max(0, bounds?.top ?? 0);
    const flip = below < 190 && above > below;
    wrap.classList.toggle('tf159-picker-above', flip);
    menu.style.setProperty('--tf159-menu-height', Math.max(96, Math.min(400, (flip ? above : below) - 10)) + 'px');
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    render();
    const indices = enabledIndices();
    focusIndex(indices.includes(selected) ? selected : indices[0]);
  }

  function choose(index) {
    if (options[index]?.disabled || options[index]?.hidden) return;
    close(true);
    onChoose(index);
  }

  toggle.addEventListener('click', () => menu.hidden ? open() : close(true));
  wrap.addEventListener('keydown', event => {
    if (event.defaultPrevented) return;
    if (event.key === 'Tab' && !menu.hidden) {
      close(true);
      return;
    }
    const indices = enabledIndices();
    if (!indices.length) return;
    const key = event.key;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      if (menu.hidden) { open(); return; }
      const current = indices.indexOf(Number(document.activeElement?.dataset.index));
      if (key === 'Home') focusIndex(indices[0]);
      else if (key === 'End') focusIndex(indices.at(-1));
      else focusIndex(indices[(current + (key === 'ArrowDown' ? 1 : -1) + indices.length) % indices.length]);
    } else if (!menu.hidden && key.length === 1 && key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = performance.now();
      typing = (now - typedAt < 650 ? typing : '') + key.toLocaleLowerCase('es');
      typedAt = now;
      const match = indices.find(i => options[i].label.toLocaleLowerCase('es').startsWith(typing));
      if (match !== undefined) {
        event.preventDefault();
        focusIndex(match);
      }
    }
  });

  const picker = {wrap, toggle, setState, close};
  return picker;
}

function enhanceSelect(select) {
  if (select.classList.contains('tf159-select-source') || select.multiple || select.size > 1) return;
  const label = select.getAttribute('aria-label') || select.labels?.[0]?.textContent.trim() ||
    select.parentElement.querySelector(':scope > label')?.textContent.trim() || 'Seleccionar opción';
  const picker = create({
    label,
    onChoose(index) {
      if (select.selectedIndex === index) return;
      select.selectedIndex = index;
      select.dispatchEvent(new Event('input', {bubbles: true}));
      select.dispatchEvent(new Event('change', {bubbles: true}));
    },
  });
  function sync() {
    picker.wrap.hidden = select.hidden;
    picker.setState([...select.options].map(option => ({
      label: option.label, disabled: option.disabled || Boolean(option.closest('optgroup[disabled]')), hidden: option.hidden,
    })), select.selectedIndex, select.disabled);
  }
  select.classList.add('tf159-select-source');
  select.after(picker.wrap);
  select.addEventListener('change', () => {
    picker.toggle.removeAttribute('aria-invalid');
    sync();
  });
  select.addEventListener('invalid', event => {
    event.preventDefault();
    picker.toggle.setAttribute('aria-invalid', 'true');
    picker.toggle.focus();
  });
  select.form?.addEventListener('reset', () => setTimeout(sync, 0));
  picker.toggle.addEventListener('focus', sync);
  new MutationObserver(sync).observe(select, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['disabled', 'hidden', 'label', 'selected', 'value'], characterData: true,
  });
  sync();
}

function enhance(scope) {
  if (scope.matches?.('select.form-select')) enhanceSelect(scope);
  for (const select of scope.querySelectorAll?.('select.form-select') || []) enhanceSelect(select);
}

window.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !activePicker?.wrap.contains(event.target)) return;
  event.preventDefault();
  event.stopPropagation();
  activePicker.close(true);
}, true);

document.addEventListener('pointerdown', event => {
  if (activePicker && !activePicker.wrap.contains(event.target)) activePicker.close();
}, true);

function initialize() {
  enhance(document);
  new MutationObserver(records => {
    if (activePicker && !activePicker.wrap.isConnected) activePicker.close();
    for (const record of records) {
      for (const node of record.addedNodes) if (node.nodeType === 1) enhance(node);
    }
  }).observe(document.body, {childList: true, subtree: true});
}

window.TaskFlowSelectsV159 = {create, isOpen: () => Boolean(activePicker?.wrap.isConnected)};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once: true});
else initialize();
})();
