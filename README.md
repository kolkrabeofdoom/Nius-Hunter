# NIUS HUNTER 🕵️‍♂️🕸️

**NIUS HUNTER** ist ein Analyse-Tool für Bluesky, das darauf spezialisiert ist, Kommunikationsnetzwerke und Verstärkungswege (Amplification) zu visualisieren. Es hilft dabei, Echokammern zu identifizieren und gibt konkrete Empfehlungen, wie diese Netzwerke durchtrennt werden können.

![GHBanner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🎯 Kernfunktionen

- **Netzwerk-Visualisierung**: Interaktive Graph-Darstellung von Accounts und deren Verbindungen auf Bluesky.
- **Multiplikator-Analyse**: Identifikation von Accounts, die Inhalte besonders stark verbreiten (Amplifier).
- **Tiefenanalyse (Deep Scan)**: Detaillierte Untersuchung von Follower-Strukturen und Post-Interaktionen.
- **Interventions-Logik**: Automatische Vorschläge, welche "Knotenpunkte" (Accounts) blockiert oder isoliert werden sollten, um Informationsblasen zu zertrennen.
- **Export-Funktion**: Erstellung von Filter-Sets (Blocklisten) als `.txt`-Datei für die Nutzung in Bluesky-Tools.

## 🚀 Installation & Lokaler Start

### Voraussetzungen

- [Node.js](https://nodejs.org/) (aktuelle LTS Version empfohlen)
- Ein [Gemini API Key](https://aistudio.google.com/app/apikey) (für die KI-gestützte Analyse)

### Schritte

1. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren**:
   Erstelle eine Datei namens `.env.local` im Hauptverzeichnis und füge deinen Gemini API Key hinzu:
   ```env
   GEMINI_API_KEY="DEIN_API_KEY_HIER"
   ```

3. **Entwicklungs-Server starten**:
   ```bash
   npm run dev
   ```
   Die App ist nun unter `http://localhost:3000` erreichbar.

## 🛠 Technologien

- **Framework**: [React](https://reactjs.org/) mit [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Visualisierung**: [D3.js](https://d3js.org/) / React-basierte Graph-Komponenten
- **Icons**: [Lucide React](https://lucide.dev/)
- **KI**: [Google Gemini API](https://ai.google.dev/)

## 📄 Lizenz

Dieses Projekt ist für die Analyse von Desinformations-Netzwerken und Echokammern gedacht. Bitte beachte die Nutzungsbedingungen der Bluesky API.

---
*Erstellt für eine transparentere Kommunikation im Social Web.*
