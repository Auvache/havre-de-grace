<!--
  A dividing line that opens round a small mark: the site's one way of
  marking a break (2026-10-30).

  `diamond` (the default) between sections and records; `anchor`, the logo's
  thinner anchor, only at the top of the footer, so it always means "this is
  the end of the page".

  The line and the mark share --line-ink and --line-weight (main.css), read
  here rather than through --line so a dark footer can set its own ink.
-->

<template>
  <div class="rule-break" aria-hidden="true">
    <BrandMark v-if="mark === 'anchor'" variant="anchor" decorative class="rule-break__anchor" />
    <svg v-else class="rule-break__diamond" viewBox="0 0 20 20"><path d="M10 1l9 9-9 9-9-9z" /></svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  mark?: 'diamond' | 'anchor'
}>(), {
  mark: 'diamond',
})
</script>

<style scoped>
.rule-break {
  display: flex;
  align-items: center;
  gap: 28px;
  color: var(--line-ink);
}

.rule-break::before,
.rule-break::after {
  content: "";
  flex: 1;
  border-top: var(--line-weight) solid var(--line-ink);
}

.rule-break__diamond {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
}

.rule-break__diamond path {
  stroke-width: var(--line-weight);
  vector-effect: non-scaling-stroke;
}

.rule-break__anchor {
  width: 18px;
}
</style>
