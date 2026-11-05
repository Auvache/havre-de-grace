/*
 * Render the exploration frames to PNG, one file a frame, plus a sheet.
 *   node tools/video-styles/conman-explore/shoot.mjs <outdir> [style...] [--views=overview,mid,plan]
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { frame } from '../../../shared/video/films/conman-heists/styles.mjs'

const args = process.argv.slice(2)
const out = resolve(args[0])
mkdirSync(out, { recursive: true })
const views = (args.find((a) => a.startsWith('--views='))?.slice(8) ?? 'overview,mid,plan').split(',')
const styles = args.slice(1).filter((a) => !a.startsWith('--'))
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const head = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap">
<style>html,body{margin:0;background:#111}svg{display:block;width:1600px;height:900px;font-family:Jost,system-ui,sans-serif;font-variant-ligatures:none}</style>`
for (const style of styles) {
  for (const view of views) {
    const red = view === 'overview' || view === 'key-red'
    const v = view === 'key-red' ? 'key' : view
    const svg = frame({ style, view: v, red, uid: `${style}-${view}` })
    const html = resolve(out, `${style}-${view}.html`)
    writeFileSync(html, `${head}<svg viewBox="0 0 1600 900">${svg}</svg>`)
    execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', `--screenshot=${resolve(out, `${style}-${view}.png`)}`, '--window-size=1600,900', `file://${html}`], { stdio: 'ignore' })
    console.log(`${style}-${view}.png`)
  }
}
