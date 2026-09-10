// Renders the raster brand assets the browser and the platforms insist on:
// favicons, touch icons, and the Open Graph card. Everything is generated from
// the SVGs in public/logos/suite, so those stay the single source of truth.
//
//   node tools/logo/rasterize.mjs
//
// Rasterising is done by headless Chrome, which is already the thing that
// decides what an SVG looks like in a browser. No image library involved.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SUITE = 'public/logos/suite'
const OUT = 'public'

const work = mkdtempSync(join(tmpdir(), 'hdg-raster-'))

/** Height that keeps a file's own aspect ratio at a given width. */
function aspectHeight(svg, width) {
  const vb = /viewBox="([^"]+)"/.exec(svg)?.[1].trim().split(/\s+/).map(Number)
  if (!vb || vb.length !== 4) throw new Error('no viewBox')
  return Math.round((width * vb[3]) / vb[2])
}

/** Rasterise one SVG at an exact pixel size. `height` defaults to its aspect. */
function render(svgFile, width, height, outFile, { transparent = true } = {}) {
  const svg = readFileSync(join(SUITE, svgFile), 'utf8')
  const h = height ?? aspectHeight(svg, width)
  const page = join(work, 'page.html')
  writeFileSync(page, `<!doctype html><meta charset="utf-8">`
    + `<style>html,body{margin:0;padding:0;background:transparent}`
    + `svg{display:block;width:${width}px;height:${h}px}</style>${svg}`)

  execFileSync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    ...(transparent ? ['--default-background-color=00000000'] : []),
    `--screenshot=${outFile}`,
    `--window-size=${width},${h}`,
    `file://${page}`,
  ], { stdio: ['ignore', 'ignore', 'pipe'] })
}

/**
 * Pack PNGs into an .ico. The format is a six-byte header, a sixteen-byte
 * directory entry per image, then the payloads — and since Vista an entry is
 * allowed to be a PNG rather than a BMP, which is what makes this short.
 */
function buildIco(pngPaths, sizes, outFile) {
  const images = pngPaths.map((p) => readFileSync(p))
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // 1 = icon
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + images.length * 16
  const entries = images.map((data, i) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0) // 0 means 256
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1)
    e.writeUInt8(0, 2) // palette size
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })

  writeFileSync(outFile, Buffer.concat([header, ...entries, ...images]))
}

/**
 * The SVG favicon, which Chrome and Firefox prefer over the .ico.
 *
 * It carries the C4 tile: an off-white anchor on ink, opaque. The earlier draw
 * was a bare anchor on a transparent ground that flipped colour with the UI
 * theme, which left the mark taking the colour of the tab strip behind it. One
 * opaque tile reads the same in every browser and both themes.
 */
const svgFavicon = () => readFileSync(join(SUITE, 'c4-favicon.svg'), 'utf8')

const tasks = []

// Favicon: the tile, because a bare anchor vanishes against a dark tab strip.
for (const size of [16, 32, 48]) {
  const p = join(work, `favicon-${size}.png`)
  render('c4-favicon.svg', size, size, p)
  tasks.push(p)
}
buildIco(tasks, [16, 32, 48], join(OUT, 'favicon.ico'))
writeFileSync(join(OUT, 'favicon.svg'), svgFavicon())

// Touch and home-screen icons use the square tile: both platforms apply their
// own rounding and a tile that arrives pre-rounded gets rounded twice.
render('c5-icon-square.svg', 180, 180, join(OUT, 'apple-touch-icon.png'), { transparent: false })
render('c5-icon-square.svg', 192, 192, join(OUT, 'android-chrome-192x192.png'), { transparent: false })
render('c5-icon-square.svg', 512, 512, join(OUT, 'android-chrome-512x512.png'), { transparent: false })

// Share card and a plain logo for structured data.
render('d2-og-image-dark.svg', 1200, 630, join(OUT, 'og-image.png'), { transparent: false })
render('a4-lockup-stacked.svg', 1200, null, join(OUT, 'brand-logo.png'), { transparent: false })

rmSync(work, { recursive: true, force: true })
console.log('rasterised favicon.ico, favicon.svg, touch icons, og-image.png, brand-logo.png')
