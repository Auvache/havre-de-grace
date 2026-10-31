/*
 * Conman · The Plans — a heist blueprint, five jobs, each harder than the last
 * (2026-10-31).
 *
 * Architect's plans in the album's ink on the album's paper. One job per part
 * of the song, each a building drawn as a real plan (walls in poché, door
 * swings, windows, room names, a dimension line, a title block) with the crew
 * that robs it: one conman in a record shop, two in a counting house, three in
 * a studio (one of them following you), four in a museum through the break,
 * five in the Reserve, all at once, from under the ground and out of the sky.
 *
 * Red is only the conmen, as it is only the traveller in Andalusia and the
 * maze: every red line is someone's path, its head a numbered dot. Banknote
 * green is only the take. Guards, cameras and "you" are ink.
 *
 * The jobs are data (JOBS below) in metres, placed in one town. Each telling
 * at the bottom of the file is a different way to film the same plans:
 *
 *   city      — one town plan, the camera moving job to job; choruses are the
 *               getaway through the streets, the last pulls back to all of it.
 *   sheets    — one drawing sheet per job, the next slid over the last;
 *               choruses pin every sheet so far to a board and replay every
 *               job at once, in step: he always sounds the same.
 *   blueprint — the city, printed as a real blueprint: white line on blue.
 *
 * Pure functions of time, rng(seed) only, ids namespaced with uid.
 */
import { PLATE, CX, CY, INK, PAPER, RED, PAPER_SHADE, SECOND_INK } from './sheet.mjs'
import { rng, r, clamp01, lerp, easeInOut, easeOut } from '../../../shared/video/kit.mjs'

const GREEN = SECOND_INK.conman
const { x: PX, y: PY, w: PW, h: PH } = PLATE
const PR = PX + PW
const PB = PY + PH

const PAPER_INKS = { ground: PAPER, ink: INK, red: RED, green: GREEN, faint: PAPER_SHADE, lot: '#cdc3ac' }
const BLUE_INKS = { ground: '#1f4a7c', ink: '#e8eef6', red: '#ff6b4f', green: '#9ad7c0', faint: '#2c5a8f', lot: '#3d6a9c' }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="${o.weight ?? 500}" fill="${o.fill}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.italic ? ' font-style="italic"' : ''}>${esc(text)}</text>`

/* ── Plan vocabulary ──────────────────────────────────────────────── */

/*
 * A wall is an axis-aligned run with gaps cut in it. A gap [a, b, swing] is a
 * door: swing ±1 hangs a leaf on the a-side jamb, 0 is an open archway.
 */
function run(kind, x0, y0, x1, y1, gaps = []) {
  const horiz = y0 === y1
  const lo = horiz ? x0 : y0
  const hi = horiz ? x1 : y1
  const at = (v) => (horiz ? [v, y0] : [x0, v])
  const segs = []
  const doors = []
  let from = lo
  for (const [a, b, swing = 1] of gaps) {
    if (a > from) segs.push([at(from), at(a)])
    if (swing) doors.push({ hinge: at(a), jamb: at(b), swing })
    from = b
  }
  if (hi > from) segs.push([at(from), at(hi)])
  return { kind, segs, doors }
}
const H = (kind, y, x0, x1, gaps) => run(kind, x0, y, x1, y, gaps)
const V = (kind, x, y0, y1, gaps) => run(kind, x, y0, x, y1, gaps)

/* ── The jobs ─────────────────────────────────────────────────────── */

/*
 * Everything in a job is relative to its origin `o` (its top-left corner in
 * the town, metres). Crew points are [x, y, hold?, note?]: hold is seconds
 * stood there, the note is written on the plan when they get there.
 * `style` tells the crew apart in the legend; dash-dot is over the roof or
 * through the air, a long dash is under the ground.
 */
const JOBS = [
  {
    no: 1, name: 'The Record Shop', year: '1968', o: [0, 0], w: 16, h: 11,
    reveal: [5, 20], action: [24, 45.2],
    walls: [
      H('ext', 0, 0, 16), H('ext', 11, 0, 16, [[6, 7.6, 1]]), V('ext', 0, 0, 11), V('ext', 16, 0, 11, [[2, 3.2, -1]]),
      V('int', 11, 0, 11, [[7, 8.2, 1]]),
    ],
    windows: [[1, 11, 5, 11], [8.6, 11, 10.4, 11], [12, 11, 15, 11]],
    items: [
      { k: 'rect', x: 3, y: 3.6, w: 6.4, h: 0.8, label: 'COUNTER' },
      { k: 'rect', x: 0.3, y: 1, w: 0.8, h: 8.4 },
      { k: 'rect', x: 4, y: 6.4, w: 5, h: 0.6 },
      { k: 'rect', x: 4, y: 8.4, w: 5, h: 0.6 },
      { k: 'rect', x: 11.4, y: 0.4, w: 4.2, h: 0.6 },
      { k: 'take', x: 14.3, y: 8.9, w: 1.3, h: 1.3, label: 'THE MASTERS', left: true },
    ],
    rooms: [[6, 1.8, 'SHOP FLOOR'], [13.5, 2.4, 'BACK ROOM'], [4, 14.4, 'MAIN STREET'], [18.4, 6.4, 'ALLEY', 90]],
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 24, to: 45.2, pts: [
        [6.8, 16], [6.8, 11], [6.8, 9.8], [2.2, 7.7, 2.5, 'browses'], [2.2, 5.2], [5.8, 5.2, 4, 'talks shop'],
        [10.2, 5.2], [10.4, 7.6], [12.2, 7.6], [13.6, 9.4, 3, 'the masters'], [13.4, 5], [15.4, 2.6], [17.4, 2.6], [17.4, 16],
      ] },
    ],
  },
  {
    no: 2, name: 'The Counting House', year: '1971', o: [75, -15], w: 34, h: 26,
    reveal: [46, 56], action: [55.8, 76.5],
    walls: [
      H('ext', 0, 0, 34, [[15, 16.6, 1]]), H('ext', 26, 0, 34, [[15, 19, 0]]), V('ext', 0, 0, 26), V('ext', 34, 0, 26),
      H('int', 8, 0, 34, [[6, 7.4, 1], [26, 27.4, 1]]), V('int', 12, 0, 8), V('int', 20, 0, 8, [[3, 4.4, 1]]),
      H('heavy', 1, 24, 33), H('heavy', 6, 24, 33, [[27.6, 30, 0]]), V('heavy', 24, 1, 6), V('heavy', 33, 1, 6),
    ],
    windows: [[3, 26, 11, 26], [23, 26, 31, 26], [0, 13, 0, 22], [34, 13, 34, 22]],
    items: [
      { k: 'rect', x: 3, y: 12, w: 24, h: 0.8, label: 'TELLERS' },
      { k: 'take', x: 2, y: 2, w: 4.2, h: 2, label: 'THE BOOKS' },
      { k: 'take', x: 25, y: 2, w: 7.4, h: 3.2, label: 'VAULT' },
      { k: 'rect', x: 6, y: 18.5, w: 6, h: 0.6 }, { k: 'rect', x: 22, y: 18.5, w: 6, h: 0.6 },
      { k: 'rect', x: 30, y: 22, w: 2.4, h: 2.4 },
      { k: 'cam', x: 1, y: 13, dir: 30 }, { k: 'cam', x: 33, y: 25, dir: -140 },
    ],
    rooms: [[17, 23, 'BANKING HALL'], [6, 7.2, 'OFFICE'], [16, 6.8, 'STAFF'], [17, 10.4, 'BEHIND THE COUNTER'], [17, 33.8, 'MAIN STREET']],
    guards: [{ pts: [[22, 21], [31, 15.4], [8, 15.4], [8, 21]], period: 15 }],
    crew: [
      { n: 1, role: 'The customer', style: 'solid', from: 56, to: 76, pts: [
        [17, 31], [17, 26], [17, 20], [10, 14, 10, 'opens an account'], [17, 20], [17.2, 26], [17.2, 31],
      ] },
      { n: 2, role: 'The auditor', style: 'dash', from: 58.5, to: 76.5, pts: [
        [18.2, 31], [18.2, 26], [26, 18], [28.6, 14], [28.6, 10], [6.7, 10], [6.7, 8], [6.7, 5.6], [4.6, 5.6, 4, 'cooks the books'],
        [6.7, 8.6], [26.7, 9.6], [26.7, 7.2], [28.8, 7.2, 3, 'empties the vault'], [21.6, 3.7], [15.8, 3.7], [15.8, 0], [15.8, -4],
      ] },
    ],
  },
  {
    no: 3, name: 'The Studio', year: '1984', o: [2, 24], w: 46, h: 32,
    reveal: [88, 98], action: [100, 121.5],
    walls: [
      H('ext', 0, 0, 46, [[6, 8, 0]]), H('ext', 32, 0, 46), V('ext', 0, 0, 32), V('ext', 46, 0, 32, [[12.4, 14.6, 0]]),
      V('int', 14, 0, 12), V('int', 30, 0, 12),
      H('int', 12, 0, 46, [[2, 12, 0], [20, 21.6, 1], [36, 37.6, 1]]),
      H('int', 15, 0, 46, [[10, 11.6, -1], [30, 31.6, -1], [41, 42.6, -1]]),
      V('int', 26, 15, 32), V('heavy', 38, 15, 32),
    ],
    windows: [[26, 19, 26, 28], [16, 0, 28, 0], [32, 0, 44, 0], [0, 18, 0, 29]],
    items: [
      { k: 'rect', x: 16, y: 24, w: 5, h: 3, label: 'PIANO' },
      { k: 'ring', x: 5, y: 27.6, r: 1.6 }, { k: 'ring', x: 6, y: 21.6, r: 0.35 }, { k: 'ring', x: 9.6, y: 25.4, r: 0.35 }, { k: 'ring', x: 12.4, y: 20.6, r: 0.35 },
      { k: 'rect', x: 28, y: 18.6, w: 8, h: 2.4, label: 'DESK' },
      { k: 'take', x: 39.4, y: 16.6, w: 1.2, h: 13.6 }, { k: 'take', x: 44.4, y: 16.6, w: 1.2, h: 13.6 },
      { k: 'rect', x: 33, y: 2, w: 8, h: 2 }, { k: 'rect', x: 16.5, y: 2, w: 4, h: 2 }, { k: 'rect', x: 23, y: 2, w: 4, h: 2 },
      { k: 'cam', x: 13, y: 12.6, dir: 170 },
    ],
    rooms: [[7, 5.4, 'LOBBY'], [22, 8, 'OFFICES'], [38, 8, 'GREEN ROOM'], [13, 30.6, 'STUDIO A'], [32, 30.6, 'CONTROL'], [42, 31, 'TAPES'], [24, 13.9, 'CORRIDOR'], [22, -5, 'MAIN STREET']],
    marks: [
      { label: 'you', from: 100.2, to: 120.4, pts: [
        [7, -4], [7, 3], [7, 13.4], [10.8, 13.4], [10.8, 16.4], [8, 22.5, 6, 'you sing'], [18.5, 22.4, 4, 'you play'],
        [10.8, 17], [10.8, 13.4], [36.8, 13.4], [36.8, 7],
      ] },
    ],
    crew: [
      { n: 1, role: 'The shadow', style: 'solid', from: 102.4, to: 121.4, pts: [
        [8.1, -4], [8.1, 3], [8.1, 14.2], [11.6, 14.2], [11.6, 17.4], [9.6, 21.6, 6, 'follows you'], [17.2, 21, 4],
        [11.6, 17.6], [11.6, 14.2], [35.6, 14.2], [35.6, 9.6, 0, 'pretends not to stare'],
      ] },
      { n: 2, role: 'The taker', style: 'dash', from: 104, to: 119, pts: [
        [52, 13.2], [46, 13.2], [41.8, 13.2], [41.8, 16.4], [41.8, 24, 5, 'steals your sound'], [41.8, 13.8], [46, 13.8], [52, 13.8],
      ] },
      { n: 3, role: 'The engineer', style: 'dot', from: 105.5, to: 120, pts: [
        [6.2, -4], [6.2, 3, 2, 'signs in'], [6.2, 13.6], [30.8, 13.6], [30.8, 16.4], [32, 17.6, 6, 'rolls tape'], [30.8, 14.4], [46, 14.4], [52, 14.4],
      ] },
    ],
  },
  {
    no: 4, name: 'The Museum', year: '1999', o: [67, 24], w: 56, h: 44,
    reveal: [130, 141], action: [141, 164],
    walls: [
      H('ext', 0, 0, 56), H('ext', 44, 0, 56, [[26, 30, 0]]), V('ext', 0, 0, 44), V('ext', 56, 0, 44, [[6, 10, 0]]),
      V('int', 18, 0, 44, [[6, 8, 1], [20, 22, 0], [38, 40, 1]]), V('int', 38, 0, 44, [[6, 8, -1], [20, 22, 0], [38, 40, -1]]),
      H('int', 14, 0, 18, [[8, 10, 0]]), H('int', 30, 0, 18, [[8, 10, 0]]),
      H('int', 14, 38, 56, [[46, 48, 0]]), H('int', 30, 38, 56, [[46, 48, 0]]),
      H('int', 34, 18, 38, [[26, 30, 0]]), H('int', 8, 18, 38, [[26, 30, 0]]),
    ],
    arcs: [{ c: [28, 21], r: 9, spans: [[14, 76], [104, 166], [194, 256], [284, 346]] }],
    windows: [[3, 0, 15, 0], [41, 0, 53, 0], [0, 17, 0, 27]],
    items: [
      { k: 'take', x: 26.8, y: 19.8, w: 2.4, h: 2.4, label: 'THE SOUND' },
      { k: 'ring', x: 28, y: 21, r: 3.2, dash: true },
      { k: 'rect', x: 0.4, y: 3, w: 0.4, h: 8 }, { k: 'rect', x: 0.4, y: 32, w: 0.4, h: 9 }, { k: 'rect', x: 55.2, y: 16, w: 0.4, h: 12 },
      { k: 'ring', x: 9, y: 22, r: 1.2 }, { k: 'ring', x: 47, y: 22, r: 1.2 }, { k: 'ring', x: 47, y: 4, r: 0.9 },
      { k: 'rect', x: 53.6, y: 1, w: 1.8, h: 2.2, label: 'POWER' },
      { k: 'cam', x: 1, y: 1, dir: 45 }, { k: 'cam', x: 55, y: 43, dir: -135 }, { k: 'cam', x: 19, y: 33, dir: -45 },
      { k: 'cam', x: 37, y: 33, dir: -135 }, { k: 'cam', x: 1, y: 43, dir: -45 }, { k: 'cam', x: 55, y: 1, dir: 135 },
    ],
    lasers: { off: 151.5, beams: [[21.6, 14.6, 34.4, 27.4], [21.6, 27.4, 34.4, 14.6], [19.4, 21, 36.6, 21], [28, 12.4, 28, 29.6]] },
    rooms: [[9, 7.4, 'GALLERY I'], [9, 26, 'GALLERY II'], [9, 37.4, 'GALLERY III'], [47, 12.4, 'GALLERY IV'], [47, 26, 'GALLERY V'], [47, 37.4, 'LOADING'], [28, 4.6, 'OFFICES'], [28, 40.4, 'ENTRANCE HALL'], [28, 33, 'ROTUNDA']],
    guards: [{ pts: [[9, 3], [9, 41]], period: 12 }, { pts: [[47, 41], [47, 17]], period: 10 }, { pts: [[21, 41], [35, 41]], period: 7 }],
    crew: [
      { n: 1, role: 'The inside man', style: 'solid', from: 142, to: 163.5, pts: [
        [28, 52], [28, 44], [28, 37, 6.5, 'joins the last tour'], [28, 30.6], [28, 23.4, 4, 'swaps the case'], [28, 36], [28, 44], [28, 52],
      ] },
      { n: 2, role: 'The electrician', style: 'dash', from: 141, to: 158, pts: [
        [64, 8], [56, 8], [51, 6], [53.2, 3.4, 5, 'cuts the power'], [51, 8], [56, 8.6], [64, 8.6],
      ] },
      { n: 3, role: 'The climber', style: 'dashdot', from: 146, to: 161, pts: [
        [28, -8], [28, 0], [28, 18, 5, 'down the skylight'], [28, 0], [28, -8],
      ] },
      { n: 4, role: 'The driver', style: 'longdash', from: 141, to: 164, pts: [
        [-7, 52], [63, 52], [63, -8], [-7, -8], [-7, 52], [26, 52, 0, 'engine running'],
      ] },
    ],
  },
  {
    no: 5, name: 'The Reserve', year: '2025', o: [-2, 84], w: 54, h: 44,
    reveal: [158, 166], action: [166, 187],
    walls: [
      H('ext', 0, 0, 54, [[25, 29, 0]]), H('ext', 44, 0, 54), V('ext', 0, 0, 44), V('ext', 54, 0, 44),
      H('int', 8, 8, 46), H('int', 36, 8, 46, [[26, 28, 1]]), V('int', 8, 8, 36), V('int', 46, 8, 36),
      H('int', 14, 16, 38, [[26, 28, 1]]), H('int', 30, 16, 38), V('int', 16, 14, 30), V('int', 38, 14, 30),
      H('heavy', 19, 23, 31), H('heavy', 25, 23, 31), V('heavy', 23, 19, 25, [[21, 23, 0]]), V('heavy', 31, 19, 25),
    ],
    items: [
      { k: 'take', x: 25, y: 20.4, w: 4.6, h: 3.2, label: 'THE RESERVE' },
      ...[[1, 1, 45], [53, 1, 135], [1, 43, -45], [53, 43, -135], [9, 9, 45], [45, 9, 135], [9, 35, -45], [45, 35, -135],
        [17, 15, 45], [37, 15, 135], [17, 29, -45], [37, 29, -135]].map(([x, y, dir]) => ({ k: 'cam', x, y, dir })),
    ],
    rooms: [[27, 5, 'HALL'], [27, 11.4, 'OUTER RING'], [27, 17.4, 'INNER RING'], [27, -5, 'BANK STREET'], [-8, 31, 'MANHOLE']],
    guards: [{ pts: [[4, 4], [50, 4], [50, 40], [4, 40]], period: 22, loop: true }, { pts: [[12, 12], [42, 12], [42, 32], [12, 32]], period: 17, loop: true }],
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 167, to: 184, pts: [[27, -6], [27, 0], [27, 4, 9, 'all the eyes on me'], [27.6, 0], [27.6, -6]] },
      { n: 2, role: 'The digger', style: 'longdash', from: 166, to: 186, pts: [
        [-8, 34], [-8, 22, 3, 'splits the ground'], [27, 22, 4, 'up through the floor'], [-8, 22.8], [-8, 34],
      ] },
      { n: 3, role: 'The flyer', style: 'dashdot', from: 170, to: 185, pts: [[66, -14], [60, -8, 3, 'pierces the sky'], [28, 21.4, 3], [60, -7.4], [66, -13.4]] },
      { n: 4, role: 'The ghost', style: 'dash', from: 166.5, to: 186, pts: [
        [26.4, -6], [26.4, 4], [4, 4], [4, 40], [27, 40], [27, 33], [42, 33], [42, 11], [27, 11], [27, 17], [20, 17], [20, 22], [25, 22, 3, 'inside'],
        [20, 22.4], [20, 17.6], [26.4, 17.6], [26.4, 11.6], [-8, 22.6],
      ] },
      { n: 5, role: 'The driver', style: 'dot', from: 166, to: 187, pts: [[-8, -8], [62, -8], [62, 52], [-8, 52], [-8, 34, 0, 'waits']] },
    ],
  },
]

/* The getaways between jobs, in town coordinates: always one red line. */
const GETAWAYS = [
  { from: 45.2, to: 55.8, pts: [[17.4, 16], [92, 16]] },
  { from: 77, to: 100, pts: [[92.2, 16], [9, 16], [9, 20]] },
  { from: 121.5, to: 142, pts: [[54, 37.8], [60, 37.8], [60, 76], [95, 76]] },
  { from: 163.5, to: 167, pts: [[95, 76], [25, 76], [25, 78]] },
  { from: 187, to: 228, pts: [[25.6, 78], [-10, 78], [-10, 136], [-80, 136], [-80, 400]] },
]

// Make every job's points absolute, once.
for (const j of JOBS) {
  const [ox, oy] = j.o
  j.abs = (p) => [p[0] + ox, p[1] + oy]
  for (const c of [...j.crew, ...(j.marks ?? [])]) c.walk = walker(c.pts.map((p) => [p[0] + ox, p[1] + oy, p[2] ?? 0, p[3]]), c.from, c.to)
  for (const g of j.guards ?? []) g.abs = g.pts.map((p) => [p[0] + ox, p[1] + oy])
}
for (const g of GETAWAYS) g.walk = walker(g.pts.map((p) => [p[0], p[1], 0]), g.from, g.to)

/* ── Walking ──────────────────────────────────────────────────────── */

/** A path walked at an even pace between `from` and `to`, standing still for each point's hold. */
function walker(pts, from, to) {
  const holds = pts.reduce((s, p) => s + (p[2] || 0), 0)
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  const total = lens.reduce((a, b) => a + b, 0) || 1
  const pace = Math.max(0.01, to - from - holds) / total
  const arrive = [from]
  const leave = [from + (pts[0][2] || 0)]
  for (let i = 1; i < pts.length; i++) {
    arrive.push(leave[i - 1] + lens[i - 1] * pace)
    leave.push(arrive[i] + (pts[i][2] || 0))
  }
  return (time) => {
    if (time < from) return null
    let i = arrive.findLastIndex((a) => a <= time)
    const at = time < leave[i] || i === pts.length - 1
      ? pts[i]
      : (() => {
          const u = clamp01((time - leave[i]) / (arrive[i + 1] - leave[i]))
          return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]
        })()
    const walked = [...pts.slice(0, i + 1), at]
    const notes = pts.slice(0, i + 1).map((p, k) => (p[3] ? { p, since: time - arrive[k] } : null)).filter(Boolean)
    return { at, walked, notes, done: time >= to }
  }
}

/** A guard's patrol: back and forth along its points, or round them if `loop`. */
function patrol(g, time) {
  const pts = g.loop ? [...g.abs, g.abs[0]] : [...g.abs, ...g.abs.slice(0, -1).reverse()]
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  const total = lens.reduce((a, b) => a + b, 0)
  let d = (((time / g.period) % 1) + 1) % 1 * total
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) return [lerp(pts[i][0], pts[i + 1][0], d / lens[i]), lerp(pts[i][1], pts[i + 1][1], d / lens[i])]
    d -= lens[i]
  }
  return pts[0]
}

/* ── Drawing one job ──────────────────────────────────────────────── */

const DASH = { solid: '', dash: '14 7', dot: '2 7', dashdot: '16 6 3 6', longdash: '26 9' }
const THICK = { ext: 0.34, int: 0.14, heavy: 0.62 }

/**
 * One job drawn through camera `cam` ({ s, X, Y }) at song `time`.
 * `k` scales every pen (1 on a full plate), `ink` is the palette, and
 * `clock` lets a tile replay the job at a time of its own.
 * Returns layers so the caller can stack several jobs: plan under, red over.
 */
function drawJob(job, cam, time, { k = 1, ink = PAPER_INKS, uid = '', words = true } = {}) {
  const { s, X, Y } = cam
  const A = (p) => [X(p[0] + job.o[0]), Y(p[1] + job.o[1])]
  const [ra, rb] = job.reveal
  const shown = clamp01((time - ra) / (rb - ra))
  if (shown <= 0) return { plan: '', red: '', top: '' }
  const label = words && s * k > 9
  const fs = Math.max(9, Math.min(15, s * 0.42)) * Math.min(1, k * 1.15)
  let plan = ''

  // The take, first, so walls draw over its edges.
  const hatchId = `${uid}-take`
  for (const it of job.items) {
    if (it.k !== 'take') continue
    const [x, y] = A([it.x, it.y])
    plan += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="url(#${hatchId})" stroke="${ink.green}" stroke-width="${r(1.6 * k)}"/>`
  }
  // Cameras: a cone of what they see, ink at a breath.
  for (const it of job.items) {
    if (it.k !== 'cam') continue
    const [x, y] = A([it.x, it.y])
    const reach = 7 * s
    const a0 = ((it.dir - 24) * Math.PI) / 180
    const a1 = ((it.dir + 24) * Math.PI) / 180
    plan += `<path d="M${r(x)} ${r(y)}L${r(x + Math.cos(a0) * reach)} ${r(y + Math.sin(a0) * reach)}A${r(reach)} ${r(reach)} 0 0 1 ${r(x + Math.cos(a1) * reach)} ${r(y + Math.sin(a1) * reach)}Z" fill="${ink.ink}" opacity="0.07"/>`
    plan += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(Math.max(2.5, 0.35 * s))}" fill="${ink.ink}"/>`
  }
  // Lasers: banknote green, gone when the power is.
  if (job.lasers && time < job.lasers.off) {
    const flick = time > job.lasers.off - 0.4 ? 0.4 : 0.85
    for (const [x0, y0, x1, y1] of job.lasers.beams) {
      const [a, b] = A([x0, y0])
      const [c, d] = A([x1, y1])
      plan += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${ink.green}" stroke-width="${r(1.6 * k)}" stroke-dasharray="3 4" opacity="${flick}"/>`
    }
  }
  // Furniture.
  for (const it of job.items) {
    if (it.k === 'rect') {
      const [x, y] = A([it.x, it.y])
      plan += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="none" stroke="${ink.ink}" stroke-width="${r(1.1 * k)}"/>`
    } else if (it.k === 'ring') {
      const [x, y] = A([it.x, it.y])
      plan += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(it.r * s)}" fill="none" stroke="${ink.ink}" stroke-width="${r(1.1 * k)}"${it.dash ? ` stroke-dasharray="6 5"` : ''}/>`
    }
  }
  // Walls in poché: one stroke per thickness, square caps so corners close.
  for (const kind of ['int', 'ext', 'heavy']) {
    let d = ''
    for (const w of job.walls) if (w.kind === kind) for (const [a, b] of w.segs) {
      const [x0, y0] = A(a)
      const [x1, y1] = A(b)
      d += `M${r(x0)} ${r(y0)}L${r(x1)} ${r(y1)}`
    }
    if (d) plan += `<path d="${d}" stroke="${ink.ink}" stroke-width="${r(Math.max(kind === 'int' ? 1.4 : 2.4, THICK[kind] * s) * Math.min(1, k * 1.2))}" stroke-linecap="square" fill="none"/>`
  }
  for (const a of job.arcs ?? []) {
    const [cx, cy] = A(a.c)
    const R = a.r * s
    let d = ''
    for (const [d0, d1] of a.spans) {
      const p0 = [cx + Math.cos((d0 * Math.PI) / 180) * R, cy + Math.sin((d0 * Math.PI) / 180) * R]
      const p1 = [cx + Math.cos((d1 * Math.PI) / 180) * R, cy + Math.sin((d1 * Math.PI) / 180) * R]
      d += `M${r(p0[0])} ${r(p0[1])}A${r(R)} ${r(R)} 0 0 1 ${r(p1[0])} ${r(p1[1])}`
    }
    plan += `<path d="${d}" stroke="${ink.ink}" stroke-width="${r(Math.max(2.4, THICK.ext * s) * Math.min(1, k * 1.2))}" fill="none"/>`
  }
  // Windows: the wall opened to paper, three thin lines across it.
  for (const [x0, y0, x1, y1] of job.windows ?? []) {
    const [a, b] = A([x0, y0])
    const [c, d] = A([x1, y1])
    const t = Math.max(2.4, THICK.ext * s) * Math.min(1, k * 1.2)
    plan += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${ink.ground}" stroke-width="${r(t - 1)}"/>`
    plan += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${ink.ink}" stroke-width="${r(0.8 * k)}"/>`
  }
  // Door leaves and swings.
  let swings = ''
  for (const w of job.walls) for (const dr of w.doors) {
    const [hx, hy] = A(dr.hinge)
    const [jx, jy] = A(dr.jamb)
    const vx = jx - hx
    const vy = jy - hy
    const [nx, ny] = dr.swing > 0 ? [-vy, vx] : [vy, -vx]
    swings += `M${r(hx)} ${r(hy)}L${r(hx + nx)} ${r(hy + ny)}A${r(Math.hypot(vx, vy))} ${r(Math.hypot(vx, vy))} 0 0 ${dr.swing > 0 ? 0 : 1} ${r(jx)} ${r(jy)}`
  }
  plan += `<path d="${swings}" stroke="${ink.ink}" stroke-width="${r(0.9 * k)}" fill="none"/>`

  // Words: room names, labels on things, the dimension line.
  if (label) {
    for (const [x, y, text, rot] of job.rooms) {
      const [sx, sy] = A([x, y])
      plan += rot
        ? `<g transform="rotate(${rot} ${r(sx)} ${r(sy)})">${txt(sx, sy, fs, text, { fill: ink.ink, anchor: 'middle', spacing: 2.4, opacity: 0.7 })}</g>`
        : txt(sx, sy, fs, text, { fill: ink.ink, anchor: 'middle', spacing: 2.4, opacity: 0.7 })
    }
    for (const it of job.items) {
      if (!it.label) continue
      const [x, y] = A([it.x + it.w / 2, it.y + it.h / 2])
      const big = it.w * s > it.label.length * fs * 0.62
      const o = { fill: it.k === 'take' ? ink.green : ink.ink, anchor: 'middle', spacing: 1.6, weight: 600 }
      plan += it.left
        ? txt(A([it.x, 0])[0] - 8, y + fs * 0.3, fs * 0.82, it.label, { ...o, anchor: 'end' })
        : txt(x, big ? y + fs * 0.35 : A([0, it.y + it.h])[1] + fs * 1.2, fs * 0.82, it.label, o)
    }
    const [dx0, dy] = A([0, -2.2])
    const [dx1] = A([job.w, 0])
    plan += `<path d="M${r(dx0)} ${r(dy)}H${r(dx1)}M${r(dx0)} ${r(dy - 6)}v12M${r(dx1)} ${r(dy - 6)}v12M${r(dx0 - 4)} ${r(dy + 4)}l8 -8M${r(dx1 - 4)} ${r(dy + 4)}l8 -8" stroke="${ink.ink}" stroke-width="${r(0.9 * k)}" fill="none" opacity="0.8"/>`
    plan += `<rect x="${r((dx0 + dx1) / 2 - fs * 2.2)}" y="${r(dy - fs * 0.7)}" width="${r(fs * 4.4)}" height="${r(fs * 1.4)}" fill="${ink.ground}"/>`
    plan += txt((dx0 + dx1) / 2, dy + fs * 0.36, fs * 0.9, `${job.w.toFixed(2)} m`, { fill: ink.ink, anchor: 'middle', spacing: 1 })
  }

  // The plan unrolls from the left as it is drawn on.
  if (shown < 1) {
    const [x0] = A([-3, 0])
    const [x1] = A([job.w + 3, 0])
    const edge = lerp(x0, x1, easeInOut(shown))
    plan = `<clipPath id="${uid}-unroll${job.no}"><rect x="${r(Math.min(x0, edge) - 2000)}" y="-4000" width="${r(edge - x0 + 2000)}" height="9000"/></clipPath><g clip-path="url(#${uid}-unroll${job.no})">${plan}</g>
    <line x1="${r(edge)}" y1="${r(A([0, -4])[1])}" x2="${r(edge)}" y2="${r(A([0, job.h + 4])[1])}" stroke="${ink.ink}" stroke-width="${r(1.2 * k)}" opacity="0.5"/>`
  }

  // Guards: ink, dotted where they have been, a ring where they are.
  let top = ''
  if (time >= job.action[0] - 4) {
    for (const g of job.guards ?? []) {
      const [gx, gy] = patrol(g, time)
      const d = (g.loop ? [...g.abs, g.abs[0]] : g.abs).map((p, i) => `${i ? 'L' : 'M'}${r(X(p[0]))} ${r(Y(p[1]))}`).join('')
      plan += `<path d="${d}" stroke="${ink.ink}" stroke-width="${r(1 * k)}" stroke-dasharray="1 5" stroke-linecap="round" fill="none" opacity="0.6"/>`
      top += `<circle cx="${r(X(gx))}" cy="${r(Y(gy))}" r="${r(7 * k)}" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="${r(2 * k)}"/><circle cx="${r(X(gx))}" cy="${r(Y(gy))}" r="${r(2.4 * k)}" fill="${ink.ink}"/>`
    }
  }

  // You: an ink line, the one being followed.
  let red = ''
  for (const m of job.marks ?? []) {
    const w = m.walk(time)
    if (!w) continue
    red += `<path d="${w.walked.map((p, i) => `${i ? 'L' : 'M'}${r(X(p[0]))} ${r(Y(p[1]))}`).join('')}" stroke="${ink.ink}" stroke-width="${r(2.2 * k)}" stroke-dasharray="1 6" stroke-linecap="round" fill="none"/>`
    const [mx, my] = [X(w.at[0]), Y(w.at[1])]
    top += `<circle cx="${r(mx)}" cy="${r(my)}" r="${r(9 * k)}" fill="${ink.ink}"/>`
    if (label) top += txt(mx - 14 * k, my + 4 * k, fs * 0.95, m.label.toUpperCase(), { fill: ink.ink, anchor: 'end', weight: 700, spacing: 2 })
    if (label) for (const n of w.notes) top += note(X(n.p[0]), Y(n.p[1]), n.p[3], n.since, fs, ink, k, true)
  }
  // The crew: red, each in their own line, a numbered dot at the head.
  for (const c of job.crew) {
    const w = c.walk(time)
    if (!w) continue
    red += `<path d="${w.walked.map((p, i) => `${i ? 'L' : 'M'}${r(X(p[0]))} ${r(Y(p[1]))}`).join('')}" stroke="${ink.red}" stroke-width="${r(3.4 * k)}" stroke-linejoin="round" stroke-linecap="${c.style === 'dot' ? 'round' : 'butt'}"${DASH[c.style] ? ` stroke-dasharray="${DASH[c.style].split(' ').map((v) => r(v * k)).join(' ')}"` : ''} fill="none"/>`
    if (label) for (const n of w.notes) top += note(X(n.p[0]), Y(n.p[1]), n.p[3], n.since, fs, ink, k)
    const fade = 1 - clamp01((time - c.to - 1) / 1.5)
    if (fade > 0) top += head(X(w.at[0]), Y(w.at[1]), c.n, k, ink, fade)
  }
  return { plan, red, top }
}

/** A numbered head. */
const head = (x, y, n, k, ink, o = 1) =>
  `<g opacity="${o}"><circle cx="${r(x)}" cy="${r(y)}" r="${r(10.5 * k)}" fill="${ink.red}"/>${n ? txt(x, y + 4.6 * k, 13 * k, String(n), { fill: ink.ground, anchor: 'middle', weight: 700 }) : ''}</g>`

/** A pencilled note where a conman stopped, written on as they arrive. */
function note(x, y, text, since, fs, ink, k, mine = false) {
  const o = clamp01(since / 0.35)
  if (o <= 0) return ''
  const tx = x + 16 * k
  const ty = y - 14 * k
  return `<g opacity="${r(o)}"><path d="M${r(x + 6 * k)} ${r(y - 5 * k)}L${r(tx - 2)} ${r(ty + 3)}" stroke="${ink.ink}" stroke-width="${r(0.9 * k)}"/>${txt(tx, ty, fs * 1.08, text, { fill: ink.ink, italic: true, weight: mine ? 400 : 500 })}</g>`
}

const defs = (uid, ink) =>
  `<defs><pattern id="${uid}-take" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="1.6" fill="${ink.green}"/></pattern></defs>`

/* ── The town ─────────────────────────────────────────────────────── */

// Streets every 70 m east-west and 60 m north-south, ten wide.
const STREETS_X = (k) => -10 + 70 * k
const STREETS_Y = (k) => 16 + 60 * k
const NAMES_X = ['Lightning Ave', 'Groove St', 'Steady Notes Rd', 'Shadow Ln', 'Clear Sky Ave', 'Smoke St']
const NAMES_Y = ['Main Street', 'Fast Lane', 'Bank Street', 'Eyes Row', 'Wake Rd', 'Goodness Way']

/** Blocks and their lots, in view. The job buildings are not lots. */
function town(cam, ink, k = 1) {
  const { s, X, Y } = cam
  const wx0 = (PX - CX) / s + cam.cx
  const wx1 = (PR - CX) / s + cam.cx
  const wy0 = (PY - CY) / s + cam.cy
  const wy1 = (PB - CY) / s + cam.cy
  let kerbs = ''
  let lots = ''
  for (let i = Math.floor((wx0 + 10) / 70) - 1; i <= Math.ceil((wx1 + 10) / 70); i++) {
    for (let j = Math.floor((wy0 - 16) / 60) - 1; j <= Math.ceil((wy1 - 16) / 60); j++) {
      const bx = STREETS_X(i) + 5
      const by = STREETS_Y(j) + 5
      const bw = 60
      const bh = 50
      if (bx > wx1 || bx + bw < wx0 || by > wy1 || by + bh < wy0) continue
      kerbs += `M${r(X(bx))} ${r(Y(by))}H${r(X(bx + bw))}V${r(Y(by + bh))}H${r(X(bx))}Z`
      // Lots round the edge of the block, each a building outline.
      const g = rng(1000 + i * 37 + j * 101)
      const cuts = (len) => {
        const out = [0]
        while (out.at(-1) < len - 8) out.push(Math.min(len, out.at(-1) + 8 + g() * 14))
        out[out.length - 1] = len
        return out
      }
      const add = (x, y, w, h) => {
        if (JOBS.some((jb) => x < jb.o[0] + jb.w + 2 && x + w > jb.o[0] - 2 && y < jb.o[1] + jb.h + 2 && y + h > jb.o[1] - 2)) return
        lots += `M${r(X(x))} ${r(Y(y))}H${r(X(x + w))}V${r(Y(y + h))}H${r(X(x))}Z`
      }
      const deep = 14
      const across = cuts(bw)
      for (let n = 0; n < across.length - 1; n++) {
        add(bx + across[n] + 1, by + 1, across[n + 1] - across[n] - 2, deep - g() * 4)
        add(bx + across[n] + 1, by + bh - deep + g() * 4 - 1, across[n + 1] - across[n] - 2, deep - 3)
      }
      const down = cuts(bh - deep * 2)
      for (let n = 0; n < down.length - 1; n++) {
        add(bx + 1, by + deep + down[n] + 1, deep - g() * 4, down[n + 1] - down[n] - 2)
        add(bx + bw - deep + 1, by + deep + down[n] + 1, deep - 2, down[n + 1] - down[n] - 2)
      }
    }
  }
  let names = ''
  if (s > 2.5 && s < 20) {
    const fs = Math.max(10, Math.min(14, s * 1.1))
    for (let i = Math.floor((wx0 + 10) / 70); i <= Math.ceil((wx1 + 10) / 70); i++) {
      const x = X(STREETS_X(i))
      const y = Math.min(PB - 120, Math.max(PY + 120, Y(cam.cy) + 140))
      names += `<g transform="rotate(-90 ${r(x)} ${r(y)})">${txt(x, y + fs * 0.35, fs, NAMES_X[((i % 6) + 6) % 6].toUpperCase(), { fill: ink.ink, anchor: 'middle', spacing: 3, opacity: 0.45 })}</g>`
    }
    for (let j = Math.floor((wy0 - 16) / 60); j <= Math.ceil((wy1 - 16) / 60); j++) {
      const y = Y(STREETS_Y(j))
      const x = Math.min(PR - 160, Math.max(PX + 160, X(cam.cx) - 260))
      names += txt(x, y + fs * 0.35, fs, NAMES_Y[((j % 6) + 6) % 6].toUpperCase(), { fill: ink.ink, anchor: 'middle', spacing: 3, opacity: 0.45 })
    }
  }
  return `<path d="${lots}" fill="${ink.lot}" fill-opacity="0.35" stroke="${ink.ink}" stroke-width="${r(0.8 * k)}" opacity="0.5"/>
  <path d="${kerbs}" fill="none" stroke="${ink.ink}" stroke-width="${r(1.1 * k)}" opacity="0.55"/>${names}`
}

/* ── Screen furniture: the title block and the crew legend ────────── */

function titleBlock(job, ink, career = false) {
  const w = 340
  const h = 112
  const x = PR - w - 22
  const y = PB - h - 22
  const lines = career
    ? ['THE CAREER', 'JOBS 1–5 · 1968–2025', 'SHEET 6/6']
    : [job.name.toUpperCase(), `JOB No. ${job.no} · ${job.year}`, `SHEET ${job.no}/6`]
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="1.6"/>
  <line x1="${x}" y1="${y + 30}" x2="${x + w}" y2="${y + 30}" stroke="${ink.ink}" stroke-width="1"/>
  <line x1="${x}" y1="${y + 80}" x2="${x + w}" y2="${y + 80}" stroke="${ink.ink}" stroke-width="1"/>
  ${txt(x + 14, y + 20, 12, 'PLANS FOR', { fill: ink.ink, spacing: 4, opacity: 0.7 })}
  ${txt(x + w - 14, y + 20, 12, 'CONMAN', { fill: ink.red, spacing: 4, anchor: 'end', weight: 700 })}
  ${txt(x + 14, y + 64, 24, lines[0], { fill: ink.ink, weight: 600, spacing: 2 })}
  ${txt(x + 14, y + 101, 12, lines[1], { fill: ink.ink, spacing: 2.4 })}
  ${txt(x + w - 14, y + 101, 12, lines[2], { fill: ink.ink, spacing: 2.4, anchor: 'end', opacity: 0.7 })}
</g>`
}

function legend(job, ink, time) {
  const rows = job.crew
  const x = PX + 22
  const y = PY + 22
  const w = 250
  const h = 40 + rows.length * 26 + (job.marks ? 26 : 0) + (job.guards ? 26 : 0)
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="1.6"/>
  ${txt(x + 14, y + 24, 12, 'THE CREW', { fill: ink.ink, spacing: 4, opacity: 0.7 })}`
  let ry = y + 52
  for (const c of rows) {
    const on = time >= c.from - 2
    s += `<g opacity="${on ? 1 : 0.35}"><line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${ink.red}" stroke-width="3.4"${DASH[c.style] ? ` stroke-dasharray="${DASH[c.style]}"` : ''}/>
    ${head(x + 82, ry - 4, c.n, 0.82, ink)}
    ${txt(x + 100, ry + 1, 14, c.role, { fill: ink.ink })}</g>`
    ry += 26
  }
  if (job.marks) {
    s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${ink.ink}" stroke-width="2.2" stroke-dasharray="1 6" stroke-linecap="round"/><circle cx="${x + 82}" cy="${ry - 4}" r="7.5" fill="${ink.ink}"/>${txt(x + 100, ry + 1, 14, 'You', { fill: ink.ink })}`
    ry += 26
  }
  if (job.guards) {
    s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${ink.ink}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round"/><circle cx="${x + 82}" cy="${ry - 4}" r="6" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="2"/>${txt(x + 100, ry + 1, 14, job.guards.length > 1 ? 'The guards' : 'The guard', { fill: ink.ink })}`
  }
  return s
}

/** The job a moment belongs to, for the furniture. */
const JOB_FROM = [0, 47, 92, 132, 160]
const jobAt = (time) => JOBS[JOB_FROM.findLastIndex((t) => t <= time)]
const CAREER = 192

/* ── Telling 1: the city ──────────────────────────────────────────── */

/** [time, centre x, centre y, px per metre], eased between (scale in log space). */
const CITY_CAM = [
  [0, 9, 7.6, 40], [44.5, 9, 7.6, 40], [50, 52, 9, 17], [55, 92, -1, 24], [77.5, 92, -1, 24], [86, 50, 18, 9], [96.4, 25, 40.6, 19.5],
  [121.8, 25, 40.6, 19.5], [130, 60, 50, 9], [140.2, 95, 46.4, 15.4], [162, 95, 46.4, 15.4], [167, 27, 106.4, 14],
  [187.8, 27, 106.4, 14], [201, 40, 70, 3.8], [228.5, 30, 90, 2.7], [999, 30, 90, 2.7],
]
function cityCam(time) {
  const j = CITY_CAM.findIndex(([t]) => t > time)
  const [t0, x0, y0, s0] = CITY_CAM[j - 1]
  const [t1, x1, y1, s1] = CITY_CAM[j]
  const u = easeInOut(clamp01((time - t0) / (t1 - t0)))
  const s = Math.exp(lerp(Math.log(s0), Math.log(s1), u))
  // Pan in proportion to how far out we are, so a zoom out-and-in reads as one move.
  const cx = lerp(x0, x1, u)
  const cy = lerp(y0, y1, u)
  return { s, cx, cy, X: (x) => CX + (x - cx) * s, Y: (y) => CY + (y - cy) * s }
}

function city({ time, uid }, ink = PAPER_INKS) {
  const cam = cityCam(time)
  let plans = ''
  let reds = ''
  let tops = ''
  for (const job of JOBS) {
    const d = drawJob(job, cam, time, { ink, uid, words: time < CAREER || cam.s > 9 })
    plans += d.plan
    reds += d.red
    tops += d.top
  }
  // The getaways: one line, the whole crew in the car.
  for (const g of GETAWAYS) {
    const w = g.walk(time)
    if (!w) continue
    reds += `<path d="${w.walked.map((p, i) => `${i ? 'L' : 'M'}${r(cam.X(p[0]))} ${r(cam.Y(p[1]))}`).join('')}" stroke="${ink.red}" stroke-width="${r(Math.max(2.4, Math.min(6, cam.s * 0.3)))}" stroke-linejoin="round" fill="none"/>`
    if (!w.done) tops += `<circle cx="${r(cam.X(w.at[0]))}" cy="${r(cam.Y(w.at[1]))}" r="${r(Math.max(7, Math.min(12, cam.s * 0.5)))}" fill="${ink.red}"/>`
  }
  const job = jobAt(time)
  const career = time >= CAREER
  const furniture = cam.s > 12 && !career ? legend(job, ink, time) : ''
  return `${defs(uid, ink)}<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${ink.ground}"/>
  ${grid(ink)}
  ${town(cam, ink)}
  ${plans}${reds}${tops}
  ${furniture}${titleBlock(job, ink, career)}`
}

/** The drawing sheet's faint 5 m grid and a north point, fixed to the sheet. */
function grid(ink) {
  let d = ''
  for (let x = PX + 40; x < PR; x += 80) d += `M${x} ${PY}V${PB}`
  for (let y = PY + 28; y < PB; y += 80) d += `M${PX} ${y}H${PR}`
  const nx = PR - 60
  const ny = PY + 66
  return `<path d="${d}" stroke="${ink.ink}" stroke-width="0.6" opacity="0.08"/>
  <g opacity="0.75"><circle cx="${nx}" cy="${ny}" r="24" fill="none" stroke="${ink.ink}" stroke-width="1.2"/><path d="M${nx} ${ny - 30}L${nx + 9} ${ny + 14}L${nx} ${ny + 6}L${nx - 9} ${ny + 14}Z" fill="${ink.ink}"/>${txt(nx, ny - 36, 13, 'N', { fill: ink.ink, anchor: 'middle', weight: 600 })}</g>`
}

/* ── Telling 2: the sheets ────────────────────────────────────────── */

const SHEET_AT = [[0, 1], [46.6, 2], [77.5, -2], [96.4, 3], [121.95, -3], [140.2, 4], [164.9, 5], [187.8, -5]]
/** One replay of every job on the board takes one chorus line. */
const REPLAY = 11

function fitCam(job, box, pad = 7) {
  const s = Math.min(box.w / (job.w + pad * 2), box.h / (job.h + pad * 2.4))
  const cx = job.o[0] + job.w / 2
  const cy = job.o[1] + job.h / 2 + 1
  return { s, cx, cy, X: (x) => box.x + box.w / 2 + (x - cx) * s, Y: (y) => box.y + box.h / 2 + (y - cy) * s }
}

/** A job's own clock while it replays on the board: every job through once per REPLAY, in step. */
const replayTime = (job, time, start) => {
  const [a, b] = job.action
  const u = (((time - start) / REPLAY) % 1 + 1) % 1
  return a - 1 + u * (b - a + 1.5)
}

function sheetOf(job, box, time, ink, uid, k = 1) {
  const cam = fitCam(job, box)
  const d = drawJob(job, cam, time, { k, ink, uid })
  return d.plan + d.red + d.top
}

function sheets({ time, uid }, ink = PAPER_INKS) {
  const i = SHEET_AT.findLastIndex(([t]) => t <= time)
  const [start, which] = SHEET_AT[i]
  const full = { x: PX, y: PY, w: PW, h: PH }
  let out = `${defs(uid, ink)}<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${ink.faint}"/>`
  if (which > 0) {
    // The last sheet underneath, the new one sliding over it from the right.
    const job = JOBS[which - 1]
    const prev = i > 0 && SHEET_AT[i - 1][1] > 0 ? JOBS[SHEET_AT[i - 1][1] - 1] : null
    const u = easeOut(clamp01((time - start) / 1.4))
    if (prev && u < 1) out += sheetCard(prev, full, prev.action[1], ink, `${uid}-p`)
    const dx = (1 - u) * PW
    out += `<g transform="translate(${r(dx)} 0)">${sheetCard(job, full, time, ink, uid)}
    ${u < 1 ? `<rect x="${PX - 14}" y="${PY}" width="14" height="${PH}" fill="${INK}" opacity="0.12"/>` : ''}</g>`
    return out
  }
  // The board: every sheet so far, pinned, replaying in step.
  const n = -which
  const done = JOBS.slice(0, n)
  const boxes = board(n)
  const u = easeOut(clamp01((time - start) / 1.4))
  done.forEach((job, k) => {
    const b = boxes[k]
    const t = replayTime(job, time, start)
    const kk = Math.min(1, b.w / PW + 0.28)
    const tile = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="1.2"/>
      ${sheetOf(job, { x: b.x, y: b.y + 8, w: b.w, h: b.h - 34 }, t, ink, `${uid}-b${k}`, kk)}
      ${txt(b.x + 12, b.y + b.h - 12, 12, `No. ${job.no} · ${job.name.toUpperCase()} · ${job.year}`, { fill: ink.ink, spacing: 2.4 })}
      <circle cx="${b.x + b.w / 2}" cy="${b.y + 9}" r="4.5" fill="${ink.ink}"/>`
    out += `<g opacity="${r(u)}">${tile}</g>`
  })
  out += txt(CX, PB - 18, 15, n === 5 ? 'EVERY JOB, THE SAME MAN' : 'NO MATTER WHERE — THE SAME MOVES', { fill: ink.ink, anchor: 'middle', spacing: 6, opacity: 0.6 * u })
  return out
}

function board(n) {
  const gap = 22
  const rows = n <= 3 ? [n] : [3, n - 3]
  const h = (PH - 60 - gap * (rows.length + 1)) / rows.length
  const out = []
  rows.forEach((count, ri) => {
    const w = Math.min((PW - gap * (count + 1)) / count, h * 1.55)
    const total = count * w + (count - 1) * gap
    for (let c = 0; c < count; c++) out.push({ x: r(CX - total / 2 + c * (w + gap)), y: r(PY + gap + ri * (h + gap)), w: r(w), h: r(h) })
  })
  return out
}

function sheetCard(job, box, time, ink, uid) {
  const inner = { x: box.x + 40, y: box.y + 30, w: box.w - 400, h: box.h - 60 }
  return `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="${ink.ground}"/>
  <rect x="${box.x + 14}" y="${box.y + 14}" width="${box.w - 28}" height="${box.h - 28}" fill="none" stroke="${ink.ink}" stroke-width="1.4"/>
  ${sheetOf(job, { x: inner.x + 260, y: inner.y, w: inner.w + 40, h: inner.h }, time, ink, uid)}
  ${legend(job, ink, time)}${titleBlock(job, ink)}`
}

/* ── The list ─────────────────────────────────────────────────────── */

/** Twelve moments: the shop drawn on, each job in turn, the getaways, the board and the career. */
export const HEIST_MOMENTS = [14, 36, 50, 70, 84, 112, 128, 152, 176, 196, 214, 230]

export const HEIST_VARIANTS = [
  {
    id: 'city',
    name: 'The city',
    summary: 'One town plan and five buildings in it, each a job harder than the last: a record shop with one conman (1968), a counting house with two and a guard, a studio with three where one of them follows you, a museum with four through the break, lasers and all, and the Reserve with five, coming from under the ground and out of the sky while the conman stands in the hall with all the eyes on him. Each plan draws itself on before its job; the crew walk it in red, numbered, and a pencilled note goes down wherever one of them stops. Every chorus is the getaway: the camera pulls out and one red line runs through the streets to the next job. The last chorus pulls back to the whole town with every job’s red still on it, and the line leaves town.',
    frame: (a) => city(a),
  },
  {
    id: 'sheets',
    name: 'The sheets',
    summary: 'The same five plans, each on its own drawing sheet with the crew list and a title block, the next sheet sliding over the last at each new verse. In the choruses every sheet so far is pinned to a board and every job replays at once, in step, one run per chorus line: different buildings, different crews, the same moves. No matter where he goes he never seems to change. The last chorus is all five.',
    frame: (a) => sheets(a),
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    summary: 'The city, printed as a real blueprint: white line on blue, the crew in a hot red. Same plans, same motion; less like the rest of the album, more like the thing itself.',
    frame: (a) => city(a, BLUE_INKS),
  },
]
