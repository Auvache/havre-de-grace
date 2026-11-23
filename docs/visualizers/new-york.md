# New York — against the grain

Track 6. [/visualizers/new-york](/visualizers/new-york). Film:
`shared/video/films/grain.mjs` (`grainFrame`, `GRAIN_BEATS`, `grainMood`,
`grainPlan`). Score: `app/config/newYorkScore.ts`. **v2, 2026-11-23**, rebuilt
from the user's notes on v1. **Not yet watched by the user.** v1 (the yellow
light, the wedge of followers) is in git at `3642dcf`.

The song's core idea, from the brief: *Rebellion*.

## Decided by the user

- 2026-11-10: "The against the grain version is the best. Give me a fully
  fleshed out version on the new-york page. Make it as interesting/bold as you
  can. It should captivate attention throughout."
- **2026-11-23, on v1:** "I like the main idea, but it needs something more
  engaging/more progression. Get rid of the sun and any yellow elements. I just
  want arrows all of the same size (with one bold red arrow) doing different
  things that represent going against the grain, sometimes falling inline,
  being ridiculed, persevering, etc. I don't want a crowd to follow until the
  end. Also, the whole board should move or 'pulse' (maybe) with the beat of
  the song. I want some of the arrows to turn red at some points. Some can stay
  red, others turn back to black and follow the crowd. … Be bold!"

So: **no yellow, no light, no sun**; every arrow the same size, his bold; the
crowd follows **only in the coda**; the board pulses on the beat; reds come and
go.

## What it does

Seen from above: a crowd of identical ink arrows marching right, a step on
every beat of the click, the whole board pulsing with the beat (harder on the
downbeat, hardest in the instrumental, still where the band stops). One arrow,
the same size but bold and red, faces the other way from the first frame and
pushes upstream through all of it.

Three things happen to a red, again and again, and they are the film:

- **Ridicule.** The crowd round it turns to point at it, leans in, wags (a
  quick waggle of the heads, laughing) and jabs on the sung words.
- **Falling in line.** A red that gives in fades back to black, turns round
  with the crowd and is carried off, one of them again (it rejoins between two
  rows, a little to one side).
- **Persevering.** A rank of the crowd, packed dense, charges into a red; it
  is driven back and shakes, and does not turn.

| Time | Who | What happens |
| --- | --- | --- |
| 0:00–0:20 | Him | The march, already going as the black lifts. He holds against it. |
| 0:20, 0:30 | Him | "They say…", "That easy dreams…": mocked, the second time by a wider circle. |
| 0:40, 0:50 | A, B | On each "don't" an arrow beside him turns red and faces his way. Three of them. |
| 0:58–1:03 | B | The crowd mocks B until it gives in (1:03): black, turned, swept off. |
| 1:09 | Him, A | "They said": pointed at. |
| 1:10–1:14 | Everyone | The crowd swings five ways, one per city, and tugs at him. No lights. |
| 1:18–1:24 | A | Mocked on "That the only way to break it"; four ranks on "bargain, bend, abandon, exploit"; **on "abandon" A gives in.** He is alone. |
| 1:29, 1:39 | C, D, E, F, G | On each "don't", arrows far from him turn red on their own: three, then two. |
| 1:31–1:36 | C | Mocked; holds. |
| 1:40–1:44 | D | Mocked; gives in (1:44.4). |
| 1:50–1:51 | N1–N4 | A red ring from him on every "No", and on each of the first four another arrow somewhere turns red. "New York": the crowd surges. |
| 2:04–2:32 | Everyone | **The crowd fights back**: a rank on every bar (12), each aimed at a red. N1, F, N2, G, N3 and N4 each give in after theirs. He is hit four times and driven back across the plate; C and E are hit and hold. The last three ranks are walls the height of the plate. |
| 2:37 | C, E | On "don't" the two who held come across the crowd to him. |
| 2:39–2:45 | All three | Mocked again; nobody cares. |
| 2:47 | I1–I5 | On the second "don't" five more beside them turn red and stay: a small V of seven reds. |
| 2:58–3:12 | The crowd | **Only now does it follow.** Every "No" (thirteen) is a ring from him, and every arrow it reaches turns round to face his way, swinging its head in towards him. Each ring reaches further. The crowd slows and stops. |
| 3:13.7–3:15 | | The band stops; the march and the pulse stop dead. |
| 3:16 | Everyone | "York": the last ring takes everyone. The whole crowd marches his way, draws in behind the reds into one great "<" with them at its tip (nobody ahead of him), and the camera pulls back to see all of it. End card when the voice lets go (3:26.4). |

## Jump to

0:00 Opening · 0:12 Against the march · 0:19.8 Mocked · **0:39.4 One turns
red** · 0:57.6 Falling in line · 1:08.6 Five ways · **1:18.2 Abandoned** · 1:28.4
Reds of their own · 1:49.4 No · **2:02 The crowd fights back** · 2:30 Still
standing · **2:36.4 A red flight** · 2:57.6 They turn · **3:15.6 Everyone, his
way**. Poster 2:48.6 (the V of seven reds).

## How it is built

A pure function of the clock, planned once per score (`planFor`, about 10 ms;
a frame is about 0.4 ms and up to about 110 KB in the pull-back).

- **The march** is an endless lattice (66 × 46, 58 × 50 apart, jittered)
  sliding by `D(t)`, the flow integrated into a table at 120 Hz: a speed curve
  (`SPEED`: slow in verse 2, double in the instrumental, a surge on "New York",
  zero through the coda's stop, then backwards with him) times a step on every
  beat, in the direction `angleAt` (right, but swinging once per city).
- **The pulse** (`pulseAt`) scales the whole board about the plate's centre on
  every beat, by `PULSE[section]`, ×1.7 on the downbeat; nothing while the band
  stops.
- **Everything else is a field over the lattice**, in closed form per arrow
  per frame (`field` in `grainPlate`): ranks, ridicule, the coda's turning and
  the great arrow's shape, then room round every red.
  - **A rank** (`pl.ranks`, `RANK`, `rankMap`) is a compression wave: the
    crowd within 300 units behind its front is packed into a third of the room,
    easing back to normal by 820, so a dense column charges in with a gap
    behind it. It moves arrows only along the row.
  - **Ridicule** (`pl.jeers`) turns arrows within `R` towards the target, wags
    them at 6.5 Hz, leans them in (along the row only) and jabs on each sung
    word in the window. Arrows straight behind the target are left alone: the
    shorter way round flips there.
  - **The coda**: each "No" is a ring from where he stood on the first one
    (`pl.rings`, reach growing 92 units a No, then "York" reaching everyone).
    An arrow's turn time is judged from where it stood *when that ring went
    out*, so it turns once. **The great arrow**: a soft-plus squeezes everyone
    ahead of him and outside a widening "<" onto its edge and fades them as
    fast as they are squeezed, so the ink stays even and the edge clean.
- **The reds** (`ACTORS`) are lattice arrows taken out of the crowd at their
  moment, each a list of segments: `hold` (stand its ground, edging upstream,
  driven back for good by each rank that rams it), `beside` (with him at
  `off`), `free` (given in: easing up to the flow). The instrumental's ranks
  make whoever they ram give in, except him, C and E (`KEEP`).

### The rule that keeps it clean: reds ride between the rows

Every red, and he, keeps to a **line midway between two rows of the crowd**
(`pl.snap`), moving with the rows when they move (the cities), and `beside`
offsets are whole rows (`SY`). A row then never runs through the middle of a
red, and the room round a red (`rooms`) pushes the crowd **sideways only, on
the side it was already on**, judged from where it would have been. Before
this, rows ran straight through him and the reds, and an arrow passing
through a centre flipped sides: 96-unit jumps (twice his room) and 180° spins
at 60 fps. Two consequences:

- While a red crosses rows (stepping out of line as it turns red, going over
  to him) its room is zero (`a.room`): the crowd runs past it, overlapping for
  a moment, instead of jumping.
- A red that gives in rejoins a little off its line (±11), never on it, so it
  can never meet a red head on.

`grainPlate({ time, score, probe })` fills `probe` with every arrow drawn;
`node tools/video-styles/grain-check.mjs [from] [to] [px]` walks every arrow
frame to frame at 60 fps. As left (2026-11-23): no spins outside the
conversions, no jumps over 17 px a frame except inside the instrumental's
ranks (up to about 30 at their fronts: that is the charge) and their release.
Run it after any change.

## Soft spots, for the person watching

- **Motion and sync are judged from stills only.** Whether the pulse is the
  right size (`PULSE`: 0.6–1.5% of the board), whether the waggle reads as
  laughing, and whether a rank reads as a charge need watching with the
  record.
- **Ranks are dense** at their fronts: arrows overlap in the packed column.
  It reads as a mass in stills.
- **Many reds in the middle stretch**: up to nine reds on the plate at 1:51,
  scattered. They are small; he is the bold one.
- A red crossing the crowd to join him (C and E at 2:37, three seconds) passes
  over arrows for a moment rather than parting them.
- The great arrow's far edge fades rather than ending; at the end the body
  runs off the right of the plate.
- The "York" ring is the only full-plate red line; the earlier rings are
  thin.

## The other four proposals

The Lights on the Shore, The Signpost, Out of Time and The Chain, with their
stills, are in git before 2026-11-10
(`tools/video-styles/visualizers/new-york.mjs`, the old version of this file).
