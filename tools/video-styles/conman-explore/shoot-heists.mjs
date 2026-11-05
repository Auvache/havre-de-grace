/*
 * One heist's alternatives as atlas sheets, each at the end of its job.
 *   node .../shoot-heists.mjs heists/<file>.mjs <outdir> [key...] [--time=]
 * The module exports VARIANTS: jobs with key, title, about, sheet, words,
 * o, view, foot, walls, tone, items, rooms, marks, storeys, dims, owners,
 * figures, crew. Writes <outdir>/<key>.png and <outdir>/<key>.html.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { jobFrame } from '../../../shared/video/films/conman-heists/atlas-plan.mjs'

const args = process.argv.slice(2)
const pos = args.filter((a) => !a.startsWith('--'))
const { VARIANTS } = await import(pathToFileURL(resolve(pos[0])).href)
const out = resolve(pos[1])
mkdirSync(out, { recursive: true })
const keys = pos.slice(2)
const tArg = args.find((a) => a.startsWith('--time='))?.slice(7)
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const head = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap">
<style>html,body{margin:0;background:#111}svg{display:block;width:1600px;height:900px;font-family:Jost,system-ui,sans-serif;font-variant-ligatures:none}</style>`
for (const job of VARIANTS.filter((j) => !keys.length || keys.includes(j.key))) {
  const name = `${job.key}${tArg ? `-${tArg}` : ''}`
  const html = resolve(out, `${name}.html`)
  writeFileSync(html, `${head}<svg viewBox="0 0 1600 900">${jobFrame(job, tArg ? { time: Number(tArg) } : {})}</svg>`)
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', `--screenshot=${resolve(out, `${name}.png`)}`, '--window-size=1600,900', `file://${html}`], { stdio: 'ignore' })
  console.log(resolve(out, `${name}.png`))
}
