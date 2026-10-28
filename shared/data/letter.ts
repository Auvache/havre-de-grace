/**
 * What the mailing list offers, in one place, so every signup on the site
 * makes the same promise: /links, /subscribe, /letters, the banner and the
 * footer.
 *
 * The song is the offer, because it's what someone who just heard a clip came
 * for. The letter is what arrives every week. Both have to stay true: say a
 * week here only while a letter really does go out every week.
 */
export const letter = {
  name: 'The Productive Creative',
  /** The promise, as a heading. */
  offer: 'A campfire song every month',
  /** The line under it. */
  offerDetail: 'Unreleased, one take, sent to the list before anywhere else. Plus a short letter from me every week on making songs around a full life.',
  /** For the one-line spaces: the banner, the footer label. */
  offerShort: 'A campfire song every month, and a short letter every week.',
} as const
