const CACHE = 'posto-control-v2';
const ASSETS = [
  './', './controle-posto.html', './painel-gerente.html', './painel-supervisor.html',
  './manifest-gerente.webmanifest', './manifest-supervisor.webmanifest', './icone-posto.svg'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
