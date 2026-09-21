<!--
  Shown on every page that touches money: the royalty pages, the funding pages
  and the scam pages. It is short on purpose — a disclaimer nobody reads
  protects nobody.
-->

<template>
  <aside class="lb-disclaimer" role="note">
    <p class="label-text">Not advice</p>
    <p class="mt-2 text-sm leading-relaxed muted-text">
      <slot>
        This is general information from a working musician, not legal, tax or
        financial advice. Rules change, and they differ outside the US. Check
        anything that matters against the organisation's own site before you act
        on it.
      </slot>
    </p>
  </aside>
</template>

<style scoped>
.lb-disclaimer {
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
  padding: 0.25rem 0 0.25rem 1rem;
}
</style>
