<!--
  The song journey: the record's songs, below the screen, at the visitor's own
  pace. Not synced to the music; the screen above is the synced part.

  Each song is a full scene when it has something to show (a still, a motif, a
  film, Stefan's own story, or a snippet of two lines or more) and a quiet row
  when it has only a line. Content decides the size (shared/data/journey.ts).

  Motion: CSS scroll-driven animations move the picture, the words and the
  motif at different rates as a scene passes. Everything starts from its
  visible resting state; a motif is armed (undrawn) only once JavaScript is
  running and draws itself on when its scene comes into view. Reduced motion:
  no parallax, and the motifs are simply there.

  Every title links to the song's page, in the server-rendered markup: that's
  how crawlers find them.
-->

<template>
  <div ref="root" class="journey">
    <template v-for="group in groups" :key="group.key">
      <section
        v-if="group.kind === 'scene'"
        :id="`song-${group.songs[0]!.slug}`"
        class="scene"
        :class="{ 'has-media': group.songs[0]!.image || group.songs[0]!.motif }"
      >
        <div class="scene__n">{{ pad(group.songs[0]!.number) }}</div>

        <div class="scene__head">
          <h2><NuxtLink :to="songHref(group.songs[0]!)">{{ group.songs[0]!.title }}</NuxtLink></h2>
          <div class="scene__dur">
            <button
              type="button"
              class="scene__pp"
              :aria-label="isPlaying(group.songs[0]!) ? `Pause ${group.songs[0]!.title}` : `Play ${group.songs[0]!.title}`"
              @click="toggle(group.songs[0]!)"
            >
              <svg v-if="isPlaying(group.songs[0]!)" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
              <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
            </button>
            {{ group.songs[0]!.duration }}
          </div>
          <span v-if="group.songs[0]!.tag" class="scene__tag">{{ group.songs[0]!.tag }}</span>
        </div>

        <div class="scene__body">
          <figure v-if="group.songs[0]!.image" class="scene__still">
            <img :src="group.songs[0]!.image!.src" :alt="group.songs[0]!.image!.alt" loading="lazy" width="1600" height="900">
            <figcaption>
              <span>{{ group.songs[0]!.image!.caption }}</span>
              <NuxtLink v-if="group.songs[0]!.film" :to="group.songs[0]!.film!.href">{{ group.songs[0]!.film!.label }} →</NuxtLink>
            </figcaption>
          </figure>

          <div class="scene__words">
            <svg
              v-if="group.songs[0]!.motif"
              class="scene__motif"
              viewBox="0 0 100 100"
              aria-hidden="true"
              v-html="motifMarkup(group.songs[0]!.motif!)"
            />
            <p v-if="group.songs[0]!.snippet?.length" class="lyr">
              <template v-for="(line, i) in group.songs[0]!.snippet" :key="i">
                {{ line }}<br v-if="i < group.songs[0]!.snippet!.length - 1">
              </template>
            </p>
            <NuxtLink :to="songHref(group.songs[0]!)" class="scene__more">All the lyrics</NuxtLink>

            <div v-if="group.songs[0]!.story" class="scene__story">
              <b>The story</b>
              <p v-for="(para, i) in group.songs[0]!.story!.split(/\n\s*\n/)" :key="i">{{ para }}</p>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="quiet" :aria-label="`More songs: ${group.songs.map((s) => s.title).join(', ')}`">
        <div v-for="song in group.songs" :id="`song-${song.slug}`" :key="song.slug" class="quiet__row">
          <span class="quiet__n">{{ pad(song.number) }}</span>
          <h3>
            <NuxtLink :to="songHref(song)">{{ song.title }}</NuxtLink>
            <span v-if="song.tag" class="scene__tag">{{ song.tag }}</span>
          </h3>
          <p>{{ song.snippet?.[0] }}</p>
          <span class="quiet__end">
            <button
              type="button"
              class="scene__pp"
              :aria-label="isPlaying(song) ? `Pause ${song.title}` : `Play ${song.title}`"
              @click="toggle(song)"
            >
              <svg v-if="isPlaying(song)" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
              <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
            </button>
            {{ song.duration }}
          </span>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { journeys, type JourneySong } from '~~/shared/data/journey'
import { toSongRefs } from '~~/shared/utils/songSlug'
import { motifBody } from '~~/shared/video/motifs.mjs'
import { toPlayerTracks } from '~/composables/useAlbumPlayer'

const props = defineProps<{ album: Album }>()

const player = usePlayer()
const root = ref<HTMLElement | null>(null)

interface Song extends JourneySong {
  slug: string
  number: number
  title: string
  duration?: string
  story?: string
  /** Index into the player's list, or null with no audio. */
  playerIndex: number | null
}

const songs = computed<Song[]>(() => {
  const material = journeys[props.album.slug] ?? {}
  const playerIndex = new Map(toPlayerTracks(props.album).map((track, i) => [track.slug, i]))
  return toSongRefs(props.album).map((ref) => ({
    ...material[ref.slug],
    slug: ref.slug,
    number: ref.trackNumber,
    title: ref.track.title,
    duration: ref.track.duration,
    story: ref.track.writingStory?.trim() || undefined,
    playerIndex: playerIndex.get(ref.slug) ?? null,
  }))
})

const isScene = (song: Song) =>
  Boolean(song.image || song.motif || song.film || song.story || (song.snippet?.length ?? 0) >= 2)

/** Scenes one by one; neighbouring quiet songs share one block of rows. */
const groups = computed(() => {
  const out: { key: string, kind: 'scene' | 'quiet', songs: Song[] }[] = []
  for (const song of songs.value) {
    const kind = isScene(song) ? 'scene' : 'quiet'
    const last = out[out.length - 1]
    if (kind === 'quiet' && last?.kind === 'quiet') last.songs.push(song)
    else out.push({ key: song.slug, kind, songs: [song] })
  }
  return out
})

const pad = (n: number) => String(n).padStart(2, '0')
const songHref = (song: Song) => `/music/${props.album.slug}/${song.slug}`

const motifMarkup = (name: string) => {
  try {
    return motifBody(name).replace(/<(path|circle|rect|line|polyline|polygon|ellipse)\b/g, '<$1 pathLength="1"')
  }
  catch {
    return ''
  }
}

const isPlaying = (song: Song) => song.playerIndex !== null && player.isPlaying(props.album.slug, song.playerIndex)

function toggle(song: Song) {
  if (song.playerIndex === null) return
  player.toggleAlbum(props.album, song.playerIndex)
}

// Motifs: armed once we're running, drawn on as their scene arrives.
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (!root.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const motifs = root.value.querySelectorAll<SVGElement>('.scene__motif')
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-drawn')
        observer?.unobserve(entry.target)
      }
    }
  }, { rootMargin: '0px 0px -15% 0px' })
  motifs.forEach((m) => {
    m.classList.add('is-armed')
    observer!.observe(m)
  })
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.journey {
  --rule-dark: rgba(232, 230, 223, 0.12);
}

.scene {
  display: grid;
  grid-template-columns: 120px 1fr 1.1fr;
  gap: 56px;
  padding: 90px 56px;
  border-top: 1px solid var(--rule-dark);
  align-items: start;
}

.scene__n,
.quiet__n {
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--acc);
  padding-top: 12px;
}

.scene__head h2 {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(40px, 3.6vw, 52px);
  line-height: 1.02;
}

.scene__head a,
.quiet__row h3 a {
  text-decoration: none;
}

.scene__head a:hover,
.quiet__row h3 a:hover {
  color: var(--acc);
}

.scene__dur {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 18px;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--dim);
}

.scene__pp {
  width: 34px;
  height: 34px;
  border: 1px solid #e8e6df;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #e8e6df;
  background: transparent;
  cursor: pointer;
  flex: none;
}

.scene__pp:hover {
  background: #e8e6df;
  color: var(--floor);
}

.scene__pp svg {
  width: 11px;
  height: 11px;
}

.scene__tag {
  display: inline-block;
  margin-top: 16px;
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  border: 1px solid var(--rule-dark);
  padding: 5px 9px;
  color: var(--dim);
}

.quiet__row .scene__tag {
  margin: 0 0 0 12px;
  vertical-align: middle;
}

.scene__body {
  display: grid;
  gap: 32px;
  min-width: 0;
}

.scene__still img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.scene__still figcaption {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--dim);
}

.scene__still figcaption a {
  color: #e8e6df;
  text-decoration: none;
  white-space: nowrap;
}

.scene__words {
  position: relative;
}

.lyr {
  font-family: var(--font-display);
  font-size: 24px;
  line-height: 1.6;
  color: #d3d1c8;
  font-weight: 300;
}

.scene__more {
  display: inline-block;
  margin-top: 18px;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--acc);
  text-decoration: none;
}

.scene__story {
  margin-top: 34px;
  padding: 28px 30px;
  background: color-mix(in srgb, var(--floor) 70%, #2a3540);
  font-size: 16px;
  line-height: 1.8;
  color: #c9c7bf;
  font-weight: 300;
}

.scene__story b {
  display: block;
  font-weight: 300;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--acc);
  margin-bottom: 10px;
}

.scene__story p + p {
  margin-top: 14px;
}

.scene__motif {
  display: block;
  width: 88px;
  height: 88px;
  margin-bottom: 26px;
  fill: none;
  stroke: var(--acc);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.85;
}

.scene__motif.is-armed :deep(*) {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 2.4s cubic-bezier(0.3, 0.6, 0.2, 1);
}

.scene__motif.is-drawn :deep(*) {
  stroke-dashoffset: 0;
}

.quiet {
  padding: 20px 56px 60px;
  border-top: 1px solid var(--rule-dark);
}

.quiet__row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) minmax(0, 1.6fr) auto;
  gap: 56px;
  padding: 26px 0;
  border-bottom: 1px solid var(--rule-dark);
  align-items: baseline;
}

.quiet__row h3 {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 32px;
  line-height: 1.15;
}

.quiet__row p {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 20px;
  color: var(--dim);
}

.quiet__end {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: flex-end;
  font-size: 12px;
  color: var(--dim);
  letter-spacing: 0.14em;
}

/* Parallax: the picture, the words and the motif drift at different rates as
   a scene passes through the viewport. Transform only, from a visible rest. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .scene__still {
      animation: drift-slow linear both;
      animation-timeline: view();
      animation-range: entry 0% exit 100%;
    }

    .scene__words {
      animation: drift-fast linear both;
      animation-timeline: view();
      animation-range: entry 0% exit 100%;
    }

    .scene__head {
      animation: drift-mid linear both;
      animation-timeline: view();
      animation-range: entry 0% exit 100%;
    }
  }
}

@keyframes drift-slow {
  from { transform: translateY(36px); }
  to { transform: translateY(-36px); }
}

@keyframes drift-mid {
  from { transform: translateY(18px); }
  to { transform: translateY(-18px); }
}

@keyframes drift-fast {
  from { transform: translateY(64px); }
  to { transform: translateY(-64px); }
}

@media (max-width: 900px) {
  .scene {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 60px 20px;
  }

  .scene__n {
    padding-top: 0;
  }

  .scene__still,
  .scene__words,
  .scene__head {
    animation-name: drift-phone !important;
  }

  .quiet {
    padding: 10px 20px 40px;
  }

  .quiet__row {
    grid-template-columns: 32px 1fr auto;
    gap: 14px;
  }

  .quiet__row p {
    display: none;
  }

  .quiet__row h3 {
    font-size: 26px;
  }
}

@keyframes drift-phone {
  from { transform: translateY(12px); }
  to { transform: translateY(-12px); }
}
</style>
