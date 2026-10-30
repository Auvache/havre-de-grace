<!--
  About (docs/redesign/mockups/about.html): the woods band, Stefan's own line as
  the lede, the bio from shared/data/bio.ts (which /about.md mirrors), a live
  photograph, the live performance, and the doors that left the nav.
-->

<template>
  <div>
    <ShorelineBand
      title="About"
      :sub="siteProfile.legalName"
      image="/images/site/woods-wide-2400.jpg"
      image-position="50% 22%"
    />

    <div class="reading">
      <p class="lede">“{{ lede }}”</p>

      <div class="prose-body">
        <p v-for="(paragraph, index) in body" :key="index">{{ paragraph.text }}</p>
      </div>

      <figure class="fig">
        <img src="/images/site/live-artichoke-1400.jpg" alt="Stefan Auvache Bradley playing an acoustic guitar on stage" width="1400" height="1400" loading="lazy">
        <figcaption>Artichoke Music, August 2026</figcaption>
      </figure>

      <div class="prose-body">
        <p>There is no AI anywhere in the music: every song is written, played and sung by a person.</p>
      </div>

      <div class="video">
        <iframe
          src="https://www.youtube-nocookie.com/embed/0JF4Pm_-mPs"
          title="Havre De Grace - Live Performance"
          loading="lazy"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>

      <nav class="doors" aria-label="More">
        <NuxtLink to="/influences">Influences</NuxtLink>
        <NuxtLink to="/press">Press kit</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { bioParagraphs } from '~~/shared/data/bio'
import { compact, schemaId } from '~/utils/schema'

definePageMeta({ navOver: true })

const siteProfile = useSiteProfile()

// Stefan's own line leads, without its quotation marks; the rest is the body.
const lede = (bioParagraphs.find((p) => p.emphasis)?.text ?? '').replace(/^"|"$/g, '')
const body = bioParagraphs.filter((p) => !p.emphasis)

const pageDescription = computed(() => `Havre De Grace is singer-songwriter Stefan Auvache Bradley. Bio, influences, press photos, and booking.`)

const { canonicalUrl } = usePageSeo({
  title: `About Havre De Grace | Stefan Auvache Bradley`,
  description: pageDescription,
  // The full press photo is 3024x1752 / 2.4 MB. Scrapers get a 1200-wide
  // derivative; the original stays available as a press-kit download.
  image: {
    src: '/press/media-pic-wide-og.jpg',
    width: 1200,
    height: 695,
    type: 'image/jpeg',
    alt: 'Havre De Grace press photo',
  },
  type: 'profile',
})

// This is the page about the person, so it's declared as the ProfilePage for the
// Person node defined site-wide in app.vue, and the live-performance embed gets
// a VideoObject. That video is titled "Havre De Grace - Live Performance" — the
// most on-the-nose entity signal the catalogue has — and it previously carried
// no markup at all.
const { siteUrl, toAbsoluteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    '@type': ['WebPage', 'ProfilePage'],
    mainEntity: { '@id': schemaId.person(siteUrl) },
  }),
  compact({
    '@type': 'VideoObject',
    '@id': `${canonicalUrl.value}#live-performance`,
    name: 'Havre De Grace - Live Performance',
    description: `${siteProfile.artistName} performing live — solo acoustic guitar and vocals.`,
    thumbnailUrl: 'https://i.ytimg.com/vi/0JF4Pm_-mPs/maxresdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/0JF4Pm_-mPs',
    contentUrl: 'https://www.youtube.com/watch?v=0JF4Pm_-mPs',
    // TODO: add `uploadDate` (ISO 8601) from the video's YouTube publish date.
    // Google requires it for video rich results; it's left out rather than
    // guessed, since a wrong date is worse than a missing one.
    image: toAbsoluteUrl('/press/media-pic-wide.jpg'),
    creator: { '@id': schemaId.artist(siteUrl) },
    mainEntityOfPage: { '@id': `${canonicalUrl.value}#webpage` },
  }),
])
</script>

<style scoped>
.fig {
  margin: 70px -160px;
}

.fig img {
  width: 100%;
  aspect-ratio: 16 / 8;
  object-fit: cover;
  object-position: 50% 35%;
  filter: grayscale(1);
}

.fig figcaption {
  margin-top: 12px;
  font-size: 13px;
  color: var(--faint);
  text-align: right;
}

.video {
  margin-top: 56px;
  aspect-ratio: 16 / 9;
  background: var(--mist);
}

.video iframe {
  width: 100%;
  height: 100%;
}

.doors {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 40px;
  margin-top: 60px;
  padding-top: 28px;
  border-top: 1px solid var(--rule);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.doors a {
  text-decoration: none;
}

.doors a:hover {
  color: var(--deep);
}

@media (max-width: 1100px) {
  .fig {
    margin: 56px 0;
  }
}
</style>
