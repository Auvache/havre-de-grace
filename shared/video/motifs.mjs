/*
 * The motif library — the pictures the words are about.
 *
 * The one thing the Andalusia cut was missing is that it never draws anything.
 * Every style in the suite answers that the same way: a line drawing keyed to
 * the noun in the line being sung, held behind the type at a few per cent of
 * the foreground so it is felt before it is read. This file is where those
 * drawings live, so a style module picks a motif by name rather than inventing
 * one, and so a film can key a motif to a lyric without anybody drawing again.
 *
 * Every motif is authored in its own 100x100 box, stroke-only, stroke-width in
 * local units — so scaling a motif scales its line weight with it, which is
 * what you want when the same drawing is a 40px bullet in one style and a
 * 1200px ghost bleeding off frame in another.
 *
 * `motif(name, { x, y, size, stroke, width, opacity, rotate })` returns the
 * wrapped markup. Nothing here fills; a style that wants a solid sets `fill`
 * on its own group.
 */

const P = {}

/* ── Things the song names ─────────────────────────────────────────── */

// "Walk until my boots are breaking through" / "boots are faded blue"
P.boot = `
  <path d="M28 8 L54 8 L54 44 L74 50 L86 66 L28 66 Z"/>
  <path d="M22 66 L92 66 L92 78 L22 78 Z"/>
  <path d="M28 20 H54 M28 30 H54 M28 40 H54"/>`

// "If I were king for just a day"
P.crown = `
  <path d="M18 66 L12 24 L34 44 L50 14 L66 44 L88 24 L82 66 Z"/>
  <path d="M16 66 H84 V80 H16 Z"/>
  <circle cx="12" cy="24" r="4"/><circle cx="50" cy="14" r="4"/><circle cx="88" cy="24" r="4"/>`

// "…stranded underneath a churchyard"
P.church = `
  <path d="M50 4 V18 M44 10 H56"/>
  <path d="M34 46 L50 18 L66 46 Z"/>
  <path d="M30 46 H70 V90 H30 Z"/>
  <path d="M44 68 H56 V90"/>
  <circle cx="50" cy="58" r="5"/>
  <path d="M6 90 H94"/>`

// "I'd sit and watch the sailors in the cold"
P.sailboat = `
  <path d="M50 8 V68"/>
  <path d="M52 16 L80 66 H52 Z"/>
  <path d="M46 26 L22 66 H46 Z"/>
  <path d="M12 70 H88 L74 86 H26 Z"/>
  <path d="M4 94 q12 -6 24 0 t 24 0 t 24 0 t 24 0"/>`

// "…in the sun"
P.sun = `
  <circle cx="50" cy="50" r="21"/>
  <path d="M50 4 V18 M50 82 V96 M4 50 H18 M82 50 H96
           M17 17 L27 27 M73 73 L83 83 M83 17 L73 27 M27 73 L17 83"/>`

// "…or in the snow"
P.snowflake = `
  <path d="M50 6 V94 M12 28 L88 72 M88 28 L12 72"/>
  <path d="M50 20 L40 12 M50 20 L60 12 M50 80 L40 88 M50 80 L60 88"/>
  <path d="M25 35 L14 34 M25 35 L21 24 M75 65 L86 66 M75 65 L79 76"/>
  <path d="M75 35 L86 34 M75 35 L79 24 M25 65 L14 66 M25 65 L21 76"/>`

// "I'd travel round the world" / Bangkok, Budapest, Baton Rouge
P.plane = `
  <path d="M50 4 q7 0 7 15 v20 l33 19 v11 l-33 -9 v18 l11 9 v7 l-18 -5 l-18 5 v-7 l11 -9 v-18 l-33 9 v-11 l33 -19 v-20 q0 -15 7 -15 z"/>`

// "I'd brush up on my Spanish"
P.guitar = `
  <path d="M50 32 c15 0 21 10 21 19 c0 6 -4 10 -4 16 c0 11 -8 19 -17 19 s-17 -8 -17 -19 c0 -6 -4 -10 -4 -16 c0 -9 6 -19 21 -19 z"/>
  <path d="M44 6 H56 V32 H44 Z"/>
  <path d="M41 2 H59 V8 H41 Z"/>
  <circle cx="50" cy="57" r="7"/>
  <path d="M40 76 H60"/>
  <path d="M46 8 V32 M50 8 V32 M54 8 V32"/>`

// "…with all the pretty girls" — a flamenco fan, opened
P.fan = `
  <path d="M50 88 L14 40 A45 45 0 0 1 86 40 Z"/>
  <path d="M50 88 L26 30 M50 88 L38 22 M50 88 V20 M50 88 L62 22 M50 88 L74 30"/>
  <path d="M50 88 L22 50 A35 35 0 0 1 78 50 Z"/>`

P.mountain = `
  <path d="M2 80 L28 30 L46 56 L62 34 L98 80 Z"/>
  <path d="M20 40 L28 30 L36 40 M55 45 L62 34 L69 45"/>
  <path d="M2 80 H98"/>`

// Andalusia itself: an orange branch
P.orange = `
  <path d="M50 96 V44 q0 -12 -14 -18 M50 62 q0 -12 16 -18"/>
  <circle cx="34" cy="22" r="11"/><circle cx="68" cy="40" r="9"/><circle cx="58" cy="16" r="8"/>
  <path d="M34 11 q4 -7 10 -6 M68 31 q4 -6 9 -5"/>
  <path d="M24 52 q -14 -8 -16 -22 q 16 2 20 18 Z"/>
  <path d="M74 66 q 14 -8 16 -22 q -16 2 -20 18 Z"/>`

P.compass = `
  <circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="31"/>
  <path d="M50 6 L57 50 L50 94 L43 50 Z"/>
  <path d="M6 50 L50 43 L94 50 L50 57 Z"/>
  <path d="M22 22 L50 50 M78 78 L50 50 M78 22 L50 50 M22 78 L50 50"/>`

P.globe = `
  <circle cx="50" cy="50" r="42"/>
  <path d="M50 8 a30 42 0 0 1 0 84 a30 42 0 0 1 0 -84"/>
  <path d="M50 8 V92"/>
  <path d="M8 50 H92 M15 29 H85 M15 71 H85"/>`

P.suitcase = `
  <rect x="12" y="30" width="76" height="52" rx="6"/>
  <path d="M38 30 V22 a5 5 0 0 1 5 -5 h14 a5 5 0 0 1 5 5 v8"/>
  <path d="M12 46 H88 M12 66 H88"/>
  <path d="M24 82 V90 M76 82 V90"/>`

// "The only one I want, my love, is you"
P.heart = `
  <path d="M50 88 C18 64 8 47 8 34 A21 21 0 0 1 50 27 A21 21 0 0 1 92 34 C92 47 82 64 50 88 Z"/>`

// "I'd never get to watch you growing old"
P.hourglass = `
  <path d="M22 12 H78 L53 50 L78 88 H22 L47 50 Z"/>
  <path d="M16 12 H84 M16 88 H84"/>
  <path d="M40 74 q10 -10 20 0 Z"/>`

// The walker, which is the whole song: someone leaving.
P.walker = `
  <circle cx="52" cy="14" r="9"/>
  <path d="M52 23 V54"/>
  <path d="M52 30 L34 42 M52 32 L72 26"/>
  <path d="M52 54 L38 88 M52 54 L68 84"/>
  <path d="M34 88 H44 M64 84 H74"/>`

P.birds = `
  <path d="M6 34 q12 -14 22 0 q10 -14 22 0"/>
  <path d="M48 62 q9 -11 17 0 q8 -11 17 0"/>
  <path d="M34 82 q7 -8 13 0 q6 -8 13 0"/>`

P.wave = `
  <path d="M0 34 q14 -12 28 0 t 28 0 t 28 0 t 28 0"/>
  <path d="M0 54 q14 -12 28 0 t 28 0 t 28 0 t 28 0"/>
  <path d="M0 74 q14 -12 28 0 t 28 0 t 28 0 t 28 0"/>`

P.clock = `
  <circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="3"/>
  <path d="M50 50 V22 M50 50 L70 62"/>
  <path d="M50 10 V18 M50 82 V90 M10 50 H18 M82 50 H90"/>`

P.key = `
  <circle cx="24" cy="50" r="16"/><circle cx="24" cy="50" r="6"/>
  <path d="M40 50 H92"/>
  <path d="M78 50 V66 M88 50 V62"/>`

P.door = `
  <path d="M22 92 V26 a28 28 0 0 1 56 0 V92 Z"/>
  <circle cx="66" cy="60" r="4"/>
  <path d="M50 92 V26"/>
  <path d="M6 92 H94"/>`

/* ── Into the Wild ────────────────────────────────────────────────────
 *
 * The nouns of the second song. Same rules as the rest: a 100-unit box,
 * stroke only, nothing that fills. INTO_THE_WILD_CUES in ./cues.mjs says which
 * line wants which.
 */

// "So I'm running into the wild" — the walker's other gait, leaning into it.
P.runner = `
  <circle cx="63" cy="13" r="8"/>
  <path d="M59 22 L49 52"/>
  <path d="M57 28 L70 40 L80 32"/>
  <path d="M57 28 L43 38 L34 30"/>
  <path d="M49 52 L66 62 L62 84 L70 86"/>
  <path d="M49 52 L38 72 L20 68"/>`

// "The roar of a crowd center stage"
P.crowd = `
  <circle cx="23" cy="44" r="5"/><circle cx="50" cy="42" r="5"/><circle cx="77" cy="44" r="5"/>
  <path d="M14 62 q9 -12 18 0 M41 60 q9 -12 18 0 M68 62 q9 -12 18 0"/>
  <circle cx="12" cy="68" r="7"/><circle cx="37" cy="66" r="7"/><circle cx="63" cy="68" r="7"/><circle cx="88" cy="66" r="7"/>
  <path d="M0 94 q12 -20 24 0 M25 92 q12 -20 24 0 M51 94 q12 -20 24 0 M76 92 q12 -20 24 0"/>
  <path d="M31 80 L24 44 M43 80 L50 44 M93 80 L98 52"/>`

// "…center stage" / "put them in songs that I sing"
P.microphone = `
  <rect x="40" y="6" width="20" height="30" rx="10"/>
  <path d="M34 26 q0 20 16 20 q16 0 16 -20"/>
  <path d="M50 46 V88 M34 94 L50 88 L66 94"/>
  <path d="M40 16 H60 M40 24 H60"/>`

// "The hush of a harbor so hollow"
P.lighthouse = `
  <path d="M40 88 L44 34 H56 L60 88 Z"/>
  <path d="M42 22 H58 V34 H42 Z"/>
  <path d="M39 22 L50 12 L61 22"/>
  <path d="M42.8 52 H57.2 M41.6 70 H58.4"/>
  <path d="M60 26 L94 16 M60 30 L94 40"/>
  <path d="M26 88 H74"/>
  <path d="M4 96 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0"/>`

// "I mean glaciers…"
P.glacier = `
  <path d="M4 78 L16 46 L28 52 L40 24 L54 40 L66 18 L80 44 L96 78 Z"/>
  <path d="M40 24 L44 50 L36 64 M66 18 L62 44 L70 60 M16 46 L22 66"/>
  <path d="M2 86 H98 M12 94 H40 M56 94 H88"/>`

// "…and gardens…"
P.flower = `
  <circle cx="50" cy="28" r="7"/>
  <path d="M50 21 q-10 -16 0 -18 q10 2 0 18 M57 28 q16 -10 18 0 q-2 10 -18 0 M50 35 q10 16 0 18 q-10 -2 0 -18 M43 28 q-16 10 -18 0 q2 -10 18 0"/>
  <path d="M50 53 V94"/>
  <path d="M50 76 q-20 -2 -24 -16 q18 0 24 16 Z M50 68 q18 -2 22 -14 q-16 0 -22 14 Z"/>`

// "…and grottos"
P.cave = `
  <path d="M2 90 L10 50 Q20 16 50 12 Q82 14 92 48 L98 90 Z"/>
  <path d="M24 90 V66 Q26 36 50 34 Q74 36 76 66 V90"/>
  <path d="M36 40 L40 52 L44 38 M56 38 L59 48 L63 40"/>
  <path d="M30 90 q6 -6 12 0 M56 90 q6 -6 12 0"/>`

// "The sound of the wind through the sage"
P.sprig = `
  <path d="M50 96 Q48 60 56 8"/>
  <path d="M49 80 q-20 -4 -24 -16 q18 0 24 16 Z M50 64 q18 -6 22 -18 q-18 2 -22 18 Z M51 50 q-18 -4 -22 -16 q16 0 22 16 Z M53 34 q16 -6 18 -18 q-16 2 -18 18 Z"/>`

// "Ebony, ivory, and bone"
P.bone = `
  <path d="M28 45 H72 C74 38 78 32 84 33 C91 34 92 44 86 50 C92 56 91 66 84 67 C78 68 74 62 72 55 H28 C26 62 22 68 16 67 C9 66 8 56 14 50 C8 44 9 34 16 33 C22 32 26 38 28 45 Z"/>`

// "…those treasures that aren't made of silver or gold" / "splendorous things"
P.gem = `
  <path d="M20 36 L34 18 H66 L80 36 L50 86 Z"/>
  <path d="M20 36 H80 M34 18 L42 36 L50 18 L58 36 L66 18 M42 36 L50 86 L58 36"/>`

// "Stone-cold these beauties are sleeping" — a cairn, which is a trail's own mark.
P.stone = `
  <path d="M22 90 Q20 74 40 72 H62 Q80 74 78 90 Z"/>
  <path d="M30 72 Q30 58 48 57 Q68 58 68 72"/>
  <path d="M38 57 Q38 44 50 43 Q62 44 61 57"/>
  <path d="M44 43 Q44 32 51 32 Q58 33 57 43"/>
  <path d="M8 90 H92"/>`

// "You know they hate sleeping alone"
P.moon = `
  <path d="M60 10 A40 40 0 1 0 90 60 A32 32 0 0 1 60 10 Z"/>
  <path d="M20 16 v10 M15 21 h10 M84 24 v6 M81 27 h6 M28 84 v6 M25 87 h6"/>`

// "…stories with meaning from the tales that my life's taught to me"
P.book = `
  <path d="M50 26 Q34 16 8 20 V80 Q34 76 50 86 Q66 76 92 80 V20 Q66 16 50 26 Z"/>
  <path d="M50 26 V86"/>
  <path d="M16 34 Q30 31 42 36 M16 46 Q30 43 42 48 M16 58 Q30 55 42 60 M58 36 Q70 31 84 34 M58 48 Q70 43 84 46"/>`

// "…into the wild"
P.pine = `
  <path d="M50 6 L30 36 H40 L24 60 H38 L18 86 H82 L62 60 H76 L60 36 H70 Z"/>
  <path d="M50 86 V96"/>`

export const MOTIF_NAMES = Object.keys(P)

/**
 * A motif's own markup, unplaced — for a style that needs to do something to
 * each stroke, such as drawing it on with `pathLength` (which needs no DOM
 * measurement, so it is allowed in a pure frame function).
 */
export const motifBody = (name) => {
  const body = P[name]
  if (!body) throw new Error(`No motif named "${name}". Have: ${MOTIF_NAMES.join(', ')}`)
  return body
}

/** One motif, placed. `size` is the width of its 100-unit box after scaling. */
export function motif(name, o = {}) {
  const body = P[name]
  if (!body) throw new Error(`No motif named "${name}". Have: ${MOTIF_NAMES.join(', ')}`)
  const { x = 0, y = 0, size = 100, stroke = '#000', width = 3, opacity = 1, rotate = 0, fill = 'none', cap = 'round' } = o
  const s = size / 100
  const spin = rotate ? ` rotate(${rotate} 50 50)` : ''
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(s, 4)})${spin}" fill="${fill}" stroke="${stroke}" stroke-width="${r(width, 2)}" stroke-linecap="${cap}" stroke-linejoin="round" opacity="${r(opacity, 3)}">${body}</g>`
}

/** Centred placement, because most ghosts are positioned by their middle. */
export function motifAt(name, cx, cy, size, o = {}) {
  return motif(name, { ...o, x: cx - size / 2, y: cy - size / 2, size })
}

export const r = (n, places = 1) => {
  const f = 10 ** places
  return Math.round(n * f) / f
}
