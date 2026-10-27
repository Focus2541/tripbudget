// TripBudget service worker — ทำให้แอปเปิดได้แม้ไม่มีเน็ต
// ไม่ต้องแก้ไฟล์นี้เวลาอัปเดต ให้เปลี่ยนเลขใน version.js แทน (ชื่อแคชจะเปลี่ยนตาม)
importScripts('version.js');
const CACHE = 'tripbudget-v' + self.APP_VERSION;
const CORE = ['./', './index.html', './version.js', './countries.js', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // โหลดไฟล์ใหม่จากเซิร์ฟเวอร์ (ไม่ใช้แคชของเบราว์เซอร์) แล้วรอให้ผู้ใช้กด "โหลดใหม่"
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache:'reload'})))));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    // ลบเฉพาะแคชเก่าของ TripBudget เอง ไม่แตะแคชของแอปอื่นบน focus2541.github.io (เช่น SunSide)
    .then(keys => Promise.all(keys.filter(k => k.startsWith('tripbudget-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/er-api\.com|exchangerate-api\.com|script\.google(usercontent)?\.com/.test(url.hostname)) return; // เรทเงินและส่งความเห็น: ไม่แคช
  if (url.origin === location.origin && /\/version\.js$/.test(url.pathname) && url.search.includes('check')) return; // ตรวจเวอร์ชันใหม่
  if (req.mode === 'navigate') {
    // หน้าแอปมาจากแคชของเวอร์ชันนี้ เวอร์ชันใหม่จะใช้เมื่อผู้ใช้กดโหลดใหม่
    e.respondWith(caches.open(CACHE).then(c => c.match('./index.html')).then(hit => hit || fetch(req)).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => {
    if (hit) return hit;
    return fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; });
  })).catch(() => caches.match(req)));
});
