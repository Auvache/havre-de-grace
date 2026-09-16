<template>
  <section>
    <SectionHeading
      title="photos"
      description="High resolution and free to use with credit. Right-click to save, or use the download links."
      heading-tag="h2"
    />

    <div class="mt-10 grid gap-6 sm:grid-cols-2">
      <ScrollReveal
        v-for="(asset, index) in siteProfile.pressAssets"
        :key="asset.src"
        as="article"
        class-name="surface-card overflow-hidden"
        variant="section-up"
        :delay-ms="90 + index * 90"
        :distance-px="52"
        :blur-px="5"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <NuxtImg
          :src="asset.src"
          :alt="`${siteProfile.artistName} press photo`"
          class="h-56 w-full object-cover"
          width="760"
          height="448"
          sizes="(max-width: 640px) 100vw, 380px"
          format="webp,avif"
          loading="lazy"
        />

        <div class="flex flex-wrap items-center justify-between gap-3 p-5 text-sm">
          <div class="muted-text">
            <p>{{ asset.label }}</p>
            <p>{{ imageDimensions[asset.src] ?? 'High resolution' }}</p>
          </div>
          <a
            :href="asset.src"
            :download="asset.downloadName"
            class="inline-flex shrink-0 rounded-full border border-theme px-4 py-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            download
          </a>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()

// The originals' pixel dimensions, so an editor can see whether a photo is big
// enough for print before downloading several megabytes to find out.
const imageDimensions: Record<string, string> = {
  '/press/media-pic-square.jpg': '2056 x 2083',
  '/press/media-pic-wide.jpg': '3024 x 1752',
}
</script>
