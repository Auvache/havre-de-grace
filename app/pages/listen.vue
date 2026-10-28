<template>
  <RecordPlayer
    :albums="albums"
    heading="Listen to Havre De Grace free on digital vinyl"
    :intro-lines="[
      'Listen to all of my music, right here, for free.',
      'Move the needle to play the record.',
      'Switch albums in the bottom bar.',
    ]"
  >
    <!-- The sleeve: every record on the shelf with its tracklist, as text. The
         rack is cover art and the tracks only surface once a record is playing,
         so without this the page would be server-rendered as images and
         controls — nothing for a screen reader to read out, and nothing for a
         search engine to index. Visually hidden rather than shown: the scene
         already presents all of this, just not as words. The links are kept out
         of the tab order so a sighted keyboard user never lands on something
         invisible; a screen reader still reaches them, and crawlers follow them
         to the album and song pages. -->
    <section class="sr-only" aria-labelledby="sleeve-title">
      <h2 id="sleeve-title">Albums on the record player</h2>
      <article v-for="a in albums" :key="a.slug">
        <h3>
          <NuxtLink :to="`/music/${a.slug}`" tabindex="-1">{{ a.title }}</NuxtLink> ({{ a.year }})
        </h3>
        <ol>
          <li v-for="t in a.tracks" :key="t.number">
            <NuxtLink v-if="t.songPath" :to="t.songPath" tabindex="-1">{{ t.title }}</NuxtLink>
            <template v-else>{{ t.title }}</template>
            · Side {{ t.side.toUpperCase() }} · {{ t.durationLabel }}
          </li>
        </ol>
      </article>
    </section>
  </RecordPlayer>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import type { ListenAlbum } from '~/utils/listenAlbums'
import { buildListenAlbums } from '~/utils/listenAlbums'
import { compact, schemaId, toolSchema } from '~/utils/schema'

definePageMeta({ layout: 'listen' })

/*
 * /listen — every album on the record player (components/listen/RecordPlayer),
 * plus what only this page needs: the text sleeve and its search presence.
 */

const { data } = await useAsyncData('listen-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return buildListenAlbums(items)
})
const albums = computed<ListenAlbum[]>(() => data.value ?? [])

/** Newest first (see buildListenAlbums), so the head of the list is the latest release. */
const latest = computed(() => albums.value[0] ?? null)

// --- search ---------------------------------------------------------------
// Indexed. What it has to rank with is the sleeve above (the whole catalogue
// as text, linked through to every album and song page), the intro card, and
// the structured data below. The queries it is for are the ones only this page
// answers: listening to Havre De Grace free, in full, on a record player.
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()

const { canonicalUrl } = usePageSeo({
  title: 'Listen Free on Digital Vinyl | Havre De Grace',
  description: computed(() => (latest.value
    ? `Play every Havre De Grace album free on an online record player, starting with ${latest.value.title}. Drop the needle, flip to side B, read the lyrics as it plays.`
    : 'Play every Havre De Grace album free on an online record player. Drop the needle, flip to side B, read the lyrics as it plays.')),
  path: '/listen',
})

/*
 * The player is the page's main entity, described as a free web app. Each album on the shelf carries the same @id its
 * own page uses, so it is the one MusicAlbum entity rather than a second copy
 * — and what this page adds to it is a ListenAction: the album can be heard,
 * free, at /listen#<slug>.
 *
 * The albums sit inside an ItemList rather than as top-level graph nodes.
 * @unhead/schema-org keys top-level nodes by the fragment alone
 * (resolveAsGraphKey keeps everything from the last "#"), so two albums both
 * ending "#album" collapse into one. Nested nodes are left alone.
 */
useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': `${canonicalUrl.value}#tool` },
    about: albums.value.map((a) => ({ '@id': schemaId.album(toAbsoluteUrl(`/music/${a.slug}`)) })),
  }),
  toolSchema({
    tool: {
      name: 'Havre De Grace record player',
      summary: 'An online record player for every Havre De Grace album. Drop the needle anywhere on the side, flip the record, switch albums, and read the lyrics and liner notes as it plays. Free, no sign-up.',
    },
    canonicalUrl: canonicalUrl.value,
    siteUrl,
    category: 'MultimediaApplication',
  }),
  {
    '@type': 'ItemList',
    '@id': `${canonicalUrl.value}#shelf`,
    name: 'Albums on the record player',
    numberOfItems: albums.value.length,
    itemListElement: albums.value.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: compact({
        '@type': 'MusicAlbum',
        '@id': schemaId.album(toAbsoluteUrl(`/music/${a.slug}`)),
        name: a.title,
        url: toAbsoluteUrl(`/music/${a.slug}`),
        image: toAbsoluteUrl(a.coverImage),
        datePublished: a.releaseDate,
        byArtist: { '@id': schemaId.artist(siteUrl) },
        numTracks: a.tracks.length,
        potentialAction: {
          '@type': 'ListenAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${canonicalUrl.value}#${a.slug}`,
            actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
          },
          expectsAcceptanceOf: {
            '@type': 'Offer',
            category: 'free',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      }),
    })),
  },
])
</script>
