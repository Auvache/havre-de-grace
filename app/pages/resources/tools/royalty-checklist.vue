<template>
  <ToolShell :tool="tool">
    <template #intro>
      A song earns several different royalties, and they are collected by
      different organisations that will not find you on their own. Add your
      songs and see, in one table, what each one is registered for and what is
      still outstanding.
    </template>

    <RoyaltyChecklist v-if="checklist" :data="checklist" />
  </ToolShell>
</template>

<script setup lang="ts">
import { findToolBySlug, resourceToolPath } from '~~/shared/data/resources'
import { toolSchema } from '~/utils/schema'

definePageMeta({
  layout: 'resources',
})

const tool = findToolBySlug('royalty-checklist')!

const { data: checklist } = await useAsyncData(
  'resources-royalty-checklist',
  () => queryCollection('resourcesChecklist').first(),
)

const { canonicalUrl } = usePageSeo({
  title: `${tool.name} | Havre De Grace`,
  description: 'A free per-song tracker for PRO, MLC, SoundExchange and Content ID registrations. Works in your browser, saves your progress, exports to JSON. Nothing you enter is sent anywhere.',
  path: resourceToolPath(tool.slug),
})

const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage(),
  toolSchema({
    tool,
    canonicalUrl: canonicalUrl.value,
    siteUrl,
    category: 'MusicApplication',
  }),
])
</script>
