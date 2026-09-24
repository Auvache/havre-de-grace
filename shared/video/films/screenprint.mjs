/*
 * Screenprint — "Goodbye, Norma Jeane" as a silkscreen that moves like the chart.
 *
 * Track 3 of the album (app/config/albumStyle.ts): a studio's publicity print,
 * pulled in three screens — pink, the key in ink, and one red — on the album's
 * paper. The song is Norma Jeane becoming somebody else and what it cost, sung
 * by the boy she left at seventeen, so the film never draws her. It draws
 * everything that was put around her, in the order it was put there, along one
 * strip of film the camera dollies down for the whole song.
 *
 * THE STRIP, LEFT TO RIGHT
 *
 *   Intro     A picture house. The leader counts down on the screen, one sweep
 *             a bar, and runs out exactly as the voice comes in.
 *   Verse 1   "Silver screen": the screen goes silver and a star is born on it.
 *             "Something bigger": nine blank sign panels stand up on a hill.
 *             "Silhouette like Juliet": a dress form on a balcony, filled in.
 *             "Cut your checks": the lipstick signs a studio cheque and a pair
 *             of scissors cuts it out of the book.
 *   Pre       "You could put an end to this": a clapperboard. The sticks drop
 *             on "end" and lift again on "come on". It never closes — until the
 *             last hit of the record.
 *   Break     The sound stage: a camera on sticks, lamps coming up on the bar.
 *   Verse 2   The dressing room. The hair on a wig stand bleaches platinum on
 *             "Die"; a gingham frock comes off the dress form and the white
 *             halter dress goes on; an eye in the mirror bats, really slow;
 *             the snapshots of home fall out of the mirror frame one word at a
 *             time; a ball is pitched across a baseball diamond and lands in
 *             the glove on "DiMaggio".
 *   Chorus    Night. Searchlights. The world rises on "world"; a ring box opens
 *             on "love" — a plain band, tiny in the dark; and on "more, more,
 *             more" a wall is pasted up with her mouth, one poster, then more,
 *             then more, Warhol's grid. The first chorus ends on "you wanted"
 *             with no "more", and the wall has one space left empty.
 *   Interlude The walk of fame: stars in the pavement, flashbulbs on the bar.
 *   Verse 3   Dice come up doubles; the diamond; a squeegee pulls a stroke of
 *             pink; a bottle tips and the pills come out, one a word.
 *   Chorus 2  The last poster goes up on the last "more".
 *   Interlude A bedroom. A telephone. The lamp goes out.
 *   Chorus 3  The wall again, and this time every poster is fainter and further
 *             out of register than the last — the right half of the Marilyn
 *             Diptych. The searchlights go out one by one.
 *   Outro     The handset off the hook, swinging. The lipstick falls and the red
 *             line ends. The camera goes on to one more clapperboard, and on the
 *             last hit it shuts: the cut to the end card is the clap.
 *
 * THE PRINT
 *
 *   - Three screens, pulled in order: pink (the second ink, flat), the key
 *     (outlines, halftone, anything in ink or paper), and red. The pink screen
 *     is off the key by `registerAt(t)`: it wanders through the verses, eases
 *     almost — never quite — into register on every "Goodbye", and in the last
 *     chorus and the outro drifts further and further out as the print fails.
 *   - Red is the journey, and there is one red thing: the lipstick line, drawn
 *     from the dressing table's lipstick along the whole strip, which never
 *     lifts until the lipstick is dropped. It is the only screen in register.
 *   - Halftone is baked: every dot field is computed once per prop and
 *     translated by the camera, never regenerated.
 *
 * THE MOTION is the album's (ALBUM_MOTION): a drift that never stops plus
 * half-cosine moves between views, every prop placed where the camera will be
 * when its word is sung (`X(t, sx)`), everything that lands on a word eased in
 * over 180 ms or more and left there. `screenprintFrame({ time, score })` is a
 * pure function of the clock; the plan and the static geometry are built once
 * per score.
 */

import { rng, r, clamp01, easeOut, easeInOut, ramp, lerp } from '../kit.mjs'
import { motifBody } from '../motifs.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, INK, RED, SECOND_INK, SHEET, paper, plateClip, marginLyric, titleCard, land, easeCamera } from '../album.mjs'

export const PINK = SECOND_INK['goodbye-norma-jeane']

export const SCREENPRINT = {
  id: 'album-goodbye-norma-jeane',
  name: 'Screenprint',
  accent: RED,
  palette: { PAPER, INK, RED, PINK },
}

const PL = SHEET.plate
const TOP = PL.y
const BOTTOM = PL.y + PL.h
/** The film's edge: sprocket bands at the top and the foot of the plate. */
const BAND = 34
const PIC_TOP = TOP + BAND
const PIC_BOTTOM = BOTTOM - BAND
/** Where things stand. */
const FLOOR = 606

/** The drift, units a second. */
const DRIFT = 30
/** Where the lipstick is, ahead of the camera's centre. */
const LEAD = 150

const I = Math.round
const pt = (x, y) => `${I(x)} ${I(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
const fillD = (d, colour, extra = '') => (d ? `<path d="${d}" fill="${colour}"${extra}/>` : '')
const penD = (d, colour, w, extra = '') => (d ? `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${r(w)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>` : '')
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
const g = (inner, transform = '', extra = '') => (inner ? `<g${transform ? ` transform="${transform}"` : ''}${extra}>${inner}</g>` : '')
/** A stroke drawn along its length: `k` of it is down. pathLength, so no DOM measurement. */
const drawn = (d, colour, w, k) => {
  if (k <= 0) return ''
  if (k >= 1) return penD(d, colour, w)
  return penD(d, colour, w, ` pathLength="1" stroke-dasharray="${r(k, 3)} 1"`)
}
const circ = (x, y, rad) => (rad > 0.3 ? `M${r(x - rad)} ${r(y)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0` : '')
const ellipse = (x, y, rx, ry) => `M${r(x - rx)} ${r(y)}a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0`

/** A closed shape through `pts`, joined with quadratics through the midpoints. */
function blob(pts) {
  const n = pts.length
  const mid = (i) => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2]
  let d = `M${pt(...mid(0))}`
  for (let i = 1; i <= n; i++) d += `Q${pt(...pts[i % n])} ${pt(...mid(i))}`
  return d + 'Z'
}

/** An open line through `pts`, smoothed the same way. */
function curve(pts) {
  let d = `M${pt(...pts[0])}`
  for (let i = 1; i < pts.length - 1; i++) d += `Q${pt(...pts[i])} ${pt((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2)}`
  return d + `L${pt(...pts[pts.length - 1])}`
}

/* ══ HALFTONE ══════════════════════════════════════════════════════════
 *
 * Real halftone varies the dot, not its opacity: coverage `tone(x, y)` in
 * 0–1 sets the dot's area, on a 45° grid. Returned as one path's `d`, so a
 * whole field is one element — and it is only ever built once per prop.
 */
export function halftoneD({ x0, y0, x1, y1, pitch = 16, tone, max = 0.62 }) {
  const out = []
  const c = Math.SQRT1_2
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const reach = Math.hypot(x1 - x0, y1 - y0) / 2 + pitch
  for (let u = -reach; u <= reach; u += pitch) {
    for (let v = -reach; v <= reach; v += pitch) {
      const x = cx + (u - v) * c
      const y = cy + (u + v) * c
      if (x < x0 || x > x1 || y < y0 || y > y1) continue
      const k = tone(x, y)
      if (k <= 0.03) continue
      out.push(circ(x, y, Math.sqrt(Math.min(k, 1)) * pitch * max))
    }
  }
  return out.join('')
}

const CACHE = new Map()
const memo = (key, build) => {
  if (!CACHE.has(key)) CACHE.set(key, build())
  return CACHE.get(key)
}

/** Ink from `from` to `to`, with a halftone seam drawn at each end — never a vertical cut. */
function inkZone(from, to, v) {
  const out = []
  const a = Math.max(from, v - 100)
  const b = Math.min(to, v + 1700)
  if (b > a) out.push(fillD(`M${pt(a, PIC_TOP - 4)}H${I(b)}V${I(PIC_BOTTOM + 4)}H${I(a)}Z`, INK))
  for (const [edge, dir] of [[from, -1], [to, 1]]) {
    if (!Number.isFinite(edge) || edge < v - 700 || edge > v + 2300) continue
    out.push(fillD(memo(`seam-${I(edge)}-${dir}`, () => halftoneD({ x0: dir < 0 ? edge - 620 : edge, y0: PIC_TOP - 4, x1: dir < 0 ? edge + 12 : edge + 620, y1: PIC_BOTTOM + 4, pitch: 20, max: 0.82, tone: (px) => clamp01(dir < 0 ? 1 - (edge - px) / 620 : 1 - (px - edge) / 620) ** 0.8 })), INK))
  }
  return out.join('')
}

/** A pool of light on the night: paper, breaking up into dots at its edge. */
function pool(cx, cy, rx, ry) {
  return memo(`pool-light-${I(cx)}-${I(cy)}-${rx}`, () => fillD(ellipse(cx, cy, rx * 1.06, ry * 1.06), PAPER) + fillD(halftoneD({ x0: cx - rx * 1.45, y0: cy - ry * 1.45, x1: cx + rx * 1.45, y1: cy + ry * 1.45, pitch: 18, max: 0.8, tone: (px, py) => {
    const d = Math.hypot((px - cx) / rx, (py - cy) / ry)
    return d < 1 ? 0 : clamp01(1 - (d - 1) / 0.45) ** 1.2
  } }), PAPER))
}

/* ══ THE PROPS ═════════════════════════════════════════════════════════
 *
 * Each returns { pink, key, red? } — the screens it is pulled on — in world
 * coordinates. The frame puts every prop's pink into one group shifted off
 * register, and its key into another.
 */

/** A five-point star. */
function starD(cx, cy, R, inner = 0.42, rot = -90) {
  let d = ''
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36) * Math.PI) / 180
    const rr = i % 2 ? R * inner : R
    d += (i ? 'L' : 'M') + pt(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
  }
  return d + 'Z'
}

/** A four-point sparkle. */
const sparkle = (x, y, s) => (s > 0.5 ? `M${pt(x, y - s)}Q${pt(x, y)} ${pt(x + s, y)}Q${pt(x, y)} ${pt(x, y + s)}Q${pt(x, y)} ${pt(x - s, y)}Q${pt(x, y)} ${pt(x, y - s)}Z` : '')

/** A film reel: rim, hub, six windows. */
export function reelD(cx, cy, rad) {
  let d = circ(cx, cy, rad)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3
    d += circ(cx + Math.cos(a) * rad * 0.55, cy + Math.sin(a) * rad * 0.55, rad * 0.2)
  }
  return d + circ(cx, cy, rad * 0.12)
}

/** A mouth, as two lips: the poster the wall is pasted with. */
function lipsD(cx, cy, w) {
  const h = w * 0.46
  const X = (u) => cx + u * w
  const Y = (v) => cy + v * h
  const upper = `M${pt(X(-0.5), Y(0))}C${pt(X(-0.32), Y(-0.62))} ${pt(X(-0.13), Y(-0.78))} ${pt(X(0), Y(-0.46))}C${pt(X(0.13), Y(-0.78))} ${pt(X(0.32), Y(-0.62))} ${pt(X(0.5), Y(0))}C${pt(X(0.24), Y(0.1))} ${pt(X(-0.24), Y(0.1))} ${pt(X(-0.5), Y(0))}Z`
  const lower = `M${pt(X(-0.5), Y(0))}C${pt(X(-0.24), Y(0.14))} ${pt(X(0.24), Y(0.14))} ${pt(X(0.5), Y(0))}C${pt(X(0.32), Y(0.86))} ${pt(X(-0.32), Y(0.86))} ${pt(X(-0.5), Y(0))}Z`
  const seam = `M${pt(X(-0.5), Y(0))}C${pt(X(-0.24), Y(0.12))} ${pt(X(0.24), Y(0.12))} ${pt(X(0.5), Y(0))}`
  const shine = `M${pt(X(-0.14), Y(0.4))}Q${pt(X(0), Y(0.5))} ${pt(X(0.16), Y(0.38))}`
  return { upper, lower, seam, shine }
}

/* ── The picture house ─────────────────────────────────────────────────── */
function theatre(P, now) {
  const { x, from, to } = P.theatre
  const scr = { x0: x - 400, x1: x + 400, y0: 104, y1: 486 }
  const stat = memo('theatre', () => {
    // The auditorium is ink; the seats are the screen's light on their backs.
    let seats = ''
    for (let row = 0; row < 3; row++) {
      const y = 556 + row * 38
      const w = 70 + row * 12
      for (let sx = from + 40 + (row % 2) * w * 0.5; sx < to - 40; sx += w) {
        seats += `M${pt(sx, y + 30)}V${I(y + 8)}Q${pt(sx, y - 8)} ${pt(sx + w * 0.42, y - 8)}Q${pt(sx + w * 0.84, y - 8)} ${pt(sx + w * 0.84, y + 8)}V${I(y + 30)}Z`
      }
    }
    // Curtains either side of the screen: pink folds with ink between.
    let folds = ''
    let fl = ''
    for (const side of [-1, 1]) {
      const edge = side < 0 ? scr.x0 - 20 : scr.x1 + 20
      for (let i = 0; i < 5; i++) {
        const x0 = edge + side * i * 46
        folds += `M${pt(x0, PIC_TOP)}Q${pt(x0 + side * 30, 300)} ${pt(x0 + side * 8, 540)}L${pt(x0 + side * 44, 540)}Q${pt(x0 + side * 60, 300)} ${pt(x0 + side * 46, PIC_TOP)}Z`
        fl += `M${pt(x0 + side * 40, PIC_TOP + 10)}Q${pt(x0 + side * 56, 300)} ${pt(x0 + side * 40, 530)}`
      }
    }
    // Bulbs round the screen, lit on "screen".
    const bulbs = []
    const per = 18
    for (let i = 0; i <= per; i++) {
      const bx = lerp(scr.x0 - 14, scr.x1 + 14, i / per)
      bulbs.push([bx, scr.y0 - 16], [bx, scr.y1 + 16])
    }
    for (let i = 1; i < 9; i++) {
      const by = lerp(scr.y0 - 16, scr.y1 + 16, i / 9)
      bulbs.push([scr.x0 - 14, by], [scr.x1 + 14, by])
    }
    return {
      seats,
      folds,
      fl,
      bulbs,
      beam: halftoneD({ x0: x - 520, y0: 480, x1: x + 520, y1: PIC_BOTTOM, pitch: 15, tone: (px, py) => {
        const w = 140 + (PIC_BOTTOM - py) * 0.9
        const u = Math.abs(px - x) / w
        return u < 1 ? 0.55 * (1 - u * u) : 0
      } }),
    }
  })
  const T = P.T
  // The leader: one sweep a bar, alternating pink over ink and ink over pink,
  // so no bar starts with a jump. It runs out as the voice comes in.
  const bar = P.bar
  const ended = land(now, T.silver - 0.06, 0.2)
  const silver = land(now, T.silver, 0.3)
  let pink = fillD(stat.folds + stat.seats, PINK)
  let key = penD(stat.fl, INK, 5)
  // The screen itself.
  key += fillD(`M${pt(scr.x0, scr.y0)}H${I(scr.x1)}V${I(scr.y1)}H${I(scr.x0)}Z`, PAPER)
  if (ended < 1) {
    const cx = x
    const cy = (scr.y0 + scr.y1) / 2
    const n = Math.floor((now - bar.from) / bar.len)
    const u = clamp01((now - bar.from) / bar.len - n)
    const R = 330
    const a0 = -Math.PI / 2
    const a1 = a0 + u * Math.PI * 2
    const big = u > 0.5 ? 1 : 0
    const sweep = u > 0.002 ? `M${pt(cx, cy)}L${pt(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R)}A${R} ${R} 0 ${big} 1 ${pt(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R)}Z` : ''
    const under = n % 2 ? PINK : INK
    const over = n % 2 ? INK : PINK
    const clip = `${P.uid}-leader`
    const body = `<clipPath id="${clip}"><rect x="${scr.x0}" y="${scr.y0}" width="${scr.x1 - scr.x0}" height="${scr.y1 - scr.y0}"/></clipPath>
      <g clip-path="url(#${clip})"${op(1 - ended)}>
        <rect x="${scr.x0}" y="${scr.y0}" width="${scr.x1 - scr.x0}" height="${scr.y1 - scr.y0}" fill="${now < bar.from ? INK : under}"/>
        ${now >= bar.from ? fillD(sweep, over) : ''}
        ${penD(circ(cx, cy, 150) + circ(cx, cy, 124), PAPER, 7)}
        ${penD(`M${pt(scr.x0, cy)}H${I(scr.x1)}M${pt(cx, scr.y0)}V${I(scr.y1)}`, PAPER, 4)}
      </g>`
    key += body
  }
  // "Silver": the screen goes silver — paper, with a pale dot screen.
  if (silver > 0) {
    const dots = memo('theatre-silver', () => halftoneD({ x0: scr.x0, y0: scr.y0, x1: scr.x1, y1: scr.y1, pitch: 14, tone: (px, py) => 0.08 + 0.18 * (py - scr.y0) / (scr.y1 - scr.y0) }))
    key += fillD(dots, INK, op(silver * 0.5))
  }
  // "screen": the bulbs come on round it, left to right.
  let bulbs = ''
  for (const [bx, by] of stat.bulbs) {
    const k = land(now, T.screen + ((bx - scr.x0) / (scr.x1 - scr.x0)) * 0.35, 0.18)
    bulbs += circ(bx, by, 5 + 2 * k)
  }
  key += fillD(bulbs, PAPER, op(0.35 + 0.65 * land(now, T.screen, 0.2)))
  // The projector's light, from behind the audience.
  pink += fillD(stat.beam, PINK, ' opacity="0.85"')
  // "Norma Jeane": a star is born on the screen, and glints on "oh".
  const star = land(now, T.norma, 0.5)
  if (star > 0) {
    const cx = x
    const cy = (scr.y0 + scr.y1) / 2 + 8
    const R = 150 * easeOut(star)
    const inner = lerp(0.42, 0.4, star)
    pink += fillD(starD(cx, cy, R, inner), PINK)
    key += penD(starD(cx, cy, R, inner), INK, 5)
    key += fillD(`M${pt(cx - 60 * star, cy + 6)}h${r(120 * star)}v${r(34 * star)}h${r(-120 * star)}Z`, PAPER) + penD(`M${pt(cx - 60 * star, cy + 6)}h${r(120 * star)}v${r(34 * star)}h${r(-120 * star)}Z`, INK, 3)
    const gl = land(now, T.oh1, 0.2) * (1 - easeInOut(ramp(now, T.oh1 + 0.4, T.oh1 + 1.6)))
    if (gl > 0) key += fillD(sparkle(cx + R * 0.72, cy - R * 0.62, 40 * gl) + sparkle(cx - R * 0.8, cy - R * 0.1, 22 * gl), INK)
  }
  return { pink, key, back: inkZone(from, to, P.view) }
}

/* ── "Something bigger's meant for me": nine blank panels on a hill ────── */
function hill(P, now) {
  const { x } = P.hill
  const left = Math.max(x - 1100, P.theatre.to + 40)
  const hy = (px) => 470 - 150 * Math.exp(-(((px - x) / 520) ** 2))
  const stat = memo('hill', () => {
    const pts = []
    for (let px = left; px <= x + 1100; px += 40) pts.push([px, hy(px)])
    const top = curve(pts)
    return {
      shape: `${top}L${pt(x + 1100, FLOOR)}L${pt(left, FLOOR)}Z`,
      rim: top,
      dots: halftoneD({ x0: left, y0: 300, x1: x + 1100, y1: FLOOR, pitch: 18, tone: (px, py) => (py > hy(px) + 6 ? 0.1 + 0.4 * ((py - hy(px)) / 300) : 0) }),
    }
  })
  let key = penD(stat.rim, INK, 5) + fillD(stat.dots, INK, ' opacity="0.55"')
  const pink = fillD(stat.shape, PINK)
  const words = P.W.bigger
  const N = 9
  for (let i = 0; i < N; i++) {
    const px = x - 380 + i * 95
    const base = hy(px) + 18
    const h = 150
    const w = 70
    const k = easeOut(land(now, words[Math.min(words.length - 1, Math.floor(i / 2))].t + (i % 2) * 0.09, 0.35))
    if (k <= 0) continue
    const top = base - h * k
    key += penD(`M${pt(px + 10, base)}L${pt(px + w - 10, top + 30)}M${pt(px + w - 10, base)}L${pt(px + 10, top + 30)}`, INK, 3, op(k))
    key += fillD(`M${pt(px, top)}H${I(px + w)}V${I(base - 20)}H${I(px)}Z`, PAPER) + penD(`M${pt(px, top)}H${I(px + w)}V${I(base - 20)}H${I(px)}Z`, INK, 5)
  }
  return { pink, key }
}

/* ── "With a silhouette like Juliet": a dress form on a balcony ─────────── */

/** The dress form's half-width at height `v` (0 at the neck, 1 at the hip). */
const formW = (v) => {
  if (v < 0.08) return 18
  if (v < 0.2) return lerp(18, 76, smooth((v - 0.08) / 0.12))
  if (v < 0.42) return lerp(76, 70, (v - 0.2) / 0.22)
  if (v < 0.66) return lerp(70, 46, smooth((v - 0.42) / 0.24))
  return lerp(46, 80, smooth((v - 0.66) / 0.34))
}
function formD(cx, top, h) {
  const L = []
  const R = []
  for (let i = 0; i <= 20; i++) {
    const v = i / 20
    L.push([cx - formW(v), top + v * h])
    R.push([cx + formW(v), top + v * h])
  }
  return blob([...R, [cx + 60, top + h + 10], [cx - 60, top + h + 10], ...L.reverse()])
}

function balcony(P, now) {
  const { x } = P.balcony
  const T = P.T
  let pink = ''
  let key = ''
  // The moon, rising on "oh".
  const moon = land(now, T.oh3 - 0.2, 1.2)
  pink += fillD(circ(x - 250, lerp(340, 210, easeInOut(moon)), 120), PINK)
  // The window behind, and the wall.
  const win = `M${pt(x - 120, 170)}H${I(x + 150)}V${I(470)}H${I(x - 120)}Z`
  key += penD(win + `M${pt(x + 15, 170)}V470M${pt(x - 120, 320)}H${I(x + 150)}`, INK, 6)
  pink += fillD(`M${pt(x - 110, 180)}H${I(x + 140)}V${I(462)}H${I(x - 110)}Z`, PINK, ' opacity="0.55"')
  // The form: its outline first, then on "silhouette" it fills in ink, up.
  const top = 208
  const h = 250
  const k = easeOut(ramp(now, P.T.silhouette - 0.05, P.T.silhouette + 0.55))
  const shape = formD(x + 15, top, h)
  key += penD(`M${pt(x + 15, top + h + 10)}V${I(FLOOR - 120)}`, INK, 8)
  if (k > 0) {
    const clip = `${P.uid}-form`
    const y = top + h + 12 - (h + 30) * k
    key += `<clipPath id="${clip}"><rect x="${x - 120}" y="${r(y)}" width="270" height="${r(top + h + 20 - y)}"/></clipPath>${fillD(shape, INK, ` clip-path="url(#${clip})"`)}`
  }
  key += penD(shape, INK, 5)
  key += fillD(ellipse(x + 15, top - 8, 14, 10), INK)
  // The balcony, drawn along on "Juliet".
  const jk = easeOut(ramp(now, T.juliet - 0.1, T.juliet + 0.8))
  const rail = `M${pt(x - 330, FLOOR - 128)}H${I(x + 330)}`
  const base = `M${pt(x - 340, FLOOR - 20)}H${I(x + 340)}`
  key += drawn(rail, INK, 14, jk) + drawn(base, INK, 18, jk)
  let bal = ''
  for (let i = 0; i < 13; i++) {
    const bx = x - 300 + i * 50
    const kk = clamp01(jk * 1.3 - i / 20)
    if (kk <= 0) continue
    const hh = 98 * kk
    bal += `M${pt(bx - 9, FLOOR - 22)}Q${pt(bx - 20, FLOOR - 22 - hh * 0.5)} ${pt(bx - 7, FLOOR - 22 - hh)}H${I(bx + 7)}Q${pt(bx + 20, FLOOR - 22 - hh * 0.5)} ${pt(bx + 9, FLOOR - 22)}Z`
  }
  key += fillD(bal, INK)
  pink += fillD(`M${pt(x - 340, FLOOR - 20)}H${I(x + 340)}V${I(FLOOR + 40)}H${I(x - 340)}Z`, PINK)
  return { pink, key }
}

/* ── "Someone else could cut your checks" ─────────────────────────────── */
function cheque(P, now) {
  const { x } = P.cheque
  const T = P.T
  const y = 250
  const w = 640
  const h = 260
  const cut = easeInOut(ramp(now, T.cut, T.checks + 0.45))
  const sep = easeOut(ramp(now, T.checks + 0.3, T.checks + 0.9))
  const stubW = 150
  const x0 = x - w / 2
  const rot = `rotate(-4 ${I(x)} ${I(y + h / 2)})`
  let pink = fillD(`M${pt(x0, y)}H${I(x0 + stubW)}V${I(y + h)}H${I(x0)}Z`, PINK)
  pink += fillD(`M${pt(x0 + stubW + 30, y + 28)}H${I(x0 + w - 30)}V${I(y + 64)}H${I(x0 + stubW + 30)}Z`, PINK)
  const dx = 26 * sep
  const body = `M${pt(x0 + stubW + dx, y)}H${I(x0 + w + dx)}V${I(y + h)}H${I(x0 + stubW + dx)}Z`
  let key = fillD(body, PAPER, ' fill-opacity="0.7"') + penD(body, INK, 5)
  key += penD(`M${pt(x0, y)}H${I(x0 + stubW)}V${I(y + h)}H${I(x0)}Z`, INK, 5)
  // Rules: payee, the amount in words, and the signature line.
  key += penD(`M${pt(x0 + stubW + 40 + dx, y + 116)}H${I(x0 + w - 150 + dx)}M${pt(x0 + stubW + 40 + dx, y + 160)}H${I(x0 + w - 40 + dx)}M${pt(x0 + w - 270 + dx, y + 222)}H${I(x0 + w - 30 + dx)}`, INK, 3)
  key += penD(`M${pt(x0 + w - 130 + dx, y + 92)}h100v44h-100Z`, INK, 4)
  key += penD(`M${pt(x0 + 24, y + 70)}H${I(x0 + stubW - 24)}M${pt(x0 + 24, y + 110)}H${I(x0 + stubW - 24)}M${pt(x0 + 24, y + 150)}H${I(x0 + stubW - 24)}`, INK, 3)
  // The perforation, and the scissors going down it on "cut".
  let perf = ''
  for (let py = y + 8; py < y + h; py += 16) perf += circ(x0 + stubW, py, 3)
  key += fillD(perf, INK)
  if (now > T.cut - 0.4 && sep < 1) {
    const sy = y - 30 + (h + 60) * cut
    const sx = x0 + stubW
    const open = 14 + 10 * Math.sin(now * 14)
    const blade = (sgn) => `M${pt(sx, sy)}L${pt(sx - 6 * sgn, sy - 110)}Q${pt(sx + 4 * sgn, sy - 70)} ${pt(sx + 3 * sgn, sy)}Z`
    const handle = (sgn) => circ(sx + 22 * sgn, sy + 46, 22)
    const sc = `<g transform="rotate(${r(180 + open * 0.5)} ${I(sx)} ${I(sy)})">${fillD(blade(1), INK)}<g transform="rotate(${r(-open)} ${I(sx)} ${I(sy)})">${fillD(blade(-1), INK)}</g>${penD(handle(1) + handle(-1), INK, 9)}</g>`
    key += `<g${op(1 - sep)}>${sc}</g>`
  }
  return { pink: g(pink, rot), key: g(key, rot) }
}

/* ── The clapperboard ─────────────────────────────────────────────────── */
function clapper(cx, open, ground = FLOOR, dark = false) {
  const w = 460
  const h = 300
  const x0 = cx - w / 2
  const y0 = ground - 40 - h
  const stickH = 56
  const stripes = (yy) => {
    let d = ''
    for (let i = 0; i < 7; i++) {
      const sx = x0 + 16 + i * 66
      d += `M${pt(sx, yy)}h36l30 ${stickH}h-36Z`
    }
    return d
  }
  const board = `M${pt(x0, y0)}H${I(x0 + w)}V${I(y0 + h)}H${I(x0)}Z`
  let pink = fillD(`M${pt(x0 + 30, y0 + 70)}H${I(x0 + w - 30)}V${I(y0 + h - 26)}H${I(x0 + 30)}Z`, PINK, dark ? ' opacity="0.8"' : '')
  let key = fillD(board, INK)
  key += penD(`M${pt(x0 + 30, y0 + 70)}H${I(x0 + w - 30)}V${I(y0 + h - 26)}H${I(x0 + 30)}Z`, PAPER, 3)
  key += penD(`M${pt(x0 + 30, y0 + 140)}H${I(x0 + w - 30)}M${pt(x0 + 30, y0 + 206)}H${I(x0 + w - 30)}M${pt(cx, y0 + 140)}V${I(y0 + h - 26)}`, PAPER, 3)
  // The fixed stick.
  const fixed = `M${pt(x0, y0 - stickH)}H${I(x0 + w)}V${I(y0)}H${I(x0)}Z`
  key += fillD(fixed, PAPER) + fillD(stripes(y0 - stickH), INK) + penD(fixed, INK, 5)
  // The clapper stick, hinged at the left.
  const top = y0 - stickH - 4
  const stick = `M${pt(x0, top - stickH)}H${I(x0 + w)}V${I(top)}H${I(x0)}Z`
  const hinge = `rotate(${r(-open, 2)} ${I(x0 + 4)} ${I(top)})`
  key += g(fillD(stick, PAPER) + fillD(stripes(top - stickH), INK) + penD(stick, INK, 5), hinge)
  key += fillD(circ(x0 + 8, top + 2, 11), INK)
  pink += g(fillD(`M${pt(x0 + 12, top - stickH + 10)}H${I(x0 + w - 30)}V${I(top - 10)}H${I(x0 + 12)}Z`, PINK, ' opacity="0.9"'), hinge)
  return { pink, key }
}

/** How open a pre-chorus clapper is: it drops on "end", lifts on "come on", never closes. */
function clapperOpen(now, lines) {
  let a = 26
  lines.forEach((ln, i) => {
    const end = ln.words.find((w) => /^end/.test(w.text)).t
    const come = ln.words.find((w) => /^come/.test(w.text)).t
    const shut = i === 0 ? 7 : 2.5
    const u = easeInOut(ramp(now, end - 0.1, end + 0.32))
    const back = easeInOut(ramp(now, come, come + (i === 0 ? 0.7 : 1.1)))
    a = lerp(a, shut, u)
    a = lerp(a, i === 0 ? 26 : 34, back)
  })
  return a
}

function spotPool(cx, ground = FLOOR, w = 330) {
  return memo(`pool-${I(cx)}-${w}`, () => halftoneD({ x0: cx - w * 1.6, y0: PIC_TOP, x1: cx + w * 1.6, y1: ground + 40, pitch: 16, tone: (px, py) => {
    const half = 90 + (py - PIC_TOP) * (w / (ground - PIC_TOP))
    const u = Math.abs(px - cx) / half
    return u < 1 ? 0.36 * (1 - u) : 0
  } }))
}

/* ── The sound stage ──────────────────────────────────────────────────── */
function movieCamera(cx) {
  return memo(`camera-${I(cx)}`, () => {
    const y = FLOOR - 250
    const body = `M${pt(cx - 110, y)}H${I(cx + 90)}V${I(y + 110)}H${I(cx - 110)}Z`
    const lens = `M${pt(cx + 90, y + 30)}H${I(cx + 150)}L${pt(cx + 176, y + 16)}V${I(y + 96)}L${pt(cx + 150, y + 82)}H${I(cx + 90)}Z`
    const legs = `M${pt(cx - 10, y + 110)}L${pt(cx - 110, FLOOR)}M${pt(cx - 10, y + 110)}L${pt(cx + 90, FLOOR)}M${pt(cx - 10, y + 110)}L${pt(cx - 14, FLOOR)}`
    return {
      pink: fillD(`M${pt(cx - 90, y + 20)}H${I(cx + 70)}V${I(y + 90)}H${I(cx - 90)}Z`, PINK),
      key: penD(legs, INK, 8) + penD(body, INK, 7) + fillD(lens, INK) + fillD(reelD(cx - 70, y - 62, 64) + reelD(cx + 50, y - 62, 64), INK, ' fill-rule="evenodd"'),
    }
  })
}
function lamp(cx, on) {
  const y = FLOOR - 330
  const pole = `M${pt(cx, y + 60)}V${I(FLOOR - 40)}M${pt(cx, FLOOR - 40)}L${pt(cx - 60, FLOOR)}M${pt(cx, FLOOR - 40)}L${pt(cx + 60, FLOOR)}`
  const head = `M${pt(cx - 64, y - 50)}H${I(cx + 64)}V${I(y + 60)}H${I(cx - 64)}Z`
  const doors = `M${pt(cx - 64, y - 50)}L${pt(cx - 100, y - 80)}M${pt(cx + 64, y - 50)}L${pt(cx + 100, y - 80)}M${pt(cx - 64, y + 60)}L${pt(cx - 100, y + 90)}M${pt(cx + 64, y + 60)}L${pt(cx + 100, y + 90)}`
  let key = penD(pole + doors, INK, 7) + fillD(head, INK)
  key += fillD(circ(cx, y + 5, 42), on > 0.5 ? PAPER : PINK) + penD(circ(cx, y + 5, 30) + circ(cx, y + 5, 18), INK, 3, op(1 - on * 0.6))
  const beam = memo(`lamp-beam-${I(cx)}`, () => halftoneD({ x0: cx - 500, y0: y + 40, x1: cx + 500, y1: FLOOR + 20, pitch: 17, tone: (px, py) => {
    const half = 40 + (py - y) * 0.9
    const u = Math.abs(px - cx - (py - y) * 0.12) / half
    return u < 1 ? 0.42 * (1 - u) : 0
  } }))
  return { pink: on > 0 ? fillD(beam, PINK, op(on)) : '', key }
}
function chair(cx) {
  return memo(`chair-${I(cx)}`, () => {
    const seat = FLOOR - 150
    return {
      pink: fillD(`M${pt(cx - 80, seat - 110)}H${I(cx + 80)}V${I(seat - 50)}H${I(cx - 80)}Z`, PINK) + fillD(`M${pt(cx - 86, seat - 8)}H${I(cx + 86)}V${I(seat + 16)}H${I(cx - 86)}Z`, PINK),
      key: penD(`M${pt(cx - 80, seat - 130)}V${I(seat)}M${pt(cx + 80, seat - 130)}V${I(seat)}M${pt(cx - 80, seat)}L${pt(cx + 80, FLOOR)}M${pt(cx + 80, seat)}L${pt(cx - 80, FLOOR)}M${pt(cx - 90, seat - 60)}H${I(cx + 90)}M${pt(cx - 90, seat)}H${I(cx + 90)}`, INK, 8)
        + penD(`M${pt(cx - 80, seat - 110)}H${I(cx + 80)}V${I(seat - 50)}H${I(cx - 80)}Z`, INK, 4),
    }
  })
}
function boom(cx) {
  return memo(`boom-${I(cx)}`, () => ({
    pink: '',
    key: penD(`M${pt(cx - 220, FLOOR)}L${pt(cx - 170, FLOOR - 60)}L${pt(cx - 120, FLOOR)}M${pt(cx - 170, FLOOR - 60)}V${I(FLOOR - 330)}L${pt(cx + 200, PIC_TOP + 70)}V${I(PIC_TOP + 120)}`, INK, 7)
      + fillD(`M${pt(cx + 170, PIC_TOP + 120)}h60v70q-30 18 -60 0Z`, INK),
  }))
}

/** Film cans, stacked. */
function filmCans(cx) {
  return memo(`cans-${I(cx)}`, () => {
    let key = ''
    let pink = ''
    for (let i = 0; i < 4; i++) {
      const y = FLOOR - 16 - i * 34
      const dx = (i % 2 ? 14 : -10) + (i === 3 ? 20 : 0)
      pink += fillD(`M${pt(cx + dx - 110, y - 12)}h220v24h-220Z`, PINK)
      key += penD(ellipse(cx + dx, y - 12, 110, 16), INK, 5) + penD(`M${pt(cx + dx - 110, y - 12)}v24M${pt(cx + dx + 110, y - 12)}v24M${pt(cx + dx - 110, y + 12)}Q${pt(cx + dx, y + 30)} ${pt(cx + dx + 110, y + 12)}`, INK, 5)
    }
    return { pink, key }
  })
}

/* ── The dressing room ────────────────────────────────────────────────── */
function mirror(cx, cy, w, h, litAt, now) {
  const x0 = cx - w / 2
  const y0 = cy - h / 2
  const frame = `M${pt(x0, y0)}H${I(x0 + w)}V${I(y0 + h)}H${I(x0)}Z`
  const stat = memo(`mirror-${I(cx)}`, () => ({
    glass: halftoneD({ x0: x0 + 10, y0: y0 + 10, x1: x0 + w - 10, y1: y0 + h - 10, pitch: 15, tone: (px, py) => 0.1 + 0.12 * Math.sin((px - py) / 90) }),
    bulbs: (() => {
      const out = []
      const nx = Math.round(w / 64)
      const ny = Math.round(h / 64)
      for (let i = 0; i <= nx; i++) out.push([x0 + (w * i) / nx, y0 - 22], [x0 + (w * i) / nx, y0 + h + 22])
      for (let i = 1; i < ny; i++) out.push([x0 - 22, y0 + (h * i) / ny], [x0 + w + 22, y0 + (h * i) / ny])
      return out
    })(),
  }))
  let bulbs = ''
  stat.bulbs.forEach(([bx, by], i) => {
    const k = land(now, litAt + (i % 7) * 0.05, 0.2)
    bulbs += circ(bx, by, 9 + 3 * k)
  })
  return {
    pink: fillD(stat.glass, PINK, ' opacity="0.7"'),
    key: penD(frame, INK, 14) + fillD(bulbs, PAPER) + penD(bulbs, INK, 3),
  }
}

function wigHead(P, now) {
  const { x } = P.wig
  const y = 260
  const bleach = (i) => land(now, P.T.die + i * 0.035, 0.24)
  const stat = memo('wig', () => {
    const rand = rng(71)
    const curls = []
    for (let i = 0; i < 26; i++) {
      const a = Math.PI * (1.05 + (i / 25) * 0.9) + (rand() - 0.5) * 0.2
      const rr = 92 + rand() * 20
      curls.push([x + Math.cos(a) * rr * 0.95, y + 10 + Math.sin(a) * rr * 1.05, 26 + rand() * 12])
    }
    for (let i = 0; i < 9; i++) curls.push([x - 70 + i * 17 + rand() * 6, y - 64 + rand() * 30, 24 + rand() * 8])
    curls.sort((a, b) => a[0] - b[0])
    return curls
  })
  let key = penD(`M${pt(x, y + 120)}V${I(FLOOR - 70)}M${pt(x - 60, FLOOR - 70)}H${I(x + 60)}`, INK, 12)
  key += fillD(ellipse(x, y + 30, 86, 104), PAPER) + penD(ellipse(x, y + 30, 86, 104), INK, 5)
  key += penD(`M${pt(x - 34, y + 128)}Q${pt(x, y + 150)} ${pt(x + 34, y + 128)}`, INK, 5)
  let dark = ''
  let light = ''
  let pink = ''
  stat.forEach(([cx, cy, s], i) => {
    const k = bleach(i)
    if (k < 1) dark += circ(cx, cy, s * (1 - k * 0.1))
    if (k > 0) {
      light += circ(cx, cy, s * (0.9 + 0.1 * k))
      pink += circ(cx + 4, cy + 3, s * 0.7 * k)
    }
  })
  const lightOp = clamp01(land(now, P.T.die, 0.3) * 1.2)
  return {
    pink: fillD(pink, PINK),
    key: key + fillD(dark, INK) + (lightOp > 0 ? `<g${op(lightOp)}>${fillD(light, PAPER)}${penD(light, INK, 3)}</g>` : ''),
  }
}

function dressForm(P, now) {
  const { x } = P.dress
  const top = 196
  const h = 240
  const T = P.T
  const off = easeInOut(ramp(now, T.change - 0.05, T.change + 0.5))
  const on = easeOut(ramp(now, T.change + 0.2, T.clothes + 0.3))
  let pink = ''
  let key = penD(`M${pt(x, top + h + 10)}V${I(FLOOR - 70)}M${pt(x - 60, FLOOR - 70)}H${I(x + 60)}`, INK, 10)
  key += fillD(ellipse(x, top - 8, 14, 10), INK)
  const form = formD(x, top, h)
  key += fillD(form, PAPER) + penD(form, INK, 5)
  // The gingham frock, slid down and off on "change".
  if (off < 1) {
    const dy = 300 * off
    const frock = `M${pt(x - 58, top + 40)}L${pt(x + 58, top + 40)}L${pt(x + 100, top + h + 60)}L${pt(x - 100, top + h + 60)}Z`
    const check = memo('gingham', () => halftoneD({ x0: x - 110, y0: top + 30, x1: x + 110, y1: top + h + 70, pitch: 13, max: 0.75, tone: (px, py) => {
      const v = (py - (top + 40)) / (h + 20)
      if (v < 0 || Math.abs(px - x) > 58 + 42 * v) return 0
      return (Math.floor((px - x + 400) / 26) + Math.floor(py / 26)) % 2 ? 0.55 : 0.12
    } }))
    pink += g(fillD(frock, PINK), `translate(0 ${r(dy)})`, op(1 - off))
    key += g(fillD(check, INK) + penD(frock, INK, 4), `translate(0 ${r(dy)})`, op(1 - off))
  }
  // The white halter dress, drawn on from the neck down.
  if (on > 0) {
    const clip = `${P.uid}-halter`
    const y1 = top - 10 + (h + 220) * on
    const dress = `M${pt(x - 8, top + 4)}L${pt(x - 70, top + 110)}Q${pt(x - 50, top + 150)} ${pt(x - 48, top + 170)}Q${pt(x - 120, top + 320)} ${pt(x - 150, top + 400)}Q${pt(x, top + 430)} ${pt(x + 150, top + 400)}Q${pt(x + 120, top + 320)} ${pt(x + 48, top + 170)}Q${pt(x + 50, top + 150)} ${pt(x + 70, top + 110)}L${pt(x + 8, top + 4)}L${pt(x, top + 80)}Z`
    let pleats = ''
    for (let i = -4; i <= 4; i++) pleats += `M${pt(x + i * 10, top + 180)}Q${pt(x + i * 22, top + 300)} ${pt(x + i * 32, top + 410)}`
    key += `<clipPath id="${clip}"><rect x="${x - 170}" y="${top - 20}" width="340" height="${r(y1 - top + 20)}"/></clipPath><g clip-path="url(#${clip})">${fillD(dress, PAPER)}${penD(dress, INK, 5)}${penD(pleats, INK, 3)}${penD(`M${pt(x - 50, top + 168)}Q${pt(x, top + 184)} ${pt(x + 50, top + 168)}`, INK, 6)}</g>`
    pink += `<g clip-path="url(#${clip})">${fillD(`M${pt(x - 44, top + 176)}Q${pt(x - 110, top + 320)} ${pt(x - 130, top + 390)}Q${pt(x - 60, top + 404)} ${pt(x - 20, top + 400)}Q${pt(x - 20, top + 300)} ${pt(x - 20, top + 180)}Z`, PINK, ' opacity="0.8"')}</g>`
  }
  return { pink, key }
}

function eye(P, now) {
  const { x } = P.eye
  const cy = 330
  const W = 560
  const H = 150
  const T = P.T
  // Bat: lashes land. Really slow: the lid comes down over a second and goes back up.
  const lashK = land(now, T.bat, 0.3)
  const close = easeInOut(ramp(now, T.really - 0.05, T.slow + 0.25)) * (1 - easeInOut(ramp(now, T.slow + 0.7, T.slow + 1.9)))
  const L = x - W / 2
  const R = x + W / 2
  const upperC = cy - 2 * H
  const lowerC = cy + 1.6 * H
  const lidC = lerp(upperC, lowerC - 30, close)
  const almond = `M${pt(L, cy)}Q${pt(x, upperC)} ${pt(R, cy)}Q${pt(x, lowerC)} ${pt(L, cy)}Z`
  const clip = `${P.uid}-eye`
  const stat = memo('eye-iris', () => halftoneD({ x0: x - 110, y0: cy - 110, x1: x + 110, y1: cy + 110, pitch: 12, tone: (px, py) => {
    const d = Math.hypot(px - x, py - cy - 6)
    return d < 104 ? 0.25 + 0.5 * (d / 104) : 0
  } }))
  let key = fillD(almond, PAPER)
  key += `<clipPath id="${clip}"><path d="${almond}"/></clipPath><g clip-path="url(#${clip})">${fillD(stat, INK)}${fillD(circ(x, cy + 6, 44), INK)}${fillD(circ(x + 28, cy - 18, 16), PAPER)}`
  const lid = `M${pt(L - 10, cy)}Q${pt(x, upperC - 20)} ${pt(R + 10, cy)}Q${pt(x, lidC)} ${pt(L - 10, cy)}Z`
  key += fillD(lid, PINK) + '</g>'
  key += penD(almond, INK, 6) + penD(`M${pt(L, cy)}Q${pt(x, lidC)} ${pt(R, cy)}`, INK, 8)
  // Lashes along the lid's edge: curling up when open, down when shut.
  let lashes = ''
  const n = 15
  for (let i = 1; i < n; i++) {
    const s = i / n
    const k = clamp01(lashK * 1.5 - s * 0.5)
    if (k <= 0) continue
    const bx = (1 - s) ** 2 * L + 2 * s * (1 - s) * x + s * s * R
    const by = (1 - s) ** 2 * cy + 2 * s * (1 - s) * lidC + s * s * cy
    const tx = 2 * (1 - s) * (x - L) + 2 * s * (R - x)
    const ty = 2 * (1 - s) * (lidC - cy) + 2 * s * (cy - lidC)
    const len = Math.hypot(tx, ty) || 1
    const side = lerp(-1, 0.7, close)
    const nx = (ty / len) * side
    const ny = (-tx / len) * side
    const ll = (38 + 26 * Math.sin(s * Math.PI)) * k
    lashes += `M${pt(bx, by)}Q${pt(bx + nx * ll * 0.6, by + ny * ll * 0.6)} ${pt(bx + nx * ll + (s - 0.5) * 40, by + ny * ll - 6)}`
  }
  key += penD(lashes, INK, 6)
  return { pink: fillD(ellipse(x, cy, W * 0.62, H * 1.6), PINK, ' opacity="0.45"'), key }
}

/* ── "Say goodbye to all you know": snapshots fall out of the mirror ──── */
const SNAPS = [['church', -300, 150, -8], ['pine', -130, 128, 6], ['sun', 60, 146, -4], ['heart', 250, 132, 9], ['flower', -220, 402, 5], ['sailboat', 180, 410, -7]]
function snapshots(P, now) {
  const { x } = P.snaps
  const words = P.W.goodbye
  let pink = ''
  let key = ''
  SNAPS.forEach(([motif, dx, y, deg], i) => {
    const w = words[Math.min(words.length - 1, i)]
    const u = clamp01((now - w.t) / 1.0)
    const fall = u * u
    const px = x + dx + 30 * fall * (i % 2 ? 1 : -1)
    const py = y + 700 * fall
    const rot = deg + (i % 2 ? 70 : -60) * fall
    if (py > PIC_BOTTOM + 200) return
    const tr = `rotate(${r(rot)} ${I(px)} ${I(py + 60)})`
    const card = `M${pt(px - 70, py)}H${I(px + 70)}V${I(py + 160)}H${I(px - 70)}Z`
    pink += g(fillD(`M${pt(px - 58, py + 12)}H${I(px + 58)}V${I(py + 128)}H${I(px - 58)}Z`, PINK, ' opacity="0.7"'), tr)
    key += g(fillD(card, PAPER) + penD(card, INK, 4) + `<g transform="translate(${I(px - 45)} ${I(py + 24)}) scale(0.9)" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${motifBody(motif)}</g>`, tr)
  })
  return { pink, key }
}

/* ── "Try to land DiMaggio": the diamond, a pitch, the glove ─────────── */
function ballpark(P, now) {
  const { x } = P.ball
  const T = P.T
  const cy = FLOOR - 70
  const dia = `M${pt(x - 420, cy)}L${pt(x, cy - 90)}L${pt(x + 420, cy)}L${pt(x, cy + 90)}Z`
  let key = penD(dia, INK, 5)
  for (const [bx, by] of [[x - 420, cy], [x, cy - 90], [x + 420, cy], [x, cy + 90]]) key += fillD(`M${pt(bx, by - 12)}l18 12l-18 12l-18 -12Z`, PAPER) + penD(`M${pt(bx, by - 12)}l18 12l-18 12l-18 -12Z`, INK, 3)
  const pink = fillD(`M${pt(x - 380, cy)}L${pt(x, cy - 80)}L${pt(x + 380, cy)}L${pt(x, cy + 80)}Z`, PINK)
  // The glove, at the right.
  const gx = x + 380
  const gy = 300
  const mitt = blob([[gx - 60, gy + 70], [gx - 80, gy], [gx - 64, gy - 70], [gx - 20, gy - 90], [gx + 20, gy - 84], [gx + 60, gy - 60], [gx + 74, gy], [gx + 50, gy + 70], [gx, gy + 90]])
  key += fillD(mitt, INK) + penD(`M${pt(gx - 40, gy - 50)}Q${pt(gx - 10, gy - 20)} ${pt(gx - 30, gy + 30)}M${pt(gx, gy - 70)}Q${pt(gx + 30, gy - 30)} ${pt(gx + 10, gy + 30)}`, PAPER, 4)
  // The ball: pitched on "Try", caught on "DiMaggio".
  const t0 = T.try - 0.1
  const t1 = T.dimaggio + 0.12
  if (now > t0) {
    const u = clamp01((now - t0) / (t1 - t0))
    const bx = lerp(x - 560, gx - 10, u)
    const by = lerp(420, gy - 10, u) - Math.sin(u * Math.PI) * 240
    const ball = circ(bx, by, 26)
    const spin = now * 500
    key += fillD(ball, PAPER) + penD(ball, INK, 4) + g(penD(`M${pt(bx - 16, by - 18)}Q${pt(bx - 6, by)} ${pt(bx - 16, by + 18)}M${pt(bx + 16, by - 18)}Q${pt(bx + 6, by)} ${pt(bx + 16, by + 18)}`, RED, 3), u < 1 ? `rotate(${r(spin % 360)} ${I(bx)} ${I(by)})` : '')
    if (u >= 1) {
      const k = 1 - easeInOut(ramp(now, t1, t1 + 0.8))
      if (k > 0) key += penD(`M${pt(gx - 60, gy - 110)}l-24 -24M${pt(gx, gy - 120)}v-34M${pt(gx + 56, gy - 104)}l24 -24`, INK, 5, op(k))
    }
  }
  return { pink, key }
}

/* ── Night: searchlights, the world, the ring, the wall ───────────────── */
function searchlights(bases, now, out = []) {
  let pink = ''
  let key = ''
  bases.forEach((bx, i) => {
    const k = out[i] ?? 1
    if (k <= 0) return
    const a = ((-90 + 26 * Math.sin(now * 0.45 + i * 1.9) + (i - (bases.length - 1) / 2) * 9) * Math.PI) / 180
    const half = 0.045
    const L = 1100
    const y = FLOOR - 20
    const beam = `M${pt(bx, y)}L${pt(bx + Math.cos(a - half) * L, y + Math.sin(a - half) * L)}L${pt(bx + Math.cos(a + half) * L, y + Math.sin(a + half) * L)}Z`
    pink += fillD(beam, PINK, op(k))
    key += fillD(ellipse(bx, y + 10, 46, 20), INK) + fillD(ellipse(bx, y, 34, 14), PAPER, op(k))
  })
  return { pink, key }
}

function globe(cx, now, at) {
  const rise = easeCamera(ramp(now, at - 0.35, at + 1.1))
  const R = 200
  const cy = FLOOR - 40 - R + (1 - rise) * 440
  const spin = (now * 0.35) % 1
  const stat = memo('globe-dots', () => halftoneD({ x0: -R, y0: -R, x1: R, y1: R, pitch: 13, tone: (px, py) => {
    const d = Math.hypot(px, py)
    if (d > R - 4) return 0
    return 0.12 + 0.55 * clamp01((px + py * 0.4) / R + 0.2)
  } }))
  let lines = ''
  for (let i = 0; i < 6; i++) {
    const ph = ((i / 6 + spin) % 1) * Math.PI
    const rx = Math.abs(Math.cos(ph)) * R
    if (rx > 3) lines += `M${pt(cx, cy - R)}A${r(rx)} ${R} 0 0 ${Math.cos(ph) > 0 ? 1 : 0} ${pt(cx, cy + R)}`
  }
  for (const v of [-0.6, -0.3, 0, 0.3, 0.6]) {
    const yy = cy + v * R
    const hw = Math.sqrt(1 - v * v) * R
    lines += `M${pt(cx - hw, yy)}Q${pt(cx, yy + 16)} ${pt(cx + hw, yy)}`
  }
  const clip = `translate(${I(cx)} ${I(cy)})`
  return {
    pink: fillD(circ(cx, cy, R), PINK),
    key: g(fillD(stat, INK), clip) + penD(lines, PAPER, 4) + penD(circ(cx, cy, R), PAPER, 6),
  }
}

function ringBox(cx, now, loveT, seventeenT) {
  const y = FLOOR - 40
  const open = easeOut(ramp(now, loveT - 0.1, loveT + 0.6))
  const box = `M${pt(cx - 80, y - 90)}H${I(cx + 80)}V${I(y)}H${I(cx - 80)}Z`
  const back = fillD(box, PAPER)
  let key = penD(box, INK, 3)
  let pink = fillD(`M${pt(cx - 66, y - 84)}H${I(cx + 66)}V${I(y - 30)}H${I(cx - 66)}Z`, PINK)
  // The lid, hinged at the back, its pink lining showing as it lifts.
  const lidH = 36 + 70 * open
  const lid = `M${pt(cx - 84, y - 90)}H${I(cx + 84)}L${pt(cx + 70, y - 90 - lidH)}H${I(cx - 70)}Z`
  key += fillD(lid, PAPER) + penD(lid, INK, 3)
  if (open > 0.05) pink += fillD(`M${pt(cx - 68, y - 96)}H${I(cx + 68)}L${pt(cx + 58, y - 84 - lidH)}H${I(cx - 58)}Z`, PINK)
  key += penD(`M${pt(cx - 80, y - 30)}H${I(cx + 80)}`, INK, 3)
  // The band: small and plain.
  if (open > 0.2) key += penD(ellipse(cx, y - 72, 24, 26), PAPER, 7) + penD(ellipse(cx, y - 72, 24, 26), INK, 2)
  const gl = land(now, seventeenT, 0.2) * (1 - easeInOut(ramp(now, seventeenT + 0.5, seventeenT + 1.8)))
  if (gl > 0) key += fillD(sparkle(cx + 22, y - 98, 30 * gl), PAPER)
  return { pink, key, back }
}

/* The wall: fifteen slots, pasted from the middle out. */
const SLOTS = (() => {
  const order = [7, 6, 8, 2, 12, 1, 3, 11, 13, 5, 9, 0, 10, 4, 14]
  return order.map((i) => ({ col: i % 5, row: Math.floor(i / 5) }))
})()
const SLOT_W = 200
const SLOT_H = 150
const SLOT_GAP = 24
const slotXY = (cx, s) => [cx + (s.col - 2) * (SLOT_W + SLOT_GAP), 128 + s.row * (SLOT_H + SLOT_GAP)]

/** When each slot is pasted, for one chorus's "world, it's more, more, more [… more]". */
function pasteTimes(line3, line4, withLast) {
  const world = line3.words.find((w) => /^world/.test(w.text)).t
  const mores = line3.words.filter((w) => /^more/.test(w.text)).map((w) => w.t)
  const groups = [[world], ...mores.map((t) => [t])]
  const counts = [1, 4, 5, 4]
  const times = []
  counts.forEach((c, gi) => {
    for (let j = 0; j < c; j++) times.push(groups[gi][0] + j * 0.06)
  })
  const last = line4.words.find((w, i) => i > 3 && /^more/.test(w.text))
  times.push(withLast && last ? last.t : Infinity)
  return times
}

function posterWall(uid, cx, now, times, fade = null) {
  let pink = ''
  let key = ''
  let back = ''
  SLOTS.forEach((s, i) => {
    const [px, py] = slotXY(cx, s)
    const x0 = px - SLOT_W / 2
    const frame = `M${pt(x0, py)}h${SLOT_W}v${SLOT_H}h${-SLOT_W}Z`
    key += penD(frame, PINK, 3, ' stroke-dasharray="10 9" opacity="0.6"')
    const k = land(now, times[i], 0.28)
    if (k <= 0) return
    const strength = fade ? fade(i) : 1
    // Pasted down from the top edge, like a bill poster's brush.
    const clip = `${uid}-pw${I(cx)}-${i}`
    const h = SLOT_H * k
    const lips = lipsD(px, py + SLOT_H * 0.5, SLOT_W * 0.66)
    const off = fade ? (1 - strength) * 34 : 0
    back += `<clipPath id="${clip}"><rect x="${x0 - 50}" y="${py}" width="${SLOT_W + 100}" height="${r(h)}"/></clipPath>${fillD(frame, PAPER, ` clip-path="url(#${clip})"`)}`
    key += `<g clip-path="url(#${clip})"><g${op(strength)}>${penD(lips.upper + lips.lower, INK, 4)}${penD(lips.seam, INK, 5)}${penD(lips.shine, PAPER, 5)}</g>`
    key += '</g>'
    pink += `<g clip-path="url(#${clip})"${op(0.25 + 0.75 * strength)}><g transform="translate(${r(off)} ${r(-off * 0.4)})">${fillD(lips.upper + lips.lower, PINK)}</g></g>`
  })
  return { pink, key, back }
}

/* ── The walk of fame ─────────────────────────────────────────────────── */
function pavementStar(cx) {
  return memo(`walkstar-${I(cx)}`, () => {
    const cy = FLOOR + 10
    const d = `M${pt(cx - 170, cy - 30)}L${pt(cx + 170, cy - 30)}L${pt(cx + 200, cy + 34)}L${pt(cx - 200, cy + 34)}Z`
    const s = starD(cx, cy, 70)
    const flat = `<g transform="translate(${I(cx)} ${I(cy)}) scale(1 0.34) translate(${-I(cx)} ${-I(cy)})">`
    return {
      pink: `${flat}${fillD(s, PINK)}</g>`,
      key: penD(d, PAPER, 3, ' opacity="0.6"') + `${flat}${penD(s, PAPER, 6)}</g>` + fillD(`M${pt(cx - 40, cy + 14)}h80v12h-80Z`, PAPER),
    }
  })
}
/** A premiere's marquee over the walk: a pink canopy, blank letter boards, bulbs that breathe. */
function premiere(cx, now, beat) {
  const y0 = PIC_TOP + 70
  const w = 720
  const h = 150
  const x0 = cx - w / 2
  const stat = memo(`premiere-${I(cx)}`, () => {
    const bulbs = []
    const n = 22
    for (let i = 0; i <= n; i++) bulbs.push([x0 + (w * i) / n, y0 + 14], [x0 + (w * i) / n, y0 + h - 14])
    let tiles = ''
    for (let row = 0; row < 2; row++) {
      const count = row ? 7 : 9
      const tw = 52
      const gap = 12
      const start = cx - (count * tw + (count - 1) * gap) / 2
      for (let i = 0; i < count; i++) tiles += `M${pt(start + i * (tw + gap), y0 + 36 + row * 44)}h${tw}v34h${-tw}Z`
    }
    return { bulbs, tiles }
  })
  let d = ''
  stat.bulbs.forEach(([bx, by], i) => {
    // A chase, but continuous: brightness is a travelling wave, not a switch.
    const k = 0.5 + 0.5 * Math.sin((now / beat) * Math.PI - i * 0.55)
    d += circ(bx, by, 4 + 4 * k)
  })
  return {
    pink: fillD(`M${pt(x0, y0)}h${w}v${h}h${-w}Z`, PINK) + fillD(`M${pt(x0 + 40, y0 + h)}L${pt(x0 + 90, y0 + h + 60)}H${I(x0 + w - 90)}L${pt(x0 + w - 40, y0 + h)}Z`, PINK, ' opacity="0.55"'),
    key: fillD(stat.tiles, PAPER) + fillD(d, PAPER),
  }
}

function stanchion(cx) {
  return `M${pt(cx - 7, FLOOR - 110)}h14v110h-14ZM${pt(cx - 26, FLOOR - 4)}h52v8h-52Z` + circ(cx, FLOOR - 118, 12)
}
function flash(x, y, k) {
  if (k <= 0.01) return ''
  let d = ''
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const L = (i % 2 ? 70 : 130) * k
    d += `M${pt(x + Math.cos(a - 0.05) * 16, y + Math.sin(a - 0.05) * 16)}L${pt(x + Math.cos(a) * L, y + Math.sin(a) * L)}L${pt(x + Math.cos(a + 0.05) * 16, y + Math.sin(a + 0.05) * 16)}Z`
  }
  return d + circ(x, y, 26 * k)
}

/* ── Verse 3 ──────────────────────────────────────────────────────────── */
function table(P, now) {
  const { x } = P.table
  const T = P.T
  const top = FLOOR - 70
  let pink = fillD(ellipse(x, top, 760, 70), PINK)
  let key = penD(ellipse(x, top, 760, 70), INK, 6) + penD(`M${pt(x - 760, top)}V${I(FLOOR + 60)}M${pt(x + 760, top)}V${I(FLOOR + 60)}`, INK, 6)
  // Dice: thrown on "Double", landed on "down" — doubles.
  const dice = [[-160, 0], [-60, 12]]
  dice.forEach(([dx, dy], i) => {
    const t0 = T.double - 0.3 + i * 0.08
    const t1 = T.down + 0.1 + i * 0.1
    const u = clamp01((now - t0) / (t1 - t0))
    if (now < t0) return
    const e = easeOut(u)
    const cx = lerp(x - 700, x + dx - 300, e)
    const cy = top - 40 + dy - Math.abs(Math.sin(u * Math.PI * 2.2)) * (1 - u) * 180
    const rot = (1 - e) * 600 + (i ? 8 : -6)
    const s = 74
    const face = `M${pt(cx - s / 2, cy - s / 2)}h${s}v${s}h${-s}Z`
    let pips = ''
    for (const [a, b] of [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]]) pips += circ(cx + a * s * 0.24, cy + b * s * 0.26, 7)
    key += g(fillD(face, PAPER) + penD(face, INK, 5) + fillD(pips, INK), `rotate(${r(rot)} ${I(cx)} ${I(cy)})`)
  })
  // Chips, stacking on "bets".
  const stacks = [[-420, 5], [-340, 8], [-250, 3]]
  stacks.forEach(([dx, n], si) => {
    for (let j = 0; j < n; j++) {
      const k = land(now, T.hedge + si * 0.12 + j * 0.05, 0.18)
      if (k <= 0) continue
      const cy = top - 18 - j * 14 - (1 - k) * 60
      key += fillD(ellipse(x + dx, cy, 42, 14), j % 2 ? PAPER : INK, op(k)) + penD(ellipse(x + dx, cy, 42, 14), INK, 3, op(k))
    }
  })
  // The diamond, from the album still, on "Diamonds"; sparkles on "only" and "friend".
  const D = { cx: x + 330, cy: 330, w: 380, h: 350 }
  const dk = easeOut(land(now, T.diamonds - 0.1, 0.5))
  if (dk > 0) {
    const s = 0.7 + 0.3 * dk
    const tr = `translate(${r(D.cx * (1 - s))} ${r(D.cy * (1 - s) + (1 - dk) * 60)}) scale(${r(s, 3)})`
    const dots = memo('diamond-dots', () => halftoneD({ x0: D.cx - D.w / 2, y0: D.cy - D.h * 0.14, x1: D.cx + D.w / 2, y1: D.cy + D.h * 0.58, pitch: 12, tone: (px, py) => {
      const v = (py - (D.cy - D.h * 0.14)) / (D.h * 0.72)
      if (Math.abs(px - D.cx) > (D.w / 2) * (1 - v)) return 0
      return 0.08 + v * 0.55 + (px > D.cx ? 0.12 : 0)
    } }))
    pink += g(fillD(diamondShape(D), PINK), tr, op(dk))
    key += g(fillD(diamondShape(D), PAPER, ' fill-opacity="0.35"') + fillD(dots, INK) + penD(diamondShape(D), INK, 7) + penD(diamondFacets(D), INK, 4), tr, op(dk))
    let sp = ''
    const shine = [[T.only, D.cx - 110, D.cy - 120, 30], [T.friend, D.cx + 120, D.cy - 90, 40], [T.friend + 0.12, D.cx - 20, D.cy - 180, 22]]
    for (const [tt, sx, sy, ss] of shine) sp += sparkle(sx, sy, ss * land(now, tt, 0.2) * (0.85 + 0.15 * Math.sin(now * 5 + sx)))
    key += fillD(sp, INK)
  }
  return { pink, key }
}

export function diamondShape({ cx, cy, w, h }) {
  const top = cy - h * 0.42
  const girdle = cy - h * 0.14
  const tip = cy + h * 0.58
  return `M${pt(cx - w / 2, girdle)}L${pt(cx - w * 0.28, top)}L${pt(cx + w * 0.28, top)}L${pt(cx + w / 2, girdle)}L${pt(cx, tip)}Z`
}
export function diamondFacets({ cx, cy, w, h }) {
  const top = cy - h * 0.42
  const girdle = cy - h * 0.14
  const tip = cy + h * 0.58
  const q = w * 0.1
  return `M${pt(cx - w / 2, girdle)}H${I(cx + w / 2)}M${pt(cx - w * 0.28, top)}L${pt(cx - q * 1.4, girdle)}L${pt(cx, top)}L${pt(cx + q * 1.4, girdle)}L${pt(cx + w * 0.28, top)}M${pt(cx - q * 1.4, girdle)}L${pt(cx, tip)}L${pt(cx + q * 1.4, girdle)}M${pt(cx - w / 2 + w * 0.14, girdle)}L${pt(cx, tip)}L${pt(cx + w / 2 - w * 0.14, girdle)}`
}

/* "Different lines paint different strokes": a squeegee pulls a stroke of pink. */
function squeegee(P, now) {
  const { x } = P.squeegee
  const T = P.T
  const x0 = x - 400
  const x1 = x + 400
  const y0 = 150
  const y1 = 470
  const u = easeInOut(ramp(now, T.different - 0.1, T.strokes + 0.35))
  const sx = lerp(x0 + 30, x1 - 30, u)
  const mesh = memo('mesh', () => halftoneD({ x0: x0 + 20, y0: y0 + 20, x1: x1 - 20, y1: y1 - 20, pitch: 10, max: 0.4, tone: () => 0.25 }))
  let pink = u > 0 ? fillD(`M${pt(x0 + 30, y0 + 40)}H${r(sx)}V${I(y1 - 40)}H${I(x0 + 30)}Z`, PINK) : ''
  // Two lines on "lines", in the pulled ink.
  const lk = land(now, T.lines, 0.3)
  let key = penD(`M${pt(x0, y0)}H${I(x1)}V${I(y1)}H${I(x0)}Z`, INK, 18) + fillD(mesh, INK, ' opacity="0.35"')
  key += drawn(`M${pt(x0 + 60, y0 + 110)}H${I(x1 - 60)}`, PAPER, 8, lk) + drawn(`M${pt(x0 + 60, y1 - 110)}H${I(x1 - 60)}`, PAPER, 8, land(now, T.lines + 0.2, 0.3))
  // The squeegee: a handle and a blade, leaning into the pull.
  const lean = 8 * Math.sin(u * Math.PI)
  key += g(fillD(`M${pt(sx - 20, y0 - 20)}h40v${y1 - y0 + 40}h-40Z`, INK) + fillD(`M${pt(sx + 20, y0 - 10)}h12v${y1 - y0 + 20}h-12Z`, PAPER) + penD(`M${pt(sx + 20, y0 - 10)}h12v${y1 - y0 + 20}h-12Z`, INK, 3), `rotate(${r(lean)} ${I(sx)} ${I((y0 + y1) / 2)})`)
  return { pink, key }
}

/** A capsule: one half paper, one half ink. */
function capsule(cx, cy, len, wid, deg) {
  const h = len / 2 - wid / 2
  const w = wid / 2
  const whole = `M${r(cx - h)} ${r(cy - w)}H${r(cx + h)}a${r(w)} ${r(w)} 0 0 1 0 ${r(wid)}H${r(cx - h)}a${r(w)} ${r(w)} 0 0 1 0 ${r(-wid)}Z`
  const half = `M${r(cx)} ${r(cy - w)}H${r(cx + h)}a${r(w)} ${r(w)} 0 0 1 0 ${r(wid)}H${r(cx)}Z`
  return g(fillD(whole, PAPER) + fillD(half, INK) + penD(whole, INK, 4), `rotate(${r(deg)} ${r(cx)} ${r(cy)})`)
}

/* "At least these pills should help you cope": the bottle tips, one pill a word. */
function pills(P, now, o = {}) {
  const x = o.x ?? P.pills.x
  const tipAt = o.tipAt ?? P.T.these
  const words = o.words ?? P.W.pills
  const bw = 120
  const bh = 190
  const ground = o.ground ?? FLOOR
  const bx = x - 200
  const tip = easeInOut(ramp(now, tipAt - 0.1, tipAt + 0.55))
  const pivot = [bx + bw / 2, ground]
  const tr = `rotate(${r(90 * tip)} ${I(pivot[0])} ${I(pivot[1])})`
  const body = `M${pt(bx - bw / 2, ground)}V${I(ground - bh + 20)}Q${pt(bx - bw / 2, ground - bh)} ${pt(bx - bw / 2 + 20, ground - bh)}H${I(bx + bw / 2 - 20)}Q${pt(bx + bw / 2, ground - bh)} ${pt(bx + bw / 2, ground - bh + 20)}V${I(ground)}Z`
  const cap = `M${pt(bx - 40, ground - bh)}V${I(ground - bh - 50)}H${I(bx + 40)}V${I(ground - bh)}Z`
  const pink = g(fillD(body, PINK), tr)
  let key = g(penD(body, INK, 6) + fillD(`M${pt(bx - bw / 2 + 10, ground - 140)}H${I(bx + bw / 2 - 10)}V${I(ground - 60)}H${I(bx - bw / 2 + 10)}Z`, PAPER) + penD(`M${pt(bx - bw / 2 + 10, ground - 140)}H${I(bx + bw / 2 - 10)}V${I(ground - 60)}H${I(bx - bw / 2 + 10)}Z`, INK, 3) + (o.capOff ? '' : fillD(cap, INK)), tr)
  const rand = rng(o.seed ?? 91)
  let spill = ''
  words.forEach((w, i) => {
    for (let j = 0; j < (o.per ?? 2); j++) {
      const k = easeOut(ramp(now, w.t + j * 0.08, w.t + j * 0.08 + 0.4))
      const tx = (o.spillFrom ?? x - 20) + i * (o.spacing ?? 70) + rand() * (o.jitter ?? 50)
      const ty = ground - 16 - rand() * 10
      const deg = rand() * 180
      if (k <= 0) continue
      spill += capsule(lerp(bx + bh, tx, k), lerp(ground - 50, ty, k), 60, 24, deg * k)
    }
  })
  key += spill
  return { pink, key }
}

/* ── The bedroom, and the telephone ───────────────────────────────────── */
export function telephoneParts(cx, cy, s) {
  return {
    body: `M${r(cx - s * 0.9)} ${r(cy + s * 0.55)} L${r(cx - s * 0.62)} ${r(cy - s * 0.2)} Q${r(cx)} ${r(cy - s * 0.36)} ${r(cx + s * 0.62)} ${r(cy - s * 0.2)} L${r(cx + s * 0.9)} ${r(cy + s * 0.55)} Z`,
    cradle: `M${r(cx - s * 0.5)} ${r(cy - s * 0.24)} V${r(cy - s * 0.44)} M${r(cx + s * 0.5)} ${r(cy - s * 0.24)} V${r(cy - s * 0.44)}`,
    handset: `M${r(cx - s * 1.0)} ${r(cy - s * 0.58)} Q${r(cx)} ${r(cy - s * 0.92)} ${r(cx + s * 1.0)} ${r(cy - s * 0.58)} L${r(cx + s * 1.0)} ${r(cy - s * 0.38)} L${r(cx + s * 0.62)} ${r(cy - s * 0.4)} Q${r(cx)} ${r(cy - s * 0.62)} ${r(cx - s * 0.62)} ${r(cy - s * 0.4)} L${r(cx - s * 1.0)} ${r(cy - s * 0.38)} Z`,
    dial: [cx, cy + s * 0.12, s * 0.34],
  }
}

function telephone(cx, cy, s, now, offHook = 0) {
  const p = telephoneParts(cx, cy, s)
  let key = fillD(p.body, PAPER) + penD(p.body, INK, 6) + penD(p.cradle, INK, 10)
  key += fillD(circ(p.dial[0], p.dial[1], p.dial[2]), PAPER) + penD(circ(p.dial[0], p.dial[1], p.dial[2]), INK, 5)
  let holes = ''
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 1.6 + 1.1
    holes += circ(p.dial[0] + Math.cos(a) * p.dial[2] * 0.66, p.dial[1] + Math.sin(a) * p.dial[2] * 0.66, 5)
  }
  key += fillD(holes, INK)
  const pink = fillD(p.body, PINK)
  if (offHook <= 0) return { pink, key: key + fillD(p.handset, INK) }
  // Off the hook: the handset hangs over the table's edge on its cord, swinging.
  const hx = cx + s * 1.9
  const hy = lerp(cy - s * 0.7, cy + s * 2.4, easeInOut(offHook))
  const swing = 9 * Math.sin(now * 1.3) * offHook
  let cord = `M${pt(cx + s * 0.9, cy + s * 0.3)}`
  const n = 22
  for (let i = 1; i <= n; i++) {
    const u = i / n
    const px = lerp(cx + s * 0.9, hx, u) + Math.sin(u * Math.PI * 14) * 8
    const py = lerp(cy + s * 0.3, hy - 30, u) + Math.sin(u * Math.PI) * 30
    cord += `L${pt(px, py)}`
  }
  key += penD(cord, INK, 4)
  key += g(fillD(p.handset, INK), `translate(${r(hx - cx)} ${r(hy - cy + s * 0.7)}) rotate(${r(80 + swing)} ${I(cx)} ${I(cy - s * 0.7)})`)
  return { pink, key }
}

function bedroom(P, now) {
  const { x } = P.bed
  const lampOff = P.T.lampOff
  const lit = 1 - easeInOut(ramp(now, lampOff, lampOff + 0.5))
  const bedX = x - 250
  const head = `M${pt(bedX - 380, FLOOR)}V${I(260)}Q${pt(bedX - 380, 200)} ${pt(bedX - 320, 200)}H${I(bedX - 280)}Q${pt(bedX - 250, 200)} ${pt(bedX - 250, 260)}V${I(FLOOR)}Z`
  const blanket = blob([[bedX - 260, 430], [bedX - 100, 400], [bedX + 120, 420], [bedX + 300, 410], [bedX + 330, 470], [bedX + 330, FLOOR - 10], [bedX - 260, FLOOR - 10]])
  const pillow = blob([[bedX - 250, 380], [bedX - 180, 360], [bedX - 120, 372], [bedX - 110, 420], [bedX - 190, 430], [bedX - 250, 420]])
  const back = `<g${op(lit)}>${pool(x, 390, 720, 250)}</g>`
  let pink = fillD(blanket, PINK)
  let key = fillD(head, INK) + fillD(pillow, PAPER) + penD(pillow, INK, 4) + penD(blanket, INK, 5)
  key += penD(`M${pt(bedX - 150, 440)}Q${pt(bedX - 40, 500)} ${pt(bedX + 60, 470)}M${pt(bedX + 20, 520)}Q${pt(bedX + 140, 470)} ${pt(bedX + 260, 520)}M${pt(bedX - 200, 540)}Q${pt(bedX - 60, 510)} ${pt(bedX + 40, 570)}`, INK, 4)
  // The bedside table and its lamp.
  const tx = x + 260
  const tTop = 420
  key += fillD(`M${pt(tx - 130, tTop)}H${I(tx + 130)}V${I(FLOOR)}H${I(tx - 130)}Z`, INK) + penD(`M${pt(tx - 110, tTop + 60)}H${I(tx + 110)}`, PAPER, 3)
  const shade = `M${pt(tx - 110, 210)}L${pt(tx - 70, 130)}H${I(tx - 10)}L${pt(tx + 30, 210)}Z`
  key += penD(`M${pt(tx - 40, 210)}V${I(tTop - 30)}M${pt(tx - 70, tTop - 4)}Q${pt(tx - 40, tTop - 40)} ${pt(tx - 10, tTop - 4)}`, INK, 8)
  key += fillD(shade, lit > 0.5 ? PAPER : INK) + penD(shade, INK, 5)
  if (lit > 0) {
    const glow = memo('lampglow', () => halftoneD({ x0: tx - 420, y0: PIC_TOP, x1: tx + 340, y1: tTop, pitch: 16, tone: (px, py) => {
      const d = Math.hypot(px - tx + 40, (py - 180) * 1.3)
      return d < 360 ? 0.5 * (1 - d / 360) : 0
    } }))
    pink += fillD(glow, PINK, op(lit))
  }
  return { pink, key: `<g${op(0.25 + 0.75 * lit)}>${key}</g>`, back, tableTop: tTop, tableX: tx }
}

/* ══ THE PLAN — times and places, solved once per score ════════════════ */

const PLANS = new WeakMap()
let planSeq = 0

function planFor(score, uid) {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return { ...PLANS.get(score), uid }
}

function buildPlan(score) {
  planSeq++
  const inSec = (id) => score.lines.filter((l) => l.section === id)
  const sec = (id) => {
    const s = score.sections.find((x) => x.id === id)
    if (!s) throw new Error(`screenprint: no section ${id}`)
    return s
  }
  const wt = (line, re, nth = 0) => {
    const found = line?.words.filter((w) => re.test(w.text))
    if (!found?.length) throw new Error(`screenprint: no word ${re} in "${line?.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const v1 = inSec('verse-1')
  const v2 = inSec('verse-2')
  const v3 = inSec('verse-3')
  const pres = ['pre-1', 'pre-2', 'pre-3'].map(inSec)
  const chs = ['chorus-1', 'chorus-2', 'chorus-3'].map(inSec)
  const S = Object.fromEntries(score.sections.map((s) => [s.id, s]))

  const T = {
    silver: wt(v1[0], /^Silver/), screen: wt(v1[0], /^screen/), norma: wt(v1[0], /^Norma/), oh1: wt(v1[0], /^oh/),
    silhouette: wt(v1[2], /^silhouette/), juliet: wt(v1[2], /^Juliet/), oh3: wt(v1[2], /^oh/),
    someone: wt(v1[3], /^Someone/), cut: wt(v1[3], /^cut/), checks: wt(v1[3], /^checks/),
    die: wt(v2[0], /^Die/), change: wt(v2[0], /^change/), clothes: wt(v2[0], /^clothes/),
    bat: wt(v2[1], /^Bat/), really: wt(v2[1], /^really/), slow: wt(v2[1], /^slow/),
    try: wt(v2[3], /^Try/), dimaggio: wt(v2[3], /^DiMaggio/),
    double: wt(v3[0], /^Double/), down: wt(v3[0], /^down/), hedge: wt(v3[0], /^hedge/),
    diamonds: wt(v3[1], /^Diamonds/), only: wt(v3[1], /^only/), friend: wt(v3[1], /^friend/),
    different: wt(v3[2], /^Different/), lines: wt(v3[2], /^lines/), strokes: wt(v3[2], /^strokes/),
    these: wt(v3[3], /^these/), pills: wt(v3[3], /^pills/), cope: wt(v3[3], /^cope/),
    end: score.endCardAt ?? score.duration,
  }
  const W = {
    bigger: v1[1].words,
    goodbye: v2[2].words.slice(1),
    pills: v3[3].words.slice(3),
  }

  /* The leader: one sweep a bar, the last one ending on the first sung word. */
  const beat = 60 / (score.bpm ?? 95)
  const barLen = beat * 4
  const bars = Math.floor(T.silver / barLen)
  const bar = { len: barLen, from: T.silver - bars * barLen }

  /* ── The camera: a drift, plus half-cosine moves between views ─────── */
  const moves = []
  const mv = (a, b, A) => moves.push({ a, b: Math.max(b, a + 1.2), A })
  // Verse 1.
  mv(v1[0].end - 0.6, v1[1].start + 0.7, 1100) // theatre → the hill
  mv(v1[1].end + 1.1, v1[2].start - 1.0, 1250) // → the balcony
  mv(v1[2].end - 0.5, v1[3].start + 0.8, 640) // → the cheque
  mv(v1[3].end + 1.0, pres[0][0].start - 0.8, 1300) // → the first clapper
  const pushes = (pre) => mv(pre[0].end + 0.8, pre[1].start - 0.2, 120)
  pushes(pres[0])
  // The sound stage: one long slow move through the break.
  mv(pres[0][1].end + 3.0, v2[0].start - 0.6, 3300)
  // Verse 2.
  mv(v2[0].end - 0.1, v2[1].start + 0.65, 700) // wig and dress → the eye
  mv(v2[1].end + 1.4, v2[2].start - 0.6, 1150) // → the snapshots
  mv(v2[2].end - 0.1, v2[3].start + 0.7, 560) // → the diamond
  mv(v2[3].end + 1.1, pres[1][0].start - 0.8, 1300) // → the second clapper
  pushes(pres[1])
  // A chorus: the world, the ring, the wall, and the empty space on the wall.
  const chorusMoves = (c, into) => {
    mv(into.from, into.to, 1400)
    mv(c[0].end + 0.3, c[1].start - 0.05, 800)
    mv(c[1].end + 0.1, c[2].start + 0.35, 950)
    mv(c[2].end + 0.7, c[3].start - 0.4, 330)
  }
  chorusMoves(chs[0], { from: pres[1][1].end + 0.2, to: chs[0][0].start - 0.15 })
  // The walk of fame.
  mv(chs[0][3].end + 1.4, v3[0].start - 0.7, 3600)
  // Verse 3.
  mv(v3[0].end - 0.5, v3[1].start + 0.55, 350) // dice → diamond, one view
  mv(v3[1].end + 0.7, v3[2].start - 0.4, 1300) // → the squeegee
  mv(v3[2].end, v3[3].start + 0.7, 650) // → the pills
  mv(v3[3].end + 0.5, pres[2][0].start - 0.5, 1300) // → the third clapper
  pushes(pres[2])
  chorusMoves(chs[1], { from: pres[2][1].end + 0.2, to: chs[1][0].start + 0.3 })
  // The bedroom, and back into the night.
  const brk3 = sec('break-3')
  mv(chs[1][3].end + 2.2, brk3.from + 3.6, 1500)
  chorusMoves(chs[2], { from: brk3.to - 2.7, to: chs[2][0].start - 0.2 })
  // The outro: the telephone, then the last clapper.
  const outro = sec('outro')
  mv(chs[2][3].end + 1.4, outro.from + 3.5, 1800)
  mv(outro.from + 12.6, outro.from + 18.2, 1300)

  moves.sort((a, b) => a.a - b.a)
  const cam = (t) => {
    let x = DRIFT * t
    for (const m of moves) {
      if (t <= m.a) break
      x += m.A * easeCamera(ramp(t, m.a, m.b))
    }
    return x
  }
  /** World x of screen x `sx` at time `t`. */
  const X = (t, sx = 800) => cam(t) + sx - 800

  /* ── Where everything is: placed from where the camera is on its word ── */
  const P = {
    theatre: { x: X(10.5), from: X(10.5) - 1500, to: X(16) + 1080 },
    hill: { x: X(v1[1].words[1].t + 0.5, 900), from: 0 },
    balcony: { x: X(T.silhouette, 620) },
    cheque: { x: X(T.cut, 900) },
    clappers: pres.map((p) => ({ x: X(p[0].words[4].t, 800), lines: p })),
    // The sound stage is laid out for the fast middle of the break's move and
    // is all off the left of the frame before the dressing room comes in.
    stage: [X(S['break-1'].from + 4.5, 900), X(S['break-1'].from + 2.5, 820), X(S['break-1'].from + 6.5, 700), X(S['break-1'].from + 8.5, 820), X(S['break-1'].from + 10, 900)],
    room: { from: X(v2[0].start - 0.2, 0), to: X(v2[3].end + 0.6, 1900) },
    wig: { x: X(T.die, 520) },
    dress: { x: X(T.die, 1010) },
    eye: { x: X(T.really, 800) },
    snaps: { x: X(v2[2].words[2].t, 660) },
    ball: { x: X(T.dimaggio, 700) },
    table: { x: X(T.diamonds, 610) },
    squeegee: { x: X(T.strokes - 0.6, 800) },
    pills: { x: X(T.pills, 820) },
    bed: { x: X(brk3.from + 8, 800) },
    phone: { x: X(outro.from + 7, 820) },
    last: { x: X(T.end - 1.5, 800) },
  }
  P.choruses = chs.map((c, i) => ({
    lines: c,
    globe: X(wt(c[0], /^world/), 800),
    ring: X(wt(c[1], /^love/), 800),
    wall: X(wt(c[2], /^world/), 800),
    paste: pasteTimes(c[2], c[3], i > 0),
    lights: [-620, -300, 280, 620].map((d) => X(c[0].start, 800 + d)),
  }))
  // The wall in the last chorus fades the way the Diptych does.
  P.choruses[2].fade = (i) => lerp(0.9, 0.12, i / 14)
  // The searchlights of the last chorus go out one by one on its last line.
  P.choruses[2].lightsOut = (now) => [0, 1, 2, 3].map((i) => 1 - easeInOut(ramp(now, chs[2][3].words[i].t, chs[2][3].words[i].t + 0.5)))
  T.lampOff = brk3.to - 3.5
  // The bedroom's telephone is the one that ends up off the hook in the outro.
  P.bedPhone = { x: P.bed.x + 260 - 30, y: 400 }

  /* ── Night: where the ink sky is ─────────────────────────────────────── */
  const nights = [
    { from: X(chs[0][0].start - 1.0, 1250), to: X(v3[0].start - 1.2, 300) },
    { from: X(chs[1][0].start - 0.8, 1250), to: Infinity },
  ]
  const room = P.room

  /* ── The lipstick: where it is ahead of the camera, and its line ───────── */
  const signFrom = T.someone - 0.1
  const signTo = T.checks + 0.2
  const SIGN = 330
  const drop = outro.from + 9
  const lead = (t) => LEAD + SIGN * easeInOut(ramp(t, signFrom, signTo)) - SIGN * easeInOut(ramp(t, signTo + 0.4, signTo + 3.0))
  const tipU = (t) => cam(Math.min(t, drop)) + lead(Math.min(t, drop))
  // The cheque's signature line, in world coordinates (the cheque is rotated −4°, near enough flat).
  const sigX0 = P.cheque.x + 320 - 270 + 10
  const sigY = 250 + 208
  const uSign0 = tipU(signFrom + 0.15)
  const uSign1 = tipU(signTo - 0.05)
  const yBase = (u) => 632 + 7 * Math.sin(u / 170) + 4 * Math.sin(u / 61)
  // The line is a function of progress u: a gentle wander along the foot of the
  // frame, climbing to the cheque to sign it — a signature is loops, so there
  // x runs backwards and forwards as a prolate cycloid.
  const pointAt = (u) => {
    const climb0 = uSign0 - 260
    const climb1 = uSign1 + 320
    if (u < climb0 || u > climb1) return [u, yBase(u)]
    if (u < uSign0) {
      const k = smooth((u - climb0) / (uSign0 - climb0))
      return [u, lerp(yBase(u), sigY - 14, k)]
    }
    if (u > uSign1) {
      const k = smooth((u - uSign1) / (climb1 - uSign1))
      return [u, lerp(sigY - 14, yBase(u), k)]
    }
    const s = (u - uSign0) / (uSign1 - uSign0)
    const ph = s * Math.PI * 2 * 5.5
    const R = 26 * (1 - 0.4 * s)
    return [u - R * 1.3 * Math.sin(ph), sigY - 14 - R * (1 - Math.cos(ph)) * 0.9 + 6 * Math.sin(s * 9)]
  }
  const STEP = 7
  const u0 = tipU(0) - 1200
  const uEnd = tipU(drop)
  const pts = []
  for (let u = u0; u <= uEnd; u += STEP) pts.push(pointAt(u))
  pts.push(pointAt(uEnd))

  return { T, W, S, P, X, cam, moves, bar, nights, room, tipU, lead, drop, pts, u0, STEP, uEnd, sigX0, id: planSeq }
}

/* ══ THE REGISTER — how far the pink screen is off the key ═════════════ */
function registerAt(plan, now) {
  let amp = 12 + 5 * Math.sin(now * 0.21)
  // "Goodbye" pulls it almost into register, and it drifts off again after the line.
  let pull = 0
  for (const c of plan.P.choruses) {
    const l1 = c.lines[0]
    const k = easeInOut(ramp(now, l1.start - 0.5, l1.start + 0.4)) * (1 - easeInOut(ramp(now, l1.end + 0.3, l1.end + 2.2)))
    pull = Math.max(pull, k)
  }
  amp = lerp(amp, 1.8, pull)
  // The last chorus and the outro: the screens come apart.
  const last = plan.P.choruses[2].lines
  amp += 12 * easeInOut(ramp(now, last[0].end, last[3].end)) + 30 * easeInOut(ramp(now, last[3].end, plan.T.end))
  const a = 0.37 * now + 0.9 * Math.sin(now * 0.11)
  return { x: amp * Math.cos(a), y: amp * 0.65 * Math.sin(a) }
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

export function screenprintFrame({ time, score, lockup = '', uid = 'nj' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const plan = planFor(score, uid)
  const { P, T, S } = plan
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const cam = plan.cam(now)
  const v = cam - 800
  const vis = (a, b) => b >= v - 60 && a <= v + 1660
  const off = registerAt(plan, now)
  // What the props read: their places, the named times and words, the uid.
  const ctx = { ...P, T, W: plan.W, uid, bar: plan.bar, view: cam - 800 }

  const back = []
  const pink = []
  const key = []
  const red = []
  const top = []
  const add = (p) => {
    if (!p) return
    if (p.back) back.push(p.back)
    if (p.pink) pink.push(p.pink)
    if (p.key) key.push(p.key)
    if (p.red) red.push(p.red)
  }

  /* ── The ground: night, the dressing room's wall, the stage floor ─────── */
  for (const n of plan.nights) if (vis(n.from - 700, n.to + 700)) back.push(inkZone(n.from, n.to, v))
  if (vis(plan.room.from - 400, plan.room.to + 400)) {
    const { from, to } = plan.room
    // A tint of the pink, as a flat at half strength; its ends break into dots of the same tint.
    pink.push(fillD(`M${pt(from, PIC_TOP)}H${I(to)}V${I(FLOOR - 70)}H${I(from)}Z`, PINK, ' opacity="0.5"'))
    for (const [edge, dir] of [[from, -1], [to, 1]]) {
      if (!vis(edge - 420, edge + 420)) continue
      pink.push(fillD(memo(`roomseam-${I(edge)}`, () => halftoneD({ x0: dir < 0 ? edge - 400 : edge, y0: PIC_TOP, x1: dir < 0 ? edge : edge + 400, y1: FLOOR - 70, pitch: 18, max: 0.82, tone: (px) => clamp01(dir < 0 ? 1 - (edge - px) / 400 : 1 - (px - edge) / 400) ** 0.8 })), PINK, ' opacity="0.5"'))
    }
    key.push(fillD(`M${pt(Math.max(from, v - 60), FLOOR - 70)}H${I(Math.min(to, v + 1660))}V${I(FLOOR - 48)}H${I(Math.max(from, v - 60))}Z`, INK))
  }
  // The floor line, wherever it is day.
  key.push(penD(`M${pt(v - 60, FLOOR + 2)}H${I(v + 1660)}`, INK, 3, ' opacity="0.8"'))

  /* ── Verse 1 ──────────────────────────────────────────────────────────── */
  if (vis(P.theatre.from, P.theatre.to)) add(theatre(ctx, now))
  if (vis(P.hill.x - 1100, P.hill.x + 1100)) add(hill(ctx, now))
  if (vis(P.balcony.x - 400, P.balcony.x + 360)) add(balcony(ctx, now))
  if (vis(P.cheque.x - 400, P.cheque.x + 400)) add(cheque(ctx, now))

  /* ── The clapperboards ────────────────────────────────────────────────── */
  P.clappers.forEach((c, i) => {
    if (!vis(c.x - 600, c.x + 600)) return
    pink.push(fillD(spotPool(c.x), PINK, ' opacity="0.8"'))
    add(clapper(c.x, clapperOpen(now, c.lines), FLOOR, i === 2))
  })

  /* ── The sound stage ──────────────────────────────────────────────────── */
  const [camX, lampA, chairX, lampB, cansX] = P.stage
  const beatAt = (k) => (score.beatPhase ?? 0) + k * (60 / (score.bpm ?? 95))
  const beatNear = (t) => beatAt(Math.round((t - (score.beatPhase ?? 0)) / (60 / (score.bpm ?? 95))))
  if (vis(lampA - 520, lampA + 520)) add(lamp(lampA, land(now, beatNear(S['break-1'].from + 5.2), 0.2)))
  if (vis(lampB - 520, lampB + 520)) add(lamp(lampB, land(now, beatNear(S['break-1'].from + 12.8), 0.2)))
  if (vis(camX - 250, camX + 250)) add(movieCamera(camX))
  if (vis(chairX - 150, chairX + 150)) add(chair(chairX))
  if (vis(chairX + 420 - 240, chairX + 420 + 240)) add(boom(chairX + 420))
  if (vis(cansX - 160, cansX + 160)) add(filmCans(cansX))

  /* ── Verse 2: the dressing room ───────────────────────────────────────── */
  if (vis(P.wig.x - 260, P.dress.x + 260)) {
    add(mirror((P.wig.x + P.dress.x) / 2, 300, 820, 330, S['verse-2'].from + 0.2, now))
    add(wigHead(ctx, now))
    add(dressForm(ctx, now))
  }
  if (vis(P.eye.x - 420, P.eye.x + 420)) {
    add(mirror(P.eye.x, 330, 700, 360, T.bat - 0.3, now))
    add(eye(ctx, now))
  }
  if (vis(P.snaps.x - 420, P.snaps.x + 420)) {
    add(mirror(P.snaps.x, 300, 520, 330, plan.W.goodbye[0].t - 1.4, now))
    add(snapshots(ctx, now))
  }
  if (vis(P.ball.x - 620, P.ball.x + 520)) add(ballpark(ctx, now))

  /* ── The choruses ─────────────────────────────────────────────────────── */
  P.choruses.forEach((c, ci) => {
    const lights = c.lights
    if (vis(lights[0] - 600, lights[3] + 600)) add(searchlights(lights, now, c.lightsOut ? c.lightsOut(now) : undefined))
    if (vis(c.globe - 260, c.globe + 260)) {
      const w = c.lines[0].words.find((w) => /^world/.test(w.text)).t
      const gl = globe(c.globe, now, w)
      if (ci === 2) {
        const fade = 1 - 0.55 * easeInOut(ramp(now, c.lines[0].end, c.lines[0].end + 2))
        gl.key = `<g${op(fade)}>${gl.key}</g>`
        gl.pink = `<g${op(fade)}>${gl.pink}</g>`
      }
      add(gl)
    }
    if (vis(c.ring - 200, c.ring + 200)) {
      const love = c.lines[1].words.find((w) => /^love/.test(w.text)).t
      const seventeen = c.lines[1].words.find((w) => /^seventeen/.test(w.text)).t
      add(ringBox(c.ring, now, love, seventeen))
    }
    if (vis(c.wall - 640, c.wall + 640)) add(posterWall(uid, c.wall, now, c.paste, c.fade))
  })

  /* ── The walk of fame ─────────────────────────────────────────────────── */
  const walk0 = P.choruses[0].wall + 760
  const walk1 = P.table.x - 1000
  if (vis(walk0, walk1)) {
    const lo = Math.max(walk0, v - 300)
    const hi = Math.min(walk1, v + 1900)
    for (let sx = walk0 + 200 + Math.ceil((lo - walk0) / 460) * 460; sx < hi; sx += 460) add(pavementStar(sx))
    let posts = ''
    let rope = ''
    for (let sx = walk0 + Math.ceil((lo - walk0) / 230) * 230; sx < hi; sx += 230) {
      posts += stanchion(sx)
      rope += `M${pt(sx, FLOOR - 104)}Q${pt(sx + 115, FLOOR - 50)} ${pt(sx + 230, FLOOR - 104)}`
    }
    key.push(fillD(posts, PAPER) + penD(rope, PINK, 9))
    for (let mx = walk0 + 700 + Math.max(0, Math.ceil((lo - 800 - walk0 - 700) / 1500)) * 1500; mx < hi + 400; mx += 1500) add(premiere(mx, now, 60 / (score.bpm ?? 95)))
    // Flashbulbs on the downbeats, never two at once.
    const brk = S['break-2']
    const bl = 4 * 60 / (score.bpm ?? 95)
    const first = beatNear(brk.from + 1)
    let flashes = ''
    for (let k = 0; first + k * bl < brk.to + 1; k++) {
      const tt = first + k * bl + (k % 2 ? bl / 2 : 0)
      const age = now - tt
      if (age < 0 || age > 0.8) continue
      const rand = rng(300 + k)
      const fx = plan.cam(tt) + 200 + rand() * 1100
      const fy = 170 + rand() * 260
      flashes += flash(fx, fy, (1 - age / 0.8) ** 2)
    }
    if (flashes) key.push(fillD(flashes, PAPER))
  }

  /* ── Verse 3 ──────────────────────────────────────────────────────────── */
  if (vis(P.table.x - 800, P.table.x + 800)) add(table(ctx, now))
  if (vis(P.squeegee.x - 460, P.squeegee.x + 460)) add(squeegee(ctx, now))
  if (vis(P.pills.x - 300, P.pills.x + 500)) add(pills(ctx, now))

  /* ── The bedroom and the outro ────────────────────────────────────────── */
  const outro = S.outro
  if (vis(P.bed.x - 700, P.bed.x + 420)) {
    const room = bedroom(ctx, now)
    add(room)
    add(telephone(room.tableX - 20, room.tableTop - 44, 70, now, 0))
  }
  if (vis(P.phone.x - 600, P.phone.x + 700)) {
    const tx = P.phone.x
    back.push(`<g${op(land(now, outro.from - 1, 2.5))}>${pool(tx - 60, 420, 520, 200)}</g>`)
    // The same table and telephone, off the hook now; the bottle on its side and what is left of the pills.
    const tTop = 430
    key.push(fillD(`M${pt(tx - 240, tTop)}H${I(tx + 240)}V${I(FLOOR)}H${I(tx - 240)}Z`, INK) + penD(`M${pt(tx - 220, tTop + 60)}H${I(tx + 220)}`, PAPER, 3))
    add(pills(ctx, now, { x: tx - 30, tipAt: -10, words: plan.W.pills.slice(0, 3), ground: tTop, seed: 92, capOff: true, per: 1, spillFrom: tx + 34, spacing: 36, jitter: 16 }))
    add(telephone(tx + 170, tTop - 40, 62, now, easeInOut(ramp(now, outro.from + 1.5, outro.from + 3.2))))
  }
  if (vis(P.last.x - 600, P.last.x + 600)) {
    back.push(pool(P.last.x, FLOOR - 200, 360, 250))
    pink.push(fillD(spotPool(P.last.x), PINK, ' opacity="0.5"'))
    const shut = easeInOut(ramp(now, T.end - 0.22, T.end - 0.04))
    add(clapper(P.last.x, lerp(30, 0, shut), FLOOR, true))
  }

  /* ── The lipstick and its line: the one red thing, and in register ────── */
  const tip = plan.tipU(now)
  {
    const lo = v - 80
    const hi = v + 1680
    const i0 = Math.max(0, Math.floor((lo - 400 - plan.u0) / plan.STEP))
    const i1 = Math.min(plan.pts.length - 1, Math.floor((tip - plan.u0) / plan.STEP))
    if (i1 > i0) {
      let d = ''
      for (let i = i0; i <= i1; i++) {
        const [x, y] = plan.pts[i]
        if (x < lo - 400 || x > hi + 400) {
          if (d && !d.endsWith('|')) d += '|'
          continue
        }
        d += (d === '' || d.endsWith('|') ? 'M' : 'L') + pt(x, y)
      }
      d = d.replace(/\|/g, '')
      // Where the stick is now, exactly — between samples.
      const u = clamp01((tip - plan.u0) / plan.STEP - i1)
      const a = plan.pts[i1]
      const b = plan.pts[Math.min(plan.pts.length - 1, i1 + 1)]
      const tx = lerp(a[0], b[0], u)
      const ty = lerp(a[1], b[1], u)
      if (d) d += `L${pt(tx, ty)}`
      // It thins as it runs out, in the last chorus.
      const worn = 1 - 0.55 * easeInOut(ramp(now, P.choruses[2].lines[0].start, plan.drop))
      red.push(penD(d, RED, 9 * worn))
      // The lipstick itself, leaning into its line — and dropped at the end.
      const fall = easeInOut(ramp(now, plan.drop, plan.drop + 0.7))
      // Leaning into the line as it draws; dropped, it lies on its side with
      // the bullet at the end of the line.
      const lean = lerp(52, 90, fall)
      const lx = tx + 6 * fall
      const ly = ty - 16 * fall
      const s = 58
      const tube = `M${pt(lx - s * 0.36, ly - s * 1.9)}V${I(ly - s * 3.0)}H${I(lx + s * 0.36)}V${I(ly - s * 1.9)}Z`
      const sleeve = `M${pt(lx - s * 0.26, ly - s * 1.5)}V${I(ly - s * 1.9)}H${I(lx + s * 0.26)}V${I(ly - s * 1.5)}Z`
      const bullet = `M${pt(lx - s * 0.19, ly - s * 0.35)}V${I(ly - s * 1.5)}H${I(lx + s * 0.19)}V${I(ly - s * 0.1)}Z`
      red.push(g(fillD(bullet, RED) + fillD(sleeve, PAPER) + penD(sleeve, INK, 4) + penD(tube, PAPER, 5) + fillD(tube, INK), `rotate(${r(lean)} ${I(lx)} ${I(ly)})`))
    }
  }

  /* ── The film's edge: sprocket holes, moving with the strip ───────────── */
  let holes = ''
  const pitch = 56
  for (let hx = Math.floor(v / pitch) * pitch; hx < v + 1640; hx += pitch) {
    holes += `M${pt(hx - v + 14, TOP + 10)}h26v15h-26Z`
    holes += `M${pt(hx - v + 14, BOTTOM - 25)}h26v15h-26Z`
  }
  const edge = fillD(`M${pt(PL.x, TOP)}H${I(PL.x + PL.w)}V${I(PIC_TOP)}H${I(PL.x)}ZM${pt(PL.x, PIC_BOTTOM)}H${I(PL.x + PL.w)}V${I(BOTTOM)}H${I(PL.x)}Z`, INK) + fillD(holes, PAPER)

  /* ── The margin ───────────────────────────────────────────────────────── */
  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 3, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  // The print fails at the end: the pink starves.
  const starve = 1 - 0.5 * easeInOut(ramp(now, P.choruses[2].lines[2].start, T.end))

  const clip = plateClip(uid)
  const world = `translate(${r(-v, 1)} 0)`
  return {
    svg: [
      paper(),
      clip.def,
      `<g clip-path="${clip.url}">`,
      `<rect x="${PL.x}" y="${PL.y}" width="${PL.w}" height="${PL.h}" fill="${PAPER}"/>`,
      `<g transform="${world}">${back.join('')}</g>`,
      `<g transform="translate(${r(-v + off.x, 1)} ${r(off.y, 1)})"${op(starve)}>${pink.join('')}</g>`,
      `<g transform="${world}">${key.join('')}</g>`,
      `<g transform="${world}">${red.join('')}</g>`,
      top.join(''),
      edge,
      '</g>',
      margin,
    ].join('\n'),
    label: active?.text ?? section.label,
  }
}

/* For tools: the camera and the lipstick, so a script can measure them for smoothness. */
export const screenprintCamera = (score, now) => planFor(score, 'tool').cam(now)
export const screenprintTip = (score, now) => planFor(score, 'tool').tipU(now)
