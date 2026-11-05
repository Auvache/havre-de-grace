/*
 * Conman — five ways to draw the town and its plans (exploration, 2026-11-05).
 *
 *   now      — the film as it is: tan lots, poché walls
 *   atlas    — a fire-insurance atlas: every footprint hatched, block numbers, ruled water
 *   nolli    — figure-ground: the built town solid ink, streets and rooms cut out of it
 *   model    — plan-oblique: the plan stays true, every building stands up out of it
 *   pencil   — the draughtsman's sketch: crossing corners, hatched tone, red pencil
 *
 * All on the album's paper, in its ink; red is still only the crew and green
 * only the take.
 */
import { COVER_SHEET, INK, PAPER, PAPER_SHADE, RED, SECOND_INK, paper } from '../../album.mjs'
import { rng } from '../../kit.mjs'
import * as C from './city.mjs'
import { planAt, THICK } from './plan.mjs'

const GREEN = SECOND_INK.conman
/** A breath of blue under the ruled water. Andalusia's sea (#bfcbbd) was tried and reads sage, too near the take's green. */
export const WATER = '#c6d1d4'
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const PR = PX + PW
const PB = PY + PH
const CX = PX + PW / 2
const CY = PY + PH / 2

const r = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
export const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.font ? ` font-family="${o.font}"` : ''}${o.halo ? ` stroke="${o.halo}" stroke-width="4" stroke-linejoin="round" paint-order="stroke"` : ''}${o.rot ? ` transform="rotate(${r(o.rot)} ${r(x)} ${r(y)})"` : ''}>${esc(text)}</text>`
const NSS = 'vector-effect="non-scaling-stroke"'
export const HAND = "'Architects Daughter', cursive"

/* ── Cameras ─────────────────────────────────────────────────────────── */

export const cam = (cx, cy, s) => ({ cx, cy, s, X: (x) => CX + (x - cx) * s, Y: (y) => CY + (y - cy) * s,
  view: { x0: cx - (PW / 2 + 40) / s, x1: cx + (PW / 2 + 40) / s, y0: cy - (PH / 2 + 60) / s, y1: cy + (PH / 2 + 40) / s } })
const TOP = C.RING.c[1] - C.RING.r - 60
const BOTTOM = C.SITES[5].o[1] + C.SITES[5].h + 70
export const CAMS = {
  overview: cam(C.SHANK_X, (TOP + BOTTOM) / 2, PH / (BOTTOM - TOP)),
  mid: cam(150, 322, 2.6),
  plan: cam(C.SITES[1].o[0] + 17, C.SITES[1].o[1] + 13.6, 22),
}

const inView = (v, pts, pad = 0) => pts.some(([x, y]) => x > v.x0 - pad && x < v.x1 + pad && y > v.y0 - pad && y < v.y1 + pad)
const qd = (q) => `M${q.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}Z`
const pl = (pts) => `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`
const world = (c, inner) => `<g transform="translate(${r(CX - c.cx * c.s, 2)} ${r(CY - c.cy * c.s, 2)}) scale(${r(c.s, 5)})">${inner}</g>`
const lotsIn = (c) => C.LOTS.filter((l) => inView(c.view, l.quad))
const blocksIn = (c) => C.BLOCKS.filter((b) => inView(c.view, b.quad))
const roadsIn = (c, f = () => true) => C.ROADS.filter((rd) => f(rd) && inView(c.view, rd.pts, 60))
const parkD = () => C.PARKS.map((p) => p.kind === 'circle'
  ? `M${p.c[0] + p.r} ${p.c[1]}a${p.r} ${p.r} 0 1 0 ${-2 * p.r} 0a${p.r} ${p.r} 0 1 0 ${2 * p.r} 0Z`
  : p.kind === 'ellipse'
    ? `M${p.c[0] + p.rx} ${p.c[1]}a${p.rx} ${p.ry} 0 1 0 ${-2 * p.rx} 0a${p.rx} ${p.ry} 0 1 0 ${2 * p.rx} 0Z`
    : qd(p.pts)).join('')
const RIVER_D = qd(C.RIVER) + (C.ISLAND.length ? qd(C.ISLAND) : "")
const siteD = (pad = 1.6) => C.SITES.map((s) => qd([[s.o[0] - pad, s.o[1] - pad], [s.o[0] + s.w + pad, s.o[1] - pad], [s.o[0] + s.w + pad, s.o[1] + s.h + pad], [s.o[0] - pad, s.o[1] + s.h + pad]])).join('')
const pierD = () => C.PIERHEADS.map(qd).join('')

/** Hatch pattern in screen pixels, whatever the scale. */
const hatch = (id, c, { gap = 5, ang = 45, w = 0.8, color = INK, op = 1, cross = false } = {}) => {
  const g = gap / c.s
  return `<pattern id="${id}" width="${r(g, 4)}" height="${r(g, 4)}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})"><line x1="0" y1="0" x2="${r(g, 4)}" y2="0" stroke="${color}" stroke-width="${r(w / c.s, 4)}" opacity="${op}"/>${cross ? `<line x1="0" y1="0" x2="0" y2="${r(g, 4)}" stroke="${color}" stroke-width="${r(w / c.s, 4)}" opacity="${op}"/>` : ''}</pattern>`
}

/** Roads as kerbs and carriageway: kerb ink at `kerb` px, carriageway `fill`. */
function roadsSvg(c, rds, { kerb = 1.1, kerbOp = 0.6, fill = PAPER, ink = INK } = {}) {
  let k = ''
  let f = ''
  for (const rd of rds) {
    const d = pl(rd.pts)
    const cap = rd.cls === 'bridge' || rd.cls === 'pier' ? 'butt' : 'round'
    k += `<path d="${d}" stroke="${ink}" stroke-opacity="${kerbOp}" stroke-width="${r(rd.w + (2 * kerb) / c.s, 3)}" fill="none" stroke-linecap="${cap}" stroke-linejoin="round"/>`
    f += `<path d="${d}" stroke="${fill}" stroke-width="${rd.w}" fill="none" stroke-linecap="${cap}" stroke-linejoin="round"/>`
    if (rd.cls === 'freeway') f += `<path d="${d}" stroke="${ink}" stroke-opacity="0.45" stroke-width="${r(0.9 / c.s, 4)}" fill="none" stroke-dasharray="${r(8 / c.s, 3)} ${r(6 / c.s, 3)}"/>`
  }
  return k + f
}

/** The red the getaways leave: the whole anchor, or what of it is given. */
function redSvg(c, lines = C.ANCHOR_LINES, w = 4) {
  return `<g fill="none" stroke="${RED}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${lines.map((p) => `<path d="${pl(p)}" ${NSS}/>`).join('')}</g>`
}

/** Dashed lines round the empty sites, and (for the key) their numbers. */
function sitesSvg(c, { key = false, built = [] } = {}) {
  let s = ''
  for (const st of C.SITES) {
    if (built.includes(st.no)) continue
    const p = 1.6
    s += `<rect x="${r(c.X(st.o[0] - p))}" y="${r(c.Y(st.o[1] - p))}" width="${r((st.w + 2 * p) * c.s)}" height="${r((st.h + 2 * p) * c.s)}" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="${c.s < 1 ? '2 2' : '6 5'}" opacity="0.7"/>`
    if (key) {
      const x = c.X(st.o[0] + st.w / 2)
      const y = c.Y(st.o[1] + st.h / 2)
      s += `<circle cx="${r(x)}" cy="${r(y)}" r="13" fill="${INK}"/>${txt(x, y + 5, 15, String(st.no), { fill: PAPER, anchor: 'middle', weight: 700 })}`
    }
  }
  return s
}

/* ── The five towns ──────────────────────────────────────────────────── */

export const TOWNS = {
  now(c, uid) {
    const lots = lotsIn(c)
    const blocks = blocksIn(c).filter((b) => b.whole)
    const far = c.s < 1.5
    return world(c, `<defs>${hatch(`${uid}-w`, c, { gap: 6, ang: 0, w: 0.7, op: 0.3 })}</defs>
<path d="${RIVER_D}" fill="${PAPER_SHADE}"/><path d="${RIVER_D}" fill="url(#${uid}-w)"/>
<path d="${lots.map((l) => qd(l.quad)).join('')}" fill="#cdc3ac" fill-opacity="0.35" stroke="${INK}" stroke-width="0.8" stroke-opacity="0.5" ${NSS}/>
<path d="${blocks.map((b) => qd(b.quad)).join('')}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-opacity="0.55" ${NSS}/>
${roadsSvg(c, roadsIn(c), { kerb: 1.1, kerbOp: 0.55 })}
<path d="${RIVER_D}" fill="none" stroke="${INK}" stroke-width="${far ? 0.9 : 1.3}" stroke-opacity="0.7" ${NSS}/>
${roadsSvg(c, roadsIn(c, (rd) => rd.cls === 'bridge' || rd.cls === 'pier'), { kerb: 1.1, kerbOp: 0.7 })}
<path d="${pierD()}" fill="${PAPER}" stroke="${INK}" stroke-width="1.1" stroke-opacity="0.7" ${NSS}/>
<g fill="${INK}" opacity="0.28">${C.TREES.filter((t) => inView(c.view, [t])).map(([x, y, rr]) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(Math.max(rr, 1.2 / c.s), 2)}"/>`).join('')}</g>
<path d="${siteD()}" fill="${PAPER}"/>`)
  },

  atlas(c, uid) {
    const lots = lotsIn(c)
    const g = rng(5)
    const groups = { brick: '', frame: '', stone: '' }
    for (const l of lots) groups[l.seed < 0.5 ? 'frame' : l.seed < 0.86 ? 'brick' : 'stone'] += qd(l.quad)
    const blocks = blocksIn(c)
    const nums = c.s > 1.8
      ? blocks.filter((b) => b.whole).map((b, i) => {
        const x = (b.quad[0][0] + b.quad[2][0]) / 2
        const y = (b.quad[0][1] + b.quad[2][1]) / 2
        return `<circle cx="${r(c.X(x))}" cy="${r(c.Y(y))}" r="9" fill="${PAPER}" stroke="${INK}" stroke-width="0.8"/>${txt(c.X(x), c.Y(y) + 3.6, 10, String(100 + ((Math.round(x / 7) * 13 + Math.round(y / 7) * 7) % 300)), { anchor: 'middle', weight: 600 })}`
      }).join('')
      : ''
    void g
    return world(c, `<defs>${hatch(`${uid}-b`, c, { gap: 3.2, ang: 45, w: 0.7 })}${hatch(`${uid}-s`, c, { gap: 3.4, ang: 45, w: 0.7, cross: true })}${hatch(`${uid}-w`, c, { gap: 3.2, ang: 0, w: 0.6, op: 0.55 })}</defs>
<path d="${RIVER_D}" fill="${WATER}"/><path d="${RIVER_D}" fill="url(#${uid}-w)"/>
<path d="${blocks.filter((b) => b.whole).map((b) => qd(b.quad)).join('')}" fill="none" stroke="${INK}" stroke-width="${c.s < 1.5 ? 0.6 : 1.2}" stroke-opacity="0.8" ${NSS}/>
<path d="${groups.frame}" fill="${PAPER}" stroke="${INK}" stroke-width="0.7" ${NSS}/>
<path d="${groups.brick}" fill="url(#${uid}-b)" stroke="${INK}" stroke-width="0.7" ${NSS}/>
<path d="${groups.stone}" fill="url(#${uid}-s)" stroke="${INK}" stroke-width="0.8" ${NSS}/>
${roadsSvg(c, roadsIn(c), { kerb: 0.9, kerbOp: 0.85 })}
<path d="${RIVER_D}" fill="none" stroke="${INK}" stroke-width="1.4" ${NSS}/>
${roadsSvg(c, roadsIn(c, (rd) => rd.cls === 'bridge' || rd.cls === 'pier'), { kerb: 0.9, kerbOp: 0.9 })}
<path d="${pierD()}" fill="${PAPER}" stroke="${INK}" stroke-width="0.9" ${NSS}/>
<g fill="none" stroke="${INK}" stroke-width="0.6" opacity="0.55">${C.TREES.filter((t) => inView(c.view, [t])).map(([x, y, rr]) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(Math.max(rr * 1.2, 1.6 / c.s), 2)}" ${NSS}/>`).join('')}</g>
<path d="${siteD()}" fill="${PAPER}"/>`) + nums
  },

  nolli(c, uid) {
    const blocks = blocksIn(c)
    const whole = blocks.filter((b) => b.whole)
    const lots = lotsIn(c)
    // Courtyards: each whole block inset by its lots' depth.
    const yard = whole.map((b) => {
      const [a, , cc] = b.quad
      const mx = (a[0] + cc[0]) / 2
      const my = (a[1] + cc[1]) / 2
      return qd(b.quad.map(([x, y]) => [mx + (x - mx) * 0.42, my + (y - my) * 0.36]))
    }).join('')
    // Engraved water: lines parallel to both banks, closer at the bank.
    const waterLines = [3, 7, 12, 19, 28].map((d) => `<path d="${pl(C.offset(C.INNER_BANK, -d))}"/><path d="${pl(C.offset(C.OUTER_BANK, d))}"/>`).join('')
    return world(c, `<defs><clipPath id="${uid}-rv"><path d="${RIVER_D}" clip-rule="evenodd"/></clipPath></defs>
<path d="${whole.map((b) => qd(b.quad)).join('')}${lots.map((l) => qd(l.quad)).join('')}" fill="${INK}" stroke="${INK}" stroke-width="${r(Math.min(2.2, 2 / c.s * 1.2), 3)}" stroke-linejoin="round"/>
<path d="${yard}" fill="${PAPER}"/>
<path d="${parkD()}" fill="${PAPER}"/>
<path d="${RIVER_D}" fill="${PAPER}"/>
<g clip-path="url(#${uid}-rv)" fill="none" stroke="${INK}" stroke-width="0.7" opacity="0.7">${waterLines.replace(/\/>/g, ` ${NSS}/>`)}</g>
${roadsIn(c).map((rd) => `<path d="${pl(rd.pts)}" stroke="${PAPER}" stroke-width="${r(rd.w + 1.5, 2)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
<path d="${RIVER_D}" fill="none" stroke="${INK}" stroke-width="1.5" ${NSS}/>
${roadsIn(c, (rd) => rd.cls === 'bridge' || rd.cls === 'pier').map((rd) => `<path d="${pl(rd.pts)}" stroke="${INK}" stroke-width="${r(rd.w + 3 / c.s, 3)}" fill="none"/><path d="${pl(rd.pts)}" stroke="${PAPER}" stroke-width="${rd.w}" fill="none"/>`).join('')}
<path d="${pierD()}" fill="${PAPER}" stroke="${INK}" stroke-width="1.2" ${NSS}/>
<g fill="${INK}" opacity="0.75">${C.TREES.filter((t) => inView(c.view, [t])).map(([x, y, rr]) => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(Math.max(rr * 0.45, 0.9 / c.s), 2)}"/>`).join('')}</g>
<path d="${siteD(3)}" fill="${PAPER}"/>`)
  },

  model(c, uid) {
    // Plan-oblique: the plan true, every building standing straight up the page.
    const k = 0.62 * c.s
    const lots = lotsIn(c).slice().sort((a, b) => Math.max(...a.quad.map((p) => p[1])) - Math.max(...b.quad.map((p) => p[1])))
    let bld = ''
    const shadows = []
    for (const l of lots) {
      const h = Math.min(l.h, 60)
      const up = (h * k) / c.s
      const base = l.quad
      const top = base.map(([x, y]) => [x + up * 0.32, y - up])
      // Silhouette: the base and the top joined by their outermost edges.
      const all = [...base, ...top]
      const hull = convexHull(all)
      bld += `<path d="${qd(hull)}" fill="#a99f8a"/><path d="${qd(top)}" fill="${PAPER}" stroke="${INK}" stroke-width="0.6" stroke-opacity="0.85" ${NSS}/>`
      // A shadow to the east, on the ground.
      shadows.push(qd(convexHull([...base, ...base.map(([x, y]) => [x + up * 0.55, y + up * 0.1])])))
    }
    return world(c, `<defs>${hatch(`${uid}-w`, c, { gap: 4, ang: -20, w: 0.6, op: 0.4 })}</defs>
<path d="${RIVER_D}" fill="${PAPER_SHADE}"/><path d="${RIVER_D}" fill="url(#${uid}-w)"/>
<path d="${shadows.join('')}" fill="${INK}" opacity="0.1"/>
${roadsSvg(c, roadsIn(c), { kerb: 0.8, kerbOp: 0.4, fill: '#f3ecdc' })}
<path d="${RIVER_D}" fill="none" stroke="${INK}" stroke-width="1" stroke-opacity="0.6" ${NSS}/>
${roadsSvg(c, roadsIn(c, (rd) => rd.cls === 'bridge' || rd.cls === 'pier'), { kerb: 1, kerbOp: 0.7, fill: '#f3ecdc' })}
<path d="${pierD()}" fill="#f3ecdc" stroke="${INK}" stroke-width="1" stroke-opacity="0.7" ${NSS}/>
<path d="${siteD()}" fill="#f3ecdc"/>
${C.TREES.filter((t) => inView(c.view, [t])).map(([x, y, rr]) => { const R = Math.max(rr, 1.4 / c.s); return `<circle cx="${r(x + R * 0.5)}" cy="${r(y + R * 0.3)}" r="${r(R, 2)}" fill="${INK}" opacity="0.12"/><circle cx="${r(x)}" cy="${r(y - R * 0.6)}" r="${r(R, 2)}" fill="#8f9a86" stroke="${INK}" stroke-width="0.4" stroke-opacity="0.6" ${NSS}/>` }).join('')}
${bld}`)
  },

  pencil(c, uid) {
    const g = rng(11)
    const blocks = blocksIn(c)
    const lots = lotsIn(c)
    const ov = 5 / c.s
    // Every block edge drawn past its corners, a little off true.
    let edges = ''
    const sketch = [...blocks.filter((b) => b.whole), ...lots.filter((l) => !l.house && !blocks.some((b) => b.whole && inPoly(l.c, b.quad)))]
    for (const b of sketch) {
      for (let i = 0; i < 4; i++) {
        const a = b.quad[i]
        const bb = b.quad[(i + 1) % 4]
        const dx = bb[0] - a[0]
        const dy = bb[1] - a[1]
        const L = Math.hypot(dx, dy)
        const ux = dx / L
        const uy = dy / L
        const j = (g() - 0.5) * 2.2 / c.s
        const ovL = Math.min(ov, L * 0.12)
        const o1 = ovL * (0.4 + g())
        const o2 = ovL * (0.4 + g())
        edges += `M${r(a[0] - ux * o1 + uy * j)} ${r(a[1] - uy * o1 - ux * j)}L${r(bb[0] + ux * o2 - uy * j)} ${r(bb[1] + uy * o2 + ux * j)}`
      }
    }
    const toned = lots.filter((l) => l.seed < 0.45)
    const water = []
    for (let y = -1000; y < 1600; y += 9 / c.s * 1.3) water.push(`M-1300 ${r(y)}H2300`)
    return world(c, `<defs>${hatch(`${uid}-h`, c, { gap: 3.4, ang: 50, w: 0.7, op: 0.75 })}<clipPath id="${uid}-rv"><path d="${RIVER_D}" clip-rule="evenodd"/></clipPath></defs>
<g clip-path="url(#${uid}-rv)"><path d="${water.join('')}" stroke="${INK}" stroke-width="0.6" opacity="0.4" stroke-dasharray="${r(40 / c.s, 2)} ${r(18 / c.s, 2)}" ${NSS}/></g>
<path d="${toned.map((l) => qd(l.quad)).join('')}" fill="url(#${uid}-h)" opacity="0.8"/>
<path d="${lots.filter((l) => l.house).map((l) => qd(l.quad)).join('')}" fill="none" stroke="${INK}" stroke-width="0.6" stroke-opacity="0.6" ${NSS}/>
<path d="${edges}" fill="none" stroke="${INK}" stroke-width="${c.s < 1.5 ? 0.55 : 0.9}" stroke-opacity="0.72" stroke-linecap="round" ${NSS}/>
${roadsIn(c).filter((rd) => rd.cls !== 'bridge' && rd.cls !== 'pier').map((rd) => `<path d="${pl(C.offset(rd.pts, rd.w / 2))}" /><path d="${pl(C.offset(rd.pts, -rd.w / 2))}"/>`).join('').replace(/\/>/g, ` fill="none" stroke="${INK}" stroke-width="${c.s < 1.5 ? 0.6 : 1}" stroke-opacity="0.75" stroke-linecap="round" ${NSS}/>`)}
<path d="${RIVER_D}" fill="none" stroke="${INK}" stroke-width="1.3" stroke-opacity="0.8" ${NSS}/>
${roadsIn(c, (rd) => rd.cls === 'bridge' || rd.cls === 'pier').map((rd) => `<path d="${pl(rd.pts)}" stroke="${PAPER}" stroke-width="${rd.w}" fill="none"/><path d="${pl(C.offset(rd.pts, rd.w / 2))}"/><path d="${pl(C.offset(rd.pts, -rd.w / 2))}"/>`).join('').replace(/<path d="([^"]*)"\/>/g, `<path d="$1" fill="none" stroke="${INK}" stroke-width="1" stroke-opacity="0.8" ${NSS}/>`)}
<path d="${pierD()}" fill="${PAPER}" stroke="${INK}" stroke-width="1" stroke-opacity="0.8" ${NSS}/>
<g fill="none" stroke="${INK}" stroke-width="0.6" opacity="0.5">${C.TREES.filter((t) => inView(c.view, [t])).map(([x, y, rr]) => { const R = Math.max(rr * 1.1, 1.4 / c.s); return `<path d="M${r(x - R)} ${r(y)}a${r(R, 2)} ${r(R * 0.9, 2)} 0 1 1 ${r(R * 1.6, 2)} ${r(R * 0.5, 2)}" ${NSS}/>` }).join('')}</g>
<path d="${siteD()}" fill="${PAPER}"/>`)
  },
}

const inPoly = (p, q) => C.inPoly(p[0], p[1], q)

function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lo = []
  for (const q of p) { while (lo.length >= 2 && cross(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q) }
  const up = []
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cross(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q) }
  return [...lo.slice(0, -1), ...up.slice(0, -1)]
}

/* ── Street names, at street distance ───────────────────────────────── */

function names(c, style) {
  if (c.s < 1.5 || c.s > 12) return ''
  const fs = 12
  const o = { anchor: 'middle', spacing: 3, opacity: style === 'nolli' ? 0.9 : 0.55, weight: 600, fill: INK }
  const at = (x, y, t, rot = 0) => {
    const sx = c.X(x)
    const sy = c.Y(y)
    if (sx < PX + 80 || sx > PR - 80 || sy < PY + 30 || sy > PB - 30) return ''
    return txt(sx, sy + 4, fs, t.toUpperCase(), { ...o, rot })
  }
  return at(95, C.STOCK_Y, 'Main Street') + at(-60, C.STOCK_Y - 2, 'Main Street Bridge') + at(C.BALLS[0][0], C.STOCK_Y - C.BALL_R - 14, 'West Circle')
    + at(40, 250, 'The River', -78) + at(-200, 420, 'Hillside Drive', -88) + at(C.SHANK_X, 420, 'High Street', -90)
}

/* ── The plans, five ways ────────────────────────────────────────────── */

export const DASH = { solid: '', dash: '14 7', dot: '2 7', dashdot: '16 6 3 6', longdash: '26 9' }

function planSvg(style, c, time, uid) {
  const P = planAt(time)
  const { job } = P
  const rooms = job.rooms.filter((rm) => rm[2] !== 'MAIN STREET')
  const hand = style === 'pencil'
  const A = (p) => [c.X(p[0] + job.o[0]), c.Y(p[1] + job.o[1])]
  const s = c.s
  const pen = (kind) => Math.max(kind === 'int' ? 1.4 : 2.4, THICK[kind] * s)
  const fs = 13
  let out = ''

  // Ground under the building: the lot.
  const [lx, ly] = A([0, 0])
  const lw = job.w * s
  const lh = job.h * s

  // Rooms toned by use.
  if (style === 'nolli') {
    for (const rm of job.roomRects) if (!rm.pub) { const [x, y] = A([rm.x, rm.y]); out += `<rect x="${r(x)}" y="${r(y)}" width="${r(rm.w * s)}" height="${r(rm.h * s)}" fill="${INK}" opacity="0.86"/>` }
  }
  if (style === 'atlas') {
    out += `<defs>${hatchScreen(`${uid}-pr`, 7, -45, 0.6, 0.35)}</defs>`
    for (const rm of job.roomRects) if (!rm.pub) { const [x, y] = A([rm.x, rm.y]); out += `<rect x="${r(x)}" y="${r(y)}" width="${r(rm.w * s)}" height="${r(rm.h * s)}" fill="url(#${uid}-pr)"/>` }
  }
  if (style === 'pencil') {
    out += `<defs>${hatchScreen(`${uid}-pr`, 9, 35, 0.7, 0.3)}</defs>`
    const [x, y] = A([0, 0])
    out += `<rect x="${r(x)}" y="${r(y)}" width="${r(lw)}" height="${r(8 * s)}" fill="url(#${uid}-pr)"/>`
  }

  // The take, cameras, furniture.
  out += `<defs><pattern id="${uid}-take" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="1.6" fill="${GREEN}"/></pattern></defs>`
  for (const it of job.items) {
    const [x, y] = A([it.x, it.y])
    if (it.k === 'take') out += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="${PAPER}"/><rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="url(#${uid}-take)" stroke="${GREEN}" stroke-width="1.6"/>`
    if (it.k === 'rect' && style === 'pencil') {
      const [x1, y1] = [x + it.w * s, y + it.h * s]
      const o = 9
      out += `<path d="M${r(x - o)} ${r(y)}H${r(x1 + o * 0.6)}M${r(x - o * 0.5)} ${r(y1)}H${r(x1 + o)}M${r(x)} ${r(y - o)}V${r(y1 + o * 0.7)}M${r(x1)} ${r(y - o * 0.6)}V${r(y1 + o)}" stroke="${INK}" stroke-width="1" stroke-opacity="0.8" stroke-linecap="round" fill="none"/>`
    } else if (it.k === 'rect') out += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="none" stroke="${INK}" stroke-width="1.1"/>`
    if (it.k === 'cam') {
      const reach = 7 * s
      const a0 = ((it.dir - 24) * Math.PI) / 180
      const a1 = ((it.dir + 24) * Math.PI) / 180
      out += `<path d="M${r(x)} ${r(y)}L${r(x + Math.cos(a0) * reach)} ${r(y + Math.sin(a0) * reach)}A${r(reach)} ${r(reach)} 0 0 1 ${r(x + Math.cos(a1) * reach)} ${r(y + Math.sin(a1) * reach)}Z" fill="${INK}" opacity="0.07"/><circle cx="${r(x)}" cy="${r(y)}" r="${r(0.35 * s)}" fill="${INK}"/>`
    }
  }
  // Doors.
  let sw = ''
  for (const dr of P.doors) {
    const [hx, hy] = A(dr.hinge)
    const [jx, jy] = A(dr.jamb)
    const vx = jx - hx
    const vy = jy - hy
    const [nx, ny] = dr.swing > 0 ? [-vy, vx] : [vy, -vx]
    sw += `M${r(hx)} ${r(hy)}L${r(hx + nx)} ${r(hy + ny)}A${r(Math.hypot(vx, vy))} ${r(Math.hypot(vx, vy))} 0 0 ${dr.swing > 0 ? 0 : 1} ${r(jx)} ${r(jy)}`
  }
  out += `<path d="${sw}" stroke="${INK}" stroke-width="0.9" fill="none"${style === 'pencil' ? ' opacity="0.7"' : ''}/>`

  // Walls.
  const rectOf = (q) => {
    const th = (q.kind === 'int' ? Math.max(THICK.int, 1.4 / s) : THICK[q.kind]) * (style === 'nolli' ? 1.9 : style === 'atlas' ? 1.5 : 1)
    const [ax, ay] = q.a
    const [bx, by] = q.b
    const x0 = Math.min(ax, bx) - th / 2
    const y0 = Math.min(ay, by) - th / 2
    return { x0, y0, x1: Math.max(ax, bx) + th / 2, y1: Math.max(ay, by) + th / 2 }
  }
  if (style === 'now') {
    for (const kind of ['int', 'ext', 'heavy']) out += `<path d="${P.segs.filter((q) => q.kind === kind).map((q) => { const [a, b] = [A(q.a), A(q.b)]; return `M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}` }).join('')}" stroke="${INK}" stroke-width="${r(pen(kind))}" stroke-linecap="square" fill="none"/>`
  } else if (style === 'nolli') {
    out += `<path d="${P.segs.map((q) => { const R = rectOf(q); const [a, b] = [A([R.x0, R.y0]), A([R.x1, R.y1])]; return `M${r(a[0])} ${r(a[1])}H${r(b[0])}V${r(b[1])}H${r(a[0])}Z` }).join('')}" fill="${INK}"/>`
  } else if (style === 'atlas') {
    out += `<defs>${hatchScreen(`${uid}-wl`, 3, 45, 0.8, 1, true)}</defs>`
    out += `<path d="${P.segs.map((q) => { const R = rectOf(q); const [a, b] = [A([R.x0, R.y0]), A([R.x1, R.y1])]; return `M${r(a[0])} ${r(a[1])}H${r(b[0])}V${r(b[1])}H${r(a[0])}Z` }).join('')}" fill="url(#${uid}-wl)" stroke="${INK}" stroke-width="1"/>`
  } else if (style === 'pencil') {
    const g = rng(3)
    out += `<defs>${hatchScreen(`${uid}-wl`, 4.2, 50, 1, 0.75)}</defs>`
    let lines = ''
    let fill = ''
    for (const q of P.segs) {
      const R = rectOf(q)
      const [a, b] = [A([R.x0, R.y0]), A([R.x1, R.y1])]
      fill += `M${r(a[0])} ${r(a[1])}H${r(b[0])}V${r(b[1])}H${r(a[0])}Z`
      const ov = 16
      const j = () => (g() - 0.5) * 2.4
      if (b[0] - a[0] > b[1] - a[1]) {
        lines += `M${r(a[0] - ov * g())} ${r(a[1] + j())}L${r(b[0] + ov * g())} ${r(a[1] + j())}M${r(a[0] - ov * g())} ${r(b[1] + j())}L${r(b[0] + ov * g())} ${r(b[1] + j())}`
      } else {
        lines += `M${r(a[0] + j())} ${r(a[1] - ov * g())}L${r(a[0] + j())} ${r(b[1] + ov * g())}M${r(b[0] + j())} ${r(a[1] - ov * g())}L${r(b[0] + j())} ${r(b[1] + ov * g())}`
      }
    }
    out += `<path d="${fill}" fill="url(#${uid}-wl)"/><path d="${lines}" stroke="${INK}" stroke-width="1.2" stroke-opacity="0.8" stroke-linecap="round" fill="none"/><path d="${lines}" transform="translate(0.9 0.7)" stroke="${INK}" stroke-width="0.7" stroke-opacity="0.45" stroke-linecap="round" fill="none"/>`
  } else if (style === 'model') {
    const H = 2.2 * s * 0.62
    const prisms = P.segs.map((q) => rectOf(q)).sort((p, q) => p.y1 - q.y1)
    for (const R of prisms) {
      const [a, b] = [A([R.x0, R.y0]), A([R.x1, R.y1])]
      const base = [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]]
      const top = base.map(([x, y]) => [x + H * 0.32, y - H])
      out += `<path d="${qd(convexHull([...base, ...top]))}" fill="#a99f8a"/><path d="${qd(top)}" fill="${INK}"/>`
    }
  }
  // Windows.
  for (const [x0, y0, x1, y1] of job.windows) {
    const [a, b] = A([x0, y0])
    const [cc, d] = A([x1, y1])
    if (style === 'model') continue
    out += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(cc)}" y2="${r(d)}" stroke="${PAPER}" stroke-width="${r(pen('ext') * (style === 'nolli' ? 1.9 : style === 'atlas' ? 1.5 : 1) - 2)}"/><line x1="${r(a)}" y1="${r(b)}" x2="${r(cc)}" y2="${r(d)}" stroke="${INK}" stroke-width="0.8"/>`
  }

  // Words.
  const italic = style === 'pencil'
  for (const [x, y, t, pub] of rooms) {
    const [sx, sy] = A([x, y])
    const dark = style === 'nolli' && !pub
    out += txt(sx, sy, hand ? 17 : fs, hand ? t.toLowerCase() : t, { anchor: 'middle', spacing: hand ? 0.5 : 2.4, opacity: dark ? 0.95 : 0.7, fill: dark ? PAPER : INK, font: hand ? HAND : null })
  }
  for (const it of job.items) {
    if (!it.label) continue
    const [x, y] = A([it.x + it.w / 2, it.y + it.h / 2])
    const big = it.w * s > it.label.length * fs * 0.62
    out += txt(x, big ? y + fs * 0.35 : A([0, it.y + it.h])[1] + fs * 1.2, hand ? 15 : fs * 0.82, hand ? it.label.toLowerCase() : it.label, { fill: it.k === 'take' ? GREEN : INK, anchor: 'middle', spacing: hand ? 0.4 : 1.6, weight: hand ? 400 : 600, font: hand ? HAND : null, halo: PAPER })
  }
  if (style === 'atlas') {
    // The atlas's own marks: storeys, construction, the fire wall.
    const [bx, by] = A([3.4, 23.6])
    out += `<circle cx="${r(bx)}" cy="${r(by)}" r="11" fill="${PAPER}" stroke="${INK}"/>${txt(bx, by + 4.4, 12, '2', { anchor: 'middle', weight: 700 })}`
    const [vx, vy] = A([28.6, 7.6])
    out += txt(vx, vy, 10, 'FIREPROOF VAULT · STEEL DR.', { anchor: 'middle', spacing: 1.2, weight: 600, opacity: 0.8 })
    const [ex, ey] = A([-2.6, 13])
    out += txt(ex, ey, 10, 'BRICK · 1871 · 2 ST.', { anchor: 'middle', spacing: 1.4, rot: -90, weight: 600, opacity: 0.8 })
  }
  // Dimension.
  const [dx0, dy] = A([0, -2.2])
  const [dx1] = A([job.w, 0])
  out += `<path d="M${r(dx0)} ${r(dy)}H${r(dx1)}M${r(dx0)} ${r(dy - 6)}v12M${r(dx1)} ${r(dy - 6)}v12M${r(dx0 - 4)} ${r(dy + 4)}l8 -8M${r(dx1 - 4)} ${r(dy + 4)}l8 -8" stroke="${INK}" stroke-width="0.9" fill="none" opacity="0.8"/>`
  out += `<rect x="${r((dx0 + dx1) / 2 - 32)}" y="${r(dy - 10)}" width="64" height="20" fill="${style === 'nolli' ? PAPER : PAPER}"/>${txt((dx0 + dx1) / 2, dy + 4.6, hand ? 16 : 12, `${job.w.toFixed(2)} m`, { anchor: 'middle', spacing: 1, font: hand ? HAND : null })}`

  // Guards.
  for (const gd of P.guards) {
    const d = gd.pts.map((p, i) => { const [x, y] = A(p); return `${i ? 'L' : 'M'}${r(x)} ${r(y)}` }).join('')
    const [gx, gy] = A(gd.at)
    out += `<path d="${d}" stroke="${INK}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round" fill="none" opacity="0.6"/><circle cx="${r(gx)}" cy="${r(gy)}" r="7" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><circle cx="${r(gx)}" cy="${r(gy)}" r="2.4" fill="${INK}"/>`
  }
  // Crew.
  for (const cr of P.crew) {
    if (!cr.w) continue
    const pts = cr.w.walked.map(A)
    if (style === 'pencil') {
      const g = rng(cr.n * 17)
      const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x + (g() - 0.5) * 1.5)} ${r(y + (g() - 0.5) * 1.5)}`).join('')
      out += `<path d="${d}" stroke="${RED}" stroke-width="2.6" stroke-opacity="0.9" stroke-linejoin="round" stroke-linecap="round"${DASH[cr.style] ? ` stroke-dasharray="${DASH[cr.style]}"` : ''} fill="none"/>`
      // Arrowheads on the long legs.
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1]
        const [bx, by] = pts[i]
        const L = Math.hypot(bx - ax, by - ay)
        if (L < 60) continue
        const ux = (bx - ax) / L
        const uy = (by - ay) / L
        const mx = (ax + bx) / 2
        const my = (ay + by) / 2
        out += `<path d="M${r(mx - ux * 9 + uy * 6)} ${r(my - uy * 9 - ux * 6)}L${r(mx)} ${r(my)}L${r(mx - ux * 9 - uy * 6)} ${r(my - uy * 9 + ux * 6)}" stroke="${RED}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      }
    } else {
      out += `<path d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x)} ${r(y)}`).join('')}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round"${DASH[cr.style] ? ` stroke-dasharray="${DASH[cr.style]}"` : ''} fill="none"/>`
    }
    for (const n of cr.w.notes) {
      const [x, y] = A(n)
      out += `<path d="M${r(x + 6)} ${r(y - 5)}L${r(x + 14)} ${r(y - 11)}" stroke="${INK}" stroke-width="0.9"/>${txt(x + 16, y - 14, hand ? 19 : fs * 1.08, n[3], { italic: !hand, font: hand ? HAND : null, ...(style === 'nolli' && job.roomRects.some((rm) => !rm.pub && n[0] >= rm.x && n[0] <= rm.x + rm.w && n[1] >= rm.y && n[1] <= rm.y + rm.h) ? { fill: PAPER } : { halo: PAPER }) })}`
    }
    const [hx, hy] = A(cr.w.at)
    out += `<circle cx="${r(hx)}" cy="${r(hy)}" r="10.5" fill="${RED}"/>${txt(hx, hy + 4.6, 13, String(cr.n), { fill: PAPER, anchor: 'middle', weight: 700 })}`
  }
  return out
}

export const hatchScreen = (id, gap, ang, w, op, cross = false) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})"><line x1="0" y1="0" x2="${gap}" y2="0" stroke="${INK}" stroke-width="${w}" opacity="${op}"/>${cross ? `<line x1="0" y1="0" x2="0" y2="${gap}" stroke="${INK}" stroke-width="${w}" opacity="${op}"/>` : ''}</pattern>`

/* ── Screen furniture ────────────────────────────────────────────────── */

export function titleBlock(lines) {
  const w = 340
  const h = 112
  const x = PR - w - 22
  const y = PB - h - 22
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>
  <line x1="${x}" y1="${y + 30}" x2="${x + w}" y2="${y + 30}" stroke="${INK}" stroke-width="1"/>
  <line x1="${x}" y1="${y + 80}" x2="${x + w}" y2="${y + 80}" stroke="${INK}" stroke-width="1"/>
  ${txt(x + 14, y + 20, 12, 'PLANS FOR', { spacing: 4, opacity: 0.7 })}
  ${txt(x + w - 14, y + 20, 12, 'CONMAN', { fill: RED, spacing: 4, anchor: 'end', weight: 700 })}
  ${txt(x + 14, y + 64, 24, lines[0], { weight: 600, spacing: 2 })}
  ${txt(x + 14, y + 101, 12, lines[1], { spacing: 2.4 })}
  ${txt(x + w - 14, y + 101, 12, lines[2], { spacing: 2.4, anchor: 'end', opacity: 0.7 })}`
}
function legend(time) {
  const P = planAt(time)
  const x = PX + 22
  const y = PY + 22
  const w = 250
  const h = 40 + P.crew.length * 26 + 26
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>${txt(x + 14, y + 24, 12, 'THE CREW', { spacing: 4, opacity: 0.7 })}`
  let ry = y + 52
  for (const cr of P.crew) {
    s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${RED}" stroke-width="3.4"${DASH[cr.style] ? ` stroke-dasharray="${DASH[cr.style]}"` : ''}/><circle cx="${x + 82}" cy="${ry - 4}" r="8.6" fill="${RED}"/>${txt(x + 82, ry, 11, String(cr.n), { fill: PAPER, anchor: 'middle', weight: 700 })}${txt(x + 100, ry + 1, 14, cr.role)}`
    ry += 26
  }
  s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${INK}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round"/><circle cx="${x + 82}" cy="${ry - 4}" r="6" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>${txt(x + 100, ry + 1, 14, 'The guard')}`
  return s
}
export function north() {
  const nx = PR - 60
  const ny = PY + 66
  return `<g opacity="0.75"><circle cx="${nx}" cy="${ny}" r="24" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/><path d="M${nx} ${ny - 30}L${nx + 9} ${ny + 14}L${nx} ${ny + 6}L${nx - 9} ${ny + 14}Z" fill="${INK}"/>${txt(nx, ny - 36, 13, 'N', { anchor: 'middle', weight: 600 })}</g>`
}
export function lyric(text) {
  return txt(800, COVER_SHEET.lyricY + 11, 31, text, { anchor: 'middle', weight: 700, spacing: 0.4 })
}

/* ── A frame ─────────────────────────────────────────────────────────── */

const KEY_LABELS = [
  [1, 'Record Shop'], [2, 'Counting House'], [3, 'Studio'], [4, 'Museum'], [5, 'New job'], [6, 'Concert Hall'],
]

/**
 * view: overview | mid | plan | key. red: how much of the anchor the getaways
 * have left (true for all of it, or a list of lines).
 */
export function frame({ style, view, red = false, uid = 'x', time = 66 }) {
  const c = CAMS[view === 'key' ? 'overview' : view]
  const town = view === 'plan' ? `<g opacity="0.55">${TOWNS[style](c, uid)}</g>` : TOWNS[style](c, uid)
  let top = ''
  if (view === 'plan') top += planSvg(style, c, time, uid)
  if (red) top += world(c, redSvg(c, red === true ? C.ANCHOR_LINES : red, view === 'overview' || view === 'key' ? 3.6 : 5))
  if (view === 'mid') {
    // The first getaway on its way: out of the shop, round the west circle, along Main Street.
    const shop = C.SITES[0]
    const run = [[shop.o[0] + 13, shop.o[1] + shop.h], [shop.o[0] + 13, C.STOCK_Y - 3], [C.BALLS[0][0] + C.BALL_R, C.STOCK_Y - 3]]
    const round = C.arcPts(C.BALLS[0], C.BALL_R, C.BALL_R, 0, -Math.PI * 1.55, 3)
    top += world(c, redSvg(c, [run, round], 5))
    const head = round.at(-1)
    top += `<circle cx="${r(c.X(head[0]))}" cy="${r(c.Y(head[1]))}" r="9" fill="${RED}"/>`
  }
  if (view !== 'plan') top += sitesSvg(c, { key: view === 'key', built: view === 'mid' ? [1] : [] })
  if (view === 'mid') {
    // The shop, built, small.
    const s0 = C.SITES[0]
    top += `<rect x="${r(c.X(s0.o[0]))}" y="${r(c.Y(s0.o[1]))}" width="${r(s0.w * c.s)}" height="${r(s0.h * c.s)}" fill="none" stroke="${INK}" stroke-width="2.4"/>`
  }
  if (view === 'key') {
    for (const [no, name] of KEY_LABELS) {
      const st = C.SITES[no - 1]
      const x = c.X(st.o[0] + st.w / 2)
      const y = c.Y(st.o[1] + st.h / 2)
      const left = no === 5 || no === 1
      const below = no === 6
      top += `<rect x="${r(left ? x - 22 - name.length * 8.6 : x + 18)}" y="${r(below ? y + 16 : y - 11)}" width="${r(name.length * 8.6 + 6)}" height="22" fill="${PAPER}" opacity="0.88"/>`
      top += txt(left ? x - 19 : x + 21, (below ? y + 32 : y + 5), 14, name.toUpperCase(), { anchor: left ? 'end' : 'start', weight: 700, spacing: 1.2 })
    }
  }
  top += names(c, style)
  let furniture = north()
  if (view === 'plan') furniture += legend(time) + titleBlock(['THE COUNTING HOUSE', 'JOB No. 2 · 1971', 'SHEET 2/7'])
  if (view === 'overview' || view === 'key') furniture += titleBlock(['THE CAREER', 'JOBS 1–6 · 1968–2025', 'SHEET 7/7'])
  const words = { overview: 'NO MATTER WHAT I DO, I ALWAYS SOUND THE SAME', key: 'NO MATTER WHAT I DO, I ALWAYS SOUND THE SAME', mid: "I'M A CONMAN", plan: "I'VE MADE A KILLING OFF OF MOVING FAST AND COOKING BOOKS" }[view]
  return `${paper(COVER_SHEET)}<defs><clipPath id="${uid}-plate"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
<g clip-path="url(#${uid}-plate)"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>${town}${top}${furniture}</g>${lyric(words)}`
}
