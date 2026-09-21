<!--
  The Lunch Break Records wordmark.

  A text lockup, deliberately. There is no logo and there should not be one
  yet: the brand is three articles old, the name may still change, and a mark
  drawn now would be the most expensive thing to undo. This sets the existing
  site type — Jost, the same uppercase tracking as `.label-text` — so it reads
  as part of Havre De Grace rather than as a second design system.

  `as` lets the hub render it inside an <h1> without nesting headings.
-->

<template>
  <component :is="as" class="lb-wordmark" :class="sizeClass">
    <span class="lb-wordmark__line">Lunch Break</span>
    <span class="lb-wordmark__line lb-wordmark__line--records">Records</span>
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  as: 'span',
  size: 'md',
})

const sizeClass = computed(() => `lb-wordmark--${props.size}`)
</script>

<style scoped>
.lb-wordmark {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45em;
  font-weight: 500;
  letter-spacing: 0.21em;
  line-height: 1.1;
  text-transform: uppercase;
  /* The tracking is on the right of the last letter too; pull it back so the
     lockup optically aligns with everything under it. */
  margin-right: -0.21em;
}

.lb-wordmark--sm {
  font-size: var(--font-size-label);
}

.lb-wordmark--md {
  font-size: var(--font-size-subheading);
}

.lb-wordmark--lg {
  font-size: clamp(1.6rem, 1rem + 2.4vw, 3rem);
  font-weight: 450;
}

.lb-wordmark__line--records {
  color: var(--color-accent);
}
</style>
