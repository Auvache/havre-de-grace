/*
 * The music-video style suite — seven looks drawn for "Andalusia" (families A
 * and B) and five for "Into the Wild" (family C), and for whatever gets made
 * after them.
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

export type StyleFamily = 'A' | 'B' | 'C'

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
  /**
   * The song the sheet and the section table are drawn against. Families A and
   * B were drawn against Andalusia; family C against Into the Wild, whose
   * arrangement has different sections (a break, a horn solo, no oh-ohs).
   */
  song?: 'andalusia' | 'into-the-wild'
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
  /**
   * What each section does. Keys are the section ids of the style's song —
   * andalusiaScore.ts for families A and B, intoTheWildScore.ts for family C.
   */
  sections: Partial<Record<string, string>>
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
  'The frame draws what the line is about. Pick the motif from the song\'s cue list — MOTIF_CUES below for Andalusia, INTO_THE_WILD_CUES in shared/video/cues.mjs for Into the Wild; do not invent one per style.',
  'A section that repeats musically must not repeat visually. The three choruses are the test: if chorus 3 is chorus 1 at a larger size, it has failed.',
  'Type is Jost, already served on the site. Declare family and weight in CSS, not as SVG attributes, or @nuxt/fonts will not see them and the browser will synthesise a bold.',
  'Rows of lyric are fitted to the measure and stretched to it with textLength. No line is laid out by hand.',
  'The oh-ohs section has no words to set. Every style needs an answer for seventeen syllables and no lyric — that is where most of them will fail. Into the Wild\'s equivalent is forty seconds of horns between the second chorus and the third verse, and it asks the same question for longer.',
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
    // Built as a film for Into the Wild (shared/video/films/flipbook.mjs). This sheet and the sections below are still Andalusia's; the Into the Wild storyboard is in the film module's header.
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
      { driver: 'clock', does: 'Where there are no words — the run cycle during a held note, a horn solo — step on the score\'s beat grid. Only allowed on a record measured to be on a click, as Into the Wild is at 120 BPM; on one that drifts, step on onsets or not at all.' },
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
      'Drawing a figure in the same pencil as a busy background with nothing between them. The runner in Into the Wild\'s third chorus vanished into the forest the moment the trees reached him. Draw a knockout under anything that has to read against scenery: the figure\'s own strokes, fat, in the page colour, drawn first — what an animator does with an eraser.',
      'Scrolling scenery smoothly under a boiling drawing. It reads as a camera, and a flipbook has no camera. Step the scroll at the boil rate — fifteen positions a second — so the world moves the way the pencil does.',
      'Filling a trembling outline. A wobbled line is many subpaths, and each fills as a sliver. Anything solid gets its own clean closed shape under the outline.',
      'Running every chorus through the same country. Each chorus is a different landscape past the same runner — pines, then hills and birds, then mountains into a forest that closes in on "wild" — or the three choruses are one chorus three times.',
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
      'Album edition (cartographyAlbumFrame, `edition: \'album\'`): the same film on the album sheet (app/config/albumStyle.ts). The globe is centred on the plate (800, 367) and its radius scaled by 0.74 inside the projection; the neatline is the plate edge; the compass sits in the plate\'s bottom-left; all lyric is in the margin, so the chart never stands down for it. Inks: land #e3d7bc, sea #bfcbbd (the album sea green let down with paper), neatline #8d8068, route album red. The album edition is approved and /music-videos/andalusia runs it; the original edition is kept byte-identical for the still sheet on /music-videos/styles. With no lyric on the chart, the compass stands down for the route instead — to 35% as a port or the head of the line comes within its box, eased by distance so it never steps (the West Coast in the second chorus sat under it at full strength).',
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

  /*
   * FAMILY C — five drawn against "Into the Wild".
   *
   * The second song names more things than the first — ebony, ivory and bone;
   * glaciers, gardens and grottos; a harbor and a crowd — and its chorus is one
   * idea, running out into it. So these are all ways of drawing a world rather
   * than of setting type over one. Section keys are intoTheWildScore.ts's. Four
   * are built (shared/video/films/), and their sheets are frames of the films.
   */
  {
    id: 'c1-field-journal',
    family: 'C',
    song: 'into-the-wild',
    name: 'Field Journal',
    sheet: '/video-styles/c1-field-journal.svg',
    tagline: 'A naturalist\'s notebook, open flat. The line is the entry; what it names is sketched in pencil on the facing page while it is sung, and every find stays in the book.',
    premise:
      'The song as the notebook somebody keeps on the trip it describes — "stumble upon all the splendorous things", "take stories with meaning from the tales that my life\'s taught to me". The frame is a two-page spread on a dark desk, with a gutter shadow down the middle. In a verse the line being sung is the entry, written across the top of the left leaf; the thing it names is sketched on a card taped to the right leaf, drawn on stroke by stroke while the voice sings it, with a watercolour wash blooming behind it and a fig. number and a word under it. Nothing is thrown away: every figure a verse has drawn waits, small and numbered, in a grid under the entry, so the last line of a verse is a page of finds and looks nothing like the first. The page turns at a section boundary, and a chorus is a different kind of page altogether — a sketch map across both leaves, a dotted trail, pines with spots of wash, and somebody running the trail in red pencil. The instrumentals get pages of their own: specimens pressed and taped in for the break, a panorama drawn one thing at a time across forty seconds of horns.',
    palette: [
      { name: 'Desk', hex: '#2a231c', role: 'The four edges of the frame round the book.' },
      { name: 'Page', hex: '#efe6d2', role: 'The leaves, ruled in a faint blue grid (verses 1 and 3) or feint lines (verse 2), blank for the maps.' },
      { name: 'Graphite', hex: '#3b3a36', role: 'Every sketch, the entry, the runner. Unsung words are the same pencil at 30%.' },
      { name: 'Sepia', hex: '#6b4f36', role: 'Fig. labels, pressed specimens, footprints.' },
      { name: 'Sea', hex: '#8fb3c4', role: 'Wash: harbor, water, glacier, moon, globe; the river in chorus 2.' },
      { name: 'Sage', hex: '#9fb59a', role: 'Wash: pines, sprig, flower, grotto, stone — and every chorus\'s wild.' },
      { name: 'Ochre', hex: '#d9b46a', role: 'Wash: crowd, stage, sun, gem, crown, compass, bone and the made things.' },
      { name: 'Red pencil', hex: '#b8432f', role: 'The trail already run, the ring round a drawing sung twice, the roar. Never type.' },
    ],
    type: [
      'Jost 500, sentence case — it is somebody\'s entry, not a headline. Left leaf at x=92, 650 measure, up to 92 units; the chorus across both leaves on a 1360 measure, centred, up to 124.',
      'Sentence case needs its own widths: the kit\'s JOST_ADVANCE is caps, and a lower-case row sized off it comes out a fifth too small. The film carries a lower-case table and sets each row to its width with textLength.',
      'A verse line breaks at its commas, then in half — and into three rows, by length, if two would come out under 66. "Oh, I want to take stories with meaning" in two rows was fifty-odd units: legible up close, not across a room.',
      'The voice is the pencil pressing harder. The row is drawn at 30% and again at full strength clipped to the words sung, the edge landing on word boundaries and sweeping each word in the time it takes to say it.',
      'Fig. numbers count through the whole song — fig. 1 is "adventure", fig. 24 the crowd — so a number is a place in the book, not a count. A chorus draws no figures.',
    ],
    layout: [
      'Book 24–1576 by 22–878 on the desk, 6 corner radius, three page-stack rules at each outer edge, a 160-unit gutter gradient centred on 800.',
      'Verse: entry top-left; specimen grid below it, 4 columns at 168 from x=154, rows at 478 and 684, each figure 132 with its own wash and "fig. N" under it — the eight most recent finds of that verse. Card 610 by 700 centred at (1188, 452), taped at both top corners, tilted a degree or so differently per line.',
      'One figure on the card at 430; two at 340 and 210, the second low right; three at 230 in a triangle. Label under each, centred, in sepia.',
      'Chorus: the map fills both leaves below y≈250 and is clipped to them — the trail, the river and the runner used to run out over the desk. Three pencil ridgelines from 400, thirteen pines off the trail, the trail a dotted graphite line with the run part redrawn in red pencil, footprints either side of it.',
    ],
    motion: [
      { driver: 'word', does: 'The sketch goes down a stroke at a time, one step per measured word and per click eighth, each step eased over 90 ms. The strokes of a motif draw in turn — given one shared progress every element draws at once and a crowd of twelve strokes comes up as twelve fragments.' },
      { driver: 'word', does: 'The entry\'s heavy pencil advances word by word. In "the roar of a crowd", red noise marks burst off the drawing on each word from "roar", each further out than the last.' },
      { driver: 'line', does: 'A new card and a new sketch at the line\'s cut-in; the last line\'s figure is already in the grid. A line that names the drawing the line before made ("lose my way", "sleeping alone") gets that drawing back, circled in red pencil, "fig. N, again".' },
      { driver: 'section', does: 'The page turns — a hard cut to a new spread, a new ruling, a new wash. Verses are entries, choruses are maps, the break is pressed specimens, the horns a panorama.' },
      { driver: 'clock', does: 'The runner advances one stride per eighth of the click (120 BPM, 0.03 + 0.25k) and changes pose on the same tick — six poses from shared/video/figure.mjs, replaced, never tweened. The grid is measured in this song, so the run is on it.' },
      { driver: 'audio', does: 'Nothing. A notebook does not know what the band is doing.' },
    ],
    sections: {
      intro: 'A title spread: a sprig pressed and taped into the left leaf; "Into the Wild" and the band name on the right, and a compass drawing itself on underneath from 6.5 s. The band name goes with the page.',
      'verse-1': 'Grid paper, ochre and sea washes. Compass, gem, sun, wave, globe, bone, stone, moon — eight finds, with "lose my way" and "sleeping alone" circled rather than drawn twice.',
      'chorus-1': 'The first map: a small sun, pines in ochre, the runner starting low on the left and gone off the right in about seven seconds; "the wild" is a big pine drawn on its word.',
      break: 'Pressed specimens: a flower on the left leaf, a sprig on the right, drawn on in turn and taped down once they are.',
      'verse-2': 'Feint-ruled paper — the entries get more like writing: hourglass, key, clock, book, door, guitar. Long lines take three rows.',
      'chorus-2': 'The map again with a river through it in sea wash; the trail crosses it.',
      solo: 'Forty seconds with no lyric: a panorama drawn one element at a time across the spread — mountain, glacier, pines, birds, sun — each in a slice of the solo, washes blooming as they finish.',
      'verse-3': 'Grid paper again, and the richest page of the film: treasures and a crossed crown, then "glaciers and gardens and grottos" as three sketches landing on their own words, sage, harbor, and the crowd with its red roar and a microphone.',
      'chorus-3': 'The map with a range drawn in: mountains and a glacier behind the trail, more pines, the runner off the top-right corner of the page by 190.5.',
      outro: 'The shared end card. It is the same in all films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'Every verse line, from INTO_THE_WILD_CUES (shared/video/cues.mjs), sketched in graphite with a second lighter pass a hair off the first, drawn on via pathLength (no DOM measurement) and washed behind in the noun\'s colour. The runner is the shared rig, not the runner motif.',
    avoid: [
      'Drawing every stroke of a motif on one shared progress. Each element with pathLength="1" draws at once and a many-stroke drawing (the crowd) reads as scattered dashes. Stroke after stroke.',
      'A second compass for "lose my way". Consecutive repeats of a drawing are one figure; the second line gets the first one back with a red ring round it.',
      'Letting the map out of the book. A trail generated edge to edge runs onto the desk; clip the map to the leaves.',
      'Things above the ridgelines in a chorus — the lyric owns the top 250 units across both leaves. A sun at y=300 by the "wild" pine was also in the runner\'s way; it now sits left, low and small.',
      'Sizing sentence case off the caps table. The row comes out small and textLength then blows the spaces open.',
      'Blur on every wash. The big card wash is blurred; the grid thumbnails and the dozen map pines get flat low-opacity blobs, which is what keeps a frame near 0.05 ms and under 20 KB.',
    ],
    effort: 'medium',
  },
  {
    id: 'c2-contour',
    family: 'C',
    song: 'into-the-wild',
    name: 'Contour',
    sheet: '/video-styles/c2-contour.svg',
    tagline: 'A topographic survey sheet. Every noun the song sings becomes a landform in contour lines, and the lyric is the quadrangle\'s name along the foot.',
    premise:
      'A quadrangle, the way a national survey prints one: generative terrain drawn as contour lines, heavier index contours carrying their elevations along them, water as a blue tint with its shoreline and depth lines, woodland as a pale green tint, a neatline with its ticks, and one red dashed trail. The map collar — a paper band along the foot — carries the lyric the way a quad carries its own name. The device is that the song\'s nouns are ground: the hush of a harbor is a drowned bay with soundings, the roar of a crowd is a range whose contours pile up word by word until the benchmark on its summit reads 2720, glaciers and gardens and grottos are cirques, terraces and a hachured depression on one sheet, and the wild is a massif the trail runs up into. A verse is a new sheet per line; a chorus is one sheet, and the red line is the only thing on it that moves continuously. Nothing in the frame is instrumentation — the numbers are elevations and depths, which is what numbers on a survey are.',
    palette: [
      { name: 'Paper', hex: '#f2eee3', role: 'The sheet and the collar.' },
      { name: 'Contour', hex: '#a0714a', role: 'Intermediate contours at 1.5, and the lyric before it is sung.' },
      { name: 'Index', hex: '#6b4426', role: 'Every fifth contour at 2.6, its elevation labels, and the feature names.' },
      { name: 'Water', hex: '#cfe0e6', role: 'Water tint; the shoreline and depth lines are #4f86a3.' },
      { name: 'Wood', hex: '#dfe6cf', role: 'Woodland tint, and the ground in the collar\'s cross-section.' },
      { name: 'Trail', hex: '#c8412d', role: 'The trail, its head, and the light on the harbor headland. The only saturated ink.' },
      { name: 'Ink', hex: '#23211e', role: 'Neatline, spot heights, benchmarks, and the lyric once sung.' },
    ],
    type: [
      'The lyric is Jost 700 caps with 6 units of tracking, sized to a 1440 measure with sizeToMeasure and stretched to it — one row up to 104 if it fits at 70 or more, otherwise two rows capped at 76. Centred in the collar (y 712–900).',
      'Brown until sung, ink once sung — the colours of an unfinished survey and a finished one. The row is drawn twice and the ink copy clipped by throughRow, so the edge lands on word boundaries.',
      'Elevation labels are Jost 500 at 17 in index brown, set along the longest runs of index contours and rotated to read uphill-right (never upside down), with a 6-unit paper stroke under them via paint-order so the contour breaks round the number.',
      'Feature names (Glaciers, Gardens, Grottos) are the sung word in Jost 500 italic at 26 with 3 tracking — survey lettering, not labels. Spot heights and the benchmark are Jost 500/600 at 20–26 in ink.',
      'The title is the quad\'s name: the song title in the collar at up to 118 with 14 tracking, the band name tracked small in trail red above it. Both leave by 15.5 s.',
    ],
    layout: [
      'Neatline at 30 units inset, running to y=700; ticks every 200 units outside it. The collar is y 712–900 with one hairline rule on its top edge.',
      'North arrow top right inside the neatline, at 35% while a lyric is up. There is no scale bar — it was tried in the lower right and every summit that landed near it collided with it.',
      'Terrain is generated in 800-unit tiles on a 16-unit marching-squares grid and cached per (scene, tile, step). A pan is one translate over the tiles in view; tile paths are already in field coordinates.',
      'The chorus sheet is wider than the frame (2600–3000 units) and the view follows the trail head, holding it about 980 units in from the left, so the frame stays full of ground at every moment of the pan.',
      'The two sections with no words (break, horns) print a cross-section in the collar: the ground along a dashed line A—A′ at y=320, filled wood-green, exaggerated to its own relief.',
    ],
    motion: [
      { driver: 'word', does: 'A step. In most lines one more band of contours goes down per word, counted up from the sea, with a 90 ms fade on the newest. In the roar the range itself rises one cached step per word (amplitude 0.16 → 1). In the hush the sea comes in 8 ft per word and three more soundings appear.' },
      { driver: 'word', does: 'The cue word lands a symbol: the light on the harbor headland, a spot height on the summit, the benchmark on the crowd\'s range, or the feature name for glaciers, gardens and grottos.' },
      { driver: 'line', does: 'In a verse, the sheet is replaced on the line\'s cut-in (0.3 s before its first word): a new terrain from the line\'s own seed, chosen by its cue.' },
      { driver: 'section', does: 'A chorus is one sheet. The trail runs 34% of its length across the first line and the rest across the second, and the view pans with its head.' },
      { driver: 'clock', does: 'The trail and the pans in the break and the horns are continuous. The intro inks one contour per beat of the measured 120 BPM grid, from 1.53 s.' },
      { driver: 'audio', does: 'Nothing. A survey is a document.' },
    ],
    sections: {
      intro: 'The quad is named in the collar — song title, band name above it — while the sheet inks its contours in one per beat from the sea up. Both names are gone by 15.5 s.',
      'verse-1': 'A new sheet per line, chosen by the line\'s cue: rolling hills for the adventure, a small hachured depression under "bone", a spot height on "sun" and "moon".',
      'chorus-1': 'The massif. A red dashed trail leaves a lake in the south-west and runs up the valley on "So I\'m running", the view following it east on "Oh, I\'m running". A spot height on the highest summit in view.',
      break: 'Open slopes, panning slowly east, with the section A—A′ dashed across the map and printed in the collar. No words.',
      'verse-2': 'Terraces for the stories, a depression for "revealing", hills for the rest — every line a different sheet.',
      'chorus-2': 'The massif mirrored north-south, a different seed: the same idea, not the same map.',
      solo: 'The horns: a long ridge, 4000 units, panned across the whole forty seconds with its cross-section printed in the collar.',
      'verse-3': 'The most drawn verse. Glaciers, gardens and grottos is one sheet with three landforms lettered as each is sung (the glacier gets an ice tint with a dashed blue edge); open slopes and scrub for the sage; the drowned bay for the harbor, with its light on the headland; the rising range for the crowd.',
      'chorus-3': 'The biggest massif, 25% taller, 3000 units wide. The trail runs out of the roar and up into it, and the sheet pans along it for the long "running".',
      outro: 'The shared end card. It is the same in every film and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'None from the motif library — the cue list in shared/video/cues.mjs is read, and each cue picks a landform recipe instead (lighthouse → drowned bay, crowd/microphone → rising range, pine/runner → massif, glacier → the composite sheet, flower → terraces, cave → depression, sprig → open slopes). A line drawing of a lighthouse on a contour map would be clip art; a headland with a light symbol is the same idea said in the map\'s own language.',
    avoid: [
      'Marching squares per frame. It is fine once; sixty times a second it is the whole budget. Cache every contour set, and let the terrain change only in steps on words — each step is one more cache entry, drawn once.',
      'Translating a tile by its own offset. Tile paths are generated in field coordinates, so the view is one translate for every tile; offsetting each tile by k×800 as well put every second tile off screen, and half of every frame was empty paper.',
      'Filling water or woodland tile by tile to the tile edge. Two fills that meet exactly on a line leave a hairline of paper between them. Generate each fill a cell past the tile on both sides so neighbours overlap underneath.',
      'Terracing with a sawtooth. A staircase with a kink in it comes out of marching squares as noise — the first garden terraces read as letters. Use a smooth staircase (u − 0.85·sin 2πu / 2π).',
      'Treating any line with two cues as the three-landform sheet. "The roar of a crowd center stage" names a crowd and a stage, and was drawn as glaciers and gardens. Only the glaciers line gets the composite.',
      'A pale ice tint under bunched contours. On a ridge the contours are dense enough that a near-paper blue reads as streaks. Use a stronger tint and give it a dashed blue edge, the way a survey marks a glacier.',
      'A scale bar in the lower right. Summits land there. The sheet has a north arrow and ticks, and that is enough furniture.',
      'Measuring the cross-section from sea level. Open slopes three hundred feet high print as a flat line; exaggerate each section to its own relief.',
      'Contours denser than about one every 12 units at 1600 wide. Past that the range is a brown smudge and the frame passes 40 KB. Interval 50 on the range and 80 on the massif, Douglas–Peucker at 1.5 units, and drop chains under 48 units.',
    ],
    effort: 'medium',
  },
  {
    id: 'c3-specimen-cabinet',
    family: 'C',
    song: 'into-the-wild',
    name: 'Specimen Cabinet',
    sheet: '/video-styles/c3-specimen-cabinet.svg',
    tagline: 'A walnut specimen drawer that fills as the song names things — every noun a specimen on its own card, lit when it is sung.',
    premise:
      'Into the Wild is a list of found things — ebony, ivory and bone; the Earth out of water and iron; glaciers, gardens and grottos; treasures that are not silver or gold — and a museum drawer is how a list of found things is shown. A walnut specimen drawer divided into twelve card-bottomed compartments. Each noun the song sings is drawn in ink on its own card with a brass label holder under it, and the drawer fills as the verse goes on: nothing is ever taken out, so by the end of a verse the drawer is the verse. The lyric is the drawer\'s placard along the foot. The one moving idea is light — the compartment being sung is lit and its label stamped red, so the eye walks the drawer in the order the song names things. What keeps it from being a grid for three and a half minutes is that the choruses break the cabinet: running into the wild is the specimens getting out, the dividers down and the back of the drawer open onto pines.',
    palette: [
      { name: 'Walnut', hex: '#2e2119', role: 'The drawer, the dividers, the ground between cards.' },
      { name: 'Card', hex: '#ece3cf', role: 'Compartment floors, the placard, the label cards.' },
      { name: 'Ink', hex: '#27231e', role: 'Specimens and the unsung placard.' },
      { name: 'Brass', hex: '#b3903f', role: 'Label holders, placard screws, the title plate.' },
      { name: 'Stamp', hex: '#b23a2a', role: 'The sung part of the placard, the lit label, anything crossed out.' },
    ],
    type: [
      'Placard: Jost 700 caps at up to 92, one row, sized to 1320 and set at natural width. The sung part is stamp red, the rest ink, the edge on a word boundary.',
      'Labels: Jost 600 caps at 17 with 3 tracking, in the brass holders. A label names the thing, not the lyric — WATER, IRON, BONE — and is written by the cue list, not by hand.',
      'The title is engraved on a brass plate over the empty drawer, the only centred type in the film. The band name is under it and leaves with it.',
    ],
    layout: [
      'Six columns by two rows of compartments, 230 by 285 with 20-unit walnut dividers, from x=60 y=50. A specimen that matters most in a line may take two cells.',
      'Placard 1480 by 182 at y=668, card with a hairline inner rule and four brass screws.',
      'Specimens are motif-library drawings at 150 units, 2.6 stroke, centred 118 below the cell top. Dimmed to 35% once their verse has moved on.',
    ],
    motion: [
      { driver: 'word', does: 'A specimen lands in the next free compartment on the measured onset of its noun; the light moves to it and its label goes red.' },
      { driver: 'word', does: 'The placard\'s red advances along the line, on word boundaries.' },
      { driver: 'line', does: 'The placard is replaced. The drawer is not — it keeps everything the verse has named.' },
      { driver: 'section', does: 'A verse starts on an empty drawer. A chorus takes the dividers out and opens the back of the drawer onto pines, with the runner in stamp red.' },
      { driver: 'audio', does: 'Nothing. It is a museum.' },
    ],
    sections: {
      intro: 'The empty drawer and its brass nameplate — Into the Wild, Havre De Grace. The plate lifts off before the first verse.',
      'verse-1': 'Adventure, the lost way, splendour, the gods, water, iron, ebony, ivory, bone — the drawer fills to nine. Stone-cold and sleeping close it: the light goes out cell by cell.',
      'chorus-1': 'The dividers are down; the back of the drawer is open onto pines and the runner is out.',
      break: 'The drawer again, closed: the verse-1 specimens under glass, no light and no placard.',
      'verse-2': 'Harder things to keep in a drawer: an hourglass, a key, a clock, a book, a guitar. The cards that do not fit are left empty with only a label.',
      'chorus-2': 'As chorus 1, but further in — the pines nearer and larger.',
      solo: 'No placard. The drawer becomes an instrument case lined in red, the horn and the microphone in brass.',
      'verse-3': 'Treasures that are not silver or gold: the crown is drawn and crossed out in stamp red. Glaciers, gardens and grottos land in three cards on their own three words; sage, harbor, crowd and stage fill the second row.',
      'chorus-3': 'The whole cabinet gone. Pines to the edge of the frame; the runner crosses it.',
      outro: 'The shared end card. It is the same in every film and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'From the motif library via INTO_THE_WILD_CUES in shared/video/cues.mjs, one per cell, drawn in ink. This is the one style where every drawing on screen at once is a different noun, so the cue list is the whole storyboard.',
    avoid: [
      'Lighting more than one compartment. The light is the voice; two lights is two voices.',
      'Taking a specimen out. The drawer only fills — that is what makes a verse read as a collection instead of a slideshow.',
      'A second row of placard. It is a museum label, not a subtitle track; a line that will not fit one row at 60 or more is a line to shorten on the placard, not to wrap.',
    ],
    effort: 'medium',
  },
  {
    id: 'c4-woodcut',
    family: 'C',
    song: 'into-the-wild',
    name: 'Woodcut',
    sheet: '/video-styles/c4-woodcut.svg',
    tagline: 'A two-block relief print. Every measured word takes another cut out of the block, so each line is finished as it is sung.',
    premise:
      'The song as a folk relief print — mythic, the way the first verse is ("the gods hid about when they made the Earth out of water and iron"). A black key block and one colour block, vermilion, on off-white paper, with a muted slate used sparingly for water, ice and a night range. Nothing is drawn: everything is what the knife left. The frame is two blocks with paper round them — a picture block with a rough edge, and under it a lyric block whose letters are cut out of the black. The idea that drives every moving thing is carving. A line arrives as an uncut block, its big shapes only, and each measured word takes another cut out of it — a ray of light, a row of waves, a tree — stepped on the word, never faded or slid, so the block is finished when the line has been sung. The lyric carves the same way: every letter is drawn faintly on the block and cut through to full paper as it is sung. Variety comes from the block itself changing with the noun: a night harbour with almost nothing cut, a crowd lit by rays gouged two to a word, a triptych cut on three words, a sunburst emblem for the abstract nouns, and three different choruses.',
    palette: [
      { name: 'Paper', hex: '#ebe2cc', role: 'The stock, and every cut. Never white.' },
      { name: 'Ink', hex: '#15130f', role: 'The key block: the ground of most scenes, and the lyric block.' },
      { name: 'Vermilion', hex: '#c23b22', role: 'The colour block — sun, moon, the spotlight pool, the flood in the last chorus. Printed a few units out of register.' },
      { name: 'Slate', hex: '#56666a', role: 'The muted third ink: water, ice, the night range. Never type, never the sun.' },
    ],
    type: [
      'Jost 700 caps with 3 units of tracking, reversed out of the lyric block (x 70–1530, y 668–846). Sized to a 1330 measure with sizeToMeasure, then stretched to its own advance width with textLength — never wider than it was set.',
      'One row caps at 104, two rows at 66, both rows at the smaller of their two fitted sizes so a two-row line is one block of type, not two.',
      'Unsung letters are paper at 30%: drawn on the block, not yet cut. Sung letters are full paper, the edge landing on word boundaries (throughRow). Legibility first — 30% was the lowest that still read as the whole line.',
      'The title is the only other type: the song name cut letter by letter over the first six bars, the band name small in vermilion above it until 13.5 s, then gone.',
    ],
    layout: [
      'Picture block x 70–1530, y 56–640; lyric block y 668–846. Both edges are jittered polygons, fixed per film, so the blocks read as cut wood rather than rectangles.',
      'The colour block is drawn translated a few units from the key — a different offset per section (a new pull), never inside one.',
      'Paper specks at 40% over every block: ink never lies flat on a real print. One cached path, about 5 KB.',
      'Nothing uses an SVG filter. Rough edges are in the geometry (seeded jitter), gouges are lenses (two quadratics), rays are wedges. It keeps a frame at about 20 KB and costs nothing to repaint.',
    ],
    motion: [
      { driver: 'word', does: 'One step of carving per measured word: the scene\'s cuts are shared out across the line\'s onsets and each lands with a 90 ms ease. Cuts that belong to a word (the three panels, the buried bone, the tree on "wild") land on that word\'s onset.' },
      { driver: 'word', does: 'The lyric cuts through letter by letter as the voice crosses it.' },
      { driver: 'line', does: 'A new block. Hard cut on the line\'s cut-in (0.3 s before its first word); scene chosen by the line\'s cue.' },
      { driver: 'section', does: 'The colour block\'s register moves. And in the choruses the scene is the section\'s, not the line\'s: one block carved across both lines and the held note, with a cut per bar once the words stop.' },
      { driver: 'clock', does: 'The runner steps one pose per eighth on the measured 120 BPM grid (0.03 + 0.25k) and moves 16 units a step — replaced, never tweened. In the instrumentals a ray is cut per bar.' },
      { driver: 'audio', does: 'Nothing. A print does not know the music is playing.' },
    ],
    sections: {
      intro: 'A vermilion sun behind a range, the rays cut behind the mountains every bar and a half. The title cut out of the lower block letter by letter, the band name small above it until 13.5 s.',
      'verse-1': 'One block per line, by cue: a compass emblem for the adventure, a gem, the sunrise again for the gods, the ground in section for "Ebony, ivory, and bone" (a log, a tusk, the bone — each cut on its word), a moon over sleeping hills with a cairn.',
      'chorus-1': 'Paper dawn: a half sun on the horizon, vermilion rays, black range, the runner on a paper mist band between the mountains and the ridge.',
      break: 'The sun set on the sea, a sail, a ray per bar. The lower block counts the bars in carved diamonds.',
      'verse-2': 'Mostly emblems — hourglass, key, clock, book, door, guitar — each in its own sunburst (the ray count and angle change by line, so two lines naming the same thing are still two blocks).',
      'chorus-2': 'Night run: ink sky with cut stars, vermilion moon, slate range. The same runner and ridge as chorus 1 and 3; everything above them different.',
      solo: 'The horns: a great sun on the sea, twenty rays cut one per bar from both flanks inwards; the diamonds count along underneath.',
      'verse-3': 'Emblems for the treasures (the crown struck through with a vermilion X for "silver or gold"), then the triptych — glaciers, gardens, grottos, one panel cut on each word — the harbor at night with almost nothing cut, and the crowd, whose rays go in two to a word and whose arms go up in waves.',
      'chorus-3': 'The flood: the colour block over the whole sky, a paper sun cut out of it, rays cut from both flanks, the big pine cut on "wild", trees interleaved with rays so every word takes something out of every part of the block.',
      outro: 'The shared end card. It is the same in all seven films and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'Library motifs are cut as thick paper strokes (weight 6–8 in the 100 box) on the key block — in emblems, in the triptych panels, for the bone and the cairn. The scenes that matter most (harbor, crowd, the runs) are built from the knife\'s own vocabulary instead: lenses, wedges, scallops, rough polygons.',
    avoid: [
      'Stepping. This study carves, cuts and poses in steps, and the person watching liked everything about it except that: "great except for the smoothness". The album version is shared/video/films/relief.mjs — the same block as one continuous panorama the camera travels, carving that sweeps open, a blended run cycle. Build on that one.',
      'Two paper discs in one sky: a stage halo and the moon read as two suns. The moon sets while "hollow" rings, before the stage arrives.',
      'Spotlights on in daylight — they go out as the singer leaves the stage — and rays that stop short of the plate edge, which leave a hard edge in the sky.',
      'Drawing the rays over the range. A black range on a black sky vanished and the sun read as a torn red scrap; cut the rays behind it (`under` cuts) and give every ridge a thin paper rim.',
      'Carving rays in angle order. Half a line in, the sun was lopsided — all its rays on one side. Cut from both flanks inwards.',
      'Carving one kind of thing at a time. With all the rays first, the chorus\'s trees arrived after the window had closed; interleave rays, flanks and trees so every word touches every part of the block.',
      'Putting the colour block under something the key covers. The strata sun sat under the paper sky strip and never printed; if the key covers it, draw it in the key.',
      'Letting the runner cross a tree. Black on black, the figure disappears; the big pine lives at the far left, behind where the run starts.',
      'Fading anything. Cuts step on words with a 90 ms ease; lines hard-cut. A dissolve reads as video, not as a print.',
      'An SVG displacement filter for rough edges. It would be the most expensive thing in the frame for an effect seeded geometry gives for free.',
    ],
    effort: 'medium',
  },
  {
    id: 'c5-trailhead',
    family: 'C',
    song: 'into-the-wild',
    name: 'Trailhead',
    sheet: '/video-styles/c5-trailhead.svg',
    tagline: 'A national-park screenprint poster per line: flat spot colour in silhouette layers, the lyric as the headline, the print pulled one ink per sung word.',
    premise:
      'Every line of the song is a WPA park poster. Flat spot colour, no outlines, the picture built from silhouette layers stacked back to front — sky with its screenprint stripe-gradient, a sun or a moon on a disc, a far range, mid hills with a tree line, a near ridge — inside a cream border, with the lyric set as the headline in the banner underneath. The headline is always there and always the first thing legible; the picture is what gets made while it is sung. A line cuts in on its first ink, and every measured word lays one more down, stepped with a 90 ms ease and a few pixels of registration that settle as it lands, so by the last word the poster is finished and holds until the next line cuts it. Between the pulls, parallax: every layer drifts at its own depth off the clock, slowly in a verse and at a run in a chorus. The noun of the line picks the picture (harbor, crowd, glacier, garden, grotto, sage, the sun, the ocean, the range and the pines), and a line that names three nouns becomes a triptych. The one figure in the film is a runner, stepped through the six-pose cycle in shared/video/figure.mjs one pose per eighth note on the record\'s measured 120 BPM click.',
    palette: [
      { name: 'Cream', hex: '#efe2c4', role: 'The paper: border, banner, and any sky that is left unprinted. Also the snow caps, as paper-coloured ink.' },
      { name: 'Pine', hex: '#1e3a33', role: 'Near ridges and trees, and the headline before it is sung.' },
      { name: 'Sage', hex: '#7d9a78', role: 'Far ranges, headlands, the sage.' },
      { name: 'Lake', hex: '#3f6f80', role: 'Water, mid ranges, the midday sky.' },
      { name: 'Ochre', hex: '#e0a13a', role: 'Sky stripes, suns, the lighthouse lamp and beam.' },
      { name: 'Rust', hex: '#b8492f', role: 'The sung headline, the stage ground, the rising sun.' },
      { name: 'Night', hex: '#1b2433', role: 'Night skies, the harbor, the runner and the performer.' },
    ],
    type: [
      'Jost 700 caps, tracked (9 per glyph on one row, 6 on two), centred in the banner. Sized to a 1380 measure with sizeToMeasure — solved, not scaled, because tracking is a flat number of units per glyph — capped at 124 on one row and 92 on two, then textLength-stretched only to its own natural width.',
      'Any line over four words breaks into two rows, at its comma if it has one. Six words on one row came out at 65 next to two-row lines at 90, and the chorus — the title — was the smallest line in the film.',
      'Pine until sung, Rust once sung, the edge on a word boundary (throughRow). The headline is drawn once and a clipped Rust copy laid over it, clip ids namespaced with the uid.',
      'The band name appears once, small and tracked, over the intro poster from 2.03 to 13.03, and the title is the intro poster\'s headline. Nothing else is named.',
    ],
    layout: [
      'Cream border 34 all round. Picture 34–668; banner 668–866 holds the headline. In the instrumentals (break, horns, outro) the picture takes the whole sheet inside the border.',
      'The picture is clipped to its own rectangle — layers are drawn generously and a crowd or a tree row otherwise prints over the border and the banner.',
      'Ridges are sums of sines with whole periods across 3200 units, so they scroll forever without a seam. Mountains use the alpine form: the maximum of several 1 − |sin| cusps, which is separate peaks; a sum of them is a plateau.',
      'Horizon at about 0.62–0.74 of the picture. Trees stand on the ridge they belong to and scroll with it.',
      'A triptych is three panels with 14-unit cream gutters, each a whole scene drawn into its own rectangle. Every scene therefore places things as fractions of its picture, never at absolute x — the grotto arch and the disc landed off-panel until they did.',
    ],
    motion: [
      { driver: 'line', does: 'Hard cut to a new poster on the line\'s cut-in (0.3 s early, never before the previous line ends or its section starts). The first ink — the ground, with its sky stripes — goes down on the cut.' },
      { driver: 'word', does: 'One more ink lands per measured word, 90 ms ease with a 5–7 px registration settle. Inks without an assigned word are spread so the last lands on the last word; an ink can name its own word (the runner lands on "running").' },
      { driver: 'clock', does: 'Parallax: depth × the integral of a per-section speed (16 px/s in a verse, 150 in a chorus), so it is continuous inside a poster. The lighthouse beam turns, the moon\'s reflection shimmers, the sun rises across the final chorus\'s first line.' },
      { driver: 'clock', does: 'The runner steps one pose per eighth note, 0.03 + 0.25k — the record is on a click, so this is the measured grid. Never tweened.' },
      { driver: 'section', does: 'Instrumentals are full-bleed posters with no headline, a new one every four bars from the section\'s first beat, inks pulled every beat. A section\'s last poster runs long rather than starting one it has no time to print.' },
      { driver: 'audio', does: 'Nothing. A print does not know what the music is doing.' },
    ],
    sections: {
      intro: 'The title poster: dawn range, a pine emblem on the sun, "Into the Wild" as the headline. Inks pulled every three beats from 1.03; the band name over it 2.03–13.03.',
      'verse-1': 'A poster per line from the noun: the compass trail (twice, in alternating palettes), a grotto, a sunburst for the gods, the ocean for "water and iron", a desert with a bone, two night posters for the sleeping.',
      'chorus-1': 'Midday: lake sky, a paper sun, the range and the pines with a rust runner on the ridge; then "Oh, I\'m running" in close, the runner in silhouette against the sun.',
      break: 'Full bleed, no headline: a glacier poster pulled on the beat.',
      'verse-2': 'The abstract verse — conjecture, goals, pressure, stories — as landscapes with the line\'s drawing as an emblem on the disc, the way a park poster carries a symbol.',
      'chorus-2': 'Sunset: ochre sky, rust band, a cream sun going down, the ranges going to night.',
      solo: 'Five full-bleed posters, one per four bars: sage hills in the wind, a night range, the ocean, a glacier, the desert.',
      'verse-3': 'The treasures: a gold sunburst with a crown for "silver or gold", then the triptych — glacier, garden, grotto, each panel printed on its own word — the sage hills, the harbor at dusk with its lighthouse, and the crowd at centre stage drawn as the poster\'s hill layers.',
      'chorus-3': 'Sunrise, the last and biggest: the sun comes up out of the range as the line is sung, the runner on the ridge, then in close against the sun with the tree line going past at a run.',
      outro: 'The shared end card. It is the same in every film and a style does not get its own: the splash-screen lockup centred on pure black, landing on the last note and held three seconds, then a hard cut to the credits on the same black. A style\'s own work ends when its last lyric clears.',
    },
    motifs: 'Mostly redrawn as landscape — a lighthouse, a crowd, a glacier are scenes, not icons. Where a line names something that is not a place (compass, key, book, crown, bone, pine) the library drawing sits on the sun disc as a heavy-stroked emblem, which is how a park poster carries a symbol. Never floating free in the picture.',
    avoid: [
      'Cutting in on bare paper. A cream sky is the paper colour, so a poster whose first ink is only its sky reads as a dropped frame for the 0.2 s before the first word — print the sky stripes with the ground.',
      'Driving a slow rotation off the song clock. The sunburst turned 0.01 rad a second from zero and was ninety degrees off the horizon by 2:45; anything that turns inside a poster turns from that poster\'s cut-in.',
      'Letting the foreground cross the subject. A tree line in front of the runner hid him completely; one slim trunk every few seconds is depth, a wall of them is a curtain.',
      'Dropping to an instrumental poster in the gap between a section starting and its first line cutting in — verse 3 starts 0.18 s before its first line and flashed a new, empty poster. Hold the picture the section came out of.',
      'A new four-bar poster at the very end of a section. The horns end 0.37 s into a fresh four bars; that poster would be one ink on blank paper.',
      'A runner the same colour as the sun behind him. The silhouette is Night whatever the palette.',
      'Seeding the scene choice with index × 5 when the palette table has five entries — every verse-2 poster came out at night.',
    ],
    effort: 'medium',
  },
]

/** Family A — alternates of the film that exists. */
export const STYLES_A = VIDEO_STYLES.filter((style) => style.family === 'A')

/** Family B — the ten that are not it. */
export const STYLES_B = VIDEO_STYLES.filter((style) => style.family === 'B')

/** Family C — drawn against Into the Wild. */
export const STYLES_C = VIDEO_STYLES.filter((style) => style.family === 'C')

export const styleById = (id: string): VideoStyle | undefined =>
  VIDEO_STYLES.find((style) => style.id === id)
