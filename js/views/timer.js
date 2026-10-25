// Guided brew timer — progress ring, live scale target, pour cues, wake lock.

import { $, $$, esc, fmtNum, fmtTime, clamp, parseNum, store, holdRepeat, go, haptic, finePointer } from '../util.js';
import { icon } from '../icons.js';
import { RECIPES, scaleRecipe, grindById, recipeRatio } from '../data.js';
import { springTo, burst, reducedMotion } from '../motion.js';
import { stepsList, methodOf, openSheet, toast, hasOpenSheet } from '../ui.js';
import { getRecipe, getMine } from '../store.js';
import { shareRecipe } from '../share.js';

const PREFS_KEY = 'sc.prefs';
const LAST_KEY = 'sc.timer.last';
const easeInOut = (p) => -(Math.cos(Math.PI * p) - 1) / 2;

export function render(root, query) {
  const prefs = { sound: true, vibrate: true, countdown: true, ...store.get(PREFS_KEY, {}) };
  let id = query.get('id') || store.get(LAST_KEY, 'hoffmann-v60');
  const free = id === 'free';
  let base = free ? null : getRecipe(id);
  if (!free && !base) {
    id = 'hoffmann-v60';
    base = getRecipe(id);
  }
  store.set(LAST_KEY, id);
  let dose = clamp(parseNum(query.get('d')) || base?.dose || 15, 0.1, 2000);
  let r = base ? scaleRecipe(base, dose) : null;
  let derived = [];
  let maxW = 0;

  const canVibrate = typeof navigator.vibrate === 'function';
  const m = r ? methodOf(r) : { name: 'Stopwatch', icon: 'timer' };

  root.innerHTML = `
    <section class="page-head tight wrap" style="padding-bottom:28px">
      <p class="eyebrow" data-reveal><span class="dot"></span>Brew timer · จับเวลาชง</p>
      <h1 class="d-xl split">Pour with<br>purpose.</h1>
    </section>
    <section class="wrap timer-grid">
      <div class="timer-stage" data-reveal>
        <div class="ring-wrap" id="ringWrap">
          <svg class="ring" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#ff7a3d"/><stop offset=".55" stop-color="#ff5577"/><stop offset="1" stop-color="#d44df0"/>
              </linearGradient>
              <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ff7a3d"/><stop offset="1" stop-color="#ff5577" stop-opacity=".85"/>
              </linearGradient>
              <clipPath id="liqClip"><circle cx="200" cy="200" r="164"/></clipPath>
            </defs>
            <circle class="ring-track" cx="200" cy="200" r="186"/>
            <circle class="ring-prog is-zero" id="ringProg" cx="200" cy="200" r="186" pathLength="1" transform="rotate(-90 200 200)"/>
            <circle class="liquid-bg" cx="200" cy="200" r="164"/>
            <g clip-path="url(#liqClip)">
              <g id="liquid" transform="translate(0 380)">
                <path class="wave wave-back" d="M0 8 Q50 -6 100 8 T200 8 T300 8 T400 8 T500 8 T600 8 V440 H0Z"/>
                <path class="wave wave-front" d="M0 0 Q50 14 100 0 T200 0 T300 0 T400 0 T500 0 T600 0 V440 H0Z"/>
              </g>
            </g>
            <g id="ticks"></g>
          </svg>
          <div class="ring-center">
            <div class="ring-step" id="tStep">พร้อมแล้ว — กดเริ่ม</div>
            <div class="ring-time num" id="tTime" role="timer" aria-live="off">0:00</div>
            <div class="ring-target" id="tTarget"><span>บนตาชั่ง</span><b class="num" id="tScale">0 g</b></div>
            <div class="ring-next caption" id="tNext"></div>
          </div>
          <div class="countdown" id="tCount" aria-live="assertive"></div>
        </div>
        <div class="timer-controls">
          <button class="btn-icon lg" type="button" id="tReset" aria-label="รีเซ็ต (R)">${icon('reset')}</button>
          <button class="play-btn" type="button" id="tPlay" aria-label="เริ่มจับเวลา (Space)"><span class="pp" aria-hidden="true"><i></i><i></i></span></button>
          <button class="btn-icon lg" type="button" id="tSkip" aria-label="${free ? 'บันทึกรอบ (N)' : 'ข้ามไปขั้นถัดไป (N)'}">${icon(free ? 'flag' : 'skip')}</button>
        </div>
        <div class="timer-toggles">
          <button class="pill-toggle" type="button" data-pref="sound" aria-pressed="${prefs.sound}">${icon('sound', 'ic-sm')} เสียง <span class="sw"></span></button>
          ${canVibrate ? `<button class="pill-toggle" type="button" data-pref="vibrate" aria-pressed="${prefs.vibrate}">${icon('vibrate', 'ic-sm')} สั่น <span class="sw"></span></button>` : ''}
          ${free ? '' : `<button class="pill-toggle" type="button" data-pref="countdown" aria-pressed="${prefs.countdown}">${icon('count', 'ic-sm')} นับถอยหลัง 3 วิ <span class="sw"></span></button>`}
        </div>
        ${finePointer() ? '<div class="hint-keys"><span><span class="kbd">Space</span> เริ่ม/หยุด</span><span><span class="kbd">N</span> ' + (free ? 'บันทึกรอบ' : 'ขั้นถัดไป') + '</span><span><span class="kbd">R</span> รีเซ็ต</span></div>' : ''}
      </div>

      <button class="picker" type="button" id="tPick" data-reveal aria-label="เปลี่ยนสูตร">
          <span class="micon">${icon(m.icon)}</span>
          <span class="picker-text">
            <span>${esc(m.name)} · แตะเพื่อเปลี่ยนสูตร</span>
            <b>${esc(r ? r.name : 'จับเวลาอิสระ')}</b>
            <span>${esc(r ? r.author || 'สูตรของฉัน' : 'ไม่มีขั้นตอน — กดธงเพื่อบันทึกรอบ')}</span>
          </span>
          ${icon('chevron')}
        </button>
      <div class="timer-side" data-stagger>
        ${r ? `
        <div class="card dose-card" data-reveal>
          <div class="row-between">
            <span class="label">ปรับปริมาณกาแฟ — ขั้นตอนจะปรับตาม</span>
            <button class="btn-icon" type="button" id="tShare" aria-label="แชร์สูตรนี้">${icon('share', 'ic-sm')}</button>
          </div>
          <div class="stepper stepper-sm">
            <button type="button" id="dDown" aria-label="ลดกาแฟ">${icon('minus', 'ic-sm')}</button>
            <input class="num" id="dIn" inputmode="decimal" aria-label="ปริมาณกาแฟ (กรัม)">
            <span class="unit">g กาแฟ</span>
            <button type="button" id="dUp" aria-label="เพิ่มกาแฟ">${icon('plus', 'ic-sm')}</button>
          </div>
          <div class="mini-stats" id="tStats"></div>
        </div>
        <div data-reveal id="stepsWrap"></div>` : `
        <div class="card" data-reveal>
          <p class="label" style="margin-bottom:10px">รอบที่บันทึก</p>
          <div class="laps" id="laps"><p class="muted caption">ยังไม่มีรอบ — ระหว่างจับเวลากดปุ่มธงเพื่อบันทึกเวลาแต่ละการเท</p></div>
        </div>`}
      </div>
    </section>`;

  const el = {
    wrap: $('#ringWrap', root),
    prog: $('#ringProg', root),
    liquid: $('#liquid', root),
    ticks: $('#ticks', root),
    step: $('#tStep', root),
    time: $('#tTime', root),
    target: $('#tTarget', root),
    scale: $('#tScale', root),
    next: $('#tNext', root),
    count: $('#tCount', root),
    play: $('#tPlay', root),
    reset: $('#tReset', root),
    skip: $('#tSkip', root),
    stepsWrap: $('#stepsWrap', root),
    stats: $('#tStats', root),
    dIn: $('#dIn', root),
    laps: $('#laps', root),
  };
  const levelKey = {};

  const T = { running: false, startPerf: 0, acc: 0, idx: -2, done: false, lastTick: '', raf: 0, iv: 0, countToken: 0, counting: false, laps: [] };
  const total = () => (free ? Infinity : r.time);
  const elapsed = () => (T.running ? T.acc + (performance.now() - T.startPerf) / 1000 : T.acc);
  const started = () => T.running || T.acc > 0;

  /* ---------- derived recipe data ---------- */

  function derive() {
    if (!r) return;
    let prev = 0;
    maxW = 0;
    derived = r.steps.map((s, i) => {
      const next = r.steps[i + 1]?.t ?? r.time;
      const target = s.water != null ? Math.max(prev, s.water) : prev;
      const pour = target > prev ? s.pour ?? clamp((next - s.t) * 0.7, 5, 25) : 0;
      const o = { ...s, prev, target, pour, next };
      prev = target;
      maxW = Math.max(maxW, prev);
      return o;
    });
  }

  const stepIndexAt = (e) => {
    let i = -1;
    for (let k = 0; k < derived.length; k++) if (derived[k].t <= e + 1e-6) i = k;
    return i;
  };
  const waterAt = (e) => {
    const i = stepIndexAt(e);
    if (i < 0) return 0;
    const s = derived[i];
    if (!s.pour) return s.target;
    return s.prev + (s.target - s.prev) * easeInOut(clamp((e - s.t) / s.pour, 0, 1));
  };

  function buildRecipeUI() {
    if (!r) return;
    derive();
    el.dIn.value = fmtNum(dose, 1);
    const g = grindById(r.grind);
    el.stats.innerHTML = `
      <div><span class="k">${r.yield ? 'Yield' : 'น้ำ'}</span><span class="v">${fmtNum(r.water, 1)}g</span></div>
      <div><span class="k">อัตราส่วน</span><span class="v">1:${fmtNum(recipeRatio(r), 1)}</span></div>
      <div><span class="k">อุณหภูมิ</span><span class="v">${r.temp == null ? 'เย็น' : `${fmtNum(r.temp, 0)}°`}</span></div>
      <div><span class="k">บด</span><span class="v" style="font-family:var(--f-body);font-size:13px;letter-spacing:0">${esc(g.th)}</span></div>`;
    el.stepsWrap.innerHTML = stepsList(r, { live: true });
    // ticks on the ring
    el.ticks.innerHTML = derived
      .map((s, i) => {
        const a = (s.t / r.time) * Math.PI * 2 - Math.PI / 2;
        return `<circle class="tick" data-i="${i}" cx="${200 + 186 * Math.cos(a)}" cy="${200 + 186 * Math.sin(a)}" r="${i === 0 ? 0 : 4.5}"/>`;
      })
      .join('');
    T.idx = -2;
    frame();
  }

  /* ---------- sound / haptics / wake lock ---------- */

  let ctx = null;
  function ensureAudio() {
    if (!prefs.sound) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch {
      ctx = null;
    }
  }
  function beep(freq = 880, dur = 0.16, type = 'sine', gain = 0.2, when = 0) {
    if (!prefs.sound || !ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }
  const chimeStep = () => {
    beep(880, 0.2);
    beep(1320, 0.28, 'sine', 0.14, 0.11);
  };
  const chimeTick = () => beep(660, 0.07, 'triangle', 0.12);
  const chimeDone = () => [659, 880, 1047, 1319].forEach((f, i) => beep(f, 0.35, 'sine', 0.16, i * 0.12));
  const buzz = (p) => prefs.vibrate && haptic(p);

  let wakeLock = null;
  async function wake() {
    try {
      if ('wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch {
      wakeLock = null;
    }
  }
  function unwake() {
    try { wakeLock?.release(); } catch { /* noop */ }
    wakeLock = null;
  }

  /* ---------- rendering ---------- */

  function setLevel(level) {
    springTo(levelKey, clamp(level, 0, 1), (v) => {
      // circle spans y = 36…364; park the wave below the bottom at 0
      const y = 380 - v * 352;
      el.liquid.setAttribute('transform', `translate(0 ${y.toFixed(2)})`);
    }, { stiffness: 90, damping: 18, from: 0 });
  }

  function onStepChange(i, cue) {
    T.idx = i;
    $$('.step', root).forEach((li) => {
      const k = li.dataset.i === 'end' ? Infinity : Number(li.dataset.i);
      li.classList.toggle('is-active', k === i && !T.done);
      li.classList.toggle('is-done', k < i || (T.done && k !== Infinity));
      if (k === Infinity) li.classList.toggle('is-active', T.done);
    });
    $$('.tick', el.ticks).forEach((c) => {
      const k = Number(c.dataset.i);
      c.classList.toggle('is-done', k <= i && started());
      c.classList.toggle('is-active', k === i + 1 && started() && !T.done);
    });
    if (cue && i >= 0) {
      chimeStep();
      buzz([80]);
      el.wrap.classList.remove('pulse');
      void el.wrap.offsetWidth;
      el.wrap.classList.add('pulse');
    }
  }

  function frame() {
    const e = Math.min(elapsed(), total());
    el.time.textContent = fmtTime(e);
    const p = free ? (e % 60) / 60 : e / r.time;
    el.prog.style.strokeDashoffset = String(1 - p);
    el.prog.classList.toggle('is-zero', p <= 0.0005);

    if (free) {
      el.step.textContent = started() ? (T.running ? 'กำลังจับเวลา' : 'หยุดชั่วคราว') : 'จับเวลาอิสระ — กดเริ่ม';
      el.target.hidden = true;
      el.next.textContent = T.laps.length ? `${T.laps.length} รอบ · ล่าสุด ${fmtTime(T.laps[T.laps.length - 1])}` : '';
      setLevel(started() ? p : 0);
    } else {
      const s0 = started();
      const i = s0 ? stepIndexAt(e) : -1;
      if (i !== T.idx) onStepChange(i, T.running && i > T.idx && T.idx !== -2);
      const w = s0 ? waterAt(e) : 0;
      el.scale.textContent = `${fmtNum(w, r.yield ? 1 : 0)} g`;
      el.target.hidden = maxW <= 0;
      setLevel(maxW > 0 ? w / maxW : p);
      const cur = i >= 0 ? derived[i] : null;
      if (T.done) {
        el.step.textContent = 'ชงเสร็จแล้ว ☕';
        el.next.textContent = 'กดเริ่มเพื่อชงอีกแก้ว';
      } else if (!s0) {
        el.step.textContent = 'พร้อมแล้ว — กดเริ่ม';
        el.next.textContent = `ขั้นแรก: ${derived[0]?.label ?? ''}`;
      } else {
        el.step.textContent = cur ? (cur.target > cur.prev ? `${cur.label} · เทถึง ${fmtNum(cur.target, 1)} g` : cur.label) : '';
        const nx = derived[i + 1];
        el.next.textContent = nx ? `ถัดไป: ${nx.label} ใน ${fmtTime(nx.t - e + 0.999)}` : `เสร็จใน ${fmtTime(r.time - e + 0.999)}`;
        if (!T.running) el.next.textContent = `หยุดชั่วคราว · ${el.next.textContent}`;
      }
      if (cur) {
        const bar = $(`.step[data-i="${i}"] .step-bar i`, root);
        if (bar) bar.style.transform = `scaleX(${clamp((e - cur.t) / Math.max(1, cur.next - cur.t), 0, 1)})`;
      }
    }
    if (T.running) T.raf = requestAnimationFrame(frame);
  }

  function cues() {
    if (!T.running) return;
    const e = elapsed();
    if (!free && e >= r.time) {
      finish();
      return;
    }
    if (free) return;
    const i = stepIndexAt(e);
    if (i !== T.idx) onStepChange(i, true);
    const nextT = derived[T.idx + 1]?.t ?? r.time;
    const rem = nextT - e;
    const sec = Math.ceil(rem);
    const key = `${T.idx}:${sec}`;
    if (rem > 0 && sec >= 1 && sec <= 3 && T.lastTick !== key) {
      T.lastTick = key;
      chimeTick();
    }
  }

  /* ---------- controls ---------- */

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  async function countdown() {
    const token = ++T.countToken;
    T.counting = true;
    el.wrap.classList.add('is-counting');
    el.play.classList.add('is-playing');
    for (const n of [3, 2, 1]) {
      if (token !== T.countToken) return false;
      el.count.innerHTML = `<span>${n}</span>`;
      chimeTick();
      buzz(30);
      await sleep(reducedMotion() ? 600 : 900);
    }
    if (token !== T.countToken) return false;
    el.count.innerHTML = '';
    el.wrap.classList.remove('is-counting');
    T.counting = false;
    return true;
  }

  function cancelCountdown() {
    T.countToken++;
    T.counting = false;
    el.count.innerHTML = '';
    el.wrap.classList.remove('is-counting');
    el.play.classList.remove('is-playing');
  }

  async function start() {
    ensureAudio();
    if (T.done) reset();
    if (!free && prefs.countdown && T.acc === 0) {
      const ok = await countdown();
      if (!ok) return;
    }
    T.running = true;
    T.startPerf = performance.now();
    el.play.classList.add('is-playing');
    el.play.setAttribute('aria-label', 'หยุดชั่วคราว (Space)');
    el.dIn && (el.dIn.disabled = true);
    wake();
    clearInterval(T.iv);
    T.iv = setInterval(cues, 100);
    cancelAnimationFrame(T.raf);
    T.raf = requestAnimationFrame(frame);
    if (T.acc === 0) {
      if (!free) onStepChange(stepIndexAt(0), true);
      else chimeStep();
    }
  }

  function pause() {
    T.acc = elapsed();
    T.running = false;
    clearInterval(T.iv);
    cancelAnimationFrame(T.raf);
    el.play.classList.remove('is-playing');
    el.play.setAttribute('aria-label', 'เริ่มจับเวลาต่อ (Space)');
    unwake();
    frame();
  }

  function reset() {
    if (T.counting) cancelCountdown();
    T.running = false;
    clearInterval(T.iv);
    cancelAnimationFrame(T.raf);
    T.acc = 0;
    T.done = false;
    T.lastTick = '';
    T.laps = [];
    el.play.classList.remove('is-playing');
    el.play.setAttribute('aria-label', 'เริ่มจับเวลา (Space)');
    if (el.dIn) el.dIn.disabled = false;
    unwake();
    renderLaps();
    T.idx = -2;
    frame();
    if (!free) onStepChange(-1, false);
  }

  function finish() {
    T.acc = r.time;
    T.running = false;
    T.done = true;
    clearInterval(T.iv);
    cancelAnimationFrame(T.raf);
    el.play.classList.remove('is-playing');
    el.play.setAttribute('aria-label', 'ชงอีกครั้ง (Space)');
    if (el.dIn) el.dIn.disabled = false;
    unwake();
    T.idx = -2;
    frame();
    chimeDone();
    buzz([120, 80, 120, 80, 240]);
    const b = el.play.getBoundingClientRect();
    burst(b.left + b.width / 2, b.top + b.height / 2, { count: 28 });
    toast('ชงเสร็จแล้ว — ดื่มให้อร่อย!', { iconName: 'cup' });
  }

  function toggle() {
    if (T.counting) {
      cancelCountdown();
      return;
    }
    if (T.running) pause();
    else start();
  }

  function skip() {
    if (free) {
      lap();
      return;
    }
    if (!started()) {
      toast('กดเริ่มก่อน แล้วค่อยข้ามขั้น', { iconName: 'info' });
      return;
    }
    if (T.done) return;
    const e = elapsed();
    const nx = derived[stepIndexAt(e) + 1];
    if (nx) {
      T.acc = nx.t;
      if (T.running) T.startPerf = performance.now();
      frame();
    } else if (T.running) {
      finish();
    }
  }

  function lap() {
    if (!started()) return;
    T.laps.push(elapsed());
    buzz(30);
    renderLaps();
    frame();
  }

  function renderLaps() {
    if (!el.laps) return;
    if (!T.laps.length) {
      el.laps.innerHTML = '<p class="muted caption">ยังไม่มีรอบ — ระหว่างจับเวลากดปุ่มธงเพื่อบันทึกเวลาแต่ละการเท</p>';
      return;
    }
    el.laps.innerHTML = T.laps
      .map((t, i) => `<div class="lap"><span>รอบ ${i + 1}</span><span>+${fmtTime(t - (T.laps[i - 1] || 0))}</span><b>${fmtTime(t)}</b></div>`)
      .reverse()
      .join('');
  }

  el.play.addEventListener('click', toggle);
  el.reset.addEventListener('click', reset);
  el.skip.addEventListener('click', skip);

  $$('[data-pref]', root).forEach((b) =>
    b.addEventListener('click', () => {
      const k = b.dataset.pref;
      prefs[k] = !prefs[k];
      b.setAttribute('aria-pressed', String(prefs[k]));
      store.set(PREFS_KEY, prefs);
      if (k === 'sound' && prefs.sound) {
        ensureAudio();
        beep(880, 0.12);
      }
      if (k === 'vibrate' && prefs.vibrate) haptic(40);
    }),
  );

  // dose scaling
  if (r) {
    const setDose = (v) => {
      if (started()) {
        toast('รีเซ็ตก่อน แล้วค่อยปรับปริมาณ', { iconName: 'info' });
        el.dIn.value = fmtNum(dose, 1);
        return;
      }
      dose = clamp(Math.round(v * 10) / 10, 0.5, 2000);
      r = scaleRecipe(base, dose);
      buildRecipeUI();
    };
    const step = () => (dose < 25 ? 1 : 5);
    holdRepeat($('#dDown', root), () => setDose(Math.max(1, dose - step())));
    holdRepeat($('#dUp', root), () => setDose(dose + step()));
    el.dIn.addEventListener('change', () => {
      const v = parseNum(el.dIn.value);
      if (v > 0) setDose(v);
      else el.dIn.value = fmtNum(dose, 1);
    });
    el.dIn.addEventListener('focus', () => el.dIn.select());
    $('#tShare', root).addEventListener('click', () => shareRecipe(r));
  }

  // recipe picker
  $('#tPick', root).addEventListener('click', () => {
    const mine = getMine();
    const row = (x) => {
      const mm = methodOf(x);
      return `<button type="button" data-pick="${esc(x.id)}" aria-current="${x.id === id}">
        <span class="micon">${icon(mm.icon)}</span>
        <span><b>${esc(x.name)}</b><span class="muted">${esc(mm.name)} · ${fmtNum(x.dose, 1)} g · 1:${fmtNum(recipeRatio(x), 1)} · ${fmtTime(x.time)}</span></span>
      </button>`;
    };
    openSheet({
      label: 'เลือกสูตร',
      html: `
        <div class="sheet-head"><p class="eyebrow">${icon('book', 'ic-sm')} เลือกสูตร</p><h2 class="d-md">What are we brewing?</h2></div>
        <div class="list-pick">
          <button type="button" data-pick="free" aria-current="${free}"><span class="micon">${icon('timer')}</span><span><b>จับเวลาอิสระ</b><span class="muted">นาฬิกาจับเวลาพร้อมบันทึกรอบ</span></span></button>
          ${mine.length ? `<p class="list-group-title">สูตรของฉัน</p>${mine.map(row).join('')}` : ''}
          <p class="list-group-title">สูตรมาตรฐาน</p>
          ${RECIPES.map(row).join('')}
        </div>`,
      onMount(el2, api) {
        el2.addEventListener('click', (e) => {
          const b = e.target.closest('[data-pick]');
          if (!b) return;
          api.close();
          go(`#/timer?id=${encodeURIComponent(b.dataset.pick)}`);
        });
      },
    });
  });

  // keyboard
  const onKey = (e) => {
    if (hasOpenSheet() || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.code === 'Space' || e.key === 'k') {
      if (e.target.closest('button, a') && e.code === 'Space') return; // let buttons handle space
      e.preventDefault();
      toggle();
    } else if (e.key === 'r' || e.key === 'R') reset();
    else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') skip();
  };
  document.addEventListener('keydown', onKey);

  const onVis = () => {
    if (document.visibilityState === 'visible' && T.running) {
      wake();
      cancelAnimationFrame(T.raf);
      T.raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', onVis);

  if (r) buildRecipeUI();
  else frame();

  return () => {
    T.countToken++;
    clearInterval(T.iv);
    cancelAnimationFrame(T.raf);
    unwake();
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('visibilitychange', onVis);
    try { ctx?.close(); } catch { /* noop */ }
  };
}
