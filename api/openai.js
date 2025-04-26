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
  if (typeof prompt !== 'string' || prompt.trim().length < 3 || prompt.trim().length > 500) {
    return res.status(400).json({ error: 'Prompt-ul trebuie să fie un șir de caractere între 3 și 500 de caractere' });
}

  // Adăugăm timeout pentru cerere
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secunde timeout

  try {
      // Facem cererea către OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 300 // Schimbat de la 150 la 300
          }),
          signal: controller.signal
      });

      clearTimeout(timeoutId); // Anulăm timeout-ul dacă cererea a avut succes

      const data = await response.json();

      if (!response.ok) {
          return res.status(response.status).json({ error: data.error || 'Eroare la apelarea OpenAI' });
      }
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        return res.status(500).json({ error: 'Răspunsul de la OpenAI este invalid' });
    }

      // Returnăm răspunsul generat de OpenAI
      const generatedText = data.choices[0].message.content;
      res.status(200).json({ text: generatedText });
  } catch (error) {
      clearTimeout(timeoutId);
      res.status(500).json({ 
          error: 'Eroare server: ' + (error.name === 'AbortError' ? 'Cererea a durat prea mult.' : error.message) 
      });
  }
}
