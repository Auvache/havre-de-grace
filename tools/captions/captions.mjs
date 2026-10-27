/*
 * Lyric captions burned into a phone take, in the "Breath" style.
 *
 *   node tools/captions/captions.mjs --video IMG_4247.mov --timed work/timed.json \
 *     --out "Little Brother - captioned.mp4" [--top 1060] [--scrim]
 *
 * `--timed` is what `tools/captions/lyrics.py align` writes: one entry per lyric
 * word, {w, s, e, line}. Each lyric line is one caption.
 *
 * THE STYLE
 *
 * Thin lowercase Jost (300, 66 px), white with a soft shadow, centred, no
 * punctuation. A line fades in just before its first word with every word dim;
 * each word turns white as it is sung, and the word being sung is drawn a
 * little bolder (a white stroke behind the fill, so it thickens without
 * changing width: a real font-weight change reflowed the line and made the
 * word spacing loose). The line fades out after its last word. Only one line
 * is ever on screen; lines that run back to back hand off quickly just before
 * the new line's first word. A line wraps at a comma near its middle, and
 * otherwise wherever text-wrap: balance puts it.
 *
 * The caption box spans x 90–930 of the 1080 × 1920 frame, leaving room on the
 * right for the Shorts buttons, and `--top` sets its top edge. It belongs
 * somewhere dark and plain, under the chin and above the guitar: the default
 * 1060 suits a take framed like Little Brother's; Andalusia's, framed lower,
 * needed 950; Little Red Moon's, with the neck across the lower half, needed
 * 820. `--scrim` is for a light or busy background (Little Red Moon's plaid
 * shirt): a soft dark glow behind the words, and the unsung words lifted from
 * 32% to 50% white.
 *
 * Frames are drawn by Google Chrome with Jost loaded, on a transparent page,
 * one PNG per frame, and ffmpeg lays them over the footage. The take's own
 * audio is copied through untouched.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { chromium } from 'playwright-core'

const { values: opt } = parseArgs({
  options: {
    video: { type: 'string' },
    timed: { type: 'string' },
    out: { type: 'string' },
    top: { type: 'string', default: '1060' },
    scrim: { type: 'boolean', default: false },
  },
})
for (const k of ['video', 'timed', 'out']) if (!opt[k]) throw new Error(`--${k} is required`)

const FPS = 30
const W = 1080, H = 1920
const TOP = Number(opt.top)
const DIM = opt.scrim ? 0.5 : 0.32 // opacity of the words not yet sung
const LEAD = 0.35, TAIL = 0.6, FADE = 0.3, HANDOFF = 0.12

const lines = []
for (const w of JSON.parse(readFileSync(opt.timed, 'utf8'))) {
  ;(lines[w.line] ??= []).push({ text: w.w.replace(/[.,!?;:"“”*]/g, '').toLowerCase(), comma: /,$/.test(w.w), s: w.s, e: w.e })
}
for (const [i, l] of lines.entries()) {
  l.in = Math.max(0, l[0].s - LEAD)
  l.out = l.at(-1).e + TAIL
  l.fi = l.fo = FADE
  const prev = lines[i - 1]
  // never two lines at once: when lines run back to back, a quick handoff just before the new line's first word
  if (prev && prev.out + prev.fo > l.in) {
    const at = Math.max(prev.at(-1).s + 0.2, l[0].s - 0.25)
    prev.out = Math.min(prev.out, at - HANDOFF)
    prev.fo = HANDOFF
    l.in = at
    l.fi = HANDOFF
  }
  // wrap at the comma nearest the middle, if it's near enough; otherwise text-wrap:balance decides
  const total = l.map((w) => w.text).join(' ').length
  let best = null, run = 0
  for (const [j, w] of l.entries()) {
    run += w.text.length + 1
    if (w.comma && j < l.length - 1 && (best === null || Math.abs(run - total / 2) < Math.abs(best.run - total / 2))) best = { j, run }
  }
  if (best && Math.abs(best.run - total / 2) <= total * 0.2) l[best.j].br = true
}
const end = lines.at(-1).out + lines.at(-1).fo
console.log(lines.map((l) => `${l.in.toFixed(2)}-${l.out.toFixed(2)}  ${l.map((w) => w.text).join(' ')}`).join('\n'))

const tmp = mkdtempSync(join(tmpdir(), 'captions-'))
mkdirSync(tmp, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', args: ['--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: W, height: H } })
await page.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300..500&display=block">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;background:transparent;overflow:hidden}
  .cap{position:absolute;left:90px;right:150px;top:${TOP}px;text-align:center;text-wrap:balance;
       font:300 66px/1.25 Jost;color:#fff;letter-spacing:.01em;text-shadow:0 2px 18px rgba(0,0,0,.55)}
  .v{-webkit-text-stroke-color:#fff;paint-order:stroke fill}
  ${opt.scrim ? '.cap::before{content:"";position:absolute;inset:-90px -70px;z-index:-1;background:radial-gradient(closest-side,rgba(0,0,0,.62),rgba(0,0,0,.45) 60%,rgba(0,0,0,0))}' : ''}
</style></head><body><div class="cap" id="cap"></div></body></html>`)
const ok = await page.evaluate(async () => {
  await Promise.all(['300', '500'].map((w) => document.fonts.load(`${w} 66px Jost`, 'abc')))
  return document.fonts.check('300 66px Jost') && document.fonts.check('500 66px Jost')
})
if (!ok) throw new Error('Jost did not load; refusing to render in a fallback face')

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
let shown = -1
for (let f = 0; f < Math.ceil(end * FPS); f++) {
  const t = f / FPS
  const li = lines.findIndex((l) => t >= l.in && t < l.out + l.fo)
  const state = { html: null, opacity: 0, words: [] }
  if (li >= 0) {
    const l = lines[li]
    if (li !== shown) state.html = l.map((w) => `<span class="v">${w.text}</span>${w.br ? '<br>' : ' '}`).join('')
    state.opacity = Math.min(ease((t - l.in) / l.fi), 1 - ease((t - l.out) / l.fo))
    state.words = l.map((w) => {
      const on = ease((t - w.s + 0.04) / 0.14) // dim -> white as the word starts
      const stress = on * (1 - ease((t - w.e) / 0.35)) // bolder while it's sung
      return { o: DIM + (1 - DIM) * on, stroke: 3 * stress }
    })
    shown = li
  }
  await page.evaluate((s) => {
    const cap = document.getElementById('cap')
    if (s.html !== null) cap.innerHTML = s.html
    cap.style.opacity = s.opacity
    cap.querySelectorAll('.v').forEach((v, i) => {
      const w = s.words[i]
      if (!w) return
      v.style.opacity = w.o
      v.style.webkitTextStrokeWidth = `${w.stroke.toFixed(2)}px`
    })
  }, state)
  await page.screenshot({ path: join(tmp, `${String(f).padStart(5, '0')}.png`), omitBackground: true })
}
await browser.close()

// iPhone takes are HEVC in a .mov with a rotation flag; ffmpeg applies the rotation on decode, so the
// overlay sees 1080 × 1920. The source is full-range bt709, and format=yuv420p converts it to the
// limited range every player expects.
execFileSync('ffmpeg', [
  '-v', 'error', '-stats', '-y',
  '-i', opt.video,
  '-framerate', String(FPS), '-i', join(tmp, '%05d.png'),
  '-filter_complex', '[0:v][1:v]overlay=0:0:eof_action=pass:format=auto,format=yuv420p[v]',
  '-map', '[v]', '-map', '0:a',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-c:a', 'copy', '-movflags', '+faststart',
  opt.out,
], { stdio: 'inherit' })
rmSync(tmp, { recursive: true, force: true })
console.log(`wrote ${opt.out}`)
