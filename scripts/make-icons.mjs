/* Generates the PWA icons (rounded orange square with an open white book)
   as PNGs using only Node's built-in zlib — no image libraries needed.
   Run: node scripts/make-icons.mjs */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// ---- minimal PNG encoder (8-bit RGBA) ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(pixels, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- draw the icon at 4x supersampling for smooth edges ----
function drawIcon(size) {
  const SS = 4;
  const S = size * SS;
  const px = new Float32Array(S * S * 4);

  const cornerR = S * 0.22;
  const inRoundedRect = (x, y) => {
    const dx = Math.max(cornerR - x, x - (S - cornerR), 0);
    const dy = Math.max(cornerR - y, y - (S - cornerR), 0);
    return dx * dx + dy * dy <= cornerR * cornerR;
  };

  // book geometry
  const cx = S / 2, cy = S * 0.54;
  const bw = S * 0.30;                 // half width of the open book
  const ph = S * 0.17;                 // half page height at the spine
  const tilt = S * 0.06;               // outer edges rise

  const inBook = (x, y) => {
    const dx = Math.abs(x - cx);
    if (dx > bw) return false;
    const f = dx / bw;
    const top = cy - ph - tilt * f;
    const bot = cy + ph - tilt * f * 0.6;
    return y >= top && y <= bot;
  };
  const inSpine = (x, y) => Math.abs(x - cx) < S * 0.008 && inBook(x, y);
  // red bookmark on the right page
  const inBookmark = (x, y) => {
    const bx = cx + bw * 0.55, bwid = S * 0.045;
    if (x < bx - bwid || x > bx + bwid) return false;
    const f = Math.abs(x - cx) / bw;
    const top = cy - ph - tilt * f;
    const len = S * 0.12 - Math.abs(x - bx) * 1.2; // pointed tip
    return y >= top && y <= top + len;
  };

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      if (!inRoundedRect(x, y)) continue; // transparent
      // warm gradient background
      const t = y / S;
      let r = 255, g = 158 + (122 - 158) * t, b = 66 + (89 - 66) * t;
      if (inBook(x, y)) { r = 255; g = 252; b = 245; }
      if (inSpine(x, y)) { r = 255; g = 160; b = 90; }
      if (inBookmark(x, y)) { r = 239; g = 68; b = 68; }
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
    }
  }

  // downsample SSxSS -> 1 pixel
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * S + (x * SS + sx)) * 4;
          r += px[i]; g += px[i + 1]; b += px[i + 2]; a += px[i + 3];
        }
      }
      const n = SS * SS, o = (y * size + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = a / n;
    }
  }
  return encodePNG(out, size, size);
}

mkdirSync("icons", { recursive: true });
for (const size of [180, 192, 512]) {
  writeFileSync(`icons/icon-${size}.png`, drawIcon(size));
  console.log(`icons/icon-${size}.png written`);
}
