// Dessine le logo en image PNG (192 ou 512) pour l'installation de l'application.
const zlib = require("zlib");
const TEAL = [31, 122, 109], WHITE = [255, 255, 255], GOLD = [227, 167, 47];
const BARS = [[33, 15, 24, WHITE], [31, 28, 28, WHITE], [29, 41, 32, WHITE], [27, 54, 36, GOLD], [25, 67, 40, GOLD]];
const cache = {};

function sd(px, py, x, y, w, h, r) {
  const dx = Math.abs(px - (x + w / 2)) - (w / 2 - r), dy = Math.abs(py - (y + h / 2)) - (h / 2 - r);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
}
const cov = d => Math.max(0, Math.min(1, 0.5 - d));
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const t = Buffer.from(type), len = Buffer.alloc(4), cr = Buffer.alloc(4);
  len.writeUInt32BE(data.length); cr.writeUInt32BE(crc(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, cr]);
}
function png(S, maskable) {
  const k = (maskable ? 0.62 : 1) * S / 90, off = maskable ? S * 0.19 : 0;
  const raw = Buffer.alloc(S * (S * 4 + 1));
  for (let j = 0; j < S; j++) {
    raw[j * (S * 4 + 1)] = 0;
    for (let i = 0; i < S; i++) {
      const px = i + 0.5, py = j + 0.5;
      const a = maskable ? 1 : cov(sd(px, py, 0, 0, S, S, S * 20 / 90));
      let c = TEAL.slice();
      for (const [x, y, w, col] of BARS) {
        const b = cov(sd(px, py, off + x * k, off + y * k, w * k, 9 * k, 4 * k));
        c = c.map((v, n) => v + (col[n] - v) * b);
      }
      const o = j * (S * 4 + 1) + 1 + i * 4;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2]; raw[o + 3] = Math.round(a * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}
module.exports = (req, res) => {
  const S = req.query.s === "192" ? 192 : 512, m = req.query.m === "1", key = S + (m ? "m" : "");
  if (!cache[key]) cache[key] = png(S, m);
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(cache[key]);
};
