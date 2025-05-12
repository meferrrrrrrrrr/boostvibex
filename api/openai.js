import { RateLimiterMemory } from 'rate-limiter-flexible';
import { franc } from 'franc';

// Funcție pentru sanitizarea inputului (previne XSS)
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&/g, '&amp;');
}

// Funcție pentru verificarea conținutului sensibil
function hasSensitiveContent(input) {
  const sensitiveWords = ['fuck', 'shit', 'damn', 'bitch'];
  const lowerInput = input.toLowerCase();
  return sensitiveWords.some(word => lowerInput.includes(word));
}

// Funcție pentru detectarea limbii subiectului
function detectLanguage(subject) {
  const detectedLang = franc(subject, { whitelist: ['ron', 'eng'] }); // ron = română, eng = engleză
  // Verificăm caractere românești și cuvinte-cheie pentru română
  const hasRomanianChars = /[ăîșțâĂÎȘȚÂ]/.test(subject);
  const hasRomanianWords = /antrenament|brat|exercitiu|muschi|antrenor/i.test(subject.toLowerCase());
  if (hasRomanianChars || (hasRomanianWords && detectedLang !== 'eng')) {
    return 'romanian';
  }
  // Verificăm cuvinte specifice pentru engleză
  const hasEnglishWords = /workout|legs|abs|gym/i.test(subject.toLowerCase());
  if (hasEnglishWords && detectedLang !== 'ron') {
    return 'english';
  }
  // Caz ambiguu (ex. "fitness") → implicit română
  return 'romanian';
}

// Inițializăm rate limiter-ul: 5 cereri pe zi per IP
const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 86400, // 24 ore
});

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Verificăm limita de cereri
  try {
    await rateLimiter.consume(ip);
    const remainingRequests = await rateLimiter.get(ip);
    res.setHeader('X-Remaining-Requests', remainingRequests.remainingPoints);
  } catch (rateLimiterError) {
    res.setHeader('Retry-After', 86400);
    return res.status(429).json({ error: 'Prea multe cereri. Revino mâine! 😊' });
  }

  // Validăm metoda
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda trebuie să fie POST' });
  }

  let { type, subject } = req.body;

  // Validăm tipul și subiectul
  if (!type || !['idea', 'description', 'title'].includes(type)) {
    return res.status(400).json({ error: 'Tipul trebuie să fie "idea", "description" sau "title"' });
  }
  if (!subject || typeof subject !== 'string') {
    return res.status(400).json({ error: 'Subiectul lipsește sau nu este un șir de caractere' });
  }

  // Verificăm conținut sensibil
  if (hasSensitiveContent(subject)) {
    return res.status(400).json({ error: 'Subiectul conține limbaj nepotrivit.' });
  }

  // Sanitizăm subiectul
  subject = sanitizeInput(subject);

  // Validăm lungimea subiectului
  if (subject.trim().length < 3 || subject.trim().length > 200) {
    return res.status(400).json({ error: 'Subiectul trebuie să fie între 3 și 200 caractere' });
  }

  // Detectăm limba subiectului
  const language = detectLanguage(subject);
  const languageInstruction = language === 'romanian' ? 'Răspunde în limba română.' : 'Răspunde în limba engleză.';

  // Construim prompt-ul dinamic
  let promptText = `Ești un expert în fitness și antrenamente, specializat în conținut viral pentru Instagram și TikTok. Folosește un ton motivant cu jargon și hashtaguri. Răspunde doar cu conținut legat de fitness și antrenamente, bazat pe subiectul dat. ${languageInstruction}`;

  if (type === 'idea') {
    promptText += subject
      ? ` Dă-mi între 3 și 5 idei de conținut pentru fitness pe tema "${subject}", potrivite pentru TikTok sau Instagram.`
      : ` Dă-mi între 3 și 5 idei de conținut pentru fitness, potrivite pentru TikTok sau Instagram.`;
  } else if (type === 'description') {
    promptText += subject
      ? ` Scrie o descriere motivantă de maxim 200 caractere pentru un video de fitness despre "${subject}".`
      : ` Scrie o descriere motivantă de maxim 200 caractere pentru un video de fitness generic.`;
  } else if (type === 'title') {
    promptText += subject
      ? ` Dă-mi între 3 și 5 titluri catchy de maxim 60 caractere pentru un video de fitness despre "${subject}", potrivite pentru TikTok sau Instagram.`
      : ` Dă-mi între 3 și 5 titluri catchy de maxim 60 caractere pentru un video de fitness generic, potrivite pentru TikTok sau Instagram.`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Eroare la apelarea OpenAI');
    }
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      return res.status(500).json({ error: 'Răspunsul de la OpenAI este invalid' });
    }

    const generatedText = data.choices[0].message.content;
    res.status(200).json({ text: generatedText });
  } catch (error) {
    clearTimeout(timeoutId);
    res.status(500).json({
      error: 'Eroare server: ' + (error.name === 'AbortError' ? 'Cererea a durat prea mult.' : error.message),
    });
  }
}