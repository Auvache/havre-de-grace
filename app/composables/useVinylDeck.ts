/*
 * The vinyl deck engine behind /listen.
 *
 * The important idea, and the thing a normal web player gets wrong: a side of a
 * record is ONE continuous surface. Position is measured in seconds elapsed
 * across the whole side, not within a track, so the needle can be dropped
 * anywhere — including halfway through a song — and the tonearm angle is a true
 * readout of where you are on the record. Tracks are just labelled regions of
 * that surface.
 *
 * Everything else follows from that: playing a side runs its files back to back,
 * the arm creeps inward in real time, and the side ends by lifting the needle
 * rather than looping.
 */
import type { ListenAlbum, ListenTrack } from '~/utils/listenAlbums'
import { sideDuration as computeSideDuration, sideOffsets, sideTracks } from '~/utils/listenAlbums'

// --- mechanical timings (ms) ---
/** Tonearm swinging from the rest post to the lead-in groove. */
const ARM_TRAVEL_MS = 1100
/** The needle riding the silent lead-in before the music comes up. */
const LEAD_IN_MS = 850
/** Platter inertia. */
const SPIN_UP_MS = 1400
const SPIN_DOWN_MS = 2200
/** Click-avoiding ramp when the needle lifts. */
const FADE_MS = 90

export interface VinylDeckOptions {
  /** Expose a level meter / spectrum. Requires Web Audio. */
  analyser?: boolean
  /** Skip the arm-travel + lead-in ceremony (used by the reading-first variant). */
  instantCue?: boolean
  rpm?: number
  /** Fired when the needle reaches the run-out groove. Used to advance a queue. */
  onSideEnd?: () => void
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function useVinylDeck(options: VinylDeckOptions = {}) {
  const album = ref<ListenAlbum | null>(null)
  const side = ref<'a' | 'b'>('a')
  const rpm = ref(options.rpm ?? 100 / 3)

  /** Index into the CURRENT SIDE's track list. */
  const index = ref(0)
  /** Seconds into the current track. */
  const trackTime = ref(0)
  /** Needle is on the vinyl and the music is running. */
  const needleDown = ref(false)
  /** Platter motor. Leads the needle: spins up before the arm lands. */
  const spinning = ref(false)
  /** Arm is in flight from the rest post. */
  const cueing = ref(false)
  const flipping = ref(false)
  const scrubbing = ref(false)
  /** 0..1 the visitor is dragging the arm to, before they let go. */
  const scrubProgress = ref(0)
  const rotation = ref(0)
  const volume = ref(1)
  /** 0..1 output level, when the analyser is enabled. */
  const level = ref(0)
  const bands = ref<number[]>(Array.from({ length: 24 }, () => 0))

  const tracks = computed<ListenTrack[]>(() => sideTracks(album.value, side.value))
  const offsets = computed(() => sideOffsets(tracks.value))
  const sideLength = computed(() => computeSideDuration(album.value, side.value))
  const track = computed<ListenTrack | null>(() => tracks.value[index.value] ?? null)
  const duration = computed(() => track.value?.durationSec ?? 0)
  const trackProgress = computed(() => (duration.value ? clamp(trackTime.value / duration.value, 0, 1) : 0))

  /** Seconds elapsed across the whole side — the deck's real position. */
  const sidePosition = computed(() => (offsets.value[index.value] ?? 0) + trackTime.value)
  const sideProgress = computed(() => (sideLength.value ? clamp(sidePosition.value / sideLength.value, 0, 1) : 0))

  /** Where to draw the arm: the drag, the live position, or the rest post. */
  const armProgress = computed(() => {
    if (scrubbing.value) return scrubProgress.value
    if (needleDown.value || cueing.value) return sideProgress.value
    return -1 // parked
  })

  const otherSide = computed<'a' | 'b'>(() => (side.value === 'a' ? 'b' : 'a'))
  const hasOtherSide = computed(() => sideTracks(album.value, otherSide.value).length > 0)

  // --- audio ---------------------------------------------------------------
  let audio: HTMLAudioElement | null = null
  let ctx: AudioContext | null = null
  let deckGain: GainNode | null = null
  let analyserNode: AnalyserNode | null = null
  let freqData: Uint8Array | null = null

  let raf = 0
  let spinRate = 0 // deg/ms
  let lastFrame = 0
  let cueTimer: ReturnType<typeof setTimeout> | null = null
  let fadeFrame = 0
  /** Where a lifted needle would be put back down. */
  let heldPosition = 0

  const targetSpinRate = () => (rpm.value * 360) / 60000

  function ensureAudio() {
    if (audio || !import.meta.client) return audio
    audio = new Audio()
    audio.preload = 'metadata'
    audio.addEventListener('ended', onTrackEnded)
    return audio
  }

  /**
   * Web Audio is only wired up when meters were asked for, and only after a
   * gesture — a MediaElementSource created while the context is suspended
   * silences the element on some browsers.
   */
  function ensureContext() {
    if (!import.meta.client || ctx || !options.analyser) return
    const el = ensureAudio()
    if (!el) return
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      ctx = new Ctor()
      const source = ctx.createMediaElementSource(el)
      deckGain = ctx.createGain()
      deckGain.gain.value = volume.value
      source.connect(deckGain)

      if (options.analyser) {
        analyserNode = ctx.createAnalyser()
        analyserNode.fftSize = 256
        analyserNode.smoothingTimeConstant = 0.75
        freqData = new Uint8Array(analyserNode.frequencyBinCount)
        deckGain.connect(analyserNode)
      }
      deckGain.connect(ctx.destination)
    }
    catch {
      // Web Audio unavailable — the plain <audio> element still plays.
      ctx = null
    }
  }

  function applyVolume() {
    if (deckGain && ctx) deckGain.gain.setTargetAtTime(volume.value, ctx.currentTime, 0.05)
    else if (audio) audio.volume = volume.value
  }

  watch(volume, applyVolume)

  /** Nominal speed. Playing a 33 at 45 genuinely repitches it, as it would. */
  const NOMINAL_RPM = 100 / 3
  function applyRate() {
    if (audio) audio.playbackRate = rpm.value / NOMINAL_RPM
  }
  watch(rpm, applyRate)

  function cancelFade() {
    if (fadeFrame) cancelAnimationFrame(fadeFrame)
    fadeFrame = 0
  }

  function fadeOutAndPause() {
    const el = audio
    if (!el || el.paused) return
    cancelFade()
    const from = el.volume
    const start = performance.now()
    const step = (now: number) => {
      const p = clamp((now - start) / FADE_MS, 0, 1)
      el.volume = from * (1 - p)
      if (p < 1) {
        fadeFrame = requestAnimationFrame(step)
        return
      }
      el.pause()
      el.volume = deckGain ? 1 : volume.value
      fadeFrame = 0
    }
    fadeFrame = requestAnimationFrame(step)
  }

  // --- transport -----------------------------------------------------------

  function cancelCue() {
    if (cueTimer) clearTimeout(cueTimer)
    cueTimer = null
  }

  function loadTrackAudio(i: number, offsetSec: number, autoplay: boolean) {
    const el = ensureAudio()
    const target = tracks.value[i]
    if (!el || !target) return
    if (el.getAttribute('src') !== target.audioSrc) {
      el.src = target.audioSrc
      el.load()
    }
    const seek = () => {
      try {
        el.currentTime = clamp(offsetSec, 0, Math.max(0, (el.duration || target.durationSec) - 0.15))
      }
      catch { /* metadata not in yet */ }
    }
    if (el.readyState >= 1) seek()
    else el.addEventListener('loadedmetadata', seek, { once: true })

    trackTime.value = offsetSec
    index.value = i
    applyRate()
    if (autoplay) {
      el.volume = deckGain ? 1 : volume.value
      el.play().catch(() => { /* blocked until a gesture — expected */ })
    }
  }

  /** Resolve a position in seconds-into-the-side to a track + offset. */
  function locate(seconds: number) {
    const list = tracks.value
    const offs = offsets.value
    const total = sideLength.value
    const at = clamp(seconds, 0, Math.max(0, total - 0.4))
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (at >= (offs[i] ?? 0)) return { index: i, offset: at - (offs[i] ?? 0) }
    }
    return { index: 0, offset: 0 }
  }

  /**
   * Put the needle down at a point on the side. `ceremony` runs the arm-travel
   * and lead-in pauses; a hand-placed needle skips the travel.
   */
  function dropNeedle(seconds: number, ceremony: 'full' | 'lead-in' | 'none' = 'full') {
    ensureContext()
    void ctx?.resume()
    cancelCue()
    const spot = locate(seconds)
    index.value = spot.index
    trackTime.value = spot.offset
    heldPosition = seconds

    setMotor(true)
    const delay = options.instantCue
      ? 0
      : ceremony === 'full' ? ARM_TRAVEL_MS + LEAD_IN_MS : ceremony === 'lead-in' ? LEAD_IN_MS : 0

    if (delay <= 0) {
      cueing.value = false
      needleDown.value = true
      loadTrackAudio(spot.index, spot.offset, true)
      return
    }

    cueing.value = true
    // Buffer during the ceremony so the music is ready the instant it lands.
    loadTrackAudio(spot.index, spot.offset, false)
    cueTimer = setTimeout(() => {
      cueTimer = null
      cueing.value = false
      needleDown.value = true
      loadTrackAudio(spot.index, spot.offset, true)
    }, delay)
  }

  /** Lift the needle. The position is held so play() puts it back where it was. */
  function lift() {
    cancelCue()
    heldPosition = sidePosition.value
    cueing.value = false
    needleDown.value = false
    fadeOutAndPause()
    setMotor(false)
  }

  function play() {
    if (!album.value || !tracks.value.length) return
    dropNeedle(heldPosition >= sideLength.value - 0.5 ? 0 : heldPosition)
  }

  function toggle() {
    if (needleDown.value || cueing.value) lift()
    else play()
  }

  function playTrack(i: number, ceremony: 'full' | 'lead-in' | 'none' = 'lead-in') {
    const at = offsets.value[clamp(i, 0, tracks.value.length - 1)] ?? 0
    dropNeedle(at, needleDown.value ? 'none' : ceremony)
  }

  function cueTrack(i: number) {
    // Select without playing — the arm stays parked, the panel updates.
    const target = clamp(i, 0, Math.max(0, tracks.value.length - 1))
    index.value = target
    trackTime.value = 0
    heldPosition = offsets.value[target] ?? 0
  }

  function next() {
    if (index.value >= tracks.value.length - 1) {
      endOfSide()
      return
    }
    playTrack(index.value + 1, 'none')
  }

  function prev() {
    // Within the first few seconds, go back a track; otherwise restart this one.
    if (trackTime.value > 3) playTrack(index.value, 'none')
    else playTrack(Math.max(0, index.value - 1), 'none')
  }

  function seekSide(progress: number) {
    dropNeedle(clamp(progress, 0, 1) * sideLength.value, needleDown.value ? 'none' : 'lead-in')
  }

  function seekTrack(progress: number) {
    const base = offsets.value[index.value] ?? 0
    dropNeedle(base + clamp(progress, 0, 1) * duration.value, needleDown.value ? 'none' : 'lead-in')
  }

  /** What the visitor would land on if they let go of the arm now. */
  function preview(progress: number) {
    const seconds = clamp(progress, 0, 1) * sideLength.value
    const spot = locate(seconds)
    return { track: tracks.value[spot.index] ?? null, offset: spot.offset, seconds }
  }

  function beginScrub(progress: number) {
    scrubbing.value = true
    scrubProgress.value = clamp(progress, 0, 1)
    setMotor(true)
  }

  function moveScrub(progress: number) {
    if (!scrubbing.value) return
    scrubProgress.value = clamp(progress, 0, 1)
  }

  function endScrub(park = false) {
    if (!scrubbing.value) return
    scrubbing.value = false
    if (park) {
      lift()
      return
    }
    dropNeedle(scrubProgress.value * sideLength.value, 'lead-in')
  }

  function endOfSide() {
    cancelCue()
    needleDown.value = false
    cueing.value = false
    fadeOutAndPause()
    setMotor(false)
    heldPosition = 0
    index.value = Math.max(0, tracks.value.length - 1)
    trackTime.value = 0
    options.onSideEnd?.()
  }

  function onTrackEnded() {
    if (index.value >= tracks.value.length - 1) {
      endOfSide()
      return
    }
    // Straight into the next groove — no gap, no ceremony.
    loadTrackAudio(index.value + 1, 0, true)
  }

  function setSide(next: 'a' | 'b', { keepPlaying = false } = {}) {
    if (next === side.value) return
    const wasPlaying = needleDown.value || cueing.value
    lift()
    flipping.value = true
    side.value = next
    index.value = 0
    trackTime.value = 0
    heldPosition = 0
    setTimeout(() => {
      flipping.value = false
      if (keepPlaying && wasPlaying) dropNeedle(0, 'full')
    }, 700)
  }

  function flip(opts?: { keepPlaying?: boolean }) {
    setSide(otherSide.value, opts)
  }

  function load(next: ListenAlbum | null, opts: { autoplay?: boolean } = {}) {
    lift()
    album.value = next
    side.value = 'a'
    index.value = 0
    trackTime.value = 0
    heldPosition = 0
    rotation.value = 0
    if (opts.autoplay && next) dropNeedle(0, 'full')
  }

  function eject() {
    lift()
    album.value = null
  }

  // --- platter -------------------------------------------------------------

  function setMotor(on: boolean) {
    spinning.value = on
    ensureLoop()
  }

  function ensureLoop() {
    if (raf) return
    lastFrame = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function frame(now: number) {
    const dt = Math.min(60, now - lastFrame)
    lastFrame = now

    // Platter inertia.
    const target = spinning.value ? targetSpinRate() : 0
    const ramp = target > spinRate ? SPIN_UP_MS : SPIN_DOWN_MS
    const maxDelta = targetSpinRate() * (dt / ramp)
    spinRate += clamp(target - spinRate, -maxDelta, maxDelta)
    if (target === 0 && Math.abs(spinRate) < 0.00005) spinRate = 0
    rotation.value = (rotation.value + spinRate * dt) % 360

    // Position, read straight off the element so the arm never drifts.
    if (audio && needleDown.value && !audio.paused) {
      trackTime.value = audio.currentTime
    }

    if (analyserNode && freqData) {
      analyserNode.getByteFrequencyData(freqData as Uint8Array<ArrayBuffer>)
      let sum = 0
      const out: number[] = []
      const step = Math.floor(freqData.length / bands.value.length) || 1
      for (let b = 0; b < bands.value.length; b += 1) {
        let acc = 0
        for (let i = 0; i < step; i += 1) acc += freqData[b * step + i] ?? 0
        out.push(acc / step / 255)
      }
      for (let i = 0; i < freqData.length; i += 1) sum += freqData[i] ?? 0
      bands.value = out
      level.value = clamp(sum / freqData.length / 160, 0, 1)
    }

    const idle = spinRate === 0 && !spinning.value && !needleDown.value
    if (idle) {
      cancelAnimationFrame(raf)
      raf = 0
      level.value = 0
      return
    }
    raf = requestAnimationFrame(frame)
  }

  // --- lyrics --------------------------------------------------------------

  /**
   * No per-line timestamps exist in the content, so lines are spread evenly
   * across the body of the track. It reads as "roughly in step", which is the
   * honest amount of sync available — do not present it as authoritative.
   */
  const activeLyricIndex = computed(() => {
    const lines = track.value?.lyrics ?? []
    if (!lines.length || !duration.value || !needleDown.value) return -1
    const sung = lines.map((line, i) => ({ line, i })).filter((entry) => entry.line.trim() !== '')
    if (!sung.length) return -1
    const p = clamp((trackProgress.value - 0.05) / 0.88, 0, 0.9999)
    return sung[Math.floor(p * sung.length)]?.i ?? -1
  })

  onBeforeUnmount(() => {
    cancelCue()
    cancelFade()
    if (raf) cancelAnimationFrame(raf)
    audio?.removeEventListener('ended', onTrackEnded)
    audio?.pause()
    void ctx?.close()
  })

  return {
    // state
    album, side, otherSide, hasOtherSide, tracks, track, index,
    needleDown, cueing, spinning, flipping, scrubbing, scrubProgress, rotation, rpm, volume,
    trackTime, duration, trackProgress,
    sidePosition, sideLength, sideProgress, armProgress, offsets,
    level, bands, activeLyricIndex,
    playing: computed(() => needleDown.value || cueing.value),
    // transport
    load, eject, play, lift, toggle, playTrack, cueTrack, next, prev,
    seekSide, seekTrack, preview, flip, setSide,
    beginScrub, moveScrub, endScrub,
  }
}
