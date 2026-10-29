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

const splashSeen = useCookie<string | null>(SESSION_KEY, {
  sameSite: 'lax',
  path: '/',
})

// Pages someone arrives at to do one thing: the link-in-bio hub, the mailing
// list's pages (signup, confirm, the 7-inch, the letters), the record player,
// which has an intro of its own, and the unlisted workbench. The splash is for
// meeting the band; here it's five seconds between them and what they came for.
const SPLASH_OFF_ROUTES = /^\/(?:links|thank-you|seven-inch|listen|subscribe|unsubscribe|letters|tools|music-videos|logo)(?:\/|$)/

const route = useRoute()
const skipsSplash = SPLASH_OFF_ROUTES.test(route.path)

const isVisible = ref(splashSeen.value !== '1' && !skipsSplash)
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
  // Counts as seen, so going on from /links to /listen or the home page doesn't
  // stop them mid-visit either.
  if (skipsSplash) {
    splashSeen.value = '1'
    return
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    splashSeen.value = '1'
    isVisible.value = false
    return
  }

  if (!isVisible.value) {
    return
  }

  splashSeen.value = '1'

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
