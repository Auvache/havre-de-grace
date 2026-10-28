"""Every face OpenCV finds, 4 times a second: faces.py <video> <out.json>
Each sample is {t, faces: [[cx, cy, w], ...]} in fractions of the frame (cx, cy the centre)."""
import json, subprocess, sys

import cv2
import numpy as np

video, out = sys.argv[1], sys.argv[2]
W = 960
info = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                       '-of', 'csv=p=0', video], capture_output=True, text=True).stdout.strip().split(',')
iw, ih = int(info[0]), int(info[1])
H = round(W * ih / iw / 2) * 2
FPS = 4
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'fps={FPS},scale={W}:{H},format=gray',
                      '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
front = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
alt = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml')
prof = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
samples, i = [], 0
while True:
    buf = p.stdout.read(W * H)
    if len(buf) < W * H:
        break
    g = clahe.apply(np.frombuffer(buf, np.uint8).reshape(H, W))
    found = []
    for c, flip in ((front, False), (alt, False), (prof, False), (prof, True)):
        img = cv2.flip(g, 1) if flip else g
        for x, y, w, h in c.detectMultiScale(img, 1.1, 5, minSize=(24, 24)):
            if flip:
                x = W - x - w
            found.append((x + w / 2, y + h / 2, w))
    # merge overlapping boxes
    merged = []
    for cx, cy, w in sorted(found, key=lambda f: -f[2]):
        if all(abs(cx - m[0]) > m[2] * 0.6 or abs(cy - m[1]) > m[2] * 0.6 for m in merged):
            merged.append((cx, cy, w))
    samples.append({'t': round(i / FPS, 2), 'faces': [[round(cx / W, 4), round(cy / H, 4), round(w / W, 4)] for cx, cy, w in merged]})
    i += 1
json.dump({'w': iw, 'h': ih, 'fps': FPS, 'samples': samples}, open(out, 'w'))
print(f'{video}: {len(samples)} samples, {sum(1 for s in samples if s["faces"])} with a face')
