import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GraphData, GraphNode, fetchAmplifications, fetchRecentPosts } from './services/bsky';
import { analyzeNetwork, analyzeDeepNarrative, DeepAnalysisResult, askSleuthAssistant } from './services/gemini';
import { calculateCentrality } from './utils/analysis';
import { runForensics, ForensicsResults } from './utils/forensics';
import { saveScanToHistory, getHistory, compareScans, ScanComparison, ScanHistoryEntry } from './utils/history';
import { detectCommunities, Community } from './utils/communities';

// Components
import Header from './components/Header';
import SettingsDropdown from './components/SettingsDropdown';
import BriefingBanner from './components/BriefingBanner';
import NetworkView from './components/NetworkView';
import Sidebar from './components/Sidebar/Sidebar';
import ChatAssistant from './components/ChatAssistant';
import HelpOverlay from './components/HelpOverlay';

export default function App() {
  const [handleInput, setHandleInput] = useState('niusde.bsky.social');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // Settings & Analysis State
  const [isDeepScan, setIsDeepScan] = useState(false);
  const [minWeight, setMinWeight] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [narrativeSummary, setNarrativeSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [bridgeNodes, setBridgeNodes] = useState<string[]>([]);
  const [timelineRange, setTimelineRange] = useState<{ min: number; max: number } | null>(null);
  const [blockedNodeIds, setBlockedNodeIds] = useState<string[]>([]);
  const [forensics, setForensics] = useState<ForensicsResults | null>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);
  const [comparison, setComparison] = useState<ScanComparison | null>(null);
  const [previousScan, setPreviousScan] = useState<ScanHistoryEntry | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  
  // Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Help State
  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  const helpContent: Record<string, { title: string; body: string; impact: string }> = {
    multipliers: {
      title: "Top Multiplikatoren",
      body: "Diese Accounts sind die 'Megafone' des Netzwerks. Sie haben die höchste Gewichtung basierend auf der Häufigkeit und Geschwindigkeit, mit der sie Inhalte des Ziel-Accounts teilen.",
      impact: "Hoher Einfluss auf die Sichtbarkeit in den Feeds unbeteiligter Dritter."
    },
    forensics: {
      title: "Forensik-Scan Metriken",
      body: "Eine mathematische Analyse der Netzwerkstruktur. Wir messen hier Koordination (zeitgleiches Posten), Bot-Wahrscheinlichkeit und die algorithmische Dichte des Graphen.",
      impact: "Dient zur Identifizierung von künstlich aufgeblähter Reichweite (Astroturfing)."
    },
    bot_density: {
      title: "Bot-Dichte",
      body: "Analyse von Account-Metadaten: Alter des Profils, Handle-Struktur (Zufallszahlen) und Interaktionsfrequenz. Ein hoher Wert deutet auf eine automatisierte Kampagne hin.",
      impact: "Manipulation der 'Trending'-Algorithmen durch Masse statt Klasse."
    },
    stability: {
      title: "Netz-Stabilität (Density)",
      body: "Misst, wie stark die Follower untereinander vernetzt sind. In einer stabilen Echokammer folgen sich fast alle gegenseitig, was Informationen isoliert und radikalisiert.",
      impact: "Erschwert den Einbruch von Fakten von außerhalb des Netzwerks."
    },
    toxicity: {
      title: "Ø Toxizität",
      body: "KI-gestützte Bewertung der Sprache. Wir suchen nach aggressiven Narrativen, Entmenschlichung oder gezielter Desinformation.",
      impact: "Führt zu einer Vergiftung des öffentlichen Diskurses und Einschüchterung von Kritikern."
    },
    intervention: {
      title: "Gegenmaßnahmen & Simulation",
      body: "Hier berechnen wir den 'Knock-out' Effekt. Wenn du einen strategischen Knotenpunkt (Gateway) blockierst, verliert das restliche Netzwerk massiv an Kohärenz.",
      impact: "Effektivste Methode zur Zerschlagung von Desinformations-Clustern."
    },
    reach: {
      title: "Brutto-Reichweite",
      body: "Die Summe aller Follower der im Netzwerk identifizierten Accounts. Dies zeigt das theoretische Maximum der Personen, die durch diese Kampagne erreicht werden können.",
      impact: "Hilft bei der Einschätzung der realen Relevanz einer Operation."
    },
    sources: {
      title: "Top Quellen (Domains)",
      body: "Analyse der geteilten Links. Hier siehst du, welche Webseiten oder Plattformen am häufigsten von diesem Netzwerk beworben werden.",
      impact: "Identifiziert die Infrastruktur hinter der Erzählung."
    },
    sockpuppets: {
      title: "Sockenpuppen-Cluster",
      body: "Gruppen von Accounts, die fast identische Profiltexte oder Verhaltensmuster aufweisen. Oft ein Zeichen für professionell betriebene Account-Farmen.",
      impact: "Beweis für künstliche Inhalts-Verstärkung."
    },
    coordination: {
      title: "Synchronisierte Koordination",
      body: "Accounts, die innerhalb extrem kurzer Zeitfenster (Sekunden/Minuten) die gleichen Inhalte teilen. Menschliches Verhalten ist selten so präzise synchronisiert.",
      impact: "Starkes Indiz für automatisierte oder zentral gesteuerte Kampagnen."
    },
    suspect_score: {
      title: "Ø Suspect Score (Ratio)",
      body: "Berechnet das Verhältnis von gefolgten Accounts zu eigenen Followern. Ein extrem hohes Verhältnis (z.B. folgt 5000, hat 2 Follower) ist typisch für 'Amplifier-Bots'.",
      impact: "Identifiziert Accounts, die nur existieren, um Reichweite für andere zu generieren."
    },
    bursts: {
      title: "Aktivitäts-Bursts",
      body: "Identifiziert Zeitfenster von 10 Minuten, in denen ungewöhnlich viele neue Accounts dem Netzwerk beitreten oder aktiv werden. Dies deutet auf einen koordinierten Angriff hin.",
      impact: "Ermöglicht die Rekonstruktion des zeitlichen Ablaufs einer Desinformations-Kampagne."
    },
    comparison: {
      title: "Zeitlicher Vergleich",
      body: "Vergleicht den aktuellen Scan mit einem gespeicherten Snapshot. Wir analysieren das Wachstum der Knoten, die Veränderung der Toxizität und die Reichweiten-Entwicklung.",
      impact: "Zeigt die Dynamik und Geschwindigkeit einer Kampagne über die Zeit."
    },
    communities: {
      title: "Community Detection",
      body: "Nutzt den Label Propagation Algorithmus, um das Netzwerk automatisch in funktionale Gruppen zu unterteilen. So lassen sich Kerngruppen von Randerscheinungen trennen.",
      impact: "Hilft dabei, die interne Struktur und Rollenverteilung im Netzwerk zu verstehen."
    }
  };

  const runAnalysis = async (handleToRun: string) => {
    if (!handleToRun.trim()) return;

    setIsLoading(true);
    setError(null);
    setGraphData(null);
    setSelectedNode(null);

    try {
      const data = await fetchAmplifications(
        handleToRun.trim(),
        isDeepScan,
        (msg) => setProgressMsg(msg)
      );
      
      setGraphData(data);
      
      // Setup timeline range
      const validNodes = data.nodes.filter(n => n.createdAt && !isNaN(new Date(n.createdAt).getTime()));
      if (validNodes.length > 0) {
        const timestamps = validNodes.map(n => new Date(n.createdAt).getTime());
        const min = Math.min(...timestamps);
        const max = Math.max(...timestamps);
        setTimelineRange({ min, max });
        setCurrentTime(new Date(max).toISOString());
      }

      // Run Centrality Analysis
      const results = calculateCentrality(data);
      setBridgeNodes(results.bridgeNodes);
      
      // Run Forensics
      const forensicResults = runForensics(data);
      setForensics(forensicResults);

      const detectedCommunities = detectCommunities(data, forensicResults);
      setCommunities(detectedCommunities);

      // Check for history comparison
      const history = getHistory();
      const prev = history.find(h => h.handle === handleToRun.trim());
      if (prev) {
        const currentEntry: ScanHistoryEntry = {
          id: 'current',
          handle: handleToRun.trim(),
          timestamp: new Date().toISOString(),
          nodes: data.nodes.reduce((acc, n) => ({ ...acc, [n.id]: { weight: n.weight, toxicity: n.toxicity || 0 } }), {}),
          forensics: forensicResults,
          narrativeSummary: null
        };
        setComparison(compareScans(prev, currentEntry));
        setPreviousScan(prev);
      } else {
        setComparison(null);
        setPreviousScan(null);
      }

      // Flag nodes in state
      const forensicNodes = data.nodes.map(n => {
        const community = detectedCommunities.find(c => c.nodes.includes(n.id));
        return {
          ...n,
          isCoordinated: forensicResults.coordinatedNodeIds.includes(n.id),
          isSockpuppet: forensicResults.sockpuppetGroups.some(g => g.includes(n.id)),
          clusterColor: community?.color || '#334155'
        };
      });
      
      const enrichedData = { ...data, nodes: forensicNodes };
      setGraphData(enrichedData);
      
      // Run AI Analysis on top nodes
      const topNodes = [...forensicNodes]
        .filter(n => !n.isRoot)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10);
        
      if (topNodes.length > 0) {
        setIsAnalyzing(true);
        setNarrativeSummary(null);
        try {
          const aiResult = await analyzeNetwork(handleToRun.trim(), topNodes);
          setNarrativeSummary(aiResult.summary);
          
          // Apply toxicity to nodes WITHOUT losing forensic flags
          const updatedNodes = forensicNodes.map(node => {
            const tox = aiResult.toxicNodes[node.handle];
            return tox !== undefined ? { ...node, toxicity: tox } : node;
          });
          
          const finalData = { ...data, nodes: updatedNodes };
          setGraphData(finalData);

          // Update selectedNode if it's currently showing stale data
          if (selectedNode) {
            const updatedSelected = updatedNodes.find(n => n.id === selectedNode.id);
            if (updatedSelected) setSelectedNode(updatedSelected);
          }
          
          // Trigger Deep Analysis with the final data
          triggerDeepAnalysis(finalData);
        } catch (aiErr) {
          console.error("AI Analysis failed", aiErr);
          triggerDeepAnalysis(enrichedData);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        triggerDeepAnalysis(enrichedData);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Netzwerks.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  const triggerDeepAnalysis = async (currentGraphData = graphData) => {
    if (!currentGraphData) return;
    const topNodes = [...currentGraphData.nodes]
      .filter(n => !n.isRoot)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);

    if (topNodes.length === 0) return;

    setIsDeepAnalyzing(true);
    try {
      const nodesWithPosts = await Promise.all(
        topNodes.slice(0, 5).map(async (n) => ({
          handle: n.handle,
          posts: await fetchRecentPosts(n.id, 10)
        }))
      );
      
      if (nodesWithPosts.some(n => n.posts.length > 0)) {
        const deepRes = await analyzeDeepNarrative(handleInput, nodesWithPosts);
        setDeepAnalysis(deepRes);
      } else {
        setDeepAnalysis({
          talkingPoints: ["KEINE REZENTEN POSTS GEFUNDEN", "SYSTEM-SCAN UNVOLLSTÄNDIG"],
          intent: "NICHT IDENTIFIZIERBAR",
          threatLevel: "LOW"
        });
      }
    } catch (err) {
      console.error("Deep Analysis failed", err);
    } finally {
      setIsDeepAnalyzing(false);
    }
  };

  useEffect(() => {
    const handler = () => triggerDeepAnalysis();
    window.addEventListener('run-deep-analysis', handler);
    return () => window.removeEventListener('run-deep-analysis', handler);
  }, [graphData, handleInput]);

  useEffect(() => {
    runAnalysis('niusde.bsky.social');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSnapshot = () => {
    if (!graphData || !forensics) return;
    saveScanToHistory(handleInput, graphData.nodes, forensics, narrativeSummary);
    // Refresh comparison if we just saved the first one
    if (!previousScan) {
      const history = getHistory();
      const prev = history.find(h => h.handle === handleInput.trim());
      if (prev) setPreviousScan(prev);
    }
    alert("Snapshot erfolgreich in der lokalen Historie gespeichert.");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(handleInput);
  };

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const filteredGraphData = useMemo(() => {
    if (!graphData) return null;
    const filteredNodes = graphData.nodes
      .filter(n => !blockedNodeIds.includes(n.id))
      .filter(n => n.isRoot || n.weight >= minWeight);
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(e => {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      return nodeIds.has(s) && nodeIds.has(t);
    });
    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graphData, minWeight, blockedNodeIds]);

  const topAmplifiers = useMemo(() => {
    if (!filteredGraphData) return null;
    return [...filteredGraphData.nodes]
      .filter(n => !n.isRoot)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
  }, [filteredGraphData]);

  const handleExportBlocklist = () => {
    if (!filteredGraphData) return;
    const text = filteredGraphData.nodes
      .filter(n => !n.isRoot)
      .sort((a, b) => b.weight - a.weight)
      .map(n => n.handle)
      .join('\n');
      
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${handleInput}_blocklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDossier = () => {
    window.print();
  };

  const influenceLost = useMemo(() => {
    if (!graphData || blockedNodeIds.length === 0) return 0;
    const totalWeight = graphData.nodes.reduce((acc, n) => acc + n.weight, 0);
    const blockedWeight = graphData.nodes
      .filter(n => blockedNodeIds.includes(n.id))
      .reduce((acc, n) => acc + n.weight, 0);
    return (blockedWeight / totalWeight) * 100;
  }, [graphData, blockedNodeIds]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !graphData) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsChatTyping(true);

    try {
      const response = await askSleuthAssistant(userMsg, graphData, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.answer }] }]);
      
      if (response.focusNodeId) {
        const node = graphData.nodes.find(n => n.id === response.focusNodeId);
        if (node) setSelectedNode(node);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "SYSTEM-FEHLER: Verbindung zum Cyber-Brain unterbrochen." }] }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-cyber-black flex flex-col font-sans text-slate-300">
      {/* Dossier Print Header (Visible only when printing) */}
      <div className="dossier-print-header">
        <div className="dossier-title">NIUS HUNTER // INTELLIGENCE DOSSIER</div>
        <div className="dossier-metadata">
          TARGET_ID: @{handleInput} | SCAN_DATE: {new Date().toLocaleString('de-DE')} | CLASSIFICATION: CONFIDENTIAL
        </div>
        <div className="dossier-watermark">CONFIDENTIAL</div>
      </div>

      <Header 
        handleInput={handleInput}
        setHandleInput={setHandleInput}
        isLoading={isLoading}
        onSearch={handleSearch}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      {showSettings && (
        <SettingsDropdown 
          isDeepScan={isDeepScan}
          setIsDeepScan={setIsDeepScan}
          minWeight={minWeight}
          setMinWeight={setMinWeight}
          isLoading={isLoading}
        />
      )}
      
      {/* Banner moved inside NetworkView for better integration */}

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-10 overflow-hidden">
        <NetworkView 
          filteredGraphData={filteredGraphData}
          isLoading={isLoading}
          progressMsg={progressMsg}
          error={error}
          onNodeClick={handleNodeClick}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          timelineRange={timelineRange}
          bridgeNodes={bridgeNodes}
          selectedNodeId={selectedNode?.id}
          narrativeSummary={narrativeSummary}
          isAnalyzing={isAnalyzing}
        />

        <Sidebar 
          selectedNode={selectedNode}
          onCloseNodeDetail={() => setSelectedNode(null)}
          onSimulateBlock={(id) => setBlockedNodeIds(prev => [...prev, id])}
          topAmplifiers={topAmplifiers}
          isLoading={isLoading}
          onNodeClick={handleNodeClick}
          onHelpClick={setActiveHelp}
          forensics={forensics}
          blockedNodeIds={blockedNodeIds}
          influenceLost={influenceLost}
          graphData={graphData}
          onRemoveBlock={(id) => setBlockedNodeIds(prev => prev.filter(p => p !== id))}
          onExportBlocklist={handleExportBlocklist}
          onExportDossier={handleExportDossier}
          deepAnalysis={deepAnalysis}
          isDeepAnalyzing={isDeepAnalyzing}
          comparison={comparison}
          oldTimestamp={previousScan?.timestamp || null}
          onSaveSnapshot={handleSaveSnapshot}
          communities={communities}
        />
      </main>

      <ChatAssistant 
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        chatHistory={chatHistory}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onSendChat={handleSendChat}
        isChatTyping={isChatTyping}
      />

      <HelpOverlay 
        activeHelp={activeHelp}
        onClose={() => setActiveHelp(null)}
        helpContent={helpContent}
      />
    </div>
  );
}
