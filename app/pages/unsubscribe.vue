<!--
  There is no working unsubscribe *button* here, and there can't be one.

  Kit's only unsubscribe endpoint is POST /v4/subscribers/<id>/unsubscribe,
  which needs an account API key (or an OAuth token) and a subscriber id that
  itself takes an authenticated lookup to get. This site is a static bundle on
  S3 with no server to keep a key in, so the only way to put a real button on
  this page would be to ship a full-account credential in public JavaScript —
  one that can read and edit every subscriber on the list. That is not a
  trade worth making for a link that already exists in every email.

  So the page does the two things it honestly can: point at the one-click link
  Kit puts in the footer of every send, and offer to do it by hand.
-->

<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-2xl space-y-12">
      <ScrollReveal
        as="header"
        class-name="text-center"
        variant="section-up"
        :duration-ms="880"
        :distance-px="56"
        :threshold="0.16"
        root-margin="0px 0px -6% 0px"
      >
        <SectionHeading
          title="unsubscribe"
          description="No hard feelings, and no hoops. There are two ways off the list and both of them are one click."
          heading-tag="h1"
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal
        as="section"
        class-name="surface-card space-y-4 p-8 text-center"
        variant="section-up"
        :delay-ms="80"
        :distance-px="52"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <p class="label-text">the fastest way</p>
        <p class="text-sm leading-relaxed muted-text">
          Open any email from me and click <em>Unsubscribe</em> at the bottom.
          It takes effect immediately, there's nothing to log into, and it also
          lets you keep some emails and drop others if you'd rather do that than
          leave entirely.
        </p>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        class-name="space-y-5 text-center"
        variant="section-up"
        :delay-ms="160"
        :distance-px="52"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <p class="label-text">or just ask me</p>
        <p class="mx-auto max-w-lg text-sm leading-relaxed muted-text">
          Can't find an email, or the link isn't working? Send me a note and
          I'll take you off the list myself. It's a small list and I read
          everything that comes in.
        </p>

        <a
          :href="unsubscribeMailto"
          class="cta-solo interactive-lift inline-flex rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white"
        >
          email me to unsubscribe
        </a>

        <p class="text-sm muted-text">
          Or write to
          <a :href="`mailto:${siteProfile.bookingEmail}`" class="hover:text-[var(--color-accent)]">
            {{ siteProfile.bookingEmail }}
          </a>
          from the address you signed up with.
        </p>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        class-name="border-t border-theme pt-10 text-center"
        variant="section-up"
        :delay-ms="80"
        :distance-px="44"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <p class="text-sm muted-text">
          Here by mistake?
          <NuxtLink to="/subscribe" class="nav-link hover:text-[var(--color-accent)]">
            back to the mailing list
          </NuxtLink>
        </p>
      </ScrollReveal>
    </div>
  </div>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()

// Prefilled so the reply is a send rather than a writing task — and so the
// address it arrives from is the one that needs removing.
const unsubscribeMailto = computed(() => {
  const subject = encodeURIComponent('Unsubscribe')
  const body = encodeURIComponent(
    'Please take this address off the Havre De Grace mailing list. Thanks!',
  )

  return `mailto:${siteProfile.bookingEmail}?subject=${subject}&body=${body}`
})

const pageDescription = `How to unsubscribe from the Havre De Grace mailing list.`

usePageSeo({
  title: `Unsubscribe | Havre De Grace`,
  description: pageDescription,
})
</script>
