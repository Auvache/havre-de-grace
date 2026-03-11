<template>
  <section class="mx-auto max-w-6xl px-6 py-20">
    <h1 class="text-4xl font-medium">Contact</h1>
    <p class="mt-6 max-w-2xl text-lg text-[var(--color-muted)]">
      Contact form API and anti-spam handling are scheduled for Sprint 7.
    </p>
    <p class="mt-4 text-[var(--color-muted)]">
      Booking: <a :href="`mailto:${siteProfile.bookingEmail}`" class="hover:text-[var(--color-accent)]">{{ siteProfile.bookingEmail }}</a>
    </p>
  </section>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()
</script>
