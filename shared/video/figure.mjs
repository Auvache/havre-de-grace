/*
 * A person, as joints — for the styles that put somebody in the frame.
 *
 * Flipbook draws them as trembling pencil; Trailhead and Woodcut draw the same
 * joints as a heavy round-capped stroke, which at twelve units or more reads as
 * a silhouette. So the skeleton lives here and the pen lives in the style.
 *
 * Proportions are Flipbook's (videoStyles.ts, b1-flipbook): head r = 0.11h at
 * 0.885h, shoulders 0.70h, hips 0.40h, feet on the ground line — so a figure
 * drawn by any style is the same person.
 *
 * Angles are in degrees from straight down, positive forwards (towards +x, the
 * way the figure faces). A pose is data, not a drawing, so a style can pick one
 * by name, step through the run cycle, or mirror it with `facing: -1`.
 */

const RAD = Math.PI / 180

/** Named poses. [upper, lower] per limb; knees and elbows are relative to their parent. */
export const POSES = {
  stand: { lean: 0, armB: [-12, 0], armF: [12, 0], legB: [-6, 0], legF: [6, 0] },
  walk: { lean: 4, armB: [-28, 12], armF: [30, 20], legB: [-22, -4], legF: [20, 6] },
  wave: { lean: 0, armB: [-14, 4], armF: [128, 22], legB: [-7, 0], legF: [8, 0] },
  cheer: { lean: 0, armB: [-138, -8], armF: [138, 8], legB: [-8, 0], legF: [8, 0] },
  reach: { lean: 6, armB: [-70, 0], armF: [100, 0], legB: [-12, 0], legF: [12, 0] },
  sit: { lean: -4, armB: [-10, 30], armF: [20, 40], legB: [80, 80], legF: [86, 86], seated: true },
  play: { lean: 2, armB: [30, 90], armF: [50, 70], legB: [-8, 0], legF: [10, 0] },
}

/*
 * The run cycle, as six poses rather than a curve. Flipbook replaces poses and
 * never tweens them, and a silhouette style that eases between these reads as
 * a puppet — so every caller steps through them.
 */
export const RUN = [
  { lean: 14, armB: [-40, 70], armF: [50, 80], legB: [-38, 70], legF: [42, 20], lift: 0.02 },
  { lean: 16, armB: [-10, 80], armF: [20, 90], legB: [-12, 100], legF: [58, 50], lift: 0.06 },
  { lean: 14, armB: [30, 90], armF: [-30, 60], legB: [30, 40], legF: [-10, 60], lift: 0.03 },
  { lean: 14, armB: [50, 80], armF: [-40, 70], legB: [42, 20], legF: [-38, 70], lift: 0.02 },
  { lean: 16, armB: [20, 90], armF: [-10, 80], legB: [58, 50], legF: [-12, 100], lift: 0.06 },
  { lean: 14, armB: [-30, 60], armF: [30, 90], legB: [-10, 60], legF: [30, 40], lift: 0.03 },
]

const limb = (x, y, len, a) => [x + Math.sin(a * RAD) * len, y + Math.cos(a * RAD) * len]

/**
 * Joint positions for a figure `h` tall standing on `ground` at `x`.
 * Returns { head: [x, y, r], neck, hip, elbowB, handB, elbowF, handF, kneeB, footB, kneeF, footF }.
 */
export function joints(x, ground, h, pose = POSES.stand, facing = 1) {
  const p = typeof pose === 'string' ? POSES[pose] ?? POSES.stand : pose
  const lift = (p.lift ?? 0) * h
  const seated = Boolean(p.seated)
  const hipY = ground - (seated ? h * 0.18 : h * 0.40) - lift
  const lean = (p.lean ?? 0) * facing
  const torso = h * 0.30
  // The torso leans from the hip; the shoulder sits along it.
  const neck = [x + Math.sin(lean * RAD) * (h * 0.375), hipY - Math.cos(lean * RAD) * (h * 0.375)]
  const shoulder = [x + Math.sin(lean * RAD) * torso, hipY - Math.cos(lean * RAD) * torso]
  const headC = [x + Math.sin(lean * RAD) * (h * 0.485), hipY - Math.cos(lean * RAD) * (h * 0.485)]
  const upperArm = h * 0.17
  const foreArm = h * 0.16
  const thigh = h * 0.21
  const shin = h * 0.20
  const f = (deg) => deg * facing
  const arm = ([a, b]) => {
    const elbow = limb(shoulder[0], shoulder[1], upperArm, f(a))
    return [elbow, limb(elbow[0], elbow[1], foreArm, f(a + b))]
  }
  const leg = ([a, b]) => {
    const knee = limb(x, hipY, thigh, f(a))
    // A knee bends backwards: the shin swings behind the thigh.
    return [knee, limb(knee[0], knee[1], shin, f(a - b))]
  }
  const [elbowB, handB] = arm(p.armB)
  const [elbowF, handF] = arm(p.armF)
  const [kneeB, footB] = leg(p.legB)
  const [kneeF, footF] = leg(p.legF)
  const out = { head: [headC[0], headC[1], h * 0.11], neck, shoulder, hip: [x, hipY], elbowB, handB, elbowF, handF, kneeB, footB, kneeF, footF }
  /*
   * Plant the lower foot on the ground. The hip height above is a standing
   * figure's; a stride shortens the legs' reach, so without this a running
   * figure's feet go through the ground line on every step. `lift` is then the
   * air under the planted foot, which is what makes the stride's float read.
   */
  if (!seated) {
    const low = Math.max(footB[1], footF[1])
    const dy = ground - lift - low
    for (const key of Object.keys(out)) { out[key] = [out[key][0], out[key][1] + dy, ...out[key].slice(2)] }
  }
  return out
}

/** The figure as polylines: [[x,y],…] per stroke, back limbs first. Head separate. */
export function strokes(j) {
  return [
    [j.shoulder, j.elbowB, j.handB],
    [j.hip, j.kneeB, j.footB],
    [j.neck, j.hip],
    [j.hip, j.kneeF, j.footF],
    [j.shoulder, j.elbowF, j.handF],
  ]
}

/** The pose in the run cycle for a step count — one step per eighth, per word, whatever the style steps on. */
export const runPose = (step) => RUN[((Math.floor(step) % RUN.length) + RUN.length) % RUN.length]
