<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / the whole film
        </p>
        <h1 class="display-heading">
          Goodbye, Norma Jeane — the marquee
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          The mark drawn on, the title drawn on, then the black lifts off a dark
          picture-house letter board. It turns over into NORMA JEANE as the voice
          comes in, then flips through all twenty-nine of her films in release
          order, and spins down to nothing after <em>Something's Got to Give</em>.
          On the last hit, the mark. Her name is never spelled, but three times
          it shows through the scramble in red.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          The board follows the song. In the verses a title lands on every
          phrase, every four bars; in the pre-choruses and breaks, every two. In
          the bar where the record drops out before a chorus, the board flips
          blank and the bulbs go out. Then the chorus answers itself: GOODBYE on
          "Goodbye", NORMA on "Norma", JEANE on "Jean", and on "more, more, more"
          the board turns to MORE a row at a time.
        </p>
      </header>

      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="marqueeFrame" name="The Marquee" :score="score" :t="frameTime" uid="film" />

          <button
            v-if="!player.playing.value"
            type="button"
            class="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/10 transition-colors duration-200 hover:bg-black/0"
            aria-label="Play the film"
            @click="player.toggle()"
          >
            <span class="flex items-center gap-3 rounded-full bg-black/55 px-6 py-3 text-white backdrop-blur-sm">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span class="label-text text-[0.62rem]">
                {{ player.time.value > 0.5 ? 'Resume' : 'Play' }}
              </span>
            </span>
          </button>
        </div>

        <MusicVideoTransport
          :time="player.time.value"
          :duration="score.duration"
          :progress="player.progress.value"
          :playing="player.playing.value"
          :muted="player.muted.value"
          :sections="score.sections"
          :current="currentSection"
          @toggle="player.toggle()"
          @seek="player.seek"
          @update:muted="player.muted.value = $event"
          @fullscreen="toggleFullscreen"
        />

        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label class="flex cursor-pointer items-center gap-2">
            <input v-model="loop" type="checkbox">
            Loop the motion test, {{ clock(TEST.from) }}–{{ clock(TEST.to) }}
          </label>
          <span class="muted-text">Now: {{ clock(player.time.value) }} · {{ currentSection.label }}</span>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          Jump to
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Tap a moment to start the film there. When something is off, the most
          useful note is a time and what you saw: "at 1:42 GOODBYE comes in
          before the word".
        </p>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="beat in BEATS" :key="beat.at">
            <button
              type="button"
              class="flex w-full cursor-pointer items-baseline gap-4 py-3 text-left transition-colors duration-150 hover:text-[color:var(--color-accent)]"
              @click="jump(beat.at)"
            >
              <span class="w-12 shrink-0 font-mono text-xs muted-text">{{ clock(beat.at) }}</span>
              <span class="min-w-0 flex-1 text-sm leading-relaxed">
                <span class="label-text mr-2 text-[0.55rem]" :class="beat.key ? 'text-[color:var(--color-accent)]' : ''">{{ beat.label }}</span>
                <span class="muted-text">{{ beat.note }}</span>
              </span>
            </button>
          </li>
        </ol>
        <details class="text-sm">
          <summary class="cursor-pointer muted-text">
            Every film, where it lands
          </summary>
          <ol class="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <li v-for="(f, i) in moments.titles" :key="f.at">
              <button type="button" class="text-left hover:underline" @click="jump(f.at - 1)">
                <span class="font-mono text-xs muted-text">{{ clock(f.at) }}</span> &nbsp;{{ i + 1 }}. {{ f.title }}
              </button>
            </li>
          </ol>
        </details>
      </section>

      <p class="text-sm leading-relaxed muted-text">
        <NuxtLink to="/music-videos/ideas#goodbye-norma-jeane" class="underline">← All the ideas</NuxtLink>
        · The earlier printmaking film is at
        <NuxtLink to="/music-videos/goodbye-norma-jeane-print" class="underline">/music-videos/goodbye-norma-jeane-print</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/goodbye-norma-jeane — the marquee, the whole song
 * (shared/video/films/marquee.mjs), with Into the Wild's opening and end card.
 * Unlisted and noindexed like everything under /music-videos. The 30-second
 * motion test the flaps were chosen on (2026-11-02) is still a loop away.
 */
import { GOODBYE_NORMA_JEANE_SCORE, sectionAt } from '~/config/goodbyeNormaJeaneScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { marqueeFrame, marqueeMoments } from '~~/shared/video/films/marquee.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Goodbye, Norma Jeane — the marquee',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = GOODBYE_NORMA_JEANE_SCORE
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')
const moments = marqueeMoments(score)

/* At rest, before anyone presses play: GOODBYE, NORMA JEANE in the first chorus. */
const POSTER_AT = moments.hooks[0]! + 0.6

/* The motion test: verse 2 from The Fireball's hold, the first clue, into the first chorus. */
const TEST = { from: 74.5, to: 104.5 }
const loop = ref(false)
watch(() => player.time.value, (t) => {
  if (loop.value && player.playing.value && (t >= TEST.to || t < TEST.from - 0.5)) player.seek(TEST.from)
})
const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)
const currentSection = computed(() => sectionAt(player.time.value))

const firstFilm = moments.titles[0]!
const BEATS = [
  { at: 0, label: 'Opening', note: 'The mark drawn on, then the title, then the black lifts off the dark marquee as its bulbs start to come on.' },
  { at: moments.nj - 3, label: 'Norma Jeane', note: `The board turns over into NORMA JEANE on "Silver screen" (${clock(moments.nj)}) and holds it through the first half of verse 1.` },
  { at: firstFilm.at - 2, label: 'The first film', note: `${firstFilm.title} (${clock(firstFilm.at)}), then a title every four bars in the verses, every two in the pre-choruses.` },
  { at: moments.drops[0]! - 1.5, label: 'The first drop', note: `The record drops out at ${clock(moments.drops[0]!)}: the board flips blank and the bulbs go out, then Love Happy slams down all at once on the downbeat.`, key: true },
  { at: moments.clues[0]! - 2, label: 'Clue 1', note: 'M, Y and O in red, in her places, for a beat and a half.' },
  { at: moments.drops[1]! - 1.5, label: 'Chorus 1', note: `Dark for the drop bar, then GOODBYE on "Goodbye", NORMA on "Norma", JEANE on "Jean" (${clock(moments.hooks[0]!)}).`, key: true },
  { at: moments.mores[0]! - 3, label: 'More, more, more', note: 'The board turns to MORE a row at a time, one row on each word.', key: true },
  { at: 124, label: 'Break 2', note: 'Gold lights; a title every two bars.' },
  { at: moments.clues[1]! - 2, label: 'Clue 2', note: 'Six of her letters.' },
  { at: moments.drops[2]! - 1.5, label: 'Chorus 2', note: 'The drop, GOODBYE, NORMA JEANE, MORE MORE MORE.' },
  { at: moments.clues[2]! - 2, label: 'Clue 3', note: 'Nine of her letters, and the scramble runs straight into the last GOODBYE.', key: true },
  { at: moments.sgtg - 6, label: "Something's Got to Give", note: 'After The Misfits it starts to spell and never finishes; the letters keep spinning and die out one by one.' },
  { at: moments.last - 5, label: 'The end', note: `The last letters and bulbs go, and on the last hit (${clock(moments.last)}) the mark.` },
]

const jump = (at: number) => {
  loop.value = false
  player.seek(Math.max(0, at))
  if (!player.playing.value) player.toggle()
}

function clock(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const toggleFullscreen = () => {
  const element = stage.value
  if (!element) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void element.requestFullscreen?.()
}

const onKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (target && /^(?:INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  const step = event.shiftKey ? 15 : 5
  switch (event.key) {
    case ' ':
      player.toggle()
      break
    case 'ArrowRight':
      player.seek(player.time.value + step)
      break
    case 'ArrowLeft':
      player.seek(player.time.value - step)
      break
    case 'm':
    case 'M':
      player.muted.value = !player.muted.value
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
    default:
      return
  }
  event.preventDefault()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
