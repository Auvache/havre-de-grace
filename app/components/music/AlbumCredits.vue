<template>
  <section id="credits" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="credits" />

    <ul class="mt-8 grid gap-3 text-sm leading-7 muted-text sm:grid-cols-2">
      <li v-for="credit in credits" :key="`${credit.role}-${credit.name}`">
        <span class="font-medium text-[var(--theme-text)]">{{ credit.role }}:</span>
        {{ credit.name }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { Credit } from '~~/shared/types'

defineProps<{
  credits: Credit[]
}>()
</script>
