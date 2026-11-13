# Conman — the heists

Track 2. [/visualizers/conman](/visualizers/conman). **The film on the page
is the Portland rebuild** (made the default 2026-11-09; whole since
2026-11-10): `shared/video/films/conman-portland/heists.mjs` (`heistsFilm`),
the five heists on the new map with the red car, the two chases, the police
and the ending. Read "The whole film" first; "The Portland rebuild" under
it is how the map and the sites were settled, and some of what it says
about the ending has been replaced. Score: `app/config/conmanScore.ts`.

**The old film is kept** (the user, 2026-11-09): v2, the anchor town,
`shared/video/films/conman-heists.mjs` (`conmanHeistsFrame`, modules in
`conman-heists/`), on the page as `?test=anchor`. The new film borrows its
plans, people and timing from those modules, so they cannot be deleted
anyway. Everything from "Timing round" down describes v2. v1, the city
(`conman-city.mjs`, 2026-11-02), is still in the repo and off the page.

## The whole film (2026-11-10) — awaiting the user's look

Built in one pass from the user's seven notes and their answers to a round
of questions. Not yet watched by them; nothing here is approved until it is.

**Where things are.** `conman-portland/camera.mjs` (the sites, the clock `T`,
the views, the camera's holds), `story.mjs` (every route: who goes where and
when), `travel.mjs` (legs, routes, the car, the officer, trails),
`heists.mjs` (the plans and the frame). Change a time in `T`, not in a route.

**Round of 2026-11-13 (the user's "last two changes").**
- **No. 2 vanished at 1:38.4–1:39.85**: the studio plan's auditor kept v2's
  own `wait` (T3 − 0.1), which `waiting` does not override, so between the
  chase dot ending (98.4) and that wait he was nowhere. He now waits from
  98.4 like No. 1 (same spot the chase dot ends: no jump).
- **The hall is inked from 2:41.6 (was 2:42.6)**, finishing at 2:44.6 as
  before; camera, zoom and everything else unchanged.
- Checked by rendering every frame (30 fps, 0–236 s) before and after: the
  SVG differs only at 98.40–99.83 and 161.60–164.43.

**Round of 2026-11-12 (the user's three notes; not yet watched).**
- **No cars: "replace all of the cars (conmen and police) with the original
  dots".** Whoever drives is his own dot, as in the old film: the red car is
  No. 1 on the first drive and No. 4 (the driver) on the way to the hall; a
  police car is a ringed P. Routes, times and red lines are the cars' (so
  wherever this file says "car" below, read the dot). A dot is on the sheet
  only while it is somebody: a parked car leaves nothing behind. The red dot
  hands over to the plan's own No. 1 or No. 4 where it stops; a police dot
  goes as its officers step away from it (heist 2, the museum), or 1.2–1.6 s
  after it gives up, like any officer (chase 2, No. 1's ten pursuers, the one
  across the street at No. 2's arrest). At the hall the two police dots wait
  where the cars stood and are the two "drivers" who later go after No. 2
  and No. 3. Three joins were moved so a dot never jumps: the side-street
  spot at the shop is the first point of heist 1's own route (2.5 m north);
  the first drive ends in the street at the counting house's door, not 14 m
  past it (a car parked there; a dot would have had to walk back); the two
  hall officers start from where their dots waited. `car()` is gone from
  travel.mjs (it is in git at `b709b51`).
- **They leave the museum a second sooner (2:37.5, was 2:38.5) and the drive
  to the hall is a second longer**; the hall is exactly as it was (stage door
  2:44.4). The camera leaves with them (2:37.4) and is on the wide view at
  2:39.4, so the second is spent travelling: the drive is 288 px/s on the
  sheet, was 359 (363 m/s, was 453). With the camera left where it was the
  second went on creeping out of the bay and the drive was 2% slower, which
  is not what was asked. Inside the museum the second comes out of standing
  still, so nothing before it moves: the conman is 2 s at the bay's bolts
  (was 3), the auditor 1.8 s at the substation (was 2.8), and the driver,
  out of frame when he sets off, sets off a second sooner. The police at the
  museum are as they were (in at the front 2:38.5), so the crew are now a
  second clear of them.
- **The museum's north wall still "shook" at 2:17–2:18.** Not the hatching
  this time: the outer wall is one arc of 177°, and an SVG arc has no centre
  of its own (the renderer finds it from the two ends and the radius). For
  nearly half a turn the centre is 38 times as sensitive as those numbers,
  and they were rounded to 0.1 px: measured, the top of the wall jumped 2–5
  px from one frame to the next from 2:17.8 to 2:19.1, while the camera
  crept in. `annulus`/`arc` in atlas-plan.mjs now write a quarter turn at
  most to a piece, to 0.001 px (worst frame-to-frame error 0.002 px). **Any
  arc of more than about 120° written by hand needs the same.** The old film
  shares the fix.

**The clock.**

| When | What |
|---|---|
| 0:33 | The shop's owner walks off (was 0:35); the conman's dash, the safe and the way out are two seconds sooner. Out of the staff door 0:39.4, back down the side street to his car, off at 0:41.5. |
| 0:41–0:54 | The drive (No. 1's dot): Broadway Bridge, down to the counting house, stopping in the street at its door. He walks to the door by 0:55.4. |
| 1:16–1:17 | The police (one P) pull up just west of the door as the pair step out. Two officers after them on foot from 1:18. |
| 1:18–1:28 | Chase 1: east over the Burnside Bridge, north, east. The officers lose them at the last corner and run on east. |
| 1:28–1:30 | The pair lie low in the park (dashed rings), then walk to the studio; at its corner 1:38.2. |
| 2:01–2:03 | Heist 3's end: the conman out by the back door to the lane, the engineer into the street. A police car pulls up at the front 2:03.4. |
| 2:03–2:16 | Chase 2: No. 1 north (the car after him, stopped by a park), No. 2 south, No. 3 east, an officer after each; over the Broadway, Steel and Burnside bridges. The camera leaves at 2:13.6; they are at the museum (below the frame, as before) at 2:19. |
| 2:33–2:40 | The museum: the police up the drive (2:36), two officers in at the front (2:38.5); the auditor walks round to the bay; No. 4 leaves the bay at 2:37.5 (was 2:38.5). |
| 2:37–2:44 | No. 4 down Burnside to the hall, stopping at the stage door at 2:44.4. |
| 2:55 | Two police cars: one down the street the red car came by, one along the lane from the east. |
| 2:55–2:57 | No. 4, the driver, is taken at his car; he and the officer are gone by 2:57.1. He does not come back. |
| 2:58–3:04 | Five officers walk round to the five doors (stage door, two yard doors, two front doors). The performer, locked out, reaches the officer at the front at 3:06. |
| 3:08 | They go in. No. 1 up the middle of the house over the seats between the two officers coming down the aisles, and out of the door they came in by; 2 down the trap; 3 up the fly tower; 5 out of the stage door behind the officer. |
| 3:14.4 | No. 5 caught in the trees east of the hall. |
| 3:21.9 | No. 3, who hid among the trees, flushed out and boxed in on the south lawn. |
| 3:26.7 | No. 2 cornered three blocks north, a police car across the street ahead. |
| 3:08–3:45 | One even pull-out from the hall to the whole town; held there to the end card (3:52.1). No region. |
| to 3:52 | No. 1: round the hall's blocks, north-east, over the Broadway Bridge, down the riverside park, over the footbridge, and across the east side, ten police cars in turn; still running, two behind him, at the end card. |

Arrests are on beats (87.5 BPM, a beat at 0.31). 3 and 2 are four seconds
later than the user's first times, as they allowed, so they happen inside
the frame the even zoom gives.

**Decided by the user (2026-11-10).**
- The crew travel in **the red car** (1 → 2, and to the hall); the two
  chases are on foot.
- **Police cars whenever it suits**; it should be fun (a man on foot evading
  police cars, a chase sprawling across the map).
- **Red lines stay for the rest of the film** once drawn (travel lines; a
  heist's own lines inside its plan still fade when the heist is over).
- Chase 1 keeps the park hide "provided the pacing is natural".
- Heist 3's exits may spill into the chorus.
- The museum: the police **appear, but do not find or chase them**.
- No. 4 is arrested at his car and fades on the spot with the officer.
- The last zoom is **even, ends at 3:45 on the whole town, and goes no
  further** (the region, the Columbia and the mountain are out of the film).
- Nobody has to stay in frame in the ending, so long as they stay on the map.
- These replace the countdown (5, 4, 3, 2 at 3:15 / 3:23 / 3:31 / 3:40) and
  the earlier ways each was caught.

**How it is made, and what to keep.**
- **A trip's speed is set against the camera** (`trip` in story.mjs): even
  on the ground, but never more than 260 px a second on the sheet. So a car
  pulls away and pulls up gently where a metre is twenty pixels, and travels
  on the wide view. Before this an arrival read at 500 px/s during the
  zoom-in. On the sheet now: the drive 92 px/s, chase 1 110, chase 2 110,
  arrivals 260 falling to a stop. **The drive to the hall is 288** (was
  359 until 2026-11-12, when the user gave it a second more): 1.8 km in
  6.9 s. It is still the one fast trip.
- **Chase 2 is seen at 131 m/s and finished unseen**: once the camera has
  left (2:16) the three cover the rest at 450–500 m/s, so the line is whole
  for the last pull-out and they are standing at the museum on time.
- **No. 1's speed is the camera's**: 200 px/s on the sheet, so up to 420 m/s
  by the time the whole town is in view. His route has a kilometre to spare
  at the end card.
- **The camera is still while anyone travels**: plan → a wide view that
  holds the whole trip → plan (`HOLDS` in camera.mjs).
- **Hatching is ruled on the ground** (`hatchAt` in heists.mjs; atlas.mjs
  `hatch`, atlas-plan.mjs `hatchFixed`). The museum's north wall "shook" at
  2:19 because brick was ruled on the screen and slid against the wall while
  the camera settled. At every hold it is exactly as it was (checked: a line
  every 3.2 px in the town, 3 px on a plan's walls); between holds it moves
  and scales with the buildings and thins by halves. The old film and the map
  tour are untouched (they pass no `hatch`).
- **Dashes are fixed to the ground** (`trail`, `sRef`), so a dashed line
  does not creep during the pull-out.

**The check.** `node tools/video-styles/conman-explore/check-routes.mjs`
samples all 43 movers every 20 ms: nobody in the water off a bridge, nobody
in a building (a heist's own only by its doors: steps flagged `'in'` or
`'jump'`), no car in a park or on the footbridge; it prints each one's
speeds and whether those who must be seen are in frame (`MUST_SEE`). All
clear on 2026-11-10. Run it after any change to a route or to the camera.

**Not done / to ask.** The user has not watched it. Likely questions: whether
one police dot arriving and its officers appearing beside it reads (at the
hall four appear round the first); whether No. 5's "park" (the trees in the
hall's own grounds; the next park east is out of frame at 3:14) is what they
meant; whether the two crew lines that share Burnside read. The dev server
for this repo was on **port 3010** that day (3000 was another project).

## The Portland rebuild (2026-11-09) — how the map and sites were settled

The user likes the five heists as they are. What does not work is the map
("the anchor outline just doesn't feel right") and the pacing of the police
chases; the film should look cohesive. v2 stays on the page while a new film
is built beside it on a new map.

**What the profile of v2 found** (every chase route sampled every 50 ms):
- Heists are drawn with the frame 60–180 m wide and chases with it 0.6–2 km
  wide, jumped between in 2–3 s; each plan floats on nearly blank paper.
- All five sites sit inside about 600 × 900 m.
- Speeds are inconsistent: on foot 77 m/s (chase 1), up to 195 (chase 2),
  34–53 (finale); a car 153 in the getaway and 64 in the finale.
- The police only follow (each officer's route is the runner's, a few
  seconds late): about 130 m back in chase 1, 250 m in chase 2.
- Chase 1 has 7.6 s and chase 2 has 5 s of running with nobody behind them.
- In the finale every officer, both police cars included, spends 1.7–2.6 s
  inside buildings (dropping the dotted cut-through points from a runner's
  route leaves a straight line across the block), and the chase 2 officer is
  in the river for 0.4 s at 135.6.

**Decided by the user (2026-11-09):**
- **The map is "just based on Portland"**, north-up, not to exact scale, the
  Willamette through it and its bridges on it. **Nothing is named**: it is
  not revealed as Portland until the end.
- **Sites are spread out, for map coverage**; one or two west of the river.
  They need not be music venues or prominent places, though it is good if
  each is a place of art or making (Powell's Books was the example). Heist 1
  is by the Haymaker (1233 N Killingsworth); **heist 5, the concert hall, is
  by Revolution Hall** (1300 SE Stark). The Moda Center is no longer the end.
- Still five heists and three chases; chases run between the sites or
  anywhere on the map.
- **Hard rules for every route:** nobody ever goes into the water (bridges
  only); nobody passes through a building, on foot or driving: streets,
  alleys and parks only (this replaces "through buildings by their doors").
  A chase works like a real one: they lose the police by hiding in a park or
  behind a building.
- The crew drive between sites and go on foot for the last blocks and the
  hiding; the police have cars too.
- Old trails fade after each section.
- **The ending, after the last heist, counts down.** No. 5 is caught first
  and is the central figure; the camera pans quickly to wherever No. 4 is,
  running or driving, and a couple of seconds later he is caught; then 3;
  then 2. It ends on No. 1 running while the camera pulls out to the whole
  city and on to the region, drawn with less detail: the Columbia River,
  maybe Mount Hood. No. 1 is never caught. That is the (soft) reveal that it
  is Portland. This replaces "the chase never ends, two caught".

**Rules proposed with the profile and not objected to:** one walking, one
running and one driving speed for the whole film; police chase what they can
see, and the crew are lost only after a few seconds out of every officer's
sight with trees or a building between; every chase has at least three beats
(spotted, a near miss or cut-off, the hide) and nobody runs unpursued for
more than about 3 s; three camera distances only (plan, street, city), with
the city drawn around each plan; a script checks every route against water
and building footprints.

**Sites: B, museum in the hills** (picked 2026-11-09 from three sketches;
the labelled sketch is still on the page as `?test=sites-b` until the map is
settled). North–south is squeezed outside the middle so the far north and
south fit the frame.

| | 1 Record shop | 2 Counting house | 3 Studio | 4 Museum | 5 Concert hall |
|---|---|---|---|---|---|
| **B (the pick)** | the Haymaker, N Killingsworth | Powell's Books, W Burnside | Alberta Rose, NE Alberta | Pittock Mansion, West Hills | Revolution Hall, SE Stark |
| A · Museum downtown | the Haymaker | Powell's Books | Alberta Rose | the art museum, Park Blocks | Revolution Hall |
| C · Four corners | the Haymaker | Alberta Rose | Powell's Books | Artichoke Music | Revolution Hall |

The way between them in B: the drive 1→2 over the Broadway Bridge; chase 1
(2→3) over the Steel Bridge and up through the north-east; chase 2 (3→4)
back over the Fremont Bridge and up into the hills; the getaway 4→5 down
Burnside and over its bridge. The east of the map has no site: No. 1's last
run covers it.

**Second round of answers (the user, 2026-11-09):**
- **The record shop is redrawn to fit its corner** (an ordinary street
  corner, not a traffic circle); the heist itself stays, fitted to the new
  building.
- The Moda Center is part of the general map and not marked out in any way
  (the arena's footprint is one more building by the river).
- The map is today's Portland (the Tilikum crossing is on it; drawn as a
  footway, no cars, which is true of it).
- **The countdown's clock:** a second more for each capture than first
  proposed, leaving twelve seconds for No. 1 and the pull-out: No. 5 caught
  by about 3:15, No. 4 by 3:23, No. 3 by 3:31, No. 2 by 3:40, then No. 1 to
  the last hit at 3:52 (each to be landed on a beat). The only captures in
  the film are these, after the last heist.
- **Numbers are by when they joined**, so the last in is the first caught:
  4 is the driver (joined at the museum), 5 the stagehand. (v2 has those two
  swapped in the last heist.)
- **Each is caught a different way**, and each further from the hall than
  the last: 5 at the stage door or very close to the building, 4 boxed in on
  a bridge by police cars from both ends, 3 found hiding in a park, 2
  cornered at a dead end by the river, over the water from the hall.
- **No. 1 has no destination**: on foot, at a dead sprint the whole time,
  all over the city in a frenzy (north, then west, then south, zig-zagging)
  with three police cars after him as the camera pulls out. He gets away
  through parks and alleys and over the footbridge, where cars cannot follow
  (the Tilikum crossing carries no cars; the user liked that detail).
- **Nothing is written on the regional map**: no title block, no names.
- **The two hides are different:** a park in chase 1; behind a building or
  down an alley in chase 2. **The garage is gone**: hiding inside a building
  is not allowed.
- **Cars.** The crew in a car are one red car with no numbers; their dots
  disappear as they get in and reappear as they get out. A police car is the
  same in the police's own colour as it is now (the ink and paper of the
  ringed P), not a new blue.
- **The police escalate**: one car in chase 1, two in chase 2, many in the
  finale.
- The museum's near miss stays, and they get away.

- **The map is approved** ("looks great"; the tour "is perfect"). **No
  labels on it, ever:** no sites, bridges or roads named or numbered.

**The heists on their lots** (`conman-portland/heists.mjs`; the film on the
page since 2026-11-09). The five heists are v2's, with the same rooms, people and
timing, each pinned to its verse; between them the camera crosses the town
alone for now.
- **The record shop is v2's plan unrolled** onto a straight corner building
  (an arc of radius R at angle θ becomes x = (−28 − θ) × 0.7636, y = 49.5 −
  R) and turned over left to right, so the staff door opens onto the side
  street and not into the neighbour. Same bins, counter, office, safe and
  route; the camera no longer turns. He comes up the side street from below
  the frame, turns the corner and stands outside from 21.6.
- The counting house, studio, museum and hall are moved as drawn (their own
  origins are `O2`–`O5`). The studio's back lane is now the side street; the
  museum sits inside the hilltop ring (72 m, as before); the hall's stage
  door is on the street and its fan faces its own park.
- Street and place names are taken off the plans; room names and the atlas's
  construction marks stay. The police are out of the keys of jobs 4 and 5
  until the chases are built.
- A check samples every crew member and figure of every heist every 50 ms
  against the river and the town's building footprints: all clear.
- **Next:** the drive 1→2, chase 1, chase 2, the museum's near miss, the
  getaway, the police in the last verse, and the countdown, each on routes
  held to the rules (one walking, one running and one driving speed; streets,
  alleys and parks only; water only by bridge), with the red car and the
  police car.

**The map, first pass** (`conman-portland/city.mjs`, `atlas.mjs`, `map.mjs`;
on the page as `?test=map`, a tour on the song's clock that sits where each
part of the film will happen, at the distance it will be seen from):
- **A miniature.** Places are set from their real latitude and longitude,
  north–south is squeezed outside the middle, and the plan is drawn at 300
  film metres to a real kilometre, while buildings, streets and 80 m blocks
  stay life-size. So a plan at 20 px a metre and the whole city at 0.4 px a
  metre are one drawing, and the sites are 700–1,900 m apart (v2's were
  190–800 m). The sheet is 3,830 × 1,940 m: about 820 blocks, 6,700 lots.
- **What is on it:** the river and its nine bridges (Fremont, Broadway,
  Steel, Burnside, Morrison, Hawthorne, Marquam, Tilikum, Ross Island); the
  downtown grid turned twenty degrees to the river, the true-north grid
  everywhere else; the West Hills with contours, forest and winding streets;
  the hilltop ring for the museum; the freeway loop, the freeway up the
  gulch, Sandy's diagonal; the park blocks, the waterfront, Ladd's X, Lone
  Fir, Laurelhurst, Irving Park, Mount Tabor, Ross Island.
- **Each lot has its neighbours**: the shop, the counting house and the
  studio stand in a built-up block, hatched buildings against both sides;
  the museum and the hall stand in their own grounds, among trees.
- **Detail by distance.** Plan, street and city show every lot; past about
  5 km across, blocks only, and what lies beyond the sheet: suburbs thinning
  in patches, the Columbia across the north with the Willamette running up
  to meet it, and the mountain in the east as contours (brought in to about
  half its true distance).
- Everything static is in `lib` (1.3 MB, mounted once); a frame is about
  8 KB of `<use>`s. The numbers on the lots are for planning only.

## Timing round (2026-11-06)

**The rule (the user):** the start of every heist — the plan whole, the crew
standing outside — lands a second or so before the verse, and the dots go in
as the singing starts. Heist 2 was the model (at the door 55.6, in on "Oh,
I'm a conman" 55.75). The dots are controlled: they only run from the police
or in long transit between heists, and even then they ease to a stop at a
door; nothing rushes to start a heist.

What changed:

| Heist | Before | Now |
|---|---|---|
| 1 · shop (verse 23.28) | The black lifted onto a held, empty view until 16; zoom 16–23.3; plan drawn 18.5–23.3; he went in the instant it was whole. | The camera is already turning in when the black lifts (zoom 11–17.2); the plan is drawn 15.2–20.4 as the lot fills the frame; owner and title by 21.6; he stands on the circle from 21.6 and goes in at 23.3. |
| 2 · counting house | The auditor arrived on the first line and sat upstairs through the whole dig; nothing moved during the drilling. | He comes along Main Street from 61, through the banking hall, and sits down with the partner at 66.3, a second before the wall gives (67.35). |
| 3 · studio (verse 99.95) | They left the park at 92.4 after the officer passed and ran 650 m at 90 m/s (faster than the chase) to arrive at 100.0 while the plan was still inking. | They slip out at 90.8, as soon as he has run past them up High Street, take the direct street east at the chase's own pace (75 m/s), ease to a stop at the door by 98.4 (the auditor 98.85), and go in at 99.95. The studio inks 95–98 as the camera lands at 98.4. |
| 4 · museum (break 140.2) | Arrived at 140.2 and went straight in; the museum popped in whole. | Into the plant by 131.4; the officer loops it 132.3–133.8 (the building on his left); they slip out at 133.2 while he is round the west side; at the museum door by 139.2 (the others 139.5, 139.8), easing in; the drum is drawn on 137.2–138.9 as the camera lands; in at 140.2. |
| 5 · hall (verse 165.45) | The car was still on High Street when the verse began; the hall popped in whole at 165.8; crew went 166.3–166.8. | The whole museum job and the police near-miss play 1.6 s earlier; the car leaves at 158.4 and stops at the crown at 164.5 (where the crew start, not 6 m short); the hall is drawn 162.6–164.6 as the camera lands; the conman stands there until the verse; driver goes at 165.45, the others 165.55–165.95, the stagehand 167.2. |

**Chase 2's speed.** The Crescent is the only way from the studio's bank to
the plant's that does not retrace Main Street (the river is between them), so
it stays. The two legs are evened out instead of 150 and 120 m/s: studio →
plant 148 m/s, plant → museum 100 m/s with slow ends. Chase 1 runs at 75 m/s;
the museum → hall drive at 150 m/s is the fastest thing left, with the police
car right behind and the camera riding with it.

**How it is built.** A crew member with `wait` (atlas-plan.mjs) stands at the
start of his route from then until `from`. `inked()` (sequence.mjs) now draws
arc walls too, so the drum and the fan are drawn on like the others. Heist 4's
times are written as before and shifted by `EARLY4` in film.mjs.

## Story round (2026-11-06, later the same day)

Decided by the user, after watching the timing round:

- **Numbers upright.** In the two turned stretches (heist 1's level shop,
  the bridge) the crew numbers and letter marks are turned back to read
  upright (`upright()` in motion.mjs). Room labels still follow the sheet.
- **Heist 2 makes sense now.** The partner's office is over the strongroom,
  so he is the one who would hear the drilling. The auditor arrives on the
  first line as before, goes straight up to him, and walks him out of the
  front door and off east along Main Street (to lunch) at 62–66, before the
  digging starts at 59.9 they are already on their way. They are off the
  sheet until the conman is out, and the auditor brings him back to the door
  at 77. The partner is an owner with a `route` (a timed path), not a pacing
  loop.
- **Heist 3: never seen.** You (Y) have a dotted sight fan (9 m, 30° either
  side), ahead of you as you walk and where you look while you stand (the
  mic, the piano, the desk). The conman trails you the whole way and is never
  in it; the auditor takes the tapes by the back lane while you are in the
  studio; the engineer rolls tape in the control room while you play and
  waits in the offices as you pass, then leaves by the front. Every point is
  pinned to the record (`schedule` in atlas-plan.mjs: a point may carry `at`
  and `look`), and a scratch check sampled every 50 ms confirms no crew head
  is ever inside the fan (nearest 10 m). The pair wait west of the entrance,
  out of your path, not at the door.
- **Chase 2 hides in a garage**, not the pressing plant: the car goes in
  under the shutter, the shutter comes down behind it (131.9), the officer
  walks round the building and they leave by the back door while he is round
  the west side. Same spot, route and timing as before.
- **Heist 5 is the swap.** The performer (S, a ringed S in ink; the police
  keep their P) plays the first song. The stagehand, on the lighting board,
  kills the lights between songs (176.0); S goes out of the stage door for
  air; the auditor, up through the trap in the dark ("split the ground"),
  bolts the door behind him; the engineer, down the fly tower ("pierce the
  sky"), has the curtain down for the swap and up for the last line; the
  conman, who bought a ticket and watched from the house, is centre stage
  with the lights on him on "all the eyes" (182.3). S, locked out, walks
  round to the front, meets an officer at the stage door on the way, and at
  188.0 the officer sees the conman from the foyer.
- **The police search through the verse**: one down High Street trying
  doors (he meets S), one along the Crescent from each arm looking in at the
  yard doors (short 14 m fans at that scale).
- **The final chase never ends.** The five scatter down the anchor's strokes
  with an officer after each (five officers: the three searchers and two
  cars), the camera pulls out fast at first (`easeOut`) so nobody is ever
  out of frame, and the chase is still on at the end card. The engineer is
  caught at the tip of the east fluke (220.4) and the stagehand at the west
  ball after going round it (221.4), each ringed in ink; the conman goes
  round the ring and keeps going round, the auditor leaves west over the
  Main Street bridge, the driver east over the other. The red still completes
  the anchor by 223.5 and the career's title block comes up as before.

## Third round (2026-11-06, evening) — and the finale tests, pending

The user's notes after the story round, and what was done:

- **Heist 1, the arrival.** He comes up from straight below the turned frame
  (a red line from off the sheet, 19.2–21.6) and stands where he stood
  before, outside the shop, until the first line.
- **Heist 1, the choreography.** The owner goes to the stock room for a box
  first, on "Bottled lightning" (35.0); the conman waits at the counter until
  the owner is at the stock-room door and about to turn in (36.6), then goes
  round the counter at a run, grabs the masters (38.2–39.0) and is out of the
  staff door by 41.4, waiting there for the car (42.3). The route is pinned
  in shop.mjs; the owner's in motion.mjs.
- **Chase 2.** The run to the garage is fast (6.8 s round the Crescent, in
  by 129.4) so the stay reads: the engineer pulls the shutter down
  (130.3–131.0, `SHUTTER` 130.6), the three wait among the cars while the
  officer walks round (131.6–133.1) and gives up, and they go out of the
  back door at 134.0, up to the museum by 139.2 as before. Each has his own
  path inside the garage.
- **The museum's walls.** The slow push through the job made the hatched
  poché crawl ("the north wall is shaking"). The camera is held dead still
  on the museum from 139.2 until the getaway. The same hatching crawls
  anywhere a plan is pushed slowly; the other jobs' pushes have not been
  complained of.
- **The finale: D · One at a time** (picked 2026-11-06 from C, then from
  D/E/F; all the alternatives are gone and the page is one film again).
  The officers are already about and give chase as they see them: the three
  searchers go straight on into the chase, and two police cars have been
  about since 178, one down High Street trying doors (parked 50 m short of
  the stage door), one along the Crescent from the east, pulling up behind
  the getaway car. The five leave one by one at different speeds:
  - the driver first (187.0), as the police car pulls up behind his — east
    along the Crescent, the fluke road, the studio's back lane, Main Street,
    over the bridge and round the east bank, the police car a length behind
    the whole way;
  - the stagehand out of the stage door at 188.8, through the trees west of
    it into the bushes, found there at 195.4 (ringed);
  - the auditor out through the green room's doors at 189.0, west over the
    Crescent bridge, round the garage block (the shutter is down) and away
    west over the Main Street bridge, clean away;
  - the engineer through the dressing room's doors at 189.2, slowly through
    the blocks east, up the east arm, the studio's lane, Main Street, back
    west over the Main Street bridge and round the ring to the end;
  - the conman last: he holds the stage until the officer from the foyer is
    at its edge, bolts out of the stage door at 190.6, east along the lane,
    through the blocks and the park, over the High Street bridge, round the
    ring and east over the Main Street bridge, away up the east bank.

  **Rules the user set (2026-11-06):** they may cut through trees and parks
  and zig-zag through buildings, but never hop in the water and never pass
  through a wall: a plan-drawn building (the hall, the studio, the garage) is
  entered and left by its doors; a town lot is crossed as a thin dotted step
  (the `jump` flag on a `timed` point); the river is crossed only on the
  three bridges (Main Street, High Street, the Crescent). A scratch script
  checked every segment of every route against the river's outline. The
  cars keep to streets (`streets()` drops the dotted steps for an officer in
  a car).

## Pinned (2026-11-05): where to pick up

The user put v2 on the page as the main film and paused the work. What it
does, section by section, is under "The whole film, end to end" below.

Open when it resumes:
- (Settled 2026-11-06: the chase never ends; two are caught, never the conman.)
- Every set of alternatives comes as three motion tests on the page
  (`VisualizerMotionTests`), never screenshots or mp4s.
- The tools that drew the review sheets and stills are in
  `tools/video-styles/conman-explore/` (`shoot-heists.mjs`,
  `motion-stills.mjs`, …).
- The unpicked heist variants are still in `conman-heists/heists/`. The motion
  tests (`motion.mjs`, `sequence.mjs`, `chase1.mjs`) hold the picked pieces the
  film is built from.
- When v2 is final: delete `conman-city.mjs` and its entries in `frames.mjs`
  and `mp4.mjs`, and render the mp4 only if asked (`FILM=conman-heists
  SONG=conman`).

## v1, the city

## What it does

The mark drawn on, the title drawn on, then the black lifts off a town plan,
close on one empty lot, and the first plan is drawn into it wall by wall. Five
jobs, each in its own empty lot, each harder than the last: a record shop, a
counting house ("cooking books"), a studio ("here to steal your sound"), a
museum through the break, and a concert hall, where one of the crew comes up
through the trap, one comes down the fly tower, and the conman walks in the
front, buys a ticket and stands centre stage with all the eyes on him.

Each getaway is a red line through the streets to the next empty lot. What gets
taken turns up later, in green and unlabelled: the record from the shop on the
studio's desk, and the hall holding all of it. In the last chorus the crew leave
the hall round both sides of the crescent while the camera pulls back to the
whole town, and the red they have left all song is the band's anchor. On the
last hit, the mark.

## Jump to

| Time | Label | What happens |
| --- | --- | --- |
| 0:00 | Opening | The mark drawn on, then the title, then the black lifts off the town, close on an empty lot. |
| 0:12 | The record shop | The first plan drawn into the lot, wall by wall; on "I'm a conman" he walks in, browses, talks shop, and takes the masters out the back. |
| 0:42 | First getaway | Round the roundabout and down Main Street to the next empty lot. |
| 0:50 | The counting house | A customer opens an account while the auditor cooks the books and empties the vault. |
| 1:17 | Chorus | Round the other roundabout and down the High Street to the studio. |
| 1:31 | The studio | You sing and play; the shadow follows you, the taker steals your sound. The record from the shop is on the desk. |
| 2:02 | Chorus | Up the High Street and round the circus to the museum in its garden. |
| 2:15 | **The museum** | The break: the last tour, the power cut, down the skylight, the portrait swapped. |
| 2:40 | To the hall | Straight down the High Street to the concert hall on the crescent. |
| 2:45 | **The concert hall** | Up through the trap, down the fly tower, and the conman centre stage with all the eyes on him. Everything taken before is in the building. |
| 3:08 | **The anchor** | Two cars, one round each arm of the crescent, and the camera pulls back until the whole town is in: the red is the anchor. The mark on the last hit (3:52). |

The poster frame (before play) is 1:06: the counting house mid-job.

## Decided by the user (2026-11-02)

- The theme, kept under the radar and never cheesy: "we steal from the artists
  and artwork we love". Music shows only in what rooms are called, never in
  decorative icons.
- Jobs: record shop → counting house (the royalty/ledger office; "cooking
  books") → studio → museum (the break) → **concert hall** (chosen over a
  bank/"Reserve" or a master-tape archive). Crew come up the trap ("split the
  ground"), down the fly tower ("pierce the sky"); the conman takes centre
  stage ("all the eyes").
- **The town's streets are the anchor** (chosen over a plain grid; "be bold").
  The getaways' red reads as the anchor only at the final pull-back.
- Earlier loot reappears in green, unlabelled, in later plans (the hall holds
  all of it).

## Under review (2026-11-05)

A redesign, explored in `tools/video-styles/conman-explore/` and moved into `shared/video/films/conman-heists/` when it went on the page.

**Decided by the user:**

- The town is a real city on Portland's pattern, with the anchor in its streets.
- The style is the **insurance atlas**, and the water is a breath of blue
  (`#c6d1d4`).
- The **river** is thin and cuts diagonally across the town, north-east to
  south-west. No job is on it (2026-11-05): it comes down between the ring's
  hill and the east circle, crosses Main Street a block east of High Street
  (where the getaways cross a bridge), and leaves over the Crescent's west arm.
  The old loop of land is the core now, edged by a boulevard, the Loop.
- **Six jobs**, each by one of the anchor's features. The picks:

  | Job | Site | Pick |
  |---|---|---|
  | 1 · The record shop | the west circle | C · On the circle |
  | 2 · The counting house | the east circle | D · Through the floor |
  | 3 · The studio | the east fluke, on land | A · The studio, as drawn |
  | 4 · The pressing plant (new) | the west fluke, on land; chorus 2, 1991 | A |
  | 5 · The museum | the ring | A · The drum |
  | 6 · The concert hall | the crown | A · The fan |

  - Job 3's taker comes up the back lane, not by water.
  - Job 4's copies leave on a lorry at the dock.

**The record shop's motion: D · Around the circle** (picked 2026-11-05).
The camera comes in turning round the west circle until the curved shop sits
level, and turns back to north-up for the getaway. The user loves the
conman's route through the shop. Out of the staff door he goes **straight to
the next job, with no pause**: he leaves at full pace, crosses the Main Street
bridge and slows only at the counting house's neighbour's door (50.6). The
pull-back stays.

**No captions on the plans** ("talks shop", "opens the safe"…): routes and
people only. `atlas-plan.mjs` draws notes only for a job that sets
`notes: true`.

**Heist 2, fleshed out (`job2.mjs`).** The empty shop next door shares the
counting house's party wall, and the true ledgers are in a strongroom under
the partner's office.
- The conman arrives straight from the record shop, lets himself into the
  empty shop and goes down to its cellar.
- He digs at the party wall, and the wall gives on "Until the Earth shook"
  (67.3).
- He swaps the ledgers and is out and away east toward the studio by 76.
- The auditor arrives on the first line, goes up to the partner (whose
  office is over the strongroom) and takes him out to lunch along Main Street
  before the digging starts; both are back at 77 (the story round,
  2026-11-06). Earlier that day he sat upstairs through the dig, which made
  no sense: nothing kept the partner away from the drilling.
- The partner and his staff are drawn in ink: the guard paces the banking
  hall and the clerks sit at their desks.

**How alternatives are shown for this visualizer (the user, 2026-11-05):**
always as motion tests on the page, in `VisualizerMotionTests` under the
film. There are three alternatives, all on one clock looping their stretch of
the song, shown one by one or side by side. No separate screenshots or mp4s.

**Heist 1 into heist 2: B · Over the bridge** (picked 2026-11-05;
`sequence.mjs`, `seqBridge`).
- The camera pulls up high over both circles and the river as he crosses the
  bridge. It keeps turning as it comes down, so the shop's tilt unwinds onto
  the counting house.
- His drive takes the whole landing. He reaches the empty shop's door as the
  camera settles, and heist 2 starts on "Oh, I'm a conman" (55.75). (The
  auditor arrived on the same line until 2026-11-06; he now comes during the
  dig, above.)
- No shake. The conman from heist 1 is #1 in heist 2.

**The years** follow the first six Led Zeppelin albums, with 1968 (the
formation and the first record's sessions) for heist 1:

| Heist | Year |
|---|---|
| 1 | 1968 |
| 2 | 1969 (*II*) |
| 3 | 1970 (*III*) |
| 4 | 1971 (*IV*) |
| 5 | 1973 (*Houses of the Holy*) |
| 6 | 1975 (*Physical Graffiti*) |

**The pacing of the film (the user, 2026-11-05):**

| Section | Content |
|---|---|
| Verse 1 | Heist 1 |
| Verse 2 | Heist 2 |
| Chorus 1 | Police chase 1 |
| Verse 3 | Heist 3 |
| Chorus 2 | Police chase 2 |
| Instrumental break | Heist 4: the police almost catch them, the most chaotic heist |
| Last verse | Heist 5 |
| Last chorus | The final chase: the police after them as the camera pulls out for the end. Whether they escape is undecided. |

That is five heists against six sites and six years: which job is dropped
or merged is an open question.

**Police chase 1: A · From above** (picked 2026-11-05; `chase1.mjs`). The
user followed all the suggestions for five heists:
- Heist 4 is the museum in the break, where the police almost catch them.
- Heist 5 is the concert hall in the last verse.
- Their years are 1973 and 1975; the sheets are numbered 1/6–5/6, with the
  career as 6/6.
- The pressing plant is the hiding place in chase 2, not a job.

**The whole film, end to end** (2026-11-05): `conman-heists/film.mjs`
(`conmanFilm`, exported as `conmanHeistsFrame`), the film on
`/visualizers/conman`. The old city film is untouched in
`shared/video/films/conman-city.mjs`.

| Time | Section | What happens |
|---|---|---|
| 0–12 | | The shared opening (lifted from conman-city.mjs). |
| 12–42.3 | Verse 1 | Heist 1, the record shop, D. |
| 42.3–77 | Verse 2 | The drive over the bridge and heist 2, B. |
| 77–99.95 | Chorus 1 | Chase 1, A. They slip out of the park behind the officer at 90.8 and stand at the studio's door from 98.4. |
| 99.95–122 | Verse 3 | Heist 3, the studio (A, as drawn). You walk in, sing, play and listen back, your sight a dotted fan; the conman trails you and is never in it; the auditor takes the tapes by the back lane; the engineer rolls tape and hides in the offices as you pass. |
| 122–140.2 | Chorus 2 | Chase 2, filmed from above like chase 1. Out of the studio's back lane, round the whole Crescent, up the west fluke road into a garage, the shutter down behind them. The camera dips to it while the officer circles the building, his sight sweeping; they slip out of the back door while he is round the far side. Along Main Street and up High Street to the museum, standing at its door from 139.2 while the drum is drawn. |
| 140.2–158.4 | The break | Heist 4, the drum. The police almost catch them: an officer up High Street and in at the front, through the rotunda to the bay a breath too late; a car round the Circus reaching the bay as the getaway pulls away. |
| 158.4–164.5 | | The getaway down High Street to the crown, the police car lost at Main Street; the hall drawn as the camera lands. |
| 165.45–188 | Last verse | Heist 5, the fan hall: the conman takes the performer's place on stage between songs (lights out, S locked out of the stage door, curtain down and up); the police search the Crescent and High Street and an officer sees him from the foyer at 188. |
| 188–232.1 | Last chorus | The final chase. The five scatter, each down one stroke of the anchor (the shank and the ring; each arm and its fluke; the stock and each ball) with an officer after each. The camera pulls out to the whole town and their red completes the anchor; two are caught (the engineer at the east fluke, the stagehand at the west ball), the rest keep running, and the chase is still on at the end card. The career's title block comes up at 223.5. |
| 232.1 | | The end card on the last hit. |

Earlier jobs stay as finished sheets with their routes. Chase 1's zigzag
fades once it is over, and the police's trails fade after each chase.
Getaways on the anchor's own strokes stay red.


## History

The plans began as twelve-frame stills in three treatments (blueprint, sheets,
city); the city is the one the film grew from, when its last job was still the
Reserve, a bank. Those stills and the earlier printmaking films (the engraving,
the wall, the boards) were deleted on 2026-11-05 and are in git at `2e46d3c`.
