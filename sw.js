// Permet d'installer l'application et affiche une page « hors ligne » quand il n'y a pas de connexion.
const OFFLINE = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1F7A6D"><title>DosCoach - hors ligne</title><style>
:root{--bg:#F1F5F2;--ink:#16302D;--mute:#5B6F6B;--acc:#1F7A6D;--on:#fff}
@media(prefers-color-scheme:dark){:root{--bg:#0F1D1B;--ink:#E4EFEC;--mute:#97ADA8;--acc:#4FB9A8;--on:#0F1D1B}}
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{background:var(--bg);color:var(--ink);font:400 16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px}
main{max-width:340px}
svg.logo{width:84px;height:84px;margin-bottom:20px}
h1{font-size:26px;line-height:1.2;margin:0 0 10px}
p{color:var(--mute);margin:0 0 24px}
button{font:600 17px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:14px 32px;border:0;border-radius:12px;background:var(--acc);color:var(--on)}
button:active{opacity:.8}
</style></head><body><main>
<svg class="logo" viewBox="0 0 90 90" aria-hidden="true"><rect width="90" height="90" rx="20" fill="#1F7A6D"/><rect x="33" y="15" width="24" height="9" rx="4" fill="#FFFFFF"/><rect x="31" y="28" width="28" height="9" rx="4" fill="#FFFFFF"/><rect x="29" y="41" width="32" height="9" rx="4" fill="#FFFFFF"/><rect x="27" y="54" width="36" height="9" rx="4" fill="#E3A72F"/><rect x="25" y="67" width="40" height="9" rx="4" fill="#E3A72F"/></svg>
<h1>Vous êtes hors ligne</h1>
<p>Aucune connexion internet. Vérifiez votre réseau, puis touchez Réessayer.</p>
<button onclick="this.textContent='Nouvelle tentative…';setTimeout(function(){location.reload()},600)">Réessayer</button>
</main></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => new Response(OFFLINE, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } })));
  }
});
