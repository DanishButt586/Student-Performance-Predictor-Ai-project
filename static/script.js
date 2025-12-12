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

    // Get input values
    const inputData = {
        g1: parseFloat(document.getElementById('g1').value),
        g2: parseFloat(document.getElementById('g2').value),
        study: parseFloat(document.getElementById('study').value),
        absences: parseFloat(document.getElementById('absences').value),
        failures: parseFloat(document.getElementById('failures').value),
        goout: parseFloat(document.getElementById('goout').value),
        age: parseFloat(document.getElementById('age').value)
    };

    // Validate inputs
    if (isNaN(inputData.g1) || isNaN(inputData.g2) || isNaN(inputData.study)) {
        showError('Please enter valid numbers for all fields');
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
        body: JSON.stringify(inputData)
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

    // Predicted grade
    document.getElementById('pred-grade').textContent = `${data.predicted_grade} / 20`;

    // Risk assessment
    const riskBadge = document.getElementById('risk-assessment');
    riskBadge.textContent = data.risk;
    riskBadge.className = 'result-value risk-badge';

    if (data.risk.includes('LOW')) {
        riskBadge.classList.add('low');
    } else if (data.risk.includes('MODERATE')) {
        riskBadge.classList.add('moderate');
    } else if (data.risk.includes('ELEVATED')) {
        riskBadge.classList.add('elevated');
    } else {
        riskBadge.classList.add('high');
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
        featuresList.textContent = 'Unable to extract feature importance';
    }

    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetForm() {
    // Reset inputs to defaults
    document.getElementById('g1').value = 12;
    document.getElementById('g2').value = 12;
    document.getElementById('study').value = 5;
    document.getElementById('absences').value = 4;
    document.getElementById('failures').value = 0;
    document.getElementById('goout').value = 3;
    document.getElementById('age').value = 18;

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
