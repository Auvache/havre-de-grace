/*
 * The Kit (ConvertKit) signup request, shared by the three places that ask for
 * an email address: the banner, the footer bar, and the subscribe page.
 *
 * It posts straight to Kit's public form endpoint, so there is no API key, no
 * server route, and no environment secret — which is what lets it work at all
 * from a static bundle with no backend. The endpoint answers
 * `access-control-allow-origin: *`, so the response is readable cross-origin
 * from havredegracemusic.com.
 *
 * Each caller gets its own state: two of these render on the same page, and a
 * success in the footer should not blank out the banner mid-sentence.
 */

/** From the form's embed code: action="https://app.kit.com/forms/<id>/subscriptions". */
const KIT_FORM_ID = '6848668'

export const KIT_FORM_URL = `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`

export type SignupStatus = 'idle' | 'loading' | 'success' | 'error'

export interface NewsletterSignupOptions {
  /**
   * How long to leave the banner up after a success before hiding it. Only the
   * banner passes this; see markSubscribed in useMailingListBanner.
   */
  hideBannerAfterMs?: number
}

export const useNewsletterSignup = (options: NewsletterSignupOptions = {}) => {
  const { markSubscribed } = useMailingListBanner()

  const email = ref('')
  const website = ref('') // honeypot: humans never see or fill this
  const status = ref<SignupStatus>('idle')

  const subscribe = async () => {
    if (website.value) {
      status.value = 'success' // pretend it worked for bots
      return
    }

    status.value = 'loading'

    try {
      const res = await fetch(KIT_FORM_URL, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams({ email_address: email.value.trim() }),
      })

      if (res.ok) {
        status.value = 'success'
        // They're on the list now (pending confirmation), so the banner has
        // nothing left to ask for on any page from here on.
        markSubscribed(options.hideBannerAfterMs ?? 0)
        return
      }

      status.value = 'error'
    }
    catch {
      status.value = 'error'
    }
  }

  return { email, website, status, subscribe }
}
