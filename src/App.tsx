import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, Zap, ShieldAlert, Ban, SlidersHorizontal, Download, Network } from 'lucide-react';
import NetworkGraph from './components/NetworkGraph';
import LoaderClock from './components/LoaderClock';
import { GraphData, GraphNode, fetchAmplifications } from './services/bsky';

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
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Netzwerks.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
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

  // Filter the graph based on min weight
  const filteredGraphData = useMemo(() => {
    if (!graphData) return null;
    const filteredNodes = graphData.nodes.filter(n => n.isRoot || n.weight >= minWeight);
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(e => {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      return nodeIds.has(s) && nodeIds.has(t);
    });
    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graphData, minWeight]);

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

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      {/* Header Section */}
      <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Network className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">NIUS HUNTER <span className="font-normal text-slate-400">| Multiplier-Analyse</span></h1>
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
              placeholder="Account Handle..." 
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full pl-4 pr-24 py-2.5 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-full text-sm outline-none transition-all shadow-inner"
              required
            />
            <button 
              type="submit"
              disabled={isLoading || !handleInput.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Analyse'}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        
        {/* Network Visualization */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0085FF_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
          
          {filteredGraphData ? (
            <NetworkGraph data={filteredGraphData} onNodeClick={handleNodeClick} />
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
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Startpunkt
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Multiplikator
              </div>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <aside className="w-full md:w-80 flex flex-col gap-4 md:gap-6 shrink-0 overflow-y-auto pb-4 md:pb-0">
          
          {selectedNode && filteredGraphData ? (
            <div className="bg-white rounded-2xl border border-blue-100 p-4 md:p-5 shadow-sm">
              <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                Knoten Details
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-700">✕</button>
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-100 shrink-0">
                    {selectedNode.avatar ? (
                      <img src={selectedNode.avatar} alt={selectedNode.handle} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-500 font-bold text-sm uppercase">{selectedNode.handle.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold truncate text-slate-800" title={selectedNode.displayName || selectedNode.handle}>
                      {selectedNode.displayName || selectedNode.handle}
                    </div>
                    <a 
                      href={`https://bsky.app/profile/${selectedNode.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-500 hover:underline truncate block"
                    >
                      @{selectedNode.handle}
                    </a>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Multiplikator</div>
                    <div className="text-sm font-bold text-slate-700">x{selectedNode.weight.toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">Verbindungen</div>
                    <div className="text-sm font-bold text-slate-700">
                      {filteredGraphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id || (e.source as any).id === selectedNode.id || (e.target as any).id === selectedNode.id).length}
                    </div>
                  </div>
                </div>

                <a 
                  href={`https://bsky.app/profile/${selectedNode.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors text-center block"
                >
                  Profil Öffnen
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Top Multipliers Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Top Multiplikatoren</h2>
            {topAmplifiers && topAmplifiers.length > 0 ? (
              <div className="space-y-4">
                {topAmplifiers.map((node, i) => (
                  <div key={node.id} className={`flex items-center justify-between ${i > 1 ? 'opacity-70' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                        {node.avatar ? (
                           <img src={node.avatar} alt={node.handle} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-slate-500 font-bold text-xs uppercase">{node.handle.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" title={node.displayName || node.handle}>{node.displayName || node.handle}</div>
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
                    <div className="text-xs font-mono text-blue-600 shrink-0 ml-2">x{node.weight.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-2">
                {isLoading ? 'Analysiere Daten...' : 'Keine Multiplikatoren gefunden.'}
              </div>
            )}
          </div>

          {/* Intervention Logic Card */}
          <div className="flex-1 bg-white rounded-2xl border border-rose-100 p-4 md:p-5 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h2 className="text-xs font-bold text-rose-600 uppercase tracking-widest">Knotenpunkte zertrennen</h2>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">
              Um die aktuelle Informationsblase zu isolieren, wird empfohlen, folgende Verbindungen zu unterbrechen:
            </p>
            
            <div className="space-y-3 mb-6">
              {topAmplifiers && topAmplifiers.length > 0 ? (
                <>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="flex flex-wrap items-center justify-between mb-1 gap-1">
                      <span className="text-xs font-bold text-rose-700 truncate max-w-[150px]">@{topAmplifiers[0]?.handle || 'Knoten'}</span>
                      <span className="text-[10px] bg-rose-200 text-rose-700 px-1.5 py-0.5 rounded uppercase shrink-0">Kritisch</span>
                    </div>
                    <div className="text-[10px] text-rose-600/70">Höchster Verstärkungswert im Netz</div>
                  </div>
                  
                  {topAmplifiers[1] && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex flex-wrap items-center justify-between mb-1 gap-1">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">@{topAmplifiers[1].handle}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase shrink-0">Sekundär</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Unterbricht externe Zweige</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-400">
                  Warte auf Netzwerkanalyse...
                </div>
              )}
            </div>

            <button 
              onClick={handleExportBlocklist}
              disabled={!filteredGraphData || topAmplifiers?.length === 0}
              className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Filter-Set (.txt)
            </button>
          </div>
            </>
          )}
        </aside>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-12 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider shrink-0 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-4 md:gap-6 items-center">
          <span>Netzwerk-Tiefe: {isDeepScan ? 'Erweitert' : 'Standard'}</span>
          <span>Gefundene Knoten: {filteredGraphData ? filteredGraphData.nodes.length : 0} {graphData && graphData.nodes.length !== filteredGraphData?.nodes.length && `(von ${graphData.nodes.length})`}</span>
          <span>Verbindungen: {filteredGraphData ? filteredGraphData.edges.length : 0}</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
          {isLoading ? 'Fetching Data...' : 'Live Bluesky Data Feed'}
        </div>
      </footer>
    </div>
  );
}

