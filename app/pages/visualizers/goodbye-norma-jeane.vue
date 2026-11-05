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

      <VisualizerPlayer :film="marqueeFrame" name="The Marquee" :score="GOODBYE_NORMA_JEANE_SCORE" :poster-at="moments.hooks[0]! + 0.6" :beats="BEATS" :tests="TESTS" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Goodbye, Norma Jeane: the marquee (shared/video/films/marquee.mjs). Notes: docs/visualizers/goodbye-norma-jeane.md. */
import { GOODBYE_NORMA_JEANE_SCORE } from '~/config/goodbyeNormaJeaneScore'
import { MARQUEE_TESTS, marqueeFrame, marqueeMoments } from '~~/shared/video/films/marquee.mjs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Goodbye, Norma Jeane — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

/* Every moment is read off the film, so a retimed board moves these with it. */
const moments = marqueeMoments(GOODBYE_NORMA_JEANE_SCORE)

/* The intensity tests of 2026-11-05, pending a pick (docs: "Intensity tests"). */
const TESTS = [
  { key: 'measured', label: 'Follows the record', film: MARQUEE_TESTS.measured.frame },
  { key: 'sections', label: 'Set by section', film: MARQUEE_TESTS.sections.frame },
  { key: 'pulse', label: 'Flashes on the beat', film: MARQUEE_TESTS.pulse.frame },
]

const BEATS = [
  { at: 0, label: 'Opening' },
  { at: moments.nj - 3, label: 'Norma Jeane' },
  { at: moments.titles[0]!.at - 2, label: 'The first film' },
  { at: moments.drops[0]! - 1.5, label: 'The first drop', key: true },
  { at: moments.clues[0]! - 2, label: 'Clue 1' },
  { at: moments.drops[1]! - 1.5, label: 'Chorus 1', key: true },
  { at: moments.mores[0]! - 3, label: 'More, more, more', key: true },
  { at: 124, label: 'Break 2' },
  { at: moments.clues[1]! - 2, label: 'Clue 2' },
  { at: moments.drops[2]! - 1.5, label: 'Chorus 2' },
  { at: moments.clues[2]! - 2, label: 'Clue 3', key: true },
  { at: moments.sgtg - 6, label: 'Something\'s Got to Give' },
  { at: moments.last - 5, label: 'The end' },
]
</script>
