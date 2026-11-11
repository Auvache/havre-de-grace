/*
 * Ship to Stockholm · the road trip — the sheet's geometry: the projection
 * every baked line goes through, and the decoding of those lines.
 *
 * The map is an Albers conic of the United States (standard parallels 29.5°
 * and 45.5°, centred on 96° W, 37.5° N), the projection of a road atlas's
 * national map: north is up in the middle of the country and the northern
 * border sags at both ends. Units are kilometres, x east, y south.
 */
const RAD = Math.PI / 180
const R_EARTH = 6371
const [P1, P2, LON0, LAT0] = [29.5 * RAD, 45.5 * RAD, -96 * RAD, 37.5 * RAD]
const N = (Math.sin(P1) + Math.sin(P2)) / 2
const C = Math.cos(P1) ** 2 + 2 * N * Math.sin(P1)
const RHO0 = Math.sqrt(C - 2 * N * Math.sin(LAT0)) / N

/** [lon, lat] in degrees → [x, y] in kilometres on the sheet. */
export function project([lon, lat]) {
  const rho = Math.sqrt(C - 2 * N * Math.sin(lat * RAD)) / N
  const th = N * (lon * RAD - LON0)
  return [R_EARTH * rho * Math.sin(th), -R_EARTH * (RHO0 - rho * Math.cos(th))]
}

/** A Google polyline (lat before lon) at `precision` decimal places → [[lon, lat], …]. */
export function decode(str, precision = 4) {
  const k = 10 ** precision
  const out = []
  let i = 0
  let lat = 0
  let lon = 0
  const next = () => {
    let result = 0
    let shift = 0
    let b
    do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }
  while (i < str.length) {
    lat += next()
    lon += next()
    out.push([lon / k, lat / k])
  }
  return out
}

/** Decoded and projected in one go. */
export const line = (str, precision = 4) => decode(str, precision).map(project)
