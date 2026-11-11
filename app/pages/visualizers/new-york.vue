<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          New York
        </h1>
      </header>

      <VisualizerPlayer :film="grainFrame" name="Against the Grain" :score="NEW_YORK_SCORE" :poster-at="116.5" :beats="GRAIN_BEATS" :status="mood" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* New York: against the grain (shared/video/films/grain.mjs). Notes: docs/visualizers/new-york.md. */
import { NEW_YORK_SCORE } from '~/config/newYorkScore'
import { grainFrame, grainMood, GRAIN_BEATS } from '~~/shared/video/films/grain.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'New York — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const mood = (time: number) => grainMood(NEW_YORK_SCORE, time)
</script>
