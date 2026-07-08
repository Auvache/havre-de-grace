<template>
  <!--
    Off state shows the album cover + a short album story. Song state shows the
    scattered collage: lyrics, two story papers, annotations, and two images.
    Positions come from CSS custom properties on the scene root (set per track).
    Text/images are placeholder for now — see app/utils/recordPlayer.ts.
  -->

  <!-- Off-state: album story -->
  <section class="paper album-story off-only" aria-live="polite">
    <h2>The Album</h2>
    <p>
      A story placeholder for <strong>{{ album.title }}</strong>. This can hold the album essay,
      credits, release context, or how to use the record player.
    </p>
    <p style="margin-top: 16px;">
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

  <!-- Song-state: lyrics -->
  <section class="paper lyrics-card song-only" aria-live="polite">
    <span class="track-chip">Track {{ track?.number ?? 1 }}</span>
    <h2>Lyrics</h2>
    <div class="lyrics-lines">
      <span v-for="(line, index) in track?.lyrics ?? []" :key="index">{{ line }}</span>
    </div>
  </section>

  <!-- Song-state: story A -->
  <section class="paper story-a song-only" aria-live="polite">
    <span class="track-chip">Track {{ track?.number ?? 1 }}</span>
    <h2 class="song-title">{{ track?.title }}<small>{{ track?.title }}</small></h2>
    <p>{{ track?.storyA }}</p>
  </section>

  <!-- Song-state: story B -->
  <section class="paper story-b song-only" aria-live="polite">
    <span class="track-chip">Story 2</span>
    <h2>Behind The Track</h2>
    <p>{{ track?.storyB }}</p>
  </section>

  <!-- Song-state: annotations -->
  <section class="paper annotations-card song-only" aria-live="polite">
    <span class="track-chip">Notes</span>
    <h2>Annotations</h2>
    <ul class="annotations-list">
      <li v-for="(note, index) in track?.annotations ?? []" :key="index">{{ note }}</li>
    </ul>
  </section>

  <!-- Song-state: image A -->
  <figure class="track-image image-a song-only" aria-label="Track image one">
    <!-- PNG hook: set track.artworkPngA to swap in real art. -->
    <div class="art" :class="{ 'has-png': Boolean(track?.artworkPngA) }" :style="artStyle(track?.artworkPngA)">
      <span class="guitar" aria-hidden="true" />
      <span class="figure guitarist" aria-hidden="true" />
      <span class="figure drummer" aria-hidden="true" />
      <span class="figure singer" aria-hidden="true" />
      <span class="drum" aria-hidden="true" />
      <span class="mic" aria-hidden="true" />
    </div>
    <figcaption>{{ track?.imageACaption }}</figcaption>
  </figure>

  <!-- Song-state: image B -->
  <figure class="track-image image-b song-only" aria-label="Track image two">
    <!-- PNG hook: set track.artworkPngB to swap in real art. -->
    <div class="art" :class="{ 'has-png': Boolean(track?.artworkPngB) }" :style="artStyle(track?.artworkPngB)">
      <span class="guitar" aria-hidden="true" />
      <span class="figure guitarist" aria-hidden="true" />
      <span class="figure drummer" aria-hidden="true" />
      <span class="figure singer" aria-hidden="true" />
      <span class="drum" aria-hidden="true" />
      <span class="mic" aria-hidden="true" />
    </div>
    <figcaption>{{ track?.imageBCaption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { ListenAlbum, ListenTrack } from '~~/shared/types'

defineProps<{
  album: ListenAlbum
  track: ListenTrack | null
}>()

const artStyle = (png?: string) => ({ '--png-art': png ? `url("${png}")` : 'none' })
</script>
