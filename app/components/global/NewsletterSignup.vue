<!--
  Kit (ConvertKit) mailing-list signup: a centred block on /subscribe, a
  compact bar in the footer. The thin strip under the navbar is a different
  shape entirely and lives in NewsletterBanner; all three share the request
  itself via useNewsletterSignup.
-->

<template>
  <section aria-label="Mailing list signup" :class="compact ? 'w-full max-w-sm' : ''">
    <p v-if="compact" class="label-text">
      mailing list
    </p>

    <p v-if="status === 'success'" :class="messageClass" role="status">
      Almost there — check your inbox and click the link to confirm.
    </p>

    <form
      v-else
      :action="KIT_FORM_URL"
      method="post"
      :class="['flex flex-wrap gap-3', compact ? 'mt-4' : 'mx-auto max-w-md justify-center']"
      @submit.prevent="subscribe"
    >
      <label :for="emailId" class="sr-only">Email address</label>
      <input
        :id="emailId"
        v-model="email"
        type="email"
        name="email_address"
        autocomplete="email"
        placeholder="you@example.com"
        required
        :disabled="status === 'loading'"
        class="min-w-0 flex-1 basis-48 rounded-full border border-theme bg-[var(--theme-surface)] px-5 py-3 text-sm placeholder:text-[var(--theme-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-60"
      >

      <!-- Honeypot: off-screen and skipped by the keyboard, so only bots fill it. -->
      <div class="sr-only" aria-hidden="true">
        <label :for="websiteId">Leave this empty</label>
        <input :id="websiteId" v-model="website" type="text" tabindex="-1" autocomplete="off">
      </div>

      <!--
        No `novalidate`: the browser's own `required` + `type="email"` check is
        the guard, so the button stays at full strength instead of sitting
        greyed out until the field has something in it. @submit only fires once
        that check passes, and it's what makes the no-JS post safe too.
      -->
      <button
        type="submit"
        :disabled="status === 'loading'"
        class="cta-solo inline-flex shrink-0 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
      >
        {{ status === 'loading' ? 'subscribing…' : 'subscribe' }}
      </button>

      <p v-if="status === 'error'" :class="['basis-full', messageClass]" role="alert">
        That didn't go through. Check the email address and try again.
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  // The footer bar: a small label of its own, and no centring — the footer
  // stack handles that. The subscribe page brings its own heading instead.
  compact?: boolean
}>(), {
  compact: false,
})

// Both instances render on most pages, so the label/input pairs need ids that
// are unique per instance and identical across SSR and hydration.
const uid = useId()
const emailId = `signup-email-${uid}`
const websiteId = `signup-website-${uid}`

const { email, website, status, subscribe } = useNewsletterSignup()

const messageClass = computed(() => [
  'text-sm muted-text',
  props.compact ? 'mt-4' : 'mt-8 text-center',
])
</script>
