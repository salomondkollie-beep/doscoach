// Appelée au retour du paiement : confirme et renvoie la date de fin du mode +.
const { settle } = require("./_db");
module.exports = async (req, res) => {
  const tx = String(req.query.tx || "");
  if (!/^DC\d+$/.test(tx)) return res.status(400).json({ ok: false });
  const exp = await settle(tx);
  res.json({ ok: !!exp, exp: exp || 0 });
};
