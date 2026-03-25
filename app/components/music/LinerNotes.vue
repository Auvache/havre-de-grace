<template>
  <section id="notes" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="notes" />

    <p v-if="hasNotesText" class="mt-6 max-w-3xl whitespace-pre-line leading-8 muted-text">
      {{ notes }}
    </p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  notes?: string
}>()

const hasNotesText = computed(() => Boolean(props.notes?.trim().length))
</script>
