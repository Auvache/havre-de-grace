<!--
  /contact/1 … /contact/4: four takes on a contact page that says one thing,
  that every request goes to the one address. For choosing between; unlisted
  and noindexed. Delete this file once one of them has replaced /contact.
-->

<template>
  <div>
    <ShorelineBand title="Contact" :image="false" />

    <!-- 1. One paragraph, the address inline. -->
    <div v-if="n === 1" class="reading v1">
      <p>
        For booking, press, licensing, or anything else, email
        <a :href="mailto" class="mail">{{ email }}</a>.
      </p>
    </div>

    <!-- 2. A sentence, then the address on its own line beneath it, larger. -->
    <div v-else-if="n === 2" class="reading v2">
      <p>Booking, press, licensing and questions all go to one inbox:</p>
      <a :href="mailto" class="mail">{{ email }}</a>
    </div>

    <!-- 3. The whole page is one sentence, set as a lede, centred. -->
    <div v-else-if="n === 3" class="reading v3">
      <p>
        Booking, press, licensing, a question about a song: it all goes to
        <a :href="mailto" class="mail">{{ email }}</a>
      </p>
    </div>

    <!-- 4. The address, plus the two things worth adding: what a booking
         email needs, and where the press material already is. -->
    <div v-else class="reading v4">
      <p>For booking, press, licensing, or anything else, email</p>
      <a :href="mailto" class="mail">{{ email }}</a>
      <p class="v4__more">
        For a show, include the date, the city, the venue and the kind of night it is.
        Bios and photos are in the <NuxtLink to="/press">press kit</NuxtLink>.
      </p>
    </div>

    <nav class="variants" aria-label="Contact page options">
      <NuxtLink v-for="i in 4" :key="i" :to="`/contact/${i}`" :class="{ on: i === n }">{{ i }}</NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const n = Number(route.params.variant)

if (![1, 2, 3, 4].includes(n)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const siteProfile = useSiteProfile()
const email = siteProfile.bookingEmail
const mailto = `mailto:${email}`

useHead({
  title: `Contact, option ${n}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<style scoped>
.mail {
  color: var(--deep);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.mail:hover {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

/* 1 */
.v1 p {
  font-size: 20px;
  line-height: 1.7;
}

.v1 .mail {
  border-bottom: 1px solid color-mix(in srgb, var(--deep) 35%, transparent);
}

.v1 .mail:hover {
  text-decoration: none;
  border-bottom-color: var(--deep);
}

/* 2 */
.v2 p {
  font-size: 18px;
  line-height: 1.7;
  color: var(--soft);
}

.v2 .mail {
  display: inline-block;
  margin-top: 18px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(28px, 2.6vw + 12px, 40px);
}

/* 3 */
.v3 {
  text-align: center;
}

.v3 p {
  text-wrap: balance;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(26px, 2.2vw + 12px, 36px);
  line-height: 1.45;
  color: color-mix(in srgb, var(--ink) 88%, var(--bone));
}

.v3 .mail {
  display: block;
  margin-top: 10px;
}

/* 4 */
.v4 {
  text-align: center;
}

.v4 p {
  text-wrap: balance;
}

.v4 > p:first-child {
  font-size: 18px;
  color: var(--soft);
}

.v4 .mail {
  display: inline-block;
  margin-top: 14px;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(28px, 2.6vw + 12px, 40px);
}

.v4__more {
  max-width: 460px;
  margin: 56px auto 0;
  padding-top: 28px;
  border-top: 1px solid var(--rule);
  font-size: 15px;
  line-height: 1.7;
  color: var(--soft);
}

.v4__more a {
  color: inherit;
}

/* The switcher between the options: not part of any of them. */
.variants {
  display: flex;
  justify-content: center;
  gap: 18px;
  padding: 0 24px 60px;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--faint);
}

.variants a {
  text-decoration: none;
  padding: 4px 8px;
  border-bottom: 1px solid transparent;
}

.variants a.on {
  color: var(--ink);
  border-bottom-color: currentColor;
}
</style>
