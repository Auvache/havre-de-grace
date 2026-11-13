/*
 * Searches for Ivory's crossword grid and bakes the best
 * into shared/video/films/crossword/layout.mjs.
 *
 *   node tools/video-styles/crossword/bake-layout.mjs [tries]
 *
 * Each try is one seeded beam search (buildBeam), and every grid it finishes is scored by
 * judge(): two written IVORYs in one frame is never allowed; cramped stations
 * and pans too short or too long cost less. Same tries, same grid.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { rng } from '../../../shared/video/kit.mjs'
import { buildBeam, judge, assemble } from '../../../shared/video/films/crossword/stations.mjs'

const tries = Number(process.argv[2] ?? 12)
let best = null
let built = 0
for (let seed = 1; seed <= tries; seed++) {
  for (const list of buildBeam(rng(seed), 300, 0.5 + (seed % 4))) {
    built++
    const { cost, notes } = judge(list)
    if (!best || cost < best.cost) best = { seed, cost, notes, list }
  }
}
if (!best) throw new Error('no grid built')
const list = best.list
const { bounds } = assemble(list)
console.log(`${built}/${tries} built; best seed ${best.seed}, cost ${best.cost.toFixed(1)}; ${bounds.c1 - bounds.c0 + 1} × ${bounds.r1 - bounds.r0 + 1} cells; ${list.filter((e) => e.jumble).length} jumbles`)
for (const n of best.notes) console.log('  ', n)

const file = resolve(dirname(fileURLToPath(import.meta.url)), '../../../shared/video/films/crossword/layout.mjs')
writeFileSync(file, `/*
 * Ivory's crossword grid — GENERATED, do not edit.
 * \`node tools/video-styles/crossword/bake-layout.mjs ${tries}\`: seed ${best.seed}, cost ${best.cost.toFixed(1)}.
 * [word, column, row, down, station, 1 for a jumble of IVORY]
 */
export const LAYOUT = [
${list.map((e) => `  [${JSON.stringify(e.word)}, ${e.c}, ${e.r}, ${e.down}, ${e.station}${e.jumble ? ', 1' : ''}],`).join('\n')}
]
`)
console.log('wrote', file)
