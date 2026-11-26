#!/usr/bin/env python3
"""Build public/rania/mix.mp3 = narrator (vo.mp3) + synthesized score + foley + room tone, mastered to -14 LUFS. numpy + scipy + ffmpeg, no samples.
The score stops dead on "Semua diam" (58.94 s), stays thin for the turn, returns as one warm chord on the nota (80.45 s) and thins to toy piano at the end.
   python3 tools/make_audio.py   (from src/videos/02_rania_cicilan)"""
import os, subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter
HERE = os.path.dirname(os.path.abspath(__file__)); PUB = os.path.abspath(os.path.join(HERE, '../../../../public/rania'))
SR = 44100; DUR = 104.9; N = int(DUR * SR); rng = np.random.default_rng(7)
mtof = lambda m: 440.0 * 2 ** ((m - 69) / 12)
tt = lambda d: np.arange(int(d * SR)) / SR
ex = lambda d, k: np.exp(-tt(d) / k)
lp = lambda x, f: lfilter([1 - np.exp(-2 * np.pi * f / SR)], [1, -np.exp(-2 * np.pi * f / SR)], x)
def put(buf, x, t, g=1.0):
    i = int(t * SR); x = x[:max(0, N - i)]
    if i < N: buf[i:i + len(x)] += x * g
def pluck(m, d=.4): f = mtof(m); q = tt(d); return (np.sin(2 * np.pi * f * q) + .35 * np.sin(4 * np.pi * f * q)) * ex(d, .1)
def toy(m, d=.9): f = mtof(m); q = tt(d); return (np.sin(2 * np.pi * f * q) * ex(d, .3) + .45 * np.sin(2 * np.pi * f * 2.76 * q) * ex(d, .1) + .2 * np.sin(2 * np.pi * f * 5.4 * q) * ex(d, .05))
def rhodes(m, d=3.0): f = mtof(m); q = tt(d); return (np.sin(2 * np.pi * f * q) * ex(d, 1.1) + .35 * np.sin(2 * np.pi * f * 2 * q) * ex(d, .5) + .12 * np.sin(2 * np.pi * f * 7 * q) * ex(d, .08)) * np.minimum(1, q / .01)
def theremin(m, d=.6, vib=5.5): f = mtof(m); q = tt(d); ph = 2 * np.pi * np.cumsum(f * (1 + .006 * np.sin(2 * np.pi * vib * q))) / SR; return np.sin(ph) * np.sin(np.pi * q / d) ** .5
def noise(d): return rng.standard_normal(int(d * SR))
# ---------- narrator ----------
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PUB, 'vo.mp3'), '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
v = np.tanh(v * 2.2 / max(1e-6, np.percentile(np.abs(v), 99.5))) * .8        # gentle level-up + soft clip
VO = np.zeros(N); VO[:min(N, len(v))] = v[:N]
rms_v = np.sqrt(np.mean(VO[np.abs(VO) > .02] ** 2))
# ---------- score ----------
BPM = 108; beat = 60 / BPM; MU = np.zeros(N)
def seg(t0, t1, fn):
    t = t0
    while t < t1 - 1e-6: fn(t); t += beat / 2
bars = [(45, 57, 60, 64), (43, 55, 59, 62), (41, 53, 57, 60), (40, 52, 56, 59)]   # Am, G, F, E7 (bass, then toy arp notes)
def minor(t):
    k = int(round(t / (beat / 2))); bass, a, b, c = bars[(k // 8) % 4]
    if k % 4 == 0: put(MU, pluck(bass, .45), t, 1.0)
    put(MU, toy([a, b, c, b][k % 4] + 12, .5), t, .45)
def sparse(t):
    k = int(round(t / (beat / 2)))
    if k % 8 == 0: put(MU, pluck(45, .8), t, .7)
    if k % 8 == 4: put(MU, toy(69, .8), t, .25)
def major(t):
    k = int(round(t / (beat / 2))); ch = [(48, 60, 64, 67), (43, 59, 62, 67), (45, 60, 64, 69), (41, 60, 64, 65)][(k // 8) % 4]
    if k % 4 == 0: put(MU, pluck(ch[0], .5), t, .8)
    put(MU, toy(ch[[1, 2, 3, 2][k % 4]] + 12, .5), t, .4)
def thin(t):
    k = int(round(t / (beat / 2))); put(MU, toy([72, 76, 79, 76][k % 4], .7), t, .35)
seg(0.0, 58.94, minor)
for i, t in enumerate(np.arange(60.5, 80.4, beat * 2)): put(MU, pluck(45 if i % 2 == 0 else 44, 1.0), t, .55)   # tension: slow low pulse
put(MU, theremin(76, 1.4), 70.0, .12); put(MU, theremin(75, 1.2), 72.0, .12)
for m in (48, 64, 67, 71, 72): put(MU, rhodes(m, 3.2), 80.45, .55 if m > 50 else .8)                                # one warm chord on the nota
seg(83.0, 97.1, major); seg(97.1, 104.2, thin); put(MU, toy(84, 1.2), 104.2, .4)
MU[int(58.94 * SR):int(60.52 * SR)] = 0                                                                           # the score stops dead (no tail)
fade = np.linspace(1, 0, int(.03 * SR)); MU[int(58.94 * SR) - len(fade):int(58.94 * SR)] *= fade
MU = lp(MU, 5000); MU *= .20 * rms_v / max(1e-6, np.sqrt(np.mean(MU[np.abs(MU) > 1e-4] ** 2)))
# ---------- foley + room tone ----------
FX = np.zeros(N)
def pop(): d = .12; q = tt(d); return np.sin(2 * np.pi * np.cumsum(600 + 900 * q / d) / SR) * ex(d, .04) * .8
def blip(): d = .12; q = tt(d); return np.sin(2 * np.pi * np.cumsum(700 + 1500 * q / d) / SR) * ex(d, .05) * .6
def tink(): d = .35; q = tt(d); return (np.sin(2 * np.pi * 2350 * q) * ex(d, .09) + .5 * np.sin(2 * np.pi * 3720 * q) * ex(d, .05)) * .7
def tick(): d = .06; return lp(noise(d), 4000) * ex(d, .008) * 1.2
def fwump(): d = .6; q = tt(d); return (np.sin(2 * np.pi * 55 * q) * ex(d, .2) + lp(noise(d), 700) * ex(d, .15) * .5) * .9
def cough(): d = .28; q = tt(d); return lp(noise(d), 1800) * ex(d, .07) * (1 + .6 * np.sin(2 * np.pi * 28 * q)) * .6
def pat(): d = .18; q = tt(d); return np.sin(2 * np.pi * 140 * q) * ex(d, .05) * .8
for t in (0.45, 1.95, 2.95, 99.75): put(FX, pop(), t, .5)
for t in (17.8, 26.24, 33.48, 35.54, 38.9, 42.02, 55.02): put(FX, blip(), t, .35)
for t in (59.25, 59.95): put(FX, tick(), t, .5)
put(FX, tink(), 60.75, .6); put(FX, fwump(), 80.5, .8)
for t in (89.6, 90.3): put(FX, cough(), t, .6)
put(FX, tink(), 92.3, .4); put(FX, pat(), 94.9, .5); put(FX, pop(), 101.65, .4)
FX *= .9 * rms_v / .25 * .25
room = lp(noise(DUR), 700) * 0.0035 * rms_v / .1                                                                    # faint outdoor air, never stops (also in the dead air)
mix = VO + MU + FX + room
mix = np.tanh(mix * 0.9) / 0.9
wavfile.write('/tmp/rania_mix.wav', SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', '/tmp/rania_mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '192k', os.path.join(PUB, 'mix.mp3')], check=True)
print('mix.mp3 written', os.path.getsize(os.path.join(PUB, 'mix.mp3')) // 1024, 'KB')
