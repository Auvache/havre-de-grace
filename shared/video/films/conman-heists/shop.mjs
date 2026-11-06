/*
 * Job 1, the record shop: four ways to plan it (exploration, 2026-11-05).
 * Each is one conman and the owner, as the first job always was. The shop is
 * on the west circle at the end of Main Street.
 *
 * Job metres, origin `o` in the town. Walls are built from runs with gaps cut
 * in them: a gap [from, to, kind] in metres along the run (degrees on an arc),
 * kind ±1 a door with its leaf on the `from` jamb, 0 an opening, 'g' glazing,
 * 'p' a loose panel (the wall stays; a dashed line marks it).
 */
import { BALLS, STOCK_Y } from './city.mjs'

const rad = (d) => (d * Math.PI) / 180
export const P = (R, deg) => [R * Math.cos(rad(deg)), R * Math.sin(rad(deg))]

/** A straight wall from a to b with gaps (metres along it). */
export function wall(kind, a, b, gaps = []) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1])
  const at = (d) => [a[0] + ((b[0] - a[0]) * d) / L, a[1] + ((b[1] - a[1]) * d) / L]
  const out = { segs: [], doors: [], glass: [], panels: [] }
  let from = 0
  for (const [g0, g1, k = 1] of gaps) {
    if (k === 'g') { out.glass.push({ a: at(g0), b: at(g1) }); continue }
    if (k === 'p') { out.panels.push({ a: at(g0), b: at(g1) }); continue }
    if (g0 > from) out.segs.push({ kind, a: at(from), b: at(g0) })
    if (k) out.doors.push({ hinge: at(g0), jamb: at(g1), swing: k })
    from = g1
  }
  if (L > from) out.segs.push({ kind, a: at(from), b: at(L) })
  return out
}

/** An arc wall about centre c (default the job's origin), radius R, from d0 to d1 degrees, with gaps in degrees. */
export function arcWall(kind, R, d0, d1, gaps = [], c = [0, 0]) {
  const out = { segs: [], doors: [], glass: [], panels: [] }
  const Pc = (d) => { const p = P(R, d); return [c[0] + p[0], c[1] + p[1]] }
  let from = d0
  for (const [g0, g1, k = 1] of gaps) {
    if (k === 'g') { out.glass.push({ arc: { R, d0: g0, d1: g1, c } }); continue }
    if (g0 > from) out.segs.push({ kind, arc: { R, d0: from, d1: g0, c } })
    if (k) out.doors.push({ hinge: Pc(g0), jamb: Pc(g1), swing: k })
    from = g1
  }
  if (d1 > from) out.segs.push({ kind, arc: { R, d0: from, d1, c } })
  return out
}

/** P about a centre. */
export const Pc = (c, R, deg) => { const p = P(R, deg); return [c[0] + p[0], c[1] + p[1]] }

export const merge = (...ws) => ({
  segs: ws.flatMap((w) => w.segs), doors: ws.flatMap((w) => w.doors),
  glass: ws.flatMap((w) => w.glass), panels: ws.flatMap((w) => w.panels),
})
export const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
export const sector = (r0, r1, d0, d1, n = 24, c = [0, 0]) => [
  ...Array.from({ length: n + 1 }, (_, i) => Pc(c, r1, d0 + ((d1 - d0) * i) / n)),
  ...Array.from({ length: n + 1 }, (_, i) => Pc(c, r0, d1 - ((d1 - d0) * i) / n)),
]

const FROM = 23.3
const TO = 42.3

export const SHOPS = [
  /* ── A · The corner shop ──────────────────────────────────────────── */
  {
    key: 'corner', title: 'A · The corner shop',
    about: 'The plan as it is now, tidied: a small shop on Main Street, bins down the floor, the owner behind the counter, stock and an office at the back. He browses, talks shop while the owner rings up a sale, slips through the stock-room door, takes the masters and leaves by the alley.',
    o: [206, 297], w: 16, h: 11, view: [8, 5.6, 46],
    foot: [box(0, 0, 16, 11)],
    walls: merge(
      wall('ext', [0, 0], [16, 0]),
      wall('ext', [16, 0], [16, 11], [[1, 2.2, -1]]),
      wall('ext', [0, 11], [16, 11], [[0.8, 5, 'g'], [6, 7.6, 1], [8.6, 15.2, 'g']]),
      wall('ext', [0, 0], [0, 11]),
      wall('int', [0, 4], [16, 4], [[2, 3.2, 1], [11.4, 12.6, 1]]),
      wall('int', [6, 0], [6, 4]),
    ),
    tone: [box(0, 0, 16, 4)],
    items: [
      { k: 'bins', x: 0.3, y: 5, w: 0.8, h: 5.4 },
      { k: 'bins', x: 3.4, y: 6.2, w: 5, h: 0.7 },
      { k: 'bins', x: 3.4, y: 8.4, w: 5, h: 0.7 },
      { k: 'rect', x: 10, y: 6, w: 0.8, h: 3.6, label: 'COUNTER', side: 'above' },
      { k: 'ring', x: 10.4, y: 6.6, r: 0.22 },
      { k: 'rect', x: 6.4, y: 0.3, w: 9.2, h: 0.6 },
      { k: 'rect', x: 1, y: 0.8, w: 2.8, h: 1.1 },
      { k: 'take', x: 13.8, y: 1.4, w: 1.5, h: 1.2, label: 'THE MASTERS', side: 'below' },
    ],
    rooms: [[5.9, 7.75, 'SHOP FLOOR'], [9.4, 2.9, 'STOCK'], [3, 3.2, 'OFFICE'], [11.8, 13.9, 'MAIN STREET'], [17.8, 6.4, 'ALLEY', 90]],
    marks: [[-1.3, 5.5, 'BRICK · 1 ST.', -90], [3, 12.1, 'PLATE GLASS'], [12, 12.1, 'PLATE GLASS']],
    storeys: [[14.9, 9.9, '1']],
    dims: [{ a: [0, -1.6], b: [16, -1.6] }],
    owner: { pts: [[11.6, 6.4], [11.6, 9]], period: 6 },
    crew: [{ n: 1, role: 'The conman', style: 'solid', from: FROM, to: TO, pts: [
      [6.8, 14], [6.8, 11], [6.8, 9.9], [2.2, 9.9], [2.2, 7.6, 2.5, 'browses'], [2.2, 5.2], [9.2, 5.2], [9.2, 7.7, 4, 'talks shop'],
      [9.2, 5.0], [12, 5.0], [12, 3.4], [13.5, 2.5, 3, 'into his coat'], [15.2, 1.6], [17.4, 1.6], [17.4, 14],
    ] }],
  },

  /* ── B · The listening booths ─────────────────────────────────────── */
  {
    key: 'booths', title: 'B · The listening booths',
    about: 'A narrow, deep storefront in the Portland way, with three listening booths down one wall. Booth 3 backs onto the stock room. He asks to hear a record, shuts himself in booth 3, lifts the loose panel and takes the masters through the wall. Then he buys the record and walks out of the front door with the masters in its sleeve. Nobody sees him leave anything but the shop.',
    o: [214, 284], w: 8, h: 24, view: [4, 12.2, 27],
    foot: [box(0, 0, 8, 24)],
    walls: merge(
      wall('ext', [0, 0], [8, 0], [[5, 6.4, 1]]),
      wall('ext', [8, 0], [8, 24]),
      wall('ext', [0, 24], [8, 24], [[0.4, 2.9, 'g'], [3.2, 4.8, 1], [5.1, 7.6, 'g']]),
      wall('ext', [0, 0], [0, 24]),
      wall('int', [0, 3], [8, 3], [[1, 2.2, 1]]),
      wall('int', [0, 9.6], [8, 9.6], [[1, 2.2, -1], [6.3, 7.3, 'p']]),
      wall('int', [5.6, 9.6], [5.6, 16.8], [[0.6, 1.8, 1], [3, 4.2, 1], [5.4, 6.6, 1]]),
      wall('int', [5.6, 12], [8, 12]), wall('int', [5.6, 14.4], [8, 14.4]), wall('int', [5.6, 16.8], [8, 16.8]),
    ),
    tone: [box(0, 0, 8, 9.6)],
    items: [
      { k: 'rect', x: 0.4, y: 22.7, w: 2.4, h: 0.9 }, { k: 'rect', x: 5.2, y: 22.7, w: 2.4, h: 0.9 },
      { k: 'bins', x: 0.3, y: 10.4, w: 0.7, h: 10.4 },
      { k: 'bins', x: 2.8, y: 10.8, w: 1.1, h: 7.6 },
      { k: 'rect', x: 5.6, y: 17.8, w: 0.8, h: 3.4, label: 'COUNTER', side: 'above' },
      { k: 'ring', x: 6, y: 18.4, r: 0.2 },
      { k: 'rect', x: 7.1, y: 10.2, w: 0.6, h: 1.2 }, { k: 'rect', x: 7.1, y: 12.6, w: 0.6, h: 1.2 }, { k: 'rect', x: 7.1, y: 15, w: 0.6, h: 1.2 },
      { k: 'rect', x: 0.3, y: 3.4, w: 0.6, h: 5.8 }, { k: 'rect', x: 1.8, y: 3.4, w: 3, h: 0.6 },
      { k: 'take', x: 5.6, y: 7.9, w: 2.1, h: 1.2, label: 'THE MASTERS', side: 'left' },
      { k: 'stairs', x: 0.4, y: 0.4, w: 1.6, h: 1.9, label: 'DN', dir: 'down' },
    ],
    rooms: [[1.9, 15, 'SHOP FLOOR', -90], [3.4, 6.6, 'STOCK'], [4.6, 1.9, 'BACK'], [4, 26.4, 'MAIN STREET'], [4, -1.5, 'YARD'],
      [6.4, 11.2, '3', 0, 11], [6.4, 13.6, '2', 0, 11], [6.4, 16, '1', 0, 11]],
    marks: [[-1.3, 12, 'BRICK · 1 ST. · BSMT', -90], [9.3, 12.9, 'BOOTHS', 90], [8.7, 9.6, 'LOOSE PANEL', 0, 'right']],
    storeys: [[7.1, 1.6, '1B']],
    dims: [{ a: [-2.6, 0], b: [-2.6, 24], text: '24.00 m' }],
    owner: { pts: [[7.1, 18.2], [7.1, 20.8]], period: 7 },
    crew: [{ n: 1, role: 'The conman', style: 'solid', from: FROM, to: TO, pts: [
      [4, 27], [4, 24], [2.3, 21.6], [2.3, 15.5, 3, 'browses'], [2.3, 10.2], [4.6, 10.2], [4.6, 18.6, 2.5, 'asks to hear one'],
      [4.6, 11.4], [5, 10.8], [6.6, 10.8, 4.5, 'listens'], [6.8, 9.9, 2.5, 'through the panel'], [6.6, 10.9], [4.95, 10.9],
      [4.95, 20.3, 2, 'buys it'], [4.4, 22.2], [4, 24], [4, 27],
    ] }],
  },

  /* ── C · On the circle ────────────────────────────────────────────── */
  (() => {
    const A0 = -62
    const A1 = -28
    return {
      key: 'circle', title: 'C · On the circle',
      about: 'The shop is the curved front of the west circle itself. Its plate glass follows the road, and the bins fan out from the door like spokes. While the owner fetches a box from the stock room, he goes round the end of the curved counter, takes the masters from the office safe and leaves by the staff door onto Main Street.',
      o: [BALLS[0][0], STOCK_Y], w: 26, h: 26, view: [30.6, -30.6, 24],
      foot: [sector(37.6, 49.9, A0 - 0.4, A1 + 0.4)],
      walls: merge(
        arcWall('ext', 38, A0, A1, [[-61, -48.6, 'g'], [-47.2, -42.8, 1], [-41.4, -29, 'g']]),
        arcWall('ext', 49.5, A0, A1),
        wall('ext', P(38, A0), P(49.5, A0)),
        wall('ext', P(38, A1), P(49.5, A1), [[7.4, 8.6, -1]]),
        arcWall('int', 44.6, A0, A1, [[-58.6, -55.8, 1], [-46.6, -43.8, 1], [-33.6, -30.8, -1]]),
        wall('int', P(44.6, -52), P(49.5, -52)),
        wall('int', P(44.6, -38), P(49.5, -38)),
      ),
      tone: [sector(44.6, 49.5, A0, A1)],
      items: [
        ...[-58.5, -54.5, -35.5, -31.5].map((d) => ({ k: 'rbin', deg: d, r0: 39.6, r1: 42.8, t: 0.75 })),
        { k: 'arcbar', R: 43.3, d0: -50.5, d1: -39.5, t: 0.7, label: 'COUNTER' },
        { k: 'arcbar', R: 48.9, d0: -61, d1: -53, t: 0.6 },
        { k: 'take', x: P(48.3, -45)[0] - 0.7, y: P(48.3, -45)[1] - 0.5, w: 1.4, h: 1.0, label: 'THE MASTERS', side: 'left' },
      ],
      rooms: [[...P(47.1, -57), 'STOCK', 33], [...P(47.1, -40.6), 'OFFICE', 49.4], [...P(47.1, -33), 'STAFF', 57], [...P(40.7, -45), 'SHOP FLOOR', 45],
        [...P(31.5, -45), 'WEST CIRCLE', 45], [52, -3.6, 'MAIN STREET']],
      marks: [[...P(51.4, -45), 'BRICK · 1 ST.', 45], [...P(36.6, -55), 'PLATE GLASS', 35], [...P(36.6, -35), 'PLATE GLASS', 55]],
      storeys: [[...P(47, -63.2), '1']],
      dims: [],
      owner: { pts: [P(44, -45), P(44, -57.2), P(46.4, -57.2)], period: 12 },
      // Pinned to the record (the user, 2026-11-06): he browses, talks shop until the owner is at the stock-room door
      // (36.6, motion.mjs), then goes for the safe at a run, grabs the masters and is out of the staff door by 41.4.
      crew: [{ n: 1, role: 'The conman', style: 'solid', from: FROM, to: TO, pts: [
        P(33.5, -45), P(38, -45), P(39, -52.5), P(39.2, -56.5), [...P(41.2, -56.5), 3, 'browses', null, 26.4], P(39.2, -56.5), P(39.4, -49), [...P(42.4, -46.5), 0, 'talks shop', null, 30.6],
        [...P(42.4, -46.5), 0, null, null, 36.6], [...P(42.4, -38.4), 0, null, null, 37.2],
        P(44, -38.4), P(44, -45.2), P(45.8, -45.2), [...P(47.5, -45.4), 0.8, 'opens the safe', null, 38.2], P(45.8, -45.2), P(44, -45.2),
        P(44, -32.2), P(46.2, -32.2), P(46.2, -29.4), P(46.2, -24), [P(46.2, -24)[0], -8, 0, null, null, 41.4],
      ] }],
    }
  })(),

  /* ── D · Upstairs ─────────────────────────────────────────────────── */
  {
    key: 'upstairs', title: 'D · Upstairs',
    about: 'The masters are not in the shop. They are in the owner\'s flat upstairs, in a room he calls the archive. The plan shows both floors side by side, as an architect would. He browses and talks shop, slips through the staff door and goes up the back stairs. He takes the masters from the archive, climbs out of the living-room window and comes down the fire escape into the yard.',
    o: [208, 298], w: 14, h: 10, view: [16.6, 5.2, 36],
    foot: [box(0, 0, 14, 10)],
    sheets: [{ x: 15.8, y: -2.2, w: 17.6, h: 14, label: 'FIRST FLOOR' }, { x: -1.4, y: -2.2, w: 16.8, h: 0, label: 'GROUND FLOOR' }],
    walls: merge(
      wall('ext', [0, 0], [14, 0]),
      wall('ext', [14, 0], [14, 10], [[5.6, 6.8, -1]]),
      wall('ext', [0, 10], [14, 10], [[0.6, 4.6, 'g'], [5.4, 7, 1], [7.8, 13.2, 'g']]),
      wall('ext', [0, 0], [0, 10]),
      wall('int', [10, 0], [10, 4.6]),
      wall('int', [10, 4.6], [14, 4.6], [[0.6, 1.8, -1]]),
      // First floor.
      wall('ext', [18, 0], [32, 0]),
      wall('ext', [32, 0], [32, 10]),
      wall('ext', [18, 10], [32, 10], [[1, 5, 'g'], [7, 12, 'g']]),
      wall('ext', [18, 0], [18, 10], [[6, 8, 'g']]),
      wall('int', [28, 0], [28, 4.6]),
      wall('int', [24, 4.6], [32, 4.6], [[4.6, 5.8, -1]]),
      wall('int', [24, 0], [24, 10], [[6, 7.2, 1]]),
      wall('int', [18, 5], [24, 5], [[2, 3.2, 1]]),
    ),
    tone: [box(18, 0, 24, 5)],
    items: [
      { k: 'bins', x: 0.3, y: 1, w: 0.8, h: 7.6 },
      { k: 'bins', x: 3, y: 3.4, w: 4.4, h: 0.7 },
      { k: 'bins', x: 3, y: 5.8, w: 4.4, h: 0.7 },
      { k: 'rect', x: 8, y: 6.6, w: 3.6, h: 0.8, label: 'COUNTER', side: 'above' },
      { k: 'stairs', x: 10.4, y: 0.4, w: 1.5, h: 3.8, label: 'UP', dir: 'up' },
      { k: 'stairs', x: 28.4, y: 0.4, w: 1.5, h: 3.8, label: 'DN', dir: 'down' },
      { k: 'take', x: 18.3, y: 0.3, w: 5.4, h: 0.8, label: 'THE MASTERS', side: 'below' },
      { k: 'rect', x: 19, y: 6.6, w: 2.2, h: 3 },
      { k: 'rect', x: 25.6, y: 0.4, w: 2, h: 0.7 },
      { k: 'rect', x: 26.2, y: 7.6, w: 3.4, h: 1.4 },
      { k: 'escape', x: 16.3, y: 5.6, w: 1.4, h: 3.4, label: 'FIRE ESC.' },
    ],
    rooms: [[5.2, 1.7, 'SHOP FLOOR'], [22.3, 3.5, 'THE ARCHIVE'], [22.6, 8.6, 'BEDROOM'], [26, 2.6, 'KITCHEN'], [28.4, 5.6, 'LIVING ROOM'],
      [7, 12.9, 'MAIN STREET'], [15.4, 2.6, 'YARD', -90]],
    marks: [[-1.3, 5, 'BRICK · 2 ST.', -90]],
    storeys: [[1.3, 8.9, '2']],
    dims: [],
    owner: { pts: [[8.6, 5.7], [11.2, 5.7]], period: 7 },
    crew: [{ n: 1, role: 'The conman', style: 'solid', from: FROM, to: TO, pts: [
      [6.2, 12.6], [6.2, 10], [6.2, 8.8], [2.1, 8.8], [2.1, 5, 3, 'browses'], [2.1, 7.6], [7.6, 8.4, 4, 'talks shop'], [12.8, 8.2], [11.2, 5.4],
      [11.2, 3.8], [11.15, 2.3, 1, 'up the back stairs'], [29.15, 2.3, 0, null, 'jump'], [29.2, 4], [29.2, 6.2], [24.6, 6.6], [20.6, 6.6],
      [20.6, 5.6], [20.4, 2.2, 3, 'fills a case'], [20.6, 5.6], [19.6, 7], [18.6, 7, 1.2, 'out the window'], [17, 7], [17, 8.6],
      [14.9, 8.8, 0, 'down the fire escape', 'jump'], [15.3, 12.6],
    ] }],
  },
]
