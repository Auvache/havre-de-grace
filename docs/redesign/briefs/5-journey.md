# Brief 5: The song journey

Read `docs/redesign/README.md` first. Start after brief 3 has merged the album
page shell.

## Goal

The part of the album page below the screen: a parallax journey through the
record's songs that people scroll at their own pace. It is **not** synced to
the music; the screen above is the synced part. Stefan's words: "snippets,
stories, animations, and pictures… it should flow like an experience and
nothing should feel empty or forced."

## Content model

A small content file per album (e.g. `content/music/<album>.journey.yml`, or
fields on the existing yml; pick one and say why). Per song, all optional:

- `snippet`: one to four lines of lyric (draft these; Stefan approves)
- `story`: Stefan's words only. Never write one. Launch without stories.
- `image`: a photo or film still (the Andalusia and Conman films have stills;
  frames can be pulled from `exports/*.mp4` or rendered from `shared/video/films`)
- `motif`: a small animation, reusing `shared/video/` (the cartography map for
  Andalusia, the wall for Conman, and so on)
- `film`: link to the song's music video if it has one (`app/pages/music-videos/`)

A song with nothing but a snippet gets a quiet row (see the compact rows in
`mockups/album-itw.html`); a song with more gets a full scene. Content decides
the size, never the template.

## Motion

- Scroll-driven parallax: layers (picture, lyric, motif) move at different
  rates; scenes ease in from a visible resting state. CSS scroll-driven
  animations where supported, a light IntersectionObserver fallback.
- Every scene has a small play control that plays that song in the page dock.
- Reduced motion: no parallax, plain fades.
- Phone: one column, parallax kept subtle.

## Into the Wild first

Draft snippets for all ten songs and pick a motif or still for at least four.
Then I Want to Be Yours (the Scarecrow scene has a real note from Stefan in
`mockups/album-iwtby.html`, adapted from VISION.md; check it with him).

## Don't touch

The screen and page shell (brief 3), the player (brief 2).

## Done when

Both albums' journeys are in, the snippet drafts are listed in your summary for
Stefan to approve, and desktop and phone recordings or screenshots are attached.
