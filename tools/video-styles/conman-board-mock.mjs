/*
 * The stills of Conman's board (shared/video/films/conman-board-stills.mjs) on
 * one static sheet, for rasterising and reading without a dev server — the
 * same stills /music-videos/conman shows.
 *
 *   node tools/video-styles/conman-board-mock.mjs            # writes .conman-board.html
 *   PICK=0,3,4 node tools/video-styles/conman-board-mock.mjs # just those stills
 *   OUT=<path> …                                              # somewhere else
 */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOARD_STILLS, BOARD_STILL_GROUPS } from '../../shared/video/films/conman-board-stills.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const pick = (process.env.PICK ?? '').split(',').filter(Boolean).map(Number)
const shown = BOARD_STILLS.map((f, i) => ({ ...f, i })).filter((f) => !pick.length || pick.includes(f.i))
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
let body = ''
for (const [g, title] of BOARD_STILL_GROUPS) {
  const fs = shown.filter((f) => f.group === g)
  if (!fs.length) continue
  body += `<h2>${title}</h2><div class="grid">`
  for (const f of fs) body += `<figure class="${f.big ? 'big' : ''}"><svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" font-family="Jost">${f.svg(`s${f.i}`)}</svg><figcaption><b>${f.at ? `${esc(f.at)} · ` : ''}${esc(f.title)}</b> — ${esc(f.note)}</figcaption></figure>`
  body += '</div>'
}
const html = `<!doctype html><meta charset="utf-8"><title>Conman — the board, stills</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=block" rel="stylesheet">
<style>body{margin:0;padding:20px 24px 60px;background:#111;color:#ddd;font:15px/1.45 Jost,system-ui}h2{font-weight:600;margin:28px 0 12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0}figure.big{grid-column:1/-1}svg{width:100%;display:block;background:#000}figcaption{margin-top:6px;color:#aaa}figcaption b{color:#eee}</style>${body}`
const out = process.env.OUT ?? resolve(root, '.conman-board.html')
writeFileSync(out, html)
console.log(`${shown.length} stills → ${out}`)
