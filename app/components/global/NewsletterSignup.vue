<!--
  Kit (ConvertKit) mailing-list signup, as one underlined field with the action
  in small capitals at its end (the 2026 refresh). Used on the homepage, Letters,
  a letter page and /subscribe; a page has one signup at most. The request itself
  is useNewsletterSignup, shared with /links.
-->

<template>
  <section aria-label="Mailing list signup" :class="['signup', { 'is-centred': centred }]">
    <p v-if="status === 'success'" class="signup__msg" role="status">
      Almost there. Check your inbox and click the link to confirm.
    </p>

    <form
      v-else
      :action="KIT_FORM_URL"
      method="post"
      class="signup__field"
      @submit.prevent="subscribe"
    >
      <label :for="emailId" class="sr-only">Email address</label>
      <input
        :id="emailId"
        v-model="email"
        type="email"
        name="email_address"
        autocomplete="email"
        placeholder="your email"
        required
        :disabled="status === 'loading'"
      >

      <!-- Honeypot: off-screen and skipped by the keyboard, so only bots fill it. -->
      <div class="sr-only" aria-hidden="true">
        <label :for="websiteId">Leave this empty</label>
        <input :id="websiteId" v-model="website" type="text" tabindex="-1" autocomplete="off">
      </div>

      <!--
        No `novalidate`: the browser's own `required` + `type="email"` check is
        the guard. @submit only fires once that check passes, and it's what
        makes the no-JS post safe too.
      -->
      <button type="submit" :disabled="status === 'loading'">
        {{ status === 'loading' ? 'Sending' : label }}
      </button>
    </form>

    <p v-if="status === 'error'" class="signup__msg" role="alert">
      That didn't go through. Check the email address and try again.
    </p>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** The action at the end of the field. */
  label?: string
  centred?: boolean
}>(), {
  label: 'Subscribe',
  centred: false,
})

// Ids unique per instance and identical across SSR and hydration.
const uid = useId()
const emailId = `signup-email-${uid}`
const websiteId = `signup-website-${uid}`

const { email, website, status, subscribe } = useNewsletterSignup()
</script>

<style scoped>
.signup {
  max-width: 460px;
}

.signup.is-centred {
  margin-inline: auto;
}

.signup__field {
  display: flex;
  align-items: baseline;
  gap: 16px;
  border-bottom: 1px solid currentColor;
  padding-bottom: 12px;
}

.signup__field input[type="email"] {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 15px;
  font-weight: 300;
  color: inherit;
  padding: 0;
}

.signup__field input[type="email"]::placeholder {
  color: var(--faint);
}

.signup__field input[type="email"]:focus {
  outline: none;
}

.signup__field:focus-within {
  border-bottom-color: var(--sea);
}

.signup__field button {
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
}

.signup__field button:hover {
  color: var(--deep);
}

.signup__field button:disabled {
  opacity: 0.5;
}

.signup__msg {
  margin-top: 14px;
  font-size: 15px;
  color: var(--soft);
}

.is-centred .signup__msg {
  text-align: center;
}
</style>
