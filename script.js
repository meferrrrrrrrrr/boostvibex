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

  let lastType = ''; // Variabilă globală pentru a stoca tipul prompt-ului

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
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data);
      confirmationMessage.style.display = 'block';

      if (response.ok) {
        confirmationMessage.textContent = data.message || 'Bine ai venit! Înregistrare reușită.';
        confirmationMessage.style.color = 'green';
        emailInput.value = '';
        interactiveSection.style.display = 'block';
      } else {
        confirmationMessage.textContent = data.error || 'Eroare la înregistrare.';
        confirmationMessage.style.color = 'red';
      }
    } catch (error) {
      console.log("Eroare fetch:", error);
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
      loginMessage.style.display = 'none';
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
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();
      console.log("Răspuns API:", data);
      loginMessage.style.display = 'block';

      if (response.ok) {
        loginMessage.textContent = data.message || 'Conectare reușită!';
        loginMessage.style.color = 'green';
        loginEmailInput.value = '';
        interactiveSection.style.display = 'block';
      } else {
        loginMessage.textContent = data.error || 'Eroare la conectare.';
        loginMessage.style.color = 'red';
      }
    } catch (error) {
      console.log("Eroare fetch:", error);
      loginMessage.style.display = 'block';
      loginMessage.style.color = 'red';
      loginMessage.textContent = `Eroare: ${error.message || 'Nu s-a putut conecta la server.'}`;
    }
  });

  // Funcție pentru generarea prompt-ului
  async function generatePrompt(type) {
    const subject = promptSubject.value.trim();

    // Validare pentru subiect
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
    // Dezactivăm butoanele și arătăm mesajul de loading
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
          // Trimitem cookie-urile pentru a păstra sesiunea
          'Cookie': document.cookie,
        },
        credentials: 'include', // Asigurăm că sesiunea e inclusă
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

  // Evenimente pentru butoane
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

  // Logica pentru animarea navbar-ului
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

  // Logica pentru animarea elementelor
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