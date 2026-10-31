<!--
  Where Kit sends someone once they've clicked the link in the confirmation
  email (the "Clare form", after confirming). They're on the list, and the
  first welcome email, "Your first 7-inch", is already on its way with the
  link to /seven-inch.

  Before confirming, nobody comes here: the site's signup says "check your
  inbox" in place, and a Kit-hosted or no-JavaScript submit gets Kit's own
  success message (set 2026-10-31; until then that redirect came here too).
-->

<template>
  <div>
    <ShorelineBand title="You're in" image="/images/site/woods-wide-2400.jpg" image-position="50% 22%" />

    <div class="reading">
      <p class="lede">Thank you for confirming. You're on the Havre De Grace mailing list.</p>

      <ol class="steps">
        <li>
          <div>
            Your first 7-inch is on its way
            <small>Look for an email called "Your first 7-inch": two demos that aren't out anywhere else. Not there in a few minutes? Check spam or promotions, and drag it to your inbox so the next one lands there.</small>
          </div>
        </li>
        <li>
          <div>
            After that
            <small>{{ letter.offerDetail }}</small>
          </div>
        </li>
      </ol>

      <WhileYouWait />
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'

definePageMeta({ navOver: true })

usePageSeo({
  title: `You're in | Havre De Grace`,
  description: 'Thank you for joining the Havre De Grace mailing list.',
})
</script>

