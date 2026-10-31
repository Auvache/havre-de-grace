/*
 * New York — five visualizers. The core idea is rebellion: everything in the
 * picture pulls one way, everyone keeps time, every sign says go, and one
 * thing will not.
 *
 * Red is that one thing every time: the wake heading out to sea, the arrow
 * against the flow, his own board on the signpost, the metronome out of time,
 * the link that will not hold. Yellow, the poster ink, is what pulls: the lights.
 */
import { PLATE, CX, CY, INK, PAPER, RED, SECOND_INK } from './sheet.mjs'
import { rng, r, clamp01, lerp, ramp, easeOut, easeInOut, easeOutBack, decay } from '../../../shared/video/kit.mjs'
import { glide } from '../../../shared/video/album.mjs'

const easeIn = (x) => x * x * x
const YELLOW = SECOND_INK['new-york']
const { x: PX, y: PY, w: PW, h: PH } = PLATE
const PR = PX + PW
const PB = PY + PH

const allWords = (score) => score.lines.flatMap((l) => l.words.map((w) => ({ ...w, line: l.index })))
const clean = (w) => w.text.toLowerCase().replace(/[^a-z']/g, '')
/** Every refusal the song sings: each No, don't, won't and not, measured. */
const refusals = (score) => allWords(score).filter((w) => /^(no|don't|won't|not)$/.test(clean(w)))
const isNo = (w) => clean(w) === 'no'

const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="${o.weight ?? 600}" fill="${o.fill ?? INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.transform ? ` transform="${o.transform}"` : ''}>${String(o.upper === false ? text : String(text).toUpperCase()).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`
const poly = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${r(p[0])} ${r(p[1])}`).join('')
const hatch = (id, { gap = 6, w = 1.4, color = INK, angle = 0 } = {}) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse"${angle ? ` patternTransform="rotate(${angle})"` : ''}><rect width="${gap}" height="${w}" fill="${color}"/></pattern>`

/* ── A. The Lights on the Shore ───────────────────────────────────── */

function lightsOnTheShore({ time, score, uid }) {
  const H = PY + 150 // the horizon
  const CAM = 140 // the eye's height over the water, in world units
  const F = 26
  const BOAT = 6 // the boat's depth in front of the eye
  const START = 4
  // Distance run out from the shore: steady, a little faster when he is refusing.
  const runAt = (t) => Math.max(0, t - 6) * 0.45 + refusals(score).filter((w) => w.t < t).length * 1.0
  const D = runAt(time)
  // Lateral course: an easy swell, and a hard turn away on every refusal.
  const turns = refusals(score)
  const courseAt = (t) => 50 * Math.sin(t * 0.07) + turns.reduce((x, w, k) => x + (k % 2 ? -1 : 1) * 70 * easeInOut(ramp(t, w.t, w.t + 0.6)), 0)
  const xNow = courseAt(time)
  const project = (X, z) => [CX + (X - xNow * 0.7) * F / z, H + CAM * F / z]

  // The sky, engraved: denser overhead, opening towards the horizon.
  const sky = `<rect x="${PX}" y="${PY}" width="${PW}" height="${H - PY}" fill="url(#${uid}-s1)"/><rect x="${PX}" y="${H - 50}" width="${PW}" height="50" fill="${PAPER}"/><rect x="${PX}" y="${H - 50}" width="${PW}" height="50" fill="url(#${uid}-s2)"/>`
  // Lines on the water, fixed in the world, so they slide towards the shore as he pulls away.
  let sea = `<rect x="${PX}" y="${H}" width="${PW}" height="${PB - H}" fill="url(#${uid}-sw)"/>`
  let swell = ''
  for (let k = 0; k < 40; k++) {
    const z = BOAT * 0.75 + (((k * 2.2 - D * 0.9) % 88) + 88) % 88
    const y = H + CAM * F / z
    if (y > PB + 10 || y < H + 6) continue
    let d = `M${PX} ${r(y)}`
    for (let s = 1; s <= 12; s++) d += `L${r(PX + (PW * s) / 12)} ${r(y + Math.sin(s * 1.7 + k + time) * Math.min(5, 34 / z))}`
    swell += d
  }
  sea += `<path d="${swell}" stroke="${PAPER}" stroke-width="2.2" fill="none" opacity="0.8"/>`
  // The shore and its lights, receding.
  const zShore = BOAT + START + D
  const rand = rng(212)
  const lights = Array.from({ length: 70 }, () => ({ X: (rand() - 0.5) * 1700, Y: rand() * 70, k: rand(), size: 0.6 + rand() * 0.8 }))
  const sung = score.lines.filter((l) => l.start <= time).length
  const lit = Math.min(70, 14 + sung * 5)
  const beckon = score.lines.filter((l) => /lights/.test(l.text)).reduce((m, l) => Math.max(m, decay(time, l.words.find((w) => /lights/.test(w.text))?.t ?? l.start, 1.2)), 0)
  let land = ''
  const ridge = []
  for (let s = 0; s <= 40; s++) {
    const X = -1100 + (2200 * s) / 40
    const top = 40 + 60 * Math.abs(Math.sin(s * 0.9)) * (s % 5 === 0 ? 1.6 : 1) + (s % 3 === 0 ? 30 : 0)
    const [x, y] = project(X, zShore)
    ridge.push([x, y - (top * F) / zShore])
  }
  const [lx0, ly] = project(-1100, zShore)
  const [lx1] = project(1100, zShore)
  land = `<path d="M${r(lx0)} ${r(ly)}${poly(ridge).replace(/^M/, 'L')}L${r(lx1)} ${r(ly)}Z" fill="${INK}"/>`
  let glow = ''
  let reflections = ''
  lights.slice(0, lit).forEach((L, j) => {
    const [x, y0] = project(L.X, zShore)
    const y = y0 - (L.Y * F) / zShore
    const rad = Math.max(2.4, (L.size * 110 * (1 + 0.7 * beckon)) / zShore + 1.6)
    glow += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rad, 2)}" fill="${YELLOW}"/>`
    const len = (2600 * (0.6 + L.k)) / zShore + 12
    reflections += `M${r(x)} ${r(y0 + 3)}V${r(y0 + 3 + len)}`
  })
  // The wake: where he has been, from the shore to the boat under us.
  const left = []
  const right = []
  for (let s = 0; s <= 60; s++) {
    const tau = lerp(6, time, s / 60)
    const z = BOAT + (D - runAt(tau))
    const [x, y] = project(courseAt(tau), z)
    const half = Math.max(0.8, (3.2 * F) / z)
    left.push([x - half, y])
    right.push([x + half, y])
  }
  const wake = time > 6 ? `<path d="${poly(left)}${poly(right.reverse()).replace(/^M/, 'L')}Z" fill="${RED}"/>` : ''
  const [bx, by] = project(xNow, BOAT)
  return `<defs>${hatch(`${uid}-s1`, { gap: 6, w: 2.4 })}${hatch(`${uid}-s2`, { gap: 6, w: 1.1 })}${hatch(`${uid}-sw`, { gap: 5, w: 2.6 })}</defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  ${sky}
  ${sea}
  <path d="${reflections}" stroke="${YELLOW}" stroke-width="2.6" stroke-dasharray="4 7"/>
  ${land}
  ${glow}
  ${wake}
  <path d="M${r(bx - 40)} ${r(by + 6)}Q${r(bx)} ${r(by + 40)} ${r(bx + 40)} ${r(by + 6)}L${r(bx + 26)} ${r(by - 14)}L${r(bx - 26)} ${r(by - 14)}Z" fill="${INK}" stroke="${PAPER}" stroke-width="2"/>`
}

/* ── B. Against the Grain ─────────────────────────────────────────── */

function againstTheGrain({ time, score, uid }) {
  const COLS = 30
  const ROWS = 14
  const gx = PW / COLS
  const gy = PH / ROWS
  const beacon = [PR - 30, CY]
  const progress = clamp01((time - 10) / (score.duration - 20))
  const redAt = (t) => {
    const u = easeInOut(clamp01((t - 10) / (score.duration - 20)))
    return [lerp(PR - 230, PX + 180, u), CY + 150 * Math.sin(t * 0.045) - 40 * Math.sin(t * 0.13)]
  }
  const red = redAt(time)
  const events = refusals(score).map((w) => ({ t: w.t, c: redAt(w.t), reach: isNo(w) ? 330 : 230 }))
  let still = ''
  let turned = ''
  let rings = ''
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const x = PX + (i + 0.5) * gx + (j % 2 ? gx / 4 : -gx / 4)
      const y = PY + (j + 0.5) * gy
      if (Math.hypot(x - red[0], y - red[1]) < 46) continue
      // Toward the light, with a slow flow through the field.
      let a = Math.atan2(beacon[1] - y, beacon[0] - x) * 0.6 + 0.12 * Math.sin(time * 0.7 + x * 0.008 + y * 0.011)
      let flip = 0
      for (const e of events) {
        const dist = Math.hypot(x - e.c[0], y - e.c[1])
        if (dist > e.reach) continue
        flip = Math.max(flip, easeOutBack(clamp01((time - (e.t + dist / 520)) / 0.35), 1.2))
      }
      a = lerp(a, Math.PI + 0.1 * Math.sin(time * 0.9 + y * 0.02), Math.min(flip, 1.08))
      const L = 15
      const c = Math.cos(a)
      const s = Math.sin(a)
      const tip = [x + c * L, y + s * L]
      const d = `M${r(x - c * L)} ${r(y - s * L)}L${r(tip[0])} ${r(tip[1])}M${r(tip[0] - c * 8 - s * 6)} ${r(tip[1] - s * 8 + c * 6)}L${r(tip[0])} ${r(tip[1])}L${r(tip[0] - c * 8 + s * 6)} ${r(tip[1] - s * 8 - c * 6)}`
      if (flip > 0.5) turned += d
      else still += d
    }
  }
  for (const e of events) {
    const age = time - e.t
    if (age < 0 || age > 0.9) continue
    rings += `<circle cx="${r(e.c[0])}" cy="${r(e.c[1])}" r="${r(e.reach * easeOut(age / 0.9))}" fill="none" stroke="${RED}" stroke-width="2" opacity="${r(1 - age / 0.9, 3)}"/>`
  }
  const dim = 1 - 0.7 * progress
  const a = Math.PI + 0.15 * Math.sin(time * 0.9)
  const big = 54
  const tip = [red[0] + Math.cos(a) * big, red[1] + Math.sin(a) * big]
  const redArrow = `M${r(red[0] - Math.cos(a) * big)} ${r(red[1] - Math.sin(a) * big)}L${r(tip[0])} ${r(tip[1])}M${r(tip[0] + 18)} ${r(tip[1] - 14)}L${r(tip[0])} ${r(tip[1])}L${r(tip[0] + 18)} ${r(tip[1] + 14)}`
  let rays = ''
  for (let k = 0; k < 13; k++) {
    const ang = Math.PI / 2 + (k / 12) * Math.PI
    rays += `M${r(beacon[0] + Math.cos(ang) * 46)} ${r(beacon[1] + Math.sin(ang) * 46)}L${r(beacon[0] + Math.cos(ang) * 96)} ${r(beacon[1] + Math.sin(ang) * 96)}`
  }
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g opacity="${r(dim, 3)}"><circle cx="${beacon[0]}" cy="${beacon[1]}" r="36" fill="${YELLOW}"/><path d="${rays}" stroke="${YELLOW}" stroke-width="5" stroke-linecap="round"/></g>
  <path d="${still}" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
  <path d="${turned}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
  ${rings}
  <path d="${redArrow}" fill="none" stroke="${RED}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
}

/* ── D. Out of Time ───────────────────────────────────────────────── */

function metronome(x, base, angle, { arm = INK, uid, k, tempo }) {
  const H = 450
  const bw = 196
  const tw = 66
  const top = base - H
  const body = `M${x - bw / 2} ${base}L${x - tw / 2} ${top}L${x + tw / 2} ${top}L${x + bw / 2} ${base}Z`
  const pivot = [x, base - 80]
  const L = 350
  const a = (angle * Math.PI) / 180
  const tip = [pivot[0] + Math.sin(a) * L, pivot[1] - Math.cos(a) * L]
  const wPos = 0.62
  const wt = [pivot[0] + Math.sin(a) * L * wPos, pivot[1] - Math.cos(a) * L * wPos]
  let ticks = ''
  for (let s = -4; s <= 4; s++) {
    const ang = (s * 8 * Math.PI) / 180
    const r0 = 296
    const r1 = s % 2 ? 308 : 320
    ticks += `M${r(pivot[0] + Math.sin(ang) * r0)} ${r(pivot[1] - Math.cos(ang) * r0)}L${r(pivot[0] + Math.sin(ang) * r1)} ${r(pivot[1] - Math.cos(ang) * r1)}`
  }
  return `<path d="${body}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
  <clipPath id="${uid}-m${k}"><path d="${body}"/></clipPath>
  <rect x="${x + 18}" y="${top}" width="${bw}" height="${H}" fill="url(#${uid}-mh)" clip-path="url(#${uid}-m${k})"/>
  <path d="${ticks}" stroke="${INK}" stroke-width="1.6"/>
  <rect x="${x - bw / 2 - 14}" y="${base}" width="${bw + 28}" height="22" fill="${INK}"/>
  <path d="M${r(pivot[0])} ${r(pivot[1])}L${r(tip[0])} ${r(tip[1])}" stroke="${arm}" stroke-width="${arm === INK ? 4 : 6}" stroke-linecap="round"/>
  <rect x="${r(wt[0] - 15)}" y="${r(wt[1] - 12)}" width="30" height="24" fill="${arm === INK ? YELLOW : RED}" stroke="${INK}" stroke-width="2" transform="rotate(${r(angle, 2)} ${r(wt[0])} ${r(wt[1])})"/>
  <circle cx="${pivot[0]}" cy="${pivot[1]}" r="7" fill="${INK}"/>
  ${txt(x, base + 58, 22, tempo, { anchor: 'middle', fill: arm === INK ? INK : RED, weight: 600, spacing: 1, upper: false })}`
}

function outOfTime({ time, score, uid }) {
  const beat = (time - score.beatPhase) * (score.bpm / 60)
  const together = 30 * Math.sin(Math.PI * beat)
  const words = refusals(score)
  // His own tempo: in time until the first refusal, then drifting off; on every
  // No he swings hard against the others; for the held "York" he stands still.
  const firstNo = words[0]?.t ?? 40
  const york = allWords(score).filter((w) => /York/.test(w.text)).at(-1)?.t ?? score.duration
  const drift = ramp(time, firstNo, firstNo + 8)
  const ownBeat = beat - drift * 0.22 * Math.max(0, time - firstNo) * (score.bpm / 60) * 0.3
  let mine = 30 * Math.sin(Math.PI * ownBeat)
  const against = words.filter(isNo).reduce((m, w) => Math.max(m, decay(time, w.t, 0.5)), 0)
  const noSection = score.sections.find((s) => (s.kind === 'bridge' || s.kind === 'coda') && time >= s.from && time < s.to)
  if (noSection) mine = lerp(mine, -together * (1 + 0.4 * against), easeInOut(ramp(time, noSection.from, noSection.from + 1.5)))
  mine = lerp(mine, 0, easeInOut(ramp(time, york - 0.4, york + 0.6)))
  const ownBpm = time < firstNo ? 98.5 : time >= york ? 0 : noSection ? 98.5 : Math.round(98.5 * (1 - drift * 0.22 * 0.3 * (1 + Math.max(0, time - firstNo) / 200)))
  const N = 7
  const base = PB - 110
  let out = ''
  for (let k = 0; k < N; k++) {
    const x = PX + 120 + k * ((PW - 240) / (N - 1))
    const me = k === 3
    out += metronome(x, base, me ? mine : together, { arm: me ? RED : INK, uid, k, tempo: me ? (ownBpm ? `♩ = ${ownBpm}` : '♩ = —') : '♩ = 98.5' })
  }
  return `<defs>${hatch(`${uid}-mh`, { gap: 5, w: 1.6, angle: 90 })}</defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <path d="M${PX} ${base + 22}H${PR}" stroke="${INK}" stroke-width="2"/>
  ${out}`
}

/* ── C. The Signpost ──────────────────────────────────────────────── */
/*
 * A fingerpost at a crossroads. New York is the top board, in yellow; the
 * cities they said are nailed up under it as they are sung. Every refusal
 * knocks one loose to hang off its nail, and his own board, red and unlettered,
 * is painted on the other side of the post a stroke at a time.
 */
const CITIES = [['memphis', 'MEMPHIS', 1], ['nashville', 'NASHVILLE', -1], ['austin', 'AUSTIN', 1], ['la', 'L.A.', -1], ['detroit', 'DETROIT', 1]]
const swing = (t, at, target, k = 1.2) => {
  if (t < at) return 0
  const u = t - at
  return target * (1 - Math.exp(-u * 3.2) * Math.cos(u * 7 * k))
}

function board(x, y, dir, len, h, fill, text, angle, o = {}) {
  const tip = 34
  const d = dir > 0
    ? `M0 ${-h / 2}H${len - tip}L${len} 0L${len - tip} ${h / 2}H0Z`
    : `M0 ${-h / 2}H${-len + tip}L${-len} 0L${-len + tip} ${h / 2}H0Z`
  const label = text ? txt(dir * (len - tip) / 2 + dir * 6, 13, 38, text, { anchor: 'middle', weight: 700, spacing: 4, fill: o.ink ?? INK }) : ''
  const grain = `<path d="M${dir * 10} -10H${dir * (len - 60)}M${dir * 30} 8H${dir * (len - 90)}" stroke="${o.ink ?? INK}" stroke-width="1.2" opacity="0.35"/>`
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(angle, 2)})"><path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="3"/>${grain}${label}<circle cx="${dir * 16}" cy="0" r="5" fill="${INK}"/></g>`
}

function signpost({ time, score, uid }) {
  const words = allWords(score)
  const post = { x: CX + 40, top: PY + 70, foot: PB - 130 }
  const ground = post.foot
  const refs = refusals(score)
  // Boards: New York first; each city from its own word in verse 2.
  const nyAt = 0
  const cities = CITIES.map(([w, label, dir], i) => ({ label, dir, at: words.find((x) => clean(x).replace(/[.']/g, '') === w)?.t ?? 70 + i, y: post.top + 150 + i * 92 }))
  // Each refusal after a city is up knocks the next one loose, in the order they went up.
  let knock = 0
  for (const c of cities) {
    const hit = refs.find((w) => w.t > c.at + 1 && !cities.some((o) => o.hit === w.t))
    c.hit = hit?.t ?? Infinity
    void knock
  }
  const yorks = words.filter((w) => clean(w) === 'york')
  const nyLoose = yorks[0]?.t ?? Infinity
  const nyFall = yorks.at(-1)?.t ?? Infinity
  let out = `<defs>${hatch(`${uid}-g`, { gap: 7, w: 1.4, angle: -20 })}${hatch(`${uid}-p`, { gap: 5, w: 1.6, angle: 90 })}</defs>`
  // Ground and the roads crossing at the foot of the post.
  out += `<rect x="${PX}" y="${ground}" width="${PW}" height="${PB - ground}" fill="url(#${uid}-g)"/>`
  out += `<path d="M${PX} ${ground}H${PR}" stroke="${INK}" stroke-width="3"/>`
  out += `<path d="M${CX - 420} ${PB}L${post.x - 40} ${ground + 4}M${CX + 520} ${PB}L${post.x + 60} ${ground + 4}" stroke="${PAPER}" stroke-width="40"/>`
  // The post.
  out += `<rect x="${post.x - 22}" y="${post.top}" width="44" height="${ground - post.top + 10}" fill="url(#${uid}-p)" stroke="${INK}" stroke-width="3"/>`
  out += `<path d="M${post.x - 30} ${post.top}L${post.x} ${post.top - 26}L${post.x + 30} ${post.top}Z" fill="${INK}"/>`
  // New York: shudders on every refusal, swings loose on the first "York", falls on the last.
  const shake = refs.reduce((a, w) => a + decay(time, w.t, 0.15) * (w.t < nyLoose ? 3 : 0), 0)
  let nyAngle = -3 + shake * Math.sin(time * 40) + swing(time, nyLoose, 18)
  let nyY = post.top + 50
  let nyX = post.x
  if (time > nyFall) {
    const u = clamp01((time - nyFall) / 0.45)
    nyY = lerp(nyY, ground - 30, easeIn(u))
    nyX += 40 * u
    nyAngle = lerp(nyAngle, 4, u)
  }
  // City boards: up straight, then hanging from their nail.
  for (const c of cities) {
    if (time < c.at - 0.1) continue
    const up = easeOut(clamp01((time - c.at + 0.1) / 0.35))
    const a = c.dir * (2 + swing(time, c.hit, 64)) * 1
    out += `<g opacity="${r(up, 3)}">${board(post.x + c.dir * 20, c.y, c.dir, 420, 62, PAPER, c.label, a)}</g>`
  }
  // His board: painted across the post, left, a stroke per refusal.
  const painted = refs.filter((w) => w.t <= time).length / refs.length
  if (painted > 0) {
    const len = 520
    const y = PB - 300
    out += `<g transform="translate(${post.x - 20} ${y})"><path d="M0 -36H${-len + 40}L${-len} 0L${-len + 40} 36H0Z" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 8" opacity="0.5"/>`
    out += `<clipPath id="${uid}-paint"><rect x="${r(-len * painted)}" y="-40" width="${r(len * painted)}" height="80"/></clipPath>`
    out += `<path d="M0 -36H${-len + 40}L${-len} 0L${-len + 40} 36H0Z" fill="${RED}" stroke="${INK}" stroke-width="3" clip-path="url(#${uid}-paint)"/><circle cx="-16" cy="0" r="5" fill="${INK}"/></g>`
  }
  out += board(nyX + 20, nyY, 1, 560, 76, YELLOW, 'NEW YORK', nyAngle)
  return out
}

/* ── E. The Chain ─────────────────────────────────────────────────── */
/*
 * A chain from a ring in the wall to a winch marked New York, being wound in.
 * It tightens all song and jerks on every "No"; the middle link is red and
 * opens a little each time. On the voice letting go of "York", it parts.
 */
function chainLink(x, y, angle, flat, color, stretch = 0) {
  const L = 54 + stretch
  if (flat) return `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(angle, 2)})"><rect x="${r(-L / 2)}" y="-17" width="${r(L)}" height="34" rx="17" fill="none" stroke="${color}" stroke-width="${color === RED ? 12 : 9}"/>${stretch > 4 ? `<path d="M${r(-L / 2 + 6)} -10l10 -8M${r(L / 2 - 14)} 12l10 -8" stroke="${PAPER}" stroke-width="3"/>` : ''}</g>`
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(angle, 2)})"><rect x="${r(-L / 2)}" y="-5" width="${r(L)}" height="10" rx="5" fill="${color}"/></g>`
}

function chain({ time, score, uid }) {
  const nos = allWords(score).filter(isNo)
  const yorks = allWords(score).filter((w) => clean(w) === 'york')
  const snap = 206.44
  const xL = PX + 150
  const xR = PR - 230
  const y0 = CY - 30
  const progress = clamp01(time / snap)
  const jerk = nos.reduce((a, w) => a + decay(time, w.t, 0.18), 0)
  const sag = time < snap ? Math.max(4, 230 * (1 - progress) ** 1.4 - jerk * 26) : 0
  const opened = nos.filter((w) => w.t <= time).length / nos.length
  const step = 47
  const n = Math.floor((xR - xL) / step)
  const mid = Math.floor(n / 2)
  const after = Math.max(0, time - snap) * 2.2
  let links = ''
  for (let i = 0; i <= n; i++) {
    const u = i / n
    let x = xL + u * (xR - xL)
    let y = y0 + sag * 4 * u * (1 - u)
    const slope = sag * 4 * (1 - 2 * u) / (xR - xL)
    let a = (Math.atan(slope) * 180) / Math.PI
    if (time >= snap) {
      if (i <= mid) {
        // The left half swings down from the ring.
        const th = (Math.min(88, 88 * easeOut(clamp01(after / 0.9))) + 6 * Math.exp(-after * 2) * Math.sin(after * 9)) * Math.PI / 180
        const d = (x - xL)
        x = xL + d * Math.cos(th)
        y = y0 + d * Math.sin(th)
        a = (th * 180) / Math.PI
      } else {
        // The right half is reeled off towards the winch.
        x += 900 * easeIn(clamp01(after / 1.6))
      }
    }
    const red = i === mid
    links += chainLink(x, y, a, i % 2 === 0, red ? RED : INK, red ? 26 * opened + (time >= snap ? 30 : 0) : 0)
  }
  // The wall and its ring.
  let out = `<defs>${hatch(`${uid}-w`, { gap: 6, w: 1.6, angle: 45 })}${hatch(`${uid}-f`, { gap: 9, w: 1.2 })}</defs>`
  out += `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="url(#${uid}-f)" opacity="0.35"/>`
  out += `<rect x="${PX}" y="${PY}" width="100" height="${PH}" fill="url(#${uid}-w)" stroke="${INK}" stroke-width="3"/>`
  out += `<rect x="${PX + 84}" y="${y0 - 50}" width="40" height="100" fill="${INK}"/><circle cx="${xL - 10}" cy="${y0}" r="26" fill="none" stroke="${INK}" stroke-width="10"/>`
  // The winch.
  const wx = PR - 130
  const turns = (1 - Math.max(0, sag) / 230) * 900 + after * 400
  let spokes = ''
  for (let k = 0; k < 8; k++) {
    const ang = ((k * 45 + turns) * Math.PI) / 180
    spokes += `M${wx} ${y0}L${r(wx + 92 * Math.cos(ang))} ${r(y0 + 92 * Math.sin(ang))}`
  }
  out += links
  out += `<path d="M${wx - 60} ${PB}L${wx} ${y0}L${wx + 60} ${PB}" fill="none" stroke="${INK}" stroke-width="8"/>`
  out += `<circle cx="${wx}" cy="${y0}" r="100" fill="${PAPER}" stroke="${INK}" stroke-width="5"/><path d="${spokes}" stroke="${INK}" stroke-width="5"/><circle cx="${wx}" cy="${y0}" r="22" fill="${INK}"/>`
  out += `<rect x="${wx - 100}" y="${y0 + 130}" width="200" height="40" fill="${YELLOW}" stroke="${INK}" stroke-width="2"/>${txt(wx, y0 + 158, 24, 'NEW YORK', { anchor: 'middle', weight: 700, spacing: 3 })}`
  void yorks
  return out
}

export const CONCEPTS = [
  {
    id: 'lights-on-the-shore',
    name: 'The Lights on the Shore',
    lyric: "I don't wanna follow those lights I see out on the shore",
    idea: 'A night sea engraved in black lines, with the shore along the horizon and its lights coming on one by one in poster yellow. Under us a boat is heading out to sea, and its wake runs back to the shore in red.',
    motion: 'We pull away from the land for the whole song, so the shore and its lights shrink towards the horizon. Every line lights more of them, and they flare on every "lights". Every refusal throws the boat into a hard turn that stays in the wake. By the held "York" the shore is a thin yellow thread.',
    red: 'The wake: every turn he made away from the shore.',
    stills: [42, 99, 160, 194],
    frame: lightsOnTheShore,
  },
  {
    id: 'against-the-grain',
    name: 'Against the Grain',
    lyric: "I don't wanna listen to anybody ever anymore",
    idea: 'A field of hundreds of small ink arrows, all pointing towards a yellow light on the right edge of the frame. One red arrow points the other way and pushes slowly through them.',
    motion: 'The field sways on the beat. Every measured "No", "don\'t", "won\'t" and "not" sends a ring out from the red arrow, and the arrows it reaches turn round and go dark with him. Across the song the turned ground spreads behind him and the light fades.',
    red: 'The one arrow pointing the other way, and the ring of each refusal.',
    stills: [45, 103, 115, 194],
    frame: againstTheGrain,
  },
  {
    id: 'signpost',
    name: 'The Signpost',
    lyric: 'They said move to Memphis, Nashville, Austin, L.A., or Detroit',
    idea: 'A fingerpost at a crossroads. New York is the top board, in poster yellow, and every city they told him to move to is nailed up under it as it is sung. His own board is on the other side of the post: red, blank, pointing the other way.',
    motion: 'Boards go up on their words in verse 2. Every refusal knocks one loose to swing and hang off its nail, and New York shudders on each. His board is painted a stroke per refusal. On the first "York" New York swings loose, and as the voice lets go of the held "York" it drops into the grass.',
    red: 'His board, the only one with no name on it.',
    stills: [72.5, 99, 119, 206.64],
    frame: signpost,
  },
  {
    id: 'out-of-time',
    name: 'Out of Time',
    lyric: "I don't wanna listen to anybody ever anymore",
    idea: 'Seven engraved metronomes in a row, all ticking at the record\'s own 98.5. The one in the middle has a red arm.',
    motion: 'All seven keep the click together until the first "don\'t". From there the red one drifts onto its own slower tempo, and its readout drops below 98.5. In the "No, no, no, no" sections it swings hard against the other six. On the held "York" it stops dead and stands upright while the rest tick on.',
    red: 'The metronome that will not keep time.',
    stills: [30, 92, 110.3, 200],
    frame: outOfTime,
  },
  {
    id: 'chain',
    name: 'The Chain',
    lyric: "No, I won't go, I'm not going to New York",
    idea: 'A chain across the plate, from an iron ring in the wall to a winch marked New York that is winding it in. The link in the middle is red.',
    motion: 'The winch takes up slack all song, so the chain rises from a deep sag to a straight bar. Every "No" jerks it and pulls the red link a little further open. On 3:26, as the voice finally lets go of "York", the red link parts: one half drops from the wall, the other is reeled away.',
    red: 'The one link that will not hold.',
    stills: [42, 111, 190, 206.64],
    frame: chain,
  },
]
