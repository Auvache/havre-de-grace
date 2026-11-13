<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-14">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Ivory
        </h1>
      </header>

      <VisualizerPlayer :film="crosswordFrame" name="The Crossword" :score="IVORY_SCORE" :poster-at="60" :beats="CROSSWORD_BEATS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Ivory: the crossword (shared/video/films/crossword.mjs). Notes: docs/visualizers/ivory.md. */
import { IVORY_SCORE } from '~/config/ivoryScore'
import { crosswordFrame, CROSSWORD_BEATS } from '~~/shared/video/films/crossword.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Ivory — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
