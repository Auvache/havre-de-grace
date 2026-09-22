<template>
  <ToolShell :tool="tool">
    <template #intro>
      Answer a few questions about the offer in front of you, or about a
      playlist that added you, and get a structured read on how much of it
      matches the usual pattern — with the reasoning shown, not hidden. It
      names no companies and checks nothing on your behalf; the answers are all
      things only you can see.
    </template>

    <PromoChecker v-if="checker" :data="checker" />
  </ToolShell>
</template>

<script setup lang="ts">
import { findToolBySlug, resourceToolPath } from '~~/shared/data/resources'
import { toolSchema } from '~/utils/schema'

definePageMeta({
  layout: 'resources',
})

const tool = findToolBySlug('promo-checker')!

const { data: checker } = await useAsyncData(
  'resources-promo-checker',
  () => queryCollection('resourcesPromoChecker').first(),
)

const { canonicalUrl } = usePageSeo({
  title: `${tool.name} | Havre De Grace`,
  description: 'A free questionnaire for working out whether a promo offer or a Spotify playlist matches the known scam patterns — with the red flags and the reasoning shown, and next steps if you are already caught up in one.',
  path: resourceToolPath(tool.slug),
})

const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage(),
  toolSchema({
    tool,
    canonicalUrl: canonicalUrl.value,
    siteUrl,
    category: 'BusinessApplication',
  }),
])
</script>
