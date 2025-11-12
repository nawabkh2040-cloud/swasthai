// Signup Page JavaScript
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    // Clear previous messages
    errorMsg.className = '';
    errorMsg.textContent = '';
    successMsg.className = '';
    successMsg.textContent = '';
    
    // Check if username is marked as invalid
    if (usernameInput.classList.contains('is-invalid')) {
        errorMsg.className = 'alert alert-danger';
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Please choose a valid username';
        return;
    }
    
    // Validation
    if (password !== confirmPassword) {
        errorMsg.className = 'alert alert-danger';
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        errorMsg.className = 'alert alert-danger';
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Password must be at least 6 characters';
        return;
    }
    
    // Validate username format (no @ symbol, only alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        errorMsg.className = 'alert alert-danger';
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Username can only contain letters, numbers, underscore and hyphen';
        return;
    }
    
    if (username.includes('@')) {
        errorMsg.className = 'alert alert-danger';
        errorMsg.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Please use a username, not an email address';
        return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
    
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                full_name: fullName
            })
        });
        
        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (response.ok) {
            // Save token
            localStorage.setItem('token', data.access_token);
            
            successMsg.className = 'alert alert-success';
            successMsg.innerHTML = '<i class="bi bi-check-circle me-2"></i>Account created successfully! Redirecting...';
            
            // Redirect to chat
            setTimeout(() => {
                window.location.href = '/chat';
            }, 1500);
        } else {
            // Get error message from response
            let errorMessage = 'Signup failed. Please try again.';
            
            console.log('Error data.detail:', data.detail);
            console.log('Error data.error:', data.error);
            console.log('Type of data.detail:', typeof data.detail);
            
            // Check for error message in data.error first (our custom errors)
            if (data.error) {
                errorMessage = data.error;
            } else if (data.detail) {
                if (typeof data.detail === 'string') {
                    // If detail is a string, check if it's a status code or actual message
                    if (!isNaN(data.detail) || data.detail === '400' || data.detail === '422') {
                        // It's a status code, use generic message or check data.error
                        errorMessage = data.error || 'Invalid input. Please check your information.';
                    } else {
                        errorMessage = data.detail;
                    }
                } else if (Array.isArray(data.detail)) {
                    // Handle validation errors from FastAPI
                    console.log('Array of errors:', data.detail);
                    const errors = [];
                    data.detail.forEach(err => {
                        console.log('Error item:', err);
                        if (err.msg) {
                            errors.push(err.msg);
                        } else if (err.message) {
                            errors.push(err.message);
                        } else if (typeof err === 'string') {
                            errors.push(err);
                        }
                    });
                    errorMessage = errors.length > 0 ? errors.join('. ') : 'Validation error occurred';
                } else if (typeof data.detail === 'object') {
                    // If it's an object, try to extract meaningful message
                    if (data.detail.msg) {
                        errorMessage = data.detail.msg;
                    } else if (data.detail.message) {
                        errorMessage = data.detail.message;
                    } else {
                        errorMessage = 'Invalid input. Please check your information.';
                    }
                }
            }
            
            errorMsg.className = 'alert alert-danger';
            errorMsg.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i>' + errorMessage;
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Create Account';
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorMsg.className = 'alert alert-danger';
        errorMsg.innerHTML = '<i class="bi bi-wifi-off me-2"></i>Network error. Please check your connection.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Create Account';
    }
});

// Auto-resize username to lowercase and check availability
let usernameCheckTimeout;
const usernameInput = document.getElementById('username');
const usernameGroup = usernameInput.closest('.input-group');

usernameInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toLowerCase();
    
    // Clear previous timeout
    clearTimeout(usernameCheckTimeout);
    
    // Remove previous validation classes
    usernameInput.classList.remove('is-valid', 'is-invalid');
    
    const username = e.target.value.trim();
    
    // Don't check if username is too short
    if (username.length < 3) {
        return;
    }
    
    // Debounce the API call
    usernameCheckTimeout = setTimeout(async () => {
        await checkUsernameAvailability(username);
    }, 500); // Wait 500ms after user stops typing
});

async function checkUsernameAvailability(username) {
    // Show checking state
    usernameInput.classList.remove('is-valid', 'is-invalid');
    
    // Add a small loading indicator
    let feedback = usernameGroup.parentElement.querySelector('.username-checking');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'username-checking text-muted';
        feedback.style.fontSize = '0.875rem';
        feedback.style.marginTop = '0.25rem';
        usernameGroup.parentElement.appendChild(feedback);
    }
    feedback.innerHTML = '<i class="bi bi-arrow-repeat spin me-1"></i>Checking availability...';
    feedback.style.display = 'block';
    
    try {
        const response = await fetch(`/api/check-username/${encodeURIComponent(username)}`);
        const data = await response.json();
        
        // Remove checking indicator
        feedback.style.display = 'none';
        
        if (data.available) {
            // Username is available - show green
            usernameInput.classList.remove('is-invalid');
            usernameInput.classList.add('is-valid');
            
            // Update or create feedback message
            let validFeedback = usernameGroup.parentElement.querySelector('.valid-feedback');
            if (!validFeedback) {
                validFeedback = document.createElement('div');
                validFeedback.className = 'valid-feedback';
                validFeedback.style.display = 'block';
                usernameGroup.parentElement.appendChild(validFeedback);
            }
            validFeedback.innerHTML = '<i class="bi bi-check-circle me-1"></i>' + data.message;
            
            // Remove invalid feedback if exists
            const invalidFeedback = usernameGroup.parentElement.querySelector('.invalid-feedback');
            if (invalidFeedback) {
                invalidFeedback.remove();
            }
        } else {
            // Username is not available - show red
            usernameInput.classList.remove('is-valid');
            usernameInput.classList.add('is-invalid');
            
            // Update or create feedback message
            let invalidFeedback = usernameGroup.parentElement.querySelector('.invalid-feedback');
            if (!invalidFeedback) {
                invalidFeedback = document.createElement('div');
                invalidFeedback.className = 'invalid-feedback';
                invalidFeedback.style.display = 'block';
                usernameGroup.parentElement.appendChild(invalidFeedback);
            }
            invalidFeedback.innerHTML = '<i class="bi bi-x-circle me-1"></i>' + data.message;
            
            // Remove valid feedback if exists
            const validFeedback = usernameGroup.parentElement.querySelector('.valid-feedback');
            if (validFeedback) {
                validFeedback.remove();
            }
        }
    } catch (error) {
        console.error('Error checking username:', error);
        // Remove checking indicator
        feedback.style.display = 'none';
        // Don't show error to user, just silently fail
        usernameInput.classList.remove('is-valid', 'is-invalid');
    }
}
