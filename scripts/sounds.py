# Çalgı örneklerini (sounds/) hazırlar. Bir kez çalıştırılır; çıktılar depoda durur.
#   python scripts/sounds.py <iowa_klasoru> <vcsl_darbuka_klasoru>
# Klarnet: University of Iowa Electronic Music Studios, Bb clarinet mf (theremin.music.uiowa.edu/MISBbclarinet.html,
#   "may be downloaded and used for any projects, without restrictions"). Her dosyada kromatik notalar sessizlikle ayrılır;
#   notalar bulunur, 3 yarım seste bir nota alınır, perdesi ölçülür, sürekli çalsın diye döngü noktası (perioda uygun,
#   çapraz geçişli) konur. Uygulama örneği playbackRate = hedef Hz / ölçülen Hz ile çalar; komalar tam çıkar.
# Darbuka: VCSL (Versilian Community Sample Library, CC0), Membranophones/Struck Membranophones/Darbuka.
# Çıktı: sounds/klarnet.wav, sounds/darbuka.wav (16 bit tek kanal) ve sounds/sounds.js (zaman çizelgesi).
import sys, os, glob, json
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "sounds")
SR = 32000

def mono(x): return x if x.ndim == 1 else x.mean(axis=1)
def to_sr(x, sr): return resample_poly(x, SR, sr) if sr != SR else x

def period(x, lo=60, hi=2200):
    # NSDF (McLeod) ile en güçlü ilk tepe, parabolik inceltme; örnek cinsinden period
    n = len(x); x = x - x.mean()
    f = np.fft.rfft(x, 2*n); r = np.fft.irfft(f*np.conj(f))[:n]
    m = np.cumsum(x[::-1]**2)[::-1]; m = m + m[0] - np.concatenate(([0], np.cumsum(x**2)[:-1]))
    nsdf = 2*r/np.maximum(m, 1e-12)
    a, b = int(SR/hi), int(SR/lo)
    seg = nsdf[a:b]; thr = 0.9*seg.max()
    i = a + int(np.argmax(seg >= thr))
    while i+1 < b and nsdf[i+1] > nsdf[i]: i += 1
    y0, y1, y2 = nsdf[i-1], nsdf[i], nsdf[i+1]
    return i + 0.5*(y0 - y2)/(y0 - 2*y1 + y2)

def notes_in(path):
    x, sr = sf.read(path); x = to_sr(mono(x), sr)
    hop = int(0.01*SR); fr = np.sqrt(np.convolve(x**2, np.ones(hop)/hop, "same"))[::hop]
    on = fr > fr.max()*10**(-30/20)
    segs, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            if (j - i)*0.01 > 1.2: segs.append((i*hop, j*hop))
            i = j
        else: i += 1
    out = []
    for s, e in segs:
        mid = x[s + int(0.6*SR): s + int(0.6*SR) + 4096]
        p = period(mid); hz = SR/p
        out.append({ "x": x[s:e], "hz": hz, "midi": 69 + 12*np.log2(hz/440) })
    return out

def onset(x):
    env = np.abs(x); k = int(np.argmax(env > env.max()*0.05))
    return max(0, k - int(0.004*SR))

def loop_note(n, total=1.35, loop=0.5, xf=0.12):
    x = n["x"][onset(n["x"]):].astype(np.float64)
    P = SR/n["hz"]; X = int(xf*SR)
    le0 = int(total*SR); L = int(round(round(loop*SR/P)*P)); ls = le0 - L
    # Tutulan bölgenin düzeyini düzleştir (döngüde ses kabarıp sönmesin): 60 ms'lik RMS zarfına böl,
    # döngü öncesinde 0,2 sn içinde düzeltmeye geç
    x = x[:le0 + 2*int(P) + 4096].copy()
    W = int(0.06*SR); env = np.sqrt(np.convolve(x**2, np.ones(W)/W, "same")) + 1e-9
    a0 = ls - X - int(0.2*SR); target = np.mean(env[ls-X:le0])
    ramp = np.clip((np.arange(len(x)) - a0)/(0.2*SR), 0, 1)
    x *= 1 + ramp*(target/env - 1)
    # Döngü sonu: çapraz geçiş bölgesi döngü başının öncesiyle en iyi örtüşen yer (bir period içinde ara);
    # örtüşen (aynı evreli) sesler doğrusal geçişle birleşince düzey düşmez ve kabarmaz
    ref = x[ls-X:ls]
    def corr(e):
        seg = x[e-X:e]; return float(np.dot(ref, seg)/np.sqrt(np.dot(seg, seg)*np.dot(ref, ref)))
    le = max(range(le0 - int(P), le0 + int(P) + 1), key=corr); L = le - ls
    w = np.linspace(0, 1, X)
    y = x[:le].copy()
    y[le-X:le] = x[le-X:le]*(1 - w) + ref*w
    # Ölçülen perde döngü bölgesinde yeniden (ezici çoğunluk duyulan kısım burası)
    hz = SR/np.median([period(y[ls+k:ls+k+4096]) for k in range(0, L-4096, 2048)])
    rms = np.sqrt(np.mean(y[ls:le]**2))
    return y/rms, hz, ls, le

def write(name, parts, meta):
    gap = np.zeros(int(0.05*SR)); buf, t = [], 0
    for p, m in zip(parts, meta):
        for k in ("start", "loopStart", "loopEnd", "end"):
            if k in m: m[k] = round((m[k] + t)/SR, 5)
        buf += [p, gap]; t += len(p) + len(gap)
    y = np.concatenate(buf); y = y/np.abs(y).max()*0.89
    sf.write(os.path.join(OUT, name), y, SR, subtype="PCM_16")
    return round(len(y)*2/1024)

def main(iowa, vcsl):
    os.makedirs(OUT, exist_ok=True)
    allnotes = []
    for f in sorted(glob.glob(os.path.join(iowa, "BbClar.mf.*.aiff"))): allnotes += notes_in(f)
    have = { int(round(n["midi"])): n for n in allnotes }
    print("bulunan notalar:", sorted(have))
    parts, meta = [], []
    for m in range(50, 97, 3):
        k = min(have, key=lambda q: abs(q - m))
        y, hz, ls, le = loop_note(have[k])
        parts.append(y*0.25); meta.append({ "hz": round(hz, 3), "start": 0, "loopStart": ls, "loopEnd": le })
        print(f"klarnet {k}: {hz:.2f} Hz ({69+12*np.log2(hz/440):.2f})")
    kb = write("klarnet.wav", parts, meta)

    # Darbuka: VCSL'de 5 vuruş türü x 2 şiddet (vl1 yumuşak, vl2 güçlü) x 2 tekrar. Spektruma göre 1 düm (143 Hz,
    # enerjinin %95'i 250 Hz altında), 2 tek (kenar, 730 Hz çınlama), 3 daha yumuşak kenar (ka). 4 ve 5 alınmadı.
    # Şiddetler arasındaki fark korunur (ortak ölçek).
    dparts, dmeta = [], []
    for f in sorted(glob.glob(os.path.join(vcsl, "Darbuka_[123]_*.wav"))):
        x, sr = sf.read(f); x = to_sr(mono(x), sr); x = x[onset(x):]
        name = os.path.basename(f)[:-4]; kind = { "1":"D", "2":"T", "3":"k" }[name[8]]
        x = x[:int((1.0 if kind == "D" else 0.35)*SR)]
        x = x*np.minimum(1, np.linspace(len(x)/(0.04*SR), 0, len(x)))   # son 40 ms sönüm
        dparts.append(x*0.5); dmeta.append({ "k": kind, "v": int(name[-5]), "id": name, "start": 0, "end": len(x) })
    db = write("darbuka.wav", dparts, dmeta)
    with open(os.path.join(OUT, "sounds.js"), "w", encoding="utf-8", newline="\n") as o:
        o.write("// scripts/sounds.py üretir. Zamanlar saniye; hz örneğin ölçülen perdesi.\n")
        o.write("const SOUND_MAP = " + json.dumps({ "klarnet": meta, "darbuka": dmeta }, ensure_ascii=False) + ";\n")
    print(f"klarnet.wav {kb} KB, darbuka.wav {db} KB")

if __name__ == "__main__": main(sys.argv[1], sys.argv[2])
