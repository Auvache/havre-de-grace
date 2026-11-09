/* Plane geometry for the Portland city: no state, no drawing. */

export const lerp = (a, b, u) => a + (b - a) * u
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

/** Catmull-Rom through points (any number of components), sampled about every `step` metres of the first two. */
export function spline(pts, step = 6) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const n = Math.max(2, Math.ceil(dist(p1, p2) / step))
    for (let k = 0; k < n; k++) {
      const t = k / n
      const t2 = t * t
      const t3 = t2 * t
      out.push(p1.map((_, d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)))
    }
  }
  out.push(pts.at(-1))
  return out
}

export function inPoly(x, y, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export const arcPts = ([cx, cy], rx, ry, a0, a1, step = 4) => {
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * (rx + ry)) / 2 / step))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = lerp(a0, a1, i / n)
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]
  })
}

export const polyLen = (pts) => pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0)

/** Point and tangent at arc length s along a polyline. */
export function along(pts, s) {
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    const L = dist(pts[i], pts[i - 1])
    if (acc + L >= s || i === pts.length - 1) {
      const u = L ? Math.min(1, (s - acc) / L) : 0
      const dx = (pts[i][0] - pts[i - 1][0]) / (L || 1)
      const dy = (pts[i][1] - pts[i - 1][1]) / (L || 1)
      return { p: [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)], t: [dx, dy] }
    }
    acc += L
  }
  return { p: pts.at(-1), t: [1, 0] }
}

/** y → x along a polyline that only ever runs one way in y (a river's centre, the foot of the hills). */
export function xAtY(pts) {
  const s = pts.slice().sort((a, b) => a[1] - b[1])
  return (y) => {
    if (y <= s[0][1]) return s[0][0] + ((s[1][0] - s[0][0]) * (y - s[0][1])) / (s[1][1] - s[0][1] || 1)
    for (let i = 1; i < s.length; i++) {
      if (y <= s[i][1]) return lerp(s[i - 1][0], s[i][0], (y - s[i - 1][1]) / (s[i][1] - s[i - 1][1] || 1))
    }
    const n = s.length - 1
    return s[n][0] + ((s[n][0] - s[n - 1][0]) * (y - s[n][1])) / (s[n][1] - s[n - 1][1] || 1)
  }
}

/** Distance from p to the segment ab. */
export function distSeg(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = dx * dx + dy * dy || 1
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L))
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy)
}
