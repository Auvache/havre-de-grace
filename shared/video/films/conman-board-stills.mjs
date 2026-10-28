/*
 * Stills of Conman's board (conman-board.mjs), for deciding the plan before
 * anything moves: the break tearing the old board down to black, my board
 * pasted up out of its scraps, my board torn in turn, and the ending.
 *
 * Shown on /music-videos/conman and written to a sheet by
 * tools/video-styles/conman-board-mock.mjs. The tears and the paste-up are
 * placed by hash here; the film's plan will place them on the words.
 *
 * Plain .mjs, pure — each still's `svg()` is a string for a 1600 × 900 viewBox.
 */
import { SECTION, FORMATS, boardSvg, sectionCam, WIDE_CAM, FULL_FRAME } from './conman-board.mjs'
import { paper, lyricMargin, COVER_SHEET } from '../album.mjs'
import { hash } from '../portraits.mjs'

const GONE = 99
const all = (n) => Array.from({ length: n }, (_, i) => ({ i, tau: GONE }))
const layoutOf = (c) => FORMATS[c.S.format].layouts[c.layout]

/** Share `p` of the cells torn: some gone whole, the rest part-torn; `fly` of them with a piece mid-tear. `small` keeps to nicks and corners. */
function torn(c, p, seed, fly = 0, small = false, whole = 0.5) {
  const L = layoutOf(c)
  const n = L.length
  const u = hash(c.col + seed, c.row + seed * 3, seed + c.S.at[0] * 7 + c.S.at[1])
  const v = hash(c.row + seed, c.col - seed, seed + 5)
  if (u < p * (small ? 0.06 : whole)) return all(n)
  const out = []
  if (u < p) {
    if (small) {
      const pick = L.findIndex((pc) => !pc.whole && pc.size <= 1)
      out.push({ i: pick < 0 ? 0 : pick, tau: GONE })
    }
    else for (let i = 0; i < 1 + Math.floor(v * (n - 2)); i++) out.push({ i, tau: GONE })
  }
  if (hash(c.col, c.row, seed + 9) < fly) {
    const i = small ? L.findIndex((pc, j) => !pc.whole && pc.size <= 1 && !out.some((o) => o.i === j)) : out.length
    if (i >= 0 && i < n - 1) out.push({ i, tau: 0.12 + 0.3 * v })
  }
  return out
}

/* ── States ─────────────────────────────────────────────────────────── */
const oldTorn = (p, fly, bare, whole) => ({ cell: (c) => ({ out: torn(c, p, 3, fly, false, whole) }), bare: (S) => hash(S.at[0], S.at[1], 77) < bare })
const empty = { cell: (c) => ({ out: all(layoutOf(c).length) }), bare: () => true }
/** My board part pasted: `printed` of the cells finished, `collaged` more with every scrap on, `started` more with a few. */
const building = (printed, collaged, started, seed = 1) => ({
  cell: (c) => {
    const u = hash(c.col * 3 + seed, c.row * 5 + seed, 13 + c.S.at[0])
    if (u < printed) return null
    if (u < printed + collaged) return { built: Infinity }
    if (u < printed + collaged + started) return { built: 1 + Math.floor(hash(c.row, c.col, 5) * 4) }
    return { built: 0 }
  },
})
const mineTorn = (p, fly, small) => ({ cell: (c) => ({ out: torn(c, p, 11, fly, small) }) })

/* ── Frames ─────────────────────────────────────────────────────────── */
const close = (uid, id, board, state, lyric, o = {}) => paper(COVER_SHEET) + boardSvg({ uid, cam: sectionCam(id), port: COVER_SHEET.plate, board, state, ...o }) + (lyric ? lyricMargin({ line: { text: lyric }, sheet: COVER_SHEET }) : '')
const wide = (uid, board, state, o = {}) => boardSvg({ uid, cam: WIDE_CAM, port: FULL_FRAME, board, state, ...o })

const L4 = [
  "Oh, I'm a conman, don't be fooled by the way I move",
  'Watch me split the ground and pierce the sky and find a groove',
  "Don't protect me from the damage in my wake",
  'I could handle all the eyes you know for goodness sake that I',
]
const C3 = ['No matter where I go, I never seem to stay', 'No matter what I do, I always sound the same', 'No matter where I go, I never seem to change', 'No matter what I do, I always sound the same']

export const BOARD_STILL_GROUPS = [
  ['break', 'The break: their board torn down to black'],
  ['mine', 'The last verse: my board, pasted up from their scraps'],
  ['sections', 'My board, section by section'],
  ['scraps', 'The scraps: full colour or knocked back'],
  ['torn', 'Being taken from: the last verse and chorus'],
  ['end', 'The ending'],
]

const S_ = (group, at, title, note, svg, big = false) => ({ group, at, title, note, svg, big })
export const BOARD_STILLS = [
  S_('break', '~150 s', 'The break, ten seconds in', 'Pulled right out, the outer frame gone. Their board is torn to shreds with nothing behind it: only black. The cork and the banknotes\' backing sheet come down with it.', (u) => wide(u, 'old', oldTorn(0.6, 0.12, 0.3)), true),
  S_('break', '~158 s', 'The break, nearly done', 'The last of it going.', (u) => wide(u, 'old', oldTorn(0.96, 0.1, 1, 0.9)), true),
  S_('break', '~162 – 165 s', 'Nothing left', 'No scraps, nothing: black for a moment, until the voice comes back.', (u) => wide(u, 'old', empty), true),

  S_('mine', '165.5 s', 'In on the first word', 'A fast zoom in from black onto the first section of a new board, and the scraps coming back: flying in and pasting down one or two at a time on the black.', (u) => close(u, 'A', 'mine', building(0, 0.06, 0.4), L4[0])),
  S_('mine', '~168 s', 'The sheets filling', 'Each sheet is pieced together from their scraps — a poster, a banknote, a ticket, turned and torn — and then printed over in red.', (u) => close(u, 'A', 'mine', building(0.25, 0.35, 0.3, 2), L4[0])),
  S_('mine', '~171 s', 'Done: me', 'My face on every sheet, and our name. Wherever my print leaves bare paper, the scraps show through, so the face is made of pieces of theirs.', (u) => close(u, 'A', 'mine', { cell: () => null }, L4[1])),

  ...['B', 'C', 'D', 'L', 'J', 'N', 'K', 'F'].map((id) => S_('sections', '', `${id} · ${SECTION[id].label}`, 'My version, whole.', (u) => close(u, id, 'mine', { cell: () => null }, ''))),

  S_('scraps', '', 'Scraps at full colour everywhere', 'The old board\'s colours at full strength wherever my print leaves paper. Loudest, and it says most plainly where it came from — but the words on a ticket or a stamp get lost in it.', (u) => close(u, 'A', 'mine', { cell: () => null }, '', { scraps: 'full' })),
  S_('scraps', '', 'Faces full, the rest knocked back', 'What every other still here uses: the faces pieced from full-colour scraps, the rest of each sheet\'s paper washed halfway back. The face is where the eye goes.', (u) => close(u, 'A', 'mine', { cell: () => null }, '', { scraps: 'mix' })),
  S_('scraps', '', 'Knocked back everywhere', 'Calmest: every scrap washed halfway to the paper, and the red leads.', (u) => close(u, 'A', 'mine', { cell: () => null }, '', { scraps: 'pale' })),
  S_('torn', '~178 s', 'The second half of the last verse', '"Don\'t protect me from the damage in my wake": the first small pieces come off my board, a nick and a corner at a time, to the black.', (u) => close(u, 'B', 'mine', mineTorn(0.2, 0.12, true), L4[2])),
  S_('torn', '~205 s', 'The last chorus', 'More, and bigger.', (u) => close(u, 'E', 'mine', mineTorn(0.35, 0.2), C3[1])),
  S_('torn', '~225 s', 'The last chorus, near the end', 'Harder still.', (u) => close(u, 'G', 'mine', mineTorn(0.6, 0.28), C3[3])),

  S_('end', '', 'My board, whole', 'For reference only — the film never shows it all untouched.', (u) => wide(u, 'mine', { cell: () => null }), true),
  S_('end', '~229.5 s', 'Pulling out', 'The outro: out to my whole board for the last three or four seconds, being torn at all over.', (u) => wide(u, 'mine', mineTorn(0.3, 0.16)), true),
  S_('end', '232.1 s', 'The last frame before the end card', 'The end card cuts in on the last hit, with about half of my board gone and none of it finished going.', (u) => wide(u, 'mine', mineTorn(0.5, 0.14)), true),
]

