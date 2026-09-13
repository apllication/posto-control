const CACHE = 'posto-control-v7';
const ASSETS = [
  './', './controle-posto.html', './painel-gerente.html', './painel-supervisor.html', './administracao-supervisor.html', './gerentes-postos.html',
  './manifest-gerente.webmanifest', './manifest-supervisor.webmanifest', './icone-posto.svg'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
