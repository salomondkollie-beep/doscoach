// Fait fonctionner Salomond Mahjong comme une vraie application : installation et jeu sans connexion.
const CACHE = "mz-v1";
const OFFLINE = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#17604A"><title>Salomond Mahjong - hors ligne</title><style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;background:#17604A;color:#fff;font:400 16px/1.5 system-ui,sans-serif}
h1{font-size:26px;margin:0 0 10px}p{margin:0 0 24px;opacity:.85}
button{font:600 17px system-ui,sans-serif;padding:14px 32px;border:0;border-radius:12px;background:#fff;color:#17604A}
</style></head><body><main><h1>Vous êtes hors ligne</h1><p>Ouvrez le jeu une première fois avec internet pour pouvoir jouer sans connexion.</p>
<button onclick="this.textContent='Nouvelle tentative…';setTimeout(function(){location.reload()},600)">Réessayer</button></main></body></html>`;
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/"])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put("/", c)); } return r; })
      .catch(() => caches.match("/").then(r => r || new Response(OFFLINE, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } })))
  );
});
