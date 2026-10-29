# Brief 4: Lyric timing

Read `docs/redesign/README.md` first. Data only; safe to start any time.

## Goal

Line-by-line timings (start and end of every sung line) for:

- *Ghost* (Into the Wild), the one song on that record without a Score file.
- All nine tracks of *I Want to Be Yours and Other Songs*, including the two
  live tracks and the demo version of the title song (its own timing; it is a
  different recording).

Line level is the decision, not word level. Each line writes itself across its
sung duration on the album screen, so a line's start should be right to a frame
(30 fps) and its end to roughly a tenth of a second.

## How

- The method that timed Into the Wild is written up at the top of
  `app/config/ivoryScore.ts` and `goodbyeNormaJeaneScore.ts`: Demucs vocal stem
  for sung blocks, Whisper word times as a prior (its text thrown away), then
  read by hand against the stem's energy. For line level you can stop at the
  blocks plus Whisper's line starts, then check every line start by ear.
- Existing tools: `tools/captions/lyrics.py`, `tools/captions/onsets.py`,
  `tools/video-styles/live-align.py` (built for live takes, so likely the best
  start for *Demolition Woman* and *White Raven*).
- Lyrics are in `content/music/*.yml`. Where the singing differs from the
  written lyric, time what's sung and note the difference; don't edit the yml.
- Audio: `public/albums/<album>/music/*.mp3`.

## Output

One file per song in `app/config/`, matching the shape the existing Score files
export (look at how `ivoryScore.ts` builds `line(section, start, end, words)`;
for these, `words` can be the line's words with only the first timed, or follow
whatever brief 3 asks for if it has landed). Put the method and a
"WHAT TO TRUST" note at the top of each, like the existing files.

## Check with Stefan

Make a quick review page or a captioned 1080p preview per song so Stefan can
check the timings by ear before brief 3 uses them. List the lines you're least
sure of.

## Don't touch

The existing nine Score files' timings; anything outside `app/config/` and
`tools/` except a review page you delete afterwards.
