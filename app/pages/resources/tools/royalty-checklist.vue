<template>
  <LbToolShell
    :tool="tool"
    :article="tool.pairedArticle"
    :article-title="articleTitle"
    :article-description="articleDescription"
    :last-verified="checklist?.lastVerified"
  >
    <template #intro>
      A song earns several different royalties, and they are collected by
      different organisations that will not find you on their own. Add your
      songs and see, in one table, what each one is registered for and what is
      still outstanding.
    </template>

    <LbRoyaltyChecklist v-if="checklist" :data="checklist" />
  </LbToolShell>
</template>

<script setup lang="ts">
import { findToolBySlug, lunchBreakToolPath } from '~~/shared/lunch-break/config'
import { lunchBreakToolSchema } from '~/composables/useLunchBreakSeo'

definePageMeta({
  layout: 'lunchbreak',
})

const tool = findToolBySlug('royalty-checklist')!
const path = lunchBreakToolPath(tool.slug)

const { data: checklist } = await useAsyncData(
  'lunch-break-royalty-checklist',
  () => queryCollection('lunchBreakChecklist').first(),
)

const { data: article } = await useAsyncData(
  'lunch-break-royalty-checklist-article',
  () => queryCollection('lunchBreakArticles').where('slug', '=', tool.pairedArticle).first(),
)

const articleTitle = computed(() => article.value?.title ?? 'Royalties your distributor isn\'t collecting')
const articleDescription = computed(() => article.value?.description ?? undefined)

const { canonicalUrl } = useLunchBreakSeo({
  title: tool.name,
  description: 'A free per-song tracker for PRO, MLC, SoundExchange and Content ID registrations. Works in your browser, saves your progress, exports to JSON. Nothing you enter is sent anywhere.',
  path,
})

useSchemaOrg([
  defineWebPage(),
  lunchBreakToolSchema({ tool, canonicalUrl: canonicalUrl.value, category: 'MusicApplication' }),
])
</script>
