/*
 * Ivory · Five Blanks — the film (v1, 2026-11-02).
 *
 * He's in the crowd, she's on stage, and he falls for her in an instant. He
 * goes to talk to her after the show and misses his chance. The film is a
 * five-letter guessing game played for her name: three boards on one sheet,
 * one for each time he tries.
 *
 * The guesses are the five-letter words he sings, typed in on their measured
 * onsets and turned over to show how close they come to IVORY: black for the
 * right letter in the right place, butterfly blue for the right letter in the
 * wrong place, bare pencil for a letter not in her name. The song already
 * plays the game — SHORE gets two letters, ASKED (both times he asks her
 * name) gets nothing, and AVOID ("to avoid the heartache") comes closest of
 * any real word. Between guesses the row he is on spins through letters,
 * while he sings, looking for words for her.
 *
 *   Game 1, first sight (verse 1): WOMAN SHORE OCEAN WINGS STAGE, then IVORY
 *     on the last row: solved, in his head, in an instant. On "she remains my
 *     mystery" the letters lift off and only the colours stay; "Oh, Ivory"
 *     brings the name back for a breath.
 *   Game 2, getting close (verse 2): MOVES STARE RIGHT WHERE ASKED IVORY. The
 *     letters lift on "I'll keep this one just for me"; "Oh, Ivory" again.
 *   Interlude: the camera pulls back over both boards, colours only — the
 *     pattern of the night nobody else sees — and the third board, empty.
 *   Game 3, the last chance (bridge on): COULD LOVES ASKED, and on "I forgot
 *     how to breathe" the row stops spinning and nothing is typed; that row
 *     is lost. WALKS (she walks away), and AVOID on the last row: close, not
 *     it. Game over. Only then, on "Oh, Ivory", does the answer come up under
 *     the board — too late; on the last "Ivory" its letters lift off and five
 *     blanks are left: her real name, which he never learned.
 *
 * Red is only the cursor, the thing that travels (album rule). The board is
 * drawn in the album's inks, not the newspaper game's: no green, no yellow,
 * no keyboard, no messages, and the game is never named.
 *
 * World units: a tile is 96, boards are 1150 apart (a neighbour stays out of
 * a near view); the camera is one
 * transform (a board is an object, so its pen thins when the camera pulls
 * back, as it should).
 */
import { r, clamp01, ramp, easeOut, easeInOut } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, SECOND_INK, paper, marginLyric, markDrawnAt, MARK_DRAW, glide, easeCamera, presence } from '../album.mjs'
import { drawLines } from '../hairline-draw.mjs'
import { TITLES } from '../titles.mjs'
import { endCard } from '../ending.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2

const NAME = 'IVORY'
const BLUE = SECOND_INK.ivory
/** A letter that isn't in her name: the paper rubbed grey with pencil. */
const MISS = '#cdc3ab'

/* ── The boards ───────────────────────────────────────────────────── */

const TILE = 96
const GAP = 12
const STEP = TILE + GAP
const BOARD_W = 5 * TILE + 4 * GAP
const BOARD_H = 6 * TILE + 5 * GAP
const BOARD_X = [-1150, 0, 1150]
const tileX = (b, col) => BOARD_X[b] - BOARD_W / 2 + col * STEP
const rowY = (row) => -BOARD_H / 2 + row * STEP
/** The answer, under the last board, when the last game is lost. */
const ANSWER_Y = BOARD_H / 2 + 60

/** Right place G, right letter wrong place y, not in the name '.'. Repeated letters counted honestly. */
export function marksFor(guess, answer = NAME) {
  const out = Array(5).fill('.')
  const left = {}
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) out[i] = 'G'
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1
  }
  for (let i = 0; i < 5; i++) {
    if (out[i] === 'G' || !left[guess[i]]) continue
    out[i] = 'y'
    left[guess[i]]--
  }
  return out.join('')
}

/* ── The plan, from the score ─────────────────────────────────────── */

/** Letters typed this far apart; the row turns over this long after the word, a tile at a time. */
const TYPE = 0.07
const FLIP_AT = 0.5
const FLIP_STAGGER = 0.17
const FLIP = 0.34
const TURNED = FLIP_AT + 4 * FLIP_STAGGER + FLIP

/*
 * Each guess is [word, line index]: the word as sung in that line of the
 * score. A null word is a row that is lost (nothing typed). `lift` is the
 * word the letters lift off on; `breath` the "Ivory" that brings the name
 * back for a breath; `hold` the word the spinning stops dead on.
 */
const GAMES = [
  {
    name: 'First sight',
    from: 8.9,
    rows: [['WOMAN', 0], ['SHORE', 1], ['OCEAN', 2], ['WINGS', 2], ['STAGE', 3], ['IVORY', 4]],
    lift: ['MYSTERY', 6],
    breath: 7,
  },
  {
    name: 'Getting close',
    from: 60.6,
    rows: [['MOVES', 9], ['STARE', 9], ['RIGHT', 10], ['WHERE', 10], ['ASKED', 11], ['IVORY', 12]],
    lift: ['ME', 14],
    breath: 15,
  },
  {
    name: 'The last chance',
    from: 127.6,
    rows: [['COULD', 16], ['LOVES', 16], ['ASKED', 17], [null, 18], ['WALKS', 20], ['AVOID', 22]],
    hold: ['BREATHE', 17],
    answer: 23,
    last: 24,
  },
]

const clean = (s) => s.replace(/[^a-z]/gi, '').toUpperCase()
function wordAt(score, li, text) {
  const line = score.lines[li]
  const hit = line?.words.filter((w) => clean(w.text) === text).at(-1)
  if (!hit) throw new Error(`blanks: no "${text}" in line ${li} (${line?.text})`)
  return hit.t
}

const plans = new WeakMap()
function planFor(score) {
  let plan = plans.get(score)
  if (plan) return plan
  const games = GAMES.map((g, b) => {
    const rows = g.rows.map(([word, li]) => {
      const t0 = wordAt(score, li, word ?? NAME)
      // A lost row turns over empty while the name is held, a breath after it.
      const flipFrom = word ? t0 + FLIP_AT : t0 + 1.4
      return { word, marks: word ? marksFor(word) : '.....', t0, flipFrom, end: flipFrom + 4 * FLIP_STAGGER + FLIP, typed: Boolean(word) }
    })
    const won = rows.at(-1).word === NAME
    return {
      b,
      name: g.name,
      from: g.from,
      rows,
      won,
      liftAt: g.lift ? wordAt(score, g.lift[1], g.lift[0]) : g.last != null ? wordAt(score, g.last, NAME) : Infinity,
      breathAt: g.breath != null ? wordAt(score, g.breath, NAME) : null,
      holdAt: g.hold ? wordAt(score, g.hold[1], g.hold[0]) : null,
      answerAt: g.answer != null ? wordAt(score, g.answer, NAME) : null,
      lastAt: g.last != null ? wordAt(score, g.last, NAME) : null,
      done: rows.at(-1).end,
    }
  })
  plan = { games }
  plans.set(score, plan)
  return plan
}

/** True while he is singing a line (a beat either side). */
const voiceOn = (score, time) => score.lines.some((l) => time >= l.start - 0.15 && time <= l.end + 0.35)

/* ── The camera ───────────────────────────────────────────────────── */

const NEAR = 1.06
const FAR = 0.5
const CAMERA = [
  { t: 0, v: { x: BOARD_X[0], y: 0, s: NEAR } },
  { t: 57.8, v: { x: BOARD_X[0], y: 0, s: NEAR } },
  { t: 60.6, v: { x: BOARD_X[1], y: 0, s: NEAR } },
  { t: 112.9, v: { x: BOARD_X[1], y: 0, s: NEAR } },
  // The interlude: back over both boards, colours only, and the third, empty.
  { t: 116.6, v: { x: -140, y: 0, s: FAR } },
  { t: 124.2, v: { x: 140, y: 0, s: FAR } },
  { t: 127.6, v: { x: BOARD_X[2], y: 0, s: NEAR } },
  { t: 163.6, v: { x: BOARD_X[2], y: 0, s: NEAR } },
  // Room for the answer under the board.
  { t: 166.4, v: { x: BOARD_X[2], y: 78, s: 0.9 } },
  { t: 174.4, v: { x: BOARD_X[2], y: 78, s: 0.9 } },
  // In on the five blanks to the end.
  { t: 182.5, v: { x: BOARD_X[2], y: ANSWER_Y + TILE / 2 - 40, s: 1.45 } },
]
/** Keys, plus a slow drift that never stops. */
function camAt(time) {
  const c = glide(time, CAMERA)
  return { x: c.x + 14 * Math.sin(0.23 * time), y: c.y + 9 * Math.sin(0.19 * time + 1.3), s: c.s }
}

/* ── Drawing a tile ───────────────────────────────────────────────── */

const FONT = 58
const letterSvg = (x, y, ch, fill, o = 1, dy = 0) =>
  o <= 0.004 ? '' : `<text x="${r(x + TILE / 2)}" y="${r(y + TILE / 2 + FONT * 0.35 + dy)}" font-size="${FONT}" font-weight="600" text-anchor="middle" fill="${fill}"${o < 0.999 ? ` opacity="${r(o, 3)}"` : ''}>${ch}</text>`

const FILL = { G: INK, y: BLUE, '.': MISS }
const ON = { G: PAPER, y: PAPER, '.': INK }

/** An empty tile, a typed one, or a turned one, with its letter at `lo`, lifted by `ldy`. */
function face(x, y, kind, ch, lo, ldy) {
  if (kind === 'empty') return `<rect x="${r(x + 1.25)}" y="${r(y + 1.25)}" width="${TILE - 2.5}" height="${TILE - 2.5}" fill="none" stroke="${INK}" stroke-opacity="0.3" stroke-width="2.5"/>`
  if (kind === 'typed') return `<rect x="${r(x + 1.5)}" y="${r(y + 1.5)}" width="${TILE - 3}" height="${TILE - 3}" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.85" stroke-width="3"/>${ch ? letterSvg(x, y, ch, INK, lo, ldy) : ''}`
  return `<rect x="${r(x)}" y="${r(y)}" width="${TILE}" height="${TILE}" fill="${FILL[kind]}"/>${ch ? letterSvg(x, y, ch, ON[kind], kind === '.' ? 0.72 * lo : lo, ldy) : ''}`
}

/** A tile turning over: `u` 0–1, the old face to halfway, the new one after. */
function flipped(x, y, u, before, after, dy = 0) {
  const cx = x + TILE / 2
  const cy = y + TILE / 2 + dy
  const sy = Math.max(0.02, Math.abs(Math.cos(Math.PI * u)))
  const inner = u < 0.5 ? before : after
  if (sy > 0.999 && dy === 0) return inner
  return `<g transform="translate(${r(cx)} ${r(cy)}) scale(1 ${r(sy, 3)}) translate(${r(-cx)} ${r(-y - TILE / 2)})">${inner}</g>`
}

const hash = (a) => {
  let x = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b)
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35)
  x ^= x >>> 16
  return x >>> 0
}
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const SPIN = 11

/** A tile spinning through letters, like a split-flap: the new letter rolls down in, the old one out. */
function spinning(x, y, time, seed, clip) {
  const p = time * SPIN + seed * 0.23
  const n = Math.floor(p)
  const e = easeOut(clamp01((p - n) / 0.55))
  const now = ABC[hash(n * 31 + seed * 977) % 26]
  const was = ABC[hash((n - 1) * 31 + seed * 977) % 26]
  return `${face(x, y, 'empty')}<g clip-path="url(#${clip})">${letterSvg(x, y, was, INK, 0.4 * (1 - e), e * TILE * 0.7)}${letterSvg(x, y, now, INK, 0.4, (e - 1) * TILE * 0.7)}</g>`
}

/* ── A board at `time` ────────────────────────────────────────────── */

function boardSvg(game, time, score, uid) {
  const { b, rows } = game
  let out = ''
  let defs = ''
  const singing = voiceOn(score, time)
  rows.forEach((row, i) => {
    const y = rowY(i)
    const spinFrom = i ? rows[i - 1].end : game.from
    for (let k = 0; k < 5; k++) {
      const x = tileX(b, k)
      const tk = row.t0 + k * TYPE
      const ch = row.word ? row.word[k] : ''
      // Spinning: the row he's on, while he sings, until its letter lands (or his breath goes).
      const spinUntil = row.typed ? tk : Math.min(row.t0, game.holdAt ?? row.t0)
      if (time >= spinFrom && time < spinUntil && singing && time >= game.from) {
        const clip = `${uid}-s${b}-${i}-${k}`
        defs += `<clipPath id="${clip}"><rect x="${r(x)}" y="${r(y)}" width="${TILE}" height="${TILE}"/></clipPath>`
        out += spinning(x, y, time, b * 41 + i * 7 + k, clip)
        continue
      }
      const typed = row.typed && time >= tk
      const u = clamp01((time - (row.flipFrom + k * FLIP_STAGGER)) / FLIP)
      if (!typed && u <= 0) {
        out += face(x, y, 'empty')
        continue
      }
      // The letters lift off on the line that gives up; the winning row comes back for a breath.
      const la = game.liftAt + (i * 5 + k) * 0.03
      let lo = 1 - easeInOut(ramp(time, la, la + 0.8))
      let ldy = -26 * easeOut(ramp(time, la, la + 0.8))
      if (game.won && i === rows.length - 1 && game.breathAt != null && time > game.liftAt) {
        const breath = presence(time, game.breathAt - 0.1 + k * 0.06, game.breathAt + 1.7, 0.3, 0.9)
        if (breath > lo) { lo = breath; ldy = -8 * (1 - breath) }
      }
      // The typed letter lands with a small push.
      const pop = typed && u <= 0 ? 1 + 0.1 * Math.sin(Math.PI * clamp01((time - tk) / 0.14)) : 1
      // A win: the row hops, a tile at a time.
      const hop = game.won && i === rows.length - 1 ? -16 * Math.sin(Math.PI * clamp01((time - (row.end + 0.05 + k * 0.09)) / 0.34)) : 0
      const before = face(x, y, row.typed ? 'typed' : 'empty', ch, 1, 0)
      const after = face(x, y, row.marks[k], ch, lo, ldy)
      let tile = u > 0 ? flipped(x, y, u, before, after, hop) : before
      if (pop !== 1) tile = `<g transform="translate(${r(x + TILE / 2)} ${r(y + TILE / 2)}) scale(${r(pop, 3)}) translate(${r(-x - TILE / 2)} ${r(-y - TILE / 2)})">${tile}</g>`
      out += tile
    }
  })
  return (defs ? `<defs>${defs}</defs>` : '') + out
}

/** The answer under the last board: comes up only when the game is lost, and leaves five blanks. */
function answerSvg(game, time) {
  if (game.answerAt == null || time < game.answerAt) return ''
  let out = ''
  for (let k = 0; k < 5; k++) {
    const x = tileX(game.b, k)
    const a = easeOut(ramp(time, game.answerAt + k * 0.12, game.answerAt + k * 0.12 + 0.4))
    const dy = (1 - a) * 28
    const la = game.lastAt + k * 0.1
    const lo = 1 - easeInOut(ramp(time, la, la + 0.8))
    const ldy = -26 * easeOut(ramp(time, la, la + 0.8))
    const u = clamp01((time - (game.lastAt + 1.0 + k * FLIP_STAGGER)) / (FLIP * 1.6))
    const blank = `<rect x="${r(x + 1.5)}" y="${r(ANSWER_Y + 1.5)}" width="${TILE - 3}" height="${TILE - 3}" fill="none" stroke="${INK}" stroke-opacity="0.85" stroke-width="3"/>`
    const tile = flipped(x, ANSWER_Y, u, face(x, ANSWER_Y, 'G', NAME[k], lo, ldy), blank)
    out += `<g transform="translate(0 ${r(dy)})"${a < 0.999 ? ` opacity="${r(a, 3)}"` : ''}>${tile}</g>`
  }
  return out
}

/** The red cursor: under the tile the next letter goes in; it blinks while he's quiet. */
function cursorSvg(game, time, score) {
  const { rows } = game
  const vis = Math.min(easeOut(ramp(time, game.from, game.from + 0.5)), 1 - easeInOut(ramp(time, game.done, game.done + 0.5)))
  if (vis <= 0.004) return ''
  let i = rows.findIndex((row) => row.end > time)
  if (i < 0) i = rows.length - 1
  const row = rows[i]
  let col = 0
  let y = rowY(i)
  if (time >= row.t0 && row.typed) col = Math.min(4, (time - row.t0) / TYPE)
  else if (i > 0 && time < rows[i - 1].end + 0.35) {
    // Down to the start of the next row, eased.
    const e = easeCamera(ramp(time, rows[i - 1].end, rows[i - 1].end + 0.35))
    col = 4 * (1 - e)
    y = rowY(i - 1) + STEP * e
  }
  const x = tileX(game.b, 0) + col * STEP
  // Held still from "breathe" to the end of the lost row: no blink.
  const held = game.holdAt != null && time >= game.holdAt && !row.typed
  const quiet = !held && time < row.t0 && !voiceOn(score, time)
  const blink = quiet ? 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(2 * Math.PI * time / 1.1)) : 1
  const o = vis * blink
  return `<rect x="${r(x + 14)}" y="${r(y + TILE - 17)}" width="${TILE - 28}" height="7" fill="${RED}"${o < 0.999 ? ` opacity="${r(o, 3)}"` : ''}/>`
}

/* ── The opening ──────────────────────────────────────────────────── */

/*
 * The live videos' opening (as Into the Wild's maze and Conman's city), on a
 * shorter clock: Ivory's first word is at 9.4 s. The mark drawn on from 0.3 s,
 * faded over 3.9–4.5; the title drawn over 4.6–6.9 and gone by 7.7, so it is
 * never over the board; the black lifts off the first board by 8.9.
 */
export const BLANKS_OPENING = { mark: 0.3, markOut: [3.9, 4.5], title: [4.6, 6.9], titleOut: [7.1, 7.7], reveal: [7.5, 8.9] }

function openingSvg(time, uid) {
  const O = BLANKS_OPENING
  const black = 1 - ramp(time, ...O.reveal)
  if (black <= 0.001) return ''
  const markOn = 1 - ramp(time, ...O.markOut)
  const mark = time >= O.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${PAPER}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(time - O.mark, MARK_DRAW.done), `${uid}-mark`)}</g>`
    : ''
  const titleOn = 1 - ramp(time, ...O.titleOut)
  const title = time >= O.title[0] && titleOn > 0.001
    ? `<g opacity="${r(easeInOut(titleOn), 3)}">${drawLines(TITLES.ivory, easeInOut(ramp(time, ...O.title)), PAPER, `${uid}-title`)}</g>`
    : ''
  return `<g opacity="${r(easeInOut(black), 4)}"><rect width="1600" height="900" fill="${INK}"/>${mark}${title}</g>`
}

/* ── The frame ────────────────────────────────────────────────────── */

/** The plate alone — what goes inside the sheet. */
export function blanksPlate({ time, score, uid }) {
  const { games } = planFor(score)
  const cam = camAt(time)
  let inner = ''
  for (const game of games) {
    const left = CX + (tileX(game.b, 0) - cam.x) * cam.s
    const right = CX + (tileX(game.b, 4) + TILE - cam.x) * cam.s
    if (right < PX - 20 || left > PX + PW + 20) continue
    inner += boardSvg(game, time, score, uid) + answerSvg(game, time) + cursorSvg(game, time, score)
  }
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
<g transform="translate(${r(CX - cam.x * cam.s)} ${r(CY - cam.y * cam.s)}) scale(${r(cam.s, 4)})">${inner}</g>`
}

/** The film: the opening, then the album's cover sheet, the boards, the lyric in the margin. */
export function blanksFrame({ time, score, lockup = '', uid = 'blanks' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const { games } = planFor(score)
  const section = score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
  const game = [...games].reverse().find((g) => time >= g.from - 3) ?? games[0]
  const clip = `${uid}-plate`
  return {
    label: time < BLANKS_OPENING.reveal[1] ? 'Opening' : `${section.label} · ${game.name}`,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${blanksPlate({ time, score, uid })}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${openingSvg(time, uid)}`,
  }
}

/** For the page: each game, its guesses and when they land. */
export function blanksGames(score) {
  return planFor(score).games.map((g) => ({ name: g.name, from: g.from, won: g.won, rows: g.rows.map((r) => ({ word: r.word, marks: r.marks, at: r.t0 })) }))
}
