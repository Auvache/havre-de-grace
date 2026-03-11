# Sprint 0 Migration Checklist

Date: 2026-03-11  
Baseline: `origin/main` at `8a62872` (`update bio`)  
Implementation branch: `site-rebuild-implementation`

## 1. Safety Decision Before Cleanup

- Decision: archive current uncommitted planning work with a stash before any destructive cleanup.
- Archive created: `stash@{0}` (`On site-rebuild-sprint-plan: sprint0-pre-implementation-archive`).
- Rationale: keep in-progress planning docs and UI experiments recoverable while implementation starts from clean `main`.

## 2. Baseline Content and Link Snapshot

Source: `assets/links.json` on `origin/main`.

### Artist-level links

| Key | URL |
| --- | --- |
| `spotify.artist` | `https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb?si=wB2FxUU0SsuLAS5EPuyFqw` |
| `appleMusic.artist` | `https://music.apple.com/us/artist/havre-de-grace/1875352277` |
| `youtubeMusic.artist` | `https://music.youtube.com/channel/UC9FYhFcWIz8KVSVqZHwIgxg?si=bM-aT2sjiEYxi1js` |
| `amazonMusic.artist` | `https://music.amazon.com/artists/B0G83WZY27/havre-de-grace?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_xjo54sgurf1z0eePEZRczcJRG` |
| `bandcamp.artist` | `https://havredegrace.bandcamp.com/album/i-want-to-be-yours-and-other-songs` |
| `soundcloud.artist` | `https://soundcloud.com/havredegracemusic` |
| `youtube` | `https://www.youtube.com/@havredegracemusic` |
| `instagram` | `https://www.instagram.com/havredegracemusic` |
| `email` | `booking@havredegracemusic.com` |

### Album-level links (`iWantToBeYoursAndOtherSongs`)

| Key | URL |
| --- | --- |
| `spotify.iWantToBeYoursAndOtherSongs` | `https://open.spotify.com/album/5hitWldm8YSkLO0B6nnAPK?si=XGt1dVOqTWqG8gh6LkfRFQ` |
| `appleMusic.iWantToBeYoursAndOtherSongs` | `https://music.apple.com/us/album/i-want-to-be-yours-and-other-songs/1875647787` |
| `youtubeMusic.iWantToBeYoursAndOtherSongs` | `https://music.youtube.com/playlist?list=OLAK5uy_m9-fwX5X6-akFt_EXHaMl77qkEaQI2lOY&si=3H7D2GnFT3wpee_a` |
| `amazonMusic.iWantToBeYoursAndOtherSongs` | `https://music.amazon.com/albums/B0GM1XF3RY?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_kCefPNt0uYszhrJlqOi5Hk6J6` |
| `bandcamp.iWantToBeYoursAndOtherSongs` | `https://havredegrace.bandcamp.com/album/i-want-to-be-yours-and-other-songs` |
| `soundcloud.iWantToBeYoursAndOtherSongs` | `https://soundcloud.com/havredegracemusic/sets/d1cefe1f-140c-4d54-a8f9-107c4adb92a7` |

### Live video embeds to migrate to album page

Source: `pages/index.vue` on `origin/main`.

| YouTube ID | Embed URL |
| --- | --- |
| `3ro2I9rvQj8` | `https://www.youtube.com/embed/3ro2I9rvQj8?si=w533QpFQK6WmQVjb` |
| `kZckptQidYk` | `https://www.youtube.com/embed/kZckptQidYk?si=OIKBZF0Ytl93oL7S` |
| `0JF4Pm_-mPs` | `https://www.youtube.com/embed/0JF4Pm_-mPs?si=Xybe8lcC7zaKnOvF` |

### Legacy schema URLs to reconcile during rebuild

Source: `composables/useSchema.ts` on `origin/main`.

- `MusicGroup.sameAs` currently contains stale platform URLs that differ from `assets/links.json`.
- `MusicAlbum.sameAs` currently contains stale album URLs that differ from `assets/links.json`.
- Migration action: use `assets/links.json` values as source-of-truth when building new structured content.

## 3. Static Asset Snapshot for Migration

### Required assets (must preserve and remap)

| Current path (`origin/main`) | Planned target in rebuild |
| --- | --- |
| `assets/images/i-want-to-be-yours-and-other-songs-album-cover.jpg` | `public/images/albums/i-want-to-be-yours-and-other-songs.jpg` |
| `public/images/media-pic-square.jpg` | `public/press/media-pic-square.jpg` |
| `public/images/media-pic-wide.jpg` | `public/press/media-pic-wide.jpg` |

### Brand/platform icon assets (optional reuse; preserve until replacement)

- `assets/images/logo-white.png`
- `assets/images/logo-black.png`
- `assets/images/spotify.png`
- `assets/images/apple-music.png`
- `assets/images/amazon-music.png`
- `assets/images/youtube-music.png`
- `assets/images/bandcamp.png`
- `assets/images/soundcloud.png`
- `assets/images/youtube.png`
- `assets/images/instagram.png`

## 4. Preserve vs Remove Scope

### Preserve through cleanup

- `.git/`
- `docs/` (planning + migration docs)
- Required migration assets listed in Section 3
- `assets/links.json` until data model migration is complete in Sprint 2

### Legacy files to intentionally remove/replace in Sprint 1

- `pages/index.vue`
- `pages/press.vue`
- `pages/links.vue`
- `layouts/default.vue`
- `components/hamburger.vue`
- `assets/styles/main.css`
- `composables/useSchema.ts`
- Existing generated output folders: `.output/`, `.nuxt/`, and `dist/`

## 5. Sprint 0 Exit Criteria Status

- [x] Implementation branch exists and is active: `site-rebuild-implementation`.
- [x] Migration checklist is committed.
- [x] Legacy removal set is explicitly documented for team confirmation.
