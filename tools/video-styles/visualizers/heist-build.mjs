/*
 * Conman · The Plans — a heist blueprint, told three ways, twelve stills each.
 *
 *   node tools/video-styles/visualizers/heist-build.mjs                 # review sheet → .heist.html
 *   VARIANT=erosion node tools/video-styles/visualizers/heist-build.mjs # just one
 *   SITE=1 node tools/video-styles/visualizers/heist-build.mjs          # /music-videos/heist
 *
 * SITE=1 writes the stills to public/video-styles/heist/ (not under
 * ideas/, which build.mjs clears) and the words to
 * app/config/conmanHeistVariants.ts. Both generated: never edit by hand.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { still, fmt, sungAt } from './sheet.mjs'
import { HEIST_VARIANTS as VARIANTS, HEIST_MOMENTS as MOMENTS } from './heist.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')
const { CONMAN_SCORE: score } = await import(resolve(root, 'app/config/conmanScore.ts'))

const picked = process.env.VARIANT ? VARIANTS.filter((v) => process.env.VARIANT.split(',').includes(v.id)) : VARIANTS
const moments = process.env.MOMENTS ? process.env.MOMENTS.split(',').map(Number) : MOMENTS
const sections = (t) => score.sections.find((s) => t >= s.from && t < s.to)?.label ?? ''

const variants = picked.map((v, a) => ({
  ...v,
  frames: (process.env.MOMENTS ? moments : v.moments ?? moments).map((time, i) => ({
    time,
    section: sections(time),
    line: sungAt(score, time)?.text ?? '',
    svg: still(v, { time, score, uid: `heist-${v.id}-${i}` }),
  })),
}))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

if (process.env.SITE) {
  const FONT = `<style>@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&amp;display=swap');
  svg text { font-family: "Jost", "Helvetica Neue", Helvetica, Arial, sans-serif; font-variant-ligatures: none; }</style>`
  const dir = resolve(root, 'public/video-styles/heist')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const data = variants.map((v) => ({
    id: v.id, name: v.name, summary: v.summary,
    stills: v.frames.map((f, i) => {
      writeFileSync(resolve(dir, `${v.id}-${i + 1}.svg`), f.svg.replace(/^<svg([^>]*)>/, (_, attrs) => `<svg${attrs}>${FONT}`))
      return { time: f.time, section: f.section, line: f.line, src: `/video-styles/heist/${v.id}-${i + 1}.svg` }
    }),
  }))
  writeFileSync(resolve(root, 'app/config/conmanHeistVariants.ts'), `/*
 * Conman heist plans for /music-videos/heist — GENERATED, do not edit.
 *
 * Written by \`SITE=1 node tools/video-styles/visualizers/heist-build.mjs\`
 * from tools/video-styles/visualizers/heist.mjs, with every still under
 * public/video-styles/heist/.
 */

export interface VariantStill { time: number; section: string; line: string; src: string }
export interface HeistVariant { id: string; name: string; summary: string; stills: VariantStill[] }

export const CONMAN_HEIST_VARIANTS: HeistVariant[] = ${JSON.stringify(data, null, 2)}
`)
  console.log(`site → ${data.reduce((n, v) => n + v.stills.length, 0)} stills in public/video-styles/heist`)
} else {
  const out = resolve(root, process.env.OUT ?? '.heist.html')
  const cells = variants.flatMap((v) => v.frames.map((f) =>
    `<figure>${f.svg}<figcaption><b>${esc(v.name)}</b> · ${fmt(f.time)} · ${esc(f.section)} · ${esc(f.line)}</figcaption></figure>`))
  writeFileSync(out, `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap">
<style>body{margin:0;padding:10px;background:#111;color:#aaa;font:13px/1.4 Jost,system-ui;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
figure{margin:0}svg{display:block;width:100%;height:auto;font-family:Jost,system-ui,sans-serif}figcaption{padding:4px 2px}b{color:#eee}</style>
${cells.join('\n')}`)
  console.log(`${cells.length} stills → ${out}`)
}
