<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-3">
        <NuxtLink to="/visualizers" class="label-text muted-text hover:underline">
          Visualizers
        </NuxtLink>
        <h1 class="display-heading">
          Rocks in the Sea
        </h1>
      </header>

      <VisualizerStills :ideas="VISUALIZER_STILLS['rocks-in-the-sea']!" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* Rocks in the Sea: no film yet, only the proposed stills. Notes: docs/visualizers/rocks-in-the-sea.md. */
import { VISUALIZER_STILLS } from '~/config/visualizerStills'

definePageMeta({ layout: 'default' })
useHead({ title: 'Rocks in the Sea — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
