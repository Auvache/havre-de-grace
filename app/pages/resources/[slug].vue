<template>
  <article v-if="article" class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-12">
      <!-- --- Header --- -->
      <header class="space-y-5">
        <NuxtLink :to="LUNCH_BREAK.basePath" class="lb-back lb-no-print">
          <LbWordmark as="span" size="sm" />
        </NuxtLink>

        <h1 class="display-heading lb-title">
          {{ article.title }}
        </h1>

        <p class="max-w-2xl leading-relaxed muted-text">
          {{ article.description }}
        </p>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
          <LbDraftBadge v-if="article.draft" />
          <span v-if="article.readingMinutes" class="label-text muted-text">
            {{ article.readingMinutes }} min read
          </span>
          <LbLastVerified :date="article.lastVerified" />
        </div>
      </header>

      <!-- --- The lunch-break version --- -->
      <LbLunchBreakBox
        :answer="article.lunchBreak.answer"
        :today="article.lunchBreak.today"
      />

      <!-- --- Paired tool, near the top --- -->
      <LbPairedLink
        v-if="pairedTool"
        :to="lunchBreakToolPath(pairedTool.slug)"
        eyebrow="The tool for this"
        :title="pairedTool.name"
        :description="pairedTool.summary"
      />

      <LbDisclaimer v-if="pairedTool" />

      <!-- --- Body --- -->
      <div class="lb-prose lb-print-urls">
        <ContentRenderer :value="article" />
      </div>

      <!-- --- Paired tool, at the end --- -->
      <LbPairedLink
        v-if="pairedTool"
        :to="lunchBreakToolPath(pairedTool.slug)"
        eyebrow="Now do the thing"
        :title="pairedTool.name"
        :description="pairedTool.summary"
      />

      <!-- --- Sources --- -->
      <section v-if="article.sources?.length" aria-labelledby="lb-sources-heading" class="space-y-4">
        <h2 id="lb-sources-heading" class="label-text">
          Checked against
        </h2>
        <ul class="space-y-3 text-sm lb-print-urls">
          <li v-for="source in article.sources" :key="source.url" class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <a :href="source.url" target="_blank" rel="noopener" class="lb-source-link">
              {{ source.label }}
            </a>
            <LbLastVerified :date="source.lastVerified" />
          </li>
        </ul>
        <p class="text-sm muted-text">
          Every factual claim above was checked against the organisation's own
          site on the date shown. Things change — if one of these is out of date,
          it is worth telling me.
        </p>
      </section>

      <!-- --- Keep reading --- -->
      <section v-if="related.length" aria-labelledby="lb-related-heading" class="space-y-4">
        <h2 id="lb-related-heading" class="label-text">
          Keep reading
        </h2>
        <div class="grid gap-4">
          <LbPairedLink
            v-for="item in related"
            :key="item.slug"
            :to="lunchBreakArticlePath(item.slug)"
            eyebrow="Guide"
            :title="item.title"
            :description="item.description"
          />
        </div>
      </section>

      <LbEmailCta />

      <div class="lb-no-print border-t border-theme pt-8">
        <LbFeedbackLink :page="article.title" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  LUNCH_BREAK,
  findToolBySlug,
  lunchBreakArticlePath,
  lunchBreakToolPath,
} from '~~/shared/lunch-break/config'
import { compact } from '~/utils/schema'
import { lunchBreakSchemaId } from '~/composables/useLunchBreakSeo'

definePageMeta({
  layout: 'lunchbreak',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { data: article } = await useAsyncData(
  () => `lunch-break-article-${slug.value}`,
  () => queryCollection('lunchBreakArticles').where('slug', '=', slug.value).first(),
  { watch: [slug] },
)

/*
 * A missing article and a draft nobody is meant to see are the same 404. Drafts
 * are readable while the section is unpublished (LUNCH_BREAK.showDrafts) so
 * Stefan can review them on the real page; the day the section launches, an
 * article he has not cleared stops resolving rather than going live half-edited.
 */
if (!article.value || (article.value.draft && !LUNCH_BREAK.showDrafts)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found',
    fatal: true,
  })
}

const pairedTool = computed(() =>
  article.value?.pairedTool ? findToolBySlug(article.value.pairedTool) : undefined,
)

const { data: relatedData } = await useAsyncData(
  () => `lunch-break-related-${slug.value}`,
  async () => {
    const wanted = article.value?.related ?? []
    if (!wanted.length) {
      return []
    }

    const items = await queryCollection('lunchBreakArticles').all()

    // Ordered by the frontmatter list, not by the collection, so the article
    // decides what to send the reader to first.
    return wanted
      .map((wantedSlug) => items.find((item) => item.slug === wantedSlug))
      .filter((item) => Boolean(item) && (LUNCH_BREAK.showDrafts || !item!.draft))
      .map((item) => ({
        slug: item!.slug,
        title: item!.title,
        description: item!.description,
      }))
  },
  { watch: [slug] },
)

const related = computed(() => relatedData.value ?? [])

const articlePath = computed(() => lunchBreakArticlePath(slug.value))

const { canonicalUrl } = useLunchBreakSeo({
  title: () => article.value?.title ?? LUNCH_BREAK.name,
  /*
   * The lunch-break answer is the meta description, trimmed. It is already
   * written as a direct answer to the page's question, which is exactly what a
   * search snippet wants, and reusing it means there is one set of words to
   * keep true instead of two.
   */
  description: () => article.value?.description ?? '',
  path: () => articlePath.value,
  type: 'article',
  noindex: () => Boolean(article.value?.draft),
})

useSchemaOrg([
  defineWebPage(),

  compact({
    '@type': 'Article',
    '@id': lunchBreakSchemaId.article(canonicalUrl.value),
    headline: article.value.title,
    description: article.value.description,
    /*
     * `dateModified` is the date the facts were last checked, which is the
     * only date on these pages that means anything to a reader. There is
     * deliberately no invented `datePublished`.
     */
    dateModified: article.value.lastVerified,
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    publisher: { '@id': lunchBreakSchemaId.brand() },
    mainEntityOfPage: { '@id': `${canonicalUrl.value}#webpage` },
  }),

  /*
   * FAQPage only where the article genuinely carries three or more Q&A pairs,
   * per Google's own guidance. Below that it is markup for the sake of markup.
   */
  ...(article.value.faq && article.value.faq.length >= 3
    ? [compact({
        '@type': 'FAQPage',
        '@id': lunchBreakSchemaId.faq(canonicalUrl.value),
        mainEntity: article.value.faq.map((entry) => ({
          '@type': 'Question',
          name: entry.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: entry.answer,
          },
        })),
      })]
    : []),
])
</script>

<style scoped>
.lb-back {
  display: inline-block;
  color: var(--theme-muted);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-standard);
}

.lb-back:hover {
  color: var(--color-accent);
}

/*
 * The display scale is built for one- and two-word titles ("about", "press").
 * An article headline is a sentence, so it takes the same weight a step down
 * and a tighter measure.
 */
.lb-title {
  font-size: clamp(2rem, 1.3rem + 1.9vw, 3.1rem);
  max-width: 20ch;
}
</style>
