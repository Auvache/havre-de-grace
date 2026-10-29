<!--
  Contact, in Thank-you's layout (docs/redesign/mockups/thanks.html): one
  address, then what to put in the email, one numbered row per reason.
-->

<template>
  <div>
    <ShorelineBand title="Contact" sub="Booking, press and licensing" image-position="center 70%" />

    <div class="reading">
      <p class="lede">Email is the fastest way to reach me. It goes straight to my inbox, and I answer everything.</p>

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

      <div class="elsewhere">
        <p class="eyebrow">Elsewhere</p>
        <p>Messages here reach me too, just more slowly than email. Based in {{ siteProfile.location }}.</p>
        <nav aria-label="Elsewhere" class="elsewhere__links">
          <a :href="siteProfile.artistLinks.instagram" rel="noopener">instagram</a>
          <a :href="siteProfile.artistLinks.youtube" rel="noopener">youtube</a>
          <a :href="siteProfile.artistLinks.bandcamp" rel="noopener">bandcamp</a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { schemaId } from '~/utils/schema'

definePageMeta({ navOver: true })

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

const pageDescription = `Booking, press, and licensing contact for Havre De Grace, the acoustic folk project of Stefan Auvache Bradley in Vancouver, Washington.`

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
  margin-top: 40px;
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

.elsewhere {
  padding-top: 30px;
  border-top: 1px solid var(--rule);
}

.elsewhere p:not(.eyebrow) {
  margin-top: 12px;
  font-size: 16px;
  color: var(--soft);
}

.elsewhere__links {
  display: flex;
  gap: 26px;
  margin-top: 18px;
  font-size: 12px;
  letter-spacing: 0.16em;
}
</style>
