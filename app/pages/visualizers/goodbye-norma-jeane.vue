<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Goodbye, Norma Jeane
        </h1>
      </header>

      <VisualizerPlayer :film="marqueeFrame" name="The Marquee" :score="GOODBYE_NORMA_JEANE_SCORE" :poster-at="moments.hooks[0]! + 1.6" :beats="BEATS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Goodbye, Norma Jeane: the marquee (shared/video/films/marquee.mjs). Notes: docs/visualizers/goodbye-norma-jeane.md. */
import { GOODBYE_NORMA_JEANE_SCORE } from '~/config/goodbyeNormaJeaneScore'
import { marqueeFrame, marqueeMoments } from '~~/shared/video/films/marquee.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Goodbye, Norma Jeane — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

/* Every moment is read off the film, so a retimed board moves these with it. */
const moments = marqueeMoments(GOODBYE_NORMA_JEANE_SCORE)

const BEATS = [
  { at: 0, label: 'Opening' },
  { at: 12, label: 'Norma Jeane', key: true },
  { at: moments.titles[0]!.at - 3, label: 'The first film' },
  { at: moments.clues[0]! - 1, label: 'Clue 1' },
  { at: moments.hooks[0]! - 1.5, label: 'Chorus 1', key: true },
  { at: moments.titles[15]!.at - 3, label: 'Break 2' },
  { at: moments.clues[1]! - 1, label: 'Clue 2' },
  { at: moments.hooks[1]! - 1.5, label: 'Chorus 2' },
  { at: moments.clues[2]! - 1, label: 'Clue 3' },
  { at: moments.piano - 1, label: 'The piano', key: true },
  { at: moments.hooks[2]! - 1.5, label: 'Last goodbye' },
  { at: moments.words.at(-1)!.at - 2, label: 'You wanted more' },
  { at: moments.finale - 3, label: 'Her name', key: true },
  { at: moments.last - 5, label: 'The end' },
]
</script>
