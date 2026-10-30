<!--
  The mailing list's own landing page: what comes, the field, what it costs you
  (nothing, and one click to leave).
-->

<template>
  <div>
    <ShorelineBand title="Letters" image="/images/site/woods-wide-2400.jpg" image-position="50% 22%" />

    <div class="reading">
      <p class="lede">{{ letter.offerDetail }}</p>

      <NewsletterSignup class="field" />
      <p class="fine">
        One click to confirm, one click to leave. One letter a month, and your
        address goes nowhere else.
      </p>

      <ol class="steps">
        <li v-for="item in expectations" :key="item.title">
          <div>
            {{ item.title }}
            <small>{{ item.body }}</small>
          </div>
        </li>
      </ol>

      <p class="fine">
        See what you'd be getting: <NuxtLink to="/letters">read the letters</NuxtLink>.
        Already on the list and want off it? <NuxtLink to="/unsubscribe">Unsubscribe</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'

definePageMeta({ navOver: true })

const expectations = [
  {
    title: 'Unreleased recordings',
    body: 'Something new every month: a demo, an idea I\'m working on, or a song that isn\'t out yet. The list hears it first.',
  },
  {
    title: 'The story behind each one',
    body: 'Where the song came from and how it got made.',
  },
  {
    title: 'Shows and records',
    body: 'Dates near you when there are any, and new records here before anywhere else. Never more than that.',
  },
]

const pageDescription = 'Join the Havre De Grace mailing list: unreleased songs and demos from Stefan Auvache Bradley, something new every month.'

usePageSeo({
  title: `Mailing List | Havre De Grace`,
  description: pageDescription,
})
</script>

<style scoped>
.field {
  margin-top: 44px;
}

.fine {
  margin-top: 18px;
  font-size: 15px;
  color: var(--soft);
}

.fine a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
