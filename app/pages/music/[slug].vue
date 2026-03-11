<template>
  <article v-if="album" class="pb-24">
    <section class="page-container pt-[calc(var(--nav-height)+1.5rem)]">
      <NuxtLink to="/music" class="nav-link inline-block text-sm muted-text hover:text-[var(--color-accent)]">
        back to music
      </NuxtLink>
    </section>

    <AlbumHero :album="album" :formatted-release-date="formattedReleaseDate" />

    <AlbumScrollspyNav
      :sections="navSections"
      :active-section-id="activeSectionId"
      @navigate="scrollToSection"
    />

    <div class="page-container space-y-20 pb-10 pt-14 sm:pt-16">
      <Tracklist
        :tracks="album.tracklist"
        :show-lyrics-jump="hasLyrics"
        @jump-to-lyrics="handleTrackLyricsJump"
      />

      <LyricsViewer
        v-if="hasLyrics"
        ref="lyricsViewer"
        :tracks="lyricTracks"
      />

      <LinerNotes
        v-if="hasNotes"
        :notes="album.linerNotes"
        :images="album.linerNoteImages"
      />

      <AlbumVideos
        v-if="hasVideos"
        :videos="album.videos ?? []"
      />

      <AlbumCredits
        v-if="hasCredits"
        :credits="album.credits ?? []"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Album, LyricTrack } from '~~/shared/types'

interface ScrollSection {
  id: string
  label: string
}

const STICKY_SCROLL_OFFSET = 152

const route = useRoute()

definePageMeta({
  layout: 'dark',
  theme: 'dark',
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

const hasValue = (value?: string | null) => Boolean(value?.trim().length)

const formattedReleaseDate = computed(() => {
  if (!album.value?.releaseDate) {
    return null
  }

  const date = new Date(album.value.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return album.value.releaseDate
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const hasLyrics = computed(() => (album.value?.tracklist ?? []).some((track) => hasValue(track.lyrics)))

const lyricTracks = computed<LyricTrack[]>(() => (album.value?.tracklist ?? [])
  .flatMap((track, index) => (hasValue(track.lyrics)
    ? [{
      trackNumber: index + 1,
      title: track.title,
      duration: track.duration,
      lyrics: track.lyrics!.trim(),
    }]
    : [])))

const hasNotes = computed(() =>
  hasValue(album.value?.linerNotes) || Boolean(album.value?.linerNoteImages?.length))

const hasVideos = computed(() => Boolean(album.value?.videos?.length))
const hasCredits = computed(() => Boolean(album.value?.credits?.length))

const navSections = computed<ScrollSection[]>(() => {
  const sections: ScrollSection[] = [
    { id: 'art', label: 'Art' },
    { id: 'tracks', label: 'Tracks' },
  ]

  if (hasLyrics.value) {
    sections.push({ id: 'lyrics', label: 'Lyrics' })
  }

  if (hasNotes.value) {
    sections.push({ id: 'notes', label: 'Notes' })
  }

  if (hasVideos.value) {
    sections.push({ id: 'videos', label: 'Videos' })
  }

  if (hasCredits.value) {
    sections.push({ id: 'credits', label: 'Credits' })
  }

  return sections
})

const { activeSectionId } = useScrollspy(computed(() => navSections.value.map((section) => section.id)))

const lyricsViewer = ref<{ openTrack: (trackNumber: number) => void } | null>(null)

const scrollToSection = (sectionId: string) => {
  if (!import.meta.client) {
    return
  }

  const section = document.getElementById(sectionId)
  if (!section) {
    return
  }

  const top = window.scrollY + section.getBoundingClientRect().top - STICKY_SCROLL_OFFSET
  window.scrollTo({
    top: Math.max(top, 0),
    behavior: 'smooth',
  })
}

const handleTrackLyricsJump = (trackNumber: number) => {
  if (!hasLyrics.value) {
    return
  }

  lyricsViewer.value?.openTrack(trackNumber)

  nextTick(() => {
    scrollToSection(`lyrics-track-${trackNumber}`)
  })
}
</script>
