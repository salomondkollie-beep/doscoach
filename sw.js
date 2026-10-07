// Petit fichier technique qui permet à Chrome d'installer l'application.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => new Response("Pas de connexion. Réessaie plus tard.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })));
  }
});
