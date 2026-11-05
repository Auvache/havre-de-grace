# Andalusia — the chart

Track 5. [/visualizers/andalusia](/visualizers/andalusia). Film:
`cartographyAlbumFrame` in `shared/video/films/cartography.mjs`. Score:
`app/config/andalusiaScore.ts`.

The first film built, and kept as Andalusia's visualizer: the older Cartography
film, on the album's sheet, with the Into the Wild opening.

## What it does

The song as an admiralty chart, plotted as a passage plan on the real Earth. One
red line starts as a dot in Andalusia, goes round the world, and ends as a
pulsing dot at home, and every line it draws stays drawn. It is printed on the
album's sheet: the chart in paper, black and one red, with the lyric on one line
in the margin under it.

## Jump to (one per section)

| Section | What happens |
| --- | --- |
| Intro | The band's mark is drawn on black, then the title, as the live videos open; the black lifts off Andalusia at province scale (10.6–12.0 s). As the intro ends, the dot appears. |
| Verse 1 | The red line wanders the province, one leg per sung line: Sevilla, Córdoba, Granada, Málaga, Cádiz and back. The dot grows the whole way. |
| Verse 2 | The line leaves on the verse's first word and lands on "Stockholm". The camera rides it, pulling back over the North Sea on the way. |
| Chorus | Round the North Sea: Copenhagen, Oslo, London, Dublin, one leg per line. The lyric is in the margin, so the chart stays at full strength. |
| Verse 3 | Pulled back to a hemisphere. San Diego, Bangkok, Budapest and Baton Rouge, spread evenly across the verse rather than landing as sung. |
| Chorus | America: Baton Rouge to New York, Phoenix, Mexico City and Toronto. |
| Oh-oh-oh | The whole globe, twice round eastward through fifteen cities. One eased-out clock drives it, so the world spins down as it fills with red. No words, so the margin is empty. |
| Verse 4 | Home. Reykjavík to Andalusia, landing on the second "Andalusia". The dot breathes there for a few seconds, then the line leaves again two seconds into "Walk until my boots are faded blue", and from here nothing is named. |
| Final chorus | Round the world about twice more, unnamed, on one clock that eases in and out. It lands home two seconds into the last line, as a dot that pulses the way home did. The camera pulls straight back to the whole globe with the dot in the middle, and the end card cuts in on the guitar harmonic at 2:46. No line is drawn after the landing. |
| Outro | The shared ending: the lockup on pure black, taking over from the globe with no transition, then a hard cut to the credits. |

The poster frame (before play) is 9.8 s: the finished title, just before the
black lifts.

## How it is made

- The map is the Earth: Natural Earth's coastline, public domain, baked into
  `shared/video/geo/earth.mjs` by `tools/video-styles/geo.mjs`. It is drawn on
  an orthographic globe at three levels of detail, and each landmass is clipped
  at the horizon and closed along the limb, so the far side of the world is not
  drawn.
- Every leg is timed off the score: a line's measured start, a place name's
  measured onset, or a section's boundaries. Retime the score and the film
  retimes itself.
- The camera rides the line by construction. A followed leg puts a camera key on
  each of its ends, eased with the same curve and on the same great circle as
  the red line, so the head stays in the middle of the frame and the world moves
  under it.
- The zoom is in the projection, not in a transform. The coast, the graticule,
  the red line and the type keep the same pen from a province to the whole
  world.

## State

2026-11-03 (commit 1618521): the film switched to the live opening (mark on
black, Hairline title, black lifts at 10.6–12.0), the maze's clock exactly. It
replaced the porthole "draw" opening because that title faded from both ends in
and read as ANDALUSI/NDALUSI/DALUS, which a reviewer reported as a misspelling.
Rule learned: anything leaving the screen should leave whole, never letter by
letter from the ends.

**Next:** the user checks the new opening, then re-render with
`FILM=cartography-album SONG=andalusia node tools/video-styles/mp4.mjs` (the
copies in `exports/` are from September, with the old intro).
