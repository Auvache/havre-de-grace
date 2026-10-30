<!--
  The top of a Shoreline page: a short photographic band with the title in thin
  spaced capitals, and an italic line under it. The nav lies on it, so a page
  using this sets `definePageMeta({ navOver: true })`; `data-nav-over` keeps the
  nav clear of a backing while it is over the picture.

  The picture defaults to the current record's hero art (app/config/records.ts),
  so when a new record comes out every band re-skins with the homepage.
-->

<template>
  <header class="band" data-nav-over>
    <img
      :src="src"
      alt=""
      :style="{ objectPosition: position, transform: `scale(${scale})` }"
      fetchpriority="high"
    >
    <h1>{{ title }}</h1>
    <p v-if="sub">{{ sub }}</p>
  </header>
</template>

<script setup lang="ts">
import { currentLook } from '~/config/records'

const props = defineProps<{
  title: string
  sub?: string
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
.band {
  position: relative;
  height: 440px;
  overflow: hidden;
  color: #fff;
  background: color-mix(in srgb, var(--sea) 60%, var(--mist));
}

.band img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.band::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 28, 38, 0.28), rgba(20, 28, 38, 0.05) 45%, rgba(20, 28, 38, 0.35));
}

.band h1 {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 70px;
  z-index: 2;
  text-align: center;
  font-weight: 200;
  font-size: 16px;
  letter-spacing: 0.7em;
  text-indent: 0.7em;
  text-transform: uppercase;
  line-height: 1.6;
}

.band p {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 34px;
  z-index: 2;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 640px) {
  .band {
    height: 340px;
  }

  .band h1 {
    font-size: 14px;
    letter-spacing: 0.5em;
    text-indent: 0.5em;
  }
}
</style>
