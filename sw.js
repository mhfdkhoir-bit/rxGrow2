const CACHE_PREFIX = 'rxgrow-offline:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + 'be7f4e5f121c';
const INDEX = new URL('index.html', self.registration.scope).href;
const ASSETS = new Set(["rxgrow.css","space-grotesk.woff2","fa-solid-900.woff2","fa-regular-400.woff2","icon.svg","manifest.webmanifest"].map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache =>
    cache.addAll([INDEX, ...ASSETS].map(url => new Request(url, { cache: 'reload' })))
  ));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const page = request.mode === 'navigate' &&
    (url.pathname === new URL(INDEX).pathname || url.pathname === new URL(self.registration.scope).pathname);
  if (!page && !ASSETS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(page ? INDEX : request)) || fetch(request);
  })());
});
