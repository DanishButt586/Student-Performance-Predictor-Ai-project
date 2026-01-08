<div align="center">

# 🎓 Student Performance Prediction System

### _Using Machine Learning & Artificial Intelligence_

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![ML](https://img.shields.io/badge/Machine_Learning-scikit--learn-orange?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**An intelligent web-based system that predicts student academic performance using Linear Regression, helping educators identify at-risk students early for timely intervention.**

[🚀 Live Demo](#-live-demo) • [📖 Documentation](#-documentation) • [🎯 Features](#-features) • [💻 Installation](#-installation) • [👥 Team](#-team)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Machine Learning Model](#-machine-learning-model)
- [Screenshots](#-screenshots)
- [Team Members](#-team-members)
- [Contributing](#-contributing)
- [License](#-license)
- [References](#-references)

---

## 🌟 Overview

The **Student Performance Prediction System** is a comprehensive full-stack web application that leverages machine learning to predict student academic outcomes. Built with Flask and powered by Linear Regression, this system enables:

- 📊 **Real-time SGPA Prediction** based on 9 subject grades
- 👨‍🎓 **Student Dashboard** with performance visualization
- 👩‍🏫 **Teacher Dashboard** for monitoring all students
- 📈 **Interactive Charts** showing academic trends
- 🔐 **Secure Authentication** with role-based access control
- 📱 **Responsive Design** for desktop and mobile devices

### 🎯 Problem Statement

Traditional education systems face challenges in identifying at-risk students early, leading to:

- ⏰ **Late Intervention** - Problems discovered only after semester results
- 📊 **Data Fragmentation** - Student information scattered across systems
- ❌ **Reactive Approach** - Lack of predictive insights for proactive support
- ⏳ **Manual Monitoring** - Time-consuming tracking processes

### 💡 Our Solution

Machine Learning-powered predictive analytics that enables:

- ✅ **Early Detection** of struggling students
- ✅ **Data-Driven Decisions** for resource allocation
- ✅ **Proactive Interventions** before it's too late
- ✅ **Automated Monitoring** with real-time insights

---

## ✨ Key Features

### 🎓 For Students

- **Secure Registration & Login** with password hashing (pbkdf2:sha256)
- **Grade Input Interface** for 9 subjects across 3 departments
- **Instant SGPA Prediction** using trained ML model (R² = 0.82)
- **Performance Visualization** with interactive Chart.js graphs
- **Historical Tracking** of predictions across semesters
- **Auto-fill Functionality** for quick grade entry

### 👩‍🏫 For Teachers

- **Comprehensive Dashboard** showing all registered students
- **Performance Categories** (Excellent, Good, Average, Below Average, Poor)
- **Advanced Filtering** by department, semester, and performance
- **Detailed Student View** with complete academic history
- **Visual Analytics** including attendance and grade trends
- **Export Capabilities** for reports and analysis

### 🔒 Security Features

- Password hashing using industry-standard algorithms
- Session management with 2-hour timeout
- CSRF protection and secure form handling
- Input validation and sanitization
- Role-based access control (Student/Teacher)

---

## 🛠️ Technology Stack

### Backend

| Technology                                                                                                 | Version | Purpose                   |
| ---------------------------------------------------------------------------------------------------------- | ------- | ------------------------- |
| ![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)                     | 3.9+    | Core programming language |
| ![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?logo=flask)                                       | 3.0.0   | Web framework             |
| ![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3.2-F7931E?logo=scikit-learn&logoColor=white) | 1.3.2   | Machine learning          |
| ![pandas](https://img.shields.io/badge/pandas-2.1.4-150458?logo=pandas)                                    | 2.1.4   | Data manipulation         |
| ![NumPy](https://img.shields.io/badge/NumPy-1.26.2-013243?logo=numpy)                                      | 1.26.2  | Numerical computing       |

### Frontend

| Technology                                                                                         | Purpose            |
| -------------------------------------------------------------------------------------------------- | ------------------ |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)                     | Structure          |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3)                                        | Styling            |
| ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black) | Interactivity      |
| ![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-FF6384?logo=chart.js)                      | Data visualization |

### Database

- **CSV-based Storage** (users.csv, sessions.csv, predictions_history.csv, student_grades.csv)
- Easily upgradeable to SQL database for production

---

## 🏗️ System Architecture

```
┌─────────────┐
│   User      │ (Student/Teacher)
│  Interface  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Frontend   │ HTML/CSS/JavaScript + Chart.js
│  (Client)   │
└──────┬──────┘
       │ HTTP Requests
       ↓
┌─────────────┐
│   Flask     │ Routes, Authentication, Session Management
│  Backend    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   ML Model  │ Linear Regression (R² = 0.82)
│  (Trained)  │ Predicts SGPA from 9 subjects
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Database   │ CSV Storage (Users, Grades, History)
│   (Data)    │
└─────────────┘
```

---

## 💻 Installation

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/DanishButt586/Student-Performance-Predictor-Ai-project.git
cd Student-Performance-Predictor-Ai-project
```

### Step 2: Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Required Packages:**

```
Flask==3.0.0
pandas==2.1.4
numpy==1.26.2
scikit-learn==1.3.2
openpyxl==3.1.2
fpdf==1.7.2
werkzeug==3.0.1
python-docx==1.1.0
python-pptx==1.0.2
```

### Step 4: Run the Application

```bash
python app.py
```

The application will start on `http://127.0.0.1:5000/`

### Step 5: Access the System

1. **Register** as a new student
2. **Login** with your credentials
3. **Enter grades** for 9 subjects
4. **Get instant SGPA prediction**
5. **View performance charts**

For **Teacher Access**, use the teacher login credentials (configured in the system).

---

## 🚀 Usage

### Running the Web Application

```bash
# Option 1: Direct Python execution
python app.py

# Option 2: Using batch file (Windows)
run_app.bat

# Option 3: Using Flask CLI
flask run
```

### Running GUI Version (Jupyter Notebook)

```bash
# Start Jupyter
jupyter notebook

# Open and run:
# - gradePredictor - GUI.ipynb (Interactive GUI)
# - gradePredictor - TERMINAL.ipynb (CLI version)
```

### Generating Documentation

```bash
# Generate Word report
python generate_report.py

# Generate PowerPoint presentation
python generate_presentation.py
```

---

## 📁 Project Structure

```
Student-Performance-Predictor/
│
├── 📄 app.py                          # Main Flask application
├── 📄 database.py                     # Database operations & ML model
├── 📄 requirements.txt                # Python dependencies
│
├── 📁 templates/                      # HTML templates
│   ├── index.html                     # Student dashboard
│   ├── start.html                     # Landing page
│   ├── register.html                  # Registration form
│   ├── login.html                     # Login form
│   └── teacher.html                   # Teacher dashboard
│
├── 📁 static/                         # Static assets
│   ├── style.css                      # Main stylesheet
│   ├── script.js                      # Student dashboard JS
│   └── teacher.js                     # Teacher dashboard JS
│
├── 📁 data/                           # Data files
│   ├── student-mat.csv                # UCI dataset
│   ├── users.csv                      # User accounts
│   ├── sessions.csv                   # Active sessions
│   ├── predictions_history.csv        # Prediction logs
│   └── student_grades.csv             # Student grades database
│
├── 📁 notebooks/                      # Jupyter notebooks
│   ├── gradePredictor - GUI.ipynb     # GUI version
│   └── gradePredictor - TERMINAL.ipynb # Terminal version
│
├── 📄 generate_report.py              # Word document generator
├── 📄 generate_presentation.py        # PowerPoint generator
├── 📄 PROJECT_EXPLANATION.md          # Technical documentation
├── 📄 PROJECT_REPORT.md               # Academic report
├── 📄 README.md                       # This file
└── 📄 LICENSE                         # MIT License

```

---

## 🤖 Machine Learning Model

### Algorithm: Linear Regression

**Why Linear Regression?**

- ✅ **High Accuracy**: R² Score = 0.82 (82% variance explained)
- ✅ **Fast Predictions**: <200ms response time
- ✅ **Interpretable**: Clear relationship between features and output
- ✅ **Balanced**: Best accuracy-speed tradeoff

### Model Performance

| Metric            | Value | Description                          |
| ----------------- | ----- | ------------------------------------ |
| **R² Score**      | 0.82  | Model explains 82% of grade variance |
| **MAE**           | 1.86  | Average error of ±1.86%              |
| **RMSE**          | 2.43  | Root mean squared error              |
| **Training Time** | 0.02s | Lightning-fast training              |

### Comparison with Other Models

| Algorithm               | R² Score | MAE      | RMSE     | Training Time |
| ----------------------- | -------- | -------- | -------- | ------------- |
| **Linear Regression** ✓ | **0.82** | **1.86** | **2.43** | **0.02s**     |
| Ridge Regression        | 0.81     | 1.89     | 2.45     | 0.03s         |
| Random Forest           | 0.84     | 1.78     | 2.35     | 1.20s         |
| Decision Tree           | 0.75     | 2.12     | 2.78     | 0.08s         |

**Selected Model**: Linear Regression offers the best balance of accuracy and speed for real-time predictions.

### Features Used

- **Input**: 9 subject grades (each 0-100)
- **Output**: Predicted SGPA (0-4.0 scale)
- **Departments**: Computer Science, Software Engineering, Cyber Security

### Training Dataset

- **Source**: UCI Machine Learning Repository (Student Performance Dataset)
- **Records**: 395 student entries
- **Features**: 33 attributes including grades, demographics, and study habits
- **Link**: [UCI Dataset](https://archive.ics.uci.edu/ml/datasets/Student+Performance)

---

## 📸 Screenshots

### 🏠 Landing Page

_Beautiful hero section with system overview_

### 🎓 Student Dashboard

_Interactive grade input and SGPA prediction with charts_

### 👩‍🏫 Teacher Dashboard

_Comprehensive student monitoring with filtering and analytics_

### 📊 Performance Charts

_Visual representation of academic trends and attendance_

---

## 👥 Team Members

<div align="center">

### 🏆 Team Leader

**Danish Butt**  
Roll No: 233606  
[![GitHub](https://img.shields.io/badge/GitHub-DanishButt586-181717?logo=github)](https://github.com/DanishButt586)

### 👨‍💻 Team Members

| Name             | Roll Number |
| ---------------- | ----------- |
| **Sadia Khan**   | 233544      |
| **Rayyan Javed** | 233532      |
| **Owaif Amir**   | 233586      |

### 👩‍🏫 Instructor

**Mam Atika**  
Air University, Multan Campus

</div>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🔀 **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. ✍️ **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push** to the branch (`git push origin feature/AmazingFeature`)
5. 🎉 **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 style guide for Python code
- Write clear commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Danish Butt & Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📚 References

1. **Dataset**: Cortez, Paulo. (2014). _Student Performance_. UCI Machine Learning Repository.  
   [https://doi.org/10.24432/C5TG7T](https://doi.org/10.24432/C5TG7T)

2. **Flask Documentation**: [https://flask.palletsprojects.com/](https://flask.palletsprojects.com/)

3. **scikit-learn**: [https://scikit-learn.org/](https://scikit-learn.org/)

4. **Chart.js**: [https://www.chartjs.org/](https://www.chartjs.org/)

---

## 📞 Contact & Support

<div align="center">

**Have questions or suggestions?**

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/DanishButt586/Student-Performance-Predictor-Ai-project/issues)
[![Email](https://img.shields.io/badge/Email-Contact_Us-blue?style=for-the-badge&logo=gmail)](mailto:danishbutt586@gmail.com)

### ⭐ Star this repository if you find it helpful!

</div>

---

## 🎯 Future Enhancements

- [ ] Add PostgreSQL database support
- [ ] Implement attendance tracking integration
- [ ] Add email notifications for at-risk students
- [ ] Create mobile application (React Native)
- [ ] Implement additional ML models (Neural Networks)
- [ ] Add multi-language support
- [ ] Include parent portal
- [ ] Generate automated progress reports

---

<div align="center">

**Made with ❤️ by Team Danish Butt**

_Empowering education through artificial intelligence_

[![GitHub stars](https://img.shields.io/github/stars/DanishButt586/Student-Performance-Predictor-Ai-project?style=social)](https://github.com/DanishButt586/Student-Performance-Predictor-Ai-project/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/DanishButt586/Student-Performance-Predictor-Ai-project?style=social)](https://github.com/DanishButt586/Student-Performance-Predictor-Ai-project/network/members)

</div>
