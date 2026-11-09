<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Conman
        </h1>
      </header>

      <VisualizerPlayer :film="heistsFilm" name="The Heists" :score="CONMAN_SCORE" :poster-at="66" :beats="FILM_BEATS" :tests="TESTS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Conman: the heists on the Portland map (shared/video/films/conman-portland/heists.mjs). Notes: docs/visualizers/conman.md. */
import { CONMAN_SCORE } from '~/config/conmanScore'
import { heistsFilm, FILM_BEATS } from '~~/shared/video/films/conman-portland/heists.mjs'
import { MAP_TESTS } from '~~/shared/video/films/conman-portland/map.mjs'
import { SITE_TESTS } from '~~/shared/video/films/conman-portland/sites.mjs'
import { conmanHeistsFrame } from '~~/shared/video/films/conman-heists.mjs'

definePageMeta({ layout: 'default' })

/* Kept beside the film: the old film on the anchor town (the user, 2026-11-09), the tour of the new map, and the labelled sketch of where the five sites are. */
const TESTS = [
  { key: 'anchor', label: 'The old film · the anchor town', film: conmanHeistsFrame },
  ...MAP_TESTS,
  ...SITE_TESTS,
]
useHead({ title: 'Conman — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
