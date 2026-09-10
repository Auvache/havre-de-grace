<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <p class="muted-text max-w-2xl text-[0.95em]">
        Ten entrances for the splash logo, each on the splash background. Waterline is the one
        running on the site — half a second of empty ink, the reveal, then three quarters of a
        second before the overlay goes. The rest are the alternatives it was chosen from; swapping one in
        is a keyframe change in <code class="text-[0.9em]">AppSplashScreen.vue</code>. They all
        play once on load; use replay to watch one again.
      </p>
      <button type="button" class="replay-all" @click="playAll">
        replay all
      </button>
    </div>

    <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <figure v-for="anim in ANIMATIONS" :key="anim.id" class="surface-card overflow-hidden">
        <div class="anim-stage">
          <!--
            Re-keying the element is what restarts a CSS animation: the old node
            is dropped and the new one starts from its first keyframe, which
            beats toggling a class and forcing a reflow between.
          -->
          <div
            :key="`${anim.id}-${runs[anim.id]}`"
            class="anim-art"
            :class="`is-${anim.id}`"
            v-html="svg"
          />
        </div>

        <figcaption class="flex items-start justify-between gap-4 border-t border-theme p-4">
          <div>
            <h3 class="text-[0.95rem] font-medium lowercase">
              {{ anim.name }}
              <span
                v-if="'live' in anim"
                class="label-text ml-1.5 align-middle text-[0.55rem] text-[color:var(--color-accent)]"
              >in use</span>
            </h3>
            <p class="muted-text mt-1 text-[0.85rem] leading-relaxed">
              {{ anim.note }}
            </p>
          </div>
          <button type="button" class="replay shrink-0" @click="play(anim.id)">
            replay
          </button>
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ svg: string }>()

const ANIMATIONS = [
  { id: 'fade', name: 'fade', note: 'Straight fade up to full. What the splash does today.' },
  { id: 'rise', name: 'rise', note: 'Fades in while lifting, as though it settles onto the page.' },
  { id: 'breathe', name: 'breathe', note: 'Comes out of a slow zoom. The most cinematic of the set.' },
  { id: 'stamp', name: 'stamp', note: 'Pressed on hard and fast, like a stamp hitting paper.' },
  { id: 'level', name: 'level', note: 'Swings the last few degrees to level, the way a hung sign does.' },
  { id: 'bloom', name: 'bloom', note: 'Ink settling into paper: blur resolving to a sharp edge.' },
  { id: 'waterline', name: 'waterline', note: 'Uncovered from below by a rising line.', live: true },
  { id: 'sequence', name: 'sequence', note: 'Anchor first, name a beat behind it.' },
  { id: 'draw', name: 'draw', note: 'The lettering draws itself in; the anchor fades in behind it.' },
  { id: 'swing', name: 'swing', note: 'Hangs from its shackle and swings to rest, then the name.' },
] as const

const runs = reactive<Record<string, number>>(
  Object.fromEntries(ANIMATIONS.map((a) => [a.id, 0])),
)

const play = (id: string) => {
  runs[id] += 1
}

const playAll = () => {
  for (const anim of ANIMATIONS) {
    runs[anim.id] += 1
  }
}
</script>

<style scoped>
.anim-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 11.5rem;
  overflow: hidden;
  padding: 1.75rem;
  background: var(--color-splash-bg);
}

/* The suite files carry `color="#16191d"` as an attribute, which beats an
   inherited colour — so the reversed stage has to set it on the svg itself. */
.anim-art :deep(svg) {
  display: block;
  height: 6.5rem;
  width: auto;
  color: #f4f6f7;
}

.replay,
.replay-all {
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-accent);
  padding-bottom: 0.15rem;
  opacity: 0.75;
}

.replay:hover,
.replay-all:hover {
  opacity: 1;
}

/*
  Every entrance below runs at the splash's own timing — the move after half
  a second of blank ink — so what plays here is what would play there.

  Transforms sit on the wrapper, never on the <svg>'s own <g> elements: an SVG
  `transform` attribute is the CSS `transform` property, so animating that
  property would throw away the translate that positions the anchor over the
  name. Where a part has to move on its own, it moves with `translate` and
  `rotate`, which compose with the attribute instead of replacing it.
*/
.anim-art {
  animation-duration: 750ms;
  animation-delay: 500ms;
  animation-fill-mode: both;
  animation-timing-function: var(--ease-standard);
}

.is-fade {
  animation-name: splash-fade;
}

.is-rise {
  animation-name: splash-rise;
}

.is-breathe {
  animation-name: splash-breathe;
  animation-duration: 1200ms;
}

.is-stamp {
  animation-name: splash-stamp;
  animation-duration: 520ms;
  animation-timing-function: cubic-bezier(0.2, 1.1, 0.3, 1);
}

.is-level {
  animation-name: splash-level;
  animation-duration: 900ms;
}

.is-bloom {
  animation-name: splash-bloom;
  animation-duration: 1000ms;
}

.is-waterline {
  animation-name: splash-waterline;
  animation-duration: 1100ms;
}

@keyframes splash-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes splash-rise {
  from { opacity: 0; transform: translateY(1.4rem); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes splash-breathe {
  from { opacity: 0; transform: scale(1.07); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes splash-stamp {
  from { opacity: 0; transform: scale(1.22); }
  60% { opacity: 1; }
  to { opacity: 1; transform: scale(1); }
}

@keyframes splash-level {
  from { opacity: 0; transform: rotate(-7deg) translateY(0.5rem); }
  to { opacity: 1; transform: rotate(0deg) translateY(0); }
}

@keyframes splash-bloom {
  from { opacity: 0; filter: blur(14px); }
  40% { opacity: 1; }
  to { opacity: 1; filter: blur(0); }
}

/* Top inset at 100% collapses the box onto the bottom edge, so easing it back
   to zero uncovers the mark from the waterline up. */
@keyframes splash-waterline {
  from { clip-path: inset(100% 0 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

/*
  The two-part entrances. A4 is two top-level groups — the anchor, then the
  name — which is what makes them addressable. By type, not by position: the
  file opens with a <title>, so `g:first-child` matches nothing.
*/
.is-sequence :deep(svg > g:first-of-type) {
  animation: splash-lift 700ms var(--ease-standard) 500ms both;
}

.is-sequence :deep(svg > g:last-of-type) {
  animation: splash-lift 700ms var(--ease-standard) 850ms both;
}

/* The part-by-part version of `rise`, and it has to be its own keyframes for
   two reasons: `translate` rather than `transform`, so the group keeps the
   transform attribute that positions it, and user units rather than rem,
   because this runs inside a viewBox where the lockup is 620 units tall. */
@keyframes splash-lift {
  from { opacity: 0; translate: 0 80px; }
  to { opacity: 1; translate: 0 0; }
}

.is-draw :deep(svg > g:first-of-type) {
  animation: splash-fade 900ms var(--ease-standard) 500ms both;
}

/* The lettering is stroke centrelines, so it can be drawn rather than faded.
   One dash long enough to cover the longest glyph covers all of them. */
.is-draw :deep(svg > g:last-of-type path) {
  stroke-dasharray: 460;
  stroke-dashoffset: 460;
  animation: splash-draw 1100ms cubic-bezier(0.4, 0, 0.2, 1) 600ms both;
}

@keyframes splash-draw {
  to { stroke-dashoffset: 0; }
}

/*
  The whole lockup swings, pivoting where the shackle would hang. Rotating the
  anchor group alone would be more literal, but re-pointing `transform-origin`
  at the shackle also re-points the scale() in the group's own transform
  attribute, which slides the anchor off centre. With the name still at zero
  opacity for the first beat, swinging everything looks the same anyway.
*/
.is-swing {
  transform-origin: 50% 8%;
  animation-name: splash-swing;
  animation-duration: 1200ms;
  animation-timing-function: cubic-bezier(0.33, 0.6, 0.3, 1);
}

.is-swing :deep(svg > g:last-of-type) {
  animation: splash-fade 700ms var(--ease-standard) 1250ms both;
}

@keyframes splash-swing {
  from { opacity: 0; transform: rotate(-15deg); }
  25% { opacity: 1; }
  45% { transform: rotate(8deg); }
  70% { transform: rotate(-3.5deg); }
  88% { transform: rotate(1.2deg); }
  to { opacity: 1; transform: rotate(0deg); }
}

/* The splash itself never runs for anyone who asks for less motion — it is
   skipped outright — so the previews hold still here too. */
@media (prefers-reduced-motion: reduce) {
  .anim-art,
  .anim-art :deep(svg > g),
  .anim-art :deep(svg > g:last-of-type path) {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
