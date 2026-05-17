const APP_VERSION = 'echo-replay-drift';
const CACHE = 'echovault-v14-replay-drift';
const APP_VERSION = 'phase-2-emotional-universe';
const CACHE = 'echovault-v14-phase-2-emotional-universe';

const toScopeUrl = (path) => new URL(path, self.registration.scope).toString();
const PRECACHE = ['./', 'index.html', 'styles.css', 'phase2-emotional-intelligence.js', 'script.js', 'manifest.json', 'icons/icon.svg', 'wrapped-cinematic-module.js'];
const PRECACHE_URLS = PRECACHE.map(toScopeUrl);
const FALLBACK_INDEX = toScopeUrl('index.html');
const ICON_URL = toScopeUrl('icons/icon.svg');

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE_URLS).catch(() => c.addAll([FALLBACK_INDEX])))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ includeUncontrolled: true }))
      .then((clients) => clients.forEach((client) => client.postMessage({ type: 'SW_ACTIVATED', appVersion: APP_VERSION, cache: CACHE })))
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('supabase.co') || url.hostname.includes('googleapis.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then((r) => {
          const c = r.clone();
          caches.open(CACHE).then((ca) => ca.put(FALLBACK_INDEX, c));
          return r;
        })
        .catch(() => caches.match(FALLBACK_INDEX))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request)
      .then((cached) => cached || fetch(e.request).then((r) => {
        if (r.ok) {
          const c = r.clone();
          caches.open(CACHE).then((ca) => ca.put(e.request, c));
        }
        return r;
      }))
  );
});

self.addEventListener('push', (e) => {
  const d = e.data?.json() || { title: 'EchoVault', body: 'A feeling is waiting.' };
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: ICON_URL, badge: ICON_URL, tag: 'echovault' }));
});
