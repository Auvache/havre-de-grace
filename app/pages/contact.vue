<template>
  <section class="page-container section-space">
    <SectionHeading
      title="contact"
      eyebrow="booking and press"
      description="Use the form below or reach out directly by email and social channels."
    />

    <div class="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <ContactForm />

      <aside class="space-y-8">
        <article class="surface-card space-y-3 p-6">
          <p class="label-text muted-text">direct email</p>
          <a :href="`mailto:${siteProfile.bookingEmail}`" class="text-base hover:text-[var(--color-accent)]">
            {{ siteProfile.bookingEmail }}
          </a>
          <p class="text-sm muted-text">
            For booking, interviews, and press requests.
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

        <article class="surface-card p-6">
          <EmailSignupPlaceholder />
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  theme: 'light',
})

const siteProfile = useSiteProfile()
</script>
