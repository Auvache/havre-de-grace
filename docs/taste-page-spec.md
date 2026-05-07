# Influences Page Specification

## Overview

A new page on the Havre De Grace site that showcases albums that have inspired or deeply resonate with the artist. The page is an explorable, pannable 2D canvas — a spatial constellation of musical influences with the Havre De Grace logo at the center and album covers scattered outward like stars in a night sky. Distance from center = personal significance.

## Route

`/influences`

## Core Concept

- The page is a large 2D canvas that extends well beyond the viewport in all directions
- At the center: the **Havre De Grace logo** (white version, same as the splash screen — `assets/images/logo-white.png`)
- ~20 albums are scattered around the center in all directions
- **Proximity to center = how much the artist loves/is influenced by the album** (absolute favorites closest, more niche picks further out)
- The user explores by **panning** — click-and-drag (desktop) or touch-drag (mobile) to move around the canvas
- The layout is **organic and natural, like stars in the night sky** — no grid, no even spacing, no rigid rings
- No minimap, no zoom controls — purely exploratory and mysterious
- Purely visual — no intro text, headings, or copy on the page. Just the logo, albums, and the canvas.

## Entry Animation & Album Reveal

The entrance is slow and atmospheric — a constellation materializing from darkness.

### Initial Load
1. The Havre De Grace logo fades in at center (~1s fade, viewport starts centered on it)
2. After a brief pause (~500ms), only the albums **currently within the viewport** begin to fade in
3. These initial albums fade in with a staggered delay — closer albums (lower tier) appear first, outer albums slightly later
4. Fade-in duration per album: ~800ms-1200ms, with 100-200ms stagger between each

### Scroll-Triggered Reveal
- Albums that start **outside the viewport** remain invisible (opacity 0) until the user pans them into view
- When an off-screen album enters the viewport (even partially), it fades in with the same slow ~800ms fade
- **Once an album has become visible, it stays visible permanently** — it does not fade out when panned away again
- Track revealed state per album (a simple `Set<string>` of revealed album IDs)
- This creates a sense of discovery: the user is "finding" albums as they explore

## Data Source

JSON configuration file at `content/taste/albums.json`:

```json
{
  "albums": [
    {
      "id": "kid-a",
      "title": "Kid A",
      "artist": "Radiohead",
      "coverImage": "/images/taste/kid-a.jpg",
      "tier": 1,
      "description": "This album changed how I think about sound. The way Radiohead abandoned conventional rock structure and embraced electronic textures opened a door I never closed.",
      "listenLinks": {
        "spotify": "https://open.spotify.com/album/...",
        "appleMusic": "https://music.apple.com/album/..."
      }
    }
  ]
}
```

### Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique slug identifier |
| `title` | string | Yes | Album name |
| `artist` | string | Yes | Artist/band name |
| `coverImage` | string | Yes | Path to album cover image (in `public/images/taste/`) |
| `tier` | number (1-5) | Yes | 1 = absolute favorite (closest to center), 5 = niche/peripheral |
| `description` | string | Yes | Personal reflection on why this album matters to the artist |
| `listenLinks` | object | No | Optional streaming links (`spotify`, `appleMusic` URLs) |

### TypeScript Interface

Add to `shared/types/index.ts`:

```ts
export interface TasteAlbum {
  id: string
  title: string
  artist: string
  coverImage: string
  tier: 1 | 2 | 3 | 4 | 5
  description: string
  listenLinks?: {
    spotify?: string
    appleMusic?: string
  }
}
```

## Layout & Positioning

### Canvas

- The canvas is a large `<div>` container, significantly larger than the viewport (approximately 3-5x viewport dimensions, scaling with album count)
- On page load, the viewport is centered on the logo
- Albums are positioned using **polar coordinates** from center, converted to x/y placement:
  - **Tier 1** (absolute favorites): ~0-15% of canvas radius from center
  - **Tier 2**: ~15-30% radius
  - **Tier 3**: ~30-50% radius
  - **Tier 4**: ~50-70% radius
  - **Tier 5** (niche/peripheral): ~70-100% radius
- Within each tier band, albums are placed at **varied angles** with **randomized offset** from the ideal radius — this prevents rigid ring patterns and creates the organic star-field feel
- A **seeded random** approach (based on album `id`) ensures positions are deterministic across page loads but look natural
- **Collision detection**: after initial placement, nudge any overlapping albums apart so no covers overlap

### Scalability

- The system must work with ~10 albums and scale gracefully to 50+
- As albums are added, the canvas size grows proportionally (compute canvas dimensions from album count)
- Adding a new album only requires adding a JSON entry with a `tier` value — position is computed automatically
- The positioning algorithm should redistribute naturally without manual coordinate entry

### Center Element

- The Havre De Grace logo (`assets/images/logo-white.png`), displayed at the exact center of the canvas
- Size: `clamp(6rem, 16vw, 12rem)` — prominent but not overwhelming
- Subtle glow or soft radial light behind it to give a sense of emanation
- The logo is static (not clickable, not draggable)

## Interaction

### Panning / Navigation

- **Desktop**: Click-and-drag anywhere on the canvas to pan. The cursor should change to `grab` (default) and `grabbing` (while dragging). Moving the cursor in any direction while dragging moves the canvas in that direction.
- **Mobile**: Touch-drag to pan
- **Momentum/inertia**: On release, the canvas continues to glide briefly in the drag direction, decelerating smoothly
- **Scroll wheel**: Disabled / no behavior. The page does not scroll — all movement is via drag-panning only. Prevent default on wheel events within the canvas.
- **Boundary constraints**: The user cannot pan infinitely — stop at the edges of the canvas with a soft elastic bounce-back
- **No return-to-center shortcut** — the user drags back manually to find the logo again
- No minimap, no zoom controls, no on-screen navigation UI
- **Click vs. drag disambiguation**: If the pointer moves less than 5px between `pointerdown` and `pointerup`, treat it as a click (opens album modal). If it moves 5px or more, treat it as a drag (pans canvas, does not open modal).

### Viewport Proximity Scaling (Always Active)

As the user pans, album covers **grow slightly when they are closer to the center of the visible viewport** and shrink back when panned away. This creates a dynamic, breathing feel to the canvas — like a lens or gravitational pull at the center of your view.

- Compute each album's distance from the **viewport center** (not the canvas center) on every frame during panning
- Albums at or near viewport center: scale up to `~1.12x`
- Albums at the edges of the viewport: `1.0x` (no scaling)
- Albums off-screen: no computation needed (skip for performance)
- The scaling is a smooth continuous function (e.g., `1 + 0.12 * (1 - distance / maxDistance)`) — not stepped or snapping
- Transition: applied via CSS `transition: transform 200ms ease-out` so changes feel fluid, not jerky
- This effect is **additive with hover**: an album near viewport center that is also hovered gets both the proximity scale and the hover scale (capped at ~1.18x total to avoid looking oversized)
- On mobile: same proximity scaling applies during touch-drag panning
- `prefers-reduced-motion`: disable this effect (all covers stay at `1.0x`)

### Album Hover (Desktop Only)

- Album cover scales up subtly: `transform: scale(1.08)` with a smooth `300ms` ease transition (stacks with proximity scaling, capped at ~1.18x)
- A label appears below the cover (fading in) showing:
  - **Album title** (Jost, `--font-size-body`, white)
  - **Artist name** (Jost, `--font-size-label`, muted/uppercase, `--color-muted-dark`)
- The label should not overlap other album covers (position it directly beneath the hovered cover)
- On mobile, title/artist are not shown on the canvas — they appear only in the detail modal

### Album Click / Tap — Detail Modal

Clicking or tapping an album opens a detail view:

#### Desktop: Centered Card Overlay
- A semi-transparent dark backdrop covers the canvas (e.g., `rgba(0, 0, 0, 0.75)`, `backdrop-filter: blur(8px)`)
- A centered card appears with smooth scale-up animation (from 0.95 to 1.0 + fade in)
- Card contents (vertically stacked):
  - Album cover image (larger, e.g., `min(400px, 70vw)` square)
  - Album title (heading style)
  - Artist name (label style, muted)
  - Description text (body style, the personal reflection — typically 3-5 sentences)
  - Listening links row: Spotify and Apple Music icons/buttons (only if `listenLinks` provided)
- Card styling: dark surface (`--color-bg-dark` background), rounded corners (`--radius-lg`), subtle border
- Card max-width: `min(480px, 90vw)` — sized for 3-5 sentence descriptions without excessive whitespace
- Close: click the backdrop, click the X button (top-right of card), or press `Escape`

#### Mobile: Full-Screen Takeover
- The detail view fills the entire screen
- Same content as desktop card, but laid out full-width with more vertical breathing room
- Scroll if content overflows
- Close: X button (top-right), or swipe down gesture
- Smooth slide-up entrance animation

### Keyboard Accessibility

- `Tab` cycles focus through album covers (in tier order, closest to furthest)
- `Enter` or `Space` on a focused album opens the detail modal
- `Escape` closes the modal
- Arrow keys pan the canvas (when no modal is open)
- Focus ring visible on focused album (`--color-accent` outline)
- `prefers-reduced-motion`: disable pan inertia, fade-in stagger, and scale transitions

## Visual Design

### Theme & Background

- Dark theme with `blackout` gradient (consistent with homepage and music pages)
- The dark background makes album covers pop like stars against a night sky
- Optional subtle enhancement: a very faint radial glow at the center (behind the logo) using a CSS radial gradient, giving a sense that influences emanate from the artist

### Album Covers

- **Square aspect ratio**, all **uniform base size**:
  - Desktop: `clamp(80px, 12vw, 140px)`
  - Mobile: `clamp(60px, 18vw, 100px)` — slightly smaller but still comfortably tappable (minimum 60px touch target)
- Rounded corners: `--radius-md` (0.7rem)
- Subtle box-shadow: soft dark shadow to lift covers off the background
- On hover: slight scale-up (1.08x) + enhanced shadow
- Images loaded lazily (native `loading="lazy"`) for covers not in the initial viewport

### Typography

- All text uses site font **Jost**
- Hover labels:
  - Title: `--font-size-body`, weight 400, white
  - Artist: `--font-size-label`, weight 500, uppercase, `--color-muted-dark`
- Modal:
  - Title: `--font-size-subheading`, weight 450
  - Artist: `--font-size-label`, uppercase, muted
  - Description: `--font-size-body`, weight 350, `line-height: 1.65`
  - Listening links: icon buttons with small labels

### Listening Link Icons

- Spotify: green Spotify icon or a neutral icon with "Listen on Spotify" text
- Apple Music: Apple Music icon or similar neutral treatment
- Styled as small pill buttons or icon links beneath the description
- Open in new tab (`target="_blank" rel="noopener"`)

## Technical Implementation

### File Structure

```
app/
  pages/
    influences.vue              # Page component
  components/
    influences/
      InfluenceCanvas.vue       # The pannable canvas + positioning logic
      InfluenceAlbum.vue        # Individual album cover (hover behavior)
      InfluenceModal.vue        # Detail overlay (desktop card / mobile full-screen)
      InfluenceCenterLogo.vue   # Center logo with glow effect
  composables/
    useCanvasPan.ts             # Pointer/touch panning with momentum
    useAlbumPositions.ts        # Tier-based positioning algorithm
    useViewportProximity.ts     # Scales albums based on distance to viewport center
    useAlbumReveal.ts           # Tracks which albums have been revealed (viewport enter → fade in, stays visible)

content/
  taste/
    albums.json                 # Album data

public/
  images/
    taste/                      # Album cover images (600x600 JPG/WebP)

shared/
  types/
    index.ts                    # Add TasteAlbum interface
```

### Canvas Approach

Use **CSS transforms on a DOM container** (not HTML5 `<canvas>`):
- A wrapper div fills the viewport (`100vw x 100dvh`, `overflow: hidden`)
- Inside: a large container div with all album covers and the center logo positioned via `position: absolute` with `left`/`top` in pixels
- Panning applies `transform: translate(x, y)` to the container
- This keeps album covers as real DOM elements — accessible, stylable, clickable, and compatible with Vue transitions

### Positioning Algorithm (`useAlbumPositions.ts`)

```
Input: albums[] with tier values, canvas dimensions
Output: { albumId: { x: number, y: number } }

1. Define canvas center point
2. Compute max radius = min(canvasWidth, canvasHeight) / 2 * 0.85
3. Define tier bands:
   - tier 1: [0.05, 0.15] of max radius
   - tier 2: [0.15, 0.30]
   - tier 3: [0.30, 0.50]
   - tier 4: [0.50, 0.70]
   - tier 5: [0.70, 1.00]
4. For each album:
   a. Generate a seeded random angle (0-2PI) based on album.id hash
   b. Generate a seeded random radius within the tier band
   c. Convert polar (angle, radius) to cartesian (x, y) offset from center
5. Run collision detection pass:
   - For each pair, if distance < coverSize * 1.4, push apart along their connecting vector
   - Repeat until no overlaps (max 50 iterations)
6. Return final positions
```

### Panning Composable (`useCanvasPan.ts`)

- Track pointer/touch events on the wrapper element
- On `pointerdown`: record start position, set `grabbing` cursor
- On `pointermove`: compute delta, apply to canvas transform
- On `pointerup`: calculate velocity from last few frames, apply momentum with `requestAnimationFrame` decay loop
- Boundary clamping: compute min/max translate values from canvas size vs viewport, with elastic overscroll that springs back
- Expose reactive `offset` ref for the current translate position

### Viewport Proximity Composable (`useViewportProximity.ts`)

- On each frame (during panning or after momentum settles), compute the viewport center in canvas-space using the current pan offset
- For each **visible** album (rough check: is the album's canvas position within ~1 viewport width/height of the viewport center), compute Euclidean distance from viewport center
- Map distance to a scale factor: `scale = 1 + 0.12 * max(0, 1 - distance / (viewportDiagonal / 2))`
- Apply the computed scale to each album's DOM element via a reactive ref or direct style binding
- Use `requestAnimationFrame` during active panning for smooth updates; stop the loop when panning is idle
- Skip albums that are fully off-screen (no DOM reads needed for those)

### Album Reveal Composable (`useAlbumReveal.ts`)

- Maintains a reactive `Set<string>` of album IDs that have been revealed
- On each pan frame (piggyback on the proximity calculation loop), check if any unrevealed album's canvas position falls within the viewport bounds (with a small buffer, e.g., 50px inside edges so the reveal starts just as the cover becomes visible)
- When an album enters the viewport for the first time, add its ID to the revealed set — this triggers a CSS `opacity: 0 → 1` transition (~800ms) on that album's component
- Once revealed, an album is never hidden again regardless of panning
- On initial page load, compute which albums are within the starting viewport and reveal those with the staggered entry animation (delay based on tier)

### Integration with Existing Site

1. **Navbar**: Add "influences" to the `navLinks` array in `AppNavbar.vue` (lowercase, matching existing style): `{ label: 'influences', to: '/influences' }`
2. **Simplified transparent navbar on this page**: The `/influences` page uses a stripped-down navbar that preserves the immersive feel:
   - **Always fully transparent** — no solid background on scroll, no border. The navbar floats over the canvas.
   - **No left-side logo/artist name** — omit the "Havre de Grace" text link (the HdG logo is already at the canvas center)
   - **Links only, top-right** — the navigation links (music / about / contact / influences) are positioned in the top-right corner, same styling as current nav links (`nav-link` class, lowercase, `/` separators)
   - **Mobile**: hamburger button top-right, opens the existing `MobileNavOverlay` as normal
   - **Implementation**: The simplest approach is a prop or route-aware computed on `AppNavbar.vue` (e.g., `isImmersive`) that conditionally hides the logo and forces transparent background. Alternatively, create a dedicated `influences` layout in `app/layouts/` that uses a minimal header component. Either approach works — choose whichever keeps the code cleaner.
   - The navbar must sit above the canvas (`z-index` higher than the canvas wrapper) so links remain clickable
   - Nav link text color: white (`--color-text-dark`) to contrast against the dark canvas
   - **Top gradient scrim**: A subtle gradient overlay at the top of the canvas area (`linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)`, ~80-100px tall) sits beneath the nav links and above the canvas. This prevents album covers from visually colliding with the nav text as they pan underneath. The scrim is purely cosmetic (pointer-events: none) so it doesn't block canvas interaction.
3. **Theme config**: Add to `pageThemeConfig.ts`:
   ```ts
   {
     match: /^\/influences\/?$/,
     config: { theme: 'dark', gradient: 'blackout' },
   }
   ```
4. **Prerender**: Add `/influences` to `nitro.prerender.routes` in `nuxt.config.ts`
5. **SEO**: Set page title ("Influences — Havre De Grace"), description, and OG image via `usePageSeo()`
6. **Layout**: Either the `default` layout with immersive mode, or a dedicated `influences` layout — see navbar notes above

## Page Transition

The `/influences` page uses a **custom slower fade-to-black** transition instead of the standard page transition (360ms fade + translateY).

### Entering `/influences`
- The current page fades to black (~600ms, opacity → 0 with no translateY movement — a pure fade)
- Brief hold on black (~200ms)
- The influences canvas fades in from black (~800ms)
- Total transition: ~1.6s — noticeably slower and more cinematic than the standard 360ms

### Leaving `/influences`
- The canvas fades to black (~600ms)
- The destination page enters with the standard page transition

### Implementation
- Use Nuxt's `definePageMeta({ pageTransition: { name: 'influences' } })` on the influences page to apply a custom transition name
- Add `.influences-enter-active`, `.influences-leave-active`, `.influences-enter-from`, `.influences-leave-to` classes to `transitions.css`
- The transition should be pure opacity (no translateY or scale) to feel like a cinematic cut-to-black
- `prefers-reduced-motion`: fall back to instant transition (`transition-duration: 1ms`)

```css
/* Add to transitions.css */
.influences-enter-active {
  transition: opacity 800ms var(--ease-standard);
  transition-delay: 200ms; /* hold on black before fade-in */
}

.influences-leave-active {
  transition: opacity 600ms var(--ease-standard);
}

.influences-enter-from,
.influences-leave-to {
  opacity: 0;
}
```

## Image Assets

- Album covers stored in `public/images/taste/`
- File naming: `{album-id}.jpg` (matching the `id` field in JSON)
- Recommended source size: **600x600px** (displayed at ~80-140px, retina-ready)
- Format: JPG or WebP
- All images provided manually by the artist (not pulled from external APIs)

## Accessibility

- All album covers have `alt` text: `"{title} by {artist}"`
- Canvas is keyboard-navigable (arrow keys pan, Tab cycles albums)
- Modal traps focus while open, returns focus to triggering album on close
- `prefers-reduced-motion`: disables staggered fade-in, momentum, and hover scale
- Sufficient color contrast for all text on dark background

## Edge Cases

- **0 albums in JSON**: Show only the center logo with a subtle message ("Coming soon" or similar)
- **1-5 albums**: Canvas is smaller, albums cluster close to center — still works
- **50+ albums**: Canvas grows, outer tier albums are more spread out — still works
- **Missing cover image**: Show a placeholder (dark square with album title text)
- **No listening links**: Omit the listening links row in the modal entirely
- **Very long description**: Modal content scrolls vertically (card has `max-height` with `overflow-y: auto`)

## Future Enhancements (Out of Scope for V1)

- Search/filter by genre tags
- Subtle floating/drift animation on album covers (gentle parallax bob)
- Sound previews on hover (30-second Spotify embed)
- Parallax depth layers (closer albums drift faster when panning)
- Shareable deep-links to specific albums (`/influences#kid-a`)
- Animated connection lines between albums that share genres
- Zoom in/out capability
