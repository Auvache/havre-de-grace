/*
 * Still lifes — the pictures on Conman's wall that are not people.
 *
 * Instruments, costumes and pages of music, engraved in the same stencil hand
 * as the sitters (shared/video/portraits.mjs): ink silhouettes cut angular,
 * paper details, the song's green for anything second. They are what the song
 * steals from, so each one tears: a headstock, a bar of tab, a note off a
 * stave, a dragon off a sleeve.
 *
 * Three sets belong to the verses — what hangs behind the three windows the
 * camera comes close to — and the rest are hung all over the wall between the
 * portraits. Every riff, tab and scribble here is invented; none is anybody's.
 *
 * Plain .mjs, pure, no DOM, no randomness.
 */
import { t } from './kit.mjs'
import { INK, PAPER, RED } from './album.mjs'
import {
  scene, P, pen, fillD, circ, ellipse, closedD, polyD, spline, hash, seq, PW, PH, GREEN,
  dragon, peppermint, guitarNeck, headstock, unit, rings3, oldMic,
} from './portraits.mjs'

const CX = PW / 2
const r1 = (v) => Math.round(v * 10) / 10

/* ══ PAGES ═════════════════════════════════════════════════════════════ */

/** A sheet of paper laid on the ground, a little askew, with its shadow. */
function page(K, { x = 44, y = 30, w = 272, h = 404, tilt = -2 } = {}) {
  const d = closedD([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])
  return `<g transform="rotate(${tilt} ${CX} ${PH / 2})">${fillD(d, INK, { opacity: 0.28, extra: ' transform="translate(5 7)"' })}${fillD(d, PAPER)}${pen(d, 1.2)}`
}

/** Five-line staves with an invented tune on them: heads, stems, beams, bar lines. */
function staves(K, seed, { x = 66, y = 96, w = 228, rows = 4, gap = 88 } = {}) {
  const rand = seq(seed)
  let s = ''
  for (let row = 0; row < rows; row++) {
    const y0 = y + row * gap
    let lines = ''
    for (let i = 0; i < 5; i++) lines += `M${P(x, y0 + i * 8)}H${r1(x + w)}`
    s += pen(lines, 0.8)
    s += pen(`M${P(x, y0)}V${r1(y0 + 32)}M${P(x + w, y0)}V${r1(y0 + 32)}M${P(x + w / 2, y0)}V${r1(y0 + 32)}`, 1)
    // Eighth notes in pairs, beamed; now and then a quarter.
    let nx = x + 18
    while (nx < x + w - 14) {
      if (Math.abs(nx - (x + w / 2)) < 8) { nx += 12; continue }
      const pair = rand() > 0.3
      const n = pair ? 2 : 1
      const heads = []
      for (let k = 0; k < n; k++) {
        const step = Math.floor(rand() * 9)
        const hy = y0 + 32 - step * 4
        heads.push([nx + k * 16, hy])
      }
      const up = heads[0][1] > y0 + 14
      const stemY = up ? Math.min(...heads.map((h) => h[1])) - 26 : Math.max(...heads.map((h) => h[1])) + 26
      for (const [hx, hy] of heads) {
        s += fillD(`M${P(hx - 5, hy)}a5 3.8 -20 1 0 10 0a5 3.8 -20 1 0 -10 0Z`, INK)
        s += pen(`M${P(up ? hx + 4.6 : hx - 4.6, hy)}V${r1(stemY)}`, 1.1)
      }
      if (n === 2) s += pen(`M${P(heads[0][0] + (up ? 4.6 : -4.6), stemY)}L${P(heads[1][0] + (up ? 4.6 : -4.6), stemY)}`, 3.6)
      nx += n * 16 + 12
    }
  }
  return s
}

/** Six-line tab staves with invented fret numbers; `pick` adds p-i-m under a fingerpicked bass. */
function tab(K, seed, { x = 70, y = 92, w = 222, rows = 4, gap = 90, pick = false } = {}) {
  const rand = seq(seed)
  let s = ''
  for (let row = 0; row < rows; row++) {
    const y0 = y + row * gap
    let lines = ''
    for (let i = 0; i < 6; i++) lines += `M${P(x, y0 + i * 9)}H${r1(x + w)}`
    s += pen(lines, 0.7)
    s += pen(`M${P(x, y0)}V${r1(y0 + 45)}M${P(x + w, y0)}V${r1(y0 + 45)}`, 1.1)
    for (const [i, ch] of ['T', 'A', 'B'].entries()) s += t({ x: x - 12, y: y0 + 12 + i * 13, size: 11, text: ch, fill: INK, weight: 700, anchor: 'middle' })
    let nx = x + 16
    let k = 0
    while (nx < x + w - 10) {
      const string = pick ? (k % 4 === 0 ? 5 : k % 4 === 2 ? 3 : Math.floor(rand() * 3)) : Math.floor(rand() * 6)
      const fret = pick ? [0, 2, 3, 1, 0][Math.floor(rand() * 5)] : Math.floor(rand() * 13)
      const ty = y0 + string * 9
      s += fillD(closedD([[nx - 5, ty - 5], [nx + 5, ty - 5], [nx + 5, ty + 5], [nx - 5, ty + 5]]), PAPER)
      s += t({ x: nx, y: ty + 4, size: 11, text: String(fret), fill: INK, weight: 700, anchor: 'middle' })
      if (pick) s += t({ x: nx, y: y0 + 64, size: 10, text: ['p', 'i', 'p', 'm'][k % 4], fill: GREEN, weight: 400, anchor: 'middle', upper: false })
      nx += 20
      k++
    }
  }
  return s
}

/* ══ INSTRUMENTS ═══════════════════════════════════════════════════════ */

/** An acoustic guitar standing up: the body, the rosette, the neck, the headstock. */
function acousticStanding(K, { x = CX, y = 300, s = 1, tone = 3 } = {}) {
  const S = (pts) => pts.map(([a, b]) => [x + a * s, y + b * s])
  const body = S([[-58, -96], [-40, -112], [0, -104], [40, -112], [58, -96], [62, -40], [48, -6], [86, 50], [92, 110], [60, 150], [0, 158], [-60, 150], [-92, 110], [-86, 50], [-48, -6], [-62, -40]])
  let out = guitarNeck(K, x, y - 100 * s, x, y - 250 * s, 26 * s, { tone: 3 })
  const [ux, uy] = unit(x, y, x, y - 250 * s)
  out += headstock(K, x, y - 250 * s, ux, uy, [[0, -14], [54, -18], [62, -10], [62, 10], [54, 18], [0, 14]].map(([a, c]) => [a * s, c * s]), { tone: 4, pegs: [[14, -22], [30, -22], [46, -22], [14, 22], [30, 22], [46, 22]].map(([a, c]) => [a * s, c * s]) })
  out += K.shape(body, { tone, line: 1.4 })
  out += fillD(circ(x, y - 20 * s, 30 * s), INK) + pen(circ(x, y - 20 * s, 36 * s), 3, { stroke: PAPER }) + pen(circ(x, y - 20 * s, 40 * s), 0.9, { stroke: PAPER })
  out += K.shape(S([[36, -2], [62, 18], [66, 60], [40, 70], [26, 30]]), { tone: 4, sharp: true, line: 1 })
  out += K.shape(S([[-34, 90], [34, 90], [34, 102], [-34, 102]]), { tone: 0, sharp: true, line: 1 })
  let str = ''
  for (let i = -2.5; i <= 2.5; i++) str += `M${P(x + i * 3.6 * s, y - 250 * s)}L${P(x + i * 4.2 * s, y + 96 * s)}`
  out += pen(str, 0.6, { stroke: PAPER, opacity: 0.9 })
  return out
}

/** A solid electric with an offset body: horn, cutaway, three pickups, a scratchplate. */
function electricStanding(K, { x = CX, y = 320, s = 1 } = {}) {
  const S = (pts) => pts.map(([a, b]) => [x + a * s, y + b * s])
  const body = S([[-62, -110], [-40, -118], [-20, -70], [20, -70], [52, -128], [74, -104], [64, -40], [84, 30], [80, 100], [40, 136], [-30, 138], [-80, 104], [-86, 36], [-62, -30]])
  let out = guitarNeck(K, x, y - 80 * s, x - 10 * s, y - 270 * s, 22 * s, { tone: 1 })
  const [ux, uy] = unit(x, y, x - 10 * s, y - 270 * s)
  out += headstock(K, x - 10 * s, y - 270 * s, ux, uy, [[0, -10], [20, -16], [58, -14], [72, -6], [74, 12], [56, 14], [0, 10]].map(([a, c]) => [a * s, c * s]), { tone: 0, pegs: [[12, 17], [22, 18], [32, 18], [42, 18], [52, 17], [62, 16]].map(([a, c]) => [a * s, c * s]) })
  out += K.shape(body, { tone: 4, sharp: true, line: 1.4 })
  out += K.shape(S([[-44, -60], [30, -62], [50, -20], [52, 60], [10, 100], [-40, 90], [-56, 20]]), { tone: 0, sharp: true, line: 1 })
  for (let i = 0; i < 3; i++) out += K.shape(S([[-18, -44 + i * 34], [18, -48 + i * 34], [18, -38 + i * 34], [-18, -34 + i * 34]]), { tone: 4, sharp: true, line: 0.8 })
  for (const [a, b] of [[34, 70], [48, 50], [58, 28]]) out += fillD(circ(x + a * s, y + b * s, 6 * s), PAPER) + pen(circ(x + a * s, y + b * s, 6 * s), 1)
  return out
}

/* ══ THE LED ZEPPELIN WINDOW ═══════════════════════════════════════════ */

// A double-neck: one body, two necks, two headstocks.
scene('doubleneck', {
  kind: 'object',
  frame: 'rect',
  pieces: {
    head12: [[196, 20], [268, 20], [268, 120], [196, 120]],
    head6: [[92, 20], [164, 20], [164, 120], [92, 120]],
    horn: [[40, 290], [130, 270], [140, 360], [44, 372]],
    pickups: [[160, 330], [260, 320], [268, 410], [156, 420]],
  },
  draw: (K) => {
    const body = [[64, 312], [96, 270], [130, 292], [150, 262], [180, 284], [210, 262], [230, 292], [264, 270], [296, 312], [306, 392], [274, 446], [180, 458], [86, 446], [54, 392]]
    let s = ''
    for (const [x0, x1, w, head] of [[146, 128, 22, 6], [214, 232, 26, 12]]) {
      const [ux, uy] = unit(x0, 290, x1, 70)
      s += guitarNeck(K, x0, 300, x1, 70, w, { tone: 4 })
      const pegs = head === 12 ? [[10, -19], [20, -20], [30, -20], [40, -20], [50, -19], [60, -18], [10, 19], [20, 20], [30, 20], [40, 20], [50, 19], [60, 18]] : [[14, -19], [28, -21], [42, -21], [14, 19], [28, 21], [42, 21]]
      s += headstock(K, x1, 70, ux, uy, head === 12 ? [[0, -13], [60, -17], [74, -8], [70, 0], [74, 8], [60, 17], [0, 13]] : [[0, -11], [44, -16], [58, -8], [54, 0], [58, 8], [44, 16], [0, 11]], { tone: 4, pegs })
    }
    s += K.shape(body, { tone: 4, sharp: true, line: 1.4 })
    s += K.shape([[110, 330], [250, 330], [270, 410], [180, 440], [90, 410]], { tone: 0, sharp: true, line: 1 })
    for (const [x, y] of [[146, 350], [146, 386], [214, 350], [214, 386]]) s += K.shape([[x - 20, y - 7], [x + 20, y - 7], [x + 20, y + 7], [x - 20, y + 7]], { tone: 4, sharp: true, line: 0.8 })
    for (const [x, y] of [[250, 420], [268, 404], [112, 420], [96, 404]]) s += fillD(circ(x, y, 6), INK) + pen(circ(x, y, 6), 1, { stroke: PAPER })
    return s
  },
})

// A page of tab: four systems of an invented riff.
scene('zep-tab', {
  kind: 'object',
  frame: 'rect',
  pieces: {
    bar1: [[60, 80], [300, 76], [304, 150], [58, 154]],
    bar3: [[62, 262], [240, 258], [244, 330], [60, 336]],
    corner: [[230, 30], [318, 30], [318, 110], [230, 110]],
    tail: [[160, 340], [310, 336], [312, 430], [158, 434]],
  },
  draw: (K) => page(K) + pen('M72 58H200', 4) + pen('M72 70H150', 1.4) + tab(K, 31) + '</g>',
})

// The black suit on a hanger, a dragon climbing each side.
scene('dragon-suit', {
  kind: 'object',
  frame: 'arch',
  pieces: {
    dragonL: [[50, 250], [130, 240], [140, 430], [46, 440]],
    dragonR: [[230, 240], [310, 250], [314, 440], [220, 430]],
    lapel: [[140, 110], [220, 110], [226, 220], [134, 220]],
    sleeve: [[10, 170], [70, 160], [80, 330], [14, 340]],
  },
  draw: (K) => {
    let s = pen('M180 80L180 60Q180 40 196 40Q210 40 210 54', 2.4) + pen('M180 80L90 118L270 118Z', 2)
    const jacket = [[112, 104], [180, 96], [248, 104], [300, 130], [334, 330], [304, 336], [284, 200], [280, 440], [80, 440], [76, 200], [56, 336], [26, 330], [60, 130]]
    s += K.shape(jacket, { tone: 4, sharp: true, line: 1.4 })
    s += K.shape([[150, 100], [180, 190], [210, 100], [196, 98], [180, 150], [164, 98]], { tone: 0, sharp: true, line: 1 })
    s += pen('M150 102L124 170L170 260L180 440M210 102L236 170L190 260L180 440', 1.6, { stroke: PAPER })
    s += dragon(K, 110, 436, 180, 1) + dragon(K, 250, 436, 180, -1)
    for (const y of [300, 340, 380]) s += fillD(circ(186, y, 4), PAPER)
    return s
  },
})

/* ══ THE WHITE STRIPES WINDOW ══════════════════════════════════════════ */

// A bass drum with a peppermint head.
scene('peppermint-drum', {
  kind: 'object',
  frame: 'round',
  pieces: {
    swirl: [[180, 110], [270, 140], [260, 240], [180, 230]],
    hoop: [[30, 190], [80, 170], [90, 300], [36, 320]],
    lugs: [[240, 330], [320, 290], [330, 380], [250, 400]],
  },
  draw: (K) => {
    let s = fillD(circ(CX, 230, 150), INK) + fillD(circ(CX, 230, 150), `url(#${K.u}-k3)`) + pen(circ(CX, 230, 150), 1.6)
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      const x = CX + Math.cos(a) * 146
      const y = 230 + Math.sin(a) * 146
      s += K.shape([[x - 6, y - 10], [x + 6, y - 10], [x + 6, y + 10], [x - 6, y + 10]].map(([px, py]) => [x + (px - x) * Math.cos(a) - (py - y) * Math.sin(a), y + (px - x) * Math.sin(a) + (py - y) * Math.cos(a)]), { tone: 0, sharp: true, line: 1 })
    }
    s += peppermint(K, CX, 230, 128, { n: 12 })
    s += pen('M92 360L60 440M268 360L300 440', 4) + pen('M150 380L150 440L210 440L210 380', 2)
    return s
  },
})

// A stomp pedal with a treadle, a knob and its cable.
scene('pedal', {
  kind: 'object',
  frame: 'rect',
  pieces: {
    treadle: [[90, 80], [270, 80], [276, 220], [84, 220]],
    knob: [[90, 250], [170, 250], [170, 320], [90, 320]],
    cable: [[250, 300], [340, 300], [340, 440], [250, 440]],
  },
  draw: (K) => {
    let s = pen(spline([[270, 380], [316, 390], [330, 430], [290, 450], [240, 440], [200, 460], [150, 450]], false), 6) + pen(spline([[270, 380], [316, 390], [330, 430], [290, 450], [240, 440], [200, 460], [150, 450]], false), 2, { stroke: PAPER, opacity: 0.6 })
    s += K.shape([[70, 60], [290, 60], [304, 400], [56, 400]], { tone: 4, sharp: true, line: 1.6 })
    s += K.shape([[92, 76], [268, 76], [276, 232], [84, 232]], { tone: 1, sharp: true, line: 1.2 })
    let grip = ''
    for (let y = 90; y < 226; y += 10) grip += `M${P(100, y)}H270`
    s += pen(grip, 1.4)
    for (const x of [130, 230]) s += fillD(circ(x, 286, 22), PAPER) + pen(circ(x, 286, 22), 1.4) + pen(`M${P(x, 286)}L${P(x + 10, 268)}`, 2.4)
    s += fillD(circ(180, 350, 16), PAPER) + pen(circ(180, 350, 16), 1.4) + fillD(circ(180, 250, 5), PAPER)
    return s
  },
})

// A page of notation: an invented riff, in eighths.
scene('riff', {
  kind: 'object',
  frame: 'oval',
  pieces: {
    bar1: [[70, 90], [290, 86], [294, 150], [66, 154]],
    notes: [[120, 176], [280, 172], [284, 236], [116, 240]],
    bar4: [[66, 350], [230, 346], [234, 410], [62, 414]],
  },
  draw: (K) => page(K, { tilt: 2 }) + pen('M72 58H220', 4) + staves(K, 41) + '</g>',
})

/* ══ THE BOB DYLAN WINDOW ══════════════════════════════════════════════ */

// A harmonica in its neck rack.
scene('harmonica', {
  kind: 'object',
  frame: 'oval',
  pieces: {
    left: [[60, 150], [170, 150], [170, 230], [60, 230]],
    right: [[190, 150], [300, 150], [300, 230], [190, 230]],
    wire: [[40, 260], [120, 260], [120, 420], [40, 420]],
  },
  draw: (K) => {
    let s = pen('M70 190L70 300Q70 420 180 420Q290 420 290 300L290 190', 5) + pen('M70 190L70 300Q70 420 180 420Q290 420 290 300L290 190', 1.6, { stroke: PAPER, opacity: 0.6 })
    s += pen('M50 190H310', 3)
    s += K.shape([[56, 160], [304, 160], [304, 222], [56, 222]], { tone: 1, sharp: true, line: 1.6 })
    s += K.shape([[56, 180], [304, 180], [304, 202], [56, 202]], { tone: 4, sharp: true, line: 1 })
    for (let i = 0; i < 10; i++) s += fillD(closedD([[70 + i * 23.4, 184], [82 + i * 23.4, 184], [82 + i * 23.4, 198], [70 + i * 23.4, 198]]), PAPER)
    for (const x of [70, 290]) s += fillD(circ(x, 250, 8), PAPER) + pen(circ(x, 250, 8), 1.4)
    return s
  },
})

// A page of fingerpicking: the thumb on the bass, fingers above, all invented.
scene('fingerpicking', {
  kind: 'object',
  frame: 'rect',
  pieces: {
    row1: [[60, 80], [300, 76], [304, 166], [58, 170]],
    row3: [[60, 260], [300, 256], [304, 346], [58, 350]],
    corner: [[40, 360], [150, 360], [150, 440], [40, 440]],
  },
  draw: (K) => page(K, { tilt: 1.5 }) + pen('M72 58H180', 4) + tab(K, 57, { pick: true }) + '</g>',
})

// The acoustic guitar, standing.
scene('acoustic', {
  kind: 'object',
  frame: 'arch',
  pieces: {
    headstock: [[140, 20], [220, 20], [220, 120], [140, 120]],
    rosette: [[130, 230], [230, 230], [230, 330], [130, 330]],
    bridge: [[120, 370], [240, 370], [240, 420], [120, 420]],
  },
  draw: (K) => acousticStanding(K, { y: 300, s: 1.1 }),
})

// A notebook page: scribbled lines, crossings-out, no words anyone could read.
scene('notebook', {
  kind: 'object',
  frame: 'oval',
  pieces: {
    top: [[80, 70], [290, 70], [290, 150], [80, 150]],
    mid: [[70, 200], [300, 200], [300, 280], [70, 280]],
    low: [[90, 320], [260, 320], [260, 400], [90, 400]],
  },
  draw: (K) => {
    let s = page(K, { x: 60, y: 40, w: 240, h: 390, tilt: -3 })
    let rules = ''
    for (let y = 80; y < 420; y += 20) rules += `M${P(64, y)}H296`
    s += pen(rules, 0.7, { stroke: GREEN }) + pen('M100 44V426', 1, { stroke: GREEN })
    let rings = ''
    for (let y = 60; y < 420; y += 26) rings += circ(64, y, 5)
    s += pen(rings, 1.4)
    const rand = seq(91)
    let ink = ''
    let cross = ''
    for (let y = 76; y < 416; y += 20) {
      let x = 108
      const end = 180 + rand() * 110
      const pts = []
      while (x < end) {
        pts.push([x, y - 3 - rand() * 7])
        x += 3 + rand() * 4
        pts.push([x, y - rand() * 2])
        x += 2 + rand() * 3
      }
      ink += polyD([pts])
      if (rand() < 0.2) cross += `M${P(108, y - 5)}L${P(end, y - 4)}`
    }
    s += pen(ink, 1) + pen(cross, 2.2)
    return s + '</g>'
  },
})

/* ══ ON THE WALL ═══════════════════════════════════════════════════════
 *
 * Hung between the portraits. Their pieces are cut for them (piecesOf).
 */
scene('electric', { kind: 'object', frame: 'rect', draw: (K) => electricStanding(K, { y: 330, s: 1.05 }) })
scene('parlour', { kind: 'object', frame: 'oval', draw: (K) => acousticStanding(K, { y: 290, s: 1, tone: 1 }) })

scene('snare', {
  kind: 'object',
  frame: 'round',
  draw: (K) => {
    let s = K.shape([[60, 200], [300, 200], [300, 300], [60, 300]], { tone: 3, sharp: true, line: 1.4 })
    s += fillD(ellipse(CX, 300, 120, 34), INK) + pen(ellipse(CX, 300, 120, 34), 1.4)
    s += fillD(ellipse(CX, 200, 120, 34), PAPER) + pen(ellipse(CX, 200, 120, 34), 1.6) + pen(ellipse(CX, 200, 108, 28), 0.8)
    for (let i = 0; i < 7; i++) s += K.shape([[76 + i * 35, 222], [88 + i * 35, 222], [88 + i * 35, 278], [76 + i * 35, 278]], { tone: 0, sharp: true, line: 0.9 })
    s += pen('M90 120L260 230M270 120L100 230', 5) + pen('M91 121L259 229M269 121L101 229', 2, { stroke: PAPER })
    s += pen('M120 320L90 440M240 320L270 440M180 330L180 440', 3)
    return s
  },
})

scene('microphone', {
  kind: 'object',
  frame: 'arch',
  draw: (K) => {
    let s = oldMic(K, CX, 140, 3)
    s += pen(`M${P(110, 440)}L${P(250, 440)}`, 6)
    return s
  },
})

scene('record', {
  kind: 'object',
  frame: 'rect',
  draw: (K) => {
    let s = K.shape([[40, 70], [260, 70], [260, 390], [40, 390]], { tone: 2, sharp: true, line: 1.4 })
    s += fillD(circ(200, 230, 140), INK) + pen(circ(200, 230, 140), 1.4)
    let g = ''
    for (let rr = 60; rr < 136; rr += 5) g += circ(200, 230, rr)
    s += pen(g, 0.5, { stroke: PAPER, opacity: 0.45 })
    s += fillD(circ(200, 230, 46), PAPER) + fillD(circ(200, 230, 46), `url(#${K.u}-g1)`) + pen(circ(200, 230, 46), 1.2) + fillD(circ(200, 230, 5), INK)
    s += pen('M140 180A80 80 0 0 1 250 160', 3, { stroke: PAPER, opacity: 0.35 })
    return s
  },
})

scene('score', { kind: 'object', frame: 'oval', draw: (K) => page(K, { tilt: -1.5 }) + pen('M72 58H180', 4) + staves(K, 63) + '</g>' })
scene('tabpage', { kind: 'object', frame: 'rect', draw: (K) => page(K, { tilt: 2.5 }) + pen('M72 58H210', 4) + tab(K, 71) + '</g>' })

scene('metronome', {
  kind: 'object',
  frame: 'arch',
  draw: (K) => {
    let s = K.shape([[140, 70], [220, 70], [290, 420], [70, 420]], { tone: 4, sharp: true, line: 1.6 })
    s += K.shape([[150, 100], [210, 100], [250, 320], [110, 320]], { tone: 0, sharp: true, line: 1.2 })
    let ticks = ''
    for (let y = 120; y < 310; y += 14) ticks += `M${P(170, y)}H190`
    s += pen(ticks, 0.8)
    s += pen('M180 360L230 110', 3) + K.shape([[214, 180], [240, 186], [236, 206], [210, 200]], { tone: 3, sharp: true, line: 1 })
    s += K.shape([[70, 420], [290, 420], [296, 440], [64, 440]], { tone: 1, sharp: true, line: 1.2 })
    return s
  },
})

scene('cassette', {
  kind: 'object',
  frame: 'round',
  draw: (K) => {
    let s = pen(spline([[140, 300], [120, 360], [180, 380], [230, 350], [200, 420], [270, 430]], false), 2.4)
    s += K.shape([[50, 150], [310, 150], [310, 310], [50, 310]], { tone: 4, sharp: true, line: 1.6 })
    s += K.shape([[70, 166], [290, 166], [290, 230], [70, 230]], { tone: 0, sharp: true, line: 1 })
    s += pen('M84 184H250M84 200H210', 1)
    for (const x of [130, 230]) s += fillD(circ(x, 264, 22), PAPER) + pen(circ(x, 264, 22), 1.2) + pen(circ(x, 264, 8), 2)
    s += K.shape([[110, 290], [250, 290], [240, 310], [120, 310]], { tone: 1, sharp: true, line: 1 })
    return s
  },
})

scene('keys', {
  kind: 'object',
  frame: 'oval',
  draw: (K) => {
    let s = `<g transform="rotate(-18 180 230)">` + K.shape([[20, 150], [340, 150], [340, 320], [20, 320]], { tone: 0, sharp: true, line: 1.6 })
    for (let i = 0; i <= 14; i++) s += pen(`M${P(20 + i * 22.8, 150)}V320`, 1)
    for (let i = 0; i < 14; i++) if ([0, 1, 3, 4, 5].includes(i % 7)) s += fillD(closedD([[20 + i * 22.8 + 15, 150], [20 + i * 22.8 + 30, 150], [20 + i * 22.8 + 30, 256], [20 + i * 22.8 + 15, 256]]), INK)
    return s + '</g>'
  },
})

scene('amp', {
  kind: 'object',
  frame: 'rect',
  draw: (K) => {
    let s = K.shape([[40, 110], [320, 110], [320, 400], [40, 400]], { tone: 4, sharp: true, line: 1.6 })
    s += K.shape([[62, 170], [298, 170], [298, 380], [62, 380]], { tone: 2, sharp: true, line: 1.2 })
    let weave = ''
    for (let y = 180; y < 376; y += 8) weave += `M${P(64, y)}H296`
    s += pen(weave, 0.6, { stroke: PAPER, opacity: 0.5 })
    for (let i = 0; i < 6; i++) s += fillD(circ(80 + i * 40, 140, 9), PAPER) + pen(circ(80 + i * 40, 140, 9), 1)
    s += pen('M150 96Q180 70 210 96', 5)
    return s
  },
})

/** An anchor with a rope round it: the one thing on the wall nobody took from anyone. */
scene('anchor', {
  kind: 'object',
  frame: 'oval',
  pieces: { whole: [[14, 34], [346, 30], [350, 444], [10, 446]] },
  draw: (K) => {
    let s = fillD(circ(CX, 80, 30), INK) + fillD(circ(CX, 80, 15), PAPER) + pen(circ(CX, 80, 30), 1.4)
    s += K.shape([[96, 128], [264, 128], [264, 150], [96, 150]], { tone: 4, sharp: true, line: 1.2 })
    s += K.shape([[166, 108], [194, 108], [196, 390], [164, 390]], { tone: 4, sharp: true, line: 1.2 })
    const arcPts = (R, a0, a1) => Array.from({ length: 21 }, (_, i) => { const a = a0 + (a1 - a0) * (i / 20); return [CX + Math.cos(a) * R, 280 + Math.sin(a) * R] })
    s += K.shape([...arcPts(138, 0.25, Math.PI - 0.25), ...arcPts(104, Math.PI - 0.3, 0.3)], { tone: 4, sharp: true, line: 1.2 })
    s += K.shape([[40, 300], [22, 236], [92, 290]], { tone: 4, sharp: true, line: 1.2 }) + K.shape([[320, 300], [338, 236], [268, 290]], { tone: 4, sharp: true, line: 1.2 })
    s += pen(spline([[180, 110], [240, 160], [150, 220], [230, 280], [160, 340], [220, 420]], false), 5, { stroke: PAPER }) + pen(spline([[180, 110], [240, 160], [150, 220], [230, 280], [160, 340], [220, 420]], false), 1.2, { extra: ' stroke-dasharray="4 3"' })
    return s
  },
})

/** The sets behind the three windows, in the order the camera sees them. */
export const WINDOWS = {
  zeppelin: ['page', 'doubleneck', 'zep-tab', 'dragon-suit'],
  stripes: ['jack', 'peppermint-drum', 'pedal', 'riff'],
  dylan: ['dylan', 'harmonica', 'acoustic', 'fingerpicking'],
}

/** What hangs on the wall between them. */
export const WALL_OBJECTS = ['electric', 'parlour', 'snare', 'microphone', 'record', 'score', 'tabpage', 'metronome', 'cassette', 'keys', 'amp', 'notebook']

void hash
void RED
void rings3
