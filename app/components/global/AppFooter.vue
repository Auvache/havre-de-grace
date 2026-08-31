<template>
  <footer class="border-t border-theme" :style="{ backgroundColor: 'var(--theme-bg)' }">
    <div class="page-container py-12">
      <div class="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <p class="label-text">
          {{ siteProfile.artistName }}
        </p>

        <StreamingLinks :links="siteProfile.artistLinks" compact />

        <!--
          The footer previously carried no internal links at all. On a site this
          small that's the cheapest crawl path and internal-link surface there
          is, and it puts a real link to each album on every page.
        -->
        <nav aria-label="Footer" class="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          <NuxtLink to="/" class="nav-link muted-text hover:text-[var(--color-accent)]">
            home
          </NuxtLink>
          <NuxtLink
            v-for="album in albums"
            :key="album.slug"
            :to="`/music/${album.slug}`"
            class="nav-link muted-text hover:text-[var(--color-accent)]"
          >
            {{ album.title }}
          </NuxtLink>
          <NuxtLink to="/about" class="nav-link muted-text hover:text-[var(--color-accent)]">
            about
          </NuxtLink>
          <NuxtLink to="/about#press" class="nav-link muted-text hover:text-[var(--color-accent)]">
            press kit
          </NuxtLink>
        </nav>

        <p class="text-sm muted-text">
          Email:
          <a :href="`mailto:${siteProfile.bookingEmail}`" class="hover:text-[var(--color-accent)]">
            {{ siteProfile.bookingEmail }}
          </a>
        </p>

        <p class="text-xs muted-text">
          &copy; {{ currentYear }} {{ siteProfile.artistName }} Music. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const siteProfile = useSiteProfile()
const currentYear = new Date().getFullYear()

// Released, visible albums, newest first. Unreleased albums are left out so the
// footer never links to a "coming soon" placeholder from every page on the site.
const { data: albums } = await useAsyncData('footer-albums', async () => {
  const items = await queryCollection('music').all() as Album[]

  const isReleased = (album: Album) => {
    const match = album.releaseDate?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) {
      return true
    }
    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime() <= Date.now()
  }

  return items
    .filter((album) => album.isVisible !== false && !album.isSingle && isReleased(album))
    .sort((a, b) => (b.releaseDate ?? String(b.year)).localeCompare(a.releaseDate ?? String(a.year)))
})
</script>