/*
 * Bakes film titles in the live videos' Hairline type into
 * shared/video/titles.mjs, so a film can draw one on in the browser
 * (hairline.mjs sets type with fontkit, which only runs in Node).
 *
 *   node tools/video-styles/titles/bake.mjs
 *
 * Each title is one line centred on the frame at the size a film opening
 * wants it (the live videos' 34 is a credit's size, too small alone).
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadFaces, setLine } from '../hairline.mjs'

const TITLES = {
  'into-the-wild': { text: 'Into the Wild', size: 54 },
  'goodbye-norma-jeane': { text: 'Goodbye, Norma Jeane', size: 54 },
  conman: { text: 'Conman', size: 54 },
  ivory: { text: 'Ivory', size: 54 },
  andalusia: { text: 'Andalusia', size: 54 },
}

await loadFaces()
const out = {}
for (const [slug, { text, size }] of Object.entries(TITLES)) out[slug] = [setLine(text, 800, 450 + size * 0.36, size)]

const file = resolve(dirname(fileURLToPath(import.meta.url)), '../../../shared/video/titles.mjs')
writeFileSync(file, `/*
 * Film titles in the live videos' Hairline type, baked — GENERATED, do not
 * edit. \`node tools/video-styles/titles/bake.mjs\`. Draw one on with
 * drawLines() from shared/video/hairline-draw.mjs.
 */
export const TITLES = ${JSON.stringify(out)}
`)
console.log('wrote', file, Object.keys(out))
