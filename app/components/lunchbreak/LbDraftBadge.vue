<!--
  Marks an unedited draft. Visible rather than subtle: while the section is
  unpublished these pages are readable by anyone who types the URL, and an
  unfinished article that does not say so is the one thing here that could
  actually mislead somebody.
-->

<template>
  <p class="lb-draft">
    <span aria-hidden="true">●</span>
    <span>Draft — not yet edited or published</span>
  </p>
</template>

<style scoped>
.lb-draft {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px dashed color-mix(in srgb, var(--color-accent) 50%, transparent);
  border-radius: 999px;
  padding: 0.3rem 0.85rem;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--theme-muted);
}
</style>
