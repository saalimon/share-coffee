// App shell: router, nav indicator, view transitions, shared-recipe import, offline support.

import { $, $$, parseHash } from './util.js';
import { reveal, magnetic, tilt, updateSeg, reducedMotion } from './motion.js';
import { closeTopSheet, hasOpenSheet, toast } from './ui.js';
import { decodeRecipe, shareApp } from './share.js';
import { openRecipeSheet } from './recipe-sheet.js';
import * as calc from './views/calc.js';
import * as timer from './views/timer.js';
import * as recipes from './views/recipes.js';
import * as tools from './views/tools.js';

const VIEWS = {
  calc: { mod: calc, title: 'คำนวณอัตราส่วน' },
  timer: { mod: timer, title: 'จับเวลาชง' },
  recipes: { mod: recipes, title: 'สูตรกาแฟ' },
  tools: { mod: tools, title: 'เครื่องมือ' },
};

const viewEl = $('#view');
let cleanup = null;
let current = null;
let first = true;

function setActiveNav(route) {
  $$('[data-route]').forEach((a) => {
    if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  $$('.nav-tabs, .tabbar .seg').forEach((s) => updateSeg(s, first));
}

async function navigate() {
  const { route, query } = parseHash();
  const name = VIEWS[route] ? route : 'calc';
  const key = `${name}?${query}`;
  if (key === current) return;
  const sameView = current && current.startsWith(`${name}?`);
  current = key;

  setActiveNav(name);
  while (hasOpenSheet()) closeTopSheet();

  if (!first && !sameView && !reducedMotion()) {
    viewEl.classList.add('is-leaving');
    await new Promise((r) => setTimeout(r, 180));
  }
  try {
    cleanup?.();
  } catch (e) {
    console.error(e);
  }
  cleanup = null;
  viewEl.innerHTML = '';
  try {
    cleanup = VIEWS[name].mod.render(viewEl, query) || null;
  } catch (e) {
    console.error(e);
    viewEl.innerHTML = '<section class="wrap page-head"><h1 class="d-lg">Something spilled.</h1><p class="lead muted">เกิดข้อผิดพลาด ลองรีเฟรชหน้าอีกครั้ง</p></section>';
  }
  document.title = `${VIEWS[name].title} — Share Coffee`;
  if (!first && !sameView) window.scrollTo({ top: 0, behavior: 'instant' });
  viewEl.classList.remove('is-leaving');
  reveal(viewEl);
  magnetic(document);
  tilt(viewEl);
  if (!first && !sameView) $('#main').focus({ preventScroll: true });
  first = false;
}

window.addEventListener('hashchange', navigate);

// nav border on scroll
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

window.addEventListener('resize', () => $$('.nav-tabs, .tabbar .seg').forEach((s) => updateSeg(s, true)));
$('#shareApp').addEventListener('click', shareApp);

// fonts can change pill widths after load
document.fonts?.ready.then(() => $$('.seg').forEach((s) => updateSeg(s, true)));

// shared recipe link: ?r=<payload>
async function handleSharedRecipe() {
  const params = new URLSearchParams(location.search);
  const payload = params.get('r');
  if (!payload) return;
  const clean = () => {
    params.delete('r');
    const qs = params.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  };
  const recipe = await decodeRecipe(payload);
  if (!recipe) {
    clean();
    toast('ลิงก์สูตรนี้เสียหายหรือไม่สมบูรณ์', { iconName: 'info' });
    return;
  }
  openRecipeSheet(recipe, { shared: true, onClose: clean });
}

if (!location.hash) history.replaceState(null, '', `${location.pathname}${location.search}#/calc`);
navigate().then(handleSharedRecipe);

// offline support (GitHub Pages is https; skip on local dev servers)
if ('serviceWorker' in navigator && location.protocol === 'https:' && !/^(localhost|127\.)/.test(location.hostname)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
