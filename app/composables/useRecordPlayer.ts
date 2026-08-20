import type { Ref } from 'vue'
import type { ListenTrack } from '~~/shared/types'
import {
  ARM_TRAVEL_MS,
  AUDIO_STOP_FADE_MS,
  FLIP_MS,
  NEEDLE_SETTLE_MS,
  OFF_ANGLE,
  OFF_RELEASE_BOUNDARY,
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
  // Silence before the audio comes up, in ms. Defaults to the full cue (arm
  // travel + lead-in groove) when the needle is coming off the rest post.
  audioDelayMs?: number
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
  // The platter motor. It leads the needle: play spins the record up before the
  // arm swings over, and it keeps turning after the music has stopped.
  const motorOn = ref(false)
  const armAngle = ref(OFF_ANGLE)
  const isFlipping = ref(false)
  const dragging = ref(false)
  const rotation = ref(0)

  const currentTrackData = computed(() => trackByNumber(currentTrack.value))

  let spinRate = 0
  let spinFrame = 0
  let lastSpinTime = 0
  let audioFadeFrame = 0
  let cueTimer: ReturnType<typeof setTimeout> | null = null
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

  function cancelCue() {
    if (cueTimer) clearTimeout(cueTimer)
    cueTimer = null
  }

  // Cut the music. A very short ramp keeps the stop from clicking; it reads as
  // immediate against the platter, which takes STOP_RAMP_MS to wind down.
  function stopAudio(duration = AUDIO_STOP_FADE_MS) {
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

  function startTrackAudio(n: number) {
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

  // Drop the needle now, or after the cue delay while the arm is still travelling
  // and the record is coming up to speed.
  function playTrackAudio(n: number, delayMs = 0) {
    if (delayMs <= 0) {
      startTrackAudio(n)
      return
    }
    cueTimer = setTimeout(() => {
      cueTimer = null
      startTrackAudio(n)
    }, delayMs)
  }

  // --- selection ---
  function chooseTrack(n: number, options: ChooseOptions = {}) {
    const num = clamp(Math.round(n), 0, total.value)
    // Coming off the rest post means a full cue: the arm has to swing across and
    // the needle has to ride the lead-in. Moving between tracks is instant.
    const fromRest = currentTrack.value === 0
    cancelCue()
    setArmAngle(angleForTrackStart(num))
    currentTrack.value = num
    setMotor(num > 0)
    onSelect?.(trackByNumber(num))

    if (num === 0) {
      stopAudio()
    }
    else if (options.play) {
      playTrackAudio(num, options.audioDelayMs ?? (fromRest ? ARM_TRAVEL_MS + NEEDLE_SETTLE_MS : 0))
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
    chooseTrack(0)
    if (flipTimer) clearTimeout(flipTimer)
    flipTimer = setTimeout(() => {
      isFlipping.value = false
    }, FLIP_MS)
  }

  // --- spin loop ---
  // Switch the platter motor on or off. Play spins the record up before the arm
  // has moved, so this is deliberately separate from the selected track.
  function setMotor(on: boolean) {
    motorOn.value = on
    ensureSpinLoop()
  }

  function ensureSpinLoop() {
    if (spinFrame) return
    lastSpinTime = performance.now()
    spinFrame = requestAnimationFrame(updateSpin)
  }

  function updateSpin(now: number) {
    const dt = Math.min(50, now - lastSpinTime)
    lastSpinTime = now
    const target = motorOn.value ? SPIN_RATE : 0
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
    // Picking the arm up spins the platter, the same as pressing play — by the
    // time the needle lands the record is on its way up to speed.
    setMotor(true)
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
    // The visitor has placed the needle by hand, so there is no arm travel to
    // wait out — only the lead-in groove.
    const finalTrack = trackFromArmAngle(armAngle.value)
    chooseTrack(finalTrack, { play: finalTrack > 0, audioDelayMs: NEEDLE_SETTLE_MS })
  }

  // --- record groove click ---
  function onRecordPointerDown(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    const trackNumber = trackFromRecordClick(event)
    chooseTrack(trackNumber, { play: true })
  }

  function onRecordKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    const next = currentTrack.value === 0 ? 1 : (currentTrack.value % total.value) + 1
    chooseTrack(next, { play: true })
  }

  // --- tonearm keyboard ---
  function onArmKeydown(event: KeyboardEvent) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']
    if (!keys.includes(event.key)) return
    event.preventDefault()

    if (event.key === 'Home') {
      chooseTrack(0)
      return
    }
    if (event.key === 'End') {
      chooseTrack(total.value, { play: true })
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') {
      chooseTrack(Math.min(total.value, currentTrack.value + 1), { play: true })
    }
    else {
      chooseTrack(Math.max(0, currentTrack.value - 1), { play: currentTrack.value > 1 })
    }
  }

  function onEnded() {
    const next = currentTrack.value >= total.value ? 0 : currentTrack.value + 1
    chooseTrack(next, { play: next > 0 })
  }

  onMounted(() => {
    audioEl.value?.addEventListener('ended', onEnded)
  })

  onUnmounted(() => {
    audioEl.value?.removeEventListener('ended', onEnded)
    if (spinFrame) cancelAnimationFrame(spinFrame)
    cancelCue()
    cancelAudioFade()
    if (flipTimer) clearTimeout(flipTimer)
    audioEl.value?.pause()
  })

  return {
    // state
    side,
    tracks,
    currentTrack,
    currentTrackData,
    motorOn,
    armAngle,
    isFlipping,
    dragging,
    rotation,
    total,
    // actions
    chooseTrack,
    setMotor,
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
