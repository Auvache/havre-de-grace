/*
 * 'Goodbye, Norma Jeane', 4:41, timed word by word — the score its film is cut to.
 *
 * GENERATED, then read by hand. The lines under "WHAT TO TRUST" were set by
 * eye against the measurement; do not regenerate over them.
 *
 * HOW THE TIMES WERE MEASURED
 * Neither method that timed the first two songs was enough on its own here.
 * The vocal-band share (andalusiaScore.ts) is swamped by the guitars, and the
 * centre channel (intoTheWildScore.ts) finds the voice in the verses but loses
 * it in the pre-choruses and choruses, where a wide doubled part sits on top.
 * So the voice was taken out of the mix first:
 *
 *   1. Separation. Demucs (htdemucs, two stems) on the mp3 decoded at 44.1 kHz.
 *      The vocal stem is clean enough that its energy alone marks every sung
 *      block to a frame: 20.8–26.2, 30.7–36.8, 40.4–51.6, 71.3–87.3, 91.0–122.2,
 *      146.1–162.6, 165.9–199.8, 217.8–248.4.
 *   2. Words. Whisper (medium, word timestamps) on the vocal stem, prompted
 *      with the lyric, for a first placement and for which words are where. It
 *      misheard a third of them ("When I sell a white like Juliet"), so its
 *      text was thrown away and only its times kept, as a prior.
 *   3. The grid. The band played to a click: a comb fit of the mix's onset
 *      flux gives 95.0 BPM with a beat at x.066, the same phase within 10 ms in
 *      every block from 20 s to 280 s.
 *   4. Repeats, by cross-correlating a 40-band log spectrogram of the vocal
 *      stem. Chorus 2 is chorus 1 at +75.81 (120 beats) and chorus 3 is at
 *      +116.25 (184 beats); pre-chorus 2 is pre-chorus 1 at +50.52 (80 beats)
 *      and pre-chorus 3 at +126.30 (200 beats); inside a pre-chorus the two
 *      lines are 8 beats apart.
 *   5. Syllables. A shortest path over (word, 10 ms slot) within ±0.3 s of the
 *      Whisper prior, rewarded for landing on vocal-stem onset flux and for
 *      sitting near a sixteenth of the click, charged for leaving the prior.
 *      Lines sung to the same words — the three choruses, the six pre-chorus
 *      lines — were solved once on their pooled evidence and shifted by the
 *      measured offsets.
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps. Each was read against the vocal
 *     stem's energy at 30 ms and moved where the solver was off — 'With'
 *     (was 30.54), 'Say' (81.54), 'Double' (146.91), 'Different' (157.49), and
 *     the first word of both of chorus 3 and the pre-chorus's second line.
 *   - Chorus 3's first line comes in 0.2 s ahead of the pooled chorus — out of
 *     an interlude rather than a pre-chorus — so 'Goodbye' there is measured
 *     (218.12), and the rest of the line is the pooled chorus at +116.25.
 *   - 'Die your hair' has an unwritten pickup from 71.40 — "and", or an "oh" —
 *     so the line starts there while 'Die' is where its vowel is, 71.92.
 *   - Least certain: 'Something' (24.06), which follows 'oh' with no gap; the
 *     run 'don't hedge your bets' (148.46–149.60), four words in a second with
 *     only two clear onsets; 'Try to land' (84.54–85.02), placed rather than
 *     found; and every 'the', 'to' and 'you' inside a chorus line.
 *   - 124–146 s, 199.8–217.8 s and the outro have no lyric. The voice at
 *     200.9–206.6 and 242–248.4 is ad-lib ("wow", "ooh") that is not in the
 *     published lyric and is not set.
 *
 * The lyric is the published one (content/music/into-the-wild.yml), spelling
 * and all: 'Die your hair', and 'Norma Jean' in the choruses.
 */

export type SectionKind =
  | 'intro'
  | 'verse'
  | 'prechorus'
  | 'chorus'
  | 'break'
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
  line('verse-1', 20.92, 23.77, [[20.92, 'Silver'], [21.70, 'screen'], [22.17, 'says'], [22.49, 'Norma'], [23.11, 'Jeane,'], [23.77, 'oh']]),
  line('verse-1', 24.06, 25.50, [[24.06, 'Something'], [24.38, "bigger's"], [25.03, 'meant'], [25.33, 'for'], [25.50, 'me']]),
  line('verse-1', 30.80, 33.86, [[30.80, 'With'], [31.04, 'a'], [31.49, 'silhouette'], [32.28, 'like'], [32.60, 'Juliet,'], [33.86, 'oh']]),
  line('verse-1', 34.17, 36.07, [[34.17, 'Someone'], [34.48, 'else'], [34.81, 'could'], [35.12, 'cut'], [35.30, 'your'], [36.07, 'checks']]),

  line('pre-1', 40.60, 43.48, [[40.60, 'You'], [41.10, 'could'], [41.59, 'put'], [41.91, 'an'], [42.21, 'end'], [42.54, 'to'], [42.69, 'this,'], [43.19, 'come'], [43.48, 'on']]),
  line('pre-1', 45.72, 48.86, [[45.72, 'You'], [46.15, 'could'], [46.49, 'put'], [46.96, 'an'], [47.12, 'end'], [47.60, 'to'], [47.75, 'this,'], [48.25, 'come'], [48.54, 'on'], [48.86, 'oh']]),

  line('verse-2', 71.40, 73.65, [[71.92, 'Die'], [72.20, 'your'], [72.54, 'hair'], [72.85, 'and'], [73.17, 'change'], [73.48, 'your'], [73.65, 'clothes']]),
  line('verse-2', 74.30, 76.50, [[74.30, 'Bat'], [74.60, 'your'], [75.07, 'eyelids'], [75.55, 'really'], [76.50, 'slow']]),
  line('verse-2', 81.95, 84.22, [[81.95, 'Say'], [82.33, 'goodbye'], [82.81, 'to'], [83.14, 'all'], [83.43, 'you'], [83.60, 'know'], [84.22, 'and']]),
  line('verse-2', 84.54, 85.51, [[84.54, 'Try'], [84.86, 'to'], [85.02, 'land'], [85.51, 'DiMaggio']]),

  line('pre-2', 91.18, 94.00, [[91.18, 'You'], [91.62, 'could'], [92.11, 'put'], [92.43, 'an'], [92.73, 'end'], [93.06, 'to'], [93.21, 'this,'], [93.71, 'come'], [94.00, 'on']]),
  line('pre-2', 96.26, 99.38, [[96.26, 'You'], [96.67, 'could'], [97.01, 'put'], [97.48, 'an'], [97.64, 'end'], [98.12, 'to'], [98.27, 'this,'], [98.77, 'come'], [99.06, 'on'], [99.38, 'oh']]),

  line('chorus-1', 102.07, 105.38, [[102.07, 'Goodbye,'], [102.86, 'Norma'], [103.33, 'Jean.'], [103.96, 'You'], [104.13, 'meant'], [104.44, 'the'], [104.76, 'world'], [104.91, 'to'], [105.38, 'me']]),
  line('chorus-1', 107.25, 110.91, [[107.25, "I've"], [107.60, 'been'], [107.75, 'in'], [107.92, 'love'], [108.06, 'with'], [108.38, 'you'], [108.69, 'since'], [109.02, 'we'], [109.48, 'were'], [109.65, 'seventeen,'], [110.59, 'but'], [110.91, 'I']]),
  line('chorus-1', 112.08, 115.50, [[112.08, 'Know'], [112.48, 'you'], [113.12, 'want'], [113.29, 'the'], [113.59, 'world,'], [113.92, "it's"], [114.22, 'more,'], [114.71, 'more,'], [115.50, 'more']]),
  line('chorus-1', 119.29, 121.02, [[119.29, 'I'], [119.90, 'wanted'], [120.22, 'you,'], [120.71, 'you'], [121.02, 'wanted']]),

  line('verse-3', 147.30, 149.60, [[147.30, 'Double'], [148.00, 'down,'], [148.46, "don't"], [149.01, 'hedge'], [149.27, 'your'], [149.60, 'bets']]),
  line('verse-3', 150.05, 152.27, [[150.05, 'Diamonds'], [150.69, 'are'], [151.00, 'your'], [151.44, 'only'], [152.27, 'friend']]),
  line('verse-3', 157.70, 159.53, [[157.70, 'Different'], [158.28, 'lines'], [158.75, 'paint'], [159.06, 'different'], [159.53, 'strokes']]),
  line('verse-3', 160.17, 162.54, [[160.17, 'At'], [160.33, 'least'], [160.52, 'these'], [160.96, 'pills'], [161.12, 'should'], [161.58, 'help'], [161.75, 'you'], [162.54, 'cope']]),

  line('pre-3', 166.96, 169.78, [[166.96, 'You'], [167.40, 'could'], [167.89, 'put'], [168.21, 'an'], [168.51, 'end'], [168.84, 'to'], [168.99, 'this,'], [169.49, 'come'], [169.78, 'on']]),
  line('pre-3', 172.05, 175.16, [[172.05, 'You'], [172.45, 'could'], [172.79, 'put'], [173.26, 'an'], [173.42, 'end'], [173.90, 'to'], [174.05, 'this,'], [174.55, 'come'], [174.84, 'on'], [175.16, 'oh']]),

  line('chorus-2', 177.88, 181.19, [[177.88, 'Goodbye,'], [178.67, 'Norma'], [179.14, 'Jean.'], [179.77, 'You'], [179.94, 'meant'], [180.25, 'the'], [180.57, 'world'], [180.72, 'to'], [181.19, 'me']]),
  line('chorus-2', 183.06, 186.72, [[183.06, "I've"], [183.41, 'been'], [183.56, 'in'], [183.73, 'love'], [183.87, 'with'], [184.19, 'you'], [184.50, 'since'], [184.83, 'we'], [185.29, 'were'], [185.46, 'seventeen,'], [186.40, 'but'], [186.72, 'I']]),
  line('chorus-2', 187.98, 191.31, [[187.98, 'Know'], [188.29, 'you'], [188.93, 'want'], [189.10, 'the'], [189.40, 'world,'], [189.73, "it's"], [190.03, 'more,'], [190.52, 'more,'], [191.31, 'more']]),
  line('chorus-2', 195.10, 197.64, [[195.10, 'I'], [195.71, 'wanted'], [196.03, 'you,'], [196.52, 'you'], [196.83, 'wanted'], [197.64, 'more']]),

  line('chorus-3', 218.12, 221.63, [[218.12, 'Goodbye,'], [219.11, 'Norma'], [219.58, 'Jean.'], [220.21, 'You'], [220.38, 'meant'], [220.69, 'the'], [221.01, 'world'], [221.16, 'to'], [221.63, 'me']]),
  line('chorus-3', 223.50, 227.16, [[223.50, "I've"], [223.85, 'been'], [224.00, 'in'], [224.17, 'love'], [224.31, 'with'], [224.63, 'you'], [224.94, 'since'], [225.27, 'we'], [225.73, 'were'], [225.90, 'seventeen,'], [226.84, 'but'], [227.16, 'I']]),
  line('chorus-3', 228.42, 231.75, [[228.42, 'Know'], [228.73, 'you'], [229.37, 'want'], [229.54, 'the'], [229.84, 'world,'], [230.17, "it's"], [230.47, 'more,'], [230.96, 'more,'], [231.75, 'more']]),
  line('chorus-3', 235.54, 238.14, [[235.54, 'I'], [236.15, 'wanted'], [236.47, 'you,'], [236.96, 'you'], [237.27, 'wanted'], [238.14, 'more']]),
]

const DURATION = 281.832

/**
 * Fourteen sections. Boundaries sit in the gaps between sung blocks. The
 * choruses run well past their last onset: 'wanted' and 'more' are held.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 20.5 },
  { id: 'verse-1', kind: 'verse', label: 'Verse 1', from: 20.5, to: 38.6 },
  { id: 'pre-1', kind: 'prechorus', label: 'Put an end', from: 38.6, to: 53.0 },
  { id: 'break-1', kind: 'break', label: 'Break', from: 53.0, to: 70.9 },
  { id: 'verse-2', kind: 'verse', label: 'Verse 2', from: 70.9, to: 89.6 },
  { id: 'pre-2', kind: 'prechorus', label: 'Put an end', from: 89.6, to: 101.7 },
  { id: 'chorus-1', kind: 'chorus', label: 'Goodbye', from: 101.7, to: 124.0 },
  { id: 'break-2', kind: 'break', label: 'Interlude', from: 124.0, to: 145.2 },
  { id: 'verse-3', kind: 'verse', label: 'Verse 3', from: 145.2, to: 165.4 },
  { id: 'pre-3', kind: 'prechorus', label: 'Put an end', from: 165.4, to: 177.4 },
  { id: 'chorus-2', kind: 'chorus', label: 'Goodbye', from: 177.4, to: 201.0 },
  { id: 'break-3', kind: 'break', label: 'Interlude', from: 201.0, to: 217.5 },
  { id: 'chorus-3', kind: 'chorus', label: 'Last goodbye', from: 217.5, to: 249.2 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 249.2, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const GOODBYE_NORMA_JEANE_SCORE = {
  title: 'Goodbye, Norma Jeane',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/goodbye-norma-jeane.mp3',
  /** From `afinfo`, not from the tracklist's rounded 4:41. */
  duration: DURATION,
  /**
   * The last hit: the final strong onset of the arrangement, after which the
   * chord rings down to silence over six seconds — so the end card's logo and
   * credits run under the ring-out. Absolute song time; not moved by TRIM.
   */
  endCardAt: 275.3,
  /** 95.0 BPM, a beat at 0.066. Measured, and steady — the band played to a click. */
  bpm: 95,
  beatPhase: 0.066,
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
