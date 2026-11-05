<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Andalusia
        </h1>
      </header>

      <VisualizerPlayer :film="cartographyAlbumFrame" name="The Chart" :score="ANDALUSIA_SCORE" :poster-at="9.8" :beats="BEATS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Andalusia: the chart (cartographyAlbumFrame in shared/video/films/cartography.mjs). Notes: docs/visualizers/andalusia.md. */
import { ANDALUSIA_SCORE } from '~/config/andalusiaScore'
import { cartographyAlbumFrame } from '~~/shared/video/films/cartography.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Andalusia — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

/* One per section, read off the score so a retimed record moves them with it. */
const BEATS = ANDALUSIA_SCORE.sections.map((section) => ({ at: section.from + 0.01, label: section.label }))
</script>
