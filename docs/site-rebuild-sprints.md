# Site Rebuild Sprints (Nuxt 4 + Tailwind)

Last reviewed: 2026-03-11  
Primary source: `docs/site-profile.md`  
Current-site baseline reviewed from: `origin/main`

## Goal

Rebuild the site from scratch on a branch using Nuxt 4 + Tailwind, following the structure and design system in `site-profile.md`, while preserving and remapping all useful content currently on `origin/main`.

## Current Baseline Content to Migrate (from `origin/main`)

| Content Area | Current Source | Target in Rebuild |
| --- | --- | --- |
| Artist identity | `pages/index.vue`, `pages/press.vue`, `composables/useSchema.ts` | Site-wide metadata + `/about` + JSON-LD (`MusicGroup`) |
| Artist name and persona | Havre De Grace (Stefan Auvache Bradley) | Global config + About/Bio copy |
| Location and genre details | `pages/press.vue`, `composables/useSchema.ts` | About press-kit facts + structured data |
| Primary album | "I Want to Be Yours and Other Songs" (July 2025) in `pages/index.vue` and `pages/press.vue` | `content/music/i-want-to-be-yours-and-other-songs.yml` + `/music` + `/music/[slug]` |
| Album cover image | `assets/images/i-want-to-be-yours-and-other-songs-album-cover.jpg` | `public/images/albums/...` |
| Streaming links | `assets/links.json` | Album `streamingLinks` + site-level artist links |
| Social links | `assets/links.json` | Global footer + contact page |
| Booking email | `assets/links.json` (`booking@havredegracemusic.com`) | Footer + contact form + press section |
| Live performance videos | YouTube embeds in `pages/index.vue` (`3ro2I9rvQj8`, `kZckptQidYk`, `0JF4Pm_-mPs`) | Album `videos` section on `/music/[slug]` |
| Press photos | `public/images/media-pic-square.jpg`, `public/images/media-pic-wide.jpg` | `/about` press-kit download area |
| Existing SEO ideas | `nuxt.config.ts`, per-page `useSeoMeta`, `useSchema.ts` | Replace with profile-defined SEO/AEO/GEO plan |

## Known Content Gaps to Fill During Migration

These are required by `site-profile.md` but are not fully present in `origin/main` and need authored content:

- Full tracklist with durations in structured format.
- Full lyrics per song.
- Liner notes prose and optional liner-note images.
- Detailed credits (written/performed/recorded/mixed/mastered/artwork).
- Press quotes or review excerpts (if available).
- Downloadable full EPK file (`.pdf` or `.zip`) for press section.
- Contact form handling destination and anti-spam approach.

## Sprint Plan

## Sprint 0 - Branching, Safety, and Baseline Freeze

**Objective:** protect current work, then prepare for full rebuild.  
**Estimate:** 0.5 day

### Tasks

- Create implementation branch from latest `main` (separate from this planning branch).
- Snapshot current content assets and links into a migration checklist file.
- Confirm what folders/files are preserved (`docs/`, `.git/`, required static assets to migrate).
- Decide whether current uncommitted changes are archived via commit or stash before destructive cleanup.

### Exit Criteria

- Implementation branch exists and is the active working branch.
- Migration checklist is committed.
- Team agrees on which legacy files are intentionally removed.

## Sprint 1 - Fresh Nuxt 4 Foundation + Tailwind

**Objective:** initialize clean project shell that matches target stack.  
**Estimate:** 0.5-1 day

### Tasks

- Remove legacy app files (after Sprint 0 safety steps).
- Scaffold fresh Nuxt 4 app at repo root.
- Install and configure baseline modules:
- `@nuxtjs/tailwindcss`
- `@nuxt/content`
- `@nuxt/image`
- `@nuxt/fonts`
- `@nuxtjs/seo`
- `@vueuse/nuxt`
- `nuxt-jsonld` (or inline `useHead` JSON-LD approach)
- Set up core folders from profile target structure (`app/`, `content/`, `shared/types/`, `server/api/`).
- Configure static generation path and build scripts.

### Exit Criteria

- `npm run dev` and `npm run generate` both succeed.
- New skeleton routes build without legacy files.

## Sprint 2 - Data Model and Content Migration

**Objective:** move content from `origin/main` into structured content-driven sources.  
**Estimate:** 1 day

### Tasks

- Define shared TypeScript interfaces for albums, tracks, videos, credits, and social links.
- Implement album YAML schema in `content/music/`.
- Migrate existing album data and links into first album YAML file.
- Move selected media assets into final public structure (`/images/albums`, `/press`).
- Create a single source for site-wide identity/contact/social metadata.
- Add TODO placeholders for missing content gaps (lyrics, notes, credits, EPK).

### Exit Criteria

- `/music` and `/music/[slug]` can render from content data only.
- No hardcoded streaming/social links remain in page templates.

## Sprint 3 - Global Design System and Layout Shell

**Objective:** implement the visual system and reusable global UX behaviors.  
**Estimate:** 1-1.5 days

### Tasks

- Implement CSS variables and theme tokens from profile (`--color-accent` single-variable control).
- Add typography scale and spacing system.
- Build light/dark layout mapping and page-level theme switching.
- Build global components:
- `AppNavbar`
- `MobileNavOverlay`
- `AppFooter`
- `SectionHeading`
- `StreamingLinks`
- `EmailSignupPlaceholder`
- `ScrollReveal`
- Add nav behavior (transparent to solid, hide-on-scroll-down, reveal-on-scroll-up).
- Add base transitions (`page`, `hover`, reveal motion) with reduced-motion fallbacks.

### Exit Criteria

- All routes use consistent layout shell and design tokens.
- Navbar/footer behavior matches profile requirements on desktop and mobile.

## Sprint 4 - Core Route Build (/, /music, /about, /contact)

**Objective:** deliver the four non-dynamic pages aligned to profile IA.  
**Estimate:** 1-2 days

### Tasks

- Build homepage sections:
- Hero latest release spotlight
- Discography preview
- About preview
- Contact + signup placeholder
- Build `/music` dark-theme discography grid (reverse chronological).
- Build `/about` with combined bio + press-kit zone.
- Build `/contact` with form UI + direct email + social links + signup placeholder.
- Add redirects or migration strategy for legacy routes:
- `/press` -> `/about`
- `/links` -> `/contact` (or dedicated lightweight alias page)

### Exit Criteria

- Route map matches target: `/`, `/music`, `/music/[slug]`, `/about`, `/contact`.
- Legacy route traffic is handled intentionally (redirect or alias behavior committed).

## Sprint 5 - Album Long-Scroll Experience (/music/[slug])

**Objective:** implement immersive album detail page (core differentiator).  
**Estimate:** 1.5-2 days

### Tasks

- Build `AlbumScrollspyNav` with active section highlighting.
- Implement album sections:
- Art
- Tracks
- Lyrics
- Notes
- Videos (conditional)
- Credits
- Add smooth scrolling and active-state tracking via `@vueuse`/IntersectionObserver.
- Ensure mobile overflow behavior for scrollspy nav.
- Handle no-video/no-lyrics/no-notes gracefully.

### Exit Criteria

- Album page is fully content-driven from YAML.
- Scrollspy works correctly across viewport sizes.

## Sprint 6 - SEO, Structured Data, Performance, Accessibility

**Objective:** meet technical SEO/AEO targets from profile.  
**Estimate:** 1 day

### Tasks

- Add canonical/meta/OG/Twitter for each route and album page.
- Implement JSON-LD:
- Site-wide `MusicGroup`
- Per-album `MusicAlbum`
- Per-video `VideoObject` when present
- Configure sitemap and robots.
- Validate semantic heading structure and landmark usage.
- Optimize media loading (Nuxt Image, lazy embeds, width/height declarations).
- Run accessibility pass (keyboard nav, focus states, contrast, alt text).

### Exit Criteria

- Structured data validates for site and album pages.
- Lighthouse targets are met or documented with follow-up tasks.

## Sprint 7 - Contact API, QA, and Release Readiness

**Objective:** finish operational concerns and prepare merge/deploy.  
**Estimate:** 0.5-1 day

### Tasks

- Implement `server/api/contact.post.ts` for contact form submission flow.
- Add validation and anti-spam mechanism.
- Add success/error UX states and failure handling.
- Run final regression checks across desktop/mobile routes.
- Verify static output and hosting compatibility.
- Produce deployment and rollback checklist.

### Exit Criteria

- End-to-end contact flow works in target environment.
- Build is deployable and documented for merge.

## Suggested Execution Order

1. Sprint 0  
2. Sprint 1  
3. Sprint 2  
4. Sprint 3  
5. Sprint 4  
6. Sprint 5  
7. Sprint 6  
8. Sprint 7

## Definition of Done for the Rebuild

- New site is fully implemented on a branch and reviewable.
- Route architecture exactly matches the five-route target.
- Content is loaded from structured sources, not hardcoded component text.
- Legacy content from `origin/main` is preserved where still relevant.
- SEO/AEO fundamentals and structured data are in place.
- Static generation and deployment pipeline succeed.
