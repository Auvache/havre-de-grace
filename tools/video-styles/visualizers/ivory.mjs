/*
 * Ivory — ten ways to draw it again (2026-11-10).
 *
 * Track four. He is in the crowd, she is on stage, and he falls for her in an
 * instant; after the show he goes to talk to her and misses his chance.
 * "Ivory" is his name for her: he never learns her real one.
 *
 * The first film (shared/video/films/blanks.mjs) played a five-letter guessing
 * game on three tiled boards. The person watching liked the game and not the
 * boards, and asked for ten alternatives in the plain manner of the maze and
 * the Conman map: paper, black line, one red thing that travels. Six of these
 * are new pictures of the story; four are the guessing game again, in pencil
 * on paper instead of on a board.
 *
 * One still each. Every concept is a real function of the song's clock, so the
 * still is a true moment: what would have happened by then is drawn.
 *
 * Second ink: butterfly blue, and only ever for her.
 */
import { PLATE, CX, CY, INK, PAPER, RED, SECOND_INK } from './sheet.mjs'
import { rng, r, t as type, clamp01, lerp, ramp, easeOut, easeInOut, advance } from '../../../shared/video/kit.mjs'
import { LAND_FINE, LAKES } from '../../../shared/video/geo/earth.mjs'

const BLUE = SECOND_INK.ivory
const PENCIL = '#6f675b'
const X0 = PLATE.x
const Y0 = PLATE.y
const X1 = PLATE.x + PLATE.w
const Y1 = PLATE.y + PLATE.h
const TAU = Math.PI * 2
const frac = (v) => v - Math.floor(v)
const hash2 = (a, b) => frac(Math.sin(a * 127.1 + b * 311.7) * 43758.5453)

/* ── Reading the score ────────────────────────────────────────────── */

const clean = (s) => s.replace(/[^a-z]/gi, '').toUpperCase()

/** When `text` is sung in line `li` (its last occurrence there). */
function wordT(score, li, text) {
  const line = score.lines[li]
  const hit = line?.words.filter((w) => clean(w.text) === text).at(-1)
  if (!hit) throw new Error(`ivory: no "${text}" in line ${li} (${line?.text})`)
  return hit.t
}

/** Every "Ivory" he sings. */
const ivories = (score) => score.lines.flatMap((l) => l.words.filter((w) => clean(w.text) === 'IVORY').map((w) => w.t))

const memo = (build) => {
  const cache = new WeakMap()
  return (score) => {
    if (!cache.has(score)) cache.set(score, build(score))
    return cache.get(score)
  }
}

/* The five-letter words he sings, in order, as [word, line]. IVORY is his answer every time. */
const GUESSES = [
  ['WOMAN', 0], ['SHORE', 1], ['OCEAN', 2], ['WINGS', 2], ['STAGE', 3], ['IVORY', 4],
  ['LOOKS', 5], ['IVORY', 7],
  ['WOMAN', 8], ['MOVES', 9], ['STARE', 9], ['RIGHT', 10], ['WHERE', 10], ['ASKED', 11], ['IVORY', 12],
  ['AVOID', 14], ['IVORY', 15],
  ['COULD', 16], ['LOVES', 16], ['ASKED', 17], ['IVORY', 18],
  ['LOOKS', 19], ['WALKS', 20], ['AVOID', 22], ['IVORY', 23], ['IVORY', 24],
]
const guesses = memo((score) => GUESSES.map(([word, li], i) => ({ word, i, t0: wordT(score, li, word) })))

/* ── Drawing helpers ──────────────────────────────────────────────── */

const pt = (p) => `${r(p[0])} ${r(p[1])}`
const poly = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${pt(p)}`).join('')
/** A polyline joined with quadratics through its midpoints: same ends, no corners. */
function smooth(pts) {
  if (pts.length < 3) return poly(pts)
  let d = `M${pt(pts[0])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]
    d += `Q${pt(pts[i])} ${pt(i === pts.length - 2 ? pts[i + 1] : m)}`
  }
  return d
}
const dot = (x, y, rad, fill, o = 1) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rad)}" fill="${fill}"${o < 0.999 ? ` opacity="${r(o, 3)}"` : ''}/>`
const stroke = (d, colour, w, extra = '') => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`
const plate = (fill = PAPER) => `<rect x="${X0}" y="${Y0}" width="${PLATE.w}" height="${PLATE.h}" fill="${fill}"/>`

/** Where a dot is at `time` on a path of [x, y, t] keys: it waits where two keys share a place. */
function along(keys, time) {
  if (time <= keys[0][2]) return [keys[0][0], keys[0][1]]
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (time <= b[2]) {
      const u = easeInOut(ramp(time, a[2], b[2]))
      return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]
    }
  }
  const last = keys.at(-1)
  return [last[0], last[1]]
}
/** The line a dot has drawn by `time`: every key it has passed, then where it is now. */
function trailOf(keys, time) {
  const pts = []
  for (const k of keys) {
    if (k[2] > time) break
    const last = pts.at(-1)
    if (!last || last[0] !== k[0] || last[1] !== k[1]) pts.push([k[0], k[1]])
  }
  const now = along(keys, time)
  const last = pts.at(-1)
  if (!last || Math.hypot(last[0] - now[0], last[1] - now[1]) > 0.5) pts.push(now)
  return pts
}
const distToSeg = (p, a, b) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const u = clamp01(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / Math.max(dx * dx + dy * dy, 1e-6))
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy)
}
const distToPath = (p, keys) => {
  let best = Infinity
  for (let i = 0; i < keys.length - 1; i++) best = Math.min(best, distToSeg(p, keys[i], keys[i + 1]))
  return best
}

/* ══ The Room ═════════════════════════════════════════════════════
 *
 * The venue from above, as a plan. The crowd is ink dots, she is the blue dot
 * on the stage, he is the red dot that came in at the back and is working his
 * way to the front.
 */

/* His way through the room: [x, y, seconds]. He waits where two keys share a place. */
const ROOM_HIM = [
  [1232, 830, 8.6], [1232, 728, 11.4], [1190, 690, 13.6], [1190, 690, 26.6],
  [1150, 662, 28.6], [1104, 640, 30.4], [1070, 596, 32.6], [1038, 568, 35.4], [1038, 568, 45.4],
  [1000, 546, 48.4], [962, 560, 52], [962, 560, 63.6],
  [930, 522, 66], [962, 486, 68.4], [918, 460, 70.8], [882, 472, 73.2], [882, 472, 81.8],
  [860, 424, 83.2], [834, 394, 84.6], [850, 352, 86.2], [816, 322, 88.2], [800, 304, 90.6], [800, 304, 127.8],
  // After the show: along the lip, round by the hall, out to the alley. She has gone.
  [960, 300, 131], [1110, 262, 134.6], [1110, 262, 145], [1200, 300, 150], [1330, 330, 154], [1366, 560, 159],
  [1250, 720, 163], [1232, 830, 166], [1500, 846, 170], [1500, 846, 190],
]
/* Hers: the green room, the stage, the stage door, the alley. */
const ROOM_HER = [
  [1290, 150, 0], [1290, 150, 31.6], [1120, 196, 33.2], [780, 196, 35.2], [780, 196, 137.6],
  [1000, 190, 141.3], [1120, 196, 144], [1290, 150, 147.5], [1290, 150, 150.6], [1420, 150, 152.4], [1496, 150, 153.8],
  [1496, 500, 160], [1496, 860, 166],
]
const ROOM_CROWD = (() => {
  const rand = rng(41)
  const corridor = ROOM_HIM.filter((k) => k[2] <= 128)
  const dots = []
  const blocked = (x, y) =>
    (x < 284 && y > 300) // the bar
    || (x > 700 && x < 880 && y > 626 && y < 716) // the desk
    || (Math.abs(x - 500) < 26 && Math.abs(y - 500) < 26) || (Math.abs(x - 1060) < 26 && Math.abs(y - 500) < 26) // pillars
    || (y < 300 + 46 * Math.cos(((x - 780) / 620) * Math.PI) && x > 440 && x < 1120) // the stage lip
    || (y > 660 && x < 640) // the tables
  for (let tries = 0; tries < 9000 && dots.length < 215; tries++) {
    // Thick at the front, thin at the back.
    const y = 296 + (rand() ** 1.5) * 420
    const spread = lerp(430, 560, (y - 296) / 420)
    const x = 780 + (rand() - 0.5) * 2 * spread
    if (x < 176 || x > 1384 || blocked(x, y)) continue
    if (distToPath([x, y], corridor) < 23) continue
    if (dots.some((d) => Math.hypot(d.x - x, d.y - y) < 25)) continue
    dots.push({ x, y, ph: rand() * TAU, f: 0.6 + rand() * 0.9, out: rand() })
  }
  return dots
})()

function room({ time }) {
  let out = plate()
  const wall = (d) => stroke(d, INK, 6, 'stroke-linecap="square"')
  const thin = (d, o = 1) => stroke(d, INK, 2, o < 1 ? `opacity="${o}"` : '')
  // The shell: the hall, with gaps for the way in (bottom right) and the stage door (right, up by the green room).
  out += wall('M140 70H1420V120 M1420 180V770H1282 M1182 770H140V70')
  // The alley beyond the stage door.
  out += thin('M1560 70V840', 0.5) + thin('M1420 180h-0', 0)
  // Either side of the stage: the store, and the green room with its door onto the stage.
  out += wall('M140 232H400 M470 70V236 M1090 70V150 M1090 210V236 M1150 236H1420')
  // Doors, as a plan draws them: the leaf and its swing.
  out += thin('M1420 120L1372 138 M1372 138A51 51 0 0 1 1420 180', 0.8)
  out += thin('M1182 770L1196 722 M1196 722A50 50 0 0 1 1232 770 M1282 770L1268 722 M1268 722A50 50 0 0 0 1232 770', 0.8)
  out += thin('M400 232L418 280 M418 280A51 51 0 0 0 451 232', 0.8)
  // The stage: its lip, and the step up.
  out += stroke('M470 236Q780 300 1090 236', INK, 4) + thin('M470 246Q780 310 1090 246', 0.6)
  // On it: the riser, two amps, the wedges, and the mark she sings from.
  out += thin('M700 92H860V152H700Z') + thin('M560 104h54v40h-54Z M946 104h54v40h-54Z')
  out += thin('M690 246l34 6l-4 20l-34 -6Z M870 252l34 -6l4 20l-34 6Z', 0.9)
  // The bar and its stools, the desk, two pillars, tables at the back.
  out += thin('M172 330H232V648H172Z') + thin('M184 342H220V636H184Z', 0.5)
  for (let y = 362; y <= 620; y += 43) out += `<circle cx="258" cy="${y}" r="8" fill="none" stroke="${INK}" stroke-width="2"/>`
  out += thin('M716 640H864V702H716Z') + thin('M730 652H850V676H730Z', 0.5)
  out += `<rect x="488" y="488" width="24" height="24" fill="${INK}"/><rect x="1048" y="488" width="24" height="24" fill="${INK}"/>`
  for (const [x, y] of [[352, 706], [470, 716], [580, 722]]) {
    out += `<circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${INK}" stroke-width="2"/>`
    for (let k = 0; k < 4; k++) out += `<circle cx="${r(x + 36 * Math.cos(k * TAU / 4 + 0.6))}" cy="${r(y + 36 * Math.sin(k * TAU / 4 + 0.6))}" r="6" fill="none" stroke="${INK}" stroke-width="1.6"/>`
  }
  // The crowd. It goes home in the interlude.
  let crowd = ''
  for (const d of ROOM_CROWD) {
    const leave = ramp(time, 113 + d.out * 22, 119 + d.out * 22)
    if (leave >= 1) continue
    const x = lerp(d.x, 1232, easeInOut(leave) * 0.9) + 2.2 * Math.sin(time * d.f + d.ph)
    const y = lerp(d.y, 760, easeInOut(leave) * 0.9) + 2.2 * Math.cos(time * d.f * 0.8 + d.ph)
    crowd += `<circle cx="${r(x)}" cy="${r(y)}" r="7.5"/>`
  }
  out += `<g fill="${INK}"${time > 113 ? ` opacity="${r(1 - 0.4 * ramp(time, 113, 140), 2)}"` : ''}>${crowd}</g>`
  // Her light, as a plan would mark it, while she is on the stage.
  const her = along(ROOM_HER, time)
  const lit = Math.min(ramp(time, 34.6, 35.6), 1 - ramp(time, 137.6, 139))
  if (lit > 0) out += `<circle cx="${r(her[0])}" cy="${r(her[1])}" r="52" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="3 9" stroke-linecap="round" opacity="${r(lit, 2)}"/>`
  // His line through them, and the two of them.
  const trail = trailOf(ROOM_HIM, time)
  if (trail.length > 1) out += stroke(smooth(trail), RED, 4, 'opacity="0.9"')
  const him = along(ROOM_HIM, time)
  out += dot(her[0], her[1], 11, BLUE) + dot(him[0], him[1], 11, RED)
  return out
}

/* ══ The Follow Spot ══════════════════════════════════════════════
 *
 * The house lights are down, so the plate is ink. One pool of light, and she
 * is in it. He is the red dot coming up through the dark.
 */
const SPOT_HIM = [
  [1010, 840, 8.6], [1002, 760, 12], [1002, 760, 26.8], [960, 700, 31], [984, 640, 36], [984, 640, 45.6],
  [930, 600, 50], [930, 600, 63.8], [880, 556, 67.4], [900, 506, 71], [856, 470, 74], [856, 470, 81.8],
  [846, 420, 84.4], [820, 392, 87], [820, 392, 127.6],
  // Up the steps at the side when the house has emptied, and across the boards to the edge of her light.
  [716, 392, 129.4], [664, 344, 130.8], [654, 300, 132.2], [0, 0, 134.4], [0, 0, 152],
  [0, 0, 166], [0, 0, 190],
]
const SPOT_STAGE = (x) => 356 - 50 * Math.cos(((x - 800) / 766) * (Math.PI / 2)) // the lip, bowed toward the house
const spotHer = (time) => {
  if (time > 137.4) {
    // She walks off, stage right, out of the light.
    const u = easeInOut(ramp(time, 137.4, 152))
    return [lerp(812, 1640, u), lerp(214, 120, u)]
  }
  const settle = ramp(time, 126, 134)
  const x = 800 + (250 * Math.sin(0.085 * time + 0.9) + 70 * Math.sin(0.27 * time)) * (1 - settle) + 12 * settle
  const y = 196 + 34 * Math.sin(0.12 * time + 2) * (1 - settle) + 18 * settle
  return [x, y]
}
/** The lamp follows her a breath late, and stays where she left it. */
const spotLamp = (time) => {
  const a = spotHer(Math.min(time, 137.4) - 0.5)
  return a
}
const SPOT_CROWD = (() => {
  const rand = rng(88)
  const dots = []
  const corridor = SPOT_HIM.filter((k) => k[2] < 128)
  for (let tries = 0; tries < 9000 && dots.length < 250; tries++) {
    const x = X0 + rand() * PLATE.w
    const y = 380 + (rand() ** 1.3) * 430
    if (y < SPOT_STAGE(x) + 34) continue
    if (distToPath([x, y], corridor) < 24) continue
    if (dots.some((d) => Math.hypot(d.x - x, d.y - y) < 27)) continue
    dots.push({ x, y, ph: rand() * TAU, f: 0.6 + rand() * 0.9, out: rand() })
  }
  return dots
})()
const mixHex = (a, b, u) => {
  const ch = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2].map((i) => Math.round(lerp(ch(a, i), ch(b, i), clamp01(u))).toString(16).padStart(2, '0')).join('')}`
}

function spotlight({ time }) {
  let out = plate(INK)
  const lamp = spotLamp(time)
  const her = spotHer(time)
  const on = Math.min(ramp(time, 26.8, 27.6), 1 - ramp(time, 176, 178.5))
  // His keys on the stage are relative to the light: he stops at its edge, and steps in when she has gone.
  const keys = SPOT_HIM.map((k) => [...k])
  const edge = [lamp[0] - 142, lamp[1] + 50]
  keys[18] = [edge[0], edge[1], 134.4]
  keys[19] = [edge[0], edge[1], 160]
  keys[20] = [lamp[0], lamp[1], 166]
  keys[21] = [lamp[0], lamp[1], 190]
  const him = along(keys, time)
  // The lip of the stage, picked out by the spill.
  let lip = ''
  for (let x = X0; x <= X1; x += 24) lip += `${lip ? 'L' : 'M'}${x} ${r(SPOT_STAGE(x))}`
  out += stroke(lip, PAPER, 2.5, 'opacity="0.42"')
  // The crowd, dark on dark, a little lighter where the light spills.
  for (const d of SPOT_CROWD) {
    const leave = ramp(time, 113 + d.out * 14, 118 + d.out * 14)
    if (leave >= 1 && d.out > 0.4) continue
    const spill = on * Math.exp(-Math.hypot(d.x - lamp[0], d.y - lamp[1]) / 250)
    const x = d.x + 2 * Math.sin(time * d.f + d.ph)
    const y = d.y + 2 * Math.cos(time * d.f * 0.8 + d.ph)
    out += dot(x, y, 8, mixHex('#45413a', '#a39b8c', spill * 1.5), d.out > 0.4 ? 1 - leave : 1)
  }
  // The pool of light: the disc, and its edge falling away in rings.
  if (on > 0) {
    const [lx, ly] = lamp
    out += `<g opacity="${r(on, 3)}">`
    for (const [rad, o] of [[196, 0.05], [174, 0.09], [154, 0.16], [136, 0.3]]) out += `<circle cx="${r(lx)}" cy="${r(ly)}" r="${rad}" fill="${PAPER}" opacity="${o}"/>`
    out += `<circle cx="${r(lx)}" cy="${r(ly)}" r="120" fill="${PAPER}"/></g>`
  }
  // His line up through the dark.
  const trail = trailOf(keys, time)
  if (trail.length > 1) out += stroke(smooth(trail), RED, 4, 'opacity="0.85"')
  if (her[0] < X1 + 20) out += dot(her[0], her[1], 12, BLUE)
  out += dot(him[0], him[1], 12, RED)
  return out
}

/* ══ The Orbit ════════════════════════════════════════════════════
 *
 * "When she moves, the universe can't help but stop and stare." She is the
 * middle of everything. He falls in toward her for the whole song, comes
 * closest when she asks his name, and is thrown clear.
 */
const ORBIT = (() => {
  const dt = 0.05
  const table = []
  let th = -0.27
  for (let time = 9; time <= 190; time += dt) {
    const u = ramp(time, 9, 134.6)
    let rad = 46 + (840 - 46) * (1 - u) ** 1.55
    if (time > 136) rad = 46 + 2.4 * (time - 136) ** 2
    // An ellipse, not a circle: nearer on one side.
    const rr = rad * (1 + 0.13 * Math.sin(th * 1 + 0.8))
    table.push([CX + rr * Math.cos(th), CY + rr * Math.sin(th)])
    th += dt * Math.min(2.2, 150 / rad)
  }
  return { dt, table }
})()
const orbitAt = (time) => ORBIT.table[Math.max(0, Math.min(ORBIT.table.length - 1, Math.round((time - 9) / ORBIT.dt)))]
const ORBIT_WORLD = [
  [96, 6, 0.4], [150, 8, 2.1], [206, 5.5, 4.4], [264, 9, 1.2], [322, 6.5, 5.6], [384, 7.5, 3.3], [450, 6, 0.1],
  [522, 8.5, 2.9], [600, 6.5, 4.9], [690, 7.5, 1.7],
]
/** The universe's own clock: it stops while it stares. */
const orbitClock = (time) => time - 5.6 * easeInOut(ramp(time, 69.5, 75.7)) - 4 * easeInOut(ramp(time, 133.4, 138))

function orbit({ time }) {
  let out = plate()
  const tau = orbitClock(time)
  for (const [rad, size, ph] of ORBIT_WORLD) {
    out += `<circle cx="${CX}" cy="${CY}" r="${rad}" fill="none" stroke="${INK}" stroke-width="1.3" opacity="0.38"/>`
    const a = ph + tau * 26 / rad ** 1.1
    out += dot(CX + rad * Math.cos(a), CY + rad * Math.sin(a), size, INK)
  }
  // His way in, so far.
  if (time > 9) {
    const pts = []
    for (let s = 9; s < time; s += 0.1) pts.push(orbitAt(s))
    pts.push(orbitAt(time))
    out += stroke(poly(pts), RED, 3.5, 'opacity="0.9"')
    const him = orbitAt(time)
    out += dot(him[0], him[1], 11, RED)
  }
  out += dot(CX, CY, 14, BLUE)
  return out
}

/* ══ One Town Behind ══════════════════════════════════════════════
 *
 * A map. She is on tour — looks like California, sounds like Tennessee, walks
 * just like Alaska — and he gets to every town as she is leaving the next.
 */
const D2R = Math.PI / 180
const ALBERS = (() => {
  const p1 = 35 * D2R
  const p2 = 62 * D2R
  const n = (Math.sin(p1) + Math.sin(p2)) / 2
  const C = Math.cos(p1) ** 2 + 2 * n * Math.sin(p1)
  const rho = (lat) => Math.sqrt(C - 2 * n * Math.sin(lat * D2R)) / n
  return { n, rho, rho0: rho(47), lon0: -112 }
})()
const MAP_SCALE = 960
function project(lon, lat) {
  const th = ALBERS.n * (lon - ALBERS.lon0) * D2R
  const rho = ALBERS.rho(lat)
  return [CX + (rho * Math.sin(th) - 0.03) * MAP_SCALE, CY - (ALBERS.rho0 - rho * Math.cos(th) - 0.075) * MAP_SCALE]
}
function decodeRing(encoded) {
  const out = []
  let index = 0
  let lat = 0
  let lon = 0
  const next = () => {
    let result = 0
    let shift = 0
    let byte
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }
  while (index < encoded.length) {
    lat += next()
    lon += next()
    out.push([lon / 100, lat / 100])
  }
  return out
}
/** Douglas–Peucker, in screen units. */
function simplify(points, tolerance) {
  if (points.length < 4) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [a, c] = stack.pop()
    let worst = 0
    let at = -1
    for (let i = a + 1; i < c; i++) {
      const d = distToSeg(points[i], points[a], points[c])
      if (d > worst) { worst = d; at = i }
    }
    if (worst > tolerance && at > 0) {
      keep[at] = 1
      stack.push([a, at], [at, c])
    }
  }
  return points.filter((_, i) => keep[i])
}
let MAP_LAND = null
function mapLand() {
  if (MAP_LAND) return MAP_LAND
  const draw = (source, minSize) => {
    let d = ''
    for (const encoded of source) {
      const ring = decodeRing(encoded)
      if (!ring.some(([lon, lat]) => lon > -178 && lon < -48 && lat > 12 && lat < 78)) continue
      // Rings that reach round the far side of the world are not on this sheet.
      if (ring.some(([lon]) => lon > 0)) continue
      const pts = simplify(ring.map(([lon, lat]) => project(lon, lat)), 1.1)
      const xs = pts.map((p) => p[0])
      const ys = pts.map((p) => p[1])
      if (Math.max(...xs) < X0 - 40 || Math.min(...xs) > X1 + 40 || Math.max(...ys) < Y0 - 40 || Math.min(...ys) > Y1 + 40) continue
      if (Math.max(...xs) - Math.min(...xs) < minSize && Math.max(...ys) - Math.min(...ys) < minSize) continue
      d += poly(pts) + 'Z'
    }
    return d
  }
  MAP_LAND = { land: draw(LAND_FINE, 5), lakes: draw(LAKES, 7) }
  return MAP_LAND
}
/* The tour: [lon, lat, the second she arrives]. He arrives when she reaches the next. */
const TOUR = [
  [-117.16, 32.72, 9], [-118.24, 34.05, 27], [-122.42, 37.77, 45], [-111.89, 40.76, 64], [-104.99, 39.74, 72],
  [-94.58, 39.1, 82], [-90.05, 35.15, 92], [-86.78, 36.16, 100], [-87.63, 41.88, 113], [-93.27, 44.98, 121],
  [-97.14, 49.9, 128], [-114.07, 51.05, 136], [-135.05, 60.72, 144], [-149.9, 61.22, 152.2],
  // And then off the edge of the sheet.
  [-179, 56.5, 173],
]
const TOUR_XY = TOUR.map(([lon, lat]) => project(lon, lat))
/** How far along the tour (in stops, fractional) someone is who reaches stop k at `arrive[k]`. They travel in the last 45% of each wait. */
function tourAt(time, shift) {
  const at = (k) => TOUR[Math.min(k + shift, TOUR.length - 1)][2] + (k + shift > TOUR.length - 1 ? 21 * (k + shift - TOUR.length + 1) : 0)
  if (time <= at(0)) return 0
  for (let k = 0; k < TOUR.length - 1 - (shift ? 1 : 0); k++) {
    const a = at(k)
    const b = at(k + 1)
    if (time <= b) return k + easeInOut(ramp(time, a + 0.55 * (b - a), b))
  }
  return TOUR.length - 1 - (shift ? 1 : 0)
}
const tourPoint = (s) => {
  const k = Math.min(Math.floor(s), TOUR_XY.length - 2)
  const u = s - k
  return [lerp(TOUR_XY[k][0], TOUR_XY[k + 1][0], u), lerp(TOUR_XY[k][1], TOUR_XY[k + 1][1], u)]
}
const tourLine = (from, to) => {
  const pts = [tourPoint(from)]
  for (let k = Math.floor(from) + 1; k < to; k++) pts.push(TOUR_XY[k])
  pts.push(tourPoint(to))
  return poly(pts)
}
/* State lines, roughly: California's landward side, Tennessee, Alaska's east, the forty-ninth parallel. */
const BORDERS = [
  [[-124.2, 42], [-120, 42], [-120, 39], [-114.63, 35], [-114.72, 32.72], [-117.12, 32.53]],
  [[-90.3, 35], [-88.2, 35], [-85.6, 34.98], [-84.3, 35], [-81.65, 36.6], [-83.67, 36.6], [-88.05, 36.5], [-89.5, 36.5], [-89.7, 36], [-90.3, 35]],
  [[-141, 69.65], [-141, 60.3], [-139.1, 60.1], [-137.5, 58.9], [-135.5, 59.8], [-133.4, 58.4], [-131.8, 56.6], [-130, 55.9], [-130.2, 55]],
  Array.from({ length: 30 }, (_, i) => [-123.3 + i * (28.15 / 29), 49]),
]

function tour({ time }) {
  const { land, lakes } = mapLand()
  const SEA = '#dfe0d6'
  let out = plate(SEA)
  // Parallels and meridians, every ten degrees.
  let grid = ''
  for (let lat = 20; lat <= 80; lat += 10) grid += poly(Array.from({ length: 40 }, (_, i) => project(-190 + i * 4, lat)))
  for (let lon = -180; lon <= -40; lon += 10) grid += poly(Array.from({ length: 20 }, (_, i) => project(lon, 10 + i * 4)))
  out += `<path d="${grid}" fill="none" stroke="${INK}" stroke-width="1" opacity="0.13"/>`
  out += `<path d="${land}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`
  out += `<path d="${lakes}" fill="${SEA}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`
  for (const line of BORDERS) out += stroke(poly(line.map(([lon, lat]) => project(lon, lat))), INK, 1.3, 'stroke-dasharray="7 6" opacity="0.6"')
  // The three places the song names, lettered as a map letters them.
  const label = (text, lon, lat, anchor, dx = 0, dy = 0) => {
    const [x, y] = project(lon, lat)
    return type({ x: x + dx, y: y + dy, size: 26, text, fill: INK, weight: 500, tracking: 9, anchor, opacity: 0.8 })
  }
  out += label('California', -125.2, 36.2, 'end', -10) + label('Tennessee', -86.4, 33.1, 'middle', 0, 10) + label('Alaska', -153.5, 65.2, 'middle')
  // Where she is, where he is: the red is the road he has done, the blue what is still between them.
  const hers = tourAt(time, 0)
  const his = tourAt(time, 1)
  for (const [i, [x, y]] of TOUR_XY.entries()) {
    if (i === TOUR_XY.length - 1) continue
    out += `<circle cx="${r(x)}" cy="${r(y)}" r="7" fill="${PAPER}" stroke="${INK}" stroke-width="1.8"/>`
  }
  if (hers > his) out += stroke(tourLine(his, hers), BLUE, 3.5, 'stroke-dasharray="2 10"')
  if (his > 0) out += stroke(tourLine(0, his), RED, 4)
  const her = tourPoint(hers)
  const him = tourPoint(his)
  out += dot(her[0], her[1], 10, BLUE) + dot(him[0], him[1], 10, RED)
  return out
}

/* ══ The Flight Path ══════════════════════════════════════════════
 *
 * "Her eyes are open ocean and blue butterfly wings." A butterfly's way
 * across the page, all loops, from flower to flower; and him on foot, in a
 * straight line, a few flowers behind.
 */
const flightBase = (s) => [
  lerp(-30, 1640, s),
  CY + 20 + 205 * Math.sin(TAU * 1.3 * s + 0.5) + 55 * Math.sin(TAU * 3.4 * s + 1.2),
]
const flightAt = (s) => {
  const [x, y] = flightBase(s)
  // Out from a flower, once round, and back down onto the next: the loop closes to nothing at each of them.
  const rad = (44 + 80 * (0.5 + 0.5 * Math.sin(TAU * 2.3 * s + 2.2)) ** 1.3) * Math.abs(Math.sin(Math.PI * (12 * s + 0.25))) ** 0.8
  const a = TAU * 12 * s
  return [x + rad * Math.cos(a), y + rad * 0.86 * Math.sin(a)]
}
const FLIGHT_FLOWERS = (() => {
  const rand = rng(17)
  const out = []
  // Where she rests: on her path, where a loop comes round.
  for (let k = 1; k <= 12; k++) out.push({ p: flightBase((k - 0.25) / 12), s: (k - 0.25) / 12 })
  // And the rest of the meadow.
  for (let tries = 0; tries < 400 && out.length < 34; tries++) {
    const p = [X0 + 40 + rand() * (PLATE.w - 80), Y0 + 40 + rand() * (PLATE.h - 80)]
    if (out.some((f) => Math.hypot(f.p[0] - p[0], f.p[1] - p[1]) < 120)) continue
    out.push({ p, s: null, size: 0.7 + rand() * 0.5 })
  }
  return out
})()
const flightHers = (time) => clamp01(ramp(time, 9, 173) ** 0.62)

function butterfly({ time }) {
  let out = plate()
  const hers = flightHers(time)
  const his = Math.min(flightHers(time - 15) * 0.99, 0.93)
  // Flowers: six short strokes, in ink.
  for (const f of FLIGHT_FLOWERS) {
    const size = 11 * (f.size ?? 1.15)
    let d = ''
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI / 3 + (f.p[0] % 1)
      d += `M${r(f.p[0] - size * Math.cos(a))} ${r(f.p[1] - size * Math.sin(a))}L${r(f.p[0] + size * Math.cos(a))} ${r(f.p[1] + size * Math.sin(a))}`
    }
    out += stroke(d, INK, f.s == null ? 1.8 : 2.4, f.s == null ? 'opacity="0.55"' : '')
  }
  // His line: straight through where she looped.
  if (his > 0) {
    const pts = []
    for (let s = 0; s < his; s += 0.004) pts.push(flightBase(s))
    pts.push(flightBase(his))
    out += stroke(poly(pts), RED, 4)
  }
  // Her way, dotted, the way a flight is drawn.
  if (hers > 0) {
    const pts = []
    for (let s = 0; s < hers; s += 0.0008) pts.push(flightAt(s))
    pts.push(flightAt(hers))
    out += stroke(poly(pts), BLUE, 4.5, 'stroke-dasharray="0.1 11"')
    // Her: two wings and a body, from above, opening and closing.
    const [x, y] = flightAt(hers)
    const [ax, ay] = flightAt(Math.max(0, hers - 0.002))
    const heading = Math.atan2(y - ay, x - ax) / D2R
    const open = 0.55 + 0.45 * Math.abs(Math.cos(time * 9))
    out += `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(heading + 90)}) scale(1.7)" fill="${BLUE}">`
      + `<g transform="scale(${r(open, 3)} 1)"><path d="M0 -4C-10 -26 -32 -26 -30 -8C-29 2 -14 4 0 2Z M0 -4C10 -26 32 -26 30 -8C29 2 14 4 0 2Z M0 2C-12 4 -24 12 -19 22C-14 30 -4 22 0 8Z M0 2C12 4 24 12 19 22C14 30 4 22 0 8Z"/></g>`
      + `<path d="M0 -12V18" stroke="${BLUE}" stroke-width="3.4" stroke-linecap="round"/></g>`
  }
  if (his > 0) {
    const [hx, hy] = flightBase(his)
    out += dot(hx, hy, 11, RED)
  }
  return out
}

/* ══ Written in Sand ══════════════════════════════════════════════
 *
 * "Eyes that hit a sunrise like waves that hit a shore." The beach from above.
 * He writes in the sand at the water's edge — every word he has for her, and
 * his name for her, large — and the sea takes them.
 */
const SAND_BASE = (x) => 196 + 0.016 * (x - 800) + 7 * Math.sin(x / 300 + 1)
/* How far up the beach each line's wave comes; the tide is coming in. */
const sandWaves = memo((score) => {
  const set = [120, 150, 160, 172, 140, 176, 186, 197]
  const waves = score.lines.map((line, k) => {
    const big = [8, 16, 19].includes(k)
    return { t0: line.start - 0.4, amp: k < set.length ? set[k] : big ? 540 : 215 + ((k * 53) % 40) + k * 3, dur: big ? 6.5 : 5.2 }
  })
  // And after the last "Ivory", one long wave that takes the name.
  waves.push({ t0: score.lines.at(-1).start + 2.4, amp: 600, dur: 8 })
  return waves
})
/** The reach of the water at `time`: each wave's run up the sand and its slower slide back. */
function sandReach(score, time) {
  let reach = 26 + 10 * Math.sin(time * 0.9)
  for (const w of sandWaves(score)) {
    const u = (time - w.t0) / w.dur
    if (u <= 0 || u >= 1) continue
    reach = Math.max(reach, w.amp * (u < 0.3 ? easeOut(u / 0.3) : 1 - easeInOut((u - 0.3) / 0.7)))
  }
  return reach
}
/** The highest the water has come since `since`. */
function sandHigh(score, since, time) {
  let high = 0
  for (const w of sandWaves(score)) {
    const peak = w.t0 + 0.3 * w.dur
    if (peak >= since && peak <= time) high = Math.max(high, w.amp)
  }
  return Math.max(high, sandReach(score, time), sandReach(score, since))
}
/* Where he writes: the small words in rows along the water's edge, his name for her large below them. */
const SAND = { size: 50, tracking: 8, rows: [232, 306], step: 290, x0: 92, walk: 556 }
const SAND_NAME = { off: 474, size: 150, tracking: 30 }
const sandWords = memo((score) => {
  let small = 0
  return guesses(score).map((g) => {
    if (g.word === 'IVORY') return { ...g, name: true }
    const at = { x: SAND.x0 + (small % 5) * SAND.step, off: SAND.rows[Math.floor(small / 5) % 2] }
    small++
    return { ...g, ...at }
  })
})

function sand({ time, score, uid }) {
  let out = plate()
  const reach = sandReach(score, time)
  const edge = (x, lift = 0) => SAND_BASE(x) + reach - lift + 3 * Math.sin(x / 70 + time * 1.3)
  // What he has written, each word cut off where the water has been since.
  const words = sandWords(score)
  let defs = ''
  let written = ''
  let tip = null
  let reachX = [Infinity, -Infinity]
  for (const w of words) {
    if (time < w.t0) break
    const size = w.name ? SAND_NAME.size : SAND.size
    const tracking = w.name ? SAND_NAME.tracking : SAND.tracking
    const wide = advance(w.word, size, tracking) - tracking
    const x0 = w.name ? CX - wide / 2 : w.x
    const yOf = (x) => SAND_BASE(x) + (w.name ? SAND_NAME.off : w.off)
    // Each "Ivory" cuts his name again in the same place: only the newest tracing is drawn.
    if (w.name && words.some((o) => o.name && o.t0 > w.t0 && o.t0 <= time)) continue
    const high = sandHigh(score, w.t0, time)
    const id = `${uid}-s${w.i}`
    let clip = `M${r(x0 - 30)} ${Y1}`
    for (let x = x0 - 30; x <= x0 + wide + 60; x += 30) clip += `L${r(x)} ${r(SAND_BASE(x) + high + 4)}`
    clip += `L${r(x0 + wide + 60)} ${Y1}Z`
    defs += `<clipPath id="${id}"><path d="${clip}"/></clipPath>`
    let letters = ''
    let x = x0
    for (const [i, ch] of [...w.word].entries()) {
      const on = easeOut(ramp(time, w.t0 + i * 0.09, w.t0 + i * 0.09 + 0.16))
      const width = advance(ch, size, tracking)
      if (on > 0) {
        letters += type({ x: x + (width - tracking) / 2, y: yOf(x0), size, text: ch, fill: INK, weight: w.name ? 500 : 400, anchor: 'middle', opacity: on * (w.name ? 0.95 : 0.85) })
        tip = [x + width - tracking + 10, yOf(x0) - 8]
        reachX = [Math.min(reachX[0], x0), Math.max(reachX[1], x + width)]
      }
      x += width
    }
    written += `<g clip-path="url(#${id})">${letters}</g>`
  }
  out += `<defs>${defs}</defs>${written}`
  // The tide mark: the line the last wave left.
  const mark = sandHigh(score, time - 9, time)
  let wrack = ''
  for (let x = X0 - 10; x <= X1 + 10; x += 20) wrack += `${wrack ? 'L' : 'M'}${x} ${r(SAND_BASE(x) + mark + 4 + 3 * Math.sin(x / 47) + 2 * Math.sin(x / 13))}`
  out += stroke(wrack, INK, 1.4, 'stroke-dasharray="1 7" opacity="0.6"')
  // The sea, over whatever it has reached: lines of swell coming in, closer together toward the edge.
  let sea = ''
  for (let j = 1; j < 30; j++) {
    const back = 15 * j ** 1.36
    if (edge(800, back) < Y0 - 40) break
    let d = ''
    for (let x = X0 - 10; x <= X1 + 10; x += 22) {
      const y = edge(x, back) + (3.5 + j * 0.8) * Math.sin(x / (76 + j * 5) + j * 1.7 - time * 0.9) + 2 * Math.sin(x / 23 + j * 2.9)
      d += `${d ? 'L' : 'M'}${x} ${r(y)}`
    }
    sea += d
  }
  let front = ''
  let foam = ''
  for (let x = X0 - 10; x <= X1 + 10; x += 18) {
    front += `${front ? 'L' : 'M'}${x} ${r(edge(x))}`
    foam += `${foam ? 'L' : 'M'}${x} ${r(edge(x, 8) + 2 * Math.sin(x / 31))}`
  }
  out += `<path d="${front}L${X1 + 10} ${Y0 - 10}L${X0 - 10} ${Y0 - 10}Z" fill="${PAPER}"/>`
  // The sea is hers ("her eyes are open ocean"): the one place her blue is a whole field.
  out += stroke(sea, BLUE, 2.4, 'opacity="0.85"') + stroke(foam, BLUE, 1.4, 'opacity="0.7"') + stroke(front, BLUE, 4)
  // His steps along the beach below what he has written, and the point he writes with.
  if (tip) {
    const yWalk = (x) => SAND_BASE(x) + SAND.walk + 6 * Math.sin(x / 90)
    const pts = []
    for (let x = X0 - 10; x < tip[0] - 30; x += 24) pts.push([x, yWalk(x)])
    pts.push([tip[0] - 16, yWalk(tip[0] - 16)])
    out += stroke(poly(pts), RED, 6, 'stroke-dasharray="0.1 17" opacity="0.9"')
    out += stroke(`M${r(tip[0] - 16)} ${r(yWalk(tip[0] - 16))}Q${r(tip[0] + 12)} ${r((yWalk(tip[0]) + tip[1]) / 2 + 20)} ${r(tip[0])} ${r(tip[1] + 14)}`, RED, 6, 'stroke-dasharray="0.1 17" opacity="0.9"')
    out += dot(tip[0], tip[1], 11, RED)
  }
  return out
}

/* ══ The Crossword ════════════════════════════════════════════════
 *
 * The guessing game as a crossword in pencil. The words he sings go in where
 * they cross: SUNRISE, SHORE and MYSTERY run down through her five squares,
 * and those are the squares he cannot fill.
 */
const XW = { cell: 80, col: 1, row: -1.85 }
const xwX = (c) => CX + (c - XW.col - 0.5) * XW.cell
const xwY = (row) => CY + (row - XW.row - 0.5) * XW.cell
const XW_ENTRIES = [
  { word: 'WOMAN', c: 2, r: -6, down: false, li: 0 },
  { word: 'SUNRISE', c: 0, r: -4, down: true, li: 1 },
  { word: 'SHORE', c: 2, r: -2, down: true, li: 1 },
  { word: 'OCEAN', c: -4, r: -2, down: false, li: 2 },
  { word: 'SHE', c: 2, r: -2, down: false, li: 3 },
  { word: 'SINGS', c: 0, r: -4, down: false, li: 3 },
  { word: 'MYSTERY', c: 4, r: -6, down: true, li: 6 },
  { word: 'WHERE', c: -2, r: 2, down: false, li: 10 },
]
const xwKey = (c, row) => `${c},${row}`
const XW_HERS = new Set([0, 1, 2, 3, 4].map((c) => xwKey(c, 0)))
const XW_GRID = (() => {
  const letters = new Map()
  for (const e of XW_ENTRIES) {
    [...e.word].forEach((ch, i) => {
      const key = xwKey(e.c + (e.down ? 0 : i), e.r + (e.down ? i : 0))
      const had = letters.get(key)
      if (had && had !== ch) throw new Error(`crossword: ${e.word} does not cross at ${key}`)
      letters.set(key, ch)
    })
  }
  const stops = new Set(['1,-2', '5,-2', '2,-3', '2,3', '0,3', '0,-5', '4,1', '4,-7', '1,-6', '7,-6', '-1,-4', '5,-4', '-5,-2', '-1,0', '5,0', '-3,2', '3,2'])
  const black = (c, row) => {
    const key = xwKey(c, row)
    if (letters.has(key) || XW_HERS.has(key)) return false
    if (stops.has(key)) return true
    const oc = Math.abs(c) % 2 === 1
    const or = Math.abs(row) % 2 === 1
    if (oc && or) return true
    if (!oc && !or) return false
    return hash2(c * 1.7 + 3, row * 2.3 + 11) < 0.13
  }
  // Clue numbers, the way a setter numbers them: any square that starts a word.
  const numbers = new Map()
  let n = 0
  for (let row = -7; row <= 4; row++) {
    for (let c = -10; c <= 12; c++) {
      if (black(c, row)) continue
      const across = black(c - 1, row) && !black(c + 1, row)
      const down = black(c, row - 1) && !black(c, row + 1)
      if (across || down) numbers.set(xwKey(c, row), ++n)
    }
  }
  return { letters, black, numbers }
})()

function crossword({ time, score }) {
  const { cell } = XW
  let out = plate()
  let blacks = ''
  let nums = ''
  for (let row = -7; row <= 4; row++) {
    for (let c = -10; c <= 12; c++) {
      const x = xwX(c)
      const y = xwY(row)
      if (x > X1 || x + cell < X0 || y > Y1 || y + cell < Y0) continue
      if (XW_GRID.black(c, row)) { blacks += `M${r(x)} ${r(y)}h${cell}v${cell}h${-cell}Z`; continue }
      const n = XW_GRID.numbers.get(xwKey(c, row))
      if (n) nums += `<text x="${r(x + 6)}" y="${r(y + 18)}" font-size="14" font-weight="500" fill="${INK}" opacity="0.8">${n}</text>`
    }
  }
  // Her five squares.
  out += `<rect x="${r(xwX(0))}" y="${r(xwY(0))}" width="${cell * 5}" height="${cell}" fill="${BLUE}" opacity="0.16"/>`
  out += `<path d="${blacks}" fill="${INK}"/>`
  let rules = ''
  for (let c = -10; c <= 13; c++) rules += `M${r(xwX(c))} ${Y0}V${Y1}`
  for (let row = -7; row <= 5; row++) rules += `M${X0} ${r(xwY(row))}H${X1}`
  out += `<path d="${rules}" stroke="${INK}" stroke-width="1.6" fill="none"/>${nums}`
  out += `<rect x="${r(xwX(0))}" y="${r(xwY(0))}" width="${cell * 5}" height="${cell}" fill="none" stroke="${BLUE}" stroke-width="5"/>`
  // His words, a letter at a time as he sings them, skipping her squares.
  const letter = (c, row, ch, o, fill = INK, weight = 500) =>
    type({ x: xwX(c) + cell / 2, y: xwY(row) + cell * 0.71, size: 48, text: ch, fill, weight, anchor: 'middle', opacity: o })
  let cursor = [0, 0]
  let cursorAt = -1
  const drawn = new Set()
  for (const e of XW_ENTRIES) {
    const t0 = wordT(score, e.li, e.word)
    ;[...e.word].forEach((ch, i) => {
      const c = e.c + (e.down ? 0 : i)
      const row = e.r + (e.down ? i : 0)
      const at = t0 + i * 0.09
      if (time < at) return
      if (at > cursorAt) { cursorAt = at; cursor = [c, row] }
      const key = xwKey(c, row)
      if (XW_HERS.has(key) || drawn.has(key)) return
      drawn.add(key)
      out += letter(c, row, ch, easeOut(ramp(time, at, at + 0.14)))
    })
  }
  // His name for her, pencilled in on every "Ivory" and rubbed out again.
  for (const ti of ivories(score)) {
    [...'IVORY'].forEach((ch, i) => {
      const at = ti + i * 0.09
      const o = Math.min(easeOut(ramp(time, at, at + 0.14)), 1 - easeInOut(ramp(time, ti + 2.4, ti + 3)))
      if (o > 0) out += letter(i, 0, ch, o * 0.6, PENCIL, 300)
      if (time >= at && time < ti + 3 && at > cursorAt) { cursorAt = at; cursor = [i, 0] }
    })
  }
  // The cursor: on the square he is writing, and otherwise waiting on the first of hers.
  if (time - cursorAt > 1.1) cursor = [0, 0]
  const blink = time - cursorAt > 1.1 ? 0.88 + 0.12 * Math.cos(TAU * time / 1.14) : 1
  out += `<rect x="${r(xwX(cursor[0]) + 5)}" y="${r(xwY(cursor[1]) + 5)}" width="${cell - 10}" height="${cell - 10}" fill="none" stroke="${RED}" stroke-width="6" opacity="${r(blink, 3)}"/>`
  return out
}

/* ══ Five Blanks, in Pencil ═══════════════════════════════════════
 *
 * The game with nothing but a pencil: five ruled blanks the width of the
 * sheet. Every five-letter word he sings is written on them and rubbed out
 * for the next, and the rubbing never quite takes.
 */
const PEN = { size: 268, slot: 288, base: 548, rule: 578 }
const penX = (i) => CX + (i - 2) * PEN.slot

function pencil({ time, score }) {
  let out = plate()
  const list = guesses(score)
  let ghosts = ''
  let live = ''
  let tip = [penX(0) - 96, PEN.rule - 22]
  for (const [k, g] of list.entries()) {
    if (time < g.t0) break
    const next = list[k + 1]
    const until = Math.min(next ? next.t0 - 0.2 : g.t0 + 4.5, g.t0 + (g.word === 'IVORY' ? 4.2 : 6))
    const rubbed = easeInOut(ramp(time, until - 0.5, until))
    ;[...g.word].forEach((ch, i) => {
      const on = easeOut(ramp(time, g.t0 + i * 0.075, g.t0 + i * 0.075 + 0.14))
      if (on <= 0) return
      const x = penX(i)
      if (rubbed < 1) {
        live += type({ x, y: PEN.base, size: PEN.size, text: ch, fill: '#3f3b35', weight: 400, anchor: 'middle', opacity: on * (1 - rubbed) })
        tip = [x + advance(ch, PEN.size) * 0.5 + 6, PEN.base - 10]
      }
      if (rubbed > 0) {
        // What the rubber leaves: the same letter, fainter, never quite where it was.
        const dx = (hash2(k, i) - 0.5) * 16
        const dy = (hash2(i, k + 9) - 0.5) * 14
        const rot = (hash2(k + 3, i + 5) - 0.5) * 5
        ghosts += type({ x: x + dx, y: PEN.base + dy, size: PEN.size, text: ch, fill: PENCIL, weight: 300, anchor: 'middle', opacity: 0.085 * rubbed, transform: `rotate(${r(rot, 2)} ${r(x)} ${PEN.base - 90})` })
      }
    })
  }
  out += ghosts
  // The five blanks.
  let rules = ''
  for (let i = 0; i < 5; i++) rules += `M${r(penX(i) - 118)} ${PEN.rule}H${r(penX(i) + 118)}`
  out += stroke(rules, INK, 5) + live
  // The point of the pencil.
  out += dot(tip[0], tip[1], 11, RED)
  return out
}

/* ══ The Letter Lock ══════════════════════════════════════════════
 *
 * A five-ring letter lock. Every five-letter word he sings is dialled in, and
 * it stays shut — on his name for her as well.
 */
const LOCK = { w: 150, h: 300, gap: 18, y: 508 }
const lockX = (i) => CX + (i - 2) * (LOCK.w + LOCK.gap)
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ '
/** Where each ring stands at `time`, as a position on its band of letters (fractional while turning). */
function lockRings(score, time) {
  const rings = Array(5).fill(26)
  let active = 4
  let last = -Infinity
  for (const g of guesses(score)) {
    if (time < g.t0) break
    ;[...g.word].forEach((ch, i) => {
      const at = g.t0 + i * 0.1
      if (time < at) return
      const to = ALPHA.indexOf(ch)
      let from = rings[i]
      // Always turned the same way, and at least a few letters round.
      const steps = ((to - Math.round(from)) % 27 + 27) % 27 || 27
      rings[i] = from + steps * easeInOut(ramp(time, at, at + 0.34))
      if (time >= at + 0.34) rings[i] = to
      active = i
      last = at
    })
  }
  // After the last "Ivory" he spins them off.
  const end = guesses(score).at(-1).t0 + 3
  if (time > end) for (let i = 0; i < 5; i++) rings[i] += (((26 - rings[i]) % 27) + 27) % 27 * easeInOut(ramp(time, end + i * 0.15, end + i * 0.15 + 0.6))
  return { rings, active, last }
}

function lock({ time, score }) {
  let out = plate()
  const { rings, active, last } = lockRings(score, time)
  const { w, h, y } = LOCK
  const top = y - h / 2
  const left = lockX(0) - w / 2 - 62
  const right = lockX(4) + w / 2 + 62
  // He tries it: the shackle jumps and holds. Twice, on every "Ivory".
  let tug = 0
  for (const ti of ivories(score)) for (const at of [ti + 0.9, ti + 1.5]) if (time >= at) tug = Math.max(tug, Math.exp(-(time - at) / 0.12) * Math.abs(Math.cos((time - at) * 30)))
  const lift = -10 * tug
  // The shackle, behind the body.
  const bow = `M${CX - 190} ${r(top + 10)}V${r(top - 34 + lift)}A190 190 0 0 1 ${CX + 190} ${r(top - 34 + lift)}V${r(top + 10)}`
  out += stroke(bow, INK, 50, 'stroke-linecap="butt"') + stroke(bow, PAPER, 42, 'stroke-linecap="butt"')
  // The body, and the marks either side of the line the letters are read on.
  out += `<rect x="${r(left)}" y="${r(top - 36)}" width="${r(right - left)}" height="${h + 72}" rx="30" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>`
  out += `<path d="M${r(left + 16)} ${y - 11}l20 11l-20 11Z M${r(right - 16)} ${y - 11}l-20 11l20 11Z" fill="${INK}"/>`
  // The rings: the letter on the line, and its neighbours turning away over the top and under the bottom.
  for (let i = 0; i < 5; i++) {
    const x = lockX(i)
    out += `<rect x="${r(x - w / 2)}" y="${r(top)}" width="${w}" height="${h}" rx="12" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`
    // Milled edges, turning with the ring.
    let mill = ''
    for (let k = 0; k < 15; k++) {
      const a = ((k + frac(rings[i] * 3)) / 15 - 0.5) * Math.PI
      const my = y + (h / 2 - 3) * Math.sin(a)
      mill += `M${r(x - w / 2 + 3)} ${r(my)}h10 M${r(x + w / 2 - 13)} ${r(my)}h10`
    }
    out += stroke(mill, INK, 1.4, 'opacity="0.6"')
    const pos = rings[i]
    const base = Math.round(pos)
    const f = pos - base
    for (let k = -1; k <= 1; k++) {
      const ch = ALPHA[(((base + k) % 27) + 27) % 27]
      const a = (k - f) * 1.02 // radians round the ring
      if (Math.abs(a) > 1.4 || ch === ' ') continue
      const ly = y + (h / 2 - 6) * Math.sin(a)
      const squash = Math.cos(a)
      out += `<g transform="translate(${r(x)} ${r(ly)}) scale(1 ${r(squash, 3)})" opacity="${r(Math.abs(a) < 0.25 ? 1 : 0.12 + 0.5 * squash ** 2, 3)}">${type({ x: 0, y: 42, size: 120, text: ch, fill: INK, weight: 600, anchor: 'middle' })}</g>`
    }
  }
  // The pointer under the ring his hand is on.
  const settle = time - last > 2.5 ? 0.7 + 0.3 * Math.cos(TAU * time / 1.14) : 1
  const px = lockX(active)
  out += `<path d="M${r(px)} ${r(top + h + 46)}l-20 34h40Z" fill="${RED}" opacity="${r(settle, 3)}"/>`
  return out
}

/* ══ A Stroke a Guess ════════════════════════════════════════════
 *
 * The oldest pencil-and-paper guessing game: five blanks, and every wrong
 * guess costs a stroke of the drawing. The drawing is a butterfly. When it is
 * finished, it goes.
 */
const WRONG = [
  ['WOMAN', 0], ['SHORE', 1], ['OCEAN', 2], ['WINGS', 2], ['STAGE', 3],
  ['MOVES', 9], ['STARE', 9], ['RIGHT', 10], ['WHERE', 10], ['ASKED', 11],
  ['COULD', 16], ['LOVES', 16], ['ASKED', 17], ['WALKS', 20], ['AVOID', 22],
]
/* The butterfly, a stroke at a time, as cubic runs [x0,y0, c1x,c1y, c2x,c2y, x1,y1, …] about its middle. */
const mirror = (run) => run.map((v, i) => (i % 2 ? v : -v))
const WING_UP = [-8, -40, -80, -190, -260, -236, -304, -172, -334, -100, -250, -22, -10, 0]
const WING_LOW = [-10, 6, -150, 20, -256, 92, -224, 172, -192, 240, -80, 200, -8, 72]
const VEIN_1 = [-10, -26, -90, -90, -180, -140, -262, -168]
const VEIN_2 = [-10, -12, -100, -40, -200, -60, -290, -112]
const VEIN_3 = [-10, 30, -80, 70, -150, 120, -204, 168]
const FEELER = [-4, -72, -18, -116, -44, -150, -80, -164]
const SPOT = [-240, -150, -240, -178, -200, -178, -200, -150, -200, -122, -240, -122, -240, -150]
const BUTTERFLY = [
  [0, -72, 12, -30, 12, 60, 0, 112, -12, 60, -12, -30, 0, -72],
  WING_UP, mirror(WING_UP), WING_LOW, mirror(WING_LOW),
  FEELER, mirror(FEELER), VEIN_1, mirror(VEIN_1), VEIN_2, mirror(VEIN_2), VEIN_3, mirror(VEIN_3), SPOT, mirror(SPOT),
].map((run) => {
  const pts = []
  for (let i = 0; i + 7 < run.length; i += 6) {
    const [x0, y0, ax, ay, bx, by, x1, y1] = run.slice(i, i + 8)
    for (let k = i ? 1 : 0; k <= 14; k++) {
      const u = k / 14
      const m = 1 - u
      pts.push([m ** 3 * x0 + 3 * m * m * u * ax + 3 * m * u * u * bx + u ** 3 * x1, m ** 3 * y0 + 3 * m * m * u * ay + 3 * m * u * u * by + u ** 3 * y1])
    }
  }
  return pts
})
const strokesPlan = memo((score) => WRONG.map(([word, li], i) => ({ word, i, t0: wordT(score, li, word) })))

function strokes({ time, score }) {
  let out = plate()
  const plan = strokesPlan(score)
  const BX = 1116
  const BY = 436
  const S = 1.2
  let tip = [160, 176]
  // The five blanks, and his name for her pencilled on them for a breath.
  let rules = ''
  for (let i = 0; i < 5; i++) rules += `M${160 + i * 104} 214h82`
  out += stroke(rules, INK, 4.5)
  for (const ti of ivories(score)) {
    [...'IVORY'].forEach((ch, i) => {
      const at = ti + i * 0.09
      const o = Math.min(easeOut(ramp(time, at, at + 0.14)), 1 - easeInOut(ramp(time, ti + 2.4, ti + 3)))
      if (o > 0) {
        out += type({ x: 201 + i * 104, y: 200, size: 84, text: ch, fill: PENCIL, weight: 300, anchor: 'middle', opacity: o * 0.8 })
        tip = [201 + i * 104 + 38, 192]
      }
    })
  }
  // The guesses, written down and struck out, and a stroke of the drawing for each.
  let flown = 0
  const last = ivories(score).at(-1)
  if (time > last) flown = easeInOut(ramp(time, last + 0.6, last + 5))
  let wings = ''
  for (const g of plan) {
    if (time < g.t0) break
    const x = 160 + Math.floor(g.i / 8) * 276
    const y = 330 + (g.i % 8) * 59
    let cx = x
    for (const [i, ch] of [...g.word].entries()) {
      const on = easeOut(ramp(time, g.t0 + i * 0.07, g.t0 + i * 0.07 + 0.12))
      const width = advance(ch, 45, 7)
      if (on > 0) {
        out += type({ x: cx + (width - 7) / 2, y, size: 45, text: ch, fill: '#3f3b35', weight: 400, anchor: 'middle', opacity: on })
        if (time < g.t0 + 0.5) tip = [cx + width, y - 6]
      }
      cx += width
    }
    const struck = easeInOut(ramp(time, g.t0 + 0.5, g.t0 + 0.72))
    if (struck > 0) {
      out += stroke(`M${x - 8} ${y - 15}H${r(x - 8 + (cx - x + 10) * struck)}`, INK, 3)
      if (struck < 1) tip = [x - 8 + (cx - x + 10) * struck, y - 15]
    }
    const draw = easeInOut(ramp(time, g.t0 + 0.72, g.t0 + 1.5))
    if (draw > 0) {
      const pts = BUTTERFLY[g.i]
      const n = Math.max(2, Math.ceil(draw * (pts.length - 1)) + 1)
      const shown = pts.slice(0, n).map(([px, py]) => [px * S, py * S])
      wings += poly(shown)
      if (draw < 1) tip = [BX + shown.at(-1)[0], BY + shown.at(-1)[1]]
    }
  }
  if (wings && flown < 1) {
    // Finished, it lifts off the page and is gone.
    const fx = BX + 620 * flown ** 2
    const fy = BY - 520 * flown ** 1.6
    const flap = flown > 0 ? 0.35 + 0.65 * Math.abs(Math.cos(time * 8)) : 1
    out += `<g transform="translate(${r(fx)} ${r(fy)}) rotate(${r(24 * flown, 1)}) scale(${r(flap, 3)} 1)">${stroke(wings, BLUE, 5)}</g>`
  }
  out += dot(tip[0], tip[1], 10, RED)
  return out
}

/* ── The ten ──────────────────────────────────────────────────────── */

export const CONCEPTS = [
  {
    id: 'room',
    name: 'The Room',
    lyric: 'Right up there beside her is where I want to be',
    idea: 'The venue from above, drawn as a plan: the stage, the bar, the desk, the doors. The crowd is ink dots, she is the blue dot on the stage, and he is the red dot who came in at the back.',
    motion: 'He works his way to the front through the crowd, a few steps on every line, and stands at the lip of the stage through the choruses. In the interlude the room empties. She leaves by the green room and the stage door while he goes the long way round, and he reaches the alley after she has gone.',
    red: 'Him, and the line of everywhere he has stood tonight.',
    stills: [84.4],
    frame: room,
  },
  {
    id: 'crossword',
    name: 'The Crossword',
    lyric: 'When I asked her for her name, she looked straight back at me',
    idea: 'The guessing game as a crossword in pencil. The words he sings go into the grid where they cross. SUNRISE, SHORE and MYSTERY run down through her five squares, and those are the squares he cannot fill.',
    motion: 'Each word is written a letter at a time as it is sung, the red cursor moving with it, and between words the cursor waits on the first of her squares. On every “Ivory” his name for her is pencilled in and rubbed out. The grid ends complete but for her row.',
    red: 'The cursor: the square he is on.',
    stills: [89.6],
    frame: crossword,
  },
  {
    id: 'orbit',
    name: 'The Orbit',
    lyric: 'When she moves, the universe can’t help but stop and stare',
    idea: 'She is the middle of everything: a blue dot, with the universe going round her in rings. He is the red dot falling in from the edge of the sheet.',
    motion: 'Everything turns, and on “stop and stare” everything stops. He spirals in for the whole song, quicker the closer he gets, and is nearest when she asks his name. He does not land: he goes round her once and is thrown clear, off the sheet, by the last “Ivory”.',
    red: 'Him and his way in: one line, wound round her.',
    stills: [72.4],
    frame: orbit,
  },
  {
    id: 'pencil',
    name: 'Five Blanks, in Pencil',
    lyric: 'But too avoid the heartache, I’ll keep this one just for me',
    idea: 'The game with nothing but a pencil: five ruled blanks the width of the sheet. Every five-letter word he sings is written on them, and rubbed out for the next.',
    motion: 'Letters go down on their measured onsets. The rubbing out never quite takes, so the blanks fill with the grey of everything he has tried. IVORY is written like any other word and rubbed out like any other. The film ends on five blanks and a smudge.',
    red: 'The point of the pencil.',
    stills: [161.3],
    frame: pencil,
  },
  {
    id: 'spotlight',
    name: 'The Follow Spot',
    lyric: 'But when she asked me for my name, I forgot how to breathe',
    idea: 'The house lights are down, so the plate is black. One pool of light on the stage, with her in it. He is a red dot in the dark.',
    motion: 'The light follows her across the stage; the crowd is only just visible where it spills. He comes up through the dark, and when the room has emptied he climbs onto the stage and stops at the edge of her light. She walks out of it. The light stays where it was, he steps into it alone, and it goes out.',
    red: 'Him: the only colour in the dark.',
    stills: [136.2],
    frame: spotlight,
  },
  {
    id: 'tour',
    name: 'One Town Behind',
    lyric: 'Walks just like Alaska with the snowfall in the trees',
    idea: 'A map, in Andalusia’s manner. She is on tour: California, across to Tennessee, north to Alaska. He gets to every town as she is leaving the next.',
    motion: 'Her dot goes town to town with a dotted line behind it; his follows one stop back and turns her dotted line into his solid one, so the blue left on the map is always exactly the distance between them. On “Alaska” she reaches the last town. Then her line runs off the edge of the sheet, and he arrives.',
    red: 'The road he has driven. The blue is what is still between them.',
    stills: [152.7],
    frame: tour,
  },
  {
    id: 'lock',
    name: 'The Letter Lock',
    lyric: 'Ivory',
    idea: 'A five-ring letter lock, drawn in line. Every five-letter word he sings is dialled in, ring by ring. It stays shut, on his name for her as well.',
    motion: 'The rings turn on the sung words, one after another, and the pointer moves to the ring his hand is on. On every “Ivory” the rings line up, he tries the shackle twice, and it holds. After the last one he spins them off to blanks.',
    red: 'The pointer under the ring being turned.',
    stills: [42.6],
    frame: lock,
  },
  {
    id: 'butterfly',
    name: 'The Flight Path',
    lyric: 'Her eyes are open ocean and blue butterfly wings',
    idea: 'A butterfly’s way across the page, all loops, from flower to flower, drawn dotted the way a flight is drawn. He follows on foot in a straight line.',
    motion: 'She goes on the sung words and rests on a flower in the gaps. Each time his line reaches the flower she is on, she lifts off. At the end her dotted line leaves the page and his stops at the last flower.',
    red: 'His line, straight through every place she looped.',
    stills: [66.9],
    frame: butterfly,
  },
  {
    id: 'sand',
    name: 'Written in Sand',
    lyric: 'Eyes that hit a sunrise like waves that hit a shore',
    idea: 'The beach from above. He writes in the sand at the water’s edge: every word he has for her, small, and his name for her, large. The sea takes them.',
    motion: 'A wave comes up the beach on every line and cuts off whatever it reaches. He writes each five-letter word as he sings it, and traces IVORY again on every “Ivory”. The tide is coming in; after the last “Ivory” one long wave takes the name and he does not write it again.',
    red: 'The point he writes with, and his steps along the beach.',
    stills: [55.7],
    frame: sand,
  },
  {
    id: 'strokes',
    name: 'A Stroke a Guess',
    lyric: 'I could be the one she loves, the Adam to her Eve',
    idea: 'The oldest pencil-and-paper guessing game: five blanks, and every wrong guess costs a stroke of the drawing. The drawing is a butterfly, in her blue.',
    motion: 'Each five-letter word is written in the list, struck out, and paid for with one more stroke of the butterfly. His name for her is pencilled on the blanks on every “Ivory” and does not stay. The fifteenth wrong word, AVOID, finishes the drawing, and on the last “Ivory” it lifts off the page.',
    red: 'The point of the pencil, wherever it is writing.',
    stills: [130.75],
    frame: strokes,
  },
]
