# Havre De Grace — Project Context

A living reference document for Stefan and any agents working in this repo. It describes who the artist is, what the project is, how it's run, and the principles that should guide work on the site and around the music.

_Last updated: October 1, 2026_

---

## Identity and sound

Havre De Grace is the solo acoustic folk project of Stefan Bradley, a singer-songwriter based in the Portland, OR / Vancouver, WA area. The sound is intimate and lo-fi, in the vein of Nick Drake, The Tallest Man on Earth (especially the early records and *The Wild Hunt*), Iron & Wine, and Damien Rice. Stefan is a self-taught guitarist influenced by Dylan, Tallest Man, Nick Drake, and Jack White, with a punk ethos underneath the folk.

The project was previously released under the name Stefan Auvache. The transition to Havre De Grace was handled on DistroKid using Artist Mapping and dual credits so existing streams carried over.

### Brand philosophy

- **Presence over persuasion.** The brand is governed by a 10-point guardrails document informed by Robert Greene's seduction framework.
- **DIY and unpolished.** No glossy production, filters, or overlays. Raw is the point.
- **Some mystery.** Surface content showcases the music without over-explaining it; deeper songwriting insight is there for fans who go looking.
- **No AI in the music.** Stefan does not use AI in any way to write, record, or produce his music. AI-assisted *coding* is used for the website and for SVG-animated music videos, but no AI image or video generators are used. Keep this distinction clear in any public-facing copy.

---

## Releases and catalog

| Release | Date | Notes |
|---|---|---|
| *I Want to Be Yours and Other Songs* | — | Debut album |
| *Into the Wild* | July 17, 2026 | Produced with Parker. More layered than the debut: acoustic guitar and vocals as the backbone, with trumpet and piano color |

Stefan has roughly 50 songs written with intent to record. "Ivory" has been pitched via Spotify for Artists.

### Third album (in progress)

- Self-recorded and stripped-down, played exclusively on the Martin 000-12E.
- Stefan is handling it himself at least through mixing. He didn't enjoy the producer back-and-forth or track-by-track recording on the last record and prefers full live takes.
- Target feel: *The Wild Hunt*.
- No fixed completion date; timing depends on family life.
- The recording process will be documented in a Shorts series built from session snippets.

---

## Gear and playing

**Guitars**
- Martin D-18 — primary tuning CGCGCE, permanently installed LR Baggs M1 passive pickup
- Martin 000-12E — sounds best capoed; the sole guitar for the third album
- A 12-string

**Tunings:** Eb standard, DADGBD, CGCGCE — almost always capoed, usually at the 1st fret.

**Recording setup**
- AT2020 plus two SM57s into a Focusrite Scarlett 2i2
- Two-mic configuration for simultaneous live takes
- GarageBand on a MacBook Pro
- Sonic references: *Pink Moon*, *The Wild Hunt*

**Live sound**
- LR Baggs Para Acoustic DI
- Mackie ProFX10v3
- Harbinger Vari V2408
- Kustom PA50

**Voice work:** audiation, laryngeal stability, yawn-onset cue, breath support, ear training for pitch accuracy.

---

## Live performance

Past shows include open mics, a farmers market gig (self-run sound), and a PSA Thursday Night Coffeehouse Showcase at Artichoke Music on August 13, 2026.

**Current status (fall 2026):** not performing live for several months; focus is on recording, mixing, and writing.

**Summer 2027 plan — the "lazy man's tour":** 7–8 shows over about two months, all within an hour of Portland/Vancouver. Music venues and opening slots only (not wineries or breweries), largely so the venue handles sound and no PA needs to be brought.

---

## Promotion strategy

The overarching goal is slow, sustainable audience growth so people are waiting when the next album comes out.

### Channels

1. **Shorts via Buffer** across YouTube Shorts, Instagram Reels, and TikTok. Previously 3x/week (Tue/Thu/Sat); as of late September 2026, cut back to 2x/week and testing a staggered schedule with different days and times per platform. Includes the album-recording series.
2. **Reddit** — participating in music communities and sharing music, videos, and things built for the project (e.g. the record player).

SubmitHub was tried and researched (comps: Josh Ritter, Tallest Man on Earth, Beirut, Frank Turner) and found not very useful.

### What the data says

YouTube analytics (exported Studio CSVs) show Shorts outperforming long-form content by roughly 20x. The same analysis diagnosed a Buffer posting outage from May 30 to June 12, 2026.

### Principles

- Organic before paid — only amplify content after it shows organic traction.
- Saves and shares matter more than views.
- Emotionally led captions over promotional ones.
- Preserve the lo-fi aesthetic; raw video performs better for this style.
- Batch-film many videos in one session to front-load effort.

---

## Business infrastructure

- **Distribution:** DistroKid (with Artist Mapping)
- **Royalties and rights:** BMI, the MLC, SoundExchange
- **Sync licensing:** Songtradr, Musicbed — sync is viewed as a potential primary income source
- **Email list:** Kit (repurposed account), with a signup form on the site
- **Email addresses (ImprovMX forwarding):**
  - `booking@havredegracemusic.com` — booking
  - `stefan@havredegracemusic.com` — general/fan-facing and Kit sender
- **Merch (planned):** Printful/Printify store integrated into the Nuxt site

---

## The website

havredegracemusic.com is a Nuxt (SSG) site hosted on AWS Amplify, built with Vue and TypeScript.

**Notable features**
- **Digital vinyl record player** at `/listen` — an interactive player for the albums
- **SVG-animated music videos** — built in code with AI-assisted coding (no AI image/video generation)

**Planned**
- Kit mailing list signup form
- Merch store via Printful/Printify

---

## Research and strategy influences

**Artists studied:** Gregory Alan Isakov, Sleeping At Last, Ren Gill, Hollow Coves, Novo Amor, Wardreben, Eivør.

**Growth models of interest:** Eivør's twin-release approach, catalog compounding, sync as a primary income source.

**Blue-ocean angle:** Swedish-language folk music (Stefan is half Swedish).

---

## Constraints and working style

- Stefan works full-time as a software engineer and has a young family. Music time can be as little as 30 minutes a day, with roughly an hour a week for promotion.
- Favor strategies that front-load effort and minimize ongoing weekly demands.
- Prefer concrete, actionable plans (specific counts, durations, schedules) over abstract frameworks.
- Long-term aim: Havre De Grace is an outlet first. The goal is a steady, compounding body of work: an album every June 6, 1–2 EPs a year, and story writing tied to the songs, built step by step. Stefan would like to do music full time eventually, with no rush. Income (sync, shows, merch, Bandcamp, books) is welcome, but decisions are made for himself and the fans, not for the money. See `VISION.md`.
