/*
 * Walks Ivory's crossword (shared/video/films/crossword.mjs) at 30 fps and checks
 * its rules:
 *   - every word of the lyric is on the board, and starts on its own onset,
 *   - never two written IVORYs in one frame (until the final pull-back),
 *   - every square being written is in frame,
 *   - the butterfly is in frame from when it is drawn until it leaves, her
 *     squares under it stay blank, and it never jumps or flips (60 fps),
 *   - and reports the most words written at once, each shot's scale, and how
 *     much of the song the camera is moving.
 *
 *   node tools/video-styles/crossword/check.mjs
 */
import { IVORY_SCORE as score } from '../../../app/config/ivoryScore.ts'
import { crosswordPlan, crosswordCamera, crosswordButterfly, CROSSWORD_FLIGHT as FLIGHT } from '../../../shared/video/films/crossword.mjs'
import { inView, CELL, PLATE, clean } from '../../../shared/video/films/crossword/stations.mjs'

{
  const plan = crosswordPlan(score)
  let bad = 0
  const say = (msg) => { bad++; if (bad < 40) console.log(msg) }

  // Every sung word, once, on its onset.
  const sung = score.lines.flatMap((l) => l.words.map((w, wi) => `${l.index}:${wi}:${clean(w.text)}`))
  const written = new Set(plan.writes.map((w) => `${w.entry.line}:${w.entry.wi}:${w.entry.word}`))
  for (const k of sung) if (!written.has(k)) say(`not on the board: ${k}`)
  if (written.size !== sung.length || plan.writes.length !== sung.length) say(`${plan.writes.length} words written, ${sung.length} sung`)
  for (const w of plan.writes) if (Math.abs(w.start - score.lines[w.entry.line].words[w.entry.wi].t) > 1e-6) say(`${w.entry.word} starts off its onset`)

  const lastIvory = Math.max(...plan.writes.filter((w) => w.hers).map((w) => w.end))
  let moving = 0
  let maxAtOnce = 0
  let prev = null
  const fps = 30
  const inside = (x, y, v, margin) => Math.abs(x - v.x) * v.s < PLATE.w / 2 - margin && Math.abs(y - v.y) * v.s < PLATE.h / 2 - margin
  for (let f = 0; f < score.endCardAt * fps; f++) {
    const t = f / fps
    const v = crosswordCamera(score, t)
    const ivs = plan.writes.filter((w) => w.hers && t >= w.start && inView(v, w.entry.cells))
    if (ivs.length > 1 && t < lastIvory + 0.8) say(`${t.toFixed(2)}s: ${ivs.length} IVORYs in frame`)
    const now = plan.writes.filter((w) => t >= w.start && t < w.end)
    maxAtOnce = Math.max(maxAtOnce, now.length)
    for (const w of now) {
      const j = Math.min(w.entry.cells.length - 1, Math.floor((t - w.start) / w.step))
      const [c, r] = w.entry.cells[j]
      // (A square another word wrote first is not being written now.)
      if (plan.letters.get(`${c},${r}`)?.at < w.start + j * w.step - 1e-6) continue
      if (!inside((c + 0.5) * CELL, (r + 0.5) * CELL, v, 10)) say(`${t.toFixed(2)}s: ${w.entry.word} written out of frame`)
    }
    const b = crosswordButterfly(score, t)
    if (b && t < FLIGHT.leave && !inside(b.x, b.y, v, 40)) say(`${t.toFixed(2)}s: the butterfly is out of frame`)
    if (prev && (Math.abs(v.x - prev.x) > 0.01 || Math.abs(v.s - prev.s) > 1e-5)) moving++
    prev = v
  }
  // Nothing is written under the butterfly while it sits.
  const sat = crosswordButterfly(score, FLIGHT.land + 1)
  for (const [k, L] of plan.letters) {
    const [c, r] = k.split(',').map(Number)
    if (sat && L.at < FLIGHT.leave && L.at + 2 > FLIGHT.land && Math.hypot((c + 0.5) * CELL - sat.x, (r + 0.5) * CELL - sat.y) < CELL * 0.9) say(`${L.ch} is written under the butterfly at ${L.at.toFixed(2)}`)
  }
  // The butterfly never jumps: frame to frame at 60 fps, in cells.
  let jump = 0
  let spin = 0
  for (let t = FLIGHT.draw[0]; t < FLIGHT.gone - 0.05; t += 1 / 60) {
    const a = crosswordButterfly(score, t)
    const b = crosswordButterfly(score, t + 1 / 60)
    if (!a || !b) continue
    jump = Math.max(jump, Math.hypot(b.x - a.x, b.y - a.y) / CELL)
    spin = Math.max(spin, Math.abs(((b.turn - a.turn + 540) % 360) - 180))
  }
  if (jump > 0.4) say(`the butterfly jumps ${jump.toFixed(2)} cells in a frame`)
  if (spin > 10) say(`the butterfly turns ${spin.toFixed(0)}° in a frame`)
  console.log(`${bad ? `${bad} problems` : 'every rule holds'}; ${plan.writes.length} words, ${plan.letters.size} letters; most words at once ${maxAtOnce}; camera moving ${(moving / fps).toFixed(1)} s of ${score.endCardAt.toFixed(0)}; the butterfly's fastest frame ${jump.toFixed(2)} cells, sharpest turn ${spin.toFixed(1)}°`)
  console.log('shots:', plan.shots.map((sh) => `${sh.station}@${sh.view.s.toFixed(2)}`).join(' '))
  console.log('moves:', plan.keys.map(([t]) => t.toFixed(1)).join(' '))
}
