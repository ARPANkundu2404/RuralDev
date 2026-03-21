from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# Load model
model = pickle.load(open('model/model.pkl', 'rb'))
le_skill, le_subskill, le_occ = pickle.load(open('model/encoders.pkl', 'rb'))

# Home
@app.route('/')
def home():
    return "Rural Job Recommendation API Running"

# Get dropdown values
@app.route('/options', methods=['GET'])
def get_options():
    return jsonify({
        "skills": list(le_skill.classes_),
        "subskills": list(le_subskill.classes_)
    })

# Prediction
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    skill = data['skill']
    subskill = data['subskill']

    if skill not in le_skill.classes_ or subskill not in le_subskill.classes_:
        return jsonify({"error": "Invalid input"})

    skill_enc = le_skill.transform([skill])[0]
    subskill_enc = le_subskill.transform([subskill])[0]

    probs = model.predict_proba([[skill_enc, subskill_enc]])[0]
    top_indices = np.argsort(probs)[-3:][::-1]

    results = []
    for idx in top_indices:
        results.append({
            "job": le_occ.inverse_transform([idx])[0],
           # "confidence": round(probs[idx]*100, 2)
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)