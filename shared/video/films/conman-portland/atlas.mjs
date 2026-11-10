/*
 * Conman — the Portland city drawn as the insurance atlas (2026-11-09): the
 * look of conman-heists/styles.mjs `TOWNS.atlas`, on the new city.
 *
 * Everything that does not change from frame to frame is in `lib`: lots and
 * block outlines in 480 m tiles, trees in tiles, roads, the river, the
 * region. A frame is a handful of <use>s under one transform, plus the three
 * hatch patterns, which are re-cut every frame so a hatch is the same number
 * of pixels at any distance. Strokes are non-scaling: a kerb is a pixel wide
 * whether the frame is 100 m or 16 km across.
 *
 * Three distances, three amounts of detail:
 *   plan and street  every lot, hatched by what it is built of; trees; block
 *                    numbers when close
 *   city             the same, fewer trees
 *   region           blocks only, no trees, and what lies beyond the sheet:
 *                    the suburbs, the Columbia, the mountain
 */
import { COVER_SHEET, INK, PAPER, PAPER_SHADE, paper, marginLyric } from '../../album.mjs'
import * as C from './city.mjs'

export const WATER = '#c6d1d4'
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2
const NSS = 'vector-effect="non-scaling-stroke"'
export const r = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const ramp = (t, a, b) => clamp01((t - a) / (b - a))

/** A camera: world (cx, cy) at the middle of the plate, s pixels to a metre. */
export const cam = (cx, cy, s) => ({ cx, cy, s, X: (x) => CX + (x - cx) * s, Y: (y) => CY + (y - cy) * s,
  view: { x0: cx - (PW / 2 + 40) / s, x1: cx + (PW / 2 + 40) / s, y0: cy - (PH / 2 + 60) / s, y1: cy + (PH / 2 + 40) / s } })
/** The whole city on the sheet, and the region it sits in. */
export const CITY = { cx: (C.BOUNDS.x0 + C.BOUNDS.x1) / 2, cy: (C.BOUNDS.y0 + C.BOUNDS.y1) / 2, s: PW / (C.BOUNDS.x1 - C.BOUNDS.x0) }
export const REGION = { cx: 4900, cy: 300, s: PW / 16400 }

const qd = (q) => `M${q.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}Z`
const pl = (pts) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`
/** A polyline moved sideways by d. */
const aside = (pts, d) => pts.map((p, i) => {
  const a = pts[Math.max(0, i - 1)]
  const b = pts[Math.min(pts.length - 1, i + 1)]
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
  return [p[0] + ((b[1] - a[1]) / L) * d, p[1] - ((b[0] - a[0]) / L) * d]
})

/* ── The library: built once for a uid ───────────────────────────────── */

const TILE = 480
const tileOf = (x, y) => `${Math.floor(x / TILE)}_${Math.floor(y / TILE)}`
const TILES = (() => {
  const t = new Map()
  const at = (key) => { if (!t.has(key)) t.set(key, { frame: '', brick: '', stone: '', blocks: '', trees: '', few: '', n: 0 }); return t.get(key) }
  for (const l of C.LOTS) at(tileOf(l.c[0], l.c[1]))[l.seed < 0.5 ? 'frame' : l.seed < 0.86 ? 'brick' : 'stone'] += qd(l.quad)
  for (const b of C.BLOCKS) if (b.whole) at(tileOf(b.c[0], b.c[1])).blocks += qd(b.quad)
  C.TREES.forEach(([x, y, rr], i) => {
    const tile = at(tileOf(x, y))
    if (i % 3 === 0) tile.few += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rr * 1.9, 2)}" ${NSS}/>`
    else tile.trees += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rr * 1.2, 2)}" ${NSS}/>`
  })
  return t
})()
const tileBox = (key) => { const [i, j] = key.split('_').map(Number); return [i * TILE - 40, j * TILE - 40, (i + 1) * TILE + 40, (j + 1) * TILE + 40] }

const ROADS = C.ROADS.filter((rd) => rd.cls !== 'bridge')
const parkD = C.PARKS.filter((p) => p.kind === 'poly' && p.name !== 'ross island').map((p) => qd(p.pts)).join('')
const RIVER_D = qd(C.RIVER)
const ISLAND_D = qd(C.ISLAND)
/** Everything west of the foot of the hills, for the far view's tone. */
const HILLS_D = qd([...C.CONTOURS[0], [-7000, 4800], [-7000, -4400]])

const libCache = new Map()
function libFor(uid) {
  if (libCache.has(uid)) return libCache.get(uid)
  const id = (k) => `${uid}-pt-${k}`
  let s = '<defs>'
  // Lots and block outlines, by tile. Stroke widths are set by whoever uses them.
  for (const [key, t] of TILES) {
    s += `<g id="${id(`l${key}`)}"><path d="${t.blocks}" fill="none" stroke="${INK}" stroke-opacity="0.8" ${NSS}/>`
      + `<g stroke="${INK}" stroke-width="0.7"><path d="${t.frame}" fill="${PAPER}" ${NSS}/><path d="${t.brick}" fill="url(#${uid}-b)" ${NSS}/><path d="${t.stone}" fill="url(#${uid}-s)" ${NSS}/></g></g>`
    s += `<g id="${id(`f${key}`)}">${t.few}</g><g id="${id(`t${key}`)}">${t.trees}</g>`
  }
  // Roads: both kerbs as hairlines, then the carriageways over them, so a junction is open.
  const kerbs = ROADS.map((rd) => `<path d="${pl(aside(rd.pts, rd.w / 2))}${pl(aside(rd.pts, -rd.w / 2))}" ${NSS}/>`).join('')
  const ways = ROADS.map((rd) => `<path d="${pl(rd.pts)}" stroke-width="${rd.w}"/>`).join('')
  const lanes = ROADS.filter((rd) => rd.cls === 'freeway').map((rd) => `<path d="${pl(rd.pts)}" ${NSS}/>`).join('')
  s += `<g id="${id('roads')}"><g fill="none" stroke="${INK}" stroke-opacity="0.85" stroke-width="1.5">${kerbs}</g>`
    + `<g fill="none" stroke="${PAPER}" stroke-linejoin="round">${ways}</g>`
    + `<g fill="none" stroke="${INK}" stroke-opacity="0.45" stroke-width="0.9" stroke-dasharray="8 6">${lanes}</g></g>`
  const bk = C.BRIDGES.map((b) => `<path d="${pl(aside(b.pts, b.w / 2))}${pl(aside(b.pts, -b.w / 2))}" ${NSS}/>`).join('')
  const bw = C.BRIDGES.map((b) => `<path d="${pl(b.pts)}" stroke-width="${b.w}"/>`).join('')
  s += `<g id="${id('bridges')}"><g fill="none" stroke="${PAPER}">${bw}</g><g fill="none" stroke="${INK}" stroke-opacity="0.9" stroke-width="2">${bk}</g></g>`
  // Water.
  s += `<g id="${id('water')}"><path d="${RIVER_D}" fill="${WATER}"/><path d="${RIVER_D}" fill="url(#${uid}-w)"/><path d="${ISLAND_D}" fill="${PAPER}"/></g>`
  s += `<g id="${id('banks')}" fill="none" stroke="${INK}" stroke-width="1.4"><path d="${RIVER_D}" ${NSS}/><path d="${ISLAND_D}" ${NSS}/></g>`
  // The ground: the hills' contours.
  s += `<g id="${id('ground')}" fill="none" stroke="${INK}" stroke-width="0.7" opacity="0.32">${C.CONTOURS.slice(1).map((c) => `<path d="${pl(c)}" ${NSS}/>`).join('')}</g>`
  // The far view: every block as one mark; the suburbs; the Columbia; the mountain.
  s += `<g id="${id('far')}"><path d="${C.BLOCKS.map((b) => qd(b.quad)).join('')}" fill="${PAPER_SHADE}" stroke="${INK}" stroke-width="0.5" stroke-opacity="0.7" ${NSS}/><path d="${parkD}" fill="${PAPER}" opacity="0.6"/></g>`
  s += `<g id="${id('region')}"><path d="${HILLS_D}" fill="${PAPER_SHADE}" opacity="0.35"/>`
    + `<path d="${C.OUTSKIRTS.map(([x, y, w]) => `M${x} ${y}h${w}v${w}h${-w}Z`).join('')}" fill="${PAPER_SHADE}" stroke="${INK}" stroke-width="0.4" stroke-opacity="0.55" ${NSS}/>`
    + `<path d="${qd(C.COLUMBIA)}" fill="${WATER}"/><path d="${qd(C.COLUMBIA)}" fill="url(#${uid}-w)"/><path d="${qd(C.COLUMBIA)}" fill="none" stroke="${INK}" stroke-width="1.2" ${NSS}/>`
    + `<g fill="none" stroke="${INK}"><g stroke-width="0.7" opacity="0.4">${C.FOOTHILLS.map((c) => `<path d="${pl(c)}" ${NSS}/>`).join('')}</g>`
    + `<g stroke-width="0.9" opacity="0.75">${C.HOOD_RINGS.map((c) => `<path d="${qd(c)}" ${NSS}/>`).join('')}</g></g>`
    + `<path d="${qd(C.HOOD_RINGS.at(-1))}" fill="${PAPER}" stroke="${INK}" stroke-width="1.1" ${NSS}/></g>`
  s += '</defs>'
  libCache.set(uid, [s])
  return libCache.get(uid)
}

/* ── A frame of the town ─────────────────────────────────────────────── */

/**
 * A hatch whose lines are `gap` pixels apart at this camera. With `fixed`
 * ({ m, b, ax, ay }, from the film) it is ruled on the ground instead: `m`
 * metres to a nominal pixel, about (ax, ay), every other line at opacity
 * `b`. The lines then move and scale with the buildings, and thin out by
 * halves as the camera pulls back, so nothing creeps while the camera moves.
 */
const hatch = (id, c, { gap, ang, w, op = 1, cross = false }, fixed) => {
  if (fixed) {
    const g = gap * fixed.m
    const sw = r(w / c.s, 4)
    const rule = (o, k) => `<line x1="0" y1="${r(o, 4)}" x2="${r(2 * g, 4)}" y2="${r(o, 4)}" stroke="${INK}" stroke-width="${sw}" opacity="${r(op * k, 3)}"/>${cross ? `<line x1="${r(o, 4)}" y1="0" x2="${r(o, 4)}" y2="${r(2 * g, 4)}" stroke="${INK}" stroke-width="${sw}" opacity="${r(op * k, 3)}"/>` : ''}`
    return `<pattern id="${id}" width="${r(2 * g, 4)}" height="${r(2 * g, 4)}" patternUnits="userSpaceOnUse" patternTransform="translate(${r(fixed.ax, 2)} ${r(fixed.ay, 2)}) rotate(${ang})">${rule(0, 1)}${fixed.b > 0.004 ? rule(g, fixed.b) : ''}</pattern>`
  }
  const g = gap / c.s
  return `<pattern id="${id}" width="${r(g, 4)}" height="${r(g, 4)}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})"><line x1="0" y1="0" x2="${r(g, 4)}" y2="0" stroke="${INK}" stroke-width="${r(w / c.s, 4)}" opacity="${op}"/>${cross ? `<line x1="0" y1="0" x2="0" y2="${r(g, 4)}" stroke="${INK}" stroke-width="${r(w / c.s, 4)}" opacity="${op}"/>` : ''}</pattern>`
}
const use = (uid, k, extra = '') => `<use href="#${uid}-pt-${k}"${extra}/>`

/**
 * The town at camera c. Returns { svg, lib }. `sites`: 'lots' (the empty
 * lots, dashed), 'numbers' (and their numbers, for planning) or false.
 */
export function town(c, uid, { sites = 'lots', hatch: fixed } = {}) {
  const v = c.view
  const tiles = [...TILES.keys()].filter((key) => { const [x0, y0, x1, y1] = tileBox(key); return x1 > v.x0 && x0 < v.x1 && y1 > v.y0 && y0 < v.y1 })
  // Detail by distance: lots give way to plain blocks as the frame passes about 5 km across.
  const near = ramp(c.s, 0.22, 0.3)
  const far = 1 - ramp(c.s, 0.26, 0.36)
  const beyond = 1 - ramp(c.s, 0.37, 0.45)
  let w = `<defs>${hatch(`${uid}-b`, c, { gap: 3.2, ang: 45, w: 0.7 }, fixed)}${hatch(`${uid}-s`, c, { gap: 3.4, ang: 45, w: 0.7, cross: true }, fixed)}${hatch(`${uid}-w`, c, { gap: 3.2, ang: 0, w: 0.6, op: 0.55 }, fixed)}</defs>`
  if (beyond > 0) w += use(uid, 'region', ` opacity="${r(beyond, 3)}"`)
  w += use(uid, 'ground') + use(uid, 'water')
  if (far > 0) w += use(uid, 'far', ` opacity="${r(far, 3)}"`)
  if (near > 0) w += `<g stroke-width="${c.s < 1.5 ? 0.6 : 1.2}"${near < 1 ? ` opacity="${r(near, 3)}"` : ''}>${tiles.map((key) => use(uid, `l${key}`)).join('')}</g>`
  // Roads stand back in the far view, where a kerb is as wide as the road.
  w += use(uid, 'roads', c.s < 0.3 ? ` opacity="${r(0.4 + 0.6 * ramp(c.s, 0.12, 0.3), 3)}"` : '') + use(uid, 'banks') + use(uid, 'bridges')
  if (near > 0) {
    w += `<g fill="none" stroke="${INK}" stroke-width="0.6" opacity="${r(0.55 * near, 3)}">${tiles.map((key) => use(uid, `f${key}`) + (c.s >= 0.9 ? use(uid, `t${key}`) : '')).join('')}</g>`
  }
  let svg = `<g transform="translate(${r(CX - c.cx * c.s, 2)} ${r(CY - c.cy * c.s, 2)}) scale(${r(c.s, 5)})">${w}</g>`
  // Block numbers, close in.
  if (c.s > 1.8) {
    for (const b of C.BLOCKS) {
      if (!b.whole || b.c[0] < v.x0 || b.c[0] > v.x1 || b.c[1] < v.y0 || b.c[1] > v.y1) continue
      const [x, y] = [c.X(b.c[0]), c.Y(b.c[1])]
      svg += `<circle cx="${r(x)}" cy="${r(y)}" r="9" fill="${PAPER}" stroke="${INK}" stroke-width="0.8"/><text x="${r(x)}" y="${r(y + 3.6)}" font-size="10" font-weight="600" fill="${INK}" text-anchor="middle">${100 + ((Math.round(b.c[0] / 7) * 13 + Math.round(b.c[1] / 7) * 7 + 3000) % 300)}</text>`
    }
  }
  if (sites && near > 0) {
    for (const st of C.SITES) {
      const p = 1.6
      const [x, y, sw, sh] = [c.X(st.o[0] - p), c.Y(st.o[1] - p), (st.w + 2 * p) * c.s, (st.h + 2 * p) * c.s]
      if (st.key === 'museum') svg += `<circle cx="${r(x + sw / 2)}" cy="${r(y + sh / 2)}" r="${r(sw / 2)}" fill="${PAPER}" stroke="${INK}" stroke-width="1" stroke-dasharray="${c.s < 1 ? '2 2' : '6 5'}" opacity="${r(0.7 * near, 3)}"/>`
      else svg += `<rect x="${r(x)}" y="${r(y)}" width="${r(sw)}" height="${r(sh)}" fill="${PAPER}" stroke="${INK}" stroke-width="1" stroke-dasharray="${c.s < 1 ? '2 2' : '6 5'}" opacity="${r(0.7 * near, 3)}"/>`
      if (sites === 'numbers') {
        const [nx, ny] = [x + sw / 2, c.s > 3 ? y - 26 : y + sh / 2]
        svg += `<circle cx="${r(nx)}" cy="${r(ny)}" r="15" fill="${INK}" stroke="${PAPER}" stroke-width="2"/><text x="${r(nx)}" y="${r(ny + 6)}" font-size="17" font-weight="700" fill="${PAPER}" text-anchor="middle">${st.no}</text>`
      }
    }
  }
  return { svg, lib: libFor(uid) }
}

/** The album's sheet with a body on the plate and the lyric in the margin. */
export function sheet({ uid, time, score, body }) {
  return `${paper(COVER_SHEET)}<defs><clipPath id="${uid}-plate"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
<g clip-path="url(#${uid}-plate)"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>${body}</g>${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}`
}
