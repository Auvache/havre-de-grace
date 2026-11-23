// Bandcamp header banners in the site's look, rendered to exports/bandcamp/.
//
// Bandcamp's custom header is 975px wide. Each banner is the site's horizontal
// lockup (public/logos/suite/b1-lockup-horizontal.svg) centred on one of the
// site's surfaces: the woods band (/subscribe, /thank-you), the Into the Wild
// sea (the current record), or plain bone (every reading page). The woods are
// zoomed so the guitar sits at the right edge, clear of the lockup; the sea is
// zoomed past the cover's white border.
//
//   node tools/bandcamp/banners.mjs
//
// Uses the installed Google Chrome through playwright-core, so no browser
// download is needed.

import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const out = join(root, 'exports', 'bandcamp')
mkdirSync(out, { recursive: true })

const WIDTH = 975
const HEIGHT = 180

const lockup = readFileSync(join(root, 'public/logos/suite/b1-lockup-horizontal.svg'), 'utf8')
  .replace(/<title>.*?<\/title>/, '')
const tinted = (color) => lockup.replace('color="#16191d"', `color="${color}"`)
// Inlined as data URLs: a page built with setContent can't load file:// URLs.
const img = (path) => `data:image/jpeg;base64,${readFileSync(join(root, 'public', path)).toString('base64')}`

// The site's palette (app/assets/css/main.css).
const INK = '#1d232a'
const BONE = '#f3f1ec'

const banners = [
  {
    name: 'woods',
    background: `linear-gradient(rgba(11, 17, 13, 0.48), rgba(11, 17, 13, 0.48)), url("${img('images/site/woods-wide-2400.jpg')}") 14% 46% / 150% auto`,
    color: BONE,
  },
  {
    name: 'still-water',
    background: `url("${img('images/site/into-the-wild-2400.jpg')}") 50% 44% / 112% auto`,
    color: INK,
  },
  {
    name: 'bone',
    background: BONE,
    color: INK,
    rule: true,
  },
]

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #888; }
  .banner { width: ${WIDTH}px; height: ${HEIGHT}px; display: grid; place-items: center; position: relative; overflow: hidden; }
  .banner svg { height: 96px; width: auto; display: block; }
  .rule { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: rgba(29, 35, 42, 0.18); }
</style></head><body>
${banners.map((b) => `<div class="banner" id="${b.name}" style='background: ${b.background}'>${tinted(b.color)}${b.rule ? '<div class="rule"></div>' : ''}</div>`).join('\n')}
</body></html>`

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
for (const b of banners) {
  const file = join(out, `header-${b.name}-${WIDTH}x${HEIGHT}.png`)
  await page.locator(`#${b.name}`).screenshot({ path: file })
  console.log(file)
}
await browser.close()
