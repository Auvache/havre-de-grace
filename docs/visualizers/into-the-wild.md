# Into the Wild — the maze

Track 1. [/visualizers/into-the-wild](/visualizers/into-the-wild). Film:
`shared/video/films/maze.mjs` (`mazeFrame`). Score: `app/config/intoTheWildScore.ts`.

**Final (2026-11-03).** The code is tagged `into-the-wild-maze-final` and
exported to `exports/into-the-wild-maze-1080p.mp4` (the YouTube upload) and
`-2160p.mp4` (the master), 209.55 s including the 4 s end-card hold. It goes up
on YouTube once all the album's videos are done. This is the standard every
other visualizer follows ([README.md](README.md)).

## What it does

The mark drawn on, the title drawn on, then blank paper. A red dot comes in from
the left and the first maze is drawn round it; its only way out goes all the way
round, anticlockwise. The dot walks the way somebody walks a maze: it looks down
each corridor, won't take one it can see is a dead end or leads back where it
has been, goes straight for a door it can see, and stops when it is stumped. At
each door it stands still while the next maze is drawn round it, then goes on.
Its line fades out behind it.

It gains confidence through the first maze and keeps it through the first
chorus, then loses it slowly to nothing by the end of verse 2. When the horns
come in it melts down: stops and pulses harder and harder, then on the loudest
hit races every way, old ground and dead ends and all. Late in the horns it
comes round, slowing, and stops on the harmonic as they drop away; its
breathing slows, and on "headed" it sets out carefully, growing sure of itself.
In the last pull back the camera never stops: every maze was the middle of a
bigger one, and all of them the band's anchor, the dot in its stock. On the last
note, the mark.

The "Now" line on the page also shows the dot's mood (`moodAt`).

## Jump to

| Time | Label | What happens |
| --- | --- | --- |
| 0:00 | Opening | The mark drawn on, then the title, then the black lifts off the paper. |
| 0:11 | The way in | In from the left; once his line has faded the first maze is drawn round him, and on "To see if I can't lose my way" he sets off, all the way round it. |
| 0:29 | A door | He stops in the doorway while the second maze is drawn round him, then goes on, sure of himself. |
| 0:58 | Losing it | From the break to the end of verse 2 he slows, hesitates longer at forks, and stops longer when stumped. |
| 1:48 | **Meltdown** | The horns (1:51): he stops and pulses harder and harder; on the big hit at 1:56 he sprints all over, never the same way three times, turning back only at walls. |
| 2:21 | **Coming round** | From 2:24 he slows, and stops dead on the harmonic at 2:28; his breathing slows. |
| 2:30 | Sets out | On "headed" (2:32.5) he sets out carefully; a few wrong turns he puts right, and out through the door as the last chorus comes in (3:04.7). |
| 3:10 | **The anchor** | One steady pull back from 3:13: the maze he is in, then all of it, the band's anchor made of maze, held from 3:22.3, and the mark on the last note (3:23.8). |

The poster frame (before play) is 0:26: the second maze, sure of himself.

## Do not change

- **Nothing from the start of the tantrum (the horns, 1:50.8) on may change.**
  The user signed off on the meltdown, sprint, breath, walk out and anchor
  pacing after several rounds. Anything changed before 1:50.8 must leave
  `MAZE_WALK.segs` with `t0 >= 110.8` byte-identical and frames from about
  1:52.3 on rendering identically. The walk is re-simulated from `HORNS_AT` with
  the calm memory and `HORNS_PHASE`, so the walk before the horns must still
  bring him to (10,-10) in the third box (k=3) knowing the same cells; the knobs
  for that are `BUILD_SEED`, `HORNS_SEED` and `SEEDS[2]`, searched by script.
  Maze 3 and the mazes round it must not be re-laid.
- Don't change the film without being asked. If it must change, re-export and
  move the tag.
