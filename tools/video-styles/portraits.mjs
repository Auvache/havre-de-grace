/*
 * The wall sheet: every picture on Conman's wall, framed, one page — the
 * three leads, the anonymous sitters, the still lifes.
 *
 *   node tools/video-styles/portraits.mjs              # all of them
 *   node tools/video-styles/portraits.mjs page jack    # just those
 *   TORN=1 node tools/video-styles/portraits.mjs       # with every piece torn out
 *   OUT=<path> COLS=3 node tools/video-styles/portraits.mjs
 *
 * Writes .portraits.html (gitignored with the other review sheets). The names
 * in the captions are for review only; nothing in the film prints a name.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCENES, PW, PH, portraitDefs, sceneSvg, piecesOf, pieceSvg, openingD, mouldingSvg } from '../../shared/video/portraits.mjs'
import '../../shared/video/still-lifes.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENES)
const cols = Number(process.env.COLS ?? 4)

const cells = ids.map((id, i) => {
  const ctx = { uid: `s${i}`, defs: new Map() }
  const spec = SCENES[id]
  const names = Object.keys(piecesOf(id))
  // With TORN, every piece is out; otherwise the first, lifted a little off its hole, to show the tear.
  const torn = process.env.TORN ? names : names.slice(0, 1)
  let body = sceneSvg(ctx, id, torn)
  if (!process.env.TORN) {
    const pts = piecesOf(id)[names[0]]
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
    body += pieceSvg(ctx, id, names[0], cx + 18, cy - 24, 9, 1.04, { shadow: 0.3, lift: 10 })
  }
  const frame = mouldingSvg(ctx, spec.frame)
  const cid = `${ctx.uid}-open`
  const svg = `<svg viewBox="-60 -60 ${PW + 120} ${PH + 120}"><defs>${portraitDefs(ctx.uid)}<clipPath id="${cid}"><path d="${openingD(spec.frame)}"/></clipPath>${[...ctx.defs.values()].join('')}</defs>
<rect x="-60" y="-60" width="${PW + 120}" height="${PH + 120}" fill="#e3dac5"/>${frame}<g clip-path="url(#${cid})">${body}</g></svg>`
  return `<figure>${svg}<figcaption>${id} · ${spec.kind}${spec.hint ? ` — ${spec.hint}` : ''}</figcaption></figure>`
}).join('\n')

const out = resolve(root, process.env.OUT ?? '.portraits.html')
writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>Conman — the wall</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap">
<style>
  body { margin: 0; padding: 10px; background: #111; color: #999; font: 12px/1.4 system-ui, sans-serif;
         display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 10px; }
  figure { margin: 0 } svg { width: 100%; display: block; font-family: Jost, sans-serif }
</style>
${cells}`)
console.log(`${ids.length} pictures → ${out}`)
