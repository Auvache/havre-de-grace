/*
 * Woodcut — style C4, a two-block relief print of "Into the Wild".
 *
 * A black key block and one colour block, vermilion, printed on off-white
 * paper, with a muted slate used sparingly for water and ice. Nothing is drawn;
 * everything is what is left after the knife. The picture is a block with a
 * rough edge; under it a second block carries the lyric, its letters cut out of
 * the black so the paper shows through them.
 *
 * THE ONE IDEA
 *
 * Motion is carving. A scene arrives as an uncut block — its big shapes only —
 * and every measured word takes another cut out of it: a ray of light, a row of
 * waves, a tree. The steps land on the word and ease over 90 ms; nothing fades
 * or slides. By the time the line has been sung the block is finished, and the
 * next line starts a new block. The lyric works the same way: a letter is drawn
 * on the block faintly and cut through — full paper — once it is sung.
 *
 * `woodcutFrame({ time, score })` is a pure function of the song's clock with
 * the score passed in. Scene geometry is built once per scene and cached; the
 * only things built per frame are which cuts are down, the crowd's arms and the
 * runner's pose.
 */

import { t, circle, rng, r, advance, clamp01, easeOut, ramp } from '../kit.mjs'
import { motifBody } from '../motifs.mjs'
import { sectionAt, shownLineAt, lineAt, splitLine, bankWords, throughRow, sizeToMeasure } from '../score.mjs'
import { cueFor, cuesIn } from '../cues.mjs'
import { joints, strokes, runPose, POSES } from '../figure.mjs'
import { endCard } from '../ending.mjs'

/* ── The inks. Two blocks and a tint, on paper that is never white. ──── */
export const PAPER = '#ebe2cc'
export const INK = '#15130f'
export const VERMILION = '#c23b22'
/** The muted third ink: water, ice, a night mountain. Never type, never the sun. */
export const SLATE = '#56666a'

export const WOODCUT = {
  id: 'c4-woodcut',
  name: 'Woodcut',
  accent: VERMILION,
  palette: { PAPER, INK, VERMILION, SLATE },
}

/* ── Geometry. The picture block and the lyric block, with paper round both. */
const X0 = 70
const Y0 = 56
const X1 = 1530
const Y1 = 640
const BAN_Y0 = 668
const BAN_Y1 = 846
const BAN_MID = (BAN_Y0 + BAN_Y1) / 2

const I = Math.round
const pt = (x, y) => `${I(x)} ${I(y)}`

/** A polygon with an edge that has been cut by hand: subdivided and jittered. */
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

/** One gouge: a lens, pointed at both ends, `w` its half-width at the middle. */
function lens(x1, y1, x2, y2, w) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const L = Math.hypot(x2 - x1, y2 - y1) || 1
  // The control point sits at twice the bulge — a quadratic reaches half of it.
  const nx = (-(y2 - y1) / L) * w * 2
  const ny = ((x2 - x1) / L) * w * 2
  return `M${pt(x1, y1)}Q${pt(mx + nx, my + ny)} ${pt(x2, y2)}Q${pt(mx - nx, my - ny)} ${pt(x1, y1)}Z`
}

/** A ray cut from a centre: a thin wedge that widens away from it. */
function wedge(cx, cy, r1, r2, deg, half) {
  const a = (deg * Math.PI) / 180
  const h = (half * Math.PI) / 180
  return `M${pt(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)}L${pt(cx + Math.cos(a - h) * r2, cy + Math.sin(a - h) * r2)}L${pt(cx + Math.cos(a + h) * r2, cy + Math.sin(a + h) * r2)}Z`
}

const fill = (d, colour, extra = '') => (d ? `<path d="${d}" fill="${colour}"${extra}/>` : '')
const pen = (d, colour, w) => (d ? `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${r(w)}" stroke-linecap="round" stroke-linejoin="round"/>` : '')

/** Rows of carved sky: long thin gouges with the uncut ink left between them. */
function skyGouges(y0, y1, seed, o = {}) {
  const { gap = 22, x0 = X0 + 10, x1 = X1 - 10, w = 2.6, density = 0.72 } = o
  const rand = rng(seed)
  let d = ''
  for (let y = y0; y < y1; y += gap + rand() * 6) {
    let x = x0 + rand() * 40
    while (x < x1) {
      const len = 50 + rand() * 170
      if (rand() < density) d += lens(x, y, Math.min(x + len, x1), y + (rand() - 0.5) * 3, w * (0.6 + rand() * 0.6))
      x += len + 14 + rand() * 40
    }
  }
  return d
}

/** Scalloped water: rows of arcs, the knife's oldest way of saying sea. */
function scallops(y0, y1, seed, o = {}) {
  const { width = 46, rise = 13, gap = 26, x0 = X0 - 20, x1 = X1 + 20 } = o
  const rand = rng(seed)
  let d = ''
  let row = 0
  for (let y = y0; y < y1; y += gap, row++) {
    const w = width * (0.75 + (row / 12))
    let x = x0 - (row % 2) * w * 0.5 - rand() * 10
    d += `M${pt(x, y)}`
    while (x < x1) {
      d += `q${I(w / 2)} ${I(-rise)} ${I(w)} 0`
      x += w
    }
  }
  return d
}

/** A mountain range, and gouges down the lit flank of each peak. */
function range(peaks, base, seed, o = {}) {
  const { hatch = 7, w = 3.2 } = o
  const pts = [[X0 - 20, base]]
  for (const [x, y] of peaks) pts.push([x, y])
  pts.push([X1 + 20, base])
  // Valleys between the peaks, so each one is a peak and not a sawtooth.
  const outline = [[X0 - 20, base]]
  for (let i = 0; i < peaks.length; i++) {
    const [x, y] = peaks[i]
    if (i > 0) {
      const [px, py] = peaks[i - 1]
      outline.push([(px + x) / 2, Math.max(py, y) + (base - Math.max(py, y)) * 0.45])
    }
    outline.push([x, y])
  }
  outline.push([X1 + 20, base])
  const body = rough(outline, 3, seed, 30)
  const rand = rng(seed + 7)
  let cuts = ''
  for (let i = 0; i < peaks.length; i++) {
    const [px, py] = peaks[i]
    const left = i > 0 ? outline[2 * i - 1] ?? [px - 200, base] : [px - 260, base]
    for (let k = 1; k <= hatch; k++) {
      const f = k / (hatch + 1)
      const ax = px + (left[0] - px) * f
      const ay = py + (left[1] - py) * f
      const len = (base - ay) * (0.34 + rand() * 0.2)
      cuts += lens(ax + 6, ay + 4, ax + len * 0.55 + 6, ay + len, w * (0.7 + rand() * 0.5))
    }
  }
  const rim = 'M' + outline.slice(1, -1).map(([x, y]) => pt(x, y - 2)).join('L')
  return { body, cuts, rim }
}

/** A pine: stacked tiers in ink, one flank nicked by the knife. */
function pine(x, ground, h, seed, colour = INK, nick = PAPER) {
  const rand = rng(seed)
  const tiers = 4
  let d = ''
  let cuts = ''
  for (let k = 0; k < tiers; k++) {
    const top = ground - h + (h * 0.78 * k) / tiers
    const bottom = top + h * 0.36
    const half = h * (0.14 + 0.08 * k)
    d += rough([[x, top], [x + half, bottom], [x - half, bottom]], 2, seed + k, 18)
    cuts += lens(x - half * 0.55, bottom - 6, x - half * 0.1, top + (bottom - top) * 0.45, 1.8 + rand())
  }
  d += `M${pt(x - 5, ground - h * 0.18)}h10V${I(ground + 2)}h-10Z`
  return fill(d, colour) + fill(cuts, nick)
}

/** A person as a heavy round-capped stroke — at this weight it reads as a silhouette. */
function person(x, ground, h, pose, colour, facing = 1) {
  const j = joints(x, ground, h, pose, facing)
  const d = strokes(j).map((line) => 'M' + line.map(([a, b]) => pt(a, b)).join('L')).join('')
  return pen(d, colour, h * 0.085) + circle(j.head[0], j.head[1], j.head[2] * 1.08, { fill: colour })
}

/** A motif from the library, cut as thick paper lines. */
function carvedMotif(name, cx, cy, size, colour = PAPER, weight = 6) {
  const s = size / 100
  return `<g transform="translate(${I(cx - size / 2)} ${I(cy - size / 2)}) scale(${r(s, 3)})" fill="none" stroke="${colour}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round">${motifBody(name)}</g>`
}

/** Ink never lies flat: specks of paper showing through the black, fixed per block. */
const SPECKS = (() => {
  const rand = rng(911)
  let d = ''
  for (let i = 0; i < 150; i++) {
    const x = X0 + rand() * (X1 - X0)
    const y = Y0 + rand() * (Y1 - Y0)
    const a = rand() * Math.PI
    const l = 3 + rand() * 7
    d += lens(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, 0.9)
  }
  return d
})()

const BLOCK = rough([[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], 2.4, 5, 40)
const BANNER = rough([[X0, BAN_Y0], [X1, BAN_Y0], [X1, BAN_Y1], [X0, BAN_Y1]], 2.4, 6, 40)

/* ══ SCENES ═══════════════════════════════════════════════════════════
 *
 * A scene is { ground, colour, key, cuts }: the ground the block prints on,
 * what the colour block prints (drawn a few units out of register), the uncut
 * key block, and the cuts — in carving order. A cut is markup, or { svg, at }
 * when it belongs to a particular word rather than to its share of the line.
 */

const CACHE = new Map()
const cached = (key, build) => {
  if (!CACHE.has(key)) CACHE.set(key, build())
  return CACHE.get(key)
}

/** The harbor at night. Hush: the fewest cuts of any scene in the film. */
function harborScene() {
  return cached('harbor', () => {
    const rockTop = [[X0 - 10, 420], [150, 396], [236, 382], [360, 386], [460, 408], [560, 452], [620, 640]]
    const rock = rough([[X0 - 10, 640], ...rockTop], 4, 21, 22)
    const rim = 'M' + rockTop.slice(0, 6).map(([x, y]) => pt(x, y - 3)).join('L')
    const face = (() => {
      const rand = rng(24)
      let d = ''
      for (let i = 0; i < 16; i++) {
        const x = X0 + 20 + rand() * 440
        const y = 440 + rand() * 180
        d += lens(x, y, x + 30 + rand() * 40, y + 20 + rand() * 20, 2.2)
      }
      return d
    })()
    const tower = `M${pt(276, 386)}L${pt(290, 246)}H${I(330)}L${pt(344, 386)}Z`
    const bands = `M${pt(283, 316)}H337V334H281ZM${pt(288, 268)}H332V284H286Z`
    const lantern = `M${pt(290, 212)}H330V246H290Z`
    const roof = `M${pt(282, 214)}L310 184L338 214Z`
    const moon = circle(1210, 176, 60, { fill: PAPER })
    const craters = lens(1188, 160, 1206, 168, 3) + lens(1222, 190, 1236, 200, 2.4) + lens(1196, 204, 1206, 214, 2)
    const hull = rough([[850, 486], [1010, 486], [986, 512], [872, 512]], 1.5, 23, 20)
    const sail = `M${pt(930, 482)}L${pt(930, 392)}L${pt(990, 482)}Z`
    const mast = `M${pt(926, 484)}H934V380H926Z`
    const rays = wedge(318, 228, 24, 760, -8, 2.4) + wedge(318, 228, 24, 700, 4, 1.8)
    const reflect = Array.from({ length: 7 }, (_, i) => lens(1210 - 40 + i * 3, 450 + i * 26, 1210 + 40 - i * 4, 450 + i * 26, 2.2)).join('')
    const stars = (() => {
      const rand = rng(31)
      let d = ''
      for (let i = 0; i < 14; i++) {
        const x = 480 + rand() * 1000
        const y = 76 + rand() * 250
        if (Math.hypot(x - 1210, y - 176) < 100) continue
        const s = 4 + rand() * 5
        d += lens(x - s, y, x + s, y, 1.4) + lens(x, y - s, x, y + s, 1.4)
      }
      return d
    })()
    return {
      ground: INK,
      colour: fill(rough([[X0 - 10, 430], [X1 + 10, 424], [X1 + 10, 650], [X0 - 10, 650]], 3, 22, 40), SLATE),
      key: [fill(rock, INK), pen(rim, PAPER, 4), fill(face, PAPER, ' opacity="0.8"'), fill(tower, PAPER), fill(bands + roof, INK), fill(lantern, PAPER), moon, fill(craters, INK), fill(mast + hull, INK), pen(`M${pt(850, 490)}H1010`, PAPER, 2.4)].join(''),
      cuts: [
        fill(skyGouges(90, 170, 41, { density: 0.28, x0: 420, x1: 1100 }), PAPER),
        pen(scallops(470, 520, 42, { x0: 560 }), PAPER, 3),
        fill(reflect, PAPER),
        fill(sail, PAPER),
        fill(rays, PAPER, ' opacity="0.92"'),
        pen(scallops(545, 640, 43, { x0: 600, gap: 30 }), PAPER, 3.4),
        fill(stars, PAPER),
      ],
    }
  })
}

/** The crowd at the stage. Roar: rays gouged on every word, arms up in waves. */
function crowdScene() {
  return cached('crowd', () => {
    const stageTop = 372
    const stage = rough([[420, stageTop], [1180, stageTop], [1230, 420], [370, 420]], 2, 51, 30)
    const lip = lens(424, stageTop + 2, 1176, stageTop + 2, 2.4)
    const halo = circle(800, 272, 104, { fill: PAPER })
    const band = rough([[X0 - 10, 444], [X1 + 10, 440], [X1 + 10, 580], [X0 - 10, 580]], 3, 52, 40)
    const rays = []
    const angles = [90, 76, 104, 64, 116, 52, 128, 84, 96, 70, 110, 58, 122, 46, 134]
    for (const a of angles) rays.push(wedge(800, Y0 - 30, 30, 460, a, 1.5 + ((a * 7) % 5) * 0.25))
    // Two rays to a word, the last cut on "stage".
    const cuts = []
    for (let i = 0; i < 7; i++) cuts.push(fill(rays.slice(i * 2, i * 2 + 2).join(''), PAPER))
    cuts[cuts.length - 1] += fill(rays[14], PAPER)
    return {
      ground: INK,
      colour: `<ellipse cx="800" cy="${stageTop + 4}" rx="300" ry="34" fill="${VERMILION}"/>`,
      key: [fill(band, PAPER), halo, fill(stage, INK), fill(lip, PAPER)].join(''),
      cuts,
      crowd: true,
    }
  })
}

/*
 * The crowd itself, built per frame because its arms go up on the words.
 * Three rows of heads with the ink mass under them; which arms are up is a
 * hash of the head and the word, and more are up as the line goes on.
 */
function crowdMass(step, performerOn) {
  const rows = [
    { y: 482, r: 15, gap: 50, off: 12 },
    { y: 530, r: 21, gap: 66, off: 40 },
    { y: 590, r: 28, gap: 84, off: 0 },
  ]
  let heads = ''
  let arms = ''
  rows.forEach((row, ri) => {
    for (let x = X0 - 20 + row.off, k = 0; x < X1 + 40; x += row.gap, k++) {
      const bob = ((k * 13 + ri * 7) % 5) - 2
      const hy = row.y + bob
      heads += `M${pt(x - row.r, hy)}a${row.r} ${row.r} 0 1 1 ${row.r * 2} 0a${row.r} ${row.r} 0 1 1 ${-row.r * 2} 0Z`
      // Shoulders: the ink mass under every head, down to the block's foot.
      heads += `M${pt(x - row.r * 1.9, 660)}L${pt(x - row.r * 1.7, hy + row.r * 1.5)}Q${pt(x, hy + row.r * 0.6)} ${pt(x + row.r * 1.7, hy + row.r * 1.5)}L${pt(x + row.r * 1.9, 660)}Z`
      const h = ((k * 2654435761 + ri * 97 + step * 40503) >>> 0) % 100
      if (step >= 0 && h < 18 + step * 7) {
        const lean = (h % 2 ? 1 : -1) * row.r * 0.5
        arms += `M${pt(x - row.r * 1.1, hy + row.r)}L${pt(x - row.r * 1.3 + lean, hy - row.r * 2.6)}`
        if (h % 3 === 0) arms += `M${pt(x + row.r * 1.1, hy + row.r)}L${pt(x + row.r * 1.3 + lean, hy - row.r * 2.6)}`
      }
    }
  })
  const performer = performerOn ? person(800, 372, 150, POSES.cheer, INK) + fill(`M${pt(846, 372)}h6V300h-6Z`, INK) : person(800, 372, 150, 'stand', INK)
  return performer + fill(heads, INK) + pen(arms, INK, 11)
}

/**
 * The run into the wild. Three versions, one per chorus, so the three do not
 * repeat: a paper dawn, a night run under a vermilion moon, and the flood —
 * the colour block over the whole sky with a sun cut out of it.
 */
function chorusScene(variant) {
  return cached(`chorus-${variant}`, () => {
    const peaks = variant === 3
      ? [[210, 262], [470, 214], [760, 290], [1020, 232], [1330, 268]]
      : variant === 2
        ? [[160, 250], [420, 300], [700, 226], [980, 286], [1280, 238], [1480, 290]]
        : [[260, 276], [560, 228], [860, 296], [1180, 246], [1440, 284]]
    const mtn = range(peaks, 404, 60 + variant, { hatch: variant === 3 ? 8 : 6 })
    const ridge = rough([[X0 - 10, 592], [300, 586], [640, 594], [980, 584], [1300, 592], [X1 + 10, 586], [X1 + 10, 650], [X0 - 10, 650]], 3, 64 + variant, 30)
    const mist = rough([[X0 - 10, 402], [X1 + 10, 402], [X1 + 10, 596], [X0 - 10, 596]], 2, 65, 40)
    const mistLines = fill(skyGouges(424, 570, 66 + variant, { density: 0.3, gap: 32, w: 2 }), INK)
    const grass = (() => {
      const rand = rng(68 + variant)
      let d = ''
      for (let x = X0; x < X1; x += 22 + rand() * 18) d += lens(x, 606 + rand() * 20, x + 10 + rand() * 12, 598 + rand() * 30, 1.8)
      return d
    })()
    const pines = [
      [1400, 592, 150], [980, 586, 104], [1470, 588, 118], [1060, 588, 136], [1330, 592, 96], [210, 588, 92],
    ]
    const sunX = variant === 3 ? 1130 : 1240
    const sunY = variant === 3 ? 222 : 330
    const sky = variant === 1 ? PAPER : variant === 2 ? INK : VERMILION
    const colour = variant === 1
      ? circle(sunX, sunY + 60, 120, { fill: VERMILION })
      : variant === 2
        ? circle(1180, 170, 70, { fill: VERMILION })
        : fill(rough([[X0 - 10, Y0 - 10], [X1 + 10, Y0 - 10], [X1 + 10, 420], [X0 - 10, 420]], 2, 67, 60), VERMILION)
    const ground = variant === 3 ? PAPER : sky
    const rayColour = variant === 1 ? VERMILION : PAPER
    const rays = []
    if (variant !== 2) {
      const n = 18
      for (let i = 0; i < n; i++) {
        const k = i % 2 ? n - 1 - Math.floor(i / 2) : Math.floor(i / 2)
        const a = 180 + (k + 0.5) * (180 / n)
        rays.push(wedge(sunX, variant === 3 ? sunY : sunY + 60, variant === 3 ? 118 : 138, 620, a, 3.2))
      }
    }
    const stars = (() => {
      if (variant !== 2) return ''
      const rand = rng(71)
      let d = ''
      for (let i = 0; i < 26; i++) {
        const x = X0 + 30 + rand() * 1400
        const y = Y0 + 20 + rand() * 180
        const s = 3 + rand() * 5
        d += lens(x - s, y, x + s, y, 1.3) + lens(x, y - s, x, y + s, 1.3)
      }
      return d
    })()
    const birds = (() => {
      const rand = rng(72 + variant)
      let d = ''
      for (let i = 0; i < 7; i++) {
        const x = 300 + rand() * 600
        const y = 110 + rand() * 120
        const s = 12 + rand() * 10
        d += `M${pt(x - s, y)}q${I(s / 2)} ${I(-s * 0.6)} ${I(s)} 0q${I(s / 2)} ${I(-s * 0.6)} ${I(s)} 0`
      }
      return d
    })()
    const sunDisc = variant === 3 ? circle(sunX, sunY, 104, { fill: PAPER }) : ''
    /*
     * Carving order: sun, flanks and trees interleaved, so every word of the
     * chorus takes something out of every part of the block — cut all the
     * rays first and the trees arrive after the window has closed.
     */
    const rayCuts = []
    for (let i = 0; i < rays.length; i += 3) rayCuts.push(fill(rays.slice(i, i + 3).join(''), rayColour))
    const treeCuts = pines.map(([x, g, h]) => pine(x, g, h, x, INK, PAPER))
    const cuts = []
    if (stars) cuts.push(fill(stars, PAPER))
    cuts.push(fill(mtn.cuts, variant === 2 ? SLATE : PAPER))
    for (let i = 0; i < Math.max(rayCuts.length, treeCuts.length); i++) {
      if (rayCuts[i]) cuts.push(rayCuts[i])
      if (treeCuts[i]) cuts.push(treeCuts[i])
    }
    cuts.push(pen(birds, variant === 3 ? INK : variant === 2 ? PAPER : INK, 4))
    if (variant !== 2) cuts.push(fill(skyGouges(70, variant === 3 ? 150 : 200, 73 + variant, { density: 0.5, x0: 90, x1: 900 }), variant === 3 ? PAPER : INK))
    return {
      ground,
      colour,
      key: [
        sunDisc,
        fill(mist, PAPER),
        mistLines,
        fill(mtn.body, variant === 2 ? SLATE : INK),
        fill(ridge, INK),
        fill(grass, PAPER),
      ].join(''),
      cuts,
      // The big tree at the left, cut on the word "wild" itself.
      wild: pine(112, 592, 230, 77, INK, PAPER),
      runner: true,
    }
  })
}

/**
 * Sunrise over the range: the title, and the gods making the Earth.
 *
 * The rays are cut *behind* the range. Printed over it, a black range on a
 * black sky vanished and the sun read as a torn red scrap; cut behind it, the
 * mountains are what is left standing in front of the light.
 */
function sunriseScene(tag = 'sunrise') {
  return cached(tag, () => {
    const mtn = range([[180, 392], [430, 330], [700, 410], [980, 340], [1280, 392], [1470, 356]], 566, 81, { hatch: 6 })
    const cx = 800
    const cy = 420
    const rays = []
    // Cut from both flanks inwards, so a half-sung line is a half-carved sun
    // rather than a lopsided one.
    for (let i = 0; i < 18; i++) {
      const k = i % 2 ? 17 - Math.floor(i / 2) : Math.floor(i / 2)
      rays.push(wedge(cx, cy, 150, 900, 180 + (k + 0.5) * (180 / 18), 3.2))
    }
    const cuts = []
    for (let i = 0; i < 18; i += 2) cuts.push({ svg: fill(rays.slice(i, i + 2).join(''), PAPER), under: true })
    cuts.splice(3, 0, fill(mtn.cuts, PAPER))
    cuts.push(pen(scallops(592, 640, 83, { gap: 24 }), PAPER, 3))
    return {
      ground: INK,
      colour: circle(cx, cy, 128, { fill: VERMILION }),
      key: fill(mtn.body, INK) + pen(mtn.rim, PAPER, 3.4) + `<rect x="${X0 - 20}" y="566" width="${X1 - X0 + 40}" height="90" fill="${INK}"/>`,
      cuts,
    }
  })
}

/** The instrumental: a great sun on the sea, a ray cut on every bar of the horns. */
function hornsScene(tag) {
  return cached(tag, () => {
    const horizon = 380
    const rays = []
    const n = tag === 'solo' ? 20 : 6
    for (let i = 0; i < n; i++) {
      const k = i % 2 ? n - 1 - Math.floor(i / 2) : Math.floor(i / 2)
      rays.push(wedge(800, horizon, 150, 900, 180 + (k + 0.5) * (180 / n), tag === 'solo' ? 2.6 : 4))
    }
    const sea = rough([[X0 - 10, horizon], [X1 + 10, horizon], [X1 + 10, 650], [X0 - 10, 650]], 2, 91, 40)
    return {
      ground: INK,
      colour: `<path d="M${pt(640, horizon)}a160 160 0 0 1 320 0Z" fill="${VERMILION}"/>`,
      key: fill(sea, INK) + pen(scallops(horizon + 30, 640, 92, { gap: 30, width: 54 }), SLATE, 3.4)
        + (tag === 'break' ? fill(`M${pt(1120, 452)}H1250L1232 474H1140Z`, PAPER) + fill(`M${pt(1180, 446)}V330L1236 446Z`, PAPER) : ''),
      cuts: rays.map((d) => fill(d, PAPER)),
    }
  })
}

/** "Ebony, ivory, and bone": the ground in section, three things buried in it. */
function strataScene(line) {
  return cached(`strata-${line.index}`, () => {
    const bands = []
    for (let k = 0; k < 7; k++) {
      const y = 170 + k * 66
      let d = `M${pt(X0 - 10, y)}`
      for (let x = X0 - 10; x <= X1 + 20; x += 80) d += `Q${pt(x + 40, y + ((k + x / 80) % 2 ? 10 : -10))} ${pt(x + 80, y)}`
      bands.push(d)
    }
    const sky = rough([[X0 - 10, Y0 - 10], [X1 + 10, Y0 - 10], [X1 + 10, 150], [X0 - 10, 150]], 2, 101, 60)
    const words = line.words
    const at = (text, fallback) => words.find((w) => w.text.toLowerCase().startsWith(text))?.t ?? fallback
    const log = Array.from({ length: 5 }, (_, i) => `<ellipse cx="330" cy="420" rx="${30 + i * 34}" ry="${20 + i * 24}" fill="none" stroke="${PAPER}" stroke-width="${i === 4 ? 9 : 6}"/>`).join('')
    const tusk = `M${pt(610, 540)}Q${pt(780, 250)} ${pt(1000, 300)}Q${pt(800, 320)} ${pt(670, 556)}Z`
    return {
      ground: INK,
      colour: '',
      // The sun is in the key here, not the colour block: under the paper sky
      // strip the colour block had nothing to print on.
      key: fill(sky, PAPER) + `<path d="M${pt(1090, 150)}a110 110 0 0 1 220 0Z" fill="${VERMILION}"/>` + pen(bands.join(''), SLATE, 6),
      cuts: [
        { svg: log, at: at('ebony', line.start) },
        { svg: fill(tusk, PAPER), at: at('ivory', line.start + 0.6) },
        { svg: pen(bands.slice(1, 6).join(''), PAPER, 3), at: at('and', line.start + 1.2) },
        { svg: carvedMotif('bone', 1230, 430, 380, PAPER, 8), at: at('bone', line.start + 2) },
      ],
    }
  })
}

/** "Glaciers and gardens and grottos": three panels, each cut on its own word. */
function triptychScene(line) {
  return cached(`trip-${line.index}`, () => {
    const cues = cuesIn(line)
    const W = (X1 - X0) / 3
    const panel = (i) => X0 + i * W
    const gutters = [1, 2].map((i) => `M${I(panel(i) - 7)} ${Y0 - 10}h14V${Y1 + 10}h-14Z`).join('')
    const cuts = cues.slice(0, 3).map((cue, i) => {
      const cx = panel(i) + W / 2
      const back = cue.motif === 'glacier'
        ? fill(rough([[panel(i) + 20, 470], [panel(i) + W - 20, 470], [panel(i) + W - 20, 620], [panel(i) + 20, 620]], 2, 111 + i, 30), SLATE)
        : cue.motif === 'flower'
          ? circle(cx, 250, 110, { fill: VERMILION })
          : fill(rough([[panel(i) + 40, 610], [cx - 120, 250], [cx, 170], [cx + 120, 250], [panel(i) + W - 40, 610]], 3, 115, 24), PAPER)
      const drawing = carvedMotif(cue.motif, cx, 360, 360, cue.motif === 'cave' ? INK : PAPER, cue.motif === 'cave' ? 7 : 6)
      return { svg: back + drawing + pen(skyGouges(90, 150, 120 + i, { x0: panel(i) + 20, x1: panel(i) + W - 30, density: 0.6 }), PAPER, 1), at: cue.t }
    })
    return { ground: INK, colour: '', key: fill(gutters, PAPER), cuts }
  })
}

/** "Stone-cold these beauties are sleeping": a moon over hills lying down. */
function moonScene(line) {
  return cached(`moon-${line.index}`, () => {
    const hillTop = [[X0 - 10, 520], [220, 440], [420, 470], [640, 400], [900, 460], [1160, 420], [1400, 480], [X1 + 10, 450]]
    const hills = rough([...hillTop, [X1 + 10, 650], [X0 - 10, 650]], 3, 131, 26)
    const hillRim = 'M' + hillTop.map(([x, y]) => pt(x, y - 2)).join('L')
    const contours = []
    for (let k = 0; k < 6; k++) {
      const y = 470 + k * 26
      contours.push(lens(160 + k * 30, y + 20, 700 - k * 20, y - 30, 2.4), lens(760 + k * 20, y - 10, 1400 - k * 30, y + 10, 2.4))
    }
    const stars = (() => {
      const rand = rng(133)
      let d = ''
      for (let i = 0; i < 20; i++) {
        const x = X0 + 40 + rand() * 1380
        const y = Y0 + 30 + rand() * 300
        if (Math.hypot(x - 800, y - 200) < 130) continue
        const s = 3 + rand() * 5
        d += lens(x - s, y, x + s, y, 1.3) + lens(x, y - s, x, y + s, 1.3)
      }
      return d
    })()
    const cues = cuesIn(line)
    const cairn = cues.find((c) => c.motif === 'stone')
    const cuts = [fill(contours.slice(0, 6).join(''), PAPER), fill(stars, PAPER), fill(contours.slice(6).join(''), PAPER), fill(skyGouges(90, 330, 134, { density: 0.25 }), PAPER)]
    if (cairn) cuts.unshift({ svg: carvedMotif('stone', 330, 360, 200, PAPER, 7), at: cairn.t })
    return {
      ground: INK,
      colour: circle(800, 200, 96, { fill: VERMILION }),
      key: circle(830, 186, 82, { fill: INK }) + fill(hills, INK) + pen(hillRim, PAPER, 3),
      cuts,
    }
  })
}

/**
 * Everything else a verse names: the drawing in the middle of a sunburst, the
 * way a printer's device sits on a title page. The rays are the cuts.
 */
function emblemScene(line, motif) {
  return cached(`emblem-${line.index}`, () => {
    const rays = []
    // A different burst for every line, so two lines naming the same thing
    // ("splendorous things", "those treasures") are still two blocks.
    const n = 16 + (line.index % 3) * 6
    for (let i = 0; i < n; i++) rays.push(wedge(800, 348, 200, 760, (i + 0.5) * (360 / n) + (line.index % 2) * 7, 3.4 - (line.index % 3) * 0.5))
    const order = rays.map((d, i) => [d, (i * 7) % n]).sort((a, b) => a[1] - b[1]).map(([d]) => d)
    const cuts = []
    const per = Math.ceil(n / Math.max(line.words.length, 1))
    for (let i = 0; i < n; i += per) cuts.push(fill(order.slice(i, i + per).join(''), PAPER))
    const crossed = motif === 'crown'
    if (crossed) cuts.push(fill(lens(640, 190, 960, 510, 14) + lens(960, 190, 640, 510, 14), VERMILION))
    return {
      ground: INK,
      colour: circle(800, 348, 176, { fill: VERMILION }),
      key: circle(800, 348, 150, { fill: INK }) + carvedMotif(motif, 800, 348, 250, PAPER, 6),
      cuts,
    }
  })
}

/** Which scene a verse line is. */
function verseScene(line) {
  const motif = cueFor(line) ?? 'compass'
  const all = cuesIn(line).map((c) => c.motif)
  if (motif === 'lighthouse') return harborScene()
  if (motif === 'microphone' || all.includes('crowd')) return crowdScene()
  if (motif === 'bone') return strataScene(line)
  if (all.includes('glacier') && all.length >= 3) return triptychScene(line)
  if (motif === 'moon') return moonScene(line)
  if (motif === 'sun') return sunriseScene('gods')
  return emblemScene(line, motif)
}

/* ══ THE FRAME ════════════════════════════════════════════════════════ */

/*
 * The colour block is a separate pull and never lands exactly on the key. The
 * offset changes at each section — a new pull — and never inside one.
 */
const REGISTER = [[5, -3], [-4, 3], [6, 4], [-5, -4], [4, 5], [-6, 2], [3, -5], [-3, 4], [6, -2], [-4, -3]]

const STEP_EASE = 0.09

/** When each cut goes down: explicit times, else the words' onsets shared out. */
function schedule(cuts, stepTimes) {
  const n = cuts.length
  const steps = stepTimes.length
  return cuts.map((cut, i) => {
    const s = steps ? Math.min(steps - 1, Math.floor((i * steps) / n)) : 0
    const share = steps ? stepTimes[s] : 0
    if (cut && typeof cut === 'object') return { svg: cut.svg, at: cut.at ?? share, under: Boolean(cut.under) }
    return { svg: cut, at: share, under: false }
  })
}

/** The cuts that are down by `now`, as { under, over }: under the key block, or through it. */
function carve(now, cuts, stepTimes) {
  const out = { under: '', over: '' }
  for (const c of schedule(cuts, stepTimes)) {
    if (now < c.at) continue
    const k = easeOut(ramp(now, c.at, c.at + STEP_EASE))
    out[c.under ? 'under' : 'over'] += k >= 1 ? c.svg : `<g opacity="${r(k, 2)}">${c.svg}</g>`
  }
  return out
}

/** The lyric, cut out of the lower block. Faint until sung, paper once it is. */
function banner(now, line, uid, o = {}) {
  const rows = splitLine(line.text, 6)
  const banks = bankWords(line, rows)
  const tracking = 3
  const measure = 1330
  const cap = rows.length > 1 ? 66 : 104
  const size = Math.min(...rows.map((row) => sizeToMeasure(row, measure, cap, tracking)))
  const lead = size * 1.12
  const first = BAN_MID - ((rows.length - 1) * lead) / 2 + size * 0.36
  return rows.map((row, i) => {
    const y = first + i * lead
    const len = Math.min(measure, advance(row, size, tracking))
    const through = throughRow(now, row, banks[i])
    const id = `${uid}-row${i}`
    const base = { x: 800, y, size, text: row, len, anchor: 'middle', weight: 700, tracking }
    return `<clipPath id="${id}"><rect x="${I(800 - len / 2 - 10)}" y="${I(y - size)}" width="${I((len + 20) * through)}" height="${I(size * 1.4)}"/></clipPath>
      ${t({ ...base, fill: PAPER, opacity: 0.3 })}
      ${through > 0 ? t({ ...base, fill: o.sung ?? PAPER, extra: `clip-path="url(#${id})"` }) : ''}`
  }).join('')
}

/** The instrumental banner: a row of carved diamonds, one cut through per bar. */
function ornament(now, from, to) {
  const n = 23
  const bars = Math.floor((now - from) / 2)
  const total = Math.max(1, Math.floor((to - from) / 2))
  const lit = Math.min(n, Math.round(((bars + 1) * n) / total))
  let on = ''
  let off = ''
  for (let i = 0; i < n; i++) {
    const x = 800 + (i - (n - 1) / 2) * 56
    const d = `M${pt(x, BAN_MID - 20)}L${pt(x + 14, BAN_MID)}L${pt(x, BAN_MID + 20)}L${pt(x - 14, BAN_MID)}Z`
    if (i < lit) on += d
    else off += d
  }
  return fill(off, PAPER, ' opacity="0.3"') + fill(on, PAPER)
}

/** The title, cut letter by letter over the first bars of the intro. */
function titleBanner(now, score, uid) {
  const text = score.title
  const size = 96
  const tracking = 10
  const len = advance(text, size, tracking)
  // Cut on the bar: 0.03 + 2k, from the second bar.
  const bar = Math.floor((now - 0.03) / 1)
  const through = clamp01((bar - 1) / 5)
  const id = `${uid}-title`
  const base = { x: 800, y: 812, size, text, len, anchor: 'middle', weight: 700, tracking }
  const band = now < 13.53 ? t({ x: 800, y: 716, size: 24, text: score.artist, fill: VERMILION, anchor: 'middle', weight: 700, tracking: 14 }) : ''
  return `${band}<clipPath id="${id}"><rect x="${I(800 - len / 2 - 10)}" y="${I(812 - size)}" width="${I((len + 20) * through)}" height="${I(size * 1.4)}"/></clipPath>
    ${t({ ...base, fill: PAPER, opacity: 0.3 })}
    ${t({ ...base, fill: PAPER, extra: `clip-path="url(#${id})"` })}`
}

/** Eighths on the measured grid — the band played to a click, so it is real here. */
const eighth = (now) => Math.floor((now - 0.03) / 0.25)

/**
 * One frame of the film.
 *
 * @param {object} o
 * @param {number} o.time   Seconds into the song.
 * @param {object} o.score  app/config/intoTheWildScore.ts, or any score shaped like it.
 * @param {string} [o.lockup] The band's stacked mark as inline SVG, for the end card.
 * @param {string} [o.uid]  Prefix for every id in the frame.
 * @returns {{ svg: string, label: string }}
 */
export function woodcutFrame({ time, score, lockup = '', uid = 'wood' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const section = sectionAt(score, now)
  const sectionIndex = score.sections.indexOf(section)
  const kind = section.kind
  const shown = shownLineAt(score, now)
  const active = lineAt(score, now)
  const lineHere = shown && shown.section === section.id ? shown : null

  /* ── Which block is on the press ───────────────────────────────────── */
  let scene
  let steps = []
  let lyric = ''
  if (kind === 'intro') {
    scene = sunriseScene('sunrise')
    for (let k = 1; k * 1 < section.to; k++) steps.push(0.03 + k * 1.5)
    lyric = titleBanner(now, score, uid)
  }
  else if (kind === 'chorus' || kind === 'outro') {
    const n = kind === 'outro' ? 3 : Number(section.id.split('-')[1]) || 1
    scene = chorusScene(Math.min(3, n))
    const home = kind === 'outro' ? score.sections.find((s) => s.id === 'chorus-3') ?? section : section
    const words = score.lines.filter((l) => l.section === home.id).flatMap((l) => l.words.map((w) => w.t))
    steps = words.slice()
    const last = words[words.length - 1] ?? home.from
    for (let tt = last + 1; tt < home.to; tt += 1) steps.push(tt)
    if (lineHere) lyric = banner(now, lineHere, uid)
    // After the last line clears, the lower block is a finished row of diamonds.
    else if (kind === 'outro') lyric = ornament(section.to, section.from, section.to)
  }
  else if (kind === 'break' || kind === 'solo') {
    scene = hornsScene(kind)
    for (let tt = section.from + 0.5; tt < section.to; tt += 2) steps.push(tt)
    lyric = ornament(now, section.from, section.to)
  }
  else if (lineHere) {
    scene = verseScene(lineHere)
    steps = lineHere.words.map((w) => w.t)
    lyric = banner(now, lineHere, uid)
  }
  else {
    // Between lines of a verse before its first cut-in: an uncut block.
    scene = { ground: INK, colour: '', key: '', cuts: [] }
  }

  /* ── Per-frame parts: the crowd's arms, the runner ────────────────── */
  let live = ''
  if (scene.crowd && lineHere) {
    const idx = lineHere.words.reduce((out, w, i) => (now >= w.t ? i : out), -1)
    const stage = lineHere.words.find((w) => w.text.toLowerCase().startsWith('stage'))
    live = crowdMass(idx, stage ? now >= stage.t : false)
  }
  if (scene.runner) {
    const home = kind === 'outro' ? score.sections.find((s) => s.id === 'chorus-3') ?? section : section
    const step = eighth(now) - eighth(home.from)
    const x = 170 + Math.max(0, step) * 16
    live = person(Math.min(x, 1250), 590, 172, runPose(eighth(now)), INK)
    const wildAt = score.lines.filter((l) => l.section === home.id).flatMap((l) => l.words).find((w) => /^wild/i.test(w.text))?.t
    if (wildAt != null && now >= wildAt) {
      const k = easeOut(ramp(now, wildAt, wildAt + STEP_EASE))
      live = (k < 1 ? `<g opacity="${r(k, 2)}">${scene.wild}</g>` : scene.wild) + live
    }
  }

  const carved = carve(now, scene.cuts, steps)
  const [dx, dy] = REGISTER[sectionIndex % REGISTER.length]
  const clip = `${uid}-blk`
  const picture = [
    `<clipPath id="${clip}"><path d="${BLOCK}"/></clipPath>`,
    `<g clip-path="url(#${clip})">`,
    `<rect x="${X0 - 20}" y="${Y0 - 20}" width="${X1 - X0 + 40}" height="${Y1 - Y0 + 40}" fill="${scene.ground}"/>`,
    scene.colour ? `<g transform="translate(${dx} ${dy})">${scene.colour}</g>` : '',
    carved.under,
    scene.key,
    carved.over,
    live,
    fill(SPECKS, PAPER, ' opacity="0.4"'),
    '</g>',
  ].join('')

  return {
    svg: [
      `<rect width="1600" height="900" fill="${PAPER}"/>`,
      picture,
      fill(BANNER, INK),
      lyric,
    ].join('\n'),
    label: active?.text ?? section.label,
  }
}
