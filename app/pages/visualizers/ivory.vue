<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Ivory
        </h1>
      </header>

      <VisualizerPlayer :film="blanksFrame" name="Five Blanks" :score="IVORY_SCORE" :poster-at="44" :beats="BEATS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Ivory: five blanks (shared/video/films/blanks.mjs). Notes: docs/visualizers/ivory.md. */
import { IVORY_SCORE } from '~/config/ivoryScore'
import { blanksFrame } from '~~/shared/video/films/blanks.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Ivory — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const BEATS = [
  { at: 0, label: 'Opening' },
  { at: 9, label: 'First sight' },
  { at: 40, label: 'Ivory', key: true },
  { at: 50, label: 'My mystery' },
  { at: 58, label: 'Getting close' },
  { at: 87, label: 'Her name', key: true },
  { at: 105, label: 'Just for me' },
  { at: 112.6, label: 'Interlude' },
  { at: 128, label: 'The last chance' },
  { at: 136, label: 'Breathe', key: true },
  { at: 150, label: 'Walks' },
  { at: 164, label: 'The answer', key: true },
  { at: 173, label: 'Five blanks', key: true },
]
</script>
