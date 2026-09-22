import { t, rect, line, path, circle, wobble, wobbleCircle, rng, fit, r } from '../kit.mjs'

const PAPER = '#f7f4ea'
const RULE = '#c2d4e2'
const PENCIL = '#23262b'
const RED = '#d8382b'
const MARGIN = '#e8a0a0'

/*
 * The one the whole suite was worth building for: somebody drawing the song.
 *
 * The frame is cut in two and the halves never trade places. The top third is
 * the lyric, set flat and quiet and completely still — you read it, it does not
 * perform. The bottom two thirds is a stick-figure stage where the line is
 * acted out, and that is where every moving thing in the film lives.
 *
 * It is drawn, so it is drawn badly on purpose: every straight line is five
 * segments with a pixel or two of tremble on each, every circle is an
 * eighteen-point polygon that does not quite close. The tremble is seeded off
 * the frame number in the film, which is what gives it boil — the shake a
 * hand-drawn cartoon has when the same drawing is re-inked every other frame.
 */

const pen = (d, o = {}) => path(d, { stroke: o.stroke ?? PENCIL, sw: o.sw ?? 5, cap: 'round', join: 'round', opacity: o.opacity })

/**
 * A stick figure. `pose` picks the limbs; everything else is proportion, so a
 * figure can be drawn at any height on any ground line and still be the same
 * person.
 */
function figure(x, ground, h, pose = 'walk', o = {}) {
  const seed = o.seed ?? 1
  const stroke = o.stroke ?? PENCIL
  const sw = o.sw ?? Math.max(3, h * 0.035)
  const wob = o.wob ?? h * 0.016
  const head = h * 0.11
  const headY = ground - h * 0.885
  const neck = ground - h * 0.775
  const shoulder = ground - h * 0.70
  const hip = ground - h * 0.40
  const A = {
    walk: [[x - h * 0.22, hip + h * 0.02], [x + h * 0.19, shoulder - h * 0.06]],
    stand: [[x - h * 0.16, hip - h * 0.02], [x + h * 0.16, hip - h * 0.02]],
    wave: [[x - h * 0.18, hip - h * 0.04], [x + h * 0.22, ground - h * 1.02]],
    carry: [[x - h * 0.2, hip + h * 0.06], [x + h * 0.2, hip + h * 0.06]],
    reach: [[x - h * 0.26, shoulder - h * 0.12], [x + h * 0.26, shoulder - h * 0.14]],
    sit: [[x - h * 0.2, hip], [x + h * 0.2, hip]],
  }[pose] ?? A?.walk
  const L = {
    walk: [[x - h * 0.2, ground], [x + h * 0.17, ground]],
    stand: [[x - h * 0.09, ground], [x + h * 0.09, ground]],
    wave: [[x - h * 0.1, ground], [x + h * 0.12, ground]],
    carry: [[x - h * 0.13, ground], [x + h * 0.13, ground]],
    reach: [[x - h * 0.16, ground], [x + h * 0.16, ground]],
    sit: [[x - h * 0.3, hip + h * 0.02], [x - h * 0.3, ground]],
  }[pose] ?? [[x - h * 0.2, ground], [x + h * 0.17, ground]]

  const p = (x1, y1, x2, y2, s) => pen(wobble(x1, y1, x2, y2, wob, seed + s), { stroke, sw })
  return `
    ${pen(wobbleCircle(x, headY, head, wob * 0.9, seed), { stroke, sw })}
    ${p(x, neck, x, hip, 1)}
    ${p(x, shoulder, A[0][0], A[0][1], 2)}
    ${p(x, shoulder, A[1][0], A[1][1], 3)}
    ${p(x, hip, L[0][0], L[0][1], 4)}
    ${p(x, hip, L[1][0], L[1][1], 5)}`
}

/** The ruled paper the whole style is drawn on. */
const sheet = () => `
  ${rect(0, 0, 1600, 900, PAPER)}
  ${Array.from({ length: 11 }, (_, i) => line(0, 130 + i * 70, 1600, 130 + i * 70, RULE, 1.6, { opacity: 0.5 })).join('')}
  ${line(150, 0, 150, 900, MARGIN, 2, { opacity: 0.7 })}`

/** A hand-drawn prop, since not everything in a scene is a person. */
const props = {
  suitcase: (x, y, s, seed = 2) => `
    ${pen(wobble(x - s, y, x + s, y, 2.5, seed) + ` L${r(x + s)} ${r(y + s * 0.72)} L${r(x - s)} ${r(y + s * 0.72)} Z`)}
    ${pen(`M${r(x - s * 0.3)} ${r(y)} q${r(s * 0.3)} ${r(-s * 0.4)} ${r(s * 0.6)} 0`)}`,
  sun: (x, y, s, seed = 3) => `
    ${pen(wobbleCircle(x, y, s, 2.4, seed), { stroke: RED })}
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      return pen(wobble(x + Math.cos(a) * s * 1.35, y + Math.sin(a) * s * 1.35, x + Math.cos(a) * s * 1.85, y + Math.sin(a) * s * 1.85, 2, seed + i), { stroke: RED, sw: 4 })
    }).join('')}`,
  boot: (x, y, s, seed = 4) => pen(`M${r(x)} ${r(y - s)} L${r(x + s * 0.5)} ${r(y - s)} L${r(x + s * 0.5)} ${r(y - s * 0.3)} L${r(x + s * 1.25)} ${r(y - s * 0.1)} L${r(x + s * 1.3)} ${r(y)} L${r(x)} ${r(y)} Z`),
  crown: (x, y, s) => pen(`M${r(x - s)} ${r(y)} L${r(x - s)} ${r(y - s * 0.95)} L${r(x - s * 0.45)} ${r(y - s * 0.35)} L${r(x)} ${r(y - s * 1.15)} L${r(x + s * 0.45)} ${r(y - s * 0.35)} L${r(x + s)} ${r(y - s * 0.95)} L${r(x + s)} ${r(y)} Z`, { stroke: RED }),
  cloud: (x, y, s, seed = 6) => pen(`M${r(x - s)} ${r(y)} q${r(s * 0.1)} ${r(-s * 0.7)} ${r(s * 0.7)} ${r(-s * 0.5)} q${r(s * 0.3)} ${r(-s * 0.6)} ${r(s * 0.9)} ${r(-s * 0.12)} q${r(s * 0.6)} ${r(-s * 0.05)} ${r(s * 0.4)} ${r(s * 0.62)} Z`, { opacity: 0.45 }),
}

/** The lyric band. Flat, still, and never the same height as the drawing. */
const band = (rows, o = {}) => {
  const { accent = 2, height = 250 } = o
  let y = 96
  return `${rect(0, 0, 1600, height, PAPER)}
    ${line(0, height, 1600, height, PENCIL, 3)}
    ${rows.map((row, i) => {
      const size = Math.min(80, fit(row, 1360, 96))
      y += size
      return t({ x: 800, y: y - size * 0.1, size, text: row, fill: i === accent ? RED : PENCIL, anchor: 'middle', weight: 600, len: Math.min(1360, row.length * size * 0.62) })
    }).join('')}`
}

export default {
  id: 'b1-flipbook',
  family: 'B',
  name: 'Flipbook',
  accent: RED,
  tagline: 'Somebody drawing the song. Lyric flat and still along the top, a stick-figure stage underneath where everything that moves lives.',
  palette: [['Paper', PAPER], ['Pencil', PENCIL], ['Rule', RULE], ['Red', RED]],

  hero: () => `
    ${sheet()}
    ${band(['WALK UNTIL MY BOOTS', 'ARE BREAKING THROUGH'], { accent: 1, height: 250 })}
    ${props.sun(1330, 400, 58)}
    ${props.cloud(420, 380, 90)}
    ${props.cloud(980, 350, 70)}
    ${pen(wobble(0, 760, 1600, 758, 4, 21), { sw: 4 })}
    ${figure(330, 760, 240, 'carry', { seed: 3 })}
    ${props.suitcase(392, 690, 42, 8)}
    ${figure(690, 760, 230, 'walk', { seed: 11 })}
    ${figure(1010, 760, 225, 'walk', { seed: 17 })}
    ${props.boot(1180, 760, 60, 9)}
    ${props.boot(1268, 760, 60, 13)}
    ${Array.from({ length: 5 }, (_, i) => pen(wobble(200 + i * 70, 820 + i * 4, 250 + i * 70, 818 + i * 4, 3, 40 + i), { sw: 3, opacity: 0.35 })).join('')}`,

  thumbs: [
    {
      label: 'Title',
      note: 'Hand-lettered title, one figure, nothing else on the page yet.',
      draw: () => `
        ${sheet()}
        ${t({ x: 800, y: 300, size: 170, text: 'Andalusia', fill: PENCIL, anchor: 'middle', weight: 600 })}
        ${t({ x: 800, y: 380, size: 40, text: 'Havre De Grace', fill: RED, anchor: 'middle', weight: 500, tracking: 14 })}
        ${pen(wobble(0, 700, 1600, 702, 4, 5), { sw: 4 })}
        ${figure(800, 700, 260, 'wave', { seed: 2 })}
        ${props.sun(1350, 220, 60)}`,
    },
    {
      label: 'Verse',
      note: 'One scene per line. The figure crosses the frame as the verse goes on.',
      draw: () => `
        ${sheet()}
        ${band(['BUT LIKE A LOVER STRANDED', 'UNDERNEATH A CHURCHYARD'], { accent: 1 })}
        ${pen(wobble(0, 770, 1600, 768, 4, 31), { sw: 4 })}
        ${pen(`M${360} ${770} L${360} ${520} L${470} ${430} L${580} ${520} L${580} ${770} Z`)}
        ${pen(wobble(470, 430, 470, 350, 3, 33), { sw: 4 })}
        ${pen(wobble(440, 380, 500, 380, 3, 34), { sw: 4 })}
        ${figure(880, 770, 250, 'stand', { seed: 41 })}
        ${[1080, 1200, 1320].map((x, i) => pen(`M${x - 40} ${770} q40 -70 80 0 Z`, { sw: 4, opacity: 0.6 - i * 0.1 })).join('')}`,
    },
    {
      label: 'Chorus',
      note: 'The band inverts to pencil, the stage fills — everyone in the song at once.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PENCIL)}
        ${rect(0, 0, 1600, 250, PENCIL)}
        ${t({ x: 800, y: 130, size: 82, text: 'If I were king', fill: PAPER, anchor: 'middle', weight: 600 })}
        ${t({ x: 800, y: 215, size: 82, text: 'for just a day', fill: RED, anchor: 'middle', weight: 600 })}
        ${line(0, 250, 1600, 250, PAPER, 3)}
        ${pen(wobble(0, 780, 1600, 778, 4, 51), { stroke: PAPER, sw: 4 })}
        ${figure(400, 780, 280, 'wave', { seed: 55, stroke: PAPER })}
        ${figure(800, 780, 330, 'reach', { seed: 57, stroke: PAPER })}
        ${figure(1200, 780, 270, 'wave', { seed: 59, stroke: PAPER })}
        ${props.crown(800, 780 - 330 * 1.02, 60)}`,
    },
    {
      label: 'Oh-ohs',
      note: 'No lyric band. Seventeen figures come onto the line, one per oh.',
      draw: () => `
        ${sheet()}
        ${pen(wobble(0, 700, 1600, 698, 4, 61), { sw: 4 })}
        ${Array.from({ length: 10 }, (_, i) => figure(120 + i * 152, 700, 150 + (i === 5 ? 60 : 0), i % 2 ? 'wave' : 'stand', { seed: 70 + i, stroke: i === 5 ? RED : PENCIL })).join('')}
        ${Array.from({ length: 7 }, (_, i) => figure(200 + i * 200, 860, 120, 'stand', { seed: 90 + i, stroke: PENCIL, sw: 4 })).join('')}`,
    },
    {
      label: 'Quiet verse',
      note: 'One figure, one ground line, no props and no inversion. The quietest page.',
      draw: () => `
        ${sheet()}
        ${band(['WALK UNTIL MY BOOTS ARE FADED BLUE'], { accent: -1, height: 200 })}
        ${pen(wobble(0, 720, 1600, 722, 4, 91), { sw: 4 })}
        ${figure(800, 720, 250, 'stand', { seed: 93 })}`,
    },
  ],
}
