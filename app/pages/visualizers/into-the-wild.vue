<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Into the Wild
        </h1>
      </header>

      <VisualizerPlayer :film="mazeFrame" name="The Maze" :score="INTO_THE_WILD_SCORE" :poster-at="26" :beats="BEATS" :status="moodAt" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Into the Wild: the maze (shared/video/films/maze.mjs). Notes: docs/visualizers/into-the-wild.md. */
import { INTO_THE_WILD_SCORE } from '~/config/intoTheWildScore'
import { mazeFrame, moodAt } from '~~/shared/video/films/maze.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Into the Wild — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const BEATS = [
  { at: 0, label: 'Opening' },
  { at: 11, label: 'The way in' },
  { at: 29, label: 'A door' },
  { at: 58, label: 'Losing it' },
  { at: 108, label: 'Meltdown', key: true },
  { at: 141, label: 'Coming round', key: true },
  { at: 150, label: 'Sets out' },
  { at: 190, label: 'The anchor', key: true },
]
</script>
