/*
 * One heist plan for the style sheets: the counting house, mid-job, at 1:06
 * (the film's poster moment). The data is the film's own (conman-city.mjs,
 * JOBS[1]), set on its new site by the east circle.
 */
import { SITES } from './city.mjs'

const lerp = (a, b, u) => a + (b - a) * u
const clamp01 = (v) => Math.max(0, Math.min(1, v))

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

export const THICK = { ext: 0.34, int: 0.14, heavy: 0.62 }

export const JOB = {
  no: 2, name: 'The Counting House', year: '1971', o: SITES[1].o, w: 34, h: 26,
  walls: [
    H('ext', 0, 0, 34, [[15, 16.6, 1]]), V('ext', 34, 0, 26), H('ext', 26, 0, 34, [[15, 19, 0]]), V('ext', 0, 0, 26),
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
  /** Rooms: [x, y, name, public?] and their extents, for styles that tone rooms by use. */
  rooms: [[17, 20, 'BANKING HALL', true], [6, 6.6, 'OFFICE'], [16, 6.6, 'STAFF'], [17, 10.4, 'BEHIND THE COUNTER'], [8, 31.4, 'MAIN STREET', true]],
  roomRects: [
    { x: 0, y: 8, w: 34, h: 18, pub: true },
    { x: 0, y: 0, w: 12, h: 8 }, { x: 12, y: 0, w: 8, h: 8 }, { x: 20, y: 0, w: 14, h: 8 },
  ],
  guards: [{ pts: [[22, 21], [31, 15.4], [8, 15.4], [8, 21]], period: 15 }],
  crew: [
    { n: 1, role: 'The customer', style: 'solid', from: 55.8, to: 76, pts: [
      [17, 31], [17, 26], [17, 20], [10, 14, 10, 'opens an account'], [17, 20], [17.2, 26], [17.2, 31],
    ] },
    { n: 2, role: 'The auditor', style: 'dash', from: 58.5, to: 76.5, pts: [
      [18.2, 31], [18.2, 26], [26, 18], [28.6, 14], [28.6, 10], [6.7, 10], [6.7, 8], [6.7, 5.6], [4.6, 5.6, 4, 'cooks the books'],
      [6.7, 8.6], [26.7, 9.6], [26.7, 7.2], [28.8, 7.2, 3, 'empties the vault'], [21.6, 3.7], [15.8, 3.7], [15.8, 0], [15.8, -4],
    ] },
  ],
}

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
    const i = arrive.findLastIndex((a) => a <= time)
    const at = time < leave[i] || i === pts.length - 1
      ? pts[i]
      : (() => {
          const u = clamp01((time - leave[i]) / (arrive[i + 1] - leave[i]))
          return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]
        })()
    const walked = [...pts.slice(0, i + 1), at]
    const notes = pts.slice(0, i + 1).filter((p) => p[3])
    return { at, walked, notes }
  }
}

/** The plan at song time `time`: everything in job metres. */
export function planAt(time) {
  const crew = JOB.crew.map((c) => ({ ...c, w: walker(c.pts, c.from, c.to)(time) }))
  const guards = JOB.guards.map((g) => {
    const pts = [...g.pts, ...g.pts.slice(0, -1).reverse()]
    const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
    const total = lens.reduce((a, b) => a + b, 0)
    let d = ((time / g.period) % 1) * total
    let at = pts[0]
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i]) { at = [lerp(pts[i][0], pts[i + 1][0], d / lens[i]), lerp(pts[i][1], pts[i + 1][1], d / lens[i])]; break }
      d -= lens[i]
    }
    return { pts: g.pts, at }
  })
  const segs = JOB.walls.flatMap((w) => w.segs.map(([a, b]) => ({ kind: w.kind, a, b })))
  const doors = JOB.walls.flatMap((w) => w.doors)
  return { job: JOB, segs, doors, crew, guards }
}
