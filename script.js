document.addEventListener('DOMContentLoaded', () => {
    // Selectăm elementele din HTML
    const promptDisplay = document.getElementById('prompt-display');
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

    // Funcție pentru a genera prompt-ul și a simula răspunsul
    function generatePrompt(type) {
        const subject = promptSubject.value.trim();
        let promptText = '';

        // Generăm prompt-ul în funcție de tip (idei sau descrieri)
        if (type === 'idea') {
            promptText = subject ? 
                `Generează 3 idei de conținut pentru un blog despre ${subject}` : 
                'Generează 3 idei de conținut pentru un blog';
        } else if (type === 'description') {
            promptText = subject ? 
                `Scrie o descriere optimizată pentru un video YouTube despre ${subject}` : 
                'Scrie o descriere optimizată pentru un video YouTube';
        }

        // Afișăm prompt-ul în casetă
        promptDisplay.value = promptText;

        // Afișăm mesajul de loading
        message.textContent = 'Se generează ideea ta... 🚀';
        responseDiv.textContent = '';
        responseActions.style.display = 'none';

        // Simulăm un răspuns după 2 secunde
        setTimeout(() => {
            let mockResponse = '';
            if (type === 'idea') {
                mockResponse = subject ? 
                    `1. Top 10 sfaturi pentru ${subject}\n2. Cum să începi un proiect despre ${subject}\n3. Beneficiile ${subject} în viața de zi cu zi` :
                    '1. Top 10 sfaturi generale\n2. Cum să începi un proiect\n3. Beneficii generale în viața de zi cu zi';
            } else if (type === 'description') {
                mockResponse = subject ? 
                    `Descoperă cele mai bune strategii pentru ${subject} în acest video! Abonează-te pentru mai multe sfaturi utile.` :
                    'Descoperă strategii utile în acest video! Abonează-te pentru mai mult conținut.';
            }

            // Afișăm răspunsul
            message.textContent = '';
            responseDiv.textContent = mockResponse;
            responseActions.style.display = 'flex';
        }, 2000);
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
