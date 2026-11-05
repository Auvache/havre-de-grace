/*
 * The brightness of a record, a digit a beat — how intense each beat is, for
 * films that follow it (the marquee's twinkle). Brightness is the energy above
 * 1.8 kHz: trumpet, cymbals, the voice's edge. Loudness was no use on a
 * mastered record (5 dB between the quietest and loudest bars); brightness
 * spans 10 dB and rises with the voice and the brass.
 *
 *   node tools/video-styles/brightness.mjs <mp3> <bpm> <beatPhase>
 *
 * Prints a string of 0–9, one per beat from beatPhase: 0 is 10 dB or more
 * below the brightest beat, 9 the brightest. Each beat is the mean of itself
 * and its neighbours, so a single loud hit does not spike. Needs ffmpeg.
 */
import { execFileSync } from 'node:child_process'

const [file, bpmArg, phaseArg] = process.argv.slice(2)
if (!file) throw new Error('usage: brightness.mjs <mp3> <bpm> <beatPhase>')
const SR = 22050
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-af', 'highpass=f=1800', '-f', 's16le', '-'], { maxBuffer: 1 << 30 })
const n = raw.length / 2
const BEAT = 60 / Number(bpmArg ?? 95)
const phase = Number(phaseArg ?? 0)
const db = []
for (let a = phase; a + BEAT <= n / SR; a += BEAT) {
  let s = 0
  const i0 = Math.floor(a * SR)
  const i1 = Math.floor((a + BEAT) * SR)
  for (let i = i0; i < i1; i++) { const v = raw.readInt16LE(i * 2) / 32768; s += v * v }
  db.push(10 * Math.log10(s / (i1 - i0) + 1e-12))
}
const smooth = db.map((_, k) => { const w = db.slice(Math.max(0, k - 1), k + 2); return w.reduce((x, y) => x + y, 0) / w.length })
const top = Math.max(...smooth)
process.stdout.write(`${smooth.map((d) => Math.max(0, Math.min(9, Math.round(((d - top + 10) / 10) * 9)))).join('')}\n`)
