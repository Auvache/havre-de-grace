<template>
  <div
    v-if="isVisible"
    class="splash-screen"
    :class="{ 'is-exiting': isExiting }"
    :style="{ '--exit-duration': `${OVERLAY_FADE_OUT_MS}ms` }"
    aria-hidden="true"
  >
    <BrandMark
      variant="lockup"
      decorative
      class="splash-logo"
      :class="{ 'is-revealed': isLogoVisible }"
      :style="{ '--reveal-duration': `${LOGO_REVEAL_MS}ms` }"
    />
  </div>
</template>

<script setup lang="ts">
const SESSION_KEY = 'hdg-splash-seen'
// Half a second of empty ink before anything happens, then the mark is
// uncovered from the bottom edge up — the waterline entrance from /logo. The
// duration is handed to the stylesheet as a custom property rather than
// written twice, so the hold below cannot drift out of step with the reveal.
const BLANK_DELAY_MS = 500
const LOGO_REVEAL_MS = 1100
const LOGO_HOLD_AFTER_IN_MS = 750
const OVERLAY_FADE_OUT_MS = 1250

const splashSeen = useCookie<string | null>(SESSION_KEY, {
  sameSite: 'lax',
  path: '/',
})

const isVisible = ref(splashSeen.value !== '1')
const isExiting = ref(false)
const isLogoVisible = ref(false)
const timers: ReturnType<typeof setTimeout>[] = []

const clearTimers = () => {
  while (timers.length > 0) {
    const timer = timers.pop()
    if (timer) {
      clearTimeout(timer)
    }
  }
}

onMounted(() => {
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

  timers.push(
    setTimeout(() => {
      isLogoVisible.value = true
    }, BLANK_DELAY_MS),
  )

  timers.push(
    setTimeout(() => {
      isExiting.value = true
    }, BLANK_DELAY_MS + LOGO_REVEAL_MS + LOGO_HOLD_AFTER_IN_MS),
  )

  timers.push(
    setTimeout(() => {
      isVisible.value = false
    }, BLANK_DELAY_MS + LOGO_REVEAL_MS + LOGO_HOLD_AFTER_IN_MS + OVERLAY_FADE_OUT_MS),
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
  /* A top inset of 100% collapses the box onto its own bottom edge, so easing
     it back to zero uncovers the mark from the waterline up. */
  clip-path: inset(100% 0 0 0);
}

.splash-logo.is-revealed {
  animation: splash-waterline var(--reveal-duration) var(--ease-standard) both;
}

@keyframes splash-waterline {
  from { clip-path: inset(100% 0 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

</style>
