/*
 * One ready-to-post Short from a longer phone take: the cut, a colour look, the audio polish and
 * "hairline" lyric captions, in a single encode.
 *
 *   node tools/captions/short.mjs --video take.MOV --timed work/timed.json --start 18.82 --end 59.53 \
 *     --out "ready/Insane, Okay - verse 1.mp4" [--fade-out 0.3] [--top 860] [--scrim] [--look clean-warm]
 *
 * `--timed` is what `lyrics.py align` (then `refine`) writes; each lyrics.txt line is one caption. Leave it
 * out for a video whose captions are already burned in: it then gets the cut, look and audio only. `--start` and
 * `--end` are seconds in the take, snapped to the 30 fps frame grid like cut.py; pick them with
 * onsets.py (on a strum a bar or so before the voice, and just before the next strum).
 *
 * THE HAIRLINE STYLE (chosen 27 Oct 2026 from ten mock-ups, minimal to maximal, after the poster
 * style and its variants were tried and dropped)
 *
 * One lyric line at a time, centred: small (34 px) thin Inter capitals, widely spaced (0.38 em), white
 * with a soft shadow, no punctuation but apostrophes and hyphens. A line fades in just before its first
 * word with every word dim, each word turns white as it's sung, and the line stays up 1.6 s after its
 * last word, then fades; when the next line comes sooner, a quick handoff just before its first word. Every line
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
    reframe: { type: 'string' }, // crop | blur, for a take that isn't 9:16
    // where the 9:16 window sits across a wider frame, 0 left to 1 right: one number, or keyframes in take
    // seconds, "t:x,t:x,...", eased between, for a camera that reframes or a performer who moves
    'crop-x': { type: 'string', default: '0.5' },
    audio: { type: 'string', default: 'polish' }, // polish | as-is (a mixed and mastered soundtrack: fades only)
  },
})
for (const k of ['video', 'out', 'start', 'end']) if (!opt[k]) throw new Error(`--${k} is required`)
if (!(opt.look in LOOKS)) throw new Error(`--look must be one of ${Object.keys(LOOKS).join(', ')}`)
if (!['polish', 'as-is'].includes(opt.audio)) throw new Error('--audio must be polish or as-is')

const FPS = 30
const W = 1080, H = 1920
// --top is one number, or "t:top,..." in take seconds for a filmed set that cuts between wide and close shots:
// the caption jumps with the cut, to the next plain dark band under the chin
const TOPS = opt.top.split(',').map((k) => (k.includes(':') ? k.split(':').map(Number) : [-Infinity, Number(k)]))
const LEFT = 90, RIGHT = 150, TOP = TOPS[0][1]
const topAt = (t) => TOPS.findLast(([at]) => at <= t + Number(opt.start))?.[1] ?? TOP
const DIM = opt.scrim ? 0.45 : 0.3 // opacity of the words not yet sung
// TAIL: a line stays up 1.6 s after its last word, so there's time to finish reading it (0.6 was too quick
// to read, 27 Oct 2026); a line that's followed straight away still hands off to the next
const LEAD = 0.35, TAIL = 1.6, FADE = 0.3, HANDOFF = 0.12, WORD_IN = 0.14

const start = Math.round(Number(opt.start) * FPS) / FPS
const end = Math.round(Number(opt.end) * FPS) / FPS
const dur = end - start
const fadeOut = Number(opt['fade-out'])

// the lines that start inside the clip, in clip time
const lines = []
for (const w of opt.timed ? JSON.parse(readFileSync(opt.timed, 'utf8')) : []) {
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
if (shown.length) {
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
    state = { html: l !== current ? l.map((w) => `<span class="w">${w.text}</span>`).join(' ') : null, opacity, words, top: topAt(t) }
    current = l
    key = `${shown.indexOf(l)}|${state.top}|${opacity.toFixed(3)}|${words.map((x) => x.toFixed(3)).join(',')}`
  }
  const path = join(tmp, `${String(f).padStart(5, '0')}.png`)
  if (key === prevKey) { linkSync(prevPath, path); continue } // most frames repeat the one before
  await page.evaluate((s) => {
    const cap = document.getElementById('cap')
    if (s && s.html !== null) cap.innerHTML = s.html
    cap.style.opacity = s ? s.opacity : 0
    if (s) cap.style.top = `${s.top}px`
    if (s) cap.querySelectorAll('.w').forEach((w, i) => (w.style.opacity = s.words[i]))
  }, state)
  await page.screenshot({ path, omitBackground: true })
  prevKey = key, prevPath = path
}
await browser.close()
}

// two-pass loudness: measure the EQ'd clip, then normalise it linearly to -14 LUFS (--audio as-is skips both)
const trim = ['-ss', start.toFixed(6), '-t', dur.toFixed(6), '-i', opt.video]
const polish = opt.audio === 'polish'
const probe = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...trim, '-vn', '-af', `${polish ? `${EQ},` : ''}loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' })
const m = JSON.parse(probe.stderr.slice(probe.stderr.lastIndexOf('{'), probe.stderr.lastIndexOf('}') + 1))
const norm = `loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`
const af = `${polish ? `${EQ},${norm},` : ''}aresample=48000,afade=t=in:d=0.05,afade=t=out:st=${(dur - fadeOut).toFixed(3)}:d=${fadeOut}`

// --crop-x keyframes, as an ffmpeg expression in clip time (the trim starts the clip's clock at 0); between two
// keyframes the window eases (smoothstep), like an operator panning; two keyframes 0.01 s apart make a jump cut
const keys = opt['crop-x'].split(',').map((k) => (k.includes(':') ? k.split(':').map(Number) : [start, Number(k)]))
  .map(([t, x]) => [t - start, x]).sort((a, b) => a[0] - b[0])
let cropX = String(keys.at(-1)[1])
for (let i = keys.length - 2; i >= 0; i--) {
  const [[t0, x0], [t1, x1]] = [keys[i], keys[i + 1]]
  const u = `clip((t-${t0.toFixed(3)})/${(t1 - t0).toFixed(3)},0,1)`
  cropX = `if(lt(t,${t1.toFixed(3)}),${x0}+${(x1 - x0).toFixed(4)}*${u}*${u}*(3-2*${u}),${cropX})`
}

// to a 1080 x 1920 frame: a 9:16 take is scaled (the phone's own 1080p, or a 720p download); anything
// else needs --reframe: crop takes a 9:16 window (at --crop-x), blur keeps the whole frame across the
// width and fills above and below with a blurred, darkened copy of it
const vs = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_side_data=rotation', '-of', 'json', opt.video], { encoding: 'utf8' })).streams[0]
let [iw, ih] = [vs.width, vs.height]
if (Math.abs(vs.side_data_list?.find((d) => 'rotation' in d)?.rotation ?? 0) === 90) [iw, ih] = [ih, iw] // ffmpeg rotates on decode
const vertical = Math.abs(iw / ih - 9 / 16) < 0.02
if (!vertical && !['crop', 'blur'].includes(opt.reframe)) throw new Error(`the take is ${iw}x${ih}, not 9:16: pass --reframe crop or --reframe blur`)
const frame = vertical ? `scale=${W}:${H}:flags=lanczos`
  : opt.reframe === 'crop' ? `crop=ih*9/16:ih:'(iw-ih*9/16)*(${cropX})':0,scale=${W}:${H}:flags=lanczos`
  : `split[ra][rb];[ra]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=40,eq=brightness=-0.12[rbg];[rb]scale=${W}:-2:flags=lanczos[rfg];[rbg][rfg]overlay=(W-w)/2:(H-h)/2`
const video = `[0:v]${frame}[f];[f]${LOOKS[opt.look]}` + (shown.length ? '[g];[g][1:v]overlay=0:0:eof_action=pass:format=auto,format=yuv420p[v]' : ',format=yuv420p[v]')

// phone takes are full-range bt709; format=yuv420p converts to the limited range players expect
execFileSync('ffmpeg', [
  '-v', 'error', '-stats', '-y', ...trim,
  ...(shown.length ? ['-framerate', String(FPS), '-i', join(tmp, '%05d.png')] : []),
  '-filter_complex', `${video};[0:a]${af}[a]`,
  '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', dur.toFixed(6),
  opt.out,
], { stdio: 'inherit' })
rmSync(tmp, { recursive: true, force: true })
console.log(`wrote ${opt.out}  (${start.toFixed(3)}-${end.toFixed(3)}, ${dur.toFixed(2)} s, ${iw}x${ih}${vertical ? '' : ` ${opt.reframe}`}, look ${opt.look}, ${shown.length ? `${shown.length} caption lines` : 'no captions'}, ${polish ? `${m.input_i} -> -14 LUFS` : `audio as-is at ${m.input_i} LUFS`})`)
