<!--
  The archive of The Productive Creative. Each letter goes up here a week after
  it's emailed (shared/utils/letterDates.ts), so the list is the letters a
  subscriber already has, and the signup is for the ones they don't.

  `nuxt dev` lists the whole bank, drafts and scheduled letters included, each
  marked with when it goes up. A production build only ever contains the
  letters that are out (content.config.ts), so those marks can't ship.
-->

<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-2xl space-y-14">
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
          :title="letter.name"
          description="A short letter every week on making songs around a day job and a young family: what I tried, what I made, and one small thing to try yourself."
          heading-tag="h1"
          align="center"
        />

        <div class="mt-10">
          <NewsletterSignup />
        </div>

        <p class="mt-6 text-sm muted-text">
          {{ letter.offer }}, too. Letters go up here a week after they're sent.
        </p>
      </ScrollReveal>

      <section aria-label="Letters">
        <p v-if="!letters.length" class="border-t border-theme pt-10 text-center muted-text">
          The first letter is on its way. Subscribe and it comes straight to you.
        </p>

        <ol v-else class="border-t border-theme">
          <li v-for="item in letters" :key="item.path" class="border-b border-theme">
            <NuxtLink :to="item.path" class="letters-row group block py-7">
              <p class="label-text muted-text">
                <span v-if="item.number">No. {{ item.number }} · </span>
                <span v-if="item.sentOn">{{ formatLetterDate(item.sentOn) }}</span>
                <span v-if="item.status" class="letters-status">{{ item.status }}</span>
              </p>
              <h2 class="mt-2 text-[var(--font-size-subheading)] leading-snug transition-colors duration-200 group-hover:text-[var(--color-accent)]">
                {{ item.title }}
              </h2>
              <p v-if="item.description" class="mt-2 line-clamp-2 muted-text">
                {{ item.description }}
              </p>
            </NuxtLink>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'
import { formatLetterDate, publishedOn, toDay, today } from '~~/shared/utils/letterDates'

const { data } = await useAsyncData('letters', () =>
  queryCollection('letters')
    .select('path', 'title', 'description', 'date', 'published')
    .all())

const letters = computed(() => {
  const items = (data.value ?? []).map((item) => ({
    ...item,
    sentOn: toDay(item.date),
    showsOn: publishedOn(item),
  }))

  // Numbered in the order they were sent, which drafts have no place in.
  const sent = items
    .filter((item) => item.sentOn)
    .sort((a, b) => a.sentOn!.localeCompare(b.sentOn!))

  return items
    .map((item) => ({
      ...item,
      number: item.sentOn ? sent.indexOf(item) + 1 : null,
      status: !import.meta.dev
        ? null
        : !item.showsOn
            ? 'draft'
            : item.showsOn > today()
              ? `up ${formatLetterDate(item.showsOn)}`
              : null,
    }))
    // Newest first; drafts on top, where the work is.
    .sort((a, b) => (b.sentOn ?? '9999').localeCompare(a.sentOn ?? '9999'))
})

usePageSeo({
  title: `${letter.name} | Havre De Grace`,
  description: 'A weekly letter from Stefan Auvache Bradley of Havre De Grace on writing and recording songs around a full life.',
})
</script>

<style scoped>
.letters-status {
  margin-left: 0.6em;
  padding: 0.1em 0.6em;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
}
</style>
