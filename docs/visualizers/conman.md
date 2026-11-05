# Conman — the heists

Track 2. [/visualizers/conman](/visualizers/conman). Film:
`shared/video/films/conman-heists.mjs` (`conmanHeistsFrame`; the modules are
in `shared/video/films/conman-heists/`, the whole film in its `film.mjs`).
Score: `app/config/conmanScore.ts`. v2, 2026-11-05, on the page and pinned
(see "Pinned" below).

v1, the city (`conman-city.mjs`, 2026-11-02), is described under "v1" below
and is still in the repo, no longer on the page.

## Pinned (2026-11-05): where to pick up

The user put v2 on the page as the main film and paused the work. What it
does, section by section, is under "The whole film, end to end" below.

Open when it resumes:
- Whether they escape at the end (for now they vanish into the anchor).
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
- The auditor sits upstairs with the partner the whole time, reading the
  books aloud over the noise.
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
  camera settles, and heist 2 starts on "Oh, I'm a conman" (55.75), the
  auditor arriving on the same line.
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
| 77–100 | Chorus 1 | Chase 1, A. |
| 100–122 | Verse 3 | Heist 3, the studio (A, as drawn). The conman and the auditor are the shadow and the taker, the engineer joins, "you" in ink. |
| 122–140.2 | Chorus 2 | Chase 2, filmed from above like chase 1. Out of the studio's back lane, round the whole Crescent, up the west fluke road into the pressing plant to hide among the presses. The camera dips to it while the officer circles the building, his sight sweeping, and gives up. They slip out by the dock, along Main Street and up High Street to the museum. |
| 140.2–160 | The break | Heist 4, the drum. The police almost catch them: an officer up High Street and in at the front, through the rotunda to the bay a breath too late; a car round the Circus reaching the bay as the getaway pulls away. |
| 160–166 | | The getaway down High Street to the crown, the police car lost at Main Street. |
| 166–188 | Last verse | Heist 5, the fan hall, five crew. |
| 188–232.1 | Last chorus | The final chase. The five scatter, each down one stroke of the anchor (the shank and the ring; each arm and its fluke; the stock and each ball) with three officers falling behind. The camera pulls out to the whole town and their red completes the anchor; they fade into it, so they escape, just, and the career's title block comes up. |
| 232.1 | | The end card on the last hit. |

Earlier jobs stay as finished sheets with their routes. Chase 1's zigzag
fades once it is over, and the police's trails fade after each chase.
Getaways on the anchor's own strokes stay red.


## History

The plans began as twelve-frame stills in three treatments (blueprint, sheets,
city); the city is the one the film grew from, when its last job was still the
Reserve, a bank. Those stills and the earlier printmaking films (the engraving,
the wall, the boards) were deleted on 2026-11-05 and are in git at `2e46d3c`.
