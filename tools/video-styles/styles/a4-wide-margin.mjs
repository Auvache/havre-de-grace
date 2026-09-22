import { block, t, rect, line, mark, fit } from '../kit.mjs'
import { motifAt } from '../../../shared/video/motifs.mjs'

const PAPER = '#f0ede5'
const INK = '#1b1b19'
const CLAY = '#b4553b'
const SEA = '#4a6670'

/*
 * The opposite bet from the current film: instead of filling the frame with
 * type, give almost all of it away.
 *
 * The lyric sets in a narrow measure at the left, at a size you read rather
 * than a size you are hit with. The right two-thirds is one continuous line
 * drawing of what the line is about, drawn large, in clay, at full strength —
 * this is the one style in the suite where the picture is the loud element and
 * the words are quiet. Variety comes from the drawing, which changes every
 * line, and from the measure sliding down the page as the verse goes on.
 */
const drawing = (name, x, y, size, colour = CLAY, opacity = 0.75, width = 2.6) =>
  motifAt(name, x, y, size, { stroke: colour, width, opacity })

const number = (n, y = 190) => t({ x: 80, y, size: 120, text: n, fill: CLAY, weight: 300, opacity: 0.35, upper: false })

export default {
  id: 'a4-wide-margin',
  family: 'A',
  name: 'Wide Margin',
  accent: CLAY,
  tagline: 'Swiss editorial. A narrow measure of quiet type at the left, one large line drawing at the right, and a great deal of paper left alone.',
  palette: [['Paper', PAPER], ['Ink', INK], ['Clay', CLAY], ['Sea', SEA]],

  hero: () => `
    ${rect(0, 0, 1600, 900, PAPER)}
    ${line(560, 0, 560, 900, INK, 1, { opacity: 0.16 })}
    ${number('07')}
    ${block(["I'D SIT AND", 'WATCH THE', 'SAILORS IN', 'THE COLD'], {
      x: 80, width: 400, top: 300, bodyCap: 92, landingCap: 92, leading: 1.14, fill: INK, accent: CLAY, through: 0.62,
    })}
    ${drawing('sailboat', 1090, 430, 620, CLAY, 0.85, 2.4)}
    ${drawing('snowflake', 1470, 760, 170, SEA, 0.5, 3)}`,

  thumbs: [
    {
      label: 'Title',
      note: 'The only centred frame in the style — and the only full-width rule.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${line(80, 300, 1520, 300, INK, 3)}
        ${t({ x: 80, y: 270, size: 26, text: 'Havre De Grace', fill: CLAY, weight: 600, tracking: 18 })}
        ${t({ x: 80, y: 470, size: 150, text: 'Andalusia', fill: INK, len: 1100 })}
        ${drawing('guitar', 1300, 640, 340, CLAY, 0.7, 2.6)}`,
    },
    {
      label: 'Verse',
      note: 'Measure slides down the page line by line; the drawing changes with the noun.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${line(560, 0, 560, 900, INK, 1, { opacity: 0.16 })}
        ${number('11', 560)}
        ${block(['BUT LIKE A', 'LOVER STRANDED', 'UNDERNEATH A', 'CHURCHYARD'], { x: 80, width: 400, top: 600, bodyCap: 78, landingCap: 78, leading: 1.14, fill: INK, accent: CLAY, through: 0.4 })}
        ${drawing('church', 1080, 420, 560, CLAY, 0.8, 2.6)}`,
    },
    {
      label: 'Chorus',
      note: 'Paper goes clay, drawing goes to paper colour, measure moves to the right.',
      draw: () => `
        ${rect(0, 0, 1600, 900, CLAY)}
        ${line(1040, 0, 1040, 900, PAPER, 1, { opacity: 0.3 })}
        ${drawing('crown', 500, 440, 620, PAPER, 0.75, 2.6)}
        ${block(['IF I WERE', 'KING FOR', 'JUST A DAY'], { x: 1120, width: 400, top: 320, bodyCap: 96, landingCap: 96, leading: 1.14, fill: PAPER, accent: INK, through: 0.55 })}`,
    },
    {
      label: 'Oh-ohs',
      note: 'No measure at all. Seventeen small clay marks walking across the paper.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${Array.from({ length: 10 }, (_, i) => `<circle cx="${210 + i * 132}" cy="${380 + Math.sin(i) * 26}" r="${i === 6 ? 26 : 13}" fill="${i === 6 ? CLAY : INK}" opacity="${i === 6 ? 1 : 0.35}"/>`).join('')}
        ${Array.from({ length: 7 }, (_, i) => `<circle cx="${280 + i * 178}" cy="${560 + Math.cos(i) * 20}" r="13" fill="${SEA}" opacity="0.4"/>`).join('')}
        ${drawing('birds', 1180, 700, 420, CLAY, 0.55, 2.6)}`,
    },
    {
      label: 'Quiet verse',
      note: 'Smallest type in the film, measure dead centre, no drawing at all.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${number('26', 330)}
        ${block(['WALK UNTIL MY', 'BOOTS ARE', 'FADED BLUE'], { x: 800, width: 380, top: 370, bodyCap: 70, landingCap: 70, leading: 1.2, fill: INK, accent: CLAY, through: 0.55, anchor: 'middle' })}`,
    },
  ],
}
