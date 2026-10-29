<!--
  /tools/lyric-timing: for checking the album screen's line timings by ear.

  Pick a song; it plays here on its own (the site's player stops on /tools).
  The line being sung is set large, as the screen would show it; the list
  below has every line's start and end, the least certain marked "check".
  Click a line to hear it from a second and a half before. Unlisted and
  noindexed like the rest of /tools. Delete once the timings are signed off.
-->

<template>
  <div class="review">
    <h1>Lyric timing</h1>
    <p class="hint">
      Every line of the album screen's lyrics, by ear. Lines marked <b>check</b> are the least certain;
      start with those. A line should appear as the first word is sung and finish writing as the last one ends.
      Times are in the song's score file in <code>app/config/</code>.
    </p>

    <div class="pick">
      <label v-for="(albumSongs, albumSlug) in SONGS" :key="albumSlug">
        <span>{{ albumSlug === 'into-the-wild' ? 'Into the Wild' : 'I Want to Be Yours' }}</span>
        <select :value="albumSlug === current.album ? current.song : ''" @change="choose(albumSlug, ($event.target as HTMLSelectElement).value)">
          <option value="" disabled>choose a song</option>
          <option v-for="s in albumSongs" :key="s.slug" :value="s.slug">{{ s.title }}{{ s.isNew ? ' (new)' : '' }}</option>
        </select>
      </label>
    </div>

    <audio ref="audio" :src="src" controls preload="metadata" class="audio" />

    <div class="now" :class="{ on: Boolean(nowLine) }">{{ nowLine?.text ?? ' ' }}</div>

    <ol class="lines">
      <li
        v-for="(line, i) in lines"
        :key="i"
        :class="{ on: nowIndex === i, check: line.check }"
        @click="hear(line)"
      >
        <span class="t">{{ fmt(line.start) }}–{{ fmt(line.end) }}</span>
        <span class="x">{{ line.text }}</span>
        <span v-if="line.check" class="c">check</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { loadAlbumLyrics, type TimedLine } from '~/config/albumLyrics'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Lyric timing',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const IWTBY = '/albums/i-want-to-be-yours-and-other-songs/music'
const ITW = '/albums/into-the-wild/music'

/** The ten timed for the screen are marked new; the other nine are the films' scores. */
const SONGS: Record<string, { slug: string, title: string, src: string, isNew?: boolean }[]> = {
  'i-want-to-be-yours-and-other-songs': [
    { slug: 'i-want-to-be-yours', title: 'I Want to Be Yours', src: `${IWTBY}/i-want-to-be-yours.mp3`, isNew: true },
    { slug: 'shades-of-blue-and-red', title: 'Shades of Blue and Red', src: `${IWTBY}/shades-of-blue-and-red.mp3`, isNew: true },
    { slug: 'sky-blue', title: 'Sky Blue', src: `${IWTBY}/sky-blue.mp3`, isNew: true },
    { slug: 'scarecrow', title: 'Scarecrow', src: `${IWTBY}/scarecrow.mp3`, isNew: true },
    { slug: 'jesus-creek', title: 'Jesus Creek', src: `${IWTBY}/jesus-creek.mp3`, isNew: true },
    { slug: 'demolition-woman-live', title: 'Demolition Woman - Live', src: `${IWTBY}/demolition-woman.mp3`, isNew: true },
    { slug: 'white-raven-live', title: 'White Raven - Live', src: `${IWTBY}/white-raven.mp3`, isNew: true },
    { slug: 'song-for-the-sick', title: 'Song for the Sick', src: `${IWTBY}/song-for-the-sick.mp3`, isNew: true },
    { slug: 'i-want-to-be-yours-demo-version', title: 'I Want to Be Yours - Demo Version', src: `${IWTBY}/i-want-to-be-yours-demo.mp3`, isNew: true },
  ],
  'into-the-wild': [
    { slug: 'ghost', title: 'Ghost', src: `${ITW}/ghost.mp3`, isNew: true },
    { slug: 'into-the-wild', title: 'Into the Wild', src: `${ITW}/into-the-wild.mp3` },
    { slug: 'conman', title: 'Conman', src: `${ITW}/conman.mp3` },
    { slug: 'goodbye-norma-jeane', title: 'Goodbye, Norma Jeane', src: `${ITW}/goodbye-norma-jeane.mp3` },
    { slug: 'ivory', title: 'Ivory', src: `${ITW}/ivory.mp3` },
    { slug: 'andalusia', title: 'Andalusia', src: `${ITW}/andalusia.mp3` },
    { slug: 'new-york', title: 'New York', src: `${ITW}/new-york.mp3` },
    { slug: 'meet-me-at-the-horizon', title: 'Meet Me at the Horizon', src: `${ITW}/meet-me-at-the-horizon.mp3` },
    { slug: 'rocks-in-the-sea', title: 'Rocks in the Sea', src: `${ITW}/rocks-in-the-sea-mix.mp3` },
    { slug: 'ship-to-stockholm', title: 'Ship to Stockholm', src: `${ITW}/ship-to-stockholm.mp3` },
  ],
}

const current = reactive({ album: 'i-want-to-be-yours-and-other-songs', song: 'i-want-to-be-yours' })
const audio = ref<HTMLAudioElement | null>(null)
const lyrics = ref<Record<string, Record<string, TimedLine[]>>>({})
const time = ref(0)

const src = computed(() => SONGS[current.album]?.find((s) => s.slug === current.song)?.src ?? '')
const lines = computed(() => lyrics.value[current.album]?.[current.song] ?? [])
const nowIndex = computed(() => {
  let found = -1
  lines.value.forEach((line, i) => {
    if (time.value >= line.start) found = i
  })
  if (found < 0) return -1
  const line = lines.value[found]!
  const next = lines.value[found + 1]?.start ?? Infinity
  return time.value < Math.min(next, line.end + 1.6) ? found : -1
})
const nowLine = computed(() => (nowIndex.value >= 0 ? lines.value[nowIndex.value] : null))

const fmt = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`

function choose(albumSlug: string, songSlug: string) {
  current.album = albumSlug
  current.song = songSlug
}

function hear(line: TimedLine) {
  const el = audio.value
  if (!el) return
  el.currentTime = Math.max(0, line.start - 1.5)
  el.play()
}

let raf = 0
onMounted(async () => {
  const [a, b] = await Promise.all([loadAlbumLyrics('i-want-to-be-yours-and-other-songs'), loadAlbumLyrics('into-the-wild')])
  lyrics.value = { 'i-want-to-be-yours-and-other-songs': a, 'into-the-wild': b }
  const loop = () => {
    time.value = audio.value?.currentTime ?? 0
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.review {
  max-width: 880px;
  margin: 0 auto;
  padding: 60px 24px 120px;
}

h1 {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: 44px;
}

.hint {
  margin-top: 12px;
  color: var(--theme-muted);
  font-size: 15px;
}

.hint b {
  color: #e6b36e;
  font-weight: 400;
}

.pick {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 32px;
}

.pick label {
  display: grid;
  gap: 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-muted);
}

.pick select {
  background: transparent;
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  padding: 8px 10px;
  font: inherit;
  text-transform: none;
  letter-spacing: 0;
  font-size: 15px;
}

.audio {
  width: 100%;
  margin-top: 28px;
}

.now {
  margin-top: 28px;
  min-height: 3.2em;
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 24px;
  border: 1px solid var(--theme-border);
  padding: 16px;
  opacity: 0.4;
}

.now.on {
  opacity: 1;
}

.lines {
  list-style: none;
  margin-top: 28px;
}

.lines li {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 16px;
  padding: 8px 6px;
  border-bottom: 1px solid var(--theme-border);
  cursor: pointer;
  font-size: 15px;
}

.lines li:hover {
  background: rgba(255, 255, 255, 0.04);
}

.lines li.on {
  background: rgba(159, 182, 204, 0.16);
}

.lines .t {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--theme-muted);
}

.lines .c {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #e6b36e;
}
</style>
