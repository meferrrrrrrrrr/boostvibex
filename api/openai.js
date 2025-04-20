export default async function handler(req, res) {
    // Verificăm dacă cererea este de tip POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Metoda trebuie să fie POST' });
    }
  
    const { prompt } = req.body;
  
    // Validăm că prompt-ul există
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt-ul lipsește' });
    }
  
    // Deocamdată, returnăm un mesaj simplu
    res.status(200).json({ text: 'Acesta este un test. Ruta API funcționează!' });
  }
