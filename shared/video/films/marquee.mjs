/*
 * The Marquee — "Goodbye, Norma Jeane" as a picture-house letter board.
 *
 * One sign for the whole song, never cut away from. The film opens the way
 * Into the Wild's does: the band's mark drawn on black, then the title drawn
 * on in the live videos' Hairline capitals, then the black lifts off a dark
 * marquee. It turns over into NORMA JEANE as the voice comes in, then flips
 * through every film she made, in release order, cut to the song's sections,
 * and after the last one starts on Something's Got to Give, which never
 * finishes spelling. The letters keep spinning and die out one by one, and on
 * the record's last hit there is a hard cut to the mark on black.
 *
 * THE SCHEDULE (2026-11-02, as asked: "the board does more")
 *   - Verses: a title every four bars, landing on each sung phrase. NORMA
 *     JEANE holds the first four bars of verse 1.
 *   - Pre-choruses and breaks: a title every two bars.
 *   - The bar before each chorus (and before the first break) is where the
 *     record drops nearly out: the board flips blank and the bulbs go out.
 *     After the first pre-chorus the next title slams down all at once on the
 *     downbeat; before a chorus, the hook does.
 *   - Choruses answer the hook. GOODBYE turns over on "Goodbye", NORMA on
 *     "Norma", JEANE on "Jean"; a title on "I've been in love"; on "more,
 *     more, more" the board turns to MORE a row at a time, one row per word;
 *     a title on "I wanted you".
 *   - The third clue runs straight into the last chorus's GOODBYE.
 * These were placed from the score's words and from the record measured bar
 * by bar: the drop bars (19, 39, 69) are the quietest and least busy of their
 * sections, and the breaks are quieter than the verses.
 *
 * THE RULES
 *   - Every title lands on a downbeat. 95 BPM to a click; the score's beat is
 *     at 0.066, and the bar's strongest accent is the beat after it, so the bar
 *     starts at 0.698. NORMA JEANE lands on bar 8 (20.91, "Silver screen says
 *     Norma Jeane" at 20.92).
 *   - Red, on a board that has landed: at most one MARILYN MONROE's worth of
 *     letters (two M, N, O, R; one A, I, L, Y, E), letters in her hidden place
 *     first, then reading order.
 *   - Red, while the board is turning over: only a letter that sits in her
 *     hidden place — MARILYN on the top row and MONROE under it, from column 4.
 *     Three times the scramble lets the name show through: 3 letters, then 6,
 *     then 9, for a beat and a half each. Never all thirteen (confirmed
 *     2026-11-02: her name is never spelled).
 *   - Lights follow the song's sections, flash on every landing, and go out
 *     in the drop bars.
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

const COLS = 13
const ROWS = 3
const N = COLS * ROWS
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

const layout = (rows) => {
  const grid = []
  for (const row of rows) {
    const line = Array(COLS).fill(' ')
    const start = Math.floor((COLS - row.length) / 2)
    for (let i = 0; i < row.length; i++) line[start + i] = row[i]
    grid.push(...line)
  }
  return grid
}

/* Her hidden place: slot → letter. */
const HID = new Map()
;[...'MARILYN'].forEach((c, i) => HID.set(3 + i, c))
;[...'MONROE'].forEach((c, i) => HID.set(COLS + 3 + i, c))
const HKEYS = [...HID.keys()]

function redOf(grid) {
  const budget = {}
  for (const c of NAME) budget[c] = (budget[c] ?? 0) + 1
  const out = Array(N).fill(false)
  grid.forEach((c, i) => { if (HID.get(i) === c && budget[c] > 0) { budget[c]--; out[i] = true } })
  grid.forEach((c, i) => { if (!out[i] && NAME_SET.has(c) && budget[c] > 0) { budget[c]--; out[i] = true } })
  return out
}

/* The first word of a line that matches, sung after `after` seconds. */
function wordAt(score, re, after) {
  for (const l of score.lines) for (const w of l.words) if (w.t > after && re.test(w.text)) return w.t
  throw new Error(`marquee: no word ${re} after ${after}`)
}

/* ── The plan: every flap of every tile, worked out once ─────────────────── */

const cache = new WeakMap()

function planFor(score) {
  const hit = cache.get(score)
  if (hit) return hit

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

  /*
   * Turn the board from what it shows to `next`. `land(i)` is when tile i's
   * flap finishes on its new letter. From `S` until then the tile may flip
   * through noise on the eighths (a scramble); a slam has no noise and only
   * turns the tiles that change. With `quiet`, the noise stops for every
   * tile then, and a tile that lands later waits blank.
   */
  function turn(next, { S, land, clue = null, noise = true, final = true, quiet = Infinity }) {
    const prev = cur
    const rand = rng(seed++)
    const pick = (s) => s[Math.floor(rand() * s.length)]
    const slots = []
    for (let k = 0; k < Math.round((Math.max(...Array.from({ length: N }, (_, i) => land(i))) - S) / EIGHTH); k++) slots.push(S + k * EIGHTH)
    const ct = S + 2.5 * BEAT
    const ce = ct + 1.5 * BEAT
    if (clue) clues.push([ct, ce])
    for (let i = 0; i < N; i++) {
      const col = i % COLS
      const inHid = HID.has(i)
      const active = noise
        ? prev[i] !== ' ' || next[i] !== ' ' || (col >= 1 && col <= 11 && rand() < 0.3) || (clue && inHid)
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

  /* The landings. */
  const ripple = (L) => (i) => L - (1 - (i % COLS) / 12) * BEAT * 0.9
  const slam = (L) => () => L
  let films = 0
  const board = (grid, at, title, kind) => {
    boards.push({ at, grid, red: redOf(grid), title, kind })
    flashes.push(at)
  }
  /* A film title on bar m, its scramble `lead` beats long. */
  const title = (m, lead, extra = {}) => {
    const f = MARQUEE_FILMS[films++]
    const grid = layout(f.rows)
    const L = bar(m)
    boards.at(-1).S = L - lead * BEAT
    turn(grid, { S: L - lead * BEAT, land: lead ? ripple(L) : slam(L), noise: lead > 0, ...extra })
    board(grid, L, `${f.title} (${f.year})`, 'film')
  }
  /* The drop bar: everything flips blank on the downbeat, a quick ripple, and the bulbs go out. */
  const drop = (m) => {
    const D = bar(m)
    boards.at(-1).S = D
    turn(EMPTY, { S: D, land: (i) => D + FLIP + ((i % COLS) / 12) * BEAT * 0.4, noise: false })
    darks.push([D, bar(m + 1)])
    boards.push({ at: D, grid: EMPTY, red: redOf(EMPTY), title: '', kind: 'dark' })
  }
  /* The hook: GOODBYE on "Goodbye", NORMA on "Norma", JEANE on "Jean". */
  const HOOK = layout(['GOODBYE', 'NORMA JEANE', ''])
  const hook = (C, extra = {}) => {
    const g = wordAt(score, /^Goodbye/, C - 1)
    const n = wordAt(score, /^Norma/, g)
    const j = wordAt(score, /^Jean/, n)
    const land = (i) => {
      const row = Math.floor(i / COLS)
      const col = i % COLS
      return row === 1 && HOOK[i] !== ' ' ? (col <= 5 ? n : j) : g
    }
    if (boards.at(-1).kind !== 'dark') boards.at(-1).S = extra.S
    turn(HOOK, { S: extra.S ?? g - FLIP, land, noise: !!extra.S, quiet: g, ...extra })
    board(HOOK, j, 'GOODBYE, NORMA JEANE', 'hook')
    flashes.push(g, n)
  }
  /* "more, more, more": a row to MORE on each word. */
  const MORE = layout(['MORE', 'MORE', 'MORE'])
  const more = (C) => {
    const m1 = wordAt(score, /^more/, bar(C + 4))
    const m2 = wordAt(score, /^more/, m1)
    const m3 = wordAt(score, /^more/, m2)
    const at = [m1, m2, m3]
    boards.at(-1).S = m1 - FLIP
    turn(MORE, { S: m1 - FLIP, land: (i) => at[Math.floor(i / COLS)] + (i % COLS) * 0.012, noise: false })
    board(MORE, m3, 'MORE MORE MORE', 'more')
    flashes.push(m1, m2)
  }

  // The opening: the board starts turning over as the black lifts, NORMA JEANE on bar 8.
  const NJ = layout(['', 'NORMA JEANE', ''])
  turn(NJ, { S: bar(5), land: ripple(bar(8)) })
  board(NJ, bar(8), 'NORMA JEANE', 'name')

  // Verse 1 and the first pre-chorus.
  title(12, 6)
  title(16, 4)
  title(18, 4)
  drop(19)
  // Break 1: the next title slams down on the downbeat, then one every two bars.
  title(20, 0)
  title(22, 4)
  title(24, 4)
  title(26, 4)
  // Verse 2, the first clue, pre-chorus 2.
  title(28, 4)
  title(32, 6, { clue: CLUE_1 })
  title(36, 4)
  title(38, 4)
  drop(39)
  // Chorus 1.
  hook(bar(40))
  title(42, 2)
  more(40)
  title(47, 4)
  // Break 2.
  title(50, 6)
  title(52, 4)
  title(54, 4)
  title(56, 4)
  // Verse 3, the second clue, pre-chorus 3.
  title(58, 4)
  title(62, 6, { clue: CLUE_2 })
  title(66, 6)
  title(68, 4)
  drop(69)
  // Chorus 2.
  hook(bar(70))
  title(72, 2)
  more(70)
  title(77, 4)
  // Break 3, and the third clue straight into the last chorus.
  title(80, 6)
  title(82, 4)
  title(84, 4)
  hook(bar(86), { S: bar(86) - 6 * BEAT, clue: CLUE_3 })
  title(88, 2)
  more(86)
  title(93, 4)
  title(95, 4)
  if (films !== MARQUEE_FILMS.length) throw new Error(`marquee: ${films} of ${MARQUEE_FILMS.length} films scheduled`)

  // Something's Got to Give: it starts to spell and never finishes.
  const sgtgAt = bar(98)
  boards.at(-1).S = sgtgAt - 6 * BEAT
  turn(layout(["SOMETHING'S", 'GOT TO', 'GIVE']), { S: sgtgAt - 6 * BEAT, land: ripple(sgtgAt), final: false })

  // The holds, and a tile twitching half a flip on the backbeat in each.
  const holds = []
  boards.forEach((b, idx) => {
    const until = b.S ?? sgtgAt - 6 * BEAT
    if (b.kind === 'dark') return
    holds.push([b.at, until, b])
    const rand = rng(10 + idx)
    const lit = []
    b.grid.forEach((c, i) => { if (c !== ' ') lit.push(i) })
    for (let k = Math.ceil((b.at - D0) / BEAT + 0.5); D0 + k * BEAT < until - BEAT; k++) {
      if (k % 2 === 1 && lit.length && rand() < 0.8) twitches[lit[Math.floor(rand() * lit.length)]].push(D0 + k * BEAT)
    }
  })

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

  const plan = { BEAT, BAR, D0, EIGHTH, bar, LAST, boards, sgtgAt, events, twitches, holds, clues, flashes, darks, bulbs, bulbDeath }
  cache.set(score, plan)
  return plan
}

/* ── Drawing ─────────────────────────────────────────────────────────────── */

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

function tileAt(plan, i, t) {
  const ev = plan.events[i]
  const k = lastIndex(ev, t)
  const [tc, cur] = ev[k]
  const prev = k > 0 ? ev[k - 1][1] : ' '
  const p = (t - tc) / FLIP
  if (p >= 0 && p < 1) return { letter: p < 0.5 ? prev : cur, sy: Math.abs(1 - 2 * p), moving: true }
  for (const tw of plan.twitches[i]) {
    const q = (t - tw) / 0.3
    if (q >= 0 && q < 1) return { letter: cur, sy: 1 - 0.45 * Math.sin(q * Math.PI), moving: true }
  }
  return { letter: cur, sy: 1, moving: false }
}

const sectionKind = (score, t) => {
  const s = score.sections.find((x) => t >= x.from && t < x.to) ?? score.sections.at(-1)
  if (s.id === 'chorus-3') return 'chorus3'
  return s.kind
}

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

/* ── The frame ───────────────────────────────────────────────────────────── */

export function marqueeFrame({ time, score, lockup = '', uid = 'marquee' }) {
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
  const pitch = w / COLS; const tw = pitch - 8; const rh = h / ROWS; const th = rh - 14
  const fs = Math.round(th * 0.7)
  const tiles = []
  for (let i = 0; i < N; i++) {
    const row = Math.floor(i / COLS); const c = i % COLS
    const x = x0 + c * pitch + 4; const y = y0 + row * rh + 7
    const { letter, sy, moving } = tileAt(plan, i, t)
    let red = false
    if (letter !== ' ') red = held && held.grid[i] === letter ? held.red[i] : HID.get(i) === letter
    tiles.push(`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(tw)}" height="${f1(th)}" fill="none" stroke="${INK}" stroke-width="2"/>`)
    if (letter !== ' ' || moving) {
      const cy = y + th / 2
      tiles.push(`<g transform="translate(0 ${f1(cy)}) scale(1 ${Math.max(sy, 0.02).toFixed(3)}) translate(0 ${f1(-cy)})">`)
      if (moving) tiles.push(`<rect x="${f1(x + 1)}" y="${f1(y + 1)}" width="${f1(tw - 2)}" height="${f1(th - 2)}" fill="${FLAP}"/>`)
      if (letter !== ' ') tiles.push(`<text x="${f1(x + tw / 2)}" y="${f1(y + th * 0.76)}" font-size="${fs}" font-weight="700" fill="${red ? RED : INK}" text-anchor="middle">${esc(letter)}</text>`)
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
  const bandText = dark ? '' : 'NOW SHOWING · SILVER SCREEN'
  const lyric = esc(lyricAt(score, t).toUpperCase())

  const svg = `<rect width="1600" height="900" fill="${PAPER}"/>
<rect x="24" y="24" width="1552" height="796" rx="5" fill="none" stroke="#d9cfb9" stroke-width="3"/>
<rect x="34" y="34" width="1532" height="776" fill="${INK}"/>
<g transform="translate(800 422) scale(1.18) translate(-800 -422)">
<rect x="170" y="120" width="1260" height="600" fill="${PAPER}"/>
<rect x="222" y="172" width="1156" height="496" fill="none" stroke="${INK}" stroke-width="3"/>
<rect x="230" y="180" width="1140" height="480" fill="none" stroke="${INK}" stroke-width="1"/>
<rect x="230" y="180" width="1140" height="46" fill="${band}"/>
<text x="800" y="215" font-size="28" font-weight="700" fill="${INK}" text-anchor="middle" letter-spacing="6">${bandText}</text>
${tiles.join('')}${bulbs.join('')}</g>
<text x="800" y="867" font-size="33" font-weight="700" fill="${INK}" text-anchor="middle">${lyric}</text>
${openingSvg(t, uid)}`

  const clue = plan.clues.some(([a, b]) => t >= a && t < b)
  const out = plan.darks.some(([a, b]) => t >= a && t < b)
  const label = t < MARQUEE_OPENING.reveal[1] ? 'Opening'
    : t < plan.boards[0].at ? 'An empty marquee, turning over'
      : held ? `The marquee reads ${held.title}`
        : t >= plan.sgtgAt ? "Something's Got to Give, never finished, the letters dying out"
          : clue ? 'The letters turning over, her name showing through in red'
            : out ? 'The marquee goes dark' : 'The letters turning over'
  return { svg, label }
}

/** Seconds of silence an export holds on the end card after the record (mp4.mjs reads it). */
marqueeFrame.hold = 4

/** When things happen, for the page's jump list. */
export function marqueeMoments(score) {
  const p = planFor(score)
  return {
    nj: p.boards[0].at,
    titles: p.boards.filter((b) => b.kind === 'film').map((b) => ({ at: b.at, title: b.title })),
    hooks: p.boards.filter((b) => b.kind === 'hook').map((b) => b.at),
    mores: p.boards.filter((b) => b.kind === 'more').map((b) => b.at),
    drops: p.darks.map(([a]) => a),
    clues: p.clues.map(([a]) => a),
    sgtg: p.sgtgAt,
    last: p.LAST,
  }
}
