/*
 * 'New York', 3:35, timed word by word — the score its film is cut to.
 *
 * GENERATED, then read by hand. The line starts and every 'No' were set by
 * eye against the measurement; do not regenerate over them.
 *
 * HOW THE TIMES WERE MEASURED
 * The Norma Jeane method (goodbyeNormaJeaneScore.ts), as for Ivory, Conman and
 * Ship to Stockholm:
 *
 *   1. Separation. Demucs (htdemucs, two stems) on the mp3 decoded at 44.1 kHz.
 *      The vocal stem's energy marks every sung block: 20.1–27.6, 29.8–37.6,
 *      39.6–46.8, 49.5–56.8, 69.0–75.6, 78.4–85.7, 88.4–95.4, 98.2–106.4,
 *      109.8–112.0, 114.4–121.2, 156.6–163.9, 166.4–174.7, 178.0–181.0,
 *      182.9–186.5, 187.8–191.3 and 192.4–206.45. The rest is band: a 20-second
 *      intro, a 12-second break after the first chorus, a 35-second
 *      instrumental after the first "New York", and the ring-out.
 *   2. Words. Whisper (medium, word timestamps) on the vocal stem, prompted
 *      with the lyric. It heard nearly all of it — "under my" for "undermine",
 *      "bag it, bend it, bend it" for "bargain, bend, abandon", "But the only
 *      way", "Though I won't go" — and as before its text was thrown away and
 *      its times kept. It was early on every line start, by 0.3–0.8 s (it
 *      starts a line on the breath), and it could not count the 'No's: it
 *      heard five in the first group and put them in the wrong places.
 *   3. The grid. The band played to a click: a least-squares fit of the mix's
 *      on-beat onsets gives 98.50 BPM with a beat at x.54, residual 16 ms, the
 *      same phase in every block from the first beat at 0.54 to the end. The
 *      sixteenths are swung (triplet feel), so a pushed note lands 0.10 s
 *      before an eighth, and that is where most lines and most 'No's come in.
 *   4. Repeats, by cross-correlating a 40-band log spectrogram of the vocal
 *      stem, and every one is a whole number of beats: verse 2 and the second
 *      chorus are the first at +80 beats; the third chorus is the first at
 *      +192; the three last "No, no, no, no"s are the first at +112, +120 and
 *      +128, and the last "No, I won't go…" is the first at +128.
 *   5. Syllables. A shortest path over (syllable, 10 ms slot), rewarded for
 *      landing on an energy dip in the stem followed by a rise, or a pitch
 *      step, near an eighth or a swung sixteenth of the click, and charged for
 *      leaving the Whisper prior; then read against the stem's energy and
 *      pitch and fixed by hand where it was wrong. The two chorus lines were
 *      read once on the first chorus and shifted by +80 and +192 beats (checked
 *      on "shore": the shifted times land within 45 ms of the measured ones).
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps. Each was read against the vocal
 *     stem's energy at 30 ms, where the voice first comes up out of the band.
 *   - Every 'No': to a frame. Each of the sixteen in the four "No, no, no, no"
 *     lines was measured on its own, not shifted — the dip before each one and
 *     the rise into its vowel — because the film lands something on every one.
 *     They come in a figure of four, about 0, +0.3, +0.55 and +1.0 s, the last
 *     one held; the third of the last three is sung higher than the others.
 *   - The last line is sung into a stop: the band drops out at 193.7 under
 *     "I'm not going to", comes back in at 195.0 under "New York", and "York"
 *     is held for ten seconds, to 206.45.
 *   - Least certain: the inner words of the chorus lines ("wanna", "listen",
 *     "anybody", "anymore"), which are sung legato on one note, so the stem
 *     has almost nowhere to mark them — they can sit 0.1–0.2 s off. And 'I' in
 *     the last line (192.80), which the stem does not separate from "No".
 *   - 0–20.1 is intro (the band starts on the beat at 0.54); 56.8–69.0 is a
 *     break; 121.2–156.6 is the instrumental; after the last "York" the chord
 *     cuts at 206.15 and rings down to silence by about 213.7.
 *
 * The lyric is the published one (content/music/into-the-wild.yml), spelling
 * and all: "L.A,", "wanna". Whisper heard "want to" in the last three chorus
 * lines; the stem has the same two syllables either way, so the published word
 * stands.
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
  line('verse-1', 20.14, 25.47, [[20.14, 'They'], [20.65, 'say'], [20.96, 'love'], [21.41, 'when'], [21.56, 'lost'], [22.01, 'upon'], [22.39, 'the'], [22.66, 'rocks'], [23.09, 'is'], [23.37, 'best'], [23.65, 'left'], [23.98, 'burning'], [24.49, 'out'], [24.91, 'the'], [25.47, 'coals']]),
  line('verse-1', 29.76, 35.24, [[29.76, 'That'], [30.22, 'easy'], [30.72, 'dreams'], [31.01, 'like'], [31.46, 'submarines'], [32.24, 'can'], [32.54, 'undermine'], [33.29, "mankind's"], [34.17, 'familiar'], [35.24, 'goal']]),

  line('chorus-1', 39.63, 45.02, [[39.63, 'I'], [40.14, "don't"], [40.45, 'wanna'], [41.05, 'follow'], [42.00, 'those'], [42.55, 'lights'], [43.17, 'I'], [43.52, 'see'], [43.78, 'out'], [44.02, 'on'], [44.43, 'the'], [45.02, 'shore']]),
  line('chorus-1', 49.47, 53.88, [[49.47, 'I'], [49.91, "don't"], [50.12, 'wanna'], [50.80, 'listen'], [51.78, 'to'], [52.02, 'anybody'], [53.24, 'ever'], [53.88, 'anymore']]),

  line('verse-2', 69.02, 73.67, [[69.02, 'They'], [69.36, 'said'], [69.66, 'move'], [69.97, 'to'], [70.17, 'Memphis,'], [71.44, 'Nashville,'], [72.22, 'Austin,'], [72.74, 'L.A,'], [73.22, 'or'], [73.67, 'Detroit']]),
  line('verse-2', 78.37, 83.78, [[78.37, 'That'], [78.71, 'the'], [79.01, 'only'], [79.42, 'way'], [79.73, 'to'], [79.92, 'break'], [80.34, 'it'], [80.94, 'is'], [81.23, 'to'], [81.59, 'bargain,'], [82.16, 'bend,'], [82.32, 'abandon,'], [83.35, 'or'], [83.78, 'exploit']]),

  line('chorus-2', 88.39, 93.75, [[88.39, 'I'], [88.87, "don't"], [89.18, 'wanna'], [89.78, 'follow'], [90.73, 'those'], [91.28, 'lights'], [91.90, 'I'], [92.25, 'see'], [92.51, 'out'], [92.75, 'on'], [93.16, 'the'], [93.75, 'shore']]),
  line('chorus-2', 98.19, 102.61, [[98.19, 'I'], [98.64, "don't"], [98.85, 'wanna'], [99.53, 'listen'], [100.51, 'to'], [100.75, 'anybody'], [101.97, 'ever'], [102.61, 'anymore']]),

  line('no-1', 109.80, 110.85, [[109.80, 'No,'], [110.15, 'no,'], [110.40, 'no,'], [110.85, 'no']]),
  line('no-1', 114.43, 118.10, [[114.43, 'No,'], [114.98, 'I'], [115.26, "won't"], [115.45, 'go,'], [115.94, "I'm"], [116.31, 'not'], [116.63, 'going'], [117.14, 'to'], [117.54, 'New'], [118.10, 'York']]),

  line('chorus-3', 156.64, 161.98, [[156.64, 'I'], [157.10, "don't"], [157.41, 'wanna'], [158.01, 'follow'], [158.96, 'those'], [159.51, 'lights'], [160.13, 'I'], [160.48, 'see'], [160.74, 'out'], [160.98, 'on'], [161.39, 'the'], [161.98, 'shore']]),
  line('chorus-3', 166.39, 170.84, [[166.39, 'I'], [166.87, "don't"], [167.08, 'wanna'], [167.76, 'listen'], [168.74, 'to'], [168.98, 'anybody'], [170.20, 'ever'], [170.84, 'anymore']]),

  line('no-2', 178.05, 179.03, [[178.05, 'No,'], [178.33, 'no,'], [178.58, 'no,'], [179.03, 'no']]),
  line('no-2', 182.93, 183.89, [[182.93, 'No,'], [183.23, 'no,'], [183.45, 'no,'], [183.89, 'no']]),
  line('no-2', 187.78, 188.78, [[187.78, 'No,'], [188.10, 'no,'], [188.36, 'no,'], [188.78, 'no']]),
  line('no-2', 192.39, 196.01, [[192.39, 'No,'], [192.80, 'I'], [193.06, "won't"], [193.36, 'go,'], [193.90, "I'm"], [194.23, 'not'], [194.53, 'going'], [195.02, 'to'], [195.41, 'New'], [196.01, 'York']]),
]

const DURATION = 215.04

/**
 * Eleven sections. Boundaries sit in the gaps between sung blocks, about a
 * second after the voice stops, so a section's last line leaves when it does.
 * The two "No" sections are the song's hook: the first is the bridge between
 * the second and third choruses, the second is the coda — three "No, no, no,
 * no"s and the last "New York", held to 206.45.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 19.5 },
  { id: 'verse-1', kind: 'verse', label: 'Verse 1', from: 19.5, to: 38.6 },
  { id: 'chorus-1', kind: 'chorus', label: 'Chorus', from: 38.6, to: 57.6 },
  { id: 'break-1', kind: 'break', label: 'Break', from: 57.6, to: 68.4 },
  { id: 'verse-2', kind: 'verse', label: 'Verse 2', from: 68.4, to: 87.0 },
  { id: 'chorus-2', kind: 'chorus', label: 'Chorus', from: 87.0, to: 108.0 },
  { id: 'no-1', kind: 'bridge', label: 'No', from: 108.0, to: 122.0 },
  { id: 'break-2', kind: 'break', label: 'Instrumental', from: 122.0, to: 156.0 },
  { id: 'chorus-3', kind: 'chorus', label: 'Chorus', from: 156.0, to: 176.4 },
  { id: 'no-2', kind: 'coda', label: 'New York', from: 176.4, to: 207.0 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 207.0, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const NEW_YORK_SCORE = {
  title: 'New York',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/new-york.mp3',
  /** From `afinfo`, not from the tracklist's rounded 3:35. */
  duration: DURATION,
  /**
   * The last hit: there is no final strike — the band holds its last chord
   * under "York", cuts it on the eighth at 206.15, and the voice lets go on
   * the beat at 206.44; the chord rings down to silence by about 213.7, so the
   * end card's logo and credits run under the ring-out. Absolute song time;
   * not moved by TRIM.
   */
  endCardAt: 206.44,
  /** 98.5 BPM, a beat at 0.54. Measured, and steady — the band played to a click. */
  bpm: 98.5,
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
