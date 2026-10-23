// Dessine l'icône de l'application (une tuile de mahjong) en image PNG, en 192 ou 512 pixels.
const zlib = require("zlib");
const GREEN = [23, 96, 74], IVORY = [250, 244, 222], EDGE = [140, 132, 102], BLUE = [46, 134, 193], DBLUE = [27, 79, 114], RED = [231, 76, 60];
const cache = {};
function sd(px, py, x, y, w, h, r) {
  const dx = Math.abs(px - (x + w / 2)) - (w / 2 - r), dy = Math.abs(py - (y + h / 2)) - (h / 2 - r);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
}
const cov = d => Math.max(0, Math.min(1, 0.5 - d));
const mix = (c, col, a) => c.map((v, n) => v + (col[n] - v) * a);
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const t = Buffer.from(type), len = Buffer.alloc(4), cr = Buffer.alloc(4);
  len.writeUInt32BE(data.length); cr.writeUInt32BE(crc(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, cr]);
}
function png(S, maskable) {
  const k = S / 90 * (maskable ? 0.7 : 1), off = maskable ? S * 0.15 : 0;
  const raw = Buffer.alloc(S * (S * 4 + 1));
  for (let j = 0; j < S; j++) {
    raw[j * (S * 4 + 1)] = 0;
    for (let i = 0; i < S; i++) {
      const px = i + 0.5, py = j + 0.5;
      const a = maskable ? 1 : cov(sd(px, py, 0, 0, S, S, S * 20 / 90));
      let c = GREEN.slice();
      c = mix(c, EDGE, cov(sd(px, py, off + 26 * k, off + 16 * k, 42 * k, 58 * k, 6 * k)));
      c = mix(c, IVORY, cov(sd(px, py, off + 24 * k, off + 13 * k, 42 * k, 58 * k, 6 * k)));
      const d = Math.hypot(px - (off + 45 * k), py - (off + 42 * k));
      c = mix(c, DBLUE, cov(d - 14 * k));
      c = mix(c, BLUE, cov(d - 12.5 * k));
      c = mix(c, RED, cov(d - 6 * k));
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
