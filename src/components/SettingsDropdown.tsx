import React from 'react';

interface SettingsDropdownProps {
  isDeepScan: boolean;
  setIsDeepScan: (val: boolean) => void;
  minWeight: number;
  setMinWeight: (val: number) => void;
  isLoading: boolean;
}

export default function SettingsDropdown({
  isDeepScan,
  setIsDeepScan,
  minWeight,
  setMinWeight,
  isLoading
}: SettingsDropdownProps) {
  return (
    <div className="absolute top-24 right-4 md:right-8 w-72 bg-cyber-dark/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-800 p-5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-transparent opacity-50"></div>
      <h3 className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em] mb-5 pb-2 border-b border-slate-800/50">
        Analyseeinstellungen
      </h3>
      
      <div className="space-y-6">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-200 group-hover:text-neon-blue transition-colors">Tiefenanalyse</span>
            <span className="text-[10px] text-slate-500 font-medium">Scannt mehr Follower & Posts</span>
          </div>
          <div className="relative inline-block w-10 h-5">
            <input 
              type="checkbox" 
              className="peer opacity-0 w-0 h-0" 
              checked={isDeepScan} 
              onChange={(e) => setIsDeepScan(e.target.checked)} 
              disabled={isLoading} 
            />
            <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-slate-800 rounded-full transition-colors peer-checked:bg-neon-blue before:content-[''] before:absolute before:h-3 before:w-3 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-transform peer-checked:before:translate-x-5"></span>
          </div>
        </label>

        <div className="pt-2">
          <label className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-200">Filter Schwelle</span>
              <span className="text-xs font-mono bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded border border-neon-blue/20">
                {minWeight.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Blendet schwache Knotenpunkte aus</span>
            <input 
              type="range" 
              min="1" max="10" step="0.5" 
              value={minWeight} 
              onChange={(e) => setMinWeight(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
