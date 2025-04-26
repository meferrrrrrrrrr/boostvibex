document.addEventListener('DOMContentLoaded', () => {
    // Selectăm elementele din HTML
    const promptSubject = document.getElementById('prompt-subject');
    const generateIdeaBtn = document.getElementById('generate-idea');
    const generateDescriptionBtn = document.getElementById('generate-description');
    const message = document.getElementById('message');
    const responseDiv = document.getElementById('response');
    const responseActions = document.querySelector('.response-actions');
    const generateAnotherBtn = document.getElementById('generate-another');
    const likeBtn = document.getElementById('like');
    const dislikeBtn = document.getElementById('dislike');
    const copyBtn = document.getElementById('copy-response');
    let lastType = ''; // Variabilă globală pentru a stoca tipul prompt-ului

    // Funcție pentru a genera prompt-ul și a apela API-ul OpenAI
    async function generatePrompt(type) {
        const subject = document.getElementById('prompt-subject').value.trim();

        // Validare pentru subiect
        if (subject && !/^[a-zA-Z0-9ăîâșțĂÎÂȘȚ\s]+$/.test(subject)) {
            message.textContent = 'Subiectul poate conține doar litere, cifre și spații.';
            setTimeout(() => { message.textContent = ''; }, 3000);
            return;
        }
        if (subject && (subject.trim().length < 3 || subject.trim().length > 200)) {
            message.textContent = 'Subiectul trebuie să aibă între 3 și 200 de caractere.';
            setTimeout(() => { message.textContent = ''; }, 3000);
            return;
        }

        let promptText = '';
        // Generăm prompt-ul în funcție de tip (idei sau descrieri)
        if (type === 'idea') {
            promptText = subject ?
                `Dă-mi 3 idei simple de conținut pentru fitness pe tema ${subject}, care să atragă atenția pe TikTok, Instagram sau YouTube.` :
                `Dă-mi 3 idei simple de conținut pentru fitness, care să atragă atenția pe TikTok, Instagram sau YouTube.`;
        } else if (type === 'description') {
            promptText = subject ?
                `Scrie o descriere scurtă de maxim 150 de caractere pentru un video de fitness despre ${subject}, care să motiveze urmăritorii.` :
                `Scrie o descriere scurtă de maxim 150 de caractere pentru un video de fitness, care să motiveze urmăritorii.`;
        }

        lastType = type; // Stocăm tipul prompt-ului

        // Afișăm mesajul de loading
        message.textContent = 'Se generează ideea ta... 🚀';
        responseDiv.textContent = '';
        responseActions.style.display = 'none';

        // Adăugăm timeout pentru cerere
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secunde timeout

        try {
            // Facem cererea către ruta /api/openai
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: promptText }),
                signal: controller.signal
            });

            clearTimeout(timeoutId); // Anulăm timeout-ul dacă cererea a avut succes

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Eroare la generarea răspunsului');
            }

            // Afișăm răspunsul primit de la OpenAI
            message.textContent = '';
            responseDiv.textContent = data.text;
            responseActions.style.display = 'flex';
        } catch (error) {
            clearTimeout(timeoutId);
            message.textContent = 'Eroare: ' + (error.name === 'AbortError' ? 'Cererea a durat prea mult.' : error.message);
            setTimeout(() => {
                message.textContent = '';
            }, 3000);
        }
    }

    // Adăugăm event listener pentru butonul "Idei de conținut"
    generateIdeaBtn.addEventListener('click', () => {
        generatePrompt('idea');
    });

    // Adăugăm event listener pentru butonul "Descrieri optimizate"
    generateDescriptionBtn.addEventListener('click', () => {
        generatePrompt('description');
    });

    // Adăugăm event listener pentru "Generează alt răspuns"
    generateAnotherBtn.addEventListener('click', () => {
        if (lastType) {
            generatePrompt(lastType); // Folosim tipul stocat
        }
    });

    // Adăugăm event listener pentru "Like"
    likeBtn.addEventListener('click', () => {
        message.textContent = 'Îți mulțumim pentru feedback! 😊';
        setTimeout(() => {
            message.textContent = '';
        }, 2000);
    });

    // Adăugăm event listener pentru "Dislike"
    dislikeBtn.addEventListener('click', () => {
        message.textContent = 'Ne pare rău, vom încerca să îmbunătățim! 😔';
        setTimeout(() => {
            message.textContent = '';
        }, 2000);
    });

    // Adăugăm event listener pentru "Copiază răspunsul"
    copyBtn.addEventListener('click', () => {
        if (!navigator.clipboard) {
            message.textContent = 'Copierea nu este suportată în acest browser.';
            setTimeout(() => {
                message.textContent = '';
            }, 2000);
            return;
        }
        navigator.clipboard.writeText(responseDiv.textContent)
            .then(() => {
                message.textContent = 'Răspunsul a fost copiat! 📋';
                setTimeout(() => {
                    message.textContent = '';
                }, 2000);
            })
            .catch((err) => {
                message.textContent = 'Eroare la copiere: ' + err.message;
                setTimeout(() => {
                    message.textContent = '';
                }, 2000);
            });
    });

    // Navbar scroll effect
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

    // Animation on scroll
    const animateElements = document.querySelectorAll('.feature-item');
    const observerOptions = {
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
            } else {
                entry.target.classList.remove('animate-on-scroll');
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        observer.observe(element);
    });
});