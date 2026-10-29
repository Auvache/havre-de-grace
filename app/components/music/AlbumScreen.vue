<!--
  The screen at the top of an album page: the record playing as a picture,
  with the line being sung written in the middle of it.

  Two clocks, on purpose. The picture loops on its own (CSS animations and a
  canvas of dust), so its length doesn't matter; the words follow the audio
  through the media clock (app/utils/mediaClock.ts), so they land on the voice
  whatever the picture is doing.

  - Before play: the picture loops silently, no words.
  - Playing this record: the current song's lines, one at a time. Each writes
    itself across the time it's sung (wiped on, or typed), holds until the next
    line or 1.6 s past its end, and fades over 0.6 s. A song with no timings
    shows its title.
  - Always one line: the size comes from the screen's width, and a line that
    would overflow is shrunk to fit. Never wrapped.
  - Off-screen or in a hidden tab, the picture stops moving. With reduced
    motion: no grain, drift or push, and lines fade in whole.

  The look comes from the record's `cinema` entry in app/config/records.ts:
  `calm` (Into the Wild: the cover, a slow push, no grain) or `old-film` (I
  Want to Be Yours: sepia, slow grain, dust, a breathing fade, a sub-pixel
  drift). The pictures are a list, so more photos are a data change.
  Lifted from docs/redesign/mockups/lyric-styles.html.
-->

<template>
  <div
    ref="root"
    :class="['screen', `is-${look.cinema.treatment}`, { 'is-still': still }]"
    role="img"
    :aria-label="ariaLabel"
  >
    <img
      v-for="(slide, i) in look.cinema.slides"
      :key="slide.src"
      :src="slide.src"
      alt=""
      :class="['screen__pic', { on: i === slideIndex }]"
      :style="{ objectPosition: slide.position, '--s': slide.scale ?? 1 }"
      fetchpriority="high"
    >
    <template v-if="look.cinema.treatment === 'old-film'">
      <div class="screen__breathe" />
      <div class="screen__grain" />
      <canvas ref="dust" class="screen__dust" />
    </template>
    <div class="screen__vig" />

    <div
      ref="lineEl"
      :class="['screen__line', `f-${look.cinema.lettering}`]"
      aria-hidden="true"
    />
    <p class="sr-only" aria-live="off">{{ currentText }}</p>
  </div>
</template>

<script setup lang="ts">
import type { TimedLine } from '~/config/albumLyrics'
import type { RecordLook } from '~/config/records'
import { createMediaClock } from '~/utils/mediaClock'

const props = defineProps<{
  look: RecordLook
  /** { songSlug: lines }, loaded by the page. */
  lyrics: Record<string, TimedLine[]>
}>()

const HOLD = 1.6
const FADE = 0.6
const SLIDE_SECONDS = 14

const player = usePlayer()
const root = ref<HTMLElement | null>(null)
const lineEl = ref<HTMLElement | null>(null)
const dust = ref<HTMLCanvasElement | null>(null)
const slideIndex = ref(0)
const still = ref(false)
const currentText = ref('')

const ariaLabel = computed(() => props.look.cinema.slides[0]?.alt ?? props.look.title)

const clamp = (x: number) => Math.max(0, Math.min(1, x))

/** This record's song that's loaded, if any. */
const songSlug = computed(() =>
  player.record.value?.slug === props.look.slug ? player.track.value?.slug ?? null : null,
)

// --- the lyric line --------------------------------------------------------

interface Shown {
  key: string
  text: string
  /** For a typed line: the typed part and the rest, kept invisible so the line never moves. */
  typed?: HTMLSpanElement
  rest?: HTMLSpanElement
  inner?: HTMLSpanElement
}

let shown: Shown | null = null
let reduced = false

function fit() {
  const el = lineEl.value
  const box = root.value?.clientWidth ?? 0
  if (!el || !box || !shown?.inner) return
  const size = props.look.cinema.lettering === 'typed' ? 0.021 : 0.024
  const base = Math.max(12, Math.min(26, box * size))
  el.style.fontSize = `${base}px`
  const width = shown.inner.scrollWidth
  const max = box * 0.86
  if (width > max) el.style.fontSize = `${(base * max) / width}px`
}

function show(key: string, text: string) {
  const el = lineEl.value
  if (!el) return
  el.textContent = ''
  shown = { key, text }
  currentText.value = text
  if (!text) return
  const inner = document.createElement('span')
  inner.className = 't'
  if (props.look.cinema.lettering === 'typed') {
    const typed = document.createElement('span')
    const rest = document.createElement('span')
    rest.className = 'ghost'
    rest.textContent = text
    inner.append(typed, rest)
    shown.typed = typed
    shown.rest = rest
  }
  else {
    inner.textContent = text
  }
  el.appendChild(inner)
  shown.inner = inner
  fit()
}

/** What the screen says at song time `t`: the line, how far it's written, how visible. */
function frame(t: number) {
  const el = lineEl.value
  if (!el) return
  const slug = songSlug.value
  const lines = slug ? props.lyrics[slug] : undefined

  if (!slug || player.index.value === null) {
    if (shown) show('', '')
    el.style.opacity = '0'
    return
  }

  if (!lines?.length) {
    // No timings: the song's title, held quietly.
    const title = player.track.value?.title ?? ''
    if (shown?.key !== `title:${slug}`) show(`title:${slug}`, title)
    el.style.setProperty('--p', '1')
    if (shown?.typed) {
      shown.typed.textContent = title
      shown.rest!.textContent = ''
    }
    el.style.opacity = String(clamp(t / 1.2))
    return
  }

  let i = -1
  for (let k = lines.length - 1; k >= 0; k--) {
    if (t >= lines[k]!.start) {
      i = k
      break
    }
  }
  if (i < 0) {
    if (shown?.text) show('', '')
    el.style.opacity = '0'
    return
  }

  const line = lines[i]!
  const key = `${slug}:${i}`
  if (shown?.key !== key) show(key, line.text)

  const next = lines[i + 1]?.start ?? Infinity
  const out = Math.min(next, line.end + HOLD)
  const fadeOut = t < out ? 1 : clamp(1 - (t - out) / FADE)

  if (reduced) {
    el.style.setProperty('--p', '1')
    if (shown?.typed) {
      shown.typed.textContent = line.text
      shown.rest!.textContent = ''
    }
    el.style.opacity = String(Math.min(clamp((t - line.start) / 0.4), fadeOut))
    return
  }

  const progress = clamp((t - line.start) / Math.max(0.2, line.end - line.start))
  if (shown?.typed) {
    const n = Math.round(progress * line.text.length)
    shown.typed.textContent = line.text.slice(0, n)
    shown.rest!.textContent = line.text.slice(n)
  }
  else {
    el.style.setProperty('--p', String(progress))
  }
  el.style.opacity = String(fadeOut)
}

// --- dust (old film) -------------------------------------------------------

interface Speck { x: number, y: number, r: number, v: number, life: number, dur: number }
let specks: Speck[] = []
let ctx: CanvasRenderingContext2D | null = null

function sizeDust() {
  const cv = dust.value
  if (!cv) return
  cv.width = cv.clientWidth * devicePixelRatio
  cv.height = cv.clientHeight * devicePixelRatio
}

function drawDust(now: number, dt: number) {
  const cv = dust.value
  if (!cv || !ctx) return
  const W = cv.width
  const H = cv.height
  ctx.clearRect(0, 0, W, H)
  for (const d of specks) {
    d.life += dt
    if (d.life > d.dur) {
      d.life = 0
      d.x = Math.random()
      d.y = Math.random()
      d.dur = 3 + Math.random() * 5
    }
    d.y -= d.v * dt * 3
    d.x += Math.sin((now / 1000 + d.dur) * 0.4) * 0.0004
    const a = Math.sin((Math.PI * d.life) / d.dur) * 0.55
    ctx.fillStyle = `rgba(240,232,214,${a})`
    ctx.beginPath()
    ctx.arc(d.x * W, d.y * H, d.r * devicePixelRatio, 0, 7)
    ctx.fill()
  }
}

// --- the loop --------------------------------------------------------------

const clock = createMediaClock()
let raf = 0
let last = 0
let onScreen = true
let slideTimer: ReturnType<typeof setInterval> | null = null

function tick(now: number) {
  raf = requestAnimationFrame(tick)
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const el = player.element()
  const t = el && songSlug.value ? clock.read(el, now) : 0
  frame(t)
  if (ctx && !still.value && !reduced) drawDust(now, dt)
}

function updateStill() {
  still.value = !onScreen || document.hidden
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (dust.value && !reduced) {
    ctx = dust.value.getContext('2d')
    specks = Array.from({ length: 26 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.4,
      v: 0.002 + Math.random() * 0.006,
      life: Math.random() * 6,
      dur: 3 + Math.random() * 5,
    }))
    sizeDust()
  }
  observer = new IntersectionObserver(([entry]) => {
    onScreen = Boolean(entry?.isIntersecting)
    updateStill()
  })
  if (root.value) observer.observe(root.value)
  document.addEventListener('visibilitychange', updateStill)
  window.addEventListener('resize', onResize)
  document.fonts?.ready.then(fit)
  if (props.look.cinema.slides.length > 1 && !reduced) {
    slideTimer = setInterval(() => {
      if (!still.value) slideIndex.value = (slideIndex.value + 1) % props.look.cinema.slides.length
    }, SLIDE_SECONDS * 1000)
  }
  last = performance.now()
  raf = requestAnimationFrame(tick)
})

function onResize() {
  sizeDust()
  fit()
}

// A seek or a new song: let the clock take the element's time as it is.
watch(() => [player.index.value, songSlug.value], () => clock.reset())

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', updateStill)
  window.removeEventListener('resize', onResize)
  if (slideTimer) clearInterval(slideTimer)
})
</script>

<style scoped>
.screen {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
}

.screen__pic {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(var(--s, 1));
  transition: opacity 2.4s ease;
}

.screen__pic.on {
  opacity: 1;
}

/* Into the Wild: the cover, calm, a slow push. */
.is-calm .screen__pic {
  filter: saturate(0.8) brightness(0.9);
  transform-origin: 50% 55%;
  animation: push 40s ease-in-out infinite alternate;
}

.is-calm .screen__vig {
  background: linear-gradient(180deg, rgba(15, 22, 30, 0.15), transparent 40%, rgba(15, 22, 30, 0.3));
}

/* I Want to Be Yours: old film, gently. */
.is-old-film .screen__pic {
  filter: sepia(0.38) saturate(0.55) contrast(0.92) brightness(0.82);
  animation: push 40s ease-in-out infinite alternate, drift 7s ease-in-out infinite alternate;
}

.is-old-film .screen__vig {
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.55) 100%);
}

.screen__breathe {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0.05;
  pointer-events: none;
  animation: breathe 6s ease-in-out infinite;
}

.screen__grain {
  position: absolute;
  inset: -20%;
  opacity: 0.18;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain-slow 9s linear infinite;
}

.screen__dust {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.screen__vig {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.is-still .screen__pic,
.is-still .screen__breathe,
.is-still .screen__grain {
  animation-play-state: paused;
}

/* The line: centred, one line, never wrapped. */
.screen__line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  white-space: nowrap;
  color: #f4f1e8;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  opacity: 0;
  line-height: 1.3;
}

.screen__line :deep(.t) {
  display: inline-block;
}

.screen__line :deep(.ghost) {
  color: transparent;
  text-shadow: none;
}

.f-hairline {
  font-family: "Sofia Sans Extra Condensed", "Arial Narrow", sans-serif;
  font-weight: 200;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.f-hairline :deep(.t) {
  -webkit-mask-image: linear-gradient(90deg, #000 calc(var(--p, 0) * 110% - 10%), transparent calc(var(--p, 0) * 110%));
  mask-image: linear-gradient(90deg, #000 calc(var(--p, 0) * 110% - 10%), transparent calc(var(--p, 0) * 110%));
}

.f-typed {
  font-family: "Courier Prime", "Courier New", monospace;
  letter-spacing: 0.02em;
}

@keyframes push {
  from { transform: scale(var(--s, 1)); }
  to { transform: scale(calc(var(--s, 1) * 1.08)); }
}

@keyframes drift {
  from { translate: 0 0; }
  to { translate: 0.6px 0.4px; }
}

@keyframes breathe {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.08; }
}

@keyframes grain-slow {
  from { transform: translate(0, 0); }
  to { transform: translate(-6%, 4%); }
}

@media (prefers-reduced-motion: reduce) {
  .screen__pic,
  .screen__breathe,
  .screen__grain {
    animation: none !important;
  }

  .screen__grain,
  .screen__dust {
    display: none;
  }
}
</style>
