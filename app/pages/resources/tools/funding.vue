<template>
  <LbToolShell
    :tool="tool"
    :article="tool.pairedArticle"
    :article-title="articleTitle"
    :article-description="articleDescription"
    :last-verified="funding?.lastVerified"
  >
    <template #intro>
      Grants, royalty advances, emergency funds and fan funding, filtered by
      type and region. Every entry was checked against the organisation's own
      site, carries the date it was checked, and says in one sentence what it
      costs you. No affiliate links, no sponsored placements.
    </template>

    <LbFundingDirectory v-if="funding" :data="funding" />
  </LbToolShell>
</template>

<script setup lang="ts">
import { findToolBySlug, lunchBreakToolPath } from '~~/shared/lunch-break/config'
import { lunchBreakToolSchema } from '~/composables/useLunchBreakSeo'

definePageMeta({
  layout: 'lunchbreak',
})

const tool = findToolBySlug('funding')!
const path = lunchBreakToolPath(tool.slug)

const { data: funding } = await useAsyncData(
  'lunch-break-funding',
  () => queryCollection('lunchBreakFunding').first(),
)

const { data: article } = await useAsyncData(
  'lunch-break-funding-article',
  () => queryCollection('lunchBreakArticles').where('slug', '=', tool.pairedArticle).first(),
)

const articleTitle = computed(() => article.value?.title ?? 'Funding for independent artists')
const articleDescription = computed(() => article.value?.description ?? undefined)

const { canonicalUrl } = useLunchBreakSeo({
  title: tool.name,
  description: 'A hand-checked directory of music grants, royalty advances, emergency funds and fan-funding platforms for independent artists — filterable by type and region, with an honest tradeoff line on every entry.',
  path,
})

useSchemaOrg([
  defineWebPage(),
  lunchBreakToolSchema({ tool, canonicalUrl: canonicalUrl.value, category: 'BusinessApplication' }),
])
</script>
