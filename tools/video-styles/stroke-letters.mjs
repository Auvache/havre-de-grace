/*
 * Titles set in the wordmark's own letters: the monoline capitals of
 * HAVRE DE GRACE (public/logos/suite/a4-lockup-stacked.svg), 100 units tall,
 * drawn with a 13-unit butt-capped, mitred stroke.
 *
 * H A V R E D G C are the logo's paths, unchanged. The rest are drawn to match:
 * stems at 6.5 / 61.5 like the H, bowls as ellipse arcs like the D and C.
 * `w` is the glyph's box; the wordmark spaces boxes 26 units apart and a word
 * 82.5. A glyph marked `clip` mitres past the cap line or baseline (the N's
 * points) and is cut flat there.
 */
import { clamp01, easeInOut, r } from '../../shared/video/kit.mjs'

/* The S: two stacked bowls, the lower a little wider, ends cut like the C's. */
const S = (() => {
  const top = { cx: 32, cy: 28, rx: 25.5, ry: 21.5 }
  const bot = { cx: 32, cy: 71.5, rx: 26.5, ry: 22 }
  const at = (e, deg) => [e.cx + e.rx * Math.cos((deg * Math.PI) / 180), e.cy + e.ry * Math.sin((deg * Math.PI) / 180)]
  const [x0, y0] = at(top, -32)
  const [x1, y1] = at(bot, 148)
  return `M${r(x0, 3)} ${r(y0, 3)}A${top.rx} ${top.ry} 0 1 0 ${top.cx} ${top.cy + top.ry}A${bot.rx} ${bot.ry} 0 1 1 ${r(x1, 3)} ${r(y1, 3)}`
})()

export const GLYPHS = {
  A: { d: 'M2 100L32.5 4.5L39.5 4.5L70 100M9.665 76H62.335', w: 72 },
  B: { d: 'M6.5 0V100M6.5 6.5H35a21 21 0 0 1 0 42H6.5M6.5 48.5H38a22.5 22.5 0 0 1 0 45H6.5', w: 67 },
  C:{ d: 'M70.097 33.705A33 43.5 0 1 0 70.097 66.295', w: 75 },
  D: { d: 'M6.5 0V100M6.5 6.5H29.5A34 34 0 0 1 63.5 40.5V59.5A34 34 0 0 1 29.5 93.5H6.5', w: 70 },
  E: { d: 'M6.5 0V100M6.5 6.5H51.5M6.5 50H48M6.5 93.5H51.5', w: 51.5 },
  G: { d: 'M69.408 31.616A33 43.5 0 1 0 68.079 71.75V50H43.5', w: 75 },
  H: { d: 'M6.5 0V100M61.5 0V100M6.5 50H61.5', w: 68 },
  I: { d: 'M6.5 0V100', w: 13 },
  K: { d: 'M6.5 0V100M58 0L6.5 58M24 39L60 100', w: 62, clip: true },
  L: { d: 'M6.5 0V93.5H51.5', w: 51.5 },
  M: { d: 'M6.5 100V0L42 70L77.5 0V100', w: 84, clip: true },
  N: { d: 'M6.5 100V0L61.5 100V0', w: 68, clip: true },
  // The C's ellipse, closed.
  O: { d: 'M6.5 50A33 43.5 0 1 0 72.5 50A33 43.5 0 1 0 6.5 50Z', w: 79 },
  R: { d: 'M6.5 0V100M6.5 6.5H37.5a22 22 0 0 1 0 44H6.5M28 50.5L59.5 100', w: 66 },
  S: { d: S, w: 65 },
  T: { d: 'M0 6.5H62M31 0V100', w: 62 },
  U: { d: 'M6.5 0V60A27.5 33.5 0 0 0 61.5 60V0', w: 68 },
  V: { d: 'M2 0L32.5 96.5L39.5 96.5L70 0', w: 72 },
  // Two of the V, the middle apex flat like the A's.
  W: { d: 'M2 0L25.5 96.5L31.5 96.5L51 4.5L57 4.5L76.5 96.5L82.5 96.5L106 0', w: 108 },
  Y: { d: 'M2 0L31 50.5L60 0M31 50.5V100', w: 62 },
}
const GAP = 26
const SPACE = 82.5

/** The x of each letter and the line's whole width, in letter units. */
export function layout(text) {
  let x = 0
  const placed = []
  for (const ch of text.toUpperCase()) {
    if (ch === ' ') {
      x += SPACE - GAP
      continue
    }
    const g = GLYPHS[ch]
    if (!g) throw new Error(`no stroke letter for "${ch}" yet: draw it in tools/video-styles/stroke-letters.mjs`)
    placed.push({ ch, x, g })
    x += g.w + GAP
  }
  return { placed, width: x - GAP }
}

/**
 * `text` centred on (cx, cy) with cap height `cap`, each letter coming up in
 * turn, left to right, as the wordmark's do: `k` 0–1 is how far along. A
 * line wider than `maxWidth` is set smaller to fit. The
 * letters are SVG paths, so no font is involved.
 */
export function strokeTitle({ text, cx, cy, cap, maxWidth = Infinity, colour = '#f4f6f7', k = 1, opacity = 1, uid = 'title' }) {
  if (opacity <= 0.001) return ''
  const { placed, width } = layout(text)
  // A long title comes down in size rather than running off the frame.
  cap = Math.min(cap, (maxWidth * 100) / width)
  const s = cap / 100
  const n = placed.length
  const stagger = 0.55 / Math.max(1, n - 1)
  const letters = placed.map(({ x, g }, i) => {
    const a = k >= 0.999 ? 1 : easeInOut(clamp01((k - i * stagger) / 0.45))
    if (a <= 0.001) return ''
    const clip = g.clip ? ` clip-path="url(#${uid}-cap)"` : ''
    return `<path d="${g.d}" transform="translate(${r(x, 3)} 0)"${clip}${a < 0.999 ? ` opacity="${r(a, 3)}"` : ''}/>`
  }).join('')
  return `<g transform="translate(${r(cx - (width * s) / 2, 2)} ${r(cy - cap / 2, 2)}) scale(${r(s, 4)})"${opacity < 0.999 ? ` opacity="${r(opacity, 3)}"` : ''}>` +
    `<clipPath id="${uid}-cap" clipPathUnits="userSpaceOnUse"><rect x="-40" y="0" width="200" height="100"/></clipPath>` +
    `<g fill="none" stroke="${colour}" stroke-width="13" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="6">${letters}</g></g>`
}
