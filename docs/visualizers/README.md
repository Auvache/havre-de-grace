# Visualizers

One visualizer per song on *Into the Wild*, each at `/visualizers/<song>`
(unlisted, noindexed). The index at [/visualizers](/visualizers) is a list of
links. The pages carry the film or the stills and nothing else; **every word
about them lives here**.

## The standard

The Into the Wild maze ([into-the-wild.md](into-the-wild.md)) is the standard
every visualizer follows:

- **One picture idea for the whole song**, no cuts, drawn on the album's sheet:
  paper, black, one red thing travelling, and the lyric on one row in the margin.
- **The opening**: the band's mark drawn on black, then the song's Hairline
  title, then the black lifts (the live videos' clock). Titles are baked by
  `node tools/video-styles/titles/bake.mjs`.
- **The ending**: the end card on the last note or hit, then the mark.
- **The page**: title, film, transport, the "Now" line, and a jump-to list of
  times with short labels (`VisualizerPlayer`). Nothing else on the page.
- **Built from the record**: every event lands on a measured word or downbeat in
  the song's score (`app/config/<song>Score.ts`).

How to build or change one is the `music-video-creation` skill.

## The ten

| # | Song | State | Film |
| --- | --- | --- | --- |
| 1 | [Into the Wild](into-the-wild.md) | **Final** (2026-11-03), exported | `maze.mjs` |
| 2 | [Conman](conman.md) | Film, v2 (pinned) | `conman-heists.mjs` |
| 3 | [Goodbye, Norma Jeane](goodbye-norma-jeane.md) | Film | `marquee.mjs` |
| 4 | [Ivory](ivory.md) | Film, v1 | `blanks.mjs` |
| 5 | [Andalusia](andalusia.md) | Film, with the new opening; mp4 to re-render | `cartography.mjs` (album edition) |
| 6 | [New York](new-york.md) | Proposed stills | — |
| 7 | [Meet Me at the Horizon](meet-me-at-the-horizon.md) | Proposed stills (Nightmares recommended) | — |
| 8 | [Rocks in the Sea](rocks-in-the-sea.md) | Proposed stills | — |
| 9 | [Ship to Stockholm](ship-to-stockholm.md) | Proposed stills | — |
| 10 | [Ghost](ghost.md) | Proposed stills | — |

## Where things are

- Films: `shared/video/films/<film>.mjs`, one pure function of the song's clock.
- Pages: `app/pages/visualizers/`, using `app/components/visualizer/`.
- Proposed stills: drawn by `tools/video-styles/visualizers/<song>.mjs`,
  published to `public/visualizers/<song>/` with
  `SITE=1 node tools/video-styles/visualizers/build.mjs`.
- Review frames: `node tools/video-styles/frames.mjs` (`FILM=`, `SONG=`), for
  Claude's own checking only.
- **Everything the user is shown goes on the song's page** (decided 2026-11-05):
  mock-ups, stills and motion tests are `tests` on `VisualizerPlayer`, switched
  with the Test row or `?test=<key>` on `/visualizers/<song>`, never separate
  mp4s, sheets or screenshots. When one is picked it becomes the film and the
  rest are deleted.
- Export: `FILM=<film> SONG=<song> node tools/video-styles/mp4.mjs` into
  `exports/` (gitignored), for a finished film only.

The older printmaking films, the style suite, the kinetic film and every
`/music-videos` page were deleted on 2026-11-05. They are still in git at
`2e46d3c`.
