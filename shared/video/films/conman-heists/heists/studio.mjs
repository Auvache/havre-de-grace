/*
 * Job 3, the studio: ways to plan it (exploration, 2026-11-05). The studio is
 * at the end of the fluke road (on the pier head until the river moved,
 * 2026-11-05), the road that runs out along the
 * anchor's east fluke. Verse 3: "here to steal your sound / I stick to the
 * shadows when I follow you around / I pretend not to stare / you will remain
 * unaware". Three crew and you, the artist, in ink.
 *
 * Job metres from the pier head site (o = [722, 352]); the deck runs from
 * [-7, -7] to [53, 39] and the pier road meets it at [17, 39], heading up the
 * fluke's line. B and C are built along that line, in a frame turned 24°.
 */
import { wall, merge, box } from '../shop.mjs'

const SHEET = ['THE STUDIO', 'JOB No. 3 · 1970', 'SHEET 3/6']
const O = [722, 352]

/* ── The fluke's frame ───────────────────────────────────────────────── */

// The pier road runs from the fluke [674, 536] to the deck [739, 391].
const D = (() => { const v = [65, -145]; const L = Math.hypot(...v); return [v[0] / L, v[1] / L] })()
const XA = [-D[1], D[0]] // across the pier (east-south-east)
const YA = [-D[0], -D[1]] // down the pier (toward the fluke)
const ROT = (Math.atan2(XA[1], XA[0]) * 180) / Math.PI
/** A plan frame turned onto the pier: local [x, y] → job metres, local (cx, by) placed at `at`. */
const frame = (at, cx, by) => (x, y) => [at[0] + (x - cx) * XA[0] + (y - by) * YA[0], at[1] + (x - cx) * XA[1] + (y - by) * YA[1]]
const glassOnly = (pairs) => ({ segs: [], doors: [], glass: pairs.map(([a, b]) => ({ a, b })), panels: [] })

/** Furniture in a turned frame, drawn in the under hook (the core's items are square to the page). */
function localItems(F, items) {
  return (ctx) => {
    const { A, s, r, txt, poly, PAPER, INK, GREEN, uid } = ctx
    let out = ''
    let words = ''
    for (const it of items) {
      const q = [F(it.x, it.y), F(it.x + (it.w ?? 0), it.y), F(it.x + (it.w ?? 0), it.y + (it.h ?? 0)), F(it.x, it.y + (it.h ?? 0))]
      if (it.k === 'rect' || it.k === 'bins') {
        out += `<path d="${poly(q)}" fill="${PAPER}" stroke="${INK}" stroke-width="1.1"/>`
        if (it.k === 'bins') {
          const long = it.w >= it.h
          let d = ''
          for (let k = 0.55; k < (long ? it.w : it.h); k += 0.55) {
            const [a, b] = long ? [F(it.x + k, it.y), F(it.x + k, it.y + it.h)] : [F(it.x, it.y + k), F(it.x + it.w, it.y + k)]
            d += `M${A(a).map((v) => r(v)).join(' ')}L${A(b).map((v) => r(v)).join(' ')}`
          }
          out += `<path d="${d}" stroke="${INK}" stroke-width="0.7" opacity="0.7"/>`
        }
      } else if (it.k === 'take') {
        out += `<path d="${poly(q)}" fill="${PAPER}"/><path d="${poly(q)}" fill="url(#${uid}-take)" stroke="${GREEN}" stroke-width="1.6"/>`
      } else if (it.k === 'ring' || it.k === 'loot') {
        const [x, y] = A(F(it.x, it.y))
        out += it.k === 'loot'
          ? `<circle cx="${r(x)}" cy="${r(y)}" r="${r(it.r * s)}" fill="url(#${uid}-take)" stroke="${GREEN}" stroke-width="1.4"/>`
          : `<circle cx="${r(x)}" cy="${r(y)}" r="${r(it.r * s)}" fill="none" stroke="${INK}" stroke-width="1"/>`
      } else if (it.k === 'path') {
        out += `<path d="M${it.pts.map((p) => A(F(...p)).map((v) => r(v)).join(' ')).join('L')}${it.close ? 'Z' : ''}" fill="${it.fill ?? 'none'}" stroke="${INK}" stroke-width="${it.sw ?? 1}"${it.dash ? ` stroke-dasharray="${it.dash}"` : ''}/>`
      }
      if (it.label) {
        const [x, y] = A(F(...it.at))
        words += txt(x, y, 10.6, it.label, { fill: it.k === 'take' ? GREEN : INK, anchor: it.anchor ?? 'middle', spacing: 1.6, weight: 600, halo: PAPER, rot: ROT })
      }
    }
    return out + words
  }
}

/* ── A · The studio (the film's, on the pier) ─────────────────────────── */

// The film's studio (conman-city.mjs, job 3), turned to face the pier road.
const FY = (y) => 32 - y
const H = (kind, y, x0, x1, gaps = []) => wall(kind, [x0, FY(y)], [x1, FY(y)], gaps.map(([a, b, k = 1]) => [a - x0, b - x0, k === 0 ? 0 : -k]))
const V = (kind, x, y0, y1, gaps = []) => wall(kind, [x, FY(y1)], [x, FY(y0)], gaps.map(([a, b, k = 1]) => [y1 - b, y1 - a, k === 0 ? 0 : -k]))
const flip = (pts) => pts.map(([x, y, ...rest]) => [x, FY(y), ...rest])

const filmStudio = {
  key: 'film', title: 'A · The studio, as drawn',
  about: 'The film\'s studio at the end of the fluke road, turned to face it: lobby and offices at the front, Studio A, the control room and the tape store at the back. The shadow follows you in and stands where you can see him, the engineer signs in and rolls tape, and the taker comes up the back lane to the open side door of the tape store and leaves the same way.',
  sheet: SHEET, words: "I'M HERE TO STEAL YOUR SOUND",
  o: O, view: [24, 19, 15.6],
  foot: [box(0, 0, 46, 32)],
  walls: merge(
    H('ext', 0, 0, 46, [[6, 8, 0]]), V('ext', 46, 0, 32, [[12.4, 14.6, 0]]), H('ext', 32, 0, 46), V('ext', 0, 0, 32),
    V('int', 14, 0, 12), V('int', 30, 0, 12),
    H('int', 12, 0, 46, [[2, 12, 0], [20, 21.6, 1], [36, 37.6, 1]]),
    H('int', 15, 0, 46, [[10, 11.6, -1], [30, 31.6, -1], [41, 42.6, -1]]),
    V('int', 26, 15, 32), V('heavy', 38, 15, 32),
    glassOnly([[[26, FY(19)], [26, FY(28)]], [[16, 32], [28, 32]], [[32, 32], [44, 32]], [[0, FY(18)], [0, FY(29)]]]),
  ),
  tone: [box(38, 0, 46, 17)],
  items: [
    { k: 'rect', x: 16, y: FY(27), w: 5, h: 3, label: 'PIANO', side: 'above' },
    { k: 'ring', x: 5, y: FY(27.6), r: 1.6 }, { k: 'ring', x: 6, y: FY(21.6), r: 0.35 }, { k: 'ring', x: 9.6, y: FY(25.4), r: 0.35 }, { k: 'ring', x: 12.4, y: FY(20.6), r: 0.35 },
    { k: 'rect', x: 28, y: FY(21), w: 8, h: 2.4, label: 'DESK', side: 'above' },
    { k: 'loot', x: 35, y: FY(19.8), r: 0.7 },
    { k: 'take', x: 39.4, y: FY(30.2), w: 1.2, h: 13.6 }, { k: 'take', x: 44.4, y: FY(30.2), w: 1.2, h: 13.6 },
    { k: 'rect', x: 33, y: FY(4), w: 8, h: 2 }, { k: 'rect', x: 16.5, y: FY(4), w: 4, h: 2 }, { k: 'rect', x: 23, y: FY(4), w: 4, h: 2 },
  ],
  rooms: [[10.6, 29.4, 'LOBBY'], [22, 22.4, 'OFFICES'], [41.4, 26.4, 'GREEN ROOM'], [13, 2, 'STUDIO A'], [32, 2, 'CONTROL'], [43.2, 9.2, 'TAPES', -90]],
  marks: [[-1.4, 16, 'BRICK · 1 ST.', -90], [42, -2.2, 'BACK LANE']],
  storeys: [[44.4, 30.2, '1']],
  dims: [{ a: [0, -4.4], b: [46, -4.4] }],
  figures: [{ label: 'You', mark: 'Y', from: 100, to: 118.4, pts: [
    [13.6, 48], [9, 38], [7, 33], ...flip([[7, -0.5], [7, 13.4], [10.8, 13.4], [10.8, 16.4], [8, 22.5, 6, 'you sing'], [18.5, 22.4, 4, 'you play'],
      [10.8, 17], [10.8, 13.4], [36.6, 13.4], [36.6, 10.4], [34, 7.6]]),
  ] }],
  crew: [
    { n: 1, role: 'The shadow', style: 'solid', from: 102.4, to: 121.4, pts: [
      [14.8, 48], [9.6, 38.4], [8.1, 33], ...flip([[8.1, 3], [8.1, 14.2], [11.6, 14.2], [11.6, 17.4], [10.6, 17.6, 6, 'follows you'], [17.2, 21, 4],
        [11.6, 17.6], [11.6, 14.2], [37.2, 14.2], [37.2, 11.4], [39.6, 9.6, 0, 'pretends not to stare']]),
    ] },
    { n: 2, role: 'The taker', style: 'dash', from: 104, to: 119, pts: [
      [60, 18.6, 0, 'up the back lane'], [50.2, 18.6], ...flip([[46, 13.4], [41.8, 13.4], [41.8, 16.4], [41.8, 24, 5, 'steals your sound'], [41.8, 13.8], [46, 13.8]]), [50.2, 18.2], [60, 18.2],
    ] },
    { n: 3, role: 'The engineer', style: 'dot', from: 105.5, to: 120, pts: [
      [12.4, 48], [8.2, 38], [6.2, 33.4, 2, 'signs in'], ...flip([[6.2, 1], [6.2, 13.6], [30.8, 13.6], [30.8, 16.4], [32, 17.6, 6, 'rolls tape']]),
    ] },
  ],
}

/* ── B · The pier shed ───────────────────────────────────────────────── */

const pierShed = (() => {
  // A long shed on the pier's own line, its door at the road, its far end a boathouse over the water.
  const W = 14
  const L = 46
  const F = frame([D[0] * 2 + 17, D[1] * 2 + 39], 7, L)
  return {
    key: 'shed', title: 'B · The pier shed',
    about: 'The studio is a long boat shed that carries on along the line of the fluke and the pier road, out over the water. Rooms run one after another from the road door: lobby, Studio A, control, the tape room, and a boathouse at the far end. While you sing and play, our engineer rolls a second machine and leaves the copy on the tape-room shelf. The taker ties up under the boathouse, takes it and goes back out on the river. The shadow sits in on the session the whole time.',
    sheet: SHEET, words: 'I STICK TO THE SHADOWS',
    o: O, view: [...F(7, 19), 13.4],
    foot: [[F(0, 0), F(W, 0), F(W, L), F(0, L)]],
    walls: merge(
      wall('ext', F(0, 0), F(W, 0), [[4, 10, 0]]),
      wall('ext', F(W, 0), F(W, L)),
      wall('ext', F(0, L), F(W, L), [[6.2, 7.8, 1]]),
      wall('ext', F(0, 0), F(0, L), [[26, 36, 'g']]),
      wall('int', F(0, 6), F(W, 6), [[6.3, 7.7, -1]]),
      wall('int', F(0, 13), F(W, 13), [[11.8, 13.2, -1]]),
      wall('int', F(0, 22), F(11.2, 22), [[1.4, 9.8, 'g']]),
      wall('int', F(0, 39), F(11.2, 39), [[4.4, 6, 1]]),
      wall('int', F(11.2, 13), F(11.2, 39), [[3.6, 5, 1]]),
    ),
    tone: [[F(0, 0), F(W, 0), F(W, 6), F(0, 6)]],
    items: [],
    under: localItems(F, [
      { k: 'bins', x: 0.3, y: 6.6, w: 0.9, h: 5.8 },
      { k: 'take', x: 0.3, y: 7.2, w: 0.9, h: 3, label: 'THE COPY', at: [-1.4, 9], anchor: 'end' },
      { k: 'bins', x: 9.2, y: 6.5, w: 4.4, h: 0.7 },
      { k: 'rect', x: 1.4, y: 19.6, w: 8, h: 1.8 },
      { k: 'rect', x: 7, y: 14, w: 1.6, h: 1.4 }, { k: 'rect', x: 9, y: 14, w: 1.6, h: 1.4 },
      { k: 'loot', x: 8.6, y: 20.5, r: 0.5 },
      { k: 'rect', x: 1.2, y: 24, w: 4, h: 2.4, label: 'PIANO', at: [3.2, 25.6] },
      { k: 'ring', x: 4.6, y: 32, r: 0.35 }, { k: 'ring', x: 2.6, y: 36.2, r: 1.2 },
      { k: 'rect', x: 9.4, y: 44.4, w: 3.4, h: 0.9 },
      // The boat, moored off the boathouse door.
      { k: 'path', pts: [[4.6, -1.4], [9.4, -1.4], [9.4, -7.4], [7, -9.6], [4.6, -7.4]], close: true, fill: '#ece4d2', sw: 1.1 },
      { k: 'path', pts: [[4.6, -3.6], [9.4, -3.6]], sw: 0.8 },
    ]),
    rooms: [[...F(3.4, 3.4), 'BOATHOUSE', ROT, 10], [...F(8.6, 10), 'TAPES', ROT, 11], [...F(3.4, 15.2), 'CONTROL', ROT, 10], [...F(1.6, 30.6), 'STUDIO A', ROT - 90, 10],
      [...F(2.6, 43.2), 'LOBBY', ROT, 10]],
    marks: [[...F(-1.6, 31), 'PLATE GLASS', ROT - 90], [...F(15.6, 24), 'TIMBER · 1 ST. · ON PILES', ROT - 90], [...F(17, -6), 'THE RIVER', ROT]],
    storeys: [[...F(12.4, 42), '1']],
    dims: [{ a: F(-4.6, 0), b: F(-4.6, L), text: '46.00 m' }],
    figures: [{ label: 'You', mark: 'Y', from: 100, to: 118.4, pts: [
      F(5.6, 54), F(5.6, 46), F(5.4, 41.6), F(5.2, 39), [...F(4.6, 30), 8, 'you sing'], [...F(3.6, 27.6), 2], F(4.8, 36), F(5, 39.6), F(5.6, 42), F(5.6, 46), F(5.6, 54),
    ] }],
    crew: [
      { n: 1, role: 'The shadow', style: 'solid', from: 102.4, to: 121.4, pts: [
        F(6.8, 54), F(6.8, 46), F(6.6, 41.6), F(5.8, 39), [...F(7.6, 35.6), 4, 'follows you'], [...F(9.6, 25), 7, 'pretends not to stare'], F(6, 38.8), F(6.8, 42), F(6.8, 46), F(6.8, 54),
      ] },
      { n: 2, role: 'The taker', style: 'dash', from: 104, to: 119, pts: [
        [...F(7, -16), 0, 'by water'], F(7, -5.4), [...F(7, 2.4), 7, 'ties up underneath'], F(7, 5.4), F(7, 6.8), [...F(2, 7.8), 2.5, 'steals your sound'],
        F(6.6, 6.8), F(6.6, 2.4), F(6.6, -5.4), F(6.6, -16),
      ] },
      { n: 3, role: 'The engineer', style: 'dot', from: 105.5, to: 120, pts: [
        F(8, 54), F(8, 46), F(9, 42), F(12.6, 39.4), F(12.6, 17.3), F(9.6, 17.3), [...F(5.4, 18.6), 5, 'rolls a second machine'], F(9.6, 17.3), F(12.6, 17.3), F(12.6, 13.6), F(12.5, 12.4),
        [...F(2.4, 11.4), 1.5], F(12.1, 12.4), F(12.2, 17.7), F(9.6, 17.7), F(5.8, 18.8),
      ] },
    ],
  }
})()

/* ── C · The point ───────────────────────────────────────────────────── */

const thePoint = (() => {
  // The plan is the fluke's barb: square at the water, coming to a point at the pier road.
  const F = frame([D[0] * 1 + 17.4, D[1] * 1 + 38.4], 15, 37)
  const tip = 37
  return {
    key: 'point', title: 'C · The point, behind the glass',
    about: 'The studio is built to the shape of the fluke: square over the water and coming to a point at the pier road, with the foyer in the point. The control room looks into Studio A through one long window, and the shadow sits on its couch behind the glass, pretending not to stare, with the producer pacing in front of him. Meanwhile the engineer unbolts the vault\'s loading door, and the taker comes up the ladder from a boat and empties the reel shelves.',
    sheet: SHEET, words: 'I PRETEND NOT TO STARE',
    o: O, view: [29, 13, 12.4],
    foot: [[F(0, 0), F(30, 0), F(30, 22), F(15 + 2.5, tip), F(15 - 2.5, tip), F(0, 22)]],
    walls: merge(
      wall('ext', F(0, 0), F(30, 0), [[24.2, 25.8, -1]]),
      wall('ext', F(30, 0), F(30, 22)),
      wall('ext', F(30, 22), F(17.5, tip)),
      wall('ext', F(17.5, tip), F(12.5, tip), [[0.9, 4.1, 0]]),
      wall('ext', F(12.5, tip), F(0, 22)),
      wall('ext', F(0, 0), F(0, 22), [[8, 18, 'g']]),
      wall('int', F(0, 22), F(30, 22), [[7.6, 9.2, -1], [22, 23.6, 1]]),
      wall('int', F(18, 10), F(18, 22), [[1, 11, 'g']]),
      wall('heavy', F(18, 0), F(18, 10)),
      wall('heavy', F(18, 10), F(30, 10), [[0.6, 2.2, 1]]),
      wall('int', F(6, 0), F(6, 6), [[2.6, 4, 1]]),
      wall('int', F(0, 6), F(6, 6), [[1, 5, 'g']]),
    ),
    tone: [[F(18, 0), F(30, 0), F(30, 10), F(18, 10)]],
    items: [],
    under: localItems(F, [
      { k: 'take', x: 28.8, y: 1.4, w: 0.8, h: 6.4, label: 'THE REELS', at: [31.4, 7.6], anchor: 'start' },
      { k: 'bins', x: 18.6, y: 0.4, w: 5, h: 1 },
      { k: 'ring', x: 3, y: 3, r: 0.35 },
      { k: 'ring', x: 12.4, y: 6, r: 1.6 },
      { k: 'rect', x: 11, y: 15, w: 4.6, h: 2.2, label: 'PIANO', at: [13.3, 18.6] },
      { k: 'rect', x: 18.6, y: 13, w: 1.8, h: 6 },
      { k: 'loot', x: 19.5, y: 18.2, r: 0.5 },
      { k: 'rect', x: 28.4, y: 11.6, w: 1.2, h: 9 },
      { k: 'rect', x: 3.6, y: 23.4, w: 4, h: 1 },
      // The ladder down to the water at the deck's edge, and the boat at its foot.
      { k: 'path', pts: [[24.2, -16], [24.2, -13.6]], sw: 1 }, { k: 'path', pts: [[25.8, -16], [25.8, -13.6]], sw: 1 },
      { k: 'path', pts: [[24.2, -15.2], [25.8, -15.2]], sw: 0.8 }, { k: 'path', pts: [[24.2, -14.4], [25.8, -14.4]], sw: 0.8 },
      { k: 'path', pts: [[22.2, -17.2], [28.2, -17.2], [28.2, -22.6], [25.2, -24.8], [22.2, -22.6]], close: true, fill: '#ece4d2', sw: 1.1 },
    ]),
    rooms: [[...F(4.4, 16.6), 'STUDIO A', ROT], [...F(25.6, 11.8), 'CONTROL', ROT, 11], [...F(23.6, 8), 'VAULT', ROT, 11], [...F(3, 7.6), 'BOOTH', ROT, 10],
      [...F(20.4, 30.6), 'FOYER', ROT, 11], [...F(29.2, 16), 'COUCH', ROT - 90, 9]],
    marks: [[...F(17, 16), 'ONE-WAY GLASS', ROT - 90], [...F(-1.6, 13), 'PLATE GLASS', ROT - 90], [...F(32, 15), 'BRICK · 1 ST. · ON PILES', ROT - 90],
      [...F(9, -5), 'THE DECK', ROT]],
    storeys: [[...F(3, 20), '1']],
    dims: [],
    owners: [{ pts: [F(23.4, 13.4), F(23.4, 20)], period: 8 }],
    ownerLabel: 'The producer',
    figures: [{ label: 'You', mark: 'Y', from: 100, to: 118.4, pts: [
      F(14.4, 46), F(14.4, tip), F(14.4, 30), F(8.4, 23.4), F(8.4, 20), F(7.6, 4.2), F(6.4, 3.3), [...F(3.2, 3.6), 6, 'you sing'], F(6.6, 3.3), [...F(12.8, 14), 4, 'you play'],
      F(8.4, 20.6), F(8.4, 23.6), F(14.4, 30.4), F(14.4, tip), F(14.4, 46),
    ] }],
    crew: [
      { n: 1, role: 'The shadow', style: 'solid', from: 102.4, to: 121.4, pts: [
        F(15.6, 46), F(15.6, tip), F(15.6, 30), F(9.2, 23.8), F(9.2, 20.4), [...F(10.4, 9.6), 3, 'follows you'], F(9.4, 21), F(9.4, 23.4), F(22.4, 23.6), F(22.8, 21),
        [...F(27.6, 16), 0, 'pretends not to stare'],
      ] },
      { n: 2, role: 'The taker', style: 'dash', from: 104, to: 119, pts: [
        [...F(25.4, -30), 0, 'by water'], F(25.4, -17.6), [...F(25, -14.8), 6, 'up the ladder'], F(25, -1), F(25.2, 1.6), [...F(27.8, 4.4), 3, 'steals your sound'],
        F(25.6, 1.8), F(25.6, -1), F(25.6, -14.8), F(25.8, -17.6), F(25.8, -30),
      ] },
      { n: 3, role: 'The engineer', style: 'dot', from: 105.5, to: 120, pts: [
        F(16.6, 46), F(16.6, tip), F(16.6, 30), F(22.8, 24.4), F(22.8, 21), F(21.4, 12), F(19.4, 11.2), F(19.4, 9.6), [...F(24.6, 1.4), 2, 'unbolts the door'],
        F(19.8, 9.6), F(19.8, 11.2), F(21.4, 12.4), [...F(21.4, 18.4), 0, 'rolls tape'],
      ] },
    ],
  }
})()

/* ── D · The tie line ────────────────────────────────────────────────── */

const tieLine = {
  key: 'tie', title: 'D · The tie line',
  about: 'Nobody carries anything out. The engineer patches a second feed into a tie line, which runs through the machine-room wall to a van parked on the deck. In the back of the van the taker records the whole session on his own machine while you sing. The shadow follows you in and reads a paper in the corner of Studio A, and the producer never looks up from the desk.',
  sheet: SHEET, words: 'YOU WILL REMAIN UNAWARE',
  o: O, view: [23, 19.6, 15],
  foot: [box(0, 0, 44, 30)],
  walls: merge(
    wall('ext', [0, 0], [44, 0], [[3, 26, 'g']]),
    wall('ext', [44, 0], [44, 30]),
    wall('ext', [0, 30], [44, 30], [[1, 10, 'g'], [11.4, 13, 1]]),
    wall('ext', [0, 0], [0, 30]),
    wall('int', [0, 17], [44, 17], [[8, 9.6, -1], [15, 27, 'g'], [35, 36.6, -1]]),
    wall('int', [14, 17], [14, 30], [[2.6, 4.2, 1]]),
    wall('int', [30, 0], [30, 30], [[21, 22.6, -1]]),
    wall('int', [7, 0], [7, 6], [[2.4, 3.9, 1]]),
    wall('int', [0, 6], [7, 6], [[1, 6, 'g']]),
  ),
  tone: [box(30, 0, 44, 17)],
  items: [
    { k: 'ring', x: 3.5, y: 3, r: 0.35 },
    { k: 'rect', x: 16, y: 3.4, w: 5, h: 2.6, label: 'PIANO', side: 'right' },
    { k: 'ring', x: 24.4, y: 11, r: 1.6 },
    { k: 'rect', x: 16, y: 18.4, w: 10, h: 2 },
    { k: 'loot', x: 25, y: 19.4, r: 0.55 },
    { k: 'rect', x: 31, y: 27.2, w: 2.4, h: 1.8 }, { k: 'rect', x: 34.2, y: 27.2, w: 2.4, h: 1.8 },
    { k: 'rect', x: 42.8, y: 21.6, w: 0.8, h: 6 },
    { k: 'bins', x: 30.6, y: 0.4, w: 12.8, h: 0.9 }, { k: 'bins', x: 42.5, y: 1.8, w: 0.9, h: 14 },
    { k: 'rect', x: 1.2, y: 22, w: 1.2, h: 5 },
    { k: 'rect', x: 33.6, y: 32.4, w: 8, h: 4.6 },
    { k: 'take', x: 36.6, y: 32.9, w: 1.8, h: 1.9, label: 'THE SESSION' },
  ],
  over: ({ A, r, INK, PAPER, txt }) => {
    const pts = [[42.6, 26.4], [38, 26.4], [38, 32.9]].map((p) => A(p).map((v) => r(v)).join(' '))
    const [x, y] = A([38, 31.3])
    return `<path d="M${pts.join('L')}" stroke="${INK}" stroke-width="1.6" stroke-dasharray="5 3" fill="none"/>${txt(x - 10, y + 4, 10.6, 'TIE LINE', { anchor: 'end', spacing: 1.6, weight: 600, halo: PAPER })}`
  },
  rooms: [[21.5, 14.8, 'STUDIO A'], [7, 26.6, 'LOBBY'], [22, 28.2, 'CONTROL'], [37, 19.6, 'MACHINE ROOM', 0, 11], [36, 9, 'TAPES'], [3.5, 7.4, 'BOOTH', 0, 10],
    [34.7, 33.8, 'VAN', 0, 10]],
  marks: [[-1.4, 15, 'BRICK · 1 ST. · ON PILES', -90], [14.5, -1.6, 'PLATE GLASS ON THE RIVER'], [45.4, 26.8, 'PATCH BAY', -90]],
  storeys: [[1.6, 1.4, '1']],
  dims: [],
  owners: [{ pts: [[17.4, 25], [27.4, 25]], period: 9 }],
  ownerLabel: 'The producer',
  figures: [{ label: 'You', mark: 'Y', from: 100, to: 118.4, pts: [
    [13.4, 46], [12.2, 38], [12.2, 30], [12.2, 27.4], [8.8, 18.4], [8.8, 16.6], [9.4, 3.2], [7.8, 3.1], [4.2, 3.2, 6, 'you sing'], [7.8, 3.3], [18.5, 7.4, 4, 'you play'],
    [9, 16.4], [9, 18.6], [12.2, 27.6], [12.2, 30], [12.2, 38], [13.4, 46],
  ] }],
  crew: [
    { n: 1, role: 'The shadow', style: 'solid', from: 102.4, to: 121.4, pts: [
      [14.6, 46], [13.2, 38], [13.2, 30], [13.2, 27.6], [9.6, 18.4], [9.6, 16.4], [10.6, 11, 4, 'follows you'], [12.6, 14.4, 6, 'pretends not to stare'],
      [9.8, 16.8], [9.8, 18.2], [13.2, 28], [13.2, 30], [13.2, 38], [14.6, 46],
    ] },
    { n: 2, role: 'The taker', style: 'dash', from: 104, to: 119, pts: [
      [19.6, 46], [21.4, 38.4], [42.8, 38.4], [42.8, 34.4], [39.8, 34.2, 9, 'steals your sound'], [42.4, 34.6], [42.4, 38.9], [21, 38.9], [19.2, 46],
    ] },
    { n: 3, role: 'The engineer', style: 'dot', from: 105.5, to: 120, pts: [
      [11.8, 46], [11.4, 38], [11.4, 30], [11.4, 27.6], [14.4, 21.6], [16.4, 21.6], [21, 21.6, 4, 'rolls tape'], [29, 21.8], [32, 21.8], [41.8, 23.4, 3, 'patches a second feed'],
      [32, 22.2], [29, 22.2], [21.6, 22],
    ] },
  ],
}

export const VARIANTS = [filmStudio, pierShed, thePoint, tieLine]
