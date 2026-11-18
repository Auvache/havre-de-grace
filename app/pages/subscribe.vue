<!--
  The mailing list's own landing page, all centred: the offer, the field, what
  it costs you (nothing, and one click to leave). Linked from the footer.
-->

<template>
  <div>
    <ShorelineBand title="Mailing list" image="/images/site/woods-wide-2400.jpg" image-position="50% 22%" />

    <div class="reading centre">
      <p class="offer">
        <template v-if="offerParts">{{ offerParts[0] }}<strong>{{ BOLD }}</strong>{{ offerParts[1] }}</template>
        <template v-else>{{ letter.offerDetail }}</template>
      </p>

      <NewsletterSignup centred class="field" />
      <p class="fine">
        One click to confirm, one click to leave. We don't share your address
        with anyone else.
      </p>

      <p class="fine">
        Already on the list and want off it? <NuxtLink to="/unsubscribe">Unsubscribe</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'

definePageMeta({ navOver: true })

// The offer is shared (shared/data/letter.ts); here its heart is in bold. If
// the wording changes and this phrase is gone, the line shows plain.
const BOLD = 'unreleased demos from my next album'
const offerParts = letter.offerDetail.includes(BOLD)
  ? letter.offerDetail.split(BOLD)
  : null

const pageDescription = 'Join the Havre De Grace mailing list: two unreleased demos from the next album, then news about music, merch and shows.'

usePageSeo({
  title: `Mailing List | Havre De Grace`,
  description: pageDescription,
})
</script>

<style scoped>
.centre {
  text-align: center;
}

/* The offer at body size, on even lines. */
.offer {
  text-wrap: balance;
}

/* Centred as a block, but the email typed into it still reads from the left. */
.field {
  margin-top: 44px;
  text-align: left;
}

.fine {
  margin-top: 18px;
  font-size: 15px;
  color: var(--soft);
}

.fine a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
