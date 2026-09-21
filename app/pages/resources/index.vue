<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-16">
      <!-- --- Masthead --- -->
      <ScrollReveal
        as="header"
        variant="section-up"
        :duration-ms="880"
        :distance-px="56"
        :threshold="0.16"
        root-margin="0px 0px -6% 0px"
      >
        <LbWordmark as="h1" size="lg" />
        <p class="mt-5 max-w-xl text-[var(--font-size-subheading)] leading-snug muted-text">
          {{ LUNCH_BREAK.tagline }}
        </p>

        <div v-if="!LUNCH_BREAK.published" class="lb-no-print mt-6">
          <LbDraftBadge />
        </div>
      </ScrollReveal>

      <!-- --- Intro, in Stefan's voice --- -->
      <ScrollReveal
        as="section"
        variant="section-up"
        :delay-ms="60"
        :distance-px="48"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <!--
          STEFAN: this is the one piece of copy on the section that is
          unmistakably you, and it should be rewritten in your words. What is
          here is a draft placeholder with the right shape and the right length.
        -->
        <div class="lb-prose max-w-2xl">
          <p>
            I write and record songs as Havre De Grace, in the hours around a day
            job and a young family. Everything I know about the business side of
            that, I learned late, badly, and usually after it had already cost me
            something.
          </p>
          <p>
            This is where I write it down. Guides that answer the question
            outright before they explain it, and small tools that do the part I
            could never keep straight on paper. No hacks, no funnels, nothing to
            buy. If it does not fit in a lunch break, it does not belong here.
          </p>
        </div>
      </ScrollReveal>

      <!-- --- What this is, and is not --- -->
      <ScrollReveal
        as="section"
        class-name="surface-card p-6 sm:p-8"
        variant="section-up"
        :delay-ms="60"
        :distance-px="48"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <h2 class="label-text">What this is</h2>
        <p class="mt-3 text-sm leading-relaxed">
          {{ LUNCH_BREAK.about.is }}
        </p>
        <p class="mt-3 text-sm leading-relaxed muted-text">
          {{ LUNCH_BREAK.about.isNot }}
        </p>
        <p class="mt-4 text-sm muted-text">
          <NuxtLink :to="LUNCH_BREAK.byline.href" class="lb-byline-link">
            {{ LUNCH_BREAK.byline.text }}
          </NuxtLink>
        </p>
      </ScrollReveal>

      <!-- --- Tools --- -->
      <section aria-labelledby="lb-tools-heading" class="space-y-6">
        <SectionHeading
          id="lb-tools-heading"
          title="tools"
          description="Free, they run entirely in your browser, and nothing you type into one is sent anywhere."
          heading-tag="h2"
        />

        <div class="grid gap-4">
          <ScrollReveal
            v-for="(tool, index) in LUNCH_BREAK.tools"
            :key="tool.slug"
            as="div"
            variant="section-up"
            :delay-ms="60 + index * 80"
            :distance-px="48"
            :blur-px="5"
            :threshold="0.1"
            root-margin="0px 0px -8% 0px"
          >
            <LbPairedLink
              :to="lunchBreakToolPath(tool.slug)"
              eyebrow="Tool"
              :title="tool.name"
              :description="tool.summary"
            />
          </ScrollReveal>
        </div>
      </section>

      <!-- --- Articles --- -->
      <section aria-labelledby="lb-articles-heading" class="space-y-6">
        <SectionHeading
          id="lb-articles-heading"
          title="guides"
          description="Each one opens with the five-minute answer, then explains it."
          heading-tag="h2"
        />

        <ul v-if="articles.length" class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="article in articles" :key="article.slug">
            <NuxtLink :to="lunchBreakArticlePath(article.slug)" class="lb-article-row group">
              <span class="min-w-0 flex-1">
                <span class="lb-article-row__title">{{ article.title }}</span>
                <span class="mt-2 block text-sm leading-relaxed muted-text">
                  {{ article.description }}
                </span>
                <span class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <LbDraftBadge v-if="article.draft" />
                  <span v-if="article.readingMinutes" class="label-text muted-text">
                    {{ article.readingMinutes }} min read
                  </span>
                  <LbLastVerified :date="article.lastVerified" />
                </span>
              </span>
            </NuxtLink>
          </li>
        </ul>

        <p v-else class="text-sm muted-text">
          Nothing published yet.
        </p>
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
        <LbEmailCta />
      </ScrollReveal>

      <div class="lb-no-print border-t border-theme pt-8">
        <LbFeedbackLink page="Resources hub" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LUNCH_BREAK,
  lunchBreakArticlePath,
  lunchBreakToolPath,
} from '~~/shared/lunch-break/config'
import { compact } from '~/utils/schema'
import { lunchBreakSchemaId } from '~/composables/useLunchBreakSeo'

definePageMeta({
  layout: 'lunchbreak',
})

const { data } = await useAsyncData('lunch-break-articles', async () => {
  const items = await queryCollection('lunchBreakArticles')
    .order('order', 'ASC')
    .all()

  /*
   * Drafts are listed while the section is unpublished so Stefan can read them
   * on the real page, and drop off the moment it launches — see
   * LUNCH_BREAK.showDrafts. The filter runs here rather than in the query so
   * one flag governs both this list and the article pages themselves.
   */
  return items
    .filter((item) => LUNCH_BREAK.showDrafts || !item.draft)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      description: item.description,
      draft: item.draft,
      readingMinutes: item.readingMinutes,
      lastVerified: item.lastVerified,
    }))
})

const articles = computed(() => data.value ?? [])

const pageDescription = `${LUNCH_BREAK.tagline} Free guides and browser-based tools for independent musicians — royalties, funding, and spotting promo scams. ${LUNCH_BREAK.byline.text}.`

const { canonicalUrl } = useLunchBreakSeo({
  /*
   * Not the brand name — `lunchBreakTitle` appends that, and "Lunch Break
   * Records | Lunch Break Records" is what you get for free. The brand is the
   * H1 on the page; the <title> is where the query someone actually types
   * goes.
   */
  title: 'Resources for musicians with day jobs',
  description: pageDescription,
  path: LUNCH_BREAK.basePath,
})

/*
 * The brand gets one Organization node of its own, referenced by @id from
 * every article and tool on the section. It is deliberately not a second
 * Person: app.vue already defines Stefan, and this points back at that
 * `/#artist` MusicGroup as its parent rather than describing him twice.
 */
const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    '@type': ['WebPage', 'CollectionPage'],
  }),
  compact({
    '@type': 'Organization',
    '@id': lunchBreakSchemaId.brand(),
    name: LUNCH_BREAK.name,
    description: `${LUNCH_BREAK.about.is} ${LUNCH_BREAK.about.isNot}`,
    slogan: LUNCH_BREAK.tagline,
    url: canonicalUrl.value,
    parentOrganization: { '@id': `${siteUrl}/#artist` },
  }),
])
</script>

<style scoped>
.lb-byline-link {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.lb-byline-link:hover {
  color: var(--color-accent);
}

.lb-article-row {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding-block: 1.6rem;
  text-decoration: none;
}

.lb-article-row__title {
  display: block;
  font-size: var(--font-size-subheading);
  font-weight: 450;
  line-height: 1.25;
  transition: color var(--dur-fast) var(--ease-standard);
}

.lb-article-row:hover .lb-article-row__title {
  color: var(--color-accent);
}
</style>
