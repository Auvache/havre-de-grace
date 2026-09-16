import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { crc32, deflateRawSync } from 'node:zlib'
import { defineNuxtModule } from 'nuxt/kit'
import { pressBios } from '../shared/data/press'
import { siteProfile } from '../shared/data/site'

/**
 * Builds the one-click press kit: public/press/havre-de-grace-press-kit.zip.
 *
 * The zip is generated rather than committed so it cannot fall out of step with
 * the page. Every bio in it is rendered from shared/data/press.ts — the same
 * source /press and /press.md read — so editing a bio in one place updates the
 * page, the markdown mirror and the download together.
 *
 * It is written into `public/` at module setup, which means it exists in dev
 * and in `nuxt generate` alike, served as a plain static file by both. The
 * alternative — writing into the prerender output on `prerender:done`, the way
 * modules/agent-discovery.ts does — would leave the download 404ing in dev,
 * where it is exactly the link most worth clicking before release. The file is
 * a build artefact, so it is gitignored.
 *
 * ## Why the zip is written by hand
 *
 * A press kit is four files. Node 24 ships everything the format needs —
 * `zlib.deflateRawSync` for method 8 and `zlib.crc32` for the checksum — so an
 * archiver dependency would be a supply-chain surface and a version to maintain
 * in exchange for about sixty lines. The writer below is deliberately the
 * minimum viable ZIP: no zip64, no data descriptors, no directory entries.
 * That is sound while the kit is a handful of photos; if it ever grows past
 * 4 GB or 65,535 entries, reach for a real library instead of extending this.
 */

interface ZipEntry {
  /** Path inside the archive. Forward slashes, no leading slash. */
  name: string
  data: Buffer
}

const LOCAL_HEADER_SIG = 0x04034b50
const CENTRAL_HEADER_SIG = 0x02014b50
const END_OF_CENTRAL_DIR_SIG = 0x06054b50

/**
 * A fixed MS-DOS timestamp (1980-01-01 00:00:00), rather than the current
 * clock. The zip is regenerated on every build, and a real timestamp would make
 * its bytes differ each time for no reason — defeating reproducible builds and
 * any content hash downstream.
 */
const DOS_TIME = 0
const DOS_DATE = 0x0021

const buildZip = (entries: ZipEntry[]): Buffer => {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8')
    const checksum = crc32(entry.data)
    const deflated = deflateRawSync(entry.data, { level: 9 })

    // Storing beats deflating for already-compressed data (every JPEG in the
    // kit), where deflate reliably adds a few bytes rather than removing any.
    const useDeflate = deflated.length < entry.data.length
    const body = useDeflate ? deflated : entry.data
    const method = useDeflate ? 8 : 0

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(LOCAL_HEADER_SIG, 0)
    localHeader.writeUInt16LE(20, 4) // version needed to extract (2.0)
    localHeader.writeUInt16LE(0, 6) // general purpose flags
    localHeader.writeUInt16LE(method, 8)
    localHeader.writeUInt16LE(DOS_TIME, 10)
    localHeader.writeUInt16LE(DOS_DATE, 12)
    localHeader.writeUInt32LE(checksum, 14)
    localHeader.writeUInt32LE(body.length, 18)
    localHeader.writeUInt32LE(entry.data.length, 22)
    localHeader.writeUInt16LE(name.length, 26)
    localHeader.writeUInt16LE(0, 28) // extra field length

    localParts.push(localHeader, name, body)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(CENTRAL_HEADER_SIG, 0)
    centralHeader.writeUInt16LE(20, 4) // version made by
    centralHeader.writeUInt16LE(20, 6) // version needed to extract
    centralHeader.writeUInt16LE(0, 8)
    centralHeader.writeUInt16LE(method, 10)
    centralHeader.writeUInt16LE(DOS_TIME, 12)
    centralHeader.writeUInt16LE(DOS_DATE, 14)
    centralHeader.writeUInt32LE(checksum, 16)
    centralHeader.writeUInt32LE(body.length, 20)
    centralHeader.writeUInt32LE(entry.data.length, 24)
    centralHeader.writeUInt16LE(name.length, 28)
    centralHeader.writeUInt16LE(0, 30) // extra field length
    centralHeader.writeUInt16LE(0, 32) // comment length
    centralHeader.writeUInt16LE(0, 34) // disk number start
    centralHeader.writeUInt16LE(0, 36) // internal attributes
    centralHeader.writeUInt32LE(0, 38) // external attributes
    centralHeader.writeUInt32LE(offset, 42)

    centralParts.push(centralHeader, name)

    offset += localHeader.length + name.length + body.length
  }

  const central = Buffer.concat(centralParts)

  const end = Buffer.alloc(22)
  end.writeUInt32LE(END_OF_CENTRAL_DIR_SIG, 0)
  end.writeUInt16LE(0, 4) // this disk number
  end.writeUInt16LE(0, 6) // disk with central directory
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(central.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20) // comment length

  return Buffer.concat([...localParts, central, end])
}

/** The plain-text fact sheet that sits at the root of the archive. */
const buildReadme = () => [
  `${siteProfile.artistName.toUpperCase()} — PRESS KIT`,
  '',
  siteProfile.description,
  '',
  'CONTENTS',
  '  bios/           Short, medium and long biographies as plain text.',
  '  photos/         High-resolution press photos, free to use with credit.',
  '',
  'DETAILS',
  `  Performing name   ${siteProfile.artistName}`,
  `  Legal name        ${siteProfile.legalName}`,
  `  Based in          ${siteProfile.location}`,
  `  Genres            ${siteProfile.genres.join(', ')}`,
  `  Booking & press   ${siteProfile.bookingEmail}`,
  '',
  'LINKS',
  ...siteProfile.socialLinks.map((link) => `  ${link.label.padEnd(16)}  ${link.url}`),
  '',
  'Photo credit: please credit the photographer where known, and link back to',
  'https://havredegracemusic.com where possible.',
  '',
].join('\n')

export default defineNuxtModule({
  meta: {
    name: 'press-kit',
    configKey: 'pressKit',
  },

  async setup(_options, nuxt) {
    const publicDir = join(nuxt.options.rootDir, 'public')
    const target = join(publicDir, 'press/havre-de-grace-press-kit.zip')

    const entries: ZipEntry[] = [
      { name: 'README.txt', data: Buffer.from(buildReadme(), 'utf8') },
      ...pressBios.map((bio) => ({
        name: `bios/${bio.id}.txt`,
        data: Buffer.from(`${bio.text}\n`, 'utf8'),
      })),
    ]

    for (const asset of siteProfile.pressAssets) {
      // `asset.src` is a public path ("/press/x.jpg"); resolve it back to disk.
      const source = join(publicDir, asset.src.replace(/^\//, ''))
      try {
        entries.push({
          name: `photos/${asset.downloadName}`,
          data: await readFile(source),
        })
      }
      catch {
        // A missing photo should not fail the build — the kit is still useful
        // without it, and the page links each photo separately anyway.
        console.warn(`[press-kit] skipping missing press asset: ${asset.src}`)
      }
    }

    const zip = buildZip(entries)

    // Skip the write when nothing changed, so `nuxt dev` doesn't touch the file
    // on every restart and trigger its own watcher.
    const existing = await readFile(target).catch(() => null)
    const same = existing
      && createHash('sha256').update(existing).digest('hex')
      === createHash('sha256').update(zip).digest('hex')

    if (!same) {
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, zip)
    }
  },
})
