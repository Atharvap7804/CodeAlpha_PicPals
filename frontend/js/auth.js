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
})

