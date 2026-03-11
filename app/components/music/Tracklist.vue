<template>
  <section id="tracks" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="tracks" />

    <ol v-if="tracks.length" class="mt-8 space-y-7">
      <li
        v-for="(track, index) in tracks"
        :key="`${track.title}-${index}`"
        class="border-b border-theme pb-7"
      >
        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-2">
          <span class="text-sm muted-text">{{ String(index + 1).padStart(2, '0') }}.</span>

          <button
            v-if="showLyricsJump && hasLyrics(track.lyrics)"
            type="button"
            class="text-left text-lg transition-colors hover:text-[var(--color-accent)]"
            @click="$emit('jump-to-lyrics', index + 1)"
          >
            {{ track.title }}
          </button>

          <span v-else class="text-lg">{{ track.title }}</span>

          <span v-if="track.duration" class="text-sm muted-text">({{ track.duration }})</span>
        </div>
      </li>
    </ol>

    <p v-else class="mt-6 muted-text">
      Tracklist details are coming soon.
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Track } from '~~/shared/types'

withDefaults(defineProps<{
  tracks: Track[]
  showLyricsJump?: boolean
}>(), {
  showLyricsJump: true,
})

defineEmits<{
  'jump-to-lyrics': [trackNumber: number]
}>()

const hasLyrics = (lyrics?: string) => Boolean(lyrics?.trim().length)
</script>
