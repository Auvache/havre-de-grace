<!--
  The homepage, Still Water (docs/redesign/mockups/home.html).

  The current record's cover is the whole first screen with one play button.
  Below it: the record and its songs, a lyric, both records, Stefan, and the
  monthly letter. The record, its picture and its words come from
  app/config/records.ts and content/music, so a new record is a config change.
-->

<template>
  <div class="home">
    <header class="hero" data-hero data-nav-over>
      <img
        :src="look.hero.src"
        alt=""
        :style="{ objectPosition: look.hero.position, transform: `scale(${look.hero.scale ?? 1})` }"
        fetchpriority="high"
      >
      <div class="hero__center">
        <h1>{{ siteProfile.artistName }}</h1>
        <p class="hero__title">{{ record?.title ?? look.title }}</p>
        <button
          v-if="record"
          type="button"
          class="hero__play"
          @click="player.toggleAlbum(record)"
        >
          <span class="hero__btn" aria-hidden="true">
            <svg v-if="recordPlaying" viewBox="0 0 16 16"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
            <svg v-else viewBox="0 0 16 16"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
          </span>
          <span>{{ heroLabel }}</span>
        </button>
      </div>
      <a href="#music" class="hero__scroll">The record ↓</a>
    </header>

    <section v-if="record" id="music" class="block">
      <div class="wrap album">
        <div>
          <p class="eyebrow">{{ releaseLine }}</p>
          <h2 class="album__headline italic-title">{{ look.intro?.headline ?? record.title }}</h2>
          <p class="album__text">{{ look.intro?.text }}</p>
          <NuxtLink :to="`/music/${record.slug}`" class="u-link album__go">Enter the record</NuxtLink>
        </div>

        <ol class="tracks" :aria-label="`${record.title}, the songs`">
          <li v-for="(track, i) in tracks" :key="track.slug" :class="{ on: player.isCurrent(record.slug, i) }">
            <button type="button" @click="player.toggleAlbum(record, i)">
              <span class="tracks__n" aria-hidden="true">{{ player.isPlaying(record.slug, i) ? '▶' : String(track.number).padStart(2, '0') }}</span>
              <span class="tracks__t">{{ track.title }}</span>
              <span class="tracks__d">{{ track.durationLabel }}</span>
            </button>
          </li>
        </ol>
      </div>
    </section>

    <figure v-if="look.pullQuote" class="quote">
      <blockquote>
        <p>
          <span v-for="(line, i) in look.pullQuote.lines" :key="i" class="quote__line">{{ line }} </span>
        </p>
      </blockquote>
      <figcaption>{{ look.pullQuote.song }}</figcaption>
    </figure>

    <section class="block">
      <div class="wrap records">
        <NuxtLink v-for="album in albums" :key="album.slug" :to="`/music/${album.slug}`" class="records__item">
          <img :src="lookFor(album.slug)?.cover ?? album.coverImage" :alt="album.coverAlt" loading="lazy" width="800" height="800">
          <span class="records__t">
            <b>{{ album.title }}</b>
            <span>{{ album.year }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <section class="block block--tight">
      <div class="wrap person">
        <img src="/images/site/live-artichoke-1400.jpg" alt="Stefan playing an acoustic guitar on stage" loading="lazy" width="1400" height="1400">
        <div>
          <p class="eyebrow">{{ siteProfile.legalName }}</p>
          <p class="person__text">{{ bioQuote }}</p>
          <NuxtLink to="/about" class="u-link">About</NuxtLink>
        </div>
      </div>
    </section>

    <section class="block block--tight">
      <div class="wrap letter">
        <p class="eyebrow">Once a month</p>
        <h2 class="letter__h">Something new to listen to</h2>
        <p class="letter__text">
          A demo, an idea I'm working on, or a song that isn't out yet, and the story behind it.
          The first one is a 7-inch of two demos.
        </p>
        <NewsletterSignup label="Send it" centred class="letter__field" />
        <NuxtLink to="/letters" class="letter__more">the letters</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { bioParagraphs } from '~~/shared/data/bio'
import { toPlayerTracks } from '~/composables/useAlbumPlayer'
import { CURRENT_RECORD, currentLook, lookFor } from '~/config/records'
import { schemaId } from '~/utils/schema'

definePageMeta({
  layout: 'home',
  navOver: true,
})

const siteProfile = useSiteProfile()
const player = usePlayer()
const look = currentLook()

const { albums, latestAlbum } = await useHomeAlbums()

const record = computed(() =>
  albums.value.find((album) => album.slug === CURRENT_RECORD) ?? latestAlbum.value,
)
const tracks = computed(() => toPlayerTracks(record.value))

const recordPlaying = computed(() => Boolean(record.value) && player.isPlaying(record.value!.slug))
const heroLabel = computed(() => {
  if (!record.value || !player.isCurrent(record.value.slug) || !player.track.value) return 'Play the record'
  return player.playing.value ? `Playing · ${player.track.value.title}` : `Paused · ${player.track.value.title}`
})

const releaseLine = computed(() => {
  const iso = record.value?.releaseDate?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!iso) return `The new record · ${record.value?.year ?? ''}`
  const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  return `The new record · ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
})

// The bio's own pull quote, without its quotation marks.
const bioQuote = (bioParagraphs.find((p) => p.emphasis)?.text ?? '').replace(/^"|"$/g, '')

const pageDescription = computed(() => {
  if (!latestAlbum.value) {
    return `Havre De Grace is singer-songwriter Stefan Auvache Bradley. Albums, lyrics, credits, and booking.`
  }

  return `Havre De Grace is singer-songwriter Stefan Auvache Bradley. Hear the album "${latestAlbum.value.title}", read the lyrics, and get booking details.`
})

// The homepage is the page *about* the artist, so its WebPage node names the
// MusicGroup as its mainEntity. This is the relationship the MusicGroup used to
// assert from its own side via `mainEntityOfPage`, which was wrong: that node
// renders on every page, so it pointed at a `/#webpage` @id that only exists here.
const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': schemaId.artist(siteUrl) },
  }),
])

usePageSeo({
  // "Havre De Grace Music" leads so the exact target phrase (and the domain
  // name) sits at the front of the title.
  title: `Havre De Grace Music | Official`,
  description: pageDescription,
})
</script>

<style scoped>
.hero {
  position: relative;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  background: #aab6c2;
  color: #fff;
}

.hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.8);
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 28, 38, 0.18), rgba(20, 28, 38, 0) 30%, rgba(20, 28, 38, 0) 62%, rgba(20, 28, 38, 0.3));
}

.hero__center {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 40%;
  z-index: 2;
  text-align: center;
}

.hero h1 {
  font-weight: 200;
  font-size: 15px;
  letter-spacing: 0.7em;
  text-indent: 0.7em;
  text-transform: uppercase;
}

.hero__title {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(44px, 4.4vw, 64px);
  line-height: 1.1;
  margin-top: 22px;
}

.hero__play {
  margin-top: 34px;
  display: inline-flex;
  align-items: center;
  gap: 18px;
  font: inherit;
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #fff;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.hero__btn {
  width: 58px;
  height: 58px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: background-color var(--dur-fast) var(--ease-standard);
}

.hero__play:hover .hero__btn {
  background: rgba(255, 255, 255, 0.14);
}

.hero__btn svg {
  width: 16px;
  height: 16px;
}

.hero__scroll {
  position: absolute;
  bottom: 96px;
  left: 0;
  right: 0;
  z-index: 2;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  text-decoration: none;
}

.block {
  padding: 140px 56px;
}

.block--tight {
  padding-top: 20px;
}

.wrap {
  max-width: 1080px;
  margin: 0 auto;
}

#music {
  scroll-margin-top: 0;
}

.album {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 110px;
  align-items: start;
}

.album__headline {
  font-size: clamp(40px, 3.9vw, 56px);
  margin: 18px 0 26px;
}

.album__text {
  font-size: 17px;
  line-height: 1.75;
  color: color-mix(in srgb, var(--ink) 78%, var(--bone));
  max-width: 390px;
}

.album__go {
  margin-top: 30px;
}

.tracks {
  list-style: none;
  border-top: 1px solid var(--rule);
}

.tracks li {
  border-bottom: 1px solid var(--rule);
}

.tracks button {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  width: 100%;
  padding: 16px 0;
  font: inherit;
  font-size: 16px;
  font-weight: 300;
  text-align: left;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.tracks button:hover .tracks__t {
  color: var(--deep);
}

.tracks__n {
  color: var(--faint);
  font-size: 12px;
  letter-spacing: 0.1em;
  padding-top: 3px;
}

.tracks__d {
  color: var(--faint);
  font-size: 13px;
}

.tracks li.on {
  color: var(--deep);
}

.tracks li.on .tracks__n {
  color: var(--deep);
}

.quote {
  text-align: center;
  padding: 160px 56px;
  background: var(--mist);
}

.quote p {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(26px, 2.8vw, 40px);
  line-height: 1.4;
  max-width: 820px;
  margin: 0 auto;
  color: color-mix(in srgb, var(--ink) 90%, var(--bone));
}

.quote__line {
  display: block;
}

.quote figcaption {
  margin-top: 30px;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--sea);
}

.records {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
}

.records__item {
  display: grid;
  gap: 18px;
  text-decoration: none;
}

.records__item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.records__t {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.records__t b {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 30px;
  line-height: 1.15;
}

.records__t span {
  font-size: 12px;
  color: var(--faint);
  letter-spacing: 0.1em;
}

.records__item:hover b {
  color: var(--deep);
}

.person {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 100px;
  align-items: center;
}

.person img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 50% 35%;
  filter: grayscale(1) contrast(1.05);
}

.person__text {
  font-size: 18px;
  line-height: 1.8;
  color: color-mix(in srgb, var(--ink) 82%, var(--bone));
  max-width: 420px;
  margin: 22px 0 26px;
}

.letter {
  text-align: center;
}

.letter__h {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(34px, 3.2vw, 46px);
  margin: 18px 0;
  line-height: 1.15;
}

.letter__text {
  font-size: 16px;
  line-height: 1.7;
  color: var(--soft);
  max-width: 480px;
  margin: 0 auto;
}

.letter__field {
  margin-top: 48px;
  text-align: left;
}

.letter__more {
  display: inline-block;
  margin-top: 28px;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--soft);
}

@media (max-width: 640px) {
  .hero__scroll {
    bottom: 90px;
  }

  .block {
    padding: 80px 20px;
  }

  .block--tight {
    padding-top: 20px;
  }

  .album,
  .person,
  .records {
    grid-template-columns: 1fr;
    gap: 44px;
  }

  .quote {
    padding: 90px 24px;
  }

  /* On a phone the sung lines don't fit a line each: let them run on. */
  .quote__line {
    display: inline;
  }

  .hero img {
    transform: scale(1.22) !important;
  }
}
</style>
