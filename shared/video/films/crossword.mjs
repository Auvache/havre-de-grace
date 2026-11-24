/*
 * Ivory · The Crossword — the film (2026-11-13; the whole lyric, 2026-11-23).
 *
 * A large blank crossword on a charcoal ground, filled in as the song goes:
 * every word he sings, each from the moment he sings it, every letter drawn
 * on stroke by stroke the way the opening draws the title. The puzzle is nine
 * blocks, two lines of the lyric each; the camera pans to a block, holds
 * still while its lines go in, then pans smoothly on. Every "Ivory" writes an
 * IVORY, in red; there are seven in the grid and no frame ever holds two
 * written ones. The blocks snake up, down and up the sheet, and at the end
 * the camera pulls back to the whole of it, filled.
 *
 * The interlude has no words, so nothing is written: a red butterfly (her
 * eyes are "blue butterfly wings"; red is hers) is drawn on beside her name,
 * lifts off, and the camera follows it in one slow glide over the squares the
 * bridge will fill. It settles on the five blank squares of her next name,
 * stays while he sings that he could be the one, and is gone when he forgets
 * how to breathe; then he writes IVORY where it sat.
 *
 *   crossword/stations.mjs   the stations (where the camera goes, what is
 *                            written there) and how the grid is searched for
 *   crossword/layout.mjs     the grid, baked by
 *                            tools/video-styles/crossword/bake-layout.mjs
 *   crossword/letters.mjs    the alphabet, baked by
 *                            tools/video-styles/titles/bake-letters.mjs
 *   tools/video-styles/crossword/check.mjs   walks the film for the rules
 *
 * A word starts on its measured onset and is written at 3.5 letters a second,
 * hers too. Moves are cosine-eased; between them the camera is still.
 *
 * Notes: docs/visualizers/ivory.md.
 */
import { r, rng, clamp01, ramp, lerp, easeInOut } from '../kit.mjs'
import { COVER_SHEET, INK, RED, marginLyric, easeCamera } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'
import { LETTERS } from './crossword/letters.mjs'
import { LAYOUT } from './crossword/layout.mjs'
import { STATIONS, CELL, assemble, shotsOf, boxOf, viewOf, key } from './crossword/stations.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2
const PENCIL = '#7a7262'
/*
 * The ground (the user, 2026-11-23): "dark charcoal black with a very slight
 * chalky texture". The whole sheet, border and plate, is charcoal; the puzzle's
 * squares stay paper, so the charcoal between its words reads as a real
 * crossword's black squares. The lyric in the margin is chalk.
 */
const CHARCOAL = '#1f1e1c'
const PLATE_MARK = '#34322e'
const CHALK = '#e6e1d6'
const CELL_PAPER = '#f6f1e6'
const BODY_RED = '#6d1f16'
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

const GRID = assemble(LAYOUT.map(([word, c, r, down, station, line, wi, rides]) => ({ word, c, r, down, station, line, wi, rides: rides === 1 })))
const clean = (s) => s.replace(/[^a-z]/gi, '').toUpperCase()

/* ── The plan ─────────────────────────────────────────────────────── */

function buildPlan(score) {
  const step = 1 / LETTERS_PER_SECOND
  const beat = 60 / score.bpm

  /*
   * Every entry's write: from the word's own onset, a letter every `step`.
   * (Until 2026-11-23 a word waited when three were already being written;
   * with every word of the lyric on the board that would run a fast line a
   * second late, and the user asked for each to start when it is sung.)
   */
  const writes = GRID.entries.map((e, i) => {
    const hit = score.lines[e.line]?.words[e.wi]
    if (!hit || clean(hit.text) !== e.word) throw new Error(`crossword: "${e.word}" is not word ${e.wi} of line ${e.line}`)
    return { i, entry: e, start: hit.t, step, end: hit.t + e.word.length * step, hers: e.word === 'IVORY' }
  })

  // The camera: a held view per shot, cosine moves between them.
  const shots = shotsOf(GRID.entries).map((sh) => {
    const ws = sh.entries.map((i) => writes[i])
    return { ...sh, from: Math.min(...ws.map((w) => w.start)), to: Math.max(...ws.map((w) => w.end)) }
  })
  const keys = [] // [t, view]
  shots.forEach((sh, k) => {
    if (k === 0) { keys.push([0, sh.view]); return }
    const prev = shots[k - 1]
    const st = STATIONS[sh.station]
    /*
     * The station's move, unless the words before it are still being
     * written: then it waits for them and keeps at least 1.8 s, arriving late
     * rather than quickly. A station sung straight on from the last one
     * (`through`) cannot wait: its move is as given, and the words written
     * during it are placed where both frames see them.
     */
    const a = st.through ? st.pan[0] : Math.max(st.pan[0], prev.to + 0.15)
    const b = st.through ? st.pan[1] : Math.max(st.pan[1], a + 1.8)
    keys.push([a, keys.at(-1)[1]], [b, sh.view])
    prev.leave = a
    sh.arrive = b
  })
  shots[0].arrive = CLOCK.reveal[1]

  /*
   * Letters: a square is written by whichever word reaches it first, except
   * that her squares wait for her, so her name always goes in whole. Red is
   * her name and nothing else. (A one-letter word that rides on another
   * word's square is simply the first to reach it.)
   */
  const letters = new Map()
  for (const w of writes) {
    w.entry.cells.forEach(([c, rr], j) => {
      const k = key(c, rr)
      const hers = GRID.ivories.has(k)
      if (hers && !w.hers) return
      const at = w.start + j * w.step
      const had = letters.get(k)
      if (had && had.at <= at) return
      letters.set(k, { at, dur: w.step * 1.8, ch: w.entry.word[j], red: hers, station: w.entry.station })
    })
  }
  // When each station's last letter is down: from then on it is drawn as one group.
  const doneAt = STATIONS.map(() => 0)
  for (const L of letters.values()) doneAt[L.station] = Math.max(doneAt[L.station], L.at + L.dur)

  // The end: back to the whole puzzle, done.
  const all = viewOf(boxOf([...GRID.cells.keys()].map((k) => k.split(',').map(Number)), 1.5), 0.1, 1)
  const last = shots.at(-1).to
  keys.push([last + 0.8, keys.at(-1)[1]], [Math.min(last + 5.2, (score.endCardAt ?? score.duration) - 0.6), all])

  const plan = { beat, writes, letters, doneAt, keys, shots }
  plan.butterfly = flightOf(plan, score)
  return plan
}

/* ── The butterfly ────────────────────────────────────────────────── */

/*
 * The interlude (the user, 2026-11-23: no more writing her name over and
 * over; "something cool/interesting that fits the vibe"). In song seconds:
 * drawn on in the black square after her fourth name as that "Ivory" dies
 * away, off on a beat, fifteen seconds over the board to the five blank
 * squares of her fifth, there through the bridge, and gone on "forgot how to
 * breathe, oh" (137.36), four seconds before he writes her name where it sat.
 */
const FLIGHT = { draw: [111.25, 112.25], off: 112.36, land: 127.0, leave: 137.4, gone: 140.6 }
const WINGSPAN = 2.1 * CELL
/* How hard it leans towards where it is bound, in cells a second: its wandering is about this fast, so it is seldom turned right round. */
const LEAN = 3

function flightOf(plan, score) {
  const hers = plan.writes.filter((w) => w.hers).sort((a, b) => a.start - b.start)
  const last = hers.findLast((w) => w.start < FLIGHT.off)
  const next = hers.find((w) => w.start > FLIGHT.land)
  if (!last || !next) return null
  // From: the black square at one end of her name (there always is one), whichever is nearer the middle of the frame. To: the middle of her next name's blank squares.
  const e = last.entry
  const cam0 = cameraAt(plan, FLIGHT.off)
  const from = [-1, 5].map((q) => [(e.c + (e.down ? 0 : q) + 0.5) * CELL, (e.r + (e.down ? q : 0) + 0.5) * CELL])
    .sort((p, q) => Math.hypot(p[0] - cam0.x, (p[1] - cam0.y) * 2) - Math.hypot(q[0] - cam0.x, (q[1] - cam0.y) * 2))[0]
  const [mc, mr] = next.entry.cells[2]
  const to = [(mc + 0.5) * CELL, (mr + 0.5) * CELL]
  const cam1 = cameraAt(plan, FLIGHT.land)
  const far = Math.hypot(to[0] - from[0], to[1] - from[1])
  return { from, to, bound: [(to[0] - from[0]) / far, (to[1] - from[1]) / far], r0: [from[0] - cam0.x, from[1] - cam0.y], r1: [to[0] - cam1.x, to[1] - cam1.y], beat0: score.beatPhase, beat: plan.beat }
}

/** Where it is on the board at `time` (world units), or null when it is not there. */
function butterflyPoint(plan, time) {
  const F = plan.butterfly
  if (time <= FLIGHT.off) return F.from
  if (time < FLIGHT.land) {
    /*
     * In flight it is placed against the camera, not the board: from where it
     * sat in the first frame to where it lands in the last, drawn towards the
     * middle on the way and wandering, so it can never leave the frame.
     */
    const u = (time - FLIGHT.off) / (FLIGHT.land - FLIGHT.off)
    const e = easeInOut(u)
    const env = Math.sin(Math.PI * u) ** 1.5
    const pull = 1 - 0.5 * Math.sin(Math.PI * u)
    const bob = 0.2 * Math.sin((2 * Math.PI * (time - F.beat0)) / F.beat)
    const wx = (2.4 * Math.sin(2 * Math.PI * (2.5 * u + 0.1)) + 1.1 * Math.sin(2 * Math.PI * (5.3 * u + 0.32))) * env
    const wy = (1.25 * Math.sin(2 * Math.PI * (3.5 * u + 0.3)) + 0.65 * Math.sin(2 * Math.PI * 6.7 * u) + bob) * env
    const cam = cameraAt(plan, time)
    return [cam.x + lerp(F.r0[0], F.r1[0], e) * pull + wx * CELL, cam.y + lerp(F.r0[1], F.r1[1], e) * pull + wy * CELL]
  }
  if (time <= FLIGHT.leave) return F.to
  // Away: up and off the sheet, never straight.
  const u = (time - FLIGHT.leave) / (FLIGHT.gone - FLIGHT.leave)
  const e = u * u * (3 - 2 * u) * 0.35 + u * u * 0.65
  return [F.to[0] + (9 * e + 1.3 * Math.sin(2 * Math.PI * 1.6 * u) * u) * CELL, F.to[1] - (17 * e + 0.9 * Math.sin(2 * Math.PI * 2.3 * u + 1) * u) * CELL]
}

/** The butterfly at `time`: { x, y, turn (degrees, 0 = heading up the sheet), open (its wings, 0 shut to 1 flat), drawn (0 to 1) }, or null. */
export function butterflyAt(plan, time) {
  const F = plan.butterfly
  if (!F || time < FLIGHT.draw[0] || time >= FLIGHT.gone) return null
  const [x, y] = butterflyPoint(plan, time)
  /*
   * It heads the way it is going, more or less: its speed over half a second
   * either side (weighted to now), leaning towards where it is bound, so that
   * where its path doubles back it swings round instead of flipping. Sitting,
   * it has a way it sits, and turns between the two as it slows.
   */
  let vx = 0
  let vy = 0
  for (let k = -4; k <= 4; k++) {
    const w = Math.exp(-(k * k) / 8)
    const [ax, ay] = butterflyPoint(plan, time + k * 0.11 - 0.05)
    const [bx, by] = butterflyPoint(plan, time + k * 0.11 + 0.05)
    vx += (w * (bx - ax)) / 0.1 / CELL
    vy += (w * (by - ay)) / 0.1 / CELL
  }
  vx /= 5.6
  vy /= 5.6
  const away = time >= FLIGHT.leave
  const bound = away ? [0.47, -0.88] : F.bound
  const going = (Math.atan2(vy + bound[1] * LEAN, vx + bound[0] * LEAN) * 180) / Math.PI + 90
  const sits = time < (FLIGHT.off + FLIGHT.land) / 2 ? 24 : -32
  // (By the clock, not by its speed: in the air it is wholly its heading, so the turn between the two never has to choose a way round.)
  const moving = away ? clamp01((time - FLIGHT.leave) / 0.7) : Math.min(clamp01((time - FLIGHT.off) / 0.9), clamp01((FLIGHT.land - time) / 1.1))
  let turn = sits + (((going - sits + 540) % 360) - 180) * easeInOut(moving)
  // Wings: two beats to a flap in the air, a slow breath when it sits.
  const flying = Math.min(clamp01((time - FLIGHT.off) / 0.5), clamp01((FLIGHT.land + 0.35 - time) / 0.6)) + clamp01((time - FLIGHT.leave) / 0.4)
  const phase = (time - F.beat0) / F.beat
  const flap = 0.2 + 0.8 * (0.5 + 0.5 * Math.cos(2 * Math.PI * phase * 2)) ** 1.25
  const rest = 0.8 + 0.2 * Math.cos((2 * Math.PI * phase) / 4)
  const open = lerp(rest, flap, clamp01(flying))
  // In the air it banks a little with every bob.
  turn += 7 * Math.sin(2 * Math.PI * phase) * clamp01(flying)
  return { x, y, turn, open, drawn: clamp01((time - FLIGHT.draw[0]) / (FLIGHT.draw[1] - FLIGHT.draw[0])) }
}

/* Seen from above, head up the sheet, in a box about 110 across: the right wings (the left are their mirror), body, feelers. */
const WING = [
  'M3 -8C8 -22 30 -47 52 -45C59 -44 59 -34 55 -24C50 -13 38 -5 5 -1Z',
  'M5 0C22 -2 43 4 43 18C43 31 31 41 20 37C12 34 6 22 3 10Z',
]
const VEINS = 'M5 -6L48 -39M6 -4L53 -27M7 -2L42 -10M7 3L39 14M6 6L27 33'
const BODY = 'M0 -15C3.2 -10 3 12 0 21C-3 12 -3.2 -10 0 -15Z'
const FEELERS = 'M1 -14Q5 -29 15 -37M-1 -14Q-5 -29 -15 -37'

/** Drawn like a letter: its outline first, stroke by stroke, then the red comes up in the wings. */
export function butterflySvg(b) {
  const k = WINGSPAN / 110
  const inked = easeInOut(clamp01((b.drawn - 0.55) / 0.45))
  const pen = (i, n) => {
    const a = clamp01(b.drawn / 0.7 * n - i)
    return a >= 1 ? '' : ` pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${r(1 - easeInOut(a), 4)}"`
  }
  const side = (sx) => `<g transform="scale(${r(sx * b.open, 4)} 1)">` +
    WING.map((d, i) => `<path d="${d}" fill="${RED}" fill-opacity="${r(inked, 3)}" stroke="${RED}" stroke-width="2" stroke-linejoin="round"${pen(i, 3)}/>`).join('') +
    (inked > 0.01 ? `<path d="${VEINS}" fill="none" stroke="${CELL_PAPER}" stroke-width="1.1" stroke-linecap="round" opacity="${r(0.5 * inked, 3)}"/>` : '') + '</g>'
  return `<g transform="translate(${r(b.x, 2)} ${r(b.y, 2)}) rotate(${r(b.turn, 2)}) scale(${r(k, 4)})">${side(1)}${side(-1)}` +
    `<path d="${FEELERS}" fill="none" stroke="${RED}" stroke-width="1.7" stroke-linecap="round"${pen(2, 3)}/>` +
    `<path d="${BODY}" fill="${BODY_RED}" opacity="${r(clamp01(b.drawn / 0.4), 3)}"/></g>`
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

const letterAt = (c, rr) => `translate(${r((c + 0.5) * CELL, 2)} ${r((rr + 0.5) * CELL + CAP / 2, 2)}) scale(${r(GLYPH, 5)})`

/*
 * Everything that does not change from frame to frame, parsed once: the
 * alphabet, the ground, the squares, and each station's letters as one group
 * (`…-st3`), which a frame uses once that station is fully written. Without
 * the groups the last pull-back would re-parse eight hundred letters sixty
 * times a second.
 */
function libFor(plan, ns) {
  plan.libs ??= new Map()
  if (plan.libs.has(ns)) return plan.libs.get(ns)
  let squares = ''
  let nums = ''
  for (const k of GRID.cells.keys()) {
    const [c, rr] = k.split(',').map(Number)
    squares += sq(c, rr)
    const n = GRID.numbers.get(k)
    if (n) nums += `<text x="${c * CELL + 5}" y="${rr * CELL + 15}">${n}</text>`
  }
  const glyphs = Object.entries(LETTERS).map(([ch, L]) => `<path id="${ns}-g${ch}" d="${L.d}"/>`).join('')
  const groups = STATIONS.map(() => ['', ''])
  for (const [k, L] of plan.letters) {
    const [c, rr] = k.split(',').map(Number)
    groups[L.station][L.red ? 1 : 0] += `<use href="#${ns}-g${L.ch}" transform="${letterAt(c, rr)}"/>`
  }
  const done = groups.map(([ink, red], si) => `<g id="${ns}-st${si}"><g fill="${INK}">${ink}</g><g fill="${RED}">${red}</g></g>`).join('')
  const lib = `<defs>${glyphs}${chalkDefs(ns)}<g id="${ns}-paper"><path d="${squares}" fill="${CELL_PAPER}"/></g>` +
    `<g id="${ns}-rules"><path d="${squares}" fill="none" stroke="${INK}" stroke-width="2"/><g font-size="12.5" font-weight="500" fill="${PENCIL}">${nums}</g></g>${done}</defs>`
  plan.libs.set(ns, lib)
  return lib
}

/*
 * Chalk dust: two tiles of faint specks and scuffs at sizes that share no
 * factor, so the repeat never shows, and a few broad smudges where a hand
 * wiped the board. Deterministic, and in `lib`, so it is parsed once.
 */
function chalkTile(id, size, n, seed) {
  const rand = rng(seed)
  let dots = ''
  let scuffs = ''
  for (let i = 0; i < n; i++) {
    const x = rand() * size
    const y = rand() * size
    const big = rand()
    dots += `<circle cx="${r(x, 1)}" cy="${r(y, 1)}" r="${r(0.35 + big * big * 0.9, 2)}" opacity="${r(0.025 + rand() * 0.07, 3)}"/>`
  }
  for (let i = 0; i < n / 9; i++) {
    const x = rand() * size
    const y = rand() * size
    const a = -0.5 + rand() * 0.6
    const l = 2 + rand() * 7
    scuffs += `M${r(x, 1)} ${r(y, 1)}l${r(Math.cos(a) * l, 1)} ${r(Math.sin(a) * l, 1)}`
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><g fill="#fff">${dots}</g>` +
    `<path d="${scuffs}" stroke="#fff" stroke-width="0.8" stroke-linecap="round" opacity="0.05"/></pattern>`
}
function chalkDefs(ns) {
  const rand = rng(404)
  let smudges = ''
  for (let i = 0; i < 7; i++) {
    const cx = 120 + rand() * 1360
    const cy = 80 + rand() * 740
    smudges += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(180 + rand() * 260)}" ry="${r(70 + rand() * 120)}" transform="rotate(${r(-18 + rand() * 30, 1)} ${r(cx)} ${r(cy)})" fill="url(#${ns}-smudge)" opacity="${r(0.5 + rand() * 0.5, 2)}"/>`
  }
  return chalkTile(`${ns}-chalkA`, 211, 300, 17) + chalkTile(`${ns}-chalkB`, 347, 520, 29) +
    `<radialGradient id="${ns}-smudge"><stop offset="0" stop-color="#fff" stop-opacity="0.045"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
    `<g id="${ns}-ground"><rect width="1600" height="900" fill="${CHARCOAL}"/>${smudges}` +
    `<rect width="1600" height="900" fill="url(#${ns}-chalkA)"/><rect width="1600" height="900" fill="url(#${ns}-chalkB)"/></g>`
}

/** The charcoal sheet and its plate mark (the album's `paper()`, in the dark). */
const ground = (ns) => {
  const { x, y, w, h } = COVER_SHEET.plate
  return `<use href="#${ns}-ground"/><rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="5" fill="none" stroke="${PLATE_MARK}" stroke-width="3"/>`
}

function letterSvg(c, rr, ch, a, ns, fill) {
  const at = letterAt(c, rr)
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
  let done = ''
  let ink = ''
  let red = ''
  plan.doneAt.forEach((t, si) => { if (t && time >= t) done += `<use href="#${ns}-st${si}"/>` })
  for (const [k, L] of plan.letters) {
    if (time < L.at || time >= plan.doneAt[L.station]) continue
    const [c, rr] = k.split(',').map(Number)
    const s = letterSvg(c, rr, L.ch, clamp01((time - L.at) / L.dur), ns, L.red ? RED : INK)
    if (L.red) red += s
    else ink += s
  }
  const b = butterflyAt(plan, time)

  return `<g transform="translate(${r(CX - cam.x * cam.s, 2)} ${r(CY - cam.y * cam.s, 2)}) scale(${r(cam.s, 5)})"><use href="#${ns}-paper"/><use href="#${ns}-rules"/>${done}${ink}${red}${b ? butterflySvg(b) : ''}</g>`
}

/** The film: the opening, the sheet, the puzzle, the lyric in the margin, the end card. */
export function crosswordFrame({ time, score, lockup = '', uid = 'xw' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const ns = `${uid}-xw`
  const plan = planFor(score)
  const writing = plan.writes.filter((w) => time >= w.start && time < w.end + 0.3).map((w) => w.entry.word)
  const label = inOpening(time, CLOCK) ? 'Opening' : writing.length ? writing.join(' + ') : time >= FLIGHT.off && time < FLIGHT.land ? 'The butterfly' : 'Moving on'
  return {
    label,
    lib: [libFor(plan, ns)],
    svg: `<defs><clipPath id="${ns}-plate"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${ground(ns)}
<g clip-path="url(#${ns}-plate)">${crosswordPlate({ time, score, ns })}</g>
${marginLyric({ now: time, score: plan.lyric, uid: ns, sheet: COVER_SHEET, fill: CHALK })}
${filmOpening({ time, uid: ns, slug: 'ivory', clock: CLOCK })}`,
  }
}

/** For checking: the plan (every write, letter and camera key) and the camera at a time. */
export const crosswordPlan = (score) => planFor(score)
export const crosswordCamera = (score, time) => cameraAt(planFor(score), time)
export const crosswordButterfly = (score, time) => butterflyAt(planFor(score), time)
export { FLIGHT as CROSSWORD_FLIGHT }

/** The page's jump-to list. What each is: docs/visualizers/ivory.md. */
export const CROSSWORD_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 9, label: 'First words' },
  { at: 26.8, label: 'Her eyes' },
  { at: 40.2, label: 'Ivory', key: true },
  { at: 45.5, label: 'California' },
  { at: 54.0, label: 'Ivory again' },
  { at: 63.8, label: 'Flowers in her hair' },
  { at: 82, label: 'Beside her' },
  { at: 95.2, label: 'Ivory, third', key: true },
  { at: 100.4, label: 'Paradise' },
  { at: 109.0, label: 'Ivory, fourth' },
  { at: 111.0, label: 'The butterfly', key: true },
  { at: 126.0, label: 'It lands on her name' },
  { at: 128.0, label: 'Adam to her Eve' },
  { at: 136.4, label: 'It goes', key: true },
  { at: 140.8, label: 'Ivory, fifth' },
  { at: 146.0, label: 'The last chorus' },
  { at: 164.0, label: 'Ivory, sixth' },
  { at: 172.8, label: 'The last Ivory', key: true },
  { at: 175.6, label: 'The whole puzzle', key: true },
]
