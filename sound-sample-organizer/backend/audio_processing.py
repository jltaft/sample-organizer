import librosa
import numpy as np
import pandas as pd
import json
features = [
    "duration", "zcr", "centroid", "rolloff",
    "flatness", "contrast", "bandwidth"
]


# get bpm from file path
def get_bpm(path):
    y, sr = librosa.load(path)
    tempo = librosa.beat.beat_track(y=y, sr=sr)

    return path, tempo


# creates a numpy array feature vector from filepath to sample
# features we're extracting aren't finalized
def extract_feature_vector(path):
    y, sr = librosa.load(path, sr=None, mono=True)

    feature_scalars = [
        librosa.get_duration(y=y, sr=sr),
        np.mean(librosa.feature.zero_crossing_rate(y)),
        np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)),
        np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85)),
        np.mean(librosa.feature.spectral_flatness(y=y)),
        np.mean(librosa.feature.spectral_contrast(y=y)),
        np.mean(librosa.feature.spectral_bandwidth(y=y)),
    ]
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfcc, axis=1).tolist()

    feature_vector = np.array(feature_scalars + mfcc_mean, dtype=float)
    column_names = features + [f"mfcc{i+1}" for i in range(13)]
    df = pd.DataFrame([feature_vector], columns=column_names)

    return df

# converts feature into serializable data that can be turned into json for sending
def extract_feature_single_mode(path: str):

    y, sr = librosa.load(path, sr=None, mono=True)

    spectral_features = [
        float(librosa.get_duration(y=y, sr=sr)),
        float(np.mean(librosa.feature.zero_crossing_rate(y))),
        float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))),
        float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85))),
        float(np.mean(librosa.feature.spectral_flatness(y=y))),
        float(np.mean(librosa.feature.spectral_contrast(y=y, sr=sr))),
        float(np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))),
    ]

    # mel spectrogram 
    mel = librosa.feature.melspectrogram(y=y, sr=sr)
    mel_db = librosa.power_to_db(mel, ref=np.max)

    db_min, db_max = -80.0, 0.0   
    mel_u8 = np.clip((mel_db - db_min) / (db_max - db_min) * 255, 0, 255).astype(np.uint8)
    mel_time_major = mel_u8.T.tolist()             # time_frames x freq_bins
    

    # return json
    return {
        "spectrogram": mel_time_major,
        "spectral_features": spectral_features,
        "sample_rate": sr,
    }
