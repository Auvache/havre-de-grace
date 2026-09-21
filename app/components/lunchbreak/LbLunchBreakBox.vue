<!--
  "The lunch-break version" — the brand's signature block, at the top of every
  article.

  Three to five sentences that answer the question outright, then the two or
  three things to do today. It exists for the reader who has fifteen minutes,
  and it is also the part an answer engine is most likely to quote, which is
  why the words live in frontmatter: the same sentences feed the meta
  description and the JSON-LD rather than being written twice and drifting.
-->

<template>
  <aside class="lb-box" aria-labelledby="lb-box-heading">
    <p id="lb-box-heading" class="label-text">
      The lunch-break version
    </p>

    <p class="lb-box__answer mt-4">
      {{ answer }}
    </p>

    <template v-if="today.length">
      <p class="label-text muted-text mt-6">What to do today</p>
      <ul class="lb-box__today mt-3">
        <li v-for="(step, index) in today" :key="index">
          {{ step }}
        </li>
      </ul>
    </template>
  </aside>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  answer: string
  today?: string[]
}>(), {
  today: () => [],
})
</script>

<style scoped>
.lb-box {
  border: 1px solid var(--theme-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--theme-bg-soft);
  padding: clamp(1.25rem, 4vw, 2rem);
}

.lb-box__answer {
  font-size: clamp(1.05rem, 1rem + 0.3vw, 1.2rem);
  line-height: 1.6;
}

.lb-box__today {
  display: grid;
  gap: 0.6rem;
  font-size: 0.95rem;
  line-height: 1.55;
}

.lb-box__today li {
  position: relative;
  padding-left: 1.4rem;
}

.lb-box__today li::before {
  content: "";
  position: absolute;
  left: 0.15rem;
  top: 0.62em;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: var(--color-accent);
}
</style>
