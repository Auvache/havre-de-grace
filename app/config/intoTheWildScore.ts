/*
 * 'Into the Wild', 3:25, timed word by word — the score its films are cut to.
 *
 * GENERATED, then read by hand. Do not reformat it by machine again: the
 * choruses and the two lines under the /music-videos/into-the-wild-styles window were
 * set by eye against the measurement, not by the solver.
 *
 * HOW THE TIMES WERE MEASURED
 * The method is andalusiaScore.ts's, with one change forced by the mix. The mp3
 * was decoded to 16 kHz PCM (`afconvert`) and an STFT taken at 10 ms.
 *
 *   1. Vocal presence. Andalusia's measure — the share of the spectrum in
 *      1.2–2.6 kHz — does not work on this record: the electric guitar and the
 *      cymbals live up there for most of the song, and the band never stops
 *      long enough to leave the voice on its own. What does work is that the
 *      voice is the only thing mixed dead centre. Decoded in stereo, the
 *      centre-only energy (|L+R|² less a multiple of |L−R|², clipped at zero)
 *      in 300 Hz–3.5 kHz, against the side energy in the same band, separates
 *      sung phrases from the band by 10–15 dB. That fixes every line start.
 *   2. The grid. The band played to a click: a comb fit of onset flux gives
 *      120.0 BPM with a beat at x.03 and x.53 in every sung block — 15–58 s,
 *      67–111 s and 150–199 s fit the same phase independently. Unlike
 *      Andalusia, the grid here is real and was used (below).
 *   3. Sections by cross-correlation of a centre-channel log spectrogram.
 *      Verse 2 is verse 1 at +52.00 (every couplet within 0.02 s), verse 3 is
 *      verse 1 at +136.00, and chorus 2 and chorus 3 are chorus 1 at +52.00 and
 *      +135.98 — so the arrangement is 26 bars and 68 bars of repeat, exactly.
 *   4. Syllables. Spectral flux on the centre channel in 0.7–4.5 kHz, weighted
 *      by vocal presence, and a shortest path over (syllable, sixteenth-note
 *      slot) that is rewarded for landing on an onset and charged for any gap
 *      that is not an eighth. Where lines are sung to the same words — the three
 *      choruses, and the two 'headed out on an adventure' lines — the evidence
 *      was pooled across repeats before solving, which is what made the chorus
 *      trustworthy: on its own each chorus puts 'into' somewhere different.
 *
 * WHAT TO TRUST
 *   - Line starts: to a frame at 30 fps, after the audit below.
 *   - The chorus: set by hand from the pooled presence trace, and identical in
 *     all three by construction. The voice drops out 51.20–51.35 and the 'Oh,'
 *     that follows is at 51.47 — the solver had it half a second late, because
 *     its start window was taken from the phrase detector.
 *   - 'The hush of a harbor so hollow' and 'The roar of a crowd center stage'
 *     were read syllable by syllable against the presence trace. They are the
 *     most carefully set lines in the file because they are the ones on screen.
 *   - The rest of the verses were the solver's, and were then audited word by
 *     word (below). A multi-syllable word is timed to its first syllable's
 *     vowel; a scooped entry ('Oh,', 'All', 'Ebony,', 'I'm' in verse 3) to
 *     where the scoop starts, which is where the presence trace jumps.
 *   - 111–151 s is the instrumental — trumpet and mellophone mostly, which are
 *     also centre-panned and are why the presence trace is not silent there.
 *     There is no lyric in it.
 *
 * THE VERSE AUDIT
 *   The solver's recurring fault was running a syllable or a word ahead of the
 *   singer: it spent a multi-syllable word's later syllables on the next words
 *   ('headed' was put on the 'I' of "I'm", 'out' on the 'ed' of 'headed'), or
 *   squeezed a line into half its length ('The sound of the wind through the
 *   sage' ended 1.3 s before the 'sage' is sung). Every verse word was
 *   re-read against three things that the solver did not use:
 *     - a centre-masked spectrogram (per-bin L/R coherence to the tenth power,
 *       0–8 kHz), where the singer's sibilants stand clear of the band — the
 *       's' of 'see', 'splendorous', 'sleeping', 'songs', 'search', 'silver',
 *       'sage' each fixes the next vowel to within a frame or two, and none of
 *       them lines up with the other verses, so they are not cymbals;
 *     - the dips in centre energy at 1–4 kHz that consonants cut ('p', 't',
 *       'k', 'm', 'n', 'd'), with the syllable timed where it recovers;
 *     - the pitch track, and the melody pooled across verses: the three
 *       verses share a rhythm line for line even where the words differ
 *       ('Stone-cold these beauties are sleeping' and 'Dress them in something
 *       revealing' land within 30 ms of each other at +52 s, syllable for
 *       syllable), which was the check on every move.
 *   Seventy-two words moved, most by 150–500 ms, the largest ('sage') by
 *   1.34 s. Six line starts moved: where the old one was on a crash cymbal
 *   ('Dress', was 92.03) or on centre-panned band before the voice ('I'm' in
 *   verse 3, was 160.05; 'The sound', was 172.07); where it was the end of a
 *   scoop rather than its start ('All', was 76.57; 'Ebony,', was 36.53); and
 *   where the pooled repeat disagreed ('Oh,' of verse 2 is 67.87, with verses
 *   1 and 3). The calibration check: the two hand-set lines agree with this
 *   method to 20–40 ms, and were not touched.
 *   Still least certain:
 *     - 'all the' in 'upon all the splendorous things' — three sung notes
 *       (25.71, 26.09, 26.35) for two words. 'all' is on the first; 'the' is
 *       left on the second and may belong on the third.
 *     - 'in' in 'put them in songs' (96.92) sits 100 ms after 'them' in a
 *       very quick run; 'or' in 'silver or gold' (166.18) and 'they' in 'You
 *       know they hate' (44.67) have no attack of their own to find.
 *     - 'I'll' (156.66), 'want' (84.24), 'and' in 'water and iron' (34.03,
 *       from the pitch, not an onset) and verse 2's 'of all' are placed, not
 *       measured, to a sixteenth.
 *     - 'sage' is sung from 174.83 but a second note follows at 175.16 and
 *       holds to about 175.9; 'things', 'alone', 'gold' and 'bone' also ring
 *       on well past their onset.
 */

export type SectionKind =
  | 'intro'
  | 'verse'
  | 'chorus'
  | 'break'
  | 'solo'
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
 * somebody watches a finished film and hears it: see andalusiaScore.ts, where
 * the same constant settled at +0.02. Positive runs the picture late.
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
  line('verse-1', 15.88, 17.55, [[15.88, 'Oh,'], [16.13, "I'm"], [16.52, 'headed'], [16.92, 'out'], [17.06, 'on'], [17.26, 'an'], [17.55, 'adventure']]),
  line('verse-1', 20.31, 23.31, [[20.31, 'To'], [20.56, 'see'], [21.02, 'if'], [21.30, 'I'], [21.56, "can't"], [22.32, 'lose'], [22.79, 'my'], [23.31, 'way']]),
  line('verse-1', 24.31, 27.40, [[24.31, 'And'], [24.87, 'stumble'], [25.40, 'upon'], [25.71, 'all'], [26.12, 'the'], [26.83, 'splendorous'], [27.40, 'things']]),
  line('verse-1', 28.38, 30.49, [[28.38, 'The'], [28.57, 'gods'], [29.07, 'hid'], [29.27, 'about'], [30.00, 'when'], [30.27, 'they'], [30.49, 'made']]),
  line('verse-1', 31.90, 34.54, [[31.90, 'Oh,'], [32.15, 'the'], [32.55, 'Earth'], [32.88, 'out'], [33.17, 'of'], [33.53, 'water'], [34.03, 'and'], [34.54, 'iron']]),
  line('verse-1', 36.44, 39.12, [[36.44, 'Ebony,'], [37.55, 'ivory,'], [38.78, 'and'], [39.12, 'bone']]),
  line('verse-1', 40.54, 42.79, [[40.54, 'Stone-cold'], [41.26, 'these'], [41.55, 'beauties'], [42.26, 'are'], [42.79, 'sleeping']]),
  line('verse-1', 44.30, 46.28, [[44.30, 'You'], [44.57, 'know'], [44.67, 'they'], [44.91, 'hate'], [45.80, 'sleeping'], [46.28, 'alone']]),

  line('chorus-1', 48.05, 50.55, [[48.05, 'So'], [48.30, "I'm"], [48.55, 'running'], [49.30, 'into'], [50.30, 'the'], [50.55, 'wild']]),
  line('chorus-1', 51.47, 52.42, [[51.47, 'Oh,'], [52.02, "I'm"], [52.42, 'running']]),

  line('verse-2', 67.87, 69.26, [[67.87, 'Oh,'], [68.13, "I'm"], [68.56, 'tired'], [68.67, 'of'], [68.77, 'all'], [68.99, 'the'], [69.26, 'conjecture']]),
  line('verse-2', 72.45, 74.32, [[72.45, 'Dreaming'], [73.27, 'and'], [73.77, 'scheming'], [74.03, 'and'], [74.32, 'goals']]),
  line('verse-2', 76.38, 78.87, [[76.38, 'All'], [76.88, 'that'], [77.07, 'it'], [77.24, 'creates'], [78.30, 'is'], [78.87, 'pressure']]),
  line('verse-2', 80.56, 82.82, [[80.56, 'And'], [80.66, 'all'], [80.94, 'that'], [81.12, 'it'], [81.32, 'makes'], [81.81, 'us'], [82.25, 'is'], [82.82, 'old']]),
  line('verse-2', 83.92, 86.52, [[83.92, 'Oh,'], [84.07, 'I'], [84.24, 'want'], [84.55, 'to'], [84.66, 'take'], [84.92, 'stories'], [85.55, 'with'], [86.52, 'meaning']]),
  line('verse-2', 88.04, 89.94, [[88.04, 'From'], [88.16, 'the'], [88.30, 'tales'], [88.66, 'that'], [88.79, 'my'], [89.00, "life's"], [89.29, 'taught'], [89.62, 'to'], [89.94, 'me']]),
  line('verse-2', 92.52, 94.25, [[92.52, 'Dress'], [92.90, 'them'], [93.25, 'in'], [93.57, 'something'], [94.25, 'revealing']]),
  line('verse-2', 96.32, 98.83, [[96.32, 'And'], [96.57, 'put'], [96.82, 'them'], [96.92, 'in'], [97.25, 'songs'], [98.04, 'that'], [98.32, 'I'], [98.83, 'sing']]),

  line('chorus-2', 100.05, 102.55, [[100.05, 'So'], [100.30, "I'm"], [100.55, 'running'], [101.30, 'into'], [102.30, 'the'], [102.55, 'wild']]),
  line('chorus-2', 103.47, 104.42, [[103.47, 'Oh,'], [104.02, "I'm"], [104.42, 'running']]),

  line('verse-3', 151.88, 153.55, [[151.88, 'Oh,'], [152.13, "I'm"], [152.52, 'headed'], [152.92, 'out'], [153.06, 'on'], [153.26, 'an'], [153.55, 'adventure']]),
  line('verse-3', 156.54, 158.28, [[156.54, 'Where'], [156.66, "I'll"], [156.94, 'end'], [157.30, 'up,'], [157.55, 'I'], [157.91, "don't"], [158.28, 'know']]),
  line('verse-3', 160.40, 162.90, [[160.40, "I'm"], [160.87, 'off'], [161.26, 'in'], [161.54, 'search'], [161.88, 'of'], [162.29, 'those'], [162.90, 'treasures']]),
  line('verse-3', 164.30, 166.44, [[164.30, 'That'], [164.57, "aren't"], [164.91, 'made'], [165.25, 'of'], [165.74, 'silver'], [166.18, 'or'], [166.44, 'gold']]),
  line('verse-3', 168.03, 170.57, [[168.03, 'I'], [168.27, 'mean'], [168.54, 'glaciers'], [169.29, 'and'], [169.51, 'gardens'], [170.26, 'and'], [170.57, 'grottos']]),
  line('verse-3', 172.25, 174.83, [[172.25, 'The'], [172.55, 'sound'], [172.94, 'of'], [173.07, 'the'], [173.28, 'wind'], [173.78, 'through'], [174.22, 'the'], [174.83, 'sage']]),
  line('verse-3', 176.03, 178.53, [[176.03, 'The'], [176.58, 'hush'], [177.00, 'of'], [177.30, 'a'], [177.55, 'harbor'], [178.30, 'so'], [178.53, 'hollow']]),
  line('verse-3', 180.30, 182.90, [[180.30, 'The'], [180.55, 'roar'], [180.95, 'of'], [181.22, 'a'], [181.50, 'crowd'], [182.10, 'center'], [182.90, 'stage']]),

  line('chorus-3', 184.05, 186.55, [[184.05, 'So'], [184.30, "I'm"], [184.55, 'running'], [185.30, 'into'], [186.30, 'the'], [186.55, 'wild']]),
  line('chorus-3', 187.47, 188.42, [[187.47, 'Oh,'], [188.02, "I'm"], [188.42, 'running']]),
]

const DURATION = 205.584

/**
 * Ten sections. Boundaries sit in the gaps between sung phrases, not on them.
 * The chorus is two lines, but the second one — 'Oh, I'm running' — is held and
 * ornamented for five or six seconds, so each chorus runs well past its last
 * onset.
 */
const RAW_SECTIONS: ScoreSection[] = [
  { id: 'intro', kind: 'intro', label: 'Intro', from: 0, to: 15.6 },
  { id: 'verse-1', kind: 'verse', label: 'Verse 1', from: 15.6, to: 47.85 },
  { id: 'chorus-1', kind: 'chorus', label: 'Chorus', from: 47.85, to: 58.4 },
  { id: 'break', kind: 'break', label: 'Break', from: 58.4, to: 67.6 },
  { id: 'verse-2', kind: 'verse', label: 'Verse 2', from: 67.6, to: 99.85 },
  { id: 'chorus-2', kind: 'chorus', label: 'Chorus', from: 99.85, to: 110.8 },
  { id: 'solo', kind: 'solo', label: 'Horns', from: 110.8, to: 151.4 },
  { id: 'verse-3', kind: 'verse', label: 'Verse 3', from: 151.4, to: 183.85 },
  { id: 'chorus-3', kind: 'chorus', label: 'Final chorus', from: 183.85, to: 199.0 },
  { id: 'outro', kind: 'outro', label: 'Outro', from: 199.0, to: DURATION },
]

/* The first section starts at zero and the last runs to the end of the file, trimmed or not. */
export const SECTIONS: ScoreSection[] = RAW_SECTIONS.map((section, index) => ({
  ...section,
  from: index === 0 ? 0 : at(section.from),
  to: index === RAW_SECTIONS.length - 1 ? DURATION : at(section.to),
}))

export const LINES: ScoreLine[] = RAW_LINES.map((raw, index) => ({ index, ...raw }))

export const INTO_THE_WILD_SCORE = {
  title: 'Into the Wild',
  album: 'Into the Wild',
  artist: 'Havre De Grace',
  src: '/albums/into-the-wild/music/into-the-wild.mp3',
  /** From `afinfo`, not from the tracklist's rounded 3:25. */
  duration: DURATION,
  /**
   * The last hit of the arrangement: the sharpest broadband onset in the final
   * ten seconds, with the record gone to silence half a second later. It is
   * two seconds from the end of the file, so the end card's three-second logo
   * and its credits run on past the audio. Absolute song time; not moved by TRIM.
   */
  endCardAt: 203.55,
  /** 120.0 BPM, a beat at 15.03. Measured, and steady — the band played to a click. */
  bpm: 120,
  beatPhase: 15.03,
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
