---
name: phone-video-clips
description: Turn raw performance videos in ~/stefan/videos/inbox into ready-to-post 30–55 s Shorts — split at the song's own seams (overlapping clips allowed), captioned, each with its own colour look and light audio polish — and keep the inbox/ready/posted folders in order. Load this when asked to "process the inbox", "make Shorts from" a video, "break up", "split" or "cut into parts" a take. The captioning itself is phone-video-captions.
---

## The videos folder (agreed 27 Oct 2026; the user wants it simple)

```
~/stefan/videos/
  inbox/      the user drops raw takes here, any length
  ready/      finished clips, ready to post
  posted/     the user moves a clip here once it's up (Claude never does)
  originals/  raw takes Claude has processed (move them here from inbox/ when done)
```

The folder is the status: no log file. The other things at the top level
(CacheClip, Resolve Project Backups, artichoke-*) are the user's; leave them.

"Process the inbox" means, for each file in `inbox/`. First done on
Insane, Okay, 27 Oct 2026 (5 clips); see "The first inbox run" below.

1. **Transcribe and get the lyrics right** (`lyrics.py transcribe`, then the
   lyrics rules in phone-video-captions). If the site doesn't have the song,
   show the user the transcript with the doubtful words in bold; they correct
   them. Each line of `lyrics.txt` is one caption: split a line longer than
   about 45 characters at a phrase break, so no caption wraps to three rows
   (about 24 Hairline characters fit in a row). Then `lyrics.py align`, then **always
   `lyrics.py refine $W <take>`** (in the venv, with `pip install demucs
   soundfile`). Whisper starts a word too early after a gap, up to 1.8 s
   on Insane, Okay, and the user saw the text come in "seconds before the
   words". `refine` separates the voice with Demucs and moves those starts
   to where the singing comes in. Whisper run on the separated voice has
   the same timing bias, so don't use it for timing. It's much better for
   the words, though: see "Checking the words against what's sung" below.
   If a move looks doubtful, a
   spectrogram of `$W/vocals.wav` (ffmpeg `showspectrumpic`) shows the
   consonant and vowel of the word.
2. **Pick 4–6 clips** from a ~3 min take (fewer from a short one): every
   sensible window, overlaps allowed (see below). Find each start and end with
   `onsets.py` as in "What makes a good cut", and check Whisper's word ends
   so a start doesn't clip the last word of the line before (39.25 cut
   "right" on Insane, Okay, so that clip starts at 40.41). If a take was cut
   before, make sure no new clip has exactly the same span.
3. **Render each clip with `tools/captions/short.mjs`**: one encode does the
   cut, the colour look (clean-warm by default), the audio polish and the
   Hairline captions. Its header has the details.
   ```sh
   node tools/captions/short.mjs --video inbox/<take> --timed $W/timed.json \
     --start 18.82 --end 59.53 --fade-out 0.3 --top 760 --scrim \
     --out "$HOME/stefan/videos/ready/<Song> - verse 1.mp4"
   ```
   About 30 s per clip. In a shell loop, give `node` `</dev/null`, or it
   swallows the rest of a heredoc-fed `while read` and only the first clips
   get made.
4. **Check stills** of every clip (the first and last frames and 6 in between,
   tiled): the caption under the chin and not on the face, readable over
   what's behind it, the clip ends with no caption on screen, and the words
   match the singing. Measure one clip's loudness (about -14 LUFS, true peak under -1).
5. Move the raw take to `originals/` and tell the user what each clip covers,
   its look, and what was left out.

### What arrives in the inbox, and what each gets (settled 27 Oct 2026)

Look at every file first: duration, size, a frame strip (8 frames across it),
and `md5` to catch exact duplicates (trash a duplicate when the user agrees).
Then:

- **A raw take with singing, no captions:** the full process above.
- **Burned-in captions (an edited, already-posted Short, often a 720p
  re-download):** old captions **can't be removed cleanly**. Painting over
  them smears the shirt in every frame. So ask whether the original phone
  file still exists (it gets the full process). If not, run `short.mjs`
  **without `--timed`**: look, audio and 1080×1920 only, old captions kept.
  Name it `<Song> - snippet` (the song is in the old captions or the title).
- **Promo end cards with a date ("OUT JULY 17"):** trim them off. End the
  clip a frame before the card (find it by the jump in white pixels where
  the card sits), with `--fade-out 0.5`. If what's left is under about 20 s,
  say so.
- **Guitar only (Whisper hears nothing, or invents "Thank you for
  watching"):** no captions, look and audio only. Name it `Riff - <title>`.
- **Not 9:16 (e.g. the square Norma Jeane live video):** `--reframe crop`
  (the user's choice), with `--crop-x` set so the performer stays in the
  window as they move (Norma Jeane: about 0.3). `--reframe blur` keeps the
  whole frame, with a blurred fill.
- **A sung take on the site with a half line at the start** (Scarecrow
  opened on "…something more"): start where the take starts, leave the
  fragment uncaptioned, and check that the first caption word doesn't
  inherit the fragment's time (`align` folds unlyric'd words into the next
  word; set its start by hand from words.json).

- **A live venue take (a wide shot from the audience):** when Whisper
  mishears whole lines (Hey, Player: "Hey babe, what you doing?" for "Hey,
  Player. Whatcha doing?"), `align` can squash a line into a fraction of a
  second or start it in the gap before. Read `align`'s output for any line
  shorter than about a second, match each lyric line to the heard phrase it
  replaces in words.json, set those spans by hand in `timed-whisper.json`,
  then run `refine` again. If a word ends in a gap, `refine` can move it a
  whole bar later ("tone" went from 85.8 to 88.3), so end it inside the
  sung note. clean-warm was fine on orange stage light.

Sources go to `originals/` when their Shorts are in `ready/`.

### Checking the words against what's sung (live takes especially)

**The written lyrics aren't always what's sung.** This applies to the
user's lyrics and to the site's. Live, the user changes lines. On Hey,
Player the final verse they sent read "I'm happy you're happy, *but* just
let me be / *If you're doing well*, you can always tell me / But do me a
favor, don't lie to yourself". They sang "I'm happy you're happy, just let
me be / *When things look up*, you can always tell me / But do me a favor
*and* don't lie to yourself". The user spotted it in the finished clip
(27 Oct 2026). Catch it before rendering:

1. **Transcribe each sung section again from the vocal stem.** That's
   `$W/vocals.wav`, which `refine` made. The full mix heard "I'm happy to
   have you just look at me… always tell me to be a better man". The stem
   heard the real line structure at 0.97–1.0 confidence on most words.
   ```sh
   ffmpeg -v error -y -ss 126 -t 30 -i $W/vocals.wav -ac 1 -ar 16000 $W/sec.wav
   $SCRATCH/venv/bin/python -I - <<'EOF'
   from faster_whisper import WhisperModel
   m = WhisperModel("large-v3", device="cpu", compute_type="int8")
   segs, _ = m.transcribe("<W>/sec.wav", language="en", word_timestamps=True, beam_size=5,
                          condition_on_previous_text=False)
   for s in segs:
       print(" ".join(f"{w.word.strip()}@{126 + w.start:.2f}({w.probability:.2f})" for w in s.words))
   EOF
   ```
   - Use windows of about 30 s around the singing. A 6 s window heard
     only "Thank you for watching".
   - **No `initial_prompt`.** With one, Whisper wrote the prompt back
     ("Live acoustic song lyrics.") and nothing else.
   - The stem's word *timings* are still early after a gap. Take only the
     words from it, and keep the timing from `refine`.
2. **Compare the stem's words with `lyrics.txt`, line by line.** Where they
   differ, write the sung version into `lyrics.txt`. A word the stem got
   with low confidence (under about 0.6) and that doesn't match the written
   lyric is a guess ("look as" was probably "look up"). Show it to the user
   in bold before or with the clip.
3. **Get the changed lines' timing.** Either run `align` and `refine` again,
   which loses any hand fixes in `timed-whisper.json`, or edit just those
   lines in `timed-whisper.json`. Give each word the stem's start, but keep
   a line's first word at the take's own entry if `refine` found it later.
   Then run `refine` again.
4. Re-render only the clips that contain those lines, and tell the user what
   changed from their lyrics and which words are still guesses.

Do this for every live take, and for any take where `align` flagged many
lines. The user's own lyrics are the starting point, not proof of what was
sung.

### Captions: the Hairline style (chosen 27 Oct 2026)

One line at a time, centred: small (34 px) thin Inter capitals, widely
spaced, white with a soft shadow. Words are dim until sung. The line stays up
1.6 s after its last word, then fades, unless the next line comes in sooner and
takes over. The user found 0.6 s "too difficult to read all of the text before it
disappears". Everything in `ready/` was re-rendered in it on
27 Oct. The user picked it from ten mock-ups running from minimal to maximal
(hairline, serif whisper, typewriter, cinema bar, karaoke, highlighter tabs,
poster stack, giant outline, ransom collage, maximal). **Don't re-open the
choice or add colour, emphasis or size play unless asked.** Before it, a bold
"poster" style was tried through several rounds (per-song palettes,
emphasised words, even-length rows, ragged rows) and dropped.

**Placement: look at the take every time.** `--top` goes just under the chin,
on something plain, low enough that the chin doesn't reach it when the head
dips. `--scrim` (a dark glow around the letters, unsung words lifted to 45%)
is for a busy or light background:

| Take | `--top` | `--scrim` |
| --- | --- | --- |
| Insane, Okay (grey plaid shirt) | 760 | yes |
| Little Brother (navy sweater) | 960 (880 touched the chin when the head dipped) | no |
| Andalusia (navy sweater) | 860 | no |
| Little Red Moon (pale plaid, bookshelf behind) | 820 (600 sat on the bookshelf and the face) | yes |
| Hey, Player (live, wide shot, orange wood wall) | 1180, on the dark legs and stool (1250 put the second row on an audience head) | yes |

- **Whole short takes (35–45 s):** one clip each, starting where the voice
  starts. Trim a long outro to a second or so after the last sung note (Little
  Brother: 15 s of guitar after "breathe", so it ends on the strum at 31.61).
- **Re-doing a captioned video:** burned-in captions can't be removed. Ask
  the user to put the original take back in `inbox/`. Reuse the old
  lyrics.txt if the session still has it. Trash the old captioned version
  once the new one is checked.

### Looks

**clean-warm** is the user's favourite and short.mjs's default. They didn't
like "faded" (27 Oct 2026). Use clean-warm unless they ask for variety.
`clean` (neutral) is the alternative. The looks are in `short.mjs`'s `LOOKS`,
tuned on daylight footage. On a new kind of footage (stage light, night),
check a still of the look first: the first "clean", tuned to take the orange
out of stage light, went cold and washed-out on daylight.

### Audio

The user wants "less harshness, the voice a smidge forward", and found the
difference subtle but fine. The chain is in `short.mjs`'s `EQ`: a high-pass
at 75 Hz, -2.5 dB at 250 Hz, +1.5 dB at 1.5 kHz, -2.5 dB at 4 kHz, a light
de-esser, then two-pass loudnorm to -14 LUFS. No compressor, because the iPhone
has already compressed it. It's the same chain for every clip; only the look
changes between clips.

### Overlapping clips

The user posts clips from one take months apart, so two clips may share a
section, as long as they don't start and end in the same places (e.g. "verse 1 +
chorus", "chorus + verse 2", "final chorus to end"). Every start and end
still follows the cut rules below. Don't make two clips that differ by only a
bar at one end; each should feel like its own moment. (The user was told,
honestly, that fingerprinting will still see shared footage; the variety is
for viewers, not to evade detection.)

### The first inbox run: Insane, Okay, 27 Oct 2026

| Clip | Span | Length | Look | Left out |
| --- | --- | --- | --- | --- |
| verse 1 | 18.82–59.53 | 41 s | clean-warm | 19 s intro |
| verse 1 end + chorus | 40.41–90.07 | 50 s | clean-warm | |
| chorus | 59.53–90.07 | 31 s | clean-warm | |
| verse 2 + final chorus | 110.39–156.34 | 46 s | clean-warm | 23 s break before |
| verse 2 end + final chorus | 121.76–161.44 | 40 s | clean-warm | 20 s outro after |

Feedback on the first render: the audio was "great"; text came in early in
every clip (fixed by `refine`); they didn't like faded.

# Splitting a full take: the cut rules

First done (cutting only) and approved as "perfect": Insane, Okay (3:01 → 3 clips) and
St George (2:36 → 3 clips), 26 Oct 2026, from `~/stefan/videos/*-full.MOV`.
Those already had captions burned in by the user's editor, so nothing was
drawn; it was cutting only. A take without captions now goes through
`short.mjs` (above), which captions each clip as it cuts it.

The tools are in `tools/captions/`: `lyrics.py transcribe` (Whisper, for where
the lines fall), `onsets.py` (the strums), `caption_band.py` (when a burned-in
caption is on screen) and `cut.py` (the cut itself). The venv setup is in
phone-video-captions.

## What makes a good cut (the judgement the user delegated)

- **Each clip is one or two sections: a verse, a verse and pre-chorus, a
  chorus.** Aim for 30–55 s. Don't cut mid-section just to even up the
  lengths.
- **Cut only where no caption is on screen and no one is singing.** The
  editor's captions stay up longer than the singing, so use
  `caption_band.py`, not Whisper's line ends. Whisper also stretches a line's
  first word back into the gap before it ("When" ran 61.88–62.70 on Insane,
  Okay), so the real entry is later than it says.
- **Start on a strum, a bar or two (about 1–4 s) before the voice comes in;
  end just before the next strum.** Pick the strongest onset in the gap.
  Evenly spaced strong onsets are the bar lines, and those are the best
  places to cut.
- **Drop long instrumental stretches.** On Shorts the first seconds decide
  whether anyone stays, so 15–20 s of guitar before the voice loses them. Cut
  the intro down to the bar or two before the first line, leave out a solo or
  break of more than about 15 s, and cut a long outro to a few seconds after
  the last line (St George's own 8 s ending stayed whole). Tell the user what
  was left out, with times, in case they want any of it back.
- **Shorts loop**, so there is no video fade, just a hard cut. The audio gets
  a 50 ms fade in and a 0.3–1.5 s fade out (see `cut.py`).

## Process

```sh
W=$SCRATCH/split/<song>
# 1. look: duration and size; a contact sheet (a frame every 15 s) shows the captions and framing
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,avg_frame_rate -of compact <video>
ffmpeg -v error -y -i <video> -vf "fps=1/15,scale=180:-1,tile=13x1" -frames:v 1 $W/contact.jpg

# 2. where the lines are, and so the sections (3 min ≈ 4 min of CPU)
$SCRATCH/venv/bin/python -I tools/captions/lyrics.py transcribe <video> $W

# 3. propose the clips from the sections, then for every boundary check the captions and find the strum
$SCRATCH/venv/bin/python -I tools/captions/caption_band.py <video> 56 64        # around each candidate cut
$SCRATCH/venv/bin/python -I tools/captions/onsets.py $W/audio16k.wav 60.3-61.8   # inside the caption gap

# 4. cut
$SCRATCH/venv/bin/python -I tools/captions/cut.py <video> "$HOME/stefan/videos/<Song> - 1 of 3.mp4" 18.82 60.70 --fade-out 0.3

# 5. check the first and last frame of every clip (no caption half-shown, no word cut off), then open them all
```

In zsh, a loop over `"56 64"`-style windows needs `${=w}` to split the
string into two arguments.

## The cuts that were approved

They show what "best judgement" meant here, as a pattern to follow:

| Clip | Source span | Length | Content | Left out before it |
| --- | --- | --- | --- | --- |
| Insane, Okay 1 of 3 | 18.82–60.70 | 42 s | verse 1 to "…I wind up in therapy" | 19 s intro |
| Insane, Okay 2 of 3 | 60.70–92.62 | 32 s | "When they can't fix…", the chorus | — |
| Insane, Okay 3 of 3 | 110.39–161.44 | 51 s | verse 2, the final chorus | 18 s break; 20 s outro after |
| St George 1 of 3 | 13.88–49.37 | 35 s | verse 1 to "…just the aid" | 14 s intro |
| St George 2 of 3 | 49.37–84.88 | 36 s | verse 2 to "send fire streaking across the sky" | — |
| St George 3 of 3 | 113.41–155.84 | 42 s | verse 3 to the end, outro kept | 28 s solo |

## Files

- Output: `~/stefan/videos/ready/<Song Title> - <section>.mp4`, named by what's
  in the clip ("St George - verse 1", "Insane, Okay - verse 2 + final
  chorus", "St George - verse 3 to end"), not "N of M", because clips can overlap.
  Write the title the way the site writes it (`public/demos/playlists.json`
  and `content/music/*.yml`). If the site doesn't have it, use the source
  file's name ("St George").
- Move the full-length source to `originals/`; keep it unless the user says to delete it. When they
  do, use `trash`, not `rm`.
