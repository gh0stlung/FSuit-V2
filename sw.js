/* Finance Suite 4 — Service Worker */
const CACHE_NAME = 'fs4-v1';
const SHELL = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/wallet.js',
  '/js/rentbook.js',
  '/js/settings.js',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Network-first for Google Fonts, cache-first for everything else
  if (e.request.url.includes('fonts.googleapis') || e.request.url.includes('fonts.gstatic')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async c => {
        const cached = await c.match(e.request);
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          c.put(e.request, res.clone());
          return res;
        } catch { return cached; }
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
