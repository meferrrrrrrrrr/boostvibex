document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const signupButton = document.getElementById('signup-button');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const emailInput = document.getElementById('email');

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
});