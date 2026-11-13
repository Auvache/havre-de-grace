/*
 * Bakes the alphabet in the titles' Hairline type into
 * shared/video/films/crossword/letters.mjs, so Ivory's crossword can draw each
 * letter on stroke by stroke in the browser, the way the opening draws "Ivory"
 * (setting type needs fontkit, which only runs in Node).
 *
 *   node tools/video-styles/titles/bake-letters.mjs
 *
 * Each letter is set alone at size 100, centred on x = 0 with its baseline at
 * y = 0: { d, mask, pen } exactly as drawLines() takes them.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadFaces, setLine } from '../hairline.mjs'

await loadFaces()
const out = {}
for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  const [L] = setLine(ch, 0, 0, 100).letters
  if (!L.mask) throw new Error(`no skeleton for ${ch}: add it to tools/video-styles/stroke-letters.mjs`)
  out[ch] = L
}

const file = resolve(dirname(fileURLToPath(import.meta.url)), '../../../shared/video/films/crossword/letters.mjs')
mkdirSync(dirname(file), { recursive: true })
writeFileSync(file, `/*
 * The alphabet in the titles' Hairline type, baked — GENERATED, do not edit.
 * \`node tools/video-styles/titles/bake-letters.mjs\`. Size 100, centred on
 * x = 0, baseline y = 0; cap height ${(72.7).toFixed(1)}.
 */
export const LETTERS = ${JSON.stringify(out)}
`)
console.log('wrote', file, Object.keys(out).join(''))
