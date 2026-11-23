<!--
  Small rows that play a record in the persistent player: its cover, its
  title, a play button. The current record unless `rows` names others.
  Thank-you (both records) and the letter pages use it.
-->

<template>
  <div v-if="items.length" class="wait-rows">
    <div v-for="{ record, look, eyebrow: label } in items" :key="record.slug" class="wait">
      <NuxtLink :to="recordHref(record.slug)" :aria-label="record.title">
        <img :src="look.thumb" alt="" width="84" height="84">
      </NuxtLink>
      <div>
        <p class="eyebrow">{{ label }}</p>
        <NuxtLink :to="recordHref(record.slug)" class="wait__title">{{ record.title }}</NuxtLink>
      </div>
      <button
        type="button"
        class="pp wait__pp"
        :aria-label="player.isPlaying(record.slug) ? `Pause ${record.title}` : `Play ${record.title}`"
        @click="player.toggleAlbum(record)"
      >
        <svg v-if="player.isPlaying(record.slug)" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CURRENT_RECORD, currentLook, lookFor, recordHref } from '~/config/records'

/**
 * One row by default: the current record under `eyebrow`. Pass `rows` for more.
 * The rows share one component on purpose: two of these side by side would each
 * ask for the same 'home-albums' data at once, and only one row rendered.
 */
const props = withDefaults(defineProps<{
  eyebrow?: string
  rows?: { slug: string, eyebrow: string }[]
}>(), {
  eyebrow: 'While you wait',
  rows: undefined,
})

const player = usePlayer()
const { albums } = await useHomeAlbums()

const items = computed(() =>
  (props.rows ?? [{ slug: CURRENT_RECORD, eyebrow: props.eyebrow }])
    .map(({ slug, eyebrow }) => ({
      record: albums.value.find((album) => album.slug === slug),
      look: lookFor(slug) ?? currentLook(),
      eyebrow,
    }))
    .filter((item): item is typeof item & { record: NonNullable<typeof item.record> } => Boolean(item.record)))
</script>

<style scoped>
.wait {
  display: flex;
  gap: 26px;
  align-items: center;
  padding: 30px 0;
  border-top: var(--line);
}

/* The cover keeps its size; a long title wraps instead of squeezing it. */
.wait > a {
  flex-shrink: 0;
}

.wait img {
  display: block;
  width: 84px;
  height: 84px;
  object-fit: cover;
}

.wait__title {
  display: block;
  margin-top: 6px;
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 26px;
  line-height: 1.2;
  text-decoration: none;
}

.wait__pp {
  margin-left: auto;
  width: 46px;
  height: 46px;
}

/* Phones: each record stacks, centred: cover, label and title, play. */
@media (max-width: 640px) {
  .wait {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .wait img {
    width: 120px;
    height: 120px;
  }

  .wait__title {
    text-wrap: balance;
  }

  .wait__pp {
    margin-left: 0;
  }
}
</style>
