/*
 * Ivory · The Crossword — the stations, and how the grid is built
 * (2026-11-13; every word of the lyric since 2026-11-23).
 *
 * The film is a list of STATIONS. A block station is two lines of the lyric
 * (three where an "Oh, Ivory" follows without a breath): the camera pans to it
 * (over `pan`, in song seconds), holds still while every word of those lines
 * is written, then pans on. A `solo` station is a long "Ivory" sung on its
 * own: her name goes into the block before it, and the camera pushes in.
 * `holds`: the block's frame also holds the blank squares of the name that
 * follows it (the butterfly sits on them all through the bridge).
 *
 * The blocks are laid out as a snake, three columns of three (`at` is a
 * block's middle, in cells): up the left, down the middle, up the right. A
 * block's words run along it in the order they are sung (`sweep`: 1 left to
 * right, -1 right to left), so one block ends where the next begins and the
 * whole puzzle, pulled back, is a sheet of the plate's shape.
 *
 * The grid is searched for offline (`buildBeam`, scored by `judge`) by
 * tools/video-styles/crossword/bake-layout.mjs and baked into layout.mjs; the
 * film only reads it. Notes: docs/visualizers/ivory.md.
 */
export const STATIONS = [
  { lines: [0, 1], at: [0, 0], sweep: 1, pan: null },
  { lines: [2, 3], at: [0, -11], sweep: -1, pan: [20.6, 25.6] },
  { lines: [4], solo: true, pan: [38.0, 40.3] },
  { lines: [5, 6, 7], at: [0, -22], sweep: 1, pan: [42.7, 45.6] },
  { lines: [8, 9], at: [23, -22], sweep: 1, pan: [57.8, 63.4] },
  { lines: [10, 11], at: [23, -11], sweep: -1, pan: [75.6, 81.6] },
  { lines: [12], solo: true, pan: [93.0, 95.2] },
  { lines: [13, 14, 15], at: [23, 0], sweep: 1, pan: [97.5, 100.5] },
  // The interlude is the pan: one slow glide, fifteen seconds, with the butterfly (crossword.mjs).
  { lines: [16, 17], at: [46, 0], sweep: 1, pan: [112.4, 127.4], holds: true },
  { lines: [18], solo: true, pan: [138.7, 140.9] },
  /*
   * The last chorus is sung straight through, so the camera moves up a block
   * while it is (`through`): the last words of the block it leaves (`leave`)
   * are kept to the rows nearest the next, and the first words of the block
   * it enters (`enter`) to the rows nearest the last, where both frames and
   * the move between see them. check.mjs is the test.
   */
  { lines: [19, 20], at: [46, -11], sweep: -1, pan: [143.0, 146.2], leave: { words: 4, rows: 4 } },
  { lines: [21, 22, 23], at: [46, -22], sweep: 1, pan: [154.7, 156.7], through: true, enter: { words: 2, rows: 5 } },
  { lines: [24], solo: true, pan: [168.8, 172.4] },
]

const IV = 'IVORY'
/* World and frame: a cell is 64 units; the plate is 1532 × 776. */
export const CELL = 64
export const PLATE = { w: 1532, h: 776 }
/*
 * A block's box, in cells: its two lines are packed into this, and the camera
 * frames it. Flatter than the plate on purpose: a row of spill above or below
 * (where the words that join two blocks go) then costs the frame nothing.
 */
export const BOX = { w: 23, h: 10 }
/* The camera's scale: a block is framed whole, no closer than `block[1]`; a shot of her name alone is closer. */
export const SCALE = { block: [0.9, 1.06], ivory: [1.2, 1.32] }
/* Half of the widest frame a block's shot may take, in cells, and a square to spare: no other written IVORY may be inside it. */
const FRAME = { x: PLATE.w / 2 / 0.86 / CELL + 1, y: PLATE.h / 2 / 0.86 / CELL + 1 }
/* Round her own shot, no other IVORY's middle is nearer than this in both x and y. */
export const IVORY_APART = { x: 15, y: 8.5 }

/* Board left round a block in its frame, in cells. */
const MARGIN = { x: 0.8, y: 0.6 }
/* How far out of its box a word may reach, in cells. */
export const SPILL = { x: 2, y: 1 }
/* The search's weights: how far a word may sit from its place along the block before it costs, what that costs a cell, and what a second crossing is worth. */
export const SWEEP = { slack: 4, dev: 0.5, cross: 2.5 }

export const key = (c, r) => `${c},${r}`
export const clean = (s) => s.replace(/[^a-z]/gi, '').toUpperCase()

/** The block stations, in order. */
const BLOCKS = STATIONS.map((st, si) => (st.solo ? -1 : si)).filter((si) => si >= 0)
/** The block a station's words go into: its own, or for her name alone the block before. */
const blockOf = (si) => (STATIONS[si].solo ? si - 1 : si)
/** A block's box: { x0, x1, y0, y1 } in cells, the far edges exclusive. */
export function boxOfStation(si) {
  const [cx, cy] = STATIONS[blockOf(si)].at
  return { x0: Math.ceil(cx - BOX.w / 2), x1: Math.ceil(cx - BOX.w / 2) + BOX.w, y0: Math.ceil(cy - BOX.h / 2), y1: Math.ceil(cy - BOX.h / 2) + BOX.h }
}

/**
 * Every word he sings, in the order sung: `words` (two letters or more, each
 * an entry in the grid) and `singles` ("a", "I": no crossword has a one-letter
 * word; see `placeSingles`). { word, line, wi, station, t }.
 */
export function wordsOf(score) {
  const words = []
  const singles = []
  STATIONS.forEach((st, si) => {
    for (const li of st.lines) {
      score.lines[li].words.forEach((w, wi) => {
        const word = clean(w.text)
        ;(word.length > 1 ? words : singles).push({ word, line: li, wi, station: si, t: w.t })
      })
    }
  })
  return { words, singles }
}

/** Cells, clue numbers and bounds from a list of entries { word, c, r, down, station }. A one-letter entry is a square on its own. */
export function assemble(list) {
  const cells = new Map()
  const entries = list.map((e, idx) => {
    const cellsOf = [...e.word].map((ch, i) => [e.c + (e.down ? 0 : i), e.r + (e.down ? i : 0)])
    // (A one-letter word that rides on another word's square is that word's letter, not an entry of its own.)
    if (!e.rides) cellsOf.forEach(([c, r], i) => {
      const k = key(c, r)
      const cell = cells.get(k) ?? { ch: e.word[i], across: -1, down: -1 }
      if (cell.ch !== e.word[i]) throw new Error(`crossword: ${e.word} clashes at ${k}`)
      cell[e.down ? 'down' : 'across'] = idx
      cells.set(k, cell)
    })
    return { ...e, cells: cellsOf }
  })
  let c0 = Infinity, c1 = -Infinity, r0 = Infinity, r1 = -Infinity
  for (const k of cells.keys()) {
    const [c, r] = k.split(',').map(Number)
    c0 = Math.min(c0, c); c1 = Math.max(c1, c); r0 = Math.min(r0, r); r1 = Math.max(r1, r)
  }
  const numbers = new Map()
  let n = 0
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const cell = cells.get(key(c, r))
      if (!cell) continue
      const starts = (i) => i !== -1 && entries[i].c === c && entries[i].r === r
      if (starts(cell.across) || starts(cell.down)) numbers.set(key(c, r), ++n)
    }
  }
  const ivories = new Set(entries.filter((e) => e.word === IV).flatMap((e) => e.cells.map(([c, r]) => key(c, r))))
  return { entries, cells, numbers, ivories, bounds: { c0, c1, r0, r1 } }
}

/** A box of cells, padded. */
export function boxOf(cells, pad) {
  let c0 = Infinity, c1 = -Infinity, r0 = Infinity, r1 = -Infinity
  for (const [c, r] of cells) { c0 = Math.min(c0, c); c1 = Math.max(c1, c); r0 = Math.min(r0, r); r1 = Math.max(r1, r) }
  return { c0: c0 - pad, c1: c1 + 1 + pad, r0: r0 - pad, r1: r1 + 1 + pad }
}
/** The view that frames a box: the world point at the plate's middle and the scale (at most sMax). */
export function viewOf(box, sMin, sMax) {
  const w = (box.c1 - box.c0) * CELL
  const h = (box.r1 - box.r0) * CELL
  const fit = Math.min(PLATE.w / w, PLATE.h / h)
  // Never cropped: a box too big for `sMin` is framed whole, wider; `want` keeps what was wanted.
  return { x: ((box.c0 + box.c1) / 2) * CELL, y: ((box.r0 + box.r1) / 2) * CELL, s: Math.min(sMax, fit), fit, want: sMin }
}

/*
 * The camera's shots, in order, one a station: a block framed whole (its
 * words, and her name where it is sung in the same breath), and her name
 * alone, closer. { station, entries (indices), ivory, view }.
 */
export function shotsOf(entries) {
  const shots = []
  STATIONS.forEach((st, si) => {
    const mine = entries.map((e, i) => [e, i]).filter(([e]) => e.station === si).map(([, i]) => i)
    if (mine.length) shots.push({ station: si, entries: mine, ivory: !!st.solo })
  })
  // A count of squares in any rectangle, from a summed-area table, so framing can be searched cheaply.
  let c0 = Infinity, r0 = Infinity, c1 = -Infinity, r1 = -Infinity
  for (const e of entries) for (const [c, r] of e.cells) { c0 = Math.min(c0, c); r0 = Math.min(r0, r); c1 = Math.max(c1, c); r1 = Math.max(r1, r) }
  const W = c1 - c0 + 2
  const Hh = r1 - r0 + 2
  const occ = new Uint8Array(W * Hh)
  for (const e of entries) for (const [c, r] of e.cells) occ[(r - r0 + 1) * W + (c - c0 + 1)] = 1
  const sat = new Int32Array((W + 1) * (Hh + 1))
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) sat[(y + 1) * (W + 1) + x + 1] = occ[y * W + x] + sat[y * (W + 1) + x + 1] + sat[(y + 1) * (W + 1) + x] - sat[y * (W + 1) + x]
  const count = (ca, ra, cb, rb) => {
    const xa = Math.max(0, Math.min(W, Math.floor(ca) - c0 + 1)), xb = Math.max(0, Math.min(W, Math.ceil(cb) - c0 + 1))
    const ya = Math.max(0, Math.min(Hh, Math.floor(ra) - r0 + 1)), yb = Math.max(0, Math.min(Hh, Math.ceil(rb) - r0 + 1))
    return sat[yb * (W + 1) + xb] - sat[ya * (W + 1) + xb] - sat[yb * (W + 1) + xa] + sat[ya * (W + 1) + xa]
  }
  const isIvory = (i) => entries[i].word === IV
  // Whether a square belongs to a word of an earlier station (so it is written before this one's shot).
  const first = new Map()
  for (const e of entries) for (const [c, r] of e.cells) first.set(key(c, r), Math.min(first.get(key(c, r)) ?? Infinity, e.station))
  const earlier = (c, r, si) => first.get(key(c, r)) < si
  /*
   * Her name alone: the frame slides (at most three cells across, one and a
   * half down) to show as many squares as it can while her name stays two or
   * three cells inside, and never onto another IVORY.
   */
  const fill = (view, idx) => {
    const own = idx.flatMap((i) => entries[i].cells)
    const others = entries.filter((e, i) => e.word === IV && !idx.includes(i)).map((e) => e.cells)
    const hw = PLATE.w / 2 / view.s / CELL
    const hh = PLATE.h / 2 / view.s / CELL
    let xlo = -Infinity, xhi = Infinity, ylo = -Infinity, yhi = Infinity
    for (const [c, r] of own) {
      xlo = Math.max(xlo, c + 3 - hw); xhi = Math.min(xhi, c - 2 + hw)
      ylo = Math.max(ylo, r + 2 - hh); yhi = Math.min(yhi, r - 1 + hh)
    }
    const x0 = view.x / CELL
    const y0 = view.y / CELL
    let best = { n: -Infinity }
    for (let dx = -3; dx <= 3; dx += 0.5) {
      const x = x0 + dx
      if (x < xlo || x > xhi) continue
      for (let dy = -1.5; dy <= 1.5; dy += 0.5) {
        const y = y0 + dy
        if (y < ylo || y > yhi) continue
        const seen = others.filter((cs) => inView({ x: x * CELL, y: y * CELL, s: view.s }, cs, 0.6)).length
        const n = count(x - hw, y - hh, x + hw, y + hh) - (Math.abs(dx) + Math.abs(dy)) * 2 - seen * 1000
        if (n > best.n) best = { n, x, y }
      }
    }
    return best.n === -Infinity ? view : { ...view, x: best.x * CELL, y: best.y * CELL }
  }
  return shots.map((sh) => {
    if (sh.ivory) return { ...sh, view: fill(viewOf(boxOf(sh.entries.flatMap((i) => entries[i].cells), 1.4), ...SCALE.ivory), sh.entries) }
    /*
     * A block: every square written in its shot (not the ones a word of an earlier block already
     * wrote), with a little board round them, no closer than `SCALE.block[1]`.
     */
    const held = STATIONS[sh.station].holds ? entries.filter((e) => e.station === sh.station + 1).flatMap((e) => e.cells) : []
    const own = boxOf([...sh.entries.flatMap((i) => entries[i].cells).filter(([c, r]) => !earlier(c, r, sh.station)), ...held], 0)
    const box = { c0: own.c0 - MARGIN.x, c1: own.c1 + MARGIN.x, r0: own.r0 - MARGIN.y, r1: own.r1 + MARGIN.y }
    return { ...sh, ivory: sh.entries.some(isIvory), view: viewOf(box, ...SCALE.block) }
  })
}

/** Whether any of `cells` is (even partly) inside the frame at view v. */
export function inView(v, cells, margin = 0) {
  const hw = PLATE.w / 2 / v.s + margin * CELL
  const hh = PLATE.h / 2 / v.s + margin * CELL
  return cells.some(([c, r]) => Math.abs((c + 0.5) * CELL - v.x) < hw + CELL / 2 && Math.abs((r + 0.5) * CELL - v.y) < hh + CELL / 2)
}

/* ── The search ───────────────────────────────────────────────────── */

/* The search's own grid: flat arrays, so a partial grid is copied in one go. */
const GW = 128
const GH = 96
const OX = 36
const OY = 64
const at = (c, r) => (r + OY) * GW + (c + OX)

/*
 * The grid, searched for block by block (why, and what was tried first:
 * docs/visualizers/ivory.md). Every word crosses a word of its own block (the
 * first few, a word of the block before, which is what joins the blocks),
 * never touching another side by side. A try at a block is ranked by how well
 * it keeps to its box, the scale its frame will need, how its words run along
 * it in the order sung, and how often they cross. Her name is never placed
 * where another block's shot of an IVORY would show it. `keep` grids go on
 * from each block, each given `tries` goes at the next; `rand` makes seeds
 * differ and `noise` roughens the ranking. Returns the finished grids (lists
 * of entries), best first.
 */
export function buildBeam(rand, words, keep = 6, tries = 400, noise = 1) {
  const boxes = STATIONS.map((_, si) => boxOfStation(si))
  const perStation = STATIONS.map((_, si) => words.filter((w) => w.station === si).length)
  // The blocks whose own shot writes an IVORY: no other IVORY may be in their frame.
  const owners = STATIONS.map((st, si) => (!st.solo && words.some((w) => w.station === si && w.word === IV) ? si : -1)).filter((si) => si >= 0)
  const inFrame = (si, x, y) => {
    const [cx, cy] = STATIONS[si].at
    return Math.abs(x - cx) < FRAME.x && Math.abs(y - cy) < FRAME.y
  }

  const inBox = (b, x, y) => x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1
  const fits = (st, word, c, r, down) => {
    const dc = down ? 0 : 1
    const dr = down ? 1 : 0
    if (st.L[at(c - dc, r - dr)]) return -1
    if (st.L[at(c + dc * word.length, r + dr * word.length)]) return -1
    const lane = down ? st.D : st.A
    let crossings = 0
    for (let i = 0; i < word.length; i++) {
      const cc = c + dc * i
      const rr = r + dr * i
      const k = at(cc, rr)
      if (st.L[k]) {
        if (st.L[k] !== word.charCodeAt(i) || lane[k]) return -1
        crossings++
      }
      else if (st.L[at(cc + dr, rr + dc)] || st.L[at(cc - dr, rr - dc)]) return -1
    }
    return crossings
  }
  /*
   * Where word `w` can go in grid `st`: [{ c, r, down, score }]. What it may
   * cross: its own block's words; while the block has few, the block
   * before's; with `wide`, the block after's too; never an IVORY.
   */
  const done = new Map()
  const placements = (st, w, wide) => {
    const si = w.station
    const box = boxes[si]
    const st0 = STATIONS[si]
    const hers = w.word === IV
    // Where along the block this word belongs, by the order sung.
    const f = (w.j + 0.5) / perStation[si]
    const xt = STATIONS[blockOf(si)].sweep > 0 ? box.x0 + f * BOX.w : box.x1 - f * BOX.w
    const blk = blockOf(si)
    const pos = BLOCKS.indexOf(blk)
    const before = BLOCKS[pos - 1]
    const after = BLOCKS[pos + 1]
    const link = wide || st.entries.filter((e) => blockOf(e.station) === blk).length < 3
    const hosts = []
    for (let i = st.entries.length - 1; i >= 0; i--) {
      const e = st.entries[i]
      if (e.word === IV) continue
      const b = blockOf(e.station)
      if (b === blk || (link && b === before) || (wide && b === after)) hosts.push(e)
    }
    const found = []
    done.clear()
    for (const e of hosts) {
      const down = !e.down
      for (let ci = 0; ci < e.word.length; ci++) {
        const cc = e.c + (e.down ? 0 : ci)
        const rr = e.r + (e.down ? ci : 0)
        for (let i = 0; i < w.word.length; i++) {
          if (w.word[i] !== e.word[ci]) continue
          const c = cc - (down ? 0 : i)
          const r = rr - (down ? i : 0)
          const sig = (r + OY) * GW * 2 + (c + OX) * 2 + (down ? 1 : 0)
          if (done.has(sig)) continue
          done.set(sig, 1)
          const crossings = fits(st, w.word, c, r, down)
          if (crossings < 1) continue
          const mx = c + (down ? 0.5 : w.word.length / 2)
          const my = r + (down ? w.word.length / 2 : 0.5)
          if (hers) {
            // Never in the frame of another block that writes an IVORY, nor near one already placed.
            let bad = false
            for (const o of owners) if (o !== si && o !== blockOf(si) && inFrame(o, mx, my)) bad = true
            for (const o of st.entries) {
              if (o.word !== IV) continue
              const ox = o.c + (o.down ? 0.5 : 2.5)
              const oy = o.r + (o.down ? 2.5 : 0.5)
              if (Math.abs(ox - mx) < IVORY_APART.x && Math.abs(oy - my) < IVORY_APART.y) bad = true
              if (!st0.solo && inFrame(si, ox, oy)) bad = true
            }
            if (bad) continue
          }
          // Out of its box, by how far.
          let out = 0
          let far = false
          for (let q = 0; q < w.word.length; q++) {
            const x = c + (down ? 0 : q)
            const y = r + (down ? q : 0)
            // (A square it crosses is already written, wherever it is.)
            if (st.L[at(x, y)]) continue
            const ox = Math.max(box.x0 - x, 0, x - (box.x1 - 1))
            const oy = Math.max(box.y0 - y, 0, y - (box.y1 - 1))
            // (A word that joins two blocks may start a little inside the one before.)
            const joins = (link && before != null && inBox(boxes[before], x, y)) || (wide && after != null && inBox(boxes[after], x, y))
            if (ox > SPILL.x + (joins ? 2 : 0) || oy > SPILL.y + (joins ? 2 : 0)) far = true
            out += ox + oy * 1.5
          }
          // Never far out of its box: the camera frames the block whole.
          if (far) continue
          const dev = hers ? 0 : Math.max(0, Math.abs(mx - xt) - SWEEP.slack)
          // Sung while the camera is moving to or from the next block: kept to the rows nearest it.
          let edge = false
          for (let q = 0; q < w.word.length; q++) {
            const y = r + (down ? q : 0)
            if (st.L[at(c + (down ? 0 : q), y)]) continue
            if (st0.leave && w.j >= perStation[si] - st0.leave.words && y >= box.y0 + st0.leave.rows) edge = true
            if (st0.enter && w.j < st0.enter.words && y < box.y1 - st0.enter.rows) edge = true
          }
          if (edge) continue
          found.push({ c, r, down, score: st.score + (crossings - 1) * SWEEP.cross - out * 3 - dev * SWEEP.dev + rand() * noise })
        }
      }
    }
    return found
  }
  /*
   * One block, tried once: its words go in in a shuffled order that leans
   * long-first (the long words are its frame), each taking one of its best
   * few places. A word with nowhere to go waits for the others, and at the
   * last may cross the blocks either side (`wide`). Null if a word is left
   * over. The order words go in is the search's own, not the song's: where a
   * word sits along its block still follows the order sung (`j`).
   */
  const attempt = (from, mine, seedFirst, last) => {
    const st = { L: from.L.slice(), A: from.A.slice(), D: from.D.slice(), entries: from.entries.slice(), score: from.score }
    const put = (w, p) => {
      for (let i = 0; i < w.word.length; i++) {
        const k = at(p.c + (p.down ? 0 : i), p.r + (p.down ? i : 0))
        st.L[k] = w.word.charCodeAt(i)
        ;(p.down ? st.D : st.A)[k] = 1
      }
      st.entries.push({ word: w.word, c: p.c, r: p.r, down: p.down, station: w.station, line: w.line, wi: w.wi })
      st.score = p.score
    }
    const order = mine.map((w) => [w, -w.word.length + rand() * 3.5]).sort((x, y) => x[1] - y[1]).map(([w]) => w)
    if (seedFirst) {
      // The very first word: where it belongs along the block, on any row.
      const first = order.shift()
      const b0 = boxes[first.station]
      const c = Math.round(b0.x0 + ((first.j + 0.5) / perStation[first.station]) * BOX.w - first.word.length / 2)
      put(first, { c, r: b0.y0 + 1 + Math.floor(rand() * (BOX.h - 2)), down: false, score: 0 })
    }
    const tryPut = (w, wide) => {
      const found = placements(st, w, wide)
      if (!found.length) return false
      found.sort((x, y) => y.score - x.score)
      // One of the best few: those within a few points of the best.
      let n = 1
      while (n < 4 && n < found.length && found[n].score > found[0].score - 3) n++
      put(w, found[Math.floor(rand() * n)])
      return true
    }
    // Words carried over from the block before (they share no letter with it, or were boxed out) go in as they can.
    let waiting = from.carry ?? []
    for (const w of order) {
      if (!tryPut(w, false)) { waiting = [...waiting, w]; continue }
      // Whoever was waiting may have somewhere to go now.
      for (let moved = true; moved && waiting.length;) {
        moved = false
        for (const p of waiting) if (tryPut(p, blockOf(p.station) !== blockOf(w.station))) { waiting = waiting.filter((o) => o !== p); moved = true; break }
      }
    }
    for (let moved = true; moved && waiting.length;) {
      moved = false
      for (const p of waiting) if (tryPut(p, true)) { waiting = waiting.filter((o) => o !== p); moved = true; break }
    }
    // At most two may wait for the next block, and none that has waited already.
    if (waiting.length > (last ? 0 : 2) || waiting.some((w) => w.word === IV || from.carry?.includes(w))) { attempt.left = waiting; return null }
    st.carry = waiting
    st.score -= waiting.length * 150
    return st
  }

  /*
   * Block by block: every grid kept so far is given `tries` goes at the next
   * block, and the `keep` best whole blocks go on (no more than a third of
   * them from one parent).
   */
  words = words.map((w, n) => ({ ...w, j: words.slice(0, n).filter((o) => o.station === w.station).length }))
  /*
   * How many letters a block has along the side the next block is on (the two
   * rows or three columns nearest it): the next block's first words have to
   * cross one of them, and the more there are, the less far they must reach.
   */
  const ports = (st, blk) => {
    const nb = BLOCKS[BLOCKS.indexOf(blk) + 1]
    if (nb == null) return 0
    const b = boxes[blk]
    const dx = STATIONS[nb].at[0] - STATIONS[blk].at[0]
    const dy = STATIONS[nb].at[1] - STATIONS[blk].at[1]
    let x0 = b.x0, x1 = b.x1, y0 = b.y0, y1 = b.y1
    if (dy < 0) y1 = y0 + 2
    else if (dy > 0) y0 = y1 - 2
    else if (dx > 0) x0 = x1 - 3
    else x1 = x0 + 3
    let n = 0
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (st.L[at(x, y)]) n++
    return Math.min(n, 10)
  }
  const start = { L: new Uint8Array(GW * GH), A: new Uint8Array(GW * GH), D: new Uint8Array(GW * GH), entries: [], score: 0 }
  const levels = [[start]]
  let redone = 0
  for (let bi = 0; bi < BLOCKS.length; bi++) {
    const blk = BLOCKS[bi]
    const level = levels[bi]
    const mine = words.filter((w) => blockOf(w.station) === blk)
    const made = []
    let failed = 0
    // (A hard block gets up to four times the goes.)
    for (let pass = 0; pass < 4 && made.length < 40; pass++) level.forEach((from, pi) => {
      for (let t = 0; t < tries; t++) {
        const st = attempt(from, mine, blk === BLOCKS[0], blk === BLOCKS.at(-1))
        if (!st) { failed++; continue }
        // What the camera will make of it: how far out the block's frame has to be to hold every square written in it.
        const added = st.entries.slice(from.entries.length)
        for (const si of new Set(added.filter((e) => !STATIONS[e.station].solo).map((e) => e.station))) {
          let c0 = Infinity, c1 = -Infinity, r0 = Infinity, r1 = -Infinity
          for (const e of added) {
            if (e.station !== si && !(STATIONS[si].holds && e.station === si + 1)) continue
            for (let q = 0; q < e.word.length; q++) {
              const x = e.c + (e.down ? 0 : q)
              const y = e.r + (e.down ? q : 0)
              if (from.L[at(x, y)]) continue
              c0 = Math.min(c0, x); c1 = Math.max(c1, x + 1); r0 = Math.min(r0, y); r1 = Math.max(r1, y + 1)
            }
          }
          const fit = Math.min(SCALE.block[1], PLATE.w / ((c1 - c0 + MARGIN.x * 2) * CELL), PLATE.h / ((r1 - r0 + MARGIN.y * 2) * CELL))
          st.score -= (SCALE.block[1] / fit - 1) * 1000
        }
        st.score += ports(st, blk) * 5
        made.push({ st, pi })
      }
    })
    if (buildBeam.trace) console.log('block', blk, 'made', made.length, 'failed', failed, 'best', made.length ? Math.max(...made.map((x) => x.st.score - level[x.pi].score)).toFixed(1) : '-', 'left', attempt.left?.map((w) => w.word).join(','))
    if (!made.length) {
      // Nothing joins on to any grid kept: build the block before again (other grids come of it), a few times at most.
      if (bi === 0 || ++redone > 8) { buildBeam.failed = `block ${blk}: ${attempt.left.map((w) => w.word).join(' ')}`; return [] }
      bi -= 2
      continue
    }
    made.sort((x, y) => y.st.score - x.st.score)
    const per = new Map()
    const kept = []
    for (const x of made) {
      const n = per.get(x.pi) ?? 0
      if (n >= Math.max(1, Math.ceil(keep / 3))) continue
      per.set(x.pi, n + 1)
      kept.push(x.st)
      if (kept.length >= keep) break
    }
    levels[bi + 1] = kept
  }
  const level = levels[BLOCKS.length]
  return level.map((st) => st.entries)
}

/*
 * The one-letter words ("a", "I"). No crossword has a one-letter entry, so
 * each is written the way a solver gets a letter early: into a square of a
 * word sung soon after it in the same block, which that word then writes
 * round. Where no later word has the letter (the bridge has no I at all), it
 * is a square on its own, beside the word sung next. Returns the entries to
 * add: { word, c, r, down: false, station, line, wi, rides } (`rides`: on
 * another word's square).
 */
export function placeSingles(list, singles, timeOf) {
  const { entries, cells, ivories } = assemble(list)
  const taken = new Set()
  const out = []
  for (const s of singles) {
    let best = null
    for (const e of entries) {
      if (e.station !== s.station || e.word === IV) continue
      const t0 = timeOf(e)
      if (t0 <= s.t) continue
      e.cells.forEach(([c, r], i) => {
        const k = key(c, r)
        if (e.word[i] !== s.word || taken.has(k) || ivories.has(k)) return
        // Not a square a word sung earlier has already written.
        const cell = cells.get(k)
        const other = cell.across === entries.indexOf(e) ? cell.down : cell.across
        if (other !== -1 && timeOf(entries[other]) <= s.t) return
        if (!best || t0 < best.t0) best = { t0, c, r, k }
      })
    }
    if (best) { taken.add(best.k); out.push({ word: s.word, c: best.c, r: best.r, down: false, station: s.station, line: s.line, wi: s.wi, rides: true }); continue }
    // A square on its own: touching nothing, as near the next word sung as it can be.
    const nextWord = entries.filter((e) => e.station === s.station && timeOf(e) > s.t).sort((a, b) => timeOf(a) - timeOf(b))[0] ?? entries.findLast((e) => e.station === s.station)
    // (Inside what the block's words already span, so the camera's frame does not change for it.)
    const span = boxOf(entries.filter((e) => e.station === s.station).flatMap((e) => e.cells), 0)
    const all = new Set([...cells.keys(), ...out.filter((o) => !o.rides).map((o) => key(o.c, o.r))])
    let spot = null
    for (let r = span.r0; r < span.r1; r++) {
      for (let c = span.c0; c < span.c1; c++) {
        if ([[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dc, dr]) => all.has(key(c + dc, r + dr)))) continue
        const d = Math.hypot(c - nextWord.c, r - nextWord.r)
        if (!spot || d < spot.d) spot = { d, c, r }
      }
    }
    if (!spot) throw new Error(`crossword: nowhere for "${s.word}" of line ${s.line}`)
    out.push({ word: s.word, c: spot.c, r: spot.r, down: false, station: s.station, line: s.line, wi: s.wi, rides: false })
  }
  return out
}

/*
 * How good a grid is for this film (lower is better). What it must never do
 * costs 1000 each: two written IVORYs in one frame, held or panning. What it
 * should not do costs less: a block that will not fit its frame, a frame
 * that is mostly bare board.
 */
export function judge(list) {
  const { entries, cells: cellSet0 } = assemble(list)
  const cellSet = [...cellSet0.keys()]
  const shots = shotsOf(entries)
  let cost = 0
  const notes = []
  const isIvory = (i) => entries[i].word === IV
  let written = []
  shots.forEach((sh, k) => {
    const v = sh.view
    const before = written
    written = [...written, ...sh.entries.filter(isIvory)]
    if (v.s < SCALE.block[1] - 0.001 && !STATIONS[sh.station].solo) { cost += (SCALE.block[1] / v.s - 1) ** 2 * 20000; if (v.s < v.want) notes.push(`shot ${k} (station ${sh.station}) wide at ${v.s.toFixed(2)}`) }
    // Full: the share of the frame that is puzzle, not bare board.
    const hw = PLATE.w / 2 / v.s
    const hh = PLATE.h / 2 / v.s
    let inside = 0
    for (const kk of cellSet) {
      const [c, r] = kk.split(',').map(Number)
      if (Math.abs((c + 0.5) * CELL - v.x) < hw && Math.abs((r + 0.5) * CELL - v.y) < hh) inside++
    }
    sh.full = (inside * CELL * CELL) / (4 * hw * hh)
    // (Half a square's margin: the film's camera does not move exactly as these samples do.)
    const seen = written.filter((i) => inView(v, entries[i].cells, 0.5))
    if (seen.length > 1) { cost += 1000; notes.push(`shot ${k} (station ${sh.station}) shows ${seen.length} IVORYs`) }
    if (k === 0) return
    // The move in, with the IVORYs written before it.
    const a = shots[k - 1].view
    for (let q = 1; q < 20; q++) {
      const u = q / 20
      const p = { x: a.x + (v.x - a.x) * u, y: a.y + (v.y - a.y) * u, s: Math.exp(Math.log(a.s) + (Math.log(v.s) - Math.log(a.s)) * u) }
      const pseen = before.filter((i) => inView(p, entries[i].cells, 0.5))
      if (pseen.length > 1) { cost += 1000; notes.push(`move into shot ${k} (station ${sh.station}) shows ${pseen.length} IVORYs`); break }
    }
  })
  // Crossings make it a crossword: a word that crosses only once is a spur.
  let spurs = 0
  entries.forEach((e, i) => {
    let n = 0
    for (const [c, r] of e.cells) { const cell = cellSet0.get(key(c, r)); if (cell.across !== -1 && cell.down !== -1) n++ }
    if (n < 2 && e.word.length > 3) spurs++
    void i
  })
  cost += spurs * 1.5
  return { cost, notes, spurs }
}
