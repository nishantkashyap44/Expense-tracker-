// Login Form Handler
document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const emailInput = document.getElementById('email');
  const rememberCheckbox = document.getElementById('remember');
  
  // Load saved email if remember me was previously checked
  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }
  
  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      
      const icon = togglePassword.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Wait for API to be initialized
      if (!window.API) {
        Toast.error('System initializing. Please try again.');
        return;
      }
      
      // Get email element and validate it exists
      if (!emailInput) {
        Toast.error('Email input not found');
        return;
      }
      
      const email = emailInput.value.trim();
      const password = passwordInput?.value || '';
      const remember = rememberCheckbox?.checked || false;
      
      // Validation
      if (!Validator.email(email)) {
        Toast.error('Please enter a valid email address');
        return;
      }
      
      if (!Validator.required(password)) {
        Toast.error('Please enter your password');
        return;
      }
      
      // Disable button and show loader (with null checks)
      if (loginBtn) {
        loginBtn.disabled = true;
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline';
      }
      
      try {
        const response = await API.login(email, password);
        
        // Validate response exists
        if (!response) {
          throw new Error('Login failed. No response from server.');
        }
        
        // Handle remember me functionality
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        Toast.success('Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
        
      } catch (error) {
        Toast.error(error.message || 'Login failed. Please try again.');
      } finally {
        // Re-enable button (with null check)
        if (loginBtn) {
          loginBtn.disabled = false;
          const btnText = loginBtn.querySelector('.btn-text');
          const btnLoader = loginBtn.querySelector('.btn-loader');
          if (btnText) btnText.style.display = 'inline';
          if (btnLoader) btnLoader.style.display = 'none';
        }
      }
    });
  }
});
