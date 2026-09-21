<!--
  The v1 feedback loop: a mailto link with the page name already in the
  subject, so a correction costs the reader one click and costs this site no
  backend, no form service and no database.

  Everything on these pages goes stale — a fee changes, a grant closes, an
  organisation renames a programme — and the only realistic way a one-person
  site keeps up is readers who spot it first.
-->

<template>
  <p class="text-sm muted-text">
    {{ prompt }}
    <a :href="mailto" class="lb-feedback-link">{{ linkLabel }}</a>
  </p>
</template>

<script setup lang="ts">
import { LUNCH_BREAK } from '~~/shared/lunch-break/config'

const props = withDefaults(defineProps<{
  /** Page name, dropped into the prefilled subject line. */
  page: string
  prompt?: string
  linkLabel?: string
}>(), {
  prompt: 'Spot something outdated or missing?',
  linkLabel: 'Tell me',
})

const mailto = computed(() => {
  const subject = encodeURIComponent(`${LUNCH_BREAK.name} — ${props.page}`)
  const body = encodeURIComponent(
    `What's wrong or missing:\n\n\n(Page: ${props.page})`,
  )
  return `mailto:${LUNCH_BREAK.feedbackEmail}?subject=${subject}&body=${body}`
})
</script>

<style scoped>
.lb-feedback-link {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.lb-feedback-link:hover {
  color: var(--color-accent);
}
</style>
