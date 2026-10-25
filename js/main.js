// App shell: router, nav indicator, view transitions, language switch, shared-recipe import, offline support.

import { $, $$, parseHash } from './util.js';
import { t, getLang, setLang } from './i18n.js';
import { reveal, magnetic, tilt, updateSeg, reducedMotion } from './motion.js';
import { closeTopSheet, hasOpenSheet, toast } from './ui.js';
import { decodeRecipe, shareApp } from './share.js';
import { openRecipeSheet } from './recipe-sheet.js';
import * as calc from './views/calc.js';
import * as timer from './views/timer.js';
import * as recipes from './views/recipes.js';
import * as tools from './views/tools.js';

const VIEWS = {
  calc: { mod: calc, title: 'title.calc' },
  timer: { mod: timer, title: 'title.timer' },
  recipes: { mod: recipes, title: 'title.recipes' },
  tools: { mod: tools, title: 'title.tools' },
};

const viewEl = $('#view');
let cleanup = null;
let current = null;
let currentName = 'calc';
let first = true;

/* ---------- static shell text ---------- */

function applyShell() {
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
  document.title = `${t(VIEWS[currentName].title)} — Share Coffee`;
  requestAnimationFrame(() => $$('.seg').forEach((s) => updateSeg(s, true)));
}

function setActiveNav(route) {
  $$('[data-route]').forEach((a) => {
    if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  $$('.nav-tabs, .tabbar .seg').forEach((s) => updateSeg(s, first));
}

function mountView(name, query) {
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
    viewEl.innerHTML = `<section class="wrap page-head"><h1 class="d-lg">Something spilled.</h1><p class="lead muted">${t('err.view')}</p></section>`;
  }
  document.title = `${t(VIEWS[name].title)} — Share Coffee`;
  reveal(viewEl);
  magnetic(document);
  tilt(viewEl);
}

async function navigate() {
  const { route, query } = parseHash();
  const name = VIEWS[route] ? route : 'calc';
  const key = `${name}?${query}`;
  if (key === current) return;
  const sameView = current && current.startsWith(`${name}?`);
  current = key;
  currentName = name;

  setActiveNav(name);
  while (hasOpenSheet()) closeTopSheet();

  if (!first && !sameView && !reducedMotion()) {
    viewEl.classList.add('is-leaving');
    await new Promise((r) => setTimeout(r, 180));
  }
  mountView(name, query);
  if (!first && !sameView) window.scrollTo({ top: 0, behavior: 'instant' });
  viewEl.classList.remove('is-leaving');
  if (!first && !sameView) $('#main').focus({ preventScroll: true });
  first = false;
}

window.addEventListener('hashchange', navigate);

/* ---------- language switch ---------- */

$$('[data-lang]').forEach((b) =>
  b.addEventListener('click', () => {
    if (b.dataset.lang === getLang()) return;
    setLang(b.dataset.lang);
  }),
);

window.addEventListener('lang:changed', async () => {
  applyShell();
  while (hasOpenSheet()) closeTopSheet();
  const y = window.scrollY;
  if (!reducedMotion()) {
    viewEl.classList.add('is-leaving');
    await new Promise((r) => setTimeout(r, 160));
  }
  mountView(currentName, parseHash().query);
  viewEl.classList.remove('is-leaving');
  window.scrollTo({ top: y, behavior: 'instant' });
});

/* ---------- chrome ---------- */

const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

window.addEventListener('resize', () => $$('.nav-tabs, .tabbar .seg, .lang-seg').forEach((s) => updateSeg(s, true)));
$('#shareApp').addEventListener('click', shareApp);

// fonts can change pill widths after load
document.fonts?.ready.then(() => $$('.seg').forEach((s) => updateSeg(s, true)));

/* ---------- shared recipe link: ?r=<payload> ---------- */

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
    toast(t('err.badLink'), { iconName: 'info' });
    return;
  }
  openRecipeSheet(recipe, { shared: true, onClose: clean });
}

if (!location.hash) history.replaceState(null, '', `${location.pathname}${location.search}#/calc`);
applyShell();
navigate().then(handleSharedRecipe);

// offline support (GitHub Pages is https; skip on local dev servers)
if ('serviceWorker' in navigator && location.protocol === 'https:' && !/^(localhost|127\.)/.test(location.hostname)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
