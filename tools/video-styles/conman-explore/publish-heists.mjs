/*
 * Every heist's alternatives, re-rendered into one review folder with an
 * index page (exploration, 2026-11-05).
 *   node .../publish-heists.mjs "<folder>"
 * Writes "<folder>/<n> <name>/<letter> <title>.png" and "<folder>/index.html".
 */
import { writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { jobFrame } from '../../../shared/video/films/conman-heists/atlas-plan.mjs'
import { SHOPS } from '../../../shared/video/films/conman-heists/shop.mjs'

const root = resolve(process.argv[2])
const JOBS = [
  { dir: '1 The Record Shop', name: 'The Record Shop', at: 'the west circle', file: null },
  { dir: '2 The Counting House', name: 'The Counting House', at: 'the east circle', file: 'counting-house.mjs' },
  { dir: '3 The Studio', name: 'The Studio', at: 'the east pier', file: 'studio.mjs' },
  { dir: '4 The West Pier (new)', name: 'The West Pier (new)', at: 'the west pier', file: 'west-pier.mjs' },
  { dir: '5 The Museum', name: 'The Museum', at: 'the hill in the ring', file: 'museum.mjs' },
  { dir: '6 The Concert Hall', name: 'The Concert Hall', at: 'the crown', file: 'concert-hall.mjs' },
]
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const head = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap">
<style>html,body{margin:0;background:#111}svg{display:block;width:1600px;height:900px;font-family:Jost,system-ui,sans-serif;font-variant-ligatures:none}</style>`
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const tmp = join(root, '.render')
mkdirSync(tmp, { recursive: true })

const sections = []
for (const j of JOBS) {
  const dir = join(root, j.dir)
  mkdirSync(dir, { recursive: true })
  if (!j.file) {
    const job = SHOPS.find((s) => s.key === 'circle')
    const png = 'C On the circle (chosen).png'
    const vids = existsSync(join(dir, 'Motion tests')) ? readdirSync(join(dir, 'Motion tests')).filter((f) => f.endsWith('.mp4')).sort() : []
    sections.push({ j, cards: [{ title: 'C · On the circle (chosen)', about: job.about, src: `${j.dir}/${png}` }], vids: vids.map((v) => `${j.dir}/Motion tests/${v}`) })
    continue
  }
  const { VARIANTS } = await import(`../../../shared/video/films/conman-heists/heists/${j.file}`)
  const cards = []
  for (const job of VARIANTS) {
    const name = `${job.title.replace(' · ', ' ')}.png`
    const html = join(tmp, `${job.key}.html`)
    writeFileSync(html, `${head}<svg viewBox="0 0 1600 900">${jobFrame(job)}</svg>`)
    execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000', `--screenshot=${join(dir, name)}`, '--window-size=1600,900', `file://${html}`], { stdio: 'ignore' })
    cards.push({ title: job.title, about: job.about, src: `${j.dir}/${name}` })
    console.log(`${j.dir}/${name}`)
  }
  sections.push({ j, cards, vids: [] })
}
rmSync(tmp, { recursive: true, force: true })

const page = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conman heists</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,600;1,400&display=swap">
<style>
  :root { --paper: #ece4d2; --ink: #1b1915; --red: #b5392a; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 17px/1.5 Jost, system-ui, sans-serif; }
  main { max-width: 1240px; margin: 0 auto; padding: 32px 16px 80px; }
  h1 { font-weight: 600; letter-spacing: .06em; margin: 0 0 4px; }
  h2 { font-weight: 600; letter-spacing: .04em; margin: 56px 0 4px; border-top: 1.5px solid var(--ink); padding-top: 18px; }
  .at { opacity: .65; margin: 0 0 16px; }
  .card { margin: 0 0 36px; }
  .card h3 { font-weight: 600; margin: 0 0 6px; font-size: 19px; }
  .card p { margin: 0 0 10px; max-width: 70ch; }
  img, video { width: 100%; height: auto; display: block; border: 1px solid #0002; }
  nav a { color: var(--ink); margin-right: 14px; }
  .red { color: var(--red); }
</style>
<main>
<h1>PLANS FOR <span class="red">CONMAN</span></h1>
<p class="at">The six heists, each by the anchor's own shape. Job 1 is chosen; jobs 2–6 have three or four alternatives each, every sheet at the end of its job with the whole route walked. Click a picture for full size.</p>
<nav>${sections.map((s) => `<a href="#j${s.j.dir[0]}">${esc(s.j.dir)}</a>`).join('')}</nav>
${sections.map((s) => `<h2 id="j${s.j.dir[0]}">${esc(s.j.dir)}</h2><p class="at">At ${esc(s.j.at)}.</p>
${s.vids.map((v) => `<div class="card"><h3>Motion test · ${esc(v.split('/').pop().replace('.mp4', ''))}</h3><video src="${encodeURI(v)}" controls preload="metadata"></video></div>`).join('')}
${s.cards.map((c) => `<div class="card"><h3>${esc(c.title)}</h3><p>${esc(c.about)}</p><a href="${encodeURI(c.src)}"><img src="${encodeURI(c.src)}" alt="${esc(c.title)}" loading="lazy"></a></div>`).join('')}`).join('\n')}
</main>`
writeFileSync(join(root, 'index.html'), page)
console.log(join(root, 'index.html'))
