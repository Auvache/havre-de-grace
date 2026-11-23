import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { publishedOn, today } from './letterDates'

/**
 * Which letters in content/letters/ are out on the site yet, read off disk at
 * build time. (The dates themselves are worked out in letterDates.ts.)
 *
 * The letters that aren't out are left out of the content collection
 * altogether (content.config.ts). Hiding them in the page instead would not be
 * enough: a static build ships every collection to the browser as a SQL dump
 * at /__nuxt_content/<collection>/sql_dump.txt, so a banked letter would be
 * readable weeks early by anyone who looked. A letter therefore appears on the
 * first build on or after its day, and `nuxt dev` shows them all.
 */

export interface LetterFile {
  /** Filename without `.md`, which is also the URL: /letters/<slug>. */
  slug: string
  file: string
  frontmatter: Record<string, unknown>
  /** The markdown after the front matter. */
  body: string
  publishedOn: string | null
}

export const readLetterFiles = (dir: string): LetterFile[] => {
  let files: string[]
  try {
    files = readdirSync(dir).filter((file) => file.endsWith('.md'))
  } catch {
    return []
  }

  return files.map((file) => {
    const source = readFileSync(join(dir, file), 'utf8')
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
    const frontmatter = ((match ? parseYaml(match[1]!) : null) ?? {}) as Record<string, unknown>

    return {
      slug: file.replace(/\.md$/, ''),
      file,
      frontmatter,
      body: match ? source.slice(match[0].length) : source,
      publishedOn: publishedOn(frontmatter),
    }
  })
}

export const isPublished = (letter: LetterFile, on = today()) =>
  letter.publishedOn !== null && letter.publishedOn <= on
