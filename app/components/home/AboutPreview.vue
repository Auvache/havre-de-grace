<template>
  <section class="page-container section-space border-t border-theme">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,410px)_1fr] lg:items-center">
      <ScrollReveal
        as="div"
        variant="section-left"
        class-name="overflow-hidden rounded-[var(--radius-lg)]"
        :delay-ms="90"
        :distance-px="84"
        :threshold="0.18"
        root-margin="0px 0px -8% 0px"
      >
        <NuxtImg
          src="/images/bio-update.png"
          alt="Havre De Grace press photo"
          class="w-full rounded-[var(--radius-lg)] object-cover shadow-[0_26px_54px_color-mix(in_srgb,var(--theme-text)_14%,transparent)]"
          width="2056"
          height="2083"
          sizes="(max-width: 1024px) 100vw, 410px"
          format="webp,avif"
          loading="lazy"
        />
      </ScrollReveal>

      <ScrollReveal
        as="div"
        class-name="space-y-6"
        variant="section-right"
        :delay-ms="180"
        :distance-px="84"
        :blur-px="6"
        :threshold="0.18"
        root-margin="0px 0px -8% 0px"
      >
        <SectionHeading
          title="about"
          eyebrow="bio"
        />

        <p class="max-w-2xl muted-text">
          Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley.
        </p>

        <p class="max-w-2xl italic muted-text">
	        "I love music and music loves me. I can't help but play the guitar and write songs. Havre De Grace is the vehicle I use to share what I love with anyone who wants to listen."
        </p>

        <p class="max-w-2xl muted-text">
          {{ latestReleaseLine }}
        </p>

        <NuxtLink to="/about" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
          read more
        </NuxtLink>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  latestAlbumTitle?: string
}>()

const siteProfile = useSiteProfile()

const latestReleaseLine = computed(() => {
  if (!props.latestAlbumTitle) {
    return 'His debut album was released in 2025.'
  }

  return `His debut album "${props.latestAlbumTitle}" was released in 2025.`
})
</script>
