# NIUS HUNTER 🕵️‍♂️🕸️
**The Professional OSINT & Digital Forensic Suite for Bluesky Network Analysis**

NIUS HUNTER ist eine hochperformante, quelloffene Analyse-Plattform zur Identifizierung koordinierter inauthentischer Verhaltensweisen (CIB), Bot-Netzwerken und digitaler Astroturfing-Kampagnen auf Bluesky. Durch die Kombination von Graphen-Theorie, KI-gestützter Narrativ-Extraktion und forensischen Heuristiken macht NIUS HUNTER verdeckte Operationen sichtbar.

---

## 💎 Das Bento Box Dashboard
Seit Version 2.0 nutzt NIUS HUNTER ein modulares **Bento Box Design**, das alle kritischen Datenpunkte in einem funktionalen Grid zusammenfasst:

1.  **KPI-Statusleiste**: Echtzeit-Metriken für Bot-Dichte, durchschnittlichen Suspect-Score, Netzwerk-Stabilität und Brutto-Reichweite.
2.  **Intelligence Hub (Links)**: Strategisches Zentrum mit Community-Erkennung, KI-Dossier-Briefing und Interventions-Simulation.
3.  **Network Visualizer (Mitte)**: Hochoptimierter D3-Graph mit zeitlicher Analyse-Funktion und interaktivem Ghosting-Effekt.
4.  **Forensic Lab (Rechts)**: Detaillierte Auflistung von Anomalien, Top-Multiplikatoren und Metadaten-Fingerprinting.

---

## 🔍 Forensische Methodik & Berechnungsgrundlagen
NIUS HUNTER setzt auf maximale Transparenz. Hier sind die mathematischen Grundlagen unserer Analyse-Engine:

### 1. Suspect Score (S) - Algorithmische Gewichtung
Jeder Account wird anhand eines 100-Punkte-Systems bewertet. Der Score summiert sich aus folgenden Heuristiken:
*   **Konto-Alter (+40 Pkt)**: Accounts, die jünger als 30 Tage sind, erhalten eine signifikante Gewichtung.
*   **Handle-Entropie (+40 Pkt)**: "Vowel Poverty" (Vokalarmut) und generische Ziffern-Suffixe (z.B. `@user12345678`) deuten auf automatisierte Erstellung hin.
*   **Follow-Ratio (+25 Pkt)**: Ein extrem niedriges Verhältnis von Followern zu gefolgten Accounts ( < 2%) ist typisch für "Amplifier Bots".
*   **Profil-Vakuum (+20 Pkt)**: Fehlende Avatare, extrem kurze Bios oder weniger als 3 eigene Posts.
*   **PDS-Anomalie (+15 Pkt)**: Hosting auf untypischen Personal Data Servern außerhalb der Bluesky-Standard-Infrastruktur.

### 2. Koordinations-Index & Synchronität
Wir messen die zeitliche Korrelation von Reposts. 
*   **Burst-Fenster**: Wenn > 5 Accounts innerhalb von 60 Sekunden den gleichen Inhalt teilen, wird dies als "Coordinated Burst" markiert.
*   **Jaccard-Ähnlichkeit**: Zur Erkennung von Sockenpuppen vergleichen wir die Mengen der Follower und gefolgten Accounts. Eine Ähnlichkeit von > 0.8 deutet auf identisch gesteuerte Accounts hin.

### 3. Bot-Dichte (D)
Die Bot-Dichte des Netzwerks berechnet sich als:
`D = (Anzahl Accounts mit S > 65) / (Gesamtanzahl Knoten) * 100`

### 4. Netzwerk-Stabilität (Graph Density)
Misst die Kohärenz der Echokammer. Ein hoher Wert bedeutet, dass das Netzwerk extrem isoliert ist und Informationen fast ausschließlich intern zirkulieren, was Radikalisierung begünstigt.

---

## 🛠 Technischer Stack
*   **Frontend**: React 19, Vite 6, TypeScript.
*   **Visualisierung**: D3.js (Force-Simulation mit SVG-Rendering).
*   **KI-Engine**: Google Gemini 2.0 (Dossier-Erstellung & Toxizitäts-Scan).
*   **Protokoll**: AT Protocol (@atproto/api) zur direkten Kommunikation mit den Bluesky-Relays.
*   **Styling**: Vanilla CSS mit CSS-Variablen für das Cyber-Sleuth Design System.

---

## 🚀 Installation & Setup

1.  **Repository klonen**:
    ```bash
    git clone https://github.com/dein-repo/nius-hunter.git
    cd nius-hunter
    ```
2.  **Abhängigkeiten installieren**:
    ```bash
    npm install
    ```
3.  **Umgebungsvariablen**: Erstelle eine `.env.local` und füge deinen Gemini API Key hinzu:
    ```env
    VITE_GEMINI_API_KEY=DEIN_KEY_HIER
    ```
4.  **Entwicklungs-Server starten**:
    ```bash
    npm run dev
    ```

---

## ⚖️ Lizenz (GPL v3)

NIUS HUNTER ist freie Software: Sie können sie unter den Bedingungen der **GNU General Public License**, wie von der Free Software Foundation veröffentlicht, weitergeben und/oder modifizieren; entweder gemäß Version 3 der Lizenz oder (nach Ihrer Option) jeder späteren Version.

Die Veröffentlichung dieses Programms erfolgt in der Hoffnung, dass es von Nutzen sein wird, aber OHNE IRGENDEINE GARANTIE; sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN BESTIMMTEN ZWECK. Details finden Sie in der GNU General Public License.

---
*Disclaimer: NIUS HUNTER ist ein Werkzeug für OSINT-Experten und Journalisten. Bitte verwenden Sie es verantwortungsbewusst und im Einklang mit den Community-Richtlinien von Bluesky.*
