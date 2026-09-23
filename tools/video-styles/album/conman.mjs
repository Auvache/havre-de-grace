/*
 * Conman — track 2, line engraving. The album still, and the seed of the film.
 *
 * The song as a banknote. Everything on it is line: guilloche rosettes and
 * borders generated from polar sine curves, fine parallel hatching for tone,
 * an oval portrait frame with nobody in it — "don't be fooled by the way I
 * look" — and, as the vignette, the line the still is drawn on: lightning in
 * a bottle, engraved. Ink and banknote green. The one red thing is the
 * counterfeit serial, which in the film follows you round the note the way
 * the conman sticks to the shadows.
 *
 * Nothing fills except paper knockouts (the bolt, the empty sitter). Tone is
 * only ever line spacing and line crossing, which is what makes it read as an
 * engraving at contact-sheet size rather than as a drawing.
 *
 * Cheap on purpose: every hatch is a <pattern>, every guilloche ring is one
 * path and a handful of rotated <use>s of it (a phase shift of a polar sine is
 * a rotation), so the whole note is a few dozen kilobytes.
 */
import { t, rect, r, rng } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, SHEET, PAPER, INK, RED, SECOND_INK } from '../../../shared/video/album.mjs'

export const GREEN = SECOND_INK.conman

/* ── Patterns: the engraver's tools ───────────────────────────────── */

/** Parallel lines at `angle`, `gap` apart. Tone is gap and weight, never fill. */
export const hatch = (id, { angle = 0, gap = 5, width = 1, colour = INK } = {}) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="${gap / 2}" x2="${gap}" y2="${gap / 2}" stroke="${colour}" stroke-width="${width}"/></pattern>`

/** A braided guilloche band: four interlaced sine strands per 48-unit repeat. */
export const braid = (id, { colour = GREEN, rotate = 0 } = {}) =>
  `<pattern id="${id}" width="48" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotate})">
    <g fill="none" stroke="${colour}" stroke-width="0.9">
      <path d="M0 13 C12 -1 12 -1 24 13 S36 27 48 13"/>
      <path d="M0 13 C12 27 12 27 24 13 S36 -1 48 13"/>
      <path d="M0 13 C12 6 12 6 24 13 S36 20 48 13" stroke-width="0.6"/>
      <path d="M0 13 C12 20 12 20 24 13 S36 6 48 13" stroke-width="0.6"/>
    </g></pattern>`

/** The security ground under the whole note: a faint field of wavy lines. */
export const ground = (id) =>
  `<pattern id="${id}" width="60" height="7" patternUnits="userSpaceOnUse"><path d="M0 3.5 Q15 0.5 30 3.5 T60 3.5" fill="none" stroke="${GREEN}" stroke-width="0.6"/></pattern>`

/* ── Guilloche ────────────────────────────────────────────────────── */

/**
 * One guilloche ring: `copies` rotated strands of ρ(θ) = R(1 + a·sin(nθ)).
 * A phase shift of that sine is a rotation by phase/n, so the ring is one
 * sampled path and `copies - 1` <use>s — interlacing for a few hundred bytes.
 */
export function ring(id, cx, cy, R, { n = 18, a = 0.1, copies = 6, colour = GREEN, width = 0.8 } = {}) {
  const steps = n * 12
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2
    const rr = R * (1 + a * Math.sin(n * th))
    d += (i ? 'L' : 'M') + r(Math.cos(th) * rr) + ' ' + r(Math.sin(th) * rr)
  }
  const step = 360 / (n * copies)
  return `<g transform="translate(${r(cx)} ${r(cy)})" fill="none" stroke="${colour}" stroke-width="${width}">
    <path id="${id}" d="${d}Z"/>
    ${Array.from({ length: copies - 1 }, (_, k) => `<use href="#${id}" transform="rotate(${r(step * (k + 1), 2)})"/>`).join('')}
  </g>`
}

/** A hypotrochoid star for the heart of a rosette. */
export function star(cx, cy, R, { colour = GREEN, width = 0.7, k = 7 } = {}) {
  // Rolling circle of radius R/k inside R, pen at 0.8 of it: k lobes, closed after one turn.
  const b = R / k
  const dpen = b * 2.4
  let d = ''
  const steps = 720
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2
    const x = (R - b) * Math.cos(th) + dpen * Math.cos(((R - b) / b) * th)
    const y = (R - b) * Math.sin(th) - dpen * Math.sin(((R - b) / b) * th)
    d += (i ? 'L' : 'M') + r(cx + x * 0.55) + ' ' + r(cy + y * 0.55)
  }
  return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}"/>`
}

/** A full rosette: nested rings, a star, and fine concentric circles. */
export function rosette(uid, cx, cy, R) {
  return `
    ${ring(`${uid}-ra`, cx, cy, R, { n: 24, a: 0.06, copies: 5 })}
    ${ring(`${uid}-rb`, cx, cy, R * 0.8, { n: 16, a: 0.12, copies: 6 })}
    ${ring(`${uid}-rd`, cx, cy, R * 0.68, { n: 30, a: 0.05, copies: 3, colour: INK, width: 0.7 })}
    ${ring(`${uid}-rc`, cx, cy, R * 0.52, { n: 12, a: 0.18, copies: 7, colour: INK, width: 0.7 })}
    ${star(cx, cy, R * 0.6, { k: 9, colour: INK, width: 0.8 })}
    ${[0.2, 0.26, 0.32].map((f) => `<circle cx="${cx}" cy="${cy}" r="${r(R * f)}" fill="none" stroke="${INK}" stroke-width="0.8"/>`).join('')}`
}

/* ── The portrait with nobody in it ───────────────────────────────── */

/**
 * An engraved oval: horizontal line tone, darkened towards the rim by a
 * crossing hatch under a radial mask, and a sitter's silhouette left as bare
 * paper. The frame is a guilloche ring squashed to the oval, drawn with
 * non-scaling strokes so squashing it does not thin the line.
 */
export function emptyPortrait(uid, cx, cy, rx, ry) {
  // The sitter who is not there: a head a little off centre, three-quarter
  // turned, and shoulders that do not reach the frame. Burnished out rather
  // than cut out — the line tone continues through it at a quarter strength,
  // so it reads as an absence in an engraving and not as a blank avatar.
  const head = { x: cx + rx * 0.04, y: cy - ry * 0.2, rx: rx * 0.25, ry: ry * 0.24 }
  const shoulders = `M${r(cx - rx * 0.66)} ${r(cy + ry)} C${r(cx - rx * 0.62)} ${r(cy + ry * 0.45)} ${r(cx - rx * 0.3)} ${r(cy + ry * 0.3)} ${r(cx)} ${r(cy + ry * 0.28)} C${r(cx + rx * 0.34)} ${r(cy + ry * 0.3)} ${r(cx + rx * 0.64)} ${r(cy + ry * 0.47)} ${r(cx + rx * 0.7)} ${r(cy + ry)} Z`
  const neck = `M${r(cx - rx * 0.1)} ${r(head.y + head.ry * 0.7)} L${r(cx - rx * 0.12)} ${r(cy + ry * 0.32)} H${r(cx + rx * 0.14)} L${r(cx + rx * 0.12)} ${r(head.y + head.ry * 0.7)} Z`
  const sitter = (fill) => `<ellipse cx="${r(head.x)}" cy="${r(head.y)}" rx="${r(head.rx)}" ry="${r(head.ry)}" fill="${fill}"/><path d="${neck}" fill="${fill}"/><path d="${shoulders}" fill="${fill}"/>`
  return `
    <defs>
      ${hatch(`${uid}-ph`, { angle: 0, gap: 4.2, width: 1.05 })}
      ${hatch(`${uid}-px`, { angle: 62, gap: 4.6, width: 0.9 })}
      <radialGradient id="${uid}-pv" cx="0.5" cy="0.5" r="0.5"><stop offset="0.35" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
      <mask id="${uid}-pm" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>
        ${sitter('#8a8a8a')}
      </mask>
      <mask id="${uid}-pn" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>
        ${sitter('#000')}
      </mask>
      <mask id="${uid}-pr" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${uid}-pv)"/>
      </mask>
    </defs>
    <rect x="${cx - rx}" y="${cy - ry}" width="${rx * 2}" height="${ry * 2}" fill="url(#${uid}-ph)" mask="url(#${uid}-pm)"/>
    <g mask="url(#${uid}-pr)"><rect x="${cx - rx}" y="${cy - ry}" width="${rx * 2}" height="${ry * 2}" fill="url(#${uid}-px)" mask="url(#${uid}-pn)"/></g>
    <g transform="translate(${cx} ${cy}) scale(1 ${r(ry / rx, 4)}) translate(${-cx} ${-cy})">
      ${ring(`${uid}-pf`, cx, cy, rx + 22, { n: 40, a: 0.035, copies: 4, width: 0.9 }).replace(/<path /, '<path vector-effect="non-scaling-stroke" ').replace(/<use /g, '<use vector-effect="non-scaling-stroke" ')}
    </g>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx + 2}" ry="${ry + 2}" fill="none" stroke="${INK}" stroke-width="2.2"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx + 44}" ry="${ry + 44 * (ry / rx)}" fill="none" stroke="${INK}" stroke-width="1.4"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx + 50}" ry="${ry + 50 * (ry / rx)}" fill="none" stroke="${INK}" stroke-width="0.7"/>`
}

/* ── The vignette: lightning in a bottle ──────────────────────────── */

export function bottledLightning(uid, cx, top, { through = 1 } = {}) {
  const x0 = cx - 100
  const x1 = cx + 100
  const bottom = top + 440
  const body = `M${cx - 18} ${top + 22} V${top + 100} C${cx - 18} ${top + 140} ${x0} ${top + 150} ${x0} ${top + 200} V${bottom - 22} Q${x0} ${bottom} ${x0 + 22} ${bottom} H${x1 - 22} Q${x1} ${bottom} ${x1} ${bottom - 22} V${top + 200} C${x1} ${top + 150} ${cx + 18} ${top + 140} ${cx + 18} ${top + 100} V${top + 22} Z`
  // The bolt: a forked zigzag, knocked out of the glass tone — paper drawn
  // over a wider ink stroke, which is how an engraver leaves a white line with
  // an edge. Seeded, so it is the same bolt every frame.
  const rand = rng(1968)
  // Mostly down, in short sharp jogs that alternate side but drift — a zigzag
  // of equal swings reads as a spring.
  const trunk = [[cx + 8, top + 150]]
  let bx = cx + 8
  let by = top + 150
  for (let i = 1; i <= 6; i++) {
    bx += (i % 2 ? -1 : 1) * (22 + rand() * 18) + (rand() - 0.5) * 12
    by += 38 + rand() * 22
    trunk.push([bx, by])
  }
  const fork = (from, dir, n) => {
    const pts = [from]
    let [fx, fy] = from
    for (let i = 0; i < n; i++) { fx += dir * (10 + rand() * 12); fy += 16 + rand() * 14; pts.push([fx, fy]) }
    return pts
  }
  const forkA = fork(trunk[3], 1, 3)
  const forkB = fork(trunk[4], -1, 2)
  const poly = (pts) => 'M' + pts.map(([px, py]) => `${r(px)} ${r(py)}`).join(' L')
  const boltD = [trunk, forkA, forkB].map(poly).join(' ')
  // Engraved glare: fine lines radiating from the bolt, inside the glass only.
  const glare = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2
    const c = [cx, top + 280]
    return `M${r(c[0] + Math.cos(a) * 40)} ${r(c[1] + Math.sin(a) * 60)} L${r(c[0] + Math.cos(a) * 260)} ${r(c[1] + Math.sin(a) * 260)}`
  }).join('')
  // A burst behind the bottle, the engraver's halo.
  const burst = Array.from({ length: 90 }, (_, i) => {
    const a = (i / 90) * Math.PI * 2
    const c = [cx, top + 250]
    const r0 = 170
    const r1 = 250 + (i % 3) * 22
    return `M${r(c[0] + Math.cos(a) * r0)} ${r(c[1] + Math.sin(a) * r0)} L${r(c[0] + Math.cos(a) * r1)} ${r(c[1] + Math.sin(a) * r1)}`
  }).join('')
  return `
    <defs>
      <clipPath id="${uid}-glass"><path d="${body}"/></clipPath>
      <clipPath id="${uid}-shade"><rect x="${cx + 34}" y="${top}" width="80" height="460"/><rect x="${x0}" y="${bottom - 60}" width="220" height="70"/></clipPath>
      ${hatch(`${uid}-gh`, { angle: 0, gap: 5, width: 0.9 })}
      ${hatch(`${uid}-gd`, { angle: -48, gap: 4.4, width: 0.9 })}
      <radialGradient id="${uid}-bf" cx="0.5" cy="0.5" r="0.5"><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
      <mask id="${uid}-bm" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900"><circle cx="${cx}" cy="${top + 250}" r="320" fill="url(#${uid}-bf)"/></mask>
    </defs>
    <path d="${burst}" stroke="${GREEN}" stroke-width="1" mask="url(#${uid}-bm)"/>
    <g clip-path="url(#${uid}-glass)">
      <rect x="${x0}" y="${top}" width="200" height="460" fill="${PAPER}"/>
      <rect x="${x0}" y="${top}" width="200" height="460" fill="url(#${uid}-gh)" opacity="0.55"/>
      <rect x="${x0}" y="${top}" width="200" height="460" fill="url(#${uid}-gd)" clip-path="url(#${uid}-shade)"/>
      <path d="${glare}" stroke="${GREEN}" stroke-width="0.9" opacity="${r(0.3 + 0.5 * through, 3)}"/>
      <path d="${boltD}" fill="none" stroke="${INK}" stroke-width="13" stroke-linejoin="miter" stroke-linecap="round"/>
      <path d="${boltD}" fill="none" stroke="${PAPER}" stroke-width="8.5" stroke-linejoin="miter" stroke-linecap="round"/>
      <path d="${boltD}" fill="none" stroke="${INK}" stroke-width="0.8" opacity="0.6"/>
    </g>
    <path d="${body}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="${cx - 28}" y="${top}" width="56" height="26" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>
    ${[6, 12, 18].map((dy) => `<line x1="${cx - 26}" y1="${top + dy + 1}" x2="${cx + 26}" y2="${top + dy + 1}" stroke="${INK}" stroke-width="0.8"/>`).join('')}`
}

/** Engraved water: "pulled the clouds into the sea". */
export const sea = (x0, x1, y, rows = 7) =>
  `<path d="${Array.from({ length: rows }, (_, i) => {
    const yy = y + i * 9
    const amp = 3 + (i % 2)
    const len = 40 - i * 2
    let d = `M${x0} ${yy}`
    for (let x = x0; x < x1; x += len) d += ` q${r(len / 4)} ${-amp} ${r(len / 2)} 0 t${r(len / 2)} 0`
    return d
  }).join('')}" fill="none" stroke="${GREEN}" stroke-width="1"/>`

/** The counterfeit serial — the one red thing, and in the film the thing that moves. */
export const serial = (x, y, anchor = 'start', opacity = 1) =>
  t({ x, y, size: 30, text: 'HG 1968 · 2025', fill: RED, weight: 600, tracking: 6, anchor, opacity })

/* ── The frame ────────────────────────────────────────────────────── */

const HERO = { index: 3, text: 'Bottled lightning in several steady notes', words: [] }
HERO.words = HERO.text.split(' ').map((w, i) => ({ t: i * 0.4, text: w }))

export function heroFrame({ now = 0.9, uid = 'conman', line = HERO } = {}) {
  const { x, y, w, h } = SHEET.plate
  const clip = plateClip(uid)
  const b = 22 // border inset from the plate edge
  const bw = 26 // border width
  const inner = { x: x + b + bw + 8, y: y + b + bw + 8, w: w - 2 * (b + bw + 8), h: h - 2 * (b + bw + 8) }
  const microPath = `M${inner.x + 6} ${inner.y + 14} H${inner.x + inner.w - 6}`
  const microPath2 = `M${inner.x + 6} ${inner.y + inner.h - 5} H${inner.x + inner.w - 6}`
  const micro = 'DON’T BE FOOLED BY THE WAY I SHAKE · '.repeat(9)
  return `
    ${paper()}
    <defs>
      ${clip.def}
      ${ground(`${uid}-gr`)}
      ${braid(`${uid}-bh`)}
      ${braid(`${uid}-bv`, { rotate: 90 })}
      <path id="${uid}-m1" d="${microPath}"/><path id="${uid}-m2" d="${microPath2}"/>
    </defs>
    <g clip-path="${clip.url}">
      ${rect(x, y, w, h, PAPER)}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${uid}-gr)" opacity="0.45"/>
      <rect x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${bw}" fill="url(#${uid}-bh)"/>
      <rect x="${x + b}" y="${y + h - b - bw}" width="${w - 2 * b}" height="${bw}" fill="url(#${uid}-bh)"/>
      <rect x="${x + b}" y="${y + b}" width="${bw}" height="${h - 2 * b}" fill="url(#${uid}-bv)"/>
      <rect x="${x + w - b - bw}" y="${y + b}" width="${bw}" height="${h - 2 * b}" fill="url(#${uid}-bv)"/>
      <rect x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="none" stroke="${INK}" stroke-width="1.6"/>
      <rect x="${x + b + bw}" y="${y + b + bw}" width="${w - 2 * (b + bw)}" height="${h - 2 * (b + bw)}" fill="none" stroke="${INK}" stroke-width="1.2"/>
      ${[[x + b + bw / 2, y + b + bw / 2], [x + w - b - bw / 2, y + b + bw / 2], [x + b + bw / 2, y + h - b - bw / 2], [x + w - b - bw / 2, y + h - b - bw / 2]]
        .map(([cx, cy], i) => `<circle cx="${cx}" cy="${cy}" r="20" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>${ring(`${uid}-c${i}`, cx, cy, 13, { n: 10, a: 0.18, copies: 4, width: 0.6 })}`).join('')}
      <text font-size="10" font-weight="600" letter-spacing="1.6" fill="${GREEN}"><textPath href="#${uid}-m1">${micro}</textPath></text>
      <text font-size="10" font-weight="600" letter-spacing="1.6" fill="${GREEN}"><textPath href="#${uid}-m2">${micro}</textPath></text>

      ${rosette(`${uid}-ros`, 300, 372, 205)}
      ${emptyPortrait(`${uid}-por`, 760, 345, 146, 176)}
      ${t({ x: 760, y: 603, size: 19, text: 'Don’t be fooled by the way I look', fill: INK, anchor: 'middle', weight: 600, tracking: 4 })}
      ${sea(1080, 1470, 588, 5)}
      ${bottledLightning(`${uid}-bot`, 1270, 130, { through: 1 })}

      ${serial(inner.x + 18, inner.y + 52)}
      ${serial(inner.x + 18, inner.y + inner.h - 24)}
    </g>
    ${lyricMargin({ now, line, uid })}`
}

export default { slug: 'conman', hero: () => heroFrame({ uid: 'hero' }) }
