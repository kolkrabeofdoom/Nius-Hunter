import React from 'react';
import { ShieldAlert, Zap, Sparkles } from 'lucide-react';

interface BriefingBannerProps {
  narrativeSummary: string | null;
  isAnalyzing: boolean;
}

export default function BriefingBanner({ narrativeSummary, isAnalyzing }: BriefingBannerProps) {
  if (!narrativeSummary && !isAnalyzing) return null;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border-l-4 border-neon-blue rounded-r-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
         <ShieldAlert className="w-16 h-16 text-white rotate-12" />
      </div>
      <div className="flex gap-4 items-start relative z-10">
        <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center shrink-0 border border-neon-blue/30">
           <Zap className={`w-5 h-5 text-neon-blue ${isAnalyzing ? 'animate-pulse' : ''}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em] mb-1">
            KI-Netzwerkanalyse // Dossier Briefing
          </h2>
          {isAnalyzing ? (
            <div className="flex items-center gap-2 mt-2">
               <div className="h-3 w-48 bg-slate-800 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-100 font-medium leading-relaxed italic">
                "{narrativeSummary}"
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('run-deep-analysis'))}
                className="shrink-0 px-4 py-2 bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple text-[10px] font-black rounded-lg border border-neon-purple/30 transition-all uppercase tracking-widest flex items-center gap-2 group"
              >
                <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" /> Tiefenanalyse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
