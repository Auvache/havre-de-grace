# Site redesign, autumn 2026

The decisions behind the overhaul, and the briefs for the sessions building it.
Agreed with Stefan on 2026-10-29. Read this whole file before starting any brief.

Gallery of every round, with live lyric demos:
https://claude.ai/artifact/Xo7ZHtqQcY61MSwwep2pKB (private to Stefan; read it
with the Artifact tool's `read` action if you have access, otherwise use the
copies in `mockups/`).

## What was decided

**Three looks, one site.**

| Pages | Look | Mockup |
|---|---|---|
| Homepage | *Still Water*: the current record's cover fills the first screen with one play button; then track list, a lyric, both records, Stefan, the letter | `mockups/home.html` |
| Records, About, Contact, Letters, Thank-you (and future inner pages) | *Shoreline*: a short photographic band with the title in thin spaced capitals, then one calm reading column | `mockups/records.html`, `about.html`, `letters.html`, `thanks.html` |
| Album pages (`/music/<album>`), replacing today's | *Cinema*: dark; a "screen" at the top, then a free-scrolling journey through the songs | `mockups/album-itw.html`, `album-iwtby.html` |

- **Always light**, except album pages, which are dark. No dark mode on the light pages.
- **Nav:** records / about / contact. Nothing else. Letters is linked from the
  footer and from the homepage's signup, and has its own page.
- **Footer:** text links only, no coloured platform icons.
- **Type:** Jost (200–400) for everything structural; Cormorant Garamond italic
  for titles, lyrics and pull quotes. IBM Plex Mono only for times.
- **Palette (Into the Wild year):** ink `#1d232a`, bone `#f3f1ec`, sea `#6f8299`,
  deep `#3f5670`, mist `#e3e8ec`. Every June 6 the palette and hero art change
  to the new record's. Put the per-record values in one place so that's a
  config change.
- **The anchor is permanent.** The sea is Into the Wild's, not the brand's.
- **Copy:** presence over persuasion. No exclamation marks, no "don't miss",
  no pushing. Mockup copy marked as placeholder (the Andalusia story box) needs
  Stefan's words; real copy (bio, album descriptions, credits, lyrics) comes
  from `shared/data/` and `content/music/`.

**The persistent player.** A slim bar (68 px) fixed to the bottom of every
light page: cover, song and record left; previous / play-pause / next centre;
time, "open the record" and close right; a 2 px progress line along its top
edge. On phones: song plus play-pause only. Music keeps playing across
navigation.
- On a record player page (`/listen`, `/seven-inch`): the bar fades out
  quickly (~300 ms) and the sound stops.
- On an album page for a **different** record: it fades out and stops.
- On an album page for the **same** record: hand off, don't stop. The album
  page's own dock takes the same song at the same second and the bar fades
  under it. (Stefan was unsure; this is the recommendation. Keep it a single
  switch so "always stop" is a one-line change.)
- Close (×) stops playback and hides the bar until the next play.

**Album pages.**
- **The screen** at the top plays the whole record: a picture treated per album,
  with the current lyric line written in the centre, in sync with the audio.
  - Before play it loops silently, no lyrics. The loop's length doesn't matter;
    the words follow the audio clock (`app/utils/mediaClock.ts`), not the loop.
  - *I Want to Be Yours*: the woods photo (`public/press/media-pic-wide.jpg`)
    as old film: faded, grainy, slight flicker and gate weave, slow push-in.
    Becomes a slideshow when more photos exist; build it as a list of one.
  - *Into the Wild*: the cover, calm, like the homepage hero, until its
    album film is finished (later, separate work).
  - Lyrics are timed **line by line** for every song. Each line writes itself
    across the time it's sung, holds, fades. The lettering may differ between
    albums; each album page is its own cohesive thing.
  - **Lettering rules (Stefan, 2026-10-29):** no cursive. Lyrics are small but
    readable, centred in the middle of the screen, and **always one line**:
    a line shrinks to fit rather than wrapping.
  - **Lettering per album, two candidates each, demoed in
    `mockups/lyric-styles.html`; Stefan's final pick pending:**
    Into the Wild, straight and narrow: (1) *Hairline*, Inter ExtraLight
    capitals tracked wide, as in the Shorts captions, wiped on; or (2) Sofia
    Sans Extra Condensed thin capitals, wiped on. I Want to Be Yours, small
    cinema face: (3) Courier Prime typed letter by letter like an old film
    subtitle; or (4) IM Fell English, wiped on.
  - **Old-film movement is gentle:** slow push and drift (well under a pixel),
    breathing fade, slow grain, a few drifting dust specks. No jittery gate
    weave or hard flicker; the original shake was too much.
- **Below the screen**, a parallax journey through the songs, *not* synced to
  playback: free scrolling and exploration. Per song: lyric snippets, stories
  (only where Stefan has written one), pictures, small animations (reuse motifs
  from `shared/video/`). Whole lyrics aren't needed. Songs with little get a
  quiet row; nothing should look empty or padded.
- Credits, quiet listening links, and the other record close the page.
- The music keeps playing while scrolling; the page's own dock is the transport.
- No page for record three yet. Into the Wild stays the focus.

## How to work

Each brief runs in its own session, in its own git worktree (Stefan's call;
an exception to the usual commit-straight-to-main rule):

```sh
git worktree add ../hdg-<brief> -b redesign/<brief> main
cd ../hdg-<brief> && npm ci
npx nuxi dev --port <3001..3005>
```

Commit in the worktree as you go. When the brief is done, tell Stefan the
branch is ready; he fast-forwards or merges it into main. Rebase on main before
handing back if main has moved. Don't edit files another brief owns (listed in
each brief) without saying so in your summary.

## The briefs

| # | Brief | Start when |
|---|---|---|
| 1 | [Foundation and light pages](briefs/1-foundation.md) | now |
| 2 | [Persistent player](briefs/2-player.md) | after 1 has merged its layout and tokens |
| 3 | [Album page and screen](briefs/3-album-screen.md) | after 2; needs Stefan's lyric style |
| 4 | [Lyric timing](briefs/4-timing.md) | now (data only) |
| 5 | [Song journey](briefs/5-journey.md) | after 3 |
