/*
 * Conman on the Portland map — everything between and around the heists
 * (2026-11-10): the red car, the two chases, the police at the museum and
 * the hall, the four arrests and No. 1's run. Routes and times only; the
 * machinery is travel.mjs and the picture is heists.mjs.
 *
 * No car is drawn (the user, 2026-11-12: "replace all of the cars (conmen
 * and police) with the original dots"). Whoever drives is his own dot, as in
 * the old film: the red car is No. 1 on the first drive and No. 4, the
 * driver, on the way to the hall; a police car is a ringed P. The routes and
 * the times are the cars', so "car" below still says who keeps to the
 * streets (the check holds them to it). A dot is on the sheet only while it
 * is somebody: a parked car left nothing behind, so the red dot hands over
 * to the plan's own No. 1 or No. 4 where it stops, and a police dot goes
 * when its officers step away from it or, like any officer, a moment after
 * it gives up.
 *
 * What the user asked for (2026-11-10), as built:
 *
 *   1 → 2   the conman walks back to his car and drives over the Broadway
 *           Bridge to the counting house: one even drive, eased at both ends
 *   chase 1 a police car pulls up nose to nose with the red car as the pair
 *           step out (1:17); two officers after them on foot, east over the
 *           Burnside Bridge, north and east; they are lost round a corner
 *           and the pair lie low in a park, then walk to the studio
 *   chase 2 all three are out of the studio by 2:04; a police car pulls up
 *           at the front; they split three ways (north through a park the
 *           car cannot cross, south, east) and cross the river by three
 *           different bridges to meet at the museum
 *   museum  a police car comes up the drive as they finish; two officers go
 *           in at the front and find nothing, and the red car slips out past
 *           their empty car
 *   4 → 5   the red car down Burnside to the hall, arriving as the camera does
 *   hall    2:55 two police cars; No. 4 (the driver) is taken at his car and
 *           is gone by 2:57; 2:58–3:04 five officers walk round to the five
 *           doors; 3:08 they go in and the four go out the ways they came in
 *   after   No. 5 caught in the trees east of the hall (3:14), No. 3 south
 *           of it (3:22), No. 2 cornered three blocks north (3:27); No. 1
 *           runs the whole town, faster as the camera pulls out, shaking
 *           police cars at every park and at the footbridge, still running
 *           at the end card
 *
 * Rules every route keeps (checked by tools/video-styles/conman-explore/
 * check-routes.mjs): nobody in the water except on a bridge; nobody through
 * a building (a heist's own building only by its doors, flagged 'in'); no
 * car in a park or on the footbridge.
 */
import * as C from './city.mjs'
import { leg, paced, route, behind, line } from './travel.mjs'
import { O1, O3, O4, O5, T, zoomS, viewAt } from './camera.mjs'

const at = (o) => (x, y, flag) => (flag ? [o[0] + x, o[1] + y, flag] : [o[0] + x, o[1] + y])
const S1 = at(O1)
const HALL_S = 8.6
const S3 = at(O3)
const M = at(O4)
const H = at(O5)
/** A point in the hall's house: degrees and metres about centre stage. */
const IN = (deg, R, flag) => H(R * Math.cos((deg * Math.PI) / 180), 15 + R * Math.sin((deg * Math.PI) / 180), flag)
/** The same points, every step of them inside the building. */
const inside = (pts) => pts.map((p, i) => (i ? [p[0], p[1], p[2] ?? 'in'] : p))
/** The way back out of a building: the same points the other way, and on to `then`. */
const backOut = (pts, ...then) => [...inside(pts.slice().reverse().map((p) => [p[0], p[1]])), ...then]

/** West Burnside where it winds up into the hills, east to west, as far as the museum's drive. */
const BURN_W = C.ROADS.find((rd) => rd.name === 'burnside' && rd.pts.length > 2).pts.filter((p) => p[0] > -1112)
const RING_S = [O4[0], O4[1] + C.RING_R]
/** The ring road round the museum, from the east point clockwise to the south. */
const RING_E_TO_S = Array.from({ length: 10 }, (_, i) => { const a = (i / 9) * (Math.PI / 2); return [O4[0] + C.RING_R * Math.cos(a), O4[1] + C.RING_R * Math.sin(a)] })

/* ── A trip ──────────────────────────────────────────────────────────── */

/*
 * From one place to another between two times, at an even speed, but never
 * faster on the sheet than `px` pixels a second: so close to a plan, where
 * a metre is twenty pixels, a car pulls away gently and pulls up gently, and
 * out on the wide view it travels. (The user, 2026-11-10: "they should speed
 * up/slow down naturally and not seem too rushed when arriving".) `a` and
 * `b` are the seconds it takes to get going and to stop.
 */
function trip(pts, t0, t1, { px = 260, a = 0.8, b = 0.7 } = {}) {
  const ln = line(pts)
  const dt = 0.02
  const n = Math.max(1, Math.round((t1 - t0) / dt))
  const mid = (i) => t0 + (i + 0.5) * dt
  const shape = Array.from({ length: n }, (_, i) => Math.min(1, (mid(i) - t0) / a, (t1 - mid(i)) / b))
  const lim = Array.from({ length: n }, (_, i) => px / viewAt(mid(i)).s)
  const total = (vmax) => lim.reduce((d, l, i) => d + Math.min(vmax, l) * shape[i] * dt, 0)
  let vmax = Infinity
  if (total(Infinity) > ln.L) {
    let [lo, hi] = [0, 3000]
    for (let j = 0; j < 44; j++) { const m = (lo + hi) / 2; if (total(m) < ln.L) lo = m; else hi = m }
    vmax = hi
  }
  const table = [0]
  for (let i = 0; i < n; i++) table.push(table[i] + Math.min(vmax, lim[i]) * shape[i] * dt)
  const k = ln.L / table[n] // exact, and faster than `px` only if there is no other way to be on time
  return paced(pts, t0, t1, (t) => { const x = Math.max(0, Math.min(n, (t - t0) / dt)); const i = Math.min(n - 1, Math.floor(x)); return k * (table[i] + (table[i + 1] - table[i]) * (x - i)) })
}

/* ── The red car ─────────────────────────────────────────────────────── */

const CAR1_PARK = S1(-10, 33) // on the side street, south of the corner: where heist 1's own route for No. 1 begins and ends
const CAR1_AT_2 = [-296.7, -3] // in the street at the counting house's door (the car ran on past it to park; a dot would only have to come back)
const DRIVE12 = [CAR1_PARK, [-240, -562], [-80, -562], [-80, -305], [-205, -195], [-240, -160], [-240, -3], CAR1_AT_2]
const car1in = route(leg([[-240, -610], CAR1_PARK], 16.4, 18.4, 0.5, 1.2))
const car1 = route(trip(DRIVE12, ...T.drive12, { a: 1.2, b: 1.0 }))

const BAY = M(58.4, 0)
const HALL_STOP = H(0, -4.3) // where the driver's part in the hall begins
const DRIVE45 = [BAY, [...RING_E_TO_S[0], 'in'], ...RING_E_TO_S.slice(1), [O4[0] + 3, RING_S[1] + 4], [O4[0] + 3, 78], ...BURN_W.slice().reverse().map(([x, y]) => [x, y - 3]), [-770, -5], [396, -5], [400, 6], HALL_STOP]
const car2 = route(
  trip(DRIVE45, ...T.car45, { a: 0.6, b: 0.7 }),
  // In the hall the driver moves it along the lane and waits with it (heist 5's own route for No. 4).
  paced([HALL_STOP, H(-40, -7.8)], 165.45, 168.5, (t) => ((t - 165.45) / 3.05) * 40.2),
)

/* ── Chase 1: over the Burnside Bridge, north and east, into the park ── */

const A1 = [[-296.7, -2], [158, -2], [158, -82], [238, -82], [238, -322], [318, -322], [318, -402], [292, -452]]
const A2 = [[-275.4, -2], [-262, 2], [162, 2], [162, -78], [242, -78], [242, -318], [322, -318], [322, -402], [304, -446]]
const B1 = [[292, -452], [396, -556], [398, -644], [736, -644], S3(-4, 34.4)]
const B2 = [[304, -446], [402, -552], [402, -640], [736, -640], S3(-3.4, 35.6)]
const run1 = route(trip(A1, T.chase1, T.hide1[0] - 0.1, { b: 0.9 }), trip(B1, T.hide1[1], T.atStudio, { a: 1.0 }))
const run2 = route(trip(A2, T.chase1 + 0.15, T.hide1[0], { b: 0.9 }), trip(B2, T.hide1[1] + 0.15, T.atStudio + 0.1, { a: 1.0 }))
const pc1 = route(leg([[-470, -3], [-318.8, -3]], 76.3, 77.8, 0.3, 0.9)) // nose to nose with the red car
/** Two officers out of the car and after them; they lose them at the last corner and run on east. */
const A1_CORNER = line(A1).cum[5]
const officer1 = (lead, extra) => {
  const b = behind(route(run1.legs[0]), { lag: (t) => 44 + extra + 6.5 * (t - T.chase1), d1: A1_CORNER, lead })
  const t = b.legs[0].t1
  return route(...b.legs, leg([A1[5], [640 - extra, -322]], t, t + 4.4, 0.1, 2.4))
}
const cop1a = officer1([[-320, 0.4], [-309, 1.2], A1[0]], 0)
const cop1b = officer1([[-322, -6.4], [-316, -7], [-305, -6.6], A1[0]], 13)

/* ── Chase 2: three ways from the studio, three bridges, the museum ──── */

const UP_TO_MUSEUM = (dy, door) => [...BURN_W.map(([x, y]) => [x, y + dy]), [O4[0] + dy / 2, 80 + dy], [O4[0] + dy / 2, RING_S[1] + 2], door]
/** No. 1 north, through a park the police car cannot cross, then west and over the Broadway Bridge. */
const R1 = [S3(57.6, 19.4), [802, -802], [642, -802], [624, -796], [496, -736], [482, -722], [482, -562], [82, -562], [82, -322], [-20, -322], [-80, -306], [-205, -196], [-242, -162], [-642, -162], [-642, -4], ...UP_TO_MUSEUM(-4, M(0.6, 50))]
/** No. 2 south down the lane, west, and over the Steel Bridge. */
const R2 = [S3(60, 18.2), [802, -482], [562, -482], [562, -162], [-162, -162], [-162, 4], ...UP_TO_MUSEUM(4, M(1.6, 51))]
/** No. 3 east from the front door, south, and all the way along Burnside. */
const R3 = [S3(7, 41), [878, -641], [878, 0], ...UP_TO_MUSEUM(0, M(-1.6, 51))]
/*
 * The camera watches them until it leaves for the museum (it is past them
 * by SEEN_TO); while it does they run at chase 1's kind of pace. The rest of
 * the way, unseen, takes what time is left: the line is there for the last
 * pull-out, and they are standing at the museum when the camera lands.
 */
const SEEN_TO = 136.0
const PACE_2 = 135
const flee = (pts, t0, t1) => {
  const ln = line(pts)
  const d = PACE_2 * (SEEN_TO - t0 - 0.8)
  return route(trip(ln.part(0, d), t0, SEEN_TO, { b: 0.001 }), leg(ln.part(d, ln.L), SEEN_TO, t1, 0, 1.0))
}
const flee1 = flee(R1, T.out3 + 0.1, T.atMuseum)
const flee2 = flee(R2, T.out3 + 0.15, T.atMuseum + 0.1)
const flee3 = flee(R3, T.out3 - 0.1, T.atMuseum + 0.05)
const PC2_STOP = [728, -638]
const pc2Arrive = leg([[560, -638], PC2_STOP], 121.7, 123.4, 0.3, 0.9)
/** The car goes after No. 1 and is stopped by the park. */
const pc2Chase = behind(flee1, { lag: (t) => Math.max(55, 100 - 60 * (t - T.out3 - 0.1)), d1: line(R1).cum[2] - 4, lead: [PC2_STOP, [798, -639], R1[0]] })
const pc2 = route(pc2Arrive, ...pc2Chase.legs)
/** One officer after No. 3 as far as Burnside, one after No. 2 as far as the Steel Bridge's street; both fall behind. */
const cop2a = behind(flee3, { lag: (t) => 22 + 15 * (t - T.out3), d1: line(R3).cum[2], lead: [[733, -642], R3[0]] })
const cop2b = behind(flee2, { lag: (t) => 20 + 15 * (t - T.out3), d0: 34, d1: line(R2).cum[3], lead: [[735, -636], [792, -638], [802, -630]] })

/* ── The museum: the police come, and find nothing ───────────────────── */

const pc4 = route(leg([...BURN_W.filter((p) => p[0] < -900), [O4[0] - 3, 80], [O4[0] - 3, RING_S[1] + 7]], 153.6, 156.0, 0.2, 1.0))
const cop4a = route(
  leg([[O4[0] - 5.5, RING_S[1] + 4], M(-1, 66), M(-0.6, 37.6)], 156.4, 158.5, 0.4, 0.4),
  leg(inside([M(-0.6, 37.6), M(-0.4, 24), M(-0.4, 11)]), 158.5, 160.0, 0.2, 0.6),
)
const cop4b = route(
  leg([[O4[0] - 0.5, RING_S[1] + 4], M(1, 66), M(0.8, 37.6)], 156.6, 158.8, 0.4, 0.4),
  leg(inside([M(0.8, 37.6), M(1.2, 30), M(-7, 28.6)]), 158.8, 160.2, 0.2, 0.6),
)

/* ── The hall: two cars, six officers, five doors ────────────────────── */

// One down the street the red car came by, stopping behind it; one along the lane from the east.
const PCA_STOP = H(-28.6, -7.6)
const pcA = route(leg([[400, -60], [400, 74], [393, 80.4], PCA_STOP], 173.3, T.police5, 0.3, 1.0)) // he waits there, and is the one who goes after No. 2 (copDriverA)
const pcB = route(leg([[570, 79.4], H(66, -8.6)], 174.3, 175.8, 0.3, 1.0)) // he waits there, and is the one who goes looking down the east side (copDriverB)
const [POST0, POST1] = T.posts
const post = (pts, out, t1 = POST1) => leg(pts, POST0 + out, t1, 0.8, 1.0)
/** The one who takes the driver. */
const copArrest = route(leg([H(-31, -4.4), H(-37, -5.2)], 175.3, T.arrest4[0], 0.2, 0.3))
// Round to the doors: the stage door, the two yard doors, the two front doors.
const N0 = [H(-25, -11.2), H(-12, -12), H(1.6, -5), H(3.6, -1.6)]
const W0 = [H(-32, -11.4), H(-45, -12.6), H(-50, -5), H(-44, 2), H(-35, 9), H(-31.8, 18), H(-28.6, 19.8)]
const FW0 = [H(-24, -4.2), H(-50, -3.2), H(-56, 20), H(-48, 41), H(-31, 57), H(-17.8, 61.6)]
const E0 = [H(63, -4.6), H(48, 2), H(36, 10), H(31.8, 18), H(28.6, 19.8)]
const FE0 = [H(69, -4.6), H(60, 20), H(50, 41), H(33, 56.5), H(18, 61.6)]
const R0 = T.raid
// In at 3:08.
const N_IN = inside([N0.at(-1), H(0, 0.6), H(0, 4), H(-0.6, 11)])
const W_IN = inside([W0.at(-1), H(-25.7, 16), H(-25.7, 11.5), H(-20, 8.2), H(-17, 7.6), H(-11, 8.4)])
const E_IN = inside([E0.at(-1), H(25.7, 16), H(25.7, 11.5), H(20, 8.2), H(17, 7.6), H(12, 6.8)])
const FE_IN = inside([FE0.at(-1), IN(71.8, 45), IN(71.4, 42.3), IN(71, 39.5), IN(71, 30), IN(71, 9)])
const FW_IN = inside([FW0.at(-1), IN(108.2, 45), IN(108.6, 42.3), IN(109, 39.5), IN(109, 30), IN(109, 9)])
const FRONT_E = IN(71.8, 49)
const FRONT_W = IN(108.2, 49)

/* ── The four after 3:08 ─────────────────────────────────────────────── */

// No. 5, the stagehand: out of the stage door behind the officer, east, into the trees beside the hall.
const RUN5 = [H(-1.4, -4), [436, 84.5], [446, 96], [458, 112], [447, 126], [462, 140], [452, 152]]
const flee5 = route(
  leg(inside([H(12.6, 8.6), H(10.4, 6.6), H(3, 6.6), H(-1.4, 3), H(-1.4, 0.4), H(-1.4, -4)]), R0 + 0.3, R0 + 1.5, 0.2, 0.1),
  leg(RUN5, R0 + 1.5, T.arrest5 - 0.1, 0.3, 0.3),
)
// The officer from the east yard door comes back out as he passes, and has him.
const copE = route(
  leg(E0, POST0 + 0.3, POST1, 0.8, 1.0),
  leg(E_IN, R0, R0 + 1.5, 0.2, 0.3),
  leg(backOut(E_IN), R0 + 1.8, R0 + 2.8, 0.2, 0.2),
  leg([E0.at(-1), [440, 110], [452, 120], [450, 128], [460, 138], [455.4, 149.2]], R0 + 2.8, T.arrest5 - 0.05, 0.3, 0.2),
)

// No. 3, the engineer: up the fly tower, down the east side, hides among the trees, flushed out and boxed in on the lawn.
const HIDE3 = [456, 196]
const CAUGHT3 = [408, 208]
const HID3 = [R0 + 5.0, T.arrest3 - 2.5]
const flee3b = route(
  leg(inside([H(14, 5.2), H(12, 4.5)]), R0, R0 + 0.3, 0.1, 0.1),
  leg([H(12, 4.5), H(38, -4, 'jump')], R0 + 0.3, R0 + 1.2, 0.3, 0.3),
  leg([H(38, -4), [443, 98], [452, 110], [466, 124], [470, 150], [464, 176], HIDE3], R0 + 1.25, HID3[0], 0.3, 0.8),
  leg([HIDE3, [440, 206], [420, 210], CAUGHT3], HID3[1], T.arrest3 - 0.15, 0.3, 0.4),
)
// The second car's driver goes looking down the east side; the officer from the front-west door cuts him off.
const PCB_STOP = H(66, -8.6)
const copDriverB = route(
  leg([PCB_STOP, H(63, -5.4), [468, 110], [470, 150], [463, 181]], R0 + 4.8, HID3[1] - 0.2, 0.6, 1.2),
  leg([[463, 181], [452, 198], [430, 209], [412.6, 208.8]], HID3[1], T.arrest3, 0.3, 0.3),
)
const copFW = route(
  leg(FW0, POST0 + 0.2, POST1, 0.8, 1.0),
  leg(FW_IN, R0, R0 + 2.2, 0.2, 0.4),
  leg(backOut(FW_IN.slice(1), FRONT_W), R0 + 2.6, R0 + 4.6, 0.3, 0.5),
  leg([FRONT_W, [388, 176], [398, 200], [403.6, 206.4]], HID3[1] + 0.3, T.arrest3 - 0.1, 0.4, 0.3),
)

// No. 2, the auditor: down the trap, up in the park, west along the lane and north by the streets, cornered on the third.
const RUN2 = [H(-45, 30), [338, 104], [326, 88], [244, 84], [242, 4], [164, 2], [162, -76], [296, -78]]
const flee2b = route(
  leg(inside([H(-12, 8), H(-6, 10.5), H(-1.2, 15.6)]), R0, R0 + 0.7, 0.1, 0.1),
  leg([H(-1.2, 15.6), H(-45, 30, 'jump')], R0 + 0.7, R0 + 1.5, 0.3, 0.3),
  leg(RUN2, R0 + 1.5, T.arrest2 - 0.2, 0.4, 0.8),
)
/** The first car's driver after him on foot, and a car across the street ahead. */
const copDriverA = (() => {
  const run = route(flee2b.legs[2])
  return behind(run, { lag: (t) => Math.max(7, Math.min(26, 26 - 14 * (t - (T.arrest2 - 1.6)))), d0: line(RUN2).cum[2], lead: [PCA_STOP, [368, 83.8], RUN2[2]] })
})()
const pcD = route(leg([[640, -78], [318, -78]], T.arrest2 - 2.9, T.arrest2 - 0.4, 0.3, 1.2))

/* ── No. 1 ───────────────────────────────────────────────────────────── */

/*
 * Off the stage, up the middle of the house over the seats while the two
 * officers come down the aisles either side of him, along the back row to
 * the door they came in by, and out. Then all over the town. His speed is
 * the camera's: about SCREEN pixels a second on the sheet, so he covers
 * ground faster and faster as the view widens, up to TOP metres a second.
 */
const SCREEN = 200
const TOP = 420
const OUT1 = R0 + 3.2
/** The west bank's park: the riverside from the Steel Bridge down to the Hawthorne, twenty metres in from the water. */
const WATERFRONT = C.WEST_BANK.filter((p) => p[1] > -146 && p[1] < 296).reverse().filter((_, i) => i % 2 === 0).map(([x, y]) => [x - 22, y])
const LADD_ROUND = [[424, 411], [421, 392], [436, 379], [456, 386]] // half round the circle
const TOUR = [
  FRONT_E, [404, 158], [372, 170], [338, 166], [322, 160], [160, 160], [160, 240], [320, 240], [331, 232], [352, 196], [392, 172], [440, 176], [471, 190], [480, 196],
  [480, 240], [640, 240], [640, 0], [640, -80], [480, -80], [480, -320], [400, -320], [400, -400], [330, -470], [250, -410], [240, -400], [240, -320],
  [-20, -320], [-80, -305], [-205, -195], [-240, -160], [-150, -160], ...WATERFRONT,
]
const TOUR_EAST = [
  [101, 557], [160, 558], [320, 560], [320, 480], ...LADD_ROUND, [560, 320], [640, 320], [640, 240], [720, 240], [720, 160], [880, 160], [1040, 0],
  [1040, -80], [1120, -80], [1120, -160], [1200, -160], [1200, -240], [1280, -240], [1280, -320], [1600, -320], [1600, 0], [1520, 0], [1520, 160], [1600, 160], [1600, 290],
  [1680, 400], [1740, 456], [1740, 480], [1280, 480], [1280, 240], [960, 240], [960, 400], [800, 400], [800, 560], [1120, 560], [1120, 640], [1440, 640], [1440, 800], [1760, 800],
]
/** From the riverside park to the footbridge, and over it. */
const TO_FOOTBRIDGE = [[-125.4, 313.7], [-161.6, 413.3], [-189, 488.5], [-205, 556], [-112, 552], [-110, 548], [100, 528]]
const TOUR_ALL = [...TOUR, ...TO_FOOTBRIDGE, ...TOUR_EAST]
const tourLine = line(TOUR_ALL)
/** Metres run by t, from the front door. */
const RAN = (() => {
  const dt = 0.02
  const table = [0]
  for (let t = OUT1; t < T.end + 1; t += dt) table.push(table.at(-1) + Math.min(TOP, SCREEN / zoomS(t)) * dt)
  return (t) => {
    const k = Math.max(0, (t - OUT1) / dt)
    const i = Math.min(table.length - 2, Math.floor(k))
    return table[i] + (table[i + 1] - table[i]) * (k - i)
  }
})()
export const TOUR_ROOM = tourLine.L - RAN(T.end)
const flee1b = route(
  leg(inside([H(0, 12), H(0, 19.2)]), R0, R0 + 0.5, 0.1, 0.1),
  leg([H(0, 19.2), H(0, 52, 'jump')], R0 + 0.5, R0 + 1.9, 0.3, 0.3),
  leg([...inside([H(0, 52), IN(82, 38.2), IN(74, 38.4), IN(71, 39.5), IN(71.6, 42.4), IN(71.8, 45)]), FRONT_E], R0 + 1.9, OUT1, 0.2, 0.1),
  paced(TOUR_ALL, OUT1, T.end + 0.5, RAN),
)
const tour = route(flee1b.legs[3])
const speed1 = (t) => Math.min(TOP, SCREEN / zoomS(t))
/** A police car on his tail from one point of his tour (by index) to the next place it cannot follow (metres along the tour). */
const tail = (i0, d1, lead, back = 0.42) => behind(tour, { lag: (t) => Math.max(34, back * speed1(t)), d0: tourLine.cum[i0], d1, lead: [...lead, TOUR_ALL[i0]] })
const ix = (x, y) => { const i = TOUR_ALL.findIndex((p) => p[0] === x && p[1] === y); if (i < 0) throw new Error(`tour has no ${x},${y}`); return i }
/** Metres along the tour at one of its points, and `plus` beyond it. */
const D = (x, y, plus = 0) => tourLine.cum[ix(x, y)] + plus
const TAILS = [
  tail(ix(160, 160), D(320, 240, -2), [[160, 40]]), // down the avenue at him; left at the hall's park
  tail(ix(480, 240), D(640, 240, 80), [[480, 90]], 0.5), // down the street behind him; left at the next park
  tail(ix(640, 0), D(400, -400, -2), [[800, 0]]), // off Burnside; left at the park in the north-east
  tail(ix(240, -320), D(-150, -160, -6), [[240, -160]]), // over the Broadway Bridge behind him; left at the riverside
  tail(ix(-161.6, 413.3), D(-110, 548, -4), [[-236.8, 385.9]], 0.5), // through downtown; stopped by the footbridge
  tail(ix(160, 558), D(880, 160, -2), [[160, 400]]), // waiting on the east bank; left at the park
  tail(ix(1040, 0), D(1600, 290, -4), [[1040, -160]]), // two of them out to the hill
  tail(ix(1040, 0), D(1600, 290, -16), [[1200, 0]], 0.75),
  tail(ix(1740, 480), Infinity, [[1900, 480]]), // and two still behind him at the end
  tail(ix(1280, 240), Infinity, [[1280, 80]], 0.8),
]
// The officer from the front-east door, back up the aisle and out after him across the lawn, falling behind.
const copFE = route(
  leg(FE0, POST0 + 0.3, POST1, 0.8, 1.0),
  leg(FE_IN, R0, R0 + 2.2, 0.2, 0.4),
  leg(backOut(FE_IN.slice(1), FRONT_E), R0 + 2.5, R0 + 4.3, 0.3, 0.2),
  leg([FRONT_E, [404, 158], [372, 170], [338, 166], [324, 161]], R0 + 4.3, R0 + 8.4, 0.3, 1.4),
)
const copN = route(leg(N0, POST0, POST1, 0.8, 1.0), leg(N_IN, R0, R0 + 1.2, 0.2, 0.4))
const copW = route(leg(W0, POST0 + 0.4, POST1, 0.8, 1.0), leg(W_IN, R0, R0 + 1.6, 0.2, 0.4))

/* ── Everyone, for the picture and for the checker ───────────────────── */

/*
 * kind   'crew' (a numbered red head and a red trail), 'car' (the red car:
 *        its driver's numbered red head, with a trail), 'cop' (a ringed P),
 *        'copcar' (a police car: a ringed P)
 * show   [from, to]: when the head is on the sheet
 * fade   seconds it takes to come and go at those times: [in, out]
 * hide   [from, to]: lying low (a dashed ring instead of a head)
 * sRef   pixels a metre at which the trail's dashes are their usual length
 */
const crew = (id, n, style, r, show, more = {}) => ({ id, kind: 'crew', n, style, route: r, show, sRef: 1, ...more })
const cop = (id, r, show, more = {}) => ({ id, kind: 'cop', route: r, show, fade: [0.3, 0.8], ...more })
const copcar = (id, r, show, more = {}) => ({ id, kind: 'copcar', route: r, show, fade: [0.2, 0.8], ...more })
/** A police dot whose officers step away from it at `out`: it goes as they come. */
const dropsOff = (id, r, from, out) => copcar(id, r, [from, out + 0.3], { fade: [0.2, 0.3] })

const walk12 = route(leg([CAR1_AT_2, [-296.7, -7]], 54.5, T.atDoor2, 0.3, 0.4))
const driverOut = route(leg([H(-40, -7.8), H(-40, -7.79)], T.arrest4[1], T.arrest4[2], 0, 0))

export const MOVERS = [
  // The first drive: No. 1 up the side street to heist 1 (the plan's own No. 1 from there), then from heist 1 to heist 2.
  { id: 'car1in', kind: 'car', n: 1, route: car1in, show: [16.4, T.atShop] },
  { id: 'car1', kind: 'car', n: 1, route: car1, show: [T.inCar1, 54.5] },
  crew('walk12', 1, 'solid', walk12, [54.5, 55.6], { sRef: 19 }),
  // Chase 1.
  dropsOff('pc1', pc1, 76.3, 77.95),
  cop('cop1a', cop1a, [77.95, cop1a.to + 1.6]),
  cop('cop1b', cop1b, [77.95, cop1b.to + 1.6]),
  crew('run1', 1, 'solid', run1, [T.chase1, 98.4], { hide: T.hide1, sRef: 1.2 }),
  crew('run2', 2, 'dash', run2, [T.chase1, 98.4], { hide: [T.hide1[0] + 0.1, T.hide1[1] + 0.15], sRef: 1.2 }),
  // Chase 2.
  copcar('pc2', pc2, [121.7, pc2.to + 1.2]),
  cop('cop2a', cop2a, [123.45, cop2a.to + 1.2]),
  cop('cop2b', cop2b, [123.45, cop2b.to + 1.2]),
  crew('flee1', 1, 'solid', flee1, [T.out3 + 0.1, 139.2]),
  crew('flee2', 2, 'dash', flee2, [T.out3 + 0.15, 139.2]),
  crew('flee3', 3, 'dot', flee3, [T.out3 - 0.1, 139.2]),
  // The museum.
  dropsOff('pc4', pc4, 153.6, 156.5),
  cop('cop4a', cop4a, [156.3, 165]),
  cop('cop4b', cop4b, [156.5, 165]),
  // The second drive: No. 4, the driver, from the museum's bay to the hall (the hall's own No. 4 from 165.45, where he is taken).
  { id: 'car2', kind: 'car', n: 4, route: car2, show: [T.car45[0] - 0.1, 165.45] },
  // The hall.
  copcar('pcA', pcA, [173.5, copDriverA.from], { fade: [0.2, 0] }),
  copcar('pcB', pcB, [174.3, R0 + 4.8], { fade: [0.2, 0] }),
  cop('copArrest', copArrest, [175.2, T.arrest4[2]], { fade: [0.2, T.arrest4[2] - T.arrest4[1]] }),
  crew('driver', 4, 'dot', driverOut, [T.arrest4[1], T.arrest4[2]], { fade: [0, T.arrest4[2] - T.arrest4[1]], trail: false, sRef: HALL_S }),
  cop('copN', copN, [175.2, 199], { fade: [0.2, 2] }),
  cop('copW', copW, [175.2, 199], { fade: [0.2, 2] }),
  cop('copFW', copFW, [175.2, T.arrest3 + 1.6]),
  cop('copE', copE, [176.0, T.arrest5 + 1.6]),
  cop('copFE', copFE, [176.0, R0 + 10.4]),
  // After 3:08.
  crew('flee5', 5, 'dash', flee5, [R0, T.arrest5 + 1.6], { fade: [0, 0.8], sRef: 5 }),
  crew('flee3b', 3, 'dashdot', flee3b, [R0, T.arrest3 + 1.6], { fade: [0, 0.8], hide: HID3, sRef: 4 }),
  cop('copDriverB', copDriverB, [R0 + 4.8, T.arrest3 + 1.6], { fade: [0, 0.8] }),
  crew('flee2b', 2, 'longdash', flee2b, [R0, T.arrest2 + 1.6], { fade: [0, 0.8], sRef: 3 }),
  cop('copDriverA', copDriverA, [copDriverA.from, T.arrest2 + 1.6], { fade: [0, 0.8] }),
  copcar('pcD', pcD, [T.arrest2 - 2.9, T.arrest2 + 1.6]),
  crew('flee1b', 1, 'solid', flee1b, [R0, Infinity]),
  ...TAILS.map((r, i) => copcar(`tail${i}`, r, [r.from, r.to + 1.6])),
]

