# Ivory — the crossword

Track 4. [/visualizers/ivory](/visualizers/ivory) is **the crossword**, the
whole song (2026-11-13), with **every word of the lyric on the board and a
butterfly in the interlude** since 2026-11-23. Score:
`app/config/ivoryScore.ts`. Film: `shared/video/films/crossword.mjs`
(`crosswordFrame`, `CROSSWORD_BEATS`).

| File | Owns |
| --- | --- |
| `shared/video/films/crossword.mjs` | The film: when every word is written, the camera, the butterfly, the drawing. |
| `shared/video/films/crossword/stations.mjs` | `STATIONS` (the nine blocks and the four long "Ivory"s: which lines, where on the sheet, when the camera moves), the grid search (`buildBeam`), its score (`judge`), where the one-letter words go (`placeSingles`) and the camera's shots (`shotsOf`). |
| `shared/video/films/crossword/layout.mjs` | The grid, **baked**: `node tools/video-styles/crossword/bake-layout.mjs` (see "How the grid is made"). |
| `shared/video/films/crossword/letters.mjs` | The alphabet in the titles' Hairline type, **baked**: `node tools/video-styles/titles/bake-letters.mjs`. |
| `tools/video-styles/crossword/check.mjs` | Walks the film at 30 fps for the rules below. Run it after any change. |

## The whole lyric, and the butterfly (2026-11-23)

The user: "I like the concept and the way that the board works, but I want to
revamp/expand it. Redesign the board to have all of the lyrics of the song.
They should start writing in roughly when the word is sung (they should fill
in at the same rate that they do now). The instrumental section needs work. I
don't like the writing in 'ivory' over and over again. I am not sure what to
do there. See if you can come up with something cool/interesting that fits the
vibe of the rest of the video."

What was done (Claude's choices where the user left them open; **not yet
watched by the user**):

- **Every word is on the board**: 199 words, each its own entry, each
  starting on its own measured onset at 3.5 letters a second. Repeats are
  written again ("that" four times in verse 1).
- **The old "never more than three at once" rule is gone.** With every word
  in, a fast line would have run a second late; the user asked for each to
  start when it is sung. The most written at once is now six.
- **One-letter words** ("a", "I"; thirteen of them). No crossword has a
  one-letter entry, so each is written the way a solver gets a letter early:
  into a square of a word sung soon after it in the same block, which that
  word then writes round. Where no later word has the letter (the bridge has
  no I at all) it is a square on its own beside the next word; five are.
- **The interlude is a butterfly**, below. The sixteen jumbles of IVORY are
  gone, and with them every red letter that was not her name.

## The interlude: the butterfly

Nothing is sung from 1:51 to 2:08 and the band drops to almost nothing, so
nothing is written. Instead:

- **1:51** As the fourth "Ivory" dies away a **red butterfly** is drawn on in
  the black square at the end of her name, stroke by stroke like a letter,
  then filled. (She has "blue butterfly wings" for eyes; red is hers in this
  film, and the album's sheet has one red thing travelling.)
- **1:52–2:07** It lifts off on a beat and the camera follows it in **one
  slow glide** to the next block, fifteen seconds, the only long move in the
  film, over the blank squares the bridge will fill. Two wingbeats to a beat
  of the click; it bobs once a beat and never flies straight.
- **2:07** It settles on **the five blank squares of her next name** and sits
  there, wings breathing every four beats, while he sings that he could be the
  one she loves. Words go in all round it; her squares stay blank.
- **2:17** On "forgot how to breathe, oh" it goes, up and off the sheet. The
  camera pushes in on the five empty squares, and at 2:21 he writes IVORY
  where it sat: her name is what he has left.

How: `FLIGHT` and `butterflyAt()` in `crossword.mjs`. In flight it is placed
against the camera, not the board (from where it sat in the first frame to
where it lands in the last, drawn towards the middle on the way), so it cannot
leave the frame; `check.mjs` walks it. The bridge's block is framed to hold
her next name's squares (`holds` on its station).

Considered and dropped: the grid's blank squares spelling IVORY at a distance
(still her name over again); chalk doodles of the lyric's nouns; a clue list
or guesses at her real name (unsung words, which the user took out on
2026-11-13); squares lit on the beat (drifts towards the look the guardrail
forbids).

## The ground (2026-11-23)

The user: "make the background for this one dark charcoal black with a very
slight chalky texture." The whole sheet, border and plate, is charcoal
(`CHARCOAL` #1f1e1c, plate mark #34322e); the puzzle's squares stay paper with
ink rules, so the charcoal between its words reads as a real crossword's black
squares. The lyric in the margin is chalk (#e6e1d6); red is unchanged.

The texture is chalk dust, in `lib` so it is parsed once (`chalkDefs`): two
pattern tiles of faint white specks and scuffs, 211 and 347 units (no common
factor, so the repeat never shows), and seven broad smudges, all at 2.5–9.5%
white. No filter: an feTurbulence over the full frame would be re-rasterised
sixty times a second. The opening and the end card are unchanged. **Not yet
watched by the user.**

## The story (the user's, 2026-11-02)

He is in the crowd, she is on stage, and he falls for her in an instant. After
the show he goes to talk to her and misses his chance. "Ivory" is his name for
her; he never learns her real one.

## What the film does

A large blank crossword on a charcoal ground is filled in as the song goes.

- **Words.** Every word he sings, each starting on its measured onset.
  Nothing unsung goes in.
- **Every letter is drawn on** stroke by stroke, the way the opening draws the
  title (the Hairline skeleton masks; six skeletons were added to
  `stroke-letters.mjs` for it: F J P Q X Z).
- **One rate: 3.5 letters a second**, for every word, IVORY included.
- **Every "Ivory" writes an IVORY, in red**: seven in the grid, written exactly
  like the other words. Her name (and the butterfly) is the only red in the
  film. A word that crosses one of her squares leaves it blank until her name
  is written, so her name always goes in whole.
- **No frame ever holds two written IVORYs** (until the final pull-back,
  which shows the whole finished puzzle).
- **Nine blocks.** A block is two lines of the lyric (three where "Oh, Ivory"
  follows without a breath), packed into about 23 × 10 squares. **The camera**
  pans to a block in the gap before it is sung, holds still while every word
  of it goes in, then pans on (cosine-eased; it waits for the last word to
  finish and keeps at least 1.8 s). A long "Ivory" sung on its own goes into
  the block just written, and the camera pushes in on it.
- **The last chorus** is four lines straight through, so the camera moves up
  a block while he sings (2:34.7–2:36.7): the words either side of the move
  are kept to the rows the two blocks share.
- **The puzzle** is a snake, three columns of three blocks: up the left of
  the sheet, down the middle, up the right. Within a block the words run
  roughly in the order sung, so each block ends where the next begins. After
  the last "Ivory" the camera pulls back to the whole thing, filled, a sheet
  of the plate's own shape, and the end card comes on the last hit (182.42).

Jump-to moments (`CROSSWORD_BEATS`): 0:00 Opening · 0:09 First words · 0:27
Her eyes · **0:40 Ivory** · 0:45 California · 0:54 Ivory again · 1:04
Flowers in her hair · 1:22 Beside her · **1:35 Ivory, third** · 1:40
Paradise · 1:49 Ivory, fourth · **1:51 The butterfly** · 2:06 It lands on her
name · 2:08 Adam to her Eve · **2:16 It goes** · 2:21 Ivory, fifth · 2:26 The
last chorus · 2:44 Ivory, sixth · **2:53 The last Ivory** · **2:56 The whole
puzzle**. Poster 0:57.

## How the grid is made, and why

Two hundred words will not go into nine frames by placing them greedily in
the order sung: a tight block boxes its last short words out (UP shares no
letter with any other word of its two lines). What was tried on 2026-11-23 and
failed: a beam over words in sung order; long words first; and always placing
the word with the fewest places left (it only ever follows forced moves and
knots itself). What works:

1. **Block by block, many tries** (`buildBeam`). One try at a block puts its
   words in in a shuffled order that leans long-first, each crossing a word of
   its own block (the first few, a word of the block before: that is what
   joins the puzzle up), never side by side, each taking one of its best few
   places. A word with nowhere to go waits for the others; at most two may be
   carried into the next block and cross its words instead. A try that leaves
   a word over is thrown away. Each of the 8 grids kept so far gets 2,500
   tries at the next block (up to four rounds for a hard block), and the 8
   best whole blocks go on. If nothing joins on, the block before is built
   again.
2. **What a try is scored on**: staying in its box (never more than two
   squares out sideways or one up or down, except where a word joins two
   blocks); the scale the camera will need to frame every square written in
   that shot; running along the block in the order sung; second crossings;
   and letters left along the side the next block joins.
3. **Her name** is never placed inside the frame of another block whose shot
   writes an IVORY, nor within 15 columns and 8.5 rows of one already placed
   (the reach of her own close shot).
4. **`judge`** then scores each whole grid as the film will show it: two
   written IVORYs in any shot or move costs 1000, a block framed wider than
   1.06× costs by the square of how much. The bake keeps the cheapest.
5. **One-letter words** are placed last (`placeSingles`), and **framing**
   (`shotsOf`) is every square written in the shot with a little board round
   it; her name alone is framed at 1.32× and the frame slides towards more
   puzzle, never onto another IVORY.

To bake: a seed takes about a minute, so run ranges side by side and bake
the winner alone, e.g. `FROM=1 DRY=1 node tools/video-styles/crossword/bake-layout.mjs 4 8 2500`
(seeds 1–4) in several shells, then `FROM=<best> node … <best> 8 2500`.
The baked grid is seed 26 of 64 (`FROM=26 node … 26 8 2500`): 69 squares
across and 31 down, 575 of them, blocks framed at 0.97–1.06×. Then `node tools/video-styles/crossword/check.mjs`.

**The box is flatter than the plate on purpose** (23 × 10 against a frame of
about 24 × 12): the words that join two blocks need a row of spill above or
below, and a row costs a 22 × 11 box seven per cent of its scale and this one
nothing.

## How it got here (2026-11-13, one session)

1. **First test**: one grid built round IVORY in the middle, a Gaussian camera
   always moving, her name left blank until the last "Ivory". The user: "pretty
   good", but the pacing a little fast and the panning jumpy; write IVORY on
   every "Ivory", never twice on one screen; pan to an area, add a few words,
   pan on; never more than two or three words at once.
2. **Stations**: the chain grid and held shots. The user: "way better"; make
   the screen fuller (closer, more words) and one fill rate ("think 6 letters
   per second").
3. **Fuller**: closer shots, more sung and gap words, fill words. The user:
   "way better"; no red box on the other words, red only for her; three
   speeds at 6 or slower.
4. **Three speeds** (6, 4.5, 3.5 letters a second). The user chose **3.5**,
   and: "remove the blue focus when filling in 'ivory.' Ivory should function
   exactly like the other words but with red letters instead." Then the whole
   song, and everything else off the page.

What went: the first test's film, the ten stills of 2026-11-10 and their
concept module (`tools/video-styles/visualizers/ivory.mjs`), and the first film
(`shared/video/films/blanks.mjs`, five blanks). The stills and blanks are in
git at `b709b51`.

5. **Only sung words** (later the same day). The user: the extra words
   "aren't working"; both the gap words and the fill words came off, and the
   interlude became "a complex grid portion where every word is ivory, but
   the letters are mixed up", red "only if they are in the right position in
   the word", ending on jumbles alone (no true IVORY at its end).
6. **Charcoal** (2026-11-23), above.
7. **The whole lyric and the butterfly** (2026-11-23), above. Until then the
   grid was about seventy key words in a winding chain, searched by a beam
   that ranked how far its front had moved; that film is in git at `db89aae`.

## Decided by the user

- The story, above (2026-11-02).
- **Legal guardrail** (2026-11-02): the newspaper word game is never named, in
  the video, titles, descriptions, tags, code or these notes, and its look is
  never used: no tiled board with coloured feedback rows, no keyboard, no
  green/yellow/grey, no win messages. A crossword is older than it and safe.
- The simple approach of the maze and Conman is the one to follow (2026-11-10).
- The crossword, every letter drawn on (2026-11-13).
- An IVORY on every "Ivory", never two in one frame; pan, hold while words go
  in, pan on (2026-11-13).
- One rate for every word, **3.5 letters a second** (2026-11-13; "the same
  rate that they do now", 2026-11-23).
- **Red is only her name**, in its letters; no highlight, box or wash on any
  word, hers included (2026-11-13).
- No unsung words at all (2026-11-13).
- The ground is charcoal with a slight chalk texture (2026-11-23).
- **All of the lyrics on the board**, each word starting roughly when it is
  sung (2026-11-23).
- No more writing "ivory" over and over in the instrumental (2026-11-23).

Superseded: only the key words (2026-11-13, by all of the lyrics); never more
than two or three words at once (2026-11-13, by words starting when sung);
the interlude as her name jumbled (2026-11-13).

## Open

- **The butterfly is Claude's answer to "come up with something"**, not yet
  seen. Things the user may want to turn: red or the lyric's blue; whether it
  sits through the bridge; whether it should come back at the end.
- The butterfly is red and is not her name, which bends "red is only her
  name". It stands for her, so it was let through.
- Blocks are framed at 0.97–1.06×, against 1.05–1.5× before, and her name
  alone at 1.32×: the price of every word. A square is about 64 px in a
  1600-wide frame.
- Five one-letter words are squares on their own, which no crossword has.
- The final pull-back shows all seven IVORYs at once (asked 2026-11-13, not
  answered).
