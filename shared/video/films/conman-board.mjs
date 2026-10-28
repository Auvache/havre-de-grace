/*
 * Conman — the board.
 *
 * The rework of the wall (conman-wall.mjs), taken with the person watching on
 * 2026-09-28. The song is about taking from every musician you love to make
 * yourself, and hoping someone takes from you in turn. So the film is two
 * boards on black:
 *
 *   theirs   the artists I love — sixteen sections, each a grid of one sheet
 *            (a poster, a stamp, a banknote…) in its own ink. Torn up through
 *            the song, and in the break torn off completely, down to black.
 *   mine     the same sixteen sections, made of the scraps of theirs, with my
 *            face on them and printed in the album's red (MY BOARD, below).
 *            Pasted up through the last verse; then, slowly, others start
 *            tearing it too.
 *
 * The board is a 4 × 4 grid of equal sections, each exactly the plate's shape,
 * so a section held full frame fills the plate and the whole board is four
 * plates across. The camera holds on one section, moves to a neighbour without
 * changing scale, and pulls out only in the break and in the last seconds.
 *
 * This file is the furniture: the formats, the board and how a cell is drawn
 * on either board. It is pure and draws any state it is handed; which
 * sheet tears when is the film's plan.
 */
import { t, r, lerp, clamp01, easeInOut } from '../kit.mjs'
import { PAPER, PAPER_SHADE, INK, RED, COVER_SHEET } from '../album.mjs'
import { SCENES, makeKit, hash, GREEN, portraitDefs } from '../portraits.mjs'
// Imported by name, not bare: the server build drops a side-effect-only import, and the scenes with it.
import { WALL_OBJECTS } from '../still-lifes.mjs'
import { WALL_SITTERS } from '../wall-sitters.mjs'
import { piece, wholeSheet, tornLine, coreLine, tornSheet, polyPath, flecks } from '../torn.mjs'

/* ══ INKS ══════════════════════════════════════════════════════════════ */
export const BOARD_INKS = {
  posters: '#ee7a1f', // tangerine
  stamps: '#6a2ba0', // violet
  lessons: INK,
  soldOut: '#3aa655', // kelly green
  notes: '#0b7a4c', // emerald
  magazines: '#ef6aa0', // pink
  drummer: '#f5d90a', // fluorescent yellow flyer
  setlists: '#5ad0e6', // highlighter
  cheques: '#58a6dd', // sky
  score: '#7a4a22', // sepia
  cassettes: '#0f9a8f', // turquoise
  tickets: INK,
  amps: '#e0a21b', // tweed gold
  tour: '#c9d81c', // chartreuse
  sleeves: '#1f4fd1', // cobalt
  passes: '#9b7fd4', // lilac
}

/* ══ MY BOARD ══════════════════════════════════════════════════════════
 *
 * The second board is mine: the same sixteen sections in the same places, my
 * face on every sheet that has one and our name where a sheet names someone,
 * printed in the album's red (a section printed in black has red for its
 * black). And it is made of the first board: every sheet is a collage of torn
 * scraps of the old sheets, and my print goes over it with the collage showing
 * wherever the print left bare paper — the face above all, so the face on
 * every sheet is pieced together from everybody else's.
 *
 * A sheet's collage is one of VARIANTS per format, each a def: a full-sheet
 * scrap and SCRAPS torn ones over it, each a clipped window onto some old
 * sheet, turned. The print reaches the collage by pattern: its paper fills
 * become a pattern of the collage in the sheet's own units, and the face's
 * paper a finer collage of its own, in the portrait's units.
 */
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
const toHex = (v) => '#' + v.map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0')).join('')
/** A sheet that is mostly bare page (the setlists, the sheet music) keeps its page, washed with the red. */
const RED_WASH = toHex(hex(PAPER).map((a, i) => lerp(a, hex(RED)[i], 0.3)))
export const VARIANTS = 4
export const SCRAPS = 6
const ME = 'newcomer'
/* Where a sheet names somebody, mine names us. */
const MY_WORDS = {
  A: { head: 'Tonight', foot: 'Havre de Grace' },
  P: { head: 'Sold out', foot: 'Havre de Grace' },
  C: { head: 'Guitar', sub: 'Lessons', line1: 'Learn my songs', line2: 'Play like me', tab: 'Havre 555 0168' },
  M: { head: 'Drummer', sub: 'Wanted', line1: 'Join Havre de Grace', line2: 'Influences a must', tab: 'Havre 555 0142' },
}

/** My version of a section in collage variant `v`. */
function mineOf(S, v, mode = 'mix') {
  const F = FORMATS[S.format]
  const id = `m${v}${mode[0]}-${S.id}`
  const black = (s) => (S.black ? s.replaceAll(INK, RED).replaceAll('url(#UID-k', 'url(#UID-rk') : s)
  // The collage shows through the print's paper shapes, never its type: type filled with a collage is unreadable and costs a pattern per glyph.
  const paperTo = (pat) => (s) => (F.page ? s.replaceAll(`fill="${F.page}"`, `fill="${RED_WASH}"`) : s.replace(/<(?:rect|path|circle|ellipse|polygon)\b[^>]*>/g, (tag) => tag.replaceAll(`fill="${PAPER}"`, `fill="url(#UID-${id}-${pat}§L)"`)))
  return { ...S, id, layer: `m${v}${mode[0]}`, v, mode, ink: RED, face: S.face ? ME : null, words: MY_WORDS[S.id] ?? S.words, map: (s) => paperTo('cps')(black(s)), artMap: (s) => paperTo('cpa')(black(s)) }
}

/*
 * The scraps of one collage: a full-box scrap, then `n` torn rectangles, each
 * a window onto an old sheet, turned. A sheet's collage is cut to the sheet;
 * a face's is finer (FACE), so a face reads as pieced together, not as one
 * scrap with a face drawn round it.
 */
const FACE = { w: 360, h: 460, n: 11, region: [100, 96, 260, 330], size: [22, 50], scale: 0.62 }
const cut = new Map()
/* The torn edge's step: fine close to, coarse from far off, where a scrap is a few pixels across. */
const scrapStep = (lod) => (lod ? 14 : 6)
function scrapsOf(key, v, o, lod = false) {
  const ck = `${key}:${v}:${lod ? 'l' : ''}`
  if (cut.has(ck)) return cut.get(ck)
  const { w, h } = o
  const [rx0, ry0, rx1, ry1] = o.region ?? [0, 0, w, h]
  const seed = [...key].reduce((n, ch) => n * 31 + ch.charCodeAt(0), 7) % 997 + v * 131
  const H = (k, q) => hash(seed + k * 17, q, 83)
  const out = []
  for (let k = 0; k <= o.n; k++) {
    let pts
    if (k === 0) pts = [[0, 0], [w, 0], [w, h], [0, h]]
    else {
      const cx = lerp(rx0, rx1, 0.06 + 0.88 * H(k, 1))
      const cy = lerp(ry0, ry1, 0.06 + 0.88 * H(k, 2))
      const hw = o.size ? lerp(o.size[0], o.size[1], H(k, 3)) : w * (0.2 + 0.2 * H(k, 3))
      const hh = o.size ? lerp(o.size[0], o.size[1], H(k, 4)) : h * (0.18 + 0.2 * H(k, 4))
      const a = (H(k, 5) - 0.5) * 0.8
      const c = Math.cos(a)
      const sn = Math.sin(a)
      const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [cx + c * x - sn * y, cy + sn * x + c * y])
      pts = []
      for (let i = 0; i < 4; i++) pts = pts.concat(tornLine(corners[i], corners[(i + 1) % 4], seed + k * 29 + i, { rough: 0.05, fine: 1, step: scrapStep(lod) }).slice(0, -1))
    }
    const src = BOARD[Math.floor(H(k, 6) * BOARD.length)]
    const sc = FORMATS[src.format].cell
    const px = sc.w * (0.2 + 0.6 * H(k, 7))
    const py = sc.h * (0.2 + 0.6 * H(k, 8))
    const cen = k ? pts.reduce((m, p) => [m[0] + p[0] / pts.length, m[1] + p[1] / pts.length], [0, 0]) : [w / 2, h / 2]
    const scale = o.scale ? ` scale(${o.scale})` : ''
    out.push({ pts, src, place: `translate(${r(cen[0], 1)} ${r(cen[1], 1)}) rotate(${r((H(k, 9) - 0.5) * 50, 1)})${scale} translate(${r(-px, 1)} ${r(-py, 1)})` })
  }
  cut.set(ck, out)
  return out
}
const sheetCut = (fmt, v, lod = false) => scrapsOf(fmt, v, { ...FORMATS[fmt].cell, n: SCRAPS }, lod)
/** A scrap's outline, once per frame: its clip, its fill, its edge and its shadow all point at it. */
function scrapPath(ctx, key, sc, k) {
  const pid = `${ctx.uid}-sp-${key}${ctx.lod ? 'l' : ''}-${k}`
  if (!ctx.defs.has(pid)) {
    ctx.defs.set(pid, `<path id="${pid}" d="${polyPath(sc.pts)}"/>`)
    ctx.defs.set(`${pid}c`, `<clipPath id="${pid}c"><use href="#${pid}"/></clipPath>`)
  }
  return pid
}
/** One scrap: the old sheet through its window, and its torn edge. */
function scrapSvg(ctx, key, sc, k, hint = false) {
  const pid = scrapPath(ctx, key, sc, k)
  const edge = !k ? '' : ctx.lod ? `<use href="#${pid}" fill="none" stroke="#f6f0e2" stroke-width="4"/>` : `<use href="#${pid}" fill="none" stroke="#f6f0e2" stroke-width="3"/><use href="#${pid}" fill="none" stroke="${INK}" stroke-width="0.7" opacity="0.4"/>`
  // From far off a scrap is a few pixels across: its sheet's colour, flat, is all that reads, and the print under it would be repainted every frame.
  if (ctx.lod) return `<use href="#${pid}" fill="${scrapColour(sc)}"/>${edge}`
  /*
   * In a face, a scrap is its sheet's ink with one of the portraits' black
   * hatches over it, not a window onto the sheet: a window there is a
   * portrait inside a collage inside a portrait, repainted every frame, and it
   * took my board from 60 frames a second to 15 (2026-09-28).
   */
  if (hint) return `<use href="#${pid}" fill="${scrapColour(sc)}"/><use href="#${pid}" fill="url(#${ctx.uid}-k${1 + (k % 4)})" opacity="0.4"/>${edge}`
  return `<g clip-path="url(#${pid}c)"><use href="#${pid}" fill="${sc.src.ink === INK ? PAPER : sc.src.ink}"/><use href="#${FORMATS[sc.src.format].base(ctx, sc.src)}" transform="${sc.place}"/></g>${edge}`
}
const scrapColour = (sc) => (sc.src.ink === INK ? PAPER_SHADE : sc.src.ink)
/*
 * A scrap laid on a cell of mine: its outline filled with a pattern of the old
 * sheet, placed and turned. A <use> of the sheet would clone its whole subtree,
 * portrait and all, once per scrap; a pattern is laid out once and tiled.
 */
function scrapFill(ctx, key, sc, k) {
  const pid = scrapPath(ctx, key, sc, k)
  const cell = FORMATS[sc.src.format].cell
  const tid = `${ctx.uid}-spt-${key}-${k}`
  if (!ctx.lod && !ctx.defs.has(tid)) ctx.defs.set(tid, `<pattern id="${tid}" patternUnits="userSpaceOnUse" width="${cell.w}" height="${cell.h}" patternTransform="${sc.place}"><use href="#${FORMATS[sc.src.format].base(ctx, sc.src)}"/></pattern>`)
  const edge = !k ? '' : ctx.lod ? `<use href="#${pid}" fill="none" stroke="#f6f0e2" stroke-width="4"/>` : `<use href="#${pid}" fill="none" stroke="#f6f0e2" stroke-width="3"/><use href="#${pid}" fill="none" stroke="${INK}" stroke-width="0.7" opacity="0.4"/>`
  return `<use href="#${pid}" fill="${ctx.lod ? scrapColour(sc) : `url(#${tid})`}"/>${edge}`
}
const sheetScrap = (ctx, fmt, v, k) => scrapFill(ctx, `${fmt}-${v}`, sheetCut(fmt, v, ctx.lod)[k], k)
/** A whole collage, as a def: a sheet's (`fmt`) or a face's (`fmt` null). */
function collageDef(ctx, fmt, v, pale) {
  const id = `${ctx.uid}-col-${fmt ?? 'face'}-${v}${pale ? 'p' : ''}${ctx.lod ? 'l' : ''}`
  if (!ctx.defs.has(id)) {
    const box = fmt ? FORMATS[fmt].cell : FACE
    const scraps = fmt ? sheetCut(fmt, v, ctx.lod) : scrapsOf('face', v, FACE, ctx.lod)
    let s = scraps.map((sc, k) => scrapSvg(ctx, `${fmt ?? 'face'}-${v}`, sc, k, !fmt)).join('')
    if (pale) s += `<rect width="${box.w}" height="${box.h}" fill="${PAPER}" opacity="0.45"/>`
    ctx.defs.set(id, `<g id="${id}">${s}</g>`)
  }
  return id
}
/** My sheet, printed over its collage: the patterns its paper fills point at, then the print. */
function mineBase(ctx, B) {
  const F = FORMATS[B.format]
  const { w, h } = F.cell
  const pid = `${ctx.uid}-${B.id}-cps${far(ctx)}`
  if (!ctx.defs.has(pid)) ctx.defs.set(pid, `<pattern id="${pid}" patternUnits="userSpaceOnUse" width="${w}" height="${h}"><use href="#${collageDef(ctx, B.format, B.v, B.mode !== 'full')}"/></pattern>`)
  return F.base(ctx, B)
}

const hatchPat = (id, angle, gap, width, colour) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="${gap / 2}" x2="${gap}" y2="${gap / 2}" stroke="${colour}" stroke-width="${width}"/></pattern>`
/** The portraits' second-ink hatches, in a section's own ink. */
const inkDefs = (u, tag, ink) => [
  hatchPat(`${u}-${tag}g0`, 0, 4.2, 0.75, ink), hatchPat(`${u}-${tag}g1`, 42, 4, 0.85, ink), hatchPat(`${u}-${tag}g2`, -40, 4.4, 0.8, ink),
  hatchPat(`${u}-${tag}g3`, 50, 2.8, 1.05, ink), hatchPat(`${u}-${tag}g4`, -36, 3.1, 1, ink),
].join('')
/** The portraits' black hatches, for a layer that reprints the black (k1–k4 as in portraitDefs). */
const kDefs = (u, tag, colour) => [
  hatchPat(`${u}-${tag}k1`, 38, 4.4, 0.8, colour), hatchPat(`${u}-${tag}k2`, -40, 4.8, 0.75, colour),
  hatchPat(`${u}-${tag}k3`, 50, 2.9, 1.05, colour), hatchPat(`${u}-${tag}k4`, -36, 3.1, 1, colour),
].join('')

/*
 * Every def's id says everything its content depends on, so a frame's defs can
 * stay mounted from one frame to the next (conman-board-film.mjs): what is
 * drawn near and far differs, so its id carries `far`.
 */
const far = (ctx) => (ctx.lod ? '~l' : '')
const mapped = (ctx, B, s, f = B.map) => (f ? f(s.replaceAll(`url(#${ctx.uid}-k`, 'url(#UID-k')).replaceAll('UID', ctx.uid).replaceAll('§L', far(ctx)) : s)

/** A scene's drawing, no ground, in a section's ink, once per frame (360 × 460 box). */
function art(ctx, B, id) {
  const gid = `${ctx.uid}-ar-${B.id}-${ctx.lod ? 'l' : ''}${id}`
  if (!ctx.defs.has(gid)) {
    const K = makeKit(ctx, `${B.layer ?? 'c'}${ctx.lod ? `${id}-l` : id}`)
    const s = SCENES[id].draw(K).replaceAll(GREEN, B.ink).replaceAll(`url(#${ctx.uid}-g`, `url(#${ctx.uid}-${B.id}g`)
    ctx.defs.set(gid, `<g id="${gid}">${mapped(ctx, B, s, B.artMap ?? B.map)}</g>`)
  }
  return gid
}
/*
 * A scene placed in a sheet. On my sheets its paper is the collage's pattern
 * brought back into the scene's own units, so the scraps run on across its edge.
 */
const artAt = (ctx, B, id, x, y, s) => {
  if (B.artMap) {
    const pid = `${ctx.uid}-${B.id}-cpa${far(ctx)}`
    if (!ctx.defs.has(pid)) ctx.defs.set(pid, `<pattern id="${pid}" patternUnits="userSpaceOnUse" width="${FACE.w}" height="${FACE.h}"><use href="#${collageDef(ctx, null, B.v, B.mode === 'pale')}"/></pattern>`)
  }
  return `<use href="#${art(ctx, B, id)}" transform="translate(${r(x, 1)} ${r(y, 1)}) scale(${r(s, 4)})"/>`
}
const rectD = (w, h) => `M0 0H${w}V${h}H0Z`
/** A def once per section per frame, in the section's layer. */
const def = (ctx, B, k, make) => {
  const id = `${ctx.uid}-${B.id}-${k}${far(ctx)}`
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<g id="${id}">${mapped(ctx, B, make())}</g>`)
  return id
}
const clipDef = (ctx, B, k, d) => {
  const id = `${ctx.uid}-${B.id}-${k}`
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<clipPath id="${id}"><path d="${d}"/></clipPath>`)
  return `url(#${id})`
}
const roundRectD = (x, y, w, h, rr) => `M${x + rr} ${y}H${x + w - rr}A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}V${y + h - rr}A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}H${x + rr}A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}V${y + rr}A${rr} ${rr} 0 0 1 ${x + rr} ${y}Z`
const circD = (cx, cy, rad) => `M${cx - rad} ${cy}a${rad} ${rad} 0 1 0 ${rad * 2} 0a${rad} ${rad} 0 1 0 ${-rad * 2} 0Z`

/* ══ HOW A SHEET TEARS ═════════════════════════════════════════════════
 *
 * As on the wall: each sheet picks one of a few layouts of pieces that never
 * overlap, sized 0 (a nick) to 3 (half the sheet), and every layout ends in
 * the whole sheet coming away.
 */
function layoutsFor(w, h, seed, o = {}) {
  const L = 2 * (w + h)
  const left = (y) => 2 * w + h + (h - y)
  const right = (y) => w + y
  const bottom = (x) => w + h + (w - x)
  const rough = o.rough ?? 0.08
  const P = (from, to, size, extra = {}, k = 0) => piece(w, h, from, to, seed + k * 101, { rough, size, ...extra })
  const floor = o.floor ?? 1
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
 * A format is a sheet: its cell { w, h, gap }, `brick` (row offset as a share
 * of the pitch), `zoom` (how big a sheet reads with the section full frame),
 * `ground` (what shows between sheets), `base` (the sheet as printed, filling
 * its whole cell — anything left transparent would show the next layer through
 * it) and `over` (anything fixed over every sheet: perforations, a pin).
 * A format reads its section for words, face and ink, so one format serves
 * two sections (the posters, the flyers).
 */

/* ── Concert posters ─────────────────────────────────────────────────── */
const POSTER = { w: 300, h: 420 }
const posters = {
  cell: { ...POSTER, gap: 6 },
  zoom: 0.8,
  layouts: layoutsFor(POSTER.w, POSTER.h, 17, { rough: 0.05 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = POSTER
    const o = B.words
    return `<rect width="${w}" height="${h}" fill="${B.ink}"/>${artAt(ctx, B, B.face, w / 2 - 180 * 0.86, 44, 0.86)}` +
      `<rect width="${w}" height="72" fill="${PAPER}"/>${t({ x: w / 2, y: 58, size: 60, text: o.head, fill: INK, anchor: 'middle', weight: 800, len: w - 30 })}` +
      `<rect y="${h - 58}" width="${w}" height="58" fill="${INK}"/>${t({ x: w / 2, y: h - 20, size: 26, text: o.foot, fill: B.ink, anchor: 'middle', weight: 700, len: w - 40 })}`
  }),
}

/* ── Stamps ──────────────────────────────────────────────────────────── */
const STAMP = { w: 176, h: 214 }
const stamps = {
  cell: { ...STAMP, gap: 0 },
  zoom: 1.12,
  layouts: layoutsFor(STAMP.w, STAMP.h, 19, { rough: 0.1 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = STAMP
    return `<rect width="${w}" height="${h}" fill="${PAPER}"/><rect x="13" y="13" width="${w - 26}" height="${h - 26}" fill="${B.ink}"/>` +
      `<rect x="24" y="24" width="${w - 48}" height="${h - 72}" fill="${PAPER}"/>` +
      `<g clip-path="${clipDef(ctx, B, 'win', `M24 24h${w - 48}v${h - 72}h${-(w - 48)}Z`)}">${artAt(ctx, B, B.face, w / 2 - 180 * 0.4, 18, 0.4)}</g>` +
      t({ x: 30, y: h - 26, size: 34, text: '2', fill: PAPER, weight: 700 }) +
      t({ x: w - 24, y: h - 32, size: 10, text: 'Havre', fill: PAPER, weight: 700, anchor: 'end', tracking: 2 }) +
      t({ x: w - 24, y: h - 20, size: 10, text: 'de Grace', fill: PAPER, weight: 700, anchor: 'end', tracking: 2 })
  }),
  // The black between the stamps: holes punched along every edge.
  over: () => `<path d="${rectD(STAMP.w, STAMP.h)}" fill="none" stroke="${INK}" stroke-width="7" stroke-dasharray="0.01 11.6" stroke-linecap="round"/>`,
}

/* ── Tear-off flyers on a notice board ───────────────────────────────── */
const FLYER = { w: 236, h: 340, tabTop: 272, tabs: 8 }
function tabPiece(i, seed) {
  const tw = FLYER.w / FLYER.tabs
  const x0 = i * tw
  const x1 = (i + 1) * tw
  const top = tornLine([x0, FLYER.tabTop], [x1, FLYER.tabTop], seed, { rough: 0.14, fine: 0.9, step: 3 })
  const core = coreLine(top, [(x0 + x1) / 2, FLYER.h], seed, 1.4, 4)
  return { region: [[x0, FLYER.h], ...top, [x1, FLYER.h]], coreRegion: [[x0, FLYER.h], ...core, [x1, FLYER.h]], line: top, hinge: [[x0, FLYER.tabTop], [x1, FLYER.tabTop]], centre: [(x0 + x1) / 2, (FLYER.tabTop + FLYER.h) / 2], style: 'pull', seed, size: 0 }
}
const pinAt = (x, y, col = INK) => `<circle cx="${r(x)}" cy="${r(y + 3)}" r="8" fill="${INK}" opacity="0.3"/><circle cx="${r(x)}" cy="${r(y)}" r="8" fill="${col}"/><circle cx="${r(x - 2.5)}" cy="${r(y - 2.5)}" r="2.4" fill="${PAPER}" opacity="0.7"/>`
const flyers = {
  cell: { w: FLYER.w, h: FLYER.h, gap: 34 },
  brick: 0.18,
  zoom: 0.9,
  layouts: layoutsFor(FLYER.w, FLYER.h, 23, { rough: 0.1, floor: 0.74, style: 'pull' }).map((ls, k) => {
    const order = [[3, 6, 1, 4, 0, 7, 2, 5], [5, 2, 7, 0, 4, 1, 6, 3], [1, 4, 6, 2, 7, 3, 0, 5]][k]
    return [...order.map((i) => tabPiece(i, 300 + k * 40 + i)), ...ls]
  }),
  ground: PAPER_SHADE,
  groundOver: (ctx, B) => {
    const id = `${ctx.uid}-${B.id}-cork`
    if (!ctx.defs.has(id)) ctx.defs.set(id, mapped(ctx, B, `<pattern id="${id}" width="46" height="46" patternUnits="userSpaceOnUse"><circle cx="7" cy="9" r="1.6" fill="${INK}" opacity="0.16"/><circle cx="31" cy="21" r="1.1" fill="${INK}" opacity="0.12"/><circle cx="18" cy="38" r="2" fill="${INK}" opacity="0.1"/><circle cx="40" cy="41" r="1" fill="${INK}" opacity="0.14"/></pattern>`))
    return `url(#${id})`
  },
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = FLYER
    const o = B.words
    const fg = B.fg ?? PAPER
    let s = `<rect width="${w}" height="${h}" fill="${B.ink}"/>`
    s += t({ x: w / 2, y: 70, size: 50, text: o.head, fill: fg, anchor: 'middle', weight: 800, len: w - 34 })
    s += t({ x: w / 2, y: 100, size: 28, text: o.sub, fill: fg, anchor: 'middle', weight: 700, len: w - 76 })
    s += `<rect x="58" y="110" width="${w - 116}" height="122" fill="${PAPER}"/>`
    s += `<g clip-path="${clipDef(ctx, B, 'win', `M58 110h${w - 116}v122h${-(w - 116)}Z`)}">${artAt(ctx, B, B.face, w / 2 - 180 * 0.3, 106, 0.3)}</g>`
    s += `<rect x="58" y="110" width="${w - 116}" height="122" fill="none" stroke="${fg}" stroke-width="2"/>`
    s += t({ x: w / 2, y: 252, size: 15, text: o.line1, fill: fg, anchor: 'middle', weight: 700, tracking: 1 })
    s += t({ x: w / 2, y: 266, size: 10, text: o.line2, fill: fg, anchor: 'middle', weight: 500, tracking: 1.2 })
    const tw = w / FLYER.tabs
    let cuts = ''
    for (let i = 1; i < FLYER.tabs; i++) cuts += `M${r(i * tw)} ${FLYER.tabTop}V${h}`
    s += `<path d="M0 ${FLYER.tabTop}H${w}" stroke="${fg}" stroke-width="1" stroke-dasharray="3 3"/><path d="${cuts}" stroke="${fg}" stroke-width="1"/>`
    for (let i = 0; i < FLYER.tabs; i++) s += t({ x: 0, y: 0, size: 9.5, text: o.tab, fill: fg, weight: 700, anchor: 'middle', transform: `translate(${r(i * tw + tw / 2 + 3)} ${(FLYER.tabTop + h) / 2}) rotate(-90)` })
    return s
  }),
  over: () => pinAt(FLYER.w / 2, 14),
}

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
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h, stub } = TICKET
    let s = `<rect width="${w}" height="${h}" fill="${PAPER}"/><rect width="18" height="${h}" fill="${INK}"/><rect x="${stub}" width="${w - stub}" height="${h}" fill="${INK}"/>`
    s += `<circle cx="82" cy="75" r="52" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
    s += `<g clip-path="${clipDef(ctx, B, 'win', circD(82, 75, 51))}">${artAt(ctx, B, B.face, 82 - 180 * 0.27, 20, 0.27)}</g>`
    // A record in the corner, where the peppermint was.
    s += `<circle cx="262" cy="30" r="18" fill="${INK}"/><circle cx="262" cy="30" r="12.5" fill="none" stroke="${PAPER}" stroke-width="0.7" opacity="0.5"/><circle cx="262" cy="30" r="6" fill="${PAPER}"/><circle cx="262" cy="30" r="1.4" fill="${INK}"/>`
    s += t({ x: 146, y: 72, size: 36, text: 'Admit one', fill: INK, weight: 800 })
    s += t({ x: 147, y: 96, size: 13, text: 'One night only', fill: INK, weight: 700, tracking: 3 })
    s += t({ x: 147, y: 120, size: 11, text: 'Standing · doors at seven', fill: INK, weight: 500, tracking: 1.5 })
    s += `<path d="M${stub} 4V${h - 4}" stroke="${PAPER}" stroke-width="3.4" stroke-dasharray="0.1 7" stroke-linecap="round"/>`
    s += t({ x: 0, y: 0, size: 17, text: 'Admit one', fill: PAPER, weight: 800, anchor: 'middle', tracking: 2, transform: `translate(${stub + 42} ${h / 2}) rotate(-90)` })
    s += t({ x: 0, y: 0, size: 9, text: 'Keep this stub', fill: PAPER, weight: 500, anchor: 'middle', tracking: 1.5, transform: `translate(${stub + 66} ${h / 2}) rotate(-90)` })
    return s
  }),
}

/* ── Banknotes ───────────────────────────────────────────────────────── */
const NOTE = { w: 400, h: 190 }
const notes = {
  cell: { w: NOTE.w, h: NOTE.h, gap: 16 },
  brick: 0.5,
  zoom: 0.95,
  layouts: layoutsFor(NOTE.w, NOTE.h, 13, { rough: 0.06 }),
  ground: PAPER,
  groundOver: (ctx, B) => `url(#${ctx.uid}-${B.id}g0)`,
  groundOpacity: 0.25,
  base: (ctx, B) => def(ctx, B, 'base', () => {
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
    s += `<g clip-path="${clipDef(ctx, B, 'win', `M54 ${h / 2}a66 72 0 1 0 132 0a66 72 0 1 0 -132 0Z`)}">${artAt(ctx, B, B.face, 120 - 180 * 0.42, 95 - 200 * 0.42, 0.42)}</g>`
    s += t({ x: 200, y: 20, size: 9.5, text: 'This note is a copy of a copy', fill: INK, anchor: 'middle', weight: 600, tracking: 1.6 })
    s += t({ x: 200, y: h - 11, size: 9.5, text: 'Payable to whoever takes it next', fill: PAPER, anchor: 'middle', weight: 600, tracking: 1.4 })
    return s
  }),
}

/* ── Amps ────────────────────────────────────────────────────────────── */
const AMP = { w: 310, h: 250 }
const JEWEL = [155 + (296 - 180) * 0.62, 125 + (140 - 235) * 0.62]
const amps = {
  cell: { w: AMP.w, h: AMP.h, gap: 26 },
  zoom: 0.9,
  layouts: layoutsFor(AMP.w, AMP.h, 29, { rough: 0.07 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = AMP
    return `<rect width="${w}" height="${h}" fill="${B.ink}"/>${artAt(ctx, B, 'amp', 155 - 180 * 0.62, 118 - 235 * 0.62, 0.62)}` +
      `<rect y="${h - 34}" width="${w}" height="34" fill="${INK}"/>${t({ x: w / 2, y: h - 11, size: 18, text: 'Sounds like', fill: B.ink, anchor: 'middle', weight: 800, tracking: 6 })}` +
      `<circle cx="${r(JEWEL[0])}" cy="${r(JEWEL[1])}" r="6" fill="${INK}" stroke="${PAPER}" stroke-width="1.4"/>`
  }),
}

/* ── The tour schedule ───────────────────────────────────────────────── */
const TOUR = { w: 250, h: 360 }
const DATES = [['Mar 03', 'Paris'], ['Mar 05', 'Berlin'], ['Mar 07', 'Oslo'], ['Mar 10', 'Dublin'], ['Mar 12', 'Lisbon'], ['Mar 15', 'Prague'], ['Mar 18', 'Rome'], ['Mar 21', 'Vienna'], ['Mar 24', 'Boston'], ['Mar 27', 'Austin'], ['Mar 30', 'Denver'], ['Apr 02', 'Seattle']]
const tour = {
  cell: { w: TOUR.w, h: TOUR.h, gap: 14 },
  zoom: 0.95,
  layouts: layoutsFor(TOUR.w, TOUR.h, 41, { rough: 0.07 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = TOUR
    let s = `<rect width="${w}" height="${h}" fill="${B.ink}"/><rect width="${w}" height="70" fill="${INK}"/>${t({ x: w / 2, y: 52, size: 44, text: 'On tour', fill: B.ink, anchor: 'middle', weight: 800, len: w - 40 })}`
    DATES.forEach(([d, c], i) => {
      const y = 98 + i * 20.5
      s += t({ x: 20, y, size: 13, text: d, fill: INK, weight: 800, tracking: 1 }) + t({ x: 92, y, size: 13, text: c, fill: INK, weight: 500, tracking: 1.5 })
    })
    s += `<path d="M20 ${h - 26}H${w - 20}" stroke="${INK}" stroke-width="1.4"/>${t({ x: w / 2, y: h - 10, size: 9, text: 'Tickets at the door', fill: INK, anchor: 'middle', weight: 700, tracking: 2 })}`
    return s
  }),
}

/* ── Record sleeves ──────────────────────────────────────────────────── */
const SLEEVE = { w: 350, h: 300, s: 300 }
const sleeves = {
  cell: { w: SLEEVE.w, h: SLEEVE.h, gap: 12 },
  zoom: 0.92,
  layouts: layoutsFor(SLEEVE.w, SLEEVE.h, 53, { rough: 0.07 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h, s: q } = SLEEVE
    // The record half out of its sleeve, on the black the sleeves are pasted to.
    let s = `<rect width="${w}" height="${h}" fill="${INK}"/><circle cx="240" cy="${h / 2}" r="${h / 2 - 16}" fill="#2a2721"/>`
    for (const k of [120, 108, 96, 84, 72]) s += `<circle cx="240" cy="${h / 2}" r="${k}" fill="none" stroke="${PAPER}" stroke-width="0.8" opacity="0.28"/>`
    s += `<path d="M318 64A118 118 0 0 1 350 120" fill="none" stroke="${PAPER}" stroke-width="5" opacity="0.18"/>`
    s += `<rect width="${q}" height="${h}" fill="${B.ink}"/>`
    s += `<rect x="22" y="22" width="${q - 44}" height="196" fill="${PAPER}"/>`
    s += `<g clip-path="${clipDef(ctx, B, 'win', `M22 22h${q - 44}v196h${-(q - 44)}Z`)}">${artAt(ctx, B, B.face, q / 2 - 180 * 0.56, 18, 0.56)}</g>`
    s += t({ x: 22, y: 262, size: 38, text: 'Long player', fill: PAPER, weight: 800, len: q - 44 })
    s += t({ x: 22, y: 284, size: 11, text: 'Side one · 33⅓ rpm', fill: PAPER, weight: 600, tracking: 2 })
    s += `<path d="M${q} 0V${h}" stroke="${INK}" stroke-width="2" opacity="0.5"/>`
    return s
  }),
}

/* ── Cassettes ───────────────────────────────────────────────────────── */
const TAPE = { w: 320, h: 200 }
const cassettes = {
  cell: { w: TAPE.w, h: TAPE.h, gap: 14 },
  brick: 0.5,
  zoom: 1.0,
  layouts: layoutsFor(TAPE.w, TAPE.h, 59, { rough: 0.07 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = TAPE
    let s = `<rect width="${w}" height="${h}" fill="${INK}"/><path d="${roundRectD(6, 6, w - 12, h - 12, 14)}" fill="#35312a"/>`
    s += `<path d="${roundRectD(22, 18, w - 44, 124, 6)}" fill="${B.ink}"/><rect x="22" y="18" width="${w - 44}" height="36" fill="${PAPER}"/>`
    s += t({ x: 34, y: 44, size: 20, text: 'Side A', fill: INK, weight: 800 })
    s += t({ x: w - 34, y: 44, size: 15, text: 'songs I borrowed', fill: INK, weight: 500, anchor: 'end', upper: false, italic: true })
    s += `<path d="${roundRectD(86, 66, 148, 50, 25)}" fill="${INK}"/>`
    for (const cx of [118, 202]) {
      s += `<circle cx="${cx}" cy="91" r="19" fill="${PAPER}"/><circle cx="${cx}" cy="91" r="9" fill="${INK}"/>`
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; s += `<rect x="${r(cx + Math.cos(a) * 7 - 1.5)}" y="${r(91 + Math.sin(a) * 7 - 1.5)}" width="3" height="3" fill="${PAPER}"/>` }
    }
    s += `<rect x="146" y="80" width="28" height="22" fill="#6b655a"/>`
    s += t({ x: 34, y: 134, size: 11, text: 'C90', fill: INK, weight: 800, tracking: 2 }) + t({ x: w - 34, y: 134, size: 11, text: 'Chrome', fill: INK, weight: 700, anchor: 'end', tracking: 2 })
    s += `<path d="M70 ${h - 6}L86 150H${w - 86}L${w - 70} ${h - 6}Z" fill="#2a2721"/>`
    for (const x of [112, 144, 176, 208]) s += `<circle cx="${x}" cy="172" r="5" fill="${INK}"/>`
    for (const [x, y] of [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]]) s += `<circle cx="${x}" cy="${y}" r="3.2" fill="#6b655a"/>`
    return s
  }),
}

/* ── Backstage passes ────────────────────────────────────────────────── */
const PASS = { w: 220, h: 320 }
const passes = {
  cell: { w: PASS.w, h: PASS.h, gap: 26 },
  zoom: 0.95,
  layouts: layoutsFor(PASS.w, PASS.h, 61, { rough: 0.08 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = PASS
    let s = `<rect width="${w}" height="${h}" fill="${INK}"/>`
    s += `<path d="${roundRectD(8, 28, w - 16, h - 36, 14)}" fill="${PAPER}"/>`
    s += `<path d="M8 42A14 14 0 0 1 22 28H${w - 22}A14 14 0 0 1 ${w - 8} 42V100H8Z" fill="${B.ink}"/>`
    s += `<path d="${roundRectD(w / 2 - 22, 36, 44, 9, 4.5)}" fill="${INK}"/>`
    s += `<rect x="${w / 2 - 9}" y="0" width="18" height="44" rx="3" fill="#9a968c"/><rect x="${w / 2 - 4}" y="4" width="8" height="30" rx="2" fill="#6b655a"/>`
    s += t({ x: w / 2, y: 86, size: 30, text: 'All access', fill: INK, anchor: 'middle', weight: 800, len: w - 40 })
    s += `<rect x="46" y="112" width="${w - 92}" height="118" fill="${PAPER}"/>`
    s += `<g clip-path="${clipDef(ctx, B, 'win', `M46 112h${w - 92}v118h${-(w - 92)}Z`)}">${artAt(ctx, B, B.face, w / 2 - 180 * 0.34, 108, 0.34)}</g>`
    s += `<rect x="46" y="112" width="${w - 92}" height="118" fill="none" stroke="${INK}" stroke-width="2"/>`
    s += t({ x: w / 2, y: 262, size: 32, text: 'Artist', fill: INK, anchor: 'middle', weight: 800, tracking: 3 })
    s += `<rect x="8" y="274" width="${w - 16}" height="26" fill="${B.ink}"/>`
    let bars = ''
    for (let i = 0; i < 38; i++) if (hash(i, 3, 61) > 0.35) bars += `M${24 + i * 4.4} 279v16`
    s += `<path d="${bars}" stroke="${INK}" stroke-width="${2}"/>`
    s += t({ x: w - 24, y: 292, size: 10, text: 'No. 0168', fill: INK, anchor: 'end', weight: 700, tracking: 1.5 })
    return s
  }),
}

/* ── Setlists, taped to the stage ────────────────────────────────────── */
const SET = { w: 250, h: 350 }
const SONGS = ['Into the Wild', 'Conman', 'Norma Jeane', 'Ivory', 'Andalusia', 'New York', 'The Horizon', 'Rocks in the Sea', 'Stockholm', 'Ghost']
const setlists = {
  cell: { w: SET.w, h: SET.h, gap: 38 },
  page: '#f7f4ec',
  brick: 0.3,
  zoom: 0.92,
  layouts: layoutsFor(SET.w, SET.h, 67, { rough: 0.09 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = SET
    let s = `<rect width="${w}" height="${h}" fill="#f7f4ec"/>`
    s += t({ x: 22, y: 50, size: 30, text: 'Set', fill: INK, weight: 800, tracking: 2 }) + `<path d="M22 60Q70 56 118 61" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`
    SONGS.slice(0, 9).forEach((song, i) => {
      const y = 96 + i * 27
      const tilt = (hash(i, 5, 67) - 0.5) * 3
      if (i === 3) s += `<path d="M18 ${y - 9}H${w - 30}" stroke="${B.ink}" stroke-width="18" stroke-linecap="round" opacity="0.85"/>`
      s += t({ x: 22, y, size: 19, text: song, fill: INK, weight: 800, tracking: 0.5, transform: `rotate(${r(tilt, 2)} 22 ${y})` })
      if (i === 6) s += `<path d="M18 ${y - 7}L${w - 60} ${y - 5}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
    })
    s += t({ x: 22, y: 346 - 14, size: 17, text: '→ Ghost (if time)', fill: INK, weight: 700, upper: false })
    // Gaffer tape at the top corners.
    s += `<rect x="-14" y="6" width="70" height="22" fill="#9a968c" opacity="0.92" transform="rotate(-24 20 17)"/><rect x="${w - 56}" y="6" width="70" height="22" fill="#9a968c" opacity="0.92" transform="rotate(24 ${w - 20} 17)"/>`
    return s
  }),
}

/* ── Sheet music ─────────────────────────────────────────────────────── */
const PAGE = { w: 280, h: 370 }
const score = {
  cell: { w: PAGE.w, h: PAGE.h, gap: 12 },
  page: PAPER,
  zoom: 0.92,
  layouts: layoutsFor(PAGE.w, PAGE.h, 71, { rough: 0.06 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = PAGE
    let s = `<rect width="${w}" height="${h}" fill="${PAPER}"/><rect width="${w}" height="60" fill="${B.ink}"/><rect y="${h - 26}" width="${w}" height="26" fill="${B.ink}"/>`
    s += t({ x: w / 2, y: 36, size: 24, text: 'Study in D', fill: PAPER, anchor: 'middle', weight: 800, tracking: 3 })
    s += t({ x: w - 16, y: 52, size: 9, text: 'after everybody', fill: PAPER, anchor: 'end', weight: 500, tracking: 1.5, upper: false, italic: true })
    let staff = ''
    let heads = ''
    let stems = ''
    for (let row = 0; row < 7; row++) {
      const y0 = 78 + row * 40
      for (let k = 0; k < 5; k++) staff += `M16 ${y0 + k * 5}H${w - 16}`
      staff += `M16 ${y0}V${y0 + 20}M${w - 16} ${y0}V${y0 + 20}M${r(w / 2 + 6)} ${y0}V${y0 + 20}`
      for (let n = 0; n < 8; n++) {
        const x = 40 + n * 28 + (n >= 4 ? 10 : 0)
        const step = Math.floor(hash(row, n, 71) * 9) - 2
        const y = y0 + 20 - step * 2.5
        heads += `M${r(x - 4)} ${r(y)}a4.2 3 -20 1 0 8.4 0a4.2 3 -20 1 0 -8.4 0Z`
        stems += `M${r(x + 3.8)} ${r(y)}V${r(y - 17)}`
        if (n % 2 === 0) stems += `M${r(x + 3.8)} ${r(y - 17)}L${r(x + 31.8)} ${r(y0 + 20 - (Math.floor(hash(row, n + 1, 71) * 9) - 2) * 2.5 - 17)}`
      }
    }
    s += `<path d="${staff}" stroke="${B.ink}" stroke-width="0.8"/><path d="${stems}" stroke="${INK}" stroke-width="1.3"/><path d="${heads}" fill="${INK}"/>`
    s += t({ x: 20, y: h - 9, size: 9, text: 'Page 2 of 2025', fill: PAPER, weight: 600, tracking: 1.5 })
    return s
  }),
}

/* ── Music magazines ─────────────────────────────────────────────────── */
const MAG = { w: 270, h: 360 }
const magazines = {
  cell: { w: MAG.w, h: MAG.h, gap: 12 },
  zoom: 0.9,
  layouts: layoutsFor(MAG.w, MAG.h, 73, { rough: 0.06 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = MAG
    // The cover photo on paper, the masthead band over its top.
    let s = `<rect width="${w}" height="${h}" fill="${PAPER}"/>`
    s += artAt(ctx, B, B.face, w / 2 - 180 * 0.72 + 14, h - 460 * 0.72 + 22, 0.72)
    s += `<rect width="${w}" height="104" fill="${B.ink}"/>`
    s += t({ x: w / 2, y: 94, size: 100, text: 'Sound', fill: PAPER, anchor: 'middle', weight: 800, len: w - 24 })
    s += t({ x: 14, y: 20, size: 10, text: 'Issue 68 · the copycat issue', fill: INK, weight: 700, tracking: 1.5 })
    s += `<rect x="10" y="196" width="104" height="58" fill="${B.ink}"/>`
    s += t({ x: 16, y: 220, size: 19, text: 'Who stole', fill: INK, weight: 800 }) + t({ x: 16, y: 244, size: 19, text: 'the riff?', fill: INK, weight: 800 })
    s += `<rect x="0" y="${h - 36}" width="${w}" height="36" fill="${INK}"/>${t({ x: 14, y: h - 13, size: 13, text: 'The new sound is the old sound', fill: B.ink, weight: 700, tracking: 0.8, len: w - 28 })}`
    return s
  }),
}

/* ── Royalty cheques ─────────────────────────────────────────────────── */
const CHEQUE = { w: 420, h: 180 }
const cheques = {
  cell: { w: CHEQUE.w, h: CHEQUE.h, gap: 14 },
  brick: 0.5,
  zoom: 0.95,
  layouts: layoutsFor(CHEQUE.w, CHEQUE.h, 79, { rough: 0.06 }),
  ground: INK,
  base: (ctx, B) => def(ctx, B, 'base', () => {
    const { w, h } = CHEQUE
    const E = B.ink
    let s = `<rect width="${w}" height="${h}" fill="${PAPER}"/><rect width="${w}" height="${h}" fill="${E}" opacity="0.28"/>`
    let wave = ''
    for (let k = 0; k < 9; k++) wave += `M0 ${22 + k * 18}q26 -9 52 0t52 0t52 0t52 0t52 0t52 0t52 0t52 0t52 0`
    s += `<path d="${wave}" fill="none" stroke="${E}" stroke-width="0.9" opacity="0.55"/>`
    s += `<rect width="${w}" height="30" fill="${E}"/>${t({ x: 14, y: 20, size: 12, text: 'Havre de Grace Savings & Loan', fill: PAPER, weight: 800, tracking: 1.5 })}${t({ x: w - 14, y: 20, size: 11, text: 'No. 001968', fill: PAPER, weight: 700, anchor: 'end', tracking: 1.5 })}`
    s += t({ x: 14, y: 62, size: 9, text: 'Pay to the order of', fill: INK, weight: 700, tracking: 1.5 })
    s += t({ x: 20, y: 86, size: 19, text: 'whoever comes next', fill: INK, weight: 500, upper: false, italic: true })
    s += `<path d="M14 92H300" stroke="${INK}" stroke-width="1.2"/>`
    s += `<rect x="312" y="62" width="94" height="32" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>${t({ x: 359, y: 85, size: 18, text: '$ 1,968', fill: INK, anchor: 'middle', weight: 800 })}`
    s += t({ x: 14, y: 124, size: 9, text: 'Memo', fill: INK, weight: 700, tracking: 1.5 }) + t({ x: 52, y: 124, size: 14, text: 'royalties', fill: INK, weight: 500, upper: false, italic: true }) + `<path d="M50 128H190" stroke="${INK}" stroke-width="1"/>`
    s += `<path d="M236 128H406" stroke="${INK}" stroke-width="1"/><path d="M246 122c10 -22 18 -2 26 -10s6 -14 14 -4 10 8 18 -2 12 6 22 0 14 -8 22 2" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`
    s += t({ x: 14, y: h - 18, size: 12, text: '⑆0168⑆ 2025 1968⑈ 07', fill: INK, weight: 500, tracking: 3 })
    return s
  }),
}

export const FORMATS = { posters, stamps, flyers, tickets, notes, amps, tour, sleeves, cassettes, passes, setlists, score, magazines, cheques }
if (!WALL_OBJECTS.length || WALL_SITTERS.some((id) => !SCENES[id])) throw new Error('conman-board: scenes missing')

/* ══ THE BOARD ═════════════════════════════════════════════════════════
 *
 * Sixteen sections, each a plate. The letter is the order the camera first
 * visits them in (A–N before the break; O and P are seen only from far off),
 * a walk from neighbour to neighbour so every move is one section:
 *
 *    ┌──────────┬──────────┬──────────┬──────────┐
 *    │ A poster │ B stamps │ O setlst │ P soldout│
 *    ├──────────┼──────────┼──────────┼──────────┤
 *    │ D notes  │ C lesson │ N mags   │ M drummer│
 *    ├──────────┼──────────┼──────────┼──────────┤
 *    │ E cheque │ H score  │ I tapes  │ L ticket │
 *    ├──────────┼──────────┼──────────┼──────────┤
 *    │ F amps   │ G tour   │ J sleeve │ K passes │
 *    └──────────┴──────────┴──────────┴──────────┘
 */
export const SW = COVER_SHEET.plate.w
export const SH = COVER_SHEET.plate.h
export const BOARD_W = SW * 4
export const BOARD_H = SH * 4
const SEAM = 7
/*
 * `span` is how many plates a section is, across and down (2026-09-28, the
 * panning tests on /music-videos/conman): a section of span [√5, √5] holds
 * five times the sheets at the same size, so the camera sees as many at a
 * time and has room to pan inside it. The board the film runs is 1 × 1.
 */
const LAYOUT = [
  { id: 'A', at: [0, 0], format: 'posters', ink: BOARD_INKS.posters, face: 'page', words: { head: 'Tonight', foot: 'One night only' }, label: 'Concert posters' },
  { id: 'B', at: [1, 0], format: 'stamps', ink: BOARD_INKS.stamps, face: 'plant', label: 'Stamps' },
  { id: 'O', at: [2, 0], format: 'setlists', ink: BOARD_INKS.setlists, black: true, label: 'Setlists' },
  { id: 'P', at: [3, 0], format: 'posters', ink: BOARD_INKS.soldOut, face: 'hendrix', words: { head: 'Sold out', foot: 'Second show added' }, label: 'Concert posters, sold out' },
  { id: 'D', at: [0, 1], format: 'notes', ink: BOARD_INKS.notes, face: 'mayer', label: 'Banknotes' },
  { id: 'C', at: [1, 1], format: 'flyers', ink: BOARD_INKS.lessons, fg: PAPER, black: true, face: 'jack', words: { head: 'Guitar', sub: 'Lessons', line1: 'Learn any song', line2: 'Play like your heroes', tab: 'Lessons 555 0168' }, label: 'Guitar lessons' },
  { id: 'N', at: [2, 1], format: 'magazines', ink: BOARD_INKS.magazines, face: 'bouffant', label: 'Music magazines' },
  { id: 'M', at: [3, 1], format: 'flyers', ink: BOARD_INKS.drummer, fg: INK, face: 'shag', words: { head: 'Drummer', sub: 'Wanted', line1: 'Must own sticks', line2: 'Influences a must', tab: 'Band 555 0142' }, label: 'Drummer wanted' },
  { id: 'E', at: [0, 2], format: 'cheques', ink: BOARD_INKS.cheques, label: 'Royalty cheques' },
  { id: 'H', at: [1, 2], format: 'score', ink: BOARD_INKS.score, label: 'Sheet music' },
  { id: 'I', at: [2, 2], format: 'cassettes', ink: BOARD_INKS.cassettes, label: 'Cassettes' },
  { id: 'L', at: [3, 2], format: 'tickets', ink: BOARD_INKS.tickets, black: true, face: 'meg', label: 'Concert tickets' },
  { id: 'F', at: [0, 3], format: 'amps', ink: BOARD_INKS.amps, label: 'Amps' },
  { id: 'G', at: [1, 3], format: 'tour', ink: BOARD_INKS.tour, label: 'Tour schedule' },
  { id: 'J', at: [2, 3], format: 'sleeves', ink: BOARD_INKS.sleeves, face: 'dylan', label: 'Record sleeves' },
  { id: 'K', at: [3, 3], format: 'passes', ink: BOARD_INKS.passes, face: 'quiff', label: 'Backstage passes' },
]
export function layBoard(span = [1, 1]) {
  const [ax, ay] = span
  const sections = LAYOUT.map((E) => {
    const F = FORMATS[E.format]
    const { w, h, gap } = F.cell
    // The format's own units: a sheet reads at the zoom it was tuned at when its section fills the plate.
    const k = F.zoom
    const S = { ...E, span, x0: E.at[0] * SW * ax, y0: E.at[1] * SH * ay, w: SW * ax, h: SH * ay, k, pitchX: w + gap, pitchY: h + gap }
    Object.assign(S, { cx: S.x0 + S.w / 2, cy: S.y0 + S.h / 2, lw: S.w / k, lh: S.h / k })
    S.cols = Math.ceil((S.lw + gap) / S.pitchX) + 1
    S.rows = Math.ceil((S.lh + gap) / S.pitchY) + 1
    S.cx0 = (S.lw - (S.cols * S.pitchX - gap)) / 2
    S.cy0 = (S.lh - (S.rows * S.pitchY - gap)) / 2
    return S
  })
  const W = SW * ax * 4
  const H = SH * ay * 4
  return {
    span,
    sections,
    SECTION: Object.fromEntries(sections.map((S) => [S.id, S])),
    W,
    H,
    /** The whole board in the frame, a little off each side if it is wider than the frame. */
    wideCam: { x: W / 2, y: H / 2, z: Math.min(900 / H, 1600 / W) },
  }
}
const DEFAULT = layBoard()
export const BOARD = DEFAULT.sections
export const ORDER = 'ABCDEFGHIJKLMNOP'.split('')
export const SECTION = DEFAULT.SECTION

/** Every cell of a section, in its own units; brick rows reach one further left. */
export function cellsOf(S) {
  if (S.cells) return S.cells
  const F = FORMATS[S.format]
  const out = []
  for (let row = 0; row < S.rows; row++) {
    for (let col = F.brick ? -1 : 0; col < S.cols; col++) {
      const off = F.brick && row % 2 ? F.brick * S.pitchX : 0
      const x = S.cx0 + col * S.pitchX + off
      const y = S.cy0 + row * S.pitchY
      if (x + F.cell.w < 0 || x > S.lw || y + F.cell.h < 0 || y > S.lh) continue
      const n = F.layouts.length
      const layout = Math.floor(hash(col + 999, row + 999, S.at[0] * 7 + S.at[1] * 13 + 11) * n)
      out.push({ S, col, row, key: `${S.id}:${col},${row}`, x, y, layout, redLayout: (layout + 1) % n, cx: S.x0 + (x + F.cell.w / 2) * S.k, cy: S.y0 + (y + F.cell.h / 2) * S.k })
    }
  }
  S.cells = out
  return out
}

/* ══ DRAWING ═══════════════════════════════════════════════════════════
 *
 * `board` is 'old' (the artists) or 'mine'. `state.cell(c)` answers for one
 * cell, null meaning untouched:
 *
 *   old    { out: [{ i, tau }] } — pieces gone from its layout, tau the
 *          seconds since each began; what shows under them is black.
 *   mine   { built: k } — k of its scraps pasted and no print yet (Infinity
 *          for all of them), or { out } once printed, torn as above.
 *
 * `state.bare(S)` says a section's own backing (the board's cork, the notes'
 * sheet) has come down too, so only black is left behind it.
 */
/* Which collage a cell of mine is: a fixed arrangement four sheets by two rows, so a section of mine tiles as one pattern. */
const VARIANT_TILE = [[0, 1, 2, 3], [2, 3, 0, 1]]
const variantOf = (c) => VARIANT_TILE[((c.row % 2) + 2) % 2][((c.col % 4) + 4) % 4]

/*
 * A scrap being pasted on, `tau` after it set off: dropped in from off to one
 * side, larger (nearer the eye) and turning, landing flat with a little give.
 */
export const SCRAP_FLIGHT = 0.42
function scrapInFlight(ctx, S, cell, v, k, tau) {
  const F = FORMATS[S.format]
  const { w, h } = F.cell
  const H = (q) => hash(cell.col * 7 + k, cell.row * 5 + q, S.at[0] * 3 + S.at[1] + 29)
  const u = clamp01(tau / SCRAP_FLIGHT)
  const e = 1 - (1 - u) ** 3
  const a = H(1) * Math.PI * 2
  const d = (420 + 260 * H(2)) * (1 - e)
  const rot = (H(3) - 0.5) * 120 * (1 - e)
  // The give on landing: pressed a hair flat and back.
  const give = 1 - 0.04 * Math.sin(Math.PI * clamp01((tau - SCRAP_FLIGHT) / 0.12))
  const s = lerp(1.5, 1, e) * give
  const cx = w / 2
  const cy = h / 2
  const tf = `translate(${r(Math.cos(a) * d, 1)} ${r(Math.sin(a) * d, 1)}) translate(${r(cx, 1)} ${r(cy, 1)}) rotate(${r(rot, 1)}) scale(${r(s, 4)}) translate(${r(-cx, 1)} ${r(-cy, 1)})`
  const lift = (1 - e) * 26
  const scrap = sheetScrap(ctx, S.format, v, k)
  const shadow = lift > 0.5 ? `<g transform="translate(${r(lift * 0.5, 1)} ${r(lift, 1)})" opacity="0.35"><use href="#${scrapPath(ctx, `${S.format}-${v}`, sheetCut(S.format, v, ctx.lod)[k], k)}" fill="${INK}"/></g>` : ''
  return `<g transform="${tf}"${u < 0.15 ? ` opacity="${r(u / 0.15, 3)}"` : ''}>${shadow}${scrap}</g>`
}

function cellSvg(ctx, S, cell, st, mine) {
  const F = FORMATS[S.format]
  const { w, h } = F.cell
  const place = `translate(${r(cell.x, 1)} ${r(cell.y, 1)})`
  let print
  let over = F.over && !mine ? F.over(ctx, S) : ''
  if (mine) {
    const v = variantOf(cell)
    if (st && st.built != null) {
      if (st.built === Infinity) return { body: `<g transform="${place}"><use href="#${collageDef(ctx, S.format, v, false)}"/></g>`, flaps: '' }
      let s = ''
      for (let k = 1; k <= Math.min(st.built, SCRAPS); k++) s += sheetScrap(ctx, S.format, v, k)
      return { body: s ? `<g transform="${place}">${s}</g>` : '', flaps: '' }
    }
    // Being pasted up: `lay[k - 1]` the seconds since scrap k set off, `print` since the red was pulled over it.
    if (st && st.lay) {
      let down = ''
      let air = ''
      st.lay.forEach((tau, j) => {
        if (tau == null || tau < 0) return
        if (tau >= SCRAP_FLIGHT + 0.12) down += sheetScrap(ctx, S.format, v, j + 1)
        else air += scrapInFlight(ctx, S, cell, v, j + 1, tau)
      })
      let pull = ''
      if (st.print != null && st.print >= 0) {
        // The red pulled down the sheet like a squeegee, the full-sheet scrap going under it as it goes.
        const k = easeInOut(clamp01(st.print / PULL))
        const B = mineOf(S, v, ctx.scraps)
        const cid = `${ctx.uid}-pull-${S.format}-${Math.round(k * 40)}`
        if (!ctx.defs.has(cid)) ctx.defs.set(cid, `<clipPath id="${cid}"><rect width="${w}" height="${r(h * Math.round(k * 40) / 40, 1)}"/></clipPath>`)
        pull = `<g clip-path="url(#${cid})">${sheetScrap(ctx, S.format, v, 0)}<use href="#${mineBase(ctx, B)}"/></g>`
      }
      return { body: down || pull ? `<g transform="${place}">${down}${pull}</g>` : '', flaps: air ? `<g transform="${place}">${air}</g>` : '' }
    }
    const B = mineOf(S, v, ctx.scraps)
    print = `<use href="#${mineBase(ctx, B)}"/>`
    if (F.over) over = mapped(ctx, B, F.over(ctx, B), (x) => (S.black ? x.replaceAll(INK, RED) : x))
  }
  else print = `<use href="#${F.base(ctx, S)}"/>`
  const out = st?.out ?? []
  const whole = out.some((o) => F.layouts[cell.layout][o.i]?.whole)
  const layout = F.layouts[cell.layout]
  const fallTo = ctx.view ? (ctx.view.y1 - (S.y0 + cell.y * S.k)) / S.k + 200 : undefined
  const torn = tornSheet(ctx, { w, h, layoutKey: `${mine ? 'm' : 'c'}${S.format}${cell.layout}`, layout, out, print, under: '', fallTo, core: ctx.lod ? null : undefined })
  let flaps = torn.flaps
  if (!ctx.lod) for (const o of out) flaps += flecks(layout[o.i], o.tau)
  return { body: `<g transform="${place}">${torn.body}${whole ? '' : over}</g>`, flaps: flaps ? `<g transform="${place}">${flaps}</g>` : '' }
}
/** How long the red takes to pull down a sheet of mine. */
export const PULL = 0.24

/* The backing a section's sheets are pasted to, where it is not the black itself: one big sheet, torn off in the break. */
const groundLayouts = new Map()
export function groundLayout(S) {
  const gk = `${S.id}:${S.span}`
  if (!groundLayouts.has(gk)) groundLayouts.set(gk, layoutsFor(S.lw, S.lh, 211 + S.at[0] * 31 + S.at[1] * 7, { rough: 0.05 })[0])
  return groundLayouts.get(gk)
}

/*
 * The untouched sheets of a section, as one pattern: a tile one sheet wide
 * (four on my board, one of each collage) and two rows high, so brick rows
 * come round. Only a sheet something is happening to is drawn on its own.
 */
function printOf(ctx, S, v, mine) {
  const F = FORMATS[S.format]
  if (!mine) return { print: `<use href="#${F.base(ctx, S)}"/>`, over: F.over ? F.over(ctx, S) : '' }
  const B = mineOf(S, v, ctx.scraps)
  return { print: `<use href="#${mineBase(ctx, B)}"/>`, over: F.over ? mapped(ctx, B, F.over(ctx, B), (x) => (S.black ? x.replaceAll(INK, RED) : x)) : '' }
}
function sectionPattern(ctx, S, mine) {
  const id = `${ctx.uid}-pat-${S.id}${mine ? 'm' : ''}${far(ctx)}`
  if (!ctx.defs.has(id)) {
    const F = FORMATS[S.format]
    const cols = mine ? 4 : 1
    const W = cols * S.pitchX
    const H = 2 * S.pitchY
    let tile = ''
    for (let row = 0; row < 2; row++) {
      for (let col = -1; col <= cols; col++) {
        const x = col * S.pitchX + (F.brick && row % 2 ? F.brick * S.pitchX : 0)
        if (x >= W || x + F.cell.w <= 0) continue
        const { print, over } = printOf(ctx, S, variantOf({ col, row }), mine)
        tile += `<g transform="translate(${r(x, 1)} ${row * S.pitchY})">${print}${over}</g>`
      }
    }
    ctx.defs.set(id, `<pattern id="${id}" patternUnits="userSpaceOnUse" x="${r(S.cx0, 2)}" y="${r(S.cy0, 2)}" width="${r(W, 2)}" height="${r(H, 2)}">${tile}</pattern>`)
  }
  return `url(#${id})`
}
/* A torn piece's outline, once per frame, for covering its hole from far off. */
function holePath(ctx, S, layout, i) {
  const id = `${ctx.uid}-hp-${S.format}-${layout}-${i}`
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<path id="${id}" d="${polyPath(FORMATS[S.format].layouts[layout][i].region)}"/>`)
  return id
}

/** One section, in world units, clipped to itself less a hairline seam. `view` culls to what shows. */
function sectionSvg(ctx, S, state, view, mine) {
  if (S.x0 > view.x1 || S.x0 + S.w < view.x0 || S.y0 > view.y1 || S.y0 + S.h < view.y0) return { body: '', flaps: '' }
  const F = FORMATS[S.format]
  const { w, h } = F.cell
  const clipId = `${ctx.uid}-sec-${S.id}`
  ctx.defs.set(clipId, `<clipPath id="${clipId}"><rect x="${SEAM / S.k}" y="${SEAM / S.k}" width="${S.lw - 2 * SEAM / S.k}" height="${S.lh - 2 * SEAM / S.k}"/></clipPath>`)
  const lx0 = (view.x0 - S.x0) / S.k
  const ly0 = (view.y0 - S.y0) / S.k
  const lx1 = (view.x1 - S.x0) / S.k
  const ly1 = (view.y1 - S.y0) / S.k
  // What the sheets are pasted to: the old sections' own backings, or black. My board is pasted straight onto the black.
  let body = ''
  let flaps = ''
  let under = INK
  let groundOut = []
  if (!mine && !state.bare?.(S)) {
    let paint = `<rect width="${r(S.lw)}" height="${r(S.lh)}" fill="${F.ground}"/>`
    if (F.groundOver) paint += `<rect width="${r(S.lw)}" height="${r(S.lh)}" fill="${F.groundOver(ctx, S)}"${F.groundOpacity ? ` opacity="${F.groundOpacity}"` : ''}/>`
    // A paper backing comes down in the break like any sheet; the black one is the board.
    groundOut = F.ground !== INK ? state.ground?.(S) ?? [] : []
    if (!groundOut.length) {
      body += paint
      under = F.ground
    }
    else {
      const torn = tornSheet(ctx, { w: S.lw, h: S.lh, layoutKey: `g${S.id}`, layout: groundLayout(S), out: groundOut, print: paint, under: '', fallTo: (view.y1 - S.y0) / S.k + 200, core: ctx.lod ? null : undefined })
      body += torn.body
      flaps += torn.flaps
    }
  }
  const cells = []
  let untouched = 0
  for (const c of cellsOf(S)) {
    if (c.x > lx1 || c.x + w < lx0 || c.y > ly1 || c.y + h < ly0) continue
    const st = state.cell(c)
    if (!st) untouched++
    cells.push([c, st])
  }
  // The pattern goes down when anything in view is untouched and the backing has not started coming down.
  const pattern = untouched > 0 && !groundOut.length
  if (pattern) body += `<rect width="${r(S.lw)}" height="${r(S.lh)}" fill="${sectionPattern(ctx, S, mine)}"/>`
  // What covers a sheet's place in the pattern: the backing as it was under it.
  const cover = (c) => {
    if (!pattern) return ''
    // Bled a little past the sheet: the pattern's copy antialiases at its edge, and a cover cut exactly to it leaves the sheet's outline showing.
    // From far off, further: a stamp's perforations sit half outside it.
    const bleed = ctx.lod ? 5 : 2
    const box = `x="${r(c.x - bleed, 1)}" y="${r(c.y - bleed, 1)}" width="${w + 2 * bleed}" height="${h + 2 * bleed}"`
    let s = `<rect ${box} fill="${under}"/>`
    if (under !== INK && F.groundOver) s += `<rect ${box} fill="${F.groundOver(ctx, S)}"${F.groundOpacity ? ` opacity="${F.groundOpacity}"` : ''}/>`
    return s
  }
  for (const [c, st] of cells) {
    if (!st && pattern) continue
    // From far off a torn sheet stays in the pattern and its holes are covered in what is under them; what flies is flat.
    if (ctx.lod && pattern && st?.out) {
      const layout = F.layouts[c.layout]
      const began = st.out.filter((o) => o.tau >= 0)
      const place = `translate(${r(c.x, 1)} ${r(c.y, 1)})`
      if (began.some((o) => layout[o.i].whole)) body += cover(c)
      else body += began.map((o) => `<use href="#${holePath(ctx, S, c.layout, o.i)}" transform="${place}" fill="${under}" stroke="${under}" stroke-width="3"/>`).join('')
      const torn = tornSheet(ctx, { w, h, layoutKey: `${mine ? 'm' : 'c'}${S.format}${c.layout}`, layout, out: st.out, print: '', under: '', fallTo: (view.y1 - (S.y0 + c.y * S.k)) / S.k + 200, core: null, flat: mine ? RED : S.ink === INK ? PAPER : S.ink })
      if (torn.flaps) flaps += `<g transform="${place}">${torn.flaps}</g>`
      continue
    }
    const g = cellSvg(ctx, S, c, st, mine)
    body += cover(c) + g.body
    flaps += g.flaps
  }
  const at = `translate(${r(S.x0)} ${r(S.y0)}) scale(${r(S.k, 4)})`
  return { body: `<g transform="${at}"><g clip-path="url(#${clipId})">${body}</g></g>`, flaps: flaps ? `<g transform="${at}">${flaps}</g>` : '' }
}

/**
 * A board seen through a port: `cam` { x, y, z } in world units, the port a
 * rectangle of the frame, `board` 'old' or 'mine', `state` as above. `scraps`
 * is how loud my collages are: 'full', 'pale' (knocked back towards the
 * paper) or 'mix' (the faces full, the rest of the sheet knocked back). Returns the svg, defs and all,
 * clipped to the port; under everything is black.
 */
export function boardSvg({ uid = 'cb', cam, port, board = 'old', state = { cell: () => null }, scraps = 'mix', sink = null, sections = BOARD, blur = null }) {
  const defs = new Map()
  const ctx = { uid, defs, lod: cam.z < 0.5, scraps }
  // A rolled camera sees round the port's corners: cull to the circle through them.
  const rot = cam.rot ?? 0
  const reach = rot ? Math.hypot(port.w, port.h) / 2 : 0
  const hw = (rot ? reach : port.w / 2) / cam.z + 40
  const hh = (rot ? reach : port.h / 2) / cam.z + 40
  const view = { x0: cam.x - hw, y0: cam.y - hh, x1: cam.x + hw, y1: cam.y + hh }
  ctx.view = view
  const mine = board === 'mine'
  let inks = kDefs(uid, 'r', RED)
  for (const S of sections) {
    inks += inkDefs(uid, S.id, S.ink)
    if (mine) for (let v = 0; v < VARIANTS; v++) inks += inkDefs(uid, `m${v}${scraps[0]}-${S.id}`, RED)
  }
  let body = ''
  let flaps = ''
  for (const S of sections) {
    const s = sectionSvg(ctx, S, state, view, mine)
    body += s.body
    flaps += s.flaps
  }
  const clip = `${uid}-port`
  const sx = port.x + port.w / 2
  const sy = port.y + port.h / 2
  const tf = `translate(${r(sx, 2)} ${r(sy, 2)})${rot ? ` rotate(${r(rot, 3)})` : ''} scale(${r(cam.z, 5)}) translate(${r(-cam.x, 2)} ${r(-cam.y, 2)})`
  // `blur`: [x, y] in frame units, a motion blur along the way the camera is going.
  const blurred = blur && Math.max(blur[0], blur[1]) > 0.4
  let portClip = `<clipPath id="${clip}"><rect x="${port.x}" y="${port.y}" width="${port.w}" height="${port.h}"/></clipPath>`
  if (blurred) portClip += `<filter id="${uid}-mb" filterUnits="userSpaceOnUse" x="${port.x}" y="${port.y}" width="${port.w}" height="${port.h}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${r(blur[0], 1)} ${r(blur[1], 1)}" edgeMode="duplicate"/></filter>`
  const moving = `<g transform="${tf}">${body}${flaps}</g>`
  const seen = `<g clip-path="url(#${clip})"><rect x="${port.x}" y="${port.y}" width="${port.w}" height="${port.h}" fill="${INK}"/>${blurred ? `<g filter="url(#${uid}-mb)">${moving}</g>` : moving}</g>`
  // `sink`: a Map the caller keeps mounted; every def goes there by id, and only the port's clip, which moves, stays in the frame.
  if (sink) {
    sink.set(`${uid}-inks-${mine ? 'm' : 'c'}`, portraitDefs(uid) + inks)
    for (const [id, d] of defs) sink.set(id, d)
    return `<defs>${portClip}</defs>${seen}`
  }
  return `<defs>${portClip}${portraitDefs(uid)}${inks}${[...defs.values()].join('')}</defs>${seen}`
}

/** The camera holding on a section, full plate. */
export const sectionCam = (id, dx = 0, dy = 0) => ({ x: SECTION[id].cx + dx, y: SECTION[id].cy + dy, z: COVER_SHEET.plate.w / SW })
/** The whole board filling the frame top to bottom, a little off each side: the break's view. */
export const WIDE_CAM = { x: BOARD_W / 2, y: BOARD_H / 2, z: 900 / BOARD_H }
export const FULL_FRAME = { x: 0, y: 0, w: 1600, h: 900 }

void SEAM
