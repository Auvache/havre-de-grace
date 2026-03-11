<template>
  <header class="border-b border-stone-200 bg-[var(--color-bg)]">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NuxtLink to="/" class="text-sm font-semibold uppercase tracking-[0.2em]">
        {{ siteProfile.artistName }}
      </NuxtLink>

      <ul class="flex items-center gap-3 text-sm">
        <li><NuxtLink to="/music" class="hover:text-accent">Music</NuxtLink></li>
        <li>/</li>
        <li><NuxtLink to="/about" class="hover:text-accent">About</NuxtLink></li>
        <li>/</li>
        <li><NuxtLink to="/contact" class="hover:text-accent">Contact</NuxtLink></li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()
</script>
