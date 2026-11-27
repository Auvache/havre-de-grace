<!--
  Forty: a live demo of a new song, in two versions side by side so the
  difference is plain: the mastered mix first, then the take as it was played.

  Unlisted, not private, like /seven-inch: nothing links to it, it's noindexed
  (nuxt.config.ts) and so is its audio (public/customHttp.json), but anyone
  with the URL can play it.
-->

<template>
  <div>
    <ShorelineBand title="Forty" image="/images/site/woods-wide-2400.jpg" image-position="50% 22%" />

    <div class="reading">
      <p class="centre intro">
        A live demo of a new song: guitar and voice, one take, one mic.
        Two versions of the same take.
      </p>

      <ol class="versions">
        <li v-for="(v, i) in VERSIONS" :key="v.src" class="version">
          <p class="eyebrow">{{ i + 1 }} of {{ VERSIONS.length }}</p>
          <h2>{{ v.title }}</h2>
          <p class="note">{{ v.note }}</p>
          <audio
            :ref="(el) => { players[i] = el as HTMLAudioElement | null }"
            :src="v.src"
            controls
            preload="metadata"
            @play="pauseOthers(i)"
          />
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ navOver: true })

const VERSIONS = [
  {
    title: 'Forty (mastered)',
    note: 'The guitar brought up, a little room, and mastered to a proper volume.',
    src: '/forty/forty-mastered.mp3',
  },
  {
    title: 'Forty (live take)',
    note: 'The take as it was played. Only trimmed, with the pops and hard S’s smoothed.',
    src: '/forty/forty-live-take.mp3',
  },
]

/** One at a time: starting a version pauses the other. */
const players: (HTMLAudioElement | null)[] = []
const pauseOthers = (playing: number) => {
  players.forEach((p, i) => { if (i !== playing) p?.pause() })
}

usePageSeo({
  title: 'Forty (live demo) | Havre De Grace',
  description: 'A live demo of Forty, a new Havre De Grace song, mastered and as played.',
})
</script>

<style scoped>
.centre {
  text-align: center;
  text-wrap: balance;
}

.intro {
  color: var(--soft);
}

.versions {
  list-style: none;
  margin: 56px 0 0;
  padding: 0;
  display: grid;
  gap: 48px;
}

.version {
  padding-top: 32px;
  border-top: var(--line);
}

.version h2 {
  margin: 6px 0 8px;
  font-family: var(--font-display);
  font-size: var(--font-size-subheading);
  font-weight: 400;
}

.note {
  margin: 0 0 20px;
  color: var(--soft);
}

audio {
  display: block;
  width: 100%;
}
</style>
