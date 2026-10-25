# share/coffee ☕

**Brew by the numbers.** แอปชงกาแฟบนเว็บ — คำนวณอัตราส่วน จับเวลาแบบนำทางทุกจังหวะการเท สูตรมาตรฐาน และแชร์สูตรให้เพื่อนด้วยลิงก์เดียว

🔗 **https://saalimon.github.io/share-coffee/**

## ฟีเจอร์

| | |
|---|---|
| **คำนวณอัตราส่วน** | กาแฟ ↔ น้ำ ↔ อัตราส่วน พร้อมปุ่มตรึงค่า, โหมดดริป/แช่ และเอสเปรสโซ (yield), preset เช่น SCA Golden Cup 1:18.2, คำนวณจากจำนวนแก้ว (ชดเชยน้ำที่กากดูด ~2 g/g), มาตรวัดความเข้ม |
| **จับเวลาชง** | วงแหวนเวลา + ระดับน้ำที่ไหลขึ้นตามเป้าบนตาชั่งแบบเรียลไทม์, เสียง/สั่นเตือนทุกขั้น, นับถอยหลัง 3-2-1, ข้ามขั้น, ปรับปริมาณกาแฟแล้วขั้นตอนปรับตาม, กันหน้าจอดับ (Wake Lock), โหมดจับเวลาอิสระพร้อมบันทึกรอบ, คีย์ลัด `Space` `N` `R` |
| **สูตรมาตรฐาน 13 สูตร** | Hoffmann V60 / French Press / AeroPress, Tetsu Kasuya 4:6, Chemex, Kalita Wave, Clever, AeroPress Inverted, Espresso 1:2, Ristretto, Moka Pot, Cold Brew, Japanese Iced |
| **สูตรของฉัน** | สร้าง/แก้ไข/ทำสำเนาสูตร พร้อมขั้นตอนการเท — เก็บไว้ในเครื่อง (localStorage) |
| **แชร์** | สูตรถูกบีบอัด (deflate) แล้วฝังไว้ในลิงก์ — ไม่ต้องมีเซิร์ฟเวอร์หรือบัญชี, QR code, Web Share, ส่งทาง LINE, ผู้รับกดบันทึกเป็นสูตรของตัวเองได้ |
| **เครื่องมือ** | Extraction yield (EY%) + Brew Control Chart, วันพักเมล็ด, อุณหภูมิน้ำตามระดับคั่ว, ระดับการบด, แปลงหน่วย, ต้นทุนต่อแก้ว |
| **PWA** | ติดตั้งเป็นแอปและใช้งานออฟไลน์ได้ |

## ดีไซน์ & Motion

- Design system: [Framer DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/framer/DESIGN.md) — canvas ดำ `#090909`, ปุ่ม pill สีขาว, ฟ้า `#0099ff` ใช้เฉพาะ focus/ลิงก์, gradient spotlight cards (violet/magenta/orange/coral), ตัวอักษร display tracking ติดลบแรง
- ฟอนต์: Mona Sans (display), Inter (body), Anuphan (ภาษาไทย) — self-hosted
- Motion อ้างอิง [Motion UI Design](https://github.com/chaconnewu/awesome-augmented/blob/master/awesomes/motion-ui-design.md):
  spring physics (แบบ Popmotion/Dynamics.js) ทั้งใน JS และ CSS `linear()`, easing จาก easings.net, transformicon play/pause morph,
  SVG stroke drawing แบบ Vivus, คลื่นน้ำใน timer, staggered scroll reveal, split-word headline, magnetic buttons, tilt + glare,
  bottom-sheet drag-to-dismiss, particle burst เมื่อชงเสร็จ — แอนิเมตเฉพาะ `transform`/`opacity` และเคารพ `prefers-reduced-motion`

## พัฒนาในเครื่อง

ไม่มีขั้นตอน build — เป็น static site ล้วน (ES modules)

```bash
python3 -m http.server 8000
# เปิด http://localhost:8000
```

## Deploy

Push เข้า `master` แล้ว GitHub Actions (`.github/workflows/deploy.yml`) จะ deploy ขึ้น GitHub Pages อัตโนมัติ
ซึ่งจะ build แล้ว publish ไปที่ branch `gh-pages` (Settings → Pages → Deploy from a branch → `gh-pages` / root)

## โครงสร้าง

```
index.html            app shell, nav, footer
css/styles.css        design tokens + components
js/main.js            router, view transitions, shared-link import, service worker
js/data.js            methods, grind levels, presets, standard recipes
js/motion.js          springs, reveals, tilt, magnetic, burst, drag-to-dismiss
js/share.js           encode/decode recipe links, QR, share sheet
js/views/*.js         calc · timer · recipes · tools
sw.js                 offline cache (network-first)
```

## เครดิต

- สูตรอ้างอิง: James Hoffmann, Tetsu Kasuya (World Brewers Cup 2016), SCA Golden Cup Standard, SCA Brewing Control Chart — ตัวเลขเป็นจุดเริ่มต้น ปรับตามเมล็ดและรสนิยม
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT) · ฟอนต์ Mona Sans, Inter, Anuphan (SIL Open Font License) ผ่าน [Fontsource](https://fontsource.org)
