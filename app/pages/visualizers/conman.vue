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

      <VisualizerPlayer :film="conmanCityFrame" name="The City" :score="CONMAN_SCORE" :poster-at="66" :beats="BEATS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Conman: the city (shared/video/films/conman-city.mjs). Notes: docs/visualizers/conman.md. */
import { CONMAN_SCORE } from '~/config/conmanScore'
import { conmanCityFrame } from '~~/shared/video/films/conman-city.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Conman — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const BEATS = [
  { at: 0, label: 'Opening' },
  { at: 12, label: 'The record shop' },
  { at: 42, label: 'First getaway' },
  { at: 50, label: 'The counting house' },
  { at: 77, label: 'Chorus' },
  { at: 91, label: 'The studio' },
  { at: 122, label: 'Chorus' },
  { at: 135, label: 'The museum', key: true },
  { at: 160, label: 'To the hall' },
  { at: 165, label: 'The concert hall', key: true },
  { at: 188, label: 'The anchor', key: true },
]
</script>
