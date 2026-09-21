/*
 * Whether the mailing-list banner should be on screen for this visitor.
 *
 * One cookie answers it, and it holds *why* the banner is hidden rather than a
 * bare flag: a dismissal is someone saying "not now", a subscription is
 * someone who is already on the list, and the two have earned different
 * lifetimes — hence the two refs below, same cookie, different maxAge.
 *
 * The cookie is read in two places, which is deliberate. This composable is
 * the Vue-side writer. The *reader* that matters for first paint is the inline
 * script in nuxt.config: these pages are prerendered to one shared HTML file,
 * so the banner is in the markup for everybody, and only a script running
 * before the first paint can take it back out without a visible flash and a
 * jolt of layout shift. Vue is far too late for that.
 */

/** Named to sit alongside the splash screen's `hdg-splash-seen`. */
const COOKIE_NAME = 'hdg-mailing-list'

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365
const NINETY_DAYS_IN_SECONDS = 60 * 60 * 24 * 90

export type MailingListState = 'subscribed' | 'dismissed'

export const useMailingListBanner = () => {
  // Both refs are created here, in setup, rather than inside the handlers:
  // useCookie reaches for the Nuxt instance, which is only reliably there
  // during setup and not inside a click handler firing minutes later.
  const cookieOptions = {
    // Readable by the inline head script, so no httpOnly. Nothing here is
    // sensitive: it records that a banner was closed, not who closed it.
    path: '/',
    sameSite: 'lax',
    secure: !import.meta.dev,
  } as const

  const subscribed = useCookie<MailingListState | null>(COOKIE_NAME, {
    ...cookieOptions,
    maxAge: YEAR_IN_SECONDS,
  })

  const dismissed = useCookie<MailingListState | null>(COOKIE_NAME, {
    ...cookieOptions,
    maxAge: NINETY_DAYS_IN_SECONDS,
  })

  // The banner's visibility lives on <html> so that CSS can settle it before
  // the first paint, so hiding it means moving the attribute the CSS reads.
  const hide = () => {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-banner', 'hidden')
    }
  }

  return {
    /** "Not now." Comes back in 90 days rather than never. */
    dismiss: () => {
      dismissed.value = 'dismissed'
      hide()
    },

    /**
     * Already on the list, so stop asking. Called on a successful signup from
     * anywhere — the banner, the footer bar, or the subscribe page.
     *
     * `hideAfterMs` exists because the banner is the one caller that signs
     * people up *inside the thing being hidden*: hiding it the instant the
     * request returns would swallow the "check your inbox to confirm" line,
     * which is the one instruction that still needs following. The cookie is
     * written immediately either way, so a reload in the meantime is safe.
     */
    markSubscribed: (hideAfterMs = 0) => {
      subscribed.value = 'subscribed'

      if (hideAfterMs <= 0) {
        hide()
        return
      }

      const timer = window.setTimeout(hide, hideAfterMs)
      onScopeDispose(() => window.clearTimeout(timer))
    },
  }
}
