/*
 * 'Ship to Stockholm', 4:16, timed word by word — the score its film is cut to.
 *
 * GENERATED, then read by hand. The line starts were set by eye against the
 * measurement; do not regenerate over them.
 *
 * HOW THE TIMES WERE MEASURED
 * The Norma Jeane method (goodbyeNormaJeaneScore.ts), as for Ivory and Conman:
 *
 *   1. Separation. Demucs (htdemucs, two stems) on the mp3 decoded at 44.1 kHz.
 *      The vocal stem's energy marks every sung block: 30.1–56.8, 60.0–86.6,
 *      112.1–139.4, 178.4–205.4 and 208.0–227.4. The rest is band: a 29-second
 *      intro, a 25-second break after verse 2, a 38-second instrumental after
 *      verse 3, and a 17-second outro and ring-out.
 *   2. Words. Whisper (medium, word timestamps) on the vocal stem, prompted
 *      with the lyric. It heard most of it — "waits a moment" for "waits on no
 *      man", "won't raise a thin eye" for "on razor thin ice", "in a way with
 *      their back" — and as before its text was thrown away and its times kept.
 *   3. The grid. The band played to a click: a comb fit of the mix's onset flux
 *      gives 105 BPM with a beat at x.51, the same phase within 45 ms in every
 *      block from the intro to the last hit.
 *   4. Repeats, by cross-correlating a 40-band log spectrogram of the vocal
 *      stem. Verses 1 to 4 are one melody, each a whole number of beats after
 *      the first: verse 2 at +52, verse 3 at +144, verse 4 at +260. Verse 5 is
 *      its own tune, sung faster — a line every five seconds, not every eight.
 *   5. Syllables. A shortest path over (word, 10 ms slot) within ±0.3 s of the
 *      Whisper prior, rewarded for landing on vocal-stem onset flux and for
 *      sitting near a sixteenth of the click, charged for leaving the prior.
 *      "Oh, away with the land and away with the light" and "So away with your
 *      guns and away with the fight" are the same ten words' worth of melody,
 *      so they were solved once on their pooled evidence and shifted by 144
 *      beats; so were "Tomorrow I will be a' sailing" and "(Or) tomorrow we
 *      will be a' fading".
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps. Each was read against the vocal
 *     stem's energy at 30 ms and fixed there; the solver only placed the words
 *     after the first. Whisper was early on nearly all of them — by 0.3 s on
 *     "Tomorrow", 0.47 s on "And the wind", 0.3 s on "If we make it back" —
 *     because it starts a word on the tail of the one before.
 *   - Verse 4 is sung "Oh, it's deep water rescue"; the published lyric starts
 *     at "It's", so that line's start (178.38, the "Oh") is before its first
 *     word. Every other held "oh" and "no" is in the published lyric.
 *   - Least certain: 'a'' in "a' sailing" and "a' fading" (half a syllable,
 *     run into the next word), and "want to" in verse 3, sung as one word.
 *   - After the last line the band plays the outro to a last hit on the beat
 *     at 244.51, and the record rings down to silence by about 251.
 *
 * The lyric is the published one (content/music/into-the-wild.yml), spelling
 * and all: "a' sailing", "a' fading".
 */

export type SectionKind =
  | 'intro'
  | 'verse'
  | 'prechorus'
  | 'chorus'
  | 'break'
  | 'bridge'
  | 'coda'
  | 'outro'

export interface ScoreSection {
  id: string
  kind: SectionKind
  /** Shown in the transport. */
  label: string
  from: number
  to: number
}

export interface ScoreWord {
  /** Seconds into the song, when this word's vowel lands. */
  t: number
  text: string
}

export interface ScoreLine {
  index: number
  section: string
  start: number
  /** The last word's onset — not where it stops ringing. */
  end: number
  text: string
  words: ScoreWord[]
}

/**
 * Sync trim, in seconds, folded into every measured time below. Zero until
 * somebody watches the finished film and hears it. Positive runs the picture late.
 */
const TRIM = 0

const at = (t: number) => Math.round((t + TRIM) * 1000) / 1000

const line = (section: string, start: number, end: number, words: [number, string][]) => ({
  section,
  start: at(start),
  end: at(end),
  text: words.map(([, text]) => text).join(' '),
  words: words.map(([t, text]) => ({ t: at(t), text })),
})

const RAW_LINES = [
  line('verse-1', 30.10, 34.94, [[30.10, 'Oh,'], [30.80, 'away'], [31.22, 'with'], [31.65, 'the'], [31.93, 'land'], [32.52, 'and'], [33.22, 'away'], [33.64, 'with'], [34.36, 'the'], [34.94, 'light']]),
  line('verse-1', 38.50, 41.65, [[38.50, 'Tomorrow'], [39.36, 'I'], [40.07, 'will'], [40.51, 'be'], [41.36, "a'"], [41.65, 'sailing']]),
  line('verse-1', 42.83, 47.37, [[42.83, 'Oh,'], [43.36, "I've"], [43.79, 'traveled'], [44.22, 'for'], [44.78, 'days'], [45.23, 'just'], [45.66, 'to'], [46.23, 'follow'], [46.93, 'the'], [47.37, 'night']]),
  line('verse-1', 51.05, 54.07, [[51.05, 'To'], [51.38, 'find'], [51.82, 'if'], [52.38, 'lost'], [52.81, 'love'], [53.08, 'is'], [53.50, 'worth'], [54.07, 'saving']]),

  line('verse-2', 59.98, 64.38, [[59.98, 'The'], [60.65, 'ship'], [61.08, 'back'], [61.37, 'to'], [61.67, 'Stockholm,'], [62.49, 'it'], [62.94, 'waits'], [63.36, 'on'], [63.91, 'no'], [64.38, 'man']]),
  line('verse-2', 67.85, 71.23, [[67.85, 'And'], [68.37, 'the'], [68.63, 'wind'], [68.94, "doesn't"], [69.62, 'wait'], [70.10, 'on'], [70.78, 'the'], [71.23, 'seasons']]),
  line('verse-2', 72.52, 77.08, [[72.52, 'Oh,'], [72.93, 'to'], [73.23, 'get'], [73.52, 'back'], [73.80, 'to'], [74.20, 'you'], [74.65, "I'd"], [75.08, 'do'], [75.51, 'all'], [75.79, 'that'], [76.09, 'I'], [77.08, 'can']]),
  line('verse-2', 81.03, 84.80, [[81.03, 'Bribing'], [82.22, 'or'], [82.54, 'begging'], [82.94, 'or'], [83.65, 'bleeding,'], [84.80, 'oh']]),

  line('verse-3', 112.20, 117.23, [[112.20, 'So'], [113.09, 'away'], [113.51, 'with'], [113.94, 'your'], [114.22, 'guns'], [114.81, 'and'], [115.51, 'away'], [115.93, 'with'], [116.65, 'the'], [117.23, 'fight']]),
  line('verse-3', 120.43, 123.94, [[120.43, 'Or'], [120.79, 'tomorrow'], [121.65, 'we'], [122.36, 'will'], [122.80, 'be'], [123.65, "a'"], [123.94, 'fading']]),
  line('verse-3', 125.10, 129.23, [[125.10, 'Oh,'], [125.64, "I'm"], [126.23, 'done'], [126.35, 'trying'], [126.65, 'to'], [126.94, 'prove'], [127.51, 'that'], [127.93, 'I'], [128.24, 'want'], [128.38, 'to'], [128.54, 'do'], [129.23, 'right']]),
  line('verse-3', 133.46, 137.94, [[133.46, "Everyone's"], [135.37, 'beyond'], [135.69, 'persuading,'], [137.94, 'oh']]),

  line('verse-4', 178.38, 183.51, [[179.18, "It's"], [179.65, 'deep'], [179.94, 'water'], [180.36, 'rescue'], [181.65, 'on'], [181.94, 'razor'], [182.76, 'thin'], [183.51, 'ice']]),
  line('verse-4', 187.05, 189.94, [[187.05, "We're"], [187.52, 'walking'], [188.08, 'a'], [188.49, 'tightrope'], [189.37, 'to'], [189.94, 'Eden']]),
  line('verse-4', 191.35, 195.93, [[191.35, 'So'], [191.94, 'away'], [192.38, 'with'], [192.68, 'your'], [192.96, 'dogs'], [193.91, 'and'], [194.21, 'away'], [194.66, 'with'], [195.23, 'their'], [195.93, 'bite']]),
  line('verse-4', 199.62, 203.81, [[199.62, 'The'], [200.65, "rhetoric's"], [201.51, 'not'], [201.80, 'worth'], [202.37, 'repeating,'], [203.81, 'no']]),

  line('verse-5', 208.05, 212.50, [[208.05, 'And'], [208.94, 'I'], [209.08, "don't"], [209.67, 'need'], [209.93, 'to'], [210.09, 'kiss'], [210.51, 'you,'], [210.80, 'no'], [211.07, 'I'], [211.36, 'just'], [211.78, 'need'], [211.95, 'to'], [212.50, 'ask']]),
  line('verse-5', 213.25, 216.94, [[213.25, 'If'], [213.66, 'we'], [214.09, 'make'], [214.37, 'it'], [214.65, 'back'], [215.38, 'could'], [215.66, 'we'], [216.09, 'hash'], [216.37, 'out'], [216.65, 'the'], [216.94, 'past']]),
  line('verse-5', 217.88, 221.51, [[217.88, 'I'], [218.24, "can't"], [218.79, 'seem'], [219.07, 'to'], [219.23, 'reach'], [219.51, 'you,'], [220.23, 'not'], [220.35, 'by'], [220.54, 'letter'], [220.95, 'or'], [221.51, 'phone']]),
  line('verse-5', 222.20, 225.51, [[222.20, 'So'], [222.66, "I'm"], [223.22, 'taking'], [223.65, 'the'], [224.08, 'ship'], [224.50, 'back'], [224.93, 'to'], [225.51, 'Stockholm']]),
]

const DURATION = 256.032

/**
 * Eight sections. Boundaries sit in the gaps between sung blocks, about half a
 * second after the voice stops, so a section's last line leaves when it does.
 * Verse 4 runs into verse 5 with two and a half seconds between them.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 29.5 },
  { id: 'verse-1', kind: 'verse', label: 'Away', from: 29.5, to: 57.6 },
  { id: 'verse-2', kind: 'verse', label: 'The ship', from: 57.6, to: 87.2 },
  { id: 'break', kind: 'break', label: 'Break', from: 87.2, to: 111.6 },
  { id: 'verse-3', kind: 'verse', label: 'Guns', from: 111.6, to: 139.9 },
  { id: 'instrumental', kind: 'break', label: 'Instrumental', from: 139.9, to: 177.9 },
  { id: 'verse-4', kind: 'verse', label: 'Thin ice', from: 177.9, to: 206.0 },
  { id: 'verse-5', kind: 'verse', label: 'Stockholm', from: 206.0, to: 228.0 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 228.0, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const SHIP_TO_STOCKHOLM_SCORE = {
  title: 'Ship to Stockholm',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/ship-to-stockholm.mp3',
  /** From `afinfo`, not from the tracklist's rounded 4:16. */
  duration: DURATION,
  /**
   * The last hit: the outro ends on a downbeat at 244.51 and rings down to
   * silence by about 251, so the end card's logo and credits run under the
   * ring-out. Absolute song time; not moved by TRIM.
   */
  endCardAt: 244.51,
  /** 105 BPM, a beat at 0.51. Measured, and steady — the band played to a click. */
  bpm: 105,
  beatPhase: 0.51,
  sections: SECTIONS,
  lines: LINES,
} as const

/** The line being sung at `t`, or the last one sung. */
export const lineAt = (t: number): ScoreLine | null => {
  let found: ScoreLine | null = null
  for (const candidate of LINES) {
    if (candidate.start > t + 0.001) break
    found = candidate
  }
  return found
}

export const sectionAt = (t: number): ScoreSection =>
  SECTIONS.find((section) => t >= section.from && t < section.to) ?? SECTIONS[SECTIONS.length - 1]!
