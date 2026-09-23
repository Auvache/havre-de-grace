/*
 * The album — how ten films for "Into the Wild" are one record.
 *
 * WHAT THIS FILE IS FOR
 * videoStyles.ts is a catalogue of looks. This is the decision that came out of
 * it: every song on the album gets its own film, each film is unique, and all
 * ten hang together. The way they hang together is printmaking — every film is
 * an impression pulled by a different technique on the same paper, with the
 * same black and the same red — and the way they move is Andalusia's, which
 * never stops and never cuts.
 *
 * The constants a film module needs are in shared/video/album.mjs, which this
 * file re-exports; the written rules are here. Hand this file to whoever builds
 * the next song.
 *
 * WHY PRINTMAKING
 * The two films that were liked most were Cartography (Andalusia) and Woodcut
 * (Into the Wild). They are closer than they look: both are printed things on
 * paper, ink on a warm stock, flat colour, and one saturated red doing all the
 * work. What separated them was the hand — engraved and precise against carved
 * and heavy — and the motion, which is what the person watching actually named:
 * Andalusia is smooth and Woodcut steps. Printmaking keeps the hand different
 * per song and makes the paper, the inks and the motion the same.
 */
/*
 * The inks are written out here as well as in album.mjs, on purpose: a config
 * under app/ that imports from shared/ by relative path does not survive Nuxt's
 * server build, and the page and the film modules each import album.mjs their
 * own way. tools/video-styles/album.mjs checks that the two copies agree, so a
 * drifted hex fails the build of the stills rather than shipping.
 */
export const PAPER = '#ece4d2'
export const INK = '#1b1915'
export const RED = '#b5392a'

export const SECOND_INK: Record<string, string> = {
  'into-the-wild': '#586a70',
  'conman': '#3e5b4c',
  'goodbye-norma-jeane': '#e59aae',
  'ivory': '#3f6aa6',
  'andalusia': '#8fa89a',
  'new-york': '#d9a13b',
  'meet-me-at-the-horizon': '#d7a24a',
  'rocks-in-the-sea': '#24527d',
  'ship-to-stockholm': '#8ea3ad',
  'ghost': '#8b8580',
}

export interface AlbumSong {
  /** The track's slug, as in content/music/into-the-wild.yml. */
  slug: string
  track: number
  title: string
  /** The printmaking technique — the song's hand. */
  technique: string
  /** Its one second ink (SECOND_INK in album.mjs). */
  second: string
  /** What is red in this film. Red is always the thing that travels. */
  journey: string
  /** The idea, in a paragraph. */
  premise: string
  /** How it moves under ALBUM_MOTION: the one world, the camera, what lands on words. */
  moves: string
  /** The line the hero frame is drawn on. */
  heroLine: string
  /** The still: public/video-styles/album/<slug>.svg. */
  still: string
  /** How far it has got. */
  status: 'film' | 'motion test' | 'still'
}

/*
 * What is the same in all ten. A song may not change any of these; if one has
 * to bend, it is changed here, for the album, or not at all.
 */
export const ALBUM_CONSTANTS = [
  'Paper, ink and red are the three album inks: paper #ece4d2 (never white), a warm black #1b1915 (never #000 — pure black is the end card\'s, which is why the end card reads as an ending), and one red #b5392a.',
  'Red is the journey. In every film the only red thing is the thing that travels — Andalusia\'s route, Into the Wild\'s sun and trail, the lit window in the city Ghost cannot reach. Across ten films the eye learns that red means going.',
  'One second ink per song, and only one. It is the song\'s own colour and the thing that tells two techniques apart at a glance: banknote green, screenprint pink, butterfly blue, cyanotype blue.',
  'The sheet: every frame is a print — the image inside a plate mark (a debossed rule 10 units outside the plate, x 34 y 34, 1532 by 666) and a paper margin under it, 200 units tall, where the lyric sits the way a printmaker pencils a print\'s title. The image may take the whole sheet only in a section with no lyric, and only by easing out to it over at least 1.4 s.',
  'The lyric, in the margin: Jost 700 caps in the album ink, centred, one row if it fits at 70 or more and two otherwise — the same solid black in every film on the album. It does not fill, sweep or change colour as it is sung; what carries the sync is when each line arrives, leaves and hands over to the next, and that is one rule for all ten (ALBUM_MOTION, and lineSpan / marginLyric in album.mjs). Never red, never stretched past its measure.',
  'The title card is the same on all ten: the film\'s first image in the plate, and in the margin the song\'s title in the middle, the edition number at the left in pencil — the track number, 5/10 for Andalusia, the one number any film is allowed — and Havre De Grace at the right in red, as a signature. It clears before the first line. The album name is never on screen.',
  'The end card is the suite\'s: the lockup on pure black, landing on the last note, three seconds, then the credits (END_CARD in videoStyles.ts). Cutting to it is the only hard cut in any film.',
  'A film made before the album joins it as an edition, not a rewrite: the same frame function with an `edition` option, the original byte-identical until the album edition is approved; once it is, the song\'s page switches to the album edition and the original stays only for its still sheet. Cartography is the pattern (cartographyAlbumFrame, approved and running on /music-videos/andalusia). A view of a world — a globe, a panorama — is re-centred on the plate and scaled by its height inside the projection (0.74 of the full frame), never squeezed in with a transform.',
    'Every drawing comes from the song\'s cue list (shared/video/cues.mjs), redrawn in the song\'s hand — so a lighthouse is a lighthouse in every film, engraved in one and carved in another.',
]

/*
 * How every film moves. This is the part the person watching chose, in their
 * words: "my favourite thing about that video is how smooth it is", and of the
 * woodcut, "great except for the smoothness".
 */
export const ALBUM_MOTION = [
  'One continuous world per song. The film is a place the camera travels through, not a slideshow of pictures — Andalusia is one chart; Into the Wild is one long carved panorama from the harbour to the mountains. A new line moves the camera to a new part of the same world; it does not replace the world.',
  'The camera never stops. There is always a drift — at least a few units a second — and every change of view eases in and out over about 1.4 s (glide() in album.mjs). Slower reads as a slideshow; faster reads as a cut.',
  'No hard cuts inside a film. Lines dissolve in and out on the margin\'s timing rule (marginLyric()); scenes are reached by camera, crossfade or a sweep, never by replacement. The only hard cut is into the end card.',
  'A word lands; it does not step. Things that arrive on a measured word ease in over 90–180 ms (land()) and then stay, so a line accumulates. Carving sweeps open, ink pulls across, a sketch draws on — never a frame where something is suddenly there.',
  'Figures move continuously. A walk or a run is interpolated between poses at the frame rate, not stepped between them — stepping is Flipbook\'s idea, and Flipbook is not on this album.',
  'Timing still comes from the score. Cuts, arrivals and view changes are keyed to measured words and line starts; the easing is how things get there, not when. Where a song is on a click (Into the Wild is, at 120 BPM), a cycle may run off its grid; where it is not, nothing reads the tempo.',
  'The audio drives nothing, as in Cartography. Smooth comes from the clock and the easing, and an analyser jitters.',
  // Found building the two motion tests (relief.mjs, cartographyAlbumFrame).
  'Ease camera moves with a half-cosine (easeCamera, which glide() uses), not the cubic ease-in-out: the cubic peaks at three times its average speed, and a 2000-unit pan over 1.6 s hit 120 units a frame at 30 fps — a whip. Budget about 40 units a frame at 30 fps for the fastest pan; if a move needs more, put the places closer together in the world rather than moving faster.',
  'Camera = constant drift plus eased moves between held offsets, never keyframed positions alone. Keyframing positions stops the camera dead at every key, which is exactly the step the stepped woodcut had; a drift carried through every hold makes velocity continuous by construction.',
  'Leave a view while the last word is still ringing. The harbour-to-stage move starts half a second after "hollow" and arrives by "roar"; started on the next line\'s cut-in, the same move was twice as fast.',
  'Parallax is translation at a fraction of the camera — sky about 0.2, a far range about 0.55, the ground 1 — never scale. A far layer holds things on screen five times longer than expected, so far things leave by moving (set, sink, fade with the light), not by being scrolled past.',
  'A seam between two parts of the world is drawn, not cut: a beach under a slanted waterline, a crowd that thins into a ridge. A vertical edge where one region stops is a hard cut in disguise.',
  'A person who crosses from one part of the world to the next carries the camera with no cut: in Into the Wild the singer runs off the stage on "running" and leaps into the range on "wild", the run speed solved from the score so the stage edge arrives on the word. A run cycle is blended between poses with a smoothstep inside each step, and accelerates from standing — full speed on the first frame is a step.',
  'The margin\'s timing, which is the lyric\'s whole sync now that it does not fill (lineSpan in album.mjs): a line is fully up 20 ms before its first word, fading in over the lead before it; it holds at least a quarter of a second past its own last word; it hands over inside the next line\'s lead — the outgoing gone in the first 40%, the incoming up in the rest, so two lines are never at full strength in one place; and the last line of a section holds while it is still being sung and leaves with the section over its last 0.35 s. Every album film calls marginLyric() rather than timing its own lines — decided after the person watching asked for every lyric to be the same black, "very well timed with the start/end of each line and the transition to the next one".',
  'With a dash-drawn cut, one path per row: a dash restarts at every subpath, so three rows in one path with pathLength="1" all finish a third of the way through.',
  // Found building the whole of Into the Wild (relief.mjs, 2026-09-23).
  'Do not hand-place a cue in world coordinates. Solve the camera first, then put each thing where the camera will be when its word is sung (x = camera(t_word) + an offset). Across three and a half minutes of world, that is the only way a sign for "goals" is on screen on "goals" — and a retimed score moves the world with it.',
  'A figure the camera follows is a velocity schedule, smoothstepped between speeds and integrated, not keyframed positions — then position, pose phase (by distance covered, so the feet never slide) and the camera all come from one number. The camera follows with a floor at the drift: the first cut let the lead shrink as the runner slowed, and the camera stopped dead at 114.7 s.',
  'Hand a followed camera back to a keyed one where the two already agree. In Into the Wild the runner walks the last verse at exactly the drift, so following him and holding the sage view are the same camera, and the handover cannot be seen.',
]

/*
 * Found by drawing the ten stills. Each is a clarification of a constant above,
 * or a cost that a film of that technique will have to pay.
 */
export const ALBUM_NOTES = [
  'A plate may carry a tone of its own — an etching\'s wiped plate, a cyanotype\'s blue, a mezzotint\'s black — as long as the margin is the album paper. The margin is the constant; the plate is the song\'s.',
  'A song may print the album ink at reduced strength. Ghost has no full black anywhere: it is a second impression, and a full-strength black would be a first one.',
  'On a plate that is mostly ink (wood engraving, mezzotint), keep the red small — a line, a lead, a wake — not a field. On paper it reads as the journey; on black a red field is the loudest thing on the album.',
  'Type in the plate stands down to about 40% while the margin lyric is being sung, the way Cartography\'s port names do — New York\'s departures, Conman\'s microtext. Two lyrics on one sheet is one too many.',
  'Stills are inlined, never shown as <img>. An SVG in an <img> cannot load Jost, and the margin falls back to another face.',
  'Bake what does not move. Paper grain, a mezzotint\'s rocker ground, a cyanotype\'s brushed coating, halftone screens, engraved hatching: compute them once, keep the markup byte-identical frame to frame, and let the camera translate them. A full-plate filter regenerated sixty times a second is the one way a print can stop being smooth.',
  'Moving the lyric to the margin takes away the reason plate furniture used to stand down. Cartography\'s compass dimmed while a lyric was on the chart; in the album edition it sat at full strength over the second chorus\'s West Coast ports. A mark that once stood down for type stands down for the subject instead — by distance from the nearest place and the head of the route, eased, so it fades as the camera carries things under it and never steps.',
  'In a relief print with a paper band behind the ground, anything standing on the ground prints in ink and anything cut into the ground or sky is paper. Sage sprigs cut in paper stood against the paper band and vanished; flowers, stones, signposts and houses are ink.',
  'An ink range on an ink night sky is invisible, so it gets a cut along the ridge. And a full circle drawn as one SVG arc vanishes once both endpoints round to the same point, so draw it as two half-arcs.',
  'The contact sheet read darkest-to-palest as mezzotint, wood engraving, woodcut … engraving, and that range is welcome — the album should have a night and a day in it. What would not be welcome is a frame that breaks the sheet: every one keeps the paper margin, the plate mark and the lyric in ink.',
]

export const ALBUM_SONGS: AlbumSong[] = [
  {
    slug: 'into-the-wild',
    track: 1,
    title: 'Into the Wild',
    technique: 'Woodcut',
    second: SECOND_INK['into-the-wild']!,
    journey: 'The sun, rising along the film, and the trail the runner cuts.',
    premise: 'A two-block relief print — the key block in ink, a colour block in red — as one long carved panorama the camera travels along: harbour, stage, range, forest. Carving sweeps open across each line rather than stepping, and the runner is a smooth silhouette.',
    moves: 'One long carved panorama the camera travels left to right for the whole song — an empty sea, the Earth rising out of it, a moor of sleeping stones, a forest, a town, a mountain pass, a harbour, a stage, the range. Each word sweeps a cut open; the red sun rises on every chorus and the red trail runs behind the runner, who is his speed integrated, never stepped. The whole film is at /music-videos/into-the-wild.',
    heroLine: 'So I\'m running into the wild',
    still: '/video-styles/album/into-the-wild.svg',
    status: 'motion test',
  },
  {
    slug: 'conman',
    track: 2,
    title: 'Conman',
    technique: 'Line engraving',
    second: SECOND_INK['conman']!,
    journey: 'A counterfeit serial number that follows you round the note — the conman in the shadows.',
    premise: 'The song as a banknote: guilloche rosettes, fine parallel-line vignettes, a portrait frame with nobody in it. Everything is line — no fills — engraved in ink and banknote green, and the camera moves over the note the way a forger\'s loupe does.',
    moves: 'The note is bigger than the frame and the camera eases over it like a forger\'s loupe, in on the guilloche for the quiet lines and out to the whole note for the chorus. The rings turn slowly the whole time; words land as a strand drawing on; the red serial drifts round the note, always just in frame.',
    heroLine: 'Bottled lightning in several steady notes',
    still: '/video-styles/album/conman.svg',
    status: 'still',
  },
  {
    slug: 'goodbye-norma-jeane',
    track: 3,
    title: 'Goodbye, Norma Jeane',
    technique: 'Screenprint',
    second: SECOND_INK['goodbye-norma-jeane']!,
    journey: 'A red lipstick line — the one colour printed in register.',
    premise: 'Silkscreen, halftone and off-register, the way a studio sold its stars — no likeness of anybody, only the things around them: a marquee, a diamond, a film reel, a telephone, pills. The screens slide into and out of register with the song.',
    moves: 'A studio lot as one long strip of props the camera dollies along. The pink screen drifts out of register through the verses and eases almost — never quite — into register on each "Goodbye". The red lipstick line draws on along the whole strip and never lifts.',
    heroLine: 'Diamonds are your only friend',
    still: '/video-styles/album/goodbye-norma-jeane.svg',
    status: 'still',
  },
  {
    slug: 'ivory',
    track: 4,
    title: 'Ivory',
    technique: 'Hand-coloured etching',
    second: SECOND_INK['ivory']!,
    journey: 'A red thread through a naturalist\'s plate, from specimen to specimen.',
    premise: 'A natural-history copperplate: etched line and cross-hatch, hand-coloured in one blue — butterfly wings, ocean, flowers in her hair. A woman described entirely by the things she is compared to, and never drawn herself.',
    moves: 'One naturalist\'s plate wider than the frame — ocean, wings, flowers, California, Tennessee, Alaska snowfall — and the camera drifts along it, easing to each figure as it is named. Hatching sweeps on word by word; the wash blooms in after the line; the red thread reaches each pin on its noun.',
    heroLine: 'Her eyes are open ocean and blue butterfly wings',
    still: '/video-styles/album/ivory.svg',
    status: 'still',
  },
  {
    slug: 'andalusia',
    track: 5,
    title: 'Andalusia',
    technique: 'Engraved chart',
    second: SECOND_INK['andalusia']!,
    journey: 'The route — which is where the album\'s red came from.',
    premise: 'Cartography, on the album\'s paper: the same globe, route and camera, re-inked in the album\'s paper, ink and red, with the lyric moved into the margin and the title card made the album\'s.',
    moves: 'Cartography\'s camera, unchanged: the chart is the world, the route is the journey, and the album edition moves exactly as the original does. The first film on the album to be finished: approved whole, and running at /music-videos/andalusia.',
    heroLine: 'Bangkok, Budapest, or Baton Rouge',
    still: '/video-styles/album/andalusia.svg',
    status: 'film',
  },
  {
    slug: 'new-york',
    track: 6,
    title: 'New York',
    technique: 'Letterpress',
    second: SECOND_INK['new-york']!,
    journey: 'The route to New York, set in red rule and crossed out.',
    premise: 'A wood-type broadside and a railway timetable: every city the song is told to move to set as a departure in big wood type — Memphis, Nashville, Austin, L.A., Detroit — and the NOs set as the headline, each one a heavier impression than the last.',
    moves: 'The broadside is a timetable taller than the frame; the camera travels down it through the verses and settles on the headline for every "No, no, no, no". Each NO is pulled on its word — the yellow block first, then the black sort inking across it — and the plate\'s own type stands down to ~40% while the margin is being sung.',
    heroLine: 'No, I won\'t go, I\'m not going to New York',
    still: '/video-styles/album/new-york.svg',
    status: 'still',
  },
  {
    slug: 'meet-me-at-the-horizon',
    track: 7,
    title: 'Meet Me at the Horizon',
    technique: 'Mezzotint',
    second: SECOND_INK['meet-me-at-the-horizon']!,
    journey: 'The line of the horizon, which is where the dawn comes in.',
    premise: 'Mezzotint works from black towards light — the plate is rocked until it prints solid, and the image is burnished out of the dark. So is this song: a room at night, a window, a treeline, and a dawn scraped in slowly over three and a half minutes.',
    moves: 'One room, one window, and the whole song is one slow burnish from night to dawn: the sky, the gold, the shaft across the bed all grow with a single clock, and the stars go out one by one. The camera pushes towards the window through each verse and eases back on the choruses.',
    heroLine: 'Then the sun starts to wake, the trees start to yawn',
    still: '/video-styles/album/meet-me-at-the-horizon.svg',
    status: 'still',
  },
  {
    slug: 'rocks-in-the-sea',
    track: 8,
    title: 'Rocks in the Sea',
    technique: 'Cyanotype',
    second: SECOND_INK['rocks-in-the-sea']!,
    journey: 'The road home, the one line on the print that is not sun-printed.',
    premise: 'A sun print: things laid on blue paper and exposed — rocks, sand, sea grass, a hometown\'s roofs, the road as it slims down into trees. White where something lay on the paper, blue where the light got in. The second ink is the ground.',
    moves: 'One shoreline the camera drifts along — hometown, rain, road, the sand by the rocks. Each noun is laid on the paper as it is sung, easing from a soft lifted penumbra to crisp white; the red road grows and slims into the trees.',
    heroLine: 'Is the sand by the rocks in the sea',
    still: '/video-styles/album/rocks-in-the-sea.svg',
    status: 'still',
  },
  {
    slug: 'ship-to-stockholm',
    track: 9,
    title: 'Ship to Stockholm',
    technique: 'Wood engraving',
    second: SECOND_INK['ship-to-stockholm']!,
    journey: 'The ship\'s wake across the ice.',
    premise: 'End-grain wood engraving, white line on black — finer and colder than the woodcut, the way Bewick drew the sea. Night water, razor-thin ice, a ship, a tightrope to Eden. It shares Stockholm with Andalusia, so it is the one film that could quote the chart.',
    moves: 'A night sea running east, the camera drifting with the ship towards the light on the horizon. Tone is computed from a brightness function, so the moon crosses the sky and Eden brightens with nothing redrawn; the red wake lengthens behind the ship for the whole song.',
    heroLine: 'It\'s deep water rescue on razor thin ice',
    still: '/video-styles/album/ship-to-stockholm.svg',
    status: 'still',
  },
  {
    slug: 'ghost',
    track: 10,
    title: 'Ghost',
    technique: 'Monotype — the ghost print',
    second: SECOND_INK['ghost']!,
    journey: 'The fire: the city burning, the one thing printed at full strength.',
    premise: 'A monotype prints once; what is left on the plate pulls a second, fainter impression, and printmakers call that the ghost. The whole film is the ghost print — soft, smeared, half there — with only the burning city in full red.',
    moves: 'A street at night seen side-on, from the amplifiers to the burning city; the camera drifts towards the fire and never arrives. The flames breathe off the clock and catch on measured words; the figure eases between poses and fades further on every "ghost".',
    heroLine: 'But you\'re on fire and I\'m a ghost',
    still: '/video-styles/album/ghost.svg',
    status: 'still',
  },
]
