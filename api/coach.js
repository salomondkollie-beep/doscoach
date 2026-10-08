// Le coach IA (Gemini, offre gratuite). La clé reste ici, côté serveur. Les limites gratuites sont comptées ici aussi.
const { cmd, okId, prem, today, LIM, IPLIM } = require("./_db");
const RULES = "Tu es DosCoach, un coach bienveillant spécialisé dans le mal de dos. Réponds en français, en 5 phrases maximum, avec des conseils simples (mouvement doux, posture, habitudes). Ne pose jamais de diagnostic. Si la personne décrit un signe d'alerte (douleur après un choc, fièvre, perte de force, fourmillements importants, difficulté à uriner, douleur nocturne intense), dis-lui de consulter un médecin rapidement. Si la douleur dure, rappelle que tu ne remplaces pas un médecin.";
const MODELS = [process.env.GEMINI_MODEL, "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite"].filter(Boolean);
// Réflexion réduite au minimum : le coach répond bien plus vite.
const thinking = m => /gemini-3/.test(m) ? { thinkingLevel: "minimal" } : /gemini-2\.5/.test(m) ? { thinkingBudget: 0 } : null;

async function call(m, contents, fast) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 12000);
  try {
    const body = { systemInstruction: { parts: [{ text: RULES }] }, contents };
    if (fast && thinking(m)) body.generationConfig = { maxOutputTokens: 600, thinkingConfig: thinking(m) };
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY || "" },
      body: JSON.stringify(body),
      signal: ctl.signal
    });
    const j = await r.json();
    const c = j.candidates && j.candidates[0];
    const parts = c && c.content && c.content.parts;
    const text = parts && parts.map(p => p.text || "").join("").trim();
    return { status: r.status, text, msg: (j.error && j.error.message) || (c && c.finishReason) || "réponse vide" };
  } finally { clearTimeout(timer); }
}

async function ask(contents) {
  const t0 = Date.now();
  let err = "inconnue";
  for (const m of MODELS) {
    for (const fast of [true, false]) {
      if (Date.now() - t0 > 28000) return { err: "trop long : " + err };
      if (!fast && !thinking(m)) continue;
      try {
        const x = await call(m, contents, fast);
        if (x.text) return { text: x.text };
        err = m + " : HTTP " + x.status + " " + x.msg;
        if (x.status === 400 && fast) continue;
      } catch (e) {
        err = m + " : " + e.message;
      }
      break;
    }
  }
  return { err: String(err).slice(0, 300) };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const { messages, id } = req.body || {};
  if (!okId(id) || !Array.isArray(messages) || !messages.length || messages.length > 12)
    return res.status(400).json({ error: "Requête invalide" });
  const msgs = messages.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 500)
  }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length) return res.status(400).json({ error: "Requête invalide" });

  const premium = (await prem(id)) > Date.now();
  const d = today(), kn = `n:${id}:${d}`;
  let left = null;
  if (!premium) {
    const ip = String(req.headers["x-forwarded-for"] || "?").split(",")[0].trim(), ki = `ip:${ip}:${d}`;
    const n = await cmd(["INCR", kn]), ni = await cmd(["INCR", ki]);
    if (n === 1) await cmd(["EXPIRE", kn, "172800"]);
    if (ni === 1) await cmd(["EXPIRE", ki, "172800"]);
    if (n > LIM || ni > IPLIM) return res.status(429).json({ limit: true });
    left = LIM - n;
  }
  const contents = msgs.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const out = await ask(contents);
  if (!out.text) {
    if (!premium) await cmd(["DECR", kn]);
    console.error("Gemini :", out.err);
    return res.status(502).json({ error: "Coach indisponible" });
  }
  try {
    const hk = "h:" + id;
    await cmd(["RPUSH", hk, JSON.stringify({ role: "user", content: msgs[msgs.length - 1].content }), JSON.stringify({ role: "assistant", content: out.text })]);
    await cmd(["LTRIM", hk, "-40", "-1"]);
    await cmd(["EXPIRE", hk, "5184000"]);
  } catch (e) { console.error("Historique :", e.message); }
  res.json({ text: out.text, left });
};
