/**
 * When a letter goes up on the site. Pure date arithmetic, so the pages can use
 * it too; the build-time reading of content/letters/ is in letterSchedule.ts.
 *
 * A letter's front matter carries the day it was emailed (`date`). It goes up
 * on the site a week later, the subscribers' head start, unless `published`
 * names a different day. No `date` means it's a draft.
 */

export const SITE_DELAY_DAYS = 7

/** YAML reads an unquoted 2026-11-11 as a Date; treat both forms as a day. */
export const toDay = (value: unknown): string | null => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10)
  }
  return null
}

const addDays = (day: string, days: number) => {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** YYYY-MM-DD the letter is (or will be) on the site; null for a draft. */
export const publishedOn = (frontmatter: { date?: unknown, published?: unknown }) => {
  const sent = toDay(frontmatter.date)
  return toDay(frontmatter.published) ?? (sent ? addDays(sent, SITE_DELAY_DAYS) : null)
}

/**
 * Today in UTC, the build machine's clock on Amplify. It turns over at 4–5 pm
 * Pacific, so an evening build already counts as the next day.
 */
export const today = () => new Date().toISOString().slice(0, 10)

/** "November 11, 2026", read as the calendar day it names wherever the reader is. */
export const formatLetterDate = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
