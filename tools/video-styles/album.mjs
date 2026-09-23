/*
 * The album sheets: one still per song, and all ten on one contact sheet.
 *
 *   node tools/video-styles/album.mjs              # every song, and the contact sheet
 *   node tools/video-styles/album.mjs conman ghost # just those (no contact sheet)
 *
 * Each song's module is tools/video-styles/album/<slug>.mjs with a default
 * export { slug, hero() } — hero() returns the inner markup of one 1600x900
 * frame. Where a song has a film, hero() should be a call to the film at a
 * chosen moment, so the still and the film cannot disagree.
 *
 * WHY A CONTACT SHEET
 * The album pass exists to answer one question — do ten films look like one
 * record? — and that is not answerable one frame at a time, any more than a
 * style's sameness was. Ten frames side by side is the test: if one of them
 * sticks out, it sticks out here first.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ALBUM_SONGS, PAPER, INK, RED, SECOND_INK } from '../../app/config/albumStyle.ts'
import * as ALBUM from '../../shared/video/album.mjs'

// albumStyle.ts writes the inks out rather than importing them (see its note); they must agree.
for (const [name, a, b] of [['PAPER', PAPER, ALBUM.PAPER], ['INK', INK, ALBUM.INK], ['RED', RED, ALBUM.RED],
  ...Object.keys(ALBUM.SECOND_INK).map((k) => [`SECOND_INK.${k}`, SECOND_INK[k], ALBUM.SECOND_INK[k]])]) {
  if (a !== b) throw new Error(`albumStyle.ts ${name} is ${a} but shared/video/album.mjs says ${b}`)
}

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, 'album')
const outDir = resolve(here, '../../public/video-styles/album')
mkdirSync(outDir, { recursive: true })

const only = process.argv.slice(2)
const FONT = `<style>@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&amp;display=swap');
  svg text { font-family: "Jost", "Helvetica Neue", Helvetica, Arial, sans-serif; font-variant-ligatures: none; }</style>`

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const heroes = new Map()
for (const song of ALBUM_SONGS) {
  if (only.length && !only.includes(song.slug)) continue
  const file = resolve(srcDir, `${song.slug}.mjs`)
  if (!existsSync(file)) { console.log(`  ${song.slug.padEnd(26)} — no module yet`); continue }
  let module
  try { module = await import(pathToFileURL(file).href) }
  catch (error) { console.log(`  ${song.slug.padEnd(26)} ✗ ${error.message}`); continue }
  const inner = module.default.hero()
  heroes.set(song.slug, inner)
  const svg = namespaceIds(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img" aria-label="${esc(song.title)} — ${esc(song.technique)}, album style still">${FONT}${inner}</svg>\n`, song.slug)
  writeFileSync(resolve(outDir, `${song.slug}.svg`), svg)
  console.log(`  ${song.slug.padEnd(26)} ${(svg.length / 1024).toFixed(1)} kB`)
  for (const [name, draw] of Object.entries(module.extras ?? {})) {
    const extra = namespaceIds(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">${FONT}${draw()}</svg>\n`, `${song.slug}-${name}`)
    writeFileSync(resolve(outDir, `${song.slug}-${name}.svg`), extra)
    console.log(`  ${`${song.slug}-${name}`.padEnd(26)} ${(extra.length / 1024).toFixed(1)} kB`)
  }
}

/* ── The contact sheet: two columns, five rows, in track order ────── */
if (!only.length) {
  const W = 760
  const H = 427.5
  const GAP = 40
  const X0 = 20
  const Y0 = 20
  const LABEL = 44
  const cells = ALBUM_SONGS.map((song, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = X0 + col * (W + GAP)
    const y = Y0 + row * (H + LABEL + GAP)
    const inner = heroes.get(song.slug)
    const frame = inner
      ? `<svg x="${x}" y="${y}" width="${W}" height="${H}" viewBox="0 0 1600 900">${namespaceIds(inner, `s${i}`)}</svg>`
      : `<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="#1c1c1f"/>`
    return `${frame}
      <rect x="${x}" y="${y}" width="${W}" height="${H}" fill="none" stroke="#2a2a2e"/>
      <text x="${x}" y="${y + H + 28}" font-size="17" font-weight="600" letter-spacing="2.5" fill="#e8e5de">${String(song.track).padStart(2, '0')} · ${esc(song.title.toUpperCase())}</text>
      <text x="${x + W}" y="${y + H + 28}" font-size="15" font-weight="400" fill="#77746d" text-anchor="end">${esc(song.technique)}</text>`
  }).join('\n')
  const height = Y0 + 5 * (H + LABEL + GAP) - GAP + 20
  writeFileSync(resolve(here, '../../public/video-styles/album-sheet.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 ${height}" width="1600" height="${height}" role="img" aria-label="Into the Wild — the album's ten films, one still each">${FONT}<rect width="1600" height="${height}" fill="#08080a"/>${cells}</svg>\n`)
  console.log(`\ncontact sheet → public/video-styles/album-sheet.svg (${heroes.size}/10 songs)`)
}

/* Same as build.mjs: prefix every id, so ten frames on one page do not share `plate`. */
function namespaceIds(svg, prefix) {
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]))
  if (!ids.size) return svg
  const rename = (id) => (ids.has(id) ? `${prefix}--${id}` : id)
  return svg
    .replace(/(\sid=")([^"]+)(")/g, (_, a, id, b) => a + rename(id) + b)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${rename(id)})`)
    .replace(/(href=")#([^"]+)(")/g, (_, a, id, b) => `${a}#${rename(id)}${b}`)
}
