/*
 * Ghost · The Dance Card — the story, as a table of steps (2026-11-10).
 *
 * The user's brief: "a dad not being able to help his wife with the kids when
 * they are screaming/upset (illustrated by stomps and tantrums). Otherwise,
 * the dad can have some good contact with the kids."
 *
 * Four people, each only their footprints, on one floor seen from above:
 *
 *   dad  the ghost — a man's shoe in outline, ghost grey, never filled in
 *   mom  a woman's shoe (pointed sole, round heel), solid ink
 *   a    the elder child, a small rounded shoe, solid ink
 *   b    the younger, smaller still
 *
 * Red is the fire: a child's prints go red when the tantrum starts and stamp
 * on the spot, on the beat, with the stamp's shock thrown out round them. A
 * screaming child who has been picked up leaves no prints; the red is thrown
 * out from the mother's hip instead (`cries`).
 *
 * Times are beats of the record's click (`bt(k)`, 110 BPM) or measured words
 * (`W(line, word)`). Everything is laid out once per score; nothing here runs
 * per frame. Places are floor units, (0, 0) the middle, y down the sheet.
 */
import { rng, lerp, clamp01 } from '../../kit.mjs'
import { Person, BEAT, bt, walk, boxStep, onFeet, partner, inPrints, ring, sway, tantrum, arc, toward, fwd, rgt, thinNearFire } from './engine.mjs'

/** The floor: 1532 × 776 round (0, 0). The door is in the right-hand wall. */
export const FLOOR = { w: 1532, h: 776, inset: 16 }
export const DOOR = { x: 766 - 16, y0: 128, y1: 214 }
const DOORWAY = [DOOR.x + 6, (DOOR.y0 + DOOR.y1) / 2]

/** The hopscotch court chalked on the floor before the third block. Squares are `q` across, laid left to right. */
export const COURT = { x0: 300, yc: -160, q: 58, drawn: [102.4, 105.9] }

/** Piecewise-linear through [t, v] pairs. */
const keys = (pairs) => (t) => {
  if (t <= pairs[0][0]) return pairs[0][1]
  for (let i = 1; i < pairs.length; i++) {
    if (t <= pairs[i][0]) return lerp(pairs[i - 1][1], pairs[i][1], (t - pairs[i - 1][0]) / (pairs[i][0] - pairs[i - 1][0] || 1))
  }
  return pairs.at(-1)[1]
}

const clean = (s) => s.replace(/[^a-z]/gi, '').toLowerCase()

export function buildStory(score) {
  /** When `word` is sung in line `li` (the `nth` time it comes up in that line). */
  const W = (li, word, nth = 0) => {
    const hits = score.lines[li].words.filter((w) => clean(w.text) === word)
    if (!hits[nth]) throw new Error(`dance-card: no "${word}" in line ${li}`)
    return hits[nth].t
  }

  const dad = new Person('dad', 78, { stride: 62, life: 6 })
  const mom = new Person('mom', 64, { stride: 52, life: 5 })
  const a = new Person('a', 52, { stride: 42, life: 4.5 })
  const b = new Person('b', 42, { stride: 32, life: 4 })
  /** A carried child screaming: [{ who, t0, t1, S(t) }], turned into bursts at the mother's hip at the end. */
  const cries = []
  const scenes = []
  const scene = (at, name) => scenes.push({ at, name })

  /* ── 1 · The first dance (under the opening, to "Amplifiers just make a noise") ──
   *
   * He dances the box step with the elder child standing on his feet. The
   * younger bounces beside them, waiting; when the voice comes in it is his
   * turn, and the elder steps down and watches.
   */
  scene(0, 'A dance, on his feet')
  const BOX1 = [-330, 30]
  const first = dad.place(bt(12), BOX1[0], BOX1[1], 0, { toe: 0 })
  const box1 = boxStep(dad, { c: BOX1, th: 0, size: 74, k0: 14, halves: 8 })
  onFeet(a, [...first, ...box1.slice(0, 18)])
  // The younger one: a two-footed bounce on every other beat, facing them, a little nearer each time.
  for (let k = 12; k <= 34; k += 2) b.place(bt(k), -70 - (k - 12) * 4.6 + (k % 4 ? 4 : -4), 36, 270, { pop: 1, life: 0.8 })
  // The swap, as the voice comes in: she steps down to the left, he runs in and climbs on.
  a.step(bt(37.4), -418, 46, 90)
  a.close(bt(37.9))
  walk(b, [[-296, 40]], { t0: bt(36), per: BEAT / 2, n: 3, close: false, print: { life: 1.2 } })
  onFeet(b, [...box1.slice(16, 18).map((s) => ({ ...s, t: bt(37.6) })), ...box1.slice(18)])
  for (let k = 40; k <= 44; k += 2) a.place(bt(k), -418 + (k % 4 ? 3 : -3), 46, 90, { pop: 1, life: 0.8 })
  // The dance ends on "noise"; he steps down.
  b.step(bt(47), -258, 108, 330)
  b.close(bt(47.5))

  /* ── 2 · Follow the leader ("When I write songs, it's not by choice") ──
   *
   * He turns and is standing ready a second before the line; on "When" he
   * sets off round the floor, and they step into his prints behind him, the
   * elder three beats back, the younger six.
   */
  scene(bt(49), 'Follow the leader')
  dad.step(bt(52), BOX1[0], BOX1[1], 40)
  dad.close(bt(52.5))
  const lead = walk(dad, [[-200, -120], [60, -170], [300, -100], [390, 60], [250, 170], [60, 150]], { t0: bt(54), n: 16, curve: true })
  a.step(bt(55), -356, 30, 60)
  inPrints(a, lead.slice(0, 14), 3 * BEAT)
  inPrints(b, lead.slice(0, 11), 6 * BEAT)
  a.close(bt(71))

  /* ── 3 · The first fire ("The city burns and I'm a ghost", twice) ──
   *
   * On "burns" the younger one, last in the line, stops and stamps. He turns
   * back and goes to him, thinner with every step, and the nearer he comes
   * the worse it gets. She comes in at the door and across the floor, and
   * picks the child up. On the second "burns" the elder starts.
   */
  scene(W(2, 'burns') - 0.6, 'The first fire')
  const B1 = [b.x, b.y]
  const burns1 = W(2, 'burns')
  const lift1 = bt(78)
  tantrum(b, { at: B1, th: b.th, t0: burns1, t1: lift1, seed: 3, I: keys([[burns1, 0.7], [bt(72), 0.8], [bt(76), 1.45], [bt(78), 1.1]]) })
  // He turns on the spot, then goes back to him: five steps, each fainter.
  dad.step(bt(71), dad.x, dad.y, toward([dad.x, dad.y], B1))
  walk(dad, [[150, 108], B1], { t0: bt(72), n: 5, stop: 108, close: false, print: { arrow: true } })
  // She comes in at the door.
  mom.x = DOORWAY[0]
  mom.y = DOORWAY[1]
  walk(mom, [B1], { t0: bt(73), per: BEAT / 2, n: 8, stop: 46 })
  b.liftAll(lift1, 0.35)
  cries.push({ t0: lift1 + 0.2, t1: bt(101), S: keys([[lift1, 1.1], [bt(86), 0.75], [bt(92), 0.7], [bt(101), 0.3]]) })
  // He backs away, still facing them.
  const facingB = toward([dad.x, dad.y], B1)
  walk(dad, [[196, 96]], { t0: bt(78), n: 2, face: facingB })
  sway(mom, { k0: 79, k1: 89, every: 1, amp: 16 })

  // The elder, on the second "burns".
  const A1 = [a.x, a.y]
  const burns2 = W(3, 'burns')
  // A step toward her; it gets worse; three steps back, as far as he can go.
  const facingA = toward([dad.x, dad.y], A1)
  dad.step(bt(89), lerp(dad.x, A1[0], 0.42), lerp(dad.y, A1[1], 0.42), facingA, { arrow: true })
  const away = fwd(facingA + 180)
  walk(dad, [[dad.x + away[0] * 150 - 20, dad.y + away[1] * 150]], { t0: bt(90), n: 3, face: facingA })
  // She crosses to the elder with the younger on her hip.
  walk(mom, [A1], { t0: bt(89.5), per: BEAT / 2, n: 5, stop: 56 })
  const MOM1 = [mom.x, mom.y]
  // The elder stamps where she stands, then at her mother's side, and cools.
  const CLING1 = [lerp(MOM1[0], A1[0], 0.82), lerp(MOM1[1], A1[1], 0.82)]
  const calm1 = bt(104)
  tantrum(a, {
    at: (t) => { const u = clamp01((t - bt(92)) / BEAT); return [lerp(A1[0], CLING1[0], u), lerp(A1[1], CLING1[1], u)] },
    th: a.th, t0: burns2, t1: calm1, seed: 5,
    I: keys([[burns2, 0.8], [bt(89), 1.0], [bt(90), 1.4], [bt(92), 1.0], [bt(97), 0.7], [bt(100), 0.45], [calm1, 0.2]]),
  })
  a.place(calm1, CLING1[0], CLING1[1], toward(CLING1, MOM1), { gap: BEAT / 2 })
  mom.th = toward(MOM1, CLING1) + 30
  sway(mom, { k0: 93, k1: 103, every: 1, amp: 16 })

  /* ── 4 · The long gap: she puts him down and goes; ring a ring o' roses ── */
  scene(bt(103), 'Quiet again')
  b.place(bt(103), MOM1[0] + 6, MOM1[1] - 52, 200, { gap: 0.1 })
  walk(mom, [[600, 120], DOORWAY], { t0: bt(105), n: 10, close: false, curve: true })
  mom.liftAll(bt(115), 0.9)
  // The ring: three on one circle. It turns sixty degrees more than a whole turn.
  const RC = [dad.x + 105, dad.y]
  const ringAt = (phi) => [RC[0] + 105 * Math.cos((phi * Math.PI) / 180), RC[1] + 105 * Math.sin((phi * Math.PI) / 180)]
  walk(a, [ringAt(300)], { t0: bt(107), n: 4 })
  walk(b, [ringAt(60)], { t0: bt(107), per: BEAT / 2, n: 7 })
  dad.step(bt(111), ringAt(180)[0], ringAt(180)[1], 90)
  dad.close(bt(111.5))
  a.step(bt(112), ringAt(300)[0], ringAt(300)[1], toward(ringAt(300), RC))
  a.close(bt(112.5))
  b.step(bt(112), ringAt(60)[0], ringAt(60)[1], toward(ringAt(60), RC))
  b.close(bt(112.5))
  scene(bt(113.5), 'Ring a ring o’ roses')
  ring([dad, a, b], { c: RC, R: 105, k0: 114, beats: 14, dphi: 30, phis: [180, 300, 60], print: { life: 1.6 } })

  /* ── 5 · The worst night ("Give me shelter, give me sleep") ──
   *
   * The younger starts up again as the ring stops. She comes back in and
   * takes him up, and walks the floor with him, short heavy steps, the child
   * screaming on her hip. He follows a step behind and never touches.
   */
  scene(bt(128), 'The worst night')
  const B2 = [b.x, b.y]
  const lift2 = bt(137.5)
  tantrum(b, { at: B2, th: b.th, t0: bt(128), t1: lift2, seed: 9, I: keys([[bt(128), 0.6], [bt(130), 0.9], [bt(132), 1.4], [bt(134), 1.0], [lift2, 1.2]]) })
  // Two steps toward him, and it is worse; two back.
  const facingB2 = toward([dad.x, dad.y], B2)
  walk(dad, [B2], { t0: bt(130), n: 2, stop: 86, close: false, print: { arrow: true } })
  const D2 = [dad.x, dad.y]
  walk(dad, [[D2[0] - fwd(facingB2)[0] * 100, D2[1] - fwd(facingB2)[1] * 100]], { t0: bt(133), n: 2, face: facingB2 })
  mom.x = DOORWAY[0]
  mom.y = DOORWAY[1]
  walk(mom, [[600, 90], B2], { arrive: bt(136), per: BEAT / 2, n: 13, stop: 44, curve: true })
  b.liftAll(lift2, 0.35)
  // Up and down the floor.
  const PACE_L = [-240, 36]
  walk(mom, [[60, 60], PACE_L], { t0: bt(138), n: 12, curve: true, close: false })
  // He comes after her: the same line, a hundred behind and a little to one side.
  walk(dad, [[mom.steps.at(-13).cx, mom.steps.at(-13).cy], [60, 60], PACE_L], { t0: bt(138.5), n: 10, stop: 150, side: 62, curve: true, close: false, print: { life: 3.2 } })
  // "I wanna help": she turns at the end of her line, and he has come round in front of her, on clean floor. Toe to toe on "help".
  mom.step(bt(150), PACE_L[0] - 4, PACE_L[1] + 6, 180)
  mom.close(bt(151))
  const help = W(5, 'help')
  const FACE = [PACE_L[0] - 4, PACE_L[1] + 6 + 88]
  walk(dad, [[-150, 96], [-200, 150], FACE], { times: [bt(148.5), bt(149.5), W(5, 'wanna') + 0.2, help], curve: true, close: false, print: { arrow: true } })
  dad.step(help + BEAT / 2, FACE[0], FACE[1], 0, { toe: 0 })
  dad.close(help + BEAT, { toe: 0 })
  // "but I can't breathe": he backs away down the sheet, still facing her, and she goes back up her line.
  walk(dad, [[FACE[0] + 6, FACE[1] + 124]], { times: [W(5, 'cant'), W(5, 'breathe')], face: 0, close: false })
  dad.close(W(5, 'breathe') + BEAT)
  sway(mom, { k0: 152, k1: 157, every: 1, amp: 16 })
  const PACE_R = [86, 44]
  walk(mom, [[-80, 30], PACE_R], { t0: bt(157), n: 8, curve: true })
  walk(dad, [[-150, 190], [-44, 168]], { t0: bt(159), n: 5, curve: true })
  cries.push({ t0: lift2 + 0.2, t1: bt(165), S: keys([[lift2, 1.25], [bt(150), 1.1], [help, 1.2], [help + 0.3, 1.75], [W(5, 'breathe'), 1.7], [bt(158), 1.1], [bt(165), 1.0]]) })

  /* "Can't pick you up, can't put you down": worn out, she sets him down and
   * stands back. He steps in on "pick" and "up" and it is the worst it has
   * been; he steps back on "can't" and "down" and it eases. */
  const B3 = [PACE_R[0] + 46, PACE_R[1] + 56]
  const down2 = bt(165)
  const lift3 = bt(178)
  const [pick, up, cant2, downW] = [W(6, 'pick'), W(6, 'up'), W(6, 'cant', 1), W(6, 'down')]
  tantrum(b, { at: B3, th: 250, t0: down2, t1: lift3, seed: 13, I: keys([[down2, 0.9], [pick - 0.1, 0.95], [up, 1.75], [cant2, 1.7], [downW + 0.3, 1.0], [lift3, 0.95]]) })
  walk(mom, [[PACE_R[0] - 6, PACE_R[1] - 70]], { t0: bt(166), n: 2, face: toward(PACE_R, B3) })
  const facingB3 = toward([dad.x, dad.y], B3)
  walk(dad, [B3], { times: [pick, up], stop: 62, close: false, print: { arrow: true } })
  const D3 = [dad.x, dad.y]
  walk(dad, [[D3[0] - fwd(facingB3)[0] * 112, D3[1] - fwd(facingB3)[1] * 112]], { times: [cant2, downW], face: facingB3, close: false })
  dad.close(downW + BEAT)
  // The elder, woken, comes across to her mother; the mother takes the younger up again.
  walk(a, [[330, -90], [mom.x + 54, mom.y - 6]], { t0: bt(171), n: 7, curve: true })
  walk(mom, [B3], { t0: bt(176), n: 2, stop: 40 })
  b.liftAll(lift3, 0.35)

  /* "I'd hold you close, I'm not allowed": the three of them close together,
   * and his outlines going round them at a distance, a ring that never closes in. */
  scene(W(7, 'hold') - 1, 'Not allowed')
  const HOLD = [mom.x, mom.y]
  walk(a, [[HOLD[0] + 6, HOLD[1] - 50]], { t0: bt(178.5), n: 2 })
  a.th = toward([a.x, a.y], HOLD)
  sway(mom, { k0: 179, k1: 190, every: 1, amp: 14 })
  sway(a, { k0: 181, k1: 190, every: 2, amp: 8 })
  cries.push({ t0: lift3 + 0.2, t1: bt(190), S: keys([[lift3, 1.0], [bt(184), 0.8], [bt(190), 0.3]]) })
  {
    const a0 = (Math.atan2(dad.y - HOLD[1], dad.x - HOLD[0]) * 180) / Math.PI
    walk(dad, arc(HOLD, 172, a0, a0 + 215), { times: Array.from({ length: 10 }, (_, i) => (i === 0 ? W(7, 'id') : bt(182 + i))), close: false })
  }

  /* ── 6 · Hopscotch ("I'd play for you if I had hands") ── */
  scene(bt(190), 'Hopscotch')
  const { x0, yc, q } = COURT
  b.place(bt(190), HOLD[0] + 44, HOLD[1] + 30, 60, { gap: 0.1 })
  // The children run to the court; she goes and stands by; he comes round to the start.
  walk(a, [[x0 - 34, yc]], { arrive: bt(192.5), per: BEAT / 2, n: 6, print: { life: 1.8 } })
  a.th = 90
  walk(b, [[x0 - 30, yc + q * 1.9]], { arrive: bt(194), per: BEAT / 2, n: 8, print: { life: 1.8 } })
  const STAND3 = [120, 176]
  walk(mom, [STAND3], { t0: bt(191), n: 3 })
  mom.step(bt(195), STAND3[0], STAND3[1], 50)
  mom.close(bt(195.5))
  walk(dad, [[x0 - 80, yc + 40], [x0 - 84, yc]], { arrive: bt(195), n: 5, curve: true, close: false })
  dad.step(bt(196), x0 - 84, yc, 90)
  dad.close(bt(196.5))
  // One foot, one foot, two feet, one, two, one, and out. The elder first, then him, two beats behind.
  const hop = (P, k, o = {}) => {
    const row = (i) => x0 + q * (i + 0.5)
    const one = (kk, i) => P.put(bt(kk), row(i), yc, 90, 1, { hop: true, pop: 1, ...o })
    const two = (kk, i) => { P.put(bt(kk), row(i), yc - q / 2, 90, -1, { pop: 1, ...o }); P.put(bt(kk), row(i), yc + q / 2, 90, 1, { pop: 1, ...o }) }
    one(k, 0); one(k + 1, 1); two(k + 2, 2); one(k + 3, 3); two(k + 4, 4); one(k + 5, 5)
    P.place(bt(k + 6), x0 + q * 6 + 36, yc, 90, { pop: 1, ...o })
  }
  hop(a, 195)
  hop(dad, 197)
  // The younger jumps along beside the court with both feet.
  for (let i = 0; i < 6; i++) b.place(bt(195 + i * 1.5), x0 + 10 + q * 1.05 * i, yc + q * 1.9, 90, { pop: 1 })
  // Out of the court: she turns to watch him come through.
  walk(a, [[x0 + q * 6 + 78, yc + 96]], { t0: bt(202), n: 3 })
  a.th = 250

  /* ── 7 · The dance lesson ("If I had legs, we could learn to dance") ──
   *
   * The younger one's turn on his feet. The elder dances her own small box
   * beside them, counted out.
   */
  scene(bt(205), 'The dance lesson')
  const BOX3 = [430, 62]
  walk(dad, [[x0 + q * 6 + 20, yc + 70], BOX3], { t0: bt(204), n: 4, curve: true, close: false })
  dad.step(bt(208), BOX3[0], BOX3[1], 0, { toe: 0 })
  dad.close(bt(208.25), { toe: 0 })
  walk(b, [[BOX3[0] + 6, BOX3[1] - 40]], { arrive: bt(207.5), per: BEAT / 2, n: 8 })
  const ABOX = [600, 62]
  walk(a, [ABOX], { arrive: bt(207), n: 3, close: false })
  a.step(bt(208), ABOX[0], ABOX[1], 0, { toe: 0 })
  a.close(bt(208.5), { toe: 0 })
  const box3 = boxStep(dad, { c: BOX3, th: 0, size: 74, k0: 209, halves: 3 })
  onFeet(b, [...dad.steps.slice(-11, -9), ...box3])
  boxStep(a, { c: ABOX, th: 0, size: 46, k0: 209, halves: 3, num: false })

  /* "I tell you I love you, that I love you the most": they run rings round
   * him, and on "most" come in to his toes. */
  scene(W(10, 'tell') - 0.6, 'I love you the most')
  const HUG = [dad.x, dad.y]
  const most = W(10, 'most')
  b.step(bt(221), HUG[0] - 78, HUG[1] + 20, 0)
  walk(b, arc(HUG, 86, 165, 165 + 262), { arrive: most - BEAT / 2, per: BEAT / 2, n: 11, close: false })
  walk(a, [[HUG[0] + 96, HUG[1] + 10], ...arc(HUG, 104, 5, 5 + 245)], { arrive: most - BEAT / 2, per: BEAT / 2, n: 11, close: false })
  const TOE_A = [HUG[0] + 25, HUG[1] - 70]
  const TOE_B = [HUG[0] - 25, HUG[1] - 66]
  a.step(most, TOE_A[0], TOE_A[1], 180)
  a.close(most + BEAT / 2)
  b.step(most, TOE_B[0], TOE_B[1], 180)
  b.close(most + BEAT / 2)
  // Held, rocking a little together.
  sway(dad, { k0: 230, k1: 238, every: 2, amp: 8 })
  sway(a, { k0: 230, k1: 238, every: 2, amp: 6 })
  sway(b, { k0: 230, k1: 238, every: 2, amp: 6 })

  /* ── 8 · Fire ("But you're on fire and I'm a ghost / You're on fire. I'm a ghost") ──
   *
   * Both at once, at his toes. He is thrown back; she comes from where she
   * stood. He tries again and it flares on the second "fire".
   */
  scene(W(11, 'fire') - 0.5, 'On fire')
  const fire3 = W(11, 'fire')
  const fire3b = W(12, 'fire')
  const lift4 = bt(249)
  const end3 = bt(253)
  const I3 = keys([[fire3, 1.35], [bt(241), 1.2], [bt(244), 1.0], [bt(246), 1.2], [fire3b, 1.8], [bt(250), 1.5], [end3, 1.0]])
  tantrum(b, { at: TOE_B, th: 180, t0: fire3, t1: lift4, seed: 21, I: I3 })
  walk(dad, [[HUG[0] - 10, HUG[1] + 176]], { t0: bt(239), n: 3, face: 0 })
  walk(mom, [[330, 60], [HUG[0] - 78, HUG[1] - 112]], { t0: bt(240.5), per: BEAT / 2, n: 10, curve: true })
  mom.th = toward([mom.x, mom.y], TOE_B)
  // He comes forward again, two steps, and on "fire" it flares; back on "I'm a ghost".
  walk(dad, [[HUG[0] - 6, HUG[1] + 62]], { t0: bt(245), n: 2, face: 0, close: false, print: { arrow: true } })
  walk(dad, [[HUG[0] - 14, HUG[1] + 200]], { times: [bt(249), bt(250), bt(251)], face: 0 })
  b.liftAll(lift4, 0.35)
  // The elder stamps her way round to her mother's side.
  const CLING3 = [mom.x + 8, mom.y - 52]
  tantrum(a, {
    at: (t) => { const u = clamp01((t - bt(248.5)) / (2 * BEAT)); return [lerp(TOE_A[0], CLING3[0], u), lerp(TOE_A[1], CLING3[1], u)] },
    th: 180, t0: fire3, t1: end3, seed: 23, I: I3,
  })

  /* ── 9 · The break: she walks them down the floor; he follows ──
   *
   * The elder walks at her side in step, the younger on her hip. Half way he
   * comes up alongside and it starts again; he drops back.
   */
  scene(bt(252), 'Walking the floor')
  const PATH9 = [[250, 70], [-80, 150], [-300, 60], [-250, -70], [40, 10]]
  const START9 = [mom.x, mom.y]
  const t9 = Array.from({ length: 27 }, (_, i) => bt(253 + i))
  walk(mom, PATH9, { times: t9, curve: true })
  // The elder, cooling as she goes: red to ink over the first steps.
  walk(a, PATH9, { from: START9, times: t9, side: 50, curve: true, print: (i) => ({ red: clamp01(1 - i / 9) }) })
  walk(dad, [START9, ...PATH9], {
    times: t9.map((t) => t + BEAT / 2), curve: true, close: false,
    // A hundred and twenty behind; alongside her for four steps in the middle; then behind again.
    dist: (i, n, L) => (L - 200) * ((i + 1) / n) + 60 * keys([[9, 0], [11, 1], [13, 1], [16, 0]])(i),
    side: (i) => -78 * keys([[9, 0], [11, 1], [13, 1], [16, 0]])(i) - 26,
  })
  dad.close(t9.at(-1) + BEAT * 1.5)
  cries.push({ t0: lift4 + 0.2, t1: bt(276), S: keys([[lift4, 1.5], [bt(253), 1.1], [bt(262), 0.6], [bt(264), 1.35], [bt(266.5), 1.3], [bt(269), 0.6], [bt(276), 0.3]]) })
  // She sets him down, a second before the last block.
  const F = [mom.x, mom.y]
  mom.step(bt(280.5), F[0], F[1], 270)
  mom.close(bt(281))
  b.place(bt(280), F[0] - 40, F[1] + 44, 270, { gap: 0.1 })

  /* ── 10 · Tag ("And I'd play for you if I had hands") ──
   *
   * The children run, quick small steps, a spiral into the middle of the
   * floor; he comes after them in big slow ones.
   */
  scene(bt(282), 'Tag')
  const S = [-330, 0]
  const spiral = arc(S, 190, 0, -450, 52)
  const chase = [[-110, -34], ...spiral]
  const tKids = Array.from({ length: 25 }, (_, i) => bt(283 + i / 2))
  walk(a, chase, { times: tKids, curve: true, close: false, print: { life: 2.4 } })
  walk(b, chase, { times: tKids.map((t) => t + BEAT / 4), curve: true, close: false, side: -26, dist: (i, n, L) => (L - 70) * ((i + 1) / n), print: { life: 2.4 } })
  walk(dad, spiral, { times: Array.from({ length: 11 }, (_, i) => bt(285 + i)), curve: true, close: false, dist: (i, n, L) => (L - 150) * ((i + 1) / n), print: { life: 3 } })

  /* ── 11 · The dance ("If I had legs, we could learn to dance") ──
   *
   * The elder has learned: she dances it with him, facing him, her steps the
   * mirror of his. The younger does his own beside them. Their mother taps
   * her foot.
   */
  scene(bt(296), 'The dance')
  const BOX4 = [S[0] - 37, S[1] + 37]
  dad.step(bt(296), BOX4[0], BOX4[1], 0, { toe: 0 })
  dad.close(bt(296.5), { toe: 0 })
  const GAP = 76
  a.step(bt(296.5), BOX4[0], BOX4[1] - GAP, 180, { toe: 0 })
  a.close(bt(297), { toe: 0 })
  const BBOX = [S[0] + 118, S[1] + 30]
  walk(b, [BBOX], { arrive: bt(296.5), per: BEAT / 2, n: 3, close: false })
  b.step(bt(297), BBOX[0], BBOX[1], 0, { toe: 0 })
  b.close(bt(297.5), { toe: 0 })
  const box4 = boxStep(dad, { c: BOX4, th: 0, size: 74, k0: 298, halves: 3 })
  partner(a, box4, GAP)
  boxStep(b, { c: BBOX, th: 0, size: 40, k0: 298, halves: 3, num: false })
  sway(mom, { k0: 284, k1: 310, every: 2, amp: 10 })

  /* "I tell you I love you, that I love you the most": the three of them walk
   * across to her side by side, in step, and on "most" all four stand toe to toe. */
  scene(W(15, 'tell') - 0.6, 'I love you the most')
  const MEET = [F[0] - 112, F[1]]
  const from4 = [dad.x, dad.y]
  const th4 = toward(from4, MEET)
  dad.step(bt(310), from4[0], from4[1], th4)
  dad.close(bt(310.5))
  const sideOf = (d) => [from4[0] + rgt(th4)[0] * d, from4[1] + rgt(th4)[1] * d]
  a.step(bt(310), ...sideOf(-54), th4)
  a.close(bt(310.5))
  walk(b, [sideOf(52)], { arrive: bt(310), per: BEAT / 2, n: 5 })
  b.th = th4
  const t11 = Array.from({ length: 6 }, (_, i) => bt(311 + i))
  walk(dad, [MEET], { times: t11 })
  walk(a, [MEET], { from: from4, times: t11, side: -54 })
  walk(b, [MEET], { from: from4, times: t11, side: 52 })
  const most4 = W(15, 'most')
  const TOE_A4 = [MEET[0] + 62, MEET[1] - 40]
  const TOE_B4 = [MEET[0] + 60, MEET[1] + 42]
  a.step(most4 + BEAT, TOE_A4[0], TOE_A4[1], 110)
  a.close(most4 + BEAT * 1.5)
  b.step(most4 + BEAT, TOE_B4[0], TOE_B4[1], 70)
  b.close(most4 + BEAT * 1.5)
  mom.step(bt(318), F[0] - 8, F[1], 270)
  mom.close(bt(318.5))
  for (const P of [dad, mom, a, b]) sway(P, { k0: 320, k1: 326, every: 2, amp: P === dad || P === mom ? 8 : 5 })

  /* ── 12 · The last fire ("But you're on fire and I'm a ghost"; "You're on fire. I'm a ghost", twice) ──
   *
   * Both children, in the middle of the four of them. He is thrown back. She
   * takes the younger up and the elder stamps at her side, and it does not
   * stop. He walks all the way round them, a ring of outlines that stay on
   * the floor, and then backs away to the edge of it and stands.
   */
  scene(W(16, 'fire') - 0.5, 'On fire')
  const fire4 = W(16, 'fire')
  const lift5 = bt(329.5)
  const END = score.endCardAt ?? score.duration
  const flares = [W(17, 'fire'), W(18, 'fire')]
  const I4 = (t) => {
    let v = keys([[fire4, 1.4], [bt(330), 1.2], [END, 1.2]])(t)
    for (const f of flares) v = Math.max(v, 1.85 - Math.abs(t - f - 0.25) * 1.3)
    return v
  }
  tantrum(b, { at: TOE_B4, th: 70, t0: fire4, t1: lift5, seed: 31, I: I4 })
  mom.step(bt(328), F[0] - 22, F[1] + 10, toward(F, TOE_B4))
  mom.close(bt(328.5))
  b.liftAll(lift5, 0.35)
  const G = [mom.x, mom.y]
  const CLING4 = [G[0] + 4, G[1] - 54]
  tantrum(a, {
    at: (t) => { const u = clamp01((t - bt(329)) / (2 * BEAT)); return [lerp(TOE_A4[0], CLING4[0], u), lerp(TOE_A4[1], CLING4[1], u)] },
    th: 150, t0: fire4, t1: END, seed: 33, I: I4,
  })
  cries.push({ t0: lift5 + 0.15, t1: END, S: I4 })
  sway(mom, { k0: 331, k1: 351, every: 2, amp: 14 })
  // Thrown back, three steps, facing them.
  const RING = 214
  walk(dad, [[G[0] - RING, G[1]]], { t0: bt(327), n: 3, face: 90, close: false })
  // All the way round: left of them, over the top, down the right, to below them. These stay.
  scene(bt(330), 'All the way round')
  walk(dad, arc(G, RING, 180, 450).slice(1), { t0: bt(330), n: 15, close: false, print: { keep: true } })
  // Back to the edge of the floor, facing them, and still.
  const EDGE = [G[0], FLOOR.h / 2 - FLOOR.inset - 50]
  walk(dad, [EDGE], { t0: bt(345), n: 2, face: 0, print: { keep: true } })

  /* ── Laid out: the cries, and how thin he is near them ───────────── */
  const bursts = []
  const rand = rng(77)
  for (const c of cries) {
    let t = c.t0
    while (t < c.t1) {
      const s = c.S(t)
      const [x, y] = mom.where(t)
      if (s >= 0.3) bursts.push({ t, x: x + (rand() - 0.5) * 8, y: y + (rand() - 0.5) * 8, s, seed: Math.floor(rand() * 1000) })
      t += s >= 1.3 ? BEAT / 4 : s >= 0.6 ? BEAT / 2 : BEAT
    }
  }
  const fires = [...bursts, ...[...a.steps, ...b.steps].filter((s) => (s.stomp ?? 0) >= 0.3 && (s.red ?? 0) > 0.5).map((s) => ({ t: s.t, x: s.x, y: s.y, s: s.stomp }))]
  thinNearFire(dad.steps.filter((s) => !s.keep), fires)

  const steps = [...dad.steps, ...mom.steps, ...a.steps, ...b.steps].sort((p, q2) => p.t - q2.t)
  return { steps, bursts, scenes, people: { dad, mom, a, b }, fires, G, RING, EDGE }
}
