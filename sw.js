/* =========================================================================
   sw.js  —  Service worker (makes the app work offline once installed)
   =========================================================================
   A service worker is a small script the browser keeps running in the
   background. Ours caches the app's files the first time you visit, then
   serves them from the cache afterward — so the app opens instantly and
   works with no signal at the gym.

   NOTE: this only runs when the app is served over http(s) (i.e. once we
   put it online), not when opened as a local file.
   ========================================================================= */

const CACHE = "trainer-v3";
const FILES = [
  "index.html",
  "css/styles.css",
  "js/data.js",
  "js/storage.js",
  "js/engine.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon.svg"
];

// On install: pre-cache all the app files.
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); }));
  self.skipWaiting();
});

// On activate: clean up any old caches from previous versions.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                            .map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// On every request: serve from cache first, otherwise fetch from the network
// AND stash a copy in the cache — so exercise photos you view once are then
// available offline at the gym.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(event.request, copy); });
        }
        return resp;
      });
    })
  );
});
