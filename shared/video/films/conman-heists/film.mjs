/*
 * Conman, the whole film (exploration, 2026-11-05): everything decided so far,
 * end to end, as one function of the song clock.
 *
 *   0–12        the shared opening (mark, title, the black lifts)
 *   12–42.3     heist 1, the record shop (D · Around the circle)            1968
 *   42.3–77     the drive over the bridge and heist 2 (B), from "Oh, I'm a
 *               conman" (55.75): the counting house, through the floor      1969
 *   77–99.95    police chase 1, the first chorus (A · From above); they slip
 *               out of the park behind the officer and are at the studio's
 *               door by 98.4
 *   99.95–122   heist 3, the studio: the conman and the auditor are the
 *               shadow and the taker, the engineer joins, "you" in ink      1970
 *   122–140.2   chase 2, the second chorus: out of the studio's back lane,
 *               round the whole Crescent, up the west fluke road into the
 *               pressing plant to hide; the officer circles it and gives up;
 *               out north, along Main Street, up High Street to the museum,
 *               where they stand from 139.2
 *   140.2–158.4 heist 4, the drum museum, the break: the police almost catch
 *               them (one in at the front as they leave by the bay, a car
 *               round the Circus as the getaway pulls away)                 1973
 *   158.4–164.5 the getaway down High Street to the crown, the car lost
 *   164–188     heist 5, the fan hall at the crown, five crew; the hall is
 *               drawn as the camera lands and they go in on the verse       1975
 *   188–232.1   the final chase: the five scatter down the anchor's strokes,
 *               the police falling behind, the camera pulls out to the whole
 *               town and their red becomes the anchor; they are gone into it
 *   232.1       the end card on the last hit
 *
 * Timing rule (the user, 2026-11-06): the start of every heist — the plan
 * whole and the crew standing outside — lands a second or so before the verse,
 * and they go in as the singing starts (heist 4, in the break, goes on the
 * break's downbeat). The dots are controlled: they only run from the police
 * or in long transit, and always ease to a stop at a door.
 *
 * Earlier jobs stay in the town as finished sheets with their routes. A chase
 * through the grid fades once it is over; the police's trails fade as each
 * chase ends; the getaways that run on the anchor's own strokes stay red.
 */
import { COVER_SHEET, INK, PAPER, RED, markDrawnAt, MARK_DRAW } from '../../album.mjs'
import { drawLines } from '../../hairline-draw.mjs'
import { TITLES } from '../../titles.mjs'
import { END_BLACK, END_INK } from '../../ending.mjs'
import { DASH, CAMS } from './styles.mjs'
import { RING, BALLS, BALL_R, STOCK_Y, SHANK_X, ARMS, FLUKES, arcPts } from './city.mjs'
import { motionOrbit, plan, drawn, ownerSvg, crewSvg, sheet, zoom, camOf, ease, ramp, lerp, r, timing } from './motion.mjs'
import { seqBridge, travel, inked } from './sequence.mjs'
import { chaseAbove, ROUTE1, ROUTE2, COP, STUDIO_VIEW, WAIT3 } from './chase1.mjs'
import { overlay, KEY2, timed } from './job2.mjs'
import { wall, merge, box } from './shop.mjs'
import { VARIANTS as STUDIOS } from './heists/studio.mjs'
import { VARIANTS as MUSEUMS } from './heists/museum.mjs'
import { VARIANTS as HALLS } from './heists/concert-hall.mjs'

const END_CARD = 232.1
const OPENING = { mark: 0.5, markOut: [5.0, 5.7], title: [6.2, 8.9], reveal: [10.6, 12.0] }
const T3 = 99.95
const C2 = [121.95, 140.2]
const T4 = [140.2, 158.4]
const T5 = [164.0, 187.8]
const FINAL = [188.2, 223.5]
/** The museum job and the police's near-miss, written for 140.4–160, play this much earlier so the hall is ready for the verse. */
const EARLY4 = 1.6

/* ── Drawing people and trails in town metres ────────────────────────── */

const P = (deg) => (deg * Math.PI) / 180
const pl = (c, pts) => `M${pts.map(([x, y]) => `${r(c.X(x))} ${r(c.Y(y))}`).join('L')}`
/** A red trail; a step into a 'jump' point (through a building, a back way) is drawn thin and dotted. */
const redTrail = (c, pts, style, op = 1) => {
  if (!pts || pts.length < 2) return ''
  let solid = ''
  let through = ''
  for (let i = 1; i < pts.length; i++) {
    const seg = `M${r(c.X(pts[i - 1][0]))} ${r(c.Y(pts[i - 1][1]))}L${r(c.X(pts[i][0]))} ${r(c.Y(pts[i][1]))}`
    if (pts[i][4] === 'jump') through += seg
    else solid += seg
  }
  const o = op < 1 ? ` opacity="${r(op, 3)}"` : ''
  return (solid ? `<path d="${solid}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" fill="none"${DASH[style] ? ` stroke-dasharray="${DASH[style]}"` : ''}${o}/>` : '')
    + (through ? `<path d="${through}" stroke="${RED}" stroke-width="1.8" stroke-dasharray="2 5" stroke-linecap="round" fill="none"${o}/>` : '')
}
const head = (c, p, n, op = 1) => `<g${op < 1 ? ` opacity="${r(op, 3)}"` : ''}><circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="10.5" fill="${RED}"/><text x="${r(c.X(p[0]))}" y="${r(c.Y(p[1]) + 4.6)}" font-size="13" font-weight="700" fill="${PAPER}" text-anchor="middle">${n}</text></g>`
const hiding = (c, p) => `<circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="7" fill="none" stroke="${RED}" stroke-width="1.6" stroke-dasharray="2 3"/>`
const noHeads = (svg) => svg.replace(new RegExp(`<circle[^>]*r="10.5" fill="${RED}"/><text[^>]*>\\d</text>`, 'g'), '')
const noHead = (svg, n) => svg.replace(new RegExp(`<circle[^>]*r="10.5" fill="${RED}"/><text[^>]*>${n}</text>`, 'g'), '')

/** A ring round a head: caught. */
const caughtRing = (c, p) => `<circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="16" fill="none" stroke="${INK}" stroke-width="2.2" stroke-dasharray="3 3"/>`
/** An officer: dashed ink trail, a ringed P, his line of sight a dotted fan (`reach` in metres overrides the town-scale one). */
function cop(c, route, t, { look, trailOp = 0.8, show = true, reach: reachM } = {}) {
  const w = route.walked(t)
  if (!w) return ''
  let s = trailOp > 0.01 ? `<path d="${pl(c, w)}" stroke="${INK}" stroke-width="1.8" stroke-dasharray="7 5" stroke-linecap="round" fill="none" opacity="${r(trailOp, 3)}"/>` : ''
  if (!show) return s
  const p = w.at(-1)
  const [x, y] = [c.X(p[0]), c.Y(p[1])]
  const d = look ?? heading(route, t)
  const reach = reachM != null ? Math.max(40, reachM * c.s) : Math.max(70, 50 * c.s)
  const q1 = [x + reach * Math.cos(P(d - 24)), y + reach * Math.sin(P(d - 24))]
  const q2 = [x + reach * Math.cos(P(d + 24)), y + reach * Math.sin(P(d + 24))]
  s += `<path d="M${r(x)} ${r(y)}L${r(q1[0])} ${r(q1[1])}A${r(reach)} ${r(reach)} 0 0 1 ${r(q2[0])} ${r(q2[1])}Z" fill="${INK}" fill-opacity="0.07" stroke="${INK}" stroke-width="0.9" stroke-dasharray="1 4" stroke-linecap="round"/>`
  s += `<circle cx="${r(x)}" cy="${r(y)}" r="10" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><text x="${r(x)}" y="${r(y + 4.4)}" font-size="12" font-weight="700" fill="${INK}" text-anchor="middle">P</text>`
  return s
}
function heading(route, t) {
  const a = route.at(t - 0.2)
  const b = route.at(t)
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.01) return 90
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
}

/* ── Heist 3: the studio ─────────────────────────────────────────────── */

/*
 * (The user, 2026-11-06.) You walk in, sing, play, and go through to the
 * control room to listen back; what you can see is a dotted fan. The conman
 * trails you the whole way and is never in it: behind you up the corridor,
 * in the studio doorway at your back while you sing and play, back along
 * the corridor out of your way as you come out, and in the control-room
 * doorway while you listen with your back to it. The auditor comes round by
 * the back lane for the tapes while you are in the studio; the engineer
 * signs in, rolls tape in the control room while you play, and waits in the
 * offices as you pass. Every point is pinned to the record (`schedule`);
 * tools/… sight check: no crew head is ever inside your fan.
 */
const S0 = STUDIOS[0]
const SO = S0.o
/** A route point pinned to the record: [x, y, hold, note, flag, at, look]. */
const P3 = (x, y, at, hold = 0, note = null, look = null) => [x, y, hold, note, null, at, look]
const YOU = { label: 'You', mark: 'Y', sight: true, reach: 9, from: 100, to: 122.2, pts: [
  [13.6, 48], [9, 38], P3(7, 33, 101.8), P3(7, 18.6, 103.0), [10.8, 18.6], P3(10.8, 15.6, 103.8), P3(8, 9.5, 104.4, 6, 'you sing', -120), P3(18.5, 9.6, 111.2, 4, 'you play', -90),
  P3(10.8, 15.2, 116.0), [10.8, 18.6], P3(30.8, 18.6, 118.2), [30.8, 15.6], P3(31, 11.2, 119.2, 3, 'you listen back', 180),
] }
const studioCrew = [
  { n: 1, role: 'The conman', style: 'solid', from: T3, to: 121.6, pts: [
    WAIT3[0], P3(4, 33.6, 102.6), P3(7, 31, 103.4), [7, 21], P3(10.8, 18.6, 104.6), P3(10.8, 17.4, 105.0, 9.6, 'follows you'),
    P3(3, 21.6, 115.4, 1.2), P3(10.8, 18.6, 117.4), P3(26, 18.6, 118.8), P3(28, 18.6, 119.2, 1.0), P3(30.8, 17.4, 120.6, 0, 'pretends not to stare'),
  ] },
  { n: 2, role: 'The auditor', style: 'dash', from: T3 + 0.25, wait: T3 - 0.1, to: 115.8, pts: [
    WAIT3[1], P3(12, 37.6, 102.6), [30, 37.6], [52, 36.4], [60, 30], P3(60, 18.6, 107.4, 0, 'up the back lane'), [50.2, 18.6], P3(46, 18.5, 108.6), [41.8, 18.5], [41.8, 15.6], P3(41.8, 8, 109.8, 3, 'steals your sound'),
    [41.8, 15.6], [41.8, 18.4], P3(46, 18.4, 114.4), [50.2, 18.2], P3(60, 18.2, 115.8),
  ] },
  { n: 3, role: 'The engineer', style: 'dot', from: 103.6, to: 121.4, pts: [
    [12.4, 48], [8.2, 38], P3(6.2, 33.4, 105.2, 1.6, 'signs in'), [6.2, 31], P3(6.2, 18.6, 108.0), P3(30.8, 18.6, 110.0), [30.8, 15.6], P3(32, 12, 110.8, 3, 'rolls tape'),
    [30.8, 15.6], P3(30.8, 18.6, 114.6), [21, 18.6], P3(20.8, 21, 115.6), P3(20.8, 26, 116.2, 2.6), [20.8, 21], P3(20.8, 18.6, 119.4), [7, 18.6], P3(7, 33, 120.6), P3(7, 38, 121.4),
  ] },
]
const STUDIO3 = { ...S0, figures: [YOU], crew: studioCrew }
const studioEnd = (n) => {
  const cr = studioCrew.find((q) => q.n === n)
  const p = timing(cr.pts, cr.from, cr.to).at(cr.to + 1)
  return [p[0] + SO[0], p[1] + SO[1]]
}
const KEY3 = { crew: studioCrew, figures: [YOU], owners: [] }

/* ── Chase 2: round the Crescent into the garage ─────────────────────── */

/*
 * The hideout is a motor garage on the west fluke road (the user, 2026-11-06,
 * in place of the pressing plant): the car goes in under the shutter, the
 * shutter comes down behind it, and they leave by the back door while the
 * officer is round the far side.
 */
const PO = [30, 356]
const SHUTTER = 130.6
function garage(t) {
  const down = t >= SHUTTER
  return {
    key: 'garage', o: PO, sheet: ['THE GARAGE', '', ''],
    foot: [box(0, 0, 40, 30)],
    walls: merge(
      wall('ext', [0, 0], [40, 0], [[32, 34.4, 1]]),
      wall('ext', [40, 0], [40, 30]),
      wall('ext', [0, 30], [40, 30], down ? [] : [[26, 38, 0]]),
      wall('ext', [0, 0], [0, 30], [[18, 21, 'g']]),
      wall('int', [12, 0], [12, 10], [[4, 5.4, 1]]), wall('int', [0, 10], [12, 10], [[7, 8.4, -1]]),
      ...(down ? [wall('heavy', [26, 30], [38, 30])] : []),
    ),
    tone: [box(0, 0, 12, 10)],
    items: [
      { k: 'zone', style: 'under', x: 14, y: 3, w: 10, h: 2.4, label: 'PIT' },
      { k: 'rect', x: 15, y: 20, w: 2.2, h: 4.6 }, { k: 'rect', x: 21, y: 20, w: 2.2, h: 4.6 }, { k: 'rect', x: 30, y: 8, w: 2.2, h: 4.6 },
      { k: 'bins', x: 39.2, y: 2, w: 0.7, h: 12 },
      { k: 'rect', x: 2, y: 2, w: 4, h: 1.6 },
    ],
    rooms: [[24, 15.6, 'WORKSHOP'], [6, 6.4, 'OFFICE', 0, 11], [20, 33.4, 'FLUKE ROAD']],
    marks: [[32, 31.6, down ? 'SHUTTER DOWN' : 'SHUTTER'], [33.2, -1.6, 'BACK DOOR']],
    storeys: [[38.6, 28.6, '1']], dims: [], owners: [], crew: [], figures: [],
  }
}
const armLow = arcPts(ARMS.c, ARMS.rx, ARMS.ry, 0, Math.PI, 18) // east end, round the crown, to the west end
const DOOR_E = [SO[0] + 46, SO[1] + 18.5]
const LANE = [SO[0] + 60, SO[1] + 18.5]
const PLANT_DOOR = [PO[0] + 34.8, PO[1] + 34]
/*
 * The Crescent is the only way from the studio's side of the river to the
 * plant's that does not retrace Main Street, so the two legs (studio → plant,
 * plant → museum) are evened out at about 140 m/s rather than 150 and 120:
 * into the plant by 131.4, out again at 133.2 while the officer is round the
 * far side, up to the museum's door by 139.2, easing to a stop, in at 140.2.
 */
/*
 * (The user, 2026-11-06.) The chase to the garage is fast (6.8 s round the
 * Crescent) so the stay is long enough to read: in under the shutter by
 * 129.4, the engineer pulls the shutter down (130.3–131.0), the three wait
 * among the cars while the officer walks round the building (131.6–133.1)
 * and gives up, and they go out of the back door at 134.0, up to the museum.
 */
const AT_GARAGE = 129.4
const AT_MUSEUM = 139.2
const G = (x, y, t) => [PO[0] + x, PO[1] + y, t]
const RUN_TO = [[LANE[0], LANE[1], 122.6], [LANE[0], SO[1] + 46], [739, 393], FLUKES[1][0], ...armLow.slice(1, -1), FLUKES[0][0], G(34.8, 38), G(34.8, 34, AT_GARAGE)]
const RUN_FROM = [G(33.2, -8, 134.0), G(33.2, STOCK_Y - PO[1]), [BALLS[0][0] - BALL_R, STOCK_Y], ...arcPts(BALLS[0], BALL_R, BALL_R, Math.PI, 2 * Math.PI, 6).slice(1), [SHANK_X, STOCK_Y], [SHANK_X, RING.c[1] + RING.r, AT_MUSEUM - 0.5], [SHANK_X, 154, AT_MUSEUM]]
const off2 = (pts, dx, dy, dt) => pts.map(([x, y, t]) => [x + dx, y + dy, t == null ? undefined : t + dt])
const S3 = (x, y, t) => [SO[0] + x, SO[1] + y, t]
const CHASE2 = [
  { n: 1, style: 'solid', hide: [130.5, 133.4], route: timed([[...studioEnd(1), 121.5], [DOOR_E[0] - 3, DOOR_E[1]], DOOR_E, ...RUN_TO,
    G(30, 26), G(18.6, 22.4, 130.2), G(18.6, 22.4, 133.4), G(30, 14), G(33, 1), ...RUN_FROM]) },
  { n: 2, style: 'dash', hide: [130.9, 133.7], route: timed([[...studioEnd(2), 121.5], ...off2(RUN_TO, 1.6, 1.6, 0.3),
    G(28, 27.6), G(20.6, 24.6, 130.6), G(20.6, 24.6, 133.7), G(30.4, 15.2), G(33.4, 1.4), ...off2(RUN_FROM, 1.6, 1.6, 0.3)]) },
  // The engineer left by the front: round the outside to the lane. In the garage he is the one who pulls the shutter down.
  { n: 3, style: 'dot', hide: [131.9, 134.0], route: timed([[...studioEnd(3), 121.5], S3(30, 37.6), S3(52, 36.4), S3(60, 30), ...off2(RUN_TO, -1.6, -1.6, 0.6),
    G(32.4, 30.8, 130.3), G(32.4, 30.8, 131.0), G(22.6, 24.8, 131.6), G(22.6, 24.8, 134.0), G(30.6, 14.6), G(33.6, 1.8), ...off2(RUN_FROM, -1.6, -1.6, 0.6)]) },
]
/** The officer: down Main Street to the back lane as they run, after them all the way, once round the garage (the building on his left), gone. */
const COP_LOOP = [131.6, 133.1]
const COP2 = timed([
  [LANE[0], STOCK_Y, 122.1], [LANE[0], STOCK_Y, 122.6], [LANE[0], LANE[1], 123.4], [LANE[0], SO[1] + 46], [739, 393], FLUKES[1][0], ...armLow.slice(1, -1), FLUKES[0][0],
  [PLANT_DOOR[0], PLANT_DOOR[1] + 4, COP_LOOP[0]], [PO[0] + 46, PO[1] + 36, 131.9], [PO[0] + 46, PO[1] - 6, 132.3], [PO[0] - 5, PO[1] - 6, 132.7], [PO[0] - 5, PO[1] + 36, COP_LOOP[1]],
  FLUKES[0][0], [200, 760, 136.4], [260, 820, 137.6],
])
const KEY_C2 = { crew: [{ n: 1, role: 'The conman', style: 'solid' }, { n: 2, role: 'The auditor', style: 'dash' }, { n: 3, role: 'The engineer', style: 'dot' }], figures: [{ label: 'The police', mark: 'P' }] }

/* ── Heist 4: the museum; the police almost catch them ───────────────── */

const M0 = MUSEUMS[0]
const MO = M0.o
const pc = (R, d) => [R * Math.cos(P(d)), R * Math.sin(P(d))]
// The three stand at the door from the end of chase 2 (AT_MUSEUM) and go in on the break's downbeat.
const museumCrew = M0.crew.map((cr) => {
  if (cr.n === 1) return { ...cr, role: 'The conman', from: T4[0], to: cr.to - EARLY4 }
  if (cr.n === 2) return { ...cr, role: 'The auditor', from: T4[0], to: cr.to - EARLY4, pts: [[1.6, 51], pc(60, 45), pc(62, 0), ...cr.pts] }
  if (cr.n === 3) return { ...cr, role: 'The engineer', from: T4[0], to: cr.to - EARLY4, pts: [[-1.6, 51], pc(60, 135), pc(62, 180), ...cr.pts] }
  return { ...cr, from: cr.from - EARLY4, to: cr.to - EARLY4 }
})
const MUSEUM4 = { ...M0, crew: museumCrew }
const KEY4 = { crew: museumCrew, owners: M0.owners, ownerLabel: 'The guards', figures: [{ label: 'The police', mark: 'P' }] }
const e4 = (t) => (t == null ? undefined : t - EARLY4)
const at4 = (x, y, t) => [MO[0] + x, MO[1] + y, e4(t)]
/** On foot up High Street, in at the front, through the rotunda to the bay, a breath too late. */
const COP4A = timed([[SHANK_X, STOCK_Y, e4(149)], [SHANK_X, RING.c[1] + RING.r, e4(152.4)], at4(0, 50), at4(0, 36, 154.6), at4(0, 26), at4(0, 9, 156.6), at4(0, 9, 157.4), at4(18, 4), at4(30, 1), at4(36, 0, 159.4), at4(46, 0, 160.1), at4(46, 0, 161.5)])
/** A car round the Circus from the south, coming up on the bay as the getaway pulls away; after it down High Street, lost at Main Street. */
const circus = (d0, d1) => arcPts(RING.c, RING.r, RING.r, P(d0), P(d1), 6)
const COP4B = timed([[SHANK_X, STOCK_Y + 40, e4(151)], [SHANK_X, RING.c[1] + RING.r, e4(153.4)], ...circus(90, 180).slice(1), ...circus(180, 270).slice(1), ...circus(270, 352).slice(1), [RING.c[0] + RING.r, RING.c[1], e4(160.4)],
  ...circus(0, 90).slice(1), [SHANK_X, STOCK_Y, e4(162.6)], [SHANK_X, STOCK_Y, e4(164)]])
/** The getaway: from the bay round the Circus and straight down High Street to the crown, easing to a stop where the hall's crew start (HO + DROP). */
const CAR_OUT = e4(160)
const CROWN_STOP = ARMS.c[1] + ARMS.ry - 2
const CAR = timed([[MO[0] + 58.4, MO[1], CAR_OUT], [RING.c[0] + RING.r, RING.c[1], CAR_OUT + 0.5], ...circus(0, 90).slice(1), [SHANK_X, STOCK_Y], [SHANK_X, CROWN_STOP - 30, 163.9], [SHANK_X, CROWN_STOP, 164.5]])

/* ── Heist 5: the hall at the crown ──────────────────────────────────── */

/*
 * (The user, 2026-11-06.) The job is to put the conman on stage in the
 * performer's place. S plays the first song; the stagehand, on the lighting
 * board, kills the lights between songs (176) and S goes out of the stage
 * door for air; the auditor, up through the trap in the dark ("split the
 * ground"), bolts the door behind him; the engineer, down the fly tower
 * ("pierce the sky"), has the curtain down for the swap and up again for the
 * last line; the conman, who bought a ticket and watched the first song from
 * the house, is centre stage with the lights on him on "all the eyes"
 * (182.3). S, locked out, walks round to the front, meets an officer at the
 * stage door on the way, and they find the conman there. The police are
 * searching through the verse: one down High Street trying doors, one along
 * the Crescent from each arm, looking in at the yard doors.
 */
const H0 = HALLS[0]
const HO = H0.o
const DROP = [0, -10]
/** The Crescent's near lane at job x (concert-hall.mjs `lane`). */
const laneAt = (x) => Math.sqrt(233.2 ** 2 - x ** 2) - 238.2
/** A point in the house: degrees and metres about centre stage (0, 15). */
const IN5 = (deg, R) => [R * Math.cos(P(deg)), 15 + R * Math.sin(P(deg))]
const V4 = 165.45
const LIGHTS_OUT = 176.0
const SEEN = 188.0
const PERFORMER = { label: 'The performer', mark: 'S', from: 163, to: 190, pts: [
  P3(0, 9, 163), P3(0, 9, 176.4, 0, 'between songs'), [0, 4], P3(0, 2.3, 177.4), P3(0, -3, 177.9, 1.5, 'for air'), [0, -6], P3(0, 0.6, 181.2, 0, 'locked out'), P3(0, 0.6, 182.0),
  [8, -4], P3(22, -2, 183.2), [36, 4], [44, 20], [46, 40], [36, 56], P3(20, 62, 186.0), P3(14, 57.7, 186.4), P3(13.5, 51.9, 186.8), P3(4, 46, 187.4),
] }
const hallCrew = [
  { n: 1, role: 'The conman', style: 'solid', from: V4 + 0.1, wait: 164.5, to: 188.4, pts: [
    DROP, [30, -6], [50, 18], [40, 50], [14, 56], IN5(71.8, 49), P3(...IN5(71.8, 44), 169.0), P3(...IN5(61, 42), 169.6, 2.4, 'buys a ticket'), IN5(70.5, 41.8), P3(...IN5(70.5, 30), 173.6, 0, 'the first song'),
    P3(...IN5(70.5, 30), 178.2), IN5(70.5, 21), P3(0, 19.4, 180.4), P3(0, 12, 182.3, 0, 'all the eyes on me'), P3(0, 12, 188.3),
  ] },
  { n: 2, role: 'The auditor', style: 'longdash', from: V4 + 0.3, to: 188.4, pts: [
    DROP, [-46, -6], P3(-48, 33, 167.8), P3(-45, 30, 168.2, 0, 'splits the ground'), P3(-45, 30, 171.3), [-1.2, 15.6, 0, null, 'jump', 176.8], [-6, 10], P3(-3, 3.4, 178.4, 1.2, 'bolts the stage door'), P3(-12, 8, 181.0), P3(-12, 8, 188.3),
  ] },
  { n: 3, role: 'The engineer', style: 'dashdot', from: V4 + 0.5, to: 188.4, pts: [
    DROP, P3(44, -8, 167.4), P3(38, -4, 168.0, 0, 'pierces the sky'), P3(38, -4, 171.4), [12, 4.5, 0, null, 'jump', 174.0], P3(14, 5.2, 175.8, 0, 'curtain down'), P3(14, 5.2, 182.0, 0, 'curtain up'), P3(14, 5.2, 188.3),
  ] },
  { n: 4, role: 'The stagehand', style: 'dash', from: V4, to: 188.4, pts: [
    [-1.4, laneAt(-1.4)], P3(-1.4, 0.4, 166.4), [-1.4, 3], [1, 6.6], [10.4, 6.6], P3(12.6, 8.6, 168.2, 0, 'on the lights'), P3(12.6, 8.6, LIGHTS_OUT, 0, 'kills the lights'), P3(12.6, 8.6, 182.0, 0, 'lights up'), P3(12.6, 8.6, 188.3),
  ] },
  { n: 5, role: 'The driver', style: 'dot', from: V4, to: 184, pts: [[0, laneAt(-58) + 8], [-40, laneAt(-36)], [-40, laneAt(-36), 12], [-16, laneAt(-16)], [6, laneAt(6), 0, 'engine running']] },
]
const HALL5 = { ...H0, figures: [PERFORMER], crew: hallCrew }
const hallEnd = (n) => {
  const cr = hallCrew.find((q) => q.n === n)
  const p = timing(cr.pts, cr.from, cr.to).at(cr.to + 1)
  return [p[0] + HO[0], p[1] + HO[1]]
}
const KEY5 = { crew: hallCrew, figures: [PERFORMER, { label: 'The police', mark: 'P' }], owners: H0.owners, ownerLabel: 'The ushers' }
/** The police through the verse (town metres). */
const H5 = (x, y, t) => [HO[0] + x, HO[1] + y, t]
const ROUND_EAST = [[8, -4], [22, -2], [36, 4], [44, 20], [46, 40], [36, 56], [20, 62], [14, 57.7], [13.5, 51.9]]
/** Down High Street trying doors; S, locked out, meets him at the stage door and they go round to the front together, where he sees the conman on stage. */
const COP5A = timed([H5(0, -150, 170), H5(0, -110, 172.6), H5(0, -110, 174.2), H5(0, -70, 176.6), H5(0, -70, 178.2), H5(0, -4, 181.6), H5(0, -4, 182.4),
  ...ROUND_EAST.map(([x, y]) => H5(x, y)), H5(2, 46, SEEN)])
/** Along the Crescent from the west arm, in at the green room's yard door, then off after the auditor. */
const COP5B = timed([H5(-120, laneAt(-120), 176), H5(-62, laneAt(-62), 180.4), H5(-50, 2, 182.4), H5(-42, 20, 184.0), H5(-26, 19.5, 185.2), H5(-26, 19.5, 186.6), H5(-38, 30, SEEN + 0.2)])
/** The same from the east arm, at the dressing room's yard door. */
const COP5C = timed([H5(120, laneAt(120), 176.5), H5(62, laneAt(62), 181), H5(50, 2, 183), H5(42, 20, 184.6), H5(26, 19.5, 185.8), H5(26, 19.5, 187.2), H5(36, 2, SEEN + 0.2)])
const SEARCH5 = [COP5A, COP5B, COP5C]

/* ── The final chase: their red becomes the anchor ───────────────────── */

/*
 * (The user, 2026-11-06.) The officer in the foyer sees the conman on stage
 * (188.0) and the chase is on, and still on when the end card comes. Three
 * ways to run it are motion tests on the page (FINALES, below); C is the
 * one on the film until one is picked.
 */
const CROWN = [SHANK_X, ARMS.c[1] + ARMS.ry]
const STAGE_DOOR = [HO[0], HO[1] + 2.3]
const westArm = arcPts(ARMS.c, ARMS.rx, ARMS.ry, Math.PI / 2, Math.PI, 30)
const eastArm = arcPts(ARMS.c, ARMS.rx, ARMS.ry, Math.PI / 2, 0, 30)
const ringRound = arcPts(RING.c, RING.r, RING.r, Math.PI / 2, Math.PI / 2 + 2 * Math.PI, 12)
const [F0, F1] = FINAL
const RING_IN = [SHANK_X, RING.c[1] + RING.r]
const WEST_YARD = [HO[0] - 25.7, HO[1] + 19]
const EAST_YARD = [HO[0] + 25.7, HO[1] + 19]
const KEY_F = { crew: hallCrew.map(({ n, role, style }) => ({ n, role, style })), figures: [{ label: 'The police', mark: 'P' }] }
void SEARCH5

/*
 * The end chaos, as motion tests on the page (the user, 2026-11-06): the
 * five split in different directions and the chase sprawls across the map
 * through to the end card.
 *
 *   C · Crossing paths   (on the film) all five go at once on 188.2 and
 *                        double back: the conman turns from the police car,
 *                        the auditor from the officer at the bridge and runs
 *                        back through the hall, the engineer rounds downtown
 *                        and is caught at the stage door
 *
 * Then three more on the user's notes (the officers are already about and
 * give chase as they see them; the five leave one by one at different
 * speeds — a car with a police car tight behind it, one into the bushes and
 * caught; they weave in and out between buildings, drawn thin and dotted):
 *
 *   D · One at a time    the driver first (187.0, the car), the stagehand to
 *                        the bushes (caught), the engineer slowly over the
 *                        roofs and through the blocks east, the auditor west
 *                        and clean away, the conman last, east through
 *                        downtown and the park, north round the ring and
 *                        away east
 *   E · Through the blocks  the same order, but nobody keeps to a street for
 *                        long: through blocks all the way; the engineer caught
 *                        in a dead-end yard; the conman ends at the garage
 *   F · Double back      the same order, and they double back as in C: the
 *                        conman from the police car, the auditor east again
 *                        across Main Street and round the ring, the engineer
 *                        weaving slowly north and round the ring to the end
 */
const J = (x, y, t) => [x, y, t, 'jump']
/** The same points, each later by a lag that grows (or shrinks) along the route: an officer behind. */
const lag = (pts, l0, l1) => pts.map((p, i) => (p[2] == null ? p : [p[0], p[1], p[2] + lerp(l0, l1, i / Math.max(1, pts.length - 1)), p[3]]))
/** Only the street points of a route (an officer in a car cannot cut through a block). */
const streets = (pts) => pts.filter((p) => p[3] !== 'jump')
const ballTop = (b, east) => (east ? arcPts(b, BALL_R, BALL_R, Math.PI, 2 * Math.PI, 5) : arcPts(b, BALL_R, BALL_R, 0, -Math.PI, 5)).slice(1, -1)

/* ── C · Crossing paths ──────────────────────────────────────────────── */

const K1 = [[...STAGE_DOOR, 189.0], [...CROWN, 189.3], [400, 600, 191.8], [400, 600, 192.0], J(360, 620, 192.6), [320, 640, 193.0], [320, 718, 194.5], [400, 718, 196.0], [480, 718, 197.2], [480, 478, 200.5], [560, 478, 201.5], [560, STOCK_Y, 203.5],
  ...ballTop(BALLS[1], true), [662, STOCK_Y, 206.5], [735, STOCK_Y], [960, STOCK_Y, 210.0], [932, 152, 213.0], [728, 120, 216.0], [690, 214], [568, 201, 218.5], [546, 85, 220.0], J(500, 40, 221.5), [400, -13, 223.0],
  ...arcPts([400, 104], 109, 117, -Math.PI / 2, -Math.PI, 3).slice(1, -1), [291, 104, 225.5], J(200, 150, 227.0), [138, STOCK_Y, 229.5], ...ballTop(BALLS[0], true), [198, STOCK_Y, 231.5], [400, STOCK_Y, 235.0], [...RING_IN, 237.5]]
const K2 = [[HO[0] - 17, HO[1] + 7.6], [HO[0] - 22, HO[1] + 10], [...WEST_YARD, 189.8], [HO[0] - 40, HO[1] + 26], ...westArm.slice(3, 9), [...westArm[9], 197.0], [...westArm[9], 197.4], ...westArm.slice(3, 9).reverse(), [HO[0] - 40, HO[1] + 26, 203.4],
  [...STAGE_DOOR, 204.3], J(HO[0], HO[1] + 40, 205.2), [HO[0] + 14, HO[1] + 57.7, 206.0], [330, 930, 208.0], [414, 924, 210.0], [480, 930, 211.5], J(560, 860, 213.0), [...eastArm[10], 215.0], ...eastArm.slice(11), [739, 391, 222.0], J(760, 340, 223.0),
  [760, STOCK_Y, 223.5], [960, STOCK_Y, 227.0], [932, 152, 230.0], [728, 120, 233.5], [690, 214, 235.0], [568, 201, 237.0], [546, 85, 240]]
const K3 = [[HO[0] + 17, HO[1] + 7.6], [HO[0] + 22, HO[1] + 10], [...EAST_YARD, 189.8], [HO[0] + 40, HO[1] + 26], ...eastArm.slice(3), [739, 391, 199.0], J(760, 340, 200.0), [760, STOCK_Y], [662, STOCK_Y, 202.5], ...ballTop(BALLS[1], false), [602, STOCK_Y, 205.0],
  [560, STOCK_Y], [560, 478, 208.0], [480, 478], [480, 718, 212.0], [400, 718, 214.0], [...CROWN, 217.5], [...STAGE_DOOR, 218.0], [...STAGE_DOOR, 240]]
const K4 = [[...STAGE_DOOR, 189.2], [...CROWN, 189.5], [400, 398, 195.0], [320, 398, 196.5], [320, STOCK_Y, 198.0], [198, STOCK_Y, 200.5], ...ballTop(BALLS[0], false), [138, STOCK_Y, 202.0], [60, STOCK_Y, 203.0], [-150, 312, 206.0], [-150, 520, 210.0], [-260, 560, 212.0],
  [-330, 470, 214.0], [-260, 560, 216.0], [-150, 520, 218.0], [-150, 312, 222.0], [60, STOCK_Y, 225.0], J(64, 370, 227.0), [56, 393, 227.6], [126, 536, 231.0], ...westArm.slice(10, 17).reverse(), [...westArm[9], 235.0], [...westArm[9], 240]]
const K5 = [[...CROWN, 189.0], [400, STOCK_Y, 197.0], [...RING_IN, 199.5], ...ringRound.slice(1, -1), [...RING_IN, 207.0], [400, STOCK_Y, 210.0], [662, STOCK_Y, 215.0], [735, STOCK_Y], [960, STOCK_Y, 219.0], [900, 500, 222.0], [960, 700, 225.0],
  [1180, 470, 229.0], [1300, 350, 232.0], [1400, 250, 236.0], [1450, 180, 240]]
const RUNS_C = [
  { n: 1, style: 'solid', route: timed([[...hallEnd(1), F0], ...K1]) },
  { n: 2, style: 'longdash', route: timed([[...hallEnd(2), F0], ...K2]) },
  { n: 3, style: 'dashdot', route: timed([[...hallEnd(3), F0], ...K3]), caught: 218.4 },
  { n: 4, style: 'dash', route: timed([[...hallEnd(4), F0], ...K4]), caught: 235.4 },
  { n: 5, style: 'dot', route: timed([[...hallEnd(5), F0], ...K5]) },
]
const COPS_C = [
  // From the foyer, up the shank, and after the conman from the park on.
  timed([[...H5(2, 46), F0 + 0.2], [...H5(0, 19.4), 189.6], [...STAGE_DOOR, 191.0], [...CROWN, 191.4], [400, 718, 196.5], ...lag(K1.slice(7), 2.4, 5.0)]),
  // West along the arm to the bridge and stands there: the auditor turns back from him; the stagehand runs into him at the end.
  timed([[...H5(-38, 30), SEEN + 0.4], [HO[0] - 40, HO[1] + 26, 190.0], ...westArm.slice(3, 9), [...westArm[9], 196.2], [...westArm[9], 240]]),
  // After the engineer the whole way round, and on him at the stage door.
  timed([[...H5(36, 2), SEEN + 0.4], ...lag(K3.slice(2, -2), 2.6, 1.0), [...CROWN, 218.0], [...STAGE_DOOR, 218.6], [...STAGE_DOOR, 240]]),
  // The car down High Street meets the conman head on, turns, and is after him.
  timed([[SHANK_X, 318, 186.0], [SHANK_X, 640, 191.5], [SHANK_X, 640, 192.5], ...lag(K1.slice(4), 1.0, 3.0)]),
  timed([[520, 828, 187.0], [430, 862, 189.5], ...lag(K5, 1.5, 3.5)]),
]

/* ── D, E, F: the officers already about, the five leaving one by one ── */

/** The three searchers through the verse (as SEARCH5), and then on into the chase. */
const SEARCH_A = [H5(0, -150, 170), H5(0, -110, 172.6), H5(0, -110, 174.2), H5(0, -70, 176.6), H5(0, -70, 178.2), H5(0, -4, 181.6), H5(0, -4, 182.4), ...ROUND_EAST.map(([x, y]) => H5(x, y)), H5(2, 46, SEEN)]
const SEARCH_B = [H5(-120, laneAt(-120), 176), H5(-62, laneAt(-62), 180.4), H5(-50, 2, 182.4), H5(-42, 20, 184.0), H5(-26, 19.5, 185.2), H5(-26, 19.5, 186.6), H5(-38, 30, SEEN + 0.2)]
const SEARCH_C = [H5(120, laneAt(120), 176.5), H5(62, laneAt(62), 181), H5(50, 2, 183), H5(42, 20, 184.6), H5(26, 19.5, 185.8), H5(26, 19.5, 187.2), H5(36, 2, SEEN + 0.2)]
/** Two police cars, about since the verse: one down High Street trying doors, parked 50 m short of the stage door; one along the Crescent from the east, up to the getaway car. */
const CAR_N = [[400, 318, 178], [400, 700, 184.5], [400, 760, 185.5], [400, 760, 186.6], [400, 800, 187.6]]
const CAR_E = [H5(120, laneAt(120), 180), H5(70, laneAt(70), 184), H5(70, laneAt(70), 185.2), H5(30, laneAt(30), 186.6)]
/** The driver sees the police car coming up behind his and goes (187.0): east along the Crescent, the fluke road, through the studio's yard, Main Street, over the bridge and round the east bank; the police car a length behind the whole way. */
const DRIVE5 = [[...hallEnd(5), 187.0], ...eastArm.slice(2, -1), [...FLUKES[1][0], 194.5], [739, 391, 197.5], J(760, 340, 198.4), [760, STOCK_Y, 199.0], [960, STOCK_Y, 203.0], [900, 500, 206.0], [960, 700, 209.0], [1180, 470, 213.0], [1400, 250, 218.0],
  [1180, 470, 222.0], [960, 700, 226.0], [900, 500, 229.0], [932, 152, 233.0], [728, 120, 237.0], [690, 214, 240]]
const CHASE5 = [...CAR_E, ...lag(streets(DRIVE5).slice(1), 1.0, 1.6)]
/** The stagehand: out of the stage door at 188.8, through the block west of it and into the trees, where he is found. */
const BUSH = [310, 905]
const RUN4 = [[...hallEnd(4), F0], [...STAGE_DOOR, 188.8], [360, 862, 189.8], J(330, 880, 190.6), [...BUSH, 191.4], [...BUSH, 240]]
const FOUND4 = 195.4
/** The conman holds the stage until the officer from the foyer is at its edge, then bolts out of the stage door (190.6). */
const BOLT = [[...hallEnd(1), F0], [...hallEnd(1), 189.8], [...STAGE_DOOR, 190.6]]
const CHASE_A = [...SEARCH_A, H5(0, 19.4, 190.0), H5(0, 19.4, 190.3), [...STAGE_DOOR, 191.6]]
/** The auditor out through the green room into the west yard (190.2); the engineer up the fly tower, over the dressing-room roof, into the east yard (190.6). */
const OUT2 = [[...hallEnd(2), F0], [HO[0] - 17, HO[1] + 7.6, 189.0], [HO[0] - 22, HO[1] + 9], [...WEST_YARD, 190.2]]
const OUT3 = [[...hallEnd(3), F0], [...hallEnd(3), 189.2], J(HO[0] + 22, HO[1] + 9, 189.8), [...EAST_YARD, 190.6]]
const hillE = arcPts([400, 104], 109, 117, Math.PI / 2, 0, 4) // the hill ring road from the south (400, 221) round the east to (509, 104)

// D · One at a time
const D1 = [...BOLT, [430, 858, 191.2], J(470, 820, 192.4), [480, 798, 192.8], [480, 718, 194.4], J(440, 678, 195.2), [400, 640, 196.0], [362, 652, 197.0], J(340, 600, 198.0), [320, 558, 199.0], J(360, 518, 200.0), [400, 478, 201.0], [400, 367, 203.5], [400, STOCK_Y, 204.5],
  [...RING_IN, 207.5], [472, 104, 209.5], J(520, 60, 210.5), [546, 85, 211.5], [568, 201, 214.0], [690, 214, 217.0], [728, 120, 219.5], [930, 150, 224.0], [900, 400, 229.0], [960, 700, 234.0], [1180, 470, 240]]
const D2 = [...OUT2, [HO[0] - 40, HO[1] + 26], ...westArm.slice(3, 9), [...westArm[9], 196.0], [126, 536, 201.0], J(100, 470, 203.0), J(64, 370, 205.0), [60, STOCK_Y, 206.0], [-150, 312, 210.0], J(-200, 400, 213.0), [-150, 520, 215.0], [-260, 560, 217.0], J(-300, 620, 219.0),
  [-330, 470, 221.0], [-340, 300, 225.0], [-350, 150, 229.0], [-330, 40, 233.0], [-150, 95, 237.0], [95, 130, 242]]
const D3 = [...OUT3, [460, 900, 192.0], J(520, 870, 194.0), [560, 830, 196.5], J(600, 780, 199.0), [...eastArm[10], 201.5], ...eastArm.slice(11, -1), [...FLUKES[1][0], 210.0], J(739, 370, 214.0), [760, STOCK_Y, 216.0], [735, STOCK_Y], J(700, 290, 218.0), [690, 214, 220.0], [568, 201, 223.0],
  J(500, 150, 225.5), [458, 251, 227.5], [400, 221, 229.0], J(380, 180, 230.0), [...RING_IN, 231.0], [328, 104, 234.0], [400, 32, 237.0], [472, 104, 240]]
const RUNS_D = [
  { n: 1, style: 'solid', route: timed(D1) },
  { n: 2, style: 'longdash', route: timed(D2) },
  { n: 3, style: 'dashdot', route: timed(D3) },
  { n: 4, style: 'dash', route: timed(RUN4), hide: [191.6, FOUND4], caught: FOUND4 },
  { n: 5, style: 'dot', route: timed(DRIVE5) },
]
const COPS_D = [
  timed([...CHASE_A, ...lag(streets(D1).slice(3), 1.5, 3.5)]),
  timed([...SEARCH_B, [340, 900, 191.4], [...BUSH, FOUND4 - 0.2], [...BUSH, 240]]),
  timed([...SEARCH_C, ...lag(streets(D3).slice(4), 2.5, 4.0)]),
  // The car parked up the street sees him come out of the stage door, turns, and follows by the streets.
  timed([...CAR_N, [400, 800, 190.8], [...CROWN, 191.8], [430, 858, 192.6], ...lag(streets(D1).slice(5), 2.0, 4.0)]),
  timed(CHASE5),
]

// E · Through the blocks
const E1 = [...BOLT, J(360, 830, 191.4), J(340, 790, 192.4), [320, 718, 194.0], J(360, 678, 195.0), [400, 640, 196.0], J(440, 598, 197.2), [480, 558, 198.5], J(520, 518, 199.8), [560, 478, 201.0], J(600, 438, 202.2), [640, 398, 203.5], J(680, 358, 204.8), [720, STOCK_Y, 206.0],
  J(700, 260, 207.0), [690, 214, 208.0], [568, 201, 211.0], J(520, 150, 212.5), [546, 85, 213.0], J(480, 60, 214.5), [400, 32, 216.0], [328, 104, 218.0], [...RING_IN, 220.5], [400, STOCK_Y, 223.0], [198, STOCK_Y, 227.0], ...ballTop(BALLS[0], false), [138, STOCK_Y, 229.0],
  J(100, 350, 230.0), [64, 380, 231.0], [56, 393, 231.6], [126, 536, 235.0], ...westArm.slice(10, 17).reverse(), [...westArm[9], 240]]
const E2 = [...OUT2, J(340, 890, 191.4), [...westArm[4], 192.4], J(250, 790, 194.4), [...westArm[9], 196.4], J(160, 700, 198.4), [...westArm[13], 200.4], [126, 536, 202.0], J(90, 480, 204.0), [56, 393, 206.0], [60, STOCK_Y, 208.0], [-150, 312, 211.0], J(-200, 380, 213.0),
  [-150, 520, 215.0], J(-220, 540, 216.0), [-260, 560, 217.0], J(-300, 500, 218.0), [-330, 470, 219.0], [-340, 300, 223.0], J(-300, 200, 225.0), [-150, 95, 229.0], [95, 130, 234.0], J(150, 110, 236.0), [211, 1, 238.0], [269, 20, 240]]
const E3 = [...OUT3, J(460, 900, 192.0), [480, 930, 193.0], J(520, 880, 194.5), [560, 830, 196.5], [560, 830, 240]]
const RUNS_E = [
  { n: 1, style: 'solid', route: timed(E1) },
  { n: 2, style: 'longdash', route: timed(E2) },
  { n: 3, style: 'dashdot', route: timed(E3), caught: 197.4 },
  { n: 4, style: 'dash', route: timed(RUN4), hide: [191.6, FOUND4], caught: FOUND4 },
  { n: 5, style: 'dot', route: timed(DRIVE5) },
]
const COPS_E = [
  timed([...CHASE_A, ...lag(streets(E1).slice(3), 2.0, 4.0)]),
  timed([...SEARCH_B, [340, 900, 191.4], [...BUSH, FOUND4 - 0.2], [...BUSH, 240]]),
  // Into the yard after the engineer and has him in the dead end.
  timed([...SEARCH_C, [460, 900, 192.5], [520, 880, 195.0], [560, 830, 197.2], [560, 830, 240]]),
  timed([...CAR_N, [400, 800, 190.8], [...CROWN, 191.8], [430, 858, 192.6], [480, 798, 194.0], [480, 718, 195.6], [400, 718, 197.4], [400, 640, 198.6], ...lag(streets(E1).slice(5), 3.0, 4.5)]),
  timed(CHASE5),
]

// F · Double back
const Z1 = [...BOLT, [400, 700, 193.0], [400, 640, 193.2], [400, 640, 193.6], J(360, 720, 194.6), [320, 718, 195.0], J(340, 680, 195.8), [362, 652, 196.5], [320, 640, 197.5], [320, 478, 201.0], J(360, 438, 202.0), [400, 398, 203.0], [400, STOCK_Y, 205.0],
  [480, STOCK_Y, 207.0], J(520, 260, 208.5), [568, 201, 210.0], [690, 214, 213.0], J(700, 160, 214.5), [728, 120, 215.5], [930, 150, 220.0], [900, 400, 225.0], [960, 700, 231.0], [1180, 470, 237.0], [1400, 250, 242]]
const Z2 = [...OUT2, [HO[0] - 40, HO[1] + 26], ...westArm.slice(3, 9), [...westArm[9], 197.0], [...westArm[13], 200.0], [126, 536, 203.0], [56, 393, 207.0], J(64, 370, 208.0), [60, STOCK_Y, 209.0], [138, STOCK_Y, 211.0], ...ballTop(BALLS[0], true), [198, STOCK_Y, 213.0],
  [320, STOCK_Y, 216.0], J(360, 280, 217.0), [400, STOCK_Y, 218.0], [...RING_IN, 221.0], [328, 104, 223.5], [400, 32, 226.0], J(340, 14, 227.0), [269, 20, 229.0], J(150, 60, 232.0), [95, 130, 234.0], [-150, 95, 238.0], [-230, -20, 242]]
const Z3 = [...OUT3, J(460, 900, 192.0), [480, 930, 193.0], J(520, 880, 194.5), [560, 830, 195.5], J(600, 780, 197.0), [...eastArm[10], 198.0], ...eastArm.slice(11, -1), [...FLUKES[1][0], 206.0], [739, 391, 210.0], J(760, 340, 211.0), [760, STOCK_Y, 212.0], [735, STOCK_Y],
  J(700, 290, 214.0), [690, 214, 215.0], J(640, 170, 216.5), [568, 201, 218.0], J(520, 150, 219.5), [458, 251, 221.0], J(420, 200, 222.5), [...RING_IN, 223.5], [472, 104, 225.5], [400, 32, 227.5], [328, 104, 229.5], [...RING_IN, 231.5], [472, 104, 233.5], [400, 32, 235.5], [328, 104, 237.5], [...RING_IN, 240]]
const RUNS_F = [
  { n: 1, style: 'solid', route: timed(Z1) },
  { n: 2, style: 'longdash', route: timed(Z2) },
  { n: 3, style: 'dashdot', route: timed(Z3) },
  { n: 4, style: 'dash', route: timed(RUN4), hide: [191.6, FOUND4], caught: FOUND4 },
  { n: 5, style: 'dot', route: timed(DRIVE5) },
]
const COPS_F2 = [
  timed([...CHASE_A, [400, 700, 194.6], [400, 718, 195.2], [320, 718, 197.0], ...lag(streets(Z1).slice(7), 2.4, 4.0)]),
  // After the auditor, further behind every block.
  timed([...SEARCH_B, [HO[0] - 40, HO[1] + 26, 190.8], ...lag(streets(Z2).slice(5), 2.0, 4.5)]),
  // Round the front of the hall to the trees, and finds the stagehand.
  timed([...SEARCH_C, H5(0, 60, 190.6), [340, 920, 193.2], [...BUSH, FOUND4 - 0.2], [...BUSH, 240]]),
  // The car down High Street meets the conman head on at 193.2, turns, and is after him by the streets.
  timed([...CAR_N, [400, 800, 190.8], [400, 640, 192.6], [400, 640, 193.8], [400, 718, 195.6], [320, 718, 197.4], ...lag(streets(Z1).slice(8), 2.0, 3.5)]),
  timed(CHASE5),
]

const FINALES = {
  c: { label: 'C · Crossing paths', runs: RUNS_C, cops: COPS_C },
  d: { label: 'D · One at a time', runs: RUNS_D, cops: COPS_D, full: true, early: 187.0 },
  e: { label: 'E · Through the blocks', runs: RUNS_E, cops: COPS_E, full: true, early: 187.0 },
  f: { label: 'F · Double back', runs: RUNS_F, cops: COPS_F2, full: true, early: 187.0 },
}

/* ── Cameras from heist 3 on ─────────────────────────────────────────── */

const STUDIO_END = { ...STUDIO_VIEW, s: STUDIO_VIEW.s * 1.06 }
const WIDE2 = { cx: 390, cy: 600, s: 1.24 }
const PLANT_VIEW = { cx: PO[0] + 22, cy: PO[1] + 10, s: 6.2 }
const NORTH = { cx: 270, cy: 250, s: 1.9 }
const MUSEUM_VIEW = { cx: MO[0] + M0.view[0], cy: MO[1] + M0.view[1], s: M0.view[2] }
const MUSEUM_END = MUSEUM_VIEW // no push through the job: it made the hatched walls crawl
const HALL_VIEW = { cx: HO[0] + H0.view[0], cy: HO[1] + H0.view[1], s: H0.view[2] }
const HALL_END = { ...HALL_VIEW, s: HALL_VIEW.s * 1.05 }
const TOWN = { cx: CAMS.overview.cx, cy: CAMS.overview.cy, s: CAMS.overview.s }
const carView = (t, s) => { const p = CAR.at(t); return { cx: p[0], cy: p[1], s } }

function camLater(t) {
  if (t < C2[0]) return zoom(STUDIO_VIEW, STUDIO_END, ramp(t, T3, C2[0]))
  if (t < 125) return zoom(STUDIO_END, WIDE2, ease(ramp(t, C2[0], 125)))
  if (t < 127.8) return WIDE2
  if (t < AT_GARAGE) return zoom(WIDE2, PLANT_VIEW, ease(ramp(t, 127.8, AT_GARAGE)))
  if (t < 134.2) return PLANT_VIEW
  if (t < 136.2) return zoom(PLANT_VIEW, NORTH, ease(ramp(t, 134.2, 136.2)))
  // Held wide while they run Main Street, then down onto the museum, landed as they reach its door.
  if (t < 137.4) return NORTH
  if (t < AT_MUSEUM) return zoom(NORTH, MUSEUM_VIEW, ease(ramp(t, 137.4, AT_MUSEUM)))
  // Held dead still through the job (the user, 2026-11-06: a slow push made the hatched walls crawl).
  if (t < CAR_OUT - 0.2) return MUSEUM_VIEW
  if (t < CAR_OUT + 1.8) return zoom(MUSEUM_END, carView(t, 2.4), ease(ramp(t, CAR_OUT - 0.2, CAR_OUT + 1.8)))
  if (t < 162.6) return carView(t, 2.4)
  // Down onto the hall as the car slows to the crown; landed, and the hall inked, before the verse.
  if (t < 164.8) return zoom(carView(t, 2.4), HALL_VIEW, ease(ramp(t, 162.6, 164.8)))
  if (t < F0) return zoom(HALL_VIEW, HALL_END, ramp(t, 164.8, F0))
  // Out fast at first, so the five running off are never out of frame, then slowing to the whole town.
  if (t < F1 + 0.5) return zoom(HALL_END, TOWN, easeOut(ramp(t, F0, F1 + 0.5)))
  return TOWN
}

/* ── A frame from heist 3 on ─────────────────────────────────────────── */

function later({ time: t, score, uid }, finale = FINALES.c) {
  const c = camOf(camLater(t))
  let body = ''
  let top = ''
  // What is already in the town: jobs 1 and 2, the first getaway, chase 1 fading.
  body += plan(drawn(1), c, t, `${uid}-j1`) + ownerSvg(c, t) + crewSvg(c, t, uid) + travel(c, t)
  body += noHeads(plan(overlay(t), c, t, `${uid}-j2`))
  const fade1 = 1 - ramp(t, 101, 106)
  if (fade1 > 0) {
    body += redTrail(c, ROUTE1.walked(t), 'solid', fade1) + redTrail(c, ROUTE2.walked(t), 'dash', fade1)
    body += cop(c, COP, t, { trailOp: 0.8 * fade1, show: false })
  }
  // Heist 3.
  const j3 = plan(STUDIO3, c, Math.min(t, 121.5), `${uid}-j3`)
  body += t < 121.5 ? j3 : noHeads(j3)
  // Chase 2, and the garage they hide in.
  if (t >= 127.2) body += plan(inked(garage(t), ease(ramp(t, 127.2, 129.2))), c, t, `${uid}-pp`)
  if (t >= C2[0] - 0.5) {
    for (const k of CHASE2) {
      const w = k.route.walked(t)
      body += redTrail(c, w, k.style)
      if (!w || t >= C2[1]) continue
      top += t > k.hide[0] && t < k.hide[1] ? hiding(c, w.at(-1)) : head(c, w.at(-1), k.n)
    }
    const looking = t >= COP_LOOP[0] && t < COP_LOOP[1] ? heading(COP2, t) - 90 : undefined
    body += cop(c, COP2, Math.min(t, 138.2), { look: looking, trailOp: 0.8 * (1 - ramp(t, 140, 144)), show: t < 138.2 })
  }
  // Heist 4, drawn on as the camera lands, with the police at the door.
  if (t >= 137.0) {
    const j4 = plan(inked(MUSEUM4, ease(ramp(t, 137.2, AT_MUSEUM - 0.3))), c, Math.min(t, T4[1] + 0.2), `${uid}-j4`)
    body += t < T4[1] ? j4 : noHeads(j4)
    const copOp = 0.8 * (1 - ramp(t, e4(166), e4(170)))
    body += cop(c, COP4A, Math.min(t, e4(161.5)), { trailOp: copOp, show: t < e4(161.5) })
    body += cop(c, COP4B, Math.min(t, e4(164)), { trailOp: copOp, show: t < e4(164) })
    if (t >= CAR_OUT) {
      const w = CAR.walked(t)
      body += redTrail(c, w, 'longdash')
      if (t < 164.5) top += head(c, w.at(-1), 4)
    }
  }
  // Heist 5, the hall drawn on as the camera lands; the police searching through the verse.
  if (t >= 162.4) {
    const j5 = plan(inked(HALL5, ease(ramp(t, 162.6, 164.6))), c, Math.min(t, F0), `${uid}-j5`)
    // A finale that starts early (the driver's car) takes his head over from the plan.
    body += t < F0 ? (finale.early != null && t >= finale.early ? noHead(j5, 5) : j5) : noHeads(j5)
    if (!finale.full) {
      // The searchers hand over to the chase's officers without a gap: shown until each chase route has begun.
      const peering = (route, a, b) => (t >= a && t < b ? heading(route, a - 0.3) : undefined)
      body += cop(c, COP5A, Math.min(t, SEEN), { reach: 14, show: t < F0 + 0.2, look: t >= SEEN - 0.4 ? -90 : undefined })
      body += cop(c, COP5B, Math.min(t, SEEN + 0.2), { reach: 14, show: t < SEEN + 0.4, look: peering(COP5B, 185.2, 186.6) })
      body += cop(c, COP5C, Math.min(t, SEEN + 0.2), { reach: 14, show: t < SEEN + 0.4, look: peering(COP5C, 185.8, 187.2) })
    }
  }
  // The final chase, still on when the end card comes.
  if (t >= (finale.early ?? F0 - 0.2)) {
    for (const k of finale.runs) {
      const w = k.route.walked(t)
      body += redTrail(c, w, k.style)
      if (!w) continue
      top += k.hide && t > k.hide[0] && t < k.hide[1] ? hiding(c, w.at(-1)) : head(c, w.at(-1), k.n)
      if (k.caught != null && t >= k.caught) top += caughtRing(c, w.at(-1))
    }
  }
  // A 'full' finale's officers are the searchers themselves, about since the verse, going on into the chase.
  if (t >= (finale.full ? 170 : F0 - 0.2)) for (const route of finale.cops) body += cop(c, route, t, { trailOp: 0.8, reach: finale.full ? 16 : 20 })

  // Key and title, per stretch.
  let s
  const plates = (job, titles, a, b) => ({ job, titles, chrome: Math.min(ramp(t, a, a + 1.2), 1 - ramp(t, b - 1.2, b)) })
  if (t < C2[0]) s = plates(KEY3, S0.sheet, T3 - 0.6, C2[0] + 0.6)
  else if (t < T4[0]) s = { job: KEY_C2, titles: S0.sheet, chrome: 0, key: Math.min(ramp(t, C2[0], C2[0] + 1.2), 1 - ramp(t, C2[1] - 1.2, C2[1])) }
  else if (t < T5[0]) s = plates(KEY4, M0.sheet, T4[0], e4(162))
  else if (t < F0) s = plates(KEY5, H0.sheet, T5[0], F0 + 0.4)
  else {
    const career = ramp(t, F1, F1 + 2)
    s = { job: KEY_F, titles: ['THE CAREER', 'JOBS 1–5 · 1968–1975', 'SHEET 6/6'], chrome: career, key: Math.min(ramp(t, F0, F0 + 1.2), 1 - career) }
  }
  return { svg: sheet({ c, uid, time: t, score, body: body + top, ...s }), label: 'Conman' }
}

/* ── The opening and the end card ────────────────────────────────────── */

const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2)
const easeOut = (u) => 1 - (1 - u) ** 3
function openingSvg(time, uid) {
  const O = OPENING
  const black = 1 - ramp(time, ...O.reveal)
  if (black <= 0.001) return ''
  const markOn = 1 - ramp(time, ...O.markOut)
  const mark = time >= O.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${PAPER}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(time - O.mark, MARK_DRAW.done), `${uid}-mark`)}</g>`
    : ''
  const title = time >= O.title[0] ? drawLines(TITLES.conman, easeInOut(ramp(time, ...O.title)), PAPER, `${uid}-title`) : ''
  return `<g opacity="${r(easeInOut(black), 4)}"><rect width="1600" height="900" fill="${INK}"/>${mark}${title}</g>`
}

/** The film, with one of the finales. */
function filmWith(finale) {
  const film = ({ time, score, lockup = '', uid = 'film' }) => {
    if (time >= END_CARD) {
      return { label: 'End card', svg: `<rect width="1600" height="900" fill="${END_BLACK}"/><g transform="translate(800 450) scale(${r(500 / 918, 5)}) translate(-459 -309.5)" style="color:${END_INK}">${lockup}</g>` }
    }
    let f
    if (time < 42.3) f = motionOrbit({ time, score, uid })
    else if (time < 77) f = seqBridge({ time, score, uid })
    else if (time < T3) f = chaseAbove({ time, score, uid })
    else f = later({ time, score, uid }, finale)
    return time < OPENING.reveal[1] ? { ...f, svg: f.svg + openingSvg(time, uid), label: 'Opening' } : f
  }
  /** Seconds an export holds on the end card after the record. */
  film.hold = 4
  return film
}
/** The film on the page. */
export const conmanFilm = filmWith(FINALES.c)
/** The end chaos three ways, for the page's motion tests: the last five seconds of the heist through to the end. */
export const FINALE_TESTS = Object.entries(FINALES).filter(([key]) => key !== 'c').map(([key, f]) => ({ key, label: f.label, film: filmWith(f) }))
export const FINALE_WINDOW = { from: 183, to: 236.1 }

/** For the page: the moments to jump to. */
export const FILM_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 14, label: 'Heist 1 · the record shop' },
  { at: 42, label: 'Over the bridge' },
  { at: 55, label: 'Heist 2 · the counting house', key: true },
  { at: 76, label: 'Police chase 1' },
  { at: 98, label: 'Heist 3 · the studio' },
  { at: 121, label: 'Chase 2 · the garage' },
  { at: 139, label: 'Heist 4 · the museum', key: true },
  { at: 158, label: 'Down High Street' },
  { at: 164, label: 'Heist 5 · the concert hall' },
  { at: 187, label: 'The final chase', key: true },
  { at: 222, label: 'The anchor' },
]
void COVER_SHEET
void lerp
