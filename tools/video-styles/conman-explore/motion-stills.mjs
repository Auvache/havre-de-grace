/*
 * Stills from the motion tests, for review.
 *   node .../motion-stills.mjs <outdir> <export> <t> [t...]
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
const M = { ...(await import('../../../shared/video/films/conman-heists/motion.mjs')), ...(await import('../../../shared/video/films/conman-heists/sequence.mjs')), ...(await import('../../../shared/video/films/conman-heists/chase1.mjs')), ...(await import('../../../shared/video/films/conman-heists/film.mjs')) }
import { CONMAN_SCORE } from '../../../app/config/conmanScore.ts'

const [outArg, name, ...ts] = process.argv.slice(2)
const out = resolve(outArg)
mkdirSync(out, { recursive: true })
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const head = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap">
<style>html,body{margin:0;background:#111}svg{display:block;width:1600px;height:900px;font-family:Jost,system-ui,sans-serif;font-variant-ligatures:none}</style>`
for (const t of ts) {
  const t0 = Date.now()
  const { svg } = M[name]({ time: Number(t), score: CONMAN_SCORE, uid: 'film' })
  const ms = Date.now() - t0
  const html = resolve(out, `${name}-${t}.html`)
  writeFileSync(html, `${head}<svg viewBox="0 0 1600 900">${svg}</svg>`)
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', `--screenshot=${resolve(out, `${name}-${t}.png`)}`, '--window-size=1600,900', `file://${html}`], { stdio: 'ignore' })
  console.log(`${name}-${t}.png  ${ms} ms  ${Math.round(svg.length / 1024)} kB`)
}
