<template>
  <section id="credits" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="credits" />

    <div class="mt-8 space-y-3 text-left text-sm leading-7 muted-text">
      <p v-for="credit in credits" :key="`${credit.role}-${credit.name}`">
        <span class="font-medium text-[var(--theme-text)]">{{ credit.role }}:</span>
        {{ credit.name }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Credit } from '~~/shared/types'

defineProps<{
  credits: Credit[]
}>()
</script>
