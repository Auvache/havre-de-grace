<!--
  The homepage hero — Endless Sea.

  The cover floats at the centre of the screen, and the ocean inside it carries
  on past the edge of the sleeve: the rest of the viewport is the same sea
  drawn as moving lines, with the horizon matched to the photograph's (51% of
  the way down the cover). The pointer is the wind. The streaming services are
  buoys riding on the water.

  The sky and the body of the water are CSS gradients, so the server-rendered
  page is already a sea; the canvas only adds the swell on top. It stops
  drawing when the hero is off screen, and draws one still frame for reduced
  motion.
-->

<template>
  <section
    ref="root"
    data-hero
    class="sea relative isolate h-[100svh] min-h-[38rem] overflow-hidden"
    aria-labelledby="sea-title"
    @pointermove="onPointer"
  >
    <div class="sea-sky" aria-hidden="true">
      <span class="sea-cloud sea-cloud--a" />
      <span class="sea-cloud sea-cloud--b" />
      <span class="sea-cloud sea-cloud--c" />
    </div>
    <div class="sea-water" aria-hidden="true" />
    <canvas ref="canvas" class="sea-canvas" aria-hidden="true" />
    <div class="sea-horizon" aria-hidden="true" />

    <HeroTopBar class="text-[#1f2c39]" />

    <h1 id="sea-title" class="sea-title">
      {{ title }}
    </h1>

    <NuxtLink :to="albumHref" class="sea-cover" :aria-label="`${title}: the album page`">
      <NuxtImg
        v-if="album"
        :src="album.coverImage"
        :alt="album.coverAlt"
        width="560"
        height="560"
        densities="x1 x2"
        format="webp"
        loading="eager"
        fetchpriority="high"
        class="h-full w-full object-cover"
      />
    </NuxtLink>
    <div class="sea-reflection" aria-hidden="true">
      <NuxtImg
        v-if="album"
        :src="album.coverImage"
        alt=""
        width="560"
        height="560"
        densities="x1"
        format="webp"
        class="h-full w-full object-cover"
      />
    </div>

    <p class="sea-byline">
      <span>{{ artistName }}</span>
      <span aria-hidden="true" class="opacity-60">&middot;</span>
      <span>{{ isOut ? 'out now' : releaseDay }}</span>
      <span aria-hidden="true" class="sea-byline-dot opacity-60">&middot;</span>
      <NuxtLink :to="albumHref" class="sea-byline-link">explore the album &rarr;</NuxtLink>
    </p>

    <ul class="sea-buoys" :aria-label="`Listen to ${streaming.subject}`">
      <li v-for="(entry, index) in streaming.entries" :key="entry.platform" :style="{ '--i': index }">
        <a :href="entry.url" target="_blank" rel="noopener noreferrer" class="sea-buoy">
          <img v-if="entry.iconSrc" :src="entry.iconSrc" alt="" class="sea-buoy-icon">
          <span class="sea-buoy-label">{{ entry.label }}</span>
        </a>
        <span class="sea-ripple" aria-hidden="true" />
      </li>
    </ul>

    <button type="button" class="sea-scroll" @click="scrollPastHero">
      <span class="label-text">scroll down</span>
      <svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M6 9l6 6 6-6" /></svg>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = defineProps<{
  album: Album | null
}>()

// Horizon as a fraction of the hero's height, read from --horizon so the
// drawing and the CSS can't disagree (it moves up on narrow screens).
let horizonFraction = 0.52

const { album, title, artistName, albumHref, isOut, releaseDay, streaming } = useHeroAlbum(() => props.album)

// ── the swell ────────────────────────────────────────────────────
const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

// Wind and swell, eased toward wherever the pointer asks for.
const wind = { target: 0, value: 0 }
const swell = { target: 1, value: 1 }

const onPointer = (event: PointerEvent) => {
  const box = root.value?.getBoundingClientRect()
  if (!box) return
  wind.target = ((event.clientX - box.left) / box.width - 0.5) * 2
  swell.target = 0.8 + ((event.clientY - box.top) / box.height) * 0.7
}

const prefersReducedMotion = usePreferredReducedMotion()
const reducedMotion = computed(() => prefersReducedMotion.value === 'reduce')

let frame = 0
let phase = 0
let last = 0
let visible = true

const draw = (now: number) => {
  const element = canvas.value
  const context = element?.getContext('2d')
  if (!element || !context) return

  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
  last = now
  wind.value += (wind.target - wind.value) * 0.03
  swell.value += (swell.target - swell.value) * 0.03
  phase += dt * (0.55 + wind.value * 0.45)

  const width = element.width
  const height = element.height
  const dpr = width / (element.clientWidth || 1)
  const horizon = height * horizonFraction
  const depthSpan = height - horizon

  context.clearRect(0, 0, width, height)
  context.lineCap = 'round'

  const LINES = 64
  const step = Math.max(6, 10 * dpr)
  for (let i = 0; i < LINES; i++) {
    const depth = (i + 1) / LINES
    // Perspective: rows bunch up toward the horizon.
    const baseY = horizon + depthSpan * depth ** 1.85
    const amplitude = (0.4 + depth * depth * 11) * dpr * swell.value
    const k1 = 0.0065 / (0.25 + depth) / dpr
    const k2 = 0.017 / (0.35 + depth) / dpr
    const drift = phase * (1.4 + depth * 1.6)

    context.beginPath()
    for (let x = -step; x <= width + step; x += step) {
      const y = baseY
        + amplitude * (
          Math.sin(x * k1 + drift + i * 1.7) * 0.65
          + Math.sin(x * k2 - drift * 0.7 + i * 0.9) * 0.35
        )
      if (x === -step) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    // Broken into crests rather than drawn as solid rules, so the rows read
    // as light catching on water rather than contour lines. Each row gets
    // its own dash rhythm and drifts with the wind.
    const dash = (30 + ((i * 37) % 70)) * (0.4 + depth * 1.6) * dpr
    const gap = (8 + ((i * 53) % 40)) * (0.4 + depth) * dpr
    context.setLineDash([dash, gap, dash * 0.35, gap * 0.6])
    context.lineDashOffset = -phase * (40 + depth * 60) * dpr * (i % 2 ? 1 : -0.6)
    context.strokeStyle = `rgba(255, 255, 255, ${0.06 + depth * 0.34})`
    context.lineWidth = (0.5 + depth * 1.5) * dpr
    context.stroke()
  }

  if (visible && !reducedMotion.value) {
    frame = requestAnimationFrame(draw)
  }
}

const resize = () => {
  const element = canvas.value
  if (!element) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const declared = root.value ? parseFloat(getComputedStyle(root.value).getPropertyValue('--horizon')) : NaN
  if (Number.isFinite(declared)) horizonFraction = declared / 100
  element.width = Math.round(element.clientWidth * dpr)
  element.height = Math.round(element.clientHeight * dpr)
  if (reducedMotion.value || !visible) draw(performance.now())
}

const start = () => {
  cancelAnimationFrame(frame)
  last = 0
  frame = requestAnimationFrame(draw)
}

useResizeObserver(canvas, resize)

useIntersectionObserver(root, ([entry]) => {
  visible = Boolean(entry?.isIntersecting)
  if (visible) start()
})

onMounted(() => {
  resize()
  start()
})

onBeforeUnmount(() => cancelAnimationFrame(frame))

const scrollPastHero = () => {
  window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
}
</script>

<style scoped>
.sea {
  --horizon: 52%;
  --cover: min(44svh, 62vw, 30rem);
  /* The cover's own horizon sits 51% of the way down the sleeve. */
  --cover-top: calc(var(--horizon) - var(--cover) * 0.51);
  --ink: #1f2c39;
  background: #cdd6df;
}

.sea-sky {
  position: absolute;
  inset: 0 0 calc(100% - var(--horizon)) 0;
  overflow: hidden;
  background: linear-gradient(180deg, #aebccb 0%, #c9d2dc 45%, #e3e7eb 100%);
}

.sea-cloud {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(255 255 255 / 0.55), transparent);
  filter: blur(8px);
  animation: sea-cloud 140s linear infinite;
}

.sea-cloud--a { top: 18%; left: -10%; width: 46vw; height: 9vh; }
.sea-cloud--b { top: 42%; left: 30%; width: 60vw; height: 7vh; animation-duration: 190s; animation-delay: -60s; opacity: 0.8; }
.sea-cloud--c { top: 8%; left: 60%; width: 38vw; height: 11vh; animation-duration: 160s; animation-delay: -110s; opacity: 0.7; }

@keyframes sea-cloud {
  from { translate: -40vw 0; }
  to { translate: 120vw 0; }
}

.sea-water {
  position: absolute;
  inset: var(--horizon) 0 0 0;
  background: linear-gradient(180deg, #93a4b6 0%, #7d93aa 22%, #7189a3 60%, #7f95ad 100%);
}

.sea-canvas {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}

.sea-horizon {
  position: absolute;
  inset-inline: 0;
  top: var(--horizon);
  height: 1px;
  background: rgb(255 255 255 / 0.7);
  animation: sea-draw 1800ms var(--ease-standard) both;
}

@keyframes sea-draw {
  from { scale: 0 1; }
}

/* ── the title ──────────────────────────────────────────────────── */

/* Set in the sky above the sleeve, in the cover's own thin, widely-tracked
   caps. */
.sea-title {
  position: absolute;
  inset-inline: 0;
  bottom: calc(100% - var(--cover-top) + clamp(2.5rem, 3vh + 1.5rem, 3.25rem));
  z-index: 2;
  padding-inline: 1rem;
  font-family: "Barlow Condensed", var(--font-family-base);
  font-size: clamp(1.9rem, 1rem + 3.2vw, 4.5rem);
  font-weight: 200;
  line-height: 1.1;
  letter-spacing: 0.38em;
  /* Tracking hangs off the last letter; pull it back so the title centres. */
  text-indent: 0.38em;
  text-align: center;
  text-transform: uppercase;
  color: var(--ink);
  animation: sea-rise 1400ms var(--ease-standard) 500ms both;
}

@keyframes sea-rise {
  from {
    opacity: 0;
    translate: 0 0.5em;
  }
}

/* ── the sleeve on the water ────────────────────────────────────── */

.sea-cover {
  position: absolute;
  top: var(--cover-top);
  left: 50%;
  z-index: 2;
  width: var(--cover);
  height: var(--cover);
  translate: -50% 0;
  box-shadow:
    0 30px 60px -20px rgb(20 36 56 / 0.55),
    0 0 0 1px rgb(255 255 255 / 0.3);
  animation:
    sea-cover-in 1600ms var(--ease-standard) both,
    sea-float 7s ease-in-out 1600ms infinite;
}

@keyframes sea-cover-in {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
}

@keyframes sea-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(0.5deg); }
}

.sea-reflection {
  position: absolute;
  top: calc(var(--cover-top) + var(--cover) + 6px);
  left: 50%;
  z-index: 1;
  width: var(--cover);
  height: calc(var(--cover) * 0.5);
  overflow: hidden;
  translate: -50% 0;
  opacity: 0.3;
  filter: blur(3px);
  mask: linear-gradient(180deg, #000, transparent 85%);
  pointer-events: none;
}

.sea-reflection img {
  height: var(--cover);
  transform: scaleY(-1);
  transform-origin: 50% 50%;
  translate: 0 -50%;
}

.sea-byline {
  position: absolute;
  top: calc(var(--cover-top) + var(--cover) + clamp(0.9rem, 2.2vh, 1.4rem));
  left: 50%;
  z-index: 3;
  display: flex;
  gap: 0.7rem;
  translate: -50% 0;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #fff;
  white-space: nowrap;
  text-shadow: 0 1px 12px rgb(20 36 56 / 0.35);
  animation: sea-fade 1200ms var(--ease-standard) 1300ms both;
}

.sea-byline-link {
  border-bottom: 1px solid rgb(255 255 255 / 0.55);
}

.sea-byline-link:hover {
  border-color: #fff;
}

@keyframes sea-fade {
  from { opacity: 0; }
}

/* ── the buoys ──────────────────────────────────────────────────── */

.sea-buoys {
  position: absolute;
  inset-inline: 0;
  bottom: clamp(3.75rem, 11vh, 6.5rem);
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.9rem 1.1rem;
  padding-inline: 1rem;
}

.sea-buoys li {
  position: relative;
  animation:
    sea-buoy-in 900ms var(--ease-standard) both,
    sea-bob 4.2s ease-in-out infinite;
  animation-delay:
    calc(1500ms + var(--i) * 120ms),
    calc(var(--i) * -0.7s);
}

.sea-buoy {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.9);
  padding: 0.5rem 1rem 0.5rem 0.6rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink);
  box-shadow: 0 10px 20px -8px rgb(20 36 56 / 0.5);
}

.sea-buoy-icon {
  height: 1.25rem;
  width: 1.25rem;
}

.sea-buoy:hover {
  background: #fff;
  transform: translateY(-3px) scale(1.04);
}

.sea-ripple {
  position: absolute;
  left: 50%;
  bottom: -7px;
  width: 110%;
  height: 14px;
  border: 1px solid rgb(255 255 255 / 0.55);
  border-radius: 50%;
  translate: -50% 0;
  animation: sea-ripple 4.2s ease-out infinite;
  animation-delay: calc(var(--i) * -0.7s);
}

@keyframes sea-buoy-in {
  from {
    opacity: 0;
    translate: 0 20px;
  }
}

@keyframes sea-bob {
  0%, 100% { transform: translateY(0) rotate(-1.2deg); }
  50% { transform: translateY(-6px) rotate(1.2deg); }
}

@keyframes sea-ripple {
  0% { opacity: 0.8; scale: 0.7; }
  100% { opacity: 0; scale: 1.25; }
}

.sea-scroll {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  translate: -50% 0;
  color: rgb(255 255 255 / 0.85);
  animation: sea-fade 1200ms var(--ease-standard) 2600ms both;
}

.sea-scroll .label-text {
  font-size: 0.64rem;
}

.sea-scroll svg {
  animation: sea-sink 2.4s ease-in-out infinite;
}

@keyframes sea-sink {
  50% { transform: translateY(4px); }
}

/* ── narrow screens: the title goes up into the sky ─────────────── */

@media (max-width: 900px) {
  .sea {
    --horizon: 46%;
    --cover: min(32svh, 60vw, 26rem);
  }

  .sea-byline-dot {
    display: none;
  }

  .sea-byline-link {
    flex-basis: 100%;
    text-align: center;
    border-bottom: 0;
    text-decoration: underline;
    text-underline-offset: 0.3em;
  }

  .sea-title {
    font-size: clamp(1.9rem, 9vw, 3.25rem);
    letter-spacing: 0.3em;
    text-indent: 0.3em;
  }

  .sea-byline {
    flex-wrap: wrap;
    justify-content: center;
    width: calc(100% - 2rem);
    row-gap: 0.3rem;
    letter-spacing: 0.18em;
  }

}

/* Phones: six labelled buoys wrap into rows that crowd the byline, so they
   ride as icons alone, still floating. The names stay for screen readers. */
@media (max-width: 640px) {
  .sea-buoys {
    flex-wrap: nowrap;
    gap: clamp(0.4rem, 2.5vw, 0.7rem);
  }

  /* Six in a row still fit a 320px screen. */
  .sea-buoy {
    height: min(2.75rem, 12vw);
    width: min(2.75rem, 12vw);
    justify-content: center;
    padding: 0;
  }

  .sea-buoy-icon {
    height: 1.5rem;
    width: 1.5rem;
  }

  .sea-buoy-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sea *,
  .sea *::after {
    animation: none !important;
  }
}
</style>
