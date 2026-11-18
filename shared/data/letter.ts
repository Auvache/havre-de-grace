/**
 * What the mailing list offers, in one place, so every signup on the site
 * makes the same promise: the home page, /links, /subscribe and /thank-you.
 *
 * The one promise is the welcome 7-inch: two unreleased demos from the next
 * album (pages/seven-inch.vue). After that, occasional updates: shows, merch,
 * new music and what I'm working on. Never on a schedule, so the list never
 * owes anyone an email.
 *
 * History: until 29 Oct 2026 this was The Productive Creative, a weekly letter
 * on making songs around a full life (shelved: people who came for the music
 * got essays). Until 17 Nov 2026 the offer was "something new to listen to
 * every month", then "a monthly newsletter about what I'm working on and why".
 * On 18 Nov 2026 the newsletter and its /letters archive were retired: no
 * letter was ever sent, and a monthly letter was one more thing to keep up.
 */
export const letter = {
  name: 'Mailing list',
  /** The promise, as a heading. */
  offer: 'Join the mailing list',
  /** The line under it. */
  offerDetail: 'Listen to a pair of unreleased demos from my next album (plus get updates on music, merch, and shows).',
} as const
