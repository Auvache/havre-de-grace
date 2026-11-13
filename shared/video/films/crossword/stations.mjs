/*
 * Ivory · The Crossword — the stations, and how the grid is built (2026-11-13).
 *
 * The film is a list of STATIONS: the camera pans to one (over `pan`, in song
 * seconds), holds still while its few words are written, then pans to the
 * next (the user: "Pan to one area, add a few words, then smoothly pan to the
 * next"). Each station heads the puzzle on by about `step` cells
 * (`headings`), so it crosses the sheet from one side to the other.
 *
 * A word is [WORD, line] (sung: written from its onset in that line of the
 * score) or [WORD, seconds, 'gap'] (an instrumental word, from the next beat).
 * A station's words are listed in the order they go into the grid, which need
 * not be the order they are written (that comes from the lyric).
 * `together`: the station's words overlap in time, so it is one held shot
 * rather than a shot of her name between its other words.
 *
 * The grid is searched for offline (`buildBeam`, scored by `judge`, then
 * `addFill`) by tools/video-styles/crossword/bake-layout.mjs and baked into
 * layout.mjs; the film only reads it. Why it is a search and not a greedy
 * build: docs/visualizers/ivory.md.
 */
export const STATIONS = [
  { step: 0, pan: null, words: [['WOMAN', 0], ['SUNRISE', 1], ['SURE', 0], ['EYES', 1], ['WAVES', 1], ['SHORE', 1]] },
  { step: 10, pan: [19.8, 23.0], words: [['LONGING', 23.1, 'gap'], ['ALMOST', 23.9, 'gap'], ['OCEAN', 2], ['BLUE', 2], ['BUTTERFLY', 2], ['WINGS', 2]] },
  { step: 8, pan: [32.6, 34.8], words: [['STAGE', 3], ['SINGS', 3]] },
  { step: 8, pan: [37.0, 40.2], words: [['IVORY', 4]] },
  { step: 10, pan: [44.0, 46.6], words: [['CALIFORNIA', 5], ['TENNESSEE', 5]] },
  { step: 8, pan: [50.8, 53.3], together: true, words: [['MYSTERY', 6], ['IVORY', 7]] },
  { step: 10, pan: [58.6, 61.8], words: [['STRANGER', 62.0, 'gap'], ['WISTFUL', 63.2, 'gap'], ['FLOWERS', 8], ['HAIR', 8], ['UNIVERSE', 9], ['STOP', 9], ['STARE', 9]] },
  { step: 10, pan: [75.0, 78.2], words: [['ENCORE', 78.6, 'gap'], ['NEARLY', 79.8, 'gap'], ['RIGHT', 10], ['BESIDE', 10], ['WHERE', 10]] },
  { step: 8, pan: [85.9, 87.8], words: [['ASKED', 11], ['NAME', 11], ['LOOKED', 11], ['STRAIGHT', 11]] },
  { step: 8, pan: [92.4, 95.2], words: [['IVORY', 12], ['WANTED', 13], ['PARADISE', 13], ['PLAY', 13], ['MELODY', 13]] },
  { step: 8, pan: [105.8, 109.5], words: [['IVORY', 15]] },
  { step: 10, pan: [113.2, 116.4], words: [['MISSED', 116.6, 'gap'], ['CHANCE', 117.4, 'gap'], ['TOOLATE', 119.4, 'gap'], ['REGRET', 120.2, 'gap'], ['MAYBE', 122.2, 'gap'], ['SOMEDAY', 123.0, 'gap']] },
  { step: 10, pan: [126.0, 129.2], words: [['LOVES', 16], ['ADAM', 16], ['EVE', 16], ['FORGOT', 17], ['BREATHE', 17]] },
  { step: 8, pan: [138.0, 140.8], words: [['IVORY', 18]] },
  { step: 10, pan: [144.6, 147.6], words: [['SOUNDS', 19], ['WALKS', 20], ['ALASKA', 20], ['SNOWFALL', 20], ['TREES', 20]] },
  { step: 8, pan: [160.4, 164.2], words: [['IVORY', 23]] },
  { step: 10, pan: [167.9, 169.9], words: [['GOODBYE', 169.95, 'gap'], ['YEARNING', 169.95, 'gap'], ['IVORY', 24]] },
]

/* World and frame: a cell is 64 units; the plate is 1532 × 776. */
export const CELL = 64
export const PLATE = { w: 1532, h: 776 }
/* The camera's scale for a shot: its words framed at no wider than min (ivoryMin for a shot of her name), at most wideMax, wider only if they will not fit. */
export const SCALE = { min: 1.05, max: 1.5, ivoryMin: 1.25, wideMax: 1.5 }
/* Two IVORYs' middles are at least this far apart (cells) in x, or in y. */
export const IVORY_APART = { x: 13, y: 7 }

export const key = (c, r) => `${c},${r}`

/*
 * The way each station heads: rightwards across the sheet, wandering up and
 * down by as much as 26° (a slow sine over the stations), so the puzzle moves
 * from one side to the other and round about, never back over itself. A
 * station's target is `step` cells that way from where the last station's
 * words actually are, so the path follows however fast the grid really grows.
 */
export function headings() {
  return STATIONS.map((_, k) => {
    const th = 0.45 * Math.sin(k * 0.9 + 0.6)
    return [Math.cos(th), -Math.sin(th)]
  })
}

/** Cells, clue numbers and bounds from a list of entries { word, c, r, down, station }. */
export function assemble(list) {
  const cells = new Map()
  const entries = list.map((e, idx) => {
    const cellsOf = [...e.word].map((ch, i) => [e.c + (e.down ? 0 : i), e.r + (e.down ? i : 0)])
    cellsOf.forEach(([c, r], i) => {
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
  const ivories = new Set(entries.filter((e) => e.word === 'IVORY').flatMap((e) => e.cells.map(([c, r]) => key(c, r))))
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
 * The camera's shots, in order: within a station, each IVORY is its own close
 * shot, and the words either side of it are framed together; a word beside an
 * IVORY joins her shot if the two fit a close frame. { station, entries
 * (indices), ivory, view }.
 */
export function shotsOf(entries) {
  const shots = []
  STATIONS.forEach((st, si) => {
    const mine = entries.map((e, i) => [e, i]).filter(([e]) => e.station === si)
    // A station whose words overlap in time is one held shot (`together`).
    if (st.together) { shots.push({ station: si, entries: mine.map(([, i]) => i), ivory: true }); return }
    let run = []
    const flush = () => { if (run.length) shots.push({ station: si, entries: run, ivory: false }); run = [] }
    for (const [e, i] of mine) {
      if (e.word === 'IVORY') { flush(); shots.push({ station: si, entries: [i], ivory: true }) }
      else run.push(i)
    }
    flush()
  })
  const frame = (idx, ivory) => viewOf(boxOf(idx.flatMap((i) => entries[i].cells), 1.4), ivory ? SCALE.ivoryMin : SCALE.min, ivory ? SCALE.max : SCALE.wideMax)
  // Fold a neighbouring word into her shot when they fit together close.
  for (let k = 0; k < shots.length; k++) {
    const sh = shots[k]
    if (!sh.ivory) continue
    for (const n of [k - 1, k + 1]) {
      const o = shots[n]
      if (!o || o.ivory || o.station !== sh.station) continue
      const both = [...o.entries, ...sh.entries]
      if (frame(both, true).s >= SCALE.ivoryMin) { sh.entries = n < k ? both : [...sh.entries, ...o.entries]; o.entries = [] }
    }
  }
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
  /*
   * Fill the frame: slide it (at most three cells across, one and a half down)
   * to show as many squares as it can while its own words stay two or three
   * cells inside.
   */
  const fill = (view, idx) => {
    const own = idx.flatMap((i) => entries[i].cells)
    const hw = PLATE.w / 2 / view.s / CELL
    const hh = PLATE.h / 2 / view.s / CELL
    let xlo = -Infinity, xhi = Infinity, ylo = -Infinity, yhi = Infinity
    for (const [c, r] of own) {
      xlo = Math.max(xlo, c + 3 - hw); xhi = Math.min(xhi, c - 2 + hw)
      ylo = Math.max(ylo, r + 2 - hh); yhi = Math.min(yhi, r - 1 + hh)
    }
    const x0 = view.x / CELL
    const y0 = view.y / CELL
    let best = { n: -1 }
    for (let dx = -3; dx <= 3; dx += 0.5) {
      const x = x0 + dx
      if (x < xlo || x > xhi) continue
      for (let dy = -1.5; dy <= 1.5; dy += 0.5) {
        const y = y0 + dy
        if (y < ylo || y > yhi) continue
        const n = count(x - hw, y - hh, x + hw, y + hh) - (Math.abs(dx) + Math.abs(dy)) * 2
        if (n > best.n) best = { n, x, y }
      }
    }
    return best.n < 0 ? view : { ...view, x: best.x * CELL, y: best.y * CELL }
  }
  return shots.filter((sh) => sh.entries.length).map((sh) => ({ ...sh, view: fill(frame(sh.entries, sh.ivory), sh.entries) }))
}

/** Whether any of `cells` is (even partly) inside the frame at view v. */
export function inView(v, cells, margin = 0) {
  const hw = PLATE.w / 2 / v.s + margin * CELL
  const hh = PLATE.h / 2 / v.s + margin * CELL
  return cells.some(([c, r]) => Math.abs((c + 0.5) * CELL - v.x) < hw + CELL / 2 && Math.abs((r + 0.5) * CELL - v.y) < hh + CELL / 2)
}

/*
 * The grid as a winding chain, found by beam search. Words go in in the order
 * they are written; each crosses one of the last four words placed (never
 * touching a word side by side), and a partial grid is ranked by how far its
 * front has moved along each station's heading, so about fifty words cover
 * enough sheet for seven IVORYs a screen apart. The `width` best partial
 * grids are kept at every word; `rand` breaks ties so seeds differ. Returns
 * the finished grids (lists of entries), best first.
 */
export function buildBeam(rand, width = 60, noise = 1.5) {
  const H = headings()
  const words = STATIONS.flatMap((st, si) => st.words.map(([w]) => [w, si]))
  const centre = (e) => [e.c + (e.down ? 0.5 : e.word.length / 2), e.r + (e.down ? e.word.length / 2 : 0.5)]

  const fits = (cells, word, c, r, down) => {
    const dc = down ? 0 : 1
    const dr = down ? 1 : 0
    if (cells.has(key(c - dc, r - dr))) return -1
    if (cells.has(key(c + dc * word.length, r + dr * word.length))) return -1
    let crossings = 0
    for (let i = 0; i < word.length; i++) {
      const cc = c + dc * i
      const rr = r + dr * i
      const cell = cells.get(key(cc, rr))
      if (cell) {
        if (cell.ch !== word[i]) return -1
        if (cell[down ? 'down' : 'across'] !== -1) return -1
        crossings++
      }
      else if (cells.has(key(cc + dr, rr + dc)) || cells.has(key(cc - dr, rr - dc))) return -1
    }
    return crossings
  }
  const grow = (state, word, si, c, r, down, score, front) => {
    const cells = new Map(state.cells)
    const idx = state.entries.length
    for (let i = 0; i < word.length; i++) {
      const k = key(c + (down ? 0 : i), r + (down ? i : 0))
      const cell = { ...(cells.get(k) ?? { ch: word[i], across: -1, down: -1 }) }
      cell[down ? 'down' : 'across'] = idx
      cells.set(k, cell)
    }
    return { cells, entries: [...state.entries, { word, c, r, down, station: si }], score, front }
  }

  const [first] = words[0]
  let beam = [grow({ cells: new Map(), entries: [] }, first, 0, 0, 0, false, 0, [first.length, 0.5])]
  for (const [word, si] of words.slice(1)) {
    const [hx, hy] = H[si]
    let next = []
    // Cross one of the last four words; if no grid in the beam can, any word.
    for (const reachBack of [4, Infinity]) {
    if (next.length) break
    for (const st of beam) {
      const n = st.entries.length
      for (let back = n - 1; back >= Math.max(0, n - reachBack); back--) {
        const e = st.entries[back]
        const down = !e.down
        for (let ci = 0; ci < e.word.length; ci++) {
          const cc = e.c + (e.down ? 0 : ci)
          const rr = e.r + (e.down ? ci : 0)
          for (let i = 0; i < word.length; i++) {
            if (word[i] !== e.word[ci]) continue
            const c = cc - (down ? 0 : i)
            const r = rr - (down ? i : 0)
            if (fits(st.cells, word, c, r, down) < 1) continue
            // The furthest square along the heading, and how far that moves the front.
            let far = null
            let reach = -Infinity
            for (let j = 0; j < word.length; j++) {
              const x = c + (down ? 0 : j) + 0.5
              const y = r + (down ? j : 0) + 0.5
              const a = (x - st.front[0]) * hx + (y - st.front[1]) * hy
              if (a > reach) { reach = a; far = [x, y] }
            }
            const me = { word, c, r, down }
            const [mx, my] = centre(me)
            // Off the line the chain is on.
            const off = Math.abs((mx - st.front[0]) * -hy + (my - st.front[1]) * hx)
            let near = 0
            if (word === 'IVORY') {
              for (const o of st.entries) {
                if (o.word !== 'IVORY') continue
                const [ox, oy] = centre(o)
                near += Math.max(0, Math.min(IVORY_APART.x - Math.abs(ox - mx), (IVORY_APART.y - Math.abs(oy - my)) * 2))
              }
            }
            // Between two IVORYs the chain heads away from the last one, so the next has somewhere to go.
            // (Away from all of them: the nearest counts.)
            let away = 0
            const ivs = st.entries.filter((o) => o.word === 'IVORY').map(centre)
            if (ivs.length && word !== 'IVORY') {
              for (let j = 0; j < word.length; j++) {
                const x = c + (down ? 0 : j) + 0.5
                const y = r + (down ? j : 0) + 0.5
                let d = Infinity
                for (const [ox, oy] of ivs) d = Math.min(d, Math.max(Math.abs(x - ox) / IVORY_APART.x, Math.abs(y - oy) / IVORY_APART.y))
                away = Math.max(away, Math.min(1.3, d))
              }
            }
            // Compact: the station's words should fill one frame (about 20 × 9 cells), not spread past it.
            let c0 = c, c1 = c + (down ? 1 : word.length), r0 = r, r1 = r + (down ? word.length : 1)
            for (const o of st.entries) {
              if (o.station !== si) continue
              c0 = Math.min(c0, o.c); c1 = Math.max(c1, o.c + (o.down ? 1 : o.word.length))
              r0 = Math.min(r0, o.r); r1 = Math.max(r1, o.r + (o.down ? o.word.length : 1))
            }
            const spread = Math.max(0, c1 - c0 - 19) + Math.max(0, r1 - r0 - 9) * 2
            const score = st.score + away * 2 + Math.max(reach, -3) * 1.5 - spread * 1.5 - Math.max(0, off - 5) * 0.4 - near * 3 - (back < n - 1 ? 0.6 : 0) + rand() * noise
            if (near > 0) continue
            next.push({ st, word, si, c, r, down, score, front: reach > 0 ? far : st.front })
          }
        }
      }
    }
    }
    if (!next.length) { buildBeam.failed = `${word}@${si}`; return [] }
    next.sort((a, b) => b.score - a.score)
    // Keep the best, but not two that differ only in how they got there.
    const seen = new Set()
    beam = []
    for (const x of next) {
      const sig = `${x.st.entries.length > 1 ? x.st.entries.slice(-2).map((e) => `${e.c},${e.r},${e.down}`).join('|') : ''}|${x.c},${x.r},${x.down}`
      if (seen.has(sig)) continue
      seen.add(sig)
      beam.push(grow(x.st, x.word, x.si, x.c, x.r, x.down, x.score, x.front))
      if (beam.length >= width) break
    }
  }
  return beam.map((b) => b.entries)
}

/*
 * How good a grid is for this film (lower is better). What it must never do
 * costs 1000 each: two written IVORYs in one frame, held or panning. What it
 * should not do costs less: a station's words not fitting its frame, a pan
 * that hardly moves or one that crosses half the sheet.
 */
export function judge(list) {
  const { entries, cells: cellSet0 } = assemble(list)
  const cellSet = [...cellSet0.keys()]
  const shots = shotsOf(entries)
  let cost = 0
  const notes = []
  const isIvory = (i) => entries[i].word === 'IVORY'
  let written = []
  shots.forEach((sh, k) => {
    const v = sh.view
    const before = written
    written = [...written, ...sh.entries.filter(isIvory)]
    if (v.s < v.want) { cost += (v.want / v.s - 1) * 60; notes.push(`shot ${k} (station ${sh.station}) wide at ${v.s.toFixed(2)}`) }
    // Full: the share of the frame that is puzzle, not bare paper.
    const hw = PLATE.w / 2 / v.s
    const hh = PLATE.h / 2 / v.s
    let inside = 0
    for (const k of cellSet) {
      const [c, r] = k.split(',').map(Number)
      if (Math.abs((c + 0.5) * CELL - v.x) < hw && Math.abs((r + 0.5) * CELL - v.y) < hh) inside++
    }
    const full = (inside * CELL * CELL) / (4 * hw * hh)
    sh.full = full
    if (full < 0.3) { cost += (0.3 - full) * (sh.ivory ? 2000 : 800); notes.push(`shot ${k} (station ${sh.station}) ${Math.round(full * 100)}% full`) }
    // (A square's margin: the film's camera does not move exactly as these samples do.)
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
    const d = Math.hypot(v.x - a.x, v.y - a.y) / CELL
    if (sh.station !== shots[k - 1].station) {
      if (d < 5) cost += (5 - d) * 6
      if (d > 18) cost += (d - 18) ** 2 * 0.6
    }
    for (let q = 0; q < k - 3; q++) {
      if (shots[q].station > sh.station - 3) continue
      const back = Math.hypot(v.x - shots[q].view.x, v.y - shots[q].view.y) / CELL
      if (back < 12) { cost += (12 - back) * 3; if (back < 7) notes.push(`shot ${k} back over shot ${q}`) }
    }
  })
  return { cost, notes }
}

/*
 * Filling the frames (2026-11-13: "I want the screen to be more full
 * always"). The chain that keeps the IVORYs a screen apart is sparse, so once
 * it is found more words are packed into each shot's frame, crossing what is
 * there, until about FULL of the frame is puzzle. They are written while the
 * camera holds on that shot, on beats between the sung words. The pool is the
 * lyric's other words and words of longing and missed chances.
 */
export const FILL_POOL = [
  'OPEN', 'MOVES', 'HELP', 'BACK', 'AVOID', 'HEARTACHE', 'COULD', 'KNOW', 'REMAINS', 'LOOKS', 'WAY', 'ABOUT',
  'ECHO', 'DISTANCE', 'WAITING', 'NEVER', 'FADED', 'PERHAPS', 'ONCE', 'LOST', 'SILENCE', 'WONDER', 'SOMEONE',
  'CROWD', 'SPOTLIGHT', 'CURTAIN', 'LIGHTS', 'NIGHT', 'ALONE', 'HOPE', 'WISH', 'DREAM', 'MEMORY', 'AFTER',
  'EXIT', 'LATE', 'HEART', 'SIGH', 'GLANCE', 'TOMORROW', 'ALWAYS', 'FOREVER', 'AGAIN', 'BEFORE', 'GONE',
  'STAY', 'LEAVE', 'SONG', 'SHOW', 'TICKET', 'APPLAUSE', 'HESITATE', 'UNSAID', 'WHISPER', 'FARAWAY',
  'ROSES', 'STAR', 'MOMENT', 'LINGER', 'HOLD', 'DOOR',
]
export const FULL = 0.4

/** `list` (the chain) plus fill words for writing at `lps` letters a second, each { …, fill: shot index } in the shot that writes it. */
export function addFill(list, lps = 6) {
  const { entries } = assemble(list)
  const shots = shotsOf(entries)
  const cells = new Map()
  for (const k of assemble(list).cells.keys()) cells.set(k, { ...assemble(list).cells.get(k) })
  const used = new Set(list.map((e) => e.word))
  const out = list.map((e) => ({ ...e }))
  const fits = (word, c, r, down) => {
    const dc = down ? 0 : 1
    const dr = down ? 1 : 0
    if (cells.has(key(c - dc, r - dr))) return -1
    if (cells.has(key(c + dc * word.length, r + dr * word.length))) return -1
    let crossings = 0
    for (let i = 0; i < word.length; i++) {
      const cc = c + dc * i
      const rr = r + dr * i
      const cell = cells.get(key(cc, rr))
      if (cell) {
        if (cell.ch !== word[i]) return -1
        if (cell[down ? 'down' : 'across'] !== -1) return -1
        crossings++
      }
      else if (cells.has(key(cc + dr, rr + dc)) || cells.has(key(cc - dr, rr - dc))) return -1
    }
    return crossings
  }
  const box = (v) => {
    const hw = PLATE.w / 2 / v.s / CELL
    const hh = PLATE.h / 2 / v.s / CELL
    const x0 = v.x / CELL - hw
    const y0 = v.y / CELL - hh
    return (c, r) => c >= x0 + 0.4 && c + 1 <= x0 + 2 * hw - 0.4 && r >= y0 + 0.4 && r + 1 <= y0 + 2 * hh - 0.4
  }
  const given = new Map()
  /*
   * How many fill words a station has time for: its hold (from arriving to
   * leaving) less the time its own words take at `lps` letters a second, a
   * word per 1.3 seconds of what is left at six (longer when slower), never
   * more than four.
   */
  const budget = STATIONS.map((st, si) => {
    const arrive = st.pan ? st.pan[1] : 9
    const leave = STATIONS[si + 1]?.pan?.[0] ?? 177
    // (Her name keeps a second either side of it clear.)
    const own = st.words.reduce((t, [w]) => t + w.length / lps + (w === 'IVORY' ? 2 : 0), 0)
    return Math.max(0, Math.min(4, Math.floor((leave - arrive - own) / 1.3)))
  })
  const spent = new Map()
  // Her close shots first: they are the hardest to fill.
  const order = shots.map((sh, k) => k).sort((a, b) => Number(shots[b].ivory) - Number(shots[a].ivory) || a - b)
  const plainStation = (n) => shots[n] && !shots[n].ivory && !STATIONS[shots[n].station].words.some(([w]) => w === 'IVORY')
  order.forEach((k) => {
    const sh = shots[k]
    const v = sh.view
    const hw = PLATE.w / 2 / v.s / CELL
    const hh = PLATE.h / 2 / v.s / CELL
    const x0 = v.x / CELL - hw
    const y0 = v.y / CELL - hh
    /*
     * Nothing else is written while her name is, so a close shot of IVORY is
     * filled with words written after her name in that shot, or in a shot
     * before it (or after) that has them in its frame too.
     */
    // (Only a station without an IVORY of its own: one with her has no hold to spare.)
    // Her close shot writes after her name if it has the time, then a plain station's shot near it.
    const writers = sh.ivory ? [k, ...[k - 1, k - 2, k - 3, k + 1].filter(plainStation)] : [k]
    for (const writer of writers) {
    const mine = box(v)
    const theirs = box(shots[writer].view)
    const inside = (c, r) => mine(c, r) && theirs(c, r)
    const fullness = () => {
      let n = 0
      for (const kk of cells.keys()) {
        const [c, r] = kk.split(',').map(Number)
        if (c + 0.5 > x0 && c + 0.5 < x0 + 2 * hw && r + 0.5 > y0 && r + 0.5 < y0 + 2 * hh) n++
      }
      return n / (4 * hw * hh)
    }
    // Four words a shot at most, counting any it already writes for her shot.
    const st = shots[writer].station
    for (; (spent.get(st) ?? 0) < budget[st] && fullness() < FULL;) {
      let best = null
      for (const word of FILL_POOL) {
        if (used.has(word)) continue
        for (const [kk, cell] of cells) {
          const [cc, rr] = kk.split(',').map(Number)
          if (!inside(cc, rr)) continue
          for (const down of [false, true]) {
            if (cell[down ? 'down' : 'across'] !== -1) continue
            for (let i = 0; i < word.length; i++) {
              if (word[i] !== cell.ch) continue
              const c = cc - (down ? 0 : i)
              const r = rr - (down ? i : 0)
              let all = true
              for (let j = 0; j < word.length && all; j++) all = inside(c + (down ? 0 : j), r + (down ? j : 0))
              if (!all) continue
              const n = fits(word, c, r, down)
              if (n < 1) continue
              // New squares in frame and a bonus for every extra crossing; long words cost time to write.
              const s = Math.min(word.length - n, 6) + n * 1.5 - Math.max(0, word.length - 6) * 0.8
              if (!best || s > best.s) best = { s, word, c, r, down }
            }
          }
        }
      }
      if (!best) break
      const idx = out.length
      for (let j = 0; j < best.word.length; j++) {
        const kk = key(best.c + (best.down ? 0 : j), best.r + (best.down ? j : 0))
        const cell = cells.get(kk) ?? { ch: best.word[j], across: -1, down: -1 }
        cell[best.down ? 'down' : 'across'] = idx
        cells.set(kk, cell)
      }
      used.add(best.word)
      out.push({ word: best.word, c: best.c, r: best.r, down: best.down, station: shots[writer].station, fill: writer })
      given.set(writer, (given.get(writer) ?? 0) + 1)
      spent.set(st, (spent.get(st) ?? 0) + 1)
    }
    }
  })
  // In the order they will be written, shot by shot.
  out.sort((a, b) => (a.fill == null) - (b.fill == null) || (a.fill ?? 0) - (b.fill ?? 0))
  return out
}
