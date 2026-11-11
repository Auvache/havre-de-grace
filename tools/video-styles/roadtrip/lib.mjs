/* Shared by the road trip's bake scripts: encoding, simplifying, fetching with a cache on disk. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

/** Where downloads are kept between runs. CACHE=<dir> to choose; nothing in it is checked in. */
export const CACHE = resolve(process.env.CACHE ?? resolve(tmpdir(), 'havre-roadtrip-cache'))
mkdirSync(CACHE, { recursive: true })

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))
/** Fetch text once; afterwards read it from the cache. `pause` ms after a real request, to be gentle. */
export async function cached(name, url, pause = 0) {
  const file = resolve(CACHE, name)
  if (existsSync(file)) return readFileSync(file, 'utf8')
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'roadmap-bake/1.0' } })
    if (res.ok) {
      const text = await res.text()
      writeFileSync(file, text)
      if (pause) await sleep(pause)
      return text
    }
    if (attempt >= 3) throw new Error(`${res.status} for ${url}`)
    await sleep(3000 * (attempt + 1))
  }
}
export const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16)

/** [[lon, lat], …] → a Google polyline (lat before lon) at `precision` places. */
export function encode(points, precision = 4) {
  const k = 10 ** precision
  let out = ''
  let plat = 0
  let plon = 0
  const put = (v) => {
    let n = v < 0 ? ~(v << 1) : v << 1
    while (n >= 0x20) { out += String.fromCharCode((0x20 | (n & 0x1f)) + 63); n >>= 5 }
    out += String.fromCharCode(n + 63)
  }
  for (const [lon, lat] of points) {
    const a = Math.round(lat * k)
    const b = Math.round(lon * k)
    put(a - plat)
    put(b - plon)
    plat = a
    plon = b
  }
  return out
}

/** Douglas–Peucker on points [x, y, …]: keeps the indices whose removal would move the line more than `tol`. */
export function simplify(pts, tol) {
  if (pts.length <= 2) return pts.map((_, i) => i)
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = pts[a]
    const [bx, by] = pts[b]
    const [dx, dy] = [bx - ax, by - ay]
    const L2 = dx * dx + dy * dy
    let worst = -1
    let far = tol * tol
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i]
      const u = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)) : 0
      const d2 = (px - ax - u * dx) ** 2 + (py - ay - u * dy) ** 2
      if (d2 > far) { far = d2; worst = i }
    }
    if (worst > 0) { keep[worst] = 1; stack.push([a, worst], [worst, b]) }
  }
  const out = []
  keep.forEach((k, i) => { if (k) out.push(i) })
  return out
}
