/*
 * Letterpress — "New York" as a flyposted wall, wrecked.
 *
 * Track 6 of the album (app/config/albumStyle.ts). The song is about being
 * done with everybody's formula — the one right way to make it, the city you
 * have to move to, the things you have to bargain, bend, abandon or exploit to
 * get somewhere you may not even want to be — and about rage at a system that
 * does not care about people. "I don't wanna follow those lights I see out on
 * the shore": everyone is a lighthouse, and he is not steering by any of them.
 *
 * THREE RULES THE WHOLE FILM IS BUILT ON
 *
 *   - Nobody is in it. Every picture is a cut — a picture block locked up in
 *     the forme with the type — printed flat in ink with the poster yellow as
 *     a second forme, and every one is an artifact a musician gets handed on
 *     the way. Each of them is destroyed on its word.
 *   - Red is the journey, and the journey is his own: one red printer's rule
 *     along the foot of the wall that rises square to strike out every piece
 *     of advice it passes, and at the end leaves the sheet going nowhere
 *     anyone pointed.
 *   - It bends the album's smoothness and does not break it. One wall, no
 *     cuts, a camera that never stops — but it whips, banks into the whips,
 *     jumps a little on every beat of the click and shakes on every hit. The
 *     fastest, angriest song on the record is the only film that shakes.
 *
 * THE WALL, LEFT TO RIGHT
 *
 *   Intro     THE FORMULA broadside pulled block by block on the beat, its
 *             departures the cities the song is told to move to.
 *   Verse 1   LOVE and a love song on the rocks; it burns from the coals and
 *             under it is a sea where EASY DREAMS surfaces, fires on
 *             "undermine" and brings down the trophy on THE GOAL.
 *   Chorus 1  Five lighthouses made of a mic stand, amps, a metronome, a
 *             trophy — their beams the advice — struck out by the rule; a pole
 *             of loudspeaker horns that droop, melt and shatter.
 *   Break 1   Records melting down a wall of amps, a guitar smashed on the
 *             downbeat, a cassette whose tape leads the camera on.
 *   Verse 2   A departures board, each city struck out as it lands, jammed and
 *             blown apart; a conveyor belt under THE ONLY WAY where bargain,
 *             bend, abandon and exploit each destroy something.
 *   Chorus 2  An art class of identical paint-by-numbers, torn to strips.
 *   No        Four NOs crush the formula in four parts; NEW YORK as a skyline,
 *             struck and melted, the cab leaving without him.
 *   Break 2   Rubber stamps on every beat, thrown records, THE LADDER losing
 *             its rungs, advice knocked out of the forme, a lone metronome.
 *   Chorus 3  The lighthouses topple; a wall of televisions implodes.
 *   The end   Three rounds of NO on everything the film has broken; the
 *             formula again, stamped NOT GOING, struck on "New York", torn in
 *             two on "York" as the wall comes down and the rule leaves.
 *
 * HOW THINGS ARE DESTROYED — six pure functions of the time since the word
 * (tau), each returning the thing untouched before its word: burn (a ragged
 * front from a point, a charred band, tongues and ash), tearStrips (jagged
 * strips that peel and drop), shatter (shards cut from wedges and rings round
 * an impact, sharing vertices so they tile until they fly), meltWarp and
 * bendWarp (the artifacts that suffer are polygons, so suffering is a function
 * on their points), squash, and pied (type knocked out of the forme letter by
 * letter). The drawing goes into <defs> once and the pieces are clipped <use>s.
 *
 * `letterpressFrame({ time, score })` is a pure function of the clock; the
 * plan — camera, rule, every scene's place — is built once per score.
 */

import { t as text, r, clamp01, easeOut, easeInOut, ramp, lerp, advance } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, PAPER_SHADE, INK, RED, SECOND_INK, SHEET, paper, plateClip, marginLyric, titleCard } from '../album.mjs'

export const YELLOW = SECOND_INK['new-york']

export const LETTERPRESS = {
  id: 'album-new-york',
  name: 'Letterpress',
  accent: RED,
  palette: { PAPER, INK, RED, YELLOW },
}

const PL = SHEET.plate
const CX = PL.x + PL.w / 2
const CY = PL.y + PL.h / 2
/** Paper where it is torn: the fibre edge, a shade lighter than the stock. */
const FIBRE = '#f7f0e0'
/** The wall's old posters, printed over and pasted over until they are nearly paper. */
const GHOST = '#ddd3bd'
const GHOST_INK = '#cbbfa5'

/* ══ SMALL THINGS ══════════════════════════════════════════════════════ */

const P = (x, y) => `${r(x)} ${r(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
const fillD = (d, colour, o = {}) => (d ? `<path d="${d}" fill="${colour}"${op(o.opacity ?? 1)}${o.rule ? ` fill-rule="${o.rule}"` : ''}${o.extra ?? ''}/>` : '')
const pen = (d, w = 2, o = {}) => (d ? `<path d="${d}" fill="none" stroke="${o.stroke ?? INK}" stroke-width="${r(w, 2)}" stroke-linecap="${o.cap ?? 'round'}" stroke-linejoin="${o.join ?? 'round'}"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
const g = (inner, o = {}) => {
  if (!inner) return ''
  const attrs = [
    o.transform ? `transform="${o.transform}"` : '',
    o.opacity != null && o.opacity < 0.999 ? `opacity="${r(Math.max(0, o.opacity), 3)}"` : '',
    o.clip ? `clip-path="url(#${o.clip})"` : '',
    o.id ? `id="${o.id}"` : '',
  ].filter(Boolean).join(' ')
  return attrs ? `<g ${attrs}>${inner}</g>` : inner
}
const tf = (x = 0, y = 0, s = 1, rot = 0) =>
  `translate(${r(x, 2)} ${r(y, 2)})${rot ? ` rotate(${r(rot, 2)})` : ''}${s !== 1 ? ` scale(${r(s, 4)})` : ''}`

/** Deterministic noise in 0–1 from integers — no Math.random anywhere. */
function hash(x, y, s = 0) {
  let h = Math.imul((x | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul(((y | 0) + Math.imul(s | 0, 7919)) | 0, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
function seq(seed) {
  let i = 0
  return () => hash(i++, 17, seed)
}
/** Smooth 1-D value noise in −1..1. */
function noise1(x, seed = 0) {
  const i = Math.floor(x)
  const f = x - i
  const a = hash(i, 3, seed) * 2 - 1
  const b = hash(i + 1, 3, seed) * 2 - 1
  return lerp(a, b, f * f * (3 - 2 * f))
}

const CACHE = new Map()
const memo = (key, build) => {
  if (!CACHE.has(key)) CACHE.set(key, build())
  return CACHE.get(key)
}

/* ══ GEOMETRY — shapes as point lists, so they can be bent ═════════════
 *
 * Most of what this film does to things is geometric: a record sags, a horn
 * droops, a guitar neck bends, a skyline melts. So the artifacts that suffer
 * are drawn as polygons (densely sampled), and suffering is a function applied
 * to their points before they are written out. Nothing is measured off the DOM.
 */

const polyD = (pts) => (pts.length > 1 ? `M${pts.map(([x, y]) => P(x, y)).join('L')}Z` : '')
const openD = (pts) => (pts.length > 1 ? `M${pts.map(([x, y]) => P(x, y)).join('L')}` : '')

function ellipsePts(cx, cy, rx, ry = rx, n = 48, a0 = 0, a1 = Math.PI * 2) {
  const closed = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6
  const m = closed ? n : n + 1
  return Array.from({ length: m }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]
  })
}
function rrectPts(x, y, w, h, rad = 0, n = 5) {
  const rr = Math.min(rad, w / 2, h / 2)
  if (rr <= 0.1) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
  const out = []
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (Math.PI / 2) * (i / n)
      out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr])
    }
  }
  corner(x + w - rr, y + rr, -Math.PI / 2)
  corner(x + w - rr, y + h - rr, 0)
  corner(x + rr, y + h - rr, Math.PI / 2)
  corner(x + rr, y + rr, Math.PI)
  return out
}
/** Insert points so no edge is longer than `step` — a warp then bends edges, not just corners. */
function densify(pts, step = 14, closed = true) {
  const out = []
  const n = pts.length
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % n]
    const k = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step))
    for (let j = 0; j < k; j++) out.push([lerp(x0, x1, j / k), lerp(y0, y1, j / k)])
  }
  if (!closed) out.push(pts[n - 1])
  return out
}
const movePts = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy])
const scalePts = (pts, sx, sy = sx, ox = 0, oy = 0) => pts.map(([x, y]) => [ox + (x - ox) * sx, oy + (y - oy) * sy])
const rotPts = (pts, deg, ox = 0, oy = 0) => {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return pts.map(([x, y]) => [ox + (x - ox) * c - (y - oy) * s, oy + (x - ox) * s + (y - oy) * c])
}
/** A Catmull–Rom curve through `pts`, as a path. */
function spline(pts, closed = false) {
  const n = pts.length
  if (n < 2) return ''
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${P(...pts[0])}`
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    d += `C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`
  }
  return closed ? d + 'Z' : d
}

/*
 * A part is { pts, fill } or { pts, stroke, sw } or { d, fill } (fixed, cannot
 * be bent) or { svg, at } (type: slides with the warp at its anchor). A warp is
 * (x, y) → [x, y].
 */
function renderParts(parts, warp = null) {
  let out = ''
  for (const p of parts) {
    if (!p) continue
    if (p.svg != null) {
      if (warp && p.at) {
        const [wx, wy] = warp(p.at[0], p.at[1])
        out += `<g transform="translate(${r(wx - p.at[0], 2)} ${r(wy - p.at[1], 2)})">${p.svg}</g>`
      }
      else out += p.svg
      continue
    }
    let d = p.d ?? ''
    if (p.pts) {
      const list = Array.isArray(p.pts[0][0]) ? p.pts : [p.pts]
      d = list.map((pts) => {
        const src = warp ? densify(pts, p.step ?? 14, !p.open) : pts
        const moved = warp ? src.map(([x, y]) => warp(x, y)) : src
        return p.open ? openD(moved) : polyD(moved)
      }).join('')
    }
    if (p.stroke) out += pen(d, p.sw ?? 3, { stroke: p.stroke, opacity: p.opacity ?? 1, cap: p.cap, join: p.join })
    else out += fillD(d, p.fill ?? INK, { opacity: p.opacity ?? 1, rule: p.rule })
  }
  return out
}

/* ══ THE PRESS — how anything looks printed ════════════════════════════ */

/**
 * A field of paper specks, seeded: where the ink did not take. `density` is
 * specks per 10,000 square units. Clipped to a sort, it is the sort's
 * impression; heavier for a lighter pull.
 */
function specks(x, y, w, h, { seed = 1, density = 14, colour = PAPER, max = 3.2 } = {}) {
  return memo(`sp:${r(x)}:${r(y)}:${r(w)}:${r(h)}:${seed}:${r(density)}:${r(max)}:${colour}`, () => {
    const rand = seq(seed)
    const n = Math.round((w * h * density) / 10000)
    let d = ''
    for (let i = 0; i < n; i++) {
      const px = x + rand() * w
      const py = y + rand() * h
      const rr = 0.6 + rand() * rand() * max
      d += `M${r(px - rr * 1.6)} ${r(py)}h${r(rr * 3.2)}`
      if (rand() < 0.25) d += `M${r(px)} ${r(py + rr)}h${r(rr * 1.4)}`
    }
    return `<path d="${d}" stroke="${colour}" stroke-width="${r(max * 0.7, 2)}" stroke-linecap="round" fill="none"/>`
  })
}

/**
 * An ink shape with its impression: the shape, then the paper specks clipped
 * to it. `key` must be unique in the frame — it names the clip.
 */
function inked(ctx, key, d, { fill = INK, impression = 0.6, seed = 1, box = null, rule = '' } = {}) {
  if (!d) return ''
  const id = `${ctx.uid}-ik-${key}`
  const [x0, y0, x1, y1] = box ?? [-400, -400, 400, 400]
  ctx.defs.push(`<clipPath id="${id}"><path d="${d}"${rule ? ` clip-rule="${rule}"` : ''}/></clipPath>`)
  return `${fillD(d, fill, { rule })}<g clip-path="url(#${id})">${specks(x0, y0, x1 - x0, y1 - y0, { seed, density: 30 * (1 - impression) + 2, max: 2.2 + 2 * (1 - impression) })}</g>`
}

/**
 * Wood type: Jost 700 caps squeezed into a condensed face with
 * lengthAdjust="spacingAndGlyphs" — the glyphs narrow as well as the spaces,
 * which is the whole look — and an uneven impression clipped to the letters.
 */
function woodType(ctx, key, { x = 0, y = 0, size, text: s, width, fill = INK, anchor = 'start', impression = 0.5, seed = 1, opacity = 1 }) {
  const id = `${ctx.uid}-wt-${key}`
  const w = width ?? advance(s, size) * 0.78
  const glyphs = `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="700" text-anchor="${anchor}" textLength="${r(w)}" lengthAdjust="spacingAndGlyphs">${esc(String(s).toUpperCase())}</text>`
  const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  ctx.defs.push(`<clipPath id="${id}">${glyphs}</clipPath>`)
  return g(`${glyphs.replace('<text ', `<text fill="${fill}" `)}<g clip-path="url(#${id})">${specks(left, y - size * 0.78, w, size * 0.82, { seed, density: 26 * (1 - impression) + 3, max: 2.4 + 2 * (1 - impression) })}</g>`, { opacity })
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** A row of plain type (job type, not wood): tracked Jost. */
const job = (x, y, size, s, o = {}) => text({ x, y, size, text: s, fill: o.fill ?? INK, anchor: o.anchor ?? 'start', weight: o.weight ?? 600, tracking: o.tracking ?? size * 0.12, opacity: o.opacity ?? 1, upper: o.upper ?? true, transform: o.transform ?? null, len: o.len ?? null })
/** Width of a row of job type. */
const jobW = (s, size, tracking = size * 0.12) => advance(s, size, tracking)

/** A brass rule: a thick and a thin, the printer's double rule. */
const brassRule = (x0, x1, y, colour = INK) =>
  `<path d="M${P(x0, y)}H${r(x1)}" stroke="${colour}" stroke-width="5"/><path d="M${P(x0, y + 9)}H${r(x1)}" stroke="${colour}" stroke-width="1.4"/>`
/** A diamond ornament, the printer's fleuron at its plainest. */
const diamondD = (cx, cy, s = 8) => `M${P(cx, cy - s)}L${P(cx + s, cy)}L${P(cx, cy + s)}L${P(cx - s, cy)}Z`
function ornamentRule(x0, x1, y, n = 9, colour = INK) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const cx = x0 + ((i + 0.5) / n) * (x1 - x0)
    d += diamondD(cx, y, i === (n - 1) / 2 ? 9 : 6)
  }
  let gaps = `M${P(x0, y)}`
  for (let i = 0; i < n; i++) {
    const cx = x0 + ((i + 0.5) / n) * (x1 - x0)
    gaps += `H${r(cx - 16)}M${P(cx + 16, y)}`
  }
  gaps += `H${r(x1)}`
  return `${pen(gaps, 1.2, { stroke: colour, cap: 'butt' })}${fillD(d, colour)}`
}

/* ══ WHAT HAPPENS TO THINGS ════════════════════════════════════════════
 *
 * Six ways to be destroyed, each a pure function of how long ago it started
 * (tau). Before tau 0 every one of them returns the thing untouched. They work
 * on any drawing: the drawing goes into <defs> once and the pieces are <use>s
 * of it, clipped, so a shattered guitar costs the guitar once plus a polygon
 * per shard.
 */

const GRAV = 1500

function defineObject(ctx, key, svg) {
  const id = `${ctx.uid}-ob-${key}`
  ctx.defs.push(`<g id="${id}">${svg}</g>`)
  return id
}

/**
 * Shatter from an impact point: wedges from the point, cut in rings, every
 * vertex shared with its neighbours so the shards tile exactly until they fly.
 */
function shardsFor(key, [x0, y0, x1, y1], [ix, iy], n, seed) {
  return memo(`sh:${key}:${n}:${seed}`, () => {
    const far = Math.hypot(Math.max(ix - x0, x1 - ix), Math.max(iy - y0, y1 - iy)) * 1.5 + 40
    const radii = [0, far * 0.12, far * 0.3, far * 0.58, far]
    const angle = (i) => ((i + 0.35 * (hash(i, 1, seed) - 0.5)) / n) * Math.PI * 2
    const vert = (i, j) => {
      const ii = ((i % n) + n) % n
      if (j === 0) return [ix, iy]
      const jr = j === radii.length - 1 ? 1 : 1 + 0.3 * (hash(ii, j, seed + 7) - 0.5)
      const a = angle(ii) + (j === radii.length - 1 ? 0 : 0.18 * (hash(ii, j, seed + 3) - 0.5))
      return [ix + Math.cos(a) * radii[j] * jr, iy + Math.sin(a) * radii[j] * jr]
    }
    const out = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < radii.length - 1; j++) {
        const pts = j === 0 ? [vert(i, 0), vert(i, 1), vert(i + 1, 1)] : [vert(i, j), vert(i, j + 1), vert(i + 1, j + 1), vert(i + 1, j)]
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
        const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
        const dx = cx - ix
        const dy = cy - iy
        const len = Math.hypot(dx, dy) || 1
        const k = hash(i, j, seed + 11)
        out.push({ pts, cx, cy, ux: dx / len, uy: dy / len, speed: 180 + 520 * k, lift: 100 + 340 * hash(i, j, seed + 13), spin: (hash(i, j, seed + 17) - 0.5) * 520 })
      }
    }
    return out
  })
}
function shatter(ctx, key, svg, { box, at, tau, n = 9, seed = 1, power = 1, gravity = GRAV, span = 3.2 }) {
  if (tau <= 0) return svg
  if (tau > span) return ''
  const id = defineObject(ctx, key, svg)
  const shards = shardsFor(`${key}:${box.join(',')}:${at.join(',')}`, box, at, n, seed)
  let out = ''
  shards.forEach((s, k) => {
    const cid = `${ctx.uid}-shc-${key}-${k}`
    ctx.defs.push(`<clipPath id="${cid}"><path d="${polyD(s.pts)}"/></clipPath>`)
    // A shard leaves at speed and slows; gravity takes it; it spins.
    const go = s.speed * power
    const dx = s.ux * go * (1 - Math.exp(-tau * 3)) / 3 * 2.4
    const dy = s.uy * go * (1 - Math.exp(-tau * 3)) / 3 * 2.4 - s.lift * power * tau + 0.5 * gravity * tau * tau
    const rot = s.spin * power * tau
    out += `<g transform="translate(${r(dx, 1)} ${r(dy, 1)}) rotate(${r(rot, 1)} ${r(s.cx)} ${r(s.cy)})"><use href="#${id}" clip-path="url(#${cid})"/></g>`
  })
  return out
}

/**
 * Tear into strips along jagged lines. `n` strips across (vertical tears) or
 * down (`across: false`). Each strip lets go at its own moment and falls away
 * turning; a torn edge shows the paper's fibre.
 */
function stripsFor(key, [x0, y0, x1, y1], n, vertical, seed) {
  return memo(`st:${key}:${n}:${vertical}:${seed}`, () => {
    const L = vertical ? y1 - y0 : x1 - x0
    const W = vertical ? x1 - x0 : y1 - y0
    const steps = Math.max(6, Math.round(L / 26))
    const cuts = []
    for (let c = 0; c <= n; c++) {
      const base = (c / n) * W
      const pts = []
      for (let s = 0; s <= steps; s++) {
        const along = -30 + ((L + 60) * s) / steps
        const off = c === 0 || c === n ? (c === 0 ? -60 : 60) : (hash(c, s, seed) - 0.5) * Math.min(34, (W / n) * 0.5) + noise1(s / 3, seed + c) * (W / n) * 0.18
        pts.push(vertical ? [x0 + base + off, y0 + along] : [x0 + along, y0 + base + off])
      }
      cuts.push(pts)
    }
    return Array.from({ length: n }, (_, i) => {
      const a = cuts[i]
      const b = cuts[i + 1]
      const pts = [...a, ...b.slice().reverse()]
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
      return { pts, cx, cy, edgeA: a, edgeB: b, i, k: hash(i, 99, seed) }
    })
  })
}
function tearStrips(ctx, key, svg, { box, tau, n = 2, vertical = true, seed = 1, spread = 1, stagger = 0.12, fibre = true, span = 3.4 }) {
  if (tau <= 0) return svg
  const id = defineObject(ctx, key, svg)
  const strips = stripsFor(`${key}:${box.join(',')}`, box, n, vertical, seed)
  const [x0, y0, x1, y1] = box
  const mid = vertical ? (x0 + x1) / 2 : (y0 + y1) / 2
  let out = ''
  for (const s of strips) {
    const cid = `${ctx.uid}-stc-${key}-${s.i}`
    ctx.defs.push(`<clipPath id="${cid}"><path d="${polyD(s.pts)}"/></clipPath>`)
    const local = tau - s.k * stagger * n * 0.5
    let inner = `<use href="#${id}" clip-path="url(#${cid})"/>`
    if (fibre && s.i > 0) inner += pen(openD(s.edgeA), 3, { stroke: FIBRE, extra: ` clip-path="url(#${cid})"` })
    if (fibre && s.i < n - 1) inner += pen(openD(s.edgeB), 3, { stroke: FIBRE, extra: ` clip-path="url(#${cid})"` })
    if (local <= 0) { out += inner; continue }
    if (local > span) continue
    const side = Math.sign((vertical ? s.cx : s.cy) - mid) || (s.i % 2 ? 1 : -1)
    // Peel first — a strip hinges away from the tear — then drop.
    const peel = easeOut(ramp(local, 0, 0.35))
    const fall = Math.max(0, local - 0.12)
    const dx = vertical ? side * (70 * peel + 180 * spread * fall) : (s.k - 0.5) * 240 * fall
    const dy = vertical ? 0.5 * GRAV * 0.8 * fall * fall - 40 * peel : side * 60 * peel + 0.5 * GRAV * 0.8 * fall * fall
    const rot = side * (14 * peel + (60 + 90 * s.k) * spread * fall)
    out += `<g transform="translate(${r(dx, 1)} ${r(dy, 1)}) rotate(${r(rot, 1)} ${r(s.cx)} ${r(s.cy)})">${inner}</g>`
  }
  return out
}

/**
 * Burn from a point: a ragged front that grows, a charred band on its edge, a
 * row of yellow tongues along it, and ash going up. The burnt part is gone, and
 * whatever is pasted under shows through.
 */
function burnFront(cx, cy, R, seed, n = 64) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 1 + 0.28 * noise1(i / 5, seed) + 0.1 * noise1(i / 1.7, seed + 5) + 0.12 * Math.max(0, -Math.sin(a))
    return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]
  })
}
function burn(ctx, key, svg, { box, at, tau, speed = 260, seed = 1, now = 0, flames = true, shape = null }) {
  if (tau <= 0) return svg
  const [x0, y0, x1, y1] = box
  const R = speed * tau * (0.6 + 0.4 * Math.min(1, tau))
  const far = Math.hypot(Math.max(at[0] - x0, x1 - at[0]), Math.max(at[1] - y0, y1 - at[1])) * 1.45
  if (R > far + 60) return ''
  const front = burnFront(at[0], at[1], R, seed)
  const id = `${ctx.uid}-bn-${key}`
  const hole = polyD(front.slice().reverse())
  ctx.defs.push(`<clipPath id="${id}"><path d="M${P(x0 - 200, y0 - 200)}H${r(x1 + 200)}V${r(y1 + 200)}H${r(x0 - 200)}Z${hole}" clip-rule="evenodd"/></clipPath>`)
  const ring = polyD(front)
  ctx.defs.push(`<clipPath id="${id}-box"><path d="${shape ?? `M${P(x0, y0)}H${r(x1)}V${r(y1)}H${r(x0)}Z`}"/></clipPath>`)
  let out = `<g clip-path="url(#${id})">${svg}<g clip-path="url(#${id}-box)">${pen(ring, 26, { stroke: INK, opacity: 0.55 })}${pen(ring, 9, { stroke: INK })}</g></g>`
  if (flames) {
    let d = ''
    front.forEach(([fx, fy], i) => {
      if (i % 2) return
      if (fx < x0 - 10 || fx > x1 + 10 || fy < y0 - 10 || fy > y1 + 10) return
      const h = 18 + 34 * (0.5 + 0.5 * Math.sin(now * 13 + i * 1.7)) * (0.6 + 0.4 * hash(i, 5, seed))
      const w = 9 + 5 * hash(i, 6, seed)
      const sway = 6 * Math.sin(now * 9 + i)
      d += `M${P(fx - w, fy)}Q${P(fx - w * 0.4 + sway * 0.5, fy - h * 0.55)} ${P(fx + sway, fy - h)}Q${P(fx + w * 0.4 + sway * 0.5, fy - h * 0.55)} ${P(fx + w, fy)}Z`
    })
    out += fillD(d, YELLOW)
  }
  // Ash: flecks of the burnt sheet going up and drifting.
  let ash = ''
  for (let i = 0; i < 18; i++) {
    const born = hash(i, 8, seed) * Math.max(0.2, tau - 0.2)
    const age = tau - born
    if (age < 0 || age > 2.2) continue
    const a = hash(i, 9, seed) * Math.PI * 2
    const bx = at[0] + Math.cos(a) * speed * born
    const by = at[1] + Math.sin(a) * speed * born
    const ax = bx + Math.sin(age * 3 + i) * 24 + (hash(i, 10, seed) - 0.5) * 80 * age
    const ay = by - 120 * age - 30 * age * age
    const s = 4 + 5 * hash(i, 11, seed)
    ash += `M${P(ax - s, ay)}L${P(ax, ay - s * 0.6)}L${P(ax + s, ay + s * 0.3)}Z`
  }
  return out + fillD(ash, INK, { opacity: 0.8 })
}

/**
 * A melt: the lower a point is in `box`, the further it sags, and a few
 * columns sag much further — drips. Returns a warp for renderParts.
 */
function meltWarp(box, m, seed = 1, { drips = 5, sag = 0.9, spread = 0.18 } = {}) {
  const [x0, y0, x1, y1] = box
  const w = x1 - x0
  const h = y1 - y0
  const cx = (x0 + x1) / 2
  const cols = Array.from({ length: drips }, (_, i) => ({
    x: x0 + w * (0.1 + 0.8 * hash(i, 1, seed)),
    wd: w * (0.025 + 0.035 * hash(i, 2, seed)),
    len: h * (0.5 + 1.4 * hash(i, 3, seed)),
  }))
  return (x, y) => {
    const v = clamp01((y - y0) / h)
    const drop = m * h * sag * v * v * (0.7 + 0.3 * noise1(x / 60, seed))
    let drip = 0
    for (const c of cols) drip += c.len * Math.exp(-(((x - c.x) / c.wd) ** 2)) * v ** 3
    return [x + (x - cx) * spread * m * v * v, y + drop + drip * m * m]
  }
}

/** Squash on impact: flattened from its base, spread sideways. */
const squash = (k, baseY = 0, cx = 0) =>
  `translate(${r(cx, 1)} ${r(baseY, 1)}) scale(${r(1 + 0.55 * k, 3)} ${r(Math.max(0.04, 1 - 0.92 * k), 3)}) translate(${r(-cx, 1)} ${r(-baseY, 1)})`

/**
 * Pied type: a word's letters knocked out of the forme, each flying on its own
 * ballistic path. Before tau 0, set; after, spilled.
 */
function pied(ctx, key, { x, y, size, text: s, fill = INK, tau, seed = 1, power = 1, width = null, tracking = 0 }) {
  const up = String(s).toUpperCase()
  const squeeze = width ? width / advance(up, size, tracking) : 1
  let cursor = x
  let out = ''
  let i = 0
  for (const ch of up) {
    const w = advance(ch, size, tracking) * squeeze
    if (ch !== ' ') {
      const k = hash(i, 1, seed)
      const lt = Math.max(0, tau - k * 0.12)
      const dx = (hash(i, 2, seed) - 0.5) * 900 * power * lt
      const dy = -(300 + 500 * hash(i, 3, seed)) * power * lt + 0.5 * GRAV * lt * lt
      const rot = (hash(i, 4, seed) - 0.5) * 900 * power * lt
      const cx = cursor + w / 2
      const inner = `<text x="${r(cx)}" y="${r(y)}" font-size="${r(size)}" font-weight="700" text-anchor="middle" fill="${fill}"${squeeze !== 1 ? ` transform="translate(${r(cx)} 0) scale(${r(squeeze, 3)} 1) translate(${r(-cx)} 0)"` : ''}>${esc(ch)}</text>`
      out += lt > 0 ? `<g transform="translate(${r(dx, 1)} ${r(dy, 1)}) rotate(${r(rot, 1)} ${r(cx)} ${r(y - size * 0.35)})">${inner}</g>` : inner
    }
    cursor += w
    i++
  }
  return out
}

/** A decaying shake: the sum of a few hits. Returns [dx, dy, roll]. */
function shakeAt(now, hits) {
  let dx = 0
  let dy = 0
  let rot = 0
  for (const [t0, amp, rate = 1] of hits) {
    const a = now - t0
    if (a < 0 || a > 1.4) continue
    const env = amp * Math.exp(-a / (0.22 * rate)) * smooth(a / 0.03)
    dx += env * Math.sin(a * 2 * Math.PI * 11.3 + t0)
    dy += env * 0.8 * Math.sin(a * 2 * Math.PI * 8.7 + 1.3 + t0 * 2)
    rot += env * 0.05 * Math.sin(a * 2 * Math.PI * 6.1 + 0.7)
  }
  return [dx, dy, rot]
}


/* ══ THE THINGS — cuts, in the printer's sense ═════════════════════════
 *
 * Every artifact is a "cut": a picture block locked up in the forme with the
 * type, printed flat in ink with the poster yellow as a second forme. Each is
 * drawn in its own local box, returns parts (so a warp can bend it), and takes
 * a palette so it can print reversed on a night poster — anything printed in
 * key black on a black poster is gone (ALBUM_NOTES).
 */

const DAY = { ink: INK, paper: PAPER, second: YELLOW }
const NIGHT = { ink: PAPER, paper: INK, second: YELLOW }

/** A closed Catmull–Rom curve through `ctrl`, sampled to points. */
function splinePts(ctrl, closed = true, per = 8) {
  const n = ctrl.length
  const at = (i) => (closed ? ctrl[(i + n) % n] : ctrl[Math.max(0, Math.min(n - 1, i))])
  const out = []
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    for (let k = 0; k < per; k++) {
      const s = k / per
      const s2 = s * s
      const s3 = s2 * s
      out.push([0, 1].map((c) => 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * s + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * s2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * s3)))
    }
  }
  if (!closed) out.push(ctrl[n - 1])
  return out
}
const ring = (cx, cy, r0, r1, n = 48) => [ellipsePts(cx, cy, r1, r1, n), ellipsePts(cx, cy, r0, r0, n).reverse()]

/* ── Guitar ─────────────────────────────────────────────────────────── */

const GUITAR_BODY = [[-200, 40], [-206, -40], [-172, -112], [-100, -132], [-34, -104], [40, -122], [112, -156], [140, -140], [118, -84], [96, -26], [96, 26], [84, 60], [110, 108], [84, 128], [20, 112], [-40, 126], [-122, 142], [-186, 112]]
const GUITAR_GUARD = [[-136, 26], [-92, -64], [-4, -84], [62, -62], [92, -24], [92, 40], [46, 90], [-56, 102], [-122, 84]]
/**
 * An electric guitar lying left to right, body at the origin, headstock at
 * +x. `snapped` strings (0–1) have broken at the nut and curl back.
 */
function guitarParts(c = DAY, { snapped = 0, now = 0 } = {}) {
  const body = splinePts(GUITAR_BODY, true, 6)
  const guard = splinePts(GUITAR_GUARD, true, 5)
  const neck = [[90, -21], [600, -17], [600, 17], [90, 21]]
  const head = [[600, -24], [640, -34], [740, -46], [752, -24], [738, 18], [640, 30], [600, 24]]
  const parts = [
    { pts: body, fill: c.ink },
    { pts: guard, fill: c.second },
    { pts: neck, fill: c.ink },
    { pts: head, fill: c.ink },
    { pts: rrectPts(-70, -30, 16, 60, 7), fill: c.ink },
    { pts: rrectPts(-22, -30, 16, 60, 7), fill: c.ink },
    { pts: rrectPts(26, -30, 16, 60, 7), fill: c.ink },
    { pts: rrectPts(-118, -30, 14, 60, 3), fill: c.paper },
  ]
  for (let f = 0; f < 14; f++) {
    const x = 600 - 480 * (1 - 0.5 ** ((f + 1) / 6.5)) * 1.62
    parts.push({ pts: [[x, -18], [x, 18]], stroke: c.paper, sw: 1.6, open: true, step: 4 })
  }
  for (let k = 0; k < 3; k++) {
    parts.push({ pts: ellipsePts(-40 + k * 30, 70 - k * 8, 9, 9, 14), fill: c.ink })
    parts.push({ pts: ellipsePts(660 + k * 30, -32 - k * 4, 6, 6, 10), fill: c.paper })
    parts.push({ pts: ellipsePts(660 + k * 30, 22 - k * 2, 6, 6, 10), fill: c.paper })
  }
  // The strings: bridge to nut, or broken and curling.
  for (let s = 0; s < 6; s++) {
    const y = -13 + s * 5.2
    const brk = clamp01(snapped * 1.6 - s * 0.12)
    if (brk <= 0) parts.push({ pts: [[-104, y], [600, y * 0.85]], stroke: c.paper, sw: 1.5, open: true, step: 18 })
    else {
      const len = 704 * (1 - 0.8 * easeOut(brk))
      const pts = []
      for (let i = 0; i <= 24; i++) {
        const u = i / 24
        const along = -104 + len * u
        const curl = easeOut(brk) * u * u
        pts.push([along - curl * 90 * Math.sin(u * 7 + s), y - curl * (120 + s * 30) * Math.sin(u * 3.2 + s * 0.4) + Math.sin(now * 30 + s) * 3 * (1 - brk)])
      }
      parts.push({ pts, stroke: c.paper, sw: 1.5, open: true, step: 18 })
    }
  }
  return parts
}
/** A warp that bends everything past `xb` round an arc (k > 0 bends it up). */
function bendWarp(xb, k) {
  if (Math.abs(k) < 1e-6) return null
  const R = 1 / k
  return (x, y) => {
    if (x <= xb) return [x, y]
    const phi = (x - xb) / R
    return [xb + (R + y) * Math.sin(phi), -R + (R + y) * Math.cos(phi)]
  }
}

/* ── Records and tape ───────────────────────────────────────────────── */

function vinylParts(c = DAY, { R = 200, label = 'THE HIT', spin = 0 } = {}) {
  const parts = [{ pts: ellipsePts(0, 0, R, R, 72), fill: c.ink }]
  for (let k = 0; k < 7; k++) {
    const rr = R * (0.44 + k * 0.075)
    parts.push({ pts: ellipsePts(0, 0, rr, rr, 64), stroke: c.paper, sw: 1.2, opacity: 0.45, step: 20 })
  }
  // The gloss: two arcs, which is what turns a black disc into a record.
  const g1 = ellipsePts(0, 0, R * 0.86, R * 0.86, 24, -2.4 + spin, -1.7 + spin)
  const g2 = ellipsePts(0, 0, R * 0.86, R * 0.86, 24, 0.74 + spin, 1.44 + spin)
  parts.push({ pts: g1, stroke: c.paper, sw: 4, opacity: 0.55, open: true }, { pts: g2, stroke: c.paper, sw: 4, opacity: 0.55, open: true })
  parts.push({ pts: ellipsePts(0, 0, R * 0.33, R * 0.33, 48), fill: c.second })
  parts.push({ pts: ellipsePts(0, 0, R * 0.045, R * 0.045, 16), fill: c.paper })
  if (label) parts.push({ svg: job(0, -R * 0.12, R * 0.075, label, { anchor: 'middle', fill: c.ink, weight: 700 }), at: [0, -R * 0.12] })
  return parts
}

function cassetteParts(c = DAY, { spin = 0, label = 'MIXTAPE · SIDE A' } = {}) {
  const W = 420
  const H = 264
  const parts = [
    { pts: rrectPts(-W / 2, -H / 2, W, H, 18), fill: c.ink },
    { pts: rrectPts(-W / 2 + 26, -H / 2 + 20, W - 52, 150, 8), fill: c.second },
    { pts: rrectPts(-110, -52, 220, 64, 30), fill: c.paper },
    { pts: [[-120, H / 2], [-96, H / 2 - 52], [96, H / 2 - 52], [120, H / 2]], fill: c.paper, opacity: 0.25 },
  ]
  for (const sx of [-68, 68]) {
    parts.push({ pts: ellipsePts(sx, -20, 26, 26, 24), fill: c.ink })
    const teeth = []
    for (let k = 0; k < 6; k++) {
      const a = spin * (sx < 0 ? 1 : 1.3) + (k / 6) * Math.PI * 2
      teeth.push([sx + Math.cos(a) * 13, -20 + Math.sin(a) * 13])
    }
    parts.push({ pts: teeth, fill: c.paper })
  }
  parts.push({ pts: rrectPts(-40, -30, 80, 22, 3), fill: c.ink })
  for (let k = 0; k < 3; k++) parts.push({ pts: [[-W / 2 + 44, -H / 2 + 42 + k * 14], [W / 2 - 44, -H / 2 + 42 + k * 14]], stroke: c.ink, sw: 1.4, open: true, step: 30, opacity: 0.5 })
  parts.push({ svg: job(0, -H / 2 + 94 + 60, 20, label, { anchor: 'middle', fill: c.ink, weight: 700 }), at: [0, 60] })
  for (const hx of [-70, 70]) parts.push({ pts: ellipsePts(hx, H / 2 - 24, 8, 8, 12), fill: c.paper })
  return parts
}

/* ── Loud things ────────────────────────────────────────────────────── */

function ampParts(c = DAY, { w = 360, h = 290, word = 'LOUD' } = {}) {
  const parts = [
    { pts: rrectPts(-w / 2, -h, w, h, 14), fill: c.ink },
    { pts: rrectPts(-w / 2 + 22, -h + 70, w - 44, h - 92, 6), fill: c.second },
  ]
  const gx0 = -w / 2 + 22
  const gx1 = w / 2 - 22
  const gy0 = -h + 70
  const gy1 = -22
  for (let k = -14; k < 20; k++) {
    for (const dir of [1, -1]) {
      const seg = clipSeg(gx0 + k * 28, gy0, gx0 + k * 28 + dir * (gy1 - gy0), gy1, gx0, gy0, gx1, gy1)
      if (seg) parts.push({ pts: seg, stroke: c.ink, sw: 1.6, open: true, step: 40, opacity: 0.5 })
    }
  }
  for (let k = 0; k < 5; k++) parts.push({ pts: ellipsePts(-w / 2 + 44 + k * 34, -h + 36, 10, 10, 14), fill: c.paper })
  parts.push({ svg: job(w / 2 - 34, -h + 46, 26, word, { anchor: 'end', fill: c.second, weight: 700, tracking: 4 }), at: [w / 2 - 34, -h + 46] })
  return parts
}
/** A segment clipped to a rectangle (Liang–Barsky), or null. */
function clipSeg(x0, y0, x1, y1, rx0, ry0, rx1, ry1) {
  let a = 0
  let b = 1
  const dx = x1 - x0
  const dy = y1 - y0
  for (const [p, q] of [[-dx, x0 - rx0], [dx, rx1 - x0], [-dy, y0 - ry0], [dy, ry1 - y0]]) {
    if (p === 0) { if (q < 0) return null; continue }
    const u = q / p
    if (p < 0) a = Math.max(a, u)
    else b = Math.min(b, u)
    if (a > b) return null
  }
  return [[x0 + dx * a, y0 + dy * a], [x0 + dx * b, y0 + dy * b]]
}

/** A megaphone, mouth at +x, handle under. */
function megaphoneParts(c = DAY, { L = 300, mouth = 110 } = {}) {
  return [
    { pts: [[0, -26], [L, -mouth], [L, mouth], [0, 26]], fill: c.ink },
    { pts: rrectPts(-40, -26, 44, 52, 8), fill: c.ink },
    { pts: ellipsePts(L, 0, 22, mouth, 32), fill: c.second },
    { pts: [[40, 26], [60, 90], [84, 90], [80, 26]], fill: c.ink },
    { pts: [[L * 0.35, -26 - (mouth - 26) * 0.35], [L * 0.35, 26 + (mouth - 26) * 0.35]], stroke: c.paper, sw: 5, open: true, step: 12 },
  ]
}
function headphoneParts(c = DAY, { R = 150 } = {}) {
  const band = [...ellipsePts(0, 0, R, R, 36, Math.PI, Math.PI * 2), ...ellipsePts(0, 0, R - 26, R - 26, 36, Math.PI, Math.PI * 2).reverse()]
  return [
    { pts: band, fill: c.ink },
    { pts: rrectPts(-R - 34, -20, 68, 110, 26), fill: c.ink },
    { pts: rrectPts(R - 34, -20, 68, 110, 26), fill: c.ink },
    { pts: rrectPts(-R - 18, -4, 36, 78, 14), fill: c.second },
    { pts: rrectPts(R - 18, -4, 36, 78, 14), fill: c.second },
  ]
}
/** A loudspeaker horn on a pole, the kind that shouts across a square. */
function hornParts(c = DAY, { L = 190, mouth = 70, angle = -12 } = {}) {
  const horn = rotPts([[0, -14], [L * 0.6, -24], [L, -mouth], [L, mouth], [L * 0.6, 24], [0, 14]], angle)
  return [{ pts: horn, fill: c.ink }, { pts: rotPts(ellipsePts(L, 0, 14, mouth, 24), angle), fill: c.second }]
}

/* ── The lights on the shore ────────────────────────────────────────── */

/** A striped lighthouse, base at the origin, `H` tall. Returns parts and where its lamp is. */
function lighthouseParts(c = DAY, { H = 420, W = 120, bands = 4, lit = 1 } = {}) {
  const top = -H
  const tw = W * 0.55
  const tower = [[-W / 2, 0], [-tw / 2, top + 70], [tw / 2, top + 70], [W / 2, 0]]
  const parts = [{ pts: tower, fill: c.paper }, { pts: tower, stroke: c.ink, sw: 4 }]
  for (let b = 0; b < bands; b++) {
    const y0 = -((b * 2 + 1) / (bands * 2)) * (H - 70)
    const y1 = y0 - (H - 70) / (bands * 2)
    const wAt = (y) => lerp(W, tw, -y / (H - 70)) / 2
    parts.push({ pts: [[-wAt(y0), y0], [-wAt(y1), y1], [wAt(y1), y1], [wAt(y0), y0]], fill: c.ink })
  }
  parts.push(
    { pts: rrectPts(-tw / 2 - 16, top + 58, tw + 32, 14, 2), fill: c.ink },
    { pts: rrectPts(-tw / 2 + 4, top + 16, tw - 8, 44, 4), fill: lit > 0.5 ? c.second : c.paper },
    { pts: rrectPts(-tw / 2 + 4, top + 16, tw - 8, 44, 4), stroke: c.ink, sw: 4 },
    { pts: [[-tw / 2 - 4, top + 18], [0, top - 14], [tw / 2 + 4, top + 18]], fill: c.ink },
  )
  return { parts, lamp: [0, top + 38] }
}
/**
 * A lighthouse's beam in the side view: a wedge that sweeps round, long when it
 * points across the frame and short when it points at us. `phase` in turns.
 */
function beamPts([lx, ly], phase, { L = 900, spread = 0.09 } = {}) {
  const a = phase * Math.PI * 2
  const reach = L * Math.cos(a)
  const half = Math.abs(reach) * Math.tan(spread) + 14
  const tilt = Math.sin(a) * 0.08
  return { pts: [[lx, ly - 8], [lx + reach, ly - half + reach * tilt], [lx + reach, ly + half + reach * tilt], [lx, ly + 8]], reach, tilt }
}

/* ── The system's furniture ─────────────────────────────────────────── */

function metronomeParts(c = DAY, { H = 300, swing = 0 } = {}) {
  const W = H * 0.62
  const parts = [
    { pts: [[-W / 2, 0], [-W * 0.18, -H], [W * 0.18, -H], [W / 2, 0]], fill: c.ink },
    { pts: [[-W * 0.3, -22], [-W * 0.13, -H + 30], [W * 0.13, -H + 30], [W * 0.3, -22]], fill: c.paper },
  ]
  for (let k = 0; k < 9; k++) {
    const y = -40 - k * ((H - 90) / 9)
    parts.push({ pts: [[-10, y], [10, y]], stroke: c.ink, sw: 2, open: true, step: 20 })
  }
  const arm = rotPts([[-4, -30], [-4, -H + 10], [4, -H + 10], [4, -30]], swing * 32, 0, -30)
  const weight = rotPts([[-18, -H * 0.62], [18, -H * 0.62], [13, -H * 0.5], [-13, -H * 0.5]], swing * 32, 0, -30)
  parts.push({ pts: arm, fill: c.ink }, { pts: weight, fill: c.second })
  return parts
}
function trophyParts(c = DAY, { H = 340, label = 'No. 1' } = {}) {
  const cup = splinePts([[-100, -H], [100, -H], [86, -H + 90], [40, -H + 150], [14, -H + 170], [-14, -H + 170], [-40, -H + 150], [-86, -H + 90]], true, 6)
  return [
    { pts: [[-110, -H + 12], [-150, -H + 16], [-152, -H + 80], [-72, -H + 128]], stroke: c.ink, sw: 12, open: true },
    { pts: [[110, -H + 12], [150, -H + 16], [152, -H + 80], [72, -H + 128]], stroke: c.ink, sw: 12, open: true },
    { pts: cup, fill: c.second },
    { pts: cup, stroke: c.ink, sw: 5 },
    { pts: [[-14, -H + 168], [14, -H + 168], [22, -110], [-22, -110]], fill: c.ink },
    { pts: rrectPts(-70, -112, 140, 34, 4), fill: c.ink },
    { pts: rrectPts(-100, -80, 200, 80, 4), fill: c.ink },
    { svg: job(0, -28, 34, label, { anchor: 'middle', fill: c.paper, weight: 700, upper: false }), at: [0, -28] },
  ]
}
/** A stack of how-to books, spines out, base at the origin. */
const BOOKS = [
  ['10 Steps to Success', 34, 330], ['The Formula', 44, 300], ['Hustle Harder', 30, 350],
  ['Say Yes to Everything', 38, 318], ['How to Make It', 42, 290], ['Be Like Them', 32, 340],
]
function booksParts(c = DAY, { books = BOOKS, lean = 0 } = {}) {
  const parts = []
  let y = 0
  books.forEach(([title, h, w], i) => {
    const off = (hash(i, 1, 5) - 0.5) * 40
    const fill = i % 3 === 1 ? c.second : c.ink
    const ink = fill === c.second ? c.ink : c.paper
    parts.push({ pts: rotPts(rrectPts(-w / 2 + off, y - h, w, h, 3), lean * (i + 1), 0, y), fill })
    parts.push({ svg: job(off, y - h / 2 + h * 0.18, Math.min(20, h * 0.5), title, { anchor: 'middle', fill: ink, weight: 700, tracking: 1.5 }), at: [off, y - h / 2] })
    y -= h + 2
  })
  return parts
}
/** A contract, a sheet of it: heading, clauses, the line to sign on. */
function contractParts(c = DAY, { w = 380, h = 500, title = 'Agreement', seed = 3 } = {}) {
  const parts = [{ pts: rrectPts(-w / 2, -h / 2, w, h, 2), fill: c.paper }, { pts: rrectPts(-w / 2, -h / 2, w, h, 2), stroke: c.ink, sw: 3 }]
  parts.push({ svg: job(0, -h / 2 + 62, 34, title, { anchor: 'middle', fill: c.ink, weight: 700, tracking: 5 }), at: [0, -h / 2 + 60] })
  parts.push({ pts: [[-w / 2 + 30, -h / 2 + 82], [w / 2 - 30, -h / 2 + 82]], stroke: c.ink, sw: 2, open: true, step: 40 })
  const rand = seq(seed)
  for (let k = 0; k < 13; k++) {
    const y = -h / 2 + 112 + k * 20
    const len = (w - 60) * (k % 5 === 4 ? 0.55 : 0.8 + 0.2 * rand())
    parts.push({ pts: [[-w / 2 + 30, y], [-w / 2 + 30 + len, y]], stroke: c.ink, sw: 5, opacity: 0.7, open: true, step: 40 })
  }
  const sy = h / 2 - 70
  parts.push({ pts: [[-w / 2 + 60, sy], [w / 2 - 40, sy]], stroke: c.ink, sw: 2, open: true, step: 40 })
  parts.push({ svg: job(-w / 2 + 30, sy - 4, 30, '×', { fill: c.ink, weight: 700 }), at: [-w / 2 + 30, sy] })
  parts.push({ svg: job(0, sy + 26, 14, 'Sign here', { anchor: 'middle', fill: c.ink, tracking: 4 }), at: [0, sy + 20] })
  // The seal: a sunburst in the second ink.
  const seal = []
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2
    const rr = k % 2 ? 38 : 48
    seal.push([w / 2 - 70 + Math.cos(a) * rr, sy - 60 + Math.sin(a) * rr])
  }
  parts.push({ pts: seal, fill: c.second })
  return parts
}
/** Paint by numbers on an easel: a sunset in numbered cells, filled in a fixed order, `on` of them so far. */
function paintByNumbersParts(c = DAY, { w = 360, h = 270, on = 6, numbers = true } = {}) {
  const x0 = -w / 2
  const y0 = -h - 150
  const parts = [
    { pts: [[-120, 0], [-24, y0 - 40], [-8, y0 - 40], [-96, 0]], fill: c.ink },
    { pts: [[120, 0], [24, y0 - 40], [8, y0 - 40], [96, 0]], fill: c.ink },
    { pts: [[-8, y0 - 60], [8, y0 - 60], [30, 0], [14, 0]], fill: c.ink },
    { pts: rrectPts(x0 - 16, -150, w + 32, 18, 3), fill: c.ink },
    { pts: rrectPts(x0, y0, w, h, 2), fill: c.paper },
  ]
  // The cells: a sun, two hills, a sky in bands. Numbers where the colours go.
  const cells = [
    { pts: ellipsePts(60, y0 + h * 0.46, 50, 50, 28, Math.PI, Math.PI * 2) },
    { pts: splinePts([[x0, y0 + h * 0.62], [x0 + w * 0.3, y0 + h * 0.48], [x0 + w * 0.62, y0 + h * 0.66], [x0 + w, y0 + h * 0.55], [x0 + w, y0 + h], [x0, y0 + h]], false, 6) },
    { pts: splinePts([[x0, y0 + h * 0.82], [x0 + w * 0.45, y0 + h * 0.7], [x0 + w, y0 + h * 0.86], [x0 + w, y0 + h], [x0, y0 + h]], false, 6) },
  ]
  for (let b = 0; b < 3; b++) cells.push({ pts: rrectPts(x0, y0 + b * h * 0.15, w, h * 0.15, 0) })
  const clampIn = (pts) => pts.map(([x, y]) => [Math.max(x0, Math.min(x0 + w, x)), Math.max(y0, Math.min(y0 + h, y))])
  const order = [4, 0, 1, 3, 2, 5]
  cells.forEach((cell, i) => {
    cell.pts = clampIn(cell.pts)
    const filled = order.indexOf(i) < on
    if (filled) parts.push({ pts: cell.pts, fill: i === 0 || i === 4 || i === 2 ? c.second : c.ink, opacity: i === 1 || i === 3 ? 0.85 : 1 })
    parts.push({ pts: cell.pts, stroke: c.ink, sw: 1.5 })
  })
  if (numbers) {
    const nums = [[60, y0 + h * 0.4, 2], [x0 + w * 0.25, y0 + h * 0.66, 1], [x0 + w * 0.7, y0 + h * 0.9, 3], [x0 + w * 0.15, y0 + 30, 4], [x0 + w * 0.8, y0 + 30 + h * 0.15, 5], [x0 + w * 0.3, y0 + 30 + h * 0.3, 6]]
    for (const [nx, ny, n] of nums) parts.push({ svg: job(nx, ny, 16, String(n), { anchor: 'middle', fill: c.ink, weight: 600, tracking: 0 }), at: [nx, ny] })
  }
  parts.push({ pts: rrectPts(x0, y0, w, h, 2), stroke: c.ink, sw: 6 })
  return parts
}
/** The punch clock on the wall: a face, a slot, PUNCH IN. */
function punchClockParts(c = DAY, { spin = 0 } = {}) {
  const parts = [
    { pts: rrectPts(-120, -400, 240, 330, 16), fill: c.ink },
    { pts: ellipsePts(0, -300, 78, 78, 40), fill: c.paper },
    { pts: rrectPts(-60, -170, 120, 14, 4), fill: c.paper },
    { svg: job(0, -110, 20, 'Punch in', { anchor: 'middle', fill: c.second, weight: 700, tracking: 5 }), at: [0, -110] },
  ]
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2
    parts.push({ pts: [[Math.cos(a) * 64, -300 + Math.sin(a) * 64], [Math.cos(a) * 72, -300 + Math.sin(a) * 72]], stroke: c.ink, sw: 4, open: true, step: 20 })
  }
  parts.push({ pts: [[0, -300], [Math.cos(spin - Math.PI / 2) * 60, -300 + Math.sin(spin - Math.PI / 2) * 60]], stroke: c.ink, sw: 5, open: true, step: 20 })
  parts.push({ pts: [[0, -300], [Math.cos(spin / 12 - Math.PI / 2) * 40, -300 + Math.sin(spin / 12 - Math.PI / 2) * 40]], stroke: c.ink, sw: 8, open: true, step: 20 })
  return parts
}
/** A rung ladder, leaning; `broken` rungs (a count) have snapped from the top down. */
function ladderParts(c = DAY, { H = 600, W = 110, rungs = 10, broken = 0 } = {}) {
  const parts = [
    { pts: [[-W / 2 - 8, 0], [-W / 2 + 26, -H], [-W / 2 + 40, -H], [-W / 2 + 8, 0]], fill: c.ink },
    { pts: [[W / 2 - 8, 0], [W / 2 - 40, -H], [W / 2 - 26, -H], [W / 2 + 8, 0]], fill: c.ink },
  ]
  for (let k = 0; k < rungs; k++) {
    const u = (k + 0.7) / rungs
    const y = -H * u
    const hw = lerp(W / 2, W / 2 - 32, u)
    const fromTop = rungs - 1 - k
    if (fromTop < broken) {
      const drop = clamp01(broken - fromTop)
      parts.push({ pts: [[-hw, y], [-hw * 0.2, y + 30 * drop]], stroke: c.ink, sw: 9, open: true, step: 20 })
      parts.push({ pts: [[hw, y], [hw * 0.3, y + 44 * drop]], stroke: c.ink, sw: 9, open: true, step: 20 })
    }
    else parts.push({ pts: [[-hw, y], [hw, y]], stroke: c.ink, sw: 9, open: true, step: 20 })
  }
  return parts
}
function chalkboardParts(c = DAY, { w = 620, h = 330, lines = ['Talent', '+ hustle', '+ the right city', '= success'] } = {}) {
  const parts = [
    { pts: rrectPts(-w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 6), fill: c.second },
    { pts: rrectPts(-w / 2, -h / 2, w, h, 2), fill: c.ink },
  ]
  lines.forEach((s, i) => parts.push({ svg: text({ x: -w / 2 + 50, y: -h / 2 + 70 + i * 66, size: 50, text: s, fill: c.paper, weight: 400, upper: false, opacity: 0.92 }), at: [-w / 2 + 50, -h / 2 + 60 + i * 66] }))
  return parts
}
/** A cash register ringing up what a stream pays. */
function registerParts(c = DAY, { display = '$0.003', open = 0 } = {}) {
  return [
    { pts: [[-170, 0], [-150, -150], [150, -150], [170, 0]], fill: c.ink },
    { pts: rrectPts(-120, -250, 240, 90, 8), fill: c.ink },
    { pts: rrectPts(-100, -236, 200, 60, 4), fill: c.second },
    { svg: job(0, -190, 44, display, { anchor: 'middle', fill: c.ink, weight: 700, tracking: 2 }), at: [0, -190] },
    ...Array.from({ length: 12 }, (_, k) => ({ pts: ellipsePts(-90 + (k % 6) * 36, -118 + Math.floor(k / 6) * 34, 12, 10, 12), fill: c.paper })),
    { pts: rrectPts(-180, -4 + open * 80, 360, 60, 4), fill: c.ink },
    { pts: rrectPts(-30, 16 + open * 80, 60, 14, 6), fill: c.paper },
  ]
}
/** Sheet music: a love song's page — five staves, notes, a title. */
function sheetMusicParts(c = DAY, { w = 380, h = 480, title = 'A Love Song', seed = 2 } = {}) {
  const parts = [{ pts: rrectPts(-w / 2, -h / 2, w, h, 2), fill: c.paper }, { pts: rrectPts(-w / 2, -h / 2, w, h, 2), stroke: c.ink, sw: 2.5 }]
  parts.push({ svg: job(0, -h / 2 + 54, 30, title, { anchor: 'middle', fill: c.ink, weight: 700, tracking: 4 }), at: [0, -h / 2 + 50] })
  const rand = seq(seed)
  for (let s = 0; s < 5; s++) {
    const top = -h / 2 + 100 + s * 72
    for (let l = 0; l < 5; l++) parts.push({ pts: [[-w / 2 + 24, top + l * 8], [w / 2 - 24, top + l * 8]], stroke: c.ink, sw: 1.1, open: true, step: 40 })
    for (let n = 0; n < 7; n++) {
      const nx = -w / 2 + 60 + n * ((w - 90) / 7)
      const ny = top + Math.round(rand() * 8) * 4
      parts.push({ pts: ellipsePts(nx, ny, 7, 5, 12), fill: c.ink })
      parts.push({ pts: [[nx + 6, ny], [nx + 6, ny - 30]], stroke: c.ink, sw: 2, open: true, step: 12 })
    }
  }
  return parts
}
/** A submarine, bow at +x, with the dreams painted on it. */
function submarineParts(c = DAY, { L = 520, H = 120, periscope = 1 } = {}) {
  const hull = splinePts([[-L / 2, 0], [-L / 2 + 40, -H / 2], [L / 2 - 80, -H / 2], [L / 2, -6], [L / 2 - 30, H / 2 - 10], [-L / 2 + 40, H / 2]], true, 6)
  const parts = [
    { pts: hull, fill: c.ink },
    { pts: rrectPts(-60, -H / 2 - 70, 140, 76, 18), fill: c.ink },
    { pts: rrectPts(10, -H / 2 - 70 - 90 * periscope, 12, 90 * periscope + 10, 2), fill: c.ink },
    { pts: rrectPts(10, -H / 2 - 74 - 90 * periscope, 40, 14, 3), fill: c.ink },
    { pts: [[-L / 2, 0], [-L / 2 - 50, -40], [-L / 2 - 50, 40]], fill: c.ink },
  ]
  for (let k = 0; k < 5; k++) parts.push({ pts: ellipsePts(-L / 2 + 120 + k * 64, -4, 14, 14, 16), fill: c.second })
  parts.push({ svg: job(-20, H / 2 - 22, 20, 'Easy Dreams', { anchor: 'middle', fill: c.paper, weight: 700, tracking: 5 }), at: [-20, H / 2 - 22] })
  return parts
}
/** A yellow cab, side on, wheels on the origin line. */
function taxiParts(c = DAY, { L = 420 } = {}) {
  const body = [[-L / 2, -30], [-L / 2 + 10, -92], [-L / 2 + 110, -100], [-L / 2 + 150, -160], [L / 2 - 150, -160], [L / 2 - 100, -100], [L / 2 - 6, -90], [L / 2, -30]]
  return [
    { pts: body, fill: c.second },
    { pts: body, stroke: c.ink, sw: 4 },
    { pts: [[-L / 2 + 160, -150], [-8, -150], [-8, -104], [-L / 2 + 124, -104]], fill: c.ink },
    { pts: [[8, -150], [L / 2 - 160, -150], [L / 2 - 116, -104], [8, -104]], fill: c.ink },
    { pts: rrectPts(-34, -190, 68, 30, 4), fill: c.ink },
    { svg: job(0, -168, 16, 'Taxi', { anchor: 'middle', fill: c.second, weight: 700, tracking: 3 }), at: [0, -170] },
    { pts: rrectPts(-L / 2 + 30, -70, L - 60, 14, 2), fill: c.ink, opacity: 0.8 },
    ...ring(-L / 2 + 90, -24, 18, 40, 28).map((pts) => ({ pts, fill: c.ink, rule: 'evenodd' })),
    ...ring(L / 2 - 90, -24, 18, 40, 28).map((pts) => ({ pts, fill: c.ink, rule: 'evenodd' })),
  ]
}

/*
 * New York in wood type, as a skyline: each letter a tower with its windows
 * lit in the second ink. The letters are built from bars, so the whole skyline
 * is polygons and can melt.
 */
const SKY_LETTERS = {
  N: (w, h, s) => [[[0, 0], [0, -h], [s, -h], [s, 0]], [[w - s, 0], [w - s, -h], [w, -h], [w, 0]], [[0, -h], [s * 1.1, -h], [w, 0], [w - s * 1.1, 0]]],
  E: (w, h, s) => [[[0, 0], [0, -h], [s, -h], [s, 0]], [[0, -h], [w, -h], [w, -h + s], [0, -h + s]], [[0, -h / 2 - s / 2], [w * 0.85, -h / 2 - s / 2], [w * 0.85, -h / 2 + s / 2], [0, -h / 2 + s / 2]], [[0, -s], [w, -s], [w, 0], [0, 0]]],
  W: (w, h, s) => [[[0, -h], [s, -h], [w * 0.3 + s / 2, 0], [w * 0.3 - s / 2, 0]], [[w * 0.3 - s / 2, 0], [w * 0.5 - s / 2, -h * 0.7], [w * 0.5 + s / 2, -h * 0.7], [w * 0.3 + s / 2, 0]], [[w * 0.7 - s / 2, 0], [w * 0.5 - s / 2, -h * 0.7], [w * 0.5 + s / 2, -h * 0.7], [w * 0.7 + s / 2, 0]], [[w - s, -h], [w, -h], [w * 0.7 + s / 2, 0], [w * 0.7 - s / 2, 0]]],
  Y: (w, h, s) => [[[0, -h], [s, -h], [w / 2 + s / 2, -h * 0.45], [w / 2 - s / 2, -h * 0.45]], [[w - s, -h], [w, -h], [w / 2 + s / 2, -h * 0.45], [w / 2 - s / 2, -h * 0.45]], [[w / 2 - s / 2, -h * 0.5], [w / 2 + s / 2, -h * 0.5], [w / 2 + s / 2, 0], [w / 2 - s / 2, 0]]],
  O: (w, h, s) => [rrectPts(0, -h, w, h, w * 0.3, 6), rrectPts(s, -h + s, w - 2 * s, h - 2 * s, w * 0.2, 6).reverse()],
  R: (w, h, s) => [[[0, 0], [0, -h], [s, -h], [s, 0]], ...[rrectPts(0, -h, w, h * 0.55, h * 0.2, 5), rrectPts(s, -h + s, w - 2 * s, h * 0.55 - 2 * s, h * 0.12, 5).reverse()], [[w * 0.35, -h * 0.47], [w * 0.35 + s, -h * 0.47], [w, 0], [w - s, 0]]],
  K: (w, h, s) => [[[0, 0], [0, -h], [s, -h], [s, 0]], [[s * 0.6, -h * 0.45], [w - s, -h], [w, -h], [s * 1.4, -h * 0.4]], [[s * 1.2, -h * 0.5], [w, 0], [w - s, 0], [s * 0.6, -h * 0.4]]],
}
function skylineParts(c = DAY, { word = 'NEW YORK', H = 420, seed = 9 } = {}) {
  const parts = []
  let x = 0
  const letters = []
  ;[...word].forEach((ch, i) => {
    if (ch === ' ') { x += H * 0.2; return }
    const h = H * (0.72 + 0.34 * hash(i, 1, seed))
    const w = H * (ch === 'W' ? 0.62 : ch === 'I' ? 0.14 : 0.4)
    const s = H * 0.12
    const shapes = SKY_LETTERS[ch](w, h, s).map((pts) => movePts(pts, x, 0))
    letters.push({ ch, x, w, h, i, shapes })
    x += w + H * 0.06
  })
  const total = x - H * 0.06
  for (const L of letters) {
    const shapes = L.shapes.map((pts) => movePts(pts, -total / 2, 0))
    parts.push({ pts: shapes, fill: c.ink, group: L.i })
    // Windows: a grid of small lit squares on the letter's bars, some dark.
    const lx = L.x - total / 2
    for (let wy = -L.h + 26; wy < -18; wy += 30) {
      for (let wx = lx + 10; wx < lx + L.w - 14; wx += 22) {
        if (hash(Math.round(wx), Math.round(wy), seed) < 0.5) continue
        if (!insideAny(shapes, wx + 4, wy + 5)) continue
        parts.push({ pts: rrectPts(wx, wy, 8, 10, 1), fill: c.second, group: L.i })
      }
    }
    // An antenna on the tallest.
    if (L.h > H * 0.98) parts.push({ pts: [[lx + L.w / 2 - 3, -L.h], [lx + L.w / 2 - 1, -L.h - 90], [lx + L.w / 2 + 1, -L.h - 90], [lx + L.w / 2 + 3, -L.h]], fill: c.ink, group: L.i })
  }
  return { parts, width: total }
}
function inside(pts, x, y) {
  let hit = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}
const signedArea = (pts) => pts.reduce((sum, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return sum + x * y2 - x2 * y }, 0)
/** Inside by the non-zero rule: in some shape wound one way and in no hole wound the other. */
function insideAny(shapes, x, y) {
  let wind = 0
  for (const s of shapes) if (inside(s, x, y)) wind += Math.sign(signedArea(s))
  return wind !== 0
}


/* ── More of the system ─────────────────────────────────────────────── */

/** An old television, screen showing a slogan in the second ink. */
function tvParts(c = DAY, { w = 250, h = 190, slogan = 'Stay tuned', seed = 1 } = {}) {
  const parts = [
    { pts: rrectPts(-w / 2, -h / 2, w, h, 16), fill: c.ink },
    { pts: rrectPts(-w / 2 + 18, -h / 2 + 18, w * 0.7, h - 36, 22), fill: c.second },
    { pts: [[-20, -h / 2], [-60, -h / 2 - 60]], stroke: c.ink, sw: 4, open: true, step: 20 },
    { pts: [[10, -h / 2], [54, -h / 2 - 54]], stroke: c.ink, sw: 4, open: true, step: 20 },
    { pts: ellipsePts(w / 2 - 34, -h / 2 + 50, 13, 13, 16), fill: c.paper },
    { pts: ellipsePts(w / 2 - 34, -h / 2 + 90, 13, 13, 16), fill: c.paper },
    { pts: [[-w / 2 + 30, h / 2], [-w / 2 + 20, h / 2 + 24], [-w / 2 + 40, h / 2 + 24]], fill: c.ink },
    { pts: [[w / 2 - 30, h / 2], [w / 2 - 20, h / 2 + 24], [w / 2 - 40, h / 2 + 24]], fill: c.ink },
  ]
  const words = String(slogan).split(' ')
  const sx = -w / 2 + 18 + w * 0.35
  words.forEach((word, i) => {
    const size = Math.min(34, (w * 0.62) / Math.max(1, advance(word, 1, 0.06)))
    const y = -((words.length - 1) * size * 1.02) / 2 + i * size * 1.02 + size * 0.36
    parts.push({ svg: job(sx, y, size, word, { anchor: 'middle', fill: c.ink, weight: 700, tracking: 1 }), at: [sx, y] })
  })
  return parts
}
function reportCardParts(c = DAY, { w = 300, h = 380 } = {}) {
  const parts = [{ pts: rrectPts(-w / 2, -h, w, h, 3), fill: c.paper }, { pts: rrectPts(-w / 2, -h, w, h, 3), stroke: c.ink, sw: 3 }]
  parts.push({ svg: job(0, -h + 44, 24, 'Report card', { anchor: 'middle', fill: c.ink, weight: 700, tracking: 4 }), at: [0, -h + 40] })
  const rows = [['Follows directions', 'F'], ['Stays in line', 'F'], ['Plays it safe', 'F'], ['Fits in', 'F']]
  rows.forEach(([what, grade], i) => {
    const y = -h + 100 + i * 52
    parts.push({ pts: [[-w / 2 + 20, y + 14], [w / 2 - 20, y + 14]], stroke: c.ink, sw: 1.4, open: true, step: 40 })
    parts.push({ svg: job(-w / 2 + 24, y, 15, what, { fill: c.ink, tracking: 1.5 }), at: [-w / 2 + 24, y] })
    parts.push({ svg: job(w / 2 - 36, y + 4, 34, grade, { anchor: 'middle', fill: c.ink, weight: 700, tracking: 0 }), at: [w / 2 - 36, y] })
  })
  parts.push({ pts: ellipsePts(w / 2 - 36, -h + 100 + 3 * 52 - 8, 30, 26, 24), stroke: c.second, sw: 5 })
  return parts
}
/** A wooden rule, the printer's line gauge: THE RULES along it. Centred on the origin. */
function rulerParts(c = DAY, { L = 560, H = 60 } = {}) {
  const parts = [{ pts: rrectPts(-L / 2, -H / 2, L, H, 4), fill: c.second }, { pts: rrectPts(-L / 2, -H / 2, L, H, 4), stroke: c.ink, sw: 3 }]
  for (let k = 0; k <= 40; k++) {
    const x = -L / 2 + 10 + (k * (L - 20)) / 40
    parts.push({ pts: [[x, -H / 2], [x, -H / 2 + (k % 5 ? 10 : 20)]], stroke: c.ink, sw: 2, open: true, step: 12 })
  }
  parts.push({ svg: job(0, 20, 20, 'The rules', { anchor: 'middle', fill: c.ink, weight: 700, tracking: 6 }), at: [0, 14] })
  return parts
}
/** A guitar case covered in stickers from the places it was told to go. */
function caseParts(c = DAY, { L = 400 } = {}) {
  const outline = splinePts([[-L / 2, -40], [-L / 2 + 60, -110], [-L / 2 + 170, -100], [-10, -60], [L / 2 - 20, -50], [L / 2, 0], [L / 2 - 20, 50], [-10, 60], [-L / 2 + 170, 100], [-L / 2 + 60, 110], [-L / 2, 40]], true, 6)
  const parts = [{ pts: outline, fill: c.ink }, { pts: rrectPts(-30, -70, 60, 18, 8), fill: c.second }]
  const stickers = [['MEMPHIS', -120, -40, -8], ['L.A.', -80, 40, 10], ['NASHVILLE', 80, -10, 4]]
  for (const [word, sx, sy, rot] of stickers) {
    const w = jobW(word, 16, 2) + 16
    parts.push({ pts: rotPts(rrectPts(sx - w / 2, sy - 14, w, 28, 3), rot, sx, sy), fill: c.paper })
    parts.push({ svg: job(sx, sy + 6, 16, word, { anchor: 'middle', fill: c.ink, weight: 700, tracking: 2, transform: `rotate(${rot} ${sx} ${sy})` }), at: [sx, sy] })
  }
  return parts
}
/** A rubber stamp, block down at the origin. */
function rubberStampParts(c = DAY, { w = 180 } = {}) {
  return [
    { pts: rrectPts(-w / 2, -40, w, 40, 4), fill: c.ink },
    { pts: rrectPts(-w / 2 + 14, -60, w - 28, 22, 3), fill: c.second },
    { pts: [[-14, -60], [-10, -130], [10, -130], [14, -60]], fill: c.ink },
    { pts: ellipsePts(0, -150, 34, 26, 24), fill: c.ink },
  ]
}
/** A rubber stamp's impression: a word in a box, inked unevenly. */
function stampMark(ctx, key, x, y, word, { rot = 0, size = 40, fill = INK, seed = 1, opacity = 1 } = {}) {
  const w = jobW(word, size, size * 0.14) + size * 0.8
  const h = size * 1.5
  const box = `M${P(-w / 2, -h / 2)}h${r(w)}v${r(h)}h${r(-w)}Z`
  const inner = `${pen(box, size * 0.12, { stroke: fill, join: 'miter', cap: 'butt' })}${job(0, size * 0.36, size, word, { anchor: 'middle', fill, weight: 700, tracking: size * 0.14 })}`
  const id = `${ctx.uid}-sm-${key}`
  ctx.defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="${r(-w)}" y="${r(-h)}" width="${r(w * 2)}" height="${r(h * 2)}"><rect x="${r(-w)}" y="${r(-h)}" width="${r(w * 2)}" height="${r(h * 2)}" fill="#fff"/>${specks(-w / 2, -h / 2, w, h, { seed, density: 36, colour: '#000', max: 4 })}</mask>`)
  return `<g transform="${tf(x, y, 1, rot)}"${op(opacity)}><g mask="url(#${id})">${inner}</g></g>`
}
/** A heap of rocks, ragged, base at y = 0 across [x0, x1]. Coals glow in their cracks. */
function rocksParts(c = DAY, { x0 = -300, x1 = 300, seed = 7, glow = 0 } = {}) {
  const parts = []
  const rand = seq(seed)
  const n = Math.round((x1 - x0) / 70)
  for (let i = 0; i < n; i++) {
    const cx = x0 + ((i + 0.5) / n) * (x1 - x0) + (rand() - 0.5) * 30
    const rw = 48 + rand() * 40
    const rh = 36 + rand() * 40
    const cy = -rh * 0.55 - (i % 2 ? 0 : 26 * rand())
    const pts = Array.from({ length: 9 }, (_, k) => {
      const a = (k / 9) * Math.PI * 2
      const q = 0.8 + 0.35 * rand()
      return [cx + Math.cos(a) * rw * q, Math.min(0, cy + Math.sin(a) * rh * q)]
    })
    parts.push({ pts, fill: c.ink })
    if (glow > 0) {
      const crack = [[cx - rw * 0.5, cy + rh * 0.1], [cx - rw * 0.1, cy - rh * 0.25], [cx + rw * 0.15, cy + rh * 0.12], [cx + rw * 0.45, cy - rh * 0.1]]
      parts.push({ pts: crack, stroke: c.second, sw: 3 + 4 * glow, open: true, opacity: Math.min(1, glow * 1.4) })
    }
  }
  return parts
}
/** A split-flap cell: `flip` 0–1 is a flap going over; the character changes halfway. */
function flapCell(x, y, w, h, ch, next, flip, c = DAY) {
  const shown = flip >= 0.5 ? next : ch
  const k = flip > 0 && flip < 1 ? Math.abs(Math.cos(flip * Math.PI)) : 1
  const cy = y + h / 2
  let out = fillD(`M${P(x, y)}h${r(w)}v${r(h)}h${r(-w)}Z`, c.ink)
  if (shown && shown !== ' ') out += `<text x="${r(x + w / 2)}" y="${r(y + h * 0.78)}" font-size="${r(h * 0.76)}" font-weight="700" text-anchor="middle" fill="${c.paper}" textLength="${r(w * 0.7)}" lengthAdjust="spacingAndGlyphs"${k < 1 ? ` transform="translate(0 ${r(cy)}) scale(1 ${r(Math.max(0.02, k), 3)}) translate(0 ${r(-cy)})"` : ''}>${esc(shown)}</text>`
  return out + `<path d="M${P(x, cy)}h${r(w)}" stroke="${c.paper}" stroke-width="1.6" opacity="0.35"/>`
}

/* ══ THE PLAN — built once per score ═══════════════════════════════════
 *
 * Every time below comes from a measured word or from the click (98.5 BPM,
 * a beat at 0.54 in the New York score). The camera is a drift plus eased
 * moves, integrated from one speed curve; every scene is placed where the
 * camera is when its word is sung, so a retimed score moves the wall with it.
 */

const PLANS = new WeakMap()
function planFor(score) {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return PLANS.get(score)
}
const DT = 1 / 120

function buildPlan(score) {
  const L = score.lines
  if (L.length < 16) throw new Error(`letterpress: expected the sixteen lines of New York, got ${L.length}`)
  const wt = (line, re, nth = 0) => {
    const found = line.words.filter((w) => re.test(w.text))
    if (!found.length) throw new Error(`letterpress: no word ${re} in "${line.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const nos = (line) => line.words.filter((w) => /^no/i.test(w.text)).map((w) => w.t)
  const BEAT = 60 / (score.bpm ?? 98.5)
  const PH = score.beatPhase ?? 0.54
  const beatAt = (t) => (t - PH) / BEAT
  const beat = (k) => PH + k * BEAT
  const nextBeat = (t) => beat(Math.ceil(beatAt(t) - 1e-6))
  const sec = (id) => score.sections.find((s) => s.id === id)
  const end = score.endCardAt ?? score.duration

  const T = {
    end,
    // Verse 1.
    l0: L[0].start, love: wt(L[0], /^love/), rocks: wt(L[0], /^rocks/), best: wt(L[0], /^best/), burning: wt(L[0], /^burning/), coals: wt(L[0], /^coals/), l0end: L[0].end,
    l1: L[1].start, easy: wt(L[1], /^easy/), dreams: wt(L[1], /^dreams/), subs: wt(L[1], /^submarines/), can: wt(L[1], /^can/), under: wt(L[1], /^undermine/), mankind: wt(L[1], /^mankind/), familiar: wt(L[1], /^familiar/), goal: wt(L[1], /^goal/),
    // Chorus 1.
    l2: L[2].start, follow1: wt(L[2], /^follow/), lights1: wt(L[2], /^lights/), see1: wt(L[2], /^see/), shore1: wt(L[2], /^shore/),
    l3: L[3].start, listen1: wt(L[3], /^listen/), anybody1: wt(L[3], /^anybody/), ever1: wt(L[3], /^ever/), anymore1: wt(L[3], /^anymore/),
    // Verse 2.
    l4: L[4].start, move: wt(L[4], /^move/), memphis: wt(L[4], /^Memphis/), nashville: wt(L[4], /^Nashville/), austin: wt(L[4], /^Austin/), la: wt(L[4], /^L\.A/), detroit: wt(L[4], /^Detroit/),
    l5: L[5].start, only: wt(L[5], /^only/), way: wt(L[5], /^way/), brk: wt(L[5], /^break/), bargain: wt(L[5], /^bargain/), bend: wt(L[5], /^bend/), abandon: wt(L[5], /^abandon/), exploit: wt(L[5], /^exploit/),
    // Chorus 2.
    l6: L[6].start, follow2: wt(L[6], /^follow/), lights2: wt(L[6], /^lights/), see2: wt(L[6], /^see/), shore2: wt(L[6], /^shore/),
    l7: L[7].start, listen2: wt(L[7], /^listen/), anybody2: wt(L[7], /^anybody/), ever2: wt(L[7], /^ever/), anymore2: wt(L[7], /^anymore/),
    // No.
    no1: nos(L[8]),
    l9: L[9].start, wont1: wt(L[9], /^won/), go1: wt(L[9], /^go/), notGoing1: wt(L[9], /^going/), new1: wt(L[9], /^New/), york1: wt(L[9], /^York/),
    // Chorus 3.
    l10: L[10].start, follow3: wt(L[10], /^follow/), lights3: wt(L[10], /^lights/), see3: wt(L[10], /^see/), out3: wt(L[10], /^out/), shore3: wt(L[10], /^shore/),
    l11: L[11].start, listen3: wt(L[11], /^listen/), anybody3: wt(L[11], /^anybody/), ever3: wt(L[11], /^ever/), anymore3: wt(L[11], /^anymore/),
    // The last Nos, and the last line.
    no2: nos(L[12]), no3: nos(L[13]), no4: nos(L[14]),
    l15: L[15].start, wont2: wt(L[15], /^won/), im2: wt(L[15], /^I'm/), new2: wt(L[15], /^New/), york2: wt(L[15], /^York/),
    brk2: sec('break-2')?.from ?? 122, brk2To: sec('break-2')?.to ?? 156,
  }

  /* ── The camera's x: a drift plus eased moves, integrated ─────────────
   * Drift keys are speeds in world units a second, eased between; a move is
   * a half-cosine of extra distance. Whips bank the camera (see roll). */
  const driftKeys = [
    [0, 8], [17.8, 8], [20.2, 60], [36.4, 60], [38.6, 110], [46, 90], [48, 70], [55, 70], [57.2, 150], [67, 150],
    [69, 45], [77, 45], [78.2, 90], [86, 90], [87.8, 55], [103, 55], [105.2, 16], [112, 16], [114, 36], [121, 36],
    [122.6, 230], [149.5, 230], [150.5, 60], [154.8, 60], [156.6, 90], [163.5, 90], [165.8, 50], [172, 50],
    [175.2, 30], [190, 30], [192, 40], [193.6, 40], [194, 12], [195.2, 12], [196.4, 30], [198, 90], [end, 90], [score.duration + 5, 90],
  ]
  const drift = (t) => {
    if (t <= driftKeys[0][0]) return driftKeys[0][1]
    for (let i = 0; i < driftKeys.length - 1; i++) {
      const [a, va] = driftKeys[i]
      const [b, vb] = driftKeys[i + 1]
      if (t <= b) return lerp(va, vb, smooth(ramp(t, a, b)))
    }
    return driftKeys[driftKeys.length - 1][1]
  }
  const moves = [
    { a: 18.2, b: 20.0, D: 2300 },
    { a: T.goal + 1.3, b: T.goal + 3.2, D: 2500 },
    { a: T.shore1 + 0.8, b: T.shore1 + 2.6, D: 2000 },
    { a: T.anymore1 + 1.3, b: T.anymore1 + 3.1, D: 2100 },
    { a: T.l4 - 1.9, b: T.l4 - 0.2, D: 1900 },
    { a: T.detroit + 2.8, b: T.detroit + 4.4, D: 2000 },
    { a: T.exploit + 2.1, b: T.exploit + 3.9, D: 2000 },
    { a: T.anymore2 + 0.7, b: T.anymore2 + 2.5, D: 2300 },
    { a: T.no1[3] + 1.3, b: T.no1[3] + 3.1, D: 2100 },
    { a: T.brk2To - 1.7, b: T.brk2To + 0.2, D: 2200 },
    { a: T.shore3 + 1.6, b: T.shore3 + 3.6, D: 2100 },
    { a: T.anymore3 + 2.3, b: T.anymore3 + 4.2, D: 2200 },
    { a: T.no4[3] + 1.2, b: T.l15 - 0.4, D: 2100 },
  ]
  const N = Math.ceil((score.duration + 6) / DT)
  const xs = new Float64Array(N + 1)
  const vs = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) {
    const t = (i - 0.5) * DT
    let v = drift(t)
    for (const m of moves) if (t > m.a && t < m.b) v += m.D * (Math.PI / 2 / (m.b - m.a)) * Math.sin(Math.PI * (t - m.a) / (m.b - m.a))
    vs[i] = v
    xs[i] = xs[i - 1] + v * DT
  }
  const table = (arr) => (t) => {
    const q = clamp01(t / (N * DT)) * N
    const i = Math.min(N - 1, Math.floor(q))
    return lerp(arr[i], arr[i + 1], q - i)
  }
  const camX = table(xs)
  const camV = table(vs)
  const X = camX

  /* ── Hits: every one of them shakes the sheet ─────────────────────── */
  const hits = []
  const allNos = [...T.no1, ...T.no2, ...T.no3, ...T.no4]
  allNos.forEach((t, i) => hits.push([t, 13 + (i % 4 === 3 ? 8 : 0) + Math.floor(i / 4) * 2]))

  /* ── The red rule: where its head is ──────────────────────────────── */
  const REST = 628
  const LEAD = 430
  const runs = []
  const run = (keys, lead = 0.22, out = 0.22) => runs.push({ keys, lead, out })
  const headFree = (t) => {
    const enter = smooth(ramp(t, 3.4, 9.5))
    return [camX(t) + lerp(-1100, LEAD, enter), REST]
  }

  const plan = { T, BEAT, PH, beatAt, beat, nextBeat, camX, camV, X, hits, runs, run, headFree, REST, LEAD, allNos, score, extras: {} }
  plan.scenes = SCENES.map((s, i) => ({ id: s.id, z: s.z ?? i, ...s.setup(plan) })).sort((a, b) => a.z - b.z)
  plan.worldEnd = camX(score.duration) + 3000

  /* The rule's head: free along its rail, or on a run of keyed points. */
  runs.sort((a, b) => a.keys[0].t - b.keys[0].t)
  plan.head = (t) => {
    for (const rn of runs) {
      const k = rn.keys
      const first = k[0]
      const last = k[k.length - 1]
      if (t < first.t - rn.lead || t > last.t + rn.out) continue
      // A rule is set square: in along the rail, then straight up to the
      // strike; after it, straight down, then along the rail again.
      if (t < first.t) {
        const a = first.t - rn.lead
        const mid = a + rn.lead * 0.55
        if (t < mid) {
          const f = headFree(t)
          return [lerp(f[0], first.x, smooth(ramp(t, a, mid))), REST]
        }
        return [first.x, lerp(REST, first.y, ramp(t, mid, first.t))]
      }
      if (t > last.t) {
        if (rn.out === Infinity) return [last.x + (t - last.t) * (last.vx ?? 0), last.y + (t - last.t) * (last.vy ?? 0)]
        const b = last.t + rn.out
        const mid = last.t + rn.out * 0.4
        if (t < mid) return [last.x, lerp(last.y, REST, ramp(t, last.t, mid))]
        const f = headFree(t)
        return [lerp(last.x, f[0], smooth(ramp(t, mid, b))), REST]
      }
      for (let i = 0; i < k.length - 1; i++) {
        if (t <= k[i + 1].t) {
          const u = ramp(t, k[i].t, k[i + 1].t)
          return [lerp(k[i].x, k[i + 1].x, u), lerp(k[i].y, k[i + 1].y, u)]
        }
      }
    }
    return headFree(t)
  }
  // The trail: the head sampled, then thinned where it runs straight.
  const tt = []
  const tx = []
  const ty = []
  for (let t = 0; t <= end + 0.001; t += 1 / 60) {
    const [x, y] = plan.head(t)
    const n = tt.length
    if (n >= 2) {
      const ax = tx[n - 2]
      const ay = ty[n - 2]
      const bx = tx[n - 1]
      const by = ty[n - 1]
      const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
      const len = Math.hypot(x - ax, y - ay) || 1
      if (Math.abs(cross) / len < 0.25 && (bx - ax) * (x - bx) + (by - ay) * (y - by) >= 0) { tt[n - 1] = t; tx[n - 1] = x; ty[n - 1] = y; continue }
    }
    tt.push(t)
    tx.push(x)
    ty.push(y)
  }
  plan.trail = { tt, tx, ty }
  return plan
}

/* ══ HELPERS FOR SCENES ════════════════════════════════════════════════ */

const pulled = (now, t, span = 0.14) => easeOut(ramp(now, t, t + span))
/** Ink going down: fades up and settles from a hair too large. */
function printed(svg, k, cx = 0, cy = 0) {
  if (k <= 0 || !svg) return ''
  if (k >= 1) return svg
  const s = 1 + 0.05 * (1 - k)
  return `<g opacity="${r(k, 3)}" transform="translate(${r(cx)} ${r(cy)}) scale(${r(s, 4)}) translate(${r(-cx)} ${r(-cy)})">${svg}</g>`
}
const placed = (svg, x, y, s = 1, rot = 0) => (svg ? `<g transform="${tf(x, y, s, rot)}">${svg}</g>` : '')
/** A slam from above that lands exactly on `t`: accelerating, so it hits. */
const dropY = (now, t, h = 620, span = 0.12) => (now >= t ? 0 : -h * (1 - ramp(now, t - span, t)) ** 2)
/** A little squash on landing. */
const landSquash = (now, t) => {
  const a = now - t
  if (a < 0 || a > 0.3) return 1
  return 1 - 0.14 * Math.exp(-a / 0.05) * Math.cos(a * 40)
}
/** A poster: a sheet pasted on the wall, its edges a little torn. */
function posterD(x0, y0, x1, y1, seed = 1, rag = 6) {
  const pts = []
  const edge = (ax, ay, bx, by, k) => {
    const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 40))
    for (let i = 0; i < n; i++) {
      const u = i / n
      const j = (hash(i, k, seed) - 0.5) * rag
      pts.push([lerp(ax, bx, u) + (ay === by ? 0 : j), lerp(ay, by, u) + (ay === by ? j : 0)])
    }
  }
  edge(x0, y0, x1, y0, 1)
  edge(x1, y0, x1, y1, 2)
  edge(x1, y1, x0, y1, 3)
  edge(x0, y1, x0, y0, 4)
  return polyD(pts)
}
const inViewX = (x0, x1, view) => x1 >= view.x0 && x0 <= view.x1

/* ══ THE WALL — everything is pasted on it ═════════════════════════════
 *
 * Old posters, pasted over and pasted over until they are nearly paper, and
 * every one of them is advice. Baked in pieces along x; only the pieces in
 * view are written into a frame.
 */
const ADVICE = ['Hustle', 'Go viral', 'Success', 'Play it safe', 'Get a real job', 'Sign here', 'The formula', 'Trust the process', 'Grind', 'Network', 'Build your brand', 'Move to L.A.', 'Stay in your lane', 'Follow the rules', 'Smile', 'Work harder', 'Know your place', 'Content', '10 steps', 'Rise & grind', 'Fit in', 'Stand out', 'Be realistic', 'Dream big', 'Sell out', 'Be like them', 'Do as you\'re told', 'Stay tuned']
const PIECE = 480
function wallPiece(i) {
  return memo(`wall:${i}`, () => {
    const x0 = i * PIECE
    let out = ''
    for (let k = 0; k < 4; k++) {
      const w = 170 + 230 * hash(i, k, 21)
      const h = 150 + 260 * hash(i, k, 22)
      const x = x0 + hash(i, k, 23) * PIECE - w / 2
      const y = -120 + hash(i, k, 24) * 820
      const tone = hash(i, k, 25) < 0.18 ? YELLOW : GHOST
      out += `<path d="${posterD(x, y, x + w, y + h, i * 7 + k, 7)}" fill="${tone}"${tone === YELLOW ? ' opacity="0.22"' : ''}/>`
      const word = ADVICE[Math.floor(hash(i, k, 26) * ADVICE.length)]
      const size = Math.min(w / Math.max(1, advance(word, 1) * 0.8), h * 0.42)
      out += `<text x="${r(x + w / 2)}" y="${r(y + h * 0.5 + size * 0.34)}" font-size="${r(size)}" font-weight="700" text-anchor="middle" fill="${GHOST_INK}" opacity="0.55" textLength="${r(Math.min(w - 16, advance(word, size) * 0.8))}" lengthAdjust="spacingAndGlyphs">${esc(word.toUpperCase())}</text>`
      if (hash(i, k, 27) < 0.5) out += `<path d="M${P(x + 14, y + h - 22)}H${r(x + w - 14)}" stroke="${GHOST_INK}" stroke-width="3" opacity="0.5"/>`
    }
    return out
  })
}
function wallSvg(view) {
  let out = ''
  const a = Math.floor((view.x0 - 300) / PIECE)
  const b = Math.floor((view.x1 + 300) / PIECE)
  for (let i = a; i <= b; i++) out += wallPiece(i)
  return out
}

/* ══ THE SCENES ════════════════════════════════════════════════════════
 *
 * Each scene is set up once against the plan — where it is, when it is, what
 * the red rule does in it — and returns draw(ctx, now, view), which returns
 * { back, mid, front } in world coordinates.
 */
const SCENES = []


/* ── The tour poster: the formula, printed ──────────────────────────── */

const DEPARTURES = [
  ['Memphis', 'Bargain'], ['Nashville', 'Bend'], ['Austin', 'Abandon'],
  ['L.A.', 'Exploit'], ['Detroit', 'Burn out'], ['New York', 'The big one'],
]
/** The departure row's geometry, so the rule can find New York. */
function departureRow(X, i) {
  const L = X - 640
  const R = X + 640
  const colW = (R - L - 80) / 2
  return { x0: i < 3 ? L : L + colW + 80, x1: i < 3 ? L + colW : R, y: 492 + (i % 3) * 58 }
}
function departureSvg(ctx, key, X, i, { fill = INK } = {}) {
  const [city, verb] = DEPARTURES[i]
  const { x0, x1, y } = departureRow(X, i)
  const size = 44
  const cityW = Math.min(advance(city, size) * 0.82, (x1 - x0) * 0.55)
  const verbW = jobW(verb, 24, 3)
  return `${woodType(ctx, `${key}c`, { x: x0, y, size, text: city, width: cityW, fill, impression: 0.55, seed: 70 + i })}
    <line x1="${r(x0 + cityW + 18)}" y1="${y - 4}" x2="${r(x1 - verbW - 18)}" y2="${y - 4}" stroke="${fill}" stroke-width="3" stroke-dasharray="0.1 11" stroke-linecap="round"/>
    ${job(x1, y - 2, 24, verb, { anchor: 'end', fill, tracking: 3 })}`
}
/** The lights on the shore, the poster's footer: the advice, before it has a name. */
function shoreLightsSvg(x0, x1, y, seed = 6, now = 0) {
  const rand = seq(seed)
  let land = `M${P(x0, y + 40)}L${P(x0, y + 14)}`
  for (let x = x0; x <= x1; x += 40) land += `L${P(x, y + 12 - rand() * 10)}`
  land += `L${P(x1, y + 40)}Z`
  let lights = ''
  for (let i = 0; i < 11; i++) {
    const cx = x0 + 40 + i * ((x1 - x0 - 80) / 10) + (rand() - 0.5) * 20
    const cy = y + 2 - rand() * 8
    const rays = Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * Math.PI * 2 + 0.3 + now * 0.8
      return `M${P(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9)}L${P(cx + Math.cos(a) * 17, cy + Math.sin(a) * 17)}`
    }).join('')
    lights += `<circle cx="${r(cx)}" cy="${r(cy)}" r="5" fill="${YELLOW}"/><path d="${rays}" stroke="${YELLOW}" stroke-width="2.4" stroke-linecap="round"/>`
  }
  return `<path d="${land}" fill="${INK}"/>${lights}`
}
/** The whole broadside at X. `at(i)` is when block i is pulled (−Infinity: already printed). */
function tourPosterSvg(ctx, key, now, X, at = () => -Infinity) {
  const L = X - 640
  const R = X + 640
  const k = (i) => pulled(now, at(i), 0.14)
  const blocks = [
    () => brassRule(L, R, 104),
    () => job(X, 152, 24, 'The one sure way to make it', { anchor: 'middle', tracking: 7 }),
    () => `<rect x="${r(L + 9)}" y="180" width="${R - L - 4}" height="162" fill="${YELLOW}"/>`,
    () => woodType(ctx, `${key}h`, { x: X, y: 326, size: 190, text: 'The Formula', width: 1150, anchor: 'middle', impression: 0.45, seed: 31 }),
    () => ornamentRule(L, R, 376, 11),
    () => `${job(L, 424, 20, 'They said move to', { tracking: 8 })}${job(R, 424, 20, 'Departures', { anchor: 'end', tracking: 8 })}<path d="M${P(L, 440)}H${r(R)}" stroke="${INK}" stroke-width="1.2"/>`,
    ...DEPARTURES.map((_, i) => () => departureSvg(ctx, `${key}d${i}`, X, i)),
    () => `<path d="M${P(X, 456)}V${r(620)}" stroke="${INK}" stroke-width="1.2"/>`,
  ]
  const sheet = `<path d="${posterD(X - 720, 62, X + 720, 676, 5, 5)}" fill="${FIBRE}"/><path d="${posterD(X - 720, 62, X + 720, 676, 5, 5)}" fill="none" stroke="${PAPER_SHADE}" stroke-width="2"/>`
  let out = sheet
  blocks.forEach((b, i) => { const kk = k(i); if (kk > 0) out += printed(b(), kk, X, 380) })
  const kf = k(blocks.length)
  if (kf > 0) out += printed(`<g clip-path="url(#${ctx.uid}-${key}-foot)">${shoreLightsSvg(X - 720, X + 720, 636, 6, now)}</g>`, kf, X, 650)
  ctx.defs.push(`<clipPath id="${ctx.uid}-${key}-foot"><path d="${posterD(X - 720, 62, X + 720, 676, 5, 5)}"/></clipPath>`)
  return out
}

SCENES.push({
  id: 'tour',
  setup(plan) {
    const { beat, beatAt, run, REST } = plan
    const X = plan.camX(10)
    // A block pulled every two beats from the second, the footer last.
    const at = (i) => beat(2 + i * 2)
    // The rule comes in along the foot of the poster and underlines the formula.
    run([{ t: beat(30), x: X - 640, y: 358 }, { t: beat(31.5), x: X + 640, y: 358 }], 0.5, 0.6)
    plan.extras.tourX = X
    return {
      t0: -1, t1: 21.5, x0: X - 800, x1: X + 800,
      draw(ctx, now) { return { back: tourPosterSvg(ctx, 'tp', now, X, at) } },
    }
  },
})

/* ── Verse 1: love, burnt out on the rocks ──────────────────────────── */

SCENES.push({
  id: 'love',
  z: 20,
  setup(plan) {
    const { T, camX } = plan
    const X = camX(T.l0 + 1.4)
    const burnAt = [X + 250, 640]
    plan.extras.loveX = X
    plan.hits.push([T.burning, 8])
    return {
      t0: 17, t1: 40, x0: X - 1100, x1: X + 2000,
      draw(ctx, now) {
        const sheetD = posterD(X - 1050, 44, X + 1950, 700, 11, 8)
        let sheet = `<path d="${sheetD}" fill="${FIBRE}"/>`
        // LOVE in wood type, the size of the song's promise.
        const kl = pulled(now, T.love, 0.16)
        if (kl > 0) {
          sheet += printed(`<rect x="${r(X - 640)}" y="150" width="700" height="330" fill="${YELLOW}"/>`, kl, X - 290, 320)
          sheet += printed(woodType(ctx, 'lv', { x: X - 290, y: 460, size: 380, text: 'Love', width: 640, anchor: 'middle', impression: 0.4, seed: 12 }), kl, X - 290, 320)
        }
        const ks = pulled(now, T.l0 - 0.2, 0.18)
        if (ks > 0) sheet += printed(placed(renderParts(sheetMusicParts(DAY, { title: 'A love song' })), X + 400, 300, 0.92, -5), ks, X + 400, 300)
        sheet += job(X - 290, 536, 24, 'Best left burning', { anchor: 'middle', tracking: 10, opacity: pulled(now, T.best, 0.14) })
        const tau = now - T.burning
        const burnt = tau > 0 ? burn(ctx, 'lv', sheet, { box: [X - 1060, 30, X + 1960, 710], at: burnAt, tau, speed: 190, seed: 4, now, shape: sheetD }) : sheet
        // The rocks fall in on "rocks" and glow on "coals"; they do not burn.
        const glow = clamp01((now - T.coals) / 0.4) * (0.8 + 0.2 * Math.sin(now * 11))
        let rocks = ''
        const parts = rocksParts(DAY, { x0: X - 380, x1: X + 700, seed: 7, glow })
        parts.forEach((p, i) => {
          const land = T.rocks + (i % 8) * 0.035
          const dy = dropY(now, land, 520, 0.2)
          if (now < land - 0.2) return
          const gone = Math.max(0, now - (T.l1 - 0.9) - (i % 5) * 0.06)
          if (gone > 1.2) return
          rocks += placed(renderParts([p]), 0, dy + 0.5 * GRAV * gone * gone)
        })
        return { back: burnt, mid: placed(rocks, 0, 700) }
      },
    }
  },
})

/* ── Verse 1: easy dreams, undermining the goal ─────────────────────── */

SCENES.push({
  id: 'sea',
  z: 10,
  setup(plan) {
    const { T, camX } = plan
    const X = plan.extras.loveX ?? camX(21.4)
    const subX = camX(T.subs) - 330
    const podX = camX(T.goal) + 300
    const HORIZON = 470
    plan.hits.push([T.mankind, 15], [T.goal, 18])
    return {
      t0: 23, t1: 40.5, x0: X - 1100, x1: podX + 900,
      draw(ctx, now) {
        const x0 = X - 1100
        const x1 = podX + 900
        let back = `<rect x="${r(x0)}" y="20" width="${r(x1 - x0)}" height="700" fill="${PAPER}"/>`
        back += `<circle cx="${r(podX - 620)}" cy="220" r="90" fill="${YELLOW}"/>`
        back += `<rect x="${r(x0)}" y="${HORIZON}" width="${r(x1 - x0)}" height="260" fill="${YELLOW}"/>`
        const waves = (y0, rows, amp, speed, w = 3) => {
          let d = ''
          for (let k = 0; k < rows; k++) {
            const y = y0 + k * 34
            d += `M${P(x0, y)}`
            for (let x = x0; x <= x1; x += 40) d += `L${P(x, y + Math.sin(x / 70 + now * speed + k) * amp)}`
          }
          return pen(d, w, { stroke: INK })
        }
        back += waves(HORIZON + 22, 2, 3, 1.5, 2)
        // The goal: a trophy on a plinth out in the sea, its plaque the thing everyone aims for.
        const tilt = 8 * easeOut(ramp(now, T.mankind, T.goal)) + 1.2 * Math.sin((now - T.mankind) * 30) * Math.exp(-(now - T.mankind) / 0.3) * (now > T.mankind ? 1 : 0)
        let pod = `<rect x="${r(podX - 95)}" y="380" width="190" height="340" fill="${INK}"/>`
        for (let k = 0; k < 7; k++) pod += `<path d="M${P(podX - 95, 410 + k * 44)}h190" stroke="${PAPER}" stroke-width="2" opacity="0.5"/>`
        pod += `<rect x="${r(podX - 72)}" y="420" width="144" height="46" fill="${PAPER}"/>${job(podX, 452, 22, 'The goal', { anchor: 'middle', tracking: 4 })}`
        pod += placed(renderParts(trophyParts(DAY, { label: 'No. 1' })), podX, 380, 0.62)
        const podium = `<g transform="rotate(${r(tilt, 2)} ${r(podX + 95)} 720)">${pod}</g>`
        const mid = shatter(ctx, 'pod', podium, { box: [podX - 170, 140, podX + 190, 720], at: [podX - 80, 650], tau: now - T.goal, n: 9, seed: 5, power: 1.2 })
        // The submarine surfaces on "submarines" and fires on "undermine".
        const rise = easeOut(ramp(now, T.subs - 0.25, T.subs + 0.5))
        const subY = lerp(760, 548, rise) + Math.sin(now * 2.2) * 5
        let sub = ''
        if (now > T.subs - 0.3) sub = placed(renderParts(submarineParts(DAY, { periscope: easeOut(ramp(now, T.can, T.can + 0.25)) })), subX, subY, 0.9)
        let torpedo = ''
        const tu = ramp(now, T.under, T.mankind)
        if (now > T.under && now < T.mankind) {
          const ax = subX + 250
          const bx = podX - 100
          const tx = lerp(ax, bx, tu * tu * (3 - 2 * tu) * 0.3 + tu * 0.7)
          const ty = lerp(590, 612, tu)
          torpedo = `<path d="M${P(ax, 590)}L${P(tx - 30, ty)}" stroke="${PAPER}" stroke-width="5" stroke-dasharray="14 10"/>` + fillD(polyD(rrectPts(tx - 50, ty - 11, 90, 22, 11)), INK)
        }
        let boom = ''
        const ba = now - T.mankind
        if (ba > 0 && ba < 0.9) {
          const R = 40 + 260 * easeOut(clamp01(ba / 0.35))
          const star = Array.from({ length: 22 }, (_, k) => {
            const a = (k / 22) * Math.PI * 2
            const rr = R * (k % 2 ? 0.45 : 1) * (0.85 + 0.3 * hash(k, 1, 3))
            return [podX - 100 + Math.cos(a) * rr, 610 + Math.sin(a) * rr * 0.8]
          })
          boom = fillD(polyD(star), YELLOW, { opacity: 1 - ramp(ba, 0.4, 0.9) }) + fillD(polyD(scalePts(star, 0.5, 0.5, podX - 100, 610)), INK, { opacity: 1 - ramp(ba, 0.3, 0.7) })
        }
        const front = waves(HORIZON + 100, 6, 6, 2.2, 3.4)
        return { back: back + sub, mid: mid + `<rect x="${r(x0)}" y="${HORIZON + 92}" width="${r(x1 - x0)}" height="170" fill="${YELLOW}"/>` + front + torpedo + boom }
      },
    }
  },
})

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

/** The camera at `now`: x, y, zoom, roll (degrees), and the shake. */
function cameraAt(plan, now) {
  const x = plan.camX(now)
  const v = plan.camV(now)
  const ex = plan.extras
  let y = CY + (ex.camY ? ex.camY(now) : 0)
  let z = ex.zoom ? ex.zoom(now) : 1
  // The sheet jumps a little with the kick: a punch of zoom on every beat,
  // stronger on the one, left out of the title card's first bars and the hush.
  const b = plan.beatAt(now)
  const since = (b - Math.floor(b)) * plan.BEAT
  const one = Math.floor(b) % 4 === 0 ? 1.6 : 1
  z *= 1 + (ex.punch ? ex.punch(now) : 0.011) * one * Math.exp(-since / 0.07)
  // The camera banks into a whip: faster reads as more tilt, and it rights itself as it slows.
  let roll = -clamp01((v - 200) / 1600) * 2.6 + (ex.roll ? ex.roll(now) : 0) + 0.5 * Math.sin(now * 1.3) * Math.sin(now * 0.47 + 1)
  const [sx, sy, sr] = shakeAt(now, plan.hits)
  roll += sr
  return { x, y, z, roll, sx, sy, v }
}

export function letterpressFrame({ time, score, lockup = '', uid = 'ny' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })
  const plan = planFor(score)
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const cam = cameraAt(plan, now)
  const halfW = 800 / cam.z + 120
  const halfH = 360 / cam.z + 120
  const view = { x0: cam.x - halfW, x1: cam.x + halfW, y0: cam.y - halfH, y1: cam.y + halfH, cam }
  const ctx = { uid, defs: [], now }

  const back = []
  const mid = []
  const front = []
  for (const sc of plan.scenes) {
    if (now < sc.t0 || now > sc.t1) continue
    if (!inViewX(sc.x0, sc.x1, view)) continue
    const out = sc.draw(ctx, now, view, plan) ?? {}
    if (out.back) back.push(out.back)
    if (out.mid) mid.push(out.mid)
    if (out.front) front.push(out.front)
  }

  const wall = plan.extras.wall ? plan.extras.wall(ctx, now, view, wallSvg(view)) : wallSvg(view)
  const rule = ruleSvg(plan, now, view)

  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 6, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  const clip = plateClip(uid)
  const transform = `translate(${r(CX + cam.sx, 2)} ${r(CY + cam.sy, 2)}) rotate(${r(cam.roll, 3)}) scale(${r(cam.z, 4)}) translate(${r(-cam.x, 2)} ${r(-cam.y, 2)})`
  return {
    svg: [
      paper(),
      `<defs>${clip.def}${ctx.defs.join('')}</defs>`,
      `<g clip-path="${clip.url}">`,
      `<rect x="${PL.x}" y="${PL.y}" width="${PL.w}" height="${PL.h}" fill="${PAPER}"/>`,
      `<g transform="${transform}">`,
      `<rect x="${r(view.x0 - 400)}" y="-400" width="${r(view.x1 - view.x0 + 800)}" height="1600" fill="${PAPER}"/>`,
      wall, back.join(''), mid.join(''), rule, front.join(''),
      '</g>',
      '</g>',
      margin,
    ].join('\n'),
    label: active && now >= active.start - 0.3 && section.id === active.section ? active.text : section.label,
  }
}

/** The red rule: the trail it has laid, and its head now. */
function ruleSvg(plan, now, view) {
  const { tt, tx, ty } = plan.trail
  // Binary search for the last sample at or before now.
  let lo = 0
  let hi = tt.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (tt[mid] <= now) lo = mid
    else hi = mid - 1
  }
  const pts = []
  for (let i = 0; i <= lo; i++) {
    if (tt[i] < now - 40) continue
    pts.push([tx[i], ty[i]])
  }
  pts.push(plan.head(now))
  // Keep only the stretches near the view.
  const near = ([x, y]) => x > view.x0 - 600 && x < view.x1 + 600
  let d = ''
  let open = false
  for (let i = 0; i < pts.length; i++) {
    const keep = near(pts[i]) || (i > 0 && near(pts[i - 1])) || (i < pts.length - 1 && near(pts[i + 1]))
    if (!keep) { open = false; continue }
    d += `${open ? 'L' : 'M'}${P(pts[i][0], pts[i][1])}`
    open = true
  }
  if (!d) return ''
  const w = plan.extras.ruleWidth ? plan.extras.ruleWidth(now) : 9
  return `<path d="${d}" fill="none" stroke="${RED}" stroke-width="${r(w, 2)}" stroke-linejoin="miter" stroke-linecap="square"/>`
}

export const letterpressPlan = (score) => planFor(score)

/* ── The lights on the shore ────────────────────────────────────────── */

/*
 * Five lighthouses, each built out of a piece of the system that tells you
 * where to go — a plain one, a microphone stand, a stack of amps, a
 * metronome, a trophy — every lamp at the same height, so the red rule can
 * strike the row of them out like a line of type.
 */
const LAMP_Y = -330
function lightTower(kind, c) {
  const parts = []
  if (kind === 'classic') return lighthouseParts(c, { H: 370, W: 118 })
  if (kind === 'mic') {
    parts.push({ pts: [[-4, -24], [-4, LAMP_Y + 40], [4, LAMP_Y + 40], [4, -24]], fill: c.ink })
    for (const a of [-1, 0.2, 1]) parts.push({ pts: [[0, -24], [a * 70, 0]], stroke: c.ink, sw: 8, open: true })
    parts.push({ pts: rrectPts(-10, LAMP_Y + 30, 20, 40, 5), fill: c.ink })
    parts.push({ pts: ellipsePts(0, LAMP_Y, 30, 38, 28), fill: c.second })
    parts.push({ pts: ellipsePts(0, LAMP_Y, 30, 38, 28), stroke: c.ink, sw: 5 })
    for (let k = -2; k <= 2; k++) parts.push({ pts: [[-26, LAMP_Y + k * 12], [26, LAMP_Y + k * 12]], stroke: c.ink, sw: 1.5, open: true, opacity: 0.6 })
    return { parts, lamp: [0, LAMP_Y] }
  }
  if (kind === 'amps') {
    const sizes = [[200, 110], [170, 96], [140, 84]]
    let y = 0
    sizes.forEach(([w, h]) => {
      parts.push({ pts: rrectPts(-w / 2, y - h, w, h, 8), fill: c.ink })
      parts.push({ pts: rrectPts(-w / 2 + 14, y - h + 26, w - 28, h - 38, 4), fill: c.second, opacity: 0.9 })
      y -= h + 2
    })
    parts.push({ pts: rrectPts(-34, LAMP_Y - 22, 68, 44, 5), fill: c.second }, { pts: rrectPts(-34, LAMP_Y - 22, 68, 44, 5), stroke: c.ink, sw: 4 })
    parts.push({ pts: [[-40, LAMP_Y - 22], [0, LAMP_Y - 54], [40, LAMP_Y - 22]], fill: c.ink })
    parts.push({ pts: [[-4, y], [-4, LAMP_Y + 22], [4, LAMP_Y + 22], [4, y]], fill: c.ink })
    return { parts, lamp: [0, LAMP_Y] }
  }
  if (kind === 'metronome') {
    const H = -LAMP_Y - 30
    parts.push(...metronomeParts(c, { H, swing: 0 }))
    parts.push({ pts: rrectPts(-28, LAMP_Y - 20, 56, 40, 5), fill: c.second }, { pts: rrectPts(-28, LAMP_Y - 20, 56, 40, 5), stroke: c.ink, sw: 4 })
    parts.push({ pts: [[-34, LAMP_Y - 20], [0, LAMP_Y - 50], [34, LAMP_Y - 20]], fill: c.ink })
    return { parts, lamp: [0, LAMP_Y] }
  }
  // A trophy on a column, its cup the lamp.
  parts.push({ pts: [[-44, 0], [-30, LAMP_Y + 70], [30, LAMP_Y + 70], [44, 0]], fill: c.ink })
  for (let k = 1; k < 5; k++) parts.push({ pts: [[-40, -k * 56], [40, -k * 56]], stroke: c.paper, sw: 3, open: true, opacity: 0.6 })
  parts.push(...trophyParts(c, { H: 150, label: 'No. 1' }).map((p) => (p.pts ? { ...p, pts: Array.isArray(p.pts[0][0]) ? p.pts.map((q) => movePts(scalePts(q, 0.9), 0, LAMP_Y + 110)) : movePts(scalePts(p.pts, 0.9), 0, LAMP_Y + 110) } : { ...p, svg: placed(p.svg, 0, LAMP_Y + 110, 0.9), at: [0, LAMP_Y + 110] })))
  return { parts, lamp: [0, LAMP_Y + 20] }
}
const TOWERS = ['classic', 'mic', 'amps', 'metronome', 'trophy']
const BEAM_WORDS = ['Go viral', 'Sign the deal', 'Move to Nashville', 'Play it safe', 'Be like them']
const SHORE_Y = 540

function stars(seed, x0, x1) {
  return memo(`stars:${seed}:${r(x0)}`, () => {
    const rand = seq(seed)
    let d = ''
    for (let i = 0; i < 90; i++) {
      const x = x0 + rand() * (x1 - x0)
      const y = 50 + rand() * 330
      const s = 1.2 + rand() * 2.4
      d += `M${P(x - s, y)}L${P(x, y - s)}L${P(x + s, y)}L${P(x, y + s)}Z`
    }
    return fillD(d, PAPER, { opacity: 0.8 })
  })
}

/**
 * The shore at X. `lit(i, now)` is 0–1 for lamp i; `fall(i)` is when tower i
 * topples (reprise). `lock` is when every beam turns to point the same way.
 */
function shoreSvg(ctx, key, now, X, { lit = () => 1, fall = null, lock = Infinity, unlock = Infinity, seed = 3 } = {}) {
  const x0 = X - 1150
  const x1 = X + 1550
  let back = `<path d="${posterD(x0, 16, x1, 724, seed, 26)}" fill="${INK}"/>`
  back += stars(seed, x0 + 40, x1 - 40)
  back += `<circle cx="${r(X + 900)}" cy="120" r="46" fill="${PAPER}" opacity="0.9"/>`
  // The sea, and a low shore of rocks the lights stand on.
  let sea = ''
  for (let k = 0; k < 7; k++) {
    const y = SHORE_Y + 30 + k * 26
    let d = ''
    for (let x = x0 + 20 + ((k * 37) % 60); x < x1 - 40; x += 70 + (k % 3) * 14) {
      const off = Math.sin(now * 1.4 + x / 90 + k) * 8
      d += `M${P(x + off, y)}h${r(24 + (k % 2) * 16)}`
    }
    sea += pen(d, 2.4, { stroke: PAPER, opacity: 0.45 + k * 0.05, cap: 'round' })
  }
  let shore = `M${P(x0, SHORE_Y + 20)}`
  for (let x = x0; x <= x1; x += 50) shore += `L${P(x, SHORE_Y + 6 - 10 * hash(Math.round(x), 1, seed))}`
  back += sea + pen(shore, 3, { stroke: PAPER, opacity: 0.7 })
  const positions = [-640, -290, 60, 410, 760]
  let mid = ''
  let beams = ''
  positions.forEach((dx, i) => {
    const tx = X + dx
    const tower = lightTower(TOWERS[i], NIGHT)
    let l = lit(i, now)
    let rot = 0
    let sink = 0
    let fade = 1
    if (fall) {
      const tf = fall(i)
      const u = ramp(now, tf, tf + 0.75)
      rot = 96 * u * u
      l *= 1 - ramp(now, tf, tf + 0.12)
      sink = 90 * ramp(now, tf + 0.7, tf + 2.2)
      fade = 1 - ramp(now, tf + 0.9, tf + 2.2)
    }
    const [lx, ly] = tower.lamp
    if (l > 0.01) {
      // The beam sweeps round; after `lock`, every beam turns to point on down the shore.
      const free = now * 0.34 + i * 0.21
      const locked = 0.0
      const kk = smooth(ramp(now, lock, lock + 0.5)) * (1 - smooth(ramp(now, unlock, unlock + 0.5)))
      const phase = lerp(free, Math.round(free) + locked, kk)
      // Locked, a beam reaches only as far as the next light, so five pieces of advice read as a row.
      const bm = beamPts([lx, ly], phase, { L: lerp(780, 330, kk) })
      beams += fillD(polyD(movePts(bm.pts, tx, SHORE_Y)), YELLOW, { opacity: 0.8 * l })
      if (Math.abs(bm.reach) > 250) {
        const word = BEAM_WORDS[i]
        const at = lerp(0.58, 0.54, kk)
        const mx = lx + bm.reach * at
        const my = ly + bm.reach * at * bm.tilt
        const half = Math.abs(bm.reach * at) * Math.tan(0.09) + 14
        const room = Math.abs(bm.reach) * 0.82
        const size = Math.min(half * 1.25, room / Math.max(1, advance(word, 1) * 0.8))
        beams += `<g opacity="${r(l * smooth(ramp(Math.abs(bm.reach), 250, 320)), 3)}" transform="translate(${r(tx + mx)} ${r(SHORE_Y + my + size * 0.34)}) rotate(${r(Math.atan(bm.tilt) * 57.3, 2)})"><text font-size="${r(size)}" font-weight="700" text-anchor="middle" fill="${INK}" textLength="${r(advance(word, size) * 0.8)}" lengthAdjust="spacingAndGlyphs">${esc(word.toUpperCase())}</text></g>`
      }
      beams += `<circle cx="${r(tx + lx)}" cy="${r(SHORE_Y + ly)}" r="26" fill="${YELLOW}" opacity="${r(0.9 * l, 3)}"/>`
    }
    const towerSvg = renderParts(tower.parts)
    const lampOff = l < 0.5 ? `<circle cx="${r(lx)}" cy="${r(ly)}" r="22" fill="${INK}" opacity="${r(0.85 * (1 - l * 2), 3)}"/>` : ''
    const inner = `<g transform="translate(${r(tx)} ${r(SHORE_Y + sink)})${rot ? ` rotate(${r(rot, 2)} 40 0)` : ''}">${towerSvg}${lampOff}</g>`
    mid += fade < 1 ? `<g opacity="${r(fade, 3)}">${inner}</g>` : inner
  })
  return { back: back + beams, mid }
}
SCENES.push({
  id: 'shore',
  setup(plan) {
    const { T, camX, run } = plan
    const X = camX(T.lights1 - 0.4)
    const Y = SHORE_Y + LAMP_Y
    const xa = camX(T.lights1) - 620
    const xb = X + 1100
    run([{ t: T.lights1, x: xa, y: Y }, { t: T.shore1 + 0.25, x: xb, y: Y }], 0.4, 0.5)
    const positions = [-640, -290, 60, 410, 760]
    const outAt = positions.map((dx) => lerp(T.lights1, T.shore1 + 0.25, (X + dx - xa) / (xb - xa)))
    return {
      t0: T.l2 - 4, t1: T.shore1 + 5, x0: X - 1200, x1: X + 1600,
      draw(ctx, now) {
        return shoreSvg(ctx, 'sh', now, X, { lit: (i, t) => 1 - smooth(ramp(t, outAt[i], outAt[i] + 0.1)), lock: T.follow1 - 0.2, seed: 3 })
      },
    }
  },
})

/* ── Chorus 1: everybody talking ────────────────────────────────────── */

const SHOUTS = ['You should', 'Trust me', 'Do it my way', 'Be realistic', 'Get a real job', 'Everyone knows', 'Sell out', 'Smile more', 'Listen', 'Grow up', 'Just be normal', 'Chase the trend']
SCENES.push({
  id: 'horns',
  setup(plan) {
    const { T, camX } = plan
    const X = camX(T.listen1 + 0.2)
    const HORNS = [[-1, 170, -16], [1, 170, -16], [-1, 280, 8], [1, 280, 8], [-1, 390, 0], [1, 390, 0]]
    plan.hits.push([T.anybody1, 7], [T.ever1, 9], [T.anymore1, 16])
    const born = []
    for (let h = 0; h < HORNS.length; h++) for (let t = T.l3 - 2.2 + h * 0.13; t < T.listen1; t += 0.95 + 0.3 * hash(h, Math.round(t * 10), 4)) born.push({ h, t, w: SHOUTS[(born.length * 5 + h) % SHOUTS.length] })
    return {
      t0: T.l3 - 4, t1: T.anymore1 + 4, x0: X - 1000, x1: X + 1000,
      draw(ctx, now) {
        const droop = easeOut(ramp(now, T.anybody1, T.anybody1 + 0.45))
        const melt = easeInOut(ramp(now, T.ever1, T.ever1 + 1.4))
        let tower = `<rect x="${r(X - 9)}" y="120" width="18" height="600" fill="${INK}"/><rect x="${r(X - 60)}" y="140" width="120" height="16" fill="${INK}"/>`
        const shouts = []
        HORNS.forEach(([dir, y, ang], i) => {
          const parts = hornParts(DAY, { L: 190, mouth: 62, angle: 0 })
          let warp = null
          if (droop > 0) {
            const bend = bendWarp(40, -droop / (260 + 60 * i))
            const mw = melt > 0 ? meltWarp([0, -70, 200, 150], melt, 3 + i, { drips: 3, sag: 1.1 }) : null
            warp = (x, yy) => { const [bx, by] = bend(x, yy); return mw ? mw(bx, by) : [bx, by] }
          }
          const horn = renderParts(parts, warp)
          tower += `<g transform="translate(${r(X + dir * 14)} ${y}) scale(${dir} 1) rotate(${ang})">${horn}</g>`
        })
        // Words out of every mouth, flying on, growing, fading — until the headphones go on.
        for (const b of born) {
          const age = now - b.t
          if (age < 0 || age > 1.6) continue
          const [dir, y, ang] = HORNS[b.h]
          const a = (ang * Math.PI) / 180
          const dist = 200 + 300 * age
          const wx = X + dir * (14 + Math.cos(a) * dist)
          const wy = y + Math.sin(a) * dist + (hash(b.h, Math.round(b.t * 10), 6) - 0.5) * 160 * age
          const size = 28 + 30 * age
          const o = Math.min(1, age * 6) * (1 - ramp(age, 1.0, 1.6))
          shouts.push(`<text x="${r(wx)}" y="${r(wy + size * 0.34)}" font-size="${r(size)}" font-weight="700" text-anchor="middle" fill="${INK}" opacity="${r(o, 3)}" textLength="${r(advance(b.w, size) * 0.8)}" lengthAdjust="spacingAndGlyphs">${esc(b.w.toUpperCase())}</text>`)
        }
        // Headphones come down over the top of it all on "listen".
        const hy = dropY(now, T.listen1, 700, 0.16)
        const phones = now > T.listen1 - 0.2 ? placed(renderParts(headphoneParts(DAY, { R: 170 })), X, 250 + hy, 1.25) : ''
        // Two megaphones on stands shouting in from the sides.
        const megas = [[-560, 1], [560, -1]].map(([dx, dir], i) => {
          const m = `<rect x="${r(X + dx - 5)}" y="500" width="10" height="220" fill="${INK}"/><g transform="translate(${r(X + dx)} 480) scale(${dir} 1) rotate(-6)">${renderParts(megaphoneParts(DAY, { L: 230, mouth: 90 }))}</g>`
          return m
        }).join('')
        let all = tower + phones + megas
        all = shatter(ctx, 'hn', all, { box: [X - 720, 60, X + 720, 720], at: [X, 330], tau: now - T.anymore1, n: 10, seed: 8, power: 1.1 })
        return { mid: all, front: shouts.join('') }
      },
    }
  },
})

/* ── Break 1: the gear ──────────────────────────────────────────────── */

SCENES.push({
  id: 'gear',
  setup(plan) {
    const { T, camX, beat, beatAt } = plan
    const b0 = Math.ceil(beatAt(T.anymore1 + 3) / 4) * 4
    const bar = (k) => beat(b0 + 4 * k)
    const X = camX(bar(0))
    const stacks = [-260, 190, 640, 1090, 1540, 1990, 2440].map((dx) => X + dx)
    const WORDS = ['Loud', 'Louder', 'More', 'Volume', 'Max', '11', 'Loudest']
    const recs = [{ s: 1, t: bar(0) + 0.02 }, { s: 2, t: bar(1) }, { s: 3, t: bar(1) + plan.BEAT * 2 }]
    const smash = bar(2)
    const cassT = bar(3)
    plan.hits.push([recs[0].t, 6], [recs[1].t, 6], [recs[2].t, 6], [smash, 26, 1.4], [cassT, 8])
    plan.extras.cass = { t: cassT, x: stacks[5], y: 330 }
    plan.extras.gearBars = { bar0: bar(0), smash }
    return {
      t0: T.anymore1 + 0.5, t1: cassT + 5, x0: X - 700, x1: X + 2900,
      draw(ctx, now) {
        let back = ''
        let mid = ''
        const pump = Math.exp(-((beatAt(now) % 1) * plan.BEAT) / 0.09)
        stacks.forEach((sx, i) => {
          const cab = renderParts(ampParts(DAY, { w: 340, h: 270, word: WORDS[i] }))
          const head = renderParts(ampParts(DAY, { w: 300, h: 110, word: '' }))
          let stack = placed(cab, sx, 700) + placed(head, sx, 428)
          if (i === 3) stack = shatter(ctx, 'hd', stack, { box: [sx - 180, 300, sx + 180, 700], at: [sx - 20, 318], tau: now - smash, n: 7, seed: 3, power: 0.7 })
          back += `<g transform="translate(${r(sx)} 700) scale(${r(1 + 0.012 * pump, 4)}) translate(${r(-sx)} -700)">${stack}</g>`
        })
        // Records land on the stacks and melt over the front.
        for (const rc of recs) {
          if (now < rc.t - 0.2) continue
          const sx = stacks[rc.s]
          const top = 318
          const dy = dropY(now, rc.t, 500, 0.2)
          const m = easeInOut(ramp(now, rc.t + 0.1, rc.t + 2.4))
          const warp = m > 0 ? (x, y) => {
            if (y < 0) return [x, y]
            const v = y / 120
            return [x * (1 + 0.1 * m * v), y + m * (60 * v * v + 90 * v * v * (0.5 + 0.5 * Math.sin(x / 26))) ]
          } : null
          mid += placed(renderParts(vinylParts(DAY, { R: 120, label: 'The hit' }), warp), sx, top + dy)
        }
        // The guitar leans on the fourth stack, rises, and comes down on it on the bar.
        const gx = stacks[3] + 40
        const pivot = [gx + 40, 150]
        const up = smooth(ramp(now, smash - 0.95, smash - 0.12))
        const down = ramp(now, smash - 0.12, smash)
        const ang = now < smash - 0.12 ? lerp(-78, -228, up) : lerp(-228, -392, down * down)
        const guitar = `<g transform="translate(${r(pivot[0])} ${r(pivot[1])}) rotate(${r(ang, 2)}) translate(-520 0)">${renderParts(guitarParts(DAY, { snapped: 0 }))}</g>`
        mid += shatter(ctx, 'gt', guitar, { box: [gx - 900, -700, gx + 900, 900], at: [gx - 60, 330], tau: now - smash, n: 11, seed: 9, power: 1.3 })
        // The cassette drops; its tape is the thread the camera follows out.
        const c = plan.extras.cass
        if (now > c.t - 0.25) mid += placed(renderParts(cassetteParts(DAY, { spin: now * 9 })), c.x, 250 + dropY(now, c.t, 500, 0.25), 0.55)
        return { back, mid }
      },
    }
  },
})

/* ── The tape: out of the cassette and on down the wall ─────────────── */

function tapePts(x0, y0, len) {
  const pts = []
  for (let s = 0; s <= len; s += 9) {
    const A = 34 + 26 * (0.5 + 0.5 * noise1(s / 400, 3))
    const f = 23
    const base = y0 + 150 * Math.sin(s / 520) + 60 * noise1(s / 300, 8) + Math.min(1, s / 300) * 120
    pts.push([x0 + s + A * Math.cos(s / f), base + A * Math.sin(s / f)])
  }
  return pts
}
SCENES.push({
  id: 'tape',
  setup(plan) {
    const c = plan.extras.cass
    const { T } = plan
    const L = plan.camX(T.memphis) - 200 - c.x
    return {
      t0: c.t, t1: T.detroit + 3.5, x0: c.x - 100, x1: c.x + L + 400,
      draw(ctx, now) {
        const len = Math.min(L, 2400 * easeOut(clamp01((now - c.t) / 2.4)) + 900 * Math.max(0, now - c.t - 2.4))
        if (len < 10) return {}
        const d = openD(tapePts(c.x, c.y, len))
        return { mid: pen(d, 7, { stroke: INK }) + pen(d, 2, { stroke: '#4a4238' }) }
      },
    }
  },
})

/* ── Verse 2: they said move to ─────────────────────────────────────── */

const FLAPS = 'ABCDEFGHIJKLMNOPRSTUVWXY.'
SCENES.push({
  id: 'board',
  setup(plan) {
    const { T, camX, run } = plan
    const X = camX(T.nashville + 0.3)
    const CELL = 54
    const PITCH_X = 60
    const COLS = 10
    const top = 172
    const rowH = 70
    const x0 = X - (COLS * PITCH_X) / 2 - 90
    const lands = [T.memphis, T.nashville, T.austin, T.la, T.detroit]
    const cities = ['MEMPHIS', 'NASHVILLE', 'AUSTIN', 'L.A.', 'DETROIT', 'NEW YORK']
    const statuses = ['BARGAIN', 'BEND', 'ABANDON', 'EXPLOIT', 'BURN OUT', '']
    const rowY = (i) => top + 40 + i * rowH
    // Strike each city out as it lands: across, then back down to the next row.
    const keys = []
    lands.forEach((t, i) => {
      const y = rowY(i) + CELL / 2
      keys.push({ t: t + 0.08, x: x0 + 20, y }, { t: t + Math.min(0.34, (lands[i + 1] ?? t + 1) - t - 0.12), x: x0 + 20 + COLS * PITCH_X + 40, y })
    })
    run(keys, 0.35, 0.45)
    const jam = T.detroit + 0.8
    const blow = T.detroit + 2.3
    plan.hits.push([blow + 0.3, 16])
    return {
      t0: T.l4 - 3, t1: T.detroit + 4.5, x0: X - 800, x1: X + 800,
      draw(ctx, now) {
        const W = COLS * PITCH_X + 300
        let board = `<rect x="${r(x0 - 40)}" y="${top - 70}" width="${W}" height="${rowH * 6 + 130}" rx="10" fill="${INK}"/>`
        board += `<rect x="${r(x0 - 22)}" y="${top - 54}" width="${W - 36}" height="44" fill="${YELLOW}"/>`
        board += job(x0, top - 22, 24, 'Departures', { fill: INK, weight: 700, tracking: 8 }) + job(x0 + W - 70, top - 22, 18, 'They said move to', { anchor: 'end', fill: INK, tracking: 6 })
        let cells = ''
        cities.forEach((city, i) => {
          const y = rowY(i)
          const land = lands[i] ?? Infinity
          for (let j = 0; j < COLS; j++) {
            const final = city[j] ?? ' '
            const cx = x0 + j * PITCH_X
            const cellLand = land + j * 0.02
            let ch = final
            let flip = 1
            const spinning = i < 5 && ((now > T.move - 0.4 && now < cellLand) || now > jam)
            if (spinning) {
              const rate = now > jam ? 0.045 : 0.07
              const q = (now - (i * 0.013 + j * 0.017)) / rate
              const k = Math.floor(q)
              ch = FLAPS[Math.floor(hash(k, j, i) * FLAPS.length)]
              const nx = FLAPS[Math.floor(hash(k + 1, j, i) * FLAPS.length)]
              flip = q - k
              const cell = flapCell(cx, y, CELL, CELL * 1.1, ch, nx, flip)
              cells += now > blow ? pied(ctx, `bp${i}${j}`, { x: cx, y: y + CELL, size: CELL, text: ' ', tau: 0 }) + flyCell(cell, now - blow - (i * COLS + j) * 0.006, i, j, cx, y) : cell
              continue
            }
            if (now < T.move - 0.4 && i < 5) ch = ' '
            if (i === 5) ch = final
            const cell = flapCell(cx, y, CELL, CELL * 1.1, ch, ch, 1)
            cells += now > blow ? flyCell(cell, now - blow - (i * COLS + j) * 0.006, i, j, cx, y) : cell
          }
          if (i === 5) cells += job(x0 + COLS * PITCH_X + 30, y + 40, 20, 'Now boarding', { fill: YELLOW, tracking: 3, opacity: 0.35 + 0.65 * (Math.floor(now * 2.5) % 2) })
          if (statuses[i] && now > land + 0.1) cells += job(x0 + COLS * PITCH_X + 30, y + 40, 20, statuses[i], { fill: YELLOW, tracking: 3, opacity: pulled(now, land + 0.1) })
        })
        const all = board + cells
        const out = now > blow + 0.3 ? shatter(ctx, 'bd', board, { box: [x0 - 60, top - 90, x0 + W, top + rowH * 6 + 80], at: [X, 360], tau: now - blow - 0.3, n: 9, seed: 6, power: 1.2 }) + cells : all
        return { mid: out }
      },
    }
  },
})
/** A flap cell blown off the board: it flies, spins and drops. */
function flyCell(cell, tau, i, j, cx, cy) {
  if (tau <= 0) return cell
  if (tau > 2.4) return ''
  const vx = (hash(i, j, 3) - 0.3) * 900
  const vy = -300 - 500 * hash(i, j, 4)
  const dx = vx * tau
  const dy = vy * tau + 0.5 * GRAV * tau * tau
  const rot = (hash(i, j, 5) - 0.5) * 1100 * tau
  return `<g transform="translate(${r(dx, 1)} ${r(dy, 1)}) rotate(${r(rot, 1)} ${r(cx + 27)} ${r(cy + 30)})">${cell}</g>`
}

/* ── Verse 2: the only way — a conveyor belt ────────────────────────── */

SCENES.push({
  id: 'belt',
  setup(plan) {
    const { T, camX } = plan
    const X = camX(T.bend)
    const BELT_Y = 600
    const V = 110
    const items = [
      { dx: -560, kind: 'contract', t: T.bargain },
      { dx: -190, kind: 'ruler', t: T.bend },
      { dx: 190, kind: 'case', t: T.abandon },
      { dx: 560, kind: 'register', t: T.exploit },
    ]
    plan.hits.push([T.brk, 9], [T.bargain, 7], [T.bend + 0.1, 8], [T.abandon, 6], [T.exploit, 20, 1.3])
    return {
      t0: T.l5 - 3.5, t1: T.exploit + 4.5, x0: X - 1500, x1: X + 1600,
      draw(ctx, now) {
        const shift = V * (now - T.bend)
        let back = ''
        // The belt: a band on rollers, its surface running right.
        const bx0 = X - 1500
        const bx1 = X + 1600
        back += `<rect x="${r(bx0)}" y="${BELT_Y}" width="${r(bx1 - bx0)}" height="40" fill="${INK}"/>`
        let ticks = ''
        for (let x = bx0 + ((shift % 60) + 60) % 60; x < bx1; x += 60) ticks += `M${P(x, BELT_Y + 6)}v28`
        back += pen(ticks, 2, { stroke: PAPER, opacity: 0.35, cap: 'butt' })
        for (let x = bx0 + 40; x < bx1; x += 110) {
          const a = shift / 16
          back += `<circle cx="${r(x)}" cy="${BELT_Y + 62}" r="20" fill="${INK}"/><path d="M${P(x + Math.cos(a) * 14, BELT_Y + 62 + Math.sin(a) * 14)}L${P(x - Math.cos(a) * 14, BELT_Y + 62 - Math.sin(a) * 14)}" stroke="${PAPER}" stroke-width="3"/>`
        }
        back += `<rect x="${r(bx0)}" y="${BELT_Y + 86}" width="${r(bx1 - bx0)}" height="40" fill="${INK}"/>`
        // The sign, THE ONLY WAY, on two chains: one breaks on "break".
        const sw = now - T.brk
        const swing = sw > 0 ? 17 * (1 - Math.exp(-sw / 0.3) * Math.cos(sw * 8)) : 0
        const signX = X - 360
        const sign = `<rect x="${r(signX)}" y="70" width="720" height="118" fill="${YELLOW}"/><rect x="${r(signX)}" y="70" width="720" height="118" fill="none" stroke="${INK}" stroke-width="6"/>${woodType(ctx, 'ow', { x: X, y: 166, size: 110, text: 'The only way', width: 640, anchor: 'middle', impression: 0.5, seed: 44 })}`
        const chainL = sw > 0 ? '' : `<path d="M${P(signX + 40, -20)}V70" stroke="${INK}" stroke-width="5" stroke-dasharray="10 5"/>`
        back += chainL + `<path d="M${P(signX + 680, -20)}V70" stroke="${INK}" stroke-width="5" stroke-dasharray="10 5"/>` + `<g transform="rotate(${r(-swing, 2)} ${r(signX + 680)} 70)">${sign}</g>`
        let mid = ''
        for (const it of items) {
          const x = X + it.dx + shift
          const tau = now - it.t
          if (it.kind === 'contract') {
            const c = placed(renderParts(contractParts(DAY, { w: 250, h: 330, title: 'Contract' })), x, BELT_Y - 170, 1, -3)
            mid += tearStrips(ctx, 'ct', c, { box: [x - 140, BELT_Y - 350, x + 140, BELT_Y], tau, n: 5, seed: 3, spread: 1.3 })
          }
          else if (it.kind === 'ruler') {
            const bend = easeInOut(ramp(now, it.t - 0.35, it.t + 0.08))
            const warp = (px, py) => [px, py + bend * (px * px) / 900]
            const ruler = renderParts(rulerParts(DAY, { L: 420, H: 54 }), bend > 0 ? warp : null)
            const stand = `<path d="M${P(x - 10, BELT_Y)}L${P(x, BELT_Y - 150)}L${P(x + 10, BELT_Y)}Z" fill="${INK}"/>`
            if (tau < 0.1) mid += stand + placed(ruler, x, BELT_Y - 160)
            else {
              // Snapped: each half falls its own way.
              const f = tau - 0.1
              for (const side of [-1, 1]) {
                const cid = `${ctx.uid}-rl${side}`
                ctx.defs.push(`<clipPath id="${cid}"><rect x="${side < 0 ? -260 : 0}" y="-200" width="260" height="400"/></clipPath>`)
                const dx = side * (90 * f + 30)
                const dy = 0.5 * GRAV * f * f - 180 * f
                mid += `<g transform="translate(${r(x + dx, 1)} ${r(BELT_Y - 160 + dy, 1)}) rotate(${r(side * 200 * f, 1)})"><g clip-path="url(#${cid})">${ruler}</g></g>`
              }
              mid += stand
            }
          }
          else if (it.kind === 'case') {
            // Abandoned: a trapdoor opens in the belt and it drops through.
            const f = Math.max(0, tau)
            const c = placed(renderParts(caseParts(DAY, { L: 330 })), x, BELT_Y - 70 + 0.5 * GRAV * f * f, 1, 70 * f * f)
            mid += c
            if (tau > -0.1 && tau < 1.5) mid += `<rect x="${r(x - 150)}" y="${BELT_Y}" width="300" height="40" fill="${PAPER}"/>`
          }
          else {
            const hikes = [T.only, T.way, T.brk, T.bargain, T.bend, T.abandon]
            const n = hikes.filter((h) => now >= h).length
            const disp = `$0.00${Math.min(9, 1 + Math.floor(n / 2))}`
            const reg = placed(renderParts(registerParts(DAY, { display: n ? disp : '$0.000', open: easeOut(ramp(now, it.t - 0.15, it.t)) })), x, BELT_Y, 0.9)
            mid += shatter(ctx, 'rg', reg, { box: [x - 200, BELT_Y - 260, x + 200, BELT_Y + 100], at: [x, BELT_Y - 120], tau, n: 9, seed: 12, power: 1.4 })
            if (tau > 0 && tau < 2.5) {
              let coins = ''
              for (let k = 0; k < 16; k++) {
                const vx = (hash(k, 1, 7) - 0.5) * 1200
                const vy = -500 - 600 * hash(k, 2, 7)
                const cx = x + vx * tau
                const cy = BELT_Y - 120 + vy * tau + 0.5 * GRAV * tau * tau
                coins += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(14 * Math.abs(Math.cos(tau * 12 + k)) + 2)}" ry="14" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/>`
              }
              mid += coins
            }
          }
        }
        return { back, mid }
      },
    }
  },
})

/* ── Chorus 2: the art class ─────────────────────────────────────────── */

SCENES.push({
  id: 'class',
  setup(plan) {
    const { T, camX } = plan
    const X = camX(T.see2)
    const easels = [-260, 220, 700].map((dx) => X + dx)
    const tinX = X + 1120
    const board = X - 760
    const steps = [T.follow2, T.lights2, T.see2, T.shore2]
    const shreds = [T.listen2, T.anybody2, T.ever2]
    plan.hits.push([T.listen2, 7], [T.anybody2, 7], [T.ever2, 7], [T.anymore2, 15])
    return {
      t0: T.l6 - 4, t1: T.anymore2 + 3.2, x0: X - 1300, x1: X + 1500,
      draw(ctx, now) {
        let back = ''
        const lines = ['Today:', 'the right way', 'to paint', 'stay inside the lines']
        back += placed(renderParts(chalkboardParts(DAY, { w: 560, h: 330, lines })), board, 320)
        let mid = ''
        // All three fill in at once, cell for cell the same — on the words.
        const filled = Math.round(steps.filter((t) => now >= t).length * 1.5)
        easels.forEach((ex, i) => {
          const pbn = renderParts(paintByNumbersParts(DAY, { w: 380, h: 290, on: filled, seed: 4 }))
          const e = placed(pbn, ex, 700)
          const tau = now - shreds[i]
          mid += tearStrips(ctx, `pb${i}`, e, { box: [ex - 210, 700 - 150 - 300, ex + 210, 700 - 145], tau, n: 7, vertical: i !== 1, seed: 5 + i, spread: 1.4 })
          if (tau > 0) mid += placed(renderParts(paintByNumbersParts(DAY, { w: 380, h: 290, on: 0 }).slice(0, 4)), ex, 700)
        })
        // A tin of the right colour — which goes everywhere on "anymore".
        const ta = now - T.anymore2
        const tin = `<rect x="${r(tinX - 90)}" y="480" width="180" height="220" fill="${INK}"/><ellipse cx="${r(tinX)}" cy="480" rx="90" ry="24" fill="${YELLOW}"/><rect x="${r(tinX - 80)}" y="540" width="160" height="90" fill="${PAPER}"/>${job(tinX, 578, 20, 'The right', { anchor: 'middle', weight: 700, tracking: 3 })}${job(tinX, 608, 20, 'colour', { anchor: 'middle', weight: 700, tracking: 3 })}`
        mid += ta > 0 ? shatter(ctx, 'tn', tin, { box: [tinX - 120, 440, tinX + 120, 710], at: [tinX, 520], tau: ta, n: 7, seed: 2, power: 1.2 }) : tin
        let splash = ''
        if (ta > 0) {
          const R = 700 * easeOut(clamp01(ta / 0.35))
          const blob = Array.from({ length: 40 }, (_, k) => {
            const a = (k / 40) * Math.PI * 2
            const q = 0.55 + 0.45 * hash(k, 3, 8) + (k % 5 === 0 ? 0.5 : 0)
            return [tinX + Math.cos(a) * R * q, 480 + Math.sin(a) * R * q * 0.7]
          })
          splash += fillD(spline(blob, true), YELLOW, { opacity: 0.94 })
          for (let k = 0; k < 14; k++) {
            const a = hash(k, 4, 8) * Math.PI * 2
            const d = R * (1.2 + 0.6 * hash(k, 5, 8))
            splash += `<circle cx="${r(tinX + Math.cos(a) * d)}" cy="${r(480 + Math.sin(a) * d * 0.7 + 200 * ta * ta)}" r="${r(10 + 22 * hash(k, 6, 8))}" fill="${YELLOW}"/>`
          }
        }
        return { back, mid, front: splash }
      },
    }
  },
})

/* ── No, no, no, no ─────────────────────────────────────────────────── */

const NO_W = 300
const NO_GAP = 46
/** A NO in wood type on its yellow block, set at centre x, baseline y. */
function noSort(ctx, key, x, y, { scale = 1, rot = 0, heavy = 0.5, reg = [9, -6], block = 1, ink = 1 } = {}) {
  const w = NO_W * scale
  const size = 250 * scale
  let out = ''
  if (block > 0) out += `<rect x="${r(x - w / 2 + reg[0] * scale)}" y="${r(y - size * 0.8 + reg[1] * scale)}" width="${r(w)}" height="${r(size * 0.86)}" fill="${YELLOW}" opacity="${r(block, 3)}"/>`
  if (ink > 0) out += woodType(ctx, key, { x, y, size, text: 'No', width: w * 0.96, anchor: 'middle', impression: heavy, seed: 40 + key.length * 3 + Math.round(x) % 17, opacity: ink })
  return rot ? `<g transform="rotate(${r(rot, 2)} ${r(x)} ${r(y - size * 0.4)})">${out}</g>` : out
}
/** A NO slammed down on its word: falls from above, lands, squashes. */
function noSlam(ctx, key, now, t, x, y, o = {}) {
  if (now < t - 0.14) return ''
  const dy = dropY(now, t, 700, 0.12)
  const sq = landSquash(now, t)
  const inner = noSort(ctx, key, x, y, o)
  return `<g transform="translate(0 ${r(dy, 1)}) translate(${r(x)} ${r(y)}) scale(${r(1 + (1 - sq) * 0.5, 3)} ${r(sq, 3)}) translate(${r(-x)} ${r(-y)})">${inner}</g>`
}
/** Anything a NO lands on: squashed on the word, then in pieces. */
function crushed(ctx, key, svg, now, t, box, at) {
  const a = now - t
  if (a < 0) return svg
  if (a < 0.05) return `<g transform="${squash(a / 0.05 * 0.7, box[3], (box[0] + box[2]) / 2)}">${svg}</g>`
  return shatter(ctx, key, `<g transform="${squash(0.7, box[3], (box[0] + box[2]) / 2)}">${svg}</g>`, { box, at, tau: a - 0.05, n: 7, seed: key.length + 3, power: 1.1 })
}
SCENES.push({
  id: 'headline',
  setup(plan) {
    const { T, camX, beat, beatAt, run } = plan
    const X = camX(T.no1[1] + 0.1)
    const xs = [-1.5, -0.5, 0.5, 1.5].map((k) => X + k * (NO_W + NO_GAP))
    const base = Math.floor(beatAt(T.no1[0])) - 4
    const blocks = [0, 1, 2, 3].map((k) => beat(base + k))
    const BASE = 520
    run([{ t: T.no1[3] + 0.3, x: X - 720, y: BASE + 28 }, { t: T.no1[3] + 0.75, x: X + 720, y: BASE + 28 }], 0.35, 0.8)
    plan.hits.push(...blocks.map((t) => [t, 4]))
    return {
      t0: T.anymore2 + 0.5, t1: T.l9 + 2, x0: X - 900, x1: X + 900,
      draw(ctx, now) {
        let back = `<path d="${posterD(X - 780, 50, X + 780, 690, 19, 6)}" fill="${FIBRE}"/>`
        back += brassRule(X - 700, X + 700, 96)
        back += ornamentRule(X - 700, X + 700, BASE + 70, 11)
        back += job(X, 176, 24, 'The formula, in four parts', { anchor: 'middle', tracking: 9, opacity: 0.7 })
        let mid = ''
        const things = [
          () => placed(renderParts(metronomeParts(DAY, { H: 250, swing: Math.sin(beatAt(now) * Math.PI) })), 0, 0),
          () => placed(renderParts(booksParts(DAY, { books: BOOKS.slice(0, 5) })), 0, 0, 0.8),
          () => placed(renderParts(punchClockParts(DAY, { spin: now * 3 })), 0, 70, 0.72),
          () => placed(renderParts(reportCardParts(DAY, { w: 240, h: 270 })), 0, 0),
        ]
        xs.forEach((x, i) => {
          back += printed(`<rect x="${r(x - NO_W / 2 + 9)}" y="${BASE - 210}" width="${NO_W}" height="215" fill="${YELLOW}"/>`, pulled(now, blocks[i], 0.12), x, BASE - 100)
          const thing = placed(things[i](), x, BASE)
          mid += crushed(ctx, `hl${i}`, thing, now, T.no1[i], [x - 170, BASE - 300, x + 170, BASE], [x, BASE - 60])
        })
        let front = ''
        xs.forEach((x, i) => { front += noSlam(ctx, `n1${i}`, now, T.no1[i], x, BASE, { heavy: 0.3 + i * 0.2, block: 0 }) })
        return { back, mid, front }
      },
    }
  },
})

/* ── No, I won't go, I'm not going to New York ──────────────────────── */

SCENES.push({
  id: 'nyc',
  setup(plan) {
    const { T, camX, run } = plan
    const X = camX(T.new1 - 0.5)
    const BASE = 640
    const sky = memo('skyline', () => skylineParts(DAY, { word: 'NEW YORK', H: 400, seed: 9 }))
    const scale = 1.05
    const half = (sky.width * scale) / 2
    const strikeY = BASE - 190
    run([{ t: T.new1, x: X - half - 40, y: strikeY }, { t: T.york1 + 0.45, x: X + half + 40, y: strikeY }], 0.3, 0.6)
    plan.hits.push([T.wont1, 6], [T.york1, 10], [T.york1 + 0.9, 14])
    const meltFrom = T.york1 + 0.5
    return {
      t0: T.l9 - 3.5, t1: plan.T.brk2 + 5, x0: X - 1100, x1: X + 1100,
      draw(ctx, now) {
        const m = easeInOut(ramp(now, meltFrom, meltFrom + 5.5))
        const parts = sky.parts.map((p) => ({ ...p, pts: Array.isArray(p.pts[0][0]) ? p.pts.map((q) => scalePts(q, scale)) : scalePts(p.pts, scale) }))
        const warp = m > 0 ? meltWarp([-half, -440 * scale, half, 0], m, 5, { drips: 11, sag: 0.95, spread: 0.12 }) : null
        const lit = 1 - ramp(now, meltFrom, meltFrom + 2)
        const kept = parts.filter((p) => p.fill !== YELLOW || lit > 0.05).map((p) => (p.fill === YELLOW ? { ...p, opacity: lit } : p))
        const drain = Math.max(0, now - (meltFrom + 5.2))
        const city = placed(renderParts(kept, warp), X, BASE + 0.5 * GRAV * 0.5 * drain * drain)
        let back = `<path d="M${P(X - 1100, BASE + 2)}H${r(X + 1100)}" stroke="${INK}" stroke-width="5"/>`
        // A cab waiting at the kerb. On "won't go" it goes, without him.
        const ta = Math.max(0, now - T.wont1)
        const cabX = X + 320 - 0.5 * 2600 * ta * ta
        const cab = placed(renderParts(taxiParts(DAY, { L: 380 })), cabX, BASE + 50, 0.9)
        return { back, mid: city + (cabX > X - 1400 ? cab : '') }
      },
    }
  },
})

/* ── The instrumental: the system, at speed ─────────────────────────── */

const STAMP_WORDS = ['Approved', 'Denied', 'Next', 'Rejected', 'Pending', 'Void', 'Take a number', 'Return to sender', 'Processed', 'Not now']
const PIE_WORDS = ['Hustle', 'Grind', 'Go viral', 'Success', 'Obey', 'Fit in', 'Repeat', 'Sell', 'Smile', 'Content', 'Brand', 'Scale']
SCENES.push({
  id: 'forms',
  setup(plan) {
    const { T, camX, beat, beatAt } = plan
    const b0 = Math.ceil(beatAt(T.brk2 + 0.4))
    const b1 = b0 + 16
    const stamps = []
    for (let b = b0; b < b1; b++) {
      const t = beat(b)
      stamps.push({ t, x: camX(t) + (hash(b, 1, 4) - 0.5) * 900, y: 170 + hash(b, 2, 4) * 330, word: STAMP_WORDS[b % STAMP_WORDS.length], rot: (hash(b, 3, 4) - 0.5) * 34 })
      plan.hits.push([t, 5])
    }
    const xa = camX(beat(b0)) + 150
    const xb = camX(beat(b1)) + 1200
    // The forms: sheets pasted edge to edge, every one the same application.
    const forms = memo('forms', () => {
      let out = ''
      for (let x = xa, i = 0; x < xb; x += 330, i++) {
        const y = 60 + (i % 3) * 18
        out += `<path d="${posterD(x, y, x + 310, y + 600, i + 40, 4)}" fill="${FIBRE}" stroke="${PAPER_SHADE}" stroke-width="2"/>`
        out += job(x + 155, y + 50, 22, i % 4 === 1 ? 'Form 27-B' : i % 4 === 2 ? 'Terms & conditions' : i % 4 === 3 ? 'Waiver' : 'Application', { anchor: 'middle', weight: 700, tracking: 4 })
        for (let k = 0; k < 14; k++) out += `<path d="M${P(x + 24, y + 90 + k * 34)}h${r(180 + 80 * hash(i, k, 3))}" stroke="${INK}" stroke-width="1.4" opacity="0.4"/><rect x="${r(x + 270)}" y="${r(y + 78 + k * 34)}" width="14" height="14" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.5"/>`
      }
      return out
    })
    return {
      t0: T.brk2 - 1, t1: beat(b1) + 3, x0: xa, x1: xb,
      draw(ctx, now) {
        let mid = ''
        let front = ''
        stamps.forEach((st, i) => {
          if (now < st.t - 0.2) return
          if (now >= st.t) mid += stampMark(ctx, `st${i}`, st.x, st.y, st.word, { rot: st.rot, size: 44, seed: i + 3 })
          // The stamp itself comes down, hits, and lifts off.
          const a = now - st.t
          if (a < 0.35) {
            const lift = a < 0 ? -dropY(now, st.t, 420, 0.2) * -1 : 260 * easeIn(a / 0.35)
            const y = st.y + 26 + (a < 0 ? dropY(now, st.t, 420, 0.2) : -lift)
            front += `<g transform="${tf(st.x, y, 1.15, st.rot)}">${renderParts(rubberStampParts(DAY, { w: jobW(st.word, 44, 6) + 40 }))}</g>`
          }
        })
        return { back: forms, mid, front }
      },
    }
  },
})
const easeIn = (x) => x * x * x

SCENES.push({
  id: 'records',
  setup(plan) {
    const { T, camX, beat, beatAt } = plan
    const b0 = Math.ceil(beatAt(T.brk2 + 0.4)) + 16
    const b1 = b0 + 16
    const discs = []
    for (let b = b0; b < b1; b += 2) {
      const t = beat(b)
      discs.push({ t, x: camX(t) + 200 + (hash(b, 1, 9) - 0.5) * 700, y: 180 + hash(b, 2, 9) * 330, from: 1 + hash(b, 3, 9) })
      plan.hits.push([t, 9])
    }
    // The ladder: rungs break from the top on the beats, then it goes.
    const ladT = beat(b0 + 6)
    const ladX = camX(ladT + 1.4) + 350
    const snaps = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => beat(b0 + 6 + k))
    const ladFall = beat(b0 + 14)
    plan.hits.push([ladFall, 14])
    return {
      t0: beat(b0) - 1.5, t1: beat(b1) + 3, x0: camX(beat(b0)) - 1200, x1: camX(beat(b1)) + 1500,
      draw(ctx, now) {
        let mid = ''
        // THE LADDER, as tall as the sheet.
        const broken = snaps.filter((t) => now >= t).length + clamp01((now - (snaps.filter((t) => now >= t).pop() ?? now)) / 0.15) - (now >= snaps[0] ? 1 : 0)
        const lad = renderParts(ladderParts(DAY, { H: 660, W: 150, rungs: 11, broken: Math.max(0, broken) }))
        const fall = Math.max(0, now - ladFall)
        let ladder = `<g transform="translate(${r(ladX)} 700) rotate(${r(fall > 0 ? -90 * Math.min(1, fall * fall * 2.4) : 0, 2)} -60 0)">${lad}</g>`
        ladder += job(ladX + 110, 120, 26, 'The ladder', { weight: 700, tracking: 8, opacity: 1 - ramp(now, ladFall, ladFall + 0.3) })
        mid += ladder
        let front = ''
        discs.forEach((d, i) => {
          const a = now - d.t
          if (a < -0.55) return
          const R = 110
          const spin = now * 14 + i
          const rec = renderParts(vinylParts(DAY, { R, label: 'The hit', spin }))
          if (a < 0) {
            // Thrown in from off the right, spinning, flying flat.
            const u = 1 + a / 0.55
            const x = lerp(d.x + 1200, d.x, u)
            const y = lerp(d.y - 260 * d.from, d.y, u) - Math.sin(u * Math.PI) * 120
            front += `<g transform="translate(${r(x)} ${r(y)}) scale(1 ${r(0.55 + 0.45 * u, 3)})">${rec}</g>`
          }
          else front += shatter(ctx, `rc${i}`, placed(rec, d.x, d.y), { box: [d.x - R, d.y - R, d.x + R, d.y + R], at: [d.x - R * 0.6, d.y], tau: a, n: 8, seed: i + 20, power: 1.2 })
        })
        return { mid, front }
      },
    }
  },
})

SCENES.push({
  id: 'pie',
  setup(plan) {
    const { T, camX, beat, beatAt } = plan
    const b0 = Math.ceil(beatAt(T.brk2 + 0.4)) + 32
    const words = []
    for (let b = b0, i = 0; beat(b + 1) < T.brk2To - 6.5; b += 2, i++) {
      const t = beat(b)
      const w = PIE_WORDS[i % PIE_WORDS.length]
      const size = 190
      const width = Math.min(1000, advance(w, size) * 0.78)
      words.push({ t, pie: beat(b + 1), x: camX(t + 0.3) + (i % 2 ? 180 : -160) - width / 2, y: i % 2 ? 330 : 560, w, size, width, i })
      plan.hits.push([beat(b + 1), 7])
    }
    return {
      t0: beat(b0) - 1, t1: T.brk2To, x0: camX(beat(b0)) - 1200, x1: camX(T.brk2To) + 1200,
      draw(ctx, now) {
        let out = ''
        for (const wd of words) {
          if (now < wd.t) continue
          const k = pulled(now, wd.t, 0.1)
          const tau = now - wd.pie
          if (tau > 2.2) continue
          if (tau < 0) {
            out += printed(`<rect x="${r(wd.x - 20)}" y="${r(wd.y - wd.size * 0.8)}" width="${r(wd.width + 40)}" height="${r(wd.size * 0.9)}" fill="${YELLOW}"/>` + woodType(ctx, `pw${wd.i}`, { x: wd.x, y: wd.y, size: wd.size, text: wd.w, width: wd.width, impression: 0.45, seed: wd.i + 60 }), k, wd.x + wd.width / 2, wd.y - wd.size * 0.4)
          }
          else {
            out += `<g opacity="${r(1 - ramp(tau, 0.2, 0.5), 3)}"><rect x="${r(wd.x - 20)}" y="${r(wd.y - wd.size * 0.8 + 400 * tau * tau)}" width="${r(wd.width + 40)}" height="${r(wd.size * 0.9)}" fill="${YELLOW}"/></g>`
            out += pied(ctx, `pd${wd.i}`, { x: wd.x, y: wd.y, size: wd.size, text: wd.w, width: wd.width, tau, seed: wd.i + 5, power: 1.1 })
          }
        }
        return { front: out }
      },
    }
  },
})

SCENES.push({
  id: 'metronome',
  setup(plan) {
    const { T, camX, beat, beatAt } = plan
    // The quiet bar before the chorus comes back: one metronome, keeping the time it is given.
    const tq = T.brk2To - 6.4
    const X = camX(tq + 3)
    const breakAt = beat(Math.floor(beatAt(T.brk2To - 1.9)))
    plan.hits.push([breakAt, 16])
    return {
      t0: tq - 2, t1: T.brk2To + 2, x0: X - 1100, x1: X + 1100,
      draw(ctx, now) {
        const swing = Math.sin(beatAt(now) * Math.PI)
        const m = placed(renderParts(metronomeParts(DAY, { H: 560, swing })), X, 700)
        const out = shatter(ctx, 'mt', m, { box: [X - 200, 120, X + 200, 700], at: [X, 300], tau: now - breakAt, n: 10, seed: 13, power: 1.3 })
        const tape = now > tq ? pen(openD(tapePts(X - 1300, 90, Math.min(3200, 1500 * (now - tq)))), 7, { stroke: INK }) : ''
        return { mid: out + tape }
      },
    }
  },
})

/* ── Chorus 3: the lights go down ───────────────────────────────────── */

SCENES.push({
  id: 'shore-again',
  setup(plan) {
    const { T, camX, run } = plan
    const X = camX(T.lights3)
    const falls = [T.follow3, T.lights3, T.see3, T.out3, T.shore3]
    plan.hits.push(...falls.map((t) => [t + 0.7, 9]))
    // The rule runs out along the horizon, past all of them and on out to sea.
    run([{ t: T.follow3 - 0.1, x: camX(T.follow3) - 700, y: SHORE_Y + 22 }, { t: T.shore3 + 1.2, x: X + 1500, y: SHORE_Y + 22 }], 0.4, 0.6)
    return {
      t0: T.l10 - 4, t1: T.shore3 + 5, x0: X - 1200, x1: X + 1600,
      draw(ctx, now) { return shoreSvg(ctx, 'sa', now, X, { fall: (i) => falls[i], seed: 17 }) },
    }
  },
})

/* ── Chorus 3: every screen talking ─────────────────────────────────── */

const SCREENS = ['Stay tuned', 'Buy now', 'Be normal', 'Obey', 'Trending', 'Go viral', 'Next big thing', 'Don’t think', 'Consume', 'Fit in', 'Smile', 'Coming soon']
SCENES.push({
  id: 'tvs',
  setup(plan) {
    const { T, camX } = plan
    const X = camX(T.anybody3)
    const rows = [T.listen3, T.anybody3, T.ever3]
    plan.hits.push([T.listen3, 10], [T.anybody3, 10], [T.ever3, 12], [T.anymore3, 18])
    return {
      t0: T.l11 - 4, t1: T.anymore3 + 4, x0: X - 1000, x1: X + 1000,
      draw(ctx, now) {
        let mid = `<rect x="${r(X - 640)}" y="${676}" width="1280" height="30" fill="${INK}"/>`
        for (let rI = 0; rI < 3; rI++) {
          for (let c = 0; c < 4; c++) {
            const x = X + (c - 1.5) * 300
            const y = 150 + rI * 212
            const k = rI * 4 + c
            const flick = 0.75 + 0.25 * Math.sin(now * 23 + k * 2.1)
            const tv = placed(renderParts(tvParts({ ...DAY, second: YELLOW }, { slogan: SCREENS[k], w: 250, h: 180 })), x, y + 20)
            const lit = `<g opacity="${r(flick, 3)}">${tv}</g>`
            const tau = now - rows[rI] - c * 0.05
            mid += shatter(ctx, `tv${k}`, lit, { box: [x - 130, y - 110, x + 130, y + 140], at: [x - 20, y + 20], tau, n: 6, seed: k + 30, power: 1.1 })
          }
        }
        // "Anymore": the shelf they stood on goes too.
        if (now > T.anymore3) mid = shatter(ctx, 'tvs', mid, { box: [X - 700, 40, X + 700, 720], at: [X, 690], tau: now - T.anymore3, n: 8, seed: 2, power: 0.9 })
        return { mid }
      },
    }
  },
})

/* ── No, no, no, no — three times ───────────────────────────────────── */

const PILE = [
  (c) => ampParts(c, { w: 300, h: 240, word: 'Loud' }),
  (c) => trophyParts(c, { H: 300 }),
  (c) => booksParts(c, { books: BOOKS.slice(0, 4) }),
  (c) => metronomeParts(c, { H: 260 }),
  (c) => registerParts(c, { display: '$0.003' }),
  (c) => headphoneParts(c, { R: 120 }).map((p) => ({ ...p, pts: movePts(p.pts, 0, -120) })),
  (c) => punchClockParts(c, {}),
  (c) => ladderParts(c, { H: 380, W: 110, rungs: 6 }),
  (c) => taxiParts(c, { L: 320 }),
  (c) => cassetteParts(c, {}).map((p) => (p.pts ? { ...p, pts: movePts(p.pts, 0, -140) } : { ...p, svg: placed(p.svg, 0, -140) })),
  (c) => trophyParts(c, { H: 260, label: 'Gold' }),
  (c) => ampParts(c, { w: 260, h: 220, word: 'More' }),
]
SCENES.push({
  id: 'nos',
  setup(plan) {
    const { T, camX, run } = plan
    const rounds = [T.no2, T.no3, T.no4]
    const X = camX(T.no3[1])
    const layout = [
      { scale: 0.92, y: 640, dx: [-1.5, -0.5, 0.5, 1.5], rot: [0, 0, 0, 0] },
      { scale: 1.08, y: 470, dx: [-1.45, -0.48, 0.48, 1.45], rot: [-4, 3, -2, 5] },
      { scale: 1.3, y: 690, dx: [-1.5, -0.5, 0.5, 1.5], rot: [-9, 6, -5, 10] },
    ]
    const slots = []
    rounds.forEach((times, rI) => {
      const L = layout[rI]
      const cx = camX(times[1]) - X
      times.forEach((t, i) => slots.push({ t, x: X + cx + L.dx[i] * (NO_W + NO_GAP) * L.scale, y: L.y, scale: L.scale, rot: L.rot[i], rI, i }))
      run([{ t: times[3] + 0.2, x: X + cx - 760 * L.scale, y: L.y + 30 * L.scale }, { t: times[3] + 0.6, x: X + cx + 760 * L.scale, y: L.y + 30 * L.scale }], 0.3, 0.9)
    })
    // The pile along the floor: whatever a NO lands on goes.
    const items = PILE.map((make, k) => ({ make, x: X + (k - (PILE.length - 1) / 2) * 190, k }))
    for (const it of items) {
      const hit = slots.find((s) => Math.abs(s.x - it.x) < 150 * s.scale)
      it.t = hit ? hit.t : rounds[2][3] + 0.1
    }
    plan.extras.nosX = X
    return {
      t0: T.anymore3 + 1.5, t1: T.l15 + 1, x0: X - 1500, x1: X + 1500,
      draw(ctx, now) {
        let back = `<path d="${posterD(X - 1300, 40, X + 1300, 700, 23, 10)}" fill="${FIBRE}"/>`
        back += brassRule(X - 1200, X + 1200, 80) + brassRule(X - 1200, X + 1200, 660)
        let mid = ''
        for (const it of items) {
          const svg = placed(renderParts(it.make(DAY)), it.x, 650, 0.62)
          mid += crushed(ctx, `pl${it.k}`, svg, now, it.t, [it.x - 110, 380, it.x + 110, 650], [it.x, 600])
        }
        let front = ''
        for (const s of slots) front += noSlam(ctx, `n${s.rI}${s.i}`, now, s.t, s.x, s.y, { scale: s.scale, rot: s.rot, heavy: 0.2 + s.i * 0.18, reg: s.rI === 2 ? [16, -12] : [9, -6] })
        return { back, mid, front }
      },
    }
  },
})

/* ── The last line: the formula again, and this time it goes ────────── */

SCENES.push({
  id: 'finale',
  setup(plan) {
    const { T, camX, run } = plan
    const X = camX(T.new2) - 120
    const row = departureRow(X, 5)
    const y = row.y - 14
    const tear = T.york2 + 0.12
    const leave = T.end - 3.2
    // Strike out New York; then the rule goes its own way, on and up and off the sheet.
    run([
      { t: T.new2 - 0.02, x: row.x0 - 30, y },
      { t: T.york2 + 0.08, x: row.x1 + 30, y },
      { t: T.york2 + 1.6, x: row.x1 + 520, y },
      { t: leave, x: camX(leave) + 860, y: 30, vx: 420, vy: -300 },
    ], 1.1, Infinity)
    plan.hits.push([T.wont2, 6], [tear, 22, 1.4], [tear + 2.2, 10])
    plan.extras.finale = { X, tear }
    // The wall comes down behind it in strips, a second after the tear.
    const wallAt = tear + 1.1
    const wallBox = [camX(wallAt) - 1400, -260, camX(T.end) + 1400, 980]
    plan.extras.wall = (ctx, now, view, svg) => (now < wallAt ? svg : tearStrips(ctx, 'wall', svg, { box: wallBox, tau: now - wallAt, n: 9, seed: 31, spread: 0.7, stagger: 0.09, span: 5 }))
    plan.hits.push([wallAt, 9])
    // Everything the film broke comes down past the camera while "York" is held.
    const DEBRIS = [
      () => guitarParts(DAY), () => vinylParts(DAY, { R: 130 }), () => cassetteParts(DAY), () => trophyParts(DAY),
      () => megaphoneParts(DAY), () => metronomeParts(DAY, { H: 260 }), () => headphoneParts(DAY), () => taxiParts(DAY),
      () => booksParts(DAY), () => tvParts(DAY, { slogan: 'Stay tuned' }), () => ampParts(DAY), () => lighthouseParts(DAY).parts,
      () => registerParts(DAY), () => contractParts(DAY), () => vinylParts(DAY, { R: 100, label: 'Gold' }), () => rulerParts(DAY),
    ]
    const debris = []
    for (let k = 0; k < 44; k++) {
      const t0 = tear + 0.4 + (k / 44) * 5.4 + (hash(k, 1, 77) - 0.5) * 0.3
      debris.push({ t0, make: DEBRIS[k % DEBRIS.length], dx: (hash(k, 2, 77) - 0.5) * 1700, s: 0.45 + 0.55 * hash(k, 3, 77), spin: (hash(k, 4, 77) - 0.5) * 320, k })
    }
    plan.extras.debris = debris
    // The hush when the band drops out: in close on New York, then out wide for the fall.
    const hushIn = T.im2 - 0.3
    plan.extras.zoom = (t) => {
      let z = 1
      z += 0.08 * smooth(ramp(t, 0, 18)) * (1 - smooth(ramp(t, 18, 19.6)))
      z -= 0.08 * smooth(ramp(t, plan.T.no3[0] - 0.6, plan.T.no3[0])) * (1 - smooth(ramp(t, plan.T.no4[3] + 1.4, plan.T.no4[3] + 2.6)))
      z -= 0.07 * smooth(ramp(t, plan.T.no4[0] - 0.6, plan.T.no4[0])) * (1 - smooth(ramp(t, plan.T.no4[3] + 1.4, plan.T.no4[3] + 2.6)))
      z += 0.2 * smooth(ramp(t, hushIn, hushIn + 1.4)) * (1 - smooth(ramp(t, tear, tear + 1.2)))
      z -= 0.12 * smooth(ramp(t, tear, tear + 1.2))
      return z
    }
    plan.extras.punch = (t) => 0.011 * smooth(ramp(t, 4, 8)) * (1 - smooth(ramp(t, hushIn, hushIn + 0.4)) * (1 - smooth(ramp(t, tear - 0.2, tear))))
    plan.extras.camY = (t) => 150 * smooth(ramp(t, hushIn, hushIn + 1.4)) * (1 - smooth(ramp(t, tear, tear + 1.2)))
    return {
      t0: T.no4[3] + 0.8, t1: T.end + 1, x0: X - 1600, x1: X + 1600,
      draw(ctx, now) {
        let poster = tourPosterSvg(ctx, 'fp', now, X)
        // "Won't go": NOT GOING stamped over the big one.
        if (now >= T.wont2) poster += stampMark(ctx, 'ng', row.x1 - 130, row.y - 16, 'Not going', { rot: -8, size: 40, seed: 9, opacity: pulled(now, T.wont2, 0.08) })
        const out = tearStrips(ctx, 'fp', poster, { box: [X - 730, 50, X + 730, 690], tau: now - tear, n: 2, seed: 8, spread: 1.6, span: 5 })
        // And the type falls out of it.
        let type = ''
        if (now > tear) {
          type += pied(ctx, 'ff', { x: X - 575, y: 326, size: 190, text: 'The Formula', width: 1150, tau: now - tear - 0.05, seed: 3, power: 1.3 })
          DEPARTURES.forEach(([city], i) => {
            const r0 = departureRow(X, i)
            type += pied(ctx, `fc${i}`, { x: r0.x0, y: r0.y, size: 44, text: city, width: Math.min(advance(city, 44) * 0.82, (r0.x1 - r0.x0) * 0.55), tau: now - tear - 0.1 - i * 0.03, seed: 20 + i, power: 0.9 })
          })
        }
        let fall = ''
        for (const d of plan.extras.debris) {
          const a = now - d.t0
          if (a < 0 || a > 2.2) continue
          const x = plan.camX(d.t0) + d.dx
          const yy = -260 + 150 * a + 0.5 * GRAV * 0.7 * a * a
          fall += `<g transform="${tf(x, yy, d.s, d.spin * a)}">${renderParts(d.make())}</g>`
        }
        return { back: out, front: type + fall }
      },
    }
  },
})
