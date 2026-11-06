/*
 * Police chase 1, the first chorus (exploration, 2026-11-05): from the end of
 * heist 2 to the start of heist 3, 1:14–1:42.
 *
 * The user's pacing for the film: heist 1 verse 1, heist 2 verse 2, chase 1
 * chorus 1, heist 3 verse 3, chase 2 chorus 2, heist 4 the instrumental (the
 * police almost catch them; the most chaotic), heist 5 the last verse, and the
 * final chase in the last chorus as the camera pulls out for the end.
 *
 * The story here: the conman (1) and the auditor (2) come out of the
 * counting-house block onto Main Street. A police officer on the east circle
 * sees them on "No matter where I go" (78.4) and gives chase down the downtown
 * grid. They double back down High Street and vanish into the park blocks.
 * He runs on past them up High Street to the bridge and stands there looking
 * (his line of sight sweeps the river and the park), then gives up across the
 * bridge. They slip out the far side and down the Crescent to the fluke road,
 * and are at the studio's door as verse 3 comes in; heist 3 starts there.
 *
 * Streets: the downtown grid runs every 80 m (x 320, 400 = High Street, 480,
 * 560, 640; y 318 = Main Street, 398, 478 …). The river cuts the park's north
 * end, so the hiding place is its south half, on the dry side.
 *
 * Three ways to film it:
 *   A · From above   the camera pulls up over downtown and watches the whole
 *                     chase like a map, then comes down onto the studio
 *   B · On their heels  close behind the two of them, standing back to hold
 *                     both the hiding place and the officer on the bridge
 *   C · His eyes     with the officer, his line of sight out in front; when he
 *                     loses them it pulls up to show where they went
 */
import { INK, PAPER, RED } from '../../album.mjs'
import { DASH } from './styles.mjs'
import { zoom, camOf, plan, drawn, ownerSvg, crewSvg, sheet, ease, ramp, lerp, r } from './motion.mjs'
import { HOUSE, inked, travel } from './sequence.mjs'
import { overlay, KEY2, O2, SHEET2 } from './job2.mjs'
import { timed } from './job2.mjs'
import { VARIANTS as STUDIOS } from './heists/studio.mjs'

export const CHASE_WINDOW = { from: 74, to: 102 }
const SPOT = 78.4
/*
 * They slip out of the park as soon as the officer has run past them up High
 * Street with his back turned (the user, 2026-11-06), take the direct street
 * east, and are standing at the studio's door by 98.4, a second and a half
 * before verse 3 (99.95), when heist 3 starts. The run is at the chase's own
 * pace, never faster, and eases to a stop.
 */
const HIDE = [87.2, 90.8]
export const AT_DOOR = 98.4
export const HEIST3 = 99.95

/* ── Routes (town metres, timed) ─────────────────────────────────────── */

const C1 = [O2[0] + 5.3, O2[1] + 36]
const C2 = [O2[0] + 26.6, O2[1] + 36]
/** The two of them: the same streets, the auditor a step behind and a metre to the side. */
const RUN = [
  [560, 318, SPOT], [560, 478], [480, 478], [480, 718], [400, 718], [400, 640], [392, 642], [362, 652, HIDE[0]],
  [362, 652, HIDE[1]], [392, 642], [400, 640], [640, 638], [640, 558], [674, 536], [706, 466], [731, 404, AT_DOOR - 0.6],
]
/** Where each of them waits, by the lobby window west of the door and out of the artist's way: the studio crew's first points (film.mjs). */
const O3 = STUDIOS[0].o
export const WAIT3 = [[-4, 34.4], [-3.4, 35.6]]
const DOOR1 = [O3[0] + WAIT3[0][0], O3[1] + WAIT3[0][1]]
const DOOR2 = [O3[0] + WAIT3[1][0], O3[1] + WAIT3[1][1]]
export const ROUTE1 = timed([[...C1, 76.7], [C1[0] + 1.4, 318, 77.6], ...RUN, [...DOOR1, AT_DOOR]])
export const ROUTE2 = timed([[...C2, 77], [562, 320, 78.2], ...RUN.map(([x, y, t]) => [x + 2.2, y + 2.2, t == null ? undefined : t + 0.45]), [...DOOR2, AT_DOOR + 0.45]])
/** The officer: from the east circle, round it and after them, on past the park to the bridge, looking, then away over it. */
export const COP = timed([
  [632, 288, 77.6], [632, 288, SPOT], [612, 296], [602, 318], [560, 318, 80.4], [560, 478], [480, 478], [480, 718], [400, 718], [400, 640, 89.6],
  [400, 560], [400, 452, 91.2], [400, 452, 94.4], [400, 380], [400, 318, 96.2], [300, 318, 98], [200, 318, 100.5],
])
/** Where he is looking (degrees, screen): ahead while he runs, sweeping while he stands on the bridge. */
function copLook(t) {
  const a = COP.at(t - 0.15)
  const b = COP.at(t)
  if (t >= 91.2 && t < 94.4) {
    const u = (t - 91.2) / 3.2
    return 90 + 140 * Math.sin(u * Math.PI * 1.5) // south over the park, round to the river and back
  }
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.01) return t < SPOT ? 200 : 90
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
}

/* ── Drawing the chase ───────────────────────────────────────────────── */

const pl = (c, pts) => `M${pts.map(([x, y]) => `${r(c.X(x))} ${r(c.Y(y))}`).join('L')}`
const head = (c, p, n) => `<circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="10.5" fill="${RED}"/><text x="${r(c.X(p[0]))}" y="${r(c.Y(p[1]) + 4.6)}" font-size="13" font-weight="700" fill="${PAPER}" text-anchor="middle">${n}</text>`

function chaseSvg(c, t) {
  let out = ''
  let top = ''
  for (const [route, n, style] of [[ROUTE1, 1, 'solid'], [ROUTE2, 2, 'dash']]) {
    const w = route.walked(t)
    if (!w) continue
    out += `<path d="${pl(c, w)}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" fill="none"${DASH[style] ? ` stroke-dasharray="${DASH[style]}"` : ''}/>`
    // Hidden: a faint mark only, in the trees.
    const hidden = t > HIDE[0] + 0.3 && t < HIDE[1]
    if (!hidden) top += head(c, w.at(-1), n)
    else top += `<circle cx="${r(c.X(w.at(-1)[0]))}" cy="${r(c.Y(w.at(-1)[1]))}" r="7" fill="none" stroke="${RED}" stroke-width="1.6" stroke-dasharray="2 3"/>`
  }
  const w = COP.walked(t)
  if (w) {
    out += `<path d="${pl(c, w)}" stroke="${INK}" stroke-width="1.8" stroke-dasharray="7 5" stroke-linecap="round" fill="none" opacity="0.8"/>`
    const p = w.at(-1)
    const [x, y] = [c.X(p[0]), c.Y(p[1])]
    if (t >= SPOT - 0.4) {
      // His line of sight: a dotted fan, 60 m out.
      const reach = Math.max(70, 60 * c.s)
      const d = copLook(t)
      const sp = 24
      const q1 = [x + reach * Math.cos(((d - sp) * Math.PI) / 180), y + reach * Math.sin(((d - sp) * Math.PI) / 180)]
      const q2 = [x + reach * Math.cos(((d + sp) * Math.PI) / 180), y + reach * Math.sin(((d + sp) * Math.PI) / 180)]
      out += `<path d="M${r(x)} ${r(y)}L${r(q1[0])} ${r(q1[1])}A${r(reach)} ${r(reach)} 0 0 1 ${r(q2[0])} ${r(q2[1])}Z" fill="${INK}" fill-opacity="0.07" stroke="${INK}" stroke-width="0.9" stroke-dasharray="1 4" stroke-linecap="round"/>`
    }
    top += `<circle cx="${r(x)}" cy="${r(y)}" r="10" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><text x="${r(x)}" y="${r(y + 4.4)}" font-size="12" font-weight="700" fill="${INK}" text-anchor="middle">P</text>`
  }
  return out + top
}

/* ── The studio, waiting for heist 3 ─────────────────────────────────── */

const STUDIO = { ...STUDIOS[0], crew: [], figures: [], owners: [] }
/** The studio with the fluke road coming up to its door, so they are seen arriving. */
export const STUDIO_VIEW = { cx: STUDIO.o[0] + STUDIO.view[0], cy: STUDIO.o[1] + STUDIO.view[1] + 9, s: 12.6 }
const KEY_CHASE = { crew: KEY2.crew, figures: [{ label: 'The police', mark: 'P' }] }

/* ── One frame ───────────────────────────────────────────────────────── */

const stripHeads = (svg) => svg.replace(new RegExp(`<circle[^>]*r="10.5" fill="${RED}"/><text[^>]*>[12]</text>`, 'g'), '')

function frame({ t, score, uid, v, studioInk }) {
  const c = camOf(v)
  // Heist 2's plan with its routes, the crew's marks handed on to the chase.
  const two = plan(overlay(t), c, t, `${uid}-q`)
  const studio = studioInk > 0 ? plan(inked(STUDIO, studioInk), c, t, `${uid}-s`) : ''
  const body = `${plan(drawn(1), c, t, `${uid}-p`)}${ownerSvg(c, t)}${crewSvg(c, t, uid)}${travel(c, t)}${t < 77 ? two : stripHeads(two)}${studio}${chaseSvg(c, t)}`
  const house = 1 - ramp(t, 77, 78.2)
  const chase = Math.min(ramp(t, 78, 79.2), 1 - ramp(t, 97.4, 98.4))
  const next = ramp(t, 98.4, 99.4)
  let svg
  if (t < 78) svg = sheet({ c, uid, time: t, score, body, chrome: house, job: KEY2, titles: SHEET2 })
  else if (t < 98.4) svg = sheet({ c, uid, time: t, score, body, chrome: 0, key: chase, job: KEY_CHASE })
  else svg = sheet({ c, uid, time: t, score, body, chrome: next, key: next, job: { crew: KEY2.crew, owners: [] }, titles: STUDIO.sheet })
  return { svg, label: 'Police chase 1' }
}

/* ── A · From above ──────────────────────────────────────────────────── */

const ABOVE = { cx: 548, cy: 526, s: 1.5 }
export function chaseAbove({ time, score, uid = 'film' }) {
  const t = time
  let v
  // Down onto the studio as they come up the fluke road, landed and inked before they reach its door.
  if (t < 77) v = HOUSE
  else if (t < 80.6) v = zoom(HOUSE, ABOVE, ease(ramp(t, 77, 80.6)))
  else if (t < 94.6) v = zoom(ABOVE, { ...ABOVE, s: ABOVE.s * 1.05 }, ramp(t, 80.6, 94.6))
  else v = zoom({ ...ABOVE, s: ABOVE.s * 1.05 }, STUDIO_VIEW, ease(ramp(t, 94.6, AT_DOOR)))
  return frame({ t, score, uid, v, studioInk: ease(ramp(t, 95.0, AT_DOOR - 0.4)) })
}

/* ── B · On their heels ──────────────────────────────────────────────── */

function behind(t, span = 0.7) {
  let x = 0
  let y = 0
  const n = 9
  for (let k = 0; k < n; k++) {
    const p = ROUTE1.at(t - span + (2 * span * k) / (n - 1))
    x += p[0] / n
    y += p[1] / n
  }
  return [x, y]
}
const BOTH = { cx: 384, cy: 552, s: 2.9 }
export function chaseHeels({ time, score, uid = 'film' }) {
  const t = time
  const close = (q) => { const [x, y] = behind(q); return { cx: x, cy: y, s: 4.6 } }
  let v
  if (t < 77) v = HOUSE
  else if (t < 79.4) v = zoom(HOUSE, close(t), ease(ramp(t, 77, 79.4)))
  else if (t < 86.4) v = close(t)
  else if (t < 88.4) v = zoom(close(t), BOTH, ease(ramp(t, 86.4, 88.4)))
  else if (t < 92.6) v = BOTH
  else if (t < 94.4) v = zoom(BOTH, close(t), ease(ramp(t, 92.6, 94.4)))
  else if (t < 96.6) v = close(t)
  else v = zoom(close(t), STUDIO_VIEW, ease(ramp(t, 96.6, 99.8)))
  return frame({ t, score, uid, v, studioInk: ease(ramp(t, 96.8, 99.6)) })
}

/* ── C · His eyes ────────────────────────────────────────────────────── */

function onHim(t, span = 0.6) {
  let x = 0
  let y = 0
  const n = 9
  for (let k = 0; k < n; k++) {
    const p = COP.at(t - span + (2 * span * k) / (n - 1))
    x += p[0] / n
    y += p[1] / n
  }
  return [x, y]
}
const REVEAL = { cx: 540, cy: 520, s: 1.6 }
export function chaseEyes({ time, score, uid = 'film' }) {
  const t = time
  // Ahead of him by a little, so his line of sight has room on screen.
  const his = (q) => { const [x, y] = onHim(q); const d = (copLook(q) * Math.PI) / 180; return { cx: x + 22 * Math.cos(d), cy: y + 22 * Math.sin(d), s: 3.8 } }
  let v
  if (t < 77) v = HOUSE
  else if (t < 79.6) v = zoom(HOUSE, his(79.6), ease(ramp(t, 77, 79.6)))
  else if (t < 93.8) v = his(Math.min(t, 91.2))
  else if (t < 96.4) v = zoom(his(91.2), REVEAL, ease(ramp(t, 93.8, 96.4)))
  else v = zoom(REVEAL, STUDIO_VIEW, ease(ramp(t, 96.4, 99.8)))
  return frame({ t, score, uid, v, studioInk: ease(ramp(t, 96.8, 99.6)) })
}

export const CHASE_TESTS = [
  { key: 'a', label: 'A · From above', film: chaseAbove },
  { key: 'b', label: 'B · On their heels', film: chaseHeels },
  { key: 'c', label: 'C · His eyes', film: chaseEyes },
]
void lerp
