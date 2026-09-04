<template>
  <div class="night-page" :style="pageStyle">
    <!-- the room reacts to the music -->
    <div class="room-glow" aria-hidden="true" :style="{ opacity: 0.18 + deck.level.value * 0.5, transform: `scale(${1 + deck.level.value * 0.12})` }" />
    <div class="dust" aria-hidden="true" />

    <header class="hud">
      <NuxtLink to="/" class="hud-btn" aria-label="Back to Havre De Grace">
        <span aria-hidden="true">←</span>
        <span class="back-long" aria-hidden="true">Havre De Grace</span>
        <span class="back-short" aria-hidden="true">Back</span>
      </NuxtLink>
      <div class="hud-mid">
        <span class="hud-album">{{ deck.album.value?.title ?? 'No record' }}</span>
        <span class="hud-side">Side {{ deck.side.value.toUpperCase() }}</span>
      </div>
      <div class="hud-right">
        <button type="button" class="hud-btn" :class="{ on: showLyrics }" @click="showLyrics = !showLyrics">Lyrics</button>
        <button type="button" class="hud-btn" :class="{ on: showNotes }" @click="showNotes = !showNotes">Notes</button>
      </div>
    </header>

    <!-- ---------- the rack ---------- -->
    <nav class="rack" aria-label="Records">
      <button
        v-for="a in albums"
        :key="a.slug"
        type="button"
        class="rack-item"
        :class="{ on: deck.album.value?.slug === a.slug }"
        :aria-label="`Put on ${a.title}`"
        :aria-current="deck.album.value?.slug === a.slug"
        @click="putOn(a)"
      >
        <img :src="a.coverImage" :alt="a.coverAlt">
        <span class="rack-name">{{ a.title }}</span>
        <span v-if="a.isFiller" class="rack-ph">ph</span>
      </button>
    </nav>

    <!-- ---------- the record ---------- -->
    <main class="deck-space">
      <div ref="frameEl" class="deck-frame">
        <div
          ref="discEl"
          class="disc"
          :class="{ live: deck.playing.value }"
          role="button"
          tabindex="0"
          :aria-label="discLabel"
          @pointerdown="onDiscDown"
          @keydown="onDiscKey"
        >
          <div class="disc-spin" :style="{ transform: `rotate(${deck.rotation.value}deg)` }">
            <div class="disc-vinyl" />
            <div class="disc-bands" :style="{ backgroundImage: bandGradient }" />
            <div class="disc-label">
              <span v-if="!deck.album.value" class="disc-empty">no record</span>
              <span class="disc-hole" />
            </div>
          </div>

          <!-- Nothing plays until the visitor acts, so the deck says how — and
               while the arm is being dragged it says where it would land. -->
          <p v-if="scrubCue" class="drop-hint live">
            {{ scrubCue.track?.title }} · {{ formatDuration(scrubCue.offset) }} in
          </p>
          <p v-else-if="deck.album.value && !deck.playing.value" class="drop-hint">
            Drag the needle, or click a groove
          </p>

          <!-- hover crosshair: which song is under the pointer -->
          <div v-if="hoverInfo" class="hover-cue" :style="{ left: `${hoverPoint.x}px`, top: `${hoverPoint.y}px` }">
            <strong>{{ hoverInfo.track?.title }}</strong>
            <span>{{ formatDuration(hoverInfo.offset) }} in · click to drop</span>
          </div>
        </div>

        <!-- Drag the arm to move through the side; it also reads out where the
             needle is when the record is playing. -->
        <div
          class="arm"
          :class="{ dragging: deck.scrubbing.value }"
          :style="{ transform: `translateY(-50%) rotate(${armDeg}deg)` }"
          role="slider"
          tabindex="0"
          aria-label="Tonearm — drag across the record to move through the side"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="Math.round(deck.sideProgress.value * 100)"
          :aria-valuetext="armValueText"
          @pointerdown="onArmDown"
          @pointermove="onArmMove"
          @pointerup="onArmUp"
          @pointercancel="onArmUp"
          @keydown="onArmKey"
        >
          <span class="arm-tube" aria-hidden="true" />
          <span class="arm-head" aria-hidden="true" />
          <span class="arm-pivot" aria-hidden="true" />
        </div>
      </div>

      <!-- teleprompter lyrics -->
      <transition name="fade">
        <div v-if="showLyrics" class="prompter" aria-live="polite">
          <p
            v-for="entry in lyricWindow"
            :key="entry.i"
            class="prompt-line"
            :class="{ now: entry.i === deck.activeLyricIndex.value }"
            :style="{ opacity: entry.opacity }"
          >{{ entry.line || '·' }}</p>
          <p v-if="!lyricWindow.length" class="prompt-line dim">{{ deck.track.value ? 'Instrumental' : 'Drop the needle' }}</p>
        </div>
      </transition>
    </main>

    <!-- ---------- console ---------- -->
    <footer class="console">
      <div class="meters" aria-hidden="true">
        <div v-for="(m, i) in ['L', 'R']" :key="m" class="vu">
          <span class="vu-face" />
          <span class="vu-needle" :style="{ transform: `rotate(${vuAngle(i)}deg)` }" />
          <span class="vu-label">{{ m }}</span>
        </div>
      </div>

      <div class="transport">
        <button type="button" class="c-btn" @click="deck.prev()">⏮</button>
        <button type="button" class="c-btn big" @click="deck.toggle()">
          {{ deck.cueing.value ? '…' : deck.playing.value ? '❚❚' : '▶' }}
        </button>
        <button type="button" class="c-btn" @click="deck.next()">⏭</button>
        <button type="button" class="c-btn" :disabled="!deck.hasOtherSide.value" @click="deck.flip({ keepPlaying: true })">Side {{ deck.otherSide.value.toUpperCase() }}</button>
      </div>

      <div class="now">
        <span class="now-n">{{ deck.side.value.toUpperCase() }}{{ deck.track.value?.sideNumber ?? '–' }}</span>
        <strong>{{ deck.track.value?.title ?? '—' }}</strong>
        <span class="now-t">{{ formatDuration(deck.sidePosition.value) }} / {{ formatDuration(deck.sideLength.value) }}</span>
      </div>

      <div class="switches">
        <!-- A genuine speed switch: 33 played at 45 really is pitched up. -->
        <div class="speed" role="group" aria-label="Turntable speed">
          <button
            v-for="s in SPEEDS"
            :key="s.label"
            type="button"
            class="sp"
            :class="{ on: Math.round(deck.rpm.value) === Math.round(s.value) }"
            @click="deck.rpm.value = s.value"
          >{{ s.label }}</button>
        </div>
      </div>
    </footer>

    <!-- notes drawer -->
    <transition name="slide">
      <aside v-if="showNotes" class="notes-drawer" aria-label="Liner notes">
        <button type="button" class="drawer-close" @click="showNotes = false">close ✕</button>
        <h2>{{ deck.album.value?.title }}</h2>
        <p v-if="deck.album.value?.isFiller" class="ph-flag">placeholder content</p>
        <template v-if="deck.track.value?.writingStory">
          <h3>On “{{ deck.track.value.title }}”</h3>
          <p>{{ deck.track.value.writingStory }}</p>
        </template>
        <p v-if="deck.track.value?.recordingDetails">{{ deck.track.value.recordingDetails }}</p>
        <h3>Album</h3>
        <p v-if="deck.album.value?.linerNotesArePlaceholder" class="ph-flag">lorem — no liner notes written yet</p>
        <p v-for="(para, i) in linerParas" :key="i">{{ para }}</p>
        <h3>Credits</h3>
        <dl>
          <template v-for="c in (deck.track.value?.credits.length ? deck.track.value.credits : deck.album.value?.credits ?? [])" :key="c.role + c.name">
            <dt>{{ c.role }}</dt><dd>{{ c.name }}</dd>
          </template>
        </dl>
      </aside>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import type { ListenAlbum } from '~/utils/listenAlbums'
import { buildListenAlbums, formatDuration, grooveBandGradient } from '~/utils/listenAlbums'

definePageMeta({ layout: 'listen' })

/*
 * /listen — the record player.
 *
 * A dark room, one enormous record, and no chrome between the visitor and it.
 * The record IS the control: you aim at a groove and click, the way you would
 * lower a needle by eye. The tonearm is a readout of where the needle actually
 * is, not a separate control surface.
 *
 * A side of vinyl is one continuous surface, so position is measured in seconds
 * across the whole side (see useVinylDeck) — the needle can be dropped
 * mid-song, and the songs are drawn as visible bands you can aim at.
 *
 * Nothing plays until the visitor drops the needle or presses play. Choosing a
 * record only loads it onto the platter.
 *
 * The VU needles and the glow behind the deck are driven by an AnalyserNode on
 * the real output, and the 33/45 switch genuinely repitches the record.
 */

const SPEEDS = [
  { label: '33⅓', value: 100 / 3 },
  { label: '45', value: 45 },
]

const { data } = await useAsyncData('listen-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return buildListenAlbums(items)
})
const albums = computed<ListenAlbum[]>(() => data.value ?? [])

const deck = useVinylDeck({ analyser: true })
const showLyrics = ref(true)
const showNotes = ref(false)

onMounted(() => { if (albums.value.length) deck.load(albums.value[0]!) })

// Choosing a record puts it on the platter with the needle still up. Starting
// it is the visitor's move — a groove click, the tonearm, or play.
function putOn(album: ListenAlbum) {
  if (deck.album.value?.slug === album.slug) return
  deck.load(album)
}

// --- aiming at the groove -------------------------------------------------
// Radii as fractions of the record's radius, matching grooveBandGradient.
const OUTER_R = 0.95
const INNER_R = 0.45

const discEl = ref<HTMLElement | null>(null)
const hoverPoint = reactive({ x: 0, y: 0 })
const hoverInfo = ref<{ track: { title: string } | null, offset: number } | null>(null)

function progressFromPoint(clientX: number, clientY: number) {
  const el = discEl.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const radius = rect.width / 2
  const rf = Math.hypot(clientX - cx, clientY - cy) / radius
  if (rf > OUTER_R + 0.05 || rf < INNER_R - 0.02) return null
  return Math.min(1, Math.max(0, (OUTER_R - rf) / (OUTER_R - INNER_R)))
}

function onDiscDown(event: PointerEvent) {
  if (!deck.album.value) return
  const p = progressFromPoint(event.clientX, event.clientY)
  if (p === null) return
  event.preventDefault()
  deck.seekSide(p)
}

function onDiscKey(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); deck.toggle() }
  else if (event.key === 'ArrowRight') { event.preventDefault(); deck.next() }
  else if (event.key === 'ArrowLeft') { event.preventDefault(); deck.prev() }
}

function onDiscHover(event: PointerEvent) {
  const el = discEl.value
  if (!el || !deck.album.value) { hoverInfo.value = null; return }
  const p = progressFromPoint(event.clientX, event.clientY)
  if (p === null) { hoverInfo.value = null; return }
  const rect = el.getBoundingClientRect()
  hoverPoint.x = event.clientX - rect.left
  hoverPoint.y = event.clientY - rect.top
  hoverInfo.value = deck.preview(p)
}

onMounted(() => {
  discEl.value?.addEventListener('pointermove', onDiscHover)
  discEl.value?.addEventListener('pointerleave', () => { hoverInfo.value = null })
})

const discLabel = computed(() => (deck.album.value
  ? `Record grooves for side ${deck.side.value.toUpperCase()}. Click a groove to drop the needle there.`
  : 'No record loaded'))

// --- arm readout ----------------------------------------------------------
// Solved against the giant disc's centre and groove radii. The pivot sits just
// off the disc (right: -6%) rather than far out, so the arm still fits beside
// the record on a phone instead of running off the screen.
const ARM_PARK = 90
const ARM_OUTER = 70
const ARM_INNER = 47.6
/** Pivot as a fraction of the deck frame — matches `.arm`'s right/top in CSS. */
const ARM_PIVOT = { x: 1.06, y: 0.82 }

const armDeg = computed(() => {
  const p = deck.armProgress.value
  return p < 0 ? ARM_PARK : ARM_OUTER + p * (ARM_INNER - ARM_OUTER)
})

const armValueText = computed(() => (deck.album.value
  ? `${deck.track.value?.title ?? 'off'}, ${formatDuration(deck.sidePosition.value)} into side ${deck.side.value.toUpperCase()}`
  : 'No record loaded'))

/** Where the needle would land if the arm were released now. */
const scrubCue = computed(() => (deck.scrubbing.value ? deck.preview(deck.scrubProgress.value) : null))

const frameEl = ref<HTMLElement | null>(null)

/** Pointer angle about the arm's pivot, expressed as progress along the side. */
function armProgressFromPointer(event: PointerEvent): number | null {
  const el = frameEl.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const px = rect.left + rect.width * ARM_PIVOT.x
  const py = rect.top + rect.height * ARM_PIVOT.y
  let phi = (Math.atan2(event.clientY - py, event.clientX - px) * 180) / Math.PI + 180
  while (phi > 180) phi -= 360
  while (phi < -180) phi += 360
  return (phi - ARM_OUTER) / (ARM_INNER - ARM_OUTER)
}

function onArmDown(event: PointerEvent) {
  if (!deck.album.value) return
  const p = armProgressFromPointer(event)
  if (p === null) return
  // Pointer capture is what makes the drag work on a touch screen: the finger
  // leaves the thin arm almost immediately, and without it the move events stop.
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  deck.beginScrub(Math.min(1, Math.max(0, p)))
  event.preventDefault()
}

function onArmMove(event: PointerEvent) {
  if (!deck.scrubbing.value) return
  const p = armProgressFromPointer(event)
  if (p !== null) deck.moveScrub(p)
}

function onArmUp(event: PointerEvent) {
  if (!deck.scrubbing.value) return
  const p = armProgressFromPointer(event)
  try { (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId) } catch { /* ignore */ }
  // Swung back out past the lead-in groove means parking the arm, not playing.
  deck.endScrub(p !== null && p < -0.12)
}

function onArmKey(event: KeyboardEvent) {
  const step = event.shiftKey ? 0.02 : 0.06
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault(); deck.seekSide(deck.sideProgress.value + step)
  }
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault(); deck.seekSide(deck.sideProgress.value - step)
  }
  else if (event.key === 'Home') { event.preventDefault(); deck.seekSide(0) }
  else if (event.key === 'End') { event.preventDefault(); deck.lift() }
}

// --- meters ---------------------------------------------------------------
// One analyser, two needles: the right lags slightly so the pair moves like a
// real stereo meter instead of a mirror.
const lag = ref(0)
watch(() => deck.level.value, (v) => { setTimeout(() => { lag.value = v }, 90) })
const vuAngle = (i: number) => -42 + (i === 0 ? deck.level.value : lag.value) * 84

// --- lyrics ---------------------------------------------------------------
const WINDOW = 4
const lyricWindow = computed(() => {
  const lines = deck.track.value?.lyrics ?? []
  const active = deck.activeLyricIndex.value
  if (!lines.length) return []
  const centre = active >= 0 ? active : 0
  const out: Array<{ i: number, line: string, opacity: number }> = []
  for (let i = centre - WINDOW; i <= centre + WINDOW; i += 1) {
    if (i < 0 || i >= lines.length) continue
    const distance = Math.abs(i - centre)
    out.push({ i, line: lines[i]!, opacity: Math.max(0.12, 1 - distance * 0.26) })
  }
  return out
})

const bandGradient = computed(() => grooveBandGradient(
  deck.tracks.value.map((t) => t.durationSec),
  deck.offsets.value,
  deck.sideLength.value,
  { current: deck.index.value, accent: deck.album.value?.accent ?? '#ffffff' },
))

const linerParas = computed(() => (deck.album.value?.linerNotes ?? '').split(/\n\s*\n/).filter(Boolean))

const pageStyle = computed(() => ({
  '--accent': deck.album.value?.accent ?? '#c9a15e',
}))

// noindex (see routeRules): the scene is locked to the viewport and renders
// almost no text server-side, so it can't earn a search listing. The "digital
// vinyl" angle is targeted from the album pages, which have the body copy for it.
usePageSeo({
  title: 'Listen | Havre De Grace',
  description: 'Play Havre De Grace albums on an interactive record player — drop the needle and hear the album the way a record plays.',
  path: '/listen',
})
</script>

<style scoped>
.night-page {
  --amber: #e8b465;
  position: relative;
  height: 100dvh;
  display: grid;
  /* An implicit `auto` column takes its widest child's max-content, which
     let the scene grow past a phone's viewport. */
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  color: #e9e4dc;
  font-family: Jost, ui-sans-serif, system-ui, sans-serif;
  background: radial-gradient(90% 70% at 50% 42%, #1a1a1e 0%, #101012 46%, #050506 100%);
  overflow: hidden;
}

.room-glow {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 78vmin;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 60%, transparent) 0%, transparent 62%);
  filter: blur(46px);
  transition: opacity .12s linear, transform .12s linear;
}

.dust {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .35;
  background-image:
    radial-gradient(1.5px 1.5px at 18% 24%, rgba(255, 245, 225, .5), transparent),
    radial-gradient(1.2px 1.2px at 72% 38%, rgba(255, 245, 225, .4), transparent),
    radial-gradient(1.6px 1.6px at 44% 72%, rgba(255, 245, 225, .35), transparent),
    radial-gradient(1.1px 1.1px at 86% 66%, rgba(255, 245, 225, .4), transparent),
    radial-gradient(1.4px 1.4px at 28% 84%, rgba(255, 245, 225, .3), transparent);
  animation: drift 26s linear infinite alternate;
}

@keyframes drift { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-24px, -34px, 0); } }

/* ---------- hud ---------- */
.hud {
  position: relative;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px clamp(12px, 3vw, 28px);
}

.hud-btn { display: inline-flex; align-items: center; gap: 6px; }
.back-short { display: none; }
.hud-mid { text-align: center; line-height: 1.2; }
.hud-album { display: block; font-size: .9rem; letter-spacing: .04em; }
.hud-side { font-size: .58rem; letter-spacing: .3em; text-transform: uppercase; color: #8d8579; }
.hud-right { display: flex; gap: 6px; }

.hud-btn {
  padding: 6px 12px;
  border: 1px solid rgba(233, 228, 220, .18);
  border-radius: 999px;
  background: rgba(233, 228, 220, .04);
  color: #d9d3ca;
  font: inherit;
  font-size: .64rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background .2s, color .2s, border-color .2s;
}
.hud-btn:hover { background: rgba(233, 228, 220, .1); }
.hud-btn.on { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }

/* ---------- rack ---------- */
.rack {
  position: absolute;
  left: clamp(8px, 1.6vw, 18px);
  top: 50%;
  z-index: 7;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 66vh;
  padding: 8px;
  overflow-y: auto;
  scrollbar-width: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, .03);
  border: 1px solid rgba(255, 255, 255, .06);
}
.rack::-webkit-scrollbar { display: none; }

.rack-item {
  position: relative;
  flex: none;
  width: clamp(42px, 5vw, 58px);
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  filter: brightness(.42) saturate(.6);
  transition: filter .25s ease, transform .25s ease;
}
.rack-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
.rack-item:hover { filter: brightness(.9); transform: translateX(4px); }
.rack-item.on { filter: none; box-shadow: 0 0 0 1px var(--accent), 0 0 14px color-mix(in srgb, var(--accent) 50%, transparent); }

.rack-name {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(10, 10, 12, .92);
  font-size: .62rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease;
}
.rack-item:hover .rack-name { opacity: 1; }
.rack-ph { position: absolute; top: 2px; right: 2px; padding: 0 3px; border-radius: 2px; background: #a4503f; font-size: .44rem; letter-spacing: .08em; text-transform: uppercase; }

/* ---------- deck ---------- */
.deck-space {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(16px, 4vw, 60px);
  padding: 0 clamp(70px, 8vw, 120px);
  min-height: 0;
}

.deck-frame { position: relative; justify-self: center; align-self: center; width: min(46vh, 100%); max-height: 100%; aspect-ratio: 1; }

.disc {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: crosshair;
  touch-action: none;
  box-shadow: 0 40px 80px rgba(0, 0, 0, .7);
  transition: box-shadow .5s ease;
}
.disc.live { box-shadow: 0 40px 90px rgba(0, 0, 0, .75), 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent); }
.disc:focus-visible { outline: 2px solid var(--accent); outline-offset: 8px; }

.disc-spin { position: absolute; inset: 0; border-radius: 50%; will-change: transform; }

.disc-vinyl {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle at 50% 50%, #08080a 0 4px, #141418 4px 5px, #08080a 5px 9px),
    #08080a;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, .95);
}

.disc-bands { position: absolute; inset: 0; border-radius: 50%; mix-blend-mode: screen; }

/* Stationary sheen: the disc turns underneath the room light. */
.disc::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  background: conic-gradient(from 214deg, transparent 0deg, rgba(255, 240, 210, .16) 26deg, transparent 58deg, transparent 196deg, rgba(255, 240, 210, .1) 220deg, transparent 250deg);
  mix-blend-mode: screen;
  /* Keep the room light off the centre label — it washed the artwork out. */
  mask: radial-gradient(circle closest-side, transparent 0 36%, #000 38%);
  -webkit-mask: radial-gradient(circle closest-side, transparent 0 36%, #000 38%);
}

.disc-label {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 34%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  /* A blank white label. The faint off-centre shading keeps it reading as a
     paper label catching the room light rather than a flat white disc. */
  background: radial-gradient(circle at 42% 36%, #ffffff 0%, #f7f6f3 62%, #eceae5 100%);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .18), 0 1px 5px rgba(0, 0, 0, .5);
}
.disc-empty { font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: #a8a49c; }
.disc-hole { position: absolute; width: 6%; aspect-ratio: 1; border-radius: 50%; background: #060607; box-shadow: 0 0 0 2px rgba(0, 0, 0, .16); }

.drop-hint {
  position: absolute;
  left: 50%;
  bottom: -34px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: .62rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(233, 228, 220, .42);
  pointer-events: none;
}

.drop-hint.live { color: var(--accent); letter-spacing: .12em; text-transform: none; font-size: .78rem; }

.hover-cue {
  position: absolute;
  z-index: 9;
  transform: translate(14px, -50%);
  padding: 6px 10px;
  border-radius: 7px;
  background: rgba(8, 8, 10, .92);
  border: 1px solid rgba(255, 255, 255, .12);
  pointer-events: none;
  white-space: nowrap;
  line-height: 1.35;
}
.hover-cue strong { display: block; font-size: .78rem; font-weight: 500; }
.hover-cue span { font-size: .6rem; color: #8d8579; letter-spacing: .06em; }

/* arm */
.arm {
  position: absolute;
  right: -6%;
  top: 82%;
  width: 72%;
  /* The tube is only 3px, far too thin to grab with a finger. The element is
     deliberately much taller than what it draws so the whole arm is a touch
     target; the drawn parts stay centred inside it. */
  height: 13%;
  transform-origin: 100% 50%;
  transition: transform 1.1s cubic-bezier(.22, .9, .24, 1.02);
  z-index: 8;
  cursor: grab;
  /* Without this a touch-drag scrolls/zooms the page instead of moving the arm. */
  touch-action: none;
  outline: none;
}

.arm.dragging { transition: none; cursor: grabbing; }
.arm:focus-visible .arm-tube { box-shadow: 0 0 0 3px rgba(255, 255, 255, .75), 0 0 0 6px var(--accent); }
.arm-tube { position: absolute; left: 4%; right: 9%; top: 50%; height: 3px; transform: translateY(-50%); border-radius: 999px; background: linear-gradient(90deg, #e8eef1, #6f787e 34%, #dbe3e7 68%, #f2f6f8); box-shadow: 0 3px 8px rgba(0, 0, 0, .6); }
.arm-head { position: absolute; left: 0; top: 50%; width: 7%; height: 92%; transform: translateY(-50%) rotate(-8deg); border-radius: 2px; background: linear-gradient(180deg, #4b5257, #1e2226); }
.arm-pivot { position: absolute; right: -4%; top: 50%; width: 9%; aspect-ratio: 1; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle at 40% 36%, #cbd4d9, #23282d); box-shadow: 0 6px 14px rgba(0, 0, 0, .6); }

/* prompter */
.prompter {
  align-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 70%;
  overflow: hidden;
  padding-right: 10px;
  /* Lines fade out at the edges instead of being cut in half. */
  mask: linear-gradient(180deg, transparent, #000 16%, #000 84%, transparent);
  -webkit-mask: linear-gradient(180deg, transparent, #000 16%, #000 84%, transparent);
}

.prompt-line {
  font-size: clamp(1.05rem, 2.3vw, 1.9rem);
  font-weight: 300;
  line-height: 1.5;
  letter-spacing: .005em;
  color: #cfc8bd;
  transition: opacity .5s ease, color .5s ease, transform .5s ease;
}
.prompt-line.now { color: #fff; text-shadow: 0 0 26px color-mix(in srgb, var(--accent) 60%, transparent); }
.prompt-line.dim { opacity: .4 !important; font-size: 1rem; }

/* ---------- console ---------- */
.console {
  position: relative;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 36px);
  padding: 14px clamp(12px, 3vw, 28px) 18px;
  border-top: 1px solid rgba(255, 255, 255, .07);
  background: linear-gradient(180deg, rgba(10, 10, 12, .2), rgba(6, 6, 8, .85));
}

.meters { display: flex; gap: 10px; }
.vu {
  position: relative;
  width: 62px;
  height: 34px;
  overflow: hidden;
  border-radius: 5px 5px 3px 3px;
  background: linear-gradient(180deg, #e9dcbb, #cbbb93);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .4), 0 2px 6px rgba(0, 0, 0, .5);
}
.vu-face { position: absolute; inset: 0; background: radial-gradient(circle at 50% 118%, transparent 54%, rgba(90, 70, 40, .3) 55%, transparent 57%); }
.vu-needle {
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 1.5px;
  height: 34px;
  transform-origin: 50% 100%;
  background: #7d2018;
  transition: transform .1s ease-out;
}
.vu-label { position: absolute; left: 4px; bottom: 2px; font-size: .5rem; letter-spacing: .1em; color: #6c5b38; }

.transport { display: flex; gap: 6px; }
.c-btn {
  min-width: 40px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 8px;
  background: rgba(255, 255, 255, .05);
  color: #ddd7ce;
  font: inherit;
  font-size: .72rem;
  cursor: pointer;
  transition: background .18s, border-color .18s, color .18s;
}
.c-btn:hover:not(:disabled) { background: rgba(255, 255, 255, .12); }
.c-btn:disabled { opacity: .35; cursor: default; }
.c-btn.big { min-width: 56px; background: color-mix(in srgb, var(--accent) 28%, transparent); border-color: color-mix(in srgb, var(--accent) 50%, transparent); }
.c-btn.sm { height: 28px; font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; }
.c-btn.on { color: var(--accent); border-color: var(--accent); }

.now { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 10px; }
.now-n { font-size: .6rem; letter-spacing: .2em; color: #8d8579; }
.now strong { font-size: .95rem; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.now-t { margin-left: auto; font-size: .68rem; color: #8d8579; font-variant-numeric: tabular-nums; }

.switches { display: flex; align-items: center; gap: 8px; }
.speed { display: flex; border: 1px solid rgba(255, 255, 255, .14); border-radius: 8px; overflow: hidden; }
.sp { padding: 7px 10px; border: 0; background: none; color: #9a938a; font: inherit; font-size: .66rem; cursor: pointer; }
.sp.on { background: color-mix(in srgb, var(--accent) 26%, transparent); color: #fff; }

/* ---------- notes drawer ---------- */
.notes-drawer {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 40;
  width: min(92vw, 420px);
  padding: 22px 24px 90px;
  overflow-y: auto;
  background: rgba(9, 9, 11, .97);
  border-left: 1px solid rgba(255, 255, 255, .1);
  backdrop-filter: blur(10px);
}
.drawer-close { float: right; padding: 4px 10px; border: 1px solid rgba(255, 255, 255, .16); border-radius: 999px; background: none; color: #b9b2a8; font: inherit; font-size: .6rem; letter-spacing: .1em; cursor: pointer; }
.notes-drawer h2 { font-size: 1.2rem; font-weight: 400; margin-bottom: 4px; }
.notes-drawer h3 { margin: 18px 0 6px; font-size: .6rem; letter-spacing: .22em; text-transform: uppercase; color: var(--accent); }
.notes-drawer p { font-size: .86rem; line-height: 1.75; color: #c3bcb2; margin-bottom: 9px; }
.notes-drawer dl { display: grid; grid-template-columns: auto 1fr; gap: 3px 14px; font-size: .8rem; }
.notes-drawer dt { color: #8d8579; }
.ph-flag { display: inline-block; padding: 1px 7px; border-radius: 3px; background: rgba(164, 80, 63, .28); color: #e08e7c !important; font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; }

.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform .35s cubic-bezier(.2, .9, .25, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

/* ---------- responsive ---------- */
@media (max-width: 900px) {
  /* The record is the page, so its row gets a floor and the lyrics give up the
     space instead — on a short phone an `auto` lyric row squeezed the disc down
     to 100px, far too small to aim a needle at. */
  .deck-space { grid-template-columns: 1fr; grid-template-rows: minmax(190px, 1fr) minmax(0, auto); padding: 0 12px; gap: 10px; }
  /* Height-driven, and capped at the row it sits in. Sizing the disc from raw
     viewport units let it outgrow its grid row on short/mobile viewports and
     overlap the header and the lyrics. */
  .deck-frame { width: auto; height: min(38vh, 78vw, calc(100% - 30px)); }
  /* Stacked layout puts the lyrics directly under the record, so the hint line
     needs its own reserved strip rather than overlapping them. */
  .drop-hint { bottom: -24px; }
  .rack {
    left: 0; right: 0; top: auto; bottom: 0; transform: none;
    flex-direction: row; max-height: none; border-radius: 0;
    border: 0; border-top: 1px solid rgba(255, 255, 255, .07);
    overflow-x: auto;
  }
  .rack-name { display: none; }
  .prompter { max-height: min(30vh, 100%); }
  .prompt-line { font-size: 1rem; }
  .console { flex-wrap: wrap; gap: 10px; padding: 12px 12px 14px; margin-bottom: 74px; }
  .meters { display: none; }
  /* `flex: 1` in the base rule sets flex-basis to 0, which beats `width: 100%`;
     the basis has to be 100% for the now-playing line to take its own row. */
  .now { order: 2; flex: 1 0 100%; }

  /* Back link, title and the two panel toggles don't fit on one phone row, so
     the title drops to its own line rather than every item wrapping mid-word. */
  .hud { flex-wrap: wrap; row-gap: 8px; }
  .hud-btn { white-space: nowrap; }
  .hud-mid { order: 3; width: 100%; }
}

/* 320px-class phones: the full wordmark can't share a row with the two panel
   toggles, and letting it wrap costs the record a third of its height. */
@media (max-width: 380px) {
  .back-long { display: none; }
  .back-short { display: inline; }
}

/* Short phones (SE-class). Every block above the deck is trimmed so the record
   still gets a usable size. */
@media (max-width: 900px) and (max-height: 720px) {
  .hud { padding-top: 8px; padding-bottom: 0; }
  .hud-album { font-size: .78rem; }
  .prompter { max-height: min(20vh, 100%); }
  .prompt-line { font-size: .88rem; line-height: 1.4; }
  .console { margin-bottom: 66px; padding-bottom: 10px; }
  .rack-item { width: 38px; }
}

@media (prefers-reduced-motion: reduce) {
  .dust { animation: none; }
  .arm { transition-duration: 1ms; }
}
</style>
