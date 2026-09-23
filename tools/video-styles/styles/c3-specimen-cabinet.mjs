import { t, rect, line, circle, sung, fit, advance, r } from '../kit.mjs'
import { motifAt } from '../../../shared/video/motifs.mjs'

const WOOD = '#2e2119'
const GRAIN = '#3a2a1f'
const CARD = '#ece3cf'
const INK = '#27231e'
const BRASS = '#b3903f'
const RED = '#b23a2a'

/*
 * The song as a collection. "Ebony, ivory, and bone", "the Earth out of water
 * and iron", "those treasures that aren't made of silver or gold": Into the Wild
 * is a list of found things, and a museum drawer is how a list of found things
 * is shown.
 *
 * A walnut specimen drawer, divided into card-bottomed compartments. Each noun
 * the song sings is a specimen drawn in ink on its card, with a brass label
 * holder under it, and the drawer fills as the verse goes on — nothing is ever
 * taken out. The lyric is the drawer's placard, set along the foot. The one
 * moving idea is light: the compartment being sung is lit and its label is
 * stamped red, so the eye walks the drawer in the order the song names things.
 *
 * The device that keeps it from being a grid for three and a half minutes is
 * that the choruses break the cabinet. "Running into the wild" is the
 * specimens getting out: the drawer is empty, the dividers are down, and the
 * back of it is open onto pines.
 */

const X0 = 60
const Y0 = 50
const GAP = 20
const COLS = 6
const CELL_W = (1480 - GAP * (COLS - 1)) / COLS
const CELL_H = 285

/** The wood, with a few long grain lines so it reads as a drawer rather than as a dark ground. */
const drawer = (seed = 1) => `
  ${rect(0, 0, 1600, 900, WOOD)}
  ${Array.from({ length: 14 }, (_, i) => {
    const y = 20 + i * 64 + (i * 37 * seed) % 23
    return `<path d="M0 ${y} C 400 ${y - 14} 900 ${y + 18} 1600 ${y - 6}" fill="none" stroke="${GRAIN}" stroke-width="3" opacity="0.8"/>`
  }).join('')}`

/** One compartment: a card floor, a shadowed lip, a specimen, and a brass label holder. */
function cell(col, row, name, label, o = {}) {
  const { lit = false, dim = false, crossed = false, span = 1 } = o
  const x = X0 + col * (CELL_W + GAP)
  const y = Y0 + row * (CELL_H + GAP)
  const w = CELL_W * span + GAP * (span - 1)
  const cx = x + w / 2
  const ink = dim ? 0.35 : 1
  const labelW = Math.min(w - 40, advance(label, 17, 3) + 36)
  return `
    ${rect(x, y, w, CELL_H, CARD)}
    ${rect(x, y, w, 10, '#000', { opacity: 0.22 })}
    ${rect(x, y, 8, CELL_H, '#000', { opacity: 0.12 })}
    ${lit ? `<ellipse cx="${r(cx)}" cy="${r(y + 125)}" rx="${r(w * 0.5)}" ry="150" fill="url(#lit)"/>` : ''}
    ${name ? motifAt(name, cx, y + 118, 150, { stroke: INK, width: 2.6, opacity: ink }) : ''}
    ${crossed ? line(cx - 80, y + 50, cx + 80, y + 190, RED, 5, { cap: 'round' }) + line(cx + 80, y + 50, cx - 80, y + 190, RED, 5, { cap: 'round' }) : ''}
    ${label ? `${rect(cx - labelW / 2, y + CELL_H - 62, labelW, 38, BRASS, { rx: 3 })}
    ${rect(cx - labelW / 2 + 6, y + CELL_H - 56, labelW - 12, 26, CARD, { rx: 2 })}
    ${t({ x: cx, y: y + CELL_H - 37, size: 17, text: label, fill: lit ? RED : INK, anchor: 'middle', weight: 600, tracking: 3, opacity: dim ? 0.5 : 1 })}` : ''}`
}

/** How far through `text` the voice is once its first `words` words are sung — on a word boundary. */
const upTo = (text, words) => {
  const all = text.split(' ')
  return Math.min(1, advance(all.slice(0, words).join(' ') + ' ') / advance(text))
}

/** The placard along the foot: the line being sung, stretched to the measure. */
function placard(text, through, o = {}) {
  const { y = 668, h = 182, fill = INK } = o
  const size = Math.min(92, fit(text, 1320, 92, 0.66))
  return `
    ${rect(X0, y, 1480, h, CARD)}
    ${rect(X0 + 14, y + 14, 1480 - 28, h - 28, 'none', { stroke: INK, sw: 1.2, opacity: 0.4 })}
    ${[[X0 + 30, y + 30], [X0 + 1450, y + 30], [X0 + 30, y + h - 30], [X0 + 1450, y + h - 30]].map(([cx, cy]) => circle(cx, cy, 7, { fill: BRASS })).join('')}
    ${sung({ x: 800, y: y + h / 2 + size * 0.36, size, text, len: Math.min(1320, advance(text, size)), fill, accent: RED, through, anchor: 'middle', weight: 700 })}`
}

export default {
  id: 'c3-specimen-cabinet',
  family: 'C',
  name: 'Specimen Cabinet',
  accent: RED,
  tagline: 'A walnut specimen drawer that fills as the song names things — every noun a specimen on its own card, lit when it is sung.',
  palette: [['Walnut', WOOD], ['Card', CARD], ['Ink', INK], ['Brass', BRASS], ['Stamp', RED]],

  defs: () => `<radialGradient id="lit"><stop offset="0" stop-color="#fff8e2" stop-opacity="1"/><stop offset="0.7" stop-color="#fff3d2" stop-opacity="0.55"/><stop offset="1" stop-color="#fff3d2" stop-opacity="0"/></radialGradient>`,

  hero: () => `
    ${drawer(1)}
    ${cell(0, 0, 'wave', 'Water')}
    ${cell(1, 0, 'globe', 'Iron')}
    ${cell(2, 0, 'stone', 'Ebony', { dim: false })}
    ${cell(3, 0, 'gem', 'Ivory')}
    ${cell(4, 0, 'bone', 'Bone', { lit: true, span: 2 })}
    ${cell(0, 1, 'compass', 'Adventure')}
    ${cell(1, 1, 'sun', 'The gods')}
    ${cell(2, 1, null, '')}
    ${cell(3, 1, null, '')}
    ${cell(4, 1, null, '')}
    ${cell(5, 1, null, '')}
    ${placard('Ebony, ivory, and bone', upTo('Ebony, ivory, and bone', 3))}`,

  thumbs: [
    {
      label: 'Title',
      note: 'An empty drawer and its engraved brass nameplate. The band name leaves with it.',
      draw: () => `
        ${drawer(2)}
        ${Array.from({ length: 12 }, (_, i) => cell(i % 6, Math.floor(i / 6), null, '')).join('')}
        ${rect(420, 330, 760, 240, BRASS, { rx: 8 })}
        ${rect(440, 350, 720, 200, 'none', { stroke: WOOD, sw: 3, opacity: 0.6 })}
        ${t({ x: 800, y: 470, size: 74, text: 'Into the Wild', fill: WOOD, anchor: 'middle', weight: 700 })}
        ${t({ x: 800, y: 525, size: 26, text: 'Havre De Grace', fill: WOOD, anchor: 'middle', weight: 600, tracking: 12 })}`,
    },
    {
      label: 'Verse',
      note: 'The drawer fills a card at a time. Only the specimen being sung is lit.',
      draw: () => `
        ${drawer(3)}
        ${cell(0, 0, 'compass', 'Adventure')}
        ${cell(1, 0, 'compass', 'Lost way', { dim: true })}
        ${cell(2, 0, 'gem', 'Splendour')}
        ${cell(3, 0, 'sun', 'The gods', { lit: true })}
        ${cell(4, 0, null, '')}
        ${cell(5, 0, null, '')}
        ${Array.from({ length: 6 }, (_, i) => cell(i, 1, null, '')).join('')}
        ${placard('The gods hid about when they made', upTo('The gods hid about when they made', 2))}`,
    },
    {
      label: 'Chorus',
      note: 'The dividers are down and the back of the drawer is open. The specimens got out.',
      draw: () => `
        ${drawer(4)}
        ${rect(X0, Y0, 1480, 590, '#dfe3cf')}
        ${Array.from({ length: 9 }, (_, i) => motifAt('pine', 150 + i * 165, 460 - (i % 3) * 40, 260 + (i % 2) * 70, { stroke: INK, width: 2.4, opacity: 0.8 })).join('')}
        ${motifAt('runner', 1100, 470, 230, { stroke: RED, width: 3.2 })}
        ${line(X0, 600, X0 + 1480, 600, INK, 3)}
        ${placard('So I\'m running into the wild', upTo('So I\'m running into the wild', 3))}`,
    },
    {
      label: 'Horns',
      note: 'No placard. The drawer becomes an instrument case; the lid label is the only type.',
      draw: () => `
        ${drawer(5)}
        ${rect(X0, Y0, 1480, 800, '#4a1f1c')}
        ${rect(X0 + 30, Y0 + 30, 1420, 740, '#6b2a25')}
        ${motifAt('guitar', 520, 450, 560, { stroke: CARD, width: 1.8, opacity: 0.9, rotate: -30 })}
        ${motifAt('microphone', 1110, 440, 420, { stroke: BRASS, width: 2.2, opacity: 0.95, rotate: 18 })}
        ${rect(640, 780, 320, 44, BRASS, { rx: 3 })}`,
    },
    {
      label: 'Verse 3',
      note: 'Glaciers, gardens, grottos: three cards lit on their own three words. Gold is crossed out.',
      draw: () => `
        ${drawer(6)}
        ${cell(0, 0, 'compass', 'Adventure', { dim: true })}
        ${cell(1, 0, 'gem', 'Treasures', { dim: true })}
        ${cell(2, 0, 'crown', 'Silver, gold', { crossed: true })}
        ${cell(3, 0, 'glacier', 'Glaciers')}
        ${cell(4, 0, 'flower', 'Gardens')}
        ${cell(5, 0, 'cave', 'Grottos', { lit: true })}
        ${Array.from({ length: 6 }, (_, i) => cell(i, 1, null, '')).join('')}
        ${placard('I mean glaciers and gardens and grottos', 1)}`,
    },
  ],
}
