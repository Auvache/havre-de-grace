/*
 * One ready-to-post Short from a longer phone take: the cut, a colour look, the audio polish and
 * "hairline" lyric captions, in a single encode.
 *
 *   node tools/captions/short.mjs --video take.MOV --timed work/timed.json --start 18.82 --end 59.53 \
 *     --out "ready/Insane, Okay - verse 1.mp4" [--fade-out 0.3] [--top 860] [--scrim] [--look clean-warm]
 *
 * `--timed` is what `lyrics.py align` (then `refine`) writes; each lyrics.txt line is one caption. `--start` and
 * `--end` are seconds in the take, snapped to the 30 fps frame grid like cut.py; pick them with
 * onsets.py (on a strum a bar or so before the voice, and just before the next strum).
 *
 * THE HAIRLINE STYLE (chosen 27 Oct 2026 from ten mock-ups, minimal to maximal, after the poster
 * style and its variants were tried and dropped)
 *
 * One lyric line at a time, centred: small (34 px) thin Inter capitals, widely spaced (0.38 em), white
 * with a soft shadow, no punctuation but apostrophes and hyphens. A line fades in just before its first
 * word with every word dim, each word turns white as it's sung, and the line fades out after its last
 * word; lines that run back to back hand off quickly just before the new line's first word. Every line
 * is gone before the clip ends (Shorts loop). A long line wraps into two balanced rows. A line that
 * started before `--start` is left out, so a clip never opens mid-line.
 *
 * The caption sits in the frame's x 90–930 (the right edge stays clear for the Shorts buttons) with its
 * top at `--top`: under the chin, on something plain, after looking at the take. `--scrim` swaps the
 * shadow for a dark glow around the letters and lifts the dim words, for a light or busy background.
 *
 * LOOKS are small ffmpeg grades. They were tuned on daylight phone footage. The user's favourite is
 * "clean-warm" (the default); they didn't like "faded".
 *
 * THE AUDIO is the same for every clip: rumble off below 75 Hz, a little mud out at 250 Hz, a small
 * lift at 1.5 kHz to bring the voice forward, a dip at 4 kHz and a light de-esser for harshness, then
 * two-pass loudness normalisation to -14 LUFS (YouTube's target). No compression: the iPhone has
 * already squashed it (Insane, Okay measured an LRA of 2.8 LU). Then a 50 ms fade in and `--fade-out`.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { linkSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { chromium } from 'playwright-core'

const LOOKS = {
  natural: 'null',
  clean: 'eq=contrast=1.06:saturation=1.04:gamma=0.98',
  'clean-warm': 'eq=contrast=1.05:saturation=1.03,colortemperature=temperature=6000:mix=0.35',
  faded: "curves=all='0/0.07 0.5/0.52 1/0.95',eq=saturation=0.78,colortemperature=temperature=7000:mix=0.4",
  'faded-warm': "curves=all='0/0.07 0.5/0.52 1/0.95',eq=saturation=0.8,colortemperature=temperature=5800:mix=0.3",
}
const EQ = [
  'highpass=f=75',
  'equalizer=f=250:t=q:w=1:g=-2.5',
  'equalizer=f=1500:t=q:w=0.9:g=1.5',
  'equalizer=f=4000:t=q:w=1.4:g=-2.5',
  'deesser=i=0.4',
].join(',')

const { values: opt } = parseArgs({
  options: {
    video: { type: 'string' },
    timed: { type: 'string' },
    out: { type: 'string' },
    start: { type: 'string' },
    end: { type: 'string' },
    look: { type: 'string', default: 'clean-warm' },
    'fade-out': { type: 'string', default: '0.3' },
    top: { type: 'string', default: '860' },
    scrim: { type: 'boolean', default: false },
  },
})
for (const k of ['video', 'timed', 'out', 'start', 'end']) if (!opt[k]) throw new Error(`--${k} is required`)
if (!(opt.look in LOOKS)) throw new Error(`--look must be one of ${Object.keys(LOOKS).join(', ')}`)

const FPS = 30
const W = 1080, H = 1920
const LEFT = 90, RIGHT = 150, TOP = Number(opt.top)
const DIM = opt.scrim ? 0.45 : 0.3 // opacity of the words not yet sung
const LEAD = 0.35, TAIL = 0.6, FADE = 0.3, HANDOFF = 0.12, WORD_IN = 0.14

const start = Math.round(Number(opt.start) * FPS) / FPS
const end = Math.round(Number(opt.end) * FPS) / FPS
const dur = end - start
const fadeOut = Number(opt['fade-out'])

// the lines that start inside the clip, in clip time
const lines = []
for (const w of JSON.parse(readFileSync(opt.timed, 'utf8'))) {
  ;(lines[w.line] ??= []).push({ text: w.w.replace(/[^\p{L}\p{N}'’-]/gu, '').toUpperCase(), s: w.s - start, e: w.e - start })
}
const shown = lines.filter((l) => l && l[0].s >= -0.05 && l[0].s < dur)
for (const [i, l] of shown.entries()) {
  l.in = Math.max(0, l[0].s - LEAD)
  l.out = Math.min(l.at(-1).e + TAIL, dur - FADE - 0.05) // gone before the clip ends: Shorts loop
  l.fi = l.fo = FADE
  const prev = shown[i - 1]
  // never two lines at once: when lines run back to back, a quick handoff just before the new line's first word
  if (prev && prev.out + prev.fo > l.in) {
    const at = Math.max(prev.at(-1).s + 0.2, l[0].s - 0.25)
    prev.out = Math.min(prev.out, at - HANDOFF)
    prev.fo = HANDOFF
    l.in = at
    l.fi = HANDOFF
  }
}
for (const l of shown) console.log(`${l.in.toFixed(2)}-${l.out.toFixed(2)}  ${l.map((w) => w.text).join(' ')}`)

const tmp = mkdtempSync(join(tmpdir(), 'short-'))
const browser = await chromium.launch({ channel: 'chrome', args: ['--hide-scrollbars'] })
const page = await browser.newPage({ viewport: { width: W, height: H } })
await page.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300&display=block">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;background:transparent;overflow:hidden}
  .cap{position:absolute;left:${LEFT}px;right:${RIGHT}px;top:${TOP}px;text-align:center;text-wrap:balance;
       font:300 34px/1.6 Inter;letter-spacing:.38em;padding-left:.38em;color:#fff;text-shadow:${opt.scrim
         ? '0 0 4px rgba(0,0,0,.8),0 0 12px rgba(0,0,0,.75),0 0 28px rgba(0,0,0,.6)'
         : '0 1px 10px rgba(0,0,0,.6)'}}
</style></head><body><div class="cap" id="cap"></div></body></html>`)
const ok = await page.evaluate(async () => {
  await document.fonts.load('300 34px Inter', 'ABC')
  return document.fonts.check('300 34px Inter')
})
if (!ok) throw new Error('Inter did not load; refusing to render in a fallback face')

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
let current = null, prevKey = null, prevPath = null
for (let f = 0; f < Math.round(dur * FPS); f++) {
  const t = f / FPS
  const l = shown.find((l) => t >= l.in && t < l.out + l.fo)
  let key = 'empty', state = null
  if (l) {
    const opacity = Math.min(ease((t - l.in) / l.fi), 1 - ease((t - l.out) / l.fo))
    const words = l.map((w) => DIM + (1 - DIM) * ease((t - w.s + 0.04) / WORD_IN))
    state = { html: l !== current ? l.map((w) => `<span class="w">${w.text}</span>`).join(' ') : null, opacity, words }
    current = l
    key = `${shown.indexOf(l)}|${opacity.toFixed(3)}|${words.map((x) => x.toFixed(3)).join(',')}`
  }
  const path = join(tmp, `${String(f).padStart(5, '0')}.png`)
  if (key === prevKey) { linkSync(prevPath, path); continue } // most frames repeat the one before
  await page.evaluate((s) => {
    const cap = document.getElementById('cap')
    if (s && s.html !== null) cap.innerHTML = s.html
    cap.style.opacity = s ? s.opacity : 0
    if (s) cap.querySelectorAll('.w').forEach((w, i) => (w.style.opacity = s.words[i]))
  }, state)
  await page.screenshot({ path, omitBackground: true })
  prevKey = key, prevPath = path
}
await browser.close()

// two-pass loudness: measure the EQ'd clip, then normalise it linearly to -14 LUFS
const trim = ['-ss', start.toFixed(6), '-t', dur.toFixed(6), '-i', opt.video]
const probe = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...trim, '-vn', '-af', `${EQ},loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' })
const m = JSON.parse(probe.stderr.slice(probe.stderr.lastIndexOf('{'), probe.stderr.lastIndexOf('}') + 1))
const norm = `loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`
const af = `${EQ},${norm},aresample=48000,afade=t=in:d=0.05,afade=t=out:st=${(dur - fadeOut).toFixed(3)}:d=${fadeOut}`

// the take is full-range bt709 HEVC; format=yuv420p after the overlay converts to the limited range players expect
execFileSync('ffmpeg', [
  '-v', 'error', '-stats', '-y', ...trim,
  '-framerate', String(FPS), '-i', join(tmp, '%05d.png'),
  '-filter_complex', `[0:v]${LOOKS[opt.look]}[g];[g][1:v]overlay=0:0:eof_action=pass:format=auto,format=yuv420p[v];[0:a]${af}[a]`,
  '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', dur.toFixed(6),
  opt.out,
], { stdio: 'inherit' })
rmSync(tmp, { recursive: true, force: true })
console.log(`wrote ${opt.out}  (${start.toFixed(3)}-${end.toFixed(3)}, ${dur.toFixed(2)} s, look ${opt.look}, ${m.input_i} -> -14 LUFS)`)
