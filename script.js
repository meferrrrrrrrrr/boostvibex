document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const signupButton = document.getElementById('signup-button');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginForm = document.getElementById('loginForm');
  const loginButton = document.getElementById('login-button');
  const loginMessage = document.getElementById('loginMessage');
  const toggleLogin = document.getElementById('toggleLogin');
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const logoutBtn = document.getElementById('logout');
  const forgotPasswordButton = document.getElementById('forgot-password-button');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetPasswordButton = document.getElementById('reset-password-button');
  const backToLoginButton = document.getElementById('back-to-login');
  const forgotPasswordMessage = document.getElementById('forgotPasswordMessage');
  const forgotEmailInput = document.getElementById('forgotEmail');

  // Elemente pentru generarea de conținut
  const promptSubject = document.getElementById('prompt-subject');
  const generateIdeaBtn = document.getElementById('generate-idea');
  const generateDescriptionBtn = document.getElementById('generate-description');
  const generateTitleBtn = document.getElementById('generate-title');
  const message = document.getElementById('message');
  const responseDiv = document.getElementById('response');
  const responseActions = document.querySelector('.response-actions');
  const generateAnotherBtn = document.getElementById('generate-another');
  const likeBtn = document.getElementById('like');
  const dislikeBtn = document.getElementById('dislike');
  const copyBtn = document.getElementById('copy-response');
  const clearSubjectBtn = document.getElementById('clear-subject');
  const interactiveSection = document.getElementById('interactive');

  let lastType = '';

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
      setTimeout(() => { confirmationMessage.style.display = 'none'; }, 3000);
      return;
    }

    // Validăm parola
    const password = passwordInput.value.trim();
    if (password.length < 12) {
      confirmationMessage.style.display = 'block';
      confirmationMessage.style.color = 'red';
      confirmationMessage.textContent = 'Parola trebuie să aibă minim 12 caractere.';
      setTimeout(() => { confirmationMessage.style.display = 'none'; }, 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data);
      confirmationMessage.style.display = 'block';

      if (response.ok) {
        confirmationMessage.textContent = data.message || 'Bine ai venit! Înregistrare reușită.';
        confirmationMessage.style.color = 'green';
        emailInput.value = '';
        passwordInput.value = '';
        interactiveSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        setTimeout(() => { confirmationMessage.style.display = 'none'; }, 3000);
      } else {
        confirmationMessage.textContent = data.error || 'Eroare la înregistrare.';
        confirmationMessage.style.color = 'red';
        setTimeout(() => { confirmationMessage.style.display = 'none'; }, 3000);
      }
    } catch (error) {
      console.log("Eroare fetch:", error);
      confirmationMessage.style.display = 'block';
      confirmationMessage.style.color = 'red';
      confirmationMessage.textContent = `Eroare: ${error.message || 'Nu s-a putut conecta la server.'}`;
      setTimeout(() => { confirmationMessage.style.display = 'none'; }, 3000);
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
      loginMessage.style.display = 'none';
      forgotPasswordForm.style.display = 'none';
      logoutBtn.style.display = 'none';
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
      setTimeout(() => { loginMessage.style.display = 'none'; }, 3000);
      return;
    }

    // Validăm parola
    const password = loginPasswordInput.value.trim();
    if (password.length < 12) {
      loginMessage.style.display = 'block';
      loginMessage.style.color = 'red';
      loginMessage.textContent = 'Parola trebuie să aibă minim 12 caractere.';
      setTimeout(() => { loginMessage.style.display = 'none'; }, 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data);
      loginMessage.style.display = 'block';

      if (response.ok) {
        loginMessage.textContent = data.message || 'Conectare reușită!';
        loginMessage.style.color = 'green';
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        interactiveSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        setTimeout(() => { loginMessage.style.display = 'none'; }, 3000);
      } else {
        loginMessage.textContent = data.error || 'Eroare la conectare.';
        loginMessage.style.color = 'red';
        setTimeout(() => { loginMessage.style.display = 'none'; }, 3000);
      }
    } catch (error) {
      console.log("Eroare fetch:", error);
      loginMessage.style.display = 'block';
      loginMessage.style.color = 'red';
      loginMessage.textContent = `Eroare: ${error.message || 'Nu s-a putut conecta la server.'}`;
      setTimeout(() => { loginMessage.style.display = 'none'; }, 3000);
    }
  });

  // Logica pentru resetare parolă
  forgotPasswordButton.addEventListener('click', () => {
    loginForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
    forgotPasswordMessage.style.display = 'none';
  });

  backToLoginButton.addEventListener('click', () => {
    forgotPasswordForm.style.display = 'none';
    loginForm.style.display = 'block';
    forgotPasswordMessage.style.display = 'none';
  });

  resetPasswordButton.addEventListener('click', async (event) => {
    event.preventDefault();

    // Validăm email-ul
    const email = forgotEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      forgotPasswordMessage.style.display = 'block';
      forgotPasswordMessage.style.color = 'red';
      forgotPasswordMessage.textContent = 'Te rog introdu un email valid.';
      setTimeout(() => { forgotPasswordMessage.style.display = 'none'; }, 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data);
      forgotPasswordMessage.style.display = 'block';

      if (response.ok) {
        forgotPasswordMessage.textContent = data.message || 'Cod de resetare trimis (simulat).';
        forgotPasswordMessage.style.color = 'green';
        forgotEmailInput.value = '';
        setTimeout(() => { forgotPasswordMessage.style.display = 'none'; }, 5000);
      } else {
        forgotPasswordMessage.textContent = data.error || 'Eroare la resetare.';
        forgotPasswordMessage.style.color = 'red';
        setTimeout(() => { forgotPasswordMessage.style.display = 'none'; }, 3000);
      }
    } catch (error) {
      console.log("Eroare fetch:", error);
      forgotPasswordMessage.style.display = 'block';
      forgotPasswordMessage.style.color = 'red';
      forgotPasswordMessage.textContent = `Eroare: ${error.message || 'Nu s-a putut conecta la server.'}`;
      setTimeout(() => { forgotPasswordMessage.style.display = 'none'; }, 3000);
    }
  });

  // Logica pentru logout
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      message.textContent = data.message || 'Eroare la deconectare';
      setTimeout(() => {
        message.textContent = '';
        interactiveSection.style.display = 'none';
        loginForm.style.display = 'block';
        logoutBtn.style.display = 'none';
      }, 2000);
    } catch (error) {
      message.textContent = `Eroare: ${error.message}`;
      setTimeout(() => { message.textContent = ''; }, 2000);
    }
  });

  // Funcție pentru generarea prompt-ului
  async function generatePrompt(type) {
    const subject = promptSubject.value.trim();

    if (subject && !/^[a-zA-Z0-9ăîâșțĂÎÂȘȚ\s]+$/.test(subject)) {
      message.textContent = 'Subiectul poate conține doar litere, cifre și spații.';
      setTimeout(() => { message.textContent = ''; }, 6000);
      return;
    }
    if (subject && (subject.trim().length < 3 || subject.trim().length > 200)) {
      message.textContent = 'Subiectul trebuie să aibă între 3 și 200 de caractere.';
      setTimeout(() => { message.textContent = ''; }, 6000);
      return;
    }

    lastType = type;
    generateIdeaBtn.disabled = true;
    generateDescriptionBtn.disabled = true;
    generateTitleBtn.disabled = true;
    generateAnotherBtn.disabled = true;

    message.textContent = type === 'idea' ? 'Se generează ideile tale... 💪' :
      type === 'description' ? 'Se generează descrierea ta... 🚀' :
        'Se generează titlurile tale... 🔥';
    responseDiv.textContent = '';
    responseActions.style.display = 'none';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('http://localhost:3000/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
        body: JSON.stringify({ type, subject: subject || 'generic fitness' }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Trebuie să fii conectat pentru a genera conținut.');
        }
        throw new Error(data.error || 'Eroare la generarea răspunsului');
      }

      responseDiv.innerHTML = `${data.text}<p class="generation-date">Generat la ${new Date().toLocaleString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>`;
      responseActions.style.display = 'flex';

      const remainingRequests = response.headers.get('X-Remaining-Requests');
      if (remainingRequests !== null) {
        message.textContent = `Hei, ți-au mai rămas ${remainingRequests} cereri astăzi`;
        setTimeout(() => { message.textContent = ''; }, 5000);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (response && response.status === 429) {
        message.textContent = 'Ai atins limita zilnică de 5 cereri! Revino mâine! 😊';
      } else {
        message.textContent = 'Eroare: ' + (error.name === 'AbortError' ? 'Cererea a durat prea mult.' : error.message);
      }
      setTimeout(() => { message.textContent = ''; }, 5000);
    } finally {
      generateIdeaBtn.disabled = false;
      generateDescriptionBtn.disabled = false;
      generateTitleBtn.disabled = false;
      generateAnotherBtn.disabled = false;
    }
  }

  generateIdeaBtn.addEventListener('click', () => generatePrompt('idea'));
  generateDescriptionBtn.addEventListener('click', () => generatePrompt('description'));
  generateTitleBtn.addEventListener('click', () => generatePrompt('title'));
  generateAnotherBtn.addEventListener('click', () => lastType && generatePrompt(lastType));

  likeBtn.addEventListener('click', () => {
    message.textContent = 'Îți mulțumim pentru feedback! 😊';
    setTimeout(() => message.textContent = '', 2000);
  });

  dislikeBtn.addEventListener('click', () => {
    message.textContent = 'Ne pare rău, vom încerca să îmbunătățim! 😔';
    setTimeout(() => message.textContent = '', 2000);
  });

  copyBtn.addEventListener('click', () => {
    if (!navigator.clipboard) {
      message.textContent = 'Copierea nu este suportată în acest browser.';
      setTimeout(() => message.textContent = '', 2000);
      return;
    }
    navigator.clipboard.writeText(responseDiv.textContent)
      .then(() => {
        message.textContent = 'Răspunsul a fost copiat! 📋';
        setTimeout(() => message.textContent = '', 2000);
      })
      .catch((err) => {
        message.textContent = 'Eroare la copiere: ' + err.message;
        setTimeout(() => message.textContent = '', 2000);
      });
  });

  clearSubjectBtn.addEventListener('click', () => {
    promptSubject.value = '';
  });

  let lastScrollTop = 0;
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
      navbar.style.top = '-80px';
    } else {
      navbar.style.top = '0';
    }
    if (scrollTop > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScrollTop = scrollTop;
  });

  const animateElements = document.querySelectorAll('.feature-item');
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-on-scroll');
      } else {
        entry.target.classList.remove('animate-on-scroll');
      }
    });
  }, observerOptions);

  animateElements.forEach(element => observer.observe(element));
});