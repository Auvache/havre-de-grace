# Brief 3: Album page shell and the screen

Read `docs/redesign/README.md` first. Start after brief 2. Needs Stefan's
final pick of lettering (README, "Lettering per album").

## Goal

Replace `/music/<album>` with the Cinema page (`mockups/album-itw.html`,
`album-iwtby.html`), and build the screen at its top: the record playing as a
picture with its lyrics written in the centre, in sync.

## The page shell

Dark, per-album grade (Into the Wild: slate `#0d1318` / accent `#9fb6cc`;
I Want to Be Yours: forest `#0b110d` / `#a9bf9f`; both in the album config).
Order: screen → title, meta, play → album description (`content/music/*.yml`)
→ the song journey (brief 5; leave a slot and render a plain list of songs
until then) → credits (real, from the yml) → quiet listening links (text)
→ the other record → footer. The page's own dock at the bottom (dark variant
of brief 2's bar, with side A/B) is the transport; music keeps playing while
scrolling. Keep song pages (`/music/<album>/<song>`) and the hash links
`useAlbumPlayer` supports working.

## The screen

- Rendered live in the browser, not a video file. The picture layer loops on
  its own; the lyric layer reads the audio clock (`app/utils/mediaClock.ts`).
- Before play: the picture loops silently, no lyrics. After play: the whole
  album runs on the screen, track by track, following the player.
- *I Want to Be Yours*: `public/press/media-pic-wide.jpg` as old film: sepia
  and fade, slow grain, drifting dust, a breathing fade, a slow push-in and a
  sub-pixel drift, vignette. **Gentle**: no jittery gate weave or hard flicker
  (Stefan found it unsettling); match the demo's "gentle" setting. Build it as
  a slideshow with one slide so more photos are a data change.
- *Into the Wild*: the cover (`public/albums/into-the-wild/images/…png`),
  calm, slow push, no grain, scaled past the cover's white border.
- `mockups/lyric-styles.html` has working versions of the four lettering
  candidates, the one-line fit, and the film treatments; lift from it. Use
  whichever two Stefan picked (README, "Lettering per album").
- **Timing data:** `app/config/*Score.ts` hold word-timed lines for nine Into
  the Wild songs; use each line's start/end. *Ghost* and all of *I Want to Be
  Yours* come from brief 4 as line timings in the same shape. Until a song has
  timings, show its title on the screen instead of lyrics.
- Line behaviour: write across the line's sung duration, hold until the next
  line or 1.6 s after its end, fade over 0.6 s.
- Pause the picture's animation when the screen is off-screen or the tab is
  hidden. Reduced motion: no grain/weave/push, lyrics fade in whole.
- Lyrics are small, centred, and always one line: size from the screen's
  width, and shrink a line that would overflow. Never wrap. Phone included.

## Don't touch

Light pages (brief 1), the global player's internals (brief 2, coordinate on
the hand-off API), the Score files (brief 4).

## Done when

Both album pages match their mockups; pressing play runs the record with lyrics
in sync for every timed song; hand-off from the global bar works; desktop and
phone screenshots plus a short recording in your summary.
