/*
 * Mezzotint — "Meet Me at the Horizon" as one plate burnished from black to dawn.
 *
 * Track 7 of the album (app/config/albumStyle.ts). The song is a night awake:
 * a man alone in a bed that used to hold two, his thoughts running, the room
 * turning on him, and the dawn he waits for all night. The film is the story of
 * that night, and of the one place he can think of to meet her again.
 *
 * THREE RULES THE WHOLE FILM IS BUILT ON
 *
 *   - A mezzotint is made backwards. The copper is rocked until it prints solid
 *     black and the picture is burnished out of the dark: the more the burr is
 *     flattened, the lighter it prints. So the film opens on a black plate and
 *     the room comes out of it, and the dawn is burnished in over the whole
 *     song — but anxiety re-rocks the plate. In the third verse a band of fresh
 *     burr sweeps across the frame and the first dawn is gone; in the fourth
 *     the ink floods down from the top of the frame. The dawn has to be made
 *     twice, and the second time it holds.
 *   - Red is the journey, and the journey is the horizon. One thin red line
 *     where the land meets the sky, drawn on the first time the night "meets a
 *     glimpse of the dawn", rocked away with the dawn, drawn again, and in the
 *     end the place the two of them meet. It is the only red on the plate.
 *   - She is never inked. Whoever "you" is, she is the absence the plate leaves:
 *     burnished almost to paper on the empty pillow, a shape seen only because
 *     of the dark round it. As the room gets lighter she gets harder to see,
 *     and in the last chorus, in full daylight, she is gone from the bed. The
 *     film never says why.
 *
 * THE NIGHT, SECTION BY SECTION
 *
 *   Intro     The plate is black; the bedroom is burnished out of it round the
 *             bedside lamp. Two pillows, one head. The clock says 3:07.
 *   Verse 1   The empty pillow on "lover". On "thoughts" wisps rise off him and
 *             become sheep on the wall over the window, walking to a fence; one
 *             jumps and on "no" they all stop, the jumper hanging in the air,
 *             and on "sheep" they dissolve. He puts the lamp out on "light";
 *             in the dark only his open eyes are left, and he blinks on "sleep".
 *   Verse 2   On "sky" the ceiling is burnished away into stars; on "wonder"
 *             the bed lifts off the floor and rises with him into them. On
 *             "afraid" the stars wheel into trails. On "repeat" it all runs
 *             backwards — trails, bed, ceiling, clock — to 3:07 again.
 *   Chorus 1  The camera goes to the window. The sky warms, the trees stretch
 *             on "yawn", and on "meets" the red horizon is drawn across. On
 *             "you're" she is on the other pillow.
 *   Verse 3   She is gone. The phone lights on "call" and goes out. On "Fever"
 *             the plate is re-rocked: a band of burr sweeps across the frame
 *             and takes the dawn and the red line with it. Specks crawl on
 *             "skin"; the room breathes on the click through "tension"; the
 *             frame tilts while the headache "evolves" and rights itself on
 *             "straighten", as he sits bolt upright.
 *   Verse 4   Ink floods down the frame on "blood". On "deep" the camera pulls
 *             back out of the room until it is a lit cutaway in a house on a
 *             hill; the house creaks on "creak". Back in, the casements swing
 *             open on "open" and the wind comes in. On "I could be the sky" he
 *             lifts out of bed and floats out of the window, and the camera
 *             follows him out.
 *   Chorus 2  In the sky, over the treeline and a sleeping village, the dawn
 *             is burnished again and the red line drawn again, the whole width
 *             of the plate. On "you're" she is floating beside him.
 *   Hook 1    "Meet me at the horizon": she drifts away from him until she is
 *             a small figure standing on the red line. He reaches for her
 *             through the whole held "Oh". Then he is pulled back, through the
 *             window, into the bed.
 *   Verse 5   The same bed, the window open, the room greyer now. On "cuts"
 *             the light from the window cuts across the bed; on "sliver" the
 *             rim of the sun shows on the horizon.
 *   Chorus 3  Sunrise. The room is burnished pale; she is on the pillow on
 *             "miss" and there is too much light to see her. On "so" he gets
 *             up and goes to the window.
 *   Hook 2    He steps out of the window and walks down the lane between the
 *             trees towards the horizon, and she is on it, walking to him. The
 *             horizon comes to meet them.
 *   Outro     The plate opens to the whole sheet. They meet on the red line,
 *             the sun comes up behind them, and the print is burnished nearly
 *             to paper. The end card lands on the last strike.
 *
 * THE WORLD is one projection of planes at depth, so the camera can pass
 * through a window, rise into the sky and travel towards the horizon without a
 * cut: a thing at depth D (0 is the bedroom's back wall, positive is outside)
 * is drawn at scale F / (d + D), where d is the camera's distance from the
 * wall. The bedroom, the house and the hill are at depth 0; the treeline, the
 * village, the fields and the ridge are further out; the sky is at infinity.
 * The camera is { x, y, d, sy, roll } — sy is a lens shift, which is how it
 * looks up at the sky or down at the fields without tilting planes.
 *
 * THE PRINT: no filters. Tone is flat fills and gradients from the album ink
 * towards the paper along one burnished ramp; light is paper-coloured radial
 * gradients laid over; the rocked ground is two baked dot patterns fixed to the
 * sheet. `mezzotintFrame({ time, score })` is a pure function of the clock.
 */

import { t as text, r, clamp01, easeOut, easeInOut, ramp, lerp } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, INK, RED, SECOND_INK, SHEET, paper, marginLyric, titleCard, land, easeCamera } from '../album.mjs'

export const GOLD = SECOND_INK['meet-me-at-the-horizon']

export const MEZZOTINT = {
  id: 'album-meet-me-at-the-horizon',
  name: 'Mezzotint',
  accent: RED,
  palette: { PAPER, INK, RED, GOLD },
}

const PL = SHEET.plate
/** The plate's centre: the projection's principal point. */
const CX = PL.x + PL.w / 2
const CY = PL.y + PL.h / 2
/** Focal length: a thing at d + D = F is drawn at 1:1. */
const F = 1000

/* ── The world, in bedroom units (the back wall is depth 0) ─────────── */
const ROOM = { x0: -760, x1: 760, top: -420, floor: 330 }
const WIN = { x0: -210, x1: 210, y0: -250, y1: 40 }
const WIN_CY = (WIN.y0 + WIN.y1) / 2
/** The ground under the house. The bedroom is upstairs. */
const G = 700
const HOUSE = { x0: -900, x1: 900, eaves: -470, peak: -1080 }
const TREES_Z = 3600
const VILLAGE_Z = 7200
const RIDGE_Z = 9000
/** His height, and hers. */
const HIM = 300
const HER = 282

/* ══ SMALL THINGS ══════════════════════════════════════════════════════ */

const P = (x, y) => `${r(x)} ${r(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
const g = (inner, attrs = '') => (inner ? `<g${attrs ? ` ${attrs}` : ''}>${inner}</g>` : '')
const fillD = (d, colour, o = 1, extra = '') => (d && o > 0.002 ? `<path d="${d}" fill="${colour}"${op(o)}${extra}/>` : '')
const pen = (d, colour, w = 1, o = 1, extra = '') => (d && o > 0.002 ? `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${r(w, 2)}" stroke-linecap="round" stroke-linejoin="round"${op(o)}${extra}/>` : '')
const ellipse = (x, y, rx, ry) => (rx > 0.05 && ry > 0.05 ? `M${P(x - rx, y)}a${r(rx, 2)} ${r(ry, 2)} 0 1 0 ${r(rx * 2, 2)} 0a${r(rx, 2)} ${r(ry, 2)} 0 1 0 ${r(-rx * 2, 2)} 0Z` : '')
const circ = (x, y, rad) => ellipse(x, y, rad, rad)
const rectD = (x, y, w, h) => `M${P(x, y)}h${r(w)}v${r(h)}h${r(-w)}Z`
const poly = (pts) => 'M' + pts.map(([x, y]) => P(x, y)).join('L') + 'Z'
/** A pulse that rises over `a` and falls over `b` after `at`. */
const bump = (now, at, a = 0.12, b = 0.6) => (now < at ? 0 : now < at + a ? easeOut((now - at) / a) : 1 - easeInOut(clamp01((now - at - a) / b)))
/** A damped ring after `at`: for shakes and creaks. Zero before, rings out. */
const ring = (now, at, freq = 7, half = 0.35) => (now < at ? 0 : Math.sin((now - at) * freq * Math.PI * 2) * Math.pow(0.5, (now - at) / half) * clamp01((now - at) / 0.04))

/** Deterministic noise in 0–1 from integers — no Math.random anywhere. */
function hash(x, y, s = 0) {
  let h = Math.imul((x | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul(((y | 0) + Math.imul(s | 0, 7919)) | 0, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

const CACHE = new Map()
const memo = (key, build) => {
  if (!CACHE.has(key)) CACHE.set(key, build())
  return CACHE.get(key)
}

/** A closed curve through `pts` (Catmull–Rom). */
function spline(pts, closed = true) {
  const n = pts.length
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${P(...pts[0])}`
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    d += `C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`
  }
  return closed ? d + 'Z' : d
}

/** A wobbly closed blob, quadratics through the midpoints. */
function blobD(cx, cy, rx, ry, seed = 1, n = 11, wobble = 0.14) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 1 - wobble / 2 + hash(i, 5, seed) * wobble
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  })
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${P(...mid(pts[n - 1], pts[0]))}`
  pts.forEach((p, i) => { d += `Q${P(...p)} ${P(...mid(p, pts[(i + 1) % n]))}` })
  return d + 'Z'
}

/* ══ TONE ══════════════════════════════════════════════════════════════
 *
 * A mezzotint has no colours, only how far the burr has been flattened: one
 * ramp from the album ink to the album paper, warm all the way. Every surface
 * asks for a value on it; `ctx.c(v)` applies the film's two global states —
 * how much of the plate has been burnished out of the black (the intro), and
 * how near to paper the whole print has gone (the end).
 */
const RAMP = ['#1b1915', '#221f1a', '#2b2721', '#37322a', '#4a4338', '#645a4b', '#857967', '#ab9f89', '#cfc4ad', PAPER]
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const rgbHex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
function mix(a, b, u) {
  const pa = hexRgb(a)
  const pb = hexRgb(b)
  const k = clamp01(u)
  return rgbHex(pa.map((v, i) => v + (pb[i] - v) * k))
}
function toneOf(v) {
  const x = clamp01(v) * (RAMP.length - 1)
  const i = Math.min(RAMP.length - 2, Math.floor(x))
  return mix(RAMP[i], RAMP[i + 1], x - i)
}

/* ══ THE CAMERA ════════════════════════════════════════════════════════ */

/** Scale of a plane at depth D. */
const scaleAt = (cam, D) => F / Math.max(cam.d + D, 1e-3)
const layerT = (cam, D) => {
  const s = scaleAt(cam, D)
  return `translate(${r(CX + cam.sx - cam.x * s, 2)} ${r(CY + cam.sy - cam.y * s, 2)}) scale(${r(s, 5)})`
}
const toScreen = (cam, D, x, y) => {
  const s = scaleAt(cam, D)
  return [CX + cam.sx + (x - cam.x) * s, CY + cam.sy + (y - cam.y) * s]
}
/** Where the ground at depth z is on screen. */
const groundY = (cam, z, lift = 0) => CY + cam.sy + (G - lift - cam.y) * scaleAt(cam, z)

/*
 * Monotone cubic through keys (Fritsch–Carlson), per component: velocity is
 * continuous through every key, and it never overshoots — so a key the camera
 * passes through does not make it swing past and come back.
 */
function pchipAt(keys, t, k) {
  const n = keys.length
  if (t <= keys[0].t) return keys[0].v[k]
  if (t >= keys[n - 1].t) return keys[n - 1].v[k]
  let i = 0
  while (i < n - 2 && t > keys[i + 1].t) i++
  const slope = (j) => (keys[j + 1].v[k] - keys[j].v[k]) / (keys[j + 1].t - keys[j].t)
  const tangent = (j) => {
    if (j <= 0 || j >= n - 1) return 0
    const a = slope(j - 1)
    const b = slope(j)
    if (a * b <= 0) return 0
    const h0 = keys[j].t - keys[j - 1].t
    const h1 = keys[j + 1].t - keys[j].t
    const w1 = 2 * h1 + h0
    const w2 = h1 + 2 * h0
    return (w1 + w2) / (w1 / a + w2 / b)
  }
  const a = keys[i]
  const b = keys[i + 1]
  const h = b.t - a.t
  const u = (t - a.t) / h
  const u2 = u * u
  const u3 = u2 * u
  return (2 * u3 - 3 * u2 + 1) * a.v[k] + (u3 - 2 * u2 + u) * h * tangent(i) + (-2 * u3 + 3 * u2) * b.v[k] + (u3 - u2) * h * tangent(i + 1)
}

/* ══ THE PLAN: every time the film keys off, read from the score ═══════ */

const PLANS = new WeakMap()
const planFor = (score) => {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return PLANS.get(score)
}

function buildPlan(score) {
  const inSec = (sid) => score.lines.filter((l) => l.section === sid)
  const sec = (sid) => {
    const s = score.sections.find((x) => x.id === sid)
    if (!s) throw new Error(`mezzotint: no section ${sid}`)
    return s
  }
  const wt = (line, re, nth = 0) => {
    const found = line?.words.filter((w) => re.test(w.text))
    if (!found?.length) throw new Error(`mezzotint: no word ${re} in "${line?.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const lastWord = (line) => line.words[line.words.length - 1].t
  const v1 = inSec('verse-1')
  const v2 = inSec('verse-2')
  const c1 = inSec('chorus-1')
  const v3 = inSec('verse-3')
  const v4 = inSec('verse-4')
  const c2 = inSec('chorus-2')
  const h1 = inSec('hook-1')
  const v5 = inSec('verse-5')
  const c3 = inSec('chorus-3')
  const h2 = inSec('hook-2')

  const T = {
    no1: v1[0].start, friend: wt(v1[0], /^friend/), lover: wt(v1[0], /^lover/),
    some: v1[1].start, darkness: wt(v1[1], /^darkness/), sweeter: wt(v1[1], /^sweeter/),
    just: v1[2].start, thoughts: wt(v1[2], /^thoughts/), noSheep: wt(v1[2], /^no$/), sheep: wt(v1[2], /^sheep/),
    when: v1[3].start, light: wt(v1[3], /^light/), sleep: wt(v1[3], /^sleep/),
    lie: v2[0].start, sky: wt(v2[0], /^sky/),
    wonder: wt(v2[1], /^wonder/), die: wt(v2[1], /^die/),
    should: v2[2].start, afraid: wt(v2[2], /^afraid/), troubles: wt(v2[2], /^end/),
    does: v2[3].start, repeat: wt(v2[3], /^repeat/), again1: wt(v2[3], /^again/, 0), again2: wt(v2[3], /^again/, 1),
    then1: c1[0].start, sun1: wt(c1[0], /^sun/), trees1: wt(c1[0], /^trees/), yawn1: wt(c1[0], /^yawn/),
    meets1: wt(c1[1], /^meets/), glimpse1: wt(c1[1], /^glimpse/), dawn1: wt(c1[1], /^dawn/),
    whole1: c1[2].start, dark1: wt(c1[2], /^dark/), see1: wt(c1[2], /^see/),
    so1: c1[3].start, youre1: wt(c1[3], /^you're/), next1: wt(c1[3], /^next/),
    do: v3[0].start, call1: wt(v3[0], /^call/, 0), wait: wt(v3[0], /^wait/), call2: wt(v3[0], /^call/, 1),
    fever: v3[1].start, skin: wt(v3[1], /^skin/), crawl: wt(v3[1], /^crawl/),
    unnatural: v3[2].start, eyes: wt(v3[2], /^eyes/),
    and3: v3[3].start, headache: wt(v3[3], /^headache/), straighten: wt(v3[3], /^straighten/),
    my: v4[0].start, blood: wt(v4[0], /^blood/), deep: wt(v4[0], /^deep/),
    room: wt(v4[1], /^room/), breaks: wt(v4[1], /^breaks/), house: wt(v4[1], /^house/), creak: wt(v4[1], /^creak/),
    windows: v4[2].start, open: wt(v4[2], /^open/), wind: wt(v4[2], /^wind/),
    oh4: v4[3].start, skyV4: wt(v4[3], /^sky/), give: wt(v4[3], /^give/), in4: lastWord(v4[3]),
    then2: c2[0].start, trees2: wt(c2[0], /^trees/), yawn2: wt(c2[0], /^yawn/),
    and2: c2[1].start, meets2: wt(c2[1], /^meets/), glimpse2: wt(c2[1], /^glimpse/),
    whole2: c2[2].start, asleep2: wt(c2[2], /^asleep/),
    so2: c2[3].start, youre2: wt(c2[3], /^you're/), so2b: lastWord(c2[3]),
    meet1: h1[0].start, horizon1: wt(h1[0], /^horizon/), oh1: h1[1].start, wont1: wt(h1[1], /^won't/),
    meet1b: h1[2].start, horizon1b: wt(h1[2], /^horizon/),
    no5: v5[0].start, lover5: wt(v5[0], /^lover/), some5: v5[1].start, cuts: wt(v5[1], /^cuts/),
    just5: v5[2].start, alone: wt(v5[2], /^alone/), when5: v5[3].start, sliver: wt(v5[3], /^sliver/), hope: wt(v5[3], /^hope/),
    and3c: c3[0].start, yawn3: wt(c3[0], /^yawn/), dark3: c3[1].start, relief: wt(c3[1], /^relief/),
    whole3: c3[2].start, except: wt(c3[2], /^except/), lie3: c3[3].start, miss: wt(c3[3], /^miss/), be3: wt(c3[3], /^be/), so3: lastWord(c3[3]),
    meet2: h2[0].start, horizon2: wt(h2[0], /^horizon/), oh2: h2[1].start, wont2: wt(h2[1], /^won't/),
    meet2b: h2[2].start, horizon2b: wt(h2[2], /^horizon/), ohEnd: lastWord(h2[2]),
    outro: sec('outro').from,
    end: score.endCardAt ?? score.duration,
    duration: score.duration,
  }

  /* ── The walk to the horizon: his depth, and how far the horizon still is ─ */
  const walkFrom = T.meet2 + 1.6
  const meetAt = T.outro + 7.2
  const himZ = (t) => {
    // Out of the window: 0 → 520 over the first two seconds of the hook.
    const out = 520 * easeInOut(ramp(t, T.meet2, walkFrom + 0.4))
    // Then walking at 110 units a second, easing to a stop where they meet.
    const tw = Math.max(0, t - walkFrom)
    const tm = meetAt - walkFrom
    const walked = tw < tm ? 110 * (tw - (tw * tw) / (2 * tm) * 0.55) : 110 * (tm - tm * 0.275)
    return out + walked
  }
  /* The horizon comes to meet him: its distance ahead of him, eased to nothing where they meet. */
  const ridgeAhead = (t) => lerp(RIDGE_Z - 520, 40, easeInOut(ramp(t, T.oh2 + 0.6, meetAt)))
  const ridgeZ = (t) => (t < T.oh2 ? RIDGE_Z : Math.min(RIDGE_Z, himZ(t) + ridgeAhead(t)))

  /* ── The camera ──────────────────────────────────────────────────────── */
  const K = []
  const key = (t, v) => K.push({ t, v: { x: 0, y: -40, d: 960, sy: 0, roll: 0, ...v } })
  key(0, { x: -110, y: -30, d: 1560 })
  key(T.no1 - 0.4, { x: -60, y: -10, d: 1040 })
  key(T.lover + 0.2, { x: 70, y: 50, d: 820 })
  key(T.some + 0.9, { x: 30, y: 0, d: 900 })
  key(T.just + 0.4, { x: 0, y: -40, d: 960 })
  key(T.thoughts + 0.7, { x: -30, y: -205, d: 1000 })
  key(T.sheep + 0.2, { x: 10, y: -215, d: 980 })
  key(T.light - 0.1, { x: -260, y: 70, d: 700 })
  key(T.sleep + 0.2, { x: -190, y: 95, d: 600 })
  key(T.sky - 0.2, { x: 0, y: -150, d: 1000 })
  key(T.wonder + 1.1, { x: 0, y: -260, d: 1080, sy: 150 })
  key(T.die + 0.1, { x: 0, y: -330, d: 1160, sy: 330 })
  key(T.troubles, { x: 30, y: -420, d: 1240, sy: 360, roll: -3 })
  key(T.repeat, { x: 70, y: -470, d: 1290, sy: 350, roll: -2.4 })
  key(T.then1 - 0.2, { x: 0, y: -40, d: 960 })
  key(T.trees1 - 0.3, { x: 0, y: -100, d: 560 })
  key(T.glimpse1, { x: 30, y: -108, d: 520 })
  key(T.dawn1 + 0.6, { x: 50, y: -100, d: 540 })
  key(T.whole1 + 0.9, { x: 0, y: -60, d: 660 })
  key(T.so1 + 0.4, { x: 0, y: 20, d: 880 })
  key(T.next1 + 0.2, { x: 20, y: 100, d: 700 })
  key(T.do - 0.7, { x: 10, y: 100, d: 720 })
  key(T.call1 + 0.4, { x: -370, y: 120, d: 520 })
  key(T.call2, { x: -350, y: 115, d: 545 })
  key(T.fever + 0.4, { x: 0, y: -30, d: 980 })
  key(T.crawl, { x: -60, y: 60, d: 880 })
  key(T.eyes, { x: -135, y: 118, d: 340 })
  key(T.straighten - 0.05, { x: -90, y: 30, d: 720, roll: 7 })
  key(T.straighten + 0.55, { x: -90, y: 10, d: 740, roll: 0 })
  key(T.deep - 0.9, { x: -40, y: -10, d: 860 })
  key(T.breaks + 0.2, { x: 0, y: -170, d: 2500 })
  key(T.creak + 0.2, { x: 20, y: -190, d: 2640 })
  key(T.open + 0.3, { x: 0, y: -100, d: 1000 })
  key(T.wind + 0.2, { x: 0, y: -105, d: 800 })
  key(T.skyV4, { x: 0, y: -115, d: 700 })
  key(T.give, { x: -10, y: -200, d: 250, sy: 60 })
  key(T.then2 + 1.2, { x: -60, y: -420, d: -380, sy: 110 })
  key(T.trees2, { x: -110, y: -560, d: -760, sy: -30 })
  key(T.meets2, { x: -150, y: -640, d: -1000, sy: 150 })
  key(T.asleep2, { x: -200, y: -660, d: -1200, sy: -110 })
  key(T.youre2, { x: -160, y: -640, d: -1400, sy: 140 })
  key(T.meet1, { x: -110, y: -610, d: -1560, sy: 120 })
  key(T.wont1, { x: -60, y: -570, d: -1720, sy: 80 })
  key(T.horizon1b + 0.2, { x: -20, y: -540, d: -1800, sy: 70 })
  key(T.horizon1b + 1.0, { x: 0, y: -300, d: -300, sy: 30 })
  key(T.no5 - 1.9, { x: 0, y: WIN_CY, d: 250 })
  key(T.no5 + 1.8, { x: 0, y: -20, d: 960 })
  key(T.lover5 + 0.3, { x: 70, y: 60, d: 840 })
  key(T.cuts + 0.2, { x: 0, y: 0, d: 950 })
  key(T.alone + 0.1, { x: 80, y: 85, d: 760 })
  key(T.sliver, { x: 0, y: -100, d: 560 })
  key(T.hope + 0.5, { x: -50, y: -30, d: 700 })
  key(T.yawn3, { x: 0, y: -100, d: 520 })
  key(T.relief + 0.3, { x: 0, y: -20, d: 950 })
  key(T.except + 0.2, { x: -50, y: -10, d: 800 })
  key(T.miss + 0.2, { x: 10, y: 50, d: 760 })
  key(T.so3 + 0.6, { x: 0, y: -90, d: 880 })
  key(T.meet2 - 0.7, { x: 0, y: -100, d: 840 })
  // Out through the window behind him, then down to walking height, following.
  const follow = (t, gap, extra = {}) => key(t, { x: 0, y: G - 380, d: gap - himZ(t), sy: -40, ...extra })
  key(T.horizon2 + 1.0, { x: 0, y: WIN_CY + 60, d: 170, sy: -130 })
  follow(T.oh2 + 1.4, 760, { y: G - 470, sy: -20 })
  follow(T.wont2, 900)
  follow(T.meet2b, 1050)
  follow(T.ohEnd + 1.2, 1200, { sy: -70 })
  follow(T.outro + 3, 1400, { sy: 30 })
  // As they meet, the camera eases back and up from them, still moving when the end card lands.
  follow(T.end + 3, 2200, { y: G - 480, sy: 170 })
  K.sort((a, b) => a.t - b.t)

  /* The click, for the heartbeat: 55 BPM felt at 110 — an eighth is a heartbeat. */
  const beat = 60 / (score.bpm ?? 55) / 2
  const phase = score.beatPhase ?? 0
  const lastBeat = (t) => phase + Math.floor((t - phase) / beat) * beat

  const cam = (t) => {
    const c = {}
    for (const k of ['x', 'y', 'd', 'sy', 'roll']) c[k] = pchipAt(K, t, k)
    // A handheld drift in screen units, so the camera never stands still.
    c.sx = 5 * Math.sin(t * 0.41) + 3 * Math.sin(t * 0.23 + 1.3)
    c.sy += 4 * Math.sin(t * 0.33 + 0.4) + 2 * Math.sin(t * 0.17 + 2.1)
    // The heartbeat: a push on every eighth of the click from "Unnatural" to "straighten".
    const hb = clamp01(ramp(t, T.unnatural - 0.4, T.eyes) * (1 - ramp(t, T.straighten, T.straighten + 0.4)) + 0.6 * ramp(t, T.skin, T.unnatural) * (1 - ramp(t, T.straighten, T.straighten + 0.4)))
    if (hb > 0 && c.d > 0) {
      const since = t - lastBeat(t)
      c.d *= 1 - 0.035 * hb * Math.exp(-since / 0.11)
    }
    // Shakes: the house breaking the silence and creaking, the rewind's two agains.
    const shake = 14 * ring(t, T.breaks, 6, 0.3) + 18 * ring(t, T.creak, 5, 0.4) + 7 * ring(t, T.again1, 8, 0.2) + 9 * ring(t, T.again2, 8, 0.2)
    c.sx += shake
    c.sy += 0.6 * ring(t + 0.05, T.creak, 4, 0.4) * 12
    return c
  }

  return { T, cam, himZ, ridgeZ, meetAt, walkFrom, beat, keys: K }
}

/* ══ THE NIGHT'S STATE: how far the dawn has been burnished, and the room ══ */

function stateAt(plan, now) {
  const { T } = plan
  // The dawn in the sky, 0 at midnight and 1 at sunrise. Twice.
  let dawn = 0
  dawn += 0.3 * smooth(ramp(now, T.sun1 - 0.4, T.see1))
  dawn *= 1 - smooth(ramp(now, T.fever + 1.2, T.fever + 1.8)) // re-rocked away
  dawn += 0.5 * smooth(ramp(now, T.then2, T.so2b)) * (now > T.fever ? 1 : 0)
  dawn += 0.12 * smooth(ramp(now, T.meet1, T.cuts))
  dawn += 0.26 * smooth(ramp(now, T.when5, T.relief))
  dawn += 0.12 * smooth(ramp(now, T.relief, T.meet2b))
  dawn = clamp01(dawn)
  // Daylight in the room: none until the second dawn has come in through the open window.
  const day = 0.5 * smooth(ramp(now, T.no5, T.hope + 1)) + 0.5 * smooth(ramp(now, T.hope, T.so3))
  // The plate burnished out of black in the intro, and burnished to near paper at the end.
  const reveal = smooth(ramp(now, 0.3, 9.5))
  const burn = smooth(ramp(now, plan.meetAt - 3, T.end - 0.3))
  // The red horizon: drawn on "meets", rocked away with the first dawn, drawn again.
  const red1 = ramp(now, T.meets1, T.meets1 + 1.3) * (1 - smooth(ramp(now, T.fever + 0.9, T.fever + 1.5)))
  const red2 = ramp(now, T.meets2 - 0.1, T.meets2 + 1.5)
  const lamp = 1 - smooth(ramp(now, T.light - 0.02, T.light + 0.16))
  return { dawn, day, reveal, burn, red1, red2, lamp }
}

/* ══ DEFS: gradients recoloured every frame, patterns baked once ═══════ */

const GRAIN = memo('grain', () => {
  let d = ''
  for (let i = 0; i < 140; i++) d += circ(hash(i, 1, 7) * 83, hash(i, 2, 7) * 83, 0.45 + hash(i, 3, 7) * 0.8)
  return d
})
const BURR = memo('burr', () => {
  let d = ''
  for (let i = 0; i < 60; i++) d += circ(hash(i, 1, 9) * 59, hash(i, 2, 9) * 59, 0.5 + hash(i, 3, 9) * 0.7)
  return d
})

function defs(ctx) {
  const { uid, c, st } = ctx
  const lampLit = mix(c(0.72), PAPER, 0.3)
  const hy = ctx.hy
  // Velvet black at the top; the lowest band of sky burnished up first, and furthest.
  const sky = [
    [0, c(0.01)],
    [0.45, mix(c(0.03 + 0.2 * st.dawn), GOLD, 0.05 * st.dawn)],
    [0.74, mix(c(0.07 + 0.42 * st.dawn), GOLD, 0.28 * st.dawn)],
    [0.9, mix(c(0.16 + 0.6 * st.dawn), GOLD, 0.55 * st.dawn)],
    [1, mix(c(0.24 + 0.72 * st.dawn), GOLD, 0.7 * st.dawn)],
  ]
  const skyStop = (col) => mix(col, mix(PAPER, GOLD, 0.25), 0.75 * st.burn)
  return `
    <linearGradient id="${uid}-sky" gradientUnits="userSpaceOnUse" x1="0" y1="${r(hy - 820)}" x2="0" y2="${r(hy + 2)}">${sky.map(([o, col]) => `<stop offset="${o}" stop-color="${skyStop(col)}"/>`).join('')}</linearGradient>
    <radialGradient id="${uid}-glow"><stop offset="0" stop-color="${mix(GOLD, PAPER, 0.35)}" stop-opacity="0.95"/><stop offset="0.3" stop-color="${GOLD}" stop-opacity="0.55"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${uid}-light"><stop offset="0" stop-color="${PAPER}" stop-opacity="0.9"/><stop offset="0.45" stop-color="${PAPER}" stop-opacity="0.35"/><stop offset="1" stop-color="${PAPER}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${uid}-lamp"><stop offset="0" stop-color="${lampLit}" stop-opacity="0.85"/><stop offset="0.5" stop-color="${lampLit}" stop-opacity="0.3"/><stop offset="1" stop-color="${lampLit}" stop-opacity="0"/></radialGradient>
    <radialGradient id="${uid}-dark"><stop offset="0.45" stop-color="${INK}" stop-opacity="0"/><stop offset="1" stop-color="${INK}" stop-opacity="1"/></radialGradient>
    <linearGradient id="${uid}-shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(PAPER, GOLD, 0.25 * st.dawn)}" stop-opacity="0"/><stop offset="0.2" stop-color="${mix(PAPER, GOLD, 0.25 * st.dawn)}" stop-opacity="0.5"/><stop offset="1" stop-color="${PAPER}" stop-opacity="0"/></linearGradient>
    <linearGradient id="${uid}-fold" x1="0" y1="0" x2="46" y2="0" spreadMethod="repeat" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c(0.1)}"/><stop offset="0.55" stop-color="${c(0.3)}"/><stop offset="1" stop-color="${c(0.1)}"/></linearGradient>
    <linearGradient id="${uid}-cut" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c(0.34)}"/><stop offset="1" stop-color="${c(0.16)}"/></linearGradient>
    <linearGradient id="${uid}-land" gradientUnits="userSpaceOnUse" x1="0" y1="${r(ctx.ridgeY)}" x2="0" y2="${r(ctx.ridgeY + 420)}"><stop offset="0" stop-color="${mix(c(0.14 + 0.34 * st.dawn, 0.35), GOLD, 0.22 * st.dawn)}"/><stop offset="0.18" stop-color="${mix(c(0.09 + 0.2 * st.dawn, 0.32), GOLD, 0.1 * st.dawn)}"/><stop offset="0.5" stop-color="${c(0.045 + 0.06 * st.dawn, 0.3)}"/><stop offset="1" stop-color="${c(0.02, 0.25)}"/></linearGradient>
    <pattern id="${uid}-grain" width="83" height="83" patternUnits="userSpaceOnUse"><path d="${GRAIN}" fill="${INK}" opacity="0.42"/></pattern>
    <pattern id="${uid}-burr" width="59" height="59" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><path d="${BURR}" fill="${PAPER}" opacity="0.07"/></pattern>`
}

/* ══ THE SKY: at infinity, in screen units ═════════════════════════════ */

/* Stars in sky coordinates: u across, v up from the horizon. */
const STARS = memo('stars', () => Array.from({ length: 190 }, (_, i) => ({
  u: (hash(i, 1, 21) - 0.5) * 3200,
  v: 20 + hash(i, 2, 21) ** 0.8 * 1500,
  size: 0.7 + hash(i, 3, 21) ** 3 * 2.4,
  w: 0.6 + hash(i, 4, 21) * 2.2,
  ph: hash(i, 5, 21) * 6.28,
})))

function skyLayer(ctx, now) {
  const { uid, cam, st, T, plan, hy } = ctx
  let out = `<rect x="-400" y="-400" width="2400" height="${r(Math.max(0, hy + 402))}" fill="url(#${uid}-sky)"/>`
  // Stars go out as the dawn comes up; twinkle harder on "sweeter".
  const vis = (1 - clamp01(st.dawn * 1.5)) * st.reveal
  if (vis > 0.01) {
    // Trails: the stars wheel on "afraid" and unwind on "repeat".
    const wind = 0.95 * smooth(ramp(now, T.afraid - 0.4, T.troubles + 0.3)) * (1 - easeInOut(ramp(now, T.repeat, T.then1 - 0.2)))
    const px = CX + cam.sx + 420 - cam.x * 0.03
    const py = hy - 880 - cam.y * 0.08
    const sweet = bump(now, T.sweeter - 0.1, 0.25, 1.6)
    const groups = [['', 0], ['', 0], ['', 0]]
    for (let i = 0; i < STARS.length; i++) {
      const s = STARS[i]
      const x = CX + cam.sx + s.u - cam.x * 0.03
      const y = hy - s.v - cam.y * 0.08
      if (y > hy - 4) continue
      const tw = 0.62 + 0.38 * Math.sin(now * s.w + s.ph) * (0.4 + sweet)
      const gi = s.size > 2 ? 2 : s.size > 1.2 ? 1 : 0
      const a = Math.atan2(y - py, x - px)
      const rad = Math.hypot(x - px, y - py)
      if (wind > 0.004) {
        const a1 = a + wind
        const large = wind > Math.PI ? 1 : 0
        groups[gi][0] += `M${P(x, y)}A${r(rad)} ${r(rad)} 0 ${large} 1 ${P(px + Math.cos(a1) * rad, py + Math.sin(a1) * rad)}`
      }
      else groups[gi][0] += `M${P(x, y)}l0.01 0`
      groups[gi][1] += tw
    }
    const widths = [1.6, 2.6, 4]
    out += groups.map(([d], gi) => pen(d, mix(ctx.c(0.95), PAPER, 0.5), widths[gi], vis * (gi === 2 ? 1 : gi === 1 ? 0.85 : 0.65) * (0.85 + 0.3 * sweet))).join('')
  }
  // The moon, high on the right, setting as the dawn comes up.
  const moonK = (1 - smooth(ramp(st.dawn, 0.15, 0.55))) * st.reveal
  if (moonK > 0.01) {
    const mx = CX + cam.sx + 560 - cam.x * 0.03
    const my = hy - 470 - cam.y * 0.08 + 260 * st.dawn
    out += `<circle cx="${r(mx)}" cy="${r(my)}" r="120" fill="url(#${uid}-light)"${op(0.35 * moonK)}/>`
    out += fillD(circ(mx, my, 30), ctx.c(0.9), moonK) + fillD(circ(mx - 9, my - 6, 26), ctx.c(0.78), 0.5 * moonK)
  }
  // The dawn's glow on the horizon, over the lane, and the sun.
  const sunX = CX + cam.sx - cam.x * 0.02
  if (st.dawn > 0.01) {
    const gw = 520 + 900 * st.dawn
    out += `<ellipse cx="${r(sunX)}" cy="${r(hy)}" rx="${r(gw)}" ry="${r(gw * 0.42)}" fill="url(#${uid}-glow)"${op(Math.min(1, st.dawn * 1.4))}/>`
  }
  // The sun: a sliver on "sliver", half up in the last chorus, clear of the ridge where they meet.
  const rise = 0.3 * smooth(ramp(now, T.sliver - 0.3, T.sliver + 0.6)) + 0.35 * smooth(ramp(now, T.and3c, T.relief)) + 1.6 * smooth(ramp(now, plan.meetAt - 4, T.end))
  if (rise > 0.001) {
    const sr = 58
    const sy = ctx.ridgeY + sr - rise * sr * 2.1
    out += `<circle cx="${r(sunX)}" cy="${r(sy)}" r="${r(sr * 2.4)}" fill="url(#${uid}-glow)"${op(clamp01(rise * 3))}/>`
    out += `<circle cx="${r(sunX)}" cy="${r(sy)}" r="${sr}" fill="${mix(GOLD, PAPER, 0.55 + 0.35 * st.burn)}"/>`
  }
  return out
}

/* ══ THE LAND: fields, the village, the treeline, the ridge ═══════════ */

/* The treeline, in its own units at depth TREES_Z: pines either side of a lane. */
const TREELINE = memo('trees', () => {
  const trees = []
  for (let side = -1; side <= 1; side += 2) {
    let x = side * 520
    let i = 0
    while (Math.abs(x) < 9000) {
      const h = 640 + hash(i, side + 3, 31) * 380 + (Math.abs(x) < 900 ? 120 : 0)
      const w = h * (0.36 + hash(i, side + 5, 31) * 0.14)
      trees.push({ x, h, w, seed: i * 2 + side })
      x += side * (w * (0.52 + hash(i, side + 7, 31) * 0.3))
      i++
    }
  }
  return trees
})
function pineD(x, base, h, w, seed) {
  // A tiered pine: three stacked, drooping skirts, soft at the tips.
  const tiers = 4
  let d = ''
  for (let k = 0; k < tiers; k++) {
    const top = base - h + (h * k) / (tiers + 0.6)
    const bot = base - h * 0.08 - (h * (tiers - 1 - k)) / (tiers + 1.4)
    const hw = (w / 2) * (0.45 + (0.55 * (k + 1)) / tiers)
    const j = (hash(k, 1, seed) - 0.5) * hw * 0.2
    d += `M${P(x, top)}Q${P(x - hw * 0.35 + j, (top + bot) / 2)} ${P(x - hw, bot)}Q${P(x, bot - h * 0.05)} ${P(x + hw, bot)}Q${P(x + hw * 0.35 + j, (top + bot) / 2)} ${P(x, top)}Z`
  }
  return d + rectD(x - w * 0.04, base - h * 0.1, w * 0.08, h * 0.1)
}

function treeLayer(ctx, now) {
  const { cam, T, st } = ctx
  const z = TREES_Z
  if (cam.d + z < 80) return ''
  const s = scaleAt(cam, z)
  // Yawn: they stretch up and lean on every "yawn" (and settle), and sway a little always.
  const yawn = [T.yawn1, T.yawn2, T.yawn3].reduce((a, at) => a + bump(now, at - 0.7, 0.9, 1.7), 0)
  const stretch = 1 + 0.16 * yawn
  const lean = 4 * yawn + 0.8 * Math.sin(now * 0.5)
  const view0 = cam.x - (CX + 400) / s
  const view1 = cam.x + (CX + 400) / s
  let d = ''
  let rim = ''
  for (const tr of TREELINE) {
    if (tr.x + tr.w < view0 || tr.x - tr.w > view1) continue
    const h = tr.h * stretch
    d += pineD(tr.x, G, h, tr.w, tr.seed)
    rim += `M${P(tr.x, G - h)}l${r(-tr.w * 0.16)} ${r(h * 0.28)}`
  }
  const col = ctx.c(0.035 + 0.05 * st.dawn, 0.35)
  const rimCol = mix(ctx.c(0.3 + 0.4 * st.dawn), GOLD, 0.4 * st.dawn)
  // Once the horizon has come nearer than the trees, they go down behind it.
  const behind = clamp01((ctx.ridge - TREES_Z + 500) / 500)
  if (behind <= 0.003) return ''
  return `<g transform="${layerT(cam, z)}"${op(behind)}><g transform="translate(0 ${G}) skewX(${r(-lean, 2)}) translate(0 ${-G})">${fillD(d, col)}</g></g>`
}

/* The village: a handful of houses with dark windows, asleep. */
const VILLAGE = memo('village', () => Array.from({ length: 11 }, (_, i) => ({
  x: -3600 + i * 420 + (hash(i, 1, 41) - 0.5) * 160,
  w: 220 + hash(i, 2, 41) * 180,
  h: 170 + hash(i, 3, 41) * 120,
  roof: 90 + hash(i, 4, 41) * 70,
})).filter((h) => Math.abs(h.x) > 700))

function villageLayer(ctx) {
  const { cam, st } = ctx
  const z = VILLAGE_Z
  if (cam.d + z < 80) return ''
  let d = ''
  let win = ''
  for (const h of VILLAGE) {
    const x0 = h.x - h.w / 2
    d += `M${P(x0, G)}V${r(G - h.h)}L${P(h.x, G - h.h - h.roof)}L${P(x0 + h.w, G - h.h)}V${r(G)}Z`
    d += rectD(h.x + h.w * 0.18, G - h.h - h.roof * 0.9, 26, h.roof * 0.5)
    win += rectD(h.x - h.w * 0.25, G - h.h * 0.65, 34, 40) + rectD(h.x + h.w * 0.12, G - h.h * 0.65, 34, 40)
  }
  return `<g transform="${layerT(cam, z)}">${fillD(d, ctx.c(0.05 + 0.08 * st.dawn))}${fillD(win, ctx.c(0.02))}</g>`
}

/* Hedgerows across the fields, at these depths, so the ground has somewhere to be. */
const HEDGES = [1400, 2300, 5200, 9500, 15000]
function fieldsLayer(ctx, z) {
  const { cam, st } = ctx
  if (cam.d + z < 160) return ''
  const s = scaleAt(cam, z)
  const y = groundY(cam, z, laneLift(ctx, z))
  if (y > 1300 || y < -300) return ''
  const h = 40 * s
  const gap0 = CX + cam.sx + (-125 - cam.x) * s
  const gap1 = CX + cam.sx + (125 - cam.x) * s
  const run = (x0, x1) => {
    if (x1 - x0 < 2) return ''
    let d = `M${r(x0)} ${r(y + 2)}`
    for (let x = x0; x <= x1; x += 26) d += `L${r(x)} ${r(y - h * (0.4 + 0.6 * hash(Math.round((x + cam.x * s) / 26), z, 51)))}`
    return d + `L${r(x1)} ${r(y - h * 0.5)}L${r(x1)} ${r(y + 2)}Z`
  }
  const near = clamp01((cam.d + z - 160) / 500)
  return fillD(run(-400, Math.min(gap0, 2000)) + run(Math.max(gap1, -400), 2000), ctx.c(0.03 + 0.06 * st.dawn, 0.45), near)
}

/* The ridge: where the land meets the sky, and the red line along it. */
/*
 * The ridge's crest is kept on the eye line, which is where a horizon is: it
 * is a hill exactly as high as the camera's eye, however near it comes. So a
 * figure who stands on it stands on the horizon, against the sky, and the lane
 * climbs to it over its last stretch.
 */
const hillAt = (x, z) => (40 * Math.sin(x * 0.00031 + 1.1) + 24 * Math.sin(x * 0.00083 + 0.3)) * clamp01(z / 7000)
const SLOPE = 1800
/** How high the ground has risen at depth z: nothing, then up the ridge's slope to its crest. */
function laneLift(ctx, z) {
  const z0 = ctx.ridge - SLOPE
  return z <= z0 ? 0 : ctx.crest * smooth((z - z0) / SLOPE)
}
/** The crest's height at x: where a figure on the horizon stands. */
const ridgeTop = (ctx, x) => G - ctx.crest - hillAt(x, ctx.ridge)
function ridgeLayer(ctx, now) {
  const { cam, st, uid } = ctx
  const z = ctx.ridge
  const s = scaleAt(cam, z)
  const pts = []
  for (let sx = -420; sx <= 2020; sx += 20) {
    const wx = cam.x + (sx - CX - cam.sx) / s
    pts.push([sx, groundY(cam, z, ctx.crest + hillAt(wx, z))])
  }
  const line = 'M' + pts.map(([x, y]) => P(x, y)).join('L')
  const landD = `${line}L2020 1300L-420 1300Z`
  let out = fillD(landD, `url(#${uid}-land)`)
  // The lane: a pale track from under the camera to the ridge.
  const zn = Math.max(cam.d + 90, 150) - cam.d + 0
  const near = Math.max(zn, 0)
  if (near < z - 50) {
    const lane = []
    const steps = 18
    for (let i = 0; i <= steps; i++) {
      const zz = near + (z - near) * (i / steps) ** 2.4
      lane.push(toScreen(cam, zz, -95 - 20 * (1 - i / steps), G - laneLift(ctx, zz)))
    }
    for (let i = steps; i >= 0; i--) {
      const zz = near + (z - near) * (i / steps) ** 2.4
      lane.push(toScreen(cam, zz, 95 + 20 * (1 - i / steps), G - laneLift(ctx, zz)))
    }
    out += fillD(poly(lane), mix(ctx.c(0.1 + 0.3 * st.dawn, 0.5), GOLD, 0.15 * st.dawn), 0.8 * st.reveal)
  }
  // The red horizon, drawn on from the left.
  const red = Math.max(st.red1, st.red2)
  if (red > 0.001) {
    const k = red >= 1 ? 1 : red
    out += pen(line, RED, 2.6 + 1.4 * smooth(ramp(now, ctx.plan.meetAt - 6, ctx.plan.meetAt)), 1, k < 1 ? ` pathLength="1" stroke-dasharray="${r(k, 3)} 1"` : '')
  }
  return out
}

/* ══ THE HOUSE: the bedroom, and the house it is in ═══════════════════ */

/* The house from outside, round the cutaway room: at depth 0 with the room. */
function houseOutside(ctx) {
  const { c, st } = ctx
  const { x0, x1, eaves, peak } = HOUSE
  // The hill under it.
  let out = fillD(`M-5200 ${G + 30}Q-1800 ${G - 120} 0 ${G - 10}Q1800 ${G - 110} 5200 ${G + 40}V${G + 2600}H-5200Z`, c(0.05 + 0.05 * st.dawn))
  const wall = `M${P(x0, G)}V${eaves}H${x1}V${G}Z M${P(ROOM.x0 - 40, ROOM.top - 40)}V${ROOM.floor + 50}H${ROOM.x1 + 40}V${ROOM.top - 40}Z`
  out += `<path d="${wall}" fill="${c(0.2 + 0.12 * st.dawn)}" fill-rule="evenodd"/>`
  // Moonlight on the facade, from the upper right.
  out += `<ellipse cx="500" cy="-200" rx="1300" ry="900" fill="url(#${ctx.uid}-light)"${op(0.22 * st.reveal)}/>`
  // Clapboard: faint burnished rules.
  let boards = ''
  for (let y = eaves + 34; y < G; y += 34) if (y < ROOM.top - 40 || y > ROOM.floor + 50) boards += `M${x0} ${y}H${x1}`
  else boards += `M${x0} ${y}H${ROOM.x0 - 40}M${ROOM.x1 + 40} ${y}H${x1}`
  out += pen(boards, c(0.1 + 0.08 * st.dawn), 4, 0.6)
  // The roof and a chimney.
  out += fillD(`M${P(x0 - 90, eaves + 10)}L0 ${peak}L${P(x1 + 90, eaves + 10)}Z`, c(0.08 + 0.06 * st.dawn))
  out += pen(`M0 ${peak}L${P(x1 + 90, eaves + 10)}`, c(0.62 + 0.2 * st.dawn), 10, 0.8) + pen(`M${P(x0 - 90, eaves + 10)}L0 ${peak}`, c(0.4), 6, 0.5)
  out += fillD(rectD(480, peak + 260, 110, 300), c(0.08 + 0.05 * st.dawn))
  // The downstairs: a door and two dark windows.
  out += fillD(rectD(-620, 470, 200, 150) + rectD(420, 470, 200, 150), c(0.03)) + fillD(rectD(-90, 450, 180, G - 450), c(0.05))
  // The cut: the wall's thickness and the floor slab, burnished lighter where they are cut.
  out += fillD(rectD(ROOM.x0 - 40, ROOM.top - 40, 40, ROOM.floor - ROOM.top + 90) + rectD(ROOM.x1, ROOM.top - 40, 40, ROOM.floor - ROOM.top + 90) + rectD(ROOM.x0 - 40, ROOM.top - 40, ROOM.x1 - ROOM.x0 + 80, 40) + rectD(ROOM.x0 - 40, ROOM.floor, ROOM.x1 - ROOM.x0 + 80, 50), c(0.3 + 0.2 * st.dawn))
  return out
}

/* The window's light falling into the room, over the bed: a shaft from the sill to the floor, widening. */
function shaft(ctx) {
  const { st, uid } = ctx
  const k = (0.3 + 0.35 * st.dawn + 0.6 * st.day) * st.reveal
  return `<path d="M${P(WIN.x0 + 10, WIN.y1)}L${P(WIN.x1 - 10, WIN.y1)}L${P(WIN.x1 + 250, ROOM.floor)}L${P(WIN.x0 - 190, ROOM.floor)}Z" fill="url(#${uid}-shaft)"${op(0.55 * k)}/>`
}

/* The back wall with the window hole, the ceiling and the floor. */
function roomBack(ctx, now) {
  const { c, st, uid, T } = ctx
  const amb = ctx.amb
  const wallD = `${rectD(ROOM.x0, ROOM.top, ROOM.x1 - ROOM.x0, ROOM.floor - ROOM.top)}M${P(WIN.x0, WIN.y0)}V${WIN.y1}H${WIN.x1}V${WIN.y0}Z`
  let out = `<clipPath id="${uid}-wall"><path d="${wallD}" clip-rule="evenodd"/></clipPath><path d="${wallD}" fill="${c(0.5 * amb)}" fill-rule="evenodd"/>`
  let light = ''
  // The window's light on the wall: moonlight, then the dawn.
  const spill = 0.5 + 0.35 * st.dawn + 0.4 * st.day
  light += `<ellipse cx="0" cy="${WIN_CY + 40}" rx="${r(620 + 200 * st.day)}" ry="${r(470 + 120 * st.day)}" fill="url(#${uid}-light)"${op(spill * 0.42 * st.reveal)}/>`
  // The lamp's pool.
  if (st.lamp > 0.01) light += `<ellipse cx="-470" cy="80" rx="430" ry="360" fill="url(#${uid}-lamp)"${op(st.lamp * 0.8 * st.reveal)}/>`
  out += `<g clip-path="url(#${uid}-wall)">${light}</g>`
  // The ceiling's cornice and the floor.
  out += fillD(rectD(ROOM.x0, ROOM.top, ROOM.x1 - ROOM.x0, 26), c(0.28 * amb + 0.06)) + fillD(rectD(ROOM.x0, ROOM.top + 26, ROOM.x1 - ROOM.x0, 5), c(0.5 * amb + 0.1), 0.6)
  out += fillD(rectD(ROOM.x0, ROOM.floor - 30, ROOM.x1 - ROOM.x0, 30), c(0.22 * amb + 0.04))
  // The clock.
  out += clock(ctx, now)
  // The door on the right, with a line of paper under it.
  out += fillD(rectD(470, -170, 190, ROOM.floor - 30 + 170), c(0.32 * amb + 0.02)) + pen(rectD(488, -150, 154, 200) + rectD(488, 80, 154, 190), c(0.44 * amb + 0.05), 4, 0.6) + fillD(circ(630, 70, 8), c(0.7 * amb + 0.1))
  // The window: casing, sill, sashes (swing open on "open"), curtains.
  out += windowFrame(ctx, now)
  return out
}

function clock(ctx, now) {
  const { c, T, amb } = ctx
  const x = -470
  const y = -150
  const rad = 46
  // 3:07, running; spun back to 3:07 on "repeat"; then on, faster, towards dawn.
  let m
  if (now < T.repeat) m = 187 + 0.72 * now
  else if (now < T.then1) m = lerp(187 + 0.72 * T.repeat, 187, easeInOut(ramp(now, T.repeat, T.then1 - 0.1)))
  else m = 187 + ((352 - 187) * (now - T.then1)) / (T.end - T.then1)
  const ma = ((m % 60) / 60) * Math.PI * 2 - Math.PI / 2
  const ha = (((m / 60) % 12) / 12) * Math.PI * 2 - Math.PI / 2
  const face = c(0.62 * amb + 0.12 + 0.2 * ctx.st.lamp)
  return fillD(circ(x, y, rad + 6), c(0.2 * amb + 0.03)) + fillD(circ(x, y, rad), face)
    + pen(`M${P(x, y)}L${P(x + Math.cos(ha) * rad * 0.52, y + Math.sin(ha) * rad * 0.52)}`, c(0.03), 5)
    + pen(`M${P(x, y)}L${P(x + Math.cos(ma) * rad * 0.8, y + Math.sin(ma) * rad * 0.8)}`, c(0.03), 3)
    + fillD(circ(x, y, 4), c(0.03))
}

function windowFrame(ctx, now) {
  const { c, T, amb, st } = ctx
  const { x0, x1, y0, y1 } = WIN
  const w = x1 - x0
  const lit = 0.3 + 0.4 * st.dawn + 0.4 * st.day
  let out = ''
  // Casing and sill.
  out += `<path d="M${P(x0 - 30, y0 - 30)}H${x1 + 30}V${y1 + 6}H${x0 - 30}Z M${P(x0, y0)}V${y1}H${x1}V${y0}Z" fill="${c(0.24 * amb + 0.05)}" fill-rule="evenodd"/>`
  out += fillD(rectD(x0 - 48, y1, w + 96, 20), c(0.3 * amb + 0.08)) + fillD(rectD(x0 - 48, y1, w + 96, 3.5), c(lit * 0.9), 0.9)
  // The sashes: two casements hinged at the sides, swinging out on "open".
  const a = easeInOut(ramp(now, T.open - 0.35, T.open + 0.9)) * 1.25 + 0.08 * Math.sin(now * 1.3) * ramp(now, T.wind - 0.5, T.wind + 1)
  const cw = (w / 2) * Math.cos(Math.min(a, 1.45))
  const lift = (w / 2) * Math.sin(Math.min(a, 1.45)) * 0.08
  const sash = (hx, dir) => {
    const inner = hx + dir * cw
    const frame = `M${P(hx, y0 + 4)}L${P(inner, y0 + 4 - lift)}L${P(inner, y1 - 4 + lift)}L${P(hx, y1 - 4)}Z`
    // The transom sits high, clear of the horizon behind it.
    const tb = y0 + (y1 - y0) * 0.36
    const glass = `M${P(hx + dir * 12, y0 + 16)}L${P(inner - dir * 10, y0 + 16 - lift)}L${P(inner - dir * 10, tb - 7)}L${P(hx + dir * 12, tb - 7)}Z M${P(hx + dir * 12, tb + 7)}L${P(inner - dir * 10, tb + 7)}L${P(inner - dir * 10, y1 - 16 + lift)}L${P(hx + dir * 12, y1 - 16)}Z`
    // Glass: a faint pane of the room's light, brighter as it turns edge on to the window.
    return `<path d="${frame} ${glass}" fill="${c(0.14 * amb + 0.04)}" fill-rule="evenodd"/>` + fillD(glass, c(0.8), 0.04 + 0.1 * Math.sin(Math.min(a, 1.45)))
  }
  out += sash(x0, 1) + sash(x1, -1)
  out += curtains(ctx, now)
  return out
}

function curtains(ctx, now) {
  const { c, T, uid, amb } = ctx
  // Billow on the wind: the free edge swings in and the hem lifts, a wave running down.
  const gust = smooth(ramp(now, T.wind - 0.6, T.wind + 0.5)) * (1 - 0.6 * smooth(ramp(now, T.give, T.then2 + 4)))
  const breeze = now > T.open ? 0.25 : 0
  const blow = gust + breeze
  const panel = (xo, xi, dir, seed) => {
    const pts = []
    for (let i = 0; i <= 8; i++) {
      const u = i / 8
      const y = -300 + u * 360
      const wave = blow * (40 + 60 * u) * (0.6 + 0.4 * Math.sin(now * 2.1 + u * 4 + seed))
      pts.push([xi + dir * wave, y - blow * 30 * u * u])
    }
    const hem = pts[pts.length - 1]
    return `M${P(xo, -300)}L${pts.map(([x, y]) => P(x, y)).join('L')}Q${P((xo + hem[0]) / 2, hem[1] + 30)} ${P(xo, 70)}Z`
  }
  const l = panel(-360, -200, 1, 0)
  const rr = panel(360, 200, -1, 2)
  return fillD(l + rr, `url(#${uid}-fold)`, 0.92) + fillD(rectD(-400, -318, 800, 12), c(0.3 * amb + 0.08))
}

/* ── The bed, him in it, and her ─────────────────────────────────────── */

const BED = { x0: -300, x1: 300, head: 70, top: 150, foot: 300 }
const HEAD = { x: -135, y: 120 }

function bed(ctx, now) {
  const { c, amb, st, uid } = ctx
  const lit = amb + 0.3 * st.lamp
  const hi = (x, y, rx, ry, o) => `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(rx)}" ry="${r(ry)}" fill="url(#${uid}-light)"${op(o * st.reveal)}/>`
  let out = ''
  // Headboard.
  out += fillD(`M${P(BED.x0, BED.top)}V${BED.head + 30}Q${P(BED.x0, BED.head)} ${P(BED.x0 + 30, BED.head)}H${BED.x1 - 30}Q${P(BED.x1, BED.head)} ${P(BED.x1, BED.head + 30)}V${BED.top}Z`, c(0.2 * lit + 0.03))
  out += pen(`M${P(BED.x0 + 30, BED.head + 4)}H${BED.x1 - 30}`, c(0.6 * lit + 0.12), 4, 0.75)
  // The blanket, from the pillows to the foot.
  const blanket = `M${P(BED.x0 - 8, BED.top + 20)}L${P(BED.x1 + 8, BED.top + 20)}L${P(BED.x1 + 40, BED.foot)}L${P(BED.x1 + 40, ROOM.floor - 8)}L${P(BED.x0 - 40, ROOM.floor - 8)}L${P(BED.x0 - 40, BED.foot)}Z`
  out += fillD(blanket, c(0.3 * lit + 0.05))
  // His body under it: a long soft rise, lit along its crest; his feet at the end of it.
  out += fillD(`M${P(HEAD.x - 118, BED.top + 42)}Q${P(HEAD.x, BED.top + 12)} ${P(HEAD.x + 118, BED.top + 42)}L${P(HEAD.x + 132, BED.foot - 4)}Q${P(HEAD.x, BED.foot - 34)} ${P(HEAD.x - 140, BED.foot - 4)}Z`, c(0.4 * lit + 0.06))
  out += pen(`M${P(HEAD.x - 70, BED.top + 34)}Q${P(HEAD.x - 10, BED.top + 60)} ${P(HEAD.x + 6, BED.foot - 30)}`, c(0.62 * lit + 0.1), 12, 0.35)
  out += fillD(ellipse(HEAD.x - 36, BED.foot - 14, 30, 19) + ellipse(HEAD.x + 36, BED.foot - 14, 30, 19), c(0.5 * lit + 0.08))
  // Folds across the flat side.
  out += pen(`M${P(40, BED.top + 60)}Q${P(150, BED.top + 80)} ${P(280, BED.top + 58)}M${P(20, BED.top + 118)}Q${P(170, BED.top + 140)} ${P(318, BED.top + 112)}`, c(0.46 * lit + 0.08), 6, 0.55)
  out += pen(`M${P(BED.x0 - 40, BED.foot)}H${BED.x1 + 40}`, c(0.62 * lit + 0.1), 5, 0.7)
  out += fillD(rectD(BED.x0 - 40, ROOM.floor - 12, BED.x1 - BED.x0 + 80, 10), c(0.12 * lit + 0.02))
  // Pillows, burnished pale along their tops; a dent in hers.
  out += fillD(blobD(HEAD.x, 136, 122, 34, 3, 12, 0.06) + blobD(-HEAD.x, 136, 122, 34, 4, 12, 0.06), c(0.46 * lit + 0.1))
  out += hi(HEAD.x, 124, 110, 26, 0.75) + hi(-HEAD.x, 124, 110, 26, 0.75)
  out += fillD(ellipse(-HEAD.x + 8, 134, 58, 13), c(0.34 * lit + 0.06), 0.8)
  out += fillD(ellipse(HEAD.x, 152, 112, 10) + ellipse(-HEAD.x, 152, 112, 10), c(0.26 * lit + 0.04), 0.7)
  // The window's light over the whole bed.
  out += hi(0, BED.top + 30, 380, 150, 0.14 + 0.2 * st.dawn + 0.3 * st.day)
  return out
}

/** Him lying in bed, seen from the foot: his face on the pillow, eyes open. `sit` sits him up. */
function lyingHim(ctx, now, o = {}) {
  const { c, amb, st, T, uid } = ctx
  const lit = amb + 0.35 * st.lamp
  const sit = o.sit ?? 0
  const alpha = o.alpha ?? 1
  if (alpha <= 0.002) return ''
  const hx = HEAD.x + 20 * sit
  const hy = HEAD.y - 150 * sit
  let out = ''
  if (sit > 0.01) {
    // Shoulders and back, rising out of the blanket.
    const sh = hy + 58
    out += fillD(`M${P(hx - 100 * sit, BED.top + 60)}Q${P(hx - 104, sh + 12)} ${P(hx - 40, sh)}H${r(hx + 40)}Q${P(hx + 104, sh + 12)} ${P(hx + 100 * sit, BED.top + 60)}Z`, c(0.3 * lit + 0.05))
    out += pen(`M${P(hx - 42, sh + 2)}Q${P(hx - 80, sh + 6)} ${P(hx - 92, sh + 40)}`, c(0.7 * lit + 0.12), 5, 0.6 * sit)
  }
  // Head: hair behind, the face lit from the window, a shadow under the brow and the nose.
  out += fillD(`M${P(hx - 40, hy + 6)}Q${P(hx - 46, hy - 40)} ${P(hx - 6, hy - 46)}Q${P(hx + 38, hy - 50)} ${P(hx + 42, hy - 8)}Q${P(hx + 44, hy + 14)} ${P(hx + 34, hy + 18)}L${P(hx - 34, hy + 18)}Z`, c(0.1 * lit + 0.02))
  out += fillD(ellipse(hx, hy + 6, 33, 38), c(0.42 * lit + 0.08))
  out += `<ellipse cx="${r(hx + 6)}" cy="${r(hy - 6)}" rx="30" ry="30" fill="url(#${uid}-light)"${op(0.45 * st.reveal)}/>`
  out += fillD(`M${P(hx - 28, hy - 18)}Q${P(hx - 12, hy - 34)} ${P(hx + 4, hy - 26)}Q${P(hx + 24, hy - 36)} ${P(hx + 32, hy - 16)}Q${P(hx + 10, hy - 30)} ${P(hx - 28, hy - 18)}Z`, c(0.1 * lit + 0.02), 0.9)
  out += fillD(ellipse(hx + 3, hy + 16, 6, 4), c(0.15 * lit + 0.02), 0.6)
  // Eyes: dark sockets and, when open, a glint each. They blink on "sleep", and now and then.
  const blink = Math.max(bump(now, T.sleep - 0.04, 0.07, 0.22), bump(now, 12.3, 0.06, 0.18), bump(now, 58.2, 0.06, 0.18), bump(now, 150.2, 0.06, 0.18))
  const open = (1 - blink) * (o.eyes ?? 1)
  const wide = 1 + 0.55 * bump(now, T.eyes - 0.2, 0.2, 2.4)
  for (const ex of [hx - 12, hx + 13]) {
    out += fillD(ellipse(ex, hy + 2, 7.5 * wide, 4.6 * wide * Math.max(open, 0.25)), c(0.06 + 0.18 * st.day))
    if (open > 0.2) out += fillD(circ(ex + 1.5, hy + 1, 1.6 * wide), mix(c(0.95), PAPER, 0.5), 0.8 * open * (1 - 0.75 * st.day))
  }
  out += pen(`M${P(hx - 8, hy + 29)}Q${P(hx, hy + 31)} ${P(hx + 8, hy + 29)}`, c(0.16 * lit + 0.03), 3, 0.7)
  // An arm, when he reaches: out from under the blanket, over it, to `reach` = [x, y].
  if (o.reach && o.reachK > 0.01) {
    const [tx, ty] = o.reach
    const side = Math.sign(tx - hx) || 1
    const sx = hx + side * 40
    const sy = BED.top + 44
    const k = easeInOut(o.reachK)
    const ex = lerp(sx + side * 24, tx, k)
    const ey = lerp(sy + 36, ty, k)
    const mx = lerp(sx + side * 14, (sx + ex) / 2, k)
    const my = Math.min(sy, ey) - 10 * k
    const arm = `M${P(sx, sy)}Q${P(mx, my)} ${P(ex, ey)}`
    out += pen(arm, c(0.14 * lit + 0.03), 17) + pen(arm, c(0.46 * lit + 0.08), 11) + pen(`M${P(sx, sy - 5)}Q${P(mx, my - 6)} ${P(ex, ey - 5)}`, c(0.75 * lit + 0.1), 4, 0.6)
    out += fillD(`M${P(ex - 6, ey - 9)}Q${P(ex + 18 * side, ey - 12)} ${P(ex + 24 * side, ey - 2)}Q${P(ex + 14 * side, ey + 9)} ${P(ex - 6, ey + 8)}Z`, c(0.5 * lit + 0.09))
  }
  return alpha < 1 ? g(out, `opacity="${r(alpha, 3)}"`) : out
}

/**
 * Her, on the other pillow: never inked, only burnished — the shape the dark
 * leaves. Turned towards him, her face away from us in her hair, the blanket
 * raised over her shoulder. Against a lighter room there is less dark to leave
 * her, and she goes.
 */
function herOnPillow(ctx, k) {
  if (k <= 0.004) return ''
  const { amb } = ctx
  const x = -HEAD.x + 10
  const y = HEAD.y - 4
  const vis = k * clamp01(1.3 - (amb - 0.42) * 2.2)
  if (vis <= 0.004) return ''
  const body = `M${P(x - 128, BED.top + 58)}Q${P(x - 30, BED.top + 16)} ${P(x + 110, BED.top + 44)}Q${P(x + 150, BED.top + 60)} ${P(x + 150, BED.foot - 12)}Q${P(x, BED.foot - 40)} ${P(x - 130, BED.foot - 12)}Z`
  const shoulder = `M${P(x - 60, BED.top + 22)}Q${P(x + 10, BED.top - 4)} ${P(x + 80, BED.top + 26)}`
  const hair = `M${P(x - 40, y + 30)}Q${P(x - 52, y - 30)} ${P(x - 4, y - 46)}Q${P(x + 52, y - 56)} ${P(x + 88, y - 12)}Q${P(x + 126, y + 22)} ${P(x + 110, y + 40)}Q${P(x + 70, y + 18)} ${P(x + 44, y + 38)}Q${P(x + 4, y + 52)} ${P(x - 40, y + 30)}Z`
  const ear = `M${P(x - 36, y + 8)}Q${P(x - 50, y + 18)} ${P(x - 34, y + 34)}`
  return g(fillD(body, PAPER, 0.08) + pen(shoulder, PAPER, 5, 0.26) + fillD(hair, PAPER, 0.2) + pen(ear, PAPER, 3, 0.3), `opacity="${r(vis, 3)}"`)
}

/** The nightstand, the lamp and the phone. */
function nightstand(ctx, now) {
  const { c, amb, st, uid, T } = ctx
  const lit = amb + 0.45 * st.lamp
  let out = ''
  out += fillD(rectD(-570, 180, 190, ROOM.floor - 180 - 8), c(0.2 * lit + 0.03)) + fillD(rectD(-580, 172, 210, 12), c(0.42 * lit + 0.06))
  out += pen(`M-560 245H-390`, c(0.4 * lit + 0.05), 3, 0.6) + fillD(circ(-475, 262, 6), c(0.6 * lit + 0.08))
  // The lamp: base, stem, shade — lit until "light".
  out += fillD(ellipse(-505, 170, 34, 7), c(0.3 * lit + 0.05)) + fillD(rectD(-510, 100, 10, 70), c(0.3 * lit + 0.04))
  const shade = `M-548 106L-462 106L-478 44L-532 44Z`
  out += fillD(shade, st.lamp > 0.01 ? mix(c(0.22 * amb + 0.05), mix(c(0.85), PAPER, 0.4), st.lamp * st.reveal) : c(0.22 * amb + 0.05))
  if (st.lamp > 0.01) out += `<ellipse cx="-505" cy="110" rx="140" ry="90" fill="url(#${uid}-lamp)"${op(0.9 * st.lamp * st.reveal)}/>`
  // The phone, face up: its screen lights on "call" and goes out on the second.
  const glow = smooth(ramp(now, T.call1 - 0.1, T.call1 + 0.25)) * (1 - smooth(ramp(now, T.call2 - 0.05, T.call2 + 0.6)))
  out += fillD(rectD(-445, 164, 50, 9), c(0.08))
  if (glow > 0.01) {
    out += `<ellipse cx="-420" cy="120" rx="80" ry="120" fill="url(#${uid}-light)"${op(0.8 * glow)}/>`
    out += fillD(rectD(-442, 163, 44, 3), PAPER, glow)
  }
  return out
}

/* ── The sheep on the wall: his thoughts, refusing to be counted ─────── */

function sheepD(x, y, s, seed, legs = 0) {
  // A fleece of overlapping curls round a body; a dark face and ears; four legs.
  let body = ''
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    body += circ(x + Math.cos(a) * 30 * s, y + Math.sin(a) * 15 * s, (15 + 5 * hash(i, seed, 61)) * s)
  }
  body += ellipse(x, y, 36 * s, 20 * s)
  const head = ellipse(x + 44 * s, y - 8 * s, 11 * s, 14 * s) + ellipse(x + 36 * s, y - 20 * s, 8 * s, 4 * s)
  let l = ''
  for (const [lx, ph] of [[-22, 0], [-10, 1], [14, 0], [26, 1]]) {
    const sw = Math.sin(legs + ph * Math.PI) * 7 * s
    l += `M${P(x + lx * s, y + 18 * s)}L${P(x + lx * s + sw, y + 42 * s)}`
  }
  return { body, head, legs: l }
}

function sheepOnWall(ctx, now) {
  const { c, T, st } = ctx
  const from = T.thoughts - 0.1
  if (now < from || now > T.sheep + 1.8) return ''
  const come = smooth(ramp(now, from, from + 0.9))
  const gone = smooth(ramp(now, T.sheep - 0.05, T.sheep + 1.4))
  const freeze = T.noSheep
  const tt = Math.min(now, freeze) - from
  const tone = mix(c(0.8), PAPER, 0.3)
  let out = ''
  // The wisps: off his head, up the wall to where the sheep are.
  const w = ramp(now, from - 0.3, from + 0.8)
  let wisps = ''
  for (let i = 0; i < 4; i++) {
    const tx = -470 + i * 115
    wisps += `M${P(HEAD.x, HEAD.y - 50)}C${P(HEAD.x - 60 + i * 30, -40)} ${P(tx + 60, -170)} ${P(tx, -300)}`
  }
  if (w < 1) out += pen(wisps, tone, 4, 0.5 * (1 - w * w) * st.reveal, ` pathLength="1" stroke-dasharray="${r(w, 3)} 1"`)
  // The fence.
  out += pen('M20 -262V-356M84 -262V-356M4 -338H100M4 -300H100', mix(c(0.55), PAPER, 0.1), 6, 0.8 * come * (1 - gone))
  // Four sheep walking to the fence; the first jumps and hangs there on "no".
  let d = ''
  let heads = ''
  let legs = ''
  for (let i = 0; i < 4; i++) {
    // The first is at the top of its jump exactly on "no".
    const walk = tt * 140
    let x = 52 - 140 * (freeze - from) - i * 125 + walk
    let y = -300
    if (i === 0) {
      const jump = clamp01((x + 80) / 260)
      x = Math.min(x, -80 + jump * 260)
      y -= Math.sin(Math.PI * jump) * 90
    }
    else x = Math.min(x, -100 - (i - 1) * 118)
    const drift = gone * (i - 1.5) * 26
    const sh = sheepD(x + drift, y - gone * 50, 1.25 * (1 + 0.3 * gone), 60 + i, tt * 9 + i)
    d += sh.body
    heads += sh.head
    legs += sh.legs
  }
  const a = come * (1 - gone) * st.reveal
  out += pen(legs, c(0.12), 6, a) + fillD(d, tone, a) + fillD(heads, c(0.1), a)
  return out
}

/* ── The ceiling burnished into sky, and the bed that rises into it ──── */

/** How far the ceiling has gone to sky: 0 closed, 1 wide open. */
const ceilingOpen = (T, now) => smooth(ramp(now, T.sky - 0.1, T.sky + 2.0)) * (1 - easeInOut(ramp(now, T.repeat + 0.4, T.then1 - 0.1)))
const bedLift = (T, now) => 820 * easeInOut(ramp(now, T.wonder - 0.5, T.die + 0.2)) * (1 - easeInOut(ramp(now, T.repeat, T.then1 - 0.35)))
const bedRoll = (T, now) => (-7 * smooth(ramp(now, T.die - 0.5, T.troubles)) + 3 * Math.sin((now - T.die) * 0.9) * ramp(now, T.die, T.afraid)) * (1 - easeInOut(ramp(now, T.repeat, T.then1 - 0.35)))

function ceilingHole(ctx, now) {
  const k = ceilingOpen(ctx.T, now)
  if (k <= 0.002) return { clip: '', rim: '' }
  const rx = 100 + 2700 * k
  const ry = 60 + 1600 * k
  const hole = blobD(0, ROOM.top + 20 + 110 * k - ry, rx, ry, 17, 16, 0.1)
  return { hole, k }
}

/* ══ FIGURES OUT OF BED: standing, floating, walking ══════════════════
 *
 * One silhouette, feet at (0, 0) and crown at (0, −1): a head, a neck, a
 * torso (or a dress, for her) as fills, and the limbs as round-capped strokes,
 * so an arm reads as an arm at any size. `arms` opens both arms from the sides
 * (0) to wide (1); `reach` swings the right arm to that many degrees from
 * hanging; `walk` is the step phase; `float` points the toes down and lets the
 * legs trail together, the way a sleeper hangs in a dream.
 */
/** A tapered limb from A to B, `wa` wide at A and `wb` at B: a quad, plus round joints at both ends. */
function limb(ax, ay, bx, by, wa, wb) {
  const len = Math.hypot(bx - ax, by - ay) || 1e-6
  const nx = -(by - ay) / len
  const ny = (bx - ax) / len
  const q = `M${P(ax + (nx * wa) / 2, ay + (ny * wa) / 2)}L${P(bx + (nx * wb) / 2, by + (ny * wb) / 2)}L${P(bx - (nx * wb) / 2, by - (ny * wb) / 2)}L${P(ax - (nx * wa) / 2, ay - (ny * wa) / 2)}Z`
  return { q, j: circ(ax, ay, wa / 2) + circ(bx, by, wb / 2) }
}

function figureParts(X, Y, H, o = {}) {
  const arms = o.arms ?? 0
  const fl = o.float ?? 0
  const dress = o.dress ?? false
  // Normalised to world: feet at (X, Y), crown at (X, Y − H).
  const u = (a) => X + a * H
  const v = (b) => Y + b * H
  const pt = ([a, b]) => [u(a), v(b)]
  let torso = ellipse(u(0), v(-0.93), 0.05 * H, 0.062 * H) + rectD(u(-0.021), v(-0.885), 0.042 * H, 0.06 * H) + ellipse(u(0), v(-0.835), (dress ? 0.07 : 0.085) * H, 0.03 * H)
  if (dress) {
    const hem = 0.155 - fl * 0.05
    torso += spline([[-0.058, -0.99], [0, -1.012], [0.058, -0.99], [0.086, -0.9], [0.092, -0.8], [0, -0.83], [-0.092, -0.8], [-0.086, -0.9]].map(pt))
    torso += spline([[-0.03, -0.852], [-0.086, -0.834], [-0.112, -0.8], [-0.1, -0.72], [-0.08, -0.64], [-0.068, -0.58], [-0.08, -0.52], [-0.11, -0.4], [-hem, -0.24], [-hem * 0.9, -0.2], [0, -0.19], [hem * 0.9, -0.2], [hem, -0.24], [0.11, -0.4], [0.08, -0.52], [0.068, -0.58], [0.08, -0.64], [0.1, -0.72], [0.112, -0.8], [0.086, -0.834], [0.03, -0.852]].map(pt))
  }
  else {
    torso += spline([[-0.034, -0.856], [-0.094, -0.838], [-0.134, -0.81], [-0.148, -0.772], [-0.138, -0.72], [-0.116, -0.66], [-0.098, -0.58], [-0.092, -0.53], [-0.102, -0.47], [-0.098, -0.43], [0, -0.415], [0.098, -0.43], [0.102, -0.47], [0.092, -0.53], [0.098, -0.58], [0.116, -0.66], [0.138, -0.72], [0.148, -0.772], [0.134, -0.81], [0.094, -0.838], [0.034, -0.856]].map(pt))
  }
  let q = ''
  let j = ''
  const add = (ax, ay, bx, by, wa, wb) => {
    const l = limb(u(ax), v(ay), u(bx), v(by), wa * H, wb * H)
    q += l.q
    j += l.j
  }
  // Arms: shoulder, elbow, wrist, by the angle off hanging; a hand past the wrist.
  const arm = (side, deg, bend) => {
    const a = (deg * Math.PI) / 180
    const b = ((deg + bend) * Math.PI) / 180
    const sx = side * (dress ? 0.094 : 0.122)
    const sy = -0.782
    const ex = sx + side * Math.sin(a) * 0.175
    const ey = sy + Math.cos(a) * 0.175
    const wx = ex + side * Math.sin(b) * 0.16
    const wy = ey + Math.cos(b) * 0.16
    const w = dress ? 0.8 : 1
    add(sx, sy, ex, ey, 0.054 * w, 0.04 * w)
    add(ex, ey, wx, wy, 0.04 * w, 0.03 * w)
    add(wx, wy, wx + side * Math.sin(b) * 0.05, wy + Math.cos(b) * 0.05, 0.034 * w, 0.024 * w)
  }
  const open = 7 + arms * 34
  const bend = 8 + arms * 26
  arm(-1, open + (o.left ?? 0), bend)
  arm(1, o.reach != null ? o.reach : open, o.reach != null ? 4 : bend)
  // Legs: hip, knee, ankle. A step lifts one foot and swings it; floating, they hang together, toes down.
  const ph = o.walk
  const leg = (side) => {
    const swing = ph != null ? Math.sin(ph + (side > 0 ? Math.PI : 0)) : 0
    const lift = ph != null ? Math.max(0, swing) * 0.055 : 0
    const hx = side * 0.05
    const kx = side * (0.054 - fl * 0.026) + swing * 0.008
    const ax = side * (0.05 - fl * 0.036) + swing * 0.014
    const ky = -0.25 - lift * 0.45 + fl * 0.02
    const ay = -0.04 - lift + fl * 0.03
    if (dress) add(kx * 0.85, -0.22, ax, ay, 0.036, 0.026)
    else {
      add(hx, -0.45, kx, ky, 0.088, 0.058)
      add(kx, ky, ax, ay, 0.054, 0.034)
    }
    add(ax, ay, ax + side * 0.006, ay + 0.03 + fl * 0.02, dress ? 0.026 : 0.036, dress ? 0.02 : 0.03)
  }
  leg(-1)
  leg(1)
  return { torso, q, j }
}

/** A figure at (x, feet y), `h` tall, in a layer's units: a lit rim on the light side, then the figure. */
function figure(x, y, h, o, col) {
  const body = (colour, dx = 0) => {
    const p = figureParts(x + dx * h, y, h, o)
    return `<g fill="${colour}"><path d="${p.torso}"/><path d="${p.q}"/><path d="${p.j}"/></g>`
  }
  const rim = col.rim ? g(body(col.rim, col.rimDx ?? -0.01), op(col.rimO ?? 0.85).trim()) : ''
  const glow = col.glow ? `<ellipse cx="${r(x)}" cy="${r(y - h * 0.55)}" rx="${r(h * 0.5)}" ry="${r(h * 0.7)}" fill="url(#${col.glow})"${op(col.glowO ?? 0.3)}/>` : ''
  return glow + g(rim + body(col.fill), col.o != null && col.o < 0.999 ? op(col.o).trim() : '')
}

/* ══ OVERLAYS: in screen units, over the whole plate ═══════════════════ */

/** The plate re-rocked: a band of fresh burr sweeping across, left to right. */
function rockSweep(ctx, now) {
  const { T } = ctx
  const a = T.fever - 0.05
  const b = T.fever + 1.5
  if (now < a || now > b + 1.4) return ''
  const front = lerp(-260, 1900, easeInOut(ramp(now, a, b)))
  const fade = 1 - smooth(ramp(now, b + 0.1, b + 1.4))
  let d = `M-400 -400H${r(front)}`
  for (let y = -400; y <= 1200; y += 40) d += `L${r(front - 140 * Math.sin(((y + 400) / 1600) * Math.PI) + (hash(y, 1, 71) - 0.5) * 30)} ${y}`
  d += 'L-400 1200Z'
  // The rocker's teeth: rows of dots along the front.
  let teeth = ''
  for (let row = 0; row < 5; row++) {
    for (let y = -40; y <= 760; y += 11) {
      const x = front - 140 * Math.sin(((y + 400) / 1600) * Math.PI) + row * 16 + (hash(y, row, 73) - 0.5) * 12
      teeth += circ(x, y + row * 5, 2.2 - row * 0.3)
    }
  }
  return fillD(d, INK, 0.94 * fade) + fillD(teeth, INK, 0.7 * fade)
}

/** Ink flooding down from the top of the frame on "blood", draining as the camera pulls out. */
function inkFlood(ctx, now) {
  const { T } = ctx
  const a = T.blood - 0.1
  if (now < a || now > T.breaks + 1) return ''
  const level = lerp(-60, 430, easeOut(ramp(now, a, T.deep))) - 700 * easeInOut(ramp(now, T.deep + 0.2, T.breaks + 0.8))
  let d = 'M-400 -400H2000V'
  const pts = []
  for (let x = 2000; x >= -400; x -= 24) {
    const i = Math.round(x / 24)
    const drip = hash(i, 3, 81) > 0.78 ? 60 + 180 * hash(i, 4, 81) * ramp(now, a + 0.3, T.deep + 0.4) : 0
    const y = level + 22 * Math.sin(x * 0.013 + now * 0.8) + drip
    pts.push(`${r(x)} ${r(y)}`)
  }
  d += pts.shift() + 'L' + pts.join('L') + 'Z'
  return fillD(d, INK, 0.93)
}

/** Specks crawling over the blanket and his face on "skin". */
function crawl(ctx, now) {
  const { T } = ctx
  const k = smooth(ramp(now, T.skin - 0.2, T.crawl)) * (1 - smooth(ramp(now, T.eyes, T.straighten)))
  if (k <= 0.01) return ''
  let d = ''
  for (let i = 0; i < 170; i++) {
    const bx = BED.x0 + hash(i, 1, 91) * (BED.x1 - BED.x0) * 0.62
    const by = BED.top - 60 + hash(i, 2, 91) * 220
    const sp = 20 + hash(i, 3, 91) * 30
    const a = hash(i, 4, 91) * 6.28 + Math.sin(now * 0.7 + i) * 0.8
    const x = bx + Math.cos(a) * sp * ((now * 0.6 + hash(i, 5, 91)) % 1)
    const y = by + Math.sin(a) * sp * ((now * 0.6 + hash(i, 5, 91)) % 1)
    d += `M${P(x, y)}l${r(Math.cos(a) * 5)} ${r(Math.sin(a) * 5)}`
  }
  return pen(d, INK, 3, 0.75 * k)
}

/** The wind through the open window: pale curling streaks across the room. */
function windStreaks(ctx, now) {
  const { T, c } = ctx
  const k = smooth(ramp(now, T.wind - 0.6, T.wind + 0.4)) * (1 - smooth(ramp(now, T.give - 0.4, T.give + 1)))
  if (k <= 0.01) return ''
  let d = ''
  for (let i = 0; i < 14; i++) {
    const u = (now * 0.55 + hash(i, 1, 95)) % 1
    const y0 = WIN.y0 + 30 + hash(i, 2, 95) * 260
    const dir = hash(i, 3, 95) > 0.5 ? 1 : -1
    const x = dir * (u * 900)
    const y = y0 + u * 120 + Math.sin(u * 7 + i) * 30
    d += `M${P(x, y)}q${r(dir * 60)} ${r(-24)} ${r(dir * 120)} ${r(4)}q${r(dir * 40)} ${r(18)} ${r(dir * 90)} ${r(-6)}`
  }
  return pen(d, c(0.85), 3, 0.3 * k)
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

export function mezzotintFrame({ time, score, lockup = '', uid = 'mz' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const plan = planFor(score)
  const { T } = plan
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const cam = plan.cam(now)
  const st = stateAt(plan, now)
  /* A tone, burnished out of the black in the intro and towards the paper at the end (by `kb`). */
  const c = (v, kb = 0.8) => {
    let x = v * st.reveal
    x = x + (1 - x) * kb * st.burn
    return toneOf(x)
  }
  // Ambient light in the room: moonlight, then the dawn through the window.
  const amb = 0.42 + 0.18 * st.dawn + 0.5 * st.day
  const ridge = plan.ridgeZ(now)
  const hy = CY + cam.sy
  const crest = G - cam.y - (10 * (cam.d + ridge)) / F
  const ridgeY = hy + 10
  const ctx = { uid, cam, st, T, plan, c, amb, ridge, hy, ridgeY, crest }

  /* ── Outside, far to near ─────────────────────────────────────────────── */
  const far = []
  far.push({ z: 1e9, svg: skyLayer(ctx, now) })
  far.push({ z: ridge, svg: ridgeLayer(ctx, now) })
  far.push({ z: TREES_Z, svg: treeLayer(ctx, now) })
  far.push({ z: VILLAGE_Z, svg: villageLayer(ctx) })
  for (const z of HEDGES) far.push({ z, svg: fieldsLayer(ctx, z) })

  /* ── Him and her outside, as depth-sorted figures ─────────────────────── */
  const people = outsidePeople(ctx, now)
  for (const p of people) if (p.z > 0) far.push({ z: p.z, svg: `<g transform="${layerT(cam, p.z)}"${op(p.opacity)}>${p.svg}</g>` })
  far.sort((a, b) => b.z - a.z)
  // Anything nearer than the ridge is in front of it; anything farther is hidden under the land.
  const outside = far.map((l) => l.svg).join('')

  /* ── The house: the room, the cutaway and the house round it ─────────── */
  let house = ''
  const houseA = clamp01((cam.d - 150) / 120)
  if (houseA > 0.001) {
    const hole = ceilingHole(ctx, now)
    const creak = 3.2 * ring(now, T.creak, 1.4, 0.55) + 1.2 * ring(now, T.house, 1.8, 0.4)
    let back = houseOutside(ctx) + roomBack(ctx, now) + sheepOnWall(ctx, now)
    if (hole.hole) {
      // The ceiling burnished away: the room is cut by the hole, and the sky shows through it.
      const id = `${uid}-hole`
      const skyThere = `<g clip-path="url(#${id}-in)"><g transform="translate(${r(cam.x, 2)} ${r(cam.y, 2)}) scale(${r(1 / scaleAt(cam, 0), 5)}) translate(${r(-CX - cam.sx, 2)} ${r(-CY - cam.sy, 2)})">${skyLayer(ctx, now)}</g></g>`
      back = `<clipPath id="${id}-out"><path clip-rule="evenodd" d="M-6000 -6000H6000V6000H-6000Z ${hole.hole}"/></clipPath><clipPath id="${id}-in"><path d="${hole.hole}"/></clipPath>`
        + `<g clip-path="url(#${id}-out)">${back}</g>${skyThere}` + pen(hole.hole, c(0.02), 30, 0.8 * (1 - hole.k)) + pen(hole.hole, c(0.5), 3, 0.35 * (1 - hole.k * 0.6))
    }
    const lift = bedLift(T, now)
    const roll = bedRoll(T, now)
    const sit = Math.max(
      smooth(ramp(now, T.straighten - 0.05, T.straighten + 0.3)) * (1 - smooth(ramp(now, T.my + 1.5, T.deep))),
      smooth(ramp(now, T.except - 0.3, T.except + 0.5)) * (1 - smooth(ramp(now, T.miss - 0.8, T.miss))),
    )
    // He stays in bed while his dream self floats out and back; he only really gets up at the end.
    const inBed = 1 - smooth(ramp(now, T.so3 - 0.1, T.so3 + 0.5))
    const reach = now < T.do + 4 ? { reach: [-420, 170], reachK: ramp(now, T.call1 - 0.2, T.call1 + 0.5) * (1 - ramp(now, T.wait - 0.1, T.wait + 0.6)) } : {}
    const herPillow = Math.max(
      smooth(ramp(now, T.youre1 - 0.3, T.youre1 + 0.7)) * (1 - smooth(ramp(now, T.do - 0.3, T.call1))),
      smooth(ramp(now, T.miss - 0.4, T.miss + 0.8)) * (1 - smooth(ramp(now, T.be3 - 0.4, T.so3 + 0.2))),
    )
    const bedGroup = g(bed(ctx, now) + herOnPillow(ctx, herPillow) + lyingHim(ctx, now, { sit, alpha: clamp01(inBed), ...reach }) + crawl(ctx, now),
      `transform="translate(0 ${r(-lift, 2)}) rotate(${r(roll, 2)} 0 200)"`)
    const peopleIn = people.filter((p) => p.z <= 0).map((p) => g(p.svg, op(p.opacity).trim())).join('')
    house = `<g transform="${layerT(cam, 0)}"${op(houseA)}><g transform="translate(0 ${G}) skewX(${r(creak, 3)}) translate(0 ${-G})">${back}${nightstand(ctx, now)}${bedGroup}${shaft(ctx)}${peopleIn}${windStreaks(ctx, now)}</g></g>`
  }

  /* ── Screen-space overlays ────────────────────────────────────────────── */
  const tension = 0.35 * smooth(ramp(now, T.dark1 - 0.4, T.see1)) * (1 - smooth(ramp(now, T.so1, T.so1 + 1.2)))
    + 0.5 * smooth(ramp(now, T.unnatural, T.eyes)) * (1 - smooth(ramp(now, T.straighten, T.straighten + 1)))
    + 0.25
  const vignette = `<rect x="-400" y="-400" width="2400" height="1700" fill="url(#${uid}-dark)"${op(clamp01(tension) * (1 - 0.8 * st.burn))}/>`
  const grain = `<rect x="0" y="0" width="1600" height="900" fill="url(#${uid}-grain)"${op(0.55 * (1 - 0.5 * st.burn))}/><rect x="0" y="0" width="1600" height="900" fill="url(#${uid}-burr)"/>`

  /* ── The sheet: the plate opens to the whole sheet in the outro ──────── */
  const open = easeCamera(ramp(now, T.outro, T.outro + 2.2))
  const clipBox = {
    x: lerp(PL.x, 0, open), y: lerp(PL.y, 0, open), w: lerp(PL.w, 1600, open), h: lerp(PL.h, 900, open),
  }
  const clipId = `${uid}-plate`
  const clipDef = `<clipPath id="${clipId}"><rect x="${r(clipBox.x, 2)}" y="${r(clipBox.y, 2)}" width="${r(clipBox.w, 2)}" height="${r(clipBox.h, 2)}"/></clipPath>`

  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 7, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  return {
    svg: [
      paper(),
      `<defs>${clipDef}${defs(ctx)}</defs>`,
      `<g clip-path="url(#${clipId})">`,
      `<rect x="0" y="0" width="1600" height="900" fill="${INK}"/>`,
      `<g transform="rotate(${r(cam.roll, 3)} ${CX} ${CY})">`,
      outside,
      house,
      rockSweep(ctx, now),
      inkFlood(ctx, now),
      '</g>',
      vignette,
      grain,
      '</g>',
      margin,
    ].join('\n'),
    label: active && now < (score.sections.find((s) => s.id === active.section)?.to ?? 0) ? active.text : section.label,
  }
}

/* ── Him and her out of bed ───────────────────────────────────────────
 *
 * Each is { z, svg, opacity }: z is the depth, svg is in that plane's units.
 * At z ≤ 0 a figure is in the room and is drawn with it; past the wall it is
 * outside, drawn behind the wall and seen through the window. A figure the
 * camera follows is placed by its depth relative to the camera, so however the
 * camera moves it stays ahead of it.
 */
function outsidePeople(ctx, now) {
  const { T, plan, c, st, cam } = ctx
  const out = []
  const him = () => ({ fill: c(lerp(0.34, 0.06, st.dawn), 0.25), rim: mix(c(0.82), GOLD, 0.65 * st.dawn), rimDx: -0.012, rimO: 0.9 })
  const herCol = (k) => ({ fill: mix(PAPER, GOLD, 0.12 * st.dawn), o: k, glow: `${ctx.uid}-light`, glowO: 0.28 * k })
  const push = (z, svg, opacity = 1) => {
    if (opacity <= 0.003) return
    if (z > 0 && cam.d + z < 40) return
    out.push({ z: Math.max(z, 0), svg, opacity })
  }
  const d = cam.d

  // Verse 4 to hook 1: he floats up out of bed, out of the window, into the sky — and is pulled back in.
  const outA = T.oh4 + 0.2
  const backA = T.horizon1b + 0.3
  const backB = T.no5 - 1.6
  const home = T.no5 - 0.3
  if (now > outA && now < home + 0.4) {
    const up = smooth(ramp(now, outA, T.skyV4))
    const bob = 12 * Math.sin(now * 1.1)
    let z = 0
    let x = lerp(HEAD.x, 0, up)
    let feet = lerp(BED.top, WIN.y1 - 12, up)
    const arms = smooth(ramp(now, T.skyV4 - 0.3, T.give + 0.3)) * (1 - smooth(ramp(now, backA, backB)))
    if (now > T.skyV4 && now < backB) {
      // Out: the camera follows at a gap that opens from where it was at the window.
      const k = easeInOut(ramp(now, T.skyV4, T.give + 1.2))
      const back = easeInOut(ramp(now, backA, backB))
      const dAt = plan.cam(T.skyV4).d
      const rel = lerp(lerp(dAt, 760, k), plan.cam(backB).d, back)
      z = Math.max(0, rel - d)
      const o1 = lerp(0, -150 + 26 * Math.sin(now * 0.3), k)
      x = lerp(o1, 0, back)
      feet = lerp(lerp(WIN.y1 - 12, cam.y + 200 + bob, k), WIN.y1 - 12, back)
    }
    else if (now >= backB) {
      const k = smooth(ramp(now, backB, home))
      x = lerp(0, HEAD.x, k)
      feet = lerp(WIN.y1 - 12, BED.top, k)
    }
    const reach = smooth(ramp(now, T.oh1 - 0.3, T.oh1 + 1.4)) * (1 - smooth(ramp(now, T.meet1b + 0.4, backA)))
    // As the camera is pulled back to the room, his dream self goes into the light, the way a dream does on waking.
    const fade = smooth(ramp(now, outA, outA + 0.7)) * (1 - smooth(ramp(now, backA - 0.2, backA + 1.3)))
    const o = { arms: arms * (1 - reach), float: arms, reach: lerp(7 + arms * 34, 104, reach) }
    push(z, figure(x, feet, HIM, o, him()), fade)
  }

  // Chorus 2: she floats beside him on "you're"; in the hook she drifts off to the horizon and stands on it.
  const herFrom = T.youre2 - 0.4
  if (now > herFrom && now < backB + 0.6) {
    const appear = smooth(ramp(now, herFrom, herFrom + 1.4))
    const away = easeInOut(ramp(now, T.meet1 - 0.3, T.horizon1 + 1.6))
    const zNear = 820 - d
    const zFar = ctx.ridge - 40
    const z = zNear + (zFar - zNear) * away ** 2.2
    const x = lerp(170 + 20 * Math.sin(now * 0.4), 980, away)
    const bob = 10 * Math.sin(now + 1)
    const feet = lerp(cam.y + 210 + bob, ridgeTop(ctx, x), away ** 0.5)
    const fade = appear * (1 - smooth(ramp(now, backB - 0.8, backB + 0.4)))
    push(z, figure(x, feet, HER, { dress: true, float: 1 - away, arms: 0.25 * (1 - away) }, herCol(0.5 + 0.35 * away)), fade)
  }

  // The last chorus and hook 2: he gets up, steps out of the window, and walks to the horizon; she walks along it to him.
  if (now > T.so3 - 0.2) {
    const z = plan.himZ(now)
    const stand = smooth(ramp(now, T.so3 - 0.2, T.so3 + 0.6))
    const toWin = smooth(ramp(now, T.so3 + 0.3, T.meet2))
    const down = smooth(ramp(now, T.meet2 + 0.8, T.oh2 + 2.2))
    const x0 = lerp(HEAD.x, 0, toWin)
    const meet = smooth(ramp(now, plan.meetAt - 1.4, plan.meetAt + 0.1))
    const x = lerp(x0, -38, meet)
    const feet = lerp(lerp(BED.top, WIN.y1 - 12, toWin), G - laneLift(ctx, z), down)
    const walking = now > plan.walkFrom - 0.1 && meet < 0.98
    const stride = walking ? (z - 520) / 42 : null
    const hold = smooth(ramp(now, plan.meetAt - 0.5, plan.meetAt + 0.9))
    push(z, figure(x, feet, HIM, { walk: stride, reach: lerp(7, 18, hold) }, him()), stand)
    if (now > T.oh2 - 0.4) {
      const hz = ctx.ridge - 30
      const appear = smooth(ramp(now, T.oh2 - 0.4, T.oh2 + 1.8))
      const hx = lerp(820, 38, easeInOut(ramp(now, T.oh2, plan.meetAt)))
      const hstride = meet < 0.98 ? (820 - hx) / 34 : null
      push(hz, figure(hx, ridgeTop(ctx, hx) + 2, HER, { dress: true, walk: hstride, left: 12 * hold }, herCol(1)), appear)
    }
  }
  return out
}

/* For tools: the camera, so a script can measure it for smoothness. */
export const mezzotintCamera = (score, now) => planFor(score).cam(now)
