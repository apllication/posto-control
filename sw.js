const CACHE = 'posto-control-v8';
const ASSETS = [
  './', './controle-posto.html', './painel-gerente.html', './painel-supervisor.html', './administracao-supervisor.html', './gerentes-postos.html',
  './manifest-gerente.webmanifest', './manifest-supervisor.webmanifest', './icone-posto.svg'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title || '⛽ Posto Control', {
    body: data.body || '🔔🚨 O supervisor está chamando você!',
    icon: './icone-posto.svg',
    badge: './icone-posto.svg',
    tag: 'posto-control-chamada',
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || './painel-gerente.html' }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    if (clients.openWindow) return clients.openWindow(event.notification.data?.url || './painel-gerente.html');
  }));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
