<template>
  <section id="notes" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="notes" />

    <p v-if="hasNotesText" class="mt-6 max-w-3xl whitespace-pre-line leading-8 muted-text">
      {{ notes }}
    </p>

    <ul v-if="images?.length" class="mt-8 grid gap-5 sm:grid-cols-2">
      <li v-for="image in images" :key="image.src" class="overflow-hidden rounded-[var(--radius-md)] border border-theme">
        <img :src="image.src" :alt="image.alt" class="h-full w-full object-cover" loading="lazy">
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  notes?: string
  images?: Array<{
    src: string
    alt: string
  }>
}>()

const hasNotesText = computed(() => Boolean(props.notes?.trim().length))
</script>
