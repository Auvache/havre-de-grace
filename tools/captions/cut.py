"""
Cut one clip out of a longer take, frame-accurately, with short audio fades.

    python cut.py <video> <out.mp4> <from> <to> [--fade-out 1.0] [--fps 30]

`from` and `to` are seconds in the source. Both are snapped to the source's
frame grid, so the clip's first video frame and first audio sample line up
exactly. (Unsnapped, a cut at 13.88 starts the picture 20 ms after the sound.)
The audio fades in over 50 ms (just enough to stop a click) and out over
`--fade-out` seconds: about 0.3 when the clip ends right before the next
strum, 1–1.5 when it ends in a ringing chord, and 0.3 at the source's own end.

The video is re-encoded (libx264, CRF 17), since a stream copy can only cut on
keyframes. The audio becomes AAC at 192 kbps.
"""
import argparse
import subprocess

p = argparse.ArgumentParser()
p.add_argument("video")
p.add_argument("out")
p.add_argument("start", type=float)
p.add_argument("end", type=float)
p.add_argument("--fade-out", type=float, default=0.3)
p.add_argument("--fps", type=float, default=30)
a = p.parse_args()

start = round(a.start * a.fps) / a.fps
end = round(a.end * a.fps) / a.fps
dur = end - start
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-ss", f"{start:.6f}", "-i", a.video, "-t", f"{dur:.6f}",
    "-map", "0:v:0", "-map", "0:a:0",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-af", f"afade=t=in:d=0.05,afade=t=out:st={dur - a.fade_out:.3f}:d={a.fade_out}",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", a.out,
], check=True)
print(f"wrote {a.out}  ({start:.3f}-{end:.3f}, {dur:.2f} s)")
