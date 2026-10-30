<!--
  A small row that plays the current record in the persistent player: its
  cover, its title, a play button. Thank-you and the letter pages use it.
-->

<template>
  <div v-if="record" class="wait">
    <NuxtLink :to="recordHref(record.slug)" :aria-label="record.title">
      <img :src="look.thumb" alt="" width="84" height="84">
    </NuxtLink>
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <NuxtLink :to="recordHref(record.slug)" class="wait__title">{{ record.title }}</NuxtLink>
    </div>
    <button
      type="button"
      class="pp wait__pp"
      :aria-label="playing ? `Pause ${record.title}` : `Play ${record.title}`"
      @click="player.toggleAlbum(record)"
    >
      <svg v-if="playing" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
      <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { CURRENT_RECORD, currentLook, recordHref } from '~/config/records'

withDefaults(defineProps<{ eyebrow?: string }>(), { eyebrow: 'While you wait' })

const player = usePlayer()
const look = currentLook()
const { albums } = await useHomeAlbums()
const record = computed(() => albums.value.find((album) => album.slug === CURRENT_RECORD) ?? null)
const playing = computed(() => Boolean(record.value) && player.isPlaying(record.value!.slug))
</script>

<style scoped>
.wait {
  display: flex;
  gap: 26px;
  align-items: center;
  padding: 30px 0;
  border-top: 1px solid var(--rule);
}

.wait img {
  width: 84px;
  height: 84px;
  object-fit: cover;
}

.wait__title {
  display: block;
  margin-top: 6px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 26px;
  line-height: 1.2;
  text-decoration: none;
}

.wait__pp {
  margin-left: auto;
  width: 46px;
  height: 46px;
}
</style>
