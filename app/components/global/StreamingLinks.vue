<template>
  <ul v-if="entries.length" :class="listClass">
    <li v-for="entry in entries" :key="entry.platform">
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

const listClass = computed(() => props.compact
  ? 'flex flex-wrap items-center gap-3'
  : 'flex flex-wrap items-center gap-4')

const linkClass = computed(() => props.compact
  ? 'h-8 w-8'
  : 'h-10 w-10')

const iconClass = computed(() => props.compact
  ? 'h-8 w-8 object-contain'
  : 'h-10 w-10 object-contain')
</script>
