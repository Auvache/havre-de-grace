/*
 * Meet Me at the Horizon · Lying awake — three directions, as stills.
 *
 *   node tools/video-styles/visualizers/horizon-build.mjs                 # review sheet → .horizon.html
 *   VARIANT=nightmares node tools/video-styles/visualizers/horizon-build.mjs # just one
 *   SITE=1 node tools/video-styles/visualizers/horizon-build.mjs          # /music-videos/meet-me-at-the-horizon
 *
 * SITE=1 writes the stills to public/video-styles/horizon/ (not under
 * ideas/, which build.mjs clears) and the words to
 * app/config/horizonVariants.ts. Both generated: never edit by hand.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { still, fmt, sungAt } from './sheet.mjs'
import { HORIZON_VARIANTS as VARIANTS } from './horizon.mjs'
import { horizonGaps } from '../../../shared/video/films/horizon.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')
const { MEET_ME_AT_THE_HORIZON_SCORE: score } = await import(resolve(root, 'app/config/meetMeAtTheHorizonScore.ts'))

const picked = process.env.VARIANT ? VARIANTS.filter((v) => process.env.VARIANT.split(',').includes(v.id)) : VARIANTS
const moments = process.env.MOMENTS ? process.env.MOMENTS.split(',').map(Number) : null
const sections = (t) => score.sections.find((s) => t >= s.from && t < s.to)?.label ?? ''
// A still taken in a silence says so: which gap, how long, and the line that ends it.
const gaps = horizonGaps(score)
const noteAt = (t) => {
  const g = gaps.find((x) => t >= x.from && t < x.to)
  if (g) return `${g.kind === 'intro' ? 'the intro' : `a ${(g.to - g.from).toFixed(1)} s silence`}, before “${g.next.text}”`
  const woke = gaps.find((x) => x.next && t >= x.next.start && t < x.next.start + 0.6)
  return woke ? `jolted awake, ${(t - woke.next.start).toFixed(2)} s into “${woke.next.text}”` : ''
}

const variants = picked.map((v, a) => ({
  ...v,
  frames: (process.env.MOMENTS ? moments : v.moments ?? moments).map((time, i) => ({
    time,
    section: sections(time),
    line: sungAt(score, time)?.text ?? '',
    note: noteAt(time),
    svg: still(v, { time, score, uid: `horizon-${v.id}-${i}` }),
  })),
}))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

if (process.env.SITE) {
  const FONT = `<style>@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&amp;display=swap');
  svg text { font-family: "Jost", "Helvetica Neue", Helvetica, Arial, sans-serif; font-variant-ligatures: none; }</style>`
  const dir = resolve(root, 'public/video-styles/horizon')
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const data = variants.map((v) => ({
    id: v.id, name: v.name, summary: v.summary,
    stills: v.frames.map((f, i) => {
      writeFileSync(resolve(dir, `${v.id}-${i + 1}.svg`), f.svg.replace(/^<svg([^>]*)>/, (_, attrs) => `<svg${attrs}>${FONT}`))
      return { time: f.time, section: f.section, line: f.line, note: f.note, src: `/video-styles/horizon/${v.id}-${i + 1}.svg` }
    }),
  }))
  writeFileSync(resolve(root, 'app/config/horizonVariants.ts'), `/*
 * Meet Me at the Horizon stills for /music-videos/meet-me-at-the-horizon — GENERATED, do not edit.
 *
 * Written by \`SITE=1 node tools/video-styles/visualizers/horizon-build.mjs\`
 * from tools/video-styles/visualizers/horizon.mjs and shared/video/films/horizon.mjs, with every still under
 * public/video-styles/horizon/.
 */

export interface VariantStill { time: number; section: string; line: string; note: string; src: string }
export interface HorizonVariant { id: string; name: string; summary: string; stills: VariantStill[] }

export const HORIZON_VARIANTS: HorizonVariant[] = ${JSON.stringify(data, null, 2)}
`)
  console.log(`site → ${data.reduce((n, v) => n + v.stills.length, 0)} stills in public/video-styles/horizon`)
} else {
  const out = resolve(root, process.env.OUT ?? '.horizon.html')
  const cells = variants.flatMap((v) => v.frames.map((f) =>
    `<figure>${f.svg}<figcaption><b>${esc(v.name)}</b> · ${fmt(f.time)} · ${esc(f.section)} · ${esc(f.line)} <i>${esc(f.note)}</i></figcaption></figure>`))
  writeFileSync(out, `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@100..900&display=swap">
<style>body{margin:0;padding:10px;background:#111;color:#aaa;font:13px/1.4 Jost,system-ui;display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
figure{margin:0}svg{display:block;width:100%;height:auto;font-family:Jost,system-ui,sans-serif}figcaption{padding:4px 2px}b{color:#eee}</style>
${cells.join('\n')}`)
  console.log(`${cells.length} stills → ${out}`)
}
