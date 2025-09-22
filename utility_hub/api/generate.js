// This function will run on a secure server, not in the user's browser.
export default async function handler(req, res) {
  // We only want to handle POST requests to this endpoint.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1. SECURELY GET THE API KEY
  // This line reads the secret API key from the hosting environment's variables.
  // The key is never exposed to the public.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  // 2. GET THE USER'S PROMPT
  // Extract the 'prompt' that the front-end sent in its request.
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is missing from the request." });
  }

  // 3. CALL THE GEMINI API
  // This is the official URL for the Gemini API.
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    // We send the user's prompt to the Gemini API.
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      // If Google's server responds with an error, we forward it.
      const errorDetails = await response.json();
      console.error("Gemini API Error:", errorDetails);
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // 4. SEND THE RESPONSE BACK TO THE FRONT-END
    // The AI's response is sent back to the index.html page to be displayed.
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to call the Gemini API." });
  }
}

