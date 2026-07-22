<template>
  <ul v-if="entries.length" ref="listEl" :class="listClass">
    <template v-for="(entry, index) in entries" :key="entry.platform">
      <li
        v-if="breakBeforeIndices.has(index)"
        aria-hidden="true"
        class="h-0 basis-full list-none"
      />
      <li data-icon class="list-none">
        <a
          :href="entry.url"
          target="_blank"
          rel="noopener noreferrer"
          :title="entry.label"
          :aria-label="entry.label"
          class="inline-flex items-center justify-center rounded-[var(--radius-sm)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          :class="linkClass"
        >
          <img
            v-if="entry.iconSrc"
            :src="entry.iconSrc"
            alt=""
            :class="iconClass"
            loading="lazy"
            decoding="async"
          >
          <span
            v-else
            class="inline-flex rounded-full border border-theme px-3 py-1.5 text-xs tracking-wide muted-text"
          >
            {{ entry.label }}
          </span>
        </a>
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
import type { StreamingLinks } from '~~/shared/types'
import amazonMusicIcon from '~~/assets/images/amazon-music.png'
import appleMusicIcon from '~~/assets/images/apple-music.png'
import bandcampIcon from '~~/assets/images/bandcamp.png'
import bandsintownIcon from '~~/assets/images/bandsintown.png'
import instagramIcon from '~~/assets/images/instagram.png'
import soundcloudIcon from '~~/assets/images/soundcloud.png'
import spotifyIcon from '~~/assets/images/spotify.png'
import youtubeIcon from '~~/assets/images/youtube.png'
import youtubeMusicIcon from '~~/assets/images/youtube-music.png'

const props = withDefaults(defineProps<{
  links: StreamingLinks | Record<string, string | undefined>
  compact?: boolean
}>(), {
  compact: false,
})

const platformMeta: Record<string, { label: string, iconSrc: string | null }> = {
  spotify: { label: 'Spotify', iconSrc: spotifyIcon },
  appleMusic: { label: 'Apple Music', iconSrc: appleMusicIcon },
  youtubeMusic: { label: 'YouTube Music', iconSrc: youtubeMusicIcon },
  amazonMusic: { label: 'Amazon Music', iconSrc: amazonMusicIcon },
  bandcamp: { label: 'Bandcamp', iconSrc: bandcampIcon },
  bandsintown: { label: 'Bandsintown', iconSrc: bandsintownIcon },
  soundcloud: { label: 'SoundCloud', iconSrc: soundcloudIcon },
  youtube: { label: 'YouTube', iconSrc: youtubeIcon },
  instagram: { label: 'Instagram', iconSrc: instagramIcon },
}

const entries = computed(() => Object.entries(props.links)
  .filter(([, value]) => Boolean(value))
  .map(([platform, value]) => ({
    platform,
    label: platformMeta[platform]?.label ?? platform,
    iconSrc: platformMeta[platform]?.iconSrc ?? null,
    url: value as string,
  })))

const listEl = ref<HTMLUListElement | null>(null)

// Positions (icon index) where a forced line-break is inserted so wrapped
// rows split evenly instead of the browser's default greedy packing.
const breakBeforeIndices = ref<Set<number>>(new Set())

const listClass = computed(() => [
  'flex flex-wrap items-center gap-x-3 gap-y-1',
  breakBeforeIndices.value.size ? 'justify-center' : '',
])

const linkClass = computed(() => props.compact
  ? 'h-8 w-8 shrink-0'
  : 'h-10 w-10 shrink-0')

const iconClass = computed(() => props.compact
  ? 'h-8 w-8 object-contain'
  : 'h-10 w-10 object-contain')

function sameBreaks(a: Set<number>, b: Set<number>) {
  if (a.size !== b.size) return false
  for (const value of a) {
    if (!b.has(value)) return false
  }
  return true
}

async function rebalance() {
  const el = listEl.value
  if (!el) return

  // Clear any forced breaks so the browser lays the icons out using its
  // natural (greedy) wrap first — that tells us how many rows are truly needed.
  if (breakBeforeIndices.value.size) {
    breakBeforeIndices.value = new Set()
    await nextTick()
  }

  const icons = Array.from(el.querySelectorAll<HTMLElement>(':scope > li[data-icon]'))
  if (icons.length < 2) return

  const rowCount = new Set(icons.map(icon => icon.offsetTop)).size
  if (rowCount < 2) return

  const perRow = Math.ceil(icons.length / rowCount)
  const next = new Set<number>()
  for (let index = perRow; index < icons.length; index += perRow) {
    next.add(index)
  }

  if (!sameBreaks(next, breakBeforeIndices.value)) {
    breakBeforeIndices.value = next
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  rebalance()
  if (listEl.value) {
    resizeObserver = new ResizeObserver(() => rebalance())
    resizeObserver.observe(listEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(entries, () => {
  nextTick(() => rebalance())
})
</script>
