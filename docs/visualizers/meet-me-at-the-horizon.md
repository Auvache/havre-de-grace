# Meet Me at the Horizon — two films

Track 7. [/visualizers/meet-me-at-the-horizon](/visualizers/meet-me-at-the-horizon)
carries **two whole films of the same night**, switched with the Film row above
the player (`?film=monkey-brain` opens the second): **Constellations** and
**Monkey Brain**. Score: `app/config/meetMeAtTheHorizonScore.ts`. The song's
core idea, from the brief: *Sleepless nights*.

## Decided by the user (2026-11-10)

> Meet me at the horizon: constelations and monkey brain are both great ideas.
> Flesh out full videos for both of them and put them both on the page.

Both were built in one unattended run from their stills, applying what Into the
Wild and Conman settled (one simple picture, one red thing that travels and has
a will, every event on a measured word, the standard opening and end card).
**Neither has been watched by the user yet.** When one is picked it becomes the
film: delete the other module, the Film row on the page and its `frames.mjs` /
`mp4.mjs` entries.

The third direction of that round (Nightmares) and the first five ideas (The
Sleep Study, Star Trails, No Counting Sheep, The Ceiling, Two Lights) were
dropped with their stills on 2026-11-10; they are in git before that commit
(`shared/video/films/horizon.mjs`, `tools/video-styles/visualizers/`).

## Constellations

Film: `shared/video/films/constellations.mjs` (`constellationsFrame`,
`CONSTELLATIONS_BEATS`, `CONSTELLATIONS_POSTER`; `FILM=constellations
SONG=meet-me-at-the-horizon` in `frames.mjs` / `mp4.mjs`). Score:
`app/config/meetMeAtTheHorizonScore.ts`. v1, 2026-11-10, built in one unattended
run from the stills the user called "a great idea". **Not yet watched by the
user.**

### What it does

One sleepless night on a star-atlas plate: the night sky over a black ridge,
the hour in the corner running from half past eleven to six. The whole sky
wheels slowly about a pole below the horizon for the whole song, like the disc
of a planisphere behind its horizon mask: stars rise on the left and set on the
right, and everything drawn on the sky (figures, their lettering, the atlas
grid) turns with it and tilts as it goes.

His mind is one red point, the pen. It wakes on a star when the black lifts.
In the verses it races: it jumps from star to star on every sung word and
leaves a thread that fades in a couple of seconds. When a line names a thing,
the pen joins stars that were already there into it, one stroke per sung word,
finishing on the word that names it, and the atlas letters it in Latin: the
sheep he isn't counting, the moon, the bed, an hourglass, the clock, the tree,
the dawn, the eye, the spine, the house, the window, him alone. The newest ink
is red and cools to star-white behind the pen. Each figure holds, fades to a
ghost and wheels on; the sheep, the moon and the clock have left the sky before
morning.

Three verse lines that name nothing have their own manner: on "Do I call you
first or wait for you to call" the pen paces back and forth between the same two
stars; on "my skin starts to crawl" it takes two small steps to a word; on "my
mind runs too deep" and "cuts deeper" it leaps. On "Oh, I could be the sky" it
rises to the top of the sky, and on "if I could only give in" it comes back
down.

In the choruses the pen settles. It goes over the tree and the dawn again, a
stroke per word, then drifts to the bed in one slow move, and on "you're still
next to me" five stars beside the bed light gold, one per word, joined for a
few seconds by a thin gold line: her. Gold comes up behind the ridge in each
chorus, higher each time, and sinks back after the first two. In the third
chorus, on "miss the way things used to be", the pen touches the same five stars
and they only flicker and go out. In the silences the pen drifts, slowly.

On each "Meet me at the horizon" the pen comes down to the ridge and draws him
standing there, a stroke per word. On the long "Oh" she is drawn in gold, one
stroke the length of the note; "won't you" is his arm reaching, the second
"meet me at the horizon" hers. The first time they are at opposite ends of the
ridge, a thousand units apart; she fades with the gold and the pen goes back to
racing ("No, I don't need a friend"). The last time they stand close, the hands
meet on "horizon" with one gold ring on the last "oh", and the pen rests there.
In the outro the stars go out a batch at a time, faintest first, each figure
comes up once more and goes out in the order it was drawn, the sky pales, and
the sun comes up behind the two of them. End card on the last strike (3:31.9).

Inks: the night plate's own warm black and star white; the red pen, the one
thing that travels; dawn gold for the dawn and for her, nothing else.

### Jump to

| Time | Label | What happens |
| --- | --- | --- |
| 0:00 | Opening | The mark drawn on, then the title, then the black lifts off the sky, already turning. |
| 0:12 | The sky turns | Stars only. One of them turns red at 0:13 and drifts once before the first word. |
| 0:17 | Racing | "No, I don't need a friend": the pen jumps star to star on every word, a new far corner of the sky every few words. |
| 0:26 | **The sheep** | The first figure, drawn a stroke per word and finished on "sheep"; then the moon, the bed, the hourglass, the clock. |
| 0:52 | First gold | Chorus 1: the tree and the dawn are drawn low over the ridge as the first gold comes up behind it. |
| 1:05 | **Next to me** | The pen drifts to the bed; on "you're still next to me" five stars beside it light gold. |
| 1:21 | The eye, the spine | After pacing ("call you first") and crawling ("skin starts to crawl"): the eye, the spine, then the house and the window. |
| 1:42 | I could be the sky | Up to the top of the sky, and back down on "if I could only give in", straight into chorus 2. |
| 2:07 | **Meet me · not yet** | The pen comes down to the ridge and draws him; she is drawn in gold on the "Oh", far across; both reach; the gap stays. She fades from 2:19 and the pen leaves him at 2:20. |
| 2:21 | Alone again | Verse 5: racing again; at 2:30 the lying figure, "alone". |
| 2:39 | The dawn stays | Chorus 3: the tree and the dawn gone over once more, and this time the gold does not sink. |
| 2:52 | The way things used to be | At the bed, her five stars flicker and go out. |
| 2:59 | **Meet me · the horizon** | Him again, nearer the middle; her on the "Oh"; the hands meet on "horizon" (3:10.7) and one gold ring goes out from them on the last "oh" (3:10.9). |
| 3:15 | **Morning** | Stars out a few at a time, each figure once more and gone, the sun up behind the two of them. End card 3:31.9. |

The poster frame (before play) is 2:04.8: the sky full, gold behind the ridge,
her five stars lit beside the bed.

### How it is built

- **One plan per score** (`planFor`, cached): every line is given a role from
  its words (`CUES` → draw a figure / go over it again; "next to me" and "used
  to be" → her stars; "could be the sky" → the rise; hook lines → him, her on
  the "Oh", her arm; any other verse line → jumps, with a manner from
  `MANNERS`; any other chorus line → one slow move). The pen's whole path is a
  list of legs built from that, and `constellationsPlan(score)` prints it
  (roles, each figure's time on screen, the legs, `penAt`).
- **The turning sky** is one `<g transform="rotate(…)">` about `POLE`
  (800, 1500) at `OMEGA` 0.32°/s (68° over the film). "Sky" coordinates are
  where a thing is at t = 0. Stars, grid and ridge are `lib`, placed with
  `<use>`; a frame is about 14 KB and builds in well under a millisecond.
- **Figures** are 100-unit boxes; `at: [degrees from straight up, distance from
  the pole, size]` is where each is drawn *on the screen at the moment its line
  begins*, upright then. A figure's strokes are a `track` (pen-up hops count a
  third), cut into one stroke per sung word by `schedule()`, ending on corners.
- **The two on the ridge** (`DUOS`) are in screen coordinates: `his`/`hers` x,
  scale, reach; `meet: true` makes both hands end at one point.
- **The dawn** is the keyframe list `DAWN`.

### Decided here, for the user to confirm

- The sky turns (the orchestrator's brief): slow enough to be the night, fast
  enough to see. Lettering turns with it, as on a planisphere.
- One red thing: the old stills' many sparks a word became the one pen and its
  fading thread.
- The Latin names keep their small English under them, as in the stills.
- "Still next to me" as five gold stars beside the bed is new; so are the
  line manners (pacing, crawling, leaping, the rise).
- The two on the ridge carry no lettering.
- The Nightmares variant (the stills' recommendation) is not in this film.

### Soft spots, and what to check first

- **Sync and motion have only been judged from stills** (contact sheets at
  0.1–0.3 s steps): whether a word's stroke reads as ink going down, whether the
  per-word jumps feel like racing or like noise, and whether the turn of the
  sky is the right speed are all for the person watching.
- Fast moves: the pen crosses about 450 units in a quarter of a second between
  the clock and the tree (0:52.0) and between the eye and the spine (1:24.6),
  because those lines follow each other with no gap.
- The figures are small on a phone (120–220 units of 1600); ghosts sit at 42%.
- Low figures (the eye, the tree, the dawn) pass behind the two on the ridge;
  the sky is dimmed 40% while they stand there (`hush`), and the pairs were
  placed in the clearest gaps (x 270 / 1300, then 684 / 836).
- The last meeting is 40 units left of centre (the eye is passing on the right);
  the sun rises behind the hands, not behind x = 800.
- If `OMEGA` or a figure's `at` changes, run `constellationsPlan(score)` and
  check `window`: the bed must be up through 2:57 (her stars), the tree and the
  dawn through 2:47 (chorus 3), and no two figures may overlap.

## Monkey Brain

Film: `shared/video/films/monkey-brain.mjs` (`monkeyBrainFrame`, `MONKEY_BRAIN_BEATS`,
`MONKEY_BRAIN_POSTER`, `monkeyBrainStateAt` for the "Now" line). Score:
`app/config/meetMeAtTheHorizonScore.ts`. Review: `FILM=monkey-brain SONG=meet-me-at-the-horizon`.
Built 2026-11-10 from the Monkey Brain still, on the user's brief ("constellations and
monkey brain are both great ideas. Flesh out full videos for both"). **Not yet watched by
the user.**

### What it does

A sleep lab's chart of one night, and nothing else on the sheet: the head from above
with the nineteen electrodes of the 10–20 layout, and under it the hypnogram, the strip
that says how deep he is. The technician's notes, the graph paper, the header and the
window of the still are gone; the only lettering left is the chart's own (the electrode
names, WAKE / N1 / N2 / N3, and the hours of the night along the strip).

His mind is the red dot. It hangs under an electrode by one arm and swings to another on
every word he sings, hand over hand: an arc that sags under the branch, a catch that
rocks him, the electrode he caught glowing and cooling. Every swing leaves its arc in
pencil, so the head fills with the night's scribble, and an electrode's ring thickens
each time it is caught: by morning the chart is a map of what he thought about.

**Where he swings is what the line is about.**

| Where | Electrodes | What |
| --- | --- | --- |
| Front | Fp1 Fp2 F7 F3 Fz F4 F8 | Arguing, worrying, wondering ("should I be afraid") |
| Back | O1 O2 T5 T6 Pz | Everything seen: the sky, the dark, the light, the dawn |
| Sides | T3 T4 F7 F8 T5 T6 | Everything heard: the call, the silence, the creak, the wind |
| Middle | C3 Cz C4 Fz Pz | The body: the bed, the skin, the blood, the spine |
| Behind the crown | P3 Pz P4 | Her ("you're still next to me", "the way things used to be") |

Some lines are drawn outright: "No, I don't need a friend. No, I don't need a lover" goes
to F7 on the first No and F8 on the second (the head shaken); "no counting sheep" counts
along the row C3, Cz, C4; "repeat again and again" goes round the same square twice;
"do I call you first or wait for you to call" is one side then the other; "my brain and
my eyes" ends on the two over the eyes; "straighten my spine" runs down the midline, Fz,
Cz, Pz.

**How he moves is where the song is.** Restless in verses 1 and 2 (a swing on every
word). Feverish in verses 3 and 4: faster, the long reach every time, the red staying on
the head longer, the electrodes staying hot, the head shivering under each catch. Heavy
in the choruses: only the words that carry weight (sun, wake, trees, yawn), slow deep
swings. Worn out in verse 5.

**The strip is the second actor.** The pen stays put, straight under the head, and the
paper runs under it at one speed for the whole song (the whole night stays on the
sheet). Awake, the pen kicks on every word, so the WAKE line is rough, rougher in the
fever. In every real silence in the singing (the intro and six gaps, found in the
measured score) the dot's arm lets out and he sinks towards the strip, and the pen slips
to N1 and N2. The next word snatches both back: a straight red line up to the electrode,
a spike on the strip, every ring jumps and the head shakes. That happens three times:
the first "No" (0:17), "Do I call you" (1:12) and the second "No" (2:21).

**The WAKE line is the horizon.** On "meet me at the horizon" he stops swinging, goes to
Pz and lets himself down on one long arm, through the held "Oh", until he hangs a finger
above the pen. The thought of her does not jolt him: the pen comes back up gently and the
line under it is smooth. In the silences there both sink together, never touching. The
first time, his own "No, I don't need a friend" tears him back up to the front of the
head, the hardest jolt in the film. The last time, through the last held "oh", the gap
closes: the dot meets the pen on the horizon as the voice lets go (3:14.9), the arm lets
go of the head, and the one dot goes down, N1, N2, N3, four beats of the click apart.
The electrodes go quiet front to back, the dot breathes slower and smaller, and the dawn
that showed a little higher behind the line in each chorus fills the sky and turns the
head gold: a sun on the horizon, with the night written on it.

### Jump to

| Time | Label | What happens |
| --- | --- | --- |
| 0:00 | Opening | The mark drawn on, then the title, then the black lifts. |
| 0:12 | Lights out | He hangs under Cz, sinking; the pen is already at N1 and slips to N2. |
| 0:17 | **No** | The first word snatches him up to F7; spike, shake. Verse 1: restless, a swing a word. |
| 0:35 | The sky | Verse 2: the bed (middle), the sky (back), dying and being afraid (front), "again and again" round one square. |
| 0:52 | First light | Chorus: slow heavy swings across the back of the head; gold shows behind the horizon. |
| 1:09 | Drifting | The first real silence: the arm lets out, he sinks out of the head, the pen dips. |
| 1:12 | **Snatched back** | "Do I call you first": the second jolt, then side to side. |
| 1:16 | Fever | Verses 3 and 4: wild. "Brain and my eyes" on Fp1 and Fp2, "spine" down the midline. |
| 1:46 | Second light | Chorus 2, the gold a little higher. |
| 2:04 | **Meet me at the horizon** | He drifts, comes round gently, goes to Pz and lets himself down to the pen through the held "Oh"; in the silences they sink together. |
| 2:20 | **No, again** | "No, I don't need a friend" tears him back up: the hardest jolt. Verse 5, worn out. |
| 2:39 | Third light | Chorus 3. |
| 2:57 | Reaching | The second hook: down to the pen again. |
| 3:10 | **They meet** | Through the last "oh" the gap closes; he is on the horizon as the voice lets go (3:14.9). |
| 3:18 | Going under | N1 at 3:19, N2 at 3:23, N3 at 3:28; the electrodes go quiet, the dawn fills in. End card on the last strike (3:31.9). |

The poster frame (before play) is 1:39.9: verse 4, the head hot and the scribble thick.

### How it is built

- One fixed frame, no camera. `planOf(score)` plans the night once per score: the pen's
  steps (`steps`, `jolts`), every swing (`hops`, 239 of them: 236 arcs and three snatches) with the point it really
  started from (he may still be rocking, or hanging low), the scribble and the strip's
  trace as chunked path strings. A frame is about 26 KB of SVG and far under a
  millisecond to build; no `lib` is needed.
- `SPEC` is the whole choreography: one row per line, a region letter, an electrode name
  or `-` per word. `MOODS` / `MOOD_OF` set how he moves in each section. Change those
  two tables, not the code.
- The swing is a quadratic that sags downwards (the sheet's "down" is his gravity, which
  is also the way to the strip), eased with the camera's cosine so it is fastest at the
  bottom; the sag is let out until the arc stays inside the head. A swing is never
  shorter than its reach allows (about 1350 units a second on average) and an electrode
  too far to reach before the next word is not chosen.
- The arm's length is `armAt`: `ARM` at rest, let out by `slackAt` in a silence, and on a
  hook pulled out by `reachAt` to stop `FINGER` above the pen wherever the pen is. A
  silence that does not end in a swing (`gap.caught` false) draws the arm in over 0.6 s.
- The strip scrolls at `K` = 3.55 units a second, so 23:30 to the last strike fits left of
  the pen. The hours are the song mapped onto 23:30–06:10.
- The outro's steps are on the click (`score.bpm`, `score.beatPhase`): the first beat
  3.6 s after the voice, then every four.

### Soft spots, and what nobody has judged yet

- **Not yet seen in motion by anyone.** Checked only on contact sheets and by numbers
  (largest move of the dot per frame: 68 units, in a snatch; about 40 in the fever).
  Whether a swing reads as a swing, whether a word a third of a second apart is too busy
  in the verses, and whether the catch's rocking (`sway`) and the fever's shiver (`kick`)
  are too much or too little are the user's to say.
- The plate's left and right thirds are empty paper for the whole film (a 540-unit head
  on a 1532-unit plate). It was left that way on purpose after the notes were cut.
- The WAKE line's roughness is a tick per word 1–2 units apart on a strip that moves 3.55
  units a second: it reads as texture, not as separate ticks, and might shimmer a little
  as it scrolls.
- Only three hard jolts, because the record has only seven silences long enough to
  drift in and four of those are round the hooks, where he is brought back gently.
- The regions are never explained on screen (no labels by decision); the map is felt as
  each line keeping to one neighbourhood, not read.
- In the hooks the dot and the pen are two red dots a finger apart; that is the picture,
  but it is small on the sheet (the strip's rows are 30 units apart).
