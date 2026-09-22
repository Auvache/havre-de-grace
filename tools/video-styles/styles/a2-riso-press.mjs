import { block, t, rect, line, mark, grainDef, fit } from '../kit.mjs'
import { motifAt } from '../../../shared/video/motifs.mjs'

const PAPER = '#efe7d6'
const INK = '#1a1a18'
const RED = '#e2402f'
const BLUE = '#2f4d8c'

/*
 * Two inks on paper, and the plates never quite line up.
 *
 * The misregistration is the whole idea and it is also the variety mechanism:
 * the offset between the two plates is a vector that moves through the song —
 * tight in the verses, a full six pixels apart by the last chorus — so twenty
 * consecutive lines of the same layout still do not look like each other.
 */
const offset = (dx, dy, body) => `<g transform="translate(${dx} ${dy})">${body}</g>`

const stamp = (name, x, y, size, colour, opacity = 0.2, width = 5) =>
  motifAt(name, x, y, size, { stroke: colour, width, opacity })

export default {
  id: 'a2-riso-press',
  family: 'A',
  name: 'Riso Press',
  accent: RED,
  tagline: 'Two inks on uncoated paper with the plates a few pixels out of register. Grain everywhere, stamped motifs, one poster per line.',
  palette: [['Paper', PAPER], ['Ink', INK], ['Red', RED], ['Blue', BLUE]],

  defs: () => grainDef('riso-grain', { freq: 1.4, octaves: 4, opacity: 0.4, seed: 7 }),

  hero: () => `
    ${rect(0, 0, 1600, 900, PAPER)}
    ${stamp('globe', 1240, 330, 520, BLUE, 0.22, 4)}
    ${stamp('plane', 1340, 690, 250, RED, 0.3, 5)}
    ${line(80, 120, 1520, 120, INK, 6)}
    ${line(80, 176, 1520, 176, INK, 2)}
    ${offset(7, 5, `<g opacity="0.85">${block(['BANGKOK,', 'BUDAPEST,', 'OR BATON ROUGE'], { x: 80, width: 1200, top: 250, bodyCap: 180, landingCap: 178, fill: RED })}</g>`)}
    ${block(['BANGKOK,', 'BUDAPEST,', 'OR BATON ROUGE'], { x: 80, width: 1200, top: 250, bodyCap: 180, landingCap: 178, fill: INK })}
    ${line(80, 820, 1520, 820, INK, 6)}
    ${t({ x: 1520, y: 800, size: 30, text: '03', fill: INK, weight: 600, anchor: 'end', tracking: 4 })}
    ${rect(0, 0, 1600, 900, INK, { opacity: 1 }).replace('/>', ` filter="url(#riso-grain)"/>`)}`,

  thumbs: [
    {
      label: 'Title',
      note: 'Both plates land square once, on the title, and never again.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${stamp('guitar', 800, 470, 620, BLUE, 0.16, 4)}
        ${line(80, 150, 1520, 150, INK, 6)}
        ${t({ x: 800, y: 300, size: 36, text: 'Havre De Grace', fill: INK, anchor: 'middle', weight: 600, tracking: 22 })}
        ${offset(6, 4, t({ x: 800, y: 520, size: 210, text: 'Andalusia', fill: RED, anchor: 'middle', len: 1200 }))}
        ${t({ x: 800, y: 520, size: 210, text: 'Andalusia', fill: INK, anchor: 'middle', len: 1200 })}
        ${line(80, 760, 1520, 760, INK, 6)}
        ${rect(0, 0, 1600, 900, INK).replace('/>', ` filter="url(#riso-grain)"/>`)}`,
    },
    {
      label: 'Verse',
      note: 'Poster layout rotates every line — eight in the set, none repeats inside a verse.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${stamp('sailboat', 1180, 480, 560, BLUE, 0.3, 4)}
        ${t({ x: 80, y: 190, size: 26, text: "I'd sit and watch", fill: RED, weight: 600, tracking: 10 })}
        ${offset(5, 4, block(['THE SAILORS', 'IN THE COLD'], { x: 80, width: 900, top: 250, bodyCap: 200, landingCap: 260, fill: RED }))}
        ${block(['THE SAILORS', 'IN THE COLD'], { x: 80, width: 900, top: 250, bodyCap: 200, landingCap: 260, fill: INK })}
        ${line(80, 790, 980, 790, INK, 5)}
        ${rect(0, 0, 1600, 900, INK).replace('/>', ` filter="url(#riso-grain)"/>`)}`,
    },
    {
      label: 'Chorus',
      note: 'Red floods the sheet and the type is knocked out of it.',
      draw: () => `
        ${rect(0, 0, 1600, 900, RED)}
        ${stamp('crown', 800, 450, 760, PAPER, 0.3, 5)}
        ${offset(8, 6, block(['IF I WERE KING', 'FOR JUST A DAY'], { x: 80, width: 1440, top: 250, bodyCap: 200, landingCap: 280, fill: INK }))}
        ${block(['IF I WERE KING', 'FOR JUST A DAY'], { x: 80, width: 1440, top: 250, bodyCap: 200, landingCap: 280, fill: PAPER })}
        ${rect(0, 0, 1600, 900, INK).replace('/>', ` filter="url(#riso-grain)"/>`)}`,
    },
    {
      label: 'Oh-ohs',
      note: 'No words to print, so the plate prints dots — one per oh, red on blue.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${Array.from({ length: 10 }, (_, i) => `<circle cx="${190 + i * 136}" cy="330" r="${i === 4 ? 56 : 44}" fill="${i === 4 ? RED : BLUE}" opacity="${i === 4 ? 1 : 0.5}"/>`).join('')}
        ${Array.from({ length: 7 }, (_, i) => `<circle cx="${240 + i * 186}" cy="630" r="62" fill="${RED}" opacity="0.32"/>`).join('')}
        ${t({ x: 800, y: 480, size: 42, text: 'Oh oh oh', fill: INK, anchor: 'middle', weight: 600, tracking: 18 })}
        ${rect(0, 0, 1600, 900, INK).replace('/>', ` filter="url(#riso-grain)"/>`)}`,
    },
    {
      label: 'Quiet verse',
      note: 'The press has been cleaned. One ink, no offset, wide margins, small type.',
      draw: () => `
        ${rect(0, 0, 1600, 900, PAPER)}
        ${line(400, 300, 1200, 300, INK, 3)}
        ${t({ x: 800, y: 430, size: 74, text: 'Walk until my boots', fill: INK, anchor: 'middle', weight: 600 })}
        ${t({ x: 800, y: 520, size: 74, text: 'are faded blue', fill: INK, anchor: 'middle', weight: 600 })}
        ${line(400, 600, 1200, 600, INK, 3)}
        ${t({ x: 1520, y: 800, size: 30, text: '24', fill: INK, weight: 600, anchor: 'end', tracking: 4 })}
        ${rect(0, 0, 1600, 900, INK).replace('/>', ` filter="url(#riso-grain)"/>`)}`,
    },
  ],
}
