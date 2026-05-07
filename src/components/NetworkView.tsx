import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import NetworkGraph from './NetworkGraph';
import LoaderClock from './LoaderClock';
import { GraphData, GraphNode } from '../services/bsky';

interface NetworkViewProps {
  filteredGraphData: GraphData | null;
  isLoading: boolean;
  progressMsg: string;
  error: string | null;
  onNodeClick: (node: GraphNode) => void;
  currentTime: string | null;
  setCurrentTime: (time: string) => void;
  timelineRange: { min: number; max: number } | null;
  bridgeNodes: string[];
  selectedNodeId?: string | null;
}

export default function NetworkView({
  filteredGraphData,
  isLoading,
  progressMsg,
  error,
  onNodeClick,
  currentTime,
  setCurrentTime,
  timelineRange,
  bridgeNodes,
  selectedNodeId
}: NetworkViewProps) {
  return (
    <div className="flex-1 bg-cyber-dark rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(0,242,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.1)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none"></div>
      
      {filteredGraphData ? (
        <NetworkGraph 
          data={filteredGraphData} 
          onNodeClick={onNodeClick} 
          currentTime={currentTime || undefined}
          bridgeNodes={bridgeNodes}
          selectedNodeId={selectedNodeId}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-neon-blue rounded-full border-4 border-cyber-black shadow-xl flex items-center justify-center">
                 <LoaderClock />
              </div>
              <p className="text-[10px] font-black text-neon-blue flex items-center uppercase tracking-[0.2em] bg-cyber-black/80 px-4 py-2 rounded-lg border border-neon-blue/20">
                {progressMsg || 'Analysiere Netzwerk...'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center max-w-sm text-center">
              <div className="w-16 h-16 bg-rose-500 rounded-full border-4 border-cyber-black shadow-xl flex items-center justify-center mb-4">
                 <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-bold text-rose-400 bg-cyber-black/80 px-4 py-2 rounded-lg border border-rose-500/20">
                {error}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 opacity-30">
               <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 animate-pulse"></div>
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                 System Idle // Awaiting Input
               </p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {filteredGraphData && (
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-4 pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-cyber-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(0,242,255,0.8)]"></span> Target
          </div>
          <div className="flex items-center gap-2 bg-cyber-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span> Amplifier
          </div>
          <div className="flex items-center gap-2 bg-cyber-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(188,19,254,0.8)]"></span> Bot-Suspect
          </div>
        </div>
      )}

      {/* Timeline Slider */}
      {timelineRange && filteredGraphData && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
          <div className="bg-cyber-dark/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 transition-all hover:border-neon-blue/50 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-3 h-3 text-neon-blue ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Temporal Analysis // Timeline
                </span>
              </div>
              <span className="text-[10px] font-mono text-neon-blue bg-neon-blue/10 px-3 py-1 rounded border border-neon-blue/20 shadow-[0_0_10px_rgba(0,242,255,0.1)]">
                {new Date(currentTime || 0).toLocaleString()}
              </span>
            </div>
            <input 
              type="range" 
              min={timelineRange.min} 
              max={timelineRange.max} 
              value={new Date(currentTime || 0).getTime()}
              onChange={(e) => setCurrentTime(new Date(parseInt(e.target.value)).toISOString())}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Initial Contact</span>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Current State</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
