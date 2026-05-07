# NIUS HUNTER 🕵️‍♂️🕸️
**The Professional OSINT & Digital Forensic Suite for Bluesky Network Analysis**

NIUS HUNTER ist eine hochperformante Analyse-Plattform, die darauf spezialisiert ist, koordinierte Informations-Operationen, Bot-Netzwerke und Echokammern auf Bluesky sichtbar zu machen. Durch die Kombination von Graphen-Theorie, KI-gestützter Inhaltsanalyse und forensischen Heuristiken bietet NIUS HUNTER Einblicke, die weit über herkömmliche Social-Media-Monitoring-Tools hinausgehen.

---

## 💎 Core Feature Modules

### 🌐 1. Advanced Network Visualization (D3 Engine)
Das Herzstück von NIUS HUNTER ist ein hochgradig optimierter, kraftgesteuerter Graph (Force-Directed Graph).
- **Persistent D3 Transitions**: Flüssige Updates ohne Flackern dank persistenter Selektions-Patterns.
- **Ghosting-Effekt & Timeline**: Ein interaktiver Zeitstrahl ermöglicht das "Durchspulen" der Netzwerk-Entstehung. Knoten blenden sich sanft ein/aus.
- **Minimap-Navigation**: Ein Viewport-Manager für die Orientierung in komplexen Netzwerken mit hunderten von Knoten.
- **Visual Burst Tracking**: Automatische optische Hervorhebung von synchronisierten Beitritts-Clustern.

### 🧠 2. AI-Driven Narrative Intelligence (Gemini 2.5)
NIUS HUNTER nutzt modernste LLMs, um die "Seele" eines Netzwerks zu verstehen.
- **Dossier Briefing**: Sofortige Zusammenfassung der übergeordneten Strategie des Netzwerks.
- **Deep Narrative Analysis**: Deep-Scan der aktuellsten Posts der Top-Multiplikatoren zur Extraktion von:
    - **Talking Points**: Welche Kernbotschaften werden verbreitet?
    - **Intent Detection**: Was ist das Ziel (z.B. Diskreditierung, Mobilisierung)?
    - **Threat Level**: Bewertung des Radikalisierungsgrads (Low bis Critical).
- **Sleuth AI Assistant**: Ein kontextsensitiver Chat-Bot, der den Graphen "lesen" kann und Fragen zu spezifischen Clustern oder Accounts beantwortet.

### 👥 3. Community Detection & Clustering (LPA)
Automatische Segmentierung des Netzwerks in funktionale Untergruppen.
- **Label Propagation Algorithm (LPA)**: Ein schneller, unüberwachter Algorithmus zur Erkennung von Communities basierend auf Interaktionsdichte.
- **Heuristische Klassifizierung**:
    - **Core-Cluster**: Die "Hardcore-Fans" und das engste Umfeld.
    - **Automated Hubs**: Cluster mit signifikanter Bot-Dichte.
    - **Aggressive Echokammern**: Hochtoxische Teil-Netzwerke.
    - **Bridge-Accounts**: Accounts, die verschiedene Blasen miteinander verbinden.

### 🔍 4. Forensic Metrics & Bot-Detection
Mathematische Präzision statt Bauchgefühl.
- **Synchronitäts-Analyse**: Messung von zeitgleichen Reposts (Sekunden-Fenster) als Beweis für Automatisierung.
- **Suspect Score (Ratio-Check)**: Analyse des Verhältnisses von Following zu Followern und Profil-Alter.
- **Sockenpuppen-Detection**: Identifikation von Account-Farmen mit identischen Profil-Metadaten.
- **Netzwerk-Stabilität (Density)**: Misst den Grad der Isolation nach außen.

### ⏳ 5. Narrative Tracking (Time-Delta)
Überwachung der Entwicklung über längere Zeiträume.
- **Snapshot System**: Lokale Speicherung von Scans zur späteren Referenz.
- **24h/Delta-Vergleich**: Analyse von Veränderungen zwischen zwei Zeitpunkten:
    - Welche **neuen Knoten** sind hinzugekommen?
    - Wie hat sich die **Durchschnitts-Toxizität** verändert?
    - **Reichweiten-Tracking**: Zuwachs an potenzieller Brutto-Reichweite.

### 🛡️ 6. Strategic Intervention & Reporting
Vom Wissen zum Handeln.
- **Knock-out Simulation**: Visuelle Darstellung des Reichweitenverlusts bei gezielten Blockaden strategischer Hubs.
- **PDF Intelligence Dossier**: Professioneller, druckoptimierter Report für Behörden, Journalisten oder die Dokumentation.
- **Blocklist-Generator**: Export von IDs zur direkten Integration in Bluesky-Filtertools.

---

## 🛠 Technical Implementation

| Komponente | Technologie |
| :--- | :--- |
| **Frontend** | React 18, Vite |
| **Graphen** | D3.js (Force-Simulation, SVG Rendering) |
| **AI Backend** | Google Gemini 2.5 Flash API (via Server-Sent-Events Simulation) |
| **Data Source** | Bluesky AT Protocol (HTTP API) |
| **Styling** | Vanilla CSS mit Custom Design System (Cyber-Sleuth Aesthetics) |
| **Storage** | LocalStorage (für Historie und Snapshots) |

---

## 📖 Glossar der Fachbegriffe

- **Amplification Hub**: Ein Account, der primär dazu dient, Inhalte anderer massiv zu verbreiten.
- **Gateway-Node**: Ein strategisch kritischer Account, der zwei isolierte Blasen verbindet. Eine Blockade hier "zertrennt" den Informationsfluss.
- **Temporal Burst**: Ein unnatürlicher Anstieg von Netzwerk-Aktivität innerhalb eines 10-Minuten-Fensters.
- **Toxizitäts-Level**: Ein KI-basierter Wert, der den Grad an Aggression, Entmenschlichung oder Desinformation in der Sprache misst.

---

## 🚀 Installation

1. **Voraussetzung**: Node.js 18+ und ein Bluesky Account.
2. **Klonen & Installieren**:
   ```bash
   npm install
   ```
3. **API Key**: Erstelle eine `.env.local` Datei:
   ```env
   VITE_GEMINI_API_KEY="dein_schlüssel"
   ```
4. **Starten**:
   ```bash
   npm run dev
   ```

---
*Disclaimer: NIUS HUNTER ist ein Open-Source-Tool für digitale Aufklärung. Die Nutzung erfolgt auf eigene Verantwortung. Bitte respektiere die Privatsphäre und Nutzungsbedingungen der Plattformbetreiber.*
