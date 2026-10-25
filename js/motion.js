// Motion toolkit — springs (Popmotion / Dynamics.js style physics), scroll reveals,
// split-word headlines, magnetic buttons, tilt + glare, drag-to-dismiss and particle bursts.
// Animates only transform/opacity (compositor friendly) and respects prefers-reduced-motion.

import { finePointer } from './util.js';

const rm = matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => rm.matches;

/* ---------------- spring ---------------- */

const springs = new WeakMap();

/**
 * Retargetable spring keyed by any object. Calling again while running keeps velocity,
 * so values glide naturally to the new target.
 */
export function springTo(key, to, onUpdate, { stiffness = 170, damping = 22, mass = 1, from } = {}) {
  let s = springs.get(key);
  if (!s) {
    s = { x: from ?? to, v: 0, raf: 0, to };
    springs.set(key, s);
    if (from === undefined) {
      onUpdate(to);
      return;
    }
  }
  s.to = to;
  s.onUpdate = onUpdate;
  s.k = stiffness;
  s.c = damping;
  s.m = mass;
  if (reducedMotion() || document.hidden) {
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    s.x = to;
    s.v = 0;
    onUpdate(to);
    return;
  }
  if (s.raf) return;
  let last = performance.now();
  const range = () => Math.max(Math.abs(s.to - s.x), 1e-3);
  const precision = Math.max(Math.abs(to - s.x) * 0.0005, 0.0005);
  const step = (now) => {
    const dt = Math.min(0.064, (now - last) / 1000);
    last = now;
    const n = Math.max(1, Math.ceil(dt / 0.004));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const f = -s.k * (s.x - s.to) - s.c * s.v;
      s.v += (f / s.m) * h;
      s.x += s.v * h;
    }
    if (Math.abs(s.v) < precision * 20 && range() < precision) {
      s.x = s.to;
      s.v = 0;
      s.raf = 0;
      s.onUpdate(s.x);
      return;
    }
    s.onUpdate(s.x);
    s.raf = requestAnimationFrame(step);
  };
  s.raf = requestAnimationFrame(step);
}

/** Spring a number inside an element's text */
export function springNumber(el, to, format = (v) => Math.round(v), opts) {
  if (!el) return;
  springTo(el, to, (v) => { el.textContent = format(v); }, { stiffness: 140, damping: 20, ...opts });
}

/* ---------------- reveal on scroll ---------------- */

let io;
function observer() {
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('is-in');
        io.unobserve(el);
        if (el.hasAttribute('data-reveal')) {
          const done = (ev) => {
            if (ev.target !== el || ev.propertyName !== 'transform') return;
            el.removeEventListener('transitionend', done);
            el.removeAttribute('data-reveal');
            el.classList.remove('is-in');
            el.style.removeProperty('--i');
          };
          el.addEventListener('transitionend', done);
          // safety net if transitionend never fires
          setTimeout(() => done({ target: el, propertyName: 'transform' }), 2200);
        }
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
  );
  return io;
}

/** Observe [data-reveal] and .split elements inside root. Groups [data-stagger] get indices. */
export function reveal(root = document) {
  root.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      if (child.hasAttribute('data-reveal')) child.style.setProperty('--i', String(Math.min(i, 10)));
    });
  });
  root.querySelectorAll('.split').forEach(splitWords);
  const targets = root.querySelectorAll('[data-reveal]:not(.is-in), .split:not(.is-in)');
  if (reducedMotion()) {
    targets.forEach((el) => {
      el.classList.add('is-in');
      el.removeAttribute('data-reveal');
    });
    return;
  }
  const obs = observer();
  targets.forEach((el) => obs.observe(el));
}

/** Wrap each word of a headline in a mask so it can rise into view. */
export function splitWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  let wi = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
            return;
          }
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.textContent = p;
          inner.style.setProperty('--wi', String(wi++));
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
}

/* ---------------- magnetic buttons ---------------- */

export function magnetic(root = document) {
  if (!finePointer() || reducedMotion()) return;
  root.querySelectorAll('.magnetic').forEach((el) => {
    if (el.dataset.mag) return;
    el.dataset.mag = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

/* ---------------- tilt + glare cards ---------------- */

export function tilt(root = document) {
  if (!finePointer() || reducedMotion()) return;
  root.querySelectorAll('[data-tilt]').forEach((el) => {
    if (el.dataset.tiltOn) return;
    el.dataset.tiltOn = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 6}deg) translateY(-3px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-tilting');
      el.style.transform = '';
    });
  });
}

/* ---------------- particle burst ---------------- */

let layer;
export function burst(x, y, { count = 22, colors = ['#ff7a3d', '#ff5577', '#d44df0', '#ffffff', '#6a4cf5'] } = {}) {
  if (reducedMotion()) return;
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'burst-layer';
    document.body.appendChild(layer);
  }
  const parts = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'bean';
    el.style.background = colors[i % colors.length];
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const speed = 520 + Math.random() * 520;
    parts.push({ el, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: Math.random() * 360, vr: (Math.random() - 0.5) * 900, s: 0.6 + Math.random() * 0.7 });
    layer.appendChild(el);
  }
  let last = performance.now();
  const start = last;
  const frame = (now) => {
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    const age = (now - start) / 1000;
    parts.forEach((p) => {
      p.vy += 1500 * dt;
      p.vx *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(${p.s})`;
      p.el.style.opacity = String(Math.max(0, 1 - Math.max(0, age - 0.7) / 0.6));
    });
    if (age < 1.4) requestAnimationFrame(frame);
    else parts.forEach((p) => p.el.remove());
  };
  requestAnimationFrame(frame);
}

/* ---------------- segmented indicator ---------------- */

export function updateSeg(seg, instant = false) {
  if (!seg) return;
  const ind = seg.querySelector('.seg-ind');
  const active = seg.querySelector('[aria-current="page"], [aria-pressed="true"], [aria-selected="true"]');
  if (!ind) return;
  if (!active) {
    ind.style.opacity = '0';
    return;
  }
  ind.style.opacity = '';
  if (instant) ind.style.transition = 'none';
  ind.style.width = `${active.offsetWidth}px`;
  ind.style.transform = `translateX(${active.offsetLeft}px)`;
  if (instant) {
    void ind.offsetWidth;
    ind.style.transition = '';
  }
  seg.classList.add('is-ready');
  // keep the active pill visible inside horizontally scrolling groups
  if (seg.scrollWidth > seg.clientWidth + 2) {
    const left = active.offsetLeft - seg.clientWidth / 2 + active.offsetWidth / 2;
    seg.scrollTo({ left, behavior: instant || reducedMotion() ? 'auto' : 'smooth' });
  }
}

/* ---------------- drag to dismiss (bottom sheets) ---------------- */

export function dragToDismiss(sheet, handle, onDismiss) {
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let v = 0;
  let dragging = false;
  handle.addEventListener('pointerdown', (e) => {
    if (matchMedia('(min-width: 810px)').matches) return;
    dragging = true;
    startY = lastY = e.clientY;
    lastT = performance.now();
    v = 0;
    sheet.classList.add('is-dragging');
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dy = Math.max(0, e.clientY - startY);
    v = (e.clientY - lastY) / Math.max(1, now - lastT);
    lastY = e.clientY;
    lastT = now;
    // rubber band upwards
    const y = e.clientY - startY < 0 ? (e.clientY - startY) * 0.15 : dy;
    sheet.style.setProperty('--drag', `${y}px`);
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('is-dragging');
    const dy = lastY - startY;
    if (dy > 140 || v > 0.6) onDismiss();
    else sheet.style.setProperty('--drag', '0px');
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}
