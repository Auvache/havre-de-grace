"""
Line timings for a studio track, for the album screen's lyrics.

    python album-lines.py <album-slug> <track-number> <workdir>

The phone-take pipeline in lyrics.py, pointed at an album mp3 instead:
  1. Demucs (htdemucs, two stems) separates the voice; vocals.wav.
  2. Whisper (large-v3, word timestamps) listens to the vocal stem, not the mix.
  3. lyrics.txt is the published lyric from content/music/<album>.yml, one line
     per sung line; `align` lays it over Whisper's words.
  4. `refine` moves each word's start to where the voice comes in.
Then lines.json: one entry per lyric line, {line, text, s, e, guessed}, where
s is the first word's start and e the last word's end.

Run it in the scratchpad venv (faster-whisper, demucs, soundfile, numpy, pyyaml).
"""
import json
import os
import subprocess
import sys

import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lyrics  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))


def main(album, track, work):
    data = yaml.safe_load(open(os.path.join(ROOT, "content", "music", f"{album}.yml")))
    song = data["tracklist"][int(track) - 1]
    mp3 = os.path.join(ROOT, "public", song["audio"].lstrip("/"))
    os.makedirs(work, exist_ok=True)

    vocals = os.path.join(work, "vocals.wav")
    if not os.path.exists(vocals):
        audio = os.path.join(work, "audio44.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "2", "-ar", "44100", audio], check=True)
        sep = os.path.join(work, "sep")
        subprocess.run([sys.executable, "-m", "demucs", "--two-stems=vocals", "-n", "htdemucs", "-o", sep, audio], check=True)
        os.replace(os.path.join(sep, "htdemucs", "audio44", "vocals.wav"), vocals)

    if not os.path.exists(os.path.join(work, "words.json")):
        lyrics.transcribe(vocals, work)

    with open(os.path.join(work, "lyrics.txt"), "w") as f:
        f.write(song["lyrics"].strip() + "\n")
    for stale in ("timed.json", "timed-whisper.json"):
        if os.path.exists(os.path.join(work, stale)):
            os.remove(os.path.join(work, stale))
    lyrics.align(work)
    lyrics.refine(work)

    timed = json.load(open(os.path.join(work, "timed.json")))
    lines = {}
    for w in timed:
        lines.setdefault(w["line"], []).append(w)
    out = [{"line": n, "text": " ".join(w["w"] for w in ws), "s": ws[0]["s"], "e": ws[-1]["e"], "block": ws[0]["block"]}
           for n, ws in sorted(lines.items())]
    json.dump({"title": song["title"], "src": song["audio"], "lines": out}, open(os.path.join(work, "lines.json"), "w"), indent=1)
    print(f"wrote {work}/lines.json ({len(out)} lines)")


if __name__ == "__main__":
    main(*sys.argv[1:])
