// Shared UI building blocks: toasts, sheets, recipe cards & detail fragments.

import { esc, fmtNum, fmtTime, fmtDuration, $ } from './util.js';
import { icon } from './icons.js';
import { METHODS, CAT_LABEL, grindById, recipeRatio } from './data.js';
import { dragToDismiss, reveal, magnetic } from './motion.js';

/* ---------------- toast ---------------- */

export function toast(message, { iconName = 'check', ms = 2600 } = {}) {
  const root = document.getElementById('toasts');
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `${icon(iconName)}<span>${esc(message)}</span>`;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 600);
  }, ms);
}

/* ---------------- sheet / modal ---------------- */

const openSheets = [];

export function openSheet({ html, label = 'หน้าต่าง', wide = false, foot = '', onMount, onClose } = {}) {
  const root = document.getElementById('sheets');
  const layer = document.createElement('div');
  layer.className = 'sheet-layer';
  layer.innerHTML = `
    <div class="sheet-backdrop" data-close></div>
    <div class="sheet ${wide ? 'sheet-wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(label)}">
      <span class="sheet-grip" aria-hidden="true"></span>
      <span class="sheet-grip-zone" aria-hidden="true"></span>
      <button class="btn-icon sheet-close" data-close aria-label="ปิด">${icon('close')}</button>
      <div class="sheet-body">${html}</div>
      ${foot ? `<div class="sheet-foot">${foot}</div>` : ''}
    </div>`;
  root.appendChild(layer);
  const sheet = $('.sheet', layer);
  const prevFocus = document.activeElement;
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    layer.classList.add('is-closing');
    layer.classList.remove('is-open');
    sheet.style.setProperty('--drag', '0px');
    const i = openSheets.indexOf(api);
    if (i >= 0) openSheets.splice(i, 1);
    if (!openSheets.length) document.documentElement.style.overflow = '';
    setTimeout(() => layer.remove(), 380);
    onClose?.();
    if (prevFocus && document.contains(prevFocus)) prevFocus.focus({ preventScroll: true });
  };
  const api = { el: sheet, layer, close };
  openSheets.push(api);
  document.documentElement.style.overflow = 'hidden';

  layer.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) close();
  });
  dragToDismiss(sheet, $('.sheet-grip-zone', layer), close);

  requestAnimationFrame(() => {
    layer.classList.add('is-open');
    const first = sheet.querySelector('[autofocus]') || $('.sheet-close', sheet);
    first?.focus({ preventScroll: true });
  });
  onMount?.(sheet, api);
  reveal(sheet);
  magnetic(sheet);
  return api;
}

export function closeTopSheet() {
  const top = openSheets[openSheets.length - 1];
  if (top) {
    top.close();
    return true;
  }
  return false;
}

export const hasOpenSheet = () => openSheets.length > 0;

// focus trap for the top sheet
document.addEventListener('keydown', (e) => {
  if (!openSheets.length) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeTopSheet();
    return;
  }
  if (e.key !== 'Tab') return;
  const sheet = openSheets[openSheets.length - 1].el;
  const f = [...sheet.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((n) => !n.disabled && n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ---------------- spotlight decoration ---------------- */

export const spotLayers = (scrim = false) =>
  `<span class="blob b1" aria-hidden="true"></span><span class="blob b2" aria-hidden="true"></span><span class="grain" aria-hidden="true"></span>${scrim ? '<span class="scrim" aria-hidden="true"></span>' : ''}`;

/* ---------------- recipe fragments ---------------- */

export const methodOf = (r) => METHODS[r.method] || METHODS.other;
export const ratioText = (r) => `1:${fmtNum(recipeRatio(r), 1)}`;
export const waterUnit = (r) => (r.yield ? 'g out' : 'g');

export const tagText = (m) => {
  const c = CAT_LABEL[m.cat] || '';
  return !c || c === m.name ? m.name : `${m.name} · ${c}`;
};

export function recipeCard(r, { reveal: rv = true } = {}) {
  const m = methodOf(r);
  return `
    <article class="rcard" data-tilt tabindex="0" role="button" data-recipe="${esc(r.id)}" ${rv ? 'data-reveal' : ''} aria-label="${esc(r.name)} โดย ${esc(r.author || 'ไม่ระบุ')}">
      <div class="rcard-top">
        <span class="micon">${icon(m.icon)}</span>
        <span class="rcard-tag">${esc(tagText(m))}</span>
      </div>
      <h3 class="rcard-title">${esc(r.name)}</h3>
      <p class="rcard-author">${esc(r.author || 'สูตรของฉัน')}</p>
      <div class="rcard-stats">
        <span class="stat-chip"><b>${fmtNum(r.dose, 1)}</b>g</span>
        <span class="stat-chip"><b>${fmtNum(r.water, 1)}</b>${r.yield ? 'g out' : 'g'}</span>
        <span class="stat-chip"><b>${ratioText(r)}</b></span>
        <span class="stat-chip"><b>${fmtDuration(r.time)}</b></span>
      </div>
      <span class="rcard-arrow" aria-hidden="true">${icon('arrowUpRight', 'ic-sm')}</span>
      <span class="glare" aria-hidden="true"></span>
    </article>`;
}

export function detailStats(r) {
  const g = grindById(r.grind);
  const temp = r.temp == null ? 'น้ำเย็น' : `${fmtNum(r.temp, 0)}°C`;
  return `
    <div class="detail-stats">
      <div><span class="k">กาแฟ</span><span class="v">${fmtNum(r.dose, 1)} <small>g</small></span></div>
      <div><span class="k">${r.yield ? 'Yield (น้ำกาแฟที่ได้)' : 'น้ำ'}</span><span class="v">${fmtNum(r.water, 1)} <small>g</small></span></div>
      <div><span class="k">อัตราส่วน</span><span class="v">${ratioText(r)}</span></div>
      <div><span class="k">อุณหภูมิน้ำ</span><span class="v">${temp}</span></div>
      <div><span class="k">ระดับบด</span><span class="v">${esc(g.th)} <small>${esc(g.en)}</small></span></div>
      <div><span class="k">เวลารวม</span><span class="v">${fmtDuration(r.time)}</span></div>
      ${r.ice ? `<div><span class="k">น้ำแข็ง</span><span class="v">${fmtNum(r.ice, 0)} <small>g</small></span></div>` : ''}
    </div>`;
}

/** Step list. In the timer it's live (classes toggled); in sheets it's static. */
export function stepsList(r, { live = false } = {}) {
  let prev = 0;
  const items = r.steps
    .map((s, i) => {
      const w = s.water != null && s.water > prev ? s.water : null;
      const delta = w != null ? w - prev : 0;
      if (s.water != null) prev = Math.max(prev, s.water);
      return `
        <li class="step" data-i="${i}">
          <span class="step-time num">${fmtTime(s.t)}</span>
          <div class="step-body">
            <b>${esc(s.label)}</b>
            ${s.note ? `<p>${esc(s.note)}</p>` : ''}
            ${live ? '<span class="step-bar"><i></i></span>' : ''}
          </div>
          <span class="step-water num">${w != null ? `${fmtNum(w, 1)} g<small>+${fmtNum(delta, 1)} g</small>` : ''}</span>
        </li>`;
    })
    .join('');
  return `<ol class="steps ${live ? '' : 'is-static'}" ${live ? 'id="tSteps"' : ''}>${items}
    <li class="step" data-i="end">
      <span class="step-time num">${fmtTime(r.time)}</span>
      <div class="step-body"><b>เสร็จ</b><p>${r.yield ? 'หยุดชอตแล้วเสิร์ฟ' : 'เสิร์ฟได้เลย'}</p></div>
      <span class="step-water"></span>
    </li></ol>`;
}

export function chipBar(items, current, attr = 'data-v') {
  return items
    .map((it) => `<button type="button" ${attr}="${esc(it.id)}" aria-pressed="${it.id === current}">${esc(it.label)}</button>`)
    .join('');
}
