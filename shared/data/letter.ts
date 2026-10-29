/**
 * What the mailing list offers, in one place, so every signup on the site
 * makes the same promise: /links, /subscribe, /letters, the banner and the
 * footer.
 *
 * The recordings are the offer, because they're what someone who just heard a
 * clip came for. Once a month there's something new to listen to, and a demo or
 * an idea in progress counts, so the promise holds even in a month without a
 * finished song. Never promise a finished song a month. (Until 29 Oct 2026 this
 * was The Productive Creative, a weekly letter on making songs around a full
 * life. It's shelved: people who came for the music got essays.)
 */
export const letter = {
  name: 'Letters',
  /** The promise, as a heading. */
  offer: 'Unreleased songs and demos',
  /** The line under it. */
  offerDetail: 'Every month, something new to listen to: a demo, an idea I\'m working on, or a song that isn\'t out yet, and the story behind it.',
  /** For the one-line spaces: the banner, the footer label. */
  offerShort: 'Unreleased songs and demos, something new every month.',
} as const
