<template>
  <footer class="border-t border-stone-200 bg-[var(--color-bg)]">
    <div class="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-[var(--color-muted)]">
      <p>{{ siteProfile.artistName }}</p>
      <p>
        <a :href="`mailto:${siteProfile.bookingEmail}`" class="hover:text-accent">
          {{ siteProfile.bookingEmail }}
        </a>
      </p>
      <ul class="flex flex-wrap gap-x-4 gap-y-2">
        <li v-for="link in siteProfile.socialLinks" :key="link.label">
          <a :href="link.url" target="_blank" rel="noopener noreferrer" class="hover:text-accent">
            {{ link.label }}
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()
</script>
