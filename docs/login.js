// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    window.location.href = 'userdashboard.html';
    return;
  }

  // DOM elements
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const googleButtons = document.querySelectorAll('.google-btn');

  // API base URL - loaded from config.js
  const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

  console.log('Login.js loaded, API URL:', API_BASE_URL);

  // Password visibility toggle
  window.togglePasswordVisibility = function() {
    const passwordInput = document.getElementById('login-password');
    const toggleBtn = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      passwordInput.type = 'password';
      toggleBtn.textContent = '👁️';
    }
  };

  // Switch to registration form
  showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    registerError.textContent = '';
  });

  // Switch to login form
  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    loginError.textContent = '';
  });

  // Login functionality
  loginBtn.addEventListener('click', async () => {
    const loginInput = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!loginInput || !password) {
      loginError.textContent = 'Please fill in all fields';
      loginError.style.color = '#e74c3c';
      return;
    }
    
    loginError.textContent = 'Logging in...';
    loginError.style.color = '#4BB543';
    
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(loginInput);
      
      const loginData = {
        username: !isEmail ? loginInput : undefined,
        email: isEmail ? loginInput : undefined,
        password: password
      };

      Object.keys(loginData).forEach(key => 
        loginData[key] === undefined && delete loginData[key]
      );

      const isAdminLogin = (loginInput.toLowerCase() === 'admin' || loginInput.toLowerCase() === 'admin@gmail.com');
      const loginEndpoint = isAdminLogin ? '/admin/login' : '/auth/login';

      const response = await fetch(`${API_BASE_URL}${loginEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        
        loginError.textContent = 'Login successful! Redirecting...';
        
        if (data.role === 'admin' || data.role === 'superadmin') {
          setTimeout(() => window.location.href = 'adminPanel.html', 1000);
        } else {
          setTimeout(() => window.location.href = 'index.html', 1000);
        }
      } else {
        loginError.style.color = '#e74c3c';
        loginError.textContent = data.message || 'Login failed';
      }
    } catch (error) {
      console.error('Login error:', error);
      loginError.style.color = '#e74c3c';
      loginError.textContent = 'Network error. Please try again.';
    }
  });

  // Real-time email validation
  document.getElementById('reg-email').addEventListener('input', function() {
    const email = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
      registerError.textContent = 'Please enter a valid email address';
      registerError.style.color = '#e74c3c';
    } else if (email && emailRegex.test(email)) {
      registerError.textContent = '';
    }
  });

  // Registration functionality
  registerBtn.addEventListener('click', async () => {
    console.log('Register button clicked!');
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm').value;
    
    console.log('Registration data:', { username, email, hasPassword: !!password });
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      registerError.textContent = 'Please fill in all fields';
      registerError.style.color = '#e74c3c';
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      registerError.textContent = 'Please enter a valid email address';
      registerError.style.color = '#e74c3c';
      return;
    }
    
    if (username.length < 3) {
      registerError.textContent = 'Username must be at least 3 characters';
      registerError.style.color = '#e74c3c';
      return;
    }
    
    if (password.length < 6) {
      registerError.textContent = 'Password must be at least 6 characters';
      registerError.style.color = '#e74c3c';
      return;
    }
    
    if (password !== confirmPassword) {
      registerError.textContent = 'Passwords do not match';
      registerError.style.color = '#e74c3c';
      return;
    }
    
    registerError.textContent = 'Creating account...';
    registerError.style.color = '#4BB543';
    
    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        
        registerError.textContent = 'Registration successful! Redirecting...';
        setTimeout(() => window.location.href = 'index.html', 1000);
      } else {
        registerError.style.color = '#e74c3c';
        registerError.textContent = data.message || 'Registration failed';
      }
    } catch (error) {
      console.error('Registration error:', error);
      registerError.style.color = '#e74c3c';
      registerError.textContent = 'Network error. Please check if backend is running.';
    }
  });

  // Google OAuth
  googleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const baseUrl = window.API_BASE_URL ? window.API_BASE_URL.replace('/api', '') : 'http://localhost:5000';
      window.location.href = `${baseUrl}/api/auth/google`;
    });
  });

  // Forgot password
  document.getElementById('forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt('Please enter your email to reset your password:');
    if (email) {
      alert(`Password reset instructions have been sent to ${email}. Check your inbox.`);
    }
  });
});
