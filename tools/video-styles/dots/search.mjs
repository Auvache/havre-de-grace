/*
 * Finds the game the Dots and Boxes film plays (shared/video/films/dots-and-boxes.mjs).
 *
 *   node tools/video-styles/dots/search.mjs [from] [to]    # seeds to try (default 1..4000)
 *   node tools/video-styles/dots/search.mjs --show 1234     # one seed's runs
 *
 * Plays every seed in the range against the measured score and keeps the
 * games whose night goes the way the song does (`judge`, below). Prints the
 * best few; put the chosen one in SEED.
 */
import { MEET_ME_AT_THE_HORIZON_SCORE as score } from '../../../app/config/meetMeAtTheHorizonScore.ts'
import { slotsFor, playGame, RED_P, BLACK_P } from '../../../shared/video/films/dots-and-boxes.mjs'

const slots = slotsFor(score)
const T = { chorus1: 52, verse3: 71.3, chorus2: 106.7, hook1: 126.4, verse5: 140.9, chorus3: 159, hook2: 178.6, lateLead: 185, outro: 195.4 }

function judge(moves) {
  const at = (t) => { const s = [0, 0]; for (const m of moves) { if (m.t >= t) break; for (const _ of m.closed) s[m.p]++ } return s }
  const take = (p, a, b) => moves.filter((m) => m.p === p && m.t >= a && m.t < b).reduce((n, m) => n + m.closed.length, 0)
  const final = at(1e9)
  const last = moves.at(-1)
  // The last chain: red's run of boxes that ends the game.
  let chain = 0
  for (let k = moves.length - 1; k >= 0 && moves[k].p === RED_P; k--) chain += moves[k].closed.length
  const before2 = at(T.hook2)
  // When red goes ahead for good (since 2026-11-23 the game runs on through the outro to 3:30).
  let lead = null
  { const s = [0, 0]; for (const m of moves) { for (const _ of m.closed) s[m.p]++; if (s[0] > s[1]) lead ??= m.t; else lead = null } }
  const checks = {
    quietStart: at(T.chorus1)[0] + at(T.chorus1)[1] === 0,
    sunWakes: take(RED_P, T.chorus1, T.verse3) >= 2,
    fever: take(BLACK_P, T.verse3, T.chorus2) >= 5 && at(T.chorus2)[1] - at(T.chorus2)[0] >= 2,
    chorus2: take(RED_P, T.chorus2, T.hook1) >= 2,
    behind: at(T.chorus3)[1] > at(T.chorus3)[0] && before2[1] > before2[0],
    wins: final[0] > final[1] && final[0] - final[1] <= 4,
    lastIsRed: last.p === RED_P && chain >= 4,
    lateLead: lead != null && lead >= T.lateLead,
  }
  const ok = Object.values(checks).every(Boolean)
  // Prefer a close finish, a long last chain, and a deep deficit before it.
  // And the lead taken late, in the outro if it can be.
  const quality = ok ? chain * 2 + (before2[1] - before2[0]) * 1.5 - (final[0] - final[1]) * 2 + (lead >= T.outro ? 6 : 0) : -1
  return { ok, checks, quality, final, chain, before2, lead, firstBox: moves.find((m) => m.closed.length)?.t }
}

const args = process.argv.slice(2)
if (args[0] === '--show') {
  const seed = Number(args[1])
  const moves = playGame(slots, seed)
  console.log(judge(moves))
  let s = [0, 0]
  for (const m of moves) if (m.closed.length) { for (const _ of m.closed) s[m.p]++; console.log(m.t.toFixed(2), m.p === RED_P ? 'RED  ' : 'BLACK', m.closed.length, s.join('–')) }
}
else {
  const from = Number(args[0] ?? 1)
  const to = Number(args[1] ?? 4000)
  const good = []
  const fails = {}
  for (let seed = from; seed <= to; seed++) {
    const j = judge(playGame(slots, seed))
    if (j.ok) good.push({ seed, ...j })
    for (const [k, v] of Object.entries(j.checks)) if (!v) fails[k] = (fails[k] ?? 0) + 1
  }
  good.sort((a, b) => b.quality - a.quality)
  console.log(`${good.length} of ${to - from + 1} pass. Failures by check:`, fails)
  for (const g of good.slice(0, 10)) console.log(g.seed, g.quality.toFixed(1), 'final', g.final.join('–'), 'last chain', g.chain, 'before hook 2', g.before2.join('–'), 'lead', g.lead?.toFixed(2), 'first box', g.firstBox?.toFixed(2))
}
