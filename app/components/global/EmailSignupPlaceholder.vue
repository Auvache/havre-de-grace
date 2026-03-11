<template>
  <section class="space-y-3" aria-label="Email signup placeholder">
    <p class="label-text muted-text">sign up for updates</p>
    <form class="flex w-full max-w-md flex-col gap-2 sm:flex-row" @submit.prevent>
      <label class="sr-only" :for="inputId">Email address</label>
      <input
        :id="inputId"
        type="email"
        placeholder="coming soon"
        disabled
        class="h-11 flex-1 rounded-md border border-theme bg-transparent px-3 text-sm placeholder:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
      >
      <button
        type="submit"
        disabled
        class="h-11 rounded-md border border-theme px-4 text-sm uppercase tracking-[0.14em] text-[var(--theme-muted)] disabled:cursor-not-allowed"
      >
        notify me
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
const inputId = useId()
</script>
