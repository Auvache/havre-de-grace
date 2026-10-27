"""
When a burned-in caption is on screen, so a cut never lands while a line is up.

    python caption_band.py <video> <from> <to> [--band 940:1040]

Prints each moment in [from, to] where the caption band turns ON or off. A
frame counts as ON when more than 400 pixels of the band are near-white
(> 235): the captions the user's editor burns in are white, and the background
behind them (shirt, wall, guitar) has almost none. `--band` is the caption's y
range in the 1080 x 1920 frame. Find it from a still with a caption showing;
the default fits Insane, Okay and St George (text at about y 990).

Whisper's timestamps are not enough for this: the editor holds each caption
until the next line, or nearly. On St George "Don't send angels, just the aid"
stays up for three seconds after Whisper says the line ended.
"""
import argparse
import subprocess

import numpy as np

p = argparse.ArgumentParser()
p.add_argument("video")
p.add_argument("start", type=float)
p.add_argument("end", type=float)
p.add_argument("--band", default="940:1040")
p.add_argument("--fps", type=float, default=30)
a = p.parse_args()
y0, y1 = map(int, a.band.split(":"))
W, H = 1080, y1 - y0

raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a.start), "-to", str(a.end), "-i", a.video,
                      "-vf", f"crop={W}:{H}:0:{y0},format=gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
white = (np.frombuffer(raw, np.uint8).reshape(-1, H, W) > 235).sum(axis=(1, 2))
prev = None
for i, c in enumerate(white):
    on = c > 400
    if on != prev:
        print(f"{a.start + i / a.fps:7.2f}  {'ON ' if on else 'off'}  ({c})")
        prev = on
