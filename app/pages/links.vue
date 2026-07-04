<template>
  <section class="mx-auto flex min-h-screen w-full max-w-2xl items-start px-6 pt-10 pb-12 sm:px-8 sm:pt-12 sm:pb-16">
    <div class="w-full">
      <div class="mx-auto max-w-xl">
        <img
          :src="logoBlack"
          alt="Havre De Grace"
          class="mx-auto w-[min(8.5rem,36vw)] drop-shadow-[0_18px_42px_rgba(0,0,0,0.12)]"
        >

        <div class="mt-8 space-y-3 sm:space-y-4">
          <a
            v-for="link in linkEntries"
            :key="link.label"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
            class="interactive-lift group flex w-full items-center gap-4 rounded-[1.1rem] border border-theme bg-[color-mix(in_srgb,var(--theme-surface)_88%,black_12%)] px-4 py-4 shadow-[0_20px_48px_color-mix(in_srgb,black_28%,transparent)] backdrop-blur-[6px] sm:px-5"
          >
            <span class="flex h-11 w-11 shrink-0 items-center justify-center">
              <img
                v-if="link.iconSrc"
                :src="link.iconSrc"
                alt=""
                aria-hidden="true"
                class="h-11 w-11 object-contain"
                loading="lazy"
                decoding="async"
              >
              <svg
                v-else-if="link.icon === 'globe'"
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="h-11 w-11 text-[var(--theme-text)]"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a14.5 14.5 0 0 1 0 18" />
                <path d="M12 3a14.5 14.5 0 0 0 0 18" />
              </svg>
              <svg
                v-else
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="h-11 w-11 text-[var(--theme-text)]"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>

            <span class="flex-1 text-left text-base font-semibold tracking-[0.01em] text-[var(--theme-text)] sm:text-lg">
              {{ link.label }}
            </span>

            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="h-5 w-5 shrink-0 text-[color:var(--theme-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--theme-text)]"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import amazonMusicIcon from '~~/assets/images/amazon-music.png'
import appleMusicIcon from '~~/assets/images/apple-music.png'
import bandcampIcon from '~~/assets/images/bandcamp.png'
import instagramIcon from '~~/assets/images/instagram.png'
import logoBlack from '~~/assets/images/logo-black.png'
import soundcloudIcon from '~~/assets/images/soundcloud.png'
import spotifyIcon from '~~/assets/images/spotify.png'
import youtubeIcon from '~~/assets/images/youtube.png'
import youtubeMusicIcon from '~~/assets/images/youtube-music.png'
const bandsintownIcon = '/images/bandsintown.png'

definePageMeta({
  layout: 'links',
})

type LinkIcon = 'globe' | 'mail'

interface LinkEntry {
  label: string
  href: string
  external: boolean
  iconSrc?: string
  icon?: LinkIcon
}

const siteProfile = useSiteProfile()

const linkEntries = computed(() => [
  { label: 'Spotify', href: siteProfile.artistLinks.spotify, external: true, iconSrc: spotifyIcon },
  { label: 'Apple Music', href: siteProfile.artistLinks.appleMusic, external: true, iconSrc: appleMusicIcon },
  { label: 'YouTube Music', href: siteProfile.artistLinks.youtubeMusic, external: true, iconSrc: youtubeMusicIcon },
  { label: 'Amazon Music', href: siteProfile.artistLinks.amazonMusic, external: true, iconSrc: amazonMusicIcon },
  { label: 'YouTube', href: siteProfile.artistLinks.youtube, external: true, iconSrc: youtubeIcon },
  { label: 'Instagram', href: siteProfile.artistLinks.instagram, external: true, iconSrc: instagramIcon },
  { label: 'Bandcamp', href: siteProfile.artistLinks.bandcamp, external: true, iconSrc: bandcampIcon },
  { label: 'Bandsintown', href: siteProfile.artistLinks.bandsintown, external: true, iconSrc: bandsintownIcon },
  { label: 'SoundCloud', href: siteProfile.artistLinks.soundcloud, external: true, iconSrc: soundcloudIcon },
  { label: 'Official Website', href: '/', external: false, icon: 'globe' },
  { label: 'Email', href: `mailto:${siteProfile.bookingEmail}`, external: false, icon: 'mail' },
].filter((entry): entry is LinkEntry => Boolean(entry.href)))

usePageSeo({
  title: `Havre De Grace | Music Links & Streaming`,
  description: `Find Havre De Grace Music links on Spotify, Apple Music, YouTube, Instagram, and more in one place.`,
  image: '/press/media-pic-square.jpg',
})
</script>
