# Site Rebuild Profile

> **Artist**: Solo singer/songwriter (acoustic guitar & vocals)
> **Sonic references**: The Tallest Man on Earth (early), Nick Drake — *Pink Moon*
> **Design reference**: [irajune.com](https://www.irajune.com/) (distilled principles, not a copy)
> **Stack**: Nuxt 4 (Vue 3, Nitro, Vite)
> **Type**: Solo artist / musician website

---

## 1. Design Philosophy

- **Cinematic intimacy** — the site should feel like the quiet moment before a song starts; warm, focused, unhurried
- **Album-as-world** — each release gets its own immersive, long-scroll page; the album is the primary content unit of the entire site
- **Photography as texture** — large, atmospheric images set the mood but never overpower the music
- **Breathing room** — generous whitespace inspired by Ira June's editorial spacing; let every element land
- **Warm minimalism** — stripped-back UI with organic warmth; nothing cold, clinical, or corporate
- **Mixed tonality** — light pages and dark pages coexist to give each section its own mood while staying cohesive
- **Fewer pages, deeper pages** — consolidate where possible; prefer rich single pages over fragmented shallow ones

---

## 2. Design System

### 2.1 Color Palette

The palette is built around a neutral base with a single earthy accent color. The accent is **easily configurable** — defined as a single CSS custom property that propagates everywhere.

#### Light pages (homepage, about/press)

| Token              | Example Value   | Usage                                |
| ------------------- | --------------- | ------------------------------------- |
| `--color-bg`       | `#faf8f5`       | Warm off-white background            |
| `--color-text`     | `#1c1917`       | Primary text (stone-900)             |
| `--color-muted`    | `#78716c`       | Secondary text, captions (stone-500) |
| `--color-border`   | `#e7e5e4`       | Subtle dividers (stone-200)          |
| `--color-accent`   | `#b45309`       | CTAs, links, highlights (amber-700)  |

#### Dark pages (album detail pages, music index)

| Token              | Example Value   | Usage                                |
| ------------------- | --------------- | ------------------------------------- |
| `--color-bg-dark`  | `#1c1917`       | Deep warm charcoal background        |
| `--color-text-dark`| `#faf8f5`       | Light text on dark                   |
| `--color-muted-dark`| `#a8a29e`      | Secondary text on dark (stone-400)   |
| `--color-accent`   | (same)          | Accent carries across both modes     |

> **One-variable accent**: Change the entire site's color identity by updating one value:
> ```css
> :root {
>   --color-accent: #b45309;       /* amber/rust default */
>   /* swap to: #92400e (terracotta), #a16207 (gold), #4d7c0f (olive) */
> }
> ```

### 2.2 Typography

| Role        | Recommendation                     | Size (desktop) | Weight   |
| ----------- | ----------------------------------- | -------------- | -------- |
| Display     | Geometric sans (Montserrat, Jost)   | 56–80px        | 300–400  |
| Heading     | Same family                         | 32–48px        | 400–500  |
| Subheading  | Same family                         | 20–24px        | 400      |
| Body        | Same family or paired sans (Inter)  | 16–18px        | 400      |
| Label/Nav   | Same family, letter-spaced          | 12–14px        | 500      |
| Caption     | Same family                         | 13–14px        | 400      |

> Single geometric sans-serif family throughout. Use weight contrast (light for display, medium for nav) rather than mixing families. Clean and modern; the color palette and imagery bring the warmth.

### 2.3 Spacing & Layout

- Base unit: `8px`
- Section padding: `120–160px` vertical (desktop), `64–80px` (mobile)
- Content max-width: `1200px`, centered
- Grid: 12-column CSS Grid on desktop
- Gutter: `24–32px`
- Between elements within a section: `32–48px`
- Sections feel like individual rooms — separated by color shifts (light ↔ dark) or generous whitespace

### 2.4 Motion & Transitions

**Level: Moderate** — enough to feel alive, not enough to distract from the music.

| Type                  | Behavior                                              | Duration  |
| --------------------- | ------------------------------------------------------ | --------- |
| Page transitions      | Crossfade with subtle vertical shift                  | 300–400ms |
| Scroll reveal         | Fade up (~20px translate) as elements enter viewport  | 400–600ms |
| Hover (images)        | Slight scale (1.03) with overflow hidden              | 250ms     |
| Hover (links/nav)     | Underline reveal or opacity shift                     | 200ms     |
| Album art hover       | Subtle lift (translateY -4px) + soft shadow            | 250ms     |
| Scrollspy nav         | Smooth active-state transitions on section change     | 200ms     |

- Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)`
- Use `IntersectionObserver` (via `@vueuse`) for scroll triggers and scrollspy
- No parallax or video backgrounds — keep it grounded and intimate

---

## 3. Site Map

The site uses a minimal page structure. Videos live on their associated album pages rather than a separate gallery.

```
/                       Homepage (light) — album spotlight + hub
/music                  Discography index (dark) — grid of all releases
/music/[slug]           Album detail (dark) — immersive long-scroll per album
/about                  Bio + press kit combined (light)
/contact                Contact form (light)
```

**5 route patterns total.** That's it.

---

## 4. Page Structure & Layout

### 4.1 Global Elements

#### Navbar

- **Position**: Fixed top, transparent over hero
- **Scroll behavior**: Transitions to solid background on scroll; hides on scroll-down, reveals on scroll-up
- **Layout**: Logo image (left) — Nav links (right)
- **Nav items**: `Music` `/` `About` `/` `Contact`
- **Separator**: Forward slash `/` character between links
- **Mobile**: Hamburger → full-screen overlay with centered stacked links
- **Active state**: Accent-colored underline or text shift on current page
- **Theme-aware**: Uses light logo on dark pages, dark logo on light pages

#### Footer

- **Style**: Minimal, warm
- **Content**: Social/streaming links (Spotify, Apple Music, YouTube, Instagram), email contact, copyright
- **Layout**: Centered single-column
- **Email signup**: Placeholder only — minimal "sign up for updates" field with a coming-soon or disabled state; structure the markup so it's easy to activate later
- **Mood**: Quiet close — not a second homepage

---

### 4.2 Homepage — Light Theme

The homepage is a bright, cinematic splash for the latest release with discoverable sections below.

#### A. Hero — Latest Release Spotlight (`100vh`)

- Large album art (centered, commanding — at least 50% of viewport)
- Album title + release date in display type
- Optional single-line tagline
- Row of streaming/listen links as minimal icon buttons or text links
- **Background**: Warm off-white or subtle tinted wash from album palette
- **Motion**: Album art fades in with slow gentle scale (1.0 → 1.02 over ~2s); streaming links stagger in
- **CTA**: `"listen now"` or `"explore the album"` → `/music/[slug]`

#### B. Discography Preview

- **Heading**: `"music"` — lowercase, display weight
- **Layout**: Horizontal row or 2–3 column grid of album cards
- **Album card**: Square album art + title + year; click → `/music/[slug]`
- **Latest release**: Visually distinguished (slightly larger, accent border, or "new" label)
- **CTA**: `"all releases"` → `/music`

#### C. About Preview

- **Layout**: Two-column — atmospheric photo (left), 2–3 sentence bio excerpt (right)
- **CTA**: `"read more"` → `/about`

#### D. Contact + Email Signup

- **Layout**: Centered, minimal
- **Content**: Booking/press email, email signup placeholder (disabled/coming-soon state)
- **Mood**: Quiet invitation

---

### 4.3 `/music` — Discography Index — Dark Theme

- **Layout**: Grid of all releases, reverse chronological
- **Album card**: Large square album art + title + year
- **Hover**: Lift + shadow; accent border or glow
- **Click**: → `/music/[slug]`
- **SEO**: Page title "Discography — [Artist Name]", meta description listing album names

---

### 4.4 `/music/[slug]` — Album Detail — Dark Theme

This is the heart of the site. Each album is an **immersive, long-scroll experience** with a scrollspy sticky nav for direct section access.

#### Scrollspy Sticky Nav

- **Position**: Sticky below the main navbar (appears after scrolling past the hero)
- **Style**: Horizontal bar, minimal — section labels in label type
- **Items**: `Art` `|` `Tracks` `|` `Credits`
- **Behavior**: Highlights current section as user scrolls; clicking jumps to section with smooth scroll
- **Mobile**: Horizontally scrollable if items overflow

#### Section A: Album Art Hero

- **Layout**: Full-bleed album art, edge-to-edge or with minimal margin
- **Content**: Album title + year overlaid or directly below
- **Streaming links**: Row of platform buttons beneath the art
- **Mood**: The gatefold moment — reverent, still

#### Section B: Tracks

- **Layout**: Numbered accordion — each track is a card with its number, title, and duration
- **Navigation**: Click a track title to reveal its lyrics; tracks without lyrics list but don't expand
- **Typography**: Body size, generous line-height; song titles as subheadings
- **Style**: Feels like reading a lyric booklet; plenty of whitespace around stanzas

#### Section C: Liner Notes

- **Layout**: Single-column prose, centered (max-width ~720px for comfortable reading)
- **Content**: First-person writing about the album — recording context, themes, stories behind songs
- **Optional**: Interspersed atmospheric photos from the recording process
- **Tone**: Intimate, like handwritten liner notes

#### Section D: Credits

- **Layout**: Single column of left-aligned paragraphs, one per credit
- **Content**: Written/performed by, recorded at, mixed by, mastered by, featured musicians, artwork credits, etc.
- **Style**: Smaller text, muted color — present but not prominent

---

### 4.5 `/about` — Bio + Press Kit — Light Theme

Combined page with two distinct zones:

#### Bio Section

- **Layout**: Full-width atmospheric hero image at top, then single-column text below
- **Content**: Extended first-person bio, additional photos interspersed
- **Tone**: Warm, personal, storytelling

#### Press Kit Section

- **Heading**: `"press"` — lowercase
- **Content**:
  - Short bio (1 paragraph, copy-pasteable for press use)
  - High-res press photos (downloadable, clearly labeled dimensions)
  - Latest release info + streaming links
  - Selected press quotes / reviews (if any)
  - Booking/press contact email
  - Download link for full EPK (PDF or zip)
- **Tone**: Still warm but structured for industry use

---

### 4.6 `/contact` — Light Theme

- **Layout**: Centered, simple
- **Content**: Contact form (name, email, subject, message) + direct email + social links
- **Email signup placeholder**: Repeated here as well (disabled/coming-soon)

---

## 5. Component Inventory

| Component               | Description                                                    |
| ------------------------ | --------------------------------------------------------------- |
| **Global**              |                                                                |
| `AppNavbar`             | Fixed nav, transparent → solid, hide/reveal, theme-aware logo  |
| `AppFooter`             | Social/streaming links, email signup placeholder, copyright    |
| `MobileNavOverlay`      | Full-screen mobile navigation                                  |
| `ScrollReveal`          | Wrapper component for fade-up-on-enter animation               |
| `RichText`              | Renders `*asterisk*` runs from content copy as italics         |
| `SectionHeading`        | Reusable lowercase display heading                             |
| `StreamingLinks`        | Row of platform icons/links (Spotify, Apple Music, etc.)       |
| `ThemeProvider`         | Handles light/dark page context + accent variable              |
| `EmailSignupPlaceholder`| Disabled/coming-soon mailing list input                        |
| **Homepage**            |                                                                |
| `HeroAlbumSpotlight`    | Full-viewport latest release showcase                          |
| `DiscographyPreview`    | Horizontal row/grid of album cards for homepage                |
| `AboutPreview`          | Two-column photo + bio excerpt                                 |
| **Music**               |                                                                |
| `AlbumCard`             | Square album art + title + year, hover lift                    |
| `DiscographyGrid`       | Grid layout for all album cards                                |
| `AlbumScrollspyNav`     | Sticky horizontal section nav with active-state tracking       |
| `AlbumHero`             | Full-bleed album art + title + streaming links                 |
| `Tracklist`             | Numbered track accordion; each track expands to show its lyrics |
| `AlbumCredits`          | Credits as left-aligned paragraphs                             |
| **About / Press**       |                                                                |
| `BioSection`            | Full bio with hero image + interspersed photos                 |
| `PressKit`              | EPK layout with downloadable assets                            |
| **Contact**             |                                                                |
| `ContactForm`           | Name/email/subject/message with success/error states           |

---

## 6. Nuxt 4 Project Structure

```
project-root/
├── app/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css              # CSS custom properties, global styles
│   │   │   ├── transitions.css       # Page & element transitions
│   │   │   └── themes.css            # Light/dark theme classes, accent config
│   │   ├── fonts/                    # Self-hosted geometric sans files
│   │   └── images/
│   │       ├── logo-light.svg        # Logo for dark backgrounds
│   │       └── logo-dark.svg         # Logo for light backgrounds
│   ├── components/
│   │   ├── global/
│   │   │   ├── AppNavbar.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── MobileNavOverlay.vue
│   │   │   ├── ScrollReveal.vue
│   │   │   ├── SectionHeading.vue
│   │   │   ├── StreamingLinks.vue
│   │   │   ├── ThemeProvider.vue
│   │   │   └── EmailSignupPlaceholder.vue
│   │   ├── home/
│   │   │   ├── HeroAlbumSpotlight.vue
│   │   │   ├── DiscographyPreview.vue
│   │   │   └── AboutPreview.vue
│   │   ├── music/
│   │   │   ├── AlbumCard.vue
│   │   │   ├── DiscographyGrid.vue
│   │   │   ├── AlbumScrollspyNav.vue
│   │   │   ├── AlbumHero.vue
│   │   │   ├── Tracklist.vue
│   │   │   └── AlbumCredits.vue
│   │   ├── about/
│   │   │   ├── BioSection.vue
│   │   │   └── PressKit.vue
│   │   └── contact/
│   │       └── ContactForm.vue
│   ├── composables/
│   │   ├── useScrollReveal.ts        # IntersectionObserver wrapper
│   │   ├── useScrollspy.ts           # Active section tracking for album pages
│   │   ├── useNavScroll.ts           # Navbar hide/reveal on scroll
│   │   └── usePageTheme.ts           # Light/dark per-page theme logic
│   ├── layouts/
│   │   ├── default.vue               # Light-themed layout
│   │   └── dark.vue                  # Dark-themed layout
│   ├── pages/
│   │   ├── index.vue                 # Homepage
│   │   ├── music/
│   │   │   ├── index.vue             # Discography grid
│   │   │   └── [slug].vue            # Album detail (long-scroll + scrollspy)
│   │   ├── about.vue                 # Bio + press kit
│   │   └── contact.vue               # Contact form
│   └── app.vue
├── content/
│   └── music/
│       ├── album-one.yml
│       └── album-two.yml
├── public/
│   ├── favicon.ico
│   ├── press/                        # Downloadable press photos & EPK PDF
│   └── images/
│       └── albums/                   # Album art files
├── server/
│   └── api/
│       └── contact.post.ts           # Contact form handler
├── shared/
│   └── types/
│       └── index.ts                  # Album, Track, Video TypeScript interfaces
├── nuxt.config.ts
└── tsconfig.json
```

---

## 7. Content Schema — Album (YAML)

Each album lives as a `.yml` file in `content/music/`:

```yaml
title: "Album Title"
slug: "album-title"
year: 2025
releaseDate: "2025-03-15"
isLatest: true                          # Drives homepage spotlight

coverImage: "/images/albums/album-title.jpg"
coverAlt: "Description of album artwork"

description: |
  A few sentences about the album for meta/SEO purposes. Wrap a name in
  *asterisks* to italicize it on display; markers are stripped for meta/SEO.

streamingLinks:
  spotify: "https://open.spotify.com/album/..."
  appleMusic: "https://music.apple.com/album/..."
  bandcamp: "https://artist.bandcamp.com/album/..."
  youtube: "https://youtube.com/..."
  amazonMusic: "https://music.amazon.com/albums/..."

tracklist:
  - title: "Song One"
    duration: "3:42"
    lyrics: |
      First verse goes here
      Line by line

      Second verse here
  - title: "Song Two"
    duration: "4:15"
    lyrics: |
      Lyrics for song two...

linerNotes: |
  First-person writing about the album.
  Recording context, themes, stories behind songs.
  Can include multiple paragraphs.

linerNoteImages:
  - src: "/images/albums/album-title/studio-1.jpg"
    alt: "Recording session photo"
  - src: "/images/albums/album-title/studio-2.jpg"
    alt: "Guitar close-up"

videos:
  - title: "Song One — Live Session"
    url: "https://youtube.com/watch?v=..."
    description: "Recorded live at [venue], [date]"
  - title: "Song Two — Music Video"
    url: "https://youtube.com/watch?v=..."
    description: "Directed by [name]"

credits:
  - role: "Written and performed by"
    name: "[Artist Name]"
  - role: "Recorded at"
    name: "[Studio], [Year]"
  - role: "Mixed by"
    name: "[Name]"
  - role: "Mastered by"
    name: "[Name]"
  - role: "Album artwork by"
    name: "[Name]"
```

---

## 8. Light / Dark Page Mapping

| Route               | Theme  | Rationale                                      |
| -------------------- | ------ | ----------------------------------------------- |
| `/`                  | Light  | Bright, inviting; album art pops on warm white |
| `/music`             | Dark   | Gallery feel; album art glows on dark bg       |
| `/music/[slug]`      | Dark   | Immersive album experience                     |
| `/about`             | Light  | Warm, personal, approachable                   |
| `/contact`           | Light  | Open, inviting                                 |

---

## 9. SEO, GEO & AEO Strategy

### 9.1 Technical SEO

- **SSG** (`nuxt generate`) — fully static site, pre-rendered at build time
- **Canonical URLs** on every page
- **Sitemap** auto-generated via `@nuxtjs/sitemap`
- **robots.txt** via `@nuxtjs/robots`
- **Open Graph & Twitter Cards** on every page — especially album pages with album art as `og:image`
- **Semantic HTML**: proper heading hierarchy (`h1` → `h2` → `h3`), `<article>`, `<section>`, `<nav>`, `<main>`
- **Performance**: target 90+ Lighthouse across all categories; self-hosted fonts, optimized images, lazy-loaded embeds

### 9.2 Structured Data (JSON-LD)

Embed structured data on every relevant page for rich results and AI discoverability:

#### Site-wide (in `app.vue` or layout)
```json
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "[Artist Name]",
  "url": "https://yoursite.com",
  "genre": ["Folk", "Singer-Songwriter", "Acoustic"],
  "description": "Solo acoustic singer/songwriter...",
  "image": "https://yoursite.com/images/press-photo.jpg",
  "sameAs": [
    "https://open.spotify.com/artist/...",
    "https://music.apple.com/artist/...",
    "https://instagram.com/...",
    "https://youtube.com/..."
  ]
}
```

#### Per album page (`/music/[slug]`)
```json
{
  "@context": "https://schema.org",
  "@type": "MusicAlbum",
  "name": "Album Title",
  "byArtist": { "@type": "MusicGroup", "name": "[Artist Name]" },
  "datePublished": "2025-03-15",
  "genre": ["Folk", "Singer-Songwriter"],
  "image": "https://yoursite.com/images/albums/album-title.jpg",
  "numTracks": 10,
  "track": [
    {
      "@type": "MusicRecording",
      "name": "Song One",
      "duration": "PT3M42S",
      "position": 1
    }
  ]
}
```

#### Per video (embedded in album page)
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Song One — Live Session",
  "description": "Live performance at...",
  "thumbnailUrl": "...",
  "uploadDate": "2025-04-01",
  "contentUrl": "https://youtube.com/watch?v=..."
}
```

### 9.3 AEO (AI Engine Optimization)

Make the site easy for AI assistants (ChatGPT, Perplexity, Google AI Overviews) to understand and cite:

- **Structured data** (above) is the #1 signal — AI engines parse JSON-LD directly
- **Clear, factual meta descriptions** on every page — written as concise answers to likely queries (e.g. "Who is [Artist]?", "What albums has [Artist] released?")
- **FAQ-style content** in the about/press section — naturally answer questions like genre, influences, discography, booking info
- **Consistent entity naming** — use the exact same artist name everywhere (meta, structured data, body text, alt tags)
- **Content completeness** — lyrics, credits, and liner notes give AI engines rich text to index and reference
- **Alt text on all images** — descriptive, includes artist name and context

### 9.4 GEO (Generative Engine Optimization)

- No local presence needed — skip Google Business Profile
- Focus on **topical authority**: the site should be the definitive source for information about this artist
- **Interlink** album pages, about page, and streaming profiles so generative engines can build a complete entity graph
- **External signals**: ensure streaming profiles (Spotify, Apple Music, Bandcamp) all link back to the website as the canonical artist URL

---

## 10. Recommended Nuxt Modules

| Module             | Purpose                                          |
| ------------------- | ------------------------------------------------- |
| `@nuxt/content`    | YAML-driven discography content                  |
| `@nuxt/image`      | Responsive images, WebP/AVIF, lazy loading       |
| `@nuxt/fonts`      | Automatic font optimization & self-hosting       |
| `@nuxtjs/seo`      | Meta tags, OG, sitemap, robots (SEO bundle)      |
| `@vueuse/nuxt`     | Composable utilities (intersection observer, etc.)|
| `nuxt-jsonld`       | Structured data helper (or hand-write in `useHead`) |
| `@nuxt/scripts`    | Safe third-party script loading (analytics, etc.) |

---

## 11. Responsive Breakpoints

| Breakpoint | Width       | Notes                                          |
| ---------- | ----------- | ----------------------------------------------- |
| Mobile     | < 768px     | Single column; album art full-width; scrollspy nav horizontally scrollable |
| Tablet     | 768–1024px  | Two-column where appropriate                   |
| Desktop    | > 1024px    | Full layout                                    |
| Wide       | > 1440px    | Max-width container, centered                  |

---

## 12. Tone & Content Guidelines

- **Headings**: Lowercase, geometric sans, display weight — `"music"`, `"about"`, `"press"`
- **Body copy**: First-person, intimate, conversational — like liner notes
- **Press section**: Slightly more structured but still warm — written for humans
- **CTAs**: Quiet and clear — `"listen now"`, `"explore the album"`, `"read more"`, `"get in touch"`
- **Voice**: Honest, grounded, unhurried — reflects the songwriting itself
- **Photography**: Atmospheric, natural light preferred; grain and warmth welcome; avoid overproduced looks
- **Album art**: Always displayed at full fidelity — never cropped, never obscured by overlays
- **Lyrics**: Presented respectfully — generous spacing, no clutter, feels like reading a lyric booklet
- **Email signup**: Placeholder only for now — styled as "coming soon" or quietly disabled; markup ready to activate later
