/*
 * Ivory · The Crossword — the stations, and how the grid is built (2026-11-13).
 *
 * The film is a list of STATIONS: the camera pans to one (over `pan`, in song
 * seconds), holds still while its few words are written, then pans to the
 * next (the user: "Pan to one area, add a few words, then smoothly pan to the
 * next"). Each station heads the puzzle on by about `step` cells
 * (`headings`), so it crosses the sheet from one side to the other.
 *
 * A word is [WORD, line]: sung, written from its onset in that line of the
 * score. Only sung words go in (the user, 2026-11-13: the unsung ones came
 * off), and in the interlude, her name jumbled (`jumble`).
 * A station's words are listed in the order they go into the grid, which need
 * not be the order they are written (that comes from the lyric).
 * `together`: the station's words overlap in time, so it is one held shot
 * rather than a shot of her name between its other words.
 *
 * The grid is searched for offline (`buildBeam`, scored by `judge`) by
 * tools/video-styles/crossword/bake-layout.mjs and baked into
 * layout.mjs; the film only reads it. Why it is a search and not a greedy
 * build: docs/visualizers/ivory.md.
 */
export const STATIONS = [
  { step: 0, pan: null, words: [['WOMAN', 0], ['SUNRISE', 1], ['SURE', 0], ['EYES', 1], ['WAVES', 1], ['SHORE', 1]] },
  { step: 10, pan: [23.0, 26.2], words: [['OCEAN', 2], ['BLUE', 2], ['BUTTERFLY', 2], ['WINGS', 2]] },
  { step: 8, pan: [32.6, 34.8], words: [['STAGE', 3], ['SINGS', 3]] },
  { step: 8, pan: [37.0, 40.2], words: [['IVORY', 4]] },
  { step: 10, pan: [44.0, 46.6], words: [['CALIFORNIA', 5], ['TENNESSEE', 5]] },
  { step: 8, pan: [50.8, 53.3], together: true, words: [['MYSTERY', 6], ['IVORY', 7]] },
  { step: 10, pan: [60.6, 63.8], words: [['FLOWERS', 8], ['HAIR', 8], ['UNIVERSE', 9], ['STOP', 9], ['STARE', 9]] },
  { step: 10, pan: [77.6, 80.8], words: [['RIGHT', 10], ['BESIDE', 10], ['WHERE', 10]] },
  { step: 8, pan: [85.9, 87.8], words: [['ASKED', 11], ['NAME', 11], ['LOOKED', 11], ['STRAIGHT', 11]] },
  { step: 8, pan: [92.4, 95.2], words: [['IVORY', 12], ['WANTED', 13], ['PARADISE', 13], ['PLAY', 13], ['MELODY', 13]] },
  { step: 8, pan: [105.8, 109.5], words: [['IVORY', 15]] },
  // The interlude: her name, jumbled, a word a beat (see JUMBLE below).
  { step: 10, pan: [112.0, 114.6], words: [], jumble: { from: 114.8, count: 16 } },
  { step: 10, pan: [126.0, 129.2], words: [['LOVES', 16], ['ADAM', 16], ['EVE', 16], ['FORGOT', 17], ['BREATHE', 17]] },
  { step: 8, pan: [138.0, 140.8], words: [['IVORY', 18]] },
  { step: 10, pan: [144.6, 147.6], words: [['SOUNDS', 19], ['WALKS', 20], ['ALASKA', 20], ['SNOWFALL', 20], ['TREES', 20]] },
  // Her name first in the grid, then the words that lead away from it to the last one (sung before it: one held shot).
  { step: 8, pan: [156.4, 159.6], together: true, words: [['IVORY', 23], ['HEARTACHE', 22], ['AVOID', 22], ['KEEP', 22]] },
  { step: 10, pan: [169.0, 172.0], words: [['IVORY', 24]] },
]

/*
 * The interlude (the user, 2026-11-13): "a complex grid portion where every
 * word is ivory, but the letters are mixed up." A station's `jumble` is
 * `count` jumbles of IVORY (never IVORY itself, no two the same), packed as
 * tightly as they will cross, written one a beat from `from`. A jumble's
 * letter is red only where it stands where it does in IVORY.
 */
export const JUMBLE = '*'
const IV = 'IVORY'
const PERMS = (function perms(s) {
  return s.length < 2 ? [s] : [...s].flatMap((ch, i) => perms(s.slice(0, i) + s.slice(i + 1)).map((p) => ch + p))
})(IV).filter((p) => p !== IV)
/** Whether letter j of a written entry is red: all of IVORY, and a jumble's letters where they stand in IVORY. */
export const redAt = (e, j) => e.word === IV || (e.jumble === true && e.word[j] === IV[j])

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
  const words = STATIONS.flatMap((st, si) => [...st.words.map(([w]) => [w, si]), ...Array.from({ length: st.jumble?.count ?? 0 }, () => [JUMBLE, si])])
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
  const grow = (state, word, si, c, r, down, score, front, jumble = false) => {
    const cells = new Map(state.cells)
    const idx = state.entries.length
    for (let i = 0; i < word.length; i++) {
      const k = key(c + (down ? 0 : i), r + (down ? i : 0))
      const cell = { ...(cells.get(k) ?? { ch: word[i], across: -1, down: -1 }) }
      cell[down ? 'down' : 'across'] = idx
      cells.set(k, cell)
    }
    return { cells, entries: [...state.entries, { word, c, r, down, station: si, ...(jumble ? { jumble } : {}) }], score, front }
  }

  const [first] = words[0]
  let beam = [grow({ cells: new Map(), entries: [] }, first, 0, 0, 0, false, 0, [first.length, 0.5])]
  /*
   * Where `word` can go in grid `st`, crossing one of its last `reachBack`
   * words: { word, c, r, down, back, crossings }. A JUMBLE may cross any word
   * of its own station's block (and the two before it), and takes whichever
   * jumbles of IVORY fit the squares it crosses (two of them, by `rand`).
   */
  function* placements(st, word, si, reachBack) {
    const n = st.entries.length
    const jumble = word === JUMBLE
    const reach = jumble ? st.entries.filter((e) => e.station === si).length + 2 : reachBack
    const done = new Set()
    const used = jumble ? new Set(st.entries.map((e) => e.word)) : null
    for (let back = n - 1; back >= Math.max(0, n - reach); back--) {
      const e = st.entries[back]
      const down = !e.down
      const len = jumble ? IV.length : word.length
      for (let ci = 0; ci < e.word.length; ci++) {
        const cc = e.c + (e.down ? 0 : ci)
        const rr = e.r + (e.down ? ci : 0)
        for (let i = 0; i < len; i++) {
          if (jumble ? !IV.includes(e.word[ci]) : word[i] !== e.word[ci]) continue
          const c = cc - (down ? 0 : i)
          const r = rr - (down ? i : 0)
          if (!jumble) {
            const crossings = fits(st.cells, word, c, r, down)
            if (crossings >= 1) yield { word, c, r, down, back, crossings }
            continue
          }
          const at = `${c},${r},${down}`
          if (done.has(at)) continue
          done.add(at)
          // The letters it must have where it crosses; then every jumble that has them.
          const letters = new Set()
          let ok = !st.cells.has(key(c - (down ? 0 : 1), r - (down ? 1 : 0))) && !st.cells.has(key(c + (down ? 0 : len), r + (down ? len : 0)))
          for (let j = 0; j < len && ok; j++) {
            const x = c + (down ? 0 : j)
            const y = r + (down ? j : 0)
            const cell = st.cells.get(key(x, y))
            if (cell) { ok = IV.includes(cell.ch) && cell[down ? 'down' : 'across'] === -1 && !letters.has(cell.ch); letters.add(cell.ch) }
            else ok = !st.cells.has(key(x + (down ? 1 : 0), y + (down ? 0 : 1))) && !st.cells.has(key(x - (down ? 1 : 0), y - (down ? 0 : 1)))
          }
          if (!ok) continue
          const fixed = [...Array(len)].map((_, j) => st.cells.get(key(c + (down ? 0 : j), r + (down ? j : 0)))?.ch)
          const crossings = fixed.filter(Boolean).length
          const options = PERMS.filter((p) => !used.has(p) && fixed.every((f, j) => !f || p[j] === f))
          for (let k = 0; k < 2 && options.length; k++) {
            const [pick] = options.splice(Math.floor(rand() * options.length), 1)
            yield { word: pick, c, r, down, back, crossings, jumble: true }
          }
        }
      }
    }
  }

  for (const [word, si] of words.slice(1)) {
    const [hx, hy] = H[si]
    let next = []
    // Cross one of the last four words; if no grid in the beam can, any word.
    for (const reachBack of [4, Infinity]) {
    if (next.length) break
    for (const st of beam) {
      const n = st.entries.length
      for (const { word: w, c, r, down, back, crossings, jumble } of placements(st, word, si, reachBack)) {
            // The furthest square along the heading, and how far that moves the front.
            let far = null
            let reach = -Infinity
            for (let j = 0; j < w.length; j++) {
              const x = c + (down ? 0 : j) + 0.5
              const y = r + (down ? j : 0) + 0.5
              const a = (x - st.front[0]) * hx + (y - st.front[1]) * hy
              if (a > reach) { reach = a; far = [x, y] }
            }
            const me = { word: w, c, r, down }
            const [mx, my] = centre(me)
            // Off the line the chain is on.
            const off = Math.abs((mx - st.front[0]) * -hy + (my - st.front[1]) * hx)
            let near = 0
            if (w === 'IVORY') {
              for (const o of st.entries) {
                if (o.word !== 'IVORY') continue
                const [ox, oy] = centre(o)
                near += Math.max(0, Math.min(IVORY_APART.x - Math.abs(ox - mx), (IVORY_APART.y - Math.abs(oy - my)) * 2))
              }
            }
            if (near > 0) continue
            // Between two IVORYs the chain heads away from the last one, so the next has somewhere to go.
            // (Away from all of them: the nearest counts.)
            let away = 0
            const ivs = st.entries.filter((o) => o.word === 'IVORY').map(centre)
            if (ivs.length && w !== 'IVORY') {
              for (let j = 0; j < w.length; j++) {
                const x = c + (down ? 0 : j) + 0.5
                const y = r + (down ? j : 0) + 0.5
                let d = Infinity
                for (const [ox, oy] of ivs) d = Math.min(d, Math.max(Math.abs(x - ox) / IVORY_APART.x, Math.abs(y - oy) / IVORY_APART.y))
                away = Math.max(away, Math.min(1.3, d))
              }
            }
            // Compact: the station's words should fill one frame (about 20 × 9 cells), not spread past it.
            let c0 = c, c1 = c + (down ? 1 : w.length), r0 = r, r1 = r + (down ? w.length : 1)
            const mine = st.entries.filter((o) => o.station === si)
            for (const o of mine) {
              c0 = Math.min(c0, o.c); c1 = Math.max(c1, o.c + (o.down ? 1 : o.word.length))
              r0 = Math.min(r0, o.r); r1 = Math.max(r1, o.r + (o.down ? o.word.length : 1))
            }
            let score
            if (jumble) {
              /*
               * The block: as many crossings as it can, packed into about 15 × 7
               * cells round where it began, edging on along the heading only a
               * little.
               */
              const tight = Math.max(0, c1 - c0 - 15) + Math.max(0, r1 - r0 - 7) * 2
              let gx = mx, gy = my
              if (mine.length) {
                gx = mine.reduce((t, o) => t + centre(o)[0], 0) / mine.length
                gy = mine.reduce((t, o) => t + centre(o)[1], 0) / mine.length
              }
              const drift = Math.hypot(mx - gx, (my - gy) * 1.6)
              score = st.score + crossings * 3 + away * 2 + Math.min(Math.max(reach, -3), 2) * 0.5 - tight * 3 - drift * 0.4 + rand() * noise
            }
            else {
              const spread = Math.max(0, c1 - c0 - 19) + Math.max(0, r1 - r0 - 9) * 2
              score = st.score + away * 2 + Math.max(reach, -3) * 1.5 - spread * 1.5 - Math.max(0, off - 5) * 0.4 - (back < n - 1 ? 0.6 : 0) + rand() * noise
            }
            next.push({ st, word: w, si, c, r, down, jumble, crossings, score, front: reach > 0 ? far : st.front })
      }
    }
    }
    if (!next.length) { buildBeam.failed = `${word}@${si}`; return [] }
    next.sort((a, b) => b.score - a.score)
    // Keep the best, but not two that differ only in how they got there.
    const seen = new Set()
    beam = []
    for (const x of next) {
      const sig = `${x.st.entries.length > 1 ? x.st.entries.slice(-2).map((e) => `${e.word}${e.c},${e.r},${e.down}`).join('|') : ''}|${x.word}${x.c},${x.r},${x.down}`
      if (seen.has(sig)) continue
      seen.add(sig)
      beam.push(grow(x.st, x.word, x.si, x.c, x.r, x.down, x.score, x.front, x.jumble))
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
