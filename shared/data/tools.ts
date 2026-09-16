/**
 * The /tools index — the private workbench behind the public site.
 *
 * Nothing here is linked from the navigation, the footer, the sitemap, the
 * markdown mirrors or llms.txt. The routes are `noindex, nofollow` and are held
 * out of modules/agent-discovery.ts, so the only way in is typing the URL.
 * That is the whole access model: these pages are unlisted, not authenticated,
 * because the site is a static bundle on S3 with nothing to authenticate
 * against. Anything that would actually matter if a stranger loaded it does not
 * belong on one of these pages.
 *
 * Adding a tool is a row here plus a page under app/pages/tools/, and a line in
 * the `/tools/**` prerender list in nuxt.config.ts so the URL exists as a real
 * document on a static host.
 */
export interface ToolEntry {
  to: string
  label: string
  description: string
  /** Shown in place of a real status when the thing is not finished yet. */
  status?: string
}

export const toolEntries: ToolEntry[] = [
  {
    to: '/tools/demos',
    label: 'demos',
    description:
      'Every working file in public/demos, grouped into playlists. Built for A/B: takes stay loaded once touched, the playhead carries across a switch, and the running order can be rearranged on the spot.',
  },
]
