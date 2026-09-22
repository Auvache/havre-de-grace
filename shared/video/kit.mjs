/*
 * Drawing helpers shared by everything that draws a frame of a film.
 *
 * Nothing here is a style decision — it is the vocabulary the style modules
 * speak in, so that "set this row of type to exactly 1440 wide" is one call in
 * all of them instead of seven slightly different ones.
 *
 * It lives in shared/ rather than in tools/ because two different things draw
 * the same frames: `node tools/video-styles/build.mjs` renders the still
 * reference sheets, and the film components render the same style sixty times a
 * second in a browser. A primitive that existed twice would drift, and a style
 * whose sheet and whose film disagree is worse than no sheet at all.
 *
 * Plain .mjs on purpose. Node imports it without a loader, Vite imports it
 * without a plugin, and a frame renderer that needs neither is one that can be
 * pointed at an offscreen canvas later without being rewritten.
 */
import { r } from './motifs.mjs'

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A row of type. `len` stretches it to an exact width, the way the film does. */
export function t(o) {
  const {
    x = 0, y = 0, size = 100, text = '', fill = '#fff', weight = 700, anchor = 'start',
    len = null, tracking = null, opacity = 1, upper = true, family = null, italic = false,
    transform = null, extra = '',
  } = o
  const attrs = [
    `x="${r(x)}"`, `y="${r(y)}"`, `font-size="${r(size)}"`, `font-weight="${weight}"`, `fill="${fill}"`,
    anchor !== 'start' ? `text-anchor="${anchor}"` : '',
    len ? `textLength="${r(len)}" lengthAdjust="spacing"` : '',
    tracking != null ? `letter-spacing="${r(tracking, 2)}"` : '',
    opacity !== 1 ? `opacity="${r(opacity, 3)}"` : '',
    family ? `font-family="${family}"` : '',
    italic ? 'font-style="italic"' : '',
    transform ? `transform="${transform}"` : '',
    extra,
  ].filter(Boolean).join(' ')
  const body = upper ? String(text).toUpperCase() : String(text)
  return `<text ${attrs}>${esc(body)}</text>`
}

/*
 * Jost bold uppercase averages about 0.6 em per glyph including its spaces, so
 * the size a row wants in order to fill a column is the column over that. Every
 * style in the suite sets its lyric this way: the row is fitted to the measure
 * and then stretched to it exactly with textLength, which is why a lyric block
 * in any of these is a rectangle and not a rag.
 */
export const fit = (text, width, cap = 9999, k = 0.6) =>
  Math.min(cap, width / Math.max(k * String(text).length, 1))

/*
 * Jost 700 uppercase, advance width per glyph in ems.
 *
 * Measured off the served face rather than guessed: the Google-hosted file was
 * loaded in a headless Chrome and every glyph run through `measureText` at
 * 100px. It is here rather than in a style module because it is a fact about
 * the typeface the whole suite sets in, not a decision any one style gets to
 * make — and 700 rather than 600 because CSS font matching sends the films' 600
 * up to the 700 file, which is what actually draws.
 *
 * The average is indeed about 0.66, which is why `fit` above works for a whole
 * row. It is useless for a single word: W is 1.06 em and I is 0.32, so a style
 * that places words individually — Cartography sets its lyric word by word
 * along the route — gets gaps three times too wide after "I'd" and a collision
 * after "watch". Anything positioning one word at a time wants `advance`.
 */
export const JOST_ADVANCE = {
  A: 0.73, B: 0.66, C: 0.70, D: 0.73, E: 0.60, F: 0.55, G: 0.81, H: 0.79, I: 0.32,
  J: 0.33, K: 0.70, L: 0.53, M: 0.89, N: 0.79, O: 0.82, P: 0.62, Q: 0.86, R: 0.65,
  S: 0.63, T: 0.56, U: 0.70, V: 0.73, W: 1.06, X: 0.69, Y: 0.66, Z: 0.62,
  0: 0.66, 1: 0.51, 2: 0.66, 3: 0.62, 4: 0.70, 5: 0.64, 6: 0.67, 7: 0.60, 8: 0.63, 9: 0.67,
  ' ': 0.30, ',': 0.32, '.': 0.32, '\'': 0.31, '’': 0.33, '-': 0.22, '?': 0.63, '!': 0.34, '&': 0.75,
}

/** The width of `text` set in Jost 700 caps at `size`, with `tracking` per glyph. */
export const advance = (text, size = 1, tracking = 0) => {
  const upper = String(text).toUpperCase()
  let ems = 0
  for (const ch of upper) ems += JOST_ADVANCE[ch] ?? 0.66
  // Letter-spacing is applied after every glyph, the last one included — which
  // is the half-glyph of slack at the end of every row set this way.
  return ems * size + tracking * upper.length
}

/**
 * A lyric block, set the way the film sets one: the line broken into rows, the
 * last row held large because it is the word landing now, every row fitted to
 * the measure and stretched to it. Pass `through` to colour the last row up to
 * the voice's position.
 */
export function block(rows, o = {}) {
  const {
    x = 80, width = 1440, top = 150, bodyCap = 200, landingCap = 340, leading = 1.0,
    fill = '#f2ede3', accent = '#d8382b', through = null, anchor = 'start', weight = 700, k = 0.6,
  } = o
  const last = rows.length - 1
  let y = top
  return rows.map((text, i) => {
    const size = fit(text, width, i === last ? landingCap : bodyCap, k)
    y += size
    const baseline = y - size * 0.08
    const out = i === last && through != null
      ? sung({ x, y: baseline, size, text, len: width, fill, accent, through, anchor, weight })
      : t({ x, y: baseline, size, text, fill, len: width, anchor, weight })
    y += size * (leading - 1)
    return out
  }).join('\n')
}

/** Paper / film grain, as a filter you reference with filter="url(#id)". */
export function grainDef(id, { freq = 0.9, octaves = 3, opacity = 0.16, seed = 4 } = {}) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="g"/>
    <feComponentTransfer in="g" result="a"><feFuncA type="linear" slope="${opacity}"/></feComponentTransfer>
    <feComposite in="a" in2="SourceGraphic" operator="in"/>
  </filter>`
}

/** A soft round blur, for glows and light. */
export function blurDef(id, amount = 18) {
  // The region is generous on purpose: a small element blurred hard clips to a
  // grey square if the filter region is only twice its own size.
  return `<filter id="${id}" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="${amount}"/></filter>`
}

export const rect = (x, y, w, h, fill, o = {}) =>
  `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}"${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.rx ? ` rx="${o.rx}"` : ''}${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"` : ''}${o.transform ? ` transform="${o.transform}"` : ''}/>`

export const line = (x1, y1, x2, y2, stroke, w = 2, o = {}) =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${stroke}" stroke-width="${r(w, 2)}"${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.cap ? ` stroke-linecap="${o.cap}"` : ''}${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`

export const circle = (cx, cy, rad, o = {}) =>
  `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" fill="${o.fill ?? 'none'}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"` : ''}${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.filter ? ` filter="url(#${o.filter})"` : ''}/>`

export const path = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill ?? 'none'}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"` : ''}${o.cap ? ` stroke-linecap="${o.cap}"` : ''}${o.join ? ` stroke-linejoin="${o.join}"` : ''}${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.transform ? ` transform="${o.transform}"` : ''}${o.filter ? ` filter="url(#${o.filter})"` : ''}/>`

/* A small deterministic generator, so a sheet redrawn is the same sheet. */
export function rng(seed = 1) {
  let s = (seed * 2654435761) >>> 0 || 1
  const next = () => {
    s ^= s << 13; s >>>= 0
    s ^= s >> 17
    s ^= s << 5; s >>>= 0
    return s / 4294967296
  }
  for (let i = 0; i < 8; i++) next()
  return next
}

/** A hand-drawn version of a straight line: same ends, human middle. */
export function wobble(x1, y1, x2, y2, amount = 3, seed = 1) {
  const rand = rng(seed)
  const steps = 5
  let d = `M${r(x1)} ${r(y1)}`
  for (let i = 1; i <= steps; i++) {
    const p = i / steps
    const x = x1 + (x2 - x1) * p + (rand() - 0.5) * amount
    const y = y1 + (y2 - y1) * p + (rand() - 0.5) * amount
    d += ` L${r(x)} ${r(y)}`
  }
  return d
}

/** A circle drawn by hand — for the styles that are meant to look drawn. */
export function wobbleCircle(cx, cy, rad, amount = 2.5, seed = 1) {
  const rand = rng(seed)
  const steps = 18
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const rr = rad + (rand() - 0.5) * amount * 2
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    d += (i === 0 ? 'M' : 'L') + r(x) + ' ' + r(y)
  }
  return d + 'Z'
}

export { r }

/* ── The one thing every lyric style has to show ──────────────────────
 *
 * The voice's position inside the line. The film does it by drawing the row
 * twice and clipping the second copy to the word being sung, which is cheaper
 * than splitting a line into per-word elements and cannot fall out of register
 * with the row underneath. A still has to show that mid-word, so this returns
 * both copies with the clip already cut.
 */
let clipSeq = 0
export function sung(o) {
  const { x = 80, y = 0, size = 100, text = '', len = 1440, fill = '#f2ede3', accent = '#d8382b', through = 0.4, anchor = 'start', weight = 700, opacity = 1 } = o
  const id = `sung-${clipSeq++}`
  const left = anchor === 'middle' ? x - len / 2 : anchor === 'end' ? x - len : x
  return `<clipPath id="${id}"><rect x="${r(left)}" y="${r(y - size)}" width="${r(len * through)}" height="${r(size * 1.35)}"/></clipPath>
${t({ x, y, size, text, fill, len, anchor, weight, opacity })}
${t({ x, y, size, text, fill: accent, len, anchor, weight, opacity, extra: `clip-path="url(#${id})"` })}`
}

/* ── Timing ───────────────────────────────────────────────────────────
 *
 * The same eight functions as app/utils/clipTiming.ts, which is the typed copy
 * the Vue components import. They exist twice on purpose and the duplication is
 * the small half of the trade: these have to be plain JS so that a renderer
 * using them can be imported by `node` with no loader — which is what makes it
 * possible to walk a film's clock off-line and write out frames for an mp4.
 * They are one-liners with no behaviour to drift; if a ninth is ever needed,
 * add it to both or move clipTiming.ts onto this file.
 */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

export const lerp = (from, to, amount) => from + (to - from) * amount

/** Linear 0→1 across [from, to], flat outside it. */
export const ramp = (t, from, to) =>
  to <= from ? (t < from ? 0 : 1) : clamp01((t - from) / (to - from))

/** `ramp` reversed: 1 before `from`, 0 after `to`. */
export const fall = (t, from, to) => 1 - ramp(t, from, to)

export const easeOut = (x) => 1 - (1 - x) ** 3

export const easeInOut = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2

/** Overshoots past 1 and settles back. For things that snap into place. */
export const easeOutBack = (x, overshoot = 1.7) => {
  const c = overshoot + 1
  return 1 + c * (x - 1) ** 3 + overshoot * (x - 1) ** 2
}

/** A hit at `at` that rings out over `halfLife`, silent before it. */
export const decay = (t, at, halfLife = 0.28) =>
  t < at ? 0 : Math.exp(-(t - at) / halfLife)
