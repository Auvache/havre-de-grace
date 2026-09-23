/*
 * Trailhead — style C5, for "Into the Wild".
 *
 * A national-park screenprint poster, one per line. Flat spot colour, no
 * outlines, the landscape built out of silhouette layers stacked back to front
 * — far range, mid hills, near ridge, trees — with a sun or a moon on a disc
 * and a cream border round the lot. The lyric is the poster's headline, set
 * big and tracked in the banner under the picture, and it is always the first
 * thing legible: the picture is printed underneath it while it is being sung.
 *
 * THE PRINT IS PULLED ON THE WORDS
 *
 * A line cuts in on the first ink — the ground of the picture — and every
 * measured word after that lays one more ink down, stepped with a 90 ms ease
 * and a few pixels of registration that settle as it lands. By the last word
 * every ink is down, and the finished poster holds until the next line cuts it.
 * Nothing fades across a line; a poster is made of separate pulls, and so is
 * this.
 *
 * WHAT MOVES BETWEEN THE PULLS
 *
 * Parallax, off the clock: every layer drifts at its own depth, slowly in a
 * verse and at a run in a chorus. The drift is the integral of a speed that
 * changes per section, so it is continuous inside a poster and a pure function
 * of time. The ridges are sums of sines with whole periods across 3200 units,
 * so they scroll forever without a seam. The runner steps through the six poses
 * of shared/video/figure.mjs one per eighth note — this record was played to a
 * click at a measured 120 BPM, so the grid is real — and is never tweened.
 */
import { t, rect, path, circle, rng, r, advance, clamp01, lerp, ramp, easeOut, easeInOut } from '../kit.mjs'
import { sectionAt, shownLineAt, cutIn, bankWords, throughRow, splitLine, sizeToMeasure } from '../score.mjs'
import { cuesIn } from '../cues.mjs'
import { joints, strokes, runPose, POSES } from '../figure.mjs'
import { motifBody } from '../motifs.mjs'
import { endCard } from '../ending.mjs'

/* ── Seven inks, and the paper. ───────────────────────────────────── */
export const CREAM = '#efe2c4'
export const PINE = '#1e3a33'
export const SAGE = '#7d9a78'
export const LAKE = '#3f6f80'
export const OCHRE = '#e0a13a'
export const RUST = '#b8492f'
export const NIGHT = '#1b2433'

export const PALETTE = { CREAM, PINE, SAGE, LAKE, OCHRE, RUST, NIGHT }

/* ── The sheet of paper. ──────────────────────────────────────────── */
const BORDER = 34
/** The picture, when there is a headline under it. */
const PIC = { x0: BORDER, y0: BORDER, x1: 1600 - BORDER, y1: 668 }
/** The picture, full bleed inside the border — for the instrumentals. */
const PIC_FULL = { x0: BORDER, y0: BORDER, x1: 1600 - BORDER, y1: 900 - BORDER }
const BANNER = { y0: 668, y1: 900 - BORDER }

const W = (P) => P.x1 - P.x0
const H = (P) => P.y1 - P.y0

/* ══ DRAWING PRIMITIVES ═══════════════════════════════════════════════ */

/**
 * A ridge line, periodic across 3200 units so it scrolls without a seam.
 * `peak` > 1 sharpens it towards mountains; 1 is rolling hills.
 */
function ridgeFn(seed, base, amp, { peak = 1, harmonics = 4, alpine = false } = {}) {
  const rand = rng(seed)
  const comps = Array.from({ length: harmonics }, (_, k) => ({
    f: [2, 3, 5, 7, 11, 13][k] ?? k + 2,
    a: 1 / (k + 1) ** 0.9,
    ph: rand() * Math.PI * 2,
  }))
  const norm = comps.reduce((s, c) => s + c.a, 0)
  return (x) => {
    let s = 0
    // Alpine: 1 - |sin| has a cusp at every zero, so a sum of them is a range of
    // peaks rather than a line of hills.
    // Alpine: 1 - |sin| has a cusp at every zero, and the highest of several
    // of them is a range of separate peaks rather than a line of hills (a sum
    // of them came out as a plateau).
    if (alpine) {
      for (const c of comps) s = Math.max(s, (c.a / comps[0].a) * (1 - Math.abs(Math.sin((Math.PI * c.f * x) / 3200 + c.ph))) ** 2.2)
      return base - amp * s ** peak
    }
    for (const c of comps) s += c.a * Math.sin((2 * Math.PI * c.f * x) / 3200 + c.ph)
    const u = (s / norm + 1) / 2
    return base - amp * u ** peak
  }
}

/** A filled silhouette under a ridge, from P.x0 to P.x1, down to `bottom`. */
function ridgePath(fn, off, P, bottom, step = 20) {
  let d = `M${P.x0} ${r(bottom, 0)}`
  for (let x = P.x0; x <= P.x1 + step; x += step) d += ` L${Math.min(x, P.x1)} ${r(fn(x + off), 0)}`
  return `${d} L${P.x1} ${r(bottom, 0)}Z`
}

/** Snow caps: paper-coloured ink on the ridge wherever it rises above `line`. */
function snowPath(fn, off, P, line, depth, seed, step = 20) {
  const rand = rng(seed)
  const top = []
  const low = []
  for (let x = P.x0; x <= P.x1 + step; x += step) {
    const xx = Math.min(x, P.x1)
    const y = fn(xx + off)
    // The jag is seeded on the ridge's own coordinate, so a scrolling cap keeps its shape.
    const jag = ((Math.sin((xx + off) * 0.09) + Math.sin((xx + off) * 0.23)) * 0.5) * depth * 0.35
    rand()
    top.push([xx, y])
    low.push([xx, y < line ? Math.min(line + jag, y + depth) : y])
  }
  let d = `M${top.map(([x, y]) => `${x} ${r(y, 0)}`).join(' L')}`
  d += ` L${low.reverse().map(([x, y]) => `${x} ${r(y, 0)}`).join(' L')}Z`
  return d
}

/** A pine: three stacked tiers and a trunk, as one subpath. */
const pineD = (x, gy, h, slim = 1) => {
  const w = h * 0.42 * slim
  const tier = (top, bot, half) => `M${r(x, 0)} ${r(top, 0)} L${r(x + half, 0)} ${r(bot, 0)} L${r(x - half, 0)} ${r(bot, 0)}Z`
  return tier(gy - h, gy - h * 0.55, w * 0.55)
    + tier(gy - h * 0.78, gy - h * 0.3, w * 0.8)
    + tier(gy - h * 0.55, gy - h * 0.08, w)
    + `M${r(x - h * 0.04, 0)} ${r(gy - h * 0.1, 0)} h${r(h * 0.08, 0)} v${r(h * 0.12, 0)} h${r(-h * 0.08, 0)}Z`
}

/** A row of pines standing on a ridge, scrolling with it. */
function treeRow(fn, off, P, { spacing, h, seed, jitter = 0.5, keep = 1, sink = 6 }) {
  let d = ''
  const first = Math.floor((P.x0 + off) / spacing) - 1
  const last = Math.ceil((P.x1 + off) / spacing) + 1
  for (let i = first; i <= last; i++) {
    const rand = rng(seed * 1000 + i + 5000)
    if (rand() > keep) continue
    const wx = i * spacing + (rand() - 0.5) * spacing * jitter
    const x = wx - off
    if (x < P.x0 - h || x > P.x1 + h) continue
    const hh = h * (0.7 + rand() * 0.6)
    d += pineD(x, fn(wx) + sink, hh)
  }
  return d
}

/** Horizontal stripes of one ink that thicken towards `y1` — the screenprint's gradient. */
function stripes(P, y0, y1, n, fill, { grow = 1.6 } = {}) {
  let out = ''
  for (let i = 1; i <= n; i++) {
    const u = i / n
    const band = (y1 - y0) / n
    const thick = band * u ** grow
    const y = y0 + band * i - thick
    out += `<rect x="${P.x0}" y="${r(y, 1)}" width="${W(P)}" height="${r(thick + 0.6, 1)}"/>`
  }
  return `<g fill="${fill}">${out}</g>`
}

/** A person, as a heavy round-capped silhouette. */
function figure(j, fill, sw) {
  const d = strokes(j).map((pts) => 'M' + pts.map(([x, y]) => `${r(x, 1)} ${r(y, 1)}`).join(' L')).join(' ')
  return `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${r(sw, 1)}" stroke-linecap="round" stroke-linejoin="round"/>`
    + circle(j.head[0], j.head[1], j.head[2] * 1.05, { fill })
}

/** A motif as a park emblem: the library drawing, heavy, inside a disc. */
function emblem(name, cx, cy, size, stroke, width = 5) {
  if (!name) return ''
  const s = size / 100
  return `<g transform="translate(${r(cx - size / 2)} ${r(cy - size / 2)}) scale(${r(s, 4)})" fill="none" stroke="${stroke}" stroke-width="${r(width, 2)}" stroke-linecap="round" stroke-linejoin="round">${motifBody(name)}</g>`
}

const sailboat = (x, y, s, sail, hull) =>
  `<path d="M${r(x)} ${r(y - s * 1.9)} L${r(x + s * 0.9)} ${r(y - s * 0.25)} L${r(x)} ${r(y - s * 0.25)}Z M${r(x - s * 0.12)} ${r(y - s * 1.5)} L${r(x - s * 0.8)} ${r(y - s * 0.25)} L${r(x - s * 0.12)} ${r(y - s * 0.25)}Z" fill="${sail}"/>`
  + `<path d="M${r(x - s)} ${r(y - s * 0.18)} H${r(x + s * 1.1)} L${r(x + s * 0.8)} ${r(y + s * 0.18)} H${r(x - s * 0.7)}Z" fill="${hull}"/>`

/* ══ THE SCENES ═══════════════════════════════════════════════════════
 *
 * A scene is a list of inks in print order. Each is { svg } and optionally
 * { word } — the index of the word it lands on — or { z } to stack it
 * somewhere other than where it was printed. Inks with no word are spread
 * across the line's words by `schedule`, first ink on the cut-in, last ink on
 * the last word.
 *
 * `c` carries: now, P (the picture rect), off(depth) (parallax in px), hit (the
 * current word's ring-out), wi (last word sung), seed, line, variant.
 */

/* The harbor at dusk. Quiet: seven inks, almost nothing moves. */
function harbor(c) {
  const { P, now, off } = c
  const horizon = P.y0 + H(P) * 0.7
  const heads = ridgeFn(c.seed + 3, horizon + 2, 46, { peak: 1.3 })
  const rock = (x) => x < 1040 ? P.y1 + 40 : lerp(P.y1 + 40, horizon - 48, easeOut(ramp(x, 1040, 1180)))
  const lampX = 1318
  const lampY = horizon - 212
  // The beam turns — a lighthouse is the one thing in a harbor that moves on its own.
  const a = now * 0.55
  const reach = Math.cos(a)
  const beamEnd = lampX + reach * 1100
  const spread = 22 + Math.abs(reach) * 46
  const moonX = P.x0 + W(P) * 0.26
  const moonY = P.y0 + H(P) * 0.26
  const shimmer = Array.from({ length: 9 }, (_, i) => {
    const y = horizon + 14 + i * ((P.y1 - horizon - 20) / 9)
    const w = (26 + i * 9) * (0.75 + 0.25 * Math.sin(now * 1.2 + i * 1.9))
    return `<rect x="${r(moonX - w)}" y="${r(y)}" width="${r(w * 2)}" height="${r(3 + i * 0.5, 1)}"/>`
  }).join('')
  const bob = (i) => Math.sin(now * 1.1 + i * 2.1) * 2.5
  return [
    { svg: rect(P.x0, P.y0, W(P), H(P), NIGHT) },
    { svg: stripes(P, P.y0 + H(P) * 0.3, horizon, 9, LAKE) },
    { svg: `<path d="${ridgePath(heads, off(0.06), { ...P, x1: 1120 }, horizon + 1, 24)}" fill="${SAGE}"/>`
      + `<g fill="${SAGE}" opacity="0.55">${[0, 1, 2].map((i) => `<rect x="${P.x0 + 60 + i * 90}" y="${r(horizon + 10 + i * 12)}" width="${520 - i * 110}" height="3"/>`).join('')}</g>` },
    { svg: circle(moonX, moonY, 52, { fill: CREAM }) + `<g fill="${CREAM}">${shimmer}</g>`
      + `<path d="M${lampX - 24} ${horizon - 48} L${lampX - 15} ${lampY + 10} H${lampX + 15} L${lampX + 24} ${horizon - 48}Z" fill="${CREAM}"/>` },
    { svg: `<path d="${ridgePath(rock, 0, P, P.y1, 20)}" fill="${PINE}"/>`
      + `<path d="M${lampX - 22} ${lampY + 12} h44 v-10 l-22 -20 l-22 20Z" fill="${PINE}"/>` },
    { svg: `<g fill="${RUST}"><rect x="${lampX - 20}" y="${horizon - 120}" width="40" height="22"/><rect x="${lampX - 17}" y="${horizon - 180}" width="34" height="18"/></g>`
      + sailboat(P.x0 + W(P) * 0.47, horizon + 44 + bob(1), 26, RUST, PINE)
      + sailboat(P.x0 + W(P) * 0.6, horizon + 28 + bob(2), 17, RUST, PINE)
      + `<g fill="${RUST}" opacity="0.45"><rect x="${r(P.x0 + W(P) * 0.47 - 24)}" y="${r(horizon + 58)}" width="48" height="3"/><rect x="${r(P.x0 + W(P) * 0.6 - 16)}" y="${r(horizon + 38)}" width="32" height="2"/></g>` },
    { svg: `<path d="M${lampX} ${lampY} L${r(beamEnd)} ${r(lampY - spread)} L${r(beamEnd)} ${r(lampY + spread)}Z" fill="${OCHRE}" opacity="${r(0.2 + 0.4 * Math.abs(reach), 2)}"/>`
      + circle(lampX, lampY, 11, { fill: OCHRE }) },
  ]
}

/*
 * The crowd, centre stage. The rows of heads are drawn the way the hills are —
 * three silhouettes stacked back to front — so the loudest picture in the
 * window rhymes with the quietest ones. Arms go up on the words.
 */
function stage(c) {
  const { P, now, wi, hit } = c
  const floor = P.y0 + H(P) * 0.5
  const cx = 800
  const aim = (k) => {
    const rand = rng(c.seed * 31 + Math.max(wi, 0) * 7 + k)
    return cx + (rand() - 0.5) * 260
  }
  const sources = [240, 520, 800, 1080, 1360]
  const beams = sources.map((sx, k) => {
    const tx = aim(k)
    return `M${sx - 8} ${P.y0} L${sx + 8} ${P.y0} L${r(tx + 90)} ${r(floor)} L${r(tx - 90)} ${r(floor)}Z`
  }).join(' ')
  const pose = wi >= c.line.words.length - 1 ? POSES.cheer : wi % 2 ? POSES.play : POSES.stand
  const performer = joints(cx, floor - 4, 190, pose)
  const row = (y, rad, spacing, seed, fill, sway) => {
    let d = ''
    let arms = ''
    const n = Math.ceil(W(P) / spacing) + 2
    for (let i = -1; i < n; i++) {
      const rand = rng(seed * 100 + i + 900)
      const x = P.x0 + i * spacing + (rand() - 0.5) * spacing * 0.4 + Math.sin(now * 0.9 + i) * sway
      // On each word a different set of arms goes up: stepped, never tweened.
      const up = rng(seed * 57 + i * 13 + Math.max(wi, 0) * 101)() > 0.58
      const jump = up ? hit * rad * 0.35 : 0
      const hy = y - jump
      d += `M${r(x - rad)} ${r(hy)} a${rad} ${rad} 0 1 1 ${r(rad * 2)} 0 a${rad} ${rad} 0 1 1 ${r(-rad * 2)} 0Z`
      d += `M${r(x - rad * 2)} ${r(P.y1)} L${r(x - rad * 2)} ${r(hy + rad * 2.3)} Q${r(x)} ${r(hy + rad * 0.6)} ${r(x + rad * 2)} ${r(hy + rad * 2.3)} L${r(x + rad * 2)} ${r(P.y1)}Z`
      if (up) {
        const side = rand() > 0.5 ? 1 : -1
        arms += `M${r(x + side * rad * 1.4)} ${r(hy + rad * 2)} L${r(x + side * rad * 2.1)} ${r(hy - rad * 2.2)}`
        if (rand() > 0.6) arms += ` M${r(x - side * rad * 1.4)} ${r(hy + rad * 2)} L${r(x - side * rad * 2.0)} ${r(hy - rad * 2.0)}`
      }
    }
    return `<path d="${d}" fill="${fill}"/>` + (arms ? `<path d="${arms}" stroke="${fill}" stroke-width="${r(rad * 0.62, 1)}" stroke-linecap="round" fill="none"/>` : '')
  }
  return [
    { svg: rect(P.x0, P.y0, W(P), H(P), RUST) },
    { svg: circle(cx, floor, 330, { fill: OCHRE }) + stripes({ ...P }, P.y0, floor - 330, 5, OCHRE, { grow: 2 }) },
    { svg: `<path d="${beams}" fill="${CREAM}" opacity="0.5"/>` },
    { svg: `<path d="M${cx - 300} ${r(floor)} H${cx + 300} V${r(floor + 60)} H${cx - 300}Z" fill="${NIGHT}"/>`
      + figure(performer, NIGHT, 13)
      + `<path d="M${cx + 58} ${r(floor)} V${r(floor - 122)} l-24 -10" stroke="${NIGHT}" stroke-width="7" fill="none" stroke-linecap="round"/>` },
    { svg: row(P.y0 + H(P) * 0.64, 19, 58, 1, LAKE, 1.5) },
    { svg: row(P.y0 + H(P) * 0.79, 27, 82, 2, SAGE, 2.5) },
    { svg: row(P.y0 + H(P) * 0.95, 38, 116, 3, PINE, 3.5) },
  ]
}

/* Palettes for the wild: the three choruses must not be one picture three times. */
const WILD = {
  // Midday, the first time: lake sky, a paper sun.
  'chorus-1': { sky: LAKE, band: CREAM, sun: CREAM, far: SAGE, mid: PINE, near: NIGHT, trees: NIGHT, runner: RUST, snow: CREAM, sunY: 0.3 },
  // Sunset, the second: the sun low and rust, the ranges going to night.
  'chorus-2': { sky: OCHRE, band: RUST, sun: CREAM, far: RUST, mid: LAKE, near: NIGHT, trees: NIGHT, runner: CREAM, snow: OCHRE, sunY: 0.62 },
  // Sunrise, the last: cream and ochre, the sun coming up out of the range.
  'chorus-3': { sky: CREAM, band: OCHRE, sun: RUST, far: SAGE, mid: LAKE, near: PINE, trees: NIGHT, runner: NIGHT, snow: CREAM, sunY: 0.5, rise: true },
}
const wildOf = (c) => WILD[c.line.section] ?? WILD['chorus-3']

/* "So I'm running into the wild": the range, the pines, and somebody on the ridge. */
function wild(c) {
  const { P, now, off } = c
  const k = wildOf(c)
  const horizon = P.y0 + H(P) * 0.62
  const far = ridgeFn(c.seed + 11, horizon + 40, 300, { alpine: true, peak: 1, harmonics: 5 })
  const mid = ridgeFn(c.seed + 12, horizon + 100, 90, { peak: 1.2 })
  const near = ridgeFn(c.seed + 13, P.y1 - 80, 90, { peak: 1 })
  const sunY0 = P.y0 + H(P) * k.sunY
  const sunY = k.rise ? lerp(horizon - 20, sunY0 - 40, easeInOut(ramp(now, c.from, c.from + 5))) : sunY0
  const rx = 560
  const runnerX = rx
  const ground = near(runnerX + off(1))
  const pose = runPose((now - 0.03) / 0.25)
  const runner = joints(runnerX, ground + 3, 190, pose)
  return [
    // The ground and its stripes go down together: a cream sky alone is the paper, and a
    // poster that cuts in on blank paper reads as a dropped frame.
    { svg: rect(P.x0, P.y0, W(P), H(P), k.sky) + stripes(P, P.y0 + H(P) * 0.18, horizon, 10, k.band) },
    { svg: circle(1120, sunY, 118, { fill: k.sun }) },
    { svg: `<path d="${ridgePath(far, off(0.08), P, P.y1)}" fill="${k.far}"/><path d="${snowPath(far, off(0.08), P, horizon - 150, 70, c.seed)}" fill="${k.snow}"/>` },
    { svg: `<path d="${ridgePath(mid, off(0.3), P, P.y1)}" fill="${k.mid}"/>` + `<path d="${treeRow(mid, off(0.3), P, { spacing: 44, h: 46, seed: c.seed + 2, keep: 0.8 })}" fill="${k.mid}"/>` },
    { svg: `<path d="${ridgePath(near, off(1), P, P.y1)}" fill="${k.near}"/>`, word: 2, z: 6 },
    { svg: figure(runner, k.runner, 16), word: 2, z: 7 },
    { svg: `<path d="${treeRow(near, off(1), P, { spacing: 210, h: 170, seed: c.seed + 3, keep: 0.55, sink: 14 })}" fill="${k.trees}"/>`, z: 5 },
  ]
}

/*
 * "Oh, I'm running": in close. The runner is a silhouette against the sun —
 * the one picture in the film that is a single figure — with the tree line
 * going past behind and, now and then, one trunk crossing in front.
 */
function running(c) {
  const { P, now, off } = c
  const k = wildOf(c)
  const horizon = P.y0 + H(P) * 0.74
  const hills = ridgeFn(c.seed + 21, horizon, 80, { peak: 1.1 })
  const ground = P.y1 - 40
  const sunX = 760
  const sunY = horizon - 70
  const runner = joints(sunX - 20, ground, 360, runPose((now - 0.03) / 0.25))
  const back = ridgeFn(c.seed + 22, ground + 4, 26)
  // One trunk at a time crossing the foreground, faster than anything else in the film.
  const fast = off(2.4)
  const spacing = 3000
  let trunk = ''
  for (let i = Math.floor(fast / spacing) - 1; i <= Math.ceil((fast + 1600) / spacing) + 1; i++) {
    const rand = rng(c.seed * 77 + i)
    const x = i * spacing - fast + rand() * 300
    if (x < P.x0 - 300 || x > P.x1 + 300) continue
    trunk += pineD(x, P.y1 + 160, 780 + rand() * 120, 0.5)
  }
  const sun = k.sun === CREAM ? CREAM : RUST
  const figureInk = NIGHT
  return [
    { svg: rect(P.x0, P.y0, W(P), H(P), k.sky) + stripes(P, P.y0 + H(P) * 0.08, horizon, 12, k.band) },
    { svg: circle(sunX, sunY, 270, { fill: sun }) },
    { svg: `<path d="${ridgePath(hills, off(0.25), P, P.y1)}" fill="${k.far}"/>` + `<path d="${treeRow(hills, off(0.25), P, { spacing: 34, h: 44, seed: c.seed + 4, keep: 0.9 })}" fill="${k.far}"/>` },
    { svg: `<path d="${ridgePath(back, off(1), P, P.y1)}" fill="${k.mid}"/>` + `<path d="${treeRow(back, off(1), { ...P, x0: P.x0 }, { spacing: 260, h: 230, seed: c.seed + 6, keep: 0.6, sink: 10 })}" fill="${k.mid}"/>` },
    { svg: figure(runner, figureInk, 28) },
    { svg: `<path d="${trunk}" fill="${k.trees}"/>` },
  ]
}

/*
 * The generic landscape, for every line that is not in the window. A sky, a
 * disc, two or three ranges and a tree line, with the line's own drawing as an
 * emblem on the disc — which is how a park poster carries a symbol.
 */
const MOODS = [
  { sky: CREAM, band: OCHRE, disc: RUST, far: SAGE, mid: LAKE, near: PINE, emblem: CREAM },
  { sky: LAKE, band: CREAM, disc: OCHRE, far: SAGE, mid: PINE, near: NIGHT, emblem: NIGHT },
  { sky: NIGHT, band: LAKE, disc: CREAM, far: LAKE, mid: PINE, near: NIGHT, emblem: NIGHT, stars: true },
  { sky: OCHRE, band: RUST, disc: CREAM, far: RUST, mid: PINE, near: NIGHT, emblem: RUST },
  { sky: SAGE, band: CREAM, disc: OCHRE, far: LAKE, mid: PINE, near: NIGHT, emblem: PINE },
]

function landscape(c, o = {}) {
  const { P, off } = c
  const m = o.mood ?? MOODS[c.seed % MOODS.length]
  const horizon = P.y0 + H(P) * (o.horizon ?? 0.62)
  const far = ridgeFn(c.seed + 31, horizon + 20, o.farAmp ?? 230, { peak: o.peak ?? 1.3, alpine: o.alpine ?? (o.peak == null) })
  const mid = ridgeFn(c.seed + 32, horizon + 80, 110, { peak: 1.2 })
  const near = ridgeFn(c.seed + 33, P.y1 - 40, 60)
  const dx = P.x0 + W(P) * (o.discX ?? (c.seed % 2 ? 0.73 : 0.27))
  const dy = P.y0 + H(P) * (o.discY ?? 0.3)
  const rad = o.discR ?? 110
  const stars = m.stars
    ? `<g fill="${CREAM}">${Array.from({ length: 40 }, (_, i) => { const q = rng(c.seed * 9 + i); return `<rect x="${r(P.x0 + q() * W(P))}" y="${r(P.y0 + q() * H(P) * 0.45)}" width="3" height="3"/>` }).join('')}</g>`
    : ''
  const inks = [
    { svg: rect(P.x0, P.y0, W(P), H(P), m.sky) + stars },
    { svg: stripes(P, P.y0 + H(P) * 0.2, horizon, 9, m.band) },
    { svg: circle(dx, dy, rad, { fill: m.disc }) + (o.emblem ? emblem(o.emblem, dx, dy, rad * 1.3, m.emblem, 5) : '') },
    { svg: `<path d="${ridgePath(far, off(0.08), P, P.y1)}" fill="${m.far}"/>` + (o.snow ? `<path d="${snowPath(far, off(0.08), P, horizon - 120, 60, c.seed)}" fill="${CREAM}"/>` : '') },
    { svg: `<path d="${ridgePath(mid, off(0.3), P, P.y1)}" fill="${m.mid}"/>` + `<path d="${treeRow(mid, off(0.3), P, { spacing: 48, h: 48, seed: c.seed + 5, keep: o.trees ?? 0.7 })}" fill="${m.mid}"/>` },
    { svg: `<path d="${ridgePath(near, off(1), P, P.y1)}" fill="${m.near}"/>` + (o.foreground ? o.foreground(near, m) : '') },
  ]
  return o.extra ? inks.concat(o.extra(horizon, m)) : inks
}

/* A few scenes that need more than a landscape. */

function glacier(c) {
  const { P, off } = c
  const horizon = P.y0 + H(P) * 0.64
  const ice = ridgeFn(c.seed + 41, horizon + 20, 320, { alpine: true, peak: 1.2, harmonics: 5 })
  let cracks = ''
  for (let i = 0; i < 14; i++) {
    const q = rng(c.seed * 3 + i)
    const x = P.x0 + q() * W(P)
    const y = ice(x + off(0.1))
    cracks += `M${r(x)} ${r(y + 10)} l${r((q() - 0.5) * 40)} ${r(40 + q() * 80)} l${r((q() - 0.5) * 30)} ${r(30 + q() * 60)}`
  }
  return [
    { svg: rect(P.x0, P.y0, W(P), H(P), LAKE) },
    { svg: stripes(P, P.y0 + H(P) * 0.15, horizon, 9, CREAM, { grow: 2.4 }) },
    { svg: `<path d="${ridgePath(ice, off(0.1), P, P.y1)}" fill="${CREAM}"/>` },
    { svg: `<path d="${cracks}" stroke="${LAKE}" stroke-width="7" fill="none" stroke-linecap="round"/>` },
    { svg: rect(P.x0, horizon + 40, W(P), P.y1 - horizon - 40, NIGHT) + `<g fill="${CREAM}" opacity="0.7">${[0, 1, 2, 3].map((i) => `<rect x="${r(P.x0 + W(P) * (0.12 + i * 0.2))}" y="${r(horizon + 70 + i * 18)}" width="${r(W(P) * (0.12 - i * 0.015))}" height="4"/>`).join('')}</g>` },
  ]
}

function garden(c) {
  return landscape(c, {
    mood: MOODS[0], horizon: 0.5, farAmp: 90, peak: 1, trees: 0.2, discY: 0.24,
    foreground: (near, m) => {
      let d = ''
      let e = ''
      for (let i = 0; i < 60; i++) {
        const q = rng(c.seed * 11 + i)
        const x = c.P.x0 + q() * W(c.P)
        const y = c.P.y1 - 20 - q() * 150
        const rad = 8 + q() * 12
        if (q() > 0.5) d += `M${r(x - rad)} ${r(y)} a${r(rad)} ${r(rad)} 0 1 1 ${r(rad * 2)} 0 a${r(rad)} ${r(rad)} 0 1 1 ${r(-rad * 2)} 0Z`
        else e += `M${r(x - rad)} ${r(y)} a${r(rad)} ${r(rad)} 0 1 1 ${r(rad * 2)} 0 a${r(rad)} ${r(rad)} 0 1 1 ${r(-rad * 2)} 0Z`
      }
      return `<path d="${d}" fill="${RUST}"/><path d="${e}" fill="${OCHRE}"/>`
    },
  })
}

function grotto(c) {
  const { P } = c
  // The arch is cut out of the rock with even-odd: the view beyond shows through.
  const cx = (P.x0 + P.x1) / 2
  const half = Math.min(380, W(P) * 0.36)
  const top = P.y0 + H(P) * 0.2
  const arch = `M${P.x0} ${P.y0} H${P.x1} V${P.y1} H${P.x0}Z M${r(cx - half)} ${P.y1} V${r(top + 240)} Q${r(cx - half * 0.97)} ${r(top)} ${r(cx)} ${r(top)} Q${r(cx + half * 0.97)} ${r(top)} ${r(cx + half)} ${r(top + 240)} V${P.y1}Z`
  let drips = ''
  for (let i = 0; i < 9; i++) {
    const q = rng(c.seed * 5 + i)
    const x = cx - half * 0.8 + i * half * 0.2 + q() * 20
    const y = top + 30 + Math.abs(x - cx) * 0.5
    drips += `M${r(x - 12)} ${r(y - 30)} L${r(x)} ${r(y + 30 + q() * 40)} L${r(x + 12)} ${r(y - 30)}Z`
  }
  const inner = landscape(c, { mood: MOODS[1], horizon: 0.64, farAmp: 160, discX: 0.5, discY: 0.42, discR: Math.min(80, W(P) * 0.1) })
  return [
    ...inner.slice(0, 4),
    { svg: `<path d="${arch}" fill="${PINE}" fill-rule="evenodd"/>` + `<path d="${drips}" fill="${PINE}"/>` },
    { svg: `<g fill="${OCHRE}">${Array.from({ length: 7 }, (_, i) => { const q = rng(c.seed + i * 3); const x = cx - half * 0.9 + i * half * 0.3 + q() * 30; const h = 30 + q() * 50; return `<path d="M${r(x)} ${P.y1} L${r(x + 12)} ${r(P.y1 - h)} L${r(x + 26)} ${P.y1}Z"/>` }).join('')}</g>` },
  ]
}

function sageHills(c) {
  const { P, now, off } = c
  return landscape(c, {
    mood: { sky: CREAM, band: SAGE, disc: OCHRE, far: SAGE, mid: LAKE, near: PINE, emblem: PINE },
    horizon: 0.52, farAmp: 80, peak: 1, trees: 0, discY: 0.22,
    extra: (horizon) => {
      // The wind through the sage: long thin paper-coloured strokes crossing the hills.
      let d = ''
      for (let i = 0; i < 12; i++) {
        const q = rng(c.seed * 13 + i)
        const y = horizon + 30 + q() * (P.y1 - horizon - 60)
        const x = ((q() * 1800 - off(1.6)) % 1900 + 1900) % 1900 - 150
        d += `M${r(x)} ${r(y)} q120 -${r(12 + q() * 10)} 260 0`
      }
      let bush = ''
      for (let i = 0; i < 22; i++) {
        const q = rng(c.seed * 17 + i)
        const x = P.x0 + q() * W(P)
        const y = P.y1 - 10 - q() * 90
        const w = 30 + q() * 40
        bush += `M${r(x - w)} ${r(y)} Q${r(x)} ${r(y - w * 1.3)} ${r(x + w)} ${r(y)}Z`
      }
      return [
        { svg: `<path d="${bush}" fill="${SAGE}"/>` },
        { svg: `<path d="${d}" stroke="${CREAM}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${r(0.7 + 0.3 * Math.sin(now * 2), 2)}"/>` },
      ]
    },
  })
}

function ocean(c) {
  const { P, now } = c
  const horizon = P.y0 + H(P) * 0.46
  const swell = (k, y, amp, fill, speed) => {
    let d = `M${P.x0} ${P.y1}`
    for (let x = P.x0; x <= P.x1 + 20; x += 20) {
      const u = (x + now * speed + k * 170) / 260
      d += ` L${Math.min(x, P.x1)} ${r(y - amp * (0.5 + 0.5 * Math.sin(u * Math.PI * 2)) ** 3, 0)}`
    }
    return `<path d="${d} L${P.x1} ${P.y1}Z" fill="${fill}"/>`
  }
  return [
    { svg: rect(P.x0, P.y0, W(P), H(P), CREAM) },
    { svg: stripes(P, P.y0 + H(P) * 0.1, horizon, 8, OCHRE) + circle(1180, horizon - 40, 90, { fill: RUST }) },
    { svg: rect(P.x0, horizon, W(P), P.y1 - horizon, LAKE) },
    { svg: swell(1, horizon + 90, 50, SAGE, 14) },
    { svg: swell(2, horizon + 170, 80, PINE, 22) },
    { svg: swell(3, P.y1 - 10, 110, NIGHT, 34) },
  ]
}

function sunburst(c, gold = false) {
  const { P, now } = c
  const horizon = P.y0 + H(P) * 0.68
  const cx = (P.x0 + P.x1) / 2
  let rays = ''
  // The rays turn slowly from the poster's own cut-in, never from the song's
  // clock: at 2:45 that had turned them ninety degrees off the horizon.
  const turn = (now - (c.from ?? now)) * 0.015
  for (let i = -1; i < 19; i++) {
    const a0 = Math.PI + (i / 18) * Math.PI + turn
    const a1 = a0 + Math.PI / 36
    rays += `M${cx} ${r(horizon)} L${r(cx + Math.cos(a0) * 1400)} ${r(horizon + Math.sin(a0) * 1400)} L${r(cx + Math.cos(a1) * 1400)} ${r(horizon + Math.sin(a1) * 1400)}Z`
  }
  return landscape(c, {
    mood: gold
      ? { sky: OCHRE, band: OCHRE, disc: CREAM, far: RUST, mid: PINE, near: NIGHT, emblem: OCHRE }
      : { sky: CREAM, band: CREAM, disc: OCHRE, far: SAGE, mid: PINE, near: NIGHT, emblem: RUST },
    horizon: 0.68, discX: 0.5, discY: 0.42, discR: 130, emblem: c.emblem, farAmp: 150,
    extra: () => [],
  }).map((ink, i) => (i === 1 ? { svg: `<path d="${rays}" fill="${gold ? RUST : OCHRE}"/>` } : ink))
}

/*
 * Glaciers and gardens and grottos: three pictures in two and a half seconds,
 * so the poster is a triptych and each panel prints on its own word.
 */
function triptych(c, cues) {
  const { P } = c
  const gap = 14
  const w = (W(P) - gap * 2) / 3
  const inks = [{ svg: rect(P.x0, P.y0, W(P), H(P), CREAM) }]
  cues.slice(0, 3).forEach((cue, i) => {
    const Q = { x0: P.x0 + i * (w + gap), y0: P.y0, x1: P.x0 + i * (w + gap) + w, y1: P.y1 }
    const scene = sceneFor(cue.motif)
    const sub = scene({ ...c, P: Q, seed: c.seed + i * 7 })
    const id = `${c.uid}-tri-${i}`
    const body = sub.map((ink) => ink.svg).join('')
    inks.push({
      svg: `<clipPath id="${id}"><rect x="${r(Q.x0)}" y="${Q.y0}" width="${r(w)}" height="${H(Q)}"/></clipPath><g clip-path="url(#${id})">${body}</g>`,
      word: cue.word,
    })
  })
  return inks
}

const SCENES = {
  lighthouse: harbor,
  crowd: stage,
  microphone: stage,
  pine: wild,
  runner: running,
  glacier,
  flower: garden,
  cave: grotto,
  sprig: sageHills,
  wave: ocean,
  globe: ocean,
  sun: (c) => sunburst(c),
  crown: (c) => sunburst({ ...c, emblem: 'crown' }, true),
  gem: grotto,
  // Four compass lines in the song, two of them the same words: alternate the
  // palette by line, and start verse 3 on the other one, so no two in a row match.
  compass: (c) => landscape(c, { snow: true, emblem: 'compass', mood: MOODS[((c.line?.index ?? 0) + (c.line?.section === 'verse-3' ? 1 : 0)) % 2 ? 4 : 0] }),
  moon: (c) => landscape(c, { mood: MOODS[2], emblem: null, discR: 70, discY: 0.22, snow: true }),
  stone: (c) => landscape(c, { mood: MOODS[2], discR: 64, discY: 0.2, snow: true, trees: 0.3,
    extra: (horizon) => [{ svg: `<g fill="${CREAM}">${[[0, 70, 28], [-4, 44, 22], [2, 22, 16], [0, 4, 10]].map(([dx, dy, s]) => `<ellipse cx="${1000 + dx}" cy="${r(c.P.y1 - 48 - dy)}" rx="${s * 1.5}" ry="${s * 0.62}"/>`).join('')}</g>` }] }),
  bone: (c) => landscape(c, { mood: MOODS[3], emblem: 'bone', horizon: 0.6, farAmp: 140, peak: 0.6, trees: 0 }),
}
const sceneFor = (motif) => SCENES[motif] ?? ((c) => landscape(c, { emblem: motif, snow: c.seed % 2 === 0 }))

/* ══ THE HEADLINE ═════════════════════════════════════════════════════ */

/**
 * The lyric, in the banner: Jost 700 caps, tracked, sized to the measure and
 * stretched to it. Pine until it is sung, rust once it is, the edge on a word
 * boundary. Always on — it is the poster's reason for existing.
 */
function headline({ now, line, uid, rows: forced = null }) {
  const rows = forced ?? splitLine(line.text, 4)
  const banks = line ? bankWords(line, rows) : rows.map(() => [])
  const measure = 1380
  const two = rows.length > 1
  const cap = two ? 92 : 124
  const tracking = two ? 6 : 9
  const sizes = rows.map((row) => sizeToMeasure(row, measure, cap, tracking))
  const size = Math.min(...sizes)
  const capH = size * 0.7
  const gap = size * 0.34
  const block = capH * rows.length + gap * (rows.length - 1)
  let y = BANNER.y0 + (BANNER.y1 - BANNER.y0 - block) / 2 + capH
  return rows.map((row, i) => {
    const len = Math.min(measure, advance(row, size, tracking) - tracking)
    const through = line ? throughRow(now, row, banks[i]) : 0
    const id = `${uid}-hl-${line?.index ?? 't'}-${i}`
    const left = 800 - len / 2
    const base = { x: 800, y: y, size, text: row, len, anchor: 'middle', weight: 700, tracking }
    const out = t({ ...base, fill: PINE })
      + (through > 0
        ? `<clipPath id="${id}"><rect x="${r(left)}" y="${r(y - size)}" width="${r(len * through)}" height="${r(size * 1.3)}"/></clipPath>`
          + t({ ...base, fill: RUST, extra: `clip-path="url(#${id})"` })
        : '')
    y += capH + gap
    return out
  }).join('')
}

/* ══ PULLING THE PRINT ════════════════════════════════════════════════ */

/**
 * When each ink lands. The first on the cut-in; the rest spread across the
 * line's words so the last lands on the last word — unless an ink names its
 * own word.
 */
function schedule(inks, line, from) {
  const n = line.words.length
  const free = inks.map((ink, i) => (i === 0 || ink.word != null ? null : i)).filter((i) => i != null)
  return inks.map((ink, i) => {
    if (i === 0) return from
    if (ink.word != null) return line.words[Math.min(ink.word, n - 1)].t
    const k = free.indexOf(i)
    const w = free.length <= 1 ? n - 1 : Math.round((k * (n - 1)) / (free.length - 1))
    return line.words[w].t
  })
}

/** The picture, clipped to its own rectangle so nothing prints on the border or the banner. */
function picture(P, uid, body) {
  const id = `${uid}-pic`
  return `<clipPath id="${id}"><rect x="${P.x0}" y="${P.y0}" width="${W(P)}" height="${H(P)}"/></clipPath><g clip-path="url(#${id})">${body}</g>`
}

/** Print the inks: each lands with a 90 ms ease and settles into its register. */
function print(inks, times, now, seed) {
  const order = inks.map((ink, i) => ({ ink, i, z: ink.z ?? i })).sort((a, b) => a.z - b.z)
  return order.map(({ ink, i }) => {
    const p = easeOut(ramp(now, times[i], times[i] + 0.09))
    if (p <= 0) return ''
    const rand = rng(seed * 19 + i)
    // A pull is never quite in register. Two or three pixels, fixed per ink.
    const dx = (rand() - 0.5) * 5 + (1 - p) * 7
    const dy = (rand() - 0.5) * 4 + (1 - p) * 5
    const move = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05 ? ` transform="translate(${r(dx, 1)} ${r(dy, 1)})"` : ''
    return `<g${move}${p < 1 ? ` opacity="${r(p, 3)}"` : ''}>${ink.svg}</g>`
  }).join('')
}

/* ══ PARALLAX ═════════════════════════════════════════════════════════ */

const SPEED = { intro: 10, verse: 16, chorus: 150, break: 12, solo: 14, outro: 40 }

/** Distance travelled by `now`, in px at depth 1: the integral of each section's speed. */
function travelled(score, now) {
  let d = 0
  for (const s of score.sections) {
    if (now <= s.from) break
    d += (Math.min(now, s.to) - s.from) * (SPEED[s.kind] ?? 16)
  }
  return d
}

/* ══ THE FRAME ════════════════════════════════════════════════════════ */

/**
 * One frame of Trailhead.
 *
 * @param {object} o
 * @param {number} o.time   Seconds into the song.
 * @param {object} o.score  app/config/intoTheWildScore.ts, or any score shaped like it.
 * @param {string} [o.lockup] The stacked mark, inline, for the end card.
 * @param {string} [o.uid]  Prefix for every id in the frame.
 * @returns {{ svg: string, label: string }}
 */
export function trailheadFrame({ time, score, lockup = '', uid = 'trail' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  let section = sectionAt(score, now)
  const shown = shownLineAt(score, now)
  const lyricOn = shown && shown.section === section.id
  const dist = travelled(score, now)
  const off = (depth) => dist * depth
  const paper = rect(0, 0, 1600, 900, CREAM)

  /* ── The title poster ──────────────────────────────────────────── */
  if (section.kind === 'intro') {
    const c = { now, P: PIC, off, hit: 0, wi: -1, seed: 4, uid, line: null }
    const inks = landscape(c, { mood: MOODS[0], snow: true, discX: 0.71, discY: 0.34, emblem: 'pine' })
    // Pulled on the beat grid over the intro: an ink every two beats from 1.03.
    const times = inks.map((_, i) => (i === 0 ? 0 : 1.03 + i * 1.5))
    const band = now >= 2.03 && now < 13.03
      ? t({ x: 800, y: BANNER.y0 - 34, size: 26, text: score.artist, fill: CREAM, anchor: 'middle', weight: 700, tracking: 16 })
      : ''
    return {
      svg: [paper, picture(PIC, uid, print(inks, times, now, 4)), band, headline({ now, line: null, uid, rows: [score.title] })].join('\n'),
      label: score.title,
    }
  }

  /* ── The instrumentals: full bleed, no headline ────────────────── */
  if (!lyricOn) {
    // A sung section whose first line has not cut in yet — verse 3 starts 0.18 s
    // before its first line does — holds the instrumental it came out of rather
    // than flashing a new poster for five frames.
    const index = score.sections.indexOf(section)
    if ((section.kind === 'verse' || section.kind === 'chorus') && index > 0) section = score.sections[index - 1]
    // A new poster every four bars (8 s at the measured 120 BPM), from the section's first beat.
    const beat0 = Math.ceil((section.from - 0.03) / 0.5) * 0.5 + 0.03
    // The last poster of a section runs long rather than starting a new one it
    // has no time to print: the horns end 0.37 s into a fresh four bars.
    const kMax = Math.max(0, Math.floor((section.to - beat0 - 4) / 8))
    const k = Math.min(kMax, Math.max(0, Math.floor((now - beat0) / 8)))
    const from = beat0 + k * 8
    const seed = Math.round(section.from) + k * 3
    const c = { now, P: PIC_FULL, off, hit: 0, wi: -1, seed, uid, line: null, from }
    const pick = section.kind === 'outro'
      ? landscape(c, { mood: MOODS[0], snow: true, discY: 0.3, emblem: null })
      : [
          () => sageHills(c),
          () => landscape(c, { mood: MOODS[2], snow: true, discR: 80 }),
          () => ocean(c),
          () => glacier(c),
          () => landscape(c, { mood: MOODS[3], peak: 0.6, farAmp: 150, trees: 0.2 }),
        ][(k + (section.kind === 'break' ? 3 : 0)) % 5]()
    const times = pick.map((_, i) => (i === 0 ? Math.min(from, now) : from + i * 0.5))
    return { svg: [paper, picture(PIC_FULL, uid, print(pick, times, now, seed))].join('\n'), label: section.label }
  }

  /* ── A poster per line ─────────────────────────────────────────── */
  const line = shown
  const from = cutIn(score, line)
  const wi = line.words.reduce((out, w, i) => (now >= w.t ? i : out), -1)
  const hit = wi >= 0 ? Math.exp(-(now - line.words[wi].t) / 0.16) : 0
  const cues = cuesIn(line)
  const c = { now, P: PIC, off, hit, wi, seed: 7 + line.index * 3, uid, line, from }
  const distinct = new Set(cues.map((q) => q.motif))
  const inks = distinct.size >= 3 ? triptych(c, cues) : sceneFor(cues.length ? cues[cues.length - 1].motif : null)(c)
  const times = schedule(inks, line, from)

  return {
    svg: [paper, picture(PIC, uid, print(inks, times, now, c.seed)), headline({ now, line, uid })].join('\n'),
    label: line.text,
  }
}

export const TRAILHEAD = {
  id: 'c5-trailhead',
  name: 'Trailhead',
  accent: RUST,
  palette: PALETTE,
}
