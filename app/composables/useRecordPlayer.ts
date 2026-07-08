import type { Ref } from 'vue'
import type { ListenTrack } from '~~/shared/types'
import {
  FLIP_MS,
  OFF_ANGLE,
  OFF_RELEASE_BOUNDARY,
  PAGE_TRANSITION_MS,
  PLAY_INNER_ANGLE,
  PLAY_OUTER_ANGLE,
  RECORD_INNER_RATIO,
  RECORD_OUTER_RATIO,
  SPIN_RATE,
  START_RAMP_MS,
  STOP_RAMP_MS,
  TURNTABLE_PIVOT_RATIO,
  makeTrackBoundaries,
} from '~/utils/recordPlayer'

interface ChooseOptions {
  play?: boolean
  fadeIfOff?: boolean
  animate?: boolean
}

interface UseRecordPlayerArgs {
  // Tracks grouped by vinyl side. Only the up side responds to the player.
  sides: Ref<{ a: ListenTrack[], b: ListenTrack[] }>
  audioEl: Ref<HTMLAudioElement | null>
  turntableEl: Ref<HTMLElement | null>
  recordWrapEl: Ref<HTMLElement | null>
  // Called whenever the selected track changes (null = Off). Used for URL sync.
  onSelect?: (track: ListenTrack | null) => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function useRecordPlayer({ sides, audioEl, turntableEl, recordWrapEl, onSelect }: UseRecordPlayerArgs) {
  const side = ref<'a' | 'b'>('a') // which face is up
  // The working set is always the up side's tracks; currentTrack is 1-based within it.
  const tracks = computed(() => sides.value[side.value])
  const total = computed(() => tracks.value.length)
  const boundaries = computed(() => makeTrackBoundaries(total.value))

  const currentTrack = ref(0) // 0 = Off, 1..N (within the current side)
  const renderedTrack = ref(0) // what the collage currently shows (swaps mid-transition)
  const armAngle = ref(OFF_ANGLE)
  const isChanging = ref(false)
  const isFlipping = ref(false)
  const dragging = ref(false)
  const rotation = ref(0)

  const mode = computed(() => (currentTrack.value === 0 ? 'off' : 'song'))
  const renderedMode = computed(() => (renderedTrack.value === 0 ? 'off' : 'song'))
  const currentTrackData = computed(() => trackByNumber(currentTrack.value))
  const renderedTrackData = computed(() => trackByNumber(renderedTrack.value))

  let spinRate = 0
  let spinFrame = 0
  let lastSpinTime = 0
  let audioFadeFrame = 0
  let transitionTimer: ReturnType<typeof setTimeout> | null = null
  let transitionId = 0
  let flipTimer: ReturnType<typeof setTimeout> | null = null

  function trackByNumber(n: number): ListenTrack | null {
    return n === 0 ? null : tracks.value[n - 1] ?? null
  }

  // --- angle / zone math ---
  function normalizePointerAngle(angle: number) {
    return clamp(angle, OFF_ANGLE, PLAY_INNER_ANGLE)
  }

  function setArmAngle(angle: number) {
    armAngle.value = normalizePointerAngle(angle)
  }

  function angleProgress(angle: number) {
    const clamped = clamp(angle, PLAY_OUTER_ANGLE, PLAY_INNER_ANGLE)
    return (clamped - PLAY_OUTER_ANGLE) / (PLAY_INNER_ANGLE - PLAY_OUTER_ANGLE)
  }

  function trackFromArmAngle(angle: number) {
    if (angle <= OFF_RELEASE_BOUNDARY) {
      return 0
    }
    const progress = angleProgress(angle)
    const b = boundaries.value
    for (let i = 1; i <= total.value; i += 1) {
      if (progress >= b[i - 1]! && progress < b[i]!) {
        return i
      }
    }
    return total.value
  }

  function angleForTrackStart(n: number) {
    if (n === 0) {
      return OFF_ANGLE
    }
    const progress = boundaries.value[n - 1]!
    return PLAY_OUTER_ANGLE + progress * (PLAY_INNER_ANGLE - PLAY_OUTER_ANGLE)
  }

  function getPivotPoint() {
    const el = turntableEl.value
    if (!el) {
      return { x: 0, y: 0 }
    }
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + rect.width * TURNTABLE_PIVOT_RATIO.x,
      y: rect.top + rect.height * TURNTABLE_PIVOT_RATIO.y,
    }
  }

  function angleFromPointer(event: PointerEvent) {
    const pivot = getPivotPoint()
    const raw = (Math.atan2(event.clientY - pivot.y, event.clientX - pivot.x) * 180) / Math.PI
    let cssAngle = raw - 180
    while (cssAngle < -180) cssAngle += 360
    while (cssAngle > 180) cssAngle -= 360
    return cssAngle
  }

  function trackFromRecordClick(event: PointerEvent) {
    const el = recordWrapEl.value
    if (!el) {
      return total.value
    }
    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const radius = Math.min(rect.width, rect.height) / 2
    const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY)
    const outer = radius * RECORD_OUTER_RATIO
    const inner = radius * RECORD_INNER_RATIO
    const clamped = clamp(distance, inner, outer)
    const progress = (outer - clamped) / (outer - inner)
    const b = boundaries.value
    for (let i = 1; i <= total.value; i += 1) {
      if (progress >= b[i - 1]! && progress < b[i]!) {
        return i
      }
    }
    return total.value
  }

  // --- content transition (fade out, swap at midpoint, fade in) ---
  function renderContent(n: number, animate = true) {
    const doRender = () => {
      renderedTrack.value = n
    }

    if (!animate || renderedTrack.value === n) {
      if (transitionTimer) clearTimeout(transitionTimer)
      isChanging.value = false
      doRender()
      return
    }

    const id = ++transitionId
    if (transitionTimer) clearTimeout(transitionTimer)
    isChanging.value = true
    transitionTimer = setTimeout(() => {
      if (id !== transitionId) return
      doRender()
      requestAnimationFrame(() => {
        if (id === transitionId) isChanging.value = false
      })
    }, PAGE_TRANSITION_MS / 2)
  }

  // --- audio ---
  function cancelAudioFade() {
    if (audioFadeFrame) cancelAnimationFrame(audioFadeFrame)
    audioFadeFrame = 0
  }

  function resetAudioToStart() {
    const audio = audioEl.value
    if (audio) {
      try {
        audio.currentTime = 0
      }
      catch {
        // ignore — src may not be set yet
      }
    }
  }

  function fadeOutAudio(duration = STOP_RAMP_MS) {
    const audio = audioEl.value
    if (!audio) return
    cancelAudioFade()

    if (audio.paused || audio.volume === 0) {
      audio.pause()
      resetAudioToStart()
      audio.volume = 1
      return
    }

    const startVolume = audio.volume
    const startTime = performance.now()
    const fade = (now: number) => {
      const progress = clamp((now - startTime) / duration, 0, 1)
      audio.volume = startVolume * (1 - progress)
      if (progress < 1) {
        audioFadeFrame = requestAnimationFrame(fade)
        return
      }
      audio.pause()
      resetAudioToStart()
      audio.volume = 1
      audioFadeFrame = 0
    }
    audioFadeFrame = requestAnimationFrame(fade)
  }

  function playTrackAudio(n: number) {
    const audio = audioEl.value
    const track = trackByNumber(n)
    if (!audio || !track || !track.audioSrc) return
    cancelAudioFade()
    audio.volume = 1
    if (audio.getAttribute('src') !== track.audioSrc) {
      audio.src = track.audioSrc
    }
    resetAudioToStart()
    // Autoplay may be blocked until the first user gesture — that's expected.
    audio.play().catch(() => {})
  }

  // --- selection ---
  function chooseTrack(n: number, options: ChooseOptions = {}) {
    const num = clamp(Math.round(n), 0, total.value)
    setArmAngle(angleForTrackStart(num))
    currentTrack.value = num
    ensureSpinLoop()
    renderContent(num, options.animate !== false)
    onSelect?.(trackByNumber(num))

    if (num === 0) {
      if (options.fadeIfOff) {
        fadeOutAudio(STOP_RAMP_MS)
      }
      else {
        const audio = audioEl.value
        if (audio) {
          audio.pause()
          resetAudioToStart()
          audio.volume = 1
        }
      }
    }
    else if (options.play) {
      playTrackAudio(num)
    }
  }

  function selectBySlug(slug: string, options: ChooseOptions = {}) {
    // Slugs are unique across the whole album, so find the side that owns it and
    // make that side the up side before selecting within it.
    for (const face of ['a', 'b'] as const) {
      const index = sides.value[face].findIndex((track) => track.slug === slug)
      if (index >= 0) {
        side.value = face
        chooseTrack(index + 1, options)
        return true
      }
    }
    chooseTrack(0, options)
    return false
  }

  // Flip to the other side: lift the arm, fade out, and land on that side's Off
  // state. The visual rotation is a CSS transition driven by `side`/`isFlipping`.
  function flip() {
    if (isFlipping.value) return
    isFlipping.value = true
    side.value = side.value === 'a' ? 'b' : 'a'
    chooseTrack(0, { fadeIfOff: true, animate: true })
    if (flipTimer) clearTimeout(flipTimer)
    flipTimer = setTimeout(() => {
      isFlipping.value = false
    }, FLIP_MS)
  }

  // --- spin loop ---
  function ensureSpinLoop() {
    if (spinFrame) return
    lastSpinTime = performance.now()
    spinFrame = requestAnimationFrame(updateSpin)
  }

  function updateSpin(now: number) {
    const dt = Math.min(50, now - lastSpinTime)
    lastSpinTime = now
    const target = currentTrack.value > 0 ? SPIN_RATE : 0
    const ramp = target > spinRate ? START_RAMP_MS : STOP_RAMP_MS
    const maxDelta = SPIN_RATE * (dt / ramp)
    spinRate += clamp(target - spinRate, -maxDelta, maxDelta)
    if (Math.abs(spinRate) < 0.0001 && target === 0) spinRate = 0
    rotation.value = (rotation.value + spinRate * dt) % 360

    if (spinRate === 0 && target === 0) {
      cancelAnimationFrame(spinFrame)
      spinFrame = 0
      return
    }
    spinFrame = requestAnimationFrame(updateSpin)
  }

  // --- tonearm pointer handlers ---
  function onArmPointerDown(event: PointerEvent) {
    dragging.value = true
    const el = event.currentTarget as HTMLElement
    el.setPointerCapture?.(event.pointerId)
    setArmAngle(angleFromPointer(event))
    event.stopPropagation()
  }

  function onArmPointerMove(event: PointerEvent) {
    if (!dragging.value) return
    setArmAngle(angleFromPointer(event))
  }

  function onArmPointerUp(event: PointerEvent) {
    if (!dragging.value) return
    dragging.value = false
    try {
      ;(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId)
    }
    catch {
      // ignore
    }
    const finalTrack = trackFromArmAngle(armAngle.value)
    chooseTrack(finalTrack, { play: finalTrack > 0, fadeIfOff: finalTrack === 0, animate: true })
  }

  // --- record groove click ---
  function onRecordPointerDown(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    const trackNumber = trackFromRecordClick(event)
    chooseTrack(trackNumber, { play: true, animate: true })
  }

  function onRecordKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    const next = currentTrack.value === 0 ? 1 : (currentTrack.value % total.value) + 1
    chooseTrack(next, { play: true, animate: true })
  }

  // --- tonearm keyboard ---
  function onArmKeydown(event: KeyboardEvent) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']
    if (!keys.includes(event.key)) return
    event.preventDefault()

    if (event.key === 'Home') {
      chooseTrack(0, { fadeIfOff: true, animate: true })
      return
    }
    if (event.key === 'End') {
      chooseTrack(total.value, { play: true, animate: true })
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') {
      chooseTrack(Math.min(total.value, currentTrack.value + 1), { play: true, animate: true })
    }
    else {
      chooseTrack(Math.max(0, currentTrack.value - 1), {
        play: currentTrack.value > 1,
        fadeIfOff: currentTrack.value === 1,
        animate: true,
      })
    }
  }

  function onEnded() {
    const next = currentTrack.value >= total.value ? 0 : currentTrack.value + 1
    chooseTrack(next, { play: next > 0, animate: true })
  }

  onMounted(() => {
    audioEl.value?.addEventListener('ended', onEnded)
  })

  onUnmounted(() => {
    audioEl.value?.removeEventListener('ended', onEnded)
    if (spinFrame) cancelAnimationFrame(spinFrame)
    cancelAudioFade()
    if (transitionTimer) clearTimeout(transitionTimer)
    if (flipTimer) clearTimeout(flipTimer)
    audioEl.value?.pause()
  })

  return {
    // state
    side,
    tracks,
    currentTrack,
    renderedTrack,
    currentTrackData,
    renderedTrackData,
    armAngle,
    isChanging,
    isFlipping,
    dragging,
    rotation,
    mode,
    renderedMode,
    total,
    // actions
    chooseTrack,
    selectBySlug,
    flip,
    // handlers
    onArmPointerDown,
    onArmPointerMove,
    onArmPointerUp,
    onRecordPointerDown,
    onRecordKeydown,
    onArmKeydown,
  }
}
