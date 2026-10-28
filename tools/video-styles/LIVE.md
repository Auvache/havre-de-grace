# Live videos — a camera take cut to its mixed audio

A different thing from the films in `shared/video/films/`: real footage, not
SVG. What the two share is the frame around it — the album films' opening
(title, the anchor drawn on, the dive through its ring) and Andalusia's end
card are drawn by the same functions and laid over the camera.

- `tools/video-styles/live-align.py` finds where each mixed WAV sits in the camera file.
- `tools/video-styles/live.mjs` renders one song: camera cut + mix + opening + end card.

## Status (2026-10-27): all six rendered, teal and bone

The person then found the warm grade too warm, looked at twelve looks and five
variations, and chose **teal and bone** (now `--grade` default; see GRADE in
live.mjs). Everything was re-rendered in it. Song 1 and 2 was also rendered with
`--bare` (graded camera + master, no opening or end card, the whole mix), as
`Song 1 and 2.mp4`: it's only a source for Shorts. Its master is `2-full
--match Andalusia.wav` like the others.


## The full set (2026-10-28): `live-set.mjs`

`Live at Artichoke Music.mp4` (same folder) is all six songs in set order as
one video, rendered by `tools/video-styles/live-set.mjs` straight from the
trimmed set file and the 9-bite masters, in one encode. Its header has the
details; the song table (`SET`) holds each song's `at`, first note, last note,
`--room` and the camera's own move at its end.

- **Joins.** Each song plays to its last note with its applause at its `--room`
  level; the next song's first note comes 3 s later, and the applause and the
  mix's tail fade over those 3 s and one more. The picture dissolves over 1 s,
  ending before the camera's own move: Into the Wild dissolves to a wide shot
  at stop + 2.9, and Conman pulls out to a dark wide shot at mix 220.52, 0.4 s
  *before* its last note ends (so that dissolve starts under the last chord).
- **Opening**: the mark, then "Live at Artichoke Music" drawn on, the stage at
  11.5–12.9 s onto Insane, Okay's close-up (the camera holds still from mix 23
  to its cut to wide at 29.69).
- **End card**: I Want to Be Yours' wide shot (he waves at stop + 2.1; the
  camera goes dark at stop + 5.6) held 3.5 s after the last note, a dissolve
  to the mark (3.4 s), then two credit screens of 4.5 s each. The credits are
  the script's defaults, as the user approved them.
- **Previews**: `--preview` (the five joins, 19 s each), `--opening`, `--ending`.
  The user approved all three before the full render.
- The shared parts of `live.mjs` (grade, slate, Hairline lines, mark, drawing,
  encode) moved to `live-cards.mjs`; `live.mjs` renders bit-identical frames
  after the move.

Traps found building it:

- **ffmpeg 9's `amix` drops inputs at random** when a dozen `adelay`ed inputs
  end at different times: a different join came out silent from the next
  song's first note on each run, with no error. The script mixes the sound
  itself (each piece decoded to raw samples, faded, added at its sample).
- **Concatenating pieces with the concat demuxer**, even with the audio
  re-encoded, keeps each piece's AAC priming (1024 samples), so the sound runs
  21.33 ms late. Use the concat filter.
- `xfade` refuses stills on a 1/30 timebase against the camera's 1/15360.
- `LIMIT` in `live.mjs` shorter than `--stop` gives the room input a negative
  `-t` and fails; test with a short fake `--stop` instead.

## Slate and Hairline type (2026-10-27, all five songs)

- **Ground**: the opening and both end screens are "faded slate" `#1c2939`
  (`BG` in live.mjs), not black. It was picked from eight navies laid against
  the grade. The grade turns the curtain to `#001b29`.
- **Title**: the song title, then "Live at Artichoke Music" on a second line,
  at the credits' size (34). The type is the Shorts captions' Hairline face
  (Inter Light capitals, tracked 0.32 em). Each letter is drawn on with the
  wordmark's pen, stroke by stroke (`hairline.mjs`: the monoline skeleton of
  each letter is used as a mask). The title draws over 6.2–8.9 s.
- **Credits**: set still, in the same type, with the names in SemiBold:
  `--credit 'Performed by **Havre De Grace**' --credit 'and **Jed Wyatt Smith**'`.
  This is now the default. "Thanks to Artichoke Music" was dropped. A solo song
  takes `--credit 'Performed by **Havre De Grace**'`.
- All five songs were re-rendered this way and verified.
- **Song 1 and 2** (no longer bare) has the slate opening with the mark only (no
  `--title`) and the solo end card. `--from 13.3` skips the talk and silence
  before the first strum (13.85 s). `--reveal 16.6` is just after the camera
  cuts from the close-up to the wide shot (mix 29.70 s). `--stop 408.7` is the
  last chord dying away. `--room 4.0`.
  Then the user asked for the fade at 0:06 instead: `--reveal 6`, onto the
  close-up. Now `--room 3.2`.
- **Masters, all six songs** (first the strumming songs: Song 1 and 2, New York, Conman) are
  `9-bite`: `live-master.py <song>.wav out 9-bite --match Andalusia.wav`
  (halfway match). Rooms were re-measured for it: New York `--room 4.4`,
  Conman `--room 3.8`. How it was chosen:
  - Song 1 and 2's guitar sounded "wimpy" on 2-full: the mix is 8 dB under
    Andalusia at 80 Hz, and bright.
  - An A/B of 2-full, 4-body, 5-punch and 6-big picked 5-punch. It was then
    heard as too boomy. A full match lifts everything under 1 kHz, and 5-punch
    measured the softest strum attacks of any option.
  - "Punchier and a little harsher" was asked for. From 7-tight, 8-snap,
    9-bite and 10-edge, the user picked 9-bite.
  - The user then had the rest moved to it too ("way better"). Andalusia
    takes no `--match`, since it is the reference. Its `--room` is now 7.5,
    Into the Wild's 4.2 and I Want to Be Yours' 5.8. **All six are on 9-bite.**
    I Want to Be Yours' master settles at -13.7 LUFS: the limiter loop stops
    0.3 LU over, and YouTube's normalisation takes it down.

Andalusia v2 was approved ("perfect") and the same treatment was applied to
New York, Into the Wild, Conman and I Want to Be Yours (Song 1 and 2 skipped,
at the person's request). Outputs: `Andalusia.mp4`, `New York.mp4`,
`Into the Wild.mp4`, `Conman.mp4`, `I Want to Be Yours.mp4`.

| Song | `--at` | `--stop` | `--reveal` | `--room` | Notes |
| --- | --- | --- | --- | --- | --- |
| Andalusia | 1783.916 | 193.22 | 11.5 | 8 | with Jed; reframes at 8.4, 10.2, 11.0–11.3 s |
| New York | 568.527 | 195.68 | 11.5 | 5.1 | abrupt stop (−27 → −34 dB at 195.68); operator reframes until 10.9 s |
| Into the Wild | 2093.876 | 219.2 | 11.5 | 4.8 | chord rings from 208.9; cut as it dies and he looks up. Jed walks on at 3.5–8 s, hidden by the black |
| Conman | 2330.544 | 220.93 | 13.2 | 4.8 | pause at 213, a tag, cut at its end. Wide shot dissolves to close, last jump 13.0 s. The camera lost the applause (silent from 224 s), so `--room-at 2313.076` borrows Into the Wild's |
| I Want to Be Yours | 3386.719 | 252.62 | 11.5 | 6.0 | final strum and hit at 252.51; camera steady |

The four solo songs credit "Performed by Havre De Grace" / "Thanks to Artichoke
Music" (Jed is only on Andalusia). `--room` is set so the applause sits as it
does on Andalusia: (mix over camera, measured over 30–150 s) − 2.6 dB.

Masters: `live-master.py <song>.wav out 2-full --match Andalusia.wav`. Parker's
mixes differ a lot (New York and Conman 7–12 dB brighter above 4 kHz, New York
thin below 250 Hz), and the same chain on all of them would make those two
harsh, so each is moved halfway toward Andalusia's balance first.

## v2 of Andalusia (2026-10-27)

v2 (now `Andalusia.mp4`; v1 was deleted 2026-10-27) changes, as asked:

- **Opening**: the mark drawn on black exactly as the splash screen draws it,
  then the title in the wordmark's own stroke capitals
  (`stroke-letters.mjs`: the logo's H A V R E D G C, plus N L U S I drawn to
  match; other songs will need more letters drawn there), then the black and
  title fade together to the stage at 11.5–12.9 s (the camera is reframed until 11.3 s). No dive. The title is drawn
  as paths, not set in Jost.
- **Credits**: `--credit` lines, defaulting to "Performed by Havre De Grace
  and Jed Wyatt Smith" / "Thanks to Artichoke Music".
- **Silent tail**: settled. The camera's own room audio (the applause) comes up from
  `--stop` under the end card at `--room` dB (default +8) and fades with the picture.
- **Picture**: first `--grade warm`, then replaced by `teal-bone` (see above).
- **Audio**: mastered with `live-master.py` to −14 LUFS / −1 dBTP. The person asked
  for "fuller, fill the space", so this departs on purpose from the demo
  sessions' untouched-take rule. Four loudness-matched variants were made for
  an A/B. The person liked all four and picked `2-full` (also liked `3-space` and the tone of `1-glue`); v2 uses it. Use `2-full` for the other five songs.

Sync check note: the output's frame at t shows camera frame at + lag + t
(read with `-copyts`), which is one frame above `ceil((at+t)*30)`. A graded
render needs the camera frames graded too (same filter) before the MSE match.

## Status (2026-10-03)

**v1 of Andalusia is done and approved as a v1**: the person watching said
"great for v1" and will come back to it. The other five songs are waiting
until the open questions below are settled on Andalusia. Nothing here is
committed yet.

## The Artichoke Music set (Portland Songwriters Association, 13 Aug 2026)

| What | Where |
| --- | --- |
| Original camera file, 2 h 18 m, 1080p30, 6 GB | `~/Movies/iMovie Library.imovielibrary/My Movie/Original Media/Portlamd Songwriter's Association _8_13_26 01.mp4` ("Portlamd" is really misspelled). **Leave it there**: it's inside the iMovie library, and moving it breaks the iMovie project. |
| Your set, trimmed (stream copy, 0:07:00–1:08:30 of the original, 61.5 min, 2.8 GB) | `~/stefan/videos/artichoke-parker-mixes/artichoke-set-full.mp4` |
| The six mixes (Parker's, 48 kHz 24-bit stereo) | `Parker originals/` in the same folder: `Song 1 and 2.wav`, `New York.wav`, `Andalusia.wav`, `Into the Wild.wav`, `Conman.wav`, `I Want to be Yours.wav`. **Master and render from these.** |
| The 9-bite masters (what the videos play, 24-bit) | same folder, same names, replacing the mixes there (2026-10-27) |
| Output | same folder, `<Song>.mp4` |
| An older, separate edit of Insane, Okay (not part of this) | `~/stefan/videos/artichoke-insane-okay.mp4` (DaVinci Resolve) |

None of the files had "artichoke" in the name except the Insane, Okay edit.
Spotlight (`mdfind`) plus `find` with sizes and durations is how they were found.

Offsets in the **trimmed** file (subtract 420 s from the original's times).
Each matched in exactly one place (margin 11–16× over the next best match), and
drift was within ±5 ms, so no speed correction is needed:

| Song | `--at` (trimmed file) | Length | `--stop` |
| --- | --- | --- | --- |
| Song 1 and 2 | 118.111 | 413.46 s | none: rendered `--bare`, whole mix |
| New York | 568.527 | 197.29 s | to find |
| *(another performer, about 17 min)* | | | |
| Andalusia | 1783.916 | 197.08 s | **193.22** (the guitar's damped stop, then a 4 s room tail) |
| Into the Wild | 2093.876 | 221.88 s | to find |
| Conman | 2330.544 | 222.21 s | to find |
| *(another performer, about 14 min)* | | | |
| I Want to Be Yours | 3386.719 | 253.33 s | to find (the script guessed 252.62; probably just the mix's fade, so check it) |

Note the order: the setlist the person gave from memory had Andalusia after
Conman. The audio says Andalusia comes first. Trust the audio.

## Process

```sh
# 0. numpy/scipy aren't system-wide: make a venv in the session scratchpad
python3 -m venv $SCRATCH/venv && $SCRATCH/venv/bin/pip install numpy scipy

# 1. offsets, a drift check, and a --stop guess per WAV (~1 min)
cd ~/stefan/videos/artichoke-parker-mixes
$SCRATCH/venv/bin/python ~/stefan/havre-de-grace/tools/video-styles/live-align.py artichoke-set-full.mp4 *.wav

# 2. render one song (~1 min: ~10 s drawing the opening, ~45 s encoding)
node tools/video-styles/live.mjs --video "$D/artichoke-set-full.mp4" --at 1783.916 \
  --wav "$D/Andalusia.wav" --title Andalusia --stop 193.22 --out "$D/Andalusia.mp4"
```

**Choosing `--stop`.** It's where the end card hard-cuts in, in mix seconds,
the same rule as the film's `endCardAt`: the last note. The script's guess
only finds an abrupt stop (a level cliff that stays down). For a song that
rings out it finds nothing, or finds the mix's fade. Print the mix's level in
10 ms steps over the last 10 s and look for the cliff. Also check with
spectral flatness: tonal music sits under 0.01, while applause/noise is 0.1–0.3.
On Andalusia, music ran to 193.22 at about −18 dB, then fell to −32 dB of room
tail, and the last second was noise.

**What `live.mjs` does** (its header has the detail):

- Draws the opening with `opening({ intro: 'draw' })` from `shared/video/album.mjs`, the
  very call Andalusia's film makes. It draws 330 frames (0–11 s) in Chrome
  with Jost, on a transparent page, so the ring's hole shows the camera.
- Uses `LIVE_SHEET` = the cover sheet with `border: COVER_WHITE`. In the
  film, the ring turns paper-coloured during the dive to become the paper
  border. Live, there's no border, so that flashed cream corners over the stage.
- Uses Andalusia's end card (copied from `cartography.mjs`, not
  `ending.mjs`, which differs: 500 vs 520 scale, 3 s vs 3.4 s). The logo
  hard-cuts in on `--stop` and holds 3.4 s, then the credits (`CREDITS` from
  `ending.mjs`) hold 3.66 s. Whatever runs past the WAV is silent (`apad`).
- Audio is the WAV from frame 0, under the opening, as the person asked.
- Output: H.264 CRF 16 preset slow, BT.709 tagged, AAC 320k, 1080p30 like the source.
- Debug hooks: `LIMIT=20` renders only the first 20 s; `KEEP=1` keeps the
  temp dir (PNG frames, `open.mov`) and prints its path.

## Verifying (do all of these; it takes two minutes)

`ffmpeg` here has **no `drawtext`** (built without freetype), so captions on
frames won't work. Tile plain frames with `-vf tile=2xN` and `Read` the jpg.

1. **Dropped frames.** Read the `drop=` count in ffmpeg's final stats line. Any
   non-zero `drop` means the picture has shifted. It must be 0.
2. **Picture sync.** Take an output frame at T (scaled to 160×90 grey, raw),
   and the camera's frames around `at + T`. Find the min-MSE match. It should
   be the camera frame `ceil((at+T)*30)` (MSE ~0.3, against ~1000 for a wrong
   frame). Check at 4–5 times across the song, not one.
3. **Audio offset.** Cross-correlate 10 s of the output's audio against the
   master. The mix should come out *advanced* by exactly `lag` (17.31 ms on
   Andalusia): output t plays mix t + lag, because the picture at output t is
   camera at + lag + t. Measure the picture side with absolute timestamps
   (`-copyts`, `showinfo`), not by computing frame indices: v1's check
   computed them, read +1 frame, and so missed that the mix was delayed
   instead, putting the sound 35 ms late. Fixed 2026-10-27.
4. **Look.** A contact sheet across 0–11 s (title, anchor drawn, dive)
   and across `stop−2` to the end (last camera frame, logo, credits).

## Traps (each one found by building this)

- **Chrome's CDP surface capture is wrong for this.** `Page.captureScreenshot
  { fromSurface: true }` returned 1920×**993** (the window, not the viewport)
  and no alpha. Use Playwright's `page.screenshot({ omitBackground: true })`.
  (`mp4.mjs` gets away with CDP because it's opaque and at 3840×2160.)
- **A PNG sequence that changes pixel format mid-way breaks sync.** Chrome
  writes fully opaque frames as RGB and frames with the ring's hole as RGBA.
  ffmpeg rebuilt the filter graph at the switch, dropped 266 camera frames,
  and the picture ran **9.03 s ahead** of the mix for the rest of the song,
  with no error. The fix is to normalise the opening to one `qtrle` RGBA `.mov` in its
  own ffmpeg pass first, then overlay that.
- **Half-frame lag.** The camera seeked to `at` starts on the first frame at or
  after `at`, up to 33 ms later than the mix's first sample. `live.mjs` delays
  the mix by that remainder (`adelay`), and `--stop` with it, so sync is exact
  to the sample, not to the nearest frame.
- `ffmpeg -to 68:30` is rejected ("Invalid duration"). Write `1:08:30`.
- Stream-copy trimming (`-ss … -to … -c copy`) of the original was fine. The
  re-measured offset in the trimmed file came out exactly as predicted.
- Correlating against the camera's audio assumes the camera file's own A/V
  sync is right. It's the only reference there is.

## Open questions for v2 (ask the person; don't decide)

1. **Credits.** These are word for word the Andalusia film's, including
   "Mellophone, mix and production — Parker Holt". For a live take that may be
   wrong: Parker appears on harmonica in the stills (not confirmed). Get the
   exact lines.
2. **The silent tail.** The outro needs 7.06 s, but Andalusia's music stops
   3.86 s before its WAV ends, so the video runs 3.2 s past the mix on silence.
   Options: camera applause faded in under the credits, a shorter outro, or as is.
3. **Opening length.** The stage first appears at about 0:11 (the film's
   timing: title 0.45–4.65 s, anchor 5.3–8.475 s, dive 8.975–10.925 s). That may
   be long for a live clip. If shortened, it needs its own clock: don't edit
   `DRAW_CLOCK` in `album.mjs`, which the film and the splash screen share.
4. Whether the title should say more than the song name (for example "Live at Artichoke Music").
5. Whether to also render 4K (the source is 1080p, so probably not) or vertical Shorts from the same cuts.

When the person reviews, ask for the whole list at once, with times
("at 0:09 …"), as for the films (see the music-video-creation skill).
