"""Hey, Player — mix 1, following docs/mix-master-workflow.md.

Usage: python -I hey-player-mix.py <src Audio Files dir> <dest Audio Files dir (copy)> <out dir> <reference wav> [log.json]
Needs: numpy scipy soundfile pyloudnorm (a throwaway venv is fine).
Reads the original takes, writes processed takes into the copy's Media folder
(same names, lengths, formats), and renders the bounce + master WAVs.
Region offsets in REG were decoded from the project's Alternatives/000/ProjectData
('gRuA' chunks: u64 file offset, u64 file-anchor position, u64 length, in samples).
"""
import sys, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt, welch, resample_poly, fftconvolve
from scipy.ndimage import uniform_filter1d, minimum_filter1d

SRC, DST, OUT, REF = sys.argv[1:5]
sr = 44100
log = {}
def db(x): return 20 * np.log10(np.maximum(x, 1e-12))
def peak_db(x): return float(db(np.abs(x).max()))

# ---------- arrangement decoded from ProjectData (samples) ----------
BAR = 105840  # 2.4 s at 100 BPM
REG = {  # file, file offset of region, length, timeline start (0 = guitar region start = bar 1)
    'vocal#04':       dict(off=BAR, n=2857680, t0=2 * BAR),
    'vocal#05':       dict(off=BAR, n=4714334, t0=29 * BAR),
    'main guitar#02': dict(off=BAR, n=8597173, t0=0),
}
T = 8597173  # timeline length

# ---------- RBJ biquads ----------
def peaking(f0, gain_db, q):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / sr; al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]])
def shelf(f0, gain_db, q, high):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / sr; al = np.sin(w) / (2 * q); c = np.cos(w); s = 2 * np.sqrt(A) * al
    if high:
        b = [A * ((A + 1) + (A - 1) * c + s), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - s)]
        a = [(A + 1) - (A - 1) * c + s, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - s]
    else:
        b = [A * ((A + 1) - (A - 1) * c + s), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - s)]
        a = [(A + 1) + (A - 1) * c + s, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - s]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]])
def hpf(f, order=4): return butter(order, f, btype='high', fs=sr, output='sos')
def lpf(f, order=2): return butter(order, f, btype='low', fs=sr, output='sos')
def chain(x, sos_list):
    for s in sos_list: x = sosfilt(s, x, axis=0)
    return x
def eq_gain_at(sos_list, freqs):
    from scipy.signal import sosfreqz
    tot = np.zeros(len(freqs))
    for s in sos_list:
        _, h = sosfreqz(s, worN=freqs, fs=sr); tot += db(np.abs(h))
    return tot

# ---------- compressor (feed-forward, RMS detector, dB-domain attack/release) ----------
def comp_gain(det, thr_db, ratio, att_ms, rel_ms, rms_ms=10, hop=22):
    p = np.maximum(uniform_filter1d(det ** 2, max(1, int(rms_ms * sr / 1000))), 0)
    lv = 10 * np.log10(p[::hop] + 1e-20)
    tgt = np.maximum(0, lv - thr_db) * (1 - 1 / ratio)
    ca = np.exp(-hop / (att_ms * sr / 1000)); cr = np.exp(-hop / (rel_ms * sr / 1000))
    g = np.empty_like(tgt); s = 0.0
    for i, v in enumerate(tgt):
        s = ca * s + (1 - ca) * v if v > s else cr * s + (1 - cr) * v
        g[i] = s
    gr = np.interp(np.arange(len(det)), np.arange(len(g)) * hop, g)
    return gr  # dB of reduction (positive)

# ---------- K-weighting for balance decisions ----------
_m = pyln.Meter(sr)
def kweight(x):
    for f in _m._filters.values(): x = f.apply_filter(x)
    return x
def frames_energy(x, win, hop):
    p = np.maximum(uniform_filter1d(x ** 2, win), 0)
    return p[hop // 2::hop]

# ======================= Step 1/4: load takes, gain staging =======================
raw = {k: sf.read(f'{SRC}/{k}.wav', always_2d=True)[0] for k in REG}
info = {k: sf.info(f'{SRC}/{k}.wav') for k in REG}
for k, x in raw.items():
    r = REG[k]; seg = x[r['off']:r['off'] + r['n']]
    log[f'step4_peak_in_region_{k}'] = peak_db(seg)
# Peaks sit around -5 to -6 dBFS (a little hot for the -18..-10 zone, under the -3 ceiling).
# Trim each to ~-10 dBFS peak at the input so plugin thresholds behave as the guide assumes.
trim = {}
vpk = max(np.abs(raw[k][REG[k]['off']:REG[k]['off'] + REG[k]['n']]).max() for k in ['vocal#04', 'vocal#05'])
trim['vocal'] = 10 ** (-10 / 20) / vpk
gpk = np.abs(raw['main guitar#02'][BAR:BAR + T]).max()
trim['guitar'] = 10 ** (-10 / 20) / gpk
log['step4_trim_db'] = {k: float(db(v)) for k, v in trim.items()}

# ======================= Step 3: phase =======================
# Vocal vs guitar: no bleed (xcorr ~0.01) -> polarity between tracks is moot.
# Guitar L/R (two mics): sum is 11 dB fuller at 150-400 Hz than inverted -> keep polarity.
# R leads L by 12 samples; aligning changed 150-400 Hz by +0.1 dB -> inaudible, not kept (G4).

# ======================= Steps 6/7: EQ =======================
VOX_EQ = [hpf(75),                      # rumble (31-60 Hz excess vs reference)
          peaking(750, -2.0, 2.0),      # boxy/cupped bump 630-800 Hz (+3 dB vs reference)
          peaking(3400, -2.5, 2.5)]     # honk/hardness, resonances at 2.85/3.6 kHz, +5 dB vs ref 3-4 kHz
GTR_EQ = [hpf(65),                      # rumble
          peaking(210, -2.5, 2.5),      # boom: 200-220 Hz sits well above the reference
          peaking(2600, -2.0, 1.5),     # the vocal's seat, centred under the vocal presence (~2.6-2.9 kHz)
          peaking(90, +2.5, 0.8)]       # body: low E (82 Hz) ~11 dB under the reference
# Vocal additive: none. Chest (150-220) already peaks at 200 Hz; air not needed (8-12 kHz on par with reference).
# Output gain compensation: sum of boosts on guitar = +2.5 dB at 90 Hz -> pull guitar output by ~1 dB
GTR_EQ_OUT = 10 ** (-1.0 / 20)

proc = {}
for k in ['vocal#04', 'vocal#05']:
    x = raw[k][:, 0] * trim['vocal']
    proc[k] = chain(x, VOX_EQ)
g = raw['main guitar#02'] * trim['guitar']
proc['main guitar#02'] = chain(g, GTR_EQ) * GTR_EQ_OUT
log['eq_vocal'] = 'HPF 75 Hz 24 dB/oct; -2.0 dB @ 750 Hz Q2.0; -2.5 dB @ 3.4 kHz Q2.5'
log['eq_guitar'] = 'HPF 65 Hz 24 dB/oct; -2.5 dB @ 210 Hz Q2.5; -2.0 dB @ 2.6 kHz Q1.5; +2.5 dB @ 90 Hz Q0.8; output -1 dB'

# ======================= Step 8: light compression (vocal 3:1, 25 ms; guitar none) =======================
def to_timeline_vocal(d):
    v = np.zeros(T)
    for k in ['vocal#04', 'vocal#05']:
        r = REG[k]; seg = d[k][r['off']:r['off'] + r['n']]; n = min(len(seg), T - r['t0'])
        v[r['t0']:r['t0'] + n] = seg[:n]
    return v
vt = to_timeline_vocal(proc)
lv10 = 10 * np.log10(np.maximum(uniform_filter1d(vt ** 2, 441), 0)[::441] + 1e-20)
voiced10 = lv10 > (np.percentile(lv10, 99) - 30)
p99 = np.percentile(lv10[voiced10], 99)
thr = p99 - 3.75  # 3:1 -> loudest lines get ~2.5 dB GR
for k in ['vocal#04', 'vocal#05']:
    gr = comp_gain(proc[k], thr, 3.0, 25, 150)
    proc[k] = proc[k] * 10 ** (-gr / 20)
    r = REG[k]; grr = gr[r['off']:r['off'] + r['n']]
    log[f'step8_GR_{k}'] = dict(p50=float(np.median(grr[grr > 0.01])) if (grr > 0.01).any() else 0, p99=float(np.percentile(grr, 99)), max=float(grr.max()), pct_time_over_1dB=float((grr > 1).mean() * 100))
# make-up so loudness matches pre-comp (G5) -- level is set by the balance step anyway
log['step8_threshold_dbfs'] = float(thr)

# ======================= Step 5: static balance =======================
vt = to_timeline_vocal(proc)
gt = proc['main guitar#02'][BAR:BAR + T]
gm = gt.mean(1)
vk, gk = kweight(vt.copy()), kweight(gm.copy())
W, H = int(0.4 * sr), int(0.05 * sr)
ev, eg = frames_energy(vk, W, H), frames_energy(gk, W, H)
vdb, gdb = 10 * np.log10(ev + 1e-20), 10 * np.log10(eg + 1e-20)
act = vdb > np.percentile(vdb, 99) - 25
TARGET = 6.5  # dB vocal over guitar (K-weighted, 400 ms, while singing)
static = TARGET - np.median((vdb - gdb)[act])
log['step5_vocal_static_gain_db'] = float(static)
for k in ['vocal#04', 'vocal#05']: proc[k] = proc[k] * 10 ** (static / 20)
vt = to_timeline_vocal(proc); vk = kweight(vt.copy())

# ======================= Step 9: volume automation =======================
# word/phrase segments from the vocal itself
h10 = 441
e10 = 10 * np.log10(np.maximum(uniform_filter1d(vt ** 2, h10), 0)[h10 // 2::h10] + 1e-20)
on = e10 > (np.percentile(e10, 99) - 28)
# close gaps < 150 ms, drop blips < 120 ms
def runs(mask):
    d = np.diff(np.r_[0, mask.astype(int), 0]); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))
segs = runs(on); merged = []
for a, b in segs:
    if merged and a - merged[-1][1] < 15: merged[-1] = (merged[-1][0], b)
    else: merged.append((a, b))
segs = [(a, b) for a, b in merged if b - a >= 12]
# split long phrases (> 1.6 s) at the quietest 10 ms frame near the middle so rides land per word-group
def split(a, b):
    if b - a <= 160: return [(a, b)]
    lo, hi = a + 50, b - 50; m = lo + int(np.argmin(e10[lo:hi]))
    return split(a, m) + split(m, b)
segs = [s for a, b in segs for s in split(a, b)]
kv = np.maximum(uniform_filter1d(vk ** 2, h10), 0)[h10 // 2::h10]; kg = np.maximum(uniform_filter1d(kweight(gm.copy()) ** 2, h10), 0)[h10 // 2::h10]
vox_gain_db = np.zeros(len(e10)); gtr_dip_db = np.zeros(len(e10))
moves = []; residual = []
# breath / sibilance guard: segments whose energy is mostly above 2 kHz are not words to ride
vhi = sosfilt(hpf(2000, 4), vt); vlo = sosfilt(butter(4, [80, 1000], btype='band', fs=sr, output='sos'), vt)
ehi = np.maximum(uniform_filter1d(vhi ** 2, h10), 0)[h10 // 2::h10]; elo = np.maximum(uniform_filter1d(vlo ** 2, h10), 0)[h10 // 2::h10]
skipped_breaths = 0
info = []  # (a, b, d, energy)
for a, b in segs:
    if ehi[a:b].sum() > elo[a:b].sum():
        skipped_breaths += 1; continue
    V = 10 * np.log10(kv[a:b].mean() + 1e-20); G = 10 * np.log10(kg[max(0, a - 20):b + 20].mean() + 1e-20)
    info.append((a, b, (V - G) - TARGET, kv[a:b].sum()))

# one pass of word-group rides. No bleed on the vocal, so the guide's ~2 dB cap (a bleed limit) is relaxed to -3/+3.5.
phrase_moves = 0; word_moves = 0; phrases = []
for a, b, d, _ in info:
    if abs(d) < 1.5: residual.append(d); continue
    wg = float(np.clip(-0.9 * d, -3.0, 3.5))
    vox_gain_db[a:b] = wg; word_moves += 1
    moves.append((a * 0.01, b * 0.01, round(wg, 2), 'vocal word'))
    left = d + wg
    if left < -1.5:   # still buried: dip the guitar underneath (guide step 5/9)
        dip = float(max(left, -1.5)); gtr_dip_db[a:b] = dip; moves.append((a * 0.01, b * 0.01, round(dip, 2), 'guitar dip'))
        left -= dip
    residual.append(left)
# plateau ramps: 40 ms in/out (4 points per move), placed by smoothing the step curve
def ramp(curve, ms):
    n = max(1, int(ms / 10)); return uniform_filter1d(curve, n, mode='nearest')
vox_curve = ramp(vox_gain_db, 40)
# guitar pass (last, lighter): +1 dB in intro/instrumental gaps (>5 s with no voice), -0.5 dB under dense lines
dens = uniform_filter1d(on.astype(float), 300)  # 3 s window
gtr_pass = np.zeros(len(e10))
gtr_pass[dens > 0.75] = -0.5
no_voice = uniform_filter1d(on.astype(float), 500) == 0  # 5 s window with no voice
gtr_pass[no_voice] = 1.0
gtr_curve = ramp(gtr_pass, 500) + ramp(gtr_dip_db, 40)
res = np.array(residual)
log['step9'] = dict(segments=len(segs), skipped_breaths=skipped_breaths, phrase_moves=phrase_moves, word_moves=word_moves, phrases=len(phrases),
                    guitar_dips=sum(1 for m in moves if m[3] == 'guitar dip'),
                    residual_abs_over_2dB=int((np.abs(res) > 2).sum()),
                    residual_spread_p10_p90=[float(np.percentile(res, 10)), float(np.percentile(res, 90))],
                    guitar_plus1_seconds=float(no_voice.sum() * 0.01), guitar_minus05_seconds=float((dens > 0.75).sum() * 0.01))
log['step9_moves'] = moves
up = lambda c: 10 ** (np.interp(np.arange(T), np.arange(len(c)) * h10 + h10 // 2, c) / 20)
vox_auto = up(vox_curve); gtr_auto = up(gtr_curve)

# write automation back into the per-file processed takes (file domain) -> baked stems
for k in ['vocal#04', 'vocal#05']:
    r = REG[k]; n = min(r['n'], T - r['t0'])
    proc[k][r['off']:r['off'] + n] *= vox_auto[r['t0']:r['t0'] + n]
proc['main guitar#02'][BAR:BAR + T] *= gtr_auto[:, None]

vt = to_timeline_vocal(proc)
gt = proc['main guitar#02'][BAR:BAR + T]

# ======================= Step 5 (cont.): pan — vocal centre, guitar 15% left, narrowed =======================
M, S = (gt[:, 0] + gt[:, 1]) / 2, (gt[:, 0] - gt[:, 1]) / 2
S *= 0.5  # G7: don't go wide
gl, gr_ = M + S, M - S
p = -0.15; Lg, Rg = np.sqrt((1 - p) / 2) * np.sqrt(2), np.sqrt((1 + p) / 2) * np.sqrt(2)
guitar_st = np.stack([gl * Lg, gr_ * Rg], 1)
vocal_st = np.stack([vt, vt], 1) * 10 ** (-3 / 20)
guitar_st *= 10 ** (-3 / 20) * 1.0

dry = guitar_st + vocal_st

# ======================= Step 10: shared space =======================
rng = np.random.default_rng(7)
ir_len = int(1.5 * sr); t = np.arange(ir_len) / sr
rt60 = 1.1; decay = np.exp(-6.91 * t / rt60)
pre = int(0.030 * sr)
ir = np.zeros((ir_len + pre, 2))
for ch in range(2):
    tail = rng.standard_normal(ir_len) * decay
    tail[:int(0.008 * sr)] *= np.linspace(0, 1, int(0.008 * sr))  # soft onset of diffuse field
    tail = sosfilt(lpf(5000, 1), tail)                               # air absorption
    ir[pre:, ch] = tail
    for tap in rng.uniform(0.004, 0.030, 8):                         # small-room early reflections
        ir[pre + int(tap * sr), ch] += rng.uniform(0.3, 0.6) * rng.choice([-1, 1]) * 4
ir /= np.sqrt((ir ** 2).sum(0, keepdims=True))
send = (vocal_st + guitar_st).mean(1)            # both tracks, same send level
send = chain(send, [hpf(300, 2), lpf(7000, 2)])  # low-cut ~300 Hz, high-cut ~7 kHz
wet = np.stack([fftconvolve(send, ir[:, c])[:T] for c in range(2)], 1)
L_dry = _m.integrated_loudness(dry); L_wet = _m.integrated_loudness(wet)
REV_LU = -21.0  # just audible when muted; the reference records are dry
wet *= 10 ** ((L_dry + REV_LU - L_wet) / 20)
log['step10_reverb'] = f'synthetic small room, RT60 {rt60}s, pre-delay 30 ms, send LC 300 Hz / HC 7 kHz, return {REV_LU} LU under dry'
bus = dry + wet

# ======================= Step 11: bus — saturation, then glue =======================
bus *= 0.5 / np.abs(bus).max()     # bus peaks at -6 dBFS into the saturator
k_drive = 1.0; bias = 0.08
def sat(x): return (np.tanh(k_drive * (x + bias)) - np.tanh(k_drive * bias)) / k_drive
diff = sat(bus) - bus
diff = sosfilt(lpf(4500, 2), diff, axis=0)       # Tone: high-cut on the distorted part (~4.5 kHz)
diff = sosfilt(hpf(20, 2), diff, axis=0)         # remove DC from the bias
bus_s = bus + diff
log['step11_saturation_added_energy_db'] = float(10 * np.log10((diff ** 2).sum() / (bus ** 2).sum()))
# loudness-match after saturation (G5)
bus_s *= 10 ** ((_m.integrated_loudness(bus) - _m.integrated_loudness(bus_s)) / 20)
det = np.abs(bus_s).max(1)
lvb = 10 * np.log10(np.maximum(uniform_filter1d(det ** 2, 2205), 0)[::2205] + 1e-20)
thr_b = np.percentile(lvb, 99) - 3.0            # 2:1 -> ~1.5 dB GR on the loudest choruses
grb = comp_gain(det, thr_b, 2.0, 80, 600, rms_ms=30)
bus_c = bus_s * 10 ** (-grb[:, None] / 20)
log['step11_buscomp'] = dict(threshold=float(thr_b), GR_p99=float(np.percentile(grb, 99)), GR_max=float(grb.max()), pct_time_over_0_5dB=float((grb > 0.5).mean() * 100))

# ======================= Step 1 (trim) + Step 13: bounce =======================
start = int(4.15 * sr)                    # one beat (0.6 s) of room before the first strum at 4.75 s
end = int(193.8 * sr)                     # before the bump at ~194.1 s
mix = bus_c[start:end].copy()
fi = int(0.02 * sr); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix *= 10 ** (-6 / 20) / np.abs(mix).max()
sf.write(f'{OUT}/Hey, Player mix 1 - unmastered.wav', mix, sr, subtype='PCM_24')

# ======================= Step 12: checks =======================
mono = mix.mean(1)
log['step12_LR_correlation'] = float(np.corrcoef(mix[:, 0], mix[:, 1])[0, 1])
log['step12_mono_minus_stereo_LU'] = float(_m.integrated_loudness(np.stack([mono, mono], 1)) - _m.integrated_loudness(mix))

# ======================= Step 14: master =======================
ref, _ = sf.read(REF)
def third(x):
    f, pw = welch(x, sr, nperseg=16384); fc = np.array([31.5 * 2 ** (i / 3) for i in range(28)])
    return fc, np.array([10 * np.log10(pw[(f > c * 2 ** (-1 / 6)) & (f < c * 2 ** (1 / 6))].mean() + 1e-20) for c in fc])
fc, a = third(mono); _, b = third(ref.mean(1)); dev = a - b
k1 = (fc > 700) & (fc < 1500); dev -= dev[k1].mean()
bands = {'low (60-150)': (fc >= 60) & (fc <= 150), 'mid (200-500)': (fc >= 200) & (fc <= 500),
         'presence (2.5-6k)': (fc >= 2500) & (fc <= 6400), 'air (8-16k)': (fc >= 8000) & (fc <= 16000)}
devs = {k: float(dev[m].mean()) for k, m in bands.items()}
log['step14_mix_vs_reference_dB'] = devs
mEQ = []
def mv(d): return float(np.clip(-d / 2, -1.5, 1.5)) if abs(d) > 2 else 0.0
if mv(devs['low (60-150)']): mEQ.append(shelf(120, mv(devs['low (60-150)']), 0.7, False))
if mv(devs['mid (200-500)']): mEQ.append(peaking(320, mv(devs['mid (200-500)']), 0.7))
if mv(devs['presence (2.5-6k)']): mEQ.append(peaking(4000, mv(devs['presence (2.5-6k)']), 0.7))
if mv(devs['air (8-16k)']): mEQ.append(shelf(10000, mv(devs['air (8-16k)']), 0.7, True))
log['step14_master_eq'] = {k: mv(v) for k, v in devs.items()}
m = chain(mix.copy(), mEQ) if mEQ else mix.copy()
# no master compression: bus is already glued (guide: "a well-glued mix often wants none")

def true_peak_db(x):
    return max(peak_db(resample_poly(x[:, c].astype(np.float32), 4, 1)) for c in range(x.shape[1]))
def limiter(x, ceil_db, la_ms=1.5, rel_ms=80, hop=32):
    c = 10 ** (ceil_db / 20); pk = np.abs(x).max(1)
    need = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    L = int(la_ms * sr / 1000)
    g = minimum_filter1d(need, 2 * L + 1, origin=-L)       # look ahead
    nb = len(g) // hop + 1; gp = np.pad(g, (0, nb * hop - len(g)), constant_values=1).reshape(nb, hop).min(1)
    cr = np.exp(-hop / (rel_ms * sr / 1000)); s = 1.0; out = np.empty(nb)
    for i, v in enumerate(gp):
        s = v if v < s else cr * s + (1 - cr) * v; out[i] = s
    gs = np.repeat(out, hop)[:len(g)]
    gs = np.minimum(uniform_filter1d(gs, L, mode='nearest'), g)
    return x * gs[:, None], float(db(gs.min()))
TARGET_LUFS, TP = -14.0, -1.0
m *= 10 ** ((TARGET_LUFS - _m.integrated_loudness(m)) / 20)
ceil = TP - 0.3
for it in range(8):
    out, maxgr = limiter(m, ceil)
    out *= 10 ** ((TARGET_LUFS - _m.integrated_loudness(out)) / 20)
    out, maxgr = limiter(out, ceil)
    tp = true_peak_db(out)
    if tp <= TP: break
    ceil -= (tp - TP) + 0.05
# fades: in ~0.5 s (on the room tone before the first strum), out 2 s
fin = int(0.5 * sr); out[:fin] *= np.linspace(0, 1, fin)[:, None] ** 2
fo = int(2.0 * sr); out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
sf.write(f'{OUT}/Hey, Player mix 1.wav', out, sr, subtype='PCM_24')

# ======================= Step 15: QC =======================
chk, _ = sf.read(f'{OUT}/Hey, Player mix 1.wav')
log['step15'] = dict(LUFS=float(_m.integrated_loudness(chk)), true_peak_dBTP=true_peak_db(chk), sample_peak=peak_db(chk),
                     limiter_max_GR_db=-maxgr, duration_s=len(chk) / sr,
                     first_half_second_peak=peak_db(chk[:sr // 2]), last_half_second_peak=peak_db(chk[-sr // 2:]),
                     clipped_samples=int((np.abs(chk) >= 0.9999).sum()))

# ======================= bake processed takes into the copy =======================
# same names / lengths / channel counts, 24-bit; a common trim keeps them clear of 0 dBFS
peak_all = max(np.abs(proc[k]).max() for k in proc)
bake = min(1.0, 10 ** (-3 / 20) / peak_all)
log['baked_common_trim_db'] = float(db(bake))
for k in proc:
    y = proc[k] * bake
    if raw[k].shape[1] == 1 and y.ndim == 1: y = y[:, None]
    assert y.shape == raw[k].shape, (k, y.shape, raw[k].shape)
    sf.write(f'{DST}/{k}.wav', y, sr, subtype='PCM_24')
print(json.dumps({k: v for k, v in log.items() if k != 'step9_moves'}, indent=1))
json.dump(log, open(sys.argv[5] if len(sys.argv) > 5 else '/dev/null', 'w'), indent=1)
