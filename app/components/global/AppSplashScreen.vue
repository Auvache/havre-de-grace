<template>
  <div
    v-if="isVisible"
    class="splash-screen"
    :class="{ 'is-exiting': isExiting }"
    :style="{ '--exit-duration': `${OVERLAY_FADE_OUT_MS}ms` }"
    aria-hidden="true"
  >
    <!-- eslint-disable-next-line vue/no-v-html -- the markup is ours: shared/video/album.mjs draws the lockup from constants -->
    <svg class="splash-logo" viewBox="-34 -34 918 619.07" v-html="mark" />
  </div>
</template>

<script setup lang="ts">
import { MARK_DRAW, markDrawnAt } from '~~/shared/video/album.mjs'

const SESSION_KEY = 'hdg-splash-seen'
// Half a second of empty ink before anything happens, then the mark is drawn
// on: the anchor traced in line and filled, the letters coming up beneath it —
// the same drawing, by the same function, as the opening of the Andalusia
// film. Then half a second on the finished mark before the overlay fades.
const BLANK_DELAY_MS = 500
const LOGO_DRAW_MS = MARK_DRAW.done * 1000
const LOGO_HOLD_AFTER_IN_MS = 500
const OVERLAY_FADE_OUT_MS = 1250

// Remembered per tab (sessionStorage), and only once it has actually played.
// It used to be a session cookie set by any page, but Chrome keeps session
// cookies across restarts, and landing on /about first counted as seeing it,
// so in practice it never played twice and rarely once (2026-10-30). Now a
// new tab on the homepage gets it; a reload or coming back home doesn't.
const readSeen = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1'
  }
  catch {
    return false
  }
}

const markSeen = () => {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1')
  }
  catch {
    // Storage blocked: it plays again next time, which is harmless.
  }
}

// The splash is for meeting the band, so it plays on the homepage only. Every
// other page is somewhere people come to for one thing, and it's five seconds
// between them and what they came for.
const route = useRoute()
const skipsSplash = route.path !== '/'

// The same on the server and in the browser, so hydration agrees: the HTML is
// prerendered once for everybody and can't know who has seen the splash. A
// returning visitor (in this tab) never sees it anyway: the inline script in
// nuxt.config marks <html data-splash="seen"> before first paint and the rule
// below hides it, and onMounted takes it out.
const isVisible = ref(!skipsSplash)
const isExiting = ref(false)
const drawnFor = ref(0)
const mark = computed(() => markDrawnAt(drawnFor.value, 'splash'))
const timers: ReturnType<typeof setTimeout>[] = []
let frame = 0

/* Seconds into the drawing, from the clock, one frame at a time until it is done. */
const draw = () => {
  const start = performance.now()
  const step = (now: number) => {
    drawnFor.value = Math.min((now - start) / 1000, MARK_DRAW.done)
    if (drawnFor.value < MARK_DRAW.done) {
      frame = requestAnimationFrame(step)
    }
  }
  frame = requestAnimationFrame(step)
}

const clearTimers = () => {
  while (timers.length > 0) {
    const timer = timers.pop()
    if (timer) {
      clearTimeout(timer)
    }
  }
  cancelAnimationFrame(frame)
}

onMounted(() => {
  // Another page: nothing to play, and going on to the homepage later is a
  // move inside the app, so it doesn't play then either.
  if (skipsSplash) {
    return
  }

  if (readSeen() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isVisible.value = false
    return
  }

  markSeen()

  timers.push(setTimeout(draw, BLANK_DELAY_MS))

  timers.push(
    setTimeout(() => {
      isExiting.value = true
    }, BLANK_DELAY_MS + LOGO_DRAW_MS + LOGO_HOLD_AFTER_IN_MS),
  )

  timers.push(
    setTimeout(() => {
      isVisible.value = false
    }, BLANK_DELAY_MS + LOGO_DRAW_MS + LOGO_HOLD_AFTER_IN_MS + OVERLAY_FADE_OUT_MS),
  )
})

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  opacity: 1;
  transform: scale(1);
  /* Driven from OVERLAY_FADE_OUT_MS, because the timer that unmounts this
     element fires at the end of it — a longer transition here just meant the
     overlay vanishing before it had finished fading. */
  transition:
    opacity var(--exit-duration) var(--ease-standard),
    transform var(--exit-duration) var(--ease-standard);
  background: var(--color-splash-bg);
}

.splash-screen.is-exiting {
  opacity: 0;
  transform: scale(1.01);
}

.splash-logo {
  width: clamp(11rem, 42vw, 24rem);
  max-width: min(80vw, 24rem);
  height: auto;
  color: #f4f6f7;
}

</style>

<style>
html[data-splash="seen"] .splash-screen {
  display: none;
}
</style>
