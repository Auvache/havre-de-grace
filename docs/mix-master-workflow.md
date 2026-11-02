---
title: Mix & Master Workflow — Live Two-Mic Acoustic
doc_type: reference
audience: agent
domain: audio-engineering
daw: GarageBand
source_format: live two-mic single-pass acoustic (SM57 guitar + SM57 vocal, Scarlett 2i2)
aesthetic: close, dry, center-heavy, saturated (Tallest Man on Earth / Nick Drake)
steps: 15
version: 1
---

# Mix & Master Workflow — Live Two-Mic Acoustic

Reference procedure for mixing and mastering a solo acoustic performance captured
live on two mono microphones in a single pass.

## How to read this document

Each step is a self-contained block with the same fields:

- **Goal** — the single outcome the step produces.
- **Do** — ordered actions.
- **Params** — numeric starting points. These are ranges, not targets.
- **Why** — the reasoning, for judgment calls the checklist does not cover.
- **Fail signals** — observable symptoms that the step was overdone.
- **Done when** — the exit condition.

Steps are ordered. Do not reorder them. A step with no measurable improvement
should be reverted rather than kept.

## Global constraints

| ID | Constraint |
| --- | --- |
| G1 | Heavy bleed between the two mics. Every sound exists twice, at two distances. This drives most decisions below. |
| G2 | Corrective moves (EQ, gain, automation) go on individual tracks. Character moves (compression, saturation, reverb) go on the pair, so both copies of a sound are treated identically. |
| G3 | Execute steps in order. Most bad self-mixes start at step 11. |
| G4 | If the difference is inaudible, revert the move. Every plugin is a future failure point. |
| G5 | Match loudness before any A/B comparison. Louder always sounds better. |
| G6 | Judge with both tracks playing. Never solo a track to make a decision. |
| G7 | Never pan wide to create size. Bleed smears when widened. Size comes from performance and saturation. |

**Prerequisite:** duplicate the project and work in the copy, named
`songname_mix_v1`. Keep the original.

## Required plugins

| Plugin | Vendor | Purpose | Required |
| --- | --- | --- | --- |
| MUtility | MeldaProduction (free) | Polarity invert, sample-accurate delay, real input metering | Yes — fills GarageBand's biggest gaps |
| Youlean Loudness Meter | Youlean (free tier sufficient) | LUFS metering for mastering | Yes — GarageBand has no loudness metering |
| TDR Kotelnikov | Tokyo Dawn (free) | Transparent compressor with GR meter and release control | Optional |

---

## Phase 1 — Foundation (steps 1–5)

### Step 1 — Pick the take

**Goal:** one take, committed to, trimmed.

**Do:**
1. Choose on feel, not cleanliness. The take with the rushed bridge and the cracked note beats the technically clean one.
2. Trim head and tail, leaving one beat of room tone.
3. Apply short fades to the very start and end only.
4. Close all alternate takes.

**Do not:** gate or apply noise reduction. Anything applied to silence on one
track is applied against a live guitar on the other. Fix isolated bumps with a
manual volume dip on that one spot.

**Why:** emotional performance is the reason for recording live. A/B between
takes produces paralysis, not better choices.

**Done when:** alternates are closed and the file is trimmed.

### Step 2 — Import a reference track

**Goal:** an external anchor that resists ear fatigue.

**Do:**
1. Import a finished commercial record onto a muted track.
2. Pull its fader down 8–12 dB so it roughly matches the raw mix level.
3. Unmute for ~4 seconds whenever judgment feels uncertain, then re-mute.

**Params:** reference candidates — *The Wild Hunt*, *King of Spain*, *Pink Moon*
(sparsest target).

**Why:** ears normalize to the current mix within roughly twenty minutes. This is
the cheapest available correction.

**Done when:** reference is in the session, muted, level-matched.

### Step 3 — Phase and polarity

**Goal:** the fullest low-mid relationship between the two mics.

**Do:**
1. Insert MUtility **first** in the chain on the guitar track.
2. Reset INPUT to `0.00` and PANORAMA to center so level and pan do not bias the comparison.
3. Toggle **both** Invert Left and Invert Right together. A mono source presented as dual-mono will cancel if only one side is flipped.
4. Loop the densest section. Toggle every few bars. Listen to **150–400 Hz only**.
5. Keep whichever state is fuller.

**Optional micro-alignment (5 minutes, hard stop):**

| Value | Equivalence |
| --- | --- |
| 1 ms | ≈ 44 samples ≈ 1 foot of air |

Try the guitar 30–80 samples later via MUtility's DELAY. To move the guitar
*earlier*, delay the vocal instead. With two bleeding sources, both cannot be
aligned — it is a trade.

**Why:** polarity is **relative** between the two tracks. Flipping the guitar and
flipping the vocal produce the same result. Test one track only.

**Done when:** one polarity state is chosen and the alternative has been heard
back-to-back.

### Step 4 — Gain staging

**Goal:** correct level arriving *at the plugins*.

**Do:**
1. Read levels on MUtility's In meter, first in the chain. GarageBand's stock meters are inadequate for this.
2. Correct with MUtility's VOLUME knob, **not** the fader. The fader is last in the chain, after the plugins, and is not gain.
3. Scrub the full song once, watching for a single clipped peak.

**Params:**

| Target | Value |
| --- | --- |
| Loudest peaks | −18 to −10 dBFS (zone, not target) |
| Hard ceiling | nothing above −3 dBFS |
| Floor | nothing down at −25 dBFS |

**Why:** at 24-bit there is no tone penalty for recording quiet. If levels are in
range, change nothing.

**Done when:** peaks are in range and no clipped peak exists.

### Step 5 — Static balance, in mono

**Goal:** a working balance using faders and pan only.

**Do:**
1. Bypass everything except faders and pan.
2. Pan guitar 15–20% to one side. Vocal dead center. Resist going wider (G7).
3. Mono-check via System Settings → Accessibility → Audio → "Play stereo audio as mono", or a second MUtility on the Master with PANORAMA LEFT and RIGHT both centered.
4. Sit with the balance for five minutes without touching anything.

**Key relationship:** *the guitar fader is also a vocal control.* Raising the
vocal fader raises only the close copy; the roomy copy inside the guitar mic stays
put, and past a point the vocal just sounds doubled. To bring the vocal forward,
bring the guitar **down** instead.

**Done when:** the balance survives five minutes of listening unchanged.

---

## Phase 2 — Track shaping (steps 6–9)

Steps 6 and 7 share **one Channel EQ instance per track**. Eight bands is
sufficient. The split is about decision order, not separate plugins.

### Step 6 — Subtractive EQ

**Goal:** remove real problems. One or two cuts per track.

**Sweep technique:** boost a band +10–12 dB at Q 6–8, drag slowly across the
range, listen for where the problem gets *worse*, stop there, then invert to a
**2–4 dB cut** and widen Q to **2–3**. Boost to find, cut to fix.

| Track | Range | Target problem |
| --- | --- | --- |
| Vocal | High-pass 70–80 Hz | Rumble |
| Vocal | 300–500 Hz | Boxiness, cupped-hands |
| Vocal | 2–4 kHz | Nasal honk |
| Vocal | 5–6 kHz | Spit (the SM57 presence bump) |
| Guitar | High-pass 60–70 Hz | Rumble |
| Guitar | 200–400 Hz | Boom |
| Guitar | 1.5–3 kHz | *The vocal's seat* — wide 2 dB dip, Q ~1.5 |

**Rules:**
- Do not cut all of them. Three or four cuts per track usually means a good take is being processed away.
- Judge with both tracks playing (G6).
- Bypass periodically and ask whether the raw track actually had the problem, or whether it was invented while staring at the analyzer.
- **Position the guitar's 1.5–3 kHz dip by listening to the vocal**, not the guitar. Drag until the voice steps forward — a far easier judgment than evaluating 2 dB on the track being adjusted.

**Done when:** one or two justified cuts exist per track.

### Step 7 — Additive EQ

**Goal:** wide, gentle tonal reinforcement.

| Track | Move | Amount |
| --- | --- | --- |
| Vocal | 150–220 Hz, Q 0.7–1.0 | +1.5 to 3 dB — chest and weight |
| Vocal | High **shelf** above 8 kHz, Q ~0.7 | +1 to 2 dB — optional air |
| Guitar | 80–120 Hz, Q 0.7–1.0 | +1.5 to 3 dB — body |
| Guitar | High **shelf** ~8 kHz, Q ~0.7 | +1 to 2 dB — optional |

**Rules:**
- Wide Q on every boost. Q above 2 on a boost is a step 6 move in disguise.
- A high shelf is not a low-pass. Verify the band type.
- Boosts near 240 Hz fight a cut at 300 Hz. Space them apart or drop one.
- The guitar's low boost covers the voice. Make the move, then check whether the vocal got quieter.
- Sum the boosts and pull Channel EQ's output Gain down to compensate, then re-check the balance (G5).

**Exit check for steps 6 and 7:** bypass both EQs with both tracks playing.
Processed must clearly beat raw. If it does not, undo something.

### Step 8 — Light compression

GarageBand's stock Compressor has four controls and **no gain reduction meter**,
so threshold must be set by ear.

| Track | Ratio | Attack | Target GR |
| --- | --- | --- | --- |
| Vocal | 3:1 | 20–30 ms | 2–3 dB on the loudest lines only, zero in verses |
| Guitar | try none first; if needed 2:1 | — | 1–2 dB |

**Do:**
1. Start the threshold above the peaks where it cannot engage.
2. Lower slowly on a looped chorus until peaks just feel *held*. Usually a few dB below peak level.
3. Match loudness with the Gain knob before judging (G5).

**Fail signal:** guitar bleed swelling in the gaps between vocal phrases. That is
the pumping — back off.

**Why so little:** every dB of compression makes the bleed inside one mic duck
while the real source does not. Under 3 dB this stays invisible. Past that it
produces a swimming quality that is hard to identify and impossible to remove
later. Density comes from step 11, not here.

**Escalation:** if setting by ear is too frustrating, substitute TDR Kotelnikov
for full metering and release control.

### Step 9 — Volume automation

**This is the step that produces the largest audible improvement.**

**Access:** press `A` or click the arrow in the track header, choose **Volume**.
Click the line to add points. Four points make a plateau (before / start / end /
after).

| Move | Amount |
| --- | --- |
| Buried word | +1.5 to 2 dB |
| Word that leaps out | −2 dB |
| Guitar under dense vocal lines | −0.5 dB |
| Guitar in intros and instrumental passages | +1 dB |

**Common culprits:** ends of phrases, the word immediately after a breath, low
notes, anything sung with less conviction.

**Method:**
1. Work in phrase-sized loops. Judge each line against the guitar, never soloed.
2. Run one pass at very low listening volume — buried words vanish entirely and hot words poke out, making both easier to locate. Confirm at normal level.
3. Do the lighter guitar pass last.

**Bleed constraint:** pushing a word up more than ~2 dB raises only the close
copy and begins to sound doubled. For a word that stays buried, dip the guitar
underneath it instead (see step 5).

**Tooling note:** once a volume lane contains points, the GarageBand fader follows
the automation rather than setting an independent level. For a global vocal level
change after this step, use the compressor's Gain or MUtility's volume.

**Expected scope:** 30–50 moves on a three-minute song. One hour minimum on a
first attempt.

**Why this beats more compression:** a compressor reacts to level and cannot
distinguish a word that is loud from a word that is mumbled. A human can. The
goal is a vocal that sits in the same place from first line to last without
sounding squashed to get there.

**Done when:** a full uninterrupted playthrough surfaces at most one word worth
fixing. Fix that word and stop. Do not start a second full pass.

---

## Phase 3 — Space, glue, and stopping (steps 10–12)

### Step 10 — Shared space

**Goal:** one room, containing both sources.

**Architecture:** a single reverb on a bus, fed by **both tracks at the same send
level**. Same room for both sources is what makes the result sound like a
performance in a place rather than two files with effects on them.

| Parameter | Value |
| --- | --- |
| Type | Small room or short plate |
| Decay | 0.8–1.4 s |
| Pre-delay | 20–40 ms |
| High-cut | 6–8 kHz |
| Low-cut | ~300 Hz (prevents mud) |
| Return level | set where it is noticed **when muted**, and not before |

**Optional:** slap delay on the vocal only — 90–110 ms, very quiet, no feedback.
Adds size without wash. Be willing to lose it.

**Why:** the reference records are drier than people remember. Do not reach for a
hall.

### Step 11 — Bus processing

Both tracks route to the Master. **Saturation first, then compression.**

**Overdrive** (GarageBand's is a FET emulation — warmer than the Distortion
plugin, which models a bipolar transistor):

| Control | Guidance |
| --- | --- |
| Drive | Saturation amount. 1.00 dB is essentially bypassed; the range goes far higher. Push until it thickens, then back off by about a third. |
| Tone | A **high-cut on the distorted signal**. Higher = brighter and more aggressive; lower = warmer. Set 3.5–5 kHz for warmth rather than edge. Saturation generates new upper harmonics; Tone decides how many survive. |
| Output | Makeup gain. Enable Level Compensation if available, or match loudness manually (G5). |

Bypass and re-engage several times. If the saturation is clearly identifiable as
an effect, it is too much.

**Then a bus compressor:**

| Parameter | Value |
| --- | --- |
| Ratio | 2:1 |
| Attack | slowest available |
| Release | slow |
| GR | 1–2 dB on the loudest choruses, zero in verses |

This is glue, not level control. **No limiter on the master yet.**

**Optional parallel processing:** duplicate a track, crush it (8:1, fast attack,
10+ dB GR), blend underneath at 20–30%. The same idea works for saturation —
Drive pushed well past correct, Tone down, faded in until the main track just
feels thicker. With bleed present, apply this to the pair rather than one track
(G2).

### Step 12 — Checks, then stop

| Check | What to listen for |
| --- | --- |
| Mono | Especially now — reverb is where stereo information actually entered the mix |
| Phone speaker, out loud across a room | Is the vocal still intelligible? Does anything disappear? |
| Car, if available | — |

Then **stop**. Close the session. Return the next day and fix the two or three
things that have become obvious. There is no substitute for this and no way to
rush it.

---

## Phase 4 — Bounce, master, deliver (steps 13–15)

### Step 13 — Bounce the mix

| Setting | Value |
| --- | --- |
| Master limiting | removed or bypassed |
| Format | 24-bit WAV |
| Sample rate | session rate |
| Peaks | ~−6 dBFS |

That headroom is for the mastering stage and is not wasted.

### Step 14 — Master, in a new session, on a different day

Import the bounce into a fresh empty project. **A different day is not optional** —
mastering is a judgment pass and freshly built work cannot be judged.

Install Youlean Loudness Meter and place it **last** in the chain.

**Chain, in order:**

| # | Processor | Settings |
| --- | --- | --- |
| 1 | Broad EQ | Wide Q only, ±1–2 dB maximum. A 4 dB move means going back to fix the mix. |
| 2 | Gentle compression | 1.5:1, slow attack, 1 dB GR at peaks — or skip it; a well-glued mix often wants none. |
| 3 | Limiter | Ceiling **−1.0 dBTP**, not −0.1 |

**Why −1.0 dBTP:** that dB is headroom for the lossy encoders every streaming
service runs the file through. Without it, audible distortion appears on the
streamed version that is not present in the file.

**Loudness target: −14 to −12 LUFS integrated.**

- Spotify and Apple normalize to around −14, so pushing louder buys nothing — the file is turned back down with the transients already gone.
- For quiet acoustic folk, −14 is right and −16 is defensible.
- Louder than −11 actively damages the record.

Add fade-in and fade-out, 0.5–2 s as the song wants.

**Export:** 24-bit WAV, 44.1 kHz. Never deliver an MP3 as a master.

### Step 15 — Final QC

1. Listen to the exported file top to bottom, without stopping, without touching anything.
2. Check the **first half-second and last half-second** specifically — clipped breaths and truncated tails are the most common defects that slip through.

Then deliver.

**Note on outsourcing:** mixing yourself is the right call — it is your record and
the decisions are aesthetic. Mastering is the one stage where outside ears and a
treated room carry real weight, at roughly $50–100 a track. Suggested approach:
mix everything yourself, master one song yourself, then send that same song out
and compare. If yours holds up, keep the money. If it does not, you have learned
exactly what is missing.

---

## Quick reference

### Minimum viable path (≈80% of the result)

| Priority | Step | Cost |
| --- | --- | --- |
| 1 | Phase check (step 3) | 10 seconds, sometimes 3 dB of free low mids |
| 2 | Static balance (step 5) | Faders and pan, in mono |
| 3 | Vocal automation (step 9) | The step that makes it sound like a record |

### Key numbers

| Thing | Value |
| --- | --- |
| High-pass, vocal | 70–80 Hz |
| High-pass, guitar | 60–70 Hz |
| EQ cuts | 2–4 dB, Q 2–3 |
| EQ boosts | 1.5–3 dB, Q 0.7–1.0 |
| Track compression | 2–3 dB GR max, attack 20–30 ms |
| Bus compression | 1–2 dB GR, 2:1, slow |
| Automation moves | ±1.5–2 dB, 30–50 per song |
| Reverb decay | 0.8–1.4 s, pre-delay 20–40 ms |
| Mix bounce peaks | −6 dBFS, 24-bit WAV |
| Limiter ceiling | −1.0 dBTP |
| Loudness target | −14 LUFS integrated |
| 1 ms of delay | ≈ 44 samples ≈ 1 foot of air |

### Failure modes

| Mistake | Correction |
| --- | --- |
| Judging at unmatched loudness | Match level before every comparison |
| Asking "is it better?" | Unanswerable. Ask "is it more or less boxy," "does the vocal sit further forward." Decide what to listen for *before* toggling. |
| Slow A/B | Ears adapt in seconds. Loop two bars and flip every pass, not every ten seconds. |
| Compressing individual tracks hard | With bleed this creates pumping that cannot be removed later |
| Fixing what is not broken | If a track is in range, leave it |
| Panning to fight the mono-ness | Bleed smears when widened. Size comes from performance and saturation. |
| Starting at step 11 | Execute in order |

---

## Session state template

Append per-song state below when resuming work across sessions.

```markdown
## Song: <title> — <date>

**Stopped at:** step <n>, <sub-task>

### Decisions made
- Step 3 polarity: <inverted / un-inverted>, tested on <track>
- Step 4 gain: <peaks per track>
- Step 6/7 vocal EQ: <bands>
- Step 6/7 guitar EQ: <bands>
- Step 8 compression: <settings per track>

### Open items
- [ ] <item>

### Setup
Guitar: <instrument, capo> · Mics: <mics, interface> · <live / overdubbed>
```

## Song: Hey, Player — 2026-11-02

**Stopped at:** step 15 done for mix 1. Next: step 12's "stop, come back tomorrow" listen, then fix two or three things. The master was made the same day, so step 14's different-day rule hasn't happened yet.

Files (in `~/stefan/music/I Don't Need Therapy:Tell Me How You Feel/Hey, Player/`):
`Hey, Player mix 1.wav` (master), `Hey, Player mix 1 - unmastered.wav` (step 13 bounce, −6 dBFS peaks),
`Hey, Player mix 1.band` (copy with the processed takes baked in; original `Hey, Player.band` untouched).
Rendered by `tools/mixing/hey-player-mix.py` (outside GarageBand, from the raw takes).

### Decisions made
- Take: vocal comp `vocal#04` (bars 3–30) + `vocal#05` (bar 30 on), seam in silence; guitar `main guitar#02` (stereo, two mics). Vocal was overdubbed, so there's no bleed between vocal and guitar (xcorr ≈ 0.01). The bleed rules (G1/G2, the ~2 dB ride cap) don't bind the vocal.
- Step 1 trim: start 0.6 s (one beat) before the first strum; end before a bump at the very tail; 0.5 s fade in, 2 s fade out.
- Step 2 reference: `assets/The Tallest Man On Earth - The Wild Hunt.wav` (by numbers, 1/3-octave comparison).
- Step 3 polarity: guitar L/R kept as recorded (sum 11 dB fuller at 150–400 Hz than inverted). R leads L by 12 samples; aligning changed nothing measurable → not kept.
- Step 4 gain: takes peaked −5 to −6 dBFS → trimmed to −10 dBFS peak in.
- Step 5 balance: vocal centre; guitar narrowed (side −6 dB) and panned 15% left; vocal-over-guitar target +6.5 dB (K-weighted, 400 ms, while singing). Mono fold −0.08 LU, L/R correlation 0.97.
- Step 6/7 vocal EQ: HPF 75 Hz; −2 dB @ 750 Hz Q2 (boxy); −2.5 dB @ 3.4 kHz Q2.5 (honk/hardness). No boosts (chest already peaks at 200 Hz).
- Step 6/7 guitar EQ: HPF 65 Hz; −2.5 dB @ 210 Hz Q2.5 (boom); −2 dB @ 2.6 kHz Q1.5 (vocal's seat); +2.5 dB @ 90 Hz Q0.8 (body; low E sat ~11 dB under the reference); output −1 dB.
- Step 8 compression: vocal 3:1, 25 ms attack, 150 ms release, ~1.5–2.5 dB GR on the loudest lines (99th pct). Guitar none.
- Step 9 automation: 61 vocal word-group rides (−3 to +3.5 dB; the spread between word groups was −4/+3 dB at p10/p90, now about ±1 dB) and 5 guitar dips (−1.5 dB) under words still buried. Guitar +1 dB in the intro and instrumental gaps, −0.5 dB under dense lines. Moves exceed the guide's 30–50 because this vocal is very dynamic.
- Step 10 space: one shared small room (RT60 1.1 s, 30 ms pre-delay, send LC 300 Hz / HC 7 kHz), same send from both tracks, return 21 LU under the dry mix.
- Step 11 bus: gentle FET-style saturation (harmonics high-cut at 4.5 kHz, added energy −35.6 dB), then 2:1 slow glue, ~1.3 dB GR on the loudest choruses.
- Step 14 master: +1.5 dB low shelf @ 120 Hz, −1.5 dB @ 4 kHz Q0.7 (mix was 6 dB light below 150 Hz and 3.5 dB hot at 2.5–6 kHz against the reference); no master compression; limiter ceiling −1.0 dBTP (barely touches: 0.05 dB). Result −14.0 LUFS, −1.08 dBTP, LRA 7.8 LU.

### Open items
- [ ] Listen to mix 1 on another day: phone speaker across the room, car (step 12).
- [ ] Judge by ear: are the rides too even (did the song lose its arc)? Is the reverb noticed only when muted? Is the guitar body (+2.5 dB @ 90 Hz plus master low shelf) too much?
- [ ] Mastering on a different day (step 14), or send the unmastered bounce out and compare.

### Setup
Guitar: main guitar#02, stereo (two mics), recorded 2026-07-07 · Vocal: mono, overdubbed 2026-11-02 · 100 BPM, 4/4, E major
