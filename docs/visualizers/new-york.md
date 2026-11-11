# New York — against the grain

Track 6. [/visualizers/new-york](/visualizers/new-york). Film:
`shared/video/films/grain.mjs` (`grainFrame`, `GRAIN_BEATS`, `grainMood`). Score:
`app/config/newYorkScore.ts`. v1, 2026-11-10. **Not yet seen by the user.**

The song's core idea, from the brief: *Rebellion*.

## What it does

Seen from above: a crowd of small ink arrows, hundreds of them, all streaming
toward a yellow light off the right edge, stepping in time with the record's
click. One of them is a little bigger and a little slow. The others tell him
("They say…": the ones round him turn and point at him), jostle him and pass
him. Before the first chorus he hesitates and stops, and the crowd parts round
him like water round a rock. On the first "don't" he turns round and goes red,
and for the rest of the song he pushes the other way.

Nobody follows at first: the second "don't" sends a red ring out from him and
the crowd only shivers. He goes upstream through the break while knots of the
crowd run into him. In verse 2 a light flares at another edge for every city
they tell him to move to (Memphis, Nashville, Austin, L.A., Detroit, by the
compass with New York in the east) and the whole crowd swings to point at each
in turn, tugging him that way; "bargain, bend, abandon, exploit" are four ranks
of massed arrows that ram him.

From the second chorus every refusal is a ring, and the arrows behind him that
it reaches turn round and fall in: a wedge in drilled ranks, him at its point,
the crowd parting at his nose and pressing along its flanks. Seven refusals in
"No, no, no, no / No, I won't go" make it bigger than the plate is tall. On
"New York" the light flares and the crowd surges.

The instrumental is the crowd fighting back. On every bar a rank of massed
arrows charges down the plate and rams the wedge; each one drives it back
toward the light and strips a layer of followers, who turn back round and are
swept into the light, which grows. After eleven of them he is alone at the
light's mouth, still facing the other way, shaking with the holding. He is
still for a second, and on the third chorus's "don't" he pushes off again,
harder, pulling his first followers out of the light's mouth.

In the last section every one of the twelve "No"s is a ring and the wedge
spreads across the plate. Where the band stops under "I'm not going to", the
crowd stops dead. On the held "York" the last ring goes out slowly, a held
note, and the camera pulls back in one even move for the ten seconds the note
lasts: the turn runs out behind him faster than the frame widens, the light
goes out, and everything that turned with him is one great arrow, pointing
away, with him as its red tip. End card when the voice lets go (3:26.4).

Red is only him and his rings. Yellow is only ever a light. The "Now" line on
the page shows what he is doing (`grainMood`).

## Jump to

| Time | Label | What happens |
| --- | --- | --- |
| 0:00 | Opening | The mark drawn on, then the title, then the black lifts off the crowd already streaming. |
| 0:12 | Carried along | He is ink like the rest, a little bigger, a little slow. On "They say" (0:20) and "That easy dreams" (0:30) the ones round him turn to point at him; he is jostled on the words and overtaken. |
| 0:37 | **He turns** | He falters (0:35), stops (0:38.4, a second before the chorus) and the crowd parts round him. On "don't" (0:40.1) he turns round and goes red. The light flares on "lights" and the crowd surges at it. |
| 0:49 | Upstream | The second "don't" (0:49.9) is the first ring: nobody turns, they only shiver. He sets off upstream, a step a beat. Knots of the crowd run into him at 0:56.6, 1:01.4 and 1:06.3. |
| 1:08 | Five cities | Stopped at 1:07.9. "They said" and they all point at him; then a light flares at another edge on each city's word and the whole crowd swings to point at it and lunges, tugging him that way. |
| 1:20 | Four shoves | They point at him again on "That the only way", then four ranks ram him on "bargain" (1:21.6), "bend", "abandon" and "exploit" (1:23.8). He gives ground and gets it back. |
| 1:28 | **The first to follow** | "Don't" (1:28.9): a ring, and the first few arrows behind him turn round and fall in. "Don't" again (1:38.6): more. He pushes on with them. |
| 1:49 | No | Seven refusals, seven rings (1:49.8 to 1:56.3), the wedge bigger each time. On "New York" (1:57.5) the light flares and the crowd surges. |
| 2:01 | **The crowd fights back** | Eleven ranks, one on every bar from 2:04.8 to 2:29.2, the last three flat walls the height of the plate. Each drives him back and strips a layer of the wedge; the light grows. |
| 2:30 | Alone at the light | The last of them gone. He holds at the light's mouth, shaking, and is still from 2:35.8. |
| 2:36 | Again | "Don't" (2:37.1): he pushes off, hard, and they fall in again out of the light's mouth. "Don't" (2:46.9): more. The light shrinks back. |
| 2:57 | Twelve nos | Stopped at 2:57. Three lines of "No, no, no, no", a ring on every one, the wedge spreading across the plate. |
| 3:12 | **One great arrow** | "No", "won't", "not": three more. The band stops (3:13.7) and so does the crowd; it starts again with the band (3:15.0). On "York" (3:16.0) the slow ring and the one pull-back, to the whole arrow, complete by 3:25. The light is out by 3:22. |

The poster frame (before play) is 1:56.5: the wedge, a ring going out, the
crowd parting, the light.

## Decided by the user (2026-11-10)

- "The against the grain version is the best. Give me a fully fleshed out
  version on the new-york page. Make it as interesting/bold as you can. It
  should captivate attention throughout."
- General principles from Into the Wild and Conman apply: top-down and simple,
  paper and ink and one red thing with a will, a story told by motion, every
  event on a measured word or a downbeat, the actor in place about a second
  before each sung section, one even pull-out at the end that shows what the
  whole thing was.

Everything else here is Claude's reading of that brief, built while the user
was away, and is open: the storyboard, the cities' lights, the ranks, the
ending.

## How it is built

A pure function of the clock, like every film. What needs a history is worked
out once per score (`planFor` → `build`, about 0.15 s):

- **The stream** is an endless lattice of arrows (58 × 50, jittered) sliding
  right by `PHI(t)`, a table integrated from a speed curve (slow through the
  cities, double in the instrumental, zero where the band stops) with a pulse
  on every beat of the 98.5 BPM click. In the instrumental the stream moves
  one lattice spacing a beat, so the whole crowd marches in step.
- **His path** is a velocity curve integrated the same way (`RX`), plus what
  knocks him: a lunge on every refusal, a recoil on every hit. His line stays
  between the same two rows of the crowd all song, so no arrow ever has to
  change sides of him; what shakes him vertically (jostles, tugs, hits) is
  drawn on his arrow alone (`oy`).
- **The wedge** is a region in his frame: a half-width profile `prof(x')` of
  length `Lw(t)`, which every ring adds to and every instrumental hit takes
  from, plus the great arrow's shaft (`Ls`), which grows behind the last
  ring's front. The stream is mapped round it,
  `|dy|' = (|dy|^2.5 + h^2.5)^(1/2.5)`, so the crowd parts at the nose,
  presses along the flanks (the deepest are shrunk away or the rim would be
  solid ink) and closes in behind the barbs. The profile the crowd flows round
  closes gently; the formation itself (`sharp`) is cut square.
- **Who turns** is simulated ring by ring (`simulate`): the free places in the
  formation (ranks 56 × 48 behind him) inside the wedge the ring makes are
  filled, nearest him first, by whoever is standing there when the ring's
  front reaches them, then by the nearest of the crowd outside, who come in to
  close the ranks. Each then keeps its place relative to him. An arrow due to
  turn is held to the wedge as it was when its ring set out, so the wedge
  growing never pushes it away first.
- **A rank** is a compression wave run down the lattice faster than the
  stream, its front a chevron aimed at his nose and timed to arrive on the
  word or the downbeat; the arrows in its core are drawn heavier.
- **The pull-out** is the only camera move: log-even from "York" to the end
  card, to 0.31. Far away the unturned crowd is drawn as dashes and thinned.

Cost: about 0.4 ms and 30 KB a frame for most of the song, 1.1 ms and up to
105 KB in the last seconds of the pull-out (1,300 turned arrows on the plate).

`grainPlate({ time, score, probe })` fills `probe` with every arrow drawn
(`[id, x, y, heading, scale]`); a scan of every arrow frame to frame at 60 fps
is how teleports were found and removed (none over 16 px a frame are left
outside the instrumental's hits, where the crowd relaxing into a stripped
wedge reaches 17).

## Not yet seen by the user: soft spots

- **Sync and motion have only been checked in stills and by the numbers.**
  Whether the march reads as stepping on the beat, whether a rank reads as a
  charge and whether the rings land on the words needs watching with the
  record.
- **The ranks** are bunched, heavier arrows. They read in a still; they may
  want to be denser or darker in motion.
- **Holes in the crowd.** The arrows that fall in leave gaps behind the wedge
  that drift off downstream, and the big wedges leave an empty band behind
  their barbs (2:00, 3:10). It is honest (that is where they came from), but
  it is paper with nothing on it.
- **Closing the ranks.** For the largest rings some arrows cross a few hundred
  units to reach their places (up to about two seconds in flight).
- **The far crowd in the pull-out** is thinned and patchy round the great
  arrow, where it was recruited from.
- **The light behind the wedge** from about 3:05: the formation covers it, at
  half strength. It goes out over 3:16–3:22.
- **Verse 1 is the quietest stretch** (0:12–0:36): pointing, jostling,
  overtaking, nothing bigger.
- The cities' lights are small and unlabelled on purpose; whether five lights
  at the edges read as "five other places" is untested.

## The other four proposals

The Lights on the Shore, The Signpost, Out of Time and The Chain, with their
stills, are in git before this commit
(`tools/video-styles/visualizers/new-york.mjs`, the old version of this file).
