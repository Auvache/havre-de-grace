<!--
  The bar at the bottom of the light pages: what's playing, the transport, and
  the way into the record. Mounted once in app.vue, outside every layout, so a
  page change never interrupts it.

  It also keeps the route rules (config/player.ts):
    - a page with its own sound (the record player, the 7-inch, the films, the
      demo shelf): fade out and stop;
    - an album page for another record: fade out and stop;
    - an album page for this record: hand off; the page's dock shows the same
      engine, and the bar fades under it.
  The fades are opacity only, ~300 ms, and instant with reduced motion.
-->

<template>
  <Transition name="player-bar">
    <div v-if="visible" class="player-bar" role="region" aria-label="Now playing">
      <button
        type="button"
        class="player-bar__prog"
        aria-label="Seek"
        @click="onSeek"
      >
        <i :style="{ transform: `scaleX(${player.progress.value})` }" />
      </button>

      <NuxtLink :to="recordLink" class="player-bar__now">
        <img :src="player.record.value?.thumb" alt="" width="40" height="40">
        <span class="player-bar__titles">
          <b>{{ player.track.value?.title }}</b>
          <span>{{ player.record.value?.title }}</span>
        </span>
      </NuxtLink>

      <div class="player-bar__ctl">
        <button type="button" class="sk" aria-label="Previous" @click="player.prev()">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 2h1.6v12H3zM14 2v12L5.5 8z" fill="currentColor" /></svg>
        </button>
        <button type="button" class="pp-small" :aria-label="player.playing.value ? 'Pause' : 'Play'" @click="player.toggle()">
          <svg v-if="player.playing.value" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
          <svg v-else viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
        </button>
        <button type="button" class="sk" aria-label="Next" :disabled="!player.hasNext.value" @click="player.next()">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M11.4 2H13v12h-1.6zM2 2v12l8.5-6z" fill="currentColor" /></svg>
        </button>
      </div>

      <div class="player-bar__rt">
        <span class="mono">{{ formatClock(player.currentTime.value) }} / {{ formatClock(player.duration.value) }}</span>
        <NuxtLink :to="recordLink">open the record</NuxtLink>
        <button type="button" class="x" aria-label="Stop and close the player" @click="player.close()">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.3" /></svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { formatClock } from '~/composables/useAlbumPlayer'
import { STOP_ROUTES, albumSlugOf, handOffOnSameAlbum, stopFadeFor } from '~/config/player'
import { recordHref } from '~/config/records'

const route = useRoute()
const player = usePlayer()

const onStopRoute = computed(() => STOP_ROUTES.some((rule) => rule.test(route.path)))
const pageAlbum = computed(() => albumSlugOf(route.path))

const visible = computed(() =>
  Boolean(player.record.value && player.track.value)
  && !player.closed.value
  && !onStopRoute.value
  && !pageAlbum.value,
)

const recordLink = computed(() => recordHref(player.record.value?.slug ?? ''))

function applyRouteRules() {
  if (!player.record.value) return
  if (onStopRoute.value) {
    player.fadeOutAndStop(stopFadeFor(route.path))
    return
  }
  const album = pageAlbum.value
  if (album && (!handOffOnSameAlbum || album !== player.record.value.slug)) {
    player.fadeOutAndStop()
  }
}

watch(() => route.path, applyRouteRules)

function onSeek(event: MouseEvent) {
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  player.seekProgress((event.clientX - rect.left) / rect.width)
}
</script>

<style scoped>
.player-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  height: var(--player-height);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 0 26px;
  background: color-mix(in srgb, var(--bone) 88%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--rule);
  color: var(--ink);
  font-family: Jost, system-ui, sans-serif;
  font-weight: 300;
}

.player-bar__prog {
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  height: 7px;
  padding: 3px 0 2px;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.player-bar__prog i {
  display: block;
  height: 2px;
  background: var(--sea);
  transform-origin: left;
}

.player-bar__now {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
  text-decoration: none;
}

.player-bar__now img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  flex: none;
}

.player-bar__titles {
  min-width: 0;
  line-height: 1.35;
}

.player-bar__titles b {
  display: block;
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-bar__titles span {
  display: block;
  font-size: 12px;
  color: var(--soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-bar__ctl {
  display: flex;
  gap: 12px;
  align-items: center;
}

.player-bar button {
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
}

.player-bar .sk,
.player-bar .x {
  width: 36px;
  height: 36px;
}

.player-bar button:disabled {
  opacity: 0.3;
  cursor: default;
}

.player-bar .pp-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--ink);
}

.player-bar .pp-small:hover {
  background: var(--ink);
  color: var(--bone);
}

.player-bar__rt {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  font-size: 12px;
  color: var(--soft);
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.player-bar__rt a {
  color: var(--ink);
  letter-spacing: 0.14em;
  text-transform: lowercase;
  text-decoration: none;
}

.player-bar__rt a:hover {
  border-bottom: 1px solid currentColor;
}

.player-bar-enter-active,
.player-bar-leave-active {
  transition: opacity 300ms var(--ease-standard);
}

.player-bar-enter-from,
.player-bar-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .player-bar-enter-active,
  .player-bar-leave-active {
    transition: none;
  }
}

@media (max-width: 860px) {
  .player-bar__rt .mono {
    display: none;
  }
}

@media (max-width: 640px) {
  .player-bar {
    grid-template-columns: 1fr auto;
    padding: 0 16px;
  }

  .player-bar__ctl .sk,
  .player-bar__rt {
    display: none;
  }
}
</style>
