<template>
  <!--
    Off state shows the album cover + a short album intro. Song state shows the
    scattered collage of whatever content the track defines — lyrics, a "how it
    was written" story, recording details, borderless photos, the album artwork
    (front/back), and per-song liner-note credits. Every element is optional and
    is omitted entirely when the track has no data for it. Positions come from CSS
    custom properties on the scene root (set per track).
  -->

  <!-- Off-state: album intro -->
  <section class="paper album-story off-only" aria-live="polite">
    <h2>{{ album.title }}</h2>
    <p>
      Move the tonearm onto the vinyl, click a groove, or use the track buttons to reveal each song.
    </p>
  </section>

  <!-- Off-state: album cover -->
  <section class="album-cover off-only" :aria-label="album.coverAlt">
    <NuxtImg
      :src="album.coverImage"
      :alt="album.coverAlt"
      class="cover-img"
      width="600"
      height="600"
      sizes="330px"
      format="webp,avif"
      loading="eager"
    />
  </section>

  <!-- Song-state: lyrics on a single page -->
  <section v-if="track?.lyrics?.length" class="paper lyrics-card song-only" aria-live="polite">
    <h2>Lyrics</h2>
    <div class="lyrics-lines">
      <span v-for="(line, index) in track.lyrics" :key="index">{{ line || ' ' }}</span>
    </div>
  </section>

  <!-- Song-state: how the song was written -->
  <section v-if="track?.writingStory" class="paper story-a song-only" aria-live="polite">
    <h2>How It Was Written</h2>
    <p v-for="(para, index) in paragraphs(track.writingStory)" :key="index">{{ para }}</p>
  </section>

  <!-- Song-state: how the song was recorded -->
  <section v-if="track?.recordingDetails" class="paper story-b song-only" aria-live="polite">
    <h2>In The Studio</h2>
    <p v-for="(para, index) in paragraphs(track.recordingDetails)" :key="index">{{ para }}</p>
  </section>

  <!-- Song-state: per-song liner notes / credits -->
  <section v-if="track?.credits?.length" class="paper credits-card song-only" aria-live="polite">
    <h2>Liner Notes</h2>
    <ul class="credits-list">
      <li v-for="(credit, index) in track.credits" :key="index">
        <span class="credit-role">{{ credit.role }}</span>
        <span class="credit-name">{{ credit.name }}</span>
      </li>
    </ul>
  </section>

  <!-- Song-state: borderless, uncaptioned photos -->
  <div v-if="track?.photos?.length" class="track-image image-a photo-cluster song-only" aria-label="Song photos">
    <NuxtImg
      v-for="(photo, index) in track.photos"
      :key="index"
      :src="photo.src"
      :alt="photo.alt || ''"
      class="collage-photo"
      width="520"
      sizes="240px"
      format="webp,avif"
      loading="lazy"
    />
  </div>

  <!-- Song-state: album artwork (front + back), borderless -->
  <div v-if="album.coverImage" class="track-image image-b artwork-cluster song-only" aria-label="Album artwork">
    <NuxtImg
      :src="album.coverImage"
      :alt="album.coverAlt"
      class="collage-photo"
      width="520"
      sizes="230px"
      format="webp,avif"
      loading="lazy"
    />
    <NuxtImg
      v-if="album.backCoverImage"
      :src="album.backCoverImage"
      :alt="album.backCoverAlt || `${album.title} back cover`"
      class="collage-photo"
      width="520"
      sizes="230px"
      format="webp,avif"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import type { ListenAlbum, ListenTrack } from '~~/shared/types'

defineProps<{
  album: ListenAlbum
  track: ListenTrack | null
}>()

// Split a prose block into paragraphs on blank lines so multi-paragraph stories
// render with spacing instead of one run-on block.
function paragraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)
}
</script>
