/*
 * 'Ivory', 3:08, timed word by word — the score its film is cut to.
 *
 * GENERATED, then read by hand. The lines under "WHAT TO TRUST" were set by
 * eye against the measurement; do not regenerate over them.
 *
 * HOW THE TIMES WERE MEASURED
 * The method that timed "Goodbye, Norma Jeane" (goodbyeNormaJeaneScore.ts),
 * which is now the first thing to try on any song:
 *
 *   1. Separation. Demucs (htdemucs, two stems) on the mp3 decoded at 44.1 kHz.
 *      The vocal stem's energy marks every sung block to a frame: 9.3–19.9,
 *      27.3–39.7, 40.7–43.9, 46.0–56.9, 64.2–75.3, 82.5–86.4, 87.1–93.4,
 *      95.6–99.2, 100.8–111.2, 128.2–131.9, 132.4–139.3, 141.3–144.5,
 *      146.5–166.8 and 173.3–176.9.
 *   2. Words. Whisper (medium, word timestamps) on the vocal stem, prompted
 *      with the lyric. It heard this one far better than Norma Jeane — "open,
 *      all shone in" for "open ocean and", "I breathe" for the bridge's
 *      "Ivory" — and its text was thrown away as before; only its times kept.
 *   3. The grid. The band played to a click: a comb fit of the mix's onset
 *      flux gives 105.0 BPM with a beat at x.36, the same phase within 15 ms
 *      in every block from the intro to the ring-out.
 *   4. Repeats, by cross-correlating a 40-band log spectrogram of the vocal
 *      stem. The second half of the song is the first at +54.86 s, exactly 96
 *      beats (verse 2 on verse 1, "Right up there" on "Her eyes", "Paradise"
 *      on "California"), and the last chorus's "Looks like California" is the
 *      first's at +100.57 s, exactly 176 beats.
 *   5. Syllables. A shortest path over (word, 10 ms slot) within ±0.3 s of the
 *      Whisper prior, rewarded for landing on vocal-stem onset flux and for
 *      sitting near a sixteenth of the click, charged for leaving the prior.
 *      Lines sung to the same words — both "Looks like California", both
 *      "If I wanted paradise", both "avoid the heartache" and the three
 *      "Oh, Ivory"s — were solved once on their pooled evidence and shifted by
 *      the measured offsets.
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps. Each was read against the vocal
 *     stem's energy at 30 ms and moved where the solver was off: 'Her' (was
 *     26.93), both 'Looks' (45.65, 146.22), both 'If' (100.37, 155.23), and
 *     the final chorus's soft 'But' (159.40).
 *   - The long 'Ivory's — 40.78, 95.64, 141.28, 173.37 — are sung over three
 *     seconds each, and the time is where the voice comes in. Whisper put all
 *     four near their ends. The bridge's is a whole second later than the
 *     section's shape suggests: after "breathe, oh" there is a second "oh" and
 *     then a gap.
 *   - Least certain: 'to' in "want to get" (50.90), sung as "wanna" with no
 *     onset of its own; 'in the trees' (154.08–154.49), three words in 0.4 s;
 *     and every 'a', 'the' and 'I' inside a line.
 *   - 19.9–27.3, 56.9–64.2, 111.2–128.2 and 176.9 to the end have no lyric.
 *     The "oh, whoa" after "stop and stare" and "back at me" (73.5–75.3,
 *     91.9–93.4) is sung but set only as the published "oh".
 *
 * The lyric is the published one (content/music/into-the-wild.yml), spelling
 * and all: 'Too avoid the heartache'.
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
  line('verse-1', 9.36, 13.36, [[9.36, 'That'], [9.93, "there's"], [10.65, 'a'], [10.81, 'woman,'], [11.49, 'of'], [11.78, 'that'], [12.07, 'you'], [12.21, 'can'], [12.66, 'be'], [13.36, 'sure']]),
  line('verse-1', 14.22, 18.36, [[14.22, 'Eyes'], [14.64, 'that'], [14.79, 'hit'], [14.94, 'a'], [15.35, 'sunrise'], [15.79, 'like'], [16.39, 'waves'], [16.81, 'that'], [17.09, 'hit'], [17.35, 'a'], [17.64, 'shore,'], [18.36, 'oh']]),

  line('her-eyes', 27.30, 31.36, [[27.30, 'Her'], [27.79, 'eyes'], [28.22, 'are'], [28.63, 'open'], [29.07, 'ocean'], [29.91, 'and'], [30.08, 'blue'], [30.34, 'butterfly'], [31.36, 'wings']]),
  line('her-eyes', 31.94, 36.80, [[31.94, "She's"], [32.36, 'got'], [32.65, 'some'], [33.08, 'way'], [33.40, 'about'], [33.77, 'her'], [34.08, 'when'], [34.34, 'she'], [34.65, 'gets'], [34.91, 'on'], [35.22, 'stage'], [35.64, 'and'], [36.21, 'sings,'], [36.80, 'oh']]),
  line('her-eyes', 40.78, 40.78, [[40.78, 'Ivory']]),

  line('california', 45.95, 49.22, [[45.95, 'Looks'], [46.37, 'like'], [46.80, 'California,'], [48.65, 'sounds'], [48.80, 'like'], [49.22, 'Tennessee']]),
  line('california', 50.08, 53.52, [[50.08, 'I'], [50.64, 'want'], [50.90, 'to'], [51.07, 'get'], [51.50, 'to'], [51.65, 'know'], [51.94, 'her,'], [52.38, 'she'], [52.80, 'remains'], [53.24, 'my'], [53.52, 'mystery']]),
  line('california', 54.36, 55.08, [[54.36, 'Oh,'], [55.08, 'Ivory']]),

  line('verse-2', 64.22, 67.93, [[64.22, 'That'], [64.78, "there's"], [65.51, 'a'], [65.66, 'woman'], [65.94, 'with'], [66.66, 'flowers'], [67.06, 'in'], [67.51, 'her'], [67.93, 'hair']]),
  line('verse-2', 68.81, 73.51, [[68.81, 'When'], [69.20, 'she'], [69.64, 'moves,'], [69.96, 'the'], [70.36, 'universe'], [70.94, "can't"], [71.36, 'help'], [71.65, 'but'], [72.07, 'stop'], [72.35, 'and'], [72.93, 'stare,'], [73.51, 'oh']]),

  line('beside-her', 82.52, 85.92, [[82.52, 'Right'], [82.93, 'up'], [83.22, 'there'], [83.52, 'beside'], [84.35, 'her'], [84.80, 'is'], [85.08, 'where'], [85.36, 'I'], [85.49, 'want'], [85.79, 'to'], [85.92, 'be']]),
  line('beside-her', 87.07, 91.93, [[87.07, 'When'], [87.49, 'I'], [87.93, 'asked'], [88.07, 'her'], [88.37, 'for'], [88.62, 'her'], [89.08, 'name,'], [89.33, 'she'], [89.51, 'looked'], [89.94, 'straight'], [90.34, 'back'], [90.79, 'at'], [90.91, 'me,'], [91.93, 'oh']]),
  line('beside-her', 95.64, 95.64, [[95.64, 'Ivory']]),

  line('paradise', 100.85, 103.80, [[100.85, 'If'], [101.23, 'I'], [101.64, 'wanted'], [102.07, 'paradise,'], [102.91, "I'd"], [103.36, 'play'], [103.66, 'a'], [103.80, 'melody']]),
  line('paradise', 105.36, 108.93, [[105.36, 'Too'], [105.79, 'avoid'], [106.21, 'the'], [106.65, 'heartache,'], [107.23, "I'll"], [107.78, 'keep'], [107.94, 'this'], [108.21, 'one'], [108.38, 'just'], [108.66, 'for'], [108.93, 'me']]),
  line('paradise', 109.22, 110.07, [[109.22, 'Oh,'], [110.07, 'Ivory']]),

  line('bridge', 128.22, 131.79, [[128.22, 'I'], [128.64, 'could'], [128.92, 'be'], [129.21, 'the'], [129.52, 'one'], [129.65, 'she'], [129.93, 'loves,'], [130.79, 'the'], [130.94, 'Adam'], [131.07, 'to'], [131.63, 'her'], [131.79, 'Eve']]),
  line('bridge', 132.51, 137.36, [[132.51, 'But'], [132.94, 'when'], [133.22, 'she'], [133.49, 'asked'], [133.79, 'me'], [134.08, 'for'], [134.37, 'my'], [134.65, 'name,'], [134.94, 'I'], [135.24, 'forgot'], [136.06, 'how'], [136.36, 'to'], [136.64, 'breathe,'], [137.36, 'oh']]),
  line('bridge', 141.28, 141.28, [[141.28, 'Ivory']]),

  line('alaska', 146.50, 149.79, [[146.50, 'Looks'], [146.94, 'like'], [147.37, 'California,'], [149.22, 'sounds'], [149.37, 'like'], [149.79, 'Tennessee']]),
  line('alaska', 150.93, 154.49, [[150.93, 'Walks'], [151.78, 'just'], [151.92, 'like'], [152.20, 'Alaska'], [152.81, 'with'], [153.08, 'the'], [153.50, 'snowfall'], [154.08, 'in'], [154.34, 'the'], [154.49, 'trees']]),
  line('alaska', 155.71, 158.66, [[155.71, 'If'], [156.09, 'I'], [156.50, 'wanted'], [156.93, 'paradise,'], [157.77, "I'd"], [158.22, 'play'], [158.52, 'a'], [158.66, 'melody']]),
  line('alaska', 159.85, 163.79, [[159.85, 'But'], [160.22, 'too'], [160.65, 'avoid'], [161.07, 'the'], [161.51, 'heartache,'], [162.09, "I'll"], [162.64, 'keep'], [162.80, 'this'], [163.07, 'one'], [163.24, 'just'], [163.52, 'for'], [163.79, 'me']]),
  line('alaska', 164.08, 164.93, [[164.08, 'Oh,'], [164.93, 'Ivory']]),

  line('last', 173.37, 173.37, [[173.37, 'Ivory']]),
]

const DURATION = 188.736

/**
 * Twelve sections. Boundaries sit in the gaps between sung blocks, about a
 * second after the voice stops, so a section's last line leaves when it does.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 8.9 },
  { id: 'verse-1', kind: 'verse', label: 'Verse 1', from: 8.9, to: 21.2 },
  { id: 'her-eyes', kind: 'prechorus', label: 'Her eyes', from: 21.2, to: 44.6 },
  { id: 'california', kind: 'chorus', label: 'California', from: 44.6, to: 58.4 },
  { id: 'verse-2', kind: 'verse', label: 'Verse 2', from: 58.4, to: 76.4 },
  { id: 'beside-her', kind: 'prechorus', label: 'Her name', from: 76.4, to: 99.7 },
  { id: 'paradise', kind: 'chorus', label: 'Paradise', from: 99.7, to: 112.6 },
  { id: 'interlude', kind: 'break', label: 'Interlude', from: 112.6, to: 127.6 },
  { id: 'bridge', kind: 'bridge', label: 'My name', from: 127.6, to: 145.4 },
  { id: 'alaska', kind: 'chorus', label: 'Alaska', from: 145.4, to: 168.2 },
  { id: 'last', kind: 'coda', label: 'Ivory', from: 168.2, to: 178.0 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 178.0, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const IVORY_SCORE = {
  title: 'Ivory',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/ivory.mp3',
  /** From `afinfo`, not from the tracklist's rounded 3:08. */
  duration: DURATION,
  /**
   * The last hit: the final strong onset of the arrangement, after which the
   * band rings down to silence over six seconds — so the end card's logo and
   * credits run under the ring-out. Absolute song time; not moved by TRIM.
   */
  endCardAt: 182.42,
  /** 105.0 BPM, a beat at 0.36. Measured, and steady — the band played to a click. */
  bpm: 105,
  beatPhase: 0.36,
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
