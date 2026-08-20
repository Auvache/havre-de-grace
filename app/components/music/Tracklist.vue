<template>
  <section id="tracks" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="tracks" />

    <div v-if="tracks.length" class="mt-8 space-y-4">
      <article
        v-for="track in tracks"
        :id="`track-${track.trackNumber}`"
        :key="`track-${track.trackNumber}`"
        class="scroll-mt-[calc(var(--nav-height)+5.5rem)] rounded-[var(--radius-md)] border border-theme bg-[color-mix(in_srgb,var(--theme-surface)_88%,transparent)]"
      >
        <h3>
          <!-- Tracks without lyrics still list, they just don't expand. -->
          <component
            :is="hasLyrics(track) ? 'button' : 'div'"
            :type="hasLyrics(track) ? 'button' : undefined"
            class="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            :aria-expanded="hasLyrics(track) ? (openTrackNumber === track.trackNumber ? 'true' : 'false') : undefined"
            :aria-controls="hasLyrics(track) ? `track-panel-${track.trackNumber}` : undefined"
            @click="hasLyrics(track) ? toggleTrack(track.trackNumber) : undefined"
          >
            <span class="text-base sm:text-lg">
              {{ String(track.trackNumber).padStart(2, '0') }}. {{ track.title }}
              <span v-if="track.duration" class="ml-2 text-sm muted-text">({{ track.duration }})</span>
            </span>
            <span v-if="hasLyrics(track)" class="text-xs muted-text">
              {{ openTrackNumber === track.trackNumber ? 'Hide' : 'Show' }}
            </span>
          </component>
        </h3>
        <div
          v-if="hasLyrics(track)"
          v-show="openTrackNumber === track.trackNumber"
          :id="`track-panel-${track.trackNumber}`"
          class="border-t border-theme px-5 py-5"
        >
          <pre class="whitespace-pre-wrap font-sans text-sm leading-7 muted-text">{{ track.lyrics }}</pre>
        </div>
      </article>
    </div>

    <p v-else class="mt-6 muted-text">
      Tracklist details are coming soon.
    </p>
  </section>
</template>

<script setup lang="ts">
import type { LyricTrack } from '~~/shared/types'

const props = defineProps<{
  tracks: LyricTrack[]
}>()

const hasLyrics = (track: LyricTrack) => Boolean(track.lyrics?.trim().length)

// 0 means every track is collapsed, which is the default on load and whenever
// the album (and so the track list) changes.
const openTrackNumber = ref(0)

watch(() => props.tracks, () => {
  openTrackNumber.value = 0
})

const toggleTrack = (trackNumber: number) => {
  openTrackNumber.value = openTrackNumber.value === trackNumber ? 0 : trackNumber
}
</script>
