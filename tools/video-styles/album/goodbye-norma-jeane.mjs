/*
 * Goodbye, Norma Jeane — track 3, screenprint. The album still, and the seed of
 * the film.
 *
 * Silkscreen, the way a studio sold its stars: flat pulls of ink through a
 * screen, halftone dots where a photograph would be, and the screens never
 * quite in register with each other. No likeness of anybody — the song is
 * about what was put around a person, so the film draws only that: a marquee,
 * a diamond, a film reel, a telephone, pills, a lipstick.
 *
 * Three screens are pulled, in this order, and each is a function below:
 *   1. pink  — the second ink, flat, shifted off the key (`OFF`)
 *   2. ink   — the key: outlines, halftone, the marquee
 *   3. red   — one lipstick line, the only thing printed in register. It is the
 *              journey (albumStyle.ts): in a film it would draw on, word by word,
 *              from the lipstick across the frame.
 *
 * Pure and deterministic, all ids prefixed with `uid`, so a film can call
 * `heroFrame({ now, uid, off })` at sixty frames a second.
 */
import { rect, circle, path, t, rng, r } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, INK, RED, PAPER, SECOND_INK, SHEET } from '../../../shared/video/album.mjs'

export const PINK = SECOND_INK['goodbye-norma-jeane']

/** How far the pink screen sits off the key. A film eases this in and out of register with the song. */
export const OFF = { x: 14, y: -9 }

/* ── Halftone ─────────────────────────────────────────────────────────
 *
 * Real halftone varies the dot, not its opacity, so a tonal ramp is drawn dot
 * by dot on a 45° grid. `tone(x, y)` returns 0–1 coverage; the dot radius is
 * the square root of that times half the pitch, so the area — which is what
 * the eye reads as tone — goes linearly with it.
 */
export function halftone({ x0, y0, x1, y1, pitch = 18, tone, fill = INK, clip = null }) {
  const out = []
  const c = Math.SQRT1_2
  // Walk a rotated grid wide enough to cover the box at 45°.
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const reach = Math.hypot(x1 - x0, y1 - y0) / 2 + pitch
  for (let u = -reach; u <= reach; u += pitch) {
    for (let v = -reach; v <= reach; v += pitch) {
      const x = cx + (u - v) * c
      const y = cy + (u + v) * c
      if (x < x0 - pitch || x > x1 + pitch || y < y0 - pitch || y > y1 + pitch) continue
      const k = tone(x, y)
      if (k <= 0.02) continue
      const rad = Math.sqrt(Math.min(k, 1)) * pitch * 0.62
      out.push(`M${r(x - rad)} ${r(y)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0`)
    }
  }
  return `<path d="${out.join('')}" fill="${fill}"${clip ? ` clip-path="${clip}"` : ''}/>`
}

/* ── The props, as outlines for the key and shapes for the pink ────── */

const DIAMOND = { cx: 800, cy: 395, w: 430, h: 400 }

function diamondPoints({ cx, cy, w, h }) {
  const top = cy - h * 0.42
  const girdle = cy - h * 0.14
  const tip = cy + h * 0.58
  return { top, girdle, tip, l: cx - w / 2, r: cx + w / 2, tl: cx - w * 0.28, tr: cx + w * 0.28 }
}

export function diamondShape(o = DIAMOND) {
  const p = diamondPoints(o)
  return `M${p.l} ${p.girdle} L${p.tl} ${p.top} L${p.tr} ${p.top} L${p.r} ${p.girdle} L${o.cx} ${p.tip} Z`
}

export function diamondFacets(o = DIAMOND) {
  const p = diamondPoints(o)
  const { cx } = o
  const q = o.w * 0.1
  return [
    `M${p.l} ${p.girdle} H${p.r}`,
    `M${p.tl} ${p.top} L${cx - q * 1.4} ${p.girdle} L${cx} ${p.top} L${cx + q * 1.4} ${p.girdle} L${p.tr} ${p.top}`,
    `M${p.l} ${p.girdle} L${p.tl + q} ${p.top + (p.girdle - p.top) * 0.02}`,
    `M${cx - q * 1.4} ${p.girdle} L${cx} ${p.tip} L${cx + q * 1.4} ${p.girdle}`,
    `M${p.l + o.w * 0.14} ${p.girdle} L${cx} ${p.tip} L${p.r - o.w * 0.14} ${p.girdle}`,
  ].join(' ')
}

/** A film reel: rim, hub, six windows. */
export function reel(cx, cy, rad) {
  const holes = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.3
    const hx = cx + Math.cos(a) * rad * 0.55
    const hy = cy + Math.sin(a) * rad * 0.55
    const hr = rad * 0.2
    return `M${r(hx - hr)} ${r(hy)}a${r(hr)} ${r(hr)} 0 1 0 ${r(hr * 2)} 0a${r(hr)} ${r(hr)} 0 1 0 ${r(-hr * 2)} 0`
  }).join('')
  const hub = rad * 0.12
  return `M${r(cx - rad)} ${r(cy)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0${holes}M${r(cx - hub)} ${r(cy)}a${r(hub)} ${r(hub)} 0 1 0 ${r(hub * 2)} 0a${r(hub)} ${r(hub)} 0 1 0 ${r(-hub * 2)} 0`
}

/** A rotary telephone, side-on: body, handset, dial. */
export function telephone(cx, cy, s) {
  return {
    body: `M${r(cx - s * 0.9)} ${r(cy + s * 0.55)} L${r(cx - s * 0.62)} ${r(cy - s * 0.2)} Q${r(cx)} ${r(cy - s * 0.36)} ${r(cx + s * 0.62)} ${r(cy - s * 0.2)} L${r(cx + s * 0.9)} ${r(cy + s * 0.55)} Z`,
    cradle: `M${r(cx - s * 0.5)} ${r(cy - s * 0.24)} V${r(cy - s * 0.44)} M${r(cx + s * 0.5)} ${r(cy - s * 0.24)} V${r(cy - s * 0.44)}`,
    handset: `M${r(cx - s * 1.0)} ${r(cy - s * 0.58)} Q${r(cx)} ${r(cy - s * 0.92)} ${r(cx + s * 1.0)} ${r(cy - s * 0.58)} L${r(cx + s * 1.0)} ${r(cy - s * 0.38)} L${r(cx + s * 0.62)} ${r(cy - s * 0.4)} Q${r(cx)} ${r(cy - s * 0.62)} ${r(cx - s * 0.62)} ${r(cy - s * 0.4)} L${r(cx - s * 1.0)} ${r(cy - s * 0.38)} Z`,
    dial: [cx, cy + s * 0.12, s * 0.34],
  }
}

/** A capsule, rotated: one half paper, one half ink, an ink rim. */
export function pill(cx, cy, len, wid, deg) {
  const h = len / 2 - wid / 2
  const w = wid / 2
  const whole = `M${r(cx - h)} ${r(cy - w)} H${r(cx + h)} a${r(w)} ${r(w)} 0 0 1 0 ${r(wid)} H${r(cx - h)} a${r(w)} ${r(w)} 0 0 1 0 ${r(-wid)} Z`
  const half = `M${r(cx)} ${r(cy - w)} H${r(cx + h)} a${r(w)} ${r(w)} 0 0 1 0 ${r(wid)} H${r(cx)} Z`
  return `<g transform="rotate(${r(deg)} ${r(cx)} ${r(cy)})"><path d="${whole}" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><path d="${half}" fill="${INK}"/></g>`
}

/** A lipstick, standing, uncapped: the bullet is the only red in the frame. */
export function lipstick(x, base, s) {
  return {
    tube: `M${r(x - s * 0.36)} ${r(base)} V${r(base - s * 1.1)} H${r(x + s * 0.36)} V${r(base)} Z`,
    sleeve: `M${r(x - s * 0.26)} ${r(base - s * 1.1)} V${r(base - s * 1.5)} H${r(x + s * 0.26)} V${r(base - s * 1.1)} Z`,
    bullet: `M${r(x - s * 0.19)} ${r(base - s * 1.5)} V${r(base - s * 1.9)} L${r(x + s * 0.19)} ${r(base - s * 2.25)} V${r(base - s * 1.5)} Z`,
  }
}

/**
 * A tapering ribbon along points: `w0` wide at the start, `w1` at the end,
 * joined with quadratics through the midpoints so it reads as one gesture.
 */
export function ribbon(pts, w0, w1) {
  const n = pts.length
  const side = (sign) => pts.map(([x, y], i) => {
    const [ax, ay] = pts[Math.max(i - 1, 0)]
    const [bx, by] = pts[Math.min(i + 1, n - 1)]
    const len = Math.hypot(bx - ax, by - ay) || 1
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2
    return [x + (-(by - ay) / len) * w * sign, y + ((bx - ax) / len) * w * sign]
  })
  const smooth = (p) => {
    let d = `L${r(p[0][0])} ${r(p[0][1])}`
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2
      const my = (p[i][1] + p[i + 1][1]) / 2
      d += ` Q${r(p[i][0])} ${r(p[i][1])} ${r(mx)} ${r(my)}`
    }
    return d + ` L${r(p[p.length - 1][0])} ${r(p[p.length - 1][1])}`
  }
  const a = side(1)
  const b = side(-1).reverse()
  return `M${r(a[0][0])} ${r(a[0][1])}` + smooth(a).slice(1).replace(/^[^LQ]*/, ' ') + smooth(b) + ' Z'
}

/* ── The marquee ───────────────────────────────────────────────────── */

export function marquee({ uid, x, y, w, h, words, lit = 1 }) {
  const bulbs = []
  const pitch = 34
  const n = Math.floor(w / pitch)
  for (let i = 0; i <= n; i++) {
    const bx = x + (i * w) / n
    bulbs.push(circle(bx, y + 16, 7, { fill: PAPER }), circle(bx, y + h - 16, 7, { fill: PAPER }))
  }
  const size = 78
  return `
    ${rect(x, y, w, h, INK)}
    ${bulbs.join('')}
    ${t({ x: x + w / 2, y: y + h / 2 + size * 0.36, size, text: words, fill: PAPER, anchor: 'middle', weight: 700, tracking: 18, opacity: lit })}`
}

/* ── The frame ─────────────────────────────────────────────────────── */

export function heroFrame({ now = 2.6, uid = "nj", off = OFF } = {}) {
  const clip = plateClip(uid)
  const { x: px, y: py, w: pw, h: ph } = SHEET.plate
  const rand = rng(33)

  const phone = telephone(1330, 500, 140)
  const lip = lipstick(1110, 680, 80)

  // The pink screen: flat shapes, cut a little generously and pulled off the key.
  const pink = `<g transform="translate(${off.x} ${off.y})" fill="${PINK}">
    ${rect(px, py + 190, pw, ph - 190, PINK)}
    <path d="${diamondShape()}" fill="${PAPER}"/>
    <path d="${reel(330, 470, 158)}" fill-rule="evenodd"/>
    <path d="${phone.body}"/><path d="${phone.handset}"/>
  </g>`

  // The key: the spotlight halftone, marquee, outlines, the diamond's dots.
  const spot = halftone({
    x0: px, y0: py + 170, x1: px + pw, y1: py + ph, pitch: 22, clip: null,
    tone: (x, y) => {
      // A spotlight: open in a widening cone under the marquee, the dots
      // growing towards the edges of the frame and the floor.
      const cone = Math.abs(x - 800) / (260 + (y - 200) * 1.1)
      const edge = Math.max(cone - 0.8, 0) * 1.1
      const floor = Math.max((y - 560) / 160, 0) * 0.5
      return Math.min(0.85, edge + floor)
    },
  })
  const diamondDots = halftone({
    x0: DIAMOND.cx - DIAMOND.w / 2, y0: DIAMOND.cy - DIAMOND.h * 0.14, x1: DIAMOND.cx + DIAMOND.w / 2, y1: DIAMOND.cy + DIAMOND.h * 0.58,
    pitch: 13, clip: `url(#${uid}-dia)`,
    tone: (x, y) => 0.08 + ((y - (DIAMOND.cy - DIAMOND.h * 0.14)) / (DIAMOND.h * 0.72)) * 0.55 + (x > DIAMOND.cx ? 0.12 : 0),
  })
  const pills = [[520, 628, 30], [590, 660, -40], [668, 622, 75], [455, 668, -10], [1000, 650, 20], [1068, 618, -65]]
    .map(([cx, cy, deg]) => pill(cx, cy, 64, 26, deg)).join('')

  const key = `<g fill="none" stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">
    <path d="${diamondShape()}" stroke-width="7"/>
    <path d="${diamondFacets()}" stroke-width="4"/>
    <path d="${reel(330, 470, 158)}" fill="${INK}" fill-rule="evenodd" stroke="none"/>
    <path d="M${330 - 158} ${470 + 158 * 0.2} q-60 90 -40 190" stroke-width="10"/>
    <path d="${phone.body}" stroke-width="7"/>
    <path d="${phone.cradle}" stroke-width="12"/>
    <path d="${phone.handset}" fill="${INK}" stroke="none"/>
    ${circle(phone.dial[0], phone.dial[1], phone.dial[2], { fill: PAPER, stroke: INK, sw: 6 })}
    ${Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 1.6 + 1.1
      return circle(phone.dial[0] + Math.cos(a) * phone.dial[2] * 0.66, phone.dial[1] + Math.sin(a) * phone.dial[2] * 0.66, 6, { fill: INK })
    }).join('')}
    <path d="M${1330 - 140} ${500 + 140 * 0.55} q-40 60 -110 70" stroke-width="6"/>
    ${pills}
    <path d="${lip.tube}" fill="${INK}" stroke="none"/>
    <path d="${lip.sleeve}" fill="${PAPER}" stroke-width="5"/>
  </g>`

  // Sparkle on the diamond: four-point stars, in paper, pulled with the key.
  const star = (x, y, s) => `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${PAPER}"/>`

  // The red screen, in register: the bullet, and one lipstick line from it
  // across the frame and round under the diamond — the journey.
  // A lipstick swash, drawn with the bullet: thick where it was pressed,
  // thinning to a tail. A filled ribbon rather than a stroke, so it tapers.
  const swash = ribbon([[1102, 510], [1010, 590], [860, 640], [690, 636], [560, 606], [470, 560]], 20, 3)
  const red = `<path d="${lip.bullet}" fill="${RED}"/>
    <path d="${swash}" fill="${RED}"/>`

  const line = {
    index: 0,
    text: 'Diamonds are your only friend',
    words: ['Diamonds', 'are', 'your', 'only', 'friend'].map((text, i) => ({ t: 1 + i * 0.6, text })),
  }

  return `${paper()}
    <defs>${clip.def}<clipPath id="${uid}-dia"><path d="${diamondShape()}"/></clipPath></defs>
    <g clip-path="${clip.url}">
      ${rect(px, py, pw, ph, PAPER)}
      ${pink}
      ${spot}
      ${marquee({ uid, x: px, y: py, w: pw, h: 170, words: 'Silver Screen' })}
      ${diamondDots}
      ${key}
      ${star(730, 262, 34)}${star(905, 300, 22)}${star(640, 330, 16)}
      ${red}
    </g>
    ${lyricMargin({ now, line, uid })}`
}

export default {
  slug: 'goodbye-norma-jeane',
  hero: () => heroFrame({ uid: 'hero' }),
}
