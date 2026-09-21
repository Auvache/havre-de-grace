<template>
  <svg
    class="absolute inset-0 h-full w-full"
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    style="isolation: isolate"
    role="img"
    :aria-label="`Kinetic typography music video for Andalusia by Havre De Grace. Currently: ${d.line?.text ?? d.section.label}`"
  >
    <defs>
      <!-- Two clips per row: the words that have been sung, and the word landing now. -->
      <clipPath v-for="(row, index) in d.rows" :id="`film-say-${index}`" :key="`c${row.key}`">
        <rect
          :x="row.x"
          :width="row.width * row.reveal"
          :y="row.y - row.size"
          :height="row.size * 1.45"
        />
      </clipPath>
      <clipPath v-for="(row, index) in d.rows" :id="`film-now-${index}`" :key="`h${row.key}`">
        <rect
          :x="row.x + row.width * row.hotFrom"
          :width="row.width * (row.hotTo - row.hotFrom)"
          :y="row.y - row.size"
          :height="row.size * 1.45"
        />
      </clipPath>
    </defs>

    <!-- Every colour change in this film is a cut, on a measured word. -->
    <rect width="1600" height="900" :fill="d.bg" />

    <!-- The grid the type is squared up against, and never quite is. -->
    <g v-if="d.grid" :stroke="d.fg" stroke-width="1" :opacity="0.13">
      <line
        v-for="column in 13"
        :key="column"
        :x1="80 + (column - 1) * 120"
        y1="0"
        :x2="80 + (column - 1) * 120"
        y2="900"
      />
      <line x1="0" :y1="d.rule" x2="1600" :y2="d.rule" stroke-width="2" />
    </g>

    <!-- ── The lyric ──────────────────────────────────────────────── -->
    <g v-if="d.rows.length">
      <!-- A box around the landing word, for the verse of place names. -->
      <rect
        v-for="row in d.boxedRows"
        :key="`b${row.key}`"
        :x="row.x - 20"
        :y="row.y - row.size * 0.78"
        :width="row.width + 40"
        :height="row.size * 0.94"
        fill="none"
        :stroke="d.accent"
        stroke-width="5"
        :opacity="row.reveal > 0.98 ? 1 : 0"
      />

      <text
        v-for="(row, index) in d.rows"
        :key="`t${row.key}`"
        class="film-type"
        :clip-path="`url(#film-say-${index})`"
        :x="row.x"
        :y="row.y"
        :class="{ 'film-type--light': d.light }"
        :font-size="row.size"
        :textLength="row.width"
        lengthAdjust="spacing"
        :fill="d.fg"
        :opacity="row.opacity"
        :transform="row.transform"
        :dy="row.dy"
        :rotate="row.rotate"
      >{{ row.text }}</text>

      <!--
        The same rows again in the accent colour, clipped to the word being sung
        right now — a flash of colour running along the line at the speed of the
        voice. Cheaper and steadier than splitting every row into per-word
        elements, and it cannot drift out of register with the base row because
        it is the same geometry.
      -->
      <text
        v-for="(row, index) in d.rows"
        :key="`n${row.key}`"
        class="film-type"
        :clip-path="`url(#film-now-${index})`"
        :x="row.x"
        :y="row.y"
        :class="{ 'film-type--light': d.light }"
        :font-size="row.size"
        :textLength="row.width"
        lengthAdjust="spacing"
        :fill="d.accent"
        :opacity="row.hot * row.opacity"
        :transform="row.transform"
        :dy="row.dy"
        :rotate="row.rotate"
      >{{ row.text }}</text>
    </g>

    <!-- ── Intro: the title sequence over the guitar ───────────────── -->
    <g v-if="d.kind === 'intro'">
      <line
        x1="80"
        y1="450"
        :x2="80 + 1440 * d.intro.rule"
        y2="450"
        :stroke="d.fg"
        stroke-width="3"
        :opacity="d.intro.ruleOpacity"
      />
      <g v-if="d.intro.artist > 0">
        <text
          class="film-slate"
          x="800"
          y="392"
          text-anchor="middle"
          :font-size="26"
          letter-spacing="22"
          :fill="d.fg"
          :opacity="d.intro.artist"
        >{{ introArtist }}</text>
      </g>
      <text
        v-if="d.intro.title > 0"
        class="film-type"
        x="80"
        :y="d.intro.titleY"
        :font-size="d.intro.titleSize"
        textLength="1440"
        lengthAdjust="spacing"
        :fill="d.fg"
        :opacity="d.intro.title"
      >ANDALUSIA</text>
      <text
        v-if="d.intro.album > 0"
        class="film-slate"
        x="80"
        y="700"
        :font-size="24"
        letter-spacing="12"
        :fill="d.accent"
        :opacity="d.intro.album"
      >FROM THE ALBUM INTO THE WILD</text>
      <!-- Count-in: three squares, one per beat of the pickup bar. -->
      <rect
        v-for="tick in d.intro.counts"
        :key="tick.key"
        :x="tick.x"
        y="440"
        width="28"
        height="28"
        :fill="d.fg"
        :opacity="tick.on"
      />
    </g>

    <!-- ── The oh-ohs: seventeen of them, counted out ──────────────── -->
    <g v-if="d.kind === 'ohs'">
      <circle
        v-for="ring in d.rings"
        :key="ring.key"
        cx="800"
        cy="450"
        :r="ring.r"
        fill="none"
        :stroke="d.fg"
        :stroke-width="ring.w"
        :opacity="ring.o"
      />
      <g v-for="cell in d.ohs" :key="cell.key">
        <text
          class="film-type"
          :x="cell.x"
          :y="cell.y"
          text-anchor="middle"
          :font-size="cell.size"
          :fill="cell.lit ? d.accent : d.fg"
          :opacity="cell.opacity"
        >OH</text>
      </g>
    </g>

    <!-- ── Outro: the mark lands, then the end card is set under it ─── -->
    <g v-if="d.kind === 'outro'">
      <!--
        The same stacked lockup the splash screen uses, inlined from the suite
        file so it paints `currentColor` and can come up bone on ink. It arrives
        on its own, a beat before any type, because that is the one moment in
        the film where the band's name is the whole frame.
      -->
      <g
        :opacity="d.outro.mark"
        :transform="`translate(800 250) scale(${d.outro.pop}) translate(-459 -309.5)`"
        :style="{ color: d.fg }"
        v-html="LOCKUP"
      />
      <text
        v-if="d.outro.title > 0"
        class="film-type"
        x="80"
        y="546"
        font-size="168"
        textLength="1440"
        lengthAdjust="spacing"
        :fill="d.fg"
        :opacity="d.outro.title"
      >ANDALUSIA</text>
      <text
        v-if="d.outro.album > 0"
        class="film-slate"
        x="80"
        y="602"
        font-size="22"
        letter-spacing="15"
        :fill="d.accent"
        :opacity="d.outro.album"
      >FROM THE ALBUM INTO THE WILD</text>
      <g class="film-slate" font-size="21" :fill="d.fg" opacity="0.72">
        <text
          v-for="credit in d.outro.credits"
          :key="credit.role"
          x="80"
          :y="credit.y"
          :opacity="credit.opacity"
        >{{ credit.role }} — {{ credit.name }}</text>
      </g>
    </g>

    <!--
      One circle, blended by difference and sized off the live audio, painted
      over the type so everything it crosses inverts. This is how the lettering
      reacts to the music without a single letter being animated — and it has to
      be over the text, because difference blends against what is underneath.
    -->
    <g v-if="d.blob.r > 0" style="mix-blend-mode: difference">
      <circle :cx="d.blob.x" :cy="d.blob.y" :r="d.blob.r" :fill="d.fg" :opacity="d.blob.o" />
    </g>

    <!-- Bars thrown in from the edge on a section change. -->
    <rect
      v-if="d.wipe > 0"
      :x="-1600 + 1600 * d.wipe"
      y="0"
      width="1600"
      height="900"
      :fill="d.accent"
      :opacity="0.92"
    />

    <!-- ── Slate ──────────────────────────────────────────────────── -->
    <g v-if="d.slate > 0" class="film-slate" :fill="d.fg" font-size="18" letter-spacing="4" :opacity="d.slate">
      <text x="80" y="58">ANDALUSIA</text>
      <text x="1520" y="58" text-anchor="end">{{ d.clock }}</text>
      <text x="80" y="856">HAVRE DE GRACE / INTO THE WILD</text>
      <text x="1520" y="856" text-anchor="end">{{ d.sectionLabel }}</text>
    </g>

    <!-- In-frame progress: a film should say how much of it is left. -->
    <g>
      <rect x="0" y="894" width="1600" height="6" :fill="d.fg" opacity="0.12" />
      <rect x="0" y="894" :width="1600 * progress" height="6" :fill="d.accent" opacity="0.9" />
    </g>

    <!-- Two frames of inverted frame on a hit. You feel it, you don't see it. -->
    <rect
      v-if="d.flash > 0"
      width="1600"
      height="900"
      fill="#ffffff"
      :opacity="d.flash"
      style="mix-blend-mode: difference"
    />
  </svg>
</template>

<script setup lang="ts">
/*
 * "Andalusia" — the whole song, as one SVG.
 *
 * Every frame is a pure function of the song's clock: `t` in, one frame out, no
 * animation state anywhere. Nothing to fall out of step with the audio, nothing
 * to leave half-transitioned when the film is scrubbed, and a two-minute-fifty
 * video that weighs what its markup weighs.
 *
 * WHAT DECIDES WHAT
 *   - app/config/andalusiaScore.ts is the cut. Words, with the time each one is
 *     sung, measured off the master; and the eleven sections, which are what
 *     gives the film its shape.
 *   - app/utils/typeLayout.ts sets each line as type. No line is hand-laid: a
 *     line breaks at its own commas, wraps to a character budget, and every row
 *     is sized against its own length. Which is why a lyric can be retimed, or
 *     a word fixed, without anyone touching a layout.
 *   - This file is the director. It owns the eleven looks, the four sections
 *     that are not lyric at all (title sequence, instrumental, the oh-ohs, end
 *     card), and the handful of moments that earn a one-off — the glyphs of
 *     "BREAKING" coming apart, the place names in boxes.
 *
 * The rule the whole thing is built on: a cut lands on a word, never on a
 * metronome. The tempo is in the score for the record, but nothing here reads
 * it — because over two and a half minutes of a band playing without a click,
 * a grid drifts and the words do not.
 */
import { LINES, SECTIONS, lineAt, sectionAt } from '~/config/andalusiaScore'
import type { SectionKind } from '~/config/andalusiaScore'
import { layoutLine, rowReveal, rowWordSpan } from '~/utils/typeLayout'
import type { LayoutRow } from '~/utils/typeLayout'
import { clamp01, easeOut, easeOutBack, fall, lerp, ramp, round, wave } from '~/utils/clipTiming'
import lockupRaw from '~~/public/logos/suite/a4-lockup-stacked.svg?raw'

const props = defineProps<{
  /** Seconds into the song. */
  t: number
  level: number
  bass: number
  treble: number
  progress: number
}>()

const t = computed(() => props.t)
const progress = computed(() => props.progress)

const INK = '#0d0d0c'
const BONE = '#f2ede3'
const RED = '#d8382b'

const introArtist = 'HAVRE DE GRACE'

/*
 * The splash screen's mark, as markup rather than as an <image>.
 *
 * public/logos/suite is the source of truth for the brand and BrandMark already
 * draws from it; this does the same thing for an SVG context. The width and
 * height are added because a nested <svg> with neither fills its whole viewport
 * — here 1600x900 — instead of the box the transform puts it in, and the baked
 * `color` is stripped so the mark inherits the film's foreground and can come up
 * bone on ink. Title and role are dropped: the frame already has its label.
 */
const LOCKUP = lockupRaw
  .replace('<svg ', '<svg width="918" height="619.07" ')
  .replace(/ color="[^"]*"/, '')
  .replace(/ role="img"/, '')
  .replace(/ aria-label="[^"]*"/, '')
  .replace(/<title>.*?<\/title>/, '')

const CREDITS = [
  { role: 'WORDS, VOICE, GUITAR', name: 'STEFAN AUVACHE BRADLEY' },
  { role: 'TRUMPET', name: 'SAM "BLAZE" MCKAGUE' },
  { role: 'PIANO', name: 'JOSH ANDROMIDAS' },
  { role: 'MELLOPHONE, MIX, PRODUCTION', name: 'PARKER HOLT' },
]

interface Look {
  bg: string
  fg: string
  accent: string
  /** Swapped in on every other line of the section, so each line is a cut. */
  flip?: { bg: string, fg: string, accent: string }
  /** Light type, for the section where the arrangement drops away. */
  weight?: number
  grid?: boolean
  layout?: Parameters<typeof layoutLine>[1]
}

/*
 * The ten looks. This table is the storyboard: two verses that invert each
 * other, three choruses that cut between red and ink on every line, a verse of
 * place names set like a departure board, and a fourth verse that drops to
 * almost nothing because the arrangement does.
 */
const LOOKS: Record<string, Look> = {
  'intro': { bg: INK, fg: BONE, accent: RED, grid: true },
  'verse-1': {
    bg: INK,
    fg: BONE,
    accent: RED,
    grid: true,
    layout: { x: 80, maxWidth: 1440, budget: 14, bodySize: 186, landingSize: 300, top: 150, bottom: 800 },
  },
  'verse-2': {
    // Inverted, and pulled in off the left edge: the same verse form, read the
    // other way round, so twenty seconds of it does not look like the last
    // twenty seconds of it.
    bg: BONE,
    fg: INK,
    accent: RED,
    grid: true,
    layout: { x: 360, maxWidth: 1160, budget: 13, bodySize: 170, landingSize: 260, top: 150, bottom: 800 },
  },
  'chorus-1': {
    bg: RED,
    fg: BONE,
    accent: INK,
    flip: { bg: INK, fg: BONE, accent: RED },
    layout: { x: 80, maxWidth: 1440, budget: 12, bodySize: 200, landingSize: 320, top: 140, bottom: 810 },
  },
  'verse-3': {
    // The place names. Bone stock, ink type, and the landing word in a box.
    bg: BONE,
    fg: INK,
    accent: RED,
    grid: true,
    layout: { x: 80, maxWidth: 1440, budget: 11, bodySize: 190, landingSize: 300, top: 150, bottom: 790 },
  },
  'chorus-2': {
    bg: INK,
    fg: RED,
    accent: BONE,
    flip: { bg: RED, fg: BONE, accent: INK },
    layout: { x: 80, maxWidth: 1440, budget: 12, bodySize: 200, landingSize: 320, top: 140, bottom: 810 },
  },
  'ohs': { bg: RED, fg: BONE, accent: INK },
  'verse-4': {
    // The arrangement drops to a guitar and a voice here, so the type does too:
    // small, centred, set at its natural width with air around it. The loudest
    // thing a film like this can do is stop shouting for twenty seconds.
    bg: '#07070a',
    fg: BONE,
    accent: RED,
    weight: 400,
    layout: { x: 800, maxWidth: 1180, natural: true, budget: 26, bodySize: 82, landingSize: 118, top: 300, bottom: 640, leading: 0.7 },
  },
  'chorus-3': {
    bg: RED,
    fg: BONE,
    accent: INK,
    flip: { bg: INK, fg: BONE, accent: RED },
    layout: { x: 80, maxWidth: 1440, budget: 11, bodySize: 210, landingSize: 340, top: 130, bottom: 820 },
  },
  'outro': { bg: INK, fg: BONE, accent: RED },
}

const lookOf = (id: string): Look => LOOKS[id] ?? LOOKS['verse-1']!

/**
 * Every line, set once at module scope.
 *
 * Thirty-one layouts, each a few dozen numbers, computed when the file loads
 * rather than sixty times a second — the per-frame work is then only reading
 * the clock against them.
 */
const LAYOUTS = LINES.map((line) => layoutLine(line, lookOf(line.section).layout))

/** Which line of its section a line is: what the per-line colour flip keys on. */
const LINE_IN_SECTION = new Map<number, number>()
for (const section of SECTIONS) {
  LINES.filter((line) => line.section === section.id)
    .forEach((line, index) => LINE_IN_SECTION.set(line.index, index))
}

/** The place names get the accent colour and a box; this is that verse's point. */
const BOXED_SECTIONS = new Set(['verse-3'])

/** The one line that comes apart: "…my boots are breaking through". */
const SHATTER_LINE = LINES.findIndex((line) => line.text.includes('breaking through'))

const OH_LINES = LINES.filter((line) => line.section === 'ohs')

/** The director: one pass over the clock per frame, for the whole frame. */
const d = computed(() => {
  const now = t.value
  const section = sectionAt(now)
  const look = lookOf(section.id)
  const line = lineAt(now)

  /*
   * A line belongs to a section, so a line that has stopped being sung leaves
   * with its section rather than lingering into the next one. This is what
   * keeps the last line of a chorus off the screen during the instrumental.
   */
  const sung = section.kind === 'verse' || section.kind === 'chorus'
    || section.kind === 'places' || section.kind === 'quiet'
  const active = sung && line && line.section === section.id ? line : null
  const nextLine = active ? LINES[active.index + 1] : undefined
  const clearAt = Math.min(nextLine?.start ?? section.to, section.to)

  const flipped = look.flip && active && (LINE_IN_SECTION.get(active.index) ?? 0) % 2 === 1
  const palette = flipped ? look.flip! : look
  const bg = palette.bg
  const fg = palette.fg
  const accent = palette.accent

  const layout = active ? LAYOUTS[active.index]! : null
  const rows = (layout?.rows ?? []).map((row: LayoutRow, index: number) => {
    const reveal = rowReveal(row, now)
    // Body rows give way once the line has been sung; the landing row holds
    // until the next line cuts it off, which is what makes every line in this
    // film end on one word held large.
    const opacity = row.landing
      ? 1
      : clamp01(0.35 + 0.65 * fall(now, active!.end + 1.2, active!.end + 1.6))
    const settle = easeOutBack(ramp(now, row.at, row.at + 0.2), 2.1)
    const lift = (1 - settle) * 24

    // The word being sung, coloured for exactly as long as it is being sung.
    const span = rowWordSpan(row, now)

    let dy = '0'
    let rotate = '0'
    if (active!.index === SHATTER_LINE && row.landing) {
      // "breaking through": the letters of the landing row fall out of line,
      // further the further along the word they are. Per-glyph `dy`/`rotate`
      // lists on one <text> — no splitting into eight elements.
      const drop = easeOut(ramp(now, row.at + 0.18, row.at + 1.1))
      if (drop > 0) {
        const offsets: number[] = []
        const angles: number[] = []
        for (let index = 0; index < row.text.length; index++) {
          const share = index / Math.max(row.text.length - 1, 1)
          offsets.push(round(drop * share * 84, 1))
          angles.push(round(drop * share * 22 * (index % 2 === 0 ? 1 : -1), 1))
        }
        dy = offsets.join(' ')
        rotate = angles.join(' ')
      }
    }

    return {
      ...row,
      reveal: round(reveal, 4),
      opacity: round(opacity * clamp01(ramp(now, row.at - 0.05, row.at)), 3),
      transform: `translate(0 ${round(lift, 1)})`,
      hot: span ? 1 : 0,
      hotFrom: round(span?.from ?? 0, 4),
      hotTo: round(span?.to ?? 0, 4),
      dy,
      rotate,
      boxed: BOXED_SECTIONS.has(section.id) && row.landing,
    }
  })
  // Rows whose line has been cut are simply not drawn: a cut, not a fade.
  const visibleRows = now < clearAt ? rows : []

  /* ── The title sequence ───────────────────────────────────────── */
  const introTitle = ramp(now, 5.4, 5.45) * fall(now, 15.0, 15.2)
  const intro = {
    rule: easeOut(ramp(now, 1.2, 2.6)),
    ruleOpacity: round(fall(now, 5.2, 5.4), 3),
    artist: round(ramp(now, 2.7, 2.8) * fall(now, 5.2, 5.35), 3),
    title: round(introTitle, 3),
    titleSize: round(lerp(210, 250, easeOut(ramp(now, 5.4, 14))), 1),
    titleY: round(lerp(520, 500, easeOut(ramp(now, 5.4, 14))), 1),
    album: round(ramp(now, 9.1, 9.2) * fall(now, 15.0, 15.2), 3),
    counts: [16.0, 16.85, 17.7].map((at, index) => ({
      key: index,
      x: 700 + index * 66,
      on: round(ramp(now, at, at + 0.03) * fall(now, at + 0.5, at + 0.62), 3),
    })),
  }

  /* ── Seventeen oh-ohs, counted out ───────────────────────────── */
  const ohCells = OH_LINES.flatMap((ohLine, groupIndex) =>
    ohLine.words.map((word, index) => {
      const lit = now >= word.t && now < word.t + 0.55
      const arrived = ramp(now, word.t, word.t + 0.06)
      const perRow = ohLine.words.length
      return {
        key: `${groupIndex}-${index}`,
        x: round(800 + (index - (perRow - 1) / 2) * (groupIndex === 0 ? 132 : 188), 1),
        y: groupIndex === 0 ? 350 : 640,
        size: round((groupIndex === 0 ? 66 : 92) * (0.7 + 0.3 * easeOutBack(arrived, 3)), 1),
        lit,
        opacity: round(arrived * (lit ? 1 : 0.42), 3),
      }
    }),
  )
  const ohHit = OH_LINES.flatMap((ohLine) => ohLine.words)
    .reduce((out, word) => Math.max(out, now >= word.t ? Math.exp(-(now - word.t) / 0.22) : 0), 0)
  const rings = [0, 1, 2].map((index) => ({
    key: index,
    r: round(150 + index * 140 + ohHit * 90, 1),
    w: round(2 + ohHit * 7, 1),
    o: round((0.5 - index * 0.13) * (0.4 + 0.6 * ohHit), 3),
  }))

  /* ── The end card: the mark first, then everything under it ───── */
  // Hung off the section's own start rather than a written-out time, so 2:46
  // stays 2:46 when the sync trim moves underneath it.
  const end = SECTIONS[SECTIONS.length - 1]!.from
  const outro = {
    mark: round(ramp(now, end, end + 0.12), 3),
    // Lands slightly over its own size and settles: the only piece of the film
    // that arrives by moving rather than by being cut to.
    pop: round(lerp(0.62, 1, easeOutBack(ramp(now, end, end + 0.6), 2.4)) * (300 / 619.07), 4),
    title: round(ramp(now, end + 0.9, end + 1.05), 3),
    album: round(ramp(now, end + 1.2, end + 1.35), 3),
    credits: CREDITS.map((credit, index) => ({
      ...credit,
      y: 672 + index * 40,
      opacity: round(ramp(now, end + 1.5 + index * 0.35, end + 2.0 + index * 0.35), 3),
    })),
  }

  /* ── The frame's own reactions ────────────────────────────────── */
  /*
   * A full-frame inversion, once per section.
   *
   * It used to fire on every measured word as well, which is two hundred and
   * ninety-odd of them: at a word every third of a second the eye never gets
   * back to black between two of them, and what reads as a hit on one word
   * reads as a fault in the file across a whole verse. The film already marks
   * every word — the accent colour runs along the line at the speed of the
   * voice — so the frame only has to mark the thing the line does not.
   */
  const sectionHit = Math.exp(-Math.max(0, now - section.from) / 0.12)

  return {
    section,
    sectionLabel: section.label.toUpperCase(),
    kind: section.kind as SectionKind,
    bg,
    fg,
    accent,
    light: (look.weight ?? 700) < 500,
    grid: look.grid ?? false,
    rows: visibleRows,
    boxedRows: visibleRows.filter((row) => row.boxed),
    line: active,
    intro,
    ohs: ohCells,
    rings,
    outro,
    rule: round(lerp(470, 452, wave(now, 0.06)), 1),
    blob: {
      x: round(lerp(420, 1180, easeOut(ramp(now, section.from, section.to))), 1),
      y: round(lerp(600, 320, wave(now, 0.05)), 1),
      // Off during the sections that are already all shape — and off when
      // nothing is playing, since a grey disc parked over the type is not a
      // poster frame anybody wants.
      r: section.kind === 'ohs' || section.kind === 'outro' || props.level < 0.03
        ? 0
        : round(70 + props.level * 130 + props.bass * 55, 1),
      o: round(0.45 + 0.35 * props.level, 3),
    },
    wipe: round(easeOut(ramp(now, section.from, section.from + 0.26)) < 1
      ? easeOut(ramp(now, section.from, section.from + 0.26))
      : 0, 3),
    flash: round(sectionHit * 0.45, 3),
    slate: section.kind === 'outro' ? 0 : 0.5,
    clock: `${Math.floor(now / 60)}:${(now % 60).toFixed(2).padStart(5, '0')}`,
  }
})

</script>

<style scoped>
/*
 * Jost is the site's typeface and is already on the page; declaring the family
 * AND the weight in CSS rather than as SVG attributes is what gets @nuxt/fonts
 * to serve them here — the scanner reads stylesheets, and a `font-weight`
 * attribute on a <text> element is invisible to it, so the browser would be
 * left synthesising a bold. Tracking is set per row by `textLength`, so none is
 * set in type.
 */
.film-type {
  font-family: "Jost", system-ui, sans-serif;
  font-weight: 700;
  font-variant-ligatures: none;
  text-transform: uppercase;
}

.film-type--light {
  font-weight: 400;
}

.film-slate {
  font-family: "Jost", system-ui, sans-serif;
  font-weight: 500;
}
</style>
