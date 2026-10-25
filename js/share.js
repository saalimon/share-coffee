// Share links: recipes travel inside the URL (deflate + base64url), no server needed.

import { esc, baseUrl, fmtNum } from './util.js';
import { icon } from './icons.js';
import { openSheet, toast, methodOf, ratioText } from './ui.js';
import { sanitizeRecipe } from './sanitize.js';
import { burst } from './motion.js';

/* ---------------- encode / decode ---------------- */

const toB64Url = (bytes) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64Url = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

function compact(r) {
  const c = { v: 1, n: r.name, m: r.method, d: r.dose, w: r.water, g: r.grind, t: r.time };
  if (r.author) c.a = r.author;
  if (r.yield) c.y = 1;
  if (r.temp != null) c.T = r.temp;
  if (r.ice) c.i = r.ice;
  if (r.desc) c.x = r.desc;
  c.s = r.steps.map((s) => {
    const a = [s.t, s.label, s.water ?? null, s.note || '', s.pour ?? null];
    while (a.length > 2 && (a[a.length - 1] === null || a[a.length - 1] === '')) a.pop();
    return a;
  });
  return c;
}

function expand(c) {
  if (!c || typeof c !== 'object') return null;
  return {
    name: c.n, author: c.a, method: c.m, dose: c.d, water: c.w, grind: c.g, time: c.t,
    yield: !!c.y, temp: c.T, ice: c.i, desc: c.x,
    steps: Array.isArray(c.s) ? c.s.map((a) => (Array.isArray(a) ? { t: a[0], label: a[1], water: a[2], note: a[3], pour: a[4] } : null)).filter(Boolean) : [],
  };
}

export async function encodeRecipe(r) {
  const bytes = new TextEncoder().encode(JSON.stringify(compact(r)));
  if ('CompressionStream' in window) {
    try {
      return 'z' + toB64Url(await pipe(bytes, new CompressionStream('deflate-raw')));
    } catch {
      /* fall through */
    }
  }
  return 'j' + toB64Url(bytes);
}

export async function decodeRecipe(payload) {
  try {
    if (!payload || payload.length > 12000) return null;
    const kind = payload[0];
    let bytes = fromB64Url(payload.slice(1));
    if (kind === 'z') {
      if (!('DecompressionStream' in window)) return null;
      bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    } else if (kind !== 'j') return null;
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    return sanitizeRecipe(expand(obj), 'shared');
  } catch {
    return null;
  }
}

export async function recipeShareUrl(r) {
  return `${baseUrl()}?r=${await encodeRecipe(r)}#/recipes`;
}

/* ---------------- QR ---------------- */

function qrSvg(text) {
  if (typeof window.qrcode !== 'function') return '';
  const qr = window.qrcode(0, text.length > 300 ? 'L' : 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (qr.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
  }
  return { svg: `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="QR code"><path d="${d}" fill="#000"/></svg>`, qr, n };
}

function downloadQr(qr, n) {
  const cell = 12;
  const pad = 4 * cell;
  const size = n * cell + pad * 2;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) ctx.fillRect(pad + x * cell, pad + y * cell, cell, cell);
  c.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'share-coffee-qr.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, 'image/png');
}

/* ---------------- copy ---------------- */

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/* ---------------- share sheet ---------------- */

export function openShareSheet({ title, url, text = '', preview = '' }) {
  const q = qrSvg(url);
  const canNative = typeof navigator.share === 'function';
  const line = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
  openSheet({
    label: 'แชร์',
    html: `
      <div class="sheet-head">
        <p class="eyebrow">${icon('share', 'ic-sm')} แชร์</p>
        <h2 class="d-md">${esc(title)}</h2>
      </div>
      ${preview}
      <div class="share-grid">
        <div class="qr is-in" id="qrBox">${q ? q.svg : '<p class="caption" style="color:#000">QR ไม่พร้อมใช้งาน</p>'}</div>
        <div class="stack">
          <p class="muted">ส่งลิงก์นี้ให้เพื่อน เปิดแล้วจะเห็นสูตรเดียวกันทันที — ไม่ต้องสมัครสมาชิก หรือให้เพื่อนสแกน QR จากหน้าจอนี้</p>
          <div class="link-field">
            <input type="text" readonly value="${esc(url)}" aria-label="ลิงก์สำหรับแชร์" id="shareUrl">
            <button class="btn btn-primary btn-sm" id="copyBtn" type="button">
              <span class="copy-swap"><span class="idle row" style="gap:6px">${icon('copy', 'ic-sm')} คัดลอก</span><span class="done row" style="gap:6px">${icon('check', 'ic-sm')} แล้ว</span></span>
            </button>
          </div>
          <div class="share-actions">
            ${canNative ? `<button class="btn btn-secondary btn-sm" id="nativeShare" type="button">${icon('share', 'ic-sm')} แชร์ผ่านแอป…</button>` : ''}
            <a class="btn btn-secondary btn-sm" href="${esc(line)}" target="_blank" rel="noopener noreferrer"><span class="line-dot" aria-hidden="true"></span>ส่งทาง LINE</a>
            ${q ? `<button class="btn btn-secondary btn-sm" id="dlQr" type="button">${icon('download', 'ic-sm')} บันทึก QR</button>` : ''}
          </div>
        </div>
      </div>`,
    onMount(sheet) {
      const input = sheet.querySelector('#shareUrl');
      input.addEventListener('focus', () => input.select());
      const btn = sheet.querySelector('#copyBtn');
      btn.addEventListener('click', async (e) => {
        if (await copyText(url)) {
          btn.classList.add('is-copied');
          const r = btn.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top, { count: 12 });
          setTimeout(() => btn.classList.remove('is-copied'), 1800);
        } else {
          input.focus();
          toast('คัดลอกไม่สำเร็จ — กดค้างที่ลิงก์เพื่อคัดลอกเอง', { iconName: 'info' });
        }
      });
      sheet.querySelector('#nativeShare')?.addEventListener('click', async () => {
        try {
          await navigator.share({ title, text, url });
        } catch {
          /* user cancelled */
        }
      });
      sheet.querySelector('#dlQr')?.addEventListener('click', () => downloadQr(q.qr, q.n));
    },
  });
}

export async function shareRecipe(r) {
  const url = await recipeShareUrl(r);
  const m = methodOf(r);
  openShareSheet({
    title: r.name,
    url,
    text: `สูตรกาแฟ ${r.name} — ${fmtNum(r.dose, 1)} g : ${fmtNum(r.water, 1)} g (${ratioText(r)})`,
    preview: `<div class="preview-mini"><span class="micon">${icon(m.icon)}</span><div><b>${esc(r.name)}</b><span class="caption muted">${esc(m.name)} · ${fmtNum(r.dose, 1)} g · ${fmtNum(r.water, 1)} g · ${ratioText(r)}</span></div></div>`,
  });
}

export function shareApp() {
  const url = baseUrl();
  openShareSheet({
    title: 'ชวนเพื่อนมาชงกาแฟ',
    url,
    text: 'Share Coffee — คำนวณอัตราส่วน จับเวลา และแชร์สูตรกาแฟ',
  });
}
