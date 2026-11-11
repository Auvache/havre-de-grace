/*
 * Ship to Stockholm · the road trip — the camera.
 *
 * It tracks the dot the way Andalusia's chart tracks the ship: never on the
 * dot itself but on the average of where it has just been and where it is
 * about to be, a little more of the road ahead than behind, so the frame
 * glides while the dot turns corners, and it is already easing off when the
 * dot stops. It never cuts and never stands still while the dot is moving.
 *
 * How far it stands off is the place's own (trip.mjs `scaleAt`): close in
 * the East where the roads tangle, further out on the plains and in the West
 * where there is ground to cover, so the dot's pace on the sheet stays much
 * the same. For the boat it leans out over the lake.
 *
 * The last move is one even pull-out, from the dot at the Pacific to the
 * whole country, held for the last bar and a half before the end card.
 */
import { glide, easeCamera } from '../../album.mjs'
import { ramp } from '../../kit.mjs'
import { distAt, pointAt, scaleAt } from './trip.mjs'
import { COUNTRY } from './map.mjs'

/** Seconds of road behind and ahead that the camera averages over. */
const BEHIND = 1.5
const AHEAD = 2.7
const TAPS = 15

function follow(time) {
  let [x, y, w] = [0, 0, 0]
  for (let i = 0; i < TAPS; i++) {
    const u = i / (TAPS - 1)
    const p = pointAt(distAt(time - BEHIND + u * (BEHIND + AHEAD)))
    const k = 0.5 - 0.5 * Math.cos(2 * Math.PI * (u * 0.92 + 0.04))
    x += p.x * k
    y += p.y * k
    w += k
  }
  return [x / w, y / w]
}

/** Where the dot sits on the plate, as pixels off the middle (x right, y down). */
const LEAN = [
  { t: 0, v: { x: -40, y: 0 } }, { t: 30, v: { x: 0, y: 0 } },
  // Out over the lake while he waits for a boat that has gone.
  { t: 79, v: { x: 0, y: 0 } }, { t: 85.5, v: { x: 250, y: 30 } }, { t: 90, v: { x: 250, y: 30 } }, { t: 98, v: { x: 0, y: 0 } },
  // The end of the road: the ocean takes the left of the frame.
  { t: 220, v: { x: 0, y: 0 } }, { t: 226, v: { x: -110, y: 0 } },
]

/** The last pull-out. */
export const PULL = [228.0, 243.1]

/** 0 → 1 across [t0, t1] at an even rate, with a soft start and stop (a seconds, b seconds). */
function even(t, t0, t1, a = 1.6, b = 1.8) {
  const T = t1 - t0
  const v = 1 / (T - a / 2 - b / 2)
  const x = Math.max(0, Math.min(T, t - t0))
  if (x < a) return (v * x * x) / (2 * a)
  if (x <= T - b) return v * (x - a / 2)
  return 1 - (v * (T - x) ** 2) / (2 * b)
}

function driving(time) {
  const [fx, fy] = follow(time)
  // The scale is the place's (trip.mjs), averaged like the position so it never steps; the opening sits closer and eases out.
  let s = 0
  for (let i = 0; i < 5; i++) s += scaleAt(distAt(time - 1 + i * 0.75)) / 5
  // Through the intro it is drawing slowly back from the city, so the black lifts off a film already under way.
  s *= 1 + 0.2 * (1 - easeCamera(ramp(time, 6, 33)))
  const lean = glide(time, LEAN)
  return { cx: fx - lean.x / s, cy: fy - lean.y / s, s }
}

/** The view at `time`: { cx, cy, s }. */
export function viewAt(time) {
  if (time <= PULL[0]) return driving(time)
  // A zoom as a zoom travels: the scale in log, the centre moving in step with it.
  const a = driving(PULL[0])
  const b = COUNTRY
  const u = even(time, PULL[0], PULL[1])
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * u)
  const k = (1 / a.s - 1 / s) / (1 / a.s - 1 / b.s)
  return { cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, s }
}
