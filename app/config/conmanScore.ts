/*
 * 'Conman', 4:00, timed word by word — the score its film is cut to.
 *
 * GENERATED, then read by hand. The lines under "WHAT TO TRUST" were set by
 * eye against the measurement; do not regenerate over them.
 *
 * HOW THE TIMES WERE MEASURED
 * The Norma Jeane method (goodbyeNormaJeaneScore.ts), as for Ivory:
 *
 *   1. Separation. Demucs (htdemucs, two stems) on the mp3 decoded at 44.1 kHz.
 *      The vocal stem's energy marks every sung block: 23.1–45.5, 55.7–76.6,
 *      78.4–83.5, 89.3–95.3, 99.9–121.8, 122.3–127.6, 133.2–139.0,
 *      165.2–187.6, 188.1–193.3, 199.0–204.9, 210.0–215.9 and 220.9–227.3.
 *   2. Words. Whisper (medium, word timestamps) on the vocal stem, prompted
 *      with the lyric. It heard nearly all of it — "kind man" for "conman",
 *      "cooking bugs", "spit the ground", "find a grove" — and as before its
 *      text was thrown away and its times kept. It put every chorus's first
 *      "No" seconds early, in the gap before the line; those came from the stem.
 *   3. The grid. The band played to a click: a comb fit of the mix's onset flux
 *      gives 87.5 BPM with a beat at x.31, the same phase within 30 ms in every
 *      block from the intro to the last hit.
 *   4. Repeats, by cross-correlating a 40-band log spectrogram of the vocal
 *      stem, and every one is a whole number of beats: verse 2 is verse 1 at
 *      +48 beats, verse 3 at +112, verse 4 at +208; the second chorus is the
 *      first at +64, and the last chorus is the first twice over, at +160 and
 *      +192.
 *   5. Syllables. A shortest path over (word, 10 ms slot) within ±0.3 s of the
 *      Whisper prior, rewarded for landing on vocal-stem onset flux and for
 *      sitting near a sixteenth of the click, charged for leaving the prior.
 *      The six "No matter where I go" lines and the six "No matter what I do"
 *      lines were each solved once on their pooled evidence and shifted by the
 *      measured offsets, and so was "I'm a conman, don't be fooled by the way
 *      I…" in verses 1, 2 and 4.
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps. Each was read against the vocal
 *     stem's energy at 30 ms. Moved by hand: 'These' (Whisper had it in the
 *     tail of "shake", a second early), 'And pulled', 'I started', the verse
 *     2 and 4 'Oh's, and the chorus 'No's, which are where the voice comes in.
 *   - Every chorus line is sung long, about five seconds, with five seconds of
 *     band after it — the choruses are short in words and long in time.
 *   - Least certain: '1968' and '2025' are one word each and are sung over a
 *     second and a half ("nineteen sixty-eight"); the time is where the number
 *     starts. And every 'a', 'the' and 'I' inside a line.
 *   - 0–23.1 is intro; 45.5–55.7 and 139.0–165.2 have no lyric (the second is
 *     a 26-second break); 227.3 to the end is the outro, with the last hit at
 *     232.1 and eight seconds of ring-out under the end card.
 *
 * The lyric is the published one (content/music/into-the-wild.yml), spelling
 * and all: "These rhythms' been around".
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
  line('verse-1', 23.28, 26.71, [[23.28, "I'm"], [23.62, 'a'], [23.95, 'conman,'], [24.64, "don't"], [25.16, 'be'], [25.33, 'fooled'], [25.67, 'by'], [26.02, 'the'], [26.18, 'way'], [26.37, 'I'], [26.71, 'shake']]),
  line('verse-1', 28.41, 33.22, [[28.41, 'These'], [28.76, "rhythms'"], [29.45, 'been'], [29.97, 'around'], [30.48, 'since'], [30.83, '1968'], [32.36, 'when'], [33.22, 'they']]),
  line('verse-1', 34.42, 37.53, [[34.42, 'Bottled'], [35.27, 'lightning'], [36.31, 'in'], [36.66, 'several'], [37.00, 'steady'], [37.53, 'notes']]),
  line('verse-1', 39.27, 44.88, [[39.27, 'And'], [39.91, 'pulled'], [40.26, 'the'], [40.60, 'clouds'], [40.92, 'into'], [41.44, 'the'], [41.79, 'sea'], [42.14, 'to'], [42.47, 'clear'], [42.83, 'the'], [43.18, 'sky'], [43.51, 'of'], [43.85, 'smoke,'], [44.55, 'you'], [44.88, 'know']]),

  line('verse-2', 55.75, 59.62, [[55.75, 'Oh,'], [56.19, "I'm"], [56.53, 'a'], [56.86, 'conman,'], [57.55, "don't"], [58.07, 'be'], [58.24, 'fooled'], [58.58, 'by'], [58.93, 'the'], [59.09, 'way'], [59.28, 'I'], [59.62, 'look']]),
  line('verse-2', 61.19, 65.66, [[61.19, "I've"], [61.68, 'made'], [62.19, 'a'], [62.55, 'killing'], [63.04, 'off'], [63.56, 'of'], [63.92, 'moving'], [64.30, 'fast'], [64.79, 'and'], [65.29, 'cooking'], [65.66, 'books']]),
  line('verse-2', 67.35, 69.23, [[67.35, 'Until'], [67.69, 'the'], [68.18, 'Earth'], [68.53, 'shook'], [68.89, 'in'], [69.23, '2025']]),
  line('verse-2', 72.29, 75.40, [[72.29, 'I'], [72.66, 'started'], [73.17, 'searching'], [74.02, 'and'], [74.71, 'I'], [75.06, 'finally'], [75.40, 'realized']]),

  line('chorus-1', 78.42, 82.95, [[78.42, 'No'], [78.83, 'matter'], [79.35, 'where'], [79.85, 'I'], [80.55, 'go,'], [81.21, 'I'], [81.57, 'never'], [82.11, 'seem'], [82.60, 'to'], [82.95, 'change']]),
  line('chorus-1', 89.40, 94.08, [[89.40, 'No'], [89.80, 'matter'], [90.47, 'what'], [90.84, 'I'], [91.51, 'do,'], [92.53, 'I'], [92.72, 'always'], [93.23, 'sound'], [93.75, 'the'], [94.08, 'same']]),

  line('verse-3', 99.95, 103.52, [[99.95, "I'm"], [100.42, 'a'], [100.94, 'conman'], [101.63, 'and'], [102.12, "I'm"], [102.47, 'here'], [102.66, 'to'], [102.81, 'steal'], [103.01, 'your'], [103.52, 'sound']]),
  line('verse-3', 105.56, 109.68, [[105.56, 'I'], [105.92, 'stick'], [106.25, 'to'], [106.60, 'the'], [106.92, 'shadows'], [107.63, 'when'], [108.11, 'I'], [108.48, 'follow'], [108.99, 'you'], [109.68, 'around']]),
  line('verse-3', 111.20, 114.51, [[111.20, 'When'], [111.75, 'you'], [112.09, 'see'], [112.26, 'me,'], [112.77, 'I'], [113.27, 'pretend'], [113.79, 'not'], [114.33, 'to'], [114.51, 'stare']]),
  line('verse-3', 116.39, 121.51, [[116.39, 'And'], [117.05, 'I'], [117.39, 'pray'], [117.57, 'to'], [117.74, 'God'], [118.24, 'that'], [118.60, 'you'], [118.95, 'will'], [119.44, 'remain'], [119.97, 'unaware'], [120.98, 'that'], [121.51, 'I']]),

  line('chorus-2', 122.31, 126.84, [[122.31, 'No'], [122.72, 'matter'], [123.24, 'where'], [123.74, 'I'], [124.44, 'go,'], [125.10, 'I'], [125.46, 'never'], [126.00, 'seem'], [126.49, 'to'], [126.84, 'change']]),
  line('chorus-2', 133.29, 137.97, [[133.29, 'No'], [133.69, 'matter'], [134.36, 'what'], [134.73, 'I'], [135.40, 'do,'], [136.42, 'I'], [136.61, 'always'], [137.12, 'sound'], [137.64, 'the'], [137.97, 'same']]),

  line('verse-4', 165.45, 169.34, [[165.45, 'Oh,'], [165.91, "I'm"], [166.25, 'a'], [166.58, 'conman,'], [167.27, "don't"], [167.79, 'be'], [167.96, 'fooled'], [168.30, 'by'], [168.65, 'the'], [168.81, 'way'], [169.00, 'I'], [169.34, 'move']]),
  line('verse-4', 171.27, 175.52, [[171.27, 'Watch'], [171.74, 'me'], [172.08, 'split'], [172.30, 'the'], [172.77, 'ground'], [173.11, 'and'], [173.44, 'pierce'], [173.96, 'the'], [174.14, 'sky'], [174.50, 'and'], [175.00, 'find'], [175.32, 'a'], [175.52, 'groove']]),
  line('verse-4', 177.06, 180.32, [[177.06, "Don't"], [177.41, 'protect'], [178.10, 'me'], [178.60, 'from'], [178.79, 'the'], [179.28, 'damage'], [179.62, 'in'], [179.97, 'my'], [180.32, 'wake']]),
  line('verse-4', 182.32, 187.35, [[182.32, 'I'], [182.70, 'could'], [183.05, 'handle'], [183.57, 'all'], [184.10, 'the'], [184.59, 'eyes'], [184.78, 'you'], [185.11, 'know'], [185.46, 'for'], [185.79, 'goodness'], [186.31, 'sake'], [186.79, 'that'], [187.35, 'I']]),

  line('chorus-3', 188.13, 192.66, [[188.13, 'No'], [188.54, 'matter'], [189.06, 'where'], [189.56, 'I'], [190.26, 'go,'], [190.92, 'I'], [191.28, 'never'], [191.82, 'seem'], [192.31, 'to'], [192.66, 'stay']]),
  line('chorus-3', 199.11, 203.79, [[199.11, 'No'], [199.51, 'matter'], [200.18, 'what'], [200.55, 'I'], [201.22, 'do,'], [202.24, 'I'], [202.43, 'always'], [202.94, 'sound'], [203.46, 'the'], [203.79, 'same']]),
  line('chorus-3', 210.08, 214.61, [[210.08, 'No'], [210.49, 'matter'], [211.01, 'where'], [211.51, 'I'], [212.21, 'go,'], [212.87, 'I'], [213.23, 'never'], [213.77, 'seem'], [214.26, 'to'], [214.61, 'change']]),
  line('chorus-3', 221.06, 225.74, [[221.06, 'No'], [221.46, 'matter'], [222.13, 'what'], [222.50, 'I'], [223.17, 'do,'], [224.19, 'I'], [224.38, 'always'], [224.89, 'sound'], [225.41, 'the'], [225.74, 'same']]),
]

const DURATION = 240.744

/**
 * Ten sections. Boundaries sit in the gaps between sung blocks, about a second
 * after the voice stops, so a section's last line leaves when it does. Verse 3
 * runs straight into the second chorus ("…unaware that I / No matter where I
 * go") and verse 4 into the last, so those two boundaries sit in gaps of a few
 * tenths of a second.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 22.6 },
  { id: 'verse-1', kind: 'verse', label: '1968', from: 22.6, to: 46.6 },
  { id: 'verse-2', kind: 'verse', label: 'A killing', from: 46.6, to: 77.5 },
  { id: 'chorus-1', kind: 'chorus', label: 'Chorus', from: 77.5, to: 96.4 },
  { id: 'verse-3', kind: 'verse', label: 'Shadows', from: 96.4, to: 121.95 },
  { id: 'chorus-2', kind: 'chorus', label: 'Chorus', from: 121.95, to: 140.2 },
  { id: 'break', kind: 'break', label: 'Break', from: 140.2, to: 164.9 },
  { id: 'verse-4', kind: 'verse', label: 'Groove', from: 164.9, to: 187.8 },
  { id: 'chorus-3', kind: 'chorus', label: 'Last chorus', from: 187.8, to: 228.5 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 228.5, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const CONMAN_SCORE = {
  title: 'Conman',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/conman.mp3',
  /** From `afinfo`, not from the tracklist's rounded 4:00. */
  duration: DURATION,
  /**
   * The last hit: after the last chorus the band stops dead at 230.5, and one
   * hit on the downbeat at 232.1 rings down to silence over eight seconds —
   * so the end card's logo and credits run under the ring-out. Absolute song
   * time; not moved by TRIM.
   */
  endCardAt: 232.1,
  /** 87.5 BPM, a beat at 0.31. Measured, and steady — the band played to a click. */
  bpm: 87.5,
  beatPhase: 0.31,
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
