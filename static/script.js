// Student Performance Predictor - JavaScript

document.addEventListener('DOMContentLoaded', function () {
    loadMetrics();
    setupEventListeners();
});

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
        })
        .catch(error => {
            console.error('Error loading metrics:', error);
            showError('Failed to load model metrics');
        });
}

function predictGrade() {
    // Clear previous messages
    hideMessages();

    // Get semester inputs
    const semesters = [];
    for (let i = 1; i <= 8; i++) {
        const value = document.getElementById(`sem${i}`).value;
        if (value !== '' && value !== null) {
            semesters.push({
                semester: i,
                sgpa: parseFloat(value)
            });
        }
    }

    // Validate at least 1 semester is entered
    if (semesters.length === 0) {
        showError('Please enter at least 1 semester SGPA to predict the next semester.');
        return;
    }

    // Validate all entered values are valid numbers between 0-4
    if (!semesters.every(s => !isNaN(s.sgpa) && s.sgpa >= 0 && s.sgpa <= 4)) {
        showError('Please enter valid SGPA values between 0 and 4 for each semester.');
        return;
    }

    // Disable button during request
    const predictBtn = document.getElementById('predict-btn');
    predictBtn.disabled = true;
    predictBtn.textContent = 'Predicting...';

    // Send prediction request
    fetch('/api/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ semesters: semesters })
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
    document.getElementById('current-avg').textContent = `${data.current_average} / 4.0`;

    // Trend
    document.getElementById('trend').textContent = data.trend;

    // Predictions grid
    const predictionsGrid = document.getElementById('predictions-grid');
    if (data.predictions && data.predictions.length > 0) {
        predictionsGrid.innerHTML = data.predictions
            .map(p => `
                <div class="prediction-card">
                    <div class="prediction-semester">Semester ${p.semester}</div>
                    <div class="prediction-value">${p.predicted_sgpa} / 4.0</div>
                </div>
            `)
            .join('');
    } else {
        predictionsGrid.textContent = 'No predictions available';
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

    // Features
    const featuresList = document.getElementById('features-list');
    if (data.features && data.features.length > 0) {
        featuresList.innerHTML = data.features
            .map(f => `• ${f.name}: ${f.coef}`)
            .join('\n');
    } else {
        featuresList.textContent = 'Performance analysis based on historical data';
    }

    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
