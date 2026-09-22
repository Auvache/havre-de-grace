<!--
  Royalty Registration Checklist.

  A per-song tracker for the registrations in
  content/resources/royalty-checklist.yml. Every item, its description and
  its link come from that file; this component supplies the arithmetic, the
  storage and the layout, and knows nothing about royalties.

  Three things it deliberately does NOT do: talk to a server, know who you are,
  or send a single keystroke anywhere. Everything lives in this browser's
  localStorage, which is also why export exists — it is the only backup there is.
-->

<template>
  <div class="space-y-14">
    <!-- --- One-time setup --------------------------------------------- -->
    <section aria-labelledby="rs-setup-heading" class="space-y-5">
      <header class="space-y-2">
        <h2 id="rs-setup-heading" class="rs-heading">Set up once</h2>
        <p class="max-w-2xl text-sm leading-relaxed muted-text">
          Account-level steps. You do these once, and then every release you
          ever put out runs through them.
        </p>
      </header>

      <ul class="space-y-3">
        <li
          v-for="item in data.setup"
          :key="item.id"
          class="surface-card rs-print-block p-4 sm:p-5"
        >
          <div class="flex items-start gap-3">
            <input
              :id="`setup-${item.id}`"
              type="checkbox"
              class="rs-check"
              :checked="state.setup[item.id] === 'done'"
              :disabled="state.setup[item.id] === 'na'"
              @change="setSetup(item.id, ($event.target as HTMLInputElement).checked ? 'done' : 'todo')"
            >
            <div class="min-w-0 flex-1 space-y-2">
              <label :for="`setup-${item.id}`" class="rs-item-label">
                {{ item.label }}
              </label>

              <p class="text-sm leading-relaxed muted-text">
                <span class="rs-tag">Collects</span>
                {{ item.collects }}
              </p>
              <p class="text-sm leading-relaxed muted-text">
                <span class="rs-tag">Who needs this</span>
                {{ item.whoNeedsThis }}
              </p>
              <p v-if="item.note" class="text-sm leading-relaxed muted-text">
                <span class="rs-tag">Note</span>
                {{ item.note }}
              </p>

              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                <a
                  v-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener"
                  class="rs-external"
                >
                  {{ item.urlLabel || 'Open' }} ↗
                </a>
                <button
                  type="button"
                  class="rs-na rs-no-print"
                  :aria-pressed="state.setup[item.id] === 'na'"
                  @click="toggleSetupNa(item.id)"
                >
                  Not applicable to me
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- --- Songs ------------------------------------------------------- -->
    <section aria-labelledby="rs-songs-heading" class="space-y-6">
      <header class="space-y-2">
        <h2 id="rs-songs-heading" class="rs-heading">Your songs</h2>
        <p class="max-w-2xl text-sm leading-relaxed muted-text">
          Add a song or a release and work down the same list for each one. Add
          one now rather than all of them — the point is to see the shape of the
          gap, not to finish tonight.
        </p>
      </header>

      <form class="surface-card rs-no-print space-y-4 p-5" @submit.prevent="addSong">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="rs-new-title" class="rs-field-label">Song or release title</label>
            <input
              id="rs-new-title"
              v-model="draft.title"
              type="text"
              required
              autocomplete="off"
              class="rs-input"
              placeholder="Scarecrow"
            >
          </div>
          <div>
            <label for="rs-new-date" class="rs-field-label">Release date <span class="muted-text">(optional)</span></label>
            <input id="rs-new-date" v-model="draft.releaseDate" type="date" class="rs-input">
          </div>
          <div>
            <label for="rs-new-isrc" class="rs-field-label">ISRC <span class="muted-text">(optional)</span></label>
            <input
              id="rs-new-isrc"
              v-model="draft.isrc"
              type="text"
              autocomplete="off"
              class="rs-input"
              placeholder="USABC2500001"
            >
          </div>
          <div>
            <label for="rs-new-iswc" class="rs-field-label">ISWC <span class="muted-text">(optional)</span></label>
            <input
              id="rs-new-iswc"
              v-model="draft.iswc"
              type="text"
              autocomplete="off"
              class="rs-input"
              placeholder="T-123.456.789-0"
            >
          </div>
        </div>

        <button type="submit" class="rs-button-primary cta-solo">
          Add song
        </button>
      </form>

      <!-- Overview: songs down, registrations across -->
      <div v-if="songs.length" class="rs-table-wrap rs-print-block">
        <table class="rs-table">
          <caption class="sr-only">
            Registration status for each song. Each cell is either done, not
            applicable, or outstanding.
          </caption>
          <thead>
            <tr>
              <th scope="col" class="rs-table__song">Song</th>
              <th v-for="item in data.items" :key="item.id" scope="col">
                {{ item.short }}
              </th>
              <th scope="col">Done</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in songs" :key="song.id">
              <th scope="row" class="rs-table__song">
                <a :href="`#song-${song.id}`" class="rs-table__link">{{ song.title }}</a>
              </th>
              <td
                v-for="item in data.items"
                :key="item.id"
                :class="`rs-cell rs-cell--${cellState(song, item.id)}`"
              >
                <span class="sr-only">{{ cellLabel(song, item.id) }}</span>
                <span aria-hidden="true">{{ cellGlyph(cellState(song, item.id)) }}</span>
              </td>
              <td class="rs-cell rs-cell--pct">{{ completion(song) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else class="text-sm muted-text">
        No songs yet. Add one above and the checklist appears.
      </p>

      <!-- Per-song detail -->
      <div
        v-for="song in songs"
        :id="`song-${song.id}`"
        :key="song.id"
        class="surface-card rs-print-block space-y-5 p-5 sm:p-6"
      >
        <header class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="rs-song-title">{{ song.title }}</h3>
            <p class="mt-1 text-sm muted-text">
              <span v-if="song.releaseDate">Released {{ song.releaseDate }}</span>
              <span v-if="song.releaseDate && (song.isrc || song.iswc)"> · </span>
              <span v-if="song.isrc">ISRC {{ song.isrc }}</span>
              <span v-if="song.isrc && song.iswc"> · </span>
              <span v-if="song.iswc">ISWC {{ song.iswc }}</span>
            </p>
          </div>

          <div class="flex items-center gap-4">
            <p class="rs-song-pct">{{ completion(song) }}%</p>
            <button type="button" class="rs-remove rs-no-print" @click="removeSong(song.id)">
              Remove
            </button>
          </div>
        </header>

        <ul class="space-y-4 border-t border-theme pt-5">
          <li v-for="item in data.items" :key="item.id" class="space-y-2">
            <div class="flex items-start gap-3">
              <input
                :id="`${song.id}-${item.id}`"
                type="checkbox"
                class="rs-check"
                :checked="cellState(song, item.id) === 'done'"
                :disabled="cellState(song, item.id) === 'na'"
                @change="setItem(song.id, item.id, ($event.target as HTMLInputElement).checked ? 'done' : 'todo')"
              >
              <div class="min-w-0 flex-1 space-y-2">
                <label :for="`${song.id}-${item.id}`" class="rs-item-label">
                  {{ item.label }}
                  <span v-if="item.optional" class="rs-optional">optional</span>
                </label>

                <p class="text-sm leading-relaxed muted-text">
                  <span class="rs-tag">Collects</span>
                  {{ item.collects }}
                </p>
                <p class="text-sm leading-relaxed muted-text">
                  <span class="rs-tag">Who needs this</span>
                  {{ item.whoNeedsThis }}
                </p>
                <p v-if="item.caution" class="rs-caution">
                  {{ item.caution }}
                </p>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a
                    v-if="item.url"
                    :href="item.url"
                    target="_blank"
                    rel="noopener"
                    class="rs-external"
                  >
                    {{ item.urlLabel || 'Open' }} ↗
                  </a>
                  <button
                    type="button"
                    class="rs-na rs-no-print"
                    :aria-pressed="cellState(song, item.id) === 'na'"
                    @click="toggleNa(song.id, item.id)"
                  >
                    N/A
                  </button>
                </div>

                <label :for="`note-${song.id}-${item.id}`" class="sr-only">
                  Notes on {{ item.label }} for {{ song.title }}
                </label>
                <input
                  :id="`note-${song.id}-${item.id}`"
                  type="text"
                  class="rs-input rs-input--note"
                  placeholder="Notes — confirmation number, date filed, who to chase"
                  :value="song.items[item.id]?.note ?? ''"
                  @input="setNote(song.id, item.id, ($event.target as HTMLInputElement).value)"
                >
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- --- Toolbar ----------------------------------------------------- -->
    <section aria-labelledby="rs-tools-heading" class="rs-no-print space-y-4 border-t border-theme pt-8">
      <h2 id="rs-tools-heading" class="label-text">Your data</h2>

      <p class="max-w-2xl text-sm leading-relaxed muted-text">
        <template v-if="persistent">
          This is saved in this browser and nowhere else. Nothing you type here
          is sent anywhere — there is no account and no server to send it to. If
          you clear your site data or move to another machine, export first.
        </template>
        <template v-else>
          Your browser is not allowing local storage, so nothing on this page
          will survive a reload. It still works for this session — export before
          you close the tab.
        </template>
      </p>

      <div class="flex flex-wrap gap-3">
        <button type="button" class="rs-button" @click="exportJson">Export JSON</button>

        <label class="rs-button rs-button--file">
          Import JSON
          <input type="file" accept="application/json,.json" class="sr-only" @change="importJson">
        </label>

        <button type="button" class="rs-button" @click="print">Print</button>

        <button v-if="!confirmingReset" type="button" class="rs-button rs-button--danger" @click="confirmingReset = true">
          Reset everything
        </button>
        <template v-else>
          <button type="button" class="rs-button rs-button--danger" @click="doReset">
            Yes, erase it all
          </button>
          <button type="button" class="rs-button" @click="confirmingReset = false">
            Cancel
          </button>
        </template>
      </div>

      <p v-if="message" class="text-sm" :class="messageIsError ? 'rs-message--error' : 'muted-text'" role="status">
        {{ message }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { downloadJson, useToolStorage } from '~/composables/useToolStorage'

type ItemState = 'todo' | 'done' | 'na'

interface ChecklistItem {
  id: string
  label: string
  collects: string
  whoNeedsThis: string
  short: string
  optional: boolean
  url?: string
  urlLabel?: string
  caution?: string
}

interface SetupItem {
  id: string
  label: string
  collects: string
  whoNeedsThis: string
  url?: string
  urlLabel?: string
  note?: string
}

interface SongRecord {
  id: string
  title: string
  releaseDate?: string
  isrc?: string
  iswc?: string
  items: Record<string, { state: ItemState, note?: string }>
}

interface ChecklistState {
  /*
   * Bumped only for a change the reviver below cannot absorb. Everything is
   * keyed by the ids in the YAML, so adding or removing a checklist item is
   * not a breaking change — a song simply has no entry for an id it has never
   * seen, which reads as "to do".
   */
  version: 1
  setup: Record<string, ItemState>
  songs: SongRecord[]
}

const props = defineProps<{
  data: {
    setup: SetupItem[]
    items: ChecklistItem[]
  }
}>()

const emptyState = (): ChecklistState => ({ version: 1, setup: {}, songs: [] })

const isState = (value: unknown): value is ItemState =>
  value === 'todo' || value === 'done' || value === 'na'

/**
 * Accepts anything that looks close enough and repairs the rest. This runs on
 * stored data AND on an imported file, so it is the only validation boundary
 * either path has — an import is a stranger's JSON and is treated like one.
 */
const revive = (parsed: unknown): ChecklistState | null => {
  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  const raw = parsed as Partial<ChecklistState>
  const setup: Record<string, ItemState> = {}

  for (const [key, value] of Object.entries(raw.setup ?? {})) {
    if (isState(value)) {
      setup[key] = value
    }
  }

  const songs: SongRecord[] = (Array.isArray(raw.songs) ? raw.songs : [])
    .filter((song): song is SongRecord => Boolean(song) && typeof song === 'object' && typeof song.title === 'string')
    .map((song) => {
      const items: SongRecord['items'] = {}

      for (const [key, value] of Object.entries(song.items ?? {})) {
        if (value && typeof value === 'object' && isState(value.state)) {
          items[key] = {
            state: value.state,
            note: typeof value.note === 'string' ? value.note.slice(0, 500) : undefined,
          }
        }
      }

      return {
        id: typeof song.id === 'string' && song.id ? song.id : newId(),
        title: song.title.slice(0, 200),
        releaseDate: typeof song.releaseDate === 'string' ? song.releaseDate : undefined,
        isrc: typeof song.isrc === 'string' ? song.isrc : undefined,
        iswc: typeof song.iswc === 'string' ? song.iswc : undefined,
        items,
      }
    })

  return { version: 1, setup, songs }
}

let idCounter = 0
const newId = () => {
  idCounter += 1
  return `s${Date.now().toString(36)}${idCounter.toString(36)}`
}

const { state, persistent, reset } = useToolStorage<ChecklistState>(
  'royalty-checklist',
  emptyState,
  revive,
)

const songs = computed(() => state.value.songs)

const draft = reactive({
  title: '',
  releaseDate: '',
  isrc: '',
  iswc: '',
})

const confirmingReset = ref(false)
const message = ref('')
const messageIsError = ref(false)

const say = (text: string, isError = false) => {
  message.value = text
  messageIsError.value = isError
}

const addSong = () => {
  const title = draft.title.trim()
  if (!title) {
    return
  }

  state.value.songs.push({
    id: newId(),
    title,
    releaseDate: draft.releaseDate || undefined,
    isrc: draft.isrc.trim() || undefined,
    iswc: draft.iswc.trim() || undefined,
    items: {},
  })

  draft.title = ''
  draft.releaseDate = ''
  draft.isrc = ''
  draft.iswc = ''
  say(`Added “${title}”.`)
}

const removeSong = (id: string) => {
  const song = state.value.songs.find((item) => item.id === id)
  state.value.songs = state.value.songs.filter((item) => item.id !== id)
  if (song) {
    say(`Removed “${song.title}”.`)
  }
}

const cellState = (song: SongRecord, itemId: string): ItemState =>
  song.items[itemId]?.state ?? 'todo'

const setItem = (songId: string, itemId: string, next: ItemState) => {
  const song = state.value.songs.find((item) => item.id === songId)
  if (!song) {
    return
  }
  const existing = song.items[itemId]
  song.items[itemId] = { state: next, note: existing?.note }
}

const toggleNa = (songId: string, itemId: string) => {
  const song = state.value.songs.find((item) => item.id === songId)
  if (!song) {
    return
  }
  setItem(songId, itemId, cellState(song, itemId) === 'na' ? 'todo' : 'na')
}

const setNote = (songId: string, itemId: string, note: string) => {
  const song = state.value.songs.find((item) => item.id === songId)
  if (!song) {
    return
  }
  const existing = song.items[itemId]
  song.items[itemId] = { state: existing?.state ?? 'todo', note }
}

const setSetup = (itemId: string, next: ItemState) => {
  state.value.setup[itemId] = next
}

const toggleSetupNa = (itemId: string) => {
  setSetup(itemId, state.value.setup[itemId] === 'na' ? 'todo' : 'na')
}

/*
 * Completion ignores two kinds of item: anything marked N/A, and an optional
 * item nobody has touched. Both would otherwise make 100% unreachable for an
 * artist who correctly has no use for Content ID, and a progress bar that can
 * never fill is a progress bar people stop reading.
 */
const completion = (song: SongRecord) => {
  const counted = props.data.items.filter((item) => {
    const itemState = cellState(song, item.id)
    if (itemState === 'na') {
      return false
    }
    return !item.optional || itemState === 'done'
  })

  if (!counted.length) {
    return 100
  }

  const done = counted.filter((item) => cellState(song, item.id) === 'done').length
  return Math.round((done / counted.length) * 100)
}

const cellGlyph = (value: ItemState) => (value === 'done' ? '✓' : value === 'na' ? '–' : '')

const cellLabel = (song: SongRecord, itemId: string) => {
  const value = cellState(song, itemId)
  return value === 'done' ? 'Done' : value === 'na' ? 'Not applicable' : 'Outstanding'
}

const exportJson = () => {
  const stamp = new Date().toISOString().slice(0, 10)
  downloadJson(`royalty-checklist-${stamp}.json`, state.value)
  say('Exported. Keep it somewhere that is not this laptop.')
}

const importJson = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  try {
    const revived = revive(JSON.parse(await file.text()))
    if (!revived) {
      say('That file did not look like a checklist export.', true)
      return
    }
    state.value = revived
    say(`Imported ${revived.songs.length} song${revived.songs.length === 1 ? '' : 's'}, replacing what was here.`)
  }
  catch {
    say('That file could not be read as JSON.', true)
  }
  finally {
    // Let the same file be chosen again after a failure.
    input.value = ''
  }
}

const print = () => {
  if (import.meta.client) {
    window.print()
  }
}

const doReset = () => {
  reset()
  confirmingReset.value = false
  say('Cleared.')
}
</script>

<style scoped>
.rs-heading {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
}

.rs-item-label {
  display: block;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
}

.rs-optional {
  margin-left: 0.5rem;
  font-size: var(--font-size-label);
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--theme-muted);
}

.rs-tag {
  display: inline-block;
  margin-right: 0.45rem;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-accent) 80%, var(--theme-muted));
}

.rs-caution {
  border-left: 2px solid color-mix(in srgb, var(--color-accent) 55%, transparent);
  padding-left: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--theme-muted);
}

.rs-check {
  margin-top: 0.3rem;
  height: 1.15rem;
  width: 1.15rem;
  flex-shrink: 0;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.rs-check:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.rs-external {
  font-size: 0.875rem;
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.rs-na {
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  padding: 0.15rem 0.7rem;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--theme-muted);
}

.rs-na[aria-pressed="true"] {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  color: var(--theme-text);
}

.rs-field-label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.rs-input {
  width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-sm);
  background: var(--theme-bg);
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  color: inherit;
}

.rs-input::placeholder {
  color: var(--theme-muted);
}

.rs-input--note {
  font-size: 0.875rem;
}

.rs-button,
.rs-button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--theme-border);
  padding: 0.55rem 1.2rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.rs-button:hover {
  border-color: var(--color-accent);
}

.rs-button--danger:hover {
  border-color: #c2553f;
  color: #c2553f;
}

.rs-button--file {
  cursor: pointer;
}

.rs-button-primary {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: #fff;
}

.rs-button-primary:hover {
  opacity: 0.9;
}

.rs-remove {
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--theme-muted);
}

.rs-remove:hover {
  color: #c2553f;
}

.rs-song-title {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  line-height: 1.2;
}

.rs-song-pct {
  font-size: var(--font-size-subheading);
  font-weight: 350;
  color: var(--color-accent);
}

.rs-message--error {
  color: #c2553f;
}

/* The overview grid. It scrolls sideways on a phone rather than reflowing —
   a matrix that stacks is not a matrix any more, and the row headings stay
   pinned so a scrolled column still has a song attached to it. */
.rs-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-md);
}

.rs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.rs-table th,
.rs-table td {
  padding: 0.6rem 0.75rem;
  text-align: center;
  white-space: nowrap;
  border-bottom: 1px solid var(--theme-border);
}

.rs-table thead th {
  font-size: var(--font-size-label);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--theme-muted);
}

.rs-table tbody tr:last-child th,
.rs-table tbody tr:last-child td {
  border-bottom: 0;
}

.rs-table__song {
  position: sticky;
  left: 0;
  z-index: 1;
  text-align: left;
  background: var(--theme-surface);
  font-weight: 450;
}

.rs-table__link:hover {
  color: var(--color-accent);
}

.rs-cell--done {
  color: var(--color-accent);
  font-weight: 500;
}

.rs-cell--na {
  color: var(--theme-muted);
}

.rs-cell--todo::after {
  content: "·";
  color: var(--theme-muted);
}

.rs-cell--pct {
  font-variant-numeric: tabular-nums;
  color: var(--theme-muted);
}
</style>
