import React from 'react';
import { X, Info } from 'lucide-react';

interface HelpOverlayProps {
  activeHelp: string | null;
  onClose: () => void;
  helpContent: Record<string, { title: string; body: string; impact: string }>;
}

export default function HelpOverlay({ activeHelp, onClose, helpContent }: HelpOverlayProps) {
  if (!activeHelp || !helpContent[activeHelp]) return null;

  const content = helpContent[activeHelp];

  return (
    <div className="fixed inset-0 bg-cyber-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-cyber-dark border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-neon-blue/10 flex items-center justify-center border border-neon-blue/30">
                <Info className="w-4 h-4 text-neon-blue" />
             </div>
             <h3 className="text-sm font-black text-white uppercase tracking-widest">{content.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Definition // Methode</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {content.body}
            </p>
          </div>
          <div className="space-y-3 p-4 bg-neon-blue/5 rounded-2xl border border-neon-blue/10">
            <h4 className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em]">Relevanz // Impact</h4>
            <p className="text-slate-100 text-sm leading-relaxed font-medium">
              {content.impact}
            </p>
          </div>
        </div>
        <div className="p-6 bg-slate-900/30 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl uppercase tracking-widest transition-all"
           >
             Verstanden
           </button>
        </div>
      </div>
    </div>
  );
}
