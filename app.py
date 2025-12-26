#!/usr/bin/env python
"""
Student Grade Predictor - Flask Web Application
Uses Linear Regression to predict student next semester SGPA based on previous semesters.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, accuracy_score, f1_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, LogisticRegression
from fpdf import FPDF
from io import BytesIO
from functools import wraps
from database import ExcelDatabase

app = Flask(__name__)
app.secret_key = "replace-me-with-a-secure-key-for-production-use-random-secret"
app.config['PERMANENT_SESSION_LIFETIME'] = 7200  # 2 hours session timeout

# Initialize Excel Database
db = ExcelDatabase(data_folder='data')

# In-memory storage for submitted subject grades (simple internal store)
stored_subject_grades = {}
# In-memory store for last generated report payload per student (to support direct download)
last_reports = {}

# ------------------------------------------------------------------
# Load and prepare data
print("Loading data...")
DATA_PATH = "data/student-mat.csv"

# Check if CSV exists, if not download it
import os
if not os.path.exists(DATA_PATH):
    print("student-mat.csv not found. Downloading from UCI ML Repository...")
    try:
        import urllib.request
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00320/student.zip"
        import zipfile
        import io
        
        print("Downloading dataset...")
        response = urllib.request.urlopen(url)
        zip_data = response.read()
        
        print("Extracting student-mat.csv...")
        with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_file:
            # Extract student-mat.csv to data folder
            os.makedirs('data', exist_ok=True)
            with zip_file.open('student-mat.csv') as source:
                with open(DATA_PATH, 'wb') as target:
                    target.write(source.read())
        print("Dataset downloaded successfully!")
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        print("Please manually download student-mat.csv from:")
        print("https://archive.ics.uci.edu/ml/machine-learning-databases/00320/student.zip")
        print("Extract and place student-mat.csv in the data/ folder")
        exit(1)

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
# Authentication Decorators

def login_required(f):
    """Decorator to require valid session"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        session_id = session.get('session_id')
        if not session_id:
            return redirect(url_for('login'))
        
        validation = db.validate_session(session_id)
        if not validation['valid']:
            session.clear()
            return redirect(url_for('login'))
        
        return f(*args, **kwargs)
    return decorated_function

def role_required(role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if session.get('role') != role:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

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

def sgpa_to_letter_grade(sgpa):
    """Convert SGPA (0-4.0 scale) to letter grade"""
    if sgpa >= 3.7:
        return 'A'
    elif sgpa >= 3.3:
        return 'A-'
    elif sgpa >= 3.0:
        return 'B+'
    elif sgpa >= 2.7:
        return 'B'
    elif sgpa >= 2.3:
        return 'B-'
    elif sgpa >= 2.0:
        return 'C+'
    elif sgpa >= 1.7:
        return 'C'
    elif sgpa >= 1.3:
        return 'C-'
    elif sgpa >= 1.0:
        return 'D'
    else:
        return 'F'

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
def home():
    """Landing page: login first."""
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    
    # POST - authenticate user
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '').strip()

    # Try student authentication first
    result = db.authenticate_user(username, password, 'student')
    
    # If student auth fails, try teacher
    if not result['success']:
        result = db.authenticate_user(username, password, 'teacher')
        user_type = 'teacher'
    else:
        user_type = 'student'
    
    if result['success']:
        # Create session
        session_id = db.create_session(username, user_type)
        
        # Store in Flask session (convert numpy types to native Python types)
        session['session_id'] = session_id
        session['role'] = user_type
        session['user'] = username
        session['username'] = username
        session['full_name'] = str(result.get('full_name', username))
        session['email'] = str(result.get('email', ''))
        session['department'] = str(result.get('department', 'N/A'))
        
        if user_type == 'student':
            semester_val = result.get('semester', 1)
            # Convert numpy int64 to Python int
            session['semester'] = int(semester_val) if semester_val else 1
            session['semesters'] = int(semester_val) if semester_val else 1
            # Redirect directly to predictor with user data
            return redirect(url_for('index', 
                                  name=result.get('full_name', username),
                                  semesters=int(semester_val) if semester_val else 1,
                                  department=result.get('department', 'N/A')))
        else:
            return redirect(url_for('teacher_dashboard'))
    
    return render_template('login.html', error='Invalid credentials. Please try again.')

@app.route('/logout')
def logout():
    session_id = session.get('session_id')
    if session_id:
        db.invalidate_session(session_id)
    session.clear()
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Student registration page"""
    if request.method == 'GET':
        return render_template('register.html')
    
    # POST - register new student
    username = request.form.get('username', '').strip()
    password = request.form.get('password', '')
    confirm_password = request.form.get('confirm_password', '')
    department = request.form.get('department', '').strip()
    semester = int(request.form.get('semester', 1))
    
    # Validate passwords match
    if password != confirm_password:
        return render_template('register.html', 
                             message='Passwords do not match', 
                             success=False)
    
    # Validate required fields
    if not all([username, password, department]):
        return render_template('register.html', 
                             message='All required fields must be filled', 
                             success=False)
    
    # Register user (username will be used as full_name)
    result = db.register_student(username, password, department, semester)
    
    if result['success']:
        return render_template('register.html', 
                             message='Registration successful! You can now login.', 
                             success=True)
    else:
        return render_template('register.html', 
                             message=result['message'], 
                             success=False)

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Generate password reset token"""
    if request.method == 'GET':
        return render_template('password_reset.html')
    
    # POST - generate reset token
    email = request.form.get('email', '').strip()
    user_type = request.form.get('user_type', 'student')
    
    result = db.generate_reset_token(email, user_type)
    
    if result['success']:
        # In production, send email here
        # For local testing, display token
        return render_template('password_reset.html', 
                             message=f'Reset token generated for {result["username"]}', 
                             success=True,
                             info=True,
                             reset_token=result['token'])
    else:
        return render_template('password_reset.html', 
                             message=result['message'], 
                             success=False)

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    """Reset password using token"""
    if request.method == 'GET':
        return render_template('password_reset.html', token=token)
    
    # POST - reset password
    new_password = request.form.get('new_password', '')
    confirm_password = request.form.get('confirm_password', '')
    
    if new_password != confirm_password:
        return render_template('password_reset.html', 
                             token=token,
                             message='Passwords do not match', 
                             success=False)
    
    result = db.reset_password(token, new_password)
    
    if result['success']:
        return render_template('password_reset.html', 
                             message='Password reset successful! You can now login.', 
                             success=True)
    else:
        return render_template('password_reset.html', 
                             token=token,
                             message=result['message'], 
                             success=False)


@app.route('/api/metrics')
def api_metrics():
    """Expose trained model metrics for UI display."""
    try:
        return jsonify({
            'r2': round(float(r2), 3),
            'rmse': round(float(rmse), 3),
            'mae': round(float(mae), 3),
            'test_samples': int(len(X_test))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/start')
def start():
    """Student setup page: ask name, semester, and degree program."""
    if session.get('role') != 'student':
        return redirect(url_for('login'))
    return render_template('start.html')

@app.route('/predictor')
def index():
    """Serve the main predictor page. Accepts optional query params from the landing page."""
    # Prefer query params; fallback to session
    name_arg = request.args.get('name', '').strip()
    sem_arg = request.args.get('semesters', '').strip()
    dept_arg = request.args.get('department', '').strip()

    # If provided via query, persist to session
    if name_arg:
        session['student_name'] = name_arg
    if sem_arg:
        session['semesters'] = sem_arg
    if dept_arg:
        session['department'] = dept_arg

    student_name = name_arg or session.get('student_name', '')
    semesters = sem_arg or session.get('semesters', '')
    department = dept_arg or session.get('department', '')
    username = session.get('username', '')

    # normalize semesters to integer if possible
    try:
        semesters_int = int(semesters) if semesters != '' else 0
    except Exception:
        semesters_int = 0

    # Get saved grades for the student
    saved_grades = {}
    department_subjects = []
    if username:
        saved_grades = db.get_student_grades(username)
        if department:
            department_subjects = db.get_subjects_for_department(department)

    return render_template(
        'index.html',
        r2=r2,
        rmse=rmse,
        mae=mae,
        test_samples=len(X_test),
        student_name=student_name,
        semesters_completed=semesters_int,
        department=department,
        saved_grades=saved_grades,
        department_subjects=department_subjects,
    )

@app.route('/teacher')
def teacher_dashboard():
    if session.get('role') != 'teacher':
        return redirect(url_for('login'))
    
    # Get real data from CSV files
    categorized = db.get_categorized_students()
    dept_stats = db.get_department_statistics()
    
    best_students = categorized['best']
    average_students = categorized['average']
    worst_students = categorized['worst']
    
    # If no students have predictions yet, show empty state
    if not best_students and not average_students and not worst_students:
        best_students = []
        average_students = []
        worst_students = []
        dept_stats = []
    
    return render_template('teacher.html', 
                         r2=r2, 
                         rmse=rmse, 
                         mae=mae, 
                         test_samples=len(X_test),
                         best_students=best_students,
                         average_students=average_students,
                         worst_students=worst_students,
                         dept_stats=dept_stats)

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

        # If subject grades were provided, store them internally keyed by student name
        subject_grades_payload = data.get('subject_grades')
        student_name = data.get('student_name', '')
        if subject_grades_payload and student_name:
            try:
                stored_subject_grades[student_name] = subject_grades_payload
            except Exception:
                pass
        
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
        
        # Compute grade counts if subject grades submitted
        grade_counts = {}
        try:
            if subject_grades_payload:
                # subject_grades_payload may be mapping sem-> {subj: grade} or single-sem format
                entries = {}
                if isinstance(subject_grades_payload, dict):
                    # detect if keys are semesters or a single object with 'semester' key
                    if all(isinstance(k, (int, str)) and (k.isdigit() if isinstance(k, str) else True) for k in subject_grades_payload.keys()):
                        entries = subject_grades_payload
                    elif 'semester' in subject_grades_payload and 'subject_grades' in subject_grades_payload:
                        entries = {str(subject_grades_payload['semester']): subject_grades_payload['subject_grades']}
                    else:
                        entries = subject_grades_payload

                for semk, smap in entries.items():
                    if not isinstance(smap, dict):
                        continue
                    for subj, grade in smap.items():
                        try:
                            g = str(grade).strip().upper()
                            letter = g[0] if g and g[0] in list('ABCDEF') else None
                            if letter:
                                grade_counts[letter] = grade_counts.get(letter, 0) + 1
                        except Exception:
                            continue
        except Exception:
            grade_counts = {}

        resp = {
            'predictions': predictions,
            'current_average': round(avg_sgpa, 2),
            'trend': trend_direction,
            'semesters_count': num_semesters,
            'risk': risk,
            'insight': insight,
            'features': features_list
        }

        if grade_counts:
            resp['grade_counts'] = grade_counts

        if subject_grades_payload:
            resp['subject_grades'] = subject_grades_payload

        # include any stored subject grades for this student in response
        if student_name and student_name in stored_subject_grades:
            resp['subject_grades_stored'] = stored_subject_grades.get(student_name)

        # Cache last report data for this student so they can download directly
        try:
            report_payload = resp.copy()
            report_payload['semesters'] = semesters
            report_payload['student_name'] = student_name
            report_payload['department'] = data.get('department', '')
            report_payload['subject_grades'] = subject_grades_payload
            report_payload['attendance'] = data.get('attendance')
            report_payload['midterm'] = data.get('midterm')
            last_reports[student_name] = report_payload
        except Exception:
            pass

        # Save prediction to history for logged-in users
        try:
            username = session.get('username')
            if username:
                # Save subject grades to CSV if provided
                if subject_grades_payload:
                    try:
                        # subject_grades_payload format: {semester: {subject: grade}}
                        for sem_key, subjects_dict in subject_grades_payload.items():
                            if isinstance(subjects_dict, dict):
                                semester_num = int(sem_key) if str(sem_key).isdigit() else int(semesters[int(sem_key)-1].get('semester', sem_key))
                                db.save_student_grades(username, semester_num, subjects_dict)
                    except Exception as e:
                        print(f"Error saving grades: {e}")
                
                # Get average predicted SGPA across all predictions
                avg_predicted_cgpa = np.mean([p['predicted_sgpa'] for p in predictions])
                
                # Convert SGPA to letter grade
                predicted_grade = sgpa_to_letter_grade(avg_predicted_cgpa)
                
                # Calculate pass probability
                pass_prob = 100.0 if avg_predicted_cgpa >= 2.0 else (avg_predicted_cgpa / 2.0) * 100
                
                # Calculate average attendance from subject grades payload
                attendance_val = None
                attendance_data = data.get('attendance')
                if attendance_data and isinstance(attendance_data, dict):
                    # attendance_data format: {semester: {subject: attendance_percentage}}
                    all_attendance_values = []
                    for sem_key, subjects_att in attendance_data.items():
                        if isinstance(subjects_att, dict):
                            all_attendance_values.extend([int(v) for v in subjects_att.values() if isinstance(v, (int, float, str)) and str(v).isdigit()])
                    
                    if all_attendance_values:
                        attendance_val = int(np.mean(all_attendance_values))
                elif attendance_data:
                    # Try to convert single value
                    try:
                        attendance_val = int(attendance_data)
                    except (ValueError, TypeError):
                        attendance_val = None
                
                # Save to database
                prediction_id = db.save_prediction(
                    username=username,
                    semester=num_semesters + 1,  # Next semester
                    predicted_cgpa=avg_predicted_cgpa,
                    predicted_grade=predicted_grade,
                    pass_probability=pass_prob,
                    attendance=attendance_val,
                    study_hours=None,  # Not tracked in current version
                    absences=None
                )
                resp['prediction_id'] = prediction_id
        except Exception as e:
            print(f"Error saving prediction: {e}")
            pass

        return jsonify(resp)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-report', methods=['POST'])
def download_report():
    try:
        data = request.get_json()
        
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Title
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="Student Performance Report", ln=True, align='C')
        pdf.ln(10)
        
        # Student Info
        student_name = data.get('student_name', '')
        department = data.get('department', '')
        if student_name or department:
            info = f"Student: {student_name}"
            if department:
                info += f" | Department: {department}"
            pdf.set_font("Arial", size=12)
            pdf.cell(200, 10, txt=info, ln=True)
            pdf.ln(5)
        
        # SGPA Table
        if data.get('semesters'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Completed Semesters SGPA:", ln=True)
            pdf.set_font("Arial", size=12)
            for sem in data['semesters']:
                pdf.cell(200, 10, txt=f"Semester {sem['semester']}: {sem['sgpa']:.2f}", ln=True)
            pdf.ln(5)
        
        # Current Average
        current_avg = data.get('current_average', 'N/A')
        pdf.cell(200, 10, txt=f"Current Average SGPA: {current_avg}", ln=True)
        pdf.ln(5)

        # Subject Grades (if provided) - support multiple semesters
        if data.get('subject_grades'):
            sg = data.get('subject_grades')
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Subject Grades:", ln=True)
            pdf.set_font("Arial", size=12)
            # If structure is { sem: { subj: grade, ... }, ... }
            try:
                # sort keys as integers if possible
                sem_keys = sorted(list(sg.keys()), key=lambda x: int(x))
            except Exception:
                sem_keys = list(sg.keys())

            for sem_key in sem_keys:
                grades_map = sg.get(sem_key, {})
                pdf.cell(200, 8, txt=f"Semester {sem_key}:", ln=True)
                for subj, grade in grades_map.items():
                    pdf.cell(200, 8, txt=f"  {subj}: {grade}", ln=True)
                pdf.ln(2)
            pdf.ln(5)

        # Attendance (if provided)
        if data.get('attendance'):
            att = data.get('attendance')
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Attendance (%):", ln=True)
            pdf.set_font("Arial", size=12)
            try:
                sem_keys = sorted(list(att.keys()), key=lambda x: int(x))
            except Exception:
                sem_keys = list(att.keys())
            for sem_key in sem_keys:
                att_map = att.get(sem_key, {})
                pdf.cell(200, 8, txt=f"Semester {sem_key}:", ln=True)
                for subj, val in att_map.items():
                    pdf.cell(200, 8, txt=f"  {subj}: {val}%", ln=True)
                pdf.ln(2)
            pdf.ln(5)

        # Midterm marks (if provided)
        if data.get('midterm'):
            mid = data.get('midterm')
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Midterm Marks:", ln=True)
            pdf.set_font("Arial", size=12)
            sem = mid.get('semester')
            pdf.cell(200, 8, txt=f"Semester {sem}:", ln=True)
            for subj, val in mid.get('marks', {}).items():
                pdf.cell(200, 8, txt=f"  {subj}: {val}", ln=True)
            pdf.ln(5)
        
        # Trend
        trend = data.get('trend', 'N/A')
        pdf.cell(200, 10, txt=f"Performance Trend: {trend}", ln=True)
        pdf.ln(5)
        
        # Predictions
        if data.get('predictions'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Predicted Remaining Semesters:", ln=True)
            pdf.set_font("Arial", size=12)
            for pred in data['predictions']:
                pdf.cell(200, 10, txt=f"Semester {pred['semester']}: {pred['predicted_sgpa']:.2f}", ln=True)
            pdf.ln(5)
        
        # CGPA
        all_sgpas = [s['sgpa'] for s in data.get('semesters', [])] + [p['predicted_sgpa'] for p in data.get('predictions', [])]
        if all_sgpas:
            cgpa = np.mean(all_sgpas)
            pdf.cell(200, 10, txt=f"Projected Final CGPA: {cgpa:.2f}", ln=True)
            pdf.ln(5)
        
        # Risk Assessment
        risk = data.get('risk', 'N/A')
        pdf.cell(200, 10, txt=f"Risk Assessment: {risk}", ln=True)
        pdf.ln(5)
        
        # Recommendations
        insight = data.get('insight', 'N/A')
        pdf.cell(200, 10, txt=f"Recommendations: {insight}", ln=True)
        pdf.ln(5)
        
        # Features
        if data.get('features'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Key Performance Indicators:", ln=True)
            pdf.set_font("Arial", size=12)
            for feature in data['features']:
                pdf.cell(200, 10, txt=f"• {feature}", ln=True)
        
        # Output PDF
        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        
        return buffer.getvalue(), 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=Performance_Report.pdf'
        }
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download-latest')
def download_latest():
    """Download the last generated report for a student by name (GET).
    Uses cached `last_reports` stored when `/api/predict` was called.
    """
    name = request.args.get('name', '')
    if not name or name not in last_reports:
        return jsonify({'error': 'No report found for this student (generate predictions first).'}), 404

    data = last_reports.get(name, {})
    # Reuse the PDF generation logic from download_report
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="Student Performance Report", ln=True, align='C')
        pdf.ln(10)

        student_name = data.get('student_name', '')
        department = data.get('department', '')
        if student_name or department:
            info = f"Student: {student_name}"
            if department:
                info += f" | Department: {department}"
            pdf.set_font("Arial", size=12)
            pdf.cell(200, 10, txt=info, ln=True)
            pdf.ln(5)

        if data.get('semesters'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Completed Semesters SGPA:", ln=True)
            pdf.set_font("Arial", size=12)
            for sem in data.get('semesters', []):
                pdf.cell(200, 10, txt=f"Semester {sem['semester']}: {sem['sgpa']:.2f}", ln=True)
            pdf.ln(5)

        current_avg = data.get('current_average', 'N/A')
        pdf.cell(200, 10, txt=f"Current Average SGPA: {current_avg}", ln=True)
        pdf.ln(5)

        # Subject grades
        if data.get('subject_grades'):
            sg = data.get('subject_grades')
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Subject Grades:", ln=True)
            pdf.set_font("Arial", size=12)
            try:
                sem_keys = sorted(list(sg.keys()), key=lambda x: int(x))
            except Exception:
                sem_keys = list(sg.keys())
            for sem_key in sem_keys:
                grades_map = sg.get(sem_key, {})
                pdf.cell(200, 8, txt=f"Semester {sem_key}:", ln=True)
                for subj, grade in grades_map.items():
                    pdf.cell(200, 8, txt=f"  {subj}: {grade}", ln=True)
                pdf.ln(2)
            pdf.ln(5)

        trend = data.get('trend', 'N/A')
        pdf.cell(200, 10, txt=f"Performance Trend: {trend}", ln=True)
        pdf.ln(5)

        if data.get('predictions'):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(200, 10, txt="Predicted Remaining Semesters:", ln=True)
            pdf.set_font("Arial", size=12)
            for pred in data.get('predictions', []):
                pdf.cell(200, 10, txt=f"Semester {pred['semester']}: {pred['predicted_sgpa']:.2f}", ln=True)
            pdf.ln(5)

        buffer = BytesIO()
        pdf.output(buffer)
        buffer.seek(0)
        return buffer.getvalue(), 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename=Performance_Report_{name}.pdf'
        }
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ------------------------------------------------------------------
# PREDICTION HISTORY API ENDPOINTS
# ------------------------------------------------------------------

@app.route('/api/prediction-history', methods=['GET'])
@login_required
def get_prediction_history():
    """Get prediction history for the logged-in user"""
    try:
        username = session.get('user')
        limit = request.args.get('limit', 10, type=int)
        
        history = db.get_prediction_history(username, limit)
        
        return jsonify({
            'success': True,
            'history': history
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-subjects/<department>', methods=['GET'])
def get_department_subjects(department):
    """Get subjects for a specific department"""
    try:
        subjects = db.get_subjects_for_department(department)
        return jsonify({
            'success': True,
            'subjects': subjects
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-saved-grades', methods=['GET'])
@login_required
def get_saved_grades():
    """Get saved grades for logged-in student"""
    try:
        username = session.get('username')
        semester = request.args.get('semester', type=int)
        
        if semester:
            grades = db.get_student_grades(username, semester)
        else:
            grades = db.get_student_grades(username)
        
        return jsonify({
            'success': True,
            'grades': grades
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/prediction-accuracy', methods=['GET'])
@login_required
def get_prediction_accuracy():
    """Get prediction accuracy statistics"""
    try:
        username = session.get('user')
        stats = db.get_prediction_accuracy_stats(username)
        
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/update-actual-performance', methods=['POST'])
@login_required
def update_actual_performance():
    """Update a prediction with actual performance"""
    try:
        data = request.get_json()
        prediction_id = data.get('prediction_id')
        actual_cgpa = float(data.get('actual_cgpa'))
        actual_grade = data.get('actual_grade')
        
        result = db.update_actual_performance(prediction_id, actual_cgpa, actual_grade)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
