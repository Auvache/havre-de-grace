/*
 * The projector: one audio element, one clock, and a scrub bar.
 *
 * The film is a pure function of `time`, and `time` is read off
 * `audio.currentTime` every frame rather than counted. That is the whole
 * synchronisation strategy, and it is what makes the difference between an
 * animation that starts with the music and one that stays with it for two
 * minutes fifty-three: a rAF counter loses frames to a slow paint or a
 * backgrounded tab and never gets them back, while `currentTime` is wherever
 * the sound actually is. It also means scrubbing needs no special handling —
 * move the audio and the picture is already there.
 */

import { ANDALUSIA_SCORE } from '~/config/andalusiaScore'
import { clamp01, lerp } from '~/utils/clipTiming'

const LEVEL_GAIN = 1.5
const SMOOTHING = 0.35

export interface MusicVideoPlayerOptions {
  /**
   * Route the element through Web Audio so the film can see the spectrum.
   *
   * On by default because the kinetic film is driven by it. Cartography is not:
   * its spec gives the audio driver nothing to do, because a chart is a
   * document and documents do not throb. Building the graph anyway would take
   * the element's output over permanently in order to feed three numbers
   * nothing reads.
   */
  analyse?: boolean
}

export function useMusicVideoPlayer(
  score = ANDALUSIA_SCORE,
  { analyse = true }: MusicVideoPlayerOptions = {},
) {
  /** Seconds into the song. */
  const time = ref(0)
  const playing = ref(false)
  const ended = ref(false)
  const muted = ref(false)
  const ready = ref(false)

  /**
   * Sync trim in milliseconds, applied to the picture rather than the sound.
   * Positive runs the type early.
   *
   * A control rather than a constant because the last fifty milliseconds of
   * agreement between a word and its type is a judgement made by ear, and
   * because "the words are a touch late" is the first note anyone gives a
   * lyric video.
   */
  const offsetMs = ref(0)

  const level = ref(0)
  const bass = ref(0)
  const treble = ref(0)
  /** True once the analyser is feeding the numbers above. */
  const reactive = ref(false)

  const progress = computed(() => clamp01(time.value / score.duration))

  let audio: HTMLAudioElement | null = null
  let context: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let gain: GainNode | null = null
  let spectrum: Uint8Array | null = null
  let frame = 0

  const ensureAudio = (): HTMLAudioElement => {
    if (!audio) {
      audio = new Audio(score.src)
      audio.preload = 'auto'
      audio.addEventListener('loadedmetadata', () => { ready.value = true })
      audio.addEventListener('ended', () => {
        playing.value = false
        ended.value = true
        if (frame) cancelAnimationFrame(frame)
        frame = 0
      })
      audio.muted = muted.value
    }
    return audio
  }

  /**
   * Route the element through Web Audio so the film can see the spectrum.
   *
   * Lazy, and inside the gesture: a context created earlier starts suspended,
   * and `createMediaElementSource` takes the element's output over permanently
   * — so if this throws we want the element still playing normally rather than
   * a graph that leads nowhere. Hence the catch and the `reactive` flag.
   */
  const ensureGraph = (element: HTMLAudioElement) => {
    if (context) return
    try {
      const Ctor = window.AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      context = new Ctor()
      const source = context.createMediaElementSource(element)
      analyser = context.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.7
      gain = context.createGain()
      gain.gain.value = muted.value ? 0 : 1
      source.connect(analyser)
      analyser.connect(gain)
      gain.connect(context.destination)
      spectrum = new Uint8Array(analyser.frequencyBinCount)
      reactive.value = true
    }
    catch {
      context = null
      analyser = null
      gain = null
      reactive.value = false
    }
  }

  const band = (data: Uint8Array, from: number, to: number): number => {
    let sum = 0
    for (let i = from; i < to; i++) sum += data[i] ?? 0
    return sum / (to - from) / 255
  }

  const sample = () => {
    if (!analyser || !spectrum) return
    analyser.getByteFrequencyData(spectrum as Uint8Array<ArrayBuffer>)
    level.value = lerp(level.value, clamp01(band(spectrum, 1, 120) * LEVEL_GAIN), SMOOTHING)
    bass.value = lerp(bass.value, clamp01(band(spectrum, 1, 10) * LEVEL_GAIN), SMOOTHING)
    treble.value = lerp(treble.value, clamp01(band(spectrum, 40, 140) * LEVEL_GAIN * 1.6), SMOOTHING)
  }

  /*
   * `currentTime` is where the sound is, but browsers do not report it every
   * frame: Firefox and Safari step it every quarter second or so, Chrome does
   * for some files, and between steps it holds still. Read raw, the picture
   * froze on a moment already past and then jumped — spot on just after an
   * update, up to a quarter second late just before the next, which is the
   * "sometimes in sync, sometimes lagging" that was heard.
   *
   * So the clock is anchored to the last reported value and runs on the wall
   * clock from there, re-anchored whenever the element reports a new time.
   * The extrapolation is capped at half a second, so a stall in the stream
   * holds the picture rather than letting it run ahead of the sound.
   */
  let anchorMedia = -1
  let anchorWall = 0

  const clock = (): number => {
    if (!audio) return 0
    const media = audio.currentTime
    const wall = performance.now()
    if (media !== anchorMedia || audio.paused || audio.readyState < 3) {
      anchorMedia = media
      anchorWall = wall
    }
    // Nor while the element is still buffering: it is not playing yet, however
    // `paused` reads.
    const running = !audio.paused && audio.readyState >= 3
    const ahead = !running ? 0 : Math.min(((wall - anchorWall) / 1000) * audio.playbackRate, 0.5)
    return anchorMedia + ahead
  }

  const tick = () => {
    if (!audio) return
    time.value = Math.max(0, clock() + offsetMs.value / 1000)
    sample()
    frame = requestAnimationFrame(tick)
  }

  async function play() {
    const element = ensureAudio()
    if (analyse) ensureGraph(element)
    if (context?.state === 'suspended') await context.resume()
    if (ended.value) {
      element.currentTime = 0
      ended.value = false
    }
    try {
      await element.play()
    }
    catch {
      // No gesture credit, or the file failed to load. Stay put rather than
      // animating in silence.
      playing.value = false
      return
    }
    playing.value = true
    if (frame) cancelAnimationFrame(frame)
    frame = requestAnimationFrame(tick)
  }

  function pause() {
    audio?.pause()
    playing.value = false
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  function toggle() {
    if (playing.value) pause()
    else void play()
  }

  /**
   * Move the picture and the sound together.
   *
   * `time` is written here as well as by the frame loop, so a scrub while
   * paused redraws immediately instead of waiting for playback to resume.
   */
  function seek(seconds: number) {
    const element = ensureAudio()
    const target = Math.min(Math.max(seconds, 0), score.duration - 0.05)
    ended.value = false
    const apply = () => {
      element.currentTime = target
      anchorMedia = -1
    }
    if (element.readyState >= 1) apply()
    else element.addEventListener('loadedmetadata', apply, { once: true })
    time.value = target
    if (!playing.value) sample()
  }

  function nudge(seconds: number) {
    seek(time.value + seconds)
  }

  watch(muted, (value) => {
    if (audio) audio.muted = value
    if (gain && context) gain.gain.setTargetAtTime(value ? 0 : 1, context.currentTime, 0.02)
  })

  onBeforeUnmount(() => {
    pause()
    audio?.removeAttribute('src')
    audio = null
    void context?.close()
    context = null
  })

  return {
    time,
    playing,
    ended,
    ready,
    muted,
    offsetMs,
    progress,
    level,
    bass,
    treble,
    reactive,
    play,
    pause,
    toggle,
    seek,
    nudge,
    score,
  }
}
