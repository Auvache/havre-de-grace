<!--
  Contact: every request goes to one address, so the page is that address.
  Under a diamond break, the two things worth adding: what a booking email
  needs, and where the press material already is.
-->

<template>
  <div>
    <ShorelineBand title="Contact" bare />

    <div class="reading contact">
      <p>For booking, press, licensing, or anything else, email</p>
      <a :href="`mailto:${siteProfile.bookingEmail}`" class="mail">{{ siteProfile.bookingEmail }}</a>
      <RuleBreak class="rule" />
      <p class="more">
        For a show, include the date, the city, the venue and the kind of night it is.
        Bios and photos are in the <NuxtLink to="/press">press kit</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { schemaId } from '~/utils/schema'

const siteProfile = useSiteProfile()

const pageDescription = `Booking, press, and licensing contact for Havre De Grace, singer-songwriter Stefan Auvache Bradley.`

const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    '@type': ['WebPage', 'ContactPage'],
    mainEntity: { '@id': schemaId.artist(siteUrl) },
  }),
])

usePageSeo({
  title: `Contact & Booking | Havre De Grace`,
  description: pageDescription,
})
</script>

<style scoped>
.contact {
  text-align: center;
}

.contact p {
  text-wrap: balance;
}

.contact > p:first-child {
  font-size: 18px;
  color: var(--soft);
}

.mail {
  display: inline-block;
  margin-top: 14px;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(24px, 2vw + 12px, 34px);
  color: var(--deep);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.mail:hover {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

/* The break sits as far under the address as the note sits under it. */
.rule {
  max-width: 460px;
  margin: 28px auto 0;
}

.more {
  max-width: 460px;
  margin: 33px auto 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--soft);
}
</style>
