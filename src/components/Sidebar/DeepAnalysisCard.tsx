import React from 'react';
import { DeepAnalysisResult } from '../../services/gemini';
import { Target, ShieldAlert, BrainCircuit, Loader2 } from 'lucide-react';

interface DeepAnalysisCardProps {
  result: DeepAnalysisResult | null;
  isAnalyzing: boolean;
}

export default function DeepAnalysisCard({ result, isAnalyzing }: DeepAnalysisCardProps) {
  if (isAnalyzing && !result) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-purple animate-pulse">
          Lese neuronale Netze aus...
        </p>
      </div>
    );
  }

  if (!result) return null;

  const threatColor = {
    LOW: 'text-emerald-500',
    MEDIUM: 'text-yellow-500',
    HIGH: 'text-orange-500',
    CRITICAL: 'text-rose-500'
  }[result.threatLevel];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-neon-blue" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Primäres Narrativ (Intent)</span>
        </div>
        <div className="p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-xl">
          <p className="text-[11px] font-bold text-neon-blue leading-relaxed">
            {result.intent}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Bedrohungs-Level</span>
        </div>
        <div className={`text-2xl font-black italic tracking-tighter ${threatColor}`}>
          {result.threatLevel}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="w-4 h-4 text-neon-purple" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Talking Points</span>
        </div>
        <div className="space-y-2">
          {result.talkingPoints.map((point, i) => (
            <div key={i} className="flex gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800/50">
              <span className="text-neon-purple font-mono text-[10px]">0{i+1}</span>
              <p className="text-[10px] text-slate-400">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
