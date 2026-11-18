/*
 * Ghost · The Dance Card — the story, as a table of steps (v2, 2026-11-17).
 *
 * The user's brief (2026-11-10): "a dad not being able to help his wife with
 * the kids when they are screaming/upset … Otherwise, the dad can have some
 * good contact with the kids." And on 2026-11-17: "Get rid of the room
 * outline and the hopscotch. Start with just the dad's feet, then have little
 * feet run to him. Dad's feet should be red the whole time. No tantrum marks,
 * just 'sad feet' from the kid who then runs to mom."
 *
 * Three people, each only their footprints, on bare paper seen from above:
 *
 *   dad  the ghost — a man's shoe in red outline, never filled in
 *   mom  a woman's shoe (pointed sole, round heel), solid ink
 *   kid  bare feet, solid ink
 *
 * When the child is happy, he is with her: on his shoes, follow the leader,
 * a ring, tag, the dance. When she is sad (`sad`: feet together, toes in,
 * small dragged steps turning away), he comes and it does not help — the
 * nearer he is the less of him there is — and she runs to her mother.
 *
 * Times are beats of the record's click (`bt(k)`, 110 BPM) or measured words
 * (`W(line, word)`). Everything is laid out once per score; nothing here runs
 * per frame. Places are floor units, (0, 0) the middle of the plate, y down.
 * The plate shows ±766 × ±388 at the widest view; anything beyond is off the
 * paper (that is how the mother comes and goes, and how the child runs in).
 */
import { lerp } from '../../kit.mjs'
import { Person, BEAT, bt, walk, boxStep, onFeet, partner, inPrints, ring, sway, sad, faceTo, arc, toward, fwd, rgt, thinNearFire } from './engine.mjs'

/** The floor: the plate's own size round (0, 0). Nothing of it is drawn. */
export const FLOOR = { w: 1532, h: 776, inset: 16 }

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
  const kid = new Person('kid', 46, { stride: 38, life: 4.5 })
  const scenes = []
  const scene = (at, name) => scenes.push({ at, name })
  /** Where the child is sad: the father thins near these. */
  const sorrow = []
  const sadAt = (steps) => { for (const s of steps) sorrow.push({ t: s.t, x: s.x, y: s.y, s: 1 }) }

  const here = (P) => [P.x, P.y]
  /** Run: quick, long strides, a step every half beat, stopping `stop` short. Arrives (closes) at `arrive`. */
  const run = (P, pts, o) => walk(P, pts, { per: BEAT / 2, stride: P.stride * 1.45, closeAt: o.arrive != null ? o.arrive + BEAT / 2 : undefined, ...o, print: { life: 2.6, ...o.print } })
  /** Toe to toe: where to stop in front of someone standing at `p` facing `th`. */
  const before = (p, th, gap) => [p[0] + fwd(th)[0] * gap, p[1] + fwd(th)[1] * gap]
  /** Picked up: the child's feet leave the floor. */
  const pickUp = (t) => kid.liftAll(t, 0.6)
  /** Set down beside her mother, facing `th`. */
  const setDown = (t, p, th) => { kid.place(t, p[0], p[1], th, { gap: 0.12 }) }
  /** The mother walks in from beyond the edge of the paper. */
  const momIn = (from, pts, o) => { mom.x = from[0]; mom.y = from[1]; mom.th = toward(from, pts[0]); return walk(mom, pts, o) }

  /* ── 1 · Him alone, and little feet running to him ──────────────────
   *
   * When the black lifts there is only him: two red outlines in the middle of
   * bare paper, standing. Then little feet come running in from
   * the left edge, stop at his toes, bounce, and climb onto his shoes.
   */
  scene(0, 'Alone')
  const DAD0 = [-250, 70]
  dad.place(bt(2), DAD0[0], DAD0[1], 0, { toe: 0 })

  scene(bt(21.5), 'Little feet')
  const TOES0 = before(DAD0, 0, 62)
  kid.x = -830
  kid.y = -190
  kid.th = 110
  run(kid, [[-560, -150], [-380, -60], TOES0], { t0: bt(22), n: 13, curve: true, stop: 0, close: false })
  kid.place(bt(29), TOES0[0], TOES0[1], 180, { toe: 0, pop: 0.6 })
  // A bounce on the spot, both feet.
  kid.place(bt(30), TOES0[0], TOES0[1] - 2, 180, { toe: 0, pop: 1.2 })
  kid.place(bt(31), TOES0[0], TOES0[1], 180, { toe: 0, pop: 1.2 })

  /* ── 2 · On his shoes ("Amplifiers just make a noise") ── */
  scene(bt(32), 'On his shoes')
  const box1 = boxStep(dad, { c: DAD0, th: 0, size: 72, k0: 33, halves: 4 })
  onFeet(kid, [{ ...dad.cur[-1], t: bt(32) }, { ...dad.cur[1], t: bt(32.5) }, ...box1])
  // She hops down beside him.
  kid.place(bt(49), DAD0[0] - 70, DAD0[1] - 70, 140, { pop: 1 })

  /* ── 3 · Follow the leader ("When I write songs, it's not by choice") ── */
  scene(bt(51), 'Follow the leader')
  const R1 = [[-160, -110], [60, -170], [290, -110], [380, 40], [250, 160], [50, 170]]
  dad.step(bt(52), DAD0[0], DAD0[1], toward(DAD0, R1[0]))
  dad.close(bt(52.5))
  const lead = walk(dad, R1, { t0: bt(54), n: 16, curve: true, close: false, print: { life: 3.2 } })
  dad.close(bt(70))
  inPrints(kid, lead.slice(0, 11), 3 * BEAT, { life: 2.2 })
  kid.close(bt(67.5))

  /* ── 4 · The first sadness ("The city burns and I'm a ghost", twice) ──
   *
   * On "burns" she stops: feet together, toes in, and small dragged steps
   * away from him. He turns back and comes to her, a little less of him with
   * every step, and it does not help. Her mother walks in from the right and
   * on "ghost" she runs to her, and stands against her.
   */
  const burns1 = W(2, 'burns')
  scene(burns1 - 0.5, 'Sad feet')
  const K1 = here(kid)
  const away1 = toward(here(dad), K1)
  sadAt(sad(kid, { t0: burns1, n: 3, away: away1 - 25, turn: away1 + 20 }))
  dad.step(bt(72), dad.x, dad.y, toward(here(dad), K1))
  dad.close(bt(72.5))
  walk(dad, [K1], { t0: bt(73.5), per: BEAT * 1.25, n: 3, stop: 120, close: false, print: { arrow: true } })
  dad.close(bt(77.5))
  const MOM1 = [560, -60]
  momIn([840, -150], [MOM1], { arrive: bt(77), n: 6 })
  faceTo(mom, bt(78), here(kid))
  scene(W(2, 'ghost') - 0.3, 'To her mother')
  run(kid, [MOM1], { t0: W(2, 'ghost') + 0.15, stop: 54 })
  // He stops, and steps back.
  const facingK1 = dad.th
  walk(dad, [[dad.x - fwd(facingK1)[0] * 70, dad.y - fwd(facingK1)[1] * 70]], { t0: bt(80), n: 2, face: facingK1 })
  sway(mom, { k0: 81, k1: 86, every: 2, amp: 10 })

  // The second "burns": he tries again; she shuffles round behind her mother, and is picked up.
  const burns2 = W(3, 'burns')
  scene(burns2 - 0.8, 'He tries again')
  const toMom = toward(here(dad), MOM1)
  walk(dad, [MOM1], { times: [bt(86), bt(87)], stop: 170, close: false, print: { arrow: true } })
  dad.close(bt(88))
  {
    // Round her mother, from the side facing him to the far side: dragged steps on an arc.
    const a0 = (Math.atan2(kid.y - MOM1[1], kid.x - MOM1[0]) * 180) / Math.PI
    const pts = arc(MOM1, 78, a0, a0 + 130).slice(1)
    const ts = [burns2, bt(89.5), bt(91.5)]
    kid.step(bt(87.5), kid.x, kid.y, kid.th, { sad: true, toe: -19, wide: 0.9, foot: -1, life: 1.4 })
    kid.step(bt(87.9), kid.x, kid.y, kid.th, { sad: true, toe: -19, wide: 0.9, foot: 1, life: 1.4 })
    sadAt(kid.steps.slice(-2))
    const lastAt = pts.at(-1)
    ts.forEach((t, i) => {
      const p = pts[Math.round(((i + 1) / ts.length) * (pts.length - 1))]
      const s = kid.step(t, p[0], p[1], toward(p, MOM1), { sad: true, toe: -19, wide: 0.9, scuff: true, air: 0.45, life: 1.4 })
      sadAt([s])
    })
    mom.step(bt(92.5), MOM1[0], MOM1[1], toward(MOM1, lastAt), { foot: -1 })
    mom.close(bt(93))
  }
  pickUp(bt(93.5))
  // Picked up, she is carried off a little way from him, rocking.
  walk(dad, [[dad.x - fwd(toMom)[0] * 90, dad.y - fwd(toMom)[1] * 90]], { times: [bt(92), bt(93)], face: toMom })
  walk(mom, [[620, -10]], { t0: bt(94), n: 2 })
  sway(mom, { k0: 97, k1: 101, every: 1, amp: 14 })

  /* ── 5 · Quiet again: back to him, and a ring of three ── */
  scene(bt(101), 'Quiet again')
  const M2 = here(mom)
  setDown(bt(101.5), [M2[0] - 40, M2[1] + 40], 240)
  // Slowly at first, then she runs to him.
  const D5 = here(dad)
  walk(kid, [[lerp(kid.x, D5[0], 0.25), lerp(kid.y, D5[1], 0.25)]], { t0: bt(103), n: 3, close: false })
  run(kid, [D5], { t0: bt(106), stop: 64, arrive: bt(109) })
  // The ring: him, her and her mother, hand in hand, round once and a bit.
  const RC = [150, 20]
  const RR = 112
  const ringAt = (phi) => [RC[0] + RR * Math.cos((phi * Math.PI) / 180), RC[1] + RR * Math.sin((phi * Math.PI) / 180)]
  const phis = [190, 310, 70]
  walk(dad, [ringAt(phis[0])], { arrive: bt(110.5), n: 4, close: false })
  dad.step(bt(111.5), ...ringAt(phis[0]), toward(ringAt(phis[0]), RC), { foot: -1 })
  dad.close(bt(112))
  walk(kid, [ringAt(phis[1])], { arrive: bt(111), per: BEAT / 2, n: 5, close: false })
  kid.step(bt(111.5), ...ringAt(phis[1]), toward(ringAt(phis[1]), RC), { foot: -1 })
  kid.close(bt(112))
  walk(mom, [ringAt(phis[2])], { arrive: bt(110.5), n: 6, close: false, curve: true })
  mom.step(bt(111.5), ...ringAt(phis[2]), toward(ringAt(phis[2]), RC), { foot: -1 })
  mom.close(bt(112))
  scene(bt(112.5), 'Ring a ring o’ roses')
  ring([dad, kid, mom], { c: RC, R: RR, k0: 113, beats: 14, dphi: 28, phis, print: { life: 1.8 } })
  // All fall down; she goes out to the right.
  scene(bt(127.5), 'She goes')
  walk(mom, [[560, 120], [860, 140]], { t0: bt(128), n: 10, close: false, curve: true })
  mom.liftAll(bt(138.5), 0.5)

  /* ── 6 · The worst night ("Give me shelter, give me sleep") ──
   *
   * Left with him, she is sad again: a few dragged steps after her mother.
   * He comes to her; on "help" he is in front of her, toe to toe, and on
   * "breathe" she runs from him to her mother, who has come back in. */
  scene(W(4, 'give') - 0.5, 'The worst night')
  const K6 = here(kid)
  sadAt(sad(kid, { t0: W(4, 'shelter'), n: 4, every: 2, away: 90, turn: 95, shuffle: 0.38 }))
  // He comes, slowly, round in front of her.
  const K6b = here(kid)
  const FRONT = before(K6b, 95, 70)
  walk(dad, [[lerp(dad.x, FRONT[0], 0.5), lerp(dad.y, FRONT[1], 0.5) + 60], FRONT], { times: [bt(140), bt(142), bt(144), W(5, 'wanna'), W(5, 'help')], curve: true, close: false, print: { arrow: true } })
  dad.step(W(5, 'help') + BEAT / 2, FRONT[0], FRONT[1], toward(FRONT, K6b), { toe: 0 })
  dad.close(W(5, 'help') + BEAT, { toe: 0 })
  // She turns from him.
  sadAt(sad(kid, { times: [bt(152.5), bt(154)], away: 290, turn: 300, shuffle: 0.3, settle: false }))
  const MOM2 = [-250, 110]
  momIn([-430, 470], [[-330, 260], MOM2], { arrive: bt(154.5), n: 8, curve: true })
  faceTo(mom, bt(155), here(kid))
  run(kid, [MOM2], { t0: W(5, 'breathe'), stop: 54 })
  pickUp(bt(160.5))
  // He backs away from them, still facing them.
  walk(dad, [[dad.x + 60, dad.y + 30]], { times: [W(5, 'cant'), bt(157)], face: dad.th })
  // Then he comes after them, slowly, and stands off.
  walk(dad, [here(mom)], { times: [bt(159), bt(160), bt(161), bt(162), bt(163)], stop: 250, close: false })
  dad.close(bt(164))
  sway(mom, { k0: 161, k1: 165, every: 1, amp: 14 })

  /* "Can't pick you up, can't put you down": she sets her down. He steps in on
   * "pick" and "up"; on "can't" and "down" the child drags herself back to
   * her mother's side. */
  scene(W(6, 'cant') - 0.4, 'Can’t pick you up')
  const M6 = here(mom)
  const toDad = toward(M6, here(dad))
  const DOWN = before(M6, toDad, 60)
  setDown(W(6, 'cant'), DOWN, toDad)
  kid.th = toDad
  const D6 = here(dad)
  walk(dad, [DOWN], { times: [W(6, 'pick'), W(6, 'up')], stop: 120, close: false, print: { arrow: true } })
  sadAt(sad(kid, { t0: W(6, 'up') + 0.1, n: 0, away: toDad + 180 }))
  const BESIDE = [M6[0] + rgt(toDad)[0] * 48, M6[1] + rgt(toDad)[1] * 48]
  {
    const ts = [W(6, 'cant', 1), W(6, 'down')]
    ts.forEach((t, i) => {
      const p = [lerp(DOWN[0], BESIDE[0], (i + 1) / 2), lerp(DOWN[1], BESIDE[1], (i + 1) / 2)]
      sadAt([kid.step(t, p[0], p[1], toDad + 180 - 40 * (i + 1), { sad: true, toe: -19, wide: 0.9, scuff: true, air: 0.4, life: 1.4 })])
    })
  }
  walk(dad, [D6], { times: [bt(172), bt(173)], face: dad.th })

  /* "I'd hold you close, I'm not allowed": she holds her, and his outlines go
   * round them at a distance, a ring that never closes in. */
  scene(W(7, 'id') - 0.6, 'Not allowed')
  pickUp(W(7, 'hold'))
  const HOLD = here(mom)
  mom.step(W(7, 'hold') + 0.1, HOLD[0], HOLD[1], toward(HOLD, here(dad)) + 30, { foot: -1 })
  mom.close(W(7, 'hold') + 0.4)
  sway(mom, { k0: 184, k1: 192, every: 1, amp: 12 })
  {
    const a0 = (Math.atan2(dad.y - HOLD[1], dad.x - HOLD[0]) * 180) / Math.PI
    walk(dad, arc(HOLD, 175, a0, a0 - 200), { times: Array.from({ length: 10 }, (_, i) => (i === 0 ? W(7, 'id') : bt(182 + i))), close: false })
    dad.close(bt(192.5))
  }

  /* ── 7 · Tag ("I'd play for you if I had hands") ── */
  scene(bt(192.5), 'Tag')
  const M7 = here(mom)
  setDown(bt(192.5), [M7[0] + 50, M7[1] + 20], 100)
  // She runs off across the paper, round and back; he comes after her in big slow steps.
  const TAG = [[-280, 60], [-60, 140], [160, 80], [180, -100], [10, -170], [-100, -60], [40, 40]]
  const tagKid = Array.from({ length: 26 }, (_, i) => bt(194 + i / 2))
  walk(kid, TAG, { times: tagKid, curve: true, close: false, print: { life: 2.4 } })
  walk(dad, TAG, { times: Array.from({ length: 12 }, (_, i) => bt(195 + i)), curve: true, close: false, dist: (i, n, L) => (L - 90) * ((i + 1) / n), print: { life: 3 } })
  // Her mother stands back and watches.
  const STAND = [-470, 150]
  walk(mom, [STAND], { t0: bt(195), n: 3, close: false })
  mom.step(bt(199), STAND[0], STAND[1], 70, { foot: -1 })
  mom.close(bt(199.5))
  sway(mom, { k0: 200, k1: 236, every: 2, amp: 8 })

  /* ── 8 · On his shoes again ("If I had legs, we could learn to dance") ── */
  scene(bt(207), 'On his shoes')
  const BOX3 = [dad.x, dad.y]
  dad.step(bt(207), BOX3[0], BOX3[1], 0, { toe: 0, foot: -1 })
  dad.close(bt(207.5), { toe: 0 })
  const TOES3 = before(BOX3, 0, 62)
  kid.step(bt(207), TOES3[0], TOES3[1], 180, { foot: -1, toe: 0 })
  kid.close(bt(207.5), { toe: 0 })
  const box3 = boxStep(dad, { c: BOX3, th: 0, size: 72, k0: 209, halves: 3 })
  onFeet(kid, [{ ...dad.steps.at(-11), t: bt(208) }, { ...dad.steps.at(-10), t: bt(208.5) }, ...box3])

  /* "I tell you I love you, that I love you the most": she runs rings round
   * him, and on "most" comes in to his toes. */
  scene(W(10, 'tell') - 0.6, 'The most')
  const HUG = [dad.x, dad.y]
  const most = W(10, 'most')
  kid.place(bt(221), HUG[0] - 80, HUG[1] - 20, 270, { pop: 1 })
  walk(kid, arc(HUG, 92, 195, 195 + 400), { arrive: most - BEAT / 2, per: BEAT / 2, n: 11, close: false })
  const TOES4 = before(HUG, 0, 64)
  kid.step(most, TOES4[0] - 4, TOES4[1], 180, { foot: -1, toe: 0 })
  kid.close(most + BEAT / 2, { toe: 0 })
  dad.step(most, HUG[0], HUG[1], 0, { foot: -1, toe: 0 })
  dad.close(most + BEAT / 2, { toe: 0 })
  sway(dad, { k0: 230, k1: 236, every: 2, amp: 8 })
  sway(kid, { k0: 230, k1: 236, every: 2, amp: 6 })

  /* ── 9 · On fire ("But you're on fire and I'm a ghost" / "You're on fire. I'm a ghost") ──
   *
   * Sad again, right at his toes. She turns from him and drags away, then
   * runs to her mother. He goes after her, two steps, and stops. */
  const fire3 = W(11, 'fire')
  scene(fire3 - 0.5, 'On fire')
  sadAt(sad(kid, { t0: fire3, n: 2, away: 230, turn: 250 }))
  run(kid, [STAND], { t0: bt(243), stop: 54 })
  faceTo(mom, bt(244), here(kid))
  walk(dad, [STAND], { times: [W(12, 'youre'), W(12, 'fire')], stop: 260, close: false, print: { arrow: true } })
  dad.close(W(12, 'fire') + BEAT)
  pickUp(bt(250))

  /* ── 10 · The break: she walks her round; he follows behind ── */
  scene(bt(251.5), 'Walking the floor')
  const PATH9 = [[-560, 270], [-250, 300], [120, 250], [330, 60], [150, -150], [-130, -110], [0, 0]]
  const t9 = Array.from({ length: 27 }, (_, i) => bt(252 + i))
  const momPath = walk(mom, PATH9, { times: t9, curve: true })
  // Four of her steps behind her, on her line.
  walk(dad, [[momPath[0].cx, momPath[0].cy]], { arrive: t9[4] + BEAT / 2, n: 4, close: false, print: { life: 3.5 } })
  momPath.slice(1, 22).forEach((m, i) => dad.step(t9[i + 5] + BEAT / 2, m.cx, m.cy, m.cth, { life: 3.5 }))
  const DB = here(dad)
  dad.step(bt(279.5), DB[0], DB[1], toward(DB, here(mom)), { foot: -1 })
  dad.close(bt(280))
  const F = here(mom)
  mom.step(bt(280), F[0], F[1], 200)
  mom.close(bt(280.5))
  setDown(bt(281), [F[0] - 30, F[1] + 52], 220)

  /* ── 11 · Tag, round and round ("And I'd play for you if I had hands") ── */
  scene(bt(282), 'Tag')
  const S = [-200, 30]
  const spiral = arc(S, 200, -40, -470, 60)
  const tKids = Array.from({ length: 26 }, (_, i) => bt(283 + i / 2))
  walk(kid, spiral, { times: tKids, curve: true, close: false, print: { life: 2.4 } })
  walk(dad, spiral, { times: Array.from({ length: 12 }, (_, i) => bt(284 + i)), curve: true, close: false, dist: (i, n, L) => (L - 140) * ((i + 1) / n), print: { life: 3 } })
  sway(mom, { k0: 284, k1: 310, every: 2, amp: 10 })

  /* ── 12 · The dance ("If I had legs, we could learn to dance") ──
   *
   * She has learned it: she dances it with him, facing him, her steps the
   * mirror of his. */
  scene(bt(296), 'The dance')
  const BOX4 = [S[0] - 170, S[1] + 50]
  const GAP = 80
  walk(dad, [BOX4], { arrive: bt(296.5), n: 3, close: false })
  dad.step(bt(296.5), BOX4[0], BOX4[1], 0, { toe: 0 })
  dad.close(bt(297), { toe: 0 })
  walk(kid, [[BOX4[0], BOX4[1] - GAP]], { arrive: bt(296), per: BEAT / 2, n: 5, close: false })
  kid.step(bt(296.5), BOX4[0], BOX4[1] - GAP, 180, { toe: 0 })
  kid.close(bt(297), { toe: 0 })
  const box4 = boxStep(dad, { c: BOX4, th: 0, size: 72, k0: 298, halves: 3 })
  partner(kid, box4, GAP)

  /* "I tell you I love you, that I love you the most": the two of them walk
   * across to her mother side by side, in step, and on "most" all three
   * stand toe to toe. */
  scene(W(15, 'tell') - 0.6, 'All three')
  const MEET = [F[0] - 110, F[1] + 10]
  const from4 = here(dad)
  const th4 = toward(from4, MEET)
  dad.step(bt(310), from4[0], from4[1], th4)
  dad.close(bt(310.5))
  const sideOf = (d) => [from4[0] + rgt(th4)[0] * d, from4[1] + rgt(th4)[1] * d]
  walk(kid, [sideOf(-70)], { arrive: bt(310), per: BEAT / 2, n: 3 })
  kid.th = th4
  const t11 = [bt(311), bt(312.5), bt(314)]
  walk(dad, [MEET], { times: t11 })
  walk(kid, [MEET], { from: from4, times: t11, side: -70 })
  const most4 = W(15, 'most')
  const TOES5 = [MEET[0] + 58, MEET[1] - 50]
  kid.step(most4, TOES5[0], TOES5[1], toward(TOES5, F) - 30)
  kid.close(most4 + BEAT / 2)
  mom.step(bt(316), F[0], F[1], toward(F, MEET))
  mom.close(bt(316.5))
  for (const P of [dad, mom, kid]) sway(P, { k0: 318, k1: 324, every: 2, amp: P === kid ? 5 : 8 })

  /* ── 13 · The last time ("But you're on fire and I'm a ghost"; "You're on fire. I'm a ghost", twice) ──
   *
   * Sad, in the middle of the three of them. She turns from him and runs
   * round to her mother's far side, and is picked up. He walks all the way
   * round them, outlines that stay on the paper, and backs away to the edge
   * and stands. */
  const fire4 = W(16, 'fire')
  scene(fire4 - 0.5, 'On fire')
  sadAt(sad(kid, { t0: fire4, n: 1, away: toward(here(dad), here(kid)), turn: toward(here(dad), here(kid)) + 20 }))
  const G = here(mom)
  const FAR = [G[0] + 40, G[1] + 46]
  run(kid, [[G[0] + 70, G[1] - 20], FAR], { t0: bt(329), n: 4, curve: true, close: false })
  pickUp(bt(332.5))
  mom.step(bt(332.5), G[0], G[1], toward(G, FAR))
  mom.close(bt(333))
  sway(mom, { k0: 334, k1: 351, every: 2, amp: 14 })
  const RING = 220
  // Thrown back, three steps, still facing them.
  const back = toward(G, here(dad))
  walk(dad, [[G[0] + Math.sin((back * Math.PI) / 180) * RING, G[1] - Math.cos((back * Math.PI) / 180) * RING]], { times: [bt(328), bt(329), bt(330)], face: back + 180, close: false })
  scene(bt(331), 'All the way round')
  {
    const a0 = (Math.atan2(dad.y - G[1], dad.x - G[0]) * 180) / Math.PI
    walk(dad, arc(G, RING, a0, a0 + 360).slice(1), { t0: bt(331), n: 14, close: false, print: { keep: true } })
  }
  // Back to the bottom edge of the paper, facing them, and still.
  const EDGE = [G[0], FLOOR.h / 2 - FLOOR.inset - 50]
  walk(dad, [EDGE], { t0: bt(346), n: 2, face: 0, print: { keep: true } })

  /* ── Laid out: how thin he is near her sadness ─────────────────── */
  thinNearFire(dad.steps.filter((s) => !s.keep), sorrow, { near: 70, far: 280, least: 0.45, window: 2.2 })

  const steps = [...dad.steps, ...mom.steps, ...kid.steps].sort((p, q2) => p.t - q2.t)
  return { steps, scenes, people: { dad, mom, kid }, sorrow, G, RING, EDGE }
}
