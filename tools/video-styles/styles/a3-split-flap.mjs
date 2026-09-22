import { t, rect, line, mark, r } from '../kit.mjs'

const BOARD = '#121210'
const CELL = '#1d1d1a'
const AMBER = '#f0b429'
const BONE = '#ece7dc'
const RED = '#d8382b'

/*
 * The departure board, which the current film already does once — in the verse
 * of place names — extended to the whole song.
 *
 * It answers the repetition problem structurally rather than by decoration: a
 * board is never still. Between two sung words the cells that are changing are
 * mid-flip, so any two frames three hundred milliseconds apart are visibly
 * different frames even when they hold the same words.
 */
const CW = 62
const CH = 86
const GAP = 6

/** One row of flap cells. `flipping` is the set of column indexes mid-flip. */
function flaps(text, o = {}) {
  const { x = 80, y = 200, fill = AMBER, flipping = [], lit = null, size = 58 } = o
  const chars = [...String(text).toUpperCase()]
  return chars.map((ch, i) => {
    const cx = x + i * (CW + GAP)
    const isFlipping = flipping.includes(i)
    const colour = lit && lit.includes(i) ? RED : fill
    return `
      ${rect(cx, y, CW, CH, CELL, { rx: 3 })}
      ${ch.trim() ? t({ x: cx + CW / 2, y: y + CH * 0.72, size, text: ch, fill: colour, anchor: 'middle', weight: 600 }) : ''}
      ${isFlipping ? `${rect(cx, y, CW, CH / 2, BOARD, { opacity: 0.82 })}${rect(cx, y + CH / 2 - 2, CW, 4, AMBER, { opacity: 0.5 })}` : ''}
      ${line(cx, y + CH / 2, cx + CW, y + CH / 2, BOARD, 2.5)}`
  }).join('')
}

/** A motif built out of lit cells, because the board can only draw in cells. */
const CROWN = ['1...1...1', '1.1.1.1.1', '111111111', '111111111', '.1111111.']
const BOOT = ['1111....', '1111....', '1111....', '11111111', '11111111']

function bitmap(rows, o = {}) {
  const { x = 0, y = 0, cell = 44, gap = 5, on = AMBER, off = null, onOpacity = 0.9 } = o
  return rows.flatMap((row, ry) => [...row].map((bit, rx) => {
    if (bit !== '1' && !off) return ''
    return rect(x + rx * (cell + gap), y + ry * (cell + gap), cell, cell,
      bit === '1' ? on : off, { rx: 2, opacity: bit === '1' ? onOpacity : 0.4 })
  })).join('')
}

export default {
  id: 'a3-split-flap',
  family: 'A',
  name: 'Split Flap',
  accent: AMBER,
  tagline: 'The whole song on a departure board. Every word arrives by flipping, so no two frames a third of a second apart look the same.',
  palette: [['Board', BOARD], ['Cell', CELL], ['Amber', AMBER], ['Bone', BONE], ['Red', RED]],

  hero: () => `
    ${rect(0, 0, 1600, 900, BOARD)}
    ${rect(0, 0, 1600, 110, '#0a0a09')}
    ${t({ x: 80, y: 68, size: 26, text: 'Departures', fill: AMBER, weight: 600, tracking: 14 })}
    ${flaps("IT DOESN'T MATTER", { x: 80, y: 170, flipping: [4, 9, 14] })}
    ${flaps('WHERE I GO, IN THE', { x: 80, y: 290, flipping: [2, 11] })}
    ${flaps('SUN OR IN THE SNOW', { x: 80, y: 410, flipping: [0, 1, 2, 16, 17], lit: [0, 1, 2] })}
    ${bitmap(CROWN, { x: 616, y: 560, cell: 40, gap: 6, on: AMBER, onOpacity: 0.34 })}
    ${line(0, 828, 1600, 828, CELL, 3)}`,

  thumbs: [
    {
      label: 'Title',
      note: 'The board spins up out of nothing and settles on the title.',
      draw: () => `
        ${rect(0, 0, 1600, 900, BOARD)}
        ${flaps('ANDALUSIA', { x: 380, y: 300, size: 62 })}
        ${flaps('HAVRE DE GRACE', { x: 80, y: 470, size: 40, fill: BONE, flipping: [3, 8, 12] })}
`,
    },
    {
      label: 'Verse',
      note: 'Three rows, cells flipping wherever the next word differs from this one.',
      draw: () => `
        ${rect(0, 0, 1600, 900, BOARD)}
        ${flaps('WALK UNTIL MY', { x: 80, y: 220, flipping: [5, 6] })}
        ${flaps('BOOTS ARE', { x: 80, y: 360, flipping: [1, 7] })}
        ${flaps('BREAKING THROUGH', { x: 80, y: 500, lit: [0, 1, 2, 3, 4, 5, 6, 7], flipping: [12, 13] })}
        ${bitmap(BOOT, { x: 1160, y: 630, cell: 46, gap: 6, on: BONE, onOpacity: 0.3 })}`,
    },
    {
      label: 'Chorus',
      note: 'Board goes amber-on-red and the crown is drawn in lit cells.',
      draw: () => `
        ${rect(0, 0, 1600, 900, RED)}
        ${flaps('IF I WERE KING', { x: 80, y: 230, fill: BONE })}
        ${flaps('FOR JUST A DAY', { x: 80, y: 370, fill: AMBER, flipping: [3, 4, 10] })}
        ${bitmap(CROWN, { x: 548, y: 560, cell: 56, gap: 7, on: AMBER, onOpacity: 0.9 })}`,
    },
    {
      label: 'Oh-ohs',
      note: 'Every cell on the board flips at once, seventeen times.',
      draw: () => `
        ${rect(0, 0, 1600, 900, BOARD)}
        ${Array.from({ length: 6 }, (_, row) => Array.from({ length: 22 }, (_, col) => {
          const on = (row * 7 + col * 3) % 5 === 0
          return rect(60 + col * 68, 180 + row * 92, 62, 86, on ? AMBER : CELL, { rx: 3, opacity: on ? 0.9 : 0.6 })
        }).join('')).join('')}
        ${Array.from({ length: 6 }, (_, row) => Array.from({ length: 22 }, (_, col) =>
          line(60 + col * 68, 223 + row * 92, 122 + col * 68, 223 + row * 92, BOARD, 2.5)).join('')).join('')}`,
    },
    {
      label: 'Quiet verse',
      note: 'One row lit, dead centre. Every other cell on the board is dark.',
      draw: () => `
        ${rect(0, 0, 1600, 900, BOARD)}
        ${Array.from({ length: 6 }, (_, row) => Array.from({ length: 22 }, (_, col) =>
          rect(60 + col * 68, 120 + row * 120, 62, 86, CELL, { rx: 3, opacity: 0.35 })).join('')).join('')}
        ${flaps('ARE FADED BLUE', { x: 372, y: 360, fill: BONE, flipping: [9] })}`,
    },
  ],
}
