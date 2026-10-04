// Crée un paiement CinetPay lié à l'utilisateur et renvoie l'adresse de la page de paiement.
const { cmd, okId } = require("./_db");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const id = (req.body || {}).id;
  if (!okId(id)) return res.status(400).json({ error: "Code invalide" });
  const host = "https://" + req.headers.host;
  const tx = "DC" + Date.now() + Math.floor(Math.random() * 1e6);
  await cmd(["SET", "tx:" + tx, id, "EX", "604800"]);
  const r = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "DosCoach/1.0" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: tx,
      amount: Number(process.env.PRIX_XOF || 1000), // multiple de 5, minimum 100
      currency: "XOF",
      description: "DosCoach mode + 30 jours",
      notify_url: host + "/api/notify",
      return_url: host + "/?tx=" + tx,
      channels: "ALL",
      lang: "fr",
      customer_name: "Client",
      customer_surname: "DosCoach",
      customer_email: "client@doscoach.app",
      customer_phone_number: "0700000000",
      customer_address: "Abidjan",
      customer_city: "Abidjan",
      customer_country: "CI",
      customer_state: "CI",
      customer_zip_code: "00225"
    })
  });
  const j = await r.json();
  const url = j.data && j.data.payment_url;
  if (!url) return res.status(502).json({ error: "Paiement indisponible", detail: j.message || j.description });
  res.json({ url });
};
