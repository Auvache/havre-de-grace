/*
 * New York · Against the Grain — a continuity scan. Every arrow, frame to frame
 * at 60 fps: flags teleports, spins and pops (run after changing grain.mjs).
 *
 *   node tools/video-styles/grain-check.mjs [from] [to] [limit px/frame]
 */
import { NEW_YORK_SCORE as score } from '../../app/config/newYorkScore.ts'
const { grainPlate } = await import('../../shared/video/films/grain.mjs')
const from = Number(process.argv[2] ?? 12), to = Number(process.argv[3] ?? 206.4)
const LIM = Number(process.argv[4] ?? 16)
let prev = null
const worst = []
let appear = 0, vanish = 0
const inside = (X, Y) => X > 60 && X < 1540 && Y > 60 && Y < 784
for (let n = Math.round(from * 60); n <= Math.round(to * 60); n++) {
  const t = n / 60
  const probe = []
  grainPlate({ time: t, score, probe })
  const now = new Map(probe.map((p) => [p[0], p]))
  if (prev) {
    for (const [id, p] of now) {
      const q = prev.get(id)
      if (!q) { if (inside(p[1], p[2]) && p[4] > 0.3) { appear++; if (worst.length < 400) worst.push({ t, kind: 'appear', d: p[4], x: p[1], y: p[2] }) } continue }
      const d = Math.hypot(p[1] - q[1], p[2] - q[2])
      let da = Math.abs(p[3] - q[3]) % (Math.PI * 2); if (da > Math.PI) da = Math.PI * 2 - da
      if (d > LIM && (inside(p[1], p[2]) || inside(q[1], q[2]))) worst.push({ t, kind: 'jump', d, x: p[1], y: p[2] })
      else if (da > 0.5 && inside(p[1], p[2])) worst.push({ t, kind: 'spin', d: da, x: p[1], y: p[2] })
      else if (Math.abs(p[4] - q[4]) > 0.25 && inside(p[1], p[2])) worst.push({ t, kind: 'pop', d: p[4] - q[4], x: p[1], y: p[2] })
    }
    for (const [id, q] of prev) if (!now.has(id) && inside(q[1], q[2]) && q[4] > 0.3) { vanish++; if (worst.length < 400) worst.push({ t, kind: 'vanish', d: q[4], x: q[1], y: q[2] }) }
  }
  prev = now
}
const by = {}
for (const w of worst) { const k = `${w.kind}@${Math.floor(w.t)}`; by[k] = by[k] ?? { n: 0, max: 0 }; by[k].n++; by[k].max = Math.max(by[k].max, Math.abs(w.d)) }
console.log(Object.entries(by).map(([k, v]) => `${k} ×${v.n} max ${v.max.toFixed(1)}`).join('\n') || 'clean')
console.log("appear", appear, "vanish", vanish); if (process.env.LIST) for (const w of worst.filter((w) => w.kind === process.env.LIST).slice(0, 40)) console.log(w.t.toFixed(3), w.kind, w.d.toFixed(1), Math.round(w.x), Math.round(w.y))
