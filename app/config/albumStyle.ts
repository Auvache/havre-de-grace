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
  /** Where the whole film runs, once there is one. */
  page?: string
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
  // Found building the whole of Ivory (etching.mjs, 2026-09-24).
  'A hush is a slower drift, never a stop. Ivory slows to 15% of its drift on "stop and stare" and on "forgot how to breathe" by integrating a speed curve, so the velocity stays continuous and the camera still moves a few units a second — the moment reads as the world holding its breath, not as a frozen frame.',
  'Blank plate for more than a second or two during a move reads as a gap in the film, not as air. Hold on the last figure longer, and start drawing the next one — its frame, its rules — during the move, so the camera arrives at something being made.',
  // Found building the whole of Conman (engraving.mjs, 2026-09-24).
  'A zoom may live in the transform when the subject is a printed thing under a loupe: a magnified engraving should show heavier lines. Keep it between about 0.7 and 1.9, and budget the pan in screen units — world speed times zoom — because a run at 0.72 can go half as fast again in the world as a move at 1.3.',
  'One speed curve carries every kind of move: a move is a half-cosine bump, a run is a plateau with smoothstep ramps, both added to the drift and integrated. Solve each against where the camera must be at its key, and pick the slot a run ends on so its plateau comes out near the speed wanted (runSlot), rather than tuning the speed to hit a slot.',
  'The camera cannot go back. With a drift, a key a little behind where the camera already is makes it reverse through zero — a stop. Slow the drift through a stretch that has to stay on one figure (Conman\'s drift drops to 5 units a second for the bottle and to 7 for the break), or put the next thing further on.',
  'Things printed as the camera reaches them print as they enter the frame, snapped to the next eighth of the click. Printed a third of the way in and snapped to the beat, a blank note sat on a third of the frame for most of a second, which in a still reads as a hole in the sheet.',
  // Found building the whole of Ship to Stockholm (wood-engraving.mjs, 2026-09-24).
  'A followed camera that has to let him walk the wrong way: its speed is his speed plus a first-order pull towards the lead wanted, floored at the drift, and the pull is on the actual gap, not a remembered one. Then when he stops or walks back the camera carries on and he slides back in the frame, and when he walks again it goes a little slower than him until he is back in place — no key, no stop, no reverse.',
  'A destination can be on screen the whole song without a zoom: a thing on the water at the end of the world, drawn at s = A / (distance + A), sits near a vanishing point and grows as the camera nears it. Let A grow without bound over a stretch and it arrives faster than the walk — the ship comes in through the storm — and pull the vanishing point in from the edge while it is far (x scaled by 0.52 + 0.48·s^1.5), so a speck is never off the frame.',
  'A section without a lyric may take the whole sheet at both ends of a film\'s climax: Ship to Stockholm opens out for the storm and again for the outro, where the wake is drawn. The world must then be drawn to 900, not 700 — quay, ice and sky all run to the sheet\'s edge.',
  // Found building the whole of New York (letterpress.mjs, 2026-09-24).
  'A film may shake without cutting. New York, the angriest song, bends the smoothness rule and keeps it: a decaying shake on every hit (shakeAt — a sum of damped sines, so it rings out and never steps), a bank into every whip (roll proportional to camera speed, so it rights itself as the move slows), and a punch of zoom on every beat of the click, larger on the one. None of it is noise; all of it is the clock. Keep the punch out of the title card\'s first bars and out of a hush, or the quiet stops being quiet.',
  'A slam lands on its word only if it accelerates into it: fall as (1 − u)² over the last 120 ms before the word, then squash and ring out. Eased in the usual way, a NO arrives slowing down and reads as late however exactly it is timed.',
  'A red line that strikes things out is set square, like a rule in a composing stick: along its rail, straight up, across, straight down, along again. Interpolated straight from the rail to the strike, it drew diagonals across three scenes and read as a scribble.',
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
  // Found building the whole of Goodbye, Norma Jeane (screenprint.mjs, 2026-09-24).
  'On a night plate, anything printed in the key\'s black is gone: a bedroom, a table, a clapperboard all vanished into the sky. Either draw the night\'s things in paper and the second ink (the searchlights, the posters, the globe), or light them — a pool of paper breaking into halftone at its edge, laid under everything. A pool also gives the night an event: when the lamp goes out, the room goes with it and only the second ink is left.',
  'A paper-coloured thing that is meant to carry the second ink — a poster, a ring box — goes under the second ink, not over it: laid in the key, its paper knocks out the pink printed under it. Screenprint pulls in order, and paper is the absence of ink, so it belongs to the ground.',
  'A halftone seam only reads as a seam if its dots close up: at full tone the dot must be wider than half the diagonal of its cell (0.71 of the pitch), or the flat beyond it starts with a visible edge.',
  'The title card sizes a long title to the room between the middle of the sheet and the signature, not to the full measure: "Goodbye, Norma Jeane" set to 1000 ran into Havre De Grace. Titles of the length of the first two are capped at 96 before this binds, so their cards did not move.',
  // Found building the whole of Ivory (etching.mjs, 2026-09-24).
  'A figure reserved in the paper and never outlined is seen only where there is tone round it — which is a storytelling tool: the same woman is a hint against a pale sky and plain against the darkest plate. Build a person as parts (head, neck, hair, arms, dress) that merge in the paper: one outline through all of it read as a pillar, and it is the gap between an arm and the waist that makes a figure a woman.',
  'A face in reserve wants almost nothing drawn in it — eyes, a brow, a mouth — and it is the hair that says who it is. Long, straight and centre-parted, with a shade under the chin, read as the wrong face entirely; parted to one side, over one shoulder and tucked behind the ear, it read as her.',
  'Tiled hatch fields show a seam at every join even with every line on one lattice: tiles that overlap by a sample step draw the overlap twice, and anti-aliased edges drawn twice come out darker. Straight hatching is only its run endpoints, so draw the whole field at once — Ivory\'s 4,600-unit night is about forty kilobytes.',
  'A hatched field ends by fading its tone to nothing over its last 250–350 units, never at an edge. Two neighbouring scenes that simply stop overlap as two different skies; faded, they read as one sky changing.',
  // Found building the whole of Conman (engraving.mjs, 2026-09-24).
  'An uncut sheet is a grid, and the grid is nearly free: the rows above and below the one the camera follows are <use>s of it, so a chorus that pulls back and slips half a row between lines shows a wall of identical notes for the markup of one row. Red stays on the followed row only; it is the journey, not the print.',
  'A journey that is a hop from thing to thing leaves its trail as copies: the serial stamps each note as it leaves it, so the red on the sheet is where it has been, and the one moving is where it is.',
  'A piece that flies in from elsewhere must not be inside a reveal that is fixed to where it lands. The composite\'s halves were drawn inside the portrait\'s tone clip and were invisible until they arrived; they fly outside it, carrying their own oval.',
  'A nod to a real musician is an object, a number or a shape, never a face: an airship and 1968, a peppermint and a three (a three-dollar bill is also the oldest joke about a forgery), a watch and a guitar, a very tall man standing on a very small world. The faces in the ovals are archetypes told apart by their hair.',
  'The contact sheet read darkest-to-palest as mezzotint, wood engraving, woodcut … engraving, and that range is welcome — the album should have a night and a day in it. What would not be welcome is a frame that breaks the sheet: every one keeps the paper margin, the plate mark and the lyric in ink.',
  // Found building the whole of Ship to Stockholm (wood-engraving.mjs, 2026-09-24).
  'White line on black builds a glow from rows that swell towards the light, and a glow sampled on a grid shimmers as the light moves. Solve each row exactly instead — for a radial light the stretch of a row above each width\'s threshold is an interval round the centre — and use finer width steps than a field (twelve, not six), with a little jitter on each end, or the glow bands into rings.',
  'Engraved line fields leave a gap wherever a run changes width if a run ends on its last sample; end it half a step past, where the next begins, or a night sky reads as brickwork. Key a field\'s noise to where a sample is, not to its index, so a field baked in pieces joins without a seam.',
  'Bake a field in pieces along x and emit only the pieces in view. Ship to Stockholm\'s sky, sea and ice drawn whole put two hundred kilobytes in a frame the page rebuilds sixty times a second; in 350-unit pieces the average frame fell to 140.',
  'On a white-line block a figure is ink cut round in paper, part by part and back to front — bag, far arm, legs, coat, head, hat, near arm — so the parts separate the way an engraver separates an arm from a coat. The first cut, one outline round a stick figure, read as a cartoon; a coat to below the knee and a smaller head made him a man.',
  'Keep a light the story depends on clear of every other light. The lit window read as a lamp for as long as a lamp post stood in front of it; the last post was moved back from the end of the quay and the window along the hill until they could not overlap in the last verse.',
  // Found building the whole of New York (letterpress.mjs, 2026-09-24).
  'Destruction is a pure function of the time since its word: the thing is drawn once into <defs> and its pieces are clipped <use>s of it — shards cut from wedges and rings round the impact point, every vertex shared with its neighbours so the shards tile exactly until they fly; strips between jagged cuts that peel and drop; a burn front that clips the sheet away and lets whatever is pasted under show through. Things that bend or melt are drawn as densely sampled polygons, so bending is a function on their points and nothing is measured.',
  'Layers pasted on a wall give a film scene changes that are not cuts: a poster that burns or tears away shows the next one already under it. Paste the next scene at the same place, underneath, and let the destruction be the transition.',
  'Light words on a night plate need somewhere to be read. Five lighthouse beams sweeping at full length printed their advice over each other; locked to point the same way, each beam reaches only to the next light, and five pieces of advice read as a row the red rule can strike out like a line of type.',
  'A torn-down wall at the end of a film is cut against a box fixed at the moment it tears, not against the moving view — strips laid out against a box that moves are re-cut every frame and never fall.',
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
    page: '/music-videos/into-the-wild',
  },
  {
    slug: 'conman',
    track: 2,
    title: 'Conman',
    technique: 'Line engraving',
    second: SECOND_INK['conman']!,
    journey: 'A counterfeit serial number, HG and a year, that follows the camera from note to note and stamps every one it passes — the conman in the shadows. It reads 1968 on the first note, rolls to 2025 when the earth shakes, and on to 2068 on somebody else\'s.',
    premise: 'Inspiration as theft, and theft as no bad thing: we all take from each other, and if we are lucky somebody takes from us. So the song is an uncut sheet of banknotes coming off a press, every note printed from one layout — rosette, portrait oval, vignette — and every one a copy of the one before with a new face in the oval. Everything is line, engraved in ink and banknote green; the sitters are burnished out of the tone, and it is their hair that says who they are.',
    moves: 'One uncut sheet the camera travels along like a forger\'s loupe, in close for the verses and pulled back for the press runs: the 1968 note engraved in the intro (an airship, a bottle of lightning, a stave of three notes); the reprints, a new face and a bigger number each; the 2025 note with nobody in it, where the sheet shakes and a loupe finds 1968 in the microprint; the chorus, the same note printed on the eighths with the same notes above and below; three notes of the people he follows now (a peppermint three-dollar bill, a watch dial, a small tall man on the world) with the serial in the shadows and his watermark in the paper; the break, where his note is assembled from their pieces; the lightning let out of the bottle and the rosette turned into a record; and the last chorus, where the notes coming off the press are other people\'s. The whole film is at /music-videos/conman.',
    heroLine: 'Bottled lightning in several steady notes',
    still: '/video-styles/album/conman.svg',
    status: 'motion test',
    page: '/music-videos/conman',
  },
  {
    slug: 'goodbye-norma-jeane',
    track: 3,
    title: 'Goodbye, Norma Jeane',
    technique: 'Screenprint',
    second: SECOND_INK['goodbye-norma-jeane']!,
    journey: 'A red lipstick line — the one colour printed in register.',
    premise: 'Silkscreen, halftone and off-register, the way a studio sold its stars — no likeness of anybody, only the things around them: a marquee, a diamond, a film reel, a telephone, pills. The screens slide into and out of register with the song.',
    moves: 'One strip of film, sprocket holes and all, the camera dollies down for the whole song — a picture house, a studio cheque, a clapperboard that never shuts, a dressing room, searchlights and a wall pasted with her mouth on "more, more, more", the walk of fame, the diamond, the pills, a telephone off the hook. The pink screen drifts out of register through the verses, eases almost — never quite — into register on each "Goodbye", and comes apart in the last chorus. The red lipstick line draws on along the whole strip and never lifts until the lipstick is dropped; on the last hit the clapper shuts and that is the cut to the end card. The whole film is at /music-videos/goodbye-norma-jeane.',
    heroLine: 'Know you want the world, it\'s more, more, more',
    still: '/video-styles/album/goodbye-norma-jeane.svg',
    status: 'motion test',
    page: '/music-videos/goodbye-norma-jeane',
  },
  {
    slug: 'ivory',
    track: 4,
    title: 'Ivory',
    technique: 'Hand-coloured etching',
    second: SECOND_INK['ivory']!,
    journey: 'A red thread through a naturalist\'s plate, pulled by an etching needle from specimen to specimen — and every "Ivory" it reaches for her pin and stops a finger\'s width short. The one journey on the album that does not arrive.',
    premise: 'A natural-history copperplate: etched line and cross-hatch, hand-coloured in one blue. The song is the moment you see somebody and are speechless for how electric they make you feel, and so do not act, and miss the chance. The plate tries to catalogue her by the things she is compared to and cannot: she is never inked. Ivory is the colour of the paper, so she is the one thing the etcher leaves bare, seen only where the hatching is laid round her.',
    moves: 'One naturalist\'s plate the camera drifts along for the whole song — a shore at dawn with her far off on the beach, open ocean, a butterfly whose wings open with eyespots for eyes, a stage where light cracks out of her on "sings", a cypress, a mockingbird, a drawer with one empty slot, a portrait with no face and flowers in its hair, the universe stopping to stare, an empty spotlight beside hers, her face looking straight out of the darkest plate, a keyboard of ebony and ivory, a locket that shuts, Eden and the flood on "forgot how to breathe", a forest she walks away into, and the specimen case with her empty pin. The acid bites deeper whenever she does something. The whole film is at /music-videos/ivory.',
    heroLine: 'Her eyes are open ocean and blue butterfly wings',
    still: '/video-styles/album/ivory.svg',
    status: 'motion test',
    page: '/music-videos/ivory',
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
    page: '/music-videos/andalusia',
  },
  {
    slug: 'new-york',
    track: 6,
    title: 'New York',
    technique: 'Letterpress',
    second: SECOND_INK['new-york']!,
    journey: 'A red printer\'s rule that runs the length of the wall and strikes out every piece of advice it passes — the lights on the shore, the cities, New York twice — and at the end goes off the sheet on its own, towards nothing anyone pointed at.',
    premise: 'The song is about being done with everybody\'s formula: the one right way, the city you have to move to, the things you have to bargain, bend, abandon or exploit to get somewhere you may not even want to be — rage at a system that does not care about people. So there is nobody in it. It is a wall flyposted with advice, printed in wood type and picture cuts with the poster yellow as a second forme, and every artifact a musician gets handed on the way is burnt, torn, melted, shattered or crushed under a NO. The fastest, angriest film on the album, and the only one that shakes.',
    moves: 'One wall the camera tears along, whipping from poster to poster and banking into the turns, the sheet jumping on every beat of the click: THE FORMULA broadside pulled block by block; LOVE burning off the rocks and a submarine undermining THE GOAL; a shore of lighthouses built from a mic stand, amps, a metronome and a trophy, struck out by the red rule; loudspeaker horns melting; records melting down a wall of amps and a guitar smashed on the downbeat; a departures board with every city struck out as it lands; a conveyor belt under THE ONLY WAY; an art class of identical paint-by-numbers torn to strips; four NOs crushing the formula in four parts; New York as a skyline, struck and melted; rubber stamps, thrown records, a ladder losing its rungs and advice knocked out of the forme through the instrumental; the lighthouses toppling; a wall of televisions imploding; three rounds of NO on everything the film has broken; and the formula poster again, stamped NOT GOING, torn in two on "York" while the wall comes down and the red rule leaves the sheet. The whole film is at /music-videos/new-york.',
    heroLine: 'No, no, no, no',
    still: '/video-styles/album/new-york.svg',
    status: 'motion test',
    page: '/music-videos/new-york',
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
    journey: 'The ship\'s wake, torn open through the ice — and held back until he goes. Until then the only red on the block is the ship\'s stern lantern.',
    premise: 'End-grain wood engraving, white line on black — finer and colder than the woodcut, the way Bewick cut the sea. The song is an ultimatum: a man done with the anger and the talking that never gets an answer, the ship back to Stockholm his way out to a simpler time, and in love with what he is leaving. The film is the story of a man who does not want to leave and feels he has to. It shares Stockholm with Andalusia.',
    moves: 'One long quay at night the camera walks along with him: the town on the far shore behind, where every light goes out but one window, and ahead, out on the water, the ship, drawn in perspective from one point so it grows as he nears it. He keeps turning back — to the window on "lost love", a few steps back towards it on "to get back to you", on his knees on "begging" — past the STOCKHOLM hut and its running clock, between two crowds that raise rifles on "guns" and turn their backs on him on "persuading". In the instrumental the plate takes the whole sheet for a storm: the ship coming in through it with its lantern swinging, a wave that puts him on one knee, the telephone wire snapping; the storm drops when the bass does. Then the plank run out from the ship on "rescue", cracks on "razor thin ice", the plank walked like a tightrope, a light on the horizon on "Eden", dogs on "bite", the same newspaper over and over on "repeating". He lets a letter go on "letter", the broken wire sparks on "phone", the window goes out, and he climbs aboard; on "Stockholm" the ship casts off and the red wake tears open behind it for the whole outro. The whole film is at /music-videos/ship-to-stockholm.',
    heroLine: 'We\'re walking a tightrope to Eden',
    still: '/video-styles/album/ship-to-stockholm.svg',
    status: 'motion test',
    page: '/music-videos/ship-to-stockholm',
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
