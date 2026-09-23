/*
 * Rocks in the Sea — track 8, cyanotype. The album still, and the seed of the
 * film.
 *
 * A sun print. Paper is brushed with iron salts, things are laid on it, and it
 * is left in the sun: where something lay, the paper stays white; where the
 * light got in, it goes Prussian blue. So the whole picture is made of objects —
 * rocks, sand, sea grass, fern fronds standing in for trees, paper houses for a
 * hometown's roofline — and every edge is as sharp as the thing was flat. A
 * stone that lifted off the paper prints soft; a leaf pressed flat prints crisp.
 *
 * The blue is this song's second ink, and here it is the ground, not a mark —
 * the one film on the album where it is. The coating stops short of the plate
 * mark the way a brushed sensitiser does, so the album paper still shows round
 * it and the sheet is still the album's sheet.
 *
 * The one red thing is the journey: the road home as it slims down into the
 * trees — drawn on afterwards, the only line on the print the sun did not make.
 */
import { path, rng, r } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, SHEET, PAPER, RED, SECOND_INK } from '../../../shared/video/album.mjs'

export const BLUE = SECOND_INK['rocks-in-the-sea']
/** The print's whites: the album paper, very slightly cooled by the wash. */
export const WHITE = '#eef0ea'
export const PALE = '#9fbad3'

const P = SHEET.plate
const HORIZON = 330

/** Join points into a smooth closed outline — quadratics through the midpoints, never straight joins. */
export function blob(points) {
  const n = points.length
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${r(mid(points[n - 1], points[0])[0])} ${r(mid(points[n - 1], points[0])[1])}`
  for (let i = 0; i < n; i++) {
    const p = points[i]
    const m = mid(p, points[(i + 1) % n])
    d += ` Q${r(p[0])} ${r(p[1])} ${r(m[0])} ${r(m[1])}`
  }
  return d + 'Z'
}

/** A stone: a rounded irregular outline. */
export function stone(cx, cy, rx, ry, seed) {
  const rand = rng(seed)
  const pts = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2
    const k = 0.84 + rand() * 0.3
    // Flatter underneath: a stone rests on its broad side.
    const sy = Math.sin(a) > 0 ? 0.72 : 1
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k * sy]
  })
  return blob(pts)
}

/* ── Defs: the brushed coating, its mottle, the soft penumbra of lifted things ── */

export function defs(uid) {
  return `
    <filter id="${uid}-brush" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="3" seed="11" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="${uid}-mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="3" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.73  0 0 0 0 0.84  0 0 0 1.6 -0.62"/>
    </filter>
    <filter id="${uid}-lift" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="${uid}-edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <clipPath id="${uid}-coat"><rect x="${P.x + 18}" y="${P.y + 14}" width="${P.w - 36}" height="${P.h - 28}"/></clipPath>`
}

/** The sensitiser, brushed on: a blue field whose edges are the brush's, not a ruler's. */
export const coating = (uid) => `
  <g filter="url(#${uid}-brush)">
    <rect x="${P.x + 20}" y="${P.y + 16}" width="${P.w - 40}" height="${P.h - 32}" fill="${BLUE}"/>
  </g>`

/** The uneven exposure: paler where the coat was thin. Drawn over the blue, under the objects. */
export const mottle = (uid) => `
  <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="#000" filter="url(#${uid}-mottle)" opacity="0.42"/>`

/*
 * The headland. In a photogram land is not an object — it is simply blue with no
 * threads on it — so it is drawn as blue over the sea, and its coast is one
 * more thread laid down along the edge.
 */
const COAST = [[860, 700], [900, 600], [960, 520], [1010, 440], [1090, 392], [1250, 372], [1420, 360], [1566, 352]]
export function headland() {
  const pts = spline(COAST, 8)
  const d = 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join(' L')
  return path(`${d} L1566 700 Z`, { fill: BLUE }) + path(d, { stroke: WHITE, sw: 2.4, opacity: 0.9 })
}

/** The sea: threads of cotton laid across the paper, one wave each, lifted here and there. */
export function sea(uid, seed = 21) {
  const rand = rng(seed)
  return Array.from({ length: 14 }, (_, i) => {
    const y = HORIZON + 8 + i * i * 0.9 + i * 5
    let d = `M${P.x + 20} ${r(y)}`
    for (let x = P.x + 20; x < P.x + P.w; x += 60) {
      d += ` q30 ${r(-4 - rand() * 5 + i * 0.2)} 60 0`
    }
    const soft = rand() < 0.35
    return path(d, { stroke: WHITE, sw: 1.2 + i * 0.22, opacity: r(0.5 + rand() * 0.4, 3), filter: soft ? `${uid}-edge` : null })
  }).join('')
}

/** The hometown on the far shore: paper houses and a steeple, cut flat, printed crisp. */
export function town(x0, y) {
  const houses = [[0, 34, 26], [30, 30, 34], [66, 42, 22], [96, 26, 30], [128, 36, 26], [168, 28, 38], [204, 46, 20]]
  const d = houses.map(([dx, w, h]) => {
    const x = x0 + dx
    return `M${x} ${y} V${y - h} L${x + w / 2} ${y - h - w * 0.45} L${x + w} ${y - h} V${y} Z`
  }).join(' ')
  const steeple = `M${x0 + 150} ${y} V${y - 50} L${x0 + 158} ${y - 94} L${x0 + 166} ${y - 50} V${y} Z`
  return path(`${d} ${steeple}`, { fill: WHITE }) + path(`M${x0 - 20} ${y} H${x0 + 250}`, { stroke: WHITE, sw: 3 })
}

/** A fern frond standing upright as a tree: a rachis and paired pinnae, pressed flat so it prints sharp. */
export function fern(x, base, h, lean = 0, seed = 1) {
  const rand = rng(seed)
  const top = [x + lean, base - h]
  let d = `M${x} ${base} Q${r(x + lean * 0.2)} ${r(base - h * 0.5)} ${r(top[0])} ${r(top[1])}`
  const n = 13
  for (let i = 1; i < n; i++) {
    const u = i / n
    const px = x + lean * u * u
    const py = base - h * u
    const len = h * 0.3 * Math.sin(Math.PI * (0.15 + u * 0.85)) * (0.85 + rand() * 0.2)
    const up = h * 0.06
    d += ` M${r(px)} ${r(py)} q${r(-len * 0.5)} ${r(-up * 0.3)} ${r(-len)} ${r(-up)} q${r(len * 0.55)} ${r(up * 0.6)} ${r(len)} ${r(up)}`
    d += ` M${r(px)} ${r(py)} q${r(len * 0.5)} ${r(-up * 0.3)} ${r(len)} ${r(-up)} q${r(-len * 0.55)} ${r(up * 0.6)} ${r(-len)} ${r(up)}`
  }
  return path(d, { stroke: WHITE, sw: 2.6, fill: WHITE, join: 'round' })
}

/** Sea grass: long tapering blades, the tips lifted off the paper so they print soft. */
export function grass(uid, x0, base, seed = 9) {
  const rand = rng(seed)
  return Array.from({ length: 9 }, (_, i) => {
    const x = x0 + i * 16 + rand() * 12
    const h = 150 + rand() * 170
    const bend = (rand() - 0.2) * 160
    const w = 4 + rand() * 4
    const d = `M${r(x - w)} ${base} Q${r(x + bend * 0.3)} ${r(base - h * 0.55)} ${r(x + bend)} ${r(base - h)} Q${r(x + bend * 0.3 + w)} ${r(base - h * 0.55)} ${r(x + w)} ${base} Z`
    return path(d, { fill: WHITE, opacity: r(0.6 + rand() * 0.35, 3) })
  }).join('')
}

/** Rocks along the tideline: each a white stone with the soft penumbra of the gap under it. */
export function rocks(uid, list) {
  return list.map(([cx, cy, rx, ry, seed]) => {
    const d = stone(cx, cy, rx, ry, seed)
    const halo = stone(cx, cy + 4, rx * 1.12, ry * 1.12, seed)
    // Where the stone curves up off the paper, a little light got under it:
    // the underside prints pale blue, not white.
    const under = `<ellipse cx="${r(cx)}" cy="${r(cy + ry * 0.42)}" rx="${r(rx * 0.8)}" ry="${r(ry * 0.34)}" fill="${PALE}" opacity="0.55" filter="url(#${uid}-lift)"/>`
    return path(halo, { fill: PALE, opacity: 0.55, filter: `${uid}-lift` }) + path(d, { fill: WHITE }) + under
  }).join('')
}

/** Sand: grains scattered by hand, thicker towards the foot of the print. One path, tiny squares. */
export function sand(y0, y1, count = 900, seed = 5) {
  const rand = rng(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const v = rand()
    const y = y0 + (y1 - y0) * Math.sqrt(v)
    const x = P.x + 26 + rand() * (P.w - 52)
    const s = 1.2 + rand() * 2.4
    d += `M${r(x)} ${r(y)}h${r(s)}v${r(s)}h${r(-s)}z`
  }
  return path(d, { fill: WHITE, opacity: 0.85 })
}

/** The road home, in red: a line that slims as it goes, from the foot of the print into the trees. */
export function road(points, w0 = 22, w1 = 2) {
  // Offset a centreline either side by a tapering half-width, then close it.
  const n = points.length
  const left = []
  const right = []
  for (let i = 0; i < n; i++) {
    const a = points[Math.max(0, i - 1)]
    const b = points[Math.min(n - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2
    left.push([points[i][0] - (dy / len) * w, points[i][1] + (dx / len) * w])
    right.push([points[i][0] + (dy / len) * w, points[i][1] - (dx / len) * w])
  }
  const all = [...left, ...right.reverse()]
  return path('M' + all.map(([x, y]) => `${r(x)} ${r(y)}`).join(' L') + 'Z', { fill: RED })
}

/** A smooth centreline through control points (Catmull-Rom sampled), for the road. */
export function spline(ctrl, steps = 10) {
  const out = []
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)]
    const p1 = ctrl[i]
    const p2 = ctrl[i + 1]
    const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)]
    for (let s = 0; s < steps; s++) {
      const u = s / steps
      const u2 = u * u
      const u3 = u2 * u
      out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)))
    }
  }
  out.push(ctrl[ctrl.length - 1])
  return out
}

/* ── The frame ────────────────────────────────────────────────────── */

const HERO_LINE = 'Is the sand by the rocks in the sea'
const heroWords = HERO_LINE.split(' ').map((text, i) => ({ t: 20 + i * 0.3, text }))

export function heroFrame({ now = 20 + 4 * 0.3 + 0.25, uid = 'rocks' } = {}) {
  const clip = plateClip(uid)
  const line = { index: 0, text: HERO_LINE, words: heroWords }
  const roadLine = spline([[1210, 704], [1180, 640], [1250, 580], [1190, 520], [1260, 460], [1236, 410], [1282, 372]], 12)
  return `<defs>${defs(uid)}${clip.def}</defs>
    ${paper()}
    <g clip-path="${clip.url}">
      <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="${PAPER}"/>
      ${coating(uid)}
      <g clip-path="url(#${uid}-coat)">
        ${sea(uid)}
        ${path(`M${P.x} ${HORIZON + 4} H${P.x + P.w}`, { stroke: WHITE, sw: 2, opacity: 0.8 })}
        ${headland()}
        ${mottle(uid)}
        <circle cx="560" cy="150" r="64" fill="${PALE}" opacity="0.6" filter="url(#${uid}-lift)"/>
        <circle cx="560" cy="150" r="52" fill="${WHITE}"/>
        ${town(130, HORIZON)}
        ${fern(1150, 382, 170, -10, 3)}
        ${fern(1215, 376, 230, 6, 4)}
        ${fern(1290, 372, 200, 14, 5)}
        ${fern(1360, 366, 150, 4, 6)}
        ${fern(1440, 362, 190, -6, 7)}
        ${rocks(uid, [[330, 520, 120, 62, 1], [520, 550, 70, 40, 2], [760, 505, 96, 52, 3], [640, 600, 46, 26, 5], [150, 600, 60, 30, 6]])}
        ${sand(560, 700)}
        ${grass(uid, 40, 700)}
        ${road(roadLine)}
      </g>
    </g>
    ${lyricMargin({ now, line, uid })}`
}

export default {
  slug: 'rocks-in-the-sea',
  hero: () => heroFrame({ uid: 'hero' }),
}
