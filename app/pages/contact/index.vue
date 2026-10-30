<!--
  Contact, in Thank-you's layout (docs/redesign/mockups/thanks.html): one
  address, then what to put in the email, one numbered row per reason.
-->

<template>
  <div>
    <ShorelineBand title="Contact" :image="false" />

    <div class="reading">
      <a :href="`mailto:${siteProfile.bookingEmail}`" class="address">{{ siteProfile.bookingEmail }}</a>

      <!--
        One inbox, three reasons for writing to it. Spelling out what to include
        is the whole job of a contact page for an independent artist: it turns a
        vague "hi, are you available?" into a bookable enquiry on the first
        email rather than the third.
      -->
      <ol class="steps">
        <li v-for="reason in reasons" :key="reason.title">
          <div>
            {{ reason.title }}
            <small>
              {{ reason.body }}
              <NuxtLink v-if="reason.to" :to="reason.to">{{ reason.linkLabel }}</NuxtLink>
            </small>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { schemaId } from '~/utils/schema'

const siteProfile = useSiteProfile()

const reasons = [
  {
    title: 'Booking',
    body: 'Include the date, the city, the venue, and the kind of night it is. Solo acoustic, and happy to travel from the Portland–Vancouver area.',
  },
  {
    title: 'Press',
    body: 'Bios, high-resolution photos, and release details are ready to download, no need to ask first. Interview requests are welcome by email.',
    to: '/press',
    linkLabel: 'The press kit.',
  },
  {
    title: 'Licensing and collaboration',
    body: 'Sync, film, and other licensing enquiries, or anything else. Say what you have in mind and which song it is for.',
  },
]

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
.address {
  display: inline-block;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(24px, 2.4vw, 30px);
  border-bottom: 1px solid var(--rule);
  padding-bottom: 4px;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.address:hover {
  border-bottom-color: currentColor;
}
</style>
