/*
 * The sitters Conman's wall adds to the portraits (shared/video/portraits.mjs):
 * one artist per section, in the same stencil — the hair one angular mass,
 * the face bare paper with nothing but its outline. A haircut and a shirt,
 * never a likeness; no names anywhere on screen.
 *
 *   plant     A huge mane of curls past the shoulders, light (the section's ink); an open shirt.
 *   meg       Long straight dark hair with a heavy fringe cut straight across; a striped top.
 *   mayer     Medium curls, thick on top and over the ears; a dark jacket, an open collar.
 *   hendrix   A big round afro under a patterned headband; a ruffled collar.
 *   newcomer  Whoever comes next: a mess of hair, a guitar neck. The last chorus's red sheets.
 *
 * Plain .mjs, pure, no DOM, no randomness — the album's contract.
 */
import { scene, mane, body, skin, shoulders, ringPts, pen, fillD, circ, P, PW, PH } from './portraits.mjs'
import { PAPER, INK } from './album.mjs'

const CX = PW / 2

scene('plant', {
  kind: 'lead',
  hint: 'A huge mane of light curls past the shoulders, parted in the middle; an open shirt.',
  draw: (K) => {
    let s = mane(K, [[180, 66], [236, 70, 12, 11], [282, 100, 14, 11], [306, 160, 16, 11], [318, 240, 16, 11], [322, 320, 16, 11], [300, 392, 14, 11], [258, 394], [240, 320], [120, 320], [102, 394, 14, 11], [60, 392, 16, 11], [38, 320, 16, 11], [42, 240, 16, 11], [54, 160, 14, 11], [78, 100, 12, 11], [124, 70]], { col: 'green', seed: 401, part: [CX, 74], wave: 2 })
    s += body(K, { w: 140, neckW: 28, tone: 1 })
    s += K.shape([[150, 320], [180, 430], [210, 320]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 196, chinY: 292, neckW: 28 })
    s += mane(K, [[CX, 76], [CX - 6, 104], [130, 150], [122, 230], [126, 336, 12, 10], [100, 326], [94, 226], [104, 140], [130, 96]], { col: 'green', seed: 402, part: [CX, 78] })
    s += mane(K, [[CX, 76], [230, 96], [256, 140], [266, 226], [260, 326, 12, 10], [234, 336], [238, 230], [230, 150], [CX + 6, 104]], { col: 'green', seed: 403, part: [CX, 78] })
    return s
  },
})

scene('meg', {
  kind: 'lead',
  hint: 'Long straight dark hair with a heavy fringe cut straight across; a striped top.',
  draw: (K) => {
    let s = mane(K, [[180, 84], [242, 90], [272, 130], [282, 210], [288, 300], [292, 362, 6, 8], [256, 374], [240, 300], [120, 300], [104, 374, 6, 8], [68, 362], [72, 300], [78, 210], [88, 130], [118, 90]], { seed: 411, part: [CX, 88] })
    s += body(K, { w: 136, neckW: 27, tone: 0 })
    let stripes = ''
    for (let y = 352; y < PH + 20; y += 26) stripes += `M0 ${y}H${PW}V${y + 12}H0Z`
    s += K.within(shoulders({ w: 136, neckW: 27 }), fillD(stripes, INK), true)
    s += skin(K, { eyeY: 202, w: 56, jaw: 50, chinY: 292, chinW: 22, neckW: 27 })
    s += mane(K, [[CX, 90], [238, 98], [252, 134], [254, 182, 4, 7], [106, 182, 4, 7], [108, 134], [122, 98]], { seed: 412, part: [CX, 92] })
    return s
  },
})

scene('mayer', {
  kind: 'lead',
  hint: 'Medium curly hair, thick on top and over the ears; a dark jacket over an open collar.',
  draw: (K) => {
    let s = mane(K, [[180, 64], [232, 68, 10, 9], [268, 96, 11, 9], [286, 142, 11, 9], [286, 194, 10, 9], [272, 238], [262, 204], [250, 156], [110, 156], [98, 204], [88, 238], [74, 194, 10, 9], [74, 142, 11, 9], [92, 96, 11, 9], [128, 68, 10, 9]], { seed: 421, part: [156, 80], wave: 3 })
    s += body(K, { w: 146, neckW: 28, tone: 4 })
    s += K.shape([[148, 322], [166, 380], [180, 356], [194, 380], [212, 322]], { tone: 0, sharp: true })
    s += pen(`M${P(166, 380)}L${P(154, 470)}M${P(194, 380)}L${P(206, 470)}`, 1.6, { stroke: PAPER })
    s += skin(K, { eyeY: 198, chinY: 290, neckW: 28, w: 54 })
    s += mane(K, [[118, 156], [110, 114, 9, 9], [148, 86, 9, 9], [210, 84, 9, 9], [250, 112, 9, 9], [244, 156], [216, 132, 6, 8], [150, 130, 6, 8]], { seed: 422, part: [170, 92], wave: 3 })
    return s
  },
})

scene('hendrix', {
  kind: 'lead',
  hint: 'A big round afro under a patterned headband; a ruffled collar.',
  draw: (K) => {
    let s = mane(K, ringPts(CX, 164, 140, 132, 142, 36, 7, 9), { seed: 431, part: [CX, 150], bulge: 0.2 })
    s += body(K, { w: 150, neckW: 29, tone: 3 })
    // The ruffle: a zigzag of paper at the neck.
    const ruffle = []
    for (let k = 0; k <= 12; k++) ruffle.push([CX - 66 + k * 11, 336 + (k % 2 ? 26 : 0)])
    s += K.shape([[CX - 40, 318], ...ruffle, [CX + 40, 318]], { tone: 0, sharp: true, line: 1.2 })
    s += skin(K, { eyeY: 196, chinY: 292, neckW: 29 })
    s += K.shape([[100, 132], [180, 114], [260, 132], [258, 158], [180, 140], [102, 158]], { tone: 0, sharp: true, line: 1.3 })
    let dots = ''
    for (let k = 0; k < 9; k++) {
      const u = k / 8
      const x = 108 + u * 144
      const y = 142 - Math.sin(Math.PI * u) * 16
      dots += circ(x, y, 3.4)
    }
    s += fillD(dots, INK)
    return s
  },
})

// Whoever comes next: the musician put together from the pile in the last verse, on every sheet of the last chorus.
scene('newcomer', {
  kind: 'lead',
  hint: 'Whoever comes next: a mess of hair, and a guitar neck rising past the right shoulder.',
  draw: (K) => {
    let s = mane(K, ringPts(CX, 166, 106, 108, 98, 30, 12, 10), { col: 'green', seed: 441, part: [CX, 118], bulge: 0.2 })
    s += body(K, { w: 142, neckW: 28, tone: 4 })
    s += K.shape([[276, 470], [312, 150], [330, 150], [300, 470]], { tone: 1, sharp: true, line: 1.4 })
    s += K.shape([[306, 150], [300, 90], [320, 60], [344, 70], [340, 150]], { tone: 3, sharp: true, line: 1.4 })
    s += pen(`M${P(300, 420)}L${P(322, 160)}`, 1)
    s += skin(K, { eyeY: 198, chinY: 290, neckW: 28 })
    s += mane(K, [[112, 160], [116, 112, 10, 9], [180, 90, 10, 9], [244, 112, 10, 9], [248, 160], [214, 136, 8, 8], [146, 136, 8, 8]], { col: 'green', seed: 442, part: [170, 96], wave: 3 })
    return s
  },
})

/** The ids this file adds. Import it by name: a bare side-effect import is dropped by the server build. */
export const WALL_SITTERS = ['plant', 'meg', 'mayer', 'hendrix', 'newcomer']
