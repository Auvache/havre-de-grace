/*
 * 'Rocks in the Sea', 3:48, timed word by word — the score its film is cut to.
 *
 * GENERATED, then read by hand. Every line start was read against the vocal
 * stem, and five were set by eye; do not regenerate over them.
 *
 * HOW THE TIMES WERE MEASURED
 * The Norma Jeane method (goodbyeNormaJeaneScore.ts), as for every score since:
 *
 *   1. Separation. Demucs (htdemucs, two stems) on the mix decoded at 44.1 kHz.
 *      The voice sings in three blocks — 30.2 to 58.4, 73.2 to 136.1, and 152.6
 *      to 222.3 — with two fourteen-second instrumentals between them. The stem
 *      has some guitar in it from 12.6 to 19 (Whisper heard nothing there, and
 *      nothing is sung).
 *   2. Words. Whisper (medium, word timestamps) on the stem, prompted with the
 *      lyric. It heard every word but "talked" ("talk") and put nearly all of
 *      them in the right place; its text was thrown away and its times kept.
 *      It started five lines on the breath before them, by 0.5–1.6 s: "I don't
 *      have" (whisper 72.04, sung 73.20), "I can't seem" (86.76 / 87.65), "And
 *      the rocks" (93.22 / 94.66), "I talked" (151.54 / 152.62) and "About
 *      nothing" (157.22 / 159.16).
 *   3. The grid. The band played to a click: a comb fit of the mix's onsets
 *      gives 100 BPM with a beat at 0.54, the same phase in every 40-second
 *      block from the first bar to the last.
 *   4. Repeats. The last chorus is the first exactly 132 beats (79.2 s) later
 *      — every word Whisper placed in both agrees to within 0.1 s — so its five
 *      lines were solved once, on the pooled evidence of both, and shifted. The
 *      last chorus sings its first line in two phrases where the first chorus
 *      runs it together; the words fall at the same times either way. The
 *      closing "Oh, the sand by the rocks in the sea" is the last chorus's own.
 *   5. Syllables. A shortest path over (syllable, 10 ms slot), rewarded for
 *      landing on the stem's onset flux near a sixteenth of the click and
 *      charged for leaving the Whisper prior, with each line's first word
 *      pinned to the start read by eye from the stem at 30 ms.
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps. The five above were read, not solved,
 *     and each is a clean rise out of silence on the stem.
 *   - Least certain: "Is the sand" (123.30, and 202.50). The stem has a low
 *     shelf from 123.06 under the tail of "name" and the voice only comes up at
 *     123.42; the "Is" is a quick pickup somewhere in between. And "the sand"
 *     in the closing line (217.76, 217.89) is sung almost as one syllable.
 *   - Inner words of the long held lines ("It's always with me", "I miss the
 *     green") can sit 0.1–0.2 s off; the song is slow and legato.
 *   - "stay" lands at 179.93 and the last chorus starts 0.85 s later, with no
 *     instrumental between: the film's turn happens under the chorus.
 *   - 0–30.1 is intro; the band comes in at 1.7. The voice lets go of the last
 *     "sea" at 222.3 and band and voice end together, ringing down to silence
 *     by about 227.5.
 *
 * The lyric is the published one (content/music/into-the-wild.yml), punctuation
 * and all.
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
  line('verse-1', 30.16, 33.52, [[30.16, 'I'], [30.52, 'drove'], [31.15, 'by'], [31.76, 'my'], [32.35, 'hometown'], [33.52, 'today']]),
  line('verse-1', 37.48, 43.01, [[37.48, 'I'], [38.36, 'miss'], [38.95, 'the'], [39.39, 'green'], [40.59, 'but'], [41.05, 'I'], [41.34, "don't"], [41.94, 'miss'], [42.57, 'the'], [43.01, 'gray']]),
  line('verse-1', 44.72, 48.99, [[44.72, "It's"], [45.98, 'always'], [46.59, 'with'], [47.17, 'me,'], [47.94, 'what'], [48.56, 'a'], [48.99, 'shame']]),
  line('verse-1', 51.96, 57.54, [[51.96, "It's"], [53.17, 'always'], [53.79, 'with'], [54.53, 'me,'], [55.76, 'much'], [56.33, 'to'], [56.81, 'my'], [57.54, 'shame']]),

  line('verse-2', 73.20, 77.34, [[73.20, 'I'], [73.45, "don't"], [74.35, 'have'], [74.95, 'that'], [75.55, 'much'], [76.17, 'left'], [76.74, 'to'], [77.34, 'say']]),
  line('verse-2', 80.52, 85.89, [[80.52, "I'll"], [81.24, 'leave'], [81.50, 'all'], [82.12, 'my'], [82.74, 'things'], [83.95, 'and'], [84.53, 'just'], [85.15, 'drift'], [85.89, 'away']]),
  line('verse-2', 87.65, 91.75, [[87.65, 'I'], [88.11, "can't"], [88.89, 'seem'], [89.30, 'to'], [89.95, 'shake'], [90.54, 'all'], [91.29, 'this'], [91.75, 'rain']]),
  line('verse-2', 94.66, 100.58, [[94.66, 'And'], [95.19, 'the'], [95.78, 'rocks'], [95.94, 'in'], [96.82, 'the'], [97.14, 'water'], [98.03, 'have'], [98.78, 'been'], [99.54, 'calling'], [100.14, 'my'], [100.58, 'name']]),

  line('chorus-1', 101.58, 107.64, [[101.58, 'When'], [102.25, 'the'], [102.84, 'road'], [103.59, 'slims'], [104.32, 'down'], [105.54, 'and'], [106.01, 'the'], [106.29, 'trees'], [106.74, 'hide'], [107.33, 'the'], [107.64, 'sound']]),
  line('chorus-1', 108.68, 113.33, [[108.68, 'Of'], [109.89, 'hearts'], [110.35, 'leaving'], [111.10, 'home,'], [112.11, 'there'], [112.45, "you're"], [113.33, 'free']]),
  line('chorus-1', 116.02, 122.20, [[116.02, 'And'], [116.79, 'the'], [117.24, 'only'], [118.45, 'place'], [119.81, "that's"], [120.99, 'calling'], [121.29, 'your'], [122.20, 'name']]),
  line('chorus-1', 123.30, 127.58, [[123.30, 'Is'], [123.70, 'the'], [124.28, 'sand'], [124.74, 'by'], [125.48, 'the'], [125.79, 'rocks'], [126.54, 'in'], [127.16, 'the'], [127.58, 'sea']]),
  line('chorus-1', 130.92, 134.95, [[130.92, 'The'], [131.34, 'sand'], [131.93, 'by'], [132.55, 'the'], [132.98, 'rocks'], [133.76, 'in'], [134.50, 'the'], [134.95, 'sea']]),

  line('verse-3', 152.62, 155.93, [[152.62, 'I'], [152.94, 'talked'], [153.40, 'to'], [154.15, 'my'], [154.89, 'sister'], [155.93, 'today']]),
  line('verse-3', 159.16, 165.25, [[159.16, 'About'], [160.13, 'nothing'], [161.36, 'at'], [161.96, 'all'], [162.98, 'and'], [163.45, 'the'], [163.74, 'things'], [164.35, 'that'], [164.95, 'we'], [165.25, 'make']]),
  line('verse-3', 166.82, 170.80, [[166.82, 'I'], [167.47, 'stranded'], [168.23, 'those'], [169.14, 'rocks'], [169.74, 'by'], [170.36, 'the'], [170.80, 'bay']]),
  line('verse-3', 173.78, 179.93, [[173.78, 'For'], [174.37, 'the'], [174.70, 'ones'], [175.15, 'that'], [175.74, 'I'], [176.49, 'love,'], [177.23, 'oh'], [178.28, 'I'], [178.74, 'choose'], [179.34, 'to'], [179.93, 'stay']]),

  line('chorus-2', 180.78, 186.84, [[180.78, 'When'], [181.45, 'the'], [182.04, 'road'], [182.79, 'slims'], [183.52, 'down'], [184.74, 'and'], [185.21, 'the'], [185.49, 'trees'], [185.94, 'hide'], [186.53, 'the'], [186.84, 'sound']]),
  line('chorus-2', 187.88, 192.53, [[187.88, 'Of'], [189.09, 'hearts'], [189.55, 'leaving'], [190.30, 'home,'], [191.31, 'there'], [191.65, "you're"], [192.53, 'free']]),
  line('chorus-2', 195.22, 201.40, [[195.22, 'And'], [195.99, 'the'], [196.44, 'only'], [197.65, 'place'], [199.01, "that's"], [200.19, 'calling'], [200.49, 'your'], [201.40, 'name']]),
  line('chorus-2', 202.50, 206.78, [[202.50, 'Is'], [202.90, 'the'], [203.48, 'sand'], [203.94, 'by'], [204.68, 'the'], [204.99, 'rocks'], [205.74, 'in'], [206.36, 'the'], [206.78, 'sea']]),
  line('chorus-2', 210.12, 214.15, [[210.12, 'The'], [210.54, 'sand'], [211.13, 'by'], [211.75, 'the'], [212.18, 'rocks'], [212.96, 'in'], [213.70, 'the'], [214.15, 'sea']]),
  line('chorus-2', 216.90, 221.33, [[216.90, 'Oh,'], [217.76, 'the'], [217.89, 'sand'], [218.34, 'by'], [219.09, 'the'], [219.40, 'rocks'], [220.14, 'in'], [220.90, 'the'], [221.33, 'sea']]),
]

/** The mp3's valid frames (afinfo: 10,948,000 at 48 kHz), not the tracklist's 3:48. */
const DURATION = 228.083

/**
 * Nine sections. Boundaries sit in the gaps between sung blocks, and where a
 * section runs straight into the next (verse 2 into the chorus, verse 3 into
 * the last chorus) a quarter of a second before the next line's first word.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 29.6 },
  { id: 'verse-1', kind: 'verse', label: 'Verse 1', from: 29.6, to: 58.9 },
  { id: 'break-1', kind: 'break', label: 'Guitar', from: 58.9, to: 72.6 },
  { id: 'verse-2', kind: 'verse', label: 'Verse 2', from: 72.6, to: 101.33 },
  { id: 'chorus-1', kind: 'chorus', label: 'Chorus', from: 101.33, to: 136.6 },
  { id: 'break-2', kind: 'break', label: 'Guitar', from: 136.6, to: 152.1 },
  { id: 'verse-3', kind: 'verse', label: 'Verse 3', from: 152.1, to: 180.53 },
  { id: 'chorus-2', kind: 'chorus', label: 'Chorus', from: 180.53, to: 222.4 },
  { id: 'outro', kind: 'outro', label: 'End', from: 222.4, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const ROCKS_IN_THE_SEA_SCORE = {
  title: 'Rocks in the Sea',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/rocks-in-the-sea-mix.mp3',
  duration: DURATION,
  /**
   * The voice lets go of the last "sea" at 222.3 with the band, and the chord
   * rings down to silence by about 227.5 — the end card's logo and credits run
   * under it. Absolute song time; not moved by TRIM.
   */
  endCardAt: 222.4,
  /** 100 BPM, a beat at 0.54. Measured, and steady — the band played to a click. */
  bpm: 100,
  beatPhase: 0.54,
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
