<template>
  <div class="space-y-10">
    <section class="space-y-5">
      <!-- Tests: alternatives under review, switched in place (?test=<key>). Gone once one is picked. -->
      <div v-if="tests.length" class="flex flex-wrap items-baseline gap-x-4 gap-y-2" role="group" aria-label="Tests">
        <span class="label-text text-[0.6rem] muted-text">Test</span>
        <button
          v-for="option in testOptions"
          :key="option.key"
          type="button"
          class="label-text cursor-pointer text-[0.6rem] transition-colors duration-150 hover:text-[color:var(--color-accent)]"
          :class="option.key === testKey ? 'text-[color:var(--color-accent)] underline underline-offset-4' : ''"
          :aria-pressed="option.key === testKey"
          @click="pickTest(option.key)"
        >
          {{ option.label }}
        </button>
      </div>

      <div
        ref="stage"
        class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
        :style="{ aspectRatio: '16 / 9' }"
      >
        <MusicVideoSvgFilm :key="testKey" :film="shownFilm" :name="name" :score="score" :t="frameTime" uid="film" />

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
        Now: {{ clock(player.time.value) }} · {{ currentSection.label }}<template v-if="status">
          · {{ status(player.time.value) }}
        </template>
      </p>
    </section>

    <section v-if="beats.length" class="space-y-4">
      <h2 class="section-heading text-[1.35rem]">
        Jump to
      </h2>
      <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
        <li v-for="beat in beats" :key="beat.at">
          <button
            type="button"
            class="flex w-full cursor-pointer items-baseline gap-4 py-3 text-left transition-colors duration-150 hover:text-[color:var(--color-accent)]"
            @click="jump(beat.at)"
          >
            <span class="w-12 shrink-0 font-mono text-xs muted-text">{{ clock(beat.at) }}</span>
            <span class="label-text text-[0.6rem]" :class="beat.key ? 'text-[color:var(--color-accent)]' : ''">{{ beat.label }}</span>
          </button>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
/*
 * One visualizer, whole song: the film, the transport and the moments to jump
 * to. Every /visualizers/<song> page with a film is this and a title, in the
 * format the Into the Wild maze page set. What each moment is for lives in
 * docs/visualizers/<song>.md, not here.
 *
 * The film is a pure function of the clock (shared/video/films/<film>.mjs), so
 * the projector has no analyser to feed.
 */
import type { TransportSection } from '~/components/musicvideo/MusicVideoTransport.vue'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'

type FrameFn = (options: { time: number, score: any, lockup: string, uid: string }) => { svg: string, label: string, lib?: string[] }

/** An alternative under review: a mock-up, still or motion test of the film. */
export interface VisualizerTest {
  /** The ?test= value, e.g. 'a'. */
  key: string
  label: string
  film: FrameFn
}

export interface VisualizerBeat {
  /** Song seconds. */
  at: number
  label: string
  /** Shown in red: the moments that carry the film. */
  key?: boolean
}

const props = withDefaults(defineProps<{
  film: FrameFn
  /** The film's name, for the accessible label. */
  name: string
  score: { title: string, artist: string, src: string, duration: number, sections: readonly TransportSection[], [key: string]: any }
  /** The frame held before anyone presses play, in song seconds. */
  posterAt: number
  beats?: VisualizerBeat[]
  /** Extra state for the "Now" line (the maze's mood). */
  status?: (time: number) => string
  /** Alternatives to switch between in place; the film itself is listed first as "Current". */
  tests?: VisualizerTest[]
}>(), { beats: () => [], status: undefined, tests: () => [] })

/*
 * Tests are chosen after mount, from ?test=: the page is prerendered without a
 * query, so reading it during hydration would draw one film on the server and
 * another in the browser.
 */
const route = useRoute()
const router = useRouter()
const testKey = ref('')
const testOptions = computed(() => [{ key: '', label: 'Current', film: props.film }, ...props.tests])
const shownFilm = computed(() => testOptions.value.find((o) => o.key === testKey.value)?.film ?? props.film)
const readTest = () => {
  const q = route.query.test
  const key = typeof q === 'string' ? q : ''
  testKey.value = props.tests.some((o) => o.key === key) ? key : ''
}
const pickTest = (key: string) => {
  testKey.value = key
  const query = { ...route.query }
  if (key) query.test = key
  else delete query.test
  void router.replace({ query })
}
onMounted(readTest)
watch(() => route.query.test, readTest)

const player = useMusicVideoPlayer(props.score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? props.posterAt : player.time.value,
)

const currentSection = computed(() => {
  const t = player.time.value
  const sections = props.score.sections
  return sections.find((s) => t >= s.from && t < s.to) ?? sections[sections.length - 1]!
})

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const jump = (at: number) => {
  player.seek(Math.max(0, at))
  if (!player.playing.value) player.toggle()
}

const toggleFullscreen = () => {
  const element = stage.value
  if (!element) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void element.requestFullscreen?.()
}

/* Keyboard on the window: the thing being watched is the film. */
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
