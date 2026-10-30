<!--
  About: the title, a live photograph, the bio from shared/data/bio.ts (which
  /about.md mirrors) in its own order, quote and all, and the full live set from
  Artichoke Music. Influences, the press kit and contact are in the footer.
-->

<template>
  <div>
    <ShorelineBand title="About" bare />

    <div class="reading">
      <figure class="fig">
        <img src="/images/site/live-artichoke-1400.jpg" alt="Stefan Auvache Bradley playing an acoustic guitar on stage" width="1400" height="1400" fetchpriority="high">
      </figure>

      <div class="prose-body">
        <p v-for="(paragraph, index) in bioParagraphs" :key="index">{{ paragraph.text }}</p>
        <p>You can get a taste of my music below.</p>
      </div>

      <div class="video">
        <iframe
          :src="LIVE_SET.embedUrl"
          :title="LIVE_SET.name"
          loading="lazy"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { bioParagraphs } from '~~/shared/data/bio'
import { compact, schemaId } from '~/utils/schema'

const siteProfile = useSiteProfile()

/** The whole Artichoke Music set, as one video on YouTube. */
const LIVE_SET = {
  id: 'm32W35b0SrQ',
  name: 'Full Set (Live at Artichoke Music) | Havre De Grace',
  embedUrl: 'https://www.youtube-nocookie.com/embed/m32W35b0SrQ',
}

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
// Person node defined site-wide in app.vue, and the live set gets a VideoObject.
const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    '@type': ['WebPage', 'ProfilePage'],
    mainEntity: { '@id': schemaId.person(siteUrl) },
  }),
  compact({
    '@type': 'VideoObject',
    '@id': `${canonicalUrl.value}#live-set`,
    name: LIVE_SET.name,
    description: `${siteProfile.artistName} live at Artichoke Music: the whole set, solo acoustic guitar and vocals.`,
    thumbnailUrl: `https://i.ytimg.com/vi/${LIVE_SET.id}/maxresdefault.jpg`,
    embedUrl: LIVE_SET.embedUrl,
    contentUrl: `https://www.youtube.com/watch?v=${LIVE_SET.id}`,
    duration: 'PT25M4S',
    // TODO: add `uploadDate` (ISO 8601) from the video's YouTube publish date.
    // Google requires it for video rich results; it's left out rather than
    // guessed, since a wrong date is worse than a missing one.
    creator: { '@id': schemaId.artist(siteUrl) },
    mainEntityOfPage: { '@id': `${canonicalUrl.value}#webpage` },
  }),
])
</script>

<style scoped>
.fig {
  margin-bottom: 40px;
}

.fig img {
  width: 100%;
  aspect-ratio: 16 / 8;
  object-fit: cover;
  object-position: 50% 35%;
  filter: grayscale(1);
}

.video {
  margin-top: 64px;
  aspect-ratio: 16 / 9;
  background: var(--mist);
}

.video iframe {
  width: 100%;
  height: 100%;
}
</style>
