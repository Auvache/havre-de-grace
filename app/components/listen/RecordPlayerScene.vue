<template>
  <section
    ref="wrapperEl"
    class="record-player-page"
    :class="{ 'is-grabbing': canvas.isDragging.value }"
    :data-bg="album.background || null"
    @pointerdown="canvas.onPointerDown"
    @pointermove="canvas.onPointerMove"
    @pointerup="canvas.onPointerUp"
    @pointercancel="canvas.onPointerCancel"
  >
    <div class="scene-topbar">
      <NuxtLink to="/listen" class="back-link" data-no-pan>
        ← Albums
      </NuxtLink>

      <TrackControls
        :tracks="sideTracks"
        :current-track="currentTrack"
        :side="side"
        :is-flipping="isFlipping"
        @select="onSelectButton"
        @flip="flip"
      />
    </div>

    <div
      ref="canvasEl"
      class="scene"
      :class="{ 'is-changing': isChanging }"
      :data-mode="renderedMode"
      :style="sceneStyle"
    >
      <AlbumCollage :album="album" :track="renderedTrackData" />

      <Turntable
        ref="turntable"
        :flipped="side === 'b'"
        :rotation-deg="rotation"
        :dragging="dragging"
        :value-now="currentTrack"
        :value-max="total"
        :value-text="valueText"
        @arm-pointerdown="onArmPointerDown"
        @arm-pointermove="onArmPointerMove"
        @arm-pointerup="onArmPointerUp"
        @arm-keydown="onArmKeydown"
        @record-pointerdown="onRecordPointerDown"
        @record-keydown="onRecordKeydown"
      />
    </div>

    <audio ref="audioEl" preload="none" />

    <!-- One-shot affordance hint: fades in on load, fades itself out after a beat. -->
    <Transition name="drag-hint">
      <div v-if="showHint" class="drag-hint" aria-hidden="true">
        <span class="drag-hint-inner">
          <span class="drag-hint-icon">✥</span>
          Drag to look around
        </span>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import type { ListenAlbum, ListenTrack } from '~~/shared/types'
import { SCENE_HEIGHT, SCENE_WIDTH } from '~/utils/recordPlayer'
import '~/assets/css/record-player.css'

const props = defineProps<{
  album: ListenAlbum
  tracks: ListenTrack[]
  initialTrackSlug?: string
}>()

const route = useRoute()
const router = useRouter()

// Group the album's tracks by vinyl side for the (side-gated) player.
const sides = computed(() => ({
  a: props.tracks.filter((track) => track.side === 'a'),
  b: props.tracks.filter((track) => track.side === 'b'),
}))

const wrapperEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLElement | null>(null)
const audioEl = ref<HTMLAudioElement | null>(null)
const turntable = ref<{ turntableEl: HTMLElement | null, recordWrapEl: HTMLElement | null } | null>(null)

const turntableEl = computed(() => turntable.value?.turntableEl ?? null)
const recordWrapEl = computed(() => turntable.value?.recordWrapEl ?? null)

const ready = ref(false)

// Reflect the selected track in the URL (Off -> /listen/[album], track -> .../[slug]).
// router.replace keeps track changes out of the browser history. This only runs
// after the initial seed so it never fights the incoming route.
function syncUrl(track: ListenTrack | null) {
  if (!ready.value) return
  const base = `/listen/${props.album.slug}`
  const to = track ? `${base}/${track.slug}` : base
  if (route.path !== to) {
    router.replace(to)
  }
}

const player = useRecordPlayer({
  sides,
  audioEl,
  turntableEl,
  recordWrapEl,
  onSelect: syncUrl,
})

const {
  side,
  tracks: sideTracks,
  currentTrack,
  currentTrackData,
  renderedTrackData,
  renderedMode,
  armAngle,
  rotation,
  dragging,
  isChanging,
  isFlipping,
  total,
  chooseTrack,
  selectBySlug,
  flip,
  onArmPointerDown,
  onArmPointerMove,
  onArmPointerUp,
  onArmKeydown,
  onRecordPointerDown,
  onRecordKeydown,
} = player

const canvas = useListenCanvas({
  wrapperEl,
  canvasEl,
  sceneWidth: SCENE_WIDTH,
  sceneHeight: SCENE_HEIGHT,
})

// "Drag to look around" affordance: show briefly on load, then auto-dismiss. Also
// dismiss early once the visitor starts dragging — they've clearly got the idea.
const showHint = ref(true)
let hintTimer: ReturnType<typeof setTimeout> | undefined

function dismissHint() {
  showHint.value = false
  if (hintTimer) clearTimeout(hintTimer)
  hintTimer = undefined
}

watch(() => canvas.isDragging.value, (dragging) => {
  if (dragging) dismissHint()
})

const sideLabel = computed(() => side.value.toUpperCase())

const valueText = computed(() => (currentTrack.value === 0
  ? `Side ${sideLabel.value}, off: album story`
  : `Side ${sideLabel.value}, track ${currentTrack.value}: ${currentTrackData.value?.title ?? ''}`))

const LAYOUT_VAR_NAMES = {
  lyrics: 'lyrics',
  storyA: 'story-a',
  storyB: 'story-b',
  annotations: 'annotations',
  imageA: 'image-a',
  imageB: 'image-b',
} as const

const sceneStyle = computed(() => {
  const current = currentTrackData.value
  const style: Record<string, string> = {
    '--arm-angle': `${armAngle.value}deg`,
    '--accent': current?.accent ?? '#ef463b',
    '--accent-2': current?.accent2 ?? '#ffd15c',
    '--accent-dark': current?.accentDark ?? '#112644',
  }

  const layout = renderedTrackData.value?.layout
  if (layout) {
    for (const key of Object.keys(LAYOUT_VAR_NAMES) as Array<keyof typeof LAYOUT_VAR_NAMES>) {
      const [x, y, rotate] = layout[key]
      const cssName = LAYOUT_VAR_NAMES[key]
      style[`--${cssName}-x`] = `${x}px`
      style[`--${cssName}-y`] = `${y}px`
      style[`--${cssName}-rotate`] = `${rotate}deg`
    }
  }

  return style
})

function onSelectButton(trackNumber: number) {
  chooseTrack(trackNumber, {
    play: trackNumber > 0,
    fadeIfOff: trackNumber === 0,
    animate: true,
  })
}

onMounted(() => {
  // Seed from the incoming route. A track deep-link animates the arm across and
  // attempts to play (browser autoplay rules may defer audio to the first gesture).
  if (props.initialTrackSlug) {
    selectBySlug(props.initialTrackSlug, { play: true, animate: true })
  }
  else {
    chooseTrack(0, { animate: false })
  }
  ready.value = true
  nextTick(() => canvas.recenter())

  // Hint is visible from first paint; hold it a beat, then fade it out.
  hintTimer = setTimeout(dismissHint, 2500)
})

onUnmounted(() => {
  if (hintTimer) clearTimeout(hintTimer)
})
</script>
