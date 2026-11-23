<!--
  The mailing list's own landing page, all centred: the field first, then the
  offer and what it costs you (nothing, and one click to leave), all in the
  same small text. Linked from the footer.
-->

<template>
  <div>
    <ShorelineBand title="Follow Havre De Grace" image="/images/site/woods-wide-2400.jpg" image-position="50% 22%" />

    <div class="reading centre">
      <NewsletterSignup centred class="field" />

      <p class="fine offer">
        <template v-if="offerParts">{{ offerParts[0] }}<strong>{{ BOLD }}</strong>{{ offerParts[1] }}</template>
        <template v-else>{{ pitch }}</template>
      </p>

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
import { pitch } from '~~/shared/data/letter'

definePageMeta({ navOver: true })

// The offer is shared (shared/data/letter.ts); here its heart is in bold. If
// the wording changes and this phrase is gone, the line shows plain.
const BOLD = 'unreleased demos from my next album'
const offerParts = pitch.includes(BOLD)
  ? pitch.split(BOLD)
  : null

const pageDescription = 'Follow Havre De Grace: new songs and the stories behind them, plus two otherwise unreleased demos from the next album.'

usePageSeo({
  title: `Follow Havre De Grace`,
  description: pageDescription,
})
</script>

<style scoped>
.centre {
  text-align: center;
}

/* The offer, in the same small text as the fine print, on even lines. */
.offer {
  text-wrap: balance;
}

/* Centred as a block, but the email typed into it still reads from the left. */
.field {
  text-align: left;
}

.fine {
  margin-top: 18px;
  font-size: 15px;
  color: var(--soft);
}

/* Room between the field and the text under it. */
.fine.offer {
  margin-top: 36px;
}

.fine a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
