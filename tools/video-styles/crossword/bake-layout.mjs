/*
 * Searches for Ivory's crossword grid and bakes the best
 * into shared/video/films/crossword/layout.mjs.
 *
 *   node tools/video-styles/crossword/bake-layout.mjs [seeds] [keep] [tries]
 *
 * Each seed is one search (buildBeam) over every word of the lyric, block by
 * block: the `keep` best grids so far each get `tries` goes at the next
 * block. The grids it finishes are scored by judge(): two written IVORYs in
 * one frame is never allowed; blocks that spill out of their frames cost
 * less. Then the one-letter words are placed (placeSingles). Same arguments,
 * same grid. About 20 s a seed at 8 × 2500. `DRY=1` prints the result and
 * writes nothing; `SHOW=1` prints the grid; `FROM=n` starts at seed n (to
 * run ranges of seeds side by side, then bake the winner alone).
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { IVORY_SCORE as score } from '../../../app/config/ivoryScore.ts'
import { rng } from '../../../shared/video/kit.mjs'
import { buildBeam, judge, assemble, wordsOf, placeSingles, shotsOf } from '../../../shared/video/films/crossword/stations.mjs'

const seeds = Number(process.argv[2] ?? 12)
const keep = Number(process.argv[3] ?? 8)
const tries = Number(process.argv[4] ?? 2500)
const { words, singles } = wordsOf(score)
let best = null
let built = 0
const began = Date.now()
for (let seed = Number(process.env.FROM ?? 1); seed <= seeds; seed++) {
  const grids = buildBeam(rng(seed), words, keep, tries, 0.4 + (seed % 4) * 0.5)
  if (!grids.length) { console.log(`seed ${seed}: stuck at ${buildBeam.failed}`); continue }
  let mine = Infinity
  for (const list of grids) {
    built++
    const { cost, notes } = judge(list)
    mine = Math.min(mine, cost)
    if (!best || cost < best.cost) best = { seed, cost, notes, list }
  }
  console.log(`seed ${seed}: ${grids.length} grids, best ${mine.toFixed(1)}`)
}
if (!best) throw new Error('no grid built')
const timeOf = (e) => score.lines[e.line].words[e.wi].t
const list = [...best.list, ...placeSingles(best.list, singles, timeOf)]
const { bounds, cells } = assemble(list)
const lone = list.filter((e) => e.word.length === 1 && !e.rides)
console.log(`${built} grids from ${seeds} seeds in ${((Date.now() - began) / 1000).toFixed(0)} s; best seed ${best.seed}, cost ${best.cost.toFixed(1)}; ${bounds.c1 - bounds.c0 + 1} × ${bounds.r1 - bounds.r0 + 1} cells, ${cells.size} squares, ${list.length} words (${singles.length} of one letter, ${lone.length} on their own: ${lone.map((e) => `${e.word}@${e.line}`).join(' ')})`)
for (const n of best.notes) console.log('  ', n)
for (const sh of shotsOf(assemble(best.list).entries)) console.log(`   station ${sh.station}: ${sh.view.s.toFixed(2)}×${sh.ivory ? ' (her name)' : ''}`)

if (!process.env.DRY) {
  const file = resolve(dirname(fileURLToPath(import.meta.url)), '../../../shared/video/films/crossword/layout.mjs')
  writeFileSync(file, `/*
 * Ivory's crossword grid — GENERATED, do not edit.
 * \`node tools/video-styles/crossword/bake-layout.mjs ${seeds} ${keep} ${tries}\`: seed ${best.seed}, cost ${best.cost.toFixed(1)}.
 * [word, column, row, down, station, line, word in the line, 1 if a one-letter word rides on another word's square]
 */
export const LAYOUT = [
${list.map((e) => `  [${JSON.stringify(e.word)}, ${e.c}, ${e.r}, ${e.down}, ${e.station}, ${e.line}, ${e.wi}${e.rides ? ', 1' : ''}],`).join('\n')}
]
`)
  console.log('wrote', file)
}

// A picture of it, for the terminal.
if (process.env.SHOW) {
  for (let r = bounds.r0; r <= bounds.r1; r++) {
    let row = ''
    for (let c = bounds.c0; c <= bounds.c1; c++) row += cells.get(`${c},${r}`)?.ch ?? '·'
    console.log(row)
  }
}
