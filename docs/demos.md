# The demo shelf (`/tools/demos`)

An unlisted page that plays whatever is sitting in `public/demos/`, so any
working version of anything is one URL away from wherever you are.

## Adding a demo

1. Drop the audio file into `public/demos/`. One flat folder — no subfolders.
2. Add it to a playlist in `public/demos/playlists.json`.
3. Commit and push. Amplify redeploys and the file is live.

```json
{
  "playlists": [
    {
      "name": "ship to stockholm",
      "note": "Four passes at the second verse.",
      "tracks": [
        { "title": "take 1 — full band", "file": "stockholm-take-1.wav" },
        { "title": "take 4 — guitar only", "file": "stockholm-take-4.wav", "note": "keeper?" }
      ]
    }
  ]
}
```

A file can appear in as many playlists as you like. A playlist is only an
ordering; nothing is moved or copied.

## Formats, and what it costs to load

The player does not care about the extension — anything the browser can decode
works, and switching a track from `.wav` to `.mp3` is a one-word edit to its
`file`. What the extension decides is how long the thing takes to arrive:

| format | per minute of stereo audio | a 3-minute demo |
| --- | --- | --- |
| WAV, 44.1 kHz / 16-bit | ~10.1 MB | ~30 MB |
| FLAC | ~5–6 MB | ~17 MB |
| MP3, 320 kbps | ~2.4 MB | ~7 MB |
| MP3, 192 kbps | ~1.4 MB | ~4 MB |
| Opus, 128 kbps | ~1.0 MB | ~3 MB |

Playback starts before the file finishes — S3 serves range requests, so the
browser buffers a little and begins — and once a file is in the offline cache
its size stops mattering for playback entirely. What size still costs is the
*first* download and the disk it occupies: a WAV shelf takes ten times longer to
cache and ten times the storage, and on cellular that first visit is the one you
will feel. For a listen on the road, 192 kbps MP3 is indistinguishable from the
master through anything short of monitors. Keep WAVs here for the takes you
actually need to hear uncompressed.

Note also that `.wav` is gitignored globally in this repo (raw masters are too
large for git); `public/demos/` is the one exception, carved out explicitly in
`.gitignore`. Every WAV committed here is in the repo's history forever, so it
is worth being deliberate about which ones go in.

## What makes it fast

### Offline copies (`app/composables/useDemoCache.ts`)

The big one. Every file is stored in the browser's **Cache API**, so the first
visit downloads the shelf and every visit after that plays it off local disk —
no network at all. Measured on the current two-track shelf: **900 bytes** over
the wire on a warm load (three HEAD revalidations) for 52 MB of audio, and
**2–4 ms** from clicking a row to the `playing` event, including the 50 MB WAV.

- **"keep offline copies"** (on by default, remembered per browser) downloads
  everything in the background when the page is first hit. Turn it off and
  nothing is stored; the player streams as normal.
- **"cache all"** does it on demand, one file at a time so the first track is
  playable while the rest arrive.
- **"clear"** throws the lot away.
- The dot on each row says where that take comes from: filled means it is on
  this device, outline means it will be streamed.

No service worker is involved. A worker's scope is its own directory, so one
registered under `/tools` could not intercept `/demos/*.wav`, and one at the
root would take control of the whole public site to serve one unlisted page.
The Cache API works directly in the page, so nothing outside `/tools/demos` is
touched.

**Staleness is handled.** Replace a mix in place, keep the filename, and a naive
cache would play last month's bounce forever. Every entry is revalidated on load
with a HEAD request and dropped if the ETag, `Last-Modified` or length has
moved, then re-downloaded. The player's in-memory element is dropped at the same
moment, so a take that changes underneath you cannot keep playing.

Storage is not unlimited and browsers may evict it under disk pressure; the page
asks for persistent storage on load, which Chrome usually grants silently. If a
file is ever evicted it simply streams from the network and re-caches.

### In-session (`app/composables/useDemoPlayer.ts`)

- **An element pool.** Every track touched keeps its own already-buffered
  `HTMLAudioElement`, so going back to one is instant. Six are kept; the rest
  are dropped and their buffers released.
- **Neighbour warming.** Selecting a track starts fetching the one either side
  of it in the current order. Toggle it off on cellular.
- **First track cued on load**, so the very first press of play does not pay to
  open the cache.
- **Keep playhead.** With it on, switching tracks carries the playhead across —
  so comparing the second chorus of four takes is four keypresses at the same
  point in the song rather than four scrubs.

Keyboard: space plays and pauses, ← and → step through the running order.

## Reordering

The up/down arrows on each row rearrange the running order, which is what
"next" and "previous" follow. It is in-memory only and deliberately so: a reload
is the way back to the order `playlists.json` declares. "reset order" appears
once something has been moved.

## Privacy

`/tools` and everything under it is `noindex, nofollow`, absent from
`sitemap.xml`, absent from the markdown mirrors and `llms.txt`, and not linked
from anywhere on the site. `/demos/**` additionally carries an `X-Robots-Tag`
header, since a header is the only way to mark a `.wav` or a `.json`.

The path is deliberately *not* listed in `robots.txt`: a `Disallow` line would
publish the URL to everyone who reads it, which is the opposite of the point.

None of this is authentication. The site is a static bundle on S3, so there is
nothing to authenticate against — anyone who knows or guesses the URL can load
the page and stream the files. Unlisted, not private.
