/*
 * The record-shop alternatives, each at the end of the job (the whole route
 * walked), in the atlas.   node .../shoot-shops.mjs <outdir> [key...] [--time=41.6]
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { SHOPS } from '../../../shared/video/films/conman-heists/shop.mjs'
import { shopFrame } from '../../../shared/video/films/conman-heists/atlas-plan.mjs'

const args = process.argv.slice(2)
const out = resolve(args[0])
mkdirSync(out, { recursive: true })
const keys = args.slice(1).filter((a) => !a.startsWith('--'))
const tArg = args.find((a) => a.startsWith('--time='))?.slice(7)
const time = tArg ? Number(tArg) : undefined
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const head = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap">
<style>html,body{margin:0;background:#111}svg{display:block;width:1600px;height:900px;font-family:Jost,system-ui,sans-serif;font-variant-ligatures:none}</style>`
for (const job of SHOPS.filter((j) => !keys.length || keys.includes(j.key))) {
  const name = `shop-${job.key}${args.some((a) => a.startsWith('--time=')) ? `-${time}` : ''}`
  const html = resolve(out, `${name}.html`)
  writeFileSync(html, `${head}<svg viewBox="0 0 1600 900">${shopFrame(job, time == null ? {} : { time })}</svg>`)
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', `--screenshot=${resolve(out, `${name}.png`)}`, '--window-size=1600,900', `file://${html}`], { stdio: 'ignore' })
  console.log(`${name}.png`)
}
