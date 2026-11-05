/*
 * Job 6, the concert hall at the crown: four ways to plan it (exploration,
 * 2026-11-05). Verse 4: "Watch me split the ground and pierce the sky and
 * find a groove ... I could handle all the eyes". Five crew, the ushers in
 * ink, and everything taken before in green, unlabelled: the hall was built
 * from it.
 *
 * The crown is where the shank (High Street) meets the arms (the Crescent);
 * south of it a riverside park runs down to the bank (y 933 at x 400). Near
 * the crown the Crescent is, to a metre, a circle of radius 233.2 about
 * [400, 624.8]; its outer kerb is R 241.2.
 */
import { wall, arcWall, merge, box, sector, Pc } from '../shop.mjs'

const SHEET = ['THE CONCERT HALL', 'JOB No. 5 · 1975', 'SHEET 5/6']
const WORDS = 'WATCH ME SPLIT THE GROUND AND PIERCE THE SKY'
const CRES = [400, 624.8]
const CRES_R = 233.2

/** The Crescent's near lane (3 m south of its centre line) at town x, in job y for origin o. */
const lane = (o, x) => CRES[1] + Math.sqrt(CRES_R ** 2 - (o[0] + x - CRES[0]) ** 2) + 3 - o[1]

/** Seat rows: arcs about c (job metres), each radius over each [d0, d1] span (< 180°). */
const rows = (c, radii, spans, { dash = '', op = 0.55, w = 0.8 } = {}) => (ctx) => {
  let d = ''
  for (const R of radii) for (const [a, b] of spans) d += ctx.arc(ctx.A(c), R * ctx.s, a, b)
  return `<path d="${d}" stroke="${ctx.INK}" stroke-width="${w}" fill="none" opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
}
const range = (a, b, step) => Array.from({ length: Math.floor((b - a) / step + 1e-6) + 1 }, (_, i) => a + i * step)
const both = (...fs) => (ctx) => fs.map((f) => f(ctx)).join('')
/** An arc of points about c, for patrols and routes. */
const arcPath = (c, R, d0, d1, n = 6) => Array.from({ length: n + 1 }, (_, i) => Pc(c, R, d0 + ((d1 - d0) * i) / n))

/* ── A · The fan ──────────────────────────────────────────────────────── */
const fan = (() => {
  const o = [400, 866]
  const C = [0, CRES[1] - o[1]] // the Crescent's centre, in job metres
  const S = [0, 15] // the fan's centre: centre stage
  const PY = 18 // the proscenium
  const NW = 243.5 // the north wall, following the Crescent
  const dN = (Math.acos(17 / NW) * 180) / Math.PI
  const yN = C[1] + Math.sqrt(NW ** 2 - 17 ** 2)
  const RB = 45 // the glass front on the river
  const RF = 39.5 // the back of the house
  const BK = Pc(S, RB, 33)
  const IN = (deg, R) => Pc(S, R, deg)
  return {
    key: 'fan', title: 'A · The fan',
    about: 'The hall is built into the crown itself. Its back wall follows the Crescent, its stage sits where the three lines of the anchor meet, and the seats fan out towards the river, so every row looks back up at the crown. The stage door is at the very end of High Street. He buys a ticket on the riverside, walks down the aisle and up onto the stage, while the digger comes up through the trap and the flyer drops down the fly tower to meet him.',
    sheet: SHEET, words: WORDS, o, view: [0, 22, 8.6],
    foot: [
      [...arcPath(C, NW, dN, 180 - dN, 12), [-17, PY], [-BK[0], BK[1]], ...arcPath(S, RB, 147, 33, 24), [17, PY]],
      box(17, 3, 29, 16), box(-29, 3, -17, 16),
    ],
    walls: merge(
      arcWall('ext', NW, dN, 180 - dN, [[89.6, 90.4, 1]], C),
      wall('ext', [17, yN], [17, PY], [[5.2, 6.6, -1]]),
      wall('ext', [-17, yN], [-17, PY], [[5.2, 6.6, 1]]),
      wall('heavy', [-17, PY], [-8, PY]), wall('heavy', [8, PY], [17, PY]),
      wall('ext', [17, PY], BK),
      wall('ext', [-17, PY], [-BK[0], BK[1]]),
      arcWall('ext', RB, 33, 147, [[37, 66, 'g'], [70, 73.6, 1], [106.4, 110, -1], [114, 143, 'g']], S),
      arcWall('int', RF, 35.4, 144.6, [[69, 73, 1], [107, 111, -1]], S),
      // The wings' outbuildings: dressing rooms east, green room west.
      wall('ext', [17, 3], [29, 3]), wall('ext', [29, 3], [29, 16]), wall('ext', [17, 16], [29, 16], [[8, 9.4, -1]]),
      wall('ext', [-29, 3], [-17, 3]), wall('ext', [-29, 3], [-29, 16]), wall('ext', [-29, 16], [-17, 16], [[2.6, 4, 1]]),
    ),
    tone: [box(17, 3, 29, 16), box(-29, 3, -17, 16)],
    under: both(
      rows(S, range(9, 21.6, 2.1), [[40, 68], [74, 106], [112, 140]]),
      rows(S, range(26.6, 37.2, 2.1), [[40, 68], [74, 106], [112, 140]]),
      (ctx) => `<path d="${ctx.arc(ctx.A(S), 6 * ctx.s, 30, 150)}" stroke="${ctx.INK}" stroke-width="1.2" fill="none"/>`,
    ),
    items: [
      { k: 'zone', style: 'over', x: -16, y: 2.6, w: 32, h: 15.4, label: 'FLY TOWER, ABOVE' },
      { k: 'zone', style: 'under', x: -3.4, y: 11.6, w: 6.8, h: 5.6 },
      { k: 'take', x: -1.2, y: 13.6, w: 2.4, h: 2.4 },
      { k: 'rect', x: 13.2, y: 9.2, w: 2.4, h: 1.4 },
      { k: 'rect', x: 18, y: 3.6, w: 10, h: 0.7 }, { k: 'rect', x: -28, y: 3.6, w: 5, h: 2.2 },
      { k: 'rect', x: IN(58, 42.2)[0] - 1.6, y: IN(58, 42.2)[1] - 0.9, w: 3.2, h: 1.8 },
      // Everything taken before.
      { k: 'loot', x: 24.6, y: 4.5, w: 1.4, h: 1.0 },
      { k: 'loot', x: IN(58, 42.2)[0] - 0.6, y: IN(58, 42.2)[1] - 0.4, w: 1.2, h: 0.8 },
      { k: 'loot', x: -27.4, y: 7.4, w: 3, h: 0.5 }, { k: 'loot', x: -27.4, y: 8.4, w: 3, h: 0.5 },
      { k: 'loot', x: IN(122, 43.6)[0] - 1.8, y: IN(122, 43.6)[1] - 0.25, w: 3.6, h: 0.5 },
      { k: 'loot', x: -21, y: 12, r: 0.7 },
    ],
    rooms: [[-7.4, 10.6, 'STAGE'], [0, 39.4, 'THE HOUSE'], [...IN(90, 42.3), 'FOYER', 0, 11], [23, 13.4, 'DRESSING', 0, 10], [-23, 14, 'GREEN ROOM', 0, 10],
      [-26, -12.4, 'THE CRESCENT', 6], [-3.4, -17, 'HIGH ST.', 90, 10], [...IN(113, 49.6), 'THE PROMENADE', 23, 11]],
    marks: [[29.6, 26.4, 'BRICK · 1 ST. · FLY 4 ST.', 46]],
    storeys: [[-13.4, 15.6, '4']],
    dims: [],
    owners: [{ pts: [IN(71, 10), IN(71, 37)], period: 10 }, { pts: [IN(109, 37), IN(109, 10)], period: 12 }],
    ownerLabel: 'The ushers',
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 168.5, to: 187, pts: [
        [14, 56], IN(71.8, 49), IN(71.8, 44), [...IN(61, 42), 3, 'buys a ticket'], IN(70.5, 41.8), IN(70.5, 37.4), IN(70.5, 24), IN(70.5, 8), IN(80, 4.6), [0.2, 15.4, 4.7, 'all the eyes on me'],
      ] },
      { n: 2, role: 'The digger', style: 'longdash', from: 171, to: 186, pts: [
        [-48, 33], [-45, 30, 2.3, 'splits the ground'], [-1.2, 15.6, 3, null, 'jump'], [-44.4, 30.6, 0, null, 'jump'], [-47.4, 33.6],
      ] },
      { n: 3, role: 'The flyer', style: 'dashdot', from: 170.3, to: 184, pts: [
        [44, -8], [38, -4, 1.5, 'pierces the sky'], [1.6, 14.4, 3, null, 'jump'], [38.6, -3.4, 0, null, 'jump'], [44.6, -7.4],
      ] },
      { n: 4, role: 'The stagehand', style: 'dash', from: 168, to: 186, pts: [
        [-1.4, lane(o, -1.4)], [-1.4, 0.4], [-1.4, 3], [1, 6.6], [10.4, 6.6], [12.6, 8.6, 5, 'on the lights'], [10.4, 7.2], [1.6, 7.2], [-0.8, 3], [-0.8, 0.4], [-0.8, lane(o, -0.8)],
      ] },
      { n: 5, role: 'The driver', style: 'dot', from: 167.5, to: 187, pts: [[-58, lane(o, -58)], [-36, lane(o, -36)], [-16, lane(o, -16)], [6, lane(o, 6), 0, 'engine running']] },
    ],
  }
})()

/* ── B · The shoebox ──────────────────────────────────────────────────── */
const shoebox = (() => {
  const o = [368, 872]
  return {
    key: 'shoebox', title: 'B · The shoebox',
    about: 'The plan the film has now, redrawn in the atlas: a long brick hall square to High Street, the foyer on the Crescent, the house in curved rows, the stage towards the river. The fly tower above is drawn dash-dotted and the trap room below long-dashed, as an architect draws what is over and under the cut. He buys a ticket and takes the centre aisle while the digger comes up from the forecourt manhole and the flyer comes down from the tower roof.',
    sheet: SHEET, words: WORDS, o, view: [32, 21, 8.7],
    foot: [box(0, 0, 64, 52)],
    walls: merge(
      wall('ext', [0, 0], [64, 0], [[14, 26, 'g'], [28, 31.8, 1], [32.2, 36, -1], [38, 50, 'g']]),
      wall('ext', [64, 0], [64, 52], [[46, 48, -1]]),
      wall('ext', [0, 52], [64, 52], [[6, 8, 1]]),
      wall('ext', [0, 0], [0, 52]),
      wall('int', [0, 9], [64, 9], [[10, 13, 0], [51, 54, 0]]),
      wall('int', [10, 0], [10, 9], [[5.4, 7, 1]]), wall('int', [54, 0], [54, 9], [[5.4, 7, -1]]),
      wall('heavy', [0, 34], [64, 34], [[16, 48, 0]]),
      wall('int', [0, 44], [64, 44], [[12, 13.6, 1], [30, 31.6, 1], [50, 51.6, -1]]),
      wall('int', [22, 44], [22, 52]), wall('int', [42, 44], [42, 52]),
    ),
    tone: [box(0, 44, 22, 52), box(42, 44, 64, 52)],
    under: rows([32, 34], range(6, 20.4, 2.4), [[205, 262], [278, 335]]),
    items: [
      { k: 'zone', style: 'over', x: 14, y: 31, w: 36, h: 15, label: 'FLY TOWER, ABOVE' },
      { k: 'zone', style: 'under', x: 25, y: 36.2, w: 14, h: 6 },
      { k: 'take', x: 30.8, y: 37.6, w: 2.4, h: 2.4 },
      { k: 'rect', x: 28, y: 10.6, w: 8, h: 1.6 },
      { k: 'rect', x: 1, y: 2.4, w: 0.8, h: 4 },
      { k: 'cam', x: 1.4, y: 10.4, dir: 40, reach: 9, spread: 14 }, { k: 'cam', x: 62.6, y: 10.4, dir: 140, reach: 9, spread: 14 },
      { k: 'loot', x: 1.1, y: 3, w: 0.6, h: 2.6 },
      { k: 'loot', x: 34.4, y: 10.8, w: 1.2, h: 1.2 },
      { k: 'loot', x: 40, y: 0.5, w: 6, h: 0.6 },
      { k: 'loot', x: 36, y: 48.4, r: 0.8 },
      { k: 'loot', x: 3, y: 49.4, w: 3.4, h: 0.6 },
    ],
    rooms: [[32, 5.4, 'FOYER'], [5.4, 7.4, 'BOX OFFICE', 0, 10], [59, 3.6, 'OFFICE', 0, 10], [32, 22.4, 'THE HOUSE'], [45, 40.4, 'STAGE'], [7.5, 39.6, 'WINGS', 0, 10], [56.5, 39.6, 'WINGS', 0, 10],
      [15, 48.6, 'DRESSING', 0, 10], [32, 50.4, 'GREEN ROOM', 0, 10], [53, 48.6, 'LOADING', 0, 10], [12, -9.6, 'THE CRESCENT', -3], [27.6, -17, 'HIGH ST.', 90, 10]],
    marks: [[-1.4, 26, 'BRICK · 2 ST. · FLY 5 ST.', -90], [44, 1.5, 'PLATE GLASS'], [32, 43, 'TRAP ROOM, BELOW']],
    storeys: [[61.2, 41, '5']],
    dims: [{ a: [66.4, 0], b: [66.4, 52], text: '52.00 m' }],
    owners: [{ pts: [[3.4, 15], [3.4, 31]], period: 9 }, { pts: [[60.6, 31], [60.6, 15]], period: 11 }],
    ownerLabel: 'The ushers',
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 168.5, to: 187, pts: [
        [32, -7], [32, 0], [30, 4], [13.4, 4, 3, 'buys a ticket'], [11.6, 9], [11.6, 12], [32, 12.6], [32, 28], [32, 38.8, 4.7, 'all the eyes on me'],
      ] },
      { n: 2, role: 'The digger', style: 'longdash', from: 171, to: 186, pts: [
        [-6, -7], [-6, -3.4, 2.3, 'splits the ground'], [31.2, 39.6, 3, null, 'jump'], [-6, -2.8, 0, null, 'jump'], [-6, -7],
      ] },
      { n: 3, role: 'The flyer', style: 'dashdot', from: 170.3, to: 184, pts: [
        [74, 22], [70, 26, 1.5, 'pierces the sky'], [33.6, 39.4, 3, null, 'jump'], [70.4, 26.6, 0, null, 'jump'], [74.4, 22.6],
      ] },
      { n: 4, role: 'The stagehand', style: 'dash', from: 168, to: 186, pts: [
        [7, 58], [7, 52], [12.8, 46], [12.8, 43], [8, 38.5, 5, 'on the lights'], [12.8, 43], [12.8, 46], [7, 52], [7, 58],
      ] },
      { n: 5, role: 'The driver', style: 'dot', from: 167.5, to: 187, pts: [[-14, lane(o, -14)], [10, lane(o, 10)], [32, lane(o, 32)], [42, lane(o, 42), 0, 'engine running']] },
    ],
  }
})()

/* ── C · In the round ─────────────────────────────────────────────────── */
const round = (() => {
  const o = [400, 900]
  const Z = [0, 0]
  const V = [45, 135, 225, 315] // vomitories
  const spans = []
  for (let a = 0; a < 360; a += 90) spans.push([a + 2.5, a + 39], [a + 51, a + 87.5])
  const at = (R, d) => Pc(Z, R, d)
  return {
    key: 'round', title: 'C · In the round',
    about: 'A round hall at the crown with the stage in the middle and every seat facing it: all the eyes. The doors open straight onto the end of High Street. Everything the crew has taken before stands in glass cases round the concourse, as if the hall were a museum of them. He buys a ticket, walks the concourse and comes down a tunnel onto the stage. The digger comes up through the trap from the river, and the flyer drops through the lighting rig from the roof.',
    sheet: SHEET, words: WORDS, o, view: [0, -6, 9.2],
    foot: [sector(0, 27.6, 0, 360, 72)],
    walls: merge(
      arcWall('ext', 27, 0, 360, [[78, 85, 'g'], [86.6, 89.8, 1], [90.2, 93.4, -1], [95, 102, 'g'], [252, 260, 'g'], [262, 269.8, 1], [270.2, 278, -1], [280, 288, 'g']]),
      arcWall('int', 21, 0, 360, V.map((v) => [v - 5.5, v + 5.5, 0]).concat([[176, 184, 0]]).sort((a, b) => a[0] - b[0])),
    ),
    tone: [],
    under: both(
      rows(Z, range(7.4, 19.4, 2), spans),
      (ctx) => `<circle cx="${ctx.r(ctx.A(Z)[0])}" cy="${ctx.r(ctx.A(Z)[1])}" r="${ctx.r(5.4 * ctx.s)}" fill="${ctx.PAPER}" stroke="${ctx.INK}" stroke-width="1.4"/>`,
    ),
    items: [
      { k: 'zone', style: 'over', x: -9, y: -9, w: 18, h: 18, label: 'THE RIG, ABOVE' },
      { k: 'zone', style: 'under', x: -3, y: -3, w: 6, h: 6 },
      { k: 'take', x: -1.2, y: -1.2, w: 2.4, h: 2.4 },
      { k: 'rect', x: 4.2, y: -24.6, w: 4.4, h: 1.2 },
      { k: 'rect', x: -25.6, y: -1.8, w: 1.4, h: 3.6 },
      // The cases on the concourse, and what is in them.
      ...[[200, 'r'], [160, 'w'], [340, 'w'], [20, 'r'], [300, 'b']].map(([d, kind]) => {
        const p = at(24.6, d)
        return [{ k: 'rect', x: p[0] - 1.1, y: p[1] - 1.1, w: 2.2, h: 2.2 }, kind === 'r'
          ? { k: 'loot', x: p[0], y: p[1], r: 0.6 }
          : { k: 'loot', x: p[0] - 0.7, y: p[1] - (kind === 'w' ? 0.25 : 0.6), w: 1.4, h: kind === 'w' ? 0.5 : 1.2 }]
      }).flat(),
    ],
    rooms: [[0, 7.6, 'STAGE', 0, 11], [0, -14, 'THE HOUSE'], [...at(24.2, 60), 'CONCOURSE', -30, 10], [32, lane(o, 32) - 1.6, 'THE CRESCENT', -8], [-3.4, -34, 'HIGH ST.', 90, 10], [18, 32.4, 'THE PROMENADE', 0, 11]],
    marks: [[...at(29.4, 30), 'BRICK · DOME · 3 ST.', -60]],
    storeys: [[...at(27, 225), '3']],
    dims: [],
    owners: [{ pts: arcPath(Z, 23.4, 200, 250), period: 9 }, { pts: arcPath(Z, 23.4, 290, 340), period: 11 }],
    ownerLabel: 'The ushers',
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 168.5, to: 187, pts: [
        [0, -38], [0, -27], at(24, 268), [...at(24, 284), 3, 'buys a ticket'], at(24, 300), at(23.4, 315), at(19, 315), at(7.8, 315), [0.4, -0.6, 4.7, 'all the eyes on me'],
      ] },
      { n: 2, role: 'The digger', style: 'longdash', from: 171, to: 186, pts: [
        [-22, 34], [-22, 30, 2.3, 'splits the ground'], [-0.6, 0.8, 3, null, 'jump'], [-21.4, 30.4, 0, null, 'jump'], [-21.4, 34],
      ] },
      { n: 3, role: 'The flyer', style: 'dashdot', from: 170.3, to: 184, pts: [
        [36, -6], [33, -9, 1.5, 'pierces the sky'], [1.8, -1, 3, null, 'jump'], [33.4, -8.4, 0, null, 'jump'], [36.4, -5.4],
      ] },
      { n: 4, role: 'The stagehand', style: 'dash', from: 168, to: 186, pts: [
        [5, 33], [1.6, 27], at(24, 96), at(24, 140), at(23.6, 178), [-24, 0, 5, 'on the lights'], at(23.6, 182), at(24, 140), at(24, 96), [1.6, 27], [5, 33],
      ] },
      { n: 5, role: 'The driver', style: 'dot', from: 167.5, to: 187, pts: [[-56, lane(o, -56)], [-34, lane(o, -34)], [-12, lane(o, -12)], [8, lane(o, 8), 0, 'engine running']] },
    ],
  }
})()

/* ── D · The bandshell ────────────────────────────────────────────────── */
const shell = (() => {
  const o = [400, 926]
  const S = [0, 0] // centre stage, on the bank
  const lawnR = 54
  return {
    key: 'bandshell', title: 'D · The bandshell',
    about: 'No hall at all: a summer bandshell on the river bank, the stage under a brick shell, the lawn rising in terraces up to the crown. The dressing rooms are on a barge moored behind the shell, and the getaway is by water. He comes in at the gate at the end of High Street, walks down through the crowd and up onto the stage. The digger comes up out of the old storm drain, the flyer swings down from the lighting truss, and the driver waits at the barge with the launch.',
    sheet: SHEET, words: WORDS, o, view: [0, -22, 6.9],
    foot: [
      [...arcPath(S, lawnR, 200, 340, 28), Pc(S, 15, 350), [15, 6], [-15, 6], Pc(S, 15, 190)],
      sector(0, 13.4, 0, 180, 24, [0, 1]), box(-4, 12, 4, 15), box(-15, 14, 15, 24), box(16.4, 22.6, 22, 24.8),
    ],
    walls: merge(
      arcWall('heavy', 13, 4, 176, [[86, 94, 1]], [0, 1]),
      wall('ext', [-15, 14], [15, 14], [[13.6, 16.4, 1]]),
      wall('ext', [15, 14], [15, 24]), wall('ext', [-15, 24], [15, 24]), wall('ext', [-15, 14], [-15, 24]),
      wall('int', [-4, 14], [-4, 24], [[3, 4.4, 1]]), wall('int', [4, 14], [4, 24], [[3, 4.4, -1]]),
      // The gate at the top of the lawn, at the end of High Street.
      wall('ext', [-14, -58.5], [-4.6, -58.5]), wall('ext', [4.6, -58.5], [14, -58.5]),
    ),
    tone: [box(-15, 14, 15, 24)],
    under: both(
      rows(S, range(16, 52, 3), [[205, 262], [278, 335]], { dash: '2 4', op: 0.6, w: 0.9 }),
      (ctx) => {
        const c = ctx.A([0, 1])
        return `<path d="${ctx.arc(c, 9.2 * ctx.s, 180, 360)}" stroke="${ctx.INK}" stroke-width="1.3" fill="none"/>` +
          `<path d="M${ctx.r(ctx.A([-1, 13.4])[0])} ${ctx.r(ctx.A([-1, 13.4])[1])}V${ctx.r(ctx.A([-1, 14])[1])}M${ctx.r(ctx.A([1, 13.4])[0])} ${ctx.r(ctx.A([1, 13.4])[1])}V${ctx.r(ctx.A([1, 14])[1])}" stroke="${ctx.INK}" stroke-width="1"/>`
      },
    ),
    items: [
      { k: 'zone', style: 'over', x: -10, y: -7, w: 20, h: 10, label: 'THE TRUSS, ABOVE' },
      { k: 'zone', style: 'under', x: -3, y: -2.4, w: 6, h: 5 },
      { k: 'take', x: -1.2, y: -1.4, w: 2.4, h: 2.4 },
      { k: 'rect', x: -4.6, y: -51, w: 9.2, h: 4.4, label: 'MIXING TOWER', side: 'left' },
      { k: 'rect', x: -11, y: -62.2, w: 3.4, h: 1.4 },
      { k: 'rect', x: 16.4, y: 22.6, w: 5.6, h: 2.2, label: 'LAUNCH', side: 'right' },
      { k: 'loot', x: -14, y: 16, w: 3, h: 0.5 }, { k: 'loot', x: -14, y: 17.2, w: 3, h: 0.5 },
      { k: 'loot', x: -2.8, y: 22.4, w: 1.4, h: 1 },
      { k: 'loot', x: 9, y: 23.2, w: 5, h: 0.5 },
      { k: 'loot', x: 11.6, y: 17.4, r: 0.7 },
      { k: 'loot', x: -10.6, y: -61.9, w: 2.4, h: 0.8 },
    ],
    rooms: [[0, 9, 'STAGE ON PILES', 0, 10], [0, -24, 'THE LAWN'], [-9.6, 20.6, 'DRESSING', 0, 10], [9.6, 20.4, 'GREEN ROOM', 0, 10], [0, 27.6, 'THE BARGE', 0, 11],
      [-30, lane(o, -30) - 6.4, 'THE CRESCENT', 7], [-3.4, -74, 'HIGH ST.', 90, 10], [-34, 22, 'THE RIVER', 0, 11]],
    marks: [[-22.4, 9.4, 'BRICK SHELL'], [9.4, -60.4, 'GATE']],
    storeys: [[18.4, 15.6, '1']],
    dims: [],
    owners: [{ pts: [Pc(S, 18, 265), Pc(S, 50, 265)], period: 11 }, { pts: [Pc(S, 50, 285), Pc(S, 18, 285)], period: 9 }],
    ownerLabel: 'The stewards',
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 168.5, to: 187, pts: [
        [0, -74], [-1, -66], [-6.4, -63.4, 3, 'buys a ticket'], [0, -60.2], [0, -56], [-3, -54], Pc(S, 46, 268), Pc(S, 26, 272), Pc(S, 12, 272), [0.4, -0.2, 4.7, 'all the eyes on me'],
      ] },
      { n: 2, role: 'The digger', style: 'longdash', from: 171, to: 186, pts: [
        [-32, 6], [-29, 4, 2.3, 'splits the ground'], [-0.6, 1, 3, null, 'jump'], [-28.4, 4.6, 0, null, 'jump'], [-31.4, 6.6],
      ] },
      { n: 3, role: 'The flyer', style: 'dashdot', from: 170.3, to: 184, pts: [
        [30, -22], [24, -16, 1.5, 'pierces the sky'], [1.8, -1.2, 3, null, 'jump'], [24.6, -15.4, 0, null, 'jump'], [30.6, -21.4],
      ] },
      { n: 4, role: 'The stagehand', style: 'dash', from: 168, to: 186, pts: [
        [3, -76], [2.4, -60], [6.4, -52], [5.6, -49, 5, 'on the lights'], [6.4, -52], [3, -60], [3.6, -76],
      ] },
      { n: 5, role: 'The driver', style: 'dot', from: 167.5, to: 187, pts: [[-60, 30], [-30, 31], [0, 30.6], [19.2, 23.7, 0, 'engine running']] },
    ],
  }
})()

export const VARIANTS = [fan, shoebox, round, shell]
