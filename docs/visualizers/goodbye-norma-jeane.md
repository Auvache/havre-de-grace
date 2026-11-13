# Goodbye, Norma Jeane — the marquee

Track 3. [/visualizers/goodbye-norma-jeane](/visualizers/goodbye-norma-jeane).
Film: `shared/video/films/marquee.mjs` (`marqueeFrame`, `marqueeMoments`).
Score: `app/config/goodbyeNormaJeaneScore.ts`. The whole film from 2026-11-02.

## What it does

The mark drawn on, the title drawn on, then the black lifts off an empty
picture-house letter board. A second later, on the downbeat, her ten tiles
start to spin and settle into NORMA JEANE on the first "Norma". Then her
films surface in release order, one after another, each assembling out of
spinning letters, whole and still for three beats, and coming apart as the
next begins. In each chorus the board puts the song's own words up, a row on
each sung word: GOODBYE / NORMA / JEANE, then SEVENTEEN, then MORE / MORE /
MORE, each dissolving slowly into the next. Under the piano before the last
chorus there is no title, only the free board flashing on the piano's
strikes. After YOU / WANTED / MORE the board flashes hard, NORMA JEANE pops
up on the middle row where the voice leaves, and its letters turn one by one
into MARILYN / MONROE in the places the red clues have used all along. Three
letters never arrive; on the last hit, the mark. The board is never dark or
still after the opening.

## The rules (2026-11-09)

The user's rules, in two rounds, replacing the phrase-by-phrase schedule of
2026-11-02:

1. **A blank second, then the beat.** Once the opening fades (12.0) the board
   is blank for a second; the first motion is on the next beat, bar 5's
   downbeat at 13.33. Nothing is on the board before her name: the twinkle
   starts once NORMA JEANE is whole. After that the board is **never dark and
   never still**: the drop bars are gone ("at 0:49 there is a weird pause
   where lights are all off… I don't want that to happen ever after the
   start"), the twinkle has a floor so a few letters always move to the beat,
   and the bulbs stay on to the cut.
2. **The lyric on the board.** NORMA JEANE at the start, whole on the first
   "Norma" (22.49). In each chorus GOODBYE / NORMA / JEANE, SEVENTEEN, and
   MORE / MORE / MORE, each row landing on its word with no spin before it
   ("show up in time with the lyrics"), each coming apart slowly to the next
   word. In the last chorus YOU / WANTED / MORE as well. **No film title in a
   chorus.** JEANE, no comma. Everything else is a film title.
3. **Build = break, hold between.** Every board builds and comes apart over
   the same length and is whole and still between. One title starts as the
   one before it goes, with no gap ("it should feel like one movie title
   transitions to the next"). The name alone holds four beats (as in the
   schedule the user approved); everything else three.
4. **The piano** (bars 82–86, 207.86–217.96, measured: three strikes on the
   first three eighths of every bar, loudest on the third, lighter fill
   between): no title until the chorus, the free board flashing near full on
   the strikes. **After "you wanted more"**: no more titles, "just crazy
   flashing letters as 'norma jeane' pops up in the middle and slowly changes
   to 'marilyn monroe'", never totally formed ("maybe 'marslyn m nrom'"), cut
   to the end just before.

What follows from them: with words only in the choruses, none under the piano
and none after "you wanted more", the twenty-nine films have 134 s. A
four-beat hold alone would take 73 s of that and leave a 0.95 s build, so the
**hold is three beats (1.89 s) and a title builds and breaks in four eighths
(1.26 s)**, one every 4.42 s, which fits all twenty-nine exactly: 15 before the
first chorus, 12 between the first two, 2 under the trumpet. The board is
empty (twinkling) for 1.6 s before "Goodbye" in choruses 1 and 2 and nowhere
else. Every change is on an eighth of the click.

- **NORMA JEANE** spins from 13.33, is whole at 22.49, holds to 25.01 and is
  gone at 34.17, as long going as coming.
- **The words.** The hook holds three beats and comes apart over 4.4 s, gone
  as "seventeen" is sung; SEVENTEEN slams onto the middle row on the word and
  comes apart over 2.7 s to the first "more"; MORE lands a row on each "more"
  and comes apart over nine beats (in the last chorus, to "you"). YOU / WANTED
  / MORE lands on "you" (236.96), "wanted", "more" and comes apart over ten
  beats.
- **The clues** sit in the builds nearest where they were: Love Nest (82.80,
  after "Say goodbye to all you know"), The Seven Year Itch (158.59, after
  "Different lines"), The Misfits (203.43, the last title). Red for a beat from
  the build's first eighth, then the title locks.
- **The finale.** The flashing starts as YOU WANTED MORE is gone (246.38);
  NORMA JEANE pops up at bar 98 (248.28); from bar 99 one letter changes every
  two beats, scattered, into MARILYN (the row above) / MONROE (the middle row);
  of the thirteen, two come up wrong and one never comes, never an initial;
  the free board flashes on every eighth (most on the beats) to the cut at
  275.76. Something's Got to Give is gone with the other titles.
- **The twinkle follows the record** (`score.brightness`), the pick from the
  three intensity tests of 2026-11-05 ("follows the record"), with a floor of
  a quarter so it never stops.

## Jump to

The times are read off the film (`marqueeMoments`), so a retimed board moves
them with it.

| Label | What happens |
| --- | --- |
| Opening | The mark drawn on, then the title, then the black lifts off the dark, empty marquee. |
| **Norma Jeane** | A blank second, then her tiles spin from the downbeat and settle into NORMA JEANE on the word. |
| The first film | Dangerous Years, the first of the stream; one every 4.4 s from here. |
| Clue 1 | M, Y and O in red, in her places, as Love Nest starts to build. |
| The piano comes in | The board steps up with it, at the end of verse 2. |
| **Chorus 1** | GOODBYE / NORMA / JEANE on the words, SEVENTEEN, MORE / MORE / MORE; no titles. |
| Break 2 | The stream resumes with Don't Bother to Knock as MORE goes. |
| Clue 2 | Six of her letters, as The Seven Year Itch starts to build. |
| Chorus 2 | The words again; Let's Make Love and The Misfits under the trumpet after. |
| **The trumpet** | Trumpet and piano together: almost every tile turning on every eighth round Let's Make Love and The Misfits. |
| Clue 3 | Nine of her letters, as The Misfits starts to build. |
| **The piano solo** | No title: the board flashes on the piano's three strikes a bar. |
| Last goodbye | The words, then YOU / WANTED / MORE. |
| You wanted more | The last lyric on the board. |
| The trumpet again | The second stretch: near full round YOU WANTED MORE and into the finale. |
| **Her name** | NORMA JEANE pops up where the voice leaves and turns, letter by letter, into MARILYN / MONROE; never finished. |
| The end | The last hit cuts to the mark. |

The poster frame (before play) is GOODBYE / NORMA / JEANE whole in the first
chorus.

## Decided by the user

### 2026-11-02

- **Split flaps** beat two alternatives tried the same day, slot-machine reels
  and letters hung by hand: "A is definitely best, especially when well timed
  with the music." Timing to the record is what they value most.
- **The frame stays fixed** (chosen over camera moves or a picture-house
  drawing); the board does more by section. The drop bars before each chorus
  are from this round and stay.
- **Her name is never spelled in full.** Keep the three partial red clues (3, 6
  and 9 letters); confirmed over landing MARILYN MONROE once or on every chorus.
- Any new board event must land on a measured word or downbeat (now: on an
  eighth of the click).

2026-11-03 round (commit 2e46d3c): tiles widened and type cut to 74 so Jost
Bold's W (1.06 em) fits; the band caption is just "NOW SHOWING"; `endCardAt`
moved to 275.76, the last guitar/piano note (275.3 was heard as early).

### 2026-11-05

- **The twinkle** ("more letters and movement" while a title is up): of five
  motion tests the user chose letters blinking in the empty tiles, "A is the
  best". Never red; nothing twinkles beside a lit letter in its row, or
  directly above or below one once a title is half locked; never in a drop
  bar.
- **The dance**: a held board's own letters turn over onto themselves now and
  then. Since 2026-11-05 a title, whole, is still; the name and the hook still
  dance.
- **The surfacing**: letters lock out of the spin, scattered, on the eighths;
  one title at a time, never overlapping. Tried and dropped the same day: key
  words of the lyric slammed up on their syllables, half-length titles, and
  ten headlines from her life ("the historical events don't fit the theme").
- **A clear ring** round a half-locked title (beside, above and below, not the
  corners).

### 2026-11-09

First round: the whole name on "Norma" (not "Jeane"); JEANE, no comma; keep
the clues; the twinkle follows the record; the gaps before the drop bars
accepted; hold four beats. Second round, after watching it: no dark pause
ever after the start; words only in the choruses (SEVENTEEN and MORE / MORE /
MORE timed like the hook); nothing but flashing under the piano; YOU WANTED
MORE, then her name forming and never finishing; no breaks between titles.
The hold went to three beats so all twenty-nine films still fit (offered as
the trade-off and approved with "That is great").

## Measuring intensity

Loudness was no use, since the master spans 5 dB from the quietest bar to the
loudest. Energy above 1.8 kHz spans 10 dB and follows the voice and the brass.
`tools/video-styles/brightness.mjs` prints it a digit a beat; it lives in the
score as `brightness`, and the twinkle and the spinning tiles follow it.

## The dance — the film since 2026-11-13

**The film is the beat test, made whole** (after three rounds of a 30-second
clip under the film: "perfect. You got it exactly right"). It replaces "The
twinkle" and "The dance" of 2026-11-05 above: every flip lands on an eighth of
the click, the board dances in layers (kick, snare with the title winking,
hats, a move each bar), and a title, whole, winks rather than holding still.
The rounds that got there are below.

### Piano and trumpet (2026-11-13)

"When piano comes in, I want to increase the number of the spaces on the
marquee that change. When there is piano and trumpet together during the big
trumpet part, include almost every single space." Measured by splitting the
record with Demucs `htdemucs_6s` (piano, guitar, bass, drums, vocals, other;
the brass lands in "other"), bar by bar:

- **The piano** comes in at the end of verse 2 (bar 35, about 1:30), plays
  through pre-chorus 2 and chorus 1, drops out for the interlude after it
  (2:04–2:30), is back from verse 3 to the end, loudest in the solo (bars
  82–84) and the outro. Stored as `score.piano`, a digit a beat like
  `brightness`. The dance's **drive** is the energy plus 0.45 × the piano
  level ("follow the piano's level", the user's pick over a single step up).
- **Trumpet and piano together** are loudest at bars 78–81 (3:17–3:28, the
  end of chorus 2 into the solo, the loudest brass on the record) and bars
  94–100 (3:58–4:16, the end of the last chorus into the outro). The user
  chose **both** as the big trumpet part: `score.horns`. There almost every
  free tile turns on every eighth (95% on the beats, 80% between); about 26
  of 39 tiles an eighth under the first, 21 under the second (her name and
  YOU WANTED MORE hold the rest).
- **Titles there** (Let's Make Love, The Misfits with clue 3): the title
  stays and winks, and its clear ring is given up (the user's pick), but the
  **gaps between its words stay blank** — without that THE MISFITS read
  THENMISFITS. Her place is held only round the beat her red letters show.
- The piano solo's flashing is fuller (fill 0.45 between the strikes, was
  0.25); the finale goes near full while the second horn stretch lasts.
- Over the whole film: 7,257 changes, 100% on the eighth grid. Changes a bar:
  verse 1 ~24, verse 2 ~37, pre-chorus 2 ~61, verse 3 (with piano) ~59,
  chorus 2 ~85, last chorus ~104, outro ~148.
- Jump list: "The piano comes in", "The trumpet", "The trumpet again".

### How the dance was found (2026-11-13)

The user: "everything is great except for the timing and the building of
energy… keep the beat… letters should always be dancing. The finished titles
should also dance (1–3 letters can wink while staying the same, all in time
with the beat)." Shown as a 30-second loop under the film (`VisualizerMotionTests`,
bars 30–42, 76.49–106.80: verse 2, the pre-chorus build, into chorus 1); the
test is gone now that it is the film.

What was wrong, measured: **every letter change in the film lands exactly
100 ms off the click.** A flap's letter changes halfway through its 0.2 s
flip, and every flip was placed either to *start* on an eighth (spins, the
breakdown — the letter changes 0.1 s late) or to *finish* on one (locks, the
twinkle — 0.1 s early). Nothing ever changed on the beat itself. And the
twinkle followed one beat's brightness digit, which jumps 7, 4, 2, 1 inside a
bar, so it flickered rather than built.

The test:
- **Every flip is centred on the grid** (`SW`, half a flip), and flips are a
  little faster (0.16 s): 99% of changes land on an eighth, 0 ms off (the rest
  are lyric words, which land on their measured syllables).
- **Every board winks**, titles included (overriding "a title, whole, is
  still" of 2026-11-05): 3 of its letters on the downbeat, 1 on beat 2, 2 on
  beat 3, 1 on beat 4, one more each when the energy is up; never the same
  letter twice running. The old random `dance` and the backbeat twitches are off.
- **The twinkle moves in groups on the beats**, biggest on the downbeat; the
  offbeat eighths join once the energy passes 0.55 (late in a pre-chorus, the
  choruses). How many free tiles are lit follows the energy.
- **Energy** = 0.7 × the section's shape (verse 0.3, pre-chorus climbing
  0.35 → 0.95 across it, chorus 0.9, the last chorus 1) + 0.3 × brightness
  averaged over seven beats. Over the clip it goes 0.30 → 0.87; flips per bar
  25 in the verse → 65 at the chorus.
- The breakdown goes in groups on the eighths, most on the beats.

**Second round, the same day.** The user: "That clip is worse. I want the
underlying main beat to synchronize all movements." The first clip moved on
the eighths (offbeat twinkle, breakdowns, spins) and a beat could carry 13
tiles and the next 1 or none. Remade:

- **Everything on the quarter note.** After the plan is built, every flip of
  every tile (spins, locks, breakdowns, the sung words, the clues, the bulbs'
  flashes) is moved so its letter changes on the nearest beat; two flips of a
  tile that meet on a beat become the later one. The twinkle and the winks are
  written on the beats in the first place. Over the clip: 446 changes, 100% on
  a beat, nothing between beats. The bulbs that chased on the eighths
  (pre-chorus, outro) step on the beats. Flips are 0.14 s.
- **The words snap to the beat too**, against the 2026-11-09 rule that they
  land on their syllables: GOODBYE / NORMA / JEANE fall on three beats in a row.
- **A steady pulse.** Each beat moves about `ACCENT[beat] × (5 + 13 × energy)`
  tiles (ACCENT 1, 0.65, 0.85, 0.65); the twinkle makes up whatever the
  board's own letters leave, and runs straight through a change of title (the
  first clip lost the first beat of every title). No beat in the clip is
  empty. A title landing or coming apart still makes its beat the biggest
  (about 20 letters over two beats).

**Third round, the same day.** The user: "That is better, but it should be
twice as fast, with variance on some of them. Not everything needs to change
at that speed. Everything should just be timed to the beat… I want energy and
entertainment and for the viewer to feel like the board is an interesting
dance the whole time." Remade on the **eighth** (half a beat) as the grid,
with layers at different speeds, like a band (`dance()` in `marquee.mjs`):

- **The grid.** Every flip (spins, locks, breakdowns, words, clues, flashes)
  snaps to the nearest eighth (`quantize`); the words are now at most an
  eighth off their syllables. 591 changes in the clip, 100% on the grid.
- **Kick** on beats 1 and 3: a group of free tiles, `(3 + 9E)`, the downbeat
  biggest. **Snare** on 2 and 4: `(2 + 5E)`, and the board's own letters wink
  (2 on the downbeat and beat 3, 1 on the backbeats, +1 when E > 0.65).
  **Hats**: once E > 0.4, 0–3 tiles on the offbeat eighths, never the same
  count twice running. Builds and breakdowns already on an eighth thin the
  kick and snare there (`busy`).
- **A move each bar**, never the same twice running, by energy: quiet —
  ripple, rest, wave; the build — wave, ripple, burst; the chorus — wave,
  burst, stab, ripple. *Wave*: the columns turn over left to right (or right
  to left) across the bar, blanks included. *Burst*: from the centre column
  out. *Ripple*: the title's letters wink in reading order, one or two an
  eighth. *Stab*: the fullest free row lights on the downbeat and goes out
  on the eighths after beat 3.
- Bulbs chase on the eighths again in the pre-chorus.
- Over the clip: ~25 changes a bar in verse 2, ~70 by the chorus, 24 tiles
  on the chorus downbeat; 6 of 96 eighths still (offbeats in the verse).
