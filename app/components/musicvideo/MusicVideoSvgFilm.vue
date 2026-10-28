<template>
  <svg
    class="svg-film absolute inset-0 h-full w-full"
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    role="img"
    :aria-label="`${name} music video for ${score.title} by ${score.artist}. Currently: ${frame.label}`"
  >
    <!-- A film's `lib`: defs that only ever grow, each chunk mounted once and never re-parsed. -->
    <!-- eslint-disable-next-line vue/no-v-html -- the markup is ours; see MusicVideoCartography.vue -->
    <g v-for="(chunk, i) in frame.lib ?? []" :key="i" v-html="chunk" />
    <!-- eslint-disable-next-line vue/no-v-html -- the markup is ours; see MusicVideoCartography.vue -->
    <g v-html="frame.svg" />
  </svg>
</template>

<script setup lang="ts">
/*
 * Any style module, running.
 *
 * MusicVideoCartography.vue is this component with one film baked in, and it
 * explains at length why a film is a string of SVG rather than a template. Once
 * there was more than one film, a copy of those four lines per style was five
 * files that could only differ by an import — so the frame function is a prop
 * instead. The contract is the one every module in shared/video/films/ keeps:
 * `frame({ time, score, lockup, uid }) → { svg, label }`, pure, no DOM.
 *
 * A film whose defs are heavy and steady may also return `lib`: an array of
 * <defs> chunks for that uid that only ever grows. Each chunk is its own
 * v-html, keyed by index, so a chunk is parsed once, when it first arrives,
 * and the frame's own markup is all that is replaced sixty times a second.
 */
import lockupRaw from '~~/public/logos/suite/a4-lockup-stacked.svg?raw'

interface FilmScore {
  title: string
  artist: string
}

type FrameFn = (options: { time: number, score: any, lockup: string, uid: string }) => { svg: string, label: string, lib?: string[] }

const props = defineProps<{
  /** A style module's frame function. */
  film: FrameFn
  /** The style's name, for the accessible label. */
  name: string
  score: FilmScore
  /** Seconds into the song. */
  t: number
  /** Prefix for every id in the frame — several clips share one document. */
  uid: string
}>()

/* The splash screen's mark, prepared the way MusicVideoCartography prepares it. */
const LOCKUP = lockupRaw
  .replace('<svg ', '<svg width="918" height="619.07" ')
  .replace(/ color="[^"]*"/, '')
  .replace(/ role="img"/, '')
  .replace(/ aria-label="[^"]*"/, '')
  .replace(/<title>.*?<\/title>/, '')

const frame = computed(() => props.film({
  time: props.t,
  score: props.score,
  lockup: LOCKUP,
  uid: props.uid,
}))
</script>

<style scoped>
/* See MusicVideoCartography.vue: declaring the family in CSS is what gets @nuxt/fonts to serve Jost. */
.svg-film {
  font-family: "Jost", system-ui, sans-serif;
  font-variant-ligatures: none;
  isolation: isolate;
}
</style>
