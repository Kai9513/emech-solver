/* E-MECH Solver offline cache. Bump VERSION on every release so phones pick up the update. */
const VERSION = "emech-v1";
const FILES = ["./", "index.html", "style.css", "manifest.webmanifest",
  "js/core.js", "js/kb.js", "js/engine.js", "js/parse.js", "js/sketch.js", "js/templates.js", "js/gallery.js", "js/words.js", "js/app.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // answer from the cache right away (works offline), refresh the cache in the background when online
  e.respondWith(caches.open(VERSION).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit || c.match("index.html"));
    return hit || net;
  })));
});
