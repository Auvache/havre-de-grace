/*
 * Meet Me at the Horizon — track 7, mezzotint. The album still, and the seed of
 * the film.
 *
 * A mezzotint is made backwards. The copper is rocked with a toothed rocker
 * until every millimetre is burred and the plate prints a solid, velvety black;
 * the picture is then scraped and burnished OUT of the dark — the more the burr
 * is flattened, the less ink it holds, the lighter it prints. So is this song: a
 * room at night, a bed, a window, a treeline, and a dawn burnished in slowly.
 *
 * The one thing that is red is the journey: the thin line of the horizon, where
 * the dawn comes in and where the song asks to be met. The second ink — dawn
 * gold — is used in the dawn only, never in the room.
 *
 * Everything here is a pure function of `now` (and, in the film, of how far
 * the dawn has been burnished: `dawn`, 0 at midnight and 1 at sunrise), so the
 * helpers below can be lifted into shared/video/films/ unchanged.
 */
import { rect, path, circle, rng, r } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, SHEET, INK, RED, SECOND_INK } from '../../../shared/video/album.mjs'

export const GOLD = SECOND_INK['meet-me-at-the-horizon']
/** Burnished tones between the album ink and the album paper — a mezzotint has no other colours. */
export const TONE = ['#1b1915', '#24211c', '#2f2b25', '#3d382f', '#554d41', '#766b5a', '#a09380', '#cfc3ab']

const P = SHEET.plate
const WIN = { x: 600, y: 96, w: 560, h: 474 }
const HORIZON = 408

/* ── Defs: the burnished gradients, the rocker grain, a soft edge ───── */

export function defs(uid, dawn = 0.35) {
  const g = (a, b, u) => mix(a, b, u)
  return `
    <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${TONE[0]}"/>
      <stop offset="0.35" stop-color="${g(TONE[1], TONE[3], dawn)}"/>
      <stop offset="0.62" stop-color="${g(TONE[3], TONE[6], dawn)}"/>
      <stop offset="0.72" stop-color="${g(TONE[5], '#e6dcc4', dawn)}"/>
      <stop offset="1" stop-color="${g(TONE[5], '#e6dcc4', dawn)}"/>
    </linearGradient>
    <radialGradient id="${uid}-dawn" cx="0.64" cy="0.87" r="0.6">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="${r(Math.min(1, 1.6 * dawn + 0.15), 3)}"/>
      <stop offset="0.4" stop-color="${GOLD}" stop-opacity="${r(0.55 * dawn, 3)}"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${uid}-shaft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${TONE[6]}" stop-opacity="${r(0.25 + 0.55 * dawn, 3)}"/>
      <stop offset="1" stop-color="${TONE[6]}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${uid}-spill" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${mix(TONE[5], GOLD, 0.25 * dawn)}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${TONE[5]}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${uid}-wall" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${TONE[0]}"/>
      <stop offset="0.42" stop-color="${TONE[2]}"/>
      <stop offset="0.58" stop-color="${TONE[2]}"/>
      <stop offset="1" stop-color="${TONE[0]}"/>
    </linearGradient>
    <filter id="${uid}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${uid}-bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="${uid}-rocker" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.06  0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 -3 1.55"/>
    </filter>
    <pattern id="${uid}-burr" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
      <circle cx="1.5" cy="1.5" r="0.95" fill="#000"/>
    </pattern>`
}

/* ── The room ─────────────────────────────────────────────────────── */

/** The wall, rocked to black and burnished faintly where the window light falls. */
export const wall = (uid) => `
  ${rect(P.x, P.y, P.w, P.h, `url(#${uid}-wall)`)}
  <ellipse cx="${WIN.x + WIN.w / 2 + 40}" cy="${WIN.y + WIN.h / 2}" rx="520" ry="340" fill="url(#${uid}-spill)" opacity="0.95" filter="url(#${uid}-bloom)"/>`

/** The window's light falling across the room onto the bed — burnished, soft-edged. */
export const shaft = (uid) => `
  <path d="M${WIN.x} ${WIN.y + WIN.h} L${WIN.x + WIN.w} ${WIN.y + WIN.h} L${WIN.x + WIN.w + 260} ${P.y + P.h} L${WIN.x - 120} ${P.y + P.h} Z" fill="url(#${uid}-shaft)" filter="url(#${uid}-bloom)"/>`

/** Through the window: sky, the dawn, the red horizon, the treeline. */
export function outside(uid, dawn, seed = 7) {
  const rand = rng(seed)
  const { x, y, w, h } = WIN
  // Stars, burnished pinpricks, going out as the dawn comes up.
  const stars = Array.from({ length: 26 }, () => {
    const sx = x + rand() * w
    const sy = y + rand() * (HORIZON - y - 90)
    return circle(sx, sy, 0.8 + rand() * 1.6, { fill: TONE[7], opacity: r((1 - dawn) * (0.35 + rand() * 0.6), 3) })
  }).join('')
  // A far ridge on the horizon, then a treeline of pines nearer and lower —
  // so the horizon itself is clear sky meeting land across the whole window,
  // and the red can run along it unbroken.
  let d = `M${x} ${HORIZON + 70}`
  let px = x
  while (px < x + w) {
    const step = 9 + rand() * 16
    const top = HORIZON + 30 - rand() * rand() * 58
    d += ` L${r(px + step * 0.5)} ${r(top)} L${r(px + step)} ${r(HORIZON + 44 + rand() * 12)}`
    px += step
  }
  d += ` L${x + w} ${y + h} L${x} ${y + h} Z`
  const ridge = `M${x} ${HORIZON} C ${x + w * 0.3} ${HORIZON - 5} ${x + w * 0.6} ${HORIZON + 3} ${x + w} ${HORIZON - 2} V${HORIZON + 60} H${x} Z`
  return `
    ${rect(x, y, w, h, `url(#${uid}-sky)`)}
    ${rect(x, y, w, h, `url(#${uid}-dawn)`)}
    ${stars}
    ${path(ridge, { fill: TONE[2] })}
    <path d="M${x} ${HORIZON} C ${x + w * 0.3} ${HORIZON - 5} ${x + w * 0.6} ${HORIZON + 3} ${x + w} ${HORIZON - 2}" fill="none" stroke="${GOLD}" stroke-width="14" opacity="${r(0.3 + 0.4 * dawn, 3)}" filter="url(#${uid}-soft)"/>
    <path d="M${x} ${HORIZON} C ${x + w * 0.3} ${HORIZON - 5} ${x + w * 0.6} ${HORIZON + 3} ${x + w} ${HORIZON - 2}" fill="none" stroke="${RED}" stroke-width="3"/>
    ${path(d, { fill: TONE[0] })}`
}

/** The window: casing, sash bars and sill, burnished where the light catches their edges. */
export function window(uid) {
  const { x, y, w, h } = WIN
  const mid = x + w / 2
  const bar = y + h * 0.46
  const lit = TONE[4]
  return `
    ${path(`M${x - 34} ${y - 30} H${x + w + 34} V${y + h + 20} H${x - 34} Z M${x} ${y} V${y + h} H${x + w} V${y} Z`, { fill: TONE[1] })}
    ${rect(x - 34, y - 30, w + 68, 4, lit, { opacity: 0.35 })}
    ${rect(mid - 7, y, 14, h, TONE[0])}
    ${rect(x, bar - 6, w, 12, TONE[0])}
    ${rect(mid - 7, y, 3, h, lit, { opacity: 0.55 })}
    ${rect(x, bar - 6, w, 2.5, lit, { opacity: 0.5 })}
    ${rect(x - 54, y + h + 14, w + 108, 22, TONE[2])}
    ${rect(x - 54, y + h + 14, w + 108, 3, TONE[6], { opacity: 0.9 })}
    ${rect(x + w * 0.35, y + h + 13, w * 0.5, 4, GOLD, { opacity: 0.35 })}`
}

/** A curtain drawn back at the left: vertical folds, burnished on their ridges. */
export function curtain(uid, seed = 3) {
  const rand = rng(seed)
  const x0 = WIN.x - 230
  const x1 = WIN.x - 12
  // The drape: dark cloth hanging from a rail, gathered towards the window.
  const body = `M${x0} ${P.y} H${x1 + 30} C ${x1 - 10} 260 ${x1 - 40} 470 ${x1 - 6} ${P.y + P.h} H${x0 - 30} Z`
  // Folds as soft ridges; the ridge nearest the window catches the most light.
  const folds = Array.from({ length: 6 }, (_, i) => {
    const u = i / 5
    const x = x0 + 20 + u * (x1 - x0 - 30)
    const light = 0.12 + u * u * 0.75
    return path(`M${r(x)} ${P.y} C ${r(x + 10 - u * 20)} 260 ${r(x - 18 - u * 30)} 470 ${r(x - 6 - u * 10)} ${P.y + P.h}`, { stroke: TONE[6], sw: 5 + rand() * 6, opacity: r(light, 3), filter: `${uid}-soft` })
  }).join('')
  return `${path(body, { fill: TONE[1] })}
    ${folds}
    ${rect(x0 - 40, P.y + 20, x1 - x0 + 120, 8, TONE[3])}`
}

/** The bed in the foreground: a blanket's folds and a pillow, lit by the window. */
export function bed(uid) {
  const y = 596
  const top = `M${P.x} ${y + 26} C 380 ${y - 22} 1040 ${y - 30} ${P.x + P.w} ${y + 6}`
  return `
    ${path(`${top} V${P.y + P.h} H${P.x} Z`, { fill: TONE[1] })}
    ${path(top, { stroke: TONE[5], sw: 5, opacity: 0.9, filter: `${uid}-soft` })}
    ${path(`M70 ${y + 14} C 120 ${y - 40} 300 ${y - 46} 360 ${y - 2} C 320 ${y + 26} 150 ${y + 32} 70 ${y + 14} Z`, { fill: TONE[5] })}
    ${path(`M110 ${y - 2} C 170 ${y - 30} 280 ${y - 34} 330 ${y - 10}`, { stroke: TONE[7], sw: 8, opacity: 0.75, filter: `${uid}-soft`, cap: 'round' })}
    ${path(`M560 ${y + 34} C 780 ${y - 4} 1120 ${y - 8} 1420 ${y + 40}`, { stroke: TONE[6], sw: 12, opacity: 0.7, filter: `${uid}-soft`, cap: 'round' })}
    ${path(`M640 ${y + 84} C 860 ${y + 52} 1100 ${y + 56} 1330 ${y + 92}`, { stroke: TONE[5], sw: 10, opacity: 0.55, filter: `${uid}-soft`, cap: 'round' })}
    ${path(`M900 ${y + 70} C 960 ${y + 62} 1010 ${y + 84} 1040 ${y + 112}`, { stroke: TONE[5], sw: 7, opacity: 0.45, filter: `${uid}-soft`, cap: 'round' })}`
}

/** The rocked burr over the whole plate: what makes a mezzotint's black velvet. */
export const burr = (uid) => `
  ${rect(P.x, P.y, P.w, P.h, `url(#${uid}-burr)`, { opacity: 0.1 })}
  <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="#000" opacity="0.55" filter="url(#${uid}-rocker)"/>`

/* ── The frame ────────────────────────────────────────────────────── */

const HERO_LINE = 'Then the sun starts to wake, the trees start to yawn'
const heroWords = HERO_LINE.split(' ').map((text, i) => ({ t: 10 + i * 0.32, text }))

// The hero lands on the comma: the first half sung, the second half still to come.
export function heroFrame({ now = 10 + 5 * 0.32 + 0.25, uid = 'horizon', dawn = 0.78 } = {}) {
  const clip = plateClip(uid)
  const line = { index: 0, text: HERO_LINE, words: heroWords }
  return `<defs>${defs(uid, dawn)}${clip.def}</defs>
    ${paper()}
    <g clip-path="${clip.url}">
      ${wall(uid)}
      ${outside(uid, dawn)}
      ${window(uid)}
      ${shaft(uid)}
      ${curtain(uid)}
      ${bed(uid)}
      ${burr(uid)}
    </g>
    ${lyricMargin({ now, line, uid })}`
}

/* Mix two #rrggbb colours. */
function mix(a, b, u) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * u).toString(16).padStart(2, '0')).join('')
}

export default {
  slug: 'meet-me-at-the-horizon',
  hero: () => heroFrame({ uid: 'hero' }),
}
