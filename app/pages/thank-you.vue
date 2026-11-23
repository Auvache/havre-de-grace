<!--
  Where Kit sends someone once they've clicked the link in the confirmation
  email (the "Clare form", after confirming). They're on the list, and the
  first welcome email, "Welcome to Havre De Grace", is already on its way with the
  link to /seven-inch.

  Before confirming, nobody comes here: the site's signup says "check your
  inbox" in place, and a Kit-hosted or no-JavaScript submit gets Kit's own
  success message (set 2026-10-31; until then that redirect came here too).
-->

<template>
  <div>
    <ShorelineBand title="You're in" image="/images/site/woods-wide-2400.jpg" image-position="50% 22%" />

    <div class="reading">
      <p class="centre">
        Thank you for confirming. Your 7-inch is on its way. Look for an email called "Welcome to Havre De
        Grace" (check spam if it isn't there in a few minutes). After that: new songs
        and the stories behind them.
      </p>

      <WhileYouWait
        class="wait-gap"
        :rows="[
          { slug: CURRENT_RECORD, eyebrow: 'While you wait' },
          { slug: 'i-want-to-be-yours-and-other-songs', eyebrow: 'Where it all started' },
        ]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CURRENT_RECORD } from '~/config/records'

definePageMeta({ navOver: true })

usePageSeo({
  title: `You're in | Havre De Grace`,
  description: 'Thank you for signing up for letters from Havre De Grace.',
})
</script>

<style scoped>
/* Centred under the band's title, like /subscribe. */
.centre {
  text-align: center;
  text-wrap: balance;
}

/* The space the steps list used to leave above the record row. */
.wait-gap {
  margin-top: 56px;
}
</style>
