"""
Where each mixed WAV falls in a live camera file, and where its music stops.

    python live-align.py <camera.mp4> <song.wav> [<song.wav> ...]

Prints, per WAV: its offset in the camera file (live.mjs --at), a drift check
(the offset re-measured on 20 s windows near the start and the end — a few ms
either way is measurement noise, more means the recorder's clock ran at a
different rate), the peak's margin over the next best match, and a guess at
--stop: the last moment the mix falls >8 dB within 60 ms and stays down, which
on Andalusia found the guitar's final damped stop at 193.22 s. Check the guess
against the level printout before trusting it — a song that rings out has no
cliff to find.

The mixes are the same performance as the camera's own audio (a mix of the
desk or close mics, the camera's mic hearing the room), so cross-correlation of
the waveforms peaks at one exact lag. Everything is decoded to mono 8 kHz
(0.125 ms resolution, plenty), and only the first 100 minutes of the camera are
searched — raise LIMIT for a longer file.

numpy and scipy are not installed system-wide: make a venv in the scratchpad,
`python3 -m venv venv && ./venv/bin/pip install numpy scipy`, and run with it.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
from scipy.signal import correlate

R = 8000
LIMIT = 6000  # seconds of camera to search


def decode(path, seconds=None):
    out = os.path.join(tempfile.mkdtemp(), "a.f32")
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if seconds:
        cmd += ["-t", str(seconds)]
    cmd += ["-i", path, "-vn", "-ac", "1", "-ar", str(R), "-f", "f32le", out]
    subprocess.run(cmd, check=True)
    return np.fromfile(out, np.float32)


def xc(a, b):
    """Where a occurs in b: (lag in samples, peak over next-best peak)."""
    c = np.abs(correlate(b, a, mode="valid", method="fft"))
    i = int(c.argmax())
    rest = c.copy()
    rest[max(0, i - R):i + R] = 0
    return i, c[i] / max(rest.max(), 1e-12)


def stop_guess(a):
    w = R // 100  # 10 ms
    n = len(a) // w
    db = 20 * np.log10(np.sqrt((a[: n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
    loud = np.median(db)
    for i in range(n - 7, 6, -1):
        if db[i - 6:i].max() - db[i:i + 6].max() > 8 and db[i - 6:i].mean() > loud - 6 and db[i:].max() < loud - 8:
            return i / 100
    return None


def clock(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:06.3f}"


cam = decode(sys.argv[1], LIMIT)
for wav in sys.argv[2:]:
    a = decode(wav)
    L = len(a) / R
    i, margin = xc(a, cam)
    at = i / R
    drift = []
    for s in (5, L - 25):
        seg = a[int(s * R):int((s + 20) * R)]
        lo = int((at + s - 1) * R)
        j, _ = xc(seg, cam[lo:lo + 22 * R])
        drift.append(((lo + j) / R - s - at) * 1000)
    stop = stop_guess(a)
    print(f"{os.path.basename(wav)}")
    print(f"  --at {at:.3f}   ({clock(at)} to {clock(at + L)}, {L:.2f} s)")
    print(f"  margin {margin:.1f}x over the next match   drift start {drift[0]:+.1f} ms, end {drift[1]:+.1f} ms")
    print(f"  --stop {stop:.2f} (guess; check it)" if stop else "  --stop: no clear cliff — find it by ear or level")
