/**
 * What the mailing list offers, in one place, so every signup on the site
 * makes the same promise: /links, /subscribe, /thank-you and the foot of each
 * letter.
 *
 * The promise is a monthly newsletter about what I'm working on and why. Keep
 * it that small: no promise of a recording, a demo or a new song each month,
 * so the promise holds in a month with nothing to play. A recording can turn
 * up in a letter, but it's a bonus, never the offer. The one recording a
 * subscriber is promised is the welcome 7-inch. (Until 29 Oct 2026 this was
 * The Productive Creative, a weekly letter on making songs around a full life.
 * It's shelved: people who came for the music got essays. Until 17 Nov 2026
 * the offer was "something new to listen to every month", narrowed because
 * that's a recording a month to keep up with.)
 */
export const letter = {
  name: 'Letters',
  /** The promise, as a heading. */
  offer: 'Join the newsletter',
  /** The line under it. */
  offerDetail: 'A monthly newsletter about what I\'m working on and why.',
} as const
