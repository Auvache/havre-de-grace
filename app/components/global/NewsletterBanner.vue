<!--
  The mailing-list strip. It rides inside the navbar's fixed header, directly
  under the nav row, so it follows the page without a scroll listener of its
  own — being part of the same `position: fixed` element is the whole trick.

  Two shapes, because the strip is deliberately shorter than the nav row and an
  email field plus a button plus a close control does not fit across a phone.
  From 640px up it carries the form itself; below that it carries a link to
  /subscribe, which is the same signup with room to breathe.
-->

<template>
  <div
    v-if="showsBanner"
    class="mailing-banner relative flex h-[var(--banner-height)] items-center border-b border-theme"
    :style="{ backgroundColor: 'var(--theme-bg-soft)' }"
  >
    <!-- pr-10 keeps the content clear of the close button pinned at the edge. -->
    <div class="page-container flex h-full items-center justify-center gap-3 pr-10">
      <p v-if="status === 'success'" class="truncate text-sm" role="status">
        Thanks — check your inbox to confirm.
      </p>

      <template v-else>
        <p class="hidden truncate text-sm sm:block" :class="status === 'error' ? 'text-[var(--color-accent)]' : 'muted-text'">
          {{ status === 'error' ? "That didn't go through — check the address." : 'New songs first, straight to your inbox.' }}
        </p>

        <form
          :action="KIT_FORM_URL"
          method="post"
          class="hidden items-center gap-2 sm:flex"
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
            class="h-8 w-48 min-w-0 rounded-full border border-theme bg-[var(--theme-bg)] px-4 text-xs placeholder:text-[var(--theme-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-60"
          >

          <!-- Honeypot: off-screen and skipped by the keyboard, so only bots fill it. -->
          <div class="sr-only" aria-hidden="true">
            <label :for="websiteId">Leave this empty</label>
            <input :id="websiteId" v-model="website" type="text" tabindex="-1" autocomplete="off">
          </div>

          <button
            type="submit"
            :disabled="status === 'loading'"
            class="inline-flex h-8 shrink-0 items-center rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 text-xs font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {{ status === 'loading' ? 'subscribing…' : 'subscribe' }}
          </button>
        </form>

        <NuxtLink to="/subscribe" class="nav-link truncate text-sm sm:hidden">
          new songs first — join the mailing list
        </NuxtLink>
      </template>
    </div>

    <button
      type="button"
      class="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full muted-text transition-opacity duration-200 hover:opacity-70"
      aria-label="Dismiss the mailing list banner"
      @click="dismiss"
    >
      <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
        <path d="M3 3l10 10M13 3L3 13" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
// Pages that have no business advertising the mailing list: the two pages that
// are *about* the mailing list, and the unlisted workbench.
const BANNER_OFF_ROUTES = /^\/(?:subscribe|unsubscribe|tools)(?:\/|$)/

const route = useRoute()
const showsBanner = computed(() => !BANNER_OFF_ROUTES.test(route.path))

// The route's half of the story, kept on a separate attribute from the
// cookie's `data-banner` so the two never fight: unhead owns this one and
// removes it again on the way out of an opted-out route, while `data-banner`
// belongs to the inline head script and the dismiss handler. Sharing one
// attribute would mean navigating away from /subscribe silently un-hid the
// banner for someone who had already closed it.
useHead(() => ({
  htmlAttrs: showsBanner.value ? {} : { 'data-banner-route': 'off' },
}))

const uid = useId()
const emailId = `banner-email-${uid}`
const websiteId = `banner-website-${uid}`

// Long enough to read the confirmation line before the strip closes itself.
const { email, website, status, subscribe } = useNewsletterSignup({ hideBannerAfterMs: 6000 })
const { dismiss } = useMailingListBanner()
</script>
