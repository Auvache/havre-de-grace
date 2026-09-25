<!--
  The link-in-bio page, pointed at from the YouTube, Instagram and Bandcamp
  profiles. Most visitors arrive from a Short on a phone, already know which
  streaming app they use, and want to be listening in one tap. So there is one
  big button, and a picker under it for anyone whose app isn't the one shown.
  The choice is remembered on the device, so a returning visitor's button is
  already theirs. After that: the mailing list, then four doors to everything
  else.

  The server always renders Spotify. The saved choice (or Apple Music on iOS
  when nothing is saved) is applied after hydration. All six chips are always
  on screen and the button is a fixed height, so the swap changes words and an
  icon but never moves anything.

  The page paints no background of its own: the blackout gradient comes from
  the route's theme (app/config/pageThemeConfig.ts).
-->

<template>
  <div class="links-page relative min-h-screen overflow-x-hidden">
    <main class="relative mx-auto w-full max-w-[27rem] px-4 pb-14 pt-[4.5rem] sm:pt-[6.5rem]">
      <!-- Profile -->
      <header class="flex flex-col items-center text-center">
        <div class="links-avatar h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full">
          <!-- Zoomed onto his face: in the full frame it is a small part of the stage. -->
          <NuxtImg
            src="/images/bio-update.jpg"
            alt="Stefan Auvache Bradley playing guitar on stage"
            width="352"
            height="352"
            format="webp"
            class="links-avatar__img h-full w-full object-cover"
          />
        </div>
        <h1 class="mt-3 text-[1.45rem] font-bold leading-tight tracking-[0.005em] text-[var(--links-foam)]">
          {{ siteProfile.artistName }}
        </h1>
      </header>

      <!-- Listen: the one thing this page is for. -->
      <section class="links-card mt-6 p-3" aria-labelledby="links-listen-heading">
        <div class="flex items-center gap-3 px-1 pb-3 pt-1">
          <img
            v-if="latestAlbum"
            :src="latestAlbum.ogImage || latestAlbum.coverImage"
            :alt="latestAlbum.coverAlt"
            width="56"
            height="56"
            class="h-14 w-14 shrink-0 rounded-[0.6rem] object-cover shadow-[0_4px_14px_rgba(22,25,29,0.18)]"
          >
          <div class="min-w-0">
            <p class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              New album
            </p>
            <h2 id="links-listen-heading" class="truncate text-[1.15rem] font-bold leading-snug text-[var(--links-ink)]">
              {{ albumTitle }}
            </h2>
            <p class="text-[0.85rem] text-[var(--links-muted)]">
              {{ trackCount }} songs · out now
            </p>
          </div>
        </div>

        <a
          :href="selected.href"
          target="_blank"
          rel="noopener noreferrer"
          class="links-play group flex h-[4.25rem] w-full items-center gap-3.5 rounded-[1.05rem] px-3.5 text-left"
          :aria-label="`Play ${albumTitle} on ${selected.label}`"
        >
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.8rem] bg-white">
            <img :src="selected.iconSrc" alt="" width="32" height="32" class="h-8 w-8 object-contain">
          </span>
          <span class="min-w-0 flex-1 leading-tight">
            <span class="block truncate text-[1.12rem] font-bold text-white">Play {{ albumTitle }}</span>
            <span class="block truncate text-[0.86rem] text-white/70">on {{ selected.label }}</span>
          </span>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.12] transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
            <svg viewBox="0 0 24 24" class="ml-0.5 h-5 w-5 fill-white" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5Z" /></svg>
          </span>
        </a>

        <fieldset class="mt-3.5 px-1 pb-1">
          <legend class="mb-2 text-[0.8rem] text-[var(--links-muted)]">
            Not your app? Pick yours — we'll remember it.
          </legend>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="service in albumServices"
              :key="service.key"
              type="button"
              class="links-chip flex h-11 items-center justify-center gap-1.5 rounded-full px-1.5 text-[0.8rem] font-medium"
              :class="service.key === selected.key ? 'links-chip--on' : ''"
              :aria-pressed="service.key === selected.key"
              @click="choose(service.key)"
            >
              <img :src="service.iconSrc" alt="" width="18" height="18" class="h-[1.1rem] w-[1.1rem] shrink-0 object-contain">
              <span class="whitespace-nowrap">{{ SHORT_LABELS[service.key] }}</span>
            </button>
          </div>
        </fieldset>
      </section>

      <!-- Mailing list -->
      <section class="links-card mt-3 p-4" aria-labelledby="links-list-heading">
        <div class="flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_14%,white)] text-[var(--color-accent)]">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7.5 8 5.5 8-5.5" /></svg>
          </span>
          <div class="min-w-0">
            <h2 id="links-list-heading" class="text-[1.02rem] font-bold leading-snug text-[var(--links-ink)]">
              Get new songs &amp; show dates
            </h2>
            <p class="text-[0.86rem] text-[var(--links-muted)]">
              Straight to your inbox. A few emails a year.
            </p>
          </div>
        </div>

        <p v-if="status === 'success'" class="mt-3.5 rounded-[0.9rem] bg-[color-mix(in_srgb,var(--color-accent)_10%,white)] px-4 py-3 text-[0.9rem] text-[var(--links-ink)]" role="status">
          Almost there. Check your inbox and click the link to confirm.
        </p>
        <form v-else class="mt-3.5" @submit.prevent="subscribe">
          <div class="links-field flex h-12 items-center rounded-full p-1">
            <label for="links-email" class="sr-only">Email address</label>
            <input
              id="links-email"
              v-model="email"
              type="email"
              name="email_address"
              autocomplete="email"
              inputmode="email"
              placeholder="you@example.com"
              required
              :disabled="status === 'loading'"
              class="h-full min-w-0 flex-1 bg-transparent pl-4 pr-2 text-[1rem] text-[var(--links-ink)] placeholder:text-[var(--links-muted)] focus:outline-none disabled:opacity-60"
            >
            <button
              type="submit"
              :disabled="status === 'loading'"
              class="h-full shrink-0 rounded-full bg-[var(--color-accent)] px-5 text-[0.9rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {{ status === 'loading' ? 'Joining…' : 'Join' }}
            </button>
          </div>

          <!-- Honeypot: off-screen and skipped by the keyboard, so only bots fill it. -->
          <div class="sr-only" aria-hidden="true">
            <label for="links-website">Leave this empty</label>
            <input id="links-website" v-model="website" type="text" tabindex="-1" autocomplete="off">
          </div>

          <p v-if="status === 'error'" class="mt-2 pl-4 text-[0.85rem] text-[#b3412e]" role="alert">
            That didn't go through. Check the address and try again.
          </p>
        </form>
      </section>

      <!-- Everything else, as four doors. -->
      <nav class="mt-3 grid grid-cols-2 gap-3" aria-label="More from Havre De Grace">
        <a
          v-for="tile in tiles"
          :key="tile.label"
          :href="tile.href"
          :target="tile.external ? '_blank' : undefined"
          :rel="tile.external ? 'noopener noreferrer' : undefined"
          class="links-card links-tile flex min-h-[7.5rem] flex-col p-4"
        >
          <img v-if="tile.iconSrc" :src="tile.iconSrc" alt="" width="36" height="36" class="h-9 w-9 object-contain">
          <span v-else class="flex h-9 w-9 items-center justify-center rounded-[0.6rem] bg-[var(--links-ink)] text-white">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
          </span>
          <span class="mt-3.5 block">
            <span class="block text-[0.98rem] font-bold leading-tight text-[var(--links-ink)]">{{ tile.label }}</span>
            <span class="mt-0.5 block text-[0.8rem] leading-snug text-[var(--links-muted)]">{{ tile.note }}</span>
          </span>
        </a>
      </nav>

      <footer class="mt-8 space-y-3 text-center text-[0.85rem]">
        <p>
          <NuxtLink to="/music/i-want-to-be-yours-and-other-songs" class="links-quiet-link">
            Previous album: <span class="italic">I Want to Be Yours and Other Songs</span> →
          </NuxtLink>
        </p>
        <p>
          <NuxtLink to="/" class="links-quiet-link">havredegracemusic.com</NuxtLink>
        </p>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import bandsintownIcon from '~~/assets/images/bandsintown.png'
import instagramIcon from '~~/assets/images/instagram.png'
import youtubeIcon from '~~/assets/images/youtube.png'
import type { ServiceKey } from '~/composables/useLinkHub'

definePageMeta({
  layout: 'links',
})

const { latestAlbum, albumServices, shortsUrl, bookingEmail, siteProfile } = await useLinkHub()
const { email, website, status, subscribe } = useNewsletterSignup()

const STORAGE_KEY = 'hdg-links-service'

/** Short enough for three chips in a row at 390px. */
const SHORT_LABELS: Record<ServiceKey, string> = {
  spotify: 'Spotify',
  appleMusic: 'Apple',
  youtubeMusic: 'YT Music',
  amazonMusic: 'Amazon',
  bandcamp: 'Bandcamp',
  soundcloud: 'SoundCloud',
}

const albumTitle = computed(() => latestAlbum.value?.title ?? 'the new album')
const trackCount = computed(() => latestAlbum.value?.tracklist.length ?? 0)

const selectedKey = ref<ServiceKey>('spotify')
const selected = computed(() =>
  albumServices.value.find((service) => service.key === selectedKey.value) ?? albumServices.value[0]!)

const isKnownService = (key: unknown): key is ServiceKey =>
  albumServices.value.some((service) => service.key === key)

const choose = (key: ServiceKey) => {
  selectedKey.value = key
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch {
    // Private mode or blocked storage: the choice still holds for this visit.
  }
}

onMounted(() => {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(STORAGE_KEY)
  } catch {
    saved = null
  }

  if (isKnownService(saved)) {
    selectedKey.value = saved
    return
  }

  // Nothing saved yet: on an iPhone or iPad the likelier app is Apple Music.
  const isAppleDevice = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isAppleDevice && isKnownService('appleMusic')) {
    selectedKey.value = 'appleMusic'
  }
})

const tiles = computed(() => [
  { label: 'Watch the Shorts', note: 'New ones every week', href: shortsUrl.value, external: true, iconSrc: youtubeIcon },
  { label: 'Instagram', note: 'Photos & behind the songs', href: siteProfile.artistLinks.instagram ?? '', external: true, iconSrc: instagramIcon },
  { label: 'See a show', note: 'Get alerts for dates near you', href: siteProfile.artistLinks.bandsintown ?? '', external: true, iconSrc: bandsintownIcon },
  { label: 'Booking', note: 'Shows, press & collabs', href: `mailto:${bookingEmail}`, external: false, iconSrc: '' },
].filter((tile) => tile.href))

// This page is noindex (see routeRules in nuxt.config.ts): its job is
// click-through, not search. Titles and share metadata still matter for the
// social previews.
usePageSeo({
  title: `Havre De Grace | Music Links & Streaming`,
  description: `Find Havre De Grace Music links on Spotify, Apple Music, YouTube, Instagram, and more in one place.`,
  image: {
    src: '/press/media-pic-square.jpg',
    width: 1200,
    height: 1200,
    type: 'image/jpeg',
    alt: 'Havre De Grace press photo',
  },
})
</script>

<style scoped>
.links-page {
  /* Inside the cards. */
  --links-paper: #f4f2ec;
  --links-ink: #16191d;
  --links-muted: #68727b;
  --links-line: rgba(22, 25, 29, 0.08);
  /* On the blackout around them. */
  --links-foam: #f4f6f7;

  color: var(--links-ink);
  font-family: var(--font-family-base);
}

.links-avatar {
  box-shadow:
    0 0 0 3px var(--links-foam),
    0 12px 32px rgba(0, 0, 0, 0.6);
}

/* The origin is chosen so his face, at about (62%, 25%) of the frame, lands
   just above the centre of the circle once scaled. */
.links-avatar__img {
  transform: scale(1.9);
  transform-origin: 75% 4%;
}

.links-card {
  background: #fff;
  border: 1px solid var(--links-line);
  border-radius: 1.4rem;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 18px 40px -14px rgba(0, 0, 0, 0.6);
}

.links-play {
  background: var(--links-ink);
  box-shadow: 0 14px 28px -12px rgba(22, 25, 29, 0.55);
  transition: transform 160ms var(--ease-standard), box-shadow 160ms var(--ease-standard);
}

.links-play:hover {
  box-shadow: 0 18px 34px -12px rgba(22, 25, 29, 0.6);
}

.links-play:active {
  transform: scale(0.985);
}

.links-play:focus-visible,
.links-chip:focus-visible,
.links-tile:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.links-chip {
  background: var(--links-paper);
  color: var(--links-ink);
  border: 1.5px solid transparent;
  transition: background-color 160ms var(--ease-standard), border-color 160ms var(--ease-standard);
}

.links-chip:hover {
  background: color-mix(in srgb, var(--links-paper) 70%, var(--links-ink) 6%);
}

.links-chip--on,
.links-chip--on:hover {
  background: color-mix(in srgb, var(--color-accent) 10%, white);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 700;
}

.links-field {
  background: var(--links-paper);
  border: 1.5px solid transparent;
  transition: border-color 160ms var(--ease-standard);
}

.links-field:focus-within {
  border-color: var(--color-accent);
}

.links-tile {
  transition: transform 160ms var(--ease-standard);
}

.links-tile:active {
  transform: scale(0.97);
}

.links-quiet-link {
  color: color-mix(in srgb, var(--links-foam) 85%, transparent);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--links-foam) 30%, transparent);
  text-underline-offset: 3px;
}

.links-quiet-link:hover {
  color: var(--links-foam);
}
</style>
