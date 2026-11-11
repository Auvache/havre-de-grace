<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Ghost
        </h1>
      </header>

      <VisualizerPlayer :film="danceCardFrame" name="The Dance Card" :score="GHOST_SCORE" :poster-at="119.6" :beats="DANCE_CARD_BEATS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Ghost: the dance card (shared/video/films/dance-card.mjs). Notes: docs/visualizers/ghost.md. */
import { GHOST_SCORE } from '~/config/ghostScore'
import { danceCardFrame, DANCE_CARD_BEATS } from '~~/shared/video/films/dance-card.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Ghost — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
