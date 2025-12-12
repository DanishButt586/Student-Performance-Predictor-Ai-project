#!/usr/bin/env python
"""
Student Grade Predictor - Flask Web Application
Uses Linear Regression to predict student next semester SGPA based on previous semesters.
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
    """Assess risk based on predicted grade (0-20 scale)."""
    if pred_grade >= 15:
        return "LOW RISK", "Strong Performance"
    elif pred_grade >= 12:
        return "MODERATE RISK", "Needs Focus"
    elif pred_grade >= 10:
        return "ELEVATED RISK", "Borderline Pass"
    else:
        return "HIGH RISK", "At Risk - Intervention Needed"

def risk_assessment_sgpa(pred_sgpa):
    """Assess risk based on predicted SGPA (0-4 scale)."""
    if pred_sgpa >= 3.5:
        return "EXCELLENT", "Strong Performance - Excellent Track Record"
    elif pred_sgpa >= 3.0:
        return "GOOD", "Good Performance - On Track"
    elif pred_sgpa >= 2.5:
        return "FAIR", "Fair Performance - Moderate Effort Needed"
    elif pred_sgpa >= 2.0:
        return "BELOW AVERAGE", "Below Average - Intervention Recommended"
    else:
        return "POOR", "Poor Performance - Immediate Action Needed"

# ------------------------------------------------------------------
# Routes

@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html', r2=r2, rmse=rmse, mae=mae, test_samples=len(X_test))

@app.route('/api/predict', methods=['POST'])
def predict():
    """Handle prediction requests for all remaining semester SGPAs based on previous semester grades."""
    try:
        data = request.get_json()
        semesters = data.get('semesters', [])
        
        # Validate at least 1 semester is provided
        if not semesters or len(semesters) == 0:
            return jsonify({'error': 'Please enter at least 1 semester SGPA to predict remaining semesters'}), 400
        
        # Validate maximum 7 semesters (need at least 1 to predict)
        if len(semesters) >= 8:
            return jsonify({'error': 'You have completed all 8 semesters. No predictions needed.'}), 400
        
        # Validate all semester values are valid
        for sem in semesters:
            sgpa = float(sem.get('sgpa', 0))
            if not (0 <= sgpa <= 4):
                return jsonify({'error': 'SGPA must be between 0 and 4'}), 400
        
        # Extract SGPA values and calculate statistics
        sgpa_values = [float(sem['sgpa']) for sem in semesters]
        avg_sgpa = np.mean(sgpa_values)
        num_semesters = len(semesters)
        
        # Calculate trend
        if num_semesters > 1:
            # Linear regression on semester progression to detect trend
            semester_nums = np.arange(1, num_semesters + 1)
            trend_slope = np.polyfit(semester_nums, sgpa_values, 1)[0]
            
            if trend_slope > 0.05:
                trend_direction = "Improving ↑"
            elif trend_slope < -0.05:
                trend_direction = "Declining ↓"
            else:
                trend_direction = "Stable →"
        else:
            trend_direction = "First Semester"
            trend_slope = 0
        
        # Predict all remaining semesters
        predictions = []
        current_sgpa_history = sgpa_values.copy()
        
        for next_sem_num in range(num_semesters + 1, 9):  # Predict up to semester 8
            # Predict next semester SGPA using weighted approach
            num_hist = len(current_sgpa_history)
            last_sgpa = current_sgpa_history[-1]
            
            if num_hist == 1:
                # Only one semester: use it as baseline with slight regression to mean
                pred_sgpa = last_sgpa * 0.9 + 2.5 * 0.1
            else:
                # Multiple semesters: weighted average with trend consideration
                weights = np.exp(np.linspace(0, 1, num_hist))  # Exponential weights favoring recent
                weighted_avg = np.average(current_sgpa_history, weights=weights)
                
                # Calculate momentum (recent performance vs overall average)
                recent_avg = np.mean(current_sgpa_history[-min(3, num_hist):])
                momentum = recent_avg - np.mean(current_sgpa_history)
                
                # Predict with trend and momentum
                pred_sgpa = weighted_avg + (momentum * 0.3)
                
                # Add trend influence with decay for distant predictions
                if num_hist > 2:
                    decay_factor = 0.9 ** (next_sem_num - num_semesters - 1)
                    pred_sgpa += trend_slope * 0.2 * decay_factor
            
            # Bound the prediction to valid SGPA range
            pred_sgpa = max(0, min(4, pred_sgpa))
            
            predictions.append({
                'semester': next_sem_num,
                'predicted_sgpa': round(pred_sgpa, 2)
            })
            
            # Add prediction to history for next iteration
            current_sgpa_history.append(pred_sgpa)
        
        # Risk assessment based on average of predicted SGPAs
        avg_predicted = np.mean([p['predicted_sgpa'] for p in predictions])
        risk, insight = risk_assessment_sgpa(avg_predicted)
        
        # Generate performance indicators
        features_list = []
        features_list.append({"name": "Current Average", "coef": f"{avg_sgpa:.2f}"})
        features_list.append({"name": "Last Semester", "coef": f"{sgpa_values[-1]:.2f}"})
        features_list.append({"name": "Semesters Completed", "coef": f"{num_semesters}"})
        if num_semesters > 1:
            features_list.append({"name": "Highest SGPA", "coef": f"{max(sgpa_values):.2f}"})
            features_list.append({"name": "Lowest SGPA", "coef": f"{min(sgpa_values):.2f}"})
            std_dev = np.std(sgpa_values)
            features_list.append({"name": "Consistency", "coef": f"{(4-std_dev)/4*100:.0f}%"})
        features_list.append({"name": "Projected Final Avg", "coef": f"{np.mean(sgpa_values + [p['predicted_sgpa'] for p in predictions]):.2f}"})
        
        return jsonify({
            'predictions': predictions,
            'current_average': round(avg_sgpa, 2),
            'trend': trend_direction,
            'semesters_count': num_semesters,
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

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
