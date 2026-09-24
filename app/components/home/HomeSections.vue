<!--
  Everything on the homepage below the hero.
-->

<template>
  <div>
    <AboutPreview />

    <ListenPreview />

    <MusicSection :albums="albums" />

    <section
      id="contact"
      class="page-container section-space border-t border-theme scroll-mt-[calc(var(--chrome-height)+1.5rem)]"
    >
      <ScrollReveal
        as="div"
        class-name="text-center"
        variant="section-up"
        :delay-ms="80"
        :duration-ms="820"
        :threshold="0.18"
        root-margin="0px 0px -6% 0px"
      >
        <SectionHeading
          title="contact"
          description="For inquiries, please reach out directly by email."
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal
        as="div"
        class-name="mt-8 text-center"
        variant="section-up"
        :delay-ms="220"
        :distance-px="48"
        :threshold="0.18"
        root-margin="0px 0px -6% 0px"
      >
        <a :href="`mailto:${siteProfile.bookingEmail}`" class="text-base hover:text-[var(--color-accent)]">
          {{ siteProfile.bookingEmail }}
        </a>
        <p class="mt-3 text-sm muted-text">
          Email is the fastest way to connect.
        </p>
        <NuxtLink
          to="/contact"
          class="nav-link mt-4 inline-block text-sm hover:text-[var(--color-accent)]"
        >
          booking, press, and licensing
        </NuxtLink>
      </ScrollReveal>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

defineProps<{
  albums: Album[]
}>()

const siteProfile = useSiteProfile()
</script>
