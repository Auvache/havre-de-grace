---
name: phone-video-captions
description: Burn lyric captions into a song recorded on a phone (an iPhone .mov of one performance) for YouTube Shorts / socials, in the approved "Breath" style. Load this when asked to caption a video, add lyrics to a clip, or "do the same as Little Brother" for another take. To split a long take into several Shorts, that's phone-video-clips. Not for the SVG films in shared/video/ (that's music-video-creation) or the Artichoke live set (tools/video-styles/LIVE.md).
---

# Phone takes with lyric captions

The tools are `tools/captions/lyrics.py` (transcribe, then align real lyrics to
the timing) and `tools/captions/captions.mjs` (draw the captions and encode).
The other scripts in `tools/captions/` are for splitting a long take (see
phone-video-clips).
Their header comments hold the details; this file is the process and the
decisions behind it.

Done this way, approved as "perfect": Little Brother (IMG_4247), Andalusia
(IMG_4249) and Little Red Moon (IMG_4345), 26 Oct 2026. The outputs are in
`~/stefan/videos/ready/` as `<Song> - captioned.mp4`.

Shorts cut from a take in `~/stefan/videos/inbox` get the **Hairline** style
from `tools/captions/short.mjs` instead (see phone-video-clips). Breath is for
captioning one whole take as a single video.

## The style is settled: "Breath"

Five styles were mocked up on a real frame (breath, paper strip, one big word,
serif lyric sheet, typewriter). The user picked **Breath**: thin lowercase Jost,
white, centred, no punctuation, words dim until they are sung, the sung word
briefly bolder. Don't re-open the choice or re-mock styles unless asked. If
they want something new, mock it on a frame from their clip first and show
screenshots before rendering anything.

## Process

```sh
W=$SCRATCH/<song>              # a work dir in the session scratchpad
# 0. once per session: Whisper in a scratchpad venv (the ~3 GB model is cached in ~/.cache/huggingface)
python3 -m venv $SCRATCH/venv && $SCRATCH/venv/bin/pip install -q faster-whisper

# 1. look at the take: duration, rotation, a few frames to see where the captions can go
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact <take>.mov
ffmpeg -v error -ss 5 -i <take>.mov -frames:v 1 -vf scale=360:-1 $W/peek.jpg   # and a couple more times

# 2. transcribe (~1.5 min for 40 s): writes words.json and a draft lyrics.txt
$SCRATCH/venv/bin/python -I tools/captions/lyrics.py transcribe <take>.mov $W

# 3. correct $W/lyrics.txt (see Lyrics), then align
python3 -I tools/captions/lyrics.py align $W

# 4. render (~1 min)
node tools/captions/captions.mjs --video <take>.mov --timed $W/timed.json \
  --out "$HOME/stefan/videos/ready/<Song> - captioned.mp4" [--top N] [--scrim]

# 5. check frames, then open the video for the user
```

### Lyrics: never trust Whisper alone

- **Find the song first.** `content/music/*.yml` has lyrics for both albums;
  `public/demos/playlists.json` names the unreleased demos (Little Brother was
  found there). Grep for a distinctive line from the transcript.
- If the site has the lyrics, copy the lines that are sung in the take into
  `lyrics.txt` (a take is usually one verse and chorus, not the whole song).
  This fixed "around" → "round" and "No, no" → "Know no" on Andalusia.
- If it doesn't, **ask the user for the title** (the file name needs it) and
  show them the transcript with your guesses at the misheard words in bold.
  They confirm or correct the lines; they don't usually retype the song.
- Whisper may invent a sign-off over the guitar outro ("Thanks for watching!").
  Leave it out of `lyrics.txt`; `align` drops heard words that aren't in the
  lyrics and don't touch a lyric word, and says so.
- Each line of `lyrics.txt` is one caption. Keep phrases about 25–60
  characters long. A comma near the middle is where the line wraps.
- `align` flags lines whose timing it had to share out (the lyric and the
  heard words differ in count). Check that the bold word is right in a frame
  from each flagged line.

### Placement: look at the frame, every time

The caption box is x 90–930 (the right edge is kept clear for the Shorts
buttons; the bottom ~20% is under the title and channel name, so stay above
about y 1500). `--top` is its top edge in the 1080 × 1920 frame; two lines take
about 165 px and three about 250. Put it on something **dark and plain**, under
the chin and above the guitar, and check it at several times, because the
singer and the guitar neck move:

| Take | Background at caption height | `--top` | `--scrim` |
| --- | --- | --- | --- |
| Little Brother | navy sweater | 1060 (default) | no |
| Andalusia | sweater; at 1060 it was the light guitar body and white door, so the dim words vanished | 950 | no |
| Little Red Moon | light plaid shirt, bookshelf, a guitar neck moving through the lower half | 820 | yes |

`--scrim` (a soft dark glow behind the words, unsung words at 50% instead of
32%) is only for light or busy backgrounds. The dark-sweater takes looked
right without it, and those were the ones approved first.

### Checking before you hand it over

Grab 6–10 frames across the take (`-vf crop=1080:640:0:<top-150>,scale=540:-1`
stacked with `vstack`/`hstack`) and look at them. Check four things: the bold
word is the word being sung at that time (compare with `timed.json`); every
line, dim words included, is readable over what's behind it; no caption
touches the face; and the lines break sensibly. Then `open` the mp4 for the
user. Say that you checked stills, not real-time playback.

### Files

- Output: `~/stefan/videos/ready/<Song Title> - captioned.mp4` (or, when it will be split, a scratchpad file that phone-video-clips cuts), with the title written
  the way the site writes it.
- Originals: when the user says to delete them, use `trash <file>` (recoverable
  from the Trash), never `rm`, and only after the output has been checked.
- Work files (audio, words.json, lyrics.txt, timed.json) stay in the scratchpad.
