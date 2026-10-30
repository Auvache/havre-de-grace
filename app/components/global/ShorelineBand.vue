<!--
  The top of a Shoreline page: a short photographic band, then the page's title
  under it in thin spaced capitals. Nothing is written on the picture.

  With a picture, the nav lies on it, so the page sets `definePageMeta({
  navOver: true })`; `data-nav-over` keeps the nav clear of a backing while it
  is over the picture. With `bare` there is no picture, just the
  title, and the page leaves navOver off so the nav's spacer clears it.

  The picture defaults to the current record's hero art (app/config/records.ts),
  so when a new record comes out those bands re-skin with the homepage.
-->

<template>
  <header :class="['band', { 'band--bare': bare }]">
    <div v-if="!bare" class="band__pic" data-nav-over>
      <img
        :src="src"
        alt=""
        :style="{ objectPosition: position, transform: `scale(${scale})` }"
        fetchpriority="high"
      >
    </div>
    <h1>{{ title }}</h1>
  </header>
</template>

<script setup lang="ts">
import { currentLook } from '~/config/records'

const props = defineProps<{
  title: string
  /** No picture, just the title. */
  bare?: boolean
  /** A picture other than the current record's hero art. */
  image?: string
  /** CSS object-position for the picture. */
  imagePosition?: string
  imageScale?: number
}>()

const hero = currentLook().hero
const src = computed(() => props.image ?? hero.src)
const position = computed(() => props.imagePosition ?? hero.position ?? 'center')
const scale = computed(() => props.imageScale ?? (props.image ? 1.04 : hero.scale ?? 1))
</script>

<style scoped>
.band__pic {
  position: relative;
  height: 400px;
  overflow: hidden;
  background: color-mix(in srgb, var(--sea) 60%, var(--mist));
}

.band__pic img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Only enough shade at the top for the nav's white links. */
.band__pic::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 28, 38, 0.28), rgba(20, 28, 38, 0) 35%);
}

.band h1 {
  padding: 72px 16px 0;
  text-align: center;
  font-weight: 200;
  font-size: 16px;
  letter-spacing: 0.7em;
  text-indent: 0.7em;
  text-transform: uppercase;
  line-height: 1.6;
}

.band--bare h1 {
  padding-top: 56px;
}

@media (max-width: 640px) {
  .band__pic {
    height: 280px;
  }

  .band h1 {
    padding-top: 52px;
    font-size: 14px;
    letter-spacing: 0.5em;
    text-indent: 0.5em;
  }

  .band--bare h1 {
    padding-top: 36px;
  }
}
</style>
