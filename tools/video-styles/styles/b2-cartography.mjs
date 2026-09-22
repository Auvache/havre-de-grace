import { t, rect, line, path, circle } from '../kit.mjs'
import { motifAt } from '../../../shared/video/motifs.mjs'
import {
  CHART, SEA, INK, ROUTE, NEAT,
  graticule, contours, soundings, portMark as port,
} from '../../../shared/video/films/cartography.mjs'

/*
 * An admiralty chart with the song drawn on it as a passage plan.
 *
 * Contours, a graticule, a compass rose, soundings — and one red rhumb line
 * that grows across the map as the record plays, from Andalusia to Stockholm to
 * San Diego and on through Bangkok and Budapest and Baton Rouge. The lyric is
 * set along the route itself with textPath, so the words are literally the road
 * and the line arriving at a port is the same event as the place being sung.
 *
 * The device that keeps it from going flat is scale: the chart zooms between
 * sections, so a verse is a coastline and a chorus is the whole ocean.
 *
 * THE FURNITURE IS NOT DEFINED HERE ANY MORE
 *
 * Graticule, contours, soundings and the port mark come from the film that
 * actually runs this style — shared/video/films/cartography.mjs. This sheet is
 * the still that decisions are made against, and a still that disagrees with the
 * film about what a sounding looks like is worse than no still at all. What is
 * left below is what a sheet is for: five moments, arranged.
 */

export default {
  id: 'b2-cartography',
  family: 'B',
  name: 'Cartography',
  accent: ROUTE,
  tagline: 'An admiralty chart with the song plotted on it. The lyric is set along the route, so the words are the road and the road is still being drawn.',
  palette: [['Chart', CHART], ['Sea', SEA], ['Ink', INK], ['Route', ROUTE], ['Neatline', NEAT]],

  defs: () => `
    <path id="chart-route" d="M170 690 C420 560 520 300 760 330 C980 358 1010 560 1250 520 C1400 494 1450 400 1540 350" fill="none"/>
    <path id="chart-route-b" d="M120 500 C380 380 620 620 900 470 C1140 342 1300 470 1520 400" fill="none"/>`,

  hero: () => `
    ${rect(0, 0, 1600, 900, CHART)}
    ${graticule()}
    ${contours(430, 610, 120, 5, 3)}
    ${contours(1180, 380, 100, 4, 19)}
    ${soundings(7)}
    ${rect(40, 40, 1520, 820, 'none', { stroke: INK, sw: 4 })}
    ${rect(56, 56, 1488, 788, 'none', { stroke: INK, sw: 1.5 })}
    ${motifAt('compass', 1340, 720, 210, { stroke: INK, width: 1.8, opacity: 0.55 })}
    <use href="#chart-route" stroke="${ROUTE}" stroke-width="5" stroke-dasharray="1400" stroke-dashoffset="420" fill="none" opacity="0.9"/>
    <text font-size="40" font-weight="600" fill="${INK}" letter-spacing="4"><textPath href="#chart-route" startOffset="1%">I'D TRAVEL ROUND THE WORLD FOR THE REST OF MY DAYS</textPath></text>
    ${port(170, 690, 'ANDALUSIA')}
    ${port(760, 330, 'STOCKHOLM', { active: true })}
    ${port(1250, 520, 'SAN DIEGO')}
    ${t({ x: 90, y: 130, size: 26, text: 'Chart 2 · 53', fill: INK, weight: 600, tracking: 8 })}
`,

  thumbs: [
    {
      label: 'Title',
      note: 'The whole chart, no route on it yet. Title set in the cartouche.',
      draw: () => `
        ${rect(0, 0, 1600, 900, CHART)}${graticule()}${soundings(11)}
        ${contours(1200, 620, 130, 5, 23)}
        ${rect(40, 40, 1520, 820, 'none', { stroke: INK, sw: 4 })}
        ${rect(280, 280, 1040, 340, CHART, { stroke: INK, sw: 3 })}
        ${t({ x: 800, y: 430, size: 130, text: 'Andalusia', fill: INK, anchor: 'middle', weight: 600 })}
        ${t({ x: 800, y: 510, size: 28, text: 'Havre De Grace', fill: ROUTE, anchor: 'middle', weight: 600, tracking: 14 })}
        ${motifAt('compass', 1340, 720, 190, { stroke: INK, width: 1.8, opacity: 0.5 })}`,
    },
    {
      label: 'Verse',
      note: 'Zoomed to a coastline. Route grows a word at a time along the shore.',
      draw: () => `
        ${rect(0, 0, 1600, 900, SEA)}${graticule()}
        ${path('M0 640 C260 600 420 700 700 660 C980 620 1200 720 1600 680 L1600 900 L0 900 Z', { fill: CHART, stroke: INK, sw: 4 })}
        ${soundings(29)}
        <use href="#chart-route-b" stroke="${ROUTE}" stroke-width="5" fill="none" stroke-dasharray="1500" stroke-dashoffset="700"/>
        <text font-size="52" font-weight="600" fill="${INK}" letter-spacing="6"><textPath href="#chart-route-b" startOffset="2%">I'D SIT AND WATCH THE SAILORS IN THE COLD</textPath></text>
        ${port(900, 470, 'STOCKHOLM', { active: true })}
        ${motifAt('sailboat', 380, 760, 170, { stroke: INK, width: 2.4, opacity: 0.6 })}`,
    },
    {
      label: 'Chorus',
      note: 'Pulls all the way out. The route so far is one small red thread.',
      draw: () => `
        ${rect(0, 0, 1600, 900, SEA)}${graticule()}
        ${motifAt('globe', 800, 450, 720, { stroke: INK, width: 2, opacity: 0.45 })}
        ${path('M560 520 C660 460 740 560 860 500', { stroke: ROUTE, sw: 6 })}
        ${circle(560, 520, 12, { fill: ROUTE })}${circle(860, 500, 12, { fill: ROUTE })}
        ${t({ x: 800, y: 200, size: 96, text: "It doesn't matter where I go", fill: INK, anchor: 'middle', weight: 600, len: 1400 })}
        ${t({ x: 800, y: 800, size: 96, text: 'in the sun or in the snow', fill: ROUTE, anchor: 'middle', weight: 600, len: 1200 })}`,
    },
    {
      label: 'Oh-ohs',
      note: 'The chart empties to open sea and seventeen buoys light along a bearing.',
      draw: () => `
        ${rect(0, 0, 1600, 900, SEA)}${graticule()}${soundings(41)}
        ${line(100, 620, 1500, 380, ROUTE, 3, { dash: '18 14', opacity: 0.6 })}
        ${Array.from({ length: 10 }, (_, i) => circle(140 + i * 138, 614 - i * 23.7, i === 6 ? 20 : 11, { fill: i === 6 ? ROUTE : 'none', stroke: ROUTE, sw: 3.5 })).join('')}
        ${motifAt('compass', 1300, 740, 200, { stroke: INK, width: 1.8, opacity: 0.4 })}`,
    },
    {
      label: 'Quiet verse',
      note: 'A harbour at the largest scale in the film. One port, and the route does not move.',
      draw: () => `
        ${rect(0, 0, 1600, 900, SEA)}${graticule()}
        ${path('M0 300 C300 340 420 250 700 300 C900 336 1100 250 1600 300 L1600 0 L0 0 Z', { fill: CHART, stroke: INK, sw: 4 })}
        ${soundings(67)}
        ${port(760, 520, 'ANDALUSIA', { active: true })}
        ${t({ x: 800, y: 760, size: 58, text: 'Walk until my boots are faded blue', fill: INK, anchor: 'middle', weight: 600, len: 1240 })}`,
    },
  ],
}
