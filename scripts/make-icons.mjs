// Zero-dependency PWA icon generator. Draws the NUTRI bowl mark (same
// geometry as public/favicon.svg) onto RGBA buffers and hand-encodes PNGs
// (node:zlib for IDAT). Run: npm run icons — outputs are committed in public/.

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// ---- palette (matches styles.css tokens) ----------------------------------
const BG = [0x0e, 0x11, 0x16, 255]
const BOWL = [0x53, 0xc4, 0x8f, 255]
const RIM = [0x7f, 0xd8, 0xab, 255]
const STEAM = [0x5c, 0x66, 0x75, 255]
const CLEAR = [0, 0, 0, 0]

// ---- tiny PNG encoder ------------------------------------------------------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function be32(n) {
  return Buffer.from([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff])
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  return Buffer.concat([be32(data.length), body, be32(crc32(body))])
}

function encodePNG(size, rgba) {
  const ihdr = Buffer.concat([be32(size), be32(size), Buffer.from([8, 6, 0, 0, 0])])
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---- drawing (2× supersampled for smooth edges) ----------------------------
/**
 * @param {number} size    output pixel size
 * @param {object} opts    fullBleed: square bg (maskable/apple); scale: content scale
 */
function drawIcon(size, { fullBleed = false, scale = 1 } = {}) {
  const SS = 2
  const s = size * SS
  const px = (u) => u * s
  const cornerR = px(0.22)

  // content geometry (favicon.svg proportions), scaled around the centre
  const cx = px(0.5)
  const t = (u, centre) => centre + (px(u) - centre) * scale
  const bowlCY = t(0.47, px(0.5))
  const bowlR = px(0.285) * scale
  const rimY0 = t(0.42, px(0.5))
  const rimY1 = t(0.5, px(0.5))
  const rimX0 = t(0.16, cx)
  const rimX1 = t(0.84, cx)
  const rimR = (rimY1 - rimY0) / 2
  const dots = [
    { x: t(0.41, cx), y: t(0.26, px(0.5)), r: px(0.042) * scale },
    { x: t(0.59, cx), y: t(0.2, px(0.5)), r: px(0.042) * scale },
  ]

  const inRoundedSquare = (x, y) => {
    if (fullBleed) return true
    const dx = Math.max(cornerR - x, x - (s - cornerR), 0)
    const dy = Math.max(cornerR - y, y - (s - cornerR), 0)
    return dx * dx + dy * dy <= cornerR * cornerR
  }

  const colorAt = (x, y) => {
    if (!inRoundedSquare(x, y)) return CLEAR
    for (const d of dots) {
      if ((x - d.x) ** 2 + (y - d.y) ** 2 <= d.r * d.r) return STEAM
    }
    // rim: horizontal capsule
    const ry = (rimY0 + rimY1) / 2
    const rx = Math.min(Math.max(x, rimX0 + rimR), rimX1 - rimR)
    if ((x - rx) ** 2 + (y - ry) ** 2 <= rimR * rimR || (x >= rimX0 + rimR && x <= rimX1 - rimR && y >= rimY0 && y <= rimY1))
      return RIM
    // bowl: lower half-disc
    if (y >= bowlCY && (x - cx) ** 2 + (y - bowlCY) ** 2 <= bowlR * bowlR) return BOWL
    return BG
  }

  const out = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [cr, cg, cb, ca] = colorAt(x * SS + sx + 0.5, y * SS + sy + 0.5)
          r += cr
          g += cg
          b += cb
          a += ca
        }
      }
      const n = SS * SS
      const i = (y * size + x) * 4
      out[i] = Math.round(r / n)
      out[i + 1] = Math.round(g / n)
      out[i + 2] = Math.round(b / n)
      out[i + 3] = Math.round(a / n)
    }
  }
  return out
}

mkdirSync(OUT, { recursive: true })
const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { fullBleed: true, scale: 0.72 }],
  ['apple-touch-icon.png', 180, { fullBleed: true, scale: 0.86 }],
]
for (const [name, size, opts] of targets) {
  writeFileSync(join(OUT, name), encodePNG(size, drawIcon(size, opts)))
  console.log(`wrote public/${name}`)
}
