"""
Master a live mix for the Artichoke videos (see LIVE.md), at -14 LUFS / -1 dBTP.

  python live-master.py Andalusia.wav outdir            # all four, for an A/B
  python live-master.py Andalusia.wav outdir 2-full     # one
  python live-master.py Conman.wav outdir 2-full --match Andalusia.wav

--match moves the mix halfway toward the reference mix's tonal balance (broad,
octave-smoothed, at most +/-4 dB, linear phase with its delay removed so sync
holds) before the chain, so a set mixed brighter or thinner in places still
sounds like one set. Andalusia is the reference: its 2-full master was approved.

Needs numpy scipy soundfile pedalboard pyloudnorm (a venv in the scratchpad).
Variants, all loudness-matched so a comparison is fair:
  0-original  the mix as Parker left it, only brought up to loudness
  1-glue      30 Hz HPF, +1.5 dB low shelf, 2:1 bus glue
  2-full      1-glue plus a 300 Hz dip, presence and air, parallel compression,
              +3 dB side (the mix is near-mono), a short 1.4 s plate at -17 dB
  3-space     2-full with a 2.2 s plate at -13 dB and +4.5 dB side

For a mix that comes out thin (Song 1 and 2's guitar: 8 dB under Andalusia at
80 Hz, 4 dB at 160 Hz, and 3-6 dB brighter from 1 to 8 kHz), match fully with
`--match-amount 1` and use one of:
  4-body      2-full with the guitar's body brought up (+3 dB shelf at 100 Hz,
              +2 dB at 160 Hz) and the boxiness under it cut (-3.5 dB at 260 Hz),
              the plate down to -20 dB
  5-punch     4-body plus a transient lift on each strum (up to +4 dB), harder
              parallel compression and a little parallel tape-like saturation
              for thickness (and more air, which the saturation dulls)
  6-big       5-punch with more low end, a wider image (+4.5 dB side) and a
              slightly longer plate

5-punch was then heard as too boomy (the full match lifts everything under
1 kHz and darkens the top), and something punchier and a little harsher was
asked for. These keep the halfway match, so the top stays as bright as
2-full, tighten the low end and put the punch in the attacks and upper mids.
They run from cleanest to harshest:
  7-tight     70 Hz HPF, body at 150 Hz (+3 dB, half of 5-punch's), the mud at 280 Hz out,
              +2 dB presence; a transient lift and parallel compression
  8-snap      7-tight with a harder transient lift (up to +8 dB) and drier
  9-bite      7-tight with +3.5 dB at 2.5 kHz and saturation of the upper mids
              (800 Hz-6 kHz) for edge
  10-edge     9-bite pushed: a tighter low end (90 Hz HPF), +2 dB at 4 kHz,
              harder saturation
"""
import sys, os, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import fftconvolve, butter, sosfilt, resample_poly, welch, firwin2
from pedalboard import (Pedalboard, HighpassFilter, LowpassFilter, LowShelfFilter, HighShelfFilter,
                        PeakFilter, Compressor, Limiter, Gain)

TARGET = -14.0
CEIL = -1.0

def true_peak_db(x):
    up = resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.abs(up).max() + 1e-12)

def plate_ir(sr, rt60=1.9, predelay=0.022, seed=7):
    """Stereo, decorrelated, darkening-as-it-decays plate-ish IR."""
    rng = np.random.default_rng(seed)
    n = int(sr * rt60 * 1.3)
    t = np.arange(n) / sr
    out = np.zeros((n, 2))
    # three bands, each with its own decay: lows a touch shorter (no mud), highs much shorter (warm)
    bands = [((180, 900), rt60 * 0.85), ((900, 4000), rt60), ((4000, 9000), rt60 * 0.45)]
    for ch in range(2):
        noise = rng.standard_normal(n)
        acc = np.zeros(n)
        for (lo, hi), rt in bands:
            sos = butter(2, [lo, hi], btype='band', fs=sr, output='sos')
            acc += sosfilt(sos, noise) * np.exp(-6.91 * t / rt)
        # soft onset so it blooms rather than clicks
        acc *= np.minimum(1, t / 0.012)
        out[:, ch] = acc
    out /= np.sqrt((out ** 2).sum(axis=0, keepdims=True))
    pad = np.zeros((int(sr * predelay), 2))
    return np.vstack([pad, out])

def reverb(x, sr, rt60, wet_db, predelay):
    ir = plate_ir(sr, rt60, predelay)
    mono = x.mean(axis=1)
    send = Pedalboard([HighpassFilter(220), LowpassFilter(8000)])(mono[None, :].astype(np.float32), sr)[0]
    wet = np.stack([fftconvolve(send, ir[:, c])[: len(x)] for c in range(2)], axis=1)
    # level the return relative to the dry signal's RMS
    g = 10 ** (wet_db / 20) * np.sqrt(np.mean(x ** 2)) / (np.sqrt(np.mean(wet ** 2)) + 1e-12)
    return x + wet * g

def widen(x, side_gain_db):
    m = (x[:, 0] + x[:, 1]) / 2
    s = (x[:, 0] - x[:, 1]) / 2
    s *= 10 ** (side_gain_db / 20)
    return np.stack([m + s, m - s], axis=1)

def parallel(x, sr, blend_db):
    crush = Pedalboard([Compressor(threshold_db=-32, ratio=6, attack_ms=8, release_ms=120)])
    c = crush(x.T.astype(np.float32), sr).T
    # level-match the crushed copy, then tuck it under
    c *= np.sqrt(np.mean(x ** 2)) / (np.sqrt(np.mean(c ** 2)) + 1e-12)
    return x + c * 10 ** (blend_db / 20)

def finish(x, sr, target=TARGET):
    meter = pyln.Meter(sr)
    x = x * 10 ** ((target - meter.integrated_loudness(x)) / 20)
    for _ in range(6):
        y = Pedalboard([Limiter(threshold_db=CEIL - 0.6, release_ms=120)])(x.T.astype(np.float32), sr).T.astype(np.float64)
        y = np.clip(y, -1, 1)
        tp = true_peak_db(y)
        if tp > CEIL:
            y *= 10 ** ((CEIL - tp - 0.05) / 20)
        lu = meter.integrated_loudness(y)
        if abs(lu - target) < 0.1:
            break
        x *= 10 ** ((target - lu) / 20)
    return y

def match(x, sr, ref, amount=0.5, cap=4.0):
    cap = max(cap, 6.0 * amount)
    """Halfway (amount) toward ref's long-term spectrum, octave-smoothed, capped."""
    def ltas(y):
        f, p = welch(y.mean(axis=1), sr, nperseg=16384)
        return f, 10 * np.log10(p + 1e-20)
    f, a = ltas(x)
    _, b = ltas(ref)
    diff = b - a
    # one-octave smoothing on a log axis
    sm = np.empty_like(diff)
    for i, fc in enumerate(f):
        band = (f >= fc / np.sqrt(2)) & (f <= fc * np.sqrt(2))
        sm[i] = diff[band].mean() if band.any() else 0
    gain = np.clip(sm - np.interp(1000, f, sm), -cap / amount, cap / amount) * amount  # level-neutral at 1 kHz
    gain[f < 40] = gain[np.searchsorted(f, 40)]
    gain[f > 16000] = gain[np.searchsorted(f, 16000)]
    taps = firwin2(4097, f / (sr / 2), 10 ** (gain / 20))
    d = (len(taps) - 1) // 2
    y = np.stack([fftconvolve(x[:, c], taps)[d:d + len(x)] for c in range(2)], axis=1)
    for fc in (63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000):
        print(f'  match {fc:>5} Hz {np.interp(fc, f, gain):+.1f} dB')
    return y

def transients(x, sr, amount=0.6, most_db=4.0):
    """Lift each attack: the gain follows how far a fast envelope runs ahead of a slow one."""
    from scipy.signal import lfilter
    m = np.abs(x).mean(axis=1)
    pole = lambda ms: np.exp(-1 / (sr * ms / 1000))
    env = lambda ms: lfilter([1 - pole(ms)], [1, -pole(ms)], m) + 1e-9
    db = np.clip(amount * 20 * np.log10(env(2) / env(45)), 0, most_db)
    db = lfilter([1 - pole(3)], [1, -pole(3)], db)
    return x * (10 ** (db / 20))[:, None]

def saturate(x, sr, blend_db=-12, drive=3.0, band=(70, 4000)):
    """Parallel soft clipping of a band (the guitar's range), level-matched and tucked under."""
    sos = butter(2, list(band), btype='band', fs=sr, output='sos')
    band = sosfilt(sos, x, axis=0)
    band /= np.abs(band).max() + 1e-12
    sat = np.tanh(drive * band)
    sat *= np.sqrt(np.mean(x ** 2)) / (np.sqrt(np.mean(sat ** 2)) + 1e-12)
    return x + sat * 10 ** (blend_db / 20)

def tone(x, sr, chain):
    return Pedalboard(chain)(x.T.astype(np.float32), sr).T.astype(np.float64)

def variant(name, x, sr):
    glue = Compressor(threshold_db=-24, ratio=2, attack_ms=30, release_ms=250)
    if name == '0-original':
        return x
    if name == '1-glue':
        y = tone(x, sr, [HighpassFilter(30), LowShelfFilter(90, 1.5, 0.7), glue])
        return y
    if name == '2-full':
        y = tone(x, sr, [HighpassFilter(32), LowShelfFilter(90, 1.5, 0.7), PeakFilter(300, -2.0, 0.9),
                         PeakFilter(3200, 1.5, 0.7), HighShelfFilter(9000, 2.0, 0.7), glue])
        y = parallel(y, sr, -9)
        y = widen(y, 3)
        y = reverb(y, sr, rt60=1.4, wet_db=-17, predelay=0.02)
        return y
    if name == '3-space':
        y = tone(x, sr, [HighpassFilter(32), LowShelfFilter(90, 1.5, 0.7), PeakFilter(300, -2.0, 0.9),
                         PeakFilter(3200, 1.5, 0.7), HighShelfFilter(9000, 2.0, 0.7), glue])
        y = parallel(y, sr, -9)
        y = widen(y, 4.5)
        y = reverb(y, sr, rt60=2.2, wet_db=-13, predelay=0.028)
        return y
    if name in ('4-body', '5-punch', '6-big'):
        big = name == '6-big'
        y = tone(x, sr, [HighpassFilter(35), LowShelfFilter(100, 4.5 if big else 3.0, 0.7), PeakFilter(160, 2.0, 1.0),
                         PeakFilter(260, -3.5, 1.2), PeakFilter(3000, 1.5, 0.8),
                         HighShelfFilter(8000, 2.0 if name == '4-body' else 3.5, 0.7), glue])
        if name == '4-body':
            y = parallel(y, sr, -9)
        else:
            y = transients(y, sr)
            y = parallel(y, sr, -5)
            y = saturate(y, sr)
        y = widen(y, 4.5 if big else 3)
        y = reverb(y, sr, rt60=1.8 if big else 1.4, wet_db=-18 if big else -20, predelay=0.024)
        return y
    if name in ('7-tight', '8-snap', '9-bite', '10-edge'):
        edge = name == '10-edge'
        chain = [HighpassFilter(90 if edge else 70), PeakFilter(150, 3.0, 1.0), PeakFilter(280, -3.0, 1.2),
                 PeakFilter(3200, 2.0, 0.8), HighShelfFilter(9000, 2.0, 0.7)]
        if name in ('9-bite', '10-edge'):
            # The saturation thickens the mids and so dulls the top: the shelf puts it back.
            chain += [PeakFilter(2500, 3.5, 1.0), HighShelfFilter(7000, 3.0 if edge else 2.0, 0.7)]
        if edge:
            chain.append(PeakFilter(4000, 2.0, 1.2))
        y = tone(x, sr, chain + [glue])
        snap = name == '8-snap'
        y = transients(y, sr, amount=1.6 if snap else 0.8, most_db=8.0 if snap else 5.0)
        y = parallel(y, sr, -6)
        if name in ('9-bite', '10-edge'):
            y = saturate(y, sr, blend_db=-9 if edge else -12, drive=6.0 if edge else 4.0, band=(800, 6000))
        y = widen(y, 3)
        y = reverb(y, sr, rt60=1.2, wet_db=-24 if snap else -20, predelay=0.02)
        return y
    raise SystemExit(name)

if __name__ == '__main__':
    args = sys.argv[1:]
    ref = None
    amount = 0.5
    if '--match-amount' in args:
        i = args.index('--match-amount')
        amount = float(args[i + 1])
        del args[i:i + 2]
    if '--match' in args:
        i = args.index('--match')
        ref = args[i + 1]
        del args[i:i + 2]
    src, outdir, *names = args
    names = names or ['0-original', '1-glue', '2-full', '3-space']
    os.makedirs(outdir, exist_ok=True)
    x, sr = sf.read(src)
    if ref:
        x = match(x, sr, sf.read(ref)[0], amount)
    meter = pyln.Meter(sr)
    for n in names:
        y = finish(variant(n, x, sr), sr)
        sf.write(os.path.join(outdir, f'{n}.wav'), y.astype(np.float32), sr, subtype='FLOAT')
        print(n, 'LUFS', round(meter.integrated_loudness(y), 2), 'TP', round(true_peak_db(y), 2),
              'L/R corr', round(np.corrcoef(y[:, 0], y[:, 1])[0, 1], 3))
