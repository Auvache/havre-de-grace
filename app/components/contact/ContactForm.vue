<template>
  <form class="surface-card space-y-6 p-6 sm:p-8" novalidate @submit.prevent="onSubmit">
    <p class="label-text muted-text">
      send a message
    </p>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="space-y-2 text-sm">
        <span class="muted-text">name</span>
        <input
          v-model="form.name"
          name="name"
          type="text"
          autocomplete="name"
          required
          class="h-11 w-full rounded-md border border-theme bg-transparent px-3"
        >
      </label>

      <label class="space-y-2 text-sm">
        <span class="muted-text">email</span>
        <input
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="h-11 w-full rounded-md border border-theme bg-transparent px-3"
        >
      </label>
    </div>

    <label class="block space-y-2 text-sm">
      <span class="muted-text">subject</span>
      <input
        v-model="form.subject"
        name="subject"
        type="text"
        required
        class="h-11 w-full rounded-md border border-theme bg-transparent px-3"
      >
    </label>

    <label class="block space-y-2 text-sm">
      <span class="muted-text">message</span>
      <textarea
        v-model="form.message"
        name="message"
        rows="7"
        required
        class="w-full rounded-md border border-theme bg-transparent px-3 py-2"
      />
    </label>

    <button
      type="submit"
      class="inline-flex rounded-full border border-theme px-5 py-2.5 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      send message
    </button>

    <p v-if="hasSubmitted" class="text-sm text-[var(--color-accent)]">
      Thanks for reaching out. Form delivery goes live in Sprint 7. For immediate responses, email
      <a :href="`mailto:${siteProfile.bookingEmail}`" class="underline">
        {{ siteProfile.bookingEmail }}
      </a>.
    </p>

    <p v-else class="text-sm muted-text">
      Form submission endpoint and anti-spam handling are scheduled in Sprint 7.
    </p>
  </form>
</template>

<script setup lang="ts">
const siteProfile = useSiteProfile()

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const hasSubmitted = ref(false)

const onSubmit = () => {
  hasSubmitted.value = true
}
</script>
