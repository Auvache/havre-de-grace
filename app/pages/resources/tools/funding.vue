<template>
  <ToolShell :tool="tool">
    <template #intro>
      Grants, royalty advances, emergency funds and fan funding, filtered by
      type and region. Every entry was checked against the organisation's own
      site and says in one sentence what it costs you. No affiliate links, no
      sponsored placements.
    </template>

    <FundingDirectory v-if="funding" :data="funding" />
  </ToolShell>
</template>

<script setup lang="ts">
import { findToolBySlug, resourceToolPath } from '~~/shared/data/resources'
import { toolSchema } from '~/utils/schema'

definePageMeta({
  layout: 'resources',
})

const tool = findToolBySlug('funding')!

const { data: funding } = await useAsyncData(
  'resources-funding',
  () => queryCollection('resourcesFunding').first(),
)

const { canonicalUrl } = usePageSeo({
  title: `${tool.name} | Havre De Grace`,
  description: 'A hand-checked directory of music grants, royalty advances, emergency funds and fan-funding platforms for independent artists — filterable by type and region, with an honest tradeoff line on every entry.',
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
