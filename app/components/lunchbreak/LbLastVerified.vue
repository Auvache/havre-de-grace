<!--
  "Last verified" badge.

  The date always comes from frontmatter or from a data file — never from a
  template, and never from `new Date()`. A badge that renders today's date is
  worse than no badge: it tells every visitor the facts were checked this
  morning when nobody has looked at them in a year.
-->

<template>
  <p v-if="formatted" class="lb-verified" :title="`Facts on this page last checked ${formatted}`">
    <span aria-hidden="true" class="lb-verified__dot" />
    <span>Last verified {{ formatted }}</span>
  </p>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** ISO date, e.g. "2026-09-21". */
  date?: string | null
}>()

/*
 * Parsed by hand rather than through `new Date('2026-09-21')`, which is
 * interpreted as UTC midnight and then rendered in the visitor's timezone —
 * so anyone west of Greenwich sees the day before.
 */
const formatted = computed(() => {
  const matched = props.date?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!matched) {
    return null
  }

  const [, year, month, day] = matched
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<style scoped>
.lb-verified {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--theme-muted);
}

.lb-verified__dot {
  display: block;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: var(--color-accent);
}
</style>
