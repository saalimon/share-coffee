// Recipe library view

import { $, $$, esc } from '../util.js';
import { icon } from '../icons.js';
import { RECIPES, CATS, METHODS } from '../data.js';
import { recipeCard, spotLayers } from '../ui.js';
import { getMine, getRecipe } from '../store.js';
import { openRecipeSheet, openEditor } from '../recipe-sheet.js';
import { reveal, tilt, magnetic, updateSeg } from '../motion.js';

export function render(root, query) {
  let cat = CATS.some((c) => c.id === query.get('c')) ? query.get('c') : 'all';

  root.innerHTML = `
    <section class="page-head wrap">
      <p class="eyebrow" data-reveal><span class="dot"></span>Recipes · สูตรมาตรฐาน</p>
      <h1 class="d-xl split">Recipes worth<br>repeating.</h1>
      <p class="lead muted" data-reveal>สูตรจากแชมป์โลกและบาริสต้าชื่อดัง พร้อมขั้นตอนจับเวลาทุกจังหวะการเท — หรือสร้างสูตรของคุณเอง แล้วแชร์ให้เพื่อนด้วยลิงก์เดียว</p>
    </section>
    <section class="wrap">
      <div class="seg seg-scroll filters" id="catSeg" role="group" aria-label="กรองตามประเภท" data-reveal>
        <span class="seg-ind" aria-hidden="true"></span>
        ${CATS.map((c) => `<button type="button" data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(c.label)}</button>`).join('')}
      </div>
      <div class="recipe-grid" id="grid" data-stagger></div>
    </section>`;

  const grid = $('#grid', root);
  const seg = $('#catSeg', root);

  function draw() {
    const mine = getMine();
    let list;
    if (cat === 'mine') list = mine;
    else if (cat === 'all') list = [...mine, ...RECIPES];
    else list = [...mine, ...RECIPES].filter((r) => (METHODS[r.method] || METHODS.other).cat === cat);

    const create = `
      <article class="spot spot-berry rcard-new" data-reveal>
        ${spotLayers()}
        <div class="stack" style="gap:12px">
          <p class="eyebrow">${icon('sparkle', 'ic-sm')} สูตรของคุณเอง</p>
          <h3>Make it<br>yours.</h3>
          <p>สร้างสูตรพร้อมขั้นตอนการเท บันทึกไว้ในเครื่อง แล้วส่งลิงก์ให้เพื่อนเปิดได้ทันที</p>
        </div>
        <button class="btn btn-primary magnetic" type="button" id="newRecipe" style="justify-self:start;align-self:flex-start">${icon('plus', 'ic-sm')} สร้างสูตรใหม่</button>
      </article>`;

    let html = '';
    if (cat === 'all' || cat === 'mine') html += create;
    if (!list.length && cat === 'mine') {
      html += `<div class="empty" data-reveal>${icon('book', 'ic-lg')}<p>ยังไม่มีสูตรของคุณ<br><span class="caption">สร้างใหม่ หรือกด “ทำสำเนาไปปรับ” จากสูตรมาตรฐาน</span></p></div>`;
    }
    html += list.map((r) => recipeCard(r)).join('');
    grid.innerHTML = html;
    $('#newRecipe', grid)?.addEventListener('click', () => openEditor());
    reveal(grid);
    tilt(grid);
    magnetic(grid);
  }

  function setCat(c) {
    cat = c;
    $$('[data-cat]', seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === c)));
    updateSeg(seg);
    history.replaceState(null, '', `${location.pathname}${location.search}#/recipes${c === 'all' ? '' : `?c=${c}`}`);
    draw();
  }

  seg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (b && b.dataset.cat !== cat) setCat(b.dataset.cat);
  });

  const open = (card) => {
    const r = getRecipe(card.dataset.recipe);
    if (r) openRecipeSheet(r);
  };
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-recipe]');
    if (card) open(card);
  });
  grid.addEventListener('keydown', (e) => {
    const card = e.target.closest('[data-recipe]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      open(card);
    }
  });

  const onChange = () => draw();
  window.addEventListener('recipes:changed', onChange);
  const onResize = () => updateSeg(seg, true);
  window.addEventListener('resize', onResize);

  draw();
  requestAnimationFrame(() => updateSeg(seg, true));

  return () => {
    window.removeEventListener('recipes:changed', onChange);
    window.removeEventListener('resize', onResize);
  };
}
