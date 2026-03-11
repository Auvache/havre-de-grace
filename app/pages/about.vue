<template>
  <section class="mx-auto max-w-6xl px-6 py-20">
    <h1 class="text-4xl font-medium">About</h1>
    <p class="mt-6 max-w-2xl text-lg text-[var(--color-muted)]">
      Bio and press-kit layout will be composed in Sprint 4.
    </p>
    <p class="mt-4 text-[var(--color-muted)]">
      {{ siteProfile.artistName }} is based in {{ siteProfile.location }}.
    </p>
  </section>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()
</script>
