#!/usr/bin/env python
"""
Student Grade Predictor - Flask Web Application
Uses Linear Regression to predict student final grades.
"""

from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, accuracy_score, f1_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, LogisticRegression

app = Flask(__name__)

# ------------------------------------------------------------------
# Load and prepare data
print("Loading data...")
DATA_PATH = "data/student-mat.csv"
data = pd.read_csv(DATA_PATH, sep=";")

# Split features/target
target_col = "G3"
features = data.drop(columns=[target_col])
target = data[target_col]

# Identify categorical and numeric columns
categorical_cols = features.select_dtypes(include=["object"]).columns.tolist()
numeric_cols = [c for c in features.columns if c not in categorical_cols]

# Preprocess: one-hot encode categoricals, pass numeric through
preprocess = ColumnTransformer(
    transformers=[
        ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("numeric", "passthrough", numeric_cols),
    ]
)

# Build the full pipeline
model = Pipeline(
    steps=[
        ("preprocess", preprocess),
        ("regressor", LinearRegression()),
    ]
)

# Train / test split
print("Training model...")
X_train, X_test, y_train, y_test = train_test_split(
    features, target, test_size=0.2, random_state=42
)

# Fit model
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Model trained - R^2: {r2:.4f}, RMSE: {rmse:.4f}, MAE: {mae:.4f}")

# Classification: Pass/Fail (G3 >= 10)
print("Training classification model (pass/fail)...")
y_class = (target >= 10).astype(int)
Xc_train, Xc_test, yc_train, yc_test = train_test_split(
    features, y_class, test_size=0.2, random_state=42
)

clf = Pipeline(
    steps=[
        ("preprocess", preprocess),
        ("classifier", LogisticRegression(max_iter=1000))
    ]
)
clf.fit(Xc_train, yc_train)
yc_pred = clf.predict(Xc_test)
clf_acc = accuracy_score(yc_test, yc_pred)
clf_f1 = f1_score(yc_test, yc_pred)
print(f"Classification trained - Accuracy: {clf_acc:.4f}, F1: {clf_f1:.4f}")

# ------------------------------------------------------------------
# Performance helpers

# Cache base row
_base_input_row = None

def build_base_input():
    global _base_input_row
    if _base_input_row is None:
        base = {}
        for col in X_train.columns:
            if col in numeric_cols:
                base[col] = float(X_train[col].median())
            else:
                base[col] = X_train[col].mode().iloc[0]
        _base_input_row = pd.DataFrame([base])
    return _base_input_row.copy(deep=True)

# Precompute feature pairs
_feature_pairs = None

def _compute_feature_pairs():
    global _feature_pairs
    try:
        reg = model.named_steps["regressor"]
        enc = model.named_steps["preprocess"].named_transformers_["categorical"]
        cat_names = list(enc.get_feature_names_out(categorical_cols))
        all_names = cat_names + numeric_cols
        coefs = np.ravel(reg.coef_)
        _feature_pairs = sorted(zip(all_names, coefs), key=lambda x: abs(x[1]), reverse=True)
    except Exception:
        _feature_pairs = []

_compute_feature_pairs()

def get_top_features(k=8):
    return _feature_pairs[:k] if _feature_pairs else []

def risk_level(pred_grade):
    """Assess risk based on predicted grade."""
    if pred_grade >= 15:
        return "LOW RISK", "Strong Performance"
    elif pred_grade >= 12:
        return "MODERATE RISK", "Needs Focus"
    elif pred_grade >= 10:
        return "ELEVATED RISK", "Borderline Pass"
    else:
        return "HIGH RISK", "At Risk - Intervention Needed"

# ------------------------------------------------------------------
# Routes

@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html', r2=r2, rmse=rmse, mae=mae, test_samples=len(X_test))

@app.route('/api/predict', methods=['POST'])
def predict():
    """Handle prediction requests."""
    try:
        data = request.get_json()
        
        g1_val = float(data.get('g1', 12))
        g2_val = float(data.get('g2', 12))
        study_val = float(data.get('study', 5))
        absences_val = float(data.get('absences', 4))
        failures_val = float(data.get('failures', 0))
        goout_val = float(data.get('goout', 3))
        age_val = float(data.get('age', 18))
        # Daily Alcohol (Dalc) removed from UI and backend
        
        # Validate inputs
        if not (0 <= g1_val <= 20 and 0 <= g2_val <= 20):
            return jsonify({'error': 'G1 and G2 must be between 0 and 20'}), 400
        if not (0 <= study_val <= 60):
            return jsonify({'error': 'Study time must be between 0 and 60 hours'}), 400
        
        # Build input row
        row = build_base_input()
        row.loc[0, "G1"] = g1_val
        row.loc[0, "G2"] = g2_val
        row.loc[0, "studytime"] = study_val
        row.loc[0, "absences"] = absences_val
        row.loc[0, "failures"] = failures_val
        row.loc[0, "goout"] = goout_val
        row.loc[0, "age"] = age_val
        # Dalc removed
        
        # Predict
        pred_g3 = float(model.predict(row)[0])
        pred_g3 = max(0, min(20, pred_g3))
        
        # Risk assessment
        risk, insight = risk_level(pred_g3)
        
        # Top features
        top_feats = get_top_features(8)
        features_list = [{"name": name.replace('_', ' '), "coef": f"{coef:+.3f}"} 
                        for name, coef in top_feats]
        
        return jsonify({
            'predicted_grade': round(pred_g3, 2),
            'risk': risk,
            'insight': insight,
            'features': features_list
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/metrics')
def get_metrics():
    """Return model metrics."""
    return jsonify({
        'r2': round(r2, 4),
        'rmse': round(rmse, 4),
        'mae': round(mae, 4),
        'test_samples': len(X_test),
        'classification_accuracy': round(clf_acc, 4),
        'classification_f1': round(clf_f1, 4)
    })

@app.route('/api/classify', methods=['POST'])
def classify():
    """Binary classification: pass (1) / fail (0) based on inputs."""
    try:
        data = request.get_json()
        g1_val = float(data.get('g1', 12))
        g2_val = float(data.get('g2', 12))
        study_val = float(data.get('study', 5))
        absences_val = float(data.get('absences', 4))
        failures_val = float(data.get('failures', 0))
        goout_val = float(data.get('goout', 3))
        age_val = float(data.get('age', 18))
        # Daily Alcohol (Dalc) removed from UI and backend

        if not (0 <= g1_val <= 20 and 0 <= g2_val <= 20):
            return jsonify({'error': 'G1 and G2 must be between 0 and 20'}), 400
        if not (0 <= study_val <= 60):
            return jsonify({'error': 'Study time must be between 0 and 60 hours'}), 400

        row = build_base_input()
        row.loc[0, "G1"] = g1_val
        row.loc[0, "G2"] = g2_val
        row.loc[0, "studytime"] = study_val
        row.loc[0, "absences"] = absences_val
        row.loc[0, "failures"] = failures_val
        row.loc[0, "goout"] = goout_val
        row.loc[0, "age"] = age_val
        # Dalc removed

        prob_pass = float(clf.predict_proba(row)[0, 1])
        pred_class = int(prob_pass >= 0.5)

        return jsonify({
            'pass_probability': round(prob_pass, 3),
            'prediction': pred_class
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
