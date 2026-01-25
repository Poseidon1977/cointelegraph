const CACHE_NAME = 'coin-telegraph-v3'; // Force update for icons
const ASSETS = [
    './',
    './index.html',
    './style.css?v=2.1',
    './app.js?v=2.1',
    './manifest.json?v=2',
    './icon.png?v=2',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/apexcharts'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force update immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
