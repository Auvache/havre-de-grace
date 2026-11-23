/**
 * What the mailing list offers, in one place, so every signup on the site
 * makes the same promise: the home page, /links, /subscribe, /letters,
 * /thank-you and the foot of each letter.
 *
 * The promise: the welcome 7-inch (two unreleased demos from the next album,
 * pages/seven-inch.vue), then letters: new songs and the stories behind them.
 * A letter is one cohesive email: a song, the story behind it, music that has
 * moved me lately, and a note on the making. The private aim is at least one a
 * month, in a window rather than on a fixed day, with room for an extra when
 * something happens (a release, show dates). The public copy names no cadence
 * (23 Nov 2026: "Follow Havre De Grace" in place of "about once a month").
 * The song can come from the bank of campfire recordings or a released song's
 * untold story, so a month with no new recording still has a letter.
 *
 * History: until 29 Oct 2026 this was The Productive Creative, a weekly letter
 * on making songs around a full life (shelved: people who came for the music
 * got essays). Until 17 Nov 2026 the offer was "something new to listen to
 * every month", then "a monthly newsletter about what I'm working on and why".
 * On 18 Nov 2026 the newsletter and /letters were retired for "shows, merch and
 * new music, never on a schedule". On 23 Nov 2026 the monthly letter came back
 * as the list's core, songs and stories first. Judge it at the quarterly
 * review, not week to week.
 */
export const letter = {
  name: 'Letters',
  /** The promise, as a heading. */
  offer: 'Follow Havre De Grace',
  /** What the letters are: the home page's heading over the signup. */
  headline: 'New songs and the stories behind them',
  /** The line under the headline. It starts mid-sentence, so alone it needs `pitch`. */
  offerDetail: 'plus two otherwise unreleased demos from my next album.',
} as const

/**
 * Headline and detail as one sentence, for anywhere the detail stands alone:
 * "Get new songs and the stories behind them, plus two otherwise unreleased…"
 */
export const pitch = `Get ${letter.headline.charAt(0).toLowerCase()}${letter.headline.slice(1)}, ${letter.offerDetail}`
