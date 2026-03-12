<template>
  <section class="page-container section-space">
    <SectionHeading
      title="contact"
      eyebrow="booking and press"
      description="Please reach out by email for booking, interviews, and press requests."
      heading-tag="h1"
    />

    <div class="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
      <article class="surface-card space-y-3 p-6">
        <p class="label-text muted-text">email</p>
        <a :href="`mailto:${siteProfile.bookingEmail}`" class="text-base hover:text-[var(--color-accent)]">
          {{ siteProfile.bookingEmail }}
        </a>
        <p class="text-sm muted-text">
          Email is the best way to get in touch.
        </p>
      </article>

      <article class="surface-card space-y-4 p-6">
        <p class="label-text muted-text">social links</p>
        <ul class="flex flex-wrap gap-3">
          <li v-for="link in siteProfile.socialLinks" :key="link.url">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex rounded-full border border-theme px-3 py-1.5 text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  theme: 'light',
})

const siteProfile = useSiteProfile()

usePageSeo({
  title: `Contact | ${siteProfile.artistName}`,
  description: `Contact ${siteProfile.artistName} for booking, interviews, and press requests.`,
  image: '/press/media-pic-square.jpg',
})
</script>
