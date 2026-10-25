// Brewing tools: extraction yield, bean rest, water temperature, grind chart, converter, cost per cup.

import { $, $$, esc, fmtNum, clamp, parseNum, store, todayISO } from '../util.js';
import { icon } from '../icons.js';
import { GRINDS, ROASTS, REST } from '../data.js';
import { springTo, springNumber, updateSeg } from '../motion.js';
import { spotLayers } from '../ui.js';

const KEY = 'sc.tools.v1';

const EY_MODES = {
  filter: { dose: 15, bev: 225, tds: 1.3, y: [0.9, 1.7], yStep: 0.2, ideal: [1.15, 1.35], bevLabel: 'น้ำกาแฟที่ได้ (g)' },
  espresso: { dose: 18, bev: 36, tds: 9.5, y: [6, 14], yStep: 2, ideal: [8, 12], bevLabel: 'Yield (g)' },
};
const X_RANGE = [14, 26];
const CH = { W: 340, H: 246, L: 40, R: 330, T: 24, B: 208 };

function chartSvg(mode) {
  const cfg = EY_MODES[mode];
  const X = (v) => CH.L + ((v - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * (CH.R - CH.L);
  const Y = (v) => CH.B - ((v - cfg.y[0]) / (cfg.y[1] - cfg.y[0])) * (CH.B - CH.T);
  let g = '';
  for (let x = X_RANGE[0]; x <= X_RANGE[1]; x += 2) {
    g += `<line class="grid-l" x1="${X(x)}" x2="${X(x)}" y1="${CH.T}" y2="${CH.B}"/><text x="${X(x)}" y="${CH.B + 16}" text-anchor="middle">${x}</text>`;
  }
  const yd = cfg.yStep < 1 ? 1 : 0;
  for (let y = cfg.y[0]; y <= cfg.y[1] + 1e-9; y += cfg.yStep) {
    g += `<line class="grid-l" x1="${CH.L}" x2="${CH.R}" y1="${Y(y)}" y2="${Y(y)}"/><text x="${CH.L - 8}" y="${Y(y) + 3}" text-anchor="end">${y.toFixed(yd)}</text>`;
  }
  const ix = [X(18), X(22)];
  const iy = [Y(cfg.ideal[1]), Y(cfg.ideal[0])];
  const cx = [(CH.L + ix[0]) / 2, (ix[0] + ix[1]) / 2, (ix[1] + CH.R) / 2];
  const cy = [(CH.T + iy[0]) / 2 + 3, (iy[0] + iy[1]) / 2 + 3, (iy[1] + CH.B) / 2 + 3];
  const zones = [
    ['เข้ม · สกัดน้อย', 'เข้ม', 'เข้ม · สกัดมาก'],
    ['สกัดน้อย', 'IDEAL', 'สกัดมาก'],
    ['อ่อน · สกัดน้อย', 'อ่อน', 'อ่อน · สกัดมาก'],
  ];
  let z = '';
  zones.forEach((row, ri) => row.forEach((t, ci) => {
    z += `<text class="zone ${t === 'IDEAL' ? 'zone-ideal' : ''}" x="${cx[ci]}" y="${cy[ri]}" text-anchor="middle">${t}</text>`;
  }));
  return `
    <svg class="chart" viewBox="0 0 ${CH.W} ${CH.H}" role="img" aria-label="Brew control chart">
      ${g}
      <rect class="ideal" x="${ix[0]}" y="${iy[0]}" width="${ix[1] - ix[0]}" height="${iy[1] - iy[0]}" rx="4"/>
      ${z}
      <text x="${(CH.L + CH.R) / 2}" y="${CH.H - 2}" text-anchor="middle">Extraction yield (%)</text>
      <text x="${CH.L}" y="${CH.T - 12}" text-anchor="start">TDS (%)</text>
      <g id="eyDot"><circle class="halo" r="15"/><circle class="dot" r="6.5"/></g>
    </svg>`;
}

export function render(root) {
  const saved = store.get(KEY, {});
  const st = {
    eyMode: saved.eyMode === 'espresso' ? 'espresso' : 'filter',
    ey: { filter: { ...EY_MODES.filter, ...(saved.ey?.filter || {}) }, espresso: { ...EY_MODES.espresso, ...(saved.ey?.espresso || {}) } },
    roastDate: saved.roastDate || todayISO(-12),
    restType: saved.restType === 'espresso' ? 'espresso' : 'filter',
    roast: ROASTS.some((r) => r.id === saved.roast) ? saved.roast : 'medium',
    grind: GRINDS.some((g) => g.id === saved.grind) ? saved.grind : 'mfine',
    cost: { price: 450, bag: 250, dose: 15, extra: 0, cafe: 80, ...(saved.cost || {}) },
  };
  const save = () => store.set(KEY, { eyMode: st.eyMode, ey: { filter: pick(st.ey.filter), espresso: pick(st.ey.espresso) }, roastDate: st.roastDate, restType: st.restType, roast: st.roast, grind: st.grind, cost: st.cost });
  const pick = (o) => ({ dose: o.dose, bev: o.bev, tds: o.tds });

  root.innerHTML = `
    <section class="page-head wrap">
      <p class="eyebrow" data-reveal><span class="dot"></span>Tools · เครื่องมือ</p>
      <h1 class="d-xl split">Dial it in.</h1>
      <p class="lead muted" data-reveal>เครื่องมือเล็กๆ ที่ช่วยให้แก้วต่อไปดีกว่าเดิม — วัดการสกัด เช็กวันพักเมล็ด เลือกอุณหภูมิและระดับบด แปลงหน่วย และคิดต้นทุนต่อแก้ว</p>
    </section>

    <section class="wrap tools-grid" data-stagger>
      <!-- Extraction yield -->
      <article class="card tool span-2" data-reveal id="eyTool">
        <div class="card-head">
          <div><p class="eyebrow">${icon('drop', 'ic-sm')} Extraction yield</p><h2 class="card-title">วัดการสกัด (EY%)</h2></div>
          <div class="seg seg-sm" id="eySeg" role="group" aria-label="ประเภท">
            <span class="seg-ind" aria-hidden="true"></span>
            <button type="button" data-ey="filter">Filter</button>
            <button type="button" data-ey="espresso">Espresso</button>
          </div>
        </div>
        <div class="tool-grid-2">
          <div class="stack" style="gap:18px">
            <div class="inputs-3 keep">
              <label class="field"><span class="label">กาแฟ (g)</span><span class="unit-input"><input class="input" id="eyDose" inputmode="decimal"><span class="u">g</span></span></label>
              <label class="field"><span class="label" id="eyBevLbl">น้ำกาแฟที่ได้ (g)</span><span class="unit-input"><input class="input" id="eyBev" inputmode="decimal"><span class="u">g</span></span></label>
              <label class="field"><span class="label">TDS</span><span class="unit-input"><input class="input" id="eyTds" inputmode="decimal"><span class="u">%</span></span></label>
            </div>
            <div>
              <p class="label">Extraction yield</p>
              <p class="big-out num" style="margin-top:8px"><span id="eyOut">0</span><small>%</small></p>
            </div>
            <div class="row" style="flex-wrap:wrap;gap:8px"><span class="badge" id="eyBadge"></span><span class="badge" id="tdsBadge"></span></div>
            <p class="verdict" id="eyVerdict"></p>
            <p class="hint">EY = TDS × น้ำกาแฟที่ได้ ÷ กาแฟ · วัด TDS ด้วย refractometer · ช่วงแนะนำอิงจาก SCA Brewing Control Chart</p>
          </div>
          <div id="eyChart"></div>
        </div>
      </article>

      <!-- Bean rest -->
      <article class="spot spot-sunset tool" data-reveal id="restTool">
        ${spotLayers(true)}
        <div class="card-head" style="margin-bottom:0">
          <div><p class="eyebrow">${icon('calendar', 'ic-sm')} Bean rest</p><h2 class="card-title">เมล็ดพักมากี่วันแล้ว?</h2></div>
        </div>
        <div class="field-row">
          <label class="field"><span class="label" style="color:rgba(255,255,255,.8)">วันที่คั่ว</span><input type="date" class="input" id="roastDate"></label>
          <div class="field"><span class="label" style="color:rgba(255,255,255,.8)">ใช้ชงแบบ</span>
            <div class="seg seg-sm" id="restSeg" role="group" aria-label="ประเภทการชง">
              <span class="seg-ind" aria-hidden="true"></span>
              <button type="button" data-rest="filter">Filter</button>
              <button type="button" data-rest="espresso">Espresso</button>
            </div>
          </div>
        </div>
        <p class="big-out num"><span id="restDays">0</span><small>วันหลังคั่ว</small></p>
        <p class="meter-label" id="restLabel"></p>
        <div>
          <div class="rest-bar" id="restBar"><i class="rest-marker" id="restMarker"></i></div>
          <div class="rest-legend" style="margin-top:8px"><span>คั่ว</span><span>30 วัน</span><span>60+ วัน</span></div>
        </div>
      </article>

      <!-- Water temperature -->
      <article class="card tool" data-reveal id="tempTool">
        <div class="card-head" style="margin-bottom:0">
          <div><p class="eyebrow">${icon('thermo', 'ic-sm')} Water temperature</p><h2 class="card-title">อุณหภูมิน้ำตามระดับคั่ว</h2></div>
        </div>
        <div class="seg seg-sm" id="roastSeg" role="group" aria-label="ระดับการคั่ว" style="justify-self:start">
          <span class="seg-ind" aria-hidden="true"></span>
          ${ROASTS.map((r) => `<button type="button" data-roast="${r.id}">${esc(r.label)}</button>`).join('')}
        </div>
        <div>
          <p class="big-out num" id="tempOut">90–94<small>°C</small></p>
          <p class="muted num" id="tempF" style="margin-top:8px"></p>
        </div>
        <div>
          <div class="thermo"><span class="thermo-fill" id="thermoFill"></span></div>
          <div class="thermo-scale"><span>80°</span><span>85°</span><span>90°</span><span>95°</span><span>100°C</span></div>
        </div>
        <p class="verdict" id="tempNote"></p>
        <p class="hint">SCA แนะนำน้ำ 90–96°C สำหรับการชงทั่วไป · บนที่สูงน้ำเดือดต่ำกว่า 100°C</p>
      </article>

      <!-- Grind -->
      <article class="card tool span-2" data-reveal id="grindTool">
        <div class="card-head" style="margin-bottom:0">
          <div><p class="eyebrow">${icon('grind', 'ic-sm')} Grind size</p><h2 class="card-title">ระดับการบด</h2></div>
        </div>
        <div class="grind-scale" role="group" aria-label="เลือกระดับการบด">
          ${GRINDS.map((g) => `<button type="button" class="grind-dot" data-grind="${g.id}"><i style="width:${g.size}px;height:${g.size}px"></i><span>${esc(g.en)}</span></button>`).join('')}
        </div>
        <div class="grind-detail" id="grindDetail"></div>
        <p class="hint">ขนาดอนุภาคเป็นค่าโดยประมาณ แต่ละเครื่องบดตั้งค่าไม่เหมือนกัน — ใช้รสชาติเป็นตัวตัดสินสุดท้าย</p>
      </article>

      <!-- Converter -->
      <article class="card tool" data-reveal id="convTool">
        <div class="card-head" style="margin-bottom:0">
          <div><p class="eyebrow">${icon('swap', 'ic-sm')} Converter</p><h2 class="card-title">แปลงหน่วย</h2></div>
        </div>
        <div class="conv" id="conv"></div>
      </article>

      <!-- Cost -->
      <article class="card tool" data-reveal id="costTool">
        <div class="card-head" style="margin-bottom:0">
          <div><p class="eyebrow">${icon('coin', 'ic-sm')} Cost per cup</p><h2 class="card-title">ต้นทุนต่อแก้ว</h2></div>
        </div>
        <div class="inputs-2">
          <label class="field"><span class="label">ราคาเมล็ดต่อถุง</span><span class="unit-input"><input class="input" data-cost="price" inputmode="decimal"><span class="u">฿</span></span></label>
          <label class="field"><span class="label">น้ำหนักถุง</span><span class="unit-input"><input class="input" data-cost="bag" inputmode="decimal"><span class="u">g</span></span></label>
          <label class="field"><span class="label">กาแฟต่อแก้ว</span><span class="unit-input"><input class="input" data-cost="dose" inputmode="decimal"><span class="u">g</span></span></label>
          <label class="field"><span class="label">นม / แก้ว / อื่นๆ</span><span class="unit-input"><input class="input" data-cost="extra" inputmode="decimal"><span class="u">฿</span></span></label>
        </div>
        <div class="row-between" style="align-items:flex-end">
          <div><p class="label">ต่อแก้ว</p><p class="big-out num" style="margin-top:8px"><span id="costOut">0</span><small>฿</small></p></div>
          <p class="muted caption" id="costCups" style="text-align:right"></p>
        </div>
        <label class="field"><span class="label">เทียบกับร้านกาแฟแก้วละ</span><span class="unit-input"><input class="input" data-cost="cafe" inputmode="decimal"><span class="u">฿</span></span></label>
        <p class="verdict" id="costSave"></p>
      </article>
    </section>`;

  /* ---------- extraction yield ---------- */
  const ey = {
    seg: $('#eySeg', root),
    dose: $('#eyDose', root),
    bev: $('#eyBev', root),
    tds: $('#eyTds', root),
    out: $('#eyOut', root),
    chart: $('#eyChart', root),
  };
  const dotKey = {};
  function eyFill() {
    const v = st.ey[st.eyMode];
    ey.dose.value = fmtNum(v.dose, 1);
    ey.bev.value = fmtNum(v.bev, 1);
    ey.tds.value = fmtNum(v.tds, 2);
    $('#eyBevLbl', root).textContent = EY_MODES[st.eyMode].bevLabel;
    ey.chart.innerHTML = chartSvg(st.eyMode);
    $$('[data-ey]', ey.seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ey === st.eyMode)));
    updateSeg(ey.seg);
  }
  function eyCalc() {
    const cfg = EY_MODES[st.eyMode];
    const v = st.ey[st.eyMode];
    const val = v.dose > 0 ? (v.tds * v.bev) / v.dose : 0;
    springNumber(ey.out, val, (x) => fmtNum(x, 1));
    const dot = $('#eyDot', root);
    const X = CH.L + ((clamp(val, X_RANGE[0], X_RANGE[1]) - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * (CH.R - CH.L);
    const Y = CH.B - ((clamp(v.tds, cfg.y[0], cfg.y[1]) - cfg.y[0]) / (cfg.y[1] - cfg.y[0])) * (CH.B - CH.T);
    springTo(dotKey, X, (x) => { dot.dataset.x = x; dot.setAttribute('transform', `translate(${x} ${dot.dataset.y || Y})`); }, { stiffness: 150, damping: 15, from: (CH.L + CH.R) / 2 });
    springTo(ey, Y, (y) => { dot.dataset.y = y; dot.setAttribute('transform', `translate(${dot.dataset.x || X} ${y})`); }, { stiffness: 150, damping: 15, from: (CH.T + CH.B) / 2 });

    const eyOk = val >= 18 && val <= 22;
    const [lo, hi] = cfg.ideal;
    const tdsOk = v.tds >= lo && v.tds <= hi;
    const eb = $('#eyBadge', root);
    const tb = $('#tdsBadge', root);
    eb.className = `badge ${eyOk ? 'good' : 'warn'}`;
    eb.textContent = val < 18 ? 'สกัดน้อยไป' : val > 22 ? 'สกัดมากไป' : 'การสกัดพอดี';
    tb.className = `badge ${tdsOk ? 'good' : 'warn'}`;
    tb.textContent = v.tds < lo ? 'อ่อนไป' : v.tds > hi ? 'เข้มไป' : 'ความเข้มพอดี';
    let txt = '';
    if (val < 18) txt += '<b>สกัดน้อยไป</b> — มักเปรี้ยวแหลมและบาง ลองบดละเอียดขึ้น เพิ่มอุณหภูมิน้ำ หรือยืดเวลาชง ';
    else if (val > 22) txt += '<b>สกัดมากไป</b> — มักขม ฝาด แห้งปลายลิ้น ลองบดหยาบขึ้น ลดอุณหภูมิ หรือลดเวลาชง ';
    else txt += '<b>การสกัดอยู่ในช่วง 18–22%</b> ซึ่งเป็นช่วงที่รสชาติมักสมดุล ';
    if (v.tds < lo) txt += `· ความเข้มต่ำกว่า ${lo}% ลองเพิ่มกาแฟ (ลดอัตราส่วน)`;
    else if (v.tds > hi) txt += `· ความเข้มสูงกว่า ${hi}% ลองเพิ่มน้ำ (เพิ่มอัตราส่วน)`;
    else txt += '· ความเข้มข้นอยู่ในช่วงแนะนำ';
    $('#eyVerdict', root).innerHTML = txt;
    save();
  }
  ey.seg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ey]');
    if (!b || b.dataset.ey === st.eyMode) return;
    st.eyMode = b.dataset.ey;
    eyFill();
    eyCalc();
  });
  [['dose', ey.dose], ['bev', ey.bev], ['tds', ey.tds]].forEach(([k, inp]) => {
    inp.addEventListener('input', () => {
      const n = parseNum(inp.value);
      if (n > 0) {
        st.ey[st.eyMode][k] = n;
        eyCalc();
      }
    });
    inp.addEventListener('focus', () => inp.select());
  });

  /* ---------- bean rest ---------- */
  const rest = { date: $('#roastDate', root), seg: $('#restSeg', root), bar: $('#restBar', root), marker: $('#restMarker', root), key: {} };
  rest.date.value = st.roastDate;
  rest.date.max = todayISO(0);
  function restCalc() {
    const phases = REST[st.restType];
    rest.bar.querySelectorAll('span').forEach((s) => s.remove());
    let from = 0;
    phases.forEach((p) => {
      const to = Math.min(60, p.to);
      if (to <= from) return;
      const s = document.createElement('span');
      s.style.flex = String(to - from);
      if (p.tone === 'peak') s.className = 'peak';
      else if (p.tone === 'ok') s.className = 'ok';
      rest.bar.insertBefore(s, rest.marker);
      from = to;
    });
    $$('[data-rest]', rest.seg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rest === st.restType)));
    updateSeg(rest.seg);
    const d = new Date(`${st.roastDate}T00:00:00`);
    const now = new Date(`${todayISO(0)}T00:00:00`);
    const days = Math.round((now - d) / 864e5);
    const label = $('#restLabel', root);
    if (!Number.isFinite(days)) {
      label.textContent = 'เลือกวันที่คั่วจากถุงกาแฟ';
      return;
    }
    if (days < 0) {
      springNumber($('#restDays', root), 0);
      label.textContent = 'วันที่คั่วอยู่ในอนาคต — ลองตรวจสอบอีกครั้ง';
      springTo(rest.key, 0, (v) => { rest.marker.style.left = `${v}%`; }, { from: 0 });
      return;
    }
    springNumber($('#restDays', root), days);
    const ph = phases.find((p) => days < p.to) || phases[phases.length - 1];
    label.textContent = ph.label;
    springTo(rest.key, (Math.min(days, 60) / 60) * 100, (v) => { rest.marker.style.left = `${v}%`; }, { stiffness: 140, damping: 16, from: 0 });
    save();
  }
  rest.date.addEventListener('change', () => {
    if (rest.date.value) {
      st.roastDate = rest.date.value;
      restCalc();
    }
  });
  rest.seg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rest]');
    if (!b) return;
    st.restType = b.dataset.rest;
    restCalc();
  });

  /* ---------- temperature ---------- */
  const tempSeg = $('#roastSeg', root);
  const thermo = $('#thermoFill', root);
  thermo.style.transition = 'left .7s var(--spring), width .7s var(--spring)';
  const cToF = (c) => Math.round((c * 9) / 5 + 32);
  function tempCalc() {
    const r = ROASTS.find((x) => x.id === st.roast);
    $$('[data-roast]', tempSeg).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.roast === st.roast)));
    updateSeg(tempSeg);
    $('#tempOut', root).innerHTML = `${r.range[0]}–${r.range[1]}<small>°C</small>`;
    $('#tempF', root).textContent = `${cToF(r.range[0])}–${cToF(r.range[1])}°F`;
    $('#tempNote', root).textContent = r.note;
    thermo.style.left = `${((r.range[0] - 80) / 20) * 100}%`;
    thermo.style.width = `${((r.range[1] - r.range[0]) / 20) * 100}%`;
    save();
  }
  tempSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-roast]');
    if (!b) return;
    st.roast = b.dataset.roast;
    tempCalc();
  });

  /* ---------- grind ---------- */
  function grindCalc() {
    const g = GRINDS.find((x) => x.id === st.grind);
    $$('[data-grind]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grind === st.grind)));
    $('#grindDetail', root).innerHTML = `
      <div><span class="k">ระดับ</span><span class="v th">${esc(g.th)}</span></div>
      <div><span class="k">ขนาดโดยประมาณ</span><span class="v num">${g.um[0]}–${g.um[1]} µm</span></div>
      <div><span class="k">ผิวสัมผัสคล้าย</span><span class="v th">${esc(g.like)}</span></div>
      <div><span class="k">เหมาะกับ</span><span class="v th">${esc(g.methods)}</span></div>`;
    save();
  }
  $('.grind-scale', root).addEventListener('click', (e) => {
    const b = e.target.closest('[data-grind]');
    if (!b) return;
    st.grind = b.dataset.grind;
    grindCalc();
  });

  /* ---------- converter ---------- */
  const CONV = [
    { label: 'น้ำหนัก', a: 'g', b: 'oz', ab: (v) => v / 28.3495, ba: (v) => v * 28.3495, def: 15, d: [1, 2] },
    { label: 'ปริมาตร', a: 'ml', b: 'fl oz', ab: (v) => v / 29.5735, ba: (v) => v * 29.5735, def: 250, d: [0, 2] },
    { label: 'อุณหภูมิ', a: '°C', b: '°F', ab: (v) => (v * 9) / 5 + 32, ba: (v) => ((v - 32) * 5) / 9, def: 93, d: [1, 1], neg: true },
    { label: 'ช้อนตวงกาแฟ (≈10 g)', a: 'ช้อน', b: 'g', ab: (v) => v * 10, ba: (v) => v / 10, def: 2, d: [1, 0] },
  ];
  const conv = $('#conv', root);
  conv.innerHTML = CONV.map((c, i) => `
    <div>
      <p class="conv-label">${esc(c.label)}</p>
      <div class="conv-row" data-row="${i}">
        <span class="unit-input"><input class="input" data-side="a" inputmode="decimal" aria-label="${esc(c.label)} (${esc(c.a)})"><span class="u">${esc(c.a)}</span></span>
        ${icon('swap')}
        <span class="unit-input"><input class="input" data-side="b" inputmode="decimal" aria-label="${esc(c.label)} (${esc(c.b)})"><span class="u">${esc(c.b)}</span></span>
      </div>
    </div>`).join('');
  CONV.forEach((c, i) => {
    const row = $(`[data-row="${i}"]`, conv);
    const a = $('[data-side="a"]', row);
    const b = $('[data-side="b"]', row);
    a.value = c.def;
    b.value = fmtNum(c.ab(c.def), c.d[1]);
    a.addEventListener('input', () => {
      const n = parseNum(a.value);
      b.value = Number.isFinite(n) && (c.neg || n >= 0) ? fmtNum(c.ab(n), c.d[1]) : '';
    });
    b.addEventListener('input', () => {
      const n = parseNum(b.value);
      a.value = Number.isFinite(n) && (c.neg || n >= 0) ? fmtNum(c.ba(n), c.d[0]) : '';
    });
    [a, b].forEach((x) => x.addEventListener('focus', () => x.select()));
  });

  /* ---------- cost ---------- */
  const costInputs = $$('[data-cost]', root);
  costInputs.forEach((inp) => {
    inp.value = fmtNum(st.cost[inp.dataset.cost], 1);
    inp.addEventListener('input', () => {
      const n = parseNum(inp.value);
      if (Number.isFinite(n) && n >= 0) {
        st.cost[inp.dataset.cost] = n;
        costCalc();
      }
    });
    inp.addEventListener('focus', () => inp.select());
  });
  function costCalc() {
    const c = st.cost;
    const per = c.bag > 0 ? (c.price / c.bag) * c.dose + c.extra : 0;
    springNumber($('#costOut', root), per, (v) => fmtNum(v, 1));
    const cups = c.dose > 0 ? Math.floor(c.bag / c.dose) : 0;
    $('#costCups', root).textContent = `ได้ประมาณ ${cups} แก้วต่อถุง`;
    const diff = c.cafe - per;
    $('#costSave', root).innerHTML = diff > 0
      ? `ชงเองประหยัด <b>฿${fmtNum(diff, 1)}</b> ต่อแก้ว — ถ้าดื่มวันละแก้ว เดือนหนึ่งประหยัดได้ราว <b>฿${Math.round(diff * 30).toLocaleString('th-TH')}</b>`
      : 'ต้นทุนชงเองสูงกว่าร้านที่เปรียบเทียบ — แต่ได้เลือกเมล็ดเองทุกแก้ว';
    save();
  }

  eyFill();
  eyCalc();
  restCalc();
  tempCalc();
  grindCalc();
  costCalc();

  const segs = [ey.seg, rest.seg, tempSeg];
  requestAnimationFrame(() => segs.forEach((s) => updateSeg(s, true)));
  const onResize = () => segs.forEach((s) => updateSeg(s, true));
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}
