# Conman — the heists

Track 2. [/visualizers/conman](/visualizers/conman). Film:
`shared/video/films/conman-heists.mjs` (`conmanHeistsFrame`; the modules are
in `shared/video/films/conman-heists/`, the whole film in its `film.mjs`).
Score: `app/config/conmanScore.ts`. v2, 2026-11-05, on the page and pinned
(see "Pinned" below).

v1, the city (`conman-city.mjs`, 2026-11-02), is described under "v1" below
and is still in the repo, no longer on the page.

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
