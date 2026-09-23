/*
 * Ivory — track 4. A hand-coloured etching: a natural-history plate.
 *
 * A woman described entirely by what she is compared to — open ocean, blue
 * butterfly wings, flowers in her hair — so the plate is a naturalist's plate of
 * those things, figured and captioned, and she is never drawn. Etched line and
 * hatching in ink; one blue laid on by hand as a watercolour wash, soft at the
 * edges and pooling darker where it dried; and the album's red as a thread
 * pinned from specimen to specimen — the journey is the eye going from one
 * comparison to the next.
 *
 * This is a still, written as the seed of the film: `heroFrame({ now, uid })`
 * is pure, and the etching helpers below (hatch, waves, butterfly, sprig) are
 * what a film module would import.
 */
import { t, rng, r } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, INK, RED, SECOND_INK, SHEET } from '../../../shared/video/album.mjs'

export const BLUE = SECOND_INK.ivory
/** Plate tone: the film of ink an etcher leaves wiped across the plate. */
export const PLATE_TONE = '#e3d8c1'
const LINE = INK

/* ── Etching helpers ──────────────────────────────────────────────── */

/** Many fine strokes as one path: `lines` is [[x,y],…][]. */
export const strokes = (lines, o = {}) =>
  `<path d="${lines.map((pts) => 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')).join('')}" fill="none" stroke="${o.stroke ?? LINE}" stroke-width="${o.sw ?? 0.8}" stroke-linecap="round" stroke-linejoin="round"${o.opacity != null ? ` opacity="${o.opacity}"` : ''}${o.clip ? ` clip-path="${o.clip}"` : ''}/>`

/**
 * Parallel hatching across a box, bent by `bend(x, y)` so it follows a form.
 * Clip it to the shape it shades. `jitter` breaks the lines the way a needle
 * through a hard ground does — an etched line is never quite continuous.
 */
export function hatch({ x0, y0, x1, y1, angle = 0.4, spacing = 6, bend = () => 0, seed = 1, jitter = 0.5, step = 10 }) {
  const rand = rng(seed)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const reach = Math.hypot(x1 - x0, y1 - y0) / 2 + 10
  const lines = []
  for (let d = -reach; d <= reach; d += spacing) {
    let pts = []
    for (let s = -reach; s <= reach; s += step) {
      const x = cx + cos * s - sin * d
      const y = cy + sin * s + cos * d
      if (x < x0 - 20 || x > x1 + 20 || y < y0 - 20 || y > y1 + 20) { if (pts.length > 1) lines.push(pts); pts = []; continue }
      // Break the line now and then.
      if (rand() < 0.03 * jitter) { if (pts.length > 1) lines.push(pts); pts = []; continue }
      pts.push([x + (rand() - 0.5) * jitter, y + bend(x, y) + (rand() - 0.5) * jitter])
    }
    if (pts.length > 1) lines.push(pts)
  }
  return lines
}

/** A soft watercolour wash: a blurred blob with a darker dried edge. */
export function wash(uid, name, d, colour = BLUE, o = {}) {
  const id = `${uid}-wash-${name}`
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${o.blur ?? 7}"/></filter>
    <g style="mix-blend-mode:multiply">
      <path d="${d}" fill="${colour}" opacity="${o.opacity ?? 0.42}" filter="url(#${id})"/>
      <path d="${d}" fill="none" stroke="${colour}" stroke-width="${o.edge ?? 5}" opacity="${o.edgeOpacity ?? 0.3}" filter="url(#${id})"/>
    </g>`
}

/** A closed blob through `n` points round (cx, cy), quadratics through midpoints. */
export function blob(cx, cy, rx, ry, seed = 1, n = 11, wobble = 0.14) {
  const rand = rng(seed)
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 1 - wobble / 2 + rand() * wobble
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  })
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${r(mid(pts[n - 1], pts[0])[0])} ${r(mid(pts[n - 1], pts[0])[1])}`
  pts.forEach((p, i) => { const m = mid(p, pts[(i + 1) % n]); d += `Q${r(p[0])} ${r(p[1])} ${r(m[0])} ${r(m[1])}` })
  return d + 'Z'
}

/* ── The specimens ────────────────────────────────────────────────── */

/** fig. 1 — open ocean: a swell of etched wave lines, denser into the trough. */
function ocean(uid, box) {
  const { x0, y0, x1, y1 } = box
  const lines = []
  const rand = rng(41)
  const crest = (x, row) => y0 + 30 + row * 15 + Math.sin(x / 55 + row * 0.7) * (9 + row * 0.6) + Math.sin(x / 19 + row) * 2
  for (let row = 0; row < 22; row++) {
    const pts = []
    for (let x = x0; x <= x1; x += 8) pts.push([x, crest(x, row) + (rand() - 0.5) * 0.6])
    lines.push(pts)
  }
  // Shade under each crest: short hatch strokes that thicken towards the foot of the plate.
  const shade = []
  for (let row = 2; row < 22; row++) {
    for (let x = x0; x <= x1; x += 5 + (22 - row) * 0.35) {
      const y = crest(x, row)
      const slope = crest(x + 2, row) - crest(x - 2, row)
      if (slope < 0.2) continue
      shade.push([[x, y + 2], [x - 3, y + 7 + row * 0.2]])
    }
  }
  const clip = `${uid}-ocean`
  const shape = blob((x0 + x1) / 2, (y0 + y1) / 2 + 20, (x1 - x0) / 2, (y1 - y0) / 2, 17, 13, 0.22)
  // "Eyes that hit a sunrise like waves that hit a shore": a sun half up behind the swell.
  const sx = (x0 + x1) / 2 + 60
  const sy = y0 + 40
  const rays = Array.from({ length: 46 }, (_, i) => {
    const a = Math.PI + (i / 45) * Math.PI
    const r0 = 58
    const r1 = 58 + 60 + (i % 3) * 34
    return [[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]]
  })
  const sun = `M${sx - 52} ${sy} A52 52 0 0 1 ${sx + 52} ${sy}`
  return `<clipPath id="${clip}"><path d="${shape}"/></clipPath>
    ${strokes(rays, { sw: 0.8, opacity: 0.85 })}
    <path d="${sun}" fill="none" stroke="${LINE}" stroke-width="1.3"/>
    ${strokes(hatch({ x0: sx - 52, y0: sy - 52, x1: sx + 52, y1: sy, angle: 0, spacing: 5, seed: 23 }), { sw: 0.6, opacity: 0.55, clip: `url(#${clip}-sun)` })}
    <clipPath id="${clip}-sun"><path d="${sun}Z"/></clipPath>
    <g clip-path="url(#${clip})">
      ${wash(uid, 'ocean', blob((x0 + x1) / 2 + 20, (y0 + y1) / 2 + 60, (x1 - x0) * 0.5, (y1 - y0) * 0.4, 7, 11, 0.3), BLUE, { opacity: 0.55, blur: 10 })}
      ${wash(uid, 'ocean2', blob((x0 + x1) / 2 - 80, y1 - 60, (x1 - x0) * 0.3, (y1 - y0) * 0.16, 12, 9, 0.3), BLUE, { opacity: 0.4, blur: 8 })}
      ${strokes(lines, { sw: 0.9 })}
      ${strokes(shade, { sw: 0.7, opacity: 0.8 })}
    </g>`
}

/* One wing, drawn for the right side; the left is the mirror. */
const FOREWING = 'M0 0 C 40 -70 150 -150 250 -130 C 280 -120 262 -60 226 -24 C 180 12 90 22 0 10 Z'
const HINDWING = 'M0 12 C 70 22 170 40 184 110 C 190 160 130 190 90 170 C 40 146 12 80 0 30 Z'
const VEINS = [
  [[0, 2], [120, -80], [240, -126]], [[0, 4], [140, -54], [236, -70]], [[0, 6], [150, -22], [222, -26]],
  [[0, 14], [100, 50], [176, 106]], [[0, 18], [80, 90], [120, 170]], [[0, 22], [50, 100], [70, 150]],
]

/**
 * fig. 2 — blue butterfly wings. A Morpho-ish swallowtail: etched outline and
 * veins, hatching on the lower edge of each wing, blue laid on by hand.
 */
export function butterfly(uid, cx, cy, scale, seed = 3, name = 'fly') {
  const clip = `${uid}-${name}-wings`
  const side = (flip) => `transform="translate(${r(cx)} ${r(cy)}) scale(${r(flip * scale, 3)} ${r(scale, 3)})"`
  const veinPath = VEINS.map((pts) => 'M' + pts.map(([x, y]) => `${x} ${y}`).join('L')).join('')
  const wingShade = hatch({ x0: -10, y0: -150, x1: 260, y1: 200, angle: 1.05, spacing: 5.5 / scale * 1.3, seed, jitter: 0.6 })
  const shadePath = wingShade.map((pts) => 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')).join('')
  // The hatching lives only in the outer third of each wing, where it shades.
  const shadeClip = `${uid}-${name}-shade`
  const wingClip = `${uid}-${name}-wing`
  const wings = (flip) => `<g ${side(flip)}>
      <g style="mix-blend-mode:multiply" filter="url(#${uid}-${name}-soft)">
        <path d="${FOREWING}${HINDWING}" fill="${BLUE}" opacity="0.72" transform="translate(5 4) scale(0.97)"/>
        <path d="M150 -120 C 220 -140 270 -110 240 -50 C 220 -20 190 -20 170 -40 Z M150 110 C 180 110 190 150 150 170 C 120 176 100 150 120 130 Z" fill="${BLUE}" opacity="0.32"/>
      </g>
      <g clip-path="url(#${wingClip})"><path d="${shadePath}" fill="none" stroke="${LINE}" stroke-width="${r(0.75 / scale, 2)}" opacity="0.85" clip-path="url(#${shadeClip})"/></g>
      <path d="${veinPath}" fill="none" stroke="${LINE}" stroke-width="${r(1 / scale, 2)}"/>
      <path d="${FOREWING}${HINDWING}" fill="none" stroke="${LINE}" stroke-width="${r(1.5 / scale, 2)}" stroke-linejoin="round"/>
      <path d="M232 -118 C 250 -112 256 -90 244 -70 M176 120 C 180 150 160 172 120 172" fill="none" stroke="${LINE}" stroke-width="${r(4 / scale, 2)}" opacity="0.7"/>
    </g>`
  return `<filter id="${uid}-${name}-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${r(3.5 / scale, 2)}"/></filter>
    <clipPath id="${wingClip}"><path d="${FOREWING}${HINDWING}"/></clipPath>
    <clipPath id="${shadeClip}"><path d="M60 -130 C 160 -160 280 -140 250 -60 C 230 -20 160 0 120 0 C 200 60 200 160 120 176 C 90 180 60 150 70 120 C 120 120 150 60 140 20 C 160 -40 120 -100 60 -130 Z"/></clipPath>
    ${wings(1)}${wings(-1)}
    <g transform="translate(${r(cx)} ${r(cy)}) scale(${r(scale, 3)})">
      <ellipse cx="0" cy="18" rx="7" ry="60" fill="${LINE}"/>
      <circle cx="0" cy="-48" r="9" fill="${LINE}"/>
      <path d="M-3 -54 C -18 -100 -34 -120 -46 -126 M3 -54 C 18 -100 34 -120 46 -126" fill="none" stroke="${LINE}" stroke-width="${r(1.4 / scale, 2)}"/>
      <circle cx="-46" cy="-126" r="3.5" fill="${LINE}"/><circle cx="46" cy="-126" r="3.5" fill="${LINE}"/>
    </g>`
}

/** fig. 3 — flowers in her hair: a sprig of wild roses, petals hatched, leaves veined. */
export function sprig(uid, x, y, s, seed = 9) {
  const rand = rng(seed)
  const out = []
  const blooms = [[0, 0, 1], [-110, 70, 0.8], [90, 110, 0.72], [-20, 190, 0.6]]
  // Stems first, so blooms sit over them.
  const stems = [
    [[x - 30 * s, y + 360 * s], [x - 10 * s, y + 250 * s], [x, y]],
    [[x - 10 * s, y + 250 * s], [x - 80 * s, y + 150 * s], [x - 110 * s, y + 70 * s]],
    [[x - 20 * s, y + 290 * s], [x + 60 * s, y + 190 * s], [x + 90 * s, y + 110 * s]],
    [[x - 25 * s, y + 320 * s], [x - 30 * s, y + 250 * s], [x - 20 * s, y + 190 * s]],
  ]
  out.push(stems.map((pts) => `<path d="M${r(pts[0][0])} ${r(pts[0][1])} Q${r(pts[1][0])} ${r(pts[1][1])} ${r(pts[2][0])} ${r(pts[2][1])}" fill="none" stroke="${LINE}" stroke-width="1.6"/>`).join(''))
  // Leaves along the stems, each a lens with a midrib and hatching on one side.
  // Leaves sit on the stems: sampled along each stem's curve, alternating sides.
  const onStem = ([p0, p1, p2], u) => [
    (1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0],
    (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1],
  ]
  const leaves = []
  stems.forEach((stem, si) => [0.25, 0.5].forEach((u, li) => {
    const [px, py] = onStem(stem, u)
    const side = (si + li) % 2 ? 1 : -1
    leaves.push([px, py, side * (0.7 + 0.25 * li)])
  }))
  for (const [px, py, a] of leaves) {
    const L = 66 * s
    const ex = px + Math.sin(a) * L
    const ey = py - Math.cos(a) * L * 0.8
    const nx = Math.cos(a) * 16 * s
    const ny = Math.sin(a) * 16 * s
    const mx = (px + ex) / 2
    const my = (py + ey) / 2
    out.push(`<path d="M${r(px)} ${r(py)} Q${r(mx + nx)} ${r(my + ny)} ${r(ex)} ${r(ey)} Q${r(mx - nx)} ${r(my - ny)} ${r(px)} ${r(py)} Z" fill="${PLATE_TONE}" stroke="${LINE}" stroke-width="1.2"/>`)
    const ribs = []
    for (let k = 1; k < 8; k++) {
      const u = k / 8
      const bx = px + (ex - px) * u
      const by = py + (ey - py) * u
      const w = Math.sin(u * Math.PI) * 0.85
      ribs.push([[bx, by], [bx + nx * w, by + ny * w]])
    }
    out.push(strokes([[[px, py], [ex, ey]], ...ribs], { sw: 0.7 }))
  }
  // Blooms: five hatched petals round a stippled heart.
  blooms.forEach(([bx, by, k], bi) => {
    const cx = x + bx * s
    const cy = y + by * s
    const R = 48 * s * k
    const petals = []
    const hatchLines = []
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 + bi * 0.5
      const tipx = cx + Math.cos(a) * R
      const tipy = cy + Math.sin(a) * R
      const lx = cx + Math.cos(a - 0.62) * R * 0.92
      const ly = cy + Math.sin(a - 0.62) * R * 0.92
      const rx = cx + Math.cos(a + 0.62) * R * 0.92
      const ry = cy + Math.sin(a + 0.62) * R * 0.92
      petals.push(`M${r(cx)} ${r(cy)} Q${r(lx)} ${r(ly)} ${r(tipx)} ${r(tipy)} Q${r(rx)} ${r(ry)} ${r(cx)} ${r(cy)}`)
      for (let h = 0; h < 7; h++) {
        const u = 0.3 + h * 0.09
        hatchLines.push([[cx + Math.cos(a - 0.2) * R * u, cy + Math.sin(a - 0.2) * R * u], [cx + Math.cos(a + 0.25) * R * (u + 0.08), cy + Math.sin(a + 0.25) * R * (u + 0.08)]])
      }
    }
    out.push(`<path d="${petals.join('')}" fill="${PLATE_TONE}" stroke="${LINE}" stroke-width="1.2"/>`)
    out.push(strokes(hatchLines, { sw: 0.6, opacity: 0.8 }))
    const dots = Array.from({ length: 16 }, () => {
      const a = rand() * Math.PI * 2
      const d = rand() * R * 0.26
      return `M${r(cx + Math.cos(a) * d)} ${r(cy + Math.sin(a) * d)}h0.1`
    }).join('')
    out.push(`<path d="${dots}" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>`)
  })
  return out.join('')
}

/** A caption in the plate, the way an engraver letters a figure: small, lower case, italic-free. */
const caption = (x, y, text, anchor = 'middle') =>
  t({ x, y, size: 19, text, fill: LINE, anchor, weight: 400, upper: false, tracking: 0.6 })

/** The thread: red, pinned at each specimen, slack between. */
function thread(points) {
  let d = `M${r(points[0][0])} ${r(points[0][1])}`
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]
    const [bx, by] = points[i]
    d += ` Q${r((ax + bx) / 2)} ${r(Math.max(ay, by) + 70)} ${r(bx)} ${r(by)}`
  }
  const pins = points.map(([x, y]) => `<circle cx="${r(x)}" cy="${r(y)}" r="6" fill="${RED}"/><circle cx="${r(x - 1.5)}" cy="${r(y - 1.5)}" r="1.8" fill="#f4d9cf"/>`).join('')
  return `<path d="${d}" fill="none" stroke="${RED}" stroke-width="2.2" stroke-linecap="round"/>${pins}`
}

/* ── The frame ────────────────────────────────────────────────────── */

const HERO = {
  index: 2,
  text: 'Her eyes are open ocean and blue butterfly wings',
  words: ['Her', 'eyes', 'are', 'open', 'ocean', 'and', 'blue', 'butterfly', 'wings'].map((text, i) => ({ t: i * 0.3, text })),
}

/**
 * One frame of the plate. `now` is seconds into the synthetic line above;
 * 1.72 has the voice just past "and", so BLUE BUTTERFLY WINGS is still the
 * faint impression.
 */
export function heroFrame({ now = 1.72, uid = 'ivory' } = {}) {
  const plate = plateClip(uid)
  const { x, y, w, h } = SHEET.plate
  const rand = rng(5)
  // Plate tone, and the faint wiping marks an etcher leaves in it.
  const wipes = Array.from({ length: 26 }, () => {
    const yy = y + rand() * h
    return [[x, yy], [x + w, yy + (rand() - 0.5) * 40]]
  })
  const body = `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PLATE_TONE}"/>
    ${strokes(wipes, { sw: 14, stroke: '#d9cdb3', opacity: 0.25 })}
    ${ocean(uid, { x0: 90, y0: 240, x1: 620, y1: 620 })}
    ${butterfly(uid, 930, 330, 1.05, 3, 'big')}
    ${butterfly(uid, 1070, 128, 0.24, 8, 'small')}
    ${sprig(uid, 1360, 150, 1.22)}
    ${thread([[350, 212], [930, 272], [1070, 128], [1360, 150]])}
    ${caption(350, 650, 'fig. 1 — open ocean')}
    ${caption(930, 590, 'fig. 2 — blue butterfly wings')}
    ${caption(1350, 650, 'fig. 3 — flowers in her hair')}
    <rect x="${x + 22}" y="${y + 22}" width="${w - 44}" height="${h - 44}" fill="none" stroke="${LINE}" stroke-width="1.2"/>
    <rect x="${x + 28}" y="${y + 28}" width="${w - 56}" height="${h - 56}" fill="none" stroke="${LINE}" stroke-width="0.6"/>
    ${t({ x: 800, y: y + 62, size: 17, text: 'Plate IV', fill: LINE, anchor: 'middle', weight: 500, tracking: 8 })}`
  return `${paper()}${plate.def}<g clip-path="${plate.url}">${body}</g>
    ${lyricMargin({ now, line: HERO, uid })}`
}

export default {
  slug: 'ivory',
  hero: () => heroFrame({ uid: 'hero' }),
}
