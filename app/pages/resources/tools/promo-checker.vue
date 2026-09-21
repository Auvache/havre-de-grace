<template>
  <LbToolShell
    :tool="tool"
    :article="tool.pairedArticle"
    :article-title="articleTitle"
    :article-description="articleDescription"
    :last-verified="checker?.lastVerified"
  >
    <template #intro>
      Answer a few questions about the offer in front of you, or about a
      playlist that added you, and get a structured read on how much of it
      matches the usual pattern — with the reasoning shown, not hidden. It
      names no companies and checks nothing on your behalf; the answers are all
      things only you can see.
    </template>

    <LbPromoChecker v-if="checker" :data="checker" />
  </LbToolShell>
</template>

<script setup lang="ts">
import { findToolBySlug, lunchBreakToolPath } from '~~/shared/lunch-break/config'
import { lunchBreakToolSchema } from '~/composables/useLunchBreakSeo'

definePageMeta({
  layout: 'lunchbreak',
})

const tool = findToolBySlug('promo-checker')!
const path = lunchBreakToolPath(tool.slug)

const { data: checker } = await useAsyncData(
  'lunch-break-promo-checker',
  () => queryCollection('lunchBreakPromoChecker').first(),
)

const { data: article } = await useAsyncData(
  'lunch-break-promo-checker-article',
  () => queryCollection('lunchBreakArticles').where('slug', '=', tool.pairedArticle).first(),
)

const articleTitle = computed(() => article.value?.title ?? 'How to spot playlist and promo scams')
const articleDescription = computed(() => article.value?.description ?? undefined)

const { canonicalUrl } = useLunchBreakSeo({
  title: tool.name,
  description: 'A free questionnaire for working out whether a promo offer or a Spotify playlist matches the known scam patterns — with the red flags and the reasoning shown, and next steps if you are already caught up in one.',
  path,
})

useSchemaOrg([
  defineWebPage(),
  lunchBreakToolSchema({ tool, canonicalUrl: canonicalUrl.value, category: 'BusinessApplication' }),
])
</script>
