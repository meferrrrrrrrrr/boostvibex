import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

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

// Configurare pentru a servi fișiere statice din rădăcină (pentru style.css, images)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname)); // Servește fișiere din rădăcină (style.css, images)
app.use(express.static(path.join(__dirname, 'public'))); // Servește fișiere din public (privacy.html, etc.)

// Adaugă rute explicite pentru fișiere statice
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/under-construction', (req, res) => res.sendFile(path.join(__dirname, 'public', 'under-construction.html')));

// Conectare la SQLite
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
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

// Funcție helper pentru a face query-uri SQLite cu promisiuni
const dbGet = (query, params) => new Promise((resolve, reject) => {
  db.get(query, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const dbRun = (query, params) => new Promise((resolve, reject) => {
  db.run(query, params, function(err) {
    if (err) reject(err);
    else resolve(this);
  });
});

// Endpoint pentru înregistrare
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email-ul este obligatoriu' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Parola este obligatorie' });
  }
  if (password.length < 12) {
    return res.status(400).json({ error: 'Parola trebuie să aibă minim 12 caractere' });
  }

  try {
    // Verificăm dacă email-ul există deja
    const existingUser = await dbGet('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email-ul există deja' });
    }

    // Criptăm parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserăm utilizatorul nou
    await dbRun('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    req.session.user = { email }; // Setăm utilizatorul curent
    res.status(200).json({ message: 'Bine ai venit! Înregistrare reușită.' });
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    res.status(500).json({ error: 'Eroare la server' });
  }
});

// Endpoint pentru conectare
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email-ul este obligatoriu' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Parola este obligatorie' });
  }

  try {
    // Verificăm dacă email-ul există
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Email-ul nu este înregistrat' });
    }

    // Verificăm parola
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Parola este incorectă' });
    }

    req.session.user = { email }; // Setăm utilizatorul curent
    res.status(200).json({ message: 'Conectare reușită!' });
  } catch (error) {
    console.error('Eroare la conectare:', error);
    res.status(500).json({ error: 'Eroare la server' });
  }
});

// Endpoint pentru resetare parolă (cerere cod)
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email-ul este obligatoriu' });
  }

  try {
    // Verificăm dacă email-ul există
    const user = await dbGet('SELECT email FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Email-ul nu este înregistrat' });
    }

    // Generăm un cod de resetare (6 cifre random)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocăm codul în sesiune legat de email (simulare temporară)
    req.session.resetCodes = req.session.resetCodes || {};
    req.session.resetCodes[email] = resetCode;

    // Mesaj de succes (în realitate, am trimite codul prin email)
    res.status(200).json({ message: 'Un cod de resetare a fost generat. Verifică-ți email-ul (simulat). Codul este: ' + resetCode });
  } catch (error) {
    console.error('Eroare la resetare parolă:', error);
    res.status(500).json({ error: 'Eroare la server' });
  }
});

// Endpoint pentru resetare parolă (verificare cod și actualizare)
app.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Toate câmpurile (email, cod de resetare, parolă nouă) sunt obligatorii' });
  }
  if (newPassword.length < 12) {
    return res.status(400).json({ error: 'Parola nouă trebuie să aibă minim 12 caractere' });
  }

  try {
    // Verificăm dacă email-ul există
    const user = await dbGet('SELECT email FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Email-ul nu este înregistrat' });
    }

    // Verificăm dacă există un cod de resetare valid în sesiune
    req.session.resetCodes = req.session.resetCodes || {};
    const storedCode = req.session.resetCodes[email];
    if (!storedCode || storedCode !== resetCode) {
      return res.status(400).json({ error: 'Codul de resetare este invalid sau a expirat' });
    }

    // Criptăm noua parolă
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizăm parola în baza de date
    await dbRun('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Ștergem codul de resetare din sesiune după utilizare
    delete req.session.resetCodes[email];

    res.status(200).json({ message: 'Parola a fost resetată cu succes!' });
  } catch (error) {
    console.error('Eroare la resetare parolă:', error);
    res.status(500).json({ error: 'Eroare la server' });
  }
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