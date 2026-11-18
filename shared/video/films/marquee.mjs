/*
 * The Marquee — "Goodbye, Norma Jeane" as a picture-house letter board.
 *
 * One sign for the whole song, never cut away from. The film opens the way
 * Into the Wild's does: the band's mark drawn on black, then the title drawn
 * on in the live videos' Hairline capitals, then the black lifts off a dark,
 * empty marquee. A second later, on the downbeat, her ten tiles start to spin
 * and settle into NORMA JEANE on the word; then every film she made surfaces
 * in release order, one after another, each assembling out of spinning
 * letters and coming apart again; the chorus puts its own words up on the
 * words; and after The Misfits the board starts on Something's Got to Give,
 * which never finishes spelling. The letters keep spinning and die out one by
 * one, and on the record's last hit there is a hard cut to the mark on black.
 *
 * THE RULES (2026-11-09, two rounds, replacing the schedule of 2026-11-02/05)
 *   1. After the black lifts (12.0) the board is blank for a second; the first
 *      motion is on the next beat, the downbeat of bar 5 (13.33). After that
 *      the board is never dark or still: the drop bars are gone, the twinkle
 *      has a floor, and the bulbs stay on to the cut.
 *   2. The lyric on the board: NORMA JEANE at the start, whole on the first
 *      "Norma" (22.49); in each chorus GOODBYE / NORMA / JEANE, then SEVENTEEN,
 *      then MORE / MORE / MORE, each row turning over on its own word with no
 *      spin before it; in the last chorus YOU / WANTED / MORE as well. No film
 *      title in a chorus. Everything else on the board is one of her
 *      twenty-nine films, in release order, 15 before the first chorus, 12
 *      between the first two, 2 under the trumpet.
 *   3. Every board builds and breaks down over the same length and is whole
 *      and still for three beats between; a title takes four eighths each way
 *      (1.26 s) and the next starts as it goes — a continual stream with no
 *      gap but a breath of 1.6 s before "Goodbye" in choruses 1 and 2. The
 *      words' breakdowns are the one asymmetry: each comes apart slowly, to
 *      the next sung word (the hook to "seventeen", SEVENTEEN to the first
 *      "more", MORE over nine beats).
 *   4. Under the piano (bars 82–86) no title: the free board flashes near full
 *      on the piano's three strikes a bar. After YOU WANTED MORE no title: the
 *      board flashes hard, NORMA JEANE pops up on the middle row where the
 *      voice leaves (bar 98) and turns letter by letter, every two beats, into
 *      MARILYN / MONROE in her hidden place; three letters never arrive, and
 *      the last hit cuts to the mark. Something's Got to Give is gone with the
 *      other titles. (2026-11-17: the board dances almost whole from 4:05, and
 *      from 4:31 a full board of black letters shows MARILYN MONROE whole in
 *      red to the cut; see the finale below.)
 *   - Every change is on an eighth of the click. 95 BPM; the score's beat is
 *     at 0.066, the bar's strongest accent the beat after it, so bar 0 starts
 *     at 0.698. A measured word sits a few ms off the grid; the stream snaps
 *     back to the nearest eighth after each one.
 *   - Red, on a board that has landed: at most one MARILYN MONROE's worth of
 *     letters (two M, N, O, R; one A, I, L, Y, E), letters in her hidden place
 *     first, then reading order. Red, while the board is turning over: only a
 *     letter in her hidden place — MARILYN on the top row and MONROE under it,
 *     from column 4. Three builds let the name show through: 3 letters (Love
 *     Nest), then 6 (The Seven Year Itch), then 9 (The Misfits), for a beat
 *     each; the finale forms it in red and never finishes. Never all thirteen
 *     (confirmed 2026-11-02: her name is never spelled).
 *   - Lights follow the song's sections and flash on every landing.
 *
 * THE DANCE (2026-11-13, three rounds of a 30-second test, then the film:
 * "you got it exactly right"). Everything is timed to the click on the
 * eighth (half a beat): every flip's letter changes on an eighth, nothing
 * between. The free tiles dance in layers, like a band — a kick on beats 1
 * and 3, a snare on 2 and 4 (where the board's own letters, titles too, wink
 * in place), hats on the offbeats once the song is up, and a move each bar
 * (wave, burst, ripple through the title, stab, rest), never the same twice
 * running. How much moves follows the drive: the energy (the song's shape
 * by section, with the record's brightness averaged over seven beats) plus
 * the piano's level (score.piano), so the board steps up where the piano
 * comes in. Under the horns (score.horns: trumpet and piano loud together)
 * almost every tile turns on every eighth; a title holds, winking, with only
 * the gaps between its words kept blank. Never beside a title's letters
 * otherwise, never in her place while a clue shows, never red. It starts once
 * NORMA JEANE is whole: nothing is on the board before her name.
 *
 * THE SURFACING (decided 2026-11-05: "the title can slowly reveal itself by
 * letters slowly falling into place… it will more so bubble up to the
 * surface, than disappear as the letters flip away"). A title's tiles start
 * spinning through random letters in the first third of its build (the first
 * on the build's first eighth), then lock onto the right one a few at a time,
 * in scattered order, on the eighths, the last on the landing; whole for
 * three beats, winking; then its letters flip away in groups on the eighths,
 * most on the beats.
 *
 * The frame contract is the one every film here keeps:
 * marqueeFrame({ time, score, lockup, uid }) → { svg, label }, pure, no DOM.
 * The plan is built once per score and cached.
 *
 * Two other motions (slot-machine reels, letters hung by hand) were tried on
 * 2026-11-02 against these flaps; the flaps won.
 */
import { rng, r, ramp, easeInOut } from '../kit.mjs'
import { INK as SHEET_INK, PAPER as SHEET_PAPER, markDrawnAt, MARK_DRAW } from '../album.mjs'
import { drawLines } from '../hairline-draw.mjs'
import { TITLES } from '../titles.mjs'
import { END_BLACK, END_INK } from '../ending.mjs'

const PAPER = '#ece4d2'
const INK = '#1b1915'
const PINK = '#e59aae'
const RED = '#b5392a'
const GOLD = '#e8b04a'
const WHITE = '#fff6dc'
const FLAP = '#e3d9c3'

const NAME = 'MARILYNMONROE'
const NAME_SET = new Set(NAME)
const ALPHA = 'ABCDEFGHIJKLMNOPRSTUVWY'
const NOISE = 'BCDGHKPSTUVW' // letters not in her name, for her places when they must stay wrong
const FLIP = 0.2 // seconds a flap takes to turn over

/* Every film, in release order, and how it sits on three rows of thirteen. */
export const MARQUEE_FILMS = [
  ['1947', ['', 'DANGEROUS', 'YEARS']],
  ['1948', ['SCUDDA HOO!', 'SCUDDA HAY!', '']],
  ['1948', ['LADIES', 'OF THE', 'CHORUS']],
  ['1949', ['', 'LOVE HAPPY', '']],
  ['1950', ['A TICKET', 'TO', 'TOMAHAWK']],
  ['1950', ['THE', 'ASPHALT', 'JUNGLE']],
  ['1950', ['', 'THE FIREBALL', '']],
  ['1950', ['', 'ALL ABOUT EVE', '']],
  ['1950', ['', 'RIGHT CROSS', '']],
  ['1951', ['HOME TOWN', 'STORY', '']],
  ['1951', ['AS YOUNG', 'AS YOU', 'FEEL']],
  ['1951', ['', 'LOVE NEST', '']],
  ['1951', ["LET'S MAKE", 'IT LEGAL', '']],
  ['1952', ['CLASH', 'BY', 'NIGHT']],
  ['1952', ["WE'RE NOT", 'MARRIED!', '']],
  ['1952', ["DON'T", 'BOTHER TO', 'KNOCK']],
  ['1952', ['MONKEY', 'BUSINESS', '']],
  ['1952', ["O. HENRY'S", 'FULL HOUSE', '']],
  ['1953', ['', 'NIAGARA', '']],
  ['1953', ['GENTLEMEN', 'PREFER', 'BLONDES']],
  ['1953', ['HOW TO', 'MARRY A', 'MILLIONAIRE']],
  ['1954', ['RIVER', 'OF NO', 'RETURN']],
  ['1954', ["THERE'S NO", 'BUSINESS LIKE', 'SHOW BUSINESS']],
  ['1955', ['THE', 'SEVEN YEAR', 'ITCH']],
  ['1956', ['', 'BUS STOP', '']],
  ['1957', ['THE PRINCE', 'AND THE', 'SHOWGIRL']],
  ['1959', ['SOME', 'LIKE IT', 'HOT']],
  ['1960', ["LET'S MAKE", 'LOVE', '']],
  ['1961', ['', 'THE MISFITS', '']],
].map(([year, rows]) => ({ year, rows, title: rows.filter(Boolean).join(' ') }))

/* The three clues: which of her 13 letters the scramble lets show through. */
const CLUE_1 = [0, 5, 8]
const CLUE_2 = [0, 1, 3, 5, 7, 10]
const CLUE_3 = [0, 1, 2, 4, 5, 7, 8, 9, 12]

/* The first word of a line that matches, sung after `after` seconds. */
function wordAt(score, re, after) {
  for (const l of score.lines) for (const w of l.words) if (w.t > after && re.test(w.text)) return w.t
  throw new Error(`marquee: no word ${re} after ${after}`)
}

const hash = (x) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s) }
const esc = (s) => s.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/</g, '&lt;')
const f1 = (n) => Math.round(n * 10) / 10

/* The last event at or before t, by bisection. */
function lastIndex(ev, t) {
  let lo = 0
  let hi = ev.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (ev[mid][0] <= t) lo = mid
    else hi = mid - 1
  }
  return lo
}

/*
 * One flap's state at t from its events ([time the flip starts, letter, tag]).
 * A tag marks a letter one of the alternatives put up: it is never red.
 */
function flapAt(ev, t, flip = FLIP) {
  const k = lastIndex(ev, t)
  const [tc, cur, tag] = ev[k]
  const prev = k > 0 ? ev[k - 1][1] : ' '
  const p = (t - tc) / flip
  if (p >= 0 && p < 1) return { letter: p < 0.5 ? prev : cur, sy: Math.abs(1 - 2 * p), moving: true, tag: p < 0.5 ? ev[k - 1]?.[2] : tag }
  return { letter: cur, sy: 1, moving: false, tag }
}

const sectionKind = (score, t) => {
  const s = score.sections.find((x) => t >= x.from && t < x.to) ?? score.sections.at(-1)
  if (s.id === 'chorus-3') return 'chorus3'
  return s.kind
}

function lyricAt(score, t) {
  const lines = score.lines
  for (let j = 0; j < lines.length; j++) {
    const l = lines[j]
    const next = j + 1 < lines.length ? lines[j + 1].start : Infinity
    if (t >= l.start - 0.15 && t < Math.min(next - 0.15, l.end + 1.4)) return l.text ?? l.words.map((w) => w.text).join(' ')
  }
  return ''
}

/* ── The opening ─────────────────────────────────────────────────────────── */

/*
 * Into the Wild's opening (maze.mjs MAZE_OPENING), on the live videos' clock
 * (live-cards.mjs openingClock, approved 2026-10-27): the mark from 0.5 s,
 * faded over 5.0–5.7; the title drawn over 6.2–8.9; then the black lifts,
 * here off the marquee as its bulbs start to come on.
 */
export const MARQUEE_OPENING = { mark: 0.5, markOut: [5.0, 5.7], title: [6.2, 8.9], reveal: [10.6, 12.0] }

function openingSvg(time, uid) {
  const O = MARQUEE_OPENING
  const black = 1 - ramp(time, ...O.reveal)
  if (black <= 0.001) return ''
  const markOn = 1 - ramp(time, ...O.markOut)
  const mark = time >= O.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${SHEET_PAPER}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(time - O.mark, MARK_DRAW.done), `${uid}-mark`)}</g>`
    : ''
  const title = time >= O.title[0] ? drawLines(TITLES['goodbye-norma-jeane'], easeInOut(ramp(time, ...O.title)), SHEET_PAPER, `${uid}-title`) : ''
  return `<g opacity="${r(easeInOut(black), 4)}"><rect width="1600" height="900" fill="${SHEET_INK}"/>${mark}${title}</g>`
}

/* ── The board ───────────────────────────────────────────────────────────── */

const DEFAULTS = {
  twinkle: 1, // the dance on the free tiles (0: none)
}

export function marqueeFilm(options = {}) {
  const O = { ...DEFAULTS, ...options }
  // Every flip is placed so its letter changes on the grid (2026-11-13: the
  // old flips started or finished on an eighth, so every change was 100 ms
  // off the click): SW moves a flip that started on an eighth back by half a
  // flip, and one that finished on it forward by half.
  const FLIP = 0.14
  const SW = FLIP / 2
  const COLS = 13
  const ROWS = 3
  const N = COLS * ROWS
  const OFF = (ROWS - 3) / 2 // the first of the three rows a title sits on

  const layout = (rows) => {
    const grid = Array(N).fill(' ')
    rows.forEach((row, k) => {
      const start = Math.floor((COLS - row.length) / 2)
      for (let i = 0; i < row.length; i++) grid[(OFF + k) * COLS + start + i] = row[i]
    })
    return grid
  }

  /* Her hidden place: slot → letter. */
  const HID = new Map()
  const HC = Math.floor((COLS - 7) / 2)
  ;[...'MARILYN'].forEach((c, i) => HID.set(OFF * COLS + HC + i, c))
  ;[...'MONROE'].forEach((c, i) => HID.set((OFF + 1) * COLS + HC + i, c))
  const HKEYS = [...HID.keys()]

  function redOf(grid) {
    const budget = {}
    for (const c of NAME) budget[c] = (budget[c] ?? 0) + 1
    const out = Array(N).fill(false)
    grid.forEach((c, i) => { if (HID.get(i) === c && budget[c] > 0) { budget[c]--; out[i] = true } })
    grid.forEach((c, i) => { if (!out[i] && NAME_SET.has(c) && budget[c] > 0) { budget[c]--; out[i] = true } })
    return out
  }

  /* ── The plan: every flap of every tile, worked out once ─────────────── */

  const cache = new WeakMap()

  function planFor(score) {
    const hit = cache.get(score)
    if (hit) return hit
    const plan = build(score)
    cache.set(score, plan)
    return plan
  }

  function build(score) {
    const BEAT = 60 / (score.bpm || 95)
    const BAR = 4 * BEAT
    const D0 = (score.beatPhase ?? 0.066) + BEAT
    const EIGHTH = BEAT / 2
    const bar = (m) => D0 + m * BAR
    const LAST = score.endCardAt ?? score.duration - 6

    const EMPTY = layout(['', '', ''])
    const events = Array.from({ length: N }, () => [[-9, ' ']])
    const boards = [] // every board that lands: { at, S (when the next change starts), grid, red, title, kind }
    const clues = [] // [from, to] — for the label
    const flashes = [] // the bulbs flash on every landing
    const darks = [] // [from, to] — the bulbs out
    let cur = EMPTY
    let seed = 100
    const pickFor = (rand, i) => {
      const c = ALPHA[Math.floor(rand() * ALPHA.length)]
      return HID.get(i) === c ? NOISE[Math.floor(rand() * NOISE.length)] : c
    }

    /*
     * How hard the board flashes at t, 0–1: the record's brightness
     * (score.brightness, a digit a beat — the energy above 1.8 kHz, which
     * follows the voice and the brass; chosen 2026-11-09 over a level set by
     * section and a flash on the beat: "follows the record").
     */
    const bright = score.brightness ?? ''
    const measured = (t) => {
      const k = Math.floor((t - (score.beatPhase ?? 0)) / BEAT)
      const d = Number(bright[Math.max(0, Math.min(bright.length - 1, k))] ?? 3)
      return Math.max(0, Math.min(1, (d - 1.5) / 7))
    }
    // A floor, so some letters are always moving to the beat however quiet the
    // record (2026-11-09: "I don't want that to happen ever after the start").
    const level = (t) => Math.max(0.25, measured(t))
    /*
     * On the beat, the energy: the record's brightness averaged over seven
     * beats (one beat's digit jumps 7, 4, 2, 1 in a bar), under the song's
     * shape: low in the verses, climbing through each pre-chorus to the
     * chorus, full in the choruses. It builds instead of flickering.
     */
    const SHAPE = { intro: 0.3, verse: 0.3, break: 0.55, chorus: 0.9, outro: 0.85 }
    const energy = (t) => {
      let sum = 0
      for (let d = -3; d <= 3; d++) sum += measured(t + d * BEAT)
      const s = score.sections.find((x) => t >= x.from && t < x.to) ?? score.sections.at(-1)
      const p = Math.max(0, Math.min(1, (t - s.from) / (s.to - s.from)))
      const shape = s.kind === 'prechorus' ? 0.35 + 0.6 * p ** 1.3 : s.id === 'chorus-3' ? 1 : SHAPE[s.kind] ?? 0.5
      return Math.max(0.2, Math.min(1, 0.7 * shape + 0.3 * (sum / 7)))
    }
    /*
     * The piano and the horns (2026-11-13: "when piano comes in, increase the
     * number of the spaces that change; when there is piano and trumpet
     * together during the big trumpet part, include almost every single
     * space"). score.piano is the piano stem's level, a digit a beat; the
     * dance's drive is the energy plus that, so the board steps up where the
     * piano comes in and is busiest where it is loudest. score.horns are the
     * two stretches where trumpet and piano are loud together.
     */
    const keys = (t) => Number((score.piano ?? '')[Math.floor((t - (score.beatPhase ?? 0)) / BEAT)] ?? 0) / 9
    const horn = (t) => (score.horns ?? []).some(([a, b]) => t >= a && t < b)
    const drive = (t) => Math.min(1, energy(t) + 0.45 * keys(t))

    /*
     * Turn the board from what it shows to `next`. `land(i)` is when tile i's
     * flap finishes on its new letter. From `S` until then the tile may flip
     * through noise on the eighths (a scramble); a slam has no noise and only
     * turns the tiles that change. With `quiet`, the noise stops for every
     * tile then, and a tile that lands later waits blank.
     */
    function turn(next, { S, land, clue = null, clueAt = 2.5, noise = true, final = true, quiet = Infinity }) {
      const prev = cur
      const rand = rng(seed++)
      const pick = (s) => s[Math.floor(rand() * s.length)]
      const slots = []
      for (let k = 0; k < Math.round((Math.max(...Array.from({ length: N }, (_, i) => land(i))) - S) / EIGHTH); k++) slots.push(S + k * EIGHTH)
      const ct = S + clueAt * BEAT
      const ce = ct + 1.5 * BEAT
      if (clue) clues.push([ct, ce])
      for (let i = 0; i < N; i++) {
        const col = i % COLS
        const inHid = HID.has(i)
        const active = noise
          ? prev[i] !== ' ' || next[i] !== ' ' || (col >= 1 && col <= COLS - 2 && rand() < 0.3) || (clue && inHid)
          : prev[i] !== next[i]
        if (!active) continue
        const fin = land(i) - FLIP
        const k = inHid ? HKEYS.indexOf(i) : -1
        if (noise) {
          const stop = Math.min(fin, quiet - FLIP)
          for (const t of slots) {
            if (t >= stop - EIGHTH || rand() >= 0.5) continue
            if (clue && k >= 0 && t > ct - EIGHTH && t < ce) continue
            let c = rand() > 0.2 ? pick(ALPHA) : ' '
            if (k >= 0 && c === HID.get(i)) c = pick(NOISE)
            events[i].push([t - SW, c])
          }
          if (clue && k >= 0 && clue.includes(k)) {
            events[i].push([ct - SW, HID.get(i)])
            events[i].push([ce - SW, pick(NOISE)])
          }
          if (fin > quiet) events[i].push([quiet - FLIP + SW, ' '])
        }
        if (final || rand() < 0.6) events[i].push([fin + SW, next[i]])
      }
      cur = next
    }

    /*
     * A board coming apart: whole and still for `W`, then its letters flip
     * away, scattered, on the sixteenths, over `K`. Returns when it is gone.
     */
    function breakDown(b, W, K) {
      const from = nearEighth(b.at + W)
      const rand = rng(seed++)
      // The letters go in groups on the eighths, most on the beats.
      const steps = Math.max(1, Math.floor((K - FLIP / 2) / EIGHTH) + 1)
      b.off = new Map() // tile → when its letter goes
      b.grid.forEach((c, i) => {
        if (c === ' ') return
        let k = Math.floor(rand() * steps)
        const onBeat = Math.round((from + k * EIGHTH - D0) / EIGHTH) % 2 === 0
        if (!onBeat && rand() < 0.6) k = k + 1 < steps ? k + 1 : k - 1
        events[i].push([from + Math.max(0, k) * EIGHTH - SW, ' '])
        b.off.set(i, from + Math.max(0, k) * EIGHTH)
      })
      b.whole = from
      b.gone = from + K
      cur = EMPTY
      return b.gone
    }

    /* The eighth at or after t. */
    const onEighth = (t) => D0 + Math.ceil((t - D0) / EIGHTH - 1e-6) * EIGHTH

    /*
     * A title surfacing from S to L: whatever was up (the name, the hook,
     * MORE) flips away in the first beat; the title's tiles start spinning
     * through random letters in the first third; then they lock onto their
     * letters one by one, in scattered order, on the eighths, the last on L.
     * With a clue, her place spins too and her letters show through in red
     * for a beat and a half before any title letter locks.
     */
    function surface(grid, S, L, clue) {
      const rand = rng(seed++)
      const D = L - S
      const prev = cur
      let ready = S
      if (prev.some((c) => c !== ' ')) {
        ready = S + Math.min(BEAT, D / 4)
        prev.forEach((c, i) => { if (c !== ' ') events[i].push([S + rand() * Math.max(0.01, ready - S - FLIP), ' ']) })
      }
      const tiles = []
      grid.forEach((c, i) => { if (c !== ' ') tiles.push(i) })
      let lockFrom = S + D / 3
      let ct = null
      let ce = null
      if (clue) {
        // Her letters show through in red from the first eighth of the build,
        // for a beat (a beat and a half when the build is long enough), and
        // the title's letters lock after.
        ct = onEighth(S)
        ce = ct + (D >= 8 * EIGHTH ? 3 : 2) * EIGHTH
        clues.push([ct, ce])
        lockFrom = Math.max(lockFrom, ce)
      }
      // The order they lock in, and when.
      for (let k = tiles.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [tiles[k], tiles[j]] = [tiles[j], tiles[k]] }
      const lock = new Map()
      tiles.forEach((i, k) => lock.set(i, k === tiles.length - 1 ? L : Math.min(L, onEighth(lockFrom + ((k + 1) / tiles.length) * (L - lockFrom)))))
      const spinners = new Set(tiles)
      if (clue) for (const i of HKEYS) spinners.add(i)
      let first = true
      for (const i of spinners) {
        const start = onEighth(first ? ready : ready + rand() * Math.max(0, S + D / 3 - ready))
        first = false
        const end = lock.has(i) ? lock.get(i) - FLIP : ce + EIGHTH + Math.floor(rand() * 3) * EIGHTH
        const k = HKEYS.indexOf(i)
        for (let t = start; t <= end - 2 * EIGHTH + 1e-6; t += EIGHTH) {
          if (clue && k >= 0 && t > ct - EIGHTH && t <= ce + 1e-6) continue
          // The spin follows the record: soft, it turns over less and often
          // comes up blank; loud, it spins hard.
          const I = level(t)
          if (t > start && rand() >= 0.3 + 0.6 * I) continue
          events[i].push([t - SW, rand() < 0.6 * (1 - I) ? ' ' : pickFor(rand, i), 'x'])
        }
        if (clue && k >= 0 && clue.includes(k)) {
          events[i].push([ct - SW, HID.get(i), 'red'])
          if (end > ce + 0.01) events[i].push([ce - SW, NOISE[Math.floor(rand() * NOISE.length)], 'x'])
        }
        events[i].push(lock.has(i) ? [end + SW, grid[i]] : [end - SW, ' '])
      }
      cur = grid
      const locks = [...lock.values()].sort((a, b) => a - b)
      return locks[Math.floor(locks.length / 2)] ?? L
    }

    /* The landings. */
    const board = (grid, at, title, kind, extra = {}) => {
      const b = { at, grid, red: redOf(grid), title, kind, ...extra }
      boards.push(b)
      flashes.push(at)
      return b
    }
    /* The eighth nearest t (a measured word sits a few ms off the click). */
    const nearEighth = (t) => D0 + Math.round((t - D0) / EIGHTH) * EIGHTH
    /*
     * Every board is whole and still for three beats, and a title takes four
     * eighths to surface and four to come apart (2026-11-09: with words only in
     * the choruses, none under the piano and none after "you wanted more",
     * twenty-nine films have 134 s; a four-beat hold left a 0.95 s build).
     */
    const HOLD = 3 * BEAT
    const X = 4
    let next // when the board is free again

    // The name: her ten tiles start spinning on the downbeat after the fade
    // (bar 5, a second after the black lifts) and are whole on "Norma"; nothing
    // else is on the board before it, the twinkle starting once it is whole.
    // It comes apart over as long as it took to arrive.
    const NJ_S = bar(5)
    const NJ_L = wordAt(score, /^Norma/, 0)
    const NJ = layout(['', 'NORMA JEANE', ''])
    const njRing = surface(NJ, NJ_S, NJ_L)
    /*
     * The way in (2026-11-17: "start the board one beat earlier, and start it
     * with only one tile, then two. Catch up to the current animation by
     * 0:20"). One tile from the beat before bar 5, changing on every eighth;
     * a second two beats later; then the other eight join, faster and faster,
     * each turning over on most eighths. From 17.4 every tile does what the
     * surfacing above planned for it, so by 0:18 the board is the one it was.
     * The first to start is the last to settle.
     */
    const NJ_0 = NJ_S - BEAT
    {
      const rand = rng(5150) // its own seed, so nothing after it changes
      const tiles = []
      NJ.forEach((c, i) => { if (c !== ' ') tiles.push(i) })
      const lockOf = (i) => Math.max(...events[i].filter((e) => e[1] === NJ[i] && e[2] === undefined).map((e) => e[0] + SW))
      const byLock = [...tiles].sort((a, b) => lockOf(b) - lockOf(a))
      const [one, two, ...rest] = byLock
      rest.reverse() // the rest join in the order they settle
      const PAIR = NJ_0 + 3 * BEAT // the third joins here
      const CATCH = onEighth(NJ_0 + 7.5 * BEAT) // from here every tile does what was planned
      const join = new Map([[one, NJ_0], [two, NJ_0 + 2 * BEAT]])
      rest.forEach((i, k) => join.set(i, onEighth(PAIR + 2.5 * Math.sqrt(k / rest.length))))
      for (const i of tiles) {
        const J = join.get(i)
        const C = Math.min(CATCH, lockOf(i) - 2 * EIGHTH)
        const kept = events[i].filter((e) => e[0] < -1 || e[0] + SW >= C - 1e-3)
        let shown = ' '
        for (let c = J; c < C - 1e-3; c += EIGHTH) {
          // Alone or a pair, a new letter on every eighth; once others join, most eighths.
          if (c > J && c >= PAIR - 1e-3 && rand() >= 0.6) continue
          let l = pickFor(rand, i)
          while (l === shown) l = pickFor(rand, i)
          kept.push([c - SW, l, 'x'])
          shown = l
        }
        events[i].splice(0, events[i].length, ...kept.sort((a, b) => a[0] - b[0]))
      }
    }
    const nj = board(NJ, NJ_L, 'NORMA JEANE', 'name', { from: NJ_0, ringFrom: njRing, twinkleFrom: NJ_L })
    next = breakDown(nj, 4 * BEAT, NJ_L - NJ_S) // the name alone holds four beats, as in the schedule the user approved
    nj.until = next

    /*
     * A stretch of `n` film titles, one after another from `next`: each
     * surfaces over X eighths, is whole for HOLD, comes apart over X, and the
     * next starts as it goes. The stream runs to `until` (a chorus, the
     * piano), the board twinkling for whatever is left. `clues` maps a film's
     * index to the letters its build lets show in red.
     */
    let films = 0
    const stream = (n, until, clues = {}) => {
      for (let k = 0; k < n; k++) {
        const S = nearEighth(next)
        const L = S + X * EIGHTH
        const f = MARQUEE_FILMS[films]
        const grid = layout(f.rows)
        const clue = clues[films] ?? null
        const ringFrom = surface(grid, S, L, clue)
        const b = board(grid, L, `${f.title} (${f.year})`, 'film', { from: S, clue: !!clue, ringFrom })
        next = breakDown(b, HOLD, X * EIGHTH)
        b.until = next
        films++
      }
      boards.at(-1).until = until
      next = until
    }
    /*
     * The song's own words, a row on each sung word with no spin before it
     * ("show up in time with the lyrics"), whole on the last, still for HOLD,
     * then coming apart slowly — over whatever is left until `breakTo`, the
     * next word that lands.
     */
    const words = (rows, lands, breakTo, title) => {
      const grid = layout(rows)
      const land = (i) => lands[Math.floor(i / COLS) - OFF] ?? lands[0]
      const first = Math.min(...lands)
      const whole = Math.max(...lands)
      turn(grid, { S: first - FLIP, land, noise: false })
      for (const t of lands) if (t !== whole) flashes.push(t)
      const b = board(grid, whole, title, 'word', { from: first, landOf: (i) => nearEighth(land(i)) })
      next = breakDown(b, HOLD, breakTo - (whole + HOLD))
      b.until = next
      return b
    }
    /*
     * A chorus: GOODBYE / NORMA / JEANE on "Goodbye", "Norma", "Jean", gone as
     * "seventeen" is sung; SEVENTEEN on the word, gone on the first "more";
     * MORE / MORE / MORE a row on each "more". No titles in a chorus.
     */
    const chorus = (after, moreBreak) => {
      const g = wordAt(score, /^Goodbye/, after)
      const n = wordAt(score, /^Norma/, g)
      const j = wordAt(score, /^Jean/, n)
      const sev = wordAt(score, /^seventeen/, j)
      const m1 = wordAt(score, /^more/, sev)
      const m2 = wordAt(score, /^more/, m1)
      const m3 = wordAt(score, /^more/, m2)
      words(['GOODBYE', 'NORMA', 'JEANE'], [g, n, j], sev, 'GOODBYE NORMA JEANE')
      words(['', 'SEVENTEEN', ''], [sev, sev, sev], m1, 'SEVENTEEN')
      words(['MORE', 'MORE', 'MORE'], [m1, m2, m3], moreBreak(m3), 'MORE MORE MORE')
      return m3
    }
    /* In the first two choruses MORE comes apart over nine beats; the stream resumes as it goes. */
    const slowMore = (m3) => m3 + HOLD + 18 * EIGHTH

    /*
     * The stream (2026-11-09): 15 films to the first chorus, 12 between the
     * first two, 2 under the trumpet, all at one pace; words only in the
     * choruses; nothing but flashing under the piano; after "you wanted
     * more", her name. The clues sit in the builds nearest where they were:
     * Love Nest (after "Say goodbye to all you know"), The Seven Year Itch
     * (after "Different lines"), The Misfits, the last title.
     */
    stream(15, wordAt(score, /^Goodbye/, bar(39)), { 11: CLUE_1 })
    chorus(bar(39), slowMore)
    stream(12, wordAt(score, /^Goodbye/, bar(69)), { 23: CLUE_2 })
    chorus(bar(69), slowMore)
    stream(2, bar(82), { 28: CLUE_3 })
    if (films !== MARQUEE_FILMS.length) throw new Error(`marquee: ${films} of ${MARQUEE_FILMS.length} films scheduled`)

    /*
     * The piano solo, bars 82–84 (2026-11-17: "start with the single wink,
     * then make progressively more and more letters switch and flash along
     * with the double beat until every single tile has a letter and is
     * switching letters on the beat… on the very last beat all of the letters
     * hold for a second, then everything goes blank"). The piano stops on the
     * downbeat of bar 85 (the record drops 6 dB), 2.7 s before "Goodbye". One
     * tile from bar 82, the rest joining outward from it, slowly and then
     * faster, every lit tile changing on every eighth; the whole board from
     * the last half of bar 84; the last change on its last eighth, held for
     * three eighths, then all out on beat 2 of bar 85, blank to "Goodbye".
     * Drawn by `pianoBuild()` below, after the dance.
     *
     * Second round, 2026-11-17: "don't pause it until 3:37 (on the nearest
     * beat after that), and pause it on a blank marquee (only for a moment)
     * until the chorus comes back in." The build is as it was, whole from the
     * last half of bar 84, but the whole board keeps changing on every eighth
     * past the piano's end to the beat at or after 3:37 (217.34), where it
     * goes blank — no hold — and stays blank until GOODBYE lands.
     */
    const pianoAt = bar(82)
    const g3 = wordAt(score, /^Goodbye/, bar(85))
    const fullBy = bar(85) - EIGHTH // the ramp's last eighth, where it was frozen before
    const blankAt = D0 + Math.ceil((217 - D0) / BEAT - 1e-6) * BEAT
    const freezeAt = blankAt - EIGHTH // the last change
    boards.push({ at: pianoAt, from: pianoAt, until: g3, grid: EMPTY, red: redOf(EMPTY), title: '', kind: 'pulse', fullBy, freezeAt, blankAt })
    next = g3

    // The last chorus: the words, then YOU / WANTED / MORE on "you", "wanted",
    // "more", coming apart over ten beats.
    let you = 0
    chorus(bar(85), (m3) => {
      const w = wordAt(score, /^wanted/, m3)
      you = wordAt(score, /^you$/, wordAt(score, /^you,/, w))
      return you
    })
    const wanted = wordAt(score, /^wanted/, you)
    const more = wordAt(score, /^more/, wanted)
    const ywm = words(['YOU', 'WANTED', 'MORE'], [you, wanted, more], more + HOLD + 20 * EIGHTH, 'YOU WANTED MORE')
    /*
     * The finale (2026-11-17, second round, replacing NORMA JEANE turning
     * into MARILYN / MONROE): "From 4:09 on, the whole board should be
     * flashing. We should never see norma jeane… The only red letters should
     * be the letters in Marilyn Monroe when they are in their proper place.
     * Think of the words spelled out, but never displayed all at once. Never
     * more than 5-6 letters at a time. Sometimes 2-3. Always at least 1
     * letter. All of the letters should be dancing/switching with the beat
     * almost constantly… We should never see Marilyn Monroe totally spelled
     * out."
     *
     * FILL, the beat at or after 4:05: the finale's flashing takes over from
     * the dance, nearly every free tile on every eighth, YOU WANTED MORE still
     * coming apart round its last letters. WHOLE, the beat at or after 4:09:
     * every tile lit and changing to the cut, and her letters showing through
     * in red in her place (drawn after the dance, below).
     */
    const FILL = D0 + Math.ceil((245 - D0) / BEAT - 1e-6) * BEAT
    const WHOLE = D0 + Math.ceil((249 - D0) / BEAT - 1e-6) * BEAT
    ywm.until = FILL
    const finaleFree = (i, t) => !(ywm.grid[i] !== ' ' && t < ywm.off.get(i) + EIGHTH - 1e-3)
    boards.push({ at: WHOLE, from: FILL, until: LAST, wholeAt: WHOLE, grid: EMPTY, red: redOf(EMPTY), title: 'MARILYN MONROE', kind: 'finale', finaleFree, share: (k) => (k % 2 === 0 ? 0.97 : 0.9) })
    const popAt = WHOLE

    // The holds: from a board's first spin (the name: from when it is whole)
    // to the next event — where the dance runs.
    const holds = []
    boards.forEach((b) => holds.push([b.twinkleFrom ?? b.from ?? b.at, b.until, b]))

    /* ── The twinkle, inside the holds ─────────────────────────────────── */

    const endAt = Array(N).fill(-9) // when each tile's last added flip finishes
    const put = (i, land, c, tag = 't') => {
      const s = Math.max(land - FLIP + SW, endAt[i] + 0.01)
      events[i].push([s, c, tag])
      endAt[i] = s + FLIP
      return s + FLIP
    }
    // The ring: a tile beside a lit one, or (unless the board says 'row') directly above or below it.
    const near = (b, i) => {
      const grid = b.grid
      const c = i % COLS
      const row = Math.floor(i / COLS)
      return (c > 0 && grid[i - 1] !== ' ') || (c < COLS - 1 && grid[i + 1] !== ' ')
        || (b.ring !== 'row' && ((row > 0 && grid[i - COLS] !== ' ') || (row < ROWS - 1 && grid[i + COLS] !== ' ')))
    }
    // A tile the twinkle must leave alone at t: the board's own letters (and
    // the name's, in the finale), her place while a clue surfaces, and the
    // ring once the title is half there.
    const blocked = (b, i, t) => t - FLIP < (b.gone ?? Infinity) + 0.01 && (b.grid[i] !== ' ' || b.also?.has(i) || (b.clue && HID.has(i)) || (t >= (b.ringFrom ?? -Infinity) && near(b, i)))
    // Under the horns the ring is given up: only the board's own letters (and her place while a clue shows) are left alone.
    // Her place is held only round the beat her red letters show.
    const clueNear = (t) => clues.some(([a, z]) => t > a - EIGHTH - FLIP && t < z + EIGHTH)
    // And the gaps between a title's words stay blank, so THE MISFITS never reads THENMISFITS.
    const spans = new WeakMap()
    const inSpan = (b, i) => {
      if (!spans.has(b)) {
        const out = new Set()
        for (let r = 0; r < ROWS; r++) {
          const cols = []
          for (let c = 0; c < COLS; c++) if (b.grid[r * COLS + c] !== ' ') cols.push(c)
          if (cols.length) for (let c = cols[0]; c <= cols.at(-1); c++) out.add(r * COLS + c)
        }
        spans.set(b, out)
      }
      return spans.get(b).has(i)
    }
    const blockedAt = (b, i, t) => horn(t)
      ? t - FLIP < (b.gone ?? Infinity) + 0.01 && (inSpan(b, i) || b.also?.has(i) || (b.clue && HID.has(i) && clueNear(t)))
      : blocked(b, i, t)
    const eighthsIn = (a, b) => {
      const out = []
      for (let k = Math.ceil((a - D0) / EIGHTH); D0 + k * EIGHTH < b; k++) out.push(D0 + k * EIGHTH)
      return out
    }

    /*
     * On the beat (2026-11-13). Three rounds with the user: "keep the beat…
     * letters should always be dancing", then "the underlying main beat should
     * synchronize all movements", then "twice as fast, with variance… not
     * everything needs to change at that speed… everything should just be
     * timed to the beat… an interesting dance the whole time".
     *
     * So the grid is the eighth (half a beat) and nothing moves off it: after
     * the plan is built every flip — spins, locks, breakdowns, the sung words,
     * the clues, the bulbs' flashes — is moved so its letter changes on the
     * nearest eighth, and two flips of a tile that meet become the later. Run
     * once before the dance (so it knows how full each eighth is) and once at
     * the end.
     */
    const GRID = EIGHTH
    const quantize = () => {
      const snap = (x) => D0 + Math.round((x - D0) / GRID) * GRID
      for (const e of events) e.sort((a, b) => a[0] - b[0])
      for (const ev of events) {
        const out = []
        for (const e of ev) {
          if (e[0] < -1) { out.push(e); continue }
          const at = snap(e[0] + FLIP / 2) - FLIP / 2
          const last = out.at(-1)
          // Two that meet become the later — but the dance never overwrites a
          // board's own letter (a sung word lands a few ms after the eighth it
          // snaps to, while the dance still counts the tile as free).
          const boardsOwn = (x) => x[2] === undefined || x[2] === 'red'
          if (last && Math.abs(last[0] - at) < 1e-6) { if (!(boardsOwn(last) && (e[2] === 't' || e[2] === 'w'))) out[out.length - 1] = [at, e[1], e[2]] }
          else out.push([at, e[1], e[2]])
        }
        // A blank turning over onto a blank is no movement — unless a wave put it there.
        const kept = out.filter((e, k) => k === 0 || e[2] === 'w' || !(e[1] === ' ' && out[k - 1][1] === ' '))
        ev.splice(0, ev.length, ...kept)
      }
      for (let k = 0; k < flashes.length; k++) flashes[k] = snap(flashes[k])
      for (const c of clues) { c[0] = snap(c[0]); c[1] = snap(c[1]) }
    }
    // How many tiles already turn over on eighth q (the builds, breakdowns and words).
    const busy = new Map()
    {
      quantize()
      for (const ev of events) for (const e of ev) if (e[0] > -1) { const q = Math.round((e[0] + FLIP / 2 - D0) / GRID); busy.set(q, (busy.get(q) ?? 0) + 1) }
    }

    /*
     * The dance. Layers like a band's, each at its own speed, all on the grid:
     *   - the kick: on beats 1 and 3 a group of free tiles light, change or go
     *     out together, the biggest on the downbeat;
     *   - the snare: a smaller group on 2 and 4, and the board's own letters
     *     (titles too) wink in place — one to three;
     *   - the hats: once the song is up, 0–3 tiles on the offbeat eighths,
     *     never the same count twice running;
     *   - a move, a different one each bar (never the same two bars running),
     *     chosen by how much energy there is: a wave sweeping the columns, a
     *     burst from the centre out, a ripple through the title's letters in
     *     reading order, a stab (a whole free row lights on the downbeat and
     *     goes out on the eighths after beat 3), or a rest. Quiet verses mostly
     *     ripple and rest; the build adds waves and bursts; the chorus stabs.
     * How many free tiles are lit follows the energy, so the board fills as
     * the song builds. It runs straight through a change of title.
     */
    const twLit = Array(N).fill(false)
    let handoff = null
    const canFlip = (i, t) => t - FLIP + SW >= endAt[i] + 0.01
    const MOVES = [
      [0.4, ['ripple', 'rest', 'wave', 'ripple', 'rest']],
      [0.7, ['wave', 'ripple', 'burst', 'rest', 'wave']],
      [9, ['wave', 'burst', 'stab', 'ripple', 'burst', 'stab']],
    ]
    const colsAt = (move, e, dir) => {
      if (move === 'wave') {
        const k = dir > 0 ? e : 7 - e
        const out = []
        for (let c = Math.floor((k * COLS) / 8); c < Math.floor(((k + 1) * COLS) / 8); c++) out.push(c)
        return out
      }
      if (move === 'burst') return e < 7 ? [...new Set([6 - e, 6 + e])].filter((c) => c >= 0 && c < COLS) : []
      return []
    }
    const dance = () => {
      const on = holds.filter(([, , b]) => !b.share && b.kind !== 'pulse')
      if (!on.length) return
      const rand = rng(4242)
      let lastMove = ''
      let lastHats = -1
      let move = 'rest'
      let dir = 1
      let stabRow = -1
      let winked = new Set()
      let solo = boards.find((x) => x.kind === 'pulse')
      const startQ = Math.ceil((on[0][0] - D0) / GRID - 1e-6)
      for (let q = startQ; D0 + q * GRID < on.at(-1)[1] - 1e-6; q++) {
        const t = D0 + q * GRID
        // The piano solo clears the board (pianoBuild), so the dance starts the last chorus dark.
        if (solo && t >= solo.from) { twLit.fill(false); solo = null }
        const h = on.find(([a, u]) => t >= a && t < u)
        if (!h) continue
        const b = h[2]
        const e = ((q % 8) + 8) % 8 // the eighth of the bar
        const E = drive(t)
        const H = horn(t)
        if (e === 0 || q === startQ) {
          const pool = MOVES.find(([lim]) => E < lim)[1].filter((m) => m !== lastMove)
          move = pool[Math.floor(rand() * pool.length)]
          lastMove = move
          dir = rand() < 0.5 ? 1 : -1
          stabRow = -1
        }

        // The free tiles now; a lit one the board now needs goes out.
        const free = []
        for (let i = 0; i < N; i++) {
          if (!canFlip(i, t)) continue
          if (blockedAt(b, i, t) || blockedAt(b, i, t + GRID)) {
            // A lit tile the board needs goes out — unless the board's own
            // letter lands there: then that flip replaces it, and blanking it
            // here would knock a letter out of the sung word (2026-11-17:
            // GOODBYE lost four letters an eighth after it landed).
            if (twLit[i] && !(b.landOf && b.grid[i] !== ' ' && b.landOf(i) <= t + 1e-6)) put(i, t, ' ')
            twLit[i] = false
            continue
          }
          free.push(i)
        }
        const target = Math.round(free.length * (H ? 0.8 : 0.08 + 0.55 * E ** 1.4))
        let litNow = free.filter((i) => twLit[i]).length
        const shuffle = (a) => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [a[k], a[j]] = [a[j], a[k]] } return a }
        const touched = new Set()
        // One tile in the dance: lit, it changes or goes out; dark, it lights.
        const step = (i, tag = 't', always = false) => {
          if (touched.has(i) || !canFlip(i, t)) return false
          touched.add(i)
          if (twLit[i]) {
            if (litNow > target || rand() < 0.35) { put(i, t, ' ', tag); twLit[i] = false; litNow-- }
            else put(i, t, pickFor(rand, i), tag)
            return true
          }
          if (litNow <= target || always) { put(i, t, pickFor(rand, i), tag); twLit[i] = true; litNow++; return true }
          if (tag === 'w') { put(i, t, ' ', 'w'); return true } // a wave turns the dark ones over too
          return false
        }
        const group = (n) => { let d = 0; for (const i of shuffle([...free])) { if (d >= n) break; if (step(i)) d++ } }

        // The horns: almost every free tile turns over on every eighth, nearly
        // all of them on the beats; the title holds, winking, and its ring
        // goes with the rest.
        if (H) {
          const share = e % 2 === 0 ? 0.95 : 0.8
          for (const i of free) if (rand() < share) step(i, 'w', true)
        }

        // The move of the bar.
        if (!H) for (const c of colsAt(move, e, dir)) for (const i of free) if (i % COLS === c) step(i, 'w', rand() < 0.3 + 0.4 * E)
        if (!H && move === 'stab') {
          if (e === 0) {
            const rows = [0, 1, 2].map((r) => free.filter((i) => Math.floor(i / COLS) === r))
            stabRow = rows.reduce((best, r, k) => (r.length > rows[best].length ? k : best), 0)
            for (const i of rows[stabRow]) step(i, 't', true)
          } else if (e >= 4 && stabRow >= 0) {
            for (const i of free) if (Math.floor(i / COLS) === stabRow && twLit[i] && rand() < 0.5) { put(i, t, ' '); twLit[i] = false; litNow--; touched.add(i) }
          }
        }

        // The kick, the snare, the hats.
        const busyHere = busy.get(q) ?? 0
        if (H) { /* the horns have taken every tile already */ } else if (e === 0 || e === 4) group(Math.max(1, Math.round((e === 0 ? 1 : 0.8) * (3 + 9 * E)) - Math.floor(busyHere / 2)))
        else if (e === 2 || e === 6) group(Math.max(1, Math.round(2 + 5 * E) - Math.floor(busyHere / 2)))
        else if (E > 0.4) {
          let n = Math.floor(rand() * (1 + 3 * E))
          if (n === lastHats) n = (n + 1) % Math.max(2, Math.ceil(1 + 3 * E))
          lastHats = n
          group(n)
        }

        // The board's own letters, once it is whole and until it comes apart.
        const lit = []
        b.grid.forEach((c, i) => { if (c !== ' ') lit.push(i) })
        const whole = t >= b.at + GRID - 1e-6 && t < (b.whole ?? b.until) - FLIP
        if (lit.length && whole) {
          if (move === 'ripple') {
            // In reading order, a letter or two an eighth, through the bar.
            const per = Math.max(1, Math.ceil(lit.length / 8))
            for (const i of lit.slice(e * per, (e + 1) * per)) if (canFlip(i, t)) put(i, t, b.grid[i], null)
          } else if (e % 2 === 0) {
            const n = Math.min(3, lit.length, (e === 0 ? 2 : e === 4 ? 2 : 1) + (E > 0.65 ? 1 : 0))
            const pool = shuffle(lit.filter((i) => !winked.has(i) && canFlip(i, t)))
            winked = new Set(pool.slice(0, n))
            for (const i of winked) put(i, t, b.grid[i], null)
          }
        }
      }
      const endT = D0 + Math.ceil((on.at(-1)[1] - D0) / GRID) * GRID
      // Straight into the finale's flashing, the lit tiles stay lit; otherwise they go out.
      if (boards.some((x) => x.kind === 'finale' && Math.abs(x.from - on.at(-1)[1]) < 1e-3)) handoff = [...twLit]
      else for (let i = 0; i < N; i++) if (twLit[i]) put(i, endT, ' ')
    }

    if (O.twinkle) dance()

    /*
     * The piano solo's build (see the plan above): whatever the dance left
     * lit goes out on bar 82's downbeat but one tile, the centre; the others
     * join by distance from it (a little ragged) on a curve that keeps the
     * wink alone for three beats and fills the board by the last five
     * eighths. Every joined tile changes letter on every eighth.
     */
    const pianoBuild = () => {
      const b = boards.find((x) => x.kind === 'pulse')
      const at = (c) => c - FLIP / 2 // a flip whose letter changes at c
      const inside = (e) => e[0] + FLIP / 2 > b.from - 0.01 && e[0] + FLIP / 2 < b.until - 0.01
      for (const ev of events) {
        const kept = ev.filter((e) => !inside(e))
        ev.splice(0, ev.length, ...kept)
      }
      const rand = rng(8285)
      const pw = 1140 / COLS
      const rh = 420 / ROWS
      const seedTile = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2)
      const dist = (i) => Math.hypot(((i % COLS) - (seedTile % COLS)) * pw, (Math.floor(i / COLS) - Math.floor(seedTile / COLS)) * rh)
      const order = Array.from({ length: N }, (_, i) => i)
        .map((i) => [i, i === seedTile ? -1 : dist(i) + rand() * 160])
        .sort((x, y) => x[1] - y[1])
        .map(([i]) => i)
      const steps = Math.round((b.freezeAt - b.from) / EIGHTH) // every eighth with a change, the last before the blank
      const ALONE = 6 // the wink alone, three beats
      const FULL = Math.round((b.fullBy - b.from) / EIGHTH) - 5 // the whole board from five eighths before the piano stops
      const count = (k) => (k <= ALONE ? 1 : k >= FULL ? N : Math.round(1 + (N - 1) * ((k - ALONE) / (FULL - ALONE)) ** 3))
      const shown = Array(N).fill(' ')
      for (let k = 0; k <= steps; k++) {
        const c = b.from + k * EIGHTH
        const n = count(k)
        for (let j = 0; j < N; j++) {
          const i = order[j]
          if (j < n) {
            let l = pickFor(rand, i)
            while (l === shown[i]) l = pickFor(rand, i)
            events[i].push([at(c), l, 't'])
            shown[i] = l
          } else if (k === 0) events[i].push([at(c), ' ', 't']) // the board clears for the wink
        }
      }
      for (let i = 0; i < N; i++) events[i].push([at(b.blankAt), ' ', 't'])
    }
    if (O.twinkle) pianoBuild()

    if (O.twinkle) {
      holds.forEach(([at, until, b], idx) => {
        const rand = rng(300 + idx)
        if (b.share) {
          // Flashing: on each eighth a share of the free tiles flip to a letter
          // and the rest go out, the share from the piano's figure or the
          // finale's beat. Runs to the cut.
          const hi = b.kind === 'finale' ? b.wholeAt : until - 0.3
          const lit = b.kind === 'finale' && handoff ? handoff : Array(N).fill(false)
          for (const t of eighthsIn(at - 0.001, hi)) {
            const pos = ((Math.round((t - D0) / EIGHTH) % 8) + 8) % 8
            const p = Math.max(b.share(pos, t), horn(t) ? (pos % 2 === 0 ? 0.97 : 0.88) : 0)
            for (let i = 0; i < N; i++) {
              if (t - FLIP + SW < endAt[i] + 0.01) continue
              const no = b.finaleFree ? !b.finaleFree(i, t) : blocked(b, i, t)
              // A lit tile the board needs goes out, unless the name's own letter is landing on it.
              if (no) { if (lit[i]) put(i, t, ' '); lit[i] = false; continue }
              if (rand() < p) { put(i, t, pickFor(rand, i)); lit[i] = true }
              else if (lit[i]) { put(i, t, ' '); lit[i] = false }
            }
          }
          if (b.kind !== 'finale') for (let i = 0; i < N; i++) if (lit[i]) put(i, hi, ' ')
          return
        }
      })

      /*
       * The whole board (see the finale above). On every eighth from WHOLE
       * to the cut every tile is lit: the black ones change on every beat and
       * on most eighths between. Her letters come and go in her place, in red,
       * a few at a time — the count wanders between 1 and 6 by the beat, most
       * often 2–4 — each staying one to three beats, turning over onto itself
       * on the beat while it stays, then flipping back to a black letter. New
       * ones are taken mostly in reading order, as if the name were being
       * spelled, never more than six and never all thirteen.
       */
      const fin = boards.find((x) => x.kind === 'finale')
      if (fin) {
        for (const ev of events) ev.splice(0, ev.length, ...ev.filter((e) => e[0] < -1 || e[0] + SW < fin.wholeAt - 1e-3))
        const rand = rng(1962)
        const shown = Array(N).fill(' ')
        const life = new Map() // red tile → the eighth it goes
        let ptr = Math.floor(rand() * 13)
        let want = 2
        const black = (i, c) => {
          let l = pickFor(rand, i)
          while (l === shown[i]) l = pickFor(rand, i)
          put(i, c, l)
          shown[i] = l
        }
        for (let c = fin.wholeAt, k = 0; c < LAST + EIGHTH; c += EIGHTH, k++) {
          const onBeat = k % 2 === 0
          // How many of hers, set on the beat: a walk between 1 and 6 that leans to 2–4.
          if (onBeat) {
            const step = [-2, -1, -1, 0, 1, 1, 2][Math.floor(rand() * 7)]
            want = Math.max(1, Math.min(6, want + step + (want > 4 ? -1 : want < 2 ? 1 : 0)))
          }
          // Those whose time is up go back to black — but never the last one before another comes.
          for (const [i, end] of [...life]) if (k >= end) { life.delete(i); black(i, c) }
          while (life.size < want) {
            const free = HKEYS.filter((i) => !life.has(i) && shown[i] !== HID.get(i))
            let i
            if (rand() < 0.75) {
              for (let n = 0; n < 13; n++) { const j = HKEYS[(ptr + n) % 13]; if (free.includes(j)) { i = j; ptr = (ptr + n + 1 + (rand() < 0.3 ? 1 : 0)) % 13; break } }
            } else i = free[Math.floor(rand() * free.length)]
            if (i === undefined) break
            put(i, c, HID.get(i), 'red')
            shown[i] = HID.get(i)
            life.set(i, k + 2 * (1 + Math.floor(rand() * 3)) - (onBeat ? 0 : 1))
          }
          for (let i = 0; i < N; i++) {
            if (life.has(i)) {
              if (onBeat && shown[i] === HID.get(i) && c - FLIP + SW >= endAt[i] + 0.01) put(i, c, HID.get(i), 'red')
              continue
            }
            if (c - FLIP + SW < endAt[i] + 0.01) continue // turned over this eighth already
            if (onBeat || rand() < 0.85) black(i, c)
          }
        }
      }
    }

    quantize()

    // The bulbs, clockwise from the top left, and when each one dies.
    const bulbs = []
    for (let i = 0; i < 34; i++) bulbs.push([196 + i * 1208 / 33, 146])
    for (let j = 1; j < 14; j++) bulbs.push([1404, 146 + j * 39.1])
    for (let i = 33; i >= 0; i--) bulbs.push([196 + i * 1208 / 33, 694])
    for (let j = 13; j > 0; j--) bulbs.push([196, 146 + j * 39.1])
    const bulbDeath = bulbs.map(() => LAST)

    return { energy, drive, BEAT, BAR, D0, EIGHTH, bar, LAST, boards, pianoAt, popAt, events, holds, clues, flashes, darks, bulbs, bulbDeath }
  }

  /* ── Drawing ─────────────────────────────────────────────────────────── */

  function lightsAt(plan, score, t) {
    const kind = sectionKind(score, t)
    const beatI = Math.floor((t - plan.D0) / plan.BEAT)
    const dark = plan.darks.some(([a, b]) => t >= a && t < b)
    const flash = plan.flashes.some((f) => t - f >= 0 && t - f < plan.BEAT)
    const pulse = Math.exp(-(((t - plan.D0) % plan.BEAT + plan.BEAT) % plan.BEAT) * 5)
    return plan.bulbs.map((_, k) => {
      if (t >= plan.bulbDeath[k]) return { state: 'dead' }
      if (dark && !flash) return { state: 'off' }
      if (kind === 'intro') {
        // They come on as the black lifts off the opening, the last of them by NORMA JEANE.
        const w = Math.max(0, Math.min(1, (t - plan.bar(4.5)) / (plan.bar(8) - plan.bar(4.5))))
        const lit = hash(k) < w && ((Math.floor(k / 2) + beatI) % 2 === 0 || t > plan.bar(7))
        return { state: lit ? 'lit' : 'off', color: PINK, glow: 0 }
      }
      if (flash && kind !== 'outro') return { state: 'lit', color: kind.startsWith('chorus') ? WHITE : PINK, glow: 1 }
      switch (kind) {
        case 'verse': return { state: (Math.floor(k / 2) + beatI) % 2 === 0 ? 'lit' : 'off', color: PINK, glow: 0 }
        case 'prechorus': return { state: (Math.floor(k / 2) + Math.floor((t - plan.D0 + 1e-3) / plan.EIGHTH)) % 2 === 0 ? 'lit' : 'off', color: PINK, glow: 0 }
        case 'break': return { state: (Math.floor(k / 3) + Math.floor((t - plan.D0) / plan.BAR)) % 2 === 0 ? 'lit' : 'off', color: GOLD, glow: 0 }
        case 'chorus': return { state: 'lit', color: WHITE, glow: 0.6 + 0.4 * pulse }
        case 'chorus3': return { state: 'lit', color: WHITE, glow: 0.8 + 0.2 * pulse }
        default: return { state: hash(k * 7 + Math.floor((t - plan.D0) / plan.EIGHTH)) < 0.55 ? 'lit' : 'off', color: PINK, glow: 0 }
      }
    })
  }

  /* ── The frame ───────────────────────────────────────────────────────── */

  function frame({ time, score, lockup = '', uid = 'marquee' }) {
    const plan = planFor(score)
    const t = time

    // The last hit: a hard cut to the band's mark on black, held past the record's end.
    if (t >= plan.LAST) {
      return {
        label: 'End card',
        svg: `<rect width="1600" height="900" fill="${END_BLACK}"/><g transform="translate(800 450) scale(${r(500 / 918, 5)}) translate(-459 -309.5)" style="color:${END_INK}">${lockup}</g>`,
      }
    }

    const held = plan.holds.find(([a, b]) => t >= a && t < b)?.[2] ?? null

    // Tiles.
    const x0 = 230; const y0 = 236; const w = 1140; const h = 420
    // A tile is as wide as the board allows (4 between tiles), and the type is set
    // so the widest glyph, Jost Bold's W at 1.06 em, clears both edges of one.
    const pitch = w / COLS; const tw = pitch - 4; const rh = h / ROWS; const th = rh - 14
    const fs = Math.min(Math.floor((tw - 6) / 1.06), Math.floor(th * 0.9))
    const tiles = []
    for (let i = 0; i < N; i++) {
      const row = Math.floor(i / COLS); const c = i % COLS
      const x = x0 + c * pitch + 2; const y = y0 + row * rh + 7
      const st = flapAt(plan.events[i], t, FLIP)
      const { letter, sy, moving, tag } = st
      let red = false
      if (letter !== ' ' && !tag) red = held && held.grid[i] === letter ? held.red[i] : HID.get(i) === letter
      if (tag === 'red') red = true
      tiles.push(`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(tw)}" height="${f1(th)}" fill="none" stroke="${INK}" stroke-width="2"/>`)
      if (letter !== ' ' || moving) {
        const cy = y + th / 2
        tiles.push(`<g transform="translate(0 ${f1(cy)}) scale(1 ${Math.max(sy, 0.02).toFixed(3)}) translate(0 ${f1(-cy)})">`)
        if (moving) tiles.push(`<rect x="${f1(x + 1)}" y="${f1(y + 1)}" width="${f1(tw - 2)}" height="${f1(th - 2)}" fill="${FLAP}"/>`)
        if (letter !== ' ') tiles.push(`<text x="${f1(x + tw / 2)}" y="${f1(y + th / 2 + 0.35 * fs)}" font-size="${fs}" font-weight="700" fill="${red ? RED : INK}" text-anchor="middle">${esc(letter)}</text>`)
        tiles.push('</g>')
        if (moving && sy < 0.98) tiles.push(`<line x1="${f1(x - 2)}" y1="${f1(cy)}" x2="${f1(x + tw + 2)}" y2="${f1(cy)}" stroke="${INK}" stroke-width="1.6"/>`)
      }
    }

    // Bulbs.
    const bulbs = []
    lightsAt(plan, score, t).forEach((l, k) => {
      const [x, y] = plan.bulbs[k]
      if (l.state === 'dead') bulbs.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="10" fill="${INK}"/>`)
      else if (l.state === 'lit') {
        if (l.glow) bulbs.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="19" fill="${l.color === WHITE ? '#f2c75c' : l.color}" opacity="${(0.55 * l.glow).toFixed(2)}"/>`)
        bulbs.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="10" fill="${l.color}" stroke="${INK}" stroke-width="2"/><circle cx="${f1(x - 3)}" cy="${f1(y - 3)}" r="2.5" fill="${PAPER}"/>`)
      } else bulbs.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="10" fill="none" stroke="${INK}" stroke-width="2"/>`)
    })

    const kind = sectionKind(score, t)
    const dark = t < plan.bar(6) || plan.darks.some(([a, b]) => t >= a && t < b) && !plan.flashes.some((f) => t >= f && t - f < plan.BEAT)
    const band = dark ? '#cfc3ad' : kind === 'break' ? GOLD : PINK
    const bandText = `<text x="800" y="215" font-size="28" font-weight="700" fill="${INK}" text-anchor="middle" letter-spacing="6">${dark ? '' : 'NOW SHOWING'}</text>`
    const lyric = esc(lyricAt(score, t).toUpperCase())

    const svg = `<rect width="1600" height="900" fill="${PAPER}"/>
<rect x="24" y="24" width="1552" height="796" rx="5" fill="none" stroke="#d9cfb9" stroke-width="3"/>
<rect x="34" y="34" width="1532" height="776" fill="${INK}"/>
<g transform="translate(800 422) scale(1.18) translate(-800 -422)">
<rect x="170" y="120" width="1260" height="600" fill="${PAPER}"/>
<rect x="222" y="172" width="1156" height="496" fill="none" stroke="${INK}" stroke-width="3"/>
<rect x="230" y="180" width="1140" height="480" fill="none" stroke="${INK}" stroke-width="1"/>
<rect x="230" y="180" width="1140" height="46" fill="${band}"/>
${bandText}
${tiles.join('')}${bulbs.join('')}</g>
<text x="800" y="867" font-size="33" font-weight="700" fill="${INK}" text-anchor="middle">${lyric}</text>
${openingSvg(t, uid)}`

    const clue = plan.clues.some(([a, b]) => t >= a && t < b)
    const out = plan.darks.some(([a, b]) => t >= a && t < b)
    const label = t < MARQUEE_OPENING.reveal[1] ? 'Opening'
      : t < plan.boards[0].at ? (t < plan.boards[0].from ? 'An empty marquee' : 'The letters settling into NORMA JEANE')
        : held?.kind === 'pulse' ? (t < held.fullBy - 5 * plan.EIGHTH ? 'The letters joining the piano, one tile to the whole board' : t < held.blankAt ? 'Every letter changing on the eighths' : 'A blank board, a breath before "Goodbye"')
          : held?.kind === 'finale' ? (t < held.wholeAt ? 'Almost every letter dancing' : 'The whole board flashing, a few of her letters showing through in red')
            : held && t < held.at ? `The letters settling into ${held.title}${clue ? ', her name showing through in red' : ''}`
              : held && t >= (held.gone ?? Infinity) ? 'An empty marquee, letters blinking'
                : held && t >= (held.whole ?? Infinity) ? `${held.title}, coming apart`
                  : held ? `The marquee reads ${held.title}`
                    : out ? 'The marquee goes dark' : 'An empty marquee, letters blinking'
    return { svg, label }
  }

  /** Seconds of silence an export holds on the end card after the record (mp4.mjs reads it). */
  frame.hold = 4

  /** When things happen, for the page's jump list. */
  function moments(score) {
    const p = planFor(score)
    return {
      nj: p.boards[0].at,
      titles: p.boards.filter((b) => b.kind === 'film').map((b) => ({ at: b.at, title: b.title })),
      hooks: p.boards.filter((b) => b.title === 'GOODBYE NORMA JEANE').map((b) => b.from),
      words: p.boards.filter((b) => b.kind === 'word').map((b) => ({ at: b.from, title: b.title })),
      clues: p.clues.map(([a]) => a),
      piano: p.pianoAt,
      finale: p.popAt,
      fill: p.boards.find((b) => b.kind === 'finale')?.from,
      last: p.LAST,
      // Where the piano comes in (its level first reaches 4 of 9) and the two horn stretches.
      pianoIn: (() => { const k = [...(score.piano ?? '')].findIndex((d) => Number(d) >= 4); return k < 0 ? null : (score.beatPhase ?? 0) + k * p.BEAT })(),
      horns: (score.horns ?? []).map(([a]) => a),
    }
  }

  return { frame, moments, plan: planFor }
}

const BASE = marqueeFilm()
export const marqueeFrame = BASE.frame
export const marqueeMoments = BASE.moments

