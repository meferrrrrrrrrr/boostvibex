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

    // Funcție pentru a genera prompt-ul și a apela API-ul OpenAI
    async function generatePrompt(type) {
        const subject = promptSubject.value.trim();
        // Validare pentru subiect
        if (subject && !/^[a-zA-Z0-9\s]+$/.test(subject)) {
            message.textContent = 'Subiectul poate conține doar litere, cifre și spații.';
            setTimeout(() => { message.textContent = ''; }, 3000);
            return;
        }

        let promptText = '';
        // Generăm prompt-ul în funcție de tip (idei sau descrieri)
        if (type === 'idea') {
            promptText = subject ? 
                `Generează 3 idei de conținut viral pentru fitness pe tema ${subject}, potrivite pentru TikTok sau Instagram Reels. Include un challenge sau exercițiu care să inspire peste 5.000 de share-uri, un titlu captivant și 1-2 hashtag-uri (ex. #FitnessChallenge).` : 
                `Generează 3 idei de conținut viral pentru fitness, potrivite pentru TikTok sau Instagram Reels. Include un challenge sau exercițiu care să inspire peste 5.000 de share-uri, un titlu captivant și 1-2 hashtag-uri (ex. #FitnessChallenge).`;
        } else if (type === 'description') {
            promptText = subject ? 
                `Scrie o descriere captivantă de maxim 150 de caractere pentru un video YouTube de fitness despre ${subject}, destinată unui public specific (ex. începători, atleți). Include 2-3 cuvinte-cheie (ex. HIIT, yoga) și un CTA (ex. ‘Începe acum!’).` : 
                `Scrie o descriere captivantă de maxim 150 de caractere pentru un video YouTube de fitness, destinată unui public specific (ex. începători, atleți). Include 2-3 cuvinte-cheie (ex. HIIT, yoga) și un CTA (ex. ‘Începe acum!’).`;
        }

       

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
        const lastType = promptDisplay.value.includes('idei') ? 'idea' : 'description';
        generatePrompt(lastType);
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
        navigator.clipboard.writeText(responseDiv.textContent).then(() => {
            message.textContent = 'Răspunsul a fost copiat! 📋';
            setTimeout(() => {
                message.textContent = '';
            }, 2000);
        });
    });
});
