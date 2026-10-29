# Brief 1: Foundation and light pages

Read `docs/redesign/README.md` first.

## Goal

Rebuild the light side of the site in the Still Water / Shoreline look:
tokens, nav, footer, the homepage, and the inner pages. When this lands, every
light page should look like `docs/redesign/mockups/` and nothing should look
like the old template (all-caps Jost section headings, rounded photo cards,
centred ABOUT / LISTEN / DISCOGRAPHY blocks, coloured platform icons).

## Scope

- **Tokens.** Replace the light theme in `app/assets/css/themes.css` /
  `main.css` with the README's palette and type. One per-record config
  (palette + hero image) so next June's re-skin is a data change. Look at
  `app/config/pageThemeConfig.ts` and `usePageTheme` before inventing anything.
- **Nav** (`AppNavbar.vue`, `MobileNavOverlay.vue`, `app/config/navLinks.ts`):
  anchor + HAVRE DE GRACE left, records / about / contact right. Over a photo
  band it sits on the image in white.
- **Footer** (`AppFooter.vue`): one line of text links (Spotify, Apple Music,
  Bandcamp, YouTube, Instagram, letters), place, nothing else. Leave room at
  the bottom for brief 2's 68 px player bar (`padding-bottom` on the layout).
- **Homepage** (`app/pages/index.vue`, `components/home/*`): match
  `mockups/home.html`. The hero is the current record's cover, full-bleed,
  scaled past its white border. Its play button should call into brief 2's
  player; until that exists, wire it to a stub composable with the same shape
  (`usePlayer().playAlbum(slug, trackIndex?)`) and say so in your summary.
- **Shoreline pages:** Records (new, at `/music` or wherever the current
  discography lives — check `app/pages/music/index.vue` and redirects in
  `docs/amplify-redirects.md`), About, Contact, Letters (`app/pages/letters/`),
  Thank-you (`app/pages/thank-you.vue`), Subscribe/Unsubscribe if they exist
  in the same template. Match `mockups/records.html`, `about.html`,
  `letters.html`, `thanks.html`. Contact follows Thank-you's layout.
- **The 7-inch on Letters** is a small CSS record (see the mockup); it can link
  to `/seven-inch` once someone has subscribed, but the signup is the action.
- **Signup forms** keep their current behaviour (`useNewsletterSignup`,
  `NewsletterSignup.vue`, Kit). Restyle to the underline field. Remove the
  extra `NewsletterBanner` from inner pages; one signup per page at most.

## Also check

- `/thank-you` and `/music/<album>` rendered blank in a headless browser on
  2026-10-29 until their `ScrollReveal` fired. Whatever you build must be
  readable with JavaScript slow or off: reveal from a visible resting state.
- SEO: keep every page's `usePageSeo` / schema calls intact.
- Phone width (390 px) for every page.

## Don't touch

`app/pages/music/[slug]/*` (brief 3), anything audio (brief 2),
`app/config/*Score.ts` (brief 4).

## Done when

Every light page matches its mockup on desktop and phone, `npm run generate`
passes, and screenshots of each page at 1440 and 390 are in your summary.
