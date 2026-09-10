// Writes the delivery suite into public/logos.
//
//   node tools/logo/build.mjs [output-dir] [--archive]
//
// The four earlier rounds are kept as generators rather than as shipped files:
// /logo is a style guide for the delivered suite now, so nothing links to them
// and they were 46 SVGs of dead weight in the public directory. `--archive`
// writes them back out for anyone who wants to look through them again.

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROUND_FOUR } from './round-4.mjs'
import { ROUND_ONE } from './round-1.mjs'
import { ROUND_THREE } from './round-3.mjs'
import { ROUND_TWO } from './round-2.mjs'
import { SUITE } from './suite.mjs'

const args = process.argv.slice(2)
const OUT = args.find((arg) => !arg.startsWith('--')) ?? 'public/logos'

const ARCHIVE = [
  ['round-1', ROUND_ONE],
  ['round-2', ROUND_TWO],
  ['round-3', ROUND_THREE],
  ['round-4', ROUND_FOUR],
]

const SETS = args.includes('--archive')
  ? [...ARCHIVE, ['suite', SUITE]]
  : [['suite', SUITE]]

for (const [dir, files] of SETS) {
  const target = join(OUT, dir)
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  for (const [name, draw] of files) writeFileSync(join(target, name), draw())
  console.log(`${target}: ${files.length} files`)
}
