/*
 * Drawing Hairline lines on, stroke by stroke — the pure half of
 * tools/video-styles/hairline.mjs, so a film in the browser can draw a title
 * the way the live videos do. Setting a line needs fontkit and runs in Node
 * (hairline.mjs `setLine`); a film takes its lines baked (shared/video/titles.mjs).
 */
import { clamp01, easeInOut, r } from './kit.mjs'

/*
 * Lines drawn on: `k` 0–1 runs across every letter, left to right, top line
 * first, each letter's strokes one after another.
 */
export function drawLines(lines, k, colour, uid) {
  const all = lines.flatMap((l) => l.letters)
  const win = 0.32
  const stagger = (1 - win) / Math.max(1, all.length - 1)
  let out = ''
  all.forEach((L, i) => {
    const a = k >= 1 ? 1 : clamp01((k - i * stagger) / win)
    if (a <= 0) return
    if (a >= 1 || !L.mask) {
      out += `<path d="${L.d}"${a < 1 ? ` opacity="${r(easeInOut(a), 3)}"` : ''}/>`
      return
    }
    const m = L.mask.length
    const strokes = L.mask.map((p, j) => {
      const b = clamp01(a * m - j)
      return b > 0 ? `<path d="${p}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${r(1 - easeInOut(b), 4)}"/>` : ''
    }).join('')
    const id = `${uid}-m${i}`
    out += `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">` +
      `<g fill="none" stroke="#fff" stroke-width="${r(L.pen, 2)}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g></mask>` +
      `<path d="${L.d}" mask="url(#${id})"/>`
  })
  return `<g fill="${colour}">${out}</g>`
}
