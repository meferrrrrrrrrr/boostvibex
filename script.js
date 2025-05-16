document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const signupButton = document.getElementById('signup-button');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const emailInput = document.getElementById('email');
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('login-button');
  const loginMessage = document.getElementById('loginMessage');
  const toggleLogin = document.getElementById('toggleLogin');
  const loginEmailInput = document.getElementById('loginEmail');

  // Logica pentru înregistrare
  signupButton.addEventListener('click', async function (event) {
    event.preventDefault();

    // Validăm email-ul
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      confirmationMessage.style.display = 'block';
      confirmationMessage.style.color = 'red';
      confirmationMessage.textContent = 'Te rog introdu un email valid.';
      return;
    }

    try {
      // Facem cererea către endpoint-ul local /signup
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data); // Debugging
      confirmationMessage.style.display = 'block';

      if (response.ok) {
        confirmationMessage.textContent = data.message || 'Bine ai venit! Înregistrare reușită.';
        confirmationMessage.style.color = 'green';
        emailInput.value = ''; // Resetează câmpul email
      } else {
        confirmationMessage.textContent = data.error || 'Eroare la înregistrare.';
        confirmationMessage.style.color = 'red';
      }
    } catch (error) {
      console.log("Eroare fetch:", error); // Debugging
      confirmationMessage.style.display = 'block';
      confirmationMessage.style.color = 'red';
      confirmationMessage.textContent = `Eroare: ${error.message || 'Nu s-a putut conecta la server.'}`;
    }
  });

  // Logica pentru comutare între formulare
  toggleLogin.addEventListener('click', () => {
    if (signupForm.style.display !== 'none') {
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
      toggleLogin.textContent = 'Înapoi la Înregistrare';
    } else {
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
      toggleLogin.textContent = 'Ai deja cont? Conectează-te';
      loginMessage.style.display = 'none'; // Ascunde mesajul la revenire
    }
  });

  // Logica pentru conectare
  loginButton.addEventListener('click', async function (event) {
    event.preventDefault();

    // Validăm email-ul
    const email = loginEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      loginMessage.style.display = 'block';
      loginMessage.style.color = 'red';
      loginMessage.textContent = 'Te rog introdu un email valid.';
      return;
    }

    try {
      // Facem cererea către endpoint-ul local /login
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data); // Debugging
      loginMessage.style.display = 'block';

      if (response.ok) {
        loginMessage.textContent = data.message || 'Conectare reușită!';
        loginMessage.style.color = 'green';
        loginEmailInput.value = ''; // Resetează câmpul email
      } else {
        loginMessage.textContent = data.error || 'Eroare la conectare.';
        loginMessage.style.color = 'red';
      }
    } catch (error) {
      console.log("Eroare fetch:", error); // Debugging
      loginMessage.style.display = 'block';
      loginMessage.style.color = 'red';
      loginMessage.textContent = `Eroare: ${error.message || 'Nu s-a putut conecta la server.'}`;
    }
  });
});