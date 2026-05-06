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

export interface DeepAnalysisResult {
  talkingPoints: string[];
  intent: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export async function analyzeDeepNarrative(rootHandle: string, nodeContent: { handle: string; posts: string[] }[]): Promise<DeepAnalysisResult> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
  if (!apiKey) throw new Error("API Key missing");

  const contentStr = nodeContent.map(nc => `Account: @${nc.handle}\nPosts:\n${nc.posts.join('\n- ')}`).join('\n\n---\n\n');

  const prompt = `
    Analysiere die folgenden Social-Media-Inhalte aus einem Netzwerk, das @${rootHandle} verstärkt.
    Hier sind die aktuellsten Posts der einflussreichsten Multiplikatoren:
    ${contentStr}

    Deine Aufgaben:
    1. Identifiziere die 3-5 wichtigsten "Talking Points" (Kernbotschaften), die in diesem Netzwerk koordiniert verbreitet werden.
    2. Bestimme die übergeordnete Absicht (Intent) dieser Operation (z.B. Diskreditierung, Mobilisierung, Ablenkung).
    3. Bewerte das Bedrohungspotenzial (Threat Level: LOW, MEDIUM, HIGH, CRITICAL) basierend auf Radikalisierung und Reichweite.

    Antworte EXKLUSIV im JSON-Format:
    {
      "talkingPoints": ["Punkt 1", "Punkt 2", ...],
      "intent": "Beschreibung des Intents...",
      "threatLevel": "HIGH"
    }
    Sprache: Deutsch.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    
    return { talkingPoints: ["Analyse fehlgeschlagen"], intent: "Unbekannt", threatLevel: "LOW" };
  } catch (err) {
    console.error(err);
    return { talkingPoints: ["Netzwerkfehler"], intent: "Fehler", threatLevel: "LOW" };
  }
}
