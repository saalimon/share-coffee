// Brew methods, grind levels, calculator presets and the standard recipe library.
// Text that differs by language is stored as { en, th } and resolved with L().
// Step `water` values are CUMULATIVE grams on the scale at the end of that pour.

import { L } from './i18n.js';

const B = (en, th) => ({ en, th });

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
  other: { name: B('Other', 'อื่นๆ'), cat: 'other', icon: 'cup' },
};

export const CATS = [
  { id: 'all', label: B('All', 'ทั้งหมด') },
  { id: 'pourover', label: 'Pour-over' },
  { id: 'immersion', label: 'Immersion' },
  { id: 'espresso', label: 'Espresso & Moka' },
  { id: 'cold', label: B('Cold', 'เย็น') },
  { id: 'mine', label: B('Mine', 'ของฉัน') },
];

export const CAT_LABEL = {
  pourover: 'Pour-over',
  immersion: 'Immersion',
  espresso: 'Espresso',
  cold: 'Cold',
  other: 'Custom',
};

export const GRINDS = [
  { id: 'xfine', name: B('Extra fine', 'ละเอียดมาก'), en: 'Extra fine', um: [100, 300], like: B('Flour', 'แป้ง'), methods: 'Turkish coffee', size: 5 },
  { id: 'fine', name: B('Fine', 'ละเอียด'), en: 'Fine', um: [200, 400], like: B('Fine table salt', 'เกลือป่นละเอียด'), methods: 'Espresso', size: 7 },
  { id: 'mfine', name: B('Medium-fine', 'ค่อนละเอียด'), en: 'Medium-fine', um: [400, 600], like: B('Fine sand', 'ทรายละเอียด'), methods: 'V60, AeroPress, Moka Pot', size: 10 },
  { id: 'medium', name: B('Medium', 'กลาง'), en: 'Medium', um: [600, 800], like: B('Beach sand', 'ทรายชายหาด'), methods: B('Kalita, Clever, drip machines', 'Kalita, Clever, เครื่องดริป'), size: 13 },
  { id: 'mcoarse', name: B('Medium-coarse', 'ค่อนหยาบ'), en: 'Medium-coarse', um: [800, 1000], like: B('Coarse sand', 'ทรายหยาบ'), methods: 'Chemex, 4:6 Method', size: 16 },
  { id: 'coarse', name: B('Coarse', 'หยาบ'), en: 'Coarse', um: [1000, 1200], like: B('Coarse sea salt', 'เกลือทะเลเม็ดใหญ่'), methods: 'French Press', size: 19 },
  { id: 'xcoarse', name: B('Extra coarse', 'หยาบมาก'), en: 'Extra coarse', um: [1200, 1600], like: B('Cracked peppercorns', 'พริกไทยบุบหยาบ'), methods: 'Cold Brew', size: 22 },
];
export const grindById = (id) => GRINDS.find((g) => g.id === id) || GRINDS[3];
export const grindName = (id) => L(grindById(id).name);

/** Calculator presets. mode "brew" = water in, mode "yield" = beverage out (espresso). */
export const PRESETS = [
  { id: 'golden', mode: 'brew', label: 'Golden Cup', sub: '1:18.2 · SCA', ratio: 18.2, kind: 'pourover' },
  { id: 'pour', mode: 'brew', label: 'Pour-over', sub: '1:16', ratio: 16, kind: 'pourover' },
  { id: 'bold', mode: 'brew', label: B('Bold', 'เข้มข้น'), sub: '1:15', ratio: 15, kind: 'pourover' },
  { id: 'press', mode: 'brew', label: 'French Press', sub: '1:15', ratio: 15, kind: 'immersion' },
  { id: 'iced', mode: 'brew', label: B('Iced (incl. ice)', 'Iced (รวมน้ำแข็ง)'), sub: '1:15', ratio: 15, kind: 'iced' },
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
  moka: { temp: B('Just off the boil', 'น้ำร้อนจัด'), grind: 'mfine', method: 'moka' },
  cold: { temp: B('Cold / room temp', 'น้ำเย็น/ห้อง'), grind: 'xcoarse', method: 'coldbrew' },
  espresso: { temp: '90–94°C', grind: 'fine', method: 'espresso' },
};

const STD = B('Classic recipe', 'สูตรมาตรฐาน');
const POUR = (n) => B(`Pour ${n}`, `เทรอบที่ ${n}`);
const TIP = (n) => B(`Pour ${n}`, `เทครั้งที่ ${n}`);

export const RECIPES = [
  {
    id: 'hoffmann-v60',
    name: 'Ultimate V60',
    method: 'v60',
    author: 'James Hoffmann',
    dose: 30, water: 500, temp: 96, grind: 'mfine', time: 210,
    desc: B(
      'Built for consistency — a long 45-second bloom, pour to 60%, then the rest, finishing with a swirl for a flat bed.',
      'สูตรที่เน้นความสม่ำเสมอ — Bloom นาน 45 วินาที เทถึง 60% แล้วเทจนครบ ปิดท้ายด้วยการ swirl ให้ผิวกาแฟเรียบ',
    ),
    steps: [
      { t: 0, label: 'Bloom', water: 60, pour: 10, note: B('Pour about 2× the coffee weight, then swirl until every ground is wet', 'เทน้ำราว 2 เท่าของกาแฟ แล้ว swirl ให้ผงเปียกทั่วถึง') },
      { t: 45, label: POUR(1), water: 300, pour: 30, note: B('Pour slowly in circles to 60% of the total water by 1:15', 'เทวนช้าๆ ให้ถึง 60% ของน้ำทั้งหมดภายใน 1:15') },
      { t: 75, label: POUR(2), water: 500, pour: 30, note: B('Pour the rest by 1:45, keeping the water level steady', 'เทต่อจนครบภายใน 1:45 รักษาระดับน้ำให้คงที่') },
      { t: 105, label: 'Stir & swirl', note: B('Stir gently once each way, then swirl for a flat bed', 'คนเบาๆ ตามเข็มและทวนเข็มอย่างละรอบ แล้ว swirl ให้ผิวเรียบ') },
      { t: 120, label: 'Drawdown', note: B('Let it drain — aim for about 3:30', 'รอน้ำไหลหมด — เป้าหมายประมาณ 3:30') },
    ],
  },
  {
    id: 'kasuya-46',
    name: '4:6 Method',
    method: 'v60',
    author: 'Tetsu Kasuya · World Brewers Cup 2016',
    dose: 20, water: 300, temp: 92, grind: 'mcoarse', time: 210,
    desc: B(
      'The first 40% of the water tunes sweetness and acidity; the last 60% sets the strength. Five 60 g pours, every 45 seconds.',
      'แบ่งน้ำเป็น 40% แรกเพื่อคุมความหวาน–เปรี้ยว และ 60% หลังเพื่อคุมความเข้ม เท 5 ครั้ง ครั้งละ 60 g ทุก 45 วินาที',
    ),
    steps: [
      { t: 0, label: TIP(1), water: 60, pour: 10, note: B('First 40% — pour less here for a sweeter cup', '40% แรก — เทครั้งแรกน้อยลงถ้าอยากได้รสหวานขึ้น') },
      { t: 45, label: TIP(2), water: 120, pour: 10, note: B('Ends the 40% that controls sweetness and acidity', 'จบช่วง 40% ที่ควบคุมรสหวานและเปรี้ยว') },
      { t: 90, label: TIP(3), water: 180, pour: 10, note: B('Start of the final 60% — the number of pours sets strength', 'เริ่ม 60% หลัง — จำนวนครั้งที่เทกำหนดความเข้ม') },
      { t: 135, label: TIP(4), water: 240, pour: 10 },
      { t: 180, label: TIP(5), water: 300, pour: 10, note: B('Remove the dripper at 3:30, even if water remains', 'ยกดริปเปอร์ออกที่ 3:30 แม้น้ำยังไหลไม่หมด') },
    ],
  },
  {
    id: 'chemex-classic',
    name: 'Chemex Classic',
    method: 'chemex',
    author: STD,
    dose: 40, water: 640, temp: 94, grind: 'mcoarse', time: 270,
    desc: B(
      "Chemex's thick filters give a very clean cup. Use a medium-coarse grind so the bed doesn't stall.",
      'กระดาษกรอง Chemex หนากว่าปกติ ให้แก้วที่ใสสะอาด ใช้บดค่อนหยาบเพื่อไม่ให้น้ำค้าง',
    ),
    steps: [
      { t: 0, label: 'Bloom', water: 80, pour: 10, note: B('Pour 2× the coffee weight to wet all the grounds', 'เทน้ำ 2 เท่าของกาแฟให้ผงเปียกทั่ว') },
      { t: 45, label: POUR(1), water: 300, pour: 30, note: B('Spiral from the centre outwards', 'เทวนเป็นก้นหอยจากกลางออกด้านนอก') },
      { t: 105, label: POUR(2), water: 480, pour: 25 },
      { t: 150, label: POUR(3), water: 640, pour: 25 },
      { t: 180, label: 'Drawdown', note: B('Drains by about 4:00–4:30 — if slower, grind coarser', 'รอน้ำไหลหมดราว 4:00–4:30 ถ้าช้ากว่านี้ลองบดหยาบขึ้น') },
    ],
  },
  {
    id: 'kalita-wave',
    name: 'Kalita Wave Pulse',
    method: 'kalita',
    author: STD,
    dose: 20, water: 320, temp: 93, grind: 'medium', time: 210,
    desc: B(
      'The flat-bottom dripper extracts evenly. Pour in rhythmic pulses and keep the water level steady.',
      'ดริปเปอร์ก้นแบนให้การสกัดที่สม่ำเสมอ เทแบบ pulse เป็นจังหวะ รักษาระดับน้ำให้คงที่',
    ),
    steps: [
      { t: 0, label: 'Bloom', water: 40, pour: 10, note: B('Wet all the grounds', 'เทให้ผงเปียกทั่ว') },
      { t: 40, label: 'Pulse 1', water: 120, pour: 15 },
      { t: 70, label: 'Pulse 2', water: 200, pour: 15 },
      { t: 100, label: 'Pulse 3', water: 260, pour: 15 },
      { t: 130, label: 'Pulse 4', water: 320, pour: 15 },
      { t: 150, label: 'Drawdown', note: B('Let it drain, about 3:30', 'รอน้ำไหลหมด ประมาณ 3:30') },
    ],
  },
  {
    id: 'clever-dripper',
    name: 'Clever Steep & Release',
    method: 'clever',
    author: STD,
    dose: 20, water: 320, temp: 95, grind: 'medium', time: 210,
    desc: B(
      'Steeps like a French press but filters through paper — easy, consistent and great for beginners.',
      'แช่แบบ French press แต่กรองด้วยกระดาษ — ทำง่าย ผลลัพธ์นิ่ง เหมาะกับมือใหม่',
    ),
    steps: [
      { t: 0, label: B('Add all the water', 'เทน้ำทั้งหมด'), water: 320, pour: 15, note: B('Water first, then coffee, gives a slower and more even drain', 'เทน้ำให้ครบแล้วใส่ผงกาแฟตาม จะไหลช้าและสม่ำเสมอกว่า') },
      { t: 30, label: B('Gentle stir', 'คนเบาๆ'), note: B('Stir until all the grounds sink, then put the lid on', 'คนให้ผงกาแฟจมทั่ว แล้วปิดฝา') },
      { t: 120, label: B('Stir & release', 'คนแล้วปล่อย'), note: B('Stir gently again, then set it on your cup to open the valve', 'คนเบาๆ อีกครั้ง แล้ววางบนแก้วเพื่อเปิดวาล์ว') },
      { t: 150, label: 'Drawdown', note: B('Drains by about 3:30', 'รอน้ำไหลหมดประมาณ 3:30') },
    ],
  },
  {
    id: 'hoffmann-frenchpress',
    name: 'French Press (No-plunge)',
    method: 'frenchpress',
    author: 'James Hoffmann',
    dose: 30, water: 500, temp: 96, grind: 'medium', time: 540,
    desc: B(
      "No full plunge — let the fines settle on their own and pour through the mesh for a cleaner, sweeter press.",
      'ไม่ต้องกดลงสุด ปล่อยตะกอนตกเองแล้วรินผ่านตะแกรง ได้แก้วที่ใสและหวานกว่า French press ทั่วไป',
    ),
    steps: [
      { t: 0, label: B('Add all the water', 'เทน้ำทั้งหมด'), water: 500, pour: 20, note: B('Pour hard enough to wet all the grounds', 'เทแรงพอให้ผงกาแฟเปียกทั่ว') },
      { t: 240, label: 'Break the crust', note: B('Stir the surface gently so the grounds sink, then skim off foam and floating bits', 'คนผิวหน้าเบาๆ ให้ตะกอนจม แล้วตักฟองและผงที่ลอยออก') },
      { t: 270, label: B('Let it settle', 'รอให้ตะกอนนอนก้น'), note: B('The longer you wait (5–8 min), the cleaner the cup', 'ยิ่งรอนาน (5–8 นาที) แก้วยิ่งใส') },
      { t: 510, label: B('Plunge to the surface & pour', 'กดแค่ผิวแล้วริน'), note: B('Press the plunger just to the surface, then pour slowly', 'กด plunger ลงแค่ผิวน้ำ แล้วรินช้าๆ') },
    ],
  },
  {
    id: 'hoffmann-aeropress',
    name: 'Ultimate AeroPress',
    method: 'aeropress',
    author: 'James Hoffmann',
    dose: 11, water: 200, temp: 99, grind: 'mfine', time: 180,
    desc: B(
      'Upright (not inverted), a small dose, very hot water and a long steep — a clean, sweet cup.',
      'ตั้งแบบปกติ (ไม่กลับหัว) ใช้กาแฟน้อย น้ำร้อนจัด แช่นาน — ได้ถ้วยที่สะอาดและหวาน',
    ),
    steps: [
      { t: 0, label: B('Add all the water', 'เทน้ำทั้งหมด'), water: 200, pour: 10, note: B('Seat the plunger slightly to stop dripping', 'สวม plunger ไว้ด้านบนเล็กน้อยเพื่อกันน้ำหยด') },
      { t: 120, label: 'Swirl', note: B('Lift the whole brewer and swirl gently', 'ยกทั้งชุดขึ้นแล้ว swirl เบาๆ') },
      { t: 150, label: B('Press slowly', 'กดช้าๆ'), note: B('Press gently for about 30 seconds, until it hisses', 'กดเบาๆ ราว 30 วินาที จนได้ยินเสียงฟู่') },
    ],
  },
  {
    id: 'aeropress-inverted',
    name: 'AeroPress Inverted',
    method: 'aeropress',
    author: STD,
    dose: 15, water: 220, temp: 88, grind: 'mfine', time: 120,
    desc: B(
      'Inverted for full control of steep time, with slightly cooler water for a softer cup.',
      'ตั้งกลับหัวเพื่อควบคุมเวลาแช่ได้เต็มที่ น้ำอุ่นลงเล็กน้อยให้รสนุ่ม',
    ),
    steps: [
      { t: 0, label: 'Bloom', water: 40, pour: 10, note: B('Brewer inverted — wet all the grounds', 'ตั้งแบบกลับหัว เทน้ำให้ผงเปียกทั่ว') },
      { t: 30, label: B('Top up', 'เทจนครบ'), water: 220, pour: 15, note: B('Stir 3–4 times, then cap with the filter', 'คน 3–4 รอบ แล้วปิดฝาพร้อมกระดาษกรอง') },
      { t: 75, label: 'Flip', note: B('Carefully flip it onto your cup', 'คว่ำลงบนแก้วอย่างระวัง') },
      { t: 90, label: B('Press', 'กด'), note: B('Press slowly for about 30 seconds', 'กดช้าๆ ประมาณ 30 วินาที') },
    ],
  },
  {
    id: 'espresso-classic',
    name: 'Espresso 1:2',
    method: 'espresso',
    author: B('Bar standard', 'มาตรฐานบาร์'),
    dose: 18, water: 36, yield: true, temp: 93, grind: 'fine', time: 28,
    desc: B(
      'The standard 1:2 shot in 25–30 seconds. Running fast? Grind finer. Running slow? Grind coarser.',
      'ชอตมาตรฐาน 1:2 ภายใน 25–30 วินาที ถ้าไหลเร็วไปให้บดละเอียดขึ้น ช้าไปให้บดหยาบขึ้น',
    ),
    steps: [
      { t: 0, label: B('Start the shot', 'เริ่มชอต'), note: B('Start with the machine button (includes pre-infusion)', 'กดเริ่มพร้อมปุ่มเครื่อง (รวม pre-infusion)') },
      { t: 6, label: B('First drops', 'เริ่มไหล'), water: 36, pour: 22, note: B('Target 36 g on the scale', 'เป้า 36 g บนตาชั่ง') },
    ],
  },
  {
    id: 'ristretto',
    name: 'Ristretto',
    method: 'espresso',
    author: B('Bar standard', 'มาตรฐานบาร์'),
    dose: 18, water: 27, yield: true, temp: 92, grind: 'fine', time: 22,
    desc: B(
      'A short 1:1.5 shot — dense, syrupy body and pronounced sweetness. Great in milk drinks.',
      'ชอตสั้น 1:1.5 เข้มข้น บอดี้หนา รสหวานเด่น เหมาะกับเมนูนม',
    ),
    steps: [
      { t: 0, label: B('Start the shot', 'เริ่มชอต'), note: B('Start with the machine button', 'กดเริ่มพร้อมปุ่มเครื่อง') },
      { t: 6, label: B('First drops', 'เริ่มไหล'), water: 27, pour: 16, note: B('Stop at 27 g', 'หยุดที่ 27 g') },
    ],
  },
  {
    id: 'moka-pot',
    name: 'Moka Pot',
    method: 'moka',
    author: STD,
    dose: 15, water: 150, temp: 90, grind: 'mfine', time: 300,
    desc: B(
      'Fill the base with hot water to shorten time on the heat and avoid scorching. Pull it off as soon as the coffee turns pale.',
      'ใช้น้ำร้อนเติมก้นหม้อเพื่อย่นเวลาบนเตาและลดรสไหม้ ยกออกทันทีเมื่อกาแฟเริ่มสีอ่อนลง',
    ),
    steps: [
      { t: 0, label: B('Medium heat', 'ตั้งไฟกลาง'), note: B('Hot water below the valve, level the coffee without tamping, lid open', 'เติมน้ำร้อนต่ำกว่าวาล์ว เกลี่ยกาแฟให้เรียบโดยไม่ต้องกด เปิดฝาไว้') },
      { t: 150, label: B('Coffee starts flowing', 'กาแฟเริ่มไหล'), note: B('Turn the heat down for a slow, steady flow', 'ลดไฟลงให้ไหลช้าและสม่ำเสมอ') },
      { t: 240, label: B('Off the heat', 'ยกออกจากไฟ'), note: B('When it turns pale or starts to hiss, cool the base with a damp cloth to stop extraction', 'เมื่อสีเริ่มอ่อนหรือได้ยินเสียงฟู่ รองก้นด้วยผ้าเย็นเพื่อหยุดการสกัด') },
    ],
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew Concentrate',
    method: 'coldbrew',
    author: STD,
    dose: 100, water: 800, temp: null, grind: 'xcoarse', time: 43200,
    desc: B(
      'Steep cold for 12–18 hours, filter, then dilute 1:1 with water or milk. Keeps for about a week in the fridge.',
      'แช่เย็น 12–18 ชั่วโมง กรองแล้วผสมน้ำหรือนม 1:1 ก่อนดื่ม เก็บในตู้เย็นได้ราว 1 สัปดาห์',
    ),
    steps: [
      { t: 0, label: B('Combine water & coffee', 'ผสมน้ำกับกาแฟ'), water: 800, pour: 20, note: B('Room-temperature or cold water; stir until every ground is wet', 'ใช้น้ำอุณหภูมิห้องหรือน้ำเย็น คนให้ผงเปียกทั่ว') },
      { t: 120, label: B('Stir again, then refrigerate', 'คนอีกครั้ง แล้วแช่เย็น'), note: B('Cover and refrigerate', 'ปิดฝาแล้วเก็บเข้าตู้เย็น') },
      { t: 43140, label: B('Filter', 'กรอง'), note: B('Filter through paper or cloth; dilute 1:1 to serve', 'กรองผ่านกระดาษหรือผ้าขาวบาง ผสม 1:1 ก่อนเสิร์ฟ') },
    ],
  },
  {
    id: 'japanese-iced',
    name: 'Japanese Iced',
    method: 'iced',
    author: STD,
    dose: 20, water: 300, ice: 120, temp: 94, grind: 'mfine', time: 180,
    desc: B(
      'Brew hot straight onto ice to lock in the aroma — 60% hot water and 40% ice of the total water.',
      'ชงร้อนลงบนน้ำแข็งทันทีเพื่อเก็บกลิ่นหอม ใช้น้ำร้อน 60% และน้ำแข็ง 40% ของน้ำทั้งหมด',
    ),
    steps: [
      { t: 0, label: 'Bloom', water: 40, pour: 10, note: B('Put the ice in the server before you start', 'ใส่น้ำแข็งในโถรองก่อนเริ่ม') },
      { t: 45, label: POUR(1), water: 110, pour: 20 },
      { t: 75, label: POUR(2), water: 180, pour: 20, note: B('180 g of hot water in total', 'น้ำร้อนครบ 180 g') },
      { t: 105, label: 'Drawdown', note: B('Swirl until the ice melts in', 'เสร็จแล้ว swirl ให้น้ำแข็งละลายผสมกัน') },
    ],
  },
];

export const STANDARD_IDS = new Set(RECIPES.map((r) => r.id));

/** Resolve every bilingual field of a recipe into plain strings for the current language. */
export function localizeRecipe(r) {
  return {
    ...r,
    name: L(r.name),
    author: L(r.author),
    desc: L(r.desc),
    steps: r.steps.map((s) => ({ ...s, label: L(s.label), note: L(s.note) })),
  };
}

export const standardRecipes = () => RECIPES.map(localizeRecipe);

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

/** Build a timer-ready recipe from calculator numbers (strings in the current language). */
export function recipeFromCalc({ mode, kind, dose, water, ratio }) {
  const d = Math.round(dose * 10) / 10;
  const w = mode === 'yield' ? Math.round(water * 10) / 10 : Math.round(water);
  const base = { id: 'adhoc', author: L(B('From the calculator', 'จากเครื่องคำนวณ')), dose: d, water: w, yield: mode === 'yield' };
  const ratioTxt = `1:${Math.round(ratio * 10) / 10}`;
  if (mode === 'yield') {
    const time = ratio <= 1.6 ? 22 : ratio <= 2.5 ? 28 : 35;
    return {
      ...base, name: `Espresso ${ratioTxt}`, method: 'espresso', temp: 93, grind: 'fine', time,
      steps: [
        { t: 0, label: L(B('Start the shot', 'เริ่มชอต')), note: L(B('Start with the machine button', 'กดเริ่มพร้อมปุ่มเครื่อง')) },
        { t: 6, label: L(B('First drops', 'เริ่มไหล')), water: w, pour: time - 6, note: L(B(`Stop at ${w} g`, `หยุดที่ ${w} g`)) },
      ],
    };
  }
  if (kind === 'immersion') {
    return {
      ...base, name: `French Press ${ratioTxt}`, method: 'frenchpress', temp: 95, grind: 'coarse', time: 255,
      steps: [
        { t: 0, label: L(B('Add all the water', 'เทน้ำทั้งหมด')), water: w, pour: 20, note: L(B('Wet all the grounds', 'เทให้ผงกาแฟเปียกทั่ว')) },
        { t: 30, label: L(B('Stir & cover', 'คนแล้วปิดฝา')), note: L(B('Stir gently 2–3 times', 'คนเบาๆ 2–3 รอบ')) },
        { t: 240, label: L(B('Press & pour', 'กดแล้วริน')), note: L(B('Press slowly and pour straight away', 'กดช้าๆ แล้วรินออกทันที')) },
      ],
    };
  }
  if (kind === 'cold') {
    return {
      ...base, name: `Cold Brew ${ratioTxt}`, method: 'coldbrew', temp: null, grind: 'xcoarse', time: 43200,
      steps: [
        { t: 0, label: L(B('Combine water & coffee', 'ผสมน้ำกับกาแฟ')), water: w, pour: 20, note: L(B('Stir until every ground is wet', 'คนให้ผงเปียกทั่ว')) },
        { t: 120, label: L(B('Refrigerate', 'แช่เย็น')), note: L(B('Cover and refrigerate for 12–18 h', 'ปิดฝาแล้วเก็บเข้าตู้เย็น 12–18 ชม.')) },
        { t: 43140, label: L(B('Filter', 'กรอง')), note: L(B('Filter, then dilute with water or milk to taste', 'กรองแล้วผสมน้ำหรือนมตามชอบ')) },
      ],
    };
  }
  if (kind === 'moka') {
    return {
      ...base, name: `Moka Pot ${ratioTxt}`, method: 'moka', temp: 90, grind: 'mfine', time: 300,
      steps: [
        { t: 0, label: L(B('Medium heat', 'ตั้งไฟกลาง')), note: L(B(`${w} g hot water, below the valve`, `เติมน้ำร้อน ${w} g ต่ำกว่าวาล์ว`)) },
        { t: 150, label: L(B('Coffee starts flowing', 'กาแฟเริ่มไหล')), note: L(B('Turn the heat down', 'ลดไฟลง')) },
        { t: 240, label: L(B('Off the heat', 'ยกออกจากไฟ')), note: L(B('Cool the base with a damp cloth to stop extraction', 'รองก้นด้วยผ้าเย็นเพื่อหยุดการสกัด')) },
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
        { t: 0, label: 'Bloom', water: bloom, pour: 10, note: L(B(`Put ${ice} g of ice in the server first`, `ใส่น้ำแข็ง ${ice} g ในโถรองก่อน`)) },
        { t: 45, label: L(POUR(1)), water: Math.round(bloom + (hot - bloom) / 2), pour: 20 },
        { t: 75, label: L(POUR(2)), water: hot, pour: 20, note: L(B(`${hot} g of hot water in total`, `น้ำร้อนครบ ${hot} g`)) },
        { t: 105, label: 'Drawdown', note: L(B('Swirl until the ice melts in', 'swirl ให้น้ำแข็งละลายผสมกัน')) },
      ],
    };
  }
  const bloom = Math.min(w, Math.round(d * 2));
  return {
    ...base, name: `Pour-over ${ratioTxt}`, method: 'v60', temp: 94, grind: 'mfine', time: 210,
    steps: [
      { t: 0, label: 'Bloom', water: bloom, pour: 10, note: L(B('Pour 2× the coffee weight, then swirl', 'เทน้ำ 2 เท่าของกาแฟ แล้ว swirl')) },
      { t: 45, label: L(POUR(1)), water: Math.round(w * 0.6), pour: 25, note: L(B('Pour slowly to 60%', 'เทวนช้าๆ ถึง 60%')) },
      { t: 90, label: L(POUR(2)), water: w, pour: 25, note: L(B('Pour the rest', 'เทจนครบ')) },
      { t: 120, label: 'Drawdown', note: L(B('Swirl gently and let it drain', 'swirl เบาๆ แล้วรอน้ำไหลหมด')) },
    ],
  };
}

export const ROASTS = [
  { id: 'light', label: B('Light roast', 'คั่วอ่อน'), range: [93, 96], note: B('Dense beans that dissolve slowly — hot water pulls out sweetness and complexity.', 'เมล็ดแน่นและละลายยาก ใช้น้ำร้อนเพื่อดึงความหวานและความซับซ้อนออกมา') },
  { id: 'medium', label: B('Medium roast', 'คั่วกลาง'), range: [90, 94], note: B('A balance of sweetness, acidity and body — a good place to start.', 'สมดุลระหว่างความหวาน ความเปรี้ยว และบอดี้ — จุดเริ่มต้นที่ดี') },
  { id: 'dark', label: B('Dark roast', 'คั่วเข้ม'), range: [85, 90], note: B('Dissolves easily — cooler water tames bitterness and roasty notes.', 'ละลายง่าย ใช้น้ำที่เย็นลงเพื่อลดความขมและรสไหม้') },
];

/** Bean rest windows (days off roast) — general guidance, varies by roaster */
export const REST = {
  filter: [
    { to: 4, label: B('Freshly roasted — let it degas first', 'เพิ่งคั่ว — ควรพักให้คายแก๊สก่อน'), tone: 'wait' },
    { to: 7, label: B('Ready to brew, may still taste a little sharp', 'เริ่มชงได้ รสยังอาจแหลมเล็กน้อย'), tone: 'ok' },
    { to: 22, label: B('Peak — at its sweetest and most aromatic', 'ช่วงพีค — หอมหวานที่สุด'), tone: 'peak' },
    { to: 46, label: B('Still good, but the aroma is fading', 'ยังดี แต่กลิ่นหอมเริ่มจางลง'), tone: 'ok' },
    { to: Infinity, label: B('Past its best — try grinding a little finer', 'เริ่มหมดความสด ลองบดละเอียดขึ้นเล็กน้อย'), tone: 'stale' },
  ],
  espresso: [
    { to: 7, label: B('Freshly roasted — too much gas for stable shots', 'เพิ่งคั่ว — แก๊สเยอะ ชอตจะไม่นิ่ง'), tone: 'wait' },
    { to: 10, label: B('Ready to brew, the crema may still be bubbly', 'เริ่มชงได้ ครีมาอาจยังฟูมาก'), tone: 'ok' },
    { to: 31, label: B('Peak — stable, sweet shots', 'ช่วงพีค — ชอตนิ่งและหวาน'), tone: 'peak' },
    { to: 56, label: B('Still good, but the crema is thinning', 'ยังดี แต่ครีมาเริ่มบางลง'), tone: 'ok' },
    { to: Infinity, label: B('Past its best', 'เริ่มหมดความสด'), tone: 'stale' },
  ],
};
