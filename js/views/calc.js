// Ratio calculator view

import { $, $$, esc, fmtNum, clamp, parseNum, store, holdRepeat, go, baseUrl } from '../util.js';
import { icon } from '../icons.js';
import { PRESETS, KIND_INFO, grindById, recipeFromCalc, RECIPES } from '../data.js';
import { springNumber, springTo, updateSeg } from '../motion.js';
import { spotLayers, recipeCard } from '../ui.js';
import { setAdhoc } from '../store.js';
import { openShareSheet } from '../share.js';
import { openRecipeSheet } from '../recipe-sheet.js';

const KEY = 'sc.calc.v1';
const DEF = { mode: 'brew', preset: 'pour', kind: 'pourover', dose: 15, water: 240, ratio: 16, lock: 'dose', cups: 2, cupSize: 200, absorb: true };
const LIMIT = { brew: [3, 30], yield: [1, 6] };
const SLIDE = { brew: [6, 20], yield: [1, 4] };
const CUP_SIZES = [150, 200, 250, 300, 350];

function guessKind(st) {
  if (st.mode === 'yield') return 'espresso';
  if (st.ratio <= 9) return 'cold';
  if (st.ratio <= 11) return 'moka';
  return st.kind && !['cold', 'moka', 'espresso'].includes(st.kind) ? st.kind : 'pourover';
}

function strengthText(st, kind) {
  const r = st.ratio;
  if (st.mode === 'yield') {
    if (r <= 1.6) return 'Ristretto — เข้มข้น บอดี้หนา หวานเด่น';
    if (r <= 2.6) return 'Normale — ชอตมาตรฐาน สมดุล';
    if (r <= 3.5) return 'Lungo — เบาลง ใสขึ้น เปรี้ยว–ขมชัดขึ้น';
    return 'Long shot — เบาและยาว';
  }
  if (kind === 'cold' || r <= 9) return 'Concentrate — ผสมน้ำหรือนมก่อนดื่ม';
  if (kind === 'moka' || r <= 11.5) return 'เข้มแบบ Moka — เกือบเหมือนเอสเปรสโซ';
  if (r <= 13.5) return 'เข้มมาก — เหมาะกับใส่นมหรือน้ำแข็ง';
  if (r <= 15.5) return 'เข้ม — บอดี้หนา รสชัด';
  if (r <= 17) return 'สมดุล — จุดเริ่มต้นที่ดีสำหรับทุกเมล็ด';
  if (r <= 18.6) return 'นุ่ม — ใกล้ Golden Cup ใส สว่าง';
  return 'อ่อน — เบาและใส';
}

export function render(root, query) {
  const st = { ...DEF, ...store.get(KEY, {}) };

  // shared calculator links: #/calc?m=brew&p=pour&d=15&r=16
  if (query.has('d') || query.has('r')) {
    const m = query.get('m') === 'yield' ? 'yield' : 'brew';
    st.mode = m;
    const p = PRESETS.find((x) => x.id === query.get('p') && x.mode === m);
    st.preset = p ? p.id : 'custom';
    if (p) st.kind = p.kind;
    st.ratio = clamp(parseNum(query.get('r')) || (m === 'yield' ? 2 : 16), ...LIMIT[m]);
    st.dose = clamp(parseNum(query.get('d')) || (m === 'yield' ? 18 : 15), 0.1, 2000);
    st.water = st.dose * st.ratio;
    st.lock = 'dose';
  }
  if (!['brew', 'yield'].includes(st.mode)) st.mode = 'brew';

  const popular = ['hoffmann-v60', 'kasuya-46', 'hoffmann-aeropress'].map((id) => RECIPES.find((r) => r.id === id));

  root.innerHTML = `
    <section class="page-head wrap">
      <p class="eyebrow" data-reveal><span class="dot"></span>Ratio calculator · เครื่องคำนวณอัตราส่วน</p>
      <h1 class="d-xxl split">Brew by<br>the numbers.</h1>
      <p class="lead muted" data-reveal>ใส่ปริมาณกาแฟหรือน้ำ เลือกอัตราส่วน แล้วปล่อยให้ตัวเลขทำงาน — คำนวณ จับเวลา และแชร์สูตรให้เพื่อนได้ในลิงก์เดียว</p>
    </section>

    <section class="wrap calc-grid">
      <div class="card calc-card" data-reveal>
        <div class="row-between">
          <div class="seg seg-sm" id="modeSeg" role="group" aria-label="โหมดการชง">
            <span class="seg-ind" aria-hidden="true"></span>
            <button type="button" data-mode="brew">ดริป / แช่</button>
            <button type="button" data-mode="yield">เอสเปรสโซ</button>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" id="resetCalc">${icon('reset', 'ic-sm')} รีเซ็ต</button>
        </div>

        <div class="chips" id="presetChips" role="group" aria-label="อัตราส่วนสำเร็จรูป"></div>

        <div class="ratio-block">
          <label class="label" for="ratioInput">อัตราส่วน กาแฟ : <span id="ratioOf">น้ำ</span></label>
          <div class="ratio-display num">
            <span>1</span><span class="ratio-colon">:</span><input class="ratio-input num" id="ratioInput" inputmode="decimal" autocomplete="off" aria-describedby="meterLabel">
          </div>
          <div class="slider-row">
            <button class="btn-icon" type="button" id="ratioDown" aria-label="ลดอัตราส่วน (เข้มขึ้น)">${icon('minus')}</button>
            <input type="range" class="slider" id="ratioSlider" aria-label="ปรับอัตราส่วน">
            <button class="btn-icon" type="button" id="ratioUp" aria-label="เพิ่มอัตราส่วน (อ่อนลง)">${icon('plus')}</button>
          </div>
          <div class="slider-scale caption muted"><span>← เข้มขึ้น</span><span>อ่อนลง →</span></div>
        </div>

        <div class="io-grid">
          <div class="io">
            <div class="io-head">
              <label class="label" for="doseInput">กาแฟ</label>
              <button class="lock" type="button" data-lock="dose" aria-label="ตรึงปริมาณกาแฟเมื่อเปลี่ยนอัตราส่วน">${icon('lock')}<span>ตรึงไว้</span></button>
            </div>
            <div class="stepper">
              <button type="button" id="doseDown" aria-label="ลดกาแฟ">${icon('minus')}</button>
              <input id="doseInput" class="num" inputmode="decimal" autocomplete="off">
              <span class="unit">g</span>
              <button type="button" id="doseUp" aria-label="เพิ่มกาแฟ">${icon('plus')}</button>
            </div>
          </div>
          <div class="io">
            <div class="io-head">
              <label class="label" for="waterInput" id="waterLabel">น้ำ</label>
              <button class="lock" type="button" data-lock="water" aria-label="ตรึงปริมาณน้ำเมื่อเปลี่ยนอัตราส่วน">${icon('lock')}<span>ตรึงไว้</span></button>
            </div>
            <div class="stepper">
              <button type="button" id="waterDown" aria-label="ลดน้ำ">${icon('minus')}</button>
              <input id="waterInput" class="num" inputmode="decimal" autocomplete="off">
              <span class="unit">g</span>
              <button type="button" id="waterUp" aria-label="เพิ่มน้ำ">${icon('plus')}</button>
            </div>
          </div>
        </div>

        <details class="cups" id="cupsBox">
          <summary><span class="row" style="gap:10px">${icon('cup')} คำนวณจากจำนวนแก้ว</span>${icon('chevron')}</summary>
          <div class="cups-body">
            <div class="field-row">
              <div class="field">
                <span class="label">จำนวนแก้ว</span>
                <div class="stepper stepper-sm">
                  <button type="button" id="cupsDown" aria-label="ลดจำนวนแก้ว">${icon('minus', 'ic-sm')}</button>
                  <input id="cupsInput" class="num" inputmode="numeric" aria-label="จำนวนแก้ว">
                  <span class="unit">แก้ว</span>
                  <button type="button" id="cupsUp" aria-label="เพิ่มจำนวนแก้ว">${icon('plus', 'ic-sm')}</button>
                </div>
              </div>
              <div class="field">
                <span class="label">ขนาดแก้ว</span>
                <div class="chips" id="cupSizes">${CUP_SIZES.map((s) => `<button type="button" class="chip" data-size="${s}"><b>${s}</b><span>ml</span></button>`).join('')}</div>
              </div>
            </div>
            <label class="check"><input type="checkbox" id="absorb"> ชดเชยน้ำที่กากกาแฟดูดไว้ (~2 g ต่อกาแฟ 1 g)</label>
            <p class="hint" id="cupsHint"></p>
          </div>
        </details>
      </div>

      <aside class="spot result-card" data-reveal aria-live="polite">
        ${spotLayers()}
        <p class="eyebrow">สูตรของคุณ</p>
        <div>
          <div class="result-main num"><span class="result-big" id="rWater">0</span><span class="result-unit">g</span></div>
          <p class="result-sub" id="rSub"></p>
        </div>
        <div class="result-stats">
          <div><span class="k" id="k1"></span><span class="v num" id="v1"></span></div>
          <div><span class="k" id="k2"></span><span class="v num" id="v2"></span></div>
          <div><span class="k" id="k3"></span><span class="v" id="v3"></span></div>
          <div><span class="k" id="k4"></span><span class="v" id="v4"></span></div>
        </div>
        <div class="meter">
          <div class="meter-track"><span class="meter-dot" id="meterDot"></span></div>
          <div class="meter-labels" id="meterLabels"></div>
          <p class="meter-label" id="meterLabel"></p>
        </div>
        <div class="result-actions">
          <button class="btn btn-primary magnetic" type="button" id="calcStart">${icon('timer', 'ic-sm')} เริ่มจับเวลา</button>
          <button class="btn btn-translucent" type="button" id="calcShare">${icon('share', 'ic-sm')} แชร์ตัวเลขนี้</button>
        </div>
      </aside>
    </section>

    <section class="wrap section">
      <div class="section-head">
        <div class="stack" style="gap:12px">
          <p class="eyebrow" data-reveal>สูตรยอดนิยม</p>
          <h2 class="d-lg split">Start with<br>a classic.</h2>
        </div>
        <a class="btn btn-secondary" href="#/recipes" data-reveal>ดูสูตรทั้งหมด ${icon('arrowRight', 'ic-sm')}</a>
      </div>
      <div class="recipe-grid" data-stagger id="popular">${popular.map((r) => recipeCard(r)).join('')}</div>
    </section>`;

  const el = {
    modeSeg: $('#modeSeg', root),
    chips: $('#presetChips', root),
    ratioIn: $('#ratioInput', root),
    slider: $('#ratioSlider', root),
    dose: $('#doseInput', root),
    water: $('#waterInput', root),
    waterLabel: $('#waterLabel', root),
    ratioOf: $('#ratioOf', root),
    cupsBox: $('#cupsBox', root),
    cups: $('#cupsInput', root),
    absorb: $('#absorb', root),
    cupsHint: $('#cupsHint', root),
    rWater: $('#rWater', root),
    rSub: $('#rSub', root),
    meterDot: $('#meterDot', root),
    meterLabel: $('#meterLabel', root),
    meterLabels: $('#meterLabels', root),
  };

  const limits = () => LIMIT[st.mode];
  const save = () => store.set(KEY, st);

  function renderChips() {
    el.chips.innerHTML = PRESETS.filter((p) => p.mode === st.mode)
      .map((p) => `<button type="button" class="chip" data-preset="${p.id}" aria-pressed="${p.id === st.preset}"><b>${esc(p.label)}</b><span>${esc(p.sub)}</span></button>`)
      .join('');
  }

  function setRatio(r, src) {
    const [lo, hi] = limits();
    st.ratio = clamp(Math.round(r * 100) / 100, lo, hi);
    if (st.lock === 'water') st.dose = st.water / st.ratio;
    else st.water = st.dose * st.ratio;
    const p = PRESETS.find((x) => x.id === st.preset);
    if (p && Math.abs(p.ratio - st.ratio) > 0.001) st.preset = 'custom';
    update(src);
  }

  function setDose(v, src) {
    st.dose = clamp(v, 0.1, 2000);
    st.water = st.dose * st.ratio;
    update(src);
  }

  function setWater(v, src) {
    st.water = clamp(v, 0.1, 20000);
    st.dose = st.water / st.ratio;
    update(src);
  }

  function applyCups() {
    const bev = st.cups * st.cupSize;
    let water = bev;
    if (st.mode === 'brew' && st.absorb && st.ratio > 2.5) water = bev / (1 - 2 / st.ratio);
    st.lock = 'water';
    st.water = water;
    st.dose = water / st.ratio;
    update('cups');
  }

  function update(src) {
    const yieldMode = st.mode === 'yield';
    const preset = PRESETS.find((p) => p.id === st.preset);
    if (preset) st.kind = preset.kind;
    const kind = preset ? preset.kind : guessKind(st);
    const info = KIND_INFO[kind] || KIND_INFO.pourover;
    const wd = yieldMode ? 1 : 0;

    // inputs
    if (src !== 'ratio') {
      el.ratioIn.value = fmtNum(st.ratio, yieldMode ? 1 : 1);
    }
    el.ratioIn.style.width = `${Math.max(1.6, el.ratioIn.value.length * 0.62 + 0.25)}em`;
    const [slo, shi] = SLIDE[st.mode];
    el.slider.min = slo;
    el.slider.max = shi;
    el.slider.step = yieldMode ? 0.1 : 0.1;
    if (src !== 'slider') el.slider.value = clamp(st.ratio, slo, shi);
    el.slider.style.setProperty('--p', `${((clamp(st.ratio, slo, shi) - slo) / (shi - slo)) * 100}%`);
    if (src !== 'dose') el.dose.value = fmtNum(st.dose, 1);
    if (src !== 'water') el.water.value = fmtNum(st.water, wd);
    el.waterLabel.textContent = yieldMode ? 'Yield — น้ำกาแฟที่ได้' : 'น้ำ';
    el.ratioOf.textContent = yieldMode ? 'น้ำกาแฟที่ได้' : 'น้ำ';
    if (src !== 'cupsInput') el.cups.value = st.cups;
    el.absorb.checked = st.absorb;
    el.cupsBox.hidden = yieldMode;
    $$('[data-size]', root).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.size) === st.cupSize)));
    const bevFromCups = st.cups * st.cupSize;
    el.cupsHint.textContent = `ต้องการเครื่องดื่ม ${bevFromCups} ml → ใช้น้ำ ${fmtNum(st.water, 0)} g กับกาแฟ ${fmtNum(st.dose, 1)} g`;

    // chips / seg / locks
    $$('[data-preset]', el.chips).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === st.preset)));
    $$('[data-mode]', el.modeSeg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === st.mode)));
    updateSeg(el.modeSeg);
    $$('[data-lock]', root).forEach((b) => {
      const on = b.dataset.lock === st.lock;
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('span').textContent = on ? 'ตรึงไว้' : 'ตรึง';
    });

    // results
    springNumber(el.rWater, st.water, (v) => fmtNum(v, wd));
    const bev = Math.max(0, st.water - 2 * st.dose);
    const set = (i, k, v) => {
      $(`#k${i}`, root).textContent = k;
      $(`#v${i}`, root).textContent = v;
    };
    if (yieldMode) {
      el.rSub.textContent = `Yield (น้ำกาแฟที่ได้) · จากกาแฟ ${fmtNum(st.dose, 1)} g ที่ 1:${fmtNum(st.ratio, 1)}`;
      const style = st.ratio <= 1.6 ? 'Ristretto' : st.ratio <= 2.6 ? 'Normale' : st.ratio <= 3.5 ? 'Lungo' : 'Long shot';
      const shot = st.ratio <= 1.6 ? '20–25 วิ' : st.ratio <= 2.6 ? '25–30 วิ' : '30–40 วิ';
      set(1, 'สไตล์', style);
      set(2, 'เวลาชอต', shot);
      set(3, 'อุณหภูมิน้ำ', info.temp);
      set(4, 'ระดับบด', grindById(info.grind).th);
    } else {
      let sub = `น้ำ · สำหรับกาแฟ ${fmtNum(st.dose, 1)} g ที่ 1:${fmtNum(st.ratio, 1)}`;
      if (kind === 'iced') {
        const ice = Math.round(st.water * 0.4);
        sub = `น้ำร้อน ${fmtNum(st.water - ice, 0)} g + น้ำแข็ง ${ice} g · กาแฟ ${fmtNum(st.dose, 1)} g`;
      }
      el.rSub.textContent = sub;
      set(1, kind === 'cold' ? 'ได้หัวเชื้อ' : 'ได้เครื่องดื่ม', `≈ ${fmtNum(bev, 0)} ml`);
      set(2, 'กาแฟต่อลิตร', `${fmtNum(1000 / st.ratio, 0)} g/L`);
      set(3, 'อุณหภูมิน้ำ', info.temp);
      set(4, 'ระดับบด', grindById(info.grind).th);
    }

    // strength meter
    const pos = yieldMode ? (st.ratio - 1) / 3 : (st.ratio - 12) / 8;
    springTo(el.meterDot, clamp(pos, 0, 1) * 100, (v) => { el.meterDot.style.left = `${v}%`; }, { stiffness: 160, damping: 16, from: 50 });
    el.meterLabels.innerHTML = yieldMode ? '<span>Ristretto</span><span>Normale</span><span>Lungo</span>' : '<span>เข้ม</span><span>สมดุล</span><span>อ่อน</span>';
    el.meterLabel.textContent = strengthText(st, kind);
    save();
  }

  /* ---------- events ---------- */

  el.modeSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b || b.dataset.mode === st.mode) return;
    st.mode = b.dataset.mode;
    if (st.mode === 'yield') {
      st.preset = 'espresso';
      st.ratio = 2;
      if (st.dose > 22 || st.dose < 7) st.dose = 18;
    } else {
      st.preset = 'pour';
      st.ratio = 16;
      if (st.dose < 8) st.dose = 15;
    }
    st.lock = 'dose';
    st.water = st.dose * st.ratio;
    renderChips();
    update();
  });

  el.chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-preset]');
    if (!b) return;
    const p = PRESETS.find((x) => x.id === b.dataset.preset);
    st.preset = p.id;
    st.kind = p.kind;
    setRatio(p.ratio);
  });

  el.slider.addEventListener('input', () => setRatio(parseFloat(el.slider.value), 'slider'));
  el.ratioIn.addEventListener('input', () => {
    const v = parseNum(el.ratioIn.value);
    const [lo, hi] = limits();
    if (v >= lo && v <= hi) setRatio(v, 'ratio');
    else el.ratioIn.style.width = `${Math.max(1.6, el.ratioIn.value.length * 0.62 + 0.25)}em`;
  });
  el.ratioIn.addEventListener('blur', () => update());
  el.ratioIn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') el.ratioIn.blur();
  });

  const rStep = () => (st.mode === 'yield' ? 0.1 : 0.5);
  holdRepeat($('#ratioDown', root), () => setRatio(Math.round((st.ratio - rStep()) / rStep()) * rStep()));
  holdRepeat($('#ratioUp', root), () => setRatio(Math.round((st.ratio + rStep()) / rStep()) * rStep()));

  const dStep = () => (st.mode === 'yield' ? 0.5 : 1);
  const wStep = () => (st.mode === 'yield' ? 1 : 10);
  holdRepeat($('#doseDown', root), () => setDose(Math.max(dStep(), Math.round((st.dose - dStep()) / dStep()) * dStep())));
  holdRepeat($('#doseUp', root), () => setDose(Math.round((st.dose + dStep()) / dStep()) * dStep()));
  holdRepeat($('#waterDown', root), () => setWater(Math.max(wStep(), Math.round((st.water - wStep()) / wStep()) * wStep())));
  holdRepeat($('#waterUp', root), () => setWater(Math.round((st.water + wStep()) / wStep()) * wStep()));

  el.dose.addEventListener('input', () => {
    const v = parseNum(el.dose.value);
    if (v > 0) setDose(v, 'dose');
  });
  el.water.addEventListener('input', () => {
    const v = parseNum(el.water.value);
    if (v > 0) setWater(v, 'water');
  });
  [el.dose, el.water].forEach((inp) => {
    inp.addEventListener('blur', () => update());
    inp.addEventListener('focus', () => inp.select());
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') inp.blur();
    });
  });

  $$('[data-lock]', root).forEach((b) =>
    b.addEventListener('click', () => {
      st.lock = b.dataset.lock;
      update();
    }),
  );

  // cups helper
  holdRepeat($('#cupsDown', root), () => {
    st.cups = Math.max(1, st.cups - 1);
    applyCups();
  });
  holdRepeat($('#cupsUp', root), () => {
    st.cups = Math.min(40, st.cups + 1);
    applyCups();
  });
  el.cups.addEventListener('input', () => {
    const v = Math.round(parseNum(el.cups.value));
    if (v >= 1 && v <= 40) {
      st.cups = v;
      applyCups();
    }
  });
  el.cups.addEventListener('blur', () => update());
  $('#cupSizes', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-size]');
    if (!b) return;
    st.cupSize = Number(b.dataset.size);
    applyCups();
  });
  el.absorb.addEventListener('change', () => {
    st.absorb = el.absorb.checked;
    applyCups();
  });
  el.cupsBox.addEventListener('toggle', () => {
    if (el.cupsBox.open) applyCups();
  });

  $('#resetCalc', root).addEventListener('click', () => {
    Object.assign(st, DEF);
    el.cupsBox.open = false;
    renderChips();
    update();
  });

  $('#calcStart', root).addEventListener('click', () => {
    const preset = PRESETS.find((p) => p.id === st.preset);
    const kind = preset ? preset.kind : guessKind(st);
    setAdhoc(recipeFromCalc({ mode: st.mode, kind, dose: st.dose, water: st.water, ratio: st.ratio }));
    go('#/timer?id=adhoc');
  });

  $('#calcShare', root).addEventListener('click', () => {
    const q = new URLSearchParams({ m: st.mode, p: st.preset, d: fmtNum(st.dose, 1), r: fmtNum(st.ratio, 2) });
    const url = `${baseUrl()}#/calc?${q}`;
    const unit = st.mode === 'yield' ? 'g (yield)' : 'g';
    openShareSheet({
      title: `${fmtNum(st.dose, 1)} g : ${fmtNum(st.water, st.mode === 'yield' ? 1 : 0)} ${unit}`,
      url,
      text: `กาแฟ ${fmtNum(st.dose, 1)} g ต่อน้ำ ${fmtNum(st.water, 0)} g (1:${fmtNum(st.ratio, 1)})`,
      preview: `<div class="preview-mini"><span class="micon">${icon('ratio')}</span><div><b>อัตราส่วน 1:${fmtNum(st.ratio, 1)}</b><span class="caption muted">กาแฟ ${fmtNum(st.dose, 1)} g · ${st.mode === 'yield' ? 'yield' : 'น้ำ'} ${fmtNum(st.water, st.mode === 'yield' ? 1 : 0)} g</span></div></div>`,
    });
  });

  $('#popular', root).addEventListener('click', (e) => {
    const card = e.target.closest('[data-recipe]');
    if (card) openRecipeSheet(RECIPES.find((r) => r.id === card.dataset.recipe));
  });
  $('#popular', root).addEventListener('keydown', (e) => {
    const card = e.target.closest('[data-recipe]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openRecipeSheet(RECIPES.find((r) => r.id === card.dataset.recipe));
    }
  });

  renderChips();
  update();
  requestAnimationFrame(() => updateSeg(el.modeSeg, true));
  const onResize = () => updateSeg(el.modeSeg, true);
  window.addEventListener('resize', onResize);

  return () => window.removeEventListener('resize', onResize);
}
