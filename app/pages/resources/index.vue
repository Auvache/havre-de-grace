<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-14">
      <!-- --- Heading and the reason these exist --- -->
      <ScrollReveal
        as="header"
        variant="section-up"
        :duration-ms="880"
        :distance-px="56"
        :threshold="0.16"
        root-margin="0px 0px -6% 0px"
      >
        <SectionHeading
          title="tools"
          description="Free, they run entirely in your browser, and nothing you type into one is sent anywhere."
          heading-tag="h1"
        />

        <!--
          STEFAN: this is the only piece of copy on the section that is
          unmistakably you, and it is worth rewriting in your words. What is
          here has the right shape and the right length.
        -->
        <div class="rs-intro mt-8 max-w-2xl">
          <p>
            I write and record songs as Havre De Grace, in the hours around a
            day job and a young family. The business side of that — who collects
            which royalty, where the money actually is, which offers in the
            inbox are real — I learned late, badly, and usually after it had
            already cost me something.
          </p>
          <p>
            These are the three things I built to keep it straight. They helped
            me, so they are here in case they help you. Nothing to buy, no
            account, no email required.
          </p>
        </div>
      </ScrollReveal>

      <!-- --- The tools --- -->
      <section aria-labelledby="rs-tools-heading" class="space-y-4">
        <h2 id="rs-tools-heading" class="sr-only">The tools</h2>

        <ScrollReveal
          v-for="(tool, index) in RESOURCE_TOOLS"
          :key="tool.slug"
          as="div"
          variant="section-up"
          :delay-ms="60 + index * 80"
          :distance-px="48"
          :blur-px="5"
          :threshold="0.1"
          root-margin="0px 0px -8% 0px"
        >
          <ToolCard
            :to="resourceToolPath(tool.slug)"
            eyebrow="Tool"
            :title="tool.name"
            :description="tool.summary"
          />
        </ScrollReveal>
      </section>

      <!-- --- Mailing list --- -->
      <ScrollReveal
        as="div"
        variant="section-up"
        :delay-ms="60"
        :distance-px="48"
        :threshold="0.1"
        root-margin="0px 0px -8% 0px"
      >
        <ToolEmailCta />
      </ScrollReveal>

      <p class="rs-no-print border-t border-theme pt-8 text-sm muted-text">
        Made by Stefan of
        <NuxtLink to="/" class="rs-link">Havre De Grace</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RESOURCES_BASE_PATH,
  RESOURCE_TOOLS,
  resourceToolPath,
} from '~~/shared/data/resources'

definePageMeta({
  layout: 'resources',
})

usePageSeo({
  title: 'Free tools for independent musicians | Havre De Grace',
  description: 'Three free browser-based tools for independent artists: a royalty registration checklist, a funding directory, and a promo and playlist scam checker. Nothing you enter is sent anywhere.',
  path: RESOURCES_BASE_PATH,
})

useSchemaOrg([
  defineWebPage({
    '@type': ['WebPage', 'CollectionPage'],
  }),
])
</script>

<style scoped>
.rs-intro {
  font-size: var(--font-size-body);
  line-height: 1.75;
}

.rs-intro > * + * {
  margin-top: 1.25em;
}

.rs-link {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.rs-link:hover {
  color: var(--color-accent);
}
</style>
