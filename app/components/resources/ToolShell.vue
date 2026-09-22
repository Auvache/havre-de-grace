<!--
  The frame every tool page sits in: the way back to the hub, the title, the
  intro, and the mailing-list block at the foot.

  It exists so the three tools differ only where they actually differ — in the
  tool.
-->

<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-12">
      <header class="space-y-5">
        <NuxtLink :to="RESOURCES_BASE_PATH" class="rs-back rs-no-print">
          ← All tools
        </NuxtLink>

        <h1 class="rs-title">{{ tool.name }}</h1>

        <p class="max-w-2xl leading-relaxed muted-text">
          <slot name="intro">{{ tool.summary }}</slot>
        </p>

        <p class="label-text muted-text">
          Runs in your browser · nothing is sent anywhere
        </p>
      </header>

      <slot />

      <div class="rs-no-print border-t border-theme pt-10">
        <ToolEmailCta />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RESOURCES_BASE_PATH, type ResourceTool } from '~~/shared/data/resources'

defineProps<{
  tool: ResourceTool
}>()
</script>

<style scoped>
.rs-back {
  display: inline-block;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--theme-muted);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-standard);
}

.rs-back:hover {
  color: var(--color-accent);
}

.rs-title {
  font-size: clamp(2rem, 1.3rem + 1.9vw, 3.1rem);
  font-weight: 350;
  line-height: 1.05;
  max-width: 18ch;
}
</style>
