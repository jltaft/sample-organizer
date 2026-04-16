from joblib import Parallel, delayed
from flask import Flask, request, jsonify
import os, shutil, librosa, time, joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris
import backend.audio_processing as ap
import backend.io_utils as ioutil

bundle = joblib.load("randomforest_bundle.joblib")
model = bundle["model"]
label_encoder = bundle["label_encoder"]
column_order = bundle["columns"]

def guess(file_path):
    feat_arr = ap.extract_feature_vector(file_path)
    feat_arr = feat_arr.reindex(columns=column_order, fill_value=0)
    prediction_vector = model.predict_proba(feat_arr)[0]
    highest_probability = prediction_vector.argmax()
    confident_score = prediction_vector[highest_probability]
    audio_type = label_encoder.inverse_transform([highest_probability])[0]
    return file_path, audio_type, confident_score

app = Flask(__name__)

@app.route('/data', methods=['POST'])
def handle_data():
    data = request.json
    folder = data['path']
    threshold = float(data.get('epsilon', 30)) / 100.0
    tasks = [delayed(guess)(os.path.join(folder, file_name)) for file_name in data['files']]
    guesses = Parallel(n_jobs=-1, backend='threading')(tasks)
    sound_counts = {}
    for file_path, audio_type, confidence in guesses:
        category = audio_type if confidence >= threshold else 'unidentified'
        sound_counts[category] = sound_counts.get(category, 0) + 1
        mk_dir = os.path.join(folder,category)
        os.makedirs(mk_dir, exist_ok=True)
        ioutil.move(os.path.basename(file_path), folder, mk_dir)
    return jsonify(sound_counts), 200

@app.route('/features', methods=['POST'])
def handle_single():
    in_file = request.json["file"]
    feature_json = ap.extract_feature_single_mode(in_file)
    return feature_json, 200

if __name__ == '__main__':
    app.run(port=8080)
