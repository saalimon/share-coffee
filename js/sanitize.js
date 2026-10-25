// Validate & normalise any recipe object — used for shared links (untrusted input),
// localStorage data and editor output.

import { METHODS, GRINDS } from './data.js';
import { clamp } from './util.js';

const str = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const num = (v, lo, hi, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? clamp(n, lo, hi) : fallback;
};
const optNum = (v, lo, hi) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? clamp(n, lo, hi) : null;
};

export function sanitizeRecipe(o, id) {
  if (!o || typeof o !== 'object') return null;
  const yieldMode = !!o.yield;
  const time = Math.round(num(o.time, 1, 172800, 180));
  let steps = Array.isArray(o.steps) ? o.steps.slice(0, 40) : [];
  steps = steps
    .filter((s) => s && typeof s === 'object')
    .map((s) => {
      const out = {
        t: Math.round(num(s.t, 0, time, 0)),
        label: str(s.label, 80) || 'ขั้นตอน',
      };
      const w = optNum(s.water, 0, 20000);
      if (w !== null) out.water = Math.round(w * 10) / 10;
      const note = str(s.note, 300);
      if (note) out.note = note;
      const p = optNum(s.pour, 0, 3600);
      if (p !== null) out.pour = Math.round(p);
      return out;
    })
    .sort((a, b) => a.t - b.t);
  if (!steps.length) steps = [{ t: 0, label: 'เริ่ม' }];
  const r = {
    id: id ?? o.id ?? null,
    name: str(o.name, 80) || 'สูตรไม่มีชื่อ',
    author: str(o.author, 60),
    method: METHODS[o.method] ? o.method : 'other',
    dose: Math.round(num(o.dose, 0.1, 2000, 15) * 10) / 10,
    water: Math.round(num(o.water, 0.1, 20000, 250) * 10) / 10,
    temp: optNum(o.temp, 0, 100),
    grind: GRINDS.some((g) => g.id === o.grind) ? o.grind : 'medium',
    time,
    steps,
  };
  if (yieldMode) r.yield = true;
  const ice = optNum(o.ice, 0, 10000);
  if (ice) r.ice = Math.round(ice);
  const desc = str(o.desc, 600);
  if (desc) r.desc = desc;
  if (o.updated) r.updated = Number(o.updated) || undefined;
  return r;
}
