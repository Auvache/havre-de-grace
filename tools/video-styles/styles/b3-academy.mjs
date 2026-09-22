import { t, rect, line, path, circle, mark, grainDef, rng, r } from '../kit.mjs'
import { motifAt } from '../../../shared/video/motifs.mjs'

const STOCK = '#cfc6b2'
const EMULSION = '#1a1712'
const SILVER = '#e7e1d2'
const AMBER = '#c08a3e'

/*
 * A print of the song, running through a projector that has seen better days.
 *
 * Sprocket holes down both edges, the optical sound track as a live waveform on
 * the right, frame counts, reel changeover dots, a countdown leader at the top
 * and a scratch that has been on the print since 1961. The lyric is set as
 * academy subtitles — burned in, bottom third, one line at a time — which is
 * the only style in the suite where the words are small on purpose all the way
 * through.
 *
 * Variety comes from wear rather than layout: the density of the dust, the
 * depth of the scratches and the gate weave all ride the arrangement, so the
 * quiet fourth verse is a clean print and the last chorus is falling apart.
 */
const sprockets = (opacity = 1) => Array.from({ length: 9 }, (_, i) => `
  ${rect(30, 26 + i * 100, 46, 58, STOCK, { rx: 8, opacity })}
  ${rect(1524, 26 + i * 100, 46, 58, STOCK, { rx: 8, opacity })}`).join('')

const gate = () => `
  ${rect(0, 0, 1600, 900, EMULSION)}
  ${rect(0, 0, 106, 900, '#26221b')}
  ${rect(1494, 0, 106, 900, '#26221b')}
  ${sprockets()}`

/** The optical track: the song's own envelope, printed down the edge. */
const optical = (seed) => {
  const rand = rng(seed)
  const pts = Array.from({ length: 60 }, (_, i) => {
    const a = 6 + rand() * 40
    return `${r(1440 - a)} ${r(i * 15)} L${r(1440 + a)} ${r(i * 15)}`
  })
  return `<g opacity="0.75">${pts.map((p) => path(`M${p}`, { stroke: SILVER, sw: 8, opacity: 0.5 })).join('')}
    ${line(1440, 0, 1440, 900, SILVER, 1.5, { opacity: 0.4 })}</g>`
}

const dust = (seed, density = 40) => {
  const rand = rng(seed)
  return Array.from({ length: density }, () => {
    const x = 120 + rand() * 1350
    const y = rand() * 900
    return rand() > 0.6
      ? line(x, y, x + 1, y + 6 + rand() * 40, SILVER, 1 + rand() * 1.6, { opacity: 0.1 + rand() * 0.3 })
      : circle(x, y, 1 + rand() * 2.4, { fill: SILVER, opacity: 0.12 + rand() * 0.3 })
  }).join('')
}

const scratch = (x, opacity = 0.3) => line(x, 0, x + 12, 900, SILVER, 2, { opacity })

const subtitle = (rows, o = {}) => rows.map((row, i) => t({
  x: 800, y: 700 + i * 62, size: 50, text: row, fill: i === (o.hot ?? -1) ? AMBER : SILVER,
  anchor: 'middle', weight: 500, tracking: 2,
})).join('')

export default {
  id: 'b3-academy',
  family: 'B',
  name: 'Academy',
  accent: AMBER,
  tagline: 'A print of the song running through a tired projector. Sprockets, optical track, changeover dots, and the lyric burned in as subtitles.',
  palette: [['Emulsion', EMULSION], ['Stock', STOCK], ['Silver', SILVER], ['Amber', AMBER]],

  defs: () => grainDef('acad-grain', { freq: 2.2, octaves: 5, opacity: 0.5, seed: 12 }),

  hero: () => `
    ${gate()}
    ${motifAt('church', 720, 350, 480, { stroke: SILVER, width: 2.6, opacity: 0.4 })}
    ${optical(5)}
    ${dust(9, 55)}
    ${scratch(430, 0.28)}${scratch(980, 0.16)}
    ${circle(1350, 120, 34, { stroke: SILVER, sw: 5, opacity: 0.8 })}
    ${line(160, 780, 1320, 780, SILVER, 1, { opacity: 0.18 })}
    ${subtitle(['BUT LIKE A LOVER STRANDED', 'UNDERNEATH A CHURCHYARD'], { hot: 1 })}
    ${t({ x: 160, y: 120, size: 26, text: 'Reel 1', fill: SILVER, weight: 500, tracking: 8, opacity: 0.55 })}
    ${t({ x: 160, y: 860, size: 24, text: '0418', fill: AMBER, weight: 500, tracking: 6, opacity: 0.7 })}
    ${rect(0, 0, 1600, 900, SILVER).replace('/>', ' filter="url(#acad-grain)"/>')}`,

  thumbs: [
    {
      label: 'Title',
      note: 'Academy leader. The countdown is the count-in and lands on the downbeat.',
      draw: () => `
        ${gate()}
        ${circle(800, 450, 330, { stroke: SILVER, sw: 4, opacity: 0.6 })}
        ${circle(800, 450, 250, { stroke: SILVER, sw: 2, opacity: 0.4 })}
        ${line(800, 120, 800, 780, SILVER, 2, { opacity: 0.35 })}
        ${line(170, 450, 1430, 450, SILVER, 2, { opacity: 0.35 })}
        ${path('M800 450 L800 140 A310 310 0 0 1 1076 620 Z', { fill: SILVER, opacity: 0.12 })}
        ${t({ x: 800, y: 530, size: 300, text: '3', fill: SILVER, anchor: 'middle', weight: 600 })}
        ${dust(3, 40)}
        ${rect(0, 0, 1600, 900, SILVER).replace('/>', ' filter="url(#acad-grain)"/>')}`,
    },
    {
      label: 'Verse',
      note: 'Clean print. Subtitle one line at a time, motif ghosted in the gate.',
      draw: () => `
        ${gate()}
        ${motifAt('boot', 800, 380, 400, { stroke: SILVER, width: 2.6, opacity: 0.35 })}
        ${optical(21)}${dust(23, 28)}
        ${subtitle(['WALK UNTIL MY BOOTS', 'ARE BREAKING THROUGH'], { hot: 1 })}
        ${rect(0, 0, 1600, 900, SILVER).replace('/>', ' filter="url(#acad-grain)"/>')}`,
    },
    {
      label: 'Chorus',
      note: 'The print degrades. Heavy scratches, gate weave, the frame line showing.',
      draw: () => `
        ${gate()}
        ${rect(106, -40, 1388, 46, '#3a342a')}
        ${motifAt('crown', 800, 360, 460, { stroke: AMBER, width: 3, opacity: 0.55 })}
        ${optical(31)}${dust(33, 90)}
        ${[260, 420, 700, 1100, 1220].map((x, i) => scratch(x, 0.2 + i * 0.07)).join('')}
        ${subtitle(['IF I WERE KING FOR JUST A DAY', 'AND I ALWAYS GOT MY WAY'], { hot: 0 })}
        ${rect(0, 0, 1600, 900, SILVER).replace('/>', ' filter="url(#acad-grain)"/>')}`,
    },
    {
      label: 'Oh-ohs',
      note: 'Changeover dots. Seventeen of them, top right, one per oh.',
      draw: () => `
        ${gate()}
        ${optical(41)}${dust(43, 50)}
        ${Array.from({ length: 10 }, (_, i) => circle(260 + i * 120, 330, i === 6 ? 44 : 28, { stroke: SILVER, sw: 5, opacity: i === 6 ? 1 : 0.4, fill: i === 6 ? AMBER : 'none' })).join('')}
        ${Array.from({ length: 7 }, (_, i) => circle(340 + i * 160, 560, 26, { stroke: SILVER, sw: 4, opacity: 0.3 })).join('')}
        ${rect(0, 0, 1600, 900, SILVER).replace('/>', ' filter="url(#acad-grain)"/>')}`,
    },
    {
      label: 'Quiet verse',
      note: 'The cleanest frame in the film. No dust, no scratches, no gate weave.',
      draw: () => `
        ${gate()}
        ${motifAt('boot', 800, 380, 340, { stroke: SILVER, width: 2.2, opacity: 0.22 })}
        ${optical(71)}
        ${subtitle(['WALK UNTIL MY BOOTS ARE FADED BLUE'], { hot: 0 })}
        ${rect(0, 0, 1600, 900, SILVER).replace('/>', ' filter="url(#acad-grain)"/>')}`,
    },
  ],
}
