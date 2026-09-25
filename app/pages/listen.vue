<template>
  <div class="night-page" :style="pageStyle">
    <h1 class="sr-only">Listen to Havre De Grace free on digital vinyl</h1>

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
        <span class="hud-album">{{ onDeck?.title }}</span>
        <span class="hud-side">Side {{ deck.side.value.toUpperCase() }}</span>
      </div>
      <!-- Tabs, not independent toggles: the panel they open is one drawer.
           It covers this header while open, so the drawer's own close button
           is the way out; pressing the open tab closes it too. -->
      <div class="hud-right">
        <button
          v-for="tab in PANELS"
          :key="tab.id"
          type="button"
          class="hud-btn"
          :class="{ on: panel === tab.id }"
          :aria-pressed="panel === tab.id"
          @click="togglePanel(tab.id)"
        >{{ tab.label }}</button>
      </div>
    </header>

    <!-- ---------- the rack ---------- -->
    <nav class="rack" aria-label="Records">
      <button
        v-for="a in albums"
        :key="a.slug"
        type="button"
        class="rack-item"
        :class="{ on: onDeck?.slug === a.slug }"
        :aria-label="`Put on ${a.title}`"
        :aria-current="onDeck?.slug === a.slug"
        :title="a.title"
        @click="putOn(a)"
      >
        <img :src="a.coverImage" :alt="a.coverAlt">
        <span v-if="a.isFiller" class="rack-ph">ph</span>
      </button>
    </nav>

    <!-- ---------- the record ---------- -->
    <main class="deck-space">
      <div ref="frameEl" class="deck-frame">
        <div
          ref="discEl"
          class="disc"
          :class="{ live: deck.playing.value, flipping: deck.flipping.value, back: deck.flipTo.value === 'a' }"
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
              <span class="disc-hole" />
            </div>
          </div>

          <!-- Nothing plays until the visitor acts, so the deck says how — and
               while the arm is being dragged it says where it would land. -->
          <p v-if="scrubParking" class="drop-hint live">
            Let go to rest the arm
          </p>
          <p v-else-if="scrubCue" class="drop-hint live">
            {{ scrubCue.track?.title }} · {{ formatDuration(scrubCue.offset) }} in
          </p>
          <p v-else-if="!deck.playing.value" class="drop-hint">
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
        <button type="button" class="c-btn" :disabled="!deck.album.value" @click="deck.prev()">⏮</button>
        <button type="button" class="c-btn big" :disabled="!deck.album.value" @click="deck.toggle()">
          {{ deck.cueing.value ? '…' : deck.playing.value ? '❚❚' : '▶' }}
        </button>
        <button type="button" class="c-btn" :disabled="!deck.album.value" @click="deck.next()">⏭</button>
        <button type="button" class="c-btn" :disabled="!deck.hasOtherSide.value" @click="deck.flip()">Side {{ deck.otherSide.value.toUpperCase() }}</button>
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

    <!-- One drawer, two panels. Sharing the element rather than stacking two
         asides is what makes them identical by construction, and switching tabs
         swaps the contents in place instead of sliding the panel out and in. -->
    <transition name="slide">
      <aside v-if="panel" class="drawer" :aria-label="panel === 'lyrics' ? 'Lyrics' : 'Liner notes'">
        <button type="button" class="drawer-close" @click="panel = null">close ✕</button>

        <!-- Lyrics follow the record, not the clock: whatever is playing, whole.
             The content has no per-line timestamps, so there is nothing honest
             to highlight against. -->
        <template v-if="panel === 'lyrics'">
          <h2>{{ deck.track.value?.title ?? 'No track' }}</h2>
          <p v-if="deck.track.value" class="drawer-sub">
            Side {{ deck.side.value.toUpperCase() }}{{ deck.track.value.sideNumber }} · {{ deck.album.value?.title }}
          </p>
          <p v-for="(stanza, i) in stanzas" :key="i" class="stanza">
            <span v-for="(line, j) in stanza" :key="j">{{ line }}</span>
          </p>
          <p v-if="!stanzas.length" class="drawer-empty">
            {{ deck.track.value ? 'No words for this one.' : 'Drop the needle to see the words.' }}
          </p>
        </template>

        <template v-else>
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
        </template>
      </aside>
    </transition>

    <!-- The sleeve: every record on the shelf with its tracklist, as text. The
         rack is cover art and the tracks only surface once a record is playing,
         so without this the page would be server-rendered as images and
         controls — nothing for a screen reader to read out, and nothing for a
         search engine to index. Visually hidden rather than shown: the scene
         already presents all of this, just not as words. The links are kept out
         of the tab order so a sighted keyboard user never lands on something
         invisible; a screen reader still reaches them, and crawlers follow them
         to the album and song pages. -->
    <section class="sr-only" aria-labelledby="sleeve-title">
      <h2 id="sleeve-title">Albums on the record player</h2>
      <article v-for="a in albums" :key="a.slug">
        <h3>
          <NuxtLink :to="`/music/${a.slug}`" tabindex="-1">{{ a.title }}</NuxtLink> ({{ a.year }})
        </h3>
        <ol>
          <li v-for="t in a.tracks" :key="t.number">
            <NuxtLink v-if="t.songPath" :to="t.songPath" tabindex="-1">{{ t.title }}</NuxtLink>
            <template v-else>{{ t.title }}</template>
            · Side {{ t.side.toUpperCase() }} · {{ t.durationLabel }}
          </li>
        </ol>
      </article>
    </section>

    <!-- How to work the deck, shown on arrival. It stays up until the visitor
         takes it down — the button or a tap on the room behind it. -->
    <transition name="fade">
      <div v-if="introOpen" class="intro" @click.self="introOpen = false">
        <div class="intro-card" role="dialog" aria-modal="true" aria-label="How to use the record player">
          <ul>
            <li>Listen to all of my music, right here, for free.</li>
            <li>Move the needle to play the record.</li>
            <li>Switch albums in the bottom bar.</li>
          </ul>
          <button ref="introBtn" type="button" class="intro-go" @click="introOpen = false">Listen now</button>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import type { ListenAlbum } from '~/utils/listenAlbums'
import { buildListenAlbums, formatDuration, grooveBandGradient } from '~/utils/listenAlbums'
import { compact, schemaId, toolSchema } from '~/utils/schema'

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
 * The latest release is on the platter when the page opens, but nothing plays
 * until the visitor drops the needle or presses play. Choosing a record only
 * loads it onto the platter.
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

/*
 * The side panel. One drawer showing one of two things, so opening lyrics can't
 * bury the notes behind it — and the record stays uncovered by default, since
 * the panel now sits over the scene rather than beside it.
 */
const PANELS = [
  { id: 'lyrics', label: 'Lyrics' },
  { id: 'notes', label: 'Notes' },
] as const
type PanelId = typeof PANELS[number]['id']
const panel = ref<PanelId | null>(null)
function togglePanel(id: PanelId) { panel.value = panel.value === id ? null : id }

/*
 * The how-to card, open on every arrival. Rendered open on the server too, so
 * it is already there when the page paints rather than popping in after.
 */
const introOpen = ref(true)
const introBtn = ref<HTMLButtonElement | null>(null)
// Focused so Enter or Space dismisses it, without drawing a focus ring on a
// page that has only just loaded.
onMounted(() => introBtn.value?.focus({ focusVisible: false } as FocusOptions))

/*
 * There is always a record on the platter. The room is found with the latest
 * release already on the deck, needle up, so the first thing the visitor meets
 * is something to play rather than an empty turntable.
 *
 * An album page can send them to a different one — `/listen#<slug>` puts that
 * record on instead, so following "listen on digital vinyl" lands on the album
 * they were reading about. The needle still stays up: arriving is not the same
 * as pressing play. Loading has to wait for the client, since the deck reaches
 * for rAF and an audio element as soon as a record goes on. An unknown or
 * unlistenable slug falls back to the latest release.
 *
 * `?album=<slug>` does the same thing and is kept working indefinitely: it is
 * the form this page shipped with, so it is out there in whatever has already
 * been shared or linked. The hash is what gets written from here on — it reads
 * as a place rather than a parameter, and it survives being pasted into
 * somewhere that strips query strings.
 */
const route = useRoute()

function requestedSlug(): string | null {
  if (import.meta.client) {
    const fragment = window.location.hash.replace(/^#/, '')
    if (fragment) return decodeURIComponent(fragment)
  }
  return typeof route.query.album === 'string' ? route.query.album : null
}

/** Newest first (see buildListenAlbums), so the head of the list is the latest release. */
const latest = computed(() => albums.value[0] ?? null)

/*
 * What the scene shows as on the deck. Until the client mounts and loads the
 * real record, this is the one that is about to go on — so the server render
 * already carries its title and tint instead of flashing a default first.
 */
const onDeck = computed(() => deck.album.value ?? requestedAlbum() ?? latest.value)

function requestedAlbum(): ListenAlbum | null {
  const wanted = requestedSlug()
  return (wanted && albums.value.find(a => a.slug === wanted)) || null
}

function loadRequested() {
  const album = requestedAlbum()
  // Changing records mid-play is the visitor's call, not a link's — a hash that
  // names what is already on the platter must not restart it.
  if (album && deck.album.value?.slug !== album.slug) deck.load(album)
}

onMounted(() => {
  const first = requestedAlbum() ?? latest.value
  if (first) deck.load(first)
  window.addEventListener('hashchange', loadRequested)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', loadRequested)
})


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

const discLabel = computed(() => `Record grooves for side ${deck.side.value.toUpperCase()}. Click a groove to drop the needle there.`)

// --- arm readout ----------------------------------------------------------
// Solved against the giant disc's centre and groove radii. The pivot sits just
// off the disc (right: -6%) rather than far out, so the arm still fits beside
// the record on a phone instead of running off the screen. It hangs from the
// top corner, so the whole geometry is the mirror of a bottom pivot about the
// disc's horizontal centre line: the pivot's y and every angle are negated.
const ARM_PARK = -90
const ARM_OUTER = -70
const ARM_INNER = -47.6
/** Pivot as a fraction of the deck frame — matches `.arm`'s right/top in CSS. */
const ARM_PIVOT = { x: 1.06, y: 0.18 }

/**
 * How far back past the lead-in a release still counts as playing rather than
 * parking. A couple of degrees of slop, so brushing just off the record's edge
 * starts the side instead of sending the arm home.
 */
const PARK_RELEASE = -0.12

/*
 * The dock, the lead-in and the run-out all sit on one arc about the pivot, so
 * the angle is a single linear map over the whole of it — no branch at the
 * record's edge. That's what lets a drag cross from the rest post onto the
 * vinyl without the arm jumping. The clamp is the mechanical stop at each end:
 * `armProgress` reports -1 when parked, which lands just past the rest post.
 */
const armDeg = computed(() => {
  const deg = ARM_OUTER + deck.armProgress.value * (ARM_INNER - ARM_OUTER)
  return Math.min(ARM_INNER, Math.max(ARM_PARK, deg))
})

const armValueText = computed(() => `${deck.track.value?.title ?? 'off'}, ${formatDuration(deck.sidePosition.value)} into side ${deck.side.value.toUpperCase()}`)

/** Dragged back off the record: releasing here sends the arm to its rest. */
const scrubParking = computed(() => deck.scrubbing.value && deck.scrubProgress.value < PARK_RELEASE)

/** Where the needle would land if the arm were released now. */
const scrubCue = computed(() => (deck.scrubbing.value && !scrubParking.value
  ? deck.preview(deck.scrubProgress.value)
  : null))

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
  // Unclamped: grabbing a parked arm used to snap it straight to the lead-in.
  deck.beginScrub(p)
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
  // Let go off the record and the arm swings home on its own — `lift()` puts
  // armProgress back to -1 and the CSS transition on `.arm` carries it there.
  deck.endScrub(p !== null && p < PARK_RELEASE)
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
// `lyrics` is a flat line list where a blank string marks a verse break; the
// panel wants those breaks as real paragraphs.
const stanzas = computed(() => {
  const out: string[][] = []
  let current: string[] = []
  for (const line of deck.track.value?.lyrics ?? []) {
    if (line.trim() === '') {
      if (current.length) { out.push(current); current = [] }
    }
    else { current.push(line) }
  }
  if (current.length) out.push(current)
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
  '--accent': onDeck.value?.accent ?? '#c9a15e',
}))

// --- search ---------------------------------------------------------------
// Indexed. What it has to rank with is the sleeve above (the whole catalogue
// as text, linked through to every album and song page), the intro card, and
// the structured data below. The queries it is for are the ones only this page
// answers: listening to Havre De Grace free, in full, on a record player.
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()

const { canonicalUrl } = usePageSeo({
  title: 'Listen Free on Digital Vinyl | Havre De Grace',
  description: computed(() => (latest.value
    ? `Play every Havre De Grace album free on an online record player, starting with ${latest.value.title}. Drop the needle, flip to side B, read the lyrics as it plays.`
    : 'Play every Havre De Grace album free on an online record player. Drop the needle, flip to side B, read the lyrics as it plays.')),
  path: '/listen',
})

/*
 * The player is the page's main entity, described as a free web app. Each album on the shelf carries the same @id its
 * own page uses, so it is the one MusicAlbum entity rather than a second copy
 * — and what this page adds to it is a ListenAction: the album can be heard,
 * free, at /listen#<slug>.
 *
 * The albums sit inside an ItemList rather than as top-level graph nodes.
 * @unhead/schema-org keys top-level nodes by the fragment alone
 * (resolveAsGraphKey keeps everything from the last "#"), so two albums both
 * ending "#album" collapse into one. Nested nodes are left alone.
 */
useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': `${canonicalUrl.value}#tool` },
    about: albums.value.map((a) => ({ '@id': schemaId.album(toAbsoluteUrl(`/music/${a.slug}`)) })),
  }),
  toolSchema({
    tool: {
      name: 'Havre De Grace record player',
      summary: 'An online record player for every Havre De Grace album. Drop the needle anywhere on the side, flip the record, switch albums, and read the lyrics and liner notes as it plays. Free, no sign-up.',
    },
    canonicalUrl: canonicalUrl.value,
    siteUrl,
    category: 'MultimediaApplication',
  }),
  {
    '@type': 'ItemList',
    '@id': `${canonicalUrl.value}#shelf`,
    name: 'Albums on the record player',
    numberOfItems: albums.value.length,
    itemListElement: albums.value.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: compact({
        '@type': 'MusicAlbum',
        '@id': schemaId.album(toAbsoluteUrl(`/music/${a.slug}`)),
        name: a.title,
        url: toAbsoluteUrl(`/music/${a.slug}`),
        image: toAbsoluteUrl(a.coverImage),
        datePublished: a.releaseDate,
        byArtist: { '@id': schemaId.artist(siteUrl) },
        numTracks: a.tracks.length,
        potentialAction: {
          '@type': 'ListenAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${canonicalUrl.value}#${a.slug}`,
            actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
          },
          expectsAcceptanceOf: {
            '@type': 'Offer',
            category: 'free',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      }),
    })),
  },
])
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
  grid-template-rows: auto minmax(0, 1fr) auto auto;
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
/* The records sit in a strip along the bottom at every width. As a left-hand
   sidebar the rack stole horizontal space asymmetrically, which pushed the
   record — the one thing the page is about — off the centre axis. */
.rack {
  position: relative;
  z-index: 7;
  /* It comes before the deck in the markup (screen-reader order: choose a
     record, then play it) but sits in the last row, under the console. */
  grid-row: 4;
  display: flex;
  flex-direction: row;
  /* Centred, but `safe center` so a strip that outgrows the viewport falls
     back to start-aligned: plain `center` overflows in both directions and
     puts the leading records past the scroll origin, out of reach. The
     flex-start line is what an engine that doesn't parse `safe` keeps. */
  justify-content: flex-start;
  justify-content: safe center;
  gap: clamp(10px, 1.4vw, 16px);
  padding: 20px clamp(12px, 3vw, 28px);
  overflow-x: auto;
  scrollbar-width: none;
  /* Tinted by the record on the deck, as faintly as its playing groove is, so
     the bar reads as belonging to it — and changes with it. */
  background: color-mix(in srgb, var(--accent) 9%, rgba(255, 255, 255, .02));
  border-top: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  transition: background-color .5s ease, border-color .5s ease;
}
.rack::-webkit-scrollbar { display: none; }

.rack-item {
  position: relative;
  flex: none;
  width: clamp(72px, 7.5vw, 108px);
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
.rack-item:hover { filter: brightness(.9); transform: translateY(-4px); }
.rack-item.on { filter: none; box-shadow: 0 0 0 1px var(--accent), 0 0 14px color-mix(in srgb, var(--accent) 50%, transparent); }
.rack-item:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.rack-ph { position: absolute; top: 2px; right: 2px; padding: 0 3px; border-radius: 2px; background: #a4503f; font-size: .44rem; letter-spacing: .08em; text-transform: uppercase; }

/* ---------- deck ---------- */
.deck-space {
  position: relative;
  z-index: 5;
  display: grid;
  /* Just the record now that the lyrics have moved to the drawer. The single
     row is spelled out rather than left implicit: the disc sizes itself off
     `100%` of this row, which an auto row would make circular. */
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  place-items: center;
  padding: 0 clamp(12px, 4vw, 40px);
  min-height: 0;
}

.deck-frame { position: relative; width: auto; height: min(58vh, 82vw, calc(100% - 34px)); aspect-ratio: 1; }

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

/* Turning the record over. It tips away to edge-on, and the second half comes
   back from the far side rather than carrying on through 180deg — otherwise
   the new side would arrive mirrored. The swap in useVinylDeck is timed to
   that edge-on beat, so the grooves change while there's nothing to see.
   Duration matches FLIP_MS there; ease-in then ease-out across the jump reads
   as one continuous turn.

   Turning back to side A tips the opposite way, so the record un-flips the way
   it came instead of tumbling the same direction twice. Playing the one set of
   keyframes in reverse is exactly that mirror — and it carries the easing back
   with it. The direction comes from `flipTo` rather than `side`, which doesn't
   change until the midpoint: renaming the animation mid-flight would restart
   it. */
.disc.flipping { animation: disc-flip 700ms both; }
.disc.flipping.back { animation-direction: reverse; }

@keyframes disc-flip {
  0% { transform: perspective(1400px) rotateX(0deg); animation-timing-function: cubic-bezier(.5, 0, .9, .45); }
  50% { transform: perspective(1400px) rotateX(90deg); }
  50.001% { transform: perspective(1400px) rotateX(-90deg); animation-timing-function: cubic-bezier(.1, .55, .5, 1); }
  100% { transform: perspective(1400px) rotateX(0deg); }
}

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
.disc-hole { position: absolute; width: 6%; aspect-ratio: 1; border-radius: 50%; background: #060607; box-shadow: 0 0 0 2px rgba(0, 0, 0, .16); }

.drop-hint {
  position: absolute;
  left: 50%;
  bottom: -24px;
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
  top: 18%;
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
.arm-head { position: absolute; left: 0; top: 50%; width: 7%; height: 92%; transform: translateY(-50%) rotate(8deg); border-radius: 2px; background: linear-gradient(180deg, #4b5257, #1e2226); }
.arm-pivot { position: absolute; right: -4%; top: 50%; width: 9%; aspect-ratio: 1; transform: translateY(-50%); border-radius: 50%; background: radial-gradient(circle at 40% 36%, #cbd4d9, #23282d); box-shadow: 0 6px 14px rgba(0, 0, 0, .6); }

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

/* ---------- side drawer (lyrics / notes) ---------- */
.drawer {
  position: fixed;
  right: 0;
  /* Full-height: the panel runs the whole viewport and covers the header's
     Lyrics/Notes tabs. Its own close button is the way back out. */
  top: 0;
  bottom: 0;
  z-index: 40;
  width: min(92vw, 420px);
  padding: 18px 24px 90px;
  overflow-y: auto;
  background: rgba(9, 9, 11, .97);
  border-left: 1px solid rgba(255, 255, 255, .1);
  backdrop-filter: blur(10px);
}
.drawer-close { float: right; padding: 4px 10px; border: 1px solid rgba(255, 255, 255, .16); border-radius: 999px; background: none; color: #b9b2a8; font: inherit; font-size: .6rem; letter-spacing: .1em; cursor: pointer; }
.drawer h2 { font-size: 1.2rem; font-weight: 400; margin-bottom: 4px; }
.drawer h3 { margin: 18px 0 6px; font-size: .6rem; letter-spacing: .22em; text-transform: uppercase; color: var(--accent); }
.drawer p { font-size: .86rem; line-height: 1.75; color: #c3bcb2; margin-bottom: 9px; }
.drawer dl { display: grid; grid-template-columns: auto 1fr; gap: 3px 14px; font-size: .8rem; }
.drawer dt { color: #8d8579; }

.drawer-sub { font-size: .58rem !important; letter-spacing: .22em; text-transform: uppercase; color: #8d8579 !important; margin-bottom: 16px !important; }
.drawer-empty { color: #8d8579 !important; font-style: italic; }
/* A stanza is one paragraph; its lines break where the lyric breaks. */
.stanza { margin-bottom: 18px; }
.stanza span { display: block; }
.ph-flag { display: inline-block; padding: 1px 7px; border-radius: 3px; background: rgba(164, 80, 63, .28); color: #e08e7c !important; font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; }

.slide-enter-active, .slide-leave-active { transition: transform .35s cubic-bezier(.2, .9, .25, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

/* ---------- intro card ---------- */
.intro {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(3, 3, 4, .66);
  backdrop-filter: blur(4px);
}
.intro-card {
  width: min(100%, 380px);
  padding: 26px 26px 22px;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 14px;
  background: rgba(12, 12, 14, .97);
  box-shadow: 0 30px 80px rgba(0, 0, 0, .7);
  text-align: center;
}
.intro-card ul { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 8px; }
.intro-card li { font-size: .9rem; line-height: 1.5; color: #c3bcb2; text-wrap: balance; }
.intro-go {
  display: block;
  margin: 0 auto;
  padding: 6px 2px;
  border: 0;
  background: none;
  color: #e9e4dc;
  font: inherit;
  font-size: .8rem;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color .18s;
}
.intro-go:hover { color: var(--accent); }
.intro-go:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 3px; }

.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ---------- responsive ---------- */
/* The layout above is the phone layout, grown up. What's left here is only
   what a phone actually needs differently: a smaller record, no hover-only
   affordances, and a console that wraps. */
@media (max-width: 900px) {
  .deck-space { padding: 0 12px; }
  .deck-frame { height: min(46vh, 82vw, calc(100% - 34px)); }
  .rack { gap: 12px; padding: 16px 12px 18px; }
  .rack-item { width: 76px; }
  .console { flex-wrap: wrap; gap: 10px; padding: 12px 12px 14px; }
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
  .console { padding-bottom: 10px; }
  .rack { padding-top: 12px; padding-bottom: 12px; }
  .rack-item { width: 60px; }
}

@media (prefers-reduced-motion: reduce) {
  .dust { animation: none; }
  .arm { transition-duration: 1ms; }
  /* The side still swaps on the same beat; it just doesn't tumble to get there. */
  .disc.flipping { animation: none; }
}
</style>
