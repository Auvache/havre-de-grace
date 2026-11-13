/*
 * Walks Ivory's crossword (shared/video/films/crossword.mjs) at 30 fps and checks
 * the user's rules (2026-11-13):
 *   - never two written IVORYs in one frame (until the final pull-back),
 *   - never more than three words being written at once,
 *   - every square being written is in frame,
 *   - and reports how much of the song the camera is moving.
 *
 *   node tools/video-styles/crossword/check.mjs
 */
import { IVORY_SCORE as score } from '../../../app/config/ivoryScore.ts'
import { crosswordPlan, crosswordCamera } from '../../../shared/video/films/crossword.mjs'
import { inView, CELL, PLATE } from '../../../shared/video/films/crossword/stations.mjs'

{
  const plan = crosswordPlan(score)
  const lastIvory = Math.max(...plan.writes.filter((w) => w.hers).map((w) => w.end))
  let bad = 0
  let moving = 0
  let maxAtOnce = 0
  let prev = null
  const fps = 30
  for (let f = 0; f < score.endCardAt * fps; f++) {
    const t = f / fps
    const v = crosswordCamera(score, t)
    const ivs = plan.writes.filter((w) => w.hers && t >= w.start && inView(v, w.entry.cells))
    if (ivs.length > 1 && t < lastIvory + 0.8) { bad++; if (bad < 12) console.log(`${t.toFixed(2)}s: ${ivs.length} IVORYs in frame`) }
    const now = plan.writes.filter((w) => t >= w.start && t < w.end)
    maxAtOnce = Math.max(maxAtOnce, now.length)
    if (now.length > 3) { bad++; console.log(`${t.toFixed(2)}s: ${now.length} words at once`) }
    for (const w of now) {
      const j = Math.min(w.entry.cells.length - 1, Math.floor((t - w.start) / w.step))
      const [c, r] = w.entry.cells[j]
      const inside = Math.abs((c + 0.5) * CELL - v.x) * v.s < PLATE.w / 2 - 10 && Math.abs((r + 0.5) * CELL - v.y) * v.s < PLATE.h / 2 - 10
      if (!inside) { bad++; if (bad < 24) console.log(`${t.toFixed(2)}s: ${w.entry.word} written out of frame`) }
    }
    if (prev && (Math.abs(v.x - prev.x) > 0.01 || Math.abs(v.s - prev.s) > 1e-5)) moving++
    prev = v
  }
  console.log(`${bad ? `${bad} frames break a rule` : 'every rule holds'}; most words at once ${maxAtOnce}; camera moving ${(moving / fps).toFixed(1)} s of ${score.endCardAt.toFixed(0)}`)
  console.log('moves:', plan.keys.map(([t]) => t.toFixed(1)).join(' '))

}
