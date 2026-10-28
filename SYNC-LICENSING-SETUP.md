# Sync Licensing Setup

A working checklist for getting the Havre De Grace catalog ready for sync. Check boxes off as they're done.

_Started October 2, 2026._

## Already in place

- [x] DistroKid distribution (Artist Mapping from Stefan Auvache)
- [x] BMI: Stefan as writer, own BMI publishing company as publisher
- [x] Every released song registered with BMI as a work
- [x] The MLC and SoundExchange
- [x] Licensing card on `/contact`
- [x] Separate vocal and instrument tracks for almost every song

## The goal

Own 100% of every master and every song, so each track is **one-stop**: one person can say yes to a license. Pay the people who helped generously anyway. Owning something and sharing the money it makes are separate questions, and the agreements in step 1 handle both.

---

## Step 1: Contributor agreements

Drafts are in `~/Downloads`:

- `Producer Agreement - Parker Holt.docx`
- `Session Musician Agreement - Sam McKague.docx`
- `Session Musician Agreement - Josh Andromidas.docx`

Who gets what: a share of what the **recording** earns (the master side of sync fees, plus streaming and downloads). Songwriting income stays 100% yours.

| Person | Role | Songs | Share |
|---|---|---|---|
| Parker Holt | Production and mixing on all 18 songs; mastering on the debut | All 18 | 20% |
| | Mellophone | Into the Wild, Andalusia, Meet Me at the Horizon, Rocks in the Sea | 30% on these four (+10%) |
| Sam "Blaze" McKague | Trumpet | Goodbye, Norma Jeane; Rocks in the Sea | 10% |
| Josh Andromidas | Piano and keys | Goodbye, Norma Jeane; New York; Ghost | 10% |

The most anyone else gets on a single song is 40% of the master side: 20% of the total fee, since the publishing half stays yours. That happens on Goodbye, Norma Jeane (Parker, Sam and Josh) and Rocks in the Sea (Parker at 30% plus Sam).

The 18 songs: the debut's 8 (without *I Want to Be Yours - Demo Version*) plus *Into the Wild*'s 10. The demo stays out of the agreements and out of sync.

**What each person gives you** (the same for everyone):

- They assign you all rights in the recordings they worked on, so you own the masters outright.
- They have no ownership of, or claim to, the compositions. They're performers and a producer, not co-writers.
- You can license, edit, remix, and make instrumentals and stems of those recordings without asking them.
- They have no approval rights over deals, so nobody can block a placement.

**What you give them** (the generous part):

- **A share of what the recording earns** on every song they're on, for as long as it earns, at the percentages in the table above. That's the master side of sync fees plus the streaming and download earnings DistroKid reports per song. A sync fee is usually split into a master side and a publishing side; their share comes only from the master side. The composition side (publishing, plus BMI and MLC royalties) stays 100% yours. Bandcamp, physical copies, merch, shows and SoundExchange are left out.
  - Example: a $2,000 license for Goodbye, Norma Jeane pays about $1,000 master-side and $1,000 publishing. Parker gets $200, Sam and Josh get $100 each, and you keep $1,600.
- **Credit** wherever the song is credited: liner notes, the site, and platform metadata.
- **Portfolio use:** they can use the recordings in their own reels and portfolios.
- **A once-a-year statement** at the June 6 release, the same day you tally the year's income anyway.
- **A thank-you at signing:** dinner, or $50–100. It makes the agreement real and shows you mean it.

**How payment works:** all income comes to you. Once a year after June 6, you send each person a statement and pay them, with amounts under $20 carrying over. Don't use DistroKid Splits yet: collaborators without their own DistroKid account cost $10 a year each to collect, which is more than they'd earn right now. The agreements let you switch a song to Splits later if it starts earning real money.

- [x] Draft the agreements (one producer agreement, two session musician agreements)
- [ ] Read them through, and fill in the thank-you amount in each "Thank you" section
- [ ] Check legal names (for example, whether Sam signs as Samuel)
- [ ] Optional: have a lawyer look them over once (a volunteer lawyers for the arts program is the low-cost route)
- [ ] Talk with Parker: covers both albums, and also ask for the bounces in step 4
- [ ] Talk with Sam
- [ ] Talk with Josh
- [ ] Signed: Parker
- [ ] Signed: Sam
- [ ] Signed: Josh
- [ ] Store the signed PDFs somewhere permanent, next to the master WAVs

_General guidance, not legal advice._

---

## Step 2: YouTube Content ID check

If Content ID is on, a filmmaker who licenses a song can still get a copyright claim on their video.

- [x] In DistroKid, check whether YouTube Content ID / social monetization is on for each release. **Checked October 2, 2026: it's off for all four.** None of *I Want to Be Yours and Other Songs*, *Into the Wild*, the Ivory single or the Goodbye, Norma Jeane single is opted into DistroKid's **Social Media Pack**, the paid extra that adds YouTube Content ID, TikTok, Meta Rights Manager and Spotify video matching.
- [x] Nothing to whitelist and nothing to opt out of.
- [ ] Going forward: leave the Social Media Pack off for any song in the sync catalog. Each release page under "Add extras" offers it; skip it.

---

## Step 3: BMI alternate titles

Instrumentals and stems are the same composition, so they **don't** need new registrations. Add an alternate title instead, so a cue sheet filed as "Ivory (Instrumental)" still pays you.

- [ ] Add an `(Instrumental)` alternate title to each work in BMI
- [ ] Write down each song's BMI work number in the step 5 sheet
- [ ] Write down both IPI numbers: Stefan as writer, and the publishing company

---

## Step 4: Instrumentals and stems from Parker

**Source:** Parker's mix sessions for both albums. The only masters in this repo are the MP3s the site streams (128 kbps for the debut, ~256 kbps for *Into the Wild*). Separating those with AI would leave artifacts and a lossy source, which is fine as a reference but not good enough to deliver. Bouncing from the real sessions keeps the exact mix and mastering.

### Exactly what to get from Parker

1. **The signed producer agreement.**
2. **Final master WAVs for all 18 songs**, if you don't already have the exact released files.
3. **For the 16 studio songs:**
   - An **instrumental**: the final master with every vocal muted (lead and backing) and all mix and master processing left on.
   - **Stems**, listed per song below, bounced through the master bus so they add back up to the master.
4. **For Demolition Woman (Live) and White Raven (Live):** the master only. Vocals and guitar were recorded together, so there's no instrumental.
5. **Copies of the session folders** for both albums, for your archive (clause 9 of the agreement).
6. **Confirmation that nobody else is on the recordings:** no other players, backing singers or samples. The agreement has Parker confirm this; it's worth asking out loud too.

**File specs:**

- WAV, 24-bit, at the master's sample rate
- Every file starts at the same point and runs the same length as the master, so they line up when stacked
- Names like `Havre De Grace - Ivory (Instrumental).wav` and `Havre De Grace - Ivory (Stem - Vocals).wav`

**Bouncing time:** 16 instrumentals plus stems is a few hours of work. The agreement treats new bouncing as a separate arrangement, so offer to pay for the time or fold it into the thank-you.

**Quality check** (Claude can do this): compare each file's length and sample rate against the master, and confirm the stems add back up to the full mix.

### *I Want to Be Yours and Other Songs*

Stems for each song: Vocals, Guitars.

- [ ] I Want to Be Yours
- [ ] Shades of Blue and Red
- [ ] Sky Blue
- [ ] Scarecrow
- [ ] Jesus Creek
- [ ] Demolition Woman (Live): master only
- [ ] White Raven (Live): master only
- [ ] Song for the Sick

### *Into the Wild*

Stems for each song: Vocals, Guitars, plus the extras listed below, plus an Other stem for anything else in the mix.

- [ ] Into the Wild: + Brass (mellophone)
- [ ] Conman
- [ ] Goodbye, Norma Jeane: + Keys, Brass (trumpet)
- [ ] Ivory
- [ ] Andalusia: + Brass (mellophone)
- [ ] New York: + Keys
- [ ] Meet Me at the Horizon: + Brass (mellophone)
- [ ] Rocks in the Sea: + Brass (trumpet, mellophone)
- [ ] Ship to Stockholm
- [ ] Ghost: + Keys

- [ ] Each song folder holds: master WAV, instrumental WAV, stems
- [ ] Session folders received and archived
- [ ] Back up the whole sync folder (the masters weren't found on this Mac)

---

## Step 5: Metadata sheet

One row per song. Both platforms ask for the same fields, so this sheet makes uploads copy-and-paste.

Columns: title, album, ISRC (from DistroKid), BMI work number, writer + IPI, publisher + IPI, splits (100% / 100%), length, BPM, key, 3–5 mood words, lyrics, instrumental available (y/n), contributors owed a share.

- [ ] Generate the starting sheet from `content/music/*.yml` (titles and lyrics are already there)
- [x] Add ISRCs from DistroKid (copied from each release page, October 2, 2026):

  | Song | ISRC |
  |---|---|
  | I Want to Be Yours | QZTBF2551903 |
  | Shades of Blue and Red | QZTBF2551904 |
  | Sky Blue | QZTBF2551905 |
  | Scarecrow | QZTBF2551906 |
  | Jesus Creek | QZTBF2551907 |
  | Demolition Woman | QZTBF2551908 |
  | White Raven | QZTBF2551909 |
  | Song for the Sick | QZTBF2551910 |
  | Into the Wild | QT6ET2600940 |
  | Conman | QT6ET2600941 |
  | Goodbye, Norma Jeane | QZZ7U2639484 |
  | Ivory | QZZ7V2621852 |
  | Andalusia | QT6ET2600942 |
  | New York | QT6ET2600943 |
  | Meet Me at the Horizon | QT6ET2600944 |
  | Rocks in the Sea | QT6ET2600945 |
  | Ship to Stockholm | QT6ET2600946 |
  | Ghost | QT6ET2600947 |

  UPCs: *I Want to Be Yours and Other Songs* 821451513204 · *Into the Wild* 882652814774. Goodbye, Norma Jeane and Ivory share their ISRCs with the album, so each is one recording, not two.
- [ ] Add BMI work numbers
- [ ] Add BPM, key, and mood words

---

## Step 6: Musicbed

Curated, accepts under 1% of applications, and indie folk and singer-songwriter music is one of its core genres.

- [ ] Apply with *Into the Wild* and the strongest songs from the debut
- [ ] Find out whether their representation is exclusive per song, **before** putting those songs on Songtradr
- [ ] Note which songs (if any) Musicbed takes

---

## Step 7: Songtradr

Non-exclusive, so the same song can be licensed many times.

- **Starter plan:** free, and you keep 60% of sync fees.
- **Pro plan:** $49/year, and you keep 80%. It pays for itself after about $245 a year in fees, so start on Starter.

- [ ] Create a Starter account
- [ ] Upload the debut first: full mix + instrumental + stems + metadata, marked one-stop
- [ ] Upload *Into the Wild* once the step 1 agreements are signed and Musicbed has answered
- [ ] Set default pricing
- [ ] Revisit the plan at the June 6 tally: upgrade to Pro if fees are over ~$245 a year

---

## Step 8: Site licensing page

- [ ] Expand the `/contact` licensing card or add a `/licensing` page: "Every song is one-stop cleared. Instrumentals and stems are available."
- [ ] Link the Songtradr profile
- [ ] Optional: `licensing@havredegracemusic.com` alias in ImprovMX

---

## Step 9: Every release from now on

- [ ] Album 3: record a guitar-only pass after each keeper take (live takes have vocal bleed)
- [ ] Bounce the instrumental and stems while mixing, not afterward
- [ ] Contributor agreement signed **before** the session, not after
- [ ] Submit to sync the week after the June 6 release
- [ ] June 6 tally: pull DistroKid's per-song earnings and the year's sync licenses, then send each contributor their statement and payment

---

## Later: an LLC

Not yet. At hobby income the cost (about $200 to form, $70 a year) and the upkeep outweigh the protection. A one-person LLC files the same Schedule C, so federal taxes don't change. The contributor agreements already let you transfer them to a company you control.

**Form one when any of these happens:**

- A sync deal of $5,000 or more, or a license from a big brand, network or studio that asks you to cover them against claims
- Music income that stays above a few thousand dollars a year
- Selling physical merch yourself
- Hiring people, or running your own sound at shows
- A label, publisher or library asks you to contract as a company

**Do these now instead:**

- [ ] Open a separate checking account for music income and expenses
- [ ] Ask your tax preparer about filing the music as a business (Schedule C) rather than a hobby, so expenses become deductible
- [ ] Keep receipts for music spending
- [ ] Look into an umbrella insurance policy through your homeowner's or renter's insurer
- [ ] Later, when the name matters: trademark "Havre De Grace" for music
