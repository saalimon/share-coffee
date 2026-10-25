// Offline support: network-first for app files (always fresh online), cache fallback offline.
const VERSION = '47645a7e';
const CACHE = `share-coffee-${VERSION}`;
const CORE = [
  './',
  'index.html',
  'css/styles.css',
  'manifest.webmanifest',
  'vendor/qrcode.js',
  'js/main.js',
  'js/util.js',
  'js/icons.js',
  'js/data.js',
  'js/motion.js',
  'js/ui.js',
  'js/store.js',
  'js/sanitize.js',
  'js/share.js',
  'js/recipe-sheet.js',
  'js/views/calc.js',
  'js/views/timer.js',
  'js/views/recipes.js',
  'js/views/tools.js',
  'assets/icon.svg',
  'assets/fonts/mona-sans-latin-wght-normal.woff2',
  'assets/fonts/inter-latin-wght-normal.woff2',
  'assets/fonts/anuphan-thai-wght-normal.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('share-coffee-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())),
      ),
  );
});
