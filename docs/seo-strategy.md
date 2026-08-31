# SEO Strategy: Havre De Grace Music

**Goal:** Rank for "Havre De Grace Music," "Havre De Grace Band," and "Stefan Auvache Bradley" in Google Search. Establish a Google Knowledge Panel for the artist.

**Core problem:** Google currently interprets "Havre De Grace" as the town in Maryland. The site needs stronger entity signals across the web to disambiguate "Havre De Grace" as a music artist.

> **On-site work is done.** The technical items this document used to list under
> "Technical SEO essentials" have been implemented — see the audit summary in
> `docs/seo-audit.md` for exactly what changed, including the schema.org graph
> (`MusicGroup`, `Person`, `MusicAlbum`, `MusicRecording`, `BreadcrumbList`,
> `VideoObject`), per-song pages, and the indexability cleanup. **Everything left
> in this file is off-site work that only you can do**, and it is now the
> bottleneck: the site can't disambiguate itself from a Maryland town without
> corroborating profiles elsewhere pointing back at it.

---

## External Tasks

These are actions taken outside the codebase. They require manual account creation and profile setup. Each task builds entity signals that help Google recognize "Havre De Grace" as a music artist.

### 1 — Create a MusicBrainz profile

**Priority: HIGH** — Google uses MusicBrainz as a primary source for music Knowledge Panels.

1. Go to https://musicbrainz.org and create an account
2. Add "Havre De Grace" as an Artist (type: Group or Person, depending on preference)
3. Fill in:
   - **Sort name:** Havre De Grace
   - **Type:** Person (solo project)
   - **Area:** Vancouver, Washington
   - **Disambiguation:** singer-songwriter project of Stefan Auvache Bradley
   - **URL relationships:** Add `havredegracemusic.com` as the official homepage
   - **URL relationships:** Add Spotify, Apple Music, YouTube, Instagram, Bandcamp, SoundCloud URLs
4. Add **both** albums as Release Groups:
   - "I Want to Be Yours and Other Songs" (released 2025-07-08, 9 tracks)
   - "Into the Wild" (released 2026-07-17, 10 tracks)
   - Add all tracks with durations — these are in `content/music/*.yml`
   - Link streaming URLs (also in those files, under `streamingLinks`)

### 2 — Create a Wikidata entry

**Priority: HIGH** — Wikidata is the backbone of Google Knowledge Panels.

1. Go to https://www.wikidata.org and create an account
2. Create a new item for "Havre De Grace" with:
   - **Label:** Havre De Grace
   - **Description:** American singer-songwriter project
   - **Also known as:** Stefan Auvache Bradley, Havre De Grace Music
   - **Instance of (P31):** musical project (Q215380) or musician (Q639669)
   - **Genre (P136):** folk music, singer-songwriter
   - **Country of origin (P495):** United States
   - **Official website (P856):** https://havredegracemusic.com
   - **Spotify artist ID (P1902):** `5Lyc79cqw6P44FeVTRlBLb`
   - **Apple Music artist ID (P2850):** `1875352277`
   - **YouTube channel ID (P2397):** `UC9FYhFcWIz8KVSVqZHwIgxg`
   - **Instagram username (P2003):** `havredegracemusic`
   - **Bandcamp URL (P3283):** the Bandcamp URL
   - **SoundCloud ID (P3040):** `havredegracemusic`
   - **MusicBrainz artist ID (P434):** (add after completing task 1)
3. Add a reference/source for each claim (the official website URL is sufficient)

**Note:** Wikidata entries for small/emerging artists are acceptable as long as claims are sourced. This is not Wikipedia — notability requirements are different.

### 3 — Create a Discogs profile

**Priority: MEDIUM** — Another music database Google cross-references.

1. Go to https://www.discogs.com
2. Add "Havre De Grace" as an Artist
3. Add the album "I Want to Be Yours and Other Songs" as a Release
4. Include tracklist, year, and links
5. Add the official website URL in the artist profile

### 4 — Claim Bandsintown profile

**Priority: MEDIUM** — Even without upcoming shows, having a profile helps entity recognition.

1. Go to https://artists.bandsintown.com
2. Register as "Havre De Grace"
3. Link Spotify and other streaming profiles
4. Set the official website URL
5. Optionally add past or future shows if any exist

### 5 — Claim Songkick profile

**Priority: MEDIUM** — Same reasoning as Bandsintown.

1. Go to https://www.songkick.com
2. Add "Havre De Grace" as an artist via the Tourbox portal
3. Link to official website and streaming profiles

### 6 — Create a Facebook Page (minimal)

**Priority: MEDIUM** — Google uses Facebook pages as a strong entity signal for Knowledge Panels, even if the page has minimal activity.

1. Create a Facebook Page for "Havre De Grace" (category: Musician/Band)
2. Add profile photo, cover photo, and the website URL
3. Add the about section with genre and real name
4. Link to streaming platforms
5. Post at least one thing (e.g., the album announcement)
6. Add the Facebook URL to `siteProfile.entityUrls` in `shared/data/site.ts` (and
   to `artistLinks` / `socialLinks` too if you want it shown as a link on the site)
7. `entityUrls` is what feeds the MusicGroup schema's `sameAs`, so it flows through
   automatically. Use the bare profile URL with no tracking parameters — `sameAs`
   values are entity identifiers that get matched against the same URLs on
   Wikidata, MusicBrainz, and the platforms themselves.

### 7 — Verify all external profiles link back to the website

**Priority: HIGH** — Two-way linking is critical for entity corroboration.

Confirm each platform has `havredegracemusic.com` linked:

- [ ] Spotify — Artist bio / "Artist Pick" link (via Spotify for Artists)
- [ ] Apple Music — Artist page (via Apple Music for Artists)
- [ ] YouTube — Channel "About" section → Links
- [ ] YouTube Music — (inherits from YouTube)
- [ ] Instagram — Bio link
- [ ] Bandcamp — Artist profile
- [ ] SoundCloud — Profile website field
- [ ] MusicBrainz — (added in task 1)
- [ ] Wikidata — (added in task 2)
- [ ] Discogs — (added in task 3)
- [ ] Bandsintown — (added in task 4)
- [ ] Songkick — (added in task 5)

### 8 — Submit site to Google Search Console and request indexing

**Priority: HIGH** — Search Console is already set up.

1. After deploying the updated site:
   - Use "URL Inspection" to request indexing of the homepage
   - Submit the updated sitemap
   - Check for any crawl errors
2. Monitor the "Performance" tab over the next 2-4 weeks for impressions on target keywords

---

## Priority Order

**Do first (biggest impact):**
1. MusicBrainz profile (task 1)
2. Wikidata entry (task 2)
3. Verify backlinks from all existing profiles (task 7)

**Do next:**
4. Discogs profile (task 3)
5. Facebook page (task 6)
6. Bandsintown (task 4) and Songkick (task 5)
7. Resubmit to Search Console (task 8)

---

## Expected Timeline

- **External profiles:** 1-2 hours of manual work across a few days
- **Google indexing:** 2-4 weeks after changes for re-crawling
- **Knowledge Panel:** Typically appears 4-12 weeks after sufficient entity signals exist across MusicBrainz + Wikidata + streaming platforms + official site

---

## Keywords to Reinforce

These should appear naturally across external profiles and any future site content:

| Keyword | Priority |
|---------|----------|
| Havre De Grace Music | Primary |
| Havre De Grace Band | Primary |
| Stefan Auvache Bradley | Primary |
| Havre De Grace singer-songwriter | Secondary |
| Havre De Grace acoustic folk | Secondary |
| Havre De Grace official website | Secondary |
