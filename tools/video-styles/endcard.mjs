/*
 * The end card, on its own sheet.
 *
 * It is not part of any one style, so it is not drawn on any one style's
 * contact strip — it is drawn once, here, and the seven sheets are free to
 * spend their fifth thumbnail on something that actually differs between them.
 */
import { logoScreen, creditsScreen, rect, line, t } from './kit.mjs'

const W = 1600
const H = 760
const PANEL_W = 740
const PANEL_H = 416
const PANEL_Y = 132
const CHROME = { bg: '#08080a', fg: '#e8e5de', muted: '#77746d', rule: '#23232a' }
const ACCENT = '#c9a227'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const panel = (x, body, label, note) => `
  <g clip-path="url(#ec-clip-${x})">
    <g transform="translate(${x} ${PANEL_Y}) scale(${PANEL_W / 1600})">${body}</g>
  </g>
  <rect x="${x}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" fill="none" stroke="${CHROME.rule}" stroke-width="1"/>
  <text class="sheet-label" x="${x}" y="${PANEL_Y + PANEL_H + 40}" font-size="17" letter-spacing="3" fill="${ACCENT}">${esc(label)}</text>
  <text class="sheet-note" x="${x}" y="${PANEL_Y + PANEL_H + 70}" font-size="16" fill="${CHROME.muted}">${esc(note)}</text>`

export function endCardSheet() {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="vs-sheet" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ec-title ec-desc">
  <title id="ec-title">The end card — every film, the same two screens</title>
  <desc id="ec-desc">The stacked lockup centred on black, held three seconds from the last note, then a hard cut to the credits on the same black, one per line, centred.</desc>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&amp;display=swap');
    svg.vs-sheet text { font-family: "Jost", "Helvetica Neue", Helvetica, Arial, sans-serif; }
    svg.vs-sheet .sheet-label { font-weight: 600; text-transform: uppercase; }
    svg.vs-sheet .sheet-note { font-weight: 400; }
  </style>
  <defs>
    <clipPath id="ec-clip-40"><rect x="40" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}"/></clipPath>
    <clipPath id="ec-clip-820"><rect x="820" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="${CHROME.bg}"/>
  <text class="sheet-label" x="40" y="62" font-size="17" letter-spacing="3" fill="${CHROME.fg}">THE END CARD — THE SAME IN ALL SEVEN</text>
  <text class="sheet-note" x="40" y="94" font-size="16" fill="${CHROME.muted}">Splash-screen lockup, splash-screen ink, pure black ground. No style gets its own version of this.</text>

  ${panel(40, logoScreen(), 'Screen one · logo', 'Lands on the last note. Held 3s. Nothing else in frame.')}
  ${panel(820, creditsScreen(), 'Screen two · credits', 'Hard cut at +3s. One per line, centred every way.')}

  <line x1="40" y1="${H - 72}" x2="${W - 40}" y2="${H - 72}" stroke="${CHROME.rule}" stroke-width="1"/>
  <text class="sheet-note" x="40" y="${H - 36}" font-size="16" fill="${CHROME.muted}">Black #000000 · ink #F4F6F7 · lockup 500 units wide on a 1600 frame · credits 34 on 62 · no fades, no mark on screen two.</text>
</svg>
`
}
