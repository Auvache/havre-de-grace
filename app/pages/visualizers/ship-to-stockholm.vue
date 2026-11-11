<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Ship to Stockholm
        </h1>
      </header>

      <VisualizerPlayer :film="roadTripFrame" name="The Road Trip" :score="SHIP_TO_STOCKHOLM_SCORE" :poster-at="ROAD_TRIP_POSTER" :beats="ROAD_TRIP_BEATS" :status="roadTripStatus" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Ship to Stockholm: the road trip (shared/video/films/road-trip.mjs). Notes: docs/visualizers/ship-to-stockholm.md. */
import { SHIP_TO_STOCKHOLM_SCORE } from '~/config/shipToStockholmScore'
import { roadTripFrame, roadTripStatus, ROAD_TRIP_BEATS, ROAD_TRIP_POSTER } from '~~/shared/video/films/road-trip.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Ship to Stockholm — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
