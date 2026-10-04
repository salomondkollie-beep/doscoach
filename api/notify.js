// CinetPay appelle cette adresse après chaque paiement : le mode + est crédité même si l'écran est fermé.
const { settle } = require("./_db");
module.exports = async (req, res) => {
  const tx = String((req.body || {}).cpm_trans_id || "");
  if (/^DC\d+$/.test(tx)) { try { await settle(tx); } catch (e) {} }
  res.status(200).send("ok");
};
