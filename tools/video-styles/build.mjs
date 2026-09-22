/*
 * Renders every style module in ./styles to public/video-styles/<id>.svg.
 *
 *   node tools/video-styles/build.mjs
 *
 * The sheets are checked in — the page reads them as raw markup so the site's
 * Jost applies — but they are generated, so a change to a style belongs in its
 * module here and not in the .svg.
 */
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { sheet } from './frame.mjs'
import { endCardSheet } from './endcard.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const stylesDir = resolve(here, 'styles')
const outDir = resolve(here, '../../public/video-styles')

mkdirSync(outDir, { recursive: true })

const files = readdirSync(stylesDir).filter((name) => name.endsWith('.mjs')).sort()
let written = 0

for (const file of files) {
  const module = await import(pathToFileURL(resolve(stylesDir, file)).href)
  const style = module.default
  if (!style?.id) throw new Error(`${file} has no default export with an id`)
  if ((style.thumbs ?? []).length !== 5) throw new Error(`${style.id}: expected 5 thumbnails, got ${(style.thumbs ?? []).length}`)
  const svg = namespaceIds(sheet(style), style.id)
  writeFileSync(resolve(outDir, `${style.id}.svg`), svg)
  written++
  console.log(`  ${style.id.padEnd(26)} ${(svg.length / 1024).toFixed(1)} kB`)
}

// The end card belongs to no style, so it is written once rather than seven times.
writeFileSync(resolve(outDir, 'end-card.svg'), namespaceIds(endCardSheet(), 'end-card'))
written++
console.log(`  ${'end-card'.padEnd(26)} shared`)

console.log(`\n${written} sheet${written === 1 ? '' : 's'} → public/video-styles/`)

/*
 * Every id in a sheet is prefixed with that sheet's own id.
 *
 * Sheets inlined into one page would otherwise share `thumb-0`,
 * `hero-clip` and a dozen filter names between them, and `url(#thumb-0)`
 * resolves to whichever one is first in the document — so the second sheet on
 * the page would be clipped by the first sheet's geometry. Prefixing is also
 * why the standalone files can be opened two at a time in one tab.
 */
function namespaceIds(svg, prefix) {
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]))
  if (!ids.size) return svg
  const rename = (id) => (ids.has(id) ? `${prefix}--${id}` : id)
  return svg
    .replace(/(\sid=")([^"]+)(")/g, (_, a, id, b) => a + rename(id) + b)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${rename(id)})`)
    .replace(/(href=")#([^"]+)(")/g, (_, a, id, b) => `${a}#${rename(id)}${b}`)
    .replace(/(aria-labelledby=")([^"]+)(")/g, (_, a, list, b) => a + list.split(/\s+/).map(rename).join(' ') + b)
}
