"""
Database Manager for CSV-based Storage
Students stored in CSV, Single Teacher with hardcoded credentials
"""

import pandas as pd
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

class ExcelDatabase:
    def __init__(self, data_folder='data'):
        self.data_folder = data_folder
        self.users_file = os.path.join(data_folder, 'users.csv')
        self.predictions_file = os.path.join(data_folder, 'predictions_history.csv')
        self.sessions_file = os.path.join(data_folder, 'sessions.csv')
        self.grades_file = os.path.join(data_folder, 'student_grades.csv')
        
        # Hardcoded single teacher credentials
        self.TEACHER_USERNAME = 'Aatka Ali'
        self.TEACHER_PASSWORD_HASH = generate_password_hash('Aatka123')
        self.TEACHER_FULL_NAME = 'Aatka Ali'
        self.TEACHER_DEPARTMENT = 'Computer Science'
        
        # Department-specific subjects
        self.DEPARTMENT_SUBJECTS = {
            'Computer Science': [
                'Programming Fundamentals', 'Data Structures', 'Algorithms',
                'Database Systems', 'Operating Systems', 'Computer Networks',
                'Software Engineering', 'Web Development', 'Artificial Intelligence'
            ],
            'Software Engineering': [
                'Software Design', 'Software Testing', 'Project Management',
                'Requirements Engineering', 'Software Architecture', 'Agile Development',
                'DevOps', 'Mobile App Development', 'UI/UX Design'
            ],
            'Cyber Security': [
                'Network Security', 'Cryptography', 'Ethical Hacking',
                'Security Auditing', 'Digital Forensics', 'Secure Coding',
                'Penetration Testing', 'Security Protocols', 'Incident Response'
            ]
        }
        
        # Initialize CSV files
        self._init_users_file()
        self._init_predictions_file()
        self._init_sessions_file()
        self._init_grades_file()
    
    def _init_users_file(self):
        """Initialize users CSV file (empty - students will register themselves)"""
        if not os.path.exists(self.users_file):
            # Create empty CSV with headers only
            empty_users = pd.DataFrame(columns=[
                'username', 'password_hash', 'full_name', 'department', 
                'semester', 'registration_date', 'last_login', 'is_active'
            ])
            empty_users.to_csv(self.users_file, index=False)
    
    def _init_predictions_file(self):
        """Initialize predictions history CSV file"""
        if not os.path.exists(self.predictions_file):
            predictions_df = pd.DataFrame(columns=[
                'prediction_id', 'username', 'timestamp', 'semester',
                'predicted_cgpa', 'predicted_grade', 'pass_probability',
                'attendance', 'study_hours', 'absences',
                'actual_cgpa', 'actual_grade', 'accuracy_score', 'updated_at'
            ])
            predictions_df.to_csv(self.predictions_file, index=False)
    
    def _init_sessions_file(self):
        """Initialize sessions CSV file"""
        if not os.path.exists(self.sessions_file):
            sessions_df = pd.DataFrame(columns=[
                'session_id', 'username', 'user_type', 'created_at', 'expires_at', 'is_active'
            ])
            sessions_df.to_csv(self.sessions_file, index=False)
    
    def _init_grades_file(self):
        """Initialize student grades CSV file"""
        if not os.path.exists(self.grades_file):
            grades_df = pd.DataFrame(columns=[
                'username', 'semester', 'subject', 'grade', 'updated_at'
            ])
            grades_df.to_csv(self.grades_file, index=False)
    
    # =============================================
    # USER AUTHENTICATION METHODS
    # =============================================
    
    def register_student(self, username, password, department, semester):
        """Register a new student in CSV"""
        users_df = pd.read_csv(self.users_file)
        
        # Check if username already exists
        if username in users_df['username'].values:
            return {'success': False, 'message': 'Username already exists'}
        
        # Use username as full_name
        # Create new user
        new_user = pd.DataFrame({
            'username': [username],
            'password_hash': [generate_password_hash(password)],
            'full_name': [username],
            'department': [department],
            'semester': [semester],
            'registration_date': [datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            'last_login': [None],
            'is_active': [True]
        })
        
        users_df = pd.concat([users_df, new_user], ignore_index=True)
        users_df.to_csv(self.users_file, index=False)
        
        return {'success': True, 'message': 'Registration successful'}
    
    def authenticate_user(self, username, password, user_type='student'):
        """Authenticate user - students from CSV, teacher hardcoded"""
        
        if user_type == 'teacher':
            # Teacher authentication (hardcoded)
            if username == self.TEACHER_USERNAME and check_password_hash(self.TEACHER_PASSWORD_HASH, password):
                return {
                    'success': True,
                    'username': self.TEACHER_USERNAME,
                    'full_name': self.TEACHER_FULL_NAME,
                    'department': self.TEACHER_DEPARTMENT
                }
            return {'success': False, 'message': 'Invalid teacher credentials'}
        
        # Student authentication from CSV
        if not os.path.exists(self.users_file):
            return {'success': False, 'message': 'User database not found'}
        
        users_df = pd.read_csv(self.users_file)
        user = users_df[users_df['username'] == username]
        
        if user.empty:
            return {'success': False, 'message': 'Invalid username or password'}
        
        user_data = user.iloc[0]
        
        if not user_data['is_active']:
            return {'success': False, 'message': 'Account is deactivated'}
        
        if check_password_hash(user_data['password_hash'], password):
            # Update last login
            users_df.loc[users_df['username'] == username, 'last_login'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            users_df.to_csv(self.users_file, index=False)
            
            return {
                'success': True,
                'username': username,
                'full_name': user_data['full_name'],
                'department': user_data.get('department', 'N/A'),
                'semester': user_data.get('semester', 1)
            }
        else:
            return {'success': False, 'message': 'Invalid username or password'}
    
    def create_session(self, username, user_type, timeout_minutes=120):
        """Create a new session for authenticated user"""
        sessions_df = pd.read_csv(self.sessions_file)
        
        session_id = secrets.token_urlsafe(32)
        created_at = datetime.now()
        expires_at = created_at + timedelta(minutes=timeout_minutes)
        
        new_session = pd.DataFrame({
            'session_id': [session_id],
            'username': [username],
            'user_type': [user_type],
            'created_at': [created_at.strftime('%Y-%m-%d %H:%M:%S')],
            'expires_at': [expires_at.strftime('%Y-%m-%d %H:%M:%S')],
            'is_active': [True]
        })
        
        sessions_df = pd.concat([sessions_df, new_session], ignore_index=True)
        sessions_df.to_csv(self.sessions_file, index=False)
        
        return session_id
    
    def validate_session(self, session_id):
        """Validate if session is active and not expired"""
        if not session_id:
            return {'valid': False, 'message': 'No session ID provided'}
        
        sessions_df = pd.read_csv(self.sessions_file)
        session = sessions_df[sessions_df['session_id'] == session_id]
        
        if session.empty:
            return {'valid': False, 'message': 'Invalid session'}
        
        session_data = session.iloc[0]
        
        if not session_data['is_active']:
            return {'valid': False, 'message': 'Session is inactive'}
        
        expires_at = pd.to_datetime(session_data['expires_at'])
        if datetime.now() > expires_at:
            # Deactivate expired session
            sessions_df.loc[sessions_df['session_id'] == session_id, 'is_active'] = False
            sessions_df.to_csv(self.sessions_file, index=False)
            return {'valid': False, 'message': 'Session expired'}
        
        return {
            'valid': True,
            'username': session_data['username'],
            'user_type': session_data['user_type']
        }
    
    def invalidate_session(self, session_id):
        """Logout - invalidate session"""
        sessions_df = pd.read_csv(self.sessions_file)
        sessions_df.loc[sessions_df['session_id'] == session_id, 'is_active'] = False
        sessions_df.to_csv(self.sessions_file, index=False)
    
    # =============================================
    # PREDICTION HISTORY METHODS
    # =============================================
    
    def save_prediction(self, username, semester, predicted_cgpa, predicted_grade, 
                       pass_probability, attendance=None, study_hours=None, absences=None):
        """Save a new prediction to history"""
        predictions_df = pd.read_csv(self.predictions_file)
        
        # Generate unique prediction ID
        prediction_id = f"{username}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        new_prediction = pd.DataFrame({
            'prediction_id': [prediction_id],
            'username': [username],
            'timestamp': [datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            'semester': [semester],
            'predicted_cgpa': [predicted_cgpa],
            'predicted_grade': [predicted_grade],
            'pass_probability': [pass_probability],
            'attendance': [attendance],
            'study_hours': [study_hours],
            'absences': [absences],
            'actual_cgpa': [None],
            'actual_grade': [None],
            'accuracy_score': [None],
            'updated_at': [None]
        })
        
        predictions_df = pd.concat([predictions_df, new_prediction], ignore_index=True)
        predictions_df.to_csv(self.predictions_file, index=False)
        
        return prediction_id
    
    def get_prediction_history(self, username, limit=10):
        """Get prediction history for a user"""
        predictions_df = pd.read_csv(self.predictions_file)
        user_predictions = predictions_df[predictions_df['username'] == username]
        
        # Sort by timestamp descending (most recent first)
        user_predictions = user_predictions.sort_values('timestamp', ascending=False)
        
        if limit:
            user_predictions = user_predictions.head(limit)
        
        return user_predictions.to_dict('records')
    
    def update_actual_performance(self, prediction_id, actual_cgpa, actual_grade):
        """Update prediction with actual performance for accuracy tracking"""
        predictions_df = pd.read_csv(self.predictions_file)
        
        if prediction_id not in predictions_df['prediction_id'].values:
            return {'success': False, 'message': 'Prediction not found'}
        
        # Calculate accuracy score (percentage difference)
        pred_row = predictions_df[predictions_df['prediction_id'] == prediction_id].iloc[0]
        predicted_cgpa = pred_row['predicted_cgpa']
        accuracy = 100 - (abs(predicted_cgpa - actual_cgpa) / 4.0 * 100)  # Assuming 4.0 scale
        
        predictions_df.loc[predictions_df['prediction_id'] == prediction_id, 'actual_cgpa'] = actual_cgpa
        predictions_df.loc[predictions_df['prediction_id'] == prediction_id, 'actual_grade'] = actual_grade
        predictions_df.loc[predictions_df['prediction_id'] == prediction_id, 'accuracy_score'] = accuracy
        predictions_df.loc[predictions_df['prediction_id'] == prediction_id, 'updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        predictions_df.to_csv(self.predictions_file, index=False)
        
        return {'success': True, 'accuracy': accuracy}
    
    def get_prediction_accuracy_stats(self, username):
        """Get accuracy statistics for user's predictions"""
        predictions_df = pd.read_csv(self.predictions_file)
        user_predictions = predictions_df[
            (predictions_df['username'] == username) & 
            (predictions_df['actual_cgpa'].notna())
        ]
        
        if user_predictions.empty:
            return {
                'total_predictions': 0,
                'validated_predictions': 0,
                'average_accuracy': 0,
                'best_accuracy': 0,
                'worst_accuracy': 0
            }
        
        return {
            'total_predictions': len(predictions_df[predictions_df['username'] == username]),
            'validated_predictions': len(user_predictions),
            'average_accuracy': user_predictions['accuracy_score'].mean(),
            'best_accuracy': user_predictions['accuracy_score'].max(),
            'worst_accuracy': user_predictions['accuracy_score'].min()
        }
    
    def get_user_info(self, username, user_type='student'):
        """Get user information"""
        if user_type == 'teacher':
            if username == self.TEACHER_USERNAME:
                return {
                    'username': self.TEACHER_USERNAME,
                    'full_name': self.TEACHER_FULL_NAME,
                    'department': self.TEACHER_DEPARTMENT
                }
            return None
        
        users_df = pd.read_csv(self.users_file)
        user = users_df[users_df['username'] == username]
        
        if user.empty:
            return None
        
        return user.iloc[0].to_dict()
    
    # =============================================
    # TEACHER DASHBOARD ANALYTICS METHODS
    # =============================================
    
    def get_all_students_with_predictions(self):
        """Get all students with their prediction history for teacher dashboard"""
        users_df = pd.read_csv(self.users_file)
        predictions_df = pd.read_csv(self.predictions_file)
        grades_df = pd.read_csv(self.grades_file)
        
        students_data = []
        
        for _, student in users_df.iterrows():
            username = student['username']
            
            # Get all predictions for this student
            student_predictions = predictions_df[predictions_df['username'] == username]
            
            if not student_predictions.empty:
                # Get latest prediction
                latest_pred = student_predictions.sort_values('timestamp', ascending=False).iloc[0]
                
                # Calculate average CGPA from predictions
                avg_predicted_cgpa = student_predictions['predicted_cgpa'].mean()
                
                # Get attendance if available - safely convert to int
                attendance = 0
                try:
                    att_value = latest_pred['attendance']
                    if pd.notna(att_value):
                        att_str = str(att_value).strip()
                        
                        # Check if it's a dictionary string
                        if att_str.startswith('{') or att_str.startswith("'{"):
                            # Parse dictionary string and get average
                            try:
                                import ast
                                # Handle both single and double quotes
                                att_str_clean = att_str.replace("'", '"') if not att_str.startswith('"{') else att_str
                                try:
                                    att_dict = ast.literal_eval(att_str)
                                except:
                                    # If ast fails, try json
                                    import json
                                    att_dict = json.loads(att_str_clean)
                                
                                # Extract all attendance values
                                all_vals = []
                                for sem_key, sem_data in att_dict.items():
                                    if isinstance(sem_data, dict):
                                        for subject, att_val in sem_data.items():
                                            try:
                                                all_vals.append(int(att_val))
                                            except (ValueError, TypeError):
                                                pass
                                
                                if all_vals:
                                    attendance = int(sum(all_vals) / len(all_vals))
                            except Exception as e:
                                print(f"Error parsing attendance dict: {e}")
                                attendance = 0
                        else:
                            # Direct integer conversion
                            attendance = int(float(att_str))
                except (ValueError, TypeError) as e:
                    print(f"Error converting attendance: {e}")
                    attendance = 0
                
                # Get real subject grades for all semesters
                student_grades = grades_df[grades_df['username'] == username]
                subjects = []
                
                # Get all grades organized by semester
                all_semester_grades = {}
                if not student_grades.empty:
                    for _, grade_row in student_grades.iterrows():
                        sem = int(grade_row['semester'])
                        if sem not in all_semester_grades:
                            all_semester_grades[sem] = []
                        all_semester_grades[sem].append({
                            'name': grade_row['subject'],
                            'grade': grade_row['grade'],
                            'credits': 3
                        })
                    
                    # Get latest semester grades for subjects list
                    if student_grades['semester'].nunique() > 0:
                        latest_sem = int(student_grades['semester'].max())
                        latest_grades = student_grades[student_grades['semester'] == latest_sem]
                        for _, subject_row in latest_grades.iterrows():
                            subjects.append({
                                'name': subject_row['subject'],
                                'grade': subject_row['grade'],
                                'credits': 3
                            })
                
                # Grade to GPA mapping for calculating SGPA from grades
                grade_to_gpa = {
                    'A': 4.0, 'A-': 3.7,
                    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                    'D': 1.0, 'F': 0.0
                }
                
                # Build complete history including all semesters with grades
                history = []
                all_semesters = set()
                
                # Add semesters from predictions
                for idx, pred in student_predictions.iterrows():
                    sem = int(pred['semester']) if pd.notna(pred['semester']) else 1
                    all_semesters.add(sem)
                
                # Add semesters from grades
                all_semesters.update(all_semester_grades.keys())
                
                # Build history for each semester
                for sem_num in sorted(all_semesters):
                    sgpa = None
                    attendance_val = 0
                    
                    # Try to get SGPA from prediction first
                    sem_preds = student_predictions[student_predictions['semester'] == sem_num]
                    if not sem_preds.empty:
                        latest_sem_pred = sem_preds.sort_values('timestamp', ascending=False).iloc[0]
                        sgpa = round(latest_sem_pred['predicted_cgpa'], 2)
                        # Try to extract attendance from prediction
                        try:
                            att_val = latest_sem_pred['attendance']
                            if pd.notna(att_val):
                                att_str = str(att_val).strip()
                                if att_str.startswith('{'):
                                    # Parse dict for this semester's attendance
                                    try:
                                        import ast
                                        att_dict = ast.literal_eval(att_str)
                                        if str(sem_num) in att_dict and isinstance(att_dict[str(sem_num)], dict):
                                            sem_att_vals = [int(v) for v in att_dict[str(sem_num)].values() if str(v).isdigit()]
                                            if sem_att_vals:
                                                attendance_val = int(sum(sem_att_vals) / len(sem_att_vals))
                                    except:
                                        pass
                                else:
                                    attendance_val = int(float(att_str))
                        except:
                            pass
                    
                    # If no prediction SGPA, calculate from grades
                    if sgpa is None and sem_num in all_semester_grades:
                        grades_list = all_semester_grades[sem_num]
                        total_points = 0
                        total_credits = 0
                        for subject in grades_list:
                            grade = subject['grade']
                            credits = subject['credits']
                            if grade in grade_to_gpa:
                                total_points += grade_to_gpa[grade] * credits
                                total_credits += credits
                        
                        if total_credits > 0:
                            sgpa = round(total_points / total_credits, 2)
                    
                    # Add to history if we have SGPA
                    if sgpa is not None:
                        history.append({
                            'semester': sem_num,
                            'sgpa': sgpa,
                            'attendance': attendance_val
                        })
                
                # Sort history by semester
                history.sort(key=lambda x: x['semester'])
                
                if not subjects:
                    # Fallback to placeholder if no grades saved
                    subjects = [
                        {'name': 'Course ' + str(i+1), 'grade': latest_pred['predicted_grade'], 'credits': 3}
                        for i in range(4)
                    ]
                
                # Build complete semester history with grades and SGPA
                semester_details = {}
                
                # Create a map of semester -> SGPA from history (use the latest/last entry for each semester)
                semester_sgpa_map = {}
                for h in history:
                    # This will naturally use the latest value if there are multiple entries for same semester
                    # because history is sorted by semester and we iterate in order
                    semester_sgpa_map[h['semester']] = h['sgpa']
                
                # Grade to GPA mapping
                grade_to_gpa = {
                    'A': 4.0, 'A-': 3.7,
                    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                    'D': 1.0, 'F': 0.0
                }
                
                for sem_num, grades_list in all_semester_grades.items():
                    # Get SGPA for this semester from history
                    sgpa = semester_sgpa_map.get(sem_num, None)
                    
                    # If no prediction exists for this semester, calculate SGPA from grades
                    if sgpa is None and grades_list:
                        total_points = 0
                        total_credits = 0
                        for subject in grades_list:
                            grade = subject['grade']
                            credits = subject['credits']
                            if grade in grade_to_gpa:
                                total_points += grade_to_gpa[grade] * credits
                                total_credits += credits
                        
                        if total_credits > 0:
                            sgpa = round(total_points / total_credits, 2)
                    
                    semester_details[sem_num] = {
                        'semester': sem_num,
                        'subjects': grades_list,
                        'sgpa': sgpa
                    }
                
                student_data = {
                    'id': username,
                    'name': student['full_name'],
                    'cgpa': round(avg_predicted_cgpa, 2),
                    'semester': int(student['semester']) if pd.notna(student['semester']) else 1,
                    'department': student['department'] if pd.notna(student['department']) else 'N/A',
                    'attendance': int(attendance) if attendance > 0 else 0,
                    'prediction_count': len(student_predictions),
                    'latest_prediction': {
                        'cgpa': round(latest_pred['predicted_cgpa'], 2),
                        'grade': latest_pred['predicted_grade'],
                        'pass_probability': round(latest_pred['pass_probability'] * 100, 1),
                        'timestamp': latest_pred['timestamp']
                    },
                    'subjects': subjects,
                    'history': history,
                    'semester_details': list(semester_details.values())  # All semester grades with SGPA
                }
                
                students_data.append(student_data)
        
        return students_data
    
    def get_department_statistics(self):
        """Calculate department-wise statistics from real data"""
        students = self.get_all_students_with_predictions()
        
        if not students:
            return []
        
        dept_stats = {}
        
        for student in students:
            dept = student['department']
            if dept not in dept_stats:
                dept_stats[dept] = {
                    'name': dept,
                    'students': [],
                    'best_count': 0,
                    'average_count': 0,
                    'worst_count': 0
                }
            
            dept_stats[dept]['students'].append(student)
            
            # Categorize students
            if student['cgpa'] >= 3.5:
                dept_stats[dept]['best_count'] += 1
            elif student['cgpa'] >= 2.5:
                dept_stats[dept]['average_count'] += 1
            else:
                dept_stats[dept]['worst_count'] += 1
        
        # Calculate averages
        result = []
        for dept in dept_stats.values():
            dept['total_students'] = len(dept['students'])
            dept['avg_cgpa'] = sum(s['cgpa'] for s in dept['students']) / dept['total_students']
            dept['avg_attendance'] = sum(s['attendance'] for s in dept['students']) / dept['total_students']
            result.append(dept)
        
        return result
    
    def get_categorized_students(self):
        """Categorize students into best, average, and worst performers"""
        students = self.get_all_students_with_predictions()
        
        best_students = [s for s in students if s['cgpa'] >= 3.5]
        average_students = [s for s in students if 2.5 <= s['cgpa'] < 3.5]
        worst_students = [s for s in students if s['cgpa'] < 2.5]
        
        # Sort each category by CGPA descending
        best_students.sort(key=lambda x: x['cgpa'], reverse=True)
        average_students.sort(key=lambda x: x['cgpa'], reverse=True)
        worst_students.sort(key=lambda x: x['cgpa'], reverse=True)
        
        return {
            'best': best_students,
            'average': average_students,
            'worst': worst_students
        }
    
    # =============================================
    # STUDENT GRADES MANAGEMENT METHODS
    # =============================================
    
    def get_subjects_for_department(self, department):
        """Get list of subjects for a department"""
        return self.DEPARTMENT_SUBJECTS.get(department, [])
    
    def save_student_grades(self, username, semester, grades_dict):
        """Save or update student's grades for a semester
        grades_dict: {subject_name: grade_value}
        """
        grades_df = pd.read_csv(self.grades_file)
        
        # Remove existing grades for this user and semester
        grades_df = grades_df[~((grades_df['username'] == username) & (grades_df['semester'] == semester))]
        
        # Add new grades
        new_grades = []
        for subject, grade in grades_dict.items():
            new_grades.append({
                'username': username,
                'semester': semester,
                'subject': subject,
                'grade': grade,
                'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        new_grades_df = pd.DataFrame(new_grades)
        grades_df = pd.concat([grades_df, new_grades_df], ignore_index=True)
        grades_df.to_csv(self.grades_file, index=False)
        
        return {'success': True}
    
    def get_student_grades(self, username, semester=None):
        """Get student's grades for specific semester or all semesters
        Returns: {semester: {subject: grade}}
        """
        grades_df = pd.read_csv(self.grades_file)
        
        if semester:
            student_grades = grades_df[(grades_df['username'] == username) & (grades_df['semester'] == semester)]
        else:
            student_grades = grades_df[grades_df['username'] == username]
        
        if student_grades.empty:
            return {}
        
        # Organize by semester
        result = {}
        for _, row in student_grades.iterrows():
            sem = int(row['semester'])
            if sem not in result:
                result[sem] = {}
            result[sem][row['subject']] = row['grade']
        
        return result
    
    def get_student_all_grades_list(self, username):
        """Get all student grades as a list for teacher dashboard"""
        grades_df = pd.read_csv(self.grades_file)
        student_grades = grades_df[grades_df['username'] == username]
        
        if student_grades.empty:
            return []
        
        grades_list = []
        for _, row in student_grades.iterrows():
            grades_list.append({
                'semester': int(row['semester']),
                'subject': row['subject'],
                'grade': row['grade']
            })
        
        return grades_list
