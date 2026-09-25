/*
 * The projector, for a window of a song rather than the whole of it.
 *
 * Same synchronisation strategy as useMusicVideoPlayer: the film is a pure
 * function of `time`, and `time` is read off `audio.currentTime` every frame
 * rather than counted up. A rAF counter loses frames to a slow paint or a
 * backgrounded tab and never gets them back; `currentTime` is wherever the
 * sound actually is, which is the difference between an animation that starts
 * with the music and one that is still with it fifteen seconds later.
 *
 * What this adds is `from` and `to`. A clip seeks to `from` on play, stops at
 * `to`, and parks back at `from` so the next press starts the same way the last
 * one did — which is what makes three snippets on one page comparable.
 *
 * There is no AnalyserNode here, and that is a style decision rather than an
 * omission: Cartography's spec gives the audio driver nothing to do, because a
 * chart is a document and documents do not throb. A style that wants the
 * spectrum should use useMusicVideoPlayer, which already routes it.
 */

import { createMediaClock } from '~/utils/mediaClock'

/**
 * Every clip on the page, so that starting one stops the others.
 *
 * Two films playing the same song a minute apart, out of the same pair of
 * speakers, is not a comparison — it is a mess. Module scope rather than a
 * provide/inject because the rule is about the browser's one audio output, not
 * about any particular component tree.
 */
const clips = new Set<{ pause: () => void }>()

export interface FilmClipOptions {
  src: string
  /** Seconds into the song where the clip starts. */
  from: number
  /** Seconds into the song where it stops. */
  to: number
}

export function useFilmClip({ src, from, to }: FilmClipOptions) {
  const time = ref(from)
  const playing = ref(false)
  const muted = ref(false)
  const ready = ref(false)

  /** 0→1 through the clip, for the scrub bar. */
  const progress = computed(() => {
    const span = Math.max(to - from, 0.001)
    return Math.min(Math.max((time.value - from) / span, 0), 1)
  })

  let audio: HTMLAudioElement | null = null
  let frame = 0
  /* Smoothed: `currentTime` itself steps (app/utils/mediaClock.ts). */
  const mediaClock = createMediaClock()

  const stopLoop = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  const ensureAudio = (): HTMLAudioElement => {
    if (!audio) {
      audio = new Audio(src)
      audio.preload = 'auto'
      audio.muted = muted.value
      audio.addEventListener('loadedmetadata', () => { ready.value = true })
      /*
       * A clip whose `to` is the end of the record never reaches it: the
       * element stops a few milliseconds short and `currentTime` stops rising,
       * so the frame loop below would spin forever on a paused file. The
       * element knows when it is finished; ask it rather than the clock.
       */
      audio.addEventListener('ended', () => {
        pause()
        seek(from)
      })
    }
    return audio
  }

  const tick = (frameTime?: number) => {
    if (!audio) return
    /*
     * The stop is tested here rather than left to a `timeupdate` listener,
     * which fires about four times a second: a clip that overruns its end by a
     * quarter of a second plays a word of the next line, and the whole point of
     * a fifteen-second snippet is that it is exactly the fifteen seconds
     * somebody was asked to look at.
     */
    if (audio.currentTime >= to) {
      pause()
      time.value = to
      // Parked at the start, not at the end, so the next press replays rather
      // than needing a rewind first.
      seek(from)
      return
    }
    time.value = mediaClock.read(audio, frameTime)
    frame = requestAnimationFrame(tick)
  }

  function seek(seconds: number) {
    const element = ensureAudio()
    const target = Math.min(Math.max(seconds, from), to - 0.02)
    const apply = () => {
      element.currentTime = target
      mediaClock.reset()
    }
    if (element.readyState >= 1) apply()
    else element.addEventListener('loadedmetadata', apply, { once: true })
    time.value = target
  }

  /** `at` is 0→1 through the clip: what the scrub bar hands back. */
  function scrub(at: number) {
    seek(from + (to - from) * Math.min(Math.max(at, 0), 1))
  }

  async function play() {
    for (const other of clips) if (other !== handle) other.pause()
    const element = ensureAudio()
    // Out of the window entirely — a finished clip, or one never played — so
    // start it at the top rather than wherever the element happens to sit.
    if (element.currentTime < from || element.currentTime >= to - 0.05) {
      element.currentTime = from
      time.value = from
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
    stopLoop()
    frame = requestAnimationFrame(tick)
  }

  function pause() {
    audio?.pause()
    playing.value = false
    stopLoop()
  }

  function toggle() {
    if (playing.value) pause()
    else void play()
  }

  const handle = {
    time,
    playing,
    muted,
    ready,
    progress,
    from,
    to,
    play,
    pause,
    toggle,
    seek,
    scrub,
  }

  watch(muted, (value) => { if (audio) audio.muted = value })

  clips.add(handle)
  onBeforeUnmount(() => {
    clips.delete(handle)
    pause()
    audio?.removeAttribute('src')
    audio = null
  })

  return handle
}
