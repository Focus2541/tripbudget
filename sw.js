// TripBudget service worker — ใช้งานแบบออฟไลน์ได้
// เมื่อแก้ไฟล์แอป ให้เปลี่ยนเลขเวอร์ชันนี้ เพื่อให้ผู้ใช้ได้เวอร์ชันใหม่
const CACHE = 'tripbudget-v3.0.0';
const CORE = ['./', './index.html', './manifest.json', './icons/favicon.svg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // เรทเงิน: ให้แอปจัดการเอง (มีเรทสำรองในเครื่อง)
  if (/er-api\.com|exchangerate-api\.com/.test(url.hostname)) return;
  // หน้าแอป: ลองเน็ตก่อน ถ้าออฟไลน์ใช้ของในแคช
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // ไฟล์อื่น (ไอคอน, ฟอนต์): ใช้แคชก่อน แล้วอัปเดตเบื้องหลัง
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
