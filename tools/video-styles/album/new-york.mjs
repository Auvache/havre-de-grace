/*
 * New York — track 6, letterpress. The album still, and the seed of the film.
 *
 * A wood-type broadside that is also a railway timetable. Every city the song
 * is told to move to — Memphis, Nashville, Austin, L.A., Detroit — is set as a
 * departure with the verb the song hands it (bargain, bend, abandon, exploit),
 * and the NOs are the headline, each one pulled a heavier impression than the
 * one before. New York is the last departure, set in red rule and struck
 * through: the one red thing, and the route the song refuses.
 *
 * Letterpress, not type: the headline is Jost 700 caps squeezed into a
 * condensed wood-type face with lengthAdjust="spacingAndGlyphs", and every
 * large sort carries an uneven impression — a seeded field of paper-coloured
 * specks clipped to the letterforms, heaviest where the ink ran thin. Brass
 * rules and diamond ornaments frame the forme; the poster-yellow second forme
 * prints a few units out of register behind the headline.
 */
import { t, rect, line, r, rng, advance } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, SHEET, PAPER, INK, RED, SECOND_INK } from '../../../shared/video/album.mjs'

export const YELLOW = SECOND_INK['new-york']

/* ── The press ────────────────────────────────────────────────────── */

/**
 * A field of paper specks, seeded: where the ink did not take. `density` is
 * specks per 10,000 square units. Clip it to a sort to texture the sort.
 */
export function specks(x, y, w, h, { seed = 1, density = 14, colour = PAPER, max = 3.2 } = {}) {
  const rand = rng(seed)
  const n = Math.round((w * h * density) / 10000)
  let d = ''
  for (let i = 0; i < n; i++) {
    const px = x + rand() * w
    const py = y + rand() * h
    const rr = 0.6 + rand() * rand() * max
    // A speck is a short horizontal smear — ink skips along the roller.
    d += `M${r(px - rr * 1.6)} ${r(py)}h${r(rr * 3.2)}`
    if (rand() < 0.25) d += `M${r(px)} ${r(py + rr)}h${r(rr * 1.4)}`
  }
  return `<path d="${d}" stroke="${colour}" stroke-width="${r(max * 0.7, 2)}" stroke-linecap="round" fill="none"/>`
}

/**
 * One wood-type sort, or a line of them: Jost 700 caps at `size`, squeezed to
 * `width` (condensing the glyphs as well as the spaces, which is the whole
 * look), with an impression texture clipped to the letterforms.
 */
export function woodType(uid, { x, y, size, text, width, fill = INK, anchor = 'start', impression = 0.5, seed = 1, opacity = 1 }) {
  const id = `${uid}-wt`
  const glyphs = `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="700" text-anchor="${anchor}" textLength="${r(width)}" lengthAdjust="spacingAndGlyphs">${String(text).toUpperCase()}</text>`
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x
  return `<g opacity="${r(opacity, 3)}">
    <clipPath id="${id}">${glyphs}</clipPath>
    ${glyphs.replace('<text ', `<text fill="${fill}" `)}
    <g clip-path="url(#${id})">${specks(left, y - size * 0.78, width, size * 0.82, { seed, density: 26 * (1 - impression) + 3, max: 2.4 + 2 * (1 - impression) })}</g>
  </g>`
}

/** A brass rule: a thick and a thin, the printer's double rule. */
export const brassRule = (x0, x1, y, { colour = INK } = {}) =>
  `${line(x0, y, x1, y, colour, 5)}${line(x0, y + 9, x1, y + 9, colour, 1.4)}`

/** A diamond ornament, the printer's fleuron at its plainest. */
export const diamond = (cx, cy, s = 8, fill = INK) =>
  `<path d="M${r(cx)} ${r(cy - s)}L${r(cx + s)} ${r(cy)}L${r(cx)} ${r(cy + s)}L${r(cx - s)} ${r(cy)}Z" fill="${fill}"/>`

/** A rule of ornaments between two points: diamonds with a hairline behind. */
export const ornamentRule = (x0, x1, y, n = 9) => {
  const out = [line(x0, y, x1, y, INK, 1.2)]
  for (let i = 0; i < n; i++) {
    const cx = x0 + ((i + 0.5) / n) * (x1 - x0)
    out.push(`<rect x="${r(cx - 16)}" y="${y - 10}" width="32" height="20" fill="${PAPER}"/>`, diamond(cx, y, i === (n - 1) / 2 ? 9 : 6))
  }
  return out.join('')
}

/**
 * A departure: city left, dotted leader, verb right. A row the song refuses is
 * set in red and struck through with a red rule — the route not taken.
 */
export function departure(uid, { x0, x1, y, city, verb, refused = false, seed = 1 }) {
  const size = 46
  const colour = refused ? RED : INK
  const cityW = Math.min(advance(city, size) * 0.82, (x1 - x0) * 0.55)
  const verbSize = 26
  const verbW = advance(verb, verbSize, 3)
  const lead = `<line x1="${r(x0 + cityW + 18)}" y1="${y - 4}" x2="${r(x1 - verbW - 18)}" y2="${y - 4}" stroke="${colour}" stroke-width="3" stroke-dasharray="0.1 11" stroke-linecap="round"/>`
  return `
    ${woodType(`${uid}-c`, { x: x0, y, size, text: city, width: cityW, fill: colour, impression: refused ? 0.8 : 0.55, seed })}
    ${lead}
    ${t({ x: x1, y: y - 2, size: verbSize, text: verb, fill: colour, anchor: 'end', weight: 600, tracking: 3 })}
    ${refused ? `${line(x0 - 8, y - size * 0.3, x1 + 8, y - size * 0.3, RED, 5, { cap: 'round' })}` : ''}`
}

/** Lights on the shore: a low headland in ink with poster-yellow lights and their rays. */
export function shoreLights(x0, x1, y, { seed = 6 } = {}) {
  const rand = rng(seed)
  let land = `M${x0} ${y + 40} L${x0} ${y + 14}`
  for (let x = x0; x <= x1; x += 40) land += ` L${r(x)} ${r(y + 12 - rand() * 10)}`
  land += ` L${x1} ${y + 40} Z`
  const lights = Array.from({ length: 11 }, (_, i) => {
    const cx = x0 + 40 + i * ((x1 - x0 - 80) / 10) + (rand() - 0.5) * 20
    const cy = y + 2 - rand() * 8
    const rays = Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * Math.PI * 2 + 0.3
      return `M${r(cx + Math.cos(a) * 9)} ${r(cy + Math.sin(a) * 9)}L${r(cx + Math.cos(a) * 17)} ${r(cy + Math.sin(a) * 17)}`
    }).join('')
    return `<circle cx="${r(cx)}" cy="${r(cy)}" r="5" fill="${YELLOW}"/><path d="${rays}" stroke="${YELLOW}" stroke-width="2.4" stroke-linecap="round"/>`
  }).join('')
  return `<path d="${land}" fill="${INK}"/>${lights}`
}

/* ── The frame ────────────────────────────────────────────────────── */

const HERO = { index: 8, text: 'No, I won\'t go, I\'m not going to New York', words: [] }
HERO.words = HERO.text.split(' ').map((w, i) => ({ t: i * 0.4, text: w }))

const DEPARTURES = [
  ['Memphis', 'Bargain'],
  ['Nashville', 'Bend'],
  ['Austin', 'Abandon'],
  ['L.A.', 'Exploit'],
  ['Detroit', 'Burn out the coals'],
  ['New York', 'Not going'],
]

export function heroFrame({ now = 1.9, uid = 'ny', line: lyric = HERO, nos = 4 } = {}) {
  const { x, y, w, h } = SHEET.plate
  const clip = plateClip(uid)
  const L = x + 60
  const R = x + w - 60
  // The headline. Each NO is a heavier pull than the one before — the song
  // gets more certain every time it says it.
  const noW = 300
  const gap = 46
  const total = 4 * noW + 3 * gap
  const nx0 = 800 - total / 2
  const headline = Array.from({ length: 4 }, (_, i) => {
    if (i >= nos) return ''
    return woodType(`${uid}-no${i}`, { x: nx0 + i * (noW + gap), y: 334, size: 244, text: 'No', width: noW, impression: 0.3 + i * 0.22, seed: 40 + i, opacity: 0.72 + i * 0.09 })
  }).join('')
  // The second forme: yellow blocks behind each NO, out of register by a few units.
  const yellow = Array.from({ length: 4 }, (_, i) =>
    i < nos ? rect(nx0 + i * (noW + gap) + 9, 148, noW - 4, 196, YELLOW, { opacity: 0.95 }) : '').join('')
  const colW = (R - L - 80) / 2
  const rows = DEPARTURES.map(([city, verb], i) => departure(`${uid}-d${i}`, {
    x0: i < 3 ? L : L + colW + 80,
    x1: i < 3 ? L + colW : R,
    y: 486 + (i % 3) * 60,
    city,
    verb,
    refused: city === 'New York',
    seed: 70 + i,
  })).join('')
  return `
    ${paper()}
    <defs>${clip.def}</defs>
    <g clip-path="${clip.url}">
      ${rect(x, y, w, h, PAPER)}
      ${brassRule(L, R, y + 36)}
      ${t({ x: 800, y: y + 86, size: 24, text: 'I don’t wanna follow those lights I see out on the shore', fill: INK, anchor: 'middle', weight: 600, tracking: 5 })}
      ${yellow}
      ${headline}
      ${ornamentRule(L, R, 372, 11)}
      ${t({ x: L, y: 420, size: 22, text: 'They said move to', fill: INK, weight: 600, tracking: 8 })}
      ${t({ x: R, y: 420, size: 22, text: 'Departures', fill: INK, weight: 600, tracking: 8, anchor: 'end' })}
      ${line(L, 436, R, 436, INK, 1.2)}
      ${rows}
      ${line(L + colW + 40, 452, L + colW + 40, 620, INK, 1.2)}
      ${shoreLights(x, x + w, 648)}
    </g>
    ${lyricMargin({ now, line: lyric, uid })}`
}

export default { slug: 'new-york', hero: () => heroFrame({ uid: 'hero' }) }
