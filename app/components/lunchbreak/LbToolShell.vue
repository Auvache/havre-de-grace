<!--
  The frame every tool page sits in: the way back to the hub, the title, the
  "why this matters" link to the paired article, the disclaimer, and the
  feedback and mailing-list blocks at the foot.

  It exists so the three tools differ only where they actually differ — in the
  tool. Anything that should be true of all of them (an article link at the
  top, a way to report a stale fact at the bottom) is true here once.
-->

<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-12">
      <header class="space-y-5">
        <NuxtLink :to="LUNCH_BREAK.basePath" class="lb-back lb-no-print">
          <LbWordmark as="span" size="sm" />
        </NuxtLink>

        <h1 class="lb-title">{{ tool.name }}</h1>

        <p class="max-w-2xl leading-relaxed muted-text">
          <slot name="intro">{{ tool.summary }}</slot>
        </p>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
          <LbLastVerified :date="lastVerified" />
          <span class="label-text muted-text">Runs in your browser · nothing is sent anywhere</span>
        </div>
      </header>

      <LbPairedLink
        v-if="article"
        :to="lunchBreakArticlePath(article)"
        eyebrow="Why this matters"
        :title="articleTitle"
        :description="articleDescription"
      />

      <LbDisclaimer v-if="showDisclaimer" />

      <slot />

      <div class="lb-no-print space-y-8 border-t border-theme pt-10">
        <LbFeedbackLink :page="tool.name" />
        <LbEmailCta />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LUNCH_BREAK,
  lunchBreakArticlePath,
  type LunchBreakTool,
} from '~~/shared/lunch-break/config'

withDefaults(defineProps<{
  tool: LunchBreakTool
  /** Slug of the paired article, usually `tool.pairedArticle`. */
  article?: string
  articleTitle: string
  articleDescription?: string
  /** ISO date from the tool's data file. */
  lastVerified?: string
  showDisclaimer?: boolean
}>(), {
  article: undefined,
  articleDescription: undefined,
  lastVerified: undefined,
  showDisclaimer: true,
})
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

.lb-title {
  font-size: clamp(2rem, 1.3rem + 1.9vw, 3.1rem);
  font-weight: 350;
  line-height: 1.05;
  max-width: 18ch;
}
</style>
