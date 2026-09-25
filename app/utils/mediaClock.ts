/*
 * A clock for a film that follows an audio element, smoothly.
 *
 * `currentTime` is where the sound is, but it is not reported smoothly. Firefox
 * and Safari step it every quarter second or so. Chrome reports a new value
 * every frame, but quantised to its audio callbacks, about 10 ms: measured on
 * /music-videos/conman, one frame's step was 15 ms and the next 26 ms against a
 * steady 16.7. Read raw, or re-anchored on every report, a slow pan judders by
 * that much — invisible in a cut, obvious on a camera drifting forty units a
 * second.
 *
 * So the clock runs on the wall clock, and each frame it is pulled a small
 * share of the way toward what the element reports. The quantisation averages
 * out, so it stays within a few milliseconds of the sound. A real
 * disagreement (a seek, or the stream stalling and resuming) is more than
 * 150 ms, and it snaps. While paused or buffering it simply reads the element.
 */

/** Share of the gap to the reported time closed per frame: about half a second's time constant at 60 fps. */
const PULL = 0.035
/** Past this the clock snaps: a seek, or a stall it should not smooth over. */
const SNAP = 0.15

export function createMediaClock() {
  let t = -1
  let wall = 0

  return {
    /** Forget the smoothed state: the next read takes the element's time as it is. */
    reset() {
      t = -1
    },
    /**
     * `frameTime` is the requestAnimationFrame timestamp: the frame's own time,
     * which is when it will be seen. performance.now() inside the callback is
     * that plus however long the main thread took to get there, which jitters.
     */
    read(audio: HTMLMediaElement, frameTime: number = performance.now()): number {
      const media = audio.currentTime
      const now = frameTime
      const running = !audio.paused && audio.readyState >= 3
      if (t < 0 || !running) {
        t = media
        wall = now
        return t
      }
      // A frame that took longer than a tenth of a second (a background tab) is not extrapolated across.
      t += Math.min((now - wall) / 1000, 0.1) * audio.playbackRate
      wall = now
      const gap = media - t
      if (Math.abs(gap) > SNAP) t = media
      else t += gap * PULL
      return t
    },
  }
}
