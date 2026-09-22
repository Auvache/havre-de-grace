import { block, t, rect, line, mark, r } from '../kit.mjs'
import { motifAt } from '../../../shared/video/motifs.mjs'

const INK = '#0d0d0c'
const BONE = '#f2ede3'
const RED = '#d8382b'

/* The faint column grid the current film already draws, kept because it is the
 * one piece of the old chrome that is composition rather than instrumentation. */
const grid = (fg, o = 0.1) =>
  Array.from({ length: 13 }, (_, i) => line(80 + i * 120, 0, 80 + i * 120, 900, fg, 1, { opacity: o })).join('')

/** The ghost: one drawing, enormous, at a few per cent, bled off the frame. */
const ghost = (name, x, y, size, fg, opacity = 0.075, width = 2.4, rotate = 0) =>
  motifAt(name, x, y, size, { stroke: fg, width, opacity, rotate })

export default {
  id: 'a1-ghost-plate',
  family: 'A',
  name: 'Ghost Plate',
  accent: RED,
  tagline: 'The film as it stands, with the slate stripped off and a drawing of what the line is about held behind the type at seven per cent.',
  palette: [['Ink', INK], ['Bone', BONE], ['Red', RED]],

  hero: () => `
    ${rect(0, 0, 1600, 900, INK)}
    ${grid(BONE)}
    ${ghost('boot', 1310, 390, 430, BONE, 0.17, 3.2, -7)}
    ${ghost('boot', 1150, 470, 300, BONE, 0.085, 3.6, 5)}
    ${block(['WALK UNTIL MY', 'BOOTS ARE', 'BREAKING THROUGH'], {
      x: 80, width: 1020, top: 185, bodyCap: 210, landingCap: 300, fill: BONE, accent: RED, through: 0.58,
    })}
    ${line(0, 790, 1600, 790, BONE, 2, { opacity: 0.16 })}
    ${[[240, 150], [440, 122], [600, 100], [726, 82], [828, 66]]
      .map(([x, size], i) => ghost('walker', x, 790 - size * 0.38, size, BONE, 0.22 - i * 0.03, 4)).join('')}`,

  thumbs: [
    {
      label: 'Title',
      note: 'Mark, then title, over a ghost of the guitar the intro is.',
      draw: () => `
        ${rect(0, 0, 1600, 900, INK)}${grid(BONE)}
        ${ghost('guitar', 800, 470, 900, BONE, 0.07, 2.4)}
        ${t({ x: 800, y: 300, size: 40, text: 'Havre De Grace', fill: BONE, anchor: 'middle', weight: 500, tracking: 26 })}
        ${t({ x: 80, y: 560, size: 230, text: 'Andalusia', fill: BONE, len: 1440 })}`,
    },
    {
      label: 'Verse',
      note: 'Type left, ghost right. The motif changes on every line.',
      draw: () => `
        ${rect(0, 0, 1600, 900, INK)}${grid(BONE)}
        ${ghost('church', 1330, 450, 460, BONE, 0.18, 3)}
        ${block(['BUT LIKE A LOVER', 'STRANDED', 'UNDERNEATH A', 'CHURCHYARD'], { x: 80, width: 1020, top: 175, bodyCap: 180, landingCap: 210, fill: BONE, accent: RED, through: 0.33 })}`,
    },
    {
      label: 'Chorus',
      note: 'Field flips to red, ghost goes bone, motif fills the frame.',
      draw: () => `
        ${rect(0, 0, 1600, 900, RED)}
        ${ghost('crown', 800, 430, 1100, BONE, 0.14, 2.2)}
        ${block(['IF I WERE KING', 'FOR JUST A DAY'], { top: 240, bodyCap: 210, landingCap: 300, fill: BONE, accent: INK, through: 0.6 })}`,
    },
    {
      label: 'Oh-ohs',
      note: 'No lyric to set, so the ghost is the whole frame and the OHs count.',
      draw: () => `
        ${rect(0, 0, 1600, 900, INK)}
        ${ghost('birds', 800, 400, 1300, BONE, 0.1, 2)}
        ${[0, 1, 2].map((i) => `<circle cx="800" cy="450" r="${190 + i * 150}" fill="none" stroke="${BONE}" stroke-width="${3 - i * 0.6}" opacity="${0.34 - i * 0.09}"/>`).join('')}
        ${Array.from({ length: 10 }, (_, i) => t({ x: 210 + i * 132, y: 380, size: 66, text: 'Oh', fill: i === 4 ? RED : BONE, anchor: 'middle', opacity: i === 4 ? 1 : 0.42 })).join('')}
        ${Array.from({ length: 7 }, (_, i) => t({ x: 236 + i * 188, y: 660, size: 92, text: 'Oh', fill: BONE, anchor: 'middle', opacity: 0.3 })).join('')}`,
    },
    {
      label: 'Quiet verse',
      note: 'Arrangement drops away and the type drops with it. Light weight, centred, air.',
      draw: () => `
        ${rect(0, 0, 1600, 900, '#07070a')}
        ${ghost('boot', 800, 470, 300, BONE, 0.06, 2.2)}
        ${block(['WALK UNTIL MY BOOTS', 'ARE FADED BLUE'], { x: 800, width: 860, top: 350, bodyCap: 86, landingCap: 100, fill: BONE, accent: RED, through: 0.5, anchor: 'middle', weight: 400 })}`,
    },
  ],
}
