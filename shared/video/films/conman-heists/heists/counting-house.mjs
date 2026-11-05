/*
 * Job 2, the counting house: four ways to plan it (exploration, 2026-11-05).
 * The royalty office, where the songs' money is counted and the ledgers say
 * whose they are. Two of the crew: one keeps the room busy, one cooks the
 * books. By the east circle, at the far end of Main Street from the shop.
 *
 * Job metres from each variant's origin `o`; see shop.mjs for the builders.
 */
import { BALLS, STOCK_Y } from '../city.mjs'
import { P, arcWall, box, merge, sector, wall } from '../shop.mjs'

const SHEET = ['THE COUNTING HOUSE', 'JOB No. 2 · 1969', 'SHEET 2/7']
const C1 = [55.8, 76]
const C2 = [58.5, 76.5]

/** Points along an arc at radius R from d0 to d1 degrees, so a route follows a curved room. */
const along = (R, d0, d1, step = 5) => {
  const n = Math.max(1, Math.ceil(Math.abs(d1 - d0) / step))
  return Array.from({ length: n + 1 }, (_, i) => P(R, d0 + ((d1 - d0) * i) / n))
}
const at = (R, d, hold, note) => (hold != null || note ? [...P(R, d), hold ?? 0, note] : P(R, d))

/* ── A · On the circle ────────────────────────────────────────────────── */
/*
 * The shop's answer across town: the same curved front, mirrored onto the
 * east circle, north of Main Street. Bigger, and in stone: a banking hall
 * behind plate glass, a curved tellers' counter, and behind it the ledger
 * room, the vault and the partner's office in a ring.
 */
const circle = (() => {
  const A0 = -156
  const A1 = -114
  const R0 = 38
  const R1 = 55
  const RI = 48
  const RS = 46.3
  return {
    key: 'circle', title: 'A · On the circle',
    about: 'The shop\'s answer across town. The counting house curves round the east circle as the record shop curves round the west, but in stone, with a banking hall behind plate glass and a curved tellers\' counter. The customer opens an account at the far window while the auditor, let through the counter gate as a matter of course, cooks the books in the ledger room, empties the vault and leaves by the staff door onto Main Street.',
    sheet: SHEET, words: "I'VE MADE A KILLING OFF OF MOVING FAST AND COOKING BOOKS",
    o: BALLS[1], view: [-31.5, -27.5, 15],
    foot: [sector(R0 - 0.4, R1 + 0.4, A0 - 0.4, A1 + 0.4)],
    walls: merge(
      arcWall('ext', R0, A0, A1, [[-155, -142.4, 'g'], [-140.8, -137.6, 1], [-137.6, -134.4, -1], [-132.8, -115, 'g']]),
      arcWall('ext', R1, A0, A1),
      wall('ext', P(R0, A0), P(R1, A0), [[7, 8.3, 1]]),
      wall('ext', P(R0, A1), P(R1, A1)),
      arcWall('int', RI, A0, -145, [[-152.4, -149.6, 1]]),
      arcWall('heavy', RI + 0.2, -145, -131, [[-140.6, -137.6, 0]]),
      arcWall('int', RI, -131, A1, [[-124.6, -121.8, -1]]),
      wall('heavy', P(RI, -145), P(R1, -145)),
      wall('heavy', P(RI, -131), P(R1, -131)),
    ),
    tone: [sector(RI, R1, A0, A1)],
    items: [
      { k: 'arcbar', R: 44.2, d0: -153, d1: -128.4, t: 0.7, label: 'TELLERS' },
      { k: 'arcbar', R: 44.2, d0: -125.6, d1: -116, t: 0.7 },
      ...[-148, -141, -134, -121].map((d) => ({ k: 'rbin', deg: d, r0: 44.6, r1: 45.8, t: 0.18 })),
      { k: 'rbin', deg: -117.6, r0: 39.4, r1: 41, t: 0.6 },
      { k: 'take', x: P(53.3, -148.6)[0] - 1, y: P(53.3, -148.6)[1] - 0.6, w: 2, h: 1.2, label: 'THE BOOKS', side: 'below' },
      { k: 'take', x: P(53.2, -136)[0] - 1.6, y: P(53.2, -136)[1] - 1, w: 3.2, h: 2, label: 'THE VAULT', side: 'below' },
      { k: 'rect', x: P(51.8, -121)[0] - 1.4, y: P(51.8, -121)[1] - 0.7, w: 2.8, h: 1.4 },
      { k: 'cam', x: P(38.9, -114.9)[0], y: P(38.9, -114.9)[1], dir: -150, reach: 7 },
    ],
    rooms: [[...P(41.1, -148.5), 'BANKING HALL', -58.5], [...P(51.6, -126.4), "PARTNER'S", -36.4, 11],
      [...P(30.5, -135), 'EAST CIRCLE', -45], [-52, -5, 'MAIN STREET']],
    marks: [[...P(56.6, -135), 'STONE · 2 ST.', -45], [...P(36.6, -149), 'PLATE GLASS', -59], [...P(36.6, -121), 'PLATE GLASS', -31]],
    storeys: [[...P(54, -111.4), '2']],
    dims: [],
    owners: [
      { pts: along(40.4, -133, -118, 4), period: 16 },
      { pts: along(46.9, -146, -132, 4), period: 9 },
    ],
    ownerLabel: 'The guard and the teller',
    crew: [
      { n: 1, role: 'The customer', style: 'solid', from: C1[0], to: C1[1], pts: [
        P(33, -137.2), P(R0, -137.2), P(41.2, -131), at(43.2, -121.6, 11, 'opens an account'), P(41.2, -131), P(R0, -137.6), P(33, -137.6),
      ] },
      { n: 2, role: 'The auditor', style: 'dash', from: C2[0], to: C2[1], pts: [
        P(33, -138.4), P(R0, -138.4), P(41, -131.4), P(42.8, -127.2), P(RS, -127.2), ...along(RS, -127.2, -151, 5).slice(1),
        P(49.6, -151), at(51.2, -153.8, 4.5, 'cooks the books'), P(49.6, -151), P(RS, -151), ...along(RS, -151, -139.1, 5).slice(1),
        P(49.8, -139.1), at(51.4, -143, 3, 'empties the vault'), P(49.8, -139.1), P(RS, -139.1), ...along(RS, -139.1, -154, 5).slice(1),
        P(45.6, -156), P(45.6, -160.5), [P(45.6, -160.5)[0], -4],
      ] },
    ],
  }
})()

/* ── B · The banking hall ─────────────────────────────────────────────── */
/*
 * The film's plan, redrawn in the atlas: a square banking hall on Main
 * Street a block short of the circle, tellers across it, the books and the
 * vault at the back.
 */
const hall = {
  key: 'hall', title: 'B · The banking hall',
  about: 'The plan as it is in the film, redrawn in the atlas. A square banking hall on Main Street, a block short of the circle, with the tellers across it and the office, the staff room and the vault at the back. The customer opens an account to hold the tellers\' eyes while the auditor walks round behind the counter, cooks the books in the office, empties the vault and leaves by the back door into the yard.',
  sheet: SHEET, words: "DON'T BE FOOLED BY THE WAY I LOOK",
  o: [560, 284], view: [17, 14.2, 21],
  foot: [box(0, 0, 34, 26)],
  walls: merge(
    wall('ext', [0, 0], [34, 0], [[15, 16.6, 1]]),
    wall('ext', [34, 0], [34, 26], [[13, 22, 'g']]),
    wall('ext', [0, 26], [34, 26], [[3, 11, 'g'], [15, 17, 1], [17, 19, -1], [23, 31, 'g']]),
    wall('ext', [0, 0], [0, 26], [[13, 22, 'g']]),
    wall('int', [0, 8], [34, 8], [[6, 7.4, 1], [26, 27.4, 1]]),
    wall('int', [12, 0], [12, 8]),
    wall('int', [20, 0], [20, 8], [[3, 4.4, 1]]),
    wall('heavy', [24, 1], [33, 1]),
    wall('heavy', [24, 6], [33, 6], [[3.6, 6, 0]]),
    wall('heavy', [24, 1], [24, 6]),
    wall('heavy', [33, 1], [33, 6]),
  ),
  tone: [box(0, 0, 34, 8)],
  items: [
    { k: 'rect', x: 3, y: 12, w: 24, h: 0.8, label: 'TELLERS', side: 'above' },
    { k: 'take', x: 1.6, y: 1.4, w: 4.2, h: 2, label: 'THE BOOKS', side: 'right' },
    { k: 'take', x: 25, y: 1.6, w: 7.4, h: 1.6, label: 'THE VAULT', side: 'below' },
    { k: 'rect', x: 6, y: 18.5, w: 6, h: 0.6 }, { k: 'rect', x: 22, y: 18.5, w: 6, h: 0.6 },
    { k: 'rect', x: 12.6, y: 1.2, w: 2.4, h: 1.4 },
    { k: 'cam', x: 1, y: 9, dir: 40 }, { k: 'cam', x: 33, y: 25, dir: -140 },
  ],
  rooms: [[8.4, 23.4, 'BANKING HALL'], [7, 6.6, 'OFFICE'], [16, 6.4, 'STAFF'], [8, 30.4, 'MAIN STREET'], [8, -2.4, 'YARD']],
  marks: [[-1.4, 5, 'BRICK · 2 ST.', -90], [7, 27.4, 'PLATE GLASS'], [27, 27.4, 'PLATE GLASS']],
  storeys: [[32.4, 10.4, '2']],
  dims: [{ a: [36.4, 0], b: [36.4, 26], text: '26.00 m' }],
  owners: [{ pts: [[22, 21], [31, 15.4], [8, 15.4], [8, 21]], period: 15 }],
  ownerLabel: 'The guard',
  crew: [
    { n: 1, role: 'The customer', style: 'solid', from: C1[0], to: C1[1], pts: [
      [16.4, 30], [16.4, 26], [16.4, 20], [10, 14, 10, 'opens an account'], [16.4, 20], [16.6, 26], [16.6, 30],
    ] },
    { n: 2, role: 'The auditor', style: 'dash', from: C2[0], to: C2[1], pts: [
      [17.6, 30], [17.6, 26], [26, 18], [29, 14], [29, 10.2], [6.7, 10.2], [6.7, 8], [6.7, 6.2], [4.4, 5.8, 4, 'cooks the books'],
      [6.7, 6.2], [6.7, 9.6], [26.7, 9.6], [26.7, 7.4], [28.8, 7.4], [28.8, 5.4, 3, 'empties the vault'], [28.8, 7.4], [22, 7.4],
      [22, 3.7], [15.8, 3.7], [15.8, 0], [15.8, -2],
    ] },
  ],
}

/* ── C · The counting floor ───────────────────────────────────────────── */
/*
 * A royalty office as a factory for sums: one long floor of clerks' desks,
 * the ledger room at the back, and a pneumatic tube along the ceiling to the
 * post room, which opens onto the back lane.
 */
const DESK_ROWS = [11.4, 14.8, 18.2, 21.6, 25]
const desks = DESK_ROWS.flatMap((y) => [4, 8.4, 12.8, 17.2, 26.6, 31, 35.4, 39.8].map((x) => ({ k: 'rect', x, y, w: 3.2, h: 1.1 })))
const TUBE = [[27.4, 9.6], [27.4, 9.1], [10.8, 9.1], [10.8, 5.4], [5.6, 5.4]]
const floor = {
  key: 'floor', title: 'C · The counting floor',
  about: 'A royalty office run like a mill: one long floor of clerks at desks, the ledgers locked in a room at the back, and a pneumatic tube along the ceiling to the post room. The auditor signs in, works down the floor, takes the true ledgers and sends them into the tube. The messenger, waiting in the post room with the afternoon\'s parcels, catches them and is gone up the back lane before the auditor has signed out of the front.',
  sheet: SHEET, words: "I'VE MADE A KILLING OFF OF MOVING FAST AND COOKING BOOKS",
  o: [546, 270], view: [23, 16, 16.4],
  foot: [box(0, 0, 46, 36)],
  walls: merge(
    wall('ext', [0, 0], [46, 0], [[4, 5.4, -1], [14, 24, 'g'], [30, 42, 'g']]),
    wall('ext', [46, 0], [46, 36], [[11, 27, 'g']]),
    wall('ext', [0, 36], [46, 36], [[2, 16, 'g'], [21, 23, 1], [23, 25, -1], [30, 44, 'g']]),
    wall('ext', [0, 0], [0, 36], [[11, 27, 'g']]),
    wall('int', [0, 8], [46, 8], [[8.8, 10.2, -1], [22, 23.4, 1], [36, 37.4, 1]]),
    wall('int', [12, 0], [12, 8]),
    wall('heavy', [12.2, 0.2], [12.2, 7.8]), wall('heavy', [26, 0.2], [26, 7.8]),
    wall('int', [0, 30], [12, 30]), wall('int', [34, 30], [46, 30]),
  ),
  tone: [box(0, 0, 46, 8), box(0, 30, 46, 36)],
  items: [
    ...desks,
    { k: 'rect', x: 12, y: 29.6, w: 20, h: 0.8 },
    { k: 'rect', x: 0.4, y: 9, w: 0.6, h: 20 }, { k: 'rect', x: 45, y: 9, w: 0.6, h: 20 },
    { k: 'take', x: 13.4, y: 0.5, w: 11.2, h: 1.1, label: 'THE LEDGERS', side: 'below' },
    { k: 'rect', x: 1, y: 0.6, w: 4, h: 2.2 }, { k: 'rect', x: 1, y: 5.2, w: 3, h: 1.6 },
    { k: 'rect', x: 40, y: 2.6, w: 4, h: 2 },
    { k: 'rect', x: 26.8, y: 9.1, w: 1.2, h: 1.0 },
  ],
  under: ({ A, r, INK, txt, PAPER }) => {
    // The tube, overhead: a pair of fine lines, dash-dotted, as anything above the cut.
    const d = TUBE.map((p, i) => `${i ? 'L' : 'M'}${A(p).map((v) => r(v)).join(' ')}`).join('')
    const [lx, ly] = A([1, 9.9])
    return `<path d="${d}" stroke="${INK}" stroke-width="5" fill="none" stroke-linejoin="round" opacity="0.85"/><path d="${d}" stroke="${PAPER}" stroke-width="2.6" fill="none" stroke-linejoin="round"/><path d="${d}" stroke="${INK}" stroke-width="0.8" fill="none" stroke-dasharray="10 3 2 3"/>`
      + txt(lx, ly + 3.5, 10, 'TUBE, ABOVE', { spacing: 1.4, weight: 600, opacity: 0.85, halo: PAPER })
  },
  rooms: [[8, 33.4, 'ENQUIRIES'], [8.8, 2.2, 'POST'], [36, 6.4, "PARTNERS'"], [22.5, 19.4, 'COUNTING FLOOR', -90], [34, 38.8, 'MAIN STREET'], [14, -3.2, 'BACK LANE']],
  marks: [[-1.4, 18, 'BRICK · 3 ST.', -90], [9, 37.4, 'PLATE GLASS'], [37, 37.4, 'PLATE GLASS']],
  storeys: [[44.2, 34.4, '3']],
  dims: [{ a: [0, 42], b: [46, 42], text: '46.00 m' }],
  owners: [
    { pts: [[21.3, 10.6], [21.3, 28]], period: 13 },
    { pts: [[2.6, 12], [2.6, 27]], period: 11 },
    { pts: [[43.4, 27], [43.4, 12]], period: 9 },
  ],
  ownerLabel: 'The clerks',
  crew: [
    { n: 1, role: 'The messenger', style: 'solid', from: C1[0], to: C1[1], pts: [
      [4.7, -5.4], [4.7, -1], [4.7, 1.4], [3.6, 4.6, 12.5, 'catches them'], [4.7, 1.4], [4.7, -1], [4.7, -4.4], [10, -4.4],
    ] },
    { n: 2, role: 'The auditor', style: 'dash', from: C2[0], to: C2[1], pts: [
      [22.8, 40], [22.8, 36], [22.8, 32, 2, 'signs in'], [33, 32], [33, 28.6], [24.2, 28.6], [24.2, 10.6], [22.7, 10.6], [22.7, 7.6],
      [15.8, 5.4, 4, 'cooks the books'], [16.4, 6.2], [22.2, 7.9], [22.2, 10.1], [26.4, 10.1, 2, 'into the tube'], [24.8, 10.6], [24.8, 28.2], [33.4, 28.2],
      [33.4, 32.4], [23.2, 32.4], [23.2, 36], [23.2, 40],
    ] },
  ],
}

/* ── D · Through the floor ────────────────────────────────────────────── */
/*
 * The counting house and the empty shop next door. Below the partner's
 * office is the strongroom; below the shop, a cellar; between them, one
 * party wall. What is below the floor is drawn long-dashed.
 */
const below = {
  key: 'below', title: 'D · Through the floor',
  about: 'The ledgers are not upstairs at all. They are in the strongroom under the partner\'s office, and the shop next door has stood empty since the spring. The tenant takes the shop, goes down to its cellar and through the party wall into the strongroom, while the auditor sits upstairs with the partner, going over the books aloud, directly above the digging.',
  sheet: SHEET, words: 'UNTIL THE EARTH SHOOK IN 2025',
  o: [552, 280], view: [19.4, 13.2, 21.5],
  foot: [box(0, 0, 38, 24)],
  walls: merge(
    wall('ext', [0, 0], [38, 0]),
    wall('ext', [38, 0], [38, 24]),
    wall('ext', [0, 24], [38, 24], [[1, 4, 'g'], [4.6, 6, 1], [6.6, 9, 'g'], [12, 22, 'g'], [25, 27.4, 1], [29, 36, 'g']]),
    wall('ext', [0, 0], [0, 24]),
    wall('heavy', [10, 0], [10, 24]),
    wall('int', [0, 10], [10, 10], [[3, 4.4, 0]]),
    wall('int', [10, 9], [38, 9], [[10.6, 12, -1], [20, 21.4, 1]]),
    wall('int', [24, 0], [24, 9]),
  ),
  tone: [box(10, 0, 38, 9)],
  items: [
    { k: 'zone', style: 'under', x: 0.6, y: 0.6, w: 8.8, h: 8.8, label: 'CELLAR' },
    { k: 'zone', style: 'under', x: 10.6, y: 0.8, w: 12.8, h: 7.6, label: 'STRONGROOM, BELOW' },
    { k: 'zone', style: 'under', x: 8.4, y: 5.2, w: 3.2, h: 2 },
    { k: 'take', x: 19.4, y: 4.2, w: 3.4, h: 1, label: 'THE LEDGERS', side: 'below' },
    { k: 'stairs', x: 5.8, y: 1.6, w: 2, h: 4.6, label: 'DN', dir: 'down' },
    { k: 'rect', x: 22, y: 12.4, w: 14, h: 0.8, label: 'TELLERS', side: 'below' },
    { k: 'rect', x: 26, y: 1, w: 3.6, h: 1.4 }, { k: 'rect', x: 32, y: 1, w: 3.6, h: 1.4 }, { k: 'rect', x: 26, y: 5.6, w: 3.6, h: 1.4 }, { k: 'rect', x: 32, y: 5.6, w: 3.6, h: 1.4 },
    { k: 'cam', x: 11, y: 23, dir: -40 },
  ],
  rooms: [[22, 19.4, 'BANKING HALL'], [31, 4.4, 'CLERKS'], [2.4, 17, 'TO LET', -90, 15], [19, 27.6, 'MAIN STREET']],
  marks: [[10, -1.6, 'PARTY WALL'], [39.4, 12, 'STONE · 2 ST.', 90]],
  storeys: [[36.4, 22.2, '2']],
  dims: [],
  owners: [{ pts: [[23.3, 6.4], [23.3, 8.3]], period: 10 }, { pts: [[14.6, 15], [14.6, 21.4]], period: 8 }],
  ownerLabel: 'The partner and the guard',
  crew: [
    { n: 1, role: 'The tenant', style: 'solid', from: C1[0], to: C1[1], pts: [
      [5.3, 28], [5.3, 24], [5.3, 12], [3.7, 11], [3.7, 9], [6.8, 7.4], [6.8, 2.6, 1.5], [8.4, 6.2],
      [11.2, 6.2, 2, 'through the party wall'], [11.6, 3.7], [17.8, 3.6, 3, 'fills a case'], [11.8, 3.9], [11.4, 6.4], [8.4, 6.2],
      [6.8, 2.6], [6.8, 7.4], [3.7, 9], [3.7, 11], [5.3, 12], [5.3, 24], [5.3, 28],
    ] },
    { n: 2, role: 'The auditor', style: 'dash', from: C2[0], to: C2[1], pts: [
      [26.2, 28], [26.2, 24], [26.2, 16], [20.8, 14.6], [20.8, 10.4], [21.3, 9.6], [21.3, 8.2], [12.6, 8, 11, 'reads the books aloud'],
      [21.3, 8.2], [21.3, 9.6], [20.8, 10.4], [20.8, 14.6], [26.6, 16.4], [26.6, 24], [26.6, 28],
    ] },
  ],
}

export const VARIANTS = [circle, hall, floor, below]
void STOCK_Y
