/*
 * The live videos' type: the Shorts captions' "Hairline" face (Inter Light
 * capitals, widely spaced, tools/captions/short.mjs), set as SVG paths so a
 * title can be drawn on with the wordmark's pen.
 *
 * A title is drawn the way stroke-letters.mjs's monoline capitals would be,
 * stroke by stroke, each letter in turn left to right (chosen 2026-10-27 over
 * tracing the outline and filling it, as the anchor is drawn). Each Inter
 * letter is revealed through a mask: its monoline skeleton (GLYPHS), stretched
 * onto the letter's ink box and stroked wider than Inter's stems, drawn on with
 * a dash. When a letter's last stroke is down the mask is dropped, so any ink
 * the skeleton misses is there in the finished letter.
 *
 * Credits are set with the same face, static, with `**names**` in SemiBold.
 *
 * The fonts come from Google Fonts on first use and are kept in the temp dir.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import * as fontkit from 'fontkit'

import { clamp01, easeInOut, r } from '../../shared/video/kit.mjs'
import { GLYPHS } from './stroke-letters.mjs'

/* Letter-spacing, in em: a little under the captions' 0.38 so a credit line fits. */
const TRACK = 0.32
/* The mask's pen, as a share of the cap height: about three times Inter Light's stem. */
const PEN = 0.3
/* Where Inter's letter differs from the logo's: its M's middle comes down to the baseline. */
const SKELETON = { ...GLYPHS, M: { d: 'M6.5 100V0L42 100L77.5 0V100', w: 84 } }

const fonts = {}
async function face(weight) {
  if (fonts[weight]) return fonts[weight]
  const dir = join(tmpdir(), 'hdg-fonts')
  const file = join(dir, `Inter-${weight}.ttf`)
  if (!existsSync(file)) {
    mkdirSync(dir, { recursive: true })
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`)).text()
    const url = css.match(/src: url\((\S+?\.ttf)\)/)?.[1]
    if (!url) throw new Error(`no TrueType Inter ${weight} from Google Fonts`)
    writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()))
  }
  return (fonts[weight] = fontkit.openSync(file))
}
/** Load the faces before setting anything: Light for titles, SemiBold for names. */
export const loadFaces = () => Promise.all([face(300), face(600)])

/*
 * A skeleton's path data mapped onto a box: x' = x0 + x·sx, y' = y0 + y·sy.
 * GLYPHS use only M L H V A (and relative a) with unrotated arcs, so a
 * non-uniform scale maps each arc to an arc.
 */
function mapPath(d, x0, y0, sx, sy) {
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g)
  let i = 0, cmd = '', x = 0, y = 0
  const n = () => Number(tok[i++])
  const X = (v) => r(x0 + v * sx, 3)
  const Y = (v) => r(y0 + v * sy, 3)
  let out = ''
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++]
    switch (cmd) {
      case 'M': case 'L': x = n(); y = n(); out += `${cmd}${X(x)} ${Y(y)}`; break
      case 'H': x = n(); out += `L${X(x)} ${Y(y)}`; break
      case 'V': y = n(); out += `L${X(x)} ${Y(y)}`; break
      case 'A': case 'a': {
        const rx = n(), ry = n(), rot = n(), large = n(), sweep = n()
        if (rot) throw new Error('rotated arc in a skeleton')
        if (cmd === 'a') { x += n(); y += n() } else { x = n(); y = n() }
        out += `A${r(rx * sx, 3)} ${r(ry * sy, 3)} 0 ${large} ${sweep} ${X(x)} ${Y(y)}`
        break
      }
      case 'Z': case 'z': out += 'Z'; break
      default: throw new Error(`skeleton command ${cmd}`)
    }
  }
  return out
}

/*
 * One line, centred on cx with its baseline at y, at `size` (font units → frame
 * units as CSS px). `text` may mark runs in SemiBold with **…**. Returns the
 * letters as { d, mask? } in frame units; `mask` is the skeleton's strokes,
 * for a Light letter that has one.
 */
export function setLine(text, cx, y, size) {
  const runs = text.split('**').map((t, i) => ({ text: t.toUpperCase(), weight: i % 2 ? 600 : 300 }))
  let x = 0
  const placed = []
  for (const run of runs) {
    const f = fonts[run.weight]
    if (!f) throw new Error('call loadFaces() first')
    const s = size / f.unitsPerEm
    const laid = f.layout(run.text)
    laid.glyphs.forEach((g, i) => {
      placed.push({ g, x, s, ch: run.text[i], weight: run.weight })
      x += (laid.positions[i].xAdvance + TRACK * f.unitsPerEm) * s
    })
  }
  const width = x - TRACK * size
  const left = cx - width / 2
  const letters = placed.filter(({ g }) => g.path.commands.length).map(({ g, x, s, ch, weight }) => {
    const gx = left + x
    const d = g.path.scale(s, -s).translate(gx, y).toSVG()
    const sk = weight === 300 && SKELETON[ch]
    if (!sk) return { d }
    // The skeleton's 0–w × 0–100 box onto the letter's ink.
    const b = g.bbox
    const x0 = gx + b.minX * s, top = y - b.maxY * s
    const sx = ((b.maxX - b.minX) * s) / sk.w, sy = ((b.maxY - b.minY) * s) / 100
    return { d, mask: sk.d.split(/(?=M)/).map((p) => mapPath(p, x0, top, sx, sy)), pen: PEN * (b.maxY - b.minY) * s }
  })
  return { letters, width }
}

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

/** Lines set whole. */
export const setLines = (lines, colour) => `<g fill="${colour}">${lines.flatMap((l) => l.letters).map((L) => `<path d="${L.d}"/>`).join('')}</g>`
