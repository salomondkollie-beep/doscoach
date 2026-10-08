// Base de données Upstash Redis (via l'API REST) et règlement des paiements.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOK = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const LIM = 5;        // questions gratuites par jour et par utilisateur
const IPLIM = 20;     // questions gratuites par jour et par adresse IP
const cmd = async a => {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: "Bearer " + TOK }, body: JSON.stringify(a) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
};
const okId = s => /^[a-f0-9]{32}$/.test(String(s || ""));
const prem = async id => Number((await cmd(["GET", "prem:" + id])) || 0);
const today = () => new Date().toISOString().slice(0, 10);

// Vérifie le paiement auprès de CinetPay et crédite 30 jours, une seule fois par paiement.
const settle = async tx => {
  const id = await cmd(["GET", "tx:" + tx]);
  if (!id) return null;
  const r = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "DosCoach/1.0" },
    body: JSON.stringify({ apikey: process.env.CINETPAY_API_KEY, site_id: process.env.CINETPAY_SITE_ID, transaction_id: tx })
  });
  const j = await r.json();
  if (!(j.data && j.data.status === "ACCEPTED")) return null;
  const first = await cmd(["SET", "paid:" + tx, "1", "NX", "EX", "5184000"]);
  if (first === "OK") {
    const exp = Math.max(Date.now(), await prem(id)) + 30 * 864e5;
    await cmd(["SET", "prem:" + id, String(exp)]);
    return exp;
  }
  return prem(id);
};
module.exports = { cmd, okId, prem, today, settle, LIM, IPLIM };
