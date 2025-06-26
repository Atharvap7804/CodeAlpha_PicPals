document.addEventListener("DOMContentLoaded", () => {
 
  const registerform = document.getElementById('register-form')
  if (registerform) {
    registerform.addEventListener('submit', async (e) => {
      e.preventDefault()

      const firstName = document.getElementById('firstname').value
      const lastName = document.getElementById('Lastname').value
      const username = document.getElementById('username').value
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      

      try {
        const response = await fetch('http://localhost:4000/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ firstName, lastName, username, email, password })
        })

        const data = await response.json()

        if (response.ok) {
          alert('Registration successful!');
          window.location.href = 'login.html';
        } else {
          alert('Registration failed. Please try again.', +data.message);
        }
      } catch (error) {
        console.error('Registration failed:', error);
      }
    })
  }

  const loginform = document.getElementById('login-form')
  if (loginform) {
    loginform.addEventListener('submit', async (e) => {
      e.preventDefault()

      const username = document.getElementById('username').value
      const password = document.getElementById('password').value

      try {
        console.log("Submitting login...")
        const response = await fetch('http://localhost:4000/users/login', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        })


        const data= await response.json()

        if(response.ok){
          alert('Login successful!');
          window.location.href = 'profile.html';
        }else{
          alert('Login failed. Please try again.', +data.message);
        }
      } catch (error) {
        console.error('Login failed:', error);
      }
    })
  }

  // Forgot Password functionality
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const loginForm = document.getElementById('login-form');
  const forgotPasswordOverlay = document.getElementById('forgot-password-overlay');
  const forgotCloseBtn = document.getElementById('forgot-close-btn');

  if (forgotPasswordLink && forgotPasswordForm && loginForm && forgotPasswordOverlay && forgotCloseBtn) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('forgot-active');
      forgotPasswordOverlay.style.display = 'flex';
      // Remove pointer-events: none from overlay and form
      loginForm.style.pointerEvents = 'none';
      forgotPasswordOverlay.style.pointerEvents = 'auto';
      forgotPasswordForm.style.pointerEvents = 'auto';
    });

    forgotCloseBtn.addEventListener('click', () => {
      forgotPasswordOverlay.style.display = 'none';
      document.body.classList.remove('forgot-active');
      loginForm.style.pointerEvents = 'auto';
    });

    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value;
      const newPassword = document.getElementById('forgot-new-password').value;
      const confirmPassword = document.getElementById('forgot-confirm-password').value;

      if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/users/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, newPassword })
        });
        const data = await response.json();
        if (response.ok) {
          alert('Password reset successful! Please login with your new password.');
          forgotPasswordForm.reset();
          forgotPasswordOverlay.style.display = 'none';
          document.body.classList.remove('forgot-active');
          loginForm.style.pointerEvents = 'auto';
        } else {
          alert('Password reset failed: ' + data.message);
        }
      } catch (error) {
        console.error('Password reset failed:', error);
      }
    });
  }

  // Show/hide password functionality
  function addShowPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (input && toggle) {
      toggle.addEventListener('click', () => {
        if (input.type === 'password') {
          input.type = 'text';
          toggle.textContent = '🙈';
        } else {
          input.type = 'password';
          toggle.textContent = '👁️';
        }
      });
    }
  }

  // For login form
  if (document.getElementById('password')) {
    const loginPasswordInput = document.getElementById('password');
    if (!document.getElementById('login-password-toggle')) {
      const toggle = document.createElement('span');
      toggle.id = 'login-password-toggle';
      toggle.textContent = '👁️';
      toggle.style.cursor = 'pointer';
      toggle.style.position = 'absolute';
      toggle.style.right = '16px';
      toggle.style.top = '30px'; // Move the emoji up
      toggle.style.fontSize = '1.2rem';
      loginPasswordInput.parentNode.style.position = 'relative';
      loginPasswordInput.parentNode.appendChild(toggle);
    }
    addShowPasswordToggle('password', 'login-password-toggle');
  }

  // For register form
  if (document.getElementById('register-form')) {
    const regPasswordInput = document.getElementById('password');
    if (regPasswordInput && !document.getElementById('register-password-toggle')) {
      const toggle = document.createElement('span');
      toggle.id = 'register-password-toggle';
      toggle.textContent = '👁️';
      toggle.style.cursor = 'pointer';
      toggle.style.position = 'absolute';
      toggle.style.right = '16px';
      toggle.style.top = '30px'; // Move the emoji up
      toggle.style.fontSize = '1.2rem';
      regPasswordInput.parentNode.style.position = 'relative';
      regPasswordInput.parentNode.appendChild(toggle);
      addShowPasswordToggle('password', 'register-password-toggle');
    }
  }

  // For forgot password modal
  if (document.getElementById('forgot-new-password')) {
    const forgotNewInput = document.getElementById('forgot-new-password');
    if (!document.getElementById('forgot-new-password-toggle')) {
      const toggle = document.createElement('span');
      toggle.id = 'forgot-new-password-toggle';
      toggle.textContent = '👁️';
      toggle.style.cursor = 'pointer';
      toggle.style.position = 'absolute';
      toggle.style.right = '16px';
      toggle.style.top = '30px'; // Move the emoji up
      toggle.style.fontSize = '1.2rem';
      forgotNewInput.parentNode.style.position = 'relative';
      forgotNewInput.parentNode.appendChild(toggle);
      addShowPasswordToggle('forgot-new-password', 'forgot-new-password-toggle');
    }
  }
  if (document.getElementById('forgot-confirm-password')) {
    const forgotConfirmInput = document.getElementById('forgot-confirm-password');
    if (!document.getElementById('forgot-confirm-password-toggle')) {
      const toggle = document.createElement('span');
      toggle.id = 'forgot-confirm-password-toggle';
      toggle.textContent = '👁️';
      toggle.style.cursor = 'pointer';
      toggle.style.position = 'absolute';
      toggle.style.right = '16px';
      toggle.style.top = '30px'; // Move the emoji up
      toggle.style.fontSize = '1.2rem';
      forgotConfirmInput.parentNode.style.position = 'relative';
      forgotConfirmInput.parentNode.appendChild(toggle);
      addShowPasswordToggle('forgot-confirm-password', 'forgot-confirm-password-toggle');
    }
  }
})

