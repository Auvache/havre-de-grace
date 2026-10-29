"""
Write app/config/<song>Score.ts from album-lines.py's output.

    python album-score.py <workdir-root>

<workdir-root> holds one album-lines.py workdir per song, named as in SONGS
below. Each song's lines.json gives the line spans, timed.json the word starts,
words.json Whisper's confidence, and the album-lines log the lines `align` had
to guess. HAND holds the lines read by hand against the vocal stem's energy
(the sung stretches, at 10 ms) where the alignment was wrong; they replace the
measured span. The output is the shape the Into the Wild score files export
(SECTIONS, LINES, <NAME>_SCORE, lineAt, sectionAt), with the method and a
WHAT TO TRUST note at the top.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# workdir, album slug, track number, file stem, export name
SONGS = [
    ("ghost", "into-the-wild", 10, "ghost", "GHOST"),
    ("iwtby-1", "i-want-to-be-yours-and-other-songs", 1, "iWantToBeYours", "I_WANT_TO_BE_YOURS"),
    ("iwtby-2", "i-want-to-be-yours-and-other-songs", 2, "shadesOfBlueAndRed", "SHADES_OF_BLUE_AND_RED"),
    ("iwtby-3", "i-want-to-be-yours-and-other-songs", 3, "skyBlue", "SKY_BLUE"),
    ("iwtby-4", "i-want-to-be-yours-and-other-songs", 4, "scarecrow", "SCARECROW"),
    ("iwtby-5", "i-want-to-be-yours-and-other-songs", 5, "jesusCreek", "JESUS_CREEK"),
    ("iwtby-6", "i-want-to-be-yours-and-other-songs", 6, "demolitionWoman", "DEMOLITION_WOMAN"),
    ("iwtby-7", "i-want-to-be-yours-and-other-songs", 7, "whiteRaven", "WHITE_RAVEN"),
    ("iwtby-8", "i-want-to-be-yours-and-other-songs", 8, "songForTheSick", "SONG_FOR_THE_SICK"),
    ("iwtby-9", "i-want-to-be-yours-and-other-songs", 9, "iWantToBeYoursDemo", "I_WANT_TO_BE_YOURS_DEMO"),
]

# Lines placed by hand: {workdir: {line index: (start, end, why)}}. Starts are
# where a sung stretch of the vocal stem begins; ends are read from the same.
HAND = {
    "ghost": {
        3: (47.06, 51.40, "the second 'The city burns' was set in the gap before it; the voice comes in at 47.06"),
    },
    "iwtby-5": {
        12: (112.22, 116.30, "'On Sunday' was run on from the line before; sung after a 3.5 s gap"),
    },
    "iwtby-6": {
        8: (58.43, 60.00, "squeezed into 0.3 s by the alignment; the first 'Music comes in movements' is the stretch at 58.43"),
        9: (60.08, 62.20, "squeezed with the line above; spaced as the last chorus sings it (+1.65 s)"),
    },
    "iwtby-7": {
        0: (29.52, 31.90, "stretched back over 24 s of guitar; the voice comes in at 29.52"),
        8: (116.93, 119.50, "the chorus was squeezed into 1.6 s; these are its four sung stretches"),
        9: (123.84, 126.50, "the chorus, second stretch"),
        10: (129.89, 132.50, "the chorus, third stretch"),
        21: (259.59, 262.50, "the last chorus's second stretch, 6.6 s after its first, as in the first chorus"),
        23: (271.10, 275.50, "inside one long held stretch (265.5-279.1); placed by the first chorus's spacing, least certain"),
    },
}


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return round(float(out), 3)


def guessed_lines(log):
    """The align step marks lines it had to guess; refine doesn't renumber them."""
    texts = []
    for line in open(log):
        m = re.match(r"\s*[\d.]+-\s*[\d.]+\s+(.*?)\s+<- timing guessed", line)
        if m:
            texts.append(m.group(1))
    return texts


def ts_string(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def write(root, work, album, track, stem, name):
    d = os.path.join(root, work)
    lines = json.load(open(os.path.join(d, "lines.json")))
    timed = json.load(open(os.path.join(d, "timed.json")))
    heard = json.load(open(os.path.join(d, "words.json")))
    guessed = guessed_lines(os.path.join(root, f"{work}.log"))
    hand = HAND.get(work, {})
    title = lines["title"]
    src = lines["src"]
    dur = duration(os.path.join(ROOT, "public", src.lstrip("/")))

    words_by_line = {}
    for w in timed:
        words_by_line.setdefault(w["line"], []).append(w)

    out_lines, least = [], []
    guessed_left = list(guessed)
    for i, l in enumerate(lines["lines"]):
        words = words_by_line[l["line"]]
        s, e = l["s"], l["e"]
        note = None
        if i in hand:
            s, e, note = hand[i]
            # spread the words over the hand-set span by length, like lyrics.py setline
            total = sum(len(w["w"]) + 2 for w in words)
            at, ws = s, []
            for w in words:
                ws.append((round(at, 2), w["w"]))
                at += (e - s) * (len(w["w"]) + 2) / total
        else:
            ws = [(round(w["s"], 2), w["w"]) for w in words]
        text = " ".join(w["w"] for w in words)
        was_guessed = text in guessed_left
        if was_guessed:
            guessed_left.remove(text)
        if note:
            least.append(f"{s:.2f}  '{text}' (set by hand: {note})")
        elif was_guessed:
            least.append(f"{s:.2f}  '{text}' (the alignment guessed it; start snapped to the voice)")
        out_lines.append((l["block"], s, e, ws, bool(note) or was_guessed))

    blocks = sorted({b for b, *_ in out_lines})
    sections = []
    for n, b in enumerate(blocks):
        members = [x for x in out_lines if x[0] == b]
        first = members[0][1]
        label = " ".join(w for _, w in members[0][3][:3]).rstrip(",.?")
        sections.append((f"block-{n + 1}", label, first))

    stamp = f"'{title}', {int(dur // 60)}:{int(dur % 60):02d}, timed line by line for the album screen."
    trust = "\n".join(f" *     {x}" for x in least) or " *     (none flagged)"
    body = f"""/*
 * {stamp}
 *
 * GENERATED by tools/captions/album-score.py from album-lines.py's output,
 * then checked against the vocal stem. Line level is the decision (SITE-REFRESH.md):
 * each line writes itself across [start, end] on the album screen. The word
 * times are Whisper's, snapped to the voice; nothing should rely on them.
 *
 * HOW THE TIMES WERE MEASURED
 *   1. Separation. Demucs (htdemucs, two stems) on the mp3 at 44.1 kHz.
 *   2. Words. Whisper (large-v3, word timestamps) on the vocal stem. Its text
 *      was thrown away; the published lyric (content/music/{album}.yml) was laid
 *      over its words by tools/captions/lyrics.py `align`.
 *   3. Starts. lyrics.py `refine` moved each word whose start sat in a gap to
 *      where the vocal stem's energy climbs (the voice coming in).
 *   4. Checked. Every line start was compared with the sung stretches of the
 *      stem (energy above its 95th percentile -20 dB, 10 ms frames); lines in a
 *      gap, squeezed under a second, or stretched past 7.5 s were re-read and
 *      set by hand.
 *
 * WHAT TO TRUST
 *   - Line starts: within a frame or two at 30 fps where the voice comes in
 *     after a breath; a line sung straight on from the one before it can be a
 *     tenth early or late. Ends: the last word's end, to about a tenth.
 *   - Least certain, by ear first:
{trust}
 *   - Not checked by ear yet. Stefan to listen through /tools/lyric-timing.
 */

import type {{ ScoreLine, ScoreSection }} from './ivoryScore'

/** Sync trim, in seconds, folded into every time below. Positive runs the words late. */
const TRIM = 0

const at = (t: number) => Math.round((t + TRIM) * 1000) / 1000

const line = (section: string, start: number, end: number, words: [number, string][]) => ({{
  section,
  start: at(start),
  end: at(end),
  text: words.map(([, text]) => text).join(' '),
  words: words.map(([t, text]) => ({{ t: at(t), text }})),
}})

const RAW_LINES = [
"""
    prev_block = None
    for b, s, e, ws, flag in out_lines:
        if prev_block is not None and b != prev_block:
            body += "\n"
        prev_block = b
        sec = f"block-{blocks.index(b) + 1}"
        words = ", ".join(f"[{t:.2f}, {ts_string(w)}]" for t, w in ws)
        body += f"  line('{sec}', {s:.2f}, {e:.2f}, [{words}]),{'  // check' if flag else ''}\n"
    body += f"""]

const DURATION = {dur}

/** One section per stanza of the published lyric, from where its first line starts. */
const RAW_SECTIONS: ScoreSection[] = [
"""
    for n, (sid, label, first) in enumerate(sections):
        frm = 0 if n == 0 else round(first - 0.5, 2)
        to = round(sections[n + 1][2] - 0.5, 2) if n + 1 < len(sections) else dur
        body += f"  {{ id: '{sid}', kind: 'verse', label: {ts_string(label)}, from: {frm}, to: {to} }},\n"
    body += f"""]

export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({{
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({{ index, ...raw }}))

/** The lines to check by ear first (the `// check` ones above), by index. */
export const CHECK: number[] = [{", ".join(str(i) for i, x in enumerate(out_lines) if x[4])}]

export const {name}_SCORE = {{
  title: {ts_string(title)},
  src: '{src}',
  duration: DURATION,
  sections: SECTIONS,
  lines: LINES,
}} as const

/** The line being sung at `t`, or the last one sung. */
export const lineAt = (t: number): ScoreLine | null => {{
  let found: ScoreLine | null = null
  for (const candidate of LINES) {{
    if (candidate.start > t + 0.001) break
    found = candidate
  }}
  return found
}}

export const sectionAt = (t: number): ScoreSection =>
  SECTIONS.find((section) => t >= section.from && t < section.to) ?? SECTIONS[SECTIONS.length - 1]!
"""
    path = os.path.join(ROOT, "app", "config", f"{stem}Score.ts")
    open(path, "w").write(body)
    print(f"wrote {path}: {len(out_lines)} lines, {len(least)} to check")
    return least


if __name__ == "__main__":
    root = sys.argv[1]
    report = {}
    for song in SONGS:
        report[song[3]] = write(root, *song)
    json.dump(report, open(os.path.join(root, "least-certain.json"), "w"), indent=1)
