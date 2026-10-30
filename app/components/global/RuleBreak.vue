<!--
  A dividing line that opens round a small mark: the site's one way of
  marking a break (2026-10-30).

  `diamond` (the default) between sections and records; `anchor`, the logo's
  thinner anchor in a ring that fills the gap between the lines, only at the
  top of the footer, so it always means "this is the end of the page".

  The line and the mark share --line-ink and --line-weight (main.css), read
  here rather than through --line so a dark footer can set its own ink.
-->

<template>
  <div class="rule-break" aria-hidden="true">
    <span v-if="mark === 'anchor'" class="rule-break__ring">
      <BrandMark variant="anchor" decorative class="rule-break__anchor" />
    </span>
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
  --rule-gap: 28px;
  display: flex;
  align-items: center;
  gap: var(--rule-gap);
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

/* The ring is exactly the gap the anchor leaves in the line, so its edge
   meets both ends; the line runs straight into it. */
.rule-break:has(.rule-break__ring) {
  gap: 0;
}

.rule-break__ring {
  --size: calc(18px + 2 * var(--rule-gap));
  flex: none;
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  border: var(--line-weight) solid var(--line-ink);
  border-radius: 50%;
}
</style>
