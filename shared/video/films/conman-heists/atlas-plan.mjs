/*
 * The insurance-atlas plan (chosen 2026-11-05), for any job: straight and
 * curved walls in hatched brick, glazing, doors, bins, stairs, booths, a fire
 * escape, the atlas's own marks (storeys, construction, dimensions), the owner
 * in ink and the crew in red. Jumps between floors are a red arc.
 */
import { COVER_SHEET, INK, PAPER, RED, SECOND_INK, paper } from '../../album.mjs'
import { TOWNS, cam, titleBlock, north, lyric, txt, hatchScreen, DASH } from './styles.mjs'

const GREEN = SECOND_INK.conman
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const r = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d
const lerp = (a, b, u) => a + (b - a) * u
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const rad = (d) => (d * Math.PI) / 180
const THICK = { ext: [0.5, 3.5, 12], int: [0.21, 2, 6], heavy: [0.9, 5, 18] }

/* ── Walking, with jumps ─────────────────────────────────────────────── */

const bulge = (a, b) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = Math.hypot(dx, dy)
  // Heading right it arcs over the top, heading left it comes back underneath.
  void L
  return [(a[0] + b[0]) / 2 + dy * 0.3, (a[1] + b[1]) / 2 - dx * 0.3]
}
const quad = (a, c, b, u) => [0, 1].map((k) => (1 - u) ** 2 * a[k] + 2 * (1 - u) * u * c[k] + u * u * b[k])

function walk(pts, from, to, time) {
  const holds = pts.reduce((s, p) => s + (p[2] || 0), 0)
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  const pace = Math.max(0.01, to - from - holds) / (lens.reduce((a, b) => a + b, 0) || 1)
  const arrive = [from]
  const leave = [from + (pts[0][2] || 0)]
  for (let i = 1; i < pts.length; i++) {
    arrive.push(leave[i - 1] + lens[i - 1] * pace)
    leave.push(arrive[i] + (pts[i][2] || 0))
  }
  if (time < from) return null
  const i = arrive.findLastIndex((a) => a <= time)
  const moving = !(time < leave[i] || i === pts.length - 1)
  const u = moving ? clamp01((time - leave[i]) / (arrive[i + 1] - leave[i])) : 1
  return { i, u: moving ? u : null, notes: pts.slice(0, i + 1).filter((p) => p[3]) }
}

/* ── The plan ────────────────────────────────────────────────────────── */

export function atlasPlan(job, c, time, uid) {
  const A = (p) => [c.X(p[0] + job.o[0]), c.Y(p[1] + job.o[1])]
  const s = c.s
  const O = A([0, 0])
  const fs = 13
  const th = (kind) => Math.min(THICK[kind][2], Math.max(THICK[kind][1], THICK[kind][0] * s))
  const poly = (pts) => `M${pts.map((p) => A(p).map((v) => r(v)).join(' ')).join('L')}Z`
  let out = `<defs>${hatchScreen(`${uid}-wl`, 3, 45, 0.8, 1, true)}${hatchScreen(`${uid}-tn`, 7, -45, 0.6, 0.35)}<pattern id="${uid}-take" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="1.6" fill="${GREEN}"/></pattern></defs>`

  // Sheets (a second floor drawn alongside), then the building's own ground.
  for (const sh of job.sheets ?? []) {
    const [x, y] = A([sh.x, sh.y])
    if (sh.h) out += `<rect x="${r(x)}" y="${r(y)}" width="${r(sh.w * s)}" height="${r(sh.h * s)}" fill="${PAPER}" stroke="${INK}" stroke-width="0.8" stroke-dasharray="2 3"/>`
    out += txt(x + 2, y - 8, 12, sh.label, { spacing: 3.2, weight: 600, opacity: 0.85 })
  }
  out += `<path d="${job.foot.map(poly).join('')}" fill="${PAPER}"/>`
  out += `<path d="${(job.tone ?? []).map(poly).join('')}" fill="url(#${uid}-tn)"/>`
  const ctx = { A, s, O, time, uid, poly, txt, annulus, arc, r, PAPER, INK, RED, GREEN }
  if (job.under) out += job.under(ctx)

  // Zones: what is above the cut (dash-dot) or below the floor (long dash), labelled.
  for (const z of job.items.filter((q) => q.k === 'zone')) {
    const [x, y] = A([z.x, z.y])
    out += `<rect x="${r(x)}" y="${r(y)}" width="${r(z.w * s)}" height="${r(z.h * s)}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-dasharray="${z.style === 'under' ? '18 6' : '14 4 2 4'}" opacity="0.75"/>`
  }

  // Things in the rooms.
  for (const it of job.items) {
    if (it.k === 'take') {
      const [x, y] = A([it.x, it.y])
      out += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="${PAPER}"/><rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="url(#${uid}-take)" stroke="${GREEN}" stroke-width="1.6"/>`
    } else if (it.k === 'loot') {
      // What was taken before: green, unlabelled.
      if (it.r) { const [x, y] = A([it.x, it.y]); out += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(it.r * s)}" fill="url(#${uid}-take)" stroke="${GREEN}" stroke-width="1.4"/>` }
      else { const [x, y] = A([it.x, it.y]); out += `<rect x="${r(x)}" y="${r(y)}" width="${r(it.w * s)}" height="${r(it.h * s)}" fill="url(#${uid}-take)" stroke="${GREEN}" stroke-width="1.4"/>` }
    } else if (it.k === 'cam') {
      // A camera: a small box and its fan of sight, dotted.
      const [x, y] = A([it.x, it.y])
      const reach = (it.reach ?? 7) * s
      const sp = it.spread ?? 22
      const p1 = [x + reach * Math.cos(rad(it.dir - sp)), y + reach * Math.sin(rad(it.dir - sp))]
      const p2 = [x + reach * Math.cos(rad(it.dir + sp)), y + reach * Math.sin(rad(it.dir + sp))]
      out += `<path d="M${r(x)} ${r(y)}L${r(p1[0])} ${r(p1[1])}A${r(reach)} ${r(reach)} 0 0 1 ${r(p2[0])} ${r(p2[1])}Z" fill="${INK}" fill-opacity="0.05" stroke="${INK}" stroke-width="0.8" stroke-dasharray="1 4" stroke-linecap="round"/><rect x="${r(x - 4)}" y="${r(y - 4)}" width="8" height="8" fill="${INK}" transform="rotate(${r(it.dir)} ${r(x)} ${r(y)})"/>`
    } else if (it.k === 'rect' || it.k === 'bins' || it.k === 'stairs' || it.k === 'escape') {
      const [x, y] = A([it.x, it.y])
      const w = it.w * s
      const h = it.h * s
      out += `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${it.k === 'escape' ? 'none' : PAPER}" stroke="${INK}" stroke-width="${it.k === 'escape' ? 0.9 : 1.1}"${it.k === 'escape' ? ' stroke-dasharray="4 3"' : ''}/>`
      const long = w >= h
      if (it.k === 'bins' || it.k === 'stairs') {
        const step = (it.k === 'bins' ? 0.55 : 0.3) * s
        const n = Math.floor((long ? w : h) / step)
        let d = ''
        for (let k = 1; k < n; k++) d += long ? `M${r(x + k * step)} ${r(y)}v${r(h)}` : `M${r(x)} ${r(y + k * step)}h${r(w)}`
        out += `<path d="${d}" stroke="${INK}" stroke-width="0.7" opacity="${it.k === 'bins' ? 0.7 : 0.9}"/>`
      }
      if (it.k === 'stairs') {
        const cx = x + w / 2
        const [y0, y1] = it.dir === 'up' ? [y + h - 4, y + 6] : [y + 4, y + h - 6]
        const ah = it.dir === 'up' ? 7 : -7
        out += `<path d="M${r(cx)} ${r(y0)}V${r(y1)}M${r(cx - 4)} ${r(y1 + ah)}L${r(cx)} ${r(y1)}L${r(cx + 4)} ${r(y1 + ah)}" stroke="${INK}" stroke-width="1.1" fill="none"/>`
      }
      if (it.k === 'escape') {
        let d = ''
        const n = 6
        for (let k = 0; k < n; k++) d += `M${r(x)} ${r(y + (k * h) / n)}L${r(x + w)} ${r(y + ((k + 1) * h) / n)}`
        out += `<path d="${d}" stroke="${INK}" stroke-width="0.8" opacity="0.8"/>`
      }
    } else if (it.k === 'ring') {
      const [x, y] = A([it.x, it.y])
      out += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(it.r * s)}" fill="none" stroke="${INK}" stroke-width="1"/>`
    } else if (it.k === 'rbin') {
      const a = rad(it.deg)
      const u = [Math.cos(a), Math.sin(a)]
      const n = [-u[1] * it.t / 2, u[0] * it.t / 2]
      const bc = it.c ?? [0, 0]
      const p0 = [bc[0] + u[0] * it.r0, bc[1] + u[1] * it.r0]
      const p1 = [bc[0] + u[0] * it.r1, bc[1] + u[1] * it.r1]
      const q = [[p0[0] + n[0], p0[1] + n[1]], [p1[0] + n[0], p1[1] + n[1]], [p1[0] - n[0], p1[1] - n[1]], [p0[0] - n[0], p0[1] - n[1]]]
      out += `<path d="${poly(q)}" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>`
      let d = ''
      for (let rr = it.r0 + 0.55; rr < it.r1; rr += 0.55) {
        const [ax, ay] = A([bc[0] + u[0] * rr + n[0], bc[1] + u[1] * rr + n[1]])
        const [bx, by] = A([bc[0] + u[0] * rr - n[0], bc[1] + u[1] * rr - n[1]])
        d += `M${r(ax)} ${r(ay)}L${r(bx)} ${r(by)}`
      }
      out += `<path d="${d}" stroke="${INK}" stroke-width="0.7" opacity="0.7"/>`
    } else if (it.k === 'arcbar') {
      out += `<path d="${annulus(it.c ? A(it.c) : O, (it.R - it.t / 2) * s, (it.R + it.t / 2) * s, it.d0, it.d1)}" fill="${PAPER}" stroke="${INK}" stroke-width="1.1"/>`
    }
  }

  // Doors.
  let sw = ''
  for (const dr of job.walls.doors) {
    const [hx, hy] = A(dr.hinge)
    const [jx, jy] = A(dr.jamb)
    const vx = jx - hx
    const vy = jy - hy
    const [nx, ny] = dr.swing > 0 ? [-vy, vx] : [vy, -vx]
    sw += `M${r(hx)} ${r(hy)}L${r(hx + nx)} ${r(hy + ny)}A${r(Math.hypot(vx, vy))} ${r(Math.hypot(vx, vy))} 0 0 ${dr.swing > 0 ? 0 : 1} ${r(jx)} ${r(jy)}`
  }
  out += `<path d="${sw}" stroke="${INK}" stroke-width="0.9" fill="none"/>`

  // Walls: hatched brick, straight or curved.
  let wd = ''
  for (const q of job.walls.segs) {
    const t = th(q.kind)
    if (q.arc) {
      wd += annulus(q.arc.c ? A(q.arc.c) : O, q.arc.R * s - t / 2, q.arc.R * s + t / 2, q.arc.d0, q.arc.d1)
      continue
    }
    const [a, b] = [A(q.a), A(q.b)]
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L]
    const n = [-u[1] * t / 2, u[0] * t / 2]
    const e = t / 2
    const a2 = [a[0] - u[0] * e, a[1] - u[1] * e]
    const b2 = [b[0] + u[0] * e, b[1] + u[1] * e]
    wd += `M${r(a2[0] + n[0])} ${r(a2[1] + n[1])}L${r(b2[0] + n[0])} ${r(b2[1] + n[1])}L${r(b2[0] - n[0])} ${r(b2[1] - n[1])}L${r(a2[0] - n[0])} ${r(a2[1] - n[1])}Z`
  }
  out += `<path d="${wd}" fill="url(#${uid}-wl)" stroke="${INK}" stroke-width="1"/>`

  // Glazing: the wall opened to paper, two fine lines across it. Loose panels: dashed.
  const tg = th('ext')
  for (const g of job.walls.glass) {
    if (g.arc) {
      const GO = g.arc.c ? A(g.arc.c) : O
      out += `<path d="${annulus(GO, g.arc.R * s - tg / 2 + 1, g.arc.R * s + tg / 2 - 1, g.arc.d0, g.arc.d1)}" fill="${PAPER}"/>`
      for (const dd of [-tg / 6, tg / 6]) out += `<path d="${arc(GO, g.arc.R * s + dd, g.arc.d0, g.arc.d1)}" stroke="${INK}" stroke-width="0.8" fill="none"/>`
      continue
    }
    const [a, b] = [A(g.a), A(g.b)]
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L]
    out += `<line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="${PAPER}" stroke-width="${r(tg - 2)}"/>`
    for (const dd of [-tg / 6, tg / 6]) out += `<line x1="${r(a[0] + n[0] * dd)}" y1="${r(a[1] + n[1] * dd)}" x2="${r(b[0] + n[0] * dd)}" y2="${r(b[1] + n[1] * dd)}" stroke="${INK}" stroke-width="0.8"/>`
  }
  for (const p of job.walls.panels) {
    const [a, b] = [A(p.a), A(p.b)]
    out += `<line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="${PAPER}" stroke-width="${r(th('int') - 1.4)}"/><line x1="${r(a[0])}" y1="${r(a[1])}" x2="${r(b[0])}" y2="${r(b[1])}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 2"/>`
  }

  // Words: rooms, things, the atlas's marks, storeys, dimensions.
  for (const [x, y, t, rot = 0, size = fs] of job.rooms) {
    const [sx, sy] = A([x, y])
    out += txt(sx, sy + size * 0.35, size, t, { anchor: 'middle', spacing: size < fs ? 0.5 : 2.4, opacity: 0.7, rot: rot || null, weight: size < fs ? 700 : 500 })
  }
  for (const z of job.items.filter((q) => q.k === 'zone' && q.label)) {
    const [x, y] = A([z.x, z.y])
    out += txt(x + 8, y + 16, 10.5, z.label, { spacing: 1.6, weight: 600, opacity: 0.8, halo: PAPER })
  }
  for (const it of job.items) {
    if (!it.label || it.k === 'stairs' || it.k === 'zone') continue
    const lf = fs * 0.82
    const fill = it.k === 'take' ? GREEN : INK
    const o = { fill, anchor: 'middle', spacing: 1.6, weight: 600, halo: PAPER }
    if (it.k === 'arcbar') {
      const bc = it.c ?? [0, 0]
      const [x, y] = A([bc[0] + Math.cos(rad((it.d0 + it.d1) / 2)) * (it.R - it.t - 0.6), bc[1] + Math.sin(rad((it.d0 + it.d1) / 2)) * (it.R - it.t - 0.6)])
      out += txt(x, y + lf * 0.35, lf, it.label, { ...o, rot: (it.d0 + it.d1) / 2 + 90 })
      continue
    }
    const [x0, y0] = A([it.x, it.y])
    const [x1, y1] = A([it.x + it.w, it.y + it.h])
    const cx = (x0 + x1) / 2
    const cy = (y0 + y1) / 2
    if (it.side === 'left') out += txt(x0 - 7, cy + lf * 0.35, lf, it.label, { ...o, anchor: 'end' })
    else if (it.side === 'right') out += txt(x1 + 7, cy + lf * 0.35, lf, it.label, { ...o, anchor: 'start' })
    else if (it.side === 'above') out += txt(cx, y0 - 6, lf, it.label, o)
    else out += txt(cx, y1 + lf * 1.25, lf, it.label, o)
  }
  for (const it of job.items.filter((q) => q.k === 'stairs')) {
    const [x0, y0] = A([it.x, it.y])
    out += txt(x0 + it.w * s + 5, y0 + (it.h * s) / 2 + 4, 11, it.label, { anchor: 'start', weight: 700, spacing: 1.4 })
  }
  for (const [x, y, t, rot = 0, side] of job.marks ?? []) {
    const [sx, sy] = A([x, y])
    out += txt(sx, sy + 3.6, 10, t, { anchor: side === 'right' ? 'start' : 'middle', spacing: 1.3, rot: rot || null, weight: 600, opacity: 0.8, halo: PAPER })
  }
  for (const [x, y, t] of job.storeys ?? []) {
    const [sx, sy] = A([x, y])
    out += `<circle cx="${r(sx)}" cy="${r(sy)}" r="12" fill="${PAPER}" stroke="${INK}"/>${txt(sx, sy + 4.4, t.length > 1 ? 10.5 : 12.5, t, { anchor: 'middle', weight: 700 })}`
  }
  for (const dm of job.dims ?? []) {
    const [a, b] = [A(dm.a), A(dm.b)]
    const L = Math.hypot(b[0] - a[0], b[1] - a[1])
    const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L]
    const n = [-u[1] * 6, u[0] * 6]
    const tick = (p) => `M${r(p[0] + n[0])} ${r(p[1] + n[1])}L${r(p[0] - n[0])} ${r(p[1] - n[1])}M${r(p[0] - 4 * (u[0] - u[1]))} ${r(p[1] - 4 * (u[1] + u[0]))}l${r(8 * (u[0] - u[1]))} ${r(8 * (u[1] + u[0]))}`
    out += `<path d="M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}${tick(a)}${tick(b)}" stroke="${INK}" stroke-width="0.9" fill="none" opacity="0.8"/>`
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    const rot = (Math.atan2(u[1], u[0]) * 180) / Math.PI
    const label = dm.text ?? `${(L / s).toFixed(2)} m`
    out += `<g transform="rotate(${r(rot > 90 ? rot - 180 : rot)} ${r(m[0])} ${r(m[1])})"><rect x="${r(m[0] - 30)}" y="${r(m[1] - 9)}" width="60" height="18" fill="${PAPER}"/>${txt(m[0], m[1] + 4.4, 12, label, { anchor: 'middle', spacing: 1 })}</g>`
  }

  // The owners, guards, ushers: ink, dotted where they pace, a ring where they are.
  for (const g of job.owners ?? (job.owner ? [job.owner] : [])) {
    const loop = [...g.pts, ...g.pts.slice(0, -1).reverse()]
    const lens = loop.slice(1).map((p, i) => Math.hypot(p[0] - loop[i][0], p[1] - loop[i][1]))
    let d = ((time / g.period) % 1) * lens.reduce((a, b) => a + b, 0)
    let at = loop[0]
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i]) { at = [lerp(loop[i][0], loop[i + 1][0], d / lens[i]), lerp(loop[i][1], loop[i + 1][1], d / lens[i])]; break }
      d -= lens[i]
    }
    const [gx, gy] = A(at)
    out += `<path d="${g.pts.map((p, i) => `${i ? 'L' : 'M'}${A(p).map((v) => r(v)).join(' ')}`).join('')}" stroke="${INK}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round" fill="none" opacity="0.6"/><circle cx="${r(gx)}" cy="${r(gy)}" r="7" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><circle cx="${r(gx)}" cy="${r(gy)}" r="2.4" fill="${INK}"/>`
  }

  // Figures who are not crew (the artist they follow): ink, walking a route once, a hollow ring.
  let top = ''
  for (const f of job.figures ?? []) {
    const w = walk(f.pts, f.from, f.to, time)
    if (!w) continue
    const pts = f.pts.map((p) => A(p))
    let d = `M${r(pts[0][0])} ${r(pts[0][1])}`
    let head = pts[w.i]
    const last = w.u == null ? w.i : w.i + 1
    for (let k = 1; k <= last; k++) {
      const part = k === w.i + 1 ? w.u : 1
      head = [lerp(pts[k - 1][0], pts[k][0], part), lerp(pts[k - 1][1], pts[k][1], part)]
      d += `L${r(head[0])} ${r(head[1])}`
    }
    out += `<path d="${d}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" fill="none" opacity="0.75"/>`
    for (const n of job.notes ? w.notes : []) {
      const [x, y] = A(n)
      top += `<path d="M${r(x + 6)} ${r(y - 5)}L${r(x + 14)} ${r(y - 11)}" stroke="${INK}" stroke-width="0.9"/>${txt(x + 16, y - 14, fs * 1.08, n[3], { italic: true, halo: PAPER })}`
    }
    top += `<circle cx="${r(head[0])}" cy="${r(head[1])}" r="9" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>${txt(head[0], head[1] + 4.2, 11.5, f.mark ?? '', { anchor: 'middle', weight: 700 })}`
  }

  // The crew.
  for (const cr of job.crew) {
    const w = walk(cr.pts, cr.from, cr.to, time)
    if (!w) continue
    const pts = cr.pts.map((p) => A(p))
    let d = `M${r(pts[0][0])} ${r(pts[0][1])}`
    let jumps = ''
    let head = pts[w.i]
    const last = w.u == null ? w.i : w.i + 1
    for (let k = 1; k <= last; k++) {
      const a = pts[k - 1]
      const b = pts[k]
      const part = k === w.i + 1 ? w.u : 1
      if (cr.pts[k][4] === 'jump') {
        const c0 = bulge(a, b)
        const n = 24
        let jd = `M${r(a[0])} ${r(a[1])}`
        for (let q = 1; q <= n * part; q++) { const p = quad(a, c0, b, q / n); jd += `L${r(p[0])} ${r(p[1])}` }
        const end = quad(a, c0, b, part)
        jd += `L${r(end[0])} ${r(end[1])}`
        jumps += `<path d="${jd}" stroke="${RED}" stroke-width="1.8" stroke-dasharray="2 5" stroke-linecap="round" fill="none"/>`
        d += `M${r(end[0])} ${r(end[1])}`
        head = end
      } else {
        const end = [lerp(a[0], b[0], part), lerp(a[1], b[1], part)]
        d += `L${r(end[0])} ${r(end[1])}`
        head = end
      }
    }
    out += `<path d="${d}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"${DASH[cr.style] ? ` stroke-dasharray="${DASH[cr.style]}"` : ''} fill="none"/>${jumps}`
    for (const n of job.notes ? w.notes : []) {
      const [x, y] = A(n)
      top += `<path d="M${r(x + 6)} ${r(y - 5)}L${r(x + 14)} ${r(y - 11)}" stroke="${INK}" stroke-width="0.9"/>${txt(x + 16, y - 14, fs * 1.08, n[3], { italic: true, halo: PAPER })}`
    }
    top += `<circle cx="${r(head[0])}" cy="${r(head[1])}" r="10.5" fill="${RED}"/>${txt(head[0], head[1] + 4.6, 13, String(cr.n), { fill: PAPER, anchor: 'middle', weight: 700 })}`
  }
  if (job.over) top += job.over(ctx)
  return out + top
}

/** An annular sector about screen point O, radii r0 < r1, degrees d0 < d1. */
function annulus(O, r0, r1, d0, d1) {
  const pt = (R, d) => [O[0] + R * Math.cos(rad(d)), O[1] + R * Math.sin(rad(d))]
  const large = d1 - d0 > 180 ? 1 : 0
  const [a, b, c, e] = [pt(r1, d0), pt(r1, d1), pt(r0, d1), pt(r0, d0)]
  return `M${r(a[0])} ${r(a[1])}A${r(r1)} ${r(r1)} 0 ${large} 1 ${r(b[0])} ${r(b[1])}L${r(c[0])} ${r(c[1])}A${r(r0)} ${r(r0)} 0 ${large} 0 ${r(e[0])} ${r(e[1])}Z`
}
function arc(O, R, d0, d1) {
  const pt = (d) => [O[0] + R * Math.cos(rad(d)), O[1] + R * Math.sin(rad(d))]
  const [a, b] = [pt(d0), pt(d1)]
  return `M${r(a[0])} ${r(a[1])}A${r(R)} ${r(R)} 0 0 1 ${r(b[0])} ${r(b[1])}`
}

/* ── The legend and the frame ────────────────────────────────────────── */

export function legend(job) {
  const x = PX + 22
  const y = PY + 22
  const owners = job.owners ?? (job.owner ? [job.owner] : [])
  // As wide as the longest name needs (Jost 14 runs about 7.4 px a character).
  const names = [...job.crew.map((cr) => cr.role), ...(job.figures ?? []).map((f) => f.label), job.ownerLabel ?? 'The owner']
  const w = Math.max(250, Math.ceil(100 + 7.4 * Math.max(...names.map((n) => n.length)) + 16))
  const rows = job.crew.length + (owners.length ? 1 : 0) + (job.figures?.length ?? 0)
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${40 + rows * 26}" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>${txt(x + 14, y + 24, 12, 'THE CREW', { spacing: 4, opacity: 0.7 })}`
  let ry = y + 52
  for (const cr of job.crew) {
    s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${RED}" stroke-width="3.4"${DASH[cr.style] ? ` stroke-dasharray="${DASH[cr.style]}"` : ''}/><circle cx="${x + 82}" cy="${ry - 4}" r="8.6" fill="${RED}"/>${txt(x + 82, ry, 11, String(cr.n), { fill: PAPER, anchor: 'middle', weight: 700 })}${txt(x + 100, ry + 1, 14, cr.role)}`
    ry += 26
  }
  for (const f of job.figures ?? []) {
    s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${INK}" stroke-width="1.6" opacity="0.75"/><circle cx="${x + 82}" cy="${ry - 4}" r="7.5" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>${txt(x + 82, ry, 9.5, f.mark ?? '', { anchor: 'middle', weight: 700 })}${txt(x + 100, ry + 1, 14, f.label)}`
    ry += 26
  }
  if (owners.length) s += `<line x1="${x + 14}" y1="${ry - 4}" x2="${x + 62}" y2="${ry - 4}" stroke="${INK}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round"/><circle cx="${x + 82}" cy="${ry - 4}" r="6" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>${txt(x + 100, ry + 1, 14, job.ownerLabel ?? (owners.length > 1 ? 'The guards' : 'The owner'))}`
  return s
}

/**
 * Any job's sheet. `job.sheet` = [name, 'JOB No. n · year', 'SHEET n/7'];
 * `job.words` the lyric under it; `time` defaults to just after the last
 * crew member's route ends (the whole route walked). `c` overrides the camera.
 */
export function jobFrame(job, { time, uid = job.key, words, c, townOpacity = 0.55 } = {}) {
  const t = time ?? (job.shotAt ?? Math.max(...job.crew.map((cr) => cr.to)) + 0.1)
  const cm = c ?? cam(job.o[0] + job.view[0], job.o[1] + job.view[1], job.view[2])
  const town = `<g opacity="${townOpacity}">${TOWNS.atlas(cm, uid)}</g>`
  const plan = atlasPlan(job, cm, t, uid)
  return `${paper(COVER_SHEET)}<defs><clipPath id="${uid}-plate"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
<g clip-path="url(#${uid}-plate)"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>${town}${plan}${north()}${legend(job)}${titleBlock(job.sheet ?? [job.title, '', ''])}</g>${lyric(words ?? job.words ?? '')}`
}

export function shopFrame(job, { time = 42.4, uid = job.key, words = "I'M A CONMAN" } = {}) {
  const c = cam(job.o[0] + job.view[0], job.o[1] + job.view[1], job.view[2])
  const town = `<g opacity="0.55">${TOWNS.atlas(c, uid)}</g>`
  const plan = atlasPlan(job, c, time, uid)
  return `${paper(COVER_SHEET)}<defs><clipPath id="${uid}-plate"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
<g clip-path="url(#${uid}-plate)"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>${town}${plan}${north()}${legend(job)}${titleBlock(['THE RECORD SHOP', 'JOB No. 1 · 1968', 'SHEET 1/7'])}</g>${lyric(words)}`
}
