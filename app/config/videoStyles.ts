/*
 * The music-video style suite — seven looks for "Andalusia", and for whatever
 * gets made after it.
 *
 * WHAT THIS FILE IS FOR
 * The reference sheets in public/video-styles are what a style looks like. This
 * is what a style *is*: the rules an agent needs in order to build the film
 * without asking anybody what the style meant. Each entry says what drives every
 * moving thing, what each of the ten sections of the arrangement does, which
 * drawing goes with which lyric, and — the part that is usually missing from a
 * style guide and is the reason most of them go wrong — what the style must not
 * do.
 *
 * HOW THE SHEETS ARE MADE
 * tools/video-styles/ generates them; `node tools/video-styles/build.mjs`
 * rewrites public/video-styles/*.svg. A change to a look belongs in the module
 * under tools/video-styles/styles/, never in the .svg.
 *
 * WHAT A SHEET SHOWS
 * The top 1600x900 of a sheet is a frame of the film. Everything below y=900 is
 * apparatus: five thumbnails of the same style at the title, a verse, a chorus,
 * the oh-ohs and the quiet fourth verse, and the palette. The five thumbnails
 * exist because the honest criticism of the first Andalusia cut was not that any
 * one frame was wrong — it was that the four hundredth frame looked like the
 * fourth. If a style's five thumbnails look alike it has that problem and should
 * not be built.
 *
 * The end card is not one of the five, because it is the same in all seven and
 * drawing it seven times would say nothing. It has its own sheet — END_CARD
 * below, and public/video-styles/end-card.svg.
 *
 * WHAT IS TRUE OF ALL SEVEN
 *   - The clock is the song's, not a metronome. Every cut lands on a measured
 *     word from app/config/andalusiaScore.ts. The BPM in that file is
 *     decorative; nothing reads it.
 *   - A frame is a pure function of `t`. No animation state, nothing to leave
 *     half-transitioned when the film is scrubbed. This is what makes the film
 *     seekable and what lets frames be captured off it for an mp4.
 *   - No slate, and nothing that names anything. The first cut had a running
 *     clock, a section name and a progress bar burned into the frame; they read
 *     as instrumentation rather than as film and they are gone, along with the
 *     footers that carried the band and the album. A style that wants a number
 *     on screen has to earn it as a design element — b3-academy's frame counter
 *     and a2's folio do, nothing else may.
 *   - Every style draws. A line about boots puts boots in the frame. The motif
 *     library in tools/video-styles/motifs.mjs is the shared set, and MOTIF_CUES
 *     below maps lyric to drawing once for all seven.
 */

export type StyleFamily = 'A' | 'B'

/** What a moving thing is hung off. The whole vocabulary — there is no other. */
export type Driver =
  /** A measured word onset. The finest grain anything may move at. */
  | 'word'
  /** A line start, from the score. */
  | 'line'
  /** A section boundary. Ten of them. */
  | 'section'
  /** The live AnalyserNode — level, bass, treble. */
  | 'audio'
  /** Absolute position in the song, for things that must arrive at a time. */
  | 'clock'

export interface StyleMotion {
  driver: Driver
  /** What happens, in one sentence an implementer can act on. */
  does: string
}

export interface StyleColour {
  name: string
  hex: string
  role: string
}

export interface VideoStyle {
  id: string
  family: StyleFamily
  name: string
  /** The generated reference sheet. */
  sheet: string
  tagline: string
  /** The idea, at length. Read this before writing any code. */
  premise: string
  palette: StyleColour[]
  /** Type rules. Every style in the suite uses Jost, which is already on site. */
  type: string[]
  /** Where things go. */
  layout: string[]
  /** Everything that moves, and what moves it. */
  motion: StyleMotion[]
  /** What each of the ten sections does. Keys are score section ids. */
  sections: Partial<Record<
    'intro' | 'verse-1' | 'verse-2' | 'chorus-1' | 'verse-3' | 'chorus-2' | 'ohs' | 'verse-4' | 'chorus-3' | 'outro',
    string
  >>
  /** How this style draws the motifs, or why it does not. */
  motifs: string
  /** The mistakes that would ruin it. */
  avoid: string[]
  /** Roughly what it costs to build on top of the existing MusicVideoFilm. */
  effort: 'low' | 'medium' | 'high'
}

/*
 * The lyric-to-drawing map, shared by every style that draws.
 *
 * It is here rather than in a style because the mapping is a reading of the
 * song, not a look: whatever the film ends up being, "underneath a churchyard"
 * is a church. Names are the keys of tools/video-styles/motifs.mjs.
 */
export const MOTIF_CUES: { match: string, motif: string, note?: string }[] = [
  { match: 'Andalusia', motif: 'orange', note: 'Orange branch, not a flag or a bull. The place, not the postcard.' },
  { match: 'boots', motif: 'boot' },
  { match: 'breaking through', motif: 'boot', note: 'Same boot, coming apart — this is the one line in the song that breaks.' },
  { match: 'faded blue', motif: 'boot', note: 'The boot again, fourth verse, worn: thinner line, same drawing.' },
  { match: 'Spanish', motif: 'guitar' },
  { match: 'pretty girls', motif: 'fan' },
  { match: 'pretty ladies', motif: 'fan' },
  { match: 'Stockholm', motif: 'sailboat' },
  { match: 'sailors', motif: 'sailboat' },
  { match: 'cold', motif: 'snowflake' },
  { match: 'churchyard', motif: 'church' },
  { match: 'growing old', motif: 'hourglass' },
  { match: 'king', motif: 'crown' },
  { match: 'dream', motif: 'door' },
  { match: 'in the sun', motif: 'sun' },
  { match: 'in the snow', motif: 'snowflake' },
  { match: 'my love, is you', motif: 'heart', note: 'The only sentimental drawing in the film. Use it once a chorus, never twice.' },
  { match: 'San Diego', motif: 'compass' },
  { match: 'Bangkok', motif: 'plane' },
  { match: 'Budapest', motif: 'suitcase' },
  { match: 'Baton Rouge', motif: 'globe' },
  { match: 'round the world', motif: 'globe' },
  { match: 'walk', motif: 'walker' },
  { match: 'travel', motif: 'plane' },
  { match: 'forget about you', motif: 'clock' },
]

/*
 * Rules that hold for every style, restated where an implementer will hit them.
 * A style entry may tighten one of these; none may contradict one.
 */
export const SUITE_RULES = [
  'One frame is one pure function of t. If a look needs to remember the previous frame, the look is wrong for this film.',
  'Cuts land on measured words. Never on a beat grid, never on a round number of seconds.',
  'No burned-in slate, clock, section label or progress bar. The page around the film owns the transport.',
  'The frame draws what the line is about. Pick the motif from MOTIF_CUES; do not invent one per style.',
  'A section that repeats musically must not repeat visually. The three choruses are the test: if chorus 3 is chorus 1 at a larger size, it has failed.',
  'Type is Jost, already served on the site. Declare family and weight in CSS, not as SVG attributes, or @nuxt/fonts will not see them and the browser will synthesise a bold.',
  'Rows of lyric are fitted to the measure and stretched to it with textLength. No line is laid out by hand.',
  'The oh-ohs section has no words to set. Every style needs an answer for seventeen syllables and no lyric — that is where most of them will fail.',
  'Nothing on screen names a section. No VERSE TWO, no CHORUS, no bar count. Somebody listening to a song already knows where they are in it, and a label is the surest way to make a film look like a preview of itself rather than the thing.',
  'The band name appears once, in the opening title, and leaves with it. The album name does not appear at all. Between the title card and the end card the frame carries the song and nothing else — no footer, no corner mark, no running lockup.',
  'Every film ends on the same two screens. See END_CARD: a style does not design its own ending.',
]

/*
 * The end card — the one part of the film that is not a style decision.
 *
 * Whatever a film has been for two and a half minutes, it ends the same way, so
 * that the last thing anybody sees of a record is the first thing they saw of
 * the site. The lockup and the ink are the splash screen's
 * (app/components/global/AppSplashScreen.vue, BrandMark variant="lockup"); the
 * ground is not. The splash sits on #141414, and at the end of a film that has
 * been paper or amber or ink for the whole run, "nearly black" reads as a
 * mistake where black reads as an ending.
 */
export const END_CARD = {
  black: '#000000',
  ink: '#f4f6f7',
  /** public/logos/suite/a4-lockup-stacked.svg — the same file the splash uses. */
  lockup: 'a4-lockup-stacked',
  /** Of a 1600-unit frame, centred on both axes. */
  lockupWidth: 500,
  screens: [
    {
      name: 'Logo',
      in: 'Lands on the last note of the arrangement — the final chord, not the final sung word. Hard cut; the film does not fade into it.',
      hold: '3 seconds.',
      content: 'The lockup, centred vertically and horizontally. Nothing else in the frame — no title, no year, no handle.',
    },
    {
      name: 'Credits',
      in: 'Hard cut at +3s. No dissolve between the two screens; they are two cards, not a transition.',
      hold: 'To the end of the audio and about two seconds past it, then the film ends on black.',
      content: 'One credit per line, centred vertically and horizontally in the frame and centre-aligned as text. 34 on 62. No heading, no rules, and no mark — the lockup has just had three seconds to itself and repeating it here spends that twice.',
    },
  ],
  credits: [
    'Words, voice and guitar — Stefan Auvache Bradley',
    'Mellophone, mix and production — Parker Holt',
  ],
  sheet: '/video-styles/end-card.svg',
} as const

/*
 * FAMILY A — five ways out of the film that exists.
 *
 * Each of these is the current Andalusia cut with the slate taken off, a
 * drawing behind the type, and one structural answer to the thing that is
 * actually wrong with it: that a verse looks like the verse before it. They are
 * ordered by how far they move from what is built — a1 is an evening's work on
 * the existing component, a5 is a new one.
 */
export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: 'a1-ghost-plate',
    family: 'A',
    name: 'Ghost Plate',
    sheet: '/video-styles/a1-ghost-plate.svg',
    tagline: 'The film as it stands, with the slate stripped off and a drawing of what the line is about held behind the type.',
    premise:
      'The smallest change that fixes the most. Ink, bone and red stay; the big fitted type stays; the accent colour running along the line at the speed of the voice stays. What goes is the slate and the progress bar, and what arrives is a drawing — one per line, picked from MOTIF_CUES, set large at eight to twenty per cent of the foreground and bled off the frame. The type column narrows to 1020 so the drawing has somewhere to be that is not behind a letter. Variety comes from three things moving independently: the motif changes every line, the type block anchors to one of six cells rather than always the top left, and a foreground element — the walkers along the horizon here — carries a second, slower rhythm under the lyric.',
    palette: [
      { name: 'Ink', hex: '#0d0d0c', role: 'Ground for the verses, intro and end card.' },
      { name: 'Bone', hex: '#f2ede3', role: 'Type and drawings. Becomes the ground in verse 2.' },
      { name: 'Red', hex: '#d8382b', role: 'The voice: the word being sung, and the chorus ground.' },
    ],
    type: [
      'Jost 700, uppercase, ligatures off.',
      'Body rows cap at 210, the landing row at 300–344. Fit each row to the measure then stretch to it exactly with textLength.',
      'Break a line at its own commas first, then to a character budget. Never hand-break.',
      'The landing row holds until the next line cuts it. Body rows fall to 35% a beat after the line ends.',
    ],
    layout: [
      'Type column x=80, width 1020. Drawing lives in the 460 units to the right of it and may cross the boundary.',
      'Thirteen-column grid at 120 units, drawn at 10% — the one piece of the old chrome that is composition rather than instrumentation.',
      'A horizon at y=790 in the verses, with foreground figures standing on it. It is absent in the choruses.',
    ],
    motion: [
      { driver: 'word', does: 'The accent colour advances along the landing row, clipped to the word being sung.' },
      { driver: 'line', does: 'The whole block cuts — no fade — and the motif is replaced with the one MOTIF_CUES gives for the new line.' },
      { driver: 'line', does: 'The block re-anchors to the next of six grid cells, so consecutive lines do not sit in the same place.' },
      { driver: 'section', does: 'Palette flips and the frame inverts for two frames. Once per section, never per word.' },
      { driver: 'audio', does: 'The ghost motif line weight breathes with level, between 2.2 and 3.4. Nothing else touches the analyser.' },
    ],
    sections: {
      intro: 'Title sequence over a ghosted guitar. Rule draws across, the artist name tracks out at 2.7s, the title lands at 5.4s, three count-in squares at 16.0/16.85/17.7. The artist name leaves with the title at 15.0s and does not come back.',
      'verse-1': 'Ink ground, bone type, boot and walkers. The horizon is introduced here.',
      'verse-2': 'Inverted — bone ground, ink type — and the column moves to x=360. Sailboat and snowflake.',
      'chorus-1': 'Red ground, bone type, crown filling the frame at 14%. Per-line flip to ink.',
      'verse-3': 'Bone ground. The place names get a box around the landing word; the motif is a different vehicle per line (plane, suitcase, globe).',
      'chorus-2': 'Ink ground with red type — the inverse of chorus 1, not a repeat of it.',
      ohs: 'No lyric. Seventeen OH cells in two rows, a ring set expanding on each hit, and the birds motif as the whole frame.',
      'verse-4': 'Near-black, light-weight type at 82, centred, natural width, air around it. The arrangement drops away and so does the type. Boot again, thinner.',
      'chorus-3': 'Red at the largest size in the film. It must also do something the first two did not — the crown drawing completes here rather than being cropped.',
      outro: 'The shared end card. It is the same in all seven films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'Every line. Stroke in the foreground colour at 8–20% opacity, line weight 2.2–3.6, scaled 300–460 units, often rotated a few degrees off square and allowed to bleed.',
    avoid: [
      'Putting the drawing behind the type at full width — it reads as noise, which is exactly how the first attempt failed.',
      'Firing the full-frame inversion on every word. At a word every third of a second it reads as a fault in the file.',
      'Letting the landing row be smaller than the body rows. The line has to end on one word held large.',
    ],
    effort: 'low',
  },
  {
    id: 'a2-riso-press',
    family: 'A',
    name: 'Riso Press',
    sheet: '/video-styles/a2-riso-press.svg',
    tagline: 'Two inks on uncoated paper with the plates a few pixels out of register.',
    premise:
      'A printed object rather than a screen. Everything is set on warm paper with visible grain, in two inks that never quite line up — the type is drawn twice, once in red offset five to eight pixels down and right, once in ink on top. The misregistration is both the look and the variety mechanism: the offset vector is a function of position in the song, tight in the verses and a full eight pixels apart by the last chorus, so twenty consecutive lines of the same layout still do not look like one another. Motifs are stamps, not ghosts: solid, high-contrast, printed at 20–30%.',
    palette: [
      { name: 'Paper', hex: '#efe7d6', role: 'The stock. Never pure white.' },
      { name: 'Ink', hex: '#1a1a18', role: 'Plate one.' },
      { name: 'Red', hex: '#e2402f', role: 'Plate two, and the chorus flood.' },
      { name: 'Blue', hex: '#2f4d8c', role: 'The third ink, used only for motifs — never for type.' },
    ],
    type: [
      'Jost 700 uppercase for the lyric; 600 with 10–12 tracking for the small printed lines.',
      'Every lyric row is printed twice. Red copy first at 85% opacity and offset, ink copy on top.',
      'Rules are part of the type: a 6-unit rule over the block, a 2-unit rule under it, a 6-unit rule at the foot. They frame the lyric and they carry no words — the space under the top rule is where a section label would have gone, and it stays empty.',
    ],
    layout: [
      'Eight poster layouts in rotation, one per line, none repeating inside a section: left block, centred block, right block, split, stacked caps, full-bleed, boxed, and hung from the foot rule.',
      'A folio number bottom right — this is the one number allowed on screen in this style, because a printed sheet has one.',
      'Grain is a fractalNoise filter at baseFrequency 1.4, four octaves, composited over the whole frame at the end.',
    ],
    motion: [
      { driver: 'word', does: 'The ink plate lands. The red plate is already down; a word arriving is the second plate hitting.' },
      { driver: 'line', does: 'The poster layout advances to the next in the rotation.' },
      { driver: 'section', does: 'Plate dominance swaps: which of the two inks is the type and which is the shadow.' },
      { driver: 'clock', does: 'Misregistration widens monotonically across the song, from 3 units at the first verse to 8 at the last chorus.' },
      { driver: 'audio', does: 'Grain opacity rides level between 0.28 and 0.45. Subtle — it should read as paper, not as static.' },
    ],
    sections: {
      intro: 'The only frame in the film where both plates land square. Artist name above, title centred, rules top and bottom, guitar stamp behind. Both leave together at the first downbeat.',
      'verse-1': 'Left block, ink dominant, boot stamped in red.',
      'verse-2': 'Right block, blue sailboat stamp, snowflake small in the corner.',
      'chorus-1': 'Red floods the sheet and the type is knocked out of it in paper colour. Crown stamped in paper at 30%.',
      'verse-3': 'The place names — this is the style at its best. Full-bleed type, globe in blue behind, plane stamped small, folio ticking.',
      'chorus-2': 'Flood again, but ink rather than red, with red type. Same device, different plate.',
      ohs: 'The plate prints dots. Ten large, seven small, one struck in red per oh. No letterforms at all.',
      'verse-4': 'Back to one ink. Small type, wide margins, no offset — the press has been cleaned.',
      'chorus-3': 'Both floods at once: red sheet, ink block, paper type, the widest misregistration in the film.',
      outro: 'The shared end card. It is the same in all seven films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'Stamped, not ghosted: 20–30% opacity, 4–5 unit stroke, always in the ink that is not carrying the type.',
    avoid: [
      'Clean edges. If the frame could have come off a laser printer the style is not doing its job.',
      'Using blue for type. It is the motif ink; the moment it sets a word the two-plate logic collapses.',
      'Animating the misregistration per frame — it should drift over a minute, not jitter.',
    ],
    effort: 'medium',
  },
  {
    id: 'a3-split-flap',
    family: 'A',
    name: 'Split Flap',
    sheet: '/video-styles/a3-split-flap.svg',
    tagline: 'The whole song on a departure board, so no two frames a third of a second apart look the same.',
    premise:
      'The current film already does this once, in the verse of place names, and it is the best thing in it. Extended to the whole song it solves the repetition problem structurally rather than decoratively: a board is never still. Between two sung words the cells that are about to change are mid-flip, showing the top half of the outgoing glyph over the bottom half of the incoming one — so there is no such thing as a held frame. Drawings are built out of lit cells, because a board can only draw the way a board draws.',
    palette: [
      { name: 'Board', hex: '#121210', role: 'The housing.' },
      { name: 'Cell', hex: '#1d1d1a', role: 'An unlit flap.' },
      { name: 'Amber', hex: '#f0b429', role: 'Lit glyphs. The default ink.' },
      { name: 'Bone', hex: '#ece7dc', role: 'The second ink, for a row that needs to be quieter.' },
      { name: 'Red', hex: '#d8382b', role: 'The word being sung, and the chorus housing.' },
    ],
    type: [
      'One glyph per cell. Cells are 62x86 with a 6-unit gap and a 2.5-unit split line across the middle.',
      'Jost 600 at 58 inside a cell, centred. Never stretched — a board has fixed pitch, which is the point.',
      'A row is a fixed number of cells. A short line leaves blanks; it does not centre itself.',
    ],
    layout: [
      'Three rows of eighteen cells fills the frame. Rows sit at y=170, 290, 410.',
      'Header strip 110 tall in near-black. It carries the board\'s own word — DEPARTURES — and never a section name, a time or the band. It is furniture belonging to the object, not to the film.',
      'Motifs are bitmaps: rows of "1" and "." at 40–56 unit cells, lit only — never draw the off cells of a motif or it reads as a grey slab.',
    ],
    motion: [
      { driver: 'word', does: 'The cells whose glyph differs from the outgoing one flip. A flip is two frames: half-covered, then landed.' },
      { driver: 'line', does: 'The whole board re-spells. Cells that happen to share a glyph with the previous line never move, which is what makes it look mechanical rather than animated.' },
      { driver: 'section', does: 'Housing colour changes and the header strip re-labels.' },
      { driver: 'audio', does: 'Nothing. This is the one style where the analyser is not wired in — a board does not respond to sound, and faking it would break the conceit.' },
    ],
    sections: {
      intro: 'The board spins up from blank, every cell cycling, and settles on the title with the artist name flapping in under it. This is the count-in. Both rows blank out before the first verse.',
      'verse-1': 'Three rows, amber. Boot bitmap low right.',
      'verse-2': 'Two rows, bone, board pulled to the right third.',
      'chorus-1': 'Housing goes red, glyphs bone and amber, crown bitmap at 56-unit cells fills the lower half.',
      'verse-3': 'The literal departure board. Place names in the left columns, a time column, a status column that reads NEVER.',
      'chorus-2': 'Red again but the crown is drawn in off-cells against lit ones — the negative of chorus 1.',
      ohs: 'Every cell on the board flips at once, seventeen times. No glyphs, just the pattern of lit cells making diagonals.',
      'verse-4': 'One row, dead centre, everything else unlit. The board at its quietest.',
      'chorus-3': 'Four rows — one more than the board has shown all film — and the crown completes into the header.',
      outro: 'The shared end card. It is the same in all seven films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'As cell bitmaps only. Crown and boot are defined in the style module; a new motif needs a new bitmap, not a scaled path.',
    avoid: [
      'Tweening a flip. It is two frames, hard. A smooth rotation makes it a web animation rather than a board.',
      'Stretching a word across the row. Fixed pitch is the whole conceit.',
      'Wiring the analyser in. Nothing on a departure board knows what the music is doing.',
    ],
    effort: 'medium',
  },
  {
    id: 'a4-wide-margin',
    family: 'A',
    name: 'Wide Margin',
    sheet: '/video-styles/a4-wide-margin.svg',
    tagline: 'Swiss editorial. A narrow measure of quiet type, one large line drawing, and a great deal of paper left alone.',
    premise:
      'The opposite bet from everything else in family A: instead of filling the frame with type, give almost all of it away. The lyric sets in a 400-unit measure at the left at a size you read rather than a size you are hit with, and the right two-thirds carries one continuous line drawing at full strength in clay. This is the only style in the suite where the picture is the loud element and the words are quiet — which makes it the one to reach for if the film is going to sit on an album page rather than on YouTube. Variety comes from the drawing, which changes every line, and from the measure sliding down the page as a verse goes on, so the fourth line of a verse is set 300 units lower than the first.',
    palette: [
      { name: 'Paper', hex: '#f0ede5', role: 'Ground, almost always.' },
      { name: 'Ink', hex: '#1b1b19', role: 'Type.' },
      { name: 'Clay', hex: '#b4553b', role: 'Drawings, the line number, and the chorus ground.' },
      { name: 'Sea', hex: '#4a6670', role: 'A second drawing colour, for the cold half of the song.' },
    ],
    type: [
      'Jost 700 uppercase at 78–96 for the lyric. Small — it should never be the first thing the eye lands on.',
      'No label above the measure. The 120-unit line number is the only thing in that space, and it counts lines, not sections — an editorial page numbers itself, it does not announce what chapter you are in.',
      'A 120-unit 300-weight line number sits above that at 35% — the only decorative numeral in the suite.',
    ],
    layout: [
      'Measure x=80, width 400. A 1-unit vertical rule at x=560 at 16% marks the column edge and is never crossed by type.',
      'Drawing occupies 1000–1500, centred around y=430, at 500–640 units.',
      'The measure slides from top=300 to top=600 across a verse, one step per line.',
      'The chorus mirrors the whole layout: measure moves to x=1120, drawing to the left.',
    ],
    motion: [
      { driver: 'word', does: 'Clay runs along the last row of the measure at the speed of the voice. Nothing else moves on a word.' },
      { driver: 'line', does: 'The drawing is replaced and the measure steps down.' },
      { driver: 'section', does: 'The layout mirrors, and the ground colour changes in the choruses only.' },
      { driver: 'audio', does: 'Nothing. The style is a printed page; a page does not pulse.' },
    ],
    sections: {
      intro: 'The only centred frame in the style, and the only full-width rule. Artist name above the rule, title under it, guitar drawing bottom right. Both clear before verse one.',
      'verse-1': 'Measure top, boot drawing, walkers small along the foot.',
      'verse-2': 'Measure a third down, sailboat in clay, snowflake in sea at the corner.',
      'chorus-1': 'Ground goes clay, drawing goes paper colour, measure mirrors to the right. Crown at 620 units.',
      'verse-3': 'Three drawings at once, small, in a row across the right — the only frame in the style with more than one.',
      'chorus-2': 'Clay ground again but the drawing is cropped to a detail of the crown rather than the whole thing.',
      ohs: 'No measure at all. Seventeen small clay marks walking across the paper on a sine, and the birds drawing.',
      'verse-4': 'Smallest type in the film, measure dead centre, no drawing. Paper and eight words.',
      'chorus-3': 'Paper ground, clay type — the inverse of the other two choruses — and the drawing runs off three edges.',
      outro: 'The shared end card. It is the same in all seven films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'One per line, at 75–85% opacity — the only style where a motif is fully present rather than ghosted. Stroke 2.4–2.6, continuous line preferred.',
    avoid: [
      'Filling the space. The margin is the design; a second element in it is a mistake.',
      'Scaling the type up for the choruses. This style gets louder by changing colour, never by changing size.',
      'Outlining the drawing in a second colour. One weight, one colour, one line.',
    ],
    effort: 'low',
  },

  /*
   * FAMILY B — ten directions that are not the current film at all.
   *
   * These share the clock, the score and the motif map with family A and
   * nothing else. Ordered roughly by how far they are from kinetic typography:
   * b1 tells a story, b2 abandons words almost entirely, and the rest sit
   * between.
   */
  {
    id: 'b1-flipbook',
    family: 'B',
    name: 'Flipbook',
    sheet: '/video-styles/b1-flipbook.svg',
    tagline: 'Somebody drawing the song. Lyric flat and still along the top, a stick-figure stage underneath where everything that moves lives.',
    premise:
      'The frame is cut in two and the halves never trade places. The top 250 units are the lyric, set flat and quiet and completely still — you read it, it does not perform. The bottom 650 is a stage where the line is acted out by stick figures on a ground line, and that is where every moving thing in the film lives. It is drawn, so it is drawn badly on purpose: every straight line is five segments with a pixel or two of tremble on each, every circle is an eighteen-point polygon that does not quite close, and the tremble is seeded off the frame number so the whole picture boils the way hand-inked animation does. The discipline this style demands is that the stage has to actually act the line — a figure walking for "walk", a figure standing still under a church for "stranded" — which means the storyboard is a real piece of work and cannot be generated.',
    palette: [
      { name: 'Paper', hex: '#f7f4ea', role: 'The page. Ruled, with a margin line.' },
      { name: 'Pencil', hex: '#23262b', role: 'Everything drawn, and the chorus ground.' },
      { name: 'Rule', hex: '#c2d4e2', role: 'The ruled lines of the paper, at 50%.' },
      { name: 'Red', hex: '#d8382b', role: 'The line being sung, and the one prop per scene that matters.' },
    ],
    type: [
      'Jost 600 at 70–82, centred in the band, sentence case not caps — it is a caption, not a title.',
      'Two rows maximum. The row being sung is red, the other is pencil.',
      'The type does not wobble. It is the only clean thing in the frame, which is what makes the drawing read as drawn.',
    ],
    layout: [
      'Band 0–250, ruled paper below it, a 3-unit pencil rule on the boundary.',
      'Ground line around y=760, drawn with the same wobble as everything else.',
      'Figures are proportional: head r=0.11h at 0.885h, shoulders 0.70h, hips 0.40h, feet on the ground line. Six poses — walk, stand, wave, carry, reach, sit.',
      'Props sit on the ground line or in the sky: suitcase, sun, boot, crown, cloud.',
    ],
    motion: [
      { driver: 'word', does: 'A limb moves. One pose step per word is the walk cycle — this is what syncs the drawing to the voice.' },
      { driver: 'line', does: 'The scene is replaced. New figures, new props, same ground line. Hard cut, no transition.' },
      { driver: 'section', does: 'The paper inverts for the choruses — pencil ground, paper drawing — and the ground line moves.' },
      { driver: 'clock', does: 'The tremble reseeds every second frame. At 30fps that is the boil; at 60 it is too fast and reads as noise.' },
      { driver: 'audio', does: 'Nothing. A drawing does not know what the music is doing, and pretending otherwise is the one thing that would make this look cheap.' },
    ],
    sections: {
      intro: 'Hand-lettered title with the artist name under it, one figure waving, a sun. Nothing else on the page, and the names are rubbed out before the first verse.',
      'verse-1': 'A figure crosses the frame left to right across the four lines, carrying a case, with boots left behind on the line.',
      'verse-2': 'A figure sits on the ground line and watches three small boats go past.',
      'chorus-1': 'Paper inverts to pencil. The stage fills — everyone in the song at once, one wearing a crown.',
      'verse-3': 'The ground line becomes a horizon and the figure is drawn smaller each line until it is a dot.',
      'chorus-2': 'Inverted again, but the crown is being passed between figures rather than worn.',
      ohs: 'No lyric band at all. Seventeen figures come onto the line one per oh, and the last one is red.',
      'verse-4': 'One figure, one ground line, no props, no band inversion. The quietest page in the film.',
      'chorus-3': 'The full stage again but drawn at twice the line weight — the pencil has been pressed harder.',
      outro: 'The shared end card. It is the same in all seven films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'Redrawn as props in the hand-drawn vocabulary rather than taken from the motif library — a library path dropped into this style reads as clip art next to the wobble.',
    avoid: [
      'Making the type wobble too. The contrast between clean caption and shaky drawing is the entire style.',
      'Tweening a pose. Poses are replaced, never interpolated.',
      'Letting the stage be decorative. If the figures are not acting the line, use a different style.',
    ],
    effort: 'high',
  },
  {
    id: 'b2-cartography',
    family: 'B',
    name: 'Cartography',
    sheet: '/video-styles/b2-cartography.svg',
    tagline: 'An admiralty chart of the real Earth with the song plotted on it: one red line from a dot in Andalusia, round the world, to a pulsing dot outside Portland.',
    premise:
      'A passage plan for the trip in the song, drawn on the real Earth. Natural Earth\'s coastline on an orthographic globe, a graticule, a neatline, a compass rose — and one red line. It starts as a dot in Andalusia that grows while the first verse wanders the province (Sevilla, Córdoba, Granada, Málaga, Cádiz), flies to Stockholm as the second verse names it, runs round the North Sea in the first chorus, across the world through the third verse, round America in the second chorus, and twice round the whole globe in the oh-ohs. It comes home to Andalusia and breathes there for the fourth verse, then goes west one last time and lands in Vancouver, Washington, as a dot that pulses the way home did. Every line it draws stays drawn, so the globe fills with red. The device that keeps it from going flat is scale: the camera rides the head of the line, a province at one end and the whole world at the other.',
    palette: [
      { name: 'Chart', hex: '#e8dcc0', role: 'Land, and the paper round the globe when it is pulled back.' },
      { name: 'Sea', hex: '#cfd9cf', role: 'Water, and the large lakes.' },
      { name: 'Ink', hex: '#26312e', role: 'Neatline, place names, the lyric.' },
      { name: 'Route', hex: '#b03a2e', role: 'The passage. The only saturated thing on the sheet.' },
      { name: 'Neatline', hex: '#8a7c5c', role: 'Graticule at about 30%, and the shadow ring round the globe.' },
    ],
    type: [
      'The globe version sets every lyric straight. The camera rides the head of the line, so the road is always moving under the frame, and type set along a moving path slides. Verses go in the note panel along the foot of the sheet (taken out once and asked back in); the CHART 2 · 53 stamp in the top left was asked out and stays out; choruses set big across the top and the bottom, clear of the head in the middle. The rules below about setting type on the route are from the flat chart and still hold if a static view ever brings it back.',
      'Jost 600, uppercase, 30–52 along the route with 4–7 tracking. Small: it has to bend without breaking.',
      'A line on the route is broken into two rows and banked either side of it, one above and one below. This is not a refinement, it is the thing that makes the style work: one row of a full lyric line wants about 1500 units and no leg of this passage is that long, so a single row comes out at nineteen point and every line falls off the road onto the fallback. Two rows halve the measure each has to fit — and they put the red line through the middle of its own lyric, which is the truest picture of the idea in the film.',
      'Words are spaced along the path by their own widths, never by the arc length their onset falls at. Spacing by onset is the obvious reading of "the words are the road" and it is unreadable: the song does not sing evenly, so eleven words pile into one bend and the next four have a continent to themselves. The colour carries the timing instead — a word turns from ink to route red on its own measured onset.',
      'Place names 26 at rest, 34 when their line is being sung. Which side of the mark a name hangs on is a per-port decision, not a constant: six ports on one chart, two of them a thumb apart, and one against the left edge.',
      'A port name — and the compass rose with it — stands down to about 40% while the lyric owns the chart. Ports are permanent furniture and the lyric is the event; six names at full weight under a line of type is the one collision this style cannot design its way out of, because both belong on the same chart.',
      'When a line will not bend, set it straight instead — and where it goes depends on why. A chorus owns the frame, so it sets big across the top and the bottom of it. A verse line that came off the road does not, because the chart is still the picture: it goes into a note panel along the foot of the sheet, a plate of chart colour inside the neatline with one hairline rule along its top edge, sized off the type rather than written down. That panel is what got the verse lyric out from underneath the compass rose, and it is where thirteen of this song\'s sixteen verse lines actually land — so it is the verses\' normal treatment, not their failure case.',
      'Three things disqualify a leg, and all three were found by drawing it: it is too short for the line at 30pt or more; it climbs more than about forty degrees, so the type runs up the frame and off the top of it; or the part of it inside the neatline is too short, which is what happens at harbour scale when a leg runs a long way off both edges. Test that last one well inside the frame rather than against it — the type straddles the path and the upper row rides most of a line height above it, so a run that is only just on screen puts half the lyric over the top rule.',
      'A style that places one word at a time cannot size type off an average glyph. The suite\'s fit() uses a flat 0.66 em, which is right for a whole row and wrong for a word: in Jost 700, W is 1.06 em and I is 0.32. Setting "I\'d sit and watch the" on the average left forty units of air after I\'D and ten units of overlap after WATCH, in the same row. The measured per-glyph table is in shared/video/kit.mjs as JOST_ADVANCE — use advance(), and solve the size that fills the room rather than scaling a measurement, because letter-spacing is a flat number of units per glyph and does not shrink with the size.',
      'Lyric colour on the globe: solid ink throughout — the lyric does not change colour as it is sung. The sung/unsung split is still in the film (LYRIC_UNSUNG / LYRIC_SUNG in cartography.mjs), so a second colour is one constant; white with the ink keyline was tried there and set aside. While the two are the same colour the row is drawn once and without the keyline: drawn twice, the sung copy doubled the edges of the unsung one and the words read as going bold as they were sung. Never route red — asked for by the person watching, because red type over a map full of red lines was one more red thing. The keyline goes on both states so the glyphs do not change weight as the voice crosses them. The earlier rule, kept for its reasoning: one direction for the sync, everywhere — ink until a word is sung, route red once it is. The rows used to alternate their fill and accent, so a second row started red and turned ink as the voice crossed it — which looked like a decision and read as the opposite of one, because at the end of the last chorus the words that had just been sung were the dark ones.',
      'Put the colour edge on a word boundary. Taking the fraction of a line\'s words sung and splitting it across the rows by length puts the edge wherever the arithmetic lands: WALK UNTIL MY BOO|TS. Walk the row\'s own glyph widths instead, and sweep the edge across the word being sung in the 180 ms it takes to say it.',
    ],
    layout: [
      'Orthographic globe, camera { lon, lat, R }, where R is the radius in pixels: about 400 for the whole world, 780 for a hemisphere filling the frame, 1400–3000 for a continent or a sea, 10500 for Andalusia. Once the globe is smaller than the frame it sits on the chart paper with a limb rule and a faint shadow ring, like a plate in an atlas.',
      'Graticule at 15°, 5° and 1°, crossfaded by scale, at about 30%. Neatline is a 4-unit rule at 40 units inset with a 1.5-unit rule inside it.',
      'Coastline in ink, 1.6 at world scale up to 3.5 at province scale. Three levels of detail: Natural Earth 110m below R 1150, 50m simplified to 0.07° up to 3800, full 50m above that.',
      'No place is named on the map — asked for, after names faded by scale and recency were tried. Ports are a ring, filled when reached, with a second wider ring when the line lands on them. Towns inside Andalusia are a smaller dot, shown only once R is past about 3500.',
      'The head is a dot that grows from 4 to 13 across the first verse and then holds. In the fourth verse it breathes, on a 2.6 s cycle with a ring opening out from it. The last landfall pulses the same way. A heart was tried there and set aside for the dot.',
    ],
    motion: [
      { driver: 'word', does: 'The head dot swells on each measured word, a 160 ms decay. The line itself no longer steps on words: the camera rides the head, and a stepping head under a smooth camera judders.' },
      { driver: 'line', does: 'Most legs leave on a line\'s measured start. Stockholm lands on the measured onset of the word. In the third verse the four places are spread evenly across the section instead of landing when sung — asked for, because nine seconds for four intercontinental legs is too fast to read.' },
      { driver: 'section', does: 'The scale. Each leg the camera follows has a key on each end, eased with the same curve and on the same great circle as the line, so the head stays in the middle of the frame and the world moves under it. Scale is interpolated in log space, and a long move pulls back through its middle so the distance crossed stays within about a frame and a half.' },
      { driver: 'clock', does: 'A port mark fills at the moment its name is sung, and stays filled for the rest of the film.' },
      { driver: 'audio', does: 'Nothing. A chart is a document.' },
    ],
    sections: {
      intro: 'Andalusia at province scale, pushing in slowly, with the title in a cartouche that fades as the intro ends — no red strike through it, which read as a mistake. The dot appears as the cartouche leaves.',
      'verse-1': 'The red line wanders the province, one leg per sung line: Sevilla, Córdoba, Granada, Málaga, Cádiz and back to Sevilla. The dot grows the whole way.',
      'verse-2': 'The line leaves on the verse\'s first word and lands on "Stockholm", the camera following it with a pull back over the North Sea on the way. Then a slow push in on the archipelago.',
      'chorus-1': 'Stockholm, Copenhagen, Oslo, London, Dublin, one leg per line, followed at sea scale. The land stands down to 70% behind the type; the red line does not.',
      'verse-3': 'Pulled back to a hemisphere. Dublin to San Diego, Bangkok, Budapest and Baton Rouge, spread evenly across the section.',
      'chorus-2': 'America at country scale: Baton Rouge to New York, Phoenix, Mexico City and Toronto — one leg per line. Mexico City was added so the line reaches Toronto just before the oh-ohs instead of sitting there for five seconds.',
      ohs: 'The whole globe. Fifteen cities in two laps eastward — Rio, Cape Town, Cairo, Moscow, Mumbai, Beijing, Sydney, Mexico City, Buenos Aires, Lagos, Dubai, Singapore, Tokyo, Honolulu, Reykjavík — on one eased-out clock, so the globe spins down as it fills with red. The camera turns with the head, averaged over 1.2 s so it does not jerk at every city.',
      'verse-4': 'From Reykjavík home to Andalusia, landing on the second "Andalusia". A few seconds\' pause at province scale with the dot breathing, then the line leaves on the verse\'s next line. From that moment nothing is named: the names already on the map fade and no new one appears.',
      'chorus-3': 'The last trip, unnamed: east round the world about twice, twenty-one legs on one clock eased at both ends, the camera at hemisphere scale taking most of the head\'s latitude. It closes in on Vancouver, Washington over the last 2.6 s and lands two seconds into the last line, as a pulsing dot with no name. The whole trip is shifted two seconds later rather than compressed, to give home a longer pause, so the pull back to the world is what shortens to fit before the end card. Then straight out to the whole world with the dot held dead centre — no spin, which carried it off to one side — over about four seconds, still moving when the end card cuts in. No line after the landing.',
      outro: 'The shared end card, cut in on the guitar harmonic at 2:46.27 — the score\'s measured `endCardAt` — rather than on a section boundary (the globe is still pulling back until then), and it takes over with no pop and no fade — the globe is the last picture and the card replaces it.',
    },
    motifs: 'As chart furniture: a compass rose, a sailboat drawn on the water, a globe when the chart is pulled out. Always in ink or neatline colour, never in route red.',
    avoid: [
      'Handing one camera to another mid-move. After the oh-ohs the spinning globe was blended back into the keyed camera, which had spent the whole tour drifting from Toronto towards Iceland out of sight, and then zoomed world-to-province in three seconds — the join showed twice and read as choppy. The homecoming is now one move from exactly where the spin came to rest: the globe turns to face Andalusia while still pulled back, then falls onto the province over about five seconds, settling two seconds after the line lands.',
      'Cutting a line in on its first word. It was only half faded in as that word was sung, and once the lyric stopped changing colour on each word there was nothing else to carry the timing, so every line read as late. A line cuts in 0.3 s early and is fully up by its first word — never before the previous line has finished, nor before its own section.',
      'Reading `audio.currentTime` raw as the film\'s clock. Browsers step it — Firefox and Safari about every quarter second — so the picture freezes on a moment already past and then jumps: in sync just after an update, late just before the next. Anchor to the last reported value and run on the wall clock between reports (useMusicVideoPlayer does).',
      'Pushing the far side of a land ring out radially onto the limb to keep it closed. A point near the back of the globe has no stable direction, so the rim trace jumps across the disc and the fill inverts — at 1:20 the whole of Asia came out as sea. Clip each ring at the horizon and close it along the limb in the ring\'s own winding.',
      'Leaving every name up at world scale. By the oh-ohs seven names round the North Sea are one smudge of type. At world scale only the places just reached are named; older names fade with the scale.',
      'Absolute coordinates to a tenth of a pixel. The land is most of a frame and a frame is re-parsed sixty times a second: Europe at sea scale was 160 KB a frame. Whole pixels, relative moves, and nothing within two pixels of the last point.',
      'Dimming the whole chart for a chorus once the choruses carry the travel. Stand the land down; keep the route at full pen.',
      'Forcing a long lyric onto a short path. It runs off the frame — either shorten the line or set it straight.',
      'Setting type along the cumulative route rather than along one leg of it. The route is a zigzag across a world map: a line follows every corner of it, runs upside down along the legs that head west, and prints over three ports on the way. One leg is one shallow bow, which is a curve type can be set on.',
      'Scaling a group to zoom the chart. It scales the line weights, the type and the soundings with the geography, which is exactly what a chart does not do — a harbour plan and an ocean chart are drawn with the same pen. Fold the view into the projection and compute every coordinate in screen space.',
      'Following the ship on the flat chart. It was tried at 1.7 and taken out: the passage left the frame and the chart around it was empty. On the globe it works, because the Earth fills the frame at every scale the camera follows at — the condition is a full frame, not a static one.',
      'Pulling in past about 2.5. At 4.2 the finished passage comes through the frame as four unrelated red rules and the harbour underneath them is unreadable.',
      'Joining coastline sample points with straight segments. On a chart that does not read as a coast, it reads as a mountain range or as a bug. Quadratics through the midpoints.',
      'Contours with high radial variation. They stop being depth and become decoration.',
      'Colouring anything except the route. The single red line is the whole idea.',
      'Letting a line change its mind halfway through being sung. Choosing the leg from where the red line is right now means a lyric can start on the road and finish in the note panel, which is worse than either — "I think I\'ll take a chance on Andalusia" did exactly that. Choose from the middle of the line, and judge whether it fits against the view the section is settling to rather than the view it is passing through, or a line that starts inside a 1.4 s move gets re-judged on every frame of it.',
      'Setting a chorus over a chart at full weight. There is no arrangement that lets a place name and a full-frame lyric both be loud in the middle of the same frame: KNOW NO OTHER DREAM went straight through STOCKHOLM on every line of every chorus. Stand the sheet down instead of shuffling the type.',
      'Drawing every leg at the same weight at harbour scale. Four passages converging on one port, inside a frame six hundred units across, are four unrelated red rules. Draw the track already run the way a passage plan does — still there, no longer the subject.',
      'Switching the paper colour at a threshold. Chart buff to sea green in one frame, halfway through a view move, is the only hard cut in a film that otherwise only ever eases. Crossfade it with the zoom.',
    ],
    effort: 'high',
  },
  {
    id: 'b3-academy',
    family: 'B',
    name: 'Academy',
    sheet: '/video-styles/b3-academy.svg',
    tagline: 'A print of the song running through a tired projector. Sprockets, optical track, changeover dots, lyric burned in as subtitles.',
    premise:
      'The film as a physical print. Sprocket holes down both edges, the optical sound track printed as a live waveform down the right, frame counts, changeover dots, an academy countdown for the intro, and dust and scratches that accumulate. The lyric is set as subtitles — burned in, bottom third, 50 units, one or two lines at a time — which makes this the only style in the suite where the words are small on purpose the whole way through, and the only one where the emotional weight is carried by wear rather than by layout. Variety comes from the condition of the print: dust density, scratch depth and gate weave all ride the arrangement, so the quiet fourth verse is a clean print and the last chorus is falling apart.',
    palette: [
      { name: 'Emulsion', hex: '#1a1712', role: 'The frame.' },
      { name: 'Stock', hex: '#cfc6b2', role: 'Sprocket holes and the edge of the film.' },
      { name: 'Silver', hex: '#e7e1d2', role: 'Subtitles, optical track, dust.' },
      { name: 'Amber', hex: '#c08a3e', role: 'The line being sung, frame numbers, changeover dots.' },
    ],
    type: [
      'Jost 500 uppercase at 50 with 2 tracking, centred at y=700 and 762. Subtitles, not titles.',
      'The line being sung is amber, the other is silver. Both stay legible — a subtitle you cannot read is a bug, not a style.',
      'Frame numbers and reel labels at 24–26 in 500, 55–70% opacity, in the corners.',
    ],
    layout: [
      '106-unit darker margins at both edges with 46x58 rounded sprocket holes at 100-unit pitch.',
      'Optical track at x=1440: horizontal bars of varying width, one per 15 units of height, with a centre line.',
      'Dust is 28–90 marks per frame: short vertical scratches and specks at 10–40% silver.',
      'A long scratch is a 2-unit line from top to bottom with a 12-unit lean. Two or three at most, and a scratch once introduced stays for the rest of the film.',
      'Grain at baseFrequency 2.2, five octaves, composited last — this style is the grainiest in the suite by a wide margin.',
    ],
    motion: [
      { driver: 'line', does: 'The subtitle cuts. Subtitles never fade; a burned-in title card is replaced between frames.' },
      { driver: 'word', does: 'The amber advances through the sung line.' },
      { driver: 'audio', does: 'The optical track is the live envelope. This is the one element that must be wired to the analyser or the conceit breaks.' },
      { driver: 'section', does: 'Print condition steps: dust count, scratch count and gate weave amplitude all change at a section boundary and never at a word.' },
      { driver: 'clock', does: 'Frame counter runs. Changeover dots appear in the top right two seconds before each section, the way a real reel change is cued.' },
    ],
    sections: {
      intro: 'Academy leader. The countdown circle wipes 3, 2, 1 and lands on the downbeat — this is the count-in, and it is the best argument for the style.',
      'verse-1': 'Clean print. Motif ghosted in the gate at 35%, subtitles underneath.',
      'verse-2': 'Slight gate weave introduced — the frame drifts two units.',
      'chorus-1': 'The print degrades: heavy scratches, the frame line showing at the top, dust tripled.',
      'verse-3': 'Frame numbers become place names in the corner, as if the reel had been labelled by hand.',
      'chorus-2': 'A splice — two frames of clear stock and a jump in the frame count.',
      ohs: 'Changeover dots. Seventeen of them, top right, one per oh, no subtitles at all.',
      'verse-4': 'The cleanest frame in the film. No dust, no scratches, no weave. The print is new again for twenty seconds.',
      'chorus-3': 'Worst condition in the film. Everything that has ever appeared on this print is on it at once.',
      outro: 'The shared end card. It is the same in all seven films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'Ghosted into the gate at 35–55% in silver or amber, 2.6–3 stroke, centred in the 1388-unit picture area. One per line.',
    avoid: [
      'Making the subtitles hard to read for the sake of the effect. Wear goes everywhere except through the words.',
      'Resetting a scratch. Damage accumulates; a scratch that appears in the first chorus is there in the last.',
      'A clean optical track. If it is not the real envelope, cut the element.',
    ],
    effort: 'medium',
  },
]

/** Family A — alternates of the film that exists. */
export const STYLES_A = VIDEO_STYLES.filter((style) => style.family === 'A')

/** Family B — the ten that are not it. */
export const STYLES_B = VIDEO_STYLES.filter((style) => style.family === 'B')

export const styleById = (id: string): VideoStyle | undefined =>
  VIDEO_STYLES.find((style) => style.id === id)
