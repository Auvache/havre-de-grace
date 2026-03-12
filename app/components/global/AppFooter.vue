<template>
  <footer class="border-t border-theme" :style="{ backgroundColor: 'var(--theme-bg)' }">
    <div class="page-container py-12">
      <div class="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <p class="label-text">
          {{ siteProfile.artistName }}
        </p>

        <StreamingLinks :links="siteProfile.artistLinks" compact />

        <p class="text-sm muted-text">
          Email:
          <a :href="`mailto:${siteProfile.bookingEmail}`" class="hover:text-[var(--color-accent)]">
            {{ siteProfile.bookingEmail }}
          </a>
        </p>

        <p class="text-xs muted-text">
          &copy; {{ currentYear }} {{ siteProfile.artistName }}. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()
const currentYear = new Date().getFullYear()
</script>
