/*
 * Ghost — track 10, monotype. The album still, and the seed of the film.
 *
 * A monotype is painted on a plate and printed once. What is left on the plate
 * pulls a second, fainter impression, and printmakers call that the ghost. The
 * whole film is the ghost print: soft, smeared, half there, the image made as
 * much by what the rag wiped away as by the ink left behind.
 *
 * One thing is not a ghost. The city burning is printed at full strength in the
 * album's red — the fire is the journey (albumStyle.ts), the thing the song
 * cannot reach — and nothing else in the frame is allowed to be that loud.
 *
 * The figure is not drawn. It is wiped out of the grey: a paper-coloured
 * absence, blurred, standing between the amplifiers and the fire.
 *
 * Every part is a function a film can call per frame. The filters are the
 * cost: see the notes on `plateInk` and `smear`.
 */
import { rect, circle, rng, r } from '../../../shared/video/kit.mjs'
import { paper, plateClip, lyricMargin, INK, RED, PAPER, SECOND_INK, SHEET } from '../../../shared/video/album.mjs'

export const GREY = SECOND_INK.ghost

/* ── Filters ──────────────────────────────────────────────────────────
 *
 * Three, all namespaced. `smear` displaces a shape's edge with low-frequency
 * noise so nothing has a clean line; `blot` does the same at higher frequency
 * for the fire; `soft` is the blur the figure is wiped with. In a film, keep
 * the turbulence seeds and frequencies fixed — animating them re-rasterises the
 * noise every frame, which is the one thing here that would not hold 60 fps.
 * Move the camera over the filtered layers instead.
 */
export function filters(uid) {
  return `
    <filter id="${uid}-smear" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.02" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="${uid}-blot" x="-20%" y="-30%" width="140%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.016 0.03" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="0.8"/>
    </filter>
    <filter id="${uid}-smudge" x="-5%" y="-10%" width="110%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" seed="13" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="${uid}-drag" x="-5%" y="-15%" width="110%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.07 0.004" numOctaves="2" seed="19" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="1.4"/>
    </filter>
    <filter id="${uid}-lift" x="-30%" y="-20%" width="160%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.035" numOctaves="3" seed="23" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="24" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="3.5"/>
    </filter>
    <filter id="${uid}-haze" x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation="28"/>
    </filter>
    <pattern id="${uid}-streaks" patternUnits="userSpaceOnUse" width="140" height="900">
      ${(() => { const q = rng(71); let o = ''; for (let x = 0; x < 140;) { const w = 1 + q() * 6; o += `<rect x="${r(x)}" y="0" width="${r(w)}" height="900" fill="${q() < 0.65 ? PAPER : INK}" opacity="${r(0.04 + q() * 0.12, 2)}"/>`; x += w + 3 + q() * 12 } return o })()}
    </pattern>
    <filter id="${uid}-soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6.5"/>
    </filter>
    <filter id="${uid}-mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves="4" seed="11" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.545  0 0 0 0 0.522  0 0 0 0 0.502  0 0 0 1.6 -0.55" result="a"/>
      <feComposite in="a" in2="SourceGraphic" operator="in"/>
    </filter>`
}

/**
 * The plate's residue: an uneven grey film over the whole image, heavier at
 * the foot, with the rag's long diagonal wipes taken out of it. This is what
 * makes it read as a ghost print and not as a grey drawing.
 */
export function plateInk(uid) {
  const { x, y, w, h } = SHEET.plate
  const rand = rng(91)
  const wipes = Array.from({ length: 7 }, (_, i) => {
    const x0 = x + rand() * w
    const y0 = y + 40 + rand() * 360
    const len = 260 + rand() * 520
    return `<path d="M${r(x0)} ${r(y0)} q${r(len * 0.5)} ${r(-40 - rand() * 60)} ${r(len)} ${r(-10 + rand() * 30)}" stroke="${PAPER}" stroke-width="${r(18 + rand() * 30)}" stroke-linecap="round" fill="none" opacity="${r(0.35 + rand() * 0.3, 2)}"/>`
  }).join('')
  return `
    ${rect(x, y, w, h, GREY, { opacity: 0.22 })}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000" filter="url(#${uid}-mottle)" opacity="0.9"/>
    ${rect(x, y + h * 0.62, w, h * 0.38, GREY, { opacity: 0.3 })}
    <g filter="url(#${uid}-smear)">${wipes}</g>`
}

/** The skyline: towers of uneven height along a line, printed faint and smeared. */
export function skyline(uid, { base = 520, from = 360, to = 1566, seed = 5, fill = GREY, opacity = 0.75, short = false } = {}) {
  const rand = rng(seed)
  let d = `M${from} ${base}`
  let x = from
  while (x < to) {
    const w = 38 + rand() * 70
    const h = short ? 20 + rand() * 60 : 60 + rand() * 190
    d += ` V${r(base - h)} H${r(Math.min(x + w, to))} V${r(base - 20 - rand() * 30)}`
    x += w + rand() * 14
  }
  d += ` V${base} Z`
  return `<path d="${d}" fill="${fill}" opacity="${opacity}" filter="url(#${uid}-smear)"/>`
}

/**
 * A row of towers as dragged ink: solid first, then a rag pulled down through
 * them — the streak pattern clipped to the towers — and the whole row run
 * through `drag`, whose noise is stretched vertically so edges tear in long
 * vertical streaks the way ink does under a dragged rag. Windows are not drawn,
 * they are wiped: small soft lifts of paper at low strength. Two or three rows
 * at receding tones make the depth; none of them is black, because a ghost print
 * has none.
 */
export function city(uid, { base = 650, from = 640, to = 1566, seed = 29, fill = '#5b5550', tall = [110, 340], lit = 0.18, id = 'near' } = {}) {
  const rand = rng(seed)
  const towers = []
  const windows = []
  let x = from
  while (x < to) {
    const w = 56 + rand() * 84
    const h = tall[0] + rand() * (tall[1] - tall[0])
    const top = base - h
    towers.push(`M${r(x)} ${base + 40} V${r(top + 6)} Q${r(x + w * 0.5)} ${r(top - 4)} ${r(x + w)} ${r(top + 4)} V${base + 40} Z`)
    if (rand() < 0.28) towers.push(`M${r(x + w * 0.42)} ${r(top + 2)} V${r(top - 36 - rand() * 34)} H${r(x + w * 0.52)} V${r(top + 2)} Z`)
    for (let wy = top + 26; wy < base - 24; wy += 34) {
      for (let wx = x + 14; wx < x + w - 18; wx += 24) {
        if (rand() < 0.6) continue
        windows.push(`M${r(wx)} ${r(wy)} h8 v${r(10 + rand() * 12)} h-8 Z`)
      }
    }
    x += w + 4 + rand() * 18
  }
  const cid = `${uid}-city-${id}`
  const d = towers.join('')
  return `<clipPath id="${cid}"><path d="${d}"/></clipPath>
    <g filter="url(#${uid}-drag)">
      <path d="${d}" fill="${fill}"/>
      <rect x="${from}" y="${base - tall[1] - 90}" width="${to - from}" height="${tall[1] + 160}" fill="url(#${uid}-streaks)" clip-path="url(#${cid})"/>
      <path d="${windows.join('')}" fill="${PAPER}" opacity="${lit}"/>
    </g>`
}

/**
 * The fire — the one full-strength thing in the film. Tongues rise from the
 * roofline; in a film each tongue's height would breathe on a slow sine off
 * the clock, and a new one would catch on each measured word of "fire".
 */
export function fire(uid, { base = 520, from = 560, to = 1480, seed = 17, heat = 1 } = {}) {
  const rand = rng(seed)
  const tongues = []
  for (let x = from; x < to; x += 34 + rand() * 40) {
    const h = (140 + rand() * 260) * heat * (0.5 + 0.5 * Math.sin(((x - from) / (to - from)) * Math.PI))
    const w = 70 + rand() * 70
    const lean = (rand() - 0.4) * 50
    tongues.push(`M${r(x - w / 2)} ${r(base)} C${r(x - w * 0.62)} ${r(base - h * 0.45)} ${r(x - w * 0.1 + lean * 0.6)} ${r(base - h * 0.62)} ${r(x + lean)} ${r(base - h)} C${r(x + w * 0.2 + lean * 0.4)} ${r(base - h * 0.6)} ${r(x + w * 0.66)} ${r(base - h * 0.42)} ${r(x + w / 2)} ${r(base)} Z`)
  }
  return `
    <ellipse cx="${r((from + to) / 2)}" cy="${r(base - 230)}" rx="${r((to - from) * 0.55)}" ry="150" fill="${RED}" opacity="0.2" filter="url(#${uid}-haze)"/>
    <g filter="url(#${uid}-blot)">
      <path d="${tongues.join('')}" fill="${RED}"/>
    </g>
    <rect x="${from - 60}" y="${base + 30}" width="${to - from + 120}" height="40" fill="${RED}" opacity="0.22" filter="url(#${uid}-smear)"/>`
}

/** An amplifier stack: two cabinets and their speaker cones, in ghost ink. */
export function amps(uid, x, base, s = 1) {
  const cab = (cx, top, w, h, cones) => `
    <rect x="${r(cx - w / 2)}" y="${r(top)}" width="${r(w)}" height="${r(h)}" rx="6" fill="${INK}" opacity="0.5"/>
    ${cones.map(([dx, dy, rad]) => circle(cx + dx, top + dy, rad, { fill: GREY, opacity: 0.8 }) + circle(cx + dx, top + dy, rad * 0.35, { fill: INK, opacity: 0.5 })).join('')}`
  return `<g filter="url(#${uid}-smear)" transform="translate(${x} ${base}) scale(${s})">
    ${cab(0, -300, 250, 150, [[-58, 75, 44], [58, 75, 44]])}
    ${cab(0, -150, 250, 150, [[-58, 75, 44], [58, 75, 44]])}
    ${cab(0, -390, 210, 86, [[0, 43, 22]])}
  </g>`
}

/**
 * The figure, lifted rather than drawn: a person-shaped area where the rag took
 * the ink off the plate — head, shoulders, a body that fades out towards the
 * floor, and one arm reaching for the fire. Filled in paper, torn at the edge by
 * `lift`, and with the plate's own tone let back through it (the mottle and a
 * few rag streaks inside), so it is an absence in the print and not a shape on
 * top of it.
 */
export function silhouetteD(x, ground, h) {
  const hy = ground - h * 0.9
  const sy = hy + h * 0.16
  const sw = h * 0.2
  return [
    `M${r(x - h * 0.045)} ${r(hy + h * 0.075)}`,
    `C${r(x - h * 0.05)} ${r(sy - h * 0.02)} ${r(x - sw * 0.9)} ${r(sy - h * 0.01)} ${r(x - sw)} ${r(sy + h * 0.06)}`,
    `C${r(x - sw * 1.05)} ${r(sy + h * 0.2)} ${r(x - h * 0.15)} ${r(ground - h * 0.5)} ${r(x - h * 0.15)} ${r(ground - h * 0.38)}`,
    `C${r(x - h * 0.16)} ${r(ground - h * 0.2)} ${r(x - h * 0.13)} ${r(ground - h * 0.08)} ${r(x - h * 0.12)} ${r(ground + 10)}`,
    `L${r(x + h * 0.12)} ${r(ground + 10)}`,
    `C${r(x + h * 0.13)} ${r(ground - h * 0.1)} ${r(x + h * 0.16)} ${r(ground - h * 0.25)} ${r(x + h * 0.15)} ${r(ground - h * 0.4)}`,
    `C${r(x + h * 0.14)} ${r(ground - h * 0.5)} ${r(x + sw * 0.72)} ${r(sy + h * 0.2)} ${r(x + sw * 0.72)} ${r(sy + h * 0.12)}`,
    // the reaching arm: underside out to the hand, round the fingers, back along the top
    `C${r(x + h * 0.32)} ${r(sy + h * 0.06)} ${r(x + h * 0.5)} ${r(sy - h * 0.0)} ${r(x + h * 0.64)} ${r(sy - h * 0.035)}`,
    `C${r(x + h * 0.7)} ${r(sy - h * 0.05)} ${r(x + h * 0.7)} ${r(sy - h * 0.1)} ${r(x + h * 0.63)} ${r(sy - h * 0.095)}`,
    `C${r(x + h * 0.48)} ${r(sy - h * 0.075)} ${r(x + h * 0.3)} ${r(sy - h * 0.04)} ${r(x + sw * 0.85)} ${r(sy - h * 0.005)}`,
    `C${r(x + sw * 0.6)} ${r(sy - h * 0.03)} ${r(x + h * 0.05)} ${r(sy - h * 0.02)} ${r(x + h * 0.045)} ${r(hy + h * 0.075)}`,
    'Z',
    // the head
    `M${r(x - h * 0.075)} ${r(hy)} a${r(h * 0.075)} ${r(h * 0.09)} 0 1 0 ${r(h * 0.15)} 0 a${r(h * 0.075)} ${r(h * 0.09)} 0 1 0 ${r(-h * 0.15)} 0 Z`,
  ].join(' ')
}

export function wipedFigure(uid, x, ground, h, opacity = 0.92) {
  const d = silhouetteD(x, ground, h)
  const fid = `${uid}-figure`
  const rand = rng(41)
  const rags = Array.from({ length: 3 }, (_, i) => {
    const y0 = ground - h * (0.25 + i * 0.22 + rand() * 0.1)
    return `<path d="M${r(x - h * 0.3)} ${r(y0 + h * 0.08)} q${r(h * 0.35)} ${r(-h * 0.14)} ${r(h * 0.8)} ${r(-h * 0.2)}" stroke="${GREY}" stroke-width="${r(10 + rand() * 12)}" fill="none" opacity="${r(0.12 + rand() * 0.1, 2)}"/>`
  }).join('')
  return `
    <linearGradient id="${fid}-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff"/><stop offset="0.62" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="${fid}-mask" maskUnits="userSpaceOnUse" x="${r(x - h)}" y="${r(ground - h * 1.1)}" width="${r(h * 2)}" height="${r(h * 1.2)}">
      <rect x="${r(x - h)}" y="${r(ground - h * 1.1)}" width="${r(h * 2)}" height="${r(h * 1.2)}" fill="url(#${fid}-fade)"/>
    </mask>
    <clipPath id="${fid}-clip"><path d="${d}"/></clipPath>
    <path d="M${r(x - h * 0.42)} ${r(ground)} C${r(x - h * 0.5)} ${r(ground - h * 0.8)} ${r(x - h * 0.1)} ${r(ground - h * 1.12)} ${r(x + h * 0.3)} ${r(ground - h * 0.98)} S${r(x + h * 0.85)} ${r(ground - h * 0.7)} ${r(x + h * 0.55)} ${r(ground - h * 0.45)} S${r(x + h * 0.45)} ${r(ground)} ${r(x + h * 0.3)} ${r(ground)} Z" fill="${INK}" opacity="0.2" filter="url(#${uid}-smear)"/>
    <g mask="url(#${fid}-mask)" opacity="${opacity}">
      <g filter="url(#${uid}-lift)">
        <path d="${d}" fill="${PAPER}"/>
        <g clip-path="url(#${fid}-clip)">
          <rect x="${r(x - h)}" y="${r(ground - h)}" width="${r(h * 2)}" height="${r(h * 1.1)}" fill="#000" filter="url(#${uid}-mottle)" opacity="0.3"/>
          ${rags}
        </g>
      </g>
    </g>`
}

/* ── The frame ─────────────────────────────────────────────────────── */

export function heroFrame({ now = 2.5, uid = 'ghost', heat = 1 } = {}) {
  const clip = plateClip(uid)
  const { x: px, y: py, w: pw, h: ph } = SHEET.plate
  const line = {
    index: 0,
    text: "But you're on fire and I'm a ghost",
    words: ['But', "you're", 'on', 'fire', 'and', "I'm", 'a', 'ghost'].map((text, i) => ({ t: 1 + i * 0.4, text })),
  }
  return `${paper()}
    <defs>${clip.def}${filters(uid)}</defs>
    <g clip-path="${clip.url}">
      ${rect(px, py, pw, ph, PAPER)}
      ${plateInk(uid)}
      ${fire(uid, { base: 470, from: 760, to: 1540, heat })}
      <linearGradient id="${uid}-cityfade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.16" stop-color="#fff"/><stop offset="1" stop-color="#fff"/>
      </linearGradient>
      <mask id="${uid}-citymask" maskUnits="userSpaceOnUse" x="600" y="0" width="1000" height="900">
        <rect x="600" y="0" width="1000" height="900" fill="url(#${uid}-cityfade)"/>
      </mask>
      <g mask="url(#${uid}-citymask)">
        ${city(uid, { base: 520, from: 600, seed: 7, fill: '#aaa39b', tall: [70, 200], lit: 0.12, id: 'far' })}
        ${city(uid, { base: 600, from: 620, seed: 13, fill: '#847d76', tall: [90, 260], lit: 0.14, id: 'mid' })}
        ${city(uid, { base: 690, from: 660, seed: 29, fill: '#5e5852', tall: [100, 300], lit: 0.16, id: 'near' })}
      </g>
      ${amps(uid, 230, py + ph + 6, 1)}
      ${wipedFigure(uid, 500, py + ph + 4, 420)}
    </g>
    ${lyricMargin({ now, line, uid })}`
}

export default {
  slug: 'ghost',
  hero: () => heroFrame({ uid: 'hero' }),
}
