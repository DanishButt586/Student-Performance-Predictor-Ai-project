#!/usr/bin/env python
"""
Student Grade Predictor GUI - Standalone Runner
Optimized for performance with caching and debouncing.
"""
import pandas as pd
import numpy as np
import tkinter as tk
from tkinter import ttk, messagebox
from ttkthemes import ThemedStyle
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression

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

print(f"R^2 Score: {r2:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"MAE: {mae:.4f}")

# ------------------------------------------------------------------
# Performance helpers
# Cache base row to avoid recomputing medians/modes on every predict
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

# Precompute feature names and coefficients once
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
        return "LOW RISK", "✓ Strong Performance"
    elif pred_grade >= 12:
        return "MODERATE RISK", "⚠ Needs Focus"
    elif pred_grade >= 10:
        return "ELEVATED RISK", "⚠ Borderline Pass"
    else:
        return "HIGH RISK", "✗ At Risk - Intervention Needed"

# ------------------------------------------------------------------
# GUI - Enhanced Modern Design (optimized)
def launch_app():
    print("Launching GUI...")
    root = tk.Tk()
    root.title("🎓 Student Performance Predictor")
    # Slightly smaller initial geometry to reduce initial layout cost
    root.geometry("900x780")
    root.minsize(850, 700)

    # Configure style with modern theme
    style = ThemedStyle(root)
    style.theme_use("equilux")

    # Create main canvas with scrollbar
    canvas = tk.Canvas(root, bg="#2B2B2B", highlightthickness=0)
    scrollbar = ttk.Scrollbar(root, orient="vertical", command=canvas.yview)

    # Main container inside canvas
    main_frame = ttk.Frame(canvas)

    # Debounced scrollregion update to avoid thrashing on many <Configure> events
    _pending_sr_update = {"scheduled": False}

    def _update_scrollregion_debounced():
        _pending_sr_update["scheduled"] = False
        canvas.configure(scrollregion=canvas.bbox("all"))

    def _on_configure(_event=None):
        if not _pending_sr_update["scheduled"]:
            _pending_sr_update["scheduled"] = True
            root.after_idle(_update_scrollregion_debounced)

    main_frame.bind("<Configure>", _on_configure)

    canvas.create_window((0, 0), window=main_frame, anchor="nw", width=880)
    canvas.configure(yscrollcommand=scrollbar.set)

    # Pack canvas and scrollbar
    canvas.pack(side="left", fill="both", expand=True, padx=(16, 0), pady=16)
    scrollbar.pack(side="right", fill="y", pady=16)

    # Mouse wheel scrolling (bind to canvas only)
    def _on_mousewheel(event):
        delta = -1 * (event.delta // 120)
        canvas.yview_scroll(delta, "units")
    canvas.bind("<MouseWheel>", _on_mousewheel)

    # ====== HEADER SECTION ======
    header_frame = ttk.Frame(main_frame)
    header_frame.pack(fill="x", pady=(0, 20))

    title_label = ttk.Label(header_frame, text="🎓 Student Performance Predictor",
                           font=("Segoe UI", 20, "bold"), foreground="#FFFFFF")
    title_label.pack(anchor="w", pady=(0, 4))

    subtitle_label = ttk.Label(header_frame, text="ML-Based Grade Prediction System | Linear Regression Model",
                              font=("Segoe UI", 11), foreground="#CCCCCC")
    subtitle_label.pack(anchor="w")

    # Divider
    divider1 = ttk.Separator(main_frame, orient="horizontal")
    divider1.pack(fill="x", pady=(0, 16))

    # ====== METRICS SECTION ======
    metrics_frame = ttk.LabelFrame(main_frame, text="📊 Model Performance", padding=12)
    metrics_frame.pack(fill="x", pady=(0, 16))

    # Metrics in a grid
    metrics_left = ttk.Frame(metrics_frame)
    metrics_left.pack(side="left", fill="both", expand=True)

    metrics_right = ttk.Frame(metrics_frame)
    metrics_right.pack(side="right", fill="both", expand=True)

    ttk.Label(metrics_left, text="R² Score:", font=("Segoe UI", 10), foreground="#E0E0E0").pack(anchor="w", pady=2)
    ttk.Label(metrics_left, text=f"{r2:.4f} ({r2*100:.1f}% variance explained)",
             font=("Segoe UI", 10, "bold"), foreground="#FFD700").pack(anchor="w", pady=(0, 8))

    ttk.Label(metrics_left, text="MAE:", font=("Segoe UI", 10), foreground="#E0E0E0").pack(anchor="w", pady=2)
    ttk.Label(metrics_left, text=f"{mae:.4f} grade points",
             font=("Segoe UI", 10, "bold"), foreground="#FFD700").pack(anchor="w", pady=(0, 8))

    ttk.Label(metrics_right, text="RMSE:", font=("Segoe UI", 10), foreground="#E0E0E0").pack(anchor="w", pady=2)
    ttk.Label(metrics_right, text=f"{rmse:.4f} grade points",
             font=("Segoe UI", 10, "bold"), foreground="#FFD700").pack(anchor="w", pady=(0, 8))

    ttk.Label(metrics_right, text="Test Samples:", font=("Segoe UI", 10), foreground="#E0E0E0").pack(anchor="w", pady=2)
    ttk.Label(metrics_right, text=f"{len(X_test)} students evaluated",
             font=("Segoe UI", 10, "bold"), foreground="#FFD700").pack(anchor="w")

    # ====== INPUT SECTION ======
    input_frame = ttk.LabelFrame(main_frame, text="📝 Student Information", padding=12)
    input_frame.pack(fill="x", pady=(0, 16))

    # Left column for inputs
    left_col = ttk.Frame(input_frame)
    left_col.pack(side="left", fill="both", expand=True, padx=(0, 12))

    right_col = ttk.Frame(input_frame)
    right_col.pack(side="right", fill="both", expand=True, padx=(12, 0))

    # Input fields with labels and spinboxes
    spinboxes = {}

    def create_input_field(parent, label, key, from_val, to_val, default):
        ttk.Label(parent, text=label, font=("Segoe UI", 10), foreground="#E0E0E0").pack(anchor="w", pady=(8, 2))
        spin_frame = ttk.Frame(parent)
        spin_frame.pack(fill="x", pady=(0, 4))

        spin = ttk.Spinbox(spin_frame, from_=from_val, to=to_val, increment=1, width=10, font=("Segoe UI", 10))
        spin.set(default)
        spin.pack(side="left", fill="x", expand=True)

        spinboxes[key] = spin
        return spin

    # Left column inputs
    create_input_field(left_col, "G1 (1st Period Grade, 0-20)", "g1", 0, 20, 12)
    create_input_field(left_col, "G2 (2nd Period Grade, 0-20)", "g2", 0, 20, 12)
    create_input_field(left_col, "Weekly Study Time (hours)", "study", 0, 40, 5)
    create_input_field(left_col, "Absences", "absences", 0, 50, 4)

    # Right column inputs
    create_input_field(right_col, "Past Failures", "failures", 0, 4, 0)
    create_input_field(right_col, "Going Out (1=Low, 5=High)", "goout", 1, 5, 3)
    create_input_field(right_col, "Age (years)", "age", 15, 25, 18)
    create_input_field(right_col, "Daily Alcohol (1=Low, 5=High)", "dalc", 1, 5, 1)

    # ====== RESULTS SECTION ======
    results_frame = ttk.LabelFrame(main_frame, text="📌 Prediction Results", padding=15)
    results_frame.pack(fill="both", expand=False, pady=(0, 16))

    results_container = tk.Frame(results_frame, background="#2B2B2B")
    results_container.pack(fill="both", expand=True)

    pred_label = tk.Label(results_container, text="Predicted Final Grade (G3): --",
                         font=("Segoe UI", 14, "bold"), foreground="#00FF00", background="#2B2B2B",
                         anchor="w", wraplength=800)
    pred_label.pack(fill="x", pady=(2, 10))

    risk_label = tk.Label(results_container, text="Risk Assessment: --",
                         font=("Segoe UI", 12, "bold"), foreground="#FF6347", background="#2B2B2B",
                         anchor="w", wraplength=800)
    risk_label.pack(fill="x", pady=(0, 10))

    insight_label = tk.Label(results_container, text="Insight: --",
                            font=("Segoe UI", 11), foreground="#FFFF99", background="#2B2B2B",
                            anchor="w", wraplength=800)
    insight_label.pack(fill="x", pady=(0, 10))

    features_text = tk.Label(results_container, text="Top Contributing Features:\n--",
                            font=("Segoe UI", 10), foreground="#CCCCCC", background="#2B2B2B",
                            justify="left", anchor="nw", wraplength=800)
    features_text.pack(fill="both", expand=True, pady=(0, 5))

    # ====== BUTTON SECTION ======
    button_frame = ttk.Frame(main_frame)
    button_frame.pack(fill="x", pady=(0, 8))

    def do_predict():
        try:
            g1_val = float(spinboxes["g1"].get())
            g2_val = float(spinboxes["g2"].get())
            study_val = float(spinboxes["study"].get())
            absences_val = float(spinboxes["absences"].get())
            failures_val = float(spinboxes["failures"].get())
            goout_val = float(spinboxes["goout"].get())
            age_val = float(spinboxes["age"].get())
            dalc_val = float(spinboxes["dalc"].get())

            if not (0 <= g1_val <= 20 and 0 <= g2_val <= 20):
                raise ValueError("G1 and G2 must be between 0 and 20")
            if not (0 <= study_val <= 60):
                raise ValueError("Study time must be between 0 and 60 hours")

            row = build_base_input()
            row.loc[0, "G1"] = g1_val
            row.loc[0, "G2"] = g2_val
            row.loc[0, "studytime"] = study_val
            row.loc[0, "absences"] = absences_val
            row.loc[0, "failures"] = failures_val
            row.loc[0, "goout"] = goout_val
            row.loc[0, "age"] = age_val
            row.loc[0, "Dalc"] = dalc_val

            pred_g3 = float(model.predict(row)[0])
            pred_g3 = max(0, min(20, pred_g3))

            risk, insight = risk_level(pred_g3)

            pred_label.config(text=f"Predicted Final Grade (G3): {pred_g3:.2f} / 20",
                              foreground="#00FF00", background="#2B2B2B")

            risk_color = "#00FF00" if "LOW" in risk else "#FFA500" if "MODERATE" in risk else "#FF6347"
            risk_label.config(text=f"Risk Assessment: {risk}",
                              foreground=risk_color, background="#2B2B2B")

            insight_label.config(text=f"💡 Intervention: {insight}",
                                 foreground="#FFFF99", background="#2B2B2B")

            top_feats = get_top_features(8)
            if top_feats:
                feat_str = "Top Contributing Features:\n" + "\n".join(
                    [f"  • {name.replace('_', ' ')}: {coef:+.3f}" for name, coef in top_feats]
                )
            else:
                feat_str = "Top Contributing Features:\nUnable to extract"
            features_text.config(text=feat_str, foreground="#CCCCCC", background="#2B2B2B")

            print(f"Prediction displayed: G3={pred_g3:.2f}, Risk={risk}")

        except ValueError as e:
            messagebox.showerror("Input Error", str(e))
        except Exception as e:
            messagebox.showerror("Error", f"Prediction failed:\n{str(e)}")

    def reset_form():
        defaults = [("g1", 12), ("g2", 12), ("study", 5), ("absences", 4),
                   ("failures", 0), ("goout", 3), ("age", 18), ("dalc", 1)]
        for key, val in defaults:
            spinboxes[key].set(val)
        pred_label.config(text="Predicted Final Grade (G3): --")
        risk_label.config(text="Risk Assessment: --")
        insight_label.config(text="Insight: --")
        features_text.config(text="Top Contributing Features:\n--")

    predict_btn = ttk.Button(button_frame, text="🚀 Predict Grade", command=do_predict)
    predict_btn.pack(side="left", padx=(0, 8))

    reset_btn = ttk.Button(button_frame, text="🔄 Reset", command=reset_form)
    reset_btn.pack(side="left", padx=(0, 8))

    quit_btn = ttk.Button(button_frame, text="✕ Quit", command=root.destroy)
    quit_btn.pack(side="left")

    # Initialize features display (uses precomputed feature pairs)
    top_feats = get_top_features(8)
    if top_feats:
        feat_str = "Top Contributing Features:\n" + "\n".join(
            [f"  • {name.replace('_', ' ')}: {coef:+.3f}" for name, coef in top_feats]
        )
    else:
        feat_str = "Top Contributing Features:\nClick 'Predict Grade' to see analysis"
    features_text.config(text=feat_str)

    root.mainloop()

# Launch the app
if __name__ == "__main__":
    launch_app()
