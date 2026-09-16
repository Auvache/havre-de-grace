<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-12">
      <ScrollReveal
        as="header"
        variant="section-up"
        :duration-ms="880"
        :distance-px="56"
        :threshold="0.16"
        root-margin="0px 0px -6% 0px"
      >
        <p class="label-text muted-text">
          Unlisted
        </p>
        <SectionHeading
          class="mt-3"
          title="tools"
          description="The workbench. Not in the navigation, not in the sitemap, not in llms.txt — reachable by typing the URL and nothing else."
          heading-tag="h1"
        />
      </ScrollReveal>

      <section class="space-y-4">
        <ScrollReveal
          v-for="(tool, index) in toolEntries"
          :key="tool.to"
          as="div"
          variant="section-up"
          :delay-ms="80 + index * 90"
          :distance-px="52"
          :blur-px="5"
          :threshold="0.12"
          root-margin="0px 0px -8% 0px"
        >
          <NuxtLink
            :to="tool.to"
            class="interactive-lift surface-card group flex items-start gap-5 p-6 no-underline"
          >
            <span class="min-w-0 flex-1 space-y-2">
              <span class="flex flex-wrap items-baseline gap-3">
                <span class="tool-heading">
                  {{ tool.label }}
                </span>
                <span v-if="tool.status" class="label-text muted-text text-[0.62rem]">
                  {{ tool.status }}
                </span>
              </span>
              <span class="block text-sm leading-relaxed muted-text">
                {{ tool.description }}
              </span>
            </span>

            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="mt-1 h-5 w-5 shrink-0 text-[color:var(--theme-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </NuxtLink>
        </ScrollReveal>

        <p v-if="!toolEntries.length" class="muted-text text-sm">
          Nothing here yet.
        </p>
      </section>

      <p class="border-t border-theme pt-8 text-sm muted-text">
        Unlisted is not private. These pages are served as plain static files, so
        treat the URL as the only thing standing between them and anyone else.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toolEntries } from '~~/shared/data/tools'

// `noindex, nofollow` comes from the route rule in nuxt.config.ts, which also
// keeps the URL out of sitemap.xml. usePageSeo still runs so the tab has a
// title and the canonical link is right.
usePageSeo({
  title: 'Tools | Havre De Grace',
  description: 'Unlisted internal tools.',
})
</script>

<style scoped>
/*
 * `.section-heading` at the subheading size. Not composed from it, because
 * main.css declares its utilities after `@tailwind utilities` — a Tailwind
 * `text-[length:…]` beside it loses on source order.
 */
.tool-heading {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  letter-spacing: 0.04em;
  line-height: 1.1;
  text-transform: uppercase;
}
</style>
