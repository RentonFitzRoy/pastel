const CACHE = 'wzburzenie-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    scheduleNext();
  }
});

function scheduleNext() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(next.getHours() + 1, 0, 0, 0);
  const delay = next - now;

  setTimeout(() => {
    self.registration.showNotification('Wzburzenie — czas na wpis', {
      body: 'Jak się teraz czujesz? Oceń poziom wzburzenia.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'hourly-check',
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200]
    });
    scheduleNext();
  }, delay);
}
