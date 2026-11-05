/*
 * The new job, on the west pier: three or four kinds of place, so the sixth
 * heist can be chosen (exploration, 2026-11-05). It sits in chorus 2
 * ("No matter what I do, I always sound the same"), ~124–139.5, between the
 * studio (1984) and the museum (1999): three crew.
 *
 * The site is the pier head off the west fluke: SITES[4], origin [30, 356],
 * a 40 × 30 plot on a deck (local −7…47 × −7…37) with river all round and
 * the pier road (the fluke itself, carried out over the water) arriving at
 * the deck's south edge near local x 26.
 */
import { wall, merge, box, P } from '../shop.mjs'
import { SITES } from '../city.mjs'

const O = SITES[4].o
const SHEET = (name) => [name, 'JOB No. 4 · 1971', 'SHEET 4/7']
const WORDS = 'I ALWAYS SOUND THE SAME'
const T0 = 124
const T1 = 139.5

/** A little boat in the water: a hull pointed at `deg`, length L, at local p. */
function boat(ctx, p, deg, L = 7, label) {
  const { A, s, r, txt, PAPER, INK } = ctx
  const u = P(1, deg)
  const n = [-u[1], u[0]]
  const at = (a, b) => A([p[0] + u[0] * a + n[0] * b, p[1] + u[1] * a + n[1] * b])
  const w = L * 0.19
  const pts = [at(L / 2, 0), at(L * 0.18, w), at(-L / 2, w * 0.8), at(-L / 2, -w * 0.8), at(L * 0.18, -w)]
  const [c0, c1] = [at(L * 0.18, w), at(L * 0.18, -w)]
  let out = `<path d="M${pts.map((q) => q.map((v) => r(v)).join(' ')).join('L')}Z" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>`
  out += `<path d="M${c0.map((v) => r(v)).join(' ')}Q${at(L * 0.42, 0).map((v) => r(v)).join(' ')} ${c1.map((v) => r(v)).join(' ')}" stroke="${INK}" stroke-width="0.8" fill="none"/>`
  if (label) {
    const [x, y] = at(0, 0)
    out += txt(x, y + s * w + 16, 10, label, { anchor: 'middle', spacing: 1.3, weight: 600, opacity: 0.8, halo: PAPER })
  }
  return out
}

/* ── A · The pressing plant ──────────────────────────────────────────── */

/** A lorry backed up to the dock: a box body and a cab, nose north, at local p (the tailgate south). */
function lorry(ctx, p) {
  const { A, r, PAPER, INK } = ctx
  const rect = (x0, y0, x1, y1) => {
    const [a, b] = [A([p[0] + x0, p[1] + y0]), A([p[0] + x1, p[1] + y1])]
    return `<rect x="${r(a[0])}" y="${r(a[1])}" width="${r(b[0] - a[0])}" height="${r(b[1] - a[1])}" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>`
  }
  return rect(-1.3, -2.4, 1.3, 5.6) + rect(-1.15, -4.6, 1.15, -2.6)
}

const pressing = {
  key: 'pressing', title: 'A · The pressing plant',
  about: 'Every copy of a record is pressed from a metal stamper, and the plant keeps the stampers of the town\'s best records in a vault. While the client keeps the foreman busy booking a test pressing, the plater takes a famous record\'s stampers, grows a copy from them in the baths and puts them back. The presser runs a thousand of the copy on the night shift and loads the cartons onto the lorry at the dock. Nothing is missing in the morning, and the record sounds the same.',
  sheet: SHEET('THE PRESSING PLANT'), words: WORDS,
  o: O, w: 40, h: 30, view: [20, 13.6, 14.4],
  foot: [box(0, 0, 40, 30)],
  walls: merge(
    wall('ext', [0, 0], [40, 0], [[31.5, 37.5, 0]]),
    wall('ext', [40, 0], [40, 30], [[23.5, 28.5, 'g']]),
    wall('ext', [0, 30], [40, 30], [[2, 12, 'g'], [15, 25, 'g'], [29.6, 33, 'g'], [34, 35.6, 1], [36.6, 39, 'g']]),
    wall('ext', [0, 0], [0, 30], [[20, 21.4, -1]]),
    wall('int', [8, 0], [8, 12], [[7.6, 9, 1]]),
    wall('int', [0, 12], [20, 12], [[2.6, 4, 1], [15.4, 16.8, 1]]),
    wall('heavy', [20, 0.3], [20, 12]),
    wall('heavy', [28, 0.3], [28, 12]),
    wall('heavy', [20, 12], [28, 12], [[3, 4.6, 1]]),
    wall('int', [28, 12], [28, 30], [[4, 6.2, -1], [13, 14.4, 1]]),
    wall('int', [28, 22], [40, 22], [[6, 7.4, 1]]),
  ),
  tone: [box(20, 0, 28, 12), box(0, 0, 8, 12)],
  items: [
    // Two rows of presses.
    ...[2.4, 8.4, 14.4, 20.4].flatMap((x) => [{ k: 'rect', x, y: 15, w: 3.2, h: 2.4 }, { k: 'rect', x, y: 24.4, w: 3.2, h: 2.4 }]),
    ...[2.4, 8.4, 14.4, 20.4].flatMap((x) => [{ k: 'ring', x: x + 1.6, y: 16.2, r: 0.75 }, { k: 'ring', x: x + 1.6, y: 25.6, r: 0.75 }]),
    // The plating baths, and the bench.
    { k: 'rect', x: 12, y: 0.9, w: 1.8, h: 3.2 }, { k: 'rect', x: 14.6, y: 0.9, w: 1.8, h: 3.2 }, { k: 'rect', x: 17.2, y: 0.9, w: 1.8, h: 3.2 },
    { k: 'rect', x: 8.6, y: 1, w: 1, h: 9.6 },
    // The boiler.
    { k: 'ring', x: 4, y: 4.2, r: 2.2 },
    // The stamper vault: racks, and the take.
    { k: 'bins', x: 20.8, y: 0.8, w: 6.4, h: 0.8 },
    { k: 'take', x: 21.4, y: 3.2, w: 2.6, h: 1.4, label: 'THE STAMPERS', side: 'above' },
    // Cartons, stacked.
    { k: 'bins', x: 35, y: 2.5, w: 1.1, h: 7 },
    { k: 'bins', x: 38.4, y: 2.5, w: 1.1, h: 17.5 },
    // The office.
    { k: 'rect', x: 30, y: 23.4, w: 4.6, h: 1.3 },
  ],
  rooms: [[13.2, 20.85, 'PRESS HALL'], [12.8, 10.6, 'PLATING'], [4, 9.4, 'BOILER'], [21.9, 10.5, 'VAULT', 0, 11], [35.8, 13, 'CARTONS'], [37.6, 28.4, 'OFFICE', 0, 11],
    [24, -3.6, 'LOADING DOCK'], [12, 34.4, 'FLUKE ROAD']],
  marks: [[-1.4, 7, 'BRICK · 1 ST.', -90], [41.4, 11, 'BRICK · 1 ST.', 90], [39.4, -10.6, 'THE LORRY', 0, 'right']],
  storeys: [[1.6, 28.2, '1']],
  dims: [],
  owners: [{ pts: [[36.4, 23.6], [38.6, 23.6]], period: 5 }],
  ownerLabel: 'The foreman',
  under: (ctx) => lorry(ctx, [34.6, -10.6]),
  crew: [
    { n: 1, role: 'The client', style: 'solid', from: T0, to: T1, pts: [
      [26, 40], [34.8, 33], [34.8, 30], [34.8, 28.2], [30.2, 27.2, 8, 'books a pressing'], [34.8, 28.2], [34.8, 30], [34.8, 33], [26, 40],
    ] },
    { n: 2, role: 'The plater', style: 'dash', from: T0 + 0.6, to: T1 - 1.6, pts: [
      [-5, 20.7], [0, 20.7], [1.6, 20.7], [1.6, 13.4], [23.8, 13.4], [23.8, 12], [23.8, 7.8], [22.6, 6.6, 1.6, 'takes the stampers'], [23.8, 7.8], [23.8, 13.4],
      [16.1, 13.4], [16.1, 12], [16.1, 8], [11.6, 7.4, 3.4, 'grows a copy'], [16.1, 8], [16.1, 12], [16.1, 13.4], [24.6, 13.4], [24.6, 12], [24.6, 7.8], [23.2, 5.6, 1.2],
      [24.6, 7.8], [24.6, 13.4], [1.1, 13.4], [1.1, 20], [0, 20], [-5, 20],
    ] },
    { n: 3, role: 'The presser', style: 'dot', from: T0 + 0.4, to: T1 - 0.4, pts: [
      [34.6, -9], [34.6, -3, 2.4], [33, 0], [32.4, 11], [31.4, 17.1], [28, 17.1], [24.6, 18], [19.6, 19.6, 4, 'runs the copies'], [24.6, 18], [28, 17.1],
      [31.4, 17.1], [32, 11, 1.4], [33.6, 0], [34.2, -3], [34.2, -8.4],
    ] },
  ],
}

/* ── B · The radio station on the point ──────────────────────────────── */

// The building lies along the pier (the fluke, carried on out over the water),
// pointed like it, with the mast at the point. a runs along the pier from the
// front door out to the point, b across it.
const B0 = [26, 37]
const DIR = (() => { const d = [126 - 64, 536 - 408]; const L = Math.hypot(...d); return [-d[0] / L, -d[1] / L] })()
const NRM = [-DIR[1], DIR[0]]
const R = (a, b) => [B0[0] + (a + 4) * DIR[0] + b * NRM[0], B0[1] + (a + 4) * DIR[1] + b * NRM[1]]
const AX = (Math.atan2(DIR[1], DIR[0]) * 180) / Math.PI // the pier's heading
const ACROSS = (Math.atan2(NRM[1], NRM[0]) * 180) / Math.PI
const rq = (a0, b0, a1, b1) => [R(a0, b0), R(a1, b0), R(a1, b1), R(a0, b1)]

const radio = {
  key: 'radio', title: 'B · The radio station on the point',
  about: 'The station is built along the pier like the fluke it stands on, pointed at the river, with its mast on the very end. On the late show the guest keeps the DJ talking on air while the producer swaps the reel in the control room: the next record the whole town hears is the sound stolen from the studio. Under the pier the boatman comes up through the library hatch and takes the station\'s live sessions, every one of them, the only copies.',
  sheet: SHEET('THE RADIO STATION'), words: WORDS,
  o: O, w: 40, h: 30, view: [16.4, 16.2, 14.2],
  foot: [[R(0, -7), R(36, -7), R(44, 0), R(36, 7), R(0, 7)]],
  walls: merge(
    wall('ext', R(0, -7), R(36, -7), [[9, 15, 'g'], [30, 31.4, -1]]),
    wall('ext', R(0, 7), R(36, 7), [[1.5, 4.5, 'g'], [8, 14, 'g']]),
    wall('ext', R(0, -7), R(0, 7), [[1, 4.6, 'g'], [6.2, 7.8, 1], [9.4, 13, 'g']]),
    wall('int', R(6, -7), R(6, 7), [[9.6, 11, 1]]),
    wall('int', R(6, 0), R(16, 0), [[2.2, 7, 'g'], [8.4, 9.8, -1]]),
    wall('int', R(16, -7), R(16, 7), [[10, 11.4, 1]]),
    wall('heavy', R(28, -7), R(28, 7), [[6.2, 7.8, 1]]),
    wall('ext', R(36, -7), R(36, 7), [[6.2, 7.8, 1]]),
  ),
  tone: [rq(28, -7, 36, 7)],
  items: [
    // The record library: shelves across the building.
    ...[17.4, 19.6, 21.8].map((a) => ({ k: 'rbin', c: R(a, -6.3), deg: ACROSS, r0: 0, r1: 8.2, t: 0.9 })),
    // The reel from the studio, on the control room's machine.
    { k: 'loot', x: R(13.6, 5.2)[0], y: R(13.6, 5.2)[1], r: 0.62 },
  ],
  rooms: [
    [...R(3.4, -3.6), 'LOBBY', ACROSS, 11], [...R(8.4, -4.4), 'ON AIR', ACROSS, 11], [...R(9.6, 6.1), 'CONTROL', AX + 180, 11],
    [...R(20.7, -2.6), 'LIBRARY', ACROSS, 10], [...R(31.8, 2.4), 'TRANSMITTER', ACROSS, 10.5],
  ],
  marks: [[...R(20, -9.2), 'BRICK · 1 ST. ON PILES', AX + 180], [...R(42.8, -4.8), 'MAST', ACROSS], [...R(-6.6, 6.6), 'THE PIER', AX + 180]],
  storeys: [[...R(2, 4.4), '1']],
  dims: [],
  owners: [{ pts: [R(11, -6.3), R(12.8, -6.3)], period: 6 }],
  ownerLabel: 'The DJ',
  under: (ctx) => {
    const { poly, A, r, PAPER, INK, uid, txt } = ctx
    let s = ''
    const box4 = (q, o = {}) => `<path d="${poly(q)}" fill="${o.fill ?? PAPER}" stroke="${o.stroke ?? INK}" stroke-width="${o.w ?? 1.1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`
    // On air: the desk and its microphones; control: the desk and the machines.
    s += box4(rq(10.2, -5.8, 13.6, -3.6))
    for (const [a, b] of [[11.2, -3.1], [12.8, -3.1]]) { const [x, y] = A(R(a, b)); s += `<circle cx="${r(x)}" cy="${r(y)}" r="3.4" fill="${PAPER}" stroke="${INK}"/>` }
    s += box4(rq(7.4, 1.2, 12, 2.8))
    s += box4(rq(12.6, 4.2, 15.2, 6.4))
    // The transmitter cabinets.
    s += box4(rq(29, -6.2, 34.6, -3.6))
    // The live sessions: a shelf of tapes, the take.
    const take = rq(25.6, -6.4, 26.6, -1.8)
    s += `<path d="${poly(take)}" fill="url(#${uid}-take)" stroke="${ctx.GREEN}" stroke-width="1.6"/>`
    // The hatch in the library floor.
    s += box4(rq(19, 3.4, 21, 5.6), { fill: 'none', dash: '3 3' })
    // The mast yard: a fence round the point, the mast and its stays.
    const yard = [R(36, -7), R(44, 0), R(36, 7)]
    s += `<path d="M${yard.map((p) => A(p).map((v) => r(v)).join(' ')).join('L')}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-dasharray="6 3"/>`
    const m = A(R(40.4, 0))
    for (const p of [R(36.6, -5.6), R(36.6, 5.6), R(43.2, 0)]) { const q = A(p); s += `<line x1="${r(m[0])}" y1="${r(m[1])}" x2="${r(q[0])}" y2="${r(q[1])}" stroke="${INK}" stroke-width="0.8" stroke-dasharray="1 3"/>` }
    s += `<rect x="${r(m[0] - 7)}" y="${r(m[1] - 7)}" width="14" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/><path d="M${r(m[0] - 7)} ${r(m[1] - 7)}l14 14M${r(m[0] + 7)} ${r(m[1] - 7)}l-14 14" stroke="${INK}" stroke-width="0.9"/>`
    s += boat(ctx, R(20, -15.6), AX + 90, 7)
    const [hx, hy] = A(R(17.7, 4.5))
    s += txt(hx, hy, 9.5, 'HATCH', { anchor: 'middle', weight: 700, spacing: 1.2, rot: ACROSS, halo: PAPER })
    const [tx, ty] = A(R(24.5, -3.3))
    s += txt(tx, ty + 3, 8.5, 'THE SESSIONS', { anchor: 'middle', weight: 600, spacing: 1.6, rot: ACROSS, fill: ctx.GREEN, halo: PAPER })
    return s
  },
  crew: [
    { n: 1, role: 'The guest', style: 'solid', from: T0, to: T1, pts: [
      R(-7, 0), R(-1, 0), R(2.4, 0), R(4.6, 3.3), R(8, 3.3), R(15.1, 1.2), R(15.1, -1.2), [...R(11.9, -1.9), 7, 'on air'],
      R(15.1, -1.2), R(15.1, 1.2), R(8, 3.3), R(4.6, 3.3), R(2.4, 0), R(-1, 0), R(-7, 0),
    ] },
    { n: 2, role: 'The producer', style: 'dash', from: T0 + 0.8, to: T1 - 1, pts: [
      R(-7, 0.9), R(-1, 0.9), R(3, 1.2), R(4.6, 4.2), R(8.6, 4.2), [...R(13, 3.6), 4.2, 'swaps the reel'], R(8.6, 4.2), R(4.6, 4.2), R(3, 1.2), R(-1, 0.9), R(-7, 0.9),
    ] },
    { n: 3, role: 'The boatman', style: 'dot', from: T0 + 1.6, to: T1 - 0.6, pts: [
      R(20, -14.2), [...R(20, 4.5), 1.4, 'up through the hatch', 'jump'], R(23.4, 3), [...R(25.2, 0.4), 3.6, 'takes the sessions'], R(23.4, 3), R(20, 4.5),
      [...R(20, -14.2), 0, null, 'jump'],
    ] },
  ],
}

/* ── C · The auction house ───────────────────────────────────────────── */

const auction = {
  key: 'auction', title: 'C · The auction house',
  about: 'The dockside sale room, on the night of a famous sale. Lots come from the store through the porters\' passage to the rostrum. The bidder keeps the room bidding on lot 22, and the porter carries lot 23 from the store and swaps it for a copy that sounds the same. The boatman takes the original out of the quay door and away by water. The copy goes under the hammer and fetches a fortune.',
  sheet: SHEET('THE AUCTION HOUSE'), words: WORDS,
  o: O, w: 40, h: 30, view: [19, 14.6, 15],
  foot: [box(0, 0, 40, 30)],
  walls: merge(
    wall('ext', [0, 0], [40, 0], [[16, 24, 'g'], [28, 36, 'g']]),
    wall('ext', [40, 0], [40, 30], [[8, 16, 'g']]),
    wall('ext', [0, 30], [40, 30], [[14, 21, 'g'], [24.6, 27.4, 1], [30, 37, 'g']]),
    wall('ext', [0, 0], [0, 30], [[21.4, 24.6, 0]]),
    wall('int', [12, 0], [12, 30], [[7.4, 8.8, 1], [22.2, 23.6, -1]]),
    wall('int', [0, 18], [12, 18], [[5, 6.4, 1]]),
    wall('int', [12, 6], [40, 6], [[2, 3.4, 1], [26, 27.4, -1]]),
    wall('int', [26, 0], [26, 6]),
    wall('int', [12, 24.4], [22, 24.4]),
    wall('int', [30, 24.4], [40, 24.4]),
  ),
  tone: [box(0, 0, 12, 18), box(12, 0, 26, 6)],
  items: [
    // The rostrum, the lot table, the clerk.
    { k: 'rect', x: 24.4, y: 7, w: 3.2, h: 1.4, label: 'ROSTRUM', side: 'right' },
    { k: 'rect', x: 13.6, y: 6.6, w: 4, h: 0.9 },
    { k: 'rect', x: 33.4, y: 7, w: 5, h: 1.1 },
    // Rows of chairs facing the rostrum.
    ...[11, 13.6, 16.2, 18.8, 21.4].flatMap((y) => [{ k: 'bins', x: 14.4, y, w: 9.8, h: 0.9 }, { k: 'bins', x: 27.6, y, w: 10, h: 0.9 }]),
    // The lot store: racks, and the take.
    { k: 'bins', x: 0.6, y: 0.6, w: 10.8, h: 1 },
    { k: 'bins', x: 0.6, y: 3.6, w: 1, h: 10.4 },
    { k: 'bins', x: 4.4, y: 4.6, w: 1, h: 8.4 },
    { k: 'take', x: 7.4, y: 4.2, w: 2.4, h: 1.6, label: 'LOT 23', side: 'above' },
    // The copy, waiting in the porters' room.
    { k: 'rect', x: 3, y: 26.4, w: 2.4, h: 1.6 },
    { k: 'rect', x: 27, y: 26.2, w: 2.2, h: 2.2 },
  ],
  rooms: [[3, 9.4, 'LOT STORE', -90], [8.8, 28.6, 'PORTERS', 0, 11], [19.6, 3.6, 'PASSAGE'], [33, 3.4, 'OFFICE'], [33, 23.3, 'SALE ROOM'], [17, 27.6, 'FOYER', 0, 11], [35, 27.6, 'CLOAKS', 0, 11],
    [-3.8, 12, 'THE QUAY', 90]],
  marks: [[41.4, 21, 'STONE · 2 ST.', 90]],
  storeys: [[38.2, 1.6, '2']],
  dims: [{ a: [0, -2.2], b: [40, -2.2] }],
  owners: [{ pts: [[26, 9.2], [26.6, 9.2]], period: 4 }],
  ownerLabel: 'The auctioneer',
  under: (ctx) => boat(ctx, [-10.6, 31], 90, 7.4),
  crew: [
    { n: 1, role: 'The bidder', style: 'solid', from: T0, to: T1, pts: [
      [26, 40], [26, 33], [26, 30], [26, 26.6], [26.2, 24.4], [25.8, 22.6], [25.8, 20.4, 9.6, 'bids on lot 22'], [25.8, 22.6], [26.2, 24.4], [26, 26.6], [26, 30], [26, 40],
    ] },
    { n: 2, role: 'The porter', style: 'dash', from: T0 + 0.6, to: T1 - 1, pts: [
      [1.6, 28], [4.2, 25.6, 1.4, 'takes the copy'], [6, 20], [6, 18], [6.6, 14], [6.2, 7, 2.4, 'swaps them'], [6.6, 14], [6, 17.2, 1],
      [6.6, 14], [10, 8.1], [12, 8.1], [13, 9.4], [14.6, 9.6, 3.6, 'puts the copy up'],
    ] },
    { n: 3, role: 'The boatman', style: 'dot', from: T0 + 2.2, to: T1 - 0.4, pts: [
      [-10.6, 28], [-10.6, 23.6], [0, 23.6], [3.4, 21.4], [4.6, 20, 3.4, 'takes the original'], [3.4, 21.4], [0, 24.2], [-10, 24.2], [-10, 28.6],
    ] },
  ],
}

export const VARIANTS = [pressing, radio, auction]
