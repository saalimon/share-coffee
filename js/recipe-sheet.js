// Recipe detail sheet + recipe editor

import { esc, go, fmtNum, fmtTime, parseTime, parseNum } from './util.js';
import { icon, drawIcon } from './icons.js';
import { METHODS, GRINDS } from './data.js';
import { openSheet, toast, detailStats, stepsList, methodOf, tagText } from './ui.js';
import { saveMine, deleteMine, setAdhoc, isMine, isStandard } from './store.js';
import { shareRecipe } from './share.js';
import { sanitizeRecipe } from './sanitize.js';

export function openRecipeSheet(r, { shared = false, onClose } = {}) {
  const m = methodOf(r);
  const mine = isMine(r);
  const std = isStandard(r);
  const foot = `
    <button class="btn btn-primary magnetic" data-act="brew" type="button">${icon('timer', 'ic-sm')} เริ่มจับเวลา</button>
    <button class="btn btn-secondary" data-act="share" type="button">${icon('share', 'ic-sm')} แชร์</button>
    ${shared ? `<button class="btn btn-secondary" data-act="save" type="button">${icon('save', 'ic-sm')} บันทึกลงสูตรของฉัน</button>` : ''}
    ${std ? `<button class="btn btn-ghost" data-act="dup" type="button">${icon('copy', 'ic-sm')} ทำสำเนาไปปรับ</button>` : ''}
    ${mine ? `<button class="btn btn-ghost" data-act="edit" type="button">${icon('edit', 'ic-sm')} แก้ไข</button><button class="btn btn-danger" data-act="del" type="button">${icon('trash', 'ic-sm')} ลบ</button>` : ''}`;
  const sheet = openSheet({
    label: r.name,
    wide: true,
    onClose,
    html: `
      ${shared ? `<div class="banner">${icon('sparkle')}<span>มีคนแชร์สูตรนี้ให้คุณ — กดบันทึกเพื่อเก็บไว้ หรือเริ่มชงได้เลย</span></div>` : ''}
      <div class="sheet-head">
        <div class="row">
          <span class="micon micon-lg">${drawIcon(m.icon)}</span>
          <div>
            <p class="eyebrow">${esc(tagText(m))}</p>
            <h2 class="d-md" style="margin-top:4px">${esc(r.name)}</h2>
          </div>
        </div>
        <p class="muted">${esc(r.author || 'สูตรของฉัน')}</p>
      </div>
      ${r.desc ? `<p class="verdict">${esc(r.desc)}</p>` : ''}
      ${detailStats(r)}
      <div>
        <p class="label" style="margin-bottom:6px">ขั้นตอน</p>
        ${stepsList(r)}
      </div>`,
    foot,
    onMount(el, api) {
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const act = b.dataset.act;
        if (act === 'brew') {
          api.close();
          if (std || mine) go(`#/timer?id=${encodeURIComponent(r.id)}`);
          else {
            setAdhoc(r);
            go('#/timer?id=adhoc');
          }
        } else if (act === 'share') {
          shareRecipe(r);
        } else if (act === 'save') {
          const saved = saveMine({ ...r, id: null });
          api.close();
          toast(`บันทึก “${saved.name}” แล้ว`);
          go('#/recipes?c=mine');
        } else if (act === 'dup') {
          api.close();
          openEditor({ ...r, id: null, name: `${r.name} (ของฉัน)`, author: '' });
        } else if (act === 'edit') {
          api.close();
          openEditor(r);
        } else if (act === 'del') {
          if (b.dataset.confirm) {
            deleteMine(r.id);
            api.close();
            toast('ลบสูตรแล้ว', { iconName: 'trash' });
          } else {
            b.dataset.confirm = '1';
            b.innerHTML = `${icon('trash', 'ic-sm')} แตะอีกครั้งเพื่อยืนยัน`;
            setTimeout(() => {
              if (!document.contains(b)) return;
              delete b.dataset.confirm;
              b.innerHTML = `${icon('trash', 'ic-sm')} ลบ`;
            }, 3000);
          }
        }
      });
    },
  });
  return sheet;
}

/* ---------------- editor ---------------- */

const blankRecipe = () => ({
  id: null,
  name: '',
  author: '',
  method: 'v60',
  dose: 15,
  water: 250,
  temp: 93,
  grind: 'mfine',
  time: 180,
  desc: '',
  steps: [
    { t: 0, label: 'Bloom', water: 30, pour: 10 },
    { t: 40, label: 'เทรอบที่ 1', water: 150 },
    { t: 75, label: 'เทรอบที่ 2', water: 250 },
    { t: 110, label: 'Drawdown' },
  ],
});

function stepRow(s = {}) {
  return `
    <div class="step-edit" data-step>
      <div class="step-edit-row">
        <input class="input num" data-k="t" value="${esc(s.t != null ? fmtTime(s.t) : '')}" placeholder="0:00" inputmode="numeric" aria-label="เวลาเริ่ม (นาที:วินาที)">
        <input class="input" data-k="label" value="${esc(s.label || '')}" placeholder="เช่น Bloom, เทรอบที่ 1" maxlength="80" aria-label="ชื่อขั้นตอน">
        <input class="input num w-in" data-k="water" value="${s.water != null ? esc(fmtNum(s.water, 1)) : ''}" placeholder="น้ำสะสม g" inputmode="decimal" aria-label="น้ำสะสมบนตาชั่ง (กรัม)">
        <button class="btn-icon" type="button" data-del aria-label="ลบขั้นตอน">${icon('close', 'ic-sm')}</button>
      </div>
      <div class="step-edit-row">
        <span></span>
        <input class="input step-edit-note" data-k="note" value="${esc(s.note || '')}" placeholder="หมายเหตุ (ไม่บังคับ)" maxlength="300" aria-label="หมายเหตุ">
      </div>
    </div>`;
}

export function openEditor(recipe = null) {
  const r = recipe ? sanitizeRecipe(recipe, recipe.id) : blankRecipe();
  const isEdit = isMine(recipe);
  const methodOpts = Object.entries(METHODS)
    .map(([k, m]) => `<option value="${k}" ${k === r.method ? 'selected' : ''}>${esc(m.name)}</option>`)
    .join('');
  const grindOpts = GRINDS.map((g) => `<option value="${g.id}" ${g.id === r.grind ? 'selected' : ''}>${esc(g.th)} — ${esc(g.en)}</option>`).join('');

  openSheet({
    label: isEdit ? 'แก้ไขสูตร' : 'สร้างสูตรใหม่',
    wide: true,
    html: `
      <div class="sheet-head">
        <p class="eyebrow">${icon('edit', 'ic-sm')} ${isEdit ? 'แก้ไขสูตร' : 'สร้างสูตรใหม่'}</p>
        <h2 class="d-md">${isEdit ? esc(r.name) : 'Make it yours.'}</h2>
      </div>
      <form class="editor" id="editor" novalidate>
        <div class="field-row">
          <label class="field"><span class="label">ชื่อสูตร *</span><input class="input" name="name" value="${esc(r.name)}" maxlength="80" required placeholder="เช่น V60 เช้าวันจันทร์" autofocus></label>
          <label class="field"><span class="label">ผู้สร้าง</span><input class="input" name="author" value="${esc(r.author)}" maxlength="60" placeholder="ชื่อของคุณ"></label>
        </div>
        <div class="field-row">
          <label class="field"><span class="label">วิธีชง</span><select class="select" name="method">${methodOpts}</select></label>
          <label class="field"><span class="label">ระดับบด</span><select class="select" name="grind">${grindOpts}</select></label>
        </div>
        <div class="inputs-3">
          <label class="field"><span class="label">กาแฟ (g)</span><input class="input num" name="dose" value="${fmtNum(r.dose, 1)}" inputmode="decimal"></label>
          <label class="field"><span class="label" id="waterLbl">${r.yield ? 'Yield (g)' : 'น้ำทั้งหมด (g)'}</span><input class="input num" name="water" value="${fmtNum(r.water, 1)}" inputmode="decimal"></label>
          <label class="field"><span class="label">อุณหภูมิ (°C)</span><input class="input num" name="temp" value="${r.temp != null ? fmtNum(r.temp, 0) : ''}" inputmode="numeric" placeholder="ว่าง = น้ำเย็น"></label>
        </div>
        <div class="inputs-3">
          <label class="field"><span class="label">เวลารวม (นาที:วินาที)</span><input class="input num" name="time" value="${fmtTime(r.time)}" inputmode="numeric" placeholder="3:00"></label>
          <label class="field"><span class="label">น้ำแข็ง (g)</span><input class="input num" name="ice" value="${r.ice ? fmtNum(r.ice, 0) : ''}" inputmode="numeric" placeholder="ถ้ามี"></label>
          <div class="field"><span class="label">อัตราส่วน</span><span class="ratio-live input" id="ratioLive" style="display:flex;align-items:center"><b>1:16</b></span></div>
        </div>
        <label class="check"><input type="checkbox" name="yield" ${r.yield ? 'checked' : ''}> โหมดเอสเปรสโซ (ตัวเลขน้ำคือน้ำกาแฟที่ได้ / yield)</label>
        <label class="field"><span class="label">คำอธิบาย</span><textarea class="textarea" name="desc" maxlength="600" placeholder="รสชาติที่ได้ เมล็ดที่ใช้ เคล็ดลับ…">${esc(r.desc || '')}</textarea></label>
        <div class="field">
          <div class="row-between"><span class="label">ขั้นตอน (เวลาเริ่ม · ชื่อขั้นตอน · น้ำสะสมบนตาชั่ง)</span></div>
          <div class="step-edit-head"><span>เวลา</span><span>ขั้นตอน</span><span>น้ำสะสม g</span><span></span></div>
          <div class="stack" style="gap:8px" id="stepsEdit">${r.steps.map(stepRow).join('')}</div>
          <button class="btn btn-secondary btn-sm" type="button" id="addStep" style="justify-self:start">${icon('plus', 'ic-sm')} เพิ่มขั้นตอน</button>
        </div>
        <p class="error" id="formError" role="alert" hidden></p>
      </form>`,
    foot: `<button class="btn btn-primary" type="submit" form="editor">${icon('check', 'ic-sm')} บันทึกสูตร</button><button class="btn btn-ghost" type="button" data-close>ยกเลิก</button>`,
    onMount(el, api) {
      const form = el.querySelector('#editor');
      const f = (n) => form.elements.namedItem(n);
      const list = el.querySelector('#stepsEdit');
      const ratioLive = el.querySelector('#ratioLive');
      const updateRatio = () => {
        const d = parseNum(f('dose').value);
        const w = parseNum(f('water').value);
        ratioLive.innerHTML = d > 0 && w > 0 ? `<b>1:${fmtNum(w / d, 1)}</b>` : '<b>–</b>';
        el.querySelector('#waterLbl').textContent = f('yield').checked ? 'Yield (g)' : 'น้ำทั้งหมด (g)';
      };
      updateRatio();
      form.addEventListener('input', updateRatio);
      f('method').addEventListener('change', () => {
        if (f('method').value === 'espresso') f('yield').checked = true;
        updateRatio();
      });
      list.addEventListener('click', (e) => {
        const del = e.target.closest('[data-del]');
        if (!del) return;
        const row = del.closest('[data-step]');
        if (list.children.length <= 1) {
          toast('ต้องมีอย่างน้อย 1 ขั้นตอน', { iconName: 'info' });
          return;
        }
        row.style.transition = 'opacity .2s, transform .3s';
        row.style.opacity = '0';
        row.style.transform = 'translateX(16px)';
        setTimeout(() => row.remove(), 200);
      });
      el.querySelector('#addStep').addEventListener('click', () => {
        const rows = [...list.querySelectorAll('[data-step]')];
        const lastT = rows.length ? parseTime(rows[rows.length - 1].querySelector('[data-k="t"]').value) : -30;
        const t = Number.isFinite(lastT) ? lastT + 30 : 0;
        if (rows.length >= 40) return;
        list.insertAdjacentHTML('beforeend', stepRow({ t }));
        list.lastElementChild.querySelector('[data-k="label"]').focus();
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const err = el.querySelector('#formError');
        const fail = (msg, field) => {
          err.textContent = msg;
          err.hidden = false;
          field?.focus();
        };
        err.hidden = true;
        const name = f('name').value.trim();
        if (!name) return fail('กรุณาตั้งชื่อสูตร', f('name'));
        const dose = parseNum(f('dose').value);
        const water = parseNum(f('water').value);
        if (!(dose > 0)) return fail('ปริมาณกาแฟต้องมากกว่า 0', f('dose'));
        if (!(water > 0)) return fail('ปริมาณน้ำต้องมากกว่า 0', f('water'));
        const steps = [];
        for (const row of list.querySelectorAll('[data-step]')) {
          const tIn = row.querySelector('[data-k="t"]');
          const t = parseTime(tIn.value || '0');
          if (!Number.isFinite(t)) return fail('รูปแบบเวลาไม่ถูกต้อง ใช้ นาที:วินาที เช่น 1:30', tIn);
          const wv = row.querySelector('[data-k="water"]').value.trim();
          steps.push({
            t,
            label: row.querySelector('[data-k="label"]').value.trim() || 'ขั้นตอน',
            water: wv ? parseNum(wv) : null,
            note: row.querySelector('[data-k="note"]').value.trim(),
          });
        }
        steps.sort((a, b) => a.t - b.t);
        let time = parseTime(f('time').value);
        const lastStep = steps[steps.length - 1]?.t ?? 0;
        if (!Number.isFinite(time) || time <= lastStep) time = lastStep + 60;
        const temp = f('temp').value.trim() === '' ? null : parseNum(f('temp').value);
        const saved = saveMine({
          id: isEdit ? r.id : null,
          name,
          author: f('author').value.trim(),
          method: f('method').value,
          grind: f('grind').value,
          dose,
          water,
          temp,
          ice: parseNum(f('ice').value) || null,
          time,
          yield: f('yield').checked,
          desc: f('desc').value.trim(),
          steps,
        });
        api.close();
        toast(isEdit ? 'อัปเดตสูตรแล้ว' : `สร้าง “${saved.name}” แล้ว`);
        go('#/recipes?c=mine');
      });
    },
  });
}
