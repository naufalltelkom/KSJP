const CACHE_NAME = 'ksjp-stematel-shell-v16';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest?v=2',
  '/favicon.svg?v=2',
  '/images/ksjp-logo-v2.png',
  '/images/ksjp-logo.png',
  '/icons/ksjp-icon-192-v2.png',
  '/icons/ksjp-icon-512-v2.png',
  '/icons/ksjp-apple-touch-icon-v2.png',
  '/icons/icon-192.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/livewire') ||
    url.pathname.startsWith('/css/filament/') ||
    url.pathname.startsWith('/js/filament/') ||
    url.pathname.startsWith('/fonts/filament/')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Network-First untuk manifest & aset ikon agar logo terbarunya langsung terbaca di Android/iOS
  if (
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/favicon.svg' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'KSJP SMK Telkom Purwokerto', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'KSJP SMK Telkom Purwokerto';
  const options = {
    body: payload.body || 'Ada pembaruan jadwal atau kalender terbaru.',
    icon: '/icons/ksjp-icon-192-v2.png',
    badge: '/icons/ksjp-icon-192-v2.png',
    tag: payload.tag || 'ksjp-push',
    renotify: Boolean(payload.renotify),
    vibrate: [200, 100, 200],
    data: { url: payload.url || '/', tag: payload.tag || '' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
