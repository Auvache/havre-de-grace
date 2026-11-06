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

      <VisualizerPlayer :film="conmanHeistsFrame" name="The Heists" :score="CONMAN_SCORE" :poster-at="66" :beats="CONMAN_HEISTS_BEATS" />

      <VisualizerMotionTests title="The end chaos, three ways" :tests="CONMAN_FINALE_TESTS" :score="CONMAN_SCORE" :span="CONMAN_FINALE_WINDOW" :poster-at="200" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Conman: the heists (shared/video/films/conman-heists.mjs). Notes: docs/visualizers/conman.md. The motion tests are the finale, three ways, pending the user's pick. */
import { CONMAN_SCORE } from '~/config/conmanScore'
import { conmanHeistsFrame, CONMAN_HEISTS_BEATS, CONMAN_FINALE_TESTS, CONMAN_FINALE_WINDOW } from '~~/shared/video/films/conman-heists.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Conman — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
