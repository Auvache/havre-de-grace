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

      <VisualizerStills :ideas="VISUALIZER_STILLS['new-york']!" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* New York: no film yet, only the proposed stills. Notes: docs/visualizers/new-york.md. */
import { VISUALIZER_STILLS } from '~/config/visualizerStills'

definePageMeta({ layout: 'default' })
useHead({ title: 'New York — visualizer', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
