<template>
  <section id="lyrics" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="lyrics" />

    <div class="mt-8 space-y-4">
      <article
        v-for="track in tracks"
        :id="`lyrics-track-${track.trackNumber}`"
        :key="`lyrics-track-${track.trackNumber}`"
        class="scroll-mt-[calc(var(--nav-height)+5.5rem)] rounded-[var(--radius-md)] border border-theme bg-[color-mix(in_srgb,var(--theme-surface)_88%,transparent)]"
      >
        <h3>
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            :aria-expanded="openTrackNumber === track.trackNumber ? 'true' : 'false'"
            :aria-controls="`lyrics-panel-${track.trackNumber}`"
            @click="toggleTrack(track.trackNumber)"
          >
            <span class="text-base sm:text-lg">
              {{ String(track.trackNumber).padStart(2, '0') }}. {{ track.title }}
              <span v-if="track.duration" class="ml-2 text-sm muted-text">({{ track.duration }})</span>
            </span>
            <span class="text-xs muted-text">
              {{ openTrackNumber === track.trackNumber ? 'Hide' : 'Show' }}
            </span>
          </button>
        </h3>
        <div
          v-show="openTrackNumber === track.trackNumber"
          :id="`lyrics-panel-${track.trackNumber}`"
          class="border-t border-theme px-5 py-5"
        >
          <pre class="whitespace-pre-wrap font-sans text-sm leading-7 muted-text">{{ track.lyrics }}</pre>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LyricTrack } from '~~/shared/types'

const props = defineProps<{
  tracks: LyricTrack[]
}>()

const openTrackNumber = ref(0)

watch(
  () => props.tracks,
  (tracks) => {
    if (!tracks.length) {
      openTrackNumber.value = 0
      return
    }

    const currentStillExists = tracks.some((track) => track.trackNumber === openTrackNumber.value)
    if (!currentStillExists) {
      openTrackNumber.value = tracks[0].trackNumber
    }
  },
  { immediate: true },
)

const toggleTrack = (trackNumber: number) => {
  openTrackNumber.value = openTrackNumber.value === trackNumber ? 0 : trackNumber
}

const openTrack = (trackNumber: number) => {
  openTrackNumber.value = trackNumber
}

defineExpose({
  openTrack,
})
</script>
