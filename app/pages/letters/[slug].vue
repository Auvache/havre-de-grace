<!--
  One monthly letter, as it was sent, followed by the
  signup for the next one. A letter that isn't out yet doesn't exist in a
  production build (content.config.ts), so its URL 404s like any other.
-->

<template>
  <div class="reading">
    <article v-if="page">
      <p v-if="scheduledFor" class="dev-note">
        Dev only: {{ scheduledFor }}
      </p>

      <header class="letter-head">
        <p class="eyebrow">
          <NuxtLink to="/letters">{{ letter.name }}</NuxtLink>
          <template v-if="number">
            · No. {{ number }}
          </template>
        </p>
        <h1 class="display-title letter-title">{{ page.title }}</h1>
        <p v-if="sentOn" class="letter-date">
          <time :datetime="sentOn">{{ formatLetterDate(sentOn) }}</time>
        </p>
      </header>

      <ContentRenderer :value="page" class="letter-body" />

      <section class="letter-next" aria-labelledby="letter-signup-heading">
        <p id="letter-signup-heading" class="eyebrow">The next one</p>
        <p class="letter-next__p">{{ letter.offerDetail }}</p>
        <NewsletterSignup />
      </section>

      <p class="letter-all">
        <NuxtLink to="/letters">all letters</NuxtLink>
      </p>

      <WhileYouWait eyebrow="The record" />
    </article>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'
import { formatLetterDate, publishedOn, toDay, today } from '~~/shared/utils/letterDates'

const route = useRoute()
const path = computed(() => `/letters/${route.params.slug}`)

const { data } = await useAsyncData(`letter-${route.params.slug}`, async () => {
  const [page, sent] = await Promise.all([
    queryCollection('letters').path(path.value).first(),
    queryCollection('letters').select('path', 'date').where('date', 'IS NOT NULL').all(),
  ])
  return { page, sent }
})

const page = computed(() => data.value?.page ?? null)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Letter not found', fatal: true })
}

const sentOn = computed(() => toDay(page.value?.date))

/** Its place in the order the letters were sent. */
const number = computed(() => {
  if (!sentOn.value) {
    return null
  }
  const order = (data.value?.sent ?? [])
    .map((item) => ({ path: item.path, day: toDay(item.date) ?? '' }))
    .sort((a, b) => a.day.localeCompare(b.day))
  return order.findIndex((item) => item.path === path.value) + 1 || null
})

const scheduledFor = computed(() => {
  if (!import.meta.dev || !page.value) {
    return null
  }
  const showsOn = publishedOn(page.value)
  if (!showsOn) {
    return 'a draft, with no send date yet.'
  }
  return showsOn > today() ? `goes up here on ${formatLetterDate(showsOn)}.` : null
})

usePageSeo({
  title: () => `${page.value?.title} | Havre De Grace`,
  description: () => page.value?.description || 'A letter from Stefan Auvache Bradley of Havre De Grace.',
  type: 'article',
})
</script>

<style scoped>
/*
  The letter's own typography. The site has no prose plugin, and a letter is
  the one place it's read as running text, so it's set here: a comfortable
  measure, real paragraph spacing, and links that look like links.
*/
.dev-note {
  margin-bottom: 32px;
  padding: 12px 16px;
  border: 1px dashed var(--sea);
  font-size: 14px;
  color: var(--sea);
}

.letter-head {
  padding-bottom: 36px;
  border-bottom: var(--line);
}

.letter-title {
  font-size: clamp(36px, 3.6vw, 52px);
  margin: 16px 0 14px;
}

.letter-date {
  font-size: 14px;
  color: var(--faint);
}

.letter-next {
  margin-top: 72px;
  padding-top: 36px;
  border-top: var(--line);
}

.letter-next__p {
  margin: 12px 0 32px;
  font-size: 16px;
  color: var(--soft);
}

.letter-all {
  margin: 40px 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--soft);
}

.letter-body {
  margin-top: 40px;
  font-size: 18px;
  line-height: 1.85;
  color: color-mix(in srgb, var(--ink) 85%, var(--bone));
}

.letter-body :deep(p),
.letter-body :deep(ul),
.letter-body :deep(ol),
.letter-body :deep(blockquote),
.letter-body :deep(figure),
.letter-body :deep(img) {
  margin-block: 1.15em;
}

.letter-body :deep(h2),
.letter-body :deep(h3) {
  margin-top: 2.2em;
  margin-bottom: 0.6em;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.21em;
  line-height: 1.4;
  text-transform: uppercase;
  color: var(--theme-muted);
}

/* The title is set above. A letter that also opens with it as a heading (a
   Google Docs export does) would otherwise show it twice. */
.letter-body :deep(h1:first-child) {
  display: none;
}

/* Headings are anchor links from the markdown renderer; they shouldn't look it. */
.letter-body :deep(h2 a),
.letter-body :deep(h3 a) {
  color: inherit;
  text-decoration: none;
}

.letter-body :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.letter-body :deep(ul) {
  list-style: disc;
  padding-left: 1.4em;
}

.letter-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.4em;
}

.letter-body :deep(li + li) {
  margin-top: 0.4em;
}

.letter-body :deep(blockquote) {
  border-left: 2px solid var(--color-accent);
  padding-left: 1.1em;
  font-style: italic;
}

.letter-body :deep(img) {
  width: 100%;
  height: auto;
}

.letter-body :deep(hr) {
  margin-block: 2.5em;
  border-color: var(--theme-border);
}
</style>
