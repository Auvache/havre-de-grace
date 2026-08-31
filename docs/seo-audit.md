# SEO audit — what changed and why

Record of the on-site SEO work. The remaining off-site tasks live in
`docs/seo-strategy.md`, and they are now the bottleneck.

**Targets:** "havre de grace", "havre de grace music", "havre de grace band".

All three are *entity* queries, not topic queries. Winning them is about
convincing Google that a musician named Havre De Grace exists and is distinct
from the town in Maryland — which is won with consistent entity signals and
corroborating off-site profiles, not with page volume. That framing drove every
decision below.

---

## The three biggest problems found

### 1. The flagship album was `noindex`

`nuxt.config.ts` carried `X-Robots-Tag: noindex, nofollow` on
`/music/into-the-wild`. Correct while the album was unreleased; it shipped
**2026-07-17** and the rule was never removed. The page has ~2,400 words of
lyrics and credits and was excluded from `sitemap.xml`.

Worse, the signals contradicted each other. The `static` nitro preset emits no
`_headers` file, so the header was almost certainly never applied on Amplify —
the page's own HTML said `index, follow`. So it was crawlable but hidden from the
sitemap. Rule removed; the album and all its songs are now indexed and listed.

### 2. Two conflicting `WebSite` entities on every page

`app/app.vue` hand-rolled `<script type="application/ld+json">` blocks while
`@nuxtjs/seo` independently injected its own `@graph`. Every page shipped:

- `WebSite` named "Havre De Grace Music", no `@id` (hand-rolled)
- `WebSite` named "Havre De Grace", `@id: .../#website` (module)
- `MusicGroup` with no `@id` — an orphan referenced by nothing
- `MusicAlbum` whose `byArtist` was an inline partial *copy* of the MusicGroup

Three descriptions of one entity and no graph to reconcile them. For a site whose
whole problem is entity ambiguity, this was worse than having no markup.

Now everything goes through `useSchemaOrg`, so it lands in **one** `@graph` with
cross-referenced `@id`s:

```
WebSite (#website)
  └─ publisher → MusicGroup (#artist)
                   ├─ member → Person (#stefan-auvache-bradley)
                   └─ ← byArtist ← MusicAlbum (/music/<album>#album)
                                     └─ track → MusicRecording (/music/<album>/<song>#recording)
                                                  └─ recordingOf → MusicComposition (+ lyrics)
```

Added along the way: `Person` (there was no node for the legal name at all),
`BreadcrumbList` on album and song pages, `VideoObject` for the live-performance
embed on `/about`, `albumProductionType`/`albumReleaseType`, and the streaming
URLs as the album's `sameAs` — previously absent from album markup entirely,
despite being the strongest corroboration that a release is real.

`alternateName` on the MusicGroup and WebSite carries "Havre De Grace Music" and
"Havre De Grace Band", which is how the "band" query gets served without
claiming in visible copy that a solo project is a band.

### 3. The homepage had 112 words

The page that has to win all three target queries had almost no indexable text.
`AboutPreview.vue` now carries real bio prose under an `<h2>` reading "about
havre de grace" — same layout, more text. **112 → 204 words.**

This is still the thinnest of the important pages and the most obvious place to
keep investing. See "Still worth doing" below.

---

## Indexability cleanup

5 of the 9 indexed URLs were near-empty. On a site this small that ratio is a
real drag on how Google assesses overall quality.

| URL | Before | Now |
|---|---|---|
| `/listen`, `/listen/*` | indexed, 9–51 words | `noindex, follow` |
| `/links` | indexed, 16 words | `noindex, follow` |
| `/influences` | indexed, 6 words | `noindex, follow` |
| `/influences-new` | indexed, 6 words, near-duplicate | deleted, `301` → `/influences` |
| `/music/into-the-wild` | `noindex` | indexed |

`noindex, follow` rather than plain `noindex` so crawlers still pass signal
through to the pages that should rank. These rules live in `routeRules` under the
`robots` key, which `@nuxtjs/sitemap` also reads — so a noindexed route drops out
of `sitemap.xml` automatically. That's why `noindex` is *not* done with headers:
a header would do neither, as problem 1 demonstrated.

The influences swap was per instruction: the grid version (previously at
`/influences-new`) replaced the pannable canvas, and the route stays orphaned and
noindexed. `app/components/influences/InfluenceCanvas.vue` and the
`useCanvasPan` / `useAlbumPositions` composables are now unreferenced — left in
place deliberately in case the canvas comes back.

**Index went from 9 URLs (5 thin) to 23 URLs of substantive content.**

### Why `/listen` is noindex

The request was to target "listen to ALBUM_NAME in digital vinyl format" from
these pages. That isn't achievable there: `app/assets/css/record-player.css`
locks the scene to `height: 100dvh; overflow: hidden`, `layouts/listen.vue` wraps
it in `<main class="h-screen">`, and the deck renders no album title, no
tracklist, and no cover image (the record is drawn in CSS). There is nowhere for
text to go without changing the design.

So the phrase is targeted from the **album** pages instead, which already have
~2,400 words and real ranking ability. The album page's record-player link now
reads "listen in digital vinyl format" and the meta description mentions it.

---

## Song pages

New route: `/music/<album>/<song>` — 19 pages, one per track.

They render lyrics, album art, duration, streaming links, prev/next track
navigation, and `MusicRecording` + `MusicComposition` + `BreadcrumbList` schema.
They are linked from each track's accordion on the album page, which is how they
get crawled and prerendered — and, more importantly, what makes them legitimate
pages rather than doorway pages.

**Known tradeoff:** until per-song stories are written, most of these duplicate
lyrics that already appear on the album page. This was a deliberate, accepted
call. The mitigation is built in and already partly live: the page renders
`writingStory`, `recordingDetails`, and per-track `credits` whenever those
fields exist in the content file. Album 1 already had **4 writing stories and 3
recording details written and never rendered anywhere** — those four song pages
have genuinely unique content today (`/music/i-want-to-be-yours-and-other-songs/scarecrow`
is 664 words vs. 293 for a lyrics-only page). Filling in the remaining ~15 is
what turns the rest from duplicates into pages that deserve to rank.

Slugs come from `shared/utils/songSlug.ts`, derived from track **titles**, not
from audio filenames — the filenames carry production artifacts, so the
`/listen` convention would have produced
`/music/into-the-wild/rocks-in-the-sea-mix`. Collisions get a `-<n>` suffix.

`app/pages/music/[slug].vue` moved to `app/pages/music/[slug]/index.vue`.
Required: keeping both `[slug].vue` and a `[slug]/` directory would have made
Nuxt treat the album page as a parent layout needing `<NuxtPage />`, breaking it.
URLs are unchanged.

---

## Social share images

The homepage served the **raw 3000×3000, 5 MB PNG** album cover while declaring
it `image/jpeg` at `1200×630`. Facebook would have cropped it badly; some
scrapers would have failed to fetch it at all.

Pre-rendered derivatives are now committed and declared honestly:

| File | Size |
|---|---|
| `albums/into-the-wild/images/into-the-wild-og.jpg` | 1200×1200, 206 KB |
| `albums/i-want-to-be-yours-and-other-songs/images/…-og.jpg` | 1200×1200, 486 KB |
| `press/media-pic-wide-og.jpg` | 1200×695, 460 KB |

Static files rather than `_ipx` URLs on purpose: nitro's prerenderer crawls
markup, not meta-tag contents, so an `_ipx` variant referenced only from a
`<meta>` tag isn't guaranteed to exist in the static bundle.

`nuxt-og-image` is disabled — it was the source of the bogus `1200×630` /
`image/jpeg` tags. Dimensions now come from `usePageSeo`'s `PageSeoImage`, which
requires them explicitly.

`public/og-image.jpg` (1200×630, reads "MUSIC BY HAVRE DE GRACE") was sitting
unused; it's now the site-wide fallback via `DEFAULT_SEO_IMAGE`.

---

## Other fixes

**Sitemap image URLs were malformed.** `discoverImages` reads `src`/`srcset`
straight out of prerendered HTML — where the `&` in `/_ipx/f_webp,avif&s_...` is
already `&amp;` — then XML-escapes it again, shipping `&amp;amp;`. Every one of
those 30 image URLs 404s once a crawler unescapes it. Discovery is now off; the
entries were mostly noise anyway (streaming-service icons from `/_nuxt`, and 50+
*other artists'* album covers from the influences page). Album art is still
discoverable from the pages and from `MusicAlbum.image`.

**Tracking parameters stripped from `sameAs`.** `?si=`, `?ref=`,
`marketplaceId`, `utm_*` — `sameAs` values are entity identifiers matched against
the same URLs on Wikidata and MusicBrainz, so they have to be canonical.
`siteProfile.entityUrls` is a new field holding bare artist-profile roots, kept
separate from `artistLinks` because those are visitor click targets and may
deep-link (Bandcamp points at an album for humans; `entityUrls` has the artist
root). Also dropped `?noindex=1` from the Bandsintown URL, which was being fed
into `sameAs`.

**Image dimensions were wrong everywhere**, guaranteeing layout shift:

| Image | Declared | Actual |
|---|---|---|
| `bio-update.png` (AboutPreview) | 2056×2083 | 2000×2000 |
| `bio-update.png` (BioSection) | 3024×1752 | 2000×2000 |
| `profile.jpg` | 1200×800 | 2056×2083 |
| `bio-pic.jpg` | 1200×800 | 1000×1000 |

All corrected. The three raw `<img>` tags in `BioSection.vue` became `NuxtImg`
with `sizes`/`format`, so the 1.6 MB `profile.jpg` and 1.2 MB `bio-update.png`
are no longer shipped at full size. The YouTube iframe got `loading="lazy"` and
moved to `youtube-nocookie.com`.

**Duplicate `robots.txt` group.** `public/_robots.txt` was being *merged into*
the module's generated output by `@nuxtjs/robots`, producing two identical
`User-agent: *` blocks. Deleted; the module config is the single source.

**Into the Wild had no track durations.** All 10 added, read from the shipped
mp3s with `afinfo` (the method was validated against album 1's hand-entered
values: 8 of 9 exact, 1 off by a second from rounding). They now appear on the
album page and as `duration` in `MusicRecording`. Its `linerNotes` field
contained the single word "Released" and was removed.

**`AppFooter.vue` had zero internal links.** Now links home, both albums,
about, and the press kit — on every page.

**Bad copy.** The homepage description advertised "videos", removed two commits
earlier. `AboutPreview.vue`'s `latestReleaseLine` was hardcoded to "His debut
album … was released in 2025" but was handed the *latest* album's title, so it
announced Into the Wild as a 2025 debut — it was also never rendered. Now
derived from content, and rendered.

**`keywords` meta tag removed.** Google has ignored it since 2009.

---

## Deployment

`.output/public` is committed and is the deploy artifact, so **every change
requires `npm run generate` and a commit** — source changes alone ship nothing.

`better-sqlite3` was bumped `^12.6.2` → `^12.11.1` (already inside the existing
caret range; the lockfile was pinning the old version). 12.6.2 has no prebuilt
binary for Node 26 and fails to compile, so the project would not install.

Redirects and headers for Amplify: see `docs/amplify-redirects.md`. The four
`301`s need pasting into the Amplify console — until then `/music`, `/contact`,
`/press`, and `/influences-new` are served as `<meta http-equiv="refresh">`
files, which Google honours but treats as a weaker signal.

---

## Still worth doing

Roughly in order of expected value:

1. **The off-site profiles in `docs/seo-strategy.md`** — MusicBrainz and
   Wikidata above all. This is the actual bottleneck for the Maryland
   disambiguation, and no amount of on-site work substitutes for it.
2. **Write the ~15 remaining per-song stories.** The fields and rendering
   already exist; this is what makes the song pages defensible.
3. **More homepage copy.** 204 words is better than 112, still thin for the
   page carrying all three target queries.
4. **Surface album 1's liner notes.** ~250 words of good unique prose in
   `content/music/i-want-to-be-yours-and-other-songs.yml` that renders nowhere —
   the notes section was deliberately removed from the design, so this needs a
   design call rather than a code change.
5. **Add `uploadDate` to the `VideoObject`** in `app/pages/about.vue`. Required
   for video rich results; left out rather than guessed.
6. **No analytics and no Search Console verification in the repo.** There's
   currently no way to measure whether any of this worked.
7. **The origin-story page was deliberately skipped** to preserve the mystery
   around the name. Worth revisiting only if the mystery becomes less valuable
   than ranking for "havre de grace name/meaning" queries.
