// Student Performance Predictor - JavaScript

document.addEventListener('DOMContentLoaded', function () {
    loadMetrics();
    setupEventListeners();
    applyStudentInfo();
});

// Letter grade to GPA mapping (I = Incomplete -> excluded)
const letterToGpa = {
    'A': 4.0,
    'A-': 3.67,
    'B+': 3.33,
    'B': 3.0,
    'B-': 2.67,
    'C+': 2.33,
    'C': 2.0,
    'C-': 1.67,
    'D': 1.0,
    'F': 0.0,
    'I': null
};

// Catalog of courses per department and semester with codes and credit hours
// Credits: {t: theory, l: lab, total: total}
const departmentCatalog = {
    'Computer Science': {
        1: [
            { code: 'HU119', title: 'English Comprehension and Composition', credits: { t: 3, l: 0, total: 3 } },
            { code: 'PH102', title: 'Applied Physics', credits: { t: 3, l: 1, total: 4 } },
            { code: 'HU115', title: 'Pakistan Studies', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS180', title: 'Introduction to ICT', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS180L', title: 'Introduction to ICT Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS111', title: 'Programming Fundamentals', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS111L', title: 'Programming Fundamentals Lab', credits: { t: 0, l: 1, total: 1 } },
        ],
        2: [
            { code: 'HU120', title: 'Communication and Presentation Skills', credits: { t: 3, l: 0, total: 3 } },
            { code: 'MA110', title: 'Calculus & Analytical Geometry', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS112', title: 'Object Oriented Programming', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS112L', title: 'Object Oriented Programming Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'HU118', title: 'Islamic Studies', credits: { t: 2, l: 0, total: 2 } },
            { code: 'EE223', title: 'Digital Logic Design', credits: { t: 3, l: 0, total: 3 } },
            { code: 'EE223L', title: 'Digital Logic Design Lab', credits: { t: 0, l: 1, total: 1 } },
        ],
        3: [
            { code: 'CS270', title: 'Professional Practices', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS214', title: 'Data Structures and Algorithms', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS214L', title: 'Data Structures and Algorithms Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS223', title: 'Computer Organization and Assembly Language', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS223L', title: 'Computer Organization & Assembly Language Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA105', title: 'Multivariable Calculus', credits: { t: 3, l: 0, total: 3 } },
            { code: 'MA216', title: 'Discrete Structures', credits: { t: 3, l: 0, total: 3 } },
        ],
        4: [
            { code: 'MA301', title: 'Probability and Statistics', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS225', title: 'Operating Systems', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS225L', title: 'Operating Systems Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS281', title: 'Mobile Computing (CS-Elective-I)', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS281L', title: 'Mobile Computing Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS230', title: 'Database Systems', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS230L', title: 'Database Systems Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA201', title: 'Linear Algebra', credits: { t: 3, l: 0, total: 3 } },
        ],
        5: [
            { code: 'CS360', title: 'Computer Networks', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS360L', title: 'Computer Networks Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA202', title: 'Numerical Analysis and Computation', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS332', title: 'Design and Analysis of Algorithms', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU317', title: 'Interpersonal Skills / Public Relations', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS382', title: 'Visual Programming (CS Elective-II)', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS382L', title: 'Visual Programming Lab', credits: { t: 0, l: 1, total: 1 } },
        ],
        6: [
            { code: 'CS333', title: 'Theory of Automata', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS340', title: 'Artificial Intelligence', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS340L', title: 'Artificial Intelligence Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS371', title: 'Software Engineering', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS371L', title: 'Software Engineering Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS3XX', title: 'CS Elective-III', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS3XXL', title: 'CS Elective-III Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS3XX', title: 'CS Elective-IV', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS494', title: 'Final Project-I', credits: { t: 0, l: 1, total: 1 } },
        ],
        7: [
            { code: 'HU401', title: 'Technical and Business Writing', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS426', title: 'Parallel and Distributed Computing', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS426L', title: 'Parallel and Distributed Computing Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS415', title: 'Information Security', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS495', title: 'Final Project – II', credits: { t: 0, l: 2, total: 2 } },
            { code: 'BA356', title: 'University Elective-I (Management)', credits: { t: 3, l: 0, total: 3 } },
            { code: 'MA478', title: 'Graph Theory', credits: { t: 3, l: 0, total: 3 } },
        ],
        8: [
            { code: 'CS434', title: 'Compiler Construction', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS434L', title: 'Compiler Construction Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'HU414', title: 'University Elective-V', credits: { t: 1, l: 0, total: 1 } },
            { code: 'CS406', title: 'CS Elective-V', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS406L', title: 'CS Elective-V Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'BA354', title: 'University Elective-II (Management)', credits: { t: 3, l: 0, total: 3 } },
            { code: 'EN212', title: 'Chinese (Foreign Language)', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS496', title: 'Final Project-III', credits: { t: 0, l: 3, total: 3 } },
        ],
    },
    'Software Engineering': {
        1: [
            { code: 'CS180', title: 'Introduction to Info. & Comm. Technologies', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS180L', title: 'Introduction to ICT Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS111', title: 'Programming Fundamentals', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS111L', title: 'Programming Fundamentals Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'EL100', title: 'Reading and Writing Skills', credits: { t: 3, l: 0, total: 3 } },
            { code: 'MA113', title: 'Pre-calculus', credits: { t: 2, l: 0, total: 2 } },
            { code: 'HU124', title: 'Islamic Studies and Ethics', credits: { t: 2, l: 0, total: 2 } },
            { code: 'MA114', title: 'Foundational Mathematics', credits: { t: 4, l: 0, total: 4 } },
        ],
        2: [
            { code: 'CS112', title: 'Object Oriented Programming', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS112L', title: 'Object Oriented Programming Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'EL200', title: 'Communication & Presentation Skills', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SE100', title: 'Software Engineering', credits: { t: 3, l: 0, total: 3 } },
            { code: 'MA110', title: 'Calculus & Analytical Geometry', credits: { t: 3, l: 0, total: 3 } },
            { code: 'MA216', title: 'Discrete Structures', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU125', title: 'Pakistan Studies & Global Perspectives', credits: { t: 2, l: 0, total: 2 } },
        ],
        3: [
            { code: 'CS214', title: 'Data Structures & Algorithms', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS214L', title: 'Data Structures & Algorithms Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'SE210', title: 'Software Requirement Engineering', credits: { t: 3, l: 0, total: 3 } },
            { code: 'MA301', title: 'Probability and Statistics', credits: { t: 3, l: 0, total: 3 } },
            { code: 'PH109', title: 'Physics', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SE211', title: 'Human Computer Interaction', credits: { t: 3, l: 0, total: 3 } },
        ],
        4: [
            { code: 'SEXXX', title: 'SE Supporting –I (Stochastic Processes)', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS230', title: 'Database Systems', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS230L', title: 'Database Systems Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS225', title: 'Operating System', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS225L', title: 'Operating System Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'SE212', title: 'Software Design & Architecture', credits: { t: 2, l: 0, total: 2 } },
            { code: 'SE212L', title: 'Software Design & Architecture Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA201', title: 'Linear Algebra', credits: { t: 3, l: 0, total: 3 } },
        ],
        5: [
            { code: 'SE313', title: 'Software Construction and Development', credits: { t: 2, l: 0, total: 2 } },
            { code: 'SE313L', title: 'Software Construction and Development Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'SEXXX', title: 'SE Supporting –II (Formal Methods in SE)', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SEXXX', title: 'SE-Elective-I', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SEXXX', title: 'SE-Elective-II', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SE330', title: 'Web Engineering', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU/BAXXX', title: 'University Elective-I', credits: { t: 3, l: 0, total: 3 } },
        ],
        6: [
            { code: 'CS360', title: 'Computer Networks', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS360L', title: 'Computer Networks Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'SE340', title: 'Software Quality Engineering', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SEXXX', title: 'SE-Elective-III', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SEXXX', title: 'SE-Elective-IV', credits: { t: 3, l: 0, total: 3 } },
            { code: 'EL400', title: 'Technical & Business Writing', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SE497', title: 'Final Year Project – I', credits: { t: 0, l: 1, total: 1 } },
        ],
        7: [
            { code: 'SE421', title: 'Software Project Management', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SE301', title: 'Software Re-Engineering', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SEXXX', title: 'SE-Elective-V', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SEXXX', title: 'SE Supporting – III (Business Process Eng.)', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SE498', title: 'Final Year Project – II', credits: { t: 0, l: 2, total: 2 } },
            { code: 'HU/BAXXX', title: 'University Elective-II', credits: { t: 3, l: 0, total: 3 } },
        ],
        8: [
            { code: 'CS270', title: 'Professional Practices', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU414', title: 'Social Services', credits: { t: 1, l: 0, total: 1 } },
            { code: 'CY406', title: 'Information Security', credits: { t: 3, l: 0, total: 3 } },
            { code: 'SE499', title: 'Final Year Project – III', credits: { t: 0, l: 3, total: 3 } },
            { code: 'HUXXX', title: 'University Elective-III (Foreign Language)', credits: { t: 2, l: 0, total: 2 } },
            { code: 'HUXXX', title: 'University Elective – IV', credits: { t: 3, l: 0, total: 3 } },
        ],
    },
    'Cyber Security': {
        1: [
            { code: 'HU119', title: 'English Comprehension and Composition', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CY102', title: 'Introduction to Cyber Security', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU115', title: 'Pakistan Studies', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS180', title: 'Introduction to ICT', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS180L', title: 'Introduction to ICT Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS111', title: 'Programming Fundamentals', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS111L', title: 'Programming Fundamentals Lab', credits: { t: 0, l: 1, total: 1 } },
        ],
        2: [
            { code: 'CYXXX', title: 'Cyber Security Elective I', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CYXXXL', title: 'Cyber Security Elective I Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CY103', title: 'Information Assurance', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS112', title: 'Object Oriented Programming', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS112L', title: 'Object Oriented Programming Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA216', title: 'Discrete Structures', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU120', title: 'Communication & Presentation Skills', credits: { t: 3, l: 0, total: 3 } },
        ],
        3: [
            { code: 'EE223', title: 'Digital Logic Design', credits: { t: 3, l: 0, total: 3 } },
            { code: 'EE223L', title: 'Digital Logic Design Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA201', title: 'Linear Algebra', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS214', title: 'Data Structure & Algorithm', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS214L', title: 'Data Structure & Algorithm Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA110', title: 'Calculus & Analytical Geometry', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS360', title: 'Computer Networks', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS360L', title: 'Computer Networks Lab', credits: { t: 0, l: 1, total: 1 } },
        ],
        4: [
            { code: 'CS225', title: 'Operating Systems', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS225L', title: 'Operating Systems Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS223', title: 'Computer Organization & Assembly Language', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS223L', title: 'Computer Organization & Assembly Language Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CYXXX', title: 'CYS Elective II', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CY222', title: 'Network Security', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CY222L', title: 'Network Security Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS371', title: 'Software Engineering', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS371L', title: 'Software Engineering Lab', credits: { t: 0, l: 1, total: 1 } },
        ],
        5: [
            { code: 'CS332', title: 'Design and analysis of Algorithm', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CY334', title: 'Digital Forensics', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CY334L', title: 'Digital Forensics Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CY250', title: 'Secure Software Development', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CY250L', title: 'Secure Software Development Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CYXXX', title: 'Cyber Security Elective-III', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS230', title: 'Database Systems', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS230L', title: 'Database Systems Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA106', title: 'Differential Equations', credits: { t: 3, l: 0, total: 3 } },
        ],
        6: [
            { code: 'CY355', title: 'Vulnerability Assessment & Reverse Engineering', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CY355L', title: 'Vuln. Assessment & Reverse Eng. Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CS340', title: 'Artificial Intelligence', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CS340L', title: 'Artificial Intelligence Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CYXXX', title: 'Cyber Security Elective IV', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CY206', title: 'Information Security', credits: { t: 3, l: 0, total: 3 } },
            { code: 'CY497', title: 'Final Project-I', credits: { t: 0, l: 1, total: 1 } },
            { code: 'MA301', title: 'Probability and Statistics', credits: { t: 3, l: 0, total: 3 } },
        ],
        7: [
            { code: 'BAXXX', title: 'University Elective I', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU401', title: 'Technical & Business Writing', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS426', title: 'Parallel and Distributed Computing', credits: { t: 2, l: 0, total: 2 } },
            { code: 'CS426L', title: 'Parallel and Distributed Computing Lab', credits: { t: 0, l: 1, total: 1 } },
            { code: 'CY498', title: 'Final Project –II', credits: { t: 0, l: 2, total: 2 } },
            { code: 'BAXXX', title: 'University Elective II', credits: { t: 2, l: 0, total: 2 } },
        ],
        8: [
            { code: 'BAXXX', title: 'University Elective III', credits: { t: 3, l: 0, total: 3 } },
            { code: 'HU414', title: 'Social Service (University Elective V)', credits: { t: 1, l: 0, total: 1 } },
            { code: 'CY499', title: 'Final Project – III', credits: { t: 0, l: 3, total: 3 } },
            { code: 'CS270', title: 'Professional Practices', credits: { t: 3, l: 0, total: 3 } },
            { code: 'BAXXX', title: 'University Elective IV', credits: { t: 3, l: 0, total: 3 } },
        ],
    },
};

// Clear error highlighting from fields
function clearFieldErrors() {
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
}

function renderSubjectGradeInputs() {
    const info = document.getElementById('session-info');
    if (!info) return;
    const dept = info.dataset.dept || '';
    const semCount = parseInt(info.dataset.sem || '0', 10) || 0;

    const container = document.getElementById('subject-grades-container');
    container.innerHTML = '';
    // Render subject-grade inputs for every completed semester (1 .. semCount-1)
    if (semCount <= 1) {
        container.innerHTML = '<p style="color:var(--text-muted)">No previous semesters available for grade entry.</p>';
        return;
    }

    const form = document.createElement('div');
    form.className = 'subject-grade-form';
    let renderedAny = false;

    for (let s = 1; s < semCount; s++) {
        const courses = (departmentCatalog[dept] && departmentCatalog[dept][s]) || [];
        if (!courses.length) continue;
        renderedAny = true;

        const section = document.createElement('div');
        section.className = 'grade-sem-section';
        section.dataset.semester = s;

        const semTitle = document.createElement('div');
        semTitle.innerHTML = `<strong class="semester-title">Semester ${s}</strong>`;
        section.appendChild(semTitle);

        courses.forEach((course, idx) => {
            const group = document.createElement('div');
            group.className = 'input-group';

            const label = document.createElement('label');
            const creditStr = `(${course.credits.t}-${course.credits.l}-${course.credits.total})`;
            label.textContent = `${course.code} — ${course.title} ${creditStr}`;
            label.htmlFor = `grade_${s}_${idx}`;
            group.appendChild(label);

            const select = document.createElement('select');
            select.id = `grade_${s}_${idx}`;
            select.name = `grade_${s}_${idx}`;
            select.required = true;
            select.className = 'grade-input grade-select';
            select.dataset.credits = course.credits.total;
            select.dataset.subject = course.title; // Store subject name for later analysis
            select.dataset.semester = s; // Store semester number

            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Grade';
            select.appendChild(defaultOption);

            // Add grade options
            const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I'];
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = grade;
                select.appendChild(option);
            });

            // Add change event listener for auto-calculation
            select.addEventListener('change', function () {
                calculateSemesterSGPA(s);
            });

            group.appendChild(select);
            section.appendChild(group);
        });

        // Add SGPA display at the end of semester section
        const sgpaDisplay = document.createElement('div');
        sgpaDisplay.className = 'semester-sgpa-display';
        sgpaDisplay.id = `sgpa-display-${s}`;
        sgpaDisplay.innerHTML = `
            <div class="sgpa-label">Semester ${s} SGPA:</div>
            <div class="sgpa-value" id="sgpa-value-${s}">--</div>
        `;
        section.appendChild(sgpaDisplay);

        form.appendChild(section);
    }

    if (!renderedAny) {
        container.innerHTML = '<p style="color:var(--text-muted)">No previous semesters available for grade entry.</p>';
        return;
    }

    container.appendChild(form);
}

// Calculate SGPA for a specific semester based on grades
function calculateSemesterSGPA(semester) {
    const info = document.getElementById('session-info');
    const dept = info.dataset.dept || '';
    const courses = (departmentCatalog[dept] && departmentCatalog[dept][semester]) || [];

    let totalPoints = 0;
    let totalCredits = 0;
    let allGradesEntered = true;

    courses.forEach((course, idx) => {
        const select = document.getElementById(`grade_${semester}_${idx}`);
        if (select && select.value) {
            const grade = select.value;
            const gpa = letterToGpa[grade];

            // Skip 'I' (Incomplete) grades from calculation
            if (gpa !== null) {
                const credits = course.credits.total;
                totalPoints += gpa * credits;
                totalCredits += credits;
            }
        } else {
            allGradesEntered = false;
        }
    });

    const sgpaDisplay = document.getElementById(`sgpa-value-${semester}`);
    if (sgpaDisplay) {
        if (allGradesEntered && totalCredits > 0) {
            const sgpa = (totalPoints / totalCredits).toFixed(2);
            sgpaDisplay.textContent = sgpa;
            sgpaDisplay.style.color = 'var(--accent)';
        } else {
            sgpaDisplay.textContent = '--';
            sgpaDisplay.style.color = 'var(--text-muted)';
        }
    }
}

function renderAttendanceInputs() {
    const info = document.getElementById('session-info');
    if (!info) return;
    const dept = info.dataset.dept || '';
    const semCount = parseInt(info.dataset.sem || '0', 10) || 0;

    const container = document.getElementById('attendance-container');
    container.innerHTML = '';
    if (semCount <= 0) {
        container.innerHTML = '<p style="color:var(--text-muted)">No semesters selected.</p>';
        return;
    }

    const currentSem = semCount;
    const courses = (departmentCatalog[dept] && departmentCatalog[dept][currentSem]) || [];
    if (!courses.length) {
        container.innerHTML = '<p style="color:var(--text-muted)">No subjects configured for the current semester.</p>';
        return;
    }

    const form = document.createElement('div');
    form.className = 'attendance-form';

    const section = document.createElement('div');
    section.className = 'attendance-sem-section';
    const heading = document.createElement('div');
    heading.innerHTML = `<strong class="semester-title">Current Semester (Semester ${currentSem})</strong>`;
    section.appendChild(heading);

    courses.forEach((course, idx) => {
        const group = document.createElement('div');
        group.className = 'input-group attendance-input-group';

        const label = document.createElement('label');
        const creditStr = `(${course.credits.t}-${course.credits.l}-${course.credits.total})`;
        label.textContent = `${course.code} — ${course.title} ${creditStr}`;
        label.htmlFor = `att_${currentSem}_${idx}`;
        group.appendChild(label);

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `att_${currentSem}_${idx}`;
        input.name = `att_${currentSem}_${idx}`;
        input.placeholder = '0-100%';
        input.min = 0;
        input.max = 100;
        input.step = 0.1;
        input.pattern = '[0-9]*\.?[0-9]*';
        input.className = 'attendance-input';
        input.setAttribute('inputmode', 'decimal');
        input.addEventListener('keypress', function (e) {
            // Allow only numbers and one decimal point
            if (!/[0-9.]/.test(e.key)) {
                e.preventDefault();
            }
            // Prevent multiple decimal points
            if (e.key === '.' && this.value.includes('.')) {
                e.preventDefault();
            }
        });
        input.addEventListener('input', function () {
            // Remove any non-numeric characters except decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Enforce 0-100 range
            const numValue = parseFloat(this.value);
            if (!isNaN(numValue)) {
                if (numValue < 0) {
                    this.value = '0';
                } else if (numValue > 100) {
                    this.value = '100';
                }
            }
        });
        input.addEventListener('blur', function () {
            // Final validation on blur
            const numValue = parseFloat(this.value);
            if (!isNaN(numValue)) {
                if (numValue < 0) {
                    this.value = '0';
                } else if (numValue > 100) {
                    this.value = '100';
                }
            }
        });
        inputWrapper.appendChild(input);

        group.appendChild(inputWrapper);
        section.appendChild(group);
    });

    form.appendChild(section);
    container.appendChild(form);
}

function renderMidtermInputs() {
    const info = document.getElementById('session-info');
    if (!info) return;
    const dept = info.dataset.dept || '';
    const semCount = parseInt(info.dataset.sem || '0', 10) || 0;

    const container = document.getElementById('midterm-container');
    container.innerHTML = '';
    if (semCount <= 0) {
        container.innerHTML = '<p style="color:var(--text-muted)">No current semester selected.</p>';
        return;
    }

    const currentSem = semCount; // midterms for current semester
    const courses = (departmentCatalog[dept] && departmentCatalog[dept][currentSem]) || [];
    if (!courses.length) {
        container.innerHTML = '<p style="color:var(--text-muted)">No subjects for current semester.</p>';
        return;
    }

    const form = document.createElement('div');
    form.className = 'midterm-form';

    const heading = document.createElement('div');
    heading.innerHTML = `<strong class="semester-title">Semester ${currentSem} - Midterm Marks</strong>`;
    form.appendChild(heading);

    const section = document.createElement('div');
    section.className = 'midterm-sem-section';

    courses.forEach((course, idx) => {
        const group = document.createElement('div');
        group.className = 'input-group midterm-input-group';

        const label = document.createElement('label');
        const creditStr = `(${course.credits.t}-${course.credits.l}-${course.credits.total})`;
        label.textContent = `${course.code} — ${course.title} ${creditStr}`;
        label.htmlFor = `mid_${currentSem}_${idx}`;
        group.appendChild(label);

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';

        const input = document.createElement('input');
        input.type = 'number';
        input.id = `mid_${currentSem}_${idx}`;
        input.name = `mid_${currentSem}_${idx}`;
        input.placeholder = '0-50';
        input.min = 0;
        input.max = 50;
        input.step = 0.1;
        input.pattern = '[0-9]*\.?[0-9]*';
        input.className = 'midterm-input';
        input.setAttribute('inputmode', 'decimal');
        input.addEventListener('keypress', function (e) {
            // Allow only numbers and one decimal point
            if (!/[0-9.]/.test(e.key)) {
                e.preventDefault();
            }
            // Prevent multiple decimal points
            if (e.key === '.' && this.value.includes('.')) {
                e.preventDefault();
            }
        });
        input.addEventListener('input', function () {
            // Remove any non-numeric characters except decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Enforce 0-50 range
            const numValue = parseFloat(this.value);
            if (!isNaN(numValue)) {
                if (numValue < 0) {
                    this.value = '0';
                } else if (numValue > 50) {
                    this.value = '50';
                }
            }
        });
        input.addEventListener('blur', function () {
            // Final validation on blur
            const numValue = parseFloat(this.value);
            if (!isNaN(numValue)) {
                if (numValue < 0) {
                    this.value = '0';
                } else if (numValue > 50) {
                    this.value = '50';
                }
            }
        });
        inputWrapper.appendChild(input);

        group.appendChild(inputWrapper);
        section.appendChild(group);
    });

    form.appendChild(section);

    container.appendChild(form);
}

function validateAttendanceForSubmission() {
    const info = document.getElementById('session-info');
    const dept = info.dataset.dept || '';
    const semCount = parseInt(info.dataset.sem || '0', 10) || 0;
    if (semCount <= 0) return { valid: true, attendance: null };

    const currentSem = semCount;
    const subjects = (departmentCatalog[dept] && departmentCatalog[dept][currentSem]) || [];
    if (!subjects.length) return { valid: true, attendance: null };

    const attendance = {};
    const semAtt = {};
    let hasError = false;
    for (let idx = 0; idx < subjects.length; idx++) {
        const el = document.getElementById(`att_${currentSem}_${idx}`);
        if (!el) {
            hasError = true;
            continue;
        }
        const val = el.value.trim();
        if (!val) {
            el.classList.add('error-field');
            hasError = true;
        } else {
            const num = parseFloat(val);
            if (isNaN(num) || num < 0 || num > 100) {
                el.classList.add('error-field');
                hasError = true;
            } else {
                el.classList.remove('error-field');
                semAtt[`${subjects[idx].code} ${subjects[idx].title}`] = num;
            }
        }
    }
    if (hasError) return { valid: false, message: 'Please enter all attendance values (0-100).' };
    attendance[currentSem] = semAtt;
    return { valid: true, attendance: attendance };
}

function validateMidtermForSubmission() {
    const info = document.getElementById('session-info');
    const dept = info.dataset.dept || '';
    const semCount = parseInt(info.dataset.sem || '0', 10) || 0;
    if (semCount <= 0) return { valid: true, midterm: null };

    const currentSem = semCount;
    const subjects = (departmentCatalog[dept] && departmentCatalog[dept][currentSem]) || [];
    if (!subjects.length) return { valid: true, midterm: null };

    const midterm = {};
    const semMid = {};
    let hasError = false;
    for (let idx = 0; idx < subjects.length; idx++) {
        const el = document.getElementById(`mid_${currentSem}_${idx}`);
        if (!el) {
            hasError = true;
            continue;
        }
        const val = el.value.trim();
        if (!val) {
            el.classList.add('error-field');
            hasError = true;
        } else {
            const num = parseFloat(val);
            if (isNaN(num) || num < 0 || num > 50) {
                el.classList.add('error-field');
                hasError = true;
            } else {
                el.classList.remove('error-field');
                semMid[`${subjects[idx].code} ${subjects[idx].title}`] = num;
            }
        }
    }
    if (hasError) return { valid: false, message: 'Please enter all midterm marks (0-50).' };
    midterm[currentSem] = semMid;
    return { valid: true, midterm: { semester: currentSem, marks: semMid } };
}

function validateGradesForSubmission() {
    const info = document.getElementById('session-info');
    const dept = info.dataset.dept || '';
    const semCount = parseInt(info.dataset.sem || '0', 10) || 0;
    if (semCount <= 1) return { valid: true, grades: null };
    const gradePattern = /^(A-?|B[+-]?|C[+-]?|D|F|I)$/i;
    const allGrades = {};
    let hasError = false;

    for (let s = 1; s < semCount; s++) {
        const subjects = (departmentCatalog[dept] && departmentCatalog[dept][s]) || [];
        if (!subjects.length) continue;
        const semGrades = {};
        for (let idx = 0; idx < subjects.length; idx++) {
            const el = document.getElementById(`grade_${s}_${idx}`);
            if (!el) {
                hasError = true;
                continue;
            }
            const val = (el.value || '').trim();
            if (!val) {
                el.classList.add('error-field');
                hasError = true;
            } else if (!gradePattern.test(val)) {
                el.classList.add('error-field');
                hasError = true;
            } else {
                el.classList.remove('error-field');
                semGrades[`${subjects[idx].code} ${subjects[idx].title}`] = val.toUpperCase();
            }
        }
        if (Object.keys(semGrades).length > 0) allGrades[s] = semGrades;
    }

    if (hasError) return { valid: false, message: 'Please enter all subject grades. Do not leave any field blank.' };
    return { valid: true, grades: allGrades };
}

function applyStudentInfo() {
    const info = document.getElementById('session-info');
    if (!info) return;
    const name = info.dataset.name || '';
    const semCount = parseInt(info.dataset.sem || '0', 10) || 0;
    const dept = info.dataset.dept || '';

    // Display student name and department if provided
    const display = document.getElementById('student-display');
    if (display) {
        if (name || dept) {
            display.textContent = (name ? name : '') + (dept ? (name ? ' — ' : '') + dept : '');
        } else {
            display.textContent = '';
        }
    }

    // Show only the inputs up to the provided semester count - 1 (completed semesters)
    if (semCount > 0 && semCount <= 8) {
        for (let i = 1; i <= 8; i++) {
            const el = document.getElementById(`sem${i}`);
            if (!el) continue;
            const group = el.closest('.input-group');
            if (i < semCount) {
                if (group) group.style.display = 'block';
            } else {
                if (group) group.style.display = 'none';
                el.value = '';
            }
        }
    }
    // Render grade inputs for the visible/completed semesters
    renderSubjectGradeInputs();
    // Render attendance and midterm inputs
    renderAttendanceInputs();
    renderMidtermInputs();
}

function computeSGPAForSemester(semNumber, dept) {
    const courses = (departmentCatalog[dept] && departmentCatalog[dept][semNumber]) || [];
    if (!courses.length) return null;
    let totalWeighted = 0;
    let totalCredits = 0;
    for (let idx = 0; idx < courses.length; idx++) {
        const el = document.getElementById(`grade_${semNumber}_${idx}`);
        if (!el) return null;
        const val = (el.value || '').trim().toUpperCase();
        if (!val) return null;
        const gpa = letterToGpa[val];
        const credits = courses[idx].credits.total;
        if (gpa === null) {
            // Incomplete: exclude from SGPA calculation
            continue;
        }
        if (typeof gpa !== 'number') return null;
        totalWeighted += gpa * credits;
        totalCredits += credits;
    }
    if (totalCredits <= 0) return null;
    const sgpa = totalWeighted / totalCredits;
    return Math.max(0, Math.min(4, sgpa));
}

function setupEventListeners() {
    document.getElementById('predict-btn').addEventListener('click', predictGrade);
    document.getElementById('reset-btn').addEventListener('click', resetForm);
}

function loadMetrics() {
    fetch('/api/metrics')
        .then(response => response.json())
        .then(data => {
            document.getElementById('r2-value').textContent = data.r2;
            document.getElementById('rmse-value').textContent = data.rmse;
            document.getElementById('mae-value').textContent = data.mae;
            document.getElementById('samples-value').textContent = data.test_samples;

            // Animate metric progress bars
            const r2p = Math.max(0, Math.min(1, Number(data.r2))) * 100; // 0-100%
            const rmsep = Math.max(0, Math.min(1, (20 - Number(data.rmse)) / 20)) * 100; // inverse, 0..20 scale
            const maep = Math.max(0, Math.min(1, (20 - Number(data.mae)) / 20)) * 100; // inverse, 0..20 scale
            const r2Bar = document.getElementById('r2-bar');
            const rmseBar = document.getElementById('rmse-bar');
            const maeBar = document.getElementById('mae-bar');
            if (r2Bar) r2Bar.style.width = r2p.toFixed(0) + '%';
            if (rmseBar) rmseBar.style.width = rmsep.toFixed(0) + '%';
            if (maeBar) maeBar.style.width = maep.toFixed(0) + '%';
        })
        .catch(error => {
            console.error('Error loading metrics:', error);
            showError('Failed to load model metrics');
        });
}

function predictGrade() {
    // Clear previous messages
    hideMessages();

    // Get auto-calculated SGPAs from grade entries
    const info = document.getElementById('session-info');
    const dept = info ? (info.dataset.dept || '') : '';
    const semCount = info ? (parseInt(info.dataset.sem || '0', 10) || 0) : 0;

    const semesters = [];
    // Collect SGPAs from auto-calculated values
    for (let i = 1; i < semCount; i++) {
        const sgpaElement = document.getElementById(`sgpa-value-${i}`);
        if (sgpaElement && sgpaElement.textContent !== '--') {
            const sgpaValue = parseFloat(sgpaElement.textContent);
            if (!isNaN(sgpaValue)) {
                semesters.push({ semester: i, sgpa: sgpaValue });
            }
        }
    }

    // Special handling for first semester students
    const isFirstSemester = semCount === 1 || semesters.length === 0;

    if (isFirstSemester) {
        // For first semester, only validate attendance and midterm
        const attValidation = validateAttendanceForSubmission();
        const midValidation = validateMidtermForSubmission();

        if (!attValidation.valid || !midValidation.valid) {
            showError('Please enter attendance and midterm marks to get an estimated prediction.');
            return;
        }

        // Calculate expected performance for first semester based on attendance and midterm
        handleFirstSemesterPrediction(attValidation.attendance, midValidation.midterm);
        return;
    }

    // Validate at least 1 semester is entered for regular students
    if (semesters.length === 0) {
        showError('Please enter grades for at least one semester to calculate SGPA and predict performance.');
        return;
    }

    // Validate all entered values are valid numbers between 0-4
    if (!semesters.every(s => !isNaN(s.sgpa) && s.sgpa >= 0 && s.sgpa <= 4)) {
        showError('Invalid SGPA values detected. Please check your grade entries.');
        return;
    }

    // Disable button during request
    const predictBtn = document.getElementById('predict-btn');
    predictBtn.disabled = true;
    predictBtn.textContent = 'Predicting...';

    // Clear previous field errors
    clearFieldErrors();

    // Validate subject grades if required and attach to payload
    const gradeValidation = validateGradesForSubmission();
    if (!gradeValidation.valid) {
        showError(gradeValidation.message || 'Please check subject grades.');
        predictBtn.disabled = false;
        predictBtn.textContent = 'Predict Grade';
        return;
    }

    // Validate attendance
    const attValidation = validateAttendanceForSubmission();
    if (!attValidation.valid) {
        showError(attValidation.message || 'Please check attendance values.');
        predictBtn.disabled = false;
        predictBtn.textContent = 'Predict Grade';
        return;
    }

    // Validate midterm
    const midValidation = validateMidtermForSubmission();
    if (!midValidation.valid) {
        showError(midValidation.message || 'Please check midterm marks.');
        predictBtn.disabled = false;
        predictBtn.textContent = 'Predict Grade';
        return;
    }

    const sessionInfo = document.getElementById('session-info');
    const studentName = sessionInfo ? sessionInfo.dataset.name || '' : '';
    const department = sessionInfo ? sessionInfo.dataset.dept || '' : '';

    const payload = { semesters: semesters, student_name: studentName, department: department };
    if (gradeValidation.grades) payload.subject_grades = gradeValidation.grades;
    if (attValidation.attendance) payload.attendance = attValidation.attendance;
    if (midValidation.midterm) payload.midterm = midValidation.midterm;

    // Send prediction request
    fetch('/api/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
            } else {
                displayResults(data);
                showSuccess('Prediction completed successfully!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Prediction failed. Please try again.');
        })
        .finally(() => {
            predictBtn.disabled = false;
            predictBtn.textContent = 'Predict Grade';
        });
}

function displayResults(data) {
    // Show results section
    document.getElementById('results-section').style.display = 'block';

    // Current average
    const currAvg = Number(data.current_average || 0);
    document.getElementById('current-avg').textContent = `${currAvg.toFixed(2)} / 4.0`;

    // Trend
    document.getElementById('trend').textContent = data.trend;

    // Grade counts rendered as cards in a grid
    const gradeCountsGrid = document.getElementById('grade-counts-grid');
    if (data.grade_counts) {
        const order = ['A', 'B', 'C', 'D', 'E', 'F'];
        const cards = order.map(l => {
            const c = data.grade_counts[l] || 0;
            if (c <= 0) return '';
            return `
                <div class="grade-count-card">
                    <div class="grade-count-letter">${l}</div>
                    <div class="grade-count-number">${c} ${c > 1 ? 'grades' : 'grade'}</div>
                </div>
            `;
        }).filter(Boolean);
        gradeCountsGrid.innerHTML = cards.length ? cards.join('\n') : '--';
    } else {
        gradeCountsGrid.innerHTML = '--';
    }

    // Predictions grid
    const predictionsGrid = document.getElementById('predictions-grid');
    if (data.predictions && data.predictions.length > 0) {
        const predsSorted = data.predictions.slice().sort((a, b) => a.semester - b.semester);
        predictionsGrid.innerHTML = predsSorted
            .map(p => `
                <div class="prediction-card">
                        <div class="prediction-semester">Semester ${p.semester}</div>
                        <div class="prediction-value">${Number(p.predicted_sgpa).toFixed(2)} / 4.0</div>
                </div>
            `)
            .join('');

        // Render sparkline bars for predicted SGPAs
        const spark = document.getElementById('predictions-sparkline');
        if (spark) {
            spark.innerHTML = predsSorted.map(p => {
                const pct = Math.max(0, Math.min(100, (Number(p.predicted_sgpa) / 4) * 100));
                return `<div class="sparkline-bar" style="height:${pct}%" title="Sem ${p.semester}: ${Number(p.predicted_sgpa).toFixed(2)}"></div>`;
            }).join('');
        }

        // Render performance graph
        renderPerformanceGraph(data);
    } else {
        predictionsGrid.textContent = 'No predictions available';
        const spark = document.getElementById('predictions-sparkline');
        if (spark) spark.innerHTML = '';
    }

    // Risk assessment
    const riskBadge = document.getElementById('risk-assessment');
    riskBadge.textContent = data.risk;
    riskBadge.className = 'result-value risk-badge';

    if (data.risk.includes('EXCELLENT')) {
        riskBadge.classList.add('excellent');
    } else if (data.risk.includes('GOOD')) {
        riskBadge.classList.add('good');
    } else if (data.risk.includes('FAIR')) {
        riskBadge.classList.add('fair');
    } else if (data.risk.includes('BELOW')) {
        riskBadge.classList.add('below');
    } else {
        riskBadge.classList.add('poor');
    }

    // Insight
    document.getElementById('insight-text').textContent = data.insight;

    // Warning below recommendation
    const warningMsgBottom = document.getElementById('warning-message-bottom');
    const warningTextBottom = document.getElementById('warning-text-bottom');
    let showWarning = false;
    if (data.semesters && data.semesters.some(s => s.sgpa < 2.4)) showWarning = true;
    if (data.subject_grades) {
        for (let sem in data.subject_grades) {
            for (let subj in data.subject_grades[sem]) {
                if (data.subject_grades[sem][subj].toUpperCase() === 'F') {
                    showWarning = true;
                    break;
                }
            }
            if (showWarning) break;
        }
    }
    if (showWarning) {
        warningMsgBottom.style.display = 'flex';
        warningTextBottom.textContent = 'You need to work harder to improve your academic performance.';
    } else {
        warningMsgBottom.style.display = 'none';
    }

    // Features
    const featuresList = document.getElementById('features-list');
    if (data.features && data.features.length > 0) {
        featuresList.innerHTML = data.features
            .map(f => `• ${f.name}: ${f.coef}`)
            .join('\n');
    } else {
        featuresList.textContent = 'Performance analysis based on historical data';
    }

    // Generate subject-specific predictions
    generateSubjectPredictions(data);

    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// SUBJECT-SPECIFIC PREDICTIONS
// ========================================

function generateSubjectPredictions(data) {
    // Collect all subject grades from entered data
    const subjectGrades = {};
    const gradeValues = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };

    // Extract grades from all semesters
    document.querySelectorAll('.grade-select').forEach(select => {
        if (select.value && select.value !== '') {
            const semester = parseInt(select.dataset.semester) || 1;
            const subjectName = select.dataset.subject || 'Unknown Subject';
            const grade = select.value;
            const gradeValue = gradeValues[grade] || 0;

            if (!subjectGrades[subjectName]) {
                subjectGrades[subjectName] = {
                    name: subjectName,
                    grades: [],
                    average: 0,
                    trend: 'stable',
                    credits: parseFloat(select.dataset.credits) || 3
                };
            }

            subjectGrades[subjectName].grades.push({
                semester: semester,
                grade: grade,
                value: gradeValue
            });
        }
    });

    // Calculate statistics for each subject
    const subjectAnalysis = [];
    for (const subjectName in subjectGrades) {
        const subject = subjectGrades[subjectName];
        const grades = subject.grades.sort((a, b) => a.semester - b.semester);
        const values = grades.map(g => g.value);

        // Calculate average
        subject.average = values.reduce((a, b) => a + b, 0) / values.length;

        // Determine trend
        if (values.length > 1) {
            const firstHalf = values.slice(0, Math.ceil(values.length / 2));
            const secondHalf = values.slice(Math.ceil(values.length / 2));
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

            if (secondAvg > firstAvg + 0.3) {
                subject.trend = 'improving';
            } else if (secondAvg < firstAvg - 0.3) {
                subject.trend = 'declining';
            } else {
                subject.trend = 'stable';
            }
        }

        // Predict next grade based on trend and average
        let predictedGrade = subject.average;
        if (subject.trend === 'improving') {
            predictedGrade = Math.min(4.0, subject.average + 0.2);
        } else if (subject.trend === 'declining') {
            predictedGrade = Math.max(0, subject.average - 0.2);
        }

        // Calculate variance (consistency)
        const variance = values.length > 1
            ? values.reduce((sum, val) => sum + Math.pow(val - subject.average, 2), 0) / values.length
            : 0;
        const consistency = Math.max(0, 100 - (variance * 50));

        // Risk assessment
        let risk = 'low';
        let riskLabel = 'Low Risk';
        if (subject.average < 2.0) {
            risk = 'critical';
            riskLabel = 'Critical';
        } else if (subject.average < 2.5) {
            risk = 'high';
            riskLabel = 'High Risk';
        } else if (subject.average < 3.0) {
            risk = 'moderate';
            riskLabel = 'Moderate';
        }

        subjectAnalysis.push({
            name: subjectName,
            average: subject.average,
            trend: subject.trend,
            predictedGrade: predictedGrade,
            risk: risk,
            riskLabel: riskLabel,
            consistency: consistency,
            lastGrade: grades[grades.length - 1]?.grade || 'N/A',
            gradesCount: grades.length
        });
    }

    // Sort by average (ascending for weak subjects first)
    subjectAnalysis.sort((a, b) => a.average - b.average);

    if (subjectAnalysis.length === 0) {
        // No subject data available
        document.getElementById('subject-predictions-section').style.display = 'none';
        return;
    }

    // Display subject predictions
    document.getElementById('subject-predictions-section').style.display = 'block';

    // Generate overview cards
    displaySubjectOverview(subjectAnalysis);

    // Identify subjects needing attention (average < 3.0)
    const weakSubjects = subjectAnalysis.filter(s => s.average < 3.0);
    if (weakSubjects.length > 0) {
        displayAttentionSubjects(weakSubjects);
    }

    // Identify strong subjects (average >= 3.5)
    const strongSubjects = subjectAnalysis.filter(s => s.average >= 3.5);
    if (strongSubjects.length > 0) {
        displayStrongSubjects(strongSubjects);
    }

    // Render comparison chart
    renderSubjectComparisonChart(subjectAnalysis);
}

function displaySubjectOverview(subjects) {
    const container = document.getElementById('subject-overview-cards');

    container.innerHTML = subjects.map(subject => {
        const trendIcon = subject.trend === 'improving' ? '📈' :
            subject.trend === 'declining' ? '📉' : '➡️';
        const trendColor = subject.trend === 'improving' ? '#00FF7F' :
            subject.trend === 'declining' ? '#FF6347' : '#00BFFF';

        return `
            <div class="subject-prediction-card ${subject.risk}">
                <div class="subject-card-header">
                    <h4 class="subject-card-title">${subject.name}</h4>
                    <span class="subject-risk-badge ${subject.risk}">${subject.riskLabel}</span>
                </div>
                <div class="subject-card-body">
                    <div class="subject-stat">
                        <span class="subject-stat-label">Current Average</span>
                        <span class="subject-stat-value">${subject.average.toFixed(2)}</span>
                    </div>
                    <div class="subject-stat">
                        <span class="subject-stat-label">Last Grade</span>
                        <span class="subject-stat-value">${subject.lastGrade}</span>
                    </div>
                    <div class="subject-stat">
                        <span class="subject-stat-label">Predicted Next</span>
                        <span class="subject-stat-value predicted">${subject.predictedGrade.toFixed(2)}</span>
                    </div>
                    <div class="subject-stat">
                        <span class="subject-stat-label">Trend</span>
                        <span class="subject-stat-value" style="color: ${trendColor}">
                            ${trendIcon} ${subject.trend.charAt(0).toUpperCase() + subject.trend.slice(1)}
                        </span>
                    </div>
                    <div class="subject-stat">
                        <span class="subject-stat-label">Consistency</span>
                        <span class="subject-stat-value">${subject.consistency.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayAttentionSubjects(weakSubjects) {
    const section = document.getElementById('attention-section');
    const container = document.getElementById('attention-subjects-grid');

    section.style.display = 'block';

    container.innerHTML = weakSubjects.map(subject => {
        let recommendation = '';
        if (subject.average < 2.0) {
            recommendation = 'Urgent: Seek tutoring immediately. Meet with professor during office hours.';
        } else if (subject.average < 2.5) {
            recommendation = 'Critical: Dedicate extra study hours. Form study group with peers.';
        } else {
            recommendation = 'Important: Increase focus on this subject. Review weak topics regularly.';
        }

        return `
            <div class="attention-subject-card">
                <div class="attention-icon">⚠️</div>
                <div class="attention-content">
                    <h4 class="attention-subject-name">${subject.name}</h4>
                    <div class="attention-stats">
                        <span class="attention-avg">Average: ${subject.average.toFixed(2)}/4.0</span>
                        <span class="attention-trend ${subject.trend}">${subject.trend}</span>
                    </div>
                    <p class="attention-recommendation">${recommendation}</p>
                    <div class="attention-actions">
                        <span class="action-tip">💡 Tip: Practice more problems, watch tutorial videos, and clarify doubts immediately.</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayStrongSubjects(strongSubjects) {
    const section = document.getElementById('strong-section');
    const container = document.getElementById('strong-subjects-grid');

    section.style.display = 'block';

    container.innerHTML = strongSubjects.map(subject => `
        <div class="strong-subject-card">
            <div class="strong-icon">🌟</div>
            <div class="strong-content">
                <h4 class="strong-subject-name">${subject.name}</h4>
                <div class="strong-stats">
                    <span class="strong-avg">Average: ${subject.average.toFixed(2)}/4.0</span>
                    <span class="strong-consistency">Consistency: ${subject.consistency.toFixed(0)}%</span>
                </div>
                <p class="strong-message">Excellent work! Maintain this level and consider helping peers.</p>
            </div>
        </div>
    `).join('');
}

let subjectComparisonChart = null;

function renderSubjectComparisonChart(subjects) {
    const canvas = document.getElementById('subject-comparison-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (subjectComparisonChart) {
        subjectComparisonChart.destroy();
    }

    const labels = subjects.map(s => s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name);
    const averages = subjects.map(s => s.average);
    const predicted = subjects.map(s => s.predictedGrade);

    // Color coding based on risk
    const backgroundColors = subjects.map(s => {
        if (s.risk === 'critical') return 'rgba(255, 71, 87, 0.7)';
        if (s.risk === 'high') return 'rgba(255, 165, 2, 0.7)';
        if (s.risk === 'moderate') return 'rgba(0, 191, 255, 0.7)';
        return 'rgba(0, 255, 127, 0.7)';
    });

    const borderColors = subjects.map(s => {
        if (s.risk === 'critical') return '#FF4757';
        if (s.risk === 'high') return '#FFA502';
        if (s.risk === 'moderate') return '#00BFFF';
        return '#00FF7F';
    });

    subjectComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Current Average',
                    data: averages,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                },
                {
                    label: 'Predicted Next Grade',
                    data: predicted,
                    backgroundColor: 'rgba(255, 215, 0, 0.3)',
                    borderColor: '#FFD700',
                    borderWidth: 2,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 13,
                            weight: '600'
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                    titleColor: '#FFD700',
                    bodyColor: '#ffffff',
                    borderColor: '#FFD700',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        afterLabel: function (context) {
                            const index = context.dataIndex;
                            const subject = subjects[index];
                            return `Trend: ${subject.trend}\nRisk: ${subject.riskLabel}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#d4d4d4',
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    min: 0,
                    max: 4,
                    grid: {
                        color: 'rgba(255, 215, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#FFD700',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        stepSize: 0.5
                    },
                    title: {
                        display: true,
                        text: 'Grade Point Average',
                        color: '#FFD700',
                        font: {
                            size: 14,
                            weight: '700'
                        }
                    }
                }
            }
        }
    });
}

// Handle first semester prediction based on attendance and midterm
function handleFirstSemesterPrediction(attendance, midterm) {
    // Calculate estimated SGPA based on attendance and midterm
    // Midterm is more heavily weighted (70%) than attendance (30%)
    const midtermContribution = (midterm / 50) * 4.0 * 0.7; // Midterm out of 50, weighted 70%
    const attendanceContribution = (attendance / 100) * 4.0 * 0.3; // Attendance percentage, weighted 30%

    const estimatedSGPA = Math.min(4.0, Math.max(0, midtermContribution + attendanceContribution));

    // Determine pass/fail probability
    const passThreshold = 2.0;
    let passProbability = 0;

    if (estimatedSGPA >= 3.5) {
        passProbability = 95;
    } else if (estimatedSGPA >= 3.0) {
        passProbability = 85;
    } else if (estimatedSGPA >= 2.5) {
        passProbability = 70;
    } else if (estimatedSGPA >= 2.0) {
        passProbability = 55;
    } else {
        passProbability = 30;
    }

    // Show results section
    document.getElementById('results-section').style.display = 'block';

    // Display estimated SGPA
    document.getElementById('current-avg').textContent = `${estimatedSGPA.toFixed(2)} / 4.0 (Estimated)`;

    // Trend
    document.getElementById('trend').textContent = 'First Semester - No historical data';

    // Grade counts - not applicable for first semester
    const gradeCountsGrid = document.getElementById('grade-counts-grid');
    gradeCountsGrid.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Not available for first semester</p>';

    // Hide performance graph for first semester
    const performanceGraphContainer = document.getElementById('performance-graph');
    if (performanceGraphContainer) {
        performanceGraphContainer.style.display = 'none';
    }

    // Predictions - show estimated for remaining semesters
    const predictionsGrid = document.getElementById('predictions-grid');
    const remainingSemesters = [2, 3, 4, 5, 6, 7, 8];
    const predictionsHTML = remainingSemesters.map(sem => {
        // Slight variation in predictions based on current estimate
        const variation = (Math.random() - 0.5) * 0.2;
        const predicted = Math.min(4.0, Math.max(0, estimatedSGPA + variation));
        return `
            <div class="prediction-item">
                <span class="prediction-label">Semester ${sem}</span>
                <span class="prediction-value">${predicted.toFixed(2)}</span>
            </div>
        `;
    }).join('');
    predictionsGrid.innerHTML = predictionsHTML;

    // Risk assessment
    const riskBadge = document.getElementById('risk-assessment');
    if (estimatedSGPA >= 3.0) {
        riskBadge.textContent = 'Low Risk';
        riskBadge.className = 'result-value risk-badge risk-low';
    } else if (estimatedSGPA >= 2.5) {
        riskBadge.textContent = 'Moderate Risk';
        riskBadge.className = 'result-value risk-badge risk-moderate';
    } else {
        riskBadge.textContent = 'High Risk';
        riskBadge.className = 'result-value risk-badge risk-high';
    }

    // Recommendation
    const insight = document.getElementById('insight-text');
    let recommendation = '';
    if (midterm >= 40) {
        recommendation = `Excellent midterm performance (${midterm}/50)! `;
    } else if (midterm >= 30) {
        recommendation = `Good midterm score (${midterm}/50). `;
    } else {
        recommendation = `Your midterm score (${midterm}/50) needs improvement. `;
    }

    if (attendance >= 85) {
        recommendation += `Your attendance (${attendance}%) is excellent. Keep it up!`;
    } else if (attendance >= 75) {
        recommendation += `Maintain your attendance (${attendance}%) above 75%.`;
    } else {
        recommendation += `Improve your attendance (${attendance}%) to at least 75%.`;
    }

    insight.textContent = recommendation;

    // Warning message with first semester disclaimer
    const warningMsgBottom = document.getElementById('warning-message-bottom');
    const warningTextBottom = document.getElementById('warning-text-bottom');
    warningMsgBottom.style.display = 'flex';
    warningTextBottom.innerHTML = `
        <strong>⚠️ First Semester Note:</strong><br>
        This prediction is based on your current midterm marks (${midterm}/50) and attendance (${attendance}%). 
        Since you are in your first semester, this estimate is <strong>less accurate</strong> than predictions 
        for students with completed semester history. Your actual performance may vary. Focus on maintaining 
        good attendance and exam scores for better results.
    `;
    warningTextBottom.style.color = '#FFA502';

    // Features
    const featuresList = document.getElementById('features-list');
    featuresList.innerHTML = `
        • Midterm Marks: ${midterm}/50 (70% weight in estimation)<br>
        • Attendance: ${attendance}% (30% weight in estimation)<br>
        • Pass Probability: ~${passProbability}%<br>
        • Estimated SGPA: ${estimatedSGPA.toFixed(2)}/4.0
    `;

    // Show success message
    showSuccess('First semester estimation completed! Note: Predictions will be more accurate after completing at least one semester.');

    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Show What-If and Recommendations sections for first semester too
    document.getElementById('whatif-section').style.display = 'block';
    document.getElementById('recommendations-section').style.display = 'block';

    // Generate recommendations for first semester
    const firstSemesterRecommendations = generateFirstSemesterRecommendations(attendance, midterm, estimatedSGPA);
    displayRecommendations(firstSemesterRecommendations);

    // Set default values in What-If
    document.getElementById('whatif-attendance').value = attendance;
    document.getElementById('whatif-attendance-value').textContent = attendance + '%';
    document.getElementById('whatif-midterm').value = midterm;
    document.getElementById('whatif-midterm-value').textContent = midterm + '/50';

    // Store for what-if analysis
    currentPredictionData = { currentAvg: estimatedSGPA };
}

// Generate recommendations specifically for first semester students
function generateFirstSemesterRecommendations(attendance, midterm, estimatedSGPA) {
    const recommendations = [];

    // Critical recommendation for low performers
    if (estimatedSGPA < 2.0) {
        recommendations.push({
            icon: '🚨',
            title: 'Critical: Immediate Action Required',
            priority: 'critical',
            description: `Your estimated SGPA of ${estimatedSGPA.toFixed(2)} is below passing threshold. This requires immediate attention.`,
            actionable: 'Meet with your academic advisor immediately, attend all classes, seek tutoring help, and form study groups.'
        });
    }

    // Midterm performance recommendation
    if (midterm < 25) {
        recommendations.push({
            icon: '📝',
            title: 'Focus on Exam Preparation',
            priority: 'high',
            description: `Your midterm score of ${midterm}/50 indicates you need stronger exam strategies.`,
            actionable: 'Start preparing for finals now. Review class notes daily, practice past papers, join study groups, and clarify doubts with instructors during office hours.'
        });
    } else if (midterm < 35) {
        recommendations.push({
            icon: '📚',
            title: 'Strengthen Your Exam Skills',
            priority: 'medium',
            description: `Midterm score of ${midterm}/50 is decent but has room for improvement.`,
            actionable: 'Practice more problems, focus on weak topics, and time yourself during practice sessions to improve speed and accuracy.'
        });
    } else {
        recommendations.push({
            icon: '🌟',
            title: 'Excellent Exam Performance!',
            priority: 'low',
            description: `Great midterm score of ${midterm}/50! You\'re on the right track.`,
            actionable: 'Maintain your study routine and help classmates who are struggling. Teaching others reinforces your own understanding.'
        });
    }

    // Attendance recommendation
    if (attendance < 70) {
        recommendations.push({
            icon: '⚠️',
            title: 'Critical Attendance Issue',
            priority: 'critical',
            description: `Your ${attendance}% attendance is critically low and may affect your eligibility.`,
            actionable: 'Attend all remaining classes without exception. Set multiple alarms, find a study buddy for accountability, and communicate with professors about any genuine issues.'
        });
    } else if (attendance < 85) {
        recommendations.push({
            icon: '📅',
            title: 'Improve Class Attendance',
            priority: 'high',
            description: `Attendance at ${attendance}% should be improved to 85%+ for better learning outcomes.`,
            actionable: 'Make attending classes a top priority. Missing classes means missing important information that may not be in textbooks.'
        });
    } else {
        recommendations.push({
            icon: '✅',
            title: 'Great Attendance!',
            priority: 'low',
            description: `Excellent attendance of ${attendance}%! Regular class participation is key to success.`,
            actionable: 'Keep it up! Your consistent attendance gives you an advantage in understanding course material.'
        });
    }

    // First semester specific advice
    recommendations.push({
        icon: '🎓',
        title: 'First Semester Success Tips',
        priority: 'medium',
        description: 'As a first-semester student, building good habits now will set the foundation for your entire academic career.',
        actionable: 'Create a study schedule, identify your learning style, build relationships with professors, join academic clubs, and don\'t hesitate to ask for help when needed.'
    });

    // Time management
    recommendations.push({
        icon: '⏰',
        title: 'Master Time Management',
        priority: 'medium',
        description: 'Effective time management is crucial for first semester success.',
        actionable: 'Use a planner or digital calendar, break large assignments into smaller tasks, avoid procrastination, and balance study time across all subjects.'
    });

    return recommendations;
}

// Global variable to store chart instance
let performanceChartInstance = null;

// Render performance graph using Chart.js
function renderPerformanceGraph(data) {
    const canvas = document.getElementById('performance-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (performanceChartInstance) {
        performanceChartInstance.destroy();
    }

    // Prepare data: combine actual semesters with predictions
    const actualSemesters = data.semesters || [];
    const predictions = data.predictions || [];

    // Sort by semester number
    const sortedActual = actualSemesters.slice().sort((a, b) => a.semester - b.semester);
    const sortedPredictions = predictions.slice().sort((a, b) => a.semester - b.semester);

    // Create labels and datasets
    const allSemesters = [...sortedActual, ...sortedPredictions];
    const labels = allSemesters.map(s => `Sem ${s.semester}`);

    const actualData = sortedActual.map(s => s.sgpa);
    const predictedData = sortedPredictions.map(s => s.predicted_sgpa);

    // Fill gaps with null for actual data
    const actualDataFull = allSemesters.map(s => {
        const found = sortedActual.find(a => a.semester === s.semester);
        return found ? found.sgpa : null;
    });

    const predictedDataFull = allSemesters.map(s => {
        const found = sortedPredictions.find(p => p.semester === s.semester);
        return found ? found.predicted_sgpa : null;
    });

    // Create chart
    performanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual SGPA',
                    data: actualDataFull,
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#FFD700',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0,
                    fill: true,
                    cubicInterpolationMode: 'monotone'
                },
                {
                    label: 'Predicted SGPA',
                    data: predictedDataFull,
                    borderColor: '#00FF7F',
                    backgroundColor: 'rgba(0, 255, 127, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#00FF7F',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0,
                    fill: true,
                    cubicInterpolationMode: 'monotone'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: 'Academic Performance Trend',
                    color: '#FFD700',
                    font: {
                        size: 18,
                        weight: '700'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 30, 30, 0.9)',
                    titleColor: '#FFD700',
                    bodyColor: '#ffffff',
                    borderColor: '#FFD700',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} / 4.0`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4.0,
                    ticks: {
                        color: '#d4d4d4',
                        font: {
                            size: 12
                        },
                        stepSize: 0.5
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'SGPA (0-4.0)',
                        color: '#FFD700',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#d4d4d4',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Semester',
                        color: '#FFD700',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function resetForm() {
    // Reset all semester inputs
    for (let i = 1; i <= 8; i++) {
        document.getElementById(`sem${i}`).value = '';
    }

    // Hide results and messages
    document.getElementById('results-section').style.display = 'none';
    hideMessages();
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => hideError(), 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => hideSuccess(), 3000);
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

function hideSuccess() {
    document.getElementById('success-message').style.display = 'none';
}

function hideMessages() {
    hideError();
    hideSuccess();
}

function downloadReport() {
    // Prefer direct server download of last generated report using cached report for student
    const studentName = document.getElementById('session-info').dataset.name || '';
    if (studentName) {
        // Open in new tab to trigger attachment download
        window.open(`/download-latest?name=${encodeURIComponent(studentName)}`, '_blank');
        return;
    }

    // Fallback: construct and POST payload to /api/download-report
    const data = {
        student_name: document.getElementById('session-info').dataset.name || '',
        department: document.getElementById('session-info').dataset.dept || '',
        current_average: document.getElementById('current-avg').textContent.replace(' / 4.0', ''),
        trend: document.getElementById('trend').textContent,
        predictions: [],
        risk: document.getElementById('risk-assessment').textContent,
        insight: document.getElementById('insight-text').textContent,
        features: document.getElementById('features-list').textContent.split('\n').filter(f => f.trim())
    };

    // Collect auto-calculated SGPAs from grade entries
    const info = document.getElementById('session-info');
    const semCount = info ? (parseInt(info.dataset.sem || '0', 10) || 0) : 0;
    const semesters = [];

    for (let i = 1; i < semCount; i++) {
        const sgpaElement = document.getElementById(`sgpa-value-${i}`);
        if (sgpaElement && sgpaElement.textContent !== '--') {
            const sgpaValue = parseFloat(sgpaElement.textContent);
            if (!isNaN(sgpaValue)) {
                semesters.push({
                    semester: i,
                    sgpa: sgpaValue
                });
            }
        }
    }
    data.semesters = semesters;

    // Collect subject grades if present and validate
    const gradeValidation = validateGradesForSubmission();
    if (!gradeValidation.valid) {
        showError(gradeValidation.message || 'Please enter valid subject grades before downloading report.');
        return;
    }
    if (gradeValidation.grades) data.subject_grades = gradeValidation.grades;

    // Collect predictions
    const predCards = document.querySelectorAll('.prediction-card');
    predCards.forEach(card => {
        const sem = card.querySelector('.prediction-semester').textContent.replace('Semester ', '');
        const sgpa = card.querySelector('.prediction-value').textContent.replace(' / 4.0', '');
        data.predictions.push({
            semester: parseInt(sem),
            predicted_sgpa: parseFloat(sgpa)
        });
    });

    // Send to server for PDF generation
    fetch('/api/download-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to generate report');
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Performance_Report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Download error:', error);
            showError('Failed to download report. Please try again.');
        });
}

// ========================================
// WHAT-IF ANALYSIS
// ========================================

let currentPredictionData = null;

function initializeWhatIfAnalysis() {
    const attendanceSlider = document.getElementById('whatif-attendance');
    const midtermSlider = document.getElementById('whatif-midterm');
    const gradeSelect = document.getElementById('whatif-grade');
    const calculateBtn = document.getElementById('whatif-calculate');

    if (attendanceSlider) {
        attendanceSlider.addEventListener('input', function () {
            document.getElementById('whatif-attendance-value').textContent = this.value + '%';
        });
    }

    if (midtermSlider) {
        midtermSlider.addEventListener('input', function () {
            document.getElementById('whatif-midterm-value').textContent = this.value + '/50';
        });
    }

    if (gradeSelect) {
        gradeSelect.addEventListener('change', function () {
            const labels = {
                '0': 'Current',
                '0.3': '+0.3 GPA',
                '0.5': '+0.5 GPA',
                '1.0': '+1.0 GPA'
            };
            document.getElementById('whatif-grade-value').textContent = labels[this.value];
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateWhatIf);
    }
}

function calculateWhatIf() {
    if (!currentPredictionData) {
        showError('Please generate a prediction first before using What-If Analysis');
        return;
    }

    const attendance = parseFloat(document.getElementById('whatif-attendance').value);
    const midterm = parseFloat(document.getElementById('whatif-midterm').value);
    const gradeImprovement = parseFloat(document.getElementById('whatif-grade').value);

    // Calculate hypothetical CGPA
    const currentCGPA = currentPredictionData.currentAvg || 3.0;
    const attendanceImpact = (attendance - 75) / 100 * 0.5; // Max 0.5 impact
    const midtermImpact = (midterm - 25) / 50 * 0.3; // Max 0.3 impact

    const hypotheticalCGPA = Math.min(4.0, Math.max(0,
        currentCGPA + gradeImprovement + attendanceImpact + midtermImpact
    ));

    const cgpaChange = hypotheticalCGPA - currentCGPA;
    const passProb = Math.min(100, Math.max(0,
        50 + (hypotheticalCGPA - 2.0) * 25 + attendance * 0.3
    ));

    // Generate insight
    let insight = '';
    if (cgpaChange > 0.5) {
        insight = '🌟 Excellent! These changes could significantly boost your CGPA!';
    } else if (cgpaChange > 0.2) {
        insight = '✅ Good improvement! Keep up the effort for better results.';
    } else if (cgpaChange > 0) {
        insight = '📈 Small positive impact. Consider more improvements for better gains.';
    } else if (cgpaChange < -0.2) {
        insight = '⚠️ Warning: These factors could negatively impact your performance.';
    } else {
        insight = '➡️ Minimal change expected. Current performance level maintained.';
    }

    // Display results
    document.getElementById('whatif-predicted-cgpa').textContent = hypotheticalCGPA.toFixed(2);
    document.getElementById('whatif-cgpa-change').textContent =
        `${cgpaChange >= 0 ? '+' : ''}${cgpaChange.toFixed(2)} from current`;
    document.getElementById('whatif-cgpa-change').style.color = cgpaChange >= 0 ? '#00FF7F' : '#FF6347';

    document.getElementById('whatif-pass-prob').textContent = passProb.toFixed(0) + '%';
    document.getElementById('whatif-pass-change').textContent =
        passProb >= 75 ? 'High probability' : passProb >= 50 ? 'Moderate probability' : 'Needs improvement';

    document.getElementById('whatif-insight').textContent = insight;

    // Show results
    document.getElementById('whatif-results').style.display = 'grid';
}

// ========================================
// AI RECOMMENDATIONS
// ========================================

function generateRecommendations(predictionData) {
    const recommendations = [];
    const currentAvg = predictionData.currentAvg || 0;
    const attendance = parseFloat(document.getElementById('attendance-input')?.value) || 75;
    const midterm = parseFloat(document.getElementById('midterm-input')?.value) || 25;

    // Analyze grades
    const gradeValues = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
    const enteredGrades = [];

    document.querySelectorAll('.grade-select').forEach(select => {
        if (select.value) {
            enteredGrades.push({ subject: select.dataset.subject || 'Subject', grade: select.value, value: gradeValues[select.value] || 0 });
        }
    });

    // Find weak subjects
    const weakSubjects = enteredGrades.filter(g => g.value < 3.0).sort((a, b) => a.value - b.value);

    // Recommendation 1: Attendance
    if (attendance < 75) {
        recommendations.push({
            icon: '📅',
            title: 'Improve Attendance',
            priority: 'high',
            description: `Your current attendance is ${attendance}%. Aim for at least 85% attendance to significantly boost your performance.`,
            actionable: 'Set reminders for classes and track your attendance weekly.'
        });
    } else if (attendance < 85) {
        recommendations.push({
            icon: '📅',
            title: 'Maintain Good Attendance',
            priority: 'medium',
            description: `You have ${attendance}% attendance. Push it above 85% for optimal results.`,
            actionable: 'Keep up the consistency and avoid unnecessary absences.'
        });
    }

    // Recommendation 2: Weak Subjects
    if (weakSubjects.length > 0) {
        const topWeak = weakSubjects.slice(0, 2);
        recommendations.push({
            icon: '📚',
            title: 'Focus on Weak Subjects',
            priority: 'high',
            description: `You need improvement in: ${topWeak.map(s => s.subject).join(', ')}`,
            actionable: 'Dedicate extra study hours, seek tutor help, and practice more problems in these subjects.'
        });
    }

    // Recommendation 3: Midterm Performance
    if (midterm < 30) {
        recommendations.push({
            icon: '📝',
            title: 'Strengthen Exam Preparation',
            priority: 'high',
            description: `Midterm score of ${midterm}/50 indicates need for better exam strategies.`,
            actionable: 'Practice past papers, join study groups, and review concepts regularly.'
        });
    } else if (midterm < 40) {
        recommendations.push({
            icon: '📝',
            title: 'Good Exam Performance',
            priority: 'medium',
            description: `Midterm score of ${midterm}/50 is decent. Aim for 40+ for excellence.`,
            actionable: 'Continue your preparation routine and tackle advanced problems.'
        });
    }

    // Recommendation 4: CGPA Status
    if (currentAvg < 2.5) {
        recommendations.push({
            icon: '⚠️',
            title: 'Critical: CGPA Below Threshold',
            priority: 'critical',
            description: `Your CGPA of ${currentAvg.toFixed(2)} is below the minimum requirement of 2.5.`,
            actionable: 'Meet with academic advisor immediately, consider tutoring, reduce extracurricular load.'
        });
    } else if (currentAvg < 3.0) {
        recommendations.push({
            icon: '📊',
            title: 'Work Towards Better CGPA',
            priority: 'high',
            description: `CGPA of ${currentAvg.toFixed(2)} needs improvement to reach 3.0+`,
            actionable: 'Focus on consistency across all subjects, especially core courses.'
        });
    } else if (currentAvg >= 3.5) {
        recommendations.push({
            icon: '🏆',
            title: 'Excellent Performance!',
            priority: 'low',
            description: `Outstanding CGPA of ${currentAvg.toFixed(2)}! Keep up the great work.`,
            actionable: 'Maintain this level, mentor peers, and consider advanced coursework.'
        });
    }

    // Recommendation 5: Study Strategy
    if (currentAvg < 3.0 || weakSubjects.length > 2) {
        recommendations.push({
            icon: '💡',
            title: 'Optimize Study Strategy',
            priority: 'medium',
            description: 'Your current approach may need refinement for better results.',
            actionable: 'Try active recall, spaced repetition, and Pomodoro technique. Use office hours effectively.'
        });
    }

    // Recommendation 6: Time Management
    recommendations.push({
        icon: '⏰',
        title: 'Enhance Time Management',
        priority: 'medium',
        description: 'Effective time allocation is key to academic success.',
        actionable: 'Create a weekly study schedule, prioritize difficult subjects, and avoid procrastination.'
    });

    return recommendations;
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-container');

    if (!container || recommendations.length === 0) {
        if (container) {
            container.innerHTML = '<p class="no-recommendations">No recommendations available. Generate a prediction first.</p>';
        }
        return;
    }

    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card ${rec.priority}">
            <div class="recommendation-header">
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-title-group">
                    <h3 class="recommendation-title">${rec.title}</h3>
                    <span class="recommendation-priority priority-${rec.priority}">${rec.priority.toUpperCase()}</span>
                </div>
            </div>
            <p class="recommendation-description">${rec.description}</p>
            <div class="recommendation-actionable">
                <strong>Action:</strong> ${rec.actionable}
            </div>
        </div>
    `).join('');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    initializeWhatIfAnalysis();
});

// Modify the existing predictGrade function to show these sections
const originalPredictGrade = window.predictGrade;
if (typeof originalPredictGrade === 'function') {
    window.predictGrade = function () {
        originalPredictGrade.call(this);

        // After prediction, store data and show new sections
        setTimeout(() => {
            const currentAvgElement = document.getElementById('current-avg');
            if (currentAvgElement && currentAvgElement.textContent !== '--') {
                currentPredictionData = {
                    currentAvg: parseFloat(currentAvgElement.textContent)
                };

                // Show What-If and Recommendations sections
                document.getElementById('whatif-section').style.display = 'block';
                document.getElementById('recommendations-section').style.display = 'block';

                // Generate and display recommendations
                const recommendations = generateRecommendations(currentPredictionData);
                displayRecommendations(recommendations);

                // Set default values in What-If based on current inputs
                const attendance = document.getElementById('attendance-input')?.value || 75;
                const midterm = document.getElementById('midterm-input')?.value || 25;

                document.getElementById('whatif-attendance').value = attendance;
                document.getElementById('whatif-attendance-value').textContent = attendance + '%';
                document.getElementById('whatif-midterm').value = midterm;
                document.getElementById('whatif-midterm-value').textContent = midterm + '/50';
            }
        }, 500);
    };
}
