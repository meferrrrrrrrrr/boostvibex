import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

// Configurare pentru a servi fișiere statice (ex. index.html, style.css)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// Inițializăm baza de date SQLite
const db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error('Eroare la conectarea bazei de date:', err);
  } else {
    console.log('Conectat la baza de date SQLite');
  }
});

// Creăm tabela pentru utilizatori
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL
    )
  `);
});

// Endpoint pentru înregistrare
app.post('/signup', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email-ul este obligatoriu' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Eroare server' });
    }
    if (row) {
      return res.status(400).json({ error: 'Email-ul există deja' });
    }
    db.run('INSERT INTO users (email) VALUES (?)', [email], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Eroare la înregistrare' });
      }
      res.status(200).json({ message: 'Bine ai venit! Înregistrare reușită.' });
    });
  });
});

// Pornim serverul
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server pornit pe portul ${PORT}`);
});