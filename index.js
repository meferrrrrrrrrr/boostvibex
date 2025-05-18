import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import dotenv from 'dotenv';

// Încarcă variabilele din .env
dotenv.config();

const app = express();
app.use(express.json());

// Configurare pentru Vercel (trust proxy)
app.set('trust proxy', 1);

// Configurare sesiuni
app.use(session({
  secret: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Configurare pentru a servi fișiere statice
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '.')));

// Comentăm SQLite temporar
/*
const db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error('Eroare la conectarea bazei de date:', err);
  } else {
    console.log('Conectat la baza de date SQLite');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL
    )
  `);
});
*/

// Endpoint pentru înregistrare (fără SQLite)
app.post('/signup', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email-ul este obligatoriu' });
  }
  // Verificăm dacă email-ul e deja în sesiune (simplu, pentru testare)
  if (req.session.users && req.session.users.includes(email)) {
    return res.status(400).json({ error: 'Email-ul există deja' });
  }
  // Inițializăm array-ul users dacă nu există
  if (!req.session.users) {
    req.session.users = [];
  }
  req.session.users.push(email);
  req.session.user = { email }; // Setăm utilizatorul curent
  res.status(200).json({ message: 'Bine ai venit! Înregistrare reușită.' });
});

// Endpoint pentru conectare (fără SQLite)
app.post('/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email-ul este obligatoriu' });
  }
  // Verificăm dacă email-ul e în sesiune
  if (!req.session.users || !req.session.users.includes(email)) {
    return res.status(400).json({ error: 'Email-ul nu este înregistrat' });
  }
  req.session.user = { email }; // Setăm utilizatorul curent
  res.status(200).json({ message: 'Conectare reușită!' });
});

// Endpoint pentru OpenAI (doar pentru utilizatori conectați)
app.post('/api/openai', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Trebuie să fii conectat pentru a genera conținut.' });
  }

  const { type, subject } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Tipul de conținut este obligatoriu.' });
  }

  let prompt;
  switch (type) {
    case 'idea':
      prompt = `Generează o idee simplă de antrenament fitness pentru un utilizator de nivel mediu, care poate fi făcută acasă. Subiect: ${subject || 'generic fitness'}.`;
      break;
    case 'description':
      prompt = `Scrie o descriere optimizată pentru Instagram despre un antrenament de 15 minute, care să atragă atenția. Subiect: ${subject || 'generic fitness'}.`;
      break;
    case 'title':
      prompt = `Creează un titlu atractiv și viral pentru un videoclip de fitness, care să încurajeze click-urile. Subiect: ${subject || 'generic fitness'}.`;
      break;
    default:
      return res.status(400).json({ error: 'Tip de conținut invalid.' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Cheia API OpenAI nu este setată.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Eroare la apelul API.' });
    }

    res.status(200).json({ text: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Eroare OpenAI:', error.message);
    res.status(500).json({ error: 'Nu s-a putut genera conținutul.' });
  }
});

// Endpoint pentru logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Eroare la deconectare' });
    }
    res.status(200).json({ message: 'Deconectare reușită!' });
  });
});

// Rută explicită pentru a servi index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Pornim serverul
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server pornit pe portul ${PORT}`);
});