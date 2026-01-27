// Rescue v3.0 - Service Worker Cleanup
// Skip waiting and claim clients immediately, but do NOT intercept fetch
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
