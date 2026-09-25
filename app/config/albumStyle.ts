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
  // Found building the Conman gallery (gallery.mjs, 2026-09-25).
  'A frame that shows a wall of twenty pictures, a hundred holes and forty collage pieces is a megabyte if every path is written out where it is used. Write each torn outline and each long hair outline once in the defs and <use> it for its fills, hatches, clip, shadow and edges (a <use> takes the fill and stroke it is given when the path has none of its own); round coordinates to whole units; and leave hair strands out below a zoom of about 0.6. The gallery went from 1.07 MB to under 300 KB at its widest.',
  // Found reworking the Conman wall (conman-wall.mjs, 2026-09-25), from the person watching: "it should be much smoother with the slow panning".
  'A slow pan shows the clock\'s jitter before anything else. Chrome reports audio.currentTime every frame but quantised to its audio callbacks (about 10 ms), so a clock that snaps to each report advanced 15 ms one frame and 26 ms the next: a forty-unit-a-second drift judders by half. The projector now runs on the requestAnimationFrame timestamp and eases toward the reported time (app/utils/mediaClock.ts), snapping only past 150 ms. Frame-to-frame camera steps went from about ±30% to ±2.4%.',
  'A <use> clones its whole subtree. A few hundred torn sheets each <use>-ing a print with a hatched portrait in it cost 28 ms of parse and layout a frame, and the break ran at nine frames a second. From far off (below a zoom of 0.45) a touched sheet is the section\'s pattern with its holes covered: each torn piece its outline in the flat colour of what is under it, a sheet gone whole its rectangle, a sheet whose backing has gone the wall — two paths a section — and a falling piece is its outline in its sheet\'s colour. 60 fps again, and nothing at that distance looks different.',
  'A torn piece that only flies away must be seen to fly: sent straight to a destination nine thousand units down the wall it left the screen in a quarter of a second. Send it up and across, about a screen\'s width over two and a half seconds, turning and growing a little as it comes off, with a handful of paper flecks falling from the tear.',
  // Found building the whole of Meet Me at the Horizon (mezzotint.mjs, 2026-09-25).
  'A world of planes at depth lets the camera go through a window without a cut: draw each plane at scale F / (d + D), where d is the camera\'s distance from the room\'s back wall and D the plane\'s depth behind it, and let the room\'s plane fade only once the window opening already covers the plate. A lens shift (the whole picture moved in screen units) is how it looks up at the stars or down at the fields; a horizon at infinity stays where the shift puts it, as a real one does.',
  'Measure a move through a plane only on what is on the plate. The plane\'s own points leave the frame at hundreds of units a frame as the camera passes it, which nobody sees; what is seen through the opening moves slowly. Measured that way, every crossing in the film came in under the budget once each was given two and a half to three and a half seconds.',
  'A figure the camera follows through a crossing is placed by its depth relative to the camera, not by where it is in the world. Placed in the world, he was overtaken as the camera went out of the window after him and vanished; flying back, the camera ran into him and he filled the frame. Going back through a window the camera leads, so the follower has to leave — his dream self went into the light, the way a dream does on waking.',
  'Keep a horizon on the eye line. A ridge that comes near has to be a hill exactly as high as the camera\'s eye (crest = eye height less a few units of depth), or two people meant to meet on the horizon stand under it with a band of nothing between them and the sky. Let the ground climb to it over its last stretch, and a walker climbs with it.',
  'Name every time in a plan for its word and its line. "end" the sung word and "end" the end card were one key: the second silently won, the star trails that wheel up to the word never started, and a verse-two camera key moved to the last second of the film.',
  'A camera through keyframes can be a monotone cubic (Fritsch–Carlson) instead of a drift plus eased moves: its velocity is continuous through every key and it never overshoots one, so it only stops where the direction reverses. Give neighbouring keys different values and put the last key past the end card, or it stops between them.',
  // Found building the whole of New York (letterpress.mjs, 2026-09-24).
  'A film may shake without cutting. New York, the angriest song, bends the smoothness rule and keeps it: a decaying shake on every hit (shakeAt — a sum of damped sines, so it rings out and never steps), a bank into every whip (roll proportional to camera speed, so it rights itself as the move slows), and a punch of zoom on every beat of the click, larger on the one. None of it is noise; all of it is the clock. Keep the punch out of the title card\'s first bars and out of a hush, or the quiet stops being quiet.',
  'A slam lands on its word only if it accelerates into it: fall as (1 − u)² over the last 120 ms before the word, then squash and ring out. Eased in the usual way, a NO arrives slowing down and reads as late however exactly it is timed.',
  'A red line that strikes things out is set square, like a rule in a composing stick: along its rail, straight up, across, straight down, along again. Interpolated straight from the rail to the strike, it drew diagonals across three scenes and read as a scribble.',
  // Found building the whole of Rocks in the Sea (cyanotype.mjs, 2026-09-25).
  'A red line along the foot of the plate whose head sits at a fixed place on screen reads as a progress bar. Draw the road across the whole foot on its word, keep it reaching past the right edge as the camera goes, and let it meander; it ends only where it turns off into the picture.',
  'A turn in a song can be carried by the print rather than by a picture. Rocks in the Sea is unfixed until "stay" — a lighter blue, and every white with a soft penumbra that never quite settles — and a wash in screen space, a wet edge crossing the plate over five seconds on a half-cosine, fixes it. The cubic ease crawled for two seconds and then whipped across in one and a half.',
  'Something that must stay with the camera while the world goes by (a cloud that is "always with me") is drawn in screen space with a slow wander of its own, not on a parallax layer. Park it where the choruses\' things will not be: the cloud first sat over the trees the gulls lift out of.',
  'Compose a film\'s last picture backwards: place everything in the final section by where it will be at the last word (x = camera(end) + sx), under a hush of a few units a second, and it arrives on its own word a little to the right of where it ends.',
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
  'A nod to a real musician is a haircut, never a likeness. Conman\'s banknote edition nodded with objects only (an airship and 1968, a peppermint and a three); the gallery that replaced it (2026-09-25) hangs portraits, but as stencils: no eyes, no nose, no mouth, faces cut wider than anybody\'s, no instrument in anyone\'s hands. Three are meant to be somebody and are a haircut and a shirt; the rest are archetypes a viewer might half-place and be past before they could say.',
  // From the person watching the torn gallery (2026-09-25): "the way things break off is weird — I want it to look like tearing paper". The answer is shared/video/torn.mjs, under the wall of sections (conman-wall.mjs).
  'A tear that reads as paper starts at an edge, never in the middle: a hole with an outline, however ragged, reads as a stamp cut out. The torn line is ragged at every scale (midpoint displacement plus a fine jitter), the sheet left behind shows a band of its pale core along the rip, wider here and thinner there, and the piece peels — it folds over its torn line showing its unprinted back, tears free and tumbles, flipping front to back as it falls. A peel is one affine matrix (distance from the hinge times cos θ), so the flap is a single <g transform>.',
  'Conman is the album\'s one exception to one second ink per song (2026-09-25, asked for by the person watching): the film is a wall of sections, each a grid of one sheet with one artist on it, and every section has its own ink — tangerine fly-posters, violet stamps, emerald notes, cobalt frames. Red stays the journey in every section, which is why the White Stripes board is black flyers with a red string rather than red flyers.',
  'The camera holds on a section and pans slowly wherever there is a line to hold on — a verse gives each half its own section, a chorus gives each sung line one, and the guitar after a verse stays on the section it follows. It moves only between sections, each move pulled back through its middle by its length, so a jump across the wall reads as one flight. Tears escalate within a section, from nicks a few seconds apart to whole sheets, and later sections start where earlier ones finished. (The first wall toured a new section on every bar through every unsung part; the person watching asked for it calmer, 2026-09-25.)',
  // From the person watching (2026-09-25): "I want all of the various sections to be touching. Picture one big collage divided into sections", and "think of the wall as being black".
  'The wall is one collage: ten sections of different sizes butted edge to edge into a rectangle the plate\'s shape, each section\'s grid running off its edges and cut there, with a hairline of the wall between them. The wall itself is black — between the gallery\'s frames, behind anything torn, and the whole plate when nothing is on it — so the film can start on a blank black plate, paste the sections up one at a time, tear every one of them down in the break to a pile of scraps along the bottom, and paste them all back up in red at the end.',
  'A detailed likeness drawn by hand read as a caricature, and every face drawn with the same features read as the same person in different wigs. The stencil — hair as one angular mass cut into a dozen big uneven locks, the face left in the paper — is both further from anybody and more of a picture.',
  'The contact sheet read darkest-to-palest as mezzotint, wood engraving, woodcut … engraving, and that range is welcome — the album should have a night and a day in it. What would not be welcome is a frame that breaks the sheet: every one keeps the paper margin, the plate mark and the lyric in ink.',
  // Found building the whole of Ship to Stockholm (wood-engraving.mjs, 2026-09-24).
  'White line on black builds a glow from rows that swell towards the light, and a glow sampled on a grid shimmers as the light moves. Solve each row exactly instead — for a radial light the stretch of a row above each width\'s threshold is an interval round the centre — and use finer width steps than a field (twelve, not six), with a little jitter on each end, or the glow bands into rings.',
  'Engraved line fields leave a gap wherever a run changes width if a run ends on its last sample; end it half a step past, where the next begins, or a night sky reads as brickwork. Key a field\'s noise to where a sample is, not to its index, so a field baked in pieces joins without a seam.',
  'Bake a field in pieces along x and emit only the pieces in view. Ship to Stockholm\'s sky, sea and ice drawn whole put two hundred kilobytes in a frame the page rebuilds sixty times a second; in 350-unit pieces the average frame fell to 140.',
  'On a white-line block a figure is ink cut round in paper, part by part and back to front — bag, far arm, legs, coat, head, hat, near arm — so the parts separate the way an engraver separates an arm from a coat. The first cut, one outline round a stick figure, read as a cartoon; a coat to below the knee and a smaller head made him a man.',
  'Keep a light the story depends on clear of every other light. The lit window read as a lamp for as long as a lamp post stood in front of it; the last post was moved back from the end of the quay and the window along the hill until they could not overlap in the last verse.',
  // Found building the whole of Meet Me at the Horizon (mezzotint.mjs, 2026-09-25).
  'A mezzotint needs no filters either. Tone is flat fills on one ramp from the album ink to the album paper, warm all the way; light is paper-coloured radial gradients laid over it; the rocked ground is two baked dot patterns fixed to the sheet. Clip a wall\'s light to the wall: laid over the window it fogged the view through the glass and made the man standing in it look like a ghost.',
  'On a dark plate a figure is burnished lighter than the dark round it, with a rim lit on the window side; against the dawn it is a silhouette with a gold rim. Build limbs as tapered quads with round joints — a uniform stroke is a mannequin, arms straight out a crucifix — and draw in world units: the shared coordinate formatter rounds to one decimal, and a figure drawn in 0–1 units under a scale transform collapsed into a capsule.',
  'Trees below the eye line are invisible against dark land at night. Burnish a mist into the land just under the horizon, and let the pines stand taller than the eye, so through a window they are cut out against the sky as they are in the still.',
  'A light the story depends on can hide behind a glazing bar: the first red horizon was drawn exactly behind the window\'s transom. Set the bars clear of the horizon.',
  'Anxiety can re-rock the plate. The first dawn is burnished in and then swept away by a band of fresh burr with the rocker\'s teeth along its front, and the red line goes with it; the second dawn is burnished again and holds. A journey that is undone once reads as earned when it comes back.',
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
    journey: 'The conman, one red thing per section that lands on a sheet the next word tears: a snipe, a postmark, a string from pin to pin, a VOID stamp, a serial number, a sold dot, a pilot lamp. In the last chorus red is every section\'s ink: everything belongs to whoever took it last.',
    premise: 'Inspiration as theft, and theft as no bad thing: everybody takes from everybody, and if you are lucky somebody takes from you. So the song is one black wall pasted up with a collage of sections, each a grid of one sheet repeated edge to edge (fly-posters, stamps, guitar-lesson flyers, tickets, banknotes, framed pictures, amps, a tour schedule, sticker sheets), each one artist as a stencil, the hair one angular engraved mass and the face bare paper. The words tear the sheets; tearing is paper tearing.',
    moves: 'Black, and CONMAN in paper-white; the title drops to the margin and the paper comes in round a black plate, and the sections are pasted onto it one every other beat. Then a slow pan across each section while its verse half or chorus line tears it, nicks first and whole sheets last. The break is right out and still: the whole wall is torn down into a pile of scraps along the bottom of the plate. In the last verse the camera creeps in while pieces lift off the pile and lay down the outline of a new musician with a guitar, made of everyone. The last chorus pastes the wall back up over him in red, his face on every sheet. The whole film is at /music-videos/conman.',
    heroLine: 'These rhythms\' been around since 1968',
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
    journey: 'The line of the horizon, where the dawn comes in and where the song asks to be met — drawn on with the first dawn, rocked away with it, drawn again, and in the end the place the two of them meet.',
    premise: 'Mezzotint works from black towards light — the plate is rocked until it prints solid, and the image is burnished out of the dark. The song is a night awake: a man alone in a bed that used to hold two, his thoughts running, the room turning on him, and the dawn he waits for all night. So the film opens on a black plate and burnishes a bedroom out of it, and the dawn comes in over the whole song — but anxiety re-rocks the plate, and the first dawn has to be made again. She is never inked, only left in the paper, and the film never says why she is gone.',
    moves: 'One world of planes at depth — the bedroom, the house round it, the pines, a village, a ridge, the sky — so the camera never cuts. Sheep on the wall stop mid-jump on "no"; the ceiling is burnished away into stars on "sky" and the bed rises into them, the stars wheel into trails, and on "repeat" it all runs backwards to 3:07. The first dawn and red line come up in the window and are swept away on "Fever" by a band of fresh burr; ink floods down on "blood"; the room pulls back into a house that creaks; the casements open on the wind and his dream self floats out into a second dawn, where she is beside him and then standing on the horizon. Back in bed he waits for the sun, and in the last hook he walks down the lane to the horizon, which comes to meet them; in the outro the plate takes the whole sheet and they meet on the red line under the sun. The whole film is at /music-videos/meet-me-at-the-horizon.',
    heroLine: 'Should I be afraid, will my troubles end',
    still: '/video-styles/album/meet-me-at-the-horizon.svg',
    status: 'motion test',
    page: '/music-videos/meet-me-at-the-horizon',
  },
  {
    slug: 'rocks-in-the-sea',
    track: 8,
    title: 'Rocks in the Sea',
    technique: 'Cyanotype',
    second: SECOND_INK['rocks-in-the-sea']!,
    journey: 'The road home, the one line on the print that is not sun-printed.',
    premise: 'A sun print: things laid on blue paper and exposed — rocks, sand, sea grass, a hometown\'s roofs, the road as it slims down into trees. White where something lay on the paper, blue where the light got in. The second ink is the ground.',
    moves: 'One shoreline the camera drifts along, and a print that is not fixed until he stays. Each noun is laid on the paper as it is sung, arriving soft and settling — but on an unwashed print never all the way. The sensitiser is brushed on and exposes to blue; the red road is drawn along the foot on "drove"; the hometown, ferns on "green", and a grey cotton cloud on "gray" that rides with the camera ("always with me"). Seaweed on the bars; a dandelion that loses its seeds on "drift away"; the things of a photogram on "things"; rain; rocks laid in the water, rings going out on "calling". The road climbs a headland into the ferns; gulls leave the trees on "hearts leaving home". The sheet opens for a swell. Tin cans on "talked to my sister", a paper chain of houses unfolding on "the things that we make", stones lifted out of the water into a cairn on "stranded … rocks … bay". On "stay" a wash crosses the print: the blue deepens to full Prussian, every edge goes crisp, the cloud rinses out. The last chorus is the first one fixed — a second road into the trees, the gulls coming home, the hometown laid on "home" — and ends on the album still. The whole film is at /music-videos/rocks-in-the-sea.',
    heroLine: 'Is the sand by the rocks in the sea',
    still: '/video-styles/album/rocks-in-the-sea.svg',
    status: 'motion test',
    page: '/music-videos/rocks-in-the-sea',
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
