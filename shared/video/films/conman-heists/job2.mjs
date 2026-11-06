/*
 * Job 2, the counting house, fleshed out from the pick (D · Through the
 * floor, 2026-11-05). The royalty office keeps its true ledgers in a
 * strongroom under the partner's office; the shop next door, on the same
 * party wall, has stood empty since the spring.
 *
 * The conman comes straight from the record shop (heist 1's getaway ends at
 * this shop's door at 50.6), lets himself into the empty shop, goes down to
 * its cellar and digs at the party wall. The wall gives on "Until the Earth
 * shook" (67.3). He swaps the ledgers in the strongroom and is out of the
 * front door and away east down Main Street, to the studio, by 76. The
 * auditor arrives on the first line and takes the partner, whose office is
 * over the strongroom, out to lunch before the digging starts; they are back
 * once the conman is out.
 *
 * Routes are timed paths: [x, y, t?, flag?] in job metres, t pinned where it
 * matters (unpinned points share the time between pins by distance), 'jump'
 * for a change of floor drawn as an arc. The cellar and strongroom are either
 * drawn under the ground floor (dashed, `overlay`) or as their own sheet
 * beside it (`twoFloors`).
 */
import { wall, merge, box } from './shop.mjs'

export const O2 = [552, 280]
export const SHEET2 = ['THE COUNTING HOUSE', 'JOB No. 2 · 1969', 'SHEET 2/6']
/** He reaches the door as the camera settles; the job starts on "Oh, I'm a conman" (55.75). */
export const ARRIVE = 55.6
export const START = 55.75
export const EARTH_SHOOK = 67.3
/** Where the cellar sheet is drawn, beside the ground floor (job metres). */
export const DX = 44

const lerp = (a, b, u) => a + (b - a) * u
const clamp01 = (v) => Math.max(0, Math.min(1, v))

/* ── Timed paths ─────────────────────────────────────────────────────── */

export function timed(raw) {
  const pts = raw.map((p) => ({ x: p[0], y: p[1], t: p[2], jump: p[3] === 'jump' }))
  // Fill the unpinned times by distance between the pins either side.
  let i = 0
  while (i < pts.length - 1) {
    let j = i + 1
    while (pts[j].t == null) j++
    let total = 0
    for (let k = i + 1; k <= j; k++) total += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y)
    let acc = 0
    for (let k = i + 1; k < j; k++) {
      acc += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y)
      pts[k].t = lerp(pts[i].t, pts[j].t, total ? acc / total : (k - i) / (j - i))
    }
    i = j
  }
  const from = pts[0].t
  const to = pts.at(-1).t
  /** Everything walked by t, the head last, as plan points ([x, y, 0, null, 'jump'?]). */
  const walked = (t) => {
    if (t < from) return null
    const out = [[pts[0].x, pts[0].y]]
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1]
      const b = pts[k]
      const flag = b.jump ? [0, null, 'jump'] : []
      if (t >= b.t) { out.push([b.x, b.y, ...flag]); continue }
      const u = b.t > a.t ? clamp01((t - a.t) / (b.t - a.t)) : 1
      if (u > 0) out.push([lerp(a.x, b.x, u), lerp(a.y, b.y, u), ...flag])
      break
    }
    return out
  }
  const at = (t) => walked(Math.max(t, from)).at(-1)
  return { from, to, walked, at }
}

/* ── The ground floor ────────────────────────────────────────────────── */

const GROUND_WALLS = merge(
  wall('ext', [0, 0], [38, 0]),
  wall('ext', [38, 0], [38, 24]),
  wall('ext', [0, 24], [38, 24], [[1, 4, 'g'], [4.6, 6, 1], [6.6, 9, 'g'], [12, 22, 'g'], [25, 27.4, 1], [29, 36, 'g']]),
  wall('ext', [0, 0], [0, 24]),
  wall('heavy', [10, 0], [10, 24]),
  wall('int', [0, 10], [10, 10], [[3, 4.4, 0]]),
  wall('int', [10, 9], [38, 9], [[10.6, 12, -1], [20, 21.4, 1]]),
  wall('int', [24, 0], [24, 9]),
)
const GROUND_ITEMS = [
  { k: 'stairs', x: 5.8, y: 1.6, w: 2, h: 4.6, label: 'DN', dir: 'down' },
  // The empty shop: the last tenant's counter and a few boxes left behind.
  { k: 'rect', x: 1, y: 12.4, w: 0.8, h: 6.4 }, { k: 'rect', x: 7, y: 19, w: 1.3, h: 1.3 }, { k: 'rect', x: 7.6, y: 17.4, w: 1, h: 1 },
  // The banking hall: the tellers' counter with its gate, two writing desks.
  { k: 'rect', x: 12.6, y: 12.2, w: 6.6, h: 0.8 }, { k: 'rect', x: 20.6, y: 12.2, w: 15.8, h: 0.8, label: 'TELLERS', side: 'below' },
  { k: 'rect', x: 15, y: 18.6, w: 4, h: 0.8 }, { k: 'rect', x: 29, y: 18.6, w: 4, h: 0.8 },
  // The partner's office: the desk, the day books on their shelf.
  { k: 'rect', x: 13, y: 3.2, w: 4, h: 1.6 }, { k: 'bins', x: 10.8, y: 0.4, w: 7.4, h: 0.7 },
  // The clerks.
  { k: 'rect', x: 26, y: 1, w: 3.6, h: 1.4 }, { k: 'rect', x: 32, y: 1, w: 3.6, h: 1.4 }, { k: 'rect', x: 26, y: 5.6, w: 3.6, h: 1.4 }, { k: 'rect', x: 32, y: 5.6, w: 3.6, h: 1.4 },
  { k: 'cam', x: 11, y: 23, dir: -40 },
]
const GROUND_ROOMS = [[24, 19.6, 'BANKING HALL'], [31, 4.4, 'CLERKS'], [12.8, 7.4, 'PARTNER', 0, 11], [4.6, 16, 'TO LET', -90, 15], [3.6, 8.6, 'BACK', 0, 11], [19, 29.4, 'MAIN STREET']]
const GROUND_MARKS = [[10, -1.6, 'PARTY WALL'], [39.4, 12, 'STONE · 2 ST.', 90], [-1.4, 12, 'BRICK · 1 ST. · BSMT', -90]]

/* ── Below: the cellar and the strongroom ────────────────────────────── */

/** The rubble he digs out, piling up by the party wall (dots, in job metres). */
const RUBBLE = Array.from({ length: 46 }, (_, i) => {
  const a = i * 2.39996
  const rr = 0.18 * Math.sqrt(i)
  return [9.1 - Math.abs(rr * Math.cos(a)) * 1.3, 4.2 + rr * Math.sin(a) * 1.4, i / 46]
})
function rubble(ctx, t, dx, faint) {
  const u = clamp01((t - 59.9) / (EARTH_SHOOK - 59.9))
  if (u <= 0) return ''
  const { A, s, r, INK } = ctx
  return RUBBLE.filter((p) => p[2] < u).map(([x, y]) => {
    const [px, py] = A([x + dx, y])
    return `<circle cx="${r(px)}" cy="${r(py)}" r="${r(Math.max(1.2, 0.09 * s))}" fill="${INK}" opacity="${faint ? 0.45 : 0.75}"/>`
  }).join('')
}

/* ── Who ─────────────────────────────────────────────────────────────── */

/** The conman's route, with the cellar at dx (0: under the ground floor) and jumps when it is a sheet of its own. */
function conmanRoute(dx) {
  const J = dx ? 'jump' : undefined
  return [
    [5.3, 31, ARRIVE], [5.3, 31, START], [5.3, 24], [5.3, 14], [3.7, 11.2], [3.7, 9.4], [6.8, 7.4], [6.8, 6.4, 58.2],
    [dx + 6.8, 2.2, 59, J], [dx + 8.6, 4.2], [dx + 9.3, 4.2, 59.9], [dx + 9.3, 4.2, EARTH_SHOOK],
    [dx + 11.4, 4.2, 68.4], [dx + 17.4, 4.4], [dx + 18.2, 4.4, 70], [dx + 18.2, 4.4, 71.4],
    [dx + 11.4, 4.2], [dx + 9.3, 4.2], [dx + 8.6, 4.2], [dx + 6.8, 2.2, 73.2], [6.8, 6.4, 73.9, J],
    [6.8, 7.4], [3.7, 9.4], [3.7, 11.2], [5.3, 14], [5.3, 24], [5.3, 31, 76.2], [5.3, 36, 76.7],
  ]
}
/*
 * The auditor's part (the user, 2026-11-06): the partner's office is over the
 * strongroom, so he is the one who would hear the drilling. The auditor
 * arrives on the first line, goes straight up to the partner, and walks him
 * out of the front door and away east along Main Street (to lunch) before the
 * digging starts at 59.9. They are off the sheet until the conman is out; the
 * auditor brings him back to the door at 77 and goes on his way.
 */
const THROUGH = [[26.2, 24], [26.2, 16], [19.9, 13.8], [19.9, 11], [21.3, 10], [21.3, 8.6]] // the banking hall to the partner's door
const back = (pts) => pts.slice().reverse()
const AUDITOR = timed([
  [48, 36, START], [26.2, 36], [26.2, 31, 57.4], ...THROUGH, [15.6, 5.8, 59.0],
  [15.6, 5.8, 59.4], ...back(THROUGH), [26.2, 31, 61.8], [26.2, 36, 62.4], [48, 36, 64.2], [76, 36, 66.4],
  [76, 36, 73.8], [48, 36, 75.6], [26.6, 36, 77],
])
/** The partner: at his desk, then a step behind the auditor out and back, and back to his desk once the auditor has gone. */
const DESK = [15, 2.4]
const PARTNER = timed([
  [...DESK, 59.3], [15.8, 5.4, 59.8], ...back(THROUGH).map(([x, y]) => [x + 0.7, y + 0.5]), [26.9, 31, 62.3], [26.9, 36.6, 62.9], [48, 36.6, 64.7], [76, 36.8, 66.9],
  [76, 36.8, 73.4], [48, 36.6, 75.2], [26.9, 36.6, 76.8], [26.9, 31, 77.4], ...THROUGH.map(([x, y]) => [x + 0.7, y + 0.5]), [15.8, 5.4], [...DESK, 80.6],
])
export const CONMAN2 = { overlay: timed(conmanRoute(0)), twoFloors: timed(conmanRoute(DX)) }

const STILL = (p) => ({ pts: [p, [p[0] + 0.01, p[1]]], period: 1 })
const OWNERS = [
  { route: PARTNER }, // the partner, at his desk until the auditor takes him to lunch
  { pts: [[14.6, 15.4], [14.6, 21.6], [22, 21.6]], period: 9 }, // the guard
  STILL([27.8, 2.9]), STILL([33.8, 2.9]), STILL([27.8, 7.5]), STILL([33.8, 7.5]), // the clerks
]

/* ── The job, as drawn at time t ─────────────────────────────────────── */

const crewAt = (route, t) => {
  const w = route.walked(t)
  return w && w.length > 1 ? w : w ? [w[0], [w[0][0] + 0.001, w[0][1]]] : null
}
function crew(t, route) {
  const out = []
  const c = crewAt(route, t)
  if (c) out.push({ n: 1, role: 'The conman', style: 'solid', from: -2, to: -1, pts: c })
  const a = crewAt(AUDITOR, t)
  if (a) out.push({ n: 2, role: 'The auditor', style: 'dash', from: -2, to: -1, pts: a })
  return out
}
/** For the key: both crew, whether or not they have arrived. */
export const KEY2 = {
  crew: [{ n: 1, role: 'The conman', style: 'solid' }, { n: 2, role: 'The auditor', style: 'dash' }],
  owners: OWNERS, ownerLabel: 'The partner and his staff',
}

const base = { key: 'job2', o: O2, sheet: SHEET2, owners: OWNERS, ownerLabel: KEY2.ownerLabel, storeys: [[36.4, 22.2, '2']], dims: [] }

/** One sheet: the cellar and strongroom drawn under the ground floor, dashed. */
export function overlay(t) {
  const broken = t >= EARTH_SHOOK
  return {
    ...base,
    foot: [box(0, 0, 38, 24)],
    walls: GROUND_WALLS,
    tone: [box(10, 0, 38, 9)],
    items: [
      { k: 'zone', style: 'under', x: 0.6, y: 0.6, w: 8.8, h: 8.8, label: 'CELLAR, BELOW' },
      { k: 'zone', style: 'under', x: 10.6, y: 0.8, w: 12.8, h: 7.6, label: 'STRONGROOM, BELOW' },
      ...(broken ? [{ k: 'zone', style: 'under', x: 9.2, y: 3.4, w: 1.6, h: 1.6 }] : []),
      { k: 'take', x: 17.4, y: 5.8, w: 3.4, h: 1, label: 'THE LEDGERS, BELOW', side: 'below' },
      ...GROUND_ITEMS,
    ],
    rooms: GROUND_ROOMS,
    marks: GROUND_MARKS,
    crew: crew(t, CONMAN2.overlay),
    under: (ctx) => rubble(ctx, t, 0, true),
  }
}

/** Two sheets: the ground floor, and beside it the floor below with the party wall that gives. */
export function twoFloors(t) {
  const broken = t >= EARTH_SHOOK
  const d = (pts) => pts.map(([x, y]) => [x + DX, y])
  const below = merge(
    wall('ext', [DX, 0], [DX + 24, 0]),
    wall('ext', [DX + 24, 0], [DX + 24, 10]),
    wall('ext', [DX, 10], [DX + 24, 10]),
    wall('ext', [DX, 0], [DX, 10]),
    wall('heavy', [DX + 10, 0], [DX + 10, 10], broken ? [[3.4, 5, 0]] : []),
  )
  return {
    ...base,
    sheets: [{ x: DX - 3, y: -4, w: 30, h: 17, label: 'BELOW' }, { x: -2, y: -4, w: 0, h: 0, label: 'GROUND FLOOR' }],
    foot: [box(0, 0, 38, 24), d(box(0, 0, 24, 10))],
    walls: merge(GROUND_WALLS, below),
    tone: [box(10, 0, 38, 9), d(box(10, 0, 24, 10))],
    items: [
      ...GROUND_ITEMS,
      { k: 'stairs', x: DX + 5.8, y: 1.6, w: 2, h: 4.6, label: 'UP', dir: 'up' },
      { k: 'bins', x: DX + 10.8, y: 0.5, w: 12.6, h: 0.7 }, { k: 'bins', x: DX + 10.8, y: 8.8, w: 12.6, h: 0.7 },
      { k: 'take', x: DX + 16.6, y: 5.8, w: 3.4, h: 1, label: 'THE LEDGERS', side: 'below' },
    ],
    rooms: [...GROUND_ROOMS, [DX + 4.4, 8.4, 'CELLAR', 0, 11], [DX + 17, 3, 'STRONGROOM', 0, 11]],
    marks: [...GROUND_MARKS, [DX + 10, -1.6, 'PARTY WALL']],
    crew: crew(t, CONMAN2.twoFloors),
    under: (ctx) => rubble(ctx, t, DX, false),
  }
}
