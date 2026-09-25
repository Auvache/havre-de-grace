/*
 * Gallery — "Conman" as a wall of pictures, every one of them being torn up.
 *
 * Track 2 of the album (app/config/albumStyle.ts). The song is about how being
 * inspired by other musicians is a kind of theft, and how that is not a bad
 * thing: everybody takes from everybody, and if you are lucky somebody takes
 * from you. So the film is an endless salon wall of framed pictures — stencil
 * portraits (shared/video/portraits.mjs) and still lifes of instruments,
 * costumes and pages of music (shared/video/still-lifes.mjs) — and the camera
 * moves along it while pieces are torn out of them on the words.
 *
 * THE RULES
 *
 *   - Nobody tears. There is no hand and no thief: a piece cracks, lifts and
 *     flies, and the hole it leaves stays for the rest of the song.
 *   - Red is the journey, as on every film on the album: the red of a torn
 *     edge. A piece in the air carries it, and so does every hole it left.
 *   - Everything that is torn goes the same way — down the wall to one empty
 *     frame — and the last portrait on the wall is built out of all of it.
 *
 * THE WALL, IN ORDER
 *
 *   Intro     Pulled right back, drifting along the wall to the first window.
 *   Verse 1   Close on a window. Jimmy Page is torn on the words, then slides
 *             out of it like a picture behind glass, and the things behind him
 *             come through one a line: a double-neck, a page of tab, the dragon
 *             suit. Each is torn in turn.
 *   (lead-in) Two short landings on the way down the wall, torn on the beat.
 *   Verse 2   The second window: Jack White, a peppermint drum, a pedal, a
 *             page of riff. On "Earth shook" the whole wall shakes and swings.
 *   Chorus    Pulled back, moving. "I always sound the same": one torn piece
 *             copied from frame to frame on the words, until every picture in
 *             view has the same patch on it.
 *   Verse 3   The third window: Bob Dylan, a harmonica rack, an acoustic, a
 *             page of fingerpicking.
 *   Chorus    Again, with another piece.
 *   Break     Right out: a frenzy — a frame in view torn on every beat, then
 *             every eighth, the wall shaking, frames swinging on their nails,
 *             and every piece flying into the one empty frame.
 *   Verse 4   In on that frame: the pieces keep coming, and settle into a
 *             musician who could be anybody. The last piece is an anchor —
 *             the one thing on the wall nobody took from anyone.
 *   Chorus 3  The camera pulls back from him, all the torn wall round him, and
 *             near the end somebody takes his anchor.
 *
 * THE MOTION is the album's: one camera, never cut and never stopped (every
 * key is reached at a small drift, not at rest), eased moves of about a second
 * and a half, zoom in the transform because a closer look at an engraving shows
 * heavier lines. `galleryFrame({ time, score })` is a pure function of the
 * clock; the plan — the wall, the camera, every tear — is built once per score.
 */

import { r, clamp01, easeOut, easeInOut, ramp, lerp } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, INK, RED, SHEET, paper, plateClip, marginLyric, titleCard, glide } from '../album.mjs'
import {
  SCENES, PW, PH, GREEN, FINALES, portraitDefs, sceneBase, piecesOf, pieceSvg, holeSvg, crackSvg, pieceCentre,
  tearPts, openingD, mouldingSvg, hash, spline, inside, fillD, pen, circ, closedD,
} from '../portraits.mjs'
import { WINDOWS, WALL_OBJECTS } from '../still-lifes.mjs'

export const GALLERY = {
  id: 'album-conman-gallery',
  name: 'Gallery',
  accent: RED,
  palette: { PAPER, INK, RED, GREEN },
}

const PL = SHEET.plate
const SX = PL.x + PL.w / 2
const SY = PL.y + PL.h / 2
const P = (x, y) => `${r(x)} ${r(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}

/* ══ THE WALL ══════════════════════════════════════════════════════════
 *
 * A lattice of cells, CW by RH, one frame in each (or a pair of small ones,
 * hung one above the other), everything placed by hash so the wall is the same
 * wall in every frame. Four cells are fixed: the three windows and the empty
 * frame at the end of the wall.
 */
const CW = 560
const RH = 660
const SITTERS = Object.values(SCENES).filter((s) => s.kind === 'sitter').map((s) => s.id)

export const FIXED = {
  '0,0': { reel: WINDOWS.zeppelin, name: 'zeppelin' },
  '6,1': { reel: WINDOWS.stripes, name: 'stripes' },
  '11,-1': { reel: WINDOWS.dylan, name: 'dylan' },
  '17,0': { finale: true, name: 'finale' },
}
const WIN = { zeppelin: [0, 0], stripes: [6, 1], dylan: [11, -1], finale: [17, 0] }
const FRAME_KINDS = ['rect', 'oval', 'arch', 'round']

const CELLS = new Map()
/** The frames hung in cell (i, j): one or two. */
function cell(i, j) {
  const key = `${i},${j}`
  if (CELLS.has(key)) return CELLS.get(key)
  const h = (k) => hash(i * 7 + 101, j * 13 + 57, k)
  const fixed = FIXED[key]
  let frames
  if (fixed) {
    frames = [{ key, x: i * CW, y: j * RH, s: 1, scene: fixed.reel?.[0] ?? null, reel: fixed.reel ?? null, finale: !!fixed.finale, kind: 'rect', name: fixed.name }]
  }
  else {
    // Neighbours of a window hang a little smaller, so the window reads as the one to look at.
    const nearWindow = Object.values(WIN).some(([a, b]) => Math.abs(a - i) <= 1 && Math.abs(b - j) <= 1)
    const pick = (k, sub) => {
      const object = h(k) < 0.45
      const list = object ? WALL_OBJECTS : SITTERS
      const n = Math.floor(h(k + 1) * list.length * 7 + i * 3 + j * 5 + sub)
      const id = list[((n % list.length) + list.length) % list.length]
      return id
    }
    if (h(1) < 0.3 && !nearWindow) {
      // A pair of small ones.
      frames = [0, 1].map((sub) => {
        const scene = pick(10 + sub * 3, sub)
        return { key: `${key}/${sub}`, x: i * CW + (h(20 + sub) - 0.5) * 80, y: j * RH + (sub ? 158 : -158), s: 0.5, scene, kind: SCENES[scene].frame }
      })
    }
    else {
      const scene = pick(3, 0)
      const s = nearWindow ? 0.64 + h(5) * 0.12 : 0.72 + h(5) * 0.26
      frames = [{ key, x: i * CW + (h(6) - 0.5) * 70, y: j * RH + (h(7) - 0.5) * 60, s, scene, kind: SCENES[scene].frame }]
    }
  }
  CELLS.set(key, frames)
  return frames
}
const frameByKey = (key) => {
  const [a] = key.split('/')
  const [i, j] = a.split(',').map(Number)
  return cell(i, j).find((f) => f.key === key)
}
const winFrame = (name) => cell(...WIN[name])[0]

/** Every frame whose outline is in view of a camera at (x, y, z). */
function framesInView(cam, pad = 0) {
  const hw = 766 / cam.z + pad
  const hh = 333 / cam.z + pad
  const out = []
  for (let i = Math.floor((cam.x - hw) / CW) - 1; i <= Math.ceil((cam.x + hw) / CW) + 1; i++) {
    for (let j = Math.floor((cam.y - hh) / RH) - 1; j <= Math.ceil((cam.y + hh) / RH) + 1; j++) {
      for (const f of cell(i, j)) {
        const fw = (PW / 2 + 60) * f.s
        const fh = (PH / 2 + 60) * f.s
        if (f.x + fw < cam.x - hw || f.x - fw > cam.x + hw || f.y + fh + 90 * f.s < cam.y - hh || f.y - fh - 120 * f.s > cam.y + hh) continue
        out.push(f)
      }
    }
  }
  return out
}

/** A point in a frame's own box, on the wall (ignoring its swing). */
const toWall = (f, [px, py]) => [f.x + (px - PW / 2) * f.s, f.y + (py - PH / 2) * f.s]

/* ══ THE LAST PORTRAIT: WHERE EVERY PIECE GOES ═════════════════════════ */

/** Collage slots over the musician's silhouette, in the finale frame's box, ordered bottom-up so he builds from the ground. */
const SLOTS = (() => {
  const shapes = FINALES.musician.shapes
  const slots = []
  const cellW = 62
  let n = 0
  for (let y = -10; y < PH + 20; y += cellW * 0.78) {
    for (let x = -10; x < PW + 20; x += cellW) {
      const jx = x + (hash(x, y, 1) - 0.5) * cellW * 0.5 + (Math.round(y / (cellW * 0.78)) % 2) * cellW * 0.5
      const jy = y + (hash(x, y, 2) - 0.5) * cellW * 0.4
      const hit = shapes.some((pts) => [[0, 0], [22, 0], [-22, 0], [0, 22], [0, -22]].some(([dx, dy]) => inside(pts, jx + dx, jy + dy)))
      if (!hit) continue
      slots.push({ x: jx, y: jy, rot: (hash(n, 3, 9) - 0.5) * 50, n: n++ })
    }
  }
  // Fill from the feet up and the middle out, so the figure rises.
  slots.sort((a, b) => (b.y + Math.abs(a.x - 180) * 0.2) - (a.y + Math.abs(b.x - 180) * 0.2))
  return slots
})()
const ANCHOR_SLOT = { x: 180, y: 360, rot: -6, anchor: true }

/* ══ THE PLAN ══════════════════════════════════════════════════════════ */

const PLANS = new WeakMap()
function planFor(score) {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return PLANS.get(score)
}

const DRIFT = 9 // world units a second, added to every key so the camera never stops

function buildPlan(score) {
  const inSec = (sid) => score.lines.filter((l) => l.section === sid)
  const sec = (sid) => {
    const s = score.sections.find((x) => x.id === sid)
    if (!s) throw new Error(`gallery: no section ${sid}`)
    return s
  }
  const wt = (line, re, nth = 0) => {
    const found = line?.words.filter((w) => re.test(w.text))
    if (!found?.length) throw new Error(`gallery: no word ${re} in "${line?.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const BEAT = 60 / (score.bpm ?? 87.5)
  const PH0 = score.beatPhase ?? 0
  const beatsIn = (a, b, per = 1) => {
    const out = []
    for (let k = Math.ceil(((a - PH0) / BEAT) * per - 1e-6); PH0 + (k * BEAT) / per < b; k++) out.push(PH0 + (k * BEAT) / per)
    return out
  }
  const v1 = inSec('verse-1')
  const v2 = inSec('verse-2')
  const c1 = inSec('chorus-1')
  const v3 = inSec('verse-3')
  const c2 = inSec('chorus-2')
  const v4 = inSec('verse-4')
  const c3 = inSec('chorus-3')
  const brk = sec('break')
  const end = score.endCardAt ?? score.duration

  /* ── Where the camera is: keys, eased, with the drift folded in ───────── */
  const W = (name) => winFrame(name)
  const at = (name, dx = 0, dy = 0) => ({ x: W(name).x + dx, y: W(name).y + dy })
  const L1 = cell(2, 0)[0]
  const L2 = cell(4, 1)[0]
  const L3 = cell(14, 0)[0]
  const keysRaw = [
    { t: 0, x: -2700, y: -120, z: 0.5 },
    { t: 13.5, x: -1300, y: -60, z: 0.52 },
    { t: 21.6, ...at('zeppelin', 0, 14), z: 1.14 },
    { t: 34, ...at('zeppelin', 0, 14), z: 1.19 },
    { t: 45.6, ...at('zeppelin', 0, 14), z: 1.24 },
    { t: 48.6, x: L1.x, y: L1.y, z: 1.35 },
    { t: 50.9, x: L1.x + 20, y: L1.y, z: 1.38 },
    { t: 52.4, x: L2.x, y: L2.y, z: 1.35 },
    { t: 54.2, x: L2.x + 20, y: L2.y, z: 1.38 },
    { t: 55.5, ...at('stripes', 0, 14), z: 1.14 },
    { t: 66, ...at('stripes', 0, 14), z: 1.19 },
    { t: 76.6, ...at('stripes', 0, 14), z: 1.24 },
    { t: 79.4, ...at('stripes', 900, 60), z: 0.55 },
    { t: 95.0, ...at('dylan', -900, 60), z: 0.55 },
    { t: 99.4, ...at('dylan', 0, 14), z: 1.14 },
    { t: 110, ...at('dylan', 0, 14), z: 1.19 },
    { t: 121.4, ...at('dylan', 0, 14), z: 1.24 },
    { t: 124.2, ...at('dylan', 900, 200), z: 0.55 },
    { t: 138.8, x: L3.x, y: L3.y + 100, z: 0.55 },
    { t: 142.0, ...at('finale', -260, 0), z: 0.42 },
    { t: 163.8, ...at('finale', 200, 0), z: 0.42 },
    { t: 167.4, ...at('finale', 0, 18), z: 0.98 },
    { t: 187.6, ...at('finale', 0, 18), z: 1.04 },
    { t: 214, ...at('finale', 0, 60), z: 0.44 },
    { t: end, ...at('finale', 60, 60), z: 0.42 },
  ]
  const keys = keysRaw.map((k) => ({ t: k.t, v: { x: k.x - DRIFT * k.t, y: k.y, lz: Math.log(k.z) } }))
  const camBase = (t) => {
    const g = glide(t, keys)
    return { x: g.x + DRIFT * t, y: g.y, z: Math.exp(g.lz) }
  }

  /* ── The tears ────────────────────────────────────────────────────────
   *
   * { frame, scene, piece, t0 } — the piece cracks over the 0.3 s before t0
   * and lifts at t0. `dest` is where it flies: the next collage slot, or the
   * finale frame for pieces that only need to be seen going.
   */
  const tears = []
  const used = new Set()
  const tearOn = (frame, sceneId, piece, t0, o = {}) => {
    const id = `${frame.key}|${sceneId}|${piece}`
    if (used.has(id)) return null
    used.add(id)
    const e = { frame, scene: sceneId, piece, t0, dur: o.dur ?? 2.6, kind: o.kind ?? 'away', hit: o.hit ?? 1 }
    tears.push(e)
    return e
  }
  const tearAny = (frame, t0, o = {}) => {
    if (!frame.scene || frame.reel || frame.finale) return null
    for (const piece of Object.keys(piecesOf(frame.scene))) {
      const e = tearOn(frame, frame.scene, piece, t0, o)
      if (e) return e
    }
    return null
  }

  /* The windows: a scene a line, sliding in from the right; its pieces torn on its line's words. */
  const reels = {}
  const reelOf = (name, lines, plan) => {
    const f = W(name)
    const swaps = lines.slice(1).map((l) => l.start - 0.5)
    reels[f.key] = { swaps, back: lines[lines.length - 1].end + 1.2 }
    plan.forEach((words, k) => {
      const sceneId = f.reel[k]
      words.forEach(([re, nth, piece]) => tearOn(f, sceneId, piece, wt(lines[k], re, nth), { hit: 1.4 }))
    })
  }
  reelOf('zeppelin', v1, [
    [[/^conman/, 0, 'parting'], [/^fooled/, 0, 'lock'], [/^shake/, 0, 'dragon']],
    [[/^rhythms/, 0, 'head6'], [/^around/, 0, 'horn'], [/^1968/, 0, 'head12'], [/^they/, 0, 'pickups']],
    [[/^Bottled/, 0, 'corner'], [/^lightning/, 0, 'bar1'], [/^several/, 0, 'bar3'], [/^notes/, 0, 'tail']],
    [[/^pulled/, 0, 'sleeve'], [/^clouds/, 0, 'lapel'], [/^sky/, 0, 'dragonL'], [/^smoke/, 0, 'dragonR']],
  ])
  reelOf('stripes', v2, [
    [[/^conman/, 0, 'crown'], [/^fooled/, 0, 'left'], [/^look/, 0, 'right']],
    [[/^killing/, 0, 'swirl'], [/^fast/, 0, 'hoop'], [/^books/, 0, 'lugs']],
    [[/^Earth/, 0, 'treadle'], [/^shook/, 0, 'knob'], [/^2025/, 0, 'cable']],
    [[/^searching/, 0, 'bar1'], [/^finally/, 0, 'notes'], [/^realized/, 0, 'bar4']],
  ])
  reelOf('dylan', v3, [
    [[/^conman/, 0, 'top'], [/^steal/, 0, 'side'], [/^sound/, 0, 'other']],
    [[/^shadows/, 0, 'left'], [/^follow/, 0, 'right'], [/^around/, 0, 'wire']],
    [[/^see/, 0, 'headstock'], [/^pretend/, 0, 'rosette'], [/^stare/, 0, 'bridge']],
    [[/^pray/, 0, 'row1'], [/^remain/, 0, 'row3'], [/^unaware/, 0, 'corner']],
  ])
  // Jack's collar goes at the end of his verse, when the reel comes back to him.
  tearOn(W('stripes'), 'jack', 'collar', v2[3].end + 1.9, { hit: 1.2 })
  tearOn(W('zeppelin'), 'page', 'lapel', v1[3].end + 1.7, { hit: 1.2 })
  tearOn(W('dylan'), 'dylan', 'dots', v3[3].end + 0.5, { hit: 1.2 })

  // The two landings on the way to the second window, torn on the beat.
  for (const [f, a, b] of [[L1, 49.2, 51.2], [L2, 52.8, 54.8]]) beatsIn(a, b).slice(0, 3).forEach((t0) => tearAny(f, t0))

  /* The quiet stretches in view of the camera: a frame torn on some beats. */
  const tearInView = (t0, o = {}) => {
    const cam = camBase(t0)
    const fs = framesInView(cam, -60).filter((f) => !f.reel && !f.finale)
    // Prefer the ones nearest the middle of the screen.
    fs.sort((a, b) => Math.hypot(a.x - cam.x, a.y - cam.y) * (0.6 + hash(a.x, t0 * 10, 3)) - Math.hypot(b.x - cam.x, b.y - cam.y) * (0.6 + hash(b.x, t0 * 10, 3)))
    for (const f of fs) {
      const e = tearAny(f, t0, o)
      if (e) return e
    }
    return null
  }
  for (const [a, b] of [[c1[0].end + 0.4, c1[1].start - 0.4], [c2[0].end + 0.4, c2[1].start - 0.4], [c2[1].end + 0.3, brk.from]]) {
    beatsIn(a, b).forEach((t0, k) => { if (k % 2 === 0) tearInView(t0) })
  }

  // While a window is being torn, the pictures either side of it shed on the beat too — never on a word that tears the window.
  const windowTears = tears.map((e) => e.t0)
  for (const lines of [v1, v2, v3]) {
    beatsIn(lines[0].start + 1, lines[3].end, 1).forEach((t0, k) => {
      if (k % 3 !== 1 || windowTears.some((w) => Math.abs(w - t0) < 0.35)) return
      tearInView(t0, { hit: 0.8 })
    })
  }

  /* ── The chorus: one piece, copied frame to frame ─────────────────────
   *
   * On every stressed word the patch hops from the last frame it was pasted
   * on to the next one in view, and stays on both. "Always sound the same."
   */
  const stamps = []
  const chorusCopies = (lines, from) => {
    let prev = null
    for (const line of lines) {
      for (const w of line.words.filter((x) => x.text.replace(/[^a-z]/gi, '').length > 2 || /^No$/i.test(x.text))) {
        const cam = camBase(w.t)
        const taken = new Set(stamps.filter((s) => s.lines === lines).map((s) => s.frame.key))
        const fs = framesInView(cam, -80).filter((f) => !f.finale && !taken.has(f.key)).sort((a, b) => a.x - b.x)
        const f = fs.find((x) => !prev || x.x > prev.frame.x - 300) ?? fs[0]
        if (!f) continue
        const h = (k) => hash(f.x | 0, (w.t * 100) | 0, k)
        const stamp = { frame: f, lines, from, t: w.t, at: [100 + h(1) * 160, 120 + h(2) * 220], rot: (h(3) - 0.5) * 40, s: 1.3, prev }
        stamps.push(stamp)
        prev = stamp
      }
    }
  }
  chorusCopies(c1, { scene: 'doubleneck', piece: 'head12' })
  chorusCopies(c2, { scene: 'peppermint-drum', piece: 'swirl' })

  /* ── The break: a frenzy, and everything to the empty frame ─────────── */
  const into = []
  const bt = [...beatsIn(brk.from + 0.2, brk.to - 0.3, 1), ...beatsIn(brk.from + 11, brk.to - 0.3, 2).filter((_, k) => k % 2 === 1), ...beatsIn(brk.from + 19, brk.to - 0.3, 4).filter((_, k) => k % 2 === 1)].sort((a, b) => a - b)
  for (const t0 of bt) {
    const e = tearInView(t0, { dur: 1.25, kind: 'into', hit: 1.6 })
    if (e) into.push(e)
  }

  /* ── Verse 4: the rest arrive from wherever they went ──────────────── */
  const early = tears.filter((e) => e.t0 < brk.from && e.kind === 'away')
  const arrivals = []
  const words4 = v4.flatMap((l) => l.words).filter((w) => w.text.replace(/[^a-z]/gi, '').length > 3)
  // The break fills the bottom half of him; verse 4 brings the rest.
  const breakSlots = Math.round(SLOTS.length * 0.5)
  const slotsLeft = SLOTS.length - Math.min(into.length, breakSlots)
  const arrivalTimes = [...words4.map((w) => w.t), ...beatsIn(v4[0].start - 0.8, v4[3].end, 2)].sort((a, b) => a - b)
  const every = Math.max(1, arrivalTimes.length / Math.max(1, slotsLeft))
  for (let k = 0; k < slotsLeft && k * every < arrivalTimes.length; k++) {
    const src = early[(k * 7) % early.length]
    arrivals.push({ scene: src.scene, piece: src.piece, t1: arrivalTimes[Math.floor(k * every)], from: k % 2 ? 1 : -1 })
  }

  /* The collage: slot n gets the n-th thing to arrive. */
  const F = W('finale')
  const collage = []
  into.slice(0, breakSlots).forEach((e, n) => collage.push({ slot: SLOTS[n], scene: e.scene, piece: e.piece, t1: e.t0 + e.dur, via: e }))
  arrivals.slice(0, Math.max(0, SLOTS.length - collage.length)).forEach((a) => collage.push({ slot: SLOTS[collage.length], scene: a.scene, piece: a.piece, t1: a.t1, from: a.from }))
  const anchorAt = wt(v4[3], /^sake/)
  collage.push({ slot: ANCHOR_SLOT, scene: 'anchor', piece: 'whole', t1: anchorAt, from: -1, s: 0.34 })
  // And somebody takes it.
  const anchorGone = wt(c3[3], /^always/)

  /* ── Shakes and swings ─────────────────────────────────────────────── */
  const quakes = [
    { t: wt(v2[2], /^Earth/), a: 10 },
    { t: wt(v2[2], /^shook/), a: 18 },
    ...beatsIn(brk.from, brk.to, 1).map((t, k) => ({ t, a: 3 + 5 * (k / 36) + (k % 4 === 0 ? 4 : 0) })),
  ]

  // Tears by frame, for holes and swings.
  const byFrame = new Map()
  for (const e of tears) {
    if (!byFrame.has(e.frame.key)) byFrame.set(e.frame.key, [])
    byFrame.get(e.frame.key).push(e)
  }
  const stampsBy = new Map()
  for (const s of stamps) {
    if (!stampsBy.has(s.frame.key)) stampsBy.set(s.frame.key, [])
    stampsBy.get(s.frame.key).push(s)
  }

  if (typeof process !== 'undefined' && process.env?.GALLERY_DEBUG) console.error(`gallery: ${SLOTS.length} slots, ${into.length} into, ${arrivals.length} arrivals, ${tears.length} tears, ${stamps.length} stamps`)
  return { camBase, tears, byFrame, stamps, stampsBy, reels, collage, anchorGone, quakes, F, BEAT, PH0, brk, end }
}

/* ══ MOTION PIECES ═════════════════════════════════════════════════════ */

/** A decaying ring, as a shake: sum of damped sines from `hits` [{ t, a }]. */
function ring(now, hits, f1 = 7.3, f2 = 5.1, tau = 0.28) {
  let x = 0
  let y = 0
  for (const { t, a } of hits) {
    const d = now - t
    if (d < 0 || d > tau * 6) continue
    const env = a * Math.exp(-d / tau) * smooth(d / 0.03)
    x += env * Math.sin(d * 2 * Math.PI * f1)
    y += env * 0.6 * Math.sin(d * 2 * Math.PI * f2 + 1.1)
  }
  return [x, y]
}

/** A frame's swing on its nail, in degrees: every tear on it knocks it, and so does every quake. */
function swingOf(plan, f, now) {
  let a = 0
  for (const e of plan.byFrame.get(f.key) ?? []) {
    const d = now - e.t0
    if (d < 0 || d > 3) continue
    a += 2.4 * e.hit * Math.exp(-d / 0.7) * Math.sin(d * 2 * Math.PI * 1.1) * (hash(f.x | 0, 1, 5) < 0.5 ? 1 : -1)
  }
  for (const q of plan.quakes) {
    const d = now - q.t
    if (d < 0 || d > 3) continue
    a += 0.28 * q.a * Math.exp(-d / 0.8) * Math.sin(d * 2 * Math.PI * (0.9 + hash(f.x | 0, f.y | 0, 7) * 0.4) + hash(f.y | 0, 2, 3) * 6)
  }
  return a
}

/** Where a reel is: 0 on its first scene, 1 on the second … sliding a second and a bit, and back to 0 at the end. */
function reelPos(reel, now) {
  let u = 0
  for (const s of reel.swaps) u += smooth(ramp(now, s - 0.55, s + 0.55))
  u -= reel.swaps.length * smooth(ramp(now, reel.back - 0.7, reel.back + 0.9))
  return u
}
const REEL_GAP = PW + 70

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

export function galleryFrame({ time, score, lockup = '', uid = 'gl' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })
  const plan = planFor(score)
  const section = sectionAt(score, now)
  const active = lineAt(score, now)

  const cam = plan.camBase(now)
  const [qx, qy] = ring(now, plan.quakes)
  const defs = new Map()
  // A wide shot draws the pictures without their hair strands: they are finer than a pixel out there.
  const ctx = { uid, defs, lod: cam.z < 0.62 }
  const u = uid

  /* ── Frames in view ────────────────────────────────────────────────── */
  const world = []
  const flying = []
  const frames = framesInView(cam, 40)
  for (const f of frames) world.push(frameSvg(ctx, plan, f, now))

  /* ── Pieces in the air ─────────────────────────────────────────────── */
  const hw = 766 / cam.z + 300
  const hh = 333 / cam.z + 300
  for (const e of plan.tears) {
    const d = now - e.t0
    if (d < -0.35 || d > e.dur) continue
    if (d < 0) continue
    const start = pieceWorld(plan, e)
    let dest
    if (e.kind === 'into') {
      const c = plan.collage.find((x) => x.via === e)
      dest = c ? slotWorld(plan, c) : { x: plan.F.x + (hash(e.t0 * 100, 1, 3) - 0.5) * 200, y: plan.F.y + (hash(e.t0 * 100, 2, 3) - 0.3) * 260, rot: 30, s: 0.05 }
    }
    else {
      // Up and away down the wall, turning, growing a little as it comes off towards us.
      const side = hash(e.t0 * 100, 5, 1) < 0.25 ? -1 : 1
      dest = { x: start.x + side * (1100 + hash(e.t0 * 100, 6, 1) * 600), y: start.y - 260 - hash(e.t0 * 100, 7, 1) * 260, rot: side * (160 + hash(e.t0 * 100, 8, 1) * 200), s: e.frame.s * 1.35 }
    }
    const k = clamp01(d / e.dur)
    const q = e.kind === 'into' ? easeInOut(k) : k ** 1.35
    const pop = e.kind === 'into' ? Math.sin(Math.PI * k) * 0.7 : Math.sin(Math.PI * clamp01(d / 0.35)) * 0.14
    const cx = lerp(start.x, dest.x, 0.5)
    const cy = Math.min(start.y, dest.y) - (e.kind === 'into' ? 260 : 120) - Math.abs(dest.x - start.x) * 0.08
    const x = (1 - q) ** 2 * start.x + 2 * (1 - q) * q * cx + q * q * dest.x
    const y = (1 - q) ** 2 * start.y + 2 * (1 - q) * q * cy + q * q * dest.y - pop * 60 * e.frame.s
    if (Math.abs(x - cam.x) > hw || Math.abs(y - cam.y) > hh) continue
    const rot = lerp(0, dest.rot + (e.kind === 'into' ? 0 : 180), q) + Math.sin(d * 5) * 4 * (1 - q)
    const s = lerp(e.frame.s, dest.s, q) * (1 + pop)
    flying.push(pieceSvg(ctx, e.scene, e.piece, x, y, rot, s / 1, { shadow: 0.25 + pop, lift: 6 + pop * 40 }))
  }
  // Flecks of paper off every tear, falling.
  for (const e of plan.tears) {
    const d = now - e.t0
    if (d < 0 || d > 1.4) continue
    const p0 = pieceWorld(plan, e)
    if (Math.abs(p0.x - cam.x) > hw || Math.abs(p0.y - cam.y) > hh) continue
    for (let n = 0; n < 7; n++) {
      const h = (k) => hash(e.t0 * 100 + n, k, 13)
      const vx = (h(1) - 0.5) * 520 * e.frame.s
      const vy = (-160 - h(2) * 320) * e.frame.s
      const x = p0.x + (h(3) - 0.5) * 80 * e.frame.s + vx * d
      const y = p0.y + (h(4) - 0.5) * 60 * e.frame.s + vy * d + 620 * e.frame.s * d * d
      const sz = (5 + h(5) * 9) * e.frame.s
      const a = h(6) * 6.28 + d * (6 + h(7) * 8)
      const pts = [0, 2.1, 4.2].map((b) => [x + Math.cos(a + b) * sz, y + Math.sin(a + b) * sz * (0.4 + h(8) * 0.6)])
      flying.push(`<path d="M${pts.map(([px, py]) => `${r(px)} ${r(py)}`).join('L')}Z" fill="${PAPER}" stroke="${n % 3 ? INK : RED}" stroke-width="${r(0.7 * e.frame.s + 0.3, 2)}" opacity="${r(1 - smooth(ramp(d, 0.9, 1.4)), 3)}"/>`)
    }
  }
  // The copies hopping between frames in the chorus.
  for (const st of plan.stamps) {
    const d = now - st.t
    if (d < -0.42 || d > 0) continue
    const to = toWall(st.frame, st.at)
    const from = st.prev ? toWall(st.prev.frame, st.prev.at) : [to[0] - 700, to[1] - 500]
    const q = easeInOut(clamp01((d + 0.42) / 0.42))
    const x = lerp(from[0], to[0], q)
    const y = lerp(from[1], to[1], q) - Math.sin(q * Math.PI) * 180
    flying.push(pieceSvg(ctx, st.from.scene, st.from.piece, x, y, lerp(st.prev?.rot ?? -30, st.rot, q), st.s * st.frame.s * (1 + Math.sin(q * Math.PI) * 0.25), { shadow: 0.3, lift: 14 }))
  }
  // The collage's arrivals from off the wall in verse 4, and the anchor being taken.
  for (const c of plan.collage) {
    if (c.via) continue
    const d = now - c.t1
    if (d < -1.3 || d >= 0) continue
    const to = slotWorld(plan, c)
    const q = easeOut(clamp01((d + 1.3) / 1.3))
    const from = { x: to.x + c.from * 1300, y: to.y - 700 }
    const x = lerp(from.x, to.x, q)
    const y = lerp(from.y, to.y, q) - Math.sin(q * Math.PI) * 220
    flying.push(pieceSvg(ctx, c.scene, c.piece, x, y, lerp(c.from * 120, to.rot, q), to.s * (1 + (1 - q) * 0.4), { shadow: 0.3, lift: 12 }))
  }
  const gone = now - plan.anchorGone
  if (gone >= 0 && gone < 2.4) {
    const c = plan.collage.find((x) => x.slot.anchor)
    const from = slotWorld(plan, c)
    const q = clamp01(gone / 2.4) ** 1.6
    flying.push(pieceSvg(ctx, 'anchor', 'whole', from.x + q * 2400, from.y - Math.sin(q * Math.PI * 0.5) * 900, from.rot + q * 260, from.s * (1 + Math.sin(Math.PI * clamp01(gone / 0.4)) * 0.2), { shadow: 0.3, lift: 14 }))
  }

  /* ── The margin ───────────────────────────────────────────────────── */
  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 2, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  const clip = plateClip(uid)
  const view = `translate(${r(SX + qx, 2)} ${r(SY + qy, 2)}) scale(${r(cam.z, 4)}) translate(${r(-cam.x, 2)} ${r(-cam.y, 2)})`
  const wallDefs = `<pattern id="${u}-wall" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M0 0V120M8 0V120M60 0V120" stroke="${GREEN}" stroke-width="0.9" opacity="0.28"/><path d="M34 54l4 -6l4 6l-4 6z" fill="${GREEN}" opacity="0.3"/></pattern>` +
    FRAME_KINDS.map((k) => `<clipPath id="${u}-open-${k}"><path d="${openingD(k)}"/></clipPath><g id="${u}-mould-${k}">${mouldingSvg(ctx, k)}</g>`).join('')
  const vx0 = cam.x - 766 / cam.z - 40
  const vy0 = cam.y - 333 / cam.z - 40
  return {
    svg: [
      paper(),
      `<defs>${clip.def}${portraitDefs(u)}${wallDefs}${[...defs.values()].join('')}</defs>`,
      `<g clip-path="${clip.url}">`,
      `<rect x="${PL.x}" y="${PL.y}" width="${PL.w}" height="${PL.h}" fill="${PAPER}"/>`,
      `<g transform="${view}"><rect x="${r(vx0)}" y="${r(vy0)}" width="${r(1532 / cam.z + 80)}" height="${r(666 / cam.z + 80)}" fill="url(#${u}-wall)"/>${world.join('')}${flying.join('')}</g>`,
      '</g>',
      margin,
    ].join('\n'),
    label: active?.text ?? section.label,
  }
}

/** Where a torn piece starts: its centre on the wall, from its frame and (for a window) the reel's position then. */
function pieceWorld(plan, e) {
  const f = e.frame
  const [px, py] = pieceCentre(e.scene, e.piece)
  let ox = 0
  if (f.reel) {
    const reel = plan.reels[f.key]
    ox = (f.reel.indexOf(e.scene) - reelPos(reel, e.t0)) * REEL_GAP
  }
  const [x, y] = toWall(f, [px + ox, py])
  return { x, y }
}

/** A collage slot on the wall: position, turn and scale of the piece sitting in it. */
function slotWorld(plan, c) {
  const [x, y] = toWall(plan.F, [c.slot.x, c.slot.y])
  const g = piecesOf(c.scene)[c.piece]
  const w = Math.max(...g.map((p) => p[0])) - Math.min(...g.map((p) => p[0]))
  const h = Math.max(...g.map((p) => p[1])) - Math.min(...g.map((p) => p[1]))
  const sc = c.s ?? Math.max(0.6, Math.min(1.3, 80 / Math.max(w, h)))
  return { x, y, rot: c.slot.rot, s: sc * plan.F.s }
}

/** One frame on the wall: its shadow, wire and nail, its moulding, and whatever is behind its glass. */
function frameSvg(ctx, plan, f, now) {
  const u = ctx.uid
  const nail = [f.x, f.y - (PH / 2 + 96) * f.s]
  const swing = swingOf(plan, f, now)
  let inner = ''
  if (f.finale) inner = finaleContent(ctx, plan, now)
  else if (f.reel) {
    const reel = plan.reels[f.key]
    const pos = reelPos(reel, now)
    // Behind the glass: the dark the pictures slide across.
    if (Math.abs(pos - Math.round(pos)) > 0.001) inner += `<rect x="-10" y="-10" width="${PW + 20}" height="${PH + 20}" fill="${INK}" opacity="0.55"/><rect x="-10" y="-10" width="${PW + 20}" height="${PH + 20}" fill="url(#${u}-k3)"/>`
    f.reel.forEach((sceneId, k) => {
      const ox = (k - pos) * REEL_GAP
      if (Math.abs(ox) > PW + 80) return
      inner += `<g transform="translate(${r(ox)} 0)">${sceneContent(ctx, plan, f, sceneId, now)}</g>`
    })
  }
  else inner = sceneContent(ctx, plan, f, f.scene, now)
  // Copies pasted on in the chorus.
  for (const st of plan.stampsBy.get(f.key) ?? []) {
    if (now < st.t) continue
    const slap = 1 + 0.18 * Math.exp(-(now - st.t) / 0.08) * (now - st.t < 0.3 ? 1 : 0)
    inner += pieceSvg(ctx, st.from.scene, st.from.piece, st.at[0], st.at[1], st.rot, st.s * slap, { shadow: 0.2, lift: 3 })
  }
  const body = `<g transform="translate(${r(f.x)} ${r(f.y)}) scale(${r(f.s, 4)}) translate(${-PW / 2} ${-PH / 2})">` +
    // Shadow on the wall, the wire, the moulding, the picture.
    `<path d="${openingD(f.kind)}" fill="${INK}" opacity="0.18" transform="translate(14 22) scale(1.02)"/>` +
    pen(`M${P(40, -30)}L${P(PW / 2, -96)}L${P(PW - 40, -30)}`, 1.4) +
    `<use href="#${u}-mould-${f.kind}"/>` +
    `<g clip-path="url(#${u}-open-${f.kind})">${inner}</g></g>`
  const nailSvg = fillD(circ(nail[0], nail[1], 5 * f.s + 1), INK)
  return swing ? `<g transform="rotate(${r(swing, 2)} ${r(nail[0])} ${r(nail[1])})">${body}</g>${nailSvg}` : body + nailSvg
}

/** A scene behind a frame's glass at `now`: the picture, its holes, and any piece cracking loose. */
function sceneContent(ctx, plan, f, sceneId, now) {
  let s = `<use href="#${sceneBase(ctx, sceneId)}"/>`
  for (const e of plan.byFrame.get(f.key) ?? []) {
    if (e.scene !== sceneId) continue
    const d = now - e.t0
    if (d < -0.35) continue
    if (d >= 0) s += holeSvg(ctx, sceneId, e.piece, clamp01(d / 0.06))
    if (d < 0) {
      // The tear runs round it, and it trembles.
      const k = ramp(d, -0.35, -0.02)
      const [px, py] = pieceCentre(sceneId, e.piece)
      s += pieceSvg(ctx, sceneId, e.piece, px + Math.sin(now * 90) * 1.4 * k, py - 2 * k, Math.sin(now * 70) * 1.2 * k, 1, { shadow: 0.12 * k, lift: 2 }) + crackSvg(sceneId, e.piece, k * 1.05)
    }
  }
  return s
}

/** The empty frame, and the musician being built in it. */
function finaleContent(ctx, plan, now) {
  const u = ctx.uid
  const fin = FINALES.musician
  const cid = `${u}-fin`
  if (!ctx.defs.has(cid)) ctx.defs.set(cid, `<clipPath id="${cid}">${fin.shapes.map((pts) => `<path d="${spline(pts)}"/>`).join('')}</clipPath>`)
  let s = `<rect x="0" y="0" width="${PW}" height="${PH}" fill="${PAPER}"/><rect x="0" y="0" width="${PW}" height="${PH}" fill="url(#${u}-g0)"/>`
  // The silhouette waiting in pencil, then filling.
  const landed = plan.collage.filter((c) => now >= c.t1)
  const k = landed.length / plan.collage.length
  s += fin.shapes.map((pts) => pen(spline(pts), 1.3, { opacity: 0.5 * (1 - k * 0.6), extra: ' stroke-dasharray="6 5"' })).join('')
  if (landed.length) {
    s += fin.shapes.map((pts) => pen(spline(pts), 4.4, { opacity: clamp01(k * 3) })).join('')
    let inside_ = ''
    for (const c of landed) {
      if (c.slot.anchor) continue
      const w = slotLocal(c)
      const slap = 1 + 0.2 * Math.exp(-(now - c.t1) / 0.07) * (now - c.t1 < 0.3 ? 1 : 0)
      inside_ += pieceSvg(ctx, c.scene, c.piece, c.slot.x, c.slot.y, c.slot.rot, w * slap, { shadow: 0.18, lift: 3, lod: true })
    }
    s += `<g clip-path="url(#${cid})">${inside_}</g>`
    const a = plan.collage.find((c) => c.slot.anchor)
    if (a && now >= a.t1 && now < plan.anchorGone) {
      const slap = 1 + 0.25 * Math.exp(-(now - a.t1) / 0.08) * (now - a.t1 < 0.3 ? 1 : 0)
      s += pieceSvg(ctx, 'anchor', 'whole', a.slot.x, a.slot.y, a.slot.rot, slotLocal(a) * slap, { shadow: 0.3, lift: 5 })
    }
    if (now >= plan.anchorGone) {
      const [ax, ay] = pieceCentre('anchor', 'whole')
      s += holeSvg(ctx, 'anchor', 'whole', 1, `translate(${r(a.slot.x)} ${r(a.slot.y)}) rotate(${r(a.slot.rot)}) scale(${r(slotLocal(a), 3)}) translate(${r(-ax)} ${r(-ay)})`)
    }
  }
  return s
}
function slotLocal(c) {
  const g = piecesOf(c.scene)[c.piece]
  const w = Math.max(...g.map((p) => p[0])) - Math.min(...g.map((p) => p[0]))
  const h = Math.max(...g.map((p) => p[1])) - Math.min(...g.map((p) => p[1]))
  return c.s ?? Math.max(0.6, Math.min(1.3, 80 / Math.max(w, h)))
}

void tearPts
void closedD
