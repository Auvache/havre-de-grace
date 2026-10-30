<!--
  Where Kit sends someone straight after they sign up, before they've
  confirmed: the "Clare form" redirect (Kit's own hosted form, and the site's
  signup when JavaScript is off and the form posts to Kit directly). With
  JavaScript the signup says "check your inbox" in place and never comes here.

  So the job is the one step left, confirming, and what's waiting after it:
  Kit's confirmation link lands on /seven-inch.
-->

<template>
  <div>
    <ShorelineBand title="Almost there" image="/images/site/woods-wide-2400.jpg" image-position="50% 22%" />

    <div class="reading">
      <p class="lede">One more step. Check your inbox for an email from Havre De Grace.</p>

      <ol class="steps">
        <li>
          <div>
            Open the email from Havre De Grace
            <small>No email after a few minutes? Look in spam or promotions, and drag it to your inbox so the next one lands there.</small>
          </div>
        </li>
        <li><div>Click the link to confirm</div></li>
        <li>
          <div>
            Your first 7-inch is waiting
            <small>Two demos that aren't out anywhere else. After that, {{ letter.offerShort.charAt(0).toLowerCase() + letter.offerShort.slice(1) }}</small>
          </div>
        </li>
      </ol>

      <WhileYouWait />

      <p v-if="shortsUrl" class="shorts">
        Or <a :href="shortsUrl" target="_blank" rel="noopener">watch the Shorts</a>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'

definePageMeta({ navOver: true })

const siteProfile = useSiteProfile()
const shortsUrl = computed(() => siteProfile.artistLinks.youtube ? `${siteProfile.artistLinks.youtube}/shorts` : '')

usePageSeo({
  title: `Almost there | Havre De Grace`,
  description: 'Confirm your email to join the Havre De Grace mailing list.',
})
</script>

<style scoped>
.shorts {
  font-size: 15px;
  color: var(--soft);
}

.shorts a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
