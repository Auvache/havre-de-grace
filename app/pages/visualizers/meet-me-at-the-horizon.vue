<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Meet Me at the Horizon
        </h1>
      </header>

      <!-- Two whole films, until one is picked (?film=monkey-brain). -->
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-2" role="group" aria-label="Film">
        <span class="label-text text-[0.6rem] muted-text">Film</span>
        <button
          v-for="option in FILMS"
          :key="option.key"
          type="button"
          class="label-text cursor-pointer text-[0.6rem] transition-colors duration-150 hover:text-[color:var(--color-accent)]"
          :class="option.key === shown.key ? 'text-[color:var(--color-accent)] underline underline-offset-4' : ''"
          :aria-pressed="option.key === shown.key"
          @click="pick(option.key)"
        >
          {{ option.name }}
        </button>
      </div>

      <VisualizerPlayer
        :key="shown.key"
        :film="shown.film"
        :name="shown.name"
        :score="MEET_ME_AT_THE_HORIZON_SCORE"
        :poster-at="shown.posterAt"
        :beats="shown.beats"
        :status="shown.status"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * Meet Me at the Horizon: two films of one night, Constellations
 * (shared/video/films/constellations.mjs) and Monkey Brain
 * (shared/video/films/monkey-brain.mjs), both whole, until one is picked.
 * Notes: docs/visualizers/meet-me-at-the-horizon.md.
 */
import { MEET_ME_AT_THE_HORIZON_SCORE } from '~/config/meetMeAtTheHorizonScore'
import { constellationsFrame, CONSTELLATIONS_BEATS, CONSTELLATIONS_POSTER } from '~~/shared/video/films/constellations.mjs'
import { monkeyBrainFrame, monkeyBrainStateAt, MONKEY_BRAIN_BEATS, MONKEY_BRAIN_POSTER } from '~~/shared/video/films/monkey-brain.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Meet Me at the Horizon — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface FilmOption { key: string, name: string, film: typeof constellationsFrame, beats: typeof CONSTELLATIONS_BEATS, posterAt: number, status?: (time: number) => string }

const FILMS: FilmOption[] = [
  { key: 'constellations', name: 'Constellations', film: constellationsFrame, beats: CONSTELLATIONS_BEATS, posterAt: CONSTELLATIONS_POSTER },
  { key: 'monkey-brain', name: 'Monkey Brain', film: monkeyBrainFrame, beats: MONKEY_BRAIN_BEATS, posterAt: MONKEY_BRAIN_POSTER, status: (t) => monkeyBrainStateAt(MEET_ME_AT_THE_HORIZON_SCORE, t) },
]

/*
 * Chosen after mount, from ?film=: the page is prerendered without a query, so
 * reading it during hydration would draw one film on the server and the other
 * in the browser.
 */
const route = useRoute()
const router = useRouter()
const key = ref(FILMS[0]!.key)
const shown = computed(() => FILMS.find((f) => f.key === key.value) ?? FILMS[0]!)
const read = () => {
  const q = route.query.film
  key.value = FILMS.some((f) => f.key === q) ? String(q) : FILMS[0]!.key
}
const pick = (next: string) => {
  key.value = next
  const query = { ...route.query }
  if (next === FILMS[0]!.key) delete query.film
  else query.film = next
  void router.replace({ query })
}
onMounted(read)
watch(() => route.query.film, read)
</script>
