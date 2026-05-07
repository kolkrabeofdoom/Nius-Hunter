import React from 'react';
import { Ban, Clock } from 'lucide-react';
import { GraphNode } from '../../services/bsky';

interface NodeDetailCardProps {
  selectedNode: GraphNode;
  onClose: () => void;
  onSimulateBlock: (id: string) => void;
}

export default function NodeDetailCard({ selectedNode, onClose, onSimulateBlock }: NodeDetailCardProps) {
  return (
    <div className="bg-cyber-dark rounded-2xl border border-slate-800 p-5 shadow-2xl relative overflow-hidden animate-in slide-in-from-right-4 duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple opacity-50"></div>
      <h2 className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
        System-Knoten ID
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
      </h2>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full border-2 border-slate-800 overflow-hidden flex items-center justify-center bg-slate-900 shrink-0 ${selectedNode.isBotCandidate ? 'animate-glitch border-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.3)]' : ''}`}>
            {selectedNode.avatar ? (
              <img src={selectedNode.avatar} alt={selectedNode.handle} className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-500 font-black text-lg uppercase">{selectedNode.handle.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold truncate text-white leading-tight" title={selectedNode.displayName || selectedNode.handle}>
              {selectedNode.displayName || selectedNode.handle}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-neon-blue/70 truncate block">@{selectedNode.handle}</span>
              {selectedNode.isBotCandidate && (
                <span className="text-[9px] bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded border border-neon-purple/30 font-black tracking-tighter uppercase">
                  Bot-Suspect
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Amplification</div>
            <div className="text-lg font-mono font-bold text-white">x{selectedNode.weight.toFixed(1)}</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Toxicity</div>
            <div className={`text-lg font-mono font-bold ${selectedNode.toxicity && selectedNode.toxicity > 70 ? 'text-rose-500' : 'text-white'}`}>
              {selectedNode.toxicity !== undefined ? `${selectedNode.toxicity}%` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
          <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3 text-neon-blue" /> Registration Date
          </div>
          <div className="text-sm font-mono text-slate-300">
            {new Date(selectedNode.createdAt).toLocaleDateString('de-DE', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {selectedNode.description && (
          <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-800/30">
            <p className="text-xs text-slate-400 italic leading-relaxed">
              {selectedNode.description}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <button 
            onClick={() => onSimulateBlock(selectedNode.id)}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center gap-3 group"
          >
            <Ban className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
            Simuliere Neutralisierung
          </button>
          
          <a 
            href={`https://bsky.app/profile/${selectedNode.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black transition-all text-center uppercase tracking-[0.2em] border border-slate-700"
          >
            Profile Deep-Link
          </a>
        </div>
      </div>
    </div>
  );
}
