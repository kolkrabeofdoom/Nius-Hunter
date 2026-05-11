import { ShieldAlert, HelpCircle, Ban, Download, FileText, History, ExternalLink } from 'lucide-react';
import { GraphData, GraphNode } from '../../services/bsky';

interface InterventionCardProps {
  blockedNodeIds: string[];
  influenceLost: number;
  graphData: GraphData | null;
  topAmplifier: GraphNode | null;
  onRemoveBlock: (id: string) => void;
  onExportBlocklist: () => void;
  onViewBlocklist: () => void;
  onExportDossier: () => void;
  onHelpClick: (id: string) => void;
  onSaveSnapshot: () => void;
}

export default function InterventionCard({
  blockedNodeIds,
  influenceLost,
  graphData,
  topAmplifier,
  onRemoveBlock,
  onExportBlocklist,
  onViewBlocklist,
  onExportDossier,
  onHelpClick,
  onSaveSnapshot
}: InterventionCardProps) {
  return (
    <div className="space-y-6 relative">
      {influenceLost > 0 && (
        <div className="absolute -top-14 right-0">
          <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.5)]">
            -{influenceLost.toFixed(1)}% IMPACT
          </span>
        </div>
      )}
      
      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
        Neutralisierungs-Protokoll: Strategische Blockaden schwächen die Amplifikations-Kette des Netzwerks.
      </p>
      
      <div className="space-y-4">
        {blockedNodeIds.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-3">Aktive Neutralisierungen:</div>
            <div className="flex flex-wrap gap-2">
              {blockedNodeIds.map(id => (
                <div key={id} className="flex items-center gap-2 bg-rose-950/30 border border-rose-900/50 px-2 py-1.5 rounded-lg text-[10px] animate-in zoom-in-95 duration-200">
                  <span className="text-rose-400 font-bold">@{graphData?.nodes.find(n => n.id === id)?.handle}</span>
                  <button 
                    onClick={() => onRemoveBlock(id)} 
                    className="text-rose-600 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!blockedNodeIds.length && topAmplifier && (
          <div className="p-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
               <span className="text-[9px] font-black text-slate-600 uppercase">Strategischer Hub:</span>
               <span className="text-[8px] bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded border border-neon-blue/20">Empfehlung</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-slate-200">@{topAmplifier.handle}</span>
               <span className="text-[10px] font-mono text-neon-blue">x{topAmplifier.weight.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onExportBlocklist}
            disabled={!graphData}
            className="w-full py-3 bg-slate-100 hover:bg-white text-cyber-black rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export (.txt)
          </button>
          <button 
            onClick={onViewBlocklist}
            disabled={!graphData}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-neon-green rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-neon-green/30 disabled:opacity-50"
          >
            <ExternalLink className="w-4 h-4" /> View
          </button>
        </div>
        
        <button 
          onClick={onExportDossier}
          disabled={!graphData}
          className="w-full py-3 bg-neon-blue hover:bg-white text-cyber-black rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,242,255,0.3)] disabled:opacity-50"
        >
          <FileText className="w-4 h-4" /> Export PDF Dossier
        </button>

        <button 
          onClick={onSaveSnapshot}
          disabled={!graphData}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-neon-blue rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-neon-blue/30 disabled:opacity-50"
        >
          <History className="w-4 h-4" /> Save Snapshot for Tracking
        </button>
      </div>
    </div>
  );
}
