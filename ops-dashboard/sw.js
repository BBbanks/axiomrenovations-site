self.addEventListener("install",event=>{
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

// Intentionally no fetch handler.
// The Axiom Board should use the current network-delivered application shell.
// Canonical operating data remains server-side and is never treated as offline-authoritative.
