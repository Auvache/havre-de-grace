# Ivory — the crossword

Track 4. [/visualizers/ivory](/visualizers/ivory) is **the crossword**, the
whole song (2026-11-13). Score: `app/config/ivoryScore.ts`. Film:
`shared/video/films/crossword.mjs` (`crosswordFrame`, `CROSSWORD_BEATS`).

| File | Owns |
| --- | --- |
| `shared/video/films/crossword.mjs` | The film: when every word is written, the camera, the drawing. |
| `shared/video/films/crossword/stations.mjs` | `STATIONS` (where the camera goes and what is written there), the grid search (`buildBeam`), its score (`judge`), the camera's shots (`shotsOf`) and the extra words (`addFill`, `FILL_POOL`). |
| `shared/video/films/crossword/layout.mjs` | The grid, **baked**: `node tools/video-styles/crossword/bake-layout.mjs 80` (about 20 s). |
| `shared/video/films/crossword/letters.mjs` | The alphabet in the titles' Hairline type, **baked**: `node tools/video-styles/titles/bake-letters.mjs`. |
| `tools/video-styles/crossword/check.mjs` | Walks the film at 30 fps for the rules below. Run it after any change. |

## The story (the user's, 2026-11-02)

He is in the crowd, she is on stage, and he falls for her in an instant. After
the show he goes to talk to her and misses his chance. "Ivory" is his name for
her; he never learns her real one.

## What the film does

A large blank crossword on the album's paper is filled in as the song goes.

- **Words.** The key words he sings, each starting on its measured onset; in
  the instrumental gaps, words of longing and missed chances (LONGING, ALMOST,
  STRANGER, WISTFUL, ENCORE, NEARLY, MISSED, CHANCE, TOOLATE, REGRET, MAYBE,
  SOMEDAY, GOODBYE, YEARNING), each from a beat; and five unsung **fill
  words** packed in to fill sparse frames, written on free beats.
- **Every letter is drawn on** stroke by stroke, the way the opening draws the
  title (the Hairline skeleton masks; six skeletons were added to
  `stroke-letters.mjs` for it: F J P Q X Z).
- **One rate: 3.5 letters a second**, for every word, IVORY included.
- **Never more than three words at once.** A sung word waits (from its onset)
  when three are already being written; a fill word goes where there is room,
  never while an IVORY is being written.
- **Every "Ivory" writes an IVORY, in red**: seven in the grid, written exactly
  like the other words, the red letters the only red in the film. A word that
  crosses one of her squares leaves it blank until her name is written, so
  her name always goes in whole.
- **No frame ever holds two written IVORYs** (until the final pull-back,
  which shows the whole finished puzzle).
- **The camera** pans to a station, holds still while its words go in, then
  pans on (cosine-eased, 2–4 s; at least 1.8 s, and late rather than quick
  when the words before are still being written). Within a station an IVORY
  gets its own shot, framed like any other. It moves for 52 s of the 182.
- **The puzzle** is a winding chain that starts bottom left, crosses the sheet
  and climbs, so the film moves from one side of it to the other and never
  goes back. After the last "Ivory" the camera pulls back to the whole thing,
  filled, and the end card comes on the last hit (182.42).

Jump-to moments (`CROSSWORD_BEATS`): 0:00 Opening · 0:09 First words · 0:20
Longing · **0:40 Ivory** · 0:46 California · 0:55 Ivory again · 1:02
Stranger · 1:22 Beside her · **1:35 Ivory, third** · 1:41 Paradise · 1:49
Ivory, fourth · 1:56 Missed chances · 2:09 Adam to her Eve · 2:21 Ivory,
fifth · 2:28 Alaska · 2:44 Ivory, sixth · 2:50 Goodbye · **2:53 The last
Ivory** · **2:56 The whole puzzle**. Poster 1:00.

## How the grid is made, and why

About seventy words cannot cover seven screens a frame apart if they are
placed greedily: every greedy and randomised build tried bunched up, doubled
back, or dead-ended between two close "Ivory"s. So:

1. **`buildBeam`**: words go in in the stations' order, each crossing one of
   the last four placed (never side by side). A partial grid is ranked by how
   far its front has moved along each station's heading (rightwards, wandering
   ±26°), how far it has moved away from every IVORY, and how compact each
   station stays; 300 kept per word. An IVORY within 13 columns and 7 rows of
   another is never allowed.
2. **`judge`**: two written IVORYs in any shot or move (with half a square of
   margin) costs 1000; frames wider than wanted, frames that are mostly bare
   paper, pans that hardly move or cross half the sheet, and going back over
   old ground cost less. The bake keeps the cheapest of 80 seeded beams.
   (A full square of margin made every grid fail, and the search then traded
   away everything else: shots at half zoom and a grid that wound back on
   itself. Half a square is right; `check.mjs` is the real test.)
3. **`addFill`**: fill words from `FILL_POOL` are packed into each shot's frame
   until it is about 40% puzzle, as many as the station's hold has time for
   at 3.5 letters a second. A close shot of IVORY can be filled by a word
   written in a nearby plain station that also has it in frame.
4. **Framing** (`shotsOf`): every shot frames its own words (1.4 cells of
   margin, 1.05–1.5×, wider only when they will not fit), then slides at most
   three cells across and one and a half down towards more puzzle.

**Word choice is geometry.** Between two close "Ivory"s the linking words must
be long and share letters with IVORY (TENNESSEE shares none; SOMEDAY was too
short and became YEARNING). A station's words are listed in grid order, which
need not be the order they are written (SURE cannot cross WOMAN, so SUNRISE is
placed first). Changing a station's words means re-baking and re-checking.

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

## Decided by the user

- The story, above (2026-11-02).
- **Legal guardrail** (2026-11-02): the newspaper word game is never named, in
  the video, titles, descriptions, tags, code or these notes, and its look is
  never used: no tiled board with coloured feedback rows, no keyboard, no
  green/yellow/grey, no win messages. A crossword is older than it and safe.
- The simple approach of the maze and Conman is the one to follow (2026-11-10).
- The crossword, filled with the lyric's key words and words of longing in the
  gaps, every letter drawn on (2026-11-13).
- An IVORY on every "Ivory", never two in one frame; pan, hold while a few
  words go in, pan on; never more than two or three words at once
  (2026-11-13).
- One rate for every word, **3.5 letters a second** (2026-11-13).
- **Red is only her name**, in its letters; no highlight, box or wash on any
  word, hers included (2026-11-13).
- A fuller screen: closer shots and more words (2026-11-13).

## Open

- The final pull-back shows all seven IVORYs at once (asked, not answered).
- The emptiest frames are the IVORY shots that hang off the grid's edge
  (0:41, 1:50); their stations hold too briefly to fit fill words.
