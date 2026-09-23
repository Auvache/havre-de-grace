/*
 * Relief — "Into the Wild" as a woodcut that moves like the chart.
 *
 * The album pass (app/config/albumStyle.ts) took two liked films and one
 * complaint. Woodcut (woodcut.mjs) had the look; Cartography had the motion —
 * "how smooth it is" — and the woodcut was "great except for the smoothness".
 * This film is the woodcut's carving vocabulary on the album's paper and inks,
 * moving the way the chart moves.
 *
 * THE WHOLE SONG IS ONE PANORAMA, LEFT TO RIGHT
 *
 *   Intro    An empty sea at first light; the red sun rises under the title.
 *   Verse 1  The Earth being carved: a compass cut in the sky and knocked loose,
 *            gems glinting in the water, the gods' sun throwing rays, the sea
 *            cut into waves, and on "iron" the land and the range rise out of
 *            it. Ebony, ivory and bone are strata in the cliff; the stone-cold
 *            beauties are boulders asleep on a moor, and the singer is asleep
 *            among them as night falls.
 *   Chorus 1 Dawn. He wakes on "So", runs on "running", and the pines are cut
 *            up out of the ground ahead of him on "the wild".
 *   Break    Through the forest, slowing to a walk.
 *   Verse 2  A town he is tired of: windows lit word by word, a shop sign carved
 *            for every noun, a clock whose hands race on "pressure", a door
 *            that opens on "revealing", a guitar in a window he stops at.
 *   Chorus 2 He runs out of the town.
 *   Horns    Forty seconds over a pass: the ground climbs and falls, flocks go
 *            over on the bar, and the sun sets behind the range.
 *   Verse 3  Night. The compass again, a signpost with blank arms, a crown cut
 *            and struck through, a glacier, a garden, a grotto, wind through
 *            the sage; then the harbour, the stage and the leap into the wild.
 *
 * WHY IT IS SMOOTH
 *
 *   - The camera never stops. Before the first chorus it is a constant drift
 *     plus eased moves; from the first chorus it follows the runner, whose
 *     position is his velocity integrated, and his velocity is a smooth
 *     schedule solved from the score (`planFor`). So the camera's velocity is
 *     continuous everywhere by construction.
 *   - The runner's walk and run cycles are phased by distance, not time, so
 *     the feet never slide, and blended by speed, so he goes from sitting to
 *     standing to walking to running with no step anywhere.
 *   - Parallax: sky 0.22, range 0.55, ground 1. Translated, never scaled.
 *   - Things arrive on measured words, over 180 ms or more (`land`), and stay.
 *   - Where a thing is placed is solved from where the camera will be when its
 *     word is sung: the sign for "goals" hangs where the camera is on "goals".
 *     Retime the score and the world rearranges itself to match.
 *
 * `reliefFrame({ time, score })` is a pure function of the clock. The plan and
 * the static world are built once per score and cached; per frame it is a
 * camera, the cuts that are part-way down, and the people.
 */

import { circle, rng, r, clamp01, easeOut, easeInOut, ramp, lerp } from '../kit.mjs'
import { motifBody } from '../motifs.mjs'
import { sectionAt, lineAt, cutIn } from '../score.mjs'
import { RUN, POSES, joints, strokes } from '../figure.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, INK, RED, SECOND_INK, SHEET, paper, plateClip, marginLyric, titleCard, land, easeCamera } from '../album.mjs'

const SLATE = SECOND_INK['into-the-wild']

export const RELIEF = {
  id: 'album-into-the-wild',
  name: 'Relief',
  accent: RED,
  palette: { PAPER, INK, RED, SLATE },
}

const PL = SHEET.plate
const TOP = PL.y
const BOTTOM = PL.y + PL.h

/* ── Layers: how fast each moves against the camera ─────────────────── */
const FAR = 0.22
const MID = 0.55
const NEAR = 1

/** Constant drift, units a second. The camera is never still. */
const DRIFT = 34

/** The runner's speeds, units a second. */
const RUN_V = 170
const WALK_V = 50
const CLIMB_V = 60
/** Figure height. */
const FIG = 150

const I = Math.round
const pt = (x, y) => `${I(x)} ${I(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
/** A hash in [0, 1) for an integer — for picks that must not depend on draw order. */
const hash = (n) => (((Math.imul(n | 0, 2654435761) >>> 0) % 10007) / 10007)

/* ══ CARVING PRIMITIVES ═══════════════════════════════════════════════
 * The woodcut's, extended so each can be part-way cut: `k` is 0→1, how far
 * the knife has got.
 */

function rough(points, amount = 3, seed = 1, step = 26) {
  const rand = rng(seed)
  let d = ''
  for (let i = 0; i < points.length; i++) {
    const [ax, ay] = points[i]
    const [bx, by] = points[(i + 1) % points.length]
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step))
    for (let k = 0; k < n; k++) {
      const u = k / n
      const jx = k === 0 ? 0 : (rand() - 0.5) * amount * 2
      const jy = k === 0 ? 0 : (rand() - 0.5) * amount * 2
      d += (d ? 'L' : 'M') + pt(ax + (bx - ax) * u + jx, ay + (by - ay) * u + jy)
    }
  }
  return d + 'Z'
}

/** A gouge, pointed at both ends — lengthening from (x1, y1) as `k` goes to 1. */
function lens(x1, y1, x2, y2, w, k = 1) {
  if (k <= 0) return ''
  const ex = x1 + (x2 - x1) * k
  const ey = y1 + (y2 - y1) * k
  const mx = (x1 + ex) / 2
  const my = (y1 + ey) / 2
  const L = Math.hypot(ex - x1, ey - y1) || 1
  const ww = w * Math.min(1, 0.35 + k)
  const nx = (-(ey - y1) / L) * ww * 2
  const ny = ((ex - x1) / L) * ww * 2
  return `M${pt(x1, y1)}Q${pt(mx + nx, my + ny)} ${pt(ex, ey)}Q${pt(mx - nx, my - ny)} ${pt(x1, y1)}Z`
}

/** A ray from a centre, shooting out to `r2` as `k` goes to 1. */
function wedge(cx, cy, r1, r2, deg, half, k = 1) {
  if (k <= 0) return ''
  const a = (deg * Math.PI) / 180
  const h = (half * Math.PI) / 180
  const rr = r1 + (r2 - r1) * k
  return `M${pt(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)}L${pt(cx + Math.cos(a - h) * rr, cy + Math.sin(a - h) * rr)}L${pt(cx + Math.cos(a + h) * rr, cy + Math.sin(a + h) * rr)}Z`
}

/** A four-point glint: two crossed gouges. */
const glint = (x, y, s) => (s > 0.5 ? lens(x - s, y, x + s, y, Math.max(1, s * 0.16)) + lens(x, y - s, x, y + s, Math.max(1, s * 0.16)) : '')

/**
 * Rows of scallops, one path per row — cut along its length with a dash.
 * One path per row because a dash restarts at every subpath: as one path of
 * three rows, pathLength="1" made each row complete a third of the way in.
 */
function scallopPath(x0, x1, y0, y1, seed, o = {}) {
  const { width = 46, rise = 13, gap = 26 } = o
  const rand = rng(seed)
  const rows = []
  let d = ''
  let row = 0
  for (let y = y0; y < y1; y += gap, row++) {
    const w = width * (0.75 + row / 12)
    // `x0` may be a function of the row's height — the waterline of a beach.
    let x = (typeof x0 === 'function' ? x0(y) + 20 : x0) - (typeof x0 === 'function' ? 0 : (row % 2) * w * 0.5) - rand() * 10
    d = `M${pt(x, y)}`
    while (x < x1) {
      d += `q${I(w / 2)} ${I(-rise)} ${I(w)} 0`
      x += w
    }
    rows.push(d)
  }
  return rows
}

const fillD = (d, colour, extra = '') => (d ? `<path d="${d}" fill="${colour}"${extra}/>` : '')
const penD = (d, colour, w, extra = '') => (d ? `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${r(w)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>` : '')
const op = (o) => (o < 0.999 ? ` opacity="${r(o, 3)}"` : '')

/** A stroke cut along its length: `k` of it is down. pathLength, so no DOM measurement. */
const cutStroke = (d, colour, w, k) => {
  if (k <= 0) return ''
  if (k >= 1) return penD(d, colour, w)
  return penD(d, colour, w, ` pathLength="1" stroke-dasharray="${r(k, 3)} 1"`)
}

/** A motif from the library, cut as lines, drawn on with `k`. */
function carvedMotif(name, cx, cy, size, colour, weight, k = 1, extra = '') {
  if (k <= 0) return ''
  const s = size / 100
  const body = k >= 1 ? motifBody(name) : motifBody(name).replace(/<(path|circle|rect)\s/g, `<$1 pathLength="1" stroke-dasharray="${r(k, 3)} 1" `)
  return `<g transform="translate(${I(cx - size / 2)} ${I(cy - size / 2)}) scale(${r(s, 3)})" fill="none" stroke="${colour}" stroke-width="${r(weight / s, 2)}" stroke-linecap="round" stroke-linejoin="round"${extra}>${body}</g>`
}

/** A pine: stacked tiers, one flank nicked. `k` cuts it up out of the ground, bottom tier first. */
function pine(x, ground, h, seed, k = 1) {
  if (k <= 0) return ''
  const rand = rng(seed)
  const tiers = 4
  let d = `M${pt(x - 5, ground - h * 0.18)}h10V${I(ground + 2)}h-10Z`
  let cuts = ''
  for (let j = tiers - 1; j >= 0; j--) {
    const kk = clamp01(k * (tiers + 0.5) - (tiers - 1 - j))
    const top = ground - h + (h * 0.78 * j) / tiers
    const bottom = top + h * 0.36
    const half = h * (0.14 + 0.08 * j)
    const nick = 1.8 + rand()
    if (kk <= 0) continue
    const apex = bottom - (bottom - top) * kk
    d += rough([[x, apex], [x + half * (0.4 + 0.6 * kk), bottom], [x - half * (0.4 + 0.6 * kk), bottom]], 2, seed + j, 18)
    if (kk >= 1) cuts += lens(x - half * 0.55, bottom - 6, x - half * 0.1, top + (bottom - top) * 0.45, nick)
  }
  return fillD(d, INK) + fillD(cuts, PAPER)
}

/* ══ THE FINALE'S WORLD — fixed coordinates ════════════════════════════
 *
 * Near-layer x. Everything before the sage is placed from the plan, to the
 * left of these; these are where the page's harbour-to-stage window was built.
 */
const W = {
  sage: -1100, // "the wind through the sage": the camera centre on that line
  shore: -380, // where the sage runs down to the water
  harbour: 640, // the view over the water
  rockFrom: 1150,
  lighthouse: 1470,
  bandFrom: 1840, // the paper band behind the crowd and, later, the mist
  stage: 2500, // the performer
  stageL: 2120,
  stageR: 2880,
  crowdFrom: 1930,
  crowdTo: 2810,
  ridgeFrom: 2840,
}
const STAGE_TOP = 372
const SEA_TOP = 440
/** How far the waterline runs out along the foot of the plate: the beach. */
const BEACH = 200
const waterline = (y) => W.shore - 40 + ((y - SEA_TOP) / (710 - SEA_TOP)) * (BEACH + 40)
const BAND_TOP = (x) => (x < W.shore - 320 ? 402 : x < W.shore + 200 ? lerp(402, SEA_TOP + 4, clamp01((x - W.shore + 320) / 280)) : x < 2040 ? lerp(560, 444, clamp01((x - 1840) / 200)) : x < 2950 ? 444 : x > 3350 ? 402 : lerp(444, 402, (x - 2950) / 400))
const BAND_BOT = (x) => (x < W.shore + 200 || x >= 2950 ? 596 : 580)

const TILE = 1600
const CACHE = new Map()
const cached = (key, build) => {
  if (!CACHE.has(key)) CACHE.set(key, build())
  return CACHE.get(key)
}

/** Tiles whose world span meets [a, b]. */
function tilesIn(a, b) {
  const out = []
  for (let i = Math.floor(a / TILE); i <= Math.floor(b / TILE); i++) out.push(i)
  return out
}

/* ── The harbour: sea, headland, lighthouse — built once ──────────────── */
const HARBOUR = (() => {
  const rockTop = [[W.rockFrom, 700], [W.rockFrom + 40, 470], [1260, 420], [1380, 396], [1450, 386], [1520, 388], [1640, 400], [1760, 430], [1860, 470], [1960, 540], [2010, 700]]
  const rock = rough(rockTop, 4, 21, 22)
  const rim = 'M' + rockTop.slice(1, -1).map(([x, y]) => pt(x, y - 3)).join('L')
  const rand = rng(24)
  let face = ''
  for (let i = 0; i < 22; i++) {
    const x = W.rockFrom + 60 + rand() * 740
    const y = 450 + rand() * 200
    face += lens(x, y, x + 30 + rand() * 40, y + 20 + rand() * 20, 2.2)
  }
  const lx = W.lighthouse
  const tower = `M${pt(lx - 34, 388)}L${pt(lx - 20, 248)}H${I(lx + 20)}L${pt(lx + 34, 388)}Z`
  const bands = `M${pt(lx - 27, 318)}H${I(lx + 27)}V336H${I(lx - 29)}ZM${pt(lx - 22, 270)}H${I(lx + 22)}V286H${I(lx - 24)}Z`
  const lantern = `M${pt(lx - 20, 214)}H${I(lx + 20)}V248H${I(lx - 20)}Z`
  const roof = `M${pt(lx - 28, 216)}L${pt(lx, 186)}L${pt(lx + 28, 216)}Z`
  return {
    sea: fillD(rough([[W.shore - 40, SEA_TOP], [2060, SEA_TOP - 4], [2060, 710], [W.shore + BEACH, 710]], 3, 22, 40), SLATE),
    rock: fillD(rock, INK) + penD(rim, PAPER, 4) + fillD(face, PAPER, ' opacity="0.8"'),
    lighthouse: fillD(tower, PAPER) + fillD(bands + roof, INK) + fillD(lantern, PAPER),
    scallopsA: scallopPath(waterline, 1180, 470, 530, 42),
    scallopsB: scallopPath(waterline, 1200, 556, 700, 43, { gap: 30 }),
  }
})()

/* ── The stage and its crowd ──────────────────────────────────────────── */
const STAGE = (() => {
  const stage = rough([[W.stageL, STAGE_TOP], [W.stageR, STAGE_TOP], [W.stageR + 50, 420], [W.stageL - 50, 420]], 2, 51, 30)
  const lip = lens(W.stageL + 4, STAGE_TOP + 2, W.stageR - 4, STAGE_TOP + 2, 2.4)
  return {
    halo: circle(W.stage, 272, 104, { fill: PAPER }),
    stage: fillD(stage, INK) + fillD(lip, PAPER),
    pool: `<ellipse cx="${W.stage}" cy="${STAGE_TOP + 4}" rx="300" ry="34" fill="${RED}"/>`,
    rays: [90, 76, 104, 64, 116, 52, 128, 84, 96, 70, 110, 58, 122, 46, 134],
  }
})()

const CROWD_ROWS = [
  { y: 482, r: 15, gap: 50, off: 12 },
  { y: 530, r: 21, gap: 66, off: 40 },
  { y: 590, r: 28, gap: 84, off: 0 },
]

/* ══ THE PLAN — times and places, solved once per score ════════════════ */

/*
 * Keyframes eased with a half-cosine (easeCamera), not the cubic: the cubic
 * peaks at three times its average speed, and a two-thousand-unit pan over
 * 1.6 s hit 120 units a frame at 30 fps.
 */
function sineGlide(now, keys) {
  if (now <= keys[0].t) return keys[0].v
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (now <= b.t) return lerp(a.v, b.v, easeCamera(ramp(now, a.t, b.t)))
  }
  return keys[keys.length - 1].v
}

/** A value between [t, v] keys, smoothstepped between each pair: continuous, and flat at every key. */
function schedule(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1]
    for (let i = 0; i < keys.length - 1; i++) {
      const [ta, va] = keys[i]
      const [tb, vb] = keys[i + 1]
      if (t <= tb) return lerp(va, vb, smooth((t - ta) / Math.max(tb - ta, 1e-6)))
    }
    return keys[keys.length - 1][1]
  }
}

const STEP = 0.01
const table = (arr) => (t) => {
  const f = clamp01(t / STEP / (arr.length - 1)) * (arr.length - 1)
  const i = Math.min(arr.length - 2, Math.floor(f))
  return lerp(arr[i], arr[i + 1], f - i)
}

const PLANS = new WeakMap()
let planCount = 0

function planFor(score) {
  if (PLANS.has(score)) return PLANS.get(score)
  const id = ++planCount
  const sec = (sid) => score.sections.find((s) => s.id === sid)
  const inSec = (sid) => score.lines.filter((l) => l.section === sid)
  const wt = (line, re) => {
    const w = line?.words.find((x) => re.test(x.text))
    if (!w) throw new Error(`relief: no word ${re} in "${line?.text}"`)
    return w.t
  }
  const v1 = inSec('verse-1')
  const v2 = inSec('verse-2')
  const v3 = inSec('verse-3')
  const c1 = inSec('chorus-1')
  const c2 = inSec('chorus-2')
  const c3 = inSec('chorus-3')
  const S = { v1: sec('verse-1'), c1: sec('chorus-1'), brk: sec('break'), v2: sec('verse-2'), c2: sec('chorus-2'), solo: sec('solo'), v3: sec('verse-3'), c3: sec('chorus-3'), outro: sec('outro') }

  const T = {
    headed: wt(v1[0], /^headed/), adventure1: wt(v1[0], /^adventure/),
    lose: wt(v1[1], /^lose/),
    splend: wt(v1[2], /^splendorous/),
    earth: wt(v1[4], /^Earth/), water: wt(v1[4], /^water/), iron: wt(v1[4], /^iron/),
    ebony: wt(v1[5], /^Ebony/), ivory: wt(v1[5], /^ivory/), bone: wt(v1[5], /^bone/),
    stone: wt(v1[6], /^Stone/), these: wt(v1[6], /^these/), beauties: wt(v1[6], /^beauties/), are: wt(v1[6], /^are/), sleeping: wt(v1[6], /^sleeping/),
    so1: c1[0].words[0].t, run1: wt(c1[0], /^running/),
    conj: wt(v2[0], /^conjecture/), goals: wt(v2[1], /^goals/), creates: wt(v2[2], /^creates/), pressure: wt(v2[2], /^pressure/),
    old: wt(v2[3], /^old/), stories: wt(v2[4], /^stories/), taught: wt(v2[5], /^taught/), revealing: wt(v2[6], /^revealing/),
    songs: wt(v2[7], /^songs/),
    run2: wt(c2[0], /^running/),
    headed3: wt(v3[0], /^headed/), adventure3: wt(v3[0], /^adventure/),
    end: wt(v3[1], /^end/), up: wt(v3[1], /^up/), know: wt(v3[1], /^know/),
    treasures: wt(v3[2], /^treasures/), silver: wt(v3[3], /^silver/), gold: wt(v3[3], /^gold/),
    glaciers: wt(v3[4], /^glaciers/), gardens: wt(v3[4], /^gardens/), grottos: wt(v3[4], /^grottos/),
    sound: wt(v3[5], /^sound/), wind: wt(v3[5], /^wind/),
  }
  const words = (lines) => lines.flatMap((l) => l.words)
  const WORDS = {
    splendid: words([v1[2], v1[3]]), gods: v1[3].words, alone: v1[7].words,
    c1: words(c1), c2: words(c2), c3: words(c3), v2: words(v2),
  }

  /* ── The finale, as it was built for the page's window ─────────────── */
  const sage = v3[5]
  const hush = v3[6]
  const roar = v3[7]
  const wildT = wt(c3[0], /^wild/)
  const stageT = wt(roar, /^stage/)
  const runFrom = S.c3.from
  // The run accelerates from standing — velocity RS·(1 − e^(−τ/A)) — and its
  // speed is solved so the singer reaches the stage's edge just as "wild" is
  // sung, and leaps.
  const A = 0.4
  const tauLeap = Math.max(1, wildT - 0.12 - runFrom)
  const RS = (W.stageR - W.stage) / (tauLeap - A * (1 - Math.exp(-tauLeap / A)))
  const leapAt = runFrom + tauLeap
  const LEAP = 0.75
  const sageT = sage.start
  const hushCut = cutIn(score, hush)
  const roarCut = cutIn(score, roar)
  const hollowT = hush.words.at(-1).t
  const at = (x, tt) => x - DRIFT * tt
  // Holds the sage while the line is sung and leaves on its last words, so
  // "sage" is sung as the view passes the sage and comes down to the water.
  const leaveSage = sage.end - 0.95
  const atHarbour = Math.max(hushCut - 0.2, leaveSage + 2.4)
  const H = [
    { t: 0, v: at(W.sage, sageT) },
    { t: leaveSage, v: at(W.sage, sageT) },
    { t: atHarbour, v: at(W.harbour, atHarbour) },
    // Leaves the harbour while "hollow" is still ringing, so it is at the
    // stage by "roar" without having to hurry.
    { t: hollowT + 0.5, v: at(W.harbour, atHarbour) },
    { t: roarCut + 1.4, v: at(W.stage - 40, roarCut + 1.4) },
  ]
  const keyed = (t) => DRIFT * t + sineGlide(t, H)

  /* ── The runner: a velocity schedule, integrated ─────────────────────
   *
   * He sits until "So", runs on "running", slows to a walk in the forest,
   * walks the town, stops at the guitar, runs out of town, climbs the pass,
   * and walks down it at exactly the camera's drift — so that by the sage
   * following him and holding the finale's first view are the same thing,
   * and the handover between them is invisible.
   */
  const vAt = schedule([
    [0, 0], [T.run1 - 0.05, 0], [T.run1 + 0.9, RUN_V],
    [S.brk.from + 1.6, RUN_V], [S.brk.from + 6.1, WALK_V],
    [v2[7].start - 1.2, WALK_V], [v2[7].start - 0.1, 0],
    [T.run2 - 0.05, 0], [T.run2 + 0.9, RUN_V],
    [S.solo.from + 1.5, RUN_V], [S.solo.from + 4.5, CLIMB_V],
    [S.v3.from, CLIMB_V], [S.v3.from + 3.5, DRIFT], [1e4, DRIFT],
  ])
  const followFrom = T.run1 + 0.45
  const n = Math.ceil((score.duration + 4) / STEP)
  const D = new Float64Array(n + 1)
  const F = new Float64Array(n + 1)
  const keep = 1 - Math.exp(-STEP / 0.7)
  let lead = 100
  F[0] = lead
  for (let i = 0; i < n; i++) {
    const t = i * STEP
    const v = vAt(t)
    const dx = ((v + vAt(t + STEP)) / 2) * STEP
    D[i + 1] = D[i] + dx
    // Room ahead of him, more when he runs; eased, so it never jerks the camera.
    const want = v < WALK_V ? 100 : 100 + 160 * smooth((v - WALK_V) / 120)
    const dLead = (want - lead) * keep
    lead += dLead
    // The camera follows him, but never slower than the drift: when he stops,
    // or the lead shrinks as he slows, it keeps going and he drifts back in frame.
    F[i + 1] = F[i] + (t >= followFrom ? Math.max(DRIFT * STEP, dx + dLead) : dx + dLead)
  }
  const dAt = table(D)
  const fAt = table(F)
  const XA = W.sage - fAt(sageT)
  const walkerX = (t) => XA + dAt(t)
  const follow = (t) => XA + fAt(t)

  /* ── Before he wakes: drift plus one eased move per line ─────────── */
  // Longer at the end of the verse, so there is a cliff and a moor between the sea and the sleeper.
  const MOVES = [200, 200, 200, 200, 280, 400, 320]
  const moves = v1.slice(1).map((l, i) => [l.start - 0.5, MOVES[i]])
  const movesAt = (t) => moves.reduce((s, [m, dx]) => s + dx * easeCamera(ramp(t, m, m + 1.4)), 0)
  const joinAt = T.so1 + 0.95
  const B0 = follow(joinAt) - DRIFT * joinAt - movesAt(joinAt)
  const base = (t) => B0 + DRIFT * t + movesAt(t)

  const inFrom = T.so1 + 0.25
  const outFrom = leaveSage - 1.8
  const camRaw = (t) => {
    let c = lerp(base(t), follow(t), easeCamera(ramp(t, inFrom, inFrom + 1.4)))
    c = lerp(c, keyed(t), easeCamera(ramp(t, outFrom, outFrom + 1.4)))
    return c
  }

  const plan = {
    id, S, T, WORDS, v1, v2, v3, c1, c2, c3, sage, hush, roar, wildT, stageT, runFrom, A, RS, leapAt, LEAP, H, hushCut, roarCut, hollowT,
    vAt, dAt, walkerX, camRaw, sageT,
  }

  /* ── Places, solved from where the camera is on each word ────────── */
  const cam = camRaw
  const X = walkerX
  const P = {}
  P.seaFrom = cam(0) - 1100
  P.land = cam(T.iron) + 60
  P.sleeper = X(0)
  P.platEnd = P.land + 660
  P.moorEnd = X(T.run1 + 1.6) + 450
  // [offset from the sleeper, word it rises on, width, height]
  P.stones = [[-560, T.stone, 180, 78], [-330, T.beauties, 150, 64], [-120, T.these, 210, 104], [250, T.are, 170, 74]]
  P.fossil = Math.min(cam(T.bone) + 230, P.platEnd - 140)
  P.forest = [X(T.run1 + 6), X(S.brk.to - 3.5)]
  P.town0 = cam(S.v2.from) - 380
  P.town1 = X(T.run2 + 0.8) + 450
  P.tower = cam(T.pressure) + 300
  P.signs = [[T.conj, 'hourglass'], [T.goals, 'key'], [T.old, 'hourglass'], [T.stories, 'book'], [T.taught, 'book']].map(([tt, name]) => ({ t: tt, name, x: cam(tt) + 230 }))
  P.door = cam(T.revealing) + 200
  P.guitar = cam(T.songs) + 230
  P.apex = X(S.solo.from + 20)
  P.hw = 1100
  P.signpost = cam(T.end) + 280
  P.cave = cam(T.grottos) + 440
  P.sageFrom = cam(T.sound) - 700
  // Pines cut up on the chorus's "into … the wild", ahead of him.
  P.chorusPines = [[c1, 0], [c2, 1]].flatMap(([lines, k]) => {
    const ws = lines[0].words.slice(-3)
    return ws.map((w, j) => ({ t: w.t, x: X(w.t) + 430 + j * 150 + k * 60, h: 150 + j * 45 }))
  })
  plan.P = P

  /* Ground height, near layer. One function for the whole film, so the feet, the pines and the trail agree. */
  const wavy = (x) => 598 + 8 * Math.sin(x / 230) + 5 * Math.sin(x / 91 + 1.3)
  const band = (x, a, b, e) => smooth((x - (a - e)) / e) * (1 - smooth((x - b) / e))
  plan.groundY = (x) => {
    let y = wavy(x)
    y = lerp(y, 600, band(x, P.town0 - 150, P.town1 + 150, 200))
    const d = (x - P.apex) / P.hw
    if (Math.abs(d) < 1) y -= 230 * (0.5 + 0.5 * Math.cos(Math.PI * d))
    if (x < P.moorEnd + 320) {
      y = lerp(y, 574 + 4 * Math.sin(x / 160), 1 - smooth((x - P.moorEnd) / 320))
      y = lerp(y, 418 + 3 * Math.sin(x / 120), 1 - smooth((x - P.platEnd) / 320))
    }
    return y
  }

  /* The chorus that cuts each stretch of the range: whichever chorus has it on screen. */
  const spans = [[S.c1, WORDS.c1], [S.c2, WORDS.c2], [S.c3, WORDS.c3]].map(([s, ws]) => {
    let lo = Infinity
    let hi = -Infinity
    for (let t = s.from; t <= s.to; t += 0.25) {
      const v = cam(t) * MID - 800
      lo = Math.min(lo, v - 40)
      hi = Math.max(hi, v + 1640)
    }
    return { lo, hi, words: ws }
  })
  plan.gougeWord = (gx, gi) => {
    for (const s of spans) if (gx >= s.lo && gx <= s.hi) return s.words[((gi % s.words.length) + s.words.length) % s.words.length].t
    return gx < spans[0].lo ? Infinity : -Infinity
  }

  plan.world = buildWorld(plan)
  PLANS.set(score, plan)
  return plan
}

/* ══ THE WORLD, built once per plan ════════════════════════════════════ */

function buildWorld(plan) {
  const { P, T, S, WORDS, groundY } = plan
  const world = {}

  /* The sea of the first verse: calm rows, and the rows "water" cuts. */
  world.sea = fillD(rough([[P.seaFrom, SEA_TOP], [P.platEnd + 60, SEA_TOP - 3], [P.platEnd + 60, 710], [P.seaFrom, 710]], 3, 81, 40), SLATE)
    + scallopPath(P.seaFrom, P.platEnd, 470, 520, 82, { gap: 44, width: 60, rise: 10 }).map((d) => penD(d, PAPER, 2.4, ' opacity="0.7"')).join('')
  const cutFrom = plan.camRaw(T.water) - 880
  world.waves = scallopPath(cutFrom, P.land + 200, 548, 700, 83, { gap: 28 })
  world.waveFrom = cutFrom

  /* Gems glinting in the water, one on each word of "splendorous things the gods hid". */
  world.glints = []
  const rand = rng(84)
  for (let i = 0; i < 18; i++) {
    const w = WORDS.splendid[i % WORDS.splendid.length]
    world.glints.push({ x: plan.camRaw(w.t) - 650 + rand() * 1250, y: 468 + rand() * 220, s: 9 + rand() * 11, t: w.t + (i >> 3) * 0.06, ph: rand() * 6 })
  }

  /* Strata in the cliff: rows cut along, left to right, on "Ebony" and "ivory". */
  world.strata = []
  for (let y = 452, row = 0; y < 700; y += 22, row++) {
    const r2 = rng(90 + row)
    let d = `M${pt(P.land + 30 + r2() * 40, y)}`
    for (let x = P.land + 90; x < P.platEnd - 40; x += 120) d += `Q${pt(x - 60, y + (r2() - 0.5) * 10)} ${pt(x, y + (r2() - 0.5) * 6)}`
    world.strata.push({ d, t: (row % 2 ? T.ivory : T.ebony) + row * 0.04, w: row % 2 ? 7 : 2.6 })
  }

  /* Stones, asleep. */
  world.stones = P.stones.map(([dx, t, w, h], i) => {
    const x = P.sleeper + dx
    const g = groundY(x) + 6
    const rr = rng(100 + i)
    const pts = []
    for (let k = 0; k <= 10; k++) {
      const a = Math.PI * (k / 10)
      pts.push([x - Math.cos(a) * w / 2 * (0.94 + rr() * 0.1), g - Math.sin(a) ** 0.8 * h * (0.92 + rr() * 0.12)])
    }
    pts.push([x + w / 2, g + 40], [x - w / 2, g + 40])
    const body = fillD(rough(pts, 2, 110 + i, 22), INK)
    const rim = penD('M' + pts.slice(1, 8).map(([a, b]) => pt(a, b + 5)).join('L'), PAPER, 3)
    // A closed eye, the one mark that says asleep.
    const ex = x + (i % 2 ? -w * 0.22 : w * 0.2)
    const ey = g - h * 0.5
    const eye = penD(`M${pt(ex - 13, ey)}Q${pt(ex, ey + 9)} ${pt(ex + 13, ey)}`, PAPER, 3.4)
    return { x, w, h, t, svg: body + rim + eye }
  })

  /* The town: row houses, a clock tower, the signs, the door, the guitar window. */
  world.houses = []
  world.windows = []
  const hr = rng(120)
  const special = [P.tower, P.door, P.guitar]
  let towerDone = false
  for (let x = P.town0; x < P.town1;) {
    const room = P.tower - 78 - x
    if (!towerDone && room < 80) {
      world.houses.push(tower(P.tower))
      towerDone = true
      x = P.tower + 78
      continue
    }
    let w = 170 + hr() * 110
    // The house before the tower fills the gap up to it.
    if (!towerDone && room < w + 110) w = room
    const eaves = 300 + hr() * 60
    const kind = hr()
    const g = 602
    const x0 = x
    const x1 = x + w
    const apex = eaves - 60 - hr() * 50
    const shape = kind < 0.55
      ? [[x0, g + 20], [x0, eaves], [(x0 + x1) / 2, apex], [x1, eaves], [x1, g + 20]]
      : kind < 0.8
        ? [[x0, g + 20], [x0, eaves - 10], [x0 + 14, eaves - 10], [x0 + 14, eaves - 30], [x1 - 14, eaves - 30], [x1 - 14, eaves - 10], [x1, eaves - 10], [x1, g + 20]]
        : [[x0, g + 20], [x0, eaves], [x0 + w * 0.25, eaves], [x0 + w * 0.25, apex + 30], [x0 + w * 0.5, apex], [x0 + w * 0.75, apex + 30], [x0 + w * 0.75, eaves], [x1, eaves], [x1, g + 20]]
    const outline = shape.slice(1, -1)
    let svg = fillD(rough(shape, 1.5, I(x), 24), INK) + penD('M' + outline.map(([a, b]) => pt(a, b + 4)).join('L'), PAPER, 3.2)
    // Upper-floor windows, dark until a word lights them.
    const cols = Math.max(1, Math.floor((w - 30) / 62))
    const rowsY = eaves < 330 ? [eaves + 34, eaves + 110] : [eaves + 40]
    rowsY.forEach((wy) => {
      for (let c = 0; c < cols; c++) {
        const wx = x0 + (w - (cols - 1) * 62) / 2 + c * 62
        if (special.some((s) => Math.abs(s - wx) < 70) && wy > 440) continue
        const idn = I(wx * 7 + wy)
        svg += penD(`M${pt(wx - 16, wy)}h32v46h-32Z`, PAPER, 2)
        world.windows.push({ x: wx, y: wy, idn })
      }
    })
    // A plain door on the ground floor, unless something else lives there.
    if (!special.some((s) => Math.abs(s - (x0 + w * 0.3)) < 110) && !P.signs.some((s) => Math.abs(s.x - (x0 + w * 0.3)) < 80)) {
      const dx = x0 + w * 0.3
      svg += penD(`M${pt(dx - 22, g)}V${I(g - 86)}h44V${I(g)}`, PAPER, 2.6)
    }
    world.houses.push({ x0, x1, svg })
    x = x1 + 4
  }
  // Which word lights each window: one of the verse's words sung while it is on screen, or none.
  world.windows.forEach((win) => {
    const cands = WORDS.v2.filter((w) => Math.abs(win.x - plan.camRaw(w.t) - 120) < 640)
    const k = Math.floor(hash(win.idn) * (cands.length + 4))
    win.t = k < cands.length ? cands[k].t : Infinity
  })

  /* The signpost, the cave's rock, flowers. */
  const sg = groundY(P.signpost)
  world.post = fillD(`M${pt(P.signpost - 6, sg + 6)}V${I(sg - 196)}h12V${I(sg + 6)}Z`, INK)
  world.postY = sg
  const cg = groundY(P.cave)
  world.caveY = cg
  world.rock = fillD(rough([[P.cave - 240, cg + 20], [P.cave - 200, cg - 70], [P.cave - 120, cg - 150], [P.cave - 10, cg - 190], [P.cave + 110, cg - 160], [P.cave + 200, cg - 90], [P.cave + 250, cg + 20]], 3, 130, 24), INK)
  world.flowers = []
  for (let i = 0; i < 8; i++) {
    const x = plan.camRaw(T.gardens) - 420 + i * 70 + hash(i + 40) * 30
    world.flowers.push({ x, y: groundY(x), s: 56 + hash(i + 50) * 26, t: T.gardens + i * 0.05 })
  }

  /* Pines along the ground, cached by tile with everything else static. */
  world.pineOK = (x) =>
    !(x < P.moorEnd) &&
    !(x > P.town0 - 140 && x < P.town1 + 60) &&
    !(x > W.shore - 60 && x < 3200) &&
    !(x > P.sageFrom - 60 && x < 3200) &&
    Math.abs(x - P.signpost) > 130 &&
    Math.abs(x - P.cave) > 320 &&
    !P.chorusPines.some((c) => Math.abs(x - c.x) < 70)
  world.inForest = (x) => x > P.forest[0] && x < P.forest[1]
  return world
}

/** The clock tower: a tall house with a face that the verse carves. */
function tower(x) {
  const g = 602
  const shape = [[x - 64, g + 20], [x - 64, 190], [x - 74, 190], [x, 96], [x + 74, 190], [x + 64, 190], [x + 64, g + 20]]
  const svg = fillD(rough(shape, 1.5, I(x) + 3, 24), INK) + penD('M' + shape.slice(1, -1).map(([a, b]) => pt(a, b + 4)).join('L'), PAPER, 3.2)
    + penD(`M${pt(x - 18, g)}V${I(g - 100)}q18 -24 36 0V${I(g)}`, PAPER, 2.6)
  return { x0: x - 74, x1: x + 74, svg, tower: true }
}

/* ── The sky, far layer. Sparse gouges everywhere, always there. ─────── */
function skyTile(i) {
  return cached(`sky-${i}`, () => {
    const rand = rng(1000 + i)
    let d = ''
    const x0 = i * TILE
    for (let y = 70; y < 360; y += 26 + rand() * 10) {
      let x = x0 + rand() * 60
      while (x < x0 + TILE) {
        const len = 50 + rand() * 160
        if (rand() < 0.22) d += lens(x, y, x + len, y + (rand() - 0.5) * 3, 1.8 + rand() * 1.2)
        x += len + 20 + rand() * 60
      }
    }
    const stars = []
    for (let k = 0; k < 30; k++) stars.push({ x: x0 + rand() * TILE, y: 60 + rand() * 300, s: 3 + rand() * 5, h: rand() })
    return { svg: fillD(d, PAPER, ' opacity="0.85"'), stars }
  })
}

/* ── The range, mid layer. Ink peaks with a cut along the ridge; their flank gouges are chorus cuts. ── */
function rangeTile(i) {
  return cached(`range-${i}`, () => {
    const rand = rng(2000 + i)
    const x0 = i * TILE
    const base = 406
    const peaks = []
    for (let x = x0 - 60; x < x0 + TILE + 200; x += 220 + rand() * 120) peaks.push([x, 210 + rand() * 90])
    const outline = [[x0 - 200, base]]
    peaks.forEach(([x, y], k) => {
      if (k > 0) {
        const [px, py] = peaks[k - 1]
        outline.push([(px + x) / 2, Math.max(py, y) + (base - Math.max(py, y)) * 0.45])
      }
      outline.push([x, y])
    })
    outline.push([x0 + TILE + 260, base], [x0 + TILE + 260, base + 30], [x0 - 200, base + 30])
    const gouges = []
    peaks.forEach(([px, py], k) => {
      const left = k > 0 ? outline[2 * k] : [px - 200, base]
      for (let j = 1; j <= 6; j++) {
        const f = j / 7
        const ax = px + (left[0] - px) * f
        const ay = py + (left[1] - py) * f
        const len = (base - ay) * (0.34 + rand() * 0.2)
        gouges.push([ax + 6, ay + 4, ax + len * 0.55 + 6, ay + len, 3.2 * (0.7 + rand() * 0.5)])
      }
    })
    const ridge = 'M' + outline.slice(1, -3).map(([x, y]) => pt(x, y + 4)).join('L')
    return { body: fillD(rough(outline, 3, 2100 + i, 30), INK) + penD(ridge, PAPER, 2.6, ' opacity="0.75"'), gouges, peaks, outline }
  })
}

/* ── The ground, near layer: the band that never moves, and the land that rises ── */
function groundTile(plan, i) {
  return cached(`ground-${plan.id}-${i}`, () => {
    const { P, groundY, world } = plan
    const x0 = i * TILE
    const x1 = x0 + TILE
    const bandParts = []
    const landParts = []
    const rand = rng(3000 + i)
    // The paper band: the horizon over the sea, the backdrop of the land, the mist in front of the range.
    for (const [a, b] of [[-99999, W.shore + BEACH + 60], [W.bandFrom, 99999]]) {
      const lo = Math.max(a, x0 - 4)
      const hi = Math.min(b, x1 + 4)
      if (lo >= hi) continue
      const top = []
      for (let x = lo; x <= hi; x += 80) top.push([x, BAND_TOP(x)])
      top.push([hi, BAND_TOP(hi)])
      const bottom = top.slice().reverse().map(([x]) => [x, BAND_BOT(x) + 8])
      bandParts.push(fillD(rough([...top, ...bottom], 2, 3100 + i, 40), PAPER))
      let mist = ''
      for (let y = 424; y < 566; y += 30 + rand() * 6) {
        let x = Math.max(lo, W.ridgeFrom) + rand() * 40
        while (x < hi) {
          const len = 60 + rand() * 150
          if (rand() < 0.3) mist += lens(x, y, Math.min(x + len, hi), y + (rand() - 0.5) * 3, 1.8)
          x += len + 30 + rand() * 60
        }
      }
      bandParts.push(fillD(mist, INK, ' opacity="0.8"'))
    }
    // The ground: ink with grass nicks, from the cliff that rises out of the sea to the beach.
    for (const [a, b] of [[P.land, W.shore + BEACH + 60], [W.ridgeFrom, 99999]]) {
      const lo = Math.max(a, x0 - 4)
      const hi = Math.min(b, x1 + 4)
      if (lo >= hi) continue
      const top = []
      // The cliff's seaward face, on a slant.
      if (lo === a && a === P.land) top.push([lo - 150, BOTTOM + 20], [lo - 40, groundY(lo) + 60])
      for (let x = lo; x <= hi; x += 40) top.push([x, groundY(x)])
      top.push([hi, groundY(hi)])
      landParts.push(fillD(rough([...top, [hi, BOTTOM + 20], [top[0][0], BOTTOM + 20]], 2, 3200 + i, 30), INK))
      let grass = ''
      for (let x = lo; x < hi; x += 22 + rand() * 18) grass += lens(x, groundY(x) + 12 + rand() * 20, x + 10 + rand() * 12, groundY(x) + 6 + rand() * 30, 1.8)
      landParts.push(fillD(grass, PAPER))
    }
    // Pines, denser in the forest.
    for (let x = x0 + rand() * 120; x < x1;) {
      const forest = world.inForest(x)
      if (world.pineOK(x) && x > P.land) landParts.push(pine(x, groundY(x) + 4, forest ? 110 + rand() * 150 : 80 + rand() * 90, I(x)))
      x += forest ? 55 + rand() * 80 : 150 + rand() * 230
    }
    // Sage, in its own stretch — ink, because it stands against the paper band.
    for (let x = Math.max(x0, P.sageFrom); x < Math.min(x1, W.shore - 120); x += 120 + rand() * 90) {
      landParts.push(carvedMotif('sprig', x, groundY(x) - 34, 70 + rand() * 40, INK, 5))
    }
    return { band: bandParts.join(''), land: landParts.join('') }
  })
}

/* ══ PER-FRAME PARTS ═══════════════════════════════════════════════════ */

/** The camera: the plan's, and from the last chorus the singer's. */
function cameraAt(plan, now) {
  const keyed = plan.camRaw(now)
  const s = singerAt(plan, now)
  const w = easeInOut(ramp(now, plan.runFrom - 0.35, plan.runFrom + 1.05))
  return lerp(keyed, s.x + 220, w)
}

/** Where the singer is in the finale: x, and the height of whatever they are standing on. */
function singerAt(plan, now) {
  const { runFrom, A, RS, leapAt, LEAP } = plan
  if (now < runFrom) return { x: W.stage, ground: STAGE_TOP, running: false }
  const tau = now - runFrom
  const x = W.stage + RS * (tau - A * (1 - Math.exp(-tau / A)))
  if (now < leapAt) return { x, ground: STAGE_TOP, running: true }
  const u = clamp01((now - leapAt) / LEAP)
  const landY = plan.groundY(x)
  // A leap is a parabola off the stage onto the ridge: continuous in height,
  // and eased into the ground so the landing is not a jolt.
  const y = lerp(STAGE_TOP, landY, u * u * (3 - 2 * u)) - Math.sin(Math.PI * u) * 70
  return { x, ground: u < 1 ? y : landY, running: true }
}

/** A pose blended between two, so a figure moves continuously. */
function blend(a, b, u) {
  const mix = (p, q) => lerp(p, q, u)
  return {
    lean: mix(a.lean ?? 0, b.lean ?? 0),
    armB: [mix(a.armB[0], b.armB[0]), mix(a.armB[1], b.armB[1])],
    armF: [mix(a.armF[0], b.armF[0]), mix(a.armF[1], b.armF[1])],
    legB: [mix(a.legB[0], b.legB[0]), mix(a.legB[1], b.legB[1])],
    legF: [mix(a.legF[0], b.legF[0]), mix(a.legF[1], b.legF[1])],
    lift: mix(a.lift ?? 0, b.lift ?? 0),
  }
}

/* A walk: the walk pose, a passing pose, the walk mirrored, a passing pose. */
const WK = POSES.walk
const WALK = [
  WK,
  { lean: 4, armB: [-4, 14], armF: [4, 16], legB: [4, 26], legF: [-2, 2], lift: 0.012 },
  { lean: 4, armB: WK.armF, armF: WK.armB, legB: WK.legF, legF: WK.legB },
  { lean: 4, armB: [4, 16], armF: [-4, 14], legB: [-2, 2], legF: [4, 26], lift: 0.012 },
]

/** A cycle at a continuous phase, smoothstepped inside each step so the limbs do not move like a puppet's. */
function cycleAt(poses, phase) {
  const i = Math.floor(phase)
  const f = phase - i
  const m = poses.length
  return blend(poses[((i % m) + m) % m], poses[(((i + 1) % m) + m) % m], f * f * (3 - 2 * f))
}

/** The run cycle on the click, for the finale's singer: one pose per eighth. */
const runAt = (now) => cycleAt(RUN, (now - 0.03) / 0.25)

/** The walker's pose from his speed, phased by the distance he has covered, so his feet never slide. */
function gait(plan, now, x) {
  const v = plan.vAt(now)
  const d = plan.dAt(now)
  let p = blend(POSES.stand, cycleAt(WALK, d / 22), smooth(v / 25))
  p = blend(p, cycleAt(RUN, d / 37), smooth((v - 70) / 60))
  const slope = (plan.groundY(x + 20) - plan.groundY(x - 20)) / 40
  p.lean -= (Math.atan(slope) * 180) / Math.PI * 0.45
  return p
}

const mixJ = (a, b, u) => {
  const out = {}
  for (const k of Object.keys(a)) out[k] = a[k].map((v, i) => lerp(v, b[k][i], u))
  return out
}

/** A person as a heavy stroke, with a paper knockout under it so it reads against anything. */
function personJ(j, h, knockout = true) {
  const d = strokes(j).map((line) => 'M' + line.map(([a, b]) => pt(a, b)).join('L')).join('')
  const w = h * 0.085
  return (knockout ? penD(d, PAPER, w + 10) + circle(j.head[0], j.head[1], j.head[2] * 1.08 + 5, { fill: PAPER }) : '')
    + penD(d, INK, w) + circle(j.head[0], j.head[1], j.head[2] * 1.08, { fill: INK })
}
const person = (x, ground, h, pose, knockout = true) => personJ(joints(x, ground, h, pose), h, knockout)

/** The crowd: heads bob on the beat; arms go up word by word and stay up. */
function crowd(now, words) {
  let heads = ''
  let arms = ''
  const beat = ((now - 0.03) / 0.5) * Math.PI * 2
  CROWD_ROWS.forEach((base, ri) => {
    let row = base
    for (let x = W.crowdFrom + row.off, k = 0; x < W.crowdTo + 240; x += row.gap, k++) {
      // The crowd thins out past the stage into the ridge rather than ending in a wall.
      const q = clamp01((W.crowdTo + 240 - x) / 300)
      if (q < 0.2) continue
      row = { ...row, r: CROWD_ROWS[ri].r * (0.45 + 0.55 * q) }
      const hy = CROWD_ROWS[ri].y + (1 - q) * (110 - ri * 30) + 3 * Math.sin(beat + k * 0.9 + ri * 1.7)
      heads += `M${pt(x - row.r, hy)}a${row.r} ${row.r} 0 1 1 ${row.r * 2} 0a${row.r} ${row.r} 0 1 1 ${-row.r * 2} 0Z`
      heads += `M${pt(x - row.r * 1.9, BOTTOM + 10)}L${pt(x - row.r * 1.7, hy + row.r * 1.5)}Q${pt(x, hy + row.r * 0.6)} ${pt(x + row.r * 1.7, hy + row.r * 1.5)}L${pt(x + row.r * 1.9, BOTTOM + 10)}Z`
      const h = ((k * 2654435761 + ri * 97) >>> 0) % 100
      // Which word lifts this arm: more arms as the line goes on.
      const wi = Math.floor((h / 100) * (words.length + 2)) - 1
      if (wi < 0 || wi >= words.length) continue
      const up = land(now, words[wi].t, 0.22)
      if (up <= 0) continue
      const sway = Math.sin(beat * 0.5 + k) * row.r * 0.3 * up
      const lean = (h % 2 ? 1 : -1) * row.r * 0.5
      const hx = x - row.r * 1.3 + lean + sway
      const handY = lerp(hy + row.r * 0.8, hy - row.r * 2.6, up)
      arms += `M${pt(x - row.r * 1.1, hy + row.r)}L${pt(lerp(x - row.r * 1.1, hx, up), handY)}`
      if (h % 3 === 0) arms += `M${pt(x + row.r * 1.1, hy + row.r)}L${pt(lerp(x + row.r * 1.1, x + row.r * 1.3 + lean + sway, up), handY)}`
    }
  })
  return fillD(heads, INK) + penD(arms, INK, 11)
}

/** The red sun, on screen: where it is and whether it is up. Red is the journey, so it travels with the film. */
function sunAt(plan, now) {
  const { T, S } = plan
  let y
  if (now < S.v1.from + 3) y = lerp(640, 250, easeOut(ramp(now, 0.4, 14)))
  else if (now < T.so1) y = lerp(250, 720, easeInOut(ramp(now, T.sleeping - 0.2, T.sleeping + 3.8)))
  else if (now < S.solo.from + 20) y = lerp(720, 250, easeOut(ramp(now, T.so1, T.so1 + 5.5))) - 50 * easeInOut(ramp(now, S.v2.from, S.c2.to))
  else y = lerp(200, 740, easeInOut(ramp(now, S.solo.to - 13, S.solo.to - 2)))
  return { x: 1100 + 40 * Math.sin(now / 37), y }
}

/** A compass carved in the sky: ring, points shot out word by word, a needle that is knocked loose. */
function compass(cx, cy, R, now, o) {
  const k = land(now, o.ring, 0.5)
  if (k <= 0) return ''
  let d = ''
  o.points.forEach((t, i) => {
    for (let j = 0; j < 2; j++) d += wedge(cx, cy, R * 1.04, R * (1.55 - (i % 2) * 0.2), -90 + (i * 2 + j) * 45, 5.5, land(now, t + j * 0.06, 0.24))
  })
  let a = -62
  if (now > o.lose) {
    const u = now - o.lose
    a += 540 * (1 - Math.exp(-u / 0.9)) + 38 * Math.sin(u * 1.4)
  }
  const needleK = land(now, o.needle, 0.3)
  const rad = (a * Math.PI) / 180
  const nx = Math.cos(rad) * R * 0.86 * needleK
  const ny = Math.sin(rad) * R * 0.86 * needleK
  const ring = (rr) => `M${pt(cx + rr, cy)}A${I(rr)} ${I(rr)} 0 1 1 ${pt(cx - rr, cy)}A${I(rr)} ${I(rr)} 0 1 1 ${pt(cx + rr, cy)}`
  const dash = k < 1 ? ` pathLength="1" stroke-dasharray="${r(k, 3)} 1"` : ''
  return penD(ring(R), PAPER, 5, dash) + penD(ring(R * 0.72), PAPER, 2.4, dash)
    + fillD(d, PAPER)
    + (needleK > 0 ? fillD(lens(cx - nx * 0.4, cy - ny * 0.4, cx + nx, cy + ny, 5), PAPER) + circle(cx, cy, 7, { fill: PAPER }) : '')
}

/* ══ THE FRAME ════════════════════════════════════════════════════════ */

/**
 * @param {object} o
 * @param {number} o.time   Seconds into the song.
 * @param {object} o.score  app/config/intoTheWildScore.ts.
 * @param {string} [o.lockup] The stacked mark as inline SVG, for the end card.
 * @param {string} [o.uid]  Prefix for every id in the frame.
 */
export function reliefFrame({ time, score, lockup = '', uid = 'relief' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const plan = planFor(score)
  const { P, T, S, WORDS, world, groundY } = plan
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const cam = cameraAt(plan, now)
  // Screen x of layer-x `lx` for a layer at factor f.
  const view = (f) => cam * f - 800
  const shift = (f) => r(-view(f), 1)
  const visible = (f, a, b) => b >= view(f) - 40 && a <= view(f) + 1640
  const v = view(NEAR)

  const hushW = plan.hush.words
  const roarW = plan.roar.words
  const c3W = WORDS.c3
  const chorusFrom = plan.runFrom

  /* The land and the range rise out of the sea on "iron". */
  const riseNear = 300 * (1 - easeCamera(ramp(now, T.iron, T.iron + 1.4)))
  const riseMid = 330 * (1 - easeCamera(ramp(now, T.iron + 0.15, T.iron + 1.9)))

  /* ── The red block, swept in across the sky at the last chorus ────── */
  const sweep = easeInOut(ramp(now, chorusFrom - 0.1, chorusFrom + 1.3))
  const flood = sweep > 0
    ? `<g transform="translate(4 -3)">${fillD(rough([[1600 - 1640 * sweep, TOP - 10], [1610, TOP - 10], [1610, 424], [1600 - 1640 * sweep, 424]], 3, 67, 40), RED)}</g>`
    : ''

  /* ── Far layer: sky, stars, the harbour's moon, the last sun ──────── */
  const far = []
  // Two nights: the first falls on "sleeping" and ends at the first chorus's
  // dawn; the second falls as the sun sets over the pass and ends at the last.
  const night1 = (h) => (now < T.so1 + 1.4 ? land(now, WORDS.alone[Math.floor(h * WORDS.alone.length)].t + h * 0.1, 0.3) * (1 - easeInOut(ramp(now, T.so1, T.so1 + 1.4))) : 0)
  const night2 = (h) => land(now, S.solo.to - 9 + h * 7, 0.6) * (1 - easeInOut(ramp(now, chorusFrom, chorusFrom + 1.2)))
  let stars = ''
  for (const i of tilesIn(view(FAR), view(FAR) + 1600)) {
    const tile = skyTile(i)
    far.push(tile.svg)
    for (const s of tile.stars) {
      const k = Math.max(night1(s.h), night2(s.h))
      if (k > 0.02) stars += glint(s.x, s.y, s.s * k)
    }
  }
  if (stars) far.push(fillD(stars, PAPER))
  // The moon sits over the harbour and sets as the camera leaves it.
  const moonX = W.harbour * FAR + 400
  const moonY = lerp(176, 560, easeInOut(ramp(now, plan.hollowT + 0.3, plan.roarCut + 0.5)))
  if (now > S.v3.from && visible(FAR, moonX - 80, moonX + 80) && moonY < 520) {
    far.push(circle(moonX, moonY, 60, { fill: PAPER }))
    far.push(fillD(lens(moonX - 22, moonY - 16, moonX - 4, moonY - 8, 3) + lens(moonX + 12, moonY + 14, moonX + 26, moonY + 24, 2.4), INK))
  }
  // "The": a band of sky cut round the moon.
  if (now > S.v3.from) {
    const rand = rng(41)
    let d = ''
    for (let i = 0; i < 14; i++) {
      const x = moonX - 420 + rand() * 360
      const y = 96 + rand() * 90
      d += lens(x, y, x + 60 + rand() * 90, y + (rand() - 0.5) * 3, 2.4, land(now, hushW[0].t + i * 0.012))
    }
    far.push(fillD(d, PAPER))
  }
  // "hollow": stars, each cut outwards from its centre. Gone with the dawn.
  const starFade = 1 - easeInOut(ramp(now, chorusFrom, chorusFrom + 1.2))
  if (now > S.v3.from && starFade > 0) {
    const rand = rng(31)
    let d = ''
    for (let i = 0; i < 16; i++) {
      const x = moonX - 700 + rand() * 1000
      const y = 70 + rand() * 250
      if (Math.hypot(x - moonX, y - 176) < 100) continue
      const s = (4 + rand() * 5) * land(now, hushW[6].t + i * 0.025, 0.2)
      if (s > 0.5) d += lens(x - s, y, x + s, y, 1.4) + lens(x, y - s, x, y + s, 1.4)
    }
    far.push(fillD(d, PAPER, op(starFade)))
  }
  // The last sun: rises through the last chorus, and every word of it shoots out more rays.
  const sunCamT = chorusFrom + 2.2
  const sunX = cameraAt(plan, sunCamT) * FAR + 330
  const rise = easeOut(ramp(now, chorusFrom + 0.2, chorusFrom + 5.6))
  const sunY = lerp(640, 238, rise)
  if (rise > 0 && visible(FAR, sunX - 700, sunX + 700)) {
    let rays = ''
    c3W.forEach((w, wi) => {
      for (let j = 0; j < 3; j++) {
        const n = wi * 3 + j
        const kk = n % 2 ? 26 - Math.floor(n / 2) : Math.floor(n / 2)
        const a = 180 + (kk + 0.5) * (180 / 27)
        rays += wedge(sunX, sunY, 116, 1500, a, 2.8, land(now, w.t + j * 0.05, 0.3))
      }
    })
    far.push(fillD(rays, PAPER))
    far.push(circle(sunX, sunY, 104, { fill: PAPER }))
  }

  /* ── Sky, on screen: the red sun and its rays, the first moon, the compasses, the crown, birds ── */
  const sky = []
  const sun = sunAt(plan, now)
  if (sun.y < 700) {
    // "The gods hid about": rays on every word; then each chorus's words, the way the last chorus does it.
    let rays = ''
    const rayset = (ws, r2, fade) => {
      if (fade <= 0) return
      let d = ''
      ws.forEach((w, wi) => {
        for (let j = 0; j < 2; j++) {
          const n = wi * 2 + j
          const kk = n % 2 ? 19 - Math.floor(n / 2) : Math.floor(n / 2)
          d += wedge(sun.x, sun.y, 104, r2, 180 + (kk + 0.5) * (180 / 20), 2.6, land(now, w.t + j * 0.05, 0.3))
        }
      })
      rays += fillD(d, PAPER, op(fade))
    }
    const risen = smooth((600 - sun.y) / 160)
    rayset(WORDS.gods, 420, 1 - easeInOut(ramp(now, T.sleeping - 0.3, T.sleeping + 1.2)))
    rayset(WORDS.c1, 1300, risen * (1 - easeInOut(ramp(now, S.v2.from - 1, S.v2.from + 1))))
    rayset(WORDS.c2, 1300, 1 - easeInOut(ramp(now, S.solo.from + 2, S.solo.from + 5)))
    sky.push(rays)
    let bands = ''
    for (let k = -3; k <= 3; k++) bands += lens(sun.x - 70 + Math.abs(k) * 8, sun.y + k * 20, sun.x + 70 - Math.abs(k) * 8, sun.y + k * 20 + 1, 2.2)
    sky.push(circle(sun.x, sun.y, 88, { fill: RED }) + fillD(bands, INK, ' opacity="0.55"'))
  }
  // The first night's moon: up on "sleeping", down at dawn.
  const moon1 = lerp(700, 196, easeOut(ramp(now, T.sleeping, T.sleeping + 3.2))) + 520 * easeInOut(ramp(now, T.so1, T.so1 + 2.4))
  if (now > T.sleeping && moon1 < 690) {
    sky.push(circle(560, moon1, 56, { fill: PAPER }))
    sky.push(fillD(lens(540, moon1 - 14, 556, moon1 - 7, 3) + lens(570, moon1 + 12, 584, moon1 + 20, 2.4), INK))
  }
  // Compasses: carved on "headed out on an adventure", knocked loose on "lose my way" and "don't know".
  const farAt = (t0, sx) => cameraAt(plan, t0) * FAR - 800 + sx - view(FAR)
  const compassOf = (line, lose, fadeAt) => {
    const o = 1 - easeInOut(ramp(now, fadeAt, fadeAt + 1.4))
    if (now < line.start - 0.5 || o <= 0) return
    const cx = farAt(line.start, 430)
    const pts = line.words.slice(-4).map((w) => w.t)
    sky.push(`<g${op(o)}>${compass(cx, 214, 96, now, { ring: line.words[1].t, points: pts, needle: line.words.at(-1).t, lose })}</g>`)
  }
  compassOf(plan.v1[0], T.lose, plan.v1[3].start - 1.2)
  compassOf(plan.v3[0], T.know, plan.v3[3].start - 0.6)
  // "That aren't made of silver or gold": a crown cut, and struck through.
  const crownO = 1 - easeInOut(ramp(now, plan.v3[4].start - 0.6, plan.v3[4].start + 0.6))
  if (now > T.silver && crownO > 0) {
    const cx = farAt(T.silver, 1030)
    let g = carvedMotif('crown', cx, 206, 170, PAPER, 5, land(now, T.silver, 0.5))
    g += fillD(lens(cx - 110, 290, cx + 110, 130, 9, land(now, T.gold, 0.22)), INK)
    sky.push(`<g${op(crownO)}>${g}</g>`)
  }
  // Horns: a flock goes over on every fourth bar.
  if (now > S.solo.from && now < S.v3.from + 6) {
    const bar = (tt) => score.beatPhase + 2 * Math.ceil((tt - score.beatPhase) / 2)
    for (let k = 0; k < 5; k++) {
      const t0 = bar(S.solo.from + 1 + k * 8)
      const u = now - t0
      if (u < 0 || u > 16) continue
      const x = -140 + u * 118
      const y = 118 + (k % 3) * 44 + 8 * Math.sin(u * 1.3 + k)
      sky.push(carvedMotif('birds', x, y, 130 + (k % 2) * 30, PAPER, 5, land(now, t0, 0.8)))
    }
  }

  /* ── Mid layer: the range; the choruses cut its flanks ────────────── */
  const mid = []
  for (const i of tilesIn(view(MID), view(MID) + 1600)) {
    const tile = rangeTile(i)
    mid.push(tile.body)
    let d = ''
    tile.gouges.forEach((g, gi) => {
      const at = plan.gougeWord(g[0], gi + i * 5)
      if (at === Infinity) return
      d += lens(g[0], g[1], g[2], g[3], g[4], at === -Infinity ? 1 : land(now, at + (gi % 5) * 0.03))
    })
    mid.push(fillD(d, PAPER))
  }
  // "glaciers": the nearest peak iced from the summit down, its lower edge a row of tongues.
  if (now > T.glaciers - 0.1) {
    const target = cameraAt(plan, T.glaciers) * MID - 800 + 1120
    let best = null
    for (const i of tilesIn(target - 400, target + 400)) {
      const { outline } = rangeTile(i)
      // Peaks sit at odd indices, with a saddle either side.
      for (let k = 1; k + 1 < outline.length - 3; k += 2) {
        if (!best || Math.abs(outline[k][0] - target) < Math.abs(best[1][0] - target)) best = [outline[k - 1], outline[k], outline[k + 1]]
      }
    }
    if (best) {
      const [L, [px, py], R] = best
      const k = land(now, T.glaciers, 0.6)
      const f = 0.55
      const along = (q, u) => [px + (q[0] - px) * u, py + (q[1] - py) * u]
      const lf = along(L, f)
      const rf = along(R, f)
      const edge = []
      for (let j = 1; j < 6; j++) {
        const u = j / 6
        const x = lerp(rf[0], lf[0], u)
        const y = lerp(rf[1], lf[1], u) + (j % 2 ? 26 : -8) + (j === 3 ? 40 : 0)
        edge.push([x, y])
      }
      const shape = [[px, py - 2], along(R, 0.02), rf, ...edge, lf, along(L, 0.02)]
      const scaled = shape.map(([x, y]) => [px + (x - px) * k, py + (y - py) * k])
      mid.push(fillD(rough(scaled, 1.2, 140, 14), PAPER))
      if (k >= 1) mid.push(fillD(lens(px - 6, py + 30, px + 10, py + 52, 1.8) + lens(px + 18, py + 44, px + 32, py + 60, 1.6), INK))
    }
  }

  /* ── Near layer ─────────────────────────────────────────────────── */
  const bandL = []
  const landL = []
  for (const i of tilesIn(v, v + 1600)) {
    const tile = groundTile(plan, i)
    bandL.push(tile.band)
    landL.push(tile.land)
  }
  const sea1 = []
  if (visible(NEAR, P.seaFrom, P.platEnd + 60)) {
    sea1.push(world.sea)
    // "water": the sea cut into waves, a row at a time from the top.
    world.waves.forEach((d, i) => sea1.push(cutStroke(d, PAPER, 3.2, easeOut(ramp(now, T.water + i * 0.07, T.water + i * 0.07 + 0.6)))))
    // "splendorous things": gems glinting in the water.
    let g = ''
    for (const gl of world.glints) {
      const k = land(now, gl.t, 0.26)
      if (k > 0) g += glint(gl.x, gl.y, gl.s * k * (0.85 + 0.15 * Math.sin(now * 2.2 + gl.ph)))
    }
    sea1.push(fillD(g, PAPER))
  }

  const near = landL
  // The cliff's strata: "Ebony" cuts the fine rows, "ivory" the broad ones, "bone" a fossil.
  if (visible(NEAR, P.land, P.platEnd)) {
    for (const s of world.strata) near.push(cutStroke(s.d, PAPER, s.w, easeOut(ramp(now, s.t, s.t + 1.1))))
    const k = land(now, T.bone, 0.45)
    if (k > 0) near.push(carvedMotif('bone', P.fossil, 612, 190, PAPER, 6, k) + carvedMotif('bone', P.fossil + 150, 660, 90, PAPER, 5, land(now, T.bone + 0.2, 0.4)))
  }
  // Stones rising out of the moor, each on its word.
  for (const s of world.stones) {
    if (!visible(NEAR, s.x - s.w, s.x + s.w)) continue
    const k = easeOut(ramp(now, s.t, s.t + 0.35))
    if (k > 0) near.push(`<g transform="translate(0 ${r((1 - k) * (s.h + 12), 1)})">${s.svg}</g>`)
  }
  // The town.
  if (visible(NEAR, P.town0, P.town1)) {
    for (const h of world.houses) if (visible(NEAR, h.x0, h.x1)) near.push(h.svg)
    let lit = ''
    for (const w of world.windows) {
      if (!visible(NEAR, w.x - 20, w.x + 20)) continue
      const k = land(now, w.t, 0.2)
      if (k > 0) lit += `M${pt(w.x - 15 * k, w.y + 23 - 22 * k)}h${r(30 * k)}v${r(44 * k)}h${r(-30 * k)}Z`
    }
    near.push(fillD(lit, PAPER))
    // Signs, blank boards until their noun is sung.
    for (const s of P.signs) {
      if (!visible(NEAR, s.x - 80, s.x + 80)) continue
      near.push(penD(`M${pt(s.x - 66, 468)}h132v84h-132Z`, PAPER, 3) + carvedMotif(s.name, s.x, 510, 70, PAPER, 5, land(now, s.t, 0.45)))
    }
    // The clock: carved on "creates", racing from "pressure".
    if (visible(NEAR, P.tower - 80, P.tower + 80)) {
      const k = land(now, T.creates, 0.4)
      if (k > 0) {
        const cy = 250
        let ticks = ''
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6
          ticks += `M${pt(P.tower + Math.cos(a) * 34, cy + Math.sin(a) * 34)}L${pt(P.tower + Math.cos(a) * 42, cy + Math.sin(a) * 42)}`
        }
        const u = Math.max(0, now - T.pressure)
        const turns = 3.2 * (1 - Math.exp(-u / 1.6)) + 0.015 * u
        const am = turns * Math.PI * 2 - Math.PI / 2
        const ah = am / 12 + 0.9
        near.push(circle(P.tower, cy, 48 * k, { fill: PAPER }) + (k >= 1 ? penD(ticks, INK, 3) + penD(`M${pt(P.tower, cy)}L${pt(P.tower + Math.cos(am) * 36, cy + Math.sin(am) * 36)}M${pt(P.tower, cy)}L${pt(P.tower + Math.cos(ah) * 24, cy + Math.sin(ah) * 24)}`, INK, 5) : ''))
      }
    }
    // "revealing": a door swings open and the light falls on the street.
    if (visible(NEAR, P.door - 200, P.door + 200)) {
      const k = land(now, T.revealing, 0.5)
      const g = 602
      near.push(fillD(`M${pt(P.door - 30, g)}V${I(g - 104)}h60V${I(g)}Z`, PAPER, op(0.2 + 0.8 * k)))
      if (k > 0) near.push(fillD(`M${pt(P.door - 30, g)}L${pt(P.door + 30, g)}L${pt(P.door + 30 + 90 * k, BOTTOM + 10)}L${pt(P.door - 30 - 40 * k, BOTTOM + 10)}Z`, PAPER, ' opacity="0.9"'))
      near.push(fillD(`M${pt(P.door - 30, g)}V${I(g - 104)}L${pt(P.door - 30 + 60 * (1 - 0.8 * k), g - 104 - 8 * k)}V${I(g + 8 * k)}Z`, INK) + penD(`M${pt(P.door - 34, g)}V${I(g - 108)}h68V${I(g)}`, PAPER, 3))
    }
    // "songs": a shop window lit, and a guitar in it.
    if (visible(NEAR, P.guitar - 100, P.guitar + 100)) {
      const k = land(now, T.songs, 0.3)
      near.push(penD(`M${pt(P.guitar - 78, 452)}h156v112h-156Z`, PAPER, 3))
      if (k > 0) near.push(fillD(`M${pt(P.guitar - 74, 456)}h148v104h-148Z`, PAPER, op(k)) + carvedMotif('guitar', P.guitar, 508, 96, INK, 5, land(now, T.songs + 0.2, 0.6)))
    }
  }
  // The choruses' pines, cut up out of the ground ahead of him.
  for (const c of P.chorusPines) if (visible(NEAR, c.x - 80, c.x + 80)) near.push(pine(c.x, groundY(c.x) + 4, c.h, I(c.x), easeOut(ramp(now, c.t, c.t + 0.55))))
  // "Where I'll end up": a signpost, its arms cut blank.
  if (visible(NEAR, P.signpost - 140, P.signpost + 140) && now > S.v3.from - 2) {
    near.push(world.post)
    const y0 = world.postY
    const arms = [[T.end, 1, -176], [T.up, -1, -140], [T.know, 1, -104]]
    let d = ''
    for (const [tt, dir, dy] of arms) {
      const k = land(now, tt, 0.3)
      if (k <= 0) continue
      const x0 = P.signpost + dir * 4
      const L = 112 * k * dir
      d += `M${pt(x0, y0 + dy)}h${r(L)}l${r(16 * dir * k)} 13l${r(-16 * dir * k)} 13h${r(-L)}Z`
    }
    near.push(fillD(d, INK))
  }
  // "gardens": flowers come up along the path.
  for (const f of world.flowers) {
    if (!visible(NEAR, f.x - 40, f.x + 40)) continue
    const k = land(now, f.t, 0.4)
    if (k > 0) near.push(carvedMotif('flower', f.x, f.y - f.s * 0.42, f.s, INK, 5, k))
  }
  // "grottos": a rock with a cave cut into it.
  if (visible(NEAR, P.cave - 260, P.cave + 260)) {
    near.push(world.rock)
    near.push(carvedMotif('cave', P.cave, world.caveY - 78, 190, PAPER, 6, land(now, T.grottos, 0.5)))
  }
  // "treasures": glints in the ground's face.
  if (now > T.treasures && now < S.v3.to) {
    let g = ''
    const rand = rng(150)
    for (let i = 0; i < 14; i++) {
      const x = cameraAt(plan, T.treasures) - 700 + rand() * 1400
      const y = groundY(x) + 30 + rand() * 60
      const k = land(now, T.treasures + i * 0.04, 0.3)
      g += glint(x, y, (8 + rand() * 9) * k * (0.85 + 0.15 * Math.sin(now * 2.4 + i)))
    }
    near.push(fillD(g, PAPER))
  }

  if (visible(NEAR, W.shore - 40, 2060)) near.push(`<g transform="translate(-3 4)">${HARBOUR.sea}</g>`)
  if (visible(NEAR, W.shore, 1200)) {
    // "hush" and "so": the water, each row cut along its length.
    // Rows start a beat apart, so the water is cut from the top row down.
    HARBOUR.scallopsA.forEach((d, i) => near.push(cutStroke(d, PAPER, 3, easeOut(ramp(now, hushW[1].t + i * 0.08, hushW[1].t + i * 0.08 + 0.5)))))
    HARBOUR.scallopsB.forEach((d, i) => near.push(cutStroke(d, PAPER, 3.4, easeOut(ramp(now, hushW[5].t + i * 0.07, hushW[5].t + i * 0.07 + 0.55)))))
    // "of": the moon's road on the water, under wherever the moon is on screen.
    const reflect = 1 - easeInOut(ramp(now, plan.roarCut - 0.4, plan.roarCut + 1.2))
    if (reflect > 0) {
      const mx = moonX - view(FAR) + v
      let d = ''
      for (let i = 0; i < 7; i++) {
        const k = land(now, hushW[2].t + i * 0.03)
        d += lens(mx - 40 + i * 3, 470 + i * 26, mx + 40 - i * 4, 470 + i * 26, 2.2, k)
      }
      near.push(fillD(d, PAPER, op(reflect)))
    }
    // The boat, drifting. "a": its sail is cut, bottom to top.
    const bx = 620 + (now - 170) * 9
    near.push(fillD(rough([[bx - 80, 486], [bx + 80, 486], [bx + 56, 512], [bx - 58, 512]], 1.5, 23, 20) + `M${pt(bx - 4, 484)}H${I(bx + 4)}V380H${I(bx - 4)}Z`, INK) + penD(`M${pt(bx - 80, 490)}H${I(bx + 80)}`, PAPER, 2.4))
    const k = land(now, hushW[3].t, 0.24)
    if (k > 0) near.push(fillD(`M${pt(bx, 482)}L${pt(bx, 482 - 90 * k)}L${pt(bx + 60 * k, 482)}Z`, PAPER))
  }
  // "harbor": the lamp is lit and its two beams go out and sweep, slowly, for as long as it is on screen.
  let beams = ''
  if (visible(NEAR, W.rockFrom - 900, 2010)) {
    const k = land(now, hushW[4].t, 0.4)
    const sweepA = 188 + 9 * Math.sin((now - hushW[4].t) * 0.7)
    beams = fillD(wedge(W.lighthouse + 8, 230, 24, 900, sweepA, 2.4, k) + wedge(W.lighthouse - 8, 230, 24, 820, sweepA - 13, 1.8, k), PAPER, ' opacity="0.92"')
  }

  if (visible(NEAR, 1950, 3400)) {
    near.push(STAGE.halo)
    // "roar" … "stage": two spotlight rays shoot down on every word.
    let rays = ''
    roarW.forEach((w, wi) => {
      for (let j = 0; j < (wi === roarW.length - 1 ? 3 : 2); j++) {
        const a = STAGE.rays[Math.min(14, wi * 2 + j)]
        rays += wedge(W.stage, TOP - 30, 30, 480, a, 1.5 + ((a * 7) % 5) * 0.25, land(now, w.t + j * 0.06, 0.24))
      }
    })
    // The spots go out as the singer leaves the stage.
    const spots = 1 - easeInOut(ramp(now, plan.leapAt, plan.leapAt + 0.8))
    if (spots > 0) near.push(fillD(rays, PAPER, op(spots)))
    near.push(`<g transform="translate(4 -3)">${STAGE.pool}</g>`, STAGE.stage)
  }
  // The singer, who is also the runner.
  const s = singerAt(plan, now)
  const cheer = land(now, plan.stageT, 0.3)
  let pose = blend(POSES.stand, POSES.cheer, cheer)
  if (s.running) pose = blend(pose, runAt(now), easeInOut(ramp(now, plan.runFrom, plan.runFrom + 0.35)))
  const mic = fillD(`M${pt(W.stage + 46, STAGE_TOP)}h6V300h-6Z`, INK)
  if (visible(NEAR, 1950, 3400)) near.push(mic)
  if (visible(NEAR, 1900, W.crowdTo + 300)) near.push(crowd(now, roarW))
  // The headland goes over the crowd's near end, so the crowd starts behind it.
  if (visible(NEAR, W.rockFrom, 2010)) near.push(HARBOUR.rock, HARBOUR.lighthouse, beams)
  // "wild": the big pine, cut up out of the ground where the singer lands.
  const landX = W.stageR + plan.RS * plan.LEAP
  if (visible(NEAR, landX + 300, landX + 560)) near.push(pine(landX + 420, groundY(landX + 420) + 4, 250, 77, easeOut(ramp(now, plan.wildT, plan.wildT + 0.6))))

  /* The trail he cuts: red, in the ground behind him — the other thing that travels. */
  const trail = (a, b, yAt) => {
    const lo = Math.max(a, v - 40)
    const hi = Math.min(b, v + 1640)
    if (hi - lo < 4) return ''
    let d = `M${pt(lo, yAt(lo))}`
    for (let x = lo + 24; x < hi; x += 24) d += `L${pt(x, yAt(x))}`
    d += `L${pt(hi, yAt(hi))}`
    return penD(d, RED, 5)
  }
  const onGround = (x) => groundY(x) + 10
  const wx = plan.walkerX(now)
  if (now > T.run1 && now < plan.roarCut) near.push(trail(plan.walkerX(T.run1), wx - 14, onGround))
  if (now > plan.runFrom) {
    near.push(trail(W.stage, Math.min(s.x, W.stageR), () => STAGE_TOP + 9))
    const landed = plan.leapAt + plan.LEAP
    if (now > landed) near.push(trail(singerAt(plan, landed).x, s.x - 14, onGround))
  }

  // The walker — asleep among the stones, then the runner, until the camera leaves him at the sage.
  if (now < plan.roarCut && visible(NEAR, wx - 120, wx + 120)) {
    const g = groundY(wx)
    let j
    const sit = joints(wx, g, FIG, POSES.sit)
    if (now < T.so1) j = sit
    else {
      const up = joints(wx, g, FIG, gait(plan, now, wx))
      j = now < T.so1 + 0.5 ? mixJ(sit, up, smooth((now - T.so1) / 0.5)) : up
    }
    near.push(personJ(j, FIG))
  }
  // Last, so nothing in the world is ever in front of the person in it.
  near.push(person(s.x, s.ground, FIG, pose))

  /* Wind through the sage: long gouges blown across the sky and the mist. */
  const overlay = []
  if (now > T.sound && now < T.sound + 4.5) {
    let dsky = ''
    let dband = ''
    const rand = rng(160)
    for (let i = 0; i < 12; i++) {
      const t0 = (i % 2 ? T.wind : T.sound) + rand() * 0.25
      const u = now - t0
      const x0 = -260 + rand() * 900 + Math.max(0, u) * 320
      const len = 380 + rand() * 520
      const inBand = i % 3 === 2
      const y = inBand ? 440 + rand() * 90 : 90 + rand() * 290
      const k = land(now, t0, 0.6) * (1 - easeInOut(ramp(u, 1.2, 2.4)))
      if (k <= 0) continue
      const piece = lens(x0, y, x0 + len, y - 6 - rand() * 10, 2.6, k)
      if (inBand) dband += piece
      else dsky += piece
    }
    overlay.push(fillD(dsky, PAPER, ' opacity="0.9"') + fillD(dband, INK, ' opacity="0.8"'))
  }

  /* ── The margin ───────────────────────────────────────────────────── */
  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 1, opacity: o })
  }
  // The album's one timing rule for the margin (lineSpan in album.mjs).
  else margin = marginLyric({ now, score, uid })

  const clip = plateClip(uid)
  const nearT = `translate(${shift(NEAR)} 0)`
  return {
    svg: [
      paper(),
      clip.def,
      `<g clip-path="${clip.url}">`,
      `<rect x="${PL.x}" y="${PL.y}" width="${PL.w}" height="${PL.h}" fill="${INK}"/>`,
      flood,
      `<g transform="translate(${shift(FAR)} 0)">${far.join('')}</g>`,
      sky.join(''),
      `<g transform="translate(${shift(MID)} ${r(riseMid, 1)})">${mid.join('')}</g>`,
      `<g transform="${nearT}">${bandL.join('')}${sea1.join('')}</g>`,
      `<g transform="${nearT}${riseNear > 0.05 ? ` translate(0 ${r(riseNear, 1)})` : ''}">${near.join('')}</g>`,
      overlay.join(''),
      '</g>',
      margin,
    ].join('\n'),
    label: active?.text ?? section.label,
  }
}

/* For tools: the camera and the people, so a script can measure them for smoothness. */
export const reliefCamera = (score, now) => cameraAt(planFor(score), now)
export const reliefSinger = (score, now) => singerAt(planFor(score), now)
export const reliefWalker = (score, now) => planFor(score).walkerX(now)
