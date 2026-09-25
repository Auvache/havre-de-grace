/*
 * 'Meet Me at the Horizon', 3:40, timed word by word — the score its film is cut to.
 *
 * GENERATED, then read by hand. Fourteen line starts were set by eye against
 * the measurement; do not regenerate over them.
 *
 * HOW THE TIMES WERE MEASURED
 * The Norma Jeane method (goodbyeNormaJeaneScore.ts), as for the four after it:
 *
 *   1. Separation. Demucs (htdemucs, two stems) on the mp3 decoded at 44.1 kHz.
 *      The vocal stem is almost never silent: the voice comes in at 17.3 and
 *      is singing, with gaps of a second or two, until 194.9. The only
 *      instrumental stretches are the 17-second intro and the 17-second outro
 *      before the last strike. Nothing in between is unsung for long enough to
 *      call a break, which is why there is no break section.
 *   2. Words. Whisper (medium, word timestamps) on the stem, prompted with the
 *      lyric. It heard nearly all of it, and it hears the chorus as "the
 *      darker the night" every time. The published "the dark of the night" is
 *      two syllables to the same notes, and it stands, as does "straighten my
 *      spine" (heard "strain in my spine"). Its text was thrown away and its
 *      times kept. It ran the "Oh won't you" of each hook into the held
 *      "horizon" and put it three seconds late.
 *   3. The grid. The band played to a click: a comb fit of the mix's onsets
 *      gives 55.0 BPM (felt at 110) with a beat at 0.48, the same phase in
 *      every 40-second block from the first bar to the outro.
 *   4. Repeats, by cross-correlating a 40-band log spectrogram of the stem, and
 *      every one is a whole number of beats: verse 2 is verse 1's tune at +16;
 *      the second chorus is the first at +50 (54.55 s), the third at +98
 *      (106.91 s); the last verse is the first at +114 (124.36 s); the second
 *      hook is the first at +48 (52.36 s). Each at correlation 0.72–0.91.
 *   5. Syllables. A shortest path over (syllable, 10 ms slot), rewarded for
 *      landing on the stem's onset flux near a sixteenth of the click and
 *      charged for leaving the Whisper prior; lines sung to the same words in
 *      different choruses were solved once on the pooled evidence and shifted
 *      by the measured offsets. Then every line start was read against the
 *      stem's energy at 30 ms and fourteen were moved, by 0.05–0.4 s: the
 *      solver started lines on the tail of the word before.
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps, except the three below. Several were
 *     confirmed on a repeat: "Then the sun" is at 52.28, not Whisper's 51.94,
 *     because the third chorus's "And the sun" comes up out of silence at
 *     159.21, exactly +98 beats later.
 *   - Least certain: "And I wonder" (39.28), sung softly out of the held "sky",
 *     where the stem has a low shelf from 38.95 and the voice only comes up at
 *     39.3; "Oh, I could be the sky" (102.40), where the "Oh" may begin as
 *     early as 102.1 under the tail of "wind"; and the first "No" (17.30, and
 *     141.66 in the last verse), which has a quiet pickup 0.35 s before it in
 *     both verses that could be the start of the word or a breath.
 *   - Inner words of legato lines ("happens right after", "absence of light")
 *     can sit 0.1–0.2 s off.
 *   - Each hook's "Oh" is one note held for three and a half seconds (129.80 to
 *     133.2, and 182.16 to 185.5), set by a pitch step up out of "horizon";
 *     "won't you" drop back down. The last "oh" (190.85) is held to 193.6 and
 *     slides down to the end of the voice at 194.9.
 *   - 0–17.0 is intro. After the voice the band plays on to one last strike at
 *     211.86, which rings down to silence by about 216.
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
  line('verse-1', 17.30, 21.09, [[17.30, 'No,'], [17.65, 'I'], [17.94, "don't"], [18.35, 'need'], [18.75, 'a'], [19.17, 'friend.'], [19.58, 'No,'], [19.97, 'I'], [20.25, "don't"], [20.66, 'need'], [20.80, 'a'], [21.09, 'lover']]),
  line('verse-1', 22.24, 25.42, [[22.24, 'Some'], [22.68, 'nights'], [23.12, 'the'], [23.40, 'darkness'], [24.22, 'is'], [24.76, 'sweeter'], [25.16, 'than'], [25.42, 'others']]),
  line('verse-1', 26.34, 29.80, [[26.34, 'Just'], [26.66, 'me'], [27.21, 'and'], [27.49, 'my'], [27.89, 'thoughts,'], [28.83, 'no'], [29.23, 'counting'], [29.80, 'sheep']]),
  line('verse-1', 30.43, 34.03, [[30.43, 'When'], [30.76, 'the'], [31.44, 'absence'], [31.84, 'of'], [32.27, 'light'], [32.66, "doesn't"], [33.21, 'mean'], [33.48, 'that'], [33.76, 'I'], [34.03, 'sleep']]),

  line('verse-2', 35.08, 38.38, [[35.08, 'I'], [35.40, 'lie'], [35.94, 'in'], [36.19, 'my'], [36.76, 'bed'], [37.03, 'and'], [37.44, 'I'], [37.83, 'think'], [37.99, 'of'], [38.26, 'the'], [38.38, 'sky']]),
  line('verse-2', 39.28, 42.75, [[39.28, 'And'], [39.63, 'I'], [39.89, 'wonder'], [40.57, 'what'], [40.86, 'happens'], [41.66, 'right'], [42.07, 'after'], [42.47, 'we'], [42.75, 'die']]),
  line('verse-2', 43.77, 47.25, [[43.77, 'Should'], [44.11, 'I'], [44.54, 'be'], [45.06, 'afraid,'], [46.16, 'will'], [46.31, 'my'], [46.71, 'troubles'], [47.25, 'end']]),
  line('verse-2', 47.89, 51.46, [[47.89, 'Does'], [48.34, 'the'], [48.62, 'whole'], [49.02, 'process'], [49.69, 'repeat'], [50.39, 'again'], [51.19, 'and'], [51.46, 'again']]),

  line('chorus-1', 52.28, 56.10, [[52.28, 'Then'], [52.58, 'the'], [52.99, 'sun'], [53.28, 'starts'], [53.67, 'to'], [54.21, 'wake,'], [54.74, 'the'], [55.16, 'trees'], [55.45, 'start'], [55.84, 'to'], [56.10, 'yawn']]),
  line('chorus-1', 56.68, 60.34, [[56.68, 'And'], [57.20, 'the'], [57.34, 'dark'], [57.61, 'of'], [57.88, 'the'], [58.43, 'night'], [58.71, 'meets'], [59.12, 'a'], [59.40, 'glimpse'], [59.79, 'of'], [60.21, 'the'], [60.34, 'dawn']]),
  line('chorus-1', 61.22, 64.71, [[61.22, 'The'], [61.70, 'whole'], [62.12, "world's"], [62.67, 'asleep,'], [63.48, "it's"], [64.06, 'too'], [64.28, 'dark'], [64.44, 'to'], [64.71, 'see']]),
  line('chorus-1', 65.27, 69.35, [[65.27, 'So'], [65.53, 'I'], [65.67, 'can'], [65.93, 'lie'], [66.34, 'here'], [66.89, 'and'], [67.31, 'feel'], [67.57, 'like'], [67.85, "you're"], [68.13, 'still'], [68.53, 'next'], [68.94, 'to'], [69.35, 'me']]),

  line('verse-3', 72.12, 75.47, [[72.12, 'Do'], [72.48, 'I'], [72.89, 'call'], [73.30, 'you'], [73.58, 'first'], [73.98, 'or'], [74.39, 'wait'], [74.68, 'for'], [74.94, 'you'], [75.20, 'to'], [75.47, 'call']]),
  line('verse-3', 76.80, 80.37, [[76.80, 'Fever'], [77.66, 'kicks'], [78.07, 'in'], [78.48, 'and'], [78.73, 'my'], [79.04, 'skin'], [79.40, 'starts'], [79.83, 'to'], [80.37, 'crawl']]),
  line('verse-3', 81.48, 84.35, [[81.48, 'Unnatural'], [82.02, 'tension'], [82.57, 'in'], [83.12, 'my'], [83.52, 'brain'], [83.79, 'and'], [83.94, 'my'], [84.35, 'eyes']]),
  line('verse-3', 84.72, 88.83, [[84.72, 'And'], [85.44, 'the'], [85.85, 'headache'], [86.38, 'evolves'], [87.20, 'when'], [87.61, 'I'], [87.89, 'straighten'], [88.57, 'my'], [88.83, 'spine']]),

  line('verse-4', 89.61, 93.22, [[89.61, 'My'], [90.07, 'blood'], [90.33, 'runs'], [90.73, 'too'], [91.17, 'thick'], [91.44, 'and'], [91.83, 'my'], [92.12, 'mind'], [92.52, 'runs'], [92.92, 'too'], [93.22, 'deep']]),
  line('verse-4', 93.61, 97.70, [[93.61, 'And'], [94.02, 'the'], [94.42, 'room'], [94.69, 'breaks'], [95.12, 'the'], [95.65, 'silence'], [96.20, 'when'], [96.34, 'the'], [96.75, 'house'], [96.99, 'starts'], [97.30, 'to'], [97.70, 'creak']]),
  line('verse-4', 98.31, 101.80, [[98.31, 'The'], [99.06, 'windows'], [99.47, 'are'], [99.90, 'open'], [100.57, 'to'], [100.85, 'let'], [101.25, 'in'], [101.53, 'the'], [101.80, 'wind']]),
  line('verse-4', 102.40, 106.57, [[102.40, 'Oh,'], [102.89, 'I'], [103.16, 'could'], [103.43, 'be'], [103.84, 'the'], [104.13, 'sky'], [104.52, 'if'], [104.68, 'I'], [105.07, 'could'], [105.34, 'only'], [106.03, 'give'], [106.57, 'in']]),

  line('chorus-2', 106.83, 110.65, [[106.83, 'Then'], [107.13, 'the'], [107.54, 'sun'], [107.83, 'starts'], [108.22, 'to'], [108.76, 'wake,'], [109.29, 'the'], [109.71, 'trees'], [110.00, 'start'], [110.39, 'to'], [110.65, 'yawn']]),
  line('chorus-2', 111.23, 114.89, [[111.23, 'And'], [111.75, 'the'], [111.89, 'dark'], [112.16, 'of'], [112.43, 'the'], [112.98, 'night'], [113.26, 'meets'], [113.67, 'a'], [113.95, 'glimpse'], [114.34, 'of'], [114.76, 'the'], [114.89, 'dawn']]),
  line('chorus-2', 115.71, 119.26, [[115.71, 'The'], [116.25, 'whole'], [116.67, "world's"], [117.22, 'asleep,'], [118.03, "it's"], [118.61, 'too'], [118.83, 'dark'], [118.99, 'to'], [119.26, 'see']]),
  line('chorus-2', 119.82, 124.31, [[119.82, 'So'], [120.08, 'I'], [120.22, 'can'], [120.48, 'lie'], [120.89, 'here'], [121.44, 'and'], [121.86, 'feel'], [122.12, 'like'], [122.40, "you're"], [122.68, 'still'], [123.08, 'next'], [123.49, 'to'], [123.90, 'me,'], [124.31, 'so']]),

  line('hook-1', 127.66, 129.07, [[127.66, 'Meet'], [128.12, 'me'], [128.51, 'at'], [128.66, 'the'], [129.07, 'horizon']]),
  line('hook-1', 129.80, 133.62, [[129.80, 'Oh'], [133.20, "won't"], [133.62, 'you']]),
  line('hook-1', 136.47, 137.80, [[136.47, 'Meet'], [136.86, 'me'], [137.25, 'at'], [137.39, 'the'], [137.80, 'horizon']]),

  line('verse-5', 141.66, 145.45, [[141.66, 'No,'], [142.01, 'I'], [142.30, "don't"], [142.71, 'need'], [143.11, 'a'], [143.53, 'friend.'], [143.94, 'No,'], [144.33, 'I'], [144.61, "don't"], [145.02, 'need'], [145.16, 'a'], [145.45, 'lover']]),
  line('verse-5', 146.58, 149.80, [[146.58, 'Some'], [147.08, 'nights'], [147.49, 'the'], [147.77, 'darkness'], [148.60, 'cuts'], [148.89, 'deeper'], [149.39, 'than'], [149.80, 'others']]),
  line('verse-5', 150.68, 154.04, [[150.68, 'Just'], [151.04, 'me'], [151.57, 'and'], [151.84, 'my'], [152.25, 'thoughts'], [152.54, 'in'], [153.07, 'that'], [153.33, 'bed'], [153.60, 'all'], [154.04, 'alone']]),
  line('verse-5', 154.84, 158.66, [[154.84, 'When'], [155.13, 'the'], [155.40, 'dawning'], [156.20, 'of'], [156.49, 'day'], [157.03, 'brings'], [157.31, 'a'], [157.58, 'sliver'], [158.39, 'of'], [158.66, 'hope']]),

  line('chorus-3', 159.21, 162.89, [[159.21, 'And'], [159.49, 'the'], [159.89, 'sun'], [160.16, 'starts'], [160.57, 'to'], [161.12, 'wake'], [161.26, 'and'], [161.66, 'the'], [162.07, 'trees'], [162.35, 'start'], [162.75, 'to'], [162.89, 'yawn']]),
  line('chorus-3', 163.84, 167.38, [[163.84, 'The'], [164.22, 'dark'], [164.52, 'of'], [164.80, 'the'], [165.21, 'night'], [165.62, 'finds'], [166.03, 'relief'], [166.69, 'in'], [167.11, 'the'], [167.38, 'dawn']]),
  line('chorus-3', 168.21, 171.35, [[168.21, 'The'], [168.62, 'whole'], [169.04, "world's"], [169.57, 'asleep,'], [170.12, 'that'], [170.67, 'is'], [171.09, 'except'], [171.35, 'me']]),
  line('chorus-3', 172.18, 176.69, [[172.18, 'And'], [172.59, 'I'], [172.97, 'lie'], [173.28, 'here'], [173.79, 'and'], [174.07, 'miss'], [174.35, 'the'], [174.76, 'way'], [175.05, 'things'], [175.57, 'used'], [176.11, 'to'], [176.25, 'be,'], [176.69, 'so']]),

  line('hook-2', 180.02, 181.43, [[180.02, 'Meet'], [180.48, 'me'], [180.87, 'at'], [181.02, 'the'], [181.43, 'horizon']]),
  line('hook-2', 182.16, 185.98, [[182.16, 'Oh'], [185.56, "won't"], [185.98, 'you']]),
  line('hook-2', 188.83, 190.85, [[188.83, 'Meet'], [189.22, 'me'], [189.61, 'at'], [189.75, 'the'], [190.16, 'horizon,'], [190.85, 'oh']]),
]

/** The mp3's valid frames (afinfo: 10,580,015 at 48 kHz), not the tracklist's 3:40. */
const DURATION = 220.417

/**
 * Twelve sections. Boundaries sit in the gaps between sung blocks where there
 * are gaps, and where a section runs straight into the next (verse 4 into the
 * second chorus, the last verse into the third) a quarter of a second before
 * the next line's first word.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 16.8 },
  { id: 'verse-1', kind: 'verse', label: 'Verse 1', from: 16.8, to: 34.7 },
  { id: 'verse-2', kind: 'verse', label: 'Verse 2', from: 34.7, to: 52.0 },
  { id: 'chorus-1', kind: 'chorus', label: 'Chorus', from: 52.0, to: 71.3 },
  { id: 'verse-3', kind: 'verse', label: 'Verse 3', from: 71.3, to: 89.35 },
  { id: 'verse-4', kind: 'verse', label: 'Verse 4', from: 89.35, to: 106.72 },
  { id: 'chorus-2', kind: 'chorus', label: 'Chorus', from: 106.72, to: 126.4 },
  { id: 'hook-1', kind: 'bridge', label: 'Meet me', from: 126.4, to: 140.9 },
  { id: 'verse-5', kind: 'verse', label: 'Verse 5', from: 140.9, to: 159.0 },
  { id: 'chorus-3', kind: 'chorus', label: 'Chorus', from: 159.0, to: 178.6 },
  { id: 'hook-2', kind: 'coda', label: 'Meet me', from: 178.6, to: 195.4 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 195.4, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const MEET_ME_AT_THE_HORIZON_SCORE = {
  title: 'Meet Me at the Horizon',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/meet-me-at-the-horizon.mp3',
  duration: DURATION,
  /**
   * The last strike: after the voice lets go at 194.9 the band plays on for
   * seventeen seconds and ends on one chord at 211.86, which rings down to
   * silence by about 216 — the end card's logo and credits run under it.
   * Absolute song time; not moved by TRIM.
   */
  endCardAt: 211.86,
  /** 55 BPM (felt at 110), a beat at 0.48. Measured, and steady — the band played to a click. */
  bpm: 55,
  beatPhase: 0.48,
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
