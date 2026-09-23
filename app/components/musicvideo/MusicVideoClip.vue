<template>
  <figure class="space-y-4">
    <div
      ref="stage"
      class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
      :style="{ aspectRatio: '16 / 9' }"
    >
      <!-- The film. Cartography unless the page hands in another style. -->
      <slot name="film" :t="frameTime" :uid="uid">
        <MusicVideoCartography :t="frameTime" :uid="uid" />
      </slot>

      <!-- The whole frame is the play button until it is playing. -->
      <button
        v-if="!clip.playing.value"
        type="button"
        class="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/10 transition-colors duration-200 hover:bg-black/0"
        :aria-label="`Play ${title}`"
        @click="clip.toggle()"
      >
        <span class="flex items-center gap-3 rounded-full bg-black/55 px-5 py-2.5 text-white backdrop-blur-sm">
          <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span class="label-text text-[0.58rem]">
            {{ clip.progress.value > 0.01 ? 'Resume' : `Play ${Math.round(to - from)}s` }}
          </span>
        </span>
      </button>
    </div>

    <!-- ── Transport ────────────────────────────────────────────────── -->
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="shrink-0 cursor-pointer text-[color:var(--color-accent)]"
        :aria-label="clip.playing.value ? 'Pause' : 'Play'"
        @click="clip.toggle()"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
          <path v-if="clip.playing.value" d="M6 5h4v14H6zm8 0h4v14h-4z" />
          <path v-else d="M8 5v14l11-7z" />
        </svg>
      </button>

      <!--
        The bar is a range input rather than a div with a click handler: it
        arrives keyboard-operable, it is draggable on a phone without any touch
        code, and a screen reader reads it as the position control it is.
      -->
      <input
        :value="clip.progress.value"
        type="range"
        min="0"
        max="1"
        step="0.001"
        class="min-w-0 flex-1 accent-[color:var(--color-accent)]"
        :aria-label="`Position in ${title}`"
        @input="clip.scrub(Number(($event.target as HTMLInputElement).value))"
      >

      <p class="w-24 shrink-0 text-right font-mono text-xs muted-text">
        {{ stamp(clip.time.value) }}
      </p>

      <button
        type="button"
        class="label-text shrink-0 cursor-pointer text-[0.58rem]"
        :class="clip.muted.value ? 'muted-text' : 'text-[color:var(--color-accent)]'"
        @click="clip.muted.value = !clip.muted.value"
      >
        {{ clip.muted.value ? 'Muted' : 'Sound' }}
      </button>

      <button
        type="button"
        class="label-text shrink-0 cursor-pointer text-[0.58rem] muted-text"
        @click="toggleFullscreen"
      >
        Full
      </button>
    </div>

    <figcaption class="space-y-1">
      <p class="label-text">
        {{ title }}
        <span class="ml-2 font-mono text-[0.62rem] normal-case tracking-normal muted-text">
          {{ stamp(from) }}–{{ stamp(to) }}
        </span>
      </p>
      <p class="text-sm leading-relaxed muted-text">
        <slot />
      </p>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
/*
 * One snippet: a stage, a transport, and a caption.
 *
 * The clip owns a window of the record — `from` to `to` in song seconds, not
 * clip seconds — and the film inside it is handed the song's own clock
 * untranslated. That is what "synced to Andalusia" means here: second 78.1 of
 * this component is second 78.1 of the master, so a snippet cannot be in sync
 * with itself and out of sync with the song.
 *
 * The film is a slot, with the clip's clock and uid handed out to it, so a page
 * can put any style in the stage — see /music-videos/into-the-wild-styles, which runs
 * five of them through MusicVideoSvgFilm. With no slot it is Cartography.
 */
import { ANDALUSIA_SCORE } from '~/config/andalusiaScore'

const props = defineProps<{
  title: string
  /** Seconds into the song. */
  from: number
  to: number
  /**
   * The frame to hold before anyone presses play. A clip that opens on the
   * first frame of its window often opens on an empty chart, and a video that
   * looks like a blank rectangle until you play it does not get played.
   */
  posterAt: number
  uid: string
  /** The record the window is cut from. Andalusia, which the clips were first built for, unless given. */
  src?: string
}>()

const clip = useFilmClip({
  src: props.src ?? ANDALUSIA_SCORE.src,
  from: props.from,
  to: props.to,
})

const stage = useTemplateRef<HTMLElement>('stage')

const frameTime = computed(() =>
  !clip.playing.value && clip.progress.value < 0.005 ? props.posterAt : clip.time.value,
)

const stamp = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, '0')}`

const toggleFullscreen = () => {
  const element = stage.value
  if (!element) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void element.requestFullscreen?.()
}
</script>
