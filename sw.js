// Fonte — service worker : l'app s'ouvre instantanément et fonctionne hors connexion.
// Pour publier une mise à jour, change le numéro de version ci-dessous.
const CACHE = 'fonte-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './img/gus-1.webp', './img/gus-1-closed.webp', './img/hd/gus-1.webp',
  './img/gus-2.webp', './img/gus-2-closed.webp', './img/hd/gus-2.webp',
  './img/gus-3.webp', './img/gus-3-closed.webp', './img/hd/gus-3.webp',
  './img/gus-4.webp', './img/gus-4-closed.webp', './img/hd/gus-4.webp',
  './img/gus-5.webp', './img/gus-5-closed.webp', './img/hd/gus-5.webp',
  './img/gus-6.webp', './img/gus-6-closed.webp', './img/hd/gus-6.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Page : réponse immédiate depuis le cache, mise à jour en arrière-plan.
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(cached => {
        const net = fetch(req).then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
          return res;
        }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  // Le reste (icônes, polices) : cache d'abord, réseau sinon.
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
