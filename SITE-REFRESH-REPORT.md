# Site refresh report

Run 2026-10-29, one unattended session from `SITE-REFRESH.md`. Committed to
`main`, **not pushed**.

## 1. Start here

- **Done:** every checklist item. Still Water homepage, Shoreline inner pages,
  Cinema album and song pages, the persistent player, line timings for Ghost
  and all nine tracks of *I Want to Be Yours*, and the song journey.
  `npm run generate` passes: 0 errors, 0 link warnings.
- **To look:** `npx nuxi dev --port 3100`, or `npm run generate && npx serve .output/public`.
  Screenshots of every page at 1440 and 390 px are in `docs/redesign/after/`.
- **Before you push:**
  1. **Amplify console redirects.** `/music` is the Records page again. If the
     console still has the old `/music` → `/#music` 301, delete it, or the
     Records page and the new nav link will never load. (`docs/amplify-redirects.md` is updated.)
  2. Listen through the timings at **`/tools/lyric-timing`** (section 3).
  3. Approve or change the journey snippets (section 4).

## 2. Questions for Stefan

1. **Writing stories on the album page.** The brief said "stories: none at
   launch", but four *I Want to Be Yours* songs already have your own
   `writingStory` text in the content file (title track, Shades, Scarecrow,
   Jesus Creek). They're your words, so the journey shows them under "The
   story". Keep them? To hide them, drop `story:` in
   `app/components/music/SongJourney.vue` (the `songs` computed).
   The mockup's Scarecrow note (adapted from VISION.md) is **not** used; the
   real Scarecrow story ("This song makes me think about my dad…") is.
2. **The live photo on Home and About** is `docs/redesign/mockups/img/live.jpg`
   (now `public/images/site/live-artichoke-1400.jpg`), captioned on About
   "Artichoke Music, August 2026". The context file confirms the Artichoke show
   on 13 August 2026; please confirm this photo is from it. I left "Portland"
   out of the caption because nothing in the repo says it. (`app/pages/about.vue`)
3. **The album stills in the journey.** Into the Wild's scenes use the album
   film's stills from `public/video-styles/album/` (Into the Wild, Conman,
   Ivory, Andalusia, Rocks in the Sea, Ship to Stockholm). They're still
   "motion test" stills for an unfinished film. OK to show them now? Only
   Andalusia (status "film") gets a "Watch the film" link. (`shared/data/journey.ts`)
4. **Hand-off on the album page** is on (`handOffOnSameAlbum = true` in
   `app/config/player.ts`). Flip it to `false` for "always stop".
5. **Phone lyrics on the screen.** The longest line (Sky Blue, "You give your
   life to someone else, turns out that that's enough") has to shrink to about
   9 px in Courier at 390 px to stay on one line. That's what the rule says;
   if it's too small, the alternatives are a taller screen on phones or a
   smaller tracking. (`fit()` in `app/components/music/AlbumScreen.vue`)
6. **Subscribe page copy.** Its second promise used to be "a few thoughts on
   making songs around a day job and a young family", which belonged to the
   shelved Productive Creative letter. It now reads "The story behind each one:
   where the song came from and how it got made." Your words would be better.
   (`app/pages/subscribe.vue`)

## 3. Check by ear

Open **`/tools/lyric-timing`** (dev server or static build). Pick a song; click
any line to hear it from 1.5 s before. Lines marked **check** are the least
certain; start there. Times live in each song's file in `app/config/`
(`ghostScore.ts`, `iWantToBeYoursScore.ts`, `shadesOfBlueAndRedScore.ts`,
`skyBlueScore.ts`, `scarecrowScore.ts`, `jesusCreekScore.ts`,
`demolitionWomanScore.ts`, `whiteRavenScore.ts`, `songForTheSickScore.ts`,
`iWantToBeYoursDemoScore.ts`). Each has a `TRIM` constant if a whole song runs
early or late.

**How they were made:** Demucs vocal stem → Whisper large-v3 word times on the
stem → the published lyric laid over them (`tools/captions/lyrics.py align`) →
starts snapped to where the voice comes in (`refine`) → every line start checked
against the stem's sung stretches, and the misplaced ones set by hand. Re-run
with `tools/captions/album-lines.py` then `album-score.py`. **None of it has
been checked by ear.**

**Least certain, by ear first** (all marked on the review page):

- **White Raven (live):** the opening line (the alignment stretched it over 24 s
  of guitar; set by hand to 0:29.5), both choruses (set by hand from the sung
  stretches), and especially the last "I don't think I'm coming home" (4:31.1),
  placed inside one long held stretch.
- **Demolition Woman (live):** the first "Music comes in movements / Can't let
  it slip away" (0:58.4 / 1:00.1), set by hand; plus 7 lines the alignment guessed.
- **I Want to Be Yours, demo:** the weakest alignment (15 guessed lines). Four
  set by hand: "Or I could be a heistman" 1:11.3, "Or I could rock you gently"
  1:26.5, "As you drift away to sleep" 1:29.2, "I could belong to everybody" 1:56.6.
- **Ghost:** the second "The city burns and I'm a ghost" (0:47.1, set by hand),
  and five guessed lines.
- **Jesus Creek:** "On Sunday they gather…" (1:52.2, set by hand), and six guessed.
- **Shades of Blue and Red:** eight guessed lines, mostly the "shades of blue and red" tags.
- **I Want to Be Yours, Sky Blue, Scarecrow, Song for the Sick:** 2 to 7 guessed lines each; the rest aligned cleanly.
- Where you sing something other than the published lyric, the published words
  are shown (same as the Into the Wild scores). Nothing in `content/music` was edited.

## 4. Content to approve

**Song journey snippets**, word for word from the published lyrics, all in
`shared/data/journey.ts`. A song with a picture, motif, film, story or two or
more lines gets a full scene; one line gets a quiet row.

*Into the Wild*
- **Into the Wild** (scene, still): "Oh, I'm headed out on an adventure / To see if I can't lose my way / And stumble upon all the splendorous things / The gods hid about when they made"
- **Conman** (scene, still): "I'm a conman and I'm here to steal your sound / I stick to the shadows when I follow you around"
- **Goodbye, Norma Jeane** (scene, "The single", heart motif): "Silver screen says Norma Jeane, oh / Something bigger's meant for me / With a silhouette like Juliet, oh / Someone else could cut your checks"
- **Ivory** (scene, still): "Her eyes are open ocean and blue butterfly wings / She's got some way about her when she gets on stage and sings, oh"
- **Andalusia** (scene, still, film link): "Oh, I think that I could live in Andalusia / Walk until my boots are breaking through"
- **New York** (quiet): "They say love when lost upon the rocks is best left burning out the coals"
- **Meet Me at the Horizon** (quiet): "Some nights the darkness is sweeter than others"
- **Rocks in the Sea** (scene, still): "When the road slims down and the trees hide the sound / Of hearts leaving home, there you're free"
- **Ship to Stockholm** (scene, still): "Oh, away with the land and away with the light / Tomorrow I will be a' sailing"
- **Ghost** (quiet): "The city burns and I'm a ghost"

*I Want to Be Yours and Other Songs*
- **I Want to Be Yours** (scene, sailboat motif, your story): "Yes, I could be famous / That'd sure be a chore / I could belong to everybody, but / I want to be yours"
- **Shades of Blue and Red** (scene, wave motif, your story): "Crossing the water on your way to me / Talking about all the things that we've seen"
- **Sky Blue** (quiet): "At least my shade's more like the sky when I'm sitting with you"
- **Scarecrow** (scene, moon motif, your story): "She looks like a lightning strike / Laughs with her smile but never her eyes / Darkness builds under dark gray skies / Been waiting on sunlight for more than a while"
- **Jesus Creek** (scene, church motif, your story): "Tiny log cabin down by Jesus Creek / New baby boy, it's a house without sleep, oh"
- **Demolition Woman** (quiet, "Live"): "She's a demolition woman, coming for my heart"
- **White Raven** (quiet, "Live"): "I'm just a white raven, flying through a storm"
- **Song for the Sick** (quiet): "No justice for love in a song for the sick"
- **I Want to Be Yours, demo** (quiet, "Demo"): "I could be a singer, living on the road"

**Songs that could use a story or a picture:** New York, Meet Me at the
Horizon and Ghost (stills exist for all three; I kept them quiet for rhythm);
Sky Blue, Song for the Sick, and the two live tracks (a photo from the night
they were recorded would turn them into scenes). Ghost and Meet Me at the
Horizon are the obvious next stills to promote.

## 5. What changed

| Page | Now | Screenshots |
|---|---|---|
| `/` | Still Water: the current record's cover fills the first screen; HAVRE DE GRACE, the title, one play button. Then the record with its playable track list, the pull quote, both records, Stefan, the monthly letter. | `home-desktop.jpg`, `home-phone.jpg` |
| `/music` (Records, new) | Shoreline band, each record with its own description, play, "Enter the record"; links to the record player, films, influences. `/records` redirects here. | `music-*.jpg` |
| `/about` | Woods band, your line as the lede, the bio (from `shared/data/bio.ts`), the live photo, the live video, Influences / Press kit / Contact. | `about-*.jpg` |
| `/contact` | Thank-you's layout: lede, the address, booking/press/licensing as numbered rows, elsewhere. | `contact-*.jpg` |
| `/letters`, letter pages | Lede, the underlined signup, the CSS 7-inch, the archive ("No. 1, on its way" until one is out). | `letters-*.jpg` |
| `/thank-you`, `/subscribe`, `/unsubscribe`, `/press` | Shoreline bands and reading columns. | `thank-you-*`, `subscribe-*`, `unsubscribe-*`, `press-*` |
| `/music/<album>` | Cinema: the screen (cover with a slow push for Into the Wild; the woods photo as gentle old film for I Want to Be Yours), title and play, the description, the song journey, credits, text listening links, the other record, the dock. | `music_into-the-wild-*`, `music_i-want-to-be-yours-and-other-songs-*` |
| `/music/<album>/<song>` | In the album's grade, with the dock. | `music_into-the-wild_ivory-*` etc. |
| Everywhere | Nav: records / about / contact. Footer: one line of text links. The banner strip is gone; one signup per page at most. `ScrollReveal` no longer hides anything at rest. | |
| Off the nav, still live | `/listen`, `/seven-inch`, `/influences`, `/links`, `/music-videos/*`, `/logo`, `/tools` keep their own looks with the new nav and footer. | `listen-*`, `influences-*`, `music-videos*` |

**Where things live:**
- The per-record look (palette, hero art, album-page grade, lettering, screen pictures): `app/config/records.ts`. **June 6 = add the new record there and change `CURRENT_RECORD`.**
- The player engine: `app/composables/usePlayer.ts`. The bar: `app/components/global/PlayerBar.vue` (mounted once in `app.vue`). Route rules: `app/config/player.ts`. The album dock: `app/components/music/AlbumDock.vue`.
- The screen: `app/components/music/AlbumScreen.vue`. Lyrics per album: `app/config/albumLyrics.ts`.
- The journey: `app/components/music/SongJourney.vue` and `shared/data/journey.ts`.
- New fonts: Jost 200/300, Cormorant Garamond, IBM Plex Mono 300, Sofia Sans Extra Condensed 200, Courier Prime (`nuxt.config.ts`).

## 6. Judgement calls

- Records lives at `/music`, the URL it had before 2024, rather than a new `/records`; `/records` redirects to it.
- The journey's content is a TypeScript data file (`shared/data/journey.ts`) like `bio.ts` and `letter.ts`, not new YAML fields: easier to approve in one place, and no change to the content collection's schema.
- One engine, two views: the album page's dock reads the same `usePlayer` as the bar, so the hand-off is the bar stepping aside rather than handing state across. `useAlbumPlayer` keeps only its shared helpers (`toPlayerTracks`, `formatClock`) and its types.
- The global player also stops on `/music-videos/*` and `/tools/*` (they play their own audio), not only `/listen` and `/seven-inch`.
- The bar shows on the dark non-album pages too (`/links`, `/influences`, ...), so the music can always be paused.
- A shared link to `/music/<album>#<song>` cues that song in the dock without playing; the address bar follows the playing song on album pages.
- Homepage copy beside the track list ("Ten songs, meant to be heard in order" + two sentences) is cut from the album's own description; it's `intro` in `records.ts`.
- The release line reads "The new record · 17 July 2026", from the content file.
- About's last paragraph ("A new record comes out every year on his birthday, June 6. There is no AI anywhere in the music…") is from the mockup; both facts are in VISION.md and the context file.
- The section headings, cards and rounded pills on pages I didn't rewrite (press, tools, films) are restyled globally in `main.css` rather than per page.
- Into the Wild's screen scales the cover to 1.14 (plus the push) to clear its white border; I Want to Be Yours's is a list of one slide that cross-fades every 14 s once there are more.
- A song with no timings would show its title on the screen; every song on both records now has timings, so this never shows today.
- The splash now renders the same for everyone and is hidden before first paint for returning visitors by a head script. That fixed a hydration mismatch on every page that shows it.
- Album page titles: *I Want to Be Yours and Other Songs* is set as I WANT TO BE YOURS, with "and other songs" in the meta line, as in the mockup.
- Web-sized copies of the covers and photos are in `public/images/site/` (the Into the Wild cover PNG is 5 MB).

## 7. Known issues

- **Timings not checked by ear** (section 3).
- **`/influences` on phones** asks for 150 px images the static build never generates (64 × 404 in the console). This predates the refresh; the page still works.
- Full-page screenshots show the player bar or dock partway down the page; that's how a fixed bar renders in a full-page capture, not a layout bug.
- The motifs in the journey are line drawings from `shared/video/motifs.mjs` drawn on with a stroke animation. No new motif drawings were made, and none of the album film's moving motifs (map, wall) are animated in the journey; the stills stand in for them.
- The `__hdgAudio` hook in `usePlayer.ts` exists in dev builds only, for checking that one thing plays at a time.
- `/tools/lyric-timing` is meant to be deleted once you've signed the timings off (remove the page and its lines in `nuxt.config.ts`, `usePageSeo.ts` and `modules/agent-discovery.ts`).
- Not tested: real lock-screen controls on a phone (metadata and handlers are set and checked in desktop Chrome), and Safari/Firefox.

## 8. Test results

Desktop Chrome via the Claude in Chrome extension for the player and screen
scenarios. Every page at 1440 and 390 in headless Chromium (Playwright)
against the static build, for the screenshots, the console and horizontal scroll.

| Scenario | Result |
|---|---|
| Every page, both widths: loads, no horizontal scroll, no console errors (static build) | Pass (except the pre-existing `/influences` image 404s on phones) |
| Nothing blank at rest | Pass: no reveal starts hidden; the splash is hidden before paint for returning visitors |
| 1. Hero play → bar appears, plays, hero shows pause, track highlighted | Pass |
| 2. Records → About → Letters → Contact while playing: no gap, no restart | Pass (time ran 0:10 → 0:24 continuously) |
| 3. Previous / next / pause / close on the bar | Pass |
| 4. Playing → `/listen`: bar fades, sound stops | Pass (volume ramped to 0 over about 320 ms, then paused). `/seven-inch`: pass |
| 5. Playing *Into the Wild* → its album page: same song, same second, bar fades, dock takes over | Pass (same source; time carried on) |
| 6. Playing *Into the Wild* → *I Want to Be Yours* page: fades and stops | Pass |
| 7. Back / forward after these | Pass; nothing restarts on its own |
| 8. Never two at once | Pass: one engine element; every page with its own sound stops it |
| Media Session metadata (title, artist, album, artwork) | Pass |
| Screen: silent loop before play, no lyrics | Pass |
| Screen: lines land on the sung words | Shows the score's line at the score's time (checked at Into the Wild 0:16.6, I Want to Be Yours 0:18.3, New York 0:22.5, Sky Blue 1:48.5). Whether those times are right is for your ears (section 3) |
| Seek: lyrics follow at once | Pass (the clock snaps on any jump over 150 ms) |
| One line always, longest line per album, both widths | Pass (New York 73 chars; Sky Blue 65 chars in Courier) |
| *I Want to Be Yours* film is gentle: no shake | Pass: a slow push, a 0.6 px drift, a breathing fade, slow grain, dust; no gate weave or flicker |
| Reduced motion | Pass: no push, drift or grain; lines fade in whole; no journey parallax |
| `npm run generate` | Pass: 261 routes, 0 errors, 0 link warnings |

## 9. Commits

```
48a6c5d Test the refresh at desktop and phone width and fix what turned up
3891b3d Add the song journey, Cinema song pages, and a page for checking the timings by ear
379fd54 Time Ghost and I Want to Be Yours line by line, and build the Cinema album pages
dc0214b Move the inner pages to Shoreline: About, Contact, Letters, Thank-you, Subscribe, Unsubscribe, Press
4dece95 Rebuild the light side's foundation: record palette, nav, footer, Still Water homepage, Records
45ab94c Start the site refresh: time album tracks line by line from the vocal stem
```

Plus the commit that adds this report.
