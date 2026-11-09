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
 * THE RULES (2026-11-09, replacing the schedule of 2026-11-02/05)
 *   1. After the black lifts (12.0) the board is blank for a second; the first
 *      motion is on the next beat, the downbeat of bar 5 (13.33).
 *   2. The only lyric on the board is NORMA JEANE at the start, whole on the
 *      first "Norma" (22.49), and GOODBYE / NORMA / JEANE on three rows in each
 *      chorus, each row turning over on its own word — no spin before them.
 *      Everything else on the board is one of her twenty-nine films. (MORE,
 *      key words and headlines are gone.)
 *   3. Every board builds and breaks down over the same length, and is whole
 *      and still for four beats between (the grid's answer to "2 seconds").
 *      One title starts as the one before it goes: a continual stream, broken
 *      only by the drop bars. Twenty-nine films have to fit between the fixed
 *      events, so the pace is set stretch by stretch (see `stream`): a 2.2 s
 *      build for the two before the first drop, 1.6 s through the middle,
 *      1.9 s for the last three. The hook's breakdown is the one asymmetry:
 *      it lands in 1.3 s and comes apart over ten beats, gone as "Know you
 *      want the world" starts.
 *   - Every change is on an eighth of the click. 95 BPM; the score's beat is
 *     at 0.066, the bar's strongest accent the beat after it, so bar 0 starts
 *     at 0.698. A measured word sits a few ms off the grid; the stream snaps
 *     back to the nearest eighth after each one.
 *   - The drop bars (19, 39, 69): the record drops nearly out, the board is
 *     blank and the bulbs go out. Kept from 2026-11-02.
 *   - Red, on a board that has landed: at most one MARILYN MONROE's worth of
 *     letters (two M, N, O, R; one A, I, L, Y, E), letters in her hidden place
 *     first, then reading order. Red, while the board is turning over: only a
 *     letter in her hidden place — MARILYN on the top row and MONROE under it,
 *     from column 4. Three builds let the name show through: 3 letters (All
 *     About Eve), then 6 (Niagara), then 9 (The Prince and the Showgirl), for a
 *     beat each. Never all thirteen (confirmed 2026-11-02: her name is never
 *     spelled).
 *   - Lights follow the song's sections, flash on every landing, and go out
 *     in the drop bars.
 *
 * THE TWINKLE (chosen 2026-11-05 from five motion tests: "A is the best";
 * following the record chosen 2026-11-09 from three). While a board is up,
 * letters blink on and off in the tiles it leaves empty, each flip on an
 * eighth, following the record's brightness (score.brightness: the energy
 * above 1.8 kHz, a digit a beat) — a few in the verse gaps, most of the free
 * board in the choruses and the trumpet. Never beside a lit letter or
 * directly above or below one once a title is half locked, never in her place
 * while a clue shows, never in a drop bar, never red. It starts once NORMA
 * JEANE is whole: nothing is on the board before her name. A surfacing
 * title's spinning tiles follow the same level: soft, they turn over less and
 * often come up blank; loud, they spin hard.
 *
 * THE SURFACING (decided 2026-11-05: "the title can slowly reveal itself by
 * letters slowly falling into place… it will more so bubble up to the
 * surface, than disappear as the letters flip away"). A title's tiles start
 * spinning through random letters in the first third of its build (the first
 * on the build's first eighth), then lock onto the right one a few at a time,
 * in scattered order, on the eighths, the last on the landing; whole and
 * still for four beats; then its letters flip away, scattered, on the
 * sixteenths. The name's and the hook's held letters still turn over onto
 * themselves now and then (`dance`); a title, whole, is still.
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
function flapAt(ev, twitches, t) {
  const k = lastIndex(ev, t)
  const [tc, cur, tag] = ev[k]
  const prev = k > 0 ? ev[k - 1][1] : ' '
  const p = (t - tc) / FLIP
  if (p >= 0 && p < 1) return { letter: p < 0.5 ? prev : cur, sy: Math.abs(1 - 2 * p), moving: true, tag: p < 0.5 ? ev[k - 1]?.[2] : tag }
  for (const tw of twitches) {
    const q = (t - tw) / 0.3
    if (q >= 0 && q < 1) return { letter: cur, sy: 1 - 0.45 * Math.sin(q * Math.PI), moving: true, tag }
  }
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
  twinkle: 1, // letters blinking in the empty tiles, following the record (0: none)
  dance: true, // the name's and the hook's held letters turn over onto themselves now and then
}

export function marqueeFilm(options = {}) {
  const O = { ...DEFAULTS, ...options }
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
    const twitches = Array.from({ length: N }, () => [])
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
    const level = (t) => {
      const k = Math.floor((t - (score.beatPhase ?? 0)) / BEAT)
      const d = Number(bright[Math.max(0, Math.min(bright.length - 1, k))] ?? 3)
      return Math.max(0, Math.min(1, (d - 1.5) / 7))
    }

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
            events[i].push([t, c])
          }
          if (clue && k >= 0 && clue.includes(k)) {
            events[i].push([ct, HID.get(i)])
            events[i].push([ce, pick(NOISE)])
          }
          if (fin > quiet) events[i].push([quiet - FLIP, ' '])
        }
        if (final || rand() < 0.6) events[i].push([fin, next[i]])
      }
      cur = next
    }

    /*
     * A board coming apart: whole and still for `W`, then its letters flip
     * away, scattered, on the sixteenths, over `K`. Returns when it is gone.
     */
    function breakDown(b, W, K) {
      const from = b.at + W
      const rand = rng(seed++)
      const SIX = EIGHTH / 2
      const steps = Math.max(1, Math.floor(K / SIX))
      b.grid.forEach((c, i) => { if (c !== ' ') events[i].push([from + Math.floor(rand() * steps) * SIX, ' ']) })
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
          events[i].push([t, rand() < 0.6 * (1 - I) ? ' ' : pickFor(rand, i), 'x'])
        }
        if (clue && k >= 0 && clue.includes(k)) {
          events[i].push([ct, HID.get(i), 'red'])
          if (end > ce + 0.01) events[i].push([ce, NOISE[Math.floor(rand() * NOISE.length)], 'x'])
        }
        events[i].push(lock.has(i) ? [end, grid[i]] : [end, ' '])
      }
      cur = grid
      const locks = [...lock.values()].sort((a, b) => a - b)
      return locks[Math.floor(locks.length / 2)] ?? L
    }

    /* The landings. */
    const ripple = (L) => (i) => L - (1 - (i % COLS) / (COLS - 1)) * BEAT * 0.9
    const board = (grid, at, title, kind, extra = {}) => {
      const b = { at, grid, red: redOf(grid), title, kind, ...extra }
      boards.push(b)
      flashes.push(at)
      return b
    }
    /* The eighth nearest t (a measured word sits a few ms off the click). */
    const nearEighth = (t) => D0 + Math.round((t - D0) / EIGHTH) * EIGHTH
    /* Every board is whole and still for four beats (2026-11-09: "2 seconds" → the grid's 2.53). */
    const HOLD = 4 * BEAT
    let next // when the board is free again

    // The name: her ten tiles start spinning on the downbeat after the fade
    // (bar 5, a second after the black lifts) and are whole on "Norma"; nothing
    // else is on the board before it, the twinkle starting once it is whole.
    // It comes apart over as long as it took to arrive.
    const NJ_S = bar(5)
    const NJ_L = wordAt(score, /^Norma/, 0)
    const NJ = layout(['', 'NORMA JEANE', ''])
    const njRing = surface(NJ, NJ_S, NJ_L)
    const nj = board(NJ, NJ_L, 'NORMA JEANE', 'name', { from: NJ_S, ringFrom: njRing, twinkleFrom: NJ_L })
    next = breakDown(nj, HOLD, NJ_L - NJ_S)
    nj.until = next

    /*
     * A stretch of `n` film titles, one after another from `next`: each
     * surfaces over `X` eighths, is whole for HOLD, comes apart over `X`, and
     * the next starts as it goes. The stream runs to `until` (a drop bar, a
     * chorus, the end), the board twinkling empty for whatever is left.
     * `clues` maps a film's index to the letters its build lets show in red.
     */
    let films = 0
    const stream = (n, X, until, clues = {}) => {
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
    /* The drop bar: the record drops nearly out, the board is blank and the bulbs go out. */
    const drop = (m) => {
      darks.push([bar(m), bar(m + 1)])
      boards.push({ at: bar(m), grid: EMPTY, red: redOf(EMPTY), title: '', kind: 'dark' })
      next = bar(m + 1)
    }
    /*
     * The hook, on three rows: GOODBYE turns over on "Goodbye", NORMA on
     * "Norma", JEANE on "Jean" — no spin before them (2026-11-09: "show up in
     * time with the lyrics") — whole for HOLD, then it comes apart slowly, over
     * ten beats, so the name dissolves through "I've been in love with you
     * since we were seventeen" and is gone as "Know you want the world" starts.
     */
    const HOOK = layout(['GOODBYE', 'NORMA', 'JEANE'])
    const hook = (after) => {
      const g = wordAt(score, /^Goodbye/, after)
      const n = wordAt(score, /^Norma/, g)
      const j = wordAt(score, /^Jean/, n)
      const land = (i) => [g, n, j][Math.floor(i / COLS) - OFF] ?? g
      turn(HOOK, { S: g - FLIP, land, noise: false })
      flashes.push(g, n)
      const b = board(HOOK, j, 'GOODBYE NORMA JEANE', 'hook', { from: g })
      next = breakDown(b, HOLD, 20 * EIGHTH)
      b.until = next
      return g
    }

    /*
     * The stream, 2026-11-09. Twenty-nine films have to fit between the fixed
     * events, so the pace is set stretch by stretch: a 2.2 s build/break for
     * the two before the first drop, 1.6 s from the first drop to the third
     * pre-chorus and through the back of chorus 2, 1.9 s for the last three.
     * The clues sit in the builds nearest where they were: All About Eve
     * ("Say goodbye to all you know"), Niagara ("Different lines"), and The
     * Prince and the Showgirl, the last title before the last chorus.
     */
    stream(2, 7, bar(19)); drop(19)
    stream(8, 5, bar(39), { 7: CLUE_1 }); drop(39)
    hook(bar(39)); stream(11, 5, bar(69), { 18: CLUE_2 }); drop(69)
    hook(bar(69)); stream(5, 5, wordAt(score, /^Goodbye/, bar(85)), { 25: CLUE_3 })
    hook(bar(85)); stream(3, 6, bar(98))

    // Something's Got to Give: from the downbeat where the voice leaves, the
    // letters spin for two bars, most of them land, and it never finishes.
    const sgtgS = bar(98)
    const sgtgAt = bar(100)
    turn(layout(["SOMETHING'S", 'GOT TO', 'GIVE']), { S: sgtgS, land: ripple(sgtgAt), final: false })
    if (films !== MARQUEE_FILMS.length) throw new Error(`marquee: ${films} of ${MARQUEE_FILMS.length} films scheduled`)

    // The holds: from a board's first spin (the name: from when it is whole)
    // to the next event, and a tile twitching half a flip on the backbeat
    // while the name or the hook is whole (a title, whole, is still).
    const holds = []
    boards.forEach((b, idx) => {
      if (b.kind === 'dark') return
      holds.push([b.twinkleFrom ?? b.from ?? b.at, b.until, b])
      const rand = rng(10 + idx)
      const lit = []
      b.grid.forEach((c, i) => { if (c !== ' ') lit.push(i) })
      const whole = b.kind === 'film' ? -Infinity : b.whole
      for (let k = Math.ceil((b.at - D0) / BEAT + 0.5); D0 + k * BEAT < whole - BEAT; k++) {
        if (k % 2 === 1 && lit.length && rand() < 0.8) {
          twitches[lit[Math.floor(rand() * lit.length)]].push(D0 + k * BEAT)
        }
      }
    })

    /* ── The twinkle, inside the holds ─────────────────────────────────── */

    const endAt = Array(N).fill(-9) // when each tile's last added flip finishes
    const put = (i, land, c, tag = 't') => {
      const s = Math.max(land - FLIP, endAt[i] + 0.01)
      events[i].push([s, c, tag])
      endAt[i] = s + FLIP
      return s + FLIP
    }
    // The ring: a tile beside a lit one, or directly above or below it.
    const near = (grid, i) => {
      const c = i % COLS
      const row = Math.floor(i / COLS)
      return (c > 0 && grid[i - 1] !== ' ') || (c < COLS - 1 && grid[i + 1] !== ' ')
        || (row > 0 && grid[i - COLS] !== ' ') || (row < ROWS - 1 && grid[i + COLS] !== ' ')
    }
    // A tile the twinkle must leave alone at t: the board's own letters, her
    // place while a clue surfaces, and the ring once the title is half there.
    const blocked = (b, i, t) => t - FLIP < (b.gone ?? Infinity) + 0.01 && (b.grid[i] !== ' ' || (b.clue && HID.has(i)) || (t >= (b.ringFrom ?? -Infinity) && near(b.grid, i)))
    const eighthsIn = (a, b) => {
      const out = []
      for (let k = Math.ceil((a - D0) / EIGHTH); D0 + k * EIGHTH < b; k++) out.push(D0 + k * EIGHTH)
      return out
    }
    if (O.twinkle) {
      // A tile at a time, on the eighths: off, it lights with a chance that
      // climbs with the music; lit, it changes letter or goes out. Quiet, a
      // few letters blink; at full, nearly every free tile is flashing.
      holds.forEach(([at, until, b], idx) => {
        const rand = rng(300 + idx)
        const hi = until - 0.3
        const ts = eighthsIn(at + 0.15 + FLIP, hi)
        for (let i = 0; i < N; i++) {
          let on = false
          for (const t of ts) {
            if (t - FLIP < endAt[i] + 0.01) continue
            const I = level(t)
            if (blocked(b, i, t) || blocked(b, i, t + EIGHTH)) { if (on) { put(i, t, ' '); on = false } continue }
            if (!on) {
              if (t + EIGHTH <= hi && rand() < 0.012 + 0.5 * I ** 1.6) { put(i, t, pickFor(rand, i)); on = true }
            } else if (t + EIGHTH > hi || rand() < 0.6 - 0.45 * I) { put(i, t, ' '); on = false }
            else if (rand() < 0.15 + 0.6 * I) put(i, t, pickFor(rand, i))
          }
          if (on) put(i, hi, ' ')
        }
      })
    }

    // With `dance`, the held board's own letters turn over onto themselves on
    // the eighths, a few at a time, so nothing on the sign is ever still. They
    // keep their colour.
    if (O.dance) {
      holds.forEach(([at, until, b], idx) => {
        const rand = rng(700 + idx)
        const lit = []
        b.grid.forEach((c, i) => { if (c !== ' ') lit.push(i) })
        if (!lit.length || b.kind === 'film') return
        for (const t of eighthsIn(b.at + FLIP + 0.15, Math.min(until, b.whole) - 0.3)) {
          for (const i of lit) if (rand() < 0.06 && t - FLIP >= endAt[i] + 0.01) put(i, t, b.grid[i], null)
        }
      })
    }

    // The ending: the board keeps spinning and the tiles die out until the last hit.
    const rand = rng(42)
    const order = []
    for (let i = 0; i < N; i++) if (i % COLS !== 0 && i % COLS !== COLS - 1) order.push(i)
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
    const death = Array(N).fill(sgtgAt + BEAT)
    order.forEach((i, j) => { death[i] = sgtgAt + 2 * BEAT + (LAST - sgtgAt - 2 * BEAT) * ((j + 1) / order.length) ** 0.8 })
    for (let i = 0; i < N; i++) {
      for (let t = sgtgAt + EIGHTH; t < death[i] - EIGHTH; t += EIGHTH) {
        if (rand() >= 0.35) continue
        let c = rand() > 0.3 ? ALPHA[Math.floor(rand() * ALPHA.length)] : ' '
        if (c === HID.get(i)) c = NOISE[Math.floor(rand() * NOISE.length)]
        events[i].push([t, c])
      }
      events[i].push([death[i], ' '])
    }
    for (const e of events) e.sort((a, b) => a[0] - b[0])

    // The bulbs, clockwise from the top left, and when each one dies.
    const bulbs = []
    for (let i = 0; i < 34; i++) bulbs.push([196 + i * 1208 / 33, 146])
    for (let j = 1; j < 14; j++) bulbs.push([1404, 146 + j * 39.1])
    for (let i = 33; i >= 0; i--) bulbs.push([196 + i * 1208 / 33, 694])
    for (let j = 13; j > 0; j--) bulbs.push([196, 146 + j * 39.1])
    const rb = rng(5)
    const bulbDeath = bulbs.map(() => sgtgAt + (LAST - sgtgAt) * rb() ** 0.7)
    bulbDeath[Math.floor(rb() * bulbs.length)] = LAST

    return { BEAT, BAR, D0, EIGHTH, bar, LAST, boards, sgtgS, sgtgAt, events, twitches, holds, clues, flashes, darks, bulbs, bulbDeath }
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
        case 'prechorus': return { state: (Math.floor(k / 2) + Math.floor((t - plan.D0) / plan.EIGHTH)) % 2 === 0 ? 'lit' : 'off', color: PINK, glow: 0 }
        case 'break': return { state: (Math.floor(k / 3) + Math.floor((t - plan.D0) / plan.BAR)) % 2 === 0 ? 'lit' : 'off', color: GOLD, glow: 0 }
        case 'chorus': return { state: 'lit', color: WHITE, glow: 0.6 + 0.4 * pulse }
        case 'chorus3': return { state: 'lit', color: WHITE, glow: 0.8 + 0.2 * pulse }
        default: return { state: hash(k * 7 + Math.floor(t / plan.EIGHTH)) < 0.55 ? 'lit' : 'off', color: PINK, glow: 0 }
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
      const st = flapAt(plan.events[i], plan.twitches[i], t)
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
        : held && t < held.at ? `The letters settling into ${held.title}${clue ? ', her name showing through in red' : ''}`
          : held && t >= (held.gone ?? Infinity) ? 'An empty marquee, letters blinking'
            : held && t >= (held.whole ?? Infinity) ? `${held.title}, coming apart`
              : held ? `The marquee reads ${held.title}`
                : t >= plan.sgtgS ? "Something's Got to Give, never finished, the letters dying out"
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
      hooks: p.boards.filter((b) => b.kind === 'hook').map((b) => b.from),
      drops: p.darks.map(([a]) => a),
      clues: p.clues.map(([a]) => a),
      sgtg: p.sgtgS,
      last: p.LAST,
    }
  }

  return { frame, moments, plan: planFor }
}

const BASE = marqueeFilm()
export const marqueeFrame = BASE.frame
export const marqueeMoments = BASE.moments

