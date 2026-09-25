import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { defineNuxtModule } from 'nuxt/kit'
import { parse as parseYaml } from 'yaml'
import type { Album, StreamingLinks } from '../shared/types'
import { toSongRefs } from '../shared/utils/songSlug'
import { siteProfile } from '../shared/data/site'
import { bioParagraphs } from '../shared/data/bio'
import { pressBios } from '../shared/data/press'

/**
 * Build-time agent-discovery artefacts.
 *
 * Emits, into the prerendered output:
 *
 *   /llms.txt          a signposting index of the site, per llmstxt.org
 *   /<route>.md        a markdown mirror of every indexable page
 *   /discography.json  the catalogue as structured data
 *
 * ---
 *
 * Why the markdown is generated from `content/music/*.yml` rather than
 * converted from the rendered HTML:
 *
 * The spec this answers to ("Markdown for Agents") is normally implemented as
 * content negotiation — an origin that returns markdown when the request says
 * `Accept: text/markdown`. This site is `nuxt generate` output on S3 behind
 * Amplify, so there is no origin to negotiate with; a static host serves one
 * body per key. The static equivalent is a second key holding the markdown,
 * advertised from the HTML page and from the Link header, which is what this
 * does.
 *
 * Given the markdown has to be a separate document either way, generating it
 * from the YAML beats running the built HTML through a converter. A converter
 * would drag the nav, the footer, the ScrollReveal wrapper divs and the
 * Tailwind class soup into the output, and everything it recovered would be
 * structure the YAML already states outright — which track is track 7, which
 * half of a credit is the role. Reading the source gives clean headings and
 * real lists.
 *
 * The one page whose prose is not in the YAML is /about; its paragraphs live in
 * shared/data/bio.ts for exactly this reason.
 *
 * Everything here is derived from the same modules the pages render from —
 * `siteProfile`, `bioParagraphs`, `toSongRefs` — so a mirror cannot disagree
 * with the page it mirrors, and song URLs cannot drift from the routes nitro
 * actually prerendered.
 */

/**
 * Whether the markdown mirrors carry full song lyrics.
 *
 * Set this false and the mirrors keep every other field — tracklists,
 * durations, credits, liner notes, writing and recording notes — and drop only
 * the lyric bodies.
 *
 * It is true because the lyrics are already published as visible text on every
 * song page, so withholding them here would hide them from an agent reading the
 * site cooperatively while leaving them in place for anything scraping the
 * HTML. That trades away the mirror's usefulness and protects nothing. The
 * usage terms are carried by the Content-Signal line in robots.txt
 * (`ai-train=no, ai-input=no`) — the mechanism actually meant to express them.
 */
const INCLUDE_LYRICS = true

/**
 * Routes with no markdown mirror.
 *
 * These are the `robots: 'noindex'` routes in nuxt.config.ts. The reasons that
 * keep them out of the index — no server-rendered copy, or a link-in-bio hub
 * that would compete with the homepage — apply just as well to an agent, and a
 * mirror of a page that is deliberately not a search result would be a mirror
 * of nothing.
 *
 * `/tools` and its pages are here for a stronger reason than the rest: they are
 * unlisted, and a markdown mirror plus an llms.txt entry would be the site
 * handing an agent the URL it was never meant to find.
 *
 * Keep this in step with NO_MARKDOWN_MIRROR in app/composables/usePageSeo.ts.
 */
const EXCLUDED_ROUTES = new Set([
  '/links',
  '/logo',
  '/influences',
  '/tools',
  '/tools/demos',
])

const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  youtubeMusic: 'YouTube Music',
  amazonMusic: 'Amazon Music',
  bandcamp: 'Bandcamp',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  instagram: 'Instagram',
  bandsintown: 'Bandsintown',
}

/** Joins the non-empty blocks with exactly one blank line between each. */
const blocks = (...parts: (string | false | undefined | null | 0)[]) =>
  `${parts.filter(Boolean).join('\n\n')}\n`

const linkList = (links: Partial<Record<string, string | undefined>> = {}) =>
  Object.entries(links)
    .filter(([, url]) => Boolean(url))
    .map(([key, url]) => `- [${PLATFORM_LABELS[key] ?? key}](${url})`)
    .join('\n')

const creditList = (credits: { role: string, name: string }[] = []) =>
  credits.map((credit) => `- **${credit.role}:** ${credit.name}`).join('\n')

export default defineNuxtModule({
  meta: {
    name: 'agent-discovery',
    configKey: 'agentDiscovery',
  },

  setup(_options, nuxt) {
    const siteUrl = String(
      (nuxt.options as { site?: { url?: string } }).site?.url ?? '',
    ).replace(/\/+$/, '')

    if (!siteUrl) {
      throw new Error('agent-discovery: `site.url` must be set — every emitted link is absolute.')
    }

    const contentDir = join(nuxt.options.rootDir, 'content/music')

    nuxt.hook('nitro:init', (nitro) => {
      // `prerender:done` rather than `close`: the public dir is fully written by
      // then and the build has not been finalised, so these land as build
      // artefacts. Writing on `close` races Amplify's artifact upload.
      nitro.hooks.hook('prerender:done', async () => {
        const publicDir = nitro.options.output.publicDir

        const write = async (path: string, contents: string) => {
          const target = join(publicDir, path)
          await mkdir(dirname(target), { recursive: true })
          await writeFile(target, contents, 'utf8')
        }

        // --- Load the catalogue ------------------------------------------
        // Read straight off disk rather than through queryCollection: this runs
        // in the build process, not in a Nitro request context, so there is no
        // event to hand the content DB.
        const albums: Album[] = (await Promise.all(
          (await readdir(contentDir))
            .filter((file) => file.endsWith('.yml'))
            .map(async (file) => parseYaml(await readFile(join(contentDir, file), 'utf8')) as Album),
        ))
          .filter((album) => album.isVisible !== false)
          // Newest first, matching the sort the /about and home pages apply.
          .sort((a, b) =>
            (b.releaseDate ?? String(b.year)).localeCompare(a.releaseDate ?? String(a.year)),
          )

        /** Every mirror written, in the order it should appear in llms.txt. */
        const index: { route: string, title: string, description: string }[] = []

        const emit = async (
          route: string,
          meta: { title: string, description: string },
          body: string,
        ) => {
          if (EXCLUDED_ROUTES.has(route)) {
            return
          }
          // `/` becomes `/index.md` and `/about` becomes `/about.md`, mirroring
          // how nitro lays the HTML out (`/about/index.html`) so the markdown
          // sits beside the page it belongs to under one key prefix.
          await write(`${route === '/' ? '/index' : route}.md`, body)
          index.push({ route, ...meta })
        }

        const latest = albums.find((album) => album.isLatest) ?? albums[0]

        // --- / -------------------------------------------------------------
        await emit('/', {
          title: 'Havre De Grace',
          description: 'The artist, the discography, and how to get in touch.',
        }, blocks(
          '# Havre De Grace',
          `_${siteProfile.description} Based in ${siteProfile.location}._`,
          '## Releases',
          albums
            .map((album) =>
              `- **[${album.title}](${siteUrl}/music/${album.slug})** (${album.year})`
              + `${album.isLatest ? ' — latest release' : ''}`,
            )
            .join('\n'),
          '## Listen',
          `- [Free on the digital record player](${siteUrl}/listen)`,
          linkList(siteProfile.artistLinks),
          '## Booking',
          `Booking and press enquiries: ${siteProfile.bookingEmail}`,
          '## More',
          [
            `- [About the artist](${siteUrl}/about)`,
            `- [Press kit](${siteUrl}/press)`,
            `- [Contact and booking](${siteUrl}/contact)`,
          ].join('\n'),
        ))

        // --- /listen --------------------------------------------------------
        // The record player's shelf, as text. The same gate the page applies
        // (isListenable in app/utils/listenAlbums.ts, which this module can't
        // import through the `~~` alias): a full album, released, with audio.
        const today = new Date().toISOString().slice(0, 10)
        const onTheDeck = albums.filter((album) =>
          !album.isSingle
          && (!album.releaseDate || album.releaseDate <= today)
          && (album.tracklist ?? []).some((track) => Boolean(track.audio)),
        )

        await emit('/listen', {
          title: 'Listen free on digital vinyl',
          description: 'Every Havre De Grace album, free to play in full on an online record player.',
        }, blocks(
          '# Listen to Havre De Grace free on digital vinyl',
          `An online record player for every ${siteProfile.artistName} album: free, in full,`
          + ' no sign-up. The latest release is on the deck when the page opens.'
          + ' Move the needle to play the record, flip it to side B, and switch albums'
          + ' from the bar along the bottom. Lyrics and liner notes open beside it.',
          ...onTheDeck.map((album) => {
            const songSlug = new Map(toSongRefs(album).map((ref) => [ref.track, ref.slug]))
            return blocks(
              `## ${album.title} (${album.year})`,
              `[Play it on the record player](${siteUrl}/listen#${album.slug})`
              + ` · [Album page](${siteUrl}/music/${album.slug})`,
              (album.tracklist ?? [])
                .filter((track) => Boolean(track.audio))
                .map((track, i) => {
                  const slug = songSlug.get(track)
                  const title = slug ? `[${track.title}](${siteUrl}/music/${album.slug}/${slug})` : track.title
                  return `${i + 1}. ${title}${track.duration ? ` (${track.duration})` : ''}`
                })
                .join('\n'),
            ).trimEnd()
          }),
        ))

        // --- /about ---------------------------------------------------------
        await emit('/about', {
          title: 'About Havre De Grace',
          description: 'Biography of Stefan Auvache Bradley, press assets, and booking contact.',
        }, blocks(
          '# About Havre De Grace',
          // The pull-quote becomes a blockquote; the rest stay paragraphs.
          bioParagraphs
            .map((paragraph) => (paragraph.emphasis ? `> ${paragraph.text}` : paragraph.text))
            .join('\n\n'),
          '## Details',
          [
            `- **Performing name:** ${siteProfile.artistName}`,
            `- **Legal name:** ${siteProfile.legalName}`,
            `- **Based in:** ${siteProfile.location}`,
            `- **Genres:** ${siteProfile.genres.join(', ')}`,
            `- **Booking:** ${siteProfile.bookingEmail}`,
          ].join('\n'),
          '## Press',
          `Bios, high-resolution photos and release details: ${siteUrl}/press`,
        ))

        // --- /press ---------------------------------------------------------
        await emit('/press', {
          title: 'Havre De Grace press kit',
          description: 'Short, medium and long bios, high-resolution press photos, and booking contact.',
        }, blocks(
          '# Havre De Grace — press kit',
          'Everything here is cleared for publication.',
          `[Download the full press kit (.zip)](${siteUrl}${siteProfile.epkDownloadUrl})`,
          '## Details',
          [
            `- **Performing name:** ${siteProfile.artistName}`,
            `- **Legal name:** ${siteProfile.legalName}`,
            `- **Based in:** ${siteProfile.location}`,
            `- **Genres:** ${siteProfile.genres.join(', ')}`,
            latest && `- **Latest release:** ${latest.title} (${latest.year})`,
            `- **Booking and press:** ${siteProfile.bookingEmail}`,
          ].filter(Boolean).join('\n'),
          '## Bios',
          // The same three strings the page renders, at the same three lengths,
          // so an agent asked for "the short bio" can hand over the real one
          // instead of summarising the long one itself.
          pressBios
            .map((bio) => `### ${bio.label}\n\n${bio.usage}\n\n${bio.text}`)
            .join('\n\n'),
          '## Press photos',
          siteProfile.pressAssets
            .map((asset) => `- [${asset.label}](${siteUrl}${asset.src})`)
            .join('\n'),
        ))

        // --- /contact -------------------------------------------------------
        await emit('/contact', {
          title: 'Contact Havre De Grace',
          description: 'Booking, press, and licensing enquiries.',
        }, blocks(
          '# Contact',
          `Email is the fastest way to get in touch: ${siteProfile.bookingEmail}`,
          '## What to include',
          [
            '- **Booking:** the date, the city, the venue, and the kind of night it is. Solo acoustic, travelling from the Portland-Vancouver area.',
            `- **Press:** bios and high-resolution photos are ready to download at ${siteUrl}/press — no need to ask first.`,
            '- **Licensing and collaboration:** what you have in mind, and which song it is for.',
          ].join('\n'),
          '## Elsewhere',
          linkList(siteProfile.artistLinks),
        ))

        // --- /music/<album> and /music/<album>/<song> ------------------------
        for (const album of albums) {
          const albumRoute = `/music/${album.slug}`
          // The same helper the album and song pages route through, so these
          // URLs match the pages nitro prerendered — including its collision
          // suffixes and its skipping of titles that slugify to nothing.
          const songs = toSongRefs(album)

          await emit(albumRoute, {
            title: `${album.title} (${album.year})`,
            description: 'Tracklist, credits, liner notes, and streaming links.',
          }, blocks(
            `# ${album.title}`,
            `_Album by ${siteProfile.artistName}, released ${album.releaseDate ?? album.year}._`,
            album.description,
            '## Tracklist',
            songs
              .map((song) =>
                `${song.trackNumber}. [${song.track.title}](${siteUrl}${albumRoute}/${song.slug})`
                + `${song.track.duration ? ` — ${song.track.duration}` : ''}`,
              )
              .join('\n'),
            album.leadSingle && `**Lead single:** ${album.leadSingle.title}`,
            linkList(album.streamingLinks as StreamingLinks) && '## Listen',
            linkList(album.streamingLinks as StreamingLinks),
            album.linerNotes && '## Liner notes',
            album.linerNotes?.trim(),
            creditList(album.credits) && '## Credits',
            creditList(album.credits),
            album.pressQuotes?.length && '## Press',
            album.pressQuotes
              ?.map((quote) => `> ${quote.quote}${quote.source ? `\n>\n> — ${quote.source}` : ''}`)
              .join('\n\n'),
          ))

          for (const song of songs) {
            const { track, trackNumber } = song
            const lyrics = INCLUDE_LYRICS ? track.lyrics?.trim() : undefined

            await emit(`${albumRoute}/${song.slug}`, {
              title: `${track.title} — ${album.title}`,
              description: `Track ${trackNumber} on ${album.title}`
                + `${lyrics ? ': lyrics, credits, and notes.' : ': credits and notes.'}`,
            }, blocks(
              `# ${track.title}`,
              `_Track ${trackNumber} on [${album.title}](${siteUrl}${albumRoute})`
              + ` by ${siteProfile.artistName}`
              + `${track.duration ? `, ${track.duration}` : ''}._`,
              lyrics && '## Lyrics',
              // Verse, not prose: every line break carries meaning, so the
              // lines are emitted inside a fenced block rather than reflowed
              // into a paragraph by whatever renders this.
              lyrics && `\`\`\`\n${lyrics.split('\n').map((line) => line.trimEnd()).join('\n')}\n\`\`\``,
              track.writingStory && '## Writing',
              track.writingStory?.trim(),
              track.recordingDetails && '## Recording',
              track.recordingDetails?.trim(),
              creditList(track.credits) && '## Credits',
              creditList(track.credits),
            ))
          }
        }

        // --- /llms.txt --------------------------------------------------------
        await write('/llms.txt', blocks(
          `# ${siteProfile.artistName}`,
          `> ${siteProfile.description} Based in ${siteProfile.location}.`
          + ' This site holds the discography, lyrics, credits, liner notes, and booking contact.',
          'Every page listed below is also available as markdown at the same URL with'
          + ' `.md` appended, and the catalogue as structured JSON at /discography.json.',
          'Usage preferences are declared as Content Signals in /robots.txt:'
          + ' `ai-train=no, search=yes, ai-input=no`. The lyrics and biography here are'
          + ' published to be read and linked to, not to be used as training data.',
          '## Pages',
          index
            .map(({ route, title, description }) =>
              `- [${title}](${siteUrl}${route === '/' ? '/index' : route}.md): ${description}`,
            )
            .join('\n'),
          '## Data',
          [
            `- [Discography JSON](${siteUrl}/discography.json): every release, tracklist, and streaming link.`,
            `- [Sitemap](${siteUrl}/sitemap.xml): all indexable URLs.`,
            `- [Capability manifest](${siteUrl}/.well-known/ai-catalog.json): machine-readable index of these resources.`,
          ].join('\n'),
          '## Contact',
          `- Booking and press: ${siteProfile.bookingEmail}`,
        ))

        // --- /discography.json ------------------------------------------------
        // Lyrics are deliberately absent here. This document is the catalogue —
        // what was released, when, and where to hear it. A lyric belongs on the
        // song page and its mirror, presented as the work, rather than as a bulk
        // field in a file whose whole shape invites harvesting.
        await write('/discography.json', `${JSON.stringify({
          artist: {
            name: siteProfile.artistName,
            legalName: siteProfile.legalName,
            description: siteProfile.description,
            location: siteProfile.location,
            genres: siteProfile.genres,
            url: `${siteUrl}/`,
            bookingEmail: siteProfile.bookingEmail,
            sameAs: siteProfile.entityUrls,
          },
          usage: {
            contentSignal: 'ai-train=no, search=yes, ai-input=no',
            declaredAt: `${siteUrl}/robots.txt`,
          },
          releases: albums.map((album) => ({
            title: album.title,
            year: album.year,
            releaseDate: album.releaseDate,
            isLatest: Boolean(album.isLatest),
            url: `${siteUrl}/music/${album.slug}`,
            markdown: `${siteUrl}/music/${album.slug}.md`,
            coverImage: album.coverImage ? `${siteUrl}${album.coverImage}` : undefined,
            description: album.description,
            streamingLinks: album.streamingLinks,
            credits: album.credits,
            tracklist: toSongRefs(album).map((song) => ({
              number: song.trackNumber,
              title: song.track.title,
              duration: song.track.duration,
              url: `${siteUrl}/music/${album.slug}/${song.slug}`,
              markdown: `${siteUrl}/music/${album.slug}/${song.slug}.md`,
              credits: song.track.credits,
            })),
          })),
        }, null, 2)}\n`)

        nitro.logger.success(
          `agent-discovery: ${index.length} markdown mirrors, llms.txt, discography.json`,
        )
      })
    })
  },
})
