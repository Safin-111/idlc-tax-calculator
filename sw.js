/*
 * sw.js — service worker: lets the site and app open offline once visited, and be installed.
 * Online it always fetches fresh files first and keeps a copy; offline it uses the copy.
 * Change CACHE when you want phones to throw away old copies.
 */
var CACHE = 'idlc-tax-v1';
var FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'web/quick.html', 'web/full.html', 'app/index.html',
  'css/tokens.css', 'css/web.css', 'css/app.css',
  'js/tax-rules.js', 'js/tax-engine.js', 'js/format.js', 'js/strings.js', 'js/i18n.js',
  'js/ui-common.js', 'js/ui-quick.js', 'js/ui-full.js', 'js/ui-app.js',
  'assets/fonts/glacial-indifference-400.woff2', 'assets/fonts/glacial-indifference-700.woff2',
  'assets/logo/idlc-logo-horizontal.jpg', 'assets/logo/idlc-logo-stacked.png',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); });
    })
  );
});
