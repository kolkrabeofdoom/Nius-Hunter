import React from 'react';
import { Zap, HelpCircle, Bug, ShieldAlert } from 'lucide-react';
import { GraphNode } from '../../services/bsky';

interface MultipliersCardProps {
  topAmplifiers: GraphNode[] | null;
  isLoading: boolean;
  onNodeClick: (node: GraphNode) => void;
  selectedNodeId?: string;
  onHelpClick: (id: string) => void;
}

export default function MultipliersCard({ 
  topAmplifiers, 
  isLoading, 
  onNodeClick, 
  selectedNodeId,
  onHelpClick 
}: MultipliersCardProps) {
  return (
    <div className="space-y-3 relative">
      <div className="absolute -top-12 -right-2 p-2 opacity-5 pointer-events-none">
         <Zap className="w-12 h-12 text-neon-blue" />
      </div>
      
      {topAmplifiers && topAmplifiers.length > 0 ? (
        <div className="space-y-3">
          {topAmplifiers.map((node, i) => (
            <div 
              key={node.id} 
              onClick={() => onNodeClick(node)}
              className={`flex items-center justify-between cursor-pointer p-2 rounded-xl transition-all border ${
                selectedNodeId === node.id 
                  ? 'bg-neon-blue/10 border-neon-blue/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]' 
                  : 'bg-slate-900/30 border-transparent hover:bg-slate-900/80 hover:border-slate-800'
              } ${i > 2 ? 'opacity-70 hover:opacity-100' : ''}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center relative border border-slate-700">
                  {node.avatar ? (
                     <img src={node.avatar} alt={node.handle} className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-slate-500 font-bold text-xs uppercase">{node.handle.charAt(0)}</span>
                  )}
                  {node.isBotCandidate && (
                    <div className="absolute -top-0.5 -right-0.5 bg-neon-purple text-white rounded-full p-0.5 border border-cyber-black shadow-[0_0_5px_rgba(188,19,254,0.8)] z-10">
                      <Bug className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate flex items-center gap-2 text-slate-200" title={node.displayName || node.handle}>
                    {node.displayName || node.handle}
                    {node.toxicity && node.toxicity > 70 && <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate block">
                    @{node.handle}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 ml-3">
                <div className="text-xs font-black text-neon-blue">x{node.weight.toFixed(1)}</div>
                {node.toxicity !== undefined && (
                  <div className={`text-[8px] font-black tracking-tighter ${node.toxicity > 70 ? 'text-rose-500' : 'text-slate-600'}`}>
                    {node.toxicity}% TOX
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-600 font-bold py-4 text-center border border-dashed border-slate-800 rounded-xl">
          {isLoading ? 'Initialisiere Scan-Protokoll...' : 'Keine Multiplikatoren identifiziert.'}
        </div>
      )}
    </div>
  );
}
