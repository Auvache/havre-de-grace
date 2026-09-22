/*
 * The reference sheet every style is drawn onto.
 *
 * A style guide made of single frames would have hidden the thing that is
 * actually wrong with the current Andalusia cut, which is not how any one frame
 * looks — they look fine — but that the four hundredth frame looks like the
 * fourth. So every sheet here is a frame AND a contact strip: 16:9 hero at the
 * top, then five thumbnails showing what the same style does at the title, at a
 * verse, at a chorus, at the oh-ohs and in the quiet fourth verse. If those five
 * thumbnails look alike, the style has the old problem and should not ship.
 *
 * The end card is not among the five: it is the same in all seven films, so it
 * is drawn once by endcard.mjs rather than seven times to no purpose.
 *
 * Sheets are 1600x1260. The film is 1600x900 of that and nothing outside it is
 * part of the film — the strip, the labels and the swatches are apparatus.
 */
import { r } from '../../shared/video/motifs.mjs'

const SHEET_W = 1600
const HERO_H = 900
const SHEET_H = 1260

const THUMB_W = 284
const THUMB_H = 160
const THUMB_Y = 960
const THUMB_GAP = 25
const THUMB_X0 = 40

const CHROME = { bg: '#08080a', fg: '#e8e5de', muted: '#77746d', rule: '#23232a' }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Break a note onto at most two lines at a character budget. */
function wrap(text, budget = 46) {
  const words = String(text).split(/\s+/)
  const lines = ['']
  for (const word of words) {
    const i = lines.length - 1
    if (!lines[i]) lines[i] = word
    else if ((lines[i] + ' ' + word).length <= budget) lines[i] += ' ' + word
    else lines.push(word)
  }
  return lines.slice(0, 2)
}

export function sheet(style) {
  const chrome = { ...CHROME, ...(style.chrome ?? {}) }
  const accent = style.accent ?? style.palette?.[style.palette.length - 1]?.[1] ?? '#d8382b'
  const thumbs = style.thumbs ?? []

  const thumbBoxes = thumbs.map((thumb, i) => {
    const x = THUMB_X0 + i * (THUMB_W + THUMB_GAP)
    const scale = THUMB_W / SHEET_W
    const note = wrap(thumb.note)
    return `
    <g clip-path="url(#thumb-${i})">
      <g transform="translate(${x} ${THUMB_Y}) scale(${r(scale, 5)})">${thumb.draw()}</g>
    </g>
    <rect x="${x}" y="${THUMB_Y}" width="${THUMB_W}" height="${THUMB_H}" fill="none" stroke="${chrome.rule}" stroke-width="1"/>
    <text class="sheet-label" x="${x}" y="1146" font-size="15" letter-spacing="2.4" fill="${accent}">${esc(thumb.label.toUpperCase())}</text>
    ${note.map((row, j) => `<text class="sheet-note" x="${x}" y="${1170 + j * 19}" font-size="14.5" fill="${chrome.muted}">${esc(row)}</text>`).join('\n    ')}`
  }).join('\n')

  const clips = thumbs.map((_, i) => {
    const x = THUMB_X0 + i * (THUMB_W + THUMB_GAP)
    return `<clipPath id="thumb-${i}"><rect x="${x}" y="${THUMB_Y}" width="${THUMB_W}" height="${THUMB_H}"/></clipPath>`
  }).join('')

  let swatchX = THUMB_X0
  const swatches = (style.palette ?? []).map(([name, hex]) => {
    const label = `${name} ${hex.toUpperCase()}`
    const markup = `
    <rect x="${swatchX}" y="1206" width="22" height="22" fill="${hex}" stroke="${chrome.rule}" stroke-width="1"/>
    <text class="sheet-note" x="${swatchX + 31}" y="1223" font-size="14.5" fill="${chrome.muted}">${esc(label)}</text>`
    swatchX += 31 + label.length * 7.4 + 34
    return markup
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" class="vs-sheet" viewBox="0 0 ${SHEET_W} ${SHEET_H}" width="${SHEET_W}" height="${SHEET_H}" role="img" aria-labelledby="sheet-title sheet-desc">
  <title id="sheet-title">${esc(style.name)} — music video style reference (${style.id})</title>
  <desc id="sheet-desc">${esc(style.tagline)} Frame is 1600x900; the strip below the frame is apparatus, not part of the film.</desc>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&amp;display=swap');
    svg.vs-sheet text { font-family: "Jost", "Helvetica Neue", Helvetica, Arial, sans-serif; }
    svg.vs-sheet .sheet-label { font-weight: 600; text-transform: uppercase; }
    svg.vs-sheet .sheet-note { font-weight: 400; }
  </style>
  <defs>${clips}${style.defs ? style.defs() : ''}</defs>

  <rect width="${SHEET_W}" height="${SHEET_H}" fill="${chrome.bg}"/>

  <!-- ── The frame. Everything above y=900 is the film. ── -->
  <g clip-path="url(#hero-clip)">${style.hero()}</g>
  <clipPath id="hero-clip"><rect width="${SHEET_W}" height="${HERO_H}"/></clipPath>

  <!-- ── Apparatus ── -->
  <rect y="${HERO_H}" width="${SHEET_W}" height="${SHEET_H - HERO_H}" fill="${chrome.bg}"/>
  <rect y="${HERO_H}" width="${SHEET_W}" height="2" fill="${chrome.rule}"/>
  <text class="sheet-label" x="${THUMB_X0}" y="938" font-size="16" letter-spacing="3" fill="${chrome.fg}">${esc(style.id.toUpperCase())} · ${esc(style.name.toUpperCase())}</text>
  <text class="sheet-label" x="${SHEET_W - THUMB_X0}" y="938" font-size="16" letter-spacing="3" fill="${chrome.muted}" text-anchor="end">SECTION VARIATION — THE SAME STYLE AT FIVE POINTS IN THE SONG</text>
${thumbBoxes}
${swatches}
</svg>
`
}
