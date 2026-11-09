# Goodbye, Norma Jeane — the marquee

Track 3. [/visualizers/goodbye-norma-jeane](/visualizers/goodbye-norma-jeane).
Film: `shared/video/films/marquee.mjs` (`marqueeFrame`, `marqueeMoments`).
Score: `app/config/goodbyeNormaJeaneScore.ts`. The whole film from 2026-11-02.

## What it does

The mark drawn on, the title drawn on, then the black lifts off an empty
picture-house letter board. A second later, on the downbeat, her ten tiles
start to spin and settle into NORMA JEANE on the first "Norma". Then all
twenty-nine of her films surface in release order, one after another, each
assembling out of spinning letters, whole and still for four beats, and coming
apart again as the next begins. In each chorus the board puts the song's own
words up on three rows, GOODBYE / NORMA / JEANE, each row turning over on its
word, and lets them dissolve slowly through "I've been in love with you". In
the bar where the record drops out before a chorus the board is blank and the
bulbs go out. After The Misfits it starts on Something's Got to Give, which
never finishes; the letters keep spinning and die out one by one, and on the
last hit, the mark. Her name is never spelled, but three times a build lets it
show through in red.

## The rules (2026-11-09)

The user's three rules, replacing the phrase-by-phrase schedule of 2026-11-02:

1. **A blank second, then the beat.** Once the opening fades (12.0) the board
   is blank for a second; the first motion is on the next beat, bar 5's
   downbeat at 13.33. Nothing is on the board before her name: the twinkle
   starts once NORMA JEANE is whole.
2. **Only two lyrics on the board.** NORMA JEANE at the start, whole on the
   first "Norma" (22.49); GOODBYE / NORMA / JEANE in each chorus, covering the
   three rows, each row landing on its word with no spin before it ("show up
   in time with the lyrics"). JEANE, no comma. Everything else is a film
   title. MORE / MORE / MORE is gone.
3. **Build = break, hold between.** Every board builds and comes apart over
   the same length and is whole and still for four beats (2.53 s, the grid's
   answer to "2 seconds"; 2.00 is not on the click). One title starts as the
   one before it goes.

What follows from them: twenty-nine films must fit between the fixed events,
so the pace is set stretch by stretch and the titles no longer land on the
sung phrases. Every change is on an eighth of the click.

| Stretch | Films | Build / break |
| --- | --- | --- |
| After NORMA JEANE to the first drop bar | 2 | 2.21 s |
| First drop bar to the second | 8 | 1.58 s |
| Chorus 1 to the third drop bar | 11 | 1.58 s |
| Chorus 2 to the last chorus | 5 | 1.58 s |
| Last chorus to Something's Got to Give | 3 | 1.89 s |

The board is empty (twinkling) for 0.6 s before the first drop bar, 2.5 s
before the second, 0.3 s before the third and 1.7 s before the last chorus;
the user accepted these as "more or less continual".

- **NORMA JEANE** spins from 13.33, is whole at 22.49, holds to 25.01 and is
  gone at 34.17, as long going as coming.
- **The hook** lands GOODBYE on "Goodbye", NORMA on "Norma", JEANE on "Jean",
  holds four beats and comes apart over ten (6.3 s), so it is gone exactly as
  "Know you want the world" starts, in all three choruses (112.17, 187.98,
  228.42). The one asymmetry, chosen because the user asked for the hook to
  arrive on the words and "still break down slowly".
- **The clues** sit in the builds nearest where they were: All About Eve
  (79.64, before "Say goodbye to all you know"), Niagara (157.64, "Different
  lines"), The Prince and the Showgirl (210.70, the last title before the last
  chorus). Red for a beat from the build's first eighth, then the title locks.
- **Something's Got to Give** starts spinning on bar 98 (248.28), the downbeat
  where the voice leaves, lands most of its letters two bars later and never
  all of them, and dies out to the last hit at 275.76. The ending pace was
  left to me ("do what feels most natural"): the last three films ease off a
  little, and the board is empty for a second before it.
- **The twinkle follows the record** (`score.brightness`), the pick from the
  three intensity tests of 2026-11-05 ("follows the record"). The other two
  and the test row are deleted.

## Jump to

The times are read off the film (`marqueeMoments`), so a retimed board moves
them with it.

| Label | What happens |
| --- | --- |
| Opening | The mark drawn on, then the title, then the black lifts off the dark, empty marquee. |
| **Norma Jeane** | A blank second, then her tiles spin from the downbeat and settle into NORMA JEANE on the word. |
| The first film | Dangerous Years, the first of the stream. |
| The first drop | The board empties, the record drops out, the bulbs go out; Ladies of the Chorus surfaces as it comes back. |
| Clue 1 | M, Y and O in red, in her places, as All About Eve starts to build. |
| **Chorus 1** | Dark for the drop bar, then GOODBYE / NORMA / JEANE on the words, dissolving through "I've been in love". |
| Break 2 (2:04) | Gold lights; the stream runs on through the interlude. |
| Clue 2 | Six of her letters, as Niagara starts to build. |
| Chorus 2 | The drop, the hook, the stream. |
| Clue 3 | Nine of her letters, as The Prince and the Showgirl starts to build. |
| **Last goodbye** | No drop bar: the board empties for a breath and the hook lands on the words. |
| Something's Got to Give | After The Misfits it starts to spell and never finishes; the letters keep spinning and die out one by one. |
| The end | The last letters and bulbs go, and on the last hit the mark. |

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

The three rules above, and: the whole name on "Norma" (not "Jeane"); hold four
beats; JEANE, no comma; keep the clues; the twinkle follows the record; the
ending left to me; the gaps before the drop bars accepted.

## Measuring intensity

Loudness was no use, since the master spans 5 dB from the quietest bar to the
loudest. Energy above 1.8 kHz spans 10 dB and follows the voice and the brass.
`tools/video-styles/brightness.mjs` prints it a digit a beat; it lives in the
score as `brightness`, and the twinkle and the spinning tiles follow it.
