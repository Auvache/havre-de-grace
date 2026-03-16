<template>
  <div
    v-if="isVisible"
    class="splash-screen"
    :class="{ 'is-exiting': isExiting }"
    aria-hidden="true"
  >
    <img
      :src="logoWhite"
      alt="Havre de Grace"
      class="splash-logo"
      :class="{ 'is-visible': isLogoVisible }"
    />
  </div>
</template>

<script setup lang="ts">
import logoWhite from '~~/assets/images/logo-white.png'

const SESSION_KEY = 'hdg-splash-seen'
const BLANK_DELAY_MS = 500
const LOGO_FADE_IN_MS = 750
const LOGO_HOLD_AFTER_IN_MS = 750
const OVERLAY_FADE_OUT_MS = 750

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
      isLogoVisible.value = false
      isExiting.value = true
    }, BLANK_DELAY_MS + LOGO_FADE_IN_MS + LOGO_HOLD_AFTER_IN_MS),
  )

  timers.push(
    setTimeout(() => {
      isVisible.value = false
    }, BLANK_DELAY_MS + LOGO_FADE_IN_MS + LOGO_HOLD_AFTER_IN_MS + OVERLAY_FADE_OUT_MS),
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
  transition:
    opacity 1000ms var(--ease-standard),
    transform 1000ms var(--ease-standard);
  background:
    radial-gradient(
      120% 80% at 0% 0%,
      color-mix(in srgb, var(--color-accent) 10%, transparent),
      transparent 55%
    ),
    var(--color-bg-dark);
}

.splash-screen.is-exiting {
  opacity: 0;
  transform: scale(1.01);
}

.splash-logo {
  width: clamp(8rem, 32vw, 18rem);
  max-width: min(72vw, 18rem);
  height: auto;
  opacity: 0;
  transition: opacity 1000ms var(--ease-standard);
}

.splash-logo.is-visible {
  opacity: 1;
}

</style>
