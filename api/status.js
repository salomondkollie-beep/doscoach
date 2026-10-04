// État du compte : mode + actif ou non, questions gratuites restantes.
const { cmd, okId, prem, today, LIM } = require("./_db");
module.exports = async (req, res) => {
  const id = String(req.query.id || "");
  if (!okId(id)) return res.status(400).json({ error: "Code invalide" });
  const exp = await prem(id);
  const n = Number((await cmd(["GET", `n:${id}:${today()}`])) || 0);
  res.json({ premium: exp > Date.now(), exp, left: Math.max(0, LIM - n) });
};
