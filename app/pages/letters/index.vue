<!--
  The archive of the monthly letters. Each letter goes up here a week after
  it's emailed (shared/utils/letterDates.ts), so the list is the letters a
  subscriber already has, and the signup is for the ones they don't.

  `nuxt dev` lists the whole bank, drafts and scheduled letters included, each
  marked with when it goes up. A production build only ever contains the
  letters that are out (content.config.ts), so those marks can't ship.
-->

<template>
  <div>
    <ShorelineBand title="Letters" sub="Once a month" image-position="center 30%" />

    <div class="reading">
      <h1 class="lede">Something new to listen to and the story behind it: a demo, an idea I'm working on, or a song that isn't out yet.</h1>

      <NewsletterSignup class="field" />

      <div class="seven">
        <div class="vinyl" aria-hidden="true">
          <div class="vinyl__label">
            <span>HDG</span>
            <b>All I Need</b>
            <span>side A</span>
          </div>
        </div>
        <div>
          <p class="eyebrow">When you sign up</p>
          <h2 class="seven__h">A 7-inch of two demos</h2>
          <p class="seven__p">All I Need on side A, Skin and Bones on the flip. They aren't out anywhere else.</p>
        </div>
      </div>

      <section class="arch" aria-labelledby="letters-archive">
        <h2 id="letters-archive" class="eyebrow">The letters</h2>

        <ol>
          <li v-if="!letters.length" class="soon">
            <span>No. 1</span>
            <span>On its way. Letters appear here a week after they're sent.</span>
          </li>
          <li v-for="item in letters" :key="item.path">
            <NuxtLink :to="item.path" class="arch__row">
              <span class="arch__n">{{ item.number ? `No. ${item.number}` : '' }}</span>
              <span>
                <span class="arch__t">{{ item.title }}</span>
                <span v-if="item.description" class="arch__d">{{ item.description }}</span>
              </span>
              <span class="arch__date">
                <template v-if="item.sentOn">{{ formatLetterDate(item.sentOn) }}</template>
                <span v-if="item.status" class="letters-status">{{ item.status }}</span>
              </span>
            </NuxtLink>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'
import { formatLetterDate, publishedOn, toDay, today } from '~~/shared/utils/letterDates'

definePageMeta({ navOver: true })

const { data } = await useAsyncData('letters', () =>
  queryCollection('letters')
    .select('path', 'title', 'description', 'date', 'published')
    .all())

const letters = computed(() => {
  const items = (data.value ?? []).map((item) => ({
    ...item,
    sentOn: toDay(item.date),
    showsOn: publishedOn(item),
  }))

  // Numbered in the order they were sent, which drafts have no place in.
  const sent = items
    .filter((item) => item.sentOn)
    .sort((a, b) => a.sentOn!.localeCompare(b.sentOn!))

  return items
    .map((item) => ({
      ...item,
      number: item.sentOn ? sent.indexOf(item) + 1 : null,
      status: !import.meta.dev
        ? null
        : !item.showsOn
            ? 'draft'
            : item.showsOn > today()
              ? `up ${formatLetterDate(item.showsOn)}`
              : null,
    }))
    // Newest first; drafts on top, where the work is.
    .sort((a, b) => (b.sentOn ?? '9999').localeCompare(a.sentOn ?? '9999'))
})

usePageSeo({
  title: `${letter.name} | Havre De Grace`,
  description: 'The monthly letter from Stefan Auvache Bradley of Havre De Grace: new demos and songs, and the stories behind them.',
})
</script>

<style scoped>
.field {
  margin-top: 44px;
}

.seven {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 56px;
  align-items: center;
  margin: 80px 0;
  padding: 56px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.vinyl {
  position: relative;
  width: 230px;
  height: 230px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle, #1b1e22 0 18%, transparent 18.5%),
    repeating-radial-gradient(circle, #15181b 0 2px, #22262b 2.5px 3.5px);
  box-shadow: 0 18px 40px rgba(20, 25, 30, 0.18);
}

.vinyl::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.12), transparent 40%, transparent 60%, rgba(255, 255, 255, 0.06));
}

.vinyl__label {
  position: relative;
  z-index: 1;
  width: 38%;
  height: 38%;
  border-radius: 50%;
  background: #c9d3dc;
  color: var(--ink);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
  text-align: center;
}

.vinyl__label span {
  font-size: 9px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--deep);
}

.vinyl__label b {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: 17px;
  line-height: 1.1;
}

.seven__h {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: 36px;
  line-height: 1.15;
  margin: 12px 0;
}

.seven__p {
  font-size: 16px;
  line-height: 1.75;
  color: var(--soft);
}

.arch ol {
  list-style: none;
  margin-top: 16px;
}

.arch li {
  border-top: 1px solid var(--rule);
}

.arch__row,
.arch li.soon {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 16px;
  padding: 16px 0;
  font-size: 16px;
  text-decoration: none;
}

.arch li.soon {
  grid-template-columns: 80px 1fr;
  color: var(--faint);
}

.arch__n,
.arch li.soon span:first-child {
  color: var(--faint);
  font-size: 12px;
  letter-spacing: 0.1em;
  padding-top: 3px;
}

.arch__t {
  display: block;
}

.arch__row:hover .arch__t {
  color: var(--deep);
}

.arch__d {
  display: block;
  margin-top: 2px;
  font-size: 14px;
  color: var(--soft);
}

.arch__date {
  font-size: 13px;
  color: var(--faint);
  white-space: nowrap;
}

.letters-status {
  margin-left: 0.6em;
  color: var(--sea);
}

@media (max-width: 640px) {
  .seven {
    grid-template-columns: 1fr;
    justify-items: start;
    gap: 32px;
  }

  .vinyl {
    width: 190px;
    height: 190px;
  }

  .arch__row {
    grid-template-columns: 56px 1fr;
  }

  .arch__date {
    grid-column: 2;
  }
}
</style>
