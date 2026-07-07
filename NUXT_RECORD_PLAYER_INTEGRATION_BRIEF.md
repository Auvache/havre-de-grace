# Interactive Record Player — Implementation Brief (`/listen`)

> **Status:** Requirements locked after repo inspection + Q&A. This document supersedes
> the original generic brief. It reflects the **actual** Havre De Grace repo structure
> and the owner's decisions. The visual source of truth for interaction/behavior is
> `new-page-mockup.html`; the owner will restyle the player chassis and the paper/collage
> graphics later, so keep CSS cleanly swappable. The record/vinyl art is already good.

## 1. Goal

Build an interactive, CSS-drawn record player as a **multi-album listening hub** at `/listen`.
A record player sits centered in a large explorable scene; the album's songs live on the
vinyl as contiguous "zones," and papers/images are scattered around the scene like a collage.

Long-term this one page serves **all** albums (switchable). First pass wires up only the one
released, listenable album — *I Want to Be Yours and Other Songs* — but the data model and
components are generalized so any album with audio drops in later.

## 2. Locked decisions

| Area | Decision |
|---|---|
| **Routes** | `/listen` = album **picker landing**. `/listen/[album]` = record loaded, **Off** (not playing). `/listen/[album]/[track]` = arm animates to that track and **plays** it. |
| **Multi-album** | Only `i-want-to-be-yours-and-other-songs` is playable now. Build generalized for N albums. `into-the-wild` is unreleased (2026-07-17) with no public audio → shown as a locked "Coming soon" tile in the picker/switcher, not playable. |
| **Album switcher** | Build a **visible** in-page album switcher now (even with one playable album). |
| **Chrome** | Use the `influences` layout model: **immersive** `AppNavbar`, `h-screen` main, no footer, native document scroll disabled. |
| **Navigation** | **Hybrid** canvas: cursor **edge-steer glide** on desktop (feels like `/influences-new`) + **drag-to-pan** with momentum/spring on touch. Tonearm / record / track buttons take pointer priority and pause panning. Auto-center on the record player on load. Respect `prefers-reduced-motion`. |
| **Collage content** | **All filler** this pass — placeholder lyrics, stories, annotations, images. (Real lyrics already exist in the content YAML and swap in with a one-line change later.) |
| **Audio** | **Real** audio. Add an `audio` field to the track schema; source per track from `public/albums/<album>/music/<file>.mp3`. Fade-out on Off, auto-advance on `ended`, attempt-and-catch autoplay. |
| **Vinyl zones** | Generated **dynamically** for the album's track count (9 here, 10 for `into-the-wild`) — not the hardcoded 9-zone table. Approximate vinyl spacing (wider zones outside, tighter inside), no gaps. |
| **Track URL slug** | The track's **audio file basename**, e.g. `/listen/i-want-to-be-yours-and-other-songs/scarecrow`. In-page track changes use `router.replace` (no history spam). |
| **SEO** | Use the repo's `usePageSeo` composable per page. |
| **Existing pages** | Leave `/music/[slug]` album pages functionally intact; add a small "Listen on the record player →" link from the album page to `/listen/[album]`. |
| **Build/verify** | Owner verifies builds; agent skips build/typecheck/lint steps. |

## 3. Actual repo facts (confirmed)

- **Nuxt 4**, `srcDir: 'app/'`, `components` auto-import with `pathPrefix: false`, SSR on.
- Modules: `@nuxt/content` v3 (data collections), `@nuxtjs/tailwindcss`, `@nuxt/image`,
  `@nuxt/fonts`, `@nuxtjs/seo`, `@vueuse/nuxt`.
- Albums are `@nuxt/content` **data** collections defined in `content.config.ts`
  (`music/*.yml`). The existing album page is `app/pages/music/[slug].vue` (uses the
  `dark` layout). `i-want-to-be-yours-and-other-songs` is prerendered in
  `nuxt.config.ts → nitro.prerender.routes`.
- Real content for this album already lives in
  `content/music/i-want-to-be-yours-and-other-songs.yml`: 9 tracks with titles, durations,
  and full lyrics, plus liner notes and credits.
- **Audio files** (9, matching the 9 tracks) already exist:
  `public/albums/i-want-to-be-yours-and-other-songs/music/*.mp3` with semantic names
  (`i-want-to-be-yours.mp3`, `shades-of-blue-and-red.mp3`, `sky-blue.mp3`, `scarecrow.mp3`,
  `jesus-creek.mp3`, `demolition-woman.mp3`, `white-raven.mp3`, `song-for-the-sick.mp3`,
  `i-want-to-be-yours-demo.mp3`). **Filenames do not derive cleanly from titles**
  (e.g. "Demolition Woman - Live" → `demolition-woman.mp3`), so an explicit per-track
  `audio` field is required — do not slugify titles to guess filenames.
- Cover image: `/albums/i-want-to-be-yours-and-other-songs/images/i-want-to-be-yours-and-other-songs.jpg`.
- Layouts available: `default`, `dark`, `links` (no chrome), `influences` (immersive navbar,
  `h-screen`). Theming via `usePageTheme` (sets `data-theme` / `data-page-gradient` on `<html>`
  resolved per route). SEO via `usePageSeo`.
- **Navigation reference — `/influences-new`:** the `InfluenceGrid` component under the
  `influences` layout. Navigation is **cursor edge-steer glide** (mouse toward the edges
  pans the canvas via a translate transform, with a dead-zone + speed ramp), *not* scrollbars
  or drag. `pointerdown` pauses the glide. `document/body overflow` is set to `hidden` on
  mount and restored on unmount. This is desktop-only (no hover on touch) — hence the hybrid
  navigation decision above.

## 4. Route / page structure

```txt
app/pages/listen/
  index.vue              # album picker landing
  [album]/
    index.vue            # album loaded, Off state (record not playing)
    [track].vue          # album loaded, arm animates to track slug + plays
```

Behavior:

- **`/listen`** — picker: playable albums (released + has audio) are active tiles; unreleased
  albums (e.g. `into-the-wild`) render as locked "Coming soon" tiles. Selecting an album
  routes to `/listen/[album]`.
- **`/listen/[album]`** — validate the album exists and is listenable (else 404 / redirect to
  `/listen`). Render the scene in **Off** state. Do not autoplay.
- **`/listen/[album]/[track]`** — validate album + track slug. Render the scene, set selected
  track, animate the arm to that track, and attempt `audio.play()`. On a cold direct load the
  browser may block autoplay until the first user gesture — attempt-and-catch, don't assume it plays.
- In-page selection (arm release, groove click, track button, keyboard, auto-advance) updates
  the route with `router.replace` — Off → `/listen/[album]`, track → `/listen/[album]/[slug]` —
  so Back doesn't step through every selection. Guard against route↔state watcher loops.
- Thin page files; all three render the same `<RecordPlayerScene>` with props derived from
  route params. Prerender `/listen` and `/listen/[album]` (track routes need not be prerendered).

## 5. Component / composable split

```txt
app/components/listen/
  RecordPlayerScene.vue   # scene root: hybrid pan/glide wrapper, CSS vars, <audio>, state wiring, switcher slot
  Turntable.vue           # deck, record, tonearm, groove click target; emits arm/groove events
  AlbumCollage.vue        # Off content (cover + album story) and per-track papers/images (filler)
  TrackControls.vue       # Off + track buttons; aria-pressed
  AlbumSwitcher.vue       # visible album chooser (active + locked "coming soon" tiles)
app/composables/
  useRecordPlayer.ts      # dynamic zone math, arm angle, audio behavior, spin loop, transitions, URL sync
  useListenCanvas.ts      # hybrid edge-steer (desktop) + drag-to-pan (touch); composes with useCanvasPan
app/assets/css/
  record-player.css       # ported mockup CSS, scoped under a wrapper class; html/body globals moved to wrapper
shared/types/             # ListenAlbum, ListenTrack, TrackLayout additions
```

Prefer this componentized split. Keep browser-only work (`window`, `document`, `Audio`,
`requestAnimationFrame`, `performance.now`, pointer events, `getBoundingClientRect`) inside
`onMounted` / event handlers / guarded utilities, and clean up all rAF loops, timers, and
listeners in `onUnmounted` (also pause audio on destroy).

## 6. Data model

Extend the existing `@nuxt/content` track schema in `content.config.ts`:

```ts
tracklist: z.array(z.object({
  title: z.string(),
  duration: z.string().optional(),
  lyrics: z.string().optional(),
  audio: z.string().optional(),   // NEW: e.g. "/albums/<album>/music/scarecrow.mp3"
})),
```

Populate `audio` for each of the 9 tracks in
`content/music/i-want-to-be-yours-and-other-songs.yml`. The URL track slug is derived from the
`audio` basename (e.g. `scarecrow`).

Derived per-track view model (built in the composable/page from content + filler):

```ts
interface TrackLayout {
  lyrics: [x: number, y: number, rotate: number]
  storyA: [x: number, y: number, rotate: number]
  storyB: [x: number, y: number, rotate: number]
  annotations: [x: number, y: number, rotate: number]
  imageA: [x: number, y: number, rotate: number]
  imageB: [x: number, y: number, rotate: number]
}

interface ListenTrack {
  number: number            // 1-based track index within the album
  slug: string              // audio basename, used in the URL
  title: string             // real title from content (or filler this pass)
  audioSrc: string          // from content `audio`
  accent: string; accent2: string; accentDark: string
  // Filler this pass — clearly marked as placeholder:
  lyrics?: string[]; storyA?: string; storyB?: string; annotations?: string[]
  imageACaption?: string; imageBCaption?: string
  artworkPngA?: string; artworkPngB?: string; artworkAAlt?: string; artworkBAlt?: string
  layout?: TrackLayout
}
```

`number: 0` / an `Off` pseudo-state drives the Off view (album cover + album story only).
Leave clear comments where filler is replaced by real stories, annotations, image PNGs, and
where lyrics can be wired from `content` (they already exist).

## 7. Behavioral constants

Preserve the accepted arm/spin/timing constants from the mockup, but make the track zones dynamic.

```ts
const OFF_ANGLE = -88
const OFF_RELEASE_BOUNDARY = -70
const PLAY_OUTER_ANGLE = -62
const PLAY_INNER_ANGLE = -28

const TURNTABLE_PIVOT_RATIO = { x: 395 / 430, y: 64 / 300 }
const RECORD_OUTER_RATIO = 0.89
const RECORD_INNER_RATIO = 0.28
const SPIN_RATE = 360 / 3800
const STOP_RAMP_MS = 1000
const START_RAMP_MS = 520
const PAGE_TRANSITION_MS = 1000
```

**Dynamic zones:** replace the hardcoded 9-entry `TRACK_BOUNDARIES` with a generator that,
given `trackCount`, returns `trackCount + 1` boundaries in `[0, 1]` approximating vinyl spacing
(monotonic, wider zones toward the outside, tighter toward the label, no gaps). The mockup's
9-track table is the reference for the *shape* of that curve.

## 8. Interaction behavior (unchanged from the accepted mockup)

- **Tonearm drag:** `pointerdown` sets `userHasInteracted` and begins dragging (free-drag,
  visual only). Do **not** change track/audio while dragging. On `pointerup`/`pointercancel`,
  compute the zone from the final arm angle, snap the arm to that track's start, and either
  start it (tracks 1..N) or fade out (Off).
- **Groove click/tap:** compute the track from radial distance on the record; animate the arm
  there and play from the start.
- **Track buttons:** Off + 1..N; move the arm, update content, update URL, start audio; set
  `aria-pressed`.
- **Keyboard:** tonearm `role="slider"` with `aria-valuemin/max/now/text`; `Home`→Off, `End`→last
  track, arrows/PageUp/Down step tracks. Record target supports Enter/Space.
- **Auto-advance:** on `ended`, go to the next track; after the last track, return to Off (arm
  parks, record spins down).
- The record is black, spins only when a track is active, and ramps its spin down over ~1s on Off.

## 9. Audio behavior

One `<audio preload="none">` element. On selecting track N: set `src` from the track's `audioSrc`,
reset `currentTime = 0`, volume 1, `play()` (catch autoplay errors silently / dev-log only).
On Off: fade volume to 0 over ~1000ms, pause, reset, restore volume. On `ended`: advance
(last → Off). No timer-simulated endings.

## 10. Navigation / canvas (hybrid)

- Full-viewport wrapper (`h-[100dvh]`, `overflow-hidden`, native scroll disabled on mount,
  restored on unmount — as `InfluenceGrid` does).
- The `--scene-w × --scene-h` scene is translated via a single `translate3d` transform.
- **Desktop:** cursor edge-steer glide (dead-zone + ramp), bounds-clamped, paused while a pointer
  is pressed or while interacting with the tonearm/record/buttons.
- **Touch:** drag empty space to pan with momentum + spring-back to bounds (reuse the existing
  `useCanvasPan` composable). Dragging that starts on the tonearm/record/a button does its own
  thing and must not pan the canvas (stop propagation / hit-test the target).
- Auto-center on the record player on mount and on resize.
- Pointer math (arm angle, groove radius) uses `getBoundingClientRect` in viewport coordinates,
  which stays correct under the canvas transform.

## 11. Collage layout / transitions

Per-track paper/image positions come from CSS custom properties set from `layout` data (as in
the mockup). On track change: add `is-changing`, fade/move current papers out, swap rendered
content + layout vars at the midpoint of the ~1s transition, then fade the new set in.
Off shows only the album cover + album story; song states hide those and show
lyrics / story A / story B / annotations / image A / image B (all filler this pass).

## 12. CSS isolation

The mockup styles `html`/`body` directly — **do not** leak that globally. Wrap the scene in a
top-level class (e.g. `.record-player-page`), move the background/min-size behavior onto that
wrapper, and scope all mockup CSS beneath it. Keep the giant scene dimensions in CSS vars
(`--scene-w`, `--scene-h`). The player chassis and paper styling will be redesigned later —
keep selectors and structure easy to restyle.

## 13. Accessibility

Tonearm slider semantics; descriptive button labels (real titles once un-fillered);
`aria-live="polite"` on content regions without over-announcing; meaningful `alt` once real PNGs
land; labeled + keyboard-operable record target; visible focus styles; don't rely on color alone
for selected state.

## 14. Artwork / PNG hooks

Keep CSS placeholder art now. Support real PNGs later via either a CSS `--png-art` background
variable (with a `has-png` class) or real `<img>` elements with alt text. Leave the existing
"PNG hook" comments near the art data/components.

## 15. Open items deferred to later passes

- Real lyrics wired from content (data already present — trivial swap).
- Real per-track stories, annotations, and image PNGs (need copy/assets from owner).
- Redesign of the player chassis and paper/collage graphics (owner will art-direct).
- Enabling additional albums (e.g. `into-the-wild`) once released with public audio.
