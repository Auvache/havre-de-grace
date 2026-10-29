<!--
  There is no working unsubscribe *button* here, and there can't be one.

  Kit's only unsubscribe endpoint is POST /v4/subscribers/<id>/unsubscribe,
  which needs an account API key (or an OAuth token) and a subscriber id that
  itself takes an authenticated lookup to get. This site is a static bundle on
  S3 with no server to keep a key in, so the only way to put a real button on
  this page would be to ship a full-account credential in public JavaScript —
  one that can read and edit every subscriber on the list. That is not a
  trade worth making for a link that already exists in every email.

  So the page does the two things it honestly can: point at the one-click link
  Kit puts in the footer of every send, and offer to do it by hand.
-->

<template>
  <div>
    <ShorelineBand title="Unsubscribe" image-position="center 40%" />

    <div class="reading">
      <p class="lede">No hard feelings, and no hoops. There are two ways off the list and both of them are one click.</p>

      <ol class="steps">
        <li>
          <div>
            The fastest way
            <small>
              Open any email from me and click <em>Unsubscribe</em> at the bottom.
              It takes effect immediately, there's nothing to log into, and it also
              lets you keep some emails and drop others if you'd rather do that than
              leave entirely.
            </small>
          </div>
        </li>
        <li>
          <div>
            Or just ask me
            <small>
              Can't find an email, or the link isn't working? <a :href="unsubscribeMailto">Send me a note</a>
              and I'll take you off the list myself. Write to {{ siteProfile.bookingEmail }} from the
              address you signed up with. It's a small list and I read everything that comes in.
            </small>
          </div>
        </li>
      </ol>

      <p class="fine">
        Here by mistake? <NuxtLink to="/subscribe">Back to the mailing list</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ navOver: true })

const siteProfile = useSiteProfile()

// Prefilled so the reply is a send rather than a writing task — and so the
// address it arrives from is the one that needs removing.
const unsubscribeMailto = computed(() => {
  const subject = encodeURIComponent('Unsubscribe')
  const body = encodeURIComponent(
    'Please take this address off the Havre De Grace mailing list. Thanks.',
  )

  return `mailto:${siteProfile.bookingEmail}?subject=${subject}&body=${body}`
})

const pageDescription = `How to unsubscribe from the Havre De Grace mailing list.`

usePageSeo({
  title: `Unsubscribe | Havre De Grace`,
  description: pageDescription,
})
</script>

<style scoped>
.fine {
  font-size: 15px;
  color: var(--soft);
}

.fine a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
