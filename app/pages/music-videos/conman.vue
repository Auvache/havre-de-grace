<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / first cut
        </p>
        <h1 class="display-heading">
          Conman — the city
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          The mark drawn on, the title drawn on, then the black lifts off a
          town plan, close on one empty lot, and the first plan is drawn into
          it wall by wall. Five jobs, each in its own empty lot, each harder
          than the last: a record shop, a counting house ("cooking books"), a
          studio ("here to steal your sound"), a museum through the break, and
          a concert hall, where one of the crew comes up through the trap, one
          comes down the fly tower, and the conman walks in the front, buys a
          ticket and stands centre stage with all the eyes on him.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Each getaway is a red line through the streets to the next empty lot.
          What gets taken turns up later, in green and unlabelled: the record
          from the shop on the studio's desk, and the hall holding all of it.
          In the last chorus the crew leave the hall round both sides of the
          crescent while the camera pulls back to the whole town, and the red
          they have left all song is the band's anchor. On the last hit, the
          mark.
        </p>
      </header>

      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="conmanCityFrame" name="The City" :score="score" :t="frameTime" uid="film" />

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

        <p class="text-sm muted-text">
          Now: {{ clock(player.time.value) }} · {{ currentSection.label }}
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          Jump to
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Tap a moment to start the film there. When something is off, the most
          useful note is a time and what you saw: "at 1:24 the car goes off the
          edge of the frame".
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
      </section>

      <section class="space-y-6 border-t border-theme pt-10">
        <header class="max-w-3xl space-y-3">
          <h2 class="section-heading text-[1.35rem]">
            The stills it came from
          </h2>
          <p class="text-sm leading-relaxed muted-text">
            The three ways first tried with the same plans, twelve frames each
            at the same twelve seconds of the record. The city is the one the
            film above grew from (its last job was still the Reserve, a bank).
          </p>
        </header>

        <nav class="border-y border-theme py-5" aria-label="Versions">
          <ol class="flex flex-wrap gap-x-6 gap-y-2">
            <li v-for="(v, i) in CONMAN_HEIST_VARIANTS" :key="v.id">
              <a :href="`#${v.id}`" class="label-text text-[0.62rem] hover:text-[color:var(--color-accent)]">{{ i + 1 }} · {{ v.name }}</a>
            </li>
          </ol>
        </nav>

        <section
          v-for="(v, i) in CONMAN_HEIST_VARIANTS"
          :id="v.id"
          :key="v.id"
          class="scroll-mt-8 border-b border-theme py-10"
        >
          <header class="mb-6 max-w-3xl space-y-3">
            <p class="font-mono text-sm muted-text">
              {{ i + 1 }} / {{ CONMAN_HEIST_VARIANTS.length }}
            </p>
            <h3 class="section-heading text-[1.2rem]">
              {{ v.name }}
            </h3>
            <p class="text-sm leading-relaxed muted-text">
              {{ v.summary }}
            </p>
          </header>

          <ol class="grid gap-x-4 gap-y-6 sm:grid-cols-2">
            <li v-for="still in v.stills" :key="still.src" class="min-w-0">
              <figure class="space-y-2">
                <VideoStyleSheet :src="still.src" ratio="16 / 9" />
                <figcaption class="text-xs muted-text">
                  <span class="font-mono">{{ clock(still.time) }}</span>
                  <span class="label-text ml-2 text-[0.55rem]">{{ still.section }}</span>
                  <span v-if="still.line" class="ml-2">{{ still.line }}</span>
                </figcaption>
              </figure>
            </li>
          </ol>
        </section>
      </section>

      <p class="text-sm leading-relaxed muted-text">
        <NuxtLink to="/music-videos/ideas#conman" class="underline">← All the ideas</NuxtLink>
        · The earlier printmaking film is at
        <NuxtLink to="/music-videos/conman-print" class="underline">/music-videos/conman-print</NuxtLink>.
        · <NuxtLink to="/music-videos/into-the-wild" class="underline">Into the Wild, the maze →</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/conman — Conman as a city of heist plans
 * (shared/video/films/conman-city.mjs), the whole song with a projector, and
 * under it the stills it grew from (generated by `SITE=1 node
 * tools/video-styles/visualizers/heist-build.mjs`). Unlisted and noindexed
 * like everything under /music-videos.
 */
import { CONMAN_SCORE, sectionAt } from '~/config/conmanScore'
import { CONMAN_HEIST_VARIANTS } from '~/config/conmanHeistVariants'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { conmanCityFrame } from '~~/shared/video/films/conman-city.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Conman — the city',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = CONMAN_SCORE
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/* At rest, before anyone presses play: the counting house mid-job. */
const POSTER_AT = 66
const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)
const currentSection = computed(() => sectionAt(player.time.value))

const BEATS = [
  { at: 0, label: 'Opening', note: 'The mark drawn on, then the title, then the black lifts off the town, close on an empty lot.' },
  { at: 12, label: 'The record shop', note: 'The first plan drawn into the lot, wall by wall; on "I\'m a conman" he walks in, browses, talks shop, and takes the masters out the back.' },
  { at: 42, label: 'First getaway', note: 'Round the roundabout and down Main Street to the next empty lot.' },
  { at: 50, label: 'The counting house', note: 'A customer opens an account while the auditor cooks the books and empties the vault.' },
  { at: 77, label: 'Chorus', note: 'Round the other roundabout and down the High Street to the studio.' },
  { at: 91, label: 'The studio', note: 'You sing and play; the shadow follows you, the taker steals your sound. The record from the shop is on the desk.' },
  { at: 122, label: 'Chorus', note: 'Up the High Street and round the circus to the museum in its garden.' },
  { at: 135, label: 'The museum', note: 'The break: the last tour, the power cut, down the skylight, the portrait swapped.', key: true },
  { at: 160, label: 'To the hall', note: 'Straight down the High Street to the concert hall on the crescent.' },
  { at: 165, label: 'The concert hall', note: 'Up through the trap, down the fly tower, and the conman centre stage with all the eyes on him. Everything taken before is in the building.', key: true },
  { at: 188, label: 'The anchor', note: 'Two cars, one round each arm of the crescent, and the camera pulls back until the whole town is in: the red is the anchor. The mark on the last hit (3:52).', key: true },
]

const jump = (at: number) => {
  player.seek(at)
  if (!player.playing.value) player.toggle()
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

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
