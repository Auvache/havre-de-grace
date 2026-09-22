<template>
  <!-- eslint-disable-next-line vue/no-v-html -- the markup is ours; see below -->
  <svg
    class="carto absolute inset-0 h-full w-full"
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    role="img"
    :aria-label="`Cartography music video for ${score.title} by ${score.artist}. Currently: ${frame.label}`"
    v-html="frame.svg"
  />
</template>

<script setup lang="ts">
/*
 * Cartography, running.
 *
 * The whole of this component is four lines: hand the clock to the style module
 * and put what comes back in the frame. There is no template full of <g>s here
 * — deliberately, and it is the thing worth understanding about this file.
 *
 * WHY A STRING AND NOT A TEMPLATE
 *
 * MusicVideoFilm.vue, the film this suite was drawn against, is six hundred
 * lines of Vue template driven by one big computed object. It works, and it
 * patches more cheaply per frame than this does. But a style written that way
 * can only ever run in a browser, inside Vue, on this page — so the still
 * reference sheet for the same style has to be written a second time in Node,
 * and the two drift the moment either is touched.
 *
 * shared/video/films/cartography.mjs is instead one pure function returning
 * markup, which means the same code draws the sheet at build time, draws the
 * film here sixty times a second, and can be walked frame by frame off-line to
 * write an mp4 — three outputs, one source, no version of the style that only
 * exists in one of them. That is worth a millisecond of innerHTML parse, and
 * the frame is ten to sixteen kilobytes, which is about a third of one.
 *
 * `v-html` is safe here in the way the rule cares about: every byte of it is
 * built by our own code out of our own score, and the one place a string from
 * outside enters — the lyric — is escaped by the kit's `esc` on the way in.
 */
import { cartographyFrame } from '~~/shared/video/films/cartography.mjs'
import { ANDALUSIA_SCORE } from '~/config/andalusiaScore'
import lockupRaw from '~~/public/logos/suite/a4-lockup-stacked.svg?raw'

const props = withDefaults(defineProps<{
  /** Seconds into the song. */
  t: number
  score?: typeof ANDALUSIA_SCORE
  /**
   * Prefix for every id in the frame. Three clips on one page share a document,
   * and `url(#route)` resolves to whichever route is first in it — so without
   * this the second clip's lyric is set along the first clip's road.
   */
  uid?: string
}>(), {
  score: () => ANDALUSIA_SCORE,
  uid: 'carto',
})

/*
 * The splash screen's mark, as markup rather than as an <image>.
 *
 * public/logos/suite is the source of truth for the brand. The width and height
 * are added because a nested <svg> with neither fills its whole viewport — here
 * 1600x900 — instead of the box the transform puts it in, and the baked `color`
 * is stripped so the mark takes the end card's foreground.
 */
const LOCKUP = lockupRaw
  .replace('<svg ', '<svg width="918" height="619.07" ')
  .replace(/ color="[^"]*"/, '')
  .replace(/ role="img"/, '')
  .replace(/ aria-label="[^"]*"/, '')
  .replace(/<title>.*?<\/title>/, '')

const score = computed(() => props.score)

const frame = computed(() => cartographyFrame({
  time: props.t,
  score: props.score,
  lockup: LOCKUP,
  uid: props.uid,
}))
</script>

<style scoped>
/*
 * Jost is the site's typeface and is already on the page, but @nuxt/fonts finds
 * a family by scanning stylesheets — a `font-family` attribute on an SVG <text>
 * is invisible to it. Declaring it here is what gets the faces served; the film
 * then sets weight per element, and CSS font matching sends its 600 up to the
 * 700 file, which is the same resolution the still sheets get.
 */
.carto {
  font-family: "Jost", system-ui, sans-serif;
  font-variant-ligatures: none;
  isolation: isolate;
}
</style>
