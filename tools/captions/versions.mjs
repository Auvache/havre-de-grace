/*
 * The TikTok version of every Short in ready/youtube/: the same clip squeezed to 9.5 MB, so it can be
 * uploaded to Buffer through Chrome (which can't send a file over about 10 MB).
 *
 *   node tools/captions/versions.mjs [--videos ~/stefan/videos] [--jobs 2] [--mb 9.5]
 *
 * ready/ holds one folder per platform (agreed 29 Oct 2026): youtube/ has the full-quality clip that
 * short.mjs writes (it goes up in Studio by hand), tiktok/ the small copy made here, instagram/ whatever the
 * user puts there. A clip that already has a TikTok version, in ready/tiktok/ or posted/tiktok/, is skipped,
 * so this can run after every inbox.
 *
 * Two-pass x264 at the bitrate that fills the budget, AAC 128k. Measured against the full-quality clips
 * (29 Oct 2026): VMAF 92.6 on average over 77 clips, 85 or more up to about 35 s. Longer clips starve: the 50 s
 * Insane, Okay (a plaid shirt) scored 67. Over LONG seconds the clip is HEVC instead, which scored 81 on it at the
 * same size (x264 veryslow 70, x264 at 720p 74). TikTok takes HEVC (an iPhone records it); check Buffer on the first upload.
 */
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { parseArgs } from 'node:util'

const { values: opt } = parseArgs({
  options: {
    videos: { type: 'string', default: join(homedir(), 'stefan/videos') },
    jobs: { type: 'string', default: '2' },
    mb: { type: 'string', default: '9.5' },
  },
})

const AUDIO = 128_000
const LONG = 36
// The MP4 container and x264's overshoot: what the budget keeps back beyond the audio.
const SLACK = 40_000
const budget = Number(opt.mb) * 8 * 1024 * 1024

const ready = join(opt.videos, 'ready')
for (const dir of ['youtube', 'tiktok', 'instagram']) {
  mkdirSync(join(ready, dir), { recursive: true })
  mkdirSync(join(opt.videos, 'posted', dir), { recursive: true })
}
const has = (dir) => new Set(readdirSync(dir).map((f) => basename(f, extname(f))))
const done = new Set([...has(join(ready, 'tiktok')), ...has(join(opt.videos, 'posted/tiktok'))])
const todo = readdirSync(join(ready, 'youtube'))
  .filter((f) => /\.(mp4|mov)$/i.test(f) && !done.has(basename(f, extname(f))))

const run = (args, cwd) => new Promise((ok, fail) => {
  const p = spawn('ffmpeg', ['-v', 'error', '-y', ...args], { cwd, stdio: ['ignore', 'ignore', 'inherit'] })
  p.on('exit', (code) => (code ? fail(new Error(`ffmpeg exited ${code}`)) : ok()))
})

async function shrink(file) {
  const src = join(ready, 'youtube', file)
  const out = join(ready, 'tiktok', `${basename(file, extname(file))}.mp4`)
  const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).toString())
  const video = Math.floor(budget / seconds - AUDIO - SLACK)
  // Each job keeps its pass log in its own folder, and writes beside the result until it's whole.
  const work = mkdtempSync(join(tmpdir(), 'versions-'))
  const part = join(work, 'part.mp4')
  try {
    const codec = seconds > LONG
      ? ['-c:v', 'libx265', '-tag:v', 'hvc1', '-x265-params', 'log-level=error']
      : ['-c:v', 'libx264']
    const enc = ['-i', src, ...codec, '-preset', 'slow', '-b:v', String(video), '-pix_fmt', 'yuv420p', '-passlogfile', join(work, 'pass')]
    await run([...enc, '-pass', '1', '-an', '-f', 'null', '/dev/null'], work)
    await run([...enc, '-pass', '2', '-c:a', 'aac', '-b:a', String(AUDIO), '-movflags', '+faststart', part], work)
    renameSync(part, out)
  }
  finally {
    rmSync(work, { recursive: true, force: true })
  }
  const mb = statSync(out).size / 1048576
  console.log(`${mb.toFixed(1)} MB  ${(video / 1000).toFixed(0)} kbps ${seconds > LONG ? 'HEVC' : 'H.264'}  ${seconds.toFixed(1)} s  ${basename(out)}`)
  // Chrome's upload limit is about 10 MB; x264 can overshoot the budget by a kilobyte or so
  if (mb > 10) console.log('  ↑ over 10 MB')
}

console.log(`${todo.length} to make, ${done.size} already made`)
const queue = [...todo]
await Promise.all(Array.from({ length: Number(opt.jobs) }, async () => {
  while (queue.length) await shrink(queue.shift())
}))
