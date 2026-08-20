<template>
  <section
    class="record-player-page"
    :data-bg="album.background || null"
  >
    <NuxtLink to="/listen" class="back-link">
      ← Albums
    </NuxtLink>

    <div class="stage" :class="{ 'is-playing': isPlaying }" :style="stageStyle">
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

      <TrackControls
        :is-playing="isPlaying"
        :side="side"
        :is-flipping="isFlipping"
        @toggle="togglePlay"
        @flip="flip"
      />
    </div>

    <audio ref="audioEl" preload="none" />
  </section>
</template>

<script setup lang="ts">
import type { ListenAlbum, ListenTrack } from '~~/shared/types'
import { CONTROL_DELAY_MS } from '~/utils/recordPlayer'
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
  currentTrack,
  currentTrackData,
  motorOn,
  armAngle,
  rotation,
  dragging,
  isFlipping,
  total,
  chooseTrack,
  setMotor,
  selectBySlug,
  flip,
  onArmPointerDown,
  onArmPointerMove,
  onArmPointerUp,
  onArmKeydown,
  onRecordPointerDown,
  onRecordKeydown,
} = player

// The deck is "playing" from the moment the platter starts turning, which is
// before the arm has moved and after the music has stopped.
const isPlaying = computed(() => motorOn.value)

// Where Play should drop the needle: wherever it was lifted from, or track 1.
const resumeTrack = ref(1)

watch(currentTrack, (track) => {
  if (track > 0) resumeTrack.value = track
})

// A flipped record starts over at the top of its new side.
watch(side, () => {
  resumeTrack.value = 1
})

// The play/stop switch acts a beat after it is pressed, like a real deck. Presses
// during that beat are ignored rather than queued.
let controlTimer: ReturnType<typeof setTimeout> | undefined

function togglePlay() {
  if (controlTimer) return
  const stopping = isPlaying.value

  // The platter spins up straight away — the arm follows once the switch acts.
  if (!stopping) setMotor(true)

  controlTimer = setTimeout(() => {
    controlTimer = undefined
    if (stopping) {
      chooseTrack(0)
      return
    }
    const target = Math.min(Math.max(1, resumeTrack.value), total.value)
    chooseTrack(target, { play: true })
  }, CONTROL_DELAY_MS)
}

const sideLabel = computed(() => side.value.toUpperCase())

const valueText = computed(() => (currentTrack.value === 0
  ? `Side ${sideLabel.value}, off`
  : `Side ${sideLabel.value}, track ${currentTrack.value}: ${currentTrackData.value?.title ?? ''}`))

const stageStyle = computed(() => ({
  '--arm-angle': `${armAngle.value}deg`,
  '--accent': currentTrackData.value?.accent ?? '#ef463b',
  '--accent-2': currentTrackData.value?.accent2 ?? '#ffd15c',
  '--accent-dark': currentTrackData.value?.accentDark ?? '#112644',
}))

onMounted(() => {
  // Seed from the incoming route. A track deep-link drops the needle straight in
  // (browser autoplay rules may defer the audio to the first gesture).
  if (props.initialTrackSlug) {
    selectBySlug(props.initialTrackSlug, { play: true })
  }
  else {
    chooseTrack(0)
  }
  ready.value = true
})

onUnmounted(() => {
  if (controlTimer) clearTimeout(controlTimer)
})
</script>
