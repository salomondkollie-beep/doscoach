// Le coach IA. La clé Anthropic reste ici, côté serveur. Les limites gratuites sont comptées ici aussi.
const { cmd, okId, prem, today, LIM, IPLIM } = require("./_db");
const RULES = "Tu es DosCoach, un coach bienveillant spécialisé dans le mal de dos. Réponds en français, en 5 phrases maximum, avec des conseils simples (mouvement doux, posture, habitudes). Ne pose jamais de diagnostic. Si la personne décrit un signe d'alerte (douleur après un choc, fièvre, perte de force, fourmillements importants, difficulté à uriner, douleur nocturne intense), dis-lui de consulter un médecin rapidement. Si la douleur dure, rappelle que tu ne remplaces pas un médecin.";
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
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 400, system: RULES, messages: msgs })
  });
  const j = await r.json();
  const text = j.content && j.content[0] && j.content[0].text;
  if (!text) {
    if (!premium) await cmd(["DECR", kn]);
    return res.status(502).json({ error: "Coach indisponible" });
  }
  res.json({ text, left });
};
  
