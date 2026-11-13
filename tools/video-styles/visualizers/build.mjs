/*
 * The proposed stills for the songs still choosing a visualizer: each song's
 * CONCEPTS, a few frames each.
 *
 *   node tools/video-styles/visualizers/build.mjs                  # review grid → .visualizers.html
 *   node tools/video-styles/visualizers/build.mjs rocks-in-the-sea # one song
 *   CONCEPT=a,b node ... rocks-in-the-sea                           # only those concepts
 *   SITE=1 node tools/video-styles/visualizers/build.mjs           # the site's /visualizers/<song> pages
 *
 * SITE=1 writes every still to public/visualizers/<song>/<concept>-<n>.svg
 * (fetched and inlined by VisualizerStill, so they set in the page's Jost) and
 * the list of them to app/config/visualizerStills.ts, which the pages read.
 * Both are generated: change a concept module and run this, never edit them by
 * hand. The words for each concept are in docs/visualizers/<song>.md, not on
 * the page.
 *
 * OUT=<path> says where the review grid goes (default .visualizers.html at the
 * repo root, gitignored). A song whose module is missing or throws is skipped
 * with a warning.
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { still, fmt, sungAt } from './sheet.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')

/*
 * The songs with stills on their page, in album order: Rocks in the Sea (no
 * film yet). Ivory's ten went on 2026-11-13, when the crossword was chosen.
 * `extra: [file, export]` adds a second round of concepts in front of CONCEPTS.
 */
const SONGS = [
  { slug: 'rocks-in-the-sea', score: ['rocksInTheSeaScore.ts', 'ROCKS_IN_THE_SEA_SCORE'] },
]

const only = process.argv.slice(2)
const songs = []

for (const song of SONGS) {
  if (only.length && !only.includes(song.slug)) continue
  const file = resolve(here, `${song.slug}.mjs`)
  if (!existsSync(file)) { console.warn(`· ${song.slug}: no module yet`); continue }
  try {
    const score = (await import(resolve(root, 'app/config', song.score[0])))[song.score[1]]
    const { CONCEPTS } = await import(file)
    // A later, deeper round comes first: it is the newer proposal.
    const extra = song.extra ? (await import(resolve(here, song.extra[0])))[song.extra[1]] : []
    const all = [...extra.map((v) => ({ ...v, stills: v.moments })), ...CONCEPTS]
    const picked = process.env.CONCEPT ? all.filter((c) => process.env.CONCEPT.split(',').includes(c.id)) : all
    const concepts = picked.map((concept) => ({
      ...concept,
      frames: concept.stills.map((time, i) => ({
        time,
        line: sungAt(score, time)?.text ?? '',
        svg: still(concept, { time, score, uid: `${song.slug}-${concept.id}-${i}` }),
      })),
    }))
    songs.push({ ...song, concepts })
    const kb = concepts.reduce((n, c) => n + c.frames.reduce((m, f) => m + f.svg.length, 0), 0) / 1024
    console.log(`✓ ${song.slug}: ${concepts.length} concepts, ${Math.round(kb)} KB of stills`)
  } catch (error) {
    console.warn(`✗ ${song.slug}: ${error.stack}`)
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

if (process.env.SITE) {
  if (only.length || process.env.CONCEPT) throw new Error('SITE=1 rewrites every song: run it without a song or CONCEPT filter.')
  site(songs)
} else {
  const out = resolve(root, process.env.OUT ?? '.visualizers.html')
  const cells = songs.flatMap((s) => s.concepts.flatMap((c) => c.frames.map((f) =>
    `<figure>${f.svg}<figcaption><b>${esc(c.name)}</b> · ${fmt(f.time)} · ${esc(f.line)}</figcaption></figure>`)))
  writeFileSync(out, `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap">
<style>body{margin:0;padding:10px;background:#111;color:#aaa;font:13px/1.4 Jost,system-ui;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
figure{margin:0}svg{display:block;width:100%;height:auto;font-family:Jost,system-ui,sans-serif}figcaption{padding:4px 2px}b{color:#eee}</style>
${cells.join('\n')}`)
  console.log(`${cells.length} stills → ${out}`)
}

function site(songs) {
  const FONT = `<style>@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&amp;display=swap');
  svg text { font-family: "Jost", "Helvetica Neue", Helvetica, Arial, sans-serif; font-variant-ligatures: none; }</style>`
  const data = {}
  let count = 0
  for (const s of songs) {
    const dir = resolve(root, 'public/visualizers', s.slug)
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
    data[s.slug] = s.concepts.map((c) => ({
      id: c.id,
      name: c.name,
      stills: c.frames.map((f, i) => {
        const name = `${c.id}-${i + 1}.svg`
        writeFileSync(resolve(dir, name), f.svg.replace(/^<svg([^>]*)>/, (_, attrs) => `<svg${attrs}>${FONT}`))
        count++
        return { time: f.time, src: `/visualizers/${s.slug}/${name}` }
      }),
    }))
  }
  writeFileSync(resolve(root, 'app/config/visualizerStills.ts'), `/*
 * The proposed stills on /visualizers/<song> for the songs with no film yet —
 * GENERATED, do not edit. Written by
 * \`SITE=1 node tools/video-styles/visualizers/build.mjs\` along with every
 * still under public/visualizers/. The words are in docs/visualizers/<song>.md.
 */

export interface VisualizerStill { time: number; src: string }
export interface ProposedVisualizer { id: string; name: string; stills: VisualizerStill[] }

export const VISUALIZER_STILLS: Record<string, ProposedVisualizer[]> = ${JSON.stringify(data, null, 2)}
`)
  console.log(`site → ${count} stills in public/visualizers, list in app/config/visualizerStills.ts`)
}
