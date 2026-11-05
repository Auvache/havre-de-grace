/*
 * Conman · The City — the film (v1, 2026-11-02).
 *
 * The opening: the band's mark drawn on black, then CONMAN drawn on in the
 * live videos' Hairline capitals, then the black lifts off a town plan, close
 * on one empty lot. The first plan is drawn into it, wall by wall, like a pen.
 *
 * Five jobs, each a building drawn as an architect's plan in an empty lot of
 * one town, each harder than the last: a record shop with one conman (verse
 * 1), a counting house with two and a guard (verse 2, "cooking books"), a
 * studio with three, one of them following you (verse 3, "here to steal your
 * sound"), a museum with four through the break, and a concert hall with five
 * (verse 4): one comes up through the trap ("split the ground"), one down the
 * fly tower ("pierce the sky"), and the conman walks in the front, buys a
 * ticket and stands centre stage with all the eyes on him. The last thing
 * taken is the show.
 *
 * What is taken carries forward, in the take's green and unlabelled: the
 * record from the shop is on the studio's desk; the hall has all of it, the
 * ledger in the box office, the tapes on the sound desk, the portrait in the
 * foyer, the record in the green room. Nobody needs to see it.
 *
 * The town is the band's anchor (as decided 2026-11-02): its two main streets
 * are the stock and the shank, widened into boulevards, and a circus, two
 * roundabouts and a crescent cut through the grid for the ring, the stock's
 * balls and the arms. Every getaway drives part of it in red, in the
 * choruses and the gaps: the stock and its balls (shop to counting house,
 * counting house to studio), the shank and the ring (studio to museum),
 * the rest of the shank (museum to hall). In the last chorus the crew leave the
 * hall in two cars, one round each arm, while the camera pulls back to the
 * whole town, and the red they have left all song is the anchor. On the last
 * hit, the mark on black.
 *
 * Red is only the crew, as it is only the traveller in Andalusia and the
 * maze: every red line is someone's path, its head a numbered dot. Banknote
 * green is only the take. Guards, cameras, spotlights and "you" are ink.
 *
 * World units are metres; the plans are projected (the furniture keeps its
 * weight at every scale), the town is one transform over `lib` tiles with
 * non-scaling strokes, so the whole town costs a few <use>s a frame.
 *
 * The plans began as stills (tools/video-styles/visualizers/heist.mjs, deleted
 * 2026-11-05); this file is their film, and owns them now.
 */
import { rng, r, clamp01, lerp, easeInOut, ramp } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, SECOND_INK, paper, marginLyric, markDrawnAt, MARK_DRAW } from '../album.mjs'
import { drawLines } from '../hairline-draw.mjs'
import { TITLES } from '../titles.mjs'
import { END_BLACK, END_INK } from '../ending.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const PR = PX + PW
const PB = PY + PH
const CX = PX + PW / 2
const CY = PY + PH / 2

const INKS = { ground: PAPER, ink: INK, red: RED, green: SECOND_INK.conman, lot: '#cdc3ac' }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="${o.weight ?? 500}" fill="${o.fill}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null && o.opacity < 0.999 ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.italic ? ' font-style="italic"' : ''}>${esc(text)}</text>`
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')

/* ── The opening ──────────────────────────────────────────────────── */

/*
 * The live videos' clock (live-cards.mjs openingClock, approved 2026-10-27),
 * the same as Into the Wild's maze: the mark from 0.5 s, faded over 5.0–5.7;
 * the title drawn over 6.2–8.9; then the black lifts off the town.
 */
export const CITY_OPENING = { mark: 0.5, markOut: [5.0, 5.7], title: [6.2, 8.9], reveal: [10.6, 12.0] }

function openingSvg(time, uid) {
  const O = CITY_OPENING
  const black = 1 - ramp(time, ...O.reveal)
  if (black <= 0.001) return ''
  const markOn = 1 - ramp(time, ...O.markOut)
  const mark = time >= O.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${PAPER}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(time - O.mark, MARK_DRAW.done), `${uid}-mark`)}</g>`
    : ''
  const title = time >= O.title[0] ? drawLines(TITLES.conman, easeInOut(ramp(time, ...O.title)), PAPER, `${uid}-title`) : ''
  return `<g opacity="${r(easeInOut(black), 4)}"><rect width="1600" height="900" fill="${INK}"/>${mark}${title}</g>`
}

/* ── The anchor, as streets ───────────────────────────────────────── */

/*
 * The mark's anchor (its own units: 0–200 across, 3–222 down) at three metres
 * a unit, drawn as centrelines: the ring, the stock between its two balls, the
 * shank from the ring to the crown, the arms round to the flukes. The stock
 * and the shank fall on the grid's own street lines, so the town's two main
 * streets are the anchor's two straight strokes.
 */
const RING = { c: [300, 78], r: 54 }
const BALLS = [[126, 238.5], [474, 238.5]]
const BALL_R = 22
const STOCK_Y = 238.5
const SHANK_X = 300
const CROWN_Y = 643.5
const ARMS = { c: [300, 402], rx: 205.5, ry: 241.5 }
const FLUKES = [[[94.5, 402], [48, 306]], [[505.5, 402], [552, 306]]]
/** Boulevard width, kerb to kerb; grid streets are 10. */
const BLVD = 14
const HALF = BLVD / 2

const BLVD_D = [
  `M${BALLS[0][0] + BALL_R} ${STOCK_Y}H${BALLS[1][0] - BALL_R}`,
  ...BALLS.map(([x, y]) => `M${x + BALL_R} ${y}A${BALL_R} ${BALL_R} 0 1 1 ${x - BALL_R} ${y}A${BALL_R} ${BALL_R} 0 1 1 ${x + BALL_R} ${y}Z`),
  `M${RING.c[0] + RING.r} ${RING.c[1]}A${RING.r} ${RING.r} 0 1 1 ${RING.c[0] - RING.r} ${RING.c[1]}A${RING.r} ${RING.r} 0 1 1 ${RING.c[0] + RING.r} ${RING.c[1]}Z`,
  `M${SHANK_X} ${RING.c[1] + RING.r}V${CROWN_Y}`,
  `M${ARMS.c[0] + ARMS.rx} ${ARMS.c[1]}A${ARMS.rx} ${ARMS.ry} 0 0 1 ${ARMS.c[0] - ARMS.rx} ${ARMS.c[1]}`,
  ...FLUKES.map(([[x0, y0], [x1, y1]]) => `M${x0} ${y0}L${x1} ${y1}`),
].join('')

const circlePts = ([cx, cy], rad, a0, a1, step = 3) => {
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * rad) / step))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = lerp(a0, a1, i / n)
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]
  })
}
const armPts = (a0, a1, step = 3) => {
  const n = Math.ceil((Math.abs(a1 - a0) * (ARMS.rx + ARMS.ry)) / 2 / step)
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = lerp(a0, a1, i / n)
    return [ARMS.c[0] + ARMS.rx * Math.cos(a), ARMS.c[1] + ARMS.ry * Math.sin(a)]
  })
}

/** The anchor's centrelines sampled every couple of metres, for keeping lots off them. */
const ANCHOR_SAMPLES = (() => {
  const out = []
  for (let x = BALLS[0][0]; x <= BALLS[1][0]; x += 2) out.push([x, STOCK_Y])
  for (const b of BALLS) out.push(...circlePts(b, BALL_R, 0, Math.PI * 2, 2))
  out.push(...circlePts(RING.c, RING.r, 0, Math.PI * 2, 2))
  for (let y = RING.c[1] + RING.r; y <= CROWN_Y; y += 2) out.push([SHANK_X, y])
  out.push(...armPts(0, Math.PI, 2))
  for (const [[x0, y0], [x1, y1]] of FLUKES) for (let u = 0; u <= 1; u += 0.02) out.push([lerp(x0, x1, u), lerp(y0, y1, u)])
  return out
})()

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
 * stood there, the note is pencilled on the plan when they get there.
 * `style` tells the crew apart in the legend; dash-dot is over the roof or
 * through the air, a long dash is under the ground. `view` is the camera on
 * the job: [centre x, centre y] in job metres and px a metre.
 */
const JOBS = [
  {
    no: 1, name: 'The Record Shop', year: '1968', o: [170, 219], w: 16, h: 11,
    reveal: [12.8, 21.5], view: [9, 7.6, 40],
    walls: [
      H('ext', 0, 0, 16), V('ext', 16, 0, 11, [[2, 3.2, -1]]), H('ext', 11, 0, 16, [[6, 7.6, 1]]), V('ext', 0, 0, 11),
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
    rooms: [[6, 1.8, 'SHOP FLOOR'], [13.5, 2.4, 'BACK ROOM'], [4, 15.2, 'MAIN STREET'], [18.4, 6.4, 'ALLEY', 90]],
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 23.3, to: 42.3, pts: [
        [6.8, 16], [6.8, 11], [6.8, 9.8], [2.2, 7.7, 2.5, 'browses'], [2.2, 5.2], [5.8, 5.2, 4, 'talks shop'],
        [10.2, 5.2], [10.4, 7.6], [12.2, 7.6], [13.6, 9.4, 3, 'the masters'], [13.4, 5], [15.4, 2.6], [17.4, 2.6], [17.4, 16],
      ] },
    ],
  },
  {
    no: 2, name: 'The Counting House', year: '1971', o: [390, 204], w: 34, h: 26,
    reveal: [50.6, 55.6], view: [17, 14, 24],
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
    rooms: [[17, 23, 'BANKING HALL'], [6, 7.2, 'OFFICE'], [16, 6.8, 'STAFF'], [17, 10.4, 'BEHIND THE COUNTER'], [8, 35.2, 'MAIN STREET']],
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
  },
  {
    no: 3, name: 'The Studio', year: '1984', o: [310, 365], w: 46, h: 32,
    reveal: [91, 99.5], view: [23, 16.6, 19.5],
    walls: [
      H('ext', 0, 0, 46, [[6, 8, 0]]), V('ext', 46, 0, 32, [[12.4, 14.6, 0]]), H('ext', 32, 0, 46), V('ext', 0, 0, 32),
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
      // The record from the shop, on the desk.
      { k: 'loot', x: 35, y: 19.8, r: 0.8 },
      { k: 'take', x: 39.4, y: 16.6, w: 1.2, h: 13.6 }, { k: 'take', x: 44.4, y: 16.6, w: 1.2, h: 13.6 },
      { k: 'rect', x: 33, y: 2, w: 8, h: 2 }, { k: 'rect', x: 16.5, y: 2, w: 4, h: 2 }, { k: 'rect', x: 23, y: 2, w: 4, h: 2 },
      { k: 'cam', x: 13, y: 12.6, dir: 170 },
    ],
    rooms: [[7, 5.4, 'LOBBY'], [22, 8, 'OFFICES'], [38, 8, 'GREEN ROOM'], [13, 30.6, 'STUDIO A'], [32, 30.6, 'CONTROL'], [42, 31, 'TAPES'], [24, 13.9, 'CORRIDOR'], [24, -5.4, 'SHADOW LANE']],
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
        [52, -4], [52, 13.2], [46, 13.2], [41.8, 13.2], [41.8, 16.4], [41.8, 24, 5, 'steals your sound'], [41.8, 13.8], [46, 13.8], [52, 13.8],
      ] },
      { n: 3, role: 'The engineer', style: 'dot', from: 105.5, to: 120, pts: [
        [6.2, -4], [6.2, 3, 2, 'signs in'], [6.2, 13.6], [30.8, 13.6], [30.8, 16.4], [32, 17.6, 6, 'rolls tape'], [30.8, 14.4], [46, 14.4], [52, 14.4],
      ] },
    ],
  },
  {
    no: 4, name: 'The Museum', year: '1999', o: [272, 56], w: 56, h: 44,
    reveal: [135.5, 141], view: [28, 22.4, 15.4],
    walls: [
      H('ext', 0, 0, 56), V('ext', 56, 0, 44, [[6, 10, 0]]), H('ext', 44, 0, 56, [[26, 30, 0]]), V('ext', 0, 0, 44),
      V('int', 18, 0, 44, [[6, 8, 1], [20, 22, 0], [38, 40, 1]]), V('int', 38, 0, 44, [[6, 8, -1], [20, 22, 0], [38, 40, -1]]),
      H('int', 14, 0, 18, [[8, 10, 0]]), H('int', 30, 0, 18, [[8, 10, 0]]),
      H('int', 14, 38, 56, [[46, 48, 0]]), H('int', 30, 38, 56, [[46, 48, 0]]),
      H('int', 34, 18, 38, [[26, 30, 0]]), H('int', 8, 18, 38, [[26, 30, 0]]),
    ],
    arcs: [{ c: [28, 21], r: 9, spans: [[14, 76], [104, 166], [194, 256], [284, 346]] }],
    windows: [[3, 0, 15, 0], [41, 0, 53, 0], [0, 17, 0, 27]],
    items: [
      { k: 'take', x: 26.8, y: 19.8, w: 2.4, h: 2.4, label: 'THE PORTRAIT' },
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
      { n: 1, role: 'The inside man', style: 'solid', from: 142, to: 159.5, pts: [
        [28, 52], [28, 44], [28, 37, 6.5, 'joins the last tour'], [28, 30.6], [28, 23.4, 4, 'swaps the case'], [28, 36], [28, 44], [28, 52],
      ] },
      { n: 2, role: 'The electrician', style: 'dash', from: 141, to: 154, pts: [
        [64, 8], [56, 8], [51, 6], [53.2, 3.4, 5, 'cuts the power'], [51, 8], [56, 8.6], [64, 8.6],
      ] },
      { n: 3, role: 'The climber', style: 'dashdot', from: 145, to: 157.5, pts: [
        [28, -8], [28, 0], [28, 18, 5, 'down the skylight'], [28, 0], [28, -8],
      ] },
      { n: 4, role: 'The driver', style: 'longdash', from: 141, to: 160, pts: [
        [-7, 52], [63, 52], [63, -8], [-7, -8], [-7, 52], [26, 52, 0, 'engine running'],
      ] },
    ],
  },
  {
    // The hall: the front of house on the crescent, the shank running straight
    // to its doors. A plan shows what is above dash-dotted (the fly tower) and
    // what is below long-dashed (the trap room), which is the verse.
    no: 5, name: 'The Concert Hall', year: '2025', o: [268, 652], w: 64, h: 52,
    reveal: [165, 170], view: [32, 20, 11.5],
    walls: [
      H('ext', 0, 0, 64, [[28, 36, 0]]), V('ext', 64, 0, 52, [[46, 48, -1]]), H('ext', 52, 0, 64, [[6, 8, 1]]), V('ext', 0, 0, 52),
      H('int', 9, 0, 64, [[10, 13, 0], [51, 54, 0]]),
      V('int', 10, 0, 9, [[5.4, 7, 1]]), V('int', 54, 0, 9, [[5.4, 7, -1]]),
      H('heavy', 34, 0, 64, [[16, 48, 0]]),
      H('int', 44, 0, 64, [[12, 13.6, 1], [30, 31.6, 1], [50, 51.6, -1]]),
      V('int', 22, 44, 52), V('int', 42, 44, 52),
    ],
    windows: [[14, 0, 26, 0], [38, 0, 50, 0]],
    items: [
      { k: 'rows', c: [32, 34], radii: [6, 8.8, 11.6, 14.4, 17.2, 20], spans: [[205, 262], [278, 335]] },
      { k: 'rect', x: 28, y: 10.6, w: 8, h: 2, label: 'DESK', below: true },
      { k: 'over', x: 14, y: 31, w: 36, h: 15, label: 'FLY TOWER, ABOVE' },
      { k: 'under', x: 25, y: 36, w: 14, h: 6, label: 'TRAP ROOM, BELOW' },
      { k: 'take', x: 30.8, y: 37.4, w: 2.4, h: 2.4, label: 'CENTRE STAGE', below: true },
      { k: 'cam', x: 3, y: 12.4, dir: 39, reach: 32, spread: 5 }, { k: 'cam', x: 61, y: 12.4, dir: 141, reach: 32, spread: 5 },
      // Everything taken before, in the house that was built from it.
      { k: 'loot', x: 3.6, y: 6.2, w: 3, h: 1.2 },
      { k: 'loot', x: 34.6, y: 11, w: 1.1, h: 1.2 },
      { k: 'loot', x: 40, y: 0.5, w: 6, h: 0.6 },
      { k: 'loot', x: 36, y: 48.4, r: 0.8 },
    ],
    rooms: [[32, 5.4, 'FOYER'], [5, 3.2, 'BOX OFFICE'], [59, 3.2, 'OFFICE'], [7, 24, 'THE HOUSE'], [32, 42.6, 'STAGE'], [7.5, 40, 'WINGS'], [56.5, 40, 'WINGS'],
      [11, 48.8, 'DRESSING ROOMS'], [32, 50.6, 'GREEN ROOM'], [53, 48.8, 'LOADING'], [14, -4.6, 'THE CRESCENT']],
    guards: [{ pts: [[3.4, 15], [3.4, 31]], period: 9 }, { pts: [[60.6, 31], [60.6, 15]], period: 11 }],
    guardLabel: 'The ushers',
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 168.5, to: 187, pts: [
        [32, -6], [32, 0], [30, 4], [12.4, 4, 3, 'buys a ticket'], [11.6, 9], [11.6, 12], [32, 12.6], [32, 28], [32, 35.6, 4.7, 'all the eyes on me'],
      ] },
      { n: 2, role: 'The digger', style: 'longdash', from: 171, to: 186, pts: [
        [-6, -12], [-6, -6, 2.3, 'splits the ground'], [32, 39, 3, 'up through the trap'], [-6, -5.4], [-6, -12],
      ] },
      { n: 3, role: 'The flyer', style: 'dashdot', from: 170.3, to: 184, pts: [
        [80, -30], [50, 32, 1.5, 'pierces the sky'], [34, 38, 3], [50, 32.6], [80, -29.4],
      ] },
      { n: 4, role: 'The stagehand', style: 'dash', from: 168, to: 186, pts: [
        [7, 58], [7, 52], [12.8, 46], [12.8, 43], [8, 38.5, 5, 'on the lights'], [12.8, 43], [12.8, 46], [7, 52], [7, 58],
      ] },
      { n: 5, role: 'The driver', style: 'dot', from: 167.5, to: 187, pts: [[-12, -12], [76, -12], [76, -6], [40, -6, 0, 'engine running']] },
    ],
  },
]

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
  const walk = (time) => {
    if (time < from) return null
    const i = arrive.findLastIndex((a) => a <= time)
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
  walk.arrive = arrive
  return walk
}

/** A guard's patrol: back and forth along its points, or round them if `loop`. */
function patrol(g, time) {
  const pts = g.loop ? [...g.abs, g.abs[0]] : [...g.abs, ...g.abs.slice(0, -1).reverse()]
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  const total = lens.reduce((a, b) => a + b, 0)
  let d = ((((time / g.period) % 1) + 1) % 1) * total
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) return [lerp(pts[i][0], pts[i + 1][0], d / lens[i]), lerp(pts[i][1], pts[i + 1][1], d / lens[i])]
    d -= lens[i]
  }
  return pts[0]
}

/* ── The getaways: the anchor, driven ─────────────────────────────── */

const W = (job, p) => [p[0] + job.o[0], p[1] + job.o[1]]
const last = (c) => c.pts.at(-1)
const [SHOP, BANK, STUDIO, MUSEUM, HALL] = JOBS

/*
 * One car per getaway, except the last, which is two: the crew split at the
 * hall and leave round both arms. Angles are screen angles (y down).
 */
const GETAWAYS = [
  { from: 42.3, to: 50.5, pts: [
    W(SHOP, last(SHOP.crew[0])), [W(SHOP, last(SHOP.crew[0]))[0], STOCK_Y], [BALLS[0][0] + BALL_R, STOCK_Y],
    ...circlePts(BALLS[0], BALL_R, 0, -Math.PI * 2).slice(1), [W(BANK, BANK.crew[0].pts[0])[0], STOCK_Y], W(BANK, BANK.crew[0].pts[0]),
  ] },
  { from: 77.5, to: 91, pts: [
    W(BANK, last(BANK.crew[0])), [W(BANK, last(BANK.crew[0]))[0], STOCK_Y], [BALLS[1][0] - BALL_R, STOCK_Y],
    ...circlePts(BALLS[1], BALL_R, Math.PI, Math.PI * 3).slice(1), [SHANK_X, STOCK_Y], [SHANK_X, 358.5],
    [W(STUDIO, STUDIO.crew[0].pts[0])[0], 358.5], W(STUDIO, STUDIO.crew[0].pts[0]),
  ] },
  { from: 121.95, to: 136.5, pts: [
    W(STUDIO, last(STUDIO.crew[1])), [W(STUDIO, last(STUDIO.crew[1]))[0], 358.5], [SHANK_X, 358.5], [SHANK_X, RING.c[1] + RING.r],
    ...circlePts(RING.c, RING.r, Math.PI / 2, Math.PI / 2 + Math.PI * 2).slice(1), W(MUSEUM, MUSEUM.crew[0].pts[0]),
  ] },
  { from: 160, to: 166, pts: [W(MUSEUM, last(MUSEUM.crew[0])), [SHANK_X, RING.c[1] + RING.r], [SHANK_X, CROWN_Y]] },
  // The two last cars pull away slowly and speed up (`ease`), so they stay in
  // shot while the camera is still close and the town is coming in.
  { from: 188.3, to: 216, ease: 1.7, pts: [[SHANK_X, W(HALL, [0, -6])[1]], [SHANK_X, CROWN_Y], ...armPts(Math.PI / 2, Math.PI).slice(1), FLUKES[0][1]] },
  { from: 188.3, to: 216, ease: 1.7, pts: [[SHANK_X + 1.5, W(HALL, [0, -6])[1]], [SHANK_X + 1.5, CROWN_Y], ...armPts(Math.PI / 2, 0).slice(1), FLUKES[1][1]] },
]

// Make every job's points absolute, once, and its extent with the crew's.
for (const j of JOBS) {
  const [ox, oy] = j.o
  for (const c of [...j.crew, ...(j.marks ?? [])]) c.walk = walker(c.pts.map((p) => [p[0] + ox, p[1] + oy, p[2] ?? 0, p[3]]), c.from, c.to)
  for (const g of j.guards ?? []) g.abs = g.pts.map((p) => [p[0] + ox, p[1] + oy])
  // Lots stand back from the plan and from anyone walking the ground; over the roof and under it does not count.
  const ground = j.crew.filter((c) => c.style !== 'dashdot' && c.style !== 'longdash')
  const xs = [0, j.w, ...ground.flatMap((c) => c.pts.map((p) => p[0]))]
  const ys = [0, j.h, ...ground.flatMap((c) => c.pts.map((p) => p[1]))]
  j.reach = { x0: ox + Math.min(...xs), x1: ox + Math.max(...xs), y0: oy + Math.min(...ys), y1: oy + Math.max(...ys) }
}
for (const g of GETAWAYS) {
  const even = walker(g.pts.map((p) => [p[0], p[1], 0]), g.from, g.to)
  g.walk = g.ease ? (time) => even(time < g.from || time > g.to ? time : g.from + (g.to - g.from) * ((time - g.from) / (g.to - g.from)) ** g.ease) : even
}

/* ── Drawing a plan on, like a pen ────────────────────────────────── */

const THICK = { ext: 0.34, int: 0.14, heavy: 0.62 }

/*
 * Each job's strokes in the order a hand draws a plan: the outside walls
 * round, then the heavy walls, then the inside walls, then the curved ones.
 * Each stroke gets its own window inside the first 72% of the reveal, by
 * length, several in flight at once. Furniture, doors and windows come up
 * after the walls; the words last.
 */
for (const job of JOBS) {
  const strokes = []
  const cx = job.w / 2
  const cy = job.h / 2
  for (const kind of ['ext', 'heavy', 'int']) {
    const mine = job.walls.filter((w) => w.kind === kind).flatMap((w) => w.segs.map(([a, b]) => ({ kind, a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) })))
    if (kind === 'ext') mine.sort((p, q) => angleFrom(p, cx, cy) - angleFrom(q, cx, cy))
    strokes.push(...mine)
  }
  for (const a of job.arcs ?? []) for (const [d0, d1] of a.spans) strokes.push({ kind: 'arc', c: a.c, rad: a.r, d0, d1, len: ((d1 - d0) * Math.PI * a.r) / 180 })
  const [ra, rb] = job.reveal
  const span = (rb - ra) * 0.72
  const total = strokes.reduce((s, q) => s + q.len, 0)
  const each = (l) => Math.min(span * 0.35, 0.3 + 0.05 * l)
  let acc = 0
  for (const q of strokes) {
    q.t0 = ra + (span - each(q.len)) * (acc / total)
    q.t1 = q.t0 + each(q.len)
    acc += q.len
  }
  job.strokes = strokes
}
function angleFrom(s, cx, cy) {
  const mx = (s.a[0] + s.b[0]) / 2 - cx
  const my = (s.a[1] + s.b[1]) / 2 - cy
  // From the top-left corner, clockwise.
  return (((Math.atan2(my, mx) + Math.PI * 0.8) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
}

const DASH = { solid: '', dash: '14 7', dot: '2 7', dashdot: '16 6 3 6', longdash: '26 9' }

/**
 * One job drawn through camera `cam` ({ s, X, Y }) at song `time`, `k`
 * scaling every pen. Returns layers so several jobs stack: plan under, red
 * over, heads and notes on top.
 */
function drawJob(job, cam, time, { k = 1, ink = INKS, uid = '' } = {}) {
  const { s, X, Y } = cam
  const A = (p) => [X(p[0] + job.o[0]), Y(p[1] + job.o[1])]
  const [ra, rb] = job.reveal
  if (time < ra) return { plan: '', red: '', top: '' }
  const span = rb - ra
  const things = easeInOut(ramp(time, ra + span * 0.5, ra + span * 0.82))
  const words = easeInOut(ramp(time, ra + span * 0.74, rb))
  const label = s * k > 9
  const fs = Math.max(9, Math.min(15, s * 0.42)) * Math.min(1, k * 1.15)
  const pen = (kind) => r(Math.max(kind === 'int' ? 1.4 : 2.4, THICK[kind] * s) * Math.min(1, k * 1.2))
  let plan = ''

  // Things in the rooms, up after the walls: the take first, so walls draw over its edges.
  let room = ''
  for (const it of job.items) {
    if (it.k !== 'take' && it.k !== 'loot') continue
    if (it.r) {
      const [x, y] = A([it.x, it.y])
      room += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(Math.max(2, it.r * s))}" fill="url(#${uid}-take)" stroke="${ink.green}" stroke-width="${r(1.4 * k)}"/>`
      continue
    }
    const [x, y] = A([it.x, it.y])
    room += `<rect x="${r(x)}" y="${r(y)}" width="${r(Math.max(2, it.w * s))}" height="${r(Math.max(2, it.h * s))}" fill="url(#${uid}-take)" stroke="${ink.green}" stroke-width="${r(1.6 * k)}"/>`
  }
  // Cameras and spotlights: a cone of what they see, ink at a breath.
  for (const it of job.items) {
    if (it.k !== 'cam') continue
    const [x, y] = A([it.x, it.y])
    const reach = (it.reach ?? 7) * s
    const spread = it.spread ?? 24
    const a0 = ((it.dir - spread) * Math.PI) / 180
    const a1 = ((it.dir + spread) * Math.PI) / 180
    room += `<path d="M${r(x)} ${r(y)}L${r(x + Math.cos(a0) * reach)} ${r(y + Math.sin(a0) * reach)}A${r(reach)} ${r(reach)} 0 0 1 ${r(x + Math.cos(a1) * reach)} ${r(y + Math.sin(a1) * reach)}Z" fill="${ink.ink}" opacity="${it.reach ? 0.05 : 0.07}"/>`
    room += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(Math.max(2.5 * k, 0.35 * s))}" fill="${ink.ink}"/>`
  }
  // Lasers: banknote green, gone when the power is.
  if (job.lasers && time < job.lasers.off) {
    const flick = time > job.lasers.off - 0.4 ? 0.4 : 0.85
    for (const [x0, y0, x1, y1] of job.lasers.beams) {
      const [a, b] = A([x0, y0])
      const [c, d] = A([x1, y1])
      room += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${ink.green}" stroke-width="${r(1.6 * k)}" stroke-dasharray="3 4" opacity="${flick}"/>`
    }
  }
  // Furniture, seating, and what is above or below.
  for (const it of job.items) {
    if (it.k === 'rect') {
      const [x, y] = A([it.x, it.y])
      room += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="none" stroke="${ink.ink}" stroke-width="${r(1.1 * k)}"/>`
    } else if (it.k === 'ring') {
      const [x, y] = A([it.x, it.y])
      room += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(it.r * s)}" fill="none" stroke="${ink.ink}" stroke-width="${r(1.1 * k)}"${it.dash ? ' stroke-dasharray="6 5"' : ''}/>`
    } else if (it.k === 'rows') {
      const [cx, cy] = A(it.c)
      let d = ''
      for (const rad of it.radii) for (const [d0, d1] of it.spans) {
        const R = rad * s
        const p0 = [cx + Math.cos((d0 * Math.PI) / 180) * R, cy + Math.sin((d0 * Math.PI) / 180) * R]
        const p1 = [cx + Math.cos((d1 * Math.PI) / 180) * R, cy + Math.sin((d1 * Math.PI) / 180) * R]
        d += `M${r(p0[0])} ${r(p0[1])}A${r(R)} ${r(R)} 0 0 1 ${r(p1[0])} ${r(p1[1])}`
      }
      room += `<path d="${d}" fill="none" stroke="${ink.ink}" stroke-width="${r(1 * k)}" opacity="0.8"/>`
    } else if (it.k === 'over' || it.k === 'under') {
      const [x, y] = A([it.x, it.y])
      const dash = (it.k === 'over' ? DASH.dashdot : DASH.longdash).split(' ').map((v) => r(v * 0.6 * k)).join(' ')
      room += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="none" stroke="${ink.ink}" stroke-width="${r(1.1 * k)}" stroke-dasharray="${dash}" opacity="0.75"/>`
    }
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
  room += `<path d="${swings}" stroke="${ink.ink}" stroke-width="${r(0.9 * k)}" fill="none"/>`
  const roomUnder = things > 0.001 ? `<g${op(things)}>${room}</g>` : ''

  // Walls in poché, drawn on: finished strokes in one path a thickness, the ones in flight each partial.
  const done = { ext: '', int: '', heavy: '' }
  let arcs = ''
  let live = ''
  for (const q of job.strokes) {
    if (time < q.t0) continue
    const u = time >= q.t1 ? 1 : easeInOut((time - q.t0) / (q.t1 - q.t0))
    if (q.kind === 'arc') {
      const [cx, cy] = A(q.c)
      const R = q.rad * s
      const e = q.d0 + (q.d1 - q.d0) * u
      const p0 = [cx + Math.cos((q.d0 * Math.PI) / 180) * R, cy + Math.sin((q.d0 * Math.PI) / 180) * R]
      const p1 = [cx + Math.cos((e * Math.PI) / 180) * R, cy + Math.sin((e * Math.PI) / 180) * R]
      arcs += `M${r(p0[0])} ${r(p0[1])}A${r(R)} ${r(R)} 0 0 1 ${r(p1[0])} ${r(p1[1])}`
      continue
    }
    const [x0, y0] = A(q.a)
    const [x1, y1] = A(q.b)
    const d = `M${r(x0)} ${r(y0)}L${r(lerp(x0, x1, u))} ${r(lerp(y0, y1, u))}`
    if (u >= 1) done[q.kind] += d
    else live += `<path d="${d}" stroke="${ink.ink}" stroke-width="${pen(q.kind)}" stroke-linecap="square" fill="none"/>`
  }
  let wallsSvg = ''
  for (const kind of ['int', 'ext', 'heavy']) {
    if (done[kind]) wallsSvg += `<path d="${done[kind]}" stroke="${ink.ink}" stroke-width="${pen(kind)}" stroke-linecap="square" fill="none"/>`
  }
  if (arcs) wallsSvg += `<path d="${arcs}" stroke="${ink.ink}" stroke-width="${pen('ext')}" fill="none"/>`
  // Windows: the wall opened to paper, a thin line across it, over the walls.
  plan += roomUnder + wallsSvg + live
  if (things > 0.001) {
    let win = ''
    for (const [x0, y0, x1, y1] of job.windows ?? []) {
      const [a, b] = A([x0, y0])
      const [c, d] = A([x1, y1])
      win += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${ink.ground}" stroke-width="${r(pen('ext') - 1)}"/><line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${ink.ink}" stroke-width="${r(0.8 * k)}"/>`
    }
    plan += `<g${op(things)}>${win}</g>`
  }

  // Words: room names, labels on things, the dimension line.
  if (label && words > 0.001) {
    let w = ''
    for (const [x, y, text, rot] of job.rooms) {
      const [sx, sy] = A([x, y])
      const t = txt(sx, sy, fs, text, { fill: ink.ink, anchor: 'middle', spacing: 2.4, opacity: 0.7 })
      w += rot ? `<g transform="rotate(${rot} ${r(sx)} ${r(sy)})">${t}</g>` : t
    }
    for (const it of job.items) {
      if (!it.label) continue
      const o = { fill: it.k === 'take' ? ink.green : ink.ink, anchor: 'middle', spacing: 1.6, weight: 600 }
      if (it.k === 'over' || it.k === 'under') {
        const [x, y] = A([it.x, it.y])
        w += txt(x + 6, it.k === 'over' ? y - 6 : y + it.h * s + fs * 1.1, fs * 0.74, it.label, { ...o, anchor: 'start', opacity: 0.75 })
        continue
      }
      const [x, y] = A([it.x + it.w / 2, it.y + it.h / 2])
      const big = !it.below && it.w * s > it.label.length * fs * 0.62
      w += it.left
        ? txt(A([it.x, 0])[0] - 8, y + fs * 0.3, fs * 0.82, it.label, { ...o, anchor: 'end' })
        : txt(x, big ? y + fs * 0.35 : A([0, it.y + it.h])[1] + fs * 1.2, fs * 0.82, it.label, o)
    }
    const [dx0, dy] = A([0, -2.2])
    const [dx1] = A([job.w, 0])
    w += `<path d="M${r(dx0)} ${r(dy)}H${r(dx1)}M${r(dx0)} ${r(dy - 6)}v12M${r(dx1)} ${r(dy - 6)}v12M${r(dx0 - 4)} ${r(dy + 4)}l8 -8M${r(dx1 - 4)} ${r(dy + 4)}l8 -8" stroke="${ink.ink}" stroke-width="${r(0.9 * k)}" fill="none" opacity="0.8"/>`
    w += `<rect x="${r((dx0 + dx1) / 2 - fs * 2.2)}" y="${r(dy - fs * 0.7)}" width="${r(fs * 4.4)}" height="${r(fs * 1.4)}" fill="${ink.ground}"/>`
    w += txt((dx0 + dx1) / 2, dy + fs * 0.36, fs * 0.9, `${job.w.toFixed(2)} m`, { fill: ink.ink, anchor: 'middle', spacing: 1 })
    plan += `<g${op(words)}>${w}</g>`
  }

  // Guards: ink, dotted where they walk, a ring where they are.
  let top = ''
  const crewFrom = Math.min(...job.crew.map((c) => c.from))
  if (time >= crewFrom - 4) {
    const g0 = easeInOut(ramp(time, crewFrom - 4, crewFrom - 3))
    for (const g of job.guards ?? []) {
      const [gx, gy] = patrol(g, time)
      const d = (g.loop ? [...g.abs, g.abs[0]] : g.abs).map((p, i) => `${i ? 'L' : 'M'}${r(X(p[0]))} ${r(Y(p[1]))}`).join('')
      plan += `<path d="${d}" stroke="${ink.ink}" stroke-width="${r(1 * k)}" stroke-dasharray="1 5" stroke-linecap="round" fill="none" opacity="${r(0.6 * g0, 3)}"/>`
      top += `<g${op(g0)}><circle cx="${r(X(gx))}" cy="${r(Y(gy))}" r="${r(7 * k)}" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="${r(2 * k)}"/><circle cx="${r(X(gx))}" cy="${r(Y(gy))}" r="${r(2.4 * k)}" fill="${ink.ink}"/></g>`
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
  `<g${op(o)}><circle cx="${r(x)}" cy="${r(y)}" r="${r(10.5 * k)}" fill="${ink.red}"/>${n && k > 0.5 ? txt(x, y + 4.6 * k, 13 * k, String(n), { fill: ink.ground, anchor: 'middle', weight: 700 }) : ''}</g>`

/** A pencilled note where a conman stopped, written on as they arrive. */
function note(x, y, text, since, fs, ink, k, mine = false) {
  const o = clamp01(since / 0.35)
  if (o <= 0) return ''
  const tx = x + 16 * k
  const ty = y - 14 * k
  return `<g${op(o)}><path d="M${r(x + 6 * k)} ${r(y - 5 * k)}L${r(tx - 2)} ${r(ty + 3)}" stroke="${ink.ink}" stroke-width="${r(0.9 * k)}"/>${txt(tx, ty, fs * 1.08, text, { fill: ink.ink, italic: true, weight: mine ? 400 : 500 })}</g>`
}

/* ── The town ─────────────────────────────────────────────────────── */

// Grid streets every 70 m across and 60 m down, ten wide, on the shank and the stock.
const GX = (i) => SHANK_X + 70 * i
const GY = (j) => STOCK_Y + 60 * j
const GRID_I = [-11, 11]
const GRID_J = [-6, 9]
const NAMES_X = { '-3': 'Lightning Ave', '-2': 'Steady Notes Rd', '-1': 'Groove St', 1: 'Clear Sky Ave', 2: 'Smoke St', 3: 'Several Rd' }
const NAMES_Y = { '-2': 'Fast Lane', '-1': 'Bank Street', 1: 'Eyes Row', 2: 'Shadow Lane', 3: 'Wake Road', 4: 'Goodness Way', 5: 'Steady Row', 6: 'Earth Street' }

/** Distance from a point to the anchor's centrelines (sampled). */
const toAnchor = (x, y) => {
  let best = Infinity
  for (const [ax, ay] of ANCHOR_SAMPLES) {
    const d = (ax - x) ** 2 + (ay - y) ** 2
    if (d < best) best = d
  }
  return Math.sqrt(best)
}
const nearPlot = (x, y, w, h) => JOBS.some((jb) => x < jb.reach.x1 + 3 && x + w > jb.reach.x0 - 3 && y < jb.reach.y1 + 3 && y + h > jb.reach.y0 - 3)

/*
 * The town as tiles of blocks, in world metres: lots round the edge of each
 * block (none on a plot, in the circus, on a roundabout or on a boulevard)
 * and each block's kerb. Built once; the frame <use>s the tiles in view.
 */
const TILE = [4, 3]
const TILES = (() => {
  const tiles = new Map()
  for (let i = GRID_I[0]; i < GRID_I[1]; i++) {
    for (let j = GRID_J[0]; j < GRID_J[1]; j++) {
      const bx = GX(i) + 5
      const by = GY(j) + 5
      const bw = 60
      const bh = 50
      const g = rng(1000 + (i + 50) * 37 + (j + 50) * 101)
      let lots = ''
      const add = (x, y, w, h) => {
        if (w < 3 || h < 3) return
        const mx = x + w / 2
        const my = y + h / 2
        if (nearPlot(x, y, w, h)) return
        if (Math.hypot(mx - RING.c[0], my - RING.c[1]) < RING.r) return
        if (BALLS.some(([bx2, by2]) => Math.hypot(mx - bx2, my - by2) < BALL_R)) return
        if (toAnchor(mx, my) < HALF + 1) return
        lots += `M${r(x)} ${r(y)}h${r(w)}v${r(h)}h${r(-w)}Z`
      }
      const cuts = (len) => {
        const out = [0]
        while (out.at(-1) < len - 8) out.push(Math.min(len, out.at(-1) + 8 + g() * 14))
        out[out.length - 1] = len
        return out
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
      const ti = Math.floor((i - GRID_I[0]) / TILE[0])
      const tj = Math.floor((j - GRID_J[0]) / TILE[1])
      const id = `${ti}-${tj}`
      if (!tiles.has(id)) tiles.set(id, { id, x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, lots: '', kerbs: '' })
      const t = tiles.get(id)
      t.lots += lots
      t.kerbs += `M${bx} ${r(by)}h${bw}v${bh}h${-bw}Z`
      t.x0 = Math.min(t.x0, bx - 5)
      t.y0 = Math.min(t.y0, by - 5)
      t.x1 = Math.max(t.x1, bx + bw + 5)
      t.y1 = Math.max(t.y1, by + bh + 5)
    }
  }
  return [...tiles.values()]
})()

const libCache = new Map()
/** The town as defs for this uid: every tile, the boulevards, the same on every frame. */
function townLib(uid, ink = INKS) {
  if (!libCache.has(uid)) {
    const nss = 'vector-effect="non-scaling-stroke"'
    libCache.set(uid, `<defs><pattern id="${uid}-take" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="1.6" fill="${ink.green}"/></pattern>
${TILES.map((t) => `<g id="${uid}-t${t.id}"><path d="${t.lots}" fill="${ink.lot}" fill-opacity="0.35" stroke="${ink.ink}" stroke-width="0.8" stroke-opacity="0.5" ${nss}/><path d="${t.kerbs}" fill="none" stroke="${ink.ink}" stroke-width="1.1" stroke-opacity="0.55" ${nss}/></g>`).join('')}
<path id="${uid}-blvd" d="${BLVD_D}" fill="none"/></defs>`)
  }
  return libCache.get(uid)
}

/** The town through the camera: tiles in view, the circus and the islands cleared, the boulevards cut through. */
function town(cam, uid, ink = INKS) {
  const { s, cx, cy } = cam
  const wx0 = (PX - CX) / s + cx
  const wx1 = (PR - CX) / s + cx
  const wy0 = (PY - CY) / s + cy
  const wy1 = (PB - CY) / s + cy
  let tiles = ''
  for (const t of TILES) if (t.x1 >= wx0 && t.x0 <= wx1 && t.y1 >= wy0 && t.y0 <= wy1) tiles += `<use href="#${uid}-t${t.id}"/>`
  // The plots: cleared to paper, a dashed line round the lot until it is built on.
  let plots = ''
  for (const jb of JOBS) {
    const p = 1.6
    plots += `<rect x="${r(jb.o[0] - p, 2)}" y="${r(jb.o[1] - p, 2)}" width="${r(jb.w + p * 2, 2)}" height="${r(jb.h + p * 2, 2)}" fill="${ink.ground}"/>`
  }
  const kerb = 1.1 / s
  const far = clamp01((6 - s) / 4.5)
  const garden = `<circle cx="${RING.c[0]}" cy="${RING.c[1]}" r="${RING.r - HALF}" fill="${ink.ground}"/>` +
    BALLS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${BALL_R - HALF}" fill="${ink.ground}"/>`).join('')
  return `<g transform="translate(${r(CX - cx * s, 2)} ${r(CY - cy * s, 2)}) scale(${r(s, 5)})">
<g opacity="${r(1 - far * 0.35, 3)}">${tiles}</g>${garden}${plots}
<use href="#${uid}-blvd" stroke="${ink.ink}" stroke-opacity="0.55" stroke-width="${r(BLVD + kerb * 2, 4)}" stroke-linejoin="round"/>
<use href="#${uid}-blvd" stroke="${ink.ground}" stroke-width="${BLVD}" stroke-linejoin="round" stroke-linecap="round"/>
</g>`
}

/** A dashed line round each plot not yet built on: an empty lot, waiting. */
function siteLines(cam, time, ink = INKS) {
  let out = ''
  for (const jb of JOBS) {
    const o = 1 - easeInOut(ramp(time, jb.reveal[0], jb.reveal[0] + 1.5))
    if (o <= 0.001) continue
    const p = 1.2
    const x = cam.X(jb.o[0] - p)
    const y = cam.Y(jb.o[1] - p)
    out += `<rect x="${r(x)}" y="${r(y)}" width="${r((jb.w + p * 2) * cam.s)}" height="${r((jb.h + p * 2) * cam.s)}" fill="none" stroke="${ink.ink}" stroke-width="1" stroke-dasharray="6 5" opacity="${r(0.55 * o, 3)}"/>`
  }
  return out
}

/** Street names, in screen space, when the camera is at a street's distance. */
function streetNames(cam, ink = INKS) {
  const { s, X, Y } = cam
  if (s < 2.2 || s > 22) return ''
  const fade = Math.min(clamp01((s - 2.2) / 0.8), clamp01((22 - s) / 4))
  const fs = Math.max(10, Math.min(14, s * 1.1))
  const o = { fill: ink.ink, anchor: 'middle', spacing: 3, opacity: 0.45 * fade }
  const inView = (x, y) => x > PX + 60 && x < PR - 60 && y > PY + 40 && y < PB - 40
  const clear = (wx, wy) => Math.hypot(wx - RING.c[0], wy - RING.c[1]) > RING.r + HALF + 4 &&
    BALLS.every(([bx, by]) => Math.hypot(wx - bx, wy - by) > BALL_R + HALF + 4) &&
    !JOBS.some((jb) => wx > jb.o[0] - 8 && wx < jb.o[0] + jb.w + 8 && wy > jb.o[1] - 8 && wy < jb.o[1] + jb.h + 8)
  let out = ''
  const at = (wx, wy, text, rot = 0, own = false) => {
    if (!own && !clear(wx, wy)) return
    const x = X(wx)
    const y = Y(wy)
    if (!inView(x, y)) return
    const t = txt(x, y + fs * 0.35, fs, text.toUpperCase(), o)
    out += rot ? `<g transform="rotate(${r(rot, 2)} ${r(x)} ${r(y)})">${t}</g>` : t
  }
  // The anchor's own streets, along them, in the half of the road the red is not in.
  const side = HALF * 0.5
  for (const x of [230, 345]) at(x, STOCK_Y + side, 'Main Street', 0, true)
  for (const y of [190, 300, 470, 580]) at(SHANK_X - side, y, 'High Street', -90, true)
  at(RING.c[0], RING.c[1] - RING.r - side, 'The Circus', 0, true)
  for (const a of [0.66, 0.34].map((f) => Math.PI * f)) {
    const px = ARMS.c[0] + (ARMS.rx + side) * Math.cos(a)
    const py = ARMS.c[1] + (ARMS.ry + side) * Math.sin(a)
    let rot = (Math.atan2(ARMS.ry * Math.cos(a), -ARMS.rx * Math.sin(a)) * 180) / Math.PI
    if (rot > 90) rot -= 180
    if (rot < -90) rot += 180
    at(px, py, 'The Crescent', rot, true)
  }
  // The grid's, once each, near the middle of the view.
  for (const [i, name] of Object.entries(NAMES_X)) {
    const x = GX(Number(i))
    const wy = cam.cy + 90 / s
    at(x, GY(Math.round((wy - STOCK_Y) / 60)) + 30, name, -90)
  }
  for (const [j, name] of Object.entries(NAMES_Y)) {
    const y = GY(Number(j))
    const wx = cam.cx - 220 / s
    at(GX(Math.round((wx - SHANK_X) / 70)) + 35, y, name)
  }
  return out
}

/* ── Screen furniture: the title block, the crew legend, the north point ── */

function titleBlock(job, ink, career, opacity = 1) {
  if (opacity <= 0.001) return ''
  const w = 340
  const h = 112
  const x = PR - w - 22
  const y = PB - h - 22
  const lines = career
    ? ['THE CAREER', 'JOBS 1–5 · 1968–2025', 'SHEET 6/6']
    : [job.name.toUpperCase(), `JOB No. ${job.no} · ${job.year}`, `SHEET ${job.no}/6`]
  return `<g${op(opacity)}>
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

function legend(job, ink, time, opacity) {
  if (opacity <= 0.001) return ''
  const x = PX + 22
  const y = PY + 22
  const w = 250
  const h = 40 + job.crew.length * 26 + (job.marks ? 26 : 0) + (job.guards ? 26 : 0)
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="1.6"/>
  ${txt(x + 14, y + 24, 12, 'THE CREW', { fill: ink.ink, spacing: 4, opacity: 0.7 })}`
  let ry = y + 52
  for (const c of job.crew) {
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
    s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${ink.ink}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round"/><circle cx="${x + 82}" cy="${ry - 4}" r="6" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="2"/>${txt(x + 100, ry + 1, 14, job.guardLabel ?? (job.guards.length > 1 ? 'The guards' : 'The guard'), { fill: ink.ink })}`
  }
  return `<g${op(opacity)}>${s}</g>`
}

function northPoint(ink) {
  const nx = PR - 60
  const ny = PY + 66
  return `<g opacity="0.75"><circle cx="${nx}" cy="${ny}" r="24" fill="${ink.ground}" stroke="${ink.ink}" stroke-width="1.2"/><path d="M${nx} ${ny - 30}L${nx + 9} ${ny + 14}L${nx} ${ny + 6}L${nx - 9} ${ny + 14}Z" fill="${ink.ink}"/>${txt(nx, ny - 36, 13, 'N', { fill: ink.ink, anchor: 'middle', weight: 600 })}</g>`
}

/** The job the furniture belongs to: from a little before its plan is drawn. */
const jobAt = (time) => JOBS.findLast((j) => j.reveal[0] - 1.5 <= time) ?? JOBS[0]
const CAREER = 203

/* ── The camera ───────────────────────────────────────────────────── */

const jobView = (job) => {
  const [x, y, s] = job.view
  return () => ({ cx: job.o[0] + x, cy: job.o[1] + y, s })
}
const fixed = (cx, cy, s) => () => ({ cx, cy, s })
/** Where a getaway's car is, clamped to its run. */
const carAt = (g, t) => {
  const w = g.walk(Math.max(g.from, Math.min(g.to, t)))
  return w ? w.at : g.pts[0]
}
/** Following a car: its position averaged over two seconds, so the camera never jerks round a corner. */
const follow = (g, s) => (t) => {
  let x = 0
  let y = 0
  const n = 9
  for (let i = 0; i < n; i++) {
    const [px, py] = carAt(g, t + (i / (n - 1) - 0.5) * 2)
    x += px
    y += py
  }
  return { cx: x / n, cy: y / n, s }
}

/** The whole town: the anchor from the ring's top to the hall's back wall, centred. */
const FINAL = (() => {
  const top = RING.c[1] - RING.r - 12
  const bottom = HALL.o[1] + HALL.h + 10
  return { cx: SHANK_X, cy: (top + bottom) / 2, s: (PH * 0.94) / (bottom - top) }
})()

/*
 * Shots: each holds a view (which may move) from `from` to `to`; between two
 * shots the camera eases from one to the other, the scale in log space. The
 * last move, out to the whole town, is one steady pull at an even speed with
 * a second's ease at each end, as the maze's is.
 */
const SHOTS = [
  { from: -1, to: 42.6, view: jobView(SHOP) },
  { from: 45, to: 48.4, view: fixed(270, 240, 4.2) },
  { from: 51, to: 77.6, view: jobView(BANK) },
  { from: 80.2, to: 88.6, view: fixed(392, 300, 4.0) },
  { from: 91.4, to: 122.1, view: jobView(STUDIO) },
  { from: 124.2, to: 127.2, view: follow(GETAWAYS[2], 3.4) },
  { from: 129.4, to: 134.8, view: fixed(RING.c[0], RING.c[1] + 4, 4.8) },
  { from: 137, to: 160.1, view: jobView(MUSEUM) },
  { from: 161.5, to: 164.2, view: follow(GETAWAYS[3], 3.4) },
  { from: 166.4, to: 188.4, view: jobView(HALL) },
  { from: 222, to: 999, view: fixed(FINAL.cx, FINAL.cy, FINAL.s), steady: true },
]

/** 0–1 through a move of length T with `a` seconds of ease at each end and an even speed between. */
function steady(tau, T, a = 1.2) {
  const v = 1 / (T - a)
  if (tau <= 0) return 0
  if (tau >= T) return 1
  if (tau < a) return (v * tau * tau) / (2 * a)
  if (tau > T - a) return 1 - (v * (T - tau) ** 2) / (2 * a)
  return v * (tau - a / 2)
}

function camAt(time) {
  let i = SHOTS.findLastIndex((sh) => sh.from <= time)
  if (i < 0) i = 0
  const a = SHOTS[i]
  let v
  if (time <= a.to || i === SHOTS.length - 1) v = a.view(time)
  else {
    const b = SHOTS[i + 1]
    const T = b.from - a.to
    const u = b.steady ? steady(time - a.to, T) : easeInOut(clamp01((time - a.to) / T))
    const p = a.view(time)
    const q = b.view(time)
    v = { cx: lerp(p.cx, q.cx, u), cy: lerp(p.cy, q.cy, u), s: Math.exp(lerp(Math.log(p.s), Math.log(q.s), u)) }
  }
  return { ...v, X: (x) => CX + (x - v.cx) * v.s, Y: (y) => CY + (y - v.cy) * v.s }
}

/* ── The frame ────────────────────────────────────────────────────── */

/** The plate alone — what goes inside the sheet. */
export function cityPlate({ time, uid }, ink = INKS) {
  const cam = camAt(time)
  // Every pen scales down as the town comes in, so far out a plan is still a plan.
  const k = Math.max(0.28, Math.min(1, cam.s / 14))
  let plans = ''
  let reds = ''
  let tops = ''
  for (const job of JOBS) {
    const { x0, x1, y0, y1 } = job.reach
    if (cam.X(x1 + 10) < PX || cam.X(x0 - 10) > PR || cam.Y(y1 + 10) < PY || cam.Y(y0 - 10) > PB) continue
    const d = drawJob(job, cam, time, { k, ink, uid })
    plans += d.plan
    reds += d.red
    tops += d.top
  }
  // The getaways: one line a car, the whole crew in it.
  const gw = Math.max(3, Math.min(6, cam.s * 0.32))
  for (const g of GETAWAYS) {
    const w = g.walk(time)
    if (!w) continue
    reds += `<path d="${w.walked.map((p, i) => `${i ? 'L' : 'M'}${r(cam.X(p[0]))} ${r(cam.Y(p[1]))}`).join('')}" stroke="${ink.red}" stroke-width="${r(gw)}" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`
    const fade = 1 - clamp01((time - g.to) / 1.2)
    if (fade > 0) tops += `<circle cx="${r(cam.X(w.at[0]))}" cy="${r(cam.Y(w.at[1]))}" r="${r(Math.max(6, Math.min(11, cam.s * 0.5)))}" fill="${ink.red}"${op(fade)}/>`
  }
  const job = jobAt(time)
  const career = time >= CAREER
  const legendOn = career ? 0 : clamp01((cam.s - 9) / 3) * easeInOut(ramp(time, job.reveal[0] + 1, job.reveal[0] + 2.5))
  const swap = Math.min(1, ...JOBS.map((j) => Math.min(1, Math.abs(time - (j.reveal[0] - 1.5)) / 0.35)), Math.abs(time - CAREER) / 0.35)
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${ink.ground}"/>
${town(cam, uid, ink)}
${streetNames(cam, ink)}${siteLines(cam, time, ink)}
${plans}${reds}${tops}
${northPoint(ink)}${legend(job, ink, time, legendOn)}${titleBlock(job, ink, career, swap)}`
}

/** The last hit: the band stops dead at 230.5 and one hit on the downbeat at 232.1 rings out. */
const END_CARD = 232.1

/** The film: the opening, then the album's cover sheet, the plate, the lyric in the margin. */
export function conmanCityFrame({ time, score, lockup = '', uid = 'city' }) {
  if (time >= END_CARD) {
    return {
      lib: [townLib(uid)],
      label: 'End card',
      svg: `<rect width="1600" height="900" fill="${END_BLACK}"/><g transform="translate(800 450) scale(${r(500 / 918, 5)}) translate(-459 -309.5)" style="color:${END_INK}">${lockup}</g>`,
    }
  }
  const section = score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
  const clip = `${uid}-plate`
  return {
    lib: [townLib(uid)],
    label: time < CITY_OPENING.reveal[1] ? 'Opening' : `${section.label} · ${jobAt(time).name}`,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${cityPlate({ time, uid })}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${openingSvg(time, uid)}`,
  }
}

/** Seconds of silence an export holds on the end card after the record (mp4.mjs reads it). */
conmanCityFrame.hold = 4

/** For the page: when each job is drawn, and each getaway. */
export const CITY_JOBS = JOBS.map((j) => ({ no: j.no, name: j.name, year: j.year, reveal: j.reveal }))
export const CITY_GETAWAYS = GETAWAYS.map((g) => ({ from: g.from, to: g.to }))
