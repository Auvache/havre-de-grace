/*
 * The visualizer concepts page: every song's CONCEPTS, a few stills each.
 *
 *   node tools/video-styles/visualizers/build.mjs                 # the whole page
 *   REVIEW=1 node tools/video-styles/visualizers/build.mjs ghost  # one song, plain grid, for rasterising
 *   REVIEW=1 CONCEPT=embers,smoke node ... ghost                    # only those concepts
 *   SITE=1 node tools/video-styles/visualizers/build.mjs          # the site's /music-videos/ideas
 *
 * SITE=1 writes every still to public/video-styles/ideas/<song>/<concept>-<n>.svg
 * (fetched and inlined by VideoStyleSheet, so they set in the page's Jost) and
 * the words to app/config/visualizerIdeas.ts, which the page reads. Both are
 * generated: change a concept module and run this, never edit them by hand.
 *
 * OUT=<path> says where (default .visualizers.html at the repo root, gitignored
 * with the other review sheets). A song whose module is missing or throws is
 * skipped with a warning, so one half-written module never blanks the page.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { still, fmt, sungAt } from './sheet.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')

/* Album order. `core` is the song's one idea, in the words of the brief. */
const SONGS = [
  { slug: 'into-the-wild', track: 1, score: ['intoTheWildScore.ts', 'INTO_THE_WILD_SCORE'], core: 'Adventure' },
  { slug: 'conman', track: 2, score: ['conmanScore.ts', 'CONMAN_SCORE'], core: 'Stealing' },
  { slug: 'goodbye-norma-jeane', track: 3, score: ['goodbyeNormaJeaneScore.ts', 'GOODBYE_NORMA_JEANE_SCORE'], core: 'The price of fame' },
  { slug: 'ivory', track: 4, score: ['ivoryScore.ts', 'IVORY_SCORE'], core: 'At a loss for words' },
  { slug: 'new-york', track: 6, score: ['newYorkScore.ts', 'NEW_YORK_SCORE'], core: 'Rebellion' },
  { slug: 'meet-me-at-the-horizon', track: 7, score: ['meetMeAtTheHorizonScore.ts', 'MEET_ME_AT_THE_HORIZON_SCORE'], core: 'Sleepless nights' },
  { slug: 'rocks-in-the-sea', track: 8, score: ['rocksInTheSeaScore.ts', 'ROCKS_IN_THE_SEA_SCORE'], core: 'Being called, and choosing to stay' },
  { slug: 'ship-to-stockholm', track: 9, score: ['shipToStockholmScore.ts', 'SHIP_TO_STOCKHOLM_SCORE'], core: 'Moving on' },
  { slug: 'ghost', track: 10, score: ['ghostScore.ts', 'GHOST_SCORE'], core: 'Helplessness' },
]

const only = process.argv.slice(2)
const review = Boolean(process.env.REVIEW)
const songs = []

for (const song of SONGS) {
  if (only.length && !only.includes(song.slug)) continue
  const file = resolve(here, `${song.slug}.mjs`)
  if (!existsSync(file)) { console.warn(`· ${song.slug}: no module yet`); continue }
  try {
    const score = (await import(resolve(root, 'app/config', song.score[0])))[song.score[1]]
    const { CONCEPTS } = await import(file)
    const picked = process.env.CONCEPT ? CONCEPTS.filter((c) => process.env.CONCEPT.split(',').includes(c.id)) : CONCEPTS
    const concepts = picked.map((concept, c) => ({
      ...concept,
      frames: concept.stills.map((time, i) => ({
        time,
        line: sungAt(score, time)?.text ?? '',
        svg: still(concept, { time, score, uid: `${song.slug}-${c}-${i}` }),
      })),
    }))
    songs.push({ ...song, title: score.title, concepts })
    const kb = concepts.reduce((n, c) => n + c.frames.reduce((m, f) => m + f.svg.length, 0), 0) / 1024
    console.log(`✓ ${song.slug}: ${concepts.length} concepts, ${Math.round(kb)} KB of stills`)
  } catch (error) {
    console.warn(`✗ ${song.slug}: ${error.stack}`)
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const out = resolve(root, process.env.OUT ?? '.visualizers.html')

if (process.env.SITE) {
  site(songs)
} else if (review) {
  const cells = songs.flatMap((s) => s.concepts.flatMap((c) => c.frames.map((f) =>
    `<figure>${f.svg}<figcaption><b>${esc(c.name)}</b> · ${fmt(f.time)} · ${esc(f.line)}</figcaption></figure>`)))
  writeFileSync(out, `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap">
<style>body{margin:0;padding:10px;background:#111;color:#aaa;font:13px/1.4 Jost,system-ui;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
figure{margin:0}svg{display:block;width:100%;height:auto;font-family:Jost,system-ui,sans-serif}figcaption{padding:4px 2px}b{color:#eee}</style>
${cells.join('\n')}`)
  console.log(`${cells.length} stills → ${out}`)
} else {
  writeFileSync(out, page(songs))
  console.log(`page → ${out} (${Math.round(readFileSync(out).length / 1024)} KB)`)
}

/* ── The site ─────────────────────────────────────────────────────── */

async function site(songs) {
  const FONT = `<style>@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&amp;display=swap');
  svg text { font-family: "Jost", "Helvetica Neue", Helvetica, Arial, sans-serif; font-variant-ligatures: none; }</style>`
  const dir = resolve(root, 'public/video-styles/ideas')
  rmSync(dir, { recursive: true, force: true })
  const file = (path, svg) => {
    mkdirSync(dirname(resolve(dir, path)), { recursive: true })
    writeFileSync(resolve(dir, path), svg.replace(/^<svg([^>]*)>/, (_, attrs) => `<svg${attrs}>${FONT}`))
    return `/video-styles/ideas/${path}`
  }
  // Andalusia, the reference: three frames of the album film itself.
  const { cartographyAlbumFrame } = await import(resolve(root, 'shared/video/films/cartography.mjs'))
  const { ANDALUSIA_SCORE } = await import(resolve(root, 'app/config/andalusiaScore.ts'))
  const lockup = readFileSync(resolve(root, 'public/logos/suite/a4-lockup-stacked.svg'), 'utf8')
    .replace('<svg ', '<svg width="918" height="619.07" ').replace(/ color="[^"]*"/, '').replace(/ role="img"/, '')
    .replace(/ aria-label="[^"]*"/, '').replace(/<title>.*?<\/title>/, '')
  const reference = [20, 45, 80].map((time, i) => {
    const f = cartographyAlbumFrame({ time, score: ANDALUSIA_SCORE, lockup, uid: `idea-and${i}` })
    const line = sungAt(ANDALUSIA_SCORE, time)?.text ?? ''
    return { time, line, src: file(`andalusia-${i + 1}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="Andalusia at ${fmt(time)}">${(f.lib ?? []).join('')}${f.svg}</svg>`) }
  })
  const data = songs.map((s) => ({
    slug: s.slug, track: s.track, title: s.title, core: s.core,
    concepts: s.concepts.map((c) => ({
      id: c.id, name: c.name, lyric: c.lyric, idea: c.idea, motion: c.motion, red: c.red,
      stills: c.frames.map((f, i) => ({ time: f.time, line: f.line, src: file(`${s.slug}/${c.id}-${i + 1}.svg`, f.svg) })),
    })),
  }))
  const ts = `/*
 * Visualizer ideas for /music-videos/ideas — GENERATED, do not edit.
 *
 * Written by \`SITE=1 node tools/video-styles/visualizers/build.mjs\` from the
 * concept modules in tools/video-styles/visualizers/, along with every still
 * under public/video-styles/ideas/. Change a module and run that again.
 */

export interface IdeaStill { time: number; line: string; src: string }
export interface VisualizerIdea { id: string; name: string; lyric: string; idea: string; motion: string; red: string; stills: IdeaStill[] }
export interface SongIdeas { slug: string; track: number; title: string; core: string; concepts: VisualizerIdea[] }

export const ANDALUSIA_REFERENCE: IdeaStill[] = ${JSON.stringify(reference, null, 2)}

export const VISUALIZER_IDEAS: SongIdeas[] = ${JSON.stringify(data, null, 2)}
`
  writeFileSync(resolve(root, 'app/config/visualizerIdeas.ts'), ts)
  const count = data.reduce((n, s) => n + s.concepts.reduce((m, c) => m + c.stills.length, 0), 0) + reference.length
  console.log(`site → ${count} stills in public/video-styles/ideas, words in app/config/visualizerIdeas.ts`)
}

/* ── The page ─────────────────────────────────────────────────────── */

function page(songs) {
  const andalusia = process.env.ANDALUSIA_STILLS ? readFileSync(process.env.ANDALUSIA_STILLS, 'utf8') : ''
  const nav = songs.map((s) => `<a href="#${s.slug}">${esc(s.title)}</a>`).join('')
  const sections = songs.map((s) => `
<section class="song" id="${s.slug}">
  <header class="song-head">
    <p class="track">${s.track}<span>/10</span></p>
    <h2>${esc(s.title)}</h2>
    <p class="core">${esc(s.core)}</p>
  </header>
  <div class="concepts">
  ${s.concepts.map((c, i) => `
    <article class="concept">
      <figure class="lead">${c.frames[0].svg}<figcaption><time>${fmt(c.frames[0].time)}</time>${esc(c.frames[0].line)}</figcaption></figure>
      <div class="text">
        <p class="num">${String.fromCharCode(65 + i)}</p>
        <h3>${esc(c.name)}</h3>
        <blockquote>${esc(c.lyric)}</blockquote>
        <p>${esc(c.idea)}</p>
        <p class="motion"><span>Moves</span>${esc(c.motion)}</p>
        <p class="red"><span>Red</span>${esc(c.red)}</p>
      </div>
      <div class="strip">${c.frames.slice(1).map((f) => `<figure>${f.svg}<figcaption><time>${fmt(f.time)}</time>${esc(f.line)}</figcaption></figure>`).join('')}</div>
    </article>`).join('')}
  </div>
</section>`).join('')

  return `<title>Into the Wild Visualizers</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,300..500&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: a darkroom wall — the prints carry the colour, the page stays black. One look, on purpose. */
:root {
  --bg: #121110; --panel: #1b1a18; --rule: #2e2c28;
  --fg: #ece4d2; --muted: #9c9483; --red: #d0503e;
  --display: Jost, "Futura", "Century Gothic", system-ui, sans-serif;
  --body: Jost, "Avenir Next", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  color-scheme: dark;
}
* { box-sizing: border-box }
body { background: var(--bg); color: var(--fg); font: 400 16px/1.55 var(--body); margin: 0;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg) }
svg { display: block; width: 100%; height: auto; font-family: Jost, system-ui, sans-serif; font-variant-ligatures: none }
.wrap { max-width: 1240px; margin: 0 auto }
.intro { padding-block: 56px 28px; display: grid; gap: 18px }
.eyebrow { font: 500 12px/1 var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin: 0 }
h1 { font: 700 clamp(40px, 7vw, 84px)/.95 var(--display); letter-spacing: -.01em; text-transform: uppercase; margin: 0; text-wrap: balance }
h1 em { font-style: normal; color: var(--red) }
.lede { max-width: 62ch; color: var(--muted); margin: 0; font-size: 17px }
.lede b { color: var(--fg); font-weight: 500 }
.bar { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 8px }
.bar figure { margin: 0 }
.bar figcaption { font: 400 12px/1.4 var(--mono); color: var(--muted); padding-top: 6px }
nav { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 1px solid var(--rule);
  display: flex; gap: 4px 18px; flex-wrap: wrap; padding-block: 12px; margin-bottom: 24px }
nav a { color: var(--muted); text-decoration: none; font: 600 13px/1.3 var(--display); letter-spacing: .08em; text-transform: uppercase }
nav a:hover, nav a:focus-visible { color: var(--fg); outline: none; text-decoration: underline; text-decoration-color: var(--red); text-underline-offset: 4px }
.song { padding-block: 40px 24px; border-top: 1px solid var(--rule); scroll-margin-top: 60px }
.song-head { display: grid; grid-template-columns: auto 1fr; align-items: baseline; gap: 0 20px; margin-bottom: 28px }
.track { grid-row: span 2; font: 200 72px/1 var(--display); margin: 0; color: var(--fg) }
.track span { font-size: 22px; color: var(--muted) }
h2 { font: 700 clamp(28px, 4vw, 44px)/1 var(--display); text-transform: uppercase; letter-spacing: .02em; margin: 0 }
.core { margin: 4px 0 0; font: italic 400 19px/1.3 var(--body); color: var(--red) }
.concepts { display: grid; gap: 56px }
.concept { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 14px 28px; align-items: start }
.lead { min-width: 0; margin: 0 }
.text { min-width: 0; display: grid; gap: 10px; align-content: start }
.text p { margin: 0; color: var(--muted); max-width: 60ch }
.num { font: 500 12px/1 var(--mono); letter-spacing: .14em; color: var(--muted) }
h3 { font: 700 24px/1.1 var(--display); text-transform: uppercase; letter-spacing: .03em; margin: 0; text-wrap: balance }
blockquote { margin: 0; font: italic 300 19px/1.35 var(--body); color: var(--fg) }
blockquote::before { content: "“" } blockquote::after { content: "”" }
.motion span, .red span { display: inline-block; min-width: 54px; font: 500 11px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: var(--fg) }
.red span { color: var(--red) }
.strip { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px }
.strip figure { margin: 0; min-width: 0 }
.strip figcaption, .lead figcaption { font: 400 12px/1.4 var(--body); color: var(--muted); padding-top: 6px }
.strip time, .lead time { font: 500 12px var(--mono); color: var(--fg); margin-right: 8px }
footer { padding-block: 40px 64px; color: var(--muted); font-size: 14px; border-top: 1px solid var(--rule) }
@media (max-width: 820px) {
  .concept { grid-template-columns: minmax(0, 1fr) }
  .strip { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .bar { grid-template-columns: minmax(0, 1fr) }
}
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth } }
</style>
<div class="wrap">
  <header class="intro">
    <p class="eyebrow">Into the Wild · music videos · new direction</p>
    <h1>Visualizers, <em>not stories</em></h1>
    <p class="lede">Andalusia is the bar: <b>one picture system, one red thing travelling, the lyric in the margin, no cuts.</b> Every idea below keeps that sheet, the paper, the black and the red, and gives the song one image that carries its core idea for three or four minutes. Five per song. Every still is a real frame at that second of the record, with the measured lyric under it.</p>
    ${andalusia ? `<div class="bar">${andalusia}</div>` : ''}
  </header>
  <nav aria-label="Songs">${nav}</nav>
  ${sections}
  <footer>Stills drawn by the concept modules in <code>tools/video-styles/visualizers/</code>: each is a pure function of the song's clock, so a chosen idea grows into a film without being redrawn.</footer>
</div>`
}
