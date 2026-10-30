<!--
  The homepage's body (Still Water, docs/redesign/mockups/home.html);
  pages/index.vue keeps the page's SEO. The record, the letter, About and the
  discography, all on bone, parted by a hairline that opens round a small
  diamond (chosen on 2026-10-30 over a mist band, four other treatments and
  fifteen other marks).
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
      <NuxtLink v-if="record" :to="recordHref(record.slug)" class="hero__scroll">The record →</NuxtLink>
    </header>

    <section class="block">
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

    <div class="divider" aria-hidden="true">
      <svg viewBox="0 0 20 20"><path d="M10 1l9 9-9 9-9-9z" /></svg>
    </div>

    <section class="block">
      <div class="wrap person">
        <img src="/images/site/live-artichoke-1400.jpg" alt="Stefan playing an acoustic guitar on stage" loading="lazy" width="1400" height="1400">
        <div>
          <p class="eyebrow">About</p>
          <p class="person__text">{{ bioQuote }}</p>
          <NuxtLink to="/about" class="u-link">Read more</NuxtLink>
        </div>
      </div>
    </section>

    <div class="divider" aria-hidden="true">
      <svg viewBox="0 0 20 20"><path d="M10 1l9 9-9 9-9-9z" /></svg>
    </div>

    <section class="block" aria-labelledby="discography">
      <h2 id="discography" class="discography">Discography</h2>
      <div class="wrap records reveal-group">
        <NuxtLink v-for="album in albums" :key="album.slug" :to="recordHref(album.slug)" class="records__item">
          <img :src="lookFor(album.slug)?.cover ?? album.coverImage" :alt="album.coverAlt" loading="lazy" width="800" height="800">
          <span class="records__t">
            <b>{{ album.title }}</b>
            <span>{{ album.year }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { bioParagraphs } from '~~/shared/data/bio'
import { CURRENT_RECORD, currentLook, lookFor, recordHref } from '~/config/records'

const siteProfile = useSiteProfile()
const player = usePlayer()
const look = currentLook()

const { albums, latestAlbum } = await useHomeAlbums()

const record = computed(() =>
  albums.value.find((album) => album.slug === CURRENT_RECORD) ?? latestAlbum.value,
)

const recordPlaying = computed(() => Boolean(record.value) && player.isPlaying(record.value!.slug))
const heroLabel = computed(() => {
  if (!record.value || !player.isCurrent(record.value.slug) || !player.track.value) return 'Play the record'
  return player.playing.value ? `Playing · ${player.track.value.title}` : `Paused · ${player.track.value.title}`
})

// The bio's own pull quote, without its quotation marks.
const bioQuote = (bioParagraphs.find((p) => p.emphasis)?.text ?? '').replace(/^"|"$/g, '')
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
  font-family: var(--font-display);
  font-weight: 200;
  font-size: 15px;
  letter-spacing: 0.7em;
  text-indent: 0.7em;
  text-transform: uppercase;
}

.hero__title {
  font-family: var(--font-display);
  font-weight: 200;
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

.wrap {
  max-width: 1080px;
  margin: 0 auto;
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
  font-family: var(--font-display);
  font-weight: 300;
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

.discography {
  font-family: var(--font-display);
  margin-bottom: 64px;
  text-align: center;
  font-weight: 200;
  font-size: 16px;
  letter-spacing: 0.7em;
  text-indent: 0.7em;
  text-transform: uppercase;
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
  font-family: var(--font-display);
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

  .person,
  .records {
    grid-template-columns: 1fr;
    gap: 44px;
  }

  .hero img {
    transform: scale(1.22) !important;
  }
}

/* The hairline between sections, with the diamond in it. */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 56px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--rule);
}

/* Halfway between a blue mark and the line itself: the sea at half strength,
   a touch heavier than the 1px hairline. */
.divider svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: color-mix(in srgb, var(--sea) 55%, transparent);
}

.divider path {
  stroke-width: 1.2px;
  vector-effect: non-scaling-stroke;
}


@media (max-width: 640px) {
  .divider {
    padding: 0 20px;
  }
}
</style>
