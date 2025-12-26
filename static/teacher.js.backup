// Teacher Dashboard JavaScript

let studentPerformanceChart = null;

// Debugging: Log when script loads
console.log('Teacher.js loaded successfully');
console.log('allStudentsData available:', typeof allStudentsData !== 'undefined');

// Search and Filter Functionality
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded fired');
    console.log('All students data:', allStudentsData);
    
    const searchInput = document.getElementById('student-search');
    const deptFilter = document.getElementById('filter-department');
    const semesterFilter = document.getElementById('filter-semester');
    const cgpaFilter = document.getElementById('filter-cgpa');
    const resetButton = document.getElementById('reset-filters');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (deptFilter) {
        deptFilter.addEventListener('change', applyFilters);
    }
    if (semesterFilter) {
        semesterFilter.addEventListener('change', applyFilters);
    }
    if (cgpaFilter) {
        cgpaFilter.addEventListener('change', applyFilters);
    }
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
    
    // Add event delegation for view details buttons
    console.log('Setting up event delegation for view details buttons');
    document.addEventListener('click', function(e) {
        console.log('Document clicked, target:', e.target);
        
        // Find the button element (in case user clicked on text/emoji inside button)
        const button = e.target.closest('.btn-view-details');
        
        if (button) {
            console.log('View Details button found!');
            e.preventDefault();
            e.stopPropagation();
            const studentId = button.getAttribute('data-student-id');
            console.log('Button clicked! Student ID:', studentId);
            if (studentId) {
                openStudentModal(studentId);
            } else {
                console.error('No student ID found on button');
            }
        }
    });
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const deptFilter = document.getElementById('filter-department').value;
    const semesterFilter = document.getElementById('filter-semester').value;
    const cgpaFilter = document.getElementById('filter-cgpa').value;

    const allStudentCards = document.querySelectorAll('.student-card');
    let visibleCount = 0;

    allStudentCards.forEach(card => {
        const name = card.dataset.studentName.toLowerCase();
        const dept = card.dataset.studentDepartment;
        const semester = card.dataset.studentSemester;
        const cgpa = parseFloat(card.dataset.studentCgpa);

        let matchesSearch = name.includes(searchTerm);
        let matchesDept = !deptFilter || dept === deptFilter;
        let matchesSemester = !semesterFilter || semester === semesterFilter;
        let matchesCgpa = true;

        if (cgpaFilter) {
            const [min, max] = cgpaFilter.split('-').map(Number);
            matchesCgpa = cgpa >= min && cgpa <= max;
        }

        if (matchesSearch && matchesDept && matchesSemester && matchesCgpa) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show/hide category sections if empty
    updateCategorySections();
}

function updateCategorySections() {
    const sections = document.querySelectorAll('.student-category-section');

    sections.forEach(section => {
        const visibleCards = section.querySelectorAll('.student-card[style="display: block;"], .student-card:not([style*="display: none"])');
        const grid = section.querySelector('.students-grid');

        if (visibleCards.length === 0) {
            grid.innerHTML = '<p class="no-results">No students match the current filters</p>';
        }
    });
}

function resetFilters() {
    document.getElementById('student-search').value = '';
    document.getElementById('filter-department').value = '';
    document.getElementById('filter-semester').value = '';
    document.getElementById('filter-cgpa').value = '';

    const allStudentCards = document.querySelectorAll('.student-card');
    allStudentCards.forEach(card => {
        card.style.display = 'block';
    });

    // Remove any "no results" messages
    const noResultsMessages = document.querySelectorAll('.no-results');
    noResultsMessages.forEach(msg => msg.remove());
}

// Student Modal Functions
function openStudentModal(studentId) {
    console.log('Opening modal for student:', studentId);
    const modal = document.getElementById('student-modal');

    // Find student data from all categories
    let studentData = null;

    for (const category in allStudentsData) {
        const found = allStudentsData[category].find(s => String(s.id) === String(studentId));
        if (found) {
            studentData = found;
            break;
        }
    }

    if (!studentData) {
        console.error('Student not found:', studentId);
        console.log('Available students:', allStudentsData);
        return;
    }
    
    console.log('Found student data:', studentData);

    // Populate modal with student data
    document.getElementById('modal-student-name').textContent = studentData.name;
    document.getElementById('modal-department').textContent = studentData.department;
    document.getElementById('modal-semester').textContent = `Semester ${studentData.semester}`;
    document.getElementById('modal-cgpa').textContent = studentData.cgpa.toFixed(2);
    document.getElementById('modal-attendance').textContent = `${studentData.attendance}%`;

    // Populate all semester grades
    const allSemestersContainer = document.getElementById('modal-all-semesters');
    allSemestersContainer.innerHTML = '';

    if (studentData.semester_details && studentData.semester_details.length > 0) {
        // Add grade scale info at the top
        const gradeInfoBox = document.createElement('div');
        gradeInfoBox.className = 'grade-info-box';
        gradeInfoBox.innerHTML = `
            <strong>📋 Grade Scale:</strong> 
            A (4.0) | A- (3.7) | B+ (3.3) | B (3.0) | B- (2.7) | C+ (2.3) | C (2.0) | C- (1.7) | D (1.0) | F (0.0)
        `;
        allSemestersContainer.appendChild(gradeInfoBox);

        studentData.semester_details.forEach((semesterData, index) => {
            const semesterCard = document.createElement('div');
            semesterCard.className = 'semester-card';

            // Create subjects list HTML
            let subjectsHTML = '';
            if (semesterData.subjects && semesterData.subjects.length > 0) {
                subjectsHTML = semesterData.subjects.map(subject => `
                    <div class="subject-item">
                        <span class="subject-name">${subject.name}</span>
                        <span class="subject-grade grade-${subject.grade.replace('+', 'plus').replace('-', 'minus')}">${subject.grade}</span>
                    </div>
                `).join('');
            } else {
                subjectsHTML = '<p class="no-data">No subjects data available</p>';
            }

            semesterCard.innerHTML = `
                <div class="semester-header" onclick="toggleSemester(this)">
                    <div class="semester-title">
                        <span class="semester-number">📖 Semester ${semesterData.semester}</span>
                        <span class="semester-sgpa">SGPA: <strong>${semesterData.sgpa ? semesterData.sgpa.toFixed(2) : 'N/A'}</strong></span>
                    </div>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="semester-subjects" style="display: none;">
                    ${subjectsHTML}
                </div>
            `;
            allSemestersContainer.appendChild(semesterCard);
        });
    } else {
        allSemestersContainer.innerHTML = '<p class="no-data">No semester data available</p>';
    }

    // Render performance chart
    renderStudentPerformanceChart(studentData);

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeStudentModal() {
    const modal = document.getElementById('student-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Destroy chart if exists
    if (studentPerformanceChart) {
        studentPerformanceChart.destroy();
        studentPerformanceChart = null;
    }
}

function renderStudentPerformanceChart(studentData) {
    const ctx = document.getElementById('student-performance-chart');

    if (!ctx) return;

    // Destroy existing chart
    if (studentPerformanceChart) {
        studentPerformanceChart.destroy();
    }

    if (!studentData.history || studentData.history.length === 0) {
        ctx.parentElement.innerHTML = '<p class="no-data">No performance history available</p>';
        return;
    }

    const semesters = studentData.history.map(h => `Semester ${h.semester}`);
    const sgpaData = studentData.history.map(h => h.sgpa);
    const attendanceData = studentData.history.map(h => h.attendance);

    studentPerformanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: semesters,
            datasets: [
                {
                    label: 'SGPA',
                    data: sgpaData,
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.15)',
                    borderWidth: 4,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    pointBackgroundColor: '#FFD700',
                    pointBorderColor: '#1a1a1a',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: '#FFD700',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'Attendance %',
                    data: attendanceData,
                    borderColor: '#00FF7F',
                    backgroundColor: 'rgba(0, 255, 127, 0.12)',
                    borderWidth: 4,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 7,
                    pointHoverRadius: 11,
                    pointBackgroundColor: '#00FF7F',
                    pointBorderColor: '#1a1a1a',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: '#00FF7F',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 14,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 10,
                        boxHeight: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(20, 20, 20, 0.98)',
                    titleColor: '#FFD700',
                    bodyColor: '#ffffff',
                    borderColor: '#FFD700',
                    borderWidth: 2,
                    padding: 16,
                    displayColors: true,
                    titleFont: {
                        size: 15,
                        weight: '700'
                    },
                    bodyFont: {
                        size: 14,
                        weight: '600'
                    },
                    boxWidth: 12,
                    boxHeight: 12,
                    boxPadding: 6,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += context.parsed.y.toFixed(2);
                            } else {
                                label += context.parsed.y.toFixed(0) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.08)',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#e0e0e0',
                        font: {
                            size: 13,
                            weight: '600',
                            family: "'Inter', sans-serif"
                        },
                        padding: 10
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    max: 4.0,
                    grid: {
                        color: 'rgba(255, 215, 0, 0.12)',
                        drawBorder: false,
                        lineWidth: 1.5
                    },
                    ticks: {
                        color: '#FFD700',
                        font: {
                            size: 14,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        stepSize: 0.5,
                        padding: 12,
                        callback: function (value) {
                            return value.toFixed(1);
                        }
                    },
                    title: {
                        display: true,
                        text: '📊 SGPA',
                        color: '#FFD700',
                        font: {
                            size: 14,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        padding: 12
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(0, 255, 127, 0.1)',
                        drawBorder: false,
                        lineWidth: 1.5
                    },
                    ticks: {
                        color: '#00FF7F',
                        font: {
                            size: 13,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        stepSize: 20,
                        padding: 12,
                        callback: function (value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: '📈 Attendance',
                        color: '#00FF7F',
                        font: {
                            size: 14,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        padding: 12
                    }
                }
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(0, 255, 127, 0.1)',
                        drawBorder: false,
                        lineWidth: 1.5
                    },
                    ticks: {
                        color: '#00FF7F',
                        font: {
                            size: 13,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        stepSize: 20,
                        padding: 12,
                        callback: function (value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: '📈 Attendance',
                        color: '#00FF7F',
                        font: {
                            size: 14,
                            weight: '700',
                            family: "'Inter', sans-serif"
                        },
                        padding: 12
                    }
                }
            }
        }
    });
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('student-modal');
    if (event.target === modal) {
        closeStudentModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeStudentModal();
    }
});

// Toggle semester details
function toggleSemester(headerElement) {
    const semesterCard = headerElement.parentElement;
    const subjectsDiv = semesterCard.querySelector('.semester-subjects');
    const toggleIcon = headerElement.querySelector('.toggle-icon');

    if (subjectsDiv.style.display === 'none') {
        subjectsDiv.style.display = 'block';
        toggleIcon.textContent = '▲';
    } else {
        subjectsDiv.style.display = 'none';
        toggleIcon.textContent = '▼';
    }
}
