---
name: music-video-creation
description: Build or change a music video for a song on this site — a style's film module under shared/video/films/, the style suite at /music-videos/styles, a song's clips page under /music-videos/, the measured score a film is cut to, or the still reference sheets in public/video-styles/. Load this before touching anything in shared/video/, tools/video-styles/, app/config/*Score.ts, app/config/videoStyles.ts, app/components/musicvideo/ or app/pages/music-videos/, and before agreeing to "make a video for <song>".
---

# Music videos

Every music video on this site is SVG drawn from the song's own clock. There is
no video file anywhere: a film weighs what its markup weighs, it is seekable to
the millisecond, and it cannot fall out of sync with the record because it is
not playing alongside the record — it is a function of it.

This file is the process. Read it before writing anything; most of what is
expensive about building one of these has already been paid for once, and the
whole point of the notes below is that it does not have to be paid again.

---

## The one contract

**A style is one pure function: `frame({ time, score }) → { svg, label }`.**

It lives in `shared/video/films/<style>.mjs`. It is plain `.mjs`, not `.ts` and
not a Vue component. It takes the score as an argument rather than importing
one. It returns a string of SVG that goes inside a `viewBox="0 0 1600 900"`.

Four things depend on this and all four break if it is bent:

1. **`node` can call it directly, at any time value, in any order.** That is
   what `tools/video-styles/frames.mjs` does, and the review loop it enables is
   most of the cost saving in this document. A style written as a Vue template
   can only be sampled by driving a browser: three tool calls per frame instead
   of one call for twelve.
2. **One source draws the still and the motion.** `tools/video-styles/styles/`
   builds the reference sheets on `/music-videos/styles`; the components under
   `app/components/musicvideo/` run the same file sixty times a second. A style
   whose sheet and whose film disagree is worse than having no sheet.
3. **Frames can be walked off-line for an mp4** without rewriting the style.
4. **It is seekable and scrub-proof.** No animation state means nothing is left
   half-transitioned when a clip is scrubbed, and frame 4000 costs what frame 1
   costs.

Inside a style module, never:

- import a score, or any Vue/Nuxt runtime (`ref`, `computed`, `useX`)
- read a file (the band's lockup is passed in as `lockup`; see below)
- call `Math.random()`, `Date.now()`, or anything else non-deterministic — every
  page here is prerendered, so the server would draw one frame and the client
  another and hydration would tear. Use `rng(seed)` from the kit.
- measure the DOM: no `getTotalLength`, no `getBBox`, no refs. If arc length is
  needed, generate the path from sampled points and accumulate the length in JS,
  the way `passageFor` does in `cartography.mjs`.

---

## The map

| File | Owns |
| --- | --- |
| `app/config/andalusiaScore.ts` | **The cut.** Words with measured onsets, and the section table. One per song. |
| `app/config/videoStyles.ts` | **The written spec** for all seven styles — premise, palette, type rules, what each driver does, what each section does, and `avoid`. This is the file to hand an agent, not the styles page. |
| `shared/video/kit.mjs` | Drawing primitives (`t`, `rect`, `line`, `path`, `circle`, `fit`, `block`, `sung`, `rng`, `r`, `esc`) and timing (`ramp`, `fall`, `easeOut`, `easeInOut`, `easeOutBack`, `decay`, `lerp`, `clamp01`). |
| `shared/video/motifs.mjs` | The motif library — line drawings of the nouns the song sings, each in a 100×100 box. `motif()` / `motifAt()`. |
| `shared/video/films/cartography.mjs` | **The worked example.** Style B2, all ten sections. Read this before writing a second style. |
| `tools/video-styles/frames.mjs` | **The review loop.** Contact sheet of N frames. |
| `tools/video-styles/build.mjs` | Renders every still sheet to `public/video-styles/*.svg`. |
| `tools/video-styles/kit.mjs` | Re-exports the shared kit, plus the Node-only helpers that read the lockup off disk (`mark`, `logoScreen`, `creditsScreen`). |
| `tools/video-styles/styles/*.mjs` | One still reference sheet per style: a hero frame plus five thumbnails. |
| `app/components/musicvideo/MusicVideoCartography.vue` | Four lines: hand the clock to the style module, `v-html` the result. Copy this for a new style. |
| `app/components/musicvideo/MusicVideoClip.vue` | One snippet — stage, transport, caption. Style-agnostic apart from the film tag inside it. |
| `app/composables/useFilmClip.ts` | Windowed player: `from`/`to` in song seconds, one clip at a time across the page. |
| `app/components/musicvideo/MusicVideoFilm.vue` | The kinetic-typography film, whole song, at `/music-videos/kinetic`. **Legacy shape** — a 675-line Vue template. Do not copy it; it is the thing the contract above exists to replace. |
| `app/utils/clipTiming.ts` | The typed twin of the kit's timing functions, for Vue components. |
| `app/utils/typeLayout.ts` | Line-breaking and per-word reveal for the kinetic film only. |

---

## How to split the work across sessions

Do not try to do a whole video in one session. Each stage below is dominated by
a different kind of context, and mixing them means carrying all of it at once.
Each stage ends with a committable artifact that the next stage only reads.

### Session 1 — the score (once per song)

**Deliverable:** `app/config/<song>Score.ts`. Nothing else. No style, no page.

This is the expensive, reusable artifact: every style for that song is cut to
it, so it is worth getting right on its own and never touching again.

Measure it, do not tap it in. The method that produced `andalusiaScore.ts`, and
its own header documents it in full:

1. `afconvert` the mp3 to mono 16 kHz PCM; take an STFT at 10 ms.
2. **Line starts** from vocal presence — the share of the spectrum in
   1.2–2.6 kHz plus some sibilance above it, thresholded with hysteresis. It
   works because guitar, bass and piano mostly are not up there. It is confused
   by trumpet.
3. **Ambiguous sections by cross-correlation.** Every verse shares a melody with
   every other verse and every chorus with every chorus, so slide the log-mel
   spectrogram of a section you trust along the record and take the peak. This
   is how the middle of "Andalusia" was recovered after the phrase detector
   invented a five-second instrumental that does not exist.
4. **Syllables** from spectral flux in 0.7–4.5 kHz weighted by vocal presence,
   placed within each line by shortest path over (syllable, time) — rewarded for
   landing on an onset, charged for departing from an eighth note at the song's
   tempo, and bounded by the next line's start so nothing drifts.

Rules for the file:

- One `TRIM` constant, folded into every time by `at()`. When someone says the
  words are late, the fix is that one number, not thirty-one.
- `SECTIONS` boundaries sit **in the gaps between sung phrases, never on them**:
  a section's `to` is when its last line leaves the screen. The first section
  starts at exactly 0 and the last runs to exactly `duration`, untrimmed —
  otherwise 20 ms at each end belongs to no section and `sectionAt` answers with
  the end card two and a half minutes early.
- `duration` comes from `afinfo`, not from the rounded tracklist time.
- Keep the file **erasable TypeScript**: interfaces, type aliases, annotations
  and `as const` only. No enums, no namespaces, no parameter properties. Node
  strips types to import it directly (requires Node ≥ 24; `.nvmrc` pins 24), and
  that is what lets `frames.mjs` run without a build step.
- Write down honestly what is accurate and what is not. Line starts are good to
  about a frame at 30 fps; an unstressed word inside a line can sit 100 ms off.
  Say which numbers you trust least — in Andalusia it is the second group of
  oh-ohs, and knowing that saved a later session from chasing a real measurement
  as if it were a bug.

Audio lives at `public/albums/<album>/music/<song>.mp3`.

### Session 2 — the style module (once per style, per song)

**Deliverable:** `shared/video/films/<style>.mjs`, reviewed to completion with
`frames.mjs`. Still no page, no component, no route.

Read `app/config/videoStyles.ts` for that style's entry first — premise,
palette, type rules, the ten `sections`, and `avoid`. That entry is the brief.
If you find something it does not say, **put it back into the entry** at the end
of the session; that file is the compounding asset and the reason the next style
is cheaper than this one.

Then read `shared/video/films/cartography.mjs` end to end. It is the reference
implementation of everything below.

Budget: **6–10 review rounds for a genuinely new style, 2–3 for an existing
style pointed at a new song.**

### Session 3 — the page and the wiring

**Deliverable:** a route under `/music-videos/`, the component, the config, a
passing `npm run generate`. See "Wiring a page" below.

### Session 4 — mp4, if it is wanted

Only once the page has been looked at and approved. The module can be walked
frame by frame under `node`; nothing about the style needs to change.

---

## The review loop — read this twice

```sh
node tools/video-styles/frames.mjs 73 88 12   # 12 frames across 1:13–1:28
node tools/video-styles/frames.mjs 0 15       # 8 frames (the default count)
node tools/video-styles/frames.mjs @6 @14 @16.2   # exactly those seconds
```

It writes `.frames.html` (gitignored) and opens it. Two-up grid, real Jost,
captioned with the time and the line being sung.

**A film is never judged one frame at a time.** Every expensive mistake in
Cartography was invisible in code review and invisible in any single still, and
obvious the instant eight moments sat side by side. Working order:

1. **Sample the whole song first** — `node tools/video-styles/frames.mjs 0 173 12`.
   This catches structural failures (a section that never draws, a view that
   never changes, type that is off-frame for a third of the record) before any
   time is spent on a section that was never going to survive.
2. **Then one section at a time**, 6–8 frames across it, concentrating on the
   two seconds either side of a section boundary — that is where a view
   transition or a cleared lyric goes wrong.
3. **Then the windows that will actually be shown**, at the exact `from`/`to`
   the page will use.
4. Only then wire a page and look at it in a browser.

Do **not** drive a browser to a running page to review frames. It costs a
navigate, a screenshot and an image read per frame, needs the dev server up, and
gives you one moment per round trip. `frames.mjs` gives twelve and needs nothing
running. Rasterising the static `.frames.html`, below, is a different thing and
is the right way to look.

When you do need the real page — fonts as the site serves them, layout, or that
audio actually seeks — one pass at the end is enough.

Register a new style in `FILMS` at the top of `frames.mjs` and select it with
`FILM=<name>`.

### Looking at the frames yourself

`frames.mjs` opens `.frames.html` on the user's machine, but do not wait for
them to describe it. Rasterise the sheet and read the PNG:

```sh
node tools/video-styles/frames.mjs 73 88 6
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --virtual-time-budget=4000 \
  --screenshot="$SCRATCH/frames.png" --window-size=1200,1140 \
  "file://$PWD/.frames.html"
```

Then `Read` the PNG. That is the entire loop, and it closes with no user, no dev
server, no audio and no clock — two commands and one image read per six moments.

- **Size the window to the frame count.** The sheet is a two-column grid at
  about 380 px a row, so `--window-size=1200,<380 * ceil(n/2) + 20>`. Six frames
  at 1200×1140 is comfortably legible: port labels, the caption strip and the
  set lyric all readable. Past six the shot is downscaled on the way in and type
  stops being judgeable, which defeats the purpose. Sample twelve into the HTML
  if the user will also look; rasterise them six at a time.
- **Keep `--virtual-time-budget=4000`.** It gives the Google-hosted Jost time to
  arrive before the shot is taken. Every sizing, crowding and overflow judgement
  in this document assumes real Jost metrics — a silent fallback to system-ui
  would misreport all of them.
- **Write the PNG to the session scratchpad**, never the repo. It is review
  apparatus; nothing reads it twice.
- `tools/video-styles/preview.sh` already does this for the **still sheets** in
  `public/video-styles/`. Different artefact, same trick.

---

## Iterating with the user

Once a page exists and the question has moved from "does this style work" to
"fix that shot", the division of labour is settled. Asking for the wrong thing
is what makes these rounds expensive, so:

**Look at it yourself first.** Rasterise and read, as above. Do not ask for a
screenshot, for a description of a frame, or for a recording of anything that
can be sampled from the clock. Come to the conversation having already seen it.

**What to ask them for is a time and a symptom, in their own words.** "Around
86 seconds the lyric sits on top of Bangkok" is the ideal report. Song seconds
are the universal clock here — score time *is* mp3 time *is* clip time — so any
moment they can point at in the audio can be sampled directly, with no
translation and no ambiguity about which frame they mean. Do not ask them to
prescribe the fix: the traps below are unintuitive, and the obvious fix is
usually the one that was already tried and rejected.

**Ask for the whole list at once.** A round costs the same whether it addresses
one complaint or five, and the fixes interact — type sizing, path choice and the
fallbacks are one system, so taking them one at a time re-opens the last fix.

**Two things only they can judge**, because neither is visible in a still:

- **Sync** — whether a word lands when it is sung. Uniformly late or early is
  the score's single `TRIM` constant, not the style.
- **Motion** — whether a step reads as ink going down or as an animation,
  whether a view change reads as a slideshow.

Everything else — composition, collisions, type size, what is readable — is
faster to look at than to have described.

**Quote the real cost so they can aim.**

| Ask | Cost |
| --- | --- |
| A window's `from`/`to`/`posterAt`/copy | minutes; page constants only |
| A collision, type size, a label side, a fallback | one round in the film module, no build |
| How a section behaves | 2–3 rounds |
| A word's timing | a different session — the score is measured, not tapped in |

And every fix that comes out of one of these rounds goes back into the style's
`videoStyles.ts` entry, especially `avoid`. A complaint from the person watching
is the highest-grade finding there is: it is the only one that did not come from
reading our own code.

---

## Traps, all of them found by building

These are general. They cost rounds; none of them is obvious from a spec.

**Type on a path**

- Set the lyric along **one leg** of a route, never along the cumulative path. A
  route across a map is a zigzag: type follows every corner, runs upside down
  along the stretches that head right-to-left, and prints over everything between.
- **Reverse the path** when it runs east to west. Text reads in its path's
  direction. Symptom: a line that is mirrored and backwards.
- Space words along a path by **their own widths**, never by the arc length their
  onset falls at. Spacing by onset is the obvious reading of "the words are the
  road" and it is unreadable — the song does not sing evenly, so eleven words
  pile into one bend. Let colour carry the timing instead: a word turns accent
  on its own measured onset.
- **Break the line into two rows and bank them either side of the path.** One row
  of a full lyric line wants about 1500 units and almost no path is that long,
  so a single row lands at nineteen point and everything falls back. `dy` on a
  `<text>` containing a `<textPath>` shifts **perpendicular** to the path, which
  is the whole mechanism.
- Have an honest fallback and use it. A line comes off the path when it would be
  under ~30pt, when the path climbs more than about 40° (the type runs up the
  frame and off the top), or when the part of the path inside the frame is too
  short. Clamp to the longest unbroken run of the path that is actually on
  screen, in screen units — at high zoom a path runs a long way off both edges
  and a line centred on all of it is centred where nobody can see.
- Jost 600/700 uppercase measures about **0.66 em a glyph**, plus letter-spacing
  per glyph. The kit's `fit()` uses 0.6, which is right for mixed case and too
  narrow for caps.
- `textLength` with `lengthAdjust="spacing"` takes the difference out of the word
  spaces. A row set larger than its column does not get smaller, it loses its
  spaces — `I'DTRAVELROUNDTHEWORLD`. **Size the row to its measure first, then
  stretch it to that.**

**Zoom and view**

- Put the zoom **in the projection, not in a transform**. Scaling a `<g>` scales
  line weights, type and labels along with the geography. Compute every
  coordinate in screen space instead; the furniture then keeps its own weight at
  every scale, which is what a real chart, map or plan does.
- **Do not follow a moving subject** unless the frame stays full. Following the
  ship in Cartography at 1.7× emptied the chart and let the subject leave frame:
  a style whose subject is a map stopped showing one.
- Do not pull in past about 2.5×. Long elements come through the frame as
  unrelated rules and whatever is underneath becomes unreadable.
- Ease a view change over about **1.4 s**. A cut between scales reads as two
  different pictures; four seconds reads as a slideshow.

**Collisions**

- Permanent furniture stands down when the lyric owns the frame — labels to
  ~40%, decorative marks (a compass rose, a monogram) to ~20%. Both belong on
  the same picture and there is no arrangement that lets both be loud.
- A label's **side** is a per-element decision, not a constant. Support left,
  right, above and below, and pick per element. Two subjects a thumb apart, or
  one against an edge, is the normal case not the exception.
- Reveal things **when they become relevant**, not from frame one. Drawing all
  six ports during the title card put three of them under the cartouche and gave
  the whole route away before a word was sung.

**Drawing**

- Join generated outlines with **quadratics through the midpoints**, not straight
  segments. A sampled coastline drawn as a polyline reads as a mountain range or
  as a bug.
- Keep radial variation on contour-like shapes under about 18%. More and they
  stop reading as depth and start reading as stars.
- **Namespace every id per instance.** Three clips on one page share a document
  and `url(#route)` resolves to whichever is first in it, so the second clip's
  lyric ends up set along the first clip's path. Every film takes a `uid` prop;
  `build.mjs` does the same thing for the still sheets with `namespaceIds`.

**Rhythm**

- Step things on measured words, not on a metronome. Over two and a half minutes
  of a band playing without a click, a grid drifts and the words do not. The
  tempo is in the score for the record; nothing should read it.
- A step on a word wants about **90 ms of ease**. A hard jump reads as a dropped
  frame; anything longer reads as an animation rather than as the thing being
  drawn.
- Do not fire a full-frame effect on every word. At a word every third of a
  second the eye never gets back, and what reads as a hit on one word reads as a
  fault in the file across a verse. Once a section is usually right.

---

## Wiring a page

The component is four lines — copy `MusicVideoCartography.vue`. It imports the
style module, imports the score, inlines the lockup with Vite's `?raw`, and
`v-html`s the frame. `v-html` is correct here: every byte is built by our own
code from our own score, and the only outside string (the lyric) is escaped by
the kit's `esc` on the way in.

Snippets use `MusicVideoClip` + `useFilmClip`. `from`/`to` are **song seconds,
not clip seconds** — the film is handed the master's clock untranslated, which
is what makes "synced to the song" true by construction rather than by
adjustment. Give each clip a distinct `uid` and a `posterAt` inside its window;
a clip that opens on the first frame of its window usually opens on nothing, and
a video that looks like a blank rectangle does not get played.

Four places must be updated, and a static host punishes forgetting any of them:

1. **`nuxt.config.ts` → `routeRules`** — `/music-videos/**` is already covered
   with `robots: 'noindex, nofollow'`. These pages restate a published lyric in
   full, so `nofollow` as well as `noindex`.
2. **`nuxt.config.ts` → `nitro.prerender.routes`** — add the route explicitly.
   Nothing links to these pages, so nothing crawls to them, and **a route that
   was never prerendered 404s on S3 however correct the component is.**
3. **`app/config/pageThemeConfig.ts`** — `/music-videos` is matched as a subtree
   and set to dark/blackout, because the only colour anyone should be judging is
   the film's.
4. **Links** — `/music-videos/styles`, `/music-videos/andalusia` and
   `/music-videos/kinetic` cross-link. The build runs a link checker; it will
   fail on a typo.

Finish with `npm run generate`. It prerenders, runs the link checker, and is the
only real proof the page exists. Then confirm:

```sh
grep -o 'name="robots" content="[^"]*"' .output/public/music-videos/<page>/index.html
grep -c "music-video" .output/public/sitemap.xml .output/public/llms.txt   # both 0
```

If the still sheets changed, `node tools/video-styles/build.mjs` and look at the
affected sheet on `/music-videos/styles` — the sheets are checked in, and a
change to a look belongs in a module, never in a `.svg`.

---

## Checklists

**Existing style, new song** (cheap — 2–3 review rounds)

- [ ] Score exists and is committed (Session 1).
- [ ] Point the module at the new score. It takes `score` by argument; nothing
      in it should need editing except the style's own subject data — for
      Cartography that is `PORTS`, matched against the lyric by `cue`.
- [ ] `frames.mjs` across the whole song, then per section. **Re-check the
      geometry**: different words mean different leg lengths, and every
      size/fallback decision in the module depends on them.
- [ ] Register the song in `frames.mjs` if it needs its own entry.
- [ ] Page, config, `npm run generate`.

**New style** (6–10 review rounds)

- [ ] Its `app/config/videoStyles.ts` entry read in full; it is the brief.
- [ ] `shared/video/films/<style>.mjs`, contract above.
- [ ] Its still sheet in `tools/video-styles/styles/` **imports its furniture
      from the film module** so the two cannot drift. `node tools/video-styles/build.mjs`.
- [ ] `FILMS` entry in `frames.mjs`.
- [ ] Every trap above checked against the new style deliberately — most of them
      apply to any style that sets type over a drawing.
- [ ] Findings written back into the style's `videoStyles.ts` entry, especially
      `avoid`.
- [ ] Component, page, config, `npm run generate`.

---

## What not to economise on

- **Looking at it.** Every real bug here was a picture bug. Raise frames per
  look; never skip the look.
- **The score.** A style pointed at a sloppy score fails in ways that look like
  style bugs and get debugged as style bugs.
- **Re-checking geometry on a new song.** The lyric changes the measurements
  that every layout decision was tuned against.
- **Writing findings back into `videoStyles.ts`.** It is the only reason session
  N+1 is cheaper than session N.

And a note on scope when taking the brief: ask for **specific windows**, not
"the whole video". Three fifteen-second snippets — the beginning, something from
the middle, and the end — bound the review to the three places a film fails
differently, and that is the shape `/music-videos/andalusia` is built in.
