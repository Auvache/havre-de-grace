/*
 * Ivory · The Crossword — the film (2026-11-13).
 *
 * A large blank crossword on the album's paper, filled in as the song goes:
 * the key words he sings, as he sings them, and in the instrumental gaps words
 * of longing and missed chances, every letter drawn on stroke by stroke the
 * way the opening draws the title. The camera pans to one part of the puzzle,
 * holds still while a few words go in (never more than three at once), then
 * pans smoothly on to the next. Every "Ivory" writes an IVORY, in red, the
 * one red thing in the film; there are seven in the grid and no frame ever
 * holds two written ones. The puzzle crosses the sheet from left to right and
 * climbs, and at the end the camera pulls back to the whole of it, filled.
 *
 *   crossword/stations.mjs   the stations (where the camera goes, what is
 *                            written there) and how the grid is searched for
 *   crossword/layout.mjs     the grid, baked by
 *                            tools/video-styles/crossword/bake-layout.mjs
 *   crossword/letters.mjs    the alphabet, baked by
 *                            tools/video-styles/titles/bake-letters.mjs
 *   tools/video-styles/crossword/check.mjs   walks the film for the rules
 *
 * Tempo, 105 BPM: a sung word starts on its onset, a gap word on a beat, and
 * every word, hers too, is written at 3.5 letters a second. Moves are
 * cosine-eased and last two to four seconds; between them the camera is still.
 *
 * Notes: docs/visualizers/ivory.md.
 */
import { r, clamp01, ramp, lerp, easeInOut } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, paper, marginLyric, easeCamera } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'
import { LETTERS } from './crossword/letters.mjs'
import { LAYOUT } from './crossword/layout.mjs'
import { STATIONS, CELL, assemble, shotsOf, boxOf, viewOf, key } from './crossword/stations.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2
const PENCIL = '#7a7262'
const CELL_PAPER = '#f6f1e6'
const CAP = 30
const GLYPH = CAP / 72.75
/*
 * One rate for every word, hers included: 3.5 letters a second. The user
 * asked for one rate ("think 6 letters per second"), then for three tests at
 * that rate or slower, and chose the slowest (2026-11-13); then "Ivory should
 * function exactly like the other words but with red letters instead".
 */
export const LETTERS_PER_SECOND = 3.5
const CLOCK = { mark: 0.3, markOut: [3.9, 4.5], title: [4.6, 6.9], titleOut: [7.1, 7.7], reveal: [7.5, 8.9] }

const GRID = assemble(LAYOUT.map(([word, c, r, down, station, fill]) => ({ word, c, r, down, station, fill: fill ?? null })))
/* The chain (the words the stations name), which the camera's shots are framed on; the fill words come after it. */
const CORE = GRID.entries.filter((e) => e.fill == null)
const clean = (s) => s.replace(/[^a-z]/gi, '').toUpperCase()

/* ── The plan ─────────────────────────────────────────────────────── */

function buildPlan(score) {
  const lps = LETTERS_PER_SECOND
  const beat = 60 / score.bpm
  const nextBeat = (t) => score.beatPhase + Math.ceil((t - score.beatPhase) / beat - 1e-6) * beat

  // Every entry's write: when it starts, a letter how often.
  const used = new Set()
  const writes = CORE.map((e, i) => {
    const [, at, kind] = STATIONS[e.station].words.find(([w], j) => w === e.word && !used.has(`${e.station}:${j}`) && used.add(`${e.station}:${j}`))
    let t0
    let step
    if (kind === 'gap') t0 = nextBeat(at)
    else {
      const hit = score.lines[at]?.words.find((w) => clean(w.text) === e.word)
      if (!hit) throw new Error(`crossword: no "${e.word}" in line ${at}`)
      t0 = hit.t
    }
    // Every word at one rate, `lps` letters a second, hers too.
    step = 1 / lps
    return { i, entry: e, start: t0, step, end: t0 + e.word.length * step, hers: e.word === 'IVORY' }
  })

  /*
   * Never more than three at once: a fast line's words would pile up, so a
   * word waits (from its onset) until one of three has finished. Her name
   * never waits.
   */
  {
    const placed = []
    for (const w of [...writes].sort((a, b) => a.start - b.start)) {
      if (!w.hers) {
        for (;;) {
          const live = placed.filter((o) => o.start <= w.start + 1e-6 && o.end > w.start + 1e-6)
          if (live.length < 3) break
          const free = Math.min(...live.map((o) => o.end)) + 0.05
          w.end += free - w.start
          w.start = free
        }
      }
      placed.push(w)
    }
  }

  // The camera: a held view per shot, cosine moves between them.
  const shots = shotsOf(CORE).map((sh) => {
    const ws = sh.entries.map((i) => writes[i])
    return { ...sh, from: Math.min(...ws.map((w) => w.start)), to: Math.max(...ws.map((w) => w.end)) }
  })
  const keys = [] // [t, view]
  shots.forEach((sh, k) => {
    if (k === 0) { keys.push([0, sh.view]); return }
    const prev = shots[k - 1]
    const pan = sh.station !== prev.station ? STATIONS[sh.station].pan : null
    let a
    let b
    if (pan) {
      /*
       * The station's move, unless the words before it are still being
       * written: then it waits for them and keeps at least 1.8 s, arriving
       * late rather than quickly.
       */
      a = Math.max(pan[0], prev.to + 0.15)
      b = Math.max(pan[1], a + 1.8)
    }
    else {
      // Within a station: a gentle push from the last word's end to just before the next starts.
      b = sh.from - 0.15
      a = Math.min(Math.max(prev.to + 0.1, b - 2.4), b - 1.4)
    }
    keys.push([a, keys.at(-1)[1]], [b, sh.view])
    prev.leave = a
    sh.arrive = b
  })
  shots[0].arrive = CLOCK.reveal[1]

  /*
   * The fill words: each on a beat while its shot is held, at most two words
   * being written at any moment, none while her name is, and a beat apart from
   * the last one started.
   */
  const fills = GRID.entries.filter((e) => e.fill != null)
  // A shot whose held frame has every square of `e` well inside it.
  const holds = (sh, e) => e.cells.every(([c, rr]) => Math.abs((c + 0.5) * CELL - sh.view.x) * sh.view.s < PW / 2 - CELL * 0.6 * sh.view.s &&
    Math.abs((rr + 0.5) * CELL - sh.view.y) * sh.view.s < PH / 2 - CELL * 0.6 * sh.view.s)
  for (const e of fills) {
    const dur = e.word.length / lps
    // Its own shot first; when that has no room, the nearest other shot that holds it in frame.
    const candidates = shots.map((sh, k) => k).filter((k) => k === e.fill || (!shots[k].ivory && holds(shots[k], e)))
      .sort((a, b) => (a !== e.fill) - (b !== e.fill) || Math.abs(a - e.fill) - Math.abs(b - e.fill))
    let t0 = null
    for (const k of candidates) {
    const sh = shots[k]
    const from = sh.arrive + 0.2
    const to = (sh.leave ?? sh.to + 0.8) - 0.2 - dur
    // Busy: at some moment of [t, t + dur] `limit` words are already being written, or her name is near.
    const busy = (t, limit) => {
      if (writes.some((w) => w.hers && w.start < t + dur + 0.5 && w.end > t - 0.5)) return true
      for (let u = t; u < t + dur; u += 0.05) if (writes.filter((w) => w.start <= u && w.end > u).length >= limit) return true
      return false
    }
    // Two at once if it can, three if it must (the user's limit), a beat after the last fill word if it can.
    for (const [limit, spaced] of [[1, true], [2, true], [2, false], [3, false]]) {
      for (let t = nextBeat(from); t <= to && t0 == null; t += beat) {
        if (busy(t, limit)) continue
        if (spaced && writes.some((w) => w.fill && Math.abs(w.start - t) < beat * 0.99)) continue
        t0 = t
      }
      if (t0 != null) break
    }
    if (t0 != null) break
    }
    if (t0 == null) throw new Error(`crossword: no room to write ${e.word} (shot ${e.fill})`)
    writes.push({ i: writes.length, entry: e, start: t0, step: 1 / lps, end: t0 + dur, hers: false, fill: true })
  }

  // Letters: the first word to reach a square writes it, except that her squares wait for her, so her name goes in whole.
  const letters = new Map()
  const order = [...writes].sort((a, b) => a.start - b.start)
  for (const w of order) {
    w.entry.cells.forEach(([c, rr], j) => {
      const k = key(c, rr)
      if (GRID.ivories.has(k) && !w.hers) return
      if (letters.has(k)) return
      letters.set(k, { at: w.start + j * w.step, dur: w.step * 1.8, ch: w.entry.word[j], hers: w.hers })
    })
  }


  // The end: back to the whole puzzle, done.
  const all = viewOf(boxOf([...GRID.cells.keys()].map((k) => k.split(',').map(Number)), 1.5), 0.1, 1)
  const last = shots.at(-1).to
  keys.push([last + 0.8, keys.at(-1)[1]], [Math.min(last + 5.2, (score.endCardAt ?? score.duration) - 0.6), all])

  return { beat, writes, letters, keys, shots }
}

function cameraAt(plan, time) {
  const K = plan.keys
  if (time <= K[0][0]) return K[0][1]
  for (let i = 0; i < K.length - 1; i++) {
    const [ta, a] = K[i]
    const [tb, b] = K[i + 1]
    if (time > tb) continue
    if (a === b || tb <= ta) return b
    const u = easeCamera(ramp(time, ta, tb))
    const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), u))
    // Pan in step with the zoom, so the point under the middle moves evenly on the sheet.
    const w = Math.abs(a.s - b.s) < 1e-4 ? u : (1 / a.s - 1 / s) / (1 / a.s - 1 / b.s)
    return { x: lerp(a.x, b.x, w), y: lerp(a.y, b.y, w), s }
  }
  return K.at(-1)[1]
}

const plans = new WeakMap()
function planFor(score) {
  let p = plans.get(score)
  if (!p) {
    p = buildPlan(score)
    p.lyric = {
      ...score,
      sections: score.sections.map((sec) => {
        const lastLine = score.lines.findLast((l) => l.section === sec.id)
        return lastLine ? { ...sec, to: Math.min(sec.to, lastLine.end + (clean(lastLine.text).endsWith('IVORY') ? 3.4 : 1.4)) } : sec
      }),
    }
    plans.set(score, p)
  }
  return p
}

/* ── Drawing ──────────────────────────────────────────────────────── */

const sq = (c, rr) => `M${c * CELL} ${rr * CELL}h${CELL}v${CELL}h${-CELL}Z`

const libs = new Map()
function libFor(ns) {
  if (libs.has(ns)) return libs.get(ns)
  let squares = ''
  let nums = ''
  for (const k of GRID.cells.keys()) {
    const [c, rr] = k.split(',').map(Number)
    squares += sq(c, rr)
    const n = GRID.numbers.get(k)
    if (n) nums += `<text x="${c * CELL + 5}" y="${rr * CELL + 15}">${n}</text>`
  }
  const glyphs = Object.entries(LETTERS).map(([ch, L]) => `<path id="${ns}-g${ch}" d="${L.d}"/>`).join('')
  const lib = `<defs>${glyphs}<g id="${ns}-paper"><path d="${squares}" fill="${CELL_PAPER}"/></g>` +
    `<g id="${ns}-rules"><path d="${squares}" fill="none" stroke="${INK}" stroke-width="2"/><g font-size="12.5" font-weight="500" fill="${PENCIL}">${nums}</g></g></defs>`
  libs.set(ns, lib)
  return lib
}

function letterSvg(c, rr, ch, a, ns, fill) {
  const at = `translate(${r((c + 0.5) * CELL, 2)} ${r((rr + 0.5) * CELL + CAP / 2, 2)}) scale(${r(GLYPH, 5)})`
  if (a >= 1) return `<use href="#${ns}-g${ch}" transform="${at}" fill="${fill}"/>`
  const L = LETTERS[ch]
  const m = L.mask.length
  const strokes = L.mask.map((p, j) => {
    const b = clamp01(a * m - j)
    return b > 0 ? `<path d="${p}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${r(1 - easeInOut(b), 4)}"/>` : ''
  }).join('')
  const id = `${ns}-m${c}_${rr}`.replace(/-(?=\d)/g, 'n')
  return `<g transform="${at}" fill="${fill}"><mask id="${id}" maskUnits="userSpaceOnUse" x="-70" y="-100" width="140" height="120">` +
    `<g fill="none" stroke="#fff" stroke-width="${r(L.pen, 2)}" stroke-linecap="round" stroke-linejoin="round">${strokes}</g></mask>` +
    `<path d="${L.d}" mask="url(#${id})"/></g>`
}

/** The plate alone. */
export function crosswordPlate({ time, score, ns }) {
  const plan = planFor(score)
  const cam = cameraAt(plan, time)

  /*
   * Her name is written like any other word, in red (the user, 2026-11-13):
   * no wash, no rule, no cursor, for her or for anyone.
   */
  let ink = ''
  let red = ''
  for (const [k, L] of plan.letters) {
    if (time < L.at) continue
    const [c, rr] = k.split(',').map(Number)
    const s = letterSvg(c, rr, L.ch, clamp01((time - L.at) / L.dur), ns, L.hers ? RED : INK)
    if (L.hers) red += s
    else ink += s
  }

  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
<g transform="translate(${r(CX - cam.x * cam.s, 2)} ${r(CY - cam.y * cam.s, 2)}) scale(${r(cam.s, 5)})"><use href="#${ns}-paper"/><use href="#${ns}-rules"/>${ink}${red}</g>`
}

/** The film: the opening, the sheet, the puzzle, the lyric in the margin, the end card. */
export function crosswordFrame({ time, score, lockup = '', uid = 'xw' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const ns = `${uid}-xw`
  const plan = planFor(score)
  const writing = plan.writes.filter((w) => time >= w.start && time < w.end + 0.3).map((w) => w.entry.word)
  const label = inOpening(time, CLOCK) ? 'Opening' : writing.length ? writing.join(' + ') : 'Moving on'
  return {
    label,
    lib: [libFor(ns)],
    svg: `<defs><clipPath id="${ns}-plate"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${ns}-plate)">${crosswordPlate({ time, score, ns })}</g>
${marginLyric({ now: time, score: plan.lyric, uid: ns, sheet: COVER_SHEET })}
${filmOpening({ time, uid: ns, slug: 'ivory', clock: CLOCK })}`,
  }
}

/** For checking: the plan (every write, letter and camera key) and the camera at a time. */
export const crosswordPlan = (score) => planFor(score)
export const crosswordCamera = (score, time) => cameraAt(planFor(score), time)

/** The page's jump-to list. What each is: docs/visualizers/ivory.md. */
export const CROSSWORD_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 9, label: 'First words' },
  { at: 20, label: 'Longing' },
  { at: 40.2, label: 'Ivory', key: true },
  { at: 46, label: 'California' },
  { at: 54.8, label: 'Ivory again' },
  { at: 61.8, label: 'Stranger' },
  { at: 82, label: 'Beside her' },
  { at: 95.2, label: 'Ivory, third', key: true },
  { at: 101.5, label: 'Paradise' },
  { at: 109.5, label: 'Ivory, fourth' },
  { at: 116.4, label: 'Missed chances' },
  { at: 129.2, label: 'Adam to her Eve' },
  { at: 140.8, label: 'Ivory, fifth' },
  { at: 147.6, label: 'Alaska' },
  { at: 164.2, label: 'Ivory, sixth' },
  { at: 169.9, label: 'Goodbye' },
  { at: 173.2, label: 'The last Ivory', key: true },
  { at: 175.6, label: 'The whole puzzle', key: true },
]
