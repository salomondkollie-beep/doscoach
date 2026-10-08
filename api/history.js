// Garde la conversation du coach (60 jours), liée au code personnel.
const { cmd, okId } = require("./_db");
module.exports = async (req, res) => {
  const id = String((req.method === "GET" ? req.query.id : (req.body || {}).id) || "");
  if (!okId(id)) return res.status(400).json({ error: "Code invalide" });
  const key = "h:" + id;
  if (req.method === "POST") { await cmd(["DEL", key]); return res.json({ ok: true }); }
  const rows = (await cmd(["LRANGE", key, "0", "-1"])) || [];
  const messages = rows.map(r => { try { return JSON.parse(r); } catch (e) { return null; } }).filter(m => m && m.role && m.content);
  res.json({ messages });
};
