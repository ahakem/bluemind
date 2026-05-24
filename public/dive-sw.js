const CACHE = 'dive-sites-v1';
const SCOPE = '/dive-sites';

const PRECACHE = [
  '/dive-sites',
  '/dive-pwa/icon-192.png',
  '/dive-pwa/icon-512.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin requests within the dive-sites scope
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE) && !url.pathname.startsWith('/dive-pwa')) return;

  // Network-first for navigation (always fresh content)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/dive-sites')))
    );
    return;
  }

  // Cache-first for static assets (icons, images)
  if (/\.(png|jpg|webp|svg|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // Network-first for everything else
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
