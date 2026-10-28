"""
Keep one performer in a 9:16 window cut from a wider live video, for short.mjs --reframe crop.

    python follow.py track <faces.json> <crop.json> [--pick largest|left] [--from 12] [--fixed]
    python follow.py clip <crop.json> <start> <end> [--below 1.0]

`faces.json` is what faces.py writes. `track` decides which face is the
performer (the largest to start with, or `--pick left` when someone else shares
the stage: Jed stands right of Stefan on Andalusia), then turns the face's
path into `--crop-x` keyframes the way a lazy camera operator would move: it
holds still while the face stays inside a dead zone (a fifth of the window),
pans for about 0.8 s when it drifts out, and jumps on a camera cut, which shows
up as the face suddenly changing size (wide to close-up) or position.
`--from` skips a title opening. `--fixed` gives one window for the whole video,
for a locked-off camera (Andalusia).

`clip` prints two lines for one clip: its `--crop-x` keyframes and its `--top`.
The top goes `--below` face-heights under the face's centre, separately for each
shot (a close-up is a face over 0.13 of the frame wide), so the caption jumps
with the cut to the dark band under the chin; check it on a still, and set it
by eye where the guitar sits close under the chin (Andalusia: 640).

The tracker loses the performer when he looks down or leans out of a close-up,
and finds false faces in a very wide shot: check a contact sheet of the crop
(cropexpr below) and end clips before those moments.
"""
import json
import statistics
import sys

TOP_MIN, TOP_MAX = 560, 1330  # px in the 1080x1920 frame: under the face, above the title and channel name


def arg(args, name, default):
    return type(default)(args[args.index(name) + 1]) if name in args else default


def track(src, out, *args):
    pick = arg(args, '--pick', 'largest')
    t_from = arg(args, '--from', 0.0)
    d = json.load(open(src))
    iw, ih, fps = d['w'], d['h'], d['fps']
    cw = ih * 9 / 16 / iw  # the window's width as a fraction of the frame
    samples = [s for s in d['samples'] if s['t'] >= t_from]

    # 1. which face is the performer: the chosen rule to start, then the face nearest the last one
    path, last = [], None
    for s in samples:
        faces = [f for f in s['faces'] if f[2] > 0.025]
        if not faces:
            path.append(None)
            continue
        if last is None or pick == 'left':
            cand = min(faces, key=lambda f: f[0]) if pick == 'left' else max(faces, key=lambda f: f[2])
            if pick == 'left' and last is not None:  # leftmost, unless that's a stray far from where we were
                near = min(faces, key=lambda f: abs(f[0] - last[0]))
                cand = near if abs(near[0] - last[0]) < 0.08 else cand
        else:
            cand = min(faces, key=lambda f: abs(f[0] - last[0]) + 2 * abs(f[2] - last[2]))
            if abs(cand[0] - last[0]) > 0.15 and len(faces) > 1:  # a cut, or a second face: fall back to the size
                cand = max(faces, key=lambda f: f[2])
        path.append(cand)
        last = cand

    # 2. hold through misses, then a running median over 1.5 s to throw out single false hits
    def held(k, default):
        out, prev = [], next((f[k] for f in path if f), default)
        for f in path:
            prev = f[k] if f else prev
            out.append(prev)
        return out

    half = int(0.75 * fps)
    cx, sz = held(0, 0.5), held(2, 0.1)
    med = [statistics.median(cx[max(0, i - half):i + half + 1]) for i in range(len(cx))]
    msz = [statistics.median(sz[max(0, i - half):i + half + 1]) for i in range(len(sz))]

    def to_x(c):
        return min(1, max(0, (c - cw / 2) / (1 - cw)))

    # 3. the lazy operator
    PAN = 0.8
    keys, centre, size = [[samples[0]['t'], to_x(med[0])]], med[0], msz[0]
    i = 0
    while i < len(med):
        c, t = med[i], samples[i]['t']
        if not 0.72 < msz[i] / size < 1.38:  # the face changed size: a cut between wide and close, so jump with it
            k = next((k for k in range(max(0, i - half - 1), i + 1)
                      if not 0.77 < sz[k] / size < 1.3 and samples[k]['t'] - 0.13 > keys[-1][0]), i)
            new = statistics.median(cx[k:k + 4])
            keys += [[samples[k]['t'] - 0.13, to_x(centre)], [samples[k]['t'] - 0.12, to_x(new)]]
            centre, size = new, msz[i]
        elif abs(c - centre) > cw * 0.5:  # a cut sideways, or a big move: jump
            keys += [[t - 0.01, to_x(centre)], [t, to_x(c)]]
            centre, size = c, msz[i]
        elif abs(c - centre) > cw * 0.2:  # drifting out of the dead zone: pan to where the face settles
            j = min(len(med) - 1, i + int(PAN * fps))
            keys += [[t, to_x(centre)], [samples[j]['t'], to_x(med[j])]]
            centre = med[j]
            i = j
        i += 1
    if '--fixed' in args:
        keys = [[0, to_x(statistics.median(f[0] for f in path if f))]]
    keys = [[round(t, 2), round(x, 4)] for t, x in keys]
    miss = sum(1 for f in path if not f) / len(path)
    json.dump({'w': iw, 'h': ih, 'cw': cw, 'keys': keys,
               'track': [[s['t'], f[0], f[1], f[2]] for s, f in zip(samples, path) if f]}, open(out, 'w'))
    print(f'{src}: {len(keys)} keyframes, face missing in {miss:.0%} of samples')


def eased(keys, t):
    """--crop-x at time t, eased between keyframes the way short.mjs does it"""
    for (t0, x0), (t1, x1) in zip(keys, keys[1:]):
        if t0 <= t < t1:
            u = min(1, max(0, (t - t0) / max(t1 - t0, 1e-3)))
            return x0 + (x1 - x0) * u * u * (3 - 2 * u)
    return keys[-1][1] if t >= keys[-1][0] else keys[0][1]


def clip(src, start, end, *args):
    d = json.load(open(src))
    a, b = float(start), float(end)
    keys = d['keys']
    cx = [[a, eased(keys, a)]] + [k for k in keys if a < k[0] < b] + [[b, eased(keys, b)]]
    print(','.join(f'{t:.2f}:{x:.4f}' for t, x in cx))

    below = arg(args, '--below', 1.0)
    aspect = d['w'] / d['h']  # a face width (a fraction of the frame's width) as a fraction of its height
    tr = [f for f in d['track'] if a - 1 <= f[0] <= b]
    if not tr:
        print(860)
        return
    med = [statistics.median(g[3] for g in tr[max(0, i - 4):i + 5]) for i in range(len(tr))]
    runs = []  # [kind, start, faces]
    for f, w in zip(tr, med):
        kind = 'close' if w > 0.13 else 'wide'
        if runs and runs[-1][0] == kind:
            runs[-1][2].append(f)
        else:
            runs.append([kind, f[0], [f]])
    shots = []  # a run under 2 s is folded into the shot before
    for r in runs:
        if shots and (r[2][-1][0] - r[1] < 2 or shots[-1][0] == r[0]):
            shots[-1][2] += r[2]
        else:
            shots.append(r)
    tops = []
    for kind, t0, fs in shots:
        cy, w = statistics.median(f[2] for f in fs), statistics.median(f[3] for f in fs)
        top = int(min(TOP_MAX, max(TOP_MIN, (cy + below * w * aspect) * 1920)) // 10 * 10)
        if not tops or tops[-1][1] != top:
            tops.append([max(t0, a) if tops else a, top])
    print(','.join(f'{t:.2f}:{v}' for t, v in tops) if len(tops) > 1 else tops[0][1])


def cropexpr(src, start='0'):
    """the --crop-x keyframes as one ffmpeg expression in clip time, for a contact sheet of the whole crop:
    ffmpeg -ss 12 -copyts -i <video> -vf "fps=1/6,crop=ih*9/16:ih:'(iw-ih*9/16)*(EXPR)':0,scale=108:192,tile=16x4" ..."""
    keys = [[t - float(start), x] for t, x in json.load(open(src))['keys']]
    e = str(keys[-1][1])
    for (t0, x0), (t1, x1) in reversed(list(zip(keys, keys[1:]))):
        u = f'clip((t-{t0:.3f})/{max(t1 - t0, 0.001):.3f},0,1)'
        e = f'if(lt(t,{t1:.3f}),{x0}+{x1 - x0:.4f}*{u}*{u}*(3-2*{u}),{e})'
    print(e)


if __name__ == '__main__':
    cmd, *rest = sys.argv[1:]
    {'track': track, 'clip': clip, 'cropexpr': cropexpr}[cmd](*rest)
