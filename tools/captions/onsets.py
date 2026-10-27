"""
The strongest guitar attacks (strums) inside time windows of a take, so a clip
can start on one and end just before the next.

    python onsets.py <audio16k.wav> 16.5-19.8 59-61.8 ...

Prints, per window, the five strongest onsets as `time(strength)` in time
order, at least 0.25 s apart. Strength is spectral flux: how much new energy
appears from one 10 ms hop to the next. The loudest one in a window is usually
the downbeat of a bar; strong onsets spaced evenly (2.54 s apart on Insane,
Okay, 2.08 s on St George) are the bar lines. Prefer those.

`audio16k.wav` is what `lyrics.py transcribe` writes. Needs numpy, which the
scratchpad venv already has because faster-whisper pulls it in.
"""
import sys
import wave

import numpy as np

w = wave.open(sys.argv[1])
sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
hop, win = sr // 100, 1024
frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop] * np.hanning(win)
mag = np.abs(np.fft.rfft(frames, axis=1))
flux = np.maximum(0, np.diff(np.log1p(mag * 10), axis=0)).sum(axis=1)
t = (np.arange(len(flux)) + 1) * hop / sr

for span in sys.argv[2:]:
    a, b = map(float, span.split("-"))
    idx = np.where((t >= a) & (t <= b))[0]
    picked = []
    for i in idx[np.argsort(flux[idx])[::-1]]:
        if all(abs(t[i] - t[j]) > 0.25 for j in picked):
            picked.append(i)
        if len(picked) == 5:
            break
    print(f"{span:>12}: " + "  ".join(f"{t[i]:.2f}({flux[i]:.0f})" for i in sorted(picked)))
