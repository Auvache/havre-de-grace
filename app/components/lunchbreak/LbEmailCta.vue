<!--
  The mailing-list ask, reframed for this section.

  It wraps the site's existing Kit form (NewsletterSignup) rather than adding a
  second one: one list, one confirmation flow, one place to unsubscribe. Only
  the copy around it changes.

  TODO(Stefan): decide whether Lunch Break signups should carry their own Kit
  tag or form id so you can tell "came for the guides" apart from "came for the
  songs" when you send. That is a Kit-side change plus a prop on
  NewsletterSignup; it is not done here because it is your account and your call.
-->

<template>
  <section class="lb-cta surface-card" aria-labelledby="lb-cta-heading">
    <p class="label-text muted-text">{{ eyebrow }}</p>
    <h2 id="lb-cta-heading" class="lb-cta__heading mt-2">
      {{ heading }}
    </h2>
    <p class="mt-3 max-w-xl text-sm leading-relaxed muted-text">
      {{ body }}
    </p>

    <div class="mt-6">
      <NewsletterSignup />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  heading?: string
  body?: string
}>(), {
  eyebrow: 'Mailing list',
  heading: 'Get new guides and tools, lunch-break sized',
  body: 'A few times a year, when there is something here worth your twenty minutes. Same list as the music — you can have both or ignore half of it.',
})
</script>

<style scoped>
.lb-cta {
  padding: clamp(1.5rem, 4vw, 2.5rem);
}

/* `.section-heading` at the subheading size. Not composed from it, because
   main.css declares its utilities after `@tailwind utilities` — a Tailwind
   `text-[length:…]` beside it loses on source order. */
.lb-cta__heading {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
}
</style>
