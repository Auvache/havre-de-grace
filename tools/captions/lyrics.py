"""
The words and their timings for a phone take, for tools/captions/captions.mjs.

    python lyrics.py transcribe <video> <workdir>
    python lyrics.py align <workdir>
    python lyrics.py refine <workdir> <video>     (in the venv, after `pip install demucs soundfile`)
    python lyrics.py setline <workdir> <line>:<start>-<end> ...   (a line's span by hand; then refine)

`transcribe` runs Whisper (large-v3, English, word timestamps) on the take and
writes, into <workdir>:
  audio16k.wav   the take's audio, mono 16 kHz
  words.json     every word Whisper heard: {w, s, e, p} (text, start, end, probability)
  lyrics.txt     a draft: one line per phrase Whisper heard

Whisper hears sung words well but not perfectly (it wrote "around" for "round",
"No, no" for "Know no", "And I can't ever" for "Can't help but"), and over a
guitar outro it can invent a line nobody sang ("Thanks for watching!"). So
lyrics.txt is a draft to correct before rendering: replace it with the real
lyrics (content/music/*.yml has most of them), keeping only what is sung in the
take. Each line of lyrics.txt becomes one caption line, so break lines where the
captions should change; a comma near the middle of a line is where it wraps.
Blank lines are allowed and ignored for timing (each word still records which
block it's in).

`align` matches lyrics.txt against words.json and writes timed.json: one entry
per lyric word, {w, s, e, line, block}, with Whisper's timing. Words Whisper heard
exactly keep their timing; a word it misheard takes the misheard word's slot;
where the counts differ (two lyric words for one heard word, say) the slot is
shared out by length; and heard words with no lyric are absorbed into the
neighbouring lyric word if they touch it, or dropped if they stand apart (the
invented sign-off). It prints any line it had to guess at, so check those.

faster-whisper isn't installed system-wide: make a venv in the session
scratchpad, `python3 -m venv venv && ./venv/bin/pip install faster-whisper`,
and run `transcribe` with it. `align` needs only the standard library. The
model (about 3 GB) downloads once to ~/.cache/huggingface; after that a
40-second take transcribes in about a minute and a half on CPU.
"""
import difflib
import json
import os
import re
import subprocess
import sys

TOUCH = 0.5  # seconds: unmatched heard words closer than this to a lyric word are part of it


def norm(w):
    return re.sub(r"[^\w']", "", w.lower().replace("’", "'"))


def transcribe(video, work):
    from faster_whisper import WhisperModel

    os.makedirs(work, exist_ok=True)
    audio = os.path.join(work, "audio16k.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", audio], check=True)
    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio, language="en", word_timestamps=True, vad_filter=False, beam_size=5,
                                   condition_on_previous_text=False)
    words, lines = [], []
    for seg in segments:
        print(f"[{seg.start:6.2f} - {seg.end:6.2f}] {seg.text.strip()}")
        lines.append(seg.text.strip())
        for w in seg.words:
            words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 2)})
    with open(os.path.join(work, "words.json"), "w") as f:
        json.dump(words, f, indent=1)
    with open(os.path.join(work, "lyrics.txt"), "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"wrote {work}/words.json and a draft {work}/lyrics.txt: correct the draft, then run align")


def align(work):
    heard = json.load(open(os.path.join(work, "words.json")))
    lyric, block = [], 0
    for n, line in enumerate(l.strip() for l in open(os.path.join(work, "lyrics.txt"))):
        if not line and lyric:
            block = lyric[-1]["block"] + 1
        lyric += [{"w": w, "line": n, "block": block} for w in line.split()]
    renumber = {n: i for i, n in enumerate(sorted({l["line"] for l in lyric}))}  # so blank lines don't leave gaps
    for l in lyric:
        l["line"] = renumber[l["line"]]

    a, b = [norm(h["w"]) for h in heard], [norm(l["w"]) for l in lyric]
    guessed = set()
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):  # heard, or misheard word for word
            for i, j in zip(range(i1, i2), range(j1, j2)):
                lyric[j]["s"], lyric[j]["e"] = heard[i]["s"], heard[i]["e"]
        elif op == "replace":  # lyric[j1:j2] sung where Whisper heard heard[i1:i2]: share that slot out by length
            s, e = heard[i1]["s"], heard[i2 - 1]["e"]
            weights = [len(lyric[j]["w"]) for j in range(j1, j2)]
            t = s
            for j, wgt in zip(range(j1, j2), weights):
                lyric[j]["s"], t = round(t, 3), t + (e - s) * wgt / sum(weights)
                lyric[j]["e"] = round(t, 3)
                guessed.add(lyric[j]["line"])
        elif op == "delete":  # heard but not in the lyrics: part of a neighbour if it touches one, else invented
            heard[i1]["absorb"] = (i1, i2)
        elif op == "insert":  # in the lyrics but not heard: squeeze in after the previous word
            for j in range(j1, j2):
                lyric[j]["missing"] = True
                guessed.add(lyric[j]["line"])

    # unheard lyric words: each run of them shares a heard neighbour's slot (the previous word's, or at the
    # very start the next word's) in equal parts
    j = 0
    while j < len(lyric):
        if not lyric[j].get("missing"):
            j += 1
            continue
        k = j
        while k < len(lyric) and lyric[k].get("missing"):
            k += 1
        host = j - 1 if j > 0 else k
        group = list(range(j, k)) + [host] if host == k else [host] + list(range(j, k))
        s, e = lyric[host]["s"], lyric[host]["e"]
        step = (e - s) / len(group)
        for n, g in enumerate(group):
            lyric[g]["s"], lyric[g]["e"] = round(s + step * n, 3), round(s + step * (n + 1), 3)
        j = k

    # heard-but-unlyric'd runs: absorb into the lyric word they touch, or drop them
    for h in heard:
        if "absorb" not in h:
            continue
        i1, i2 = h["absorb"]
        s, e = heard[i1]["s"], heard[i2 - 1]["e"]
        after = min((l for l in lyric if "s" in l and l["s"] >= e - 1e-6), key=lambda l: l["s"], default=None)
        before = max((l for l in lyric if "e" in l and l["e"] <= s + 1e-6), key=lambda l: l["e"], default=None)
        if after and after["s"] - e < TOUCH:
            after["s"] = s
            guessed.add(after["line"])
        elif before and s - before["e"] < TOUCH:
            before["e"] = e
            guessed.add(before["line"])
        else:
            print(f"dropped, heard but not in the lyrics: {' '.join(x['w'] for x in heard[i1:i2])} ({s:.2f}-{e:.2f})")

    out = [{"w": l["w"], "s": l["s"], "e": l["e"], "line": l["line"], "block": l["block"]} for l in lyric]
    with open(os.path.join(work, "timed.json"), "w") as f:
        json.dump(out, f, indent=1)
    stale = os.path.join(work, "timed-whisper.json")  # refine's copy of the last alignment: redo refine after this
    if os.path.exists(stale):
        os.remove(stale)
    lines = {}
    for l in out:
        lines.setdefault(l["line"], []).append(l)
    for n, ws in lines.items():
        mark = "  <- timing guessed, check it" if n in guessed else ""
        print(f"{ws[0]['s']:6.2f}-{ws[-1]['e']:6.2f}  {' '.join(w['w'] for w in ws)}{mark}")
    print(f"wrote {work}/timed.json")


VOICED = -20  # dB, against the vocal stem's 95th percentile: above this the voice is singing
BRIDGE = 0.12  # s: a quieter moment shorter than this (a consonant) doesn't split a stretch of singing
ENTRY = 0.2  # s: a gap at least this long inside a word's slot means the word starts after it
REACH = 1.5  # s: how far past Whisper's end a word's real start may be


def refine(work, video=None):
    """Move each word's start to where the voice really comes in.

    Whisper puts a word's start too early when a gap comes before it: it stretched
    "My" back 1.8 s into the guitar on Insane, Okay, and "When", "Now" and "But"
    0.7-1 s, so the captions showed words well before they were sung. Demucs
    separates the voice from the guitar (vocals.wav, about 40 s for a 3 min take
    on CPU; the model downloads once); in the vocal stem a gap sits 30-60 dB below
    the singing and an entry climbs steeply. A word whose start is already sung
    keeps Whisper's timing. One whose start is in a gap moves to where the next
    stretch of singing begins, up to REACH past Whisper's end (Whisper ends the
    word early too: "But" ended at 32.17 and was sung at 32.25). And one whose
    start is in the previous word's held note moves past the gap after it, if
    the gap is at least ENTRY long ("a-failing" was held to 116.55 and "My" sung
    at 117.65). Words never start out of order. Rewrites timed.json and
    keeps Whisper's version as timed-whisper.json.
    """
    import numpy as np
    import soundfile as sf

    vocals = os.path.join(work, "vocals.wav")
    if not os.path.exists(vocals):
        if not video:
            sys.exit("no vocals.wav yet: run `refine <workdir> <video>` once so Demucs can make it")
        audio = os.path.join(work, "audio44.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "2", "-ar", "44100", audio], check=True)
        sep = os.path.join(work, "sep")
        subprocess.run([sys.executable, "-m", "demucs", "--two-stems=vocals", "-n", "htdemucs", "-o", sep, audio], check=True)
        os.replace(os.path.join(sep, "htdemucs", "audio44", "vocals.wav"), vocals)

    x, sr = sf.read(vocals)
    x = x.mean(axis=1) if x.ndim == 2 else x
    hop = sr // 100
    n = len(x) // hop
    db = 10 * np.log10((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    voiced = db > np.percentile(db, 95) + VOICED
    # stretches of singing: voiced frames, with consonant-length dips bridged and blips dropped
    runs, i = [], 0
    while i < n:
        if not voiced[i]:
            i += 1
            continue
        j = i
        while j < n and (voiced[j] or voiced[j : j + int(BRIDGE * 100)].any()):
            j += 1
        if j - i >= 6:
            runs.append((i / 100, j / 100))
        i = j

    timed_path = os.path.join(work, "timed.json")
    whisper_path = os.path.join(work, "timed-whisper.json")
    if not os.path.exists(whisper_path):
        os.replace(timed_path, whisper_path)
    timed = json.load(open(whisper_path))
    prev = -1.0
    for k, w in enumerate(timed):
        s = max(w["s"], prev + 0.08)
        limit = min(w["e"] + REACH, timed[k + 1]["e"] if k + 1 < len(timed) else w["e"] + REACH)
        inside = next((r for r in runs if r[0] <= s < r[1]), None)
        later = next((r for r in runs if s < r[0] < limit), None)
        if inside is None and later:
            s = later[0]  # Whisper's start is in a gap: the word starts where the voice comes in
        elif inside and inside[0] < s - 0.05 and inside[1] < w["e"] and later and later[0] - inside[1] >= ENTRY:
            s = later[0]  # Whisper's start is the last word's held note, and the word comes after a gap
        if s - w["s"] >= 0.15:
            print(f"{w['w']:>16}  {w['s']:7.2f} -> {s:7.2f}  (+{s - w['s']:.2f})")
        w["s"] = round(s, 3)
        w["e"] = round(max(w["e"], s + 0.1), 3)
        prev = w["s"]
    with open(timed_path, "w") as f:
        json.dump(timed, f, indent=1)
    print(f"wrote {timed_path} (Whisper's timing kept in {whisper_path})")


def setline(work, *spans):
    """Put caption lines where they're really sung: `setline <workdir> 12:60.8-64.4 23:150.5-151.9 ...`.

    For a line align got wrong (stretched into a gap, squashed, or guessed in a noisy room), spread its
    words over the span by length, in timed-whisper.json (made from timed.json if refine hasn't run yet).
    Line numbers are timed.json's `line`. Then run refine to snap the starts to the voice.
    """
    whisper_path = os.path.join(work, "timed-whisper.json")
    if not os.path.exists(whisper_path):
        os.replace(os.path.join(work, "timed.json"), whisper_path)
    timed = json.load(open(whisper_path))
    for spec in spans:
        n, span = spec.split(":")
        s, e = map(float, span.split("-"))
        words = [w for w in timed if w["line"] == int(n)]
        total = sum(len(w["w"]) + 2 for w in words)
        at = s
        for w in words:
            d = (e - s) * (len(w["w"]) + 2) / total
            w["s"], w["e"] = round(at, 2), round(at + d - 0.02, 2)
            at += d
        print(f"{n:>4}  {s:7.2f}-{e:7.2f}  {' '.join(w['w'] for w in words)}")
    with open(whisper_path, "w") as f:
        json.dump(timed, f, indent=1)


if __name__ == "__main__":
    cmd, *rest = sys.argv[1:]
    {"transcribe": transcribe, "align": align, "refine": refine, "setline": setline}[cmd](*rest)
