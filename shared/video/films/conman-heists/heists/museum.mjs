/*
 * Job 5, the museum on the hill inside the ring: four ways to plan it
 * (exploration, 2026-11-05). The instrumental break, about 141–160 s, so no
 * words under it. Four crew, the guards in ink, cameras, and the take a
 * portrait. The ring road (The Circus) runs round the hill at 72 m.
 */
import { RING, SITES } from '../city.mjs'
import { wall, arcWall, merge, box, sector, P, Pc } from '../shop.mjs'

const SHEET = ['THE MUSEUM', 'JOB No. 4 · 1973', 'SHEET 4/6']
const WORDS = ''
const rad = (d) => (d * Math.PI) / 180
const SITE = SITES[3].o
/** The ring's centre in a job's own metres. */
const ringIn = (o) => [RING.c[0] - o[0], RING.c[1] - o[1]]

/** A dash-dot or long-dash circle (what is above or below), in a hook. */
const circleAt = (ctx, c, R, dash) => {
  const [x, y] = ctx.A(c)
  return `<circle cx="${ctx.r(x)}" cy="${ctx.r(y)}" r="${ctx.r(R * ctx.s)}" fill="none" stroke="${ctx.INK}" stroke-width="1.1" stroke-dasharray="${dash}" opacity="0.75"/>`
}
/** A drive or path: paper with ink kerbs, from a to b, w metres wide. */
const drive = (ctx, pts, w) => {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${ctx.A(p).map((v) => ctx.r(v)).join(' ')}`).join('')
  return `<path d="${d}" stroke="${ctx.INK}" stroke-width="${ctx.r(w * ctx.s + 2)}" stroke-opacity="0.55" fill="none"/><path d="${d}" stroke="${ctx.PAPER}" stroke-width="${ctx.r(w * ctx.s)}" fill="none"/>`
}
const label = (ctx, p, t, o = {}) => {
  const [x, y] = ctx.A(p)
  return ctx.txt(x, y, o.size ?? 10, t, { anchor: 'middle', spacing: 1.4, weight: 600, opacity: 0.8, halo: ctx.PAPER, ...o })
}
/** Points round an arc about c, R, from d0 to d1 degrees. */
const arcRoute = (c, R, d0, d1, step = 12) => {
  const n = Math.max(1, Math.round(Math.abs(d1 - d0) / step))
  return Array.from({ length: n + 1 }, (_, i) => Pc(c, R, d0 + ((d1 - d0) * i) / n))
}

export const VARIANTS = [
  /* ── A · The drum ─────────────────────────────────────────────────── */
  (() => {
    const o = RING.c
    const C = [0, 0]
    const R0 = 22
    const R1 = 36
    // Sectors: the entrance hall (south), four galleries, the loading bay (east).
    const RADIAL = [60, 120, -165, -90, -15, 15]
    return {
      key: 'drum', title: 'A · The drum',
      about: 'The museum is the hill\'s own circle: a stone drum in the middle of the ring, galleries round a top-lit rotunda and a ramp spiralling up the inside. The electrician cuts the power at the substation in the park, and the climber comes down through the oculus on a line, straight onto the portrait. The inside man, who joined the last tour and never left, unbolts the loading bay, and they walk out to the driver going round the Circus.',
      sheet: SHEET, words: WORDS,
      o, view: [6, 1, 8.4],
      foot: [sector(0, R1 + 0.4, -180, 180, 72)],
      walls: merge(
        arcWall('ext', R1, -180, 180, [[-3, 3, 1], [70, 84, 'g'], [86, 94, 0], [96, 110, 'g']]),
        arcWall('int', R0, -180, 180, [[-135, -125, 0], [-55, -45, 0], [33, 41, 0], [84, 96, 0], [150, 160, 0]]),
        ...RADIAL.map((d) => wall('int', P(R0, d), P(R1, d), d === 15 || d === -15 ? [[5, 6.6, d === 15 ? 1 : -1]] : [[5, 8, 0]])),
      ),
      tone: [sector(R0, R1, -15, 15, 8)],
      items: [
        { k: 'rect', x: -3.6, y: -0.35, w: 7.2, h: 0.7 },
        { k: 'take', x: -1.1, y: 0.35, w: 2.2, h: 0.6, label: 'THE PORTRAIT', side: 'below' },
        { k: 'rect', x: -5, y: 7, w: 3, h: 1 }, { k: 'rect', x: 2, y: 7, w: 3, h: 1 },
        { k: 'rect', x: -5.6, y: 30.4, w: 3.8, h: 1, label: 'DESK', side: 'left' },
        { k: 'rect', x: 31.4, y: 5.2, w: 2.2, h: 1.8, label: 'PLANT', side: 'below' },
        { k: 'rect', x: Pc(C, 44, -33)[0] - 1.4, y: Pc(C, 44, -33)[1] + 0.6, w: 2.8, h: 2, label: 'SUBSTATION', side: 'below' },
        ...[-45, 45, 135, -135].map((d) => ({ k: 'cam', x: P(21, d)[0], y: P(21, d)[1], dir: d + 180, reach: 8, spread: 18 })),
        { k: 'cam', ...(() => { const p = P(35, 62); return { x: p[0], y: p[1] } })(), dir: 62 + 160, reach: 9, spread: 16 },
      ],
      rooms: [
        [...P(29, 160), 'GALLERY I', 70], [...P(29, -128), 'GALLERY II', -38], [...P(33.6, -64), 'GALLERY III', 26], [...P(29, 37), 'GALLERY IV', -53],
        [...P(26.2, 90), 'ENTRANCE HALL', 0], [...P(25.4, 0), 'BAY', 90], [...P(13, -90), 'ROTUNDA', 0],
        [...P(72, 180), 'THE CIRCUS', -90], [...P(52, 135), 'THE HILL', 0],
      ],
      marks: [[...P(38.6, -115), 'STONE · 4 ST.', -25], [...P(17, -35), 'OCULUS, ABOVE', 55], [...P(33.2, -150), 'THE RAMP, ABOVE', 300]],
      storeys: [[...P(39.5, -62), '4']],
      dims: [{ a: P(R1, 180), b: [0, 0], text: '36.00 m' }],
      under: (ctx) => drive(ctx, [[0, R1], [0, 66]], 5) + drive(ctx, [[R1, 0], [66, 0]], 6) + drive(ctx, [Pc(C, R1, -40), Pc(C, 44, -33)], 1.6),
      over: (ctx) => {
        // The oculus above (dash-dot), the rope round the portrait, the ramp's spiral above.
        let s = circleAt(ctx, C, 8, '14 4 2 4') + circleAt(ctx, C, 4.4, '2 3')
        const pts = []
        for (let a = 95; a <= 95 + 520; a += 4) pts.push(Pc(C, 23.6 + ((a - 95) / 520) * 10, a))
        s += `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${ctx.A(p).map((v) => ctx.r(v)).join(' ')}`).join('')}" fill="none" stroke="${ctx.INK}" stroke-width="0.9" stroke-dasharray="14 4 2 4" opacity="0.4"/>`
        return s
      },
      ownerLabel: 'The guards',
      owners: [
        { pts: arcRoute(C, 28.5, -80, -25, 8), period: 13 },
        { pts: arcRoute(C, 28.5, 128, 190, 8), period: 11 },
      ],
      crew: [
        { n: 1, role: 'The inside man', style: 'solid', from: 142, to: 159.5, pts: [
          [0.6, 50], [0.6, R1], [0.6, 31.6, 4, 'joins the last tour'], [0.6, 24], [0.6, 18], ...arcRoute(C, 18, 88, 37, 12).slice(1),
          P(26, 37), P(27.8, 30), P(27.8, 20), P(27.8, 10), P(31, 2), [33.4, -1.6, 3, 'unbolts the bay'], [40, 1.4], [55, 1.6],
        ] },
        { n: 2, role: 'The electrician', style: 'dash', from: 141, to: 154, pts: [
          P(66, -45), P(48, -36), [...Pc(C, 44, -33), 4, 'cuts the power'], P(48, -36.6), P(66, -45.6),
        ] },
        { n: 3, role: 'The climber', style: 'dashdot', from: 145, to: 157.5, pts: [
          P(50, -128), [...P(37.6, -128), 1], [-1.8, -2.6, 1, 'down the oculus', 'jump'], [0.2, 0.2, 3], P(18, -50), P(26, -50),
          ...arcRoute(C, 30.6, -50, -20, 10), P(27.8, -12), [32, -0.4], [40, -0.2], [55, -1.4],
        ] },
        { n: 4, role: 'The driver', style: 'longdash', from: 141, to: 160, pts: [
          [0, 110], P(72, 90), ...arcRoute(C, 72, 90, 0, 15).slice(1), [64, 0], [58.4, 0, 0, 'engine running'],
        ] },
      ],
    }
  })(),

  /* ── B · The rotunda ──────────────────────────────────────────────── */
  (() => {
    const RC = [28, 21]
    return {
      key: 'rotunda', title: 'B · The rotunda',
      about: 'The plan the film has now, redrawn in the atlas: five galleries round a domed rotunda, the portrait in a case under the skylight and beams across the floor. The electrician cuts the power at the loading door and the beams go dark. The climber comes down the skylight while the inside man, on the last tour, swaps the case. The driver circles the block with the engine running.',
      sheet: SHEET, words: WORDS,
      o: SITE, view: [30, 22, 13.2],
      foot: [box(0, 0, 56, 44)],
      walls: merge(
        wall('ext', [0, 0], [56, 0], [[3, 15, 'g'], [41, 53, 'g']]),
        wall('ext', [56, 0], [56, 44], [[6, 10, 0]]),
        wall('ext', [0, 44], [56, 44], [[26, 30, 0]]),
        wall('ext', [0, 0], [0, 44], [[17, 27, 'g']]),
        wall('int', [18, 0], [18, 44], [[6, 8, 1], [20, 22, 0], [38, 40, 1]]),
        wall('int', [38, 0], [38, 44], [[6, 8, -1], [20, 22, 0], [38, 40, -1]]),
        wall('int', [0, 14], [18, 14], [[8, 10, 0]]), wall('int', [0, 30], [18, 30], [[8, 10, 0]]),
        wall('int', [38, 14], [56, 14], [[8, 10, 0]]), wall('int', [38, 30], [56, 30], [[8, 10, 0]]),
        wall('int', [18, 34], [38, 34], [[8, 12, 0]]), wall('int', [18, 8], [38, 8], [[8, 12, 0]]),
        ...[[14, 76], [104, 166], [194, 256], [284, 346]].map(([a, b]) => arcWall('int', 9, a, b, [], RC)),
      ),
      tone: [box(18, 0, 38, 8), box(38, 30, 56, 44)],
      items: [
        { k: 'take', x: 26.8, y: 19.8, w: 2.4, h: 2.4, label: 'THE PORTRAIT' },
        { k: 'rect', x: 0.4, y: 3, w: 0.4, h: 8 }, { k: 'rect', x: 0.4, y: 32, w: 0.4, h: 9 }, { k: 'rect', x: 55.2, y: 16, w: 0.4, h: 12 },
        { k: 'rect', x: 17.2, y: 16, w: 0.4, h: 3 }, { k: 'rect', x: 38.4, y: 16, w: 0.4, h: 3 },
        { k: 'ring', x: 9, y: 22, r: 1.2 }, { k: 'ring', x: 47, y: 22, r: 1.2 }, { k: 'ring', x: 9, y: 38, r: 0.9 },
        { k: 'rect', x: 53.4, y: 1, w: 2, h: 2.2, label: 'POWER', side: 'left' },
        { k: 'rect', x: 22, y: 1.4, w: 5, h: 2 }, { k: 'rect', x: 30, y: 1.4, w: 5, h: 2 },
        { k: 'rect', x: 24, y: 38.6, w: 8, h: 1.4, label: 'DESK', side: 'above' },
        { k: 'cam', x: 1, y: 1, dir: 45 }, { k: 'cam', x: 55, y: 43, dir: -135 }, { k: 'cam', x: 19, y: 33, dir: -45 },
        { k: 'cam', x: 37, y: 33, dir: -135 }, { k: 'cam', x: 1, y: 43, dir: -45 }, { k: 'cam', x: 37, y: 9, dir: 135 },
      ],
      rooms: [[9, 7.4, 'GALLERY I'], [9, 26, 'GALLERY II'], [9, 35, 'GALLERY III'], [47, 7.4, 'GALLERY IV'], [47, 26, 'GALLERY V'], [47, 37.4, 'LOADING'],
        [28, 5.6, 'OFFICES'], [28, 42, 'ENTRANCE HALL'], [28, 31.6, 'ROTUNDA'], [28, 50.4, 'THE CIRCUS']],
      marks: [[-1.4, 22, 'STONE · 2 ST.', -90], [28, 13.4, 'SKYLIGHT, ABOVE']],
      storeys: [[54.2, 41.8, '2']],
      dims: [],
      under: (ctx) => {
        // The beams: live until the power goes at 151.5, then drawn faint.
        const live = ctx.time < 151.5
        const beams = [[21.6, 14.6, 34.4, 27.4], [21.6, 27.4, 34.4, 14.6], [19.4, 21, 36.6, 21], [28, 12.4, 28, 29.6]]
        let s = ''
        for (const [x0, y0, x1, y1] of beams) {
          const [a, b] = [ctx.A([x0, y0]), ctx.A([x1, y1])]
          s += `<line x1="${ctx.r(a[0])}" y1="${ctx.r(a[1])}" x2="${ctx.r(b[0])}" y2="${ctx.r(b[1])}" stroke="${ctx.INK}" stroke-width="0.8" stroke-dasharray="${live ? '6 2' : '2 6'}" opacity="${live ? 0.8 : 0.35}"/>`
        }
        s += label(ctx, [28, 26.4], live ? 'BEAMS' : 'BEAMS (DARK)', { size: 9 })
        return s + circleAt(ctx, RC, 5.4, '14 4 2 4')
      },
      ownerLabel: 'The guards',
      owners: [{ pts: [[9, 3], [9, 41]], period: 12 }, { pts: [[47, 41], [47, 17]], period: 10 }, { pts: [[21, 41], [35, 41]], period: 7 }],
      crew: [
        { n: 1, role: 'The inside man', style: 'solid', from: 142, to: 159.5, pts: [
          [27.4, 49.6], [27.4, 44], [27.4, 37, 6.5, 'joins the last tour'], [27.4, 30.6], [27.4, 23.4, 4, 'swaps the case'], [27.4, 36], [27.4, 44], [27.4, 47.2], [25.8, 48],
        ] },
        { n: 2, role: 'The electrician', style: 'dash', from: 141, to: 154, pts: [
          [64, 8], [56, 8], [51, 6], [53, 3.6, 5, 'cuts the power'], [51, 8.6], [56, 8.6], [64, 8.6],
        ] },
        { n: 3, role: 'The climber', style: 'dashdot', from: 145, to: 157.5, pts: [
          [29, -5], [29, 0, 1], [29, 18.6, 5, 'down the skylight', 'jump'], [29, 0, 0, null, 'jump'], [29, -5],
        ] },
        { n: 4, role: 'The driver', style: 'longdash', from: 141, to: 160, pts: [
          [-6, 48], [62, 48], [62, -5], [-6, -5], [-6, 48], [24, 48, 0, 'engine running'],
        ] },
      ],
    }
  })(),

  /* ── C · On loan ──────────────────────────────────────────────────── */
  {
    key: 'loan', title: 'C · On loan',
    about: 'Nobody breaks in. The portrait is going out on loan, crated in the store behind a long gallery and a walled sculpture garden. The conman arrives as the courier from a museum that does not exist and signs for it at the registrar\'s desk. The handler swaps the crate labels, the porter waves the van through the bay, and the portrait leaves by the front of the paperwork.',
    sheet: SHEET, words: WORDS,
    o: SITE, view: [36, 22, 12.4],
    foot: [box(0, 0, 56, 44)],
    walls: merge(
      wall('ext', [0, 0], [56, 0]),
      wall('ext', [0, 0], [0, 12]),
      wall('ext', [0, 12], [40, 12], [[3, 15, 'g'], [18, 20, 1], [23, 36, 'g']]),
      wall('ext', [56, 0], [56, 44], [[33, 40, 0]]),
      wall('ext', [40, 44], [56, 44]),
      wall('ext', [40, 12], [40, 44], [[4, 14, 'g']]),
      wall('int', [40, 0], [40, 8]),
      wall('int', [40, 8], [56, 8], [[4, 5.4, -1]]),
      wall('int', [40, 12], [56, 12], [[7, 9.4, 1]]),
      wall('int', [40, 28], [56, 28], [[3, 10, 0]]),
      wall('int', [0, 12], [0, 44]),
      wall('int', [0, 44], [40, 44], [[26, 30, 0]]),
    ),
    tone: [box(40, 0, 56, 8), box(40, 12, 56, 44)],
    items: [
      { k: 'rect', x: 11.7, y: 3.4, w: 0.6, h: 5 }, { k: 'rect', x: 27.7, y: 3.4, w: 0.6, h: 5 },
      { k: 'rect', x: 1, y: 0.4, w: 8, h: 0.4 }, { k: 'rect', x: 11, y: 0.4, w: 8, h: 0.4 }, { k: 'rect', x: 31, y: 0.4, w: 8, h: 0.4 },
      { k: 'rect', x: 21, y: 0.4, w: 8, h: 0.4 },
      { k: 'rect', x: 48.6, y: 3, w: 4.4, h: 1.6 },
      { k: 'take', x: 41.2, y: 14, w: 2.4, h: 3.4, label: 'THE PORTRAIT', side: 'right' },
      { k: 'rect', x: 41.2, y: 18.6, w: 2.4, h: 3.4, label: 'THE COPY', side: 'right' },
      { k: 'rect', x: 52.6, y: 24.6, w: 2.8, h: 2.8 },
      ...[[8, 20], [8, 36], [20, 28], [32, 20], [32, 36]].map(([x, y]) => ({ k: 'ring', x, y, r: 0.9 })),
      { k: 'cam', x: 55.4, y: 27.4, dir: -135, reach: 8 }, { k: 'cam', x: 40.6, y: 43.4, dir: -45, reach: 8 }, { k: 'cam', x: 0.6, y: 0.6, dir: 30, reach: 9 },
    ],
    rooms: [[20, 6, 'THE LONG GALLERY'], [44.4, 2.2, 'REGISTRAR'], [52, 10.3, 'HALL', 0, 10.5], [55, 19.6, 'CRATE STORE', 90], [48.2, 31, 'LOADING BAY'],
      [20, 31.6, 'THE SCULPTURE GARDEN'], [28, 50.4, 'THE CIRCUS']],
    marks: [[-1.4, 6, 'STONE', -90], [-1.4, 28, 'GARDEN WALL', -90], [57.4, 22, 'BRICK · 1 ST.', 90]],
    storeys: [[38.2, 2, '1']],
    dims: [{ a: [0, -2.4], b: [40, -2.4], text: '40.00 m' }],
    under: (ctx) => {
      let s = drive(ctx, [[56, 36.5], [94, 36.5]], 7) + drive(ctx, [[28, 44], [28, 64]], 4)
      // Garden paths: a cross from the gate.
      s += drive(ctx, [[28, 44], [28, 22], [20, 14], [19, 12]], 1.6) + drive(ctx, [[8, 28], [32, 28]], 1.6)
      return s
    },
    over: (ctx) => {
      // The van at the dock.
      const [x, y] = ctx.A([58.4, 34.4])
      return `<rect x="${ctx.r(x)}" y="${ctx.r(y)}" width="${ctx.r(8.6 * ctx.s)}" height="${ctx.r(4.2 * ctx.s)}" fill="none" stroke="${ctx.INK}" stroke-width="1.1" stroke-dasharray="5 3"/>${label(ctx, [67.4, 40.4], 'VAN', { size: 9.5 })}`
    },
    ownerLabel: 'The guards',
    owners: [{ pts: [[4, 9.6], [36, 9.6]], period: 14 }, { pts: [[23, 41.6], [33, 41.6]], period: 8 }],
    crew: [
      { n: 1, role: 'The courier', style: 'solid', from: 142, to: 159.5, pts: [
        [27.4, 52], [27.4, 44], [27.4, 22.6], [19.6, 14.4], [19.4, 12], [19.4, 10.6], [42, 10.6], [44.7, 9.4], [44.7, 6.4], [47.4, 4.2, 4, 'signs for the loan'],
        [44.7, 6.6], [44.7, 10.6], [48.2, 10.6], [48.2, 13], [52.9, 15.4, 2], [52.9, 23.6], [52.9, 33], [54.6, 35.6], [57.6, 35.6], [60, 35.6],
      ] },
      { n: 2, role: 'The handler', style: 'dash', from: 141, to: 156, pts: [
        [42.6, 41.4], [42.6, 29], [44.4, 24.6, 4, 'swaps the labels'], [45.4, 27], [46.6, 29], [50.4, 34], [50.4, 36.6],
      ] },
      { n: 3, role: 'The porter', style: 'dot', from: 143, to: 157, pts: [
        [41.6, 34], [46, 40.6], [52.6, 40.6, 5, 'waves it through'],
      ] },
      { n: 4, role: 'The driver', style: 'longdash', from: 141, to: 160, pts: [
        [96, 24], [96, 37.6], [74, 37.6, 1, 'backs into the bay'], [62, 37.6, 0, null],
      ] },
    ],
  },

  /* ── D · The gala ─────────────────────────────────────────────────── */
  {
    key: 'gala', title: 'D · The gala',
    about: 'Opening night, and the job is done in a dinner jacket. While the guest of honour makes a speech from the dais and every eye in the great hall is on him, the conman slips into the portrait gallery. The caterer wheels the copy in from the kitchen under a tablecloth, they swap them on the hooks, and the original goes out with the dirty linen to the van in the service yard.',
    sheet: SHEET, words: WORDS,
    o: SITE, view: [24, 22.4, 12.8],
    foot: [box(0, 0, 56, 40), box(16, 40, 40, 46.6)],
    walls: merge(
      wall('ext', [0, 0], [56, 0]),
      wall('ext', [56, 0], [56, 40]),
      wall('ext', [0, 40], [56, 40], [[20, 23, 'g'], [26, 30, 0], [33, 36, 'g']]),
      wall('ext', [0, 0], [0, 40], [[2.8, 4.6, 1]]),
      wall('int', [0, 8], [56, 8], [[26, 28, 1], [41.2, 42.8, -1]]),
      wall('int', [16, 0], [16, 8], [[3.2, 4.8, 1]]),
      wall('int', [16, 8], [16, 40], [[14, 18, 0]]),
      wall('int', [40, 8], [40, 40], [[14, 18, 0]]),
    ),
    tone: [box(0, 0, 56, 8)],
    items: [
      { k: 'rect', x: 22, y: 9, w: 12, h: 2.6, label: 'DAIS', side: 'right' },
      ...[20, 28, 36].flatMap((x) => [18, 25, 32].map((y) => ({ k: 'ring', x, y, r: 1.3 }))),
      { k: 'rect', x: 38.4, y: 31, w: 1, h: 5, label: 'BAR', side: 'above' },
      { k: 'rect', x: 1, y: 0.6, w: 6, h: 1.2 }, { k: 'rect', x: 11.6, y: 0.6, w: 1.6, h: 2.4 },
      ...[11, 15.6, 26, 30.6].map((y) => ({ k: 'rect', x: 55.2, y, w: 0.5, h: 2.4 })),
      ...[12, 18, 26, 32].map((y) => ({ k: 'rect', x: 0.3, y, w: 0.5, h: 2.4 })),
      { k: 'take', x: 54.9, y: 20.6, w: 0.8, h: 2.8, label: 'THE PORTRAIT', side: 'left' },
      ...[18, 22, 26, 30, 34, 38].map((x) => ({ k: 'ring', x, y: 42.4, r: 0.7 })),
      { k: 'cam', x: 40.8, y: 8.8, dir: 45, reach: 8 }, { k: 'cam', x: 55.2, y: 39.2, dir: -135, reach: 8 }, { k: 'cam', x: 0.8, y: 39.2, dir: -45, reach: 8 },
    ],
    rooms: [[5.4, 23, 'WEST GALLERY', -90], [47.6, 33.6, 'THE PORTRAITS'], [21.6, 36.6, 'GREAT HALL'], [6, 6.6, 'KITCHEN'], [33, 2, 'SERVICE'], [28, 51.4, 'THE CIRCUS'], [-7.6, 30, 'SERVICE YARD', -90]],
    marks: [[36.6, 48.6, 'PORTICO'], [57.4, 32, 'STONE · 2 ST.', 90]],
    storeys: [[54, 2.4, '2']],
    dims: [{ a: [0, -2.4], b: [56, -2.4] }],
    under: (ctx) => {
      // The steps up to the portico, and the service drive to the kitchen door.
      let s = drive(ctx, [[28, 46.6], [28, 60]], 5) + drive(ctx, [[-12, 60], [-12, 4], [0, 4]], 5)
      let d = ''
      for (let y = 44.4; y <= 46.6; y += 0.55) { const [a, b] = [ctx.A([16, y]), ctx.A([40, y])]; d += `M${ctx.r(a[0])} ${ctx.r(a[1])}L${ctx.r(b[0])} ${ctx.r(b[1])}` }
      s += `<path d="${d}" stroke="${ctx.INK}" stroke-width="0.7" opacity="0.8"/>`
      return s
    },
    over: (ctx) => {
      const [x, y] = ctx.A([-14.4, 9])
      return `<rect x="${ctx.r(x)}" y="${ctx.r(y)}" width="${ctx.r(4.8 * ctx.s)}" height="${ctx.r(8 * ctx.s)}" fill="none" stroke="${ctx.INK}" stroke-width="1.1" stroke-dasharray="5 3"/>${label(ctx, [-16, 13], 'VAN', { size: 9.5, rot: -90 })}`
    },
    ownerLabel: 'The guards',
    owners: [{ pts: [[10, 11], [10, 37]], period: 12 }, { pts: [[23, 38.4], [33, 38.4]], period: 7 }],
    crew: [
      { n: 1, role: 'The conman', style: 'solid', from: 142, to: 159.5, pts: [
        [27.4, 54], [27.4, 40], [27.4, 29], [24, 28.6, 3, 'raises a glass'], [32, 24.4], [40, 24.4], [49.6, 26.4], [53.8, 23.2, 4, 'lifts it off its hooks'],
        [50, 27.2], [40, 25.2], [33, 25.2], [25.2, 21.6, 0, 'applauds'],
      ] },
      { n: 2, role: 'The caterer', style: 'dash', from: 141, to: 158, pts: [
        [-12, 4], [0, 3.7], [7, 3.8, 3, 'the copy under the cloth'], [14, 3.8], [17, 3.8], [30, 4.4], [42, 4.4], [42, 8], [46, 12], [53.6, 20.4, 3, 'hangs the copy'],
        [46.6, 12.6], [42.4, 8], [42.4, 6.2], [18, 6.2], [17, 4.4], [8, 4.6], [0, 4.4], [-8, 4.4], [-10.4, 9.6],
      ] },
      { n: 3, role: 'The guest of honour', style: 'dot', from: 143, to: 156, pts: [
        [28.6, 54], [28.6, 40], [28.6, 30], [27, 14], [28, 10.6, 6, 'makes a speech'],
      ] },
      { n: 4, role: 'The driver', style: 'longdash', from: 141, to: 160, pts: [
        [-12, 62], [-12, 30], [-12, 17, 0, 'engine running'],
      ] },
    ],
  },
]

void rad
void ringIn
