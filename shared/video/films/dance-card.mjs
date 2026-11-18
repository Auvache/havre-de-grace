/*
 * Ghost · The Dance Card — the film (v2, 2026-11-17).
 *
 * A dance-step diagram on bare paper, seen from above: nobody is drawn,
 * everybody is their feet. The user's brief (2026-11-10): "a dad not being
 * able to help his wife with the kids when they are screaming/upset …
 * Otherwise, the dad can have some good contact with the kids." Then
 * (2026-11-17): no room outline, no hopscotch; start with just the dad's
 * feet, then little feet run to him; the dad's feet red the whole time; no
 * tantrum marks, just sad feet from the kid, who then runs to mom.
 *
 * The father is the ghost and the one red thing: a man's shoe in red
 * outline, never filled in, thinner on every sung "ghost" and the nearer he
 * comes to the child when she is sad. The mother and the child are solid
 * ink. The whole story is in story.mjs; how feet are drawn and laid down is
 * engine.mjs. Notes: docs/visualizers/ghost.md.
 *
 * The floor is 1532 × 776, the plate's own size, so the last pull-back ends
 * with the whole floor exactly filling the plate. Nothing of the floor is
 * drawn. The camera is one transform (a print is an object: its line thins as
 * the camera pulls back).
 */
import { r, ramp, lerp } from '../kit.mjs'
import { COVER_SHEET, PAPER, paper, marginLyric, easeCamera } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'
import { buildStory, FLOOR } from './dance-card/story.mjs'
import { floorSvg, bt } from './dance-card/engine.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2

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
  [0, -330, 0, 1.9],
  [16.5, -330, 0, 1.9],
  [18.5, -250, 30, 2.05],
  [26.5, -250, 30, 2.05],
  [30.5, 60, 0, 1.25],
  [37, 60, 0, 1.25],
  [39.5, 330, 30, 2.0],
  [44.5, 330, 30, 2.0],
  [47, 420, 0, 1.9],
  [52, 420, 0, 1.9],
  [55, 340, 0, 1.55],
  [58, 340, 0, 1.55],
  [61, 150, 10, 1.55],
  [70.5, 150, 10, 1.55],
  [74, 80, 20, 1.5],
  [84.5, 80, 20, 1.5],
  [88, 0, 30, 1.3],
  [92, -180, 20, 1.4],
  [104, -180, 20, 1.4],
  [107.5, -40, 0, 1.3],
  [112, -40, 0, 1.3],
  [114.5, 30, -40, 1.7],
  [127.5, 30, -40, 1.7],
  [132, -200, 30, 1.35],
  [137, -200, 30, 1.35],
  [141, -100, 60, 1.2],
  [152, -60, 40, 1.2],
  [156, -200, 20, 1.5],
  [161, -200, 20, 1.5],
  [163, -340, 20, 1.75],
  [168, -340, 20, 1.75],
  [171.5, -150, 0, 1.6],
  [178, -80, 0, 1.6],
  [180.5, 0, 0, 1.55],
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
  // (Nothing of the floor is drawn; it still bounds the view, so the camera never shows bare paper past where anyone goes.)
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
    k = Math.min(k, lerp(1, 0.3, down * (1 - back)))
  }
  return k
}

/* ── The frame ────────────────────────────────────────────────────── */

/** The plate alone — what goes inside the sheet. */
export function danceCardPlate({ time, score }) {
  const story = storyFor(score)
  const cam = camAt(time)
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
<g transform="translate(${r(CX - cam.x * cam.s)} ${r(CY - cam.y * cam.s)}) scale(${r(cam.s, 4)})">${floorSvg(story, time, ghostAt(story, time))}</g>`
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
  { at: 12, label: 'Little feet', key: true },
  { at: 17.5, label: 'On his shoes' },
  { at: 28, label: 'Follow the leader' },
  { at: 38.5, label: 'Sad feet', key: true },
  { at: 41, label: 'To her mother' },
  { at: 47.5, label: 'He tries again' },
  { at: 55, label: 'Back to him' },
  { at: 61.5, label: 'Ring a ring o’ roses' },
  { at: 73, label: 'The worst night', key: true },
  { at: 90.3, label: 'Can’t pick you up' },
  { at: 99, label: 'Not allowed', key: true },
  { at: 105, label: 'Tag' },
  { at: 113, label: 'On his shoes again' },
  { at: 121.3, label: 'The most', key: true },
  { at: 129.8, label: 'On fire', key: true },
  { at: 137.4, label: 'Walking the floor' },
  { at: 154, label: 'Tag' },
  { at: 161.7, label: 'The dance' },
  { at: 169.3, label: 'All three' },
  { at: 177.8, label: 'The last time', key: true },
  { at: 180.8, label: 'All the way round', key: true },
]

/** For the docs and for checking: every scene and when it starts. */
export const danceCardScenes = (score) => storyFor(score).scenes
export { bt }
