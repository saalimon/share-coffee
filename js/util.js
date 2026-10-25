// Small shared helpers

import { t } from './i18n.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const round = (v, d = 0) => {
  const p = 10 ** d;
  return Math.round(v * p) / p;
};

/** 16 → "16", 16.666 → "16.7", 0.5 → "0.5" */
export const fmtNum = (v, d = 1) => {
  if (!Number.isFinite(v)) return '–';
  const r = round(v, d);
  return Number.isInteger(r) ? String(r) : r.toFixed(d).replace(/0+$/, '').replace(/\.$/, '');
};

export function fmtTime(sec, { showHours = false } = {}) {
  sec = Math.max(0, Math.floor(sec + 1e-6));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h || showHours) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Human friendly duration: 3:30 / 12 h */
export function fmtDuration(sec) {
  if (sec >= 3600) {
    const h = sec / 3600;
    return `${fmtNum(h, 1)} ${t('c.hours')}`;
  }
  return fmtTime(sec);
}

/** "1:30" → 90, "90" → 90, "1:00:00" → 3600 */
export function parseTime(str) {
  const s = String(str ?? '').trim();
  if (!s) return NaN;
  const parts = s.split(':').map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return NaN;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

export const parseNum = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode) — app still works */
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};

export const session = {
  get(key, fallback) {
    try {
      const v = sessionStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
  },
};

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export const finePointer = () => matchMedia('(pointer: fine)').matches;

export function haptic(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
}

export function go(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

export function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  return { route: path || 'calc', query: new URLSearchParams(qs) };
}

export const baseUrl = () => `${location.origin}${location.pathname}`;

/** Repeat an action while a button is held, accelerating */
export function holdRepeat(btn, fn) {
  let timer = null;
  let delay = 380;
  const stop = () => {
    clearTimeout(timer);
    timer = null;
    delay = 380;
  };
  const tick = () => {
    fn();
    delay = Math.max(45, delay * 0.78);
    timer = setTimeout(tick, delay);
  };
  btn.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    fn();
    timer = setTimeout(tick, delay);
  });
  ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach((ev) => btn.addEventListener(ev, stop));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  });
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
