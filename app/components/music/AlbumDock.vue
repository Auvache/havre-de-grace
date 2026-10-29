<!--
  An album page's own transport: the dark sibling of the player bar, with the
  record's sides. It is a second view of the same engine (usePlayer), so when
  someone arrives here with this record already playing, the dock simply has
  it: same song, same second. Before anything plays it offers the first song.
-->

<template>
  <div class="dock" role="region" :aria-label="`${album.title}, now playing`">
    <button type="button" class="dock__prog" aria-label="Seek" @click="onSeek">
      <i :style="{ transform: `scaleX(${here ? player.progress.value : 0})` }" />
    </button>

    <div class="dock__now">
      <b>{{ track?.title }}</b>
      <span>{{ album.title }}<template v-if="hasSides"> · side {{ track?.side?.toUpperCase() }}</template></span>
    </div>

    <div class="dock__ctl">
      <button type="button" class="sk" aria-label="Previous" :disabled="!here" @click="player.prev()">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 2h1.6v12H3zM14 2v12L5.5 8z" fill="currentColor" /></svg>
      </button>
      <button type="button" class="pp" :aria-label="playing ? 'Pause' : 'Play'" @click="toggle">
        <svg v-if="playing" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
        <svg v-else viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
      </button>
      <button type="button" class="sk" aria-label="Next" :disabled="here && !player.hasNext.value" @click="next">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M11.4 2H13v12h-1.6zM2 2v12l8.5-6z" fill="currentColor" /></svg>
      </button>
    </div>

    <div class="dock__rt">
      <span v-if="hasSides" class="dock__side" aria-hidden="true">
        <i :class="{ on: track?.side === 'a' }">A</i>
        <i :class="{ on: track?.side === 'b' }">B</i>
      </span>
      <span class="mono">{{ formatClock(here ? player.currentTime.value : 0) }} / {{ formatClock(here ? player.duration.value : track?.durationSec ?? 0) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { formatClock, toPlayerTracks } from '~/composables/useAlbumPlayer'

const props = defineProps<{ album: Album }>()

const player = usePlayer()

/** Is the engine on this record? */
const here = computed(() => player.record.value?.slug === props.album.slug && player.index.value !== null)
const tracks = computed(() => toPlayerTracks(props.album))
const track = computed(() => (here.value ? player.track.value : tracks.value[0]) ?? null)
const playing = computed(() => here.value && player.playing.value)
const hasSides = computed(() => Boolean(props.album.sides?.b?.length))

function toggle() {
  if (here.value) player.toggle()
  else player.playAlbum(props.album, 0)
}

function next() {
  if (here.value) player.next()
  else player.playAlbum(props.album, 1)
}

function onSeek(event: MouseEvent) {
  if (!here.value) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  player.seekProgress((event.clientX - rect.left) / rect.width)
}
</script>

<style scoped>
.dock {
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
  background: color-mix(in srgb, var(--floor, #10171e) 90%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid rgba(232, 230, 223, 0.12);
  color: #e8e6df;
  font-weight: 300;
}

.dock__prog {
  position: absolute;
  left: 0;
  right: 0;
  top: -5px;
  height: 9px;
  padding: 4px 0 3px;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.dock__prog i {
  display: block;
  height: 2px;
  background: var(--acc, #9fb6cc);
  transform-origin: left;
}

.dock__now {
  min-width: 0;
  font-size: 14px;
  line-height: 1.35;
}

.dock__now b {
  display: block;
  font-weight: 300;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dock__now span {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #8593a0;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dock__ctl {
  display: flex;
  gap: 12px;
  align-items: center;
}

.dock button {
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
}

.dock button:disabled {
  opacity: 0.3;
  cursor: default;
}

.dock .sk {
  width: 36px;
  height: 36px;
}

.dock .pp {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e8e6df;
  color: var(--floor, #0d1318);
}

.dock__rt {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  font-size: 12px;
  color: #8593a0;
  white-space: nowrap;
}

.dock__side {
  display: flex;
  gap: 6px;
}

.dock__side i {
  font-style: normal;
  border: 1px solid rgba(232, 230, 223, 0.12);
  padding: 3px 8px;
  font-size: 10px;
  letter-spacing: 0.2em;
}

.dock__side i.on {
  border-color: #e8e6df;
  color: #e8e6df;
}

@media (max-width: 640px) {
  .dock {
    grid-template-columns: 1fr auto;
    padding: 0 16px;
  }

  .dock__rt,
  .dock__ctl .sk {
    display: none;
  }
}
</style>
