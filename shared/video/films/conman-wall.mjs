/*
 * Conman — the wall of sections.
 *
 * The film the grid studies turned into (2026-09-25). Track 2 of the album
 * (app/config/albumStyle.ts); the song is about how being inspired by other
 * musicians is a kind of theft, and how that is not a bad thing: everybody
 * takes from everybody. So the film is one wall made of sections, each a grid
 * of one sheet repeated edge to edge — fly-posters, stamps, flyers, tickets,
 * banknotes, framed pictures, amps, a tour schedule, sticker sheets — and each
 * section is one artist, the same stencil on every sheet.
 * The words tear the sheets; tearing is paper tearing (shared/video/torn.mjs).
 *
 * The wall is black. The sections are pasted onto it as one collage, butted
 * edge to edge; the order the film goes through them, and what it does with
 * them after, is under THE PLAN below.
 *
 * Each section has one red thing — the conman — that lands on a sheet; the
 * next word tears it. Conman is the album's exception to one second ink per
 * song: every section has its own (albumStyle.ts, ALBUM_NOTES).
 *
 * `wallFrame({ time, score })` is a pure function of the clock; the plan — the
 * camera, every tear, the pile and the musician — is built once per score.
 * `makeWallFrame({ swap })` puts one section in another's slot.
 */
import { t, r, clamp01, easeOut, ramp, lerp, advance } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, PAPER_SHADE, INK, RED, SHEET, paper, plateClip, marginLyric, easeCamera, land } from '../album.mjs'
import { SCENES, makeKit, hash, GREEN, resample, inside, portraitDefs } from '../portraits.mjs'
// Imported by name, not bare: the server build drops a side-effect-only import, and the scenes with it.
import { WALL_OBJECTS } from '../still-lifes.mjs'
import { WALL_SITTERS } from '../wall-sitters.mjs'
import { piece, wholeSheet, tornLine, coreLine, tornSheet, flecks, polyPath, foldMatrix, mul, rotAbout, matStr, PEEL, BACK } from '../torn.mjs'

/* ══ INKS ══════════════════════════════════════════════════════════════ */
export const WALL_INKS = {
  posters: '#ee7a1f', // tangerine
  stamps: '#6a2ba0', // violet
  board: INK, // the White Stripes: black, paper and the red string
  tickets: INK,
  notes: '#0b7a4c', // emerald
  gallery: '#1f4fd1', // cobalt
  amps: '#e0a21b', // tweed gold
  tour: '#c9d81c', // chartreuse
  megStickers: INK,
  gearStickers: '#0f9a8f', // turquoise
}

const hatchPat = (id, angle, gap, width, colour) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="${gap / 2}" x2="${gap}" y2="${gap / 2}" stroke="${colour}" stroke-width="${width}"/></pattern>`
/** The portraits' second-ink hatches, in a section's own ink. */
const inkDefs = (u, tag, ink) => [
  hatchPat(`${u}-${tag}g0`, 0, 4.2, 0.75, ink), hatchPat(`${u}-${tag}g1`, 42, 4, 0.85, ink), hatchPat(`${u}-${tag}g2`, -40, 4.4, 0.8, ink),
  hatchPat(`${u}-${tag}g3`, 50, 2.8, 1.05, ink), hatchPat(`${u}-${tag}g4`, -36, 3.1, 1, ink),
].join('')

/** A scene's drawing, no ground, in a section's ink, once per frame (360 × 460 box). */
function art(ctx, B, id) {
  const gid = `${ctx.uid}-ar-${B.id}-${ctx.lod ? 'l' : ''}${id}`
  if (!ctx.defs.has(gid)) {
    const K = makeKit(ctx, ctx.lod ? `${id}-l` : id)
    const s = SCENES[id].draw(K).replaceAll(GREEN, B.ink).replaceAll(`url(#${ctx.uid}-g`, `url(#${ctx.uid}-${B.id}g`)
    ctx.defs.set(gid, `<g id="${gid}">${B.redInk ? redden(ctx, s) : s}</g>`)
  }
  return gid
}
const artAt = (ctx, B, id, x, y, s) => `<use href="#${art(ctx, B, id)}" transform="translate(${r(x, 1)} ${r(y, 1)}) scale(${r(s, 4)})"/>`
const rectD = (w, h) => `M0 0H${w}V${h}H0Z`
/** A mark landing: a little large and dropped on, over 120 ms. */
const slap = (now, at) => 1 + 0.35 * (1 - land(now, at, 0.12))
/** A def once per section per frame. */
const def = (ctx, id, make) => {
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<g id="${id}">${make()}</g>`)
  return id
}

/* ══ HOW A SHEET TEARS ═════════════════════════════════════════════════
 *
 * Each sheet picks one of a few layouts: pieces that never overlap, each
 * with a size — 0 a nick off a corner or a tab, 1 a corner, 2 a strip down
 * from the top edge, 3 half the sheet — and every layout ends in the whole
 * sheet coming away (4). A section escalates by letting bigger sizes through.
 * The pieces are placed as shares of the sheet so one set fits every format.
 */
function layoutsFor(w, h, seed, o = {}) {
  const L = 2 * (w + h)
  const left = (y) => 2 * w + h + (h - y) // perimeter position of (0, y)
  const right = (y) => w + y
  const bottom = (x) => w + h + (w - x)
  const rough = o.rough ?? 0.08
  const P = (from, to, size, extra = {}, k = 0) => piece(w, h, from, to, seed + k * 101, { rough, size, ...extra })
  const floor = o.floor ?? 1 // a sheet with tabs keeps its pieces above them
  const strip = (x0, x1, y, k) => P(x0, x1, 2, { via: [[x1 - 0.02 * w, y], [x0 + 0.03 * w, y + 0.03 * h]], hinge: [[x0, y + 0.015 * h], [x1, y + 0.015 * h]] }, k)
  const layouts = [
    [
      P(0.87 * w, right(0.09 * h), 0, {}, 1),
      strip(0.13 * w, 0.43 * w, 0.68 * h * Math.min(1, floor), 2),
      P(right(0.42 * h * floor), right(0.62 * h * floor), 1, { via: [[0.74 * w, 0.52 * h * floor]] }, 3),
      ...(floor < 1 ? [] : [P(bottom(0.33 * w), left(0.75 * h), 1, {}, 4)]),
    ],
    [
      P(left(0.62 * h * floor), 0.6 * w, 3, { via: [[0.28 * w, 0.3 * h * floor]] }, 5),
      P(0.82 * w, right(0.2 * h), 1, {}, 6),
      ...(floor < 1 ? [] : [P(right(0.9 * h), bottom(0.87 * w), 0, {}, 7)]),
    ],
    floor < 1
      ? [
          P(0.45 * w, right(0.72 * h * floor), 3, { via: [[0.62 * w, 0.4 * h * floor]] }, 8),
          P(L - 0.1 * h, 0.12 * w, 0, {}, 9),
          P(left(0.72 * h * floor), left(0.4 * h * floor), 1, { via: [[0.2 * w, 0.56 * h * floor]] }, 10),
        ]
      : [
          P(0.5 * w, bottom(0.57 * w), 3, { via: [[0.59 * w, 0.5 * h]] }, 8),
          P(L - 0.1 * h, 0.12 * w, 0, {}, 9),
          P(left(0.72 * h), left(0.4 * h), 1, { via: [[0.22 * w, 0.56 * h]] }, 10),
        ],
  ]
  const whole = o.whole === false ? null : wholeSheet(w, h, seed + 7, o.side ?? 'top', o.style ?? 'peel')
  return layouts.map((ls) => (whole ? [...ls, whole] : ls))
}

/* ══ THE FORMATS ═══════════════════════════════════════════════════════
 *
 * A format is a sheet and how a section of it looks:
 *
 *   cell       { w, h, gap }, brick (row offset as a share of the pitch)
 *   zoom       the camera's zoom holding on the section
 *   ground     the section's own backing, behind the grid
 *   base       the sheet as printed, once per section, as a def
 *   print      base plus the red mark once it has landed
 *   under      what a tear shows
 *   over       anything fixed over a sheet (a frame, perforations, a pin)
 *   journey    the red thing, when it is drawn over the grid rather than in it
 */
const TAG = (ctx, B, k) => `${ctx.uid}-${B.id}-${k}`

/* ── Fly-posting ─────────────────────────────────────────────────────── */
const POSTER = { w: 300, h: 420 }
const posters = {
  cell: { ...POSTER, gap: 6 },
  zoom: 0.8,
  layouts: layoutsFor(POSTER.w, POSTER.h, 17, { rough: 0.05 }),
  ground: INK,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const { w, h } = POSTER
    return `<rect width="${w}" height="${h}" fill="${B.ink}"/>${artAt(ctx, B, B.artist, w / 2 - 180 * 0.86, 44, 0.86)}` +
      `<rect width="${w}" height="72" fill="${PAPER}"/>${t({ x: w / 2, y: 58, size: 60, text: 'Tonight', fill: INK, anchor: 'middle', weight: 800, len: w - 30 })}` +
      `<rect y="${h - 58}" width="${w}" height="58" fill="${INK}"/>${t({ x: w / 2, y: h - 20, size: 26, text: 'One night only', fill: B.ink, anchor: 'middle', weight: 700, len: w - 40 })}`
  }),
  mark: (now, st) => `<g transform="translate(236 64) rotate(38) scale(${r(slap(now, st.t), 3)})"><rect x="-120" y="-21" width="240" height="42" fill="${RED}"/>${t({ x: 0, y: 11, size: 30, text: 'Again', fill: PAPER, anchor: 'middle', weight: 800, tracking: 5 })}</g>`,
  under: (ctx, B) => {
    const { w, h } = POSTER
    // The poster before, pasted a little higher: another face, in black and paper.
    const old = def(ctx, TAG(ctx, B, 'old'), () => `<rect width="${w}" height="${h}" fill="${PAPER}"/><rect width="${w}" height="${h}" fill="url(#${ctx.uid}-k1)" opacity="0.5"/>${artAt(ctx, B, B.before ?? 'mane', w / 2 - 180 * 0.8, 20, 0.8)}<rect y="${h - 110}" width="${w}" height="110" fill="${INK}"/>${t({ x: w / 2, y: h - 44, size: 64, text: 'Sold out', fill: PAPER, anchor: 'middle', weight: 800, len: w - 30 })}`)
    return `<use href="#${old}" transform="translate(0 -34)"/><use href="#${old}" transform="translate(0 386)"/>`
  },
}

/* ── Stamps ──────────────────────────────────────────────────────────── */
const STAMP = { w: 176, h: 214 }
const stamps = {
  cell: { ...STAMP, gap: 0 },
  zoom: 1.12,
  layouts: layoutsFor(STAMP.w, STAMP.h, 19, { rough: 0.1 }),
  ground: INK,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const { w, h } = STAMP
    return `<rect width="${w}" height="${h}" fill="${PAPER}"/><rect x="13" y="13" width="${w - 26}" height="${h - 26}" fill="${B.ink}"/>` +
      `<rect x="24" y="24" width="${w - 48}" height="${h - 72}" fill="${PAPER}"/>` +
      `<g clip-path="url(#${TAG(ctx, B, 'win')})">${artAt(ctx, B, B.artist, w / 2 - 180 * 0.4, 18, 0.4)}</g>` +
      t({ x: 30, y: h - 26, size: 34, text: '2', fill: PAPER, weight: 700 }) +
      t({ x: w - 24, y: h - 32, size: 10, text: 'Havre', fill: PAPER, weight: 700, anchor: 'end', tracking: 2 }) +
      t({ x: w - 24, y: h - 20, size: 10, text: 'de Grace', fill: PAPER, weight: 700, anchor: 'end', tracking: 2 })
  }),
  defs: (ctx, B) => `<clipPath id="${TAG(ctx, B, 'win')}"><rect x="24" y="24" width="${STAMP.w - 48}" height="${STAMP.h - 72}"/></clipPath>`,
  under: () => `<rect width="${STAMP.w}" height="${STAMP.h}" fill="${INK}"/>`,
  // The black between the stamps: holes punched along every edge.
  over: () => `<path d="${rectD(STAMP.w, STAMP.h)}" fill="none" stroke="${INK}" stroke-width="7" stroke-dasharray="0.01 11.6" stroke-linecap="round"/>`,
  journey: 'postmark',
}
function postmark(x, y, s = 1, o = 1) {
  let d = ''
  for (let k = 0; k < 5; k++) d += `M${r(x + 26)} ${r(y - 26 + k * 13)}q14 -7 28 0t28 0t28 0t28 0`
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(s, 3)}) translate(${r(-x)} ${r(-y)})" opacity="${r(0.9 * o, 3)}" fill="none" stroke="${RED}" stroke-width="3.2">` +
    `<circle cx="${r(x)}" cy="${r(y)}" r="30"/><circle cx="${r(x)}" cy="${r(y)}" r="21" stroke-width="1.6"/><path d="${d}"/></g>`
}

/* ── The notice board ────────────────────────────────────────────────── */
const FLYER = { w: 236, h: 340, tabTop: 272, tabs: 8 }
function tabPiece(i, seed) {
  const tw = FLYER.w / FLYER.tabs
  const x0 = i * tw
  const x1 = (i + 1) * tw
  const top = tornLine([x0, FLYER.tabTop], [x1, FLYER.tabTop], seed, { rough: 0.14, fine: 0.9, step: 3 })
  const core = coreLine(top, [(x0 + x1) / 2, FLYER.h], seed, 1.4, 4)
  return { region: [[x0, FLYER.h], ...top, [x1, FLYER.h]], coreRegion: [[x0, FLYER.h], ...core, [x1, FLYER.h]], line: top, hinge: [[x0, FLYER.tabTop], [x1, FLYER.tabTop]], centre: [(x0 + x1) / 2, (FLYER.tabTop + FLYER.h) / 2], style: 'pull', seed, size: 0 }
}
const board = {
  cell: { w: FLYER.w, h: FLYER.h, gap: 34 },
  brick: 0.18,
  zoom: 0.9,
  layouts: layoutsFor(FLYER.w, FLYER.h, 23, { rough: 0.1, floor: 0.74, style: 'pull' }).map((ls, k) => {
    const order = [[3, 6, 1, 4, 0, 7, 2, 5], [5, 2, 7, 0, 4, 1, 6, 3], [1, 4, 6, 2, 7, 3, 0, 5]][k]
    return [...order.map((i) => tabPiece(i, 300 + k * 40 + i)), ...ls]
  }),
  ground: PAPER_SHADE,
  groundOver: (ctx, B, x, y, w, h) => {
    const id = TAG(ctx, B, 'cork')
    if (!ctx.defs.has(id)) ctx.defs.set(id, `<pattern id="${id}" width="46" height="46" patternUnits="userSpaceOnUse"><circle cx="7" cy="9" r="1.6" fill="${INK}" opacity="0.16"/><circle cx="31" cy="21" r="1.1" fill="${INK}" opacity="0.12"/><circle cx="18" cy="38" r="2" fill="${INK}" opacity="0.1"/><circle cx="40" cy="41" r="1" fill="${INK}" opacity="0.14"/></pattern>`)
    return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="url(#${id})"/>`
  },
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const { w, h } = FLYER
    let s = `<rect width="${w}" height="${h}" fill="${INK}"/>`
    s += t({ x: w / 2, y: 70, size: 50, text: 'Guitar', fill: PAPER, anchor: 'middle', weight: 800, len: w - 34 })
    s += t({ x: w / 2, y: 100, size: 28, text: 'Lessons', fill: PAPER, anchor: 'middle', weight: 700, len: w - 76 })
    s += `<rect x="58" y="110" width="${w - 116}" height="122" fill="${PAPER}"/>`
    s += `<g clip-path="url(#${TAG(ctx, B, 'win')})">${artAt(ctx, B, B.artist, w / 2 - 180 * 0.3, 106, 0.3)}</g>`
    s += t({ x: w / 2, y: 252, size: 15, text: 'Learn any song', fill: PAPER, anchor: 'middle', weight: 700, tracking: 1 })
    s += t({ x: w / 2, y: 266, size: 10, text: 'Play like your heroes', fill: PAPER, anchor: 'middle', weight: 500, tracking: 1.2 })
    const tw = w / FLYER.tabs
    let cuts = ''
    for (let i = 1; i < FLYER.tabs; i++) cuts += `M${r(i * tw)} ${FLYER.tabTop}V${h}`
    s += `<path d="M0 ${FLYER.tabTop}H${w}" stroke="${PAPER}" stroke-width="1" stroke-dasharray="3 3"/><path d="${cuts}" stroke="${PAPER}" stroke-width="1"/>`
    for (let i = 0; i < FLYER.tabs; i++) s += t({ x: 0, y: 0, size: 9.5, text: 'Lessons 555 0168', fill: PAPER, weight: 700, anchor: 'middle', transform: `translate(${r(i * tw + tw / 2 + 3)} ${(FLYER.tabTop + h) / 2}) rotate(-90)` })
    return s
  }),
  defs: (ctx, B) => `<clipPath id="${TAG(ctx, B, 'win')}"><rect x="58" y="110" width="${FLYER.w - 116}" height="122"/></clipPath>`,
  under: () => '',
  over: (ctx, B, cell, now, plan) => pinAt(FLYER.w / 2, 14, plan && markOf(plan, cell, now) ? RED : INK),
  journey: 'string',
  pin: [FLYER.w / 2, 14],
}
const pinAt = (x, y, col = INK) => `<circle cx="${r(x)}" cy="${r(y + 3)}" r="8" fill="${INK}" opacity="0.3"/><circle cx="${r(x)}" cy="${r(y)}" r="8" fill="${col}"/><circle cx="${r(x - 2.5)}" cy="${r(y - 2.5)}" r="2.4" fill="${PAPER}" opacity="0.7"/>`

/* ── Tickets ─────────────────────────────────────────────────────────── */
const TICKET = { w: 380, h: 150, stub: 290 }
function ticketLayouts() {
  const { w, h, stub } = TICKET
  const L = 2 * (w + h)
  const perf = { rough: 0.012, fine: 0.5 }
  const stubPiece = (seed) => piece(w, h, stub, w + h + (w - stub), seed, { ...perf, size: 1 })
  const P = (from, to, size, extra = {}, seed = 1) => piece(w, h, from, to, seed, { rough: 0.08, size, ...extra })
  const whole = wholeSheet(w, h, 91, 'left')
  return [
    [stubPiece(31), P(L - 40, 44, 0, {}, 32), P(w + h + (w - 120), 2 * w + h + 60, 1, {}, 33), whole],
    [stubPiece(41), P(220, 270, 0, { via: [[245, 40]] }, 42), P(w + h + (w - 160), 140, 3, { via: [[150, 70]] }, 43), whole],
    [stubPiece(51), P(150, 210, 0, { via: [[180, 46]] }, 52), P(w + h + (w - 120), 2 * w + h + 60, 1, {}, 53), P(w + h + (w - 260), w + h + (w - 180), 2, { via: [[220, 100]] }, 54), whole],
  ]
}
const tickets = {
  cell: { w: TICKET.w, h: TICKET.h, gap: 18 },
  brick: 0.5,
  zoom: 1.0,
  layouts: ticketLayouts(),
  ground: INK,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const { w, h, stub } = TICKET
    let s = `<rect width="${w}" height="${h}" fill="${PAPER}"/><rect width="18" height="${h}" fill="${INK}"/><rect x="${stub}" width="${w - stub}" height="${h}" fill="${INK}"/>`
    s += `<circle cx="82" cy="75" r="52" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
    s += `<g clip-path="url(#${TAG(ctx, B, 'win')})">${artAt(ctx, B, B.artist, 82 - 180 * 0.27, 20, 0.27)}</g>`
    // A peppermint in the corner: ink and paper, turning.
    for (let k = 0; k < 8; k++) {
      const a0 = (k / 8) * Math.PI * 2
      const a1 = a0 + Math.PI / 8
      s += k % 2 ? '' : `<path d="M262 30L${r(262 + Math.cos(a0) * 18, 1)} ${r(30 + Math.sin(a0) * 18, 1)}A18 18 0 0 1 ${r(262 + Math.cos(a1) * 18, 1)} ${r(30 + Math.sin(a1) * 18, 1)}Z" fill="${INK}"/>`
    }
    s += `<circle cx="262" cy="30" r="18" fill="none" stroke="${INK}" stroke-width="1.6"/>`
    s += t({ x: 146, y: 72, size: 36, text: 'Admit one', fill: INK, weight: 800 })
    s += t({ x: 147, y: 96, size: 13, text: 'One night only', fill: INK, weight: 700, tracking: 3 })
    s += t({ x: 147, y: 120, size: 11, text: 'Standing · doors at seven', fill: INK, weight: 500, tracking: 1.5 })
    s += `<path d="M${stub} 4V${h - 4}" stroke="${PAPER}" stroke-width="3.4" stroke-dasharray="0.1 7" stroke-linecap="round"/>`
    s += t({ x: 0, y: 0, size: 17, text: 'Admit one', fill: PAPER, weight: 800, anchor: 'middle', tracking: 2, transform: `translate(${stub + 42} ${h / 2}) rotate(-90)` })
    s += t({ x: 0, y: 0, size: 9, text: 'Keep this stub', fill: PAPER, weight: 500, anchor: 'middle', tracking: 1.5, transform: `translate(${stub + 66} ${h / 2}) rotate(-90)` })
    return s
  }),
  defs: (ctx, B) => `<clipPath id="${TAG(ctx, B, 'win')}"><circle cx="82" cy="75" r="51"/></clipPath>`,
  mark: (now, st) => `<g transform="translate(206 104) rotate(-12) scale(${r(slap(now, st.t), 3)})" opacity="0.92"><rect x="-54" y="-20" width="108" height="40" rx="5" fill="none" stroke="${RED}" stroke-width="4"/>${t({ x: 0, y: 11, size: 30, text: 'Void', fill: RED, anchor: 'middle', weight: 800, tracking: 4 })}</g>`,
  // The tickets under these: the same, half a ticket over, in shadow.
  under: (ctx, B) => {
    const id = TAG(ctx, B, 'base')
    return `<use href="#${id}" transform="translate(-190 -84)"/><use href="#${id}" transform="translate(190 -84)"/><use href="#${id}" transform="translate(-190 84)"/><use href="#${id}" transform="translate(190 84)"/><rect width="${TICKET.w}" height="${TICKET.h}" fill="${INK}" opacity="0.3"/>`
  },
}

/* ── Banknotes ───────────────────────────────────────────────────────── */
const NOTE = { w: 400, h: 190 }
const serial = (n, x, y) => t({ x, y, size: 16, text: `HG ${String(1968 + n * 7).padStart(4, '0')}${String.fromCharCode(65 + (n % 26))}`, fill: RED, weight: 700, tracking: 2, anchor: 'middle' })
const notes = {
  cell: { w: NOTE.w, h: NOTE.h, gap: 16 },
  brick: 0.5,
  zoom: 0.95,
  layouts: layoutsFor(NOTE.w, NOTE.h, 13, { rough: 0.06 }),
  ground: PAPER,
  groundOver: (ctx, B, x, y, w, h) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="url(#${ctx.uid}-${B.id}g0)" opacity="0.25"/>`,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const E = B.ink
    const { w, h } = NOTE
    let s = `<rect width="${w}" height="${h}" fill="${PAPER}"/>`
    s += `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${E}" stroke-width="12"/>`
    s += `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${PAPER}" stroke-width="3" stroke-dasharray="0.1 7" stroke-linecap="round"/>`
    s += `<rect x="236" y="22" width="${w - 258}" height="${h - 44}" fill="${E}"/>`
    const cx = 236 + (w - 258) / 2
    for (let k = 0; k < 9; k++) s += `<ellipse cx="${r(cx)}" cy="${h / 2}" rx="54" ry="22" fill="none" stroke="${PAPER}" stroke-width="1.6" transform="rotate(${r((k / 9) * 180, 1)} ${r(cx)} ${h / 2})"/>`
    s += `<circle cx="${r(cx)}" cy="${h / 2}" r="14" fill="${INK}"/><circle cx="${r(cx)}" cy="${h / 2}" r="5" fill="${PAPER}"/>`
    s += `<rect x="22" y="22" width="206" height="${h - 44}" fill="${E}"/><rect x="22" y="22" width="206" height="${h - 44}" fill="url(#${ctx.uid}-k1)" opacity="0.35"/>`
    s += `<ellipse cx="120" cy="${h / 2}" rx="66" ry="72" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/><ellipse cx="120" cy="${h / 2}" rx="72" ry="78" fill="none" stroke="${E}" stroke-width="4"/>`
    s += `<g clip-path="url(#${TAG(ctx, B, 'win')})">${artAt(ctx, B, B.artist, 120 - 180 * 0.42, 95 - 200 * 0.42, 0.42)}</g>`
    s += t({ x: 200, y: 20, size: 9.5, text: 'This note is a copy of a copy', fill: INK, anchor: 'middle', weight: 600, tracking: 1.6 })
    s += t({ x: 200, y: h - 11, size: 9.5, text: 'Payable to whoever takes it next', fill: PAPER, anchor: 'middle', weight: 600, tracking: 1.4 })
    return s
  }),
  defs: (ctx, B) => `<clipPath id="${TAG(ctx, B, 'win')}"><ellipse cx="120" cy="${NOTE.h / 2}" rx="65" ry="71"/></clipPath>`,
  mark: (now, st) => `<g transform="translate(312 48) scale(${r(slap(now, st.t), 3)}) translate(-312 -48)"><rect x="262" y="33" width="100" height="22" fill="${PAPER}"/>${serial(st.n, 312, 50)}</g>`,
  // The sheet under this one: the same note, half a note over, in shadow.
  under: (ctx, B) => {
    const id = TAG(ctx, B, 'base')
    return `<use href="#${id}" transform="translate(-200 -60)"/><use href="#${id}" transform="translate(200 -60)"/><use href="#${id}" transform="translate(-200 130)"/><use href="#${id}" transform="translate(200 130)"/><rect width="${NOTE.w}" height="${NOTE.h}" fill="${INK}" opacity="0.22"/>`
  },
}

/* ── The gallery ─────────────────────────────────────────────────────── */
const PIC = { w: 252, h: 322 }
const gallery = {
  cell: { w: PIC.w, h: PIC.h, gap: 82 },
  zoom: 0.8,
  layouts: layoutsFor(PIC.w, PIC.h, 11, { rough: 0.08 }),
  // The wall is black: between the frames, and behind a picture torn out of one.
  ground: INK,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => `<rect x="-1" y="-1" width="${PIC.w + 2}" height="${PIC.h + 2}" fill="${B.ink}"/>${artAt(ctx, B, B.artist, 0, 0, 0.7)}`),
  under: () => '',
  over: (ctx, B, cell, now, plan) => {
    let s = `<rect x="-20" y="-20" width="${PIC.w + 40}" height="${PIC.h + 40}" fill="none" stroke="${INK}" stroke-width="22"/><rect x="-5" y="-5" width="${PIC.w + 10}" height="${PIC.h + 10}" fill="none" stroke="${PAPER}" stroke-width="3"/>`
    const st = plan && markOf(plan, cell, now)
    // The red is a gallery's "sold" dot on the frame.
    if (st) s += `<circle cx="${PIC.w + 6}" cy="${PIC.h + 6}" r="${r(13 * slap(now, st.t), 2)}" fill="${RED}"/>`
    return s
  },
}

/* ── Amps: the equipment ─────────────────────────────────────────────── */
const AMP = { w: 310, h: 250 }
const JEWEL = [155 + (296 - 180) * 0.62, 125 + (140 - 235) * 0.62]
const amps = {
  cell: { w: AMP.w, h: AMP.h, gap: 26 },
  zoom: 0.9,
  layouts: layoutsFor(AMP.w, AMP.h, 29, { rough: 0.07 }),
  ground: INK,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const { w, h } = AMP
    return `<rect width="${w}" height="${h}" fill="${B.ink}"/>${artAt(ctx, B, 'amp', 155 - 180 * 0.62, 118 - 235 * 0.62, 0.62)}` +
      `<rect y="${h - 34}" width="${w}" height="34" fill="${INK}"/>${t({ x: w / 2, y: h - 11, size: 18, text: 'Sounds like', fill: B.ink, anchor: 'middle', weight: 800, tracking: 6 })}` +
      `<circle cx="${r(JEWEL[0])}" cy="${r(JEWEL[1])}" r="6" fill="${INK}" stroke="${PAPER}" stroke-width="1.4"/>`
  }),
  // The conman plugs in: the pilot lamp lights red.
  mark: (now, st) => `<circle cx="${r(JEWEL[0])}" cy="${r(JEWEL[1])}" r="${r(18 * slap(now, st.t), 2)}" fill="${RED}" opacity="0.3"/><circle cx="${r(JEWEL[0])}" cy="${r(JEWEL[1])}" r="7" fill="${RED}" stroke="${PAPER}" stroke-width="1.4"/>`,
  // Behind the print, the speakers.
  under: () => {
    let s = `<rect width="${AMP.w}" height="${AMP.h}" fill="${INK}"/>`
    for (const cx of [92, 218]) {
      s += `<circle cx="${cx}" cy="118" r="58" fill="#2a2721"/>`
      for (const k of [56, 44, 32, 22]) s += `<circle cx="${cx}" cy="118" r="${k}" fill="none" stroke="${PAPER}" stroke-width="1.2" opacity="${r(0.2 + (56 - k) / 120, 2)}"/>`
      s += `<circle cx="${cx}" cy="118" r="12" fill="${PAPER}" opacity="0.75"/>`
    }
    return s
  },
}


/* ── The tour schedule ───────────────────────────────────────────────── */
const TOUR = { w: 250, h: 360 }
const DATES = [['Mar 03', 'Paris'], ['Mar 05', 'Berlin'], ['Mar 07', 'Oslo'], ['Mar 10', 'Dublin'], ['Mar 12', 'Lisbon'], ['Mar 15', 'Prague'], ['Mar 18', 'Rome'], ['Mar 21', 'Vienna'], ['Mar 24', 'Boston'], ['Mar 27', 'Austin'], ['Mar 30', 'Denver'], ['Apr 02', 'Seattle']]
const tour = {
  cell: { w: TOUR.w, h: TOUR.h, gap: 14 },
  zoom: 0.95,
  layouts: layoutsFor(TOUR.w, TOUR.h, 41, { rough: 0.07 }),
  ground: INK,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const { w, h } = TOUR
    let s = `<rect width="${w}" height="${h}" fill="${B.ink}"/><rect width="${w}" height="70" fill="${INK}"/>${t({ x: w / 2, y: 52, size: 44, text: 'On tour', fill: B.ink, anchor: 'middle', weight: 800, len: w - 40 })}`
    DATES.forEach(([d, c], i) => {
      const y = 98 + i * 20.5
      s += t({ x: 20, y, size: 13, text: d, fill: INK, weight: 800, tracking: 1 }) + t({ x: 92, y, size: 13, text: c, fill: INK, weight: 500, tracking: 1.5 })
    })
    s += `<path d="M20 ${h - 26}H${w - 20}" stroke="${INK}" stroke-width="1.4"/>${t({ x: w / 2, y: h - 10, size: 9, text: 'Tickets at the door', fill: INK, anchor: 'middle', weight: 700, tracking: 2 })}`
    return s
  }),
  // A red pencil ring round tonight's date: no matter where I go.
  mark: (now, st) => {
    const y = 98 + (st.n % DATES.length) * 20.5 - 5
    const k = clamp01((now - st.t) / 0.18)
    return `<ellipse cx="${TOUR.w / 2}" cy="${r(y, 1)}" rx="112" ry="13" fill="none" stroke="${RED}" stroke-width="2.6" pathLength="1" stroke-dasharray="${r(k * 1.05, 3)} 2" transform="rotate(-2 ${TOUR.w / 2} ${r(y, 1)})"/>`
  },
  under: (ctx, B) => `<use href="#${TAG(ctx, B, 'base')}" transform="translate(0 -44)"/><rect width="${TOUR.w}" height="${TOUR.h}" fill="${INK}" opacity="0.3"/>`,
}

/* ── Stickers ────────────────────────────────────────────────────────── */
const STICK = { w: 220, h: 220, spots: [[58, 58], [162, 58], [58, 162], [162, 162]], R: 46 }
function stickerPiece(k, seed) {
  const [cx, cy] = STICK.spots[k]
  const n = 40
  const region = Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * STICK.R, cy + Math.sin((i / n) * Math.PI * 2) * STICK.R])
  // Peeled from its top-left, over a chord a quarter of the way in.
  const a = Math.PI * 1.25
  const c = [cx + Math.cos(a) * STICK.R * 0.5, cy + Math.sin(a) * STICK.R * 0.5]
  const d = [Math.cos(a + Math.PI / 2) * STICK.R, Math.sin(a + Math.PI / 2) * STICK.R]
  return { region, coreRegion: region, line: [], hinge: [[c[0] - d[0], c[1] - d[1]], [c[0] + d[0], c[1] + d[1]]], centre: [cx, cy], style: 'peel', seed, size: 0 }
}
function stickerLayouts() {
  const { w, h } = STICK
  const whole = wholeSheet(w, h, 61, 'top')
  return [[0, 3, 1, 2], [2, 1, 3, 0], [1, 0, 2, 3]].map((ord, k) => [...ord.map((i) => stickerPiece(i, 500 + k * 10 + i)), whole])
}
const stickers = {
  cell: { w: STICK.w, h: STICK.h, gap: 12 },
  zoom: 1.05,
  layouts: stickerLayouts(),
  ground: INK,
  base: (ctx, B) => def(ctx, TAG(ctx, B, 'base'), () => {
    const { w, h, spots, R } = STICK
    let s = `<rect width="${w}" height="${h}" fill="${PAPER}"/><path d="M${w - 30} 0V${h}" stroke="${INK}" stroke-width="0.6" opacity="0.3"/>`
    const ids = B.gear ? ['amp', 'pedal', 'cassette', 'record'] : [B.artist, 'peppermint-drum', B.artist, 'snare']
    spots.forEach(([cx, cy], i) => {
      const fill = B.gear ? B.ink : i % 3 ? PAPER : INK
      s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${fill}"/>`
      s += `<g clip-path="url(#${TAG(ctx, B, `sp${i}`)})">${artAt(ctx, B, ids[i], cx - 180 * 0.26, cy - 235 * 0.26, 0.26)}</g>`
      s += `<circle cx="${cx}" cy="${cy}" r="${R - 2.5}" fill="none" stroke="${PAPER}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${INK}" stroke-width="1"/>`
    })
    return s
  }),
  defs: (ctx, B) => STICK.spots.map(([cx, cy], i) => `<clipPath id="${TAG(ctx, B, `sp${i}`)}"><circle cx="${cx}" cy="${cy}" r="${STICK.R - 3}"/></clipPath>`).join(''),
  mark: (now, st) => {
    const k = slap(now, st.t)
    const star = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2; const R2 = i % 2 ? 9 : 22; return [Math.cos(a) * R2, Math.sin(a) * R2] })
    return `<g transform="translate(110 110) scale(${r(k, 3)})"><path d="${polyPath(star)}" fill="${RED}" stroke="${PAPER}" stroke-width="3" stroke-linejoin="round"/></g>`
  },
  // The waxy liner, with the ghosts of the stickers that were on it.
  under: () => `<rect width="${STICK.w}" height="${STICK.h}" fill="#efe9da"/>${STICK.spots.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${STICK.R}" fill="none" stroke="${PAPER_SHADE}" stroke-width="1.5"/>`).join('')}`,
}


const FORMATS = { posters, stamps, board, tickets, notes, gallery, amps, tour, stickers }
if (!WALL_OBJECTS.length || WALL_SITTERS.some((id) => !SCENES[id])) throw new Error('conman-wall: scenes missing')

/*
 * What each format leaves on the pile: [the print's colour, the backing's].
 * `noBacking` when what is under a sheet is the black wall anyway; `groundSheet`
 * when the section's own backing is paper and has to come down too.
 */
const PILE = {
  posters: (B) => [B.ink, PAPER],
  stamps: (B) => [B.ink],
  board: () => [INK],
  tickets: () => [PAPER, '#9d968a'],
  notes: () => [PAPER, PAPER_SHADE],
  gallery: (B) => [B.ink, '#35312a'],
  amps: (B) => [B.ink, '#2a2721'],
  tour: (B) => [B.ink, '#7d8612'],
  stickers: () => [PAPER, '#efe9da'],
}
/*
 * From far off (the break), the same pieces with their torn lines cut to every
 * fifth point: a 4-unit fibre is under a pixel at a sixth of full size, and
 * every torn sheet's clip is that much markup, every frame.
 */
const thin = (pts, keep) => pts.filter((p, i) => i % 5 === 0 || keep(p))
const farPiece = (pc, w, h) => {
  const onEdge = ([x, y]) => x <= 0.01 || y <= 0.01 || x >= w - 0.01 || y >= h - 0.01
  return { ...pc, region: thin(pc.region, onEdge), coreRegion: pc.region }
}
/* A piece's outline as relative moves, so it can be placed by its first point alone. */
const relD = (pts) => {
  let d = ''
  for (let i = 1; i < pts.length; i++) d += `l${Math.round(pts[i][0] - pts[i - 1][0])} ${Math.round(pts[i][1] - pts[i - 1][1])}`
  return d + 'Z'
}
for (const F of Object.values(FORMATS)) {
  F.farLayouts = F.layouts.map((ls) => ls.map((pc) => farPiece(pc, F.cell.w, F.cell.h)))
  for (const ls of F.farLayouts) for (const pc of ls) pc.rel = relD(pc.region)
}
stamps.noBacking = true
board.noBacking = true
board.groundSheet = true
notes.groundSheet = true
// The gallery's frames stand 31 units proud of the picture; they come down with its backing.
gallery.pad = 31

/* ══ THE WALL ══════════════════════════════════════════════════════════
 *
 * One collage: ten sections of different sizes butted edge to edge into one
 * rectangle about the plate's shape, so from right out the wall is one thing
 * divided into sections. A section's grid runs past its edges and is cut off
 * there, as a paste-up is; a hairline of the black wall shows between sections.
 *
 *    ┌──────────────┬───────────┬────────────────┐
 *    │ 1a posters   │ 1b stamps │ 2a board       │
 *    ├────────┬─────┴───────────┼────────────────┤
 *    │ tour   │ 2b tickets      │ 3a notes       │
 *    │        ├─────────┬───────┴─┬──────┬───────┤
 *    │        │ 3b      │ amps    │ meg  │ gear  │
 *    └────────┴─────────┴─────────┴──────┴───────┘
 */
const WALL_W = 8600
const WALL_H = 3720
const SEAM = 7
export const WALL = {
  '1a': { format: 'posters', artist: 'page', ink: WALL_INKS.posters, rect: [0, 0, 3000, 1400], before: 'mane', label: 'Jimmy Page, fly-posting' },
  '1b': { format: 'stamps', artist: 'plant', ink: WALL_INKS.stamps, rect: [3000, 0, 2300, 1400], label: 'Robert Plant, stamps' },
  '2a': { format: 'board', artist: 'jack', ink: WALL_INKS.board, rect: [5300, 0, 3300, 1500], label: 'Jack White, the notice board' },
  'tour': { format: 'tour', ink: WALL_INKS.tour, rect: [0, 1400, 1900, 2320], label: 'The tour schedule' },
  '2b': { format: 'tickets', artist: 'meg', ink: WALL_INKS.tickets, rect: [1900, 1400, 3400, 1100], label: 'Meg White, tickets' },
  '3a': { format: 'notes', artist: 'mayer', ink: WALL_INKS.notes, rect: [5300, 1500, 3300, 1000], label: 'John Mayer, banknotes' },
  '3b': { format: 'gallery', artist: 'dylan', ink: WALL_INKS.gallery, rect: [1900, 2500, 2500, 1220], label: 'Bob Dylan, the gallery' },
  'amps': { format: 'amps', ink: WALL_INKS.amps, rect: [4400, 2500, 1900, 1220], label: 'The equipment: amps' },
  'meg-stickers': { format: 'stickers', artist: 'meg', ink: WALL_INKS.megStickers, rect: [6300, 2500, 1200, 1220], label: 'Meg White, a sticker sheet' },
  'gear-stickers': { format: 'stickers', gear: true, ink: WALL_INKS.gearStickers, rect: [7500, 2500, 1100, 1220], label: 'The equipment: a sticker sheet' },
}
for (const [id, b] of Object.entries(WALL)) {
  const F = FORMATS[b.format]
  const { w, h, gap } = F.cell
  const [x0, y0, sw, sh] = b.rect
  Object.assign(b, { id, x0, y0, w: sw, h: sh, cx: x0 + sw / 2, cy: y0 + sh / 2, pitchX: w + gap, pitchY: h + gap })
  // One more column and row than fit, centred, so the grid runs off every edge.
  b.cols = Math.ceil((sw + gap) / b.pitchX) + 1
  b.rows = Math.ceil((sh + gap) / b.pitchY) + 1
  b.cx0 = x0 + (sw - (b.cols * b.pitchX - gap)) / 2
  b.cy0 = y0 + (sh - (b.rows * b.pitchY - gap)) / 2
}
/**
 * The same section reprinted in red for whoever comes next: the last chorus.
 * A section's own ink becomes red; a section printed in black (the board, the
 * tickets, Meg's stickers) is reprinted with red for its black.
 */
const RED_WALL = Object.fromEntries(Object.entries(WALL).map(([id, b]) => [id, { ...b, id: `r-${id}`, ink: RED, artist: 'newcomer', before: 'newcomer', red: true, redInk: b.ink === INK }]))

/* The plate is 1532 × 666 about (800, 367). */
const HW = 766
const HH = 333
const ZFAR = Math.min(1532 / (WALL_W + 300), 666 / (WALL_H + 300))
/* The break's view: all of it, with room under it for the pile. */
const FAR_VIEW = { x: WALL_W / 2, y: WALL_H / 2 + 150, z: ZFAR }
/* The wall filling the plate top to bottom, for the paste-ups. */
const FILL_VIEW = { x: WALL_W / 2, y: WALL_H / 2, z: 666 / WALL_H }

function cellOf(B, col, row) {
  const F = FORMATS[B.format]
  const off = F.brick && ((row % 2) + 2) % 2 ? F.brick * B.pitchX : 0
  const x = B.cx0 + col * B.pitchX + off
  const y = B.cy0 + row * B.pitchY
  const whole = x >= B.x0 + SEAM && y >= B.y0 + SEAM && x + F.cell.w <= B.x0 + B.w - SEAM && y + F.cell.h <= B.y0 + B.h - SEAM
  return { B, col, row, key: `${B.id}:${col},${row}`, x, y, whole, layout: Math.floor(hash(col + 999, row + 999, B.x0 * 0.007 + B.y0 * 0.013 + 11) * F.layouts.length) }
}
/** The cells of a section that show at all, brick rows reaching one further left. */
function cellsIn(B, x0 = -Infinity, y0 = -Infinity, x1 = Infinity, y1 = Infinity) {
  const F = FORMATS[B.format]
  const out = []
  for (let row = 0; row < B.rows; row++) {
    for (let col = F.brick ? -1 : 0; col < B.cols; col++) {
      const c = cellOf(B, col, row)
      if (c.x + F.cell.w < Math.max(x0, B.x0) || c.x > Math.min(x1, B.x0 + B.w) || c.y + F.cell.h < Math.max(y0, B.y0) || c.y > Math.min(y1, B.y0 + B.h)) continue
      out.push(c)
    }
  }
  return out
}
const markOf = (plan, cell, now) => {
  const s = plan.stopBy.get(cell.key)
  return s && now >= s.t ? s : null
}

/* ══ THE PLAN ══════════════════════════════════════════════════════════
 *
 * THE FILM, IN ORDER
 *
 *   Intro      Black, and CONMAN in paper-white letters. The title drops to the
 *              margin, the paper comes in round the plate, and the plate stays
 *              black: the wall. The sections are pasted onto it one at a time,
 *              every other beat, until the collage is whole; then in to Page.
 *   Verse 1    Page's fly-posters, then Plant's stamps, and the stamps hold
 *              through the guitar after the verse.
 *   Verse 2    Jack White's board, Meg White's tickets ("the Earth shook").
 *   Chorus     One section per sung line: the tour schedule, then the amps.
 *   Verse 3    Mayer's banknotes, Dylan's gallery.
 *   Chorus     Meg White's stickers, then the gear stickers.
 *   Break      Right out, and still. Every sheet on the wall is torn down, the
 *              pieces fall into a pile along the bottom of the plate, and what
 *              is left is the black wall.
 *   Verse 4    The camera creeps in while pieces lift off the pile, one or two
 *              at a time, and lay down the outline of a musician: whoever comes
 *              next, made of everybody.
 *   Chorus 3   Out again, and the wall is pasted back up over him, every section
 *              printed in red with his face on it; then a section per line, and
 *              out on the red wall to the end card.
 *
 * The camera is a list of shots. A shot holds on a section and pans across it
 * at a slow, steady rate; the next shot's first `m` seconds are the move to
 * it, eased (half a cosine) from wherever the last shot's drift has got to, so
 * the camera never stops dead. A long move pulls back through its middle.
 */
const BEAT = 60 / 87.5

/* Holds: [slot, first line, gap at start, gap at end, biggest piece at start, at end]. */
const HOLDS = [
  ['1a', 0, 3.2, 1.7, 0, 1],
  ['1b', 2, 2.4, 1.0, 0, 2],
  ['2a', 4, 1.8, 0.55, 0, 3],
  ['2b', 6, 1.1, 0.3, 1, 4],
  ['tour', 8, 1.5, 0.5, 1, 3],
  ['amps', 9, 1.2, 0.45, 1, 4],
  ['3a', 10, 1.2, 0.35, 1, 4],
  ['3b', 12, 1.3, 0.45, 1, 3],
  ['meg-stickers', 14, 1.2, 0.4, 0, 4],
  ['gear-stickers', 15, 1.0, 0.35, 0, 4],
]
/* The last chorus: a red section per line after the first. */
const RED_HOLDS = [['1a', 21], ['3b', 22], ['3a', 23]]
const PASTE_ORDER = ['tour', '1a', '3b', '2a', 'amps', '1b', 'gear-stickers', '2b', 'meg-stickers', '3a']
const RED_ORDER = ['3b', '2a', 'tour', '1b', 'gear-stickers', '1a', 'amps', '3a', '2b', 'meg-stickers']
export const SLOTS = HOLDS.map((h) => h[0])

/* The intro's title: in, held, dropped to the margin, and the paper round it. */
const TITLE = { in: [0.2, 1.0], drop: [3.4, 4.8], frame: [4.6, 6.0], marks: [5.8, 6.4], out: [20.2, 21.0] }

/*
 * The musician the pile becomes, as outlines in a box about 330 × 440: a head,
 * shoulders, and a guitar across the hips with its neck angled up and away,
 * because that is the silhouette that says "musician" in thirty pieces of
 * paper. Earlier shapes are further back: a point of the outline hidden inside
 * a later shape is not laid.
 */
const circlePts = (cx, cy, rx, ry, n) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * rx, cy + Math.sin((i / n) * Math.PI * 2) * ry])
const MUS_SHAPES = [
  circlePts(200, 112, 56, 62, 40),
  [[184, 172], [178, 196], [128, 212], [102, 238], [92, 300], [88, 470], [312, 470], [308, 300], [298, 238], [272, 212], [222, 196], [216, 172]],
  circlePts(214, 312, 46, 42, 34),
  circlePts(238, 376, 64, 56, 42),
  [[184, 288], [30, 154], [18, 168], [172, 302]],
  [[34, 150], [8, 124], [-12, 144], [18, 172]],
]
const MUS = { s: 5.2, x: WALL_W / 2 + 150, top: 50, cx: 160, cut: 446 }
const ZMUS = 0.235

const plans = new Map()
function planFor(score, swap = {}) {
  const pkey = `${score.title}|${JSON.stringify(swap)}`
  if (plans.has(pkey)) return plans.get(pkey)
  const slot = (id) => WALL[swap[id] ?? id]
  const lines = score.lines
  const sec = (id) => score.sections.find((s) => s.id === id)
  const phase = score.beatPhase ?? 0.31
  const beatAfter = (tt) => phase + Math.ceil((tt - phase) / BEAT) * BEAT
  const eighth = (tt) => phase + Math.round((tt - phase) / (BEAT / 2)) * (BEAT / 2)

  /* ── The paste-ups ───────────────────────────────────────────────── */
  const pasteAt = new Map()
  PASTE_ORDER.forEach((id, i) => pasteAt.set(WALL[id].id, beatAfter(TITLE.marks[1]) + i * 2 * BEAT))
  const c3 = sec('chorus-3')
  const redAt = new Map()
  RED_ORDER.forEach((id, i) => redAt.set(RED_WALL[id].id, beatAfter(c3.from + 0.3) + i * BEAT))
  const redDone = Math.max(...redAt.values()) + 0.3

  /* ── The shots ───────────────────────────────────────────────────── */
  const shots = []
  const hold = (B, t0, m, dur, k) => {
    const F = FORMATS[B.format]
    const z = F.zoom
    const room = Math.max(0, B.w - 1532 / z + 200)
    const dist = Math.min(room, dur * 40 / z)
    const dir = k % 2 ? -1 : 1
    const vy = Math.max(0, B.h - 666 / z) * 0.5
    const oy = ((hash(k, 3, 17) - 0.5) * 2) * vy * 0.6
    shots.push({ t0, m, B, x0: B.cx - dir * dist / 2, x1: B.cx + dir * dist / 2, y0: B.cy + oy, y1: B.cy - oy * 0.5, z0: z, z1: z * 1.02, kind: 'hold' })
  }
  const far = (t0, m, o = {}) => {
    const v = o.view ?? FAR_VIEW
    shots.push({ t0, m, B: null, x0: v.x + (o.dx ?? 0), x1: v.x - (o.dx ?? 0), y0: v.y, y1: v.y, z0: v.z * (o.z0 ?? 1), z1: v.z * (o.z1 ?? 1), kind: 'far' })
  }
  far(0, 0, { view: FILL_VIEW, dx: -30, z1: 1.03 })
  const leadOf = (li, m) => lines[li].start - 0.3 - m
  const holdT0 = HOLDS.map(([, li], i) => (i === 0 ? 21.0 : leadOf(li, 0.8)))
  const brk = sec('break')
  const breakCam = brk.from - 0.9
  HOLDS.forEach(([id], i) => {
    const t0 = holdT0[i]
    const t1 = i + 1 < HOLDS.length ? holdT0[i + 1] : breakCam
    hold(slot(id), t0, i === 0 ? 1.4 : 0.8, t1 - t0, i)
  })
  // The break: right out and still, for the whole of it.
  far(breakCam, 2.6)
  // The last verse: creeping in on the musician as he is put together.
  const v4 = sec('verse-4')
  // His feet (the bottom of the box, 480) sink into the pile; the push ends on all of him.
  // His lowest line sits on the pile's crest; the push ends with all of him and the pile's top in view.
  const musTop = FAR_VIEW.y + HH / ZFAR - 700 - (MUS.cut - MUS.top) * MUS.s
  const musView = { x: MUS.x, y: musTop + 1200 }
  shots.push({ t0: v4.from - 0.4, m: 0, B: null, x0: FAR_VIEW.x, x1: musView.x, y0: FAR_VIEW.y, y1: musView.y, z0: ZFAR, z1: ZMUS, kind: 'push', ease: true })
  // The last chorus: out, the red wall pasted up, a section per line, out.
  far(c3.from - 0.7, 1.8, { view: FILL_VIEW })
  RED_HOLDS.forEach(([id, li], i) => hold(RED_WALL[id], leadOf(li, 1.2), 1.2, 0, 20 + i))
  const outAt = lines[23].end + 0.4
  far(outAt, 3.0, { view: FILL_VIEW, dx: 30, z0: 1.04 })
  shots.sort((a, b) => a.t0 - b.t0)
  for (let i = 0; i < shots.length; i++) shots[i].t1 = i + 1 < shots.length ? shots[i + 1].t0 : score.duration + 1
  // A red hold's pan is sized to its own length, now that it is known.
  for (const s of shots) {
    if (s.kind !== 'hold' || !s.B.red) continue
    const z = s.z0
    const dist = Math.min(Math.max(0, s.B.w - 1532 / z + 200), (s.t1 - s.t0) * 40 / z)
    s.x0 = s.B.cx - dist / 2
    s.x1 = s.B.cx + dist / 2
  }
  const camAt = (tt) => camera(shots, tt)

  /* ── The tears on the words ─────────────────────────────────────── */
  const words = lines.flatMap((l) => l.words.map((w) => w.t))
  const snap = (tt, win = 0.32) => {
    let best = null
    for (const w of words) if (Math.abs(w - tt) <= win && (best == null || Math.abs(w - tt) < Math.abs(best - tt))) best = w
    return best ?? eighth(tt)
  }
  const wants = [] // { t, B, maxSize, count }
  HOLDS.forEach(([id, li, g0, g1, s0, s1], i) => {
    const sh = shots.find((s) => s.kind === 'hold' && s.B === slot(id) && Math.abs(s.t0 - holdT0[i]) < 0.01)
    if (!sh) return
    const from = Math.max(sh.t0 + sh.m + 0.2, lines[li].start + 0.65)
    const to = sh.t1 - 0.2
    let tt = from
    while (tt < to) {
      const q = clamp01((tt - from) / (to - from))
      const at = snap(tt)
      const size = Math.round(lerp(s0, s1, q ** 0.8))
      wants.push({ t: at, B: sh.B, maxSize: size, count: 1 + (q > 0.8 && s1 >= 4 ? 1 : 0) })
      tt = Math.max(at, tt) + lerp(g0, g1, q ** 0.9)
    }
  })
  // "Until the Earth shook": everything in view goes at once.
  const shook = lines[6]?.words.find((w) => /shook/i.test(w.text))
  if (shook) wants.push({ t: shook.t, B: slot('2b'), maxSize: 4, count: 7 })
  wants.sort((a, b) => a.t - b.t)

  const state = new Map()
  const events = []
  const byCell = new Map()
  const addEvent = (ev) => {
    events.push(ev)
    if (!byCell.has(ev.cell.key)) byCell.set(ev.cell.key, [])
    byCell.get(ev.cell.key).push(ev)
  }
  let focus = 0
  for (const wt of wants) {
    const cam = camAt(wt.t)
    const F = FORMATS[wt.B.format]
    const hw = HW / cam.z
    const hh = HH / cam.z
    for (let n = 0; n < wt.count; n++) {
      focus += 0.618
      const fx = cam.x + Math.sin(focus * 2.4) * hw * 0.55
      const fy = cam.y + Math.cos(focus * 3.1) * hh * 0.45
      let best = null
      let bestScore = Infinity
      for (const c of cellsIn(wt.B, cam.x - hw, cam.y - hh - F.cell.h * 0.1, cam.x + hw, cam.y + hh + F.cell.h * 0.1)) {
        if (!c.whole) continue
        if (c.x < cam.x - hw + 12 / cam.z || c.x + F.cell.w > cam.x + hw - 12 / cam.z || c.y < cam.y - hh - F.cell.h * 0.1 || c.y + F.cell.h > cam.y + hh + F.cell.h * 0.15) continue
        const st = state.get(c.key) ?? { used: new Set(), last: -9, done: false }
        if (st.done || wt.t - st.last < 0.9) continue
        const layout = F.layouts[c.layout]
        // The biggest piece this moment allows, of those still on the sheet.
        let pick = -1
        let pickSize = -1
        layout.forEach((pc, i) => {
          if (st.used.has(i) || pc.size > wt.maxSize) return
          if (pc.whole && st.used.size < 1) return
          const sz = pc.size + hash(i, c.col + c.row * 31, 5) * 0.4
          if (sz > pickSize) { pickSize = sz; pick = i }
        })
        if (pick < 0) continue
        const cx = c.x + F.cell.w / 2
        const cy = c.y + F.cell.h / 2
        const sc = Math.hypot(cx - fx, cy - fy) - pickSize * 120 + hash(c.col, c.row, Math.round(wt.t * 100)) * 140
        if (sc < bestScore) { bestScore = sc; best = { c, pick } }
      }
      if (!best) continue
      const { c, pick } = best
      const st = state.get(c.key) ?? { used: new Set(), last: -9, done: false }
      st.used.add(pick)
      st.last = wt.t
      if (F.layouts[c.layout][pick].whole) st.done = true
      state.set(c.key, st)
      addEvent({ t: wt.t, cell: c, i: pick })
    }
  }

  /* ── The red thing ───────────────────────────────────────────────── */
  // In each section it lands on the sheet the next word will tear.
  const stops = new Map()
  const stopBy = new Map()
  for (const B of Object.values(WALL)) {
    const evs = events.filter((e) => e.cell.B === B)
    const list = []
    for (let k = 0; k + 1 < evs.length; k += 2) {
      let cell = evs[k + 1].cell
      if (FORMATS[B.format].journey === 'postmark') {
        // A postmark falls on a stamp that stays.
        cell = null
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) {
          const c = cellOf(B, evs[k + 1].cell.col + dc, evs[k + 1].cell.row + dr)
          if (c.whole && !byCell.has(c.key)) { cell = c; break }
        }
        if (!cell) continue
      }
      const s = { t: evs[k].t, cell, key: cell.key, n: list.length }
      list.push(s)
      if (!stopBy.has(cell.key)) stopBy.set(cell.key, s)
    }
    stops.set(B.id, list)
  }

  /* ── The break: everything comes down, onto the pile ─────────────── */
  const B0 = brk.from + 0.8
  const B1 = brk.to - 9.8
  const pileBase = FAR_VIEW.y + HH / ZFAR - 30
  const pileX0 = FAR_VIEW.x - HW / ZFAR + 160
  const pileX1 = FAR_VIEW.x + HW / ZFAR - 160
  const BIN = 60
  const bins = new Float64Array(Math.ceil((pileX1 - pileX0) / BIN) + 1)
  const binOf = (x) => Math.max(0, Math.min(bins.length - 1, Math.round((x - pileX0) / BIN)))
  const flights = [] // every piece that goes onto the pile, in the order it was torn
  const all = []
  for (const B of Object.values(WALL)) for (const c of cellsIn(B)) all.push(c)
  // Roughly bottom up, so the pile builds on wall that is already bare.
  all.sort((a, b) => (1 - a.y / WALL_H) * 0.55 + hash(a.col, a.row, 77) * 0.45 - ((1 - b.y / WALL_H) * 0.55 + hash(b.col, b.row, 77) * 0.45))
  const lastOf = new Map() // section → last cell event, for its ground
  all.forEach((c, j) => {
    const F = FORMATS[c.B.format]
    const layout = F.layouts[c.layout]
    // Density climbing through the break: the j-th cell at B0 + D·√(j/N).
    let tt = eighth(B0 + (B1 - B0) * Math.sqrt((j + 0.5) / all.length))
    const st = state.get(c.key) ?? { used: new Set(), done: false }
    const seq = []
    if (!st.done) {
      let pick = -1
      layout.forEach((pc, i) => { if (!pc.whole && !st.used.has(i) && pc.size >= 1 && pc.size <= 3 && (pick < 0 || pc.size > layout[pick].size)) pick = i })
      if (pick >= 0 && hash(c.col, c.row, 91) < 0.7) seq.push(pick)
      seq.push(layout.findIndex((pc) => pc.whole))
    }
    if (!F.noBacking) seq.push('back')
    for (const i of seq) {
      addEvent({ t: tt, cell: c, i, fly: true })
      tt = eighth(tt + BEAT * (0.5 + hash(c.col, c.row, typeof i === 'number' ? i : 9) * 1.5))
    }
    lastOf.set(c.B.id, Math.max(lastOf.get(c.B.id) ?? 0, tt))
  })
  // The paper backings of the board and the notes, once their sheets are off.
  const grounds = new Map()
  for (const B of Object.values(WALL)) {
    const F = FORMATS[B.format]
    if (!F.groundSheet) continue
    const g = { B, key: `${B.id}:ground`, x: B.x0, y: B.y0, ground: true, layout: 0 }
    g.layoutArr = layoutsFor(B.w, B.h, 211 + B.x0 % 97, { rough: 0.05 })[0]
    grounds.set(B.id, g)
    let tt = eighth(Math.min(lastOf.get(B.id) ?? B1, B1 + 1.5) + 0.3)
    g.layoutArr.forEach((pc, i) => {
      addEvent({ t: tt, cell: g, i, fly: true })
      tt = eighth(tt + BEAT / 2)
    })
  }
  // Every flight: peel, then fall to its place on the pile, flat.
  const flyEvents = events.filter((e) => e.fly).sort((a, b) => a.t - b.t)
  const region = (e) => {
    const c = e.cell
    if (c.ground) return c.layoutArr[e.i]
    const F = FORMATS[c.B.format]
    if (e.i === 'back') {
      const p = F.pad ?? 0
      const { w, h } = F.cell
      return { ...wholeSheet(w + 2 * p, h + 2 * p, 13 + c.col * 7 + c.row, hash(c.col, c.row, 5) < 0.5 ? 'left' : 'top'), offset: [-p, -p] }
    }
    return F.layouts[c.layout][e.i]
  }
  // Two passes: the first finds how high the pile would get, the second builds it to a set height.
  const PILE_PEAK = 120 / ZFAR
  const lay = (scale) => {
    bins.fill(0)
    const out = []
    for (const e of flyEvents) {
      const pc = region(e)
      const off = pc.offset ?? [0, 0]
      const c = e.cell
      const h1 = (k) => hash(e.t * 100, k, typeof e.i === 'number' ? e.i : 7)
      const sL = c.ground ? 0.13 + 0.05 * h1(1) : 0.5 + 0.15 * h1(1)
      let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, area = 0
      const R = pc.region
      for (let k = 0; k < R.length; k++) {
        const [x, y] = R[k]
        const [x2, y2] = R[(k + 1) % R.length]
        area += x * y2 - x2 * y
        minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y)
      }
      area = Math.abs(area) / 2
      const startX = c.x + off[0] + pc.centre[0]
      const tx = Math.max(pileX0, Math.min(pileX1, lerp(startX, WALL_W / 2, 0.18) + (h1(2) - 0.5) * 520))
      const halfW = Math.max(40, (maxx - minx) * sL * 0.45)
      let top = 0
      for (let b = binOf(tx - halfW); b <= binOf(tx + halfW); b++) top = Math.max(top, bins[b])
      const ty = pileBase - top * scale - (maxy - miny) * sL * 0.18
      const add = (area * sL * sL) / (2 * halfW)
      for (let b = binOf(tx - halfW); b <= binOf(tx + halfW); b++) {
        const u = (b * BIN + pileX0 - tx) / halfW
        bins[b] = Math.max(bins[b], top) * 0.3 + bins[b] * 0.7 + add * Math.max(0, 1 - u * u)
      }
      out.push({ e, pc, off, sL, tx, ty })
    }
    return out
  }
  lay(1)
  const peak = Math.max(...bins)
  const laid = lay(PILE_PEAK / Math.max(peak, 1))
  const pile = []
  for (const { e, pc, off, sL, tx, ty } of laid) {
    const c = e.cell
    const h1 = (k) => hash(e.t * 100 + 3, k, typeof e.i === 'number' ? e.i : 7)
    const front = h1(1) < 0.6
    const reach = pc.whole ? 0.72 : 0.92
    const fl = {
      pc, off, x: c.x, y: c.y, t: e.t, sL,
      thP: Math.PI * reach,
      thL: front ? Math.PI * (h1(2) < 0.5 ? 2 : 4) : Math.PI * 3,
      rotL: (h1(3) - 0.5) * 2 * 160,
      wob: (h1(4) - 0.5) * 2 * 160,
      tx: tx - c.x - off[0], ty: ty - c.y - off[1], // the landing centre, in sheet units
    }
    // Where the peel leaves the centre, and how long the fall is from there.
    const c0 = apply(foldMatrix(pc.hinge[0], pc.hinge[1], Math.cos(fl.thP)), pc.centre)
    fl.c0 = c0
    const D = Math.max(40, fl.ty - c0[1])
    const v0 = -140
    const g = 2600
    fl.F = (-v0 + Math.sqrt(v0 * v0 + 2 * g * D)) / g
    fl.v0 = v0
    fl.g = g
    fl.tLand = e.t + PEEL + fl.F
    fl.key = c.ground ? `${c.B.id}-g${e.i}` : e.i === 'back' ? `${c.B.format}-b${pc.hinge[0][0] === 0 && pc.hinge[0][1] > 0 ? 'l' : 't'}` : `${c.B.format}-${c.layout}-${e.i}`
    e.fly = fl
    flights.push(fl)
    // On the pile: the piece as it lands, cut down to a handful of points.
    const M = flightMatrix(fl, fl.F + PEEL)
    const R = pc.region
    const n = Math.min(R.length, 8)
    const pts = []
    for (let k = 0; k < n; k++) {
      const [x, y] = R[Math.floor((k / n) * R.length)]
      pts.push([M[0] * x + M[2] * y + M[4] + c.x + off[0], M[1] * x + M[3] * y + M[5] + c.y + off[1]])
    }
    const F = c.ground ? null : FORMATS[c.B.format]
    const cols = c.ground ? [c.B.format === 'board' ? PAPER_SHADE : PAPER] : PILE[c.B.format](c.B)
    fl.colour = e.i === 'back' ? (cols[1] ?? cols[0]) : cols[0]
    const colour = !front ? BACK : fl.colour
    void F
    pile.push({ pts, colour, tLand: fl.tLand, tLeave: Infinity, cx: tx, cy: ty, ground: !!c.ground })
  }

  /* ── The last verse: the outline of whoever comes next ───────────── */
  const shapes = MUS_SHAPES.map((pts) => resample(pts, 5))
  const toWorld = ([x, y]) => [MUS.x + (x - MUS.cx) * MUS.s, musTop + (y - MUS.top) * MUS.s]
  const slots = []
  shapes.forEach((pts, si) => {
    let acc = 0
    let last = null
    pts.forEach((p, k) => {
      const q = pts[(k + 1) % pts.length]
      if (last) acc += Math.hypot(p[0] - last[0], p[1] - last[1])
      last = p
      if (p[1] > MUS.cut) return
      if (shapes.some((o, oi) => oi > si && inside(o, p[0], p[1]))) return
      // The two bouts are one body: neither lays a line inside the other.
      if ((si === 2 || si === 3) && inside(shapes[5 - si], p[0], p[1])) return
      if (acc < 15 && slots.length && slots[slots.length - 1].si === si) return
      acc = 0
      slots.push({ si, p: toWorld(p), ang: Math.atan2(q[1] - p[1], q[0] - p[0]) })
    })
  })
  const launch0 = v4.from + 0.7
  const launch1 = v4.to - 2.4
  const taken = new Set()
  const assembly = []
  slots.forEach((sl, k) => {
    const tt = eighth(lerp(launch0, launch1, k / Math.max(1, slots.length - 1)))
    // The nearest of the pieces lying on top, near where he stands.
    let best = null
    let bestScore = Infinity
    for (let j = pile.length - 1; j >= 0; j--) {
      const pp = pile[j]
      if (taken.has(j) || pp.ground || pp.tLand > tt - 0.4) continue
      const sc = Math.abs(pp.cx - sl.p[0]) / 3000 + hash(j, k, 3)
      if (sc < bestScore) { bestScore = sc; best = j }
    }
    if (best == null) return
    taken.add(best)
    const pp = pile[best]
    pp.tLeave = tt
    // Its long axis, to lay along the outline.
    let ax = 0
    let ay = 0
    for (let a = 0; a < pp.pts.length; a++) for (let b = a + 1; b < pp.pts.length; b++) {
      const dx = pp.pts[b][0] - pp.pts[a][0]
      const dy = pp.pts[b][1] - pp.pts[a][1]
      if (dx * dx + dy * dy > ax * ax + ay * ay) { ax = dx; ay = dy }
    }
    const axis = Math.atan2(ay, ax)
    let turn = sl.ang - axis
    while (turn > Math.PI / 2) turn -= Math.PI
    while (turn < -Math.PI / 2) turn += Math.PI
    const local = pp.pts.map(([x, y]) => [x - pp.cx, y - pp.cy])
    // Evened out: every piece of the outline about the same length.
    const grow = Math.max(0.7, Math.min(2.2, (150 + hash(k, 2, 9) * 40) / Math.max(1, Math.hypot(ax, ay))))
    assembly.push({ local, colour: pp.colour, t0: tt, t1: tt + 1.5, from: [pp.cx, pp.cy], to: sl.p, turn, grow })
  })

  // Shakes: the Earth, hard; the ground splitting, less.
  const hits = []
  if (shook) hits.push({ t: shook.t, a: 26 })
  const ground = lines[17]?.words.find((w) => /ground/i.test(w.text))
  if (ground) hits.push({ t: ground.t, a: 12 })

  const firstAt = new Map()
  for (const e of events) if (!firstAt.has(e.cell.key) || e.t < firstAt.get(e.cell.key)) firstAt.set(e.cell.key, e.t)
  const special = new Map() // section id → cells drawn one by one even from far off
  for (const e of events) {
    if (e.fly || e.cell.ground) continue
    if (!special.has(e.cell.B.id)) special.set(e.cell.B.id, new Map())
    special.get(e.cell.B.id).set(e.cell.key, e.cell)
  }
  for (const s of stopBy.values()) {
    if (!special.has(s.cell.B.id)) special.set(s.cell.B.id, new Map())
    special.get(s.cell.B.id).set(s.key, s.cell)
  }
  // When each cell has gone for good: its last flight has left.
  const goneAt = new Map()
  for (const e of events) if (e.fly) goneAt.set(e.cell.key, Math.max(goneAt.get(e.cell.key) ?? 0, e.t))
  // From far off, the cells drawn one by one over a section's pattern, in the order they are first touched.
  const touched = new Map()
  const firstTouch = (c) => Math.min(firstAt.get(c.key) ?? Infinity, stopBy.get(c.key)?.t ?? Infinity)
  for (const B of Object.values(WALL)) {
    const list = cellsIn(B).filter((c) => firstTouch(c) < Infinity).map((c) => ({ c, at: firstTouch(c) }))
    list.sort((a, b) => a.at - b.at)
    touched.set(B.id, list)
  }
  // Cleared: the last sheet has left the section (its pieces are still falling); gone: they have landed.
  const sectionCleared = new Map()
  for (const B of Object.values(WALL)) sectionCleared.set(B.id, Math.max(...cellsIn(B).map((c) => goneAt.get(c.key) ?? Infinity)))
  const sectionGone = new Map([...sectionCleared].map(([id, t]) => [id, t + 3]))
  const breakFrom = Math.min(...flyEvents.map((e) => e.t))
  const wallGone = Math.max(...flights.map((f) => f.tLand)) + 0.1
  const plan = { shots, camAt, events, byCell, stops, stopBy, hits, firstAt, special, touched, goneAt, sectionCleared, sectionGone, grounds, breakFrom, wallGone, pile, assembly, pasteAt, redAt, redDone }
  plans.set(pkey, plan)
  return plan
}

const apply = (M, [x, y]) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]]
const scaleAbout = (s, cx, cy) => [s, 0, 0, s, cx - s * cx, cy - s * cy]

/*
 * A piece on its way to the pile, `tau` after its word, as a matrix in sheet
 * units. The peel is the tear's own; then the piece's centre falls on a
 * parabola to its landing place while it keeps turning over (to lie flat, face
 * up or down, exactly as it lands), spins and shrinks a little, crumpled.
 */
function flightMatrix(fl, tau) {
  const { pc } = fl
  const [h0, h1] = pc.hinge
  if (tau <= PEEL) return foldMatrix(h0, h1, Math.cos(fl.thP * easeOut(clamp01(tau / PEEL))))
  const u = clamp01((tau - PEEL) / fl.F)
  const f = u * fl.F
  const th = fl.thP + (fl.thL - fl.thP) * (1 - (1 - u) ** 2)
  const fold = foldMatrix(h0, h1, Math.cos(th))
  const fc = apply(fold, pc.centre)
  const px = fl.c0[0] + (fl.tx - fl.c0[0]) * u + Math.sin(Math.PI * u) * fl.wob
  const py = fl.c0[1] + fl.v0 * f + 0.5 * fl.g * f * f
  const s = lerp(1, fl.sL, u)
  return mul([1, 0, 0, 1, px - fc[0], py - fc[1]], mul(rotAbout(fl.rotL * u, fc[0], fc[1]), mul(scaleAbout(s, fc[0], fc[1]), fold)))
}

function shotAt(s, tt) {
  const u0 = clamp01((tt - s.t0) / Math.max(0.001, s.t1 - s.t0))
  const u = s.ease ? easeCamera(u0) : u0
  return { x: lerp(s.x0, s.x1, u), y: lerp(s.y0, s.y1, u), z: Math.exp(lerp(Math.log(s.z0), Math.log(s.z1), u)) }
}
function camera(shots, tt) {
  let i = 0
  while (i + 1 < shots.length && shots[i + 1].t0 <= tt) i++
  const s = shots[i]
  const b = shotAt(s, tt)
  if (i === 0 || tt >= s.t0 + s.m) return b
  const a = shotAt(shots[i - 1], tt)
  const u = easeCamera((tt - s.t0) / s.m)
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const inv = Math.exp(lerp(Math.log(1 / a.z), Math.log(1 / b.z), u)) + Math.sin(Math.PI * u) * dist * 0.5 / 1532 * clamp01(Math.min(a.z, b.z) / ZFAR - 1)
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: 1 / inv }
}
function shakeAt(plan, tt) {
  let x = 0
  let y = 0
  for (const h of plan.hits) {
    const d = tt - h.t
    if (d < 0 || d > 1.4) continue
    const k = h.a * Math.exp(-d / 0.28)
    x += k * Math.sin(d * 41 + h.t)
    y += k * 0.7 * Math.cos(d * 33 + h.t * 2)
  }
  return [x, y]
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */
const PLATE = { x: 34, y: 34, w: 1532, h: 666 }
const SX = PLATE.x + PLATE.w / 2
const SY = PLATE.y + PLATE.h / 2
/* Below this the untouched sheets of a section are one pattern fill, not a hundred elements. */
const FAR = 0.45

/** The printed sheet, as a def; a black section's red reprint has red for every black line. */
function baseOf(ctx, B, plan) {
  const id = FORMATS[B.format].base(ctx, B, plan)
  if (B.redInk && !ctx.reddened.has(id)) {
    ctx.defs.set(id, redden(ctx, ctx.defs.get(id)))
    ctx.reddened.add(id)
  }
  return id
}
const redden = (ctx, s) => s.replaceAll(INK, RED).replaceAll(`url(#${ctx.uid}-k`, `url(#${ctx.uid}-rk`)

/** A piece on its way to the pile, drawn in world units. */
function flightSvg(ctx, fl, face, now) {
  const tau = now - fl.t
  if (tau < 0 || now >= fl.tLand) return ''
  const m = flightMatrix(fl, tau)
  const front = m[0] * m[3] - m[1] * m[2] > 0
  const pid = `${ctx.uid}-fp-${fl.key}${ctx.far ? 'f' : ''}`
  if (!ctx.defs.has(pid)) ctx.defs.set(pid, `<path id="${pid}" d="${polyPath(ctx.far ? fl.pc.region.filter((p, i) => i % 5 === 0 || i === fl.pc.region.length - 1) : fl.pc.region)}"/>`)
  // From this far off it is a scrap of its colour, not a clip of the whole print (a <use> of the print clones every line of the portrait).
  const flat = ctx.far
  const body = !front ? `<use href="#${pid}" fill="${BACK}"/>` : flat ? `<use href="#${pid}" fill="${fl.colour}"/>` : `<g clip-path="url(#${clipOf(ctx, pid)})">${face}</g>`
  return `<g transform="translate(${r(fl.x + fl.off[0], 1)} ${r(fl.y + fl.off[1], 1)}) ${matStr(m)}">${body}<use href="#${pid}" fill="none" stroke="${INK}" stroke-width="2" opacity="0.4"/></g>`
}
function clipOf(ctx, pid) {
  const id = `${pid}-c`
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<clipPath id="${id}"><use href="#${pid}"/></clipPath>`)
  return id
}

function cellSvg(ctx, plan, cell, now, box) {
  const B = cell.B
  const F = FORMATS[B.format]
  const { w, h } = F.cell
  const layout = (ctx.far ? F.farLayouts : F.layouts)[cell.layout]
  const evs = (plan.byCell.get(cell.key) ?? []).filter((e) => now >= e.t)
  const place = `translate(${r(cell.x, 1)} ${r(cell.y, 1)})`
  const backGone = evs.some((e) => e.i === 'back') || (F.noBacking && evs.some((e) => e.fly && layout[e.i]?.whole))
  const out = evs.filter((e) => e.i !== 'back').map((e) => ({ i: e.i, tau: now - e.t, own: !!e.fly }))
  const st = !B.red && markOf(plan, cell, now)
  const base = `<use href="#${baseOf(ctx, B, plan)}"/>`
  const print = st && F.mark ? base + F.mark(now, st) : base
  const under = F.under(ctx, B, cell)
  const torn = tornSheet(ctx, { w, h, layoutKey: `${B.id}${cell.layout}${ctx.far ? 'f' : ''}`, layout, out, print, under, fallTo: box.y1 - cell.y + 200, core: ctx.far ? null : undefined })
  const wholeGone = out.some((o) => layout[o.i].whole)
  const over = F.over && !(wholeGone && plan.breakFrom <= now) ? F.over(ctx, B, cell, now, plan) : ''
  let flaps = torn.flaps
  for (const o of out) {
    if (o.own || ctx.far) continue
    const f = flecks(layout[o.i], o.tau)
    if (f) flaps += f
  }
  let flights = ''
  for (const e of evs) {
    if (!e.fly) continue
    const face = e.i === 'back' ? `<g transform="translate(${F.pad ?? 0} ${F.pad ?? 0})">${under}${F.over ? F.over(ctx, B, cell, now, plan) : ''}</g>` : layout[e.i].whole ? torn.sheet : print
    flights += flightSvg(ctx, e.fly, face, now)
  }
  return { body: backGone ? '' : `<g transform="${place}">${torn.body}${over}</g>`, flaps: flaps ? `<g transform="${place}">${flaps}</g>` : '', flights }
}

/** A paper backing (the board's cork, the notes' sheet) coming down in the break. */
function groundSvg(ctx, plan, B, now, flights) {
  const F = FORMATS[B.format]
  const g = plan.grounds.get(B.id)
  const paint = `<rect width="${B.w}" height="${B.h}" fill="${F.ground}"/>${F.groundOver ? F.groundOver(ctx, B, 0, 0, B.w, B.h) : ''}`
  if (!g) return `<g transform="translate(${B.x0} ${B.y0})">${paint}</g>`
  const evs = (plan.byCell.get(g.key) ?? []).filter((e) => now >= e.t)
  for (const e of evs) flights.push(flightSvg(ctx, e.fly, paint, now))
  if (!evs.length) return `<g transform="translate(${B.x0} ${B.y0})">${paint}</g>`
  const out = evs.map((e) => ({ i: e.i, tau: now - e.t, own: true }))
  if (evs.some((e) => g.layoutArr[e.i].whole)) return ''
  const torn = tornSheet(ctx, { w: B.w, h: B.h, layoutKey: `${B.id}g`, layout: g.layoutArr, out, print: paint, under: '' })
  return `<g transform="translate(${B.x0} ${B.y0})">${torn.body}</g>`
}

/** The section's journey when it is drawn over the grid: postmarks, or the string. */
function journeySvg(ctx, plan, B, now) {
  const F = FORMATS[B.format]
  const list = plan.stops.get(B.id) ?? []
  if (!F.journey || !list.length || now >= plan.breakFrom) return ''
  let i = -1
  while (i + 1 < list.length && list[i + 1].t - 0.4 <= now) i++
  if (i < 0) return ''
  const s = list[i]
  const k = clamp01((now - (s.t - 0.4)) / 0.4)
  const at = (st) => {
    if (F.journey === 'postmark') return [st.cell.x + F.cell.w, st.cell.y + F.cell.h * 0.55]
    return [st.cell.x + F.pin[0], st.cell.y + F.pin[1]]
  }
  if (F.journey === 'postmark') {
    let out = ''
    for (let j = 0; j <= i; j++) {
      if (j === i && k < 1) break
      const [x, y] = at(list[j])
      out += postmark(x, y, slap(now, list[j].t))
    }
    return out
  }
  // The string: pin to pin, sagging, the newest length running out to its pin.
  const landed = list.slice(Math.max(0, i - 11), i + (k >= 1 ? 1 : 0))
  const pts = landed.map(at)
  let d = ''
  pts.forEach(([x, y], j) => {
    if (!j) { d += `M${r(x)} ${r(y)}`; return }
    const [px, py] = pts[j - 1]
    d += `Q${r((x + px) / 2)} ${r((y + py) / 2 + Math.min(90, Math.hypot(x - px, y - py) * 0.12))} ${r(x)} ${r(y)}`
  })
  let hx = 0
  let hy = 0
  if (k < 1 && pts.length) {
    const [px, py] = pts[pts.length - 1]
    const [tx, ty] = at(s)
    const q = easeCamera(k)
    hx = lerp(px, tx, q)
    hy = lerp(py, ty, q) - Math.sin(Math.PI * q) * 40
    d += `Q${r((hx + px) / 2)} ${r((hy + py) / 2 + 30)} ${r(hx)} ${r(hy)}`
  }
  let out = d ? `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4" opacity="0.3" transform="translate(3 6)"/><path d="${d}" fill="none" stroke="${RED}" stroke-width="3.4" stroke-linecap="round"/>` : ''
  if (k < 1 && pts.length) out += pinAt(hx, hy, RED)
  return out
}

/** A section being pasted up: dropped on a little large, over 180 ms. */
function pasted(s, B, now, at) {
  if (now >= at + 0.2) return s
  const k = 1 + 0.045 * (1 - land(now, at, 0.18))
  const o = clamp01((now - at) / 0.05)
  return `<g transform="translate(${r(B.cx)} ${r(B.cy)}) scale(${r(k, 4)}) translate(${r(-B.cx)} ${r(-B.cy)})" opacity="${r(o, 3)}">${s}</g>`
}

function sectionSvg(ctx, plan, B, now, cam, box, flaps, flights) {
  const F = FORMATS[B.format]
  if (B.x0 > box.x1 || B.x0 + B.w < box.x0 || B.y0 > box.y1 || B.y0 + B.h < box.y0) return ''
  const clipId = `${ctx.uid}-sec-${B.id}`
  ctx.defs.set(clipId, `<clipPath id="${clipId}"><rect x="${B.x0 + SEAM}" y="${B.y0 + SEAM}" width="${B.w - 2 * SEAM}" height="${B.h - 2 * SEAM}"/></clipPath>`)
  // The black wall needs no ground drawn; a paper one does, and in the break it comes down.
  // The black wall needs no ground drawn, except a red one pasted over the pile; a paper one does, and in the break it comes down.
  let cells = F.ground === INK ? (B.red ? `<rect x="${B.x0}" y="${B.y0}" width="${B.w}" height="${B.h}" fill="${INK}"/>` : '') : B.red ? groundSvg(ctx, { grounds: new Map() }, B, now, flights) : groundSvg(ctx, plan, B, now, flights)
  const breaking = !B.red && now >= plan.breakFrom
  if (cam.z < FAR) {
    // From far off: the untouched sheets as one pattern; a touched one is covered and drawn as it stands.
    if (!B.red && now >= plan.sectionGone.get(B.id)) return ''
    const cleared = !B.red && now >= plan.sectionCleared.get(B.id)
    const pid = `${ctx.uid}-pat-${B.id}`
    const tall = F.brick ? 2 : 1
    const M = F.cell.gap / 2
    if (!ctx.defs.has(pid)) {
      const one = (x, y) => `<g transform="translate(${r(x)} ${r(y)})"><use href="#${baseOf(ctx, B, plan)}"/>${F.over ? F.over(ctx, B, { key: '' }, 0, null) : ''}</g>`
      let tile = one(M, M)
      if (F.brick) tile += one(M + F.brick * B.pitchX, M + B.pitchY) + one(M + F.brick * B.pitchX - B.pitchX, M + B.pitchY)
      ctx.defs.set(pid, `<pattern id="${pid}" x="${r(B.cx0 - M)}" y="${r(B.cy0 - M)}" width="${B.pitchX}" height="${B.pitchY * tall}" patternUnits="userSpaceOnUse">${tile}</pattern>`)
    }
    // A cleared section is the bare wall: no pattern, no covers (their edges would leave its grid as seams), only what is still falling.
    if (!cleared) cells += `<rect x="${B.x0}" y="${B.y0}" width="${B.w}" height="${B.h}" fill="url(#${pid})"/>`
    if (!B.red) {
      /*
       * A touched sheet is the pattern with its holes covered: a torn piece is its
       * outline filled with the flat colour of what is under the sheet, a sheet
       * gone whole is its rectangle in that colour, and a sheet whose backing has
       * gone too is the wall. Two paths a section, no clips and no <use>s.
       */
      // A cleared sheet's cover reaches halfway across the gap, so neighbours' covers meet and no seam of the pattern shows.
      const pad = Math.max(F.pad ?? 4, F.cell.gap / 2 + 1)
      const { w, h } = F.cell
      const underFlat = PILE[B.format](B)[1] ?? F.ground
      let holes = ''
      let wall = ''
      let marks = ''
      for (const { c, at: at0 } of plan.touched.get(B.id)) {
        if (at0 > now) break
        if (c.x > box.x1 || c.x + w < box.x0 || c.y > box.y1 || c.y + h < box.y0) continue
        const layout = F.farLayouts[c.layout]
        const evs = plan.byCell.get(c.key) ?? []
        let whole = false
        let back = false
        let cut = ''
        for (const e of evs) {
          if (now < e.t) continue
          if (e.fly) flights.push(flightSvg(ctx, e.fly, '', now))
          if (e.i === 'back') back = true
          else if (layout[e.i].whole) whole = true
          else cut += `M${r(c.x + layout[e.i].region[0][0], 1)} ${r(c.y + layout[e.i].region[0][1], 1)}${layout[e.i].rel}`
        }
        if (back || (whole && F.noBacking)) wall += `M${r(c.x - pad, 1)} ${r(c.y - pad, 1)}h${w + 2 * pad}v${h + 2 * pad}h${-w - 2 * pad}Z`
        else if (whole) holes += `M${r(c.x, 1)} ${r(c.y, 1)}h${w}v${h}h${-w}Z`
        else {
          holes += cut
          const st = markOf(plan, c, now)
          if (st && F.mark) marks += `<g transform="translate(${r(c.x, 1)} ${r(c.y, 1)})">${F.mark(now, st)}</g>`
        }
      }
      if (!cleared) {
        if (holes) cells += `<path d="${holes}" fill="${underFlat}"/>`
        if (wall) cells += `<path d="${wall}" fill="${F.ground}"/>`
        cells += marks
      }
    }
  }
  else {
    for (const c of cellsIn(B, box.x0, box.y0, box.x1, box.y1)) {
      if (breaking) {
        const gone = plan.goneAt.get(c.key)
        if (gone != null && now >= gone + 3) continue
      }
      const g = cellSvg(ctx, plan, c, now, box)
      cells += g.body
      if (g.flaps) flaps.push(g.flaps)
      if (g.flights) flights.push(g.flights)
    }
  }
  const s = `<g clip-path="url(#${clipId})">${cells}</g>`
  if (!B.red) {
    const j = journeySvg(ctx, plan, B, now)
    if (j) flaps.push(j)
  }
  const at = B.red ? plan.redAt.get(B.id) : plan.pasteAt.get(B.id)
  return pasted(s, B, now, at)
}

/*
 * The pile, and the musician it becomes: flat scraps in their sheets' colours,
 * drawn as a few paths per colour, in batches in the order they landed so the
 * later ones lie on top.
 */
const dark = (col) => col === INK || col === '#35312a' || col === '#2a2721'
function pileSvg(plan, now, box) {
  const groups = []
  let batch = new Map()
  let count = 0
  const outline = (pts) => 'M' + pts.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L') + 'Z'
  for (const p of plan.pile) {
    if (now < p.tLand || now >= p.tLeave) continue
    if (p.cx < box.x0 - 400 || p.cx > box.x1 + 400 || p.cy < box.y0 - 400 || p.cy > box.y1 + 400) continue
    batch.set(p.colour, (batch.get(p.colour) ?? '') + outline(p.pts))
    if (++count % 120 === 0) { groups.push(batch); batch = new Map() }
  }
  groups.push(batch)
  let s = ''
  const paint = (m) => {
    for (const [col, d] of m) s += `<path d="${d}" fill="${col}" stroke="${dark(col) ? PAPER : INK}" stroke-opacity="0.35" stroke-width="${r(1 / Math.max(ZFAR, 0.01) * 0.9, 1)}" stroke-linejoin="round"/>`
  }
  groups.forEach(paint)
  // The musician: pieces lifting off the pile and laid along his outline.
  const settled = new Map()
  let flying = ''
  for (const a of plan.assembly) {
    if (now < a.t0) continue
    const u = easeCamera(clamp01((now - a.t0) / (a.t1 - a.t0)))
    const x = lerp(a.from[0], a.to[0], u)
    const y = lerp(a.from[1], a.to[1], u) - Math.sin(Math.PI * u) * 520
    const rot = a.turn * u
    const k = lerp(1, a.grow, u)
    const c = Math.cos(rot) * k
    const sn = Math.sin(rot) * k
    const pts = a.local.map(([px, py]) => [x + c * px - sn * py, y + sn * px + c * py])
    if (u >= 1) settled.set(a.colour, (settled.get(a.colour) ?? '') + outline(pts))
    else flying += `<path d="${outline(pts)}" fill="${a.colour}" stroke="${INK}" stroke-opacity="0.35" stroke-width="5"/>`
  }
  const m = new Map(settled)
  for (const [col, d] of m) s += `<path d="${d}" fill="${col}" stroke="${dark(col) ? PAPER : INK}" stroke-opacity="0.4" stroke-width="4" stroke-linejoin="round"/>`
  return s + flying
}

/* The intro: black, CONMAN, the title to the margin, the paper in round the plate. */
function introSvg(now, score, uid) {
  const signature = advance('Havre De Grace', 26, 6)
  const room = 2 * (1530 - signature - 800) - 80
  const size1 = Math.min(96, Math.min(1000, room) / Math.max(advance(score.title), 0.001))
  const size0 = 230
  const d = easeCamera(ramp(now, TITLE.drop[0], TITLE.drop[1]))
  const size = Math.exp(lerp(Math.log(size0), Math.log(size1), d))
  const y = lerp(450 + size0 * 0.36, SHEET.lyricY + size1 * 0.36, d)
  const fade = Math.min(easeOut(ramp(now, TITLE.in[0], TITLE.in[1])), 1 - ramp(now, TITLE.out[0], TITLE.out[1]))
  const f = easeCamera(ramp(now, TITLE.frame[0], TITLE.frame[1]))
  // The black, shrinking from the whole sheet to the plate: what it leaves is the paper.
  const bx = lerp(0, PLATE.x, f)
  const by = lerp(0, PLATE.y, f)
  const bw = lerp(1600, PLATE.w, f)
  const bh = lerp(900, PLATE.h, f)
  const title = (fill) => t({ x: 800, y, size, text: score.title, fill, anchor: 'middle', weight: 700, tracking: lerp(18, 0, easeOut(ramp(now, TITLE.in[0], TITLE.drop[1]))) })
  const pencil = '#6f675b'
  const m = Math.min(easeOut(ramp(now, TITLE.marks[0], TITLE.marks[1])), 1 - ramp(now, TITLE.out[0], TITLE.out[1]))
  const clip = `<clipPath id="${uid}-blk"><rect x="${r(bx, 2)}" y="${r(by, 2)}" width="${r(bw, 2)}" height="${r(bh, 2)}"/></clipPath>`
  return {
    under: `<rect x="${r(bx, 2)}" y="${r(by, 2)}" width="${r(bw, 2)}" height="${r(bh, 2)}" fill="${INK}"/>`,
    over: `<defs>${clip}</defs><g opacity="${r(fade, 3)}">${f > 0 ? title(INK) : ''}<g clip-path="url(#${uid}-blk)">${title(PAPER)}</g></g>` +
      `<g opacity="${r(m, 3)}">${t({ x: 70, y: SHEET.lyricY + 12, size: 30, text: '2/10', fill: pencil, weight: 400, upper: false })}${t({ x: 1530, y: SHEET.lyricY + 12, size: 26, text: 'Havre De Grace', fill: RED, anchor: 'end', weight: 600, tracking: 6 })}</g>`,
  }
}

export function makeWallFrame({ swap = {} } = {}) {
  return function wallFrame({ time, score, lockup = '', uid = 'cw' }) {
    const now = time
    if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })
    const plan = planFor(score, swap)
    const section = sectionAt(score, now)
    const active = lineAt(score, now)
    const cam = plan.camAt(now)
    const [qx, qy] = shakeAt(plan, now)
    const defs = new Map()
    const ctx = { uid, defs, lod: cam.z < 0.62, far: cam.z < FAR, reddened: new Set() }
    const hw = HW / cam.z + 60
    const hh = HH / cam.z + 60
    const box = { x0: cam.x - hw, y0: cam.y - hh, x1: cam.x + hw, y1: cam.y + hh }
    let world = ''
    const flaps = []
    const flights = []
    // Every section's inks and clips, whether in view or not.
    let inks = ''
    const oldWall = now < plan.wallGone
    const redWall = now >= Math.min(...plan.redAt.values())
    for (const B of Object.values(WALL)) {
      const F = FORMATS[B.format]
      inks += inkDefs(uid, B.id, B.ink) + (F.defs ? F.defs(ctx, B) : '')
      if (oldWall && now >= plan.pasteAt.get(B.id)) world += sectionSvg(ctx, plan, B, now, cam, box, flaps, flights)
    }
    let pile = ''
    if (now >= plan.breakFrom && now < plan.redDone) pile = pileSvg(plan, now, box)
    let red = ''
    if (redWall) {
      inks += inkDefs(uid, 'rk', RED).replaceAll(`${uid}-rkg`, `${uid}-rk`)
      for (const B of Object.values(RED_WALL)) {
        const F = FORMATS[B.format]
        inks += inkDefs(uid, B.id, B.ink) + (F.defs ? F.defs(ctx, B) : '')
        if (now >= plan.redAt.get(B.id)) red += sectionSvg(ctx, plan, B, now, cam, box, [], [])
      }
    }
    const intro = now < TITLE.out[1] ? introSvg(now, score, uid) : null
    const margin = intro ? '' : marginLyric({ now, score, uid })
    const clip = plateClip(uid)
    const view = `translate(${r(SX + qx, 2)} ${r(SY + qy, 2)}) scale(${r(cam.z, 5)}) translate(${r(-cam.x, 2)} ${r(-cam.y, 2)})`
    const svg = [
      paper(),
      intro ? intro.under : '',
      `<defs>${clip.def}${portraitDefs(uid)}${inks}${[...defs.values()].join('')}</defs>`,
      `<g clip-path="${clip.url}"><rect x="${PLATE.x}" y="${PLATE.y}" width="${PLATE.w}" height="${PLATE.h}" fill="${INK}"/>`,
      `<g transform="${view}">${world}${flaps.join('')}${flights.join('')}${pile}${red}</g>`,
      '</g>',
      intro ? intro.over : margin,
    ].join('\n')
    return { svg, label: active?.text ?? section.label }
  }
}

/** The film, as it stands: the lineup on /music-videos/conman. */
export const wallFrame = makeWallFrame()

/** Where each slot's own ten seconds are, for the style guide. */
export function slotWindow(score, id) {
  const hs = HOLDS.find((h) => h[0] === id)
  if (hs) {
    const line = score.lines[hs[1]]
    return { from: Math.round((line.start - 0.9) * 10) / 10, to: Math.round((line.start + 9.1) * 10) / 10 }
  }
  return null
}

/** The plan, for tools: the shots, and every tear with its time and section. */
export const wallPlan = (score, swap = {}) => planFor(score, swap)
