// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  
  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      
      const icon = togglePassword.querySelector('i');
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  }
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      // Validation
      if (!Validator.email(email)) {
        Toast.error('Please enter a valid email address');
        return;
      }
      
      if (!Validator.required(password)) {
        Toast.error('Please enter your password');
        return;
      }
      
      // Disable button and show loader
      loginBtn.disabled = true;
      loginBtn.querySelector('.btn-text').style.display = 'none';
      loginBtn.querySelector('.btn-loader').style.display = 'inline';
      
      try {
        await API.login(email, password);
        
        Toast.success('Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
        
      } catch (error) {
        Toast.error(error.message || 'Login failed. Please try again.');
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.querySelector('.btn-text').style.display = 'inline';
        loginBtn.querySelector('.btn-loader').style.display = 'none';
      }
    });
  }
});
