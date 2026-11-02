<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / first cut
        </p>
        <h1 class="display-heading">
          Ivory — five blanks
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          He is in the crowd, she is on stage, and he falls for her in an
          instant; after the show he goes to talk to her and misses his chance.
          The film is a guessing game played for her name, five letters, six
          tries, three boards on one sheet. The guesses are the five-letter
          words he sings, typed in as he sings them and turned over to show how
          close they come: black for the right letter in the right place, blue
          for the right letter in the wrong place, pencil for a letter that is
          not in her name. Between guesses the row he is on spins through
          letters, looking for words for her. The red cursor is the one thing
          that travels.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          The song plays the game by itself: SHORE gets two letters, ASKED —
          both times he asks her name — gets nothing, and AVOID ("to avoid the
          heartache") comes closest of any real word. He wins the first two
          boards only in his head, by calling her Ivory. On the third he
          forgets how to breathe, a row goes by with nothing in it, and he runs
          out of tries. Only then does the answer come up, and on the last
          "Ivory" it leaves five blanks: her real name, which he never learned.
        </p>
      </header>

      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="blanksFrame" name="Five Blanks" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 3:08' }}
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
          useful note is a time and what you saw: "at 1:28 ASKED turns over
          before he sings it".
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

      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The guesses
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every row, as the film plays it, scored against IVORY. A dash is the
          row he loses on "I forgot how to breathe".
        </p>
        <div class="grid gap-6 sm:grid-cols-3">
          <div v-for="game in GAMES" :key="game.name" class="space-y-2">
            <p class="label-text text-[0.55rem]">
              {{ game.name }} · {{ game.won ? 'won, in his head' : 'lost' }}
            </p>
            <ol class="space-y-1 font-mono text-sm">
              <li v-for="(row, i) in game.rows" :key="i" class="flex gap-3">
                <span class="w-12 muted-text">{{ clock(row.at) }}</span>
                <span class="w-16">{{ row.word ?? '— — —' }}</span>
                <span class="muted-text">{{ row.marks }}</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <p class="text-sm leading-relaxed muted-text">
        <NuxtLink to="/music-videos/ideas#ivory" class="underline">← All the ideas</NuxtLink>
        · The printmaking film (the etching) is at
        <NuxtLink to="/music-videos/ivory-print" class="underline">/music-videos/ivory-print</NuxtLink>.
        · <NuxtLink to="/music-videos/conman" class="underline">Conman, the city →</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/ivory — Ivory as five blanks, a guessing game for her name
 * (shared/video/films/blanks.mjs), the whole song with a projector. The
 * etching that was here is at /music-videos/ivory-print. Unlisted and
 * noindexed like everything under /music-videos.
 */
import { IVORY_SCORE, sectionAt } from '~/config/ivoryScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { blanksFrame, blanksGames } from '~~/shared/video/films/blanks.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Ivory — five blanks',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = IVORY_SCORE
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/* At rest, before anyone presses play: the first board, just solved. */
const POSTER_AT = 44
const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)
const currentSection = computed(() => sectionAt(player.time.value))

const GAMES = blanksGames(score)

const BEATS = [
  { at: 0, label: 'Opening', note: 'The mark drawn on, then the title, then the black lifts off an empty board.' },
  { at: 9, label: 'First sight', note: 'WOMAN, SHORE (two letters right), OCEAN, WINGS, STAGE. The row he is on spins between guesses while he sings.' },
  { at: 40, label: 'Ivory', note: 'He types IVORY on the last row and it turns over solved: named, in his head, in an instant.', key: true },
  { at: 50, label: 'My mystery', note: 'The letters lift off and only the colours stay; "Oh, Ivory" brings the name back for a breath.' },
  { at: 58, label: 'Getting close', note: 'Across to the second board: MOVES, STARE, RIGHT, WHERE.' },
  { at: 87, label: 'Her name', note: 'He asks her name: ASKED turns over with nothing right. Then IVORY again, on the last row.', key: true },
  { at: 105, label: 'Just for me', note: 'On "I\'ll keep this one just for me" the letters lift again.' },
  { at: 112.6, label: 'Interlude', note: 'Back over the sheet: two boards in colours only, and the third, empty.' },
  { at: 128, label: 'The last chance', note: 'COULD, LOVES, and ASKED once more — she asks his name.' },
  { at: 136, label: 'Breathe', note: 'On "I forgot how to breathe" the row stops spinning and nothing is typed. The row turns over empty: a try lost.', key: true },
  { at: 150, label: 'Walks', note: 'WALKS (she walks away), then AVOID on the last row — the closest any word gets, and not it.' },
  { at: 164, label: 'The answer', note: 'Only now the game is lost does IVORY come up under the board.', key: true },
  { at: 173, label: 'Five blanks', note: 'On the last "Ivory" its letters lift off and five blanks are left. The camera goes in on them to the end card.', key: true },
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
