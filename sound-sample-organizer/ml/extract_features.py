import argparse
import csv
import re
from pathlib import Path

import librosa
import numpy as np
from scipy.stats import skew, kurtosis
import warnings

warnings.filterwarnings('ignore', category=UserWarning, module='librosa')

label_keywords = {
    "kick": ["kick", "bd", "kck", "kicks"],
    "snare": ["snare", "sd", "snr", "rim", "snares"],
    "clap": ["clap", "cp", "claps"],
    "hi_hat": ["hihat", "hi-hat", "hi_hat", "hat", "hh", "hithats"],
    "tom": ["tom"],
    "808": ["808S", "808", "808s"],
    "cymbal" : ["cymbal", "cymbals"],
    "open_hat": ["openhat", "open_hat", "openhats"],
}

formats = {".wav", ".flac", ".mp3", ".aif", ".aiff", ".ogg"}

def parse_filename(filename):
    lower = filename.lower()
    for label, aliases in label_keywords.items():
        for alias in aliases:
            if alias in lower:          
                return label
    return None

def get_feature_stats(values):
    return {
        "mean": np.mean(values),
        "std": np.std(values),
        "skew": skew(values),
        "kurtosis": kurtosis(values),
        "median": np.median(values),
        "min": np.min(values),
        "max": np.max(values),
    }

def extract_features(path):
    try:
        y, sr = librosa.load(path, sr=None, mono=True)

        feats = {"file": str(path)}
        
        feats["duration"] = librosa.get_duration(y=y, sr=sr)
        
        zcr = librosa.feature.zero_crossing_rate(y=y)[0]
        for stat, value in get_feature_stats(zcr).items():
            feats[f"zcr_{stat}"] = value

        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        for stat, value in get_feature_stats(spectral_centroid).items():
            feats[f"centroid_{stat}"] = value
        
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        for stat, value in get_feature_stats(spectral_rolloff).items():
            feats[f"rolloff_{stat}"] = value

        spectral_flatness = librosa.feature.spectral_flatness(y=y)[0]
        for stat, value in get_feature_stats(spectral_flatness).items():
            feats[f"flatness_{stat}"] = value

        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        for i in range(spectral_contrast.shape[0]):
             for stat, value in get_feature_stats(spectral_contrast[i]).items():
                feats[f"contrast{i+1}_{stat}"] = value

        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        for stat, value in get_feature_stats(spectral_bandwidth).items():
            feats[f"bandwidth_{stat}"] = value

        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        for i in range(mfccs.shape[0]):
            for stat, value in get_feature_stats(mfccs[i]).items():
                feats[f"mfcc{i+1}_{stat}"] = value
        
        feats["label"] = parse_filename(path.name) or "unknown"
        return feats

    except Exception as exc:
        print(f"[WARN] {path.name}: {exc}")
        return None

def extract_all(input_dir):
    files = [p for p in input_dir.rglob("*") if p.suffix.lower() in formats]
    if not files:
        raise SystemExit("no files inputted")

    print(f"processing {len(files)} files…")

    results = []
    for path in files:
        r = extract_features(path)
        if r:
            results.append(r)
    return results

def main():
    parser = argparse.ArgumentParser(description="extracting...")
    parser.add_argument("input_dir", type=Path, help="folder containing audio samples")
    parser.add_argument("output_csv", type=Path, help="csv to output")
    args = parser.parse_args()

    rows = extract_all(args.input_dir)

    fieldnames = sorted({k for row in rows for k in row.keys()})
    args.output_csv.parent.mkdir(parents=True, exist_ok=True)

    with args.output_csv.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

if __name__ == "__main__":
    main()
