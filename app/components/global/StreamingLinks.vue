<template>
  <ul v-if="entries.length" class="flex flex-wrap gap-2.5">
    <li v-for="entry in entries" :key="entry.label">
      <a
        :href="entry.url"
        target="_blank"
        rel="noopener noreferrer"
        :title="entry.label"
        :aria-label="entry.label"
        :class="linkClass"
      >
        {{ entry.label }}
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { StreamingLinks } from '~~/shared/types'

const props = withDefaults(defineProps<{
  links: StreamingLinks | Record<string, string | undefined>
  compact?: boolean
}>(), {
  compact: false,
})

const platformLabels: Record<string, string> = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  youtubeMusic: 'YouTube Music',
  amazonMusic: 'Amazon Music',
  bandcamp: 'Bandcamp',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  instagram: 'Instagram',
}

const entries = computed(() => Object.entries(props.links)
  .filter(([, value]) => Boolean(value))
  .map(([platform, value]) => ({
    label: platformLabels[platform] ?? platform,
    url: value as string,
  })))

const linkClass = computed(() => props.compact
  ? 'inline-flex rounded-full border border-theme px-3 py-1 text-xs font-medium tracking-wide muted-text hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
  : 'inline-flex rounded-full border border-theme px-3.5 py-2 text-sm tracking-wide muted-text hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]')
</script>
