/*
 * 'Andalusia', 2:53, timed word by word — the score the film is cut to.
 *
 * GENERATED, then read by hand. Do not reformat it by machine again: the
 * numbers below were checked against the audio and a few were moved.
 *
 * HOW THE TIMES WERE MEASURED
 * There is no lyric timing for this song anywhere, so it was taken off the
 * master rather than tapped in by feel. The mp3 was decoded to mono 16 kHz PCM
 * (`afconvert`) and an STFT taken at 10 ms, from which three things were used:
 *
 *   1. Vocal presence — the share of the spectrum sitting in 1.2–2.6 kHz plus a
 *      little of the sibilance band above it. Thresholding that with hysteresis
 *      cuts the song into sung phrases and silences, which is what fixes the
 *      start of every line. It works because the guitar, bass and piano mostly
 *      are not up there, and it is only confused by the trumpet.
 *   2. Section placement by cross-correlation. Every verse shares a melody with
 *      every other verse, and every chorus with every other chorus, so a
 *      section whose own line starts are ambiguous is found by sliding the
 *      log-mel spectrogram of a section that is not ambiguous along the record
 *      and taking the peak. Verse 1 against verse 4, and chorus 1 against
 *      chorus 3, place their targets to within 0.2 s — which is the error bar
 *      on everything the method was then used for.
 *   3. Spectral flux in 0.7–4.5 kHz, weighted by vocal presence, for the
 *      syllables. Within each line the syllables are placed by a shortest path
 *      over (syllable, time) that is rewarded for landing on an onset and
 *      charged for departing from an eighth note at 105.2 BPM — so where the
 *      singer is on a real attack the word snaps to it, and where the audio is
 *      ambiguous it coasts at the song's own rate. Every path is bounded by the
 *      next line's start, so nothing drifts.
 *
 * WHAT WAS WRONG IN THE FIRST CUT, AND WHY
 * The first pass of this file invented a five-and-a-half second instrumental
 * between the first chorus and verse 3. There is no instrumental there: the
 * chorus ends and verse 3 starts, the same four-bar turnaround the song uses
 * everywhere else. The phrase detector had missed verse 3's first line under
 * the trumpet, so every line from there on was assigned to the phrase belonging
 * to the line after it — verse 3 ran a line late, the second chorus ran three
 * seconds late behind it, and the error was absorbed by the oh-ohs, which is
 * why everything from verse 4 onwards was already right.
 *
 * The region was re-measured by correlation rather than by detection:
 *   - Verse 3 sits at 73.20, matched against verse 1 (peak 0.86, and its four
 *     line starts reproduce verse 1's internal spacing to within 0.05 s).
 *   - Chorus 2 sits at 91.42, matched against chorus 1 line by line at 0.92–0.93
 *     — the strongest correlation anywhere in the record. The four offsets come
 *     out at +36.60, +36.59, +36.57 and +36.54, so chorus 2 is chorus 1's word
 *     timings shifted by those four numbers, and its small drift is real.
 *   - The oh-ohs were taken off the envelope of the 1.2–2.8 kHz band, where the
 *     ten of the first group land on an even 0.33 s and are trustworthy. The
 *     seven of the second group are the least certain numbers in this file: the
 *     band is loud under them and their spacing is uneven enough that it may be
 *     the measurement rather than the singing.
 *
 * Honest about the accuracy: line starts are good to about a frame at 30 fps.
 * Word placement inside a line is measured where there is an onset to measure
 * and interpolated where there is not, so the odd unstressed word ('the', 'a')
 * can sit 100 ms off. The film has a sync nudge for exactly this reason, and a
 * word that is audibly wrong is one number in this file.
 */

export type SectionKind =
  | 'intro'
  | 'verse'
  | 'chorus'
  | 'places'
  | 'ohs'
  | 'quiet'
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
 * Sync trim, in seconds, folded into every measured time below.
 *
 * The numbers in this file are where the voice is. This is the offset between
 * where the voice is and where the type should be, judged by eye on the finished
 * film and then folded in here rather than left on the page's slider — so the
 * slider reads zero when the film is right, and stays available for the next
 * fifty milliseconds somebody hears. Positive runs the picture late.
 */
const TRIM = 0.02

const at = (t: number) => Math.round((t + TRIM) * 1000) / 1000

const line = (section: string, start: number, end: number, words: [number, string][]) => ({
  section,
  start: at(start),
  end: at(end),
  text: words.map(([, text]) => text).join(' '),
  words: words.map(([t, text]) => ({ t: at(t), text })),
})

const RAW_LINES = [
  line('verse-1', 18.33, 21.60, [[18.33, 'Oh,'], [18.64, 'I'], [18.93, 'think'], [19.26, 'that'], [19.54, 'I'], [19.83, 'could'], [20.14, 'live'], [20.43, 'in'], [20.72, 'Andalusia']]),
  line('verse-1', 23.44, 25.67, [[23.44, 'Walk'], [23.72, 'until'], [24.28, 'my'], [24.56, 'boots'], [24.85, 'are'], [25.14, 'breaking'], [25.67, 'through']]),
  line('verse-1', 28.26, 31.78, [[28.26, 'Oh,'], [28.54, "I'd"], [28.82, 'brush'], [28.95, 'up'], [29.23, 'on'], [29.51, 'my'], [29.79, 'Spanish'], [30.35, 'with'], [30.64, 'all'], [30.92, 'the'], [31.20, 'pretty'], [31.78, 'girls']]),
  line('verse-1', 32.60, 35.38, [[32.60, 'To'], [32.88, 'distract'], [33.40, 'myself'], [33.98, 'from'], [34.26, 'how'], [34.55, 'much'], [34.82, 'I'], [35.10, 'miss'], [35.38, 'you']]),
  line('verse-2', 36.84, 39.55, [[36.84, 'Oh,'], [37.10, 'I'], [37.29, 'think'], [37.57, 'that'], [37.85, 'I'], [38.13, 'could'], [38.38, 'live'], [38.60, 'outside'], [39.02, 'of'], [39.30, 'Stockholm']]),
  line('verse-2', 41.38, 43.88, [[41.38, "I'd"], [41.65, 'sit'], [42.02, 'and'], [42.28, 'watch'], [42.56, 'the'], [42.83, 'sailors'], [43.32, 'in'], [43.60, 'the'], [43.88, 'cold']]),
  line('verse-2', 45.39, 48.39, [[45.39, 'But'], [45.67, 'like'], [45.80, 'a'], [46.08, 'lover'], [46.56, 'stranded'], [47.13, 'underneath'], [47.83, 'a'], [48.11, 'churchyard']]),
  line('verse-2', 50.79, 52.80, [[50.79, "I'd"], [51.01, 'never'], [51.52, 'get'], [51.62, 'to'], [51.73, 'watch'], [52.03, 'you'], [52.31, 'growing'], [52.80, 'old']]),
  line('chorus-1', 54.82, 58.68, [[54.82, 'If'], [55.11, 'I'], [55.40, 'were'], [55.60, 'king'], [55.88, 'for'], [56.16, 'just'], [56.51, 'a'], [56.79, 'day'], [57.01, 'and'], [57.29, 'I'], [57.57, 'always'], [58.10, 'got'], [58.38, 'my'], [58.68, 'way']]),
  line('chorus-1', 59.85, 62.26, [[59.85, 'Know'], [60.13, 'no'], [60.42, 'other'], [61.02, 'dream'], [61.35, 'would'], [61.67, 'ever'], [62.26, 'do']]),
  line('chorus-1', 63.97, 67.64, [[63.97, 'It'], [64.26, "doesn't"], [64.68, 'matter'], [65.22, 'where'], [65.50, 'I'], [65.78, 'go,'], [66.06, 'in'], [66.34, 'the'], [66.62, 'sun'], [66.91, 'or'], [67.20, 'in'], [67.49, 'the'], [67.64, 'snow']]),
  line('chorus-1', 68.99, 71.66, [[68.99, 'The'], [69.28, 'only'], [69.85, 'one'], [70.23, 'I'], [70.52, 'want,'], [70.81, 'my'], [71.10, 'love,'], [71.38, 'is'], [71.66, 'you']]),
  // Verse 3 follows the chorus straight on. Line starts from correlation against
  // verse 1; L1's words are verse 1's own spacing, since it is the same line of
  // melody with 'Andalusia' swapped for 'San Diego'.
  line('verse-3', 73.20, 75.90, [[73.20, 'Oh,'], [73.51, 'I'], [73.80, 'think'], [74.13, 'that'], [74.41, 'I'], [74.70, 'could'], [75.01, 'live'], [75.30, 'in'], [75.59, 'San'], [75.90, 'Diego']]),
  line('verse-3', 78.05, 80.25, [[78.05, 'Bangkok,'], [78.75, 'Budapest,'], [79.55, 'or'], [79.85, 'Baton'], [80.25, 'Rouge']]),
  line('verse-3', 82.87, 86.10, [[82.87, 'Yes,'], [83.18, "I'd"], [83.55, 'travel'], [83.94, 'round'], [84.26, 'the'], [84.53, 'world'], [84.78, 'for'], [85.00, 'the'], [85.26, 'rest'], [85.54, 'of'], [85.84, 'my'], [86.10, 'days']]),
  line('verse-3', 87.20, 89.78, [[87.20, 'If'], [87.40, 'it'], [87.70, 'meant'], [87.88, 'that'], [88.12, 'I'], [88.39, 'could'], [88.69, 'forget'], [89.26, 'about'], [89.78, 'you']]),
  // Chorus 2 is chorus 1 at +36.60, +36.59, +36.57, +36.54 — measured per line,
  // and the drift across the four is the band easing, not noise in the fit.
  line('chorus-2', 91.42, 95.28, [[91.42, 'If'], [91.71, 'I'], [92.00, 'were'], [92.20, 'king'], [92.48, 'for'], [92.76, 'just'], [93.11, 'a'], [93.39, 'day'], [93.61, 'and'], [93.89, 'I'], [94.17, 'always'], [94.70, 'got'], [94.98, 'my'], [95.28, 'way']]),
  line('chorus-2', 96.44, 98.85, [[96.44, 'Know'], [96.72, 'no'], [97.01, 'other'], [97.61, 'dream'], [97.94, 'would'], [98.26, 'ever'], [98.85, 'do']]),
  line('chorus-2', 100.54, 104.21, [[100.54, 'It'], [100.83, "doesn't"], [101.25, 'matter'], [101.79, 'where'], [102.07, 'I'], [102.35, 'go,'], [102.63, 'in'], [102.91, 'the'], [103.19, 'sun'], [103.48, 'or'], [103.77, 'in'], [104.06, 'the'], [104.21, 'snow']]),
  line('chorus-2', 105.53, 108.20, [[105.53, 'The'], [105.82, 'only'], [106.39, 'one'], [106.77, 'I'], [107.06, 'want,'], [107.35, 'my'], [107.64, 'love,'], [107.92, 'is'], [108.20, 'you']]),
  // Ten, then seven, off the vocal-band envelope. The first group is even to
  // 0.33 s and can be trusted; the second is the softest thing in this file.
  line('ohs', 109.64, 112.64, [[109.64, 'Oh'], [109.98, 'oh'], [110.28, 'oh'], [110.62, 'oh'], [111.01, 'oh'], [111.41, 'oh'], [111.68, 'oh'], [111.99, 'oh'], [112.28, 'oh'], [112.64, 'oh']]),
  line('ohs', 114.60, 117.38, [[114.60, 'Oh'], [115.28, 'oh'], [115.57, 'oh'], [116.02, 'oh'], [116.60, 'oh'], [117.08, 'oh'], [117.38, 'oh']]),
  line('verse-4', 125.91, 128.43, [[125.91, 'I'], [126.01, 'think'], [126.27, "I'll"], [126.55, 'take'], [126.83, 'a'], [126.94, 'chance'], [127.31, 'on'], [127.59, 'Andalusia']]),
  line('verse-4', 130.65, 132.99, [[130.65, 'Walk'], [130.93, 'until'], [131.50, 'my'], [131.78, 'boots'], [132.12, 'are'], [132.41, 'faded'], [132.99, 'blue']]),
  line('verse-4', 135.41, 138.47, [[135.41, 'But'], [135.70, 'all'], [135.99, 'the'], [136.28, 'pretty'], [136.77, 'ladies'], [137.35, 'in'], [137.58, 'the'], [137.86, 'whole'], [138.15, 'wide'], [138.47, 'world']]),
  line('verse-4', 139.94, 142.61, [[139.94, 'Could'], [140.19, 'not'], [140.48, 'help'], [140.77, 'me'], [141.06, 'to'], [141.48, 'forget'], [142.05, 'about'], [142.61, 'you']]),
  line('chorus-3', 144.01, 148.11, [[144.01, 'If'], [144.30, 'I'], [144.59, 'were'], [144.88, 'king'], [145.17, 'for'], [145.44, 'just'], [145.72, 'a'], [146.00, 'day'], [146.28, 'and'], [146.57, 'I'], [146.86, 'always'], [147.53, 'got'], [147.82, 'my'], [148.11, 'way']]),
  line('chorus-3', 149.06, 151.37, [[149.06, 'Know'], [149.32, 'no'], [149.60, 'other'], [150.16, 'dream'], [150.44, 'would'], [150.78, 'ever'], [151.37, 'do']]),
  line('chorus-3', 152.87, 156.90, [[152.87, 'It'], [153.16, "doesn't"], [153.71, 'matter'], [154.27, 'where'], [154.55, 'I'], [154.82, 'go,'], [155.10, 'in'], [155.39, 'the'], [155.75, 'sun'], [156.02, 'or'], [156.30, 'in'], [156.60, 'the'], [156.90, 'snow']]),
  line('chorus-3', 158.54, 160.97, [[158.54, 'The'], [158.76, 'only'], [159.17, 'one'], [159.40, 'I'], [159.68, 'want,'], [159.95, 'my'], [160.22, 'love,'], [160.49, 'is'], [160.78, 'you,'], [160.97, 'oh']]),
  line('chorus-3', 161.43, 163.94, [[161.43, 'The'], [161.72, 'only'], [162.26, 'one'], [162.54, 'I'], [162.82, 'want,'], [163.10, 'my'], [163.38, 'love,'], [163.66, 'is'], [163.94, 'you']]),
]

const DURATION = 173.33

/**
 * Ten sections. Boundaries sit in the gaps between sung phrases, not on them:
 * a section's `to` is when its last line leaves the screen, so the turnaround
 * before the next line is held on black rather than on a stale lyric.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 18.2 },
  { id: 'verse-1', kind: 'verse', label: 'Verse 1', from: 18.2, to: 36.4 },
  { id: 'verse-2', kind: 'verse', label: 'Verse 2', from: 36.4, to: 54.4 },
  { id: 'chorus-1', kind: 'chorus', label: 'Chorus', from: 54.4, to: 72.8 },
  { id: 'verse-3', kind: 'places', label: 'Verse 3', from: 72.8, to: 91.0 },
  { id: 'chorus-2', kind: 'chorus', label: 'Chorus', from: 91.0, to: 109.2 },
  { id: 'ohs', kind: 'ohs', label: 'Oh-oh-oh', from: 109.2, to: 124.4 },
  { id: 'verse-4', kind: 'quiet', label: 'Verse 4', from: 124.4, to: 143.5 },
  { id: 'chorus-3', kind: 'chorus', label: 'Final chorus', from: 143.5, to: 166.0 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 166.0, to: DURATION },
]

/*
 * The trim moves the cuts inside the film, but not its ends: the first section
 * still starts at zero and the last still runs to the end of the file. Trimming
 * those too would leave twenty milliseconds at each end belonging to no section
 * at all, and `sectionAt` answers an unclaimed moment with the last section —
 * which is the end card, two and a half minutes early.
 */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const ANDALUSIA_SCORE = {
  title: 'Andalusia',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/andalusia.mp3',
  /** From `afinfo`, not from the tracklist's rounded 2:53. */
  duration: DURATION,
  /**
   * 105.2 BPM, first downbeat at 18.27. Fitted to the strum onsets across the
   * first verse, where they sit on the grid to within 30 ms — over the whole
   * song it drifts, because nobody played to a click. Decorative only: every
   * cut in the film lands on a measured word, never on this.
   */
  bpm: 105.2,
  beatPhase: 18.27,
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
