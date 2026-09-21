<template>
  <Teleport to="body">
    <Transition name="scrim">
      <div
        v-if="open"
        class="song-scrim"
        @click.self="emit('close')"
      />
    </Transition>

    <Transition name="song-slide">
      <!--
        The id lives here rather than being passed in from the page. This
        component's root is a Teleport, so an `id` set on the tag renders
        nowhere and the opening button's `aria-controls` would point at an
        element that does not exist.
      -->
      <aside
        v-if="open"
        id="song-details-panel"
        ref="panelRef"
        class="song-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="track ? `${track.title} — lyrics and notes` : 'Lyrics and notes'"
      >
        <header class="song-panel-head">
          <div class="song-panel-titles">
            <p v-if="track" class="song-panel-kicker">
              Track {{ track.number }} · Side {{ track.side.toUpperCase() }}
            </p>
            <h2>{{ track?.title ?? albumTitle }}</h2>
          </div>

          <button
            ref="closeButtonRef"
            type="button"
            class="song-panel-close"
            aria-label="Close lyrics and notes"
            @click="emit('close')"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <div class="song-panel-body">
          <!-- Nothing cued yet: the panel says so rather than showing an empty
               frame, and the album's own notes are still worth reading. -->
          <p v-if="!track" class="song-panel-empty">
            Play a song to read along — its words and notes appear here.
          </p>

          <template v-else>
            <section v-if="stanzas.length">
              <h3>Lyrics</h3>
              <p v-for="(stanza, i) in stanzas" :key="i" class="song-stanza">
                <span v-for="(line, j) in stanza" :key="j">{{ line }}</span>
              </p>
            </section>
            <p v-else class="song-panel-empty">
              No words for this one.
            </p>

            <section v-if="track.writingStory">
              <h3>Writing it</h3>
              <p>{{ track.writingStory }}</p>
            </section>

            <section v-if="track.recordingDetails">
              <h3>Recording it</h3>
              <p>{{ track.recordingDetails }}</p>
            </section>

            <!-- Stays with the song material it belongs to. A track that lists
                 its own players suppresses the album-wide list below rather
                 than printing both. -->
            <section v-if="track.credits.length">
              <h3>Credits</h3>
              <dl>
                <template v-for="credit in track.credits" :key="`${credit.role}-${credit.name}`">
                  <dt>{{ credit.role }}</dt>
                  <dd>{{ credit.name }}</dd>
                </template>
              </dl>
            </section>
          </template>

          <!--
            Album-level material, after everything that changes with the track.
            It is also what gives the panel something to say before anything is
            cued, which is the state it opens in on a cold page.
          -->
          <section v-if="linerParagraphs.length">
            <h3>About the album</h3>
            <p v-for="(para, i) in linerParagraphs" :key="i">{{ para }}</p>
          </section>

          <section v-if="showAlbumCredits">
            <h3>Album credits</h3>
            <dl>
              <template v-for="credit in albumCredits" :key="`${credit.role}-${credit.name}`">
                <dt>{{ credit.role }}</dt>
                <dd>{{ credit.name }}</dd>
              </template>
            </dl>
          </section>

          <div v-if="track" class="song-panel-actions">
            <TrackShareLink
              class="song-panel-action"
              :url="shareUrl"
              :title="track.title"
              label="Copy link to this song"
            />
            <NuxtLink
              :to="`/music/${albumSlug}/${track.slug}`"
              class="song-panel-action"
            >
              About this song
            </NuxtLink>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/*
 * The lyrics-and-notes panel on an album page.
 *
 * It follows the record player's drawer rather than a centred dialog: the album
 * page is something you are listening to, and a panel that slides in from the
 * edge leaves the artwork and the transport where they were. The scrim behind
 * it is what makes it a modal — on /listen the drawer sits in a locked scene
 * with nowhere else to scroll, whereas this page is a long document that would
 * otherwise keep scrolling underneath the open panel.
 *
 * Keyboard and focus behaviour is deliberately the same contract as
 * SingleModal: Escape closes, Tab is trapped, focus starts on the close button
 * and returns to whatever opened it.
 */
import type { Credit } from '~~/shared/types'
import type { PlayerTrack } from '~/composables/useAlbumPlayer'

const props = defineProps<{
  open: boolean
  track: PlayerTrack | null
  albumTitle: string
  albumSlug: string
  albumCredits: Credit[]
  /** The album's liner notes, if it has any written. */
  albumLinerNotes?: string
  /** Absolute, shareable URL for the current track. */
  shareUrl: string
}>()

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previousActiveElement = ref<HTMLElement | null>(null)

/** Blank lines in the content file are stanza breaks; everything else is a line. */
const stanzas = computed<string[][]>(() => {
  const lyrics = props.track?.lyrics
  if (!lyrics) return []
  return lyrics
    .split(/\n\s*\n/)
    .map(block => block.split('\n').map(line => line.trim()).filter(Boolean))
    .filter(stanza => stanza.length > 0)
})

/*
 * The album-wide list, shown only when the song has not supplied its own.
 * Printing both would restate the same two people in slightly different words
 * one section apart.
 */
const showAlbumCredits = computed(() =>
  props.albumCredits.length > 0 && !props.track?.credits.length,
)

/** Liner notes are prose with blank lines between paragraphs. */
const linerParagraphs = computed<string[]>(() =>
  (props.albumLinerNotes ?? '')
    .split(/\n\s*\n/)
    .map(para => para.trim().replace(/\s*\n\s*/g, ' '))
    .filter(Boolean),
)

const trapFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !panelRef.value) return

  const focusables = panelRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  const ordered = [...focusables].filter(element => element.offsetParent !== null)

  if (!ordered.length) {
    event.preventDefault()
    return
  }

  const first = ordered[0]!
  const last = ordered[ordered.length - 1]!

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.open) return

  if (event.key === 'Escape') {
    emit('close')
    return
  }

  trapFocus(event)
}

if (import.meta.client) {
  watch(() => props.open, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''

    if (open) {
      previousActiveElement.value = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
      nextTick(() => closeButtonRef.value?.focus())
    }
    else {
      previousActiveElement.value?.focus()
    }
  })

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
  })
}
</script>

<style scoped>
.song-scrim {
  position: fixed;
  inset: 0;
  z-index: 79;
  background: rgba(3, 6, 10, 0.62);
}

@supports (backdrop-filter: blur(1px)) {
  .song-scrim {
    backdrop-filter: blur(3px);
  }
}

.song-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 80;
  display: flex;
  width: min(94vw, 27rem);
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(9, 12, 17, 0.97);
  color: #fff;
}

@supports (backdrop-filter: blur(1px)) {
  .song-panel {
    backdrop-filter: blur(12px);
  }
}

.song-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.4rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.song-panel-kicker {
  color: var(--color-accent);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.song-panel-head h2 {
  margin-top: 0.3rem;
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.2;
}

.song-panel-close {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  font-size: 1.4rem;
  line-height: 1;
  transition: border-color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard);
}

.song-panel-close:hover {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.song-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.4rem 1.4rem 3rem;
  overscroll-behavior: contain;
}

.song-panel-body section + section {
  margin-top: 1.8rem;
}

.song-panel-body h3 {
  margin-bottom: 0.7rem;
  color: var(--color-accent);
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.song-panel-body p {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.87rem;
  line-height: 1.8;
}

/* Prose sections run to several paragraphs — the liner notes especially — and
   without this they set as one unbroken block. Stanzas carry their own spacing
   (below), so this is a top margin rather than a bottom one. */
.song-panel-body p + p {
  margin-top: 0.9rem;
}

.song-stanza,
.song-stanza + .song-stanza {
  margin-top: 0;
  margin-bottom: 1.1rem;
}

/* A stanza is one paragraph; its lines break where the lyric breaks. */
.song-stanza span {
  display: block;
  padding-left: 1.1rem;
  text-indent: -1.1rem;
}

.song-panel-empty {
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic;
}

.song-panel-body dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
  font-size: 0.82rem;
}

.song-panel-body dt {
  color: rgba(255, 255, 255, 0.45);
}

.song-panel-body dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

.song-panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 2.2rem;
  padding-top: 1.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.song-panel-action {
  --share-color: rgba(255, 255, 255, 0.6);
  --share-color-hover: var(--color-accent);
  --share-border: rgba(255, 255, 255, 0.16);
  --share-border-hover: var(--color-accent);
  --share-padding: 0.35rem 0.85rem;
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard);
}

.song-panel-action:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

/* --- transitions --- */

.song-slide-enter-active,
.song-slide-leave-active {
  transition: transform 350ms cubic-bezier(0.2, 0.9, 0.25, 1);
}

.song-slide-enter-from,
.song-slide-leave-to {
  transform: translateX(100%);
}

.scrim-enter-active,
.scrim-leave-active {
  transition: opacity var(--dur-medium) var(--ease-standard);
}

.scrim-enter-from,
.scrim-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .song-slide-enter-active,
  .song-slide-leave-active {
    transition-duration: 1ms;
  }

  .song-slide-enter-from,
  .song-slide-leave-to {
    transform: none;
  }
}
</style>
