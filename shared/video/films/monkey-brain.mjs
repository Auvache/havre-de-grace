/*
 * Meet Me at the Horizon · Monkey Brain — the film (2026-11-10).
 *
 * A sleep lab's chart of one night: the head from above with the nineteen
 * electrodes of the 10–20 layout, and under it the hypnogram, the strip that
 * says how deep he is. His mind is a red dot that hangs under an electrode by
 * one arm and swings to another on every word he sings, hand over hand, the
 * way a gibbon crosses a canopy. Every swing leaves its arc in pencil, so the
 * head fills with the night's scribble, thickest where he thought most.
 *
 * Where he swings is what the line is about: the front of the head for the
 * arguing and the worrying ("No, I don't need a friend" shakes the head, side
 * to side), the back for everything seen (the sky, the dark, the dawn), the
 * sides for everything heard (the call, the creak, the wind), the middle for
 * the body (the bed, the skin, the spine: straight down the midline), and the
 * three behind the crown for her.
 *
 * The strip is the second actor. The paper runs under a pen that stays put,
 * straight under the head, at one speed all night. Awake, the pen kicks on
 * every word, so the WAKE line is rough; in every real silence in the singing
 * (measured: the intro and six gaps) the dot's arm lets out, it sinks towards
 * the strip, the pen slips to N1 and N2 — and the next word snatches both back:
 * a spike on the strip, a shake of the head.
 *
 * The WAKE line is the horizon. On "meet me at the horizon" the dot stops
 * swinging, goes to the crown and lets itself down on one long arm until it
 * hangs a finger above the pen; the thought of her does not jolt him, the pen
 * comes back up gently and the line under it is smooth. The first time his own
 * "No" tears him away. The last time, through the last held "oh", the gap
 * closes: the dot meets the pen on the horizon, lets go of the head, and the
 * two go down together, N1, N2, N3, while the dawn comes up behind the line.
 *
 * Inks: the album's paper, black and red, and the song's dawn gold, which
 * shows in each chorus a little higher and fills the outro.
 *
 * A pure function of the score's clock. The night is planned once per score
 * (planOf): the pen's steps, every swing with the point it really started
 * from, and the strip's vertices. rng(seed) only; ids namespaced with uid.
 */
import { rng, r, clamp01, lerp, easeInOut, easeOut, ramp } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, SECOND_INK, paper, marginLyric, easeCamera } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'

const GOLD = SECOND_INK['meet-me-at-the-horizon']
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const PR = PX + PW
const PB = PY + PH
const PENCIL = '#4a443a'

/** The held last "oh" lets go here (meetMeAtTheHorizonScore.ts header). */
const VOICE_END = 194.9
/** A line's last word is taken to ring this long past its onset. */
const HOLD = 0.55

/* ── The chart ────────────────────────────────────────────────────── */

const HEAD = { x: 800, y: 336, r: 270 }
const ER = 19
const ELEC = [
  ['Fp1', -0.31, -0.95], ['Fp2', 0.31, -0.95], ['F7', -0.81, -0.59], ['F3', -0.4, -0.5], ['Fz', 0, -0.42], ['F4', 0.4, -0.5], ['F8', 0.81, -0.59],
  ['T3', -0.97, 0], ['C3', -0.48, 0], ['Cz', 0, 0], ['C4', 0.48, 0], ['T4', 0.97, 0],
  ['T5', -0.81, 0.59], ['P3', -0.4, 0.5], ['Pz', 0, 0.42], ['P4', 0.4, 0.5], ['T6', 0.81, 0.59], ['O1', -0.31, 0.95], ['O2', 0.31, 0.95],
].map(([n, x, y]) => ({ n, x: HEAD.x + x * HEAD.r * 0.84, y: HEAD.y + y * HEAD.r * 0.84 }))
const E = Object.fromEntries(ELEC.map((e, i) => [e.n, i]))
const ids = (names) => names.split(' ').map((n) => E[n])

/** What a line is about is where he swings. */
const REGION = {
  F: ids('Fp1 Fp2 F7 F3 Fz F4 F8'), // arguing, worrying, wondering
  B: ids('O1 O2 T5 T6 Pz'), // everything seen: sky, dark, light, dawn
  S: ids('T3 T4 F7 F8 T5 T6'), // everything heard
  L: ids('T3 F7 T5'),
  R: ids('T4 F8 T6'),
  M: ids('C3 Cz C4 Fz Pz'), // the body
  Y: ids('P3 Pz P4'), // her
  A: ELEC.map((_, i) => i), // anywhere: the mind running
}

/*
 * Every line, word by word: a region letter (pick an electrode there), an
 * electrode by name, or '-' for no swing. `n*X` repeats. Words past the end
 * of a spec take its last entry. Choruses and repeats share a spec.
 */
const NO = 'F7 F F F F F F8 F F F F F'
const SUN = 'B'
const DARK = 'B'
const ASLEEP = 'S S S S B'
const NEXT = 'M M M M M Y Y Y Y Y Y Y P4 -'
const SPEC = [
  NO, // No, I don't need a friend. No, I don't need a lover — the head shaken, side to side
  'B', // Some nights the darkness is sweeter than others
  'F F F F F C3 Cz C4', // Just me and my thoughts, no counting sheep — counted along the row
  'B B B B B M M M M Cz', // When the absence of light doesn't mean that I sleep
  'M M M M M F F F B B O2', // I lie in my bed and I think of the sky
  'F', // And I wonder what happens right after we die
  'F', // Should I be afraid, will my troubles end
  'F3 C3 C4 F4 F3 C3 C4 F4', // Does the whole process repeat again and again — the same square, twice
  SUN, DARK, ASLEEP, NEXT,
  'L L L L L R', // Do I call you first or wait for you to call — one side, then the other
  'M', // Fever kicks in and my skin starts to crawl
  'F F F F Cz Fz Fp1 Fp2', // Unnatural tension in my brain and my eyes — the two over the eyes
  'F F F F F Fz Cz - Pz', // And the headache evolves when I straighten my spine — down the midline
  'M M M M M A', // My blood runs too thick and my mind runs too deep
  'S', // And the room breaks the silence when the house starts to creak
  'B B B B S', // The windows are open to let in the wind
  'B', // Oh, I could be the sky if I could only give in
  SUN, DARK, ASLEEP, NEXT,
  'Pz -', '-', '-', // Meet me at the horizon / Oh won't you / Meet me at the horizon
  NO,
  'B', // Some nights the darkness cuts deeper than others
  'F F F F F M M M M Cz', // Just me and my thoughts in that bed all alone
  'B', // When the dawning of day brings a sliver of hope
  SUN, DARK,
  'S S S S M M M Cz', // The whole world's asleep, that is except me
  'M M M M Y Y Y Y Y Y Y P3 -', // And I lie here and miss the way things used to be, so
  'Pz -', '-', '-',
].map((s) => s.split(' '))

/** The words a heavy chorus does not swing on. */
const LIGHT = new Set("the to a of and it's so i can like is in that too whole here then".split(' '))

/** How he moves, by where the song is. `far`: how much he prefers the long reach. */
const MOODS = {
  restless: { name: 'Wide awake', dur: 0.3, big: 0.48, sag: 0.36, sway: 0.5, tick: 4, kick: 0, cool: 2.2, fade: 2.5, far: 0.3 },
  wild: { name: 'Fever', dur: 0.25, big: 0.4, sag: 0.3, sway: 0.85, tick: 7, kick: 1.5, cool: 5, fade: 4.5, far: 1 },
  heavy: { name: 'Heavy', dur: 0.72, big: 0.85, sag: 0.56, sway: 0.32, tick: 2.5, kick: 0, cool: 3, fade: 3, far: 0.5 },
  tired: { name: 'Worn out', dur: 0.36, big: 0.56, sag: 0.46, sway: 0.4, tick: 4, kick: 0, cool: 2.4, fade: 2.5, far: 0.3 },
  reaching: { name: 'Reaching', dur: 1.2, big: 1.2, sag: 0.3, sway: 0.25, tick: 0, kick: 0, cool: 3, fade: 3, far: 0 },
}
const MOOD_OF = {
  'verse-1': 'restless', 'verse-2': 'restless', 'chorus-1': 'heavy', 'verse-3': 'wild', 'verse-4': 'wild',
  'chorus-2': 'heavy', 'hook-1': 'reaching', 'verse-5': 'tired', 'chorus-3': 'heavy', 'hook-2': 'reaching',
}

/* ── The strip ────────────────────────────────────────────────────── */

const STAGES = ['WAKE', 'N1', 'N2', 'N3']
const ROW = [672, 702, 732, 762]
/** The pen: fixed, straight under the head. The paper runs left under it at K units a second. */
const PEN_X = HEAD.x
const K = 3.55
/** How close the dot hangs over the pen when it is reaching for it. */
const FINGER = 17
/** The arm, at rest. */
const ARM = 30
/** How far the arm lets out in an ordinary silence, at most. */
const SLACK = 150

const memoStore = new WeakMap()
const sectionAt = (score, t) => score.sections.find((s) => t >= s.from && t < s.to) ?? score.sections.at(-1)
const sectionOf = (score, id) => score.sections.find((s) => s.id === id)
const beatAfter = (score, t) => {
  const beat = 60 / (score.bpm ?? 55)
  return (score.beatPhase ?? 0) + Math.ceil((t - (score.beatPhase ?? 0)) / beat) * beat
}

/** The last entry of a sorted list whose `t` is ≤ now, by bisection; -1 if none. */
function lastAt(list, now, key = 't') {
  let lo = 0
  let hi = list.length - 1
  let out = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (list[mid][key] <= now) { out = mid; lo = mid + 1 } else hi = mid - 1
  }
  return out
}

/*
 * The silences, from the measured words: the intro, every gap between one
 * line's release and the next line's first word, and the outro. Inside a line
 * nothing counts — the voice is holding a note or taking a breath.
 */
function gapsFor(score) {
  const L = score.lines
  const out = [{ kind: 'intro', from: 0, to: L[0].start, next: L[0] }]
  for (let i = 0; i < L.length; i++) {
    const last = i === L.length - 1
    const from = last ? Math.max(VOICE_END, L[i].end + HOLD) : Math.min(L[i].end + HOLD, L[i + 1].start)
    out.push({ kind: last ? 'outro' : 'gap', from, to: last ? Infinity : L[i + 1].start, next: L[i + 1] ?? null })
  }
  return out
}

function planOf(score) {
  let plan = memoStore.get(score)
  if (plan) return plan
  const gaps = gapsFor(score)
  const kindOf = (line) => sectionOf(score, line.section)?.kind
  const isHook = (line) => line && ['bridge', 'coda'].includes(kindOf(line))

  /* The pen's steps: down in a silence, back up on the next word — hard, or gently for a hook line. */
  const steps = [] // { t, to, dur, hard }
  const jolts = [] // { t, amp }
  const stageNow = () => (steps.length ? steps.at(-1).to : 0)
  const step = (t, to, dur, hard = false) => steps.push({ t, to, dur, hard })
  for (const g of gaps) {
    if (g.kind === 'intro') {
      step(5, 1, 0.5)
      step(12.6, 2, 0.5)
    }
    else if (g.kind === 'gap' && g.to - g.from >= 1) {
      if (g.from + 0.8 < g.to - 0.2) step(g.from + 0.8, 1, 0.4)
      if (g.from + 1.7 < g.to - 0.25) step(g.from + 1.7, 2, 0.4)
    }
    if (g.kind !== 'outro' && stageNow() !== 0) {
      const soft = isHook(g.next)
      if (!soft) jolts.push({ t: g.to, amp: stageNow() === 2 ? 1 : 0.6 })
      step(g.to, 0, soft ? 0.7 : 0.07, !soft)
    }
  }
  /* The outro: down a stage every four beats of the click, the first one a breath after the voice. */
  const beat = 60 / (score.bpm ?? 55)
  const down = beatAfter(score, VOICE_END + 3.6)
  const lastHit = score.endCardAt ?? score.duration
  const sleeps = [down, down + 4 * beat, Math.min(down + 8 * beat, lastHit - 3.4)]
  sleeps.forEach((t, i) => step(t, i + 1, 0.6))
  // Each step starts from wherever the pen is.
  let y = ROW[0]
  for (const s of steps) {
    s.y0 = y
    s.y1 = ROW[s.to]
    y = s.y1
  }

  /* The swings. */
  const words = []
  const hops = []
  const g = rng(7)
  const dist = (a, b) => Math.hypot(ELEC[a].x - ELEC[b].x, ELEC[a].y - ELEC[b].y)
  let at = E.Cz
  let prev = -1
  const pick = (token, mood, big, room) => {
    if (token in E) return E[token]
    let pool = REGION[token].filter((i) => i !== at && (REGION[token].length < 4 || i !== prev))
    // Only as far as there is time to swing before the next word.
    const within = pool.filter((i) => dist(i, at) / 1350 <= room * 0.88)
    if (within.length) pool = within
    else return [...pool].sort((a, b) => dist(a, at) - dist(b, at))[0]
    // The long reach: on a line's first swing, and most of the time when he is wild.
    if ((big || g() < mood.far) && pool.length > 2) {
      const sorted = [...pool].sort((a, b) => dist(b, at) - dist(a, at))
      return sorted[Math.floor(g() * Math.min(2, sorted.length))]
    }
    return pool[Math.floor(g() * pool.length)]
  }
  score.lines.forEach((line, li) => {
    const spec = SPEC[li] ?? ['A']
    const kind = kindOf(line)
    const mood = MOODS[MOOD_OF[line.section] ?? 'restless']
    const hook = isHook(line)
    let swung = -9
    line.words.forEach((w, i) => {
      const first = i === 0
      if (!hook) words.push({ t: w.t, h: mood.tick * (first ? 2 : 1) })
      const token = spec[Math.min(i, spec.length - 1)]
      if (token === '-') return
      const next = line.words[i + 1]
      if (!(token in E)) {
        // A chorus is heavy: only the words that carry weight, and never two swings close together.
        if (kind === 'chorus' && (LIGHT.has(w.text.toLowerCase().replace(/[^a-z']/g, '')) || w.t - swung < 0.4)) return
        // A pickup too quick to swing on is let go by.
        if (kind !== 'chorus' && !first && next && next.t - w.t < 0.2) return
      }
      const big = swung < 0
      const to = pick(token, mood, big, next ? next.t - w.t : 2)
      if (to === at) return
      hops.push({ t: w.t, from: at, to, big, mood, line: li, hook })
      swung = w.t
      prev = at
      at = to
    })
  })
  hops.forEach((h, i) => {
    const next = hops[i + 1]
    const room = next ? next.t - h.t : 9
    // As long as the mood says, longer for a long reach (he is never faster than the eye), never into the next word.
    const reach = Math.hypot(ELEC[h.to].x - ELEC[h.from].x, ELEC[h.to].y - ELEC[h.from].y)
    h.dur = Math.max(0.16, Math.min(Math.max(h.big ? h.mood.big : h.mood.dur, reach / 1350), room * 0.88))
    h.end = h.t + h.dur
  })

  /* The hooks: when he lets himself down, and when the gap closes for good. */
  const reaches = score.lines.filter((l) => isHook(l)).reduce((out, l) => {
    const sec = sectionOf(score, l.section)
    let rch = out.find((x) => x.section === sec.id)
    if (!rch) {
      const verseAfter = score.lines.find((n) => n.start > l.start && !isHook(n))
      out.push((rch = { section: sec.id, lines: [], until: verseAfter ? verseAfter.start : Infinity }))
    }
    rch.lines.push(l)
    return out
  }, [])
  for (const rch of reaches) {
    const [first, oh] = rch.lines
    rch.from = first.words.at(-1).t - 0.1 // "horizon"
    rch.oh = oh.words[0].t
    rch.wont = oh.words[1]?.t ?? rch.oh + 3.4
    rch.bobs = oh.words.slice(1).map((w) => w.t)
  }
  const last = reaches.at(-1)
  const finalOh = score.lines.at(-1).words.at(-1).t
  const meet = { from: finalOh, at: VOICE_END }

  plan = { gaps, steps, jolts, words, hops, reaches, last, meet, sleeps, lastHit }
  // A silence usually ends in a swing, which takes the slack up. Where it does not, the arm is drawn in gently.
  for (const gap of gaps) gap.caught = hops.some((h) => Math.abs(h.t - gap.to) < 0.01)

  // Where each swing really starts: where he was hanging, slack and sway and all.
  hops.forEach((h, i) => {
    const B = ELEC[h.to]
    const [x0, y0] = i === 0 ? hangAt(plan, null, h.t - 1e-4) : posAt(plan, h.t - 1e-4, i - 1)
    const jolted = plan.jolts.some((j) => Math.abs(j.t - h.t) < 0.01)
    h.jolt = jolted
    h.p0 = [x0, y0]
    h.p1 = [B.x, B.y + armAt(plan, h.end, B)]
    const d = Math.hypot(h.p1[0] - x0, h.p1[1] - y0)
    // A swing sags under the branch; a snatch does not have the time to.
    let sag = h.jolt ? 0.08 * d : h.mood.sag * d + 14
    // Never out through the side of the head (the hooks' long arm apart): let the sag out until it fits.
    const inside = (x, y, edge = 12) => Math.hypot(x - HEAD.x, y - HEAD.y) < HEAD.r - edge
    if (!h.jolt && inside(x0, y0, 2) && inside(h.p1[0], h.p1[1], 2)) {
      for (let n = 0; n < 12; n++) {
        const cy = (y0 + h.p1[1]) / 2 + sag
        const cx = (x0 + h.p1[0]) / 2
        let ok = true
        for (const e of [0.3, 0.5, 0.7]) {
          const x = (1 - e) ** 2 * x0 + 2 * (1 - e) * e * cx + e * e * h.p1[0]
          const y = (1 - e) ** 2 * y0 + 2 * (1 - e) * e * cy + e * e * h.p1[1]
          if (!inside(x, y)) ok = false
        }
        if (ok) break
        sag *= 0.72
      }
    }
    h.c = [(x0 + h.p1[0]) / 2, (y0 + h.p1[1]) / 2 + sag]
    h.sway = h.mood.sway * Math.sign(h.p1[0] - x0 || 1) * Math.min(1, d / 220) * (h.jolt ? 1.4 : 1)
    h.dir = d > 1 ? [(h.p1[0] - x0) / d, (h.p1[1] - y0) / d] : [0, 0]
    h.d = `M${r(x0, 1)} ${r(y0, 1)}Q${r(h.c[0], 1)} ${r(h.c[1], 1)} ${r(h.p1[0], 1)} ${r(h.p1[1], 1)}`
  })

  /* How often each electrode has been caught by the time of each swing: its ring thickens with use. */
  const tally = ELEC.map(() => 0)
  hops.forEach((h) => {
    tally[h.to]++
    h.tally = [...tally]
  })
  plan.most = Math.max(...tally)
  /* Lights out, in the outro: the electrodes go quiet front to back, one to a felt beat. */
  const order = ELEC.map((e, i) => i).sort((a, b) => ELEC[a].y - ELEC[b].y || ELEC[a].x - ELEC[b].x)
  const quietFrom = plan.meet.at + 2.2
  const each = Math.min(beat / 2, (lastHit - 2.2 - quietFrom) / ELEC.length)
  plan.quiet = ELEC.map((_, i) => quietFrom + order.indexOf(i) * each)

  /* The scribble, in chunks: every finished swing, oldest first. */
  plan.pencil = chunked(hops.map((h) => (h.jolt ? '' : h.d))) // a snatch leaves no arc

  /* The strip's trace, in the paper's own coordinates (x = t·K): rough where he is awake. */
  const times = new Set()
  const add = (t) => { if (t >= 0 && t <= lastHit + 0.5) times.add(Math.round(t * 1000) / 1000) }
  add(0)
  for (const w of words) [0, 0.03, 0.12].forEach((o) => add(w.t + o))
  for (const s of steps) for (let k = 0; k <= 6; k++) add(s.t + (s.dur * k) / 6)
  for (const j of jolts) [0.07, 0.1, 0.14, 0.2, 0.3, 0.45, 0.7].forEach((o) => add(j.t + o))
  plan.verts = [...times].sort((a, b) => a - b).map((t) => ({ t, s: `L${r(t * K, 1)} ${r(penAt(plan, t), 1)}` }))
  plan.verts[0].s = 'M' + plan.verts[0].s.slice(1)
  plan.trace = chunked(plan.verts.map((v) => v.s))

  memoStore.set(score, plan)
  return plan
}

/** Strings joined up to any count without rebuilding the lot each frame. */
function chunked(parts, size = 32) {
  const prefix = ['']
  for (let i = size; i <= parts.length; i += size) prefix.push(prefix.at(-1) + parts.slice(i - size, i).join(''))
  return (count) => {
    const k = Math.floor(count / size)
    return prefix[k] + parts.slice(k * size, count).join('')
  }
}

/* ── The pen ──────────────────────────────────────────────────────── */

/** The pen's height without its kicks: the stage, eased between rows. */
function penBase(plan, t) {
  const i = lastAt(plan.steps, t)
  if (i < 0) return ROW[0]
  const s = plan.steps[i]
  const u = clamp01((t - s.t) / s.dur)
  return lerp(s.y0, s.y1, s.hard ? easeOut(u) : easeCamera(u))
}

/** The stage being scored, 0 WAKE – 3 N3. */
function stageAt(plan, t) {
  const i = lastAt(plan.steps, t)
  return i < 0 ? 0 : plan.steps[i].to
}

/** The pen, kicks and all: a tick on every word while he is awake, a spike when he is snatched back. */
function penAt(plan, t) {
  let y = penBase(plan, t)
  const wi = lastAt(plan.words, t)
  for (let i = wi; i >= 0 && t - plan.words[i].t < 0.13; i--) {
    const a = t - plan.words[i].t
    y -= plan.words[i].h * (a < 0.03 ? a / 0.03 : Math.max(0, 1 - (a - 0.03) / 0.09))
  }
  for (const j of plan.jolts) {
    const a = t - j.t
    if (a < 0 || a > 1.2) continue
    y -= 20 * j.amp * (a < 0.07 ? a / 0.07 : Math.exp(-(a - 0.07) / 0.13))
  }
  return y
}

/* ── The dot ──────────────────────────────────────────────────────── */

/** How far he has let go, 0–1: only in a silence. */
function slackAt(plan, t) {
  const g = plan.gaps.find((x) => t >= x.from && t < x.to)
  if (!g) {
    const before = plan.gaps.find((x) => !x.caught && t >= x.to && t < x.to + 0.6)
    return before ? slackIn(before, before.to - 1e-4) * (1 - easeInOut((t - before.to) / 0.6)) : 0
  }
  return slackIn(g, t)
}
function slackIn(g, t) {
  if (g.kind === 'outro') return 0
  if (g.kind === 'intro') return 0.85 * easeInOut(ramp(t, 3, 15.5))
  return easeInOut(ramp(t - g.from, 0.45, 2.3))
}

/** How far he has let himself down towards the pen on a hook, 0–1, and how wide the gap left is. */
function reachAt(plan, t) {
  const rch = plan.reaches.findLast((x) => t >= x.from && t < x.until)
  if (!rch) return { k: 0, gap: FINGER }
  const k = 0.45 * easeCamera(ramp(t, rch.from, rch.oh)) + 0.55 * easeCamera(ramp(t, rch.oh, rch.wont - 0.15))
  // "Won't you": two small pulls at the arm, towards it.
  let gap = FINGER
  for (const b of rch.bobs) if (t >= b) gap -= 6 * Math.exp(-(t - b) / 0.22) * Math.sin(Math.min(1, (t - b) / 0.12) * Math.PI / 2)
  // The last held "oh": the gap closes.
  if (rch === plan.last) gap *= 1 - easeCamera(ramp(t, plan.meet.from, plan.meet.at))
  return { k, gap }
}

/** The arm's length under electrode B at t. */
function armAt(plan, t, B) {
  const { k, gap } = reachAt(plan, t)
  const full = penBase(plan, t) - gap - B.y
  const slack = slackAt(plan, t)
  return Math.max(ARM + slack * Math.min(SLACK, Math.max(0, full - ARM)), lerp(ARM, full, k))
}

/** Hanging under hop h's electrode (h null: under Cz, before the first word). */
function hangAt(plan, h, t) {
  const B = ELEC[h ? h.to : E.Cz]
  const L = armAt(plan, t, B)
  const tau = h ? t - h.end : 99
  const catching = h ? h.sway * Math.exp(-tau / 0.42) * Math.sin((2 * Math.PI * tau) / 0.62) : 0
  // Left alone he turns slowly on the arm, two beats a swing.
  const idle = 0.11 * Math.max(slackAt(plan, t), 0.25 * reachAt(plan, t).k) * Math.sin((2 * Math.PI * t) / 2.18)
  const th = catching * Math.min(1, 60 / L) + idle * Math.min(1, 110 / L)
  return [B.x + L * Math.sin(th), B.y + L * Math.cos(th)]
}

/** Where the dot is. `upto` limits the search to the first hops, for planning. */
function posAt(plan, t, upto = plan.hops.length - 1) {
  if (t >= plan.meet.at) return [PEN_X, penAt(plan, t)]
  let i = lastAt(plan.hops, t)
  if (i > upto) i = upto
  if (i < 0) return hangAt(plan, null, t)
  const h = plan.hops[i]
  if (t < h.end && h.p0) {
    const u = (t - h.t) / h.dur
    const e = h.jolt ? easeOut(u) : easeCamera(u)
    return bez(h, e)
  }
  return hangAt(plan, h, t)
}
const bez = (h, e) => [
  (1 - e) ** 2 * h.p0[0] + 2 * (1 - e) * e * h.c[0] + e * e * h.p1[0],
  (1 - e) ** 2 * h.p0[1] + 2 * (1 - e) * e * h.c[1] + e * e * h.p1[1],
]

/** The dawn, 0–1: each chorus lifts it a little higher and lets it fall back; from the last hook it stays. */
function dawnAt(score, t) {
  let d = 0
  const peaks = { 'chorus-1': 0.24, 'chorus-2': 0.38, 'chorus-3': 0.54 }
  for (const [id, peak] of Object.entries(peaks)) {
    const s = sectionOf(score, id)
    if (!s) continue
    d = Math.max(d, peak * easeInOut(ramp(t, s.from - 1, s.from + 6)) * (1 - 0.85 * easeInOut(ramp(t, s.to - 2, s.to + 7))))
  }
  const hook = sectionOf(score, 'hook-2')
  if (hook) d = Math.max(d, easeInOut(ramp(t, hook.from + 4, VOICE_END + 15)))
  return d
}

/** 23:30 at the first frame, ten past six at the last: where the hours fall on the strip. */
const HOURS = (score) => {
  const out = []
  for (let hour = 0; hour <= 6; hour++) out.push({ t: ((hour * 60 + 30) * score.duration) / 400, label: `${hour}:00` })
  return out
}

/* ── The plate ────────────────────────────────────────────────────── */

const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${size}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}>${text}</text>`

const HEAD_SVG = (() => {
  const { x, y, r: hr } = HEAD
  return `<g fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"><circle cx="${x}" cy="${y}" r="${hr}"/>` +
    `<path d="M${x - 20} ${y - hr + 1}L${x} ${y - hr - 25}L${x + 20} ${y - hr + 1}"/>` +
    `<ellipse cx="${x - hr - 10}" cy="${y}" rx="11" ry="36"/><ellipse cx="${x + hr + 10}" cy="${y}" rx="11" ry="36"/></g>`
})()

export function monkeyBrainPlate({ time, score, uid }) {
  const t = time
  const plan = planOf(score)
  const { hops } = plan
  const dawn = dawnAt(score, t)
  const met = t >= plan.meet.at
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>`

  /* The dawn, behind the horizon. */
  if (dawn > 0.005) {
    const id = `${uid}-dawn`
    const rad = 190 + 600 * dawn
    out += `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${PEN_X}" cy="${ROW[0]}" r="${r(rad)}"><stop offset="0" stop-color="${GOLD}" stop-opacity="1"/><stop offset="0.3" stop-color="${GOLD}" stop-opacity="0.62"/><stop offset="0.65" stop-color="${GOLD}" stop-opacity="0.2"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient></defs>` +
      `<rect x="${PX}" y="${PY}" width="${PW}" height="${ROW[0] - PY}" fill="url(#${id})" opacity="${r(Math.min(1, dawn * 2.2) * 0.62, 3)}"/>`
  }

  /* The strip: its rows, its hours, the trace, the pen. */
  const shift = PEN_X - t * K
  let rows = ''
  STAGES.forEach((s, i) => {
    rows += `<path d="M${PX} ${ROW[i]}H${PR - 92}" stroke="${INK}" stroke-width="${i ? 1 : 1.6}" opacity="${i ? 0.2 : 0.75}"/>`
    rows += txt(PR - 26, ROW[i] + 5, 14.5, s, { weight: 600, spacing: 1.5, anchor: 'end', opacity: 0.75 })
  })
  let hours = ''
  for (const h of HOURS(score)) {
    const x = h.t * K + shift
    if (x < PX - 30 || x > PR - 20) continue
    hours += `<path d="M${r(x, 1)} ${ROW[3] + 9}v8" stroke="${INK}" stroke-width="1" opacity="0.5"/>` + txt(x, ROW[3] + 35, 14, h.label, { anchor: 'middle', opacity: 0.6, spacing: 1 })
  }
  const vi = lastAt(plan.verts, t) + 1
  const penY = penAt(plan, t)
  const trace = `<path d="${plan.trace(vi)}L${r(t * K, 2)} ${r(penY, 1)}" transform="translate(${r(shift, 2)} 0)" fill="none" stroke="${RED}" stroke-width="1.7" stroke-linejoin="round"/>`
  out += rows + hours + trace

  /* The head, which shakes when he is snatched back and shivers under a wild catch. */
  let kx = 0
  let ky = 0
  for (const j of plan.jolts) {
    const a = t - j.t
    if (a < 0 || a > 0.9) continue
    const e = 7 * j.amp * Math.exp(-a / 0.16)
    kx += e * Math.sin(a * 46)
    ky -= e * Math.cos(a * 39) * 0.6
  }
  const hi = lastAt(hops, t)
  for (let i = hi; i >= 0 && t - hops[i].end < 0.5; i--) {
    const h = hops[i]
    const a = t - h.end
    if (a < 0 || !h.mood.kick) continue
    const e = h.mood.kick * Math.exp(-a / 0.09) * Math.cos(a * 34)
    kx += e * h.dir[0]
    ky += e * h.dir[1]
  }
  // Startled: every ring jumps with him.
  let startle = 0
  for (const j of plan.jolts) if (t >= j.t && t < j.t + 0.6) startle += 3.2 * j.amp * Math.exp(-(t - j.t) / 0.11)
  const sleepHead = easeInOut(ramp(t, plan.meet.at + 1, plan.lastHit - 1.5))
  let head = ''
  if (sleepHead > 0.005) head += `<circle cx="${HEAD.x}" cy="${HEAD.y}" r="${HEAD.r}" fill="${GOLD}" opacity="${r(0.3 * sleepHead, 3)}"/>`
  head += HEAD_SVG

  // The night's scribble: every finished swing, in pencil.
  const done = hi < 0 ? 0 : t >= hops[hi].end ? hi + 1 : hi
  if (done > 0) head += `<path d="${plan.pencil(done)}" fill="none" stroke="${PENCIL}" stroke-width="1.15" opacity="0.3"/>`

  // The swings still warm, and the one in the air.
  let red = ''
  for (let i = hi; i >= 0; i--) {
    const h = hops[i]
    const age = t - h.t
    if (age > h.dur + h.mood.fade) { if (age > 8) break; continue }
    if (age >= h.dur) {
      red += `<path d="${h.d}" stroke-width="${h.big ? 2.8 : 2}" opacity="${r(0.85 * (1 - (age - h.dur) / h.mood.fade) ** 1.6, 3)}"/>`
      continue
    }
    const e = h.jolt ? easeOut(age / h.dur) : easeCamera(age / h.dur)
    const [x, y] = bez(h, e)
    const qx = lerp(h.p0[0], h.c[0], e)
    const qy = lerp(h.p0[1], h.c[1], e)
    red += `<path d="M${r(h.p0[0], 1)} ${r(h.p0[1], 1)}Q${r(qx, 1)} ${r(qy, 1)} ${r(x, 1)} ${r(y, 1)}" stroke-width="${h.big ? 2.8 : 2}" opacity="0.9"/>`
  }
  if (red) head += `<g fill="none" stroke="${RED}" stroke-linecap="round">${red}</g>`

  // The arms: one hand on the branch he is leaving, the other on the one he is catching.
  const [dx, dy] = posAt(plan, t)
  let arms = ''
  const arm = (B, o, from = 0) => {
    if (o <= 0.01) return
    arms += `<path d="M${r(lerp(B.x, dx, from), 1)} ${r(lerp(B.y, dy, from), 1)}L${r(dx, 1)} ${r(dy, 1)}" opacity="${r(o, 3)}"/>`
  }
  const cur = hi >= 0 ? hops[hi] : null
  if (!met) {
    if (cur && t < cur.end) {
      const u = (t - cur.t) / cur.dur
      if (!cur.jolt) arm(ELEC[cur.from], 1 - ramp(u, 0.3, 0.62))
      arm(ELEC[cur.to], ramp(u, 0.45, 0.8))
    }
    else arm(ELEC[cur ? cur.to : E.Cz], 1)
  }
  else {
    // Met: the arm lets go of the head and comes down after him.
    const go = easeInOut(ramp(t, plan.meet.at + 0.5, plan.meet.at + 2.6))
    if (cur) arm(ELEC[cur.to], 1 - 0.4 * go, go)
  }
  if (arms) head += `<g fill="none" stroke="${RED}" stroke-width="1.8" stroke-linecap="round">${arms}</g>`

  // The electrodes, warm where he has just been.
  const heat = ELEC.map(() => 0)
  for (let i = hi; i >= 0; i--) {
    const h = hops[i]
    const a = t - h.end
    if (a < 0) continue
    if (a > 22) break
    heat[h.to] = Math.min(1, heat[h.to] + Math.exp(-a / h.mood.cool))
  }
  let rings = ''
  let warm = ''
  let names = ''
  const tally = done > 0 ? hops[done - 1].tally : null
  ELEC.forEach((e, i) => {
    const pop = startle + (cur && cur.to === i && t >= cur.end ? 2.5 * Math.exp(-(t - cur.end) / 0.12) : 0)
    const quiet = met ? 1 - 0.62 * easeInOut(ramp(t, plan.quiet[i], plan.quiet[i] + 0.7)) : 1
    const o = quiet < 0.999 ? ` opacity="${r(quiet, 3)}"` : ''
    const sw = 1.5 + 2.1 * (tally ? Math.min(1, tally[i] / (plan.most * 0.8)) : 0)
    rings += `<circle cx="${r(e.x, 1)}" cy="${r(e.y, 1)}" r="${r(ER + pop, 1)}" stroke-width="${r(sw, 2)}"${o}/>`
    if (heat[i] > 0.02) warm += `<circle cx="${r(e.x, 1)}" cy="${r(e.y, 1)}" r="${r(ER + pop, 1)}" opacity="${r(heat[i] * 0.8, 3)}"/>`
    names += `<text x="${r(e.x, 1)}" y="${r(e.y + 4.9, 1)}"${heat[i] > 0.5 ? ' fill="#fff6e6"' : ''}${o}>${e.n}</text>`
  })
  head += `<g fill="#f4eddc" stroke="${INK}">${rings}</g><g fill="${RED}">${warm}</g>` +
    `<g font-size="14" font-weight="600" text-anchor="middle" fill="${INK}">${names}</g>`

  // The dot: the thought. Asleep it breathes, slower and smaller.
  const asleep = met ? easeInOut(ramp(t, plan.sleeps[0], plan.sleeps[2] + 2)) : 0
  const breath = met ? 0.5 + 0.5 * Math.sin((2 * Math.PI * (t - plan.meet.at)) / 4.36 - Math.PI / 2) : 0
  const rad = 10 - 2.2 * asleep + 1.4 * asleep * breath
  const dot = `<circle cx="${r(dx, 1)}" cy="${r(dy, 1)}" r="${r(rad, 2)}" fill="${RED}"${asleep > 0.01 ? ` opacity="${r(1 - 0.3 * asleep * (1 - breath), 3)}"` : ''}/>`
  // The pen, until the dot is it.
  const pen = met ? '' : `<circle cx="${PEN_X}" cy="${r(penY, 1)}" r="4.5" fill="${RED}"/>`

  out += pen + `<g${Math.abs(kx) + Math.abs(ky) > 0.05 ? ` transform="translate(${r(kx, 2)} ${r(ky, 2)})"` : ''}>${head}${dot}</g>`
  return out
}

/** What he is doing, for the "Now" line (a page can pass `(t) => monkeyBrainStateAt(score, t)` as the player's status). */
export const monkeyBrainStateAt = (score, t) => (inOpening(t) || t >= (score.endCardAt ?? Infinity) ? '' : stateAt(score, t))
function stateAt(score, t) {
  const plan = planOf(score)
  if (t >= plan.meet.at) return ['Met', 'N1', 'N2', 'Asleep'][stageAt(plan, t)]
  const stage = stageAt(plan, t)
  if (stage > 0) return `Drifting · ${STAGES[stage]}`
  if (reachAt(plan, t).k > 0.05) return 'Reaching'
  const mood = MOOD_OF[sectionAt(score, t).id]
  return mood ? MOODS[mood].name : 'Lights out'
}

/* ── The film ─────────────────────────────────────────────────────── */

export function monkeyBrainFrame({ time, score, lockup = '', uid = 'monkey' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const clip = `${uid}-plate`
  return {
    label: inOpening(time) ? 'Opening' : `${sectionAt(score, time).label} · ${stateAt(score, time)}`,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${monkeyBrainPlate({ time, score, uid })}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${filmOpening({ time, uid, slug: 'meet-me-at-the-horizon' })}`,
  }
}

/** The frame held before play: verse 4, the head hot and the scribble thick. */
export const MONKEY_BRAIN_POSTER = 99.9

export const MONKEY_BRAIN_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 12, label: 'Lights out' },
  { at: 17, label: 'No', key: true },
  { at: 35, label: 'The sky' },
  { at: 52, label: 'First light' },
  { at: 69, label: 'Drifting' },
  { at: 72, label: 'Snatched back', key: true },
  { at: 76.5, label: 'Fever' },
  { at: 106.5, label: 'Second light' },
  { at: 124, label: 'Meet me at the horizon', key: true },
  { at: 140, label: 'No, again', key: true },
  { at: 159, label: 'Third light' },
  { at: 177, label: 'Reaching' },
  { at: 190, label: 'They meet', key: true },
  { at: 198, label: 'Going under' },
]
