/*
 * Ship to Stockholm — track 9. End-grain wood engraving: white line on black.
 *
 * Finer and colder than Into the Wild's woodcut, which cuts shapes away; an
 * engraver on end grain cuts lines, and tone is nothing but how wide and how
 * close they are. So everything here is made of white strokes on the black
 * block: a night sky of horizontal lines that swell towards the moon, a sea of
 * short flicks that crowd into the foreground, and across it a sheet of razor
 * thin ice in the song's second ink. A ship stands in the ice, bow towards home. A tightrope runs
 * from its mast to a light on the horizon — Eden — and the only red on the
 * block is the ship's wake: the lead it has broken through the ice behind it.
 *
 * A still, written as the seed of the film: `heroFrame({ now, uid })` is pure,
 * and the tone engine (toneLines, flicks) is what a film module would import —
 * because tone is computed from a brightness function, the moon can rise and
 * the dawn come up without redrawing anything by hand.
 */
import { t, rng, r } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, INK, RED, SECOND_INK, SHEET } from '../../../shared/video/album.mjs'
import { joints, strokes as figureStrokes, POSES } from '../../../shared/video/figure.mjs'

export const ICE = SECOND_INK['ship-to-stockholm']
/** The white of the paper showing through a cut. */
export const CUT = '#ece4d2'

/* ── The tone engine ──────────────────────────────────────────────── */

/** Stroke widths an engraver's gravers give, finest first. */
const WIDTHS = [0.45, 0.8, 1.2, 1.7, 2.4, 3.2]

/**
 * Horizontal engraved lines whose width follows `bright(x, y)` (0–1): runs of
 * one width are merged into one subpath, and each width is one <path>. This is
 * how a wood engraver makes a gradient — not with grey, with line.
 */
export function toneLines({ x0, x1, y0, y1, spacing = 6, step = 9, bright, wave = () => 0, seed = 1 }) {
  const rand = rng(seed)
  const buckets = WIDTHS.map(() => [])
  for (let y = y0; y <= y1; y += spacing) {
    let run = null
    for (let x = x0; x <= x1 + step; x += step) {
      const b = x > x1 ? -1 : bright(x, y) + (rand() - 0.5) * 0.06
      const k = b < 0.05 ? -1 : Math.min(WIDTHS.length - 1, Math.floor(b * WIDTHS.length))
      const yy = y + wave(x, y)
      if (run && run.k === k) { run.pts.push([x, yy]); continue }
      if (run && run.k >= 0 && run.pts.length > 1) buckets[run.k].push(run.pts)
      run = { k, pts: run ? [[x - step, y + wave(x - step, y)], [x, yy]] : [[x, yy]] }
    }
  }
  return buckets
}

/* Whole units: tone is thousands of points, and a tenth of a unit is invisible at any size a film is shown. */
const w = Math.round

/** Draw tone buckets as one path per width. `curved` draws each three-point stroke as one quadratic. */
export const drawTone = (buckets, colour = CUT, o = {}) => buckets.map((lines, k) => lines.length
  ? `<path d="${lines.map((pts) => o.curved
    ? `M${w(pts[0][0])} ${w(pts[0][1])}Q${w(pts[1][0])} ${w(pts[1][1])} ${w(pts[2][0])} ${w(pts[2][1])}`
    : 'M' + pts.map(([x, y]) => `${w(x)} ${w(y)}`).join('L')).join('')}" fill="none" stroke="${colour}" stroke-width="${WIDTHS[k] * (o.scale ?? 1)}" stroke-linecap="round"${o.opacity != null ? ` opacity="${o.opacity}"` : ''}/>`
  : '').join('')

/**
 * The sea: short curved flicks of the graver in rows, longer and wider and
 * closer as they come forward — which is all perspective is in a wood engraving.
 */
export function flicks({ x0, x1, y0, y1, bright, seed = 3 }) {
  const rand = rng(seed)
  const buckets = WIDTHS.map(() => [])
  let y = y0
  let row = 0
  while (y < y1) {
    const depth = (y - y0) / (y1 - y0)
    const len = 10 + depth * 36
    const gap = 5 + depth * 12
    let x = x0 - rand() * len
    while (x < x1) {
      const b = bright(x, y, depth)
      if (b > 0.06) {
        const k = Math.min(WIDTHS.length - 1, Math.floor(b * WIDTHS.length))
        const lift = (1 + depth * 3.5) * (0.5 + rand())
        const l = len * (0.6 + rand() * 0.7)
        buckets[k].push([[x, y + (rand() - 0.5) * 2], [x + l * (0.35 + rand() * 0.3), y - lift], [x + l, y + (rand() - 0.3) * 1.5]])
      }
      x += len + gap * (0.6 + rand() * 0.8)
    }
    y += 5 + depth * 10
    row++
  }
  return buckets
}

/* ── The block ────────────────────────────────────────────────────── */

const HORIZON = 430
const MOON = { x: 1240, y: 150, r: 54 }
const EDEN = { x: 250, y: HORIZON - 4 }

/** Sky brightness: dark overhead, paling to the horizon, a glow round the moon and round Eden. */
const skyBright = (x, y) => {
  const toHorizon = Math.max(0, (y - 60) / (HORIZON - 60)) ** 1.8 * 0.42
  const dm = Math.hypot(x - MOON.x, y - MOON.y)
  const moon = dm < MOON.r ? 1 : Math.max(0, 1 - (dm - MOON.r) / 260) ** 2 * 0.55
  const de = Math.hypot((x - EDEN.x) * 0.7, (y - EDEN.y) * 1.6)
  const eden = Math.max(0, 1 - de / 230) ** 2 * 0.7
  return Math.min(1, toHorizon + moon + eden)
}

/** Sea brightness: the moon's path down the water, and the swell catching light in the foreground. */
const seaBright = (x, y, depth) => {
  const path = Math.max(0, 1 - Math.abs(x - MOON.x) / (70 + depth * 180)) ** 1.5 * (0.95 - depth * 0.25)
  const eden = Math.max(0, 1 - Math.abs(x - EDEN.x) / (60 + depth * 120)) ** 2 * 0.45 * (1 - depth)
  return Math.min(1, 0.12 + depth * 0.22 + path + eden)
}

/** The ice: a thin sheet in perspective, across the whole sea. */
const ICE_NEAR = 534
const ICE_FAR = 484
const iceTop = (x) => ICE_FAR + (x - 34) * 0.008 + Math.sin(x / 90) * 3 + Math.sin(x / 23) * 1.5
const iceFront = (x) => ICE_NEAR + (x - 34) * 0.006 + Math.sin(x / 70) * 3

function ice(uid) {
  const top = []
  const front = []
  for (let x = 34; x <= 1566; x += 16) { top.push([x, iceTop(x)]); front.push([x, iceFront(x)]) }
  const d = 'M' + top.map(([x, y]) => `${r(x)} ${r(y)}`).join('L') + 'L' + front.reverse().map(([x, y]) => `${r(x)} ${r(y)}`).join('L') + 'Z'
  const clip = `${uid}-ice`
  // Fine white lines across the sheet — frost — and black cracks cut back into it.
  const frost = toneLines({ x0: 34, x1: 1566, y0: ICE_FAR - 6, y1: ICE_NEAR + 8, spacing: 3.2, step: 12, seed: 17, bright: (x, y) => 0.22 + 0.25 * Math.max(0, 1 - Math.abs(x - MOON.x) / 380) })
  const rand = rng(29)
  const cracks = Array.from({ length: 14 }, () => {
    let x = 60 + rand() * 1460
    let y = ICE_FAR + 6 + rand() * 60
    const pts = [[x, y]]
    for (let i = 0; i < 5; i++) { x += 14 + rand() * 40; y += (rand() - 0.45) * 14; pts.push([x, y]) }
    return pts
  })
  const edge = front.reverse()
  return `<clipPath id="${clip}"><path d="${d}"/></clipPath>
    <path d="${d}" fill="${ICE}" opacity="0.42"/>
    <g clip-path="url(#${clip})">
      ${drawTone(frost, CUT, { opacity: 0.8 })}
      <path d="${cracks.map((pts) => 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')).join('')}" fill="none" stroke="${INK}" stroke-width="1.6"/>
    </g>
    <path d="M${edge.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}" fill="none" stroke="${CUT}" stroke-width="1.4"/>`
}

/** The ship: a black hull engraved with white lines along its planking, masts, and sails of fine hatching. */
function ship(uid, x, water) {
  const L = 300
  const hull = `M${x - L / 2} ${water - 36} L${x + L / 2 + 26} ${water - 42} Q${x + L / 2 + 6} ${water + 4} ${x + L / 2 - 30} ${water + 10} L${x - L / 2 + 24} ${water + 10} Q${x - L / 2 - 4} ${water - 6} ${x - L / 2} ${water - 36} Z`
  const clip = `${uid}-hull`
  const planks = Array.from({ length: 7 }, (_, i) => {
    const y = water - 32 + i * 6
    return `M${r(x - L / 2 + i * 3)} ${r(y)} Q${r(x)} ${r(y + 4 + i * 0.6)} ${r(x + L / 2 + 20 - i * 8)} ${r(y - 5 + i * 0.4)}`
  }).join('')
  const masts = [[x - 80, 250], [x + 10, 205], [x + 95, 262]]
  // Square sails: each a trapezoid of fine horizontal cuts, brightest in the middle where the moon catches them.
  const sails = []
  const sailCuts = []
  for (const [mx, top] of masts) {
    for (let k = 0; k < 3; k++) {
      const y0 = top + 18 + k * 64
      const y1 = y0 + 52
      const w0 = 44 - k * 2
      const w1 = 56 - k * 2
      sails.push(`M${r(mx - w0)} ${r(y0)} L${r(mx + w0)} ${r(y0)} Q${r(mx + w1 + 8)} ${r((y0 + y1) / 2)} ${r(mx + w1)} ${r(y1)} L${r(mx - w1)} ${r(y1)} Q${r(mx - w1 + 6)} ${r((y0 + y1) / 2)} ${r(mx - w0)} ${r(y0)} Z`)
      for (let yy = y0 + 3; yy < y1; yy += 3) {
        const u = (yy - y0) / (y1 - y0)
        const w = w0 + (w1 - w0) * u
        sailCuts.push(`M${r(mx - w + 3)} ${r(yy)} Q${r(mx)} ${r(yy + 3)} ${r(mx + w - 3)} ${r(yy)}`)
      }
    }
  }
  const sailClip = `${uid}-sails`
  return `<clipPath id="${clip}"><path d="${hull}"/></clipPath>
    <clipPath id="${sailClip}"><path d="${sails.join('')}"/></clipPath>
    <path d="${masts.map(([mx, top]) => `M${mx} ${water - 36} V${top}`).join('')}" stroke="${CUT}" stroke-width="2.2"/>
    <path d="M${x - L / 2 - 10} ${water - 44} L${masts[0][0]} ${masts[0][1]} L${masts[1][0]} ${masts[1][1]} L${masts[2][0]} ${masts[2][1]} L${x + L / 2 + 40} ${water - 60}" fill="none" stroke="${CUT}" stroke-width="0.8"/>
    <path d="${sails.join('')}" fill="${INK}"/>
    <path d="${sailCuts.join('')}" fill="none" stroke="${CUT}" stroke-width="1" clip-path="url(#${sailClip})"/>
    <path d="${sails.join('')}" fill="none" stroke="${CUT}" stroke-width="1.2"/>
    <path d="${hull}" fill="${INK}"/>
    <path d="${planks}" fill="none" stroke="${CUT}" stroke-width="0.9" clip-path="url(#${clip})"/>
    <path d="${hull}" fill="none" stroke="${CUT}" stroke-width="1.5"/>
    ${Array.from({ length: 5 }, (_, i) => `<circle cx="${r(x - 90 + i * 45)}" cy="${r(water - 20)}" r="3" fill="${CUT}"/>`).join('')}`
}

/** The tightrope, mast to Eden, and a small figure on it. */
function tightrope(from, to, at = 0.42) {
  const sag = 26
  const mx = (from[0] + to[0]) / 2
  const my = (from[1] + to[1]) / 2 + sag
  const d = `M${r(from[0])} ${r(from[1])} Q${r(mx)} ${r(my)} ${r(to[0])} ${r(to[1])}`
  const u = at
  const px = (1 - u) ** 2 * from[0] + 2 * u * (1 - u) * mx + u * u * to[0]
  const py = (1 - u) ** 2 * from[1] + 2 * u * (1 - u) * my + u * u * to[1]
  const j = joints(px, py, 46, { ...POSES.reach, armB: [-95, 0], armF: [95, 0] }, -1)
  const fig = figureStrokes(j).map((pts) => 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')).join('')
  return `<path d="${d}" fill="none" stroke="${CUT}" stroke-width="1.1"/>
    <path d="${fig}" fill="none" stroke="${CUT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${r(j.head[0])}" cy="${r(j.head[1])}" r="${r(j.head[2])}" fill="${CUT}"/>`
}

/** The wake: the lead the ship has broken through the ice, in red — the only red on the block. */
function wake(x, water) {
  const rand = rng(51)
  const upper = []
  const lower = []
  const centre = (px) => {
    const u = (1566 - px) / (1566 - x - 150)
    return water - 8 - (1 - u) * 6 + Math.sin(px / 70) * 2.5
  }
  for (let px = 1566; px >= x + 150; px -= 14) {
    const u = (1566 - px) / (1566 - x - 150)
    const half = 2.5 + u * 9
    upper.push([px, centre(px) - half - rand() * 3.5])
    lower.push([px, centre(px) + half + rand() * 3.5])
  }
  const d = 'M' + upper.map(([px, y]) => `${r(px)} ${r(y)}`).join('L') + 'L' + lower.reverse().map(([px, y]) => `${r(px)} ${r(y)}`).join('L') + 'Z'
  const clip = 'wake-cut'
  // Ripples cut through the red, so the lead reads as water printed red, not a red shape laid on.
  const ripples = []
  for (let px = x + 160; px < 1566; px += 6 + rand() * 8) {
    const cy = centre(px) + (rand() - 0.5) * 10
    ripples.push(`M${r(px)} ${r(cy)}q${r(4)} ${r(-1.5)} ${r(8 + rand() * 8)} 0`)
  }
  const shards = Array.from({ length: 16 }, () => {
    const sx = x + 170 + rand() * 1200
    const sy = centre(sx) + (rand() < 0.5 ? -1 : 1) * (8 + rand() * 16)
    const s = 2.5 + rand() * 5
    return `M${r(sx)} ${r(sy)} l${r(s)} ${r(-s * 0.4)} l${r(s * 0.3)} ${r(s * 0.8)} Z`
  }).join('')
  return `<path d="${d}" fill="${RED}"/>
    <path d="${ripples.join('')}" fill="none" stroke="${INK}" stroke-width="1.7" opacity="0.7"/>
    <path d="${shards}" fill="${RED}"/>`
}

/* ── The frame ────────────────────────────────────────────────────── */

const HERO = {
  index: 12,
  text: 'It\'s deep water rescue on razor thin ice',
  words: ['It\'s', 'deep', 'water', 'rescue', 'on', 'razor', 'thin', 'ice'].map((text, i) => ({ t: i * 0.3, text })),
}

/**
 * One frame of the block. `now` is seconds into the synthetic line above; 1.4
 * has the voice just past "on", so RAZOR THIN ICE is still the faint impression.
 */
export function heroFrame({ now = 1.4, uid = 'stockholm' } = {}) {
  const plate = plateClip(uid)
  const { x, y, w, h } = SHEET.plate
  const rand = rng(11)
  const SHIP_X = 900
  const WATER = 506
  const sky = toneLines({ x0: x, x1: x + w, y0: y + 8, y1: HORIZON, spacing: 7, step: 12, bright: skyBright, seed: 5 })
  const sea = flicks({ x0: x, x1: x + w, y0: HORIZON + 4, y1: y + h + 10, bright: seaBright, seed: 8 })
  const stars = Array.from({ length: 110 }, () => {
    const sx = x + rand() * w
    const sy = y + 10 + rand() * (HORIZON - 160)
    return Math.hypot(sx - MOON.x, sy - MOON.y) < MOON.r + 40 ? '' : `M${r(sx)} ${r(sy)}h0.1`
  }).join('')
  // Eden: a low far shore with one light in it.
  const shore = `M${x} ${HORIZON} L${x} ${HORIZON - 8} Q140 ${HORIZON - 16} 200 ${HORIZON - 10} L236 ${HORIZON - 22} L248 ${HORIZON - 12} Q320 ${HORIZON - 18} 420 ${HORIZON - 6} L520 ${HORIZON} Z`
  const body = `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${INK}"/>
    ${drawTone(sky)}
    <path d="${stars}" stroke="${CUT}" stroke-width="2" stroke-linecap="round"/>
    ${drawTone(sea, CUT, { curved: true })}
    <path d="${shore}" fill="${INK}"/>
    <circle cx="${EDEN.x}" cy="${EDEN.y - 12}" r="4.5" fill="${CUT}"/>
    ${ice(uid)}
    ${wake(SHIP_X, WATER)}
    ${tightrope([SHIP_X - 10, 205], [EDEN.x, EDEN.y - 12])}
    <g transform="translate(${SHIP_X * 2} 0) scale(-1 1)">${ship(uid, SHIP_X, WATER)}</g>`
  return `${paper()}${plate.def}<g clip-path="${plate.url}">${body}</g>
    ${lyricMargin({ now, line: HERO, uid })}`
}

export default {
  slug: 'ship-to-stockholm',
  hero: () => heroFrame({ uid: 'hero' }),
}
