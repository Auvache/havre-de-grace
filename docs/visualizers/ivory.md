# Ivory — back to the drawing board

Track 4. [/visualizers/ivory](/visualizers/ivory) shows **ten proposed stills,
one per idea**, and under them the first film, kept until one of the ten is
chosen. Score: `app/config/ivoryScore.ts`.

- The stills are drawn by `tools/video-styles/visualizers/ivory.mjs` and
  published with `SITE=1 node tools/video-styles/visualizers/build.mjs`.
- The first film is `shared/video/films/blanks.mjs` (`blanksFrame`), v1,
  2026-11-02.

## The story (the user's, 2026-11-02)

He is in the crowd, she is on stage, and he falls for her in an instant. After
the show he goes to talk to her and misses his chance. "Ivory" is his name for
her; he never learns her real one.

## Back to the drawing board (2026-11-10)

The user, on the first film:

> ivory: back to the drawing board. Give me 10 new screenshots for different
> alternate ideas on for the video. I like the "simple" approach that we have
> going for into the wild and conman. The game idea is great, but the execution
> isn't my favorite.

So the ten below are in the manner of the maze and the Conman map: seen from
above or drawn as a diagram, paper and black line, one red thing that travels,
people as dots, nothing explained in words. Butterfly blue is only ever hers.
Four of them are **the guessing game again**, played in pencil on paper instead
of on a tiled board (The Crossword; Five Blanks, in Pencil; The Letter Lock; A
Stroke a Guess). Six are **new pictures of the story** (The Room, The Orbit,
The Follow Spot, One Town Behind, The Flight Path, Written in Sand).

Each idea has one still, at a real moment of the record. Every one is a
function of the song's clock already (`frame({ time, score })`), so the still
shows what would have happened by then, and a chosen idea can grow into
`shared/video/films/` without being redrawn.

**Recommended: The Room.** It is the closest to what the maze and Conman do: a
plan, a crowd of dots, and one red dot with somewhere it wants to get to. The
whole story is in where he goes: in at the back, to the front through the
crowd, and the long way round to the stage door after she has left by it. It
also has the most to do across three minutes (the crowd, the show ending, two
ways out) and an ending that is one picture: him in the alley, nobody there.

**If the game should stay: The Crossword.** It keeps what the first film had
(his sung words tried against her name) and loses the board. The song supplies
the grid: SUNRISE, SHORE and MYSTERY run down through her five squares at their
I, O and Y, so the audience can read her name out of the words he does have,
and he cannot write it. Five Blanks, in Pencil is the barest version of the
same game and would be the quickest to build.

The Orbit is the simplest picture of the ten and the one most likely to hold
attention as pure motion.

### The Room

> Right up there beside her is where I want to be

The venue from above, drawn as a plan: the stage, the bar, the desk, the doors.
The crowd is ink dots, she is the blue dot on the stage, and he is the red dot
who came in at the back.

**Moves.** He works his way to the front through the crowd, a few steps on
every line, and stands at the lip of the stage through the choruses. In the
interlude the room empties. She leaves by the green room and the stage door
while he goes the long way round, and he reaches the alley after she has gone.

**Red.** Him, and the line of everywhere he has stood tonight.

Still: 1:24 · "Right up there beside her is where I want to be"

### The Crossword

> When I asked her for her name, she looked straight back at me

The guessing game as a crossword in pencil. The words he sings go into the grid
where they cross: WOMAN, SINGS, OCEAN, SHE and WHERE across, SUNRISE, SHORE and
MYSTERY down. The three down words run through her five squares, and those are
the squares he cannot fill.

**Moves.** Each word is written a letter at a time as it is sung, the red
cursor moving with it, and between words the cursor waits on the first of her
squares. On every "Ivory" his name for her is pencilled in and rubbed out. The
grid ends complete but for her row.

**Red.** The cursor: the square he is on.

Still: 1:29 · "When I asked her for her name, she looked straight back at me, oh"

### The Orbit

> When she moves, the universe can't help but stop and stare

She is the middle of everything: a blue dot, with the universe going round her
in rings. He is the red dot falling in from the edge of the sheet.

**Moves.** Everything turns, and on "stop and stare" everything stops. He
spirals in for the whole song, quicker the closer he gets, and is nearest when
she asks his name. He does not land: he goes round her and is thrown clear, off
the sheet, by the last "Ivory".

**Red.** Him and his way in: one line, wound round her.

Still: 1:12 · "When she moves, the universe can't help but stop and stare, oh"

### Five Blanks, in Pencil

> But too avoid the heartache, I'll keep this one just for me

The game with nothing but a pencil: five ruled blanks the width of the sheet.
Every five-letter word he sings is written on them, and rubbed out for the next.

**Moves.** Letters go down on their measured onsets. The rubbing out never
quite takes, so the blanks fill with the grey of everything he has tried. IVORY
is written like any other word and rubbed out like any other. The film ends on
five blanks and a smudge.

**Red.** The point of the pencil.

Still: 2:41 · "But too avoid the heartache, I'll keep this one just for me"
(AVOID, the nearest any real word comes, over the ghost of IVORY)

### The Follow Spot

> But when she asked me for my name, I forgot how to breathe

The house lights are down, so the plate is black. One pool of light on the
stage, with her in it. He is a red dot in the dark.

**Moves.** The light follows her across the stage; the crowd is only just
visible where it spills. He comes up through the dark, and when the room has
emptied he climbs onto the stage and stops at the edge of her light. She walks
out of it. The light stays where it was, he steps into it alone, and it goes
out.

**Red.** Him: the only colour in the dark.

Still: 2:16 · "But when she asked me for my name, I forgot how to breathe, oh"

### One Town Behind

> Walks just like Alaska with the snowfall in the trees

A map, in Andalusia's manner (the real coast, from the same data). She is on
tour: California, across to Tennessee, north to Alaska. He gets to every town
as she is leaving the next. The three places the song names are lettered, as a
map letters them; nothing else is.

**Moves.** Her dot goes town to town with a dotted line behind it; his follows
one stop back and turns her dotted line into his solid one, so the blue left on
the map is always exactly the distance between them. On "Alaska" she reaches
the last town. Then her line runs off the edge of the sheet, and he arrives.

**Red.** The road he has driven. The blue is what is still between them.

Still: 2:32 · "Walks just like Alaska with the snowfall in the trees"

### The Letter Lock

> Ivory

A five-ring letter lock, drawn in line. Every five-letter word he sings is
dialled in, ring by ring. It stays shut, on his name for her as well.

**Moves.** The rings turn on the sung words, one after another, and the pointer
moves to the ring his hand is on. On every "Ivory" the rings line up, he tries
the shackle twice, and it holds. After the last one he spins them off to
blanks.

**Red.** The pointer under the ring being turned.

Still: 0:42 · "Ivory"

### The Flight Path

> Her eyes are open ocean and blue butterfly wings

A butterfly's way across the page, all loops, from flower to flower, drawn
dotted the way a flight is drawn. He follows on foot in a straight line.

**Moves.** She goes on the sung words and rests on a flower in the gaps. Each
time his line reaches the flower she is on, she lifts off. At the end her
dotted line leaves the page and his stops at the last flower.

**Red.** His line, straight through every place she looped.

Still: 1:06 · "That there's a woman with flowers in her hair"

### Written in Sand

> Eyes that hit a sunrise like waves that hit a shore

The beach from above. He writes in the sand at the water's edge: every word he
has for her, small, and his name for her, large. The sea takes them. The sea is
drawn in her blue ("her eyes are open ocean"), the one idea where her colour is
a whole field.

**Moves.** A wave comes up the beach on every line and cuts off whatever it
reaches. He writes each five-letter word as he sings it, and traces IVORY again
on every "Ivory". The tide is coming in; after the last "Ivory" one long wave
takes the name and he does not write it again.

**Red.** The point he writes with, and his steps along the beach.

Still: 0:55 · "Oh, Ivory"

### A Stroke a Guess

> I could be the one she loves, the Adam to her Eve

The oldest pencil-and-paper guessing game: five blanks, and every wrong guess
costs a stroke of the drawing. The drawing is a butterfly, in her blue.

**Moves.** Each five-letter word is written in the list, struck out, and paid
for with one more stroke of the butterfly. His name for her is pencilled on the
blanks on every "Ivory" and does not stay. The fifteenth wrong word, AVOID,
finishes the drawing, and on the last "Ivory" it lifts off the page.

**Red.** The point of the pencil, wherever it is writing.

Still: 2:10 · "I could be the one she loves, the Adam to her Eve"

## The first film: five blanks (v1, 2026-11-02)

Still on the page, under the stills. A guessing game for her name, five
letters, six tries, three boards on one sheet. The guesses are the five-letter
words he sings, typed in as he sings them and turned over to show how close
they come: black for the right letter in the right place, blue for the right
letter in the wrong place, pencil for a letter that is not in her name. The row
he is on spins through letters between guesses. He wins the first two boards
only in his head, by calling her Ivory; on the third he forgets how to breathe,
a row goes by empty, and he runs out of tries. Only then does the answer come
up, and on the last "Ivory" it leaves five blanks. Every row as the film plays
it is `blanksGames(score)`.

Its jump-to moments: 0:00 Opening · 0:09 First sight · **0:40 Ivory** · 0:50 My
mystery · 0:58 Getting close · **1:27 Her name** · 1:45 Just for me · 1:52
Interlude · 2:08 The last chance · **2:16 Breathe** · 2:30 Walks · **2:44 The
answer** · **2:53 Five blanks**. Poster frame 0:44.

What the user said about it (2026-11-10): the game idea is great, the execution
is not their favourite. When one of the ten is chosen and built, this film and
`blanks.mjs` go.

## Decided by the user

- The story, above (2026-11-02).
- **Legal guardrail** (2026-11-02): the newspaper word game is never named, in
  the video, titles, descriptions, tags, code or these notes, and its look is
  never used: no tiled board with coloured feedback rows, no keyboard, no
  green/yellow/grey, no win messages. The four game ideas above are pencil
  games that are older than it: a crossword, ruled blanks, a letter lock, a
  stroke a guess.
- The simple approach of the maze and Conman is the one to follow (2026-11-10).

## Notes for whoever builds the chosen one

- The five-letter words he sings, in order, are `GUESSES` in `ivory.mjs`.
  No word in the song starts with V.
- The crossword's grid is checked when the module loads (every crossing must
  agree); the black squares outside the eight words are filled in by a fixed
  hash, so the grid is the same every time.
- The map uses `shared/video/geo/earth.mjs` (the coast Andalusia uses) in an
  Albers projection; the tour's towns are real places but are not named.
- These ten are stills: the motion described is what each function already
  does roughly, not a reviewed film. Expect the usual rounds.
