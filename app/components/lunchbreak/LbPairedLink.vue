<!--
  The article <-> tool crossing.

  Every article links to its tool near the top and again at the end; every tool
  links back to its article. That pairing is the section's whole information
  architecture: the article is why it matters, the tool is what to do about it,
  and neither is much use without the other.
-->

<template>
  <NuxtLink :to="to" class="lb-paired interactive-lift surface-card group">
    <span class="min-w-0 flex-1">
      <span class="label-text muted-text block">{{ eyebrow }}</span>
      <span class="lb-paired__title mt-2 block">{{ title }}</span>
      <span v-if="description" class="mt-2 block text-sm leading-relaxed muted-text">
        {{ description }}
      </span>
    </span>

    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      class="lb-paired__arrow"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.8"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<style scoped>
.lb-paired {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  text-decoration: none;
}

.lb-paired__title {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  line-height: 1.2;
}

.lb-paired__arrow {
  margin-top: 0.35rem;
  height: 1.25rem;
  width: 1.25rem;
  flex-shrink: 0;
  color: var(--theme-muted);
  transition: transform 200ms var(--ease-standard), color 200ms var(--ease-standard);
}

.group:hover .lb-paired__arrow {
  transform: translateX(0.25rem);
  color: var(--color-accent);
}
</style>
