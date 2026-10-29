# Brief 2: The persistent player

Read `docs/redesign/README.md` first. Start after brief 1's layout has merged.

## Goal

One audio engine for the whole site, and the slim bar that follows people from
page to page. See `mockups/shots/home-fold.jpg` and `home-phone.jpg`, and the
bar at the bottom of every light mockup.

## The behaviour (from the README, restated because it's the spec)

- Bar: 68 px, fixed bottom, bone at ~88% with a backdrop blur, hairline top
  border, 2 px progress line in sea along the top edge. Left: 40 px cover,
  song, record. Centre: previous, play/pause (36 px outlined circle), next.
  Right: time (mono), "open the record" (links to the album page), close ×.
  Phone: song + play/pause only.
- Survives navigation. Starts only from a user action (hero play, a record's
  play, a track).
- `/listen`, `/seven-inch` (the record player pages, `layouts/listen.vue`):
  fade out ~300 ms and stop.
- Album page, different record: fade out and stop.
- Album page, same record: hand off. The album page's dock (brief 3) takes the
  same track and position and the bar fades under it. Expose one switch
  (`handOffOnSameAlbum`) so "always stop" is one line.
- × stops and hides until the next play.
- Media Session API metadata and controls (lock screen, headphones).
- Respect `prefers-reduced-motion` for the fades.

## Where to start

- `app/composables/useAlbumPlayer.ts` already owns "one audio element, reused"
  for album pages, track-addressed, with hash cueing. Decide whether the global
  player grows out of it or wraps it; don't end up with two engines fighting
  over audio. `useVinylDeck` (record player) and `useDemoPlayer` stay separate,
  but the global player must stop when they start.
- `app/utils/mediaClock.ts` is the smoothed clock the films use; brief 3's
  lyrics will read it, so the player should expose its element/clock.
- Mount the bar once (e.g. in `app.vue` or a shared layout wrapper) so it isn't
  torn down by layout changes. Check `layouts/home.vue`, `default.vue`,
  `dark.vue`, `listen.vue`.
- Brief 1 left a stub `usePlayer().playAlbum(slug, trackIndex?)`; replace it.

## Don't touch

Page layouts and styling beyond the bar (brief 1), album page content (brief 3).

## Done when

Playing from the homepage keeps going through Records → About → Letters; the
record player and the album-page rules behave as above; nothing double-plays;
`npm run generate` passes; a short screen recording or before/after
screenshots are in your summary.
