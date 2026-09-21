<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-10">
      <header>
        <NuxtLink to="/tools" class="nav-link text-sm muted-text hover:text-[var(--color-accent)]">
          ← tools
        </NuxtLink>
        <SectionHeading
          class="mt-4"
          title="demos"
          description="Everything in public/demos, grouped by the playlists in playlists.json. Space plays and pauses; ← and → step through the running order."
          heading-tag="h1"
        />
      </header>

      <!--
        Everything below the header is client-only. The manifest is fetched in
        the browser, so on the server there is nothing to render and no state to
        agree about — `pending` is false during a prerender that never runs the
        fetch and true on the client the moment it does, which is a hydration
        mismatch if the two are asked to match. A fallback plus a fresh client
        mount sidesteps it, and leaves the prerendered file a shell with no demo
        titles in it, which is what an unlisted page should be.
      -->
      <ClientOnly>
        <template #fallback>
          <p class="muted-text text-sm">
            Loading the shelf…
          </p>
        </template>

        <p v-if="pending" class="muted-text text-sm">
          Loading the shelf…
        </p>

        <p v-else-if="error" class="text-sm text-[var(--color-accent)]">
          Could not read /demos/playlists.json — check that it is there and that the JSON parses.
        </p>

        <template v-else-if="player.playlists.value.length">
          <!-- playlists -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(entry, index) in player.playlists.value"
              :key="entry.name"
              type="button"
              class="playlist-chip"
              :class="{ 'is-active': index === player.playlistIndex.value }"
              @click="player.selectPlaylist(index)"
            >
              {{ entry.name }}
              <span class="muted-text ml-1.5 text-[0.75em]">{{ entry.tracks.length }}</span>
            </button>
          </div>

          <!--
            The transport, the cache bar and the list share a wrapper, and that
            is load-bearing rather than tidiness: a sticky element is bounded by
            its parent, so this is what makes the pinned card ride up and out as
            the end of the list arrives. Without it the card's parent is the
            whole page and it stays pinned past the last row — which is exactly
            where the rows you cannot reach end up hiding.
          -->
          <div class="space-y-10">
            <!--
              Pinned only once the list is long enough to scroll past it. On a
              short shelf the card is taller than everything under it, so
              pinning it would cover the very rows it is meant to sit above.
            -->
            <div :class="pinTransport ? 'sticky top-[calc(var(--chrome-height)+0.75rem)] z-20' : ''">
              <DemoTransport :player="player" />
            </div>

            <DemoCacheBar :cache="cache" :files="allFiles" />

            <DemoTrackList :player="player" :cache="cache" />
          </div>

        </template>

        <div v-else class="surface-card p-6 text-sm leading-relaxed muted-text">
          <p>No playlists yet. To add some:</p>
          <ol class="mt-3 list-decimal space-y-1 pl-5">
            <li>Drop audio files into <code>public/demos/</code>.</li>
            <li>List them in <code>public/demos/playlists.json</code> under a playlist name.</li>
          </ol>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DemoLibrary } from '~/composables/useDemoPlayer'

/**
 * Client-only on purpose, twice over.
 *
 * The manifest is a plain file next to the audio rather than an import, so
 * adding a take is an edit to two things in the same folder and never a change
 * to a component. And fetching it in the browser keeps every demo title out of
 * the prerendered HTML, so the unlisted page is a shell until someone actually
 * loads it — which is the point of an unlisted page.
 */
const { data, pending, error } = useAsyncData<DemoLibrary>(
  'demo-playlists',
  () => $fetch<DemoLibrary>('/demos/playlists.json'),
  // `lazy` as well as `server: false`. Without it the fetch is awaited during
  // client setup, so the first client render already has the tracks while the
  // prerendered HTML is still showing the loading line — a hydration mismatch.
  // Lazy makes the first client render match the shell and patch in after.
  { server: false, lazy: true, default: () => ({ playlists: [] }) },
)

/**
 * The offline store. `resolveSrc` is the only wire between it and the player:
 * the player asks where a file's audio should come from, and gets a local blob
 * URL if the file is on this device or null if it is not.
 */
const cache = useDemoCache({
  // Forward-referencing `player`, which is declared just below. The callback
  // only ever fires from a user action or a background fetch, long after both
  // are constructed — this is the knot that has to be tied somewhere, since
  // each side needs one thing from the other.
  onEvict: (file) => player.forget(file),
})

const player = useDemoPlayer(data, {
  resolveSrc: (file) => cache.localUrl(file),
})

/**
 * Whether the transport pins to the top as you scroll. Below this many tracks
 * the whole shelf is on screen at once and pinning only gets in the way.
 */
const pinTransport = computed(() => player.orderedTracks.value.length > 6)

/** Every file the loaded playlists point at, deduplicated. */
const allFiles = computed(() => [
  ...new Set((data.value?.playlists ?? []).flatMap((list) => list.tracks.map((t) => t.file))),
])

/*
 * Work out what is already stored the moment the manifest lands, then — if the
 * toggle is on — fetch whatever is missing in the background. This is what
 * makes the *first* hit on the page pay for every hit after it.
 *
 * `prune` first, so a take that has been renamed or dropped from the JSON stops
 * occupying disk.
 */
watch(allFiles, async (files) => {
  if (!files.length || !cache.supported.value) {
    return
  }
  await cache.prune(files)
  await cache.prime(files)

  // Build the first track's element now rather than on the first click. Opening
  // the cache the first time costs a beat, and paying it here means the first
  // press of play is as instant as every one after it.
  player.cue(0)

  if (cache.autoCache.value) {
    void cache.downloadAll()
  }
}, { immediate: true })

// Turning the toggle on mid-visit should start the download, not wait for a
// reload.
watch(() => cache.autoCache.value, (enabled) => {
  if (enabled && cache.pendingFiles.value.length) {
    void cache.downloadAll()
  }
})

/**
 * Transport on the keyboard. Comparing takes is a two-hand job otherwise, and
 * the whole page exists to make that fast.
 */
const onKey = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) {
    return
  }
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return
  }

  switch (event.key) {
    case ' ':
      event.preventDefault()
      player.toggle()
      break
    case 'ArrowRight':
      event.preventDefault()
      player.next()
      break
    case 'ArrowLeft':
      event.preventDefault()
      player.previous()
      break
    default:
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

usePageSeo({
  title: 'Demos | Havre De Grace',
  description: 'Unlisted demo shelf.',
})
</script>

<style scoped>
.playlist-chip {
  padding: 0.45rem 0.95rem;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  font-size: 0.85rem;
  transition:
    border-color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard);
}

.playlist-chip:hover {
  border-color: var(--color-accent);
}

.playlist-chip.is-active {
  background: var(--color-accent);
  border-color: transparent;
  color: #fff;
}

.playlist-chip.is-active .muted-text {
  color: color-mix(in srgb, #fff 75%, transparent);
}
</style>
