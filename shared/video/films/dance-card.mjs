/*
 * Ghost · The Dance Card — the film (v1, 2026-11-10).
 *
 * A printed dance-step diagram, seen from above: a floor and the footprints
 * on it. The user's brief: "a dad not being able to help his wife with the
 * kids when they are screaming/upset (illustrated by stomps and tantrums).
 * Otherwise, the dad can have some good contact with the kids."
 *
 * The father is the ghost: a man's shoe in outline, ghost grey, never filled
 * in. The mother and the two children are solid ink. Red is the fire: a
 * child's prints go red and stamp on the beat when the tantrum starts, and
 * the nearer the father comes the worse it gets and the less of him there is.
 * When they are calm he dances with them, plays follow the leader, a ring,
 * hopscotch, tag. The whole story is in story.mjs; how feet are drawn and
 * laid down is engine.mjs. Notes: docs/visualizers/ghost.md.
 *
 * The floor is 1532 × 776, the plate's own size, so the last pull-back ends
 * with the whole floor exactly filling the plate. The camera is one transform
 * (a print is an object: its line thins as the camera pulls back).
 */
import { r, clamp01, ramp, lerp, easeInOut } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, SECOND_INK, paper, marginLyric, easeCamera } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'
import { buildStory, FLOOR, DOOR, COURT } from './dance-card/story.mjs'
import { floorSvg, bt } from './dance-card/engine.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2
const GREY = SECOND_INK.ghost

const stories = new WeakMap()
function storyFor(score) {
  let story = stories.get(score)
  if (!story) {
    story = buildStory(score)
    /*
     * The score's four sections run from block to block, so by the album's
     * rule a block's last line would sit in the margin through the whole
     * break after it (22 seconds of "The city burns and I'm a ghost"). For
     * the lyric only, each section ends a breath after its last sung word.
     */
    story.lyric = {
      ...score,
      sections: score.sections.map((sec) => {
        const last = score.lines.findLast((l) => l.section === sec.id)
        return last ? { ...sec, to: Math.min(sec.to, last.end + 1.1) } : sec
      }),
    }
    story.ghosts = score.lines.flatMap((l) => l.words.filter((w) => /ghost/i.test(w.text)).map((w) => w.t))
    stories.set(score, story)
  }
  return story
}

/* ── The camera ───────────────────────────────────────────────────── */

/*
 * Held views, with long eased glides between them (never a cut), and one even
 * pull-back at the end to the whole floor. [t, x, y, scale]: the floor point
 * at the middle of the plate, and how many times life size.
 */
const VIEWS = [
  [0, -245, 0, 2.2],
  [26.5, -245, 0, 2.2],
  [34, -90, -10, 1.25],
  [37.5, -90, -10, 1.25],
  [41, 199, 30, 1.35],
  [56.5, 199, 30, 1.35],
  [62, 180, 60, 1.6],
  [69.5, 180, 60, 1.6],
  [72.5, 128, 0, 1.2],
  [75.5, 128, 0, 1.2],
  [80, -60, 50, 1.45],
  [102.8, 60, 20, 1.45],
  [106.2, 255, -30, 1.5],
  [137.6, 255, -30, 1.5],
  [146, -40, 40, 1.35],
  [152, -110, 0, 1.3],
  [156, -153, 0, 1.25],
  [160.5, -153, 0, 1.25],
  [163.5, -250, 0, 1.6],
  [168.5, -250, 0, 1.6],
  [173, -60, 10, 1.75],
  [181, -40, 14, 1.75],
  [190.9, 0, 0, 1],
]

function camAt(time) {
  let a = VIEWS[0]
  let b = VIEWS[0]
  for (let i = 0; i < VIEWS.length - 1; i++) {
    if (time >= VIEWS[i][0]) { a = VIEWS[i]; b = VIEWS[i + 1] }
  }
  if (time >= VIEWS.at(-1)[0]) a = b = VIEWS.at(-1)
  // The last move is the pull-back: even in scale (the same ratio every second), no ease.
  const last = b === VIEWS.at(-1) && a !== b
  const u0 = ramp(time, a[0], b[0])
  const u = last ? u0 : easeCamera(u0)
  const s = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u))
  // Pan in step with the zoom, so the floor point under the middle moves evenly on the sheet.
  const w = a[3] === b[3] ? u : (1 / a[3] - 1 / s) / (1 / a[3] - 1 / b[3])
  let x = lerp(a[1], b[1], w)
  let y = lerp(a[2], b[2], w)
  // Never off the floor.
  const mx = Math.max(0, FLOOR.w / 2 - PW / 2 / s)
  const my = Math.max(0, FLOOR.h / 2 - PH / 2 / s)
  x = Math.max(-mx, Math.min(mx, x))
  y = Math.max(-my, Math.min(my, y))
  return { x, y, s }
}

/* ── The floor ────────────────────────────────────────────────────── */

/* The printed sheet's own furniture: the floor's edge, the door she comes in by, and a faint register of dots. */
const FURNITURE = (() => {
  const hw = FLOOR.w / 2 - FLOOR.inset
  const hh = FLOOR.h / 2 - FLOOR.inset
  let dots = ''
  for (let x = -672; x <= 672; x += 96) {
    for (let y = -288; y <= 288; y += 96) dots += `M${x} ${y}h0`
  }
  const edge = `M${hw} ${DOOR.y0}V${-hh}H${-hw}V${hh}H${hw}V${DOOR.y1}`
  const leaf = DOOR.y1 - DOOR.y0
  // The door, open into the room, and its swing.
  const door = `M${hw} ${DOOR.y1}L${hw - leaf * 0.94} ${DOOR.y1 - leaf * 0.34}` + `M${hw - leaf * 0.94} ${DOOR.y1 - leaf * 0.34}A${leaf} ${leaf} 0 0 1 ${hw} ${DOOR.y0}`
  return `<path d="${dots}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" opacity="0.2"/>` +
    `<path d="${edge}" fill="none" stroke="${INK}" stroke-width="2.2"/>` +
    `<path d="${edge}" fill="none" stroke="${INK}" stroke-width="0.9" transform="scale(${r(1 - 14 / FLOOR.w, 4)} ${r(1 - 14 / FLOOR.h, 4)})" opacity="0.6"/>` +
    `<path d="${door}" fill="none" stroke="${INK}" stroke-width="1.2" opacity="0.7" stroke-dasharray="1 0"/>`
})()

/* The hopscotch court, chalked on in order. */
const COURT_LINES = (() => {
  const { x0, yc, q } = COURT
  const sq = (i, dy) => `M${x0 + q * i} ${yc + dy - q / 2}h${q}v${q}h${-q}z`
  const cells = [[0, 0], [1, 0], [2, -q / 2], [2, q / 2], [3, 0], [4, -q / 2], [4, q / 2], [5, 0]]
  return cells.map(([i, dy], n) => ({ d: sq(i, dy), n: n + 1, x: x0 + q * (i + 0.5), y: yc + dy }))
})()

function courtSvg(time) {
  const k = ramp(time, ...COURT.drawn)
  if (k <= 0) return ''
  const n = COURT_LINES.length
  let out = ''
  let nums = ''
  COURT_LINES.forEach((c, i) => {
    const u = clamp01(k * n - i)
    if (u <= 0) return
    out += `<path d="${c.d}" pathLength="1"${u < 1 ? ` stroke-dasharray="1 1" stroke-dashoffset="${r(1 - easeInOut(u), 3)}"` : ''}/>`
    if (u >= 1) nums += `<text x="${c.x - COURT.q * 0.32}" y="${c.y - COURT.q * 0.24}">${c.n}</text>`
  })
  return `<g fill="none" stroke="${GREY}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" opacity="0.85">${out}</g>` +
    `<g fill="${GREY}" font-size="13" font-weight="600" text-anchor="middle" opacity="0.8">${nums}</g>`
}

/* ── How much of him there is ─────────────────────────────────────── */

/*
 * On every "ghost" the father thins: down over a quarter of a second before
 * the word, held under it, and back over the next two and a half seconds.
 * After the last one he does not come all the way back.
 */
function ghostAt(story, time) {
  let k = 1
  const last = story.ghosts.at(-1)
  for (const g of story.ghosts) {
    if (time < g - 0.3) continue
    const down = ramp(time, g - 0.3, g)
    const back = g === last ? 0.55 * ramp(time, g + 0.7, g + 1.9) : ramp(time, g + 0.9, g + 3.4)
    k = Math.min(k, lerp(1, 0.38, down * (1 - back)))
  }
  return k
}

/* ── The frame ────────────────────────────────────────────────────── */

/** The plate alone — what goes inside the sheet. */
export function danceCardPlate({ time, score }) {
  const story = storyFor(score)
  const cam = camAt(time)
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
<g transform="translate(${r(CX - cam.x * cam.s)} ${r(CY - cam.y * cam.s)}) scale(${r(cam.s, 4)})">${FURNITURE}${courtSvg(time)}${floorSvg(story, time, ghostAt(story, time))}</g>`
}

/** The film: the opening, then the album's cover sheet, the floor, the lyric in the margin. */
export function danceCardFrame({ time, score, lockup = '', uid = 'dance' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const story = storyFor(score)
  const sceneNow = story.scenes.findLast((s) => time >= s.at) ?? story.scenes[0]
  const clip = `${uid}-plate`
  return {
    label: inOpening(time) ? 'Opening' : sceneNow.name,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${danceCardPlate({ time, score })}</g>
${marginLyric({ now: time, score: story.lyric, uid, sheet: COVER_SHEET })}
${filmOpening({ time, uid, slug: 'ghost' })}`,
  }
}

/** The jump-to list on the page. What each is: docs/visualizers/ghost.md. */
export const DANCE_CARD_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 11, label: 'On his feet', key: true },
  { at: 29, label: 'Follow the leader' },
  { at: 38, label: 'The first fire', key: true },
  { at: 60, label: 'Ring a ring o’ roses' },
  { at: 70, label: 'The worst night', key: true },
  { at: 90, label: 'Can’t pick you up' },
  { at: 98, label: 'Not allowed', key: true },
  { at: 105, label: 'Hopscotch' },
  { at: 113, label: 'The dance lesson' },
  { at: 129, label: 'On fire', key: true },
  { at: 138, label: 'Walking the floor' },
  { at: 154, label: 'Tag' },
  { at: 161, label: 'The dance' },
  { at: 169, label: 'Toe to toe' },
  { at: 177, label: 'The last fire', key: true },
  { at: 181, label: 'All the way round', key: true },
]

/** For the docs and for checking: every scene and when it starts. */
export const danceCardScenes = (score) => storyFor(score).scenes
export { bt }
