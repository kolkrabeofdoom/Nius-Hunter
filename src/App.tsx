import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, Zap, ShieldAlert, Ban } from 'lucide-react';
import NetworkGraph from './components/NetworkGraph';
import LoaderClock from './components/LoaderClock';
import { GraphData, GraphNode, fetchAmplifications } from './services/bsky';

export default function App() {
  const [handleInput, setHandleInput] = useState('niusde.bsky.social');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const runAnalysis = async (handleToRun: string) => {
    if (!handleToRun.trim()) return;

    setIsLoading(true);
    setError(null);
    setGraphData(null);

    try {
      const data = await fetchAmplifications(
        handleToRun.trim(),
        1,
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
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(handleInput);
  };

  const handleNodeClick = (node: GraphNode) => {
    console.log("Clicked node:", node);
    // Future: could expand network from here
  };

  // Calculate statistics for recommendations
  const getInsights = () => {
    if (!graphData) return null;
    
    // Nodes that are highly connected or have the highest weight
    const sortedNodes = [...graphData.nodes]
      .filter(n => !n.isRoot) // Exclude the starting point
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    return sortedNodes;
  };

  const topAmplifiers = getInsights();

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      {/* Header Section */}
      <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16"></path></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">NIUS HUNTER <span className="font-normal text-slate-400">| Multiplier-Analyse</span></h1>
        </div>
        
        <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
          <form onSubmit={handleSearch} className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="Anfangspunkt angeben (@handle.bsky.social)" 
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full pl-4 pr-24 py-2.5 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-full text-sm outline-none transition-all"
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
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        
        {/* Network Visualization */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0085FF_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
          
          {graphData ? (
            <NetworkGraph data={graphData} onNodeClick={handleNodeClick} />
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
          {graphData && (
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
              disabled={!graphData}
              className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Filter-Set Generieren
            </button>
          </div>
        </aside>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-12 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider shrink-0 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-4 md:gap-6 items-center">
          <span>Netzwerk-Tiefe: 1 Ebene</span>
          <span>Gefundene Knoten: {graphData ? graphData.nodes.length : 0}</span>
          <span>Verbindungen: {graphData ? graphData.edges.length : 0}</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
          {isLoading ? 'Fetching Data...' : 'Live Bluesky Data Feed'}
        </div>
      </footer>
    </div>
  );
}

