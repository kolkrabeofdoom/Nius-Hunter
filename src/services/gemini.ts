export interface AnalysisResult {
  summary: string;
  toxicNodes: Record<string, number>; // handle -> toxicity (0-100)
}

export async function analyzeNetwork(rootHandle: string, topNodes: any[]): Promise<AnalysisResult> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
  
  if (!apiKey) {
    return { summary: "Gemini API Key fehlt. Bitte in .env.local konfigurieren.", toxicNodes: {} };
  }

  const profiles = topNodes.map(n => `Handle: @${n.handle}, Name: ${n.displayName || 'N/A'}, Bio: ${n.description || 'N/A'}`).join('\n');

  const prompt = `
    Analysiere dieses Netzwerk von Bluesky-Accounts, die den Account @${rootHandle} verstärken (Amplification).
    Hier sind die Profile der Top-Multiplikatoren im Netzwerk:
    ${profiles}

    Deine Aufgaben:
    1. Erstelle eine kurze, düstere, detektivische Zusammenfassung (max. 3 Sätze) über die wahrscheinliche Narrative oder das Ziel dieses Netzwerks (z.B. politische Polarisierung, Desinformation, Echokammer-Bildung). Sprache: Deutsch.
    2. Bewerte die "Toxizität" (Grad der Aggressivität, Polarisierung oder Verbreitung von Desinformation) jedes dieser Accounts auf einer Skala von 0 bis 100.
    
    Antworte EXKLUSIV im JSON-Format:
    {
      "summary": "Deine Zusammenfassung hier...",
      "toxicity": {
        "handle_ohne_at": 85,
        "anderer_handle": 20
      }
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    
    if (response.status === 503) {
      return { summary: "Das Analyse-Modul ist aktuell überlastet (High Demand). Bitte versuche es in Kürze erneut.", toxicNodes: {} };
    }

    if (result.error) {
      console.error("Gemini API Error:", result.error);
      return { summary: `KI-Fehler: ${result.error.message}`, toxicNodes: {} };
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        summary: data.summary,
        toxicNodes: data.toxicity || {}
      };
    }
    console.warn("Could not parse JSON from Gemini response:", text);
    return { summary: "Das Netzwerk-Dossier konnte nicht korrekt generiert werden. (Formatfehler)", toxicNodes: {} };
  } catch (err) {
    console.error("Gemini analysis failed", err);
    return { summary: "Verbindung zum Analyse-Modul unterbrochen. (Netzwerkfehler)", toxicNodes: {} };
  }
}
