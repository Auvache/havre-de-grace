# Nuxt 4 Integration Brief: Interactive Record Player Album Page

Use this document as the implementation brief for the repo-aware coding agent. Place it in the project repo next to `record_player_css_mockup.html`, then ask the agent to read this file, inspect the repo structure, inspect the mockup HTML, and implement the Nuxt 4 version.

## 1. Goal

Integrate the single-file HTML/CSS/JS mockup from `record_player_css_mockup.html` into the Nuxt 4 site as a real interactive album page for **I Want To Be Yours and Other Songs**.

The final page should preserve the accepted mockup behavior:

- A CSS-drawn record player centered inside a large scrollable scene.
- Users can scroll in all directions around the record player.
- The black record spins only when a track is active.
- The record spin ramps down over 1 second when moved to Off.
- The tonearm is truly free-draggable while the user is dragging it.
- The selected track only changes after the tonearm is released.
- The playable record area has 9 contiguous vinyl-style zones with approximated real vinyl spacing: wider zones near the outside, tighter zones near the inside.
- Dropping the arm inside any zone snaps it to the beginning of that track.
- Clicking a groove on the record selects that track and animates the arm there.
- Track buttons select tracks and move the arm visually.
- Track changes update the URL using `?track=1`, `?track=2`, etc.
- Track URL updates should not create browser history entries.
- Direct visits to `?track=4` should render Track 4 visually, but audio may wait for the first user gesture because of browser autoplay rules.
- Each track automatically plays its audio file after a user-initiated selection.
- Moving to Off fades the current song out over 1 second, stops it, and resets it.
- When a song ends, the arm animates to the next track and starts playing it.
- After Track 9 ends, the arm returns to Off and the record stops.
- Off state shows only the album cover art and one paper with an album story.
- Song states show a messy/collage-like layout with separate papers for lyrics, 1-2 story papers, annotations, and a couple of images.
- Song-state papers/images fade out and the next set fades in over about 1 second.
- All elements except the record player should appear in more or less unique positions for each track.
- Lyrics are static on a piece of paper, not synced.
- No visible play/pause/volume/scrub controls.
- Same interaction model on desktop and mobile: drag arm, click/tap grooves, click/tap track buttons, keyboard controls where supported.

## 2. Important Nuxt 4 assumptions

Before coding, inspect the repository and confirm its actual structure. Nuxt 4 commonly uses the `app/` directory for pages, components, composables, and assets, while `public/` remains at the project root for static files served without build processing.

Default target structure:

```txt
app/
  pages/
    i-want-to-be-yours-and-other-songs.vue
  components/
    album-record-player/
      RecordPlayerScene.vue
      Turntable.vue
      AlbumCollage.vue
      TrackControls.vue
  composables/
    useRecordPlayer.ts
  assets/
    css/
      record-player.css
shared/
  types/
    album-record-player.ts
public/
  audio/
    i-want-to-be-yours-and-other-songs/
      1.mp3
      2.mp3
      3.mp3
      4.mp3
      5.mp3
      6.mp3
      7.mp3
      8.mp3
      9.mp3
  images/
    i-want-to-be-yours-and-other-songs/
      album-cover.png
      track-1-a.png
      track-1-b.png
      track-2-a.png
      track-2-b.png
      ...
```

Adjust this structure to match the repo if it already uses a different convention, but do not place `public/` inside `app/`.

## 3. Repo-aware questions to answer before implementation

The agent with repo access should answer these before making changes:

1. Does the project already use Nuxt 4's `app/` directory structure, or is it still using a legacy/top-level `pages/` and `components/` setup?
2. What route should host the album page? Default: `/i-want-to-be-yours-and-other-songs`.
3. Should the album page use the sitewide layout, or should it disable the layout for a full-bleed interactive scene?
4. Does the project use Tailwind, UnoCSS, CSS modules, SCSS, or plain CSS? Choose the least disruptive styling path.
5. Is the site deployed at the domain root, or under a base path? This affects static asset URLs.
6. Are audio files really `.mp3`, or are they `.wav`, `.m4a`, or another format?
7. Will the real audio files be placed in `public/audio/i-want-to-be-yours-and-other-songs/`, or somewhere else?
8. Will artwork PNGs be placed in `public/images/i-want-to-be-yours-and-other-songs/`, handled by Nuxt Image, or imported from `app/assets/`?
9. Are the real song titles, lyrics, annotations, stories, credits, and alt text stored in code, Markdown/content files, a CMS, or a JSON/data file?
10. Should `?track=off` be used for Off, or should Off simply remove the `track` query param? The current mockup uses `?track=off`.
11. Does the project have an existing SEO/meta helper that should be used for page title, description, Open Graph image, and canonical URL?
12. Does the project have strict TypeScript, lint, formatting, test, or accessibility checks that the implementation must pass?
13. Does the repo have any global scroll-locking, layout wrappers, or fixed headers that would interfere with a giant scrollable artboard?
14. Should the track-control buttons be visually hidden on small screens, or remain visible as in the mockup?
15. Should the page be SSR-rendered for visible content, or should the whole interactive component be client-only? Default recommendation: SSR the static markup, but gate browser-only behavior inside `onMounted`.

## 4. Asset path decisions

The mockup currently uses this audio path pattern:

```ts
audio/i-want-to-be-yours-and-other-songs/${number}.mp3
```

In Nuxt, files placed in `public/` are served from the site root. To avoid route-relative path bugs on nested pages, prefer this runtime URL:

```ts
/audio/i-want-to-be-yours-and-other-songs/${number}.mp3
```

If the site is deployed under a non-root `app.baseURL`, use Nuxt's base-aware helper or the project's existing asset helper so the resolved URL still works after deployment. Keep the logical folder requested by the project owner: `audio/i-want-to-be-yours-and-other-songs/TRACK_NUMBER_HERE`.

Recommended image paths for placeholders and later real PNGs:

```ts
/images/i-want-to-be-yours-and-other-songs/album-cover.png
/images/i-want-to-be-yours-and-other-songs/track-1-a.png
/images/i-want-to-be-yours-and-other-songs/track-1-b.png
/images/i-want-to-be-yours-and-other-songs/track-2-a.png
/images/i-want-to-be-yours-and-other-songs/track-2-b.png
```

Keep the CSS placeholder art as a fallback when a PNG path is empty or the file is not ready.

## 5. Recommended implementation approach

### Option A: Componentized Nuxt implementation, preferred

Convert the mockup into Vue/Nuxt components and a composable instead of embedding the entire HTML file as raw static HTML.

Suggested split:

- `app/pages/i-want-to-be-yours-and-other-songs.vue`
  - Page route.
  - Sets SEO/head metadata.
  - Imports and renders `<RecordPlayerScene />`.
  - Optionally disables the standard layout if the page needs a full-bleed artboard.

- `app/components/album-record-player/RecordPlayerScene.vue`
  - Owns the top-level scene, state wiring, CSS variables, audio element, and event handlers.
  - Uses `useRecordPlayer()` for reusable logic.

- `app/components/album-record-player/Turntable.vue`
  - Renders the record player, record, tonearm, and record click target.
  - Emits tonearm and groove events upward.

- `app/components/album-record-player/AlbumCollage.vue`
  - Renders Off content and track content papers/images.
  - Receives current/rendered track and layout data.

- `app/components/album-record-player/TrackControls.vue`
  - Renders Off and Track 1-9 buttons.
  - Emits selected track.

- `app/composables/useRecordPlayer.ts`
  - Contains track math, audio behavior, URL behavior, spin loop, and state transitions.

- `app/assets/css/record-player.css`
  - Contains the ported CSS from the mockup, ideally scoped by a top-level class to avoid changing the rest of the site.

### Option B: Single `.vue` component, acceptable for first integration

A first pass may put the whole feature in one page or one component, as long as it is type-safe, SSR-safe, and isolated from the rest of the site. This is less maintainable but faster.

A good first-pass file could be:

```txt
app/pages/i-want-to-be-yours-and-other-songs.vue
```

with:

```vue
<template>
  <!-- ported mockup markup -->
</template>

<script setup lang="ts">
// ported and Nuxt-safe logic
</script>

<style scoped>
/* ported CSS, with :global only where absolutely necessary */
</style>
```

Use Option A unless the repo owner asks for a fast prototype.

## 6. Data model to create

Create a strongly typed data model for the 9 tracks plus the Off state.

Suggested type:

```ts
export interface TrackLayout {
  lyrics: [x: number, y: number, rotate: number]
  storyA: [x: number, y: number, rotate: number]
  storyB: [x: number, y: number, rotate: number]
  annotations: [x: number, y: number, rotate: number]
  imageA: [x: number, y: number, rotate: number]
  imageB: [x: number, y: number, rotate: number]
}

export interface AlbumTrack {
  number: number // 0 for Off, 1-9 for tracks
  title: string
  subtitle?: string
  label: string
  accent: string
  accent2: string
  accentDark: string
  audioSrc: string
  lyrics?: string[]
  storyA?: string
  storyB?: string
  annotations?: string[]
  imageACaption?: string
  imageBCaption?: string
  albumCoverPng?: string
  artworkPngA?: string
  artworkPngB?: string
  artworkAAlt?: string
  artworkBAlt?: string
  layout?: TrackLayout
}
```

Use filler content for now:

- Track titles: `Track 1`, `Track 2`, etc.
- Lyrics: placeholder lines that clearly mention the track number.
- Stories: placeholder text that clearly identifies story paper 1 and story paper 2.
- Annotations: 3 placeholder notes per track.
- Image captions/alt text: placeholder text that identifies the track.

Leave clear comments in the data file for replacing placeholders with real song titles, lyrics, stories, annotations, image paths, image alt text, and audio extensions.

## 7. Core constants to preserve

Preserve these behavioral constants from the accepted mockup unless the project owner requests changes:

```ts
const TOTAL_TRACKS = 9
const OFF_ANGLE = -88
const OFF_RELEASE_BOUNDARY = -70
const PLAY_OUTER_ANGLE = -62
const PLAY_INNER_ANGLE = -28

// Approximated vinyl spacing: outer tracks are wider, inner tracks are narrower.
// No gaps between zones.
const TRACK_BOUNDARIES = [0, 0.15, 0.285, 0.41, 0.525, 0.635, 0.735, 0.83, 0.918, 1] as const

const TURNTABLE_PIVOT_RATIO = { x: 395 / 430, y: 64 / 300 }
const RECORD_OUTER_RATIO = 0.89
const RECORD_INNER_RATIO = 0.28
const SPIN_RATE = 360 / 3800
const STOP_RAMP_MS = 1000
const START_RAMP_MS = 520
const PAGE_TRANSITION_MS = 1000
```

## 8. URL/query behavior

Use the page query param as the public track state:

- Off: `?track=off`, or remove the query param if the repo owner prefers.
- Track 1: `?track=1`
- Track 9: `?track=9`

Important requirements:

- Use `router.replace`, not `router.push`, so track changes do not add history entries.
- Preserve unrelated query params if the site uses them.
- Validate invalid query values and fall back to Off.
- On direct page load with `?track=4`, render Track 4 visually but do not rely on autoplay working.
- Do not create a route watcher loop. Guard updates so changing internal state and replacing the URL do not endlessly trigger each other.

Suggested helpers:

```ts
function readTrackFromQuery(value: unknown): number {
  if (typeof value !== 'string' || value.toLowerCase() === 'off') return 0
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 9 ? parsed : 0
}

function trackToQuery(trackNumber: number): string {
  return trackNumber === 0 ? 'off' : String(trackNumber)
}
```

Suggested Nuxt usage:

```ts
const route = useRoute()
const router = useRouter()

async function replaceTrackQuery(trackNumber: number) {
  await router.replace({
    query: {
      ...route.query,
      track: trackToQuery(trackNumber),
    },
  })
}
```

Do not import `useRoute` directly from `vue-router`; use Nuxt's composables.

## 9. Browser-only behavior and SSR safety

The feature uses browser APIs:

- `window`
- `document`
- `Audio` / `<audio>` element methods
- `requestAnimationFrame`
- `performance.now()`
- pointer events
- `getBoundingClientRect()`
- `scrollTo()`

Keep all direct browser API calls inside client-only lifecycle code such as `onMounted`, event handlers, or guarded utilities.

Required cleanup in `onUnmounted`:

- Cancel record spin animation frame.
- Cancel audio fade animation frame.
- Clear transition timers.
- Remove any event listeners added manually to `window` or `document`.
- Pause audio if the component is destroyed.

Avoid hydration mismatches:

- The initial rendered track should be deterministic from the route query.
- Any viewport measurements and `centerRecordPlayerInViewport()` should run only after mount.
- If the implementation uses `<ClientOnly>`, keep a simple fallback so the page is not blank while hydrating.

## 10. Interaction behavior to implement

### Tonearm drag

- On `pointerdown`, set `userHasInteracted = true` and start dragging.
- While dragging, update only the arm angle visually.
- Do not change track content/audio while dragging.
- On `pointerup` or `pointercancel`, calculate the zone from the final arm angle.
- Snap the arm to the beginning of the resulting track.
- If released in the Off area, fade out and stop audio.
- If released in Track 1-9, start that track from the beginning.

### Groove click/tap

- Clicking or tapping the record groove area should calculate the track from radial distance.
- The arm should animate to the beginning of that track.
- The selected track should play from the beginning.

### Track buttons

- Buttons should include Off and 1-9.
- Buttons should update visual content, move the arm, update URL, and start audio for tracks.
- Buttons should set `aria-pressed` correctly.
- Use real song titles in button `aria-label`s once available.

### Keyboard

Preserve or improve keyboard access:

- Tonearm has `role="slider"`.
- `aria-valuemin="0"`, `aria-valuemax="9"`, and dynamic `aria-valuenow`.
- Dynamic `aria-valuetext`, using real song titles later.
- `Home` moves to Off.
- `End` moves to Track 9.
- Arrow keys or Page Up/Down move between tracks.
- Record click target can use Enter/Space to cycle tracks or select the next track.

## 11. Audio behavior

Use one `<audio ref="audioEl" preload="none" />` element unless the repo already has a media abstraction.

Behavior:

- On selecting Track N, set `src` to the track audio file, reset `currentTime` to 0, set volume to 1, and call `play()`.
- Catch `audio.play()` errors silently or log them in development only. Browser autoplay restrictions are expected.
- On Off, fade volume to 0 over 1000 ms, pause, reset `currentTime` to 0, then restore volume to 1.
- On track change from one track to another, reset to the start of the new track and play it.
- On `ended`, choose the next track. After Track 9, choose Off.
- Do not simulate endings with timers; real audio files will be added.

Use this default audio URL factory unless the repo owner chooses a different asset strategy:

```ts
function audioSrcForTrack(trackNumber: number) {
  return `/audio/i-want-to-be-yours-and-other-songs/${trackNumber}.mp3`
}
```

## 12. Layout and animation behavior

The mockup uses CSS custom properties for scene layout. Preserve that approach because it is easy to update per track.

Example layout data:

```ts
const layoutByTrack: Array<TrackLayout | null> = [
  null,
  { lyrics: [544, 362, 10], storyA: [1410, 370, -7], storyB: [466, 842, -12], annotations: [1388, 798, 8], imageA: [1544, 1030, -9], imageB: [632, 1072, 5] },
  { lyrics: [1398, 342, -11], storyA: [490, 414, 8], storyB: [1402, 846, 12], annotations: [546, 928, -6], imageA: [1534, 572, 7], imageB: [754, 314, -8] },
  // Continue with all 9 layouts from the mockup.
]
```

On track change:

1. Add an `is-changing` class.
2. Fade/move existing papers/images out.
3. Halfway through the 1-second transition, update the rendered track content and layout CSS variables.
4. Remove `is-changing`, allowing the new papers/images to fade in.

Off state:

- Show only `.album-cover` and `.album-story`.
- Hide all song-only papers/images.

Song state:

- Hide the album cover and album story.
- Show lyrics, story A, story B, annotations, image A, and image B.

## 13. CSS isolation

The mockup CSS currently styles `html` and `body` directly. Do not accidentally change the whole site.

Recommended isolation strategy:

- Wrap the page in a top-level class like `.record-player-page`.
- Move global body/background/min-width behavior onto that wrapper where possible.
- Give the scene its own giant dimensions with CSS vars: `--scene-w: 2200px; --scene-h: 1600px;`.
- Make the page/container scrollable in both directions.
- Avoid setting global `body { min-width: 2200px; }` unless the page disables the normal layout and the change is scoped to that route.

Possible page wrapper:

```vue
<template>
  <div class="record-player-page">
    <RecordPlayerScene />
  </div>
</template>
```

Possible CSS direction:

```css
.record-player-page {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background:
    radial-gradient(circle at 50% 46%, rgba(255,255,255,.44), transparent 31rem),
    linear-gradient(135deg, #d7f5ff 0%, var(--sky) 52%, #96d2ed 100%);
}

.record-player-page .scene {
  width: var(--scene-w);
  height: var(--scene-h);
}
```

The current mockup centers the page by scrolling the window. In a Nuxt layout, it may be better to center the scrollable wrapper instead:

```ts
function centerRecordPlayerInViewport(container: HTMLElement) {
  container.scrollTo({
    left: Math.max(0, (container.scrollWidth - container.clientWidth) / 2),
    top: Math.max(0, (container.scrollHeight - container.clientHeight) / 2),
  })
}
```

Use `window.scrollTo()` only if the page truly owns the whole document scroll.

## 14. Artwork/PNG integration

The mockup includes CSS art and comments for future PNGs. In the Nuxt version, support real PNGs while keeping CSS fallback art.

Implementation options:

### Option 1: CSS background image fallback

Keep the `.art` divs. Bind the image URL to a CSS variable.

```vue
<div
  class="art"
  :class="{ 'has-png': Boolean(track.artworkPngA) }"
  :style="{ '--png-art': track.artworkPngA ? `url(${track.artworkPngA})` : 'none' }"
/>
```

Keep this comment near the art data or component:

```ts
// PNG hook: replace these placeholders with real PNG artwork files.
```

### Option 2: Real `<img>` elements

Use real `<img>` tags if the repo prefers standard images for accessibility, lazy loading, and SEO. Keep the CSS art hidden behind them or shown only when no path exists.

```vue
<img v-if="track.artworkPngA" :src="track.artworkPngA" :alt="track.artworkAAlt" />
<div v-else class="art css-art-fallback" aria-hidden="true">...</div>
```

For track collage art, real alt text matters. Do not ship empty alt text unless an image is purely decorative.

## 15. Page metadata

Add page metadata through the repo's existing SEO pattern. Default values:

- Title: `I Want To Be Yours and Other Songs`
- Description: `An interactive record player album page with lyrics, stories, annotations, and artwork for each track.`
- OG image: use album cover once available.

Suggested Nuxt page shell:

```vue
<script setup lang="ts">
useHead({
  title: 'I Want To Be Yours and Other Songs',
  meta: [
    {
      name: 'description',
      content: 'An interactive record player album page with lyrics, stories, annotations, and artwork for each track.',
    },
  ],
})
</script>
```

Use the site's existing `useSeoMeta`, `defineOgImage`, or equivalent if present.

## 16. Accessibility requirements

Minimum accessibility requirements:

- Tonearm uses `role="slider"` with correct value attributes.
- Buttons have descriptive labels, eventually with real track titles.
- Track content changes use `aria-live="polite"` where appropriate, but avoid over-announcing too many elements at once.
- Images have meaningful alt text once PNGs are added.
- Clickable record groove area has a label and keyboard interaction.
- Track state is visible in text near the controls.
- Do not rely on color alone to show the selected track.
- Preserve focus outlines unless replacing them with a clearly visible custom focus style.

## 17. Testing checklist

After implementation, run the repo's normal commands. Use the actual package manager found in the repo.

Common examples:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm dev
pnpm build
```

Manual acceptance tests:

1. Page loads without hydration warnings.
2. Page works on direct load at `/i-want-to-be-yours-and-other-songs`.
3. Page works on direct load at `/i-want-to-be-yours-and-other-songs?track=1` through `?track=9`.
4. Invalid query values fall back to Off.
5. Changing tracks uses URL replacement, not history push. Browser Back should leave the page or go to the previous real route, not step through every selected track.
6. Record is black.
7. Record is not spinning in Off state.
8. Record spins when a track is active.
9. Record spin slows to a stop over about 1 second when Off is selected.
10. Tonearm free-drags while dragging.
11. Content/audio do not change until the arm is released.
12. Releasing over each zone selects the expected track.
13. The 9 zones have no dead spaces between them.
14. Outer tracks are easier/wider to hit than inner tracks.
15. Clicking/tapping the record chooses the correct track based on groove radius.
16. Track buttons move the arm visually and update content.
17. Audio starts from the beginning on track selection after a user gesture.
18. Moving to Off fades out audio for about 1 second and resets it.
19. Audio `ended` moves to the next track.
20. Track 9 `ended` moves to Off.
21. Song papers/images fade out and new ones fade in over about 1 second.
22. Off state shows only album cover and album story paper.
23. Song states hide album cover and album story paper.
24. Each song state has a distinct messy/collage layout.
25. Page is scrollable in all directions on desktop.
26. Page is scrollable in all directions on mobile.
27. Pointer/touch dragging works on mobile.
28. Keyboard controls work for the tonearm.
29. Focus styles are visible.
30. Production build succeeds.

## 18. Common pitfalls to avoid

- Do not update the selected track live while the arm is dragging. The owner explicitly chose update-after-release.
- Do not leave dead spaces between track zones.
- Do not use equal track zones unless deliberately changing the accepted design. The zones should approximate vinyl spacing.
- Do not use `router.push` for track changes. Use `router.replace`.
- Do not make the record spin in Off state.
- Do not instantly stop spin on Off; ramp down over 1 second.
- Do not instantly cut audio on Off; fade it out over 1 second.
- Do not add visible media controls unless requested.
- Do not hide the track buttons; they are part of the accepted functionality.
- Do not break browser autoplay expectations. A direct URL should render visually even if audio cannot autoplay.
- Do not apply the mockup's `body { min-width: 2200px; }` globally across the site unless the route is fully isolated.
- Do not use route-relative audio URLs on a nested route unless that is intentional.
- Do not forget to cancel animation frames and timers on component unmount.
- Do not ship missing alt text once real PNGs are added.

## 19. Suggested implementation prompt for Claude Opus 4.8

After placing this file and `record_player_css_mockup.html` in the repo, use a prompt like this:

```txt
Please implement the interactive record player album page described in NUXT_RECORD_PLAYER_INTEGRATION_BRIEF.md.

First inspect the repo structure and answer the repo-aware questions in the brief. Then inspect record_player_css_mockup.html and port the accepted behavior into Nuxt 4. Prefer a componentized implementation, but keep the first pass practical. Preserve the interaction behavior exactly: free dragging with update after release, contiguous vinyl zones, groove clicks, track buttons, URL query replacement, audio fade-out, spin ramp-down, auto-advance, Off state, and messy per-track collage layouts.

Use placeholder content for Track 1 through Track 9. Use audio files from /audio/i-want-to-be-yours-and-other-songs/1.mp3 through /9.mp3 unless the repo already has a better asset convention. Leave clear comments where real PNG artwork should be added.

Run the repo's lint/typecheck/build commands and fix any issues. Report the files changed and any remaining integration decisions.
```

## 20. Reference docs for the implementing agent

- Nuxt 4 directory structure: https://nuxt.com/docs/4.x/directory-structure
- Nuxt 4 upgrade guide and app/public directory notes: https://nuxt.com/docs/4.x/getting-started/upgrade
- Nuxt 4 components directory: https://nuxt.com/docs/4.x/directory-structure/app/components
- Nuxt 4 `useRoute`: https://nuxt.com/docs/4.x/api/composables/use-route
- Nuxt 4 `useRouter`: https://nuxt.com/docs/4.x/api/composables/use-router
- Nuxt public directory: https://nuxt.com/docs/4.x/directory-structure/public

## 21. Implementation summary

Build this as a Nuxt-native component/page, not as an iframe. Use the HTML mockup as the visual and behavioral source of truth. Keep the design isolated, keep the page scrollable in every direction, use real audio paths, leave PNG hooks, and preserve the accepted interaction details exactly.
