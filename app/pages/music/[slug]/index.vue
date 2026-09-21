<template>
  <article v-if="album" class="album">
    <!--
      Unreleased albums show only the cover art and a "Coming <date>" title.
      The full track/lyrics/credits data is kept in the content file and renders
      automatically once the release date has passed.
    -->
    <template v-if="isUpcoming">
      <section class="page-container pt-[calc(var(--chrome-height)+1.5rem)]">
        <NuxtLink to="/#music" class="nav-link inline-block text-sm muted-text hover:text-[var(--color-accent)]">
          back to home
        </NuxtLink>
      </section>

      <section class="page-container flex flex-col items-center pb-16 pt-8 text-center md:pt-12">
        <NuxtImg
          :src="album.coverImage"
          :alt="album.coverAlt"
          class="w-full max-w-md rounded-[var(--radius-lg)] object-cover shadow-[0_18px_40px_color-mix(in_srgb,var(--theme-text)_24%,transparent)]"
          width="1400"
          height="1400"
          sizes="(max-width: 768px) 100vw, 448px"
          format="webp,avif"
          loading="eager"
          fetchpriority="high"
        />
        <h1 class="mt-10 text-balance text-2xl font-medium sm:text-3xl">
          {{ comingLabel }}
        </h1>
      </section>
    </template>

    <template v-else>
      <!-- The cover, blown up and blurred behind everything. It is the only
           light source in the scene, and it breathes when the record plays. -->
      <div
        class="album-wash"
        aria-hidden="true"
        :class="{ live: player.playing.value }"
        :style="{ backgroundImage: `url(${album.coverImage})` }"
      />
      <div class="album-veil" aria-hidden="true" />

      <div class="page-container album-inner">
        <NuxtLink to="/#music" class="nav-link inline-block pt-[calc(var(--chrome-height)+1.5rem)] text-sm muted-text hover:text-[var(--color-accent)]">
          back to home
        </NuxtLink>

        <header class="album-head">
          <p class="label-text album-eyebrow">
            {{ formattedReleaseDate }} · {{ trackRows.length }} songs<span v-if="totalLabel"> · {{ totalLabel }}</span>
          </p>
          <h1 class="album-title">{{ album.title }}</h1>
          <p v-if="album.description" class="album-blurb">
            <RichText :text="album.description" />
          </p>
          <StreamingLinks :links="heroLinks" class="album-streaming" />
          <p v-if="usingLeadSingleLinks" class="album-lead-note">
            {{ album.leadSingle?.title }} — the first single from the record.
          </p>
        </header>

        <!-- ---------- the stage ---------- -->
        <section v-if="hasPlayableTracks" id="player" class="stage" :class="{ loaded: Boolean(player.track.value) }">
          <div class="stage-art">
            <NuxtImg
              :src="album.coverImage"
              :alt="album.coverAlt"
              class="stage-cover"
              width="1400"
              height="1400"
              sizes="(max-width: 900px) 78vw, 420px"
              format="webp,avif"
              loading="eager"
              fetchpriority="high"
            />
            <!-- A record sliding out from behind the sleeve, only once one is
                 actually loaded. It spins while the audio is running. -->
            <div class="stage-disc" :class="{ spinning: player.playing.value }" aria-hidden="true">
              <span class="stage-disc-label" />
            </div>
          </div>

          <div class="stage-copy">
            <p class="stage-kicker">
              {{ player.track.value
                ? `Track ${player.track.value.number} · Side ${player.track.value.side.toUpperCase()}`
                : 'Nothing playing' }}
            </p>
            <h2 class="stage-name">
              {{ player.track.value?.title ?? 'Pick a song' }}
            </h2>

            <div class="stage-transport">
              <PlayerScrubber
                :current-time="player.currentTime.value"
                :duration="player.duration.value"
                :label="player.track.value ? `Seek within ${player.track.value.title}` : 'Seek'"
                @seek="player.seek"
              />
              <div class="stage-clock">
                <span>{{ formatClock(player.currentTime.value) }}</span>
                <span>{{ formatClock(player.duration.value) }}</span>
              </div>
            </div>

            <div class="stage-buttons">
              <button type="button" class="st-btn" :disabled="!player.hasPrev.value" aria-label="Previous track" @click="player.prev()">
                ⏮
              </button>
              <button type="button" class="st-btn big" :aria-label="player.playing.value ? 'Pause' : 'Play'" @click="player.toggle()">
                <span v-if="player.loading.value">…</span>
                <span v-else>{{ player.playing.value ? '❚❚' : '▶' }}</span>
              </button>
              <button type="button" class="st-btn" :disabled="!player.hasNext.value" aria-label="Next track" @click="player.next()">
                ⏭
              </button>

              <TrackShareLink
                v-if="player.track.value"
                class="stage-share"
                :url="currentShareUrl"
                :title="player.track.value.title"
                label="Share this song"
              />
            </div>

            <p v-if="player.error.value" class="stage-error" role="status">
              {{ player.error.value }}
            </p>
          </div>
        </section>

        <!-- ---------- the running order ---------- -->
        <section id="tracks" class="order">
          <div class="order-head">
            <h2 class="section-heading">running order</h2>
            <span v-if="hasPlayableTracks" class="order-hint muted-text">
              click a title to play · the words open on the right
            </span>
          </div>

          <div v-for="side in sides" :key="side.key" class="order-side">
            <p v-if="sides.length > 1" class="order-side-label">side {{ side.key.toUpperCase() }}</p>
            <ol class="order-list">
              <li
                v-for="row in side.rows"
                :id="row.slug"
                :key="row.slug"
                class="order-item"
                :class="{ on: player.track.value?.slug === row.slug }"
              >
                <component
                  :is="row.playerIndex === null ? 'div' : 'button'"
                  :type="row.playerIndex === null ? undefined : 'button'"
                  class="order-row"
                  :aria-label="row.playerIndex === null
                    ? undefined
                    : `${player.track.value?.slug === row.slug && player.playing.value ? 'Pause' : 'Play'} ${row.title}`"
                  @click="row.playerIndex === null ? undefined : player.toggleTrack(row.playerIndex)"
                >
                  <span class="order-bars" aria-hidden="true">
                    <!-- Four bars that only animate on the playing track; on
                         every other row they sit flat and read as a glyph. -->
                    <i v-for="n in 4" :key="n" :style="{ animationDelay: `${n * 110}ms` }" />
                  </span>
                  <span class="order-title">{{ row.title }}</span>
                  <span v-if="row.durationLabel" class="order-time">{{ row.durationLabel }}</span>
                </component>

                <!--
                  Every song's own page, on every row and always in the markup.
                  This is the crawl path that gets /music/<album>/<song>
                  discovered and prerendered (see the prerender note in
                  nuxt.config.ts) — rendering it only for the open track would
                  mean zero song links in the prerendered HTML and twenty pages
                  that never get built.
                -->
                <NuxtLink
                  :to="`/music/${album.slug}/${row.slug}`"
                  class="order-about"
                  :aria-label="`About ${row.title}`"
                >
                  about
                </NuxtLink>
              </li>
            </ol>
          </div>
        </section>

        <!-- ---------- the vinyl door ---------- -->
        <NuxtLink v-if="isListenable" :to="vinylHref" class="door">
          <span class="door-disc" aria-hidden="true" />
          <span class="door-copy">
            <strong>Hear it on the digital vinyl</strong>
            <span>A dark room, one enormous record, and a needle you drop by hand.</span>
          </span>
          <span class="door-arrow" aria-hidden="true">→</span>
        </NuxtLink>

        <section v-if="hasCredits" id="credits" class="album-credits">
          <h2 class="section-heading">credits</h2>
          <dl>
            <div v-for="credit in album.credits" :key="`${credit.role}-${credit.name}`">
              <dt>{{ credit.role }}</dt>
              <dd>{{ credit.name }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- Rides just under the fixed header, on the right. Below the navbar in
           the stacking order (it is z-40 against the header's z-50) so it never
           covers the site navigation. -->
      <button
        type="button"
        class="notes-tab"
        :class="{ on: panelOpen }"
        :aria-expanded="panelOpen"
        aria-controls="song-details-panel"
        @click="panelOpen = !panelOpen"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" />
        </svg>
        <span class="notes-tab-label">Lyrics &amp; notes</span>
      </button>

      <SongDetailsPanel
        :open="panelOpen"
        :track="player.track.value"
        :album-title="album.title"
        :album-slug="album.slug"
        :album-credits="album.credits ?? []"
        :album-liner-notes="album.linerNotes"
        :share-url="currentShareUrl"
        @close="panelOpen = false"
      />
    </template>
  </article>
</template>

<script setup lang="ts">
/*
 * An album page — the record, played in the page.
 *
 * The cover is the light source: blown up and blurred behind everything, it
 * lifts when the audio is running, so the page is lit by the artwork of
 * whatever is on. The centre is a stage — one song named large, with the
 * transport under it — rather than a list you operate, and the running order
 * below is grouped by vinyl side, which is how the record is actually
 * sequenced (see `sides` in the content file).
 *
 * Two things this page has to keep doing regardless of how it looks:
 *
 *   1. Every track links to its own song page, always, in the server-rendered
 *      markup. Those pages are discovered by crawling this one.
 *   2. Everything the album's structured data needs comes off the full
 *      tracklist, not off the playable subset.
 *
 * Playback lives in useAlbumPlayer: one reused audio element, and a hash that
 * follows the selected song so the address bar is always a link to what you
 * are hearing.
 */
import type { Album } from '~~/shared/types'
import { stripEmphasis } from '~~/shared/utils/emphasis'
import { toSongRefs } from '~~/shared/utils/songSlug'
import { compact, schemaId, toIsoDuration } from '~/utils/schema'
import { isListenable as isAlbumListenable } from '~/utils/listenAlbums'
import { formatClock, toPlayerTracks, useAlbumPlayer } from '~/composables/useAlbumPlayer'

const route = useRoute()
const siteProfile = useSiteProfile()
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()

definePageMeta({
  layout: 'dark',
})

const slug = computed(() => route.params.slug as string)

const { data: album } = await useAsyncData(
  () => `music-album-${slug.value}`,
  async () => await queryCollection('music').where('slug', '=', slug.value).first() as Album | null,
)

if (!album.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Album not found',
  })
}

// Singles don't have a dedicated album page — they surface in a modal in the
// music section on the homepage.
if (album.value.isSingle) {
  await navigateTo('/#music', { redirectCode: 301 })
}

const hasValue = (value?: string | null) => Boolean(value?.trim().length)

// Parse a YYYY-MM-DD string as a local date so day-level comparisons and labels
// aren't shifted by the browser's timezone (a bare `new Date('2026-07-17')` is UTC).
const parseIsoDate = (value?: string | null) => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

// An album whose release date is still in the future shows a "coming soon"
// placeholder instead of its (not-yet-public) track, lyric, and credit details.
const isUpcoming = computed(() => {
  const date = parseIsoDate(album.value?.releaseDate)
  return date ? date.getTime() > Date.now() : false
})

const comingLabel = computed(() => {
  const date = parseIsoDate(album.value?.releaseDate)
  if (!date) {
    return 'Coming soon'
  }

  return `Coming ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
})

// A released album paints its own dark, cover-lit scene via the per-route
// gradient. An unreleased one is a bare placeholder with nothing to light it,
// so it uses the site's standard white background like every other page.
const { setTheme } = usePageTheme()
watchEffect(() => {
  if (isUpcoming.value) {
    setTheme('light', 'light-fjord')
  }
})

const formattedReleaseDate = computed(() => {
  const date = parseIsoDate(album.value?.releaseDate)
  if (!date) {
    return String(album.value?.year ?? '')
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

// Show a link to the interactive record player once the album is released and has audio.
const isListenable = computed(() => (album.value ? isAlbumListenable(album.value) : false))
const vinylHref = computed(() => `/listen#${slug.value}`)

// --- tracks ---------------------------------------------------------------

const songRefs = computed(() => (album.value ? toSongRefs(album.value) : []))

/** The playable subset, in album order. Drives the transport. */
const playerTracks = computed(() => toPlayerTracks(album.value))
const player = useAlbumPlayer(playerTracks)

const hasPlayableTracks = computed(() => playerTracks.value.length > 0)

const playerIndexBySlug = computed(
  () => new Map(playerTracks.value.map((track, index) => [track.slug, index])),
)

/*
 * The running order is built from every track, not from the playable ones.
 *
 * A track with no audio file still belongs in the running order and still has
 * a song page to link to — it just renders without a play control instead of
 * disappearing off the record.
 */
interface TrackRow {
  slug: string
  title: string
  durationLabel?: string
  side: 'a' | 'b'
  /** Index into the player's list, or null when the track has no audio. */
  playerIndex: number | null
}

const trackRows = computed<TrackRow[]>(() => songRefs.value.map(ref => ({
  slug: ref.slug,
  title: ref.track.title,
  durationLabel: ref.track.duration,
  side: album.value?.sides?.b?.includes(ref.trackNumber) ? 'b' : 'a',
  playerIndex: playerIndexBySlug.value.get(ref.slug) ?? null,
})))

// Only render a side that has songs on it — an album with no declared B side
// shouldn't grow an empty heading.
const sides = computed(() =>
  (['a', 'b'] as const)
    .map(key => ({ key, rows: trackRows.value.filter(row => row.side === key) }))
    .filter(side => side.rows.length > 0),
)

const totalLabel = computed(() => {
  const seconds = playerTracks.value.reduce((sum, track) => sum + track.durationSec, 0)
  return seconds > 0 ? `${Math.round(seconds / 60)} min` : ''
})

const hasCredits = computed(() => Boolean(album.value?.credits?.length))

/*
 * Before an album has its own streaming links, the hero shows the lead
 * single's — that single is the only thing there is to go and hear, and an
 * empty row of icons says nothing.
 */
const albumHasStreamingLinks = computed(() =>
  Object.values(album.value?.streamingLinks ?? {}).some(Boolean),
)

const usingLeadSingleLinks = computed(() =>
  !albumHasStreamingLinks.value && Boolean(album.value?.leadSingle),
)

const heroLinks = computed(() =>
  usingLeadSingleLinks.value
    ? album.value?.leadSingle?.streamingLinks ?? {}
    : album.value?.streamingLinks ?? {},
)

// --- the lyrics & notes panel ---------------------------------------------

const panelOpen = ref(false)

const currentShareUrl = computed(() =>
  player.track.value ? player.shareUrl(player.track.value.slug) : '',
)

/*
 * The panel stays closed on arrival, including on a per-song link.
 *
 * Opening it automatically was the first instinct and it is wrong: the panel
 * is modal, so a shared link would land the visitor on a blurred page behind a
 * scrim, hiding the artwork and the stage they were sent to see. The hash
 * already cues the song and names it on the stage; reading along is one press
 * away when they want it.
 */

// --- SEO ------------------------------------------------------------------

const pageDescription = computed(() => {
  if (!album.value) {
    return `Havre De Grace Music album page.`
  }

  if (isUpcoming.value) {
    const detail = hasValue(album.value.description) ? stripEmphasis(album.value.description) : comingLabel.value
    return `${album.value.title} by ${siteProfile.artistName}. ${detail}`
  }

  const trackCount = album.value.tracklist.length
  return `${album.value.title} by ${siteProfile.artistName} — the acoustic folk project of ${siteProfile.legalName}. All ${trackCount} tracks with full lyrics and credits, plus the album in digital vinyl format.`
})

const { canonicalUrl } = usePageSeo({
  title: computed(() => `${album.value?.title ?? 'Album'} by Havre De Grace | Lyrics & Credits`),
  description: pageDescription,
  type: 'music.album',
})

// MusicAlbum is this page's primary entity. Two things changed from the previous
// hand-rolled block: `byArtist` now *references* the single site-wide MusicGroup
// by @id instead of restating a partial copy of it, and the tracklist points at
// the per-song MusicRecording nodes on the song pages, so the album, its songs,
// and the artist form one connected graph. The streaming URLs are attached here
// too — they're the strongest corroboration that this release is real, and they
// were previously absent from the album markup entirely.
const albumStreamingUrls = computed(() =>
  Object.values(album.value?.streamingLinks ?? {}).filter((url): url is string => Boolean(url?.trim().length)),
)

useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': schemaId.album(canonicalUrl.value) },
  }),

  defineBreadcrumb({
    itemListElement: [
      { name: 'Music', item: '/#music' },
      { name: album.value.title, item: `/music/${slug.value}` },
    ],
  }),

  compact({
    '@type': 'MusicAlbum',
    '@id': schemaId.album(canonicalUrl.value),
    name: album.value.title,
    url: canonicalUrl.value,
    image: toAbsoluteUrl(album.value.ogImage ?? album.value.coverImage),
    datePublished: album.value.releaseDate,
    description: stripEmphasis(album.value.description),
    genre: siteProfile.genres,
    albumProductionType: 'https://schema.org/StudioAlbum',
    albumReleaseType: 'https://schema.org/AlbumRelease',
    byArtist: { '@id': schemaId.artist(siteUrl) },
    mainEntityOfPage: { '@id': `${canonicalUrl.value}#webpage` },
    sameAs: albumStreamingUrls.value,
    // Withhold the tracklist from structured data until the album is released.
    numTracks: isUpcoming.value ? undefined : album.value.tracklist.length,
    track: isUpcoming.value
      ? undefined
      : songRefs.value.map((ref) => compact({
          '@type': 'MusicRecording',
          '@id': schemaId.recording(toAbsoluteUrl(`/music/${slug.value}/${ref.slug}`)),
          name: ref.track.title,
          url: toAbsoluteUrl(`/music/${slug.value}/${ref.slug}`),
          position: ref.trackNumber,
          duration: toIsoDuration(ref.track.duration),
          byArtist: { '@id': schemaId.artist(siteUrl) },
        })),
  }),
])
</script>

<style scoped>
.album {
  position: relative;
  padding-bottom: 7rem;
  isolation: isolate;
}

/* --- the room --- */

.album-wash {
  position: fixed;
  inset: -10%;
  z-index: -2;
  background-position: center;
  background-size: cover;
  filter: blur(70px) saturate(160%);
  opacity: 0.55;
  transform: scale(1.05);
  transition: opacity 1.2s var(--ease-standard), transform 3s var(--ease-standard);
}

.album-wash.live {
  opacity: 0.78;
  transform: scale(1.14);
}

/*
 * Held deliberately short of opaque. The point of the wash is that the cover is
 * the only light in the room, so the veil's job is to buy contrast for the text
 * without putting the lights out — an opaque floor here turns the whole page
 * flat grey and the artwork stops reading at all.
 */
.album-veil {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(100% 72% at 50% 0%, transparent 8%, color-mix(in srgb, #060b12 66%, transparent) 76%),
    linear-gradient(180deg,
      color-mix(in srgb, #0a121b 30%, transparent) 0%,
      color-mix(in srgb, #06090e 82%, transparent) 90%);
}

.album-inner {
  position: relative;
}

/* --- head --- */

.album-head {
  display: flex;
  max-width: 44rem;
  flex-direction: column;
  gap: 1rem;
  padding-block: 3rem 1rem;
}

.album-eyebrow {
  color: color-mix(in srgb, var(--color-accent) 85%, #fff);
}

.album-title {
  font-size: clamp(2.8rem, 1.5rem + 5.4vw, 6rem);
  font-weight: 300;
  letter-spacing: -0.01em;
  line-height: 0.98;
}

.album-blurb {
  color: color-mix(in srgb, #ffffff 72%, transparent);
  font-size: 1rem;
  line-height: 1.75;
}

.album-streaming {
  margin-top: 0.4rem;
}

.album-lead-note {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.78rem;
}

/* --- stage --- */

.stage {
  display: grid;
  gap: 2.5rem;
  margin-top: 3.5rem;
  padding: 2rem;
  border: 1px solid color-mix(in srgb, #ffffff 12%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, #0b131c 62%, transparent);
  justify-items: center;
  text-align: center;
  scroll-margin-top: calc(var(--chrome-height) + 1.5rem);
}

@supports (backdrop-filter: blur(1px)) {
  .stage {
    backdrop-filter: blur(18px);
  }
}

@media (min-width: 900px) {
  .stage {
    grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
    align-items: center;
    justify-items: start;
    gap: 3.5rem;
    padding: 2.5rem 3rem;
    text-align: left;
  }
}

.stage-art {
  position: relative;
  width: min(100%, 22rem);
}

.stage-cover {
  position: relative;
  z-index: 2;
  width: 100%;
  border-radius: 0.3rem;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6);
}

/* The record peeks out to the right of the sleeve; on the loaded state it
   slides further out, which is the whole gesture. */
.stage-disc {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: grid;
  width: 88%;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at 50% 50%, #10161d 0 2px, #1c252f 2px 3.4px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  transform: translate(-50%, -50%);
  transition: transform 700ms var(--ease-standard);
}

/* Far enough to read as a record pulled out of its sleeve, not so far that it
   reaches the copy column — the text sits above it anyway (see .stage-copy),
   but a disc sliding under the title still muddies it. */
.stage.loaded .stage-disc {
  transform: translate(-30%, -50%);
}

.stage-disc-label {
  width: 32%;
  height: 32%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 70%, #16202b);
  box-shadow: inset 0 0 0 3px #0a0f14;
}

.stage-disc.spinning {
  animation: disc-spin 2.4s linear infinite;
}

@keyframes disc-spin {
  to { transform: translate(-30%, -50%) rotate(360deg); }
}

.stage-copy {
  /* Above the record. The disc is absolutely positioned out of .stage-art and
     would otherwise paint over the song title and the clock. */
  position: relative;
  z-index: 3;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 0.9rem;
}

.stage-kicker {
  color: color-mix(in srgb, var(--color-accent) 90%, #fff);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.stage-name {
  font-size: clamp(1.8rem, 1.1rem + 2.4vw, 3rem);
  font-weight: 300;
  line-height: 1.05;
}

.stage-transport {
  --scrubber-track: rgba(255, 255, 255, 0.16);
  --scrubber-fill: var(--color-accent);
  --scrubber-height: 4px;
  margin-top: 0.5rem;
}

.stage-clock {
  display: flex;
  justify-content: space-between;
  margin-top: 0.35rem;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
}

.stage-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.4rem;
}

@media (min-width: 900px) {
  .stage-buttons {
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
}

.st-btn {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  color: #fff;
  font-size: 0.78rem;
  transition: border-color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard);
}

.st-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.st-btn:disabled {
  opacity: 0.28;
}

.st-btn.big {
  width: 3.2rem;
  height: 3.2rem;
  border-color: transparent;
  background: var(--color-accent);
  color: #08121b;
  font-size: 0.95rem;
}

.st-btn.big:hover {
  background: #fff;
}

.stage-share {
  --share-color: rgba(255, 255, 255, 0.6);
  --share-color-hover: #fff;
  --share-border: rgba(255, 255, 255, 0.16);
  --share-border-hover: var(--color-accent);
  margin-left: 0.4rem;
}

.stage-error {
  color: #ff9c8f;
  font-size: 0.85rem;
}

/* --- running order --- */

.order {
  margin-top: 5rem;
  scroll-margin-top: calc(var(--chrome-height) + 2rem);
}

.order-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.order-hint {
  font-size: 0.75rem;
}

.order-side {
  margin-top: 2.5rem;
}

.order-side-label {
  margin-bottom: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.68rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.order-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  scroll-margin-top: calc(var(--chrome-height) + 2rem);
}

.order-row {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 1.6rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 0.2rem;
  text-align: left;
}

.order-bars {
  display: flex;
  height: 0.9rem;
  align-items: flex-end;
  gap: 2px;
}

.order-bars i {
  width: 2px;
  height: 30%;
  background: rgba(255, 255, 255, 0.3);
  transition: background-color var(--dur-fast) var(--ease-standard);
}

.order-row:hover .order-bars i {
  background: var(--color-accent);
}

.order-item.on .order-bars i {
  background: var(--color-accent);
  animation: order-bounce 900ms ease-in-out infinite alternate;
}

@keyframes order-bounce {
  from { height: 22%; }
  to { height: 100%; }
}

.order-title {
  min-width: 0;
  font-size: 1.05rem;
}

.order-item.on .order-title {
  color: var(--color-accent);
}

.order-time {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}

/*
 * Present on every row and in the markup at all times — it is the crawl path
 * to the song pages. It is quiet until the row is touched, so ten of them
 * don't compete with the titles, but it never leaves the accessibility tree
 * and it shows itself on keyboard focus.
 */
.order-about {
  flex-shrink: 0;
  padding: 0.2rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  opacity: 0;
  text-decoration: none;
  transition: opacity var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard);
}

.order-item:hover .order-about,
.order-item.on .order-about,
.order-about:focus-visible {
  opacity: 1;
}

.order-about:hover,
.order-about:focus-visible {
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--color-accent);
}

/* No hover on a touch screen, so the link is simply always visible there. */
@media (hover: none) {
  .order-about {
    opacity: 1;
  }
}

/* --- the door to /listen --- */

.door {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-top: 4.5rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-lg);
  background: linear-gradient(100deg, rgba(255, 255, 255, 0.05), transparent 70%);
  text-decoration: none;
  transition: border-color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard);
}

.door:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.door-disc {
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, var(--color-accent) 0 15%, transparent 15.5%),
    repeating-radial-gradient(circle at 50% 50%, #0d141b 0 2px, #1a232d 2px 3.2px);
  transition: transform 900ms var(--ease-standard);
}

.door:hover .door-disc {
  transform: rotate(360deg);
}

.door-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.2rem;
}

.door-copy strong {
  font-weight: 450;
  font-size: 1rem;
}

.door-copy span {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.82rem;
}

.door-arrow {
  color: var(--color-accent);
  font-size: 1.1rem;
}

/* --- credits --- */

.album-credits {
  margin-top: 4.5rem;
  scroll-margin-top: calc(var(--chrome-height) + 2rem);
}

.album-credits dl {
  display: grid;
  gap: 0.6rem;
  margin-top: 1.5rem;
}

.album-credits dt {
  font-size: 0.85rem;
  font-weight: 500;
}

.album-credits dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
}

/* --- the lyrics & notes tab --- */

.notes-tab {
  position: fixed;
  /* Rides directly under the fixed header (nav + mailing strip), which is what
     --chrome-height measures. */
  top: calc(var(--chrome-height) + 0.75rem);
  right: clamp(0.75rem, 3vw, 1.75rem);
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(8, 12, 17, 0.82);
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.76rem;
  letter-spacing: 0.04em;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
  transition: border-color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard);
}

@supports (backdrop-filter: blur(1px)) {
  .notes-tab {
    backdrop-filter: blur(12px);
  }
}

.notes-tab:hover,
.notes-tab.on {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 20%, rgba(8, 12, 17, 0.86));
  color: #fff;
}

.notes-tab svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Icon only on phones — the label would crowd the hamburger. */
@media (max-width: 639px) {
  .notes-tab-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .notes-tab {
    padding: 0.6rem;
  }

  .notes-tab svg {
    width: 1.15rem;
    height: 1.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .album-wash,
  .stage-disc,
  .door-disc {
    transition: none;
  }

  .stage-disc.spinning,
  .order-item.on .order-bars i {
    animation: none;
  }
}
</style>
