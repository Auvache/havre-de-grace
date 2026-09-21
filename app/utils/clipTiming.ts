/*
 * The small vocabulary the music-video styles are written in.
 *
 * Every scene on /music-video-test is a pure function of one number — the local
 * time in the clip — so there is no animation state anywhere: no timeline
 * objects, no CSS keyframes to keep in step with the audio, nothing that can
 * drift out of sync or be left mid-transition when the clip is scrubbed or
 * replayed. Seek the audio to 6.4 s and the frame at 6.4 s is what draws.
 *
 * That only works if "what has this element done by now" is cheap to express,
 * which is what these are for: `ramp` for a move between two moments, `decay`
 * for a hit that rings out, `seeded` for scatter that survives SSR.
 */

export const clamp01 = (value: number): number =>
  value < 0 ? 0 : value > 1 ? 1 : value

export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount

/** Linear 0→1 across [from, to], flat outside it. `to <= from` snaps at `from`. */
export const ramp = (t: number, from: number, to: number): number =>
  to <= from ? (t < from ? 0 : 1) : clamp01((t - from) / (to - from))

/** 0 before `from`, 1 after `to`, and 1→0 across the two — `ramp` reversed. */
export const fall = (t: number, from: number, to: number): number =>
  1 - ramp(t, from, to)

export const easeOut = (x: number): number => 1 - (1 - x) ** 3
export const easeIn = (x: number): number => x * x * x
export const easeInOut = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2

/** Overshoots past 1 and settles back. For type and shapes that snap in. */
export const easeOutBack = (x: number, overshoot = 1.7): number => {
  const c = overshoot + 1
  return 1 + c * (x - 1) ** 3 + overshoot * (x - 1) ** 2
}

/**
 * A hit at `at` that rings out over `halfLife`, silent before it.
 *
 * This is the shape of a struck thing — a strum accent, a footfall, a syllable
 * landing — and is what the styles multiply into scale, glow and offset so a
 * hit reads as an impulse rather than a state change.
 */
export const decay = (t: number, at: number, halfLife = 0.28): number => {
  if (t < at) return 0
  return Math.exp(-(t - at) / halfLife)
}

/** The loudest still-ringing hit from a list of weighted moments. */
export const decayAmong = (
  t: number,
  hits: readonly { t: number, weight: number }[],
  halfLife = 0.2,
): number => {
  let out = 0
  for (const hit of hits) {
    if (hit.t > t) break
    const value = hit.weight * decay(t, hit.t, halfLife)
    if (value > out) out = value
  }
  return out
}

/** Sine oscillation in 0..1 at `hz`, `phase` in turns. */
export const wave = (t: number, hz: number, phase = 0): number =>
  0.5 + 0.5 * Math.sin((t * hz + phase) * Math.PI * 2)

/**
 * mulberry32. Deterministic scatter for stars, grain and footprints.
 *
 * Every page here is prerendered, so `Math.random()` at render time would give
 * the server one sky and the client another and hydration would tear. A seeded
 * generator gives both the same one.
 */
export const seeded = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let x = state
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

/** Rounds for the DOM: SVG attributes do not need 15 decimal places. */
export const round = (value: number, places = 2): number => {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

/**
 * The draw-on every hand-inked line uses: dash attributes that reveal the
 * first `progress` of a path.
 *
 * Requires `pathLength="1"` on the element, which is the whole trick — SVG then
 * scales every dash length into that unit, so a line can be half-drawn without
 * anyone measuring it. The alternative is `getTotalLength()` per path on mount,
 * which means a DOM read before the first frame can be right, and a guessed
 * constant in the markup that silently rescales the reveal when the path is
 * edited.
 */
export const drawn = (progress: number) => ({
  'stroke-dasharray': 1,
  'stroke-dashoffset': round(1 - clamp01(progress), 4),
})
