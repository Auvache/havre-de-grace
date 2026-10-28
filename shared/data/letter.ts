/**
 * What the mailing list offers, in one place, so every signup on the site
 * makes the same promise: /links, /subscribe, /letters, the banner and the
 * footer.
 *
 * The recordings are the offer, because they're what someone who just heard a
 * clip came for. The letter is what arrives every week. Both have to stay true,
 * so nothing here names a cadence for the recordings: they go out when there's
 * one ready. Say a week only while a letter really does go out every week.
 */
export const letter = {
  name: 'The Productive Creative',
  /** The promise, as a heading. */
  offer: 'Unreleased songs and demos',
  /** The line under it. */
  offerDetail: 'Recordings that aren\'t out anywhere else, sent to the list first. Plus a short letter from me every week on making songs around a full life.',
  /** For the one-line spaces: the banner, the footer label. */
  offerShort: 'Unreleased songs and demos, and a short letter every week.',
} as const
