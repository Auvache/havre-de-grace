# Site refresh: run to completion

You are one Claude Code session, started by Stefan and left alone overnight.
Your job is to build the whole site refresh described here, test it thoroughly
in Chrome, and leave a report. Stefan will read the report and check the work
locally in the morning. He is not available while you run.

**Do not stop until every box in the checklist below is ticked and the report
is written.** Do not end your turn to ask a question. Don't wait for approval.
When you would normally ask, make the call, write it down, and keep going.

Written 2026-10-29 from a long design session with Stefan. The design history,
mockups and per-area briefs are in `docs/redesign/`. Where this file and
`docs/redesign/` disagree, this file wins.

---

## 1. Rules for the run

1. **Keep going.** Work through the phases in order until the checklist is
   done. If something blocks you, work around it, note it in the report, and
   move on. Come back to it at the end if there is time.
2. **No questions mid-run.** Put every question for Stefan in the report's
   "Questions for Stefan" section, with the call you made in the meantime.
3. **Make judgement calls and be bold.** Stefan's words: "do what you can, be
   bold, we can always fix things later." Pick the option that best fits the
   mockups and the brand principles (section 4). Log each non-obvious call in
   the report's "Judgement calls" section, one line each.
4. **Timebox rabbit holes.** If one problem has eaten about 45 minutes without
   real progress, ship the simplest version that works, log it under "Known
   issues", and move on.
5. **Commit as you go, straight to `main`, in the main checkout.** That is
   Stefan's standing rule for this repo. Commit at least at the end of every
   checklist item, with real commit messages in the repo's style (see
   `git log`), ending with the Co-Authored-By line. Commit anything already
   uncommitted first, as its own commit, before you change anything.
6. **Never push. Never deploy.** Pushing `main` deploys the live site through
   AWS Amplify. Stefan pushes after he has looked.
7. **Never submit the signup forms** with any address. Kit is live. Restyle
   the forms; don't test the Kit flow.
8. **Never invent facts about Stefan** (places, dates, people, stories,
   gear). Real copy comes from `shared/data/`, `content/music/*.yml`,
   `VISION.md` and `HAVRE_DE_GRACE_CONTEXT.md`. Placeholder copy never ships.
9. **No AI imagery.** The brand's line is "no AI in the music", and the site
   uses no AI-generated images or video. Use the real photos in `public/`,
   frames from `exports/*.mp4`, and the SVG films and motifs in
   `shared/video/`.
10. **Don't break URLs.** Every page that exists today must still load. If you
    move something, add a redirect (see `docs/amplify-redirects.md`). Keep
    every page's SEO and schema calls (`usePageSeo`, `useSchemaOrg`).
11. **Stay inside this repo.** Don't touch `~/stefan/videos` or anything
    outside the repo except your scratchpad and the Python venv you make.

### If your context gets compacted or the session restarts

Read this file from the top. The checklist in section 2 is the source of truth
for where you are, because you tick it and commit it as you go. Then run
`git log --oneline -30` and carry on from the first unticked item.

---

## 2. Checklist

Tick each box (`- [x]`) in this file and commit it with the work it describes.

**Phase 0: Setup**
- [x] Commit anything uncommitted, as its own commit
- [x] Read section 3 and `docs/redesign/README.md`, and open the mockups in
      `docs/redesign/mockups/` in Chrome
- [x] Start the dev server on port 3100 (see section 6) and confirm Chrome works
- [x] Start lyric timing for *Ghost* and *I Want to Be Yours* in the background
      (phase 3); it runs while you do phases 1 and 2

**Phase 1: Foundation and light pages** (`docs/redesign/briefs/1-foundation.md`)
- [x] Tokens and per-record config (palette, hero art) in one place
- [x] Nav: records / about / contact
- [x] Footer: one line of text links
- [x] Homepage in Still Water (`mockups/home.html`)
- [x] Records page (`mockups/records.html`)
- [x] About (`mockups/about.html`)
- [x] Contact (Thank-you's layout)
- [x] Letters index and letter page (`mockups/letters.html`)
- [x] Thank-you (`mockups/thanks.html`)
- [x] Every other light page gets the new nav, footer and tokens: press,
      subscribe, unsubscribe, the song pages if they stay light, anything else
      on `layouts/default.vue`

**Phase 2: Persistent player** (`docs/redesign/briefs/2-player.md`)
- [x] One global audio engine, built from or around `useAlbumPlayer`
- [x] The bar, mounted once, surviving navigation; phone layout
- [x] Record player pages fade it out and stop it
- [x] Album pages: different record → fade and stop; same record → hand off
- [x] Media Session metadata and controls

**Phase 3: Lyric timing** (`docs/redesign/briefs/4-timing.md`)
- [x] *Ghost*
- [x] All nine tracks of *I Want to Be Yours and Other Songs*
- [x] A review page or captioned previews for Stefan to check by ear, plus
      the list of least-certain lines in the report

**Phase 4: Album pages and the screen** (`docs/redesign/briefs/3-album-screen.md`)
- [x] Cinema page shell for both albums, replacing today's album pages
- [x] The screen: per-album picture loop, silent before play
- [x] Line-by-line lyrics in sync, small, centred, always one line
- [x] The page's own dock and the hand-off from the global bar
- [x] Song pages (`/music/<album>/<song>`) restyled to match their album

**Phase 5: Song journey** (`docs/redesign/briefs/5-journey.md`)
- [x] Content model and drafted snippets for both albums
- [x] Scroll-driven parallax scenes, with stills and motifs where they exist
- [x] Quiet rows for songs with little content

**Phase 6: Test everything** (section 5)
- [ ] `npm run generate` passes
- [ ] Desktop Chrome pass: every page, every scenario in section 5
- [ ] Phone-width pass (390 px) on every page
- [ ] Fix what the passes found, then re-check those pages

**Phase 7: Report**
- [ ] `SITE-REFRESH-REPORT.md` written (section 7), screenshots in
      `docs/redesign/after/`, all committed

---

## 3. What to build (final decisions)

The full reasoning is in `docs/redesign/README.md`; this section is the
decisions you need, with the ones made after that file was written.

**Three looks.**
- **Homepage, Still Water.** The current record's cover is the whole first
  screen: HAVRE DE GRACE small and spaced, the record title in Cormorant
  italic, one play button. Below it: the record with its track list, a lyric
  pull quote, both records, Stefan, the monthly letter, footer.
  (`mockups/home.html`, `shots/home*.jpg`)
- **Inner pages, Shoreline.** A short photographic band with the title in thin
  spaced capitals over it, then one calm reading column.
  (`mockups/records.html`, `about.html`, `letters.html`, `thanks.html`)
- **Album pages, Cinema.** Dark, with a per-album colour grade. A screen at the
  top, then the song journey, credits, quiet listening links, the other
  record. (`mockups/album-itw.html`, `album-iwtby.html`)

**Everywhere.**
- Light pages are always light, with no dark mode. Album pages are dark.
- Nav: records / about / contact, and nothing else. Letters is linked from the
  footer and the homepage signup and has its own page. Listen, press,
  influences, music videos and links stay live but leave the nav; link to them
  from inside pages (Records links the record player and the films; About links
  influences and the press kit).
- Footer: text links only (Spotify, Apple Music, Bandcamp, YouTube, Instagram,
  letters) and the place. No coloured platform icons.
- Type: Jost 200–400 for structure; Cormorant Garamond italic for titles,
  lyrics and pull quotes; IBM Plex Mono for times only.
- Palette (Into the Wild year): ink `#1d232a`, bone `#f3f1ec`, sea `#6f8299`,
  deep `#3f5670`, mist `#e3e8ec`. Every June 6 the palette and hero art switch
  to the new record. Make that one config entry.
- The anchor is permanent. The sea belongs to Into the Wild.
- One signup per page at most. Remove the extra `NewsletterBanner` from inner
  pages.
- Pages must be readable at rest: anything that animates in starts from a
  visible state. On 2026-10-29 `/thank-you` and `/music/into-the-wild` showed
  blank in a headless browser until `ScrollReveal` fired; don't repeat that.

**The persistent player.**
- A 68 px bar fixed to the bottom of every light page. Bone at about 88% with
  a blur, hairline top border, and a 2 px sea progress line on its top edge.
- Left: 40 px cover, song, record. Centre: previous, play/pause (36 px outlined
  circle), next. Right: time (mono), "open the record", close ×. Phone: song
  and play/pause only.
- Music keeps playing across navigation. It only ever starts from a click.
- `/listen` and `/seven-inch`: the bar fades out in about 300 ms and the sound
  stops.
- An album page for a different record: fade out and stop.
- An album page for the same record: hand off. The album page's dock takes the
  same song at the same second, and the bar fades under it. Keep this behind
  one switch (`handOffOnSameAlbum`) so "always stop" is a one-line change.
- × stops playback and hides the bar until the next play.

**Album screen.**
- Drawn live in the browser, not a video file. The picture loops on its own
  clock. The lyrics follow the audio clock (`app/utils/mediaClock.ts`), so the
  loop can be any length.
- Before play: the picture loops silently, no lyrics. After play: the whole
  record runs on the screen, track by track, following the player.
- *Into the Wild*: the cover, calm, slow push-in, no grain, scaled past the
  cover's white border, like the homepage hero. (The album film comes later;
  it is out of scope.)
- *I Want to Be Yours*: `public/press/media-pic-wide.jpg` as old film. Sepia
  and fade, slow grain, a few drifting dust specks, a breathing fade, a slow
  push-in and a sub-pixel drift, a vignette. **Gentle.** No jittery gate weave
  or hard flicker; Stefan found the shake unsettling. Build it as a slideshow
  of one so more photos are a data change.
- **Lettering, decided:** *Into the Wild* uses option 2, narrow hairline (Sofia
  Sans Extra Condensed, weight 200, uppercase, about 0.08em tracking), wiped on
  left to right. *I Want to Be Yours* uses option 3, Courier Prime, typed
  letter by letter. Both are in `mockups/lyric-styles.html`; lift the code.
- Lyrics are small but readable, centred in the middle of the screen, and
  **always one line**. Size from the screen width and shrink a line that would
  overflow. Never wrap, on phones too. No cursive anywhere.
- Each line writes across the time it's sung, holds until the next line or 1.6
  s past its end, then fades over 0.6 s. A song without timings shows its
  title instead.
- Pause the picture when the screen is off-screen or the tab is hidden.
  Reduced motion: no grain, drift or push; lines fade in whole.

**Song journey** (below the screen).
- A parallax journey through the songs that people scroll at their own pace.
  It is not synced to the music.
- Per song: lyric snippets, stories (only Stefan's, so none at launch),
  pictures, small animations. Whole lyrics aren't needed.
- A song with something to show gets a full scene; a song with only a snippet
  gets a quiet row. Nothing should look empty or padded.
- The music keeps playing while people scroll; each scene can play its song
  in the page dock.

**Copy.** Presence over persuasion: no exclamation marks, no urgency, no
"don't miss". Plain, short sentences. The Andalusia "story" box in the mockup
is a placeholder and must not ship.

---

## 4. Brand principles for judgement calls

From `HAVRE_DE_GRACE_CONTEXT.md` and `VISION.md`. Use them to decide anything
this file doesn't cover.

- Presence over persuasion. Show the work and don't sell it.
- DIY, unpolished, honest. Raw beats glossy.
- Some mystery: show the music, don't over-explain it.
- The music comes first. When in doubt, make it easier to press play.
- The body of work matters more than any one release.
- Restraint: one bold thing per page, everything around it quiet.

---

## 5. Testing

Test in **desktop Google Chrome** through the Claude in Chrome extension.
Browser use is pre-authorised in this repo; never use Brave. If the extension
isn't connected or stops responding after two or three tries, don't wait: use
the Playwright MCP tools (headless Chromium) for the rest of the run and say so
in the report. Don't let the browser be the thing that stops you.

Test against the dev server while building, and against the static build
(`npm run generate`, then serve `.output/public`) in the final pass, because
Amplify ships the static build.

**Every page, at 1440 × 900 and at 390 × 844:**
- `/` (homepage), the records page, `/about`, `/contact`, `/letters` and a
  letter page if any exist, `/thank-you`, `/subscribe`, `/unsubscribe`,
  `/press`
- `/music/into-the-wild` and `/music/i-want-to-be-yours-and-other-songs`, and
  two song pages per album
- Pages off the nav that must still work: `/listen`, `/seven-inch`,
  `/influences`, `/links`, `/music-videos` and one film page, `/logo`, `/tools`
- For each: it matches its mockup where one exists; nothing is blank at rest,
  overlapping or clipped; no horizontal scroll; no console errors; the nav and
  footer are right.

**Player scenarios (desktop):**
1. Homepage hero play → bar appears, song plays, hero shows pause, the
   playing track is highlighted in the track list.
2. Navigate Records → About → Letters → Contact while it plays: no gap, no
   restart.
3. Previous / next / pause / close on the bar.
4. Playing → open `/listen` → bar fades out, sound stops. Same for
   `/seven-inch`.
5. Playing *Into the Wild* → open `/music/into-the-wild` → hand-off: same song,
   same second, the bar fades, the page dock takes over.
6. Playing *Into the Wild* → open the *I Want to Be Yours* page → fades and
   stops.
7. Back button after each of the above.
8. Nothing ever plays twice at once (check for two audio sources).

**Album screen:**
- Silent loop before play, with no lyrics.
- After play, the lines land on the sung words. Spot-check three songs per
  album at the start, middle and end of each.
- Seek with the dock: the lyrics follow at once.
- One line always, including the longest line on each album, at both widths.
- The *I Want to Be Yours* film is gentle: no shake.
- Reduced motion (emulate it in DevTools) behaves as specified.

Save screenshots of every page at both widths to `docs/redesign/after/`
(JPEG, about 80% quality, so the repo doesn't balloon).

---

## 6. Environment notes

- Node 24+. `npm run dev`, `npm run generate`. Use `npx nuxi dev --port 3100`.
  Stefan may have his own dev server running on 3000; leave it alone.
- The site is Nuxt 4 (SSG) with `@nuxt/content`, Tailwind, `@nuxt/fonts`
  (see the weight notes in `nuxt.config.ts`) and `@nuxtjs/seo`.
- Existing pieces to build on: `useAlbumPlayer`, `useVinylDeck`,
  `useDemoPlayer`, `app/utils/mediaClock.ts`, `usePageTheme`,
  `app/config/pageThemeConfig.ts`, `app/config/navLinks.ts`,
  `components/global/*`, `components/home/*`, `layouts/*`, the Score files in
  `app/config/*Score.ts`, and `shared/video/` for motifs.
- **Lyric timing tools:** `tools/captions/lyrics.py` (Whisper word timestamps,
  then align and refine), `tools/captions/onsets.py`, and
  `tools/video-styles/live-align.py` for live takes. Python packages aren't
  system-wide. Make a venv in your scratchpad:
  `python3 -m venv $SCRATCH/venv && $SCRATCH/venv/bin/pip install faster-whisper demucs soundfile numpy scipy`.
  Model downloads take a while; start them in the background in phase 0. If
  Demucs or Whisper won't install or run, time lines from the vocal energy
  and onsets alone, mark every line as low confidence, and keep going.
- Audio: `public/albums/<album>/music/*.mp3`. Lyrics: `content/music/*.yml`.
- If `npm run generate` fails, read the error before guessing. Amplify runs the
  same build.

---

## 7. The report

Write `SITE-REFRESH-REPORT.md` in the repo root. Stefan reads it first thing,
so lead with what he needs to do.

1. **Start here.** Three to five lines: what's done, how to look
   (`npx nuxi dev`, or `npm run generate && npx serve .output/public`), and
   anything that needs him before he pushes.
2. **Questions for Stefan.** Most important first. Each one says the call you
   made in the meantime and where in the code it lives.
3. **Check by ear.** The lyric timings that need his ears: which songs, the
   review page or previews, the least-certain lines.
4. **Content to approve.** The drafted lyric snippets for the journey, per
   song. Songs that could use a story or a picture.
5. **What changed,** page by page, with screenshots from
   `docs/redesign/after/` linked.
6. **Judgement calls.** One line each.
7. **Known issues** and anything you timeboxed.
8. **Test results:** the scenarios in section 5, pass or fail, with notes.
9. **Commits:** `git log --oneline` for the run.

Then tick the last box, commit, and stop.
