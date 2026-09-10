<template>
  <span class="brand-mark" :aria-hidden="decorative ? 'true' : undefined" v-html="markup" />
</template>

<script setup lang="ts">
// The suite files under public/logos/suite are the source of truth for the
// brand, so the site draws from them directly rather than keeping a second
// copy. Inlining with ?raw (instead of <img>) is what lets currentColor work:
// the marks then take the colour of whatever they sit in, which is how one
// file covers the dark splash, the light nav and everything between.
import anchor from '~~/public/logos/suite/a1-anchor.svg?raw'
import seal from '~~/public/logos/suite/a2-seal.svg?raw'
import lockup from '~~/public/logos/suite/a4-lockup-stacked.svg?raw'
import anchorSmall from '~~/public/logos/suite/a5-anchor-small.svg?raw'
import sealSmall from '~~/public/logos/suite/a6-seal-small.svg?raw'
import horizontal from '~~/public/logos/suite/b2-lockup-horizontal-single.svg?raw'
import wordmark from '~~/public/logos/suite/b5-wordmark.svg?raw'
import nav from '~~/public/logos/suite/b8-lockup-nav.svg?raw'
import navSeal from '~~/public/logos/suite/b9-lockup-nav-seal.svg?raw'

const MARKS = {
  anchor, anchorSmall, seal, sealSmall, lockup, horizontal, wordmark, nav, navSeal,
} as const

const props = withDefaults(defineProps<{
  variant?: keyof typeof MARKS
  /** Marks sitting next to the name in text get hidden from screen readers. */
  decorative?: boolean
  /** Overrides the aria-label baked into the file. */
  label?: string
}>(), {
  variant: 'lockup',
  decorative: false,
  label: undefined,
})

const markup = computed(() => {
  const raw = MARKS[props.variant]
  if (props.decorative) {
    // The files carry role="img" and a <title>; a decorative placement should
    // announce neither, or the name gets read out twice beside its own text.
    return raw
      .replace(/ role="img"/, '')
      .replace(/ aria-label="[^"]*"/, ' aria-hidden="true" focusable="false"')
      .replace(/<title>.*?<\/title>/, '')
  }
  return props.label ? raw.replace(/aria-label="[^"]*"/, `aria-label="${props.label}"`) : raw
})
</script>

<style scoped>
.brand-mark {
  display: inline-flex;
}

.brand-mark :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
  /* Beats the color presentation attribute baked into the file, so the mark
     inherits from its surroundings instead of always painting ink. */
  color: inherit;
}
</style>
