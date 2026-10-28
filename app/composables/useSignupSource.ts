/*
 * Which platform a visitor came from, so a mailing-list signup can say so.
 *
 * Each profile links to its own URL (/youtube, /tiktok, /instagram, and
 * /shows for the QR code at gigs: routeRules in nuxt.config), and each of
 * those lands on /links?from=<source>. The
 * signup-source plugin reads that parameter on arrival and keeps it here.
 * It's a cookie rather than the URL because people don't always sign up on the
 * page they land on: they wander the site first, or come back a few days later.
 * useNewsletterSignup sends it to Kit as the `source` custom field.
 *
 * The latest arrival wins. Someone who found the music on TikTok and finally
 * signed up after a YouTube Short counts as YouTube.
 */

/** Named to sit alongside `hdg-mailing-list` and `hdg-splash-seen`. */
const COOKIE_NAME = 'hdg-from'

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30

const SIGNUP_SOURCES = ['youtube', 'tiktok', 'instagram', 'shows'] as const

export type SignupSource = typeof SIGNUP_SOURCES[number]

/** Only these values are kept, so a hand-edited `?from=` can't put junk in Kit. */
export const isSignupSource = (value: unknown): value is SignupSource =>
  SIGNUP_SOURCES.includes(value as SignupSource)

export const useSignupSource = () =>
  useCookie<SignupSource | null>(COOKIE_NAME, {
    path: '/',
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: THIRTY_DAYS_IN_SECONDS,
  })
