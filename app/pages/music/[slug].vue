<template>
  <section class="mx-auto max-w-6xl px-6 py-20">
    <h1 class="text-4xl font-medium">Album: {{ slug }}</h1>
    <p class="mt-6 max-w-2xl text-lg text-[var(--color-muted-dark)]">
      Long-scroll album experience will be implemented in Sprint 5.
    </p>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()

definePageMeta({
  layout: 'dark',
})

const slug = computed(() => route.params.slug as string)
</script>
