import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, Zap, ShieldAlert, Ban, SlidersHorizontal, Download, Network } from 'lucide-react';
import NetworkGraph from './components/NetworkGraph';
import LoaderClock from './components/LoaderClock';
import { GraphData, GraphNode, fetchAmplifications, fetchRecentPosts } from './services/bsky';
import { analyzeNetwork, analyzeDeepNarrative, DeepAnalysisResult } from './services/gemini';
import { calculateCentrality } from './utils/analysis';
import { runForensics, ForensicsResults } from './utils/forensics';
import { LucideIcon, Share2, Users, Radio, Link as LinkIcon, Cpu, MessageSquare, Terminal, Send, X, HelpCircle, Info } from 'lucide-react';
import { askSleuthAssistant } from './services/gemini';

export default function App() {
  const [handleInput, setHandleInput] = useState('niusde.bsky.social');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  
  // New State for Ideas 3, 4, 5
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
      const timestamps = data.nodes.map(n => new Date(n.createdAt).getTime());
      const min = Math.min(...timestamps);
      const max = Math.max(...timestamps);
      setTimelineRange({ min, max });
      setCurrentTime(new Date(max).toISOString());

      // Run Centrality Analysis
      const results = calculateCentrality(data);
      setBridgeNodes(results.bridgeNodes);
      
      // Run Forensics
      const forensicResults = runForensics(data);
      setForensics(forensicResults);

      // Flag nodes in state
      const forensicNodes = data.nodes.map(n => ({
        ...n,
        isCoordinated: forensicResults.coordinatedNodeIds.includes(n.id),
        isSockpuppet: forensicResults.sockpuppetGroups.some(g => g.includes(n.id))
      }));
      
      const enrichedData = { ...data, nodes: forensicNodes };
      setGraphData(enrichedData);
      
      // Run AI Analysis on top nodes
      const topNodes = [...data.nodes]
        .filter(n => !n.isRoot)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10);
        
      if (topNodes.length > 0) {
        setIsAnalyzing(true);
        setNarrativeSummary(null);
        try {
          const aiResult = await analyzeNetwork(handleToRun.trim(), topNodes);
          setNarrativeSummary(aiResult.summary);
          
          // Apply toxicity to nodes
          const updatedNodes = data.nodes.map(node => {
            const tox = aiResult.toxicNodes[node.handle];
            return tox !== undefined ? { ...node, toxicity: tox } : node;
          });
          setGraphData({ ...data, nodes: updatedNodes });

          // Update selectedNode if it's currently showing stale data
          if (selectedNode) {
            const updatedSelected = updatedNodes.find(n => n.id === selectedNode.id);
            if (updatedSelected) setSelectedNode(updatedSelected);
          }
        } catch (aiErr) {
          console.error("AI Analysis failed", aiErr);
        } finally {
          setIsAnalyzing(false);
        }
      }

      // Feature 4: Deep Narrative Analysis (Deep Dive)
      if (topNodes.length > 0) {
        setIsDeepAnalyzing(true);
        try {
          // Fetch posts for top 5 nodes
          const nodesWithPosts = await Promise.all(
            topNodes.slice(0, 5).map(async (n) => ({
              handle: n.handle,
              posts: await fetchRecentPosts(n.id, 10)
            }))
          );
          
          console.log(`Deep Analysis: Data for ${handleToRun}`, nodesWithPosts);
          
          if (nodesWithPosts.some(n => n.posts.length > 0)) {
            const deepRes = await analyzeDeepNarrative(handleToRun.trim(), nodesWithPosts);
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
      }

    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Netzwerks.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

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

  useEffect(() => {
    // Feste Analyse beim Start
    runAnalysis('niusde.bsky.social');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(handleInput);
  };

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleNodeClick = React.useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  // Filter the graph based on min weight and blocked nodes
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

  // Calculate statistics for recommendations
  const getInsights = () => {
    if (!filteredGraphData) return null;
    
    // Nodes that are highly connected or have the highest weight
    const sortedNodes = [...filteredGraphData.nodes]
      .filter(n => !n.isRoot) // Exclude the starting point
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    return sortedNodes;
  };

  const topAmplifiers = getInsights();

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

  const influenceLost = useMemo(() => {
    if (!graphData || blockedNodeIds.length === 0) return 0;
    const totalWeight = graphData.nodes.reduce((acc, n) => acc + n.weight, 0);
    const blockedWeight = graphData.nodes
      .filter(n => blockedNodeIds.includes(n.id))
      .reduce((acc, n) => acc + n.weight, 0);
    return (blockedWeight / totalWeight) * 100;
  }, [graphData, blockedNodeIds]);

  return (
    <div className="h-screen w-full bg-cyber-black flex flex-col font-sans overflow-hidden text-slate-300">
      {/* Dossier Print Header */}
      <div className="dossier-print-header">
         <div className="dossier-title">Forensisches Dossier</div>
         <div className="dossier-metadata">
            ID: NH-{Math.random().toString(36).substr(2, 9).toUpperCase()} | 
            Target: @{handleInput} | 
            Date: {new Date().toLocaleString()} | 
            Classification: CONFIDENTIAL
         </div>
         <div className="dossier-watermark">CONFIDENTIAL</div>
      </div>

      {/* Header Section */}
      <header className="h-20 bg-cyber-dark border-b border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 z-20 shadow-lg relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neon-blue rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            <Network className="w-6 h-6 text-cyber-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">NIUS HUNTER <span className="font-normal text-slate-500">| Cyber-Sleuth</span></h1>
        </div>
        
        <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-full transition-colors ${showSettings ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            title="Analyseeinstellungen"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          
          <form onSubmit={handleSearch} className="relative w-full max-w-[200px] sm:max-w-none sm:w-80">
            <input 
              type="text" 
              placeholder="System-Scan Target..." 
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full pl-4 pr-24 py-2.5 bg-slate-900 border border-slate-800 focus:bg-cyber-dark focus:border-neon-blue rounded-full text-sm outline-none transition-all shadow-inner text-white"
              required
            />
            <button 
              type="submit"
              disabled={isLoading || !handleInput.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-neon-blue text-cyber-black rounded-full text-xs font-bold hover:bg-white disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)]"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'INITIALIZE'}
            </button>
          </form>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute top-full right-4 md:right-8 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-30">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Analyseeinstellungen</h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Tiefenanalyse</span>
                  <span className="text-[10px] text-slate-500">Scannt mehr Follower & Posts (dauert länger)</span>
                </div>
                <div className="relative inline-block w-10 h-5">
                  <input type="checkbox" className="peer opacity-0 w-0 h-0" checked={isDeepScan} onChange={(e) => setIsDeepScan(e.target.checked)} disabled={isLoading} />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-slate-200 rounded-full transition-colors peer-checked:bg-blue-600 before:content-[''] before:absolute before:h-3 before:w-3 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-5"></span>
                </div>
              </label>

              <div className="border-t border-slate-100 pt-3">
                <label className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Filter Schwelle (Visualisierung)</span>
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{minWeight.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Blendet schwache Knotenpunkte aus</span>
                  <input 
                    type="range" 
                    min="1" max="10" step="0.5" 
                    value={minWeight} 
                    onChange={(e) => setMinWeight(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* AI Briefing Banner - Detective Dossier */}
      {(narrativeSummary || isAnalyzing) && (
        <div className="mx-4 md:mx-8 mt-4 bg-slate-900 border-l-4 border-blue-500 rounded-r-xl p-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <ShieldAlert className="w-16 h-16 text-white rotate-12" />
          </div>
          <div className="flex gap-4 items-start relative z-10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
               <Zap className={`w-5 h-5 text-blue-400 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">KI-Netzwerkanalyse // Dossier</h2>
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                   <div className="h-4 w-48 bg-slate-800 rounded animate-pulse"></div>
                </div>
              ) : (
                <p className="text-sm text-slate-100 font-medium leading-relaxed italic">
                  "{narrativeSummary}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        
        {/* Network Visualization */}
        <div className="flex-1 bg-cyber-dark rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(0,242,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.1)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none"></div>
          
          {filteredGraphData ? (
            <NetworkGraph 
              data={filteredGraphData} 
              onNodeClick={handleNodeClick} 
              currentTime={currentTime || undefined}
              bridgeNodes={bridgeNodes}
              selectedNodeId={selectedNode?.id}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                     <LoaderClock />
                  </div>
                  <p className="text-xs font-bold text-slate-400 flex items-center uppercase tracking-widest bg-white/80 px-2 py-1 rounded-md">{progressMsg || 'Analysiere...'}</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center max-w-sm text-center">
                  <div className="w-16 h-16 bg-rose-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center mb-4">
                     <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 bg-white/80 px-2 py-1 rounded-md">{error}</p>
                </div>
              ) : (
                <div className="relative w-full max-w-md aspect-square flex items-center justify-center opacity-40">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-20">
                    <div className="text-white font-bold text-[10px] uppercase tracking-widest">Start</div>
                  </div>
                  <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-white border-2 border-slate-300 rounded-full shadow-lg flex items-center justify-center z-10">
                    <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-white border-2 border-slate-300 rounded-full shadow-lg flex items-center justify-center z-10">
                    <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-white border-2 border-slate-300 rounded-full shadow-lg flex items-center justify-center z-10">
                    <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                  </div>
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="8,4" />
                    <line x1="50%" y1="50%" x2="66%" y2="75%" stroke="#CBD5E1" strokeWidth="2" />
                    <line x1="50%" y1="50%" x2="75%" y2="33%" stroke="#CBD5E1" strokeWidth="6" />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          {filteredGraphData && (
            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex flex-wrap gap-2 md:gap-4 pointer-events-none">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_5px_#00f2ff]"></span> Startpunkt
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Multiplikator
              </div>
            </div>
          )}

          {/* Timeline Slider Overlay - Moved inside Graph Area to avoid overlap */}
          {timelineRange && graphData && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
              <div className="bg-cyber-dark/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-3 transition-all hover:border-neon-blue/50 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-3 h-3 text-neon-blue ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zeitstrahl (Temporal Analysis)</span>
                  </div>
                  <span className="text-[10px] font-mono text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/20">
                    {new Date(currentTime || 0).toLocaleString()}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={timelineRange.min} 
                  max={timelineRange.max} 
                  value={new Date(currentTime || 0).getTime()}
                  onChange={(e) => setCurrentTime(new Date(parseInt(e.target.value)).toISOString())}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                />
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[8px] text-slate-600 uppercase tracking-tighter">Patient Zero</span>
                  <span className="text-[8px] text-slate-600 uppercase tracking-tighter">Gegenwart</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <aside className="w-full md:w-80 flex flex-col gap-4 md:gap-6 shrink-0 overflow-y-auto pb-4 md:pb-0">
          
          {selectedNode && filteredGraphData ? (
            <div className="bg-cyber-dark rounded-2xl border border-slate-800 p-4 md:p-5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple opacity-50"></div>
              <h2 className="text-xs font-bold text-neon-blue uppercase tracking-widest mb-4 flex items-center justify-between">
                System-Knoten ID
                <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white">✕</button>
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-full border border-slate-800 overflow-hidden flex items-center justify-center bg-slate-900 shrink-0 ${selectedNode.isBotCandidate ? 'animate-glitch border-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.4)]' : ''}`}>
                    {selectedNode.avatar ? (
                      <img src={selectedNode.avatar} alt={selectedNode.handle} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-500 font-bold text-sm uppercase">{selectedNode.handle.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold truncate text-white" title={selectedNode.displayName || selectedNode.handle}>
                      {selectedNode.displayName || selectedNode.handle}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neon-blue/70 truncate block">@{selectedNode.handle}</span>
                      {selectedNode.isBotCandidate && <span className="text-[9px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded border border-neon-purple/30 font-bold tracking-tighter">BOT</span>}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Multiplikator</div>
                    <div className="text-sm font-bold text-white">x{selectedNode.weight.toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Toxizität</div>
                    <div className={`text-sm font-bold ${selectedNode.toxicity && selectedNode.toxicity > 70 ? 'text-glitch-rose' : 'text-white'}`}>
                      {selectedNode.toxicity !== undefined ? `${selectedNode.toxicity}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    onClick={() => {
                      setBlockedNodeIds(prev => [...prev, selectedNode!.id]);
                      setSelectedNode(null);
                    }}
                    className="w-full py-2.5 bg-glitch-rose text-white rounded-lg text-xs font-black hover:bg-rose-600 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,85,0.3)] flex items-center justify-center gap-2"
                  >
                    <Ban className="w-3 h-3" /> SIMULIERE BLOCK
                  </button>
                  
                  <a 
                    href={`https://bsky.app/profile/${selectedNode.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors text-center block"
                  >
                    ORIGINAL-PROFIL
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Top Multipliers Card */}
              <div className="bg-cyber-dark rounded-2xl border border-slate-800 p-4 md:p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                   <Zap className="w-12 h-12 text-neon-blue" />
                </div>
                <h2 className="text-xs font-bold text-neon-blue uppercase tracking-widest mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Top Multiplikatoren
                  </div>
                  <button onClick={() => setActiveHelp('multipliers')} className="text-slate-600 hover:text-neon-blue transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </h2>
            {topAmplifiers && topAmplifiers.length > 0 ? (
              <div className="space-y-4">
                {topAmplifiers.map((node, i) => (
                  <div 
                    key={node.id} 
                    onClick={() => setSelectedNode(node)}
                    className={`flex items-center justify-between cursor-pointer p-1.5 rounded-xl transition-all ${i > 1 ? 'opacity-70' : ''} ${selectedNode?.id === node.id ? 'bg-neon-blue/10 ring-1 ring-neon-blue/30 opacity-100' : 'hover:bg-slate-900'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                        {node.avatar ? (
                           <img src={node.avatar} alt={node.handle} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-slate-500 font-bold text-xs uppercase">{node.handle.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate flex items-center gap-2" title={node.displayName || node.handle}>
                          {node.displayName || node.handle}
                          {node.toxicity && node.toxicity > 70 && <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />}
                        </div>
                        <a 
                          href={`https://bsky.app/profile/${node.handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-500 uppercase hover:text-blue-500 truncate block"
                        >
                          @{node.handle}
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <div className="text-xs font-mono text-blue-600">x{node.weight.toFixed(1)}</div>
                      {node.toxicity !== undefined && (
                        <div className={`text-[9px] font-bold ${node.toxicity > 70 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {node.toxicity}% TOX
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-2">
                {isLoading ? 'Analysiere Daten...' : 'Keine Multiplikatoren gefunden.'}
              </div>
            )}
          </div>

          {/* Forensics Highlights Card */}
          <div className="bg-cyber-dark rounded-2xl border border-slate-800 p-4 md:p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
               <Radio className="w-12 h-12 text-neon-green" />
            </div>
            <h2 className="text-xs font-bold text-neon-green uppercase tracking-widest mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Forensik-Scan
              </div>
              <button onClick={() => setActiveHelp('forensics')} className="text-slate-600 hover:text-neon-green transition-colors">
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </h2>
            
            <div className="space-y-4">
              {/* Synchronicity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Koordination</span>
                  <span className="text-[10px] text-neon-blue font-mono">{forensics?.coordinatedNodeIds.length || 0} Accounts</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neon-blue shadow-[0_0_10px_#00f2ff]" 
                    style={{ width: `${Math.min(100, (forensics?.coordinatedNodeIds.length || 0) * 10)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 relative">
                 <div className="group cursor-help" onClick={() => setActiveHelp('bot_density')}>
                    <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                      Bot-Dichte <Info className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <div className="text-xs font-mono text-neon-purple">{forensics?.botDensity.toFixed(1)}%</div>
                 </div>
                 <div className="group cursor-help" onClick={() => setActiveHelp('stability')}>
                    <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                      Netz-Stabilität <Info className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <div className="text-xs font-mono text-neon-green">{forensics?.networkDensity.toFixed(2)}%</div>
                 </div>
                 <div className="group cursor-help" onClick={() => setActiveHelp('toxicity')}>
                    <span className="text-[9px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                      Ø Toxizität <Info className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <div className={`text-xs font-mono ${forensics && forensics.avgToxicity > 40 ? 'text-glitch-rose' : 'text-white'}`}>
                       {forensics?.avgToxicity.toFixed(0)}%
                    </div>
                 </div>
                 <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Brutto-Reichweite</span>
                    <div className="text-xs font-mono text-slate-300">
                       {(forensics?.totalReach || 0).toLocaleString()}
                    </div>
                 </div>
              </div>

              {/* Top Sources */}
              {forensics?.topLinks && forensics.topLinks.length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Top Quellen (Domains)</span>
                  <div className="space-y-1.5">
                    {forensics.topLinks.slice(0, 3).map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[140px] flex items-center gap-1">
                          <LinkIcon className="w-2.5 h-2.5 text-slate-500" /> {link.url}
                        </span>
                        <span className="text-neon-green font-mono">{link.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sockpuppets */}
              {forensics?.sockpuppetGroups && forensics.sockpuppetGroups.length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Sockenpuppen-Cluster</span>
                  <div className="flex items-center gap-2 text-xs text-neon-purple">
                    <Users className="w-3 h-3" />
                    <span>{forensics.sockpuppetGroups.length} Gruppen identifiziert</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Intervention Logic Card */}
          <div className="bg-cyber-dark rounded-2xl border border-slate-800 p-4 md:p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
               <ShieldAlert className="w-12 h-12 text-glitch-rose" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-glitch-rose" />
                <h2 className="text-xs font-bold text-glitch-rose uppercase tracking-widest">Gegenmaßnahmen</h2>
                <button onClick={() => setActiveHelp('intervention')} className="text-slate-700 hover:text-glitch-rose transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              {influenceLost > 0 && (
                <span className="text-[10px] font-black bg-glitch-rose text-white px-2 py-0.5 rounded animate-pulse">
                  -{influenceLost.toFixed(1)}% IMPACT
                </span>
              )}
            </div>
            
            <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">
              Blockade-Simulation: Identifiziere strategische Knotenpunkte zur Neutralisierung der Amplifikation.
            </p>
            
            <div className="space-y-3 mb-6">
              {blockedNodeIds.length > 0 && (
                <div className="mb-4">
                  <div className="text-[9px] text-slate-500 uppercase font-bold mb-2">Aktive Simulation:</div>
                  <div className="flex flex-wrap gap-2">
                    {blockedNodeIds.map(id => (
                      <div key={id} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[10px]">
                        <span className="text-slate-300">@{graphData?.nodes.find(n => n.id === id)?.handle}</span>
                        <button onClick={() => setBlockedNodeIds(prev => prev.filter(p => p !== id))} className="text-rose-500 hover:text-white">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topAmplifiers && topAmplifiers.length > 0 ? (
                <>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="flex flex-wrap items-center justify-between mb-1 gap-1">
                      <span className="text-xs font-bold text-neon-blue truncate max-w-[150px]">@{topAmplifiers[0]?.handle || 'Knoten'}</span>
                      <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-1.5 py-0.5 rounded uppercase shrink-0 border border-neon-blue/30">Hub</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Zentraler Multiplikator</div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500">
                  Initialisiere System-Scan...
                </div>
              )}
            </div>

            <button 
              onClick={() => window.print()}
              disabled={!filteredGraphData || !deepAnalysis}
              className="mt-4 w-full py-3 bg-neon-blue text-cyber-black rounded-xl text-xs font-black hover:bg-white transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,242,255,0.4)]"
            >
              <Download className="w-4 h-4" /> EXPORT DOSSIER (PDF)
            </button>
          </div>
            </>
          )}
        </aside>
      </main>

      {/* Deep Analysis Highlights (if present) */}
      {deepAnalysis && (
        <div className="mx-4 md:mx-8 mb-6 bg-cyber-dark border border-neon-blue/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="shrink-0 flex flex-col items-center gap-2">
                 <div className={`px-4 py-2 rounded-lg font-black text-xs tracking-tighter border ${
                   deepAnalysis.threatLevel === 'CRITICAL' ? 'bg-glitch-rose/20 text-glitch-rose border-glitch-rose/40' :
                   deepAnalysis.threatLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-500 border-orange-500/40' :
                   'bg-neon-green/20 text-neon-green border-neon-green/40'
                 }`}>
                   {deepAnalysis.threatLevel} THREAT
                 </div>
                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Classification</div>
              </div>
              
              <div className="flex-1">
                 <h3 className="text-xs font-bold text-neon-blue uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Share2 className="w-3 h-3" /> Strategische Narrative & Talking Points
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deepAnalysis.talkingPoints.map((tp, i) => (
                      <div key={i} className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                         <div className="w-5 h-5 rounded bg-neon-blue/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-neon-blue border border-neon-blue/20">
                            {i+1}
                         </div>
                         <p className="text-sm text-slate-200 leading-tight">{tp}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="w-full md:w-64 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Operationale Absicht</h4>
                 <p className="text-sm text-slate-300 italic">"{deepAnalysis.intent}"</p>
              </div>
           </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <footer className="h-12 bg-cyber-dark border-t border-slate-800 px-4 md:px-8 flex items-center justify-between text-[10px] text-slate-500 font-medium uppercase tracking-wider shrink-0 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-4 md:gap-6 items-center">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_5px_rgba(0,242,255,0.8)]"></div> SYSTEM ACTIVE</span>
          <span>Nodes: {filteredGraphData ? filteredGraphData.nodes.length : 0}</span>
          {bridgeNodes.length > 0 && <span className="text-neon-blue font-black tracking-tighter">GATEKEEPERS: {bridgeNodes.length}</span>}
          {influenceLost > 0 && <span className="text-glitch-rose font-black tracking-tighter">SIM-REDUCTION: {influenceLost.toFixed(1)}%</span>}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-neon-blue animate-pulse' : 'bg-neon-green shadow-[0_0_5px_#00ff9f]'}`}></div>
          {isLoading ? 'EXECUTING SCAN...' : 'ENCRYPTED DATA FEED'}
        </div>
      </footer>

      {/* Sleuth-Assistant Chat Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all z-40 border ${
          isChatOpen ? 'bg-slate-800 border-slate-700 text-white rotate-90' : 'bg-neon-blue border-neon-blue/50 text-cyber-black hover:scale-110 shadow-[0_0_20px_rgba(0,242,255,0.4)]'
        }`}
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isChatOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-glitch-rose rounded-full animate-ping"></span>}
      </button>

      {/* Sleuth-Assistant Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-36 right-6 w-[350px] h-[500px] bg-cyber-dark border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-40 animate-in fade-in slide-in-from-bottom-8 overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neon-blue" />
              <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest">Sleuth-Assistant v2.0</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-neon-green"></div>
              <div className="w-2 h-2 rounded-full bg-neon-purple"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <Terminal className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                <p className="text-[10px] text-slate-600 uppercase">Warte auf Befehl... Frag mich nach Gateway-Knoten, Bot-Clustern oder Narrativen.</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user' ? 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue' : 'bg-slate-900 border border-slate-800 text-slate-300'
                }`}>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {isChatTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-900/50">
            <div className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Query eingeben..."
                className="w-full bg-cyber-black border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs outline-none focus:border-neon-blue transition-colors text-white"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || isChatTyping}
                className="absolute right-1.5 top-1.5 p-1 text-neon-blue hover:text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Forensic Help Overlay */}
      {activeHelp && helpContent[activeHelp] && (
        <div className="fixed inset-0 bg-cyber-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-cyber-dark border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-glitch-rose"></div>
             
             <button 
               onClick={() => setActiveHelp(null)}
               className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
             >
               <X className="w-6 h-6" />
             </button>

             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                   <Info className="w-6 h-6 text-neon-blue" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{helpContent[activeHelp].title}</h3>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Definition & Analyse</label>
                   <p className="text-slate-300 leading-relaxed text-sm">{helpContent[activeHelp].body}</p>
                </div>

                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                   <label className="text-[10px] font-black text-neon-purple uppercase tracking-widest block mb-2">Forensischer Impact</label>
                   <p className="text-xs text-slate-400 italic">"{helpContent[activeHelp].impact}"</p>
                </div>

                <button 
                  onClick={() => setActiveHelp(null)}
                  className="w-full py-3 bg-white text-cyber-black rounded-xl text-xs font-black hover:bg-neon-blue transition-all uppercase tracking-widest"
                >
                  VERSTANDEN
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
