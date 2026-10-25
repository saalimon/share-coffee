// Brew methods, grind levels, calculator presets and the standard recipe library.
// Step `water` values are CUMULATIVE grams on the scale at the end of that pour.

export const METHODS = {
  v60: { name: 'V60', cat: 'pourover', icon: 'v60' },
  chemex: { name: 'Chemex', cat: 'pourover', icon: 'chemex' },
  kalita: { name: 'Kalita Wave', cat: 'pourover', icon: 'kalita' },
  clever: { name: 'Clever Dripper', cat: 'immersion', icon: 'clever' },
  frenchpress: { name: 'French Press', cat: 'immersion', icon: 'press' },
  aeropress: { name: 'AeroPress', cat: 'immersion', icon: 'aeropress' },
  espresso: { name: 'Espresso', cat: 'espresso', icon: 'espresso' },
  moka: { name: 'Moka Pot', cat: 'espresso', icon: 'moka' },
  coldbrew: { name: 'Cold Brew', cat: 'cold', icon: 'coldbrew' },
  iced: { name: 'Iced Pour-over', cat: 'cold', icon: 'iced' },
  other: { name: 'อื่นๆ', cat: 'other', icon: 'cup' },
};

export const CATS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'pourover', label: 'Pour-over' },
  { id: 'immersion', label: 'Immersion' },
  { id: 'espresso', label: 'Espresso & Moka' },
  { id: 'cold', label: 'เย็น' },
  { id: 'mine', label: 'ของฉัน' },
];

export const CAT_LABEL = {
  pourover: 'Pour-over',
  immersion: 'Immersion',
  espresso: 'Espresso',
  cold: 'Cold',
  other: 'Custom',
};

export const GRINDS = [
  { id: 'xfine', th: 'ละเอียดมาก', en: 'Extra fine', um: [100, 300], like: 'แป้ง', methods: 'Turkish coffee', size: 5 },
  { id: 'fine', th: 'ละเอียด', en: 'Fine', um: [200, 400], like: 'เกลือป่นละเอียด', methods: 'Espresso', size: 7 },
  { id: 'mfine', th: 'ค่อนละเอียด', en: 'Medium-fine', um: [400, 600], like: 'ทรายละเอียด', methods: 'V60, AeroPress, Moka Pot', size: 10 },
  { id: 'medium', th: 'กลาง', en: 'Medium', um: [600, 800], like: 'ทรายชายหาด', methods: 'Kalita, Clever, เครื่องดริป', size: 13 },
  { id: 'mcoarse', th: 'ค่อนหยาบ', en: 'Medium-coarse', um: [800, 1000], like: 'ทรายหยาบ', methods: 'Chemex, 4:6 Method', size: 16 },
  { id: 'coarse', th: 'หยาบ', en: 'Coarse', um: [1000, 1200], like: 'เกลือทะเลเม็ดใหญ่', methods: 'French Press', size: 19 },
  { id: 'xcoarse', th: 'หยาบมาก', en: 'Extra coarse', um: [1200, 1600], like: 'พริกไทยบุบหยาบ', methods: 'Cold Brew', size: 22 },
];
export const grindById = (id) => GRINDS.find((g) => g.id === id) || GRINDS[3];

/** Calculator presets. mode "brew" = water in, mode "yield" = beverage out (espresso). */
export const PRESETS = [
  { id: 'golden', mode: 'brew', label: 'Golden Cup', sub: '1:18.2 · SCA', ratio: 18.2, kind: 'pourover' },
  { id: 'pour', mode: 'brew', label: 'Pour-over', sub: '1:16', ratio: 16, kind: 'pourover' },
  { id: 'bold', mode: 'brew', label: 'เข้มข้น', sub: '1:15', ratio: 15, kind: 'pourover' },
  { id: 'press', mode: 'brew', label: 'French Press', sub: '1:15', ratio: 15, kind: 'immersion' },
  { id: 'iced', mode: 'brew', label: 'Iced (รวมน้ำแข็ง)', sub: '1:15', ratio: 15, kind: 'iced' },
  { id: 'moka', mode: 'brew', label: 'Moka Pot', sub: '1:10', ratio: 10, kind: 'moka' },
  { id: 'cold', mode: 'brew', label: 'Cold Brew', sub: '1:8', ratio: 8, kind: 'cold' },
  { id: 'ristretto', mode: 'yield', label: 'Ristretto', sub: '1:1.5', ratio: 1.5, kind: 'espresso' },
  { id: 'espresso', mode: 'yield', label: 'Espresso', sub: '1:2', ratio: 2, kind: 'espresso' },
  { id: 'lungo', mode: 'yield', label: 'Lungo', sub: '1:3', ratio: 3, kind: 'espresso' },
];

export const KIND_INFO = {
  pourover: { temp: '92–96°C', grind: 'mfine', method: 'v60' },
  immersion: { temp: '93–96°C', grind: 'coarse', method: 'frenchpress' },
  iced: { temp: '92–95°C', grind: 'mfine', method: 'iced' },
  moka: { temp: 'น้ำร้อนจัด', grind: 'mfine', method: 'moka' },
  cold: { temp: 'น้ำเย็น/ห้อง', grind: 'xcoarse', method: 'coldbrew' },
  espresso: { temp: '90–94°C', grind: 'fine', method: 'espresso' },
};

export const RECIPES = [
  {
    id: 'hoffmann-v60',
    name: 'Ultimate V60',
    method: 'v60',
    author: 'James Hoffmann',
    dose: 30, water: 500, temp: 96, grind: 'mfine', time: 210,
    desc: 'สูตรที่เน้นความสม่ำเสมอ — Bloom นาน 45 วินาที เทถึง 60% แล้วเทจนครบ ปิดท้ายด้วยการ swirl ให้ผิวกาแฟเรียบ',
    steps: [
      { t: 0, label: 'Bloom', water: 60, pour: 10, note: 'เทน้ำราว 2 เท่าของกาแฟ แล้ว swirl ให้ผงเปียกทั่วถึง' },
      { t: 45, label: 'เทรอบที่ 1', water: 300, pour: 30, note: 'เทวนช้าๆ ให้ถึง 60% ของน้ำทั้งหมดภายใน 1:15' },
      { t: 75, label: 'เทรอบที่ 2', water: 500, pour: 30, note: 'เทต่อจนครบภายใน 1:45 รักษาระดับน้ำให้คงที่' },
      { t: 105, label: 'Stir & swirl', note: 'คนเบาๆ ตามเข็มและทวนเข็มอย่างละรอบ แล้ว swirl ให้ผิวเรียบ' },
      { t: 120, label: 'Drawdown', note: 'รอน้ำไหลหมด — เป้าหมายประมาณ 3:30' },
    ],
  },
  {
    id: 'kasuya-46',
    name: '4:6 Method',
    method: 'v60',
    author: 'Tetsu Kasuya · World Brewers Cup 2016',
    dose: 20, water: 300, temp: 92, grind: 'mcoarse', time: 210,
    desc: 'แบ่งน้ำเป็น 40% แรกเพื่อคุมความหวาน–เปรี้ยว และ 60% หลังเพื่อคุมความเข้ม เท 5 ครั้ง ครั้งละ 60 g ทุก 45 วินาที',
    steps: [
      { t: 0, label: 'เทครั้งที่ 1', water: 60, pour: 10, note: '40% แรก — เทครั้งแรกน้อยลงถ้าอยากได้รสหวานขึ้น' },
      { t: 45, label: 'เทครั้งที่ 2', water: 120, pour: 10, note: 'จบช่วง 40% ที่ควบคุมรสหวานและเปรี้ยว' },
      { t: 90, label: 'เทครั้งที่ 3', water: 180, pour: 10, note: 'เริ่ม 60% หลัง — จำนวนครั้งที่เทกำหนดความเข้ม' },
      { t: 135, label: 'เทครั้งที่ 4', water: 240, pour: 10 },
      { t: 180, label: 'เทครั้งที่ 5', water: 300, pour: 10, note: 'ยกดริปเปอร์ออกที่ 3:30 แม้น้ำยังไหลไม่หมด' },
    ],
  },
  {
    id: 'chemex-classic',
    name: 'Chemex Classic',
    method: 'chemex',
    author: 'สูตรมาตรฐาน',
    dose: 40, water: 640, temp: 94, grind: 'mcoarse', time: 270,
    desc: 'กระดาษกรอง Chemex หนากว่าปกติ ให้แก้วที่ใสสะอาด ใช้บดค่อนหยาบเพื่อไม่ให้น้ำค้าง',
    steps: [
      { t: 0, label: 'Bloom', water: 80, pour: 10, note: 'เทน้ำ 2 เท่าของกาแฟให้ผงเปียกทั่ว' },
      { t: 45, label: 'เทรอบที่ 1', water: 300, pour: 30, note: 'เทวนเป็นก้นหอยจากกลางออกด้านนอก' },
      { t: 105, label: 'เทรอบที่ 2', water: 480, pour: 25 },
      { t: 150, label: 'เทรอบที่ 3', water: 640, pour: 25 },
      { t: 180, label: 'Drawdown', note: 'รอน้ำไหลหมดราว 4:00–4:30 ถ้าช้ากว่านี้ลองบดหยาบขึ้น' },
    ],
  },
  {
    id: 'kalita-wave',
    name: 'Kalita Wave Pulse',
    method: 'kalita',
    author: 'สูตรมาตรฐาน',
    dose: 20, water: 320, temp: 93, grind: 'medium', time: 210,
    desc: 'ดริปเปอร์ก้นแบนให้การสกัดที่สม่ำเสมอ เทแบบ pulse เป็นจังหวะ รักษาระดับน้ำให้คงที่',
    steps: [
      { t: 0, label: 'Bloom', water: 40, pour: 10, note: 'เทให้ผงเปียกทั่ว' },
      { t: 40, label: 'Pulse 1', water: 120, pour: 15 },
      { t: 70, label: 'Pulse 2', water: 200, pour: 15 },
      { t: 100, label: 'Pulse 3', water: 260, pour: 15 },
      { t: 130, label: 'Pulse 4', water: 320, pour: 15 },
      { t: 150, label: 'Drawdown', note: 'รอน้ำไหลหมด ประมาณ 3:30' },
    ],
  },
  {
    id: 'clever-dripper',
    name: 'Clever Steep & Release',
    method: 'clever',
    author: 'สูตรมาตรฐาน',
    dose: 20, water: 320, temp: 95, grind: 'medium', time: 210,
    desc: 'แช่แบบ French press แต่กรองด้วยกระดาษ — ทำง่าย ผลลัพธ์นิ่ง เหมาะกับมือใหม่',
    steps: [
      { t: 0, label: 'เทน้ำทั้งหมด', water: 320, pour: 15, note: 'เทน้ำให้ครบแล้วใส่ผงกาแฟตาม จะไหลช้าและสม่ำเสมอกว่า' },
      { t: 30, label: 'คนเบาๆ', note: 'คนให้ผงกาแฟจมทั่ว แล้วปิดฝา' },
      { t: 120, label: 'คนแล้วปล่อย', note: 'คนเบาๆ อีกครั้ง แล้ววางบนแก้วเพื่อเปิดวาล์ว' },
      { t: 150, label: 'Drawdown', note: 'รอน้ำไหลหมดประมาณ 3:30' },
    ],
  },
  {
    id: 'hoffmann-frenchpress',
    name: 'French Press (No-plunge)',
    method: 'frenchpress',
    author: 'James Hoffmann',
    dose: 30, water: 500, temp: 96, grind: 'medium', time: 540,
    desc: 'ไม่ต้องกดลงสุด ปล่อยตะกอนตกเองแล้วรินผ่านตะแกรง ได้แก้วที่ใสและหวานกว่า French press ทั่วไป',
    steps: [
      { t: 0, label: 'เทน้ำทั้งหมด', water: 500, pour: 20, note: 'เทแรงพอให้ผงกาแฟเปียกทั่ว' },
      { t: 240, label: 'Break the crust', note: 'คนผิวหน้าเบาๆ ให้ตะกอนจม แล้วตักฟองและผงที่ลอยออก' },
      { t: 270, label: 'รอให้ตะกอนนอนก้น', note: 'ยิ่งรอนาน (5–8 นาที) แก้วยิ่งใส' },
      { t: 510, label: 'กดแค่ผิวแล้วริน', note: 'กด plunger ลงแค่ผิวน้ำ แล้วรินช้าๆ' },
    ],
  },
  {
    id: 'hoffmann-aeropress',
    name: 'Ultimate AeroPress',
    method: 'aeropress',
    author: 'James Hoffmann',
    dose: 11, water: 200, temp: 99, grind: 'mfine', time: 180,
    desc: 'ตั้งแบบปกติ (ไม่กลับหัว) ใช้กาแฟน้อย น้ำร้อนจัด แช่นาน — ได้ถ้วยที่สะอาดและหวาน',
    steps: [
      { t: 0, label: 'เทน้ำทั้งหมด', water: 200, pour: 10, note: 'สวม plunger ไว้ด้านบนเล็กน้อยเพื่อกันน้ำหยด' },
      { t: 120, label: 'Swirl', note: 'ยกทั้งชุดขึ้นแล้ว swirl เบาๆ' },
      { t: 150, label: 'กดช้าๆ', note: 'กดเบาๆ ราว 30 วินาที จนได้ยินเสียงฟู่' },
    ],
  },
  {
    id: 'aeropress-inverted',
    name: 'AeroPress Inverted',
    method: 'aeropress',
    author: 'สูตรมาตรฐาน',
    dose: 15, water: 220, temp: 88, grind: 'mfine', time: 120,
    desc: 'ตั้งกลับหัวเพื่อควบคุมเวลาแช่ได้เต็มที่ น้ำอุ่นลงเล็กน้อยให้รสนุ่ม',
    steps: [
      { t: 0, label: 'Bloom', water: 40, pour: 10, note: 'ตั้งแบบกลับหัว เทน้ำให้ผงเปียกทั่ว' },
      { t: 30, label: 'เทจนครบ', water: 220, pour: 15, note: 'คน 3–4 รอบ แล้วปิดฝาพร้อมกระดาษกรอง' },
      { t: 75, label: 'Flip', note: 'คว่ำลงบนแก้วอย่างระวัง' },
      { t: 90, label: 'กด', note: 'กดช้าๆ ประมาณ 30 วินาที' },
    ],
  },
  {
    id: 'espresso-classic',
    name: 'Espresso 1:2',
    method: 'espresso',
    author: 'มาตรฐานบาร์',
    dose: 18, water: 36, yield: true, temp: 93, grind: 'fine', time: 28,
    desc: 'ชอตมาตรฐาน 1:2 ภายใน 25–30 วินาที ถ้าไหลเร็วไปให้บดละเอียดขึ้น ช้าไปให้บดหยาบขึ้น',
    steps: [
      { t: 0, label: 'เริ่มชอต', note: 'กดเริ่มพร้อมปุ่มเครื่อง (รวม pre-infusion)' },
      { t: 6, label: 'เริ่มไหล', water: 36, pour: 22, note: 'เป้า 36 g บนตาชั่ง' },
    ],
  },
  {
    id: 'ristretto',
    name: 'Ristretto',
    method: 'espresso',
    author: 'มาตรฐานบาร์',
    dose: 18, water: 27, yield: true, temp: 92, grind: 'fine', time: 22,
    desc: 'ชอตสั้น 1:1.5 เข้มข้น บอดี้หนา รสหวานเด่น เหมาะกับเมนูนม',
    steps: [
      { t: 0, label: 'เริ่มชอต', note: 'กดเริ่มพร้อมปุ่มเครื่อง' },
      { t: 6, label: 'เริ่มไหล', water: 27, pour: 16, note: 'หยุดที่ 27 g' },
    ],
  },
  {
    id: 'moka-pot',
    name: 'Moka Pot',
    method: 'moka',
    author: 'สูตรมาตรฐาน',
    dose: 15, water: 150, temp: 90, grind: 'mfine', time: 300,
    desc: 'ใช้น้ำร้อนเติมก้นหม้อเพื่อย่นเวลาบนเตาและลดรสไหม้ ยกออกทันทีเมื่อกาแฟเริ่มสีอ่อนลง',
    steps: [
      { t: 0, label: 'ตั้งไฟกลาง', note: 'เติมน้ำร้อนต่ำกว่าวาล์ว เกลี่ยกาแฟให้เรียบโดยไม่ต้องกด เปิดฝาไว้' },
      { t: 150, label: 'กาแฟเริ่มไหล', note: 'ลดไฟลงให้ไหลช้าและสม่ำเสมอ' },
      { t: 240, label: 'ยกออกจากไฟ', note: 'เมื่อสีเริ่มอ่อนหรือได้ยินเสียงฟู่ รองก้นด้วยผ้าเย็นเพื่อหยุดการสกัด' },
    ],
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew Concentrate',
    method: 'coldbrew',
    author: 'สูตรมาตรฐาน',
    dose: 100, water: 800, temp: null, grind: 'xcoarse', time: 43200,
    desc: 'แช่เย็น 12–18 ชั่วโมง กรองแล้วผสมน้ำหรือนม 1:1 ก่อนดื่ม เก็บในตู้เย็นได้ราว 1 สัปดาห์',
    steps: [
      { t: 0, label: 'ผสมน้ำกับกาแฟ', water: 800, pour: 20, note: 'ใช้น้ำอุณหภูมิห้องหรือน้ำเย็น คนให้ผงเปียกทั่ว' },
      { t: 120, label: 'คนอีกครั้ง แล้วแช่เย็น', note: 'ปิดฝาแล้วเก็บเข้าตู้เย็น' },
      { t: 43140, label: 'กรอง', note: 'กรองผ่านกระดาษหรือผ้าขาวบาง ผสม 1:1 ก่อนเสิร์ฟ' },
    ],
  },
  {
    id: 'japanese-iced',
    name: 'Japanese Iced',
    method: 'iced',
    author: 'สูตรมาตรฐาน',
    dose: 20, water: 300, ice: 120, temp: 94, grind: 'mfine', time: 180,
    desc: 'ชงร้อนลงบนน้ำแข็งทันทีเพื่อเก็บกลิ่นหอม ใช้น้ำร้อน 60% และน้ำแข็ง 40% ของน้ำทั้งหมด',
    steps: [
      { t: 0, label: 'Bloom', water: 40, pour: 10, note: 'ใส่น้ำแข็งในโถรองก่อนเริ่ม' },
      { t: 45, label: 'เทรอบที่ 1', water: 110, pour: 20 },
      { t: 75, label: 'เทรอบที่ 2', water: 180, pour: 20, note: 'น้ำร้อนครบ 180 g' },
      { t: 105, label: 'Drawdown', note: 'เสร็จแล้ว swirl ให้น้ำแข็งละลายผสมกัน' },
    ],
  },
];

export const recipeRatio = (r) => (r.dose > 0 ? r.water / r.dose : 0);

/** Scale a recipe to a new coffee dose. Times stay the same. */
export function scaleRecipe(r, dose) {
  if (!dose || !r.dose || Math.abs(dose - r.dose) < 1e-9) return { ...r, steps: r.steps.map((s) => ({ ...s })) };
  const f = dose / r.dose;
  const rw = (v) => (v == null ? v : r.yield ? Math.round(v * f * 10) / 10 : Math.round(v * f));
  return {
    ...r,
    dose: Math.round(dose * 10) / 10,
    water: rw(r.water),
    ice: r.ice ? Math.round(r.ice * f) : r.ice,
    steps: r.steps.map((s) => ({ ...s, water: rw(s.water) })),
  };
}

/** Build a timer-ready recipe from calculator numbers. */
export function recipeFromCalc({ mode, kind, dose, water, ratio }) {
  const d = Math.round(dose * 10) / 10;
  const w = mode === 'yield' ? Math.round(water * 10) / 10 : Math.round(water);
  const base = { id: 'adhoc', author: 'จากเครื่องคำนวณ', dose: d, water: w, yield: mode === 'yield' };
  const ratioTxt = `1:${Math.round(ratio * 10) / 10}`;
  if (mode === 'yield') {
    const time = ratio <= 1.6 ? 22 : ratio <= 2.5 ? 28 : 35;
    return {
      ...base, name: `Espresso ${ratioTxt}`, method: 'espresso', temp: 93, grind: 'fine', time,
      steps: [
        { t: 0, label: 'เริ่มชอต', note: 'กดเริ่มพร้อมปุ่มเครื่อง' },
        { t: 6, label: 'เริ่มไหล', water: w, pour: time - 6, note: `หยุดที่ ${w} g` },
      ],
    };
  }
  if (kind === 'immersion') {
    return {
      ...base, name: `French Press ${ratioTxt}`, method: 'frenchpress', temp: 95, grind: 'coarse', time: 255,
      steps: [
        { t: 0, label: 'เทน้ำทั้งหมด', water: w, pour: 20, note: 'เทให้ผงกาแฟเปียกทั่ว' },
        { t: 30, label: 'คนแล้วปิดฝา', note: 'คนเบาๆ 2–3 รอบ' },
        { t: 240, label: 'กดแล้วริน', note: 'กดช้าๆ แล้วรินออกทันที' },
      ],
    };
  }
  if (kind === 'cold') {
    return {
      ...base, name: `Cold Brew ${ratioTxt}`, method: 'coldbrew', temp: null, grind: 'xcoarse', time: 43200,
      steps: [
        { t: 0, label: 'ผสมน้ำกับกาแฟ', water: w, pour: 20, note: 'คนให้ผงเปียกทั่ว' },
        { t: 120, label: 'แช่เย็น', note: 'ปิดฝาแล้วเก็บเข้าตู้เย็น 12–18 ชม.' },
        { t: 43140, label: 'กรอง', note: 'กรองแล้วผสมน้ำหรือนมตามชอบ' },
      ],
    };
  }
  if (kind === 'moka') {
    return {
      ...base, name: `Moka Pot ${ratioTxt}`, method: 'moka', temp: 90, grind: 'mfine', time: 300,
      steps: [
        { t: 0, label: 'ตั้งไฟกลาง', note: `เติมน้ำร้อน ${w} g ต่ำกว่าวาล์ว` },
        { t: 150, label: 'กาแฟเริ่มไหล', note: 'ลดไฟลง' },
        { t: 240, label: 'ยกออกจากไฟ', note: 'รองก้นด้วยผ้าเย็นเพื่อหยุดการสกัด' },
      ],
    };
  }
  if (kind === 'iced') {
    const ice = Math.round(w * 0.4);
    const hot = w - ice;
    const bloom = Math.min(hot, Math.round(d * 2));
    return {
      ...base, name: `Iced Pour-over ${ratioTxt}`, method: 'iced', ice, temp: 94, grind: 'mfine', time: 180,
      steps: [
        { t: 0, label: 'Bloom', water: bloom, pour: 10, note: `ใส่น้ำแข็ง ${ice} g ในโถรองก่อน` },
        { t: 45, label: 'เทรอบที่ 1', water: Math.round(bloom + (hot - bloom) / 2), pour: 20 },
        { t: 75, label: 'เทรอบที่ 2', water: hot, pour: 20, note: `น้ำร้อนครบ ${hot} g` },
        { t: 105, label: 'Drawdown', note: 'swirl ให้น้ำแข็งละลายผสมกัน' },
      ],
    };
  }
  const bloom = Math.min(w, Math.round(d * 2));
  return {
    ...base, name: `Pour-over ${ratioTxt}`, method: 'v60', temp: 94, grind: 'mfine', time: 210,
    steps: [
      { t: 0, label: 'Bloom', water: bloom, pour: 10, note: 'เทน้ำ 2 เท่าของกาแฟ แล้ว swirl' },
      { t: 45, label: 'เทรอบที่ 1', water: Math.round(w * 0.6), pour: 25, note: 'เทวนช้าๆ ถึง 60%' },
      { t: 90, label: 'เทรอบที่ 2', water: w, pour: 25, note: 'เทจนครบ' },
      { t: 120, label: 'Drawdown', note: 'swirl เบาๆ แล้วรอน้ำไหลหมด' },
    ],
  };
}

export const ROASTS = [
  { id: 'light', label: 'คั่วอ่อน', range: [93, 96], note: 'เมล็ดแน่นและละลายยาก ใช้น้ำร้อนเพื่อดึงความหวานและความซับซ้อนออกมา' },
  { id: 'medium', label: 'คั่วกลาง', range: [90, 94], note: 'สมดุลระหว่างความหวาน ความเปรี้ยว และบอดี้ — จุดเริ่มต้นที่ดี' },
  { id: 'dark', label: 'คั่วเข้ม', range: [85, 90], note: 'ละลายง่าย ใช้น้ำที่เย็นลงเพื่อลดความขมและรสไหม้' },
];

/** Bean rest windows (days off roast) — general guidance, varies by roaster */
export const REST = {
  filter: [
    { to: 4, label: 'เพิ่งคั่ว — ควรพักให้คายแก๊สก่อน', tone: 'wait' },
    { to: 7, label: 'เริ่มชงได้ รสยังอาจแหลมเล็กน้อย', tone: 'ok' },
    { to: 22, label: 'ช่วงพีค — หอมหวานที่สุด', tone: 'peak' },
    { to: 46, label: 'ยังดี แต่กลิ่นหอมเริ่มจางลง', tone: 'ok' },
    { to: Infinity, label: 'เริ่มหมดความสด ลองบดละเอียดขึ้นเล็กน้อย', tone: 'stale' },
  ],
  espresso: [
    { to: 7, label: 'เพิ่งคั่ว — แก๊สเยอะ ชอตจะไม่นิ่ง', tone: 'wait' },
    { to: 10, label: 'เริ่มชงได้ ครีมาอาจยังฟูมาก', tone: 'ok' },
    { to: 31, label: 'ช่วงพีค — ชอตนิ่งและหวาน', tone: 'peak' },
    { to: 56, label: 'ยังดี แต่ครีมาเริ่มบางลง', tone: 'ok' },
    { to: Infinity, label: 'เริ่มหมดความสด', tone: 'stale' },
  ],
};
