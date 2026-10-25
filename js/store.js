// Recipe persistence: standard library + "my recipes" (localStorage) + ad-hoc (session).

import { RECIPES } from './data.js';
import { store, session } from './util.js';
import { sanitizeRecipe } from './sanitize.js';

const MINE_KEY = 'sc.recipes.v1';
const ADHOC_KEY = 'sc.adhoc';

export function getMine() {
  const list = store.get(MINE_KEY, []);
  if (!Array.isArray(list)) return [];
  return list.map((r) => sanitizeRecipe(r, r.id)).filter(Boolean);
}

export function saveMine(recipe) {
  const list = getMine();
  const id = recipe.id && String(recipe.id).startsWith('my-') ? recipe.id : `my-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const clean = sanitizeRecipe({ ...recipe, id }, id);
  clean.updated = Date.now();
  const i = list.findIndex((r) => r.id === id);
  if (i >= 0) list[i] = clean;
  else list.unshift(clean);
  store.set(MINE_KEY, list);
  notify();
  return clean;
}

export function deleteMine(id) {
  store.set(MINE_KEY, getMine().filter((r) => r.id !== id));
  notify();
}

export function setAdhoc(recipe) {
  const clean = sanitizeRecipe({ ...recipe, id: 'adhoc' }, 'adhoc');
  session.set(ADHOC_KEY, clean);
  return clean;
}

export function getRecipe(id) {
  if (!id) return null;
  if (id === 'adhoc') {
    const r = session.get(ADHOC_KEY, null);
    return r ? sanitizeRecipe(r, 'adhoc') : null;
  }
  return RECIPES.find((r) => r.id === id) || getMine().find((r) => r.id === id) || null;
}

export const isMine = (r) => !!r && String(r.id).startsWith('my-');
export const isStandard = (r) => !!r && RECIPES.some((x) => x.id === r.id);

function notify() {
  window.dispatchEvent(new CustomEvent('recipes:changed'));
}
